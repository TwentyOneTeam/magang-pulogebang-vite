import { Menu, LogOut, User, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { useAuth } from './AuthContext';
import { LoginSheet } from './LoginSheet';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const pathToPageMap: Record<string, string> = {
  '/': 'home',
  '/informasi-magang': 'info',
  '/pendaftaran': 'registration',
  '/status-pengajuan': 'status',
  '/chatbot': 'chatbot',
  '/admin': 'admin',
};

interface MenuItemType {
  label: string;
  path: string;
  page: string;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const baseMenuItems: MenuItemType[] = [
    { label: 'Beranda', page: 'home', path: '/' },
    { label: 'Informasi Magang', page: 'info', path: '/informasi-magang' },
    { label: 'Pendaftaran', page: 'registration', path: '/pendaftaran' },
    { label: 'Status Pengajuan', page: 'status', path: '/status-pengajuan' },
    { label: 'Chatbot AI', page: 'chatbot', path: '/chatbot' },
  ];

  // Only show Admin menu if user is admin
  const menuItems = isAdmin
    ? [...baseMenuItems, { label: 'Admin', page: 'admin', path: '/admin' }]
    : baseMenuItems;

  const currentPage = pathToPageMap[location.pathname] || 'home';

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Anda berhasil logout');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleLoginSuccess = () => {
    setLoginDialogOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavigate('/')}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden">
              <img 
              src="/logo.svg" 
              alt="Logo Jakarta" 
              className="w-full h-full object-contain p-1"/>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-[#004AAD]">Kelurahan Pulo Gebang</h1>
              <p className="text-xs text-gray-600">Sistem Informasi Magang</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {menuItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleNavigate(item.path)}
                  className={`text-sm transition-all hover:text-[#004AAD] hover:scale-110 relative ${
                    currentPage === item.page ? 'text-[#004AAD] font-medium' : 'text-gray-700'
                  } ${currentPage === item.page ? 'after:content-[""] after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-[#004AAD]' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden xl:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p>{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-[#004AAD] uppercase">{user.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-[#004AAD] hover:bg-[#003A8C] gap-2"
                    size="sm"
                  >
                    <LogIn className="w-4 h-4" />
                    Masuk
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-[#004AAD]">Login</DialogTitle>
                    <DialogDescription>
                      Silakan login untuk mengakses semua fitur
                    </DialogDescription>
                  </DialogHeader>
                  <LoginSheet onSuccess={handleLoginSuccess} onClose={() => setLoginDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-[#004AAD]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px] p-0">
              <div className="flex flex-col h-full overflow-y-auto">
                <div className="px-6 py-6 border-b">
                  <SheetHeader>
                    <SheetTitle className="text-[#004AAD] text-xl mb-2">Menu</SheetTitle>
                    <SheetDescription className="text-gray-600">
                      Navigasi dan akses fitur lainnya
                    </SheetDescription>
                  </SheetHeader>
                </div>

                {/* User Info */}
                {user && (
                  <div className="px-6 py-6 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#004AAD] rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <p className="text-xs text-[#004AAD] uppercase mt-1 font-semibold">{user.role}</p>
                      </div>
                    </div>
                  </div>
                )}

                <nav className="flex flex-col gap-2 px-6 py-6 flex-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.page}
                      onClick={() => handleNavigate(item.path)}
                      className={`text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                        currentPage === item.page
                          ? 'bg-[#004AAD] text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>

                {/* Login/Logout Button */}
                <div className="px-6 py-4 border-t mt-auto">
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-lg transition-colors hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  ) : (
                    <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
                      <DialogTrigger asChild>
                        <button
                          className="w-full text-left px-4 py-3 rounded-lg transition-colors bg-[#004AAD] text-white flex items-center gap-2 font-medium text-sm"
                        >
                          <LogIn className="w-4 h-4" />
                          Masuk
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-[#004AAD]">Login</DialogTitle>
                          <DialogDescription>
                            Silakan login untuk mengakses semua fitur
                          </DialogDescription>
                        </DialogHeader>
                        <LoginSheet onSuccess={handleLoginSuccess} onClose={() => setLoginDialogOpen(false)} />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}