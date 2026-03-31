import { useUserSearch } from '../hooks/useUserSearch';

interface UserSearchDropdownProps {
  onUserSelect: (user: any) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function UserSearchDropdown({ 
  onUserSelect, 
  placeholder = "Search by username or name...",
  label = "Search & Select User",
  disabled = false,
  className = ""
}: UserSearchDropdownProps) {
  const {
    searchQuery,
    selectedUser,
    showDropdown,
    searchResults,
    dropdownRef,
    handleUserSelect,
    handleSearchChange,
    clearSelection,
    setShowDropdown
  } = useUserSearch();

  const handleSelect = (user: any) => {
    handleUserSelect(user);
    onUserSelect(user);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setShowDropdown(searchQuery.length > 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent pr-10"
          placeholder={placeholder}
          disabled={disabled}
        />
        <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      </div>
      
      {selectedUser && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selectedUser.avatarUrl ? (
              <img 
                src={selectedUser.avatarUrl} 
                alt={selectedUser.name || selectedUser.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {(selectedUser.name || selectedUser.username)?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">@{selectedUser.username}</p>
              {selectedUser.name && (
                <p className="text-sm text-gray-600">{selectedUser.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={clearSelection}
            className="text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {showDropdown && searchResults && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((user) => (
            <button
              key={user._id}
              onClick={() => handleSelect(user)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
              disabled={disabled}
            >
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name || user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {(user.name || user.username)?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">@{user.username}</p>
                {user.name && (
                  <p className="text-sm text-gray-600">{user.name}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && searchQuery.length > 0 && searchResults && searchResults.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No users found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}