import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme, List, Divider } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        <List.Subheader>Account Settings</List.Subheader>
        <Link href="/settings/profile" asChild>
          <List.Item
            title="Edit Profile"
            left={props => <List.Icon {...props} icon="account-edit" />}
          />
        </Link>
        <Link href="/settings/change-password" asChild>
          <List.Item
            title="Change Password"
            left={props => <List.Icon {...props} icon="lock" />}
          />
        </Link>
        <Link href="/settings/delete-account" asChild>
          <List.Item
            title="Delete Account"
            left={props => <List.Icon {...props} icon="account-remove" />}
          />
        </Link>
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Legal</List.Subheader>
        <Link href="/settings/privacy-policy" asChild>
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-account" />}
          />
        </Link>
        <Link href="/settings/terms" asChild>
          <List.Item
            title="Terms of Service"
            left={props => <List.Icon {...props} icon="file-document" />}
          />
        </Link>
      </List.Section>

      <Divider />

      <List.Section>
        <List.Item
          title="Sign Out"
          left={props => <List.Icon {...props} icon="logout" />}
          onPress={handleSignOut}
        />
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 