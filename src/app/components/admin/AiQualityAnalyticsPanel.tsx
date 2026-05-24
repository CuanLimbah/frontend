import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle2,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { api, getErrorMessage } from '../../lib/api';
import type { QualityAiAnalytics, QualityGrade, WasteType } from '../../types';

interface AiQualityAnalyticsPanelProps {
  accessToken: string;
}

type WasteTypeFilter = WasteType | 'all';

const grades: QualityGrade[] = ['A', 'B', 'C'];
const overrideTransitions = ['A->B', 'A->C', 'B->A', 'B->C', 'C->A', 'C->B'];
const thresholdBuckets = [
  '0.00-0.59',
  '0.60-0.69',
  '0.70-0.79',
  '0.80-0.89',
  '0.90-1.00',
];

function formatPercent(value: number | null | undefined) {
  return value == null ? 'Belum tersedia' : `${Math.round(value * 100)}%`;
}

function formatNumber(value: number | null | undefined) {
  return (value ?? 0).toLocaleString('id-ID');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getWasteTypeLabel(type: WasteType) {
  return type === 'oil' ? 'Minyak Jelantah' : 'Sisa Makanan';
}

function getCountRows(counts: Record<string, number> | undefined) {
  return Object.entries(counts ?? {})
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
}

function getDefaultMultimodalRag(): NonNullable<
  QualityAiAnalytics['multimodalRag']
> {
  return {
    totalAiQualityChecks: 0,
    usedCount: 0,
    notUsedCount: 0,
    usageRate: 0,
    embeddingUnavailableCount: 0,
    noSimilarCaseCount: 0,
    similarCaseContextUsedCount: 0,
    averageSimilarCaseCount: null,
    averageTopSimilarityScore: null,
    averageConfidenceWhenUsed: null,
    averageConfidenceWhenNotUsed: null,
    overrideRateWhenUsed: 0,
    overrideRateWhenNotUsed: 0,
    agreementRateWhenUsed: 0,
    agreementRateWhenNotUsed: 0,
    adminDecisionCountWhenUsed: 0,
    adminDecisionCountWhenNotUsed: 0,
    overrideCountWhenUsed: 0,
    overrideCountWhenNotUsed: 0,
    sourceUsage: {
      similar_quality_cases: 0,
      none: 0,
      embedding_unavailable: 0,
      unknown: 0,
    },
    providerUsage: {
      supabase_pgvector: 0,
      application_cosine: 0,
      fallback_none: 0,
      embedding_unavailable: 0,
      unknown: 0,
    },
    byWasteType: {
      oil: {
        totalAiQualityChecks: 0,
        usedCount: 0,
        usageRate: 0,
        averageTopSimilarityScore: null,
        overrideRateWhenUsed: 0,
        overrideRateWhenNotUsed: 0,
      },
      food: {
        totalAiQualityChecks: 0,
        usedCount: 0,
        usageRate: 0,
        averageTopSimilarityScore: null,
        overrideRateWhenUsed: 0,
        overrideRateWhenNotUsed: 0,
      },
    },
  };
}

function getDefaultRetrievalQuality(): NonNullable<
  NonNullable<QualityAiAnalytics['multimodalRag']>['retrievalQuality']
> {
  return {
    totalRetrievals: 0,
    supabaseRetrievals: 0,
    applicationFallbackRetrievals: 0,
    noResultRetrievals: 0,
    embeddingUnavailableRetrievals: 0,
    averageTopSimilarity: null,
    averageSimilarCaseCount: null,
    lowSimilarityCount: 0,
    lowSimilarityRate: 0,
    highSimilarityCount: 0,
    highSimilarityRate: 0,
    byThresholdBucket: {},
    byProvider: {},
    currentConfig: {
      topK: 5,
      minSimilarity: 0.72,
      provider: 'supabase_pgvector',
    },
    recommendation: 'Retrieval quality tuning belum tersedia.',
  };
}

function getMultimodalInterpretations(
  multimodal: NonNullable<QualityAiAnalytics['multimodalRag']>,
) {
  const messages: string[] = [];

  if (multimodal.usageRate === 0) {
    messages.push('Multimodal RAG belum digunakan pada data yang difilter.');
  }
  if (multimodal.embeddingUnavailableCount > 0) {
    messages.push(
      'Ada kasus embedding visual-text belum tersedia. Jalankan backfill embedding.',
    );
  }
  if (multimodal.noSimilarCaseCount > 0) {
    messages.push('Sebagian submission belum menemukan kasus historis mirip.');
  }
  if (
    multimodal.adminDecisionCountWhenUsed > 0 &&
    multimodal.adminDecisionCountWhenNotUsed > 0 &&
    multimodal.overrideRateWhenUsed < multimodal.overrideRateWhenNotUsed
  ) {
    messages.push(
      'Indikasi awal Multimodal RAG membantu menurunkan override rate.',
    );
  }
  if (
    multimodal.adminDecisionCountWhenUsed > 0 &&
    multimodal.adminDecisionCountWhenNotUsed > 0 &&
    multimodal.overrideRateWhenUsed > multimodal.overrideRateWhenNotUsed
  ) {
    messages.push('Perlu audit kualitas retrieval kasus historis.');
  }
  if ((multimodal.providerUsage?.supabase_pgvector ?? 0) > 0) {
    messages.push(
      'Supabase pgvector sudah digunakan sebagai production vector search.',
    );
  }
  if ((multimodal.providerUsage?.application_cosine ?? 0) > 0) {
    messages.push(
      'Sebagian retrieval masih memakai fallback application-level cosine.',
    );
  }

  return messages;
}

function MetricCard({
  label,
  value,
  tone = 'green',
}: {
  label: string;
  value: string;
  tone?: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'gray';
}) {
  const toneClass = {
    green: 'from-green-500/20 to-green-500/5 border-green-500/30',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
    gray: 'from-white/10 to-white/5 border-white/10',
  }[tone];

  return (
    <div className={`rounded-lg border bg-gradient-to-br p-4 ${toneClass}`}>
      <div className="text-xs text-gray-400 mb-2">{label}</div>
      <div className="text-2xl text-white">{value}</div>
    </div>
  );
}

function UsageBox({
  title,
  rows,
  warning,
}: {
  title: string;
  rows: Array<{ label: string; value: number }>;
  warning?: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <h3 className="text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-400">{row.label}</span>
            <span className="text-white">{formatNumber(row.value)}</span>
          </div>
        ))}
      </div>
      {warning && (
        <div className="mt-4 flex gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-100">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{warning}</p>
        </div>
      )}
    </div>
  );
}

