import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
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
        label="Email or Phone Number"
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

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
      
      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        contentStyle={styles.buttonContent}
        disabled={loading}
      >
        Log In
      </Button>

      <Link href="/forgot-password" asChild>
        <Button mode="text" style={styles.link} textColor={theme.colors.primary}>
          Forgot Password?
        </Button>
      </Link>

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
        <Text style={[styles.dividerText, { color: theme.colors.outline }]}>OR</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
      </View>

      <Link href="/register" asChild>
        <Button 
          mode="outlined" 
          style={styles.createAccountButton}
          labelStyle={{ color: theme.colors.primary }}
        >
          Create New Account
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
  link: {
    marginVertical: 4,
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
  createAccountButton: {
    borderRadius: 24,
    height: 48,
  },
}); 