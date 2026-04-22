// ===== STATE =====
let gameMode = 'friend'; // 'friend' or 'bot'
let playerCount = 2;
let piecesPerPlayer = 10;
let players = [];
let board = {}; // key: "r,c" -> { player: index } or null
let currentPlayer = 0;
let selectedCell = null;
let validMoves = [];
let moveHistory = [];
let gameActive = false;
let boardCells = []; // all valid {r,c} positions
let campCells = {}; // player index -> [{r,c}] home camp
let targetCells = {}; // player index -> [{r,c}] target camp
let finishedPlayers = [];

const PLAYER_COLORS = ['#e94560','#4ecdc4','#f9c846','#7b68ee','#ff8c42','#45e089'];
const PLAYER_EMOJIS = ['🔴','🟢','🟡','🟣','🟠','🔵'];
const EMOJI_OPTIONS = ['🔴','🟢','🟡','🟣','🟠','🔵','⭐','💎','🌙','🔥','🌸','💀','👑','🦊','🐉','🎯'];

// ===== STAR BOARD GENERATION =====
// Chinese Checkers / Star Halma board: 6-pointed star, 121 cells
// Using axial coordinate system

function generateStarBoard() {
  const cells = [];
  // The star board has a hexagonal center + 6 triangular points
  // We define it row by row
  // Board layout: 17 rows
  const rowDefs = [
    // Top triangle (point 0 - top)
    {row:0, cols:[6], count:1},
    {row:1, cols:[5,6], count:2},
    {row:2, cols:[4,5,6], count:3},
    {row:3, cols:[3,4,5,6], count:4},
    // Upper middle
    {row:4, cols:[0,1,2,3,4,5,6,7,8,9,10,11,12], count:13},
    {row:5, cols:[0,1,2,3,4,5,6,7,8,9,10,11], count:12},
    {row:6, cols:[0,1,2,3,4,5,6,7,8,9,10,11,12], count:13, offset:-0},
    {row:7, cols:[0,1,2,3,4,5,6,7,8,9,10,11], count:12},
    {row:8, cols:[0,1,2,3,4,5,6,7,8,9,10,11,12], count:13},
    // Lower middle
    {row:9, cols:[0,1,2,3,4,5,6,7,8,9,10,11], count:12},
    {row:10, cols:[0,1,2,3,4,5,6,7,8,9,10,11,12], count:13},
    {row:11, cols:[0,1,2,3,4,5,6,7,8,9,10,11], count:12},
    {row:12, cols:[0,1,2,3,4,5,6,7,8,9,10,11,12], count:13},
    // Bottom triangle (point 3 - bottom)
    {row:13, cols:[3,4,5,6], count:4},
    {row:14, cols:[4,5,6], count:3},
    {row:15, cols:[5,6], count:2},
    {row:16, cols:[6], count:1},
  ];

  // Actually, let me use a proper hex-grid star layout
  // I'll use the well-known Chinese Checkers coordinate system
  boardCells = [];
  generateChineseCheckersBoard();
  return boardCells;
}

