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

### 2. Calendar with Travel Scheduling (Role-Based Display)
- Full-page calendar interface (not modal)
- Month navigation with previous/next buttons
- **Available Dates**:
  - Green dates indicate availability
  - Click single date to toggle availability
  - Drag to select/deselect multiple dates at once
  - Instant save to backend on selection
  - Persists across page refreshes and devices
  - Touch-friendly with mobile support
  - Syncs between CalendarScreen (profile) and ManageArtistScreen (agent view)
- **Travel Schedule Management (Artists & Agents)**:
  - Schedule form with Zone/Country/City cascading selects
  - "ADD TRAVEL SCHEDULE" button when no schedules exist
  - Schedules displayed with location labels and formatted dates (YYYY-MM-DD)
  - Location labels shown on calendar dates (city/country/zone)
  - Edit and delete functionality with proper date formatting
  - Instant save to backend with error handling
  - Cross-device synchronization (PC and phone)
  - Auto-refresh when switching between screens
- **Upcoming Events (Promoters & Venues)**:
  - Replaces Travel Schedule section for Promoter/Venue roles
  - Shows upcoming bookings with PENDING, NEGOTIATING, or ACCEPTED status
  - Displays event name, date, artist name, and status badge
  - Sorted by date (earliest first)
  - Limited to 10 upcoming events
  - Color-coded status badges (yellow=pending, blue=negotiating, green=accepted)
  - Calendar icon with pink accent
  - Fetched from backend deals API
- **Agent Role**: Replaced with Represented Artists management interface
  - Full calendar integration in Manage section
  - Same available dates and travel schedule functionality
  - Edits sync with artist's profile calendar

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

## Recent Updates (February 14, 2026)

### Calendar Tab Role-Based Display for Promoters/Venues
- **Feature**: Calendar tab now shows different content based on user role
- **Promoters & Venues**: Travel Schedule section replaced with "Upcoming Events" list
  - **Identical to agent's dashboard**: Uses exact same booking card design for consistency
  - **Expandable cards**: Click anywhere on card (avatar or info) to expand/collapse details
  - **Compact view**: Shows artist avatar, name, role badge, location, and status badge row
  - **Expanded view**: Displays full booking details (event name, artist, date, time, performance type, fee)
  - **Date badge**: Day number in top-right corner (e.g., "15")
  - **Expand arrow**: Rotates 180° when card is expanded
  - **Status badges**: Color-coded pills below location (yellow=pending, blue=negotiating, green=accepted)
  - **Data**: Limited to 10 upcoming events, sorted by date (earliest first), fetched from backend deals API
- **Artists & Agents**: Continue to see Travel Schedule section (unchanged)
  - Can add, edit, and delete travel schedules
  - Travel schedule labels appear on calendar dates
- **Layout Fix**: Removed all padding when embedded in dashboard tabs to prevent double padding
  - Changed from `paddingTop: '0'` to `padding: '0'` for embedded calendar
  - Matches dashboard and documents tab spacing exactly
- **Files Modified**:
  - [CalendarScreen.js](src/components/screens/CalendarScreen.js): Added expandable card functionality, helper functions, state management
  - [App.css](src/styles/App.css): No new styles - reuses existing booking card classes
- **Implementation Details**:
  - Added `expandedDealId` state to track which card is expanded
  - Added `toggleDealExpanded()` function for expand/collapse
  - Added `getStatusBadgeClass()` and `formatEventDate()` helpers
  - Clickable areas: avatar and party-info with cursor pointer
  - Conditional rendering based on `isExpanded` state
  - Booking details section shows event name, artist info, date, times, type, and fee

## Recent Updates (February 12, 2026)

### Agent Contract Sending - Artist Document Selection Fix
- **Issue Fixed**: When agents sent contracts for their represented artists, the modal was showing empty contracts list instead of the artist's documents
- **Root Cause**: Timing issue - modal was opening before artist profile finished loading
- **Solution**: Fetch artist profile BEFORE opening the contract modal

**Files Modified:**
- **BookingsScreen.js (lines 470-496)**: Updated "Send Contract" button onClick handler
  - Changed from synchronous to async function
  - Added artist profile fetch when `deal.artistId` exists
  - Modal only opens after artist profile and contracts are fully loaded
  - Added console logging for debugging

- **ChatScreen.js (lines 1596-1624)**: Same fix for offer acceptance flow
  - "Send Contract" button in offer details popup now fetches artist profile first
  - Added async handling to wait for profile data before opening modal
  - Fixed `existingContracts` prop to check `selectedOffer?.artistId && selectedArtistForDocs`

- **ChatScreen.js (lines 2454-2458)**: Fixed existingContracts prop logic
  - Changed from checking `selectedOffer?.artist` to `selectedOffer?.artistId && selectedArtistForDocs`
  - Now correctly uses artist's contracts when agent is sending contract

**How It Works:**
- **Before**: Modal opened immediately with empty contracts → Artist profile fetched too late
- **After**: Click "Send Contract" → Fetch artist profile → Load contracts → THEN open modal

**Affected Workflows:**
1. **Bookings Screen**: When agent clicks "Send Contract" on accepted booking
2. **Chat Screen**: When agent clicks "Send Contract" after accepting an offer
3. Both now show artist's contracts in "Select Existing" tab

### Hong Kong Location Data Update
- **Location Display**: Changed Hong Kong location format
- **Country**: Now shows as "Hong Kong, China" → "China" as the country
- **City**: Hong Kong is now a city within China
- **Files Modified**:
  - `src/data/profiles.js`: Removed 'Hong Kong, China' from countries, added 'Hong Kong' as city under China
  - `src/models/Profile.js` (backend): Matched country list to frontend

### Contract Upload System Simplification
- **Removed**: PDF upload functionality from AddContractModal
- **Kept**: Only external link support (Google Drive, Dropbox, DocuSign, etc.)
- **Reason**: Simplified Phase 1 implementation - focus on external URLs
- **Files Modified**:
  - `AddContractModal.js`: Removed "Upload PDF" tab, kept "Select Existing" and "Add External Link" tabs
  - `ManageProfileScreen.js`: Removed PDF upload logic, simplified to URL-only handling

### Contract Withdrawal Notification Routing Fix
- **Issue Fixed**: Withdrawal notifications were appearing in sender's own chat instead of counterpart's
- **Root Cause**: After `.populate()`, comparing objects with `.toString()` returned `[object Object]`
- **Solution**: Extract IDs properly using `deal.artist._id.toString()` before comparison
- **File Modified**: `src/routes/deals.js` (backend, lines 860-885)

### Chat Message Display Fix
- **Issue Fixed**: Contract and withdrawal messages visible in conversation preview but not in actual chat
- **Root Cause**: Message filtering only showed ONE message per deal, missed some message types
- **Solution**: Added detection for withdrawal and "Contract sent" messages, prioritized correctly
- **File Modified**: `ChatScreen.js` (lines 676-697)

### Test Scripts Created
- `test-artistid.js`: Tests if artistId field is returned in API JSON
- `test-artist-contracts.js`: Checks if artist profile has contracts in documents
- `test-api-response.js`: Simulates API endpoint response for artistId field

## Recent Updates (February 4, 2026)

### Contract Sending - Select Existing Contracts Feature
- **AddContractModal Enhancement**: Added third tab to select existing contracts from user's Documents
  - **"Select Existing" Tab**: New tab appears first when user has saved contracts in their documents
  - **Contract Selection UI**:
    - Scrollable list of all contracts from `user.documents.contracts`
    - Each contract shows checkbox, title, URL, and document icon
    - Hover effects and selection highlighting (pink background when selected)
    - Clean, intuitive interface for quick selection
  - **Automatic Tab Priority**: Modal defaults to "Select Existing" if contracts exist, otherwise "Upload PDF"
  - **Submit Button Update**: Changes to "Send Contract" when using existing contracts
  - **Validation**: Ensures a contract is selected before sending

- **ChatScreen Integration**:
  - Updated AddContractModal to receive `existingContracts` prop from `currentUser.documents.contracts`
  - Contract modal in chat now shows all saved contracts for easy selection
  - Available when sending contracts after accepting offers

- **BookingsScreen Integration**:
  - Updated AddContractModal to receive `existingContracts` prop from `currentUser.documents.contracts`
  - Contract modal in bookings now shows all saved contracts for easy selection
  - Available when sending contracts for accepted deals

