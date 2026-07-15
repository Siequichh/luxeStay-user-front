import { apiClient } from './api';
import { config } from '../config/config';

export const profileService = {
  getProfile() {
    return apiClient.get(config.endpoints.profile);
  },
  updateProfile(data) {
    return apiClient.put(config.endpoints.profile, data);
  },
  changePassword(data) {
    return apiClient.put(config.endpoints.profile + '/password', data);
  },
};
