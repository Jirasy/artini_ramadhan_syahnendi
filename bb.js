// ===== GAME STATE =====
const GRID_SIZE = 8;
const BLOCK_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#f43f5e','#14b8a6'];

let grid = [];
let score = 0;
let linesCleared = 0;
let currentPieces = [];
let currentMode = 'endless';
let gameActive = false;
let gameStartTime = null;
let bestScore = 0;
let undoStack = [];
let redoStack = [];
let leaderboardData = [];
let currentFilter = 'all';
let savedGame = null;
let dragState = null;

// ===== PIECE SHAPES =====
const SHAPES = [
  [[1]],
  [[1,1]],
  [[1],[1]],
  [[1,1,1]],
  [[1],[1],[1]],
  [[1,1],[1,1]],
  [[1,1,1],[1,0,0]],
  [[1,1,1],[0,0,1]],
  [[1,0],[1,1]],
  [[0,1],[1,1]],
  [[1,1,1,1]],
  [[1],[1],[1],[1]],
  [[1,1],[1,0]],
  [[1,1],[0,1]],
  [[1,1,1],[0,1,0]],
  [[1,0,0],[1,1,1]],
  [[0,0,1],[1,1,1]],
  [[1,1,1,1,1]],
  [[1],[1],[1],[1],[1]],
  [[1,1,1],[1,1,1],[1,1,1]],
];

function randomColor() { return BLOCK_COLORS[Math.floor(Math.random()*BLOCK_COLORS.length)]; }
function randomShape() { return SHAPES[Math.floor(Math.random()*SHAPES.length)]; }

function generatePiece() {
  const shape = randomShape();
  const color = randomColor();
  return { shape, color, placed: false };
}

// ===== GRID =====
function initGrid() {
  grid = Array.from({length:GRID_SIZE}, ()=>Array(GRID_SIZE).fill(null));
}

function renderGrid() {
  const container = document.getElementById('grid-container');
  if (!container.children.length) {
    container.innerHTML = '';
    for (let r=0;r<GRID_SIZE;r++) {
      for (let c=0;c<GRID_SIZE;c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell w-full aspect-square';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.style.background = '#1e293b';
        container.appendChild(cell);
      }
    }
  }
  for (let r=0;r<GRID_SIZE;r++) {
    for (let c=0;c<GRID_SIZE;c++) {
      const cell = container.children[r*GRID_SIZE+c];
      cell.className = 'grid-cell w-full aspect-square';
      if (grid[r][c]) {
        cell.classList.add('filled');
        cell.style.background = grid[r][c];
      } else {
        cell.style.background = '#1e293b';
      }
    }
  }
}

function clearPreview() {
  const container = document.getElementById('grid-container');
  for (let i=0;i<container.children.length;i++) {
    const cell = container.children[i];
    cell.classList.remove('preview','invalid-preview');
    const r = +cell.dataset.row, c = +cell.dataset.col;
    cell.style.background = grid[r][c] || '#1e293b';
    if (grid[r][c]) cell.classList.add('filled');
  }
}

function showPreview(piece, startRow, startCol) {
  clearPreview();
  const container = document.getElementById('grid-container');
  const valid = canPlace(piece, startRow, startCol);
  for (let r=0;r<piece.shape.length;r++) {
    for (let c=0;c<piece.shape[r].length;c++) {
      if (!piece.shape[r][c]) continue;
      const gr = startRow+r, gc = startCol+c;
      if (gr<0||gr>=GRID_SIZE||gc<0||gc>=GRID_SIZE) continue;
      const cell = container.children[gr*GRID_SIZE+gc];
      if (valid) {
        cell.classList.add('preview');
        cell.style.background = piece.color;
      } else {
        cell.classList.add('invalid-preview');
      }
    }
  }
}

