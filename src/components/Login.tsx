import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from './AuthContext';
import { Lock, Mail, AlertCircle, Building2 } from 'lucide-react';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export function Login({ onNavigate }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const success = login(email, password);
      
      if (success) {
        onNavigate('home');
      } else {
        setError('Email atau password salah. Silakan coba lagi.');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004AAD] to-[#0066CC] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Building2 className="w-8 h-8 text-[#004AAD]" />
          </div>
          <h1 className="text-white mb-2">Sistem Informasi Magang</h1>
          <p className="text-white/80">Kelurahan Pulo Gebang</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-[#004AAD] mb-2">Selamat Datang</h2>
            <p className="text-gray-600">Silakan login untuk melanjutkan</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Demo Akun:</p>
            <div className="space-y-2 text-xs">
              <div className="bg-[#F4F4F4] p-3 rounded-lg">
                <p className="text-gray-700 mb-1"><strong>Admin:</strong></p>
                <p className="text-gray-600">Email: admin@kelurahan.com</p>
                <p className="text-gray-600">Password: admin123</p>
              </div>
              <div className="bg-[#F4F4F4] p-3 rounded-lg">
                <p className="text-gray-700 mb-1"><strong>User:</strong></p>
                <p className="text-gray-600">Email: user@example.com</p>
                <p className="text-gray-600">Password: user123</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center mt-6">
          <p className="text-white/80 text-sm">
            Belum punya akun?{' '}
            <button
              onClick={() => onNavigate('registration')}
              className="text-white underline hover:no-underline"
            >
              Daftar sekarang
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
