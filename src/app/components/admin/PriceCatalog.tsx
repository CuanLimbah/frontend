import { useState } from 'react';
import { Droplets, Edit2, Info, Package, Save, X } from 'lucide-react';
import type { WastePrice } from '../../types';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/api';
import { getPriceUnitSuffix } from '../../lib/waste-unit';

interface PriceCatalogProps {
  prices: WastePrice[];
  onSavePrice: (priceId: string, pricePerKg: number) => Promise<void>;
}

export function PriceCatalog({ prices, onSavePrice }: PriceCatalogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleEdit = (price: WastePrice) => {
    setEditingId(price.id);
    setEditPrice(price.price_per_kg);
  };

  const handleSave = async (id: string) => {
    try {
      setSavingId(id);
      await onSavePrice(id, editPrice);
      setEditingId(null);
      toast.success('Harga berhasil diupdate.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal mengubah harga limbah.'));
    } finally {
      setSavingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditPrice(0);
  };

  const getWasteTypeLabel = (type: WastePrice['waste_type']) => {
    const labels = {
      food: 'Sampah Sisa Makanan',
      oil: 'Minyak Jelantah',
    };
    return labels[type];
  };

  const getWasteTypeIcon = (type: WastePrice['waste_type']) => {
    const icons = {
      food: Package,
      oil: Droplets,
    };
    return icons[type];
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-semibold text-white">Katalog Harga Limbah</h2>
        <div className="text-sm text-gray-400">Harga per unit (Rupiah)</div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        {prices.map((price) => {
          const Icon = getWasteTypeIcon(price.waste_type);

          return (
            <div
              key={price.id}
              className="rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-lg shadow-black/10"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-green-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white">
                      {getWasteTypeLabel(price.waste_type)}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Update: {new Date(price.updated_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>

                {editingId !== price.id && (
                  <button
                    onClick={() => handleEdit(price)}
                    className="rounded-lg bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-green-500"
                    title={`Ubah harga ${getWasteTypeLabel(price.waste_type)}`}
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              {editingId === price.id ? (
                <div>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="mb-3 w-full rounded-lg border border-green-500 bg-white/5 px-4 py-3 text-white focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => void handleSave(price.id)}
                      disabled={savingId === price.id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 py-2 text-white transition-colors hover:bg-green-600"
                    >
                      <Save className="h-4 w-4" />
                      <span>{savingId === price.id ? 'Menyimpan...' : 'Simpan'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={savingId === price.id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/20 py-2 text-red-400 transition-colors hover:bg-red-500/30"
                    >
                      <X className="h-4 w-4" />
                      <span>Batal</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-3xl font-semibold text-green-500">
                  Rp {price.price_per_kg.toLocaleString('id-ID')}/
                  {getPriceUnitSuffix(price.waste_type)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 w-full rounded-xl border border-blue-500/30 bg-blue-500/10 p-5">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
          <Info className="h-5 w-5 text-blue-400" />
          Info Harga
        </h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>Harga yang diubah akan berlaku untuk semua setoran baru</li>
          <li>Setoran yang sudah diverifikasi tidak terpengaruh perubahan harga</li>
          <li>Semua perubahan harga akan tercatat dalam sistem</li>
        </ul>
      </div>
    </div>
  );
}