function canPlace(piece, sr, sc) {
  for (let r=0;r<piece.shape.length;r++) {
    for (let c=0;c<piece.shape[r].length;c++) {
      if (!piece.shape[r][c]) continue;
      const gr=sr+r, gc=sc+c;
      if (gr<0||gr>=GRID_SIZE||gc<0||gc>=GRID_SIZE) return false;
      if (grid[gr][gc]) return false;
    }
  }
  return true;
}

function placePiece(piece, sr, sc) {
  // Save state for undo
  if (currentMode === 'challenge') {
    undoStack.push({
      grid: grid.map(r=>[...r]),
      score,
      linesCleared,
      pieces: currentPieces.map(p=>({...p, shape:p.shape.map(r=>[...r])}))
    });
    redoStack = [];
    updateUndoRedoBtns();
  }

  for (let r=0;r<piece.shape.length;r++) {
    for (let c=0;c<piece.shape[r].length;c++) {
      if (!piece.shape[r][c]) continue;
      grid[sr+r][sc+c] = piece.color;
    }
  }
  piece.placed = true;

  // Count cells placed
  let cellsPlaced = 0;
  piece.shape.forEach(r=>r.forEach(v=>{if(v)cellsPlaced++;}));
  score += cellsPlaced;

  clearLines();
  renderGrid();
  renderPieces();
  updateScore();

  // Check if all pieces placed -> generate new set
  if (currentPieces.every(p=>p.placed)) {
    currentPieces = [generatePiece(), generatePiece(), generatePiece()];
    renderPieces();
  }

  // Check game over
  if (isGameOver()) {
    endGame();
  } else {
    saveCurrentGame();
  }
}

function clearLines() {
  let cleared = [];
  // Check rows
  for (let r=0;r<GRID_SIZE;r++) {
    if (grid[r].every(c=>c!==null)) cleared.push({type:'row',idx:r});
  }
  // Check cols
  for (let c=0;c<GRID_SIZE;c++) {
    let full = true;
    for (let r=0;r<GRID_SIZE;r++) { if(!grid[r][c]){full=false;break;} }
    if (full) cleared.push({type:'col',idx:c});
  }

  if (cleared.length === 0) return;

  // Bonus for multiple clears
  const lineCount = cleared.length;
  linesCleared += lineCount;
  score += lineCount * GRID_SIZE + (lineCount > 1 ? lineCount * 10 : 0);

  // Clear cells
  const toClear = new Set();
  cleared.forEach(l => {
    for (let i=0;i<GRID_SIZE;i++) {
      if (l.type==='row') toClear.add(`${l.idx},${i}`);
      else toClear.add(`${i},${l.idx}`);
    }
  });
  toClear.forEach(key => {
    const [r,c] = key.split(',').map(Number);
    grid[r][c] = null;
  });

  // Flash animation
  const container = document.getElementById('grid-container');
  toClear.forEach(key => {
    const [r,c] = key.split(',').map(Number);
    container.children[r*GRID_SIZE+c].classList.add('row-clear');
    setTimeout(()=>container.children[r*GRID_SIZE+c].classList.remove('row-clear'), 400);
  });
}

function isGameOver() {
  const remaining = currentPieces.filter(p=>!p.placed);
  for (const piece of remaining) {
    for (let r=0;r<=GRID_SIZE-piece.shape.length;r++) {
      for (let c=0;c<=GRID_SIZE-(piece.shape[0]?.length||0);c++) {
        if (canPlace(piece,r,c)) return false;
      }
    }
  }
  return remaining.length > 0;
}

