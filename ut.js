// =========== CONFIG ===========
const defaultConfig={game_title:'Ular Tangga',bg_color:'#0f172a',surface_color:'#1e293b',text_color:'#f1f5f9',accent_color:'#facc15',accent2_color:'#38bdf8',font_family:'Fredoka',font_size:16};
let currentConfig={...defaultConfig};
function applyConfig(cfg){
  currentConfig={...defaultConfig,...cfg};
  const r=document.documentElement.style;
  r.setProperty('--bg',currentConfig.bg_color);
  r.setProperty('--surface',currentConfig.surface_color);
  r.setProperty('--text',currentConfig.text_color);
  r.setProperty('--accent',currentConfig.accent_color);
  r.setProperty('--accent2',currentConfig.accent2_color);
  document.body.style.fontFamily=`${currentConfig.font_family},Fredoka,sans-serif`;
  ['gameTitle','gameTitleBar'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=currentConfig.game_title;});
}
if(window.elementSdk){
  window.elementSdk.init({defaultConfig,onConfigChange:async(cfg)=>applyConfig(cfg),
    mapToCapabilities:(cfg)=>({recolorables:[
      {get:()=>cfg.bg_color||defaultConfig.bg_color,set:(v)=>{cfg.bg_color=v;window.elementSdk.setConfig({bg_color:v})}},
      {get:()=>cfg.surface_color||defaultConfig.surface_color,set:(v)=>{cfg.surface_color=v;window.elementSdk.setConfig({surface_color:v})}},
      {get:()=>cfg.text_color||defaultConfig.text_color,set:(v)=>{cfg.text_color=v;window.elementSdk.setConfig({text_color:v})}},
      {get:()=>cfg.accent_color||defaultConfig.accent_color,set:(v)=>{cfg.accent_color=v;window.elementSdk.setConfig({accent_color:v})}},
      {get:()=>cfg.accent2_color||defaultConfig.accent2_color,set:(v)=>{cfg.accent2_color=v;window.elementSdk.setConfig({accent2_color:v})}}
    ],borderables:[],
    fontEditable:{get:()=>cfg.font_family||defaultConfig.font_family,set:(v)=>{cfg.font_family=v;window.elementSdk.setConfig({font_family:v})}},
    fontSizeable:{get:()=>cfg.font_size||defaultConfig.font_size,set:(v)=>{cfg.font_size=v;window.elementSdk.setConfig({font_size:v})}}}),
    mapToEditPanelValues:(cfg)=>new Map([['game_title',cfg.game_title||defaultConfig.game_title]])
  });
}
applyConfig(defaultConfig);

// =========== CONSTANTS ===========
const COLORS=['#ef4444','#3b82f6','#22c55e','#a855f7','#f97316','#ec4899'];
const EMOJIS=['🔴','🔵','🟢','🟣','🟠','🩷','♟️','🎯'];
const SNAKES={16:6,47:26,49:11,56:53,62:19,64:60,87:24,93:73,95:75,98:78};
const LADDERS={1:38,4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:100};

// =========== STATE ===========
let gameMode='friends',playerCount=2,players=[],currentPlayer=0;
let gameActive=false,diceRolling=false,consecutiveSixes=0,hasEntered=[];
const playerImages={};

// =========== SETUP ===========
function setMode(m){
  gameMode=m;
  document.getElementById('modeFriends').className='mode-btn'+(m==='friends'?' active-friends':'');
  document.getElementById('modeBot').className='mode-btn'+(m==='bot'?' active-bot':'');
  buildPlayerSetup();
}

function updatePlayerCount(v){
  playerCount=parseInt(v);
  document.getElementById('playerCountLabel').textContent=v;
  const b=document.getElementById('countBadge');if(b)b.textContent=v;
  buildPlayerSetup();
}

