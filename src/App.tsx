import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Home } from './components/Home';
import { InternshipInfo } from './components/InternshipInfo';
import { Registration } from './components/Registration';
import { ApplicationStatus } from './components/ApplicationStatus';
import { Chatbot } from './components/Chatbot';
import { AdminDashboard } from './components/AdminDashboard';
import { NotFound } from './components/NotFound';
import { HelpButton } from './components/HelpButton';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Reset scroll position on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/informasi-magang" element={<InternshipInfo />} />
          <Route path="/pendaftaran" element={<Registration />} />
          <Route path="/status-pengajuan" element={<ApplicationStatus />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route
            path="/admin"
            element={isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Help Button - Always visible on all pages */}
        <HelpButton />
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}