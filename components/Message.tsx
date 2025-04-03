import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type MessageProps = {
  message: {
    content: string;
    created_at: string;
    is_deleted: boolean;
  };
  isOwnMessage: boolean;
};

const DEGRADATION_START_MINUTES = 5;
const DEGRADATION_RATE = 0.1; // 10% per minute

export function Message({ message, isOwnMessage }: MessageProps) {
  const theme = useTheme();
  const [degradedContent, setDegradedContent] = useState(message.content);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const updateDegradation = () => {
      const createdAt = new Date(message.created_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;

      if (diffMinutes < DEGRADATION_START_MINUTES) {
        setDegradedContent(message.content);
        setOpacity(1);
        return;
      }

      const degradationMinutes = diffMinutes - DEGRADATION_START_MINUTES;
      const degradationPercentage = Math.min(degradationMinutes * DEGRADATION_RATE, 1);
      const remainingPercentage = 1 - degradationPercentage;

      if (remainingPercentage <= 0) {
        setDegradedContent('');
        setOpacity(0);
        return;
      }

      // Calculate how many characters to keep
      const charsToKeep = Math.ceil(message.content.length * remainingPercentage);
      const newContent = message.content.slice(0, charsToKeep);
      setDegradedContent(newContent);
      setOpacity(remainingPercentage);
    };

    updateDegradation();
    const interval = setInterval(updateDegradation, 1000);

    return () => clearInterval(interval);
  }, [message.content, message.created_at]);

  if (opacity === 0 || message.is_deleted) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
        { opacity },
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
          {degradedContent}
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