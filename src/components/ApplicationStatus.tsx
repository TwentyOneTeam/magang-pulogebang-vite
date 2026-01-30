import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Header } from './Header';
import { Footer } from './Footer';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Clock, CheckCircle, XCircle, FileText, Search, Filter, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { applicationsAPI } from '../services/api';
import { Alert, AlertDescription } from './ui/alert';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import { toast } from 'sonner';

type StatusType = 'pending' | 'review' | 'accepted' | 'rejected';

// Simplified interface - we pass raw API data to ApplicationDetailModal
// which handles normalization internally
interface Application {
  id: string;
  [key: string]: any; // Allow any additional fields from API
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

export function ApplicationStatus() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [user]); // Re-fetch ketika user login/logout

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicationsAPI.getAll();
      
      if (response.success) {
        if (response.data && Array.isArray(response.data)) {
          // Pass data as-is from API, ApplicationDetailModal handles normalization
          setApplications(response.data);
        } else if (response.data === null || response.data === undefined) {
          setApplications([]);
        } else {
          setApplications([]);
        }
      } else {
        const errorMsg = response.message || 'Gagal memuat data aplikasi';
        setError(typeof errorMsg === 'string' ? errorMsg : 'Gagal memuat data aplikasi');
        setApplications([]);
      }
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      const errorMsg = err.message || 'Terjadi kesalahan saat memuat data';
      setError(typeof errorMsg === 'string' ? errorMsg : 'Terjadi kesalahan saat memuat data');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailClick = (app: Application) => {
    setSelectedApplication(app);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: StatusType) => {
    const statusConfig = {
      pending: { label: 'Diajukan', variant: 'secondary' as const, color: 'bg-blue-500' },
      review: { label: 'Sedang Ditinjau', variant: 'default' as const, color: 'bg-yellow-500' },
      accepted: { label: 'Diterima', variant: 'default' as const, color: 'bg-green-500' },
      rejected: { label: 'Ditolak', variant: 'destructive' as const, color: 'bg-red-500' },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: StatusType) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'review':
        return <FileText className="w-5 h-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const filteredApplications = applications.filter((app) => {
    // Handle both camelCase (API format) and snake_case field names
    const fullName = app.fullName || app.full_name || '';
    const nik = app.nik || '';
    const studentId = app.npm || app.nis || app.student_id || '';
    
    const matchesSearch =
      nik.toString().includes(searchTerm) ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentId.toString().includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleDeleteApplication = async () => {
    if (!selectedApplication) return;

    try {
      setIsDeleting(true);
      const response = await applicationsAPI.delete(selectedApplication.id);

      if (response.success) {
        toast.success('Pengajuan berhasil dihapus');
        setIsDeleteDialogOpen(false);
        setIsDialogOpen(false);
        setSelectedApplication(null);
        // Refresh the applications list
        fetchApplications();
      } else {
        toast.error(response.message || 'Gagal menghapus pengajuan');
      }
    } catch (err: any) {
      console.error('Error deleting application:', err);
      toast.error(err.message || 'Terjadi kesalahan saat menghapus pengajuan');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#004AAD] to-[#0066CC] text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-white mb-4 text-[20px] font-bold">Status Pengajuan</h1>
          <p className="text-lg text-gray-100 max-w-3xl">
            Pantau perkembangan pengajuan magang Anda secara real-time
          </p>
        </div>
      </section>

      {/* Status Section */}
      <section className="py-12 md:py-16 bg-[#F4F4F4]">
        <div className="container mx-auto px-4">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <Card className="p-6 mb-6 bg-white">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Cari berdasarkan NIK, Nama, atau NPM/NIS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Diajukan</SelectItem>
                    <SelectItem value="review">Sedang Ditinjau</SelectItem>
                    <SelectItem value="accepted">Diterima</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-[#004AAD] mb-4" />
              <p className="text-gray-600">Memuat data aplikasi...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card className="p-12 text-center bg-white">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-700 mb-2">Tidak Ada Data</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Tidak ada pengajuan yang sesuai dengan pencarian Anda.'
                  : 'Belum ada pengajuan magang yang terdaftar.'}
              </p>
              <Button
                onClick={() => navigate('/pendaftaran')}
                className="bg-[#004AAD] hover:bg-[#003580]"
              >
                Ajukan Magang Sekarang
              </Button>
            </Card>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4">
                {filteredApplications.map((app) => (
                  <Card key={app.id} className="p-6 bg-white hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-[#004AAD]">{app.fullName || app.full_name}</h3>
                        <p className="text-sm text-gray-600">NIK: {app.nik || '-'}</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{(app.applicantType || app.applicant_type) === 'mahasiswa' ? 'NPM' : 'NIS'}:</span>
                        <span>{app.npm || app.nis}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Institusi:</span>
                        <span className="text-right">{app.university || app.schoolName || app.institution || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Posisi:</span>
                        <span className="text-right">{app.position?.title || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal:</span>
                        <span>{formatDate(app.createdAt || app.created_at)}</span>
                      </div>
                    </div>

                    {(app.adminNotes || app.admin_notes) && (
                      <div className="mt-4 p-3 bg-[#F4F4F4] rounded-lg">
                        <p className="text-xs text-gray-700">{app.adminNotes || app.admin_notes}</p>
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full mt-4 hover:bg-[#004AAD] hover:text-white hover:border-[#004AAD] transition-all"
                      onClick={() => handleDetailClick(app)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Lihat Detail
                    </Button>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <Card className="hidden lg:block bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#004AAD] hover:bg-[#004AAD]">
                        <TableHead className="text-white">NIK</TableHead>
                        <TableHead className="text-white">Nama</TableHead>
                        <TableHead className="text-white">NPM/NIS</TableHead>
                        <TableHead className="text-white">Institusi</TableHead>
                        <TableHead className="text-white">Posisi</TableHead>
                        <TableHead className="text-white">Tanggal</TableHead>
                        <TableHead className="text-white">Status</TableHead>
                        <TableHead className="text-white">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((app, index) => (
                        <TableRow 
                          key={app.id} 
                          className={`hover:bg-[#F4F4F4] transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <TableCell className="py-4">
                            <span className="text-[#004AAD] text-sm">{app.nik || '-'}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span>{app.fullName || app.full_name}</span>
                          </TableCell>
                          <TableCell className="py-4 text-gray-700">{app.npm || app.nis}</TableCell>
                          <TableCell className="py-4 text-gray-700 max-w-[200px]">
                            <div className="truncate" title={app.university || app.schoolName || ''}>
                              {app.university || app.schoolName || '-'}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-sm text-gray-700">{app.position?.title || '-'}</span>
                          </TableCell>
                          <TableCell className="py-4 text-gray-700">
                            {formatDate(app.createdAt || app.created_at, {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(app.status)}
                              {getStatusBadge(app.status)}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:bg-[#004AAD] hover:text-white transition-colors"
                              onClick={() => handleDetailClick(app)}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Table Summary Footer */}
                <div className="border-t bg-[#F4F4F4] px-6 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Menampilkan {filteredApplications.length} dari {applications.length} pengajuan
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchApplications}
                      className="hover:bg-[#004AAD] hover:text-white"
                    >
                      Refresh Data
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      <ApplicationDetailModal
        application={selectedApplication}
        isOpen={isDialogOpen && selectedApplication !== null}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedApplication(null);
        }}
        isAdmin={false}
        onDelete={() => setIsDeleteDialogOpen(true)}
        isDeleting={isDeleting}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Hapus Pengajuan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengajuan magang ini?
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tindakan ini tidak dapat dibatalkan. Semua dokumen dan data pengajuan akan dihapus secara permanen.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteApplication}
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
