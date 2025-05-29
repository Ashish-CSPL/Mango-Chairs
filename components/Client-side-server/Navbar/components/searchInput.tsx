import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  color?: string;
  placeholder?: string;
  maxWidth?: string; // e.g., 'max-w-[280px]'
  className?: string; // Additional classes for the wrapper div
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchTerm,
  setSearchTerm,
  color = "black",
  placeholder = "Search...",
  maxWidth = "max-w-[280px]",
  className = "",
}) => {
  return (
    <div
      className={`flex items-center border border-transparent bg-white px-2 py-1 flex-shrink-0 ${maxWidth} ${className}`}
    >
      <Search color={color} size={18} />
      <input
        type="text"
        placeholder={placeholder}
        className="outline-none border-none text-sm bg-white text-black placeholder-black w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ borderRadius: 0 }}
      />
    </div>
  );
};

export default SearchInput;
