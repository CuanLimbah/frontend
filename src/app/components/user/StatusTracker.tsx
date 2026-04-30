import { WasteSubmission } from '../../types';
import { CheckCircle, Clock, XCircle, Package } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface StatusTrackerProps {
  submissions: WasteSubmission[];
}

export function StatusTracker({ submissions }: StatusTrackerProps) {
  const getStatusIcon = (status: WasteSubmission['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'verified':
        return <CheckCircle className="w-6 h-6 text-blue-400" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-400" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-400" />;
    }
  };

  const getStatusLabel = (status: WasteSubmission['status']) => {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'verified':
        return 'Terverifikasi';
      case 'pending':
        return 'Menunggu Verifikasi';
      case 'rejected':
        return 'Ditolak';
    }
  };

  const getStatusColor = (status: WasteSubmission['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500/30 bg-green-500/10';
      case 'verified':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'pending':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'rejected':
        return 'border-red-500/30 bg-red-500/10';
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
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl text-white mb-6">Status Setoran Limbah</h2>

      {submissions.length === 0 ? (
        <div className="p-12 rounded-xl bg-white/5 border border-white/10 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Belum ada setoran limbah</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className={`p-6 rounded-xl border ${getStatusColor(submission.status)}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="flex items-start gap-4">
                  {getStatusIcon(submission.status)}
                  <div>
                    <h3 className="text-base sm:text-lg text-white mb-1">
                      {getWasteTypeLabel(submission.waste_type)}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {format(new Date(submission.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                    </p>
                  </div>
                </div>
                <div className="sm:text-right pl-10 sm:pl-0">
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                    {getStatusLabel(submission.status)}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-10 space-y-4 border-l-2 border-white/10 ml-3">
                <div>
                  <div className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0a0a0f]" />
                  <div className="text-sm text-gray-400">Setoran dibuat</div>
                  <div className="text-white">
                    Estimasi: {submission.estimated_weight} KG
                  </div>
                </div>

                {submission.verified_at && (
                  <div>
                    <div className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-400 border-2 border-[#0a0a0f]" />
                    <div className="text-sm text-gray-400">Terverifikasi</div>
                    <div className="text-white">
                      Berat Aktual: {submission.actual_weight} KG
                    </div>
                  </div>
                )}

                {submission.completed_at && (
                  <div>
                    <div className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0a0a0f]" />
                    <div className="text-sm text-gray-400">Selesai</div>
                    <div className="text-green-500">
                      +Rp {submission.earnings?.toLocaleString('id-ID')}
                    </div>
                  </div>
                )}

                {submission.status === 'rejected' && (
                  <div>
                    <div className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-red-400 border-2 border-[#0a0a0f]" />
                    <div className="text-sm text-gray-400">Ditolak</div>
                    {submission.notes && (
                      <div className="text-red-400 text-sm">{submission.notes}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
