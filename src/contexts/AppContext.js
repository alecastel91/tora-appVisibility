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
  const [sentRequests, setSentRequests] = useState(new Set()); // Requests I sent
  const [receivedRequests, setReceivedRequests] = useState(new Set([5, 8])); // Requests I received (demo data)
  const [connectedUsers, setConnectedUsers] = useState(new Set([2, 3])); // Users I'm connected with (demo data)
  
  // Multiple user profiles
  const [userProfiles, setUserProfiles] = useState([
    {
      id: 'al-jones',
      name: 'Al Jones',
      role: 'ARTIST',
      bio: 'Milan-born, Italian-British-Jamaican artist Al Jones started in underground electronic music in 2006. Since young age he gained acclaim in Milan\'s top clubs, and became resident DJ of the party Vitamina in 2016. Now Tokyo-based, he launched MOVE ムーブ in 2022, an itinerant event celebrating art, self-expression, and electronic music, and founded the record label MOVE TRAX in 2025.',
      location: 'Tokyo, Japan',
      city: 'Tokyo',
      country: 'Japan',
      avatar: null,
      genres: ['House', 'Deep House', 'Progressive House'],
      residentAdvisor: 'https://it.ra.co/dj/aljones',
      mixtape: 'https://soundcloud.com/headstream/move-tokyo-w-al-jones-friday-2nd-june?si=ae4194d0caec4177a9b49b8b1b5151b2&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
      spotify: 'https://open.spotify.com/intl-it/artist/0UX0Il3rXsvMI4ZgYP3cc7?si=hph_EjveSBmYpBloiruvOw',
      instagram: '@aljones_groove',
      website: '',
      isPremium: true,
      calendarVisible: true,
      travelSchedule: [
        { city: 'Berlin', country: 'Germany', from: '2025-02-15', to: '2025-02-20' },
        { city: 'Amsterdam', country: 'Netherlands', from: '2025-02-21', to: '2025-02-25' },
        { city: 'London', country: 'UK', from: '2025-03-01', to: '2025-03-05' }
      ]
    },
    {
      id: 'alessandro-castelbuono',
      name: 'Alessandro Castelbuono',
      role: 'AGENT',
      bio: 'Experienced music industry professional specializing in electronic music artist management and booking. Based in Tokyo with deep connections across Asia-Pacific markets. Represents cutting-edge artists and facilitates international collaborations between Japanese and European electronic music scenes.',
      location: 'Tokyo, Japan',
      city: 'Tokyo',
      country: 'Japan',
      avatar: null,
      genres: ['Techno', 'House', 'Progressive House', 'Melodic Techno'],
      residentAdvisor: '',
      mixtape: '',
      spotify: '',
      instagram: '@alessandro_agent',
      website: 'https://castelbuono-agency.com',
      isPremium: false,
      calendarVisible: false,  // Agents may prefer privacy
      travelSchedule: [],
      representingArtists: [
        {
          id: 2,
          name: 'Amelie Lens',
          location: 'Antwerp, Belgium',
          avatar: 'https://i.pravatar.cc/150?img=2',
          genres: ['Techno', 'Driving Techno'],
          email: 'amelie@technoartist.com',
          phone: '+32 485 123 456',
          instagram: '@amelielens'
        },
        {
          id: 3,
          name: 'Elena Rodriguez',
          location: 'Barcelona, Spain',
          avatar: 'https://i.pravatar.cc/150?img=3',
          genres: ['House', 'Tech House'],
          email: 'elena@housemusic.es',
          phone: '+34 666 789 123',
          instagram: '@elenarodriguezdj'
        },
        {
          id: 6,
          name: 'Kenji Nakamura',
          location: 'Tokyo, Japan',
          avatar: 'https://i.pravatar.cc/150?img=6',
          genres: ['Minimal Techno', 'Ambient'],
          email: 'kenji@minimaltokyo.jp',
          instagram: '@kenjiminimal'
        }
      ]
    },
    {
      id: 'move-tokyo',
      name: 'MOVE ムーブ',
      role: 'PROMOTER',
      bio: 'Tokyo-based electronic music event series celebrating art, self-expression, and cutting-edge electronic music. Curating unique experiences that bridge Japanese and international underground scenes. Founded in 2022, MOVE has become synonymous with innovative programming and immersive club experiences.',
      location: 'Tokyo, Japan',
      city: 'Tokyo',
      country: 'Japan',
      avatar: null,
      genres: ['House', 'Techno', 'Progressive House', 'Deep House'],
      residentAdvisor: 'https://ra.co/promoters/move-tokyo',
      mixtape: '',
      spotify: '',
      instagram: '@move_tokyo',
      website: 'https://movetokyo.jp',
      isPremium: true,
      calendarVisible: true,
      travelSchedule: [],
      eventSchedule: [
        { name: 'MOVE x Berlin', city: 'Berlin', country: 'Germany', date: '2025-02-18' },
        { name: 'MOVE x Amsterdam', city: 'Amsterdam', country: 'Netherlands', date: '2025-02-23' }
      ]
    },
    {
      id: 'vent-tokyo',
      name: 'VENT',
      role: 'VENUE',
      bio: 'Premier underground electronic music venue in Tokyo\'s Shibuya district. State-of-the-art sound system and intimate atmosphere create the perfect setting for both established and emerging artists. VENT has hosted legendary nights featuring international DJs and serves as a cultural hub for Tokyo\'s electronic music community.',
      location: 'Shibuya, Tokyo, Japan',
      city: 'Tokyo',
      country: 'Japan',
      avatar: null,
      genres: ['Techno', 'House', 'Deep House', 'Minimal Techno'],
      residentAdvisor: 'https://ra.co/clubs/vent-tokyo',
      mixtape: '',
      spotify: '',
      instagram: '@vent_tokyo',
      website: 'https://vent-tokyo.com',
      capacity: '200',
      isPremium: false,  // Basic account for demo purposes
      calendarVisible: false,
      travelSchedule: [],
      availableDates: ['2025-02-18', '2025-02-19', '2025-02-23', '2025-02-24']
    }
  ]);

  const [currentProfileId, setCurrentProfileId] = useState('al-jones');
  const [user, setUser] = useState(userProfiles[0]);

  const [searchResults, setSearchResults] = useState([]);
  const [conversations] = useState(mockConversations);
  const [exploreFeed] = useState(mockExploreFeed);
  
  // Initialize with some example conversations
  const [messages, setMessages] = useState({
    2: [ // Amelie Lens
      { text: "Hey Al! Loved your set at Womb last weekend!", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), isMe: false },
      { text: "Thanks Amelie! The crowd was amazing", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 300000).toISOString(), isMe: true },
      { text: "We should definitely collaborate on something", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 600000).toISOString(), isMe: false },
      { text: "I'm working on a new EP, would love to have you remix one of the tracks", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 900000).toISOString(), isMe: false },
      { text: "That sounds amazing! Send me the stems when you're ready", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), isMe: true },
      { text: "Will do! Also, are you playing in Milan anytime soon?", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), isMe: false },
      { text: "Planning a Europe tour for spring. Milan is definitely on the list!", timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), isMe: true },
      { text: "Perfect! Let me know the dates, I can help with promotion", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isMe: false },
      { text: "Looking forward to it! 🔥", timestamp: new Date(Date.now() - 60000).toISOString(), isMe: false }
    ],
    19: [ // Womb Tokyo
      { text: "Hi Al Jones, we'd love to have you for our NYE event!", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), isMe: false },
      { text: "That would be incredible! I'm definitely interested", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), isMe: true },
      { text: "Great! We're thinking 2-4AM slot for the main floor", timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), isMe: false },
      { text: "Perfect timing. What's the capacity looking like?", timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 1800000).toISOString(), isMe: true },
      { text: "Full capacity - 1000 people. It's going to be massive!", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), isMe: false },
      { text: "Can we discuss the technical setup? I have some specific requirements", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), isMe: true },
      { text: "Of course! We have CDJ-3000s and DJM-A9. Anything else you need?", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), isMe: false },
      { text: "That's perfect. Just need 4 channels on the mixer", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), isMe: true },
      { text: "Interested in booking you for our spring residency too", timestamp: new Date(Date.now() - 7200000).toISOString(), isMe: false }
    ],
    3: [ // Elena Rodriguez
      { text: "Your new track on MOVE TRAX is fire! 🔥", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), isMe: false },
      { text: "Thank you so much! Really happy with how it turned out", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isMe: true },
      { text: "The baseline is insane. What synth did you use?", timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), isMe: false },
      { text: "Moog Sub 37 with some heavy processing in Ableton", timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), isMe: true },
      { text: "Thanks for connecting!", timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), isMe: false }
    ]
  });
  
  const [notifications, setNotifications] = useState([]);

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
    // Also update the profile in the userProfiles array
    setUserProfiles(prevProfiles => 
      prevProfiles.map(profile => 
        profile.id === currentProfileId ? { ...profile, ...updates } : profile
      )
    );
  };

  const switchProfile = (profileId) => {
    const newProfile = userProfiles.find(p => p.id === profileId);
    if (newProfile) {
      setCurrentProfileId(profileId);
      setUser(newProfile);
    }
  };

  // Calendar matching functionality
  const getCalendarMatches = () => {
    if (!user?.isPremium) return [];

    // Return empty matches for MOVE promoter profile
    if (currentProfileId === 'move-tokyo') {
      return [];
    }

    // Return sample matches data for demo (for other profiles)
    const sampleMatches = [
      {
        profile: {
          id: 2,
          name: 'Amelie Lens',
          role: 'ARTIST',
          location: 'Antwerp, Belgium',
          city: 'Antwerp',
          avatar: 'https://i.pravatar.cc/150?img=5',
          genres: ['Techno', 'Acid Techno'],
          bio: 'Belgian electronic music DJ and producer who rose from Antwerp\'s underground scene to international techno stardom.',
          followers: 38000,
          calendarVisible: true,
          isVerified: true
        },
        matchType: 'location',
        location: 'Antwerp',
        dates: 'Dec 15-20, 2025',
        reason: 'Available for collaboration and shows in Belgium'
      },
      {
        profile: {
          id: 7,
          name: 'Fabric London',
          role: 'VENUE',
          location: 'London, UK',
          city: 'London',
          avatar: 'https://i.pravatar.cc/150?img=21',
          genres: ['Techno', 'House', 'Drum & Bass'],
          bio: 'Iconic London nightclub featuring the famous bodysonic dancefloor and a world-class sound system that sets industry standards.',
          followers: 98000,
          calendarVisible: true
        },
        matchType: 'location',
        location: 'London',
        dates: 'Sep 15-20, 2025',
        reason: 'Available for bookings during your London tour dates'
      },
      {
        profile: {
          id: 12,
          name: 'Yes Chef',
          role: 'PROMOTER',
          location: 'Barcelona, Spain',
          city: 'Barcelona',
          avatar: 'https://i.pravatar.cc/150?img=25',
          genres: ['House', 'Tech House'],
          bio: 'Serving up the hottest house and tech house beats in Barcelona\'s underground scene.',
          followers: 4500,
          calendarVisible: true
        },
        matchType: 'event',
        location: 'Barcelona',
        dates: 'Oct 8-10, 2025',
        reason: 'Looking for artists for warehouse event series'
      },
      {
        profile: {
          id: 6,
          name: 'Berghain',
          role: 'VENUE',
          location: 'Berlin, Germany',
          city: 'Berlin',
          avatar: 'https://i.pravatar.cc/150?img=20',
          genres: ['Techno', 'House'],
          bio: 'Legendary techno club in Berlin, housed in a former power plant with the world\'s most famous dancefloor.',
          followers: 125000,
          calendarVisible: true
        },
        matchType: 'location',
        location: 'Berlin',
        dates: 'Nov 22-25, 2025',
        reason: 'Open slots for guest DJs during your Berlin dates'
      },
      {
        profile: {
          id: 11,
          name: 'Wicked',
          role: 'PROMOTER',
          location: 'Tokyo, Japan',
          city: 'Tokyo',
          avatar: 'https://i.pravatar.cc/150?img=12',
          genres: ['Techno', 'House', 'Minimal'],
          bio: 'Dark, sensual, and provocative - Wicked brings underground European techno to Tokyo\'s most daring venues.',
          followers: 8900,
          calendarVisible: true
        },
        matchType: 'event',
        location: 'Tokyo',
        dates: 'Dec 5-7, 2025',
        reason: 'Organizing underground techno events, seeking headline acts'
      },
      {
        profile: {
          id: 8,
          name: 'WOMB Tokyo',
          role: 'VENUE',
          location: 'Tokyo, Japan',
          city: 'Tokyo',
          avatar: 'https://i.pravatar.cc/150?img=22',
          genres: ['Techno', 'House', 'Trance'],
          bio: 'Premier electronic music venue in Tokyo\'s vibrant Shibuya district, representing Japan\'s connection to global club culture.',
          followers: 45000,
          calendarVisible: true
        },
        matchType: 'location',
        location: 'Tokyo',
        dates: 'Jan 1-5, 2026',
        reason: 'Matching availability for your Asia tour'
      }
    ];

    return sampleMatches;
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
    currentProfileId,
    switchProfile,
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