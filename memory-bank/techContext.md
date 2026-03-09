# Tech Context

## Technologies

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Backend:** Python 3.11, FastAPI
- **Data:** pandas, numpy, google-cloud-bigquery, pandas-gbq
- **Deploy:** Docker, Cloud Run / Railway / Render / Vercel

## Development Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend
- `PROJECT_ID` — GCP project (BigQuery)
- `DATASET_ID` — BigQuery dataset
- `GOOGLE_APPLICATION_CREDENTIALS` — Service account JSON path (BigQuery için)
- `CORS_ORIGINS` — Frontend URL (örn. http://localhost:3000)
- `OUTPUT_DIR` — cleaned_data path (default: ./cleaned_data)

### Frontend
- `NEXT_PUBLIC_API_URL` — Backend API URL (örn. http://localhost:8000)

## Dependencies

### Backend (requirements.txt)
- fastapi
- uvicorn
- pandas
- numpy
- google-cloud-bigquery
- pandas-gbq
- python-multipart

## Tool Usage

- Cline Memory Bank: Proje dokümantasyonu
- Plan dosyası: `.cursor/plans/` veya `~/.cursor/plans/`
