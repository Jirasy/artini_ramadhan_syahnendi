"use strict";

// ── Baca pilihan dari menu.html via localStorage ─────────────────────────────
const INIT_LEVEL        = localStorage.getItem("gd_level")       || "easy";
const INIT_SHIP_COLOR   = localStorage.getItem("gd_shipColor")   || "#00ffff";
const INIT_BULLET_COLOR = localStorage.getItem("gd_bulletColor") || "#ff0000";

// ── Level config ─────────────────────────────────────────────────────────────
const LEVELS = {
  easy:   { enemySpeed: 0.5, bulletSpeed: 4, enemyBulletSpeed: 2, fireRate: 800,  enemyFireRate: 2500, maxWaves: 5  },
  medium: { enemySpeed: 0.8, bulletSpeed: 5, enemyBulletSpeed: 3, fireRate: 600,  enemyFireRate: 1800, maxWaves: 7  },
  hard:   { enemySpeed: 1.2, bulletSpeed: 6, enemyBulletSpeed: 4, fireRate: 400,  enemyFireRate: 1200, maxWaves: 10 }
};

// ── Enemy colors (cached) ────────────────────────────────────────────────────
const ENEMY_COLORS = ["#00ff88", "#ff6600", "#ff0066"];

// ── DOM refs ─────────────────────────────────────────────────────────────────
const canvas          = document.getElementById("gameCanvas");
const ctx             = canvas.getContext("2d");
const pauseScreen     = document.getElementById("pauseScreen");
const gameOverScreen  = document.getElementById("gameOverScreen");
const victoryScreen   = document.getElementById("victoryScreen");

// ── Game state ───────────────────────────────────────────────────────────────
let gs = {};          // initialised in startGame()
let animId = null;    // requestAnimationFrame handle

// ── Canvas sizing (mobile-first) ─────────────────────────────────────────────
function resizeCanvas() {
  const hud     = document.querySelector(".shrink-0.md\\:hidden") || { offsetHeight: 0 };
  const hudTop  = document.querySelector(".shrink-0.border-b");
  const topH    = hudTop  ? hudTop.offsetHeight  : 50;
  const botH    = window.innerWidth < 768 ? (hud.offsetHeight || 88) : 0;
  const maxW    = Math.min(window.innerWidth,  600);
  const maxH    = Math.min(window.innerHeight - topH - botH, 600);

  canvas.width  = maxW;
  canvas.height = maxH;
}

// ── Star creation ─────────────────────────────────────────────────────────────
function createStars() {
  const stars = [];
  // Fewer stars on small screens for perf
  const count = window.innerWidth < 480 ? 30 : 50;
  for (let i = 0; i < count; i++) {
    stars.push({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      size:    Math.random() * 1.5 + 0.5,
      speed:   Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.5 + 0.5
    });
  }
  return stars;
}

// ── Wave spawn ────────────────────────────────────────────────────────────────
function spawnWave() {
  const enemies = [];
  const wave    = gs.wave;
  const rows    = Math.min(3 + Math.floor(wave / 2), 5);
  const cols    = Math.min(6 + wave, 10);
  const ew      = 32, eh = 24, pad = 8;
  const startX  = (canvas.width - cols * (ew + pad)) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const type = r === 0 ? 2 : r < 2 ? 1 : 0;
      enemies.push({
        x: startX + c * (ew + pad),
        y: 48 + r * (eh + pad),
        width: ew, height: eh, type
      });
    }
  }
  gs.enemies = enemies;
}

// ── Start / restart game ──────────────────────────────────────────────────────
function startGame() {
  if (animId) cancelAnimationFrame(animId);

  resizeCanvas();

  gs = {
    level:       INIT_LEVEL,
    shipColor:   INIT_SHIP_COLOR,
    bulletColor: INIT_BULLET_COLOR,
    score:        0,
    lives:        3,
    wave:         1,
    isPlaying:    true,
    isPaused:     false,
    player: {
      x: canvas.width / 2 - 18,
      y: canvas.height - 52,
      width: 36, height: 28, speed: 5
    },
    enemies:       [],
    playerBullets: [],
    enemyBullets:  [],
    particles:     [],
    stars:         createStars(),
    enemyDir:      1,
    lastFire:      0,
    lastEnemyFire: 0,
    keys:          { left: false, right: false, fire: false }
  };

  spawnWave();
  updateHUD();
  hideAllOverlays();

  animId = requestAnimationFrame(gameLoop);
}

