// services/authFetch.js
//
// Single source of truth for authenticated fetches + token refresh.
// Every API client (api.js, authApi.js, learningApi.js) goes through
// this module so there is exactly ONE refresh in flight at a time.
//
// Previously each client had its own refreshPromise, so parallel 401s
// from different modules triggered multiple refreshes. Because the
// server rotates the refresh token (revoke old + issue new), the second
// refresh used an already-revoked token -> 401 -> logout. Sharing one
// promise fixes that.

import { csrfHeaders } from '../utils/csrf';

const API_BASE =
  process.env.REACT_APP_API_URL || 'https://api.hello-ai.info';

export const AUTH_API_URL = `${API_BASE}/api/auth`;
export const LEARNING_API_URL = `${API_BASE}/api/learning`;
export const API_URL = API_BASE;

// One in-flight refresh for the whole app.
let refreshPromise = null;

/**
 * Calls POST /api/auth/refresh once. Concurrent callers await the same
 * promise. The guard is cleared only after the promise settles, so a
 * request that 401s mid-refresh joins the existing refresh instead of
 * starting a second one.
 */
export async function refreshAccessCookie() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${AUTH_API_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: csrfHeaders('POST'),
      });
      return response.ok;
    } catch (err) {
      console.error('[authFetch] refresh request failed', err);
      return false;
    } finally {
      // Clear after the current microtask queue so any parallel 401
      // handlers that already grabbed the promise can still await it.
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Authenticated fetch. Attaches CSRF headers, credentials, and retries
 * once after a successful refresh on 401.
 *
 *   const res = await authenticatedFetch(url, { method: 'POST', body });
 */
export async function authenticatedFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  const makeRequest = () =>
    fetch(url, {
      ...options,
      method,
      credentials: 'include',
      headers: {
        ...csrfHeaders(method),
        ...(options.headers || {}),
      },
    });

  let response = await makeRequest();

  if (response.status === 401) {
    const refreshed = await refreshAccessCookie();
    if (refreshed) {
      response = await makeRequest();
    }
  }

  return response;
}

/**
 * Thin JSON helper used by the API clients. Throws on non-2xx so
 * callers can rely on try/catch.
 */
export async function fetchJson(url, options = {}) {
  const response = await authenticatedFetch(url, options);
  if (!response.ok) {
    let detail = '';
    try {
      detail = await response.text();
    } catch {
      // ignore
    }
    throw new Error(
      `API returned ${response.status}${detail ? `: ${detail}` : ''}`
    );
  }
  return response.json();
}