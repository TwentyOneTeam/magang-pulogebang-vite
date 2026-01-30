import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, AlertCircle, Loader2, Clock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { authAPI } from '../services/api';

type ForgotPasswordStep = 'email' | 'otp-password';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onSuccess?: () => void;
  onGoBack?: () => void;
}

export function ForgotPasswordModal({
  isOpen,
  onSuccess,
  onGoBack
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer untuk resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email harus diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.forgotPassword({ email });

      if (response.success) {
        // Move to OTP verification step
        setStep('otp-password');
        setResendCooldown(120); // 120 second (2 minute) cooldown
      } else {
        setError(response.message || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate OTP
    if (!resetOtp || resetOtp.length !== 6) {
      setError('Kode OTP harus 6 digit');
      return;
    }

    // Validate password
    if (!newPassword || !confirmPassword) {
      setError('Password baru dan konfirmasi harus diisi');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.resetPassword({
        email,
        resetOtp,
        newPassword,
        confirmPassword
      });

      if (response.success) {
        // Show success message
        alert('Password berhasil direset! Silakan login dengan password baru Anda.');
        if (onSuccess) onSuccess();
      } else {
        setError(response.message || 'Gagal mereset password. Silakan coba lagi.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });

      if (response.success) {
        setResetOtp('');
        setResendCooldown(120); // 120 second (2 minute) cooldown
      } else {
        setError(response.message || 'Gagal mengirim ulang OTP. Silakan coba lagi.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    if (onGoBack) onGoBack();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && step === 'email') {
        handleClose();
      } else if (!open && step === 'otp-password') {
        // Don't close on otp-password step
        return;
      }
    }}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => {
          if (step === 'otp-password') {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            {step === 'email'
              ? 'Masukkan email Anda untuk menerima kode OTP'
              : 'Masukkan kode OTP dan password baru Anda'}
          </DialogDescription>
        </DialogHeader>

        {step === 'email' ? (
          // Step 1: Email Input
          <form onSubmit={handleRequestReset} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="nama@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500">
                Kami akan mengirim kode OTP ke email ini
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#004AAD] hover:bg-[#003A8C]"
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Kirim Kode OTP'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleClose}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Login
            </Button>
          </form>
        ) : (
          // Step 2: OTP dan Password Input
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Display */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700">{email}</span>
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <Label htmlFor="reset-otp">Kode OTP (6 digit)</Label>
              <Input
                id="reset-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest font-mono"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 text-center">
                Kode OTP berlaku selama 5 menit
              </p>
            </div>

            {/* New Password Input */}
            <div className="space-y-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#004AAD] hover:bg-[#003A8C]"
              disabled={loading || resetOtp.length !== 6 || !newPassword || !confirmPassword}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>

            {/* Resend OTP Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendOTP}
              disabled={loading || resendCooldown > 0}
            >
              {resendCooldown > 0 ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Kirim Ulang OTP ({resendCooldown}s)
                </>
              ) : (
                'Kirim Ulang OTP'
              )}
            </Button>

            {/* Back Button */}
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep('email');
                setResetOtp('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
              }}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ganti Email
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
