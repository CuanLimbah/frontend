import { useState } from 'react';
import { Wallet, ArrowDown, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getErrorMessage, type CreateWithdrawalPayload } from '../../lib/api';

type WithdrawalMethod = CreateWithdrawalPayload['method'];

const WITHDRAWAL_METHODS: Array<{ value: WithdrawalMethod; label: string }> = [
  { value: 'gopay', label: 'GoPay' },
  { value: 'ovo', label: 'OVO' },
  { value: 'dana', label: 'DANA' },
  { value: 'bank', label: 'Transfer Bank' },
];

interface WalletCardProps {
  balance: number;
  isSubmitting?: boolean;
  onWithdraw: (payload: CreateWithdrawalPayload) => Promise<void>;
}

export function WalletCard({
  balance,
  isSubmitting = false,
  onWithdraw,
}: WalletCardProps) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<WithdrawalMethod>('gopay');
  const [account, setAccount] = useState('');
  const isBankTransfer = method === 'bank';

  const handleWithdraw = async () => {
    try {
      await onWithdraw({
        amount: Number(amount),
        method,
        account,
      });

      toast.success(
        `Simulasi penarikan Rp ${parseFloat(amount).toLocaleString('id-ID')} berhasil diajukan.`,
      );
      setShowWithdrawModal(false);
      setAmount('');
      setAccount('');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal mengajukan simulasi penarikan dana.'));
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <div className="p-4 sm:p-8 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-gray-400">
                <span>Saldo Wallet Anda</span>
                <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                  Mode demo
                </span>
              </div>
              <div className="text-2xl sm:text-4xl text-white">
                Rp {balance.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={balance <= 0}
            className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <ArrowDown className="w-5 h-5" />
            <span>Ajukan Simulasi Penarikan</span>
          </button>
        </div>

        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-white mb-4">Informasi Wallet</h3>
          <ul className="space-y-3 text-gray-400">
            <li>- Minimal penarikan: Rp 10.000</li>
            <li>- Saldo langsung ditahan saat status pending</li>
            <li>- Admin hanya menandai berhasil/ditolak untuk demo</li>
            <li>- Tidak ada transfer asli atau API payment pihak ketiga</li>
          </ul>
        </div>
      </div>

      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWithdrawModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0f] border border-green-500/30 rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl text-white">Simulasi Tarik Dana</h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Pengajuan ini hanya masuk antrean admin, belum mengirim dana asli.
                  </p>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="mb-5 flex gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-100">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
                <div>
                  Mode demo: saldo akan dicatat sebagai withdrawal pending. Admin dapat
                  menyetujui atau menolak tanpa koneksi ke Duitku, Midtrans, atau provider lain.
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-white mb-2">Jumlah Penarikan</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Minimal Rp 10.000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                />
                <div className="text-gray-400 text-sm mt-1">
                  Maksimal: Rp {balance.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-white mb-2">Metode Penarikan</label>
                <div className="grid grid-cols-2 gap-2">
                  {WITHDRAWAL_METHODS.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setMethod(item.value)}
                      className={`
                        py-2 px-4 rounded-lg border transition-all
                        ${method === item.value
                          ? 'border-green-500 bg-green-500/10 text-green-500'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                        }
                      `}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white mb-2">
                  {isBankTransfer ? 'Nomor Rekening' : 'Nomor HP E-Wallet'}
                </label>
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder={isBankTransfer ? '1234567890' : '08123456789'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                />
              </div>

              <button
                onClick={() => void handleWithdraw()}
                disabled={
                  isSubmitting ||
                  !amount ||
                  parseFloat(amount) < 10000 ||
                  parseFloat(amount) > balance ||
                  !account
                }
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? 'Memproses...' : 'Ajukan Simulasi Penarikan'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
