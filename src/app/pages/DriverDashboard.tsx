import { useEffect, useRef, useState } from 'react';
import { CheckCircle, Clock, Navigation, PackageCheck, Satellite, Truck } from 'lucide-react';
import { Navigate } from 'react-router';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { api, ApiError, getErrorMessage } from '../lib/api';
import { EmbeddedMap, type MapPoint } from '../components/common/EmbeddedMap';
import { PageErrorState, PageLoader } from '../components/common/PageState';
import { useAuth } from '../providers/AuthProvider';
import type { DriverDashboardData, PickupRoute, PickupRouteStatus } from '../types';

const nextStatuses: Array<{ status: PickupRouteStatus; label: string }> = [
  { status: 'on_the_way', label: 'Mulai Jalan' },
  { status: 'picked_up', label: 'Sudah Diambil' },
  { status: 'completed', label: 'Selesai' },
  { status: 'cancelled', label: 'Batalkan' },
];

const activeRouteStatuses: PickupRouteStatus[] = ['on_the_way', 'assigned', 'picked_up'];

interface DriverPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

function getRouteDestination(route: PickupRoute | null) {
  if (!route) {
    return null;
  }

  const latitude = route.drop_point_latitude ?? route.latitude;
  const longitude = route.drop_point_longitude ?? route.longitude;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude: latitude as number,
    longitude: longitude as number,
    name: route.drop_point_name || 'Drop point',
    address: route.drop_point_address || route.address || 'Alamat drop point belum diisi',
  };
}

