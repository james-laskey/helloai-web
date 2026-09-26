// services/authApi.js

const API_URL = `${
  process.env.REACT_APP_API_URL || 'https://helloapi-five.vercel.app'
}/api/auth`;

// Helper to store auth data
const storeAuthData = (accessToken, refreshToken, user) => {
  try {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userData', JSON.stringify(user));
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

// Helper to clear auth data
const clearAuthData = () => {
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export const authApi = {
  // User login
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Login failed',
        };
      }

      // Store tokens and user data
      storeAuthData(data.accessToken, data.refreshToken, data.user);

      return {
        success: true,
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      console.error('Login API error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // User signup
  signup: async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Signup failed',
        };
      }

      // Store tokens and user data
      storeAuthData(data.accessToken, data.refreshToken, data.user);

      return {
        success: true,
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      console.error('Signup API error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Refresh access token
  refreshToken: async (refreshToken) => {
    try {
      const response = await fetch(`${API_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Token refresh failed',
        };
      }

      // Update only the access token in storage
      localStorage.setItem('accessToken', data.accessToken);

      return {
        success: true,
        accessToken: data.accessToken,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        message: 'Network error',
      };
    }
  },

  // Logout
  logout: async (refreshToken) => {
    try {
      // Attempt to notify server about logout
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        },
        body: JSON.stringify({ refreshToken }),
      });

      // Clear local storage regardless of server response
      clearAuthData();

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if server request fails
      clearAuthData();
      return { success: true };
    }
  },

  // Get current user from storage
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get access token from storage
  getAccessToken: () => {
    try {
      return localStorage.getItem('accessToken');
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    try {
      const token = localStorage.getItem('accessToken');
      return !!token;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  },

  // Update user profile (requires authentication)
  updateProfile: async (userData) => {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Update failed',
        };
      }

      // Update stored user data
      const currentUser = authApi.getCurrentUser();
      const updatedUser = { ...currentUser, ...data.user };
      localStorage.setItem('userData', JSON.stringify(updatedUser));

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Change password (requires authentication)
  changePassword: async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Password change failed',
        };
      }

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }
};