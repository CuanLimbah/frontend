# Frontend AI Components Reference

Dokumen ini merangkum komponen frontend yang terkait AI Quality Check, Multimodal RAG evidence, analytics, dan Final AI Evaluation Report.

## `AiSimilarCasesPanel`

Purpose:

Menampilkan historical quality cases yang mirip dengan submission yang sedang direview admin.

Data source:

`GET /admin/quality-dataset/vector/similar-cases`

Important props:

- submission id
- access token
- optional default provider
- optional limit/threshold state

User-facing safety copy:

"Kasus historis mirip hanya digunakan sebagai konteks tambahan. Admin tetap menentukan grade final dan payout."

Demo relevance:

Menunjukkan Multimodal RAG evidence: provider, fallback, similarity score, historical final admin grade, AI grade, visual observation, feedback, dan thumbnail.

## `AiQualityAnalyticsPanel`

Purpose:

Menampilkan analytics performa AI Quality Check dan Multimodal RAG.

Data source:

`GET /admin/analytics/quality-ai`

Important data:

- total quality checks
- agreement rate
- override rate
- RAG usage
- vision usage
- feedbackTagCounts
- aiErrorPatterns
- multimodalRag metrics
- providerUsage
- retrievalQuality

User-facing safety copy:

Analytics hanya mengevaluasi performa AI. AI tidak otomatis menentukan grade final, payout, wallet, atau transaksi.

Demo relevance:

Menjawab apakah AI membantu admin dan apakah Multimodal RAG/retrieval historical cases memberikan konteks yang berguna.

## `FinalAiEvaluationReportPanel`

Purpose:

Menampilkan laporan evaluasi final AI untuk demo/proposal readiness.

Data source:

`GET /admin/analytics/ai-final-report`

Important data:

- readiness status
- summary metrics
- vision metrics
- SOP RAG metrics
- Multimodal RAG metrics
- dataset coverage
- recommendations
- risks
- demo readiness checklist

User-facing safety copy:

AI hanya memberi rekomendasi. Grade final, payout, wallet, dan transaksi tetap mengikuti validasi admin dan backend business flow.

Demo relevance:

Memberi rangkuman eksekutif untuk menunjukkan kesiapan fitur AI.

## `VerificationQueue` Integration

Purpose:

Menjadi flow utama admin untuk review submission, menjalankan AI Quality Check, melihat evidence, dan menentukan final grade.

Data sources:

- `POST /admin/submissions/:id/quality-check`
- `PATCH /admin/submissions/:id/verify`
- `GET /admin/quality-dataset/vector/similar-cases`

Important behavior:

- Admin menjalankan AI Quality Check secara manual.
- Similar cases muncul sebagai supporting context.
- Admin tetap memilih final grade.
- UI tidak auto-set payout berdasarkan AI.

Demo relevance:

Ini adalah layar utama untuk membuktikan human-in-the-loop validation.

## Admin Dashboard AI Tabs

Purpose:

Mengelompokkan monitoring AI untuk admin.

Tabs:

- AI Analytics
- AI Report

Data sources:

- `GET /admin/analytics/quality-ai`
- `GET /admin/analytics/ai-final-report`

Demo relevance:

Menampilkan monitoring, readiness, risk, dan recommendation setelah AI digunakan dalam verification flow.

## Safety Principles in UI

- Similar cases adalah konteks tambahan.
- AI recommendation tidak final.
- Admin menentukan final grade.
- Payout mengikuti final admin grade.
- Tidak ada tombol auto-approve berbasis AI.
- Tidak ada expose Supabase service role key di frontend.

