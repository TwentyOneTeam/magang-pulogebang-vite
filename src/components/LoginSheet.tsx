import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from './AuthContext';
import { Lock, Mail, AlertCircle, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface LoginSheetProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function LoginSheet({ onSuccess, onClose }: LoginSheetProps) {
  const { login } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const loginSuccess = login(loginEmail, loginPassword);
      
      if (loginSuccess) {
        setSuccess('Login berhasil!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 500);
      } else {
        setError('Email atau password salah. Silakan coba lagi.');
      }
      setLoading(false);
    }, 500);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Simulate signup - in real app, this would create a new user
      // For demo, we'll just show success and ask them to login
      setSuccess('Pendaftaran berhasil! Silakan login dengan akun Anda.');
      setSignupEmail('');
      setSignupPassword('');
      setSignupName('');
      setLoading(false);
      
      // Switch to login tab after 1 second
      setTimeout(() => {
        setSuccess('');
      }, 2000);
    }, 500);
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Masuk</TabsTrigger>
          <TabsTrigger value="signup">Daftar</TabsTrigger>
        </TabsList>

        {/* Login Tab */}
        <TabsContent value="login" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-[#004AAD] mb-1">Selamat Datang Kembali</h3>
            <p className="text-sm text-gray-600">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50">
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="nama@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#004AAD] hover:bg-[#003A8C]"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-600 mb-2">Demo Akun:</p>
            <div className="space-y-2 text-xs">
              <div className="bg-[#F4F4F4] p-2 rounded">
                <p className="text-gray-700"><strong>Admin:</strong> admin@kelurahan.com / admin123</p>
              </div>
              <div className="bg-[#F4F4F4] p-2 rounded">
                <p className="text-gray-700"><strong>User:</strong> user@example.com / user123</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Signup Tab */}
        <TabsContent value="signup" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-[#004AAD] mb-1">Buat Akun Baru</h3>
            <p className="text-sm text-gray-600">Daftar untuk mengajukan magang</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50">
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Nama Lengkap</Label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Nama lengkap Anda"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="nama@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#004AAD] hover:bg-[#003A8C]"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Daftar Akun'}
            </Button>
          </form>

          <p className="text-xs text-center text-gray-600 mt-4">
            Dengan mendaftar, Anda menyetujui syarat dan ketentuan yang berlaku
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
