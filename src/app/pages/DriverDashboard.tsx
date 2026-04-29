import { useEffect, useState } from 'react';
import { CheckCircle, Clock, Navigation, PackageCheck, Truck } from 'lucide-react';
import { Navigate } from 'react-router';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { api, ApiError, getErrorMessage } from '../lib/api';
import { PageErrorState, PageLoader } from '../components/common/PageState';
import { useAuth } from '../providers/AuthProvider';
import type { DriverDashboardData, PickupRouteStatus } from '../types';

const nextStatuses: Array<{ status: PickupRouteStatus; label: string }> = [
  { status: 'on_the_way', label: 'Mulai Jalan' },
  { status: 'picked_up', label: 'Sudah Diambil' },
  { status: 'completed', label: 'Selesai' },
  { status: 'cancelled', label: 'Batalkan' },
];

export function DriverDashboard() {
  const { user, accessToken, isLoading: authLoading, logout } = useAuth();
  const [dashboard, setDashboard] = useState<DriverDashboardData | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingRouteId, setProcessingRouteId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!accessToken || user?.role !== 'driver') {
      setIsLoadingDashboard(false);
      return;
    }

    let isMounted = true;

    async function loadDashboard() {
      try {
        setIsLoadingDashboard(true);
        setErrorMessage(null);
        const response = await api.getDriverDashboard(accessToken);

        if (isMounted) {
          setDashboard(response);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
        }

        if (isMounted) {
          setErrorMessage(getErrorMessage(error, 'Gagal memuat dashboard driver.'));
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

    const response = await api.getDriverDashboard(accessToken);
    setDashboard(response);
  };

  const handleUpdateStatus = async (routeId: string, status: PickupRouteStatus) => {
    if (!accessToken) {
      return;
    }

    try {
      setProcessingRouteId(routeId);
      await api.updatePickupRouteStatus(accessToken, routeId, { status });
      await refreshDashboard();
      toast.success('Status rute diperbarui.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal memperbarui status rute.'));
    } finally {
      setProcessingRouteId(null);
    }
  };

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!authLoading && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (!authLoading && user?.role === 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  if (authLoading || isLoadingDashboard) {
    return <PageLoader message="Memuat dashboard driver..." />;
  }

  if (!dashboard) {
    return (
      <PageErrorState
        title="Dashboard Driver Gagal Dimuat"
        message={errorMessage ?? 'Dashboard driver tidak dapat dimuat.'}
      />
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl text-white mb-6">Dashboard Driver</h1>
          <div className="grid md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Rute Aktif</span>
                <Navigation className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl text-white">{dashboard.stats.active}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Assigned</span>
                <Truck className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl text-white">{dashboard.stats.assigned}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Selesai</span>
                <PackageCheck className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl text-white">{dashboard.stats.completed}</div>
            </motion.div>
          </div>
        </div>

        <section className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-green-400" />
            <h2 className="text-xl text-white">Rute Penjemputan Saya</h2>
          </div>

          <div className="space-y-4">
            {dashboard.routes.length === 0 ? (
              <p className="text-gray-400">Belum ada rute penjemputan.</p>
            ) : (
              dashboard.routes.map((route) => (
                <div key={route.id} className="p-5 rounded-xl bg-black/20 border border-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-white text-lg">{route.user_name || route.user_id}</div>
                      <div className="text-sm text-gray-400">{route.user_email}</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm">
                      {route.status}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mt-5 text-sm">
                    <div>
                      <div className="text-gray-500">Jadwal</div>
                      <div className="text-white">
                        {new Date(route.scheduled_at).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Setoran</div>
                      <div className="text-white">
                        {route.submission?.waste_type || '-'} -{' '}
                        {route.submission?.estimated_weight || 0} KG
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Alamat</div>
                      <div className="text-white">{route.address || 'Alamat belum diisi'}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {nextStatuses.map((item) => (
                      <button
                        key={item.status}
                        onClick={() => void handleUpdateStatus(route.id, item.status)}
                        disabled={processingRouteId === route.id || route.status === item.status}
                        className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 flex items-center gap-2"
                      >
                        {item.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
