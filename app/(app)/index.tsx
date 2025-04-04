import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, Text, Avatar, useTheme, ActivityIndicator, Button, Divider } from 'react-native-paper';
import { Link, useRouter, useRootNavigationState } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';

type Friend = {
  id: string;
  username: string;
  last_seen: string;
};

type FriendRequest = {
  id: string;
  username: string;
  friendship_id: string;
};

export default function FriendsScreen() {
  // All hooks must be called before any conditional returns
  const rootNavigationState = useRootNavigationState();
  const theme = useTheme();
  const { session } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect hook moved to top level with other hooks
  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
    const friendUpdatesCleanup = subscribeToFriendUpdates();
    const friendRequestsCleanup = subscribeToFriendRequests();

    return () => {
      friendUpdatesCleanup?.();
      friendRequestsCleanup?.();
    };
  }, [session]);

  // Early return for navigation state
  if (!rootNavigationState?.key) {
    return null;
  }

  // Functions
  const fetchFriendRequests = async () => {
    if (!session?.user?.id) return;

    try {
      type RequestResponse = {
        id: string;
        user_id: string;
        profiles: {
          id: string;
          username: string;
        };
      };

      const { data: requests, error } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          profiles:user_id (
            id,
            username
          )
        `)
        .eq('friend_id', session.user.id)
        .eq('status', 'pending')
        .returns<RequestResponse[]>();

      if (error) throw error;

      const formattedRequests = requests?.map(request => ({
        id: request.profiles.id,
        username: request.profiles.username,
        friendship_id: request.id,
      })) || [];

      setFriendRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleFriendRequest = async (friendshipId: string, accept: boolean) => {
    try {
      if (accept) {
        const { error } = await supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('id', friendshipId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('friendships')
          .delete()
          .eq('id', friendshipId);

        if (error) throw error;
      }

      // Remove the request from the local state
      setFriendRequests(current =>
        current.filter(request => request.friendship_id !== friendshipId)
      );

      // If accepted, refresh friends list
      if (accept) {
        fetchFriends();
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
    }
  };

  const subscribeToFriendRequests = () => {
    if (!session?.user?.id) return;

    const subscription = supabase
      .channel('friend_requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships',
        filter: `friend_id=eq.${session.user.id}`,
      }, () => {
        fetchFriendRequests();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const fetchFriends = async () => {
    if (!session?.user?.id) return;

    try {
      // Get friendships where user is either the sender or receiver
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${session.user.id},friend_id.eq.${session.user.id}`)
        .eq('status', 'accepted');

      if (friendshipsError) throw friendshipsError;

      if (friendships && friendships.length > 0) {
        // Extract friend IDs (if user is sender, take friend_id; if user is receiver, take user_id)
        const friendIds = friendships.map(f => 
          f.user_id === session.user.id ? f.friend_id : f.user_id
        );

        // Remove duplicates if any
        const uniqueFriendIds = [...new Set(friendIds)];

        const { data: friendProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, last_seen')
          .in('id', uniqueFriendIds);

        if (profilesError) throw profilesError;
        setFriends(friendProfiles || []);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToFriendUpdates = () => {
    if (!session?.user?.id) return;

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

  // Render functions
  const renderFriendRequest = ({ item }: { item: FriendRequest }) => (
    <List.Item
      title={item.username}
      description="Wants to be your friend"
      left={props => (
        <Avatar.Text {...props} size={40} label={item.username[0].toUpperCase()} />
      )}
      right={() => (
        <View style={styles.requestButtons}>
          <Button
            mode="contained"
            onPress={() => handleFriendRequest(item.friendship_id, true)}
            style={[styles.actionButton, { marginRight: 8 }]}
            compact
          >
            Accept
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleFriendRequest(item.friendship_id, false)}
            style={styles.actionButton}
            compact
          >
            Decline
          </Button>
        </View>
      )}
    />
  );

  const renderFriend = ({ item }: { item: Friend }) => (
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
  );

  // Early returns
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (friends.length === 0 && friendRequests.length === 0) {
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

  // Main render
  return (
    <View style={styles.container}>
      {friendRequests.length > 0 && (
        <>
          <List.Subheader>Friend Requests</List.Subheader>
          <FlatList
            data={friendRequests}
            renderItem={renderFriendRequest}
            keyExtractor={item => item.friendship_id}
          />
          <Divider style={styles.divider} />
        </>
      )}
      
      <List.Subheader>Friends</List.Subheader>
      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={item => item.id}
        style={{ backgroundColor: theme.colors.background }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  requestButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  actionButton: {
    minWidth: 80,
  },
  divider: {
    marginVertical: 8,
  },
}); 