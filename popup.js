const statusEl = document.getElementById("status");
const autoModeButton = document.getElementById("autoMode");

const setStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#f87171" : "#a8b0ff";
};

// Popup açıldığında mevcut durumu kontrol et
const checkRunningState = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    const response = await chrome.tabs.sendMessage(tab.id, { type: "check-status" });
    
    if (response?.autoMode) {
      autoModeButton.classList.add("active");
      autoModeButton.textContent = "⏸ Stop Auto Mode";
      const count = response.autoModeFollowCount || 0;
      setStatus(`Auto mode active! Followed: ${count} accounts`);
      
      // Canlı güncelleme başlat
      startAutoModeMonitor();
    }
  } catch (error) {
    // Content script yüklü değil, normal durum
  }
};

// Sayfa yüklendiğinde durumu kontrol et
checkRunningState();

// Auto mode canlı sayaç izleyici
let autoModeMonitorInterval = null;

const startAutoModeMonitor = () => {
  if (autoModeMonitorInterval) return;
  
  autoModeMonitorInterval = setInterval(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;
      
      const response = await chrome.tabs.sendMessage(tab.id, { type: "check-status" });
      
      if (response?.autoMode) {
        const count = response.autoModeFollowCount || 0;
        setStatus(`Auto mode active! Followed: ${count} accounts`);
      } else {
        stopAutoModeMonitor();
      }
    } catch (error) {
      stopAutoModeMonitor();
    }
  }, 1000); // Her saniye güncelle
};

const stopAutoModeMonitor = () => {
  if (autoModeMonitorInterval) {
    clearInterval(autoModeMonitorInterval);
    autoModeMonitorInterval = null;
  }
};

const withErrorHandling = async (fn) => {
  try {
    return await fn();
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Unexpected error occurred.", true);
    throw error;
  }
};

autoModeButton.addEventListener("click", async () => {
  const isActive = autoModeButton.classList.contains("active");
  autoModeButton.disabled = true;

  await withErrorHandling(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      throw new Error("No active tab detected.");
    }

    const isTwitterUrl = /https:\/\/(twitter|x)\.com\/.+/.test(tab.url);
    if (!isTwitterUrl) {
      throw new Error("Open a tweet detail page on Twitter first.");
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    if (isActive) {
      // Stop auto mode
      const response = await chrome.tabs.sendMessage(tab.id, { type: "stop-auto-mode" });
      autoModeButton.classList.remove("active");
      autoModeButton.textContent = "🔄 Start Auto Mode";
      
      const totalFollowed = response?.totalFollowed || 0;
      setStatus(`Auto mode stopped. Total followed: ${totalFollowed} accounts`);
      
      stopAutoModeMonitor();
      
      // Badge'i temizle
      chrome.action.setBadgeText({ text: "" });
    } else {
      // Start auto mode
      await chrome.tabs.sendMessage(tab.id, { type: "start-auto-mode" });
      autoModeButton.classList.add("active");
      autoModeButton.textContent = "⏸ Stop Auto Mode";
      setStatus("Auto mode active! Followed: 0 accounts");
      
      startAutoModeMonitor();
    }
  }).catch(() => {
    // Error already handled
  }).finally(() => {
    autoModeButton.disabled = false;
  });
});