// ===== PIECES RENDERING =====
function renderPieces() {
  const tray = document.getElementById('pieces-tray');
  tray.innerHTML = '';
  currentPieces.forEach((piece, idx) => {
    if (piece.placed) {
      const empty = document.createElement('div');
      empty.className = 'w-12 md:w-16';
      tray.appendChild(empty);
      return;
    }
    const wrapper = document.createElement('div');
    wrapper.className = 'piece-container flex flex-col items-center gap-0';
    wrapper.dataset.pieceIdx = idx;

    const rows = piece.shape.length;
    const cols = Math.max(...piece.shape.map(r=>r.length));
    const cellSize = Math.min(Math.floor((window.innerWidth < 500 ? 28 : 34) * (3/Math.max(rows,cols))), window.innerWidth < 500 ? 20 : 26);

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    grid.style.gap = '2px';

    piece.shape.forEach(row => {
      row.forEach(val => {
        const cell = document.createElement('div');
        cell.style.width = cellSize+'px';
        cell.style.height = cellSize+'px';
        if (val) {
          cell.className = 'piece-cell';
          cell.style.background = piece.color;
        }
        grid.appendChild(cell);
      });
    });

    wrapper.appendChild(grid);
    tray.appendChild(wrapper);

    // Drag events
    wrapper.addEventListener('pointerdown', e => startDrag(e, idx));
  });
}

// ===== DRAG & DROP =====
function startDrag(e, pieceIdx) {
  e.preventDefault();
  const piece = currentPieces[pieceIdx];
  if (piece.placed) return;

  const wrapper = e.currentTarget;
  wrapper.classList.add('dragging');

  const floating = document.getElementById('floating-piece');
  const rows = piece.shape.length;
  const cols = Math.max(...piece.shape.map(r=>r.length));
  const cellSize = getCellSize();

  let fhtml = `<div style="display:grid;grid-template-columns:repeat(${cols},${cellSize}px);gap:2px;opacity:0.85;">`;
  piece.shape.forEach(row => {
    row.forEach(val => {
      fhtml += `<div style="width:${cellSize}px;height:${cellSize}px;${val?`background:${piece.color};border-radius:3px;box-shadow:inset 0 -2px 0 rgba(0,0,0,0.25);`:''}"></div>`;
    });
  });
  fhtml += '</div>';
  floating.innerHTML = fhtml;
  floating.style.display = 'block';

  const offsetX = (cols * (cellSize+2)) / 2;
  const offsetY = (rows * (cellSize+2)) + 20;

  floating.style.left = (e.clientX - offsetX) + 'px';
  floating.style.top = (e.clientY - offsetY) + 'px';

  dragState = { pieceIdx, wrapper, offsetX, offsetY };

  // Calc grid position
  updateDragPreview(e.clientX, e.clientY, piece);

  const onMove = ev => {
    ev.preventDefault();
    const cx = ev.clientX || (ev.touches&&ev.touches[0].clientX);
    const cy = ev.clientY || (ev.touches&&ev.touches[0].clientY);
    floating.style.left = (cx - offsetX) + 'px';
    floating.style.top = (cy - offsetY) + 'px';
    updateDragPreview(cx, cy, piece);
  };

  const onUp = ev => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    floating.style.display = 'none';
    wrapper.classList.remove('dragging');

    const cx = ev.clientX || (ev.changedTouches&&ev.changedTouches[0].clientX);
    const cy = ev.clientY || (ev.changedTouches&&ev.changedTouches[0].clientY);
    const pos = getGridPos(cx, cy, piece);
    clearPreview();
    if (pos && canPlace(piece, pos.row, pos.col)) {
      placePiece(piece, pos.row, pos.col);
    }
    dragState = null;
  };

  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUp);
}

function getCellSize() {
  const container = document.getElementById('grid-container');
  return (container.offsetWidth - 16 - (GRID_SIZE-1)*2) / GRID_SIZE;
}

function getGridPos(cx, cy, piece) {
  const container = document.getElementById('grid-container');
  const rect = container.getBoundingClientRect();
  const cellSize = getCellSize();
  const gap = 2;
  const pad = 8;

  const col = Math.round((cx - rect.left - pad) / (cellSize+gap) - (piece.shape[0]?.length||1)/2);
  const row = Math.round((cy - rect.top - pad) / (cellSize+gap) - piece.shape.length/2 - 2);

  return { row, col };
}

