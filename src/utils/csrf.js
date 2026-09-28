// utils/csrf.js

/**
 * Reads the CSRF token from the ha_csrf cookie. The cookie is
 * intentionally NOT httpOnly so this helper can read it.
 */
export function getCsrfToken() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)ha_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Returns the headers required for a state-changing request.
 * Includes the CSRF token if present.
 */
export function csrfHeaders(method) {
  const headers = { 'Content-Type': 'application/json' };
  if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    const token = getCsrfToken();
    if (token) headers['X-CSRF-Token'] = token;
  }
  return headers;
}