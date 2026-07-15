import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext(null);

export const SESSION_KEY = 'sena_session';

// Per-account remembered workspace tier ('max' | 'mini'), keyed by uid so two
// Google accounts on the same browser don't share a choice.
const tierKey = (id) => `sena_tier_${id}`;
export const getRememberedTier = (id) => {
  const t = id ? localStorage.getItem(tierKey(id)) : null;
  return t === 'max' || t === 'mini' ? t : null;
};

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
      tier: userData.tier ?? getRememberedTier(userData.id),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    setSession(sessionData);
  };

  // Choose (or clear, with null) the SENA MAX / SENA MINI workspace for this
  // session. The choice is remembered per account and re-applied on next login.
  const setTier = (tier) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, tier };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      if (prev.id) {
        if (tier) localStorage.setItem(tierKey(prev.id), tier);
        else localStorage.removeItem(tierKey(prev.id));
      }
      return next;
    });
  };

  const logout = () => {
    navigate('/', { replace: true });
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    if (auth.currentUser) signOut(auth).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, setTier }}>
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
