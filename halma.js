// ===== STATE =====
let gameMode = 'friend'; 
let playerCount = 2;
let piecesPerPlayer = 10;
let players = [];
let board = {}; 
let currentPlayer = 0;
let selectedCell = null;
let validMoves = [];
let moveHistory = [];
let gameActive = false;
let boardCells = []; 
let campCells = {}; 
let targetCells = {}; 
let finishedPlayers = [];

const PLAYER_COLORS = ['#e94560','#4ecdc4','#f9c846','#7b68ee','#ff8c42','#45e089'];
const PLAYER_EMOJIS = ['🔴','🟢','🟡','🟣','🟠','🔵'];
const EMOJI_OPTIONS = ['🔴','🟢','🟡','🟣','🟠','🔵','⭐','💎','🌙','🔥','🌸','💀','👑','🦊','🐉','🎯'];

// ===== BOARD GENERATION =====
function generateChineseCheckersBoard() {
  boardCells = [];
  const starRows = buildStarRows();
  for (let r = 0; r < starRows.length; r++) {
    for (const c of starRows[r]) {
      boardCells.push({r, c});
    }
  }

  campCells = {};
  targetCells = {};

  const camps = getStarCamps(starRows);
  for (let i = 0; i < 6; i++) {
    campCells[i] = camps[i];
    targetCells[i] = camps[(i + 3) % 6]; 
  }
}

function buildStarRows() {
  return [
    [12],                                          // row 0
    [11, 13],                                      // row 1
    [10, 12, 14],                                  // row 2
    [9, 11, 13, 15],                               // row 3
    [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24], // row 4
    [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23],      // row 5
    [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],          // row 6
    [3, 5, 7, 9, 11, 13, 15, 17, 19, 21],              // row 7
    [4, 6, 8, 10, 12, 14, 16, 18, 20],                 // row 8
    [3, 5, 7, 9, 11, 13, 15, 17, 19, 21],              // row 9
    [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],          // row 10
    [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23],      // row 11
    [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],  // row 12
    [9, 11, 13, 15],                               // row 13
    [10, 12, 14],                                   // row 14
    [11, 13],                                       // row 15
    [12]                                           // row 16
  ];
}

function getStarCamps(rows) {
  const camp0 = [];
  for (let r = 0; r <= 3; r++) for (const c of rows[r]) camp0.push({r, c});

  const camp3 = [];
  for (let r = 13; r <= 16; r++) for (const c of rows[r]) camp3.push({r, c});

  const camp1 = [
    {r:4, c:24}, {r:4, c:22}, {r:4, c:20}, {r:4, c:18},
    {r:5, c:23}, {r:5, c:21}, {r:5, c:19},
    {r:6, c:22}, {r:6, c:20},
    {r:7, c:21}
  ];

  const camp2 = [
    {r:9, c:21},
    {r:10, c:22}, {r:10, c:20},
    {r:11, c:23}, {r:11, c:21}, {r:11, c:19},
    {r:12, c:24}, {r:12, c:22}, {r:12, c:20}, {r:12, c:18}
  ];

  const camp4 = [
    {r:9, c:3},
    {r:10, c:2}, {r:10, c:4},
    {r:11, c:1}, {r:11, c:3}, {r:11, c:5},
    {r:12, c:0}, {r:12, c:2}, {r:12, c:4}, {r:12, c:6}
  ];

  const camp5 = [
    {r:4, c:0}, {r:4, c:2}, {r:4, c:4}, {r:4, c:6},
    {r:5, c:1}, {r:5, c:3}, {r:5, c:5},
    {r:6, c:2}, {r:6, c:4},
    {r:7, c:3}
  ];

  return [camp0, camp1, camp2, camp3, camp4, camp5];
}

// ===== ADJACENCY & LOGIC =====
function cellKey(r, c) { return r + ',' + c; }
function parseCellKey(k) { const p = k.split(','); return {r: parseInt(p[0]), c: parseInt(p[1])}; }

function getNeighbors(r, c) {
  return [
    {r: r, c: c - 2},
    {r: r, c: c + 2},
    {r: r - 1, c: c - 1},
    {r: r - 1, c: c + 1},
    {r: r + 1, c: c - 1},
    {r: r + 1, c: c + 1},
  ];
}

function isValidCell(r, c) {
  return boardCellSet.has(cellKey(r, c));
}

let boardCellSet = new Set();