function buildPlayerSetup(){
  const c=document.getElementById('playersSetup');
  c.innerHTML='';
  for(let i=0;i<playerCount;i++){
    const isBot=gameMode==='bot'&&i>0;
    const div=document.createElement('div');
    div.className='player-setup-card slide-up';
    div.style.animationDelay=`${i*50}ms`;
    div.innerHTML=`
      <div class="player-setup-header">
        <span style="font-size:16px">${isBot?'🤖':'👤'}</span>
        <input type="text" value="${isBot?'Bot '+i:'Pemain '+(i+1)}" data-player="${i}" maxlength="14">
      </div>
      <div class="color-row">
        <span class="row-label">Warna</span>
        ${COLORS.map((col,ci)=>`<div class="color-pick${ci===i?' selected':''}" style="background:${col}" data-player="${i}" data-color="${col}" onclick="pickColor(${i},'${col}',this)"></div>`).join('')}
      </div>
      <div class="emoji-row">
        <span class="row-label">Pion</span>
        ${EMOJIS.map((em,ei)=>`<div class="emoji-pick${ei===i?' selected':''}" data-player="${i}" data-emoji="${em}" onclick="pickEmoji(${i},'${em}',this)">${em}</div>`).join('')}
        <label class="img-label"><span>📷</span> Foto<input type="file" accept="image/*" onchange="pickImage(${i},this)"></label>
        <span id="imgOk${i}" class="img-ok" style="display:none">✅</span>
      </div>
    `;
    c.appendChild(div);
  }
}

function pickColor(pi,col,el){
  document.querySelectorAll(`.color-pick[data-player="${pi}"]`).forEach(e=>e.classList.remove('selected'));
  el.classList.add('selected');
}
function pickEmoji(pi,em,el){
  document.querySelectorAll(`.emoji-pick[data-player="${pi}"]`).forEach(e=>e.classList.remove('selected'));
  el.classList.add('selected');
  playerImages[pi]=null;
  const ok=document.getElementById('imgOk'+pi);
  if(ok)ok.style.display='none';
}
function pickImage(pi,inp){
  if(inp.files&&inp.files[0]){
    const r=new FileReader();
    r.onload=e=>{
      playerImages[pi]=e.target.result;
      const ok=document.getElementById('imgOk'+pi);
      if(ok)ok.style.display='inline';
      document.querySelectorAll(`.emoji-pick[data-player="${pi}"]`).forEach(e=>e.classList.remove('selected'));
    };
    r.readAsDataURL(inp.files[0]);
  }
}

// =========== START ============
function startGame(){
  players=[];hasEntered=[];
  for(let i=0;i<playerCount;i++){
    const nameEl=document.querySelector(`input[data-player="${i}"]`);
    const colorEl=document.querySelector(`.color-pick.selected[data-player="${i}"]`);
    const emojiEl=document.querySelector(`.emoji-pick.selected[data-player="${i}"]`);
    players.push({
      name:nameEl?nameEl.value.trim()||('Pemain '+(i+1)):('Pemain '+(i+1)),
      color:colorEl?colorEl.dataset.color:COLORS[i%COLORS.length],
      emoji:emojiEl?emojiEl.dataset.emoji:EMOJIS[i%EMOJIS.length],
      image:playerImages[i]||null,
      position:0,
      isBot:gameMode==='bot'&&i>0
    });
    hasEntered.push(false);
  }
  currentPlayer=0;consecutiveSixes=0;gameActive=true;
  document.getElementById('setupScreen').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('hidden');
  buildBoard();
  drawSnakesLadders();
  renderDice(1);
  updateAll();
  clearLog();
  addLog('🎲 Permainan dimulai! Lempar 6 untuk masuk papan.');
  if(players[currentPlayer].isBot)setTimeout(botTurn,1200);
}

// =========== BOARD ===========
function buildBoard(){
  const board=document.getElementById('board');
  board.innerHTML='';
  for(let row=0;row<10;row++){
    for(let col=0;col<10;col++){
      const num=row%2===0?100-row*10-col:100-row*10+col-9;
      const cell=document.createElement('div');
      cell.className='cell';
      const alt=(row+col)%2===0;
      cell.classList.add(alt?'c-a':'c-b');
      if(SNAKES[num])cell.classList.add('c-snake');
      if(LADDERS[num])cell.classList.add('c-ladder');
      if(num===100)cell.classList.add('c-end');
      if(num===1)cell.classList.add('c-start');
      cell.innerHTML=`<span class="cell-num">${num}</span>`;
      cell.id='cell-'+num;
      board.appendChild(cell);
    }
  }
  renderTokens();
}

function getCellCenter(num){
  if(num<1||num>100)return{x:5,y:95};
  const fromBottom=num-1;
  const rowFromBottom=Math.floor(fromBottom/10);
  const row=9-rowFromBottom;
  const posInRow=fromBottom%10;
  const col=rowFromBottom%2===0?posInRow:9-posInRow;
  return{x:col*10+5,y:row*10+5};
}

