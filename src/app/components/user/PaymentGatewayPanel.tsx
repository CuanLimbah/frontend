import { useEffect, useState } from 'react';
import { CreditCard, ExternalLink, QrCode, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import {
  getErrorMessage,
  type CreatePaymentPayload,
} from '../../lib/api';
import type { PaymentMethod, PaymentRecord } from '../../types';

interface PaymentGatewayPanelProps {
  payments: PaymentRecord[];
  isSubmitting?: boolean;
  onCreatePayment: (payload: CreatePaymentPayload) => Promise<PaymentRecord>;
  onRefresh: () => Promise<void>;
}

const methods: Array<{
  id: PaymentMethod;
  label: string;
  icon: typeof QrCode;
}> = [
  { id: 'qris', label: 'QRIS', icon: QrCode },
  { id: 'virtual_account', label: 'Virtual Account', icon: CreditCard },
  { id: 'ewallet', label: 'E-Wallet', icon: WalletCards },
];

export function PaymentGatewayPanel({
  payments,
  isSubmitting = false,
  onCreatePayment,
  onRefresh,
}: PaymentGatewayPanelProps) {
  const [amount, setAmount] = useState('25000');
  const [method, setMethod] = useState<PaymentMethod>('qris');
  const [purpose, setPurpose] = useState('pickup_service');

  useEffect(() => {
    void onRefresh();
  }, [onRefresh]);

  const handleCreatePayment = async () => {
    try {
      const payment = await onCreatePayment({
        amount: Number(amount),
        method,
        purpose,
      });
      toast.success('Pembayaran berhasil dibuat.');
      window.open(payment.checkout_url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal membuat pembayaran.'));
    }
  };

  return (
    <div className="grid lg:grid-cols-[420px_1fr] gap-6">
      <section className="p-6 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-5 h-5 text-green-400" />
          <h2 className="text-xl text-white">Payment Gateway</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Nominal Pembayaran</label>
            <input
              type="number"
              min="10000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Tujuan Pembayaran</label>
            <select
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-green-500 focus:outline-none"
            >
              <option value="pickup_service">Biaya layanan penjemputan</option>
              <option value="subscription">Langganan layanan UMKM</option>
              <option value="other">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-white mb-2">Metode</label>
            <div className="grid gap-2">
              {methods.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setMethod(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      method === item.id
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => void handleCreatePayment()}
            disabled={isSubmitting || Number(amount) < 10000}
            className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            <span>{isSubmitting ? 'Membuat...' : 'Buat Pembayaran'}</span>
          </button>
        </div>
      </section>

      <section className="p-6 rounded-xl bg-white/5 border border-white/10">
        <h2 className="text-xl text-white mb-5">Riwayat Pembayaran</h2>
        <div className="space-y-3">
          {payments.length === 0 ? (
            <p className="text-gray-400">Belum ada pembayaran.</p>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="p-4 rounded-lg bg-black/20 border border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-white">
                      Rp {payment.amount.toLocaleString('id-ID')} - {payment.method}
                    </div>
                    <div className="text-sm text-gray-400">
                      {payment.purpose} - {new Date(payment.created_at).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      payment.status === 'paid'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
                <a
                  href={payment.checkout_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300"
                >
                  <ExternalLink className="w-4 h-4" />
                  Buka checkout
                </a>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
