/* ─── DATA ────────────────────────────────────────────── */
const COLORS=['#00ff88','#ff6b35','#a78bfa','#38bdf8','#fb7185','#fbbf24','#34d399','#f472b6','#60a5fa','#ff4444','#ffffff','#aaffcc','#ffaa00','#00ccff','#cc44ff','#ff8800'];
const SHAPES=[{id:'classic',label:'Classic'},{id:'raptor',label:'Raptor'},{id:'rex',label:'T-Rex'},{id:'quad',label:'Quadro'},{id:'robo',label:'Robo'},{id:'ghost',label:'Ghost'}];
const ACCESSORIES=[{id:'none',label:'Kosong'},{id:'hat',label:'Topi'},{id:'crown',label:'Mahkota'},{id:'glasses',label:'Kacamata'},{id:'flame',label:'Api'},{id:'wings',label:'Sayap'}];
const TRAILS=[{id:'none',label:'Kosong',icon:'⬛'},{id:'star',label:'Bintang',icon:'⭐'},{id:'fire',label:'Api',icon:'🔥'},{id:'ice',label:'Es',icon:'❄️'},{id:'rainbow',label:'Pelangi',icon:'🌈'}];
const DIFF_CFG={easy:{obstInterval:[2200,4200],speedInc:.0007,birdChance:.18},medium:{obstInterval:[1400,3000],speedInc:.0015,birdChance:.33},hard:{obstInterval:[700,1900],speedInc:.0025,birdChance:.50}};

/* ─── STATE ───────────────────────────────────────────── */
let cfg={shape:'classic',color:'#00ff88',accessory:'none',trail:'star',size:100,speed:3,difficulty:'easy',nightMode:true,particles:true,shadow:true,randomObst:true};

/* ─── STARS ───────────────────────────────────────────── */
(()=>{const c=document.getElementById('starsBg');for(let i=0;i<70;i++){const s=document.createElement('div');s.className='star';const sz=Math.random()*2+.4;s.style.cssText=`width:${sz}px;height:${sz}px;top:${Math.random()*100}%;left:${Math.random()*100}%;--d:${2+Math.random()*3}s;--dl:${Math.random()*3}s`;c.appendChild(s);}})();

/* ─── COLOR UTILS ─────────────────────────────────────── */
function hexRgb(h){return{r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)}}
function lighten(h,a){const{r,g,b}=hexRgb(h);return`rgb(${Math.min(255,r+a)},${Math.min(255,g+a)},${Math.min(255,b+a)})`}
function darken(h,a){const{r,g,b}=hexRgb(h);return`rgb(${Math.max(0,r-a)},${Math.max(0,g-a)},${Math.max(0,b-a)})`}

