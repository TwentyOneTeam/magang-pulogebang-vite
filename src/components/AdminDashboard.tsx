import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Users, CheckCircle, Clock, FileText, TrendingUp, Eye, Check, X, Plus, Mail, Phone, School, Calendar as CalendarIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner@2.0.3';

type Page = 'home' | 'info' | 'registration' | 'status' | 'chatbot' | 'admin';

interface AdminDashboardProps {
  onNavigate: (page: Page) => void;
}

interface Application {
  id: string;
  name: string;
  npm: string;
  institution: string;
  division: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  email?: string;
  phone?: string;
  major?: string;
  startDate?: string;
  duration?: string;
}

interface InternshipPosition {
  id: string;
  title: string;
  division: string;
  quota: number;
  period: string;
  requirements: string;
  description: string;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 'MAG-2025-005',
      name: 'Rina Melati',
      npm: '2020567890',
      institution: 'Universitas Brawijaya',
      division: 'Pelayanan Umum',
      date: '2025-11-07',
      status: 'pending',
      email: 'rina.melati@email.com',
      phone: '081234567890',
      major: 'Administrasi Publik',
      startDate: '2025-12-01',
      duration: '3 bulan',
    },
    {
      id: 'MAG-2025-006',
      name: 'Fajar Ramadhan',
      npm: '2020678901',
      institution: 'Politeknik Negeri Jakarta',
      division: 'Teknologi Informasi',
      date: '2025-11-08',
      status: 'pending',
      email: 'fajar.ramadhan@email.com',
      phone: '081345678901',
      major: 'Teknik Informatika',
      startDate: '2025-12-01',
      duration: '4 bulan',
    },
    {
      id: 'MAG-2025-007',
      name: 'Maya Kusuma',
      npm: '2020789012',
      institution: 'Universitas Mercu Buana',
      division: 'Kesejahteraan Sosial',
      date: '2025-11-09',
      status: 'pending',
      email: 'maya.kusuma@email.com',
      phone: '081456789012',
      major: 'Ilmu Kesejahteraan Sosial',
      startDate: '2025-12-15',
      duration: '3 bulan',
    },
  ]);

  const [positions, setPositions] = useState<InternshipPosition[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [addPositionDialogOpen, setAddPositionDialogOpen] = useState(false);

  const [newPosition, setNewPosition] = useState({
    title: '',
    division: '',
    quota: '',
    period: '',
    requirements: '',
    description: '',
  });

  // Mock statistics data
  const stats = [
    {
      title: 'Total Pendaftar',
      value: '127',
      icon: Users,
      color: 'bg-blue-500',
      change: '+12% dari bulan lalu',
    },
    {
      title: 'Magang Aktif',
      value: '34',
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '8 divisi berbeda',
    },
    {
      title: 'Menunggu Verifikasi',
      value: '15',
      icon: Clock,
      color: 'bg-yellow-500',
      change: 'Perlu ditindaklanjuti',
    },
    {
      title: 'Selesai Magang',
      value: '78',
      icon: FileText,
      color: 'bg-purple-500',
      change: 'Tahun ini',
    },
  ];

  // Mock chart data
  const monthlyData = [
    { month: 'Jan', pendaftar: 28 },
    { month: 'Feb', pendaftar: 32 },
    { month: 'Mar', pendaftar: 25 },
    { month: 'Apr', pendaftar: 35 },
    { month: 'Mei', pendaftar: 30 },
    { month: 'Jun', pendaftar: 38 },
  ];

  const divisionData = [
    { name: 'Pelayanan Umum', value: 35 },
    { name: 'Kessos', value: 25 },
    { name: 'Pemberdayaan', value: 20 },
    { name: 'Kependudukan', value: 15 },
    { name: 'IT', value: 32 },
  ];

  const COLORS = ['#004AAD', '#0066CC', '#FFD95A', '#F4F4F4', '#6B7280'];

  const handleVerify = (id: string, action: 'approve' | 'reject') => {
    setApplications(prev => prev.map(app => 
      app.id === id 
        ? { ...app, status: action === 'approve' ? 'approved' : 'rejected' }
        : app
    ));
    
    toast.success(
      action === 'approve' 
        ? 'Aplikasi berhasil disetujui!' 
        : 'Aplikasi berhasil ditolak'
    );
  };

  const handleViewDetail = (application: Application) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
  };

  const handleAddPosition = () => {
    if (!newPosition.title || !newPosition.division || !newPosition.quota) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    const position: InternshipPosition = {
      id: `POS-${Date.now()}`,
      title: newPosition.title,
      division: newPosition.division,
      quota: parseInt(newPosition.quota),
      period: newPosition.period,
      requirements: newPosition.requirements,
      description: newPosition.description,
    };

    setPositions(prev => [...prev, position]);
    setNewPosition({
      title: '',
      division: '',
      quota: '',
      period: '',
      requirements: '',
      description: '',
    });
    setAddPositionDialogOpen(false);
    toast.success('Lowongan magang berhasil ditambahkan!');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F4F4]">
      <Header onNavigate={onNavigate} currentPage="admin" />

      {/* Header */}
      <section className="bg-gradient-to-br from-[#004AAD] to-[#0066CC] text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-white mb-2">Dashboard Admin</h1>
          <p className="text-gray-100">
            Kelola dan pantau program magang Kelurahan Pulo Gebang
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
                <p className="text-2xl mb-2 text-[#004AAD]">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Applications Chart */}
          <Card className="p-6 bg-white">
            <h3 className="text-[#004AAD] mb-4">Pendaftar per Bulan</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pendaftar" fill="#004AAD" name="Jumlah Pendaftar" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Division Distribution Chart */}
          <Card className="p-6 bg-white">
            <h3 className="text-[#004AAD] mb-4">Distribusi per Divisi</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={divisionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {divisionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Lowongan Management */}
        <Card className="p-6 bg-white mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[#004AAD] mb-1">Kelola Lowongan Magang</h3>
              <p className="text-sm text-gray-600">Tambah dan kelola lowongan yang tersedia</p>
            </div>
            <Dialog open={addPositionDialogOpen} onOpenChange={setAddPositionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#004AAD] hover:bg-[#003A8C]">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Lowongan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-[#004AAD]">Tambah Lowongan Magang Baru</DialogTitle>
                  <DialogDescription>
                    Isi form di bawah untuk menambahkan lowongan magang baru ke sistem.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Judul Lowongan *</Label>
                    <Input
                      id="title"
                      placeholder="Contoh: Magang Administrasi Perkantoran"
                      value={newPosition.title}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="division">Divisi *</Label>
                      <Select value={newPosition.division} onValueChange={(value) => setNewPosition(prev => ({ ...prev, division: value }))}>
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="quota">Kuota *</Label>
                      <Input
                        id="quota"
                        type="number"
                        placeholder="5"
                        value={newPosition.quota}
                        onChange={(e) => setNewPosition(prev => ({ ...prev, quota: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="period">Periode</Label>
                    <Input
                      id="period"
                      placeholder="Contoh: Januari - Maret 2026"
                      value={newPosition.period}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, period: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Persyaratan</Label>
                    <Textarea
                      id="requirements"
                      placeholder="Tuliskan persyaratan yang diperlukan..."
                      value={newPosition.requirements}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, requirements: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      placeholder="Deskripsi detail tentang posisi ini..."
                      value={newPosition.description}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setAddPositionDialogOpen(false)} className="flex-1">
                      Batal
                    </Button>
                    <Button onClick={handleAddPosition} className="bg-[#004AAD] hover:bg-[#003A8C] flex-1">
                      Tambah Lowongan
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {positions.length > 0 ? (
            <div className="space-y-3">
              {positions.map((pos) => (
                <div key={pos.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[#004AAD] mb-1">{pos.title}</h4>
                      <p className="text-sm text-gray-600">Divisi: {pos.division} | Kuota: {pos.quota} orang</p>
                      {pos.period && <p className="text-xs text-gray-500 mt-1">Periode: {pos.period}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Belum ada lowongan yang ditambahkan</p>
          )}
        </Card>

        {/* Pending Applications */}
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[#004AAD] mb-1">Pengajuan Menunggu Verifikasi</h3>
              <p className="text-sm text-gray-600">Tinjau dan verifikasi pengajuan baru</p>
            </div>
            <Badge className="bg-yellow-500">{applications.filter(app => app.status === 'pending').length} Pending</Badge>
          </div>

          {/* Mobile View */}
          <div className="block lg:hidden space-y-4">
            {applications.filter(app => app.status === 'pending').map((app) => (
              <Card key={app.id} className="p-4 border-l-4 border-l-yellow-500">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-[#004AAD]">{app.name}</h4>
                    <p className="text-xs text-gray-600">{app.id}</p>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>

                <div className="space-y-2 text-sm mb-4">
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
                    <span>{app.division}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewDetail(app)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Detail
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 flex-1"
                    onClick={() => handleVerify(app.id, 'approve')}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Terima
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleVerify(app.id, 'reject')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F4F4F4]">
                  <TableHead>ID</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>NPM</TableHead>
                  <TableHead>Institusi</TableHead>
                  <TableHead>Divisi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.filter(app => app.status === 'pending').map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.id}</TableCell>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>{app.npm}</TableCell>
                    <TableCell>{app.institution}</TableCell>
                    <TableCell>{app.division}</TableCell>
                    <TableCell>{new Date(app.date).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Pending</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetail(app)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleVerify(app.id, 'approve')}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Terima
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleVerify(app.id, 'reject')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Tolak
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#004AAD]">Detail Aplikan</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang aplikan magang.
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6 py-4">
              {/* Header Info */}
              <div className="flex items-start justify-between pb-4 border-b">
                <div>
                  <h3 className="text-[#004AAD] text-xl mb-1">{selectedApplication.name}</h3>
                  <p className="text-sm text-gray-600">{selectedApplication.id}</p>
                </div>
                <Badge 
                  className={
                    selectedApplication.status === 'approved' 
                      ? 'bg-green-500' 
                      : selectedApplication.status === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }
                >
                  {selectedApplication.status === 'approved' 
                    ? 'Disetujui' 
                    : selectedApplication.status === 'rejected'
                    ? 'Ditolak'
                    : 'Pending'}
                </Badge>
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="text-[#004AAD] mb-3">Informasi Pribadi</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <School className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">NPM</p>
                      <p className="text-sm">{selectedApplication.npm}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <School className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Institusi</p>
                      <p className="text-sm">{selectedApplication.institution}</p>
                    </div>
                  </div>
                  {selectedApplication.major && (
                    <div className="flex items-start gap-3">
                      <School className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600">Jurusan</p>
                        <p className="text-sm">{selectedApplication.major}</p>
                      </div>
                    </div>
                  )}
                  {selectedApplication.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="text-sm">{selectedApplication.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedApplication.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600">Telepon</p>
                        <p className="text-sm">{selectedApplication.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Internship Details */}
              <div>
                <h4 className="text-[#004AAD] mb-3">Detail Magang</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Divisi</p>
                      <p className="text-sm">{selectedApplication.division}</p>
                    </div>
                  </div>
                  {selectedApplication.startDate && (
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600">Mulai Magang</p>
                        <p className="text-sm">{new Date(selectedApplication.startDate).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                  )}
                  {selectedApplication.duration && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600">Durasi</p>
                        <p className="text-sm">{selectedApplication.duration}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Tanggal Pendaftaran</p>
                      <p className="text-sm">{new Date(selectedApplication.date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedApplication.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleVerify(selectedApplication.id, 'reject');
                      setDetailDialogOpen(false);
                    }}
                    className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Tolak Aplikasi
                  </Button>
                  <Button
                    onClick={() => {
                      handleVerify(selectedApplication.id, 'approve');
                      setDetailDialogOpen(false);
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Terima Aplikasi
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
