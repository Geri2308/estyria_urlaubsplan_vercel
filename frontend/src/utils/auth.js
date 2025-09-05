// Auth utilities
export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_DATA_KEY = 'user_data';

export const isAuthenticated = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return !!token;
};

export const getToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getUserData = () => {
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const setAuthData = (token, userData) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

export const clearAuthData = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};