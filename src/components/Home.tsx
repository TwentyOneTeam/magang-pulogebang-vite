import { FileText, ClipboardList, CheckCircle, Bot, ArrowRight, Users, Calendar, FileCheck, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { positionsAPI } from '../services/api';

interface Position {
  id: string;
  title: string;
  department: string;
  quota: number;
  duration: string;
  applicant_type: string;
}

export function Home() {
  // Daftar foto yang akan berganti-ganti
  const heroImages = [
    "/images/foto1.webp",
    "/images/foto2.webp",
    "/images/foto3.webp",
    "/images/foto4.webp"
  ];

  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);

  // Auto-rotate gambar setiap 5 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroImages.length
      );
    }, 5000); // 5000ms = 5 detik

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Fetch active positions from API
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoadingPositions(true);
        const response = await positionsAPI.getAll({ isActive: true });
        if (response.success && response.data) {
          // Ambil 3 posisi pertama untuk ditampilkan di homepage
          setPositions(response.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching positions:', error);
      } finally {
        setLoadingPositions(false);
      }
    };

    fetchPositions();
  }, []);

  const features = [
    {
      icon: FileText,
      title: 'Informasi Magang',
      description: 'Akses informasi lengkap tentang program magang',
      path: '/informasi-magang',
    },
    {
      icon: ClipboardList,
      title: 'Pendaftaran Online',
      description: 'Daftar magang secara online dengan mudah',
      path: '/pendaftaran',
    },
    {
      icon: CheckCircle,
      title: 'Status Pengajuan',
      description: 'Pantau status pengajuan magang Anda',
      path: '/status-pengajuan',
    },
    {
      icon: Bot,
      title: 'Chatbot AI',
      description: 'Tanyakan informasi kapan saja dengan AI',
      path: '/chatbot',
    },
  ];

  const steps = [
    {
      number: '1',
      icon: ClipboardList,
      title: 'Daftar',
      description: 'Isi formulir pendaftaran online',
    },
    {
      number: '2',
      icon: FileCheck,
      title: 'Verifikasi',
      description: 'Tim akan memverifikasi dokumen Anda',
    },
    {
      number: '3',
      icon: Users,
      title: 'Magang',
      description: 'Mulai program magang di kelurahan',
    },
    {
      number: '4',
      icon: Calendar,
      title: 'Laporan',
      description: 'Submit laporan kegiatan magang',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#004AAD] to-[#0066CC] text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold">Sistem Informasi Magang<br />Kelurahan Pulo Gebang</h1>
              <p className="text-lg md:text-xl text-gray-100">
                Platform digital untuk pendaftaran dan informasi magang yang transparan, efisien, dan mudah diakses
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-[#004AAD] hover:bg-gray-100 hover:scale-105 transition-transform shadow-lg"
                  onClick={() => navigate('/pendaftaran')}
                >
                  Daftar Sekarang
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white bg-white/10 backdrop-blur-sm hover:bg-white hover:text-[#004AAD] hover:scale-105 transition-all shadow-lg font-semibold"
                  onClick={() => navigate('/informasi-magang')}
                >
                  Lihat Panduan
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <ImageWithFallback
                src={heroImages[currentImageIndex]}
                alt="Magang di Kelurahan"
                className="rounded-lg shadow-2xl w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-[#F4F4F4]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-[#004AAD] mb-3">Fitur Utama</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kelola proses magang dengan lebih mudah melalui fitur-fitur digital kami
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg hover:scale-[1.02] hover:border-[#004AAD] transition-all duration-300 cursor-pointer bg-white border-2 border-transparent"
                  onClick={() => navigate(feature.path)}
                >
                  <div className="w-14 h-14 bg-[#004AAD]/10 rounded-lg flex items-center justify-center mb-4 transition-colors group-hover:bg-[#004AAD]/20">
                    <Icon className="w-7 h-7 text-[#004AAD]" />
                  </div>
                  <h3 className="text-[#004AAD] mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-[#004AAD] mb-3">Alur Proses Magang</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ikuti 4 langkah mudah untuk memulai program magang Anda
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Connector Line - Hidden on mobile, shown on desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-[#FFD95A]" />
                  )}
                  
                  <div className="text-center relative z-10">
                    <div className="w-20 h-20 bg-[#FFD95A] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-10 h-10 text-[#004AAD]" />
                    </div>
                    <div className="w-8 h-8 bg-[#004AAD] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                      {step.number}
                    </div>
                    <h3 className="text-[#004AAD] mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Available Positions Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-[#004AAD] mb-3">Posisi Magang Tersedia</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Lihat posisi magang yang saat ini terbuka untuk pendaftaran
            </p>
          </div>

          {loadingPositions ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004AAD] mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat posisi tersedia...</p>
            </div>
          ) : positions.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {positions.map((position) => (
                  <Card
                    key={position.id}
                    className="p-6 hover:shadow-lg transition-shadow border-2 border-gray-200 hover:border-[#004AAD]"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#004AAD]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-[#004AAD]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[#004AAD] mb-1">{position.title}</h3>
                        <p className="text-sm text-gray-600">{position.department}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Kuota:</span>
                        <span className="font-semibold">{position.quota} orang</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Durasi:</span>
                        <span className="font-semibold">{position.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Untuk:</span>
                        <span className="font-semibold capitalize">
                          {position.applicant_type === 'both' ? 'Mahasiswa & Pelajar' : position.applicant_type}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-4 bg-[#004AAD] hover:bg-[#003580]"
                      onClick={() => navigate('/pendaftaran')}
                    >
                      Daftar Posisi Ini
                    </Button>
                  </Card>
                ))}
              </div>
              
              <div className="text-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-[#004AAD] text-[#004AAD] hover:bg-[#004AAD] hover:text-white"
                  onClick={() => navigate('/informasi-magang')}
                >
                  Lihat Semua Posisi
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Belum ada posisi magang tersedia saat ini.</p>
              <p className="text-sm text-gray-500 mt-2">Silakan cek kembali nanti.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-[#FFD95A]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-[#004AAD] mb-4">Siap Memulai Magang?</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Bergabunglah dengan program magang di Kelurahan Pulo Gebang dan tingkatkan pengalaman kerja Anda
          </p>
          <Button
            size="lg"
            className="bg-[#004AAD] text-white hover:bg-[#003580] hover:scale-105 transition-transform shadow-lg"
            onClick={() => navigate('/pendaftaran')}
          >
            Daftar Sekarang
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}