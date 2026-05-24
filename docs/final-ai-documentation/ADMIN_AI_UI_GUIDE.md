# Admin AI UI Guide

Dokumen ini menjelaskan fitur UI admin yang mendukung AI Quality Check, Multimodal RAG evidence, analytics, dan Final AI Evaluation Report.

## Verification Queue

Verification Queue adalah tempat admin meninjau submission pending. Di flow ini admin dapat:

- melihat detail submission
- menjalankan AI Quality Check
- membaca rekomendasi AI
- melihat observasi visual
- membuka similar cases evidence panel
- menentukan final grade
- menyelesaikan verification manual

AI tidak mengisi final grade atau payout secara otomatis.

## AI Quality Check Button

Tombol AI Quality Check menjalankan backend endpoint:

`POST /admin/submissions/:id/quality-check`

Hasil yang ditampilkan:

- AI recommended grade
- confidence
- visual observation
- explanation
- metadata RAG/Multimodal RAG jika tersedia

Admin harus tetap memeriksa kondisi visual dan SOP sebelum menentukan final grade.

## Similar Cases Evidence Panel

Panel ini menampilkan kasus historis mirip yang dipakai sebagai konteks Multimodal RAG.

Data source:

`GET /admin/quality-dataset/vector/similar-cases`

Panel menampilkan:

- retrieval provider
- fallback status
- jumlah similar cases
- similarity score
- submission id historis
- waste type
- final admin grade historis
- AI grade sebelumnya
- AI confidence
- visual observation text
- admin feedback note
- override primary reason
- AI error pattern
- image thumbnail jika tersedia

Safety copy:

"Kasus historis mirip hanya digunakan sebagai konteks tambahan. Admin tetap menentukan grade final dan payout."

## Provider Selector

Admin dapat memilih provider retrieval:

- `auto`: Supabase pgvector terlebih dahulu, lalu fallback application cosine jika perlu
- `supabase_pgvector`: paksa pencarian via Supabase pgvector
- `application_cosine`: paksa fallback application-level cosine

Selector ini membantu demo dan debugging retrieval.

## Similarity Threshold Selector

Threshold similarity mengatur seberapa mirip historical case yang akan ditampilkan. Threshold lebih tinggi berarti hasil lebih ketat, tetapi bisa menghasilkan empty state jika dataset kecil.

## Limit Selector

Limit selector membatasi jumlah hasil, biasanya:

- 3
- 5
- 10

Gunakan 5 untuk demo default agar panel tetap ringkas.

## AI Analytics Tab

AI Analytics menampilkan:

- total AI Quality Checks
- agreement rate
- override rate
- average confidence
- SOP RAG usage
- Vision usage
- feedback admin
- AI error patterns
- Multimodal RAG performance
- provider usage
- retrieval quality tuning

Tab ini membantu menjawab apakah AI membantu admin dan apakah retrieval historical cases sudah stabil.

## Retrieval Quality Monitoring

Bagian Retrieval Quality menampilkan:

- total retrievals
- Supabase retrievals
- application fallback retrievals
- no result retrievals
- embedding unavailable retrievals
- average top similarity
- low/high similarity rates
- threshold buckets
- current topK/minSimilarity
- recommendation

Jika fallback masih tinggi, cek Supabase vector sync coverage dan RPC. Jika no result tinggi, cek dataset eligible dan threshold.

## AI Report Tab

AI Report menampilkan Final AI Evaluation Report:

- readiness status
- total AI checks
- agreement/override rates
- vision usage
- SOP RAG usage
- Multimodal RAG usage
- Supabase pgvector usage
- embedding coverage
- Supabase vector sync coverage
- recommendations
- risks
- demo readiness checklist

Report ini dipakai untuk demo readiness dan evaluasi, bukan untuk otomatisasi final grade.

## UI States

Similar Cases Panel dan AI Report harus menangani:

- loading state
- empty state
- error state
- refresh action

Empty state bukan error. Bisa berarti belum ada dataset eligible, embedding belum tersedia, threshold terlalu tinggi, atau Supabase vector sync belum berjalan.

## Admin Review Checklist

Sebelum approve/verifikasi:

- cek foto dan visual evidence
- cek AI visual observation
- cek SOP/RAG context jika tersedia
- cek similar historical cases jika tersedia
- cek apakah AI terlalu optimistis atau konservatif
- pilih final grade manual
- isi feedback override jika final grade berbeda dari AI recommendation

Final grade dan payout tetap berdasarkan validasi admin.

