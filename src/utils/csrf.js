// utils/csrf.js

/**
 * Reads the CSRF token from the ha_csrf cookie.
 *
 * For this to work, the API must set the cookie with:
 *   Domain=.hello-ai.info   (covers both www.hello-ai.info and api.hello-ai.info)
 *   SameSite=Lax            (same-site XHR)
 *   HttpOnly=false          (so JS can read it)
 *   Secure=true             (production)
 *
 * If the cookie is missing, getCsrfToken() returns null and state-changing
 * requests go out without X-CSRF-Token, which the API rejects with 403.
 */
export function getCsrfToken() {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/(?:^|;\s*)ha_csrf=([^;]*)/);
  if (!match) return null;

  const raw = match[1];
  if (!raw) return null;

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

let warnedMissingCsrf = false;

/**
 * Headers for a request. Adds X-CSRF-Token for state-changing methods.
 *
 * Also adds Accept so the API can negotiate. Content-Type is only set
 * when we expect a body — GET/HEAD with Content-Type: application/json
 * is harmless but noisy.
 */
export function csrfHeaders(method) {
  const m = (method || 'GET').toUpperCase();
  const isSafe = m === 'GET' || m === 'HEAD' || m === 'OPTIONS';

  const headers = {};
  if (!isSafe) {
    headers['Content-Type'] = 'application/json';

    const token = getCsrfToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    } else if (!warnedMissingCsrf && typeof window !== 'undefined') {
      warnedMissingCsrf = true;
      // Surface misconfiguration once per page load rather than letting
      // every mutation fail silently with a 403.
      console.error(
        '[csrf] ha_csrf cookie not found. Mutating requests will be ' +
          'rejected with 403. Check that the API sets the cookie with ' +
          'Domain=.hello-ai.info and HttpOnly=false.'
      );
    }
  }

  return headers;
}