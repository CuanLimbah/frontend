import { useState } from 'react';
import { CheckCircle, XCircle, Package, Image as ImageIcon } from 'lucide-react';
import type {
  QualityCheckResult,
  QualityGrade,
  QualityGradeSource,
  WastePrice,
  WasteSubmission,
} from '../../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/api';

interface VerificationQueueProps {
  submissions: WasteSubmission[];
  prices?: WastePrice[];
  onApprove: (
    submissionId: string,
    actualWeight: number,
    qualityGrade: QualityGrade,
    qualityGradeSource: QualityGradeSource,
    adminQualityNotes?: string,
  ) => Promise<void>;
  onReject: (submissionId: string, reason: string) => Promise<void>;
  onRunQualityCheck: (
    submissionId: string,
    conditionDescription?: string,
  ) => Promise<QualityCheckResult>;
}

const qualityGradeOptions: Array<{
  value: QualityGrade;
  label: string;
  description: string;
}> = [
  { value: 'A', label: 'A', description: 'Kualitas baik / bersih' },
  { value: 'B', label: 'B', description: 'Kualitas sedang / sedikit kontaminasi' },
  { value: 'C', label: 'C', description: 'Kualitas rendah / banyak kontaminasi' },
];

const qualityMultipliers: Record<WasteSubmission['waste_type'], Record<QualityGrade, number>> = {
  oil: {
    A: 1,
    B: 0.85,
    C: 0.6,
  },
  food: {
    A: 1,
    B: 0.7,
    C: 0,
  },
};

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export function VerificationQueue({
  submissions,
  prices = [],
  onApprove,
  onReject,
  onRunQualityCheck,
}: VerificationQueueProps) {
  const [actualWeight, setActualWeight] = useState<Record<string, string>>({});
  const [qualityGrades, setQualityGrades] = useState<Record<string, QualityGrade>>({});
  const [qualityGradeSources, setQualityGradeSources] = useState<
    Record<string, QualityGradeSource>
  >({});
  const [adminQualityNotes, setAdminQualityNotes] = useState<Record<string, string>>({});
  const [conditionDescriptions, setConditionDescriptions] = useState<Record<string, string>>({});
  const [qualityResults, setQualityResults] = useState<
    Record<string, QualityCheckResult>
  >({});
  const [qualityErrors, setQualityErrors] = useState<Record<string, string>>({});
  const [qualityCheckingId, setQualityCheckingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (submissionId: string) => {
    const weight = actualWeight[submissionId];
    const parsedWeight = parseFloat(weight);

    if (!weight || !Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      toast.error('Masukkan berat aktual terlebih dahulu.');
      return;
    }

    const qualityGrade = qualityGrades[submissionId] || 'A';
    const qualityGradeSource = qualityGradeSources[submissionId] || 'admin';
    const qualityNotes = adminQualityNotes[submissionId]?.trim() || undefined;

    try {
      setProcessingId(submissionId);
      await onApprove(
        submissionId,
        parsedWeight,
        qualityGrade,
        qualityGradeSource,
        qualityNotes,
      );
      setActualWeight((prev) => ({ ...prev, [submissionId]: '' }));
      setQualityGrades((prev) => ({ ...prev, [submissionId]: 'A' }));
      setQualityGradeSources((prev) => ({ ...prev, [submissionId]: 'admin' }));
      setAdminQualityNotes((prev) => ({ ...prev, [submissionId]: '' }));
      toast.success(
        `Setoran berhasil diverifikasi dengan berat ${weight} KG dan grade ${qualityGrade}.`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal memverifikasi setoran.'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleRunQualityCheck = async (submission: WasteSubmission) => {
    const conditionDescription = conditionDescriptions[submission.id]?.trim();

    if (!conditionDescription) {
      toast.error(
        'Masukkan deskripsi kondisi limbah karena AI belum menganalisis foto secara visual.',
      );
      return;
    }

    try {
      setQualityCheckingId(submission.id);
      setQualityErrors((prev) => ({ ...prev, [submission.id]: '' }));
      const result = await onRunQualityCheck(submission.id, conditionDescription);
      setQualityResults((prev) => ({ ...prev, [submission.id]: result }));
      toast.success(`AI merekomendasikan grade ${result.recommendedGrade}.`);
    } catch (error) {
      const message = getErrorMessage(error, 'Gagal menjalankan AI Quality Check.');
      setQualityErrors((prev) => ({ ...prev, [submission.id]: message }));
      toast.error(message);
    } finally {
      setQualityCheckingId(null);
    }
  };

  const handleUseAiGrade = (
    submissionId: string,
    grade: QualityGrade,
    confidence: number,
  ) => {
    if (confidence < 0.5) {
      return;
    }

    if (
      confidence < 0.7 &&
      !window.confirm(
        'Confidence AI masih sedang/rendah. Tetap gunakan rekomendasi grade AI?',
      )
    ) {
      return;
    }

    setQualityGrades((prev) => ({ ...prev, [submissionId]: grade }));
    setQualityGradeSources((prev) => ({ ...prev, [submissionId]: 'ai' }));
    toast.success(`Grade AI ${grade} dipakai sebagai grade final sementara.`);
  };

  const handleReject = async (submissionId: string) => {
    const reason = prompt('Alasan penolakan:');
    if (!reason) return;

    try {
      setProcessingId(submissionId);
      await onReject(submissionId, reason);
      toast.success('Setoran ditolak.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal menolak setoran.'));
    } finally {
      setProcessingId(null);
    }
  };

  const getWasteTypeLabel = (type: WasteSubmission['waste_type']) => {
    const labels = {
      food: 'Sampah Sisa Makanan',
      oil: 'Minyak Jelantah',
    };
    return labels[type];
  };

  const getBasePrice = (submission: WasteSubmission) =>
    submission.price_snapshot_per_kg ??
    prices.find((price) => price.waste_type === submission.waste_type)?.price_per_kg;

  const getEstimatedPreview = (submission: WasteSubmission) => {
    const basePrice = getBasePrice(submission);
    const weight = parseFloat(actualWeight[submission.id] || '');

    if (!basePrice || !Number.isFinite(weight) || weight <= 0) {
      return null;
    }

    const grade = qualityGrades[submission.id] || 'A';
    const finalPricePerKg = Math.round(
      basePrice * qualityMultipliers[submission.waste_type][grade],
    );

    return Math.round(finalPricePerKg * weight);
  };

  const hasPricingMetadata = (submission: WasteSubmission) =>
    Boolean(
      submission.quality_grade ||
        submission.final_price_per_kg != null ||
        submission.pricing_explanation ||
        submission.earnings != null,
    );

  const getSavedQualityResult = (
    submission: WasteSubmission,
  ): QualityCheckResult | null => {
    if (!submission.ai_quality_grade) {
      return null;
    }

    return {
      submissionId: submission.id,
      wasteType: submission.waste_type,
      recommendedGrade: submission.ai_quality_grade,
      confidence: submission.ai_quality_confidence ?? 0,
      contaminationLevel: submission.ai_contamination_level ?? 'medium',
      reason: submission.ai_quality_reason ?? 'AI Quality Check sudah dijalankan.',
      matchedCriteria: submission.ai_quality_matched_criteria ?? [],
      tips: submission.ai_quality_tips ?? '',
      requiresAdminReview: true,
      modelProvider: submission.ai_quality_source ?? 'fallback_sop',
      modelVersion: submission.ai_quality_model ?? 'quality-assessment-mvp-v1',
      ragSource: submission.ai_quality_rag_source ?? 'fallback_sop',
    };
  };

  const getQualityResult = (submission: WasteSubmission) =>
    qualityResults[submission.id] ?? getSavedQualityResult(submission);

  const getRagSourceLabel = (source: QualityCheckResult['ragSource']) =>
    source === 'rag' ? 'Supabase RAG' : 'Fallback SOP';

  const getContaminationLabel = (
    level: QualityCheckResult['contaminationLevel'],
  ) => {
    const labels = {
      none: 'Tidak ada',
      low: 'Rendah',
      medium: 'Sedang',
      high: 'Tinggi',
    };
    return labels[level];
  };

  const getAssessmentStatusLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    if (confidence >= 0.4) return 'Low Confidence';
    return 'Needs Manual Review';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl text-white mb-6">Antrian Verifikasi</h2>

      {submissions.length === 0 ? (
        <div className="p-12 rounded-xl bg-white/5 border border-white/10 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Tidak ada setoran yang perlu diverifikasi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Submission Info */}
                <div className="md:col-span-1">
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">ID Setoran</div>
                    <div className="text-white font-mono">#{submission.id}</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Jenis Limbah</div>
                    <div className="text-white">{getWasteTypeLabel(submission.waste_type)}</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Estimasi Berat</div>
                    <div className="text-white">{submission.estimated_weight} KG</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Waktu Submit</div>
                    <div className="text-white">
                      {format(new Date(submission.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                <div className="md:col-span-1">
                  <div className="aspect-square rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    {submission.image_url ? (
                      <img
                        src={submission.image_url}
                        alt="Waste"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No image</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="md:col-span-1">
                  <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                    <div className="text-white mb-3">AI Quality Check</div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Deskripsi kondisi limbah
                    </label>
                    <textarea
                      value={conditionDescriptions[submission.id] || ''}
                      onChange={(e) =>
                        setConditionDescriptions((prev) => ({
                          ...prev,
                          [submission.id]: e.target.value,
                        }))
                      }
                      placeholder="Contoh: Minyak agak keruh, ada sedikit endapan, tidak terlihat bercampur air."
                      rows={3}
                      className="w-full resize-none px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none"
                    />
                    <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                      Catatan: Pada MVP ini AI belum membaca foto secara visual.
                      Deskripsi kondisi dari admin digunakan bersama SOP RAG.
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleRunQualityCheck(submission)}
                      disabled={qualityCheckingId === submission.id}
                      className="mt-3 w-full py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-60"
                    >
                      {qualityCheckingId === submission.id
                        ? 'Menganalisis...'
                        : 'Analisis AI'}
                    </button>

                    {qualityErrors[submission.id] && (
                      <p className="mt-3 text-sm text-red-300">
                        {qualityErrors[submission.id]}
                      </p>
                    )}

                    {getQualityResult(submission) && (
                      <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-400">Rekomendasi Grade</span>
                          <span className="text-white">
                            {getQualityResult(submission)!.recommendedGrade}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-400">Confidence</span>
                          <span className="text-right text-white">
                            {Math.round(getQualityResult(submission)!.confidence * 100)}%
                            <span className="ml-2 text-xs text-blue-200">
                              {getAssessmentStatusLabel(
                                getQualityResult(submission)!.confidence,
                              )}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-400">Tingkat Kontaminasi</span>
                          <span className="text-white">
                            {getContaminationLabel(
                              getQualityResult(submission)!.contaminationLevel,
                            )}
                          </span>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Alasan</div>
                          <p className="text-gray-200 leading-relaxed">
                            {getQualityResult(submission)!.reason}
                          </p>
                        </div>
                        {getQualityResult(submission)!.matchedCriteria.length > 0 && (
                          <div>
                            <div className="text-gray-400 mb-1">Kriteria Cocok</div>
                            <ul className="list-disc pl-4 text-gray-200 space-y-1">
                              {getQualityResult(submission)!.matchedCriteria.map(
                                (criteria, index) => (
                                  <li key={`${submission.id}-criteria-${index}`}>
                                    {criteria}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                        {getQualityResult(submission)!.tips && (
                          <div>
                            <div className="text-gray-400 mb-1">Tips</div>
                            <p className="text-gray-200 leading-relaxed">
                              {getQualityResult(submission)!.tips}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-400">RAG Source</span>
                          <span className="text-white">
                            {getRagSourceLabel(getQualityResult(submission)!.ragSource)}
                          </span>
                        </div>
                        <p className="text-yellow-200 leading-relaxed">
                          AI hanya memberi rekomendasi. Admin tetap menentukan grade
                          final.
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            handleUseAiGrade(
                              submission.id,
                              getQualityResult(submission)!.recommendedGrade,
                              getQualityResult(submission)!.confidence,
                            )
                          }
                          disabled={getQualityResult(submission)!.confidence < 0.5}
                          className="w-full py-2 bg-green-500/20 text-green-300 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Gunakan Grade AI
                        </button>
                        {getQualityResult(submission)!.confidence < 0.5 && (
                          <p className="text-xs text-yellow-200 leading-relaxed">
                            Confidence AI terlalu rendah. Silakan pilih grade manual.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
                    {hasPricingMetadata(submission) ? (
                      <div className="space-y-2">
                        {submission.quality_grade && (
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-gray-400">Grade Kualitas</span>
                            <span className="text-white">{submission.quality_grade}</span>
                          </div>
                        )}
                        {submission.final_price_per_kg != null && (
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-gray-400">Harga Final / KG</span>
                            <span className="text-white">
                              {formatRupiah(submission.final_price_per_kg)}
                            </span>
                          </div>
                        )}
                        {submission.earnings != null && (
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-gray-400">Total Cuan</span>
                            <span className="text-green-400">
                              {formatRupiah(submission.earnings)}
                            </span>
                          </div>
                        )}
                        {submission.pricing_explanation && (
                          <div>
                            <div className="text-sm text-gray-400 mb-1">Penjelasan Harga</div>
                            <p className="text-sm text-gray-200 leading-relaxed">
                              {submission.pricing_explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Nilai final dihitung backend berdasarkan berat aktual dan grade
                        kualitas.
                      </p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-white mb-2">Berat Aktual (KG)</label>
                    <input
                      type="number"
                      value={actualWeight[submission.id] || ''}
                      onChange={(e) => setActualWeight(prev => ({ ...prev, [submission.id]: e.target.value }))}
                      placeholder="0.0"
                      step="0.1"
                      min="0"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-white mb-2">Grade Kualitas</label>
                    <select
                      value={qualityGrades[submission.id] || 'A'}
                      onChange={(e) =>
                        {
                          setQualityGrades((prev) => ({
                            ...prev,
                            [submission.id]: e.target.value as QualityGrade,
                          }));
                          setQualityGradeSources((prev) => ({
                            ...prev,
                            [submission.id]: 'admin',
                          }));
                        }
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-green-500 focus:outline-none"
                    >
                      {qualityGradeOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-[#0a0a0f]">
                          {option.label}: {option.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-white mb-2">Catatan Kualitas Admin</label>
                    <textarea
                      value={adminQualityNotes[submission.id] || ''}
                      onChange={(e) =>
                        setAdminQualityNotes((prev) => ({
                          ...prev,
                          [submission.id]: e.target.value,
                        }))
                      }
                      placeholder="Opsional: catatan admin jika grade diubah atau memakai rekomendasi AI."
                      rows={2}
                      className="w-full resize-none px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                    />
                    <p className="mt-2 text-xs text-gray-400">
                      Sumber grade: {qualityGradeSources[submission.id] === 'ai' ? 'AI' : 'Admin'}
                    </p>
                  </div>

                  {getEstimatedPreview(submission) != null && (
                    <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                      <div className="text-sm text-green-300 mb-1">Estimasi Cuan</div>
                      <p className="text-sm text-gray-200 leading-relaxed">
                        Estimasi sementara: {formatRupiah(getEstimatedPreview(submission)!)}.
                        Nilai final tetap dihitung backend saat verifikasi.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={() => void handleApprove(submission.id)}
                      disabled={processingId === submission.id}
                      className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>
                        {processingId === submission.id ? 'Memproses...' : 'Approve & Verify'}
                      </span>
                    </button>

                    <button
                      onClick={() => void handleReject(submission.id)}
                      disabled={processingId === submission.id}
                      className="w-full py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
