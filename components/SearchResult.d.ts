export interface SearchResultProps {
  username: string;
  onAddFriend: () => void;
  status: 'none' | 'pending' | 'accepted';
}

export declare function SearchResult(props: SearchResultProps): JSX.Element; 