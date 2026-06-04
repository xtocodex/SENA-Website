import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, SESSION_KEY } from '@/context/AuthContext';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import BrandGate from '@/pages/BrandGate';
import UserGate from '@/pages/UserGate';
import DevDashboard from '@/pages/DevDashboard';

function ProtectedDevRoute({ children }) {
  const sessionStr = localStorage.getItem(SESSION_KEY);

  if (!sessionStr) {
    return <Navigate to="/" replace />;
  }

  try {
    const session = JSON.parse(sessionStr);
    if (session.role !== 'dev') {
      return <Navigate to="/" replace />;
    }
  } catch {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster richColors position="bottom-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/brand" element={<BrandGate />} />
          <Route path="/user" element={<UserGate />} />
          <Route
            path="/dev"
            element={
              <ProtectedDevRoute>
                <DevDashboard />
              </ProtectedDevRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