function generateChineseCheckersBoard() {
  // Star with 6 points. Let's define with row, col where
  // odd rows are offset by half a cell
  // Total 121 cells
  boardCells = [];

  // Define the board as an array of rows
  // Each row: [startCol, numCells]
  // Row 0 (top point): 1 cell
  const layout = [
    [6, 1],   // row 0
    [5, 2],   // row 1
    [5, 3],   // row 2
    [4, 4],   // row 3
    [0, 13],  // row 4
    [0, 12],  // row 5
    [0, 11],  // row 6
    [0, 10],  // row 7
    [0, 9],   // row 8
    [0, 10],  // row 9
    [0, 11],  // row 10
    [0, 12],  // row 11
    [0, 13],  // row 12
    [4, 4],   // row 13
    [5, 3],   // row 14
    [5, 2],   // row 15
    [6, 1],   // row 16
  ];

  // Hmm this doesn't produce 121 cells for a star. Let me use the actual
  // Chinese Checkers star pattern properly.

  // Standard Chinese Checkers: 6-pointed star with 121 positions
  // Let me define it more carefully with proper coordinates.

  // I'll use a simpler approach: define the board by specifying
  // for each row, which columns have cells.
  // The board has 17 rows.

  boardCells = [];

  const starRows = buildStarRows();
  for (let r = 0; r < starRows.length; r++) {
    for (const c of starRows[r]) {
      boardCells.push({r, c});
    }
  }

  // Define camps for 6 players
  // Player 0: top (rows 0-3), target: bottom (rows 13-16)
  // Player 1: top-right (rows 4-7, right side), target: bottom-left
  // Player 2: bottom-right (rows 9-12, right side), target: top-left
  // Player 3: bottom (rows 13-16), target: top (rows 0-3)
  // Player 4: bottom-left (rows 9-12, left side), target: top-right
  // Player 5: top-left (rows 4-7, left side), target: bottom-right

  campCells = {};
  targetCells = {};

  const camps = getStarCamps(starRows);
  for (let i = 0; i < 6; i++) {
    campCells[i] = camps[i];
    targetCells[i] = camps[(i + 3) % 6]; // opposite
  }
}

function buildStarRows() {
  // Chinese checkers star board - each row lists column indices
  // Using a coordinate system where each row can hold cells at specific positions
  // Odd rows are offset by 0.5 in rendering

  return [
    [12],                                          // row 0: top point
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
    [12],                                          // row 16
  ];
}

function getStarCamps(rows) {
  // 6 triangular camps, each with 10 or 15 cells
  // Camp 0: Top triangle (rows 0-3)
  const camp0 = [];
  for (let r = 0; r <= 3; r++) for (const c of rows[r]) camp0.push({r, c});

  // Camp 3: Bottom triangle (rows 13-16)
  const camp3 = [];
  for (let r = 13; r <= 16; r++) for (const c of rows[r]) camp3.push({r, c});

  // Camp 1: Top-right (rows 4-7, rightmost cells)
  // In the star, the top-right triangle extends from the right side
  const camp1 = [
    {r:4, c:24}, {r:4, c:22}, {r:4, c:20}, {r:4, c:18},
    {r:5, c:23}, {r:5, c:21}, {r:5, c:19},
    {r:6, c:22}, {r:6, c:20},
    {r:7, c:21}
  ];

  // Camp 2: Bottom-right (rows 9-12, rightmost cells)
  const camp2 = [
    {r:9, c:21},
    {r:10, c:22}, {r:10, c:20},
    {r:11, c:23}, {r:11, c:21}, {r:11, c:19},
    {r:12, c:24}, {r:12, c:22}, {r:12, c:20}, {r:12, c:18}
  ];

  // Camp 4: Bottom-left (rows 9-12, leftmost cells)
  const camp4 = [
    {r:9, c:3},
    {r:10, c:2}, {r:10, c:4},
    {r:11, c:1}, {r:11, c:3}, {r:11, c:5},
    {r:12, c:0}, {r:12, c:2}, {r:12, c:4}, {r:12, c:6}
  ];

  // Camp 5: Top-left (rows 4-7, leftmost cells)
  const camp5 = [
    {r:4, c:0}, {r:4, c:2}, {r:4, c:4}, {r:4, c:6},
    {r:5, c:1}, {r:5, c:3}, {r:5, c:5},
    {r:6, c:2}, {r:6, c:4},
    {r:7, c:3}
  ];

  return [camp0, camp1, camp2, camp3, camp4, camp5];
}

// ===== ADJACENCY / NEIGHBORS =====

function cellKey(r, c) { return r + ',' + c; }
function parseCellKey(k) { const p = k.split(','); return {r: parseInt(p[0]), c: parseInt(p[1])}; }

