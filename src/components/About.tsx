import { Header } from './Header';
import { Footer } from './Footer';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Github, Linkedin, User, ArrowRight } from 'lucide-react';

interface Creator {
  id: string;
  name: string;
  university: string;
  role: string;
  image?: string;
  github?: string;
  linkedin?: string;
  email?: string;
}

export function About() {
  // Data pembuat website - silakan edit sesuai data asli
  const creators: Creator[] = [
    {
      id: '1',
      name: 'Sandy Yoga Prakasa Holley',
      university: 'Universitas Gunadarma',
      role: 'Project Manager',
      image: '/images/sandy.webp',
      github: 'https://github.com/Sandy-YP-Holley',
      linkedin: 'https://www.linkedin.com/in/sandyypholley',
      email: 'email@example.com',
    },
    {
      id: '2',
      name: 'Muhammad Farahat',
      university: 'Universitas Gunadarma',
      role: 'Programmer, Software Analyst, dan Tester',
      image: '/images/farahat.webp',
      github: 'https://github.com/iseeface',
      linkedin: 'https://www.linkedin.com/in/muhammad-farahat-a3622825b/',
      email: 'email2@example.com',
    },
    {
      id: '3',
      name: 'Nickson Winil',
      university: 'Universitas Gunadarma',
      role: 'Software Designer dan Technical Writer',
      image: '/images/nickson.webp',
      github: 'https://github.com/Sonnick33',
      linkedin: 'https://www.linkedin.com/in/nickson-winil',
      email: 'email2@example.com',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section - Simplified */}
      <section className="bg-gradient-to-br from-[#004AAD] to-[#0066CC] text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-white mb-3 text-[32px] md:text-[40px] font-bold">Tentang Kami</h1>
          <p className="text-gray-100 text-lg md:text-xl max-w-2xl mx-auto">
            Kenali tim yang membangun Sistem Informasi Magang Kelurahan Pulo Gebang
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-20 bg-[#F4F4F4] flex-1">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* About Project Section */}
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left - Text */}
              <div>
                <h2 className="text-[#004AAD] text-3xl md:text-4xl font-bold mb-6">Tentang Proyek Ini</h2>
                <div className="space-y-4 text-gray-700">
                  <p className="leading-relaxed text-base md:text-lg text-justify">
                    Website ini adalah sistem informasi magang yang kami bangun sebagai tugas mata kuliah <span className="font-semibold text-[#004AAD]">Pengelolaan Proyek Perangkat Lunak</span> pada semester 7.
                  </p>
                  <p className="leading-relaxed text-base md:text-lg text-justify">
                    Dirancang untuk memudahkan calon peserta magang mendapatkan informasi, melakukan pendaftaran, dan memantau status pengajuan mereka dengan mudah dan real-time.
                  </p>
                  <p className="leading-relaxed text-base md:text-lg text-justify">
                    Proyek ini mengintegrasikan teknologi modern termasuk AI chatbot untuk memberikan pengalaman pengguna yang optimal.
                  </p>
                </div>
              </div>

              {/* Right - Stats/Features */}
              <div className="space-y-4">
                <Card className="p-6 bg-white border-l-4 border-l-[#004AAD] hover:shadow-lg transition-shadow">
                  <h3 className="text-[#004AAD] font-bold text-2xl mb-3">📚 Pendidikan</h3>
                  <p className="text-gray-600 text-base font-medium">Universitas Gunadarma</p>
                  <p className="text-gray-500 text-sm mt-2">Semester 7</p>
                </Card>
                <Card className="p-6 bg-white border-l-4 border-l-[#0066CC] hover:shadow-lg transition-shadow">
                  <h3 className="text-[#0066CC] font-bold text-2xl mb-3">🎓 Mata Kuliah</h3>
                  <p className="text-gray-600 text-base font-medium">Pengelolaan Proyek Perangkat Lunak</p>
                </Card>
                <Card className="p-6 bg-white border-l-4 border-l-[#FFD95A] hover:shadow-lg transition-shadow">
                  <h3 className="text-[#004AAD] font-bold text-2xl mb-3">🚀 Teknologi</h3>
                  <p className="text-gray-600 text-base font-medium">React, TypeScript, Node.js, PostgreSQL</p>
                </Card>
              </div>
            </div>
          </div>

          {/* Tim Pengembang */}
          <div className="mb-8">
            <h2 className="text-[#004AAD] text-3xl md:text-4xl font-bold mb-12 text-center">Tim Pengembang</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {creators.map((creator) => (
                <div key={creator.id} className="group">
                  <Card className="p-0 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    {/* Avatar Section */}
                    <div className="relative bg-gradient-to-br from-[#004AAD] to-[#0066CC] h-56 flex items-center justify-center overflow-hidden">
                      <div className="w-28 h-28 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        {creator.image ? (
                          <img 
                            src={creator.image} 
                            alt={creator.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <User className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-[#004AAD] text-lg font-bold mb-1 text-center">{creator.name}</h3>
                      <p className="text-gray-600 font-medium text-sm mb-3 text-center">{creator.role}</p>
                      <p className="text-gray-500 text-xs mb-4 flex-1 text-center">
                        📚 {creator.university}
                      </p>

                      {/* Social Links */}
                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        {creator.github && (
                          <a
                            href={creator.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="GitHub"
                            className="flex-1 flex items-center justify-center h-9 rounded-lg bg-gray-100 hover:bg-[#004AAD] hover:text-white text-gray-600 transition-colors"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {creator.linkedin && (
                          <a
                            href={creator.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="LinkedIn"
                            className="flex-1 flex items-center justify-center h-9 rounded-lg bg-gray-100 hover:bg-[#004AAD] hover:text-white text-gray-600 transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16">
            <Card className="relative overflow-hidden p-0 bg-white">
              <div className="absolute inset-0 bg-gradient-to-br from-[#004AAD] to-[#0066CC] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-8 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-[#004AAD] mb-3">Siap Untuk Magang?</h2>
                <p className="text-gray-600 text-base md:text-lg mb-6">
                  Bergabunglah dengan program magang Kelurahan Pulo Gebang dan kembangkan karir Anda bersama kami
                </p>
                <a href="/pendaftaran">
                  <Button className="bg-[#004AAD] hover:bg-[#003580] text-white gap-2 px-8 py-6 text-base">
                    Daftar Sekarang
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </section>
            
        <Footer />
    </div>
  );
}
