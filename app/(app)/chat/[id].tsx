import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, Animated, Image } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { TextInput, useTheme, ActivityIndicator, Text, Avatar } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import * as Notifications from 'expo-notifications';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Message } from '../../../components/Message';
import { EmojiButton } from '@/components/EmojiButton';
import { EmojiType, getEmoji, emojiProgressions } from '@/utils/emojiConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { registerForPushNotificationsAsync, savePushToken, sendPushNotification } from '@/utils/notifications';

type MessageType = 'text' | 'emoji';

interface Message {
  id: string;
  content: string;
  type: MessageType;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
}

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
}

const MessageBubble = ({ 
  message, 
  isOwnMessage, 
  messageCount,
  previewText
}: { 
  message: Message; 
  isOwnMessage: boolean;
  messageCount: number;
  previewText?: string;
}) => {
  const theme = useTheme();
  const isEmoji = message.type === 'emoji';
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blinkAnimation = Animated.sequence([
      Animated.timing(cursorOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(cursorOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    const animation = Animated.loop(blinkAnimation);
    animation.start();

    return () => animation.stop();
  }, []);

  const bubbleStyle = [
    styles.message,
    isOwnMessage ? styles.ownMessage : styles.otherMessage,
    { 
      backgroundColor: isEmoji ? 'transparent' : (isOwnMessage ? theme.colors.primary : theme.colors.surfaceVariant),
      padding: isEmoji ? 0 : 12,
      minHeight: isEmoji ? 50 : undefined,
    }
  ];

  const textStyle = [
    styles.messageText,
    { 
      color: isOwnMessage 
        ? theme.colors.onPrimary 
        : theme.colors.onSurface,
      fontSize: isEmoji ? 48 : 16,
    }
  ];

  return (
    <View style={bubbleStyle}>
      <Text style={textStyle}>
        {isEmoji ? getEmoji(message.content as EmojiType, messageCount) : message.content}
        {previewText && (
          <Text style={[textStyle, { color: 'rgba(256, 256, 256, 0.7)' }]}>
            {' '}{previewText}
          </Text>
        )}
        {previewText && !isEmoji && (
        <Animated.View 
          style={[
            styles.cursor,
            { 
              opacity: cursorOpacity,
              backgroundColor: isOwnMessage 
                ? 'rgba(255, 255, 255, 0.7)' 
                : 'rgba(0, 0, 0, 0.7)',
              marginLeft: 2,
            }
          ]} 
        />
      )}
      </Text>
    </View>
  );
};

const calculateDegradation = (message: Message) => {
  const now = new Date();
  const lastUpdate = new Date(message.updated_at);
  const secondsSinceUpdate = (now.getTime() - lastUpdate.getTime()) / 1000;

  // For emoji messages - disappear completely after 20 minutes
  if (message.type === 'emoji') {
    const emojiLifespan = 20 * 60; // 20 minutes in seconds
    if (secondsSinceUpdate >= emojiLifespan) {
      return null;
    }
    return message;
  }

  // For text messages - start degrading after 10 minutes
  const degradationStart = 10 * 60; // 10 minutes in seconds
  if (secondsSinceUpdate < degradationStart) {
    return message;
  }

  const degradationPeriod = 10 * 60; // 10 minutes degradation period in seconds
  const timeIntoDegradation = secondsSinceUpdate - degradationStart;
  
  // Calculate characters per second to remove for consistent speed
  const originalLength = message.content.length;
  const charsPerSecond = originalLength / degradationPeriod;
  const charsToRemove = Math.floor(timeIntoDegradation * charsPerSecond);

  // If all characters should be removed, return null
  if (charsToRemove >= originalLength) {
    return null;
  }

  // Return message with degraded content, removing characters from the beginning
  return {
    ...message,
    content: message.content.substring(charsToRemove),
  };
};

const EmojiProgressBar = ({ totalMessageCount }: { totalMessageCount: number }) => {
  const theme = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Get the thresholds from emojiProgressions
  const thresholds = emojiProgressions.heart.map(level => level.requiredMessages);
  const currentThreshold = thresholds.find(t => totalMessageCount < t) || thresholds[thresholds.length - 1];
  const previousThreshold = thresholds[thresholds.indexOf(currentThreshold) - 1] || 0;
  
  // Calculate progress percentage
  const progress = ((totalMessageCount - previousThreshold) / (currentThreshold - previousThreshold)) * 100;
  
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progress,
      useNativeDriver: false,
      tension: 20,
      friction: 7
    }).start();
  }, [progress]);

  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBackground, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Animated.View 
          style={[
            styles.progressFill, 
            { 
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              }),
              backgroundColor: theme.colors.primary 
            }
          ]} 
        />
      </View>
      {/* <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
        {totalMessageCount} / {currentThreshold} messages until next evolution
      </Text> */}
    </View>
  );
};

