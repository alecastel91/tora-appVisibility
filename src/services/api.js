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
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password })
      });

      const responseText = await response.text();

      // Parse the response text as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
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

  async deleteProfile(profileId) {
    const response = await fetch(`${API_URL}/profiles/${profileId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // CONNECTION ENDPOINTS
  async toggleLike(fromProfileId, toProfileId) {
    const response = await fetch(`${API_URL}/connections/like/${toProfileId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ fromProfileId })
    });

    return this.handleResponse(response);
  }

  async sendConnectionRequest(from, to, message = '') {
    const response = await fetch(`${API_URL}/connections/request`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ from, to, message })
    });

    return this.handleResponse(response);
  }

  async acceptConnectionRequest(requestId) {
    const response = await fetch(`${API_URL}/connections/accept/${requestId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async declineConnectionRequest(requestId) {
    const response = await fetch(`${API_URL}/connections/decline/${requestId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async getLikedProfiles(profileId) {
    const response = await fetch(`${API_URL}/connections/liked/${profileId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async getConnectedProfiles(profileId) {
    const response = await fetch(`${API_URL}/connections/connections/${profileId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async getSentRequests(profileId) {
    const response = await fetch(`${API_URL}/connections/sent-requests/${profileId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async getReceivedRequests(profileId) {
    const response = await fetch(`${API_URL}/connections/received-requests/${profileId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async getLikers(profileId) {
    const response = await fetch(`${API_URL}/connections/likers/${profileId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // OPTIMIZED: Get all profile data in one request
  async getProfileData(profileId) {
    const response = await fetch(`${API_URL}/connections/profile-data/${profileId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async getNotifications(profileId) {
    const response = await fetch(`${API_URL}/connections/notifications/${profileId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async clearNotifications(profileId) {
    const response = await fetch(`${API_URL}/connections/notifications/${profileId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // MESSAGE ENDPOINTS
  async getConversations(profileId) {
    const response = await fetch(`${API_URL}/messages/conversations/${profileId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async getMessageThread(profileId, otherProfileId) {
    const response = await fetch(`${API_URL}/messages/thread/${profileId}/${otherProfileId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async sendMessage(from, to, text, connectionRequestId = null) {
    const response = await fetch(`${API_URL}/messages/send`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ from, to, text, connectionRequestId })
    });

    return this.handleResponse(response);
  }

  // Resolve short URLs to full URLs
  async resolveUrl(url) {
    const response = await fetch(`${API_URL}/resolve-url`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ url })
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