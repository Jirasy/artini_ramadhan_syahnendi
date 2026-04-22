// ============ GAME STATE & CONSTANTS ============
const COLORS = ['#E53935', '#43A047', '#1E88E5', '#FDD835'];
const COLOR_NAMES = ['Merah', 'Hijau', 'Biru', 'Kuning'];
const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

let playerCount = 4, gameMode = 'pvp', players = [], currentPlayer = 0;
let diceValue = 0, diceRolled = false, consecutiveSixes = 0, isAnimating = false;
let moveHistory = [], gameActive = false, finishOrder = [];

const MAIN_PATH = [], HOME_PATHS = [[], [], [], []];
const COLOR_START = [0, 13, 26, 39];

function buildBoard() {
    const p = [
        {r:13,c:6}, {r:12,c:6}, {r:11,c:6}, {r:10,c:6}, {r:9,c:6},
        {r:8,c:5}, {r:8,c:4}, {r:8,c:3}, {r:8,c:2}, {r:8,c:1}, {r:8,c:0},
        {r:7,c:0},
        {r:6,c:0}, {r:6,c:1}, {r:6,c:2}, {r:6,c:3}, {r:6,c:4}, {r:6,c:5},
        {r:5,c:6}, {r:4,c:6}, {r:3,c:6}, {r:2,c:6}, {r:1,c:6},
        {r:0,c:6},
        {r:0,c:7}, {r:0,c:8},
        {r:1,c:8}, {r:2,c:8}, {r:3,c:8}, {r:4,c:8}, {r:5,c:8},
        {r:6,c:9}, {r:6,c:10}, {r:6,c:11}, {r:6,c:12}, {r:6,c:13}, {r:6,c:14},
        {r:7,c:14},
        {r:8,c:14}, {r:8,c:13}, {r:8,c:12}, {r:8,c:11}, {r:8,c:10}, {r:8,c:9},
        {r:9,c:8}, {r:10,c:8}, {r:11,c:8}, {r:12,c:8}, {r:13,c:8},
        {r:14,c:8},
        {r:14,c:7}, {r:14,c:6}
    ];
    MAIN_PATH.length = 0; p.forEach(x => MAIN_PATH.push(x));
    HOME_PATHS[0] = [{r:13,c:7}, {r:12,c:7}, {r:11,c:7}, {r:10,c:7}, {r:9,c:7}, {r:8,c:7}];
    HOME_PATHS[1] = [{r:7,c:1}, {r:7,c:2}, {r:7,c:3}, {r:7,c:4}, {r:7,c:5}, {r:7,c:6}];
    HOME_PATHS[2] = [{r:1,c:7}, {r:2,c:7}, {r:3,c:7}, {r:4,c:7}, {r:5,c:7}, {r:6,c:7}];
    HOME_PATHS[3] = [{r:7,c:13}, {r:7,c:12}, {r:7,c:11}, {r:7,c:10}, {r:7,c:9}, {r:7,c:8}];
}

function createPlayer(index, name, isAI, avatar) {
    return {
        index, name: name || COLOR_NAMES[index], color: COLORS[index],
        isAI, avatar, finished: 0, captures: 0, totalMoves: 0,
        pawns: Array.from({length: 4}, (_, i) => ({ id: `p${index}_${i}`, state: 'home', mainPos: -1, homePos: -1, steps: 0 }))
    };
}

// ============ SETUP UI ============
let setupPlayers = [];

function setPlayerCount(n) {
    playerCount = n;
    document.querySelectorAll('#playerCountBtns button').forEach(b => {
        const active = parseInt(b.dataset.count) === n;
        b.className = `px-4 py-2 rounded-lg text-sm font-bold transition ${active ? 'text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`;
        b.style.background = active ? 'var(--accent)' : '';
    });
    buildPlayerCards();
}

function setGameMode(mode) {
    gameMode = mode;
    ['pvp', 'ai'].forEach(m => {
        const btn = document.getElementById(m === 'pvp' ? 'btnPvP' : 'btnAI');
        const active = mode === m;
        btn.className = `flex-1 min-w-[120px] py-3 rounded-lg text-sm font-bold transition border-2 ${active ? 'border-indigo-500 text-white' : 'border-transparent bg-slate-700 text-slate-300 hover:bg-slate-600'}`;
        btn.style.background = active ? 'var(--accent)' : '';
    });
    buildPlayerCards();
}

function buildPlayerCards() {
    const cont = document.getElementById('playerSetupCards');
    cont.innerHTML = ''; setupPlayers = [];
    for (let i = 0; i < playerCount; i++) {
        const isAI = gameMode === 'ai' && i > 0;
        setupPlayers.push({ name: isAI ? `AI ${COLOR_NAMES[i]}` : '', isAI, avatar: null });
        cont.innerHTML += `
        <div class="player-card rounded-xl p-3 md:p-4 flex items-center gap-3 slide-in border-l-4" style="background:var(--card); border-left-color:${COLORS[i]}">
            <div class="flex-shrink-0 relative">
                <div id="avatar_${i}" class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg cursor-pointer transition hover:opacity-80 shadow-md" style="background:${COLORS[i]}" onclick="pickAvatar(${i})">
                    ${isAI ? '🤖' : (i + 1)}
                </div>
                <input type="file" id="avatarInput_${i}" accept="image/*" class="hidden" onchange="handleAvatar(${i}, this)">
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style="background:${COLORS[i]}">${COLOR_NAMES[i]}</span>
                    ${isAI ? '<span class="text-xs font-bold text-slate-400">🤖 AI</span>' : ''}
                </div>
                <input type="text" placeholder="${isAI ? 'AI ' + COLOR_NAMES[i] : 'Nama pemain ' + (i + 1)}" value="${setupPlayers[i].name}" onchange="setupPlayers[${i}].name=this.value" class="w-full bg-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 transition">
            </div>
        </div>`;
    }
}

function pickAvatar(idx) { document.getElementById(`avatarInput_${idx}`).click(); }
function handleAvatar(idx, input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        setupPlayers[idx].avatar = e.target.result;
        document.getElementById(`avatar_${idx}`).innerHTML = `<img src="${e.target.result}" class="w-full h-full rounded-full object-cover">`;
    };
    reader.readAsDataURL(file);
}

function toggleRules() {
    const c = document.getElementById('rulesContent'), ch = document.getElementById('rulesChevron');
    c.classList.toggle('hidden'); ch.style.transform = c.classList.contains('hidden') ? '' : 'rotate(180deg)';
}

// ============ GAME LOOP ============
function startGame() {
    buildBoard();
    players = setupPlayers.map((sp, i) => createPlayer(i, sp.name || (sp.isAI ? `AI ${COLOR_NAMES[i]}` : `Pemain ${i + 1}`), sp.isAI, sp.avatar));
    currentPlayer = 0; diceValue = 0; diceRolled = false; consecutiveSixes = 0; isAnimating = false;
    moveHistory = []; finishOrder = []; gameActive = true;

    document.getElementById('setupScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('winnerOverlay').classList.add('hidden');

    renderBoard(); renderPlayerStatus(); updateTurnIndicator(); renderDice(0);
    if (players[currentPlayer].isAI) setTimeout(aiTurn, 800);
}

function showSetup() {
    gameActive = false;
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('winnerOverlay').classList.add('hidden');
    document.getElementById('setupScreen').classList.remove('hidden');
}

function restartGame() { startGame(); }

// ============ BOARD LOGIC ============
function renderBoard() {
    const board = document.getElementById('ludoBoard');
    board.innerHTML = '';

    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            const cell = document.createElement('div');
            cell.className = 'ludo-cell'; cell.dataset.r = r; cell.dataset.c = c;
            
            const isCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;
            const mainIdx = MAIN_PATH.findIndex(p => p.r === r && p.c === c);
            const homeColor = (r>=9&&r<=14&&c>=0&&c<=5)?0 : (r>=0&&r<=5&&c>=0&&c<=5)?1 : (r>=0&&r<=5&&c>=9&&c<=14)?2 : (r>=9&&r<=14&&c>=9&&c<=14)?3 : -1;
            
            let homeStretch = -1;
            for(let ci=0; ci<4; ci++) if(HOME_PATHS[ci].some(p => p.r===r && p.c===c)) homeStretch = ci;

            if (isCenter) {
                cell.style.background = 'linear-gradient(135deg,#E53935,#43A047,#1E88E5,#FDD835)';
                cell.classList.add('home-zone');
                if (r === 7 && c === 7) cell.innerHTML = '<span style="font-size:clamp(14px,3vw,24px)">🏆</span>';
            } else if (homeColor >= 0) {
                const isInner = (homeColor === 0 && r >= 10 && r <= 13 && c >= 1 && c <= 4) ||
                                (homeColor === 1 && r >= 1 && r <= 4 && c >= 1 && c <= 4) ||
                                (homeColor === 2 && r >= 1 && r <= 4 && c >= 10 && c <= 13) ||
                                (homeColor === 3 && r >= 10 && r <= 13 && c >= 10 && c <= 13);
                cell.style.background = isInner ? COLORS[homeColor] + '33' : COLORS[homeColor] + '22';
                cell.classList.add('home-zone');
                
                if(isInner) {
                    const offsets = [ {r:11,c:1}, {r:1,c:1}, {r:1,c:10}, {r:10,c:10} ][homeColor];
                    const pr = r - offsets.r, pc = c - offsets.c;
                    const map = [[0, -1, 1], [-1, -1, -1], [2, -1, 3]];
                    if (pr >= 0 && pr <= 2 && pc >= 0 && pc <= 2 && map[pr][pc] >= 0) {
                        cell.dataset.homeBase = homeColor; cell.dataset.pawnSlot = map[pr][pc];
                    }
                }
            } else if (homeStretch >= 0) {
                cell.style.background = COLORS[homeStretch] + '55';
            } else if (mainIdx >= 0) {
                cell.style.background = '#1e293b';
                if (COLOR_START.includes(mainIdx)) cell.style.background = COLORS[COLOR_START.indexOf(mainIdx)] + '55';
                if (SAFE_POSITIONS.includes(mainIdx)) cell.classList.add('safe-star');
            } else {
                cell.style.background = '#0f172a'; cell.classList.add('home-zone');
            }
            board.appendChild(cell);
        }
    }
    renderPawns();
}

