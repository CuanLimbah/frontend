import { useEffect, useRef, useState } from 'react';

const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

declare global {
  interface Window {
    L?: any;
    __cuanLimbahLeafletPromise?: Promise<any>;
  }
}

export interface MapPoint {
  id: string;
  label: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  tone?: 'driver' | 'selected' | 'dropPoint';
}

interface EmbeddedMapProps {
  points: MapPoint[];
  routePointIds?: [string, string];
  emptyMessage?: string;
  className?: string;
  onPointSelect?: (pointId: string) => void;
}

function loadLeaflet() {
  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (window.__cuanLimbahLeafletPromise) {
    return window.__cuanLimbahLeafletPromise;
  }

  window.__cuanLimbahLeafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS_URL;
      document.head.appendChild(link);
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${LEAFLET_JS_URL}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L));
      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return window.__cuanLimbahLeafletPromise;
}

function isValidPoint(point: MapPoint): point is MapPoint & { latitude: number; longitude: number } {
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function markerColor(tone?: MapPoint['tone']) {
  if (tone === 'driver') {
    return '#22c55e';
  }

  if (tone === 'selected') {
    return '#38bdf8';
  }

  return '#f97316';
}

function createMarkerIcon(L: any, point: MapPoint) {
  const color = markerColor(point.tone);

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        background: ${color};
        border: 3px solid white;
        box-shadow: 0 0 24px ${color};
      "></div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export function EmbeddedMap({
  points,
  routePointIds,
  emptyMessage = 'Koordinat map belum tersedia.',
  className = 'min-h-[320px]',
  onPointSelect,
}: EmbeddedMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [leaflet, setLeaflet] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const validPoints = points.filter(isValidPoint);

  useEffect(() => {
    let isMounted = true;

    loadLeaflet()
      .then((L) => {
        if (isMounted) {
          setLeaflet(L);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadError('Gagal memuat map.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!leaflet || !mapElementRef.current || mapRef.current) {
      return;
    }

    mapRef.current = leaflet.map(mapElementRef.current, {
      zoomControl: true,
      attributionControl: true,
    });

    leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      })
      .addTo(mapRef.current);

    requestAnimationFrame(() => mapRef.current?.invalidateSize());

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [leaflet]);

  useEffect(() => {
    if (!leaflet || !mapRef.current) {
      return;
    }

    if (layerRef.current) {
      layerRef.current.remove();
    }

    layerRef.current = leaflet.layerGroup().addTo(mapRef.current);
    requestAnimationFrame(() => mapRef.current?.invalidateSize());

    if (validPoints.length === 0) {
      mapRef.current.setView([-6.2, 106.816666], 11);
      return;
    }

    validPoints.forEach((point) => {
      const marker = leaflet
        .marker([point.latitude, point.longitude], {
          icon: createMarkerIcon(leaflet, point),
        })
        .bindPopup(
          `<strong>${escapeHtml(point.label)}</strong>${
            point.address ? `<br />${escapeHtml(point.address)}` : ''
          }`,
        )
        .addTo(layerRef.current);

      if (onPointSelect) {
        marker.on('click', () => onPointSelect(point.id));
      }
    });

    if (routePointIds) {
      const routePoints = routePointIds
        .map((id) => validPoints.find((point) => point.id === id))
        .filter(Boolean);

      if (routePoints.length === 2) {
        leaflet
          .polyline(
            routePoints.map((point: MapPoint) => [point.latitude, point.longitude]),
            {
              color: '#22c55e',
              weight: 5,
              opacity: 0.9,
              dashArray: '10 8',
            },
          )
          .addTo(layerRef.current);
      }
    }

    const bounds = leaflet.latLngBounds(
      validPoints.map((point) => [point.latitude, point.longitude]),
    );
    mapRef.current.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
  }, [leaflet, onPointSelect, points, routePointIds, validPoints]);

  if (loadError) {
    return (
      <div className={`flex items-center justify-center rounded-2xl bg-black/20 border border-white/10 text-sm text-red-300 ${className}`}>
        {loadError}
      </div>
    );
  }

  if (validPoints.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-2xl bg-black/20 border border-white/10 text-sm text-gray-400 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-black/20 ${className}`}>
      <div ref={mapElementRef} className="h-full min-h-[inherit] w-full" />
    </div>
  );
}
