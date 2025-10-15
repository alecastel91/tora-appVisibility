import React, { useState } from 'react';
import apiService from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';

const AddProfileScreen = ({ onClose, onSuccess }) => {
  const { addProfile } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    role: 'ARTIST',
    city: '',
    country: '',
    genres: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const availableGenres = [
    'House', 'Techno', 'Deep House', 'Tech House',
    'Melodic Techno', 'Progressive House', 'Minimal',
    'Drum & Bass', 'Dubstep', 'Trance', 'Ambient',
    'Experimental', 'Disco', 'Funk', 'Soul', 'Jazz'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleGenre = (genre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call backend API to create additional profile
      const data = await apiService.createProfile(formData);

      // Add the new profile to context
      addProfile(data.profile);

      // Call success callback
      if (onSuccess) {
        onSuccess(data.profile);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Add Profile</h1>
          <p className="auth-subtitle">Create a new professional profile</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Your Name / Artist Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>I am a...</label>
            <div className="role-selector">
              {['ARTIST', 'VENUE', 'PROMOTER', 'AGENT'].map(role => (
                <button
                  key={role}
                  type="button"
                  className={`role-option ${formData.role === role ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role })}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Select Your Genres (optional)</label>
            <div className="genre-selector">
              {availableGenres.map(genre => (
                <button
                  key={genre}
                  type="button"
                  className={`genre-chip ${formData.genres.includes(genre) ? 'active' : ''}`}
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProfileScreen;
