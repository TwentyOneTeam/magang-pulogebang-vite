import { Menu, X, LogOut, User, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { useAuth } from './AuthContext';
import { LoginSheet } from './LoginSheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

type Page = 'home' | 'info' | 'registration' | 'status' | 'chatbot' | 'admin';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage?: Page;
}

export function Header({ onNavigate, currentPage = 'home' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  const baseMenuItems = [
    { label: 'Beranda', page: 'home' as Page },
    { label: 'Informasi Magang', page: 'info' as Page },
    { label: 'Pendaftaran', page: 'registration' as Page },
    { label: 'Status Pengajuan', page: 'status' as Page },
    { label: 'Chatbot AI', page: 'chatbot' as Page },
  ];

  // Only show Admin menu if user is admin
  const menuItems = isAdmin
    ? [...baseMenuItems, { label: 'Admin', page: 'admin' as Page }]
    : baseMenuItems;

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
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
            onClick={() => handleNavigate('home')}
          >
            <div className="w-10 h-10 md:w-12 md:h-12">
              <img
              src="/logo.svg"
              alt="Logo DKI Jakarta"
              className="w-full h-full object-contain"
              />
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
                  onClick={() => handleNavigate(item.page)}
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
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="text-[#004AAD]">Menu</SheetTitle>
                <SheetDescription>
                  Navigasi dan akses fitur lainnya
                </SheetDescription>
              </SheetHeader>

              {/* User Info */}
              {user && (
                <div className="mb-6 pb-6 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#004AAD] rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-[#004AAD] uppercase mt-1">{user.role}</p>
                    </div>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-4 mt-8">
                {menuItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => handleNavigate(item.page)}
                    className={`text-left p-3 rounded-lg transition-colors ${
                      currentPage === item.page
                        ? 'bg-[#004AAD] text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                {/* Login/Logout Button */}
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="text-left p-3 rounded-lg transition-colors hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                ) : (
                  <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
                    <DialogTrigger asChild>
                      <button
                        className="text-left p-3 rounded-lg transition-colors bg-[#004AAD] text-white flex items-center gap-2"
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}