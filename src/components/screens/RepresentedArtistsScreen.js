import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { CloseIcon, AddIcon } from '../../utils/icons';
import ViewProfileScreen from './ViewProfileScreen';
import ManageArtistScreen from './ManageArtistScreen';
import { dummyProfiles } from '../../data/profiles';

const RepresentedArtistsScreen = ({ onClose }) => {
  const { user } = useAppContext();
  const [showAddArtist, setShowAddArtist] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [managingArtist, setManagingArtist] = useState(null);

  const representedArtists = user?.representingArtists || [];

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
          onClick={() => setShowAddArtist(true)}
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
              onClick={() => setShowAddArtist(true)}
            >
              <AddIcon /> Add First Artist
            </button>
          </div>
        )}

        {showAddArtist && (
          <div className="add-artist-modal-overlay" onClick={() => setShowAddArtist(false)}>
            <div className="add-artist-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Add New Artist</h3>
              <p>Connect with artists on TORA and send them representation requests, or add artists manually.</p>
              <div className="add-artist-options">
                <button className="btn btn-outline btn-full">
                  Search TORA Artists
                </button>
                <button className="btn btn-primary btn-full">
                  Add Manually
                </button>
              </div>
              <button
                className="btn btn-secondary btn-full"
                onClick={() => setShowAddArtist(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RepresentedArtistsScreen;