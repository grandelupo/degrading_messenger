import { Tabs } from 'expo-router';
import { useTheme, IconButton, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';

export default function TabsLayout() {
  const theme = useTheme();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    const fetchAvatar = async () => {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching avatar:', error);
        } else {
          setAvatarUrl(data?.avatar_url);
        }
      }
    };

    fetchAvatar();
  }, [session]);

  const HeaderRight = () => (
    <IconButton
      icon={() => (
        avatarUrl ? (
          <Avatar.Image
            size={28}
            source={{ uri: avatarUrl }}
            style={{ marginRight: 8 }}
          />
        ) : (
          <MaterialCommunityIcons
            name="account-circle"
            size={28}
            color={theme.colors.primary}
            style={{ marginRight: 8 }}
          />
        )
      )}
      onPress={() => router.push('/settings')}
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