import { useEffect, useState } from 'react';
import { Wallet, Upload, TrendingUp, MapPin, Clock, FileText } from 'lucide-react';
import { Navigate } from 'react-router';
import { WasteSubmissionForm } from '../components/user/WasteSubmissionForm';
import { WalletCard } from '../components/user/WalletCard';
import { StatusTracker } from '../components/user/StatusTracker';
import { DropPointList } from '../components/user/DropPointList';
import { TransactionHistory } from '../components/user/TransactionHistory';
import { motion } from 'motion/react';
import {
  api,
  ApiError,
  type CreateSubmissionPayload,
  type CreateWithdrawalPayload,
  getErrorMessage,
} from '../lib/api';
import { useAuth } from '../providers/AuthProvider';
import type { UserDashboardData } from '../types';
import { PageErrorState, PageLoader } from '../components/common/PageState';

export function UserDashboard() {
  const { user, accessToken, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'submit' | 'wallet' | 'status' | 'droppoints' | 'history'>('submit');
  const [dashboard, setDashboard] = useState<UserDashboardData | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmittingWaste, setIsSubmittingWaste] = useState(false);
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

  const tabs = [
    { id: 'submit' as const, label: 'Setor Limbah', icon: Upload },
    { id: 'wallet' as const, label: 'Wallet', icon: Wallet },
    { id: 'status' as const, label: 'Status Setoran', icon: Clock },
    { id: 'droppoints' as const, label: 'Drop Point', icon: MapPin },
    { id: 'history' as const, label: 'Riwayat', icon: FileText },
  ];

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!accessToken || user?.role !== 'user') {
      setIsLoadingDashboard(false);
      return;
    }

    let isMounted = true;

    async function loadDashboard() {
      try {
        setIsLoadingDashboard(true);
        setErrorMessage(null);
        const response = await api.getUserDashboard(accessToken);

        if (isMounted) {
          setDashboard(response);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
        }

        if (isMounted) {
          setErrorMessage(getErrorMessage(error, 'Gagal memuat dashboard user.'));
        }
      } finally {
        if (isMounted) {
          setIsLoadingDashboard(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [accessToken, authLoading, logout, user?.role]);

  const refreshDashboard = async () => {
    if (!accessToken) {
      return;
    }

    const response = await api.getUserDashboard(accessToken);
    setDashboard(response);
  };

  const handleCreateSubmission = async (payload: CreateSubmissionPayload) => {
    if (!accessToken) {
      throw new Error('Sesi login tidak ditemukan.');
    }

    setIsSubmittingWaste(true);

    try {
      await api.createSubmission(accessToken, payload);
      await refreshDashboard();
      setActiveTab('status');
    } finally {
      setIsSubmittingWaste(false);
    }
  };

  const handleCreateWithdrawal = async (payload: CreateWithdrawalPayload) => {
    if (!accessToken) {
      throw new Error('Sesi login tidak ditemukan.');
    }

    setIsSubmittingWithdrawal(true);

    try {
      await api.createWithdrawal(accessToken, payload);
      await refreshDashboard();
      setActiveTab('history');
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!authLoading && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (!authLoading && user?.role === 'driver') {
    return <Navigate to="/driver" replace />;
  }

  if (authLoading || isLoadingDashboard) {
    return <PageLoader message="Memuat dashboard user..." />;
  }

  if (!dashboard) {
    return (
      <PageErrorState
        title="Dashboard User Gagal Dimuat"
        message={errorMessage ?? 'Dashboard user tidak dapat dimuat.'}
      />
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <h1 className="text-3xl text-white mb-6">Dashboard Saya</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs sm:text-sm">Total Cuan</span>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-xl sm:text-3xl text-white">
                Rp {dashboard.stats.total_earnings.toLocaleString('id-ID')}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs sm:text-sm">Saldo Wallet</span>
                <Wallet className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-xl sm:text-3xl text-white">
                Rp {dashboard.stats.current_balance.toLocaleString('id-ID')}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs sm:text-sm">Total Setoran</span>
                <Upload className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-xl sm:text-3xl text-white">
                {dashboard.stats.total_submissions}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs sm:text-sm">Total Berat (KG)</span>
                <FileText className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-xl sm:text-3xl text-white">
                {dashboard.stats.total_weight.toFixed(1)} KG
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                className={`
                  flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-lg transition-all shrink-0
                  ${activeTab === tab.id
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }
                `}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-sm">{tab.label}</span>
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
          {activeTab === 'submit' && (
            <WasteSubmissionForm
              prices={dashboard.waste_prices}
              dropPoints={dashboard.drop_points}
              isSubmitting={isSubmittingWaste}
              onSubmit={handleCreateSubmission}
            />
          )}
          {activeTab === 'wallet' && (
            <WalletCard
              balance={dashboard.stats.current_balance}
              isSubmitting={isSubmittingWithdrawal}
              onWithdraw={handleCreateWithdrawal}
            />
          )}
          {activeTab === 'status' && <StatusTracker submissions={dashboard.submissions} />}
          {activeTab === 'droppoints' && <DropPointList dropPoints={dashboard.drop_points} />}
          {activeTab === 'history' && (
            <TransactionHistory transactions={dashboard.transactions} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
