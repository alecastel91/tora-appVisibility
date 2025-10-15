# TORA - Music Booking Platform

A React-based web application for connecting music industry professionals (DJs, producers, promoters, venues, agents).

## Architecture Overview

This project is structured to be easily portable to React Native:

### Folder Structure
```
src/
├── components/
│   ├── common/        # Reusable UI components
│   ├── screens/       # Screen/page components
│   └── modals/        # Modal components
├── contexts/          # React Context for state management
├── services/          # Data services and API calls
├── hooks/             # Custom React hooks
├── styles/            # CSS stylesheets
├── utils/             # Utility functions and icons
└── navigation/        # Navigation configuration
```

### Key Design Decisions

1. **Component Architecture**: All components are functional with hooks, making them compatible with React Native
2. **State Management**: Using Context API for global state, easily replaceable with Redux if needed
3. **Styling**: CSS separated into modules, can be easily converted to StyleSheet for React Native
4. **Icons**: SVG icons in a separate utility file, can be replaced with react-native-vector-icons
5. **Navigation**: Screen-based navigation pattern that maps well to React Navigation in React Native

### React Native Migration Path

To convert to React Native:

1. Replace HTML elements with React Native components:
   - `div` → `View`
   - `span/p` → `Text`
   - `button` → `TouchableOpacity`
   - `input` → `TextInput`
   - `img` → `Image`

2. Convert CSS to StyleSheet objects
3. Replace React Router with React Navigation
4. Use react-native-vector-icons for icons
5. Adapt modal components to use React Native Modal

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Features

- User profiles with role-based identification
- Search and discovery
- Real-time messaging
- Event exploration
- Connection management
- Notification system

### Tech Stack

- React 18
- React Router DOM
- Context API for state management
- CSS Modules for styling
- Mock data service (ready for API integration)