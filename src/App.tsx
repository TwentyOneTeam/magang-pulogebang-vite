import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Home } from './components/Home';
import { InternshipInfo } from './components/InternshipInfo';
import { Registration } from './components/Registration';
import { ApplicationStatus } from './components/ApplicationStatus';
import { Chatbot } from './components/Chatbot';
import { About } from './components/About';
import { AdminDashboard } from './components/AdminDashboard';
import { NotFound } from './components/NotFound';
import { HelpButton } from './components/HelpButton';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { isAdmin, isInitializing } = useAuth();
  const location = useLocation();

  // Reset scroll position on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Jika sedang melakukan initial auth verification dan user tersebut berada di /admin
  // maka show loading screen
  if (isInitializing && location.pathname === '/admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#004AAD] mx-auto mb-4" />
          <p className="text-gray-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

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
          <Route path="/tentang-kami" element={<About />} />
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