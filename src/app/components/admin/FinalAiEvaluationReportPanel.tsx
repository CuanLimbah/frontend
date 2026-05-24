import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, RefreshCw } from 'lucide-react';
import { api, getErrorMessage } from '../../lib/api';
import type { FinalAiEvaluationReport } from '../../types';

interface FinalAiEvaluationReportPanelProps {
  accessToken: string;
}

function formatPercent(value: number | null | undefined) {
  return value == null ? 'Belum tersedia' : `${Math.round(value * 100)}%`;
}

function formatNumber(value: number | null | undefined) {
  return (value ?? 0).toLocaleString('id-ID');
}

function getReadinessMeta(
  status: FinalAiEvaluationReport['summary']['readinessStatus'],
) {
  if (status === 'ready') {
    return {
      label: 'Ready',
      className: 'border-green-500/30 bg-green-500/15 text-green-100',
    };
  }
  if (status === 'partially_ready') {
    return {
      label: 'Partially Ready',
      className: 'border-yellow-500/30 bg-yellow-500/15 text-yellow-100',
    };
  }
  return {
    label: 'Not Ready',
    className: 'border-red-500/30 bg-red-500/15 text-red-100',
  };
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-2 text-xs text-gray-400">{label}</div>
      <div className="text-2xl text-white">{value}</div>
    </div>
  );
}

function CountList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: Record<string, number>;
  empty: string;
}) {
  const visibleRows = Object.entries(rows)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-white">{title}</h3>
      {visibleRows.length === 0 ? (
        <p className="text-sm text-gray-400">{empty}</p>
      ) : (
        <div className="space-y-2">
          {visibleRows.map(([label, count]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-gray-300">{label}</span>
              <span className="text-green-300">{formatNumber(count)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FinalAiEvaluationReportPanel({
  accessToken,
}: FinalAiEvaluationReportPanelProps) {
  const [report, setReport] = useState<FinalAiEvaluationReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadReport() {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await api.getFinalAiEvaluationReport(accessToken);
      setReport(response);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Gagal memuat Final AI Evaluation Report.'),
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-300">
        Memuat Final AI Evaluation Report...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-100">
        {errorMessage}
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-300">
        Final AI Evaluation Report belum tersedia.
      </div>
    );
  }

  const readiness = getReadinessMeta(report.summary.readinessStatus);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-green-300">
              <FileText className="h-5 w-5" />
              <span className="text-sm uppercase tracking-wide">
                Final AI Evaluation Report
              </span>
            </div>
            <h2 className="mb-2 text-2xl text-white">
              Laporan Akhir Evaluasi AI
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-gray-400">
              Ringkasan kesiapan AI Quality Check, Vision, SOP RAG, Multimodal
              RAG, Supabase pgvector, dataset readiness, dan pola override
              admin untuk kebutuhan proposal/demo.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <span
              className={`rounded-full border px-4 py-2 text-center text-sm ${readiness.className}`}
            >
              {readiness.label}
            </span>
            <button
              type="button"
              onClick={() => void loadReport()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 transition-all hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Total AI Quality Check"
          value={formatNumber(report.summary.totalAiQualityChecks)}
        />
        <MetricCard
          label="Agreement Rate"
          value={formatPercent(report.summary.agreementRate)}
        />
        <MetricCard
          label="Override Rate"
          value={formatPercent(report.summary.overrideRate)}
        />
        <MetricCard
          label="Average Confidence"
          value={formatPercent(report.summary.averageConfidence)}
        />
        <MetricCard
          label="Total Admin Decisions"
          value={formatNumber(report.summary.totalAdminDecisions)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Vision Usage Rate"
          value={formatPercent(report.vision.visionUsageRate)}
        />
        <MetricCard
          label="SOP RAG Usage Rate"
          value={formatPercent(report.sopRag.ragUsageRate)}
        />
        <MetricCard
          label="Multimodal RAG Usage"
          value={formatPercent(report.multimodalRag.usageRate)}
        />
        <MetricCard
          label="Supabase pgvector Usage"
          value={formatNumber(
            report.multimodalRag.providerUsage.supabase_pgvector,
          )}
        />
        <MetricCard
          label="Average Top Similarity"
          value={formatPercent(report.multimodalRag.averageTopSimilarity)}
        />
        <MetricCard
          label="Embedding Coverage"
          value={formatPercent(report.dataset.embeddingCoverageRate)}
        />
        <MetricCard
          label="Supabase Vector Sync"
          value={formatPercent(report.dataset.supabaseVectorSyncCoverageRate)}
        />
        <MetricCard
          label="Eligible Cases"
          value={formatNumber(report.dataset.totalEligibleCases)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CountList
          title="Most Common Override Reasons"
          rows={report.qualityOutcomes.mostCommonOverrideReasons}
          empty="Belum ada alasan override dominan."
        />
        <CountList
          title="Most Common AI Error Patterns"
          rows={report.qualityOutcomes.mostCommonAiErrorPatterns}
          empty="Belum ada pola error AI dominan."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5">
          <div className="mb-4 flex items-center gap-2 text-yellow-100">
            <AlertTriangle className="h-5 w-5" />
            <h3>Risiko</h3>
          </div>
          <ul className="space-y-2 text-sm text-yellow-50">
            {report.risks.map((risk) => (
              <li key={risk}>- {risk}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5">
          <div className="mb-4 flex items-center gap-2 text-green-100">
            <CheckCircle2 className="h-5 w-5" />
            <h3>Rekomendasi</h3>
          </div>
          <ul className="space-y-2 text-sm text-green-50">
            {report.recommendations.map((recommendation) => (
              <li key={recommendation}>- {recommendation}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="mb-4 text-white">Demo Readiness Checklist</h3>
        <div className="space-y-3">
          {report.demoReadinessChecklist.map((item) => (
            <div
              key={item.label}
              className="grid gap-3 rounded-lg border border-white/10 p-3 text-sm md:grid-cols-[180px_100px_1fr]"
            >
              <span className="text-white">{item.label}</span>
              <span
                className={
                  item.status === 'pass'
                    ? 'text-green-300'
                    : item.status === 'warning'
                      ? 'text-yellow-300'
                      : 'text-red-300'
                }
              >
                {item.status}
              </span>
              <span className="text-gray-300">{item.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4 text-sm leading-relaxed text-blue-50">
        AI hanya memberi rekomendasi kualitas. Grade final, payout, wallet, dan
        transaksi tetap ditentukan oleh proses validasi admin dan backend
        bisnis.
      </div>
    </div>
  );
}
