import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { Text, useTheme, ActivityIndicator, Button } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { Link } from 'expo-router';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { FriendItem } from '@/components/FriendItem';
import { FriendRequest } from '@/components/FriendRequest';

type Friend = {
  id: string;
  username: string;
  last_seen: string | null;
};

type FriendRequest = {
  id: string;
  username: string;
  friendship_id: string;
};

interface FriendshipWithUser {
  id: string;
  user: {
    id: string;
    username: string;
  };
}

export default function FriendsScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFriendRequests = async () => {
    if (!session?.user?.id) return;

    try {
      const { data: requests, error } = await supabase
        .from('friendships')
        .select(`
          id,
          user:user_id (
            id,
            username
          )
        `)
        .eq('friend_id', session.user.id)
        .eq('status', 'pending')
        .returns<FriendshipWithUser[]>();

      if (error) throw error;

      if (requests) {
        const formattedRequests = requests.map(request => ({
          id: request.user.id,
          username: request.user.username,
          friendship_id: request.id,
        }));
        setFriendRequests(formattedRequests);
      }
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
      setRefreshing(false);
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

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
    const unsubscribeRequests = subscribeToFriendRequests();
    const unsubscribeUpdates = subscribeToFriendUpdates();

    return () => {
      if (unsubscribeRequests) unsubscribeRequests();
      if (unsubscribeUpdates) unsubscribeUpdates();
    };
  }, [session?.user?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFriends();
    fetchFriendRequests();
  }, []);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlashList
        data={friends}
        estimatedItemSize={70}
        ListHeaderComponent={() => (
          <>
            {friendRequests.length > 0 && (
              <View style={styles.requestsSection}>
                <Text variant="titleMedium" style={styles.requestsTitle}>
                  Friend Requests
                </Text>
                {friendRequests.map(request => (
                  <FriendRequest
                    key={request.id}
                    username={request.username}
                    onAccept={() => handleFriendRequest(request.friendship_id, true)}
                    onReject={() => handleFriendRequest(request.friendship_id, false)}
                  />
                ))}
              </View>
            )}
            {friends.length === 0 && (
              <View style={styles.emptyState}>
                <Text variant="bodyLarge" style={styles.emptyStateText}>
                  You haven't added any friends yet
                </Text>
                <Link href="/search" asChild>
                  <Button mode="contained" style={styles.findFriendsButton}>
                    Find Friends
                  </Button>
                </Link>
              </View>
            )}
          </>
        )}
        renderItem={({ item }) => (
          <Link href={`/chat/${item.id}`} asChild>
            <FriendItem
              username={item.username}
              lastSeen={item.last_seen}
            />
          </Link>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
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
  requestsSection: {
    padding: 16,
  },
  requestsTitle: {
    marginBottom: 8,
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  findFriendsButton: {
    marginTop: 8,
  },
}); 