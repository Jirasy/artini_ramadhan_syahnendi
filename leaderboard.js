// ==================== LEADERBOARD UTILITY ====================
// Shared utility for all games to save scores and show leaderboard

const LB_KEY = 'leaderboard';
const USER_KEY = 'username';

window.LB = {
  getUsername() {
    return localStorage.getItem(USER_KEY) || null;
  },
  setUsername(name) {
    if (name && name.trim()) {
      localStorage.setItem(USER_KEY, name.trim());
    }
  },
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(LB_KEY)) || {};
    } catch { return {}; }
  },
  save(gameName, score) {
    const username = this.getUsername();
    if (!username || score == null || score < 0) return;
    const lb = this.getAll();
    if (!lb[gameName]) lb[gameName] = [];
    const entry = {
      username,
      score,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      ts: Date.now()
    };
    lb[gameName].push(entry);
    lb[gameName].sort((a, b) => b.score - a.score);
    lb[gameName] = lb[gameName].slice(0, 100);
    localStorage.setItem(LB_KEY, JSON.stringify(lb));
    this.showSavedToast(gameName, score);
  },
  getTop(gameName, n = 10) {
    return (this.getAll()[gameName] || []).slice(0, n);
  },
  showSavedToast(gameName, score) {
    const existing = document.getElementById('lb-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'lb-toast';
    toast.innerHTML = `🏆 Skor <b>${score}</b> di <b>${gameName}</b> tersimpan!`;
    Object.assign(toast.style, {
      position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '10px 20px',
      borderRadius: '20px', fontSize: '14px', zIndex: '99999',
      border: '1px solid rgba(255,215,0,0.5)', backdropFilter: 'blur(10px)',
      animation: 'lb-fadein 0.3s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    });
    const style = document.createElement('style');
    style.textContent = `@keyframes lb-fadein { from { opacity:0; transform: translateX(-50%) translateY(20px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }`;
    document.head.appendChild(style);
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },
  // Show a mini leaderboard modal for the current game
  showGameLeaderboard(gameName) {
    const existing = document.getElementById('lb-modal-overlay');
    if (existing) existing.remove();
    const top = this.getTop(gameName, 10);
    const medals = ['🥇', '🥈', '🥉'];
    const rows = top.length === 0
      ? '<tr><td colspan="3" style="text-align:center;opacity:0.5;padding:20px">Belum ada skor</td></tr>'
      : top.map((e, i) => `
          <tr style="background:${i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent'}">
            <td style="padding:8px 12px;text-align:center">${medals[i] || (i + 1)}</td>
            <td style="padding:8px 12px;font-weight:600">${e.username}</td>
            <td style="padding:8px 12px;text-align:right;color:#ffd700;font-weight:700">${e.score.toLocaleString()}</td>
          </tr>`).join('');
    const overlay = document.createElement('div');
    overlay.id = 'lb-modal-overlay';
    overlay.innerHTML = `
      <div id="lb-modal-box">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h2 style="margin:0;font-size:1.2rem">🏆 Leaderboard - ${gameName}</h2>
          <button id="lb-modal-close" style="background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer;line-height:1">×</button>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
          <thead><tr style="border-bottom:1px solid rgba(255,255,255,0.2)">
            <th style="padding:6px 12px">#</th>
            <th style="padding:6px 12px;text-align:left">Pemain</th>
            <th style="padding:6px 12px;text-align:right">Skor</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <button id="lb-modal-close2" style="margin-top:16px;width:100%;padding:10px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;border-radius:8px;cursor:pointer;font-size:0.95rem">Tutup</button>
      </div>`;
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.7)', zIndex: '99998', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box'
    });
    const box = overlay.querySelector('#lb-modal-box');
    Object.assign(box.style, {
      background: 'linear-gradient(135deg, #1a1a3e, #2d1b69)',
      border: '1px solid rgba(255,215,0,0.3)', borderRadius: '16px',
      padding: '20px', width: '100%', maxWidth: '400px', maxHeight: '80vh',
      overflowY: 'auto', color: '#fff', fontFamily: 'Poppins, sans-serif',
      boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
    });
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    document.getElementById('lb-modal-close').onclick = close;
    document.getElementById('lb-modal-close2').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
  },
  // Add a floating back + leaderboard button to game pages
  addGameUI(gameName) {
    const style = document.createElement('style');
    style.textContent = `
      #game-nav-bar { position:fixed;top:0;left:0;right:0;z-index:9999;display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(0,0,0,0.4);backdrop-filter:blur(8px);border-bottom:1px solid rgba(255,255,255,0.1); }
      .gnav-btn { display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:#fff;font-size:0.8rem;cursor:pointer;font-family:Poppins,sans-serif;font-weight:600;transition:all 0.2s;text-decoration:none; }
      .gnav-btn:hover { background:rgba(255,255,255,0.2); }
      #game-nav-spacer { height: 48px; }
      .gnav-title { color:#fff;font-size:0.9rem;font-weight:700;font-family:Poppins,sans-serif;opacity:0.9; }
    `;
    document.head.appendChild(style);
    const nav = document.createElement('div');
    nav.id = 'game-nav-bar';
    nav.innerHTML = `
      <a href="../index.html" class="gnav-btn">🏠 Menu</a>
      <span class="gnav-title">${gameName}</span>
      <button class="gnav-btn" id="gnav-lb-btn">🏆 Skor</button>
    `;
    document.body.insertBefore(nav, document.body.firstChild);
    const spacer = document.createElement('div');
    spacer.id = 'game-nav-spacer';
    document.body.insertBefore(spacer, nav.nextSibling);
    document.getElementById('gnav-lb-btn').onclick = () => this.showGameLeaderboard(gameName);
  },
  // Check and prompt username if not set
  ensureUsername(callback) {
    if (this.getUsername()) { if (callback) callback(); return; }
    const existing = document.getElementById('lb-username-overlay');
    if (existing) return;
    const overlay = document.createElement('div');
    overlay.id = 'lb-username-overlay';
    overlay.innerHTML = `
      <div style="background:linear-gradient(135deg,#1a1a3e,#2d1b69);border:1px solid rgba(255,215,0,0.4);border-radius:16px;padding:24px;width:90%;max-width:320px;text-align:center;color:#fff;font-family:Poppins,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,0.8)">
        <div style="font-size:2rem;margin-bottom:8px">👤</div>
        <h3 style="margin:0 0 6px;font-size:1.1rem">Masukkan Namamu</h3>
        <p style="margin:0 0 16px;opacity:0.6;font-size:0.85rem">Agar skormu bisa masuk leaderboard!</p>
        <input id="lb-username-input" type="text" maxlength="20" placeholder="Nama kamu..." style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:1rem;font-family:Poppins,sans-serif;box-sizing:border-box;outline:none;margin-bottom:12px">
        <button id="lb-username-save" style="width:100%;padding:12px;border-radius:10px;border:none;background:linear-gradient(90deg,#f093fb,#f5576c);color:#fff;font-weight:700;font-size:1rem;cursor:pointer;font-family:Poppins,sans-serif">Mulai Main! 🎮</button>
      </div>`;
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.8)', zIndex: '999999', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box'
    });
    document.body.appendChild(overlay);
    const input = document.getElementById('lb-username-input');
    const saveBtn = document.getElementById('lb-username-save');
    input.focus();
    const save = () => {
      const name = input.value.trim();
      if (!name) { input.style.border = '1px solid #f5576c'; return; }
      this.setUsername(name);
      overlay.remove();
      if (callback) callback();
    };
    saveBtn.onclick = save;
    input.onkeydown = (e) => { if (e.key === 'Enter') save(); };
  }
};

// Auto-run on game pages (pages with a parent path)
document.addEventListener('DOMContentLoaded', () => {
  // Only prompt on game pages (not main index)
  if (window.location.pathname !== '/' && !window.location.pathname.endsWith('index.html')) {
    window.LB.ensureUsername();
  }
});