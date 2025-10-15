/**
 * API Service
 * Handles all communication with the backend
 */

// Use relative URL to work with proxy
const API_URL = process.env.REACT_APP_API_URL || '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Set authorization header
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Save token
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Remove token
  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Handle API response
  async handleResponse(response) {
    // First check if the response is ok
    if (!response.ok) {
      // Try to parse error message
      let errorMessage = 'Something went wrong';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Try to parse successful response
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to parse response:', error);
      throw new Error('Invalid response format from server');
    }
  }

  // AUTH ENDPOINTS
  async signup(userData) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    });

    const data = await this.handleResponse(response);

    // Save token if signup successful
    if (data.token) {
      this.setToken(data.token);
    }

    return data;
  }

  async login(email, password) {
    console.log('API Service: Attempting login to', `${API_URL}/auth/login`);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password })
      });

      console.log('API Service: Response status', response.status);
      console.log('API Service: Response headers', response.headers);

      // Get response text to debug
      const responseText = await response.text();
      console.log('API Service: Response text', responseText);

      // Parse the response text as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.error('Response was:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      // Check if response was successful
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save token if login successful
      if (data.token) {
        this.setToken(data.token);
      }

      return data;
    } catch (error) {
      console.error('API Service: Login failed', error);
      throw error;
    }
  }

  async logout() {
    // Call logout endpoint if needed
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Remove token regardless
    this.removeToken();
  }

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async changePassword(currentPassword, newPassword) {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });

    return this.handleResponse(response);
  }

  // PROFILE ENDPOINTS (we'll add these to backend next)
  async searchProfiles(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/profiles?${queryParams}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async getProfile(profileId) {
    const response = await fetch(`${API_URL}/profiles/${profileId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async updateProfile(profileId, profileData) {
    const response = await fetch(`${API_URL}/profiles/${profileId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profileData)
    });

    return this.handleResponse(response);
  }

  async createProfile(profileData) {
    const response = await fetch(`${API_URL}/profiles`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(profileData)
    });

    return this.handleResponse(response);
  }

  // CONNECTION ENDPOINTS
  async likeProfile(profileId) {
    const response = await fetch(`${API_URL}/connections/like/${profileId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async unlikeProfile(profileId) {
    const response = await fetch(`${API_URL}/connections/like/${profileId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async sendConnectionRequest(profileId, message = '') {
    const response = await fetch(`${API_URL}/connections/request`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ to: profileId, message })
    });

    return this.handleResponse(response);
  }

  // MESSAGE ENDPOINTS
  async getMessages(userId) {
    const response = await fetch(`${API_URL}/messages/${userId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async sendMessage(userId, text) {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ to: userId, text })
    });

    return this.handleResponse(response);
  }

  // Check if user is logged in
  isAuthenticated() {
    return !!this.token;
  }
}

// Export single instance
const apiService = new ApiService();
export default apiService;