import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, useTheme, Text } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { SearchResult } from '@/components/SearchResult';

type UserResult = {
  id: string;
  username: string;
  friendshipStatus: 'none' | 'pending' | 'accepted';
};

export default function SearchScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!session?.user?.id || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      // First, get all users matching the search query
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, username')
        .neq('id', session.user.id)
        .ilike('username', `%${query}%`)
        .limit(20);

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        setSearchResults([]);
        return;
      }

      // Then, get all friendships involving these users
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('user_id, friend_id, status')
        .or(`user_id.eq.${session.user.id},friend_id.eq.${session.user.id}`);

      if (friendshipsError) throw friendshipsError;

      // Map users to include their friendship status
      const resultsWithStatus = users.map(user => {
        const friendship = friendships?.find(f =>
          (f.user_id === session.user.id && f.friend_id === user.id) ||
          (f.friend_id === session.user.id && f.user_id === user.id)
        );

        return {
          id: user.id,
          username: user.username,
          friendshipStatus: friendship ? friendship.status : 'none',
        };
      });

      setSearchResults(resultsWithStatus);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleFriendRequest = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .insert([
          {
            user_id: session?.user.id,
            friend_id: userId,
            status: 'pending',
          },
        ]);

      if (error) throw error;

      // Update local state
      setSearchResults(current =>
        current.map(user =>
          user.id === userId
            ? { ...user, friendshipStatus: 'pending' }
            : user
        )
      );
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TextInput
        placeholder="Search users..."
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.searchInput}
        mode="outlined"
      />

      {searchResults.length === 0 && searchQuery.length >= 2 && (
        <Text style={styles.noResults}>No users found</Text>
      )}

      <FlashList
        data={searchResults}
        renderItem={({ item }) => (
          <SearchResult
            username={item.username}
            status={item.friendshipStatus}
            onAddFriend={() => handleFriendRequest(item.id)}
          />
        )}
        estimatedItemSize={70}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    marginBottom: 16,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 16,
  },
}); 