import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type FriendRequestProps = {
  username: string;
  onAccept: () => void;
  onReject: () => void;
};

export function FriendRequest({ username, onAccept, onReject }: FriendRequestProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.userInfo}>
        <MaterialCommunityIcons name="account-circle" size={40} color={theme.colors.primary} />
        <Text variant="titleMedium" style={styles.username}>
          {username}
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={onAccept}
          style={[styles.button, styles.acceptButton]}
          contentStyle={styles.buttonContent}
          compact
        >
          Accept
        </Button>
        <Button
          mode="outlined"
          onPress={onReject}
          style={styles.button}
          contentStyle={styles.buttonContent}
          compact
        >
          Reject
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: 8,
  },
  acceptButton: {
    minWidth: 80,
  },
  buttonContent: {
    height: 32,
  },
}); 