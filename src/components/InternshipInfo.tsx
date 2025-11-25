import { Header } from './Header';
import { Footer } from './Footer';
import { Card } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { Calendar, Users, Clock, MapPin, ArrowRight, FileText, CheckCircle, UserCheck, ClipboardCheck, Briefcase } from 'lucide-react';

type Page = 'home' | 'info' | 'registration' | 'status' | 'chatbot' | 'admin';

interface InternshipInfoProps {
  onNavigate: (page: Page) => void;
}

export function InternshipInfo({ onNavigate }: InternshipInfoProps) {
  // Data lowongan magang dengan periode, divisi/peran, dan kuota
  const internshipVacancies = [
    {
      id: 1,
      period: 'Januari - Maret 2025',
      startDate: '13 Januari 2025',
      endDate: '28 Maret 2025',
      division: 'Administrasi Umum',
      role: 'Staff Administrasi',
      quota: 5,
      available: 2,
      requirements: ['Mahasiswa aktif S1/D3', 'Menguasai Microsoft Office', 'Teliti dan detail'],
      status: 'open',
    },
    {
      id: 2,
      period: 'Januari - Maret 2025',
      startDate: '13 Januari 2025',
      endDate: '28 Maret 2025',
      division: 'Teknologi Informasi',
      role: 'Web Developer',
      quota: 3,
      available: 1,
      requirements: ['Mahasiswa Teknik Informatika/SI', 'Menguasai HTML, CSS, JavaScript', 'Pengalaman framework lebih disukai'],
      status: 'open',
    },
    {
      id: 3,
      period: 'April - Juni 2025',
      startDate: '1 April 2025',
      endDate: '30 Juni 2025',
      division: 'Keuangan',
      role: 'Staff Accounting',
      quota: 4,
      available: 4,
      requirements: ['Mahasiswa Akuntansi/Manajemen', 'Paham dasar akuntansi', 'Teliti dalam perhitungan'],
      status: 'upcoming',
    },
    {
      id: 4,
      period: 'April - Juni 2025',
      startDate: '1 April 2025',
      endDate: '30 Juni 2025',
      division: 'Pelayanan Publik',
      role: 'Customer Service',
      quota: 6,
      available: 6,
      requirements: ['Mahasiswa aktif', 'Komunikatif', 'Ramah dan sabar'],
      status: 'upcoming',
    },
    {
      id: 5,
      period: 'Juli - September 2025',
      startDate: '1 Juli 2025',
      endDate: '30 September 2025',
      division: 'Kesejahteraan Sosial',
      role: 'Community Officer',
      quota: 4,
      available: 4,
      requirements: ['Mahasiswa Ilmu Sosial/Kesejahteraan', 'Empati tinggi', 'Suka berinteraksi dengan masyarakat'],
      status: 'upcoming',
    },
    {
      id: 6,
      period: 'Oktober - Desember 2025',
      startDate: '1 Oktober 2025',
      endDate: '31 Desember 2025',
      division: 'Administrasi Kependudukan',
      role: 'Data Entry Specialist',
      quota: 5,
      available: 5,
      requirements: ['Mahasiswa aktif', 'Teliti dan akurat', 'Cepat dalam mengetik'],
      status: 'upcoming',
    },
  ];

  const sopSteps = [
    {
      number: 1,
      icon: FileText,
      title: 'Persiapan Dokumen',
      description: 'Mahasiswa menyiapkan surat permohonan magang dari kampus',
    },
    {
      number: 2,
      icon: ClipboardCheck,
      title: 'Pendaftaran Online',
      description: 'Mengisi formulir pendaftaran dan upload dokumen di sistem',
    },
    {
      number: 3,
      icon: UserCheck,
      title: 'Verifikasi Admin',
      description: 'Staf kelurahan memverifikasi dokumen dan kelengkapan data',
    },
    {
      number: 4,
      icon: CheckCircle,
      title: 'Konfirmasi & Mulai Magang',
      description: 'Mahasiswa mendapat konfirmasi dan memulai kegiatan magang',
    },
  ];

  const divisions = [
    {
      name: 'Pelayanan Umum',
      description: 'Menangani pelayanan administrasi dan keperluan warga',
      icon: Users,
    },
    {
      name: 'Kesejahteraan Sosial',
      description: 'Fokus pada program bantuan sosial dan pemberdayaan masyarakat',
      icon: Users,
    },
    {
      name: 'Pemberdayaan Masyarakat',
      description: 'Mengembangkan potensi dan kemandirian masyarakat',
      icon: Users,
    },
    {
      name: 'Administrasi Kependudukan',
      description: 'Mengelola data kependudukan dan dokumen resmi',
      icon: Users,
    },
    {
      name: 'Teknologi Informasi',
      description: 'Mengelola sistem informasi dan infrastruktur digital',
      icon: Users,
    },
  ];

  const faqs = [
    {
      question: 'Berapa lama durasi program magang?',
      answer: 'Durasi program magang di Kelurahan Pulo Gebang adalah 3 bulan per periode. Namun, durasi dapat disesuaikan dengan kebutuhan kampus mahasiswa.',
    },
    {
      question: 'Apa saja persyaratan untuk mendaftar magang?',
      answer: 'Persyaratan meliputi: (1) Mahasiswa aktif dari perguruan tinggi terakreditasi, (2) Surat pengantar dari kampus, (3) CV terbaru, (4) Fotokopi KTP, (5) Pas foto 3x4.',
    },
    {
      question: 'Apakah program magang ini berbayar?',
      answer: 'Program magang ini tidak berbayar. Namun, mahasiswa akan mendapatkan sertifikat resmi setelah menyelesaikan program dan laporan akhir.',
    },
    {
      question: 'Bagaimana cara memantau status pengajuan?',
      answer: 'Anda dapat memantau status pengajuan melalui menu "Status Pengajuan" di sistem ini. Login dengan email yang Anda gunakan saat mendaftar.',
    },
    {
      question: 'Divisi apa saja yang tersedia untuk magang?',
      answer: 'Divisi yang tersedia meliputi: Pelayanan Umum, Kesejahteraan Sosial, Pemberdayaan Masyarakat, Administrasi Kependudukan, dan Teknologi Informasi.',
    },
    {
      question: 'Bagaimana jika kuota sudah penuh?',
      answer: 'Jika kuota periode tertentu sudah penuh, Anda dapat mendaftar untuk periode berikutnya. Sistem akan mengirimkan notifikasi jika ada pembukaan kuota tambahan.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header onNavigate={onNavigate} currentPage="info" />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#004AAD] to-[#0066CC] text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-white mb-4 font-bold text-[20px]">Informasi Magang</h1>
          <p className="text-lg text-gray-100 max-w-3xl">
            Temukan semua informasi yang Anda butuhkan tentang program magang di Kelurahan Pulo Gebang
          </p>
        </div>
      </section>

      {/* Lowongan Magang Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-[#004AAD] mb-2">Lowongan Magang Tersedia</h2>
            <p className="text-gray-600">Pilih periode, divisi, dan peran yang sesuai dengan minat Anda</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {internshipVacancies.map((vacancy) => (
              <Card key={vacancy.id} className="p-6 border-l-4 border-l-[#004AAD] hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[#004AAD] mb-1">{vacancy.division}</h3>
                    <p className="text-sm text-gray-600">{vacancy.role}</p>
                  </div>
                  <Badge
                    variant={vacancy.status === 'open' ? 'default' : 'secondary'}
                    className={vacancy.status === 'open' ? 'bg-green-500 hover:bg-green-600' : 'bg-[#FFD95A] text-[#004AAD] hover:bg-[#FFD95A]/90'}
                  >
                    {vacancy.status === 'open' ? 'Buka' : 'Segera'}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      <strong>Periode:</strong> {vacancy.period}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {vacancy.startDate} - {vacancy.endDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      <strong>Kuota:</strong> {vacancy.available}/{vacancy.quota} tersedia
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4 bg-[#F4F4F4] rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Ketersediaan</span>
                    <span className="text-xs">{Math.round((vacancy.available / vacancy.quota) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-[#004AAD] h-2 rounded-full transition-all"
                      style={{ width: `${(vacancy.available / vacancy.quota) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Requirements */}
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-600 mb-2">Persyaratan:</p>
                  <ul className="space-y-1">
                    {vacancy.requirements.map((req, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Tertarik dengan lowongan di atas?</p>
            <button
              onClick={() => onNavigate('registration')}
              className="inline-flex items-center gap-2 bg-[#004AAD] text-white px-6 py-3 rounded-lg hover:bg-[#003A8C] hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              Daftar Sekarang
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Divisi Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-[#004AAD] mb-2">Divisi yang Tersedia</h2>
            <p className="text-gray-600">Pilih divisi sesuai dengan minat dan keahlian Anda</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {divisions.map((division, index) => (
              <Card key={index} className="p-6 bg-white hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-t-4 border-t-[#004AAD]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#004AAD] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[#004AAD] mb-2">{division.name}</h3>
                    <p className="text-sm text-gray-600">{division.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SOP Section */}
      <section className="py-12 md:py-16 bg-[#F4F4F4]">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-[#004AAD] mb-2">Standar Operasional Prosedur (SOP)</h2>
            <p className="text-gray-600">Alur proses pendaftaran hingga pelaksanaan magang</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sopSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative">
                    {/* Arrow connector for desktop */}
                    {index < sopSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-12 left-[60%] z-0">
                        <ArrowRight className="w-6 h-6 text-[#FFD95A]" />
                      </div>
                    )}

                    <Card className="p-6 text-center bg-white relative z-10 h-full">
                      <div className="w-16 h-16 bg-[#004AAD] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="w-8 h-8 bg-[#FFD95A] text-[#004AAD] rounded-full flex items-center justify-center mx-auto mb-3">
                        {step.number}
                      </div>
                      <h3 className="text-[#004AAD] mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 bg-white">\n
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-[#004AAD] mb-2">Pertanyaan yang Sering Diajukan (FAQ)</h2>
            <p className="text-gray-600">Temukan jawaban untuk pertanyaan umum tentang program magang</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border rounded-lg px-6 bg-white shadow-sm"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="text-[#004AAD]">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
