import { Transaction } from '../../types';
import { ArrowUp, ArrowDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusLabel = (transaction: Transaction) => {
    if (transaction.type === 'withdrawal') {
      switch (transaction.status) {
        case 'completed':
          return 'Selesai Demo';
        case 'pending':
          return 'Menunggu Admin';
        case 'rejected':
          return 'Ditolak';
      }
    }

    switch (transaction.status) {
      case 'completed':
        return 'Berhasil';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Ditolak';
    }
  };

  const getWithdrawalMethodLabel = (method?: Transaction['withdrawal_method']) => {
    if (method === 'bank') {
      return 'Transfer Bank';
    }

    return method ? method.toUpperCase() : 'Simulasi Penarikan';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl text-white mb-6">Riwayat Transaksi</h2>

      {transactions.length === 0 ? (
        <div className="p-12 rounded-xl bg-white/5 border border-white/10 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-gray-400">Tanggal</th>
                <th className="px-6 py-4 text-left text-sm text-gray-400">Tipe</th>
                <th className="px-6 py-4 text-left text-sm text-gray-400">Jumlah</th>
                <th className="px-6 py-4 text-left text-sm text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm text-gray-400">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="bg-white/5 hover:bg-white/10 transition-colors">
                  <td className="px-6 py-4 text-white">
                    {format(new Date(transaction.created_at), 'dd MMM yyyy', { locale: id })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {transaction.type === 'deposit' ? (
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                          <ArrowDown className="w-4 h-4 text-green-500" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <ArrowUp className="w-4 h-4 text-blue-400" />
                        </div>
                      )}
                      <span className="text-white">
                        {transaction.type === 'deposit' ? 'Deposit' : 'Penarikan'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={transaction.type === 'deposit' ? 'text-green-500' : 'text-blue-400'}>
                      {transaction.type === 'deposit' ? '+' : '-'}Rp {transaction.amount.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      <span className="text-white text-sm">{getStatusLabel(transaction)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {transaction.type === 'withdrawal' && transaction.withdrawal_method ? (
                      <span>
                        Simulasi {getWithdrawalMethodLabel(transaction.withdrawal_method)}
                        {transaction.withdrawal_account ? ` - ${transaction.withdrawal_account}` : ''}
                      </span>
                    ) : (
                      <span>Setoran Limbah</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
