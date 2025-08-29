import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import JoinPlatform from './components/JoinPlatform';
import UserList from './components/UserList';
import Conversation from './components/Conversation';
import './App.css';

// Use environment variable for server URL, fallback to localhost for development
const SERVER_URL = process.env.REACT_APP_SERVER_URL || window.location.origin.replace(':3000', ':5001');

const socket = io(SERVER_URL);

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Socket connection status
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    // Handle user list updates
    socket.on('user-list-updated', (userList) => {
      setUsers(userList);
    });

    // Handle joined platform confirmation
    socket.on('joined-platform', (data) => {
      console.log('Received joined-platform event:', data);
      // Update user with the correct userId from server
      setUser(prev => {
        const updatedUser = {
          ...prev,
          id: data.userId
        };
        console.log('Updated user:', updatedUser);
        return updatedUser;
      });
    });

    // Handle conversation events
    socket.on('conversation-started', (conversationData) => {
      setConversation(conversationData);
    });

    socket.on('conversation-ended', () => {
      setConversation(null);
    });

    socket.on('recording-started', () => {
      setConversation(prev => prev ? { ...prev, isRecording: true } : null);
    });

    socket.on('recording-stopped', () => {
      setConversation(prev => prev ? { ...prev, isRecording: false } : null);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      alert(`Error: ${error}`);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('user-list-updated');
      socket.off('joined-platform');
      socket.off('conversation-started');
      socket.off('conversation-ended');
      socket.off('recording-started');
      socket.off('recording-stopped');
      socket.off('error');
    };
  }, []);

  const handleJoinPlatform = (userData) => {
    console.log('Joining platform with userData:', userData);
    socket.emit('join-platform', userData);
    setUser(userData);
  };

  const handleStartConversation = (targetUserId) => {
    socket.emit('start-conversation', targetUserId);
  };

  const handleEndConversation = () => {
    if (conversation) {
      socket.emit('end-conversation', conversation.conversationId);
    }
  };

  const handleStartRecording = () => {
    if (conversation) {
      socket.emit('start-recording', conversation.conversationId);
    }
  };

  const handleStopRecording = () => {
    if (conversation) {
      socket.emit('stop-recording', conversation.conversationId);
    }
  };

  const handleLeavePlatform = () => {
    // Disconnect from socket (this will trigger the disconnect handler on server)
    socket.disconnect();
    // Reset local state
    setUser(null);
    setUsers([]);
    setConversation(null);
    setIsConnected(false);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              !user ? (
                <JoinPlatform onJoin={handleJoinPlatform} />
              ) : (
                <Navigate to="/users" replace />
              )
            } 
          />
          <Route 
            path="/users" 
            element={
              user ? (
                <UserList 
                  users={users}
                  currentUser={user}
                  onStartConversation={handleStartConversation}
                  conversation={conversation}
                  onLeavePlatform={handleLeavePlatform}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/conversation" 
            element={
              conversation ? (
                <Conversation 
                  conversation={conversation}
                  currentUser={user}
                  socket={socket}
                  onEndConversation={handleEndConversation}
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                  onLeavePlatform={handleLeavePlatform}
                />
              ) : (
                <Navigate to="/users" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