// ── HUD ──────────────────────────────────────────────────────────────────────
function updateHUD() {
  document.getElementById("scoreDisplay").textContent = gs.score;
  document.getElementById("waveDisplay").textContent  = gs.wave;
  const ld = document.getElementById("livesDisplay");
  ld.innerHTML = "";
  for (let i = 0; i < gs.lives; i++) {
    const s = document.createElement("span");
    s.textContent = "❤️";
    s.className   = "text-xl";
    ld.appendChild(s);
  }
}

// ── Overlay helpers ──────────────────────────────────────────────────────────
function hideAllOverlays() {
  [pauseScreen, gameOverScreen, victoryScreen].forEach(el => el.classList.add("hidden"));
}

function showOverlay(el) {
  hideAllOverlays();
  el.classList.remove("hidden");
}

// ── Pause ────────────────────────────────────────────────────────────────────
function togglePause() {
  if (!gs.isPlaying) return;
  gs.isPaused = !gs.isPaused;
  if (gs.isPaused) {
    showOverlay(pauseScreen);
  } else {
    hideAllOverlays();
    animId = requestAnimationFrame(gameLoop);
  }
}

// ── Game over / victory ──────────────────────────────────────────────────────
function showGameOver() {
  gs.isPlaying = false;
  document.getElementById("finalScore").textContent = gs.score;
  document.getElementById("finalWave").textContent  = gs.wave;
  showOverlay(gameOverScreen);
}

function showVictory() {
  gs.isPlaying = false;
  document.getElementById("victoryScore").textContent = gs.score;
  showOverlay(victoryScreen);
}

// ── Back to menu ─────────────────────────────────────────────────────────────
function goMenu() {
  gs.isPlaying = false;
  if (animId) cancelAnimationFrame(animId);
  window.location.href = "menu.html";
}

// ── Particles ────────────────────────────────────────────────────────────────
function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    gs.particles.push({
      x, y,
      vx:    (Math.random() - 0.5) * 4,
      vy:    (Math.random() - 0.5) * 4,
      size:  Math.random() * 3 + 1.5,
      color,
      life:  1
    });
  }
}

