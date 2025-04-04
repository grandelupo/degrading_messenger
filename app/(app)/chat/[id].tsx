import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TextInput, useTheme, ActivityIndicator } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Message } from '../../../components/Message';

type ChatMessage = {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_deleted: boolean;
  last_updated: string;
};

export default function ChatScreen() {
  const { id: receiverId } = useLocalSearchParams();
  const theme = useTheme();
  const { session } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWord, setCurrentWord] = useState('');
  const [accumulatedWords, setAccumulatedWords] = useState('');
  const inputRef = useRef<any>(null);

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
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${session.user.id})`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
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
    if (payload.eventType === 'INSERT') {
      const newMessage: ChatMessage = {
        id: payload.new.id,
        content: payload.new.content,
        sender_id: payload.new.sender_id,
        receiver_id: payload.new.receiver_id,
        created_at: payload.new.created_at,
        is_deleted: payload.new.is_deleted || false,
        last_updated: payload.new.last_updated || payload.new.created_at,
      };

      setMessages((current) => {
        // Check if message already exists
        if (current.some((msg) => msg.id === newMessage.id)) {
          return current;
        }
        // Add new message at the beginning (since list is inverted)
        return [newMessage, ...current];
      });
    } else if (payload.eventType === 'UPDATE') {
      setMessages((current) =>
        current.map((msg) =>
          msg.id === payload.new.id
            ? {
                id: payload.new.id,
                content: payload.new.content,
                sender_id: payload.new.sender_id,
                receiver_id: payload.new.receiver_id,
                created_at: payload.new.created_at,
                is_deleted: payload.new.is_deleted || false,
                last_updated: payload.new.last_updated || payload.new.created_at,
              }
            : msg
        )
      );
    }
  };

  const handleInputChange = async (text: string) => {
    if (!session?.user?.id) return;

    if (text.endsWith(' ')) {
      // Space was added, prepare to send accumulated words
      const wordsToSend = (accumulatedWords + ' ' + currentWord).trim();
      if (wordsToSend) {
        const latestMessage = messages[0];
        const isLatestFromSelf = latestMessage?.sender_id === session.user.id;
        const isRecentMessage = latestMessage && 
          (new Date().getTime() - new Date(latestMessage.last_updated).getTime()) < 15000; // 15 seconds

        try {
          if (isLatestFromSelf && !latestMessage.is_deleted && isRecentMessage) {
            // Update existing message
            const updatedContent = `${latestMessage.content} ${wordsToSend}`;
            const { data, error } = await supabase
              .from('messages')
              .update({ 
                content: updatedContent,
                last_updated: new Date().toISOString()
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
            }
          } else {
            // Create new message
            const { data, error } = await supabase
              .from('messages')
              .insert([
                {
                  sender_id: session.user.id,
                  receiver_id: receiverId,
                  content: wordsToSend,
                  last_updated: new Date().toISOString()
                },
              ])
              .select()
              .single();

            if (error) throw error;

            // Update local state immediately
            if (data) {
              setMessages(current => [data, ...current]);
            }
          }
        } catch (error) {
          console.error('Error handling message:', error);
        }
        // Reset both current word and accumulated words
        setCurrentWord('');
        setAccumulatedWords('');
      }
    } else {
      // No space, update current word and accumulated words
      if (text.length < currentWord.length) {
        // Backspace was pressed
        setCurrentWord(text);
      } else {
        // New character was added
        if (currentWord.includes(' ')) {
          // Previous word is complete, add it to accumulated words
          setAccumulatedWords((prev) => (prev ? prev + ' ' + currentWord.trim() : currentWord.trim()));
          setCurrentWord(text.slice(text.lastIndexOf(' ') + 1));
        } else {
          setCurrentWord(text);
        }
      }
    }
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlashList
        data={messages}
        estimatedItemSize={70}
        renderItem={({ item }) => (
          <Message
            message={item}
            isOwnMessage={item.sender_id === session?.user?.id}
          />
        )}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          mode="outlined"
          placeholder="Type a message..."
          value={currentWord}
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
}); 