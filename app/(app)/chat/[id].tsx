import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TextInput, useTheme, ActivityIndicator, Text } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Message } from '../../../components/Message';
import { EmojiButton } from '@/components/EmojiButton';
import { EmojiType, getEmoji } from '@/utils/emojiConfig';

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
      backgroundColor: isOwnMessage 
        ? theme.colors.primary 
        : theme.colors.surfaceVariant,
      padding: isEmoji ? 8 : 12,
      minHeight: isEmoji ? 50 : undefined,
    }
  ];

  const textStyle = [
    styles.messageText,
    { 
      color: isOwnMessage 
        ? theme.colors.onPrimary 
        : theme.colors.onSurface,
      fontSize: isEmoji ? 32 : 16,
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

export default function ChatScreen() {
  const { id: receiverId } = useLocalSearchParams();
  const theme = useTheme();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [lastSentWords, setLastSentWords] = useState('');
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<Date | null>(null);
  const inputRef = useRef<any>(null);
  const [messageCount, setMessageCount] = useState(0);

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

  const fetchMessages = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      // Get current time
      const now = new Date();
      
      // Calculate cutoff time for degraded messages (24 hours ago)
      const cutoffTime = new Date(now);
      cutoffTime.setHours(cutoffTime.getHours() - 24);

      // First, get all messages from the last 24 hours
      const { data: rawMessages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${session.user.id})`)
        .gte('updated_at', cutoffTime.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate degradation for each message before setting state
      const processedMessages = (rawMessages || []).map(msg => {
        const timeSinceLastUpdate = now.getTime() - new Date(msg.updated_at).getTime();
        const hoursElapsed = timeSinceLastUpdate / (1000 * 60 * 60);
        
        // If message is older than 24 hours, don't include it
        if (hoursElapsed >= 24) {
          return null;
        }

        return msg;
      }).filter((msg): msg is Message => msg !== null);

      setMessages(processedMessages);
      setMessageCount(processedMessages.length);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, receiverId]);

  useEffect(() => {
    fetchMessages();

    console.log('Setting up real-time subscription...');

    // Set up real-time subscription for all messages in this conversation
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
          console.log('Received outgoing message update:', payload);
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
          console.log('Received incoming message update:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from chat messages');
      channel.unsubscribe();
    };
  }, [session?.user?.id, receiverId]);

  const handleRealtimeUpdate = (payload: any) => {
    const now = new Date();
    const timeSinceLastUpdate = now.getTime() - new Date(payload.new.updated_at).getTime();
    const hoursElapsed = timeSinceLastUpdate / (1000 * 60 * 60);

    // Don't process messages that have already degraded
    if (hoursElapsed >= 24) {
      return;
    }

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

      setMessages((current) => {
        // Check if message already exists
        if (current.some((msg) => msg.id === newMessage.id)) {
          return current;
        }
        // Add new message at the beginning (since list is inverted)
        return [newMessage, ...current];
      });
      setMessageCount(count => count + 1);
    } else if (payload.eventType === 'UPDATE') {
      setMessages((current) =>
        current.map((msg) =>
          msg.id === payload.new.id
            ? {
                id: payload.new.id,
                content: payload.new.content,
                type: payload.new.type,
                sender_id: payload.new.sender_id,
                receiver_id: payload.new.receiver_id,
                created_at: payload.new.created_at,
                updated_at: payload.new.updated_at,
                is_deleted: payload.new.is_deleted,
              }
            : msg
        )
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
        setMessageCount(count => count + 1);
      }
    } catch (error) {
      console.error('Error sending emoji:', error);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.sender_id === session?.user?.id;
    const isLatestMessage = index === 0;
    const showPreview = isLatestMessage && 
                       isOwnMessage && 
                       item.type === 'text' && 
                       inputText.length > lastSentWords.length;



    // Get the preview text (only the new input after the last sent words)
    const previewText = showPreview 
      ? inputText.slice(lastSentWords.length).trim()
      : undefined;

    return (
      <MessageBubble 
        message={item} 
        isOwnMessage={isOwnMessage} 
        messageCount={messageCount}
        previewText={previewText}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
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
      <View style={styles.emojiContainer}>
        {(['heart', 'smile', 'angry', 'wink'] as EmojiType[]).map((type) => (
          <EmojiButton
            key={type}
            type={type}
            messageCount={messageCount}
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
    marginBottom: 8,
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
}); 