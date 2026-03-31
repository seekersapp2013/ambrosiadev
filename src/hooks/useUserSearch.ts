import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useUserSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchResults = useQuery(
    api.profiles.searchProfiles,
    searchQuery.trim().length > 0 ? { query: searchQuery.trim() } : "skip"
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setSearchQuery(user.username);
    setShowDropdown(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(value.length > 0);
    
    if (selectedUser && value !== selectedUser.username) {
      setSelectedUser(null);
    }
  };

  const clearSelection = () => {
    setSelectedUser(null);
    setSearchQuery("");
    setShowDropdown(false);
  };

  return {
    searchQuery,
    selectedUser,
    showDropdown,
    searchResults,
    dropdownRef,
    handleUserSelect,
    handleSearchChange,
    clearSelection,
    setShowDropdown
  };
}