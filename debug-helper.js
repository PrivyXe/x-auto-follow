// Twitter Follow Button Debug Helper
// Console'da çalıştırın: copy(findFollowButtons())

function findFollowButtons() {
  const results = {
    timestamp: new Date().toISOString(),
    methods: {}
  };

  // Method 1: data-testid="follow"
  const testIdButtons = document.querySelectorAll('[data-testid="follow"]');
  results.methods.dataTestId = {
    count: testIdButtons.length,
    examples: Array.from(testIdButtons).slice(0, 3).map(btn => ({
      html: btn.outerHTML.substring(0, 200),
      text: btn.textContent?.trim(),
      parent: btn.parentElement?.tagName
    }))
  };

  // Method 2: Buttons with "Takip" text
  const allButtons = document.querySelectorAll('button, div[role="button"]');
  const followTextButtons = Array.from(allButtons).filter(btn => {
    const text = btn.textContent?.trim().toLowerCase();
    return text === 'takip et' || text === 'follow' || text === 'takip';
  });
  results.methods.textMatch = {
    count: followTextButtons.length,
    examples: followTextButtons.slice(0, 3).map(btn => ({
      html: btn.outerHTML.substring(0, 200),
      text: btn.textContent?.trim(),
      tagName: btn.tagName,
      role: btn.getAttribute('role')
    }))
  };

  // Method 3: aria-label with "Follow"
  const ariaButtons = document.querySelectorAll('[aria-label*="Follow"], [aria-label*="Takip"]');
  results.methods.ariaLabel = {
    count: ariaButtons.length,
    examples: Array.from(ariaButtons).slice(0, 3).map(btn => ({
      html: btn.outerHTML.substring(0, 200),
      ariaLabel: btn.getAttribute('aria-label'),
      tagName: btn.tagName
    }))
  };

  // Method 4: role="menuitem" with follow text
  const menuItems = document.querySelectorAll('div[role="menuitem"]');
  const followMenuItems = Array.from(menuItems).filter(item => {
    const text = item.textContent?.toLowerCase();
    return text?.includes('takip') || text?.includes('follow');
  });
  results.methods.menuItem = {
    count: followMenuItems.length,
    examples: followMenuItems.slice(0, 3).map(item => ({
      html: item.outerHTML.substring(0, 200),
      text: item.textContent?.trim().substring(0, 100)
    }))
  };

  console.log("=== FOLLOW BUTTON DEBUG RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
  console.log("\nBest method:", Object.entries(results.methods).sort((a, b) => b[1].count - a[1].count)[0]);
  
  return results;
}

// Auto-run
console.log("🔍 Twitter Follow Button Finder");
console.log("Run: findFollowButtons()");
findFollowButtons();

