import { useState } from 'react';

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('crm_token'));
  const [role, setRole] = useState(localStorage.getItem('crm_role'));
  const [email, setEmail] = useState(localStorage.getItem('crm_email'));
  const [name, setName] = useState(localStorage.getItem('crm_name'));

  const storeLogin = (t, r, e, displayName) => {
    localStorage.setItem('crm_token', t);
    localStorage.setItem('crm_role', r);
    localStorage.setItem('crm_email', e);
    if (displayName) {
      localStorage.setItem('crm_name', displayName);
      setName(displayName);
    }
    setToken(t);
    setRole(r);
    setEmail(e);
  };

  const setDisplayName = (displayName) => {
    if (displayName) {
      localStorage.setItem('crm_name', displayName);
      setName(displayName);
    }
  };

  const logout = () => {
    ['crm_token', 'crm_role', 'crm_email', 'crm_name'].forEach((k) => localStorage.removeItem(k));
    setToken(null);
    setRole(null);
    setEmail(null);
    setName(null);
  };

  return {
    token,
    role,
    email,
    name,
    storeLogin,
    setDisplayName,
    logout,
    isLoggedIn: !!token
  };
}
