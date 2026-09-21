import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAthleteStore } from '../store/athleteStore';
import {
  Athlete,
  AthleteProfile,
  Assessment,
  TrainingPlan,
  Token,
  SendOTPRequest,
  VerifyOTPRequest,
  OTPResponse,
  RegisterRequest,
  ResetPasswordPinRequest,
  LoginRequest,
  SportTaxonomy,
} from '../types';

let rawBaseURL = (import.meta.env.VITE_API_BASE_URL || '/api').trim();

// Automatically prepend https:// if a domain (like sportify-production...up.railway.app) was provided without protocol
if (
  rawBaseURL &&
  !rawBaseURL.startsWith('http://') &&
  !rawBaseURL.startsWith('https://') &&
  !rawBaseURL.startsWith('/')
) {
  rawBaseURL = `https://${rawBaseURL}`;
}

const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL.slice(0, -1) : rawBaseURL;

if (typeof window !== 'undefined') {
  console.log('[Sportify API] Base URL configured as:', baseURL);
}

const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 60000,
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAthleteStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handles 401 Unauthorized cleanly without breaking auth forms
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthRoute =
        url.includes('/auth/login') ||
        url.includes('/auth/verify-otp') ||
        url.includes('/auth/send-otp') ||
        url.includes('/auth/reset-password-pin');
      if (!isAuthRoute) {
        const store = useAthleteStore.getState();
        if (store.token || store.isAuthenticated) {
          store.logout();
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Safely extracts human-readable error string from any API error or Pydantic 422 array.
 * Prevents "Objects are not valid as a React child" rendering crash!
 */
export function formatErrorMessage(err: unknown, fallback: string = 'An unexpected error occurred.'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;

  const axiosErr = err as {
    response?: {
      status?: number;
      statusText?: string;
      data?: { detail?: unknown } | string;
    };
    message?: string;
    code?: string;
    config?: { url?: string; baseURL?: string };
  };

  const detail = (axiosErr.response?.data as any)?.detail;

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d: any) => d?.msg || d?.message || JSON.stringify(d)).join(', ');
  }

  if (detail && typeof detail === 'object') {
    const detailObj = detail as { msg?: string; message?: string };
    return detailObj.msg || detailObj.message || fallback;
  }

  // If response is HTML (e.g. Vercel SPA rewrite when VITE_API_BASE_URL is missing or wrong)
  if (typeof axiosErr.response?.data === 'string' && axiosErr.response.data.includes('<!DOCTYPE html>')) {
    return 'Configuration Error: API request routed to frontend instead of backend. Check VITE_API_BASE_URL on Vercel.';
  }

  // If server returned HTTP error status (500, 502, 504, 404, etc.)
  if (axiosErr.response?.status) {
    return `Server Error ${axiosErr.response.status} (${axiosErr.response.statusText || 'Error'}). Check backend logs on Railway.`;
  }

  // If network failure or CORS blocking
  if (axiosErr.message === 'Network Error' || axiosErr.code === 'ERR_NETWORK') {
    const targetUrl = `${axiosErr.config?.baseURL || ''}${axiosErr.config?.url || ''}`;
    return `Network Error: Could not reach backend at ${targetUrl || 'configured URL'}. Check Railway status.`;
  }

  return axiosErr.message || fallback;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED API METHODS (Calls backend REST APIs with bearer token auth)
// ─────────────────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data: RegisterRequest): Promise<Token> =>
    apiClient.post<Token>('/auth/register', data).then((res) => res.data),

  login: (data: LoginRequest): Promise<Token> =>
    apiClient.post<Token>('/auth/login', data).then((res) => res.data),

  sendOTP: (data: SendOTPRequest): Promise<OTPResponse> =>
    apiClient.post<OTPResponse>('/auth/send-otp', data).then((res) => res.data),

  verifyOTP: (data: VerifyOTPRequest): Promise<Token> =>
    apiClient.post<Token>('/auth/verify-otp', data).then((res) => res.data),

  resetPasswordWithPin: (data: ResetPasswordPinRequest): Promise<Token> =>
    apiClient.post<Token>('/auth/reset-password-pin', data).then((res) => res.data),

  getMe: (): Promise<Athlete> =>
    apiClient.get<Athlete>('/auth/me').then((res) => res.data),
};

export const intakeAPI = {
  getSports: (): Promise<SportTaxonomy[]> =>
    apiClient.get<SportTaxonomy[]>('/intake/sports').then((res) => res.data),

  getObjectives: (): Promise<string[]> =>
    apiClient.get<string[]>('/intake/objectives').then((res) => res.data),

  submitProfile: (data: Partial<AthleteProfile>): Promise<AthleteProfile> =>
    apiClient.post<AthleteProfile>('/intake/profile', data).then((res) => res.data),

  getProfile: (): Promise<AthleteProfile> =>
    apiClient.get<AthleteProfile>('/intake/profile').then((res) => res.data),
};

export const videoAPI = {
  coach: (formData: FormData): Promise<any> =>
    apiClient
      .post('/video/coach', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),

  uploadVideo: (formData: FormData): Promise<any> =>
    apiClient
      .post('/video/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),

  getStatus: (id: string | number): Promise<any> =>
    apiClient.get(`/video/coach/${id}`).then((res) => res.data),

  getProtocols: (): Promise<any[]> =>
    apiClient.get('/video/protocols').then((res) => res.data),
};

export const assessmentAPI = {
  submitManual: (data: any): Promise<Assessment> =>
    apiClient.post<Assessment>('/assessment/manual', data).then((res) => res.data),

  getLatest: (): Promise<any> =>
    apiClient.get<any>('/assessment/latest').then((res) => res.data),

  getProtocols: (): Promise<any[]> =>
    apiClient.get('/assessment/protocols').then((res) => res.data),
};

export const planAPI = {
  getCurrent: (): Promise<TrainingPlan> =>
    apiClient.get<TrainingPlan>('/plan/current').then((res) => res.data),

  generate: (): Promise<TrainingPlan> =>
    apiClient.post<TrainingPlan>('/plan/generate').then((res) => res.data),

  getRecovery: (): Promise<any> =>
    apiClient.get('/plan/recovery').then((res) => res.data),

  submitRecoveryCheckIn: (data: any): Promise<any> =>
    apiClient.post('/plan/recovery/check-in', data).then((res) => res.data),

  getHistory: (): Promise<TrainingPlan[]> =>
    apiClient.get<TrainingPlan[]>('/plan/history').then((res) => res.data),
};


export const progressAPI = {
  logSession: (data: any): Promise<any> =>
    apiClient.post('/progress/log', data).then((res) => res.data),

  getDashboard: (): Promise<any> =>
    apiClient.get('/progress/dashboard').then((res) => res.data),

  getLogs: (limit: number = 20): Promise<any[]> =>
    apiClient.get(`/progress/logs?limit=${limit}`).then((res) => res.data),

  getReassessment: (): Promise<any> =>
    apiClient.get('/progress/reassessment').then((res) => res.data),
};

export default apiClient;
