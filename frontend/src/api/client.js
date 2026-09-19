import axios from 'axios';
import { useAthleteStore } from '../store/athleteStore';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use((config) => {
  const token = useAthleteStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Pass-through (no auth redirects)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

/**
 * Safely extracts human-readable error string from any API error or Pydantic 422 array.
 * Prevents "Objects are not valid as a React child" rendering crash!
 */
export function formatErrorMessage(err, fallback = 'An unexpected error occurred.') {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d) => d?.msg || d?.message || JSON.stringify(d)).join(', ');
  }
  
  if (detail && typeof detail === 'object') {
    return detail.msg || detail.message || fallback;
  }
  
  return err.message || fallback;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED API METHODS (Calls backend REST APIs with bearer token auth)
// ─────────────────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data).then((res) => res.data),
  login: (data) => apiClient.post('/auth/login', data).then((res) => res.data),
  sendOTP: (data) => apiClient.post('/auth/send-otp', data).then((res) => res.data),
  verifyOTP: (data) => apiClient.post('/auth/verify-otp', data).then((res) => res.data),
  getMe: () => apiClient.get('/auth/me').then((res) => res.data),
};

export const intakeAPI = {
  getSports: () => apiClient.get('/intake/sports').then((res) => res.data),
  getObjectives: () => apiClient.get('/intake/objectives').then((res) => res.data),
  submitProfile: (data) => apiClient.post('/intake/profile', data).then((res) => res.data),
  getProfile: () => apiClient.get('/intake/profile').then((res) => res.data),
};

export const videoAPI = {
  coach: (formData) =>
    apiClient
      .post('/video/coach', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),
  uploadVideo: (formData) =>
    apiClient
      .post('/video/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),
  getStatus: (id) => apiClient.get(`/video/coach/${id}`).then((res) => res.data),
  getProtocols: () => apiClient.get('/video/protocols').then((res) => res.data),
};

export const assessmentAPI = {
  submitManual: (data) => apiClient.post('/assessment/manual', data).then((res) => res.data),
  getLatest: () => apiClient.get('/assessment/latest').then((res) => res.data),
  getProtocols: () => apiClient.get('/assessment/protocols').then((res) => res.data),
};

export const planAPI = {
  getCurrent: () => apiClient.get('/plan/current').then((res) => res.data),
  generate: () => apiClient.post('/plan/generate').then((res) => res.data),
  getRecovery: () => apiClient.get('/plan/recovery').then((res) => res.data),
  getHistory: () => apiClient.get('/plan/history').then((res) => res.data),
};

export const progressAPI = {
  logSession: (data) => apiClient.post('/progress/log', data).then((res) => res.data),
  getDashboard: () => apiClient.get('/progress/dashboard').then((res) => res.data),
  getLogs: (limit = 20) => apiClient.get(`/progress/logs?limit=${limit}`).then((res) => res.data),
  getReassessment: () => apiClient.get('/progress/reassessment').then((res) => res.data),
};

export default apiClient;
