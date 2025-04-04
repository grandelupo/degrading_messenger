import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';

export default function ResetPasswordScreen() {
  const theme = useTheme();
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/messenger-icon.png')}
          style={styles.logo}
        />
      </View>

      <Text variant="headlineMedium" style={styles.title}>
        Set New Password
      </Text>

      <TextInput
        mode="outlined"
        label="New Password"
        value={newPassword}
        onChangeText={text => {
          setNewPassword(text);
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
        onPress={handleResetPassword}
        loading={loading}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        contentStyle={styles.buttonContent}
        disabled={loading}
      >
        Reset Password
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