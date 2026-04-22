// pacman.js — Main game logic

// ========================
// CONSTANTS & STATE
// ========================
const ROW_COUNT    = 21;
const COL_COUNT    = 19;
const TILE_MAP = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX"
];

const DIRS = ['U', 'D', 'L', 'R'];

let tileSize   = 32;
let boardW     = COL_COUNT * tileSize;
let boardH     = ROW_COUNT * tileSize;

let board, ctx;
const walls  = new Set();
const foods  = new Set();
const ghosts = new Set();
let pacman;

let score    = 0;
let lives    = 3;
let level    = 1;
let gameOver = false;

// Mouth animation
let mouthAngle = 0.3;
let mouthDelta = -0.04;

// Game loop handle — kept so we can cancel stale loops on restart
let loopHandle = null;
let resizeHandle = null;


// ========================
// ENTRY POINT
// ========================
window.addEventListener('load', function () {
    board = document.getElementById('board');
    ctx   = board.getContext('2d');

    computeLayout();
    loadMap();
    resetDirections();

    setupKeyboardControls(handleDirection);
    setupDpadControls(handleDirection);
    setupSwipeControls(board, handleDirection);

    window.addEventListener('resize', function () {
        clearTimeout(resizeHandle);
        resizeHandle = setTimeout(onResize, 180);
    });

    updateHUD();
    startLoop();
});


// ========================
// LAYOUT / RESPONSIVE
// ========================
function computeLayout() {
    // Calculate the largest tileSize that fits the available screen space
    const hud      = document.getElementById('hud');
    const controls = document.getElementById('controls');
    const wrapper  = document.getElementById('game-wrapper');

    // Use actual rendered heights (already in DOM at load time)
    const wrapperPad = 20;  // top + bottom padding + gaps
    const hudH       = hud      ? hud.offsetHeight      + 6 : 48;
    const ctrlH      = (controls && getComputedStyle(controls).display !== 'none')
                       ? controls.offsetHeight + 6
                       : 0;

    const availW = Math.min(window.innerWidth  - 16,      640);
    const availH = window.innerHeight - hudH - ctrlH - wrapperPad - 10;

    const byW = Math.floor(availW / COL_COUNT);
    const byH = Math.floor(availH / ROW_COUNT);

    tileSize = Math.max(12, Math.min(byW, byH, 32));
    boardW   = COL_COUNT * tileSize;
    boardH   = ROW_COUNT * tileSize;

    board.width  = boardW;
    board.height = boardH;
}

function onResize() {
    computeLayout();
    loadMap();          // recalculate pixel positions with new tileSize
    resetPositions();
    resetDirections();
    updateHUD();
    if (gameOver) draw(); // redraw immediately if paused at game-over screen
}


// ========================
// GAME LOOP
// ========================
function startLoop() {
    // Cancel any existing loop before starting a new one (prevents double-loops on restart)
    if (loopHandle !== null) {
        clearTimeout(loopHandle);
        loopHandle = null;
    }
    tick();
}

function tick() {
    if (gameOver) {
        draw();
        showOverlay();
        return;
    }
    move();
    draw();
    loopHandle = setTimeout(tick, 50);  // ~20 FPS
}


// ========================
// INPUT HANDLER
// ========================
function handleDirection(dir) {
    if (gameOver) {
        restartGame();
        return;
    }
    if (pacman) pacman.updateDirection(dir);
}


// ========================
// DRAWING
// ========================
function draw() {
    ctx.clearRect(0, 0, boardW, boardH);

    // Walls
    for (const w of walls) drawWall(ctx, w.x, w.y, tileSize);

    // Food
    for (const f of foods) drawFood(ctx, f.x, f.y, f.width);

    // Animate mouth
    if (pacman && (pacman.velocityX !== 0 || pacman.velocityY !== 0)) {
        mouthAngle += mouthDelta;
        if (mouthAngle >= 0.38) { mouthAngle = 0.38; mouthDelta = -0.04; }
        if (mouthAngle <= 0.01) { mouthAngle = 0.01; mouthDelta =  0.04; }
    }

    // Pac-Man
    if (pacman) {
        const angle = (pacman.velocityX === 0 && pacman.velocityY === 0) ? 0.25 : mouthAngle;
        drawPacman(ctx, pacman.x, pacman.y, tileSize, pacman.direction, angle);
    }

    // Ghosts
    for (const g of ghosts) drawGhost(ctx, g.x, g.y, tileSize, g.type);
}


