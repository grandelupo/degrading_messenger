import { GestureResponderEvent } from 'react-native';

export interface FriendItemProps {
  username: string;
  lastSeen?: string | null;
  onPress?: (event: GestureResponderEvent) => void;
}

declare const FriendItem: React.FC<FriendItemProps>;
export default FriendItem; 