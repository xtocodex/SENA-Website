import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2, Gamepad2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Flex } from "@/components/ui/layout";
import { ensureUserDoc } from '@/lib/userAccount';
import UserDashboard from '@/pages/UserDashboard';

function LoadingScreen() {
  return (
    <Flex direction="col" align="center" justify="center" className="min-h-screen gap-3">
      <Gamepad2 className="w-10 h-10 text-primary" />
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </Flex>
  );
}

// Players get instant access — no approval gate. On first sign-in the user doc is
// seeded with mock stats/coins; unauthenticated visitors are redirected to /login.
export default function UserGate() {
  const { login } = useAuth();
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const sessionInitialized = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setAuthLoading(false);
        sessionInitialized.current = false;
        return;
      }
      try {
        const profile = await ensureUserDoc(u);
        if (!sessionInitialized.current) {
          login({
            role: 'user',
            id: u.uid,
            email: profile.email || u.email || '',
            name: profile.name || u.displayName || u.email || 'Player',
          });
          sessionInitialized.current = true;
        }
        setUser(u);
      } catch (err) {
        console.error('Failed to initialize player account:', err);
      } finally {
        setAuthLoading(false);
      }
    });
    return () => unsub();
  }, [login]);

  if (authLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <UserDashboard />;
}
