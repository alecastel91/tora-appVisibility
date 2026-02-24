import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ViewProfileScreen from './ViewProfileScreen';
import { CalendarIcon, PlaneIcon, LocationIcon, HandshakeIcon, DollarIcon, TargetIcon, StarIcon, EyeIcon } from '../../utils/icons';
import apiService from '../../services/api';

const TourScreen = ({ onOpenChat, onNavigateToMessages }) => {
  const { user, getCalendarMatches, sentRequests, sendConnectionRequest, connectedUsers } = useAppContext();
  const { t } = useLanguage();

  // Tab state
  const [activeTab, setActiveTab] = useState('calendar');  // 'calendar' or 'kickstart'

  // Calendar Matches state
  const [viewingProfile, setViewingProfile] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [calendarMatches, setCalendarMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Generate month/year options starting from current month for next 12 months
  const generateMonthOptions = () => {
    const options = [{ value: 'all', label: 'All Months' }];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const year = currentYear + Math.floor((currentMonth + i) / 12);
      const monthName = months[monthIndex];
      options.push({
        value: `${monthName.toLowerCase()}-${year}`,
        label: `${monthName} ${year}`
      });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  // Fetch calendar matches when user is premium and has available dates
  useEffect(() => {
    const fetchCalendarMatches = async () => {
      if (!user || !user.isPremium || !user.availableDates || user.availableDates.length === 0) {
        setCalendarMatches([]);
        return;
      }

      setLoadingMatches(true);
      try {
        // Fetch all profiles from backend (no filters = get all)
        const response = await apiService.searchProfiles({});
        const allProfiles = response.profiles || [];

        // Find matches
        const userAvailableDates = new Set(user.availableDates);
        const matches = [];

        for (const profile of allProfiles) {
          // Skip self
          if (profile._id === user._id) continue;

          // Check role compatibility
          if (!isValidRoleMatch(user.role, profile.role)) continue;

          // Check genre matching - must have at least one genre in common
          const userGenres = user.genres || [];
          const profileGenres = profile.genres || [];

          // Skip if either has no genres, or if they have no common genres
          if (userGenres.length === 0 || profileGenres.length === 0) {
            continue;
          }

          const hasCommonGenre = userGenres.some(genre => profileGenres.includes(genre));
          if (!hasCommonGenre) {
            continue;
          }

          // Check for overlapping available dates
          const profileAvailableDates = profile.availableDates || [];
          const overlappingDates = profileAvailableDates.filter(date => userAvailableDates.has(date));

          if (overlappingDates.length > 0) {
            // Format dates for display
            const datesFormatted = formatMatchDates(overlappingDates);

            matches.push({
              profile,
              dates: datesFormatted,
              matchCount: overlappingDates.length,
              rawDates: overlappingDates
            });
          }
        }

        // Sort by number of matching dates (most matches first)
        matches.sort((a, b) => b.matchCount - a.matchCount);

        setCalendarMatches(matches);
      } catch (error) {
        console.error('Error fetching calendar matches:', error);
        setCalendarMatches([]);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchCalendarMatches();
  }, [user?._id, user?.isPremium, user?.availableDates?.length, activeTab]);

  // Helper function to check role compatibility
  const isValidRoleMatch = (role1, role2) => {
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

  // Helper function to normalize date format (YYYY-M-D to YYYY-MM-DD)
  const normalizeDate = (dateStr) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Helper function to format overlapping dates for display
  const formatMatchDates = (dates) => {
    if (dates.length === 0) return '';

    // Normalize and sort dates
    const sortedDates = [...dates].map(normalizeDate).sort();

    // Group consecutive dates
    const groups = [];
    let currentGroup = [sortedDates[0]];

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        // Consecutive date
        currentGroup.push(sortedDates[i]);
      } else {
        // Gap - start new group
        groups.push(currentGroup);
        currentGroup = [sortedDates[i]];
      }
    }
    groups.push(currentGroup);

    // Format each group
    const formattedGroups = groups.slice(0, 3).map(group => {
      const startDate = new Date(group[0]);
      const endDate = new Date(group[group.length - 1]);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[startDate.getMonth()];
      const year = startDate.getFullYear();

      if (group.length === 1) {
        return `${month} ${startDate.getDate()}, ${year}`;
      } else {
        return `${month} ${startDate.getDate()}-${endDate.getDate()}, ${year}`;
      }
    });

    return formattedGroups.join('; ');
  };

  const allMatches = calendarMatches;

  // Filter matches based on selected filters
  const filteredMatches = allMatches.filter(match => {
    // Genre matching - must have at least one genre in common
    const userGenres = user?.genres || [];
    const matchGenres = match.profile.genres || [];

    // Skip if either has no genres, or if they have no common genres
    if (userGenres.length === 0 || matchGenres.length === 0) {
      return false;
    }

    const hasCommonGenre = userGenres.some(genre => matchGenres.includes(genre));
    if (!hasCommonGenre) {
      return false;
    }

    // Role filter
    if (roleFilter !== 'all' && match.profile.role !== roleFilter) {
      return false;
    }

    // Month/Year filter
    if (monthFilter !== 'all') {
      // Extract month and year from dates string (e.g., "Jan 8-10, 2025")
      const dateParts = match.dates.split(' ');
      const matchMonth = dateParts[0].toLowerCase();
      const matchYear = dateParts[dateParts.length - 1];

      // Extract month and year from filter (e.g., "jan-2025")
      const [filterMonth, filterYear] = monthFilter.split('-');

      if (matchMonth !== filterMonth || matchYear !== filterYear) {
        return false;
      }
    }

    return true;
  });

  const matches = filteredMatches;

  const handleConnect = (profile) => {
    if (!sentRequests.has(profile.id)) {
      setSelectedProfile(profile);
      setShowMessageModal(true);
    }
  };

  const handleMessage = (profile) => {
    // Open chat and navigate to messages tab
    if (onOpenChat) {
      onOpenChat(profile);
    }
    if (onNavigateToMessages) {
      onNavigateToMessages();
    }
  };

  const handleSendMessage = () => {
    if (selectedProfile) {
      const profileId = selectedProfile._id || selectedProfile.id;
      sendConnectionRequest(profileId, message.trim() || '');
      setShowMessageModal(false);
      setMessage('');
      setSelectedProfile(null);
    }
  };

  const handleProfileClick = (profileId) => {
    console.log('[TourScreen] Opening profile:', profileId);
    setViewingProfile(profileId);
  };

  // Show viewing profile if selected
  if (viewingProfile) {
    // Find the profile object from the matches
    const profileToView = calendarMatches.find(m => {
      const id = m.profile._id || m.profile.id;
      return id === viewingProfile;
    })?.profile;

    if (!profileToView) {
      // If profile not found, close the view
      setViewingProfile(null);
      return null;
    }

    return (
      <ViewProfileScreen
        profile={profileToView}
        onClose={() => setViewingProfile(null)}
        onOpenChat={onOpenChat}
        onNavigateToMessages={onNavigateToMessages}
      />
    );
  }

  // Calendar Matches Tab Content
  const renderCalendarMatches = () => {
    // Show upgrade prompt for basic users
    if (!user?.isPremium) {
      return (
        <div className="tour-kickstart-content">
          <div className="coming-soon-placeholder">
            <div className="coming-soon-icon">
              <StarIcon />
            </div>
            <h2>Unlock Calendar Matching</h2>
            <p>Connect with professionals based on matching travel schedules</p>
            <div className="feature-preview">
              <h4>Premium features:</h4>
              <ul className="feature-list">
                <li>
                  <span className="feature-icon"><CalendarIcon /></span>
                  <span>Find profiles with matching availability</span>
                </li>
                <li>
                  <span className="feature-icon"><LocationIcon /></span>
                  <span>Search globally, not just locally</span>
                </li>
                <li>
                  <span className="feature-icon"><TargetIcon /></span>
                  <span>See when artists are touring your city</span>
                </li>
                <li>
                  <span className="feature-icon"><EyeIcon /></span>
                  <span>Control your calendar visibility</span>
                </li>
              </ul>
            </div>
            <button className="btn coming-soon-badge" style={{ cursor: 'pointer', border: 'none' }}>
              Upgrade to Premium
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="tour-kickstart-content">
        <div className="coming-soon-placeholder">
          <p style={{ marginBottom: '24px', marginTop: 0 }}>Find professionals with matching travel schedules, availability, and music genres</p>

          <div className="feature-preview">
            {/* Filters Section */}
            <div className="matches-filters">
              <div className="filter-group">
                <label className="filter-label">Role</label>
                <select
                  className="filter-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="VENUE">Venues</option>
                  <option value="PROMOTER">Promoters</option>
                  <option value="AGENT">Agents</option>
                  <option value="ARTIST">Artists</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Period</label>
                <select
                  className="filter-select"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                >
                  {monthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {(roleFilter !== 'all' || monthFilter !== 'all') && (
                <button
                  className="filter-clear-btn"
                  onClick={() => {
                    setRoleFilter('all');
                    setMonthFilter('all');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {matches.length > 0 ? (
              <div className="matches-results">
                <p className="matches-count">
                  {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
                </p>

                {matches.map((match, index) => {
                  const profileId = match.profile._id || match.profile.id;
                  const isRequested = sentRequests.has(profileId);
                  const isConnected = connectedUsers.has(profileId);

                  return (
                    <div key={`${profileId}-${index}`} className="match-card-simple">
                      <div className="match-date-location">
                        <span><CalendarIcon /> {match.dates}</span>
                        <span><LocationIcon /> {match.profile.location}</span>
                      </div>

                      <div className="match-profile-content">
                        <div
                          className={`match-avatar avatar-${match.profile.role.toLowerCase()} clickable`}
                          onClick={() => handleProfileClick(profileId)}
                        >
                          {match.profile.avatar ? (
                            <img src={match.profile.avatar} alt={match.profile.name} />
                          ) : (
                            match.profile.name.charAt(0).toUpperCase()
                          )}
                          {match.profile.isVerified && <span className="verified-badge">✓</span>}
                        </div>

                        <div
                          className="match-info clickable"
                          onClick={() => handleProfileClick(profileId)}
                        >
                          <div className="match-name-role">
                            <h3>{match.profile.name}</h3>
                            <span className={`role-badge ${match.profile.role.toLowerCase()}`}>
                              {match.profile.role}
                            </span>
                          </div>
                          <p className="match-base-location">{match.profile.location}</p>
                        </div>
                      </div>

                      {match.profile.genres && match.profile.genres.length > 0 && (
                        <div className="match-genres-simple">
                          {match.profile.genres.slice(0, 3).map(genre => (
                            <span key={genre} className="genre-tag-small">{genre}</span>
                          ))}
                          {match.profile.genres.length > 3 && (
                            <span className="genre-tag-small">+{match.profile.genres.length - 3}</span>
                          )}
                        </div>
                      )}

                      {isConnected ? (
                        <button
                          className="btn btn-message btn-match-full"
                          onClick={() => handleMessage(match.profile)}
                        >
                          Message
                        </button>
                      ) : (
                        <button
                          className={`btn ${isRequested ? 'btn-disabled' : 'btn-primary'} btn-match-full`}
                          onClick={() => handleConnect(match.profile)}
                          disabled={isRequested}
                        >
                          {isRequested ? 'Requested' : 'Connect'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-matches-simple">
                <p>No profiles match your travel schedule or events.</p>
                <div className="no-matches-tips">
                  <h4>Tips to get more matches:</h4>
                  <ul className="feature-list">
                    <li>
                      <span className="feature-icon"><CalendarIcon /></span>
                      <span>Add travel dates to your calendar</span>
                    </li>
                    <li>
                      <span className="feature-icon"><EyeIcon /></span>
                      <span>Make sure your calendar is visible</span>
                    </li>
                    <li>
                      <span className="feature-icon"><LocationIcon /></span>
                      <span>Check if there are profiles in your destinations</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Tour Kickstart Tab Content (placeholder for now)
  const renderTourKickstart = () => {
    return (
      <div className="tour-kickstart-content">
        <div className="coming-soon-placeholder">
          <div className="coming-soon-icon">
            <PlaneIcon />
          </div>
          <h2>Tour Kickstart</h2>
          <p>Connect with promoters across a region to build a tour together</p>
          <div className="feature-preview">
            <h4>How it works:</h4>
            <ul className="feature-list">
              <li>
                <span className="feature-icon"><LocationIcon /></span>
                <span>Artists set tour goals (region, dates, minimum gigs)</span>
              </li>
              <li>
                <span className="feature-icon"><HandshakeIcon /></span>
                <span>Promoters contribute gigs to complete the tour</span>
              </li>
              <li>
                <span className="feature-icon"><DollarIcon /></span>
                <span>Share costs and maximize touring opportunities</span>
              </li>
              <li>
                <span className="feature-icon"><TargetIcon /></span>
                <span>Make regional tours viable for emerging artists</span>
              </li>
            </ul>
          </div>
          <div className="coming-soon-badge">Coming Soon</div>
        </div>
      </div>
    );
  };

  return (
    <div className="screen active matches-screen tour-screen">
      {/* Sub-tabs */}
      <div className="tour-tabs">
        <button
          className={`tour-tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <CalendarIcon />
          <span>Calendar Matches</span>
        </button>
        <button
          className={`tour-tab ${activeTab === 'kickstart' ? 'active' : ''}`}
          onClick={() => setActiveTab('kickstart')}
        >
          <PlaneIcon />
          <span>Tour Kickstart</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tour-tab-content">
        {activeTab === 'calendar' ? renderCalendarMatches() : renderTourKickstart()}
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedProfile && (
        <div className="message-modal-overlay" onClick={() => {
          setShowMessageModal(false);
          setSelectedProfile(null);
          setMessage('');
        }}>
          <div className="message-modal-bottom" onClick={(e) => e.stopPropagation()}>
            <h2 className="message-modal-title">Connect with {selectedProfile.name}</h2>
            <textarea
              placeholder="Introduce yourself and mention the calendar match..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              className="message-textarea-bottom"
            />
            <div className="message-modal-actions">
              <button
                className="btn btn-outline btn-modal-cancel"
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedProfile(null);
                  setMessage('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-modal-send"
                onClick={handleSendMessage}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourScreen;
