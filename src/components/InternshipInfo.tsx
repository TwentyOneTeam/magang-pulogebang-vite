import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { Calendar, Users, MapPin, ArrowRight, FileText, CheckCircle, UserCheck, ClipboardCheck, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { positionsAPI } from '../services/api';
import { Alert, AlertDescription } from './ui/alert';

interface Position {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string;
  quota: number;
  duration: string;
  applicant_type: string;
  is_active: boolean;
  created_at: string;
}

export function InternshipInfo() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await positionsAPI.getAll({ isActive: true });
      
      if (response.success && response.data) {
        setPositions(response.data);
      } else {
        setError(response.message || 'Gagal memuat data posisi');
      }
    } catch (err: any) {
      console.error('Error fetching positions:', err);
      setError(err.message || 'Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const sopSteps = [
    {
      number: 1,
      icon: FileText,
      title: 'Persiapan Dokumen',
      description: 'Mahasiswa/Pelajar menyiapkan surat permohonan magang dari kampus/sekolah',
    },
    {
      number: 2,
      icon: ClipboardCheck,
      title: 'Pendaftaran Online',
      description: 'Isi formulir pendaftaran melalui sistem online dan upload dokumen persyaratan',
    },
    {
      number: 3,
      icon: UserCheck,
      title: 'Verifikasi',
      description: 'Tim admin memverifikasi dokumen dan menghubungi pelamar (2-3 hari kerja)',
    },
    {
      number: 4,
      icon: CheckCircle,
      title: 'Mulai Magang',
      description: 'Pelamar yang diterima mengikuti orientasi dan memulai program magang',
    },
  ];

  const requirements = [
    'Mahasiswa aktif dari perguruan tinggi terakreditasi atau pelajar SMA/SMK',
    'Surat pengantar dari kampus/sekolah',
    'CV terbaru',
    'Fotokopi KTP',
    'Pas foto 3x4 (2 lembar)',
    'Fotokopi Kartu Mahasiswa/Pelajar',
    'Kesediaan mengikuti program magang sesuai durasi yang ditentukan',
  ];

  const benefits = [
    'Sertifikat magang resmi dari Kelurahan Pulo Gebang',
    'Pengalaman kerja di instansi pemerintahan',
    'Bimbingan dari supervisor berpengalaman',
    'Networking dengan profesional',
    'Pembelajaran sistem administrasi pemerintahan',
    'Referensi untuk karir masa depan',
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#004AAD] to-[#0066CC] text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-white mb-4 text-[20px] font-bold">Informasi Magang</h1>
          <p className="text-lg text-gray-100 max-w-3xl">
            Temukan peluang magang yang sesuai dengan minat dan keahlian Anda di Kelurahan Pulo Gebang
          </p>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="py-12 md:py-16 bg-[#F4F4F4]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 bg-white text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[#004AAD]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-[#004AAD]" />
              </div>
              <h3 className="text-[#004AAD] mb-2">Durasi Fleksibel</h3>
              <p className="text-sm text-gray-600">1-6 bulan sesuai kebutuhan</p>
            </Card>

            <Card className="p-6 bg-white text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[#004AAD]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-[#004AAD]" />
              </div>
              <h3 className="text-[#004AAD] mb-2">Kuota Terbatas</h3>
              <p className="text-sm text-gray-600">
                {loading ? '...' : `${positions.reduce((sum, pos) => sum + pos.quota, 0)} posisi tersedia`}
              </p>
            </Card>

            <Card className="p-6 bg-white text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[#004AAD]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-[#004AAD]" />
              </div>
              <h3 className="text-[#004AAD] mb-2">Lokasi</h3>
              <p className="text-sm text-gray-600">Kelurahan Pulo Gebang, Jl. Raya Pulo Gebang No.3, RT.6/RW.3, Jakarta Timur</p>
            </Card>
          </div>

          {/* Available Positions */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-[#004AAD] mb-3">Posisi Magang Tersedia</h2>
              <p className="text-gray-600">
                Pilih posisi yang sesuai dengan minat dan keahlian Anda
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#004AAD] mb-4" />
                <p className="text-gray-600">Memuat posisi tersedia...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : positions.length === 0 ? (
              <Card className="p-12 text-center bg-white">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-700 mb-2">Belum Ada Posisi Tersedia</h3>
                <p className="text-gray-600">
                  Saat ini belum ada posisi magang yang dibuka. Silakan cek kembali nanti.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {positions.map((position) => (
                  <Card
                    key={position.id}
                    className="p-6 bg-white hover:shadow-lg hover:border-[#004AAD] transition-all border-2 border-transparent"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-[#004AAD] mb-2">{position.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">{position.department}</p>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {position.applicant_type === 'both' 
                            ? 'Mahasiswa & Pelajar' 
                            : position.applicant_type === 'mahasiswa'
                            ? 'Mahasiswa'
                            : 'Pelajar'}
                        </Badge>
                      </div>
                      <div className="w-12 h-12 bg-[#FFD95A] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-[#004AAD]" />
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {position.description}
                    </p>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Kuota:</span>
                        <span className="font-semibold">{position.quota === 0 || position.quota === null || position.quota === undefined ? 'Tak Terbatas' : `${position.quota} orang`}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Durasi:</span>
                        <span className="font-semibold">{position.duration}</span>
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="mb-4">
                      <AccordionItem value="requirements">
                        <AccordionTrigger className="text-sm">
                          Lihat Persyaratan
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {position.requirements.split('\n').map((req, idx) => (
                              <li key={idx}>{req}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <Button
                      className="w-full bg-[#004AAD] hover:bg-[#003580]"
                      onClick={() => navigate('/pendaftaran')}
                    >
                      Daftar Sekarang
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* SOP Steps */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-[#004AAD] mb-3">Alur Pendaftaran</h2>
              <p className="text-gray-600">
                Ikuti 4 langkah mudah untuk mendaftar program magang
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sopSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={index} className="p-6 bg-white text-center relative">
                    {/* Connector Line */}
                    {index < sopSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-[#FFD95A]" />
                    )}
                    
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-[#FFD95A] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-[#004AAD]" />
                      </div>
                      <div className="w-8 h-8 bg-[#004AAD] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                        {step.number}
                      </div>
                      <h3 className="text-[#004AAD] mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Requirements & Benefits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Requirements */}
            <Card className="p-6 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#004AAD]/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#004AAD]" />
                </div>
                <h3 className="text-[#004AAD]">Persyaratan Umum</h3>
              </div>
              <ul className="space-y-2">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Benefits */}
            <Card className="p-6 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#FFD95A] rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#004AAD]" />
                </div>
                <h3 className="text-[#004AAD]">Manfaat Magang</h3>
              </div>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#004AAD] mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-[#FFD95A]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-[#004AAD] mb-4">Siap Untuk Mendaftar?</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Jangan lewatkan kesempatan untuk mengembangkan skill dan pengalaman Anda di Kelurahan Pulo Gebang
          </p>
          <Button
            size="lg"
            className="bg-[#004AAD] text-white hover:bg-[#003580] hover:scale-105 transition-transform shadow-lg"
            onClick={() => navigate('/pendaftaran')}
          >
            Daftar Program Magang
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
