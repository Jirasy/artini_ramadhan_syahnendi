 // ==============================
        // GAME DATA & CONSTANTS
        // ==============================

        const PION_EMOJIS = ['🚗', '🚀', '🎩', '🐱', '💎', '🌟', '🎸', '🦄', '⚽', '🍕'];
        const PLAYER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#f97316'];

        const BOARD_CELLS = [
            { name: 'GO', type: 'go', pos: 0 },
            { name: 'Mediterranean Ave', type: 'property', group: 'brown', price: 60, rent: [2, 10, 30, 90, 160, 250], house: 50, pos: 1 },
            { name: 'Community Chest', type: 'chest', pos: 2 },
            { name: 'Baltic Ave', type: 'property', group: 'brown', price: 60, rent: [4, 20, 60, 180, 320, 450], house: 50, pos: 3 },
            { name: 'Income Tax', type: 'tax', amount: 200, pos: 4 },
            { name: 'Reading RR', type: 'railroad', price: 200, pos: 5 },
            { name: 'Oriental Ave', type: 'property', group: 'lightblue', price: 100, rent: [6, 30, 90, 270, 400, 550], house: 50, pos: 6 },
            { name: 'Chance', type: 'chance', pos: 7 },
            { name: 'Vermont Ave', type: 'property', group: 'lightblue', price: 100, rent: [6, 30, 90, 270, 400, 550], house: 50, pos: 8 },
            { name: 'Connecticut Ave', type: 'property', group: 'lightblue', price: 120, rent: [8, 40, 100, 300, 450, 600], house: 50, pos: 9 },
            { name: 'Jail / Visit', type: 'jail', pos: 10 },
            { name: 'St. Charles Pl', type: 'property', group: 'pink', price: 140, rent: [10, 50, 150, 450, 625, 750], house: 100, pos: 11 },
            { name: 'Electric Co', type: 'utility', price: 150, pos: 12 },
            { name: 'States Ave', type: 'property', group: 'pink', price: 140, rent: [10, 50, 150, 450, 625, 750], house: 100, pos: 13 },
            { name: 'Virginia Ave', type: 'property', group: 'pink', price: 160, rent: [12, 60, 180, 500, 700, 900], house: 100, pos: 14 },
            { name: 'Pennsylvania RR', type: 'railroad', price: 200, pos: 15 },
            { name: 'St. James Pl', type: 'property', group: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], house: 100, pos: 16 },
            { name: 'Community Chest', type: 'chest', pos: 17 },
            { name: 'Tennessee Ave', type: 'property', group: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], house: 100, pos: 18 },
            { name: 'New York Ave', type: 'property', group: 'orange', price: 200, rent: [16, 80, 220, 600, 800, 1000], house: 100, pos: 19 },
            { name: 'Free Parking', type: 'parking', pos: 20 },
            { name: 'Kentucky Ave', type: 'property', group: 'red', price: 220, rent: [18, 90, 250, 700, 875, 1050], house: 150, pos: 21 },
            { name: 'Chance', type: 'chance', pos: 22 },
            { name: 'Indiana Ave', type: 'property', group: 'red', price: 220, rent: [18, 90, 250, 700, 875, 1050], house: 150, pos: 23 },
            { name: 'Illinois Ave', type: 'property', group: 'red', price: 240, rent: [20, 100, 300, 750, 925, 1100], house: 150, pos: 24 },
            { name: 'B&O RR', type: 'railroad', price: 200, pos: 25 },
            { name: 'Atlantic Ave', type: 'property', group: 'yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], house: 150, pos: 26 },
            { name: 'Ventnor Ave', type: 'property', group: 'yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], house: 150, pos: 27 },
            { name: 'Water Works', type: 'utility', price: 150, pos: 28 },
            { name: 'Marvin Gdns', type: 'property', group: 'yellow', price: 280, rent: [24, 120, 360, 850, 1025, 1200], house: 150, pos: 29 },
            { name: 'Go To Jail', type: 'gotojail', pos: 30 },
            { name: 'Pacific Ave', type: 'property', group: 'green', price: 300, rent: [26, 130, 390, 900, 1100, 1275], house: 200, pos: 31 },
            { name: 'N. Carolina Ave', type: 'property', group: 'green', price: 300, rent: [26, 130, 390, 900, 1100, 1275], house: 200, pos: 32 },
            { name: 'Community Chest', type: 'chest', pos: 33 },
            { name: 'Pennsylvania Ave', type: 'property', group: 'green', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], house: 200, pos: 34 },
            { name: 'Short Line RR', type: 'railroad', price: 200, pos: 35 },
            { name: 'Chance', type: 'chance', pos: 36 },
            { name: 'Park Place', type: 'property', group: 'darkblue', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], house: 200, pos: 37 },
            { name: 'Luxury Tax', type: 'tax', amount: 100, pos: 38 },
            { name: 'Boardwalk', type: 'property', group: 'darkblue', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], house: 200, pos: 39 }
        ];

        const GROUP_COLORS = {
            brown: '#8B4513', lightblue: '#87CEEB', pink: '#FF69B4', orange: '#FF8C00',
            red: '#FF0000', yellow: '#FFD700', green: '#228B22', darkblue: '#0000CD'
        };

        const GROUP_SIZES = { brown: 2, lightblue: 3, pink: 3, orange: 3, red: 3, yellow: 3, green: 3, darkblue: 2 };

        const CHANCE_CARDS = [
            { text: 'Advance to GO! Collect $200.', action: 'moveto', dest: 0 },
            { text: 'Advance to Illinois Ave.', action: 'moveto', dest: 24 },
            { text: 'Advance to St. Charles Place.', action: 'moveto', dest: 11 },
            { text: 'Bank pays you dividend of $50.', action: 'gain', amount: 50 },
            { text: 'Go to Jail. Do not pass GO.', action: 'jail' },
            { text: 'Pay poor tax of $15.', action: 'pay', amount: 15 },
            { text: 'Advance to Reading Railroad.', action: 'moveto', dest: 5 },
            { text: 'Your building loan matures. Collect $150.', action: 'gain', amount: 150 },
            { text: 'You won a crossword competition! Collect $100.', action: 'gain', amount: 100 },
            { text: 'Go back 3 spaces.', action: 'back3' }
        ];

        const CHEST_CARDS = [
            { text: 'Advance to GO! Collect $200.', action: 'moveto', dest: 0 },
            { text: 'Bank error in your favor. Collect $200.', action: 'gain', amount: 200 },
            { text: 'Doctor fees. Pay $50.', action: 'pay', amount: 50 },
            { text: 'From sale of stock you get $50.', action: 'gain', amount: 50 },
            { text: 'Go to Jail. Do not pass GO.', action: 'jail' },
            { text: 'Holiday fund matures. Collect $100.', action: 'gain', amount: 100 },
            { text: 'Income tax refund. Collect $20.', action: 'gain', amount: 20 },
            { text: 'Life insurance matures. Collect $100.', action: 'gain', amount: 100 },
            { text: 'Pay hospital fees of $100.', action: 'pay', amount: 100 },
            { text: 'You inherit $100.', action: 'gain', amount: 100 }
        ];

        // ==============================
        // GAME STATE
        // ==============================

        let gameState = {
            players: [],
            currentPlayer: 0,
            properties: {}, // pos -> {owner, houses}
            dice: [0, 0],
            doublesCount: 0,
            phase: 'roll', // roll, action, end
            gameOver: false,
            winner: null,
            lastRoll: 0
        };

        let setupState = {
            playerCount: 2,
            mode: 'friends',
            players: []
        };

        // ==============================
        // ELEMENT SDK
        // ==============================

        const defaultConfig = {
            game_title: 'MONOPOLY',
            background_color: '#0a0e1a',
            surface_color: '#141b2d',
            text_color: '#e8eaf0',
            primary_color: '#f0c040',
            secondary_color: '#3b82f6'
        };

        function applyConfig(config) {
            const r = document.documentElement.style;
            r.setProperty('--bg-color', config.background_color || defaultConfig.background_color);
            r.setProperty('--surface-color', config.surface_color || defaultConfig.surface_color);
            r.setProperty('--text-color', config.text_color || defaultConfig.text_color);
            r.setProperty('--primary-color', config.primary_color || defaultConfig.primary_color);
            r.setProperty('--secondary-color', config.secondary_color || defaultConfig.secondary_color);
            document.body.style.background = config.background_color || defaultConfig.background_color;
            document.body.style.color = config.text_color || defaultConfig.text_color;
            const t = document.getElementById('titleText');
            if (t) t.textContent = config.game_title || defaultConfig.game_title;
        }

        if (window.elementSdk) {
            window.elementSdk.init({
                defaultConfig,
                onConfigChange: async (config) => applyConfig(config),
                mapToCapabilities: (config) => ({
                    recolorables: [
                        { get: () => config.background_color || defaultConfig.background_color, set: v => { config.background_color = v; window.elementSdk.setConfig({ background_color: v }); } },
                        { get: () => config.surface_color || defaultConfig.surface_color, set: v => { config.surface_color = v; window.elementSdk.setConfig({ surface_color: v }); } },
                        { get: () => config.text_color || defaultConfig.text_color, set: v => { config.text_color = v; window.elementSdk.setConfig({ text_color: v }); } },
                        { get: () => config.primary_color || defaultConfig.primary_color, set: v => { config.primary_color = v; window.elementSdk.setConfig({ primary_color: v }); } },
                        { get: () => config.secondary_color || defaultConfig.secondary_color, set: v => { config.secondary_color = v; window.elementSdk.setConfig({ secondary_color: v }); } }
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

        // ==============================
        // SCREEN NAVIGATION
        // ==============================

        function showScreen(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }
        function showMenu() { showScreen('menuScreen'); }
        function showRules() { showScreen('rulesScreen'); }

        function showSetup() {
            showScreen('setupScreen');
            setupState = { playerCount: 2, mode: 'friends', players: [] };
            renderSetup();
        }

        // ==============================
        // SETUP LOGIC
        // ==============================

        function renderSetup() {
            // Player count buttons
            const pcDiv = document.getElementById('playerCountBtns');
            pcDiv.innerHTML = '';
            for (let i = 2; i <= 6; i++) {
                const btn = document.createElement('button');
                btn.className = 'btn-secondary flex-1 py-2 text-lg font-bold';
                if (i === setupState.playerCount) {
                    btn.style.borderColor = 'var(--primary-color)';
                    btn.style.background = 'rgba(240,192,64,0.15)';
                    btn.style.color = 'var(--primary-color)';
                }
                btn.textContent = i;
                btn.onclick = () => { setupState.playerCount = i; renderSetup(); };
                pcDiv.appendChild(btn);
            }

            // Mode buttons
            ['friends', 'bots', 'mixed'].forEach(m => {
                const el = document.getElementById('mode' + m.charAt(0).toUpperCase() + m.slice(1));
                if (m === setupState.mode) {
                    el.style.borderColor = 'var(--primary-color)';
                    el.style.background = 'rgba(240,192,64,0.15)';
                } else {
                    el.style.borderColor = 'rgba(255,255,255,0.15)';
                    el.style.background = 'rgba(255,255,255,0.08)';
                }
            });

            // Initialize players
            while (setupState.players.length < setupState.playerCount) {
                const idx = setupState.players.length;
                setupState.players.push({
                    name: setupState.mode === 'bots' ? `Bot ${idx + 1}` : `Player ${idx + 1}`,
                    color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
                    pion: PION_EMOJIS[idx % PION_EMOJIS.length],
                    isBot: setupState.mode === 'bots' ? true : (setupState.mode === 'mixed' ? idx > 0 : false)
                });
            }
            setupState.players.length = setupState.playerCount;

            // Update bot status based on mode
            setupState.players.forEach((p, i) => {
                if (setupState.mode === 'friends') p.isBot = false;
                else if (setupState.mode === 'bots') p.isBot = true;
                else if (setupState.mode === 'mixed') p.isBot = i > 0;
            });
     renderPlayerSetup();
        }

        function renderPlayerSetup() {
            const div = document.getElementById('playersSetup');
            div.innerHTML = '';
            setupState.players.forEach((p, i) => {
                const card = document.createElement('div');
                card.className = 'player-panel anim-fade';
                card.style.animationDelay = (i * 0.1) + 's';

                const isBot = p.isBot;
                const botToggle = setupState.mode === 'mixed' ?
                    `<label class="flex items-center gap-2 text-xs cursor-pointer mt-2">
        <input type="checkbox" ${isBot ? 'checked' : ''} onchange="toggleBot(${i}, this.checked)" class="accent-yellow-400">
        <span>🤖 Bot</span>
      </label>` : (isBot ? '<span class="text-xs opacity-50">🤖 Bot</span>' : '');

                card.innerHTML = `
      <div class="flex items-center gap-3 mb-2">
        <div style="width:36px;height:36px;border-radius:50%;background:${p.color};display:flex;align-items:center;justify-content:center;font-size:18px;">${p.pion}</div>
        <div class="flex-1">
          <input type="text" value="${p.name}" onchange="setupState.players[${i}].name=this.value"
            class="bg-transparent border-b border-white/20 w-full text-sm font-semibold outline-none focus:border-yellow-400 pb-1"
            style="color:var(--text-color);" maxlength="12">
          ${botToggle}
        </div>
      </div>
      <div class="mb-2">
        <span class="text-xs opacity-50 block mb-1">Color</span>
        <div class="flex flex-wrap gap-2">
          ${PLAYER_COLORS.map(c => `<div class="color-option ${c === p.color ? 'selected' : ''}" style="background:${c};" onclick="setPlayerColor(${i},'${c}')"></div>`).join('')}
        </div>
      </div>
      <div>
        <span class="text-xs opacity-50 block mb-1">Token</span>
        <div class="flex flex-wrap gap-2">
          ${PION_EMOJIS.map(e => `<div class="pion-option ${e === p.pion ? 'selected' : ''}" onclick="setPlayerPion(${i},'${e}')">${e}</div>`).join('')}
        </div>
      </div>
    `;
                div.appendChild(card);
            });
        }

        function setMode(m) { setupState.mode = m; renderSetup(); }
        function toggleBot(i, v) { setupState.players[i].isBot = v; renderPlayerSetup(); }
        function setPlayerColor(i, c) { setupState.players[i].color = c; renderPlayerSetup(); }
        function setPlayerPion(i, e) { setupState.players[i].pion = e; renderPlayerSetup(); }

        // ==============================
        // GAME INITIALIZATION
        // ==============================

        function startGame() {
            gameState = {
                players: setupState.players.map((p, i) => ({
                    ...p, id: i, money: 1500, position: 0, inJail: false, jailTurns: 0,
                    bankrupt: false, properties: [], getOutOfJailCards: 0
                })),
                currentPlayer: 0,
                properties: {},
                dice: [0, 0],
                doublesCount: 0,
                phase: 'roll',
                gameOver: false,
                winner: null,
                lastRoll: 0
            };

            showScreen('gameScreen');
            buildBoard();
            renderGame();

            // If first player is bot, auto-play
            setTimeout(() => checkBotTurn(), 500);
        }

        // ==============================
        // BOARD RENDERING
        // ==============================

        function buildBoard() {
            const container = document.getElementById('boardContainer');
            container.innerHTML = '';

            const N = 11; // cells per side
            const cellPercent = 100 / N;
            const cornerSize = cellPercent;
            const sideSize = cellPercent;

            // Create cells
            BOARD_CELLS.forEach((cell, i) => {
                const div = document.createElement('div');
                div.className = 'board-cell';
                div.id = 'cell-' + i;
                div.onclick = () => showCellInfo(i);

                const pos = getCellPosition(i, N, cellPercent);
                div.style.left = pos.x + '%';
                div.style.top = pos.y + '%';
                div.style.width = pos.w + '%';
                div.style.height = pos.h + '%';

                // Color bar for properties
                if (cell.type === 'property' && GROUP_COLORS[cell.group]) {
                    const bar = document.createElement('div');
                    bar.className = 'color-bar';
                    bar.style.background = GROUP_COLORS[cell.group];
                    div.appendChild(bar);
                }

                // Cell content
                const icon = getCellIcon(cell);
                const nameDiv = document.createElement('div');
                nameDiv.className = 'cell-name';
                nameDiv.innerHTML = icon;
                div.appendChild(nameDiv);

                if (cell.price) {
                    const priceDiv = document.createElement('div');
                    priceDiv.className = 'cell-price';
                    priceDiv.textContent = '$' + cell.price;
                    div.appendChild(priceDiv);
                }

                container.appendChild(div);
            });

            // Center area
            const center = document.createElement('div');
            center.style.cssText = `position:absolute; left:${cornerSize}%; top:${cornerSize}%; width:${100 - 2 * cornerSize}%; height:${100 - 2 * cornerSize}%; display:flex; align-items:center; justify-content:center; flex-direction:column; pointer-events:none;`;
            center.innerHTML = `<div class="font-display text-xl md:text-3xl font-black" style="color:var(--primary-color); opacity:0.3;">MONOPOLY</div>`;
            container.appendChild(center);
        }

        function getCellPosition(index, N, size) {
            // Bottom row (0-10): right to left
            if (index <= 10) {
                return { x: (N - 1 - index) * size, y: (N - 1) * size, w: size, h: size };
            }
            // Left column (11-19): bottom to top
            if (index <= 19) {
                return { x: 0, y: (N - 1 - (index - 10)) * size, w: size, h: size };
            }
            // Top row (20-30): left to right
            if (index <= 30) {
                return { x: (index - 20) * size, y: 0, w: size, h: size };
            }
            // Right column (31-39): top to bottom
            return { x: (N - 1) * size, y: (index - 30) * size, w: size, h: size };
        }

        function getCellIcon(cell) {
            switch (cell.type) {
                case 'go': return '→GO';
                case 'chest': return '📦';
                case 'chance': return '❓';
                case 'tax': return '💰';
                case 'jail': return '🔒';
                case 'parking': return '🅿️';
                case 'gotojail': return '👮';
                case 'railroad': return '🚂';
                case 'utility': return cell.name.includes('Electric') ? '💡' : '💧';
                case 'property': return cell.name.split(' ')[0].substring(0, 6);
                default: return cell.name.substring(0, 6);
            }
        }

        // ==============================
        // GAME RENDERING
        // ==============================

        function renderGame() {
            renderPlayerTokens();
            renderPlayerPanels();
            renderActionArea();
            updateTurnIndicator();
            renderPropertyOwnership();
        }

        function renderPlayerTokens() {
            // Remove old tokens
            document.querySelectorAll('.player-token').forEach(t => t.remove());
            const container = document.getElementById('boardContainer');

            const positionCounts = {};
            gameState.players.forEach(p => {
                if (p.bankrupt) return;
                if (!positionCounts[p.position]) positionCounts[p.position] = [];
                positionCounts[p.position].push(p);
            });

            Object.entries(positionCounts).forEach(([pos, players]) => {
                const cell = document.getElementById('cell-' + pos);
                if (!cell) return;

                players.forEach((p, idx) => {
                    const token = document.createElement('div');
                    token.className = 'player-token';
                    token.style.background = p.color;
                    token.textContent = '';
                    token.title = p.name;

                    // Offset multiple tokens
                    const offsets = getTokenOffsets(players.length, idx);
                    const cellRect = cell.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();

                    const cx = cell.offsetLeft + cell.offsetWidth / 2 + offsets.x - 7;
                    const cy = cell.offsetTop + cell.offsetHeight / 2 + offsets.y - 7;

                    token.style.left = cx + 'px';
                    token.style.top = cy + 'px';
                    container.appendChild(token);
                });
            });
        }

        function getTokenOffsets(total, index) {
            if (total === 1) return { x: 0, y: 0 };
            const angle = (2 * Math.PI / total) * index;
            return { x: Math.cos(angle) * 8, y: Math.sin(angle) * 8 };
        }

        function renderPropertyOwnership() {
            BOARD_CELLS.forEach((cell, i) => {
                const div = document.getElementById('cell-' + i);
                if (!div) return;
                const prop = gameState.properties[i];
                if (prop && prop.owner !== undefined) {
                    const owner = gameState.players[prop.owner];
                    div.style.boxShadow = `inset 0 -3px 0 ${owner.color}`;
                } else {
                    div.style.boxShadow = 'none';
                }
            });
        }

        function renderPlayerPanels() {
            const div = document.getElementById('playerPanels');
            div.innerHTML = '';

            gameState.players.forEach((p, i) => {
                if (p.bankrupt) return;
                const panel = document.createElement('div');
                panel.className = 'player-panel' + (i === gameState.currentPlayer ? ' active-player' : '');

                const props = Object.entries(gameState.properties)
                    .filter(([_, v]) => v.owner === i)
                    .map(([pos]) => BOARD_CELLS[pos]);

                const propBadges = props.map(pr =>
                    pr.group ? `<span class="prop-badge" style="background:${GROUP_COLORS[pr.group] || '#666'}" title="${pr.name}"></span>` : ''
                ).join('');

                panel.innerHTML = `
      <div class="flex items-center gap-2">
        <div style="width:28px;height:28px;border-radius:50%;background:${p.color};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">${p.pion}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1">
            <span class="text-sm font-bold truncate">${p.name}</span>
            ${p.isBot ? '<span class="text-xs opacity-40">🤖</span>' : ''}
            ${p.inJail ? '<span class="text-xs">🔒</span>' : ''}
          </div>
          <div class="text-xs font-bold" style="color:var(--primary-color);">$${p.money.toLocaleString()}</div>
        </div>
      </div>
      ${propBadges ? `<div class="flex flex-wrap mt-1">${propBadges}</div>` : ''}
    `;
                div.appendChild(panel);
            });
        }

        function updateTurnIndicator() {
            const p = gameState.players[gameState.currentPlayer];
            document.getElementById('turnIndicator').innerHTML = `
    <span style="color:${p.color};">${p.pion} ${p.name}</span>'s Turn
  `;
        }

        function renderActionArea() {
            const area = document.getElementById('actionArea');
            const p = gameState.players[gameState.currentPlayer];

            if (gameState.gameOver) {
                area.innerHTML = `
      <div class="text-center">
        <div class="text-2xl mb-2">🏆</div>
        <div class="text-lg font-bold" style="color:var(--primary-color);">${gameState.winner.name} Wins!</div>
        <button onclick="showMenu()" class="btn-primary w-full mt-3">Back to Menu</button>
      </div>`;
                return;
            }

            if (gameState.phase === 'roll') {
                area.innerHTML = `
      <div class="flex items-center gap-3 justify-center">
        ${renderDice(gameState.dice[0], gameState.dice[1])}
      </div>
      <button id="rollBtn" onclick="rollDice()" class="btn-primary w-full mt-3 flex items-center justify-center gap-2">
        🎲 Roll Dice
      </button>
      ${canBuildHouse(p) ? `<button onclick="showBuildMenu()" class="btn-secondary w-full mt-2 text-sm">🏗️ Build Houses</button>` : ''}
    `;
            } else if (gameState.phase === 'action') {
                // action is handled by modals
                area.innerHTML = `
      <div class="flex items-center gap-3 justify-center">
        ${renderDice(gameState.dice[0], gameState.dice[1])}
      </div>
      <div class="text-center text-sm mt-2 opacity-60">Waiting for action...</div>
    `;
            } else if (gameState.phase === 'end') {
                area.innerHTML = `
      <div class="flex items-center gap-3 justify-center">
        ${renderDice(gameState.dice[0], gameState.dice[1])}
      </div>
      <button onclick="endTurn()" class="btn-primary w-full mt-3">End Turn</button>
      ${canBuildHouse(p) ? `<button onclick="showBuildMenu()" class="btn-secondary w-full mt-2 text-sm">🏗️ Build Houses</button>` : ''}
    `;
            }
        }

        function renderDice(d1, d2) {
            if (!d1 && !d2) return '<div class="text-center text-sm opacity-40">Roll the dice!</div>';
            return `<div class="flex gap-3 justify-center">${renderDiceFace(d1)}${renderDiceFace(d2)}</div>`;
        }

        function renderDiceFace(val) {
            const patterns = {
                1: [0, 0, 0, 0, 1, 0, 0, 0, 0],
                2: [0, 0, 1, 0, 0, 0, 1, 0, 0],
                3: [0, 0, 1, 0, 1, 0, 1, 0, 0],
                4: [1, 0, 1, 0, 0, 0, 1, 0, 1],
                5: [1, 0, 1, 0, 1, 0, 1, 0, 1],
                6: [1, 0, 1, 1, 0, 1, 1, 0, 1]
            };
            const p = patterns[val] || patterns[1];
            return `<div class="dice-face" style="grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);">
    ${p.map(d => d ? '<div class="dice-dot"></div>' : '<div></div>').join('')}
  </div>`;
        }

        // ==============================
        // GAME LOGIC
        // ==============================

        function rollDice() {
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            gameState.dice = [d1, d2];
            gameState.lastRoll = d1 + d2;

            const isDoubles = d1 === d2;
            const p = gameState.players[gameState.currentPlayer];

            // Animate dice
            const btn = document.getElementById('rollBtn');
            if (btn) btn.disabled = true;

            renderActionArea();

            setTimeout(() => {
                if (isDoubles) gameState.doublesCount++;
                else gameState.doublesCount = 0;

                // Three doubles = jail
                if (gameState.doublesCount >= 3) {
                    goToJail(p);
                    gameState.phase = 'end';
                    gameState.doublesCount = 0;
                    showToast(`${p.name} rolled 3 doubles! Go to Jail! 🔒`);
                    renderGame();
                    setTimeout(() => checkBotTurn(), 1000);
                    return;
                }

                // In jail logic
                if (p.inJail) {
                    if (isDoubles) {
                        p.inJail = false;
                        p.jailTurns = 0;
                        showToast(`${p.name} rolled doubles and escaped jail! 🎉`);
                        movePlayer(p, d1 + d2);
                    } else {
                        p.jailTurns++;
                        if (p.jailTurns >= 3) {
                            p.money -= 50;
                            p.inJail = false;
                            p.jailTurns = 0;
                            showToast(`${p.name} paid $50 and left jail.`);
                            movePlayer(p, d1 + d2);
                        } else {
                            showToast(`${p.name} is still in jail. (Attempt ${p.jailTurns}/3)`);
                            gameState.phase = 'end';
                            renderGame();
                            setTimeout(() => checkBotTurn(), 1200);
                            return;
                        }
                    }
                } else {
                    movePlayer(p, d1 + d2);
                }
            }, 600);
        }

        function movePlayer(player, steps) {
            const oldPos = player.position;
            const newPos = (oldPos + steps) % 40;

            // Check passing GO
            if (newPos < oldPos && newPos !== 0) {
                player.money += 200;
                showToast(`${player.name} passed GO! +$200 💵`);
            }

            player.position = newPos;
            renderGame();

            setTimeout(() => handleLanding(player), 400);
        }

        function movePlayerTo(player, dest, collectGo = true) {
            if (collectGo && dest < player.position && dest !== player.position) {
                player.money += 200;
                showToast(`${player.name} passed GO! +$200 💵`);
            }
            player.position = dest;
            renderGame();
            setTimeout(() => handleLanding(player), 400);
        }

        function handleLanding(player) {
            const cell = BOARD_CELLS[player.position];

            switch (cell.type) {
                case 'property':
                case 'railroad':
                case 'utility':
                    handlePropertyLanding(player, cell);
                    break;
                case 'tax':
                    player.money -= cell.amount;
                    showToast(`${player.name} pays $${cell.amount} tax! 💰`);
                    checkBankruptcy(player);
                    gameState.phase = 'end';
                    renderGame();
                    setTimeout(() => checkBotTurn(), 1000);
                    break;
                case 'gotojail':
                    goToJail(player);
                    gameState.phase = 'end';
                    showToast(`${player.name} goes to Jail! 👮`);
                    renderGame();
                    setTimeout(() => checkBotTurn(), 1000);
                    break;
                case 'chance':
                    drawCard(player, 'chance');
                    break;
                case 'chest':
                    drawCard(player, 'chest');
                    break;
                default:
                    gameState.phase = 'end';
                    renderGame();
                    setTimeout(() => checkBotTurn(), 800);
                    break;
            }
        }
         function handlePropertyLanding(player, cell) {
            const prop = gameState.properties[cell.pos];

            if (!prop) {
                // Unowned - offer to buy
                if (player.money >= cell.price) {
                    gameState.phase = 'action';
                    renderGame();
                    if (player.isBot) {
                        setTimeout(() => botBuyDecision(player, cell), 800);
                    } else {
                        showBuyModal(player, cell);
                    }
                } else {
                    showToast(`${player.name} can't afford ${cell.name}!`);
                    gameState.phase = 'end';
                    renderGame();
                    setTimeout(() => checkBotTurn(), 800);
                }
            } else if (prop.owner !== player.id) {
                // Pay rent
                const rent = calculateRent(cell, prop);
                const owner = gameState.players[prop.owner];
                if (!owner.bankrupt) {
                    player.money -= rent;
                    owner.money += rent;
                    showToast(`${player.name} pays $${rent} rent to ${owner.name}!`);
                    checkBankruptcy(player);
                }
                gameState.phase = 'end';
                renderGame();
                setTimeout(() => checkBotTurn(), 1000);
            } else {
                // Own property
                gameState.phase = 'end';
                renderGame();
                setTimeout(() => checkBotTurn(), 500);
            }
        }

        function calculateRent(cell, prop) {
            if (cell.type === 'railroad') {
                const rrCount = Object.entries(gameState.properties)
                    .filter(([pos, p]) => p.owner === prop.owner && BOARD_CELLS[pos].type === 'railroad').length;
                return 25 * Math.pow(2, rrCount - 1);
            }
            if (cell.type === 'utility') {
                const utilCount = Object.entries(gameState.properties)
                    .filter(([pos, p]) => p.owner === prop.owner && BOARD_CELLS[pos].type === 'utility').length;
                return gameState.lastRoll * (utilCount === 2 ? 10 : 4);
            }
            // Property
            const houses = prop.houses || 0;
            return cell.rent[houses] || cell.rent[0];
        }

        function goToJail(player) {
            player.position = 10;
            player.inJail = true;
            player.jailTurns = 0;
        }

        function drawCard(player, type) {
            const deck = type === 'chance' ? CHANCE_CARDS : CHEST_CARDS;
            const card = deck[Math.floor(Math.random() * deck.length)];

            showCardModal(player, card, type);
        }

        function applyCard(player, card) {
            switch (card.action) {
                case 'moveto':
                    movePlayerTo(player, card.dest);
                    return; // handleLanding will set phase
                case 'gain':
                    player.money += card.amount;
                    break;
                case 'pay':
                    player.money -= card.amount;
                    checkBankruptcy(player);
                    break;
                case 'jail':
                    goToJail(player);
                    break;
                case 'back3':
                    const newPos = (player.position - 3 + 40) % 40;
                    player.position = newPos;
                    renderGame();
                    setTimeout(() => handleLanding(player), 400);
                    return;
            }
            gameState.phase = 'end';
            renderGame();
            setTimeout(() => checkBotTurn(), 800);
        }

        function checkBankruptcy(player) {
            if (player.money < 0) {
                player.bankrupt = true;
                // Return properties
                Object.entries(gameState.properties).forEach(([pos, prop]) => {
                    if (prop.owner === player.id) delete gameState.properties[pos];
                });
                showToast(`${player.name} is bankrupt! 💸`);

                // Check win condition
                const alive = gameState.players.filter(p => !p.bankrupt);
                if (alive.length === 1) {
                    gameState.gameOver = true;
                    gameState.winner = alive[0];
                    renderGame();
                }
            }
        }

        function endTurn() {
            if (gameState.gameOver) return;

            const currentPlayer = gameState.players[gameState.currentPlayer];
            const isDoubles = gameState.dice[0] === gameState.dice[1] && gameState.dice[0] > 0;

            if (isDoubles && gameState.doublesCount > 0 && !currentPlayer.inJail) {
                // Roll again for doubles
                gameState.dice = [0, 0]; // Reset dice display
                gameState.phase = 'roll';
                renderGame();
                setTimeout(() => checkBotTurn(), 500);
                return;
            }

            gameState.doublesCount = 0;
            gameState.dice = [0, 0]; // Reset dice display

            // Next alive player
            let next = (gameState.currentPlayer + 1) % gameState.players.length;
            let safety = 0;
            while (gameState.players[next].bankrupt && safety < gameState.players.length) {
                next = (next + 1) % gameState.players.length;
                safety++;
            }
            gameState.currentPlayer = next;
            gameState.phase = 'roll';
            renderGame();

            setTimeout(() => checkBotTurn(), 600);
        }

        // ==============================
        // BUILDING HOUSES
        // ==============================

        function canBuildHouse(player) {
            const groups = {};
            Object.entries(gameState.properties).forEach(([pos, prop]) => {
                if (prop.owner === player.id) {
                    const cell = BOARD_CELLS[pos];
                    if (cell.group) {
                        if (!groups[cell.group]) groups[cell.group] = [];
                        groups[cell.group].push({ pos: parseInt(pos), prop, cell });
                    }
                }
            });

            return Object.entries(groups).some(([group, props]) =>
                props.length === GROUP_SIZES[group] && props.some(p => (p.prop.houses || 0) < 5)
            );
        }

        function showBuildMenu() {
            const player = gameState.players[gameState.currentPlayer];
            const groups = {};
            Object.entries(gameState.properties).forEach(([pos, prop]) => {
                if (prop.owner === player.id) {
                    const cell = BOARD_CELLS[pos];
                    if (cell.group) {
                        if (!groups[cell.group]) groups[cell.group] = [];
                        groups[cell.group].push({ pos: parseInt(pos), prop, cell });
                    }
                }
            });

            let html = `<h3 class="font-display text-xl font-bold mb-4" style="color:var(--primary-color);">🏗️ Build Houses</h3>`;

            let hasComplete = false;
            Object.entries(groups).forEach(([group, props]) => {
                if (props.length !== GROUP_SIZES[group]) return;
                hasComplete = true;

                html += `<div class="mb-4 p-3 rounded-lg" style="background:rgba(255,255,255,0.05);">
      <div class="flex items-center gap-2 mb-2">
        <div style="width:16px;height:16px;border-radius:4px;background:${GROUP_COLORS[group]};"></div>
        <span class="text-sm font-bold">${group.charAt(0).toUpperCase() + group.slice(1)}</span>
      </div>`;

                props.forEach(p => {
                    const houses = p.prop.houses || 0;
                    const cost = p.cell.house;
                    const canBuild = houses < 5 && player.money >= cost;
                    html += `<div class="flex items-center justify-between py-1">
        <span class="text-xs">${p.cell.name} (${houses === 5 ? '🏨' : '🏠'.repeat(houses) || 'no houses'})</span>
        ${canBuild ? `<button onclick="buildHouse(${p.pos})" class="btn-primary text-xs py-1 px-2">+$${cost}</button>` : '<span class="text-xs opacity-40">Max</span>'}
      </div>`;
                });

                html += `</div>`;
            });

            if (!hasComplete) {
                html += `<p class="text-sm opacity-60">You need all properties of one color group to build houses.</p>`;
            }

            html += `<button onclick="closeModal()" class="btn-secondary w-full mt-2">Close</button>`;
            showModal(html);
        }

        function buildHouse(pos) {
            const player = gameState.players[gameState.currentPlayer];
            const prop = gameState.properties[pos];
            const cell = BOARD_CELLS[pos];

            if (!prop || prop.owner !== player.id) return;
            if ((prop.houses || 0) >= 5) return;
            if (player.money < cell.house) return;

            prop.houses = (prop.houses || 0) + 1;
            player.money -= cell.house;

            showToast(`Built house on ${cell.name}! 🏠`);
            renderGame();
            showBuildMenu(); // refresh modal
        }
         // ==============================
        // BOT AI
        // ==============================

        function checkBotTurn() {
            if (gameState.gameOver) return;
            const p = gameState.players[gameState.currentPlayer];
            if (!p.isBot || p.bankrupt) return;

            if (gameState.phase === 'roll') {
                setTimeout(() => rollDice(), 800);
            } else if (gameState.phase === 'end') {
                // Bot tries to build houses
                if (canBuildHouse(p)) botBuildHouses(p);
                setTimeout(() => endTurn(), 600);
            }
        }

        function botBuyDecision(player, cell) {
            // Bot buys if it can afford and has > $200 left
            const willBuy = player.money - cell.price > 150;
            if (willBuy) {
                buyProperty(player, cell);
            } else {
                showToast(`${player.name} passes on ${cell.name}.`);
                gameState.phase = 'end';
                renderGame();
                setTimeout(() => checkBotTurn(), 600);
            }
            closeModal();
        }

        function botBuildHouses(player) {
            const groups = {};
            Object.entries(gameState.properties).forEach(([pos, prop]) => {
                if (prop.owner === player.id) {
                    const cell = BOARD_CELLS[pos];
                    if (cell.group) {
                        if (!groups[cell.group]) groups[cell.group] = [];
                        groups[cell.group].push({ pos: parseInt(pos), prop, cell });
                    }
                }
            });

            Object.entries(groups).forEach(([group, props]) => {
                if (props.length !== GROUP_SIZES[group]) return;
                // Build evenly
                let built = true;
                while (built) {
                    built = false;
                    const minHouses = Math.min(...props.map(p => p.prop.houses || 0));
                    for (const p of props) {
                        if ((p.prop.houses || 0) === minHouses && minHouses < 5 && player.money - p.cell.house > 100) {
                            p.prop.houses = (p.prop.houses || 0) + 1;
                            player.money -= p.cell.house;
                            built = true;
                            break;
                        }
                    }
                }
            });
        }

        // ==============================
        // MODALS
        // ==============================

        function showModal(html) {
            document.getElementById('modalContent').innerHTML = html;
            document.getElementById('modalOverlay').style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('modalOverlay').style.display = 'none';
        }

        function showBuyModal(player, cell) {
            const groupColor = cell.group ? GROUP_COLORS[cell.group] : '#666';
            showModal(`
    <div class="property-card mb-4">
      ${cell.group ? `<div style="background:${groupColor};height:40px;display:flex;align-items:center;justify-content:center;" class="font-bold text-sm text-white">${cell.name}</div>` : ''}
      <div class="p-3 text-center" style="background:rgba(255,255,255,0.03);">
        <div class="text-2xl mb-1">${cell.type === 'railroad' ? '🚂' : cell.type === 'utility' ? (cell.name.includes('Electric') ? '💡' : '💧') : '🏠'}</div>
        <div class="text-lg font-bold">${cell.name}</div>
        <div class="text-xl font-black mt-2" style="color:var(--primary-color);">$${cell.price}</div>
        ${cell.rent ? `<div class="text-xs opacity-60 mt-1">Rent: $${cell.rent[0]}</div>` : ''}
      </div>
    </div>
    <div class="flex gap-3">
      <button onclick="passBuy()" class="btn-secondary flex-1">Pass</button>
      <button onclick="buyProperty(gameState.players[gameState.currentPlayer], BOARD_CELLS[${cell.pos}]); closeModal();" class="btn-primary flex-1">Buy</button>
    </div>
    <div class="text-xs text-center mt-2 opacity-50">Balance: $${player.money.toLocaleString()}</div>
  `);
        }

        function buyProperty(player, cell) {
            player.money -= cell.price;
            gameState.properties[cell.pos] = { owner: player.id, houses: 0 };
            showToast(`${player.name} bought ${cell.name}! 🎉`);
            gameState.phase = 'end';
            renderGame();
            setTimeout(() => checkBotTurn(), 600);
        }

        function passBuy() {
            closeModal();
            gameState.phase = 'end';
            renderGame();
            setTimeout(() => checkBotTurn(), 500);
        }

        function showCardModal(player, card, type) {
            gameState.phase = 'action';
            renderGame();

            const emoji = type === 'chance' ? '❓' : '📦';
            const title = type === 'chance' ? 'Chance' : 'Community Chest';

            if (player.isBot) {
                showToast(`${player.name}: ${card.text}`);
                setTimeout(() => applyCard(player, card), 1000);
                return;
            }

            showModal(`
    <div class="text-center">
      <div class="text-4xl mb-3">${emoji}</div>
      <div class="font-bold text-lg mb-2" style="color:var(--primary-color);">${title}</div>
      <p class="text-sm mb-4">${card.text}</p>
      <button onclick="closeModal(); applyCard(gameState.players[gameState.currentPlayer], ${JSON.stringify(card).replace(/"/g, '&quot;')});" class="btn-primary w-full">OK</button>
    </div>
  `);
        }

        function showCellInfo(pos) {
            const cell = BOARD_CELLS[pos];
            const prop = gameState.properties[pos];

            let html = `<div class="text-center">`;

            if (cell.group) {
                html += `<div style="background:${GROUP_COLORS[cell.group]};height:30px;border-radius:8px 8px 0 0;margin:-24px -24px 16px;"></div>`;
            }

            html += `<div class="text-2xl mb-2">${getCellIcon(cell)}</div>`;
            html += `<div class="text-lg font-bold mb-1">${cell.name}</div>`;

            if (cell.price) {
                html += `<div class="text-sm" style="color:var(--primary-color);">Price: $${cell.price}</div>`;
            }

            if (prop && prop.owner !== undefined) {
                const owner = gameState.players[prop.owner];
                html += `<div class="mt-2 p-2 rounded-lg" style="background:${owner.color}22;border:1px solid ${owner.color}44;">
      <span class="text-sm">Owner: ${owner.pion} ${owner.name}</span>
      ${prop.houses ? `<br><span class="text-xs">${prop.houses === 5 ? '🏨 Hotel' : '🏠'.repeat(prop.houses) + ' house(s)'}</span>` : ''}
    </div>`;
            }

            if (cell.rent) {
                html += `<div class="mt-3 text-left text-xs space-y-1">
      <div class="font-bold mb-1">Rent:</div>
      ${cell.rent.map((r, i) => `<div class="flex justify-between"><span>${i === 0 ? 'Base' : i === 5 ? 'Hotel' : i + ' house(s)'}</span><span>$${r}</span></div>`).join('')}
      ${cell.house ? `<div class="flex justify-between mt-1 pt-1 border-t border-white/10"><span>House cost</span><span>$${cell.house}</span></div>` : ''}
    </div>`;
            }

            html += `</div><button onclick="closeModal()" class="btn-secondary w-full mt-4">Close</button>`;
            showModal(html);
        }

        // ==============================
        // UTILITY
        // ==============================

        function showToast(msg) {
            const existing = document.querySelector('.toast');
            if (existing) existing.remove();

            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = msg;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        }

        function confirmQuit() {
            document.getElementById('quitOverlay').style.display = 'flex';
        }

        function quitGame() {
            document.getElementById('quitOverlay').style.display = 'none';
            showMenu();
        }

        function toggleInfo() {
            const p = gameState.players[gameState.currentPlayer];
            let propsHtml = '';

            gameState.players.filter(pl => !pl.bankrupt).forEach(pl => {
                const owned = Object.entries(gameState.properties)
                    .filter(([_, v]) => v.owner === pl.id)
                    .map(([pos, v]) => ({ cell: BOARD_CELLS[pos], houses: v.houses }));

                propsHtml += `<div class="mb-3">
      <div class="flex items-center gap-2 mb-1">
        <div style="width:20px;height:20px;border-radius:50%;background:${pl.color};display:flex;align-items:center;justify-content:center;font-size:10px;">${pl.pion}</div>
        <span class="text-sm font-bold">${pl.name}</span>
        <span class="text-xs" style="color:var(--primary-color);">$${pl.money.toLocaleString()}</span>
      </div>
      ${owned.length ? owned.map(o => `<div class="text-xs ml-6 flex items-center gap-1">
        ${o.cell.group ? `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${GROUP_COLORS[o.cell.group]};"></span>` : ''}
        ${o.cell.name} ${o.houses ? (o.houses === 5 ? '🏨' : '🏠'.repeat(o.houses)) : ''}
      </div>`).join('') : '<div class="text-xs ml-6 opacity-40">No properties</div>'}
    </div>`;
            });

            showModal(`
    <h3 class="font-display text-xl font-bold mb-3" style="color:var(--primary-color);">📊 Game Info</h3>
    ${propsHtml}
    <button onclick="closeModal()" class="btn-secondary w-full mt-2">Close</button>
  `);
        }

        // Init icons
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
            applyConfig(defaultConfig);
        });