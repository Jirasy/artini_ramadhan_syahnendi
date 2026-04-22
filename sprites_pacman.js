// sprites.js — Canvas-drawn sprites (no external image files needed)

const GHOST_COLORS = {
    r: '#FF2222',   // red
    b: '#22DDFF',   // blue (cyan)
    p: '#FFB8FF',   // pink
    o: '#FFB852'    // orange
};

/**
 * Draw a maze wall tile with a glowing blue border effect.
 */
function drawWall(ctx, x, y, size) {
    // Fill
    ctx.fillStyle = '#08144a';
    ctx.fillRect(x, y, size, size);

    // Inner glow border
    ctx.strokeStyle = '#3355ff';
    ctx.lineWidth = Math.max(1.5, size * 0.07);
    const inset = ctx.lineWidth / 2 + 0.5;
    ctx.strokeRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
}

/**
 * Draw Pac-Man at (x, y) facing `direction` with an animated mouth.
 * mouthAngle: 0 = closed, ~0.35 = wide open (radians from horizontal)
 */
function drawPacman(ctx, x, y, size, direction, mouthAngle) {
    ctx.save();

    const cx = x + size / 2;
    const cy = y + size / 2;
    const r  = size / 2 - 1;

    // Rotate canvas so mouth always opens in the direction of travel
    let rot = 0;
    if (direction === 'L') rot = Math.PI;
    else if (direction === 'U') rot = -Math.PI / 2;
    else if (direction === 'D') rot =  Math.PI / 2;
    // 'R' → 0

    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Body
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.shadowBlur  = 6;
    ctx.beginPath();
    const ma = Math.max(0.02, mouthAngle);
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, ma, Math.PI * 2 - ma);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(r * 0.18, -r * 0.46, r * 0.11, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/**
 * Draw a ghost of given type ('r', 'b', 'p', 'o') at (x, y).
 */
function drawGhost(ctx, x, y, size, type) {
    const color = GHOST_COLORS[type] || '#FF0000';

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur  = 8;

    const pad    = 2;
    const left   = x + pad;
    const right  = x + size - pad;
    const top    = y + pad;
    const bottom = y + size - pad;
    const w      = right - left;
    const r      = w / 2;
    const cx     = left + r;

    ctx.fillStyle = color;
    ctx.beginPath();

    // Top semicircle
    ctx.arc(cx, top + r, r, Math.PI, 0, false);

    // Right side straight down
    ctx.lineTo(right, bottom);

    // Wavy bottom — 3 bumps, right to left
    const ww = w / 3;
    for (let i = 3; i >= 1; i--) {
        const wx = left + (i - 1) * ww;
        ctx.quadraticCurveTo(wx + ww * 0.75, bottom + r * 0.4, wx + ww * 0.5, bottom);
        ctx.quadraticCurveTo(wx + ww * 0.25, bottom - r * 0.2, wx, bottom);
    }

    ctx.closePath();
    ctx.fill();

    // Eyes — white outer
    ctx.shadowBlur = 0;
    const eyeR  = r * 0.27;
    const eyeY  = top + r * 0.7;
    const eyeLX = cx - r * 0.3;
    const eyeRX = cx + r * 0.3;

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(eyeLX, eyeY, eyeR, eyeR * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(eyeRX, eyeY, eyeR, eyeR * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#1122ff';
    ctx.beginPath();
    ctx.arc(eyeLX + eyeR * 0.2, eyeY + eyeR * 0.1, eyeR * 0.52, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeRX + eyeR * 0.2, eyeY + eyeR * 0.1, eyeR * 0.52, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/**
 * Draw a small food pellet (circle) centred in the given block's region.
 */
function drawFood(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r  = size / 2;

    ctx.fillStyle = '#ffb8ae';
    ctx.shadowColor = 'rgba(255, 180, 160, 0.6)';
    ctx.shadowBlur  = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

/**
 * Draw a mini Pac-Man icon used for the lives HUD.
 */
function drawLifeIcon(canvas) {
    const ctx = canvas.getContext('2d');
    const cx  = canvas.width  / 2;
    const cy  = canvas.height / 2;
    const r   = Math.min(cx, cy) - 1;

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, 0.3, Math.PI * 2 - 0.3);
    ctx.closePath();
    ctx.fill();
}
