import { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { onSnapshot, doc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Loader2, Gamepad2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Flex } from "@/components/ui/layout";
import BrandRegister from '@/pages/BrandRegister';
import BrandStatus from '@/pages/BrandStatus';
import BrandDashboard from '@/pages/BrandDashboard';

function LoadingScreen() {
  return (
    <Flex direction="col" align="center" justify="center" className="min-h-screen gap-3">
      <Gamepad2 className="w-10 h-10 text-primary" />
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </Flex>
  );
}

export default function BrandGate() {
  const { login, logout } = useAuth();
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [request, setRequest] = useState(undefined);
  const [brand, setBrand] = useState(undefined);
  const [forceResubmit, setForceResubmit] = useState(false);
  const approvedToastShown = useRef(false);
  const sessionInitialized = useRef(false);

  // ── Track Firebase Auth state ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (!u) {
        setRequest(undefined);
        setBrand(undefined);
        approvedToastShown.current = false;
        sessionInitialized.current = false;
      }
    });
    return () => unsub();
  }, []);

  // ── Subscribe to brand + request docs ──
  useEffect(() => {
    if (!user?.uid) return;
    setRequest(undefined);
    setBrand(undefined);

    const unsubReq = onSnapshot(doc(db, 'brand_requests', user.uid), (snap) => {
      setRequest(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    }, () => setRequest(null));

    const unsubBrand = onSnapshot(doc(db, 'brands', user.uid), (snap) => {
      setBrand(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    }, () => setBrand(null));

    return () => { unsubReq(); unsubBrand(); };
  }, [user?.uid]);

  // ── Sync approved brand → session, auto-logout on revoke ──
  useEffect(() => {
    if (!user || request === undefined || brand === undefined) return;

    if (brand && brand.status === 'approved') {
      // Initialize / refresh local session
      if (!sessionInitialized.current) {
        login({
          role: 'brand',
          id: user.uid,
          email: brand.email || user.email,
          brandName: brand.brandName || brand.companyName || '',
          name: brand.name || brand.brandName || brand.email || '',
        });
        sessionInitialized.current = true;
      }
      // Toast once on first transition to approved
      if (!approvedToastShown.current) {
        approvedToastShown.current = true;
        toast.success(`Welcome, ${brand.brandName || brand.companyName || 'Brand'}! Your request has been approved. Our team will contact you within 24–48 hours.`);
      }
      return;
    }

    // Was approved before, now gone (DEV revoked) — auto-logout
    if (sessionInitialized.current && !brand) {
      toast.error('Your brand account is no longer available.');
      logout();
    }
  }, [brand, user, request, login, logout]);

  // ── Render branching ──
  if (authLoading) return <LoadingScreen />;

  // Not signed in → Step 1 of registration
  if (!user) return <BrandRegister user={null} />;

  if (request === undefined || brand === undefined) return <LoadingScreen />;

  // Approved → Dashboard (BrandDashboard reads useAuth().session set above)
  if (brand && brand.status === 'approved') {
    return <BrandDashboard />;
  }

  // Rejected → status screen with resubmit
  if (request?.status === 'rejected' && !forceResubmit) {
    return (
      <BrandStatus
        request={request}
        onResubmit={() => setForceResubmit(true)}
      />
    );
  }

  // Pending → status screen
  if (request?.status === 'pending') {
    return <BrandStatus request={request} />;
  }

  // No request yet, OR user opted to resubmit → Step 2 form
  return (
    <BrandRegister
      user={user}
      initialData={forceResubmit ? request : null}
      resubmit={forceResubmit}
      onSubmitted={() => setForceResubmit(false)}
    />
  );
}
