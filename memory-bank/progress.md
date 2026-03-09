# Progress

## What Works

- Data cleaning pipeline (Jupyter notebook)
- 4 tablo: gold_dim_customer_segments, gold_dim_customers, gold_dim_products, gold_fact_sales
- Cleaning adımları: standardize_columns, trim_whitespace, remove_duplicates, fix_dtypes, handle_missing, flag_outliers

## What's Left to Build

- [x] Memory Bank
- [x] Backend (FastAPI)
- [x] Frontend (Next.js)
- [x] Dashboard özellikleri (Recharts grafikler, önizleme, indirme)
- [x] Ayarlar sayfası
- [x] Deploy hazırlığı (Dockerfile, health check)

## Current Status

Tüm özellikler tamamlandı. npm install ve uvicorn ile çalıştırılabilir.

## Known Issues

- BigQuery billing gerekebilir (BigQuery yazma için)
- CSV upload modunda BigQuery credentials opsiyonel

## Evolution of Decisions

- BigQuery + CSV upload ikisi de desteklenecek
- Next.js + FastAPI stack seçildi
- Deploy: Cloud Run öncelikli, Railway/Render alternatif
