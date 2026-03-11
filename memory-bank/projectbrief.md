# Project Brief: Data Cleaning Pipeline Web Dashboard

## Core Requirements

- Web tabanlı data cleaning dashboard
- Veri kaynağı: BigQuery veya manuel CSV upload
- Mevcut Jupyter pipeline'ının web arayüzü
- **Authentication:** Kayıt/giriş; sadece giriş yapmış kullanıcılar dashboard ve API kullanabilir

## Goals

1. BigQuery'dan tabloları çekip temizleme pipeline'ı çalıştırma
2. CSV dosyası yükleyip aynı pipeline ile temizleme
3. Temizleme sonuçlarını görüntüleme, önizleme, indirme
4. Raporlar ve grafikler
5. **Kullanıcı kaydı ve girişi (register/login)** — JWT + HttpOnly cookie, SQLite
6. Deploy edilebilir yapı (Cloud Run, Railway, Render, Vercel)

## Scope

- **In scope:** Pipeline tetikleme, tablo önizleme, CSV indirme, raporlar, ayarlar, **auth (kayıt/giriş/çıkış)**, deploy
- **Out of scope:** Rol tabanlı yetkilendirme, özelleştirilebilir cleaning kuralları

## Repository

- https://github.com/mehmettonguc51-cyber/Data_Cleaner