function updateDragPreview(cx, cy, piece) {
  const pos = getGridPos(cx, cy, piece);
  clearPreview();
  if (pos) showPreview(piece, pos.row, pos.col);
}

// ===== UNDO / REDO =====
function undoMove() {
  if (undoStack.length === 0 || currentMode !== 'challenge') return;
  redoStack.push({
    grid: grid.map(r=>[...r]),
    score,
    linesCleared,
    pieces: currentPieces.map(p=>({...p, shape:p.shape.map(r=>[...r])}))
  });
  const state = undoStack.pop();
  grid = state.grid;
  score = state.score;
  linesCleared = state.linesCleared;
  currentPieces = state.pieces;
  renderGrid();
  renderPieces();
  updateScore();
  updateUndoRedoBtns();
}

function redoMove() {
  if (redoStack.length === 0 || currentMode !== 'challenge') return;
  undoStack.push({
    grid: grid.map(r=>[...r]),
    score,
    linesCleared,
    pieces: currentPieces.map(p=>({...p, shape:p.shape.map(r=>[...r])}))
  });
  const state = redoStack.pop();
  grid = state.grid;
  score = state.score;
  linesCleared = state.linesCleared;
  currentPieces = state.pieces;
  renderGrid();
  renderPieces();
  updateScore();
  updateUndoRedoBtns();
}

function updateUndoRedoBtns() {
  document.getElementById('undo-btn').disabled = undoStack.length === 0;
  document.getElementById('redo-btn').disabled = redoStack.length === 0;
  document.getElementById('undo-redo-btns').style.display = currentMode === 'challenge' ? 'flex' : 'none';
}

function updateScore() {
  document.getElementById('score-display').textContent = score;
  if (score > bestScore) {
    bestScore = score;
  }
  document.getElementById('best-display').textContent = bestScore;
}

// ===== GAME FLOW =====
function startGame(mode) {
  currentMode = mode;
  score = 0;
  linesCleared = 0;
  undoStack = [];
  redoStack = [];
  gameStartTime = Date.now();
  gameActive = true;
  initGrid();
  currentPieces = [generatePiece(), generatePiece(), generatePiece()];

  document.getElementById('mode-indicator').textContent = mode === 'endless' ? '♾️ Endless Mode' : '🎯 Challenge Mode';
  showScreen('game');
  renderGrid();
  renderPieces();
  updateScore();
  updateUndoRedoBtns();
}

function resumeGame() {
  if (!savedGame) return;
  grid = savedGame.grid;
  score = savedGame.score;
  linesCleared = savedGame.linesCleared;
  currentPieces = savedGame.pieces;
  currentMode = savedGame.mode;
  undoStack = savedGame.undoStack || [];
  redoStack = savedGame.redoStack || [];
  gameStartTime = Date.now() - (savedGame.elapsed || 0);
  gameActive = true;

  document.getElementById('mode-indicator').textContent = currentMode === 'endless' ? '♾️ Endless Mode' : '🎯 Challenge Mode';
  showScreen('game');
  renderGrid();
  renderPieces();
  updateScore();
  updateUndoRedoBtns();
}

function saveCurrentGame() {
  if (!gameActive) return;
  savedGame = {
    grid: grid.map(r=>[...r]),
    score,
    linesCleared,
    pieces: currentPieces.map(p=>({...p, shape:p.shape.map(r=>[...r])})),
    mode: currentMode,
    undoStack: undoStack.map(s=>({...s, grid:s.grid.map(r=>[...r]), pieces:s.pieces.map(p=>({...p, shape:p.shape.map(r=>[...r])}))})),
    redoStack: redoStack.map(s=>({...s, grid:s.grid.map(r=>[...r]), pieces:s.pieces.map(p=>({...p, shape:p.shape.map(r=>[...r])}))})),
    elapsed: Date.now() - gameStartTime
  };
  try { localStorage.setItem('bb_saved', JSON.stringify(savedGame)); } catch(e) {}
  document.getElementById('resume-btn').classList.remove('hidden');
}

