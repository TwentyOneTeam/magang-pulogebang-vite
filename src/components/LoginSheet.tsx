import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from './AuthContext';
import { Lock, Mail, AlertCircle, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { OTPVerificationModal } from './OTPVerificationModal';
import { ForgotPasswordModal } from './ForgotPasswordModal';interface LoginSheetProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function LoginSheet({ onSuccess, onClose }: LoginSheetProps) {
  const { login, register } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginSuccess = await login(loginEmail, loginPassword);
      
      if (loginSuccess) {
        setSuccess('Login berhasil!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 500);
      } else {
        setError('Email atau password salah. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await register(signupName, signupEmail, signupPassword);
      
      if (result.success) {
        // Jika memerlukan verifikasi OTP
        if (result.requiresVerification) {
          setPendingEmail(signupEmail);
          setShowOTPModal(true);
          // Reset form
          setSignupName('');
          setSignupEmail('');
          setSignupPassword('');
          setLoading(false);
          return;
        }

        // Jika tidak memerlukan verifikasi (overwrite case)
        setSuccess('Pendaftaran berhasil! Anda akan diarahkan...');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 1000);
      } else {
        setError('Pendaftaran gagal. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSuccess = () => {
    setShowOTPModal(false);
    setPendingEmail('');
    setSuccess('Email berhasil diverifikasi! Anda akan diarahkan...');
    setTimeout(() => {
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }, 1000);
  };

  const handleOTPGoBack = () => {
    setShowOTPModal(false);
    setPendingEmail('');
    // Restore signup form
    setSignupEmail(pendingEmail);
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
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-[#004AAD] hover:text-[#003A8C] hover:underline"
                >
                  Lupa Password?
                </button>
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
                  type={showSignupPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSignupPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
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

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        email={pendingEmail}
        onSuccess={handleOTPSuccess}
        onGoBack={handleOTPGoBack}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onSuccess={() => {
          setShowForgotPassword(false);
          setLoginEmail('');
          setLoginPassword('');
        }}
        onGoBack={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
