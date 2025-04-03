import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Searchbar, List, Avatar, Button, useTheme, Text } from 'react-native-paper';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';

type UserProfile = {
  id: string;
  username: string;
  friendshipStatus?: 'none' | 'pending' | 'accepted' | 'blocked';
};

export default function SearchScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Search for users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', `%${query}%`)
        .neq('id', session?.user.id)
        .limit(10);

      if (usersError) throw usersError;

      // Get friendship statuses
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('friend_id, status')
        .eq('user_id', session?.user.id)
        .in('friend_id', users?.map(u => u.id) || []);

      if (friendshipsError) throw friendshipsError;

      // Combine user data with friendship status
      const usersWithStatus = users?.map(user => ({
        ...user,
        friendshipStatus: friendships?.find(f => f.friend_id === user.id)?.status || 'none',
      })) || [];

      setSearchResults(usersWithStatus);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
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

  const getFriendshipButton = (status: string, userId: string) => {
    switch (status) {
      case 'none':
        return (
          <Button
            mode="contained"
            onPress={() => handleFriendRequest(userId)}
            compact
          >
            Add Friend
          </Button>
        );
      case 'pending':
        return (
          <Button
            mode="outlined"
            disabled
            compact
          >
            Pending
          </Button>
        );
      case 'accepted':
        return (
          <Button
            mode="text"
            disabled
            compact
          >
            Friends
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search users..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        loading={loading}
      />

      {searchQuery.length > 0 && searchResults.length === 0 && !loading && (
        <View style={styles.centered}>
          <Text>No users found</Text>
        </View>
      )}

      <FlatList
        data={searchResults}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.username}
            left={props => (
              <Avatar.Text
                {...props}
                size={40}
                label={item.username[0].toUpperCase()}
              />
            )}
            right={() => getFriendshipButton(item.friendshipStatus || 'none', item.id)}
          />
        )}
        style={{ backgroundColor: theme.colors.background }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 