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
    { emoji: '💕', requiredMessages: 200 },
    { emoji: '💞', requiredMessages: 300 },
    { emoji: '💝', requiredMessages: 500 },
    { emoji: '💝', requiredMessages: 1000 },
    { emoji: '💝', requiredMessages: 2000 },
    { emoji: '💗', requiredMessages: 2500 },
    { emoji: '💗', requiredMessages: 3000 },
    { emoji: '💘', requiredMessages: 10000 },
    { emoji: '❤️‍🔥', requiredMessages: 20000 },
  ],
  smile: [
    { emoji: '🙂', requiredMessages: 0 },
    { emoji: '😄', requiredMessages: 50 },
    { emoji: '😊', requiredMessages: 500 },
    { emoji: '🥰', requiredMessages: 2500 },
  ],
  angry: [
    { emoji: '😠', requiredMessages: 0 },
    { emoji: '😤', requiredMessages: 200 },
    { emoji: '😠', requiredMessages: 1000 },
    { emoji: '😡', requiredMessages: 10000 },
    { emoji: '🤯', requiredMessages: 20000 },
  ],
  wink: [
    { emoji: '😉', requiredMessages: 0 },
    { emoji: '😜', requiredMessages: 500 },
    { emoji: '😏', requiredMessages: 1000 },
    { emoji: '😘', requiredMessages: 3000 },
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