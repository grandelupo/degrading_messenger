import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type MessageProps = {
  message: {
    content: string;
    sender_id: string;
    last_updated: string;
  };
  isOwnMessage: boolean;
};

export function Message({ message, isOwnMessage }: MessageProps) {
  const theme = useTheme();

  // Check if message has degraded before rendering anything
  const isMessageValid = useMemo(() => {
    const now = new Date();
    const timeSinceLastUpdate = now.getTime() - new Date(message.last_updated).getTime();
    const hoursElapsed = timeSinceLastUpdate / (1000 * 60 * 60);
    return hoursElapsed < 24;
  }, [message.last_updated]);

  // Don't render anything if the message has degraded
  if (!isMessageValid) {
    return null;
  }

  return (
    <View
      style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isOwnMessage
              ? theme.colors.primary
              : theme.colors.surfaceVariant,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isOwnMessage ? 'white' : theme.colors.onSurface },
          ]}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    padding: 8,
    flexDirection: 'row',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 16,
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
}); 