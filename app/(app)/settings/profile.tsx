import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { Text, Button, Avatar, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { decode } from 'base64-arraybuffer';

export default function ProfileScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session?.user?.id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;
      if (data) setAvatarUrl(data.avatar_url);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        await uploadAvatar(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadAvatar = async (base64Image: string) => {
    try {
      setUploading(true);

      // Generate a unique file name with user ID as the folder name
      const fileName = `${session?.user?.id}/${Date.now()}.jpg`;
      const filePath = fileName;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64Image), {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: publicURL } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicURL.publicUrl })
        .eq('id', session?.user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicURL.publicUrl);
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Avatar.Image
            size={120}
            source={{ uri: avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <Avatar.Icon
            size={120}
            icon={() => (
              <MaterialCommunityIcons
                name="account-circle"
                size={120}
                color={theme.colors.onPrimary}
              />
            )}
            style={styles.avatar}
          />
        )}
        <Button
          mode="contained"
          onPress={pickImage}
          loading={uploading}
          disabled={uploading}
          style={styles.uploadButton}
        >
          {uploading ? 'Uploading...' : 'Change Profile Picture'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  uploadButton: {
    marginTop: 8,
  },
}); 