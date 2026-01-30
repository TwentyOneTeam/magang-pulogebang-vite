import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, CheckCircle, Clock, Eye, Plus, 
  Briefcase, Edit, Trash2, 
  Loader2, AlertCircle, ToggleLeft, ToggleRight 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { applicationsAPI, positionsAPI } from '../services/api';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import { StatusUpdateModal } from './StatusUpdateModal';

interface Application {
  id: string;
  applicant_type: string;
  full_name: string;
  email: string;
  phone: string;
  institution: string;
  student_id: string;
  major: string;
  school_type?: string;
  grade?: string;
  address: string;
  position_id: string;
  position?: {
    title: string;
    department: string;
  };
  start_date: string;
  duration: string;
  status: 'pending' | 'review' | 'accepted' | 'rejected';
  admin_notes?: string;
  created_at: string;
  ktp_file?: string;
  kk_file?: string;
  cover_letter_file?: string;
  photo_file?: string;
  cv_file?: string;
  surat_pengantar_file?: string;
  additional_files?: string;
}

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

interface Stats {
  total: number;
  pending: number;
  review: number;
  accepted: number;
  rejected: number;
  byApplicantType: {
    mahasiswa: number;
    pelajar: number;
  };
}

export function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [addPositionDialogOpen, setAddPositionDialogOpen] = useState(false);
  const [editPosition, setEditPosition] = useState<Position | null>(null);
  const [newPosition, setNewPosition] = useState({
    title: '',
    department: '',
    description: '',
    requirements: '',
    quota: 5,
    duration: '3 bulan',
    applicant_type: 'both',
  });
  const [savingPosition, setSavingPosition] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [appsResponse, positionsResponse, statsResponse] = await Promise.all([
        applicationsAPI.getAll(),
        positionsAPI.getAll(),
        applicationsAPI.getStats(),
      ]);

      // Handle applications
      if (appsResponse.success) {
        if (Array.isArray(appsResponse.data)) {
          setApplications(appsResponse.data);
        } else if (appsResponse.data === null || appsResponse.data === undefined) {
          setApplications([]);
        }
      } else {
        console.warn('Failed to fetch applications:', appsResponse.message);
        setApplications([]);
      }

      // Handle positions
      if (positionsResponse.success) {
        if (Array.isArray(positionsResponse.data)) {
          setPositions(positionsResponse.data);
        } else if (positionsResponse.data === null || positionsResponse.data === undefined) {
          setPositions([]);
        }
      } else {
        console.warn('Failed to fetch positions:', positionsResponse.message);
        setPositions([]);
      }

      // Handle stats
      if (statsResponse.success) {
        if (statsResponse.data && typeof statsResponse.data === 'object') {
          setStats(statsResponse.data);
        } else {
          console.warn('Stats data is invalid:', statsResponse.data);
          setStats(null);
        }
      } else {
        console.warn('Failed to fetch stats:', statsResponse.message);
        setStats(null);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Gagal memuat data');
      setApplications([]);
      setPositions([]);
      setStats(null);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (app: Application) => {
    setSelectedApplication(app);
    setDetailDialogOpen(true);
  };

  // Helper function untuk menghitung stats dari applications
  const calculateStats = (apps: Application[]): Stats => {
    const total = apps.length;
    const pending = apps.filter(app => app.status === 'pending').length;
    const review = apps.filter(app => app.status === 'review').length;
    const accepted = apps.filter(app => app.status === 'accepted').length;
    const rejected = apps.filter(app => app.status === 'rejected').length;
    
    const mahasiswa = apps.filter(app => app.applicant_type === 'mahasiswa').length;
    const pelajar = apps.filter(app => app.applicant_type === 'pelajar').length;

    return {
      total,
      pending,
      review,
      accepted,
      rejected,
      byApplicantType: {
        mahasiswa,
        pelajar,
      },
    };
  };

  const handleDeleteApplication = async () => {
    if (!selectedApplication) return;

    try {
      setIsDeleting(true);
      // Optimistic update: hapus dari state terlebih dahulu
      const previousApplications = applications;
      const updatedApplications = applications.filter(app => app.id !== selectedApplication.id);
      setApplications(updatedApplications);
      setStats(calculateStats(updatedApplications));
      
      const response = await applicationsAPI.delete(selectedApplication.id);

      if (response.success) {
        toast.success('Pengajuan berhasil dihapus');
        setDeleteDialogOpen(false);
        setDetailDialogOpen(false);
        setSelectedApplication(null);
      } else {
        // Revert jika gagal
        setApplications(previousApplications);
        setStats(calculateStats(previousApplications));
        toast.error(response.message || 'Gagal menghapus pengajuan');
      }
    } catch (err: any) {
      console.error('Error deleting application:', err);
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddPosition = async () => {
    try {
      setSavingPosition(true);
      const response = await positionsAPI.create(newPosition);

      if (response.success && response.data) {
        // Optimistic update: tambah posisi baru ke state
        const newPositionData: Position = {
          id: response.data.id || Date.now().toString(),
          title: newPosition.title,
          department: newPosition.department,
          description: newPosition.description,
          requirements: newPosition.requirements,
          quota: newPosition.quota,
          duration: newPosition.duration,
          applicant_type: newPosition.applicant_type,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        setPositions([...positions, newPositionData]);
        toast.success('Posisi berhasil ditambahkan');
        setAddPositionDialogOpen(false);
        setNewPosition({
          title: '',
          department: '',
          description: '',
          requirements: '',
          quota: 5,
          duration: '3 bulan',
          applicant_type: 'both',
        });
      } else {
        toast.error(response.message || 'Gagal menambahkan posisi');
      }
    } catch (err: any) {
      console.error('Error adding position:', err);
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setSavingPosition(false);
    }
  };

  const handleEditPosition = async () => {
    if (!editPosition) return;

    try {
      setSavingPosition(true);
      const response = await positionsAPI.update(editPosition.id, newPosition);

      if (response.success) {
        // Optimistic update: update posisi di state
        setPositions(positions.map(pos => 
          pos.id === editPosition.id 
            ? {
                ...pos,
                title: newPosition.title,
                department: newPosition.department,
                description: newPosition.description,
                requirements: newPosition.requirements,
                quota: newPosition.quota,
                duration: newPosition.duration,
                applicant_type: newPosition.applicant_type,
              }
            : pos
        ));
        toast.success('Posisi berhasil diupdate');
        setEditPosition(null);
        setNewPosition({
          title: '',
          department: '',
          description: '',
          requirements: '',
          quota: 5,
          duration: '3 bulan',
          applicant_type: 'both',
        });
      } else {
        toast.error(response.message || 'Gagal mengupdate posisi');
      }
    } catch (err: any) {
      console.error('Error updating position:', err);
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setSavingPosition(false);
    }
  };

  const handleDeletePosition = async (id: string) => {
    if (!confirm('Yakin ingin menghapus posisi ini?')) return;

    const previousPositions = positions;

    try {
      // Optimistic update: hapus dari state terlebih dahulu
      setPositions(positions.filter(pos => pos.id !== id));
      
      const response = await positionsAPI.delete(id);

      if (response.success) {
        toast.success('Posisi berhasil dihapus');
      } else {
        // Revert jika gagal
        setPositions(previousPositions);
        toast.error(response.message || 'Gagal menghapus posisi');
      }
    } catch (err: any) {
      console.error('Error deleting position:', err);
      // Revert pada error
      setPositions(previousPositions);
      toast.error(err.message || 'Terjadi kesalahan');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const previousPositions = positions;
    
    try {
      // Optimistic update: toggle status di state
      setPositions(positions.map(pos => 
        pos.id === id 
          ? { ...pos, is_active: !pos.is_active }
          : pos
      ));
      
      const response = await positionsAPI.toggleActive(id);

      if (response.success) {
        toast.success(`Posisi ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
      } else {
        // Revert jika gagal
        setPositions(previousPositions);
        toast.error(response.message || 'Gagal mengubah status');
      }
    } catch (err: any) {
      console.error('Error toggling active:', err);
      // Revert pada error
      setPositions(previousPositions);
      toast.error(err.message || 'Terjadi kesalahan');
    }
  };

  const openEditDialog = (position: Position) => {
    setEditPosition(position);
    setNewPosition({
      title: position.title,
      department: position.department,
      description: position.description,
      requirements: position.requirements,
      quota: position.quota,
      duration: position.duration,
      applicant_type: position.applicant_type,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Diajukan', color: 'bg-blue-500' },
      review: { label: 'Sedang Ditinjau', color: 'bg-yellow-500' },
      accepted: { label: 'Diterima', color: 'bg-green-500' },
      rejected: { label: 'Ditolak', color: 'bg-red-500' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getApplicantTypeLabel = (type: string) => {
    const typeConfig = {
      both: 'Mahasiswa dan Pelajar',
      mahasiswa: 'Mahasiswa',
      pelajar: 'Pelajar',
    };
    return typeConfig[type as keyof typeof typeConfig] || type;
  };

  // Chart data
  const statusChartData = stats ? [
    { name: 'Diajukan', value: stats.pending, color: '#3B82F6' },
    { name: 'Sedang Ditinjau', value: stats.review, color: '#EAB308' },
    { name: 'Diterima', value: stats.accepted, color: '#22C55E' },
    { name: 'Ditolak', value: stats.rejected, color: '#EF4444' },
  ].filter(item => item.value > 0) : [];

  const applicantTypeData = stats ? [
    { name: 'Mahasiswa', value: stats.byApplicantType.mahasiswa, color: '#004AAD' },
    { name: 'Pelajar', value: stats.byApplicantType.pelajar, color: '#FFD95A' },
  ] : [];

  // Data untuk chart pendaftar per bulan (12 bulan terakhir)
  const getMonthlyRegistrationData = () => {
    const monthlyData: { [key: string]: number } = {};
    const now = new Date();
    
    // Initialize 12 bulan terakhir
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      monthlyData[key] = 0;
    }
    
    // Count applications per bulan
    applications.forEach(app => {
      const appDate = new Date(app.created_at);
      const key = appDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      if (monthlyData.hasOwnProperty(key)) {
        monthlyData[key]++;
      }
    });
    
    return Object.entries(monthlyData).map(([month, count]) => ({
      name: month,
      value: count,
    }));
  };

  // Data untuk chart pendaftar per divisi
  const getDivisionData = () => {
    const divisionMap: { [key: string]: number } = {};
    
    applications.forEach(app => {
      if (app.position?.department) {
        divisionMap[app.position.department] = (divisionMap[app.position.department] || 0) + 1;
      }
    });
    
    return Object.entries(divisionMap)
      .map(([division, count]) => ({
        name: division,
        value: count,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const monthlyRegistrationData = getMonthlyRegistrationData();
  const divisionData = getDivisionData();

  // Color palette untuk divisi
  const DIVISION_COLORS = [
    '#004AAD', '#0066CC', '#0080FF', '#4BA3E3', '#6CB4EE',
    '#89CFF0', '#A6D5FF', '#1F4E78', '#2E5C8A', '#003D82',
    '#0052A3', '#0066CC', '#1E90FF', '#4A90E2', '#6CB4FF'
  ];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-[#F4F4F4]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#004AAD] mx-auto mb-4" />
            <p className="text-gray-600">Memuat dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#004AAD] to-[#0066CC] text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-white mb-4 text-[20px] font-bold">Admin Dashboard</h1>
          <p className="text-lg text-gray-100">
            Kelola pengajuan magang dan posisi yang tersedia
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16 bg-[#F4F4F4] flex-1">
        <div className="container mx-auto px-4">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Pengajuan</p>
                    <p className="text-3xl text-[#004AAD] mt-2">{stats.total}</p>
                  </div>
                  <Users className="w-12 h-12 text-[#004AAD]" />
                </div>
              </Card>

              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-3xl text-blue-500 mt-2">{stats.pending}</p>
                  </div>
                  <Clock className="w-12 h-12 text-blue-500" />
                </div>
              </Card>

              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Diterima</p>
                    <p className="text-3xl text-green-500 mt-2">{stats.accepted}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </Card>

              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Posisi Aktif</p>
                    <p className="text-3xl text-[#004AAD] mt-2">
                      {positions.filter(p => p.is_active).length}
                    </p>
                  </div>
                  <Briefcase className="w-12 h-12 text-[#004AAD]" />
                </div>
              </Card>
            </div>
          )}

          {/* Charts */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 bg-white">
                <h3 className="text-[#004AAD] mb-4 font-semibold">Status Pengajuan</h3>
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        innerRadius={0}
                        fill="#8884d8"
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} pengajuan`, 'Jumlah']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          padding: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-gray-500">
                    Belum ada data pengajuan
                  </div>
                )}
              </Card>

              <Card className="p-6 bg-white">
                <h3 className="text-[#004AAD] mb-4 font-semibold">Tipe Pelamar</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={applicantTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#004AAD" name="Jumlah" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-white">
              <div className="space-y-4">
                <div>
                  <h3 className="text-[#004AAD] mb-2 font-semibold">Pendaftar Magang Per Bulan</h3>
                  {monthlyRegistrationData.length > 0 && monthlyRegistrationData.some(item => item.value > 0) ? (
                    <>
                      {/* Summary Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                          <p className="text-xs text-gray-600">Total Pendaftar</p>
                          <p className="text-lg font-bold text-[#004AAD]">
                            {monthlyRegistrationData.reduce((sum, item) => sum + item.value, 0)}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                          <p className="text-xs text-gray-600">Rata-rata/Bulan</p>
                          <p className="text-lg font-bold text-[#004AAD]">
                            {Math.round(monthlyRegistrationData.reduce((sum, item) => sum + item.value, 0) / monthlyRegistrationData.length)}
                          </p>
                        </div>
                      </div>

                      {/* Chart */}
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart 
                          data={monthlyRegistrationData}
                          margin={{ top: 10, right: 20, left: 0, bottom: 50 }}
                        >
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0066CC" stopOpacity={0.8}/>
                              <stop offset="100%" stopColor="#004AAD" stopOpacity={0.6}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value} pendaftar`, 'Jumlah']}
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #0066CC',
                              borderRadius: '6px',
                              padding: '10px',
                              boxShadow: '0 4px 12px rgba(0, 102, 204, 0.15)'
                            }}
                            cursor={{ fill: 'rgba(0, 102, 204, 0.1)' }}
                          />
                          <Bar 
                            dataKey="value" 
                            fill="url(#barGradient)"
                            name="Pendaftar"
                            radius={[8, 8, 0, 0]}
                            isAnimationActive={true}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500 rounded-lg bg-gray-50">
                      Belum ada data pendaftar
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="text-[#004AAD] mb-4 font-semibold">Pendaftar Per Divisi</h3>
              {divisionData.length > 0 ? (
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <Pie
                        data={divisionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} (${value})`}
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {divisionData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={DIVISION_COLORS[index % DIVISION_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} pendaftar`, 'Jumlah']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          padding: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend dengan detail */}
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {divisionData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: DIVISION_COLORS[index % DIVISION_COLORS.length] }}
                          />
                          <span className="text-sm font-medium text-gray-700 flex-1 truncate">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-[#004AAD] ml-2">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-gray-500">
                  Belum ada data divisi
                </div>
              )}
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="applications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="applications">Pengajuan Magang</TabsTrigger>
              <TabsTrigger value="positions">Posisi Tersedia</TabsTrigger>
            </TabsList>

            {/* Applications Tab */}
            <TabsContent value="applications">
              <Card className="bg-white overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-[#004AAD]">Daftar Pengajuan</h3>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#004AAD] hover:bg-[#004AAD]">
                        <TableHead className="text-white">ID</TableHead>
                        <TableHead className="text-white">Nama</TableHead>
                        <TableHead className="text-white">Institusi</TableHead>
                        <TableHead className="text-white">Posisi</TableHead>
                        <TableHead className="text-white">Tanggal</TableHead>
                        <TableHead className="text-white">Status</TableHead>
                        <TableHead className="text-white">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-600">
                            Belum ada pengajuan
                          </TableCell>
                        </TableRow>
                      ) : (
                        applications.map((app) => (
                          <TableRow key={app.id} className="hover:bg-gray-50">
                            <TableCell className="text-[#004AAD] text-sm">{app.id}</TableCell>
                            <TableCell>{app.full_name}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{app.institution}</TableCell>
                            <TableCell className="text-sm">{app.position?.title || '-'}</TableCell>
                            <TableCell className="text-sm">
                              {new Date(app.created_at).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(app)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => {
                                    setSelectedApplicationId(app.id);
                                    setStatusUpdateDialogOpen(true);
                                  }}
                                >
                                  Ubah Status
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedApplication(app);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>

            {/* Positions Tab */}
            <TabsContent value="positions">
              <Card className="bg-white">
                <div className="p-6 border-b flex items-center justify-between">
                  <h3 className="text-[#004AAD]">Posisi Magang</h3>
                  <Button
                    onClick={() => setAddPositionDialogOpen(true)}
                    className="bg-[#004AAD] hover:bg-[#003580]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Posisi
                  </Button>
                </div>
                <div className="p-6 space-y-4">
                  {positions.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                      <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p>Belum ada posisi tersedia</p>
                    </div>
                  ) : (
                    positions.map((position) => (
                      <Card key={position.id} className="p-6 border-2">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 flex-wrap">
                              <h4 className="text-[#004AAD] text-base md:text-lg">{position.title}</h4>
                              {position.is_active ? (
                                <Badge className="bg-green-500 w-fit">Aktif</Badge>
                              ) : (
                                <Badge variant="secondary" className="w-fit">Nonaktif</Badge>
                              )}
                              <Badge variant="outline" className="w-fit">{getApplicantTypeLabel(position.applicant_type)}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{position.department}</p>
                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">{position.description}</p>
                            <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 text-sm text-gray-600">
                              <span>Kuota: {position.quota === 0 || position.quota === null || position.quota === undefined ? '-' : position.quota}</span>
                              <span>Durasi: {position.duration}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleActive(position.id, position.is_active)}
                              title={position.is_active ? 'Nonaktifkan posisi' : 'Aktifkan posisi'}
                            >
                              {position.is_active ? (
                                <ToggleRight className="w-4 h-4 text-green-500" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(position)}
                              title="Edit posisi"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePosition(position.id)}
                              title="Hapus posisi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        application={selectedApplication}
        isOpen={detailDialogOpen && selectedApplication !== null}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedApplication(null);
        }}
        isAdmin={true}
        onDelete={() => setDeleteDialogOpen(true)}
        isDeleting={isDeleting}
        onStatusUpdated={() => {
          fetchData();
          setDetailDialogOpen(false);
          setSelectedApplication(null);
        }}
      />

      {/* Status Update Modal */}
      <StatusUpdateModal
        applicationId={selectedApplicationId}
        isOpen={statusUpdateDialogOpen}
        onClose={() => {
          setStatusUpdateDialogOpen(false);
          setSelectedApplicationId(null);
        }}
        onStatusUpdated={(updatedApplication) => {
          // Optimistic update: update aplikasi di state dan stats
          const updatedApplications = applications.map(app => 
            app.id === updatedApplication.id 
              ? updatedApplication 
              : app
          );
          setApplications(updatedApplications);
          setStats(calculateStats(updatedApplications));
          setStatusUpdateDialogOpen(false);
          setSelectedApplicationId(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Hapus Pengajuan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengajuan ini?
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
              onClick={() => setDeleteDialogOpen(false)}
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

      {/* Add/Edit Position Dialog */}
      <Dialog
        open={addPositionDialogOpen || editPosition !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAddPositionDialogOpen(false);
            setEditPosition(null);
            setNewPosition({
              title: '',
              department: '',
              description: '',
              requirements: '',
              quota: 5,
              duration: '3 bulan',
              applicant_type: 'both',
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#004AAD] text-xl">
              {editPosition ? 'Edit Posisi Magang' : 'Tambah Posisi Magang Baru'}
            </DialogTitle>
            <DialogDescription>
              Isi semua kolom yang ditandai dengan (*) untuk melengkapi data posisi
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Info Dasar Section */}
            <div>
              <h4 className="text-sm font-semibold text-[#004AAD] mb-4 pb-2 border-b">Informasi Dasar</h4>
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Judul Posisi *</Label>
                  <Input
                    value={newPosition.title}
                    onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
                    placeholder="Contoh: Staff Administrasi, Koordinator Program, dll"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="font-medium">Divisi/Departemen *</Label>
                  <Input
                    value={newPosition.department}
                    onChange={(e) => setNewPosition({ ...newPosition, department: e.target.value })}
                    placeholder="Contoh: Pelayanan Umum, IT, Keuangan, dll"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Detail Posisi Section */}
            <div>
              <h4 className="text-sm font-semibold text-[#004AAD] mb-4 pb-2 border-b">Detail Posisi</h4>
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Deskripsi Singkat *</Label>
                  <Textarea
                    value={newPosition.description}
                    onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
                    placeholder="Jelaskan tugas dan tanggung jawab utama posisi ini..."
                    rows={3}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="font-medium">Persyaratan & Kualifikasi *</Label>
                  <Textarea
                    value={newPosition.requirements}
                    onChange={(e) => setNewPosition({ ...newPosition, requirements: e.target.value })}
                    placeholder="Tuliskan persyaratan (gunakan enter untuk setiap item baru)"
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Pengaturan Posisi Section */}
            <div>
              <h4 className="text-sm font-semibold text-[#004AAD] mb-4 pb-2 border-b">Pengaturan Posisi</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="font-medium">Kuota Tersedia *</Label>
                  <div className="flex gap-2 mt-2">
                    <Select
                      value={newPosition.quota === null || newPosition.quota === undefined || newPosition.quota === 0 ? 'unlimited' : 'limited'}
                      onValueChange={(value) => {
                        if (value === 'unlimited') {
                          setNewPosition({ ...newPosition, quota: 0 });
                        } else {
                          setNewPosition({ ...newPosition, quota: 5 });
                        }
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unlimited">Tak Terbatas</SelectItem>
                        <SelectItem value="limited">Terbatas</SelectItem>
                      </SelectContent>
                    </Select>
                    {newPosition.quota !== null && newPosition.quota !== undefined && newPosition.quota !== 0 && (
                      <Input
                        type="number"
                        value={newPosition.quota}
                        onChange={(e) => setNewPosition({ ...newPosition, quota: parseInt(e.target.value) || 0 })}
                        placeholder="Jumlah"
                        min={1}
                        className="flex-1"
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Banyak mahasiswa/pelajar yang bisa diterima</p>
                </div>
                <div>
                  <Label className="font-medium">Durasi Magang *</Label>
                  <Select
                    value={newPosition.duration}
                    onValueChange={(value) => setNewPosition({ ...newPosition, duration: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 bulan">1 Bulan</SelectItem>
                      <SelectItem value="2 bulan">2 Bulan</SelectItem>
                      <SelectItem value="3 bulan">3 Bulan</SelectItem>
                      <SelectItem value="4 bulan">4 Bulan</SelectItem>
                      <SelectItem value="5 bulan">5 Bulan</SelectItem>
                      <SelectItem value="6 bulan">6 Bulan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-medium">Tipe Pelamar *</Label>
                  <Select
                    value={newPosition.applicant_type}
                    onValueChange={(value) => setNewPosition({ ...newPosition, applicant_type: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Mahasiswa & Pelajar</SelectItem>
                      <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                      <SelectItem value="pelajar">Pelajar</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Siapa saja yang boleh melamar</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button
              variant="outline"
              onClick={() => {
                setAddPositionDialogOpen(false);
                setEditPosition(null);
              }}
              disabled={savingPosition}
            >
              Batal
            </Button>
            <Button
              onClick={editPosition ? handleEditPosition : handleAddPosition}
              disabled={savingPosition}
              className="bg-[#004AAD] hover:bg-[#003580]"
            >
              {savingPosition ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editPosition ? 'Update Posisi' : 'Simpan Posisi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
