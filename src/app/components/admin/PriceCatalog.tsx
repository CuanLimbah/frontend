import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
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
      food: '🍱',
      oil: '🛢️',
    };
    return icons[type];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-white">Katalog Harga Limbah</h2>
        <div className="text-gray-400 text-sm">Harga per unit (Rupiah)</div>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-2xl">
        {prices.map((price) => (
          <div
            key={price.id}
            className="p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{getWasteTypeIcon(price.waste_type)}</div>
                <div>
                  <h3 className="text-lg text-white">{getWasteTypeLabel(price.waste_type)}</h3>
                  <p className="text-gray-400 text-sm">
                    Update: {new Date(price.updated_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              {editingId !== price.id && (
                <button
                  onClick={() => handleEdit(price)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-green-500"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {editingId === price.id ? (
              <div>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-green-500 rounded-lg text-white mb-3 focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => void handleSave(price.id)}
                    disabled={savingId === price.id}
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingId === price.id ? 'Menyimpan...' : 'Simpan'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={savingId === price.id}
                    className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Batal</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-3xl text-green-500">
                Rp {price.price_per_kg.toLocaleString('id-ID')}/
                {getPriceUnitSuffix(price.waste_type)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-6 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <h3 className="text-white mb-2">ℹ️ Info Harga</h3>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• Harga yang diubah akan berlaku untuk semua setoran baru</li>
          <li>• Setoran yang sudah diverifikasi tidak terpengaruh perubahan harga</li>
          <li>• Semua perubahan harga akan tercatat dalam sistem</li>
        </ul>
      </div>
    </div>
  );
}
