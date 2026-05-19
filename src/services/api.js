import { config } from '../config/config';

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  _authHeaders() {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async _handleResponse(response) {
    if (response.status === 204) return null;

    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await fetch(`${this.baseURL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            return null; // caller should handle re-fetch if needed
          }
        } catch (_) {}
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('luxestay_user');
      window.location.href = '/login';
      return null;
    }

    let body;
    try {
      body = await response.json();
    } catch (_) {
      body = {};
    }

    if (!response.ok) {
      throw new Error(body.message || `Error ${response.status}`);
    }

    return body;
  }

  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.append(k, v);
    });
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this._authHeaders(),
    });
    return this._handleResponse(response);
  }

  async post(endpoint, data = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this._authHeaders(),
      body: JSON.stringify(data),
    });
    return this._handleResponse(response);
  }

  async put(endpoint, data = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this._authHeaders(),
      body: JSON.stringify(data),
    });
    return this._handleResponse(response);
  }

  async delete(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this._authHeaders(),
    });
    return this._handleResponse(response);
  }
}

export const apiClient = new ApiClient(config.apiUrl);
