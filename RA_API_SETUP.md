# Resident Advisor API Integration Guide

## Overview
The TORA app is configured to integrate with Resident Advisor's API to display live event data. Currently, it runs in mock mode with sample data, but the architecture is ready for real API integration.

## Do You Need RA Approval?

**YES** - You need official approval from Resident Advisor to access their API. Here's what you need to know:

### 1. Official API Access
- **Contact RA**: Email their developer team at developers@residentadvisor.net (example)
- **Apply for API Access**: Fill out their developer application form
- **Explain Your Use Case**: Describe TORA and how you'll use their data
- **Wait for Approval**: This can take 1-4 weeks
- **API Documentation**: Once approved, you'll receive API docs and credentials

### 2. What RA Will Want to Know
- Your app's purpose and target audience
- Expected API call volume
- How you'll display RA data and attribution
- Whether it's commercial or non-commercial use
- Data privacy and security measures

### 3. Terms You'll Need to Accept
- Proper attribution (RA logo/link on event data)
- Rate limiting (e.g., max 100 requests per minute)
- No data reselling or redistribution
- Regular data refresh (don't cache for too long)
- Respect ticket sale links (direct to RA)

## Setup Instructions

### Step 1: Environment Configuration
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` with your credentials:
```
REACT_APP_RA_API_URL=https://api.ra.co/v1  # Get from RA
REACT_APP_RA_API_KEY=your_api_key_here     # Your API key
REACT_APP_USE_MOCK_DATA=false              # Set to false when ready
```

### Step 2: Current Implementation

The app uses a service layer (`src/services/raService.js`) that:
- **Mock Mode**: Returns sample data (default)
- **API Mode**: Makes real API calls when configured
- **Caching**: 5-minute cache to reduce API calls
- **Error Handling**: Falls back to mock data if API fails

### Step 3: API Endpoints Structure

```javascript
// Expected API endpoints (example structure)
GET /artists/{slug}/events     // Artist's upcoming events
GET /artists/{slug}            // Artist profile
GET /events                    // Search events
GET /venues/{id}/events        // Venue events
```

### Step 4: Testing Without API Access

While waiting for approval, you can:
1. Use the mock data (already configured)
2. Test with a local proxy server
3. Create a backend service that simulates RA responses

## Alternative Solutions (If No API Access)

### Option 1: Web Scraping (Not Recommended)
- **Pros**: No API needed
- **Cons**: 
  - May violate RA's Terms of Service
  - Fragile (breaks when RA updates their site)
  - Can get your IP blocked
  - Legal risks

### Option 2: RSS/iCal Feeds
- Some artists have public calendar feeds
- Limited data compared to full API
- Check if RA provides RSS feeds

### Option 3: Partner Integration
- Partner with RA as an official affiliate
- May provide special data access
- Requires business relationship

### Option 4: Manual Data Entry
- Artists manually update their events in TORA
- Most control but least automated
- Good for MVP/testing

## Backend Proxy Server (Recommended)

Create a backend service to handle RA API calls:

```javascript
// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/ra/events/:artist', async (req, res) => {
  try {
    // Your RA API call here
    const response = await fetch(`${RA_API_URL}/artists/${req.params.artist}/events`, {
      headers: {
        'Authorization': `Bearer ${RA_API_KEY}`
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch RA data' });
  }
});

app.listen(5000);
```

## Data Structure

The app expects this data format:

```javascript
{
  id: 'event_id',
  date: '2024-02-10',
  dayOfWeek: 'SAT',
  venue: {
    name: 'Venue Name',
    city: 'City',
    country: 'Country',
    capacity: 1000
  },
  event: {
    name: 'Event Name',
    startTime: '23:00',
    endTime: '06:00',
    lineup: ['Artist 1', 'Artist 2']
  },
  tickets: {
    status: 'on_sale', // on_sale, few_left, sold_out, coming_soon
    price: '£20-30',
    url: 'https://ra.co/events/...'
  }
}
```

## Current Features Using RA Data

1. **Profile Page**: "View Upcoming Events" button
2. **Event List**: Shows upcoming events with dates, venues, ticket status
3. **Ticket Links**: Direct links to RA for ticket purchase
4. **Caching**: Reduces API calls and improves performance

## Security Considerations

1. **Never expose API keys in frontend code**
2. **Use environment variables**
3. **Implement rate limiting**
4. **Use HTTPS for all API calls**
5. **Validate and sanitize API responses**
6. **Implement proper error handling**

## Contact RA

- **Website**: https://ra.co/developers (if exists)
- **Email**: Check RA's contact page for developer inquiries
- **Twitter**: @Resident_Advisor (for general questions)

## Next Steps

1. ✅ App architecture ready for API
2. ⏳ Contact RA for API access
3. ⏳ Receive API documentation and keys
4. ⏳ Update `.env` with real credentials
5. ⏳ Set `REACT_APP_USE_MOCK_DATA=false`
6. ⏳ Test with real data
7. ⏳ Deploy with proper security

## Questions?

The app is fully prepared for RA API integration. The mock data simulates the expected API response format, so switching to live data should be seamless once you have API access.