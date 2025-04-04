import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type FriendItemProps = {
  username: string;
  lastSeen: string | null;
  onPress?: () => void;
};

export function FriendItem({ username, lastSeen, onPress }: FriendItemProps) {
  const theme = useTheme();

  const getLastSeenText = () => {
    if (!lastSeen) return 'Never seen';
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return lastSeenDate.toLocaleDateString();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: pressed ? theme.colors.surfaceVariant : 'transparent' }
      ]}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        <MaterialCommunityIcons name="account-circle" size={40} color={theme.colors.primary} />
      </View>
      <View style={styles.infoContainer}>
        <Text variant="titleMedium">{username}</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceDisabled }}>
          {getLastSeenText()}
        </Text>
      </View>
      <MaterialCommunityIcons 
        name="chevron-right" 
        size={24} 
        color={theme.colors.onSurfaceDisabled} 
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
}); 