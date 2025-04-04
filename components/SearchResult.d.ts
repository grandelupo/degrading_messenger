export interface SearchResultProps {
  username: string;
  onAddFriend: () => void;
  status: 'none' | 'pending' | 'accepted';
}

declare const SearchResult: React.FC<SearchResultProps>;
export default SearchResult; 