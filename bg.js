// ==================== bg.js ====================
// Tanggung jawab: warna langit berdasarkan waktu + tampilan jam
// Update setiap 60 detik (bukan 1 detik) — jauh lebih ringan
// =====================================================

(function () {
  'use strict';

  // Palet warna langit per periode waktu
  // Format: [top-color, mid-color, bottom-color]
  const SKY_PALETTES = {
    'fajar':        ['#1a3a52', '#4a6fa5', '#87ceeb'],
    'pagi':         ['#2d5a8c', '#5b9fd5', '#87ceeb'],
    'siang':        ['#4a90e2', '#87ceeb', '#e0f6ff'],
    'sore':         ['#ff8c42', '#ffb84d', '#ffd699'],
    'maghrib':      ['#d97706', '#f97316', '#fb923c'],
    'malam':        ['#5b3a9d', '#7c3aed', '#a78bfa'],
    'tengah-malam': ['#0f0f23', '#1a1a3f', '#2d1b69'],
  };

  const SKY_PALETTES_DARK = {
    'fajar':        ['#0d1f2d', '#1a3a52', '#2d5a8c'],
    'pagi':         ['#1a3a52', '#2d5a8c', '#4a6fa5'],
    'siang':        ['#2d5a8c', '#4a90e2', '#5b9fd5'],
    'sore':         ['#cc6600', '#d97706', '#f97316'],
    'maghrib':      ['#8b4000', '#b85e00', '#d97706'],
    'malam':        ['#3d2570', '#5b3a9d', '#6d28d9'],
    'tengah-malam': ['#0a0a1a', '#0f0f23', '#1a1a3f'],
  };

  const TIME_PERIODS = [
    { name: 'tengah-malam', from:  0, to:  4 },
    { name: 'fajar',        from:  4, to:  6 },
    { name: 'pagi',         from:  6, to: 11 },
    { name: 'siang',        from: 11, to: 17 },
    { name: 'sore',         from: 17, to: 18 },
    { name: 'maghrib',      from: 18, to: 20 },
    { name: 'malam',        from: 20, to: 24 },
  ];

  const ALL_PERIODS = TIME_PERIODS.map(p => p.name);

  function getPeriod(hours) {
    for (const p of TIME_PERIODS) {
      if (hours >= p.from && hours < p.to) return p.name;
    }
    return 'tengah-malam';
  }

  function lerp(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  function hexToRgb(hex) {
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    return m ? [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)] : [0,0,0];
  }

  function blendColors(c1hex, c2hex, t) {
    const [r1,g1,b1] = hexToRgb(c1hex);
    const [r2,g2,b2] = hexToRgb(c2hex);
    return `rgb(${lerp(r1,r2,t)},${lerp(g1,g2,t)},${lerp(b1,b2,t)})`;
  }

  function getSkyGradient(period, nextPeriod, progress) {
    const isDark = document.body.classList.contains('dark-mode');
    const palettes = isDark ? SKY_PALETTES_DARK : SKY_PALETTES;

    const p1 = palettes[period]  || palettes['siang'];
    const p2 = palettes[nextPeriod] || p1;

    const top = blendColors(p1[0], p2[0], progress);
    const mid = blendColors(p1[1], p2[1], progress);
    const bot = blendColors(p1[2], p2[2], progress);

    return `linear-gradient(180deg, ${top} 0%, ${mid} 50%, ${bot} 100%)`;
  }

  function getNextPeriod(period) {
    const idx = ALL_PERIODS.indexOf(period);
    return ALL_PERIODS[(idx + 1) % ALL_PERIODS.length];
  }

  function getPeriodProgress(hours, minutes, period) {
    const entry = TIME_PERIODS.find(p => p.name === period);
    if (!entry) return 0;
    const totalMinutes = (entry.to - entry.from) * 60;
    const elapsed = (hours - entry.from) * 60 + minutes;
    return Math.min(elapsed / totalMinutes, 1);
  }

  const skyEl = document.getElementById('sky');
  const timeEl = document.getElementById('time-display');

  function updateBackground() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();

    // Jam
    if (timeEl) {
      timeEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    }

    const period = getPeriod(h);
    const nextPer = getNextPeriod(period);
    const progress = getPeriodProgress(h, m, period);

    // Update sky gradient
    if (skyEl) {
      skyEl.style.background = getSkyGradient(period, nextPer, progress);
    }

    // Update class tubuh untuk star visibility
    document.body.classList.remove(...ALL_PERIODS.map(p => `time-${p}`));
    document.body.classList.add(`time-${period}`);
  }

  // Jalankan langsung
  updateBackground();

  // Update tiap menit — bukan tiap detik
  setInterval(updateBackground, 60_000);

  // Expose untuk theme toggle
  window.bgUpdate = updateBackground;

  // ==================== STARS (generate sekali) ====================
  // Cukup 30 bintang — tidak perlu 100
  const starsEl = document.getElementById('stars');
  if (starsEl) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 30; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      s.style.cssText = `
        left:${(Math.random()*100).toFixed(1)}%;
        top:${(Math.random()*80).toFixed(1)}%;
        animation-delay:${(Math.random()*3).toFixed(1)}s;
        animation-duration:${(2+Math.random()*2).toFixed(1)}s
      `;
      frag.appendChild(s);
    }
    starsEl.appendChild(frag);
  }

})();
