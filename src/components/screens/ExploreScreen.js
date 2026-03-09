import React, { useState, useRef, useEffect, useCallback } from 'react';
import { dummyProfiles } from '../../data/profiles';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ViewProfileScreen from './ViewProfileScreen';
import { SlashCircleIcon } from '../../utils/icons';

const ExploreScreen = ({ onOpenChat, onNavigateToMessages, onOpenPremium }) => {
  const { likedProfiles, toggleLike } = useAppContext();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewingProfile, setViewingProfile] = useState(null);
  const [showLikeLimitModal, setShowLikeLimitModal] = useState(false);
  const [likeLimitData, setLikeLimitData] = useState(null);
  const cardRef = useRef(null);

  // Filter out current user and put Aldonna first
  const otherProfiles = dummyProfiles.filter(profile => profile.id !== 1); // Exclude current user (Al Jones)
  const aldonnaProfile = otherProfiles.find(profile => profile.name === 'Aldonna');
  const remainingProfiles = otherProfiles.filter(profile => profile.name !== 'Aldonna');
  const exploreProfiles = aldonnaProfile ? [aldonnaProfile, ...remainingProfiles] : otherProfiles;
  
  const currentProfile = exploreProfiles[currentIndex];


  // Find who I liked that also likes this profile
  const getLikedByConnections = (profile) => {
    // Get profiles that current user has liked
    const myLikedProfiles = Array.from(likedProfiles)
      .map(id => dummyProfiles.find(p => p.id === id))
      .filter(p => p);
    
    // For demo: assume some of my liked profiles also liked this profile
    // In real app, this would check actual data
    const likedByNames = myLikedProfiles.slice(0, 3).map(p => p.name);
    return likedByNames;
  };

  const truncateBio = (bio) => {
    if (!bio) return '';
    const words = bio.split(' ');
    const maxWords = 15; // Reduced for better fit
    if (words.length <= maxWords) return bio;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const handleSwipe = async (direction) => {
    if (!currentProfile) return;

    setSwipeDirection(direction);

    if (direction === 'right') {
      try {
        await toggleLike(currentProfile.id);
      } catch (error) {
        console.error('Error liking profile:', error);

        // Check if error is due to like limit
        if (error.response?.status === 403 && error.response?.data?.error === 'Daily like limit reached') {
          const { limit, tier } = error.response.data;

          // Show like limit modal
          setLikeLimitData({ limit, tier });
          setShowLikeLimitModal(true);

          // Don't move to next card if like failed
          return;
        }
      }
    }

    // Move to next profile after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
      setDragPosition({ x: 0, y: 0 });
    }, 300);
  };

  const handleLike = useCallback(() => {
    handleSwipe('right');
  }, []);

  const handleReject = useCallback(() => {
    handleSwipe('left');
  }, []);

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setDragPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (dragPosition.x > threshold) {
      handleSwipe('right');
    } else if (dragPosition.x < -threshold) {
      handleSwipe('left');
    } else {
      setDragPosition({ x: 0, y: 0 });
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;
    setDragPosition({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (dragPosition.x > threshold) {
      handleSwipe('right');
    } else if (dragPosition.x < -threshold) {
      handleSwipe('left');
    } else {
      setDragPosition({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    if (!isDragging) {
      setDragPosition({ x: 0, y: 0 });
    }
  }, [isDragging]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleReject();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleLike();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentProfile, handleLike, handleReject]);

  const getCardStyle = () => {
    if (swipeDirection === 'left') {
      return {
        transform: 'translateX(-120%) rotate(-30deg)',
        opacity: 0,
        transition: 'all 0.3s ease-out'
      };
    }
    if (swipeDirection === 'right') {
      return {
        transform: 'translateX(120%) rotate(30deg)',
        opacity: 0,
        transition: 'all 0.3s ease-out'
      };
    }
    if (isDragging) {
      const rotation = dragPosition.x * 0.1;
      return {
        transform: `translate(${dragPosition.x}px, ${dragPosition.y}px) rotate(${rotation}deg)`,
        transition: 'none'
      };
    }
    return {
      transform: 'translate(0, 0) rotate(0)',
      transition: 'transform 0.2s ease-out'
    };
  };

  const getSwipeIndicatorOpacity = () => {
    const threshold = 100;
    if (dragPosition.x > 0) {
      return Math.min(dragPosition.x / threshold, 1);
    }
    return 0;
  };

  const getRejectIndicatorOpacity = () => {
    const threshold = 100;
    if (dragPosition.x < 0) {
      return Math.min(Math.abs(dragPosition.x) / threshold, 1);
    }
    return 0;
  };

  // Show viewing profile if selected
  if (viewingProfile) {
    return (
      <ViewProfileScreen
        profileId={viewingProfile}
        onClose={() => setViewingProfile(null)}
        onOpenChat={onOpenChat}
        onNavigateToMessages={onNavigateToMessages}
      />
    );
  }

  if (currentIndex >= exploreProfiles.length) {
    return (
      <div className="screen active explore-screen">
        <div className="explore-container">
          <div className="no-more-profiles">
            <h2>{t('explore.noMoreProfiles')}</h2>
            <p>{t('explore.checkBackLater')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="screen active explore-screen">
        <div className="explore-container">
          <div className="loading-state">
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  const likedByConnections = getLikedByConnections(currentProfile);

  return (
    <div className="screen active explore-screen">
      <div className="explore-container">
        <div className="swipe-card-container">
          <div 
            ref={cardRef}
            className="swipe-card"
            style={getCardStyle()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Like indicator */}
            <div 
              className="swipe-indicator like-indicator"
              style={{ opacity: getSwipeIndicatorOpacity() }}
            >
              LIKE
            </div>
            
            {/* Nope indicator */}
            <div 
              className="swipe-indicator nope-indicator"
              style={{ opacity: getRejectIndicatorOpacity() }}
            >
              NOPE
            </div>



            {/* Card Content */}
            <div className="card-content">
              {/* Centered Profile Image */}
              <div 
                className="card-avatar-container clickable"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingProfile(currentProfile.id);
                }}
              >
                {currentProfile.avatar ? (
                  <img 
                    src={currentProfile.avatar} 
                    alt={currentProfile.name}
                    className="card-avatar"
                    draggable={false}
                  />
                ) : (
                  <div className="card-avatar-placeholder">
                    {currentProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {currentProfile.isVerified && (
                  <span className="verified-badge">✓</span>
                )}
              </div>
              
              {/* Name */}
              <h2 className="card-name">{currentProfile.name}</h2>
              
              {/* Location */}
              <p className="card-location">{currentProfile.location}</p>
              
              {/* Role Badge */}
              <span className={`role-badge ${currentProfile.role.toLowerCase()}`}>
                {currentProfile.role}
              </span>
              
              {currentProfile.genres && currentProfile.genres.length > 0 && (
                <div className="card-genres">
                  {currentProfile.genres.slice(0, 3).map(genre => (
                    <span key={genre} className="genre-tag">{genre}</span>
                  ))}
                  {currentProfile.genres.length > 3 && (
                    <span className="genre-tag">+{currentProfile.genres.length - 3}</span>
                  )}
                </div>
              )}

              {/* Bio - 3 lines */}
              <div className="card-bio">
                <p>{truncateBio(currentProfile.bio)}</p>
              </div>

              {/* Mixtape Preview with Full Waveform for Artists */}
              {currentProfile.role === 'ARTIST' && currentProfile.mixtape && (
                <div className="card-mixtape-preview">
                  <iframe 
                    src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(currentProfile.mixtape)}&color=%23ff3366&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`}
                    frameBorder="0"
                    className="card-mixtape-iframe-visual"
                    title="Latest Mix Preview"
                  />
                </div>
              )}

              {likedByConnections.length > 0 && (
                <div className="liked-by-section">
                  <span className="liked-by-label">{t('explore.likedBy')}:</span>
                  <span className="liked-by-names">
                    {likedByConnections.join(', ')}
                  </span>
                </div>
              )}

              <button 
                className="view-profile-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingProfile(currentProfile.id);
                }}
              >
                {t('explore.viewFullProfile')}
              </button>


            </div>
          </div>

          {/* Removed Action Buttons */}
        </div>
      </div>

      {/* Like Limit Modal */}
      {showLikeLimitModal && likeLimitData && (
        <div className="modal-overlay" onClick={() => setShowLikeLimitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Daily Like Limit Reached</h3>
              <button className="modal-close" onClick={() => setShowLikeLimitModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="limit-message-centered">
                <div className="limit-icon">
                  <SlashCircleIcon />
                </div>
                <p className="limit-main-text">You've reached your daily limit. Upgrade to Premium for unlimited likes!</p>
              </div>

              <div className="tier-info-box">
                <p className="tier-details">Current plan: <strong>{likeLimitData.tier}</strong> • {likeLimitData.limit} likes per day</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setShowLikeLimitModal(false)}
              >
                Close
              </button>
              <button
                className="btn btn-upgrade"
                onClick={() => {
                  setShowLikeLimitModal(false);
                  if (onOpenPremium) {
                    onOpenPremium();
                  }
                }}
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreScreen;