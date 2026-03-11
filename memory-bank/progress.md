# Progress

## What Works

- Data cleaning pipeline (Jupyter notebook + web dashboard)
- 4 tablo: gold_dim_customer_segments, gold_dim_customers, gold_dim_products, gold_fact_sales
- Cleaning adımları: standardize_columns, trim_whitespace, remove_duplicates, fix_dtypes, handle_missing, flag_outliers
- Web dashboard: BigQuery/CSV kaynak seçimi, pipeline tetikleme, rapor, Recharts grafikler, tablo önizleme, CSV indirme
- **Authentication:** Kayıt ol, giriş yap, çıkış yap; JWT HttpOnly cookie; SQLite users; tüm /api/* korumalı; login sayfası, dashboard auth guard
- Ayarlar sayfası (API URL localStorage — data API için)
- GitHub: https://github.com/mehmettonguc51-cyber/Data_Cleaner
- Backend Dockerfile; frontend Dockerfile (standalone)

## What's Left to Build

- [x] Memory Bank
- [x] Backend (FastAPI)
- [x] Frontend (Next.js)
- [x] Dashboard özellikleri
- [x] Ayarlar sayfası
- [x] Authentication (register, login, logout, protected API)
- [x] Deploy hazırlığı (Dockerfile, env docs)
- [x] GitHub push
- [ ] Deploy (Cloud Run / Vercel / Railway); production env (JWT_SECRET_KEY, CORS_ORIGINS, COOKIE_SECURE, NEXT_PUBLIC_API_URL)

## Current Status

Proje GitHub'da. Lokal: backend (venv python -m uvicorn), frontend (npm run dev). Auth çalışıyor; kayıt/giriş sonrası dashboard kullanılabiliyor.

## Known Issues

- BigQuery billing gerekebilir (BigQuery yazma için)
- CSV upload modunda BigQuery credentials opsiyonel
- Backend başlamazsa (ModuleNotFoundError sqlalchemy/bcrypt): venv'de pip install -r requirements.txt ve `venv\Scripts\python.exe -m uvicorn` kullan
- Auth 404 geçmişte yaşandı: auth route'lar main.py içinde doğrudan tanımlı; getAuthApiUrl() ile istek hostname:8000'e gidiyor

## Evolution of Decisions

- BigQuery + CSV upload ikisi de desteklenecek
- Next.js + FastAPI stack seçildi
- Auth: JWT in HttpOnly cookie; bcrypt; SQLite; auth endpoint'leri main.py'de (router 404 riski nedeniyle)
- Frontend auth URL: getAuthApiUrl() sabit (localStorage karışmaz); data API: getApiUrl()
- Deploy: Cloud Run öncelikli, Railway/Render/Vercel alternatif; yol haritası memory-bank / README'de
- .gitignore: .env, service-account*.json, *-credentials.json hariç
