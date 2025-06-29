// API service for communicating with Flask backend
const API_BASE_URL = 'http://localhost:5000';

class ApiService {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get all running services
  async getServices() {
    return this.request('/services');
  }

  // Start a new service/honeypot
  async startService(config) {
    return this.request('/services/start', {
      method: 'POST',
      body: JSON.stringify({ config }),
    });
  }

  // Stop a running service
  async stopService(serviceData) {
    return this.request('/services/stop', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }
}

export const apiService = new ApiService();
