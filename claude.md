# TORA App - Project Summary

## Overview
TORA is a React-based web application designed for professionals in the electronic music/club scene to connect, network, and collaborate. The app features a dark theme with pink accent colors (#FF3366) and is built to be easily convertible to React Native.

## Project Structure
```
tora-app/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Calendar.js         # Travel schedule & availability calendar
│   │   │   ├── Header.js           # App header with notifications, premium & settings
│   │   │   ├── Modal.js            # Reusable modal component
│   │   │   ├── NotificationDropdown.js  # Notification display
│   │   │   ├── RAEventsModal.js    # Resident Advisor events display
│   │   │   └── TabBar.js           # Bottom navigation (5 tabs)
│   │   └── screens/
│   │       ├── CalendarScreen.js   # Full-page calendar with travel schedules
│   │       ├── ChatScreen.js       # Individual chat conversations with system messages
│   │       ├── EditProfileScreen.js # Full-page profile editing
│   │       ├── ExploreScreen.js    # Swipeable cards (Tinder-style)
│   │       ├── MatchesScreen.js    # Calendar-based matching with filters
│   │       ├── MessagesScreen.js   # Split Messages/Requests tabs
│   │       ├── ProfileScreen.js    # User profile with embeds & profile switching
│   │       ├── RepresentedArtistsScreen.js # Agent artist management interface
│   │       ├── SearchScreen.js     # Search with filters & full-page profiles
│   │       ├── ViewProfileScreen.js # Full-page profile viewing with media embeds
│   │       ├── ManageArtistScreen.js # Artist management hub with navigation
│   │       ├── ArtistScheduleScreen.js # Artist schedule & event management
│   │       ├── FinancialOverviewScreen.js # Financial tracking & reporting
│   │       ├── PerformanceAnalyticsScreen.js # Analytics & performance metrics
│   │       ├── ContractDetailsScreen.js # Contract management & tracking
│   │       ├── MediaPressKitScreen.js # Media assets & press kit management
│   │       └── BookNewGigsScreen.js # Booking opportunities & applications
│   ├── contexts/
│   │   ├── AppContext.js          # Global state with sent/received requests
│   │   └── LanguageContext.js     # Translation system
│   ├── data/
│   │   └── profiles.js            # Sample data with extended bios
│   ├── services/
│   │   └── raService.js           # Resident Advisor API service
│   ├── styles/
│   │   ├── App.css                # Main styles (4500+ lines)
│   │   ├── index.css              # Base styles
│   │   └── responsive.css         # Responsive breakpoints
│   ├── translations/
│   │   ├── en.js                  # English translations
│   │   └── ja.js                  # Japanese translations
│   ├── utils/
│   │   └── icons.js               # SVG icon components
│   ├── App.js                     # Main app component
│   └── index.js                   # App entry point
├── public/
│   └── index.html
├── .env.example                   # Environment config template
├── RA_API_SETUP.md               # RA integration documentation
├── CLAUDE.md                      # This file
└── package.json
```

## Key Features

### 1. User Profile System
- **Multiple Profiles**: Support for 4 switchable profiles (Artist, Agent, Promoter, Venue)
- **Default User**: Al Jones (Artist, Tokyo, Japan)
- **Bio**: "Milan-born, Italian-British-Jamaican artist Al Jones started in underground electronic music in 2006..."
- **Editable Fields**: Name, role, location, genres, bio, social links, calendar visibility
- **Roles**: ARTIST, VENUE, PROMOTER, AGENT
- **Social Links**: Instagram, Spotify, Resident Advisor, Website, Mixtape/SoundCloud
- **Premium Features**: Calendar visibility controls for premium users
- **Media Embeds**: SoundCloud player, Spotify artist profile, RA events modal

### 2. Calendar with Travel Scheduling
- Full-page calendar interface (not modal)
- Green dates indicate availability
- Drag selection for multiple dates
- Long press to add location filters (Zone/Country/City)
- Travel schedule management below calendar
- "ADD TRAVEL SCHEDULE" button when no schedules exist
- Save button fixed at bottom of screen
- **Agent Role**: Replaced with Represented Artists management interface

### 3. Search & Discovery
- Search by name with real-time filtering
- Multi-select filters: Roles, Zones, Countries, Cities, Genres
- Location-based restrictions: Basic accounts see local city only, Premium sees worldwide
- Premium upgrade banner with yellow CTA button
- Like/Connect functionality with persistent state
- Full-page profile viewing on click
- Connection requests without required message

### 4. Messaging System
- **Split Tabs**: Messages (conversations) and Requests (incoming)
- **Sent vs Received**: Sent requests appear in Messages, received in Requests
- **System Messages**: Connection requests without text show as italic system messages
- **Chat Features**: Date separators, timestamps, message bubbles
- **Connection Flow**: Optional message when connecting
- **Accept/Decline**: Buttons for incoming requests

### 5. Explore (Swipe) System
- Tinder-style card swiping interface
- Keyboard navigation (arrow keys)
- Touch and mouse drag support
- Card fits in viewport without scrolling
- Embedded SoundCloud preview for artists
- Full profile viewing on tap
- Like/Nope visual indicators

### 6. ViewProfile System
- Full-page profile viewing (not modal)
- Media embeds: SoundCloud, Spotify, RA Events
- Centered name with proper spacing
- Order: Name → Location → Role → Genres
- Stats: Likes (not Followers), Connections, Capacity
- Like/Connect buttons at bottom
- Social links: Latest Mix, Spotify Artist, Events, Instagram, Website

### 7. Translation System
- Full internationalization support
- Languages: English, Japanese
- Language selector in settings
- Localized date formatting
- Persistent language preference (localStorage)

### 8. Calendar Matching System
- **Premium vs Basic Accounts**: Basic limited to local city, Premium gets global access
- **Role-Based Matching**: Artists ↔ Venues/Promoters, Promoters ↔ Venues
- **Travel Schedule Matching**: Find professionals with overlapping availability
- **Filters**: By role and month/year
- **Calendar Privacy**: Premium users can hide calendar while viewing others
- **Genre Matching**: Matches must share at least one genre

### 9. Premium Subscription System
- **Star Icon in Header**: Quick access to premium upgrade modal
- **Premium Modal**: Comprehensive feature list and pricing options
- **Visual Indicators**: Gold star (no animation) for premium users
- **Pricing Tiers**: Monthly ($19) and Yearly ($180 with 20% discount)
- **Premium Benefits**:
  - Global search and discovery
  - Calendar matching functionality
  - Privacy controls for calendar
  - Travel mode (appear in future locations)
  - Unlimited messaging
  - Priority support

### 10. Edit Profile System
- Full-page editing interface (not modal)
- Upload profile picture functionality
- Multi-select genre picker
- Social links editing
- Bio text area
- Save button fixed at bottom
- Calendar visibility toggle (premium)

### 11. Represented Artists Management (Agent Role)
- Full-page artist roster management
- Add new artists with search TORA or manual entry
- Artist cards with avatar, name, location, and genres
- **View Profile**: Opens full ViewProfileScreen for artists
- **Manage**: Comprehensive management hub with 6 professional screens:
  - **Schedule Management**: Event calendar, gig tracking, availability overview
  - **Financial Overview**: Earnings tracking, expense management, payment status
  - **Performance Analytics**: Streaming data, social metrics, live performance stats
  - **Contract Details**: Contract management, terms tracking, signature workflow
  - **Media & Press Kit**: Photo/video/audio/document management with categorization
  - **Book New Gigs**: Venue opportunities, application tracking, proposal templates
- Empty state with CTA to add first artist
- Replaces calendar functionality for Agent profiles

## Design Specifications

### Colors
- **Background**: #0a0a0a (dark black)
- **Primary**: #FF3366 (pink)
- **Premium**: Standard icon color (not gold)
- **Text**: White/gray variations
- **Cards**: #1a1a1a
- **Borders**: #2a2a2a

### Typography
- Clean, modern sans-serif
- Responsive font sizes
- High contrast for readability

### Layout
- Mobile-first responsive design
- Bottom tab navigation (5 tabs: Profile, Search, Matches, Explore, Messages)
- Top header with notifications, premium star, and settings icons
- Full-page screens for major interfaces
- Touch-friendly controls

## State Management

### AppContext
```javascript
{
  userProfiles: [            // Multiple user profiles
    {
      id: 'al-jones',
      name: "Al Jones",
      role: "ARTIST",
      location: "Tokyo, Japan",
      bio: "...",
      genres: ["House", "Deep House", ...],
      isPremium: true,
      calendarVisible: true,
      travelSchedule: [...],
      // ... social links
    },
    // ... 3 more profiles (Agent, Promoter, Venue)
  ],
  currentProfileId: 'al-jones',  // Active profile
  user: {},                       // Current active profile data
  likedProfiles: Set(),           // Liked profile IDs
  sentRequests: Set(),            // Requests I sent
  receivedRequests: Set(),        // Requests I received
  messages: {                      // Chat messages by user ID
    userId: [{ text, timestamp, isMe, isSystem }, ...]
  },
  notifications: [],              // System notifications
  getCalendarMatches: () => []   // Calendar matching function
}
```

### LanguageContext
- Current language state
- Translation function `t(key)`
- Language change handler
- Available languages list

## Technical Details

### Dependencies
- React 18
- React Router DOM (for navigation)
- Context API for state
- CSS modules for styling
- No external UI libraries

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Performance Optimizations
- Lazy loading for modals
- Optimized re-renders with proper state management
- Efficient list rendering
- Touch event optimization for mobile

## Recent Updates (September 16, 2025)

### UI/UX Improvements
- **ViewProfileScreen Updates**:
  - Full-page display instead of modal
  - Centered name and role positioning
  - Proper spacing: Name → Location → Role → Genres
  - Changed "Followers" to "Likes"
  - Reordered social links: Latest Mix, Spotify, Events, Instagram, Website
  - Added media preview embeds (SoundCloud, Spotify, RA)
  
### Messaging System Enhancements
- **Split Messages/Requests**:
  - Separate tabs for conversations and incoming requests
  - Sent requests appear in Messages tab
  - Received requests appear in Requests tab with Accept/Decline
  - Count badges for each section

- **Connection Requests**:
  - Message now optional (no text required)
  - Empty requests show as italic system message: "[Name] wants to connect"
  - System messages centered and styled differently

### Profile Viewing
- Clicking users in Search opens full-page ViewProfileScreen
- Consistent profile viewing from Explore and Search tabs
- Spotify embed with artist ID mapping
- Fixed button positioning (not overlapping)

### Search System Updates
- **Location-Based Restrictions**: Basic accounts limited to local city (30km radius), Premium accounts see worldwide
- **Premium Upgrade Banner**: Clean, elegant banner with yellow CTA button matching matches page design
- **Map Removal**: Removed InteractiveMap component due to complexity issues
- **Visual Indicators**: Clear distinction between basic/premium search capabilities

### Agent Profile Enhancements
- **Represented Artists Screen**: New dedicated interface replacing calendar for Agent role
- **Artist Management**: Full CRUD operations for artist roster
- **View Profile Integration**: Seamless navigation to artist profiles
- **Comprehensive Management Suite**: 6 dedicated screens for professional artist management:
  - **ArtistScheduleScreen**: Event calendar with gig tracking and revenue overview
  - **FinancialOverviewScreen**: Earnings/expenses tracking with period filtering and transaction history
  - **PerformanceAnalyticsScreen**: Multi-tab analytics (streaming, social, live performance data)
  - **ContractDetailsScreen**: Full contract lifecycle management with detailed terms and status tracking
  - **MediaPressKitScreen**: 4-category media management (photos, audio, videos, documents) with press kit generation
  - **BookNewGigsScreen**: 3-tab booking system (opportunities, applications, templates) with search and filtering
- **Professional UI**: Status badges, data visualization, interactive forms, and responsive design
- **Sample Data**: Realistic data across all screens for demonstration and testing
- **Empty State**: Onboarding flow for new agents with no artists

### Premium System Updates
- Removed gold color and pulsing animation from star icon
- Fixed premium modal pricing layout
- Implemented subscription flow simulation

### Remove Connection Feature (November 2025)
- **Remove Connection Button**: Added to ViewProfileScreen for connected users
- **Confirmation Modal**: Warning dialog before removing connection
- **Backend Implementation**: DELETE endpoint `/api/connections/remove/:profileId`
  - Removes both `CONNECTED` and `CONNECTION_REQUEST` types with `ACCEPTED` status
  - Bidirectional deletion (removes connection in both directions)
  - Cache invalidation for both profiles after removal
- **UI Updates**: Button changes from "Message" to "Connect" after removal
- **Chat Restrictions**: Messaging disabled for disconnected users
  - Input box hidden when no longer connected
  - Disclaimer message explaining disconnection status
  - Chat history preserved for reference
- **Smooth UX**: No page reload required, clean state management

### UI/UX Improvements (November 2025)
- **BookingsScreen Modal**: Fixed button sizing for Decline/Review/Accept CTAs
  - Reduced padding and font-size for better fit
  - Consistent button heights across all actions
  - Equal-width buttons with proper flex layout
- **Message Button**: Matched height with booking action buttons
- **Button Styling**: Improved spacing and alignment throughout

### Bug Fixes
- Fixed overlapping buttons in ViewProfileScreen
- Corrected spacing between profile elements
- Fixed Spotify embed display issues
- Separated sent/received connection requests properly
- Fixed profile data mismatch in calendar matches
- Fixed connection status detection (checks both CONNECTED and CONNECTION_REQUEST types)

## Running the App

```bash
# Install dependencies
npm install

# Start development server
npm start
# Or on specific port
PORT=3001 npm start

# Build for production
npm run build
```

## Important Notes

1. **Mobile Compatibility**: The app is designed to work on all screen sizes and can be easily converted to React Native
2. **Data Persistence**: Currently uses in-memory state; ready for backend integration
3. **Multiple Profiles**: Supports 4 switchable profiles with different roles (Artist, Agent, Promoter, Venue)
4. **Premium System**: Premium accounts unlock global access and calendar matching features
5. **Travel Calendar**: Green indicates available dates, with location-based scheduling
6. **Language Support**: English and Japanese with complete UI translation
7. **Calendar Privacy**: Premium users can hide their calendar while viewing others
8. **Connection Requests**: Messages are optional when sending connection requests

## Common Tasks

### Adding a New Language
1. Create new translation file in `src/translations/`
2. Add language to `availableLanguages` in LanguageContext
3. Import translations in LanguageContext

### Modifying User Profile
1. Update default data in `AppContext`
2. Edit through the Edit Profile screen
3. Changes persist in session

### Customizing Theme
1. Modify color variables in `App.css`
2. Primary color: #FF3366
3. Background: #0a0a0a

## Known Features
- Profile switching between 4 different professional roles
- Calendar-based matching system with premium/basic tiers
- Premium subscription with star icon access (standard color)
- Like/Unlike profiles with visual feedback
- Connection requests with optional messages
- Location-based search restrictions (basic: local, premium: worldwide)
- Collapsible genre display
- Real-time notification system
- Calendar visibility privacy controls
- Travel schedule management
- Persistent language preference
- Fully translated UI (EN/JA)
- 5-tab navigation: Profile, Search, Matches, Explore, Messages
- Split Messages/Requests in messaging
- System messages for empty connection requests
- Full-page screens for major interfaces
- Media embeds in profiles (SoundCloud, Spotify, RA)
- Agent artist management with comprehensive professional toolkit
- Premium upgrade banners and CTAs
- 6 dedicated artist management screens with full functionality
- Professional data visualization and analytics
- Contract management and booking workflow systems
- Multi-category media and press kit management

## Recent Updates (November 10, 2025)

### Booking System Improvements
- **Compact Booking Cards**: Reduced card size and spacing in BookingsScreen for better visual density
- **Date Badge Display**: Added day-of-month number badge to each booking card (top-right corner, 32px square)
- **Past Date Validation**: Prevent creating offers with dates in the past - alert popup shows if attempted
- **Decline with Reason Modal**: When declining offers, users can now provide an optional reason via textarea modal
- **Improved Spacing**: Reduced month/year header spacing to match card gap for better visual hierarchy

### Critical Database Configuration
**IMPORTANT**: The backend MUST be connected to **local MongoDB** (`mongodb://localhost:27017/tora`), NOT MongoDB Atlas.

The booking offers, profiles, and all application data are stored in the local MongoDB database. If the backend is connected to Atlas, all booking data will appear missing.

**Backend Environment (.env)**:
```
MONGODB_URI=mongodb://localhost:27017/tora
```

**Common Issue**: Multiple backend server instances can cause port conflicts. If bookings disappear:
1. Check which process is listening on port 5001: `lsof -i :5001`
2. Kill all backend processes: `pkill -f "node.*server.js"`
3. Restart backend: `cd tora-backend && npm run dev`
4. Verify connection shows: `✅ MongoDB Connected: localhost`

### Booking Offer System
- **Offer Cards in Chat**: System messages with `dealId` display as interactive booking offer cards
- **Message with Emojis**: Booking offer previews include emojis (💰 fee, 📅 date, 📍 venue) for better scanability
- **Calendar Star Icon**: Booking offer cards show calendar icon with star overlay
- **Decline Reasons**: Optional reason textarea when declining offers from BookingsScreen
- **Date Badges**: Day number displayed on each booking card for easy chronological scanning

## Recent Updates (November 11, 2025)

### Currency and Fee Input Improvements
- **Fixed Currency Rounding Precision**: Resolved floating point precision errors that caused 300 USD to be stored as 299.93 USD
  - Applied `Math.round(parseFloat(fee) * 100) / 100` rounding to all fee inputs
  - Affects: MakeOfferModal (initial offers) and ChatScreen (counter-offers)
  - Ensures accurate currency values across all currencies (USD, EUR, GBP, JPY)
- **Integer-Only Fee Input**: Changed fee input fields to only accept whole numbers
  - Changed `step="0.01"` to `step="1"`
  - Changed placeholder from "0.00" to "0"
  - Added `min="0"` to prevent negative values
  - Backend rounding still ensures precision if decimals somehow get through

### Decline Flow Improvements
- **Required Decline Reason**: Made decline reason mandatory when declining from BookingsScreen
  - Alert shows if user tries to decline without providing reason
  - Removed "(optional)" text from modal
  - Consistent with ChatScreen decline behavior
- **Improved Modal Readability**: Increased transparency/opacity for better contrast
  - Textarea background: 0.05 → 0.12 (140% increase)
  - Textarea border: 0.1 → 0.15 (50% increase)
  - Focus background: 0.08 → 0.15 (87% increase)
  - Placeholder text: 0.3 → 0.4 (33% increase)
  - Modal background: Changed to solid #1a1a1a for better contrast
- **Decline Messages in Chat**: Declining from BookingsScreen now sends proper chat message
  - Creates system message with decline card showing venue, date, and reason
  - Message includes event name in subject: "Booking Offer Declined: {eventName}"
  - Notification sent to other party
  - Message appears in both conversation lists with preview text
- **Correct Person Attribution**: Fixed "Declined By" to show actual person who declined
  - Checks `dealStatus.declinedBy` field instead of message sender
  - Shows "You declined offer" when current user declined
  - Shows "{Name} declined offer" when other party declined
  - Example: Al Jones declines → MOVE sees "Al Jones declined offer", Al Jones sees "You declined offer"
- **Backend Population**: Added `.populate('declinedBy')` to both GET /api/deals endpoints
  - Ensures declinedBy field includes full profile object (name, role, avatar)
  - Fixes issue where "Declined By: Unknown" was showing

### Message Preview Cleanup
- **Removed Emojis from Conversation List**: Message previews no longer show emojis and details
  - Added `previewText` field to Message model for clean previews
  - Booking offers show: "New Booking Offer: {eventName}" (no emojis or fee/date details)
  - Accepted bookings show: "Booking Confirmed! {name} accepted your offer"
  - Full details with emojis still visible inside chat conversation
  - Backend API returns `previewText` instead of full `text` for conversation list

## Contact
This project was developed for the TORA platform, a networking application for electronic music industry professionals.