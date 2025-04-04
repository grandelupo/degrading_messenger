import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
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
        <Text style={styles.description}>
          We've sent you an email with a confirmation link. Please check your email and click the link to complete your registration.
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

      <TextInput
        mode="outlined"
        label="Username"
        value={username}
        onChangeText={text => {
          setUsername(text);
          setError('');
        }}
        autoCapitalize="none"
        style={styles.input}
        error={!!error}
        outlineStyle={styles.inputOutline}
      />
      
      <TextInput
        mode="outlined"
        label="Password"
        value={password}
        onChangeText={text => {
          setPassword(text);
          setError('');
        }}
        secureTextEntry
        style={styles.input}
        error={!!error}
        outlineStyle={styles.inputOutline}
      />

      <TextInput
        mode="outlined"
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={text => {
          setConfirmPassword(text);
          setError('');
        }}
        secureTextEntry
        style={styles.input}
        error={!!error}
        outlineStyle={styles.inputOutline}
      />

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
      
      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        contentStyle={styles.buttonContent}
        disabled={loading}
      >
        Create Account
      </Button>

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
        <Text style={[styles.dividerText, { color: theme.colors.outline }]}>OR</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
      </View>

      <Link href="/login" asChild>
        <Button 
          mode="outlined" 
          style={styles.loginButton}
          labelStyle={{ color: theme.colors.primary }}
        >
          Log In to Existing Account
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
  loginButton: {
    borderRadius: 24,
    height: 48,
  },
}); 