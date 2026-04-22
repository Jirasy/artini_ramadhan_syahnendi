  // ========== CONFIG & SDK ==========
    const defaultConfig = {
      background_color: '#0f172a',
      surface_color: '#1e293b',
      text_color: '#f1f5f9',
      primary_color: '#f59e0b',
      secondary_color: '#6366f1',
      font_family: 'Outfit',
      font_size: 16,
      game_title: 'Tic Tac Toe',
      player_x_name: 'Player X',
      player_o_name: 'Player O'
    };

    function applyConfig(config) {
      const c = { ...defaultConfig, ...config };
      const root = document.documentElement.style;
      root.setProperty('--bg-color', c.background_color);
      root.setProperty('--surface-color', c.surface_color);
      root.setProperty('--text-color', c.text_color);
      root.setProperty('--primary-color', c.primary_color);
      root.setProperty('--secondary-color', c.secondary_color);

      document.body.style.fontFamily = `${c.font_family}, Outfit, sans-serif`;
      document.body.style.color = c.text_color;
      document.querySelector('.app-wrapper').style.background = c.background_color;

      const titles = document.querySelectorAll('.game-title');
      titles.forEach(t => {
        t.style.background = `linear-gradient(135deg, ${c.primary_color}, #fbbf24, ${c.secondary_color})`;
        t.style.webkitBackgroundClip = 'text';
        t.style.webkitTextFillColor = 'transparent';
        t.style.backgroundClip = 'text';
      });

      const titleEl = document.getElementById('titleText');
      if (titleEl) titleEl.textContent = c.game_title;
      const gameTitleEl = document.getElementById('gameTitle');
      if (gameTitleEl) gameTitleEl.textContent = c.game_title;

      const labelX = document.getElementById('labelX');
      const labelO = document.getElementById('labelO');
      if (labelX) labelX.textContent = c.player_x_name;
      if (labelO) labelO.textContent = c.player_o_name;

      // Update status if game is active
      if (gameState && !gameState.gameOver) {
        updateStatus();
      }
    }

    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange: async (config) => { applyConfig(config); },
        mapToCapabilities: (config) => {
          const c = { ...defaultConfig, ...config };
          return {
            recolorables: [
              { get: () => c.background_color, set: (v) => { c.background_color = v; window.elementSdk.setConfig({ background_color: v }); } },
              { get: () => c.surface_color, set: (v) => { c.surface_color = v; window.elementSdk.setConfig({ surface_color: v }); } },
              { get: () => c.text_color, set: (v) => { c.text_color = v; window.elementSdk.setConfig({ text_color: v }); } },
              { get: () => c.primary_color, set: (v) => { c.primary_color = v; window.elementSdk.setConfig({ primary_color: v }); } },
              { get: () => c.secondary_color, set: (v) => { c.secondary_color = v; window.elementSdk.setConfig({ secondary_color: v }); } }
            ],
            borderables: [],
            fontEditable: {
              get: () => c.font_family,
              set: (v) => { c.font_family = v; window.elementSdk.setConfig({ font_family: v }); }
            },
            fontSizeable: {
              get: () => c.font_size,
              set: (v) => { c.font_size = v; window.elementSdk.setConfig({ font_size: v }); }
            }
          };
        },
        mapToEditPanelValues: (config) => {
          const c = { ...defaultConfig, ...config };
          return new Map([
            ['game_title', c.game_title],
            ['player_x_name', c.player_x_name],
            ['player_o_name', c.player_o_name]
          ]);
        }
      });
    }

    // ========== MENU STATE ==========
    const menuSelections = {
      opponent: 'bot',
      difficulty: 'easy',
      size: '3',
      symbol: 'X',
      first: 'X'
    };

    function selectOption(btn) {
      const group = btn.dataset.group;
      const value = btn.dataset.value;
      menuSelections[group] = value;

      document.querySelectorAll(`[data-group="${group}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      // Show/hide difficulty based on opponent
      if (group === 'opponent') {
        document.getElementById('difficultyCard').style.display = value === 'bot' ? 'block' : 'none';
      }
    }

    // ========== GAME STATE ==========
    let gameState = null;
    let scores = { X: 0, O: 0, draw: 0 };

    function getConfig() {
      if (window.elementSdk && window.elementSdk.config) {
        return { ...defaultConfig, ...window.elementSdk.config };
      }
      return { ...defaultConfig };
    }

    function startGame() {
      const size = parseInt(menuSelections.size);
      const winLen = size === 3 ? 3 : size === 4 ? 3 : 4;

      gameState = {
        size,
        winLen,
        board: Array(size * size).fill(null),
        currentPlayer: menuSelections.first,
        playerSymbol: menuSelections.symbol,
        botSymbol: menuSelections.symbol === 'X' ? 'O' : 'X',
        opponent: menuSelections.opponent,
        difficulty: menuSelections.difficulty,
        gameOver: false,
        winCells: []
      };

      scores = { X: 0, O: 0, draw: 0 };

      document.getElementById('menuScreen').style.display = 'none';
      document.getElementById('gameScreen').style.display = 'flex';

      const c = getConfig();
      document.getElementById('labelX').textContent = 
        gameState.opponent === 'bot'
          ? (gameState.playerSymbol === 'X' ? c.player_x_name : 'Bot')
          : c.player_x_name;
      document.getElementById('labelO').textContent = 
        gameState.opponent === 'bot'
          ? (gameState.playerSymbol === 'O' ? c.player_o_name : 'Bot')
          : c.player_o_name;

      updateScoreDisplay();
      buildBoard();
      updateStatus();
      lucide.createIcons();

      // If bot goes first
      if (gameState.opponent === 'bot' && gameState.currentPlayer === gameState.botSymbol) {
        setTimeout(botMove, 400);
      }
    }

    function goToMenu() {
      document.getElementById('menuScreen').style.display = 'flex';
      document.getElementById('gameScreen').style.display = 'none';
      lucide.createIcons();
    }

    function buildBoard() {
      const container = document.getElementById('boardContainer');
      const s = gameState.size;
      const cellSize = s === 3 ? 'min(28vw, 110px)' : s === 4 ? 'min(21vw, 85px)' : 'min(17vw, 70px)';
      const fontSize = s === 3 ? '40px' : s === 4 ? '30px' : '24px';

      let html = `<div class="game-board" style="grid-template-columns:repeat(${s},${cellSize}); justify-content:center;">`;
      for (let i = 0; i < s * s; i++) {
        html += `<div class="cell" data-idx="${i}" onclick="cellClick(${i})" 
          style="width:${cellSize}; height:auto; font-size:${fontSize};"
          role="gridcell" aria-label="Cell ${Math.floor(i/s)+1},${i%s+1}"></div>`;
      }
      html += '</div>';
      container.innerHTML = html;
    }

    function cellClick(idx) {
      if (!gameState || gameState.gameOver) return;
      if (gameState.board[idx] !== null) return;
      if (gameState.opponent === 'bot' && gameState.currentPlayer === gameState.botSymbol) return;

      makeMove(idx, gameState.currentPlayer);

      if (!gameState.gameOver && gameState.opponent === 'bot') {
        setTimeout(botMove, 300);
      }
    }

    function makeMove(idx, symbol) {
      gameState.board[idx] = symbol;
      const cell = document.querySelector(`.cell[data-idx="${idx}"]`);
      const markClass = symbol === 'X' ? 'x-mark' : 'o-mark';
      const display = symbol === 'X' ? '✕' : '○';
      cell.innerHTML = `<span class="mark ${markClass}">${display}</span>`;
      cell.classList.add('taken');

      const win = checkWin(symbol);
      if (win) {
        gameState.gameOver = true;
        gameState.winCells = win;
        scores[symbol]++;
        updateScoreDisplay();
        highlightWin(win);

        const c = getConfig();
        let winnerName;
        if (gameState.opponent === 'bot') {
          winnerName = symbol === gameState.playerSymbol
            ? (symbol === 'X' ? c.player_x_name : c.player_o_name)
            : 'Bot';
        } else {
          winnerName = symbol === 'X' ? c.player_x_name : c.player_o_name;
        }
        showStatus(`🎉 ${winnerName} Menang!`);
        showToast(`${winnerName} Menang! 🏆`);
        spawnConfetti();
        document.getElementById('newRoundBtn').style.display = 'block';
        return;
      }

      if (gameState.board.every(c => c !== null)) {
        gameState.gameOver = true;
        scores.draw++;
        updateScoreDisplay();
        showStatus('🤝 Seri!');
        showToast('Seri! 🤝');
        document.getElementById('newRoundBtn').style.display = 'block';
        return;
      }

      gameState.currentPlayer = symbol === 'X' ? 'O' : 'X';
      updateStatus();
      updateTurnHighlight();
    }

    function updateStatus() {
      const c = getConfig();
      const sym = gameState.currentPlayer === 'X' ? '✕' : '○';
      let name;
      if (gameState.opponent === 'bot') {
        name = gameState.currentPlayer === gameState.playerSymbol
          ? (gameState.playerSymbol === 'X' ? c.player_x_name : c.player_o_name)
          : 'Bot';
      } else {
        name = gameState.currentPlayer === 'X' ? c.player_x_name : c.player_o_name;
      }
      showStatus(`Giliran: ${sym} ${name}`);
      updateTurnHighlight();
    }

    function showStatus(text) {
      document.getElementById('statusBar').textContent = text;
    }

    function updateTurnHighlight() {
      const sx = document.getElementById('scoreX');
      const so = document.getElementById('scoreO');
      sx.classList.toggle('active-turn', gameState.currentPlayer === 'X' && !gameState.gameOver);
      so.classList.toggle('active-turn', gameState.currentPlayer === 'O' && !gameState.gameOver);
    }

    function updateScoreDisplay() {
      document.getElementById('scoreXVal').textContent = scores.X;
      document.getElementById('scoreOVal').textContent = scores.O;
      document.getElementById('scoreDrawVal').textContent = scores.draw;
    }

    function checkWin(symbol) {
      const { size, winLen, board } = gameState;
      const dirs = [[0,1],[1,0],[1,1],[1,-1]];

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (board[r * size + c] !== symbol) continue;
          for (const [dr, dc] of dirs) {
            const cells = [];
            let ok = true;
            for (let k = 0; k < winLen; k++) {
              const nr = r + dr * k, nc = c + dc * k;
              if (nr < 0 || nr >= size || nc < 0 || nc >= size || board[nr * size + nc] !== symbol) {
                ok = false;
                break;
              }
              cells.push(nr * size + nc);
            }
            if (ok) return cells;
          }
        }
      }
      return null;
    }

    function highlightWin(cells) {
      cells.forEach(idx => {
        document.querySelector(`.cell[data-idx="${idx}"]`).classList.add('win-cell');
      });
    }

    function resetGame() {
      gameState.board = Array(gameState.size * gameState.size).fill(null);
      gameState.gameOver = false;
      gameState.winCells = [];
      gameState.currentPlayer = menuSelections.first;
      document.getElementById('newRoundBtn').style.display = 'none';
      buildBoard();
      updateStatus();

      if (gameState.opponent === 'bot' && gameState.currentPlayer === gameState.botSymbol) {
        setTimeout(botMove, 400);
      }
    }

    // ========== BOT AI ==========
    function botMove() {
      if (!gameState || gameState.gameOver) return;
      const { difficulty } = gameState;
      let idx;

      if (difficulty === 'easy') {
        idx = botEasy();
      } else if (difficulty === 'medium') {
        idx = Math.random() < 0.6 ? botSmart() : botEasy();
      } else {
        idx = botSmart();
      }

      if (idx !== null && idx !== undefined) {
        makeMove(idx, gameState.botSymbol);
      }
    }

    function botEasy() {
      const empty = gameState.board.map((v, i) => v === null ? i : -1).filter(i => i >= 0);
      return empty[Math.floor(Math.random() * empty.length)];
    }

    function botSmart() {
      const { board, size, winLen, botSymbol, playerSymbol } = gameState;

      // 1. Win if possible
      const winMove = findWinningMove(botSymbol);
      if (winMove !== null) return winMove;

      // 2. Block player win
      const blockMove = findWinningMove(playerSymbol);
      if (blockMove !== null) return blockMove;

      // 3. Center
      const center = Math.floor(size / 2) * size + Math.floor(size / 2);
      if (board[center] === null) return center;

      // 4. Corners
      const corners = [0, size - 1, (size - 1) * size, size * size - 1].filter(i => board[i] === null);
      if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

      // 5. Random
      return botEasy();
    }

    function findWinningMove(symbol) {
      const { board, size, winLen } = gameState;
      for (let i = 0; i < board.length; i++) {
        if (board[i] !== null) continue;
        board[i] = symbol;
        if (checkWin(symbol)) { board[i] = null; return i; }
        board[i] = null;
      }
      return null;
    }

    // ========== EFFECTS ==========
    function showToast(msg) {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = msg;
      container.innerHTML = '';
      container.appendChild(toast);
      setTimeout(() => { toast.remove(); }, 2800);
    }

    function spawnConfetti() {
      const colors = ['#f59e0b', '#6366f1', '#ec4899', '#10b981', '#f43f5e', '#fbbf24'];
      for (let i = 0; i < 40; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.top = '-10px';
        piece.style.width = (Math.random() * 8 + 4) + 'px';
        piece.style.height = (Math.random() * 8 + 4) + 'px';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        piece.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
        piece.style.animationDelay = (Math.random() * 0.5) + 's';
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 4000);
      }
    }

    // Init
    applyConfig(defaultConfig);
    lucide.createIcons();