function renderPawns() {
    document.querySelectorAll('.pawn-token, .home-pawn-placed').forEach(e => e.remove());
    document.querySelectorAll('.cell-highlight').forEach(e => e.classList.remove('cell-highlight'));
    document.querySelectorAll('.pawn-active').forEach(e => e.classList.remove('pawn-active'));

    const cellMap = {};

    players.forEach((player, pi) => {
        player.pawns.forEach((pawn, idx) => {
            if (pawn.state === 'home') {
                const cell = document.querySelector(`[data-home-base="${pi}"][data-pawn-slot="${idx}"]`);
                if (cell) {
                    const hp = document.createElement('div');
                    hp.className = 'home-pawn home-pawn-placed';
                    hp.style.background = player.color; hp.style.color = 'white';
                    hp.innerHTML = player.avatar ? `<img src="${player.avatar}">` : (idx + 1);
                    
                    if (gameActive && !isAnimating && pi === currentPlayer && diceRolled && diceValue === 6) {
                        hp.classList.add('pawn-active'); hp.onclick = () => movePawn(pi, idx);
                    }
                    cell.appendChild(hp);
                }
            } else if (pawn.state === 'board' || pawn.state === 'homestretch') {
                const pos = pawn.state === 'board' ? MAIN_PATH[(COLOR_START[pi] + pawn.mainPos) % 52] : HOME_PATHS[pi][pawn.homePos];
                if(pos) {
                    const key = `${pos.r}_${pos.c}`;
                    if(!cellMap[key]) cellMap[key] = [];
                    cellMap[key].push({ pi, idx, pawn });
                }
            }
        });
    });

    for (const key in cellMap) {
        const [r, c] = key.split('_');
        const cell = document.querySelector(`.ludo-cell[data-r="${r}"][data-c="${c}"]`);
        if (!cell) continue;
        
        const pawns = cellMap[key];
        const wrap = document.createElement('div');
        if (pawns.length > 1) wrap.className = 'multi-pawn';
        else { wrap.style.width = '100%'; wrap.style.height = '100%'; wrap.style.display = 'flex'; wrap.style.justifyContent = 'center'; wrap.style.alignItems = 'center'; }

        pawns.forEach(({ pi, idx }) => {
            const pt = document.createElement('div');
            pt.className = 'pawn-token';
            pt.style.background = players[pi].color; pt.style.color = 'white';
            pt.innerHTML = players[pi].avatar ? `<img src="${players[pi].avatar}">` : (idx + 1);

            if (gameActive && !isAnimating && pi === currentPlayer && diceRolled && canPawnMove(pi, idx)) {
                pt.classList.add('pawn-active'); pt.onclick = () => movePawn(pi, idx);
            }
            wrap.appendChild(pt);
        });
        cell.appendChild(wrap);
    }
    
    if (gameActive && diceRolled && !players[currentPlayer].isAI && !isAnimating) highlightMoveablePawns();
}

