import { useState } from 'react';
import { Home } from './components/Home';
import { InternshipInfo } from './components/InternshipInfo';
import { Registration } from './components/Registration';
import { ApplicationStatus } from './components/ApplicationStatus';
import { Chatbot } from './components/Chatbot';
import { AdminDashboard } from './components/AdminDashboard';
import { HelpButton } from './components/HelpButton';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Alert, AlertDescription } from './components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

type Page = 'home' | 'info' | 'registration' | 'status' | 'chatbot' | 'admin';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { isAuthenticated, isAdmin } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);

  // Handle navigation with auth check
  const handleNavigate = (page: Page) => {
    setAccessDenied(false);

    // Check if trying to access admin page without admin role
    if (page === 'admin' && !isAdmin) {
      setAccessDenied(true);
      setTimeout(() => setAccessDenied(false), 3000);
      return;
    }

    // All pages are now accessible without login except admin
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'info':
        return <InternshipInfo onNavigate={handleNavigate} />;
      case 'registration':
        return <Registration onNavigate={handleNavigate} />;
      case 'status':
        return <ApplicationStatus onNavigate={handleNavigate} />;
      case 'chatbot':
        return <Chatbot onNavigate={handleNavigate} />;
      case 'admin':
        // Double check admin access
        if (!isAdmin) {
          return <Home onNavigate={handleNavigate} />;
        }
        return <AdminDashboard onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-white">
        {/* Access Denied Alert */}
        {accessDenied && (
          <div className="fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Akses ditolak! Anda tidak memiliki izin untuk mengakses halaman Admin.
              </AlertDescription>
            </Alert>
          </div>
        )}
      
        {renderPage()}
        
        {/* Help Button - Always visible on all pages */}
        <HelpButton onNavigate={handleNavigate} />
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