export default function ChatScreen() {
  const { id: receiverId } = useLocalSearchParams();
  const theme = useTheme();
  const navigation = useNavigation();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [lastSentWords, setLastSentWords] = useState('');
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<Date | null>(null);
  const [receiverProfile, setReceiverProfile] = useState<UserProfile | null>(null);
  const inputRef = useRef<any>(null);
  const [totalMessageCount, setTotalMessageCount] = useState(0);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [receiverPushToken, setReceiverPushToken] = useState<string | null>(null);

  // Fetch receiver's profile
  useEffect(() => {
    const fetchReceiverProfile = async () => {
      if (!receiverId) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', receiverId)
          .single();

        if (error) throw error;
        if (data) {
          setReceiverProfile(data);
          // Set the navigation header
          navigation.setOptions({
            title: data.username,
            headerTitle: () => (
              <View style={styles.headerContainer}>
                <Avatar.Image 
                  size={36} 
                  source={{ uri: data.avatar_url || 'default-avatar-url.png' }}
                  style={styles.headerAvatar}
                />
                <Text 
                  variant="titleMedium" 
                  style={[
                    styles.headerUsername,
                    { color: theme.colors.onBackground }
                  ]}
                >
                  {data.username}
                </Text>
              </View>
            ),
          });
        }
      } catch (error) {
        console.error('Error fetching receiver profile:', error);
      }
    };

    fetchReceiverProfile();
  }, [receiverId, navigation, theme.colors]);

  // Keep keyboard always open
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      inputRef.current?.focus();
    });

    inputRef.current?.focus();

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  // Fetch total message count
  const fetchTotalMessageCount = useCallback(async () => {
    if (!session?.user?.id || !receiverId) return;

    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${session.user.id})`);

      if (error) throw error;
      if (count !== null) {
        setTotalMessageCount(count);
        return true;
      }
    } catch (error) {
      console.error('Error fetching message count:', error);
    }
    return false;
  }, [session?.user?.id, receiverId]);

  // Update fetchMessages to return success status
  const fetchMessages = useCallback(async () => {
    if (!session?.user?.id) return false;

    try {
      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - 20);

      const { data: rawMessages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${session.user.id})`)
        .gte('updated_at', cutoffTime.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process messages and apply initial degradation
      const processedMessages = (rawMessages || [])
        .map(msg => {
          const degraded = calculateDegradation(msg);
          if (!degraded) return null;
          return degraded;
        })
        .filter((msg): msg is Message => msg !== null);

      setMessages(processedMessages);
      return true;
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    return false;
  }, [session?.user?.id, receiverId]);

  // Initial fetch of messages and count
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [messagesSuccess, countSuccess] = await Promise.all([
          fetchMessages(),
          fetchTotalMessageCount()
        ]);
        
        if (messagesSuccess && countSuccess) {
          setInitialDataLoaded(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${session?.user?.id},receiver_id=eq.${receiverId}`
        },
        (payload) => {
          handleRealtimeUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${receiverId},receiver_id=eq.${session?.user?.id}`
        },
        (payload) => {
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [session?.user?.id, receiverId]);

  // Register for push notifications and save token
  useEffect(() => {
    const setupPushNotifications = async () => {
      if (!session?.user?.id) return;

      const token = await registerForPushNotificationsAsync();
      if (token) {
        await savePushToken(session.user.id, token);
      }
    };

    setupPushNotifications();
  }, [session?.user?.id]);

  // Fetch receiver's push token
  useEffect(() => {
    const fetchReceiverPushToken = async () => {
      if (!receiverId) return;

      try {
        const { data, error } = await supabase
          .from('push_tokens')
          .select('token')
          .eq('user_id', receiverId)
          .single();

        if (error) throw error;
        if (data) {
          setReceiverPushToken(data.token);
        }
      } catch (error) {
        console.error('Error fetching receiver push token:', error);
      }
    };

    fetchReceiverPushToken();
  }, [receiverId]);

  const handleRealtimeUpdate = async (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newMessage: Message = {
        id: payload.new.id,
        content: payload.new.content,
        type: payload.new.type,
        sender_id: payload.new.sender_id,
        receiver_id: payload.new.receiver_id,
        created_at: payload.new.created_at,
        updated_at: payload.new.updated_at,
        is_deleted: payload.new.is_deleted,
      };

      // Apply degradation to new message
      const degradedMessage = calculateDegradation(newMessage);
      if (degradedMessage) {
        // Update total message count first to ensure emoji evolution happens before showing the message
        setTotalMessageCount(count => {
          const newCount = count + 1;
          // Force re-render of messages to update emoji display
          setMessages((current) => {
            if (current.some((msg) => msg.id === newMessage.id)) {
              return current;
            }
            return [degradedMessage, ...current];
          });
          return newCount;
        });

        // Send push notification for new message if it's from the other user
        if (newMessage.sender_id === receiverId && receiverProfile && receiverPushToken) {
          try {
            await sendPushNotification(
              receiverPushToken,
              `New message from ${receiverProfile.username}`,
              newMessage.type === 'emoji' 
                ? '📱 Sent an emoji'
                : newMessage.content.slice(0, 50) + (newMessage.content.length > 50 ? '...' : '')
            );
          } catch (error) {
            console.error('Error sending push notification:', error);
          }
        }
      }
    } else if (payload.eventType === 'UPDATE') {
      setMessages((current) =>
        current.map((msg) => {
          if (msg.id !== payload.new.id) return msg;
          const updatedMessage = {
            id: payload.new.id,
            content: payload.new.content,
            type: payload.new.type,
            sender_id: payload.new.sender_id,
            receiver_id: payload.new.receiver_id,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at,
            is_deleted: payload.new.is_deleted,
          };
          return calculateDegradation(updatedMessage) || msg;
        }).filter((msg): msg is Message => msg !== null)
      );
    }
  };

  const isWithinEditPeriod = useCallback(() => {
    if (!lastMessageTimestamp) return false;
    return (new Date().getTime() - lastMessageTimestamp.getTime()) < 15000;
  }, [lastMessageTimestamp]);

  const handleInputChange = async (text: string) => {
    if (!session?.user?.id || !receiverId) return;

    const latestMessage = messages[0];
    const isLatestFromSelf = latestMessage?.sender_id === session.user.id;
    const isRecentMessage = latestMessage && 
      (new Date().getTime() - new Date(latestMessage.updated_at).getTime()) < 15000;

    // Don't allow deletion of characters if we're within edit period
    if (text.length < inputText.length && isWithinEditPeriod()) {
      return;
    }

    // Always update input text immediately for preview
    setInputText(text);

    // Check if the last character is a punctuation mark
    const lastChar = text[text.length - 1];
    const isPunctuation = [',', '.', '?'].includes(lastChar);
    
    // If it's punctuation or space, send/update the message
    if (text.endsWith(' ') || isPunctuation) {
      // If it's punctuation, automatically add a space
      if (isPunctuation) {
        text = text + ' ';
        setInputText(text);
      }

      // Get only the new words by removing the previously sent words
      const allWords = text.trim();
      const newWords = allWords.slice(lastSentWords.length).trim();

      if (!newWords) return;

      try {
        if (isLatestFromSelf && latestMessage.type === 'text' && !latestMessage.is_deleted && isRecentMessage) {
          // Update existing message by appending only the new words
          const updatedContent = `${latestMessage.content} ${newWords}`;
          const { data, error } = await supabase
            .from('messages')
            .update({ 
              content: updatedContent,
              updated_at: new Date().toISOString()
            })
            .eq('id', latestMessage.id)
            .select()
            .single();

          if (error) throw error;

          // Update local state immediately
          if (data) {
            setMessages(current =>
              current.map(msg =>
                msg.id === data.id ? data : msg
              )
            );
            setLastMessageTimestamp(new Date());
            setLastSentWords(allWords);
          }
        } else {
          // Create new message
          const { data, error } = await supabase
            .from('messages')
            .insert([
              {
                sender_id: session.user.id,
                receiver_id: receiverId,
                content: newWords,
                type: 'text',
                updated_at: new Date().toISOString()
              },
            ])
            .select()
            .single();

          if (error) throw error;

          // Update local state immediately
          if (data) {
            setMessages(current => [data, ...current]);
            setLastMessageTimestamp(new Date());
            setLastSentWords(newWords);
          }
        }

        // Only clear input and last sent words if we're not within the edit period
        if (!isWithinEditPeriod()) {
          setInputText('');
          setLastSentWords('');
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    }
  };

  // Update the effect to also reset lastSentWords
  useEffect(() => {
    if (!lastMessageTimestamp) return;

    const timeoutId = setTimeout(() => {
      if (!isWithinEditPeriod()) {
        setInputText('');
        setLastSentWords('');
        setLastMessageTimestamp(null);
      }
    }, 15000);

    return () => clearTimeout(timeoutId);
  }, [lastMessageTimestamp, isWithinEditPeriod]);

  // Update renderMessage to use totalMessageCount instead of messages.length
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.sender_id === session?.user?.id;
    const isLatestMessage = index === 0;
    const showPreview = isLatestMessage && 
                       isOwnMessage && 
                       item.type === 'text' && 
                       inputText.length > lastSentWords.length;

    const previewText = showPreview 
      ? inputText.slice(lastSentWords.length).trim()
      : undefined;

    return (
      <MessageBubble 
        message={item} 
        isOwnMessage={isOwnMessage} 
        messageCount={totalMessageCount}
        previewText={previewText}
      />
    );
  };

  // Update handleEmojiPress to not manage message count (it's handled by handleRealtimeUpdate)
  const handleEmojiPress = async (type: EmojiType) => {
    if (!session?.user?.id || !receiverId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: session.user.id,
            receiver_id: receiverId,
            content: type,
            type: 'emoji' as MessageType,
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;
      if (data?.[0]) {
        setMessages(current => [data[0], ...current]);
      }
    } catch (error) {
      console.error('Error sending emoji:', error);
    }
  };

  if (loading || !initialDataLoaded) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <EmojiProgressBar totalMessageCount={totalMessageCount} />
      <View style={styles.emojiContainer}>
        {(['heart', 'smile', 'angry', 'wink'] as EmojiType[]).map((type) => (
          <EmojiButton
            key={type}
            type={type}
            messageCount={totalMessageCount}
            onPress={() => handleEmojiPress(type)}
            size={32}
          />
        ))}
      </View>
      
      <FlashList
        data={messages}
        extraData={inputText}
        renderItem={renderMessage}
        estimatedItemSize={50}
        contentContainerStyle={styles.messageList}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          mode="outlined"
          placeholder="Type a message..."
          value={inputText}
          onChangeText={handleInputChange}
          style={styles.input}
          autoFocus
          blurOnSubmit={false}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    maxHeight: 100,
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  messageList: {
    padding: 16,
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    marginRight: 10,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    textAlign: 'center',
  },
  cursor: {
    width: 2,
    height: 16,
    marginLeft: 4,
    marginTop: -16,
    alignSelf: 'flex-start',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerAvatar: {
    marginRight: 12,
  },
  headerUsername: {
    fontWeight: '600',
  },
  progressContainer: {
    padding: 8,
    paddingBottom: 0,
  },
  progressBackground: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
}); 