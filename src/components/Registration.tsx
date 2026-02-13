import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Upload, CheckCircle, AlertCircle, GraduationCap, BookOpen, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { LoginSheet } from './LoginSheet';
import { useAuth } from './AuthContext';
import { applicationsAPI, positionsAPI } from '../services/api';
import { DatePicker } from './DatePicker';

type ApplicantType = 'mahasiswa' | 'pelajar';

interface Position {
  id: string;
  title: string;
  department: string;
  applicant_type: string;
  duration: string;
}

export function Registration() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [applicantType, setApplicantType] = useState<ApplicantType>('mahasiswa');
  const [formData, setFormData] = useState({
    nik: '',
    fullName: '',
    npm: '', // NPM/NIM for mahasiswa, NIS for pelajar
    institution: '', // University for mahasiswa, School for pelajar
    schoolType: '', // SMA/SMK for pelajar
    major: '', // Program Studi for mahasiswa, Jurusan/Kelas for pelajar
    semester: '', // Semester for mahasiswa only
    grade: '', // Kelas for pelajar
    email: '',
    phone: '',
    birthDate: '', // Tanggal lahir
    gender: '', // Jenis kelamin (L/P)
    startDate: '',
    positionId: '',
    address: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [isAutofilled, setIsAutofilled] = useState(false);
  const [activeApplicationsCount, setActiveApplicationsCount] = useState(0);
  const MAX_ACTIVE_SLOTS = 3;

  // State untuk file uploads - terpisah per jenis dokumen
  const [fileUploads, setFileUploads] = useState({
    coverLetterFile: null as File | null,
    ktpFile: null as File | null,
    kkFile: null as File | null,
    photoFile: null as File | null,
    cvFile: null as File | null,
    suratPengantarFile: null as File | null,
  });

  // Fetch available positions
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoadingPositions(true);
        const response = await positionsAPI.getAll({ isActive: true });
        if (response.success && response.data) {
          setPositions(response.data);
        }
      } catch (error) {
        console.error('Error fetching positions:', error);
      } finally {
        setLoadingPositions(false);
      }
    };

    fetchPositions();
  }, []);

  // Pre-fill email from user profile if logged in
  useEffect(() => {
    if (user && user.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  // Auto-scroll to alert if max active applications reached
  useEffect(() => {
    if (activeApplicationsCount >= MAX_ACTIVE_SLOTS) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeApplicationsCount]);

  // Fetch previous applications to autofill form data
  useEffect(() => {
    const autofillFromPreviousApplication = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const response = await applicationsAPI.getAll();
        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          // Filter applications: if admin, only show admin's own applications; if user, show their applications
          let userApplications = response.data;
          
          // If user is admin, only autofill from admin's own applications
          // (don't autofill from other users' applications)
          if (user.role === 'admin') {
            userApplications = response.data.filter((app: any) => app.userId === user.id);
          }

          if (userApplications.length === 0) {
            // No applications to autofill for this user/admin
            return;
          }

          // Count active applications (status: pending, review, accepted)
          // pending = Diajukan, review = Sedang ditinjau, accepted = Diterima
          const activeApps = userApplications.filter((app: any) => 
            ['pending', 'review', 'accepted'].includes(app.status)
          );
          setActiveApplicationsCount(activeApps.length);
          console.log(`Active applications: ${activeApps.length}/${MAX_ACTIVE_SLOTS}`);

          // Get the most recent application
          const sortedApps = userApplications.sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          const lastApp = sortedApps[0];

          // Determine applicant type from previous application
          const prevApplicantType = lastApp.applicant_type as ApplicantType;
          setApplicantType(prevApplicantType);

          // Map the data from previous application to form fields
          const autofillData = {
            nik: lastApp.nik || '',
            fullName: lastApp.full_name || '',
            npm: lastApp.student_id || '', // npm/nis
            institution: lastApp.institution || '',
            schoolType: lastApp.school_type || '',
            major: lastApp.major || lastApp.studentMajor || '',
            grade: lastApp.grade || '',
            email: lastApp.email || user.email || '',
            phone: lastApp.phone || '',
            birthDate: lastApp.birth_date ? lastApp.birth_date.split('T')[0] : '',
            gender: lastApp.gender || '',
            address: lastApp.address || '',
            semester: lastApp.semester || '',
            startDate: '', // Don't autofill start date - it's a future date
            positionId: '', // Don't autofill position - user might want different position
          };

          setFormData(autofillData);
          setIsAutofilled(true);
          console.log('Form autofilled from previous application');
        }
      } catch (error) {
        console.error('Error autofilling form from previous application:', error);
        // Continue without autofill if there's an error
      }
    };

    autofillFromPreviousApplication();
  }, [isAuthenticated, user]);

  const handleApplicantTypeChange = (type: ApplicantType) => {
    setApplicantType(type);
    // Reset form when switching types
    setFormData({
      nik: '',
      fullName: '',
      npm: '',
      institution: '',
      schoolType: '',
      major: '',
      grade: '',
      email: user?.email || '',
      phone: '',
      birthDate: '',
      gender: '',
      startDate: '',
      positionId: '',
      address: '',
      semester: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle numeric input - hanya menerima angka
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, [fieldName]: numericValue }));
  };

  // Validasi format input khusus
  const validateFormData = (): string | null => {
    // NIK validation - harus tepat 16 angka
    if (formData.nik && !/^\d{16}$/.test(formData.nik)) {
      return 'NIK harus tepat 16 angka';
    }

    // NPM/NIM/NIS validation - hanya angka
    if (formData.npm && !/^\d+$/.test(formData.npm)) {
      return applicantType === 'mahasiswa' 
        ? 'NPM/NIM harus berisi angka saja' 
        : 'NIS harus berisi angka saja';
    }

    // Semester validation for mahasiswa
    if (applicantType === 'mahasiswa' && !formData.semester) {
      return 'Semester harus dipilih';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Format email tidak valid';
    }

    // Phone validation - minimal 10 digit, maksimal 13 digit, hanya angka
    if (formData.phone && !/^\d{10,13}$/.test(formData.phone)) {
      return 'No. Telepon harus berisi angka dan minimal 10 digit';
    }

    // Birth date validation
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 15) {
        return 'Usia minimal 15 tahun';
      }
      
      if (birthDate > today) {
        return 'Tanggal lahir tidak valid';
      }
    }

    // Start date validation - tidak boleh tanggal lampau
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        return 'Tanggal mulai tidak boleh tanggal yang lalu';
      }
    }

    return null;
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle single file upload untuk setiap field
  const handleDocumentFileChange = (fieldName: keyof typeof fileUploads, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('File harus dalam format PDF, JPG, PNG, DOC, atau DOCX');
        return;
      }
      
      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        return;
      }
      
      setFileUploads(prev => ({ ...prev, [fieldName]: selectedFile }));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    // Check if user has reached maximum active applications
    if (activeApplicationsCount >= MAX_ACTIVE_SLOTS) {
      setError(`Anda sudah memiliki ${MAX_ACTIVE_SLOTS} pendaftaran yang sedang aktif. Tunggu hingga ada yang selesai atau ditolak untuk mendaftar lagi.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate form data format
    const validationError = validateFormData();
    if (validationError) {
      setError(validationError);
      
      // Auto-scroll to first error field
      const fieldMap: { [key: string]: string } = {
        'NIK': 'nik',
        'semester': 'semester',
        'NPM': 'npm',
        'NIS': 'npm',
        'email': 'email',
        'No. Telepon': 'phone',
        'Tanggal lahir': 'birthDate',
        'Tanggal mulai': 'startDate'
      };
      
      for (const [key, fieldId] of Object.entries(fieldMap)) {
        if (validationError.includes(key) || validationError.toLowerCase().includes(key.toLowerCase())) {
          const element = document.getElementById(fieldId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
            break;
          }
        }
      }
      return;
    }

    // Validate all required files
    if (!fileUploads.coverLetterFile) {
      setError('Surat Permohonan Magang harus diupload');
      return;
    }
    if (!fileUploads.ktpFile) {
      setError('KTP harus diupload');
      return;
    }
    if (!fileUploads.kkFile) {
      setError('KK (Kartu Keluarga) harus diupload');
      return;
    }
    if (!fileUploads.photoFile) {
      setError('Pas Foto harus diupload');
      return;
    }
    if (!fileUploads.cvFile) {
      setError('CV/Resume harus diupload');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get selected position to extract duration
      const selectedPosition = positions.find(pos => pos.id === formData.positionId);
      if (!selectedPosition) {
        setError('Posisi tidak valid');
        setLoading(false);
        return;
      }

      // Calculate endDate from startDate + position duration
      // Extract first number from duration string (e.g., "1-3 bulan" -> 1, or "3 bulan" -> 3)
      const durationMatch = selectedPosition.duration?.match(/(\d+)/);
      const durationMonths = durationMatch ? parseInt(durationMatch[1]) : 1; // Default to 1 month
      
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);
      const endDateString = endDate.toISOString().split('T')[0];

      // Prepare FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('applicantType', applicantType);
      formDataToSend.append('nik', formData.nik);
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('birthDate', formData.birthDate);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('positionId', formData.positionId);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', endDateString);
      
      // Add all required document files
      if (fileUploads.coverLetterFile) {
        formDataToSend.append('coverLetterFile', fileUploads.coverLetterFile);
      }
      if (fileUploads.ktpFile) {
        formDataToSend.append('ktpFile', fileUploads.ktpFile);
      }
      if (fileUploads.kkFile) {
        formDataToSend.append('kkFile', fileUploads.kkFile);
      }
      if (fileUploads.photoFile) {
        formDataToSend.append('photoFile', fileUploads.photoFile);
      }
      if (fileUploads.cvFile) {
        formDataToSend.append('cvFile', fileUploads.cvFile);
      }
      // Add optional surat pengantar
      if (fileUploads.suratPengantarFile) {
        formDataToSend.append('suratPengantarFile', fileUploads.suratPengantarFile);
      }
      
      // Add type-specific fields
      if (applicantType === 'mahasiswa') {
        formDataToSend.append('npm', formData.npm);
        formDataToSend.append('university', formData.institution);
        formDataToSend.append('major', formData.major);
        formDataToSend.append('semester', formData.semester);
      } else if (applicantType === 'pelajar') {
        formDataToSend.append('nis', formData.npm); // NIS disimpan di field npm
        formDataToSend.append('schoolName', formData.institution);
        formDataToSend.append('schoolType', formData.schoolType);
        formDataToSend.append('grade', formData.grade);
        if (formData.major) {
          formDataToSend.append('studentMajor', formData.major);
        }
      }

      // Submit application
      const response = await applicationsAPI.create(formDataToSend);

      if (response.success) {
        setSubmitted(true);
        setError(null);
        
        // Reset form after 3 seconds and redirect to status page
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            nik: '',
            fullName: '',
            npm: '',
            institution: '',
            schoolType: '',
            major: '',
            grade: '',
            email: user?.email || '',
            phone: '',
            birthDate: '',
            gender: '',
            startDate: '',
            positionId: '',
            address: '',
            semester: '',
          });
          setFileUploads({
            coverLetterFile: null,
            ktpFile: null,
            kkFile: null,
            photoFile: null,
            cvFile: null,
            suratPengantarFile: null,
          });
          navigate('/status-pengajuan');
        }, 3000);
      } else {
        const errorMessage = response.message || response.error || 'Gagal mengirim pengajuan';
        setError(typeof errorMessage === 'string' ? errorMessage : 'Gagal mengirim pengajuan');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      const errorMsg = err.message || 'Terjadi kesalahan saat mengirim pengajuan';
      setError(typeof errorMsg === 'string' ? errorMsg : 'Terjadi kesalahan saat mengirim pengajuan');
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setLoginDialogOpen(false);
  };

  // Filter positions based on applicant type
  const filteredPositions = positions.filter(pos => 
    pos.applicant_type === 'both' || pos.applicant_type === applicantType
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

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
                  Anda akan diarahkan ke halaman status...
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {isAutofilled && (
                  <Alert className="bg-purple-50 border-purple-200 mb-6">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                    <AlertDescription className="text-purple-800">
                      ✨ Data pribadi dan akademik Anda telah secara otomatis diisi berdasarkan pendaftaran sebelumnya. 
                      Anda dapat mengubah data jika diperlukan.
                    </AlertDescription>
                  </Alert>
                )}

                {activeApplicationsCount >= MAX_ACTIVE_SLOTS && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-5 w-5" />
                    <AlertDescription>
                      ⛔ Anda sudah mencapai batas maksimal pendaftaran ({MAX_ACTIVE_SLOTS} slot aktif). 
                      Tunggu hingga ada pendaftaran yang selesai atau ditolak untuk mengajukan pendaftaran baru.
                    </AlertDescription>
                  </Alert>
                )}

                {activeApplicationsCount > 0 && activeApplicationsCount < MAX_ACTIVE_SLOTS && (
                  <Alert className="bg-blue-50 border-blue-200 mb-6">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      📊 Slot pendaftaran aktif: {activeApplicationsCount}/{MAX_ACTIVE_SLOTS}
                    </AlertDescription>
                  </Alert>
                )}

                <Alert className="bg-blue-50 border-blue-200 mb-6">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Pastikan semua data yang Anda masukkan sudah benar. Dokumen yang diupload harus dalam format PDF (Max 5MB).
                  </AlertDescription>
                </Alert>

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-5 w-5" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </>
            )}

            <Card className="p-6 md:p-8 bg-white">
              {/* Applicant Type Toggle */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-4 p-2 bg-[#F4F4F4] rounded-lg">
                  <Button
                    type="button"
                    onClick={() => handleApplicantTypeChange('mahasiswa')}
                    disabled={loading}
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
                    disabled={loading}
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
                      <Label htmlFor="nik">NIK (Nomor Induk Kependudukan) *</Label>
                      <Input
                        id="nik"
                        name="nik"
                        value={formData.nik}
                        onChange={(e) => handleNumericInput(e, 'nik')}
                        placeholder="Masukkan 16 digit NIK"
                        disabled={loading}
                        required
                        maxLength={16}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nama Lengkap *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama lengkap"
                        disabled={loading}
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
                        onChange={(e) => handleNumericInput(e, 'npm')}
                        placeholder={applicantType === 'mahasiswa' ? 'Masukkan NPM/NIM' : 'Masukkan NIS'}
                        disabled={loading}
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
                        disabled={loading}
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
                        onChange={(e) => handleNumericInput(e, 'phone')}
                        placeholder="08xxxxxxxxxx"
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tanggal Lahir *</Label>
                      <DatePicker
                        value={formData.birthDate}
                        onChange={(date) => setFormData(prev => ({ ...prev, birthDate: date }))}
                        placeholder="Pilih tanggal lahir"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Jenis Kelamin *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleSelectChange('gender', value)}
                        disabled={loading}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Laki-laki</SelectItem>
                          <SelectItem value="P">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
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
                      disabled={loading}
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
                            disabled={loading}
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
                            disabled={loading}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="semester">Semester *</Label>
                          <Select
                            value={formData.semester}
                            onValueChange={(value) => handleSelectChange('semester', value)}
                            disabled={loading}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih semester" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Semester 1</SelectItem>
                              <SelectItem value="2">Semester 2</SelectItem>
                              <SelectItem value="3">Semester 3</SelectItem>
                              <SelectItem value="4">Semester 4</SelectItem>
                              <SelectItem value="5">Semester 5</SelectItem>
                              <SelectItem value="6">Semester 6</SelectItem>
                              <SelectItem value="7">Semester 7</SelectItem>
                              <SelectItem value="8">Semester 8</SelectItem>
                            </SelectContent>
                          </Select>
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
                            disabled={loading}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="schoolType">Jenis Sekolah *</Label>
                          <Select
                            value={formData.schoolType}
                            onValueChange={(value) => handleSelectChange('schoolType', value)}
                            disabled={loading}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis sekolah" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SMA">SMA</SelectItem>
                              <SelectItem value="SMK">SMK</SelectItem>
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
                            disabled={loading}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="grade">Kelas *</Label>
                          <Select
                            value={formData.grade}
                            onValueChange={(value) => handleSelectChange('grade', value)}
                            disabled={loading}
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
                      <Label>Tanggal Mulai Magang *</Label>
                      <DatePicker
                        value={formData.startDate}
                        onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                        placeholder="Pilih tanggal mulai"
                        disabled={loading}
                        minDate={new Date()}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="positionId">Posisi yang Diminati *</Label>
                      {loadingPositions ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-[#004AAD]" />
                          <span className="ml-2 text-sm text-gray-600">Memuat posisi...</span>
                        </div>
                      ) : filteredPositions.length > 0 ? (
                        <Select
                          value={formData.positionId}
                          onValueChange={(value) => handleSelectChange('positionId', value)}
                          disabled={loading}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih posisi" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredPositions.map((position) => (
                              <SelectItem key={position.id} value={position.id}>
                                {position.title} - {position.department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Belum ada posisi tersedia untuk {applicantType}. Silakan cek kembali nanti.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload Dokumen */}
                <div>
                  <h3 className="text-[#004AAD] mb-4">Dokumen Pendukung</h3>
                  
                  {/* Reminder List Dokumen */}
                  <Alert className="bg-yellow-50 border-yellow-200 mb-6">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <p className="font-semibold mb-2">📋 Upload dokumen berikut untuk melanjutkan:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>✓ Surat Permohonan Magang</li>
                        <li>✓ Kartu Tanda Penduduk (KTP)</li>
                        <li>✓ Kartu Keluarga (KK)</li>
                        <li>✓ Pas Foto (terbaru)</li>
                        <li>✓ Curriculum Vitae (CV) / Resume</li>
                        <li>○ Surat Pengantar dari {applicantType === 'mahasiswa' ? 'Universitas' : 'Sekolah'} (opsional)</li>
                      </ul>
                      <p className="mt-2 text-xs">Format: PDF, JPG, PNG, DOC, DOCX • Maksimal 5MB per file</p>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {/* 1. Surat Permohonan Magang */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <span>Surat Permohonan Magang</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#004AAD] hover:bg-blue-50 transition-all cursor-pointer">
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          {fileUploads.coverLetterFile ? (
                            <span className="text-green-600 font-semibold">✓ {fileUploads.coverLetterFile.name}</span>
                          ) : (
                            'Klik atau drag file'
                          )}
                        </p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG, DOC, DOCX • Max 5MB</p>
                        <Input
                          id="coverLetterFile"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => handleDocumentFileChange('coverLetterFile', e)}
                          className="hidden"
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3 hover:bg-[#004AAD] hover:text-white hover:border-[#004AAD]"
                          onClick={() => document.getElementById('coverLetterFile')?.click()}
                          disabled={loading}
                        >
                          Pilih File
                        </Button>
                      </div>
                    </div>

                    {/* 2. KTP */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <span>Kartu Tanda Penduduk (KTP)</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#004AAD] hover:bg-blue-50 transition-all cursor-pointer">
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          {fileUploads.ktpFile ? (
                            <span className="text-green-600 font-semibold">✓ {fileUploads.ktpFile.name}</span>
                          ) : (
                            'Klik atau drag file'
                          )}
                        </p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG • Max 5MB</p>
                        <Input
                          id="ktpFile"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleDocumentFileChange('ktpFile', e)}
                          className="hidden"
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3 hover:bg-[#004AAD] hover:text-white hover:border-[#004AAD]"
                          onClick={() => document.getElementById('ktpFile')?.click()}
                          disabled={loading}
                        >
                          Pilih File
                        </Button>
                      </div>
                    </div>

                    {/* 3. Kartu Keluarga */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <span>Kartu Keluarga (KK)</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#004AAD] hover:bg-blue-50 transition-all cursor-pointer">
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          {fileUploads.kkFile ? (
                            <span className="text-green-600 font-semibold">✓ {fileUploads.kkFile.name}</span>
                          ) : (
                            'Klik atau drag file'
                          )}
                        </p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG • Max 5MB</p>
                        <Input
                          id="kkFile"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleDocumentFileChange('kkFile', e)}
                          className="hidden"
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3 hover:bg-[#004AAD] hover:text-white hover:border-[#004AAD]"
                          onClick={() => document.getElementById('kkFile')?.click()}
                          disabled={loading}
                        >
                          Pilih File
                        </Button>
                      </div>
                    </div>

                    {/* 4. Pas Foto */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <span>Pas Foto (terbaru)</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#004AAD] hover:bg-blue-50 transition-all cursor-pointer">
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          {fileUploads.photoFile ? (
                            <span className="text-green-600 font-semibold">✓ {fileUploads.photoFile.name}</span>
                          ) : (
                            'Klik atau drag file'
                          )}
                        </p>
                        <p className="text-xs text-gray-500">JPG, PNG • Max 5MB</p>
                        <Input
                          id="photoFile"
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => handleDocumentFileChange('photoFile', e)}
                          className="hidden"
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3 hover:bg-[#004AAD] hover:text-white hover:border-[#004AAD]"
                          onClick={() => document.getElementById('photoFile')?.click()}
                          disabled={loading}
                        >
                          Pilih File
                        </Button>
                      </div>
                    </div>

                    {/* 5. CV / Resume */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <span>Curriculum Vitae (CV) / Resume</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#004AAD] hover:bg-blue-50 transition-all cursor-pointer">
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          {fileUploads.cvFile ? (
                            <span className="text-green-600 font-semibold">✓ {fileUploads.cvFile.name}</span>
                          ) : (
                            'Klik atau drag file'
                          )}
                        </p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX • Max 5MB</p>
                        <Input
                          id="cvFile"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleDocumentFileChange('cvFile', e)}
                          className="hidden"
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3 hover:bg-[#004AAD] hover:text-white hover:border-[#004AAD]"
                          onClick={() => document.getElementById('cvFile')?.click()}
                          disabled={loading}
                        >
                          Pilih File
                        </Button>
                      </div>
                    </div>

                    {/* 6. Surat Pengantar (Optional) */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <span>Surat Pengantar dari {applicantType === 'mahasiswa' ? 'Universitas' : 'Sekolah'}</span>
                        <span className="text-gray-500 text-xs">(opsional)</span>
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#004AAD] hover:bg-blue-50 transition-all cursor-pointer">
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          {fileUploads.suratPengantarFile ? (
                            <span className="text-green-600 font-semibold">✓ {fileUploads.suratPengantarFile.name}</span>
                          ) : (
                            'Klik atau drag file'
                          )}
                        </p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX • Max 5MB</p>
                        <Input
                          id="suratPengantarFile"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleDocumentFileChange('suratPengantarFile', e)}
                          className="hidden"
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3 hover:bg-[#004AAD] hover:text-white hover:border-[#004AAD]"
                          onClick={() => document.getElementById('suratPengantarFile')?.click()}
                          disabled={loading}
                        >
                          Pilih File
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-[#004AAD] hover:bg-[#003580] hover:scale-105 active:scale-95 transition-transform text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || filteredPositions.length === 0 || activeApplicationsCount >= MAX_ACTIVE_SLOTS}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Mengirim Pengajuan...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 w-5 h-5" />
                        Kirim Pengajuan
                      </>
                    )}
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
              Anda harus login untuk mengirimkan form pendaftaran magang. Silakan login atau daftar akun terlebih dahulu.
            </DialogDescription>
          </DialogHeader>
          <LoginSheet onSuccess={handleLoginSuccess} onClose={() => setLoginDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}