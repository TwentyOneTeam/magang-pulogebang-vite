import { MapPin, Phone, Mail, MessageCircle, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#004AAD] text-white mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Alamat */}
          <div>
            <h3 className="mb-4">Alamat</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
              <p className="text-sm text-gray-200">
                Jl. Raya Pulo Gebang No.3, RT.6/RW.3<br />
                Pulo Gebang, Kec. Cakung<br />
                Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13950
              </p>
            </div>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="mb-4">Kontak</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm text-gray-200">085280471981</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm text-gray-200">
                  <a href="mailto:kel_pulogebang@jakarta.go.id">kel_pulogebang@jakarta.go.id</a>
                  </p> 
              </div>
            </div>
          </div>

          {/* Media Sosial */}
          <div>
            <h3 className="mb-4">Media Sosial</h3>
            <div className="flex gap-4">
              <a
                href="https://wa.me/085280471981"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Whatsapp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/kelurahan_pulogebang"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@mediakelurahanpulogebang"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20 text-center">
        <p className="text-sm text-gray-200">
            © {new Date().getFullYear()} Kelurahan Pulo Gebang. Hak cipta dilindungi undang-undang.
          </p>
        </div>
      </div>
    </footer>
  );
}