import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, SESSION_KEY } from '@/context/AuthContext';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import BrandDashboard from '@/pages/BrandDashboard';
import DevDashboard from '@/pages/DevDashboard';

function ProtectedRoute({ role, children }) {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  
  if (!sessionStr) {
    return <Navigate to="/" replace />;
  }
  
  try {
    const session = JSON.parse(sessionStr);
    if (session.role !== role) {
      return <Navigate to="/" replace />;
    }
  } catch {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/brand" 
            element={
              <ProtectedRoute role="brand">
                <BrandDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dev" 
            element={
              <ProtectedRoute role="dev">
                <DevDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}