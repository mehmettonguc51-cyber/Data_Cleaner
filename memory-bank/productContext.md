# Product Context

## Why This Project Exists

Data cleaning pipeline şu an Jupyter notebook'ta çalışıyor. Bu proje, aynı pipeline'ı web üzerinden erişilebilir hale getirir.

## Problems It Solves

1. **Erişilebilirlik:** Notebook yerine tarayıcıdan kullanım
2. **Esneklik:** BigQuery veya CSV ile veri girişi
3. **Paylaşılabilirlik:** Deploy edilerek ekip/kişisel kullanım
4. **Görselleştirme:** Raporlar ve grafiklerle sonuçları anlama

## How It Should Work

1. Kullanıcı veri kaynağını seçer (BigQuery / CSV Upload)
2. BigQuery: Tablolar listelenir, seçilir, "Çalıştır" ile pipeline tetiklenir
3. CSV: Dosya(lar) yüklenir, pipeline tetiklenir
4. Sonuçlar: Tablo önizleme, CSV indirme, rapor, grafikler

## User Experience Goals

- Basit, anlaşılır arayüz
- Hızlı geri bildirim (loading states)
- Hata durumunda net mesajlar