function drawSnakesLadders(){
  const svg=document.getElementById('snakeSvg');
  svg.innerHTML='';
  // Ladders
  for(const[start,end]of Object.entries(LADDERS)){
    const s=getCellCenter(+start);const e=getCellCenter(+end);
    const dx=1.2;
    ['',''].forEach((_,si)=>{
      const line=document.createElementNS('http://www.w3.org/2000/svg','line');
      const off=si===0?-dx:dx;
      line.setAttribute('x1',s.x+off);line.setAttribute('y1',s.y);
      line.setAttribute('x2',e.x+off);line.setAttribute('y2',e.y);
      line.setAttribute('stroke','#22c55e');line.setAttribute('stroke-width','0.85');line.setAttribute('opacity','0.9');
      svg.appendChild(line);
    });
    const dist=Math.sqrt((e.x-s.x)**2+(e.y-s.y)**2);
    const rungs=Math.max(2,Math.floor(dist/5));
    for(let i=1;i<rungs;i++){
      const t=i/rungs;
      const rx=s.x+(e.x-s.x)*t;const ry=s.y+(e.y-s.y)*t;
      const rung=document.createElementNS('http://www.w3.org/2000/svg','line');
      rung.setAttribute('x1',rx-dx);rung.setAttribute('y1',ry);
      rung.setAttribute('x2',rx+dx);rung.setAttribute('y2',ry);
      rung.setAttribute('stroke','#4ade80');rung.setAttribute('stroke-width','0.5');rung.setAttribute('opacity','0.7');
      svg.appendChild(rung);
    }
  }
  // Snakes
  for(const[head,tail]of Object.entries(SNAKES)){
    const h=getCellCenter(+head);const t=getCellCenter(+tail);
    const cpx=h.x+(t.x-h.x)*0.5+(t.y-h.y)*0.25;
    const cpy=h.y+(t.y-h.y)*0.5-(t.x-h.x)*0.25;
    const snake=document.createElementNS('http://www.w3.org/2000/svg','path');
    snake.setAttribute('d',`M${h.x},${h.y} Q${cpx},${cpy} ${t.x},${t.y}`);
    snake.setAttribute('stroke','#ef4444');snake.setAttribute('stroke-width','1.8');
    snake.setAttribute('fill','none');snake.setAttribute('stroke-linecap','round');snake.setAttribute('opacity','0.85');
    svg.appendChild(snake);
    // Head dot
    const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('cx',h.x);circle.setAttribute('cy',h.y);circle.setAttribute('r','1.5');
    circle.setAttribute('fill','#fca5a5');
    svg.appendChild(circle);
  }
}

// =========== TOKENS ===========
function renderTokens(){
  document.querySelectorAll('.token').forEach(e=>e.remove());
  const posMap={};
  players.forEach((p,i)=>{
    if(p.position===0)return;
    if(!posMap[p.position])posMap[p.position]=[];
    posMap[p.position].push(i);
  });
  // Token size: based on cell size
  const board=document.getElementById('board');
  const cellW=board.offsetWidth/10;
  const tokenSize=Math.max(14,Math.min(cellW*0.55,32));
  const fontSize=Math.max(8,tokenSize*0.52);

  players.forEach((p,i)=>{
    if(p.position===0)return;
    const cell=document.getElementById('cell-'+p.position);
    if(!cell)return;
    const samePos=posMap[p.position];
    const idx=samePos.indexOf(i);
    const total=samePos.length;
    // offset pattern for up to 6 players sharing a cell
    const offsets=[
      [{x:0,y:0}],
      [{x:-28,y:0},{x:28,y:0}],
      [{x:0,y:-28},{x:-28,y:22},{x:28,y:22}],
      [{x:-28,y:-20},{x:28,y:-20},{x:-28,y:20},{x:28,y:20}],
      [{x:0,y:-30},{x:-28,y:-10},{x:28,y:-10},{x:-28,y:20},{x:28,y:20}],
      [{x:-28,y:-20},{x:0,y:-28},{x:28,y:-20},{x:-28,y:20},{x:0,y:28},{x:28,y:20}]
    ];
    const scale=tokenSize/32; // scale offsets relative to 32px base
    const off=(offsets[Math.min(total-1,5)]||offsets[0])[idx]||{x:0,y:0};
    const tok=document.createElement('div');
    tok.className='token';
    tok.id='token-'+i;
    tok.style.cssText=`
      width:${tokenSize}px;height:${tokenSize}px;
      font-size:${fontSize}px;
      background:${p.color};
      left:50%;top:50%;
      transform:translate(calc(-50% + ${off.x*scale}px), calc(-50% + ${off.y*scale}px));
    `;
    if(p.image){
      tok.innerHTML=`<img src="${p.image}" alt="" onerror="this.parentElement.textContent='${p.emoji}'">`;
    }else{
      tok.textContent=p.emoji;
    }
    cell.appendChild(tok);
  });
}

// =========== DICE ===========
function renderDice(val){
  const d=document.getElementById('diceDisplay');if(!d)return;
  d.innerHTML='';
  const faces={1:[[1,1]],2:[[0,0],[2,2]],3:[[0,0],[1,1],[2,2]],4:[[0,0],[0,2],[2,0],[2,2]],5:[[0,0],[0,2],[1,1],[2,0],[2,2]],6:[[0,0],[0,1],[0,2],[2,0],[2,1],[2,2]]};
  const pattern=faces[val]||faces[1];
  for(let i=0;i<9;i++){
    const r=Math.floor(i/3);const c=i%3;
    const dot=document.createElement('div');
    dot.className='dot';
    dot.style.background=pattern.some(([pr,pc])=>pr===r&&pc===c)?'#1e293b':'transparent';
    d.appendChild(dot);
  }
}

// =========== ROLLING ===========
async function doRoll(){
  if(!gameActive||diceRolling)return;
  diceRolling=true;
  const btn=document.getElementById('rollBtn');
  if(btn)btn.disabled=true;
  const d=document.getElementById('diceDisplay');
  d.classList.add('dice-rolling');
  const val=Math.floor(Math.random()*6)+1;
  await sleep(700);
  d.classList.remove('dice-rolling');
  renderDice(val);
  diceRolling=false;
  if(btn)btn.disabled=false;
  await movePlayer(val);
}

function rollDice(){if(!players[currentPlayer]?.isBot)doRoll();}

// =========== MOVEMENT ===========
async function movePlayer(val){
  const p=players[currentPlayer];
  const pName=p.name;
  addLog(`${pName} 🎲 ${val}`);

  if(!hasEntered[currentPlayer]){
    if(val===6){
      hasEntered[currentPlayer]=true;
      p.position=1;
      addLog(`✅ ${pName} masuk papan!`);
      renderTokens();showToast(`${pName} masuk papan! 🎉`,'#22c55e');
      await sleep(500);
      consecutiveSixes=1;
      updateAll();
      if(p.isBot)setTimeout(botTurn,1300);
      return;
    }else{
      addLog(`${pName} butuh 6 untuk masuk.`);
      consecutiveSixes=0;nextTurn();return;
    }
  }

  if(val===6){
    consecutiveSixes++;
    if(consecutiveSixes>=3){
      addLog(`😵 ${pName} dapat 3x 6! Giliran hangus.`);
      showToast('3x Enam! Giliran hangus!','#ef4444');
      consecutiveSixes=0;nextTurn();return;
    }
  }else{consecutiveSixes=0;}

  let newPos=p.position+val;
  if(newPos>100){
    const bounce=newPos-100;newPos=100-bounce;
    addLog(`↩️ ${pName} memantul ke ${newPos}`);
  }

  // Animate step by step
  const start=p.position;
  for(let s=start+1;s<=newPos;s++){
    p.position=s;renderTokens();await sleep(110);
  }
  p.position=newPos;renderTokens();await sleep(300);

  if(p.position===100){
    addLog(`🏆 ${pName} MENANG!`);gameActive=false;showWin(pName,p.color);return;
  }

  if(SNAKES[p.position]){
    const to=SNAKES[p.position];
    showToast(`🐍 Ular! ${pName} turun ke ${to}`,'#ef4444');
    addLog(`🐍 ${pName} digigit ular! Turun ke ${to}`);
    await sleep(600);p.position=to;renderTokens();await sleep(300);
  }
  if(LADDERS[p.position]){
    const to=LADDERS[p.position];
    showToast(`🪜 Tangga! ${pName} naik ke ${to}`,'#22c55e');
    addLog(`🪜 ${pName} naik tangga ke ${to}`);
    await sleep(600);p.position=to;renderTokens();await sleep(300);
    if(p.position===100){
      addLog(`🏆 ${pName} MENANG!`);gameActive=false;showWin(pName,p.color);return;
    }
  }

  updateAll();
  if(val===6){
    addLog(`${pName} dapat 6! Lempar lagi.`);
    showToast('Dapat 6! Lempar lagi! 🎉','#facc15');
    updateAll();
    if(p.isBot)setTimeout(botTurn,1300);
    return;
  }
  nextTurn();
}

function nextTurn(){
  consecutiveSixes=0;
  currentPlayer=(currentPlayer+1)%players.length;
  updateAll();
  if(players[currentPlayer].isBot&&gameActive)setTimeout(botTurn,1200);
}

function botTurn(){if(!gameActive||diceRolling)return;doRoll();}

// =========== UI ===========
function updateAll(){updateTurnIndicator();updateScoreboard();}

function updateTurnIndicator(){
  const el=document.getElementById('turnIndicator');
  const p=players[currentPlayer];if(!p)return;
  el.innerHTML=`
    <div class="turn-avatar" style="border-color:${p.color}">
      ${p.image?`<img src="${p.image}" alt="">`:p.emoji}
    </div>
    <div class="turn-info">
      <div class="turn-name" style="color:${p.color}">${p.name}${p.isBot?' 🤖':''}</div>
      <div class="turn-sub">${!hasEntered[currentPlayer]?'Butuh 6 untuk masuk':'Posisi: '+p.position}</div>
    </div>
  `;
}

function updateScoreboard(){
  const el=document.getElementById('scoreboard');
  el.innerHTML='';
  players.forEach((p,i)=>{
    const row=document.createElement('div');
    row.className='score-row'+(i===currentPlayer?' active':'');
    row.innerHTML=`
      <div class="score-avatar" style="background:${p.color}">
        ${p.image?`<img src="${p.image}" alt="">`:p.emoji}
      </div>
      <span class="score-name">${p.name}${p.isBot?' 🤖':''}</span>
      <span class="score-pos">${!hasEntered[i]?'—':p.position===100?'🏆':p.position}</span>
    `;
    el.appendChild(row);
  });
}

function addLog(msg){
  const el=document.getElementById('gameLog');
  const d=document.createElement('div');
  d.className='log-entry';d.textContent=msg;
  el.prepend(d);
  while(el.children.length>50)el.lastChild.remove();
}
function clearLog(){document.getElementById('gameLog').innerHTML='';}

function showToast(msg,bg){
  document.querySelectorAll('.toast').forEach(t=>t.remove());
  const t=document.createElement('div');
  t.className='toast';
  t.style.background=bg;
  t.style.color=bg==='#facc15'||bg==='#22c55e'?'#1e293b':'#fff';
  t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2000);
}

function showWin(name,color){
  document.getElementById('winnerName').textContent=name+' Menang! 🏆';
  document.getElementById('winnerName').style.color=color;
  document.getElementById('winModal').classList.remove('hidden');
  launchConfetti();
}

function showRules(){document.getElementById('rulesModal').classList.remove('hidden');}
function closeRules(){document.getElementById('rulesModal').classList.add('hidden');}
function restartGame(){document.getElementById('winModal').classList.add('hidden');startGame();}
function backToSetup(){
  document.getElementById('winModal').classList.add('hidden');
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('setupScreen').classList.remove('hidden');
  gameActive=false;
}

function launchConfetti(){
  const cols=['#ef4444','#3b82f6','#22c55e','#facc15','#a855f7','#f97316'];
  for(let i=0;i<70;i++){
    const c=document.createElement('div');
    c.className='confetti';
    c.style.left=Math.random()*100+'%';
    c.style.top='-12px';
    c.style.width=(Math.random()*8+4)+'px';
    c.style.height=(Math.random()*8+4)+'px';
    c.style.background=cols[Math.floor(Math.random()*cols.length)];
    c.style.borderRadius=Math.random()>.5?'50%':'2px';
    c.style.animation=`confettiFall ${Math.random()*2+2.5}s linear ${Math.random()*0.5}s forwards`;
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),4000);
  }
}

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

// Re-render tokens on resize
let resizeTimer;
window.addEventListener('resize',()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(()=>{if(gameActive)renderTokens();},150);
});

// =========== INIT ===========
setMode('friends');
