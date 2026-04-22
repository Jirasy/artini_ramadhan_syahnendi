"use strict";

// ── State ───────────────────────────────────────────────────────────────────
let selectedLevel       = "easy";
let selectedShipColor   = "#00ffff";
let selectedBulletColor = "#ff0000";

// ── Helpers ─────────────────────────────────────────────────────────────────
function selectOne(selector, attr, value, activeClass) {
  document.querySelectorAll(selector).forEach(el => {
    const isMe = el.dataset[attr] === value;
    el.classList.toggle(activeClass, isMe);
    el.style.borderColor = isMe ? "white" : "transparent";
    el.setAttribute && el.setAttribute("aria-checked", isMe);
  });
}

// ── Level buttons ────────────────────────────────────────────────────────────
document.querySelectorAll(".level-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedLevel = btn.dataset.level;
    document.querySelectorAll(".level-btn").forEach(b => {
      const isMe = b.dataset.level === selectedLevel;
      b.classList.toggle("selected", isMe);
      b.style.borderColor = isMe
        ? (selectedLevel === "easy" ? "#4ade80" : selectedLevel === "medium" ? "#facc15" : "#f87171")
        : "transparent";
    });
  });
});

// ── Ship color ───────────────────────────────────────────────────────────────
document.querySelectorAll(".color-option").forEach(opt => {
  opt.addEventListener("click", () => {
    selectedShipColor = opt.dataset.color;
    selectOne(".color-option", "color", selectedShipColor, "selected");
  });
});

// ── Bullet color ─────────────────────────────────────────────────────────────
document.querySelectorAll(".bullet-color-option").forEach(opt => {
  opt.addEventListener("click", () => {
    selectedBulletColor = opt.dataset.bulletColor;
    selectOne(".bullet-color-option", "bulletColor", selectedBulletColor, "selected");
  });
});

// ── Start → localStorage → game.html ────────────────────────────────────────
document.getElementById("startBtn").addEventListener("click", () => {
  localStorage.setItem("gd_level",       selectedLevel);
  localStorage.setItem("gd_shipColor",   selectedShipColor);
  localStorage.setItem("gd_bulletColor", selectedBulletColor);
  window.location.href = "game.html";
});
