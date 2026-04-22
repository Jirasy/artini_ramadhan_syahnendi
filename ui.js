// ==================== ui.js ====================
// Tanggung jawab: interaksi kartu, popup deskripsi, toggle tema
// ===============================================

(function () {
  'use strict';

  // ==================== POPUP ====================

  const popup    = document.getElementById('popup');
  const popupTxt = document.getElementById('popup-text');
  let hideTimer  = null;

  function showPopup(text) {
    clearTimeout(hideTimer);
    if (!popup || !popupTxt) return;
    popupTxt.textContent = text;
    popup.setAttribute('aria-hidden', 'false');
    popup.classList.add('show');
  }

  function hidePopup() {
    if (!popup) return;
    popup.classList.remove('show');
    popup.setAttribute('aria-hidden', 'true');
  }

  // Event delegation — satu listener, bukan N listener per card
  const grid = document.getElementById('game-grid');

  if (grid) {
    // Pointer events bekerja untuk mouse DAN touch
    grid.addEventListener('pointerdown', (e) => {
      const card = e.target.closest('.game-card');
      if (card) showPopup(card.dataset.desc || '');
    });

    grid.addEventListener('pointerup',    hidePopup);
    grid.addEventListener('pointerleave', hidePopup);
    grid.addEventListener('pointercancel', hidePopup);
  }

  // Sembunyikan popup saat scroll (penting di mobile)
  document.addEventListener('scroll', hidePopup, { passive: true });

  // ==================== THEME TOGGLE ====================

  const toggleBtn = document.getElementById('theme-toggle');

  // Cek preferensi sistem
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  // Cek localStorage (simpan pilihan user)
  const savedTheme = localStorage.getItem('theme');

  function applyTheme(dark) {
    document.body.classList.toggle('dark-mode', dark);
    if (toggleBtn) toggleBtn.textContent = dark ? '☀️' : '🌙';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    // Refresh sky color untuk mode baru
    if (window.bgUpdate) window.bgUpdate();
  }

  // Inisialisasi tema
  if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
    applyTheme(true);
  } else {
    applyTheme(false);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark-mode');
      toggleBtn.classList.add('rotate');
      toggleBtn.addEventListener('animationend', () => toggleBtn.classList.remove('rotate'), { once: true });
      applyTheme(!isDark);
    });
  }

  // ==================== CARD ENTRANCE ANIMATION ====================
  // IntersectionObserver — kartu fade-in saat masuk viewport
  // Lebih ringan dari menganimasikan semua sekaligus

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('.game-card').forEach((card, i) => {
      card.style.setProperty('--i', i % 10); // delay stagger max 10 item
      observer.observe(card);
    });
  } else {
    // Fallback: langsung tampilkan semua
    document.querySelectorAll('.game-card').forEach(c => c.classList.add('visible'));
  }

})();
