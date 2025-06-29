// API service for communicating with Flask backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';

class ApiService {
  async request(endpoint, options = {}) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes timeout

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        // Extract error message from response
        const errorMessage = data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 3 minutes. The service may be taking longer to start.');
      }
      
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

  // Get container logs
  async getContainerLogs(containerId) {
    return this.request(`/services/${containerId}/logs`);
  }

  // Get real log files (auth, commands, messages)
  async getRealLogs(containerId, logType = 'auth') {
    return this.request(`/services/${containerId}/reallogs?type=${logType}`);
  }
}

export const apiService = new ApiService();
