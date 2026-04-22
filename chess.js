// ═══════════════════════════════════════════
// CHESS ENGINE + UI
// ═══════════════════════════════════════════

const PIECES = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
};

const PIECE_VALUES = { p:1, n:3, b:3, r:5, q:9, k:0, P:1, N:3, B:3, R:5, Q:9, K:0 };

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const BOARD_THEMES = {
  classic: { light: '#e8d5b5', dark: '#b58863' },
  green:   { light: '#eeeed2', dark: '#769656' },
  blue:    { light: '#dee3e6', dark: '#6e8fa5' },
  dark:    { light: '#a0a0a0', dark: '#505050' }
};

// ── Game State ──
let board = [];       // 8x8, null or piece char
let turn = 'w';       // 'w' or 'b'
let castling = { K:true, Q:true, k:true, q:true };
let enPassant = null;  // [r,c] or null
let halfmove = 0;
let fullmove = 1;
let selectedCell = null;
let legalMovesForSelected = [];
let moveHistory = [];  // { from, to, piece, captured, notation, fen, castlingBefore, enPassantBefore, halfmoveBefore }
let lastMove = null;   // {from, to}
let gameOver = false;
let playerColor = 'w';
let flipEachTurn = false;
let boardFlipped = false;
let timeLimit = 0;
let whiteTime = 0;
let blackTime = 0;
let timerInterval = null;
let boardTheme = 'classic';
let capturedWhite = []; // pieces captured from white
let capturedBlack = []; // pieces captured from black
let positionHistory = []; // for threefold repetition

// ── Game mode ──
let gameMode = 'pvp'; // 'pvp' or 'pvc'
let aiDifficulty = 'easy';
let keyboardSelection = null; // for keyboard-driven moves
let aiThinking = false;

// ── Setup Screen Logic ──
function setupOptBtns(containerId) {
  const container = document.getElementById(containerId);
  const btns = container.querySelectorAll('.opt-btn');
  btns.forEach(b => {
    b.addEventListener('click', () => {
      btns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
  });
}

// Toggle visibility based on mode
document.getElementById('modeChoice').querySelectorAll('.opt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.val;
    const colorDiv = document.getElementById('colorDiv');
    const diffDiv = document.getElementById('diffDiv');
    
    if (mode === 'pvp') {
      colorDiv.classList.remove('hidden');
      diffDiv.classList.add('hidden');
    } else {
      colorDiv.classList.add('hidden');
      diffDiv.classList.remove('hidden');
    }
  });
});

setupOptBtns('colorChoice');
setupOptBtns('timeChoice');
setupOptBtns('themeChoice');
setupOptBtns('modeChoice');
setupOptBtns('diffChoice');

function getOptVal(containerId) {
  const active = document.querySelector(`#${containerId} .opt-btn.active`);
  return active ? active.dataset.val : null;
}

document.getElementById('startBtn').addEventListener('click', () => {
  gameMode = getOptVal('modeChoice') || 'pvp';

  if (gameMode === 'pvp') {
    let color = getOptVal('colorChoice');
    if (color === 'random') color = Math.random() < 0.5 ? 'white' : 'black';
    playerColor = color === 'black' ? 'b' : 'w';
  } else {
    // In AI mode, player is always white
    playerColor = 'w';
    aiDifficulty = getOptVal('diffChoice') || 'easy';
  }

  timeLimit = parseInt(getOptVal('timeChoice')) || 0;
  whiteTime = timeLimit;
  blackTime = timeLimit;

  boardTheme = getOptVal('themeChoice') || 'classic';
  flipEachTurn = document.getElementById('flipCheck').checked;
  boardFlipped = playerColor === 'b';

  startNewGame();
});

// ── Parse / Serialize FEN ──
function parseFEN(fen) {
  const parts = fen.split(' ');
  const rows = parts[0].split('/');
  const b = [];
  for (let r = 0; r < 8; r++) {
    b[r] = [];
    let c = 0;
    for (const ch of rows[r]) {
      if (/\d/.test(ch)) { for (let i = 0; i < parseInt(ch); i++) b[r][c++] = null; }
      else b[r][c++] = ch;
    }
  }
  turn = parts[1];
  castling = { K: parts[2].includes('K'), Q: parts[2].includes('Q'), k: parts[2].includes('k'), q: parts[2].includes('q') };
  enPassant = parts[3] !== '-' ? [8 - parseInt(parts[3][1]), parts[3].charCodeAt(0) - 97] : null;
  halfmove = parseInt(parts[4]);
  fullmove = parseInt(parts[5]);
  return b;
}

function boardToFENPosition(b) {
  let fen = '';
  for (let r = 0; r < 8; r++) {
    let empty = 0;
    for (let c = 0; c < 8; c++) {
      if (!b[r][c]) empty++;
      else { if (empty) { fen += empty; empty = 0; } fen += b[r][c]; }
    }
    if (empty) fen += empty;
    if (r < 7) fen += '/';
  }
  return fen;
}

