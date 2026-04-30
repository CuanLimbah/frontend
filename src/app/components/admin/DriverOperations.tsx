import { useState } from 'react';
import { CalendarClock, Plus, Route, Truck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentRecord, PickupRoute, User, WasteSubmission } from '../../types';
import {
  getErrorMessage,
  type AssignPickupRoutePayload,
  type CreateDriverPayload,
} from '../../lib/api';

interface DriverOperationsProps {
  drivers: User[];
  pendingSubmissions: WasteSubmission[];
  pickupRoutes: PickupRoute[];
  payments: PaymentRecord[];
  onCreateDriver: (payload: CreateDriverPayload) => Promise<void>;
  onAssignRoute: (payload: AssignPickupRoutePayload) => Promise<void>;
  onMarkPaymentPaid: (paymentId: string) => Promise<void>;
}

export function DriverOperations({
  drivers,
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
    scheduledAt: '',
    address: '',
  });
  const [isCreatingDriver, setIsCreatingDriver] = useState(false);
  const [isAssigningRoute, setIsAssigningRoute] = useState(false);
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);

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
        scheduledAt: routeForm.scheduledAt
          ? new Date(routeForm.scheduledAt).toISOString()
          : undefined,
        address: routeForm.address,
      });
      toast.success('Rute penjemputan berhasil dijadwalkan.');
      setRouteForm((current) => ({ ...current, address: '', scheduledAt: '' }));
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

  return (
    <div className="grid xl:grid-cols-[420px_1fr] gap-6">
      <div className="space-y-6">
        <section className="p-6 rounded-xl bg-white/5 border border-white/10">
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

        <section className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-5">
            <CalendarClock className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl text-white">Jadwalkan Rute</h2>
          </div>

          <div className="space-y-3">
            <select
              value={routeForm.submissionId}
              onChange={(event) =>
                setRouteForm((current) => ({ ...current, submissionId: event.target.value }))
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-green-500 focus:outline-none"
            >
              <option value="">Pilih setoran pending</option>
              {pendingSubmissions.map((submission) => (
                <option key={submission.id} value={submission.id}>
                  {submission.id} - {submission.waste_type} - {submission.estimated_weight} KG
                </option>
              ))}
            </select>
            <select
              value={routeForm.driverId}
              onChange={(event) =>
                setRouteForm((current) => ({ ...current, driverId: event.target.value }))
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-green-500 focus:outline-none"
            >
              <option value="">Pilih driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.full_name} {driver.vehicle_number ? `- ${driver.vehicle_number}` : ''}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={routeForm.scheduledAt}
              onChange={(event) =>
                setRouteForm((current) => ({ ...current, scheduledAt: event.target.value }))
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-green-500 focus:outline-none"
            />
            <textarea
              value={routeForm.address}
              onChange={(event) =>
                setRouteForm((current) => ({ ...current, address: event.target.value }))
              }
              placeholder="Alamat penjemputan"
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
            />
            <button
              onClick={() => void handleAssignRoute()}
              disabled={isAssigningRoute || !routeForm.submissionId || !routeForm.driverId}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Route className="w-5 h-5" />
              <span>{isAssigningRoute ? 'Menjadwalkan...' : 'Assign Rute'}</span>
            </button>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="p-6 rounded-xl bg-white/5 border border-white/10">
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

        <section className="p-6 rounded-xl bg-white/5 border border-white/10">
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
                    {route.address || 'Alamat belum diisi'}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="p-6 rounded-xl bg-white/5 border border-white/10">
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
