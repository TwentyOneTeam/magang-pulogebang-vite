import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from './AuthContext';
import { Mail, AlertCircle, Loader2, Clock, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface OTPVerificationModalProps {
  isOpen: boolean;
  email: string;
  onSuccess?: () => void;
  onGoBack?: () => void;
}

export function OTPVerificationModal({
  isOpen,
  email,
  onSuccess,
  onGoBack
}: OTPVerificationModalProps) {
  const { verifyOTP, resendOTP, error } = useAuth();
  const [otpCode, setOtpCode] = useState('');
  const [localError, setLocalError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(120); // Start dengan 120 detik
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  // Set initial cooldown saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setResendCooldown(120); // Reset ke 120 detik
    }
  }, [isOpen]);

  // Countdown timer untuk resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Validate OTP format (must be 6 digits)
    if (!otpCode || otpCode.length !== 6) {
      setLocalError('Kode OTP harus 6 digit');
      return;
    }

    if (!/^\d{6}$/.test(otpCode)) {
      setLocalError('Kode OTP hanya boleh berisi angka');
      return;
    }

    setVerifying(true);
    const success = await verifyOTP(email, otpCode);

    if (success) {
      setOtpCode('');
      if (onSuccess) onSuccess();
    } else {
      setLocalError(error || 'Verifikasi OTP gagal. Silakan coba lagi.');
    }
    setVerifying(false);
  };

  const handleResendOTP = async () => {
    setLocalError('');
    setResending(true);

    const success = await resendOTP(email);

    if (success) {
      setOtpCode('');
      setResendCooldown(120); // 120 second (2 minute) cooldown
    } else {
      setLocalError(error || 'Gagal mengirim ulang OTP. Silakan coba lagi.');
    }
    setResending(false);
  };

  const displayError = localError || error;

  return (
    <>
      <style>{`
        .otp-modal [data-testid="radix-dialog-close"] {
          display: none !important;
        }
      `}</style>
      <Dialog open={isOpen}>
        <DialogContent className="sm:max-w-[425px] otp-modal" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Verifikasi Email</DialogTitle>
          <DialogDescription>
            Kami telah mengirim kode OTP ke email Anda. Silakan masukkan kode tersebut untuk melanjutkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Email display */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Mail className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-700">{email}</span>
          </div>

          {/* Error Alert */}
          {displayError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp-code">Kode OTP (6 digit)</Label>
              <Input
                id="otp-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest font-mono"
                disabled={verifying}
              />
              <p className="text-xs text-gray-500 text-center">
                Kode OTP berlaku selama 5 menit
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#004AAD] hover:bg-[#003A8C]"
              disabled={verifying || otpCode.length !== 6}
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                'Verifikasi Email'
              )}
            </Button>
          </form>

          {/* Resend OTP Button */}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendOTP}
              disabled={resending || resendCooldown > 0}
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
              onClick={onGoBack}
              disabled={verifying || resending}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </div>

          {/* Info Text */}
          <p className="text-xs text-center text-gray-600">
            Tidak menerima kode? Periksa folder spam atau coba kirim ulang OTP
          </p>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