function getValidMoves(r, c, playerIdx) {
  const moves = [];
  const piece = board[cellKey(r, c)];
  if (!piece || piece.player !== playerIdx) return moves;

  const neighbors = getNeighbors(r, c);
  for (const n of neighbors) {
    if (isValidCell(n.r, n.c) && !board[cellKey(n.r, n.c)]) {
      if (isMoveAllowed(r, c, n.r, n.c, playerIdx)) {
        moves.push({r: n.r, c: n.c, type: 'step'});
      }
    }
  }

  const jumpTargets = new Set();
  findJumps(r, c, new Set(), jumpTargets, playerIdx, r, c);
  for (const key of jumpTargets) {
    const pos = parseCellKey(key);
    if (isMoveAllowed(r, c, pos.r, pos.c, playerIdx)) {
      moves.push({r: pos.r, c: pos.c, type: 'jump'});
    }
  }

  return moves;
}

function findJumps(r, c, visited, targets, playerIdx, origR, origC) {
  const neighbors = getNeighbors(r, c);
  for (const n of neighbors) {
    const nk = cellKey(n.r, n.c);
    if (isValidCell(n.r, n.c) && board[nk]) {
      const dr = n.r - r;
      const dc = n.c - c;
      const landR = n.r + dr;
      const landC = n.c + dc;
      const landKey = cellKey(landR, landC);

      if (isValidCell(landR, landC) && !board[landKey] && !visited.has(landKey)) {
        visited.add(landKey);
        targets.add(landKey);
        findJumps(landR, landC, visited, targets, playerIdx, origR, origC);
      }
    }
  }
}

function isMoveAllowed(fromR, fromC, toR, toC, playerIdx) {
  const target = targetCells[playerIdx];
  const isInTarget = target.some(t => t.r === fromR && t.c === fromC);
  if (isInTarget) {
    const destInTarget = target.some(t => t.r === toR && t.c === toC);
    if (!destInTarget) return false;
  }
  return true;
}

// ===== BOT AI =====
function botMakeMove() {
  if (!gameActive) return;

  const playerIdx = currentPlayer;
  const target = targetCells[playerIdx];
  const targetCenter = getCenter(target);

  let bestMove = null;
  let bestScore = -Infinity;

  const myPieces = [];
  for (const cell of boardCells) {
    const k = cellKey(cell.r, cell.c);
    if (board[k] && board[k].player === playerIdx) {
      myPieces.push(cell);
    }
  }

  for (const piece of myPieces) {
    const moves = getValidMoves(piece.r, piece.c, playerIdx);
    for (const move of moves) {
      const currentDist = hexDist(piece.r, piece.c, targetCenter.r, targetCenter.c);
      const newDist = hexDist(move.r, move.c, targetCenter.r, targetCenter.c);
      let score = currentDist - newDist;

      if (target.some(t => t.r === move.r && t.c === move.c)) score += 3;
      if (move.type === 'jump') score += 0.5;
      score += Math.random() * 0.3;

      if (score > bestScore) {
        bestScore = score;
        bestMove = {from: piece, to: move};
      }
    }
  }

  if (bestMove) {
    setTimeout(() => {
      selectedCell = bestMove.from;
      highlightCell(bestMove.from.r, bestMove.from.c);
      setTimeout(() => {
        executeMove(bestMove.from.r, bestMove.from.c, bestMove.to.r, bestMove.to.c);
        selectedCell = null;
        validMoves = [];
        renderBoard();
      }, 350);
    }, 400);
  } else {
    nextTurn();
  }
}

function getCenter(cells) {
  let sr = 0, sc = 0;
  for (const c of cells) { sr += c.r; sc += c.c; }
  return {r: sr / cells.length, c: sc / cells.length};
}

function hexDist(r1, c1, r2, c2) {
  return Math.sqrt((r1 - r2) ** 2 + ((c1 - c2) / 2) ** 2);
}

// ===== GAME FLOW =====
function executeMove(fromR, fromC, toR, toC) {
  const fk = cellKey(fromR, fromC);
  const tk = cellKey(toR, toC);

  moveHistory.push({
    from: {r: fromR, c: fromC},
    to: {r: toR, c: toC},
    player: currentPlayer
  });

  board[tk] = board[fk];
  board[fk] = null;

  if (checkWin(currentPlayer)) {
    finishedPlayers.push(currentPlayer);
    gameActive = false;
    renderBoard();
    setTimeout(() => showWinner(currentPlayer), 300);
    return;
  }

  nextTurn();
}

