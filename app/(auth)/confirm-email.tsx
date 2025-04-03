import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const { token, type, email } = useLocalSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !type || type !== 'signup') {
      setError('Invalid confirmation link');
      setLoading(false);
      return;
    }

    const confirmEmail = async () => {
      try {
        const { error } = await supabase.auth.verifyOtp({
          token: token as string,
          type: 'signup',
        });

        if (error) throw error;

        // Successfully confirmed email
        router.replace('/login');
      } catch (error: any) {
        console.error('Error confirming email:', error);
        setError(error.message || 'Failed to confirm email');
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [token, type]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Confirming your email...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Error
        </Text>
        <Text style={styles.error}>{error}</Text>
        <Button
          mode="contained"
          onPress={() => router.replace('/login')}
          style={styles.button}
        >
          Return to Login
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Email Confirmed!
      </Text>
      <Text style={styles.text}>
        Your email has been confirmed. You can now sign in to your account.
      </Text>
      <Button
        mode="contained"
        onPress={() => router.replace('/login')}
        style={styles.button}
      >
        Sign In
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
    marginVertical: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
  },
}); 