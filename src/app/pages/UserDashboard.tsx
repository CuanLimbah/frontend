import { useState } from 'react';
import { Wallet, Upload, TrendingUp, MapPin, Clock, FileText } from 'lucide-react';
import { WasteSubmissionForm } from '../components/user/WasteSubmissionForm';
import { WalletCard } from '../components/user/WalletCard';
import { StatusTracker } from '../components/user/StatusTracker';
import { DropPointList } from '../components/user/DropPointList';
import { TransactionHistory } from '../components/user/TransactionHistory';
import { mockUserStats, mockSubmissions, mockTransactions } from '../lib/mockData';
import { motion } from 'motion/react';

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState<'submit' | 'wallet' | 'status' | 'droppoints' | 'history'>('submit');

  const tabs = [
    { id: 'submit' as const, label: 'Setor Limbah', icon: Upload },
    { id: 'wallet' as const, label: 'Wallet', icon: Wallet },
    { id: 'status' as const, label: 'Status Setoran', icon: Clock },
    { id: 'droppoints' as const, label: 'Drop Point', icon: MapPin },
    { id: 'history' as const, label: 'Riwayat', icon: FileText },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <h1 className="text-3xl text-white mb-6">Dashboard Saya</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Cuan</span>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl text-white">
                Rp {mockUserStats.total_earnings.toLocaleString('id-ID')}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Saldo Wallet</span>
                <Wallet className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl text-white">
                Rp {mockUserStats.current_balance.toLocaleString('id-ID')}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Setoran</span>
                <Upload className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl text-white">
                {mockUserStats.total_submissions}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Berat (KG)</span>
                <FileText className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-3xl text-white">
                {mockUserStats.total_weight.toFixed(1)} KG
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg transition-all
                  ${activeTab === tab.id
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }
                `}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'submit' && <WasteSubmissionForm />}
          {activeTab === 'wallet' && <WalletCard balance={mockUserStats.current_balance} />}
          {activeTab === 'status' && <StatusTracker submissions={mockSubmissions} />}
          {activeTab === 'droppoints' && <DropPointList />}
          {activeTab === 'history' && <TransactionHistory transactions={mockTransactions} />}
        </motion.div>
      </div>
    </div>
  );
}
