# 🔄 Twitter Auto Follow/Unfollow Extension

Twitter'da (X) otomatik olarak mavi tikli hesapları takip eden ve seni takip etmeyenleri takipten çıkaran Chrome uzantısı.

## ✨ Özellikler

### 🎯 Auto Follow Mode
- **Sadece mavi tikli hesapları** otomatik takip eder
- Tweet yorumlarından akıllı filtreleme
- Her 5 saniyede 3 hesap takip eder (spam değil)
- Arka planda çalışır, sayfa otomatik kayar
- Canlı sayaç (badge ve popup'ta)

### ❌ Auto Unfollow Mode
- **Seni takip etmeyenleri** otomatik takipten çıkarır
- **Seni takip edenleri korur** (güvenli)
- Her 5 saniyede 3 hesap unfollow eder
- Karşılıklı takipleşmeleri atlar

### 🎁 Bonus
- Developer'ı (@privyxe) otomatik takip eder (ilk kullanımda)
- Detaylı console logları
- İstediğin zaman durdur/başlat

## 📦 Kurulum

### Manuel Kurulum (Chrome/Edge/Brave)

1. **Bu repoyu indirin**
   ```bash
   git clone https://github.com/PrivyXe/twitter-auto-follow.git
   cd twitter-auto-follow
   ```
   
   veya ZIP olarak indirip açın.

2. **Chrome/Edge'i açın**
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`

3. **Geliştirici modunu açın**
   - Sağ üstteki "Developer mode" / "Geliştirici modu" toggle'ını açın

4. **Uzantıyı yükleyin**
   - "Load unpacked" / "Paketlenmemiş öğeyi yükle" tıklayın
   - `extension` klasörünü seçin

5. **Hazır! 🎉**
   - Tarayıcı toolbar'ında uzantı ikonu görünecek

## 🚀 Kullanım

### Auto Follow (Mavi Tikli Hesapları Takip Et)

1. **Twitter'da bir tweet'in yorumlar sayfasına gidin**
   - Popüler bir tweet seçin (çok yorumlu)
   - URL şöyle olmalı: `https://x.com/kullanici/status/123456789`

2. **Extension ikonuna tıklayın**

3. **"🔄 Start Auto Follow" butonuna basın**

4. **Arka planda çalışmaya başlar:**
   - Sayfadaki yorumları tarar
   - Mavi tikli hesapları filtreler
   - 3'er 3'er takip eder
   - Sayfa kayar, yeni yorumlar yüklenir
   - Her 5 saniyede tekrarlar

5. **Durdurmak için:**
   - Extension'ı tekrar açın
   - "⏸ Stop Auto Follow" basın

**Console'da izleyin (F12):**
```
[Twitter Comment Followers] Found 53 tweets on page
[Twitter Comment Followers] Found 12 verified accounts, skipped 41 non-verified
[Twitter Comment Followers] Auto mode: ✓ Followed verified account {username: "elonmusk", total: 1}
```

### Auto Unfollow (Takip Etmeyenleri Çıkar)

1. **Kendi profilinize gidin**
   - `https://x.com/sizin_kullanici_adiniz`

2. **"Following" (Takip Edilenler) sekmesine tıklayın**

3. **Extension ikonuna tıklayın**

4. **"❌ Start Auto Unfollow" butonuna basın**

5. **Arka planda çalışmaya başlar:**
   - Takip ettiğiniz hesapları listeler
   - "Seni takip ediyor" yazanları ATLAR (korur)
   - Seni takip etmeyenleri unfollow eder
   - Her 5 saniyede 3 hesap
   - Sayfa kayar, tüm listeyi tarar

6. **Durdurmak için:**
   - "⏸ Stop Unfollow" basın

**Console'da izleyin:**
```
[Twitter Comment Followers] Unfollow mode: Found 150 accounts to check
[Twitter Comment Followers] Unfollow mode: 23 don't follow back, 127 follow back (keeping)
[Twitter Comment Followers] Unfollow mode: ✓ Unfollowed (doesn't follow back) {username: "user123", total: 1}
```

## ⚙️ Ayarlar

Extension otomatik olarak yapılandırılmıştır:

- **Follow hızı:** Her 5 saniyede 3 hesap
- **Batch sayısı:** 3'er 3'er işler
- **Gecikme:** 2-3.5 saniye arası rastgele (bot gibi görünmemek için)
- **Auto scroll:** Sayfa otomatik kayar

## 🛡️ Güvenlik ve Gizlilik

- ✅ Tüm işlemler tarayıcınızda çalışır
- ✅ Hiçbir veri sunucuya gönderilmez
- ✅ Açık kaynak - kodu inceleyebilirsiniz
- ✅ Şifre veya API key gerektirmez
- ✅ Sadece Twitter/X sayfalarında çalışır

## ⚠️ Önemli Uyarılar

### Twitter Kuralları
- Twitter otomasyonu kısıtlıyor olabilir
- Çok hızlı kullanımda hesap geçici kısıtlanabilir
- **Sorumlu kullanın**
- Saatte 50-100'den fazla takip etmeyin

### Öneriler
- ✅ Doğal kullanım: Günde 100-200 takip
- ✅ Ara verin: Her saatte 10 dk mola
- ✅ Farklı tweet'lerde kullanın
- ❌ 24 saat boyunca kesintisiz çalıştırmayın

## 🐛 Sorun Giderme

### Extension çalışmıyor
1. Sayfayı yenileyin (F5)
2. Extension'ı yeniden yükleyin
3. Console'u açın (F12) ve hataları kontrol edin

### "Found 0 follow buttons"
- Yanlış sayfadasınız
- Tweet yorumlar sayfasına gidin
- Sayfayı aşağı kaydırıp yorumların yüklenmesini bekleyin

### Unfollow çalışmıyor
- "Following" sekmesinde olduğunuzdan emin olun
- Sayfayı yenileyin
- Console'da logları kontrol edin

### "No verified accounts found"
- Sayfada mavi tikli yorum yok
- Daha popüler bir tweet seçin
- Sayfayı aşağı kaydırın

## 🔧 Geliştirme

### Dosya Yapısı
```
extension/
├── manifest.json       # Extension config
├── content.js          # Ana otomasyon mantığı
├── background.js       # Background script
├── popup.html          # Popup arayüzü
├── popup.js            # Popup mantığı
├── report.html         # Rapor sayfası (opsiyonel)
├── report.js           # Rapor mantığı
└── icons/              # Extension ikonları
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

### Kod Değiştirme

1. `content.js` - Ana mantık:
   - `collectFollowTargets()` - Mavi tikli hesapları bulur
   - `runAutoFollowCycle()` - Takip döngüsü
   - `runUnfollowCycle()` - Unfollow döngüsü

2. `popup.js` - UI mantığı:
   - Start/Stop button handlers
   - Status güncellemeleri

3. Değişiklik yaptıktan sonra:
   - `chrome://extensions` açın
   - Extension'ın yanındaki yenile ikonuna tıklayın

## 📝 Changelog

### v1.0.2 (2025)
- ✨ Auto Follow mode (mavi tikli)
- ✨ Auto Unfollow mode (takip etmeyenler)
- ✨ Akıllı filtreleme
- ✨ "Seni takip ediyor" kontrolü
- ✨ Canlı sayaç (badge)
- ✨ Console logları

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request açın

## 📜 Lisans

MIT License - İstediğiniz gibi kullanın, değiştirin, paylaşın.

## 👨‍💻 Geliştirici

Twitter: [@privyxe](https://x.com/privyxe)

## ⭐ Destek

Eğer bu extension işinize yaradıysa:
- ⭐ GitHub'da star verin
- 🐦 Twitter'da [@privyxe](https://x.com/privyxe)'yi takip edin
- 🔄 Arkadaşlarınızla paylaşın

## 🚫 Sorumluluk Reddi

Bu araç eğitim amaçlıdır. Twitter'ın kullanım şartlarına uygun kullanımdan kullanıcı sorumludur. Hesap kısıtlanması veya kapatılmasından geliştirici sorumlu değildir.

---

**Made with ❤️ for the Twitter community**

