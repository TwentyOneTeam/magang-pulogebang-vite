import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const helpItems = [
    {
      title: 'Cara Mendaftar Magang',
      description: 'Pelajari langkah-langkah untuk mendaftar program magang',
      action: () => {
        setIsOpen(false);
        navigate('/informasi-magang');
      },
    },
    {
      title: 'Tanya Chatbot AI',
      description: 'Dapatkan jawaban cepat dari asisten AI kami',
      action: () => {
        setIsOpen(false);
        navigate('/chatbot');
      },
    },
    {
      title: 'Cek Status Pengajuan',
      description: 'Pantau status pengajuan magang Anda',
      action: () => {
        setIsOpen(false);
        navigate('/status-pengajuan');
      },
    },
    {
      title: 'Informasi Lowongan',
      description: 'Lihat lowongan magang yang tersedia',
      action: () => {
        setIsOpen(false);
        navigate('/informasi-magang');
      },
    },
  ];

  return (
    <>
      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg bg-[#FFD95A] hover:bg-[#FFD95A]/90 text-[#004AAD] hover:scale-110 transition-all duration-300 border-2 border-[#004AAD]"
          aria-label="Bantuan dan Panduan"
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      </div>

      {/* Help Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[95vw] max-w-sm sm:max-w-md md:max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-[#004AAD] flex items-center gap-2 text-base sm:text-lg">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="truncate">Bantuan & Panduan</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Pilih topik bantuan yang Anda butuhkan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
            {helpItems.map((item, index) => (
              <Card
                key={index}
                className="p-3 sm:p-4 cursor-pointer hover:shadow-md hover:border-[#004AAD] transition-all duration-200 border-2 hover:scale-[1.02]"
                onClick={item.action}
              >
                <h4 className="text-[#004AAD] mb-1 text-sm sm:text-base font-medium truncate">{item.title}</h4>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{item.description}</p>
              </Card>
            ))}
          </div>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs sm:text-sm text-[#004AAD] leading-relaxed">
              <strong className="block mb-1">Butuh bantuan lebih lanjut?</strong>
              <span className="block">Email: kel_pulogebang@jakarta.go.id</span>
              <span className="block">Telepon: 085280471981</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
