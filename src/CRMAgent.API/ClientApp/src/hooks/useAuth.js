import { useState } from 'react';

export function useAuth() {
  const [token, setToken]   = useState(localStorage.getItem('crm_token'));
  const [role, setRole]     = useState(localStorage.getItem('crm_role'));
  const [email, setEmail]   = useState(localStorage.getItem('crm_email'));

  const storeLogin = (t, r, e) => {
    localStorage.setItem('crm_token', t);
    localStorage.setItem('crm_role',  r);
    localStorage.setItem('crm_email', e);
    setToken(t); setRole(r); setEmail(e);
  };

  const logout = () => {
    ['crm_token','crm_role','crm_email'].forEach(k => localStorage.removeItem(k));
    setToken(null); setRole(null); setEmail(null);
  };

  return { token, role, email, storeLogin, logout, isLoggedIn: !!token };
}