// ========================
// MOVEMENT & PHYSICS
// ========================
function move() {
    if (!pacman) return;

    // --- Pac-Man movement ---
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    for (const w of walls) {
        if (collision(pacman, w)) {
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
    }

    // --- Ghost movement ---
    for (const ghost of ghosts) {

        // Ghost-pacman collision
        if (collision(ghost, pacman)) {
            lives--;
            updateHUD();
            if (lives <= 0) {
                gameOver = true;
                return;
            }
            resetPositions();
            resetDirections();
            return;
        }

        // Force ghosts to leave the ghost house upward
        if (ghost.y === tileSize * 9 &&
            ghost.direction !== 'U' && ghost.direction !== 'D') {
            ghost.updateDirection('U');
        }

        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;

        // Ghost wall collision → pick new random direction
        let ghostHitWall = false;
        for (const w of walls) {
            if (collision(ghost, w)) { ghostHitWall = true; break; }
        }
        if (ghostHitWall || ghost.x <= 0 || ghost.x + ghost.width >= boardW) {
            ghost.x -= ghost.velocityX;
            ghost.y -= ghost.velocityY;
            ghost.updateDirection(DIRS[Math.floor(Math.random() * 4)]);
        }
    }

    // --- Food collection ---
    let eaten = null;
    for (const f of foods) {
        if (collision(pacman, f)) { eaten = f; score += 10; break; }
    }
    if (eaten) {
        foods.delete(eaten);
        updateHUD();
    }

    // --- Level complete ---
    if (foods.size === 0) {
        level++;
        updateHUD();
        loadMap();
        resetPositions();
        resetDirections();
    }
}


// ========================
// MAP LOADING
// ========================
function loadMap() {
    walls.clear();
    foods.clear();
    ghosts.clear();

    for (let r = 0; r < ROW_COUNT; r++) {
        for (let c = 0; c < COL_COUNT; c++) {
            const ch = TILE_MAP[r][c];
            const x  = c * tileSize;
            const y  = r * tileSize;

            if (ch === 'X') {
                walls.add(new Block(x, y, tileSize, tileSize, null));
            } else if (ch === 'b' || ch === 'o' || ch === 'p' || ch === 'r') {
                ghosts.add(new Block(x, y, tileSize, tileSize, ch));
            } else if (ch === 'P') {
                pacman = new Block(x, y, tileSize, tileSize, 'pacman');
            } else if (ch === ' ') {
                const fs  = Math.max(3, Math.floor(tileSize * 0.14));
                const off = Math.floor((tileSize - fs) / 2);
                foods.add(new Block(x + off, y + off, fs, fs, 'food'));
            }
            // 'O' = open/skip (no object)
        }
    }
}


// ========================
// HELPERS
// ========================
function resetPositions() {
    if (pacman) {
        pacman.reset();
        pacman.velocityX = 0;
        pacman.velocityY = 0;
        pacman.direction = 'R';
    }
    for (const g of ghosts) {
        g.reset();
        g.velocityX = 0;
        g.velocityY = 0;
    }
}

function resetDirections() {
    for (const g of ghosts) {
        g.updateDirection(DIRS[Math.floor(Math.random() * 4)]);
    }
}

function collision(a, b) {
    return a.x           < b.x + b.width  &&
           a.x + a.width > b.x            &&
           a.y            < b.y + b.height &&
           a.y + a.height > b.y;
}


// ========================
// HUD
// ========================
function updateHUD() {
    const scoreEl = document.getElementById('score-value');
    const levelEl = document.getElementById('level-value');
    const livesEl = document.getElementById('lives-icons');

    if (scoreEl) scoreEl.textContent = score;
    if (levelEl) levelEl.textContent = level;

    if (livesEl) {
        livesEl.innerHTML = '';
        for (let i = 0; i < Math.max(0, lives); i++) {
            const c  = document.createElement('canvas');
            c.width  = 14;
            c.height = 14;
            c.className = 'life-pac';
            drawLifeIcon(c);
            livesEl.appendChild(c);
        }
    }
}


// ========================
// OVERLAY
// ========================
function showOverlay() {
    const overlay = document.getElementById('overlay');
    const title   = document.getElementById('overlay-title');
    const sub     = document.getElementById('overlay-score');

    if (overlay) overlay.classList.remove('hidden');
    if (title)   title.textContent = lives <= 0 ? 'GAME OVER' : 'YOU WIN! 🎉';
    if (sub)     sub.textContent   = 'SCORE: ' + score;
}

function hideOverlay() {
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.add('hidden');
}


// ========================
// RESTART
// ========================
function restartGame() {
    score    = 0;
    lives    = 3;
    level    = 1;
    gameOver = false;

    hideOverlay();
    loadMap();
    resetPositions();
    resetDirections();
    updateHUD();
    startLoop();
}


// ========================
// BLOCK CLASS
// ========================
class Block {
    constructor(x, y, width, height, type) {
        this.x      = x;
        this.y      = y;
        this.width  = width;
        this.height = height;
        this.type   = type;

        // Remember spawn position for reset
        this.startX = x;
        this.startY = y;

        this.direction = 'R';
        this.velocityX = 0;
        this.velocityY = 0;
    }

    /**
     * Attempt to change direction.
     * If the one-step lookahead hits a wall, revert to old direction.
     */
    updateDirection(dir) {
        const prevDir = this.direction;
        this.direction = dir;
        this.updateVelocity();

        // Lookahead — step forward and check walls
        this.x += this.velocityX;
        this.y += this.velocityY;

        for (const w of walls) {
            if (collision(this, w)) {
                // Blocked — undo and keep old direction
                this.x -= this.velocityX;
                this.y -= this.velocityY;
                this.direction = prevDir;
                this.updateVelocity();
                return;
            }
        }

        // Not blocked — undo the test step (movement happens in move())
        this.x -= this.velocityX;
        this.y -= this.velocityY;
    }

    updateVelocity() {
        const spd = tileSize / 4;
        if      (this.direction === 'U') { this.velocityX =    0; this.velocityY = -spd; }
        else if (this.direction === 'D') { this.velocityX =    0; this.velocityY =  spd; }
        else if (this.direction === 'L') { this.velocityX = -spd; this.velocityY =    0; }
        else if (this.direction === 'R') { this.velocityX =  spd; this.velocityY =    0; }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
    }
}
