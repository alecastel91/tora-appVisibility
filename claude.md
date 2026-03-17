# TORA App - Project Summary

## Overview
TORA is a React-based web application designed for professionals in the electronic music/club scene to connect, network, and collaborate. The app features a dark theme with pink accent colors (#FF3366) and is built to be easily convertible to React Native.

## Recent Updates (March 18, 2026)

### Typography Standardization - Profile Names and Location Text
- **Profile Name Font Standardization**: Unified typography across all card-based screens
  - **Search Screen**: Profile names use Inter 17px, font-weight 400 (normal, not bold)
  - **Calendar Matches**: Profile names use Inter 17px, font-weight 400 (normal, not bold)
  - **Bookings Screen**: Profile names use Inter 17px, font-weight 400 (normal, not bold)
  - **Messages Screen**: Conversation names use Inter 17px, font-weight 400 (normal, not bold)
  - **Chat Header**: User name uses Inter 17px, font-weight 400 (normal, not bold)
  - **Profile Screen**: Profile name uses Inter 24px, font-weight 700 (bold) - stands out as main title
  - Result: Clean, elegant, consistent typography with proper hierarchy

- **Location Text Standardization**: Applied consistent styling to all location displays
  - **Search Screen**: Location uses Rajdhani 12px, font-weight 500, letter-spacing 0.05em
  - **Calendar Matches**: Both `.match-location` and `.match-base-location` use identical styling
  - **Color**: rgba(255, 255, 255, 0.5) - 50% white opacity for subtle appearance
  - Result: Uniform location text appearance across all screens

- **Premium Screen Updates**:
  - **Header Title**: "TORA Premium" uses Inter 20px, font-weight 600 (cleaner, more elegant)
  - **Plan Name Boxes**: Reverted to original pill-style boxes (Monthly/Yearly with background and border)
  - **Price Numbers**: €19.90/€189.90 use Inter 32px, font-weight 600 (was Rajdhani 700)
  - Result: Premium screen maintains professional badge styling with cleaner number display

### Data Organization Updates
- **Americas Zone Consolidation**: Merged North America and Latin America into single "Americas" zone
  - Reduced from 7 zones to 6 zones (Africa, Americas, Asia, Europe, Middle East, Oceania)
  - Combined all countries from both regions into unified list
  - Simplified geographic filtering for users

- **Cities Filter Deduplication**: Fixed duplicate "Other" entries in city dropdown
  - Used JavaScript Set to remove duplicates
  - Custom sort function places "Other" at end of alphabetically sorted list
  - Result: Clean, organized city selection with single "Other" option

### UI/UX Improvements
- **Filter Modal Redesign**: Converted popup modal to full-page screen
  - Fixed scrolling issues where Cities and Genres lists were cut off
  - Full-screen layout with sticky header and action buttons
  - Individual dropdowns show 5 items at a time with internal scrolling
  - Proper safe-area padding for mobile devices
  - Result: Better usability, no more height calculation conflicts

- **Edit Profile Screen Scrolling**: Fixed mouse wheel scrolling issue
  - Changed from block display to fixed positioning
  - Added overflow-y: scroll for proper scroll capture
  - Result: Works with both keyboard arrows and mouse wheel

- **Tour Screen Scrolling**: Fixed Calendar Match tab not scrolling
  - Increased CSS specificity to override base screen styles
  - Changed overflow-y from auto to scroll
  - Added min-height: 0 to remove height constraint
  - Result: Calendar Match content scrollable on all devices

### Settings Screen Updates
- **Sign Out and Delete Account Buttons**: Reduced font size for cleaner appearance
  - Font: Inter 11px (was larger)
  - Style: Uppercase with 0.05em letter-spacing
  - Consistent with other CTAs throughout app

- **Filter Dropdowns Typography**: Applied landing page style to search filters
  - Dropdown headers: Inter 11px, uppercase, 0.1em letter-spacing
  - Dropdown values: Inter 10px
  - Dropdown items: Inter 11px
  - Result: Consistent with landing page aesthetic

### Landing Page Styling Applied to Main App - Complete UI Overhaul (March 18, 2026)
- **Typography System Implementation**: Applied landing page fonts throughout entire app
  - **Rajdhani Font**: Used for headings, locations, role badges (uppercase, 0.05em letter-spacing)
  - **Inter Font**: Used for all body text, labels, buttons, profile names (0.02-0.15em letter-spacing)
  - Font sizes reduced across the board (9-16px range) for cleaner, more compact look

- **Screens Updated with Landing Page Styling**:
  - **Search Screen**: Updated cards, filters, premium notice, search bar
  - **Bookings Screen**: Updated booking cards, headers, tabs, empty states
  - **Tour Screen (Calendar Match)**: Updated tabs, headers, scrolling fixes
  - **Messages Screen**: Updated tabs, conversation list, message previews
  - **Chat Screen**: Updated header, message bubbles, timestamps, date separators, input field
  - **Premium Modal**: Updated feature table, pricing cards, typography
  - **Notification Dropdown**: Updated header, items, timestamps
  - **Settings Screen**: Updated sections, items, headers, toggle switches
  - **Make Offer Modal**: Updated form inputs, labels, sections, buttons
  - **Contract Attachment Modal**: Button sizing adjustments
  - **Password Change Modal**: Button font sizing

- **Color Scheme Updates**:
  - Pure black backgrounds (#000000) for modals and overlays
  - Dark grey cards (#0f0f0f) for dimensional separation
  - Brighter borders (rgba(255, 255, 255, 0.2)) for better visibility
  - Input fields with black background (#000000) and proper focus states

- **Component-Specific Updates**:
  - **Booking Cards**: Dark grey background with hover effects, date badges
  - **Tour Cards**: Enhanced with pink gradient for featured yearly plan
  - **Pricing Cards**: Monthly vs Yearly distinction with gradient and shadows
  - **Form Inputs**: Black background with !important flags for consistency
  - **Buttons**: Standardized at 11px (was 9px, adjusted based on feedback)
  - **Change Password CTA**: Smaller size (9px), right-aligned
  - **Toggle Switches**: Spacing maintained at 15px margin-right

- **Layout Improvements**:
  - Edit Profile Screen: Fixed scrolling with mouse wheel
  - Tour Screen: Fixed scrolling on Calendar Match tab
  - Messages Tab: Fixed height to match Bookings/Tour tabs (16px padding)
  - Make Offer Modal: Zone/Country on same line, City on separate line
  - Form spacing standardized across all modals

- **Translation Keys Added** (Pending Component Implementation):
  - Added missing keys to en.js and ja.js: manage, findAgent, switchProfile, latestMix, spotifyArtist, events, viewUpcomingEvents, representedBy, searchingWorldwidePremium, searchingWorldwideTrial, searchLimitedTo

## Recent Updates (March 13, 2026)

### Landing Page - Complete Access Request Form (COMPLETE ✅)
- **9-Step Application Flow**: Multi-step form with progress bar and smooth animations
  - Step 0: Phone Verification (SMS code with country selector)
  - Step 1: Role Selection (Artist, Promoter, Venue, Agent)
  - Step 2: Identification (First/Last Name)
  - Step 3: Profile Name (Artist/Promoter/Event/Venue/Agent Name)
  - Step 4: Email Verification (custom validation with domain extension requirement)
  - Step 5: Location (Zone → Country → City cascading dropdowns)
  - Step 6: Music Genres (28 genres, multi-select)
  - Step 7: Instagram Username (with fixed white @ symbol)
  - Step 8: Role-Specific Additional Fields
- **Role-Based Step 8 Fields**:
  - **Artist**: Resident Advisor URL + SoundCloud URL (both optional)
  - **Agent**: Agency Name (required) + Website/LinkedIn (optional)
  - **Venue**: Venue Capacity (required) + Website (optional)
  - **Promoter**: Website (optional)
- **Complete Location Data**: All 45 countries now have cities (2-8 major cities each)
  - Zones: Africa, Americas, Asia, Europe, Oceania
  - Countries: 45 countries across all zones
  - Cities: 200+ cities including capitals and electronic music hubs
  - "Other" option available as fallback
- **Genre List Synchronization**: Updated both landing page and main app to 28 genres
  - Removed: Acid Techno, Breaks, Dark Techno, Funk, Soul, Latin House, Minimal Techno
  - Added: Bass, Downtempo, Dub Techno, EBM, Funk/Soul, Hardcore, IDM, Italo Disco, Jungle, Minimal
- **UX Improvements**:
  - Bold "ACCESS REQUEST" title with font-weight 900 (Inter font family)
  - Mobile optimization: 80% content scale to prevent margin cutoff
  - Simplified phone verification UI with embedded country code prefix
  - Instagram @ symbol fixed to pure white (#ffffff) with z-index: 10
  - Removed redundant SKIP button from final step
  - Reduced letter spacing on mobile (tracking-wide) for better text fit
- **Technical Implementation**:
  - Supabase integration for form submission
  - Framer Motion animations with slide and blur effects
  - Dynamic form rendering with key={`step8-${role}`} for proper re-rendering
  - Custom email validation regex
  - Form state management with React useState
- **Files Modified**:
  - Landing page: [ApplicationForm.tsx](../tora-landing-page/src/components/sections/infrared/ApplicationForm.tsx)
  - Main app: [profiles.js](src/data/profiles.js) - Genre list update

## Recent Updates (March 11, 2026)

### Trial Period Management - Feature 5 (COMPLETE ✅)
- **Auto Trial Activation**: New users automatically get 48-hour Premium trial on signup
  - Backend sets `subscriptionTier: 'TRIAL'`, `trialStartDate`, and `trialEndDate`
  - Trial provides full feature access with same usage limits as FREE tier
  - Implemented in [auth.js](/Users/alessandrocastelbuono/Desktop/tora-backend/src/routes/auth.js#L55-L72)
- **Trial Time Calculation Utilities**: Helper functions for tracking trial status
  - `getTrialDaysRemaining()` - Returns days remaining in trial
  - `getTrialHoursRemaining()` - Returns hours remaining in trial
  - Implemented in [subscription.js](/Users/alessandrocastelbuono/Desktop/tora-backend/src/utils/subscription.js#L276-L310)
- **Trial Banner in ProfileScreen**: Visual countdown display in user profile
  - Shows "🎉 Premium Trial Active" with days/hours remaining
  - Shows "⚠️ Your trial has expired" when trial ends
  - "Upgrade" button opens Premium modal for conversion
  - Green styling for active trial, orange for expired
  - Implemented in [ProfileScreen.js](src/components/screens/ProfileScreen.js#L42-L63) and [ProfileScreen.js](src/components/screens/ProfileScreen.js#L354-L401)
- **Trial Countdown in Settings**: Detailed trial info in Settings screen
  - ⏱️ Clock icon with "Trial Period" heading
  - Shows precise countdown (hours if < 24h, otherwise days)
  - Appears in Subscription & Usage section below tier badge
  - Green box styling matching trial theme
  - Implemented in [App.js](src/App.js#L403-L428)
- **Automatic Downgrade**: Backend automatically converts expired trials to FREE tier
  - `getCurrentTier()` checks expiration and returns FREE for expired trials
  - `autoDowngradeExpired()` permanently updates database when trial expires
  - Already implemented in [subscription.js](/Users/alessandrocastelbuono/Desktop/tora-backend/src/utils/subscription.js#L11-L30) and [subscription.js](/Users/alessandrocastelbuono/Desktop/tora-backend/src/utils/subscription.js#L250-L274)
- **CSS Styling**: Complete visual design for trial elements
  - Trial banner styles with green (active) and orange (expired) themes
  - Trial countdown box in settings with consistent green theme
  - TRIAL tier label styling with green accent
  - Implemented in [App.css](src/styles/App.css#L516-L584) and [App.css](src/styles/App.css#L2069-L2109)
- **Props and Integration**: Connected Premium modal to trial CTAs
  - ProfileScreen now accepts `onOpenPremium` prop from App.js
  - Both trial banner and countdown buttons open Premium modal for upgrades

### Landing Page Development - Intro Splash Implementation (COMPLETE ✅)
- **Repository Setup**: Cloned and configured separate landing page repository
  - Location: `/Users/alessandrocastelbuono/Desktop/tora-landing-page`
  - Repository: https://github.com/Alchemz/tora-landing-page-export
  - Branch: `alessandro-modifications` (separate working branch)
  - Tech Stack: Next.js 16, TypeScript, Tailwind CSS, Framer Motion
  - Running on: http://localhost:3000 (local) / http://192.168.2.101:3000 (network)

- **Intro Splash Screen**: Created brand-focused opening sequence
  - New component: `IntroSplash.tsx` with logo + tagline animation
  - **Pure black background** (removed grey frame)
  - **TORA logo**: Cropped tight, sized at 320px (mobile) / 480px (desktop)
  - **Tagline**: "WHERE THE MUSIC INDUSTRY CONNECTS." - 10px/12px font, positioned below logo
  - **Animation sequence**:
    - 0.3s: Logo fades in with blur effect
    - 0.8s: Tagline appears
    - 2.5s: Auto-transition to main page
  - Files: [IntroSplash.tsx](../tora-landing-page/src/components/sections/infrared/IntroSplash.tsx)

- **Main Page Flow**: Three-stage user journey
  - **Stage 1**: Intro splash (2.5 seconds)
  - **Stage 2**: Main content with "APPLY NOW" CTA
  - **Stage 3**: Application form (future implementation)
  - Updated [page.tsx](../tora-landing-page/src/app/page.tsx) with flow state management

- **Logo Optimization**: Custom cropped logo for perfect composition
  - Original logo had excessive white space padding
  - Cropped tightly around "TORA" text using Preview
  - Created `tora_logo_v2.png` to bypass browser cache
  - Final size: 27KB (reduced from 126KB)

- **Environment Configuration**: Fixed Supabase requirement
  - Created `.env.local` with placeholder Supabase credentials
  - Server runs successfully without actual Supabase connection
  - Ready for backend integration when application system is implemented

- **Design Refinements**:
  - Logo size: 20% smaller than original for better mobile fit
  - Tagline spacing: `mt-2 md:mt-1` (positioned just below logo)
  - Font size: `text-[10px] md:text-[12px]` (balanced readability with width)
  - Letter spacing: `tracking-[0.22em]` for proportional fit under logo
  - All text remains on single line with `whitespace-nowrap`

### Membership-Only Strategy Discussion (March 11, 2026)
- **Strategic Pivot**: Decision to make TORA a membership-only, application-based platform
  - No public signups - users must apply and be approved
  - Exclusive community model (similar to Soho House, Raya)
  - Pre-launch: Collect applications on landing page
  - Launch: Invite approved members with coupon codes
  - Post-launch: Paid subscriptions only (no free tier)
- **Coupon Package Strategy**:
  - FOUNDING: 3 months free for first 100 members (key influencers, beta testers)
  - LAUNCH: 1 month free for next 400 members
  - STANDARD: 7-day trial for later members (after public launch)
  - INFLUENCER: 12 months for strategic partners
- **Landing Page**: Separate Next.js site on Vercel (tora-landing-page.vercel.app)
  - Built by collaborator, hosted independently
  - "Apply Now" flow for collecting applications
  - Integration with TORA backend API for application submission
- **Next Steps**: Implementation of application + invitation system
  - Application model and API endpoints
  - Admin review dashboard
  - Invitation code generation
  - Modified signup requiring invite codes
  - Coupon auto-application based on invite type

## Recent Updates (March 9, 2026)

### Premium Features Screen - Full Implementation (COMPLETE ✅)
- **Converted to Full-Screen Page**: Changed from modal to dedicated full-screen interface
  - Added sticky header with back button and centered "TORA Premium" title
  - Full-screen layout with max-width 800px for better readability
  - Scrollable content area with proper overflow handling
  - More professional presentation for subscription decision
- **Comprehensive Feature Comparison Table**: Role-based feature display with 11 features
  - **Search Visibility**: User's city (FREE) → Global (MONTHLY/YEARLY)
  - **Professional Dashboard**: Access to analytics and management tools
  - **Update Travel Schedule**: Artists/Agents only - manage tour availability
  - **Calendar Matching**: Find professionals with matching availability
  - **Tour Kick-starter**: Tour planning and multi-gig booking tools
  - **Artist Travel Alerts**: Promoters/Venues only - get notified when artists visit (YEARLY exclusive)
  - **Calendar Privacy Controls**: Hide calendar from connections (YEARLY exclusive)
  - **Messaging**: Available to all tiers
  - **Priority Search Placement**: Appear first in search results (YEARLY exclusive)
  - **Send Likes**: 2/day (FREE) → 5/day (MONTHLY) → Unlimited (YEARLY)
  - **Connection Requests**: 3/month (FREE) → 10/month (MONTHLY) → Unlimited (YEARLY)
- **Add-on Pricing Display**: Extra purchase options shown below respective features
  - Extra Likes: (10 EXTRA LIKES €2, 7-DAYS UNLIMITED LIKES €5)
  - Extra Connections: (1 EXTRA REQUEST €5, 5 EXTRA REQUESTS €15, 10 EXTRA CONTACTS €25)
  - Positioned directly under Send Likes and Connection Requests rows
  - Left-aligned compact text (10px font, grey color #666)
  - Minimal spacing (4px margin-top) for visual grouping
- **User-Friendly Feature Names**: Improved clarity for users unfamiliar with the app
  - "Manage Section" → "Professional Dashboard"
  - "Match Tab" → "Calendar Matching"
  - "Notification Artist visiting" → "Artist Travel Alerts"
  - "Hide Calendar to connected" → "Calendar Privacy Controls"
  - "Message" → "Messaging"
  - "Top result in search" → "Priority Search Placement"
- **Role-Based Feature Display**: Dynamic features based on user role
  - Artists/Agents see "Update Travel Schedule"
  - Promoters/Venues see "Artist Travel Alerts"
  - Conditional rendering using `user?.role` checks
- **Visual Design Improvements**:
  - Removed all feature icons for cleaner table layout
  - Consistent left alignment for all feature names
  - Thin grey dividing lines between all features (rgba(255, 255, 255, 0.05))
  - Yearly column highlighted with pink accent color and star icon
  - Hover effects on feature rows
  - Clean typography with proper spacing
- **Files Modified**:
  - [App.js](src/App.js): Premium screen structure and feature table
  - [App.css](src/styles/App.css): Premium screen styles, table layout, extras notes styling
  - [icons.js](src/utils/icons.js): Removed unused icon imports (GlobeIcon, CalendarIcon, etc.)

### Subscription System - Feature 1: Search Restrictions (COMPLETE & TESTED ✅)
- **Backend Implementation**:
  - Added subscription fields to Profile schema (subscriptionTier, trial dates, usage tracking)
  - Created subscription utility functions (getCurrentTier, hasFeatureAccess, like/connection limits)
  - Created checkSubscription middleware for automatic tier expiration handling
  - Updated /api/profiles/search endpoint to enforce city-based vs global search
  - FREE tier: restricted to user's city only
  - TRIAL/MONTHLY/YEARLY: global search with zone/country/city filters
- **Frontend Implementation**:
  - Added hasGlobalSearch() helper function in SearchScreen
  - Updated search logic to use subscription tiers instead of isPremium
  - Added upgrade banner for FREE tier users (yellow CTA button)
  - Shows "Search limited to {city}" message with upgrade prompt
  - TRIAL users see "Searching worldwide with 48h trial" notice
  - MONTHLY/YEARLY users see "Searching worldwide with Premium" notice
  - Fixed: Reset search results when user logs in/out (no more cached results)
  - Removed duplicate notification banner (cleaner UI)
- **Auto-Trial on Signup**:
  - New users automatically get TRIAL tier for 48 hours
  - Trial unlocks feature previews but maintains same usage limits as FREE
  - Trial limits: 2 likes/day, 3 connections/month (prevents exploitation)
- **Data Migration**:
  - Created migration script to update existing profiles
  - Migrated isPremium=true profiles to YEARLY tier
  - Set other profiles to FREE tier
  - Initialized usage tracking fields
- **Testing Results**:
  - ✅ FREE tier users see only profiles from their city (Amsterdam → 1 result, Tokyo → 5 results)
  - ✅ YEARLY tier users see global search with all profiles
  - ✅ Upgrade banner shows correctly for FREE tier only
  - ✅ City name in banner updates correctly based on user location
  - ✅ Backend logs confirm proper tier-based filtering
- **Files Modified**:
  - Backend: Profile.js, subscription.js, checkSubscription.js, auth.js, profiles.js, migrate-subscription-tiers.js
  - Frontend: SearchScreen.js, App.css

### Subscription System - Feature 2: Like Limits (COMPLETE ✅)
- **Backend Implementation**:
  - Added subscription limit checks to POST /api/connections/like endpoint
  - Imported canSendLike(), incrementLikeUsage(), getLikeLimit() from subscription utils
  - Checks if like action is new (not unlike) before enforcing limits
  - Returns 403 error with detailed message when limit exceeded
  - Response includes: error, message, limit, tier, resetTime
  - Increments like usage counter on successful likes
  - Unlike actions always allowed (no limit check)
- **Frontend Implementation**:
  - SearchScreen: Enhanced handleLike with 403 error detection and handling
  - ViewProfileScreen: Added error handling with premium modal auto-open
  - ExploreScreen: Added onOpenPremium prop and limit error handling
  - All like actions show alert with tier info and limit count
  - Premium modal automatically opens after showing limit message
  - Pass onOpenPremium through SearchScreen → ViewProfileScreen chain
- **User Experience**:
  - Clear error message: "You've reached your daily limit of X likes. Upgrade to Premium for unlimited likes!"
  - Alert shows current tier and limit (e.g., "FREE tier with 2 likes per day")
  - Seamless upgrade flow: alert → premium modal
  - Unlike actions work without restrictions
- **Testing Ready**:
  - FREE tier: 2 likes/day limit
  - TRIAL tier: 2 likes/day limit (same as FREE)
  - MONTHLY tier: 5 likes/day limit
  - YEARLY tier: Unlimited likes
- **Files Modified**:
  - Backend: connections.js (lines 9, 41-77)
  - Frontend: SearchScreen.js (lines 196-225), ViewProfileScreen.js (lines 7, 82-103), ExploreScreen.js (lines 7, 53-75)

### Subscription System - Feature 3: Connection Request Limits (COMPLETE ✅)
- **Backend Implementation**:
  - Added subscription limit checks to POST /api/connections/request endpoint
  - Imported canSendConnection(), incrementConnectionUsage(), getConnectionLimit() from subscription utils
  - Checks limits before allowing connection request creation
  - Returns 403 error with detailed message when limit exceeded
  - Response includes: error, message, limit, tier, resetTime (next month)
  - Increments connection usage counter on successful requests
  - Monthly reset handled automatically by subscription utility functions
- **Frontend Implementation**:
  - SearchScreen: Enhanced handleConnectionChoice with 403 error detection
  - ViewProfileScreen: Added connection limit error handling
  - Both show alert with tier info and monthly limit count
  - Premium modal automatically opens after showing limit message
  - Error message: "You've reached your monthly limit of X connection requests. Upgrade to Premium for more connections!"
- **User Experience**:
  - Clear error message with current tier and limit information
  - Alert shows: "Your current plan: {TIER}\nMonthly limit: {LIMIT} connections"
  - Seamless upgrade flow: alert → premium modal
  - Monthly reset information provided in backend response
- **Testing Ready**:
  - FREE tier: 3 connections/month limit
  - TRIAL tier: 3 connections/month limit (same as FREE)
  - MONTHLY tier: 10 connections/month limit
  - YEARLY tier: Unlimited connections
- **Files Modified**:
  - Backend: connections.js (lines 9, 513-532, 568-570)
  - Frontend: SearchScreen.js (lines 262-290), ViewProfileScreen.js (lines 56-88)
- **Next**: Feature 4 (Premium Feature Access Gates) - Lock Manage/Match/Tour features for FREE tier

### Subscription System Planning (March 5, 2026)
- **Feature**: Designed comprehensive subscription tier enforcement strategy
- **Tier Structure**:
  - **FREE**: City-based search, 2 likes/day, 3 connections/month, locked premium features
  - **TRIAL (48h)**: Auto-activated on signup, unlocks feature previews (Manage, Match, Tour Kickstart, global search), same limits as FREE (2 likes/day, 3 connections/month)
  - **MONTHLY (€19.90)**: Global search, all features unlocked, 5 likes/day, 10 connections/month
  - **YEARLY (€189.90)**: All monthly features + unlimited likes/connections + exclusive features (hide calendar, artist visiting notifications, top search results)
- **Trial Philosophy**: 48h trial is for **feature preview**, not free production use
  - Users see interfaces and capabilities (Manage section, Match tab, Tour Kickstart, global search)
  - Same usage limits as free tier (2 likes/day, 3 connections/month) prevents exploitation
  - Forces upgrade decision based on feature value, not usage capacity
- **Search Visibility**: Changed from 30km GPS radius to city-based (profile location)
  - Privacy-friendly (no real-time tracking)
  - Professional context (based city = business address)
  - Touring artists discovered via Match tab (travel schedule matching)
- **Implementation Approach**: Feature-by-feature (backend + frontend + testing per feature)
  - Immediate feedback and integration testing
  - Easier debugging and incremental deployment
  - Better than doing all backend first, then all frontend

## Recent Updates (March 4, 2026)

### Tour Kickstart - View Gigs Feature
- **Feature**: Artists can now view all confirmed bookings for a tour by clicking "View Gigs" button on tour cards
- **Tour Gigs Modal**:
  - Shows all ACCEPTED deals linked to the selected tour
  - Displays event name, venue, date, fee, and location for each gig
  - Status badge with green "Confirmed" label
  - Loading state with spinner during data fetch
  - Empty state message when no confirmed gigs exist
  - Solid background (#1a1a1a) for better readability
- **Backend Support**:
  - Enhanced GET /api/deals endpoint to support `tour` query parameter
  - Filters deals by tour ObjectId and ACCEPTED status
  - Returns all confirmed bookings for the specified tour
- **Implementation Details**:
  - Added state management for modal visibility, selected tour, and gig data
  - Created `handleViewTourGigs()` function to fetch and display tour-specific deals
  - Added `getDealsForTour(tourId)` method to API service
  - Fee display uses `deal.currentFee` field for accurate amount
- **Files Modified**:
  - [TourScreen.js:748-764](src/components/screens/TourScreen.js) - Handler function
  - [TourScreen.js:1803-1891](src/components/screens/TourScreen.js) - Tour Gigs Modal
  - [api.js:465-472](src/services/api.js) - API method
  - [deals.js:261-265](/Users/alessandrocastelbuono/Desktop/tora-backend/src/routes/deals.js) - Backend tour filter

### Calendar Matches - Role Matching Fix
- **Issue**: Calendar matches were showing invalid same-role pairings
  - Venue with Venue, Promoter with Promoter, Artist with Artist
  - Agents were incorrectly matching with other artists
- **Solution**: Enhanced role matching logic to prevent same-role matches
  - Normalized AGENT → ARTIST before comparison
  - Valid pairs: ARTIST ↔ VENUE, ARTIST ↔ PROMOTER, PROMOTER ↔ VENUE
  - Prevents all same-role combinations from appearing in matches
- **Implementation**:
  ```javascript
  const isValidRoleMatch = (role1, role2) => {
    const normalizedRole1 = role1 === 'AGENT' ? 'ARTIST' : role1;
    const normalizedRole2 = role2 === 'AGENT' ? 'ARTIST' : role2;

    const validPairs = [
      ['ARTIST', 'VENUE'],
      ['ARTIST', 'PROMOTER'],
      ['PROMOTER', 'VENUE']
    ];

    return validPairs.some(([r1, r2]) =>
      (normalizedRole1 === r1 && normalizedRole2 === r2) ||
      (normalizedRole1 === r2 && normalizedRole2 === r1)
    );
  };
  ```
- **Files Modified**: [TourScreen.js:187-202](src/components/screens/TourScreen.js)

### Message Read Status - Notification Clearing Fix
- **Issue**: Unread message badges and bold text persisted after viewing conversations
  - MessagesScreen only fetched data once on initial mount
  - Returning from ChatScreen didn't trigger refresh
  - Notification count remained unchanged
- **Solution**: Force MessagesScreen to remount when returning from chat
  - Added dynamic key prop to MessagesScreen based on activeChatUser state
  - Key changes when chat is opened/closed, triggering component remount
  - Fresh data fetch occurs on every remount, updating unread counts
- **Implementation**:
  ```javascript
  <MessagesScreen
    onOpenChat={setActiveChatUser}
    key={activeChatUser ? 'with-chat' : 'without-chat'}
  />
  ```
- **Files Modified**:
  - [App.js:234](src/App.js) - Dynamic key prop
  - [MessagesScreen.js:43-47](src/components/screens/MessagesScreen.js) - useEffect fetch trigger

### Premium Subscription - Pricing Update
- **Pricing Changes**:
  - Monthly: €19 → €19.90/month
  - Yearly: €180 → €189.90/year (€15.83/month)
  - Discount: 20% → 21% off annual plan
- **Layout Improvement**: Changed pricing cards from horizontal to vertical stack
  - Better spacing on mobile and small screens
  - Increased gap from 12px to 16px
  - Increased card padding from 16px to 20px
  - Reduced container max-width from 400px to 350px
  - Cards now full-width (100%) instead of flex: 1
- **Files Modified**:
  - [App.js:589,595,620,632](src/App.js) - Pricing values and text
  - [App.css:5536-5554](src/styles/App.css) - Layout and spacing

### Agent Authorization Fix for Deal Management
- **Issue**: Agents (Alessandro) could not view or manage booking offers made to their represented artists (Al Jones)
  - Error: "403 Forbidden - Not authorized to view this deal"
  - Frontend showed error when clicking "View Details" on offers
- **Root Cause**: Backend authorization checks only verified if user was the artist or venue directly involved in the deal
  - Did not account for agents who represent the artist
  - `GET /api/deals/:dealId` rejected requests from agents even when they represented the artist in the deal
- **Solution**: Added agent authorization logic to all deal endpoints
  - Checks if requesting user is an agent with the artist in their `representingArtists` array
  - Applied to: view deal, accept deal, decline deal, counter-offer, all deal modification endpoints
  - Agents can now fully manage deals on behalf of their represented artists
- **Implementation**:
  ```javascript
  // Check if profileId is artist, venue, or agent representing the artist
  let isAuthorized = (artistId === profileId || venueId === profileId);

  // If not directly authorized, check if user is an agent representing the artist
  if (!isAuthorized) {
    const userProfile = await Profile.findById(profileId);
    if (userProfile && userProfile.role === 'AGENT' && userProfile.representingArtists) {
      isAuthorized = userProfile.representingArtists.some(
        artist => artist.profileId.toString() === artistId
      );
    }
  }
  ```
- **Files Modified**:
  - Backend: [deals.js:313-335](/Users/alessandrocastelbuono/Desktop/tora-backend/src/routes/deals.js) - GET /:dealId authorization
  - Backend: [deals.js](/Users/alessandrocastelbuono/Desktop/tora-backend/src/routes/deals.js) - All deal modification endpoints (5 occurrences)
- **Testing**: Alessandro can now successfully view and manage offers for Al Jones

### Tour Kickstart - Input Field Scroll Wheel Fix
- **Issue**: Scroll wheel was changing minRevenue value when scrolling over the input field
  - Value "10050" would change to "10046" due to browser's default scroll increment behavior on `type="number"` inputs
- **Solution**: Added `onWheel={(e) => e.target.blur()}` handler to disable scroll wheel interaction
  - Applied to both Create Tour and Edit Tour modals
  - Input field loses focus when scroll wheel is detected, preventing value changes
  - Users can still type any value manually
- **Additional Improvements**:
  - Changed `parseFloat()` to `parseInt()` for minRevenue (more appropriate for integer values)
  - Removed `step="1"` attribute (provides more flexibility without constraints)
  - Cleaned up debug logging from previous session
- **Files Modified**:
  - Frontend: [TourScreen.js:878, 1067](src/components/screens/TourScreen.js) - Added onWheel handler
  - Frontend: [TourScreen.js:589, 678](src/components/screens/TourScreen.js) - Changed to parseInt()
  - Backend: [tours.js:38, 199](/Users/alessandrocastelbuono/Desktop/tora-backend/src/routes/tours.js) - Changed to parseInt()

## Recent Updates (March 3, 2026)

### Tour Kickstart - Integration with Booking Workflow
- **Removed Proposals System**: Completely removed the old tour proposal system (View Proposals, proposal modals, proposal counts)
- **Integrated with Standard Booking Flow**: Tour offers now use MakeOfferModal and create standard Deals
  - "Make an Offer" button opens same modal as normal bookings
  - Creates Deal linked to tour via `tour` field in Deal model
  - Offers appear in Bookings screen (not separate proposal system)
  - Standard Accept/Decline/Counter workflow applies
- **Confirmed Gigs Counter**: When artist accepts a tour-linked booking, the tour's `confirmedGigs` count automatically increments
  - Backend logic in deals.js (lines 301-308)
  - Deal model includes `tour` field (ObjectId reference)
  - Tour progress tiles update in real-time
- **Simplified Tour Cards**: Artist tour cards now only show Edit button (removed View Proposals and proposal count)
- **Clean State Management**: Removed unused state variables (`unreadProposalsCount`, `tourProposals`, `showViewProposalsModal`)
- **Files Modified**:
  - Frontend: [TourScreen.js](src/components/screens/TourScreen.js) - Removed ~200 lines of proposal UI code
  - Backend: [tours.js](/Users/alessandrocastelbuono/Desktop/tora-backend/src/routes/tours.js) - Changed proposal creation to Deal creation
  - Backend: [deals.js](/Users/alessandrocastelbuono/Desktop/tora-backend/src/routes/deals.js) - Added tour confirmedGigs increment on acceptance
  - Backend: [Deal.js](/Users/alessandrocastelbuono/Desktop/tora-backend/src/models/Deal.js) - Added `tour` field

### Tour Kickstart Workflow (Current State)
1. **Artist Creates Tour**: Sets zone, dates, target cities, minimum gigs, fee expectations
2. **Promoter/Venue Browses Tours**: Filters by zone and genres
3. **Make an Offer**: Promoter clicks "Make an Offer" → MakeOfferModal opens
4. **Deal Creation**: Standard booking deal created and linked to tour
5. **Booking Management**: Offer appears in Bookings screen for both parties
6. **Acceptance**: When artist accepts, tour's confirmed gigs count increments
7. **Progress Tracking**: Tour card shows X/Y gigs confirmed with visual progress tiles

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

## Contact
This project was developed for the TORA platform, a networking application for electronic music industry professionals.
