import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const SESSION_KEY = 'sena_session';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const login = (userData) => {
    const sessionData = {
      role: userData.role,
      email: userData.email,
      id: userData.id,
      brandName: userData.brandName || ''
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    setSession(sessionData);
  };

  return (
    <AuthContext.Provider value={{ session, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = '/';
}