export const mockUsers = [
  {
    id: 2,
    name: 'Simone De Kunovich',
    role: 'DJ',
    location: 'Amsterdam, NL',
    avatar: 'https://i.pravatar.cc/150?img=2',
    genres: ['Techno', 'Minimal'],
    bio: 'Resident DJ at Fabric London',
    followers: 2500,
    bookings: 145
  },
  {
    id: 3,
    name: 'Elena Rossi',
    role: 'Promoter',
    location: 'Milan, Italy',
    avatar: 'https://i.pravatar.cc/150?img=3',
    genres: ['House', 'Tech House'],
    bio: 'Event organizer and club promoter',
    followers: 1800,
    bookings: 89
  },
  {
    id: 4,
    name: 'Marco Silva',
    role: 'Producer',
    location: 'Barcelona, Spain',
    avatar: 'https://i.pravatar.cc/150?img=4',
    genres: ['Deep House', 'Melodic Techno'],
    bio: 'Music producer and label owner',
    followers: 5200,
    bookings: 67
  },
  {
    id: 5,
    name: 'Fabric London',
    role: 'Venue',
    location: 'London, UK',
    avatar: 'https://i.pravatar.cc/150?img=5',
    genres: ['Techno', 'House', 'Drum & Bass'],
    bio: 'Iconic nightclub in the heart of London',
    followers: 25000,
    bookings: 520
  },
  {
    id: 6,
    name: 'Alex Thompson',
    role: 'Agent',
    location: 'New York, USA',
    avatar: 'https://i.pravatar.cc/150?img=6',
    genres: ['All Electronic'],
    bio: 'Booking agent for international DJs',
    followers: 890,
    bookings: 234
  }
];

export const mockConversations = [
  {
    id: 1,
    user: mockUsers[0],
    lastMessage: {
      text: 'Hey, are you available for a gig next month?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isMe: false
    },
    unreadCount: 2
  },
  {
    id: 2,
    user: mockUsers[1],
    lastMessage: {
      text: 'Thanks for the tracks!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isMe: true
    },
    unreadCount: 0
  },
  {
    id: 3,
    user: mockUsers[2],
    lastMessage: {
      text: 'See you at the venue tonight',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      isMe: false
    },
    unreadCount: 1
  }
];

export const mockExploreFeed = [
  {
    id: 1,
    type: 'event',
    category: 'events',
    title: 'Awakenings Festival 2024',
    description: 'The biggest techno festival in the Netherlands',
    image: 'https://picsum.photos/400/200?random=1',
    date: 'June 29-30, 2024',
    location: 'Amsterdam, NL',
    price: '€150',
    likes: 1250,
    comments: 89,
    isPromoted: true
  },
  {
    id: 2,
    type: 'artist',
    category: 'artists',
    title: 'Charlotte de Witte',
    description: 'Belgian techno DJ and producer taking the world by storm',
    image: 'https://picsum.photos/400/200?random=2',
    genres: ['Techno', 'Dark Techno'],
    followers: 850000,
    bookings: 245,
    likes: 3400,
    comments: 156
  },
  {
    id: 3,
    type: 'opportunity',
    category: 'opportunities',
    title: 'Resident DJ Wanted - Berghain',
    description: 'Looking for experienced techno DJ for monthly residency',
    opportunityType: 'Residency',
    budget: '€2000-5000/night',
    deadline: 'March 15, 2024',
    likes: 567,
    comments: 43
  },
  {
    id: 4,
    type: 'venue',
    category: 'venues',
    title: 'Printworks London',
    description: 'Industrial venue hosting the best electronic music events',
    image: 'https://picsum.photos/400/200?random=3',
    location: 'London, UK',
    capacity: 6000,
    likes: 2100,
    comments: 98
  },
  {
    id: 5,
    type: 'event',
    category: 'events',
    title: 'Time Warp 2024',
    description: 'Germany\'s premier techno event returns',
    image: 'https://picsum.photos/400/200?random=4',
    date: 'April 6, 2024',
    location: 'Mannheim, Germany',
    price: '€85',
    likes: 890,
    comments: 67
  }
];