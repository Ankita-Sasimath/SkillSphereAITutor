// API Configuration
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://skillsphereaitutor-1.onrender.com'
  : 'http://localhost:5000';

// Helper function for API calls
export const apiFetch = (endpoint: string, options?: RequestInit) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};