function currentPositionKey() {
  let c = '';
  if (castling.K) c += 'K'; if (castling.Q) c += 'Q';
  if (castling.k) c += 'k'; if (castling.q) c += 'q';
  if (!c) c = '-';
  const ep = enPassant ? String.fromCharCode(97 + enPassant[1]) + (8 - enPassant[0]) : '-';
  return boardToFENPosition(board) + ' ' + turn + ' ' + c + ' ' + ep;
}

// ── Helpers ──
function isWhite(p) { return p && p === p.toUpperCase(); }
function isBlack(p) { return p && p === p.toLowerCase(); }
function colorOf(p) { return isWhite(p) ? 'w' : 'b'; }
function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
function cloneBoard(b) { return b.map(r => [...r]); }

function findKing(b, color) {
  const king = color === 'w' ? 'K' : 'k';
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (b[r][c] === king) return [r, c];
  return null;
}

// ── Attack detection ──
function isSquareAttackedBy(b, r, c, byColor) {
  // Pawns
  const pDir = byColor === 'w' ? 1 : -1;
  const pawn = byColor === 'w' ? 'P' : 'p';
  if (inBounds(r + pDir, c - 1) && b[r + pDir][c - 1] === pawn) return true;
  if (inBounds(r + pDir, c + 1) && b[r + pDir][c + 1] === pawn) return true;

  // Knights
  const knight = byColor === 'w' ? 'N' : 'n';
  for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
    const nr = r + dr, nc = c + dc;
    if (inBounds(nr, nc) && b[nr][nc] === knight) return true;
  }

  // King
  const king = byColor === 'w' ? 'K' : 'k';
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && b[nr][nc] === king) return true;
    }

  // Rook/Queen (straight lines)
  const rook = byColor === 'w' ? 'R' : 'r';
  const queen = byColor === 'w' ? 'Q' : 'q';
  for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      if (b[nr][nc]) { if (b[nr][nc] === rook || b[nr][nc] === queen) return true; break; }
      nr += dr; nc += dc;
    }
  }

  // Bishop/Queen (diagonals)
  const bishop = byColor === 'w' ? 'B' : 'b';
  for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      if (b[nr][nc]) { if (b[nr][nc] === bishop || b[nr][nc] === queen) return true; break; }
      nr += dr; nc += dc;
    }
  }

  return false;
}

function isInCheck(b, color) {
  const kp = findKing(b, color);
  if (!kp) return false;
  return isSquareAttackedBy(b, kp[0], kp[1], color === 'w' ? 'b' : 'w');
}

// ── Move generation ──
function pseudoLegalMoves(b, color, ep, cast) {
  const moves = [];
  const dir = color === 'w' ? -1 : 1;
  const startRow = color === 'w' ? 6 : 1;
  const promoRow = color === 'w' ? 0 : 7;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (!p || colorOf(p) !== color) continue;
      const type = p.toLowerCase();

      if (type === 'p') {
        // Forward
        if (inBounds(r + dir, c) && !b[r + dir][c]) {
          if (r + dir === promoRow) {
            for (const promo of ['q','r','b','n']) moves.push({ from:[r,c], to:[r+dir,c], promo });
          } else {
            moves.push({ from:[r,c], to:[r+dir,c] });
            if (r === startRow && !b[r + 2*dir][c]) moves.push({ from:[r,c], to:[r+2*dir,c] });
          }
        }
        // Captures
        for (const dc of [-1, 1]) {
          const nr = r + dir, nc = c + dc;
          if (!inBounds(nr, nc)) continue;
          if (b[nr][nc] && colorOf(b[nr][nc]) !== color) {
            if (nr === promoRow) {
              for (const promo of ['q','r','b','n']) moves.push({ from:[r,c], to:[nr,nc], promo });
            } else moves.push({ from:[r,c], to:[nr,nc] });
          }
          if (ep && ep[0] === nr && ep[1] === nc) moves.push({ from:[r,c], to:[nr,nc], enPassant: true });
        }
      } else if (type === 'n') {
        for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
          const nr = r+dr, nc = c+dc;
          if (inBounds(nr, nc) && (!b[nr][nc] || colorOf(b[nr][nc]) !== color))
            moves.push({ from:[r,c], to:[nr,nc] });
        }
      } else if (type === 'k') {
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const nr = r+dr, nc = c+dc;
            if (inBounds(nr, nc) && (!b[nr][nc] || colorOf(b[nr][nc]) !== color))
              moves.push({ from:[r,c], to:[nr,nc] });
          }
        // Castling
        const row = color === 'w' ? 7 : 0;
        const opp = color === 'w' ? 'b' : 'w';
        if (r === row && c === 4) {
          // Kingside
          const ks = color === 'w' ? 'K' : 'k';
          if (cast[ks] && !b[row][5] && !b[row][6] && b[row][7] &&
              !isSquareAttackedBy(b, row, 4, opp) && !isSquareAttackedBy(b, row, 5, opp) && !isSquareAttackedBy(b, row, 6, opp))
            moves.push({ from:[row,4], to:[row,6], castle:'K' });
          // Queenside
          const qs = color === 'w' ? 'Q' : 'q';
          if (cast[qs] && !b[row][3] && !b[row][2] && !b[row][1] && b[row][0] &&
              !isSquareAttackedBy(b, row, 4, opp) && !isSquareAttackedBy(b, row, 3, opp) && !isSquareAttackedBy(b, row, 2, opp))
            moves.push({ from:[row,4], to:[row,2], castle:'Q' });
        }
      } else {
        // Sliding pieces
        const dirs = [];
        if (type === 'r' || type === 'q') dirs.push([0,1],[0,-1],[1,0],[-1,0]);
        if (type === 'b' || type === 'q') dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
        for (const [dr, dc] of dirs) {
          let nr = r+dr, nc = c+dc;
          while (inBounds(nr, nc)) {
            if (b[nr][nc]) {
              if (colorOf(b[nr][nc]) !== color) moves.push({ from:[r,c], to:[nr,nc] });
              break;
            }
            moves.push({ from:[r,c], to:[nr,nc] });
            nr += dr; nc += dc;
          }
        }
      }
    }
  }
  return moves;
}

