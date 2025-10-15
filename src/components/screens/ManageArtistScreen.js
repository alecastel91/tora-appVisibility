import React from 'react';
import { CloseIcon } from '../../utils/icons';

const ManageArtistScreen = ({ artist, onClose }) => {
  if (!artist) return null;

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  const handleContactArtist = () => {
    // Simple contact action - could open email or phone
    if (artist.email) {
      window.location.href = `mailto:${artist.email}?subject=Booking Inquiry - ${artist.name}`;
    } else {
      alert(`Contact ${artist.name} directly for booking inquiries.`);
    }
  };

  const handleViewContracts = () => {
    // Contract functionality - to be implemented
  };

  const handleViewBookings = () => {
    // Booking functionality - to be implemented
  };

  return (
    <div className="screen active manage-artist-screen">
      <div className="manage-artist-header">
        <button className="back-btn" onClick={onClose}>
          <CloseIcon />
        </button>
        <h1>Manage {artist.name}</h1>
      </div>

      <div className="manage-artist-content">
        <div className="manage-artist-info">
          <div className="artist-avatar">
            {artist.avatar ? (
              <img src={artist.avatar} alt={artist.name} />
            ) : (
              getInitial(artist.name)
            )}
          </div>
          <div>
            <h4>{artist.name}</h4>
            <p>{artist.location}</p>
            {artist.genres && artist.genres.length > 0 && (
              <div className="artist-genres">
                {artist.genres.map(genre => (
                  <span key={genre} className="genre-tag-small">{genre}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Artist Contact Information */}
        <div className="artist-contact-info">
          <h3>Contact Information</h3>
          <div className="contact-details">
            <div className="contact-item">
              <span className="contact-label">Email:</span>
              <span className="contact-value">{artist.email || 'Not provided'}</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Phone:</span>
              <span className="contact-value">{artist.phone || 'Not provided'}</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Instagram:</span>
              <span className="contact-value">{artist.instagram || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="artist-quick-stats">
          <h3>Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">3</span>
              <span className="stat-label">Upcoming Gigs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">12</span>
              <span className="stat-label">Total Bookings</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">$45K</span>
              <span className="stat-label">YTD Revenue</span>
            </div>
          </div>
        </div>

        {/* Simple Management Actions */}
        <div className="manage-actions">
          <button
            className="btn btn-primary btn-full"
            onClick={handleContactArtist}
          >
            📧 Contact Artist
          </button>
        </div>

        <div className="manage-artist-footer">
          <button
            className="btn btn-secondary btn-full"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageArtistScreen;