import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  FileText, User, Building2, BookOpen, Loader2, Eye, Trash2, Clock, CheckCircle, XCircle, Download, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getFileUrl, applicationsAPI } from '../services/api';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker - use local copy from public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface ApplicationDetailModalProps {
  application: any | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onDelete?: () => void;
  onStatusChange?: () => void;
  isDeleting?: boolean;
  onStatusUpdated?: () => void;
}

// Helper function to safely format dates
const formatDate = (dateString: string | undefined, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', options);
  } catch (error) {
    return '-';
  }
};

// Get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-5 h-5 text-blue-500" />;
    case 'review':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case 'accepted':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'rejected':
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

// Get status badge
const getStatusBadge = (status: string) => {
  const statusMap = {
    pending: { label: 'Diajukan', color: 'bg-blue-100 text-blue-800' },
    review: { label: 'Sedang Ditinjau', color: 'bg-yellow-100 text-yellow-800' },
    accepted: { label: 'Diterima', color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800' }
  };
  
  const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
  return (
    <Badge className={`${statusInfo.color} border-0`}>
      {statusInfo.label}
    </Badge>
  );
};

// Document Preview Modal Component
function DocumentPreviewModal({ 
  fileUrl, 
  fileName, 
  isOpen, 
  onClose 
}: { 
  fileUrl: string; 
  fileName: string; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [pdfPages, setPdfPages] = useState<HTMLCanvasElement[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [renderingProgress, setRenderingProgress] = useState(0);

  // PDF cache to avoid re-fetching
  const pdfCacheRef = useRef<Map<string, any>>(new Map());
  const currentLoadIdRef = useRef<number>(0);

  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.toLowerCase() || '';
  };

  const fileExt = getFileExtension(fileUrl);
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
  const isPDF = fileExt === 'pdf';

  // Cleanup blob URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  // Reset PDF state and abort previous load when file changes
  useEffect(() => {
    setPdfPages([]);
    setCurrentPage(0);
    setTotalPages(0);
    setError(false);
    setRenderingProgress(0);
    // Increment load ID to invalidate previous load
    currentLoadIdRef.current++;
  }, [fileUrl]);

  // Load PDF when modal opens
  useEffect(() => {
    if (isPDF && isOpen && pdfPages.length === 0) {
      loadPDF();
    }
  }, [isOpen, isPDF, fileUrl]);

  const loadPDF = async () => {
    // Get this load's ID
    const loadId = ++currentLoadIdRef.current;
    
    setLoading(true);
    setError(false);
    setRenderingProgress(0);
    let newBlobUrl: string | null = null;
    
    try {
      // Check if PDF is already cached
      const cacheKey = fileUrl;
      if (pdfCacheRef.current.has(cacheKey)) {
        // Only apply cached data if this is still the current load
        if (loadId !== currentLoadIdRef.current) return;
        
        const cachedData = pdfCacheRef.current.get(cacheKey);
        setPdfPages(cachedData.pages);
        setTotalPages(cachedData.totalPages);
        setRenderingProgress(100);
        setLoading(false);
        return;
      }

      // Fetch the PDF as a blob
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if still current load
      if (loadId !== currentLoadIdRef.current) return;
      
      const blob = await response.blob();
      newBlobUrl = URL.createObjectURL(blob);
      setBlobUrl(newBlobUrl);

      // Load the PDF from the blob URL
      const pdf = await pdfjsLib.getDocument({
        url: newBlobUrl,
        disableFontFace: false,
        useWorkerFetch: true,
        cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`
      }).promise;
      
      // Check if still current load
      if (loadId !== currentLoadIdRef.current) return;
      
      setTotalPages(pdf.numPages);
      const pages: HTMLCanvasElement[] = [];

      // Render first page immediately
      const renderPage = async (pageNum: number) => {
        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) return null;

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvas: canvas,
            canvasContext: context,
            viewport: viewport,
          }).promise;

          return canvas;
        } catch (pageErr) {
          console.warn(`Warning rendering page ${pageNum}:`, pageErr);
          return null;
        }
      };

      // Render first page only first (show immediately)
      const firstPageCanvas = await renderPage(1);
      
      // Check if still current load
      if (loadId !== currentLoadIdRef.current) return;
      
      if (firstPageCanvas) {
        pages[0] = firstPageCanvas;
        setPdfPages([firstPageCanvas]);
        setRenderingProgress(Math.round((1 / pdf.numPages) * 100));
      }

      // Render remaining pages in background
      if (pdf.numPages > 1) {
        (async () => {
          for (let pageNum = 2; pageNum <= pdf.numPages; pageNum++) {
            // Check if still current load
            if (loadId !== currentLoadIdRef.current) return;
            
            const canvas = await renderPage(pageNum);
            if (canvas && loadId === currentLoadIdRef.current) {
              pages[pageNum - 1] = canvas;
              setPdfPages([...pages.slice(0, pageNum)]);
              setRenderingProgress(Math.round((pageNum / pdf.numPages) * 100));
            }
          }
          
          // Only finalize if still current load
          if (loadId === currentLoadIdRef.current) {
            pdfCacheRef.current.set(cacheKey, {
              pages: pages.filter(Boolean),
              totalPages: pdf.numPages
            });
            setCurrentPage(0);
            setLoading(false);
          }
        })();
      } else {
        // Single page PDF
        pdfCacheRef.current.set(cacheKey, {
          pages: [firstPageCanvas],
          totalPages: 1
        });
        setCurrentPage(0);
        setLoading(false);
      }

    } catch (err) {
      // Only show error if still current load
      if (loadId === currentLoadIdRef.current) {
        console.error('Error loading PDF:', err);
        setError(true);
        setLoading(false);
        toast.error('Gagal memuat PDF - file mungkin rusak atau format tidak didukung');
      }
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Preview: {fileName}</DialogTitle>
          <DialogDescription>
            Pratinjau dokumen
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto max-h-[70vh] bg-gray-100 rounded-lg p-4">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#004AAD] mx-auto mb-4" />
                <p className="text-gray-600">Memuat dokumen...</p>
                {renderingProgress > 0 && (
                  <div className="mt-4 w-48">
                    <div className="bg-gray-300 rounded-full h-2">
                      <div 
                        className="bg-[#004AAD] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${renderingProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{renderingProgress}%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && isImage && (
            <div className="flex items-center justify-center h-full">
              <img 
                src={fileUrl} 
                alt={fileName}
                className="max-w-full max-h-full object-contain rounded"
                onError={() => setError(true)}
              />
            </div>
          )}

          {!loading && isPDF && !error && pdfPages.length > 0 && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-white p-4 rounded-lg mb-4">
                <img 
                  src={pdfPages[currentPage].toDataURL('image/png')} 
                  alt={`Page ${currentPage + 1}`}
                  className="max-h-[550px] object-contain"
                />
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <Button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-sm font-medium text-gray-700">
                  Halaman {currentPage + 1} dari {totalPages}
                </span>
                
                <Button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages - 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {!loading && isPDF && error && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Gagal memuat PDF
              </p>
              <a 
                href={fileUrl} 
                download={fileName}
                className="px-4 py-2 bg-[#004AAD] text-white rounded hover:bg-[#003580]"
              >
                Unduh PDF
              </a>
            </div>
          )}

          {!loading && !isImage && !isPDF && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Format file tidak dapat ditampilkan preview di sini
              </p>
              <a 
                href={fileUrl} 
                download={fileName}
                className="px-4 py-2 bg-[#004AAD] text-white rounded hover:bg-[#003580]"
              >
                Unduh file untuk melihat
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ApplicationDetailModal({
  application,
  isOpen,
  onClose,
  isAdmin = false,
  onDelete,
  onStatusChange,
  isDeleting = false,
  onStatusUpdated

}: ApplicationDetailModalProps) {
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [statusSelectOpen, setStatusSelectOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'review' | 'accepted' | 'rejected' | null>(null);
  const [statusNotes, setStatusNotes] = useState('');

  // Normalize data to handle both camelCase and snake_case
  const normalizeData = (app: any) => ({
    id: app.id,
    nik: app.nik,
    fullName: app.fullName || app.full_name,
    email: app.email,
    phone: app.phone,
    birthDate: app.birthDate || app.birth_date,
    gender: app.gender,
    address: app.address,
    applicantType: app.applicantType || app.applicant_type,
    npm: app.npm,
    nis: app.nis,
    university: app.university,
    schoolName: app.schoolName || app.school_name,
    major: app.major,
    studentMajor: app.studentMajor || app.student_major,
    semester: app.semester,
    schoolType: app.schoolType || app.school_type,
    grade: app.grade,
    positionId: app.positionId || app.position_id,
    position: app.position,
    startDate: app.startDate || app.start_date,
    endDate: app.endDate || app.end_date,
    createdAt: app.createdAt || app.created_at,
    registrationNumber: app.registrationNumber,
    status: app.status,
    adminNotes: app.adminNotes || app.admin_notes,
    coverLetterFile: app.coverLetterFile || app.cover_letter_file,
    ktpFile: app.ktpFile || app.ktp_file,
    kkFile: app.kkFile || app.kk_file,
    photoFile: app.photoFile || app.photo_file,
    cvFile: app.cvFile || app.cv_file,
    suratPengantarFile: app.suratPengantarFile || app.surat_pengantar_file,
  });

  const handlePreview = (filePath: string, docName: string) => {
    const fileUrl = getFileUrl(filePath);
    setPreviewFile({ url: fileUrl, name: docName });
    setPreviewOpen(true);
  };

  const handleDownload = (filePath: string, docName: string) => {
    const fileUrl = getFileUrl(filePath);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = docName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusUpdate = async () => {
    if (!application || !selectedStatus) return;

    try {
      const response = await applicationsAPI.updateStatus(
        application.id,
        selectedStatus,
        statusNotes
      );

      if (response.success) {
        toast.success(`Status diubah menjadi ${selectedStatus === 'review' ? 'Sedang Ditinjau' : selectedStatus === 'accepted' ? 'Diterima' : 'Ditolak'}`);
        setStatusSelectOpen(false);
        setSelectedStatus(null);
        setStatusNotes('');
        if (onStatusUpdated) {
          onStatusUpdated();
        }
      } else {
        toast.error(response.message || 'Gagal mengubah status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengubah status');
    }
  };

  // Normalize data early so it's available throughout JSX
  const normalizedApp = application ? normalizeData(application) : null;

  if (!application || !normalizedApp) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#004AAD] flex items-center gap-2 text-xl">
              <FileText className="w-6 h-6" />
              Detail Pengajuan Magang
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang pengajuan magang
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status Badge Section */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#004AAD]/5 to-[#0066CC]/5 rounded-lg border border-[#004AAD]/10">
              <div className="flex items-center gap-3">
                {getStatusIcon(normalizedApp.status)}
                <div>
                  <p className="text-sm text-gray-600 font-medium">Status Saat Ini</p>
                  {getStatusBadge(normalizedApp.status)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 font-medium">NIK</p>
                <p className="text-sm font-mono text-[#004AAD]">{normalizedApp.nik || '-'}</p>
              </div>
            </div>

            {/* Registration Number */}
            {normalizedApp.registrationNumber && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Nomor Registrasi</p>
                <p className="text-sm font-mono font-semibold text-[#004AAD]">{normalizedApp.registrationNumber}</p>
              </div>
            )}

            {/* Personal Info Section */}
            <div className="space-y-3">
              <h4 className="text-[#004AAD] font-semibold flex items-center gap-2 text-base">
                <User className="w-5 h-5" />
                Data Pribadi
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">NIK (Nomor Induk Kependudukan)</p>
                  <p className="text-sm font-medium">{normalizedApp.nik || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Nama Lengkap</p>
                  <p className="text-sm font-medium">{normalizedApp.fullName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">
                    {normalizedApp.applicantType === 'mahasiswa' ? 'NPM/NIM' : 'NIS'}
                  </p>
                  <p className="text-sm font-medium">{normalizedApp.npm || normalizedApp.nis || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Email</p>
                  <p className="text-sm font-medium break-all">{normalizedApp.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">No. Telepon</p>
                  <p className="text-sm font-medium">{normalizedApp.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Jenis Kelamin</p>
                  <p className="text-sm font-medium">{normalizedApp.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Tanggal Lahir</p>
                  <p className="text-sm font-medium">{formatDate(normalizedApp.birthDate)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-600 font-medium mb-1">Alamat</p>
                  <p className="text-sm font-medium">{normalizedApp.address || '-'}</p>
                </div>
              </div>
            </div>

            {/* Academic Info Section */}
            <div className="space-y-3">
              <h4 className="text-[#004AAD] font-semibold flex items-center gap-2 text-base">
                <BookOpen className="w-5 h-5" />
                Data Akademik
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">
                    {normalizedApp.applicantType === 'mahasiswa' ? 'Universitas' : 'Sekolah'}
                  </p>
                  <p className="text-sm font-medium">{normalizedApp.university || normalizedApp.schoolName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">
                    {normalizedApp.applicantType === 'mahasiswa' ? 'Program Studi' : 'Jurusan'}
                  </p>
                  <p className="text-sm font-medium">{normalizedApp.major || normalizedApp.studentMajor || '-'}</p>
                </div>
                {normalizedApp.applicantType === 'mahasiswa' && (
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Semester</p>
                    <p className="text-sm font-medium">{normalizedApp.semester || '-'}</p>
                  </div>
                )}
                {normalizedApp.applicantType === 'pelajar' && (
                  <>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Jenis Sekolah</p>
                      <p className="text-sm font-medium uppercase">{normalizedApp.schoolType || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Kelas</p>
                      <p className="text-sm font-medium">{normalizedApp.grade || '-'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Internship Info Section */}
            <div className="space-y-3">
              <h4 className="text-[#004AAD] font-semibold flex items-center gap-2 text-base">
                <Building2 className="w-5 h-5" />
                Data Magang
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Posisi</p>
                  <p className="text-sm font-medium">{normalizedApp.position?.title || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Divisi</p>
                  <p className="text-sm font-medium">{normalizedApp.position?.department || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Tanggal Mulai</p>
                  <p className="text-sm font-medium">{formatDate(normalizedApp.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Tanggal Selesai</p>
                  <p className="text-sm font-medium">{formatDate(normalizedApp.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Tanggal Pengajuan</p>
                  <p className="text-sm font-medium">
                    {formatDate(normalizedApp.createdAt, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="space-y-3">
              <h4 className="text-[#004AAD] font-semibold flex items-center gap-2 text-base">
                <FileText className="w-5 h-5" />
                Dokumen yang Diupload
              </h4>
              <div className="space-y-2">
                {[
                  { file: normalizedApp.coverLetterFile, label: 'Surat Permohonan' },
                  { file: normalizedApp.ktpFile, label: 'KTP' },
                  { file: normalizedApp.kkFile, label: 'Kartu Keluarga' },
                  { file: normalizedApp.photoFile, label: 'Pas Foto (3x4)' },
                  { file: normalizedApp.cvFile, label: 'CV / Resume' },
                  { file: normalizedApp.suratPengantarFile, label: 'Surat Pengantar dari Institusi' }
                ].map((doc) =>
                  doc.file ? (
                    <div key={doc.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#004AAD] transition">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#004AAD]" />
                        <span className="text-sm font-medium text-gray-700">{doc.label}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreview(doc.file, doc.label)}
                          className="h-8 px-3 border-[#004AAD] text-[#004AAD] hover:bg-[#004AAD] hover:text-white"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Lihat
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(doc.file, doc.label)}
                          className="h-8 px-3"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : null
                )}
                {!normalizedApp.coverLetterFile && !normalizedApp.ktpFile && 
                 !normalizedApp.kkFile && !normalizedApp.photoFile &&
                 !normalizedApp.cvFile && !normalizedApp.suratPengantarFile && (
                  <p className="text-sm text-gray-600 italic">Belum ada dokumen</p>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            {normalizedApp.adminNotes && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="text-[#004AAD] font-semibold mb-2">Catatan Admin</h4>
                <p className="text-sm text-gray-700">{normalizedApp.adminNotes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t space-y-3">
              <Button
                onClick={onClose}
                className="w-full bg-[#004AAD] hover:bg-[#003580] text-white"
              >
                Tutup
              </Button>
              {!isAdmin && normalizedApp.status === 'pending' && onDelete && (
                <Button
                  onClick={onDelete}
                  variant="destructive"
                  className="w-full"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus Pengajuan
                    </>
                  )}
                </Button>
              )}
              {isAdmin && onStatusChange && (
                <Button
                  onClick={() => setStatusSelectOpen(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Ubah Status
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog (for Admin) */}
      {isAdmin && (
        <Dialog open={statusSelectOpen} onOpenChange={setStatusSelectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#004AAD]">Ubah Status Pengajuan</DialogTitle>
              <DialogDescription>
                Pilih status baru dan tambahkan catatan (opsional)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="font-semibold mb-2 block">Status Baru</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: 'review', label: 'Sedang Ditinjau', color: 'bg-yellow-100 text-yellow-800' },
                    { value: 'accepted', label: 'Diterima', color: 'bg-green-100 text-green-800' },
                    { value: 'rejected', label: 'Ditolak', color: 'bg-red-100 text-red-800' }
                  ].map((status) => (
                    <Button
                      key={status.value}
                      variant={selectedStatus === status.value ? 'default' : 'outline'}
                      className={selectedStatus === status.value ? 'bg-[#004AAD] text-white' : ''}
                      onClick={() => setSelectedStatus(status.value as 'review' | 'accepted' | 'rejected')}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="notes" className="font-semibold mb-2 block">Catatan Admin (Opsional)</Label>
                <Textarea
                  id="notes"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Tambahkan catatan untuk pelamar..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setStatusSelectOpen(false);
                  setSelectedStatus(null);
                  setStatusNotes('');
                }}
              >
                Batal
              </Button>
              <Button
                disabled={!selectedStatus}
                className="bg-[#004AAD] hover:bg-[#003580] text-white"
                onClick={handleStatusUpdate}
              >
                Simpan Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Document Preview Modal */}
      {previewFile && (
        <DocumentPreviewModal
          fileUrl={previewFile.url}
          fileName={previewFile.name}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
}
