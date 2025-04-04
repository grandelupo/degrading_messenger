import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { View } from 'react-native';

export interface FriendItemProps {
  username: string;
  lastSeen?: string | null;
  onPress?: () => void;
}

export declare const FriendItem: ForwardRefExoticComponent<FriendItemProps & RefAttributes<View>>; 