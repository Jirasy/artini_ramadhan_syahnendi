// ============ UI UTILITIES ============

// Prevent double-tap zoom on mobile
document.addEventListener('dblclick', e => e.preventDefault(), {passive: false});

// Prevent pull-to-refresh on the game screen body
document.addEventListener('touchmove', e => {
  if (e.target.closest('#game-screen') && !e.target.closest('.history-list')) {
    // Allow scrolling in history list, block elsewhere
  }
}, {passive: true});

// Fix 100vh on mobile browsers (address bar)
function fixVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--real-vh', `${vh}px`);
}
fixVH();
window.addEventListener('resize', fixVH);
window.addEventListener('orientationchange', () => setTimeout(fixVH, 150));