/* ─── DRAW DINO ───────────────────────────────────────── */
function drawDino(ctx,x,y,sc,color,shape,acc,frame,duck){
  ctx.save();ctx.translate(x,y);const s=sc;
  if(cfg.shadow){ctx.save();ctx.globalAlpha=.2;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(s*20,s*3,s*18,s*4,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  if(duck){
    ctx.fillStyle=color;
    ctx.fillRect(s*2,-s*18,s*36,s*18);ctx.fillRect(s*8,0,s*7,s*6);ctx.fillRect(s*22,0,s*7,s*6);ctx.fillRect(s*30,-s*28,s*16,s*18);
    ctx.fillStyle='#fff';ctx.fillRect(s*40,-s*24,s*4,s*4);ctx.fillStyle='#111';ctx.fillRect(s*41,-s*23,s*2,s*2);
    ctx.restore();return;
  }
  if(shape==='classic'){
    ctx.fillStyle=color;ctx.fillRect(s*6,-s*32,s*24,s*20);ctx.fillRect(s*22,-s*44,s*12,s*14);ctx.fillRect(s*20,-s*56,s*20,s*16);
    ctx.fillStyle=lighten(color,40);ctx.fillRect(s*34,-s*50,s*8,s*6);ctx.fillStyle='#fff';ctx.fillRect(s*24,-s*52,s*6,s*6);ctx.fillStyle='#111';ctx.fillRect(s*26,-s*51,s*3,s*3);
    ctx.fillStyle=color;ctx.fillRect(0,-s*28,s*8,s*10);ctx.fillRect(-s*4,-s*22,s*6,s*6);
    const lo=frame%2===0?0:s*3;ctx.fillRect(s*10,-s*12,s*7,s*12+lo);ctx.fillRect(s*20,-s*12,s*7,s*12-lo+s*3);ctx.fillRect(s*26,-s*28,s*8,s*6);
  }else if(shape==='raptor'){
    ctx.fillStyle=color;ctx.fillRect(s*8,-s*28,s*20,s*18);ctx.fillRect(s*20,-s*40,s*10,s*14);ctx.fillRect(s*18,-s*52,s*18,s*14);
    ctx.fillStyle=lighten(color,50);ctx.fillRect(s*32,-s*46,s*6,s*5);ctx.fillStyle='#fff';ctx.fillRect(s*22,-s*48,s*5,s*5);ctx.fillStyle='#111';ctx.fillRect(s*24,-s*47,s*2,s*2);
    ctx.fillStyle=color;ctx.fillRect(-s*2,-s*24,s*12,s*8);ctx.fillRect(-s*6,-s*18,s*7,s*5);ctx.fillRect(-s*10,-s*14,s*6,s*4);
    const lo=frame%2===0?0:s*4;ctx.fillRect(s*10,-s*10,s*6,s*10+lo);ctx.fillRect(s*20,-s*10,s*6,s*10-lo+s*3);
  }else if(shape==='rex'){
    ctx.fillStyle=color;ctx.fillRect(s*4,-s*36,s*28,s*26);ctx.fillRect(s*22,-s*52,s*16,s*18);ctx.fillRect(s*18,-s*60,s*24,s*14);
    ctx.fillStyle=lighten(color,30);ctx.fillRect(s*36,-s*54,s*10,s*8);ctx.fillStyle='#fff';ctx.fillRect(s*22,-s*56,s*7,s*7);ctx.fillStyle='#111';ctx.fillRect(s*24,-s*55,s*4,s*4);
    ctx.fillStyle=color;ctx.fillRect(0,-s*32,s*7,s*14);ctx.fillRect(-s*4,-s*24,s*6,s*8);ctx.fillRect(s*28,-s*34,s*10,s*6);ctx.fillRect(s*30,-s*30,s*8,s*5);
    const lo=frame%2===0?0:s*3;ctx.fillRect(s*8,-s*10,s*9,s*10+lo);ctx.fillRect(s*22,-s*10,s*9,s*10-lo+s*3);
  }else if(shape==='quad'){
    ctx.fillStyle=color;ctx.fillRect(0,-s*22,s*36,s*16);ctx.fillRect(s*26,-s*36,s*12,s*16);ctx.fillRect(s*22,-s*48,s*18,s*14);
    ctx.fillStyle='#fff';ctx.fillRect(s*26,-s*44,s*5,s*5);ctx.fillStyle='#111';ctx.fillRect(s*28,-s*43,s*2,s*2);ctx.fillStyle=color;ctx.fillRect(-s*4,-s*18,s*8,s*8);
    const lo=frame%2===0?0:s*3;ctx.fillRect(s*2,-s*6,s*7,s*6+lo);ctx.fillRect(s*12,-s*6,s*7,s*6-lo+s*2);ctx.fillRect(s*22,-s*6,s*7,s*6+lo);ctx.fillRect(s*30,-s*6,s*7,s*6-lo+s*2);
  }else if(shape==='robo'){
    ctx.fillStyle=darken(color,20);ctx.fillRect(s*5,-s*34,s*26,s*22);ctx.fillStyle=color;ctx.fillRect(s*7,-s*32,s*22,s*18);
    ctx.fillStyle=darken(color,30);ctx.fillRect(s*9,-s*30,s*3,s*3);ctx.fillRect(s*24,-s*30,s*3,s*3);ctx.fillRect(s*9,-s*20,s*3,s*3);ctx.fillRect(s*24,-s*20,s*3,s*3);
    ctx.fillStyle=darken(color,10);ctx.fillRect(s*16,-s*52,s*18,s*20);
    ctx.fillStyle='#00ffff';ctx.globalAlpha=.7;ctx.fillRect(s*18,-s*50,s*14,s*8);ctx.globalAlpha=1;
    ctx.fillStyle='#fff';ctx.fillRect(s*20,-s*48,s*4,s*4);ctx.fillRect(s*26,-s*48,s*4,s*4);ctx.fillStyle='#000';ctx.fillRect(s*21,-s*47,s*2,s*2);ctx.fillRect(s*27,-s*47,s*2,s*2);
    ctx.fillStyle=color;ctx.fillRect(s*22,-s*58,s*3,s*8);ctx.fillRect(s*20,-s*60,s*7,s*4);
    ctx.fillStyle=darken(color,15);ctx.fillRect(0,-s*28,s*8,s*10);ctx.fillRect(-s*2,-s*22,s*5,s*6);
    const lo=frame%2===0?0:s*3;ctx.fillStyle=darken(color,20);ctx.fillRect(s*10,-s*12,s*8,s*12+lo);ctx.fillRect(s*22,-s*12,s*8,s*12-lo+s*3);
    ctx.fillStyle='#111';ctx.fillRect(s*8,0,s*12,s*4);ctx.fillRect(s*20,0,s*12,s*4);
  }else if(shape==='ghost'){
    ctx.globalAlpha=.85;ctx.fillStyle=color;
    ctx.beginPath();ctx.moveTo(s*4,0);ctx.quadraticCurveTo(s*8,-s*6,s*14,0);ctx.quadraticCurveTo(s*20,-s*6,s*26,0);ctx.quadraticCurveTo(s*32,-s*4,s*36,0);ctx.lineTo(s*36,-s*40);ctx.quadraticCurveTo(s*28,-s*52,s*20,-s*52);ctx.quadraticCurveTo(s*10,-s*54,s*4,-s*44);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle='rgba(0,0,0,.8)';ctx.beginPath();ctx.ellipse(s*16,-s*40,s*4,s*5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(s*26,-s*40,s*4,s*5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.ellipse(s*17,-s*41,s*2,s*2.5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(s*27,-s*41,s*2,s*2.5,0,0,Math.PI*2);ctx.fill();
    ctx.shadowColor=color;ctx.shadowBlur=12;ctx.strokeStyle=color;ctx.lineWidth=1;ctx.stroke();ctx.shadowBlur=0;
  }
  // Accessories
  if(acc==='hat'){ctx.fillStyle='#1a1a2e';ctx.fillRect(s*18,-s*66,s*22,s*8);ctx.fillRect(s*14,-s*58,s*30,s*5);ctx.fillStyle='#ff4444';ctx.fillRect(s*18,-s*61,s*22,s*4);}
  else if(acc==='crown'){ctx.fillStyle='#ffd700';ctx.fillRect(s*16,-s*64,s*24,s*10);ctx.fillRect(s*14,-s*66,s*4,s*4);ctx.fillRect(s*22,-s*68,s*4,s*6);ctx.fillRect(s*30,-s*66,s*4,s*4);ctx.fillStyle='#ff4444';ctx.fillRect(s*19,-s*62,s*3,s*3);ctx.fillStyle='#4444ff';ctx.fillRect(s*27,-s*62,s*3,s*3);}
  else if(acc==='glasses'){ctx.strokeStyle='#444';ctx.lineWidth=s*1.5;ctx.strokeRect(s*19,-s*53,s*8,s*6);ctx.strokeRect(s*27,-s*53,s*8,s*6);ctx.fillStyle='rgba(100,200,255,.3)';ctx.fillRect(s*19,-s*53,s*8,s*6);ctx.fillRect(s*27,-s*53,s*8,s*6);}
  else if(acc==='flame'){ctx.globalAlpha=.88;const fl=Math.sin(Date.now()/100)*2;ctx.fillStyle='#ff4400';ctx.beginPath();ctx.moveTo(s*24,-s*62+fl);ctx.quadraticCurveTo(s*18,-s*74,s*24,-s*82+fl);ctx.quadraticCurveTo(s*30,-s*74,s*24,-s*62+fl);ctx.fill();ctx.fillStyle='#ffaa00';ctx.beginPath();ctx.moveTo(s*24,-s*64+fl);ctx.quadraticCurveTo(s*20,-s*72,s*24,-s*78+fl);ctx.quadraticCurveTo(s*28,-s*72,s*24,-s*64+fl);ctx.fill();ctx.globalAlpha=1;}
  else if(acc==='wings'){ctx.fillStyle=lighten(color,30);ctx.globalAlpha=.8;ctx.beginPath();ctx.moveTo(s*6,-s*28);ctx.quadraticCurveTo(-s*10,-s*44,0,-s*16);ctx.quadraticCurveTo(s*4,-s*24,s*6,-s*28);ctx.fill();ctx.beginPath();ctx.moveTo(s*30,-s*28);ctx.quadraticCurveTo(s*46,-s*44,s*36,-s*16);ctx.quadraticCurveTo(s*32,-s*24,s*30,-s*28);ctx.fill();ctx.globalAlpha=1;}
  ctx.restore();
}

function drawCactus(ctx,x,y,type){
  ctx.fillStyle='#2a5a22';
  if(type===0){ctx.fillRect(x-8,y-50,16,50);ctx.fillRect(x-20,y-36,12,8);ctx.fillRect(x-20,y-44,8,10);ctx.fillRect(x+8,y-30,12,8);ctx.fillRect(x+12,y-38,8,10);}
  else if(type===1){ctx.fillRect(x-6,y-40,12,40);ctx.fillRect(x+14,y-40,12,40);ctx.fillRect(x-18,y-28,12,6);ctx.fillRect(x-18,y-34,8,8);ctx.fillRect(x+6,y-24,12,6);ctx.fillRect(x+10,y-30,8,8);}
  else{ctx.fillRect(x-5,y-60,10,60);ctx.fillRect(x-18,y-40,13,5);ctx.fillRect(x-18,y-48,5,12);ctx.fillRect(x+5,y-36,13,5);ctx.fillRect(x+13,y-44,5,12);}
}

function drawBird(ctx,x,y,frame){
  ctx.fillStyle='#4a8ad9';ctx.fillRect(x-12,y-6,24,12);ctx.fillRect(x+8,y-10,14,10);
  ctx.fillStyle='#f4a261';ctx.fillRect(x+20,y-7,8,4);ctx.fillStyle='#fff';ctx.fillRect(x+10,y-8,5,5);ctx.fillStyle='#111';ctx.fillRect(x+11,y-7,3,3);
  ctx.fillStyle='#4a8ad9';if(frame%2===0){ctx.fillRect(x-8,y-16,18,8)}else{ctx.fillRect(x-8,y+4,18,8)}ctx.fillRect(x-20,y-4,10,8);
}

/* ─── BUILD MENU ──────────────────────────────────────── */
function buildMenu(){
  buildShapeGrid();buildColorGrid();buildAccessoryGrid();buildTrailGrid();
  document.getElementById('sizeSlider').addEventListener('input',function(){cfg.size=+this.value;document.getElementById('sizeVal').textContent=this.value+'%';updatePreview()});
  document.getElementById('speedSlider').addEventListener('input',function(){cfg.speed=+this.value;document.getElementById('speedVal').textContent=this.value});
  document.querySelectorAll('.diff-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.diff-btn').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');cfg.difficulty=b.dataset.diff}));
  document.getElementById('nightToggle').addEventListener('change',function(){cfg.nightMode=this.checked});
  document.getElementById('particleToggle').addEventListener('change',function(){cfg.particles=this.checked});
  document.getElementById('shadowToggle').addEventListener('change',function(){cfg.shadow=this.checked});
  document.getElementById('randomObstToggle').addEventListener('change',function(){cfg.randomObst=this.checked});
  updatePreview();
}

function getThumbSize(){return Math.max(52,Math.min(88,window.innerWidth/10))}

function buildShapeGrid(){
  const g=document.getElementById('shapeGrid');g.innerHTML='';
  SHAPES.forEach(sh=>{
    const btn=document.createElement('div');btn.className='opt-btn'+(cfg.shape===sh.id?' sel':'');
    const cw=getThumbSize();const mc=document.createElement('canvas');mc.width=cw;mc.height=Math.round(cw*1.05);mc.style.width=cw+'px';mc.style.height=mc.height+'px';
    drawDino(mc.getContext('2d'),2,Math.round(cw*.98),cw/73,cfg.color,sh.id,'none',0,false);
    btn.appendChild(mc);const lbl=document.createElement('span');lbl.textContent=sh.label;btn.appendChild(lbl);
    btn.addEventListener('click',()=>{cfg.shape=sh.id;document.getElementById('previewName').textContent=sh.label.toUpperCase();document.querySelectorAll('#shapeGrid .opt-btn').forEach(b=>b.classList.remove('sel'));btn.classList.add('sel');updatePreview();rebuildAcc()});
    g.appendChild(btn);
  });
}
function buildColorGrid(){
  const g=document.getElementById('colorGrid');g.innerHTML='';
  COLORS.forEach(col=>{
    const sw=document.createElement('div');sw.className='cswatch'+(cfg.color===col?' sel':'');sw.style.background=col;
    sw.addEventListener('click',()=>{cfg.color=col;document.querySelectorAll('.cswatch').forEach(x=>x.classList.remove('sel'));sw.classList.add('sel');updatePreview();rebuildShape();rebuildAcc()});
    g.appendChild(sw);
  });
}
function buildAccessoryGrid(){
  const g=document.getElementById('accessoryGrid');g.innerHTML='';
  ACCESSORIES.forEach(acc=>{
    const btn=document.createElement('div');btn.className='opt-btn'+(cfg.accessory===acc.id?' sel':'');
    const cw=getThumbSize();const mc=document.createElement('canvas');mc.width=cw;mc.height=Math.round(cw*1.15);mc.style.width=cw+'px';mc.style.height=mc.height+'px';
    drawDino(mc.getContext('2d'),2,Math.round(cw*1.02),cw/73,cfg.color,cfg.shape,acc.id,0,false);
    btn.appendChild(mc);const lbl=document.createElement('span');lbl.textContent=acc.label;btn.appendChild(lbl);
    btn.addEventListener('click',()=>{cfg.accessory=acc.id;document.querySelectorAll('#accessoryGrid .opt-btn').forEach(b=>b.classList.remove('sel'));btn.classList.add('sel');updatePreview()});
    g.appendChild(btn);
  });
}
function buildTrailGrid(){
  const g=document.getElementById('trailGrid');g.innerHTML='';
  TRAILS.forEach(tr=>{
    const btn=document.createElement('div');btn.className='opt-btn'+(cfg.trail===tr.id?' sel':'');
    btn.innerHTML=`<span style="font-size:clamp(18px,3.5vw,28px)">${tr.icon}</span><span>${tr.label}</span>`;
    btn.addEventListener('click',()=>{cfg.trail=tr.id;document.querySelectorAll('#trailGrid .opt-btn').forEach(b=>b.classList.remove('sel'));btn.classList.add('sel')});
    g.appendChild(btn);
  });
}
function rebuildShape(){document.querySelectorAll('#shapeGrid .opt-btn canvas').forEach((mc,i)=>{const ctx=mc.getContext('2d');ctx.clearRect(0,0,mc.width,mc.height);drawDino(ctx,2,Math.round(mc.width*.98),mc.width/73,cfg.color,SHAPES[i].id,'none',0,false)})}
function rebuildAcc(){document.querySelectorAll('#accessoryGrid .opt-btn canvas').forEach((mc,i)=>{const ctx=mc.getContext('2d');ctx.clearRect(0,0,mc.width,mc.height);drawDino(ctx,2,Math.round(mc.width*1.02),mc.width/73,cfg.color,cfg.shape,ACCESSORIES[i].id,0,false)})}

function updatePreview(){
  const pc=document.getElementById('previewCanvas');
  const pw=Math.max(120,pc.parentElement.clientWidth||200);
  const h=Math.min(150,Math.max(80,pw*.38));
  pc.width=Math.round(h*1.18);pc.height=Math.round(h);pc.style.width=pc.width+'px';pc.style.height=pc.height+'px';
  const ctx=pc.getContext('2d');ctx.clearRect(0,0,pc.width,pc.height);
  drawDino(ctx,10,pc.height-5,(cfg.size/100)*(h/85),cfg.color,cfg.shape,cfg.accessory,0,false);
}

/* ─── GAME ENGINE ─────────────────────────────────────── */
let gs=null,raf=null;

function initGame(){
  const canvas=document.getElementById('gameCanvas');
  canvas.width=canvas.offsetWidth||window.innerWidth;
  canvas.height=canvas.offsetHeight||window.innerHeight;
  const W=canvas.width,H=canvas.height;
  const df=DIFF_CFG[cfg.difficulty];
  const dsc=(cfg.size/100)*0.9;
  const groundY=H-Math.max(50,H*.1);
  gs={W,H,groundY,sc:0,hi:parseInt(localStorage.getItem('dinoHi')||'0'),running:false,over:false,frame:0,tick:0,speed:4+(cfg.speed-1)*1.5,baseSpeed:4+(cfg.speed-1)*1.5,df,
    dino:{x:W*.14,y:groundY,vy:0,onGround:true,ducking:false,scale:dsc,h:60*dsc,w:42*dsc},
    obstacles:[],nextObst:1400,trailPts:[],
    clouds:[{x:W*.3,y:H*.12,w:90,sp:.4},{x:W*.7,y:H*.07,w:130,sp:.3}],
    stars:Array.from({length:50},()=>({x:Math.random()*W,y:Math.random()*H*.5,r:Math.random()*1.5+.3,tw:Math.random()*Math.PI*2})),
    mtns:[]};
  let mx=0;while(mx<W+400){gs.mtns.push({x:mx,h:50+Math.random()*90,w:90+Math.random()*130});mx+=70+Math.random()*130;}
}

function jump(){if(!gs||!gs.running||gs.over)return;if(gs.dino.onGround){gs.dino.vy=-18*(gs.dino.scale*.7+.5);gs.dino.onGround=false;if(cfg.particles)spawnTrail(8);}}
function duck(on){if(gs)gs.dino.ducking=on;}

function spawnTrail(n){
  const cols={none:[],star:['#fff','#ffd700','#ff8c00'],fire:['#ff4400','#ff8800','#ffcc00'],ice:['#88ccff','#aaeeff','#fff'],rainbow:['#ff0','#f0f','#0ff','#0f0','#f00']};
  const c=cols[cfg.trail]||[];if(!c.length)return;
  for(let i=0;i<n;i++)gs.trailPts.push({x:gs.dino.x,y:gs.groundY,vx:(Math.random()-.5)*4,vy:-(Math.random()*5+2),life:1,color:c[~~(Math.random()*c.length)],size:Math.random()*4+2});
}

function spawnObst(){
  const isBird=cfg.randomObst&&Math.random()<gs.df.birdChance;
  if(isBird){const hs=[gs.groundY-80,gs.groundY-130,gs.groundY-180];gs.obstacles.push({type:'bird',x:gs.W+50,y:hs[~~(Math.random()*hs.length)],frame:0,ft:0,w:40,h:20});}
  else{const t=~~(Math.random()*3);gs.obstacles.push({type:'cactus',x:gs.W+30,y:gs.groundY,ct:t,w:16,h:50+t*10});}
}

function hitTest(){
  const d=gs.dino,dL=d.x-d.w*.35,dR=d.x+d.w*.55,dT=d.ducking?d.y-d.h*.38:d.y-d.h*.95,dB=d.y+6;
  for(const o of gs.obstacles){let oL,oR,oT,oB;if(o.type==='cactus'){oL=o.x-o.w-4;oR=o.x+o.w-4;oT=o.y-o.h;oB=o.y;}else{oL=o.x-o.w+4;oR=o.x+o.w-4;oT=o.y-o.h-4;oB=o.y+o.h+4;}if(dR>oL&&dL<oR&&dB>oT&&dT<oB)return true;}
  return false;
}

function gameLoop(){
  if(!gs||!gs.running||gs.over){renderFrame();return;}
  gs.tick++;gs.frame=~~(gs.tick/8)%2;gs.sc++;gs.speed=gs.baseSpeed+(gs.tick*gs.df.speedInc);
  const d=gs.dino;
  if(!d.onGround){d.vy+=.9;d.y+=d.vy;if(d.y>=gs.groundY){d.y=gs.groundY;d.vy=0;d.onGround=true;}}
  gs.nextObst-=gs.speed;if(gs.nextObst<=0){spawnObst();const[mn,mx]=gs.df.obstInterval;gs.nextObst=mn+Math.random()*(mx-mn);}
  gs.obstacles.forEach(o=>{o.x-=gs.speed;if(o.type==='bird'){o.ft++;if(o.ft%12===0)o.frame=(o.frame+1)%2;}});
  gs.obstacles=gs.obstacles.filter(o=>o.x>-120);
  if(d.onGround&&cfg.trail!=='none'&&Math.random()>.65)spawnTrail(1);
  gs.trailPts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.15;p.life-=.04;});gs.trailPts=gs.trailPts.filter(p=>p.life>0);
  gs.clouds.forEach(c=>{c.x-=c.sp;if(c.x<-200)c.x=gs.W+100;});
  gs.mtns.forEach(m=>{m.x-=gs.speed*.2;});
  if(gs.mtns[0]&&gs.mtns[0].x<-200){gs.mtns.shift();const lx=gs.mtns[gs.mtns.length-1].x;gs.mtns.push({x:lx+70+Math.random()*130,h:50+Math.random()*90,w:90+Math.random()*130});}
  if(gs.sc>gs.hi)gs.hi=gs.sc;
  if(hitTest()){
    gs.over=true;gs.running=false;if(gs.hi>parseInt(localStorage.getItem('dinoHi')||'0'))localStorage.setItem('dinoHi',gs.hi);
    document.getElementById('finalScore').textContent=~~gs.sc;document.getElementById('finalHi').textContent=gs.hi;document.getElementById('hiDisplay').textContent=gs.hi;
    document.getElementById('gameOverOverlay').style.display='flex';
    for(let i=0;i<30;i++)gs.trailPts.push({x:d.x,y:d.y-d.h*.5,vx:(Math.random()-.5)*10,vy:(Math.random()-.5)*10,life:1,color:cfg.color,size:Math.random()*6+2});
  }
  document.getElementById('scoreDisplay').textContent=~~gs.sc;document.getElementById('hiDisplay').textContent=gs.hi;
  renderFrame();raf=requestAnimationFrame(gameLoop);
}

function renderFrame(){
  if(!gs)return;
  const canvas=document.getElementById('gameCanvas');const ctx=canvas.getContext('2d');const{W,H,groundY}=gs;
  if(cfg.nightMode){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#040410');g.addColorStop(.6,'#0b1520');g.addColorStop(1,'#0a180a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    gs.stars.forEach(s=>{s.tw+=.05;ctx.globalAlpha=.3+Math.sin(s.tw)*.4;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
    const mr=Math.min(H*.045,24);ctx.fillStyle='#fffff0';ctx.beginPath();ctx.arc(W*.84,H*.1,mr,0,Math.PI*2);ctx.fill();ctx.fillStyle='#0b1520';ctx.beginPath();ctx.arc(W*.84-mr*.4,H*.1-mr*.15,mr*.8,0,Math.PI*2);ctx.fill();
  }else{
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#87ceeb');g.addColorStop(.7,'#ddf');g.addColorStop(1,'#c8e8c8');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#ffe066';ctx.beginPath();ctx.arc(W*.84,H*.1,Math.min(H*.052,28),0,Math.PI*2);ctx.fill();
  }
  gs.clouds.forEach(c=>{ctx.fillStyle=cfg.nightMode?'rgba(255,255,255,.07)':'rgba(255,255,255,.82)';ctx.beginPath();ctx.ellipse(c.x,c.y,c.w*.5,Math.min(24,H*.04),0,0,Math.PI*2);ctx.ellipse(c.x+18,c.y-10,c.w*.34,Math.min(18,H*.03),0,0,Math.PI*2);ctx.ellipse(c.x-18,c.y-4,c.w*.28,Math.min(14,H*.025),0,0,Math.PI*2);ctx.fill();});
  gs.mtns.forEach(m=>{ctx.fillStyle=cfg.nightMode?'#0e1e0e':'#a0cb9a';ctx.beginPath();ctx.moveTo(m.x,groundY-8);ctx.lineTo(m.x+m.w/2,groundY-m.h-8);ctx.lineTo(m.x+m.w,groundY-8);ctx.fill();if(cfg.nightMode&&m.h>55){ctx.fillStyle='rgba(255,255,255,.28)';ctx.beginPath();ctx.moveTo(m.x+m.w/2-5,groundY-m.h-8);ctx.lineTo(m.x+m.w/2+5,groundY-m.h-8);ctx.lineTo(m.x+m.w/2+10,groundY-m.h+6);ctx.lineTo(m.x+m.w/2-10,groundY-m.h+6);ctx.fill();}});
  const gg=ctx.createLinearGradient(0,groundY,0,H);gg.addColorStop(0,cfg.nightMode?'#182818':'#8b7355');gg.addColorStop(1,cfg.nightMode?'#0a120a':'#6b5a45');ctx.fillStyle=gg;ctx.fillRect(0,groundY,W,H-groundY);
  ctx.strokeStyle=cfg.nightMode?'rgba(0,255,136,.3)':'rgba(139,115,85,.6)';ctx.lineWidth=2;ctx.setLineDash([8,5]);ctx.lineDashOffset=-gs.tick*gs.speed*.5;ctx.beginPath();ctx.moveTo(0,groundY);ctx.lineTo(W,groundY);ctx.stroke();ctx.setLineDash([]);ctx.lineDashOffset=0;
  gs.trailPts.forEach(p=>{ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size/2,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
  gs.obstacles.forEach(o=>{if(o.type==='cactus')drawCactus(ctx,o.x,o.y,o.ct);else drawBird(ctx,o.x,o.y,o.frame);});
  drawDino(ctx,gs.dino.x,gs.dino.y,gs.dino.scale,cfg.color,cfg.shape,cfg.accessory,gs.frame,gs.dino.ducking);
}

/* ─── CONTROLS ────────────────────────────────────────── */
document.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();jump();}if(e.code==='ArrowDown'){e.preventDefault();duck(true);}});
document.addEventListener('keyup',e=>{if(e.code==='ArrowDown')duck(false);});
document.getElementById('gameCanvas').addEventListener('touchstart',e=>{e.preventDefault();jump();},{passive:false});
document.getElementById('gameCanvas').addEventListener('click',()=>jump());
document.getElementById('jumpBtn').addEventListener('touchstart',e=>{e.preventDefault();jump();},{passive:false});
document.getElementById('jumpBtn').addEventListener('click',()=>jump());
document.getElementById('duckBtn').addEventListener('touchstart',e=>{e.preventDefault();duck(true);},{passive:false});
document.getElementById('duckBtn').addEventListener('touchend',e=>{e.preventDefault();duck(false);},{passive:false});

/* ─── BUTTONS ─────────────────────────────────────────── */
document.getElementById('startBtn').addEventListener('click',()=>{document.getElementById('menuScreen').classList.remove('active');document.getElementById('gameScreen').classList.add('active');document.getElementById('startOverlay').style.display='flex';document.getElementById('gameOverOverlay').style.display='none';initGame();renderFrame();});
document.getElementById('goBtn').addEventListener('click',()=>{document.getElementById('startOverlay').style.display='none';if(gs){gs.running=true;}raf=requestAnimationFrame(gameLoop);});
document.getElementById('backBtn').addEventListener('click',()=>{if(raf)cancelAnimationFrame(raf);gs=null;document.getElementById('gameScreen').classList.remove('active');document.getElementById('menuScreen').classList.add('active');});
document.getElementById('restartBtn').addEventListener('click',()=>{if(raf)cancelAnimationFrame(raf);document.getElementById('gameOverOverlay').style.display='none';initGame();gs.running=true;raf=requestAnimationFrame(gameLoop);});
document.getElementById('menuBtn').addEventListener('click',()=>{if(raf)cancelAnimationFrame(raf);gs=null;document.getElementById('gameOverOverlay').style.display='none';document.getElementById('gameScreen').classList.remove('active');document.getElementById('menuScreen').classList.add('active');});

/* ─── RESIZE ──────────────────────────────────────────── */
let rt;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{updatePreview();if(gs&&gs.running){const c=document.getElementById('gameCanvas');c.width=c.offsetWidth;c.height=c.offsetHeight;}},120);});

/* ─── INIT ────────────────────────────────────────────── */
buildMenu();
document.getElementById('hiDisplay').textContent=localStorage.getItem('dinoHi')||'0';