function highlightMoveablePawns() {
    players[currentPlayer].pawns.forEach((p, idx) => {
        if (!canPawnMove(currentPlayer, idx)) return;
        let tr, tc;
        if (p.state === 'home') { tr = MAIN_PATH[COLOR_START[currentPlayer]].r; tc = MAIN_PATH[COLOR_START[currentPlayer]].c; }
        else if (p.state === 'board') {
            const nextStep = p.steps + diceValue;
            if (nextStep <= 51) { const rp = MAIN_PATH[(COLOR_START[currentPlayer] + p.mainPos + diceValue) % 52]; tr = rp.r; tc = rp.c; }
            else { const rp = HOME_PATHS[currentPlayer][nextStep - 52]; if(rp){ tr = rp.r; tc = rp.c; } }
        } else if (p.state === 'homestretch' && p.homePos + diceValue <= 5) {
            const rp = HOME_PATHS[currentPlayer][p.homePos + diceValue]; tr = rp.r; tc = rp.c;
        }
        if (tr !== undefined) document.querySelector(`.ludo-cell[data-r="${tr}"][data-c="${tc}"]`)?.classList.add('cell-highlight');
    });
}

function canPawnMove(pi, pIdx) {
    const p = players[pi].pawns[pIdx];
    if (p.state === 'finished') return false;
    if (p.state === 'home') return diceValue === 6;
    if (p.state === 'board') return p.steps + diceValue <= 57;
    if (p.state === 'homestretch') return p.homePos + diceValue <= 5;
    return false;
}

// ============ GAMEPLAY & DICE ============
function rollDice() {
    if (!gameActive || diceRolled || players[currentPlayer].isAI || isAnimating) return;
    performRoll();
}

function performRoll() {
    diceRolled = true; isAnimating = true;
    const dice = document.getElementById('diceDisplay');
    dice.classList.remove('dice-glow'); dice.classList.add('dice-rolling');
    diceValue = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
        dice.classList.remove('dice-rolling'); renderDice(diceValue);
        isAnimating = false;

        if (diceValue === 6) {
            consecutiveSixes++;
            if (consecutiveSixes >= 3) {
                showToast(`😱 Tiga kali 6! Giliran ${players[currentPlayer].name} hangus!`, 'error');
                addHistory(currentPlayer, `Tiga kali 6 berturut! Giliran hangus.`);
                return nextTurn();
            }
        } else consecutiveSixes = 0;

        if (!players[currentPlayer].pawns.some((_, i) => canPawnMove(currentPlayer, i))) {
            showToast(`⏭️ ${players[currentPlayer].name} tidak bisa bergerak`, 'warn');
            addHistory(currentPlayer, `Dadu ${diceValue}, tidak ada gerakan.`);
            setTimeout(nextTurn, 800);
            return;
        }

        renderPawns();
        document.getElementById('diceMsg').textContent = `Pilih pion untuk maju ${diceValue} langkah`;
        if (players[currentPlayer].isAI) setTimeout(aiSelectPawn, 600);
    }, 600);
}

function renderDice(v) {
    const dice = document.getElementById('diceDisplay');
    if (v === 0) { dice.innerHTML = '<span class="text-slate-400 text-2xl font-bold">🎲</span>'; dice.classList.add('dice-glow'); return; }
    
    const dots = {
        1: [[1,1]], 2: [[0,2],[2,0]], 3: [[0,2],[1,1],[2,0]],
        4: [[0,0],[0,2],[2,0],[2,2]], 5: [[0,0],[0,2],[1,1],[2,0],[2,2]], 6: [[0,0],[0,2],[1,0],[1,2],[2,0],[2,2]]
    }[v] || [];
    
    dice.innerHTML = `<div class="grid grid-cols-3 grid-rows-3 gap-1 w-3/4 h-3/4">
        ${[0,1,2].flatMap(r => [0,1,2].map(c => 
            `<div class="flex items-center justify-center">${dots.some(d => d[0]===r && d[1]===c) ? '<div class="dice-dot"></div>' : ''}</div>`
        )).join('')}
    </div>`;
}