function isLegalMove(b, move, color, ep, cast) {
  const nb = cloneBoard(b);
  applyMoveToBoard(nb, move, color);
  return !isInCheck(nb, color);
}

function getLegalMoves(b, color, ep, cast) {
  const pseudo = pseudoLegalMoves(b, color, ep, cast);
  return pseudo.filter(m => isLegalMove(b, m, color, ep, cast));
}

function applyMoveToBoard(b, move, color) {
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  const piece = b[fr][fc];

  if (move.enPassant) {
    b[fr][tc] = null; // remove captured pawn
  }
  if (move.castle) {
    const row = fr;
    if (move.castle === 'K') { b[row][5] = b[row][7]; b[row][7] = null; }
    else { b[row][3] = b[row][0]; b[row][0] = null; }
  }

  b[tr][tc] = piece;
  b[fr][fc] = null;

  if (move.promo) {
    b[tr][tc] = color === 'w' ? move.promo.toUpperCase() : move.promo.toLowerCase();
  }
}

// ── Make move on game state ──
function makeMove(move) {
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  const piece = board[fr][fc];
  const captured = move.enPassant ? board[fr][tc] : board[tr][tc];

  // Save state for undo
  const histEntry = {
    from: move.from, to: move.to, piece, captured,
    castlingBefore: { ...castling },
    enPassantBefore: enPassant ? [...enPassant] : null,
    halfmoveBefore: halfmove,
    castle: move.castle || null,
    enPassant: move.enPassant || false,
    promo: move.promo || null,
    notation: ''
  };

  // Track captured pieces
  if (captured) {
    if (colorOf(captured) === 'w') capturedWhite.push(captured);
    else capturedBlack.push(captured);
  }

  // Apply
  applyMoveToBoard(board, move, turn);

  // Update castling rights
  if (piece === 'K') { castling.K = false; castling.Q = false; }
  if (piece === 'k') { castling.k = false; castling.q = false; }
  if (piece === 'R' && fr === 7 && fc === 0) castling.Q = false;
  if (piece === 'R' && fr === 7 && fc === 7) castling.K = false;
  if (piece === 'r' && fr === 0 && fc === 0) castling.q = false;
  if (piece === 'r' && fr === 0 && fc === 7) castling.k = false;
  if (tr === 0 && tc === 0) castling.q = false;
  if (tr === 0 && tc === 7) castling.k = false;
  if (tr === 7 && tc === 0) castling.Q = false;
  if (tr === 7 && tc === 7) castling.K = false;

  // En passant
  if (piece.toLowerCase() === 'p' && Math.abs(fr - tr) === 2) {
    enPassant = [(fr + tr) / 2, fc];
  } else {
    enPassant = null;
  }

  // Halfmove clock
  if (piece.toLowerCase() === 'p' || captured) halfmove = 0;
  else halfmove++;

  // Build notation
  histEntry.notation = buildNotation(histEntry, move);

  lastMove = { from: move.from, to: move.to };
  moveHistory.push(histEntry);

  // Switch turn
  if (turn === 'b') fullmove++;
  turn = turn === 'w' ? 'b' : 'w';

  // Position tracking
  positionHistory.push(currentPositionKey());
}

function buildNotation(hist, move) {
  if (move.castle === 'K') return 'O-O';
  if (move.castle === 'Q') return 'O-O-O';

  const piece = hist.piece;
  const type = piece.toLowerCase();
  let n = '';

  if (type !== 'p') n += type.toUpperCase();

  // Disambiguation would go here for a full implementation
  const [fr, fc] = hist.from;
  const [tr, tc] = hist.to;

  if (type === 'p' && (hist.captured || hist.enPassant)) {
    n += String.fromCharCode(97 + fc);
  }

  if (hist.captured || hist.enPassant) n += 'x';

  n += String.fromCharCode(97 + tc) + (8 - tr);

  if (move.promo) n += '=' + move.promo.toUpperCase();

  // Check/checkmate detection after move
  const opp = turn === 'w' ? 'b' : 'w'; // turn already switched before calling this? No, we call before switch
  // We'll append +/# in the render step after turn switch

  return n;
}