function loadSavedGame() {
  try {
    const d = localStorage.getItem('bb_saved');
    if (d) {
      savedGame = JSON.parse(d);
      document.getElementById('resume-btn').classList.remove('hidden');
    }
  } catch(e) {}
}

function clearSavedGame() {
  savedGame = null;
  try { localStorage.removeItem('bb_saved'); } catch(e) {}
  document.getElementById('resume-btn').classList.add('hidden');
}

async function endGame() {
  gameActive = false;
  const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
  clearSavedGame();

  document.getElementById('final-score').textContent = score;
  document.getElementById('final-lines').textContent = `Lines cleared: ${linesCleared}`;
  const mins = Math.floor(elapsed/60), secs = elapsed%60;
  document.getElementById('final-time').textContent = `Time: ${mins}m ${secs}s`;
  document.getElementById('game-over').classList.remove('hidden');

  // Save to leaderboard
  if (leaderboardData.length >= 999) return;
  const result = await window.dataSdk.create({
    type: 'score',
    mode: currentMode,
    score: score,
    lines_cleared: linesCleared,
    date: new Date().toISOString(),
    duration_seconds: elapsed
  });
  if (!result.isOk) console.error('Failed to save score');
}

function restartGame() {
  document.getElementById('game-over').classList.add('hidden');
  startGame(currentMode);
}

function gameOverToMenu() {
  document.getElementById('game-over').classList.add('hidden');
  showMenu();
}

function backToMenu() {
  if (gameActive) saveCurrentGame();
  showMenu();
}

