import React, { useState, useEffect } from 'react';
import { zones, countriesByZone, citiesByCountry, genresList } from '../../data/profiles';
import { HeartIcon, FilterIcon } from '../../utils/icons';
import ViewProfileScreen from './ViewProfileScreen';
import Modal from '../common/Modal';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import apiService from '../../services/api';

const SearchScreen = ({ onOpenChat, onNavigateToMessages, onOpenPremium }) => {
  const { user, likedProfiles, toggleLike, sentRequests, sendConnectionRequest, connectedUsers } = useAppContext();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    roles: [],
    zones: [],
    countries: [],
    cities: [],
    genres: []
  });
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);

  // Fetch profiles from backend
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      // Use the public endpoint for now
      const profiles = await apiService.searchProfiles();
      setSearchResults(profiles || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load profiles on component mount
    fetchProfiles();
  }, []);

  const handleSearch = async () => {
    setHasSearched(true);
    setLoading(true);
    try {
      const params = {};

      // Add filters to params
      if (searchQuery) params.search = searchQuery;
      if (filters.roles.length > 0) params.role = filters.roles[0];
      if (filters.zones.length > 0) params.zone = filters.zones[0];
      if (filters.countries.length > 0) params.country = filters.countries[0];
      if (filters.cities.length > 0) params.city = filters.cities[0];
      if (filters.genres.length > 0) params.genre = filters.genres[0];

      const profiles = await apiService.searchProfiles(params);
      setSearchResults(profiles || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilterItem = (filterType, value) => {
    const newFilters = { ...filters };
    const currentArray = newFilters[filterType];
    
    if (currentArray.includes(value)) {
      newFilters[filterType] = currentArray.filter(item => item !== value);
    } else {
      newFilters[filterType] = [...currentArray, value];
    }
    
    setFilters(newFilters);
  };


  const clearFilters = () => {
    setFilters({
      roles: [],
      zones: [],
      countries: [],
      cities: [],
      genres: []
    });
  };

  const getAvailableCountries = () => {
    if (filters.zones.length > 0) {
      return filters.zones.flatMap(zone => countriesByZone[zone] || []).sort();
    }
    return Object.values(countriesByZone).flat().sort();
  };

  const getAvailableCities = () => {
    if (filters.countries.length > 0) {
      return filters.countries.flatMap(country => citiesByCountry[country] || []).sort();
    }
    return Object.values(citiesByCountry).flat().sort();
  };

  const activeFilterCount = Object.values(filters).reduce((count, arr) => count + arr.length, 0);

  const handleLike = (profileId) => {
    toggleLike(profileId);
  };

  const handleConnect = (profile) => {
    const profileId = profile._id || profile.id;
    if (!sentRequests.has(profileId)) {
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
      sendConnectionRequest(selectedProfile.id, message.trim() || '');
      setShowMessageModal(false);
      setMessage('');
      setSelectedProfile(null);
    }
  };

  const handleProfileClick = (profile) => {
    setViewingProfile(profile);
  };

  // Show viewing profile if selected
  if (viewingProfile) {
    return (
      <ViewProfileScreen
        profile={viewingProfile}
        onClose={() => setViewingProfile(null)}
        onOpenChat={onOpenChat}
        onNavigateToMessages={onNavigateToMessages}
      />
    );
  }

  return (
    <div className="screen active search-screen">
      <div className="search-header">
        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder={t('search.searchByName')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="filter-icon"><FilterIcon /></span> {t('search.filters')}
            {activeFilterCount > 0 && (
              <span className="filter-count">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Location limitation indicator */}
        {user && !user.isPremium && (
          <div className="search-limitation-notice">
            <div className="limitation-content">
              <span className="limitation-icon">📍</span>
              <span className="limitation-text">Searching in {user.city} only</span>
            </div>
            <button className="upgrade-btn" onClick={onOpenPremium}>
              <span className="upgrade-icon">✨</span>
              Upgrade to Premium
            </button>
          </div>
        )}

        {user && user.isPremium && (
          <div className="search-premium-notice">
            <span className="premium-icon">✨</span>
            <span>Searching worldwide with Premium</span>
          </div>
        )}

      </div>

      {/* Search Results */}
      <div className="search-results">
        {loading ? (
          <div className="loading-message">Loading profiles...</div>
        ) : searchResults.length > 0 ? (
          searchResults.map(profile => {
            const profileId = profile._id || profile.id;
            const isLiked = likedProfiles.has(profileId);
            const isRequested = sentRequests.has(profileId);
            const isConnected = connectedUsers.has(profileId);

            return (
              <div key={profileId} className="search-result-card">
                <div className="result-content">
                  <div 
                    className={`result-avatar avatar-${profile.role.toLowerCase()} clickable`}
                    onClick={() => handleProfileClick(profile)}
                  >
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} />
                    ) : (
                      profile.name.charAt(0).toUpperCase()
                    )}
                    {profile.isVerified && <span className="verified-badge">✓</span>}
                  </div>
                  <div 
                    className="result-info clickable"
                    onClick={() => handleProfileClick(profile)}
                  >
                    <div className="result-header">
                      <h3>{profile.name}</h3>
                      <span className={`role-badge ${profile.role.toLowerCase()}`}>
                        {profile.role}
                      </span>
                    </div>
                    <p className="result-location">{profile.location}</p>
                  </div>
                </div>
                <div className="result-actions">
                  <button
                    className={`btn ${isLiked ? 'btn-liked' : 'btn-outline'} btn-like`}
                    onClick={() => handleLike(profileId)}
                  >
                    <HeartIcon /> {isLiked ? t('search.liked') : t('search.like')}
                  </button>
                  {isConnected ? (
                    <button
                      className="btn btn-message btn-connect"
                      onClick={() => handleMessage(profile)}
                    >
                      Message
                    </button>
                  ) : (
                    <button
                      className={`btn ${isRequested ? 'btn-disabled' : 'btn-primary'} btn-connect`}
                      onClick={() => handleConnect(profile)}
                      disabled={isRequested}
                    >
                      {isRequested ? t('search.requested') : t('search.connect')}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <p>{hasSearched ? 'No results found' : 'Start searching to find profiles'}</p>
          </div>
        )}
      </div>
      
      {/* Filter Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title={t('search.filters')}
      >
        <div className="filter-modal-content">
          {/* Roles Dropdown */}
          <div className="filter-dropdown-group">
            <div 
              className="filter-dropdown-header"
              onClick={() => setOpenDropdown(openDropdown === 'roles' ? null : 'roles')}
            >
              <span>{t('search.roles')}</span>
              <span className="dropdown-value">
                {filters.roles.length > 0 
                  ? `${filters.roles.length} selected`
                  : 'Select roles'
                }
              </span>
              <span className="dropdown-arrow">{openDropdown === 'roles' ? '▲' : '▼'}</span>
            </div>
            {openDropdown === 'roles' && (
              <div className="filter-dropdown-content">
                {['ARTIST', 'AGENT', 'PROMOTER', 'VENUE'].map(role => (
                  <label key={role} className="filter-dropdown-item">
                    <input
                      type="checkbox"
                      checked={filters.roles.includes(role)}
                      onChange={() => toggleFilterItem('roles', role)}
                    />
                    <span>{role}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Zones Dropdown */}
          <div className="filter-dropdown-group">
            <div 
              className="filter-dropdown-header"
              onClick={() => setOpenDropdown(openDropdown === 'zones' ? null : 'zones')}
            >
              <span>{t('search.zones')}</span>
              <span className="dropdown-value">
                {filters.zones.length > 0 
                  ? `${filters.zones.length} selected`
                  : 'Select zones'
                }
              </span>
              <span className="dropdown-arrow">{openDropdown === 'zones' ? '▲' : '▼'}</span>
            </div>
            {openDropdown === 'zones' && (
              <div className="filter-dropdown-content">
                {zones.map(zone => (
                  <label key={zone} className="filter-dropdown-item">
                    <input
                      type="checkbox"
                      checked={filters.zones.includes(zone)}
                      onChange={() => toggleFilterItem('zones', zone)}
                    />
                    <span>{zone}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Countries Dropdown */}
          <div className="filter-dropdown-group">
            <div 
              className="filter-dropdown-header"
              onClick={() => setOpenDropdown(openDropdown === 'countries' ? null : 'countries')}
            >
              <span>{t('search.countries')}</span>
              <span className="dropdown-value">
                {filters.countries.length > 0 
                  ? `${filters.countries.length} selected`
                  : 'Select countries'
                }
              </span>
              <span className="dropdown-arrow">{openDropdown === 'countries' ? '▲' : '▼'}</span>
            </div>
            {openDropdown === 'countries' && (
              <div className="filter-dropdown-content scrollable">
                {getAvailableCountries().map(country => (
                  <label key={country} className="filter-dropdown-item">
                    <input
                      type="checkbox"
                      checked={filters.countries.includes(country)}
                      onChange={() => toggleFilterItem('countries', country)}
                    />
                    <span>{country}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Cities Dropdown */}
          <div className="filter-dropdown-group">
            <div 
              className="filter-dropdown-header"
              onClick={() => setOpenDropdown(openDropdown === 'cities' ? null : 'cities')}
            >
              <span>{t('search.cities')}</span>
              <span className="dropdown-value">
                {filters.cities.length > 0 
                  ? `${filters.cities.length} selected`
                  : 'Select cities'
                }
              </span>
              <span className="dropdown-arrow">{openDropdown === 'cities' ? '▲' : '▼'}</span>
            </div>
            {openDropdown === 'cities' && (
              <div className="filter-dropdown-content scrollable">
                {getAvailableCities().map(city => (
                  <label key={city} className="filter-dropdown-item">
                    <input
                      type="checkbox"
                      checked={filters.cities.includes(city)}
                      onChange={() => toggleFilterItem('cities', city)}
                    />
                    <span>{city}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Genres Dropdown */}
          <div className="filter-dropdown-group">
            <div 
              className="filter-dropdown-header"
              onClick={() => setOpenDropdown(openDropdown === 'genres' ? null : 'genres')}
            >
              <span>{t('search.genres')}</span>
              <span className="dropdown-value">
                {filters.genres.length > 0 
                  ? `${filters.genres.length} selected`
                  : 'Select genres'
                }
              </span>
              <span className="dropdown-arrow">{openDropdown === 'genres' ? '▲' : '▼'}</span>
            </div>
            {openDropdown === 'genres' && (
              <div className="filter-dropdown-content scrollable">
                {genresList.map(genre => (
                  <label key={genre} className="filter-dropdown-item">
                    <input
                      type="checkbox"
                      checked={filters.genres.includes(genre)}
                      onChange={() => toggleFilterItem('genres', genre)}
                    />
                    <span>{genre}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Filter Actions */}
          <div className="filter-modal-actions">
            <button className="btn btn-outline" onClick={clearFilters}>
              {t('search.clearFilters')}
            </button>
            <button className="btn btn-primary" onClick={() => {
              handleSearch();
              setShowFilters(false);
            }}>
              {t('search.applyFilters')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Message Modal */}
      {showMessageModal && selectedProfile && (
        <div className="message-modal-overlay" onClick={() => {
          setShowMessageModal(false);
          setSelectedProfile(null);
          setMessage('');
        }}>
          <div className="message-modal-bottom" onClick={(e) => e.stopPropagation()}>
            <h2 className="message-modal-title">{t('search.sendMessageTo')} {selectedProfile.name}</h2>
            <textarea
              placeholder={t('messages.writeMessage')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="5"
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
                {t('messages.cancel')}
              </button>
              <button 
                className="btn btn-primary btn-modal-send"
                onClick={handleSendMessage}
              >
                {t('messages.send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchScreen;