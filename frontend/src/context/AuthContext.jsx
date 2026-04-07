import React, { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const team = JSON.parse(localStorage.getItem('team') || 'null');
      return team ? { team } : null;
    } catch { return null; }
  });

  const login = (data) => {
    // Backend { token, team: { id, teamName, botApiKey, score, ... } } döndürüyor
    // data.team varsa onu al, yoksa data'nın kendisi zaten team objesidir
    const team = data?.team ?? data;
    localStorage.setItem('team', JSON.stringify(team));
    setAuth({ team });
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error("Logout hatası:", err);
    } finally {
      localStorage.removeItem('team');
      setAuth(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}