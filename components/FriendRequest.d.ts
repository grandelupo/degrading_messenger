export interface FriendRequestProps {
  username: string;
  onAccept: () => void;
  onReject: () => void;
}

declare const FriendRequest: React.FC<FriendRequestProps>;
export default FriendRequest; 