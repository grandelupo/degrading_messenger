import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Switch, useTheme, Button, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        <List.Subheader>Preferences</List.Subheader>
        <List.Item
          title="Push Notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Privacy Policy"
          left={props => <List.Icon {...props} icon="shield-account" />}
          onPress={() => {/* TODO: Navigate to privacy policy */}}
        />
        <List.Item
          title="Terms of Service"
          left={props => <List.Icon {...props} icon="file-document" />}
          onPress={() => {/* TODO: Navigate to terms of service */}}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="Change Password"
          left={props => <List.Icon {...props} icon="key" />}
          onPress={() => {/* TODO: Navigate to change password */}}
        />
        <List.Item
          title="Delete Account"
          left={props => <List.Icon {...props} icon="account-remove" />}
          onPress={() => {/* TODO: Show delete account confirmation */}}
        />
      </List.Section>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          Logout
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
  },
  logoutButton: {
    marginTop: 16,
  },
}); 