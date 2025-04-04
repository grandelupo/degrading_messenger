import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function AppLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chat/[id]"
        options={{
          headerTitle: 'Chat',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="settings/change-password"
        options={{
          headerTitle: 'Change Password',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="settings/delete-account"
        options={{
          headerTitle: 'Delete Account',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="settings/privacy-policy"
        options={{
          headerTitle: 'Privacy Policy',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="settings/terms"
        options={{
          headerTitle: 'Terms of Service',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="settings/profile"
        options={{
          headerTitle: 'Profile',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="settings/index"
        options={{
          headerTitle: 'Settings',
        }}
      />
    </Stack>
  );
} 