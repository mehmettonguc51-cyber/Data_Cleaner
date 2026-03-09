# Data Cleaning Pipeline Dashboard

BigQuery veya CSV upload ile veri temizleme pipeline'ı web arayüzü.

## Kurulum

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Tarayıcıda http://localhost:3000

## Deploy

### Backend (Docker)

```bash
cd backend
docker build -t data-cleaning-api .
docker run -p 8000:8000 -e CORS_ORIGINS=https://your-frontend.com data-cleaning-api
```

### Frontend (Docker)

```bash
cd frontend
docker build -t data-cleaning-dashboard .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://your-api-url data-cleaning-dashboard
```

### Cloud Run

```bash
# Backend
gcloud run deploy data-cleaning-api --source backend --region europe-west1

# Frontend (Vercel önerilir)
vercel deploy
```

## Ortam Değişkenleri

### Backend
- `PROJECT_ID` - GCP proje ID
- `DATASET_ID` - BigQuery dataset
- `GOOGLE_APPLICATION_CREDENTIALS` - Service account JSON yolu
- `CORS_ORIGINS` - Frontend URL (virgülle ayrılmış)

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL
