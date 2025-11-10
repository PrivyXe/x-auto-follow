# 🐦 Twitter Comment Followers

**Twitter Comment Followers** — Twitter gönderilerinin altındaki yorum yapan kullanıcıları otomatik olarak takip eden bir Chrome eklentisidir.  
Geliştiriciler, sosyal medya yöneticileri ve etkileşim artırmak isteyen kullanıcılar için tasarlanmıştır.

---

## 🚀 Özellikler

- 🔁 **Otomatik Takip:** Gönderi altındaki kullanıcıları belirli aralıklarla otomatik takip eder.  
- ✅ **Mavi Tik Algılama:** Yalnızca doğrulanmış (verified) hesapları tespit eder ve takip eder.  
- 🧠 **Akıllı Gecikme:** Rastgele zaman aralıklarıyla takip işlemi yaparak doğal kullanıcı davranışı simülasyonu.  
- 🕵️ **Arka Plan Modu:** 5 saniyede bir yeni kullanıcıları tarayıp 3’er 3’er takip eder.  
- 📊 **Raporlama:** Takip edilen kullanıcıların listesi, zaman bilgisi ve toplam istatistikleri içeren görsel rapor oluşturur.  
- ⚡ **Modern UI:** Popup arayüzü karanlık temalı, sade ve kullanıcı dostudur.  

---

## 📦 Kurulum

1. Bu repoyu klonla veya ZIP olarak indir:
   ```bash
   git clone https://github.com/<kullanıcı-adın>/twitter-comment-followers.git
   ```
2. Chrome tarayıcısında `chrome://extensions/` adresine git.  
3. Sağ üstte **Developer Mode** (Geliştirici Modu) aktif et.  
4. “**Load unpacked**” butonuna tıkla ve proje klasörünü seç.  
5. Eklenti simgesine tıklayıp bir Twitter gönderi sayfasını aç, ardından **Start Auto Mode**’a bas.

---

## 🧩 Dosya Yapısı

```
twitter-comment-followers/
│
├── manifest.json          # Eklenti yapılandırması
├── background.js          # Servis worker, mesaj yönetimi ve sekme işlemleri
├── content.js             # Twitter sayfası üzerinde otomasyon işlemleri
├── popup.html             # Arayüz (popup menüsü)
├── popup.js               # Popup içindeki kullanıcı etkileşimi
├── report.html            # Takip raporu arayüzü
├── report.js              # Rapor oluşturma ve dışa aktarma mantığı
├── debug-helper.js        # Takip butonlarını tespit etmek için yardımcı script
└── icons/                 # Eklenti ikonları (16/32/48/128 px)
```

---

## 📈 Kullanım

1. Herhangi bir tweet sayfasını aç.  
2. Eklentiyi çalıştır ve **Auto Mode**’u başlat.  
3. Eklenti, her 5 saniyede 3 yeni “verified” hesabı tespit edip takip eder.  
4. İşlem bitince detaylı rapor sayfası otomatik açılır.  

---

## ⚠️ Uyarılar

- Bu proje yalnızca **öğrenme ve demo** amaçlıdır.  
- Twitter'ın API politikalarına aykırı olabilir; bu nedenle **kendi sorumluluğunuzda** kullanın.  
- Hesap güvenliği ve oran limitleri (rate limit) nedeniyle **spam amaçlı** kullanım önerilmez.  

---

## 💡 Geliştirici

Geliştirici: **[@privyxe](https://x.com/privyxe)**  
Destek olmak için eklentiyi yüklediğinde geliştirici hesabını otomatik takip eder 💙  

---

## 🖼️ Görseller

| Popup Arayüzü | Rapor Sayfası |
|----------------|----------------|
| ![popup](https://github.com/<kullanıcı-adın>/twitter-comment-followers/assets/popup-preview.png) | ![report](https://github.com/<kullanıcı-adın>/twitter-comment-followers/assets/report-preview.png) |

---

## 🪪 Lisans

MIT License — serbestçe kopyalayabilir, düzenleyebilir ve paylaşabilirsiniz.
