import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const validateForm = () => {
    if (!email || !username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const { requiresEmailConfirmation } = await signUp(email, password, username);
      
      if (requiresEmailConfirmation) {
        setShowConfirmation(true);
      } else {
        router.replace('/');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.message.includes('Username')) {
        setError('Username is already taken');
      } else if (error.message.includes('Email')) {
        setError('Email is already registered');
      } else {
        setError(error.message || 'An error occurred during registration');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Check Your Email
        </Text>
        <Text style={styles.description}>
          We've sent you an email with a confirmation link. Please check your email and click the link to complete your registration.
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
        Create Account
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

      <TextInput
        label="Username"
        value={username}
        onChangeText={text => {
          setUsername(text);
          setError('');
        }}
        autoCapitalize="none"
        style={styles.input}
        error={!!error}
      />
      
      <TextInput
        label="Password"
        value={password}
        onChangeText={text => {
          setPassword(text);
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
        onPress={handleRegister}
        loading={loading}
        style={styles.button}
        disabled={loading}
      >
        Register
      </Button>

      <Link href="/login" asChild>
        <Button mode="text" style={styles.link}>
          Already have an account? Sign in
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
    marginBottom: 30,
  },
  description: {
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