function calculateDistanceKm(origin: DriverPosition, destination: DriverPosition) {
  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const deltaLatitude = toRadians(destination.latitude - origin.latitude);
  const deltaLongitude = toRadians(destination.longitude - origin.longitude);
  const latitude1 = toRadians(origin.latitude);
  const latitude2 = toRadians(destination.latitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(deltaLongitude / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function formatDistance(distanceKm: number | null) {
  if (distanceKm === null) {
    return '-';
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

export function DriverDashboard() {
  const { user, accessToken, isLoading: authLoading, logout } = useAuth();
  const [dashboard, setDashboard] = useState<DriverDashboardData | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingRouteId, setProcessingRouteId] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<DriverPosition | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isRequestingGps, setIsRequestingGps] = useState(false);
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);
  const lastLocationSyncRef = useRef(0);
  const activeRoute =
    dashboard?.routes.find((route) => activeRouteStatuses.includes(route.status)) ?? null;

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

  useEffect(() => {
    if (!accessToken || !activeRoute || !isTrackingEnabled) {
      return;
    }

    if (!('geolocation' in navigator)) {
      setGeoError('Browser tidak mendukung GPS.');
      return;
    }

    let isCancelled = false;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nextPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setCurrentPosition(nextPosition);
        setGeoError(null);

        const now = Date.now();
        if (now - lastLocationSyncRef.current < 10000) {
          return;
        }

        lastLocationSyncRef.current = now;
        void api
          .updateDriverLocation(accessToken, activeRoute.id, {
            latitude: nextPosition.latitude,
            longitude: nextPosition.longitude,
          })
          .catch((error) => {
            if (!isCancelled) {
              setGeoError(getErrorMessage(error, 'Gagal sinkron lokasi driver.'));
            }
          });
      },
      (error) => {
        setGeoError(error.message || 'Izin lokasi ditolak atau GPS tidak tersedia.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      },
    );

    return () => {
      isCancelled = true;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [accessToken, activeRoute?.id, isTrackingEnabled]);

  const handleRequestGpsAccess = () => {
    if (!activeRoute) {
      setGeoError('Belum ada rute aktif untuk dilacak.');
      toast.error('Belum ada rute aktif untuk dilacak.');
      return;
    }

    if (!('geolocation' in navigator)) {
      setGeoError('Browser tidak mendukung GPS.');
      toast.error('Browser tidak mendukung GPS.');
      return;
    }

    setIsRequestingGps(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setIsTrackingEnabled(true);
        setIsRequestingGps(false);
        toast.success('Akses GPS aktif.');
      },
      (error) => {
        setIsTrackingEnabled(false);
        setIsRequestingGps(false);
        setGeoError(error.message || 'Izin lokasi ditolak atau GPS tidak tersedia.');
        toast.error('Akses GPS belum diberikan.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      },
    );
  };

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

        <LiveTrackerPanel
          route={activeRoute}
          currentPosition={currentPosition}
          geoError={geoError}
          isRequestingGps={isRequestingGps}
          isTrackingEnabled={isTrackingEnabled}
          onRequestGpsAccess={handleRequestGpsAccess}
        />

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
                      <div className="text-gray-500">Drop Point</div>
                      <div className="text-white">
                        {route.drop_point_name || 'Drop point belum diisi'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {route.drop_point_address || route.address || '-'}
                      </div>
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

interface LiveTrackerPanelProps {
  route: PickupRoute | null;
  currentPosition: DriverPosition | null;
  geoError: string | null;
  isRequestingGps: boolean;
  isTrackingEnabled: boolean;
  onRequestGpsAccess: () => void;
}

function LiveTrackerPanel({
  route,
  currentPosition,
  geoError,
  isRequestingGps,
  isTrackingEnabled,
  onRequestGpsAccess,
}: LiveTrackerPanelProps) {
  const destination = getRouteDestination(route);
  const routeMissingDropPoint = Boolean(route && !destination);
  const distanceKm =
    currentPosition && destination
      ? calculateDistanceKm(currentPosition, destination)
      : null;
  const mapPoints: MapPoint[] = [
    ...(currentPosition
      ? [
          {
            id: 'driver',
            label: 'Posisi Driver',
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude,
            tone: 'driver' as const,
          },
        ]
      : []),
    ...(destination
      ? [
          {
            id: 'destination',
            label: destination.name,
            address: destination.address,
            latitude: destination.latitude,
            longitude: destination.longitude,
            tone: 'selected' as const,
          },
        ]
      : []),
  ];

  return (
    <section className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-white/5 to-blue-500/10 border border-emerald-500/20 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Satellite className="w-5 h-5 text-green-400" />
            <h2 className="text-xl text-white">Live Tracker Drop Point</h2>
          </div>
          <p className="text-sm text-gray-400">
            Tujuan driver diambil dari assignment admin, bukan alamat user.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm">
          {currentPosition ? 'GPS aktif' : isTrackingEnabled ? 'Mengaktifkan GPS' : 'GPS belum diizinkan'}
        </span>
      </div>

      {routeMissingDropPoint && (
        <div className="mb-5 rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
          Rute aktif ini belum punya koordinat drop point. Buat/assign ulang rute dari admin dengan memilih
          drop point di map supaya tujuan tracker muncul.
        </div>
      )}

      <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-5">
        <div className="relative">
          <EmbeddedMap
            points={mapPoints}
            routePointIds={currentPosition && destination ? ['driver', 'destination'] : undefined}
            emptyMessage="Aktifkan GPS dan pastikan rute sudah memiliki koordinat drop point."
            className="min-h-[320px]"
          />
          {!currentPosition && (
            <div className="absolute inset-4 flex items-center justify-center rounded-2xl bg-black/55 backdrop-blur-sm">
              <div className="max-w-sm rounded-2xl border border-emerald-400/30 bg-slate-950/90 p-5 text-center shadow-[0_0_40px_rgba(34,197,94,0.18)]">
                <Satellite className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
                <div className="mb-2 text-lg text-white">Aktifkan GPS Driver</div>
                <p className="mb-4 text-sm text-gray-400">
                  Klik tombol ini supaya browser meminta izin lokasi. Lokasi dipakai untuk live tracker ke drop point.
                </p>
                <button
                  type="button"
                  onClick={onRequestGpsAccess}
                  disabled={!route || isRequestingGps}
                  className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-gray-600"
                >
                  {isRequestingGps ? 'Meminta izin GPS...' : 'Izinkan Akses GPS'}
                </button>
                {!route && (
                  <div className="mt-3 text-xs text-yellow-300">
                    Tracker aktif setelah admin memberi rute ke driver.
                  </div>
                )}
              </div>
            </div>
          )}
          {currentPosition && routeMissingDropPoint && (
            <div className="absolute left-4 top-4 max-w-md rounded-xl border border-yellow-400/30 bg-slate-950/90 p-4 text-sm text-yellow-100 backdrop-blur">
              Posisi driver sudah tampil. Tujuan belum tampil karena rute ini belum dihubungkan ke drop point.
            </div>
          )}
          <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/45 border border-white/10 p-4 backdrop-blur">
            <div className="text-sm text-gray-400">Estimasi jarak ke tujuan</div>
            <div className="text-3xl text-white">{formatDistance(distanceKm)}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-black/20 border border-white/10">
            <div className="text-sm text-gray-500 mb-1">Rute aktif</div>
            <div className="text-white">{route?.id || 'Belum ada rute aktif'}</div>
            <div className="text-sm text-gray-400">{route?.status || '-'}</div>
          </div>
          <div className="p-4 rounded-xl bg-black/20 border border-white/10">
            <div className="text-sm text-gray-500 mb-1">Tujuan</div>
            <div className="text-white">
              {destination?.name || (routeMissingDropPoint ? 'Drop point belum di-assign' : '-')}
            </div>
            <div className="text-sm text-gray-400">
              {destination?.address || (routeMissingDropPoint ? 'Assign ulang rute lewat admin' : '-')}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-black/20 border border-white/10">
            <div className="text-sm text-gray-500 mb-1">Koordinat driver</div>
            <div className="text-white">
              {currentPosition
                ? `${currentPosition.latitude.toFixed(6)}, ${currentPosition.longitude.toFixed(6)}`
                : '-'}
            </div>
            <div className="text-sm text-gray-400">
              Akurasi: {currentPosition?.accuracy ? `${Math.round(currentPosition.accuracy)} m` : '-'}
            </div>
          </div>
          {geoError && <div className="text-sm text-red-300">{geoError}</div>}
        </div>
      </div>
    </section>
  );
}