function checkWin(playerIdx) {
  const target = targetCells[playerIdx];
  let count = 0;
  for (const t of target) {
    const k = cellKey(t.r, t.c);
    if (board[k] && board[k].player === playerIdx) count++;
  }
  return count >= piecesPerPlayer;
}

function nextTurn() {
  do {
    currentPlayer = (currentPlayer + 1) % players.length;
  } while (finishedPlayers.includes(currentPlayer) && finishedPlayers.length < players.length);

  renderTurnIndicator();
  renderScoreBar();

  if (players[currentPlayer] && players[currentPlayer].isBot && gameActive) {
    setTimeout(botMakeMove, 300);
  }
}

function undoMove() {
  if (moveHistory.length === 0 || !gameActive) return;
  const last = moveHistory.pop();
  const fk = cellKey(last.from.r, last.from.c);
  const tk = cellKey(last.to.r, last.to.c);
  board[fk] = board[tk];
  board[tk] = null;
  currentPlayer = last.player;
  selectedCell = null;
  validMoves = [];
  renderBoard();
  renderTurnIndicator();
  renderScoreBar();
}

// ===== UI SCREENS =====
function showMenu() {
  gameActive = false;
  document.getElementById('menuScreen').classList.remove('hidden');
  document.getElementById('setupScreen').classList.add('hidden');
  document.getElementById('rulesScreen').classList.add('hidden');
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('flex');
  document.getElementById('winnerOverlay').classList.add('hidden');
}

