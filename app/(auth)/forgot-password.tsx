import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme } from 'react-native-paper';
import { Link } from 'expo-router';
import { supabase } from '../../utils/supabase';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/messenger-icon.png')}
            style={styles.logo}
          />
        </View>
        <Text variant="headlineMedium" style={styles.title}>
          Check Your Email
        </Text>
        <Text style={styles.message}>
          We've sent password reset instructions to your email address.
        </Text>
        <Link href="/login" asChild>
          <Button 
            mode="contained" 
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.buttonContent}
          >
            Return to Login
          </Button>
        </Link>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/messenger-icon.png')}
          style={styles.logo}
        />
      </View>
      
      <Text variant="headlineMedium" style={styles.title}>
        Reset Password
      </Text>
      
      <Text style={styles.description}>
        Enter your email address and we'll send you instructions to reset your password.
      </Text>

      <TextInput
        mode="outlined"
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
        outlineStyle={styles.inputOutline}
      />

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
      
      <Button
        mode="contained"
        onPress={handleResetPassword}
        loading={loading}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        contentStyle={styles.buttonContent}
        disabled={loading}
      >
        Send Reset Instructions
      </Button>

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
        <Text style={[styles.dividerText, { color: theme.colors.outline }]}>OR</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
      </View>

      <Link href="/login" asChild>
        <Button 
          mode="outlined" 
          style={styles.returnButton}
          labelStyle={{ color: theme.colors.primary }}
        >
          Return to Login
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
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
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 12,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 24,
    height: 48,
  },
  buttonContent: {
    height: 48,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
  },
  returnButton: {
    borderRadius: 24,
    height: 48,
  },
}); 