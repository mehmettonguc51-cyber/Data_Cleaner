# Tech Context

## Technologies

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Recharts
- **Backend:** Python 3.11, FastAPI, Uvicorn
- **Auth:** JWT (PyJWT), bcrypt, SQLAlchemy, SQLite (users.db)
- **Data:** pandas, numpy, google-cloud-bigquery, pandas-gbq
- **Deploy:** Docker (backend + frontend Dockerfiles), Cloud Run / Railway / Render / Vercel

## Development Setup

### Backend (venv Python ile çalıştır; aksi halde child process sqlalchemy/bcrypt bulamayabilir)
```bash
cd backend
pip install -r requirements.txt
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
# veya: venv\Scripts\activate && uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend
- `JWT_SECRET_KEY` — Production'da zorunlu; güçlü rastgele secret
- `COOKIE_SECURE` — HTTPS'te `true`
- `CORS_ORIGINS` — Frontend URL (virgülle ayrılmış; production'da canlı URL)
- `AUTH_DB_PATH` — SQLite dosya yolu (default: backend/users.db)
- `PROJECT_ID` — GCP project (BigQuery)
- `DATASET_ID` — BigQuery dataset
- `GOOGLE_APPLICATION_CREDENTIALS` — Service account JSON path (BigQuery için)
- `OUTPUT_DIR` — cleaned_data path (default: parent/cleaned_data)

### Frontend
- `NEXT_PUBLIC_API_URL` — Backend API URL (build-time; default http://localhost:8000)
- Ayarlar sayfasından localStorage'a apiUrl kaydedilebilir (data API için; auth her zaman hostname:8000)

## Git / GitHub

- Repo: https://github.com/mehmettonguc51-cyber/Data_Cleaner
- .gitignore: venv, node_modules, .env, service-account*.json, *-credentials.json, __pycache__, .next, users.db (opsiyonel)

## Dependencies

### Backend (requirements.txt)
- fastapi, uvicorn, pandas, numpy, google-cloud-bigquery, pandas-gbq, python-multipart
- PyJWT, bcrypt, sqlalchemy

### Frontend
- next, react, recharts, tailwindcss, typescript

## Tool Usage

- Cline Memory Bank: Proje dokümantasyonu
- Plan dosyası: `.cursor/plans/` veya `~/.cursor/plans/`
