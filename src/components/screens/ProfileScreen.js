import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Modal from '../common/Modal';
import RAEventsModal from '../common/RAEventsModal';
import { CalendarIcon, UploadIcon, SwitchIcon, AddIcon } from '../../utils/icons';
import CalendarScreen from './CalendarScreen';
import EditProfileScreen from './EditProfileScreen';
import RepresentedArtistsScreen from './RepresentedArtistsScreen';
import AddProfileScreen from './AddProfileScreen';
import apiService from '../../services/api';

const ProfileScreen = () => {
  const { user, updateUser, userProfiles, switchProfile, addProfile, likedProfiles, likedProfilesData, connectedUsers, connectedUsersData, likerProfilesData } = useAppContext();
  const { t } = useLanguage();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showRepresentedArtists, setShowRepresentedArtists] = useState(false);
  const [showLikesList, setShowLikesList] = useState(false);
  const [showLikersList, setShowLikersList] = useState(false);
  const [showConnectionsList, setShowConnectionsList] = useState(false);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showRAEvents, setShowRAEvents] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const fileInputRef = useRef(null);
  const [resolvedSoundCloudUrl, setResolvedSoundCloudUrl] = useState(null);
  const [resolvedSpotifyId, setResolvedSpotifyId] = useState(null);

  // Handle SoundCloud URLs
  React.useEffect(() => {
    if (user?.mixtape) {
      // Accept soundcloud.com or m.soundcloud.com URLs (not on.soundcloud.com short links)
      const isValidSoundCloud = (user.mixtape.includes('soundcloud.com/') || user.mixtape.includes('m.soundcloud.com/'))
        && !user.mixtape.includes('on.soundcloud.com');

      if (isValidSoundCloud) {
        // Convert m.soundcloud.com to soundcloud.com for embed
        const embedUrl = user.mixtape.replace('m.soundcloud.com', 'soundcloud.com');
        setResolvedSoundCloudUrl(embedUrl);
      } else {
        setResolvedSoundCloudUrl(null);
      }
    }
  }, [user?.mixtape]);

  // Handle Spotify URLs
  React.useEffect(() => {
    if (user?.spotify) {
      // Only accept full spotify.com URLs with /artist/
      if (user.spotify.includes('open.spotify.com') && user.spotify.includes('/artist/')) {
        const artistId = user.spotify.split('/artist/')[1]?.split('?')[0]?.split('/')[0];
        setResolvedSpotifyId(artistId);
      } else {
        setResolvedSpotifyId(null);
      }
    }
  }, [user?.spotify]);
  
  const [editForm] = useState({
    name: user?.name || 'Your Name',
    role: user?.role || 'ARTIST',
    bio: user?.bio || '',
    location: user?.location || 'Tokyo, Japan',
    city: user?.city || 'Tokyo',
    country: user?.country || 'Japan',
    genres: user?.genres || [],
    residentAdvisor: user?.residentAdvisor || '',
    mixtape: user?.mixtape || '',
    spotify: user?.spotify || '',
    instagram: user?.instagram || '',
    website: user?.website || '',
    spotifyTracks: user?.spotifyTracks || [],
    calendarVisible: user?.calendarVisible !== undefined ? user.calendarVisible : true
  });

  const [selectedGenres, setSelectedGenres] = useState(editForm.genres || []);

  // DEBUG: Log profile count
  useEffect(() => {
    console.log('🔍 [ProfileScreen] userProfiles count:', userProfiles?.length || 0);
    console.log('🔍 [ProfileScreen] userProfiles:', userProfiles);
  }, [userProfiles]);

  // OPTIMIZED: Use cached profile data from AppContext instead of fetching
  const likedProfilesList = likedProfilesData || [];
  const likerProfilesList = likerProfilesData || [];
  const connectionsList = connectedUsersData || [];

  // No need to fetch - data is already loaded in AppContext
  useEffect(() => {
    // This effect is now just for debugging/logging if needed
    if (user?._id) {
      console.log('ProfileScreen: Using cached profile data');
      console.log('Liked profiles:', likedProfilesList.length);
      console.log('Likers:', likerProfilesList.length);
      console.log('Connections:', connectionsList.length);
    }
  }, [user?._id, likedProfilesList.length, likerProfilesList.length, connectionsList.length]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const avatarData = reader.result;
          const profileId = user._id || user.id;

          if (!profileId) {
            console.error('Profile ID is missing');
            return;
          }

          // Save to backend immediately
          const updatedProfile = await apiService.updateProfile(profileId, {
            ...user,
            avatar: avatarData
          });

          // Update local state with response from backend
          updateUser(updatedProfile);
        } catch (error) {
          console.error('Failed to upload avatar:', error);
          alert('Failed to upload image. Please try again.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  const getRoleBadgeClass = (role) => {
    const roleClasses = {
      'ARTIST': 'role-badge',
      'VENUE': 'role-badge venue',
      'PROMOTER': 'role-badge promoter',
      'AGENT': 'role-badge agent'
    };
    return roleClasses[role] || 'role-badge';
  };

  // Show full-screen calendar if requested
  if (showCalendar) {
    return <CalendarScreen onClose={() => setShowCalendar(false)} />;
  }

  // Show full-screen represented artists if requested
  if (showRepresentedArtists) {
    return <RepresentedArtistsScreen onClose={() => setShowRepresentedArtists(false)} />;
  }

  // Show full-screen edit profile if requested
  if (showEditProfile) {
    return <EditProfileScreen onClose={() => setShowEditProfile(false)} />;
  }

  // Show add profile screen if requested
  if (showAddProfile) {
    return (
      <AddProfileScreen
        onClose={() => setShowAddProfile(false)}
        onSuccess={(newProfile) => {
          // Switch to the new profile
          switchProfile(newProfile._id || newProfile.id);
        }}
      />
    );
  }

  return (
    <div className="screen active profile-screen">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <div 
            className="profile-avatar clickable"
            onClick={() => fileInputRef.current?.click()}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.name} />
            ) : (
              getInitial(user?.name)
            )}
            <div className="avatar-upload-overlay">
              <UploadIcon />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>
        
        <h2 className="profile-name">{user?.name || t('profile.yourName')}</h2>
        <p className="profile-location">{user?.location || t('profile.addLocation')}</p>
        <div className={getRoleBadgeClass(user?.role)}>
          {user?.role || 'ARTIST'}
        </div>
        {user?.genres && user.genres.length > 0 && (
          <div className="profile-genres-container">
            <div className={`profile-genres ${showAllGenres ? 'expanded' : 'collapsed'}`}>
              {user.genres.map(genre => (
                <span key={genre} className="genre-tag">{genre}</span>
              ))}
            </div>
            {user.genres.length > 6 && (
              <button 
                className="see-more-btn"
                onClick={() => setShowAllGenres(!showAllGenres)}
              >
                {showAllGenres ? t('profile.seeLess') : t('profile.seeMore')}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="profile-stats">
        <div className="stat-item" onClick={() => setShowLikesList(true)}>
          <span className="stat-value">{likedProfiles.size}</span>
          <span className="stat-label">{t('profile.liked')}</span>
        </div>
        <div className="stat-item" onClick={() => setShowLikersList(true)}>
          <span className="stat-value">{likerProfilesList.length}</span>
          <span className="stat-label">{t('profile.likes')}</span>
        </div>
        <div className="stat-item" onClick={() => setShowConnectionsList(true)}>
          <span className="stat-value">{connectedUsers.size}</span>
          <span className="stat-label">{t('profile.connections')}</span>
        </div>
      </div>


      <div className="profile-actions">
        <button 
          className="btn btn-primary btn-full-width"
          onClick={() => setShowEditProfile(true)}
        >
          {t('profile.editProfile')}
        </button>
        {user?.role === 'AGENT' ? (
          <button
            className="btn btn-outline btn-full-width"
            onClick={() => setShowRepresentedArtists(true)}
          >
            <AddIcon /> Represented Artists
          </button>
        ) : (
          <button
            className="btn btn-outline btn-full-width"
            onClick={() => setShowCalendar(true)}
          >
            <CalendarIcon /> {t('profile.calendar')}
          </button>
        )}
        <button
          className="btn btn-secondary btn-full-width"
          onClick={() => setShowProfileSwitcher(true)}
        >
          {userProfiles.length > 1 ? (
            <><SwitchIcon /> Switch Profile</>
          ) : (
            <><AddIcon /> Add Profile</>
          )}
        </button>
      </div>

      {/* Bio Section */}
      {user?.bio && (
        <div className="profile-bio">
          <p>{user.bio}</p>
        </div>
      )}

      {/* Agent Artists Representing Section */}
      {user?.role === 'AGENT' && (
        <div className="agent-artists-section">
          <h3>Artists Representing</h3>
          <div className="agent-artists-grid">
            {user?.representingArtists ? user.representingArtists.map(artist => (
              <div key={artist.id} className="agent-artist-card">
                <div className="agent-artist-avatar">
                  {artist.avatar ? (
                    <img src={artist.avatar} alt={artist.name} />
                  ) : (
                    <span>{artist.name.charAt(0)}</span>
                  )}
                </div>
                <div className="agent-artist-info">
                  <h4>{artist.name}</h4>
                  <p>{artist.location}</p>
                  <div className="agent-artist-genres">
                    {artist.genres?.slice(0, 2).map(genre => (
                      <span key={genre} className="genre-tag-small">{genre}</span>
                    ))}
                  </div>
                </div>
              </div>
            )) : (
              <div className="no-artists-message">
                <p>No artists added yet</p>
                <button className="btn btn-outline">Add Artists</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embedded Media Section */}
      <div className="profile-embeds">
        {user?.mixtape && (
          <div className="embed-card">
            <h4>Latest Mix</h4>
            {resolvedSoundCloudUrl ? (
              <iframe
                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(resolvedSoundCloudUrl)}&color=%23ff3366&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`}
                frameBorder="0"
                className="embed-iframe soundcloud-embed"
                title="SoundCloud Mix"
              />
            ) : (
              <div className="embed-placeholder">
                <p style={{ marginBottom: '8px' }}>⚠️ Please use the full SoundCloud URL</p>
                <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '12px' }}>
                  Example: https://soundcloud.com/artist/track-name
                </p>
                <button
                  className="btn btn-outline"
                  onClick={() => setShowEditProfile(true)}
                >
                  Update Link
                </button>
              </div>
            )}
          </div>
        )}

        {user?.spotify && (
          <div className="embed-card">
            <h4>Spotify Artist</h4>
            {resolvedSpotifyId ? (
              <iframe
                src={`https://open.spotify.com/embed/artist/${resolvedSpotifyId}`}
                frameBorder="0"
                allowTransparency="true"
                allow="encrypted-media"
                className="embed-iframe spotify-embed"
                title="Spotify Artist Profile"
              />
            ) : (
              <div className="embed-placeholder">
                <p style={{ marginBottom: '8px' }}>⚠️ Please use the full Spotify URL</p>
                <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '12px' }}>
                  Example: https://open.spotify.com/artist/XXXXX
                </p>
                <button
                  className="btn btn-outline"
                  onClick={() => setShowEditProfile(true)}
                >
                  Update Link
                </button>
              </div>
            )}
          </div>
        )}
        
        {user?.residentAdvisor && (
          <div className="embed-card ra-card">
            <h4>Events</h4>
            <button 
              className="ra-events-button"
              onClick={() => setShowRAEvents(true)}
            >
              <span className="ra-icon">📅</span>
              <span>View Upcoming Events</span>
            </button>
            <a 
              href={user.residentAdvisor}
              target="_blank"
              rel="noopener noreferrer"
              className="ra-profile-link"
            >
              View Full RA Profile →
            </a>
          </div>
        )}
      </div>

      {/* Social CTAs */}
      <div className="profile-social-ctas">
        {user?.instagram && (
          <a 
            href={`https://instagram.com/${user.instagram.replace('@', '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline btn-social"
          >
            <span>Instagram</span>
          </a>
        )}
        <button 
          className={`btn btn-outline btn-social ${!user?.website ? 'disabled' : ''}`}
          onClick={() => user?.website && window.open(user.website, '_blank')}
          disabled={!user?.website}
        >
          <span>Website</span>
        </button>
      </div>

      {/* Likes List Modal */}
      <Modal
        isOpen={showLikesList}
        onClose={() => setShowLikesList(false)}
        title="Profiles You Liked"
      >
        <div className="profiles-list">
          {likedProfilesList.length > 0 ? (
            likedProfilesList.map(profile => (
              <div key={profile._id || profile.id} className="profile-list-item">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} />
                ) : (
                  <div className="profile-avatar-placeholder">{profile.name.charAt(0)}</div>
                )}
                <div className="profile-info">
                  <h4>{profile.name}</h4>
                  <span className="profile-role">{profile.role}</span>
                  <span className="profile-location">{profile.location}</span>
                </div>
              </div>
            ))
          ) : (
            <p>No liked profiles yet</p>
          )}
        </div>
      </Modal>

      {/* Likers List Modal */}
      <Modal
        isOpen={showLikersList}
        onClose={() => setShowLikersList(false)}
        title="Profiles That Liked You"
      >
        <div className="profiles-list">
          {likerProfilesList.length > 0 ? (
            likerProfilesList.map(profile => (
              <div key={profile._id || profile.id} className="profile-list-item">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} />
                ) : (
                  <div className="profile-avatar-placeholder">{profile.name.charAt(0)}</div>
                )}
                <div className="profile-info">
                  <h4>{profile.name}</h4>
                  <span className="profile-role">{profile.role}</span>
                  <span className="profile-location">{profile.location}</span>
                </div>
              </div>
            ))
          ) : (
            <p>No one has liked you yet</p>
          )}
        </div>
      </Modal>

      {/* Connections List Modal */}
      <Modal
        isOpen={showConnectionsList}
        onClose={() => setShowConnectionsList(false)}
        title={t('profile.connections')}
      >
        <div className="profiles-list">
          {connectionsList.length > 0 ? (
            connectionsList.map(profile => (
              <div key={profile._id || profile.id} className="profile-list-item">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} />
                ) : (
                  <div className="profile-avatar-placeholder">{profile.name.charAt(0)}</div>
                )}
                <div className="profile-info">
                  <h4>{profile.name}</h4>
                  <span className="profile-role">{profile.role}</span>
                  <span className="profile-location">{profile.location}</span>
                </div>
              </div>
            ))
          ) : (
            <p>No connections yet</p>
          )}
        </div>
      </Modal>

      {/* Profile Switcher Modal */}
      <Modal
        isOpen={showProfileSwitcher}
        onClose={() => setShowProfileSwitcher(false)}
        title={userProfiles.length > 1 ? "Switch Profile" : "Add Profile"}
      >
        <div className="profile-switcher-content">
          {userProfiles.length > 1 && (
            <p className="profile-switcher-description">
              Select which profile you want to manage:
            </p>
          )}
          <div className="profile-switcher-list">
            {userProfiles.map(profile => (
              <div
                key={profile._id || profile.id}
                className={`profile-switcher-item ${profile._id === user?._id || profile.id === user?.id ? 'active' : ''}`}
                onClick={() => {
                  switchProfile(profile._id || profile.id);
                  setShowProfileSwitcher(false);
                }}
              >
                <div className="switcher-avatar">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} />
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="switcher-info">
                  <h4>{profile.name}</h4>
                  <span className={`role-badge ${profile.role.toLowerCase()}`}>
                    {profile.role}
                  </span>
                  <p className="switcher-location">{profile.location}</p>
                </div>
                {(profile._id === user?._id || profile.id === user?.id) && (
                  <div className="active-indicator">✓</div>
                )}
              </div>
            ))}

            {/* Add Profile Button */}
            <div
              className="profile-switcher-item add-profile-item"
              onClick={() => {
                setShowProfileSwitcher(false);
                setShowAddProfile(true);
              }}
            >
              <div className="switcher-avatar add-avatar">
                <AddIcon />
              </div>
              <div className="switcher-info">
                <h4>Add New Profile</h4>
                <p className="add-profile-description">Create another professional profile</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* RA Events Modal */}
      <RAEventsModal
        isOpen={showRAEvents}
        onClose={() => setShowRAEvents(false)}
        artistName={user?.name}
        raUrl={user?.residentAdvisor}
      />
    </div>
  );
};

export default ProfileScreen;