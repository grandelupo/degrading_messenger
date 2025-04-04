import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function DeleteAccountScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session, signOut } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    setError('');

    try {
      // Delete user's messages
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`);

      if (messagesError) throw messagesError;

      // Delete user's friendships
      const { error: friendshipsError } = await supabase
        .from('friendships')
        .delete()
        .or(`user_id.eq.${session.user.id},friend_id.eq.${session.user.id}`);

      if (friendshipsError) throw friendshipsError;

      // Delete user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Delete the user's auth account
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        session.user.id
      );

      if (deleteError) throw deleteError;

      // Sign out and redirect to login
      await signOut();
      router.replace('/login');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setError(error.message || 'An error occurred while deleting your account');
    } finally {
      setLoading(false);
      hideDialog();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={styles.warningText}>
        Warning: This action cannot be undone. All your data will be permanently deleted.
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={showDialog}
        style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
        loading={loading}
        disabled={loading}
      >
        Delete My Account
      </Button>

      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Delete Account</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button
              onPress={handleDeleteAccount}
              textColor={theme.colors.error}
              loading={loading}
              disabled={loading}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  warningText: {
    color: 'red',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  deleteButton: {
    marginTop: 16,
  },
}); 