import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const validateForm = () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Password updated successfully
      router.replace('/login');
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'An error occurred while resetting your password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Set New Password
      </Text>

      <TextInput
        label="New Password"
        value={newPassword}
        onChangeText={text => {
          setNewPassword(text);
          setError('');
        }}
        secureTextEntry
        style={styles.input}
        error={!!error}
      />

      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={text => {
          setConfirmPassword(text);
          setError('');
        }}
        secureTextEntry
        style={styles.input}
        error={!!error}
      />

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>

      <Button
        mode="contained"
        onPress={handleResetPassword}
        loading={loading}
        style={styles.button}
        disabled={loading}
      >
        Reset Password
      </Button>

      <Link href="/login" asChild>
        <Button mode="text" style={styles.link}>
          Back to Login
        </Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  link: {
    marginVertical: 4,
  },
}); 