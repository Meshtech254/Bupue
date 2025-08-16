import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Try admin endpoint first, fallback to regular search
      try {
        const response = await apiClient.get('/admin/users?limit=50');
        setUsers(response.data.users || []);
      } catch (adminError) {
        console.log('Admin endpoint not available, using regular search');
        const response = await apiClient.get('/users/search?limit=50');
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      await apiClient.post(`/admin/users/${userId}/ban`);
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, banned: true } : user
      ));
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user. You may not have admin privileges.');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await apiClient.post(`/admin/users/${userId}/unban`);
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, banned: false } : user
      ));
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Failed to unban user. You may not have admin privileges.');
    }
  };

  if (isLoading) {
    return <div className="admin-loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <h2>User Management</h2>
      <p>Total Users: {users.length}</p>
      
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-info-cell">
                    <div className="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {user.profile?.displayName || user.username}
                      </div>
                      <div className="user-username">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.profile?.category || 'Other'}</td>
                <td>
                  <span className={`user-status ${user.banned ? 'banned' : 'active'}`}>
                    {user.banned ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td>
                  <div className="user-actions">
                    {user.banned ? (
                      <button 
                        className="unban-btn"
                        onClick={() => handleUnbanUser(user._id)}
                      >
                        Unban
                      </button>
                    ) : (
                      <button 
                        className="ban-btn"
                        onClick={() => handleBanUser(user._id)}
                      >
                        Ban
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
