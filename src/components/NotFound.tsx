import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-md text-center">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-50 border-4 border-red-200">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
          </div>

          {/* Error Code */}
          <h1 className="text-8xl font-bold text-gray-900 mb-2">404</h1>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Halaman Tidak Ditemukan
          </h2>

          {/* Description */}
          <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed">
            Maaf, halaman yang Anda cari tidak ada atau telah dihapus. Silakan kembali ke halaman utama atau gunakan tombol di bawah ini.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#004AAD] hover:bg-[#003580] text-white font-semibold rounded-lg transition-all hover:scale-105"
            >
              <Home className="w-5 h-5" />
              Ke Beranda
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#004AAD] text-[#004AAD] hover:bg-[#004AAD] hover:text-white font-semibold rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </Button>
          </div>

          {/* Additional Help */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Butuh bantuan? Coba jelajahi:
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate('/informasi-magang')}
                className="text-[#004AAD] hover:text-[#003580] font-medium transition-colors"
              >
                → Informasi Magang
              </button>
              <button
                onClick={() => navigate('/pendaftaran')}
                className="text-[#004AAD] hover:text-[#003580] font-medium transition-colors"
              >
                → Pendaftaran
              </button>
              <button
                onClick={() => navigate('/chatbot')}
                className="text-[#004AAD] hover:text-[#003580] font-medium transition-colors"
              >
                → Chatbot AI
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
