import { useState, useRef, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Bot, Send, User } from 'lucide-react';

type Page = 'home' | 'info' | 'registration' | 'status' | 'chatbot' | 'admin';

interface ChatbotProps {
  onNavigate: (page: Page) => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function Chatbot({ onNavigate }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Halo! Saya Asisten AI Kelurahan Pulo Gebang. Saya siap membantu Anda dengan informasi tentang program magang. Ada yang bisa saya bantu?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('persyaratan') || lowerMessage.includes('syarat')) {
      return 'Persyaratan untuk mendaftar magang meliputi:\n\n1. Mahasiswa aktif dari perguruan tinggi terakreditasi\n2. Surat pengantar dari kampus\n3. CV terbaru\n4. Fotokopi KTP\n5. Pas foto 3x4\n\nApakah ada yang ingin Anda tanyakan lebih lanjut?';
    }

    if (lowerMessage.includes('durasi') || lowerMessage.includes('lama')) {
      return 'Durasi program magang di Kelurahan Pulo Gebang adalah 3 bulan per periode. Namun, durasi dapat disesuaikan dengan kebutuhan kampus Anda, mulai dari 1-6 bulan.';
    }

    if (lowerMessage.includes('jadwal') || lowerMessage.includes('kapan') || lowerMessage.includes('periode')) {
      return 'Kami membuka program magang dalam 4 periode per tahun:\n\n• Periode Januari - Maret\n• Periode April - Juni\n• Periode Juli - September\n• Periode Oktober - Desember\n\nSetiap periode memiliki kuota maksimal 15 peserta. Silakan cek halaman Informasi Magang untuk detail lebih lanjut.';
    }

    if (lowerMessage.includes('daftar') || lowerMessage.includes('mendaftar') || lowerMessage.includes('cara')) {
      return 'Untuk mendaftar magang, ikuti langkah berikut:\n\n1. Klik menu "Pendaftaran" atau tombol "Daftar Sekarang"\n2. Isi formulir dengan data lengkap\n3. Upload surat permohonan magang (PDF)\n4. Klik "Kirim Pengajuan"\n5. Tunggu konfirmasi dari tim kami (2-3 hari kerja)\n\nApakah Anda ingin langsung ke halaman pendaftaran?';
    }

    if (lowerMessage.includes('divisi') || lowerMessage.includes('bagian')) {
      return 'Divisi yang tersedia untuk magang:\n\n• Pelayanan Umum\n• Kesejahteraan Sosial\n• Pemberdayaan Masyarakat\n• Administrasi Kependudukan\n• Teknologi Informasi\n\nAnda dapat memilih divisi sesuai dengan program studi atau minat Anda.';
    }

    if (lowerMessage.includes('kontak') || lowerMessage.includes('hubungi') || lowerMessage.includes('telepon')) {
      return 'Anda dapat menghubungi kami melalui:\n\n📞 Telepon: (021) 1234-5678\n📧 Email: info@pulogebang.go.id\n📍 Alamat: Jl. Pulo Gebang No. 1, Jakarta Timur\n\nJam operasional: Senin-Jumat, 08.00-16.00 WIB';
    }

    if (lowerMessage.includes('status') || lowerMessage.includes('pengajuan')) {
      return 'Untuk melihat status pengajuan magang Anda, silakan:\n\n1. Klik menu "Status Pengajuan"\n2. Gunakan fitur pencarian dengan memasukkan nama, NPM, atau ID pengajuan\n3. Lihat detail status dan catatan dari admin\n\nStatus pengajuan meliputi: Diajukan, Diverifikasi, Diterima, atau Ditolak.';
    }

    if (lowerMessage.includes('terima kasih') || lowerMessage.includes('thanks')) {
      return 'Sama-sama! Senang bisa membantu Anda. Jika ada pertanyaan lain tentang program magang, jangan ragu untuk bertanya. Semoga proses magang Anda berjalan lancar! 😊';
    }

    if (lowerMessage.includes('halo') || lowerMessage.includes('hai') || lowerMessage.includes('hello')) {
      return 'Halo! Senang bertemu dengan Anda. Ada yang bisa saya bantu mengenai program magang di Kelurahan Pulo Gebang?';
    }

    return 'Terima kasih atas pertanyaan Anda. Saya dapat membantu dengan informasi tentang:\n\n• Persyaratan magang\n• Jadwal dan periode magang\n• Cara mendaftar\n• Divisi yang tersedia\n• Status pengajuan\n• Kontak kelurahan\n\nSilakan tanyakan hal spesifik yang ingin Anda ketahui, atau ketik kata kunci seperti "persyaratan", "jadwal", atau "cara daftar".';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const quickQuestions = [
    'Apa saja persyaratan magang?',
    'Kapan jadwal pendaftaran?',
    'Bagaimana cara mendaftar?',
    'Divisi apa saja yang tersedia?',
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onNavigate={onNavigate} currentPage="chatbot" />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#004AAD] to-[#0066CC] text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-[#004AAD]" />
            </div>
            <div>
              <h1 className="text-white mb-2">Chatbot AI</h1>
              <p className="text-lg text-gray-100">
                Asisten virtual untuk informasi magang 24/7
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section className="flex-1 py-8 md:py-12 bg-[#F4F4F4]">
        <div className="container mx-auto px-4 h-full">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            <Card className="flex-1 flex flex-col bg-white overflow-hidden" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
              {/* Chat Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'bot' ? 'bg-[#004AAD]' : 'bg-[#FFD95A]'
                      }`}
                    >
                      {message.sender === 'bot' ? (
                        <Bot className="w-6 h-6 text-white" />
                      ) : (
                        <User className="w-6 h-6 text-[#004AAD]" />
                      )}
                    </div>
                    <div
                      className={`flex-1 max-w-[80%] md:max-w-[70%] ${
                        message.sender === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block p-4 rounded-lg ${
                          message.sender === 'bot'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-[#004AAD] text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#004AAD] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Questions */}
              {messages.length === 1 && (
                <div className="px-4 md:px-6 pb-4">
                  <p className="text-xs text-gray-600 mb-3">Pertanyaan cepat:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-left justify-start h-auto py-2 text-xs hover:bg-[#004AAD] hover:text-white hover:border-[#004AAD] transition-all"
                        onClick={() => handleQuickQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t p-4 md:p-6 bg-white">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tanyakan apa saja tentang magang di Kelurahan Pulo Gebang..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-[#004AAD] hover:bg-[#003580] hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    size="icon"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}