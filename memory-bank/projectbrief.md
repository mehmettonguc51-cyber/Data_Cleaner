# Project Brief: Data Cleaning Pipeline Web Dashboard

## Core Requirements

- Web tabanlı data cleaning dashboard
- Veri kaynağı: BigQuery veya manuel CSV upload
- Mevcut Jupyter pipeline'ının web arayüzü

## Goals

1. BigQuery'dan tabloları çekip temizleme pipeline'ı çalıştırma
2. CSV dosyası yükleyip aynı pipeline ile temizleme
3. Temizleme sonuçlarını görüntüleme, önizleme, indirme
4. Raporlar ve grafikler
5. Deploy edilebilir yapı (Cloud Run, Railway, Render, Vercel)

## Scope

- **In scope:** Pipeline tetikleme, tablo önizleme, CSV indirme, raporlar, ayarlar, deploy
- **Out of scope:** Kullanıcı authentication (MVP), özelleştirilebilir cleaning kuralları
