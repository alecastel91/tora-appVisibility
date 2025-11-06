import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers, mockConversations, mockExploreFeed } from '../services/mockData';
import apiService from '../services/api';

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
  const [likedProfilesData, setLikedProfilesData] = useState([]); // Full profile objects
  const [sentRequests, setSentRequests] = useState(new Set());
  const [receivedRequests, setReceivedRequests] = useState(new Set());
  const [connectedUsers, setConnectedUsers] = useState(new Set());
  const [connectedUsersData, setConnectedUsersData] = useState([]); // Full profile objects
  const [likerProfilesData, setLikerProfilesData] = useState([]); // Full profile objects for likers

  // User will be set from backend after authentication
  const [user, setUser] = useState(null);

  // Multiple profiles for the same user (to be loaded from backend)
  const [userProfiles, setUserProfiles] = useState([]);

  // Track loading state to prevent duplicate fetches
  const [isLoadingProfileData, setIsLoadingProfileData] = useState(false);

  // Load profile-specific data when user/profile changes
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user || !user._id) return;
      if (isLoadingProfileData) return; // Prevent duplicate fetches

      const startTime = performance.now();
      console.log('🔄 [AppContext] Starting to load profile data for:', user._id);

      try {
        setIsLoadingProfileData(true);

        const apiStartTime = performance.now();
        // OPTIMIZED: Fetch all data in one request
        const data = await apiService.getProfileData(user._id);
        const apiEndTime = performance.now();
        console.log(`✅ [AppContext] API call completed in ${(apiEndTime - apiStartTime).toFixed(0)}ms`);

        setLikedProfiles(new Set(data.likedProfileIds || []));
        setLikedProfilesData(data.likedProfiles || []); // Store full profile objects
        setConnectedUsers(new Set(data.connectedProfileIds || []));
        setConnectedUsersData(data.connectedProfiles || []); // Store full profile objects
        setSentRequests(new Set(data.sentRequestIds || []));
        setReceivedRequests(new Set(data.receivedRequestIds || []));
        setLikerProfilesData(data.likerProfiles || []); // Store likers full profile objects
        setNotifications(data.notifications || []);

        const endTime = performance.now();
        console.log(`✅ [AppContext] Profile data loaded in ${(endTime - startTime).toFixed(0)}ms`);
      } catch (error) {
        console.error('❌ [AppContext] Error loading profile data:', error);
        // Reset to empty sets on error
        setLikedProfiles(new Set());
        setLikedProfilesData([]);
        setConnectedUsers(new Set());
        setConnectedUsersData([]);
        setSentRequests(new Set());
        setReceivedRequests(new Set());
        setLikerProfilesData([]);
        setNotifications([]);
      } finally {
        setIsLoadingProfileData(false);
      }
    };

    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]); // Re-load when active profile changes

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
      console.log('🔍 [AppContext updateUser] Setting profiles array - count:', userData.profiles.length);
      console.log('🔍 [AppContext updateUser] Profiles:', userData.profiles.map(p => p.name));
      setUserProfiles(userData.profiles);
      // Set the first profile as active or find the active one
      const activeProfile = userData.profiles.find(p => p.isActive) || userData.profiles[0];
      setUser(activeProfile);
    } else {
      console.log('🔍 [AppContext updateUser] Setting SINGLE profile:', userData.name || userData);
      // Single profile update - update within existing profiles array
      const profileId = userData._id || userData.id;

      // Check if this profile already exists in userProfiles
      const existingIndex = userProfiles.findIndex(p => (p._id || p.id) === profileId);

      if (existingIndex >= 0) {
        // Update existing profile in the array
        const updatedProfiles = [...userProfiles];
        updatedProfiles[existingIndex] = userData;
        setUserProfiles(updatedProfiles);
        setUser(userData);
      } else {
        // New profile (from signup/login) - add to array
        setUser(userData);
        setUserProfiles([...userProfiles, userData]);
      }
    }
  };

  const switchProfile = (profileId) => {
    const newProfile = userProfiles.find(p => p._id === profileId || p.id === profileId);
    if (newProfile) {
      setUser(newProfile);
      // Profile data will reload automatically via useEffect
    }
  };

  const addProfile = (newProfile) => {
    setUserProfiles(prev => [...prev, newProfile]);
  };

  // Helper function to reload profile data (call after likes/connections change)
  const reloadProfileData = async () => {
    if (!user || !user._id) return;
    if (isLoadingProfileData) return; // Prevent duplicate fetches

    try {
      setIsLoadingProfileData(true);

      // OPTIMIZED: Fetch all data in one request
      const [profileData, userData] = await Promise.all([
        apiService.getProfileData(user._id),
        apiService.getCurrentUser()
      ]);

      setLikedProfiles(new Set(profileData.likedProfileIds || []));
      setLikedProfilesData(profileData.likedProfiles || []);
      setConnectedUsers(new Set(profileData.connectedProfileIds || []));
      setConnectedUsersData(profileData.connectedProfiles || []);
      setSentRequests(new Set(profileData.sentRequestIds || []));
      setReceivedRequests(new Set(profileData.receivedRequestIds || []));
      setLikerProfilesData(profileData.likerProfiles || []);
      setNotifications(profileData.notifications || []);

      // Also reload user stats
      const currentProfile = userData.profiles.find(p => p._id === user._id);
      if (currentProfile) {
        setUser(currentProfile);
        // Update profiles array as well
        setUserProfiles(userData.profiles);
      }
    } catch (error) {
      console.error('Error reloading profile data:', error);
    } finally {
      setIsLoadingProfileData(false);
    }
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

  const getConversations = async () => {
    if (!user || !user._id) {
      console.error('No active user profile');
      return [];
    }

    try {
      const data = await apiService.getConversations(user._id);
      return data.conversations || [];
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  };

  const getMessageThread = async (otherProfileId) => {
    if (!user || !user._id) {
      console.error('No active user profile');
      return [];
    }

    try {
      const data = await apiService.getMessageThread(user._id, otherProfileId);
      return data.messages || [];
    } catch (error) {
      console.error('Error getting message thread:', error);
      return [];
    }
  };

  const sendMessage = async (otherProfileId, text, connectionRequestId = null) => {
    if (!user || !user._id) {
      console.error('No active user profile');
      return;
    }

    try {
      const data = await apiService.sendMessage(user._id, otherProfileId, text, connectionRequestId);
      return data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const clearNotifications = async () => {
    if (!user || !user._id) return;

    try {
      await apiService.clearNotifications(user._id);
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const toggleLike = async (profileId) => {
    if (!user || !user._id) {
      console.error('No active user profile');
      return;
    }

    // Optimistic UI update
    const isCurrentlyLiked = likedProfiles.has(profileId);
    const newLikedProfiles = new Set(likedProfiles);

    if (isCurrentlyLiked) {
      newLikedProfiles.delete(profileId);
    } else {
      newLikedProfiles.add(profileId);
    }
    setLikedProfiles(newLikedProfiles);

    try {
      // Call backend to toggle like
      await apiService.toggleLike(user._id, profileId);

      // Force reload profile data by temporarily resetting loading flag
      setIsLoadingProfileData(false);
      await reloadProfileData();
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setLikedProfiles(likedProfiles);
      alert('Failed to toggle like. Please try again.');
    }
  };

  const sendConnectionRequest = async (profileId, message) => {
    if (!user || !user._id) {
      console.error('No active user profile');
      return;
    }

    try {
      // Send connection request to backend
      await apiService.sendConnectionRequest(user._id, profileId, message);

      // Reload profile data to get updated sent requests
      await reloadProfileData();
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  };

  const acceptRequest = async (requestId) => {
    if (!user || !user._id) {
      console.error('No active user profile');
      return;
    }

    try {
      // Call backend to accept the request
      await apiService.acceptConnectionRequest(requestId);

      // Reload profile data to get updated connections and requests
      await reloadProfileData();
    } catch (error) {
      console.error('Error accepting connection request:', error);
      throw error;
    }
  };

  const declineRequest = async (requestId) => {
    if (!user || !user._id) {
      console.error('No active user profile');
      return;
    }

    try {
      // Call backend to decline the request
      await apiService.declineConnectionRequest(requestId);

      // Reload profile data to get updated requests
      await reloadProfileData();
    } catch (error) {
      console.error('Error declining connection request:', error);
      throw error;
    }
  };

  const value = {
    user,
    updateUser,
    userProfiles,
    switchProfile,
    addProfile,
    reloadProfileData,
    getCalendarMatches,
    getLocationFilteredProfiles,
    searchResults,
    searchUsers,
    conversations,
    exploreFeed,
    messages,
    getConversations,
    getMessageThread,
    sendMessage,
    notifications,
    addNotification,
    clearNotifications,
    likedProfiles,
    likedProfilesData, // OPTIMIZED: Full profile objects
    toggleLike,
    sentRequests,
    receivedRequests,
    connectedUsers,
    connectedUsersData, // OPTIMIZED: Full profile objects
    likerProfilesData, // OPTIMIZED: Full profile objects for likers
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