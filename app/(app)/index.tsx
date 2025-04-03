import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, Text, Avatar, useTheme, ActivityIndicator } from 'react-native-paper';
import { Link } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';

type Friend = {
  id: string;
  username: string;
  last_seen: string;
};

export default function FriendsScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
    subscribeToFriendUpdates();
  }, []);

  const fetchFriends = async () => {
    try {
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', session?.user.id)
        .eq('status', 'accepted');

      if (friendshipsError) throw friendshipsError;

      if (friendships) {
        const friendIds = friendships.map(f => f.friend_id);
        const { data: friendProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, last_seen')
          .in('id', friendIds);

        if (profilesError) throw profilesError;
        setFriends(friendProfiles || []);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToFriendUpdates = () => {
    const subscription = supabase
      .channel('friends_presence')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
      }, payload => {
        setFriends(currentFriends => 
          currentFriends.map(friend => 
            friend.id === payload.new.id 
              ? { ...friend, ...payload.new }
              : friend
          )
        );
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const getLastSeenText = (lastSeen: string) => {
    if (!lastSeen) return 'Never seen';
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / 1000 / 60);

    if (diffMinutes < 1) return 'Online';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return lastSeenDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (friends.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge">No friends yet</Text>
        <Link href="/search" asChild>
          <List.Item
            title="Find Friends"
            left={props => <List.Icon {...props} icon="account-search" />}
          />
        </Link>
      </View>
    );
  }

  return (
    <FlatList
      data={friends}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <Link href={`/chat/${item.id}`} asChild>
          <List.Item
            title={item.username}
            description={getLastSeenText(item.last_seen)}
            left={props => (
              <View style={styles.avatarContainer}>
                <Avatar.Text {...props} size={40} label={item.username[0].toUpperCase()} />
                {getLastSeenText(item.last_seen) === 'Online' && (
                  <View style={[styles.onlineIndicator, { backgroundColor: theme.colors.primary }]} />
                )}
              </View>
            )}
          />
        </Link>
      )}
      style={{ backgroundColor: theme.colors.background }}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    marginLeft: 8,
    marginRight: 8,
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
}); 