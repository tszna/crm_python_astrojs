const isBrowser = () => typeof window !== 'undefined' && window.localStorage;

export function setToken(token) {
  if (isBrowser()) {
    localStorage.setItem('access_token', token);
  }
}

export function getToken() {
  if (isBrowser()) {
    return localStorage.getItem('access_token');
  }
  return null;
}

export function removeToken() {
  if (isBrowser()) {
    localStorage.removeItem('access_token');
  }
}
