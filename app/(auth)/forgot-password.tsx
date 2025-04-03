import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { Link } from 'expo-router';
import { supabase } from '../../utils/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'agatka-turbo://reset-password',
      });

      if (error) throw error;
      setSuccess(true);
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'An error occurred while sending reset instructions');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Check Your Email
        </Text>
        <Text style={styles.message}>
          We've sent password reset instructions to your email address.
        </Text>
        <Link href="/login" asChild>
          <Button mode="contained" style={styles.button}>
            Return to Login
          </Button>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Reset Password
      </Text>
      
      <Text style={styles.description}>
        Enter your email address and we'll send you instructions to reset your password.
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={text => {
          setEmail(text);
          setError('');
        }}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
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
        Send Reset Instructions
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
  description: {
    textAlign: 'center',
    marginBottom: 30,
  },
  message: {
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
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