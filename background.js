chrome.runtime.onInstalled.addListener(() => {
  console.log("Twitter Comment Followers extension installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "log") {
    console.log(message.payload);
    sendResponse({ status: "logged" });
    return false;
  }

  if (message?.type === "update-badge") {
    const count = message.count || 0;
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
    chrome.action.setBadgeBackgroundColor({ color: "#10b981" }); // Yeşil
    sendResponse({ status: "badge-updated" });
    return false;
  }

  if (message?.type === "open-report") {
    chrome.tabs.create({ url: message.url, active: true });
    sendResponse({ status: "opened" });
    return false;
  }

  if (message?.type === "auto-follow-developer") {
    const username = message.username || "privyxe";
    const profileUrl = `https://x.com/${username}`;
    
    // Yeni sekme aç
    chrome.tabs.create({ url: profileUrl, active: false }, (tab) => {
      // Sekme yüklendiğinde takip butonunu tıkla
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          
          // Content script'i enjekte et ve takip butonunu bul
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              setTimeout(() => {
                let followButton = null;
                
                // Yöntem 1: CSS sınıfından direkt "Takip Et" span'ını bul
                const spans = Array.from(document.querySelectorAll('span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3'));
                for (const span of spans) {
                  const text = span.textContent?.trim().toLowerCase();
                  if (text === 'takip et' || text === 'follow' || text === 'takip') {
                    // Span'ın içinde bulunduğu butonu bul
                    followButton = span.closest('button');
                    if (followButton) {
                      console.log('[Auto-Follow] Method 1: Found via span CSS classes');
                      break;
                    }
                  }
                }
                
                // Yöntem 2: 3 nokta SVG'sini içeren butonları bul (profil sayfasında)
                if (!followButton) {
                  const buttons = Array.from(document.querySelectorAll('button'));
                  followButton = buttons.find(btn => {
                    const text = btn.textContent?.trim().toLowerCase();
                    return text === 'takip et' || text === 'follow' || text === 'takip';
                  });
                  
                  if (followButton) {
                    console.log('[Auto-Follow] Method 2: Found via button text search');
                  }
                }
                
                // Yöntem 3: aria-label kullanarak
                if (!followButton) {
                  followButton = document.querySelector('button[aria-label*="Follow"], button[aria-label*="Takip"]');
                  if (followButton) {
                    console.log('[Auto-Follow] Method 3: Found via aria-label');
                  }
                }
                
                if (followButton) {
                  followButton.click();
                  console.log('[Auto-Follow] Developer followed successfully!');
                  
                  // 2 saniye sonra sekmeyi kapat
                  setTimeout(() => {
                    window.close();
                  }, 2000);
                } else {
                  console.log('[Auto-Follow] Follow button not found - user might already be following');
                  setTimeout(() => {
                    window.close();
                  }, 2000);
                }
              }, 2500); // Sayfa tamamen yüklensin diye biraz daha bekle
            }
          }).catch(err => {
            console.error('[Auto-Follow] Script injection failed:', err);
          });
        }
      });
    });
    
    sendResponse({ status: "opening" });
    return false;
  }

  return false;
});

