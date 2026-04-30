import { useEffect, useState } from 'react';
import { Users, TrendingUp, Package, DollarSign, CheckSquare, Settings, Truck } from 'lucide-react';
import { Navigate } from 'react-router';
import { VerificationQueue } from '../components/admin/VerificationQueue';
import { PriceCatalog } from '../components/admin/PriceCatalog';
import { UserManagement } from '../components/admin/UserManagement';
import { WithdrawalPanel } from '../components/admin/WithdrawalPanel';
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';
import { DriverOperations } from '../components/admin/DriverOperations';
import { motion } from 'motion/react';
import {
  api,
  ApiError,
  getErrorMessage,
  type AssignPickupRoutePayload,
  type CreateDriverPayload,
} from '../lib/api';
import { useAuth } from '../providers/AuthProvider';
import type { AdminDashboardData } from '../types';
import { PageErrorState, PageLoader } from '../components/common/PageState';

export function AdminDashboard() {
  const { user, accessToken, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'verification' | 'prices' | 'users' | 'drivers' | 'withdrawals' | 'analytics'>('verification');
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tabs = [
    { id: 'verification' as const, label: 'Verifikasi', icon: CheckSquare },
    { id: 'prices' as const, label: 'Harga Limbah', icon: Settings },
    { id: 'users' as const, label: 'User Management', icon: Users },
    { id: 'drivers' as const, label: 'Driver & Rute', icon: Truck },
    { id: 'withdrawals' as const, label: 'Penarikan Dana', icon: DollarSign },
    { id: 'analytics' as const, label: 'Analytics', icon: TrendingUp },
  ];

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!accessToken || user?.role !== 'admin') {
      setIsLoadingDashboard(false);
      return;
    }

    let isMounted = true;

    async function loadDashboard() {
      try {
        setIsLoadingDashboard(true);
        setErrorMessage(null);
        const response = await api.getAdminDashboard(accessToken);

        if (isMounted) {
          setDashboard(response);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
        }

        if (isMounted) {
          setErrorMessage(getErrorMessage(error, 'Gagal memuat dashboard admin.'));
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

    const response = await api.getAdminDashboard(accessToken);
    setDashboard(response);
  };

  const handleApproveSubmission = async (submissionId: string, actualWeight: number) => {
    if (!accessToken) {
      throw new Error('Sesi admin tidak ditemukan.');
    }

    await api.verifySubmission(accessToken, submissionId, actualWeight);
    await refreshDashboard();
  };

  const handleRejectSubmission = async (submissionId: string, reason: string) => {
    if (!accessToken) {
      throw new Error('Sesi admin tidak ditemukan.');
    }

    await api.rejectSubmission(accessToken, submissionId, reason);
    await refreshDashboard();
  };

  const handleSavePrice = async (priceId: string, pricePerKg: number) => {
    if (!accessToken) {
      throw new Error('Sesi admin tidak ditemukan.');
    }

    await api.updatePrice(accessToken, priceId, pricePerKg);
    await refreshDashboard();
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    if (!accessToken) {
      throw new Error('Sesi admin tidak ditemukan.');
    }

    await api.approveWithdrawal(accessToken, withdrawalId);
    await refreshDashboard();
  };

  const handleRejectWithdrawal = async (withdrawalId: string, reason: string) => {
    if (!accessToken) {
      throw new Error('Sesi admin tidak ditemukan.');
    }

    await api.rejectWithdrawal(accessToken, withdrawalId, reason);
    await refreshDashboard();
  };

  const handleCreateDriver = async (payload: CreateDriverPayload) => {
    if (!accessToken) {
      throw new Error('Sesi admin tidak ditemukan.');
    }

    await api.createDriver(accessToken, payload);
    await refreshDashboard();
  };

  const handleAssignRoute = async (payload: AssignPickupRoutePayload) => {
    if (!accessToken) {
      throw new Error('Sesi admin tidak ditemukan.');
    }

    await api.assignPickupRoute(accessToken, payload);
    await refreshDashboard();
  };

  const handleMarkPaymentPaid = async (paymentId: string) => {
    if (!accessToken) {
      throw new Error('Sesi admin tidak ditemukan.');
    }

    await api.markPaymentPaid(accessToken, paymentId);
    await refreshDashboard();
  };

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!authLoading && user?.role === 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!authLoading && user?.role === 'driver') {
    return <Navigate to="/driver" replace />;
  }

  if (authLoading || isLoadingDashboard) {
    return <PageLoader message="Memuat dashboard admin..." />;
  }

  if (!dashboard) {
    return (
      <PageErrorState
        title="Dashboard Admin Gagal Dimuat"
        message={errorMessage ?? 'Dashboard admin tidak dapat dimuat.'}
      />
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <h1 className="text-3xl text-white mb-6">Admin Dashboard</h1>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs sm:text-sm">Total Users</span>
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-xl sm:text-3xl text-white">
                {dashboard.stats.total_users}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs sm:text-sm">Total Limbah (KG)</span>
                <Package className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-xl sm:text-3xl text-white">
                {dashboard.stats.total_waste_collected.toLocaleString('id-ID')}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs sm:text-sm">Total Cuan</span>
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-xl sm:text-3xl text-white">
                Rp {(dashboard.stats.total_cuan_distributed / 1000000).toFixed(1)}Jt
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs sm:text-sm">Pending Verif.</span>
                <CheckSquare className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-xl sm:text-3xl text-white">
                {dashboard.stats.pending_verifications}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs sm:text-sm">Pending Withdrawal</span>
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-xl sm:text-3xl text-white">
                {dashboard.stats.pending_withdrawals}
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
          {activeTab === 'verification' && (
            <VerificationQueue
              submissions={dashboard.pending_submissions}
              onApprove={handleApproveSubmission}
              onReject={handleRejectSubmission}
            />
          )}
          {activeTab === 'prices' && (
            <PriceCatalog prices={dashboard.prices} onSavePrice={handleSavePrice} />
          )}
          {activeTab === 'users' && <UserManagement users={dashboard.users} />}
          {activeTab === 'drivers' && (
            <DriverOperations
              drivers={dashboard.drivers}
              pendingSubmissions={dashboard.pending_submissions}
              pickupRoutes={dashboard.pickup_routes}
              payments={dashboard.payments}
              onCreateDriver={handleCreateDriver}
              onAssignRoute={handleAssignRoute}
              onMarkPaymentPaid={handleMarkPaymentPaid}
            />
          )}
          {activeTab === 'withdrawals' && (
            <WithdrawalPanel
              requests={dashboard.withdrawals}
              onApprove={handleApproveWithdrawal}
              onReject={handleRejectWithdrawal}
            />
          )}
          {activeTab === 'analytics' && <AnalyticsDashboard stats={dashboard.stats} />}
        </motion.div>
      </div>
    </div>
  );
}
