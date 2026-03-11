# Active Context

## Current Work Focus

Proje auth ile tamamlandı. Deploy veya ek özellikler için hazır.

## Recent Changes

- Authentication eklendi: register, login, logout, JWT HttpOnly cookie, SQLite users, bcrypt; tüm /api/* korumalı
- Auth route'lar main.py içinde doğrudan tanımlı (404 önlemek için)
- Frontend: getAuthApiUrl() (auth için sabit hostname:8000), getCurrentUser(), login sayfası, dashboard auth guard, Çıkış Yap
- getCurrentUser() hata durumunda null döner; 404/network'te login'e yönlendirme
- Backend başlatma: venv'de tüm bağımlılıklar kurulu olmalı; `venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000` önerilir
- Memory bank güncellendi: auth, tech stack, deployment roadmap

## Next Steps

- Deploy (Cloud Run, Vercel, Railway); JWT_SECRET_KEY, CORS_ORIGINS, COOKIE_SECURE, NEXT_PUBLIC_API_URL production'da set edilmeli
- İsteğe bağlı: PROJECT_ID/DATASET_ID için .env.example; SQLite volume (kalıcı users.db)

## Active Decisions

- Stack: Next.js + FastAPI; Auth: JWT + bcrypt + SQLite
- Veri kaynağı: BigQuery veya CSV upload
- Deploy hedefi: Cloud Run / Railway / Render / Vercel
- Repo: Data_Cleaner (mehmettonguc51-cyber)

## Important Patterns

- 12-Factor: Config env'den
- Auth: Stateless JWT; cookie SameSite=Lax, Secure in prod
- API URL: getAuthApiUrl() for auth (no localStorage); getApiUrl() for data (localStorage / NEXT_PUBLIC_API_URL, trailing /api stripped)
- CORS: Backend CORS_ORIGINS'ta frontend URL; allow_credentials=True