// ── Check game end ──
function checkGameEnd() {
  const legal = getLegalMoves(board, turn, enPassant, castling);
  const inCheck = isInCheck(board, turn);
  
  // Update notation with check/checkmate symbol BEFORE checking end conditions
  if (moveHistory.length) {
    const last = moveHistory[moveHistory.length - 1];
    // Remove any existing symbols first
    last.notation = last.notation.replace(/[+#]$/, '');
    
    if (inCheck) {
      if (legal.length === 0) {
        // Checkmate
        last.notation += '#';
      } else {
        // Check (but not checkmate)
        last.notation += '+';
      }
    }
  }
  
  if (legal.length === 0) {
    if (inCheck) {
      const winner = turn === 'w' ? 'Hitam' : 'Putih';
      endGame(`Skakmat! ${winner} menang! 🎉`);
      return true;
    } else {
      // Stalemate
      endGame('Stalemate! Permainan seri. 🤝');
      return true;
    }
  }

  // 50-move rule
  if (halfmove >= 100) { endGame('Seri! Aturan 50 langkah. 🤝'); return true; }

  // Threefold repetition
  const key = currentPositionKey();
  const count = positionHistory.filter(k => k === key).length;
  if (count >= 3) { endGame('Seri! Pengulangan posisi 3x. 🤝'); return true; }

  // Insufficient material
  if (isInsufficientMaterial()) { endGame('Seri! Material tidak cukup. 🤝'); return true; }

  return false;
}

function isInsufficientMaterial() {
  const pieces = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]) pieces.push(board[r][c]);

  if (pieces.length === 2) return true; // K vs K
  if (pieces.length === 3) {
    const nonKing = pieces.find(p => p.toLowerCase() !== 'k');
    if (nonKing && (nonKing.toLowerCase() === 'b' || nonKing.toLowerCase() === 'n')) return true;
  }
  if (pieces.length === 4) {
    const bishops = pieces.filter(p => p.toLowerCase() === 'b');
    if (bishops.length === 2) {
      // Check if same color squares
      let pos = [];
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
          if (board[r][c] && board[r][c].toLowerCase() === 'b') pos.push((r+c) % 2);
      if (pos[0] === pos[1]) return true;
    }
  }
  return false;
}

// ── Undo ──
function undoMove() {
  if (!moveHistory.length || gameOver) return;
  const m = moveHistory.pop();
  positionHistory.pop();

  const [fr, fc] = m.from;
  const [tr, tc] = m.to;

  // Restore piece
  board[fr][fc] = m.piece;
  board[tr][tc] = m.enPassant ? null : m.captured;

  if (m.enPassant) {
    // Restore captured pawn
    board[fr][tc] = m.captured;
  }

  if (m.castle) {
    const row = fr;
    if (m.castle === 'K') { board[row][7] = board[row][5]; board[row][5] = null; }
    else { board[row][0] = board[row][3]; board[row][3] = null; }
  }

  if (m.promo) {
    board[fr][fc] = m.piece; // restore pawn
  }

  // Restore captured piece tracking
  if (m.captured) {
    if (colorOf(m.captured) === 'w') capturedWhite.pop();
    else capturedBlack.pop();
  }

  castling = { ...m.castlingBefore };
  enPassant = m.enPassantBefore;
  halfmove = m.halfmoveBefore;
  turn = turn === 'w' ? 'b' : 'w';
  if (turn === 'b') fullmove--;

  lastMove = moveHistory.length ? { from: moveHistory[moveHistory.length-1].from, to: moveHistory[moveHistory.length-1].to } : null;
  selectedCell = null;
  legalMovesForSelected = [];

  renderBoard();
  renderMoveHistory();
  updateTurnBadge();
}

// ── Timer ──
function startTimer() {
  if (!timeLimit) return;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (gameOver) { clearInterval(timerInterval); return; }
    if (turn === 'w') {
      whiteTime--;
      if (whiteTime <= 0) { whiteTime = 0; endGame('Waktu habis! Hitam menang! ⏰'); }
    } else {
      blackTime--;
      if (blackTime <= 0) { blackTime = 0; endGame('Waktu habis! Putih menang! ⏰'); }
    }
    renderTimers();
  }, 1000);
}

