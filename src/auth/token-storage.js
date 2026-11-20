const TOKEN_KEY = 'csb.token';

// localStorage can throw (private mode, blocked site data); the session then
// lasts only while the tab stays open.

export function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Kept in memory by AuthContext only.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing was stored.
  }
}
