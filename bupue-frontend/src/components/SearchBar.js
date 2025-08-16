import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      console.log('Search effect triggered with query:', query);
      
      if (!query.trim()) {
        // Show all users when search is empty (for testing)
        setIsLoading(true);
        try {
          console.log('Fetching all users...');
          const response = await apiClient.get('/users/search?limit=10');
          console.log('All users response:', response.data);
          setResults(response.data.users || []);
          setShowResults(true);
        } catch (error) {
          console.error('Get all users error:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        console.log('Searching for:', query.trim());
        const response = await apiClient.get(`/users/search?q=${encodeURIComponent(query.trim())}&limit=10`);
        console.log('Search response:', response.data);
        setResults(response.data.users || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleUserClick = (userId) => {
    setShowResults(false);
    setQuery('');
    navigate(`/profile/${userId}`);
  };

  const handleFollow = async (userId, e) => {
    e.stopPropagation();
    try {
      await apiClient.post(`/users/${userId}/follow`);
      setResults(prev => prev.map(user => 
        user._id === userId ? { ...user, isFollowing: true } : user
      ));
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  return (
    <div className="search-container" ref={searchRef}>
      <input
        type="text"
        placeholder="Search users, filters & categories..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowResults(true)}
        className="search-input"
      />
      
                    {showResults && (
         <div className="search-results">
           {isLoading ? (
             <div className="search-loading">Searching...</div>
           ) : results.length > 0 ? (
             results.map(user => (
               <div
                 key={user._id}
                 className="search-result-item"
                 onClick={() => handleUserClick(user._id)}
               >
                 <div className="user-info">
                   <div className="user-avatar">
                     <div className="avatar-placeholder">
                       {user.username.charAt(0).toUpperCase()}
                     </div>
                   </div>
                   <div className="user-details">
                     <div className="user-name">
                       {user.profile?.displayName || user.username}
                     </div>
                     <div className="user-role">
                       {user.profile?.category || 'User'}
                     </div>
                     <div className="user-email">
                       {user.email}
                     </div>
                   </div>
                 </div>
                 <button
                   className="follow-button"
                   onClick={(e) => handleFollow(user._id, e)}
                 >
                   Follow
                 </button>
               </div>
             ))
           ) : (
             <div className="search-loading">No users found</div>
           )}
         </div>
       )}
    </div>
  );
};

export default SearchBar;
