import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Axios instance with auth + error handling
const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 60000,  // 60s for repo scans
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add GitHub token if available (client-side)
const token = import.meta.env.VITE_GITHUB_TOKEN;
if (token) {
  apiClient.defaults.headers.common['Authorization'] = `token ${token}`;
}

// Global scan (search-based)
export const globalScan = () => apiClient.post('/scan', {});

// Specific repo scan
export const scanRepo = (repo) => 
  apiClient.post('/scan-repo', { repo });

// Dashboard data
export const getDashboard = (limit = 50) => 
  apiClient.get(`/scan/recent?limit=${limit}`);

// Risk stats for charts
export const getRiskStats = () => 
  apiClient.get('/risks');

// Alerts
export const getAlerts = (params = {}) => 
  apiClient.get('/alerts', { params });

// Error interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      alert('Rate limited! Wait 1min or upgrade GitHub token.');
    } else if (error.response?.status === 500) {
      console.error('Backend error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default apiClient;