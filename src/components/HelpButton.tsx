import { useState } from 'react';
import { HelpCircle, X, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

type Page = 'home' | 'info' | 'registration' | 'status' | 'chatbot' | 'admin';

interface HelpButtonProps {
  onNavigate: (page: Page) => void;
}

export function HelpButton({ onNavigate }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const helpItems = [
    {
      title: 'Cara Mendaftar Magang',
      description: 'Pelajari langkah-langkah untuk mendaftar program magang',
      action: () => {
        setIsOpen(false);
        onNavigate('info');
      },
    },
    {
      title: 'Tanya Chatbot AI',
      description: 'Dapatkan jawaban cepat dari asisten AI kami',
      action: () => {
        setIsOpen(false);
        onNavigate('chatbot');
      },
    },
    {
      title: 'Cek Status Pengajuan',
      description: 'Pantau status pengajuan magang Anda',
      action: () => {
        setIsOpen(false);
        onNavigate('status');
      },
    },
    {
      title: 'Informasi Lowongan',
      description: 'Lihat lowongan magang yang tersedia',
      action: () => {
        setIsOpen(false);
        onNavigate('info');
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#004AAD] flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              Bantuan & Panduan
            </DialogTitle>
            <DialogDescription>
              Pilih topik bantuan yang Anda butuhkan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {helpItems.map((item, index) => (
              <Card
                key={index}
                className="p-4 cursor-pointer hover:shadow-md hover:border-[#004AAD] transition-all duration-200 border-2 hover:scale-[1.02]"
                onClick={item.action}
              >
                <h4 className="text-[#004AAD] mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-[#004AAD]">
              <strong>Butuh bantuan lebih lanjut?</strong><br />
              Hubungi kami di: <span className="underline">info@pulogebang.go.id</span><br />
              Telepon: <span className="underline">(021) 1234-5678</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
