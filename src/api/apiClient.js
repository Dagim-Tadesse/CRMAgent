// ALL API calls go through this file — never write fetch/axios directly in pages
import axios from 'axios';

const BASE = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7001';

const api = axios.create({ baseURL: BASE });

// Auto-attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('crm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: clear stale auth and send user to login
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Don't bounce away during a failed login attempt
      if (!url.includes('/api/auth/login')) {
        ['crm_token', 'crm_role', 'crm_email'].forEach(k => localStorage.removeItem(k));
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// AUTH
export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

// LEADS
export const getLeads    = ()      => api.get('/api/leads');
export const getLeadById = (id)    => api.get(`/api/leads/${id}`);
export const createLead  = (data)  => api.post('/api/leads', data);
export const deleteLead  = (id)    => api.delete(`/api/leads/${id}`);
export const updateLeadStage = (id, stage) =>
  api.put(`/api/leads/${id}/stage`, { stage });

// INTERACTIONS
export const getInteractions = (leadId) =>
  api.get(`/api/leads/${leadId}/interactions`);

// DRAFTS — built by Person B, used by Lead Detail page
export const getDrafts      = (leadId) => api.get(`/api/leads/${leadId}/drafts`);
export const generateDraft  = (leadId) => api.post(`/api/leads/${leadId}/drafts/generate`);
export const editDraft      = (id, subject, body) => api.put(`/api/drafts/${id}`, { subject, body });
export const approveDraft   = (id) => api.put(`/api/drafts/${id}/approve`);
export const rejectDraft    = (id) => api.put(`/api/drafts/${id}/reject`);

// AI TASKS — built by Person B
export const getPendingTasks = () => api.get('/api/tasks/pending');

// LOGS
export const getLogs       = ()      => api.get('/api/logs');
export const getLogsByLead = (leadId) => api.get(`/api/logs/lead/${leadId}`);

// JOBS
export const runDailyCheck = () => api.post('/api/jobs/run-daily-check');