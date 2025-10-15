import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { genresList } from '../../data/profiles';
import { CloseIcon } from '../../utils/icons';

const EditProfileScreen = ({ onClose }) => {
  const { user, updateUser } = useAppContext();
  const { t } = useLanguage();
  const [editedUser, setEditedUser] = useState({
    ...user,
    genres: user?.genres || []
  });
  const [selectedGenres, setSelectedGenres] = useState(new Set(user?.genres || []));
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showGenresDropdown, setShowGenresDropdown] = useState(false);

  const handleSave = () => {
    updateUser({
      ...editedUser,
      genres: Array.from(selectedGenres)
    });
    onClose();
  };

  const handleGenreToggle = (genre) => {
    const newGenres = new Set(selectedGenres);
    if (newGenres.has(genre)) {
      newGenres.delete(genre);
    } else {
      newGenres.add(genre);
    }
    setSelectedGenres(newGenres);
  };

  const displayedGenres = showAllGenres ? genresList : genresList.slice(0, 12);

  return (
    <div className="screen active edit-profile-screen">
      <div className="edit-profile-header">
        <button className="back-btn" onClick={onClose}>
          <CloseIcon />
        </button>
        <h1>{t('profile.editProfile')}</h1>
        <div style={{ width: '24px' }}></div>
      </div>

      <div className="edit-profile-content">
        {/* Basic Info Section */}
        <div className="edit-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label>{t('profile.name')}</label>
            <input
              type="text"
              value={editedUser.name || ''}
              onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label>{t('profile.role')}</label>
            <select
              value={editedUser.role || ''}
              onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
            >
              <option value="ARTIST">Artist</option>
              <option value="VENUE">Venue</option>
              <option value="PROMOTER">Promoter</option>
              <option value="AGENT">Agent</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t('profile.location')}</label>
            <input
              type="text"
              value={editedUser.location || ''}
              onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })}
              placeholder="City, Country"
            />
          </div>

          {editedUser.role === 'VENUE' && (
            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                value={editedUser.capacity || ''}
                onChange={(e) => setEditedUser({ ...editedUser, capacity: parseInt(e.target.value) || '' })}
                placeholder="Maximum capacity"
                min="1"
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '0' }}>
            <label>{t('profile.bio')}</label>
            <textarea
              value={editedUser.bio || ''}
              onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows="4"
            />
          </div>
        </div>

        {/* Genres Section */}
        <div className="edit-section" style={{ marginTop: '8px' }}>
          <div className="form-group">
            <label>Genres</label>
            <div 
              className="genres-dropdown-trigger"
              onClick={() => setShowGenresDropdown(!showGenresDropdown)}
            >
              <span className="genres-selected-text">
                {selectedGenres.size > 0 
                  ? `${selectedGenres.size} genre${selectedGenres.size > 1 ? 's' : ''} selected`
                  : 'Select genres'}
              </span>
              <span className="dropdown-arrow">{showGenresDropdown ? '▲' : '▼'}</span>
            </div>
            
            {showGenresDropdown && (
              <div className="genres-dropdown-content">
                <div className="genres-grid">
                  {displayedGenres.map(genre => (
                    <label key={genre} className="genre-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedGenres.has(genre)}
                        onChange={() => handleGenreToggle(genre)}
                      />
                      <span className={selectedGenres.has(genre) ? 'selected' : ''}>
                        {genre}
                      </span>
                    </label>
                  ))}
                </div>
                {genresList.length > 12 && (
                  <button
                    className="show-more-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllGenres(!showAllGenres);
                    }}
                  >
                    {showAllGenres ? 'Show less' : `Show all ${genresList.length} genres`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Social Links Section */}
        <div className="edit-section">
          <h3>Social Links</h3>
          
          <div className="form-group">
            <label>SoundCloud/Mixtape</label>
            <input
              type="url"
              value={editedUser.mixtape || ''}
              onChange={(e) => setEditedUser({ ...editedUser, mixtape: e.target.value })}
              placeholder="https://soundcloud.com/..."
            />
          </div>

          <div className="form-group">
            <label>Spotify Artist</label>
            <input
              type="url"
              value={editedUser.spotify || ''}
              onChange={(e) => setEditedUser({ ...editedUser, spotify: e.target.value })}
              placeholder="https://open.spotify.com/artist/..."
            />
          </div>

          <div className="form-group">
            <label>Resident Advisor</label>
            <input
              type="url"
              value={editedUser.residentAdvisor || ''}
              onChange={(e) => setEditedUser({ ...editedUser, residentAdvisor: e.target.value })}
              placeholder="https://ra.co/dj/..."
            />
          </div>

          <div className="form-group">
            <label>Instagram</label>
            <input
              type="text"
              value={editedUser.instagram || ''}
              onChange={(e) => setEditedUser({ ...editedUser, instagram: e.target.value })}
              placeholder="@username"
            />
          </div>

          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              value={editedUser.website || ''}
              onChange={(e) => setEditedUser({ ...editedUser, website: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="edit-actions">
          <button className="btn btn-secondary btn-full" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary btn-full" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileScreen;