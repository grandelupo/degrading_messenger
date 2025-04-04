import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { EmojiType, getEmoji } from '../utils/emojiConfig';

interface EmojiButtonProps {
  type: EmojiType;
  messageCount: number;
  onPress: () => void;
  size?: number;
}

export function EmojiButton({ type, messageCount, onPress, size = 24 }: EmojiButtonProps) {
  const theme = useTheme();
  const emoji = getEmoji(type, messageCount);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        { 
          borderColor: theme.colors.primary,
          borderWidth: 1,
          borderRadius: size,
          width: size * 1.5,
          height: size * 1.5,
        }
      ]}
    >
      <Text style={[styles.emoji, { fontSize: size }]}>
        {emoji}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
}); 