import { useEffect, useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import type {
  QualitySimilarCase,
  QualitySimilarCaseSearchProvider,
  QualitySimilarCaseSearchResult,
  WasteType,
} from '../../types';
import { api, getErrorMessage } from '../../lib/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AiSimilarCasesPanelProps {
  accessToken: string;
  submissionId: string;
}

const providerOptions: Array<{
  value: QualitySimilarCaseSearchProvider;
  label: string;
}> = [
  { value: 'auto', label: 'Auto' },
  { value: 'supabase_pgvector', label: 'Supabase pgvector' },
  { value: 'application_cosine', label: 'Application cosine' },
];

const providerLabels: Record<string, string> = {
  supabase_pgvector: 'Supabase pgvector',
  application_cosine: 'Application cosine fallback',
  fallback_none: 'Fallback none / no similar case',
  embedding_unavailable: 'Embedding unavailable',
};

const wasteTypeLabels: Record<WasteType, string> = {
  oil: 'Minyak Jelantah',
  food: 'Sisa Makanan',
};

function formatPercent(value: number | null | undefined) {
  return value == null ? '-' : `${Math.round(value * 100)}%`;
}

function formatDate(value: string) {
  return format(new Date(value), 'dd MMM yyyy, HH:mm', { locale: id });
}

function SimilarCaseCard({ item }: { item: QualitySimilarCase }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="flex gap-3">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={`Kasus historis ${item.submission_id}`}
            className="h-20 w-20 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-500">
            <Database className="h-7 w-7" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="font-mono text-xs text-white">
              #{item.submission_id}
            </div>
            <div className="rounded-full bg-green-500/15 px-2 py-1 text-xs text-green-200">
              Similarity {formatPercent(item.similarity)}
            </div>
          </div>

          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <div>
              <span className="text-gray-400">Jenis Limbah: </span>
              <span className="text-gray-100">
                {wasteTypeLabels[item.waste_type]}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Final Admin: </span>
              <span className="text-white">{item.final_quality_grade || '-'}</span>
            </div>
            <div>
              <span className="text-gray-400">AI Grade: </span>
              <span className="text-white">{item.ai_quality_grade || '-'}</span>
            </div>
            <div>
              <span className="text-gray-400">AI Confidence: </span>
              <span className="text-white">
                {formatPercent(item.ai_quality_confidence)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Override Reason: </span>
              <span className="text-white">
                {item.override_primary_reason || '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">AI Error Pattern: </span>
              <span className="text-white">{item.ai_error_pattern || '-'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-gray-400">Tanggal: </span>
              <span className="text-white">{formatDate(item.created_at)}</span>
            </div>
          </div>

          {item.visual_observation_text && (
            <div className="mt-3">
              <div className="mb-1 text-xs text-gray-400">
                Observasi Visual Historis
              </div>
              <p className="line-clamp-4 text-sm leading-relaxed text-gray-200">
                {item.visual_observation_text}
              </p>
            </div>
          )}

          {item.quality_feedback?.note && (
            <div className="mt-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-2">
              <div className="mb-1 text-xs text-yellow-100">
                Catatan Admin
              </div>
              <p className="text-sm leading-relaxed text-yellow-50">
                {item.quality_feedback.note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AiSimilarCasesPanel({
  accessToken,
  submissionId,
}: AiSimilarCasesPanelProps) {
  const [provider, setProvider] =
    useState<QualitySimilarCaseSearchProvider>('auto');
  const [limit, setLimit] = useState(5);
  const [minSimilarity, setMinSimilarity] = useState(0.72);
  const [result, setResult] = useState<QualitySimilarCaseSearchResult | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSimilarCases = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await api.getQualitySimilarCases(accessToken, {
        submissionId,
        limit,
        minSimilarity,
        provider,
      });
      setResult(response);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Gagal memuat kasus historis mirip.'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSimilarCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  const providerLabel = result
    ? providerLabels[result.provider] || result.provider
    : 'Belum dimuat';

  return (
    <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-white">Evidence Multimodal RAG</div>
          <p className="mt-1 text-xs leading-relaxed text-emerald-50">
            Kasus historis mirip hanya digunakan sebagai konteks tambahan.
            Admin tetap menentukan grade final dan payout.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadSimilarCases()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/20 px-3 py-2 text-sm text-emerald-100 transition-all hover:bg-emerald-500/30 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="mb-3 grid gap-2 md:grid-cols-3">
        <label className="text-xs text-gray-300">
          Provider
          <select
            value={provider}
            onChange={(event) =>
              setProvider(event.target.value as QualitySimilarCaseSearchProvider)
            }
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
          >
            {providerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-gray-300">
          Min Similarity
          <select
            value={minSimilarity}
            onChange={(event) => setMinSimilarity(Number(event.target.value))}
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
          >
            <option value={0.6}>60%</option>
            <option value={0.72}>72%</option>
            <option value={0.8}>80%</option>
            <option value={0.9}>90%</option>
          </select>
        </label>
        <label className="text-xs text-gray-300">
          Limit
          <select
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
          >
            <option value={3}>3 kasus</option>
            <option value={5}>5 kasus</option>
            <option value={10}>10 kasus</option>
          </select>
        </label>
      </div>

      <div className="mb-3 grid gap-2 text-xs md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
          <div className="text-gray-400">Provider Retrieval</div>
          <div className="text-white">{providerLabel}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
          <div className="text-gray-400">Fallback Used</div>
          <div className="text-white">{result?.fallbackUsed ? 'Ya' : 'Tidak'}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
          <div className="text-gray-400">Jumlah Kasus Mirip</div>
          <div className="text-white">{result?.cases.length ?? 0}</div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
          Memuat kasus historis mirip...
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && result && result.cases.length === 0 && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
          Belum ada kasus historis mirip.
        </div>
      )}

      {!isLoading && !errorMessage && result && result.cases.length > 0 && (
        <div className="space-y-3">
          {result.cases.map((item) => (
            <SimilarCaseCard key={item.submission_id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