// ── Collision ─────────────────────────────────────────────────────────────────
function hits(a, b) {
  return a.x < b.x + b.width  &&
         a.x + a.width  > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

// ── Game loop ─────────────────────────────────────────────────────────────────
function gameLoop(ts) {
  if (!gs.isPlaying || gs.isPaused) return;
  update(ts);
  render();
  animId = requestAnimationFrame(gameLoop);
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(ts) {
  const lc = LEVELS[gs.level];

  // Stars
  for (const s of gs.stars) {
    s.y += s.speed;
    if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
  }

  // Player move
  const p = gs.player;
  if (gs.keys.left)  p.x = Math.max(0,                      p.x - p.speed);
  if (gs.keys.right) p.x = Math.min(canvas.width - p.width, p.x + p.speed);

  // Player fire
  if (gs.keys.fire && ts - gs.lastFire > lc.fireRate) {
    gs.playerBullets.push({ x: p.x + p.width / 2 - 2, y: p.y, width: 4, height: 12 });
    gs.lastFire = ts;
  }

  // Player bullets
  const pbSpeed = lc.bulletSpeed;
  gs.playerBullets = gs.playerBullets.filter(b => { b.y -= pbSpeed; return b.y > -12; });

  // Enemy movement
  let moveDown = false;
  for (const e of gs.enemies) {
    e.x += lc.enemySpeed * gs.enemyDir;
    if (e.x <= 0 || e.x + e.width >= canvas.width) moveDown = true;
  }
  if (moveDown) {
    gs.enemyDir *= -1;
    for (const e of gs.enemies) {
      e.y += 14;
      if (e.y + e.height > p.y) { showGameOver(); return; }
    }
  }

  // Enemy fire
  if (ts - gs.lastEnemyFire > lc.enemyFireRate && gs.enemies.length > 0) {
    const shooter = gs.enemies[Math.floor(Math.random() * gs.enemies.length)];
    gs.enemyBullets.push({
      x: shooter.x + shooter.width / 2 - 2,
      y: shooter.y + shooter.height,
      width: 4, height: 10
    });
    gs.lastEnemyFire = ts;
  }

  // Enemy bullets
  const ebSpeed = lc.enemyBulletSpeed;
  gs.enemyBullets = gs.enemyBullets.filter(b => { b.y += ebSpeed; return b.y < canvas.height; });

  // Collisions: player bullets vs enemies
  gs.playerBullets = gs.playerBullets.filter(bullet => {
    for (let i = gs.enemies.length - 1; i >= 0; i--) {
      if (hits(bullet, gs.enemies[i])) {
        const e = gs.enemies[i];
        createParticles(e.x + e.width / 2, e.y + e.height / 2, ENEMY_COLORS[e.type], 10);
        gs.score += (e.type + 1) * 10 * gs.wave;
        gs.enemies.splice(i, 1);
        updateHUD();
        return false;
      }
    }
    return true;
  });

  // Collisions: enemy bullets vs player
  gs.enemyBullets = gs.enemyBullets.filter(bullet => {
    if (hits(bullet, p)) {
      gs.lives--;
      createParticles(p.x + p.width / 2, p.y + p.height / 2, gs.shipColor, 15);
      updateHUD();
      if (gs.lives <= 0) { showGameOver(); return false; }
      return false;
    }
    return true;
  });

  // Particles
  gs.particles = gs.particles.filter(pt => {
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.life -= 0.025;
    pt.size *= 0.97;
    return pt.life > 0;
  });

  // Wave complete?
  if (gs.enemies.length === 0) {
    if (gs.wave >= lc.maxWaves) {
      showVictory();
    } else {
      gs.wave++;
      spawnWave();
      updateHUD();
    }
  }
}

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  const W = canvas.width, H = canvas.height;

  // Background
  ctx.fillStyle = "#08081a";
  ctx.fillRect(0, 0, W, H);

  // Stars (no shadow for perf)
  for (const s of gs.stars) {
    ctx.globalAlpha = s.opacity;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(s.x, s.y, s.size, s.size);   // fillRect faster than arc
  }
  ctx.globalAlpha = 1;

  // Player
  drawPlayer();

  // Enemies (batch by type to reduce state changes)
  for (const e of gs.enemies) drawEnemy(e);

  // Player bullets — single shadow set
  ctx.shadowColor = gs.bulletColor;
  ctx.shadowBlur  = 8;
  ctx.fillStyle   = gs.bulletColor;
  for (const b of gs.playerBullets) ctx.fillRect(b.x, b.y, b.width, b.height);
  ctx.shadowBlur = 0;

  // Enemy bullets
  ctx.fillStyle   = "#ff3366";
  ctx.shadowColor = "#ff3366";
  ctx.shadowBlur  = 6;
  for (const b of gs.enemyBullets) {
    ctx.beginPath();
    ctx.arc(b.x + 2, b.y + 5, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Particles
  for (const pt of gs.particles) {
    ctx.globalAlpha = pt.life;
    ctx.fillStyle   = pt.color;
    ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
  }
  ctx.globalAlpha = 1;
}

// ── Draw player ───────────────────────────────────────────────────────────────
function drawPlayer() {
  const p  = gs.player;
  const cx = p.x + p.width / 2;

  ctx.save();
  ctx.shadowColor = gs.shipColor;
  ctx.shadowBlur  = 12;
  ctx.fillStyle   = gs.shipColor;

  // Body
  ctx.beginPath();
  ctx.moveTo(cx,               p.y);
  ctx.lineTo(p.x + p.width,   p.y + p.height);
  ctx.lineTo(cx + p.width*.2, p.y + p.height * .7);
  ctx.lineTo(cx,               p.y + p.height);
  ctx.lineTo(cx - p.width*.2, p.y + p.height * .7);
  ctx.lineTo(p.x,              p.y + p.height);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.shadowBlur = 0;
  ctx.fillStyle  = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, p.y + p.height * .4, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Engine flame
  ctx.fillStyle   = "#ff6600";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur  = 8;
  ctx.beginPath();
  ctx.moveTo(cx - p.width * .15, p.y + p.height);
  ctx.lineTo(cx,                 p.y + p.height + 7 + Math.random() * 4);
  ctx.lineTo(cx + p.width * .15, p.y + p.height);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ── Draw enemy ────────────────────────────────────────────────────────────────
function drawEnemy(e) {
  const color = ENEMY_COLORS[e.type];
  const cx    = e.x + e.width  / 2;
  const cy    = e.y + e.height / 2;

  ctx.save();
  ctx.fillStyle   = color;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 8;

  if (e.type === 0) {
    // Squid
    ctx.beginPath();
    ctx.arc(cx, e.y + e.height * .4, e.width * .32, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(e.x + i * (e.width / 4) + 2, e.y + e.height * .6, 3, 8);
    }
  } else if (e.type === 1) {
    // Crab
    ctx.fillRect(e.x + e.width * .2, e.y,               e.width * .6, e.height * .6);
    ctx.fillRect(e.x,                e.y + e.height * .3, e.width,     e.height * .4);
    ctx.shadowBlur = 0;
    ctx.fillStyle  = "#000";
    ctx.fillRect(e.x + e.width * .25, e.y + e.height * .15, 4, 4);
    ctx.fillRect(e.x + e.width * .65, e.y + e.height * .15, 4, 4);
  } else {
    // Octopus
    ctx.beginPath();
    ctx.arc(cx, e.y + e.height * .35, e.width * .38, 0, Math.PI, true);
    ctx.fill();
    ctx.fillRect(e.x + e.width * .1, e.y + e.height * .35, e.width * .8, e.height * .38);
    ctx.shadowBlur = 0;
    ctx.fillStyle  = "#fff";
    ctx.beginPath();
    ctx.arc(e.x + e.width * .33, e.y + e.height * .4, 3, 0, Math.PI * 2);
    ctx.arc(e.x + e.width * .67, e.y + e.height * .4, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ── Keyboard ──────────────────────────────────────────────────────────────────
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft"  || e.key === "a" || e.key === "A") gs.keys.left  = true;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") gs.keys.right = true;
  if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
    e.preventDefault();
    gs.keys.fire = true;
  }
  if ((e.key === "Escape" || e.key === "p" || e.key === "P") && gs.isPlaying) togglePause();
});
document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft"  || e.key === "a" || e.key === "A") gs.keys.left  = false;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") gs.keys.right = false;
  if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") gs.keys.fire = false;
});

