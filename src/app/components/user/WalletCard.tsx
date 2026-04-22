import { useState } from 'react';
import { Wallet, ArrowDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WalletCardProps {
  balance: number;
}

export function WalletCard({ balance }: WalletCardProps) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'gopay' | 'ovo' | 'dana' | 'bank'>('gopay');
  const [account, setAccount] = useState('');

  const handleWithdraw = () => {
    // Will be replaced with Supabase transaction
    alert(`Permintaan penarikan Rp ${parseFloat(amount).toLocaleString('id-ID')} berhasil! Akan diproses dalam 1x24 jam.`);
    setShowWithdrawModal(false);
    setAmount('');
    setAccount('');
  };

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className="text-gray-400">Saldo Wallet Anda</div>
              <div className="text-4xl text-white">
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
            <span>Tarik Dana</span>
          </button>
        </div>

        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-white mb-4">Informasi Wallet</h3>
          <ul className="space-y-3 text-gray-400">
            <li>• Minimal penarikan: Rp 10.000</li>
            <li>• Proses penarikan: 1x24 jam kerja</li>
            <li>• Tanpa biaya admin untuk semua metode</li>
            <li>• Tersedia: GoPay, OVO, DANA, Transfer Bank</li>
          </ul>
        </div>
      </div>

      {/* Withdrawal Modal */}
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-white">Tarik Dana</h2>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
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
                  {['gopay', 'ovo', 'dana', 'bank'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m as typeof method)}
                      className={`
                        py-2 px-4 rounded-lg border transition-all capitalize
                        ${method === m
                          ? 'border-green-500 bg-green-500/10 text-green-500'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                        }
                      `}
                    >
                      {m === 'bank' ? 'Transfer Bank' : m.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white mb-2">
                  {method === 'bank' ? 'Nomor Rekening' : 'Nomor HP'}
                </label>
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder={method === 'bank' ? '1234567890' : '08123456789'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleWithdraw}
                disabled={!amount || parseFloat(amount) < 10000 || parseFloat(amount) > balance || !account}
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
              >
                Ajukan Penarikan
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
