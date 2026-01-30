import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';
import { applicationsAPI } from '../services/api';
import { toast } from 'sonner';

interface StatusUpdateModalProps {
  applicationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: (updatedApplication: any) => void;
}

export function StatusUpdateModal({ 
  applicationId, 
  isOpen, 
  onClose, 
  onStatusUpdated 
}: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<'review' | 'accepted' | 'rejected' | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async () => {
    if (!applicationId || !selectedStatus) return;

    try {
      setLoading(true);
      const response = await applicationsAPI.updateStatus(
        applicationId,
        selectedStatus,
        statusNotes
      );

      if (response.success) {
        toast.success(`Status diubah menjadi ${selectedStatus === 'review' ? 'Sedang Ditinjau' : selectedStatus === 'accepted' ? 'Diterima' : 'Ditolak'}`);
        // Pass updated application data to parent
        if (onStatusUpdated && response.data) {
          onStatusUpdated(response.data);
        }
        handleClose();
      } else {
        toast.error(response.message || 'Gagal mengubah status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengubah status');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus(null);
    setStatusNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                  disabled={loading}
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
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            disabled={!selectedStatus || loading}
            className="bg-[#004AAD] hover:bg-[#003580] text-white"
            onClick={handleStatusUpdate}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Status'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