function movePawn(pi, pIdx) {
    if (pi !== currentPlayer || !diceRolled || !gameActive || isAnimating || !canPawnMove(pi, pIdx)) return;
    
    const p = players[pi].pawns[pIdx];
    let captured = false;

    if (p.state === 'home') {
        p.state = 'board'; p.mainPos = 0; p.steps = 0;
        addHistory(pi, `Pion ${pIdx+1} keluar rumah.`);
        captured = checkCapture(pi, COLOR_START[pi]);
    } else {
        p.steps += diceValue;
        if (p.state === 'board') {
            if (p.steps <= 51) {
                p.mainPos += diceValue;
                captured = checkCapture(pi, (COLOR_START[pi] + p.mainPos) % 52);
            } else {
                p.state = 'homestretch'; p.homePos = p.steps - 52;
            }
        } else p.homePos += diceValue;

        if (p.state === 'homestretch' && p.homePos === 5) {
            p.state = 'finished'; players[pi].finished++;
            addHistory(pi, `🎯 Pion ${pIdx+1} FINISH!`);
            showToast(`🎉 ${players[pi].name} memasukkan pion!`, 'success');
        } else {
            addHistory(pi, `Pion ${pIdx+1} maju ${diceValue} langkah.`);
        }
    }

    players[pi].totalMoves++; diceRolled = false; document.getElementById('diceMsg').textContent = '';
    
    if (players[pi].finished === 4) {
        finishOrder.push(pi); gameActive = false;
        renderBoard(); showWinner(pi); return;
    }

    renderBoard(); renderPlayerStatus();
    
    if (diceValue === 6 || captured) {
        showToast(`🔄 Giliran tambahan untuk ${players[pi].name}!`, 'success');
        diceValue = 0; renderDice(0); updateTurnIndicator();
        if (players[currentPlayer].isAI) setTimeout(performRoll, 800);
    } else nextTurn();
}

function checkCapture(pi, absPos) {
    if (SAFE_POSITIONS.includes(absPos)) return false;
    let cap = false;
    players.forEach((other, oi) => {
        if (oi === pi) return;
        other.pawns.forEach(op => {
            if (op.state === 'board' && (COLOR_START[oi] + op.mainPos) % 52 === absPos) {
                op.state = 'home'; op.mainPos = -1; op.steps = 0; cap = true; players[pi].captures++;
                addHistory(pi, `⚔️ Menangkap pion ${other.name}!`);
                showToast(`⚔️ Boom! Pion ${other.name} ditendang!`, 'warn');
            }
        });
    });
    return cap;
}

function nextTurn() {
    consecutiveSixes = 0; diceRolled = false; diceValue = 0; document.getElementById('diceMsg').textContent = '';
    
    let attempts = 0;
    do {
        currentPlayer = (currentPlayer + 1) % playerCount; attempts++;
    } while (players[currentPlayer].finished === 4 && attempts < playerCount);
    
    if (attempts >= playerCount) { gameActive = false; return; }
    
    renderDice(0); updateTurnIndicator(); renderPawns();
    if (players[currentPlayer].isAI) setTimeout(performRoll, 800);
}

// ============ AI LOGIC ============
function aiSelectPawn() {
    if (!gameActive || !players[currentPlayer].isAI) return;
    const pi = currentPlayer, moveable = [];
    
    players[pi].pawns.forEach((p, i) => { if (canPawnMove(pi, i)) moveable.push(i); });
    if (!moveable.length) return;

    let best = moveable[0], bestScore = -Infinity;
    moveable.forEach(idx => {
        let score = 0; const p = players[pi].pawns[idx];
        if (p.state === 'home') score = 50;
        else if (p.state === 'homestretch') score = p.homePos + diceValue === 5 ? 100 : 20;
        else {
            const nextAbs = (COLOR_START[pi] + p.mainPos + diceValue) % 52;
            if (p.steps + diceValue > 51) score = p.steps + diceValue === 57 ? 100 : 60;
            else {
                let willCapture = !SAFE_POSITIONS.includes(nextAbs) && players.some((o, oi) => oi !== pi && o.pawns.some(op => op.state === 'board' && (COLOR_START[oi] + op.mainPos)%52 === nextAbs));
                score = willCapture ? 80 : p.steps;
            }
        }
        if (score > bestScore) { bestScore = score; best = idx; }
    });
    movePawn(pi, best);
}

// ============ UI & UTILS ============
function updateTurnIndicator() {
    const ti = document.getElementById('turnIndicator'), p = players[currentPlayer];
    ti.innerHTML = `<span style="color:${p.color}">● ${p.name}</span> <span class="text-slate-400 text-xs">${p.isAI?'🤖':''} Giliranmu!</span>`;
}

