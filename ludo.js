 // ============ GAME STATE ============
        const COLORS = ['#E53935', '#43A047', '#1E88E5', '#FDD835'];
        const COLOR_NAMES = ['Merah', 'Hijau', 'Biru', 'Kuning'];
        const COLOR_LIGHT = ['#FFCDD2', '#C8E6C9', '#BBDEFB', '#FFF9C4'];
        const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47]; // star positions on the main track (52 cells)

        let playerCount = 4;
        let gameMode = 'pvp'; // pvp or ai
        let players = [];
        let currentPlayer = 0;
        let diceValue = 0;
        let diceRolled = false;
        let consecutiveSixes = 0;
        let moveHistory = [];
        let gameActive = false;
        let finishOrder = [];

        // Board path mapping - 52 cells clockwise
        // Each cell: {row, col} on the 15x15 grid
        const MAIN_PATH = [];
        const HOME_ENTRIES = []; // index on MAIN_PATH where each color's home column starts
        const HOME_PATHS = [[], [], [], []]; // 6 cells each color's home stretch
        const START_POS = [0, 13, 26, 39]; // starting position index on main path for each color

        function buildBoard() {
            // Build the 52-cell main path clockwise starting from red's start
            const p = [
                // Red start: going up from (13,6) 
                { r: 13, c: 6 }, { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 },
                // row 8, cols 5 to 0 (going left)
                { r: 8, c: 5 }, { r: 8, c: 4 }, { r: 8, c: 3 }, { r: 8, c: 2 }, { r: 8, c: 1 }, { r: 8, c: 0 },
                // col 0, row 7
                { r: 7, c: 0 },
                // row 6, cols 0 to 5 (going right)
                { r: 6, c: 0 }, { r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },
                // col 6, rows 5 to 1 (going up)
                { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 6 }, { r: 2, c: 6 }, { r: 1, c: 6 },
                // corner turn
                { r: 0, c: 6 },
                // row 0, col 7 to 8
                { r: 0, c: 7 }, { r: 0, c: 8 },
                // col 8, rows 1 to 5 (going down)
                { r: 1, c: 8 }, { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 },
                // row 6, cols 9 to 14 (going right)
                { r: 6, c: 9 }, { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },
                // corner
                { r: 7, c: 14 },
                // row 8, cols 14 to 9 (going left)
                { r: 8, c: 14 }, { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 9 },
                // col 8, rows 9 to 13 (going down)
                { r: 9, c: 8 }, { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 }, { r: 13, c: 8 },
                // corner
                { r: 14, c: 8 },
                // row 14, col 7 to 6
                { r: 14, c: 7 }, { r: 14, c: 6 }
            ];

            MAIN_PATH.length = 0;
            p.forEach(x => MAIN_PATH.push(x));

            // Home paths (6 cells each toward center)
            HOME_PATHS[0] = [{ r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 }, { r: 8, c: 7 }];
            HOME_PATHS[1] = [{ r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 }];
            HOME_PATHS[2] = [{ r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }, { r: 6, c: 7 }];
            HOME_PATHS[3] = [{ r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 }, { r: 7, c: 8 }];
        }

        // Player start positions on main path
        const COLOR_START = [0, 13, 26, 39];
        // Home entry: the cell BEFORE entering home path
        const HOME_ENTRY = [51, 12, 25, 38];

        function createPlayer(index, name, color, isAI, avatar) {
            return {
                index,
                name: name || COLOR_NAMES[index],
                color: COLORS[index],
                colorName: COLOR_NAMES[index],
                isAI: isAI,
                avatar: avatar || null,
                pawns: [
                    { id: `p${index}_0`, state: 'home', mainPos: -1, homePos: -1, steps: 0 },
                    { id: `p${index}_1`, state: 'home', mainPos: -1, homePos: -1, steps: 0 },
                    { id: `p${index}_2`, state: 'home', mainPos: -1, homePos: -1, steps: 0 },
                    { id: `p${index}_3`, state: 'home', mainPos: -1, homePos: -1, steps: 0 }
                ],
                finished: 0,
                captures: 0,
                totalMoves: 0
            };
        }

        // ============ SETUP ============
        let setupPlayers = [];

        function setPlayerCount(n) {
            playerCount = n;
            document.querySelectorAll('#playerCountBtns button').forEach(b => {
                const active = parseInt(b.dataset.count) === n;
                b.className = `px-4 py-2 rounded-lg text-sm font-bold transition ${active ? 'text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`;
                if (active) b.style.background = 'var(--accent)'; else b.style.background = '';
            });
            buildPlayerCards();
        }

        function setGameMode(mode) {
            gameMode = mode;
            const pvp = document.getElementById('btnPvP');
            const ai = document.getElementById('btnAI');
            pvp.className = `flex-1 min-w-[120px] py-3 rounded-lg text-sm font-bold transition border-2 ${mode === 'pvp' ? 'border-indigo-500 text-white' : 'border-transparent bg-slate-700 text-slate-300 hover:bg-slate-600'}`;
            ai.className = `flex-1 min-w-[120px] py-3 rounded-lg text-sm font-bold transition border-2 ${mode === 'ai' ? 'border-indigo-500 text-white' : 'border-transparent bg-slate-700 text-slate-300 hover:bg-slate-600'}`;
            if (mode === 'pvp') pvp.style.background = 'var(--accent)'; else pvp.style.background = '';
            if (mode === 'ai') ai.style.background = 'var(--accent)'; else ai.style.background = '';
            buildPlayerCards();
        }

        function buildPlayerCards() {
            const cont = document.getElementById('playerSetupCards');
            cont.innerHTML = '';
            setupPlayers = [];
            for (let i = 0; i < playerCount; i++) {
                const isAI = gameMode === 'ai' && i > 0;
                const sp = { name: isAI ? `AI ${COLOR_NAMES[i]}` : '', colorIndex: i, isAI, avatar: null };
                setupPlayers.push(sp);
                const card = document.createElement('div');
                card.className = 'player-card rounded-xl p-3 md:p-4 flex items-center gap-3 slide-in';
                card.style.background = 'var(--card)';
                card.style.borderLeft = `4px solid ${COLORS[i]}`;
                card.innerHTML = `
      <div class="flex-shrink-0">
        <div id="avatar_${i}" class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:opacity-80 transition" style="background:${COLORS[i]}" onclick="pickAvatar(${i})" title="Klik untuk pilih avatar">
          ${isAI ? '🤖' : (i + 1)}
        </div>
        <input type="file" id="avatarInput_${i}" accept="image/*" class="hidden" onchange="handleAvatar(${i}, this)">
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style="background:${COLORS[i]}">${COLOR_NAMES[i]}</span>
          ${isAI ? '<span class="text-xs text-slate-400">🤖 AI</span>' : ''}
        </div>
        <input type="text" id="nameInput_${i}" placeholder="${isAI ? 'AI ' + COLOR_NAMES[i] : 'Nama pemain ' + (i + 1)}" value="${sp.name}" onchange="setupPlayers[${i}].name=this.value" class="w-full bg-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-indigo-500 transition">
      </div>`;
                cont.appendChild(card);
            }
            lucide.createIcons();
        }

        function pickAvatar(idx) {
            document.getElementById(`avatarInput_${idx}`).click();
        }

        function handleAvatar(idx, input) {
            const file = input.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                setupPlayers[idx].avatar = e.target.result;
                const av = document.getElementById(`avatar_${idx}`);
                av.innerHTML = `<img src="${e.target.result}" class="w-full h-full rounded-full object-cover">`;
            };
            reader.readAsDataURL(file);
        }

        function toggleRules() {
            const c = document.getElementById('rulesContent');
            const ch = document.getElementById('rulesChevron');
            c.classList.toggle('hidden');
            ch.style.transform = c.classList.contains('hidden') ? '' : 'rotate(180deg)';
        }

        // ============ GAME INIT ============
        function startGame() {
            buildBoard();
            players = [];
            for (let i = 0; i < playerCount; i++) {
                const sp = setupPlayers[i];
                const name = sp.name || (sp.isAI ? `AI ${COLOR_NAMES[i]}` : `Pemain ${i + 1}`);
                players.push(createPlayer(i, name, i, sp.isAI, sp.avatar));
            }
            currentPlayer = 0;
            diceValue = 0;
            diceRolled = false;
            consecutiveSixes = 0;
            moveHistory = [];
            finishOrder = [];
            gameActive = true;

            document.getElementById('setupScreen').classList.add('hidden');
            document.getElementById('gameScreen').classList.remove('hidden');
            document.getElementById('winnerOverlay').classList.add('hidden');

            renderBoard();
            renderPlayerStatus();
            updateTurnIndicator();
            renderDice(0);

            if (players[currentPlayer].isAI) setTimeout(aiTurn, 800);
        }

        function showSetup() {
            gameActive = false;
            document.getElementById('gameScreen').classList.add('hidden');
            document.getElementById('setupScreen').classList.remove('hidden');
            document.getElementById('winnerOverlay').classList.add('hidden');
        }

        function restartGame() {
            document.getElementById('winnerOverlay').classList.add('hidden');
            startGame();
        }

        // ============ BOARD RENDERING ============
        function getCellColor(r, c) {
            if (r >= 9 && r <= 14 && c >= 0 && c <= 5) return 0; // Red home area
            if (r >= 0 && r <= 5 && c >= 0 && c <= 5) return 1; // Green home area
            if (r >= 0 && r <= 5 && c >= 9 && c <= 14) return 2; // Blue home area
            if (r >= 9 && r <= 14 && c >= 9 && c <= 14) return 3; // Yellow home area
            return -1;
        }

        function isHomeStretchCell(r, c) {
            for (let ci = 0; ci < 4; ci++) {
                for (let hi = 0; hi < 6; hi++) {
                    if (HOME_PATHS[ci] && HOME_PATHS[ci][hi] && HOME_PATHS[ci][hi].r === r && HOME_PATHS[ci][hi].c === c) return ci;
                }
            }
            return -1;
        }

        function isCenterCell(r, c) {
            return r >= 6 && r <= 8 && c >= 6 && c <= 8;
        }

        function getMainPathIndex(r, c) {
            for (let i = 0; i < MAIN_PATH.length; i++) {
                if (MAIN_PATH[i].r === r && MAIN_PATH[i].c === c) return i;
            }
            return -1;
        }

        function isSafeCell(pathIdx) {
            return SAFE_POSITIONS.includes(pathIdx);
        }

        function renderBoard() {
            const board = document.getElementById('ludoBoard');
            board.innerHTML = '';

            for (let r = 0; r < 15; r++) {
                for (let c = 0; c < 15; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'ludo-cell';
                    cell.dataset.r = r;
                    cell.dataset.c = c;

                    const homeColor = getCellColor(r, c);
                    const homeStretch = isHomeStretchCell(r, c);
                    const center = isCenterCell(r, c);
                    const mainIdx = getMainPathIndex(r, c);

                    if (center) {
                        cell.style.background = 'linear-gradient(135deg,#E53935,#43A047,#1E88E5,#FDD835)';
                        cell.classList.add('home-zone');
                        if (r === 7 && c === 7) cell.innerHTML = '<span style="font-size:clamp(10px,2.5vw,18px)">🏠</span>';
                    } else if (homeColor >= 0) {
                        const isInner = (homeColor === 0 && r >= 10 && r <= 13 && c >= 1 && c <= 4) ||
                            (homeColor === 1 && r >= 1 && r <= 4 && c >= 1 && c <= 4) ||
                            (homeColor === 2 && r >= 1 && r <= 4 && c >= 10 && c <= 13) ||
                            (homeColor === 3 && r >= 10 && r <= 13 && c >= 10 && c <= 13);
                        if (isInner) {
                            cell.style.background = COLORS[homeColor] + '33';
                            cell.classList.add('home-zone');
                            const innerOffsets = homeColor === 0 ? { r0: 11, c0: 1 } : homeColor === 1 ? { r0: 1, c0: 1 } : homeColor === 2 ? { r0: 1, c0: 10 } : { r0: 10, c0: 10 };
                            const pr = r - innerOffsets.r0;
                            const pc = c - innerOffsets.c0;
                            if (pr >= 0 && pr <= 2 && pc >= 0 && pc <= 2 && (pr !== 1 || pc !== 1)) {
                                const pawnMap = [[0, -1, 1], [-1, -1, -1], [2, -1, 3]];
                                if (pawnMap[pr] && pawnMap[pr][pc] >= 0) {
                                    cell.dataset.homeBase = homeColor;
                                    cell.dataset.pawnSlot = pawnMap[pr][pc];
                                }
                            }
                        } else {
                            cell.style.background = COLORS[homeColor] + '22';
                            cell.classList.add('home-zone');
                        }
                    } else if (homeStretch >= 0) {
                        cell.style.background = COLORS[homeStretch] + '55';
                    } else if (mainIdx >= 0) {
                        cell.style.background = '#1e293b';
                        if (mainIdx === COLOR_START[0]) cell.style.background = COLORS[0] + '44';
                        else if (mainIdx === COLOR_START[1]) cell.style.background = COLORS[1] + '44';
                        else if (mainIdx === COLOR_START[2]) cell.style.background = COLORS[2] + '44';
                        else if (mainIdx === COLOR_START[3]) cell.style.background = COLORS[3] + '44';
                        if (isSafeCell(mainIdx)) cell.classList.add('safe-star');
                    } else {
                        cell.style.background = '#0f172a';
                        cell.classList.add('home-zone');
                    }

                    board.appendChild(cell);
                }
            }
            renderPawns();
        }

        function renderPawns() {
            document.querySelectorAll('.pawn-token,.home-pawn-placed').forEach(el => el.remove());
            document.querySelectorAll('.cell-highlight').forEach(el => el.classList.remove('cell-highlight'));
            document.querySelectorAll('.pawn-active').forEach(el => el.classList.remove('pawn-active'));

            const cellPawns = {};

            players.forEach((player, pi) => {
                player.pawns.forEach((pawn, idx) => {
                    if (pawn.state === 'home') {
                        const homeColor = pi;
                        const slot = idx;
                        const cellEl = document.querySelector(`[data-home-base="${homeColor}"][data-pawn-slot="${slot}"]`);
                        if (cellEl) {
                            const hp = document.createElement('div');
                            hp.className = 'home-pawn home-pawn-placed';
                            hp.style.background = player.color;
                            hp.style.color = 'white';
                            hp.dataset.player = pi;
                            hp.dataset.pawn = idx;
                            if (player.avatar) hp.innerHTML = `<img src="${player.avatar}" class="w-full h-full rounded-full object-cover">`;
                            else hp.textContent = idx + 1;

                            if (gameActive && pi === currentPlayer && diceRolled && diceValue === 6 && canMoveFromHome(pi)) {
                                hp.classList.add('pawn-active');
                                hp.onclick = () => movePawn(pi, idx);
                            }
                            cellEl.appendChild(hp);
                        }
                    } else if (pawn.state === 'board') {
                        const absPos = getAbsolutePosition(pi, pawn.mainPos);
                        if (absPos >= 0 && absPos < 52) {
                            const pos = MAIN_PATH[absPos];
                            const key = `${pos.r}_${pos.c}`;
                            if (!cellPawns[key]) cellPawns[key] = [];
                            cellPawns[key].push({ player: pi, pawnIdx: idx, pawn });
                        }
                    } else if (pawn.state === 'homestretch') {
                        if (HOME_PATHS[pi] && HOME_PATHS[pi][pawn.homePos]) {
                            const pos = HOME_PATHS[pi][pawn.homePos];
                            const key = `${pos.r}_${pos.c}`;
                            if (!cellPawns[key]) cellPawns[key] = [];
                            cellPawns[key].push({ player: pi, pawnIdx: idx, pawn });
                        }
                    }
                });
            });

            for (const key in cellPawns) {
                const [r, c] = key.split('_').map(Number);
                const cellEl = document.querySelector(`.ludo-cell[data-r="${r}"][data-c="${c}"]`);
                if (!cellEl) continue;
                const pawns = cellPawns[key];
                const isMulti = pawns.length > 1;

                const wrapper = document.createElement('div');
                if (isMulti) wrapper.className = 'multi-pawn';
                wrapper.style.width = '100%'; wrapper.style.height = '100%';
                wrapper.style.display = 'flex'; wrapper.style.alignItems = 'center'; wrapper.style.justifyContent = 'center';
                if (isMulti) { wrapper.style.flexWrap = 'wrap'; wrapper.style.gap = '1px'; }

                pawns.forEach(({ player: pi, pawnIdx: idx, pawn }) => {
                    const pt = document.createElement('div');
                    pt.className = 'pawn-token';
                    if (isMulti) { pt.style.width = '45%'; pt.style.height = '45%'; }
                    pt.style.background = players[pi].color;
                    pt.style.color = 'white';
                    pt.dataset.player = pi;
                    pt.dataset.pawn = idx;

                    if (players[pi].avatar) pt.innerHTML = `<img src="${players[pi].avatar}" style="width:80%;height:80%;border-radius:50%;object-fit:cover">`;
                    else pt.textContent = idx + 1;

                    const canMove = gameActive && pi === currentPlayer && diceRolled && canPawnMove(pi, idx);
                    if (canMove) {
                        pt.classList.add('pawn-active');
                        pt.onclick = () => movePawn(pi, idx);
                    }
                    wrapper.appendChild(pt);
                });
                cellEl.appendChild(wrapper);
            }

            if (gameActive && diceRolled && !players[currentPlayer].isAI) {
                highlightMoveablePawns();
            }
        }

        function highlightMoveablePawns() {
            const pi = currentPlayer;
            const p = players[pi];
            p.pawns.forEach((pawn, idx) => {
                if (!canPawnMove(pi, idx)) return;
                const target = getTargetPosition(pi, idx);
                if (target) {
                    const cellEl = document.querySelector(`.ludo-cell[data-r="${target.r}"][data-c="${target.c}"]`);
                    if (cellEl) cellEl.classList.add('cell-highlight');
                }
            });
        }

        // ============ POSITION LOGIC ============
        function getAbsolutePosition(playerIdx, relativePos) {
            const start = COLOR_START[playerIdx];
            return (start + relativePos) % 52;
        }

        function canMoveFromHome(pi) {
            return players[pi].pawns.some(p => p.state === 'home') && diceValue === 6;
        }

        function canPawnMove(pi, pawnIdx) {
            const pawn = players[pi].pawns[pawnIdx];
            if (pawn.state === 'finished') return false;
            if (pawn.state === 'home') return diceValue === 6;
            if (pawn.state === 'board') {
                const newSteps = pawn.steps + diceValue;
                const maxSteps = 51 + 6;
                if (newSteps > maxSteps) return false;
                return true;
            }
            if (pawn.state === 'homestretch') {
                const newHomePos = pawn.homePos + diceValue;
                if (newHomePos > 5) return false;
                return true;
            }
            return false;
        }

        function getTargetPosition(pi, pawnIdx) {
            const pawn = players[pi].pawns[pawnIdx];
            const ci = pi;
            if (pawn.state === 'home') {
                const startAbs = COLOR_START[ci];
                return MAIN_PATH[startAbs];
            }
            if (pawn.state === 'board') {
                const newSteps = pawn.steps + diceValue;
                if (newSteps <= 51) {
                    const absPos = getAbsolutePosition(pi, pawn.mainPos + diceValue);
                    return MAIN_PATH[absPos];
                } else {
                    const homeIdx = newSteps - 52;
                    if (homeIdx >= 0 && homeIdx <= 5 && HOME_PATHS[ci]) {
                        return HOME_PATHS[ci][homeIdx];
                    }
                }
            }
            if (pawn.state === 'homestretch') {
                const newHP = pawn.homePos + diceValue;
                if (newHP <= 5 && HOME_PATHS[ci]) return HOME_PATHS[ci][newHP];
                if (newHP === 6) return { r: 7, c: 7 }; // center
            }
            return null;
        }

        // ============ DICE ============
        function rollDice() {
            if (!gameActive || diceRolled || players[currentPlayer].isAI) return;
            performDiceRoll();
        }

        function performDiceRoll() {
            diceRolled = true;
            const dice = document.getElementById('diceDisplay');
            dice.classList.remove('dice-glow');
            dice.classList.add('dice-rolling');

            diceValue = Math.floor(Math.random() * 6) + 1;

            setTimeout(() => {
                dice.classList.remove('dice-rolling');
                renderDice(diceValue);

                if (diceValue === 6) {
                    consecutiveSixes++;
                    if (consecutiveSixes >= 3) {
                        showToast(`😱 ${players[currentPlayer].name}: Tiga kali 6! Giliran hangus!`, 'warn');
                        addHistory(currentPlayer, `Tiga kali 6 berturut! Giliran hangus.`);
                        consecutiveSixes = 0;
                        diceRolled = false;
                        nextTurn();
                        return;
                    }
                } else {
                    consecutiveSixes = 0;
                }

                const hasMove = players[currentPlayer].pawns.some((p, i) => canPawnMove(currentPlayer, i));
                if (!hasMove) {
                    showToast(`${players[currentPlayer].name}: Tidak ada pion yang bisa bergerak`, 'info');
                    addHistory(currentPlayer, `Dadu ${diceValue}, tidak ada gerakan.`);
                    setTimeout(() => {
                        diceRolled = false;
                        if (diceValue !== 6) nextTurn();
                        else {
                            diceRolled = false;
                            diceValue = 0;
                            renderDice(0);
                            if (players[currentPlayer].isAI) setTimeout(aiTurn, 600);
                        }
                    }, 800);
                    return;
                }

                renderPawns();
                document.getElementById('diceMsg').textContent = `${players[currentPlayer].name}: Pilih pion untuk digerakkan ${diceValue} langkah`;

                if (players[currentPlayer].isAI) {
                    setTimeout(() => aiSelectPawn(), 500);
                }
            }, 600);
        }

        function renderDice(value) {
            const dice = document.getElementById('diceDisplay');
            if (value === 0) {
                dice.innerHTML = '<span class="text-slate-400 text-xs font-bold">🎲</span>';
                dice.classList.add('dice-glow');
                return;
            }
            dice.classList.remove('dice-glow');
            const patterns = {
                1: [[1, 1]],
                2: [[0, 2], [2, 0]],
                3: [[0, 2], [1, 1], [2, 0]],
                4: [[0, 0], [0, 2], [2, 0], [2, 2]],
                5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
                6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]]
            };
            const dots = patterns[value] || [];
            dice.innerHTML = `<div style="display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:2px;width:70%;height:70%">
    ${[0, 1, 2].map(r => [0, 1, 2].map(c => {
                const hasDot = dots.some(d => d[0] === r && d[1] === c);
                return `<div style="display:flex;align-items:center;justify-content:center">${hasDot ? '<div class="dice-dot"></div>' : ''}</div>`;
            }).join('')).join('')}
  </div>`;
        }

        // ============ MOVEMENT ============
        function movePawn(pi, pawnIdx) {
            if (pi !== currentPlayer || !diceRolled || !gameActive) return;
            if (!canPawnMove(pi, pawnIdx)) return;

            const pawn = players[pi].pawns[pawnIdx];
            const ci = pi;
            let captured = false;
            let finished = false;

            if (pawn.state === 'home') {
                pawn.state = 'board';
                pawn.mainPos = 0;
                pawn.steps = 0;
                addHistory(pi, `Pion ${pawnIdx + 1} keluar dari rumah (Dadu: 6)`);
                captured = checkCapture(pi, getAbsolutePosition(pi, 0));
            } else if (pawn.state === 'board') {
                const newSteps = pawn.steps + diceValue;
                if (newSteps <= 51) {
                    pawn.mainPos += diceValue;
                    pawn.steps = newSteps;
                    const absPos = getAbsolutePosition(pi, pawn.mainPos);
                    addHistory(pi, `Pion ${pawnIdx + 1} maju ${diceValue} langkah (pos ${pawn.steps})`);
                    captured = checkCapture(pi, absPos);
                } else {
                    const homeIdx = newSteps - 52;
                    pawn.state = 'homestretch';
                    pawn.homePos = homeIdx;
                    pawn.steps = newSteps;
                    addHistory(pi, `Pion ${pawnIdx + 1} masuk jalur akhir (Dadu: ${diceValue})`);
                    if (homeIdx === 5) {
                        pawn.state = 'finished';
                        players[pi].finished++;
                        finished = true;
                        addHistory(pi, `🎯 Pion ${pawnIdx + 1} FINISH!`);
                        showToast(`🎯 ${players[pi].name}: Pion ${pawnIdx + 1} sampai!`, 'success');
                    }
                }
            } else if (pawn.state === 'homestretch') {
                pawn.homePos += diceValue;
                pawn.steps += diceValue;
                addHistory(pi, `Pion ${pawnIdx + 1} maju ${diceValue} di jalur akhir`);
                if (pawn.homePos >= 5) {
                    pawn.homePos = 5;
                    pawn.state = 'finished';
                    players[pi].finished++;
                    finished = true;
                    addHistory(pi, `🎯 Pion ${pawnIdx + 1} FINISH!`);
                    showToast(`🎯 ${players[pi].name}: Pion ${pawnIdx + 1} sampai!`, 'success');
                }
            }

            players[pi].totalMoves++;
            diceRolled = false;

            if (players[pi].finished === 4) {
                finishOrder.push(pi);
                gameActive = false;
                renderBoard();
                renderPlayerStatus();
                showWinner(pi);
                return;
            }

            renderBoard();
            renderPlayerStatus();
            updateTurnIndicator();

            if (diceValue === 6 || captured) {
                const reason = diceValue === 6 ? 'Dadu 6!' : 'Menangkap pion!';
                showToast(`🔄 ${players[pi].name}: Giliran tambahan! (${reason})`, 'info');
                diceValue = 0;
                renderDice(0);
                if (players[currentPlayer].isAI) setTimeout(aiTurn, 800);
            } else {
                nextTurn();
            }
        }

        function checkCapture(pi, absPos) {
            if (isSafeCell(absPos)) return false;
            let captured = false;
            players.forEach((other, oi) => {
                if (oi === pi) return;
                other.pawns.forEach(op => {
                    if (op.state !== 'board') return;
                    const otherAbs = getAbsolutePosition(oi, op.mainPos);
                    if (otherAbs === absPos) {
                        op.state = 'home';
                        op.mainPos = -1;
                        op.homePos = -1;
                        op.steps = 0;
                        players[pi].captures++;
                        captured = true;
                        addHistory(pi, `⚔️ Menangkap pion ${players[oi].name}!`);
                        showToast(`⚔️ ${players[pi].name} menangkap pion ${players[oi].name}!`, 'warn');
                    }
                });
            });
            return captured;
        }

        function nextTurn() {
            let next = (currentPlayer + 1) % playerCount;
            let attempts = 0;
            while (players[next].finished === 4 && attempts < playerCount) {
                next = (next + 1) % playerCount;
                attempts++;
            }
            if (attempts >= playerCount) {
                gameActive = false;
                return;
            }
            currentPlayer = next;
            consecutiveSixes = 0;
            diceRolled = false;
            diceValue = 0;
            renderDice(0);
            updateTurnIndicator();
            renderPawns();
            if (players[currentPlayer].isAI) setTimeout(aiTurn, 800);
        }

        // ============ AI ============
        function aiTurn() {
            if (!gameActive || currentPlayer >= players.length || !players[currentPlayer].isAI) return;
            performDiceRoll();
        }

        function aiSelectPawn() {
            if (!gameActive) return;
            const pi = currentPlayer;
            const moveable = [];
            players[pi].pawns.forEach((p, i) => {
                if (canPawnMove(pi, i)) moveable.push(i);
            });
            if (moveable.length === 0) return;

            let best = moveable[0];
            let bestScore = -Infinity;

            moveable.forEach(idx => {
                let score = 0;
                const pawn = players[pi].pawns[idx];
                const ci = pi;

                if (pawn.state === 'home') {
                    score = 10;
                } else if (pawn.state === 'board') {
                    const newSteps = pawn.steps + diceValue;
                    if (newSteps > 51) {
                        score = 50;
                        if (newSteps - 52 === 5) score = 100;
                    } else {
                        const absPos = getAbsolutePosition(pi, pawn.mainPos + diceValue);
                        let canCapture = false;
                        if (!isSafeCell(absPos)) {
                            players.forEach((other, oi) => {
                                if (oi === pi) return;
                                other.pawns.forEach(op => {
                                    if (op.state === 'board' && getAbsolutePosition(oi, op.mainPos) === absPos) canCapture = true;
                                });
                            });
                        }
                        if (canCapture) score = 40;
                        else if (isSafeCell(absPos)) score = 20;
                        else score = pawn.steps;
                        let inDanger = false;
                        players.forEach((other, oi) => {
                            if (oi === pi) return;
                            other.pawns.forEach(op => {
                                if (op.state === 'board') {
                                    const otherAbs = getAbsolutePosition(oi, op.mainPos);
                                    const dist = (absPos - otherAbs + 52) % 52;
                                    if (dist <= 6 && dist > 0) inDanger = true;
                                }
                            });
                        });
                        if (inDanger && !isSafeCell(absPos)) score -= 10;
                    }
                } else if (pawn.state === 'homestretch') {
                    score = 60 + pawn.homePos;
                    if (pawn.homePos + diceValue === 5) score = 100;
                }
                if (score > bestScore) { bestScore = score; best = idx; }
            });

            movePawn(pi, best);
        }

        // ============ UI UPDATES ============
        function updateTurnIndicator() {
            const ti = document.getElementById('turnIndicator');
            const p = players[currentPlayer];
            ti.innerHTML = `<span style="color:${p.color}">● ${p.name}</span> <span class="text-slate-400 text-xs">${p.isAI ? '🤖' : ''} - Lempar dadu!</span>`;
        }

        function renderPlayerStatus() {
            const cont = document.getElementById('playerStatusCards');
            cont.innerHTML = '';
            players.forEach((p, i) => {
                const isActive = i === currentPlayer && gameActive;
                const card = document.createElement('div');
                card.className = `rounded-lg p-2 md:p-3 flex-shrink-0 transition ${isActive ? 'ring-2' : ''} min-w-[140px] lg:min-w-0`;
                card.style.background = 'var(--card)';
                if (isActive) card.style.borderColor = p.color;
                card.style.borderLeft = `3px solid ${p.color}`;

                const pawnsHTML = p.pawns.map((pawn, idx) => {
                    let icon = '';
                    if (pawn.state === 'home') icon = '🏠';
                    else if (pawn.state === 'finished') icon = '✅';
                    else if (pawn.state === 'homestretch') icon = '🏃';
                    else icon = '🟢';
                    return `<span class="text-xs" title="Pion ${idx + 1}: ${pawn.state}">${icon}</span>`;
                }).join('');

                card.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style="background:${p.color}">
          ${p.avatar ? `<img src="${p.avatar}" class="w-full h-full rounded-full object-cover">` : (p.isAI ? '🤖' : (i + 1))}
        </div>
        <div class="min-w-0">
          <div class="text-xs font-bold truncate" style="color:${p.color}">${p.name}</div>
          <div class="flex gap-1">${pawnsHTML}</div>
        </div>
      </div>
      <div class="text-[10px] text-slate-500 mt-1">⚔️${p.captures} 🎯${p.finished}/4 📊${p.totalMoves}</div>`;
                cont.appendChild(card);
            });
        }

        function addHistory(pi, text) {
            moveHistory.unshift({ player: pi, text, time: new Date().toLocaleTimeString() });
            if (moveHistory.length > 100) moveHistory.pop();
            renderHistory();
        }

        function renderHistory() {
            const list = document.getElementById('historyList');
            if (!list) return;
            list.innerHTML = '';
            moveHistory.slice(0, 30).forEach(h => {
                const div = document.createElement('div');
                div.className = 'text-xs flex items-start gap-1 py-0.5';
                div.innerHTML = `<span class="flex-shrink-0 w-2 h-2 rounded-full mt-1" style="background:${COLORS[h.player]}"></span>
      <span class="text-slate-400">${h.text}</span>
      <span class="text-slate-600 text-[10px] ml-auto flex-shrink-0">${h.time}</span>`;
                list.appendChild(div);
            });
        }

        function toggleHistory() {
            document.getElementById('historyPanel').classList.toggle('hidden');
        }

        function toggleScoreboard() {
            const panel = document.getElementById('scorePanel');
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) renderScoreboard();
        }

        function renderScoreboard() {
            const list = document.getElementById('scoreList');
            list.innerHTML = '';
            const sorted = [...players].sort((a, b) => b.finished - a.finished || b.captures - a.captures);
            sorted.forEach((p, rank) => {
                const div = document.createElement('div');
                div.className = 'flex items-center gap-2 py-1 text-sm';
                div.innerHTML = `<span class="font-bold text-slate-500">${rank + 1}.</span>
      <span class="w-3 h-3 rounded-full" style="background:${p.color}"></span>
      <span class="font-semibold flex-1" style="color:${p.color}">${p.name}</span>
      <span class="text-xs text-slate-400">🎯${p.finished} ⚔️${p.captures}</span>`;
                list.appendChild(div);
            });
        }

        // ============ WINNER ============
        function showWinner(pi) {
            const overlay = document.getElementById('winnerOverlay');
            overlay.classList.remove('hidden');
            document.getElementById('winnerName').textContent = players[pi].name;
            document.getElementById('winnerName').style.color = players[pi].color;
            document.getElementById('winnerStats').innerHTML = `
    <p>Total Gerakan: ${players[pi].totalMoves}</p>
    <p>Pion Ditangkap: ${players[pi].captures}</p>`;
            spawnConfetti();
        }

        function spawnConfetti() {
            for (let i = 0; i < 40; i++) {
                setTimeout(() => {
                    const p = document.createElement('div');
                    p.className = 'confetti-particle';
                    p.style.left = Math.random() * 100 + '%';
                    p.style.top = '-10px';
                    p.style.background = COLORS[Math.floor(Math.random() * 4)];
                    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                    p.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
                    document.body.appendChild(p);
                    setTimeout(() => p.remove(), 3000);
                }, i * 50);
            }
        }

        // ============ TOAST ============
        function showToast(msg, type = 'info') {
            const cont = document.getElementById('toastContainer');
            const t = document.createElement('div');
            const bg = type === 'success' ? 'bg-green-600' : type === 'warn' ? 'bg-amber-600' : type === 'error' ? 'bg-red-600' : 'bg-indigo-600';
            t.className = `toast-in ${bg} text-white text-xs md:text-sm px-4 py-2 rounded-lg shadow-lg pointer-events-auto max-w-xs text-center`;
            t.textContent = msg;
            cont.appendChild(t);
            setTimeout(() => { t.classList.add('toast-out'); setTimeout(() => t.remove(), 300); }, 2500);
        }

        // ============ ELEMENT SDK INIT ============
        const defaultConfig = {
            game_title: 'Ludo Master',
            background_color: '#0F172A',
            surface_color: '#1E293B',
            text_color: '#F1F5F9',
            accent_color: '#6366F1',
            secondary_action_color: '#EC4899',
            font_family: 'Fredoka',
            font_size: 16
        };

        function applyConfig(config) {
            const title = config.game_title || defaultConfig.game_title;
            const bg = config.background_color || defaultConfig.background_color;
            const surface = config.surface_color || defaultConfig.surface_color;
            const text = config.text_color || defaultConfig.text_color;
            const accent = config.accent_color || defaultConfig.accent_color;
            const accent2 = config.secondary_action_color || defaultConfig.secondary_action_color;
            const font = config.font_family || defaultConfig.font_family;
            const fontSize = config.font_size || defaultConfig.font_size;

            document.getElementById('gameTitle').textContent = title;
            document.getElementById('gameTitle').style.background = `linear-gradient(135deg,${accent},${accent2})`;
            document.getElementById('gameTitle').style.webkitBackgroundClip = 'text';
            document.getElementById('gameTitle').style.webkitTextFillColor = 'transparent';

            document.body.style.background = bg;
            document.body.style.color = text;
            document.documentElement.style.setProperty('--bg', bg);
            document.documentElement.style.setProperty('--card', surface);
            document.documentElement.style.setProperty('--text', text);
            document.documentElement.style.setProperty('--accent', accent);
            document.documentElement.style.setProperty('--accent2', accent2);

            document.querySelectorAll('[style*="background:var(--card)"],.ludo-board').forEach(el => {
                if (el.classList.contains('ludo-board')) el.style.background = '#1a1a2e';
                else el.style.background = surface;
            });

            document.body.style.fontFamily = `${font}, Nunito, sans-serif`;
            document.getElementById('gameTitle').style.fontFamily = `${font}, sans-serif`;

            const base = fontSize;
            document.querySelectorAll('h1').forEach(el => el.style.fontSize = `${base * 2}px`);
            document.querySelectorAll('h2,h3').forEach(el => el.style.fontSize = `${base * 1.25}px`);

            const startBtn = document.getElementById('startBtn');
            if (startBtn) startBtn.style.background = `linear-gradient(135deg,${accent},${accent2})`;
        }

        if (window.elementSdk) {
            window.elementSdk.init({
                defaultConfig,
                onConfigChange: async (config) => applyConfig(config),
                mapToCapabilities: (config) => ({
                    recolorables: [
                        { get: () => config.background_color || defaultConfig.background_color, set: v => { config.background_color = v; window.elementSdk.setConfig({ background_color: v }) } },
                        { get: () => config.surface_color || defaultConfig.surface_color, set: v => { config.surface_color = v; window.elementSdk.setConfig({ surface_color: v }) } },
                        { get: () => config.text_color || defaultConfig.text_color, set: v => { config.text_color = v; window.elementSdk.setConfig({ text_color: v }) } },
                        { get: () => config.accent_color || defaultConfig.accent_color, set: v => { config.accent_color = v; window.elementSdk.setConfig({ accent_color: v }) } },
                        { get: () => config.secondary_action_color || defaultConfig.secondary_action_color, set: v => { config.secondary_action_color = v; window.elementSdk.setConfig({ secondary_action_color: v }) } }
                    ],
                    borderables: [],
                    fontEditable: { get: () => config.font_family || defaultConfig.font_family, set: v => { config.font_family = v; window.elementSdk.setConfig({ font_family: v }) } },
                    fontSizeable: { get: () => config.font_size || defaultConfig.font_size, set: v => { config.font_size = v; window.elementSdk.setConfig({ font_size: v }) } }
                }),
                mapToEditPanelValues: (config) => new Map([
                    ['game_title', config.game_title || defaultConfig.game_title]
                ])
            });
        }

        // ============ INIT ============
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
            setPlayerCount(4);
            setGameMode('pvp');
            applyConfig(defaultConfig);
        });