- **Benefits**:
  - **Reusability**: No need to re-upload standard contracts for each booking
  - **Consistency**: Ensures same contract template used across bookings
  - **Efficiency**: Faster workflow - select and send instead of uploading each time
  - **Centralized Management**: All contracts managed in Profile → Manage → Documents tab

- **Files Modified**:
  - [AddContractModal.js](src/components/common/AddContractModal.js): Added third tab with contract selection UI
  - [ChatScreen.js:2369](src/components/screens/ChatScreen.js#L2369): Added existingContracts prop
  - [BookingsScreen.js:996](src/components/screens/BookingsScreen.js#L996): Added existingContracts prop

## Recent Updates (January 22, 2026)

### Representation Management Enhancements
- **Representing Agent Priority Display**: When artists click "Find Agent", their current representing agent now appears at the top of the agents list
  - Agent list is sorted to show representing agent first
  - Separated visually from other available agents
  - Helps artists quickly identify their current representation relationship

- **Cancel Representation Feature**: Artists can now cancel their representation relationship with agents
  - **"Remove Representation" Button**: Red danger button appears for the representing agent (replaces "✓ Represented")
  - **Confirmation Dialog**: Shows clear warning about what will happen:
    - Removes artist from agent's represented roster
    - Removes agent badge from artist's profile
    - Maintains connection (messaging remains intact)
  - **Backend Implementation**:
    - New `cancelRepresentation` static method in Connection model
    - POST endpoint `/api/connections/cancel-representation`
    - Bidirectional cleanup: updates both agent and artist profiles
    - Sets representation requests to `CANCELLED` status
    - Cache invalidation for both profiles
    - Notification sent to agent about cancellation
  - **Frontend Implementation**:
    - `cancelRepresentation` method added to API service
    - `handleCancelRepresentation` function in SearchAgentsModal
    - State updates and UI refresh after cancellation

- **"Represented by" Badge in Artist Profile**: Artists now see the "Represented by [Agent Name]" badge in their own ManageProfileScreen
  - Matches the display shown when others view their profile
  - Uses HandshakeIcon for visual consistency
  - Positioned between artist info bar and tab navigation
  - Only appears when artist has active representation

### Dashboard Metrics Fix
- **"This Year Gigs" Calculation Corrected**: Fixed metric to only count completed/past gigs, not future bookings
  - Previous behavior: Counted ALL deals from this year including future ones
  - New behavior: Only counts COMPLETED deals or ACCEPTED deals with dates in the past
  - Matches the logic of "This Year Revenue" for consistency
  - Updated in both ManageArtistScreen (agent view) and ManageProfileScreen (artist view)
  - Filter criteria: `isThisYear && dealDate <= today && (isCompleted || isAcceptedAndPast)`

## Recent Updates (January 21, 2026)

### Artist Profile Management Section
- **New Feature**: Artist profiles now have a "Manage" button (replaced "Calendar" button)
- **ManageProfileScreen Component**: New full-screen interface with 3 tabs:
  - **Dashboard Tab**: Shows same KPIs as agent's ManageArtistScreen
    - Upcoming Gigs count
    - Revenue YTD (Year-To-Date)
    - Gigs This Year (completed + upcoming)
    - Expected Revenue from upcoming gigs
    - Revenue chart showing monthly revenue from 2024 onwards
    - Upcoming gigs list with venue, date, and fee
  - **Calendar Tab**: Embedded CalendarScreen (existing functionality)
    - Available dates selection (green dots)
    - Travel schedule management
    - Same features as standalone calendar
  - **Documents Tab**: Link-based document management (syncs with agent's view)
    - Press Kit links
    - Technical Rider links
    - Contract templates
    - Instant sync: documents added by artist appear in agent's view and vice versa
- **Calendar Embedding**: CalendarScreen accepts `embedded` prop to hide header when shown in tabs
- **Document Sync**: Documents saved in artist's Manage section sync to backend and reflect in agent's ManageArtistScreen
- **Data Source**: Dashboard fetches real booking deals from backend API
- **Currency Conversion**: Revenue displayed in user's preferred currency with proper conversion

### Document Management System Implementation
- **Documents Tab UX Refinements**:
  - Removed pink box styling from helper text (now plain grey text)
  - Reduced section spacing from 24px to 16px for more compact layout
  - Reduced empty state padding from 40px to 20px vertical
  - Made "+ Add Link" button smaller (10px/20px padding, 14px font)
  - Helper text only shows when category is empty (disappears when documents exist)
  - Each category (Press Kit, Technical Rider, Contracts) independently manages helper text visibility
  - Date display moved to separate line below URL link
- **Long URL Handling**: Proper ellipsis truncation with flexbox overflow handling
- **Delete Confirmation**: Modal confirmation before deleting document links
- **Backend Persistence**: Added `documents` field to Profile schema
  - Structure: `{ pressKit: [], technicalRider: [], contracts: [] }`
  - Each document: `{ id, title, url, addedDate }`
  - Backend automatically saves and persists documents
  - Documents survive page refresh and sync across devices
  - Changes sync between artist ManageProfileScreen and agent ManageArtistScreen

### Network Configuration Update - IP Address Change
- **Issue**: WiFi network change caused IP address to update from 192.168.2.103 to 192.168.2.108
- **Impact**: Login and API communication failure until IP addresses were updated across the app
- **Files Updated**:
  - `/Users/alessandrocastelbuono/Desktop/tora-app/.env` - Updated REACT_APP_API_URL
  - `/Users/alessandrocastelbuono/Desktop/tora-app/ecosystem.config.js` - Updated PM2 environment variable
  - `/Users/alessandrocastelbuono/Desktop/tora-backend/src/server.js` - Updated CORS allowed origins
- **Current Network Configuration**:
  - Frontend: http://192.168.2.108:3001
  - Backend API: http://192.168.2.108:5001/api
  - Database: MongoDB Atlas (cloud) at mongodb+srv://acastelbuono:Michael-23!@tora.zwmh1nr.mongodb.net/tora
- **Login Credentials**: User password is `password123`
- **Known Issue**: IP address needs manual update when changing WiFi networks

### Artist Info Tab UI Improvements
- **Profile Info Section**: Added lean-styled profile info box showing Name, Location, Role, and Genres
  - Matches bio section styling with proper typography and spacing
  - Clean, minimal design with light gray text (#888)
- **Location Fields Restructure**: Changed from single "Location" to three cascading dropdowns
  - Zone (Asia, Europe, Americas, Africa, Oceania)
  - Country (filtered by selected zone)
  - City (filtered by selected country)
  - Hong Kong removed from China's cities array (standalone location)
- **Edit Modal → Full-Page Screen**: Converted Edit Artist Info from modal to full-page interface
  - Consistent with other full-page screens in the app
  - Better usability for mobile devices
  - Proper header with back button and centered title
- **Button Layout**: Cancel and Save Changes buttons now side-by-side at bottom
  - Matches EditProfileScreen layout
  - Better touch targets for mobile
- **Bidirectional Profile Sync**: Artist profile changes sync to agent's representingArtists array
  - Backend automatically updates embedded artist data in agent profiles
  - Real-time synchronization without cache invalidation

### Media Embed Improvements
- **Spotify Embed Height**: Adjusted from 152px to 166px to match SoundCloud player
- **Border Removal**: Removed white border from both SoundCloud and Spotify embeds
  - Added `border: none` to `.embed-iframe` CSS class
  - Cleaner visual appearance

### Coming Soon Disclaimers
- **RA Events Modal**: Added "Coming Soon" message for Resident Advisor events feature
  - Simplified message: "This feature is currently in development"
  - Removed specific mention of "after launch" and "Resident Advisor API"
- **ManageArtistScreen Events Tab**: Changed "No upcoming events" to "Coming Soon" message
  - Consistent with RA Events modal messaging
- **Removed Calendar Emoji**: Deleted calendar emoji from "View Upcoming Events" buttons

### Message Button Removal
- **Removed Message button from ManageArtistScreen**: Simplified the UI by removing the problematic Message button
  - Button was too complex to implement with proper state management
  - Users can message artists through other screens (profile view, search results)
  - Cleaner artist info bar with just avatar, name, and location

### Document Management System Implementation
- **Link-Based Document Management**: Implemented flexible document system for ManageArtistScreen Documents tab
  - **Three Categories**: Press Kit, Technical Rider, Contracts
  - **Add/Edit/Delete Functionality**: Full CRUD operations for document links
  - **External Link Support**: Google Drive, Dropbox, WeTransfer, or any cloud storage URL
  - **Clean UI Design**:
    - Section headers with "+ Add Link" button
    - Info notes explaining each category purpose
    - Empty states with helpful CTAs
    - Document cards showing title, clickable URL (truncated if long), and added date
    - Edit and Delete buttons for each document
  - **Add/Edit Modal**:
    - Document Title field (required)
    - Document URL field (required)
    - Helper text explaining cloud storage options
    - Cancel and Save/Add buttons
  - **Delete Confirmation**: Confirmation dialog before removing documents
  - **State Management**: Local state in ManageArtistScreen (frontend-only for now)

- **Data Structure**:
  ```javascript
  documents: {
    pressKit: [{ id, title, url, addedDate }, ...],
    technicalRider: [{ id, title, url, addedDate }, ...],
    contracts: [{ id, title, url, addedDate }, ...]
  }
  ```

- **Why Link-Based Approach**:
  - ✅ Simple to implement - no file storage needed
  - ✅ Flexible - artists can organize however they want
  - ✅ No file upload complexity or storage costs
  - ✅ Works with existing workflows (most pros use Drive/Dropbox)
  - ✅ Easy to share and collaborate
  - ✅ Version control managed by artists
  - ✅ No file size limits

- **Future Enhancements** (Post-Launch):
  - Backend API integration to persist documents
  - PDF direct upload with cloud storage (AWS S3, Cloudinary)
  - File viewer/preview in the app
  - Version history tracking
  - Per-booking contract customization
  - Digital signature workflow integration

### Known Issues
1. **Calendar Sync**: Changes between CalendarScreen and ManageArtistScreen may not immediately reflect without page refresh

## Recent Updates (January 11-12, 2026)

### PM2 Process Manager Installation and Configuration
- **Installed pm2 globally**: Professional Node.js process manager for persistent server operation
- **Configured Auto-Start on Reboot**: Set up LaunchAgent for macOS to auto-start servers on boot
- **Server Stability**: Both frontend and backend now survive terminal closing, computer sleep, and reboots
- **Configuration File**: Created `ecosystem.config.js` with settings for both tora-frontend and tora-backend
- **Benefits**:
  - Servers keep running when terminal is closed
  - Auto-recovery if servers crash
  - Auto-restart on computer reboot (after running sudo startup command)
  - Easy management with `pm2 status`, `pm2 logs`, `pm2 restart all`
- **Location**: pm2 manages processes from `~/.pm2/` directory

### ManageArtistScreen - Artist Info Tab Restructure
- **Added 4th Tab "Documents"**: Separated documentation from artist information
  - Moved Press Kit, Technical Riders, Contract Templates to Documents tab
  - Clean separation of concerns between profile data and documentation
- **Completely Rebuilt Artist Info Tab**: Now mirrors EditProfileScreen functionality
  - Agent can edit ALL fields that artist can edit in their own profile
  - Changes made by agent sync bidirectionally with artist's actual profile
- **Full Profile Fields Available**:
  - Basic Info: Name, Role, Location, Capacity (venues), Bio
  - Genres: Multi-select with collapsible dropdown (12 visible, "Show all" expands)
  - Social Links: SoundCloud/Mixtape, Spotify, Resident Advisor, Instagram, Website
- **Edit Modal Improvements**:
  - Structured with sections: "Basic Information", "Genres", "Social Links"
  - Genres use proper dropdown UI with "X genres selected" indicator
  - Helper text hints for SoundCloud/Spotify URLs (💡 share link instructions)
  - Scrollable modal with proper spacing and styling matching EditProfileScreen
- **State Management**:
  - `editedArtistInfo` tracks all profile fields
  - `selectedGenres` manages genre selection as Set
  - `showGenresDropdown` and `showAllGenres` control genre UI state
  - `useEffect` syncs edited info when artistProfile updates
- **Header Sync Fix**: Artist Info Bar now uses `artistProfile` state instead of `artist` prop
  - Name, location, and avatar update immediately when changes are saved
  - Fixed issue where header showed old location after editing

### Files Modified
- `ManageArtistScreen.js`:
  - Added 4th tab "Documents" with press kit, riders, contracts
  - Rebuilt Artist Info tab with full profile editing capability
  - Added comprehensive edit modal matching EditProfileScreen structure
  - Fixed header to display updated artistProfile data
  - Lines 1670-1683: Updated Artist Info Bar to use artistProfile state
- `ecosystem.config.js`: NEW - pm2 configuration for both servers
- Added imports: `genresList` from profiles data

### Key Features
- **Bidirectional Sync**: Agent edits reflect in artist's profile immediately
- **Complete Control**: Agent can edit all profile fields artist has access to
- **Professional UI**: Matches artist's own edit experience
- **Persistent Servers**: pm2 ensures servers stay running indefinitely

## Recent Updates (January 9, 2026)

### Calendar Travel Schedule Fixes - ID Mismatch Resolution
- **Issue**: Travel schedule edit and delete functions were not working in CalendarScreen
- **Root Cause**: MongoDB backend schedules use `_id` field, while frontend schedules use `id` field
- **Files Fixed**:
  - `CalendarScreen.js`:
    - Line 339: Updated overlap detection to check both `schedule.id` and `schedule._id` when skipping edited schedule
    - Lines 466-469: Fixed delete filter to check both `s._id` and `s.id` when removing schedule
    - Line 774: Updated delete button to pass `schedule._id || schedule.id` instead of just `schedule.id`
  - `ManageArtistScreen.js`: Already had correct ID handling from previous session

### Environment Variable and Cache Issues
- **Backend Server Loop Issue**: Backend was stuck in infinite loop processing messages, preventing API responses
  - Fixed by restarting backend server cleanly
- **React Environment Variables**: Cleared cache (`rm -rf node_modules/.cache`) caused React to lose environment variables
  - React only reads `.env` at startup, not during runtime
  - Solution: Explicitly passed environment variables when starting React:
    ```bash
    REACT_APP_API_URL=http://192.168.2.108:5001/api HOST=0.0.0.0 PORT=3001 npm start
    ```
- **Login Issue**: User account password was forgotten from October 2025 account creation
  - Reset password to `password123` using bcrypt hash in MongoDB

### Key Learnings
- **Always restart React after clearing cache** to ensure environment variables are reloaded
- **ID field inconsistency**: Backend MongoDB uses `_id`, frontend generates `id`, all comparisons must check both
- **Three places to check for ID issues**: filter conditions, button onClick handlers, and comparison logic

### Configuration Status
- **Frontend**: http://192.168.2.108:3001 (accessible from network)
- **Backend**: http://192.168.2.108:5001 (responsive)
- **Database**: Local MongoDB at localhost:27017/tora (fast performance)
- **CORS**: Configured to allow 192.168.2.108:3001

### Fixed Functionality
- ✅ Travel schedule editing in CalendarScreen
- ✅ Travel schedule deletion in CalendarScreen
- ✅ Login authentication working
- ✅ Environment variables properly loaded
- ✅ Backend responding to API requests

## Recent Updates (January 7, 2026)

### Delete Confirmation Popup Implementation
- **CalendarScreen.js**: Added delete confirmation modal for travel schedules
  - New state: `showDeleteConfirmation`, `scheduleToDelete`
  - Modified `handleRemoveSchedule()` to show confirmation dialog instead of immediate deletion
  - Added `confirmDeleteSchedule()` function to perform deletion after user confirmation
  - Added `cancelDeleteSchedule()` function to dismiss confirmation dialog
  - Modal asks: "Are you sure you want to delete this travel schedule?"
  - Two buttons: "Cancel" (secondary) and "Delete" (danger/red)
  - Deletion only occurs after explicit user confirmation

- **ManageArtistScreen.js**: Added identical delete confirmation modal
  - Same confirmation flow for agent's manage artist calendar
  - Consistent UX across both calendar views
  - Proper error handling and state cleanup after deletion

### Network Configuration and Deployment Fixes
- **IP Address Management**: Addressed WiFi network changes causing connection issues
  - Current IP: 192.168.2.108 (updated from 192.168.2.103)
  - Attempted hostname approach (`MBPdiAlessandro.local`) but `.local` resolution not working on system
  - Using direct IP address in `.env` file for now
  - **Known Limitation**: IP address needs manual update when changing WiFi networks

- **MongoDB Configuration**: Switched to MongoDB Atlas (cloud) temporarily
  - Local MongoDB has version compatibility issue (database created with v8.2, installed version is v8.0.15)
  - Backend `.env` configured to use Atlas: `mongodb+srv://acastelbuono:Michael-23!@tora.zwmh1nr.mongodb.net/tora`
  - Connection confirmed: `ac-tftb7hf-shard-00-00.zwmh1nr.mongodb.net`
  - All data safely stored in cloud database
  - **Future Task**: Fix local MongoDB version compatibility for better performance

- **React Dev Server Configuration**:
  - Removed `proxy` setting from `package.json` (was causing API request failures)
  - Removed `HOST=0.0.0.0` from npm start script (was breaking proxy functionality)
  - Frontend now uses direct API URL from `.env`: `REACT_APP_API_URL=http://192.168.2.108:5001/api`
  - **Current State**: App accessible on PC at `http://localhost:3001`
  - **Limitation**: Not yet configured for simultaneous PC and phone access

### Environment Configuration
- **Frontend (.env)**:
  ```
  REACT_APP_API_URL=http://192.168.2.108:5001/api
  ```

- **Backend (.env)**:
  ```
  MONGODB_URI=mongodb+srv://acastelbuono:Michael-23!@tora.zwmh1nr.mongodb.net/tora?retryWrites=true&w=majority&appName=TORA
  ```

- **Package.json Changes**:
  - Removed: `"proxy": "http://localhost:5001"`
  - Modified start script from `"HOST=0.0.0.0 react-scripts start"` to `"react-scripts start"`

### Known Issues to Address
1. **Calendar Sync**: Changes between CalendarScreen and ManageArtistScreen may not immediately reflect without page refresh
2. **Phone Access**: App not yet accessible from phone on same network (needs `HOST=0.0.0.0` with proper proxy configuration)
3. **IP Address Dependency**: Requires manual `.env` update when switching WiFi networks (hostname approach didn't work)
4. **Local MongoDB**: Version compatibility issue prevents using local database (needs upgrade from v8.0.15 to v8.2+ or database downgrade)

## Recent Updates (December 15, 2025)

### MongoDB Atlas Performance Optimization
- **Database Indexes**: Created indexes on User and Profile collections for faster queries
  - User indexes: email (unique), lastLogin
  - Profile indexes: user, role, city, country, isPremium, genres
  - Compound indexes for common query patterns
- **Connection Pooling**: Configured MongoDB connection with optimized pool settings
  - Max pool size: 10 connections, Min pool size: 2 connections
  - Socket timeout: 45s, Server selection timeout: 5s
- **Query Optimization**: Added `.lean()` to profile queries for 5-10x faster response
  - Returns plain JavaScript objects instead of Mongoose documents
  - Significantly reduces memory usage and processing time
- **Data Compression**: Enabled zlib compression for faster data transfer over network
- **Available Dates Sync**: Fixed calendar green dots not syncing across devices
  - Changed to instant save on each date click instead of only on close
  - Ensures real-time cross-device synchronization

### Calendar & Schedule System Fixes (December 12, 2025)
- **Cross-Device Persistence**: Fixed calendar and travel schedules syncing across PC and phone
  - Resolved field name mismatch: backend uses `travelSchedule`, frontend was using `schedules`
  - Fixed Profile model `toJSON()` to include `_id` field explicitly
  - Updated `.env` to use network IP (192.168.2.100:5001) for cross-device API access
- **Calendar Navigation**: Added previous/next month navigation buttons with centered month/year display
- **Date Formatting**: Implemented `formatDate()` helper to display dates in YYYY-MM-DD format instead of ISO strings
- **Instant UI Updates**: Calendar closes immediately after clicking X, then saves to backend in background
- **Schedule Display**: Proper location labels (City → Country → Zone priority) and formatted dates in schedule cards
- **State Synchronization**: Added useEffect to keep local schedules state in sync with context updates

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

### Connection Request Flow Updates (December 2025)
- **Agent Representation Modal**: Artists represented by agents now show connection choice modal
  - Two options: Connect with Agent (for booking inquiries) or Connect with Artist (for collaboration)
  - Simplified message modal design - removed profile card display
  - Custom message input for both agent and artist connections
  - Uses app-standard SVG line icons (info, handshake, user)
- **Sent Requests Visibility**: Connection requests now appear immediately in sender's mailbox
  - Backend filtering updated to show PENDING sent requests in conversations
  - Chat displays sent request message but disables input until accepted
  - Message: "Connection request pending. You can send messages once [Name] accepts your request."
  - Full messaging enabled once request is accepted
- **Custom Message Handling**: User's custom message properly sent instead of default template
  - Fixed ViewProfileScreen to pass userMessage parameter correctly
  - Custom message preserved across agent and artist connection flows

### Bug Fixes
- Fixed overlapping buttons in ViewProfileScreen
- Corrected spacing between profile elements
- Fixed Spotify embed display issues
- Separated sent/received connection requests properly
- Fixed profile data mismatch in calendar matches
- Fixed connection status detection (checks both CONNECTED and CONNECTION_REQUEST types)
- Fixed backend message filtering to correctly identify sent vs received connection requests
- Fixed agent location display in connection modals using populated profile data
- Fixed travel schedule date formatting (ISO → YYYY-MM-DD format)
- Fixed travel schedule edit functionality to prevent data loss
- Fixed calendar edit errors with proper date formatting for HTML inputs
- Added travel schedule auto-refresh between CalendarScreen and ManageArtistScreen
- Fixed ManageArtistScreen to scroll to top and show latest revenue data on load

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

## Known Issues

### Calendar Synchronization (To be fixed in next session)
- **Issue**: Calendar data (available dates and travel schedules) not syncing perfectly between CalendarScreen and ManageArtistScreen
- **Status**: Partial implementation completed
  - ✅ Available dates save and sync between screens
  - ✅ Travel schedules display with location labels on both calendars
  - ✅ Date formatting fixed (YYYY-MM-DD instead of ISO format)
  - ✅ Edit functionality working in both screens
  - ⚠️ Sync timing issues remain - changes may not immediately reflect
- **Next Steps**:
  - Improve real-time sync mechanism between screens
  - Add proper state invalidation when switching between screens
  - Consider using shared state or event system for calendar updates

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

## Recent Updates (February 25, 2026)

### Edit Profile Screen Scrolling Fix
- **Issue**: Edit Profile screen could scroll with keyboard arrows but not with mouse wheel
- **Root Cause**: CSS specificity conflict - `.screen.active` display: block was overriding `.edit-profile-screen` display: flex
- **Solution**: Changed to fixed positioning with proper overflow handling
  - [App.css:2231-2244](src/styles/App.css#L2231-L2244): Added `position: fixed` with full viewport coverage
  - [App.css:2273-2282](src/styles/App.css#L2273-L2282): Changed `overflow-y: auto` to `overflow-y: scroll` for proper mouse wheel capture
  - Added `max-height: calc(100vh - 60px)` for proper scroll calculation
- **Result**: Edit Profile now scrolls with both mouse and keyboard, showing all sections (genres, social links, buttons)

### Tour Screen (Calendar Match) Scrolling Fix
- **Issue**: Calendar Match tab couldn't scroll on any device - content appeared cut off
- **Root Cause Analysis**:
  - Element had classes: `screen active matches-screen tour-screen`
  - `.screen.active` (specificity 020) set `display: block`
  - `.tour-screen` (specificity 010) set `display: flex`
  - Higher specificity `.screen.active` won, breaking flex layout and child scrolling
- **Solution**: Increased CSS specificity and added proper constraints
  - [App.css:11040-11047](src/styles/App.css#L11040-L11047): Changed selector to `.tour-screen.screen.active` (specificity 030)
  - Added `display: flex !important` to override block display
  - Added `min-height: 0 !important` to remove height constraint from `.screen` class
  - [App.css:11049-11054](src/styles/App.css#L11049-L11054): Changed `.tour-tab-content` overflow-y from `auto` to `scroll`
- **Result**: Calendar Match tab now scrolls properly on both PC (mouse) and mobile (touch)

### Calendar Match Date Display Fix
- **Issue**: Match cards showing "undefined NaN, NaN" for dates and locations
- **Root Cause**:
  - Dates stored as `'2026-1-28'` (single-digit month) instead of `'2026-01-28'`
  - JavaScript Date constructor doesn't parse single-digit format correctly
  - `match.location` was undefined (should be `match.profile.location`)
- **Solution**:
  - [TourScreen.js:134-140](src/components/screens/TourScreen.js#L134-L140): Added `normalizeDate()` function to pad single-digit months/days
  - [TourScreen.js:147](src/components/screens/TourScreen.js#L147): Apply normalization before sorting dates
  - [TourScreen.js:373](src/components/screens/TourScreen.js#L373): Changed `match.location` to `match.profile.location`
- **Result**: Match cards now display proper dates (e.g., "Feb 22-28, 2026") and locations (e.g., "Tokyo, Japan")

### Tour Screen UI Improvements
- **Tab Label**: "Calendar Matches" (plural) - final version
  - [TourScreen.js:529](src/components/screens/TourScreen.js#L529): Tab label text
- **Tab Height Increase**: Made tabs taller to accommodate two-line text wrapping
  - [App.css:11008, 11021](src/styles/App.css#L11008): Increased padding from `12px` to `20px` and added `min-height: 56px`
  - Maintains consistent tall height even when text wraps
- **Clickable Match Cards**: Added visual feedback for profile viewing
  - [App.css:5109-5116, 5224-5231](src/styles/App.css#L5109-L5116): Added hover styles for `.match-avatar.clickable` and `.match-info.clickable`
  - Cursor pointer and opacity change on hover

### Calendar Matches Profile Viewing
- **Issue**: Clicking match cards showed black screen
- **Root Cause**: TourScreen was passing `profileId` string, but ViewProfileScreen expects full `profile` object
- **Solution**:
  - [TourScreen.js:264-285](src/components/screens/TourScreen.js#L264-L285): Added logic to find and pass full profile object from calendarMatches
  - Added console logging for debugging
  - ViewProfileScreen now receives complete profile data
- **Result**: Clicking on match card avatar or info section opens full profile with all details

### Calendar Matches Disclaimer Update
- **Updated Text**: Changed disclaimer to mention genre matching
  - [TourScreen.js:331](src/components/screens/TourScreen.js#L331): "Find professionals with matching travel schedules, availability, and music genres"
  - Makes it clear that matches require common music genres

### Tour Kickstart Feature Implementation
- **Premium Feature**: Tour Kickstart is only available for Premium users
- **Role-Based Views**: Different interfaces based on user role (Artist, Promoter/Venue, Agent)
- **Artist View**: "My Tours" section with Create Tour functionality
  - Create Tour modal with comprehensive form (zone, dates, min gigs, target cities, fee expectations, notes)
  - Tour cards displaying zone, dates, status badges, proposals count, target cities
  - Empty state when no tours created
  - [TourScreen.js:25-36](src/components/screens/TourScreen.js#L25-L36): Added Tour Kickstart state management
  - [TourScreen.js:500-651](src/components/screens/TourScreen.js#L500-L651): Create Tour modal implementation
  - [TourScreen.js:698-759](src/components/screens/TourScreen.js#L698-L759): Artist view with tour cards rendering
- **Promoter/Venue View**: "Tour Opportunities" section with filters
  - Filter by zone (Europe, Asia, Americas, Africa, Oceania)
  - Filter by genre (House, Techno, Drum & Bass)
  - Empty state showing "No active tours in your region"
  - [TourScreen.js:762-797](src/components/screens/TourScreen.js#L762-L797): Promoter/Venue view implementation
- **Agent View**: Not applicable message (agents use artist management screens)
  - [TourScreen.js:799-811](src/components/screens/TourScreen.js#L799-L811): Agent fallback view
- **CSS Styling**:
  - [App.css:11229-11281](src/styles/App.css#L11229-L11281): Create Tour modal form styling
  - [App.css:11283-11397](src/styles/App.css#L11283-L11397): Tour cards and status badges styling
  - Responsive form layout with grid for date inputs
  - Hover effects and visual feedback
  - Status badges with color coding (green for ACTIVE)
- **Tour Data Structure**:
  - id, artist (name, location, avatar), zone, startDate, endDate
  - minGigs, targetCities[], feeExpectation, additionalNotes
  - status, proposalsCount, createdAt
- **Form Validation**: Required fields must be filled before submission
- **State Management**: Local state with useState, ready for backend integration
- **Premium Gate**: Non-premium users see upgrade prompt with feature benefits
- **Terminology**: Uses "Zone" instead of "Region" to match other filters throughout the app (Europe, Asia, Americas, Africa, Oceania)

### Create Tour Modal - Mobile Visibility Fixes
- **Issue**: Modal header and footer were covered by app header and bottom tab bar on mobile
- **Root Cause**: Modal rendered inside TourScreen div, creating stacking context that prevented z-index from working
- **Solution**: Used React Portal to render modal at document.body level
  - [TourScreen.js:2](src/components/screens/TourScreen.js#L2): Added ReactDOM import
  - [TourScreen.js:654](src/components/screens/TourScreen.js#L654): Used `ReactDOM.createPortal(modalContent, document.body)`
  - Created dedicated `.create-tour-modal-overlay` class with z-index: 2000
  - Added mobile-specific padding with `env(safe-area-inset)` for notched devices
  - [App.css:11230-11242](src/styles/App.css#L11230-L11242): Modal overlay styling
  - [App.css:11292-11298](src/styles/App.css#L11292-L11298): Mobile responsive overlay styles
- **Date Input Spacing**: Improved spacing between Start Date and End Date fields
  - Desktop: 20px gap between inputs, modal 700px wide
  - Mobile: 12px gap, inputs stay side-by-side, modal uses 95% width
  - [App.css:11273-11275](src/styles/App.css#L11273-L11275): Form row grid with proper gap
- **Modal Structure**: Flexbox layout matching Make Offer modal exactly
  - Fixed header at top (always visible)
  - Scrollable body in middle (flex: 1, overflow-y: auto)
  - Fixed footer at bottom (always visible)
  - Added 24px padding-bottom to header for spacing below title
  - Added 24px padding-top to body for spacing above first field
  - [App.css:11255-11271](src/styles/App.css#L11255-L11271): Modal sections styling
- **Result**: Modal works perfectly on all devices, header and footer always visible, matches Make Offer modal behavior

### No Matches Tips Enhancement
- **Genre Matching Tip**: Added tip to ensure all relevant music genres are flagged in profile
  - [TourScreen.js:465-468](src/components/screens/TourScreen.js#L465-L468): Added SlidersIcon with genre tip
  - Helps users understand that genre matching is required for calendar matches

### Technical Details
- **CSS Specificity**: Used proper selector specificity to override base screen classes
- **Overflow Behavior**: Changed from `auto` to `scroll` forces scrollbar and captures mouse events properly
- **Date Normalization**: Converts `YYYY-M-D` to `YYYY-MM-DD` format for reliable Date parsing
- **Fixed Positioning**: Full-screen overlays use fixed positioning for reliable cross-device behavior
- **Modal Composition**: Reusable modal patterns with overlay click-to-close and stopPropagation on modal content
- **Form State**: Single form object with spread operator for efficient state updates

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

## Recent Updates (November 20, 2025)

### Bidirectional Representation Request System
- **Artist-Agent Representation Flow**: Complete bidirectional system for representation requests
  - **Agent → Artist**: Agents can send representation requests to artists
  - **Artist → Agent**: Artists can send representation requests to agents
  - **Accept/Decline**: Only the receiver can accept or decline the request
  - **Bidirectional Updates**: Both profiles update correctly regardless of who sends/accepts
- **representingArtists Array**: Agent profiles have embedded artist data
  - Source of truth for accepted representation relationships
  - Contains: profileId, name, location, avatar, genres, contact info
  - Automatically updated when representation request is accepted
  - Used by RepresentedArtistsScreen to display roster
- **Search Modal Integration**: SearchArtistsModal and SearchAgentsModal properly display representation status
  - Button changes to "✓ Represented" in green (btn-success) when relationship is established
  - Checks both representingArtists array AND ACCEPTED requests for backward compatibility
  - Real-time status updates after acceptance
  - Force remount on modal open to fetch fresh data (key={Date.now()})
- **Chat Integration**: Representation requests can be accepted/declined from ChatScreen
  - System messages show representation request details
  - Accept/Decline buttons in chat interface
  - Calls reloadProfileData() after acceptance to sync state
  - Notifications sent to both parties
- **Backend Implementation**:
  - acceptRepresentation() method in Connection model handles both directions
  - Profile data cache invalidation after relationship changes
  - API endpoints: /api/connections/representation-request, /api/connections/accept-representation, /api/connections/decline-representation
  - Message integration for representation request flow
- **Button State Priority**: Clear hierarchy for button display
  1. ✓ Represented (green, disabled) - Accepted representation
  2. Declined (grey, disabled) - Request was rejected
  3. Requested (grey, disabled) - Pending connection request
  4. Pending (grey, disabled) - Pending representation request (if connected)
  5. Send Request (primary, active) - Can send representation request (if connected)
  6. Connect (primary, active) - Default state, can send connection request
- **Console Logging**: Comprehensive debug logging for troubleshooting
  - Request counts (sent, received, accepted)
  - representingArtists array contents
  - Connection status tracking
  - Profile data updates

## Recent Updates (November 17, 2025)

### Enhanced Agent Dashboard with KPIs
- **ManageArtistScreen Redesign**: Comprehensive dashboard showing key performance indicators for each artist
  - **Key Performance Indicators**: 4 hero metrics at top
    - Upcoming Gigs (count with date range)
    - Total Revenue YTD (currency with growth %)
    - Average Fill Rate (percentage with trend indicator)
    - Average Rating (star rating out of 5)
  - **Revenue Breakdown**: Quarterly revenue visualization
    - Q1-Q4 bars with actual vs target amounts
    - Progress bars showing completion percentage
    - Color-coded: green for on/above target, yellow for close, red for below
  - **Booking Pipeline**: Active booking stages visualization
    - Confirmed, Pending, In Discussion, Proposals counts
    - Visual progress through pipeline stages
  - **Top Markets**: Geographic performance breakdown
    - Top 4-5 markets with booking counts
    - Percentage of total bookings
    - Sortable by activity
  - **Upcoming Bookings**: Next 4-5 confirmed events
    - Date, venue, event name, fee
    - Status badges (Confirmed, Pending Payment, etc.)
    - Quick access to booking details
  - **Engagement Metrics**: Artist profile and communication stats
    - Total Followers count
    - Response Rate percentage
    - Active Proposals count
  - **Quick Actions**: 6 key management actions
    - Book New Gig, View Schedule, Financial Overview
    - Analytics, Contracts, Media Kit
    - Direct navigation to specialized screens
  - **Recent Activity Feed**: Timeline of latest actions
    - Chronological list of bookings, payments, messages
    - Timestamps and action icons
    - Quick context for recent developments
- **Design Implementation**:
  - Grid-based layout for desktop/tablet responsiveness
  - Card-based components with consistent styling
  - Color-coded status indicators and progress bars
  - Mock data for demonstration and testing
  - Professional data visualization with charts
- **Navigation Flow**:
  - RepresentedArtistsScreen shows simple artist cards (unchanged)
  - "Manage" button opens comprehensive dashboard
  - Dashboard includes quick actions to 6 specialized management screens
  - Maintains existing screen structure while adding KPI visibility

## Recent Updates (November 26, 2025)

### Representation Request Flow Simplification
- **Simplified Button Logic**: Streamlined representation request UX across search modals
  - **SearchAgentsModal** (Artist view): Always shows "Send Request" button
  - **SearchArtistsModal** (Agent view): Always shows "Send Request" button
  - Button is greyed out (btn-disabled) when not connected, active when connected
  - Info banner at top explains: "To send a representation request, you must be connected with the agent/artist first"
  - Clear button states with logical priority:
    1. ✓ Represented (green, disabled) - Accepted representation
    2. Declined (grey, disabled) - Request was rejected
    3. Pending (grey, disabled) - Pending representation request
    4. Send Request (greyed, disabled) - Not connected yet
    5. Send Request (active, enabled) - Connected and ready to send
- **Removed Complex State Tracking**: Eliminated need to track CONNECTION_REQUEST states across screens
  - Avoids caching issues and stale data
  - Cleaner, more maintainable code
  - Better user experience with always-visible CTAs

### Message Notification System Improvements
- **Badge Notifications for Requests**: Messages tab now shows red badge for all pending activity
  - **Unread Messages**: Counts unread messages in existing conversations
  - **Connection Requests**: Counts pending connection requests (CONNECTION_REQUEST with PENDING status)
  - **Total Badge Count**: Combined count of both message types
  - Badge updates in real-time when requests are sent/received
- **Backend Message Filtering**: Modified conversation endpoint to properly display representation requests
  - **REPRESENTATION_REQUEST Messages**: Always visible regardless of status (PENDING or ACCEPTED)
  - **CONNECTION_REQUEST Messages**: Only visible when status is ACCEPTED
  - Ensures representation requests appear immediately in Messages tab
  - Creates proper system messages for representation request flow
- **App.js Badge Logic**: Updated unread count calculation
  ```javascript
  const [conversations, requestsData] = await Promise.all([
    getConversations(),
    apiService.getReceivedRequests(user._id)
  ]);
  const conversationUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  const requestsCount = (requestsData.requests || []).length;
  const totalBadgeCount = conversationUnread + requestsCount;
  ```

### Chat Message Updates
- **Disconnection Message Clarity**: Updated disabled chat message text
  - Changed from: "You are no longer connected with {name}. You cannot send messages unless you reconnect."
  - Changed to: "You are not connected with {name}. You cannot send messages unless you connect."
  - More appropriate for all scenarios (never connected vs disconnected)
  - Clearer call-to-action for users

### Technical Implementation
- **Files Modified**:
  - `SearchAgentsModal.js` - Simplified button logic, added info banner
  - `SearchArtistsModal.js` - Same simplification pattern
  - `App.js` - Updated badge count to include connection requests
  - `ChatScreen.js` - Updated disabled message text
  - `messages.js` (backend) - Modified filter to allow REPRESENTATION_REQUEST messages
- **Design Approach**: Prioritized UX clarity over complex state management
  - Always-visible buttons with clear disabled states
  - Info banners for requirement explanation
  - Consolidated notification system
  - Better user feedback throughout request flow

### Connection Choice Modal Update (December 12, 2025)
- **Removed "RECOMMENDED" Badge**: Simplified the agent connection option in ConnectionChoiceModal
  - Removed the "Recommended" badge from the agent connection choice
  - Cleaner UI with less visual clutter
  - Users can still see agent option is for "booking inquiries" from the description
  - **Files Modified**: `ConnectionChoiceModal.js` - Removed badge div element

### Phase 1 Development Planning (December 12, 2025)
- **Backend Integration Roadmap**: Planned comprehensive backend integration for Agent Management
  - **Agent Management Dashboard**: Dashboard metrics (Upcoming Gigs, YTD Revenue) to be connected to backend deals/bookings
  - **Events Management**: Calendar and event tracking to use real booking data
  - **Artist Info Management**: Contact info, press kit, and technical riders from database
  - **Priority**: Agent management backend integration is highest priority for Phase 1
  - **Note**: Initial API integration attempt was rolled back due to connectivity issues; will be implemented properly in future update with proper error handling and testing

### Revenue Overview Enhancement (December 12, 2025)
- **ManageArtistScreen Dashboard Updates**: Enhanced revenue tracking with real data integration
  - **Section Order**: Swapped Action Required and Revenue Overview sections - revenue now appears first
  - **Horizontal Scrolling**: Revenue chart now scrolls horizontally to accommodate all months from 2024 onwards
    - Custom scrollbar styling (6px height, dark theme colors)
    - Touch-optimized scrolling with `-webkit-overflow-scrolling: touch`
    - min-width: max-content ensures all columns are visible
  - **Real Data Integration**: Chart connected to actual artist deal data from backend
    - Fetches all deals with COMPLETED or past ACCEPTED status
    - Groups revenue by month/year starting from January 2024
    - Applies currency conversion to preferred currency using exchange rates API
    - Updates in real-time when currency selector changes
  - **Chart Design Improvements**:
    - Uniform column width: 48px for all bars (previously variable)
    - Chart height: 280px (doubled from original 140px)
    - Number format: Rounded thousands (e.g., "13K" instead of "13.0K")
    - Year labels: Displayed in light grey (#666, 9px font) below each month name
    - Proper spacing: 10px gap between columns
  - **Helper Function**: Added `getCurrencySymbol()` to display proper currency symbols (USD: $, EUR: €, GBP: £, JPY: ¥)
  - **Month Generation**: Creates complete month array from 2024-01 to current month with zero-fill for months without revenue
  - **Empty State**: Shows "Loading revenue data..." when chart data is being fetched

- **Technical Implementation**:
  - **Files Modified**:
    - `ManageArtistScreen.js` - Added revenueChartData state, extended useEffect for data calculation
    - `App.css` - Added .revenue-chart-scroll wrapper, updated chart container styling, added year label styles
  - **Data Flow**:
    1. Fetch deals from backend on component mount
    2. Filter for historical deals from 2024 onwards (COMPLETED or past ACCEPTED)
    3. Group by month/year and convert fees to preferred currency
    4. Generate complete month array from 2024-01 to present
    5. Calculate heights as percentage of max revenue
    6. Render bars with currency symbol and formatted values

- **Performance Considerations**:
  - MongoDB Atlas network latency causes slower load times (inherent to cloud database)
  - Currency conversion happens client-side using exchange rates API
  - Chart recalculates when currency preference changes

## Recent Updates (January 14, 2026)

### Artist Info Tab Redesign in ManageArtistScreen
- **Layout Restructure**: Complete redesign of Artist Info tab to match ProfileScreen visual style
- **Profile Info Box**: Added lean, compact profile information section with dark background
  - Name, location, role, and genres in single box (#1a1a1a background)
  - Left-aligned text with minimal spacing
  - Comma-separated genres instead of pills
  - Same styling as bio section for visual consistency
- **Media Embeds**: Proper embedded players for artist content
  - SoundCloud embed with helper function for URL conversion
  - Spotify embed with artist ID extraction
  - Resident Advisor events section with "View Upcoming Events" button
- **Section Order**: Profile Info → Bio → Latest Mix → Spotify Artist → Events → Social Links
- **Social Links**: Instagram and Website as equal-width side-by-side buttons
- **Consistent Styling**:
  - Uppercase red section headings (#ff3366, 12px, letter-spacing)
  - 24px spacing between sections
  - 12px spacing between headings and content
  - Dark background boxes (#1a1a1a) for info sections
- **Helper Functions**:
  - `getSoundCloudEmbedUrl()` - Converts SoundCloud URLs (including mobile) to embed format
  - `getSpotifyEmbedUrl()` - Extracts artist ID and creates Spotify embed URL

## Recent Updates (January 25, 2026)

### Document Attachment System in Chat
- **Feature**: Send profile documents (Press Kit, Technical Rider, Contracts) directly in chat
- **Artist Flow**: Click paperclip → See own documents → Send
- **Agent Flow**: Click paperclip → Select represented artist → See artist's documents → Send
- **Implementation**:
  - Frontend: Paperclip button in chat input, document picker modal
  - Backend: `POST /api/messages/send-document` endpoint
  - Message Model: Added `documentAttachment` field (id, title, url, category)
  - Document messages display with file icon, title, category badge, and "Open Document" button
- **Agent Support**: Agents can select which artist's documents to send
  - Fetches full artist profile with documents using `apiService.getProfile()`
  - Loading state while fetching profile data
  - Shows artist selector → document list with back button
- **UI Styling**:
  - Attachment button: 32px circular, transparent with pink hover
  - Document messages: Wider bubble (320px max), distinct styling
  - "Open Document" button: Semi-transparent white background for visibility on pink bubbles

### UI Refinements
- **Search Agent Modal**: Representing agent shown at top with "Remove" button (compact)
  - Reduced padding: 8px 10px (from 10px 12px)
  - Smaller label font: 9px (from 10px)
  - Tighter border radius: 6px (from 8px)
- **Profile Badge**: "Represented by" moved below Instagram/Website CTAs
- **Message Bubbles**: More compact padding (10px 12px instead of 12px 16px)

## Upcoming Development - Booking Workflow Enhancement (MVP Phase)

### Planned Features (Next 4-5 weeks)

#### Sprint 1: Contract Management (1-2 weeks)
- Add contract status tracking to Deal model
- Contract states: NOT_SENT → SENT → ARTIST_SIGNED → VENUE_SIGNED → FULLY_SIGNED
- "Send Contract" button after booking acceptance
- Select contract from profile documents or upload new
- Digital signature flow (checkbox confirmation)
- Contract status badges in booking cards
- Chat system messages for contract events

#### Sprint 2: Document Sharing Integration (1 week)
- Add documents tracking to Deal model (pressKit, technicalRider)
- "Share Documents" section in booking details
- Integration with existing document attachment system
- Document received confirmations
- Document status badges in booking cards

#### Sprint 3: Payment Tracking (1 week)
- Add payment status to Deal model
- Payment states: PENDING → DEPOSIT_PAID → FULLY_PAID
- "Mark as Paid" button for venue
- "Confirm Payment Received" for artist/agent
- Payment method dropdown and notes
- Auto-complete deal when payment confirmed

#### Sprint 4: Workflow Integration & Polish (1 week)
- Unified booking status timeline UI
- Progress indicator showing all steps
- Reminder notifications for pending actions
- Booking completion celebration screen
- Archive completed bookings

### Post-MVP Features (Future)
- Advanced payment processing (Stripe/escrow integration)
- E-signature integration (DocuSign, HelloSign)
- Event day management checklist
- Advanced analytics & insights
- Insurance & liability integration

### Design Principles
- Use existing SVG icon system (stroke-based, matching app style)
- Dark theme with pink accents (#FF3366)
- Compact, professional UI
- Clear status progression
- Mobile-first responsive design

## Recent Updates (February 5, 2026)

### Contract Document Management System
- **Documents Tab PDF Upload**: Implemented full PDF upload functionality in ManageProfileScreen Documents tab
  - Created new backend endpoint `/api/contracts/upload-document` for standalone document uploads
  - Documents are uploaded to server and get permanent URLs
  - Fixed contract storage to use actual file URLs instead of File objects
- **Contract Selection Modal**: Enhanced AddContractModal with "Select Existing" tab
  - Shows all contracts from user's Documents tab
  - Scrollable list with contract titles and URLs
  - Checkbox selection for easy picking
- **Contract Sending Flow**: Complete workflow for sending contracts from existing documents
  - Available in ChatScreen (after accepting offers)
  - Available in BookingsScreen (for accepted bookings)
  - Sends contracts with valid file URLs
- **PDF Viewing Fix**: Fixed "Open Document" button to correctly open PDFs
  - Frontend: Added `getFullUrl()` helper to convert relative URLs to full backend URLs with authentication
  - Frontend: Appends `?profileId=XXX&token=YYY` query parameters for authentication
  - Backend: Modified auth middleware to accept token from query parameters (for new tab file opens)
  - Backend: Modified file endpoint to serve standalone documents (not just deal-attached contracts)
- **Authentication for File Downloads**: Solved issue where PDFs couldn't be opened in new tabs
  - Query parameter authentication allows authenticated file access in new browser tabs
  - Backend validates user and checks authorization before serving files

### Technical Implementation Details

**Frontend Files Modified:**
- `src/components/common/AddContractModal.js` - Added "Select Existing" tab with contract list UI
- `src/components/screens/ManageProfileScreen.js` - Implemented PDF upload using new backend endpoint
- `src/components/screens/ChatScreen.js` - Added `getFullUrl()` helper for authenticated file URLs
- `src/components/screens/BookingsScreen.js` - Integrated contract selection with existing contracts
- `src/services/contractService.js` - Added `uploadDocument()` function for standalone uploads

**Backend Files Modified:**
- `tora-backend/src/routes/contracts.js` - Added `/upload-document` endpoint, modified file serving logic
- `tora-backend/src/middleware/auth.js` - Added query parameter token support for file downloads

**Key Technical Changes:**
1. **New Upload Endpoint**: `POST /api/contracts/upload-document` - uploads PDFs without requiring dealId
2. **Enhanced File Serving**: `GET /api/contracts/files/:filename` - serves both deal contracts and standalone documents
3. **Query Auth Support**: Auth middleware now checks `req.query.token` as fallback for Authorization header
4. **URL Construction**: Frontend converts relative URLs (`/api/contracts/files/...`) to full URLs with auth params

### Contract Workflow Status
✅ **Working Features:**
1. Upload PDF contracts in Documents tab → Saved with server URL
2. Select existing contracts when sending from Chat or Bookings
3. Send contracts to other parties with valid file references
4. Open and view PDFs in new browser tab with authentication
5. Contract data persists across devices and sessions

### Known Issues Resolved
- ~~Contract uploads failing with MongoDB ObjectId error~~ - Fixed by creating separate document upload endpoint
- ~~"Open Document" button opening React app homepage~~ - Fixed with full URL construction and query auth
- ~~PDFs not accessible due to 401 Unauthorized~~ - Fixed with token in query parameters
- ~~Contracts with null URLs~~ - Fixed by properly uploading files and storing server URLs

## Recent Updates (February 15, 2026)

### UI/UX Improvements
- **Calendar Spacing**: Added consistent 32px margin-top before "Travel Schedule" and "Upcoming Events" sections across all roles
  - Updated `.dashboard-section`, `.schedules-header`, and `.travel-schedules-section` CSS classes
  - Fixed inconsistency where Travel Schedules had 24px margin while Upcoming Events had 32px
  - All sections now have uniform spacing for better visual hierarchy

- **Calendar Available Dates Styling**: Changed agent dashboard calendar from solid green to transparent green
  - Updated `.calendar-day.available` CSS to use `rgba(76, 175, 80, 0.2)` instead of solid `#00c853`
  - Matches styling across all roles (Artists, Promoters, Venues, Agents)
  - Consistent transparent green for available dates throughout the app

- **Agent Dashboard Section Order**: Swapped "Actions Required" and "Revenue Overview" sections
  - "Actions Required" now appears first (more urgent items)
  - "Revenue Overview" appears second
  - Fixed typo: "Action Required" → "Actions Required"

### Promoter/Venue Document Management System
- **Simplified Documents Tab**: Implemented streamlined document management for Promoters and Venues
  - **Artists/Agents**: Keep categorized system (Press Kit, Technical Rider, Contracts)
  - **Promoters/Venues**: Use simplified flat list with general description
  - Description: "Add important documents like contracts, licenses, permits, insurance, financial records, technical specs, etc."
  - Button text: "+ Add" (simplified from "+ Add Document")

- **Backend Support**: Updated Profile model to support both document structures
  - `pressKit`, `technicalRider`, `contracts` arrays for Artists/Agents
  - `general` array for Promoters/Venues
  - Schema supports all roles with appropriate fields

- **State Management**: Fixed complex role-based document handling
  - Conditional initialization based on `isPromoterOrVenue` flag
  - Separate handlers for flat array (Promoters/Venues) vs categorized object (Artists/Agents)
  - `useEffect` syncs documents only on user ID change (not every data update)
  - Prevents document state from being overwritten after successful saves

- **Bug Fixes**:
  - Fixed `documents.map is not a function` error for Promoters/Venues
  - Fixed `Cannot read properties of undefined (reading 'push')` error in AddContractModal
  - Fixed documents not appearing in list after adding (state sync issue)
  - Updated `AddContractModal` onSave handler to support both array and object structures

### Calendar Screen Updates
- **Role-Based Calendar Display**: Implemented different calendar views for Promoters/Venues
  - **Promoters/Venues**: See "Upcoming Events" list instead of "Travel Schedules"
  - **Artists/Agents**: Keep original "Travel Schedules" functionality
  - Both roles see same embedded calendar with green available dates
  - Upcoming events show expandable cards with booking details

- **Files Modified**:
  - `CalendarScreen.js` - Added role detection and conditional rendering
  - `ManageProfileScreen.js` - Implemented role-based document management
  - `ManageArtistScreen.js` - Swapped section order, fixed title typo
  - `App.css` - Updated spacing, calendar styling, section margins
  - `Profile.js` (backend) - Added `general` documents array for Promoters/Venues

### Technical Implementation
- **State Management**: Smart initialization based on user role
  ```javascript
  const getInitialDocuments = () => {
    if (isPromoterOrVenue) {
      return user?.documents?.general || [];
    }
    return {
      pressKit: user?.documents?.pressKit || [],
      technicalRider: user?.documents?.technicalRider || [],
      contracts: user?.documents?.contracts || []
    };
  };
  ```

- **Conditional Handlers**: Separate logic paths for different roles
  - `handleAddDocument`, `handleEditDocument`, `handleSaveDocument`, `handleDeleteDocument`
  - Each checks `isPromoterOrVenue` and executes appropriate code path
  - Backend saves correctly: `{ general: [...] }` vs `{ pressKit: [...], ... }`

- **useEffect Optimization**: Prevent state overwrites
  ```javascript
  useEffect(() => {
    // Sync documents based on role
    if (isPromoterOrVenue) {
      setDocuments(user?.documents?.general || []);
    } else {
      setDocuments({ pressKit: [...], technicalRider: [...], contracts: [...] });
    }
  }, [user?._id]); // Only trigger on user ID change, not every update
  ```

### Calendar Tab Role-Based Features
- **Promoters/Venues**:
  - "Calendar View" section with embedded calendar (same as Artists)
  - "Upcoming Events" section with expandable booking cards
  - Shows deals with PENDING, NEGOTIATING, or ACCEPTED status
  - Sorted by date, limited to next 10 upcoming events
  - Expandable cards show full event details (artist, date, time, type, fee)

- **Artists/Agents**:
  - "Calendar View" section with embedded calendar
  - "Travel Schedules" section with add/edit/delete functionality
  - Same calendar availability features as before

## Recent Updates (February 15, 2026)

### Document Persistence Debugging & Network Configuration Fixes

#### Issues Identified
1. **Network IP Address Instability**: WiFi network IP keeps changing (192.168.2.101 → 192.168.2.103 → 192.168.2.101)
   - Frontend .env was pointing to outdated IP addresses
   - API calls failing with ERR_CONNECTION_REFUSED
   - Login and all backend communication broken

2. **Multiple Server Processes**: Duplicate frontend and backend processes running simultaneously
   - Multiple processes on port 3001 (frontend)
   - Multiple processes on port 5001 (backend)
   - Caused inconsistent behavior and connection issues

3. **Document Save Investigation**: Documents added through UI but not persisting to database
   - Root cause: API calls not reaching backend due to IP mismatch
   - Backend logs showed no `[Profile Update]` messages when documents were saved

#### Fixes Applied

**1. Localhost Configuration for Stability**
- Updated frontend `.env` to use `http://localhost:5001/api` instead of network IP
- Benefits:
  - Works regardless of WiFi network changes
  - Stable connection for same-machine development
  - No need to update .env when network IP changes
- **Limitation**: Only accessible from the development machine (PC)

**2. Process Cleanup**
- Killed all duplicate frontend and backend processes
- Restarted cleanly with pm2 (backend) and npm start (frontend)
- Single process per service ensures consistent behavior

**3. Enhanced Debug Logging**
- Added comprehensive logging to [ManageProfileScreen.js](src/components/screens/ManageProfileScreen.js:843-944)
- Logs include:
  - Document data being saved
  - User information (_id, name, role)
  - Role detection (isPromoterOrVenue)
  - Current documents state
  - API call payload (formatted JSON)
  - Backend response
  - Error details (type, message, full stack)
- Format: `=== DOCUMENT SAVE DEBUG START ===` ... `=== DOCUMENT SAVE DEBUG END ===`

**4. Backend Logging Enhancements**
- Added detailed logging to backend profile update route
- Logs profile ID, role, documents in request, and documents after save
- Format: `[Profile Update]` prefix for easy filtering

#### Current Configuration

**Frontend:**
- Running on: `http://localhost:3001`
- API URL: `http://localhost:5001/api`
- Environment variable: `REACT_APP_API_URL=http://localhost:5001/api`

**Backend:**
- Running on: `http://localhost:5001`
- MongoDB: `mongodb://localhost:27017/tora` (local)
- Managed by: pm2 (process name: tora-backend)

**Database:**
- Local MongoDB instance
- Fast performance compared to Atlas
- Connection: localhost:27017/tora

#### Network Access Considerations

**Current Setup (Localhost):**
- ✅ Works on development PC
- ✅ Stable across WiFi network changes
- ❌ Not accessible from phone or other devices

**For Cross-Device Access:**
To access from phone/tablet on same WiFi network:
1. Get current network IP: `ipconfig getifaddr en0`
2. Update frontend .env: `REACT_APP_API_URL=http://[CURRENT_IP]:5001/api`
3. Start frontend with: `REACT_APP_API_URL=http://[CURRENT_IP]:5001/api HOST=0.0.0.0 PORT=3001 npm start`
4. Access from phone: `http://[CURRENT_IP]:3001`
5. **Note**: Must update .env when WiFi network changes

#### Files Modified
- [.env](/Users/alessandrocastelbuono/Desktop/tora-app/.env) - Updated API URL to localhost
- [ManageProfileScreen.js](src/components/screens/ManageProfileScreen.js) - Added comprehensive debug logging (lines 843-944)
- Backend [profiles.js](/Users/alessandrocastelbuono/Desktop/tora-backend/src/routes/profiles.js) - Enhanced update logging (lines 192-207)

#### Testing Status
- ✅ Backend health check working: `http://localhost:5001/api/health`
- ✅ Frontend compiled successfully
- ✅ Login authentication ready
- ⏳ Document persistence fix pending user testing

#### Next Steps
1. User login at `http://localhost:3001`
2. Test document add functionality with MOVE (Promoter) profile
3. Verify browser console shows debug logs
4. Confirm backend pm2 logs show API calls
5. Test document persistence after page reload

## Contact
This project was developed for the TORA platform, a networking application for electronic music industry professionals.