import { useState } from 'react';
import { Upload, Camera, Package, CheckCircle } from 'lucide-react';
import type { WastePrice, WasteType } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getErrorMessage, type CreateSubmissionPayload } from '../../lib/api';

interface WasteSubmissionFormProps {
  prices: WastePrice[];
  isSubmitting?: boolean;
  onSubmit: (payload: CreateSubmissionPayload) => Promise<void>;
}

export function WasteSubmissionForm({
  prices,
  isSubmitting = false,
  onSubmit,
}: WasteSubmissionFormProps) {
  const [step, setStep] = useState(1);
  const [wasteType, setWasteType] = useState<WasteType | ''>('');
  const [weight, setWeight] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const wasteTypes: Array<{ value: WasteType; label: string; icon: string }> = [
    { value: 'food', label: 'Sampah Sisa Makanan', icon: '🍱' },
    { value: 'oil', label: 'Minyak Jelantah', icon: '🛢️' },
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

  const handleSubmit = async () => {
    if (!wasteType || !weight || !imagePreview) {
      return;
    }

    try {
      await onSubmit({
        wasteType,
        estimatedWeight: Number(weight),
        imageUrl: imagePreview,
      });

      toast.success('Limbah berhasil disetor. Tim akan segera memverifikasi.');
      setStep(1);
      setWasteType('');
      setWeight('');
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
    <div className="max-w-2xl mx-auto">
      <div className="p-8 rounded-xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${step >= s ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}
                `}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
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
          {/* Step 1: Select Waste Type */}
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
                      <div className="text-5xl">{type.icon}</div>
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

          {/* Step 2: Input Weight */}
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

          {/* Step 3: Upload Image */}
          {step === 3 && (
            <motion.div
              key="step3"
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
                  onClick={() => setStep(2)}
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