function renderPlayerStatus() {
    const cont = document.getElementById('playerStatusCards'); cont.innerHTML = '';
    players.forEach((p, i) => {
        const act = i === currentPlayer && gameActive;
        cont.innerHTML += `
        <div class="rounded-xl p-2.5 transition ${act ? 'ring-2 shadow-lg scale-[1.02]' : 'opacity-80'}" style="background:var(--card); border-left:4px solid ${p.color}; ${act ? `border-color:${p.color}; ring-color:${p.color}` : ''}">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style="background:${p.color}">
                    ${p.avatar ? `<img src="${p.avatar}" class="w-full h-full rounded-full object-cover">` : (p.isAI ? '🤖' : (i+1))}
                </div>
                <div class="min-w-0 flex-1">
                    <div class="text-xs font-bold truncate" style="color:${p.color}">${p.name}</div>
                    <div class="flex gap-1 mt-0.5">${p.pawns.map((pw, idx) => `<span class="text-[10px]" title="Pion ${idx+1}">${pw.state==='home'?'🏠':pw.state==='finished'?'✅':pw.state==='homestretch'?'🏃':'🟢'}</span>`).join('')}</div>
                </div>
            </div>
        </div>`;
    });
}

function addHistory(pi, text) {
    moveHistory.unshift({ pi, text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
    if (moveHistory.length > 50) moveHistory.pop();
    const list = document.getElementById('historyList');
    if (list) list.innerHTML = moveHistory.map(h => `<div class="text-xs flex items-start gap-2 py-1 border-b border-slate-700/50 last:border-0"><span class="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0" style="background:${COLORS[h.pi]}"></span><span class="text-slate-300 flex-1">${h.text}</span><span class="text-slate-500 text-[9px]">${h.time}</span></div>`).join('');
}

function toggleHistory() { document.getElementById('historyPanel').classList.toggle('hidden'); document.getElementById('scorePanel').classList.add('hidden'); }
function toggleScoreboard() { const s = document.getElementById('scorePanel'); s.classList.toggle('hidden'); document.getElementById('historyPanel').classList.add('hidden'); if (!s.classList.contains('hidden')) renderScoreboard(); }

function renderScoreboard() {
    const list = document.getElementById('scoreList');
    list.innerHTML = [...players].sort((a,b) => b.finished - a.finished || b.captures - a.captures).map((p, r) => `
        <div class="flex items-center gap-2 py-1.5 text-sm border-b border-slate-700/50 last:border-0">
            <span class="font-bold text-slate-500 w-4">${r+1}.</span><span class="w-3 h-3 rounded-full" style="background:${p.color}"></span>
            <span class="font-bold flex-1 truncate" style="color:${p.color}">${p.name}</span><span class="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-md">🎯${p.finished} ⚔️${p.captures}</span>
        </div>`).join('');
}

function showWinner(pi) {
    const o = document.getElementById('winnerOverlay'), p = players[pi];
    o.classList.remove('hidden'); document.getElementById('winnerName').textContent = p.name; document.getElementById('winnerName').style.color = p.color;
    document.getElementById('winnerStats').innerHTML = `<div><div class="text-xl font-bold text-white">${p.totalMoves}</div><div class="text-xs">Gerakan</div></div><div><div class="text-xl font-bold text-white">${p.captures}</div><div class="text-xs">Kill</div></div>`;
    for(let i=0; i<60; i++) setTimeout(() => {
        const c = document.createElement('div'); c.className = 'confetti-particle';
        c.style.left = Math.random()*100+'%'; c.style.background = COLORS[Math.floor(Math.random()*4)];
        document.body.appendChild(c); setTimeout(()=>c.remove(), 3000);
    }, i*40);
}

function showToast(msg, type = 'info') {
    const cont = document.getElementById('toastContainer');
    const t = document.createElement('div');
    const bg = { success: 'bg-green-600', warn: 'bg-amber-600', error: 'bg-red-600', info: 'bg-indigo-600' }[type];
    t.className = `toast-in ${bg} text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl pointer-events-auto text-center border border-white/10`;
    t.textContent = msg; cont.appendChild(t);
    setTimeout(() => { t.classList.add('toast-out'); setTimeout(() => t.remove(), 300); }, 2500);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons(); setPlayerCount(4); setGameMode('pvp'); buildPlayerCards();
});
