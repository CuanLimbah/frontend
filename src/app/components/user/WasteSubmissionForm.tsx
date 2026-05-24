import { useState } from 'react';
import { Upload, Camera, Package, CheckCircle, Crosshair, MapPin } from 'lucide-react';
import type { DropPoint, WastePrice, WasteType } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getErrorMessage, type CreateSubmissionPayload } from '../../lib/api';
import { EmbeddedMap, type MapPoint } from '../common/EmbeddedMap';

interface WasteSubmissionFormProps {
  prices: WastePrice[];
  dropPoints: DropPoint[];
  isSubmitting?: boolean;
  onSubmit: (payload: CreateSubmissionPayload) => Promise<void>;
}

type UserLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

type DropPointDistance = DropPoint & {
  distanceKm?: number;
};

function hasValidCoordinates(point: DropPoint) {
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude);
}

function calculateDistanceKm(
  from: Pick<UserLocation, 'latitude' | 'longitude'>,
  to: Pick<DropPoint, 'latitude' | 'longitude'>,
) {
  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function getDropPointsWithDistance(
  dropPoints: DropPoint[],
  userLocation: UserLocation | null,
): DropPointDistance[] {
  return dropPoints
    .map((point) => ({
      ...point,
      distanceKm:
        userLocation && hasValidCoordinates(point)
          ? calculateDistanceKm(userLocation, point)
          : undefined,
    }))
    .sort((first, second) => {
      if (first.distanceKm == null && second.distanceKm == null) return 0;
      if (first.distanceKm == null) return 1;
      if (second.distanceKm == null) return -1;
      return first.distanceKm - second.distanceKm;
    });
}

export function WasteSubmissionForm({
  prices,
  dropPoints,
  isSubmitting = false,
  onSubmit,
}: WasteSubmissionFormProps) {
  const [step, setStep] = useState(1);
  const [wasteType, setWasteType] = useState<WasteType | ''>('');
  const [weight, setWeight] = useState('');
  const [selectedDropPointId, setSelectedDropPointId] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const wasteTypes: Array<{ value: WasteType; label: string; icon: string }> = [
    { value: 'food', label: 'Sampah Sisa Makanan', icon: 'Food' },
    { value: 'oil', label: 'Minyak Jelantah', icon: 'Oil' },
  ];

  const dropPointsWithDistance = getDropPointsWithDistance(dropPoints, userLocation);
  const selectedDropPoint = dropPoints.find((point) => point.id === selectedDropPointId);
  const mapPoints: MapPoint[] = [
    ...(userLocation
      ? [
          {
            id: 'current-location',
            label: 'Lokasi Anda',
            address: userLocation.accuracy
              ? `Akurasi ${Math.round(userLocation.accuracy)} m`
              : 'Lokasi dari GPS browser',
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            tone: 'driver' as const,
          },
        ]
      : []),
    ...dropPoints.filter(hasValidCoordinates).map((point) => ({
      id: point.id,
      label: point.name,
      address: point.address,
      latitude: point.latitude,
      longitude: point.longitude,
      tone: point.id === selectedDropPointId ? 'selected' as const : 'dropPoint' as const,
    })),
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Browser tidak mendukung akses GPS.');
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        const nearestDropPoint = getDropPointsWithDistance(dropPoints, nextLocation)[0];

        setUserLocation(nextLocation);
        if (nearestDropPoint && !selectedDropPointId) {
          setSelectedDropPointId(nearestDropPoint.id);
        }
        setIsLocating(false);
      },
      (error) => {
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? 'Akses lokasi ditolak. Izinkan GPS di browser untuk rekomendasi terdekat.'
            : 'Gagal mengambil lokasi. Coba lagi atau pilih drop point manual.',
        );
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      },
    );
  };

  const handleSubmit = async () => {
    if (!wasteType || !weight || !imagePreview || (dropPoints.length > 0 && !selectedDropPointId)) {
      return;
    }

    try {
      await onSubmit({
        wasteType,
        estimatedWeight: Number(weight),
        dropPointId: selectedDropPointId || undefined,
        imageUrl: imagePreview,
      });

      toast.success('Limbah berhasil disetor. Tim akan segera memverifikasi.');
      setStep(1);
      setWasteType('');
      setWeight('');
      setSelectedDropPointId('');
      setImage(null);
      setImagePreview('');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal mengirim setoran limbah.'));
    }
  };

  const currentPrice = wasteType
    ? prices.find((price) => price.waste_type === wasteType)?.price_per_kg
    : 0;
  const estimatedEarnings = currentPrice && weight ? currentPrice * parseFloat(weight) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="p-4 sm:p-8 rounded-xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${step >= s ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}
                `}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`
                    flex-1 h-1 mx-2 transition-all
                    ${step > s ? 'bg-green-500' : 'bg-white/10'}
                  `}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl text-white mb-2">Pilih Jenis Limbah</h2>
              <p className="text-gray-400 mb-6">Pilih kategori limbah yang akan Anda setor</p>

              <div className="grid grid-cols-1 gap-4 mb-6">
                {wasteTypes.map((type) => {
                  const price = prices.find((priceItem) => priceItem.waste_type === type.value);
                  return (
                    <button
                      key={type.value}
                      onClick={() => setWasteType(type.value)}
                      className={`
                        p-6 rounded-xl border-2 transition-all text-left flex items-center gap-4
                        ${wasteType === type.value
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                        }
                      `}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-sm text-gray-300">
                        {type.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-lg text-white mb-1">{type.label}</div>
                        <div className="text-green-500 text-xl">
                          Rp {price?.price_per_kg.toLocaleString('id-ID')}/KG
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!wasteType}
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
              >
                Lanjut
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl text-white mb-2">Estimasi Berat</h2>
              <p className="text-gray-400 mb-6">Masukkan perkiraan berat limbah (dalam KG)</p>

              <div className="mb-6">
                <label className="block text-white mb-2">Berat (KG)</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              {weight && parseFloat(weight) > 0 && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Estimasi Pendapatan:</span>
                    <span className="text-2xl text-green-500">
                      Rp {estimatedEarnings.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  Kembali
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!weight || parseFloat(weight) <= 0}
                  className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                >
                  Lanjut
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl text-white mb-2">Pilih Drop Point Terdekat</h2>
                  <p className="text-gray-400">
                    Gunakan GPS dari rumah Anda, lalu pilih drop point yang paling dekat.
                  </p>
                </div>
                <button
                  onClick={requestUserLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-2 text-sm text-green-300 hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Crosshair className="w-4 h-4" />
                  {isLocating ? 'Mengambil GPS...' : 'Gunakan Lokasi Saya'}
                </button>
              </div>

              {locationError && (
                <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
                  {locationError}
                </div>
              )}

              <div className="grid lg:grid-cols-[1.35fr_1fr] gap-4 mb-6">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <EmbeddedMap
                    points={mapPoints}
                    emptyMessage="Belum ada drop point dengan koordinat."
                    className="h-[360px]"
                    onPointSelect={(pointId) => {
                      if (dropPoints.some((point) => point.id === pointId)) {
                        setSelectedDropPointId(pointId);
                      }
                    }}
                  />
                </div>

                <div className="space-y-3">
                  {dropPointsWithDistance.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
                      Belum ada drop point tersedia.
                    </div>
                  ) : (
                    dropPointsWithDistance.map((point, index) => (
                      <button
                        key={point.id}
                        onClick={() => setSelectedDropPointId(point.id)}
                        className={`
                          w-full rounded-xl border p-4 text-left transition-all
                          ${selectedDropPointId === point.id
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 text-white">
                              <MapPin className="w-4 h-4 text-green-400" />
                              {point.name}
                            </div>
                            <div className="mt-1 text-sm text-gray-400">{point.address}</div>
                          </div>
                          {index === 0 && point.distanceKm != null && (
                            <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-300">
                              Terdekat
                            </span>
                          )}
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          {point.distanceKm != null
                            ? `${point.distanceKm.toFixed(2)} km dari lokasi Anda`
                            : 'Aktifkan GPS untuk estimasi jarak'}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {selectedDropPoint && (
                <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                  <div className="text-sm text-gray-400">Drop point dipilih</div>
                  <div className="mt-1 text-white">{selectedDropPoint.name}</div>
                  <div className="text-sm text-gray-300">{selectedDropPoint.address}</div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  Kembali
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={dropPoints.length > 0 && !selectedDropPointId}
                  className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                >
                  Lanjut
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl text-white mb-2">Upload Foto Limbah</h2>
              <p className="text-gray-400 mb-6">Ambil foto limbah untuk verifikasi</p>

              <div className="mb-6">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div
                    className={`
                      border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all
                      ${imagePreview ? 'border-green-500 bg-green-500/10' : 'border-white/20 bg-white/5 hover:border-white/40'}
                    `}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-white mb-2">Klik untuk upload foto</p>
                        <p className="text-gray-500 text-sm">PNG, JPG hingga 10MB</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  Kembali
                </button>
                <button
                  onClick={() => void handleSubmit()}
                  disabled={!image || isSubmitting}
                  className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>{isSubmitting ? 'Mengirim...' : 'Submit Setoran'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
