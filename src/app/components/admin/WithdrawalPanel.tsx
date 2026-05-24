import { CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/api';
import type { AdminWithdrawals } from '../../types';

interface WithdrawalPanelProps {
  requests: AdminWithdrawals;
  onApprove: (withdrawalId: string) => Promise<void>;
  onReject: (withdrawalId: string, reason: string) => Promise<void>;
}

export function WithdrawalPanel({
  requests,
  onApprove,
  onReject,
}: WithdrawalPanelProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await onApprove(requestId);
      toast.success('Simulasi penarikan ditandai berhasil.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal menyetujui penarikan.'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt('Alasan penolakan:');
    if (!reason) return;

    try {
      setProcessingId(requestId);
      await onReject(requestId, reason);
      toast.success('Simulasi penarikan ditolak.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal menolak penarikan.'));
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = requests.pending;
  const processedRequests = requests.processed;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl text-white">Panel Penarikan Dana</h2>
          <p className="mt-2 text-sm text-gray-400">
            Mode simulasi: approval hanya mengubah status wallet, tidak memanggil API third-party.
          </p>
        </div>
        <span className="w-fit rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
          Demo payout
        </span>
      </div>

      {/* Pending Requests */}
      <div className="mb-8">
        <h3 className="text-xl text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-400" />
          Menunggu Persetujuan ({pendingRequests.length})
        </h3>

        {pendingRequests.length === 0 ? (
          <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Tidak ada permintaan penarikan yang pending</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="p-6 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">User</div>
                        <div className="text-white">{request.user_name}</div>
                        <div className="text-gray-400 text-sm">{request.user_email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Jumlah</div>
                        <div className="text-2xl text-green-500">
                          Rp {request.amount.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Metode</div>
                        <div className="text-white">{request.method}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Akun Tujuan</div>
                        <div className="text-white font-mono">{request.account}</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-400 mb-1">Waktu Request</div>
                      <div className="text-white">
                        {format(new Date(request.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => void handleApprove(request.id)}
                      disabled={processingId === request.id}
                      className="py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>
                        {processingId === request.id ? 'Memproses...' : 'Tandai Berhasil'}
                      </span>
                    </button>

                    <button
                      onClick={() => void handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div>
          <h3 className="text-xl text-white mb-4">Riwayat Proses</h3>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-400">User</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-400">Jumlah</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-400">Metode</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-400">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {processedRequests.map((request) => (
                  <tr key={request.id} className="bg-white/5">
                    <td className="px-6 py-4">
                      <div className="text-white">{request.user_name}</div>
                      <div className="text-gray-400 text-sm">{request.user_email}</div>
                    </td>
                    <td className="px-6 py-4 text-white">
                      Rp {request.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-white">{request.method}</td>
                    <td className="px-6 py-4">
                      {request.status === 'completed' ? (
                        <span className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="w-4 h-4" />
                          Selesai Demo
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-red-400">
                          <XCircle className="w-4 h-4" />
                          Ditolak
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {format(new Date(request.created_at), 'dd MMM yyyy', { locale: id })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
