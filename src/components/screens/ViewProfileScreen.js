import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { LinkIcon, HeartIcon, CloseIcon } from '../../utils/icons';
import RAEventsModal from '../common/RAEventsModal';

const ViewProfileScreen = ({ profile, onClose, onOpenChat, onNavigateToMessages }) => {
  const { likedProfiles, toggleLike, sentRequests, sendConnectionRequest, connectedUsers } = useAppContext();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [showRAEvents, setShowRAEvents] = useState(false);

  if (!profile) {
    return null;
  }

  // Handle both MongoDB _id and old id format
  const profileId = profile._id || profile.id;

  const isLiked = likedProfiles.has(profileId);
  const isRequested = sentRequests.has(profileId);
  const isConnected = connectedUsers.has(profileId);

  const handleConnect = () => {
    if (!isRequested) {
      setShowMessageModal(true);
    }
  };

  const handleMessage = () => {
    // Open chat and navigate to messages tab
    if (onOpenChat) {
      onOpenChat(profile);
    }
    if (onNavigateToMessages) {
      onNavigateToMessages();
    }
  };
  
  const handleSendMessage = () => {
    sendConnectionRequest(profileId, message.trim() || '');
    setShowMessageModal(false);
    setMessage('');
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
  
  return (
    <div className="screen active view-profile-screen">
      <div className="view-profile-header">
        <button className="back-btn" onClick={onClose}>
          <CloseIcon />
        </button>
        <h1>{profile.name}</h1>
        <div style={{ width: '24px' }}></div>
      </div>
      
      <div className="view-profile-content">
        <div className="profile-header">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} />
              ) : (
                getInitial(profile.name)
              )}
            </div>
          </div>
          
          <div className="profile-name-role-container">
            <h2 className="profile-name">{profile.name}</h2>
          </div>
          <p className="profile-location">{profile.location}</p>
          <div className="profile-role-centered">
            <div className={getRoleBadgeClass(profile.role)}>
              {profile.role}
            </div>
          </div>
          {profile.genres && profile.genres.length > 0 && (
            <div className="profile-genres-container">
              <div className="profile-genres">
                {profile.genres.map(genre => (
                  <span key={genre} className="genre-tag">{genre}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Stats */}
        {(profile.followers || profile.connections) && (
          <div className="profile-stats">
            {profile.followers && (
              <div className="stat-item">
                <span className="stat-value">{profile.followers.toLocaleString()}</span>
                <span className="stat-label">Likes</span>
              </div>
            )}
            {profile.connections && (
              <div className="stat-item">
                <span className="stat-value">{profile.connections}</span>
                <span className="stat-label">Connections</span>
              </div>
            )}
            {profile.capacity && (
              <div className="stat-item">
                <span className="stat-value">{profile.capacity.toLocaleString()}</span>
                <span className="stat-label">Capacity</span>
              </div>
            )}
          </div>
        )}
        
        {/* Bio */}
        {profile.bio && (
          <div className="profile-bio">
            <p>{profile.bio}</p>
          </div>
        )}
        
        {/* Embedded Media Section */}
        <div className="profile-embeds">
          {profile.mixtape && (
            <div className="embed-card">
              <h4>Latest Mix</h4>
              <iframe 
                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(profile.mixtape)}&color=%23ff3366&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`}
                frameBorder="0"
                className="embed-iframe soundcloud-embed"
                title="SoundCloud Mix"
              />
            </div>
          )}
          
          {profile.spotify && (
            <div className="embed-card">
              <h4>Spotify Artist</h4>
              <iframe 
                src={(() => {
                  // Try to extract artist ID from URL, or use a default
                  const spotifyUrl = profile.spotify;
                  if (spotifyUrl.includes('/artist/')) {
                    const artistId = spotifyUrl.split('/artist/')[1]?.split('?')[0];
                    // Map known artist names to real Spotify IDs
                    const artistIdMap = {
                      'charlottedewitte': '1Xw1bPKYWsOPTvhbYOLa7G',
                      'amelielens': '0UFz5jBFwlNKaq7JmRnFJ1',
                      'benklock': '1VWvH904DqXmOPqWGYpcvm',
                      'ninakraviz': '4jj0DBvlOKXRNkNyw8SIlB',
                      'djnobu': '3EPcykAa9mr5CBXcDBQCxS',
                      'aldonna': '3EPcykAa9mr5CBXcDBQCxS'
                    };
                    return `https://open.spotify.com/embed/artist/${artistIdMap[artistId] || '3EPcykAa9mr5CBXcDBQCxS'}`;
                  }
                  return 'https://open.spotify.com/embed/artist/3EPcykAa9mr5CBXcDBQCxS';
                })()}
                frameBorder="0"
                allowTransparency="true"
                allow="encrypted-media"
                className="embed-iframe spotify-embed"
                title="Spotify Artist Profile"
              />
            </div>
          )}
          
          {profile.residentAdvisor && (
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
                href={profile.residentAdvisor}
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
          {profile.instagram && (
            <a 
              href={`https://instagram.com/${profile.instagram.replace('@', '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline btn-social"
            >
              <span>Instagram</span>
            </a>
          )}
          {profile.website && (
            <a 
              href={profile.website}
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline btn-social"
            >
              <span>Website</span>
            </a>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="profile-actions-bottom">
          <button 
            className={`btn ${isLiked ? 'btn-primary' : 'btn-outline'} btn-full-width`}
            onClick={() => toggleLike(profileId)}
          >
            <HeartIcon /> {isLiked ? 'Liked' : 'Like'}
          </button>
          {isConnected ? (
            <button
              className="btn btn-message btn-full-width"
              onClick={handleMessage}
            >
              Message
            </button>
          ) : (
            <button
              className={`btn ${isRequested ? 'btn-disabled' : 'btn-primary'} btn-full-width`}
              onClick={handleConnect}
              disabled={isRequested}
            >
              {isRequested ? 'Requested' : 'Connect'}
            </button>
          )}
        </div>
      </div>
        
      {/* Message Modal */}
        {showMessageModal && (
          <div className="message-modal-overlay" onClick={() => setShowMessageModal(false)}>
            <div className="message-modal-bottom" onClick={(e) => e.stopPropagation()}>
              <h2 className="message-modal-title">Send Message to {profile.name}</h2>
              <textarea
                placeholder="Write your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="5"
                className="message-textarea-bottom"
              />
              <div className="message-modal-actions">
                <button 
                  className="btn btn-outline btn-modal-cancel"
                  onClick={() => setShowMessageModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary btn-modal-send"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
        
      {/* RA Events Modal */}
      {showRAEvents && (
        <RAEventsModal 
          isOpen={showRAEvents}
          onClose={() => setShowRAEvents(false)}
          artistName={profile.name}
        />
      )}
    </div>
  );
};

export default ViewProfileScreen;