function renderTimers() {
  const fmt = s => {
    if (!timeLimit) return '∞';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const topIsBlack = !boardFlipped;
  document.getElementById('topTimer').textContent = fmt(topIsBlack ? blackTime : whiteTime);
  document.getElementById('bottomTimer').textContent = fmt(topIsBlack ? whiteTime : blackTime);
}

// ── End game ──
function endGame(msg) {
  gameOver = true;
  clearInterval(timerInterval);
  document.getElementById('statusText').textContent = msg;

  const modal = document.getElementById('gameOverModal');
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="text-center p-8 rounded-2xl max-w-sm mx-4" style="background:var(--surface-color); border: 2px solid var(--secondary-color);">
      <div class="text-5xl mb-4">♚</div>
      <h2 class="font-display text-xl font-bold mb-2">${msg}</h2>
      <p class="text-sm opacity-60 mb-6">${moveHistory.length} langkah dimainkan</p>
      <div class="flex gap-3 justify-center">
        <button onclick="document.getElementById('gameOverModal').style.display='none'" class="opt-btn">Tutup</button>
        <button onclick="document.getElementById('gameOverModal').style.display='none'; showSetup();" class="opt-btn" style="background:var(--primary-color); border-color:var(--primary-color);">Permainan Baru</button>
      </div>
    </div>
  `;
}

// ── Promotion ──
function showPromotion(from, to) {
  return new Promise(resolve => {
    const overlay = document.getElementById('promoOverlay');
    overlay.style.display = 'flex';
    const color = turn;
    const pieces = color === 'w' ? ['Q','R','B','N'] : ['q','r','b','n'];
    overlay.innerHTML = `
      <div class="text-center p-6 rounded-2xl" style="background:var(--surface-color);">
        <div class="text-sm font-semibold mb-3 opacity-80">Pilih Promosi</div>
        <div class="promo-choices">
          ${pieces.map(p => `<button data-p="${p.toLowerCase()}">${PIECES[p]}</button>`).join('')}
        </div>
      </div>
    `;
    overlay.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.style.display = 'none';
        resolve(btn.dataset.p);
      });
    });
  });
}

// ── Render Board ──
function renderBoard() {
  const boardEl = document.getElementById('board');
  const theme = BOARD_THEMES[boardTheme];

  // Build cells if not present
  if (!boardEl.children.length) {
    for (let i = 0; i < 64; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.idx = i;
      const span = document.createElement('span');
      span.className = 'piece';
      cell.appendChild(span);
      const suggestion = document.createElement('div');
      suggestion.className = 'move-suggest';
      suggestion.style.display = 'none';
      cell.appendChild(suggestion);
      boardEl.appendChild(cell);
      cell.addEventListener('click', () => onCellClick(cell));
    }
  }

  for (let i = 0; i < 64; i++) {
    const cell = boardEl.children[i];
    const visualR = Math.floor(i / 8);
    const visualC = i % 8;
    const r = boardFlipped ? 7 - visualR : visualR;
    const c = boardFlipped ? 7 - visualC : visualC;

    cell.dataset.r = r;
    cell.dataset.c = c;

    const isLight = (r + c) % 2 === 0;
    cell.style.background = isLight ? theme.light : theme.dark;
    cell.className = 'cell ' + (isLight ? 'light' : 'dark');

    // Last move highlight
    if (lastMove && ((lastMove.from[0]===r && lastMove.from[1]===c) || (lastMove.to[0]===r && lastMove.to[1]===c))) {
      cell.classList.add('last-move');
    }

    // Selected
    if (selectedCell && selectedCell[0]===r && selectedCell[1]===c) cell.classList.add('selected');

    // Legal moves
    const isLegal = legalMovesForSelected.some(m => m.to[0]===r && m.to[1]===c);
    if (isLegal) {
      if (board[r][c]) cell.classList.add('legal-capture');
      else cell.classList.add('legal-move');
    }

    // Check
    const king = turn === 'w' ? 'K' : 'k';
    if (board[r][c] === king && isInCheck(board, turn)) cell.classList.add('in-check');

    // Piece
    const span = cell.querySelector('.piece');
    span.textContent = board[r][c] ? PIECES[board[r][c]] : '';

    // Move suggestion
    const suggest = cell.querySelector('.move-suggest');
    if (keyboardSelection && selectedCell && selectedCell[0]===keyboardSelection[0] && selectedCell[1]===keyboardSelection[1]) {
      const moveToThis = legalMovesForSelected.find(m => m.to[0]===r && m.to[1]===c);
      if (moveToThis) {
        const [fr, fc] = moveToThis.from;
        const [tr, tc] = moveToThis.to;
        suggest.textContent = String.fromCharCode(97 + fc) + (8 - fr) + ' → ' + String.fromCharCode(97 + tc) + (8 - tr);
        suggest.style.display = 'block';
      } else {
        suggest.style.display = 'none';
      }
    } else {
      suggest.style.display = 'none';
    }
  }

  renderCaptured();
  renderTimers();
}

function renderCaptured() {
  const sort = arr => [...arr].sort((a,b) => PIECE_VALUES[b] - PIECE_VALUES[a]);

  const topIsBlack = !boardFlipped;
  const topCap = topIsBlack ? sort(capturedBlack).map(p => PIECES[p]).join('') : sort(capturedWhite).map(p => PIECES[p]).join('');
  const botCap = topIsBlack ? sort(capturedWhite).map(p => PIECES[p]).join('') : sort(capturedBlack).map(p => PIECES[p]).join('');

  document.getElementById('topCaptured').textContent = topCap;
  document.getElementById('bottomCaptured').textContent = botCap;
}

// ── Move History Panel ──
function renderMoveHistory() {
  const el = document.getElementById('moveList');
  if (!moveHistory.length) {
    el.innerHTML = '<div class="opacity-40 text-center text-xs py-4">Belum ada gerakan</div>';
    return;
  }

  let html = '<table class="w-full text-xs"><tbody>';
  for (let i = 0; i < moveHistory.length; i += 2) {
    const num = Math.floor(i / 2) + 1;
    html += `<tr class="hover:bg-white/5 rounded"><td class="pr-2 opacity-50 w-8 text-right">${num}.</td>`;
    html += `<td class="py-0.5 px-1 font-semibold">${moveHistory[i].notation}</td>`;
    html += `<td class="py-0.5 px-1 font-semibold">${moveHistory[i+1] ? moveHistory[i+1].notation : ''}</td></tr>`;
  }
  html += '</tbody></table>';
  el.innerHTML = html;
  el.scrollTop = el.scrollHeight;
}

function updateTurnBadge() {
  const badge = document.getElementById('turnBadge');
  badge.textContent = gameOver ? 'Selesai' : (turn === 'w' ? 'Giliran: Putih' : 'Giliran: Hitam');
  document.getElementById('statusText').textContent = gameOver ? document.getElementById('statusText').textContent :
    (isInCheck(board, turn) ? 'Skak!' : 'Permainan berlangsung');
}

// ── Player info ──
function renderPlayerInfo() {
  const topIsBlack = !boardFlipped;
  document.getElementById('topPlayerIcon').textContent = topIsBlack ? '♚' : '♔';
  document.getElementById('topPlayerName').textContent = topIsBlack ? 'Hitam' : 'Putih';
  document.getElementById('bottomPlayerIcon').textContent = topIsBlack ? '♔' : '♚';
  document.getElementById('bottomPlayerName').textContent = topIsBlack ? 'Putih' : 'Hitam';
}

// ── Cell click handler ──
async function onCellClick(cell) {
  if (gameOver || aiThinking) return;

  // Only allow player moves in AI mode
  if (gameMode === 'pvc' && turn !== playerColor) return;

  const r = parseInt(cell.dataset.r);
  const c = parseInt(cell.dataset.c);
  const piece = board[r][c];

  // If clicking a legal move destination
  if (selectedCell) {
    const move = legalMovesForSelected.find(m => m.to[0]===r && m.to[1]===c);
    if (move) {
      keyboardSelection = null;
      
      // Handle promotion choice
      if (move.promo) {
        const choice = await showPromotion(move.from, move.to);
        const actualMove = legalMovesForSelected.find(m => m.to[0]===r && m.to[1]===c && m.promo === choice);
        if (actualMove) {
          makeMove(actualMove);
        }
      } else {
        makeMove(move);
      }

      selectedCell = null;
      legalMovesForSelected = [];

      const ended = checkGameEnd();
      renderBoard();
      renderMoveHistory();
      updateTurnBadge();

      if (!ended && flipEachTurn) {
        boardFlipped = !boardFlipped;
        renderBoard();
        renderPlayerInfo();
      }

      // AI move
      if (!ended && gameMode === 'pvc' && turn !== playerColor) {
        await makeAIMove();
      }
      return;
    }
  }

  // Select own piece
  if (piece && colorOf(piece) === turn) {
    selectedCell = [r, c];
    keyboardSelection = [r, c];
    const allLegal = getLegalMoves(board, turn, enPassant, castling);
    legalMovesForSelected = allLegal.filter(m => m.from[0]===r && m.from[1]===c);
  } else {
    selectedCell = null;
    keyboardSelection = null;
    legalMovesForSelected = [];
  }

  renderBoard();
}

// ── Start / Reset ──
function startNewGame() {
  board = parseFEN(INITIAL_FEN);
  turn = 'w';
  castling = { K:true, Q:true, k:true, q:true };
  enPassant = null;
  halfmove = 0;
  fullmove = 1;
  selectedCell = null;
  keyboardSelection = null;
  legalMovesForSelected = [];
  moveHistory = [];
  lastMove = null;
  gameOver = false;
  aiThinking = false;
  capturedWhite = [];
  capturedBlack = [];
  positionHistory = [currentPositionKey()];
  whiteTime = timeLimit;
  blackTime = timeLimit;
  clearInterval(timerInterval);

  document.getElementById('setupScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');
  document.getElementById('gameOverModal').style.display = 'none';

  renderBoard();
  renderMoveHistory();
  updateTurnBadge();
  renderPlayerInfo();
  startTimer();

  // AI first move if AI is black
  if (gameMode === 'pvc' && turn !== playerColor) {
    setTimeout(() => makeAIMove(), 500);
  }

  lucide.createIcons();
}

function showSetup() {
  clearInterval(timerInterval);
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('setupScreen').classList.add('active');
}

// ── Button handlers ──
document.getElementById('undoBtn').addEventListener('click', undoMove);
document.getElementById('newGameBtn').addEventListener('click', showSetup);

document.getElementById('resignBtn').addEventListener('click', () => {
  if (gameOver) return;
  const btn = document.getElementById('resignBtn');
  if (btn.dataset.confirm === 'true') {
    const winner = turn === 'w' ? 'Hitam' : 'Putih';
    endGame(`${turn === 'w' ? 'Putih' : 'Hitam'} menyerah. ${winner} menang! 🏳️`);
    renderBoard();
    renderMoveHistory();
    updateTurnBadge();
    btn.dataset.confirm = '';
    btn.innerHTML = '<i data-lucide="flag" style="width:14px;height:14px;"></i> Menyerah';
    lucide.createIcons();
  } else {
    btn.dataset.confirm = 'true';
    btn.innerHTML = 'Yakin?';
    setTimeout(() => {
      if (btn.dataset.confirm === 'true') {
        btn.dataset.confirm = '';
        btn.innerHTML = '<i data-lucide="flag" style="width:14px;height:14px;"></i> Menyerah';
        lucide.createIcons();
      }
    }, 3000);
  }
});

document.getElementById('drawBtn').addEventListener('click', () => {
  if (gameOver) return;
  const btn = document.getElementById('drawBtn');
  if (btn.dataset.confirm === 'true') {
    endGame('Permainan seri dengan persetujuan. 🤝');
    renderBoard();
    renderMoveHistory();
    updateTurnBadge();
    btn.dataset.confirm = '';
    btn.innerHTML = '<i data-lucide="handshake" style="width:14px;height:14px;"></i> Seri';
    lucide.createIcons();
  } else {
    btn.dataset.confirm = 'true';
    btn.innerHTML = 'Setuju Seri?';
    setTimeout(() => {
      if (btn.dataset.confirm === 'true') {
        btn.dataset.confirm = '';
        btn.innerHTML = '<i data-lucide="handshake" style="width:14px;height:14px;"></i> Seri';
        lucide.createIcons();
      }
    }, 3000);
  }
});

// ── Toast ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── Keyboard controls ──
document.addEventListener('keydown', async (e) => {
  if (gameOver || aiThinking || !keyboardSelection) return;
  
  if (gameMode === 'pvc' && turn !== playerColor) return;

  const [sr, sc] = keyboardSelection;
  let nr = sr, nc = sc;

  // Arrow key mapping
  if (e.key === 'ArrowUp') nr = Math.max(0, sr - 1);
  else if (e.key === 'ArrowDown') nr = Math.min(7, sr + 1);
  else if (e.key === 'ArrowLeft') nc = Math.max(0, sc - 1);
  else if (e.key === 'ArrowRight') nc = Math.min(7, sc + 1);
  else if (e.key === 'Enter' || e.key === ' ') {
    // Execute move to currently highlighted square
    const move = legalMovesForSelected.find(m => m.to[0]===sr && m.to[1]===sc);
    if (move) {
      // Handle promotion choice
      if (move.promo) {
        const choice = await showPromotion(move.from, move.to);
        const actualMove = legalMovesForSelected.find(m => m.to[0]===sr && m.to[1]===sc && m.promo === choice);
        if (actualMove) makeMove(actualMove);
      } else {
        makeMove(move);
      }

      selectedCell = null;
      keyboardSelection = null;
      legalMovesForSelected = [];

      const ended = checkGameEnd();
      renderBoard();
      renderMoveHistory();
      updateTurnBadge();

      if (!ended && flipEachTurn) {
        boardFlipped = !boardFlipped;
        renderBoard();
        renderPlayerInfo();
      }

      if (!ended && gameMode === 'pvc' && turn !== playerColor) {
        await makeAIMove();
      }
    }
    return;
  } else return;

  // Check if there's a legal move to this square
  const moveTo = legalMovesForSelected.find(m => m.to[0]===nr && m.to[1]===nc);
  if (moveTo) {
    keyboardSelection = [nr, nc];
    renderBoard();
  }
});

// ── AI Logic ──
function evaluateBoard(b, color) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (!p) continue;
      const val = PIECE_VALUES[p];
      const sign = colorOf(p) === color ? 1 : -1;
      score += val * sign;
      // Positional bonus
      if (p.toLowerCase() === 'p') score += sign * 0.1 * (color === 'w' ? (6 - r) : (r - 1));
    }
  }
  return score;
}

function minimax(b, depth, alpha, beta, isMaximizing, color, myColor) {
  if (depth === 0) return evaluateBoard(b, myColor);

  const moves = getLegalMoves(b, isMaximizing ? color : (color === 'w' ? 'b' : 'w'), enPassant, castling);

  if (moves.length === 0) {
    const testBoard = cloneBoard(b);
    applyMoveToBoard(testBoard, {from:[0,0], to:[0,0]}, color); // dummy
    if (isInCheck(testBoard, color)) return isMaximizing ? -9999 : 9999;
    return 0;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const testBoard = cloneBoard(b);
      applyMoveToBoard(testBoard, move, isMaximizing ? color : (color === 'w' ? 'b' : 'w'));
      const evaluation = minimax(testBoard, depth - 1, alpha, beta, false, color === 'w' ? 'b' : 'w', myColor);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const testBoard = cloneBoard(b);
      applyMoveToBoard(testBoard, move, isMaximizing ? color : (color === 'w' ? 'b' : 'w'));
      const evaluation = minimax(testBoard, depth - 1, alpha, beta, true, color === 'w' ? 'b' : 'w', myColor);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getBestMove(color) {
  const moves = getLegalMoves(board, color, enPassant, castling);
  if (!moves.length) return null;

  const depth = aiDifficulty === 'easy' ? 2 : aiDifficulty === 'medium' ? 3 : 4;
  let bestMove = moves[0];
  let bestEval = -Infinity;

  for (const move of moves) {
    const testBoard = cloneBoard(board);
    applyMoveToBoard(testBoard, move, color);
    const evaluation = minimax(testBoard, depth - 1, -Infinity, Infinity, false, color === 'w' ? 'b' : 'w', color);
    if (evaluation > bestEval) {
      bestEval = evaluation;
      bestMove = move;
    }
  }
  return bestMove;
}

async function makeAIMove() {
  if (gameMode !== 'pvc' || turn === playerColor || gameOver) return;

  aiThinking = true;
  document.getElementById('statusText').textContent = 'AI sedang berpikir...';

  // Delay for better UX
  await new Promise(resolve => setTimeout(resolve, 800));

  const move = getBestMove(turn);
  if (move) {
    makeMove(move);
    const ended = checkGameEnd();
    renderBoard();
    renderMoveHistory();
    updateTurnBadge();

    if (!ended && flipEachTurn) {
      boardFlipped = !boardFlipped;
      renderBoard();
      renderPlayerInfo();
    }
  }

  aiThinking = false;
}

// ── Element SDK ──
const defaultConfig = {
  game_title: 'Chess Master',
  background_color: '#1a1a2e',
  surface_color: '#16213e',
  text_color: '#eaf0fb',
  primary_color: '#e94560',
  secondary_color: '#0f3460',
  font_family: 'Source Sans 3',
  font_size: 16
};

function applyConfig(cfg) {
  const bg = cfg.background_color || defaultConfig.background_color;
  const sf = cfg.surface_color || defaultConfig.surface_color;
  const tx = cfg.text_color || defaultConfig.text_color;
  const pr = cfg.primary_color || defaultConfig.primary_color;
  const sc = cfg.secondary_color || defaultConfig.secondary_color;
  const ff = cfg.font_family || defaultConfig.font_family;
  const fs = cfg.font_size || defaultConfig.font_size;
  const title = cfg.game_title || defaultConfig.game_title;

  document.documentElement.style.setProperty('--bg-color', bg);
  document.documentElement.style.setProperty('--surface-color', sf);
  document.documentElement.style.setProperty('--text-color', tx);
  document.documentElement.style.setProperty('--primary-color', pr);
  document.documentElement.style.setProperty('--secondary-color', sc);

  document.body.style.fontFamily = `${ff}, 'Source Sans 3', sans-serif`;
  document.body.style.color = tx;
  document.body.style.background = bg;
  document.querySelector('.app-wrapper').style.background = bg;

  document.body.style.fontSize = fs + 'px';

  const mainTitle = document.getElementById('mainTitle');
  if (mainTitle) mainTitle.textContent = `♚ ${title}`;
  const gameTitle = document.getElementById('gameTitle');
  if (gameTitle) gameTitle.textContent = `♚ ${title}`;

  document.getElementById('startBtn').style.background = pr;

  document.querySelectorAll('.opt-btn.active').forEach(b => {
    b.style.background = pr;
    b.style.borderColor = pr;
  });
}

if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange: async (config) => { applyConfig(config); },
    mapToCapabilities: (config) => ({
      recolorables: [
        { get: () => config.background_color || defaultConfig.background_color, set: v => { config.background_color = v; window.elementSdk.setConfig({ background_color: v }); } },
        { get: () => config.surface_color || defaultConfig.surface_color, set: v => { config.surface_color = v; window.elementSdk.setConfig({ surface_color: v }); } },
        { get: () => config.text_color || defaultConfig.text_color, set: v => { config.text_color = v; window.elementSdk.setConfig({ text_color: v }); } },
        { get: () => config.primary_color || defaultConfig.primary_color, set: v => { config.primary_color = v; window.elementSdk.setConfig({ primary_color: v }); } },
        { get: () => config.secondary_color || defaultConfig.secondary_color, set: v => { config.secondary_color = v; window.elementSdk.setConfig({ secondary_color: v }); } }
      ],
      borderables: [],
      fontEditable: {
        get: () => config.font_family || defaultConfig.font_family,
        set: v => { config.font_family = v; window.elementSdk.setConfig({ font_family: v }); }
      },
      fontSizeable: {
        get: () => config.font_size || defaultConfig.font_size,
        set: v => { config.font_size = v; window.elementSdk.setConfig({ font_size: v }); }
      }
    }),
    mapToEditPanelValues: (config) => new Map([
      ['game_title', config.game_title || defaultConfig.game_title]
    ])
  });
}

applyConfig(defaultConfig);
lucide.createIcons();
