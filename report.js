// Get report data from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const reportData = urlParams.get('data');

let followedUsers = [];
let startTime = Date.now();
let endTime = Date.now();

if (reportData) {
  try {
    const decoded = JSON.parse(decodeURIComponent(reportData));
    followedUsers = decoded.users || [];
    startTime = decoded.startTime || Date.now();
    endTime = decoded.endTime || Date.now();
  } catch (error) {
    console.error('Failed to parse report data:', error);
  }
}

// Update stats
document.getElementById('totalCount').textContent = followedUsers.length;
document.getElementById('verifiedCount').textContent = followedUsers.length; // All are verified
const durationSeconds = Math.round((endTime - startTime) / 1000);
document.getElementById('duration').textContent = durationSeconds + 's';

// Render user list
const userListEl = document.getElementById('userList');

if (followedUsers.length === 0) {
  userListEl.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">📭</div>
      <p>Henüz kimse takip edilmedi</p>
    </div>
  `;
} else {
  userListEl.innerHTML = followedUsers.map((user, index) => {
    const timestamp = user.timestamp ? new Date(user.timestamp).toLocaleTimeString('tr-TR') : '';
    return `
      <div class="user-item" style="animation-delay: ${index * 0.03}s">
        <div class="user-number">#${index + 1}</div>
        <div class="user-info">
          <svg class="verified-badge" viewBox="0 0 24 24" fill="#1d9bf0">
            <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
          </svg>
          <span class="username">@${user.username || 'unknown'}</span>
          <a href="https://x.com/${user.username}" target="_blank" class="user-link">Profili Aç →</a>
        </div>
        ${timestamp ? `<div class="timestamp">${timestamp}</div>` : ''}
      </div>
    `;
  }).join('');
}

// Export as JSON
document.getElementById('exportBtn').addEventListener('click', () => {
  const dataStr = JSON.stringify({
    followedUsers,
    totalCount: followedUsers.length,
    startTime,
    endTime,
    durationSeconds,
    exportedAt: new Date().toISOString()
  }, null, 2);

  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `twitter-follows-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// Copy list to clipboard
document.getElementById('copyBtn').addEventListener('click', async () => {
  const usernames = followedUsers.map(u => '@' + u.username).join('\n');
  try {
    await navigator.clipboard.writeText(usernames);
    const btn = document.getElementById('copyBtn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Kopyalandı!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  } catch (error) {
    alert('Kopyalama başarısız: ' + error.message);
  }
});

// Close window
document.getElementById('closeBtn').addEventListener('click', () => {
  window.close();
});

