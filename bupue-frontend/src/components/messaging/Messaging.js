import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import './Messaging.css';

const Messaging = () => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/messages');
      setThreads(response.data);
      if (response.data.length > 0 && !selectedThread) {
        setSelectedThread(response.data[0]);
      }
    } catch (error) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;

    try {
      const response = await apiClient.post(`/api/messages/${selectedThread._id}`, {
        text: newMessage
      });
      
      setNewMessage('');
      setSelectedThread(response.data);
      
      // Update the thread in the list
      setThreads(prev => prev.map(thread => 
        thread._id === selectedThread._id ? response.data : thread
      ));
    } catch (error) {
      setError('Failed to send message');
    }
  };

  const getOtherParticipant = (thread) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    return thread.participants.find(p => p._id !== currentUser.id);
  };

  if (loading) return <div className="messaging-container">Loading messages...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="messaging-container">
      <div className="messaging-sidebar">
        <h3>Conversations</h3>
        <div className="threads-list">
          {threads.map(thread => {
            const otherUser = getOtherParticipant(thread);
            const lastMessage = thread.messages[thread.messages.length - 1];
            
            return (
              <div
                key={thread._id}
                className={`thread-item ${selectedThread?._id === thread._id ? 'active' : ''}`}
                onClick={() => setSelectedThread(thread)}
              >
                <div className="thread-user">{otherUser?.username || 'Unknown User'}</div>
                {lastMessage && (
                  <div className="thread-preview">
                    {lastMessage.text.slice(0, 50)}...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="messaging-main">
        {selectedThread ? (
          <>
            <div className="chat-header">
              <h3>Chat with {getOtherParticipant(selectedThread)?.username || 'Unknown User'}</h3>
            </div>
            
            <div className="chat-messages">
              {selectedThread.messages.map((message, index) => {
                const currentUser = JSON.parse(localStorage.getItem('user'));
                const isOwnMessage = message.sender._id === currentUser.id;
                
                return (
                  <div
                    key={index}
                    className={`message ${isOwnMessage ? 'own' : 'other'}`}
                  >
                    <div className="message-content">
                      <div className="message-text">{message.text}</div>
                      <div className="message-time">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <form className="chat-input" onSubmit={sendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={!newMessage.trim()}
              />
              <button type="submit" disabled={!newMessage.trim()}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-thread-selected">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
