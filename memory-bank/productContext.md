# Product Context

## Why This Project Exists

Data cleaning pipeline şu an Jupyter notebook'ta çalışıyor. Bu proje, aynı pipeline'ı web üzerinden erişilebilir ve **giriş korumalı** hale getirir.

## Problems It Solves

1. **Erişilebilirlik:** Notebook yerine tarayıcıdan kullanım
2. **Esneklik:** BigQuery veya CSV ile veri girişi
3. **Paylaşılabilirlik:** Deploy edilerek ekip/kişisel kullanım
4. **Görselleştirme:** Raporlar ve grafiklerle sonuçları anlama
5. **Güvenlik:** Sadece kayıtlı kullanıcılar giriş yapıp pipeline kullanabilir (kayıt ol / giriş yap)

## How It Should Work

1. Kullanıcı **giriş yapmamışsa** login sayfasına yönlendirilir; kayıt ol veya giriş yap
2. Giriş sonrası: Veri kaynağını seçer (BigQuery / CSV Upload)
3. BigQuery: Tablolar listelenir, seçilir, "Çalıştır" ile pipeline tetiklenir
4. CSV: Dosya(lar) yüklenir, pipeline tetiklenir
5. Sonuçlar: Tablo önizleme, CSV indirme, rapor, grafikler
6. Çıkış Yap ile cookie silinir, tekrar login gerekir

## User Experience Goals

- Basit, anlaşılır arayüz
- Hızlı geri bildirim (loading states)
- Hata durumunda net mesajlar (Türkçe: "Backend'e bağlanılamadı", "Bu kullanıcı adı zaten kullanılıyor", "Kullanıcı adı veya şifre hatalı")
- Auth: Login/Register aynı sayfada (sekme değiştirerek)

## Repository

- GitHub: https://github.com/mehmettonguc51-cyber/Data_Cleaner
