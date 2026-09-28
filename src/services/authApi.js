// services/authApi.js

const API_URL = `${
  process.env.REACT_APP_API_URL || 'https://helloapi-five.vercel.app'
}/api/auth`;

import { csrfHeaders } from '../utils/csrf';

const credentials = 'include';

async function request(path, options = {}) {
  const method = options.method || 'GET';

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    credentials,
    headers: {
      ...csrfHeaders(method),
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { response, data };
}

export const authApi = {
  /* ---------- Login ---------- */

  login: async (email, password) => {
    try {
      const { response, data } = await request('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return {
          success: false,
          code: data?.code,
          message: data?.error || data?.message || 'Login failed',
        };
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login API error:', error);
      return { success: false, message: 'Network error.' };
    }
  },

  /* ---------- Signup ---------- */

  signup: async (name, email, password) => {
    try {
      const { response, data } = await request('/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        return {
          success: false,
          code: data?.code,
          message: data?.error || 'Signup failed',
        };
      }

      return {
        success: true,
        user: data.user,
        emailSent: data.emailSent !== false,
        message: data.message,
      };
    } catch (error) {
      console.error('Signup API error:', error);
      return { success: false, message: 'Network error.' };
    }
  },

  /* ---------- Refresh token ---------- */

  refreshToken: async () => {
    try {
      const { response } = await request('/refresh', { method: 'POST' });
      return { success: response.ok };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false };
    }
  },

  /* ---------- Logout ---------- */

  logout: async () => {
    try {
      await request('/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    return { success: true };
  },

  /* ---------- Email verification ---------- */

  resendVerification: async (email) => {
    try {
      const { response, data } = await request('/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return {
        success: response.ok,
        message: data?.message || data?.error || 'Request completed',
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  verifyEmail: async (token) => {
    try {
      const { response, data } = await request('/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      return {
        success: response.ok,
        message: data?.message || data?.error || 'Request completed',
      };
    } catch (error) {
      console.error('Verify email error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  /* ---------- Profile ---------- */

  updateProfile: async (userData) => {
    try {
      const { response, data } = await request('/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        return { success: false, message: data?.error || 'Update failed' };
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Network error.' };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const { response, data } = await request('/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        return { success: false, message: data?.error || 'Password change failed' };
      }

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Network error.' };
    }
  },

  /* ---------- Account deletion ---------- */

  /**
   * Step 1 of the deletion flow. The backend sends an email with a
   * confirmation link. Nothing is deleted here.
   * Returns { success, emailSent, message }.
   * Throws on HTTP error so the modal can show the message.
   */
  requestAccountDeletion: async () => {
    const { response, data } = await request('/request-account-deletion', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(
        data?.error || `Request failed with status ${response.status}`
      );
    }

    // If the backend did not send the email but still returned 200,
    // surface that to the caller.
    return {
      success: true,
      emailSent: data?.emailSent !== false,
      message: data?.message || 'Confirmation email sent.',
    };
  },
};