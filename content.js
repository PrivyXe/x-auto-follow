(() => {
  let isRunning = false;
  let shouldStop = false;
  let autoMode = false; // Arka plan otomatik modu
  let autoModeInterval = null;
  let autoModeFollowCount = 0; // Auto mode'da takip edilen sayısı
  let autoModeSeenUsers = new Set(); // Auto mode için görülen kullanıcılar
  
  let unfollowMode = false; // Unfollow modu
  let unfollowModeInterval = null;
  let unfollowModeCount = 0; // Unfollow edilen sayısı

  const DEVELOPER_USERNAME = "privyxe";

  const DEFAULT_OPTIONS = {
    maxFollows: 25,
    delayRangeMs: [1600, 2800],
    scrollDelayMs: 2200,
    maxIdleScrolls: 12
  };

  const wait = (ms) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const randomBetween = ([min, max]) => Math.floor(min + Math.random() * (max - min));

  const log = (message, extra = undefined) => {
    console.log(`[Twitter Comment Followers] ${message}`, extra || "");
    chrome.runtime.sendMessage({ type: "log", payload: { message, extra } }).catch(() => {
      /* Swallow logging errors */
    });
  };

  const extractUsername = (element) => {
    // Önce text içinden @username çıkarmayı dene
    const text = element.textContent || "";
    const directMatch = text.match(/@([\w]+)/);
    if (directMatch) {
      return directMatch[1];
    }

    // aria-label'dan kullanıcı adı çıkarmayı dene
    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel) {
      const match = ariaLabel.match(/(?:Follow|Takip(?:\s+et)?)\s+@([\w]+)/i);
      if (match) {
        return match[1];
      }
    }

    // Yorumun bulunduğu article'ı bul
    const article = element.closest("article");
    if (!article) {
      return null;
    }

    // Profil linkinden kullanıcı adını al
    const profileLink = article.querySelector('a[href^="/"][href*="/status/"]');
    if (profileLink) {
      const href = profileLink.getAttribute("href");
      const match = href?.match(/^\/([^\/]+)\//);
      if (match) {
        return match[1];
      }
    }

    // Alternatif: yorum sahibinin kullanıcı adını span'lardan bul
    const usernameSpan = article.querySelector('[data-testid="User-Name"] a[href^="/"]');
    if (usernameSpan) {
      const href = usernameSpan.getAttribute("href");
      const username = href?.replace(/^\//, "").split("/")[0];
      if (username) {
        return username;
      }
    }

    return null;
  };

  const ensureElementKey = (element) => {
    if (!element.dataset.autoFollowKey) {
      element.dataset.autoFollowKey = `anon-${Math.random().toString(36).slice(2, 10)}`;
    }
    return element.dataset.autoFollowKey;
  };

  const hasVerifiedBadge = (element) => {
    // Butonun içinde bulunduğu article'ı bul
    const article = element.closest('article');
    if (!article) {
      return false;
    }
    
    // Verified badge SVG path'ini ara
    const verifiedPath = 'M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z';
    
    const svgPaths = article.querySelectorAll('svg path');
    
    // Alternatif: data-testid ile de dene
    const verifiedBadge = article.querySelector('[data-testid="icon-verified"]');
    if (verifiedBadge) {
      return true;
    }
    
    // SVG path kontrolü
    for (const path of svgPaths) {
      const pathD = path.getAttribute('d');
      if (pathD && pathD.includes('M20.396 11')) {
        return true;
      }
    }
    
    return false;
  };

  const collectFollowTargets = (seenUsers) => {
    const rawElements = [];
    
    log("Collecting verified accounts from comments...");
    
    // Tüm yorumları (article) bul
    const articles = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
    log(`Found ${articles.length} tweets on page`);
    
    let verifiedCount = 0;
    let nonVerifiedCount = 0;
    
    for (const article of articles) {
      // Mavi tik kontrolü
      const isVerified = hasVerifiedBadge(article);
      
      if (isVerified) {
        // Username'i çıkar
        const username = extractUsername(article);
        
        if (username) {
          // 3 nokta butonunu bul
          const menuButton = article.querySelector('button[data-testid="caret"]');
          
          if (menuButton && !rawElements.some(item => item.username === username)) {
            rawElements.push({ article, menuButton, username });
            verifiedCount++;
          }
        }
      } else {
        nonVerifiedCount++;
      }
    }
    
    log(`Found ${verifiedCount} verified accounts, skipped ${nonVerifiedCount} non-verified`);
    
    // Yöntem 2: Fallback - css-1jxf684 içeren butonları ara
    if (rawElements.length === 0) {
      const buttons = Array.from(document.querySelectorAll('button[class*="css-1jxf684"]'));
      for (const btn of buttons) {
        const text = btn.textContent?.trim().toLowerCase();
        if (text === 'takip et' || text === 'follow' || text === 'takip') {
          if (!rawElements.includes(btn) && hasVerifiedBadge(btn)) {
            rawElements.push(btn);
          }
        }
      }
    }
    
    // Yöntem 3: data-testid fallback (verified kontrollü)
    if (rawElements.length === 0) {
      const testIdButtons = Array.from(document.querySelectorAll('[data-testid="follow"], [data-testid$="-follow"]'));
      for (const btn of testIdButtons) {
        if (hasVerifiedBadge(btn)) {
          rawElements.push(btn);
        }
      }
    }

    const uniqueTargets = [];
    for (const item of rawElements) {
      if (!item) continue;
      
      // Yeni format: {article, menuButton, username}
      const article = item.article || item;
      const username = item.username || extractUsername(article);
      
      // Zaten işlenmiş mi kontrol et
      if (article.dataset && article.dataset.autoFollowLocked === "true") {
        continue;
      }

      const key = username ? `user-${username.toLowerCase()}` : `article-${Math.random()}`;

      if (seenUsers.has(key)) {
        continue;
      }

      seenUsers.add(key);
      uniqueTargets.push({ element: item, username });
    }

    return uniqueTargets;
  };

  const followDeveloper = async () => {
    try {
      log("Opening developer profile to auto-follow", { username: DEVELOPER_USERNAME });
      
      // Background script'e mesaj gönder - yeni sekme açsın ve takip etsin
      await chrome.runtime.sendMessage({
        type: "auto-follow-developer",
        username: DEVELOPER_USERNAME
      });
      
      // Background script işini yapsın diye bekle
      await wait(4000);
      
      log("Developer auto-follow initiated. Thanks for your support!");
    } catch (error) {
      log("Failed to auto-follow developer", { error: error.message });
    }
  };

  const followCommenters = async (options = {}) => {
    const config = {
      ...DEFAULT_OPTIONS,
      ...options
    };

    const seenUsers = new Set();
    const followedUsersList = []; // Takip edilen kullanıcıları sakla
    let followedCount = 0;
    let idleScrolls = 0;
    const startTime = Date.now();

    log("Automation started", config);

    // İlk olarak developer'ı takip et
    await followDeveloper();

    const BATCH_SIZE = 3; // 3'er 3'er işle - daha doğal görünür
    
    while (followedCount < config.maxFollows && idleScrolls < config.maxIdleScrolls && !shouldStop) {
      // Her batch'te maksimum 3 hedef topla
      const targets = collectFollowTargets(seenUsers);

      if (targets.length === 0) {
        idleScrolls += 1;
        log("No verified accounts found, scrolling down", { idleScrolls });
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
        await wait(config.scrollDelayMs);
        continue;
      }

      idleScrolls = 0;
      
      // Bu batch'teki hedefleri say
      const batchTargets = targets.slice(0, Math.min(BATCH_SIZE, config.maxFollows - followedCount));
      log(`Processing batch of ${batchTargets.length} verified accounts`, { 
        followedSoFar: followedCount,
        remaining: config.maxFollows - followedCount 
      });

      // Batch içindeki her hesabı takip et
      for (const { element, username } of batchTargets) {
        if (followedCount >= config.maxFollows || shouldStop) {
          break;
        }

        try {
          element.dataset.autoFollowLocked = "true";
          element.click();
          followedCount += 1;
          
          // Kullanıcıyı listeye ekle
          followedUsersList.push({
            username: username || `user_${followedCount}`,
            timestamp: Date.now()
          });
          
          log("✓ Verified account followed", { username, followedCount });
          await wait(randomBetween(config.delayRangeMs));
        } catch (error) {
          log("Failed to follow verified account", { error, username });
        }
      }
      
      // Batch tamamlandı, daha fazla hesap varsa sayfayı kaydır
      if (followedCount < config.maxFollows && !shouldStop) {
        log("Batch completed, scrolling for more verified accounts");
        window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
        await wait(config.scrollDelayMs);
      }
    }

    const endTime = Date.now();

    if (shouldStop) {
      log("Automation stopped by user", { followedCount, idleScrolls });
    } else {
      log("Automation completed", { followedCount, idleScrolls });
    }

    // Rapor sayfasını aç
    if (followedUsersList.length > 0) {
      const reportData = {
        users: followedUsersList,
        startTime,
        endTime
      };
      
      const reportUrl = chrome.runtime.getURL('report.html') + 
        '?data=' + encodeURIComponent(JSON.stringify(reportData));
      
      chrome.runtime.sendMessage({
        type: "open-report",
        url: reportUrl
      });
      
      log("Report generated", { totalUsers: followedUsersList.length });
    }

    return { followed: followedCount, idleScrolls, wasStopped: shouldStop };
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "start-following") {
      if (isRunning) {
        sendResponse({ status: "running" });
        return false;
      }

      isRunning = true;
      shouldStop = false;

      followCommenters(message.options)
        .then((result) => {
          if (result.wasStopped) {
            sendResponse({ status: "stopped", result });
          } else {
            sendResponse({ status: "completed", result });
          }
        })
        .catch((error) => {
          console.error("[Twitter Comment Followers] Automation error:", error);
          sendResponse({ status: "error", message: error?.message || "Unknown error" });
        })
        .finally(() => {
          isRunning = false;
          shouldStop = false;
        });

      return true;
    }

    if (message?.type === "stop-following") {
      if (!isRunning) {
        sendResponse({ status: "not-running" });
        return false;
      }

      shouldStop = true;
      log("Stop signal received");
      sendResponse({ status: "stopping" });
      return false;
    }

    if (message?.type === "check-status") {
      sendResponse({ isRunning, shouldStop, autoMode, autoModeFollowCount, unfollowMode, unfollowModeCount });
      return false;
    }

    if (message?.type === "start-unfollow-mode") {
      if (unfollowMode) {
        sendResponse({ status: "already-running" });
        return false;
      }

      unfollowMode = true;
      unfollowModeCount = 0;
      log("Unfollow mode started - will unfollow non-followers every 5 seconds");

      // İlk çalıştırma
      runUnfollowCycle();

      // Her 5 saniyede bir kontrol et
      unfollowModeInterval = setInterval(() => {
        if (unfollowMode) {
          runUnfollowCycle();
        }
      }, 5000);

      sendResponse({ status: "unfollow-mode-started" });
      return false;
    }

    if (message?.type === "stop-unfollow-mode") {
      if (!unfollowMode) {
        sendResponse({ status: "not-running" });
        return false;
      }

      unfollowMode = false;
      if (unfollowModeInterval) {
        clearInterval(unfollowModeInterval);
        unfollowModeInterval = null;
      }

      log("Unfollow mode stopped", { totalUnfollowed: unfollowModeCount });
      sendResponse({ status: "unfollow-mode-stopped", totalUnfollowed: unfollowModeCount });
      return false;
    }

    if (message?.type === "start-auto-mode") {
      if (autoMode) {
        sendResponse({ status: "already-running" });
        return false;
      }

      autoMode = true;
      autoModeFollowCount = 0; // Sayacı sıfırla
      autoModeSeenUsers.clear(); // Görülen kullanıcıları temizle
      log("Auto mode started - will follow 3 verified accounts every 5 seconds");

      // İlk çalıştırma
      runAutoFollowCycle();

      // Her 5 saniyede bir kontrol et ve 3 kişi takip et
      autoModeInterval = setInterval(() => {
        if (autoMode) {
          runAutoFollowCycle();
        }
      }, 5000); // 5 saniye

      sendResponse({ status: "auto-mode-started" });
      return false;
    }

    if (message?.type === "stop-auto-mode") {
      if (!autoMode) {
        sendResponse({ status: "not-running" });
        return false;
      }

      autoMode = false;
      if (autoModeInterval) {
        clearInterval(autoModeInterval);
        autoModeInterval = null;
      }

      log("Auto mode stopped", { totalFollowed: autoModeFollowCount });
      sendResponse({ status: "auto-mode-stopped", totalFollowed: autoModeFollowCount });
      return false;
    }

    return false;
  });

  // "Seni takip ediyor" kontrolü
  const isFollowingBack = (button) => {
    // Butonun parent container'ını bul
    const container = button.closest('[data-testid="UserCell"]') || button.closest('div[role="button"]');
    if (!container) return false;

    // Container içinde "Seni takip ediyor" yazısını ara
    const spans = container.querySelectorAll('span');
    for (const span of spans) {
      const text = span.textContent?.trim().toLowerCase();
      if (text === 'seni takip ediyor' || text === 'follows you') {
        return true;
      }
    }

    return false;
  };

  // Unfollow modu - takipten çık
  const runUnfollowCycle = async () => {
    if (!unfollowMode || isRunning) return;

    log("Unfollow mode: Checking for non-followers");

    // "Following" (Takip Edilenler) sayfasındaki "Following" butonlarını bul
    const followingButtons = Array.from(document.querySelectorAll('button[data-testid$="-unfollow"]'));
    
    if (followingButtons.length === 0) {
      log("Unfollow mode: No following buttons found, scrolling");
      window.scrollBy({ top: window.innerHeight * 0.6, behavior: "smooth" });
      return;
    }

    log(`Unfollow mode: Found ${followingButtons.length} accounts to check`);

    // Sadece seni takip ETMEYENleri filtrele
    const nonFollowers = followingButtons.filter(button => !isFollowingBack(button));
    log(`Unfollow mode: ${nonFollowers.length} don't follow back, ${followingButtons.length - nonFollowers.length} follow back (keeping)`);

    // İlk 3 hesabı kontrol et
    const batch = nonFollowers.slice(0, 3);

    for (const button of batch) {
      try {
        // Aria-label'dan kullanıcı adını çıkar
        const ariaLabel = button.getAttribute('aria-label');
        const usernameMatch = ariaLabel?.match(/@([\w]+)/);
        const username = usernameMatch ? usernameMatch[1] : 'unknown';

        // Butona tıkla (unfollow menüsü açılır)
        button.click();
        await wait(500);

        // Menüde "Takibi bırak" veya "Unfollow" butonunu bul
        const confirmButton = document.querySelector('[data-testid="confirmationSheetConfirm"]');
        
        if (confirmButton) {
          confirmButton.click();
          unfollowModeCount += 1;
          log("Unfollow mode: ✓ Unfollowed (doesn't follow back)", { username, total: unfollowModeCount });

          // Badge güncelle
          chrome.runtime.sendMessage({
            type: "update-badge",
            count: unfollowModeCount
          });
        } else {
          log("Unfollow mode: Confirm button not found, canceling");
          // ESC tuşuna bas veya body'ye tıkla
          document.body.click();
        }

        await wait(randomBetween([2000, 3500]));
      } catch (error) {
        log("Unfollow mode: Error", { error: error.message });
      }
    }
  };

  // Arka plan otomatik modu için 3 kişilik döngü
  const runAutoFollowCycle = async () => {
    if (!autoMode || isRunning) return;

    log(`Auto mode: Checking for new follow targets (seen: ${autoModeSeenUsers.size})`);

    // Global seenUsers kullan
    const targets = collectFollowTargets(autoModeSeenUsers);

    if (targets.length === 0) {
      log("Auto mode: No new verified accounts found, scrolling for more");
      // Sayfa otomatik kaydır
      window.scrollBy({ top: window.innerHeight * 0.6, behavior: "smooth" });
      return;
    }

    const batchTargets = targets.slice(0, 3);
    log(`Auto mode: Will follow ${batchTargets.length} accounts (from ${targets.length} available)`);

    for (const target of batchTargets) {
      try {
        const { article, menuButton } = target.element || target;
        
        if (!menuButton) continue;
        
        // 1. 3 nokta menüsüne tıkla
        menuButton.click();
        await wait(500); // Menünün açılmasını bekle
        
        // 2. Menüde "takip et" itemini bul
        const menuItems = Array.from(document.querySelectorAll('div[role="menuitem"]'));
        const followItem = menuItems.find(item => {
          const text = item.textContent?.toLowerCase();
          return text?.includes('takip et') || text?.includes('follow');
        });
        
        if (followItem) {
          // Username zaten collectFollowTargets'tan geliyor
          const username = target.username || 'unknown';
          
          // Takip et'e tıkla (zaten verified olduğu filtrelendi)
          followItem.click();
          
          // Article'ı locked olarak işaretle
          if (article && article.dataset) {
            article.dataset.autoFollowLocked = "true";
          }
          
          autoModeFollowCount += 1;
          log("Auto mode: ✓ Followed verified account", { username, total: autoModeFollowCount });
          
          // Badge'i güncelle
          chrome.runtime.sendMessage({
            type: "update-badge",
            count: autoModeFollowCount
          });
        } else {
          log("Auto mode: Follow item not found in menu");
          // Menüyü kapat (ESC tuşu)
          document.body.click();
        }
        
        await wait(randomBetween([2000, 3500]));
      } catch (error) {
        log("Auto mode: Failed to follow", { error: error.message });
      }
    }
  };
})();

