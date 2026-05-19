import { apiClient } from './api';


export const ubigeoService = {
  getDepartments() {
    return apiClient.get('/ubigeo/departments');
  },

  getProvinces(depCode) {
    return apiClient.get('/ubigeo/provinces', { dep: depCode });
  },

  getDistricts(depCode, provCode) {
    return apiClient.get('/ubigeo/districts', { dep: depCode, prov: provCode });
  },

  search(query) {
    return apiClient.get('/ubigeo/search', { name: query });
  },
};
