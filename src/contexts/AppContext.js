import React, { createContext, useContext, useState } from 'react';
import { mockUsers, mockConversations, mockExploreFeed } from '../services/mockData';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [likedProfiles, setLikedProfiles] = useState(new Set());
  const [sentRequests, setSentRequests] = useState(new Set());
  const [receivedRequests, setReceivedRequests] = useState(new Set());
  const [connectedUsers, setConnectedUsers] = useState(new Set());
  
  // User will be set from backend after authentication
  const [user, setUser] = useState(null);

  // Multiple profiles for the same user (to be loaded from backend)
  const [userProfiles, setUserProfiles] = useState([]);

  const [searchResults, setSearchResults] = useState([]);
  const [conversations] = useState(mockConversations);
  const [exploreFeed] = useState(mockExploreFeed);

  // Messages will be populated as users interact
  const [messages, setMessages] = useState({});
  
  const [notifications, setNotifications] = useState([]);

  const updateUser = (userData) => {
    if (!userData) {
      setUser(null);
      setUserProfiles([]);
      return;
    }

    // If userData has multiple profiles, set them
    if (userData.profiles && Array.isArray(userData.profiles)) {
      setUserProfiles(userData.profiles);
      // Set the first profile as active or find the active one
      const activeProfile = userData.profiles.find(p => p.isActive) || userData.profiles[0];
      setUser(activeProfile);
    } else {
      // Single profile from signup/login
      setUser(userData);
      setUserProfiles([userData]);
    }
  };

  const switchProfile = (profileId) => {
    const newProfile = userProfiles.find(p => p._id === profileId || p.id === profileId);
    if (newProfile) {
      setUser(newProfile);
    }
  };

  const addProfile = (newProfile) => {
    setUserProfiles(prev => [...prev, newProfile]);
  };

  // Calendar matching functionality
  const getCalendarMatches = () => {
    // TODO: Implement real calendar matching with backend data
    // For now, return empty array until we have real profiles with calendars
    return [];
  };

  // Helper function to determine valid matches based on roles
  const isValidMatch = (role1, role2) => {
    const validPairs = [
      ['ARTIST', 'VENUE'],
      ['ARTIST', 'PROMOTER'],
      ['PROMOTER', 'VENUE'],
      ['AGENT', 'VENUE'],
      ['AGENT', 'PROMOTER']
    ];
    
    return validPairs.some(([r1, r2]) => 
      (role1 === r1 && role2 === r2) || (role1 === r2 && role2 === r1)
    );
  };

  // Get filtered profiles based on account type and location
  const getLocationFilteredProfiles = (profiles, searchLocation = null) => {
    if (!user) return profiles;

    // Premium users can see all profiles globally
    if (user.isPremium) {
      return searchLocation 
        ? profiles.filter(p => p.city.toLowerCase().includes(searchLocation.toLowerCase()) || 
                              p.country.toLowerCase().includes(searchLocation.toLowerCase()))
        : profiles;
    }

    // Basic users only see local profiles (same city)
    return profiles.filter(p => p.city === user.city);
  };

  const searchUsers = (query, filters) => {
    let results = mockUsers;
    
    if (query) {
      results = results.filter(u => 
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.role.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filters.role && filters.role !== 'all') {
      results = results.filter(u => u.role === filters.role);
    }

    if (filters.location) {
      results = results.filter(u => 
        u.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.genres && filters.genres.length > 0) {
      results = results.filter(u => 
        filters.genres.some(genre => u.genres?.includes(genre))
      );
    }

    setSearchResults(results);
  };

  const sendMessage = (userId, text) => {
    const newMessage = {
      text,
      timestamp: new Date().toISOString(),
      isMe: true
    };

    setMessages(prev => ({
      ...prev,
      [userId]: [...(prev[userId] || []), newMessage]
    }));

    setTimeout(() => {
      const autoReply = {
        text: "Thanks for your message! I'll get back to you soon.",
        timestamp: new Date().toISOString(),
        isMe: false
      };
      setMessages(prev => ({
        ...prev,
        [userId]: [...prev[userId], autoReply]
      }));
    }, 1500);
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const toggleLike = (profileId) => {
    const newLikes = new Set(likedProfiles);
    if (newLikes.has(profileId)) {
      newLikes.delete(profileId);
    } else {
      newLikes.add(profileId);
    }
    setLikedProfiles(newLikes);
  };

  const sendConnectionRequest = (profileId, message) => {
    const newRequests = new Set(sentRequests);
    newRequests.add(profileId);
    setSentRequests(newRequests);

    // Add message to messages state
    const newMessages = { ...messages };
    if (!newMessages[profileId]) {
      newMessages[profileId] = [];
    }

    if (message) {
      // Regular user message
      newMessages[profileId].push({
        text: message,
        timestamp: new Date().toISOString(),
        isMe: true
      });
    } else {
      // System message for connection request
      newMessages[profileId].push({
        text: `${user?.name || 'User'} wants to connect`,
        timestamp: new Date().toISOString(),
        isSystem: true
      });
    }
    setMessages(newMessages);
  };

  const acceptRequest = (profileId) => {
    // Remove from received requests
    const newReceivedRequests = new Set(receivedRequests);
    newReceivedRequests.delete(profileId);
    setReceivedRequests(newReceivedRequests);

    // Add to connected users
    const newConnectedUsers = new Set(connectedUsers);
    newConnectedUsers.add(profileId);
    setConnectedUsers(newConnectedUsers);

    // Create a conversation if it doesn't exist
    const newMessages = { ...messages };
    if (!newMessages[profileId]) {
      newMessages[profileId] = [];
    }

    // Add system message for accepted connection
    newMessages[profileId].push({
      text: "Connection accepted",
      timestamp: new Date().toISOString(),
      isSystem: true
    });

    setMessages(newMessages);
  };

  const declineRequest = (profileId) => {
    // Remove from received requests
    const newReceivedRequests = new Set(receivedRequests);
    newReceivedRequests.delete(profileId);
    setReceivedRequests(newReceivedRequests);
  };

  const value = {
    user,
    updateUser,
    userProfiles,
    switchProfile,
    addProfile,
    getCalendarMatches,
    getLocationFilteredProfiles,
    searchResults,
    searchUsers,
    conversations,
    exploreFeed,
    messages,
    sendMessage,
    notifications,
    addNotification,
    clearNotifications,
    likedProfiles,
    toggleLike,
    sentRequests,
    receivedRequests,
    connectedUsers,
    connectionRequests: sentRequests, // Backward compatibility
    sendConnectionRequest,
    acceptRequest,
    declineRequest
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};