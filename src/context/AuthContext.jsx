import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext(null);

export const SESSION_KEY = 'sena_session';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

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
      brandName: userData.brandName || '',
      name: userData.name || userData.brandName || userData.email || '',
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    setSession(sessionData);
  };

  const logout = () => {
    navigate('/', { replace: true });
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    if (auth.currentUser) signOut(auth).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
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
