import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type SearchResultProps = {
  username: string;
  onAddFriend: () => void;
  status: 'none' | 'pending' | 'accepted';
};

export function SearchResult({ 
  username, 
  onAddFriend, 
  status
}: SearchResultProps) {
  const theme = useTheme();

  const getButtonProps = () => {
    switch (status) {
      case 'accepted':
        return {
          mode: 'text' as const,
          disabled: true,
          label: 'Friends',
          icon: 'account-check',
        };
      case 'pending':
        return {
          mode: 'outlined' as const,
          disabled: true,
          label: 'Request Sent',
          icon: 'clock-outline',
        };
      default:
        return {
          mode: 'contained' as const,
          disabled: false,
          label: 'Add Friend',
          icon: 'account-plus',
        };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.userInfo}>
        <MaterialCommunityIcons name="account-circle" size={40} color={theme.colors.primary} />
        <Text variant="titleMedium" style={styles.username}>
          {username}
        </Text>
      </View>
      <Button
        mode={buttonProps.mode}
        onPress={onAddFriend}
        disabled={buttonProps.disabled}
        style={styles.button}
        contentStyle={styles.buttonContent}
        icon={buttonProps.icon}
        compact
      >
        {buttonProps.label}
      </Button>
    </View>
  );
}

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
  username: {
    marginLeft: 12,
  },
  button: {
    minWidth: 120,
  },
  buttonContent: {
    height: 32,
  },
}); 