export function AiQualityAnalyticsPanel({
  accessToken,
}: AiQualityAnalyticsPanelProps) {
  const [analytics, setAnalytics] = useState<QualityAiAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [wasteType, setWasteType] = useState<WasteTypeFilter>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<{
    wasteType: WasteTypeFilter;
    startDate: string;
    endDate: string;
  }>({ wasteType: 'all', startDate: '', endDate: '' });

  async function loadAnalytics(filters = appliedFilters) {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await api.getQualityAiAnalytics(accessToken, {
        wasteType: filters.wasteType === 'all' ? undefined : filters.wasteType,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setAnalytics(response);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Gagal memuat AI Quality Analytics.'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const visibleOverrideRows = useMemo(
    () =>
      overrideTransitions
        .map((transition) => ({
          transition,
          count: analytics?.overrideMatrix[transition] ?? 0,
        }))
        .filter((row) => row.count > 0),
    [analytics],
  );

  const feedbackRows = useMemo(
    () => getCountRows(analytics?.feedbackTagCounts),
    [analytics],
  );
  const primaryReasonRows = useMemo(
    () => getCountRows(analytics?.primaryOverrideReasons),
    [analytics],
  );
  const aiErrorRows = useMemo(
    () => getCountRows(analytics?.aiErrorPatterns),
    [analytics],
  );
  const multimodalRag = useMemo(
    () => analytics?.multimodalRag ?? getDefaultMultimodalRag(),
    [analytics],
  );
  const retrievalQuality = useMemo(
    () => multimodalRag.retrievalQuality ?? getDefaultRetrievalQuality(),
    [multimodalRag],
  );
  const multimodalInterpretations = useMemo(
    () => getMultimodalInterpretations(multimodalRag),
    [multimodalRag],
  );

  const handleApplyFilter = () => {
    const nextFilters = { wasteType, startDate, endDate };
    setAppliedFilters(nextFilters);
    void loadAnalytics(nextFilters);
  };

  const handleReset = () => {
    const nextFilters = { wasteType: 'all' as const, startDate: '', endDate: '' };
    setWasteType('all');
    setStartDate('');
    setEndDate('');
    setAppliedFilters(nextFilters);
    void loadAnalytics(nextFilters);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-green-300 mb-2">
              <Brain className="w-5 h-5" />
              <span className="text-sm uppercase tracking-wide">
                AI Quality Analytics
              </span>
            </div>
            <h2 className="text-2xl text-white mb-2">AI Quality Analytics</h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-3xl">
              Pantau performa rekomendasi AI, penggunaan RAG, vision fallback,
              dan override admin.
            </p>
          </div>
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-100 max-w-xl">
            Analytics ini digunakan untuk mengevaluasi performa rekomendasi AI.
            Admin tetap menjadi validator akhir, dan Dynamic Pricing memakai
            grade final admin.
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-2 text-white mb-4">
          <Filter className="w-5 h-5 text-green-400" />
          <h3>Filter</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Jenis Limbah</label>
            <select
              value={wasteType}
              onChange={(event) => setWasteType(event.target.value as WasteTypeFilter)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white focus:border-green-500 focus:outline-none"
            >
              <option value="all" className="bg-[#0a0a0f]">
                Semua Jenis Limbah
              </option>
              <option value="oil" className="bg-[#0a0a0f]">
                Minyak Jelantah
              </option>
              <option value="food" className="bg-[#0a0a0f]">
                Sisa Makanan
              </option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white focus:border-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white focus:border-green-500 focus:outline-none"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleApplyFilter}
              className="flex-1 rounded-lg bg-green-500 px-4 py-2.5 text-white transition-all hover:bg-green-600"
            >
              Apply Filter
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Reset"
              className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-gray-300 transition-all hover:bg-white/10"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-300">
          Memuat AI Quality Analytics...
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-100">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && analytics && analytics.totalQualityChecks === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <BarChart3 className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-white mb-1">Belum ada AI Quality Check.</p>
          <p className="text-sm text-gray-400">
            Jalankan AI Quality Check pada setoran untuk mulai mengisi analytics.
          </p>
        </div>
      )}

      {!isLoading && !errorMessage && analytics && analytics.totalQualityChecks > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <MetricCard
              label="Total AI Quality Check"
              value={formatNumber(analytics.totalQualityChecks)}
            />
            <MetricCard
              label="Agreement Rate AI"
              value={formatPercent(analytics.agreementRate)}
              tone="blue"
            />
            <MetricCard
              label="Override Rate Admin"
              value={formatPercent(analytics.overrideRate)}
              tone={analytics.overrideRate > 0.3 ? 'yellow' : 'purple'}
            />
            <MetricCard
              label="Rata-rata Confidence"
              value={formatPercent(analytics.averageConfidence)}
              tone="green"
            />
            <MetricCard
              label="Kasus Confidence Rendah"
              value={formatNumber(analytics.lowConfidenceReviewCount)}
              tone={analytics.lowConfidenceReviewCount > 0 ? 'yellow' : 'gray'}
            />
            <MetricCard
              label="Total Admin Decisions"
              value={formatNumber(analytics.totalAdminDecisions)}
              tone="gray"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <UsageBox
              title="Penggunaan SOP / RAG"
              rows={[
                { label: 'Supabase RAG', value: analytics.ragUsage.rag },
                { label: 'Fallback SOP', value: analytics.ragUsage.fallback_sop },
                { label: 'Unknown', value: analytics.ragUsage.unknown },
              ]}
              warning={
                analytics.ragUsage.fallback_sop > analytics.ragUsage.rag
                  ? 'Fallback SOP cukup sering digunakan. Periksa kualitas dokumen SOP RAG atau konfigurasi Supabase.'
                  : undefined
              }
            />
            <UsageBox
              title="Penggunaan Vision AI"
              rows={[
                { label: 'Vision LLM', value: analytics.visionUsage.vision_llm },
                { label: 'Fallback Vision', value: analytics.visionUsage.fallback },
                { label: 'Unknown', value: analytics.visionUsage.unknown },
              ]}
              warning={
                analytics.visionUsage.fallback > analytics.visionUsage.vision_llm
                  ? 'Vision fallback cukup sering terjadi. Periksa konfigurasi provider vision/API key atau kualitas foto.'
                  : undefined
              }
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4">
              <h3 className="text-white mb-2">Multimodal RAG Performance</h3>
              <p className="text-sm text-gray-400">
                Pantau penggunaan embedding visual-text, kasus historis mirip,
                dan perbandingan keputusan admin saat konteks historis tersedia.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard
                label="Usage Rate"
                value={formatPercent(multimodalRag.usageRate)}
                tone="blue"
              />
              <MetricCard
                label="Used Count"
                value={formatNumber(multimodalRag.usedCount)}
                tone="green"
              />
              <MetricCard
                label="Embedding Unavailable"
                value={formatNumber(multimodalRag.embeddingUnavailableCount)}
                tone={
                  multimodalRag.embeddingUnavailableCount > 0 ? 'yellow' : 'gray'
                }
              />
              <MetricCard
                label="No Similar Case Found"
                value={formatNumber(multimodalRag.noSimilarCaseCount)}
                tone={multimodalRag.noSimilarCaseCount > 0 ? 'yellow' : 'gray'}
              />
              <MetricCard
                label="Avg Top Similarity"
                value={formatPercent(multimodalRag.averageTopSimilarityScore)}
                tone="purple"
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard
                label="Avg Similar Case Count"
                value={formatNumber(multimodalRag.averageSimilarCaseCount)}
                tone="gray"
              />
              <MetricCard
                label="Override Rate With RAG"
                value={formatPercent(multimodalRag.overrideRateWhenUsed)}
                tone="blue"
              />
              <MetricCard
                label="Override Rate Without RAG"
                value={formatPercent(multimodalRag.overrideRateWhenNotUsed)}
                tone="yellow"
              />
              <MetricCard
                label="Agreement With RAG"
                value={formatPercent(multimodalRag.agreementRateWhenUsed)}
                tone="green"
              />
              <MetricCard
                label="Agreement Without RAG"
                value={formatPercent(multimodalRag.agreementRateWhenNotUsed)}
                tone="gray"
              />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <UsageBox
                title="Source Usage Multimodal RAG"
                rows={[
                  {
                    label: 'Similar Quality Cases',
                    value: multimodalRag.sourceUsage.similar_quality_cases,
                  },
                  { label: 'None / No Similar Case', value: multimodalRag.sourceUsage.none },
                  {
                    label: 'Embedding Unavailable',
                    value: multimodalRag.sourceUsage.embedding_unavailable,
                  },
                  { label: 'Unknown', value: multimodalRag.sourceUsage.unknown },
                ]}
              />
              <UsageBox
                title="Provider Retrieval"
                rows={[
                  {
                    label: 'Supabase pgvector',
                    value: multimodalRag.providerUsage?.supabase_pgvector ?? 0,
                  },
                  {
                    label: 'Application cosine fallback',
                    value: multimodalRag.providerUsage?.application_cosine ?? 0,
                  },
                  {
                    label: 'Fallback none',
                    value: multimodalRag.providerUsage?.fallback_none ?? 0,
                  },
                  {
                    label: 'Embedding unavailable',
                    value:
                      multimodalRag.providerUsage?.embedding_unavailable ?? 0,
                  },
                  {
                    label: 'Unknown',
                    value: multimodalRag.providerUsage?.unknown ?? 0,
                  },
                ]}
              />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-1">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h4 className="text-white mb-4">Interpretasi</h4>
                {multimodalInterpretations.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Belum ada sinyal risiko dominan pada Multimodal RAG.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {multimodalInterpretations.map((message) => (
                      <div
                        key={message}
                        className="flex gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-100"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>{message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4">
              <h4 className="text-white mb-2">Retrieval Quality Tuning</h4>
              <p className="text-sm text-gray-400 mb-4">
                Evaluasi kualitas retrieval untuk menentukan threshold dan topK
                yang paling stabil.
              </p>

              {multimodalRag.retrievalQuality ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <MetricCard
                      label="Total Retrievals"
                      value={formatNumber(retrievalQuality.totalRetrievals)}
                      tone="gray"
                    />
                    <MetricCard
                      label="Supabase Retrievals"
                      value={formatNumber(retrievalQuality.supabaseRetrievals)}
                      tone="green"
                    />
                    <MetricCard
                      label="Application Fallback"
                      value={formatNumber(
                        retrievalQuality.applicationFallbackRetrievals,
                      )}
                      tone="yellow"
                    />
                    <MetricCard
                      label="No Result Retrievals"
                      value={formatNumber(retrievalQuality.noResultRetrievals)}
                      tone="yellow"
                    />
                    <MetricCard
                      label="Embedding Unavailable"
                      value={formatNumber(
                        retrievalQuality.embeddingUnavailableRetrievals,
                      )}
                      tone="red"
                    />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <MetricCard
                      label="Avg Top Similarity"
                      value={formatPercent(retrievalQuality.averageTopSimilarity)}
                      tone="purple"
                    />
                    <MetricCard
                      label="Avg Similar Case Count"
                      value={formatNumber(
                        retrievalQuality.averageSimilarCaseCount,
                      )}
                      tone="gray"
                    />
                    <MetricCard
                      label="Low Similarity Rate"
                      value={formatPercent(retrievalQuality.lowSimilarityRate)}
                      tone="yellow"
                    />
                    <MetricCard
                      label="High Similarity Rate"
                      value={formatPercent(retrievalQuality.highSimilarityRate)}
                      tone="green"
                    />
                    <MetricCard
                      label="Current topK"
                      value={formatNumber(retrievalQuality.currentConfig.topK)}
                      tone="blue"
                    />
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-lg border border-white/10 p-4">
                      <h5 className="text-white mb-3">Threshold Buckets</h5>
                      <div className="space-y-3">
                        {thresholdBuckets.map((bucket) => (
                          <div
                            key={bucket}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="text-gray-400">{bucket}</span>
                            <span className="text-white">
                              {formatNumber(
                                retrievalQuality.byThresholdBucket[bucket],
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                      <h5 className="text-green-100 mb-3">Rekomendasi</h5>
                      <div className="space-y-2 text-sm text-green-50">
                        <p>
                          Current minSimilarity:{' '}
                          {formatPercent(
                            retrievalQuality.currentConfig.minSimilarity,
                          )}
                        </p>
                        <p>Provider: {retrievalQuality.currentConfig.provider}</p>
                        <p>{retrievalQuality.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">
                  Retrieval quality tuning belum tersedia.
                </p>
              )}
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-gray-400">
                    <th className="py-3 pr-4">Jenis Limbah</th>
                    <th className="py-3 pr-4">Total AI Checks</th>
                    <th className="py-3 pr-4">Multimodal Used</th>
                    <th className="py-3 pr-4">Usage Rate</th>
                    <th className="py-3 pr-4">Avg Top Similarity</th>
                    <th className="py-3 pr-4">Override Rate Used</th>
                    <th className="py-3">Override Rate Not Used</th>
                  </tr>
                </thead>
                <tbody>
                  {(['oil', 'food'] as WasteType[]).map((type) => (
                    <tr key={type} className="border-b border-white/5 text-gray-200">
                      <td className="py-3 pr-4 text-white">
                        {getWasteTypeLabel(type)}
                      </td>
                      <td className="py-3 pr-4">
                        {formatNumber(
                          multimodalRag.byWasteType[type].totalAiQualityChecks,
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {formatNumber(multimodalRag.byWasteType[type].usedCount)}
                      </td>
                      <td className="py-3 pr-4">
                        {formatPercent(multimodalRag.byWasteType[type].usageRate)}
                      </td>
                      <td className="py-3 pr-4">
                        {formatPercent(
                          multimodalRag.byWasteType[type].averageTopSimilarityScore,
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {formatPercent(
                          multimodalRag.byWasteType[type].overrideRateWhenUsed,
                        )}
                      </td>
                      <td className="py-3">
                        {formatPercent(
                          multimodalRag.byWasteType[type].overrideRateWhenNotUsed,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-white mb-4">Distribusi Grade</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-gray-400">
                      <th className="py-3">Grade</th>
                      <th className="py-3">AI Recommendation</th>
                      <th className="py-3">Final Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade) => (
                      <tr key={grade} className="border-b border-white/5 text-white">
                        <td className="py-3">Grade {grade}</td>
                        <td className="py-3">
                          {formatNumber(analytics.gradeDistribution.ai[grade])}
                        </td>
                        <td className="py-3">
                          {formatNumber(analytics.gradeDistribution.admin[grade])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-white mb-4">By Waste Type</h3>
              <div className="grid gap-3">
                {(['oil', 'food'] as WasteType[]).map((type) => (
                  <div key={type} className="rounded-lg border border-white/10 p-4">
                    <div className="text-white mb-3">{getWasteTypeLabel(type)}</div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-gray-400">Total Checks</div>
                        <div className="text-white">
                          {formatNumber(analytics.byWasteType[type].totalQualityChecks)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Override</div>
                        <div className="text-white">
                          {formatNumber(analytics.byWasteType[type].adminOverrideCount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Avg Confidence</div>
                        <div className="text-white">
                          {formatPercent(analytics.byWasteType[type].averageConfidence)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-white mb-4">Pola Override Grade</h3>
            {visibleOverrideRows.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada pola override grade.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleOverrideRows.map((row) => (
                  <div
                    key={row.transition}
                    className="flex items-center justify-between rounded-lg border border-white/10 p-4"
                  >
                    <span className="text-white">{row.transition}</span>
                    <span className="text-green-300">{formatNumber(row.count)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {[
              {
                title: 'Feedback Admin',
                rows: feedbackRows,
                empty: 'Belum ada feedback terstruktur dari admin.',
              },
              {
                title: 'Primary Override Reasons',
                rows: primaryReasonRows,
                empty: 'Belum ada alasan utama override.',
              },
              {
                title: 'AI Error Patterns',
                rows: aiErrorRows,
                empty: 'Belum ada pola error AI.',
              },
            ].map((section) => (
              <div
                key={section.title}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-white mb-4">{section.title}</h3>
                {section.rows.length === 0 ? (
                  <p className="text-sm text-gray-400">{section.empty}</p>
                ) : (
                  <div className="space-y-3">
                    {section.rows.map(([label, count]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3"
                      >
                        <span className="text-sm text-gray-200">{label}</span>
                        <span className="text-green-300">
                          {formatNumber(count)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <h3 className="text-white">Override Terbaru</h3>
            </div>
            {analytics.recentOverrides.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada override admin.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-gray-400">
                      <th className="py-3 pr-4">Submission ID</th>
                      <th className="py-3 pr-4">Jenis Limbah</th>
                      <th className="py-3 pr-4">AI Grade</th>
                      <th className="py-3 pr-4">Final Grade Admin</th>
                      <th className="py-3 pr-4">Confidence</th>
                      <th className="py-3 pr-4">Catatan Admin</th>
                      <th className="py-3">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentOverrides.map((override) => (
                      <tr
                        key={`${override.submission_id}-${override.created_at}`}
                        className="border-b border-white/5 text-gray-200"
                      >
                        <td className="py-3 pr-4 font-mono text-xs text-white">
                          #{override.submission_id}
                        </td>
                        <td className="py-3 pr-4">
                          {getWasteTypeLabel(override.waste_type)}
                        </td>
                        <td className="py-3 pr-4">
                          {override.ai_quality_grade ?? '-'}
                        </td>
                        <td className="py-3 pr-4">
                          {override.final_quality_grade ?? '-'}
                        </td>
                        <td className="py-3 pr-4">
                          {formatPercent(override.ai_quality_confidence)}
                        </td>
                        <td className="py-3 pr-4 max-w-xs">
                          {override.admin_quality_notes ?? '-'}
                        </td>
                        <td className="py-3">{formatDate(override.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
