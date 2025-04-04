export type EmojiType = 'heart' | 'smile' | 'angry' | 'wink';

interface EmojiLevel {
  emoji: string;
  requiredMessages: number;
}

interface EmojiProgression {
  [key: string]: EmojiLevel[];
}

export const emojiProgressions: EmojiProgression = {
  heart: [
    { emoji: '❤️', requiredMessages: 0 },
    { emoji: '💖', requiredMessages: 50 },
    { emoji: '💝', requiredMessages: 100 },
    { emoji: '💗', requiredMessages: 200 },
  ],
  smile: [
    { emoji: '🙂', requiredMessages: 0 },
    { emoji: '😊', requiredMessages: 50 },
    { emoji: '😄', requiredMessages: 100 },
    { emoji: '🥰', requiredMessages: 200 },
  ],
  angry: [
    { emoji: '😠', requiredMessages: 0 },
    { emoji: '😤', requiredMessages: 50 },
    { emoji: '🙄', requiredMessages: 100 },
    { emoji: '😏', requiredMessages: 200 },
  ],
  wink: [
    { emoji: '😉', requiredMessages: 0 },
    { emoji: '😜', requiredMessages: 50 },
    { emoji: '😏', requiredMessages: 100 },
    { emoji: '😘', requiredMessages: 200 },
  ],
};

export function getEmoji(type: EmojiType, messageCount: number): string {
  const progression = emojiProgressions[type];
  // Find the highest level emoji that the user qualifies for
  const currentLevel = [...progression]
    .reverse()
    .find(level => messageCount >= level.requiredMessages);
  
  return currentLevel?.emoji || progression[0].emoji;
} 