# System Patterns

## Architecture

```
Frontend (Next.js)  <--HTTP-->  Backend (FastAPI)
                                      |
                                      v
                              Pipeline (cleaner.py)
                                      |
                    +-----------------+-----------------+
                    v                                   v
              BigQuery                            CSV Upload
```

## API Design

- **POST /api/run** — `{ source: "bigquery"|"upload", table_names?: string[] }`
- **POST /api/upload** — multipart/form-data, CSV files
- **GET /api/report** — Son çalıştırma raporu
- **GET /api/tables** — Tablo listesi
- **GET /api/preview/{table_name}** — İlk N satır
- **GET /api/download/{table_name}** — CSV dosyası
- **GET /api/stats** — Grafikler için istatistikler
- **GET /health** — Health check (deploy)

## Component Relationships

- `backend/pipeline/cleaner.py` — Notebook'tan taşınan fonksiyonlar
- `backend/main.py` — FastAPI app, route'lar
- `frontend/` — Next.js app, API çağrıları

## Critical Paths

1. **BigQuery flow:** Client init → list tables → query → clean → save CSV
2. **Upload flow:** Receive file → parse CSV → clean → save CSV
3. **Preview/Download:** cleaned_data/ klasöründen oku