// ===== SCREENS =====
function showScreen(name) {
  ['menu-screen','game-screen','leaderboard-screen'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(name+'-screen').classList.remove('hidden');
  document.getElementById(name+'-screen').classList.add('screen-fade');
  lucide.createIcons();
}

function showMenu() {
  loadSavedGame();
  showScreen('menu');
}

function showLeaderboard() {
  showScreen('leaderboard');
  renderLeaderboard();
}

// ===== LEADERBOARD =====
function filterLeaderboard(f) {
  currentFilter = f;
  ['all','endless','challenge'].forEach(id => {
    const btn = document.getElementById('filter-'+id);
    if (id===f) { btn.className = 'btn-press px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white'; }
    else { btn.className = 'btn-press px-4 py-1.5 rounded-full text-xs font-bold bg-slate-700 text-slate-300'; }
  });
  renderLeaderboard();
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  let data = [...leaderboardData].filter(d => d.type === 'score');
  if (currentFilter !== 'all') data = data.filter(d => d.mode === currentFilter);
  data.sort((a,b) => b.score - a.score);

  if (data.length === 0) {
    list.innerHTML = '<div class="text-center text-slate-500 py-12"><div class="text-4xl mb-3">🏆</div><p>No scores yet. Play a game!</p></div>';
    return;
  }

  list.innerHTML = data.slice(0, 50).map((d, i) => {
    const date = new Date(d.date);
    const dateStr = date.toLocaleDateString(undefined, {month:'short',day:'numeric'});
    const mins = Math.floor((d.duration_seconds||0)/60);
    const secs = (d.duration_seconds||0)%60;
    const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉': `<span class="text-slate-500 text-sm font-bold">#${i+1}</span>`;
    const modeColor = d.mode==='endless'?'text-emerald-400':'text-violet-400';
    const modeName = d.mode==='endless'?'Endless':'Challenge';
    return `<div class="leaderboard-row flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700/30">
      <div class="w-8 text-center text-lg">${medal}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-baseline gap-2">
          <span class="text-xl font-black text-amber-400">${d.score}</span>
          <span class="${modeColor} text-xs font-semibold uppercase">${modeName}</span>
        </div>
        <div class="text-xs text-slate-500">${d.lines_cleared||0} lines · ${mins}m${secs}s · ${dateStr}</div>
      </div>
    </div>`;
  }).join('');
}

// ===== DATA SDK =====
const dataHandler = {
  onDataChanged(data) {
    leaderboardData = data;
    // Update best score
    const scores = data.filter(d=>d.type==='score').map(d=>d.score||0);
    bestScore = scores.length ? Math.max(...scores) : 0;
    if (document.getElementById('best-display')) {
      document.getElementById('best-display').textContent = bestScore;
    }
    // Re-render leaderboard if visible
    if (!document.getElementById('leaderboard-screen').classList.contains('hidden')) {
      renderLeaderboard();
    }
  }
};

// ===== ELEMENT SDK =====
const defaultConfig = {
  game_title: 'Block Blast',
  background_color: '#0f172a',
  surface_color: '#1e293b',
  text_color: '#f8fafc',
  primary_action_color: '#f59e0b',
  secondary_action_color: '#64748b',
  font_family: 'Outfit',
  font_size: 16
};

function applyConfig(config) {
  const bg = config.background_color || defaultConfig.background_color;
  const surface = config.surface_color || defaultConfig.surface_color;
  const text = config.text_color || defaultConfig.text_color;
  const primary = config.primary_action_color || defaultConfig.primary_action_color;
  const secondary = config.secondary_action_color || defaultConfig.secondary_action_color;
  const font = config.font_family || defaultConfig.font_family;
  const fontSize = config.font_size || defaultConfig.font_size;
  const title = config.game_title || defaultConfig.game_title;

  document.getElementById('app').style.background = bg;
  document.getElementById('app').style.color = text;
  document.getElementById('app').style.fontFamily = `${font}, Outfit, sans-serif`;
  document.getElementById('app').style.fontSize = fontSize + 'px';

  const menuTitle = document.getElementById('menu-title');
  if (menuTitle) {
    menuTitle.textContent = title;
    menuTitle.style.fontFamily = `${font}, Outfit, sans-serif`;
    menuTitle.style.fontSize = (fontSize * 3) + 'px';
  }

  // Update grid empty cells
  document.querySelectorAll('.grid-cell:not(.filled)').forEach(c => c.style.background = surface);
}

window.elementSdk.init({
  defaultConfig,
  onConfigChange: async (config) => applyConfig(config),
  mapToCapabilities: (config) => ({
    recolorables: [
      { get: ()=>config.background_color||defaultConfig.background_color, set: v=>{config.background_color=v;window.elementSdk.setConfig({background_color:v})} },
      { get: ()=>config.surface_color||defaultConfig.surface_color, set: v=>{config.surface_color=v;window.elementSdk.setConfig({surface_color:v})} },
      { get: ()=>config.text_color||defaultConfig.text_color, set: v=>{config.text_color=v;window.elementSdk.setConfig({text_color:v})} },
      { get: ()=>config.primary_action_color||defaultConfig.primary_action_color, set: v=>{config.primary_action_color=v;window.elementSdk.setConfig({primary_action_color:v})} },
      { get: ()=>config.secondary_action_color||defaultConfig.secondary_action_color, set: v=>{config.secondary_action_color=v;window.elementSdk.setConfig({secondary_action_color:v})} },
    ],
    borderables: [],
    fontEditable: { get: ()=>config.font_family||defaultConfig.font_family, set: v=>{config.font_family=v;window.elementSdk.setConfig({font_family:v})} },
    fontSizeable: { get: ()=>config.font_size||defaultConfig.font_size, set: v=>{config.font_size=v;window.elementSdk.setConfig({font_size:v})} },
  }),
  mapToEditPanelValues: (config) => new Map([
    ['game_title', config.game_title || defaultConfig.game_title]
  ])
});

// Init
(async () => {
  await window.dataSdk.init(dataHandler);
  loadSavedGame();
  lucide.createIcons();
})();