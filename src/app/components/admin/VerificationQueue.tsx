import { useState } from 'react';
import { CheckCircle, XCircle, Package, Image as ImageIcon } from 'lucide-react';
import type { WasteSubmission } from '../../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/api';

interface VerificationQueueProps {
  submissions: WasteSubmission[];
  onApprove: (submissionId: string, actualWeight: number) => Promise<void>;
  onReject: (submissionId: string, reason: string) => Promise<void>;
}

export function VerificationQueue({
  submissions,
  onApprove,
  onReject,
}: VerificationQueueProps) {
  const [actualWeight, setActualWeight] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (submissionId: string) => {
    const weight = actualWeight[submissionId];
    if (!weight || parseFloat(weight) <= 0) {
      toast.error('Masukkan berat aktual terlebih dahulu.');
      return;
    }

    try {
      setProcessingId(submissionId);
      await onApprove(submissionId, parseFloat(weight));
      setActualWeight((prev) => ({ ...prev, [submissionId]: '' }));
      toast.success(`Setoran berhasil diverifikasi dengan berat ${weight} KG.`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal memverifikasi setoran.'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (submissionId: string) => {
    const reason = prompt('Alasan penolakan:');
    if (!reason) return;

    try {
      setProcessingId(submissionId);
      await onReject(submissionId, reason);
      toast.success('Setoran ditolak.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal menolak setoran.'));
    } finally {
      setProcessingId(null);
    }
  };

  const getWasteTypeLabel = (type: WasteSubmission['waste_type']) => {
    const labels = {
      food: 'Sampah Sisa Makanan',
      oil: 'Minyak Jelantah',
    };
    return labels[type];
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl text-white mb-6">Antrian Verifikasi</h2>

      {submissions.length === 0 ? (
        <div className="p-12 rounded-xl bg-white/5 border border-white/10 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Tidak ada setoran yang perlu diverifikasi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10"
            >
              <div className="grid md:grid-cols-3 gap-6">
                {/* Submission Info */}
                <div className="md:col-span-1">
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">ID Setoran</div>
                    <div className="text-white font-mono">#{submission.id}</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Jenis Limbah</div>
                    <div className="text-white">{getWasteTypeLabel(submission.waste_type)}</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Estimasi Berat</div>
                    <div className="text-white">{submission.estimated_weight} KG</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Waktu Submit</div>
                    <div className="text-white">
                      {format(new Date(submission.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                <div className="md:col-span-1">
                  <div className="aspect-square rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    {submission.image_url ? (
                      <img
                        src={submission.image_url}
                        alt="Waste"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No image</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="md:col-span-1">
                  <div className="mb-6">
                    <label className="block text-white mb-2">Berat Aktual (KG)</label>
                    <input
                      type="number"
                      value={actualWeight[submission.id] || ''}
                      onChange={(e) => setActualWeight(prev => ({ ...prev, [submission.id]: e.target.value }))}
                      placeholder="0.0"
                      step="0.1"
                      min="0"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => void handleApprove(submission.id)}
                      disabled={processingId === submission.id}
                      className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>
                        {processingId === submission.id ? 'Memproses...' : 'Approve & Verify'}
                      </span>
                    </button>

                    <button
                      onClick={() => void handleReject(submission.id)}
                      disabled={processingId === submission.id}
                      className="w-full py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