// ── Mobile touch controls ─────────────────────────────────────────────────────
function bindControl(id, key) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener("touchstart", e => { e.preventDefault(); gs.keys[key] = true;  }, { passive: false });
  btn.addEventListener("touchend",   e => { e.preventDefault(); gs.keys[key] = false; }, { passive: false });
  btn.addEventListener("mousedown",  () => gs.keys[key] = true);
  btn.addEventListener("mouseup",    () => gs.keys[key] = false);
  btn.addEventListener("mouseleave", () => gs.keys[key] = false);
}
bindControl("leftBtn",  "left");
bindControl("rightBtn", "right");
bindControl("fireBtn",  "fire");

// ── Button handlers ───────────────────────────────────────────────────────────
document.getElementById("pauseBtn").addEventListener("click", togglePause);
document.getElementById("resumeBtn").addEventListener("click", togglePause);
document.getElementById("restartBtn").addEventListener("click", startGame);
document.getElementById("playAgainBtn").addEventListener("click", startGame);
document.getElementById("victoryPlayAgainBtn").addEventListener("click", startGame);
document.getElementById("menuBtn").addEventListener("click", goMenu);
document.getElementById("backToMenuBtn").addEventListener("click", goMenu);
document.getElementById("victoryMenuBtn").addEventListener("click", goMenu);

// ── Resize handler ────────────────────────────────────────────────────────────
window.addEventListener("resize", () => {
  if (gs.isPlaying) {
    resizeCanvas();
    gs.stars = createStars();
    // Re-clamp player position
    if (gs.player) {
      gs.player.x = Math.min(gs.player.x, canvas.width - gs.player.width);
    }
  }
});

// ── Visibility API: auto-pause when tab hidden ────────────────────────────────
document.addEventListener("visibilitychange", () => {
  if (document.hidden && gs.isPlaying && !gs.isPaused) togglePause();
});

// ── Boot ──────────────────────────────────────────────────────────────────────
startGame();
