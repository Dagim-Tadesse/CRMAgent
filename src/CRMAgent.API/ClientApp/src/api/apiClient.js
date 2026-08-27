// src/api/apiClient.js
// ALL API calls go through this file — never write fetch/axios directly in pages

import axios from 'axios';
// If you need useState, import it here at the TOP

const BASE = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7001';

const api = axios.create({ baseURL: BASE });

// Auto-attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('crm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-handle 401 Unauthorized responses (token expired or DB reset)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Clear token and bounce to login
      ['crm_token', 'crm_role', 'crm_email', 'crm_name'].forEach(k => localStorage.removeItem(k));
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ============
export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

/** Admin: create Identity user (password hashed server-side). */
export const registerUser = ({ name, email, phone, password, role }) =>
  api.post('/api/auth/register', { name, email, phone, password, role });

/** Authenticated: persist new password via Identity ChangePasswordAsync. */
export const changePassword = ({ currentPassword, newPassword, confirmPassword }) =>
  api.put('/api/auth/change-password', { currentPassword, newPassword, confirmPassword });

/** Current user profile from AspNetUsers + FullName claim. */
export const getMyProfile = () => api.get('/api/auth/me');

/** Update name / phone on the authenticated Identity user. */
export const updateMyProfile = ({ name, phone }) =>
  api.put('/api/auth/me', { name, phone });

/** Shared team directory (any authenticated user). */
export const getTeamUsers = () => api.get('/api/auth/users');

/** Admin: delete an Identity user. */
export const deleteTeamUser = (id) => api.delete(`/api/auth/users/${id}`);

// ============ LEADS ============
export const getLeads = () => api.get('/api/leads');
export const getLeadById = (id) => api.get(`/api/leads/${id}`);
export const createLead = (data) => api.post('/api/leads', data);
export const deleteLead = (id) => api.delete(`/api/leads/${id}`);
export const updateLeadStage = (id, stage) =>
  api.put(`/api/leads/${id}/stage`, { stage });

// ============ INTERACTIONS ============
export const getInteractions = (leadId) =>
  api.get(`/api/leads/${leadId}/interactions`);

// ============ DRAFTS ============
export const getDrafts = (leadId) => api.get(`/api/leads/${leadId}/drafts`);
export const generateDraft = (leadId) => api.post(`/api/leads/${leadId}/drafts/generate`);
export const editDraft = (id, subject, body) =>
  api.put(`/api/drafts/${id}`, { subject, body });
export const approveDraft = (id) => api.put(`/api/drafts/${id}/approve`);
export const rejectDraft = (id) => api.put(`/api/drafts/${id}/reject`);
export const escalateDraft = (id, escalationNote, body) => 
  api.put(`/api/drafts/${id}/escalate`, { escalationNote, body });
export const reviewDraftEscalation = (id, status, managerFeedback, body) => 
  api.put(`/api/drafts/${id}/review-escalation`, { status, managerFeedback, body });

// ============ AI TASKS ============
export const getPendingTasks = () => api.get('/api/tasks/pending');

// ============ LOGS ============
export const getLogs = () => api.get('/api/logs');
export const getLogsByLead = (leadId) => api.get(`/api/logs/lead/${leadId}`);

// ============ JOBS ============
export const runDailyCheck = () => api.post('/api/jobs/run-daily-check');

// ============ SCHEDULE / CALENDAR ============
export const getSchedule = () => api.get('/api/schedule');
export const getScheduleEvent = (id) => api.get(`/api/schedule/${id}`);
export const createScheduleEvent = (data) => api.post('/api/schedule', data);
export const updateScheduleEvent = (id, data) => api.put(`/api/schedule/${id}`, data);
export const deleteScheduleEvent = (id) => api.delete(`/api/schedule/${id}`);

// ============ SOCIAL SIGNALS ============
export const getSocialSignals = () => api.get('/api/social-signals');

// ============ EXPORT DEFAULT ============
export default api;
