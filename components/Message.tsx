import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type MessageProps = {
  message: {
    content: string;
    created_at: string;
    last_updated: string;
    is_deleted: boolean;
  };
  isOwnMessage: boolean;
};

const DEGRADATION_START_MINUTES = 5;
const DEGRADATION_RATE = 0.1; // 10% per minute
const DEGRADATION_INTERVAL = 1000; // Update every second

export function Message({ message, isOwnMessage }: MessageProps) {
  const theme = useTheme();
  const [visibleContent, setVisibleContent] = useState('');

  useEffect(() => {
    const updateDegradation = () => {
      const lastUpdated = new Date(message.last_updated || message.created_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastUpdated.getTime()) / 1000 / 60;

      if (diffMinutes < DEGRADATION_START_MINUTES) {
        setVisibleContent(message.content);
        return;
      }

      const degradationMinutes = diffMinutes - DEGRADATION_START_MINUTES;
      const totalChars = message.content.length;
      const charsToRemove = Math.floor(degradationMinutes * DEGRADATION_RATE * totalChars);

      if (charsToRemove >= totalChars) {
        setVisibleContent('');
        return;
      }

      // Remove characters from the beginning (oldest first)
      const remainingContent = message.content.slice(charsToRemove);
      setVisibleContent(remainingContent);
    };

    updateDegradation();
    const interval = setInterval(updateDegradation, DEGRADATION_INTERVAL);

    return () => clearInterval(interval);
  }, [message.content, message.created_at, message.last_updated]);

  if (!visibleContent || message.is_deleted) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isOwnMessage
            ? { backgroundColor: theme.colors.primary }
            : { backgroundColor: theme.colors.secondaryContainer },
        ]}
      >
        <Text
          style={[
            styles.text,
            isOwnMessage
              ? { color: theme.colors.onPrimary }
              : { color: theme.colors.onSecondaryContainer },
          ]}
        >
          {visibleContent}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  text: {
    fontSize: 16,
  },
}); 