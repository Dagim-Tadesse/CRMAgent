import { useState } from 'react';

function decodeJwtPayload(token) {
  const part = token.split('.')[1];
  if (!part) throw new Error('Invalid token');
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = decodeJwtPayload(token);
    if (!payload.exp) return true;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function clearAuthStorage() {
  ['crm_token', 'crm_role', 'crm_email'].forEach(k => localStorage.removeItem(k));
}

function readInitialAuth() {
  const token = localStorage.getItem('crm_token');
  if (!isTokenValid(token)) {
    clearAuthStorage();
    return { token: null, role: null, email: null };
  }
  return {
    token,
    role: localStorage.getItem('crm_role'),
    email: localStorage.getItem('crm_email')
  };
}

export function useAuth() {
  const initial = readInitialAuth();
  const [token, setToken] = useState(initial.token);
  const [role, setRole] = useState(initial.role);
  const [email, setEmail] = useState(initial.email);

  const storeLogin = (t, r, e) => {
    localStorage.setItem('crm_token', t);
    localStorage.setItem('crm_role', r);
    localStorage.setItem('crm_email', e);
    setToken(t); setRole(r); setEmail(e);
  };

  const logout = () => {
    clearAuthStorage();
    setToken(null); setRole(null); setEmail(null);
  };

  const isLoggedIn = isTokenValid(token);

  return { token, role, email, storeLogin, logout, isLoggedIn };
}
