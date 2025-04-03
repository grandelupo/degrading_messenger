import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
};

export default function ChatScreen() {
  const { id: receiverId } = useLocalSearchParams();
  const theme = useTheme();
  const { session } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [receiverProfile, setReceiverProfile] = useState<{ username: string; last_seen: string } | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchMessages();
    fetchReceiverProfile();
    const subscription = subscribeToMessages();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchReceiverProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, last_seen')
        .eq('id', receiverId)
        .single();

      if (error) throw error;
      setReceiverProfile(data);
    } catch (error) {
      console.error('Error fetching receiver profile:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${session?.user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${session?.user.id})`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    return supabase
      .channel('messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${receiverId},receiver_id=eq.${session?.user.id}`,
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setMessages(current => [payload.new as ChatMessage, ...current]);
        } else if (payload.eventType === 'UPDATE') {
          setMessages(current =>
            current.map(msg =>
              msg.id === payload.new.id ? payload.new as ChatMessage : msg
            )
          );
        }
      })
      .subscribe();
  };

  const handleKeyPress = async (key: string) => {
    if (key === 'Backspace') {
      if (currentMessage.length > 0) {
        const newMessage = currentMessage.slice(0, -1);
        setCurrentMessage(newMessage);
        await updateLastMessage(newMessage);
      }
      return;
    }

    if (key.length === 1) { // Only single characters
      const newMessage = currentMessage + key;
      setCurrentMessage(newMessage);
      await sendMessage(newMessage);
    }
  };

  const sendMessage = async (content: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: session?.user.id,
            receiver_id: receiverId,
            content,
          },
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const updateLastMessage = async (content: string) => {
    const lastMessage = messages[0];
    if (!lastMessage || lastMessage.sender_id !== session?.user.id) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ content })
        .eq('id', lastMessage.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating message:', error);
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
            isOwnMessage={item.sender_id === session?.user.id}
          />
        )}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          placeholder="Type a message..."
          value={currentMessage}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key)}
          style={styles.input}
          multiline
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