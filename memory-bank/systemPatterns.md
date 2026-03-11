# System Patterns

## Architecture

```
Browser → Next.js (localhost:3000) → FastAPI (localhost:8000)
                │                            │
                │                            ├── SQLite (users.db) — auth
                │                            ├── Pandas + cleaned_data/*.csv
                │                            └── BigQuery (optional)
                │
                └── Auth: getCurrentUser() → /auth/me; login/register → /auth/login, /auth/register
```

## Authentication

- **Backend:** JWT (HS256) in HttpOnly cookie (`access_token`); bcrypt password hashes; SQLite `users` table (id, username, password_hash, created_at).
- **Auth endpoints (no auth required):** POST `/auth/register`, POST `/auth/login`, POST `/auth/logout`. GET `/auth/me` requires valid cookie.
- **Protected:** All `/api/*` endpoints use `Depends(get_current_user)`; `/health` stays public.
- **Frontend:** Auth calls use `getAuthApiUrl()` (always hostname:8000, no localStorage). Data calls use `getApiUrl()`. Dashboard guards: `getCurrentUser()` on load → redirect to `/login` if null; 401 on API → redirect to login.

## API Design

- **Auth:** POST `/auth/register` (username, password), POST `/auth/login`, POST `/auth/logout`, GET `/auth/me`
- **Pipeline:** POST `/api/run` — source=bigquery|upload, table_names optional
- **POST /api/upload** — multipart/form-data, CSV files
- **GET /api/report** — Son çalıştırma raporu
- **GET /api/tables** — Tablo listesi
- **GET /api/preview/{table_name}** — İlk N satır
- **GET /api/download/{table_name}** — CSV dosyası
- **GET /api/stats** — Grafikler için istatistikler
- **GET /health** — Health check (public, deploy)

## Component Relationships

- `backend/main.py` — FastAPI app; auth routes defined here directly; pipeline routes; CORS, init_db on startup
- `backend/auth/` — models.py (User, SQLite, get_db), schemas.py (UserCreate, UserLogin, UserRead), security.py (hash_password, JWT, get_current_user), routes.py (optional; main.py defines /auth/* directly)
- `backend/pipeline/cleaner.py` — Notebook'tan taşınan cleaning fonksiyonları
- `frontend/src/lib/api.ts` — getApiUrl(), getAuthApiUrl(), getCurrentUser, register, login, logout, data API helpers; all fetch use `credentials: "include"`
- `frontend/src/app/login/page.tsx` — Login/Register form
- `frontend/src/app/page.tsx` — Dashboard; auth guard then pipeline UI; Çıkış Yap

## Critical Paths

1. **Auth:** Register → Login (cookie set) → GET /auth/me → Dashboard; logout clears cookie
2. **BigQuery flow:** Client init → list tables → query → clean → save CSV
3. **Upload flow:** Receive file → parse CSV → clean → save CSV
4. **Preview/Download:** cleaned_data/ klasöründen oku

## Frontend API Client

- `getAuthApiUrl()` — Auth için sabit: hostname:8000 (localStorage karışmaz)
- `getApiUrl()` — Data API: localStorage apiUrl (frontend origin değilse) veya NEXT_PUBLIC_API_URL; trailing /api veya / strip edilir
- Tüm fetch: `credentials: "include"` (cookie gönderimi)
