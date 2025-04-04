import { Tabs } from 'expo-router';
import { useTheme, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TabsLayout() {
  const theme = useTheme();

  const HeaderRight = () => (
    <IconButton
      icon="account-circle"
      size={28}
      onPress={() => router.push('/settings')}
      style={{ marginRight: 8 }}
    />
  );

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.primary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.elevation.level2,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceDisabled,
        headerShadowVisible: false,
        headerRight: HeaderRight,
      }}
    >
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          headerTitle: 'My Friends',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerTitle: 'Find Friends',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 