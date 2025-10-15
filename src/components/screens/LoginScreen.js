import React, { useState } from 'react';
import apiService from '../../services/api';

const LoginScreen = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', formData.email);
      const data = await apiService.login(formData.email, formData.password);
      console.log('Login successful:', data);

      // Save user data and redirect
      onLoginSuccess(data);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">TORA</h1>
          <p className="auth-subtitle">Connect with music industry professionals</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Welcome Back</h2>

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
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <div className="auth-footer">
            <p>Don't have an account?</p>
            <button
              type="button"
              className="btn-link"
              onClick={onSwitchToSignup}
            >
              Sign Up
            </button>
          </div>

          <div className="demo-credentials">
            <p>Demo Credentials:</p>
            <small>Email: demo@tora.com</small>
            <small>Password: demo123</small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;