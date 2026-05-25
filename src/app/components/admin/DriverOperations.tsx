import { useEffect, useState } from 'react';
import { CalendarClock, Check, ChevronDown, Plus, Route, Search, Truck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import type { DropPoint, PaymentRecord, PickupRoute, User, WasteSubmission } from '../../types';
import {
  getErrorMessage,
  type AssignPickupRoutePayload,
  type CreateDriverPayload,
} from '../../lib/api';
import { getUnitSuffix } from '../../lib/waste-unit';
import { EmbeddedMap, type MapPoint } from '../common/EmbeddedMap';

interface DriverOperationsProps {
  drivers: User[];
  dropPoints: DropPoint[];
  pendingSubmissions: WasteSubmission[];
  pickupRoutes: PickupRoute[];
  payments: PaymentRecord[];
  onCreateDriver: (payload: CreateDriverPayload) => Promise<void>;
  onAssignRoute: (payload: AssignPickupRoutePayload) => Promise<void>;
  onMarkPaymentPaid: (paymentId: string) => Promise<void>;
}

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SearchableSelectProps {
  value: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

function SearchableSelect({
  value,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  options,
  onChange,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selectedOption = options.find((option) => option.value === value);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOptions = normalizedQuery
    ? options.filter((option) =>
        `${option.label} ${option.description ?? ''}`.toLowerCase().includes(normalizedQuery),
      )
    : options;

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative" onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#0a0a0f] px-4 py-3 text-left text-white transition-colors hover:border-green-500/60 focus:border-green-500 focus:outline-none"
      >
        <span className="min-w-0 truncate text-sm">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[80] overflow-hidden rounded-xl border border-green-500/30 bg-[#05070a] shadow-2xl shadow-black/60">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent py-1 text-sm text-white placeholder-gray-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => handleSelect('')}
              className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-gray-300 hover:bg-green-500/10 hover:text-white"
            >
              <span>{placeholder}</span>
              {!value && <Check className="h-4 w-4 text-green-400" />}
            </button>

            {visibleOptions.length === 0 ? (
              <div className="px-4 py-4 text-sm text-gray-500">{emptyMessage}</div>
            ) : (
              visibleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="flex w-full items-start justify-between gap-3 px-4 py-2 text-left text-sm text-white hover:bg-green-500/10"
                >
                  <span className="min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.description && (
                      <span className="mt-0.5 block truncate text-xs text-gray-500">
                        {option.description}
                      </span>
                    )}
                  </span>
                  {option.value === value && <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function DriverOperations({
  drivers,
  dropPoints,
  pendingSubmissions,
  pickupRoutes,
  payments,
  onCreateDriver,
  onAssignRoute,
  onMarkPaymentPaid,
}: DriverOperationsProps) {
  const [driverForm, setDriverForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    vehicleNumber: '',
  });
  const [routeForm, setRouteForm] = useState({
    submissionId: pendingSubmissions[0]?.id ?? '',
    driverId: drivers[0]?.id ?? '',
    dropPointId: dropPoints[0]?.id ?? '',
    scheduledAt: '',
  });
  const [isCreatingDriver, setIsCreatingDriver] = useState(false);
  const [isAssigningRoute, setIsAssigningRoute] = useState(false);
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);
  const selectedSubmission = pendingSubmissions.find(
    (submission) => submission.id === routeForm.submissionId,
  );

  useEffect(() => {
    const preferredDropPointId = selectedSubmission?.drop_point_id;

    if (
      preferredDropPointId &&
      dropPoints.some((dropPoint) => dropPoint.id === preferredDropPointId) &&
      routeForm.dropPointId !== preferredDropPointId
    ) {
      setRouteForm((current) => ({ ...current, dropPointId: preferredDropPointId }));
    }
  }, [dropPoints, routeForm.dropPointId, selectedSubmission?.drop_point_id]);

  const handleCreateDriver = async () => {
    try {
      setIsCreatingDriver(true);
      await onCreateDriver(driverForm);
      toast.success('Akun driver berhasil dibuat.');
      setDriverForm({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        vehicleNumber: '',
      });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal membuat akun driver.'));
    } finally {
      setIsCreatingDriver(false);
    }
  };

  const handleAssignRoute = async () => {
    try {
      setIsAssigningRoute(true);
      await onAssignRoute({
        submissionId: routeForm.submissionId,
        driverId: routeForm.driverId,
        dropPointId: routeForm.dropPointId,
        scheduledAt: routeForm.scheduledAt
          ? new Date(routeForm.scheduledAt).toISOString()
          : undefined,
      });
      toast.success('Rute penjemputan berhasil dijadwalkan.');
      setRouteForm((current) => ({ ...current, scheduledAt: '' }));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal menjadwalkan rute.'));
    } finally {
      setIsAssigningRoute(false);
    }
  };

  const handleMarkPaid = async (paymentId: string) => {
    try {
      setProcessingPaymentId(paymentId);
      await onMarkPaymentPaid(paymentId);
      toast.success('Pembayaran ditandai lunas.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal memperbarui pembayaran.'));
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const getRouteDropPointLabel = (route: PickupRoute) => {
    const dropPoint = dropPoints.find((item) => item.id === route.drop_point_id);

    if (dropPoint) {
      return `${dropPoint.name} - ${dropPoint.address}`;
    }

    return (
      route.drop_point_name ||
      route.drop_point_address ||
      route.address ||
      'Drop point belum diisi'
    );
  };
  const selectedDropPoint = dropPoints.find((dropPoint) => dropPoint.id === routeForm.dropPointId);
  const submissionOptions: SelectOption[] = pendingSubmissions.map((submission) => ({
    value: submission.id,
    label: `${submission.id} - ${submission.waste_type} - ${submission.estimated_weight} ${getUnitSuffix(
      submission.waste_type,
    )}`,
    description: submission.drop_point_name || submission.drop_point_address,
  }));
  const driverOptions: SelectOption[] = drivers.map((driver) => ({
    value: driver.id,
    label: driver.full_name,
    description: [driver.email, driver.vehicle_number].filter(Boolean).join(' - '),
  }));
  const dropPointOptions: SelectOption[] = dropPoints.map((dropPoint) => ({
    value: dropPoint.id,
    label: dropPoint.name,
    description: dropPoint.address,
  }));
  const dropPointMapPoints: MapPoint[] = dropPoints.map((dropPoint) => ({
    id: dropPoint.id,
    label: dropPoint.name,
    address: dropPoint.address,
    latitude: dropPoint.latitude,
    longitude: dropPoint.longitude,
    tone: dropPoint.id === routeForm.dropPointId ? 'selected' : 'dropPoint',
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-5">
            <UserPlus className="w-5 h-5 text-green-400" />
            <h2 className="text-xl text-white">Akun Driver</h2>
          </div>

          <div className="space-y-3">
            <input
              value={driverForm.fullName}
              onChange={(event) =>
                setDriverForm((current) => ({ ...current, fullName: event.target.value }))
              }
              placeholder="Nama driver"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
            />
            <input
              value={driverForm.email}
              onChange={(event) =>
                setDriverForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="Email driver"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
            />
            <input
              value={driverForm.password}
              onChange={(event) =>
                setDriverForm((current) => ({ ...current, password: event.target.value }))
              }
              type="password"
              placeholder="Password minimal 8 karakter"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                value={driverForm.phoneNumber}
                onChange={(event) =>
                  setDriverForm((current) => ({ ...current, phoneNumber: event.target.value }))
                }
                placeholder="Nomor HP"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
              />
              <input
                value={driverForm.vehicleNumber}
                onChange={(event) =>
                  setDriverForm((current) => ({ ...current, vehicleNumber: event.target.value }))
                }
                placeholder="Nomor kendaraan"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => void handleCreateDriver()}
              disabled={
                isCreatingDriver ||
                !driverForm.fullName ||
                !driverForm.email ||
                driverForm.password.length < 8
              }
              className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>{isCreatingDriver ? 'Membuat...' : 'Buat Driver'}</span>
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Truck className="w-5 h-5 text-green-400" />
            <h2 className="text-xl text-white">Driver Aktif</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {drivers.map((driver) => (
              <div key={driver.id} className="p-4 rounded-lg bg-black/20 border border-white/10">
                <div className="text-white">{driver.full_name}</div>
                <div className="text-sm text-gray-400">{driver.email}</div>
                <div className="text-sm text-gray-400">
                  {driver.vehicle_number || 'Kendaraan belum diisi'}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl text-white">Jadwalkan Rute</h2>
          </div>
          <p className="text-sm text-gray-400">Pilih setoran, driver, drop point, lalu klik marker pada map.</p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(320px,400px)_1fr]">
          <div className="space-y-3">
            <SearchableSelect
              value={routeForm.submissionId}
              placeholder="Pilih setoran pending"
              searchPlaceholder="Cari ID, jenis limbah, atau drop point..."
              emptyMessage="Setoran pending tidak ditemukan."
              options={submissionOptions}
              onChange={(nextSubmissionId) => {
                const nextSubmission = pendingSubmissions.find(
                  (submission) => submission.id === nextSubmissionId,
                );
                const preferredDropPointId = nextSubmission?.drop_point_id;

                setRouteForm((current) => ({
                  ...current,
                  submissionId: nextSubmissionId,
                  dropPointId:
                    preferredDropPointId &&
                    dropPoints.some((dropPoint) => dropPoint.id === preferredDropPointId)
                      ? preferredDropPointId
                      : current.dropPointId,
                }));
              }}
            />
            <SearchableSelect
              value={routeForm.driverId}
              placeholder="Pilih driver"
              searchPlaceholder="Cari nama, email, atau kendaraan..."
              emptyMessage="Driver tidak ditemukan."
              options={driverOptions}
              onChange={(nextDriverId) =>
                setRouteForm((current) => ({ ...current, driverId: nextDriverId }))
              }
            />
            <SearchableSelect
              value={routeForm.dropPointId}
              placeholder="Pilih drop point tujuan"
              searchPlaceholder="Cari nama atau alamat drop point..."
              emptyMessage="Drop point tidak ditemukan."
              options={dropPointOptions}
              onChange={(nextDropPointId) =>
                setRouteForm((current) => ({ ...current, dropPointId: nextDropPointId }))
              }
            />
            <input
              type="datetime-local"
              value={routeForm.scheduledAt}
              onChange={(event) =>
                setRouteForm((current) => ({ ...current, scheduledAt: event.target.value }))
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-green-500 focus:outline-none"
            />

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
              <div className="text-sm text-white">{selectedDropPoint?.name || 'Drop point belum dipilih'}</div>
              <div className="mt-1 text-sm text-gray-400">{selectedDropPoint?.address || 'Pilih drop point dari dropdown atau marker map.'}</div>
              <div className="mt-2 text-xs text-gray-500">
                {selectedDropPoint
                  ? `${selectedDropPoint.latitude.toFixed(6)}, ${selectedDropPoint.longitude.toFixed(6)}`
                  : 'Koordinat belum tersedia'}
              </div>
            </div>

            <button
              onClick={() => void handleAssignRoute()}
              disabled={
                isAssigningRoute ||
                !routeForm.submissionId ||
                !routeForm.driverId ||
                !routeForm.dropPointId
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 py-3 text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-600"
            >
              <Route className="h-5 w-5" />
              <span>{isAssigningRoute ? 'Menjadwalkan...' : 'Assign Rute'}</span>
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-white">Map Drop Point</div>
                <div className="text-xs text-gray-400">
                  Klik marker untuk memilih tujuan rute.
                </div>
              </div>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                {selectedDropPoint ? 'Dipilih' : 'Belum dipilih'}
              </span>
            </div>
            <EmbeddedMap
              points={dropPointMapPoints}
              emptyMessage="Belum ada drop point dengan koordinat."
              className="h-[360px] min-h-[360px] xl:h-[440px]"
              onPointSelect={(pointId) =>
                setRouteForm((current) => ({ ...current, dropPointId: pointId }))
              }
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">

        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl text-white mb-5">Rute Penjemputan</h2>
          <div className="space-y-3">
            {pickupRoutes.length === 0 ? (
              <p className="text-gray-400">Belum ada rute penjemputan.</p>
            ) : (
              pickupRoutes.map((route) => (
                <div key={route.id} className="p-4 rounded-lg bg-black/20 border border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-white">{route.user_name || route.user_id}</div>
                      <div className="text-sm text-gray-400">
                        Driver: {route.driver_name || route.driver_id}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm">
                      {route.status}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-gray-400">
                    {new Date(route.scheduled_at).toLocaleString('id-ID')} -{' '}
                    {getRouteDropPointLabel(route)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl text-white mb-5">Payment Gateway</h2>
          <div className="space-y-3">
            {payments.length === 0 ? (
              <p className="text-gray-400">Belum ada pembayaran.</p>
            ) : (
              payments.slice(0, 8).map((payment) => (
                <div key={payment.id} className="p-4 rounded-lg bg-black/20 border border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-white">
                        Rp {payment.amount.toLocaleString('id-ID')} - {payment.method}
                      </div>
                      <div className="text-sm text-gray-400">{payment.provider}</div>
                    </div>
                    {payment.status === 'pending' ? (
                      <button
                        onClick={() => void handleMarkPaid(payment.id)}
                        disabled={processingPaymentId === payment.id}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-600"
                      >
                        {processingPaymentId === payment.id ? 'Memproses...' : 'Tandai Lunas'}
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm">
                        {payment.status}
                      </span>
                    )}
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
