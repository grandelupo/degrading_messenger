import React, { forwardRef } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface FriendItemProps {
  username: string;
  lastSeen?: string | null;
  onPress?: () => void;
}

export const FriendItem = forwardRef<View, FriendItemProps>(
  ({ username, lastSeen, onPress }, ref) => {
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
        ref={ref}
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          { backgroundColor: theme.colors.surfaceVariant },
          pressed && { opacity: 0.7 }
        ]}
      >
        <View style={styles.userInfo}>
          <MaterialCommunityIcons name="account-circle" size={40} color={theme.colors.primary} />
          <View style={styles.textContainer}>
            <Text variant="titleMedium">{username}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceDisabled }}>
              {getLastSeenText()}
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.colors.onSurfaceDisabled}
        />
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
}); 