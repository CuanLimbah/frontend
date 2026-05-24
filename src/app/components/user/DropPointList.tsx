import { useState } from 'react';
import { MapPin, Phone, Clock, Crosshair } from 'lucide-react';
import type { DropPoint } from '../../types';
import { EmbeddedMap, type MapPoint } from '../common/EmbeddedMap';

interface DropPointListProps {
  dropPoints: DropPoint[];
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

export function DropPointList({ dropPoints }: DropPointListProps) {
  const [selectedDropPointId, setSelectedDropPointId] = useState(dropPoints[0]?.id ?? '');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const dropPointsWithDistance = getDropPointsWithDistance(dropPoints, userLocation);
  const selectedDropPoint =
    dropPoints.find((point) => point.id === selectedDropPointId) ?? dropPointsWithDistance[0];
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
      tone: point.id === selectedDropPoint?.id ? 'selected' as const : 'dropPoint' as const,
    })),
  ];

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
        if (nearestDropPoint) {
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl text-white mb-2">Titik Setor Limbah</h2>
          <p className="text-gray-400">
            Pilih drop point terdekat dari lokasi rumah Anda sebelum setor limbah.
          </p>
        </div>
        <button
          onClick={requestUserLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-2 text-sm text-green-300 hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Crosshair className="w-4 h-4" />
          {isLocating ? 'Mengambil GPS...' : 'Cari Terdekat'}
        </button>
      </div>

      {locationError && (
        <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
          {locationError}
        </div>
      )}

      <div className="mb-6 grid lg:grid-cols-[1.35fr_1fr] gap-4">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <EmbeddedMap
            points={mapPoints}
            emptyMessage="Belum ada drop point dengan koordinat."
            className="h-[420px]"
            onPointSelect={(pointId) => {
              if (dropPoints.some((point) => point.id === pointId)) {
                setSelectedDropPointId(pointId);
              }
            }}
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 text-sm text-gray-400">Drop point dipilih</div>
          {selectedDropPoint ? (
            <div>
              <div className="text-lg text-white">{selectedDropPoint.name}</div>
              <div className="mt-1 text-sm text-gray-400">{selectedDropPoint.address}</div>
              <div className="mt-4 space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedDropPoint.operating_hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{selectedDropPoint.contact}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {selectedDropPoint.latitude.toFixed(6)},{' '}
                    {selectedDropPoint.longitude.toFixed(6)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Belum ada drop point tersedia.</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {dropPointsWithDistance.map((point, index) => (
          <button
            key={point.id}
            onClick={() => setSelectedDropPointId(point.id)}
            className={`
              p-6 rounded-xl border text-left transition-all group
              ${selectedDropPoint?.id === point.id
                ? 'border-green-500 bg-green-500/10'
                : 'border-white/10 bg-gradient-to-br from-white/10 to-white/5 hover:border-green-500/30'
              }
            `}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                <MapPin className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg text-white">{point.name}</h3>
                  {index === 0 && point.distanceKm != null && (
                    <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-300">
                      Terdekat
                    </span>
                  )}
                </div>
                <p className="mt-1 text-gray-400 text-sm">{point.address}</p>
              </div>
            </div>

            <div className="space-y-2 pl-16">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>{point.operating_hours}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4" />
                <span>{point.contact}</span>
              </div>
              <div className="text-xs text-gray-500">
                {point.distanceKm != null
                  ? `${point.distanceKm.toFixed(2)} km dari lokasi Anda`
                  : 'Aktifkan GPS untuk estimasi jarak'}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-6 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <h3 className="text-white mb-2">Tips Setor Limbah</h3>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>Kami menerima: Sampah Sisa Makanan dan Minyak Jelantah</li>
          <li>Pastikan limbah sudah dipilah berdasarkan jenisnya</li>
          <li>Minyak jelantah dalam kondisi bersih dan sudah disaring</li>
          <li>Datang sesuai jam operasional drop point</li>
          <li>Gunakan fitur Setor Limbah untuk pre-register sebelum datang</li>
        </ul>
      </div>
    </div>
  );
}
