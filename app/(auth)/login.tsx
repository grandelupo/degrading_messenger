import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.replace('/');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = () => {
    return !!error;
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome Back
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
        error={hasErrors()}
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
        error={hasErrors()}
      />

      <HelperText type="error" visible={hasErrors()}>
        {error}
      </HelperText>
      
      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
        disabled={loading}
      >
        Login
      </Button>

      <Link href="/register" asChild>
        <Button mode="text" style={styles.link}>
          Don't have an account? Sign up
        </Button>
      </Link>

      <Link href="/forgot-password" asChild>
        <Button mode="text" style={styles.link}>
          Forgot Password?
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