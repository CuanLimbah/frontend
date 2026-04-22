import { useState } from 'react';
import { Users, TrendingUp, Package, DollarSign, CheckSquare, Settings } from 'lucide-react';
import { VerificationQueue } from '../components/admin/VerificationQueue';
import { PriceCatalog } from '../components/admin/PriceCatalog';
import { UserManagement } from '../components/admin/UserManagement';
import { WithdrawalPanel } from '../components/admin/WithdrawalPanel';
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';
import { mockAdminStats } from '../lib/mockData';
import { motion } from 'motion/react';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'verification' | 'prices' | 'users' | 'withdrawals' | 'analytics'>('verification');

  const tabs = [
    { id: 'verification' as const, label: 'Verifikasi', icon: CheckSquare },
    { id: 'prices' as const, label: 'Harga Limbah', icon: Settings },
    { id: 'users' as const, label: 'User Management', icon: Users },
    { id: 'withdrawals' as const, label: 'Penarikan Dana', icon: DollarSign },
    { id: 'analytics' as const, label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <h1 className="text-3xl text-white mb-6">Admin Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Users</span>
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl text-white">
                {mockAdminStats.total_users}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Limbah (KG)</span>
                <Package className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl text-white">
                {mockAdminStats.total_waste_collected.toLocaleString('id-ID')}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Cuan</span>
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl text-white">
                Rp {(mockAdminStats.total_cuan_distributed / 1000000).toFixed(1)}Jt
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Pending Verif.</span>
                <CheckSquare className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-3xl text-white">
                {mockAdminStats.pending_verifications}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Pending Withdrawal</span>
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-3xl text-white">
                {mockAdminStats.pending_withdrawals}
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
          {activeTab === 'verification' && <VerificationQueue />}
          {activeTab === 'prices' && <PriceCatalog />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'withdrawals' && <WithdrawalPanel />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
        </motion.div>
      </div>
    </div>
  );
}
