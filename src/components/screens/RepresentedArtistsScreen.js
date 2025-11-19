import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { CloseIcon, AddIcon } from '../../utils/icons';
import ViewProfileScreen from './ViewProfileScreen';
import ManageArtistScreen from './ManageArtistScreen';
import SearchArtistsModal from '../common/SearchArtistsModal';
import { dummyProfiles } from '../../data/profiles';
import apiService from '../../services/api';

const RepresentedArtistsScreen = ({ onClose }) => {
  const { user } = useAppContext();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [managingArtist, setManagingArtist] = useState(null);
  const [sending, setSending] = useState(false);

  const representedArtists = user?.representingArtists || [];

  const handleSelectArtist = async (artist, message = '') => {
    try {
      const agentProfileId = user._id || user.id;
      const artistProfileId = artist._id || artist.id;

      await apiService.sendRepresentationRequest(
        agentProfileId,
        artistProfileId,
        message // Use the provided message (can be empty)
      );

      // Don't close the modal - let the user send multiple requests
      // The button will turn grey automatically via SearchArtistsModal's state update
    } catch (error) {
      console.error('Error sending representation request:', error);
      throw error; // Re-throw so SearchArtistsModal can handle it
    }
  };


  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  const handleViewProfile = (artistId) => {
    // Find the artist in dummyProfiles to show their external profile
    const artistProfile = dummyProfiles.find(profile => profile.id === artistId);
    if (artistProfile) {
      setViewingProfile(artistProfile.id);
    }
  };

  const handleManageArtist = (artist) => {
    setManagingArtist(artist);
  };

  // Show manage artist screen if selected
  if (managingArtist) {
    return (
      <ManageArtistScreen
        artist={managingArtist}
        onClose={() => setManagingArtist(null)}
      />
    );
  }

  // Show viewing profile if selected
  if (viewingProfile) {
    return (
      <ViewProfileScreen
        profileId={viewingProfile}
        onClose={() => setViewingProfile(null)}
      />
    );
  }

  return (
    <div className="screen active represented-artists-screen">
      <div className="represented-artists-header">
        <button className="back-btn" onClick={onClose}>
          <CloseIcon />
        </button>
        <h1>Represented Artists</h1>
        <button
          className="add-artist-btn"
          onClick={() => setShowSearchModal(true)}
        >
          <AddIcon />
        </button>
      </div>

      <div className="represented-artists-content">
        {representedArtists.length > 0 ? (
          <div className="artists-list">
            {representedArtists.map((artist) => (
              <div key={artist.id} className="artist-card">
                <div className="artist-avatar">
                  {artist.avatar ? (
                    <img src={artist.avatar} alt={artist.name} />
                  ) : (
                    getInitial(artist.name)
                  )}
                </div>
                <div className="artist-info">
                  <h3 className="artist-name">{artist.name}</h3>
                  <p className="artist-location">{artist.location}</p>
                  {artist.genres && artist.genres.length > 0 && (
                    <div className="artist-genres">
                      {artist.genres.map(genre => (
                        <span key={genre} className="genre-tag-small">{genre}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="artist-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleViewProfile(artist.id)}
                  >
                    View Profile
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleManageArtist(artist)}
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎵</div>
            <h2>No Artists Yet</h2>
            <p>Start building your roster by adding artists you represent.</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowSearchModal(true)}
            >
              <AddIcon /> Add First Artist
            </button>
          </div>
        )}

        {showSearchModal && (
          <SearchArtistsModal
            key={Date.now()} // Force remount on each open to fetch fresh data
            onClose={() => setShowSearchModal(false)}
            onSelectArtist={handleSelectArtist}
            currentAgentId={user?._id || user?.id}
          />
        )}

      </div>
    </div>
  );
};

export default RepresentedArtistsScreen;