function getNeighbors(r, c) {
  // On this hex-star grid, neighbors are:
  // Same row: (r, c-2) and (r, c+2)
  // Adjacent rows: depends on row parity
  // row-1: (r-1, c-1), (r-1, c+1)
  // row+1: (r+1, c-1), (r+1, c+1)
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

// ===== MOVE LOGIC =====

function getValidMoves(r, c, playerIdx) {
  const moves = [];
  const piece = board[cellKey(r, c)];
  if (!piece || piece.player !== playerIdx) return moves;

  // Step moves: move to adjacent empty cell
  const neighbors = getNeighbors(r, c);
  for (const n of neighbors) {
    if (isValidCell(n.r, n.c) && !board[cellKey(n.r, n.c)]) {
      if (isMoveAllowed(r, c, n.r, n.c, playerIdx)) {
        moves.push({r: n.r, c: n.c, type: 'step'});
      }
    }
  }

  // Jump moves: hop over pieces, chain allowed
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
      // There's a piece to jump over
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
  // Rule: Once a piece enters target camp, it cannot leave
  const target = targetCells[playerIdx];
  const isInTarget = target.some(t => t.r === fromR && t.c === fromC);
  if (isInTarget) {
    const destInTarget = target.some(t => t.r === toR && t.c === toC);
    if (!destInTarget) return false;
  }

  // Rule: pieces should not stay in opponent's camp forever
  // (We allow movement through camps but enforce target camp lock)
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

  // Find all pieces of this player
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
      let score = currentDist - newDist; // positive = moving closer

      // Bonus for landing in target
      if (target.some(t => t.r === move.r && t.c === move.c)) score += 3;
      // Bonus for jumps
      if (move.type === 'jump') score += 0.5;
      // Slight randomness
      score += Math.random() * 0.3;

      if (score > bestScore) {
        bestScore = score;
        bestMove = {from: piece, to: move};
      }
    }
  }

  if (bestMove) {
    // Animate
    setTimeout(() => {
      selectedCell = bestMove.from;
      highlightCell(bestMove.from.r, bestMove.from.c);
      setTimeout(() => {
        executeMove(bestMove.from.r, bestMove.from.c, bestMove.to.r, bestMove.to.c);
        selectedCell = null;
        validMoves = [];
        renderBoard();
      }, 400);
    }, 500);
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

  // Check win
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
  const activePieces = piecesPerPlayer <= 10 ? target.slice(0, piecesPerPlayer) : target;
  // All target cells must be filled by this player's pieces
  // Use only as many target cells as pieces
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

  // If bot turn
  if (players[currentPlayer] && players[currentPlayer].isBot && gameActive) {
    setTimeout(botMakeMove, 300);
  }
}

function undoMove() {
  if (moveHistory.length === 0) return;
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
  document.getElementById('winnerOverlay').classList.add('hidden');
}

function showRules() {
  document.getElementById('menuScreen').classList.add('hidden');
  document.getElementById('rulesScreen').classList.remove('hidden');
  lucide.createIcons();
}

function showSetup(mode) {
  gameMode = mode;
  document.getElementById('menuScreen').classList.add('hidden');
  document.getElementById('setupScreen').classList.remove('hidden');
  renderSetup();
  lucide.createIcons();
}

function renderSetup() {
  // Player count buttons
  const validCounts = [2, 3, 4, 6];
  const container = document.getElementById('playerCountBtns');
  container.innerHTML = '';
  for (const n of validCounts) {
    const btn = document.createElement('button');
    btn.className = `py-2 px-5 text-sm font-bold rounded-lg transition-all ${n === playerCount ? 'btn-primary' : 'btn-secondary'}`;
    btn.textContent = n + ' Players';
    btn.onclick = () => { playerCount = n; renderSetup(); };
    container.appendChild(btn);
  }

  const notes = {
    2: 'Players occupy opposite corners',
    3: 'Players occupy alternating corners',
    4: 'Players occupy 4 corners (skipping 2)',
    6: 'All 6 corners occupied'
  };
  document.getElementById('playerCountNote').textContent = notes[playerCount];

  // Piece count buttons
  document.querySelectorAll('.piece-count-btn').forEach(btn => {
    const c = parseInt(btn.dataset.count);
    btn.className = `py-2 px-5 text-sm font-bold rounded-lg transition-all ${c === piecesPerPlayer ? 'btn-primary' : 'btn-secondary'}`;
  });

  // Player configs
  const cfgContainer = document.getElementById('playerConfigs');
  cfgContainer.innerHTML = '';

  // Map player count to which camp indices to use
  const campMap = {
    2: [0, 3],
    3: [0, 2, 4],
    4: [0, 1, 3, 4],
    6: [0, 1, 2, 3, 4, 5]
  };

  const usedCamps = campMap[playerCount];
  const usedColors = new Set();

  for (let i = 0; i < playerCount; i++) {
    if (!players[i]) {
      let color = PLAYER_COLORS[i];
      players[i] = {
        name: gameMode === 'bot' && i > 0 ? `Bot ${i}` : `Player ${i + 1}`,
        color: color,
        emoji: PLAYER_EMOJIS[i],
        imageUrl: null,
        isBot: gameMode === 'bot' && i > 0,
        campIndex: usedCamps[i]
      };
    }
    players[i].campIndex = usedCamps[i];
    if (gameMode === 'bot' && i > 0) players[i].isBot = true;
    else players[i].isBot = false;

    const p = players[i];
    const div = document.createElement('div');
    div.className = 'player-cfg active-cfg';

    const isBot = p.isBot;
    const botLabel = isBot ? ' <span class="text-xs opacity-50">(Bot)</span>' : '';

    div.innerHTML = `
      <div class="flex items-center gap-2 mb-2">
        <span class="w-4 h-4 rounded-full inline-block" style="background:${p.color}"></span>
        <input type="text" value="${p.name}" class="bg-transparent border-b border-white/20 text-sm font-bold focus:outline-none focus:border-red-400 flex-1" style="color:${p.color}" data-player="${i}" onchange="updatePlayerName(${i}, this.value)">
        ${botLabel}
      </div>
      <div class="mb-2">
        <label class="text-xs opacity-60 block mb-1">Color</label>
        <div class="flex gap-1 flex-wrap" id="colorPicker${i}"></div>
      </div>
      <div class="mb-2">
        <label class="text-xs opacity-60 block mb-1">Piece Style</label>
        <div class="flex gap-1 flex-wrap" id="emojiPicker${i}"></div>
      </div>
      <div>
        <label class="text-xs opacity-60 block mb-1">Custom Image (optional)</label>
        <div class="flex items-center gap-2">
          <input type="file" accept="image/*" class="text-xs" style="max-width:180px" onchange="handleImageUpload(${i}, event)">
          ${p.imageUrl ? '<button class="text-xs text-red-400 underline" onclick="clearImage(' + i + ')">Remove</button>' : ''}
        </div>
      </div>
    `;
    cfgContainer.appendChild(div);

    // Color picker
    const cp = div.querySelector(`#colorPicker${i}`);
    for (const color of PLAYER_COLORS) {
      const swatch = document.createElement('div');
      swatch.className = `color-option ${p.color === color ? 'active' : ''}`;
      swatch.style.background = color;
      swatch.onclick = () => { players[i].color = color; renderSetup(); };
      cp.appendChild(swatch);
    }

    // Emoji picker
    const ep = div.querySelector(`#emojiPicker${i}`);
    for (const em of EMOJI_OPTIONS) {
      const btn = document.createElement('button');
      btn.className = `emoji-select ${p.emoji === em ? 'active' : ''}`;
      btn.textContent = em;
      btn.onclick = () => { players[i].emoji = em; renderSetup(); };
      ep.appendChild(btn);
    }
  }

  // Trim excess players
  players.length = playerCount;

  lucide.createIcons();
}

function updatePlayerName(i, name) {
  players[i].name = name || `Player ${i + 1}`;
}

function handleImageUpload(i, e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    players[i].imageUrl = ev.target.result;
    renderSetup();
  };
  reader.readAsDataURL(file);
}

function clearImage(i) {
  players[i].imageUrl = null;
  renderSetup();
}

function setPieceCount(n) {
  piecesPerPlayer = n;
  renderSetup();
}

// ===== GAME START =====

function startGame() {
  generateStarBoard();
  boardCellSet = new Set(boardCells.map(c => cellKey(c.r, c.c)));

  // Init board
  board = {};
  for (const cell of boardCells) {
    board[cellKey(cell.r, cell.c)] = null;
  }

  // Place pieces
  for (let i = 0; i < players.length; i++) {
    const camp = campCells[players[i].campIndex];
    const piecesToPlace = camp.slice(0, piecesPerPlayer);
    for (const pos of piecesToPlace) {
      board[cellKey(pos.r, pos.c)] = {player: i};
    }
  }

  // Remap camp/target based on actual player indices
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
  document.getElementById('gameScreen').classList.remove('hidden');

  renderBoard();
  renderTurnIndicator();
  renderScoreBar();
  lucide.createIcons();

  if (players[0].isBot) {
    setTimeout(botMakeMove, 500);
  }
}

// ===== BOARD RENDERING =====

function renderBoard() {
  const container = document.getElementById('boardContainer');
  const area = document.getElementById('boardArea');

  // Calculate cell size based on available space
  const areaW = area.clientWidth - 16;
  const areaH = area.clientHeight - 16;

  // Board spans 17 rows, max col 24
  const maxCol = 24;
  const maxRow = 16;

  // Cell spacing
  const cellSizeByW = Math.floor(areaW / (maxCol / 2 + 2));
  const cellSizeByH = Math.floor(areaH / (maxRow + 2));
  const cellSize = Math.min(cellSizeByW, cellSizeByH, 36);
  const cs = Math.max(cellSize, 16);
  const gap = cs * 0.15;
  const totalCs = cs + gap;

  const boardW = (maxCol / 2 + 1) * totalCs + cs;
  const boardH = (maxRow + 1) * totalCs + cs;

  container.style.width = boardW + 'px';
  container.style.height = boardH + 'px';
  container.innerHTML = '';

  const fontSize = Math.max(cs * 0.5, 10);

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

      if (p.imageUrl) {
        const img = document.createElement('img');
        img.src = p.imageUrl;
        img.className = 'piece-img';
        img.draggable = false;
        div.appendChild(img);
      } else {
        const span = document.createElement('span');
        span.className = 'piece-emoji';
        span.textContent = p.emoji;
        div.appendChild(span);
      }
    } else {
      div.classList.add('empty-cell');

      // Tint camp cells
      for (let pi = 0; pi < players.length; pi++) {
        const camp = campCells[pi];
        const tgt = targetCells[pi];
        if (camp && camp.some(t => t.r === cell.r && t.c === cell.c)) {
          div.style.background = players[pi].color + '15';
          div.style.borderColor = players[pi].color + '30';
        }
        if (tgt && tgt.some(t => t.r === cell.r && t.c === cell.c)) {
          div.style.background = players[pi].color + '10';
          div.style.borderColor = players[pi].color + '25';
        }
      }
    }

    // Selected
    if (selectedCell && selectedCell.r === cell.r && selectedCell.c === cell.c) {
      div.classList.add('selected');
    }

    // Valid move
    if (validMoves.some(m => m.r === cell.r && m.c === cell.c)) {
      div.classList.add('valid-move');
      if (piece) {
        // Can't be valid and occupied
      } else {
        div.classList.add('valid-move');
      }
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

  // If clicking a valid move target
  if (selectedCell && validMoves.some(m => m.r === r && m.c === c)) {
    executeMove(selectedCell.r, selectedCell.c, r, c);
    selectedCell = null;
    validMoves = [];
    renderBoard();
    return;
  }

  // If clicking own piece
  if (piece && piece.player === currentPlayer) {
    selectedCell = {r, c};
    validMoves = getValidMoves(r, c, currentPlayer);
    renderBoard();
    return;
  }

  // Deselect
  selectedCell = null;
  validMoves = [];
  renderBoard();
}

function renderTurnIndicator() {
  const ti = document.getElementById('turnIndicator');
  const p = players[currentPlayer];
  ti.innerHTML = `<div class="turn-badge" style="background:${p.color}22; border:1px solid ${p.color}">
    <span class="w-3 h-3 rounded-full inline-block" style="background:${p.color}"></span>
    <span style="color:${p.color}">${p.name}'s Turn</span>
    ${p.isBot ? '<span class="text-xs opacity-50">(thinking...)</span>' : ''}
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
    div.className = `flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${i === currentPlayer ? 'ring-1' : ''}`;
    div.style.background = p.color + '20';
    div.style.borderColor = p.color;
    if (i === currentPlayer) div.style.boxShadow = `0 0 8px ${p.color}40`;

    div.innerHTML = `
      <span class="w-2 h-2 rounded-full" style="background:${p.color}"></span>
      <span style="color:${p.color}">${p.name}</span>
      <span class="opacity-60">${filled}/${total}</span>
      <div class="w-12 h-1.5 rounded-full overflow-hidden" style="background:${p.color}20">
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

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast-msg';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ===== RESIZE HANDLER =====
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (gameActive) renderBoard();
  }, 150);
});

// ===== ELEMENT SDK INIT =====
const defaultConfig = {
  game_title: 'HALMA',
  background_color: '#1a1a2e',
  surface_color: '#16213e',
  text_color: '#e8e8e8',
  primary_color: '#e94560',
  secondary_color: '#0f3460'
};

function applyConfig(config) {
  const bg = config.background_color || defaultConfig.background_color;
  const surface = config.surface_color || defaultConfig.surface_color;
  const text = config.text_color || defaultConfig.text_color;
  const primary = config.primary_color || defaultConfig.primary_color;
  const secondary = config.secondary_color || defaultConfig.secondary_color;
  const title = config.game_title || defaultConfig.game_title;

  document.documentElement.style.setProperty('--bg', bg);
  document.documentElement.style.setProperty('--surface', surface);
  document.documentElement.style.setProperty('--text', text);
  document.documentElement.style.setProperty('--primary', primary);
  document.documentElement.style.setProperty('--secondary', secondary);

  document.body.style.color = text;
  const wrapper = document.getElementById('appWrapper');
  if (wrapper) wrapper.style.background = `linear-gradient(135deg, ${bg} 0%, ${surface} 50%, ${bg} 100%)`;

  const titleEl = document.getElementById('gameTitle');
  if (titleEl) {
    titleEl.textContent = title;
    titleEl.style.color = primary;
  }

  document.querySelectorAll('.btn-primary').forEach(el => {
    el.style.background = `linear-gradient(135deg, ${primary}, ${primary}cc)`;
  });
  document.querySelectorAll('.btn-secondary').forEach(el => {
    el.style.background = `linear-gradient(135deg, ${secondary}, ${secondary}cc)`;
    el.style.borderColor = primary + '4d';
  });
  document.querySelectorAll('.card-panel').forEach(el => {
    el.style.background = surface + 'e6';
    el.style.borderColor = primary + '33';
  });
}

if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange: async (config) => { applyConfig(config); },
    mapToCapabilities: (config) => ({
      recolorables: [
        { get: () => config.background_color || defaultConfig.background_color, set: (v) => { config.background_color = v; window.elementSdk.setConfig({background_color: v}); } },
        { get: () => config.surface_color || defaultConfig.surface_color, set: (v) => { config.surface_color = v; window.elementSdk.setConfig({surface_color: v}); } },
        { get: () => config.text_color || defaultConfig.text_color, set: (v) => { config.text_color = v; window.elementSdk.setConfig({text_color: v}); } },
        { get: () => config.primary_color || defaultConfig.primary_color, set: (v) => { config.primary_color = v; window.elementSdk.setConfig({primary_color: v}); } },
        { get: () => config.secondary_color || defaultConfig.secondary_color, set: (v) => { config.secondary_color = v; window.elementSdk.setConfig({secondary_color: v}); } },
      ],
      borderables: [],
      fontEditable: undefined,
      fontSizeable: undefined
    }),
    mapToEditPanelValues: (config) => new Map([
      ['game_title', config.game_title || defaultConfig.game_title]
    ])
  });
}

applyConfig(defaultConfig);
lucide.createIcons();