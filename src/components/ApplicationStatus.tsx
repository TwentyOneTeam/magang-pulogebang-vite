import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Clock, CheckCircle, XCircle, FileText, Search, Filter, User, Building2, Calendar, BookOpen } from 'lucide-react';

type Page = 'home' | 'info' | 'registration' | 'status' | 'chatbot' | 'admin';

interface ApplicationStatusProps {
  onNavigate: (page: Page) => void;
}

type StatusType = 'submitted' | 'verified' | 'accepted' | 'rejected';

interface Application {
  id: string;
  name: string;
  npm: string;
  institution: string;
  division: string;
  period: string;
  submittedDate: string;
  status: StatusType;
  notes?: string;
}

export function ApplicationStatus({ onNavigate }: ApplicationStatusProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDetailClick = (app: Application) => {
    setSelectedApplication(app);
    setIsDialogOpen(true);
  };

  const mockApplications: Application[] = [
    {
      id: 'MAG-2025-001',
      name: 'Ahmad Rizki',
      npm: '2020123456',
      institution: 'Universitas Indonesia',
      division: 'Teknologi Informasi',
      period: 'Periode Januari - Maret 2025',
      submittedDate: '2025-01-05',
      status: 'accepted',
      notes: 'Pengajuan disetujui, silakan hubungi admin untuk jadwal orientasi',
    },
    {
      id: 'MAG-2025-002',
      name: 'Siti Nurhaliza',
      npm: '2020234567',
      institution: 'Universitas Negeri Jakarta',
      division: 'Pelayanan Umum',
      period: 'Periode April - Juni 2025',
      submittedDate: '2025-01-08',
      status: 'verified',
      notes: 'Dokumen sedang dalam proses verifikasi akhir',
    },
    {
      id: 'MAG-2025-003',
      name: 'Budi Santoso',
      npm: '2020345678',
      institution: 'Universitas Gunadarma',
      division: 'Administrasi Kependudukan',
      period: 'Periode Juli - September 2025',
      submittedDate: '2025-01-10',
      status: 'submitted',
    },
    {
      id: 'MAG-2025-004',
      name: 'Dewi Lestari',
      npm: '2020456789',
      institution: 'Universitas Trisakti',
      division: 'Kesejahteraan Sosial',
      period: 'Periode Oktober - Desember 2025',
      submittedDate: '2025-01-12',
      status: 'rejected',
      notes: 'Kuota untuk divisi ini sudah penuh, silakan daftar untuk periode berikutnya',
    },
  ];

  const getStatusBadge = (status: StatusType) => {
    const statusConfig = {
      submitted: { label: 'Diajukan', variant: 'secondary' as const, color: 'bg-blue-500' },
      verified: { label: 'Diverifikasi', variant: 'default' as const, color: 'bg-yellow-500' },
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
      case 'submitted':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'verified':
        return <FileText className="w-5 h-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const filteredApplications = mockApplications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.npm.includes(searchTerm) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header onNavigate={onNavigate} currentPage="status" />

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
          {/* Filters */}
          <Card className="p-6 mb-6 bg-white">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Cari berdasarkan nama, NPM, atau ID..."
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
                    <SelectItem value="submitted">Diajukan</SelectItem>
                    <SelectItem value="verified">Diverifikasi</SelectItem>
                    <SelectItem value="accepted">Diterima</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-4">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="p-6 bg-white hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[#004AAD]">{app.name}</h3>
                    <p className="text-sm text-gray-600">{app.id}</p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">NPM:</span>
                    <span>{app.npm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Institusi:</span>
                    <span className="text-right">{app.institution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Divisi:</span>
                    <span className="text-right">{app.division}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal:</span>
                    <span>{new Date(app.submittedDate).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>

                {app.notes && (
                  <div className="mt-4 p-3 bg-[#F4F4F4] rounded-lg">
                    <p className="text-xs text-gray-700">{app.notes}</p>
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
                    <TableHead className="text-white">ID Pengajuan</TableHead>
                    <TableHead className="text-white">Nama Mahasiswa</TableHead>
                    <TableHead className="text-white">NPM</TableHead>
                    <TableHead className="text-white">Institusi</TableHead>
                    <TableHead className="text-white">Divisi</TableHead>
                    <TableHead className="text-white">Tanggal Daftar</TableHead>
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
                        <span className="text-[#004AAD]">{app.id}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span>{app.name}</span>
                      </TableCell>
                      <TableCell className="py-4 text-gray-700">{app.npm}</TableCell>
                      <TableCell className="py-4 text-gray-700 max-w-[200px]">
                        <div className="truncate" title={app.institution}>
                          {app.institution}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm text-gray-700">{app.division}</span>
                      </TableCell>
                      <TableCell className="py-4 text-gray-700">
                        {new Date(app.submittedDate).toLocaleDateString('id-ID', {
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
                  Menampilkan <span className="text-[#004AAD]">{filteredApplications.length}</span> dari{' '}
                  <span className="text-[#004AAD]">{mockApplications.length}</span> pengajuan
                </span>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>Total: {mockApplications.length} pengajuan</span>
                </div>
              </div>
            </div>
          </Card>

          {filteredApplications.length === 0 && (
            <Card className="p-12 text-center bg-white">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-600 mb-2">Tidak ada data pengajuan</h3>
              <p className="text-sm text-gray-500">Coba ubah filter atau kata kunci pencarian Anda</p>
            </Card>
          )}

          {/* Status Legend */}
          <Card className="p-6 mt-6 bg-white">
            <h3 className="text-[#004AAD] mb-4">Keterangan Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm">Diajukan</p>
                  <p className="text-xs text-gray-600">Pengajuan sedang diproses</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm">Diverifikasi</p>
                  <p className="text-xs text-gray-600">Dokumen sedang diverifikasi</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm">Diterima</p>
                  <p className="text-xs text-gray-600">Pengajuan disetujui</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm">Ditolak</p>
                  <p className="text-xs text-gray-600">Pengajuan tidak disetujui</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#004AAD]">Detail Pengajuan Magang</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang pengajuan magang Anda
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6 mt-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between p-4 bg-[#F4F4F4] rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedApplication.status)}
                  <div>
                    <p className="text-sm text-gray-600">Status Pengajuan</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedApplication.status)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">ID Pengajuan</p>
                  <p className="text-[#004AAD]">{selectedApplication.id}</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-[#004AAD] flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informasi Mahasiswa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Nama Lengkap</p>
                    <p className="font-medium">{selectedApplication.name}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">NPM</p>
                    <p className="font-medium">{selectedApplication.npm}</p>
                  </div>
                  <div className="p-4 border rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Institusi
                    </p>
                    <p className="font-medium">{selectedApplication.institution}</p>
                  </div>
                </div>
              </div>

              {/* Internship Information */}
              <div className="space-y-4">
                <h3 className="text-[#004AAD] flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Informasi Magang
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Periode Magang</p>
                    <p className="font-medium">{selectedApplication.period}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Divisi Pilihan</p>
                    <p className="font-medium">{selectedApplication.division}</p>
                  </div>
                  <div className="p-4 border rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Tanggal Pendaftaran
                    </p>
                    <p className="font-medium">
                      {new Date(selectedApplication.submittedDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedApplication.notes && (
                <div className="space-y-2">
                  <h3 className="text-[#004AAD]">Catatan</h3>
                  <div className="p-4 bg-[#F4F4F4] rounded-lg border-l-4 border-[#004AAD]">
                    <p className="text-sm text-gray-700">{selectedApplication.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button 
                  className="flex-1 bg-[#004AAD] hover:bg-[#003580]"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Tutup
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    // Handle print or download action
                    window.print();
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Cetak Detail
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
