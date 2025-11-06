import React, { useState } from 'react';
import apiService from '../../services/api';
import { genresList, zones, countriesByZone, citiesByCountry } from '../../data/profiles';

const SignupScreen = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [step, setStep] = useState(1); // 1: Basic info, 2: Profile details
  const [formData, setFormData] = useState({
    // Step 1 - Account
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2 - Profile
    name: '',
    role: 'ARTIST',
    zone: '',
    city: '',
    country: '',
    genres: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [showCustomCityInput, setShowCustomCityInput] = useState(false);

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

  // Cascading dropdown handlers
  const handleZoneChange = (zone) => {
    setFormData({
      ...formData,
      zone,
      country: '', // Reset country when zone changes
      city: ''     // Reset city when zone changes
    });
    setShowCustomCityInput(false);
    setCustomCity('');
  };

  const handleCountryChange = (country) => {
    setFormData({
      ...formData,
      country,
      city: '' // Reset city when country changes
    });
    setShowCustomCityInput(false);
    setCustomCity('');
  };

  const handleCityChange = (city) => {
    if (city === 'Other') {
      setShowCustomCityInput(true);
      setFormData({ ...formData, city: customCity });
    } else {
      setShowCustomCityInput(false);
      setCustomCity('');
      setFormData({ ...formData, city });
    }
  };

  const handleCustomCityChange = (value) => {
    setCustomCity(value);
    setFormData({ ...formData, city: value });
  };

  // Get available countries based on selected zone
  const availableCountries = formData.zone ? countriesByZone[formData.zone] || [] : [];

  // Get available cities based on selected country
  const availableCities = formData.country ? citiesByCountry[formData.country] || [] : [];

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');

    // Validate step 1
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Combine city and country into location string
      const location = formData.city && formData.country
        ? `${formData.city}, ${formData.country}`
        : '';

      // Remove temporary fields and add location
      const { confirmPassword, zone, ...signupData } = formData;
      signupData.location = location;

      const data = await apiService.signup(signupData);

      // Save user data and redirect
      onSignupSuccess(data);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">TORA</h1>
          <p className="auth-subtitle">Join the music industry network</p>
        </div>

        {step === 1 ? (
          // Step 1: Account Info
          <form className="auth-form" onSubmit={handleNextStep}>
            <h2>Create Account</h2>
            <div className="step-indicator">Step 1 of 2</div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
            >
              Next
            </button>

            <div className="auth-footer">
              <p>Already have an account?</p>
              <button
                type="button"
                className="btn-link"
                onClick={onSwitchToLogin}
              >
                Log In
              </button>
            </div>
          </form>
        ) : (
          // Step 2: Profile Info
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Complete Your Profile</h2>
            <div className="step-indicator">Step 2 of 2</div>

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

            {/* Cascading Location Dropdowns */}
            <div className="form-group">
              <label>Zone</label>
              <select
                value={formData.zone || ''}
                onChange={(e) => handleZoneChange(e.target.value)}
                required
                className="form-input"
              >
                <option value="">Select Zone</option>
                {zones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>

            {formData.zone && (
              <div className="form-group">
                <label>Country</label>
                <select
                  value={formData.country || ''}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="">Select Country</option>
                  {availableCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.country && (
              <div className="form-group">
                <label>City</label>
                <select
                  value={formData.city || ''}
                  onChange={(e) => handleCityChange(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="">Select City</option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            )}

            {showCustomCityInput && (
              <div className="form-group">
                <label>Enter City Name</label>
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => handleCustomCityChange(e.target.value)}
                  placeholder="Enter city name"
                  required
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <label>Select Your Genres (optional)</label>
              <div className="genre-selector">
                {genresList.map(genre => (
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
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupScreen;