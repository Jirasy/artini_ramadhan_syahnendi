// =========== CONFIG ===========

const defaultConfig = {
  game_title: 'Ular Tangga',
  bg_color: '#0f172a',
  surface_color: '#1e293b',
  text_color: '#f1f5f9',
  accent_color: '#facc15',
  accent2_color: '#38bdf8',
  font_family: 'Fredoka',
  font_size: 16
};

let currentConfig = {...defaultConfig};

function applyConfig(cfg) {
  currentConfig = {...defaultConfig, ...cfg};
  document.documentElement.style.setProperty('--bg', currentConfig.bg_color);
  document.documentElement.style.setProperty('--surface', currentConfig.surface_color);
  document.documentElement.style.setProperty('--text', currentConfig.text_color);
  document.documentElement.style.setProperty('--accent', currentConfig.accent_color);
  document.documentElement.style.setProperty('--accent2', currentConfig.accent2_color);
  document.body.style.background = currentConfig.bg_color;
  document.body.style.color = currentConfig.text_color;
  document.body.style.fontFamily = `${currentConfig.font_family}, Fredoka, sans-serif`;
  const t = document.getElementById('gameTitle');
  const tb = document.getElementById('gameTitleBar');
  if(t) t.textContent = currentConfig.game_title;
  if(tb) tb.textContent = currentConfig.game_title;
}

if(window.elementSdk){
  window.elementSdk.init({
    defaultConfig,
    onConfigChange: async(cfg)=> applyConfig(cfg),
    mapToCapabilities:(cfg)=>({
      recolorables:[
        {get:()=>cfg.bg_color||defaultConfig.bg_color, set:(v)=>{cfg.bg_color=v;window.elementSdk.setConfig({bg_color:v})}},
        {get:()=>cfg.surface_color||defaultConfig.surface_color, set:(v)=>{cfg.surface_color=v;window.elementSdk.setConfig({surface_color:v})}},
        {get:()=>cfg.text_color||defaultConfig.text_color, set:(v)=>{cfg.text_color=v;window.elementSdk.setConfig({text_color:v})}},
        {get:()=>cfg.accent_color||defaultConfig.accent_color, set:(v)=>{cfg.accent_color=v;window.elementSdk.setConfig({accent_color:v})}},
        {get:()=>cfg.accent2_color||defaultConfig.accent2_color, set:(v)=>{cfg.accent2_color=v;window.elementSdk.setConfig({accent2_color:v})}}
      ],
      borderables:[],
      fontEditable:{get:()=>cfg.font_family||defaultConfig.font_family,set:(v)=>{cfg.font_family=v;window.elementSdk.setConfig({font_family:v})}},
      fontSizeable:{get:()=>cfg.font_size||defaultConfig.font_size,set:(v)=>{cfg.font_size=v;window.elementSdk.setConfig({font_size:v})}}
    }),
    mapToEditPanelValues:(cfg)=>new Map([['game_title',cfg.game_title||defaultConfig.game_title]])
  });
}
applyConfig(defaultConfig);

// =========== GAME STATE ===========
const COLORS = ['#ef4444','#3b82f6','#22c55e','#a855f7','#f97316','#ec4899'];
const EMOJIS = ['🔴','🔵','🟢','🟣','🟠','🩷','♟️','🎯','⭐','🌟','💎','🔥','🎪','🦁','🐯','🦊','🐸','🐧','🦄','🐉'];
const SNAKES = {16:6, 47:26, 49:11, 56:53, 62:19, 64:60, 87:24, 93:73, 95:75, 98:78};
const LADDERS = {1:38, 4:14, 9:31, 21:42, 28:84, 36:44, 51:67, 71:91, 80:100};

let gameMode='friends', playerCount=2, players=[], currentPlayer=0;
let gameActive=false, diceRolling=false, consecutiveSixes=0, hasEntered=[];

// =========== SETUP ===========
function setMode(m){
  gameMode=m;
  document.getElementById('modeFriends').className = 'btn-secondary flex items-center justify-center gap-2 py-3 transition'+(m==='friends'?' !bg-yellow-400/20 !border-yellow-400/50':'');
  document.getElementById('modeBot').className = 'btn-secondary flex items-center justify-center gap-2 py-3 transition'+(m==='bot'?' !bg-cyan-400/20 !border-cyan-400/50':'');
  buildPlayerSetup();
}

function updatePlayerCount(v){
  playerCount=parseInt(v);
  document.getElementById('playerCountLabel').textContent=v;
  document.getElementById('playerCountValue').textContent=v;
  buildPlayerSetup();
}

function buildPlayerSetup(){
  const c=document.getElementById('playersSetup');
  c.innerHTML='';
  for(let i=0;i<playerCount;i++){
    const isBot = gameMode==='bot' && i>0;
    const div=document.createElement('div');
    div.className='bg-slate-700/50 rounded-xl p-4 border border-white/8 space-y-3 slide-up';
    div.style.animationDelay=`${i*60}ms`;
    div.innerHTML=`
      <div class="flex items-center justify-between gap-2">
        <span class="font-semibold text-sm md:text-base">${isBot?'🤖 Bot '+(i):'👤 Pemain '+(i+1)}</span>
        <input type="text" value="${isBot?'Bot '+i:'Pemain '+(i+1)}" data-player="${i}" class="player-name bg-slate-600/50 border border-white/10 rounded-lg px-2 py-1.5 text-sm flex-1 focus:outline-none focus:border-yellow-400/70 transition" maxlength="14">
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs text-slate-400 font-semibold">Warna:</span>
        ${COLORS.map((col,ci)=>`<div class="color-pick ${ci===i?'selected':''}" style="background:${col}" data-player="${i}" data-color="${col}" onclick="pickColor(${i},'${col}',this)"></div>`).join('')}
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs text-slate-400 font-semibold">Pion:</span>
        ${EMOJIS.slice(0,8).map((em,ei)=>`<div class="emoji-pick ${ei===i?'selected':''}" data-player="${i}" data-emoji="${em}" onclick="pickEmoji(${i},'${em}',this)">${em}</div>`).join('')}
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-400 font-semibold">Atau foto:</span>
        <label class="file-label text-xs">
          <i data-lucide="image" style="width:16px;height:16px"></i> Foto
          <input type="file" accept="image/*" onchange="pickImage(${i},this)">
        </label>
        <span id="imgStatus${i}" class="text-xs text-slate-500"></span>
      </div>
    `;
    c.appendChild(div);
  }
  lucide.createIcons();
}

function pickColor(pi,col,el){
  document.querySelectorAll(`.color-pick[data-player="${pi}"]`).forEach(e=>e.classList.remove('selected'));
  el.classList.add('selected');
}
function pickEmoji(pi,em,el){
  document.querySelectorAll(`.emoji-pick[data-player="${pi}"]`).forEach(e=>e.classList.remove('selected'));
  el.classList.add('selected');
  const st=document.getElementById('imgStatus'+pi);
  if(st)st.textContent='';
  playerImages[pi]=null;
}
const playerImages={};
function pickImage(pi,inp){
  if(inp.files&&inp.files[0]){
    const reader=new FileReader();
    reader.onload=e=>{
      playerImages[pi]=e.target.result;
      document.getElementById('imgStatus'+pi).textContent='✅';
      document.querySelectorAll(`.emoji-pick[data-player="${pi}"]`).forEach(e=>e.classList.remove('selected'));
    };
    reader.readAsDataURL(inp.files[0]);
  }
}

// =========== START GAME ===========
function startGame(){
  players=[];
  hasEntered=[];
  for(let i=0;i<playerCount;i++){
    const nameEl=document.querySelector(`input.player-name[data-player="${i}"]`);
    const colorEl=document.querySelector(`.color-pick.selected[data-player="${i}"]`);
    const emojiEl=document.querySelector(`.emoji-pick.selected[data-player="${i}"]`);
    players.push({
      name: nameEl?nameEl.value:('Pemain '+(i+1)),
      color: colorEl?colorEl.dataset.color:COLORS[i%COLORS.length],
      emoji: emojiEl?emojiEl.dataset.emoji:EMOJIS[i],
      image: playerImages[i]||null,
      position: 0,
      isBot: gameMode==='bot'&&i>0
    });
    hasEntered.push(false);
  }
  currentPlayer=0;
  consecutiveSixes=0;
  gameActive=true;
  document.getElementById('setupScreen').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('hidden');
  buildBoard();
  drawSnakesLadders();
  updateScoreboard();
  updateTurnIndicator();
  renderDice(1);
  clearLog();
  addLog('🎲 Permainan dimulai! Lempar 6 untuk masuk papan.');
  if(players[currentPlayer].isBot) setTimeout(botTurn,1200);
}

// =========== BOARD ===========
function buildBoard(){
  const board=document.getElementById('board');
  board.innerHTML='';
  for(let row=0;row<10;row++){
    for(let col=0;col<10;col++){
      let num;
      if(row%2===0) num=100-row*10-(col);
      else num=100-row*10+(col)-9;
      const cell=document.createElement('div');
      cell.className='board-cell';
      const rEven=row%2===0, cEven=col%2===0;
      if(rEven&&cEven)cell.classList.add('even-row-even-col');
      else if(rEven&&!cEven)cell.classList.add('even-row-odd-col');
      else if(!rEven&&cEven)cell.classList.add('odd-row-odd-col');
      else cell.classList.add('odd-row-even-col');
      if(SNAKES[num]) cell.style.background='rgba(239,68,68,.18)';
      if(LADDERS[num]) cell.style.background='rgba(34,197,94,.18)';
      if(num===100) cell.style.background='linear-gradient(135deg,rgba(250,204,21,.4),rgba(56,189,248,.4))';
      if(num===1) cell.style.background='rgba(250,204,21,.18)';
      cell.innerHTML=`<span class="cell-num">${num}</span>`;
      cell.id='cell-'+num;
      cell.style.position='relative';
      board.appendChild(cell);
    }
  }
  renderTokens();
}

function getCellPos(num){
  if(num<1||num>100)return{row:9,col:0};
  const fromBottom = num-1;
  const rowFromBottom = Math.floor(fromBottom/10);
  const row = 9-rowFromBottom;
  const posInRow = fromBottom%10;
  const col = rowFromBottom%2===0 ? posInRow : 9-posInRow;
  return {row,col};
}

function getCellCenter(num){
  const {row,col}=getCellPos(num);
  return {x:col*10+5, y:row*10+5};
}

function drawSnakesLadders(){
  const svg=document.getElementById('snakeLadderSvg');
  svg.innerHTML='';

  // Draw ladders
  for(const[start,end]of Object.entries(LADDERS)){
    const s=getCellCenter(parseInt(start));
    const e=getCellCenter(parseInt(end));
    const dx=1.2, dy=0;
    const rail1=document.createElementNS('http://www.w3.org/2000/svg','line');
    rail1.setAttribute('x1',s.x-dx);rail1.setAttribute('y1',s.y);
    rail1.setAttribute('x2',e.x-dx);rail1.setAttribute('y2',e.y);
    rail1.setAttribute('stroke','#22c55e');rail1.setAttribute('stroke-width','0.9');
    rail1.setAttribute('class','ladder-path');rail1.setAttribute('opacity','0.9');
    svg.appendChild(rail1);
    const rail2=document.createElementNS('http://www.w3.org/2000/svg','line');
    rail2.setAttribute('x1',s.x+dx);rail2.setAttribute('y1',s.y);
    rail2.setAttribute('x2',e.x+dx);rail2.setAttribute('y2',e.y);
    rail2.setAttribute('stroke','#22c55e');rail2.setAttribute('stroke-width','0.9');
    rail2.setAttribute('class','ladder-path');rail2.setAttribute('opacity','0.9');
    svg.appendChild(rail2);
    const dist=Math.sqrt((e.x-s.x)**2+(e.y-s.y)**2);
    const rungs=Math.max(2,Math.floor(dist/5));
    for(let i=1;i<rungs;i++){
      const t=i/rungs;
      const rx=s.x+(e.x-s.x)*t;
      const ry=s.y+(e.y-s.y)*t;
      const rung=document.createElementNS('http://www.w3.org/2000/svg','line');
      rung.setAttribute('x1',rx-dx);rung.setAttribute('y1',ry);
      rung.setAttribute('x2',rx+dx);rung.setAttribute('y2',ry);
      rung.setAttribute('stroke','#4ade80');rung.setAttribute('stroke-width','0.6');
      rung.setAttribute('class','ladder-path');rung.setAttribute('opacity','0.7');
      svg.appendChild(rung);
    }
  }

  // Draw snakes
  for(const[head,tail]of Object.entries(SNAKES)){
    const h=getCellCenter(parseInt(head));
    const t=getCellCenter(parseInt(tail));
    const dx=(t.x-h.x)*0.2;
    const dy=(t.y-h.y)*0.2;
    const snake=document.createElementNS('http://www.w3.org/2000/svg','path');
    snake.setAttribute('d',`M ${h.x} ${h.y} Q ${h.x+dx} ${h.y+dy} ${t.x} ${t.y}`);
    snake.setAttribute('stroke','#ef4444');
    snake.setAttribute('stroke-width','2');
    snake.setAttribute('class','snake-path');
    snake.setAttribute('opacity','0.8');
    svg.appendChild(snake);
  }
}

// =========== DICE ===========
function renderDice(val){
  const display = document.getElementById('diceDisplay');
  if(!display) return;
  display.innerHTML='';
  
  const faces = {
    1: [[1,1]],
    2: [[0,0],[2,2]],
    3: [[0,0],[1,1],[2,2]],
    4: [[0,0],[0,2],[2,0],[2,2]],
    5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
    6: [[0,0],[0,1],[0,2],[2,0],[2,1],[2,2]]
  };
  
  const pattern = faces[val] || faces[1];
  for(let i=0;i<9;i++){
    const dot = document.createElement('div');
    dot.className='dot';
    const row = Math.floor(i/3);
    const col = i%3;
    const isActive = pattern.some(([r,c]) => r===row && c===col);
    dot.style.background = isActive ? '#1e293b' : 'transparent';
    display.appendChild(dot);
  }
}

// =========== ROLLING ===========
async function doRoll(){
  if(!gameActive || diceRolling) return;
  
  diceRolling = true;
  document.getElementById('rollBtn').disabled = true;
  
  const display = document.getElementById('diceDisplay');
  display.classList.add('dice-rolling');
  
  const val = Math.floor(Math.random()*6)+1;
  
  await sleep(800);
  display.classList.remove('dice-rolling');
  renderDice(val);
  
  diceRolling = false;
  document.getElementById('rollBtn').disabled = false;
  
  await movePlayer(val);
}

function rollDice(){
  doRoll();
}

// =========== MOVEMENT ===========
async function movePlayer(val){
  const p=players[currentPlayer];
  const pName=p.name;

  addLog(`${pName} lempar 🎲 ${val}`);

  if(!hasEntered[currentPlayer]){
    if(val===6){
      hasEntered[currentPlayer]=true;
      p.position=1;
      addLog(`${pName} masuk papan! 🎉`);
      renderTokens();
      showToast(`${pName} masuk papan!`,'#22c55e');
      await sleep(600);
      consecutiveSixes=1;
      updateTurnIndicator();
      if(p.isBot) setTimeout(botTurn,1400);
      return;
    }else{
      addLog(`${pName} butuh 6 untuk masuk.`);
      consecutiveSixes=0;
      nextTurn();
      return;
    }
  }

  if(val===6){
    consecutiveSixes++;
    if(consecutiveSixes>=3){
      addLog(`${pName} dapat 3x 6! Giliran hangus 😵`);
      showToast('3x Enam! Giliran hangus!','#ef4444');
      consecutiveSixes=0;
      nextTurn();
      return;
    }
  }else{
    consecutiveSixes=0;
  }

  let newPos=p.position+val;

  if(newPos>100){
    const bounce=newPos-100;
    newPos=100-bounce;
    addLog(`${pName} memantul ke ${newPos}`);
  }

  const start=p.position;
  const distance = newPos-start;
  const steps = [];
  
  for(let i=1;i<=distance;i++){
    steps.push(start+i);
  }
  
  for(let step of steps){
    p.position=step;
    renderTokens();
    await sleep(130);
  }
  
  p.position=newPos;
  renderTokens();
  await sleep(350);

  if(p.position===100){
    addLog(`🏆 ${pName} MENANG!`);
    gameActive=false;
    showWin(pName, p.color);
    return;
  }

  if(SNAKES[p.position]){
    const to=SNAKES[p.position];
    showToast(`🐍 Ular! Turun ke ${to}`,'#ef4444');
    addLog(`🐍 ${pName} digigit ular! Turun ke ${to}`);
    await sleep(700);
    p.position=to;
    renderTokens();
    await sleep(350);
  }

  if(LADDERS[p.position]){
    const to=LADDERS[p.position];
    showToast(`🪜 Tangga! Naik ke ${to}`,'#22c55e');
    addLog(`🪜 ${pName} naik tangga ke ${to}`);
    await sleep(700);
    p.position=to;
    renderTokens();
    await sleep(350);
    if(p.position===100){
      addLog(`🏆 ${pName} MENANG!`);
      gameActive=false;
      showWin(pName, p.color);
      return;
    }
  }

  updateScoreboard();

  if(val===6){
    addLog(`${pName} dapat 6! Lempar lagi.`);
    showToast('Dapat 6! Lempar lagi! 🎉','#facc15');
    updateTurnIndicator();
    if(p.isBot) setTimeout(botTurn,1400);
    return;
  }

  nextTurn();
}

function nextTurn(){
  consecutiveSixes=0;
  currentPlayer=(currentPlayer+1)%players.length;
  updateTurnIndicator();
  updateScoreboard();
  if(players[currentPlayer].isBot && gameActive) setTimeout(botTurn,1200);
}

function botTurn(){
  if(!gameActive||diceRolling)return;
  doRoll();
}

// =========== TOKENS RENDERING (FIXED VERSION) ===========
function renderTokens(){
  document.querySelectorAll('.player-token').forEach(e=>e.remove());
  
  const posCount={};
  players.forEach((p,i)=>{
    // Skip pemain yang belum masuk (position 0)
    if(p.position===0)return;
    if(!posCount[p.position])posCount[p.position]=[];
    posCount[p.position].push(i);
  });
  
  players.forEach((p,i)=>{
    if(p.position===0)return;
    const cell=document.getElementById('cell-'+p.position);
    if(!cell)return;
    
    const tok=document.createElement('div');
    tok.className='player-token bounce-in';
    tok.style.background=p.color;
    tok.id='token-'+i;
    
    // FIXED: Posisi untuk multiple pemain di cell yang sama
    const samePos=posCount[p.position]||[];
    const idx=samePos.indexOf(i);
    
    // Offset yang lebih simple dan bekerja dengan baik
    const offsets=[
      {x:0, y:0},      // Center
      {x:20, y:-15},   // Top right
      {x:-20, y:-15},  // Top left
      {x:20, y:15},    // Bottom right
      {x:-20, y:15},   // Bottom left
      {x:0, y:-20}     // Top center
    ];
    
    const off=offsets[idx%offsets.length];
    
    // FIXED: Gunakan transform untuk positioning yang lebih akurat
    tok.style.left='50%';
    tok.style.top='50%';
    tok.style.transform=`translate(calc(-50% + ${off.x}px), calc(-50% + ${off.y}px))`;
    
    if(p.image){
      tok.innerHTML=`<img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.parentElement.textContent='${p.emoji}'">`;
    }else{
      tok.textContent=p.emoji;
    }
    
    cell.appendChild(tok);
  });
}

// =========== UI ===========
function updateTurnIndicator(){
  const el=document.getElementById('turnIndicator');
  const p=players[currentPlayer];
  if(!p)return;
  el.innerHTML=`
    <div class="flex items-center justify-center gap-3 mb-2">
      <span class="text-2xl">
        ${p.image ? `<img src="${p.image}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">` : p.emoji}
      </span>
      <div>
        <span class="font-bold text-lg" style="color:${p.color}">${p.name}</span>
        <span class="text-slate-400 text-xs block">${!hasEntered[currentPlayer]?'Butuh 6 untuk masuk':'Posisi: '+p.position}</span>
      </div>
    </div>
    ${p.isBot?'<div class="text-xs text-slate-400 mt-2">🤖 Bot sedang berpikir...</div>':''}
  `;
}

function updateScoreboard(){
  const el=document.getElementById('scoreboard');
  el.innerHTML='';
  players.forEach((p,i)=>{
    const row=document.createElement('div');
    row.className='player-row'+(i===currentPlayer?' active':'');
    row.innerHTML=`
      <div style="width:24px;height:24px;border-radius:50%;background:${p.color};display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;font-weight:bold">${p.image?'':p.emoji}</div>
      <span class="font-semibold flex-1 truncate">${p.name}${p.isBot?' 🤖':''}</span>
      <span class="text-slate-400 font-mono">${!hasEntered[i]?'Wait':p.position===100?'✨':p.position}</span>
    `;
    el.appendChild(row);
  });
}

function addLog(msg){
  const el=document.getElementById('gameLog');
  const d=document.createElement('div');
  d.textContent=msg;
  d.className='slide-up';
  el.prepend(d);
  if(el.children.length>60)el.lastChild.remove();
}

function clearLog(){
  document.getElementById('gameLog').innerHTML='';
}

function showToast(msg,bg){
  const t=document.createElement('div');
  t.className='toast';
  t.style.background=bg;
  t.style.color=bg==='#facc15'?'#1e293b':'#fff';
  t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2200);
}

function showWin(name,color){
  document.getElementById('winnerName').textContent='🎉 '+name+' Menang!';
  document.getElementById('winnerName').style.color=color;
  document.getElementById('winModal').classList.remove('hidden');
  launchConfetti();
}

function showRules(){document.getElementById('rulesModal').classList.remove('hidden')}
function closeRules(){document.getElementById('rulesModal').classList.add('hidden')}

function restartGame(){
  document.getElementById('winModal').classList.add('hidden');
  startGame();
}

function backToSetup(){
  document.getElementById('winModal').classList.add('hidden');
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('setupScreen').classList.remove('hidden');
  gameActive=false;
}

function launchConfetti(){
  const colors=['#ef4444','#3b82f6','#22c55e','#facc15','#a855f7','#f97316','#ec4899'];
  for(let i=0;i<80;i++){
    const c=document.createElement('div');
    c.className='confetti-piece';
    c.style.left=Math.random()*100+'%';
    c.style.top='-10px';
    c.style.width=Math.random()*10+5+'px';
    c.style.height=Math.random()*10+5+'px';
    c.style.background=colors[Math.floor(Math.random()*colors.length)];
    c.style.borderRadius=Math.random()>.5?'50%':'3px';
    c.style.animation=`confettiFall ${Math.random()*2.5+2}s linear forwards`;
    c.style.animationDelay=Math.random()*0.6+'s';
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),4500);
  }
}

function sleep(ms){return new Promise(r=>setTimeout(r,ms))}

// Init
setMode('friends');
buildPlayerSetup();
lucide.createIcons();