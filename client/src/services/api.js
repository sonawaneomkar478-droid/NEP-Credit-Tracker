import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nep_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      if (window.location.pathname !== '/login' && window.location.pathname !== '/admin-login') {
        localStorage.removeItem('nep_token');
        localStorage.removeItem('nep_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Student endpoints
export const studentService = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// Subject catalog endpoints
export const subjectService = {
  getAll: (params) => api.get('/subjects', { params }),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Student Subject assignments & marks
export const studentSubjectService = {
  getByStudentId: (studentId, params) => api.get(`/student-subjects/${studentId}`, { params }),
  assign: (data) => api.post('/student-subjects', data),
  batchAssign: (data) => api.post('/student-subjects/batch-assign', data),
  update: (id, data) => api.put(`/student-subjects/${id}`, data),
  delete: (id) => api.delete(`/student-subjects/${id}`),
};

// Credit analytics & history
export const creditService = {
  getStudentCredits: (studentId) => api.get(`/credits/${studentId}`),
  getCreditHistory: (studentId) => api.get(`/credits/${studentId}/history`),
};

// Admin Dashboard stats
export const dashboardService = {
  getAdminStats: () => api.get('/dashboard/admin'),
};

export default api;
