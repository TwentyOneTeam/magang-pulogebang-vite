import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Upload, CheckCircle, AlertCircle, GraduationCap, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { LoginSheet } from './LoginSheet';
import { useAuth } from './AuthContext';

type Page = 'home' | 'info' | 'registration' | 'status' | 'chatbot' | 'admin';
type ApplicantType = 'mahasiswa' | 'pelajar';

interface RegistrationProps {
  onNavigate: (page: Page) => void;
}

export function Registration({ onNavigate }: RegistrationProps) {
  const { isAuthenticated } = useAuth();
  const [applicantType, setApplicantType] = useState<ApplicantType>('mahasiswa');
  const [formData, setFormData] = useState({
    fullName: '',
    npm: '', // NPM/NIM for mahasiswa, NIS for pelajar
    institution: '', // University for mahasiswa, School for pelajar
    schoolType: '', // SMA/SMK for pelajar
    major: '', // Program Studi for mahasiswa, Jurusan/Kelas for pelajar
    grade: '', // Kelas for pelajar
    email: '',
    phone: '',
    startDate: '',
    division: '',
    duration: '',
    address: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const handleApplicantTypeChange = (type: ApplicantType) => {
    setApplicantType(type);
    // Reset form when switching types
    setFormData({
      fullName: '',
      npm: '',
      institution: '',
      schoolType: '',
      major: '',
      grade: '',
      email: '',
      phone: '',
      startDate: '',
      division: '',
      duration: '',
      address: '',
    });
    setFile(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    // Simulate submission
    setSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        fullName: '',
        npm: '',
        institution: '',
        schoolType: '',
        major: '',
        grade: '',
        email: '',
        phone: '',
        startDate: '',
        division: '',
        duration: '',
        address: '',
      });
      setFile(null);
    }, 3000);
  };

  const handleLoginSuccess = () => {
    setLoginDialogOpen(false);
    // After successful login, we can auto-submit the form
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        fullName: '',
        npm: '',
        institution: '',
        schoolType: '',
        major: '',
        grade: '',
        email: '',
        phone: '',
        startDate: '',
        division: '',
        duration: '',
        address: '',
      });
      setFile(null);
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onNavigate={onNavigate} currentPage="registration" />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#004AAD] to-[#0066CC] text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-white mb-4 font-bold text-[20px]">Pendaftaran Magang</h1>
          <p className="text-lg text-gray-100 max-w-3xl">
            Lengkapi formulir di bawah ini untuk mendaftar program magang di Kelurahan Pulo Gebang
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 md:py-16 bg-[#F4F4F4] relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto relative">
            {submitted ? (
              <Alert className="bg-green-50 border-green-200 mb-6">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800">
                  Pengajuan magang berhasil dikirim! Tim kami akan menghubungi Anda dalam 2-3 hari kerja.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-blue-50 border-blue-200 mb-6">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Pastikan semua data yang Anda masukkan sudah benar. Dokumen yang diupload harus dalam format PDF.
                </AlertDescription>
              </Alert>
            )}

            <Card className="p-6 md:p-8 bg-white">
              {/* Applicant Type Toggle */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-4 p-2 bg-[#F4F4F4] rounded-lg">
                  <Button
                    type="button"
                    onClick={() => handleApplicantTypeChange('mahasiswa')}
                    className={`flex-1 flex items-center justify-center gap-2 transition-all ${
                      applicantType === 'mahasiswa'
                        ? 'bg-[#004AAD] text-white hover:bg-[#003580] shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                    Mahasiswa
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleApplicantTypeChange('pelajar')}
                    className={`flex-1 flex items-center justify-center gap-2 transition-all ${
                      applicantType === 'pelajar'
                        ? 'bg-[#004AAD] text-white hover:bg-[#003580] shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                    Pelajar
                  </Button>
                </div>
                <p className="text-center text-sm text-gray-600 mt-3">
                  {applicantType === 'mahasiswa' 
                    ? 'Untuk mahasiswa dari perguruan tinggi/universitas'
                    : 'Untuk pelajar SMA/SMK yang ingin magang'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Data Pribadi */}
                <div>
                  <h3 className="text-[#004AAD] mb-4">Data Pribadi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nama Lengkap *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="npm">
                        {applicantType === 'mahasiswa' ? 'NPM / NIM *' : 'NIS *'}
                      </Label>
                      <Input
                        id="npm"
                        name="npm"
                        value={formData.npm}
                        onChange={handleInputChange}
                        placeholder={applicantType === 'mahasiswa' ? 'Masukkan NPM/NIM' : 'Masukkan NIS'}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">No. Telepon *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="08xxxxxxxxxx"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="address">Alamat Lengkap *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Masukkan alamat lengkap"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                {/* Data Akademik - Conditional based on applicant type */}
                <div>
                  <h3 className="text-[#004AAD] mb-4">Data Akademik</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {applicantType === 'mahasiswa' ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="institution">Institusi / Universitas *</Label>
                          <Input
                            id="institution"
                            name="institution"
                            value={formData.institution}
                            onChange={handleInputChange}
                            placeholder="Nama universitas"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="major">Program Studi / Jurusan *</Label>
                          <Input
                            id="major"
                            name="major"
                            value={formData.major}
                            onChange={handleInputChange}
                            placeholder="Nama program studi"
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="institution">Nama Sekolah *</Label>
                          <Input
                            id="institution"
                            name="institution"
                            value={formData.institution}
                            onChange={handleInputChange}
                            placeholder="Nama sekolah"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="schoolType">Jenis Sekolah *</Label>
                          <Select
                            value={formData.schoolType}
                            onValueChange={(value) => handleSelectChange('schoolType', value)}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis sekolah" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sma">SMA</SelectItem>
                              <SelectItem value="smk">SMK</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="major">Jurusan *</Label>
                          <Input
                            id="major"
                            name="major"
                            value={formData.major}
                            onChange={handleInputChange}
                            placeholder="Nama jurusan"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="grade">Kelas *</Label>
                          <Select
                            value={formData.grade}
                            onValueChange={(value) => handleSelectChange('grade', value)}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kelas" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">Kelas 10</SelectItem>
                              <SelectItem value="11">Kelas 11</SelectItem>
                              <SelectItem value="12">Kelas 12</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Data Magang */}
                <div>
                  <h3 className="text-[#004AAD] mb-4">Data Magang</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Tanggal Mulai Magang *</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Durasi Magang *</Label>
                      <Select
                        value={formData.duration}
                        onValueChange={(value) => handleSelectChange('duration', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih durasi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Bulan</SelectItem>
                          <SelectItem value="2">2 Bulan</SelectItem>
                          <SelectItem value="3">3 Bulan</SelectItem>
                          <SelectItem value="4">4 Bulan</SelectItem>
                          <SelectItem value="6">6 Bulan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="division">Divisi yang Diminati *</Label>
                      <Select
                        value={formData.division}
                        onValueChange={(value) => handleSelectChange('division', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih divisi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pelayanan">Pelayanan Umum</SelectItem>
                          <SelectItem value="kessos">Kesejahteraan Sosial</SelectItem>
                          <SelectItem value="pemberdayaan">Pemberdayaan Masyarakat</SelectItem>
                          <SelectItem value="kependudukan">Administrasi Kependudukan</SelectItem>
                          <SelectItem value="it">Teknologi Informasi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Upload Dokumen */}
                <div>
                  <h3 className="text-[#004AAD] mb-4">Dokumen Pendukung</h3>
                  <div className="space-y-2">
                    <Label htmlFor="file">Surat Permohonan Magang (PDF) *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#004AAD] hover:bg-blue-50 transition-all cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3 group-hover:text-[#004AAD] transition-colors" />
                      <p className="text-sm text-gray-600 mb-2">
                        {file ? file.name : 'Klik untuk upload atau drag & drop'}
                      </p>
                      <p className="text-xs text-gray-500">Format: PDF, Maksimal 5MB</p>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-3 hover:bg-[#004AAD] hover:text-white hover:border-[#004AAD] transition-all"
                        onClick={() => document.getElementById('file')?.click()}
                      >
                        Pilih File
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-[#004AAD] hover:bg-[#003580] hover:scale-105 active:scale-95 transition-transform text-white shadow-lg"
                  >
                    <CheckCircle className="mr-2 w-5 h-5" />
                    Kirim Pengajuan
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Dengan mengirim formulir ini, Anda menyetujui syarat dan ketentuan yang berlaku
                  </p>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#004AAD]">Login Diperlukan</DialogTitle>
            <DialogDescription>
              Maaf, Anda harus login untuk mengirimkan form pendaftaran magang. Silakan login terlebih dahulu.
            </DialogDescription>
          </DialogHeader>
          <LoginSheet onSuccess={handleLoginSuccess} onClose={() => setLoginDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}