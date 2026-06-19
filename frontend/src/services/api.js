import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor: Attach JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response Interceptor: Auto-refresh on 401 ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  googleLogin: (data) => api.post('/auth/google', data),
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const jobsAPI = {
  search: (params) => api.get('/jobs/search', { params }),
  smartSearch: (query, page = 0) => api.get('/jobs/smart-search', { params: { query, page } }),
  getById: (id) => api.get(`/jobs/${id}`),
  getFeatured: () => api.get('/jobs/featured'),
  create: (data) => api.post('/employer/jobs', data),
  update: (id, data) => api.put(`/employer/jobs/${id}`, data),
  delete: (id) => api.delete(`/employer/jobs/${id}`),
  getMyJobs: () => api.get('/employer/jobs'),
};

// ─── Applications ─────────────────────────────────────────────────────────────
export const applicationsAPI = {
  apply: (jobId, data) => api.post(`/seeker/jobs/${jobId}/apply`, data),
  getMyApplications: () => api.get('/seeker/applications'),
  getJobApplications: (jobId) => api.get(`/employer/jobs/${jobId}/applications`),
  updateStatus: (appId, status) => api.patch(`/employer/applications/${appId}/status`, { status }),
};

// ─── AI Features ─────────────────────────────────────────────────────────────
export const aiAPI = {
  analyzeResume: (jobId) => api.post(`/seeker/ai/analyze-resume/${jobId}`),
  getRecommendations: () => api.get('/seeker/ai/recommendations'),
  explainRecommendation: (jobId) => api.get(`/seeker/ai/recommendations/${jobId}/explain`),
};

// ─── Resume Upload ────────────────────────────────────────────────────────────
export const resumeAPI = {
  upload: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/seeker/resume/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: () => api.delete('/seeker/resume'),
};

// ─── Seeker Profile ───────────────────────────────────────────────────────────
export const seekerAPI = {
  getProfile: () => api.get('/seeker/profile'),
  updateProfile: (data) => api.put('/seeker/profile', data),
};

// ─── Employer Profile ─────────────────────────────────────────────────────────
export const employerAPI = {
  getProfile: () => api.get('/employer/profile'),
  updateProfile: (data) => api.put('/employer/profile', data),
};

export default api;