function showRules() {
  document.getElementById('menuScreen').classList.add('hidden');
  document.getElementById('rulesScreen').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function showSetup(mode) {
  gameMode = mode;
  document.getElementById('menuScreen').classList.add('hidden');
  document.getElementById('setupScreen').classList.remove('hidden');
  renderSetup();
  if (window.lucide) lucide.createIcons();
}

function renderSetup() {
  const validCounts = [2, 3, 4, 6];
  const container = document.getElementById('playerCountBtns');
  container.innerHTML = '';
  for (const n of validCounts) {
    const btn = document.createElement('button');
    btn.className = `py-1.5 px-4 text-xs font-bold rounded-lg transition-all ${n === playerCount ? 'btn-primary' : 'btn-secondary'}`;
    btn.textContent = n + ' Pemain';
    btn.onclick = () => { playerCount = n; renderSetup(); };
    container.appendChild(btn);
  }

  const notes = {
    2: '2 Pemain berhadapan secara langsung',
    3: '3 Pemain di sudut berselang-seling',
    4: '4 Pemain menempati 4 sudut',
    6: 'Semua 6 sudut terisi'
  };
  document.getElementById('playerCountNote').textContent = notes[playerCount];

  const cfgContainer = document.getElementById('playerConfigs');
  cfgContainer.innerHTML = '';

  const campMap = {
    2: [0, 3],
    3: [0, 2, 4],
    4: [0, 1, 3, 4],
    6: [0, 1, 2, 3, 4, 5]
  };

  const usedCamps = campMap[playerCount];

  for (let i = 0; i < playerCount; i++) {
    if (!players[i]) {
      players[i] = {
        name: gameMode === 'bot' && i > 0 ? `Bot ${i}` : `Pemain ${i + 1}`,
        color: PLAYER_COLORS[i],
        emoji: PLAYER_EMOJIS[i],
        imageUrl: null,
        isBot: gameMode === 'bot' && i > 0,
        campIndex: usedCamps[i]
      };
    }
    players[i].campIndex = usedCamps[i];
    players[i].isBot = gameMode === 'bot' && i > 0;

    const p = players[i];
    const div = document.createElement('div');
    div.className = 'player-cfg active-cfg';

    div.innerHTML = `
      <div class="flex items-center gap-2 mb-2">
        <span class="w-3.5 h-3.5 rounded-full inline-block" style="background:${p.color}"></span>
        <input type="text" value="${p.name}" class="bg-transparent border-b border-white/20 text-xs font-bold focus:outline-none focus:border-red-400 flex-1" style="color:${p.color}" onchange="updatePlayerName(${i}, this.value)">
        ${p.isBot ? '<span class="text-[10px] opacity-50">(Bot)</span>' : ''}
      </div>
      <div class="mb-2">
        <label class="text-[10px] opacity-60 block mb-1">Warna Pion</label>
        <div class="flex gap-1.5 flex-wrap" id="colorPicker${i}"></div>
      </div>
      <div>
        <label class="text-[10px] opacity-60 block mb-1">Simbol / Emoji</label>
        <div class="flex gap-1 flex-wrap" id="emojiPicker${i}"></div>
      </div>
    `;
    cfgContainer.appendChild(div);

    const cp = div.querySelector(`#colorPicker${i}`);
    for (const color of PLAYER_COLORS) {
      const swatch = document.createElement('div');
      swatch.className = `color-option ${p.color === color ? 'active' : ''}`;
      swatch.style.background = color;
      swatch.onclick = () => { players[i].color = color; renderSetup(); };
      cp.appendChild(swatch);
    }

    const ep = div.querySelector(`#emojiPicker${i}`);
    for (const em of EMOJI_OPTIONS) {
      const btn = document.createElement('button');
      btn.className = `emoji-select ${p.emoji === em ? 'active' : ''}`;
      btn.textContent = em;
      btn.onclick = () => { players[i].emoji = em; renderSetup(); };
      ep.appendChild(btn);
    }
  }

  players.length = playerCount;
  if (window.lucide) lucide.createIcons();
}

function updatePlayerName(i, name) {
  players[i].name = name || `Pemain ${i + 1}`;
}

function setPieceCount(n) {
  piecesPerPlayer = n;
  renderSetup();
}

// ===== GAME START =====
function startGame() {
  generateChineseCheckersBoard();
  boardCellSet = new Set(boardCells.map(c => cellKey(c.r, c.c)));

  board = {};
  for (const cell of boardCells) {
    board[cellKey(cell.r, cell.c)] = null;
  }

  for (let i = 0; i < players.length; i++) {
    const camp = campCells[players[i].campIndex];
    const piecesToPlace = camp.slice(0, piecesPerPlayer);
    for (const pos of piecesToPlace) {
      board[cellKey(pos.r, pos.c)] = {player: i};
    }
  }

  const remappedCamp = {};
  const remappedTarget = {};
  for (let i = 0; i < players.length; i++) {
    remappedCamp[i] = campCells[players[i].campIndex];
    remappedTarget[i] = targetCells[players[i].campIndex];
  }
  campCells = remappedCamp;
  targetCells = remappedTarget;

  currentPlayer = 0;
  selectedCell = null;
  validMoves = [];
  moveHistory = [];
  finishedPlayers = [];
  gameActive = true;

  document.getElementById('setupScreen').classList.add('hidden');
  const gameScreen = document.getElementById('gameScreen');
  gameScreen.classList.remove('hidden');
  gameScreen.classList.add('flex');

  renderBoard();
  renderTurnIndicator();
  renderScoreBar();
  if (window.lucide) lucide.createIcons();

  if (players[0].isBot) {
    setTimeout(botMakeMove, 500);
  }
}

// ===== BOARD RENDERING (RESPONSIVE) =====
function renderBoard() {
  const container = document.getElementById('boardContainer');
  const area = document.getElementById('boardArea');

  if (!area || !container) return;

  const areaW = area.clientWidth - 12;
  const areaH = area.clientHeight - 12;

  const maxCol = 24;
  const maxRow = 16;

  // Calculate dynamic cell size to fit screen 100% perfectly without scrolling
  const cellSizeByW = areaW / (maxCol / 2 + 1.5);
  const cellSizeByH = areaH / (maxRow + 1.5);
  const cs = Math.max(Math.floor(Math.min(cellSizeByW, cellSizeByH)), 12);
  
  const gap = cs * 0.12;
  const totalCs = cs + gap;

  const boardW = (maxCol / 2) * totalCs + cs;
  const boardH = maxRow * totalCs + cs;

  container.style.width = boardW + 'px';
  container.style.height = boardH + 'px';
  container.innerHTML = '';

  const fontSize = Math.max(cs * 0.55, 9);

  for (const cell of boardCells) {
    const x = (cell.c / 2) * totalCs;
    const y = cell.r * totalCs;

    const div = document.createElement('div');
    div.className = 'board-cell';
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.style.width = cs + 'px';
    div.style.height = cs + 'px';
    div.style.fontSize = fontSize + 'px';

    const k = cellKey(cell.r, cell.c);
    const piece = board[k];

    if (piece) {
      const p = players[piece.player];
      div.classList.add('has-piece');
      div.style.background = p.color;

      const span = document.createElement('span');
      span.className = 'piece-emoji';
      span.textContent = p.emoji;
      div.appendChild(span);
    } else {
      div.classList.add('empty-cell');

      for (let pi = 0; pi < players.length; pi++) {
        const camp = campCells[pi];
        const tgt = targetCells[pi];
        if (camp && camp.some(t => t.r === cell.r && t.c === cell.c)) {
          div.style.background = players[pi].color + '22';
          div.style.borderColor = players[pi].color + '55';
        }
        if (tgt && tgt.some(t => t.r === cell.r && t.c === cell.c)) {
          div.style.background = players[pi].color + '15';
          div.style.borderColor = players[pi].color + '44';
        }
      }
    }

    if (selectedCell && selectedCell.r === cell.r && selectedCell.c === cell.c) {
      div.classList.add('selected');
    }

    if (validMoves.some(m => m.r === cell.r && m.c === cell.c)) {
      div.classList.add('valid-move');
    }

    div.onclick = () => handleCellClick(cell.r, cell.c);
    container.appendChild(div);
  }
}

function highlightCell(r, c) {
  selectedCell = {r, c};
  validMoves = getValidMoves(r, c, currentPlayer);
  renderBoard();
}

function handleCellClick(r, c) {
  if (!gameActive) return;
  if (players[currentPlayer].isBot) return;

  const k = cellKey(r, c);
  const piece = board[k];

  if (selectedCell && validMoves.some(m => m.r === r && m.c === c)) {
    executeMove(selectedCell.r, selectedCell.c, r, c);
    selectedCell = null;
    validMoves = [];
    renderBoard();
    return;
  }

  if (piece && piece.player === currentPlayer) {
    selectedCell = {r, c};
    validMoves = getValidMoves(r, c, currentPlayer);
    renderBoard();
    return;
  }

  selectedCell = null;
  validMoves = [];
  renderBoard();
}

function renderTurnIndicator() {
  const ti = document.getElementById('turnIndicator');
  const p = players[currentPlayer];
  ti.innerHTML = `<div class="turn-badge" style="background:${p.color}22; border:1px solid ${p.color}">
    <span class="w-2.5 h-2.5 rounded-full inline-block" style="background:${p.color}"></span>
    <span style="color:${p.color}">${p.name}</span>
    ${p.isBot ? '<span class="text-[10px] opacity-50">(berpikir...)</span>' : ''}
  </div>`;
}

function renderScoreBar() {
  const bar = document.getElementById('scoreBar');
  bar.innerHTML = '';
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    const target = targetCells[i];
    let filled = 0;
    if (target) {
      for (const t of target) {
        const k = cellKey(t.r, t.c);
        if (board[k] && board[k].player === i) filled++;
      }
    }
    const total = piecesPerPlayer;
    const pct = Math.round((filled / total) * 100);

    const div = document.createElement('div');
    div.className = `flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${i === currentPlayer ? 'ring-1' : ''}`;
    div.style.background = p.color + '20';
    div.style.borderColor = p.color;

    div.innerHTML = `
      <span class="w-2 h-2 rounded-full" style="background:${p.color}"></span>
      <span style="color:${p.color}">${p.name}</span>
      <span class="opacity-60 text-[10px]">${filled}/${total}</span>
      <div class="w-8 h-1 rounded-full overflow-hidden" style="background:${p.color}33">
        <div class="h-full rounded-full" style="background:${p.color};width:${pct}%"></div>
      </div>
    `;
    bar.appendChild(div);
  }
}

// ===== WINNER / QUIT =====
function showWinner(playerIdx) {
  const p = players[playerIdx];
  document.getElementById('winnerName').textContent = p.name;
  document.getElementById('winnerName').style.color = p.color;
  document.getElementById('winnerOverlay').classList.remove('hidden');
}

function confirmQuit() {
  document.getElementById('quitConfirm').classList.remove('hidden');
}
function hideQuitConfirm() {
  document.getElementById('quitConfirm').classList.add('hidden');
}
function quitGame() {
  hideQuitConfirm();
  gameActive = false;
  showMenu();
}

function restartGame() {
  document.getElementById('winnerOverlay').classList.add('hidden');
  startGame();
}

// ===== RESIZE HANDLER =====
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (gameActive) renderBoard();
  }, 100);
});

// Init Lucide Icons
if (window.lucide) lucide.createIcons();
