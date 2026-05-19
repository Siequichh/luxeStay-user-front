import { apiClient } from './api';

export const authService = {
  login(email, password) {
    return apiClient.post('/auth/login', { email, password });
  },

  register(data) {
    return apiClient.post('/auth/register', data);
  },

  logout(refreshToken) {
    return apiClient.post('/auth/logout', { refreshToken });
  },

  refresh(refreshToken) {
    return apiClient.post('/auth/refresh', { refreshToken });
  },
};
