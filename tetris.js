const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const previewCanvas = document.getElementById("preview");
const previewCtx = previewCanvas.getContext("2d");

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 20;

ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

let score = 0;
let linesCleared = 0;
let level = 1;

function updateScore() {
  document.getElementById("score").innerText = "Score: " + score;
  document.getElementById("level").innerText = "Level: " + level;
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(null));
  }
  return matrix;
}

function createPiece(type) {
  if (type === "T") return [[0,0,0],[1,1,1],[0,1,0]];
  if (type === "O") return [[2,2],[2,2]];
  if (type === "L") return [[0,3,0],[0,3,0],[0,3,3]];
  if (type === "J") return [[0,4,0],[0,4,0],[4,4,0]];
  if (type === "I") return [[0,5,0,0],[0,5,0,0],[0,5,0,0],[0,5,0,0]];
  if (type === "S") return [[0,6,6],[6,6,0],[0,0,0]];
  if (type === "Z") return [[7,7,0],[0,7,7],[0,0,0]];
}

function drawMatrix(matrix, offset, color, context) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = color;
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function drawArena(arena) {
  arena.forEach((row, y) => {
    row.forEach((color, x) => {
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    });
  });
}

function draw() {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawArena(arena);
  drawMatrix(player.matrix, player.pos, player.color, ctx);

  // Draw preview
  previewCtx.setTransform(1,0,0,1,0,0); // reset transform
  previewCtx.fillStyle = "#eee";
  previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
  previewCtx.scale(20, 20);
  drawMatrix(nextPiece, {x:1, y:1}, nextColor, previewCtx);
  previewCtx.setTransform(1,0,0,1,0,0);
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
           arena[y + o.y][x + o.x]) !== null) {
        return true;
      }
    }
  }
  return false;
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = player.color;
      }
    });
  });
}

function arenaSweep() {
  let rowCount = 0;
  for (let y = ROWS - 1; y >= 0; --y) {
    if (arena[y].every(cell => cell !== null)) {
      arena.splice(y, 1);
      arena.unshift(new Array(COLS).fill(null));
      rowCount++;
      linesCleared++;
    }
  }
  if (rowCount > 0) {
    if (rowCount === 1) score += 100;
    else if (rowCount === 2) score += 300;
    else if (rowCount === 3) score += 500;
    else if (rowCount === 4) score += 800;

    if (linesCleared >= level * 10) {
      level++;
      dropInterval = Math.max(200, dropInterval - 100);
    }
    updateScore();
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
  }
  dropCounter = 0;
}

function hardDrop() {
  while (!collide(arena, player)) {
    player.pos.y++;
  }
  player.pos.y--;
  merge(arena, player);
  playerReset();
  arenaSweep();
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate(dir) {
  const m = player.matrix;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
    }
  }
  if (dir > 0) m.forEach(row => row.reverse());
  else m.reverse();
  if (collide(arena, player)) {
    playerRotate(-dir);
  }
}

let nextPiece = null;
let nextColor = null;

function playerReset() {
  if (!nextPiece) {
    const pieces = "TJLOSZI";
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    nextPiece = createPiece(type);
    nextColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
  }
  player.matrix = nextPiece;
  player.color = nextColor;
  player.pos.y = 0;
  player.pos.x = (COLS / 2 | 0) - (player.matrix[0].length / 2 | 0);

  // Generate next preview
  const pieces = "TJLOSZI";
  const type = pieces[Math.floor(Math.random() * pieces.length)];
  nextPiece = createPiece(type);
  nextColor = `hsl(${Math.random() * 360}, 100%, 50%)`;

  if (collide(arena, player)) {
    arena.forEach(row => row.fill(null));
    score = 0;
    linesCleared = 0;
    level = 1;
    dropInterval = 1000;
    updateScore();
  }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

const arena = createMatrix(COLS, ROWS);

const player = {
  pos: {x:0, y:0},
  matrix: null,
  color: "black"
};

document.addEventListener("keydown", event => {
  if (event.keyCode === 37) playerMove(-1); // left
  else if (event.keyCode === 39) playerMove(1); // right
  else if (event.keyCode === 40) playerDrop(); // down
  else if (event.keyCode === 38) playerRotate(1); // up = rotate clockwise
  else if (event.keyCode === 90) playerRotate(-1); // Z = rotate counter-clockwise
  else if (event.keyCode === 32) hardDrop(); // Space = hard drop
});

playerReset();
update();
updateScore();