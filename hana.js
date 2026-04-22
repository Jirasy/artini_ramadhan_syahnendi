/* ===== COCKTAIL TIME — game.js ===== */
'use strict';

// ====== SAFE SDK STUBS (overridden if real SDKs load) ======
if (!window.elementSdk) {
  window.elementSdk = { init: () => {} };
}
if (!window.dataSdk) {
  window.dataSdk = {
    init:   async () => ({ isOk: true }),
    create: async () => ({ isOk: true })
  };
}

// ====== GAME DATA ======
const INGREDIENTS = [
  { id:'vodka',   name:'Vodka',   color:'#E8E8E8', cap:'#C0C0C0', body:'rgba(220,220,240,0.3)' },
  { id:'rum',     name:'Rum',     color:'#D4A055', cap:'#8B6914', body:'#C8923C' },
  { id:'gin',     name:'Gin',     color:'#B8D4E8', cap:'#7BA3C4', body:'rgba(160,200,230,0.4)' },
  { id:'tequila', name:'Tequila', color:'#F0E68C', cap:'#DAA520', body:'#E8D870' },
  { id:'juice_o', name:'OJ',      color:'#FFA500', cap:'#CC7A00', body:'#FF8C00' },
  { id:'juice_c', name:'Cranb.',  color:'#DC143C', cap:'#8B0000', body:'#C41232' },
  { id:'lime',    name:'Lime',    color:'#32CD32', cap:'#228B22', body:'#2DB82D' },
  { id:'cola',    name:'Cola',    color:'#3D1C02', cap:'#1A0A00', body:'#2A1200' },
  { id:'soda',    name:'Soda',    color:'#E0F0FF', cap:'#A0C4E0', body:'rgba(200,230,255,0.3)' },
  { id:'blue',    name:'Curaç.',  color:'#0080FF', cap:'#0050A0', body:'#0070E0' },
  { id:'grenad',  name:'Grenad.', color:'#FF1744', cap:'#C41230', body:'#E01540' },
  { id:'cream',   name:'Cream',   color:'#FFFDD0', cap:'#E8D8A0', body:'#F5ECC0' }
];

const RECIPES = [
  { name:'Screwdriver',   emoji:'🍊', ingredients:['vodka','juice_o'],                          colors:['#E8E8E8','#FFA500'],                       mix:'#FFBF40', difficulty:1, tip:15 },
  { name:'Cuba Libre',    emoji:'🥤', ingredients:['rum','cola','lime'],                         colors:['#D4A055','#3D1C02','#32CD32'],              mix:'#5C2E0A', difficulty:1, tip:20 },
  { name:'Gin & Tonic',   emoji:'🫧', ingredients:['gin','soda','lime'],                         colors:['#B8D4E8','#E0F0FF','#32CD32'],              mix:'#C0E8D0', difficulty:1, tip:15 },
  { name:'Tequila Sunrise',emoji:'🌅',ingredients:['tequila','juice_o','grenad'],                colors:['#F0E68C','#FFA500','#FF1744'],              mix:'#FF7730', difficulty:2, tip:25 },
  { name:'Blue Lagoon',   emoji:'💎', ingredients:['vodka','blue','lime'],                        colors:['#E8E8E8','#0080FF','#32CD32'],              mix:'#20A0D0', difficulty:2, tip:25 },
  { name:'Sea Breeze',    emoji:'🌊', ingredients:['vodka','juice_c','juice_o'],                  colors:['#E8E8E8','#DC143C','#FFA500'],              mix:'#E85030', difficulty:2, tip:25 },
  { name:'Mai Tai',       emoji:'🌺', ingredients:['rum','juice_o','lime','grenad'],              colors:['#D4A055','#FFA500','#32CD32','#FF1744'],    mix:'#E07028', difficulty:3, tip:35 },
  { name:'Long Island',   emoji:'🏝️', ingredients:['vodka','rum','gin','tequila','cola'],        colors:['#E8E8E8','#D4A055','#B8D4E8','#F0E68C','#3D1C02'], mix:'#8B6040', difficulty:3, tip:40 },
  { name:'Cosmopolitan',  emoji:'🌸', ingredients:['vodka','juice_c','lime','blue'],             colors:['#E8E8E8','#DC143C','#32CD32','#0080FF'],    mix:'#C03060', difficulty:3, tip:35 },
  { name:'Piña Colada',   emoji:'🍍', ingredients:['rum','juice_o','cream'],                     colors:['#D4A055','#FFA500','#FFFDD0'],              mix:'#F0C870', difficulty:2, tip:30 }
];

// ====== FIX: hair styles now match CUSTOMER_TYPES definitions ======
const CUSTOMER_TYPES = [
  { skin:'#FFDAB9', hair:'#FF69B4', hairStyle:'twin-tails',    shirt:'#FFB6C1', accessory:'bow',    eyeColor:'#4169E1' },
  { skin:'#FFE4C4', hair:'#FFD700', hairStyle:'long-curl',     shirt:'#FFF0F5', accessory:'ribbon', eyeColor:'#FF1493' },
  { skin:'#FFDAB9', hair:'#FF69B4', hairStyle:'short-bob',     shirt:'#DDA0DD', accessory:'heart',  eyeColor:'#00CED1' },
  { skin:'#FFE4B5', hair:'#8B008B', hairStyle:'ponytail-cute', shirt:'#FFE4E1', accessory:'flower', eyeColor:'#FF6347' },
  { skin:'#F5DEB3', hair:'#DC143C', hairStyle:'twin-buns',     shirt:'#FFC0CB', accessory:'star',   eyeColor:'#1E90FF' },
  { skin:'#FFEFD5', hair:'#FF1493', hairStyle:'wavy',          shirt:'#F0E68C', accessory:'bow',    eyeColor:'#228B22' },
  { skin:'#FFDAB9', hair:'#9932CC', hairStyle:'long-bob',      shirt:'#FAFAD2', accessory:'heart',  eyeColor:'#8A2BE2' },
  { skin:'#FFE4C4', hair:'#FF6347', hairStyle:'messy-cute',    shirt:'#FFB6C1', accessory:'star',   eyeColor:'#FF4500' }
];

// ====== GAME STATE ======
let gameState = {
  score:0, lives:3, level:1, served:0, perfectCount:0, combo:0,
  paused:false, running:false,
  customers:[], selectedCustomer:null,
  glass:{ ingredients:[], shaken:false },
  customerTimer:null, spawnTimer:null,
  maxCustomers:2, spawnInterval:4000, patienceBase:22,
  levelGoals:[5,8,12,15,20,25,30]
};

let savedScores = [];

// ====== SDK CONFIG ======
const defaultConfig = {
  game_title:'Cocktail Time', welcome_text:"Welcome to Hana's bar!",
  background_color:'#1a0a2e', surface_color:'#2d1b4e',
  text_color:'#E8B4F8', primary_action_color:'#FF6EC7', secondary_action_color:'#6C5CE7'
};

function applyConfig(config) {
  const t  = config.game_title             || defaultConfig.game_title;
  const w  = config.welcome_text           || defaultConfig.welcome_text;
  const bg = config.background_color       || defaultConfig.background_color;
  const sf = config.surface_color          || defaultConfig.surface_color;
  const pa = config.primary_action_color   || defaultConfig.primary_action_color;
  const tx = config.text_color             || defaultConfig.text_color;

  const titleEl   = document.getElementById('titleText');
  const welcomeEl = document.getElementById('welcomeText');
  if (titleEl)   titleEl.innerHTML = '🍸 ' + t;
  if (welcomeEl) welcomeEl.textContent = w;

  const wrapper = document.getElementById('appWrapper');
  if (wrapper) wrapper.style.background =
    `linear-gradient(135deg,${bg} 0%,${sf} 30%,${bg} 60%,#0f051d 100%)`;

  document.querySelectorAll('.neon-text').forEach(e => e.style.color = pa);
  document.querySelectorAll('[data-cfg-text]').forEach(e => e.style.color = tx);
}

window.elementSdk.init({
  defaultConfig,
  onConfigChange: async (config) => applyConfig(config),
  mapToCapabilities: (config) => ({
    recolorables: [
      { get:()=>config.background_color||defaultConfig.background_color, set:v=>{config.background_color=v;window.elementSdk.setConfig&&window.elementSdk.setConfig({background_color:v})} },
      { get:()=>config.surface_color||defaultConfig.surface_color,       set:v=>{config.surface_color=v;window.elementSdk.setConfig&&window.elementSdk.setConfig({surface_color:v})} },
      { get:()=>config.text_color||defaultConfig.text_color,             set:v=>{config.text_color=v;window.elementSdk.setConfig&&window.elementSdk.setConfig({text_color:v})} },
      { get:()=>config.primary_action_color||defaultConfig.primary_action_color, set:v=>{config.primary_action_color=v;window.elementSdk.setConfig&&window.elementSdk.setConfig({primary_action_color:v})} },
      { get:()=>config.secondary_action_color||defaultConfig.secondary_action_color, set:v=>{config.secondary_action_color=v;window.elementSdk.setConfig&&window.elementSdk.setConfig({secondary_action_color:v})} }
    ],
    borderables:[],
    fontEditable:{ get:()=>config.font_family||'Fredoka', set:v=>{config.font_family=v;window.elementSdk.setConfig&&window.elementSdk.setConfig({font_family:v})} },
    fontSizeable:{ get:()=>config.font_size||14,          set:v=>{config.font_size=v;window.elementSdk.setConfig&&window.elementSdk.setConfig({font_size:v})} }
  }),
  mapToEditPanelValues:(config)=>new Map([
    ['game_title',   config.game_title   || defaultConfig.game_title],
    ['welcome_text', config.welcome_text || defaultConfig.welcome_text]
  ])
});

const dataHandler = {
  onDataChanged(data) {
    savedScores = data.sort((a,b)=>(b.high_score||0)-(a.high_score||0));
    renderScores();
  }
};
(async()=>{
  try {
    const r = await window.dataSdk.init(dataHandler);
    if (!r.isOk) console.warn('Data SDK init failed');
  } catch(e) { console.warn('Data SDK unavailable', e); }
})();

// ====== SCREEN NAV ======
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  initIcons();
}

// ====== ICON INIT (single Lucide source) ======
function initIcons() {
  if (window.lucide && window.lucide.createIcons) {
    try { window.lucide.createIcons(); } catch(e) {}
  }
}

// ====== TOAST ======
let toastTimer = null;
function showToast(msg, color='#FF6EC7') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.background = color;
  t.style.color = '#fff';
  t.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

// ====== RECIPES SCREEN ======
function renderRecipes() {
  const c = document.getElementById('recipesList');
  if (!c) return;
  c.innerHTML = RECIPES.map((r,i) => {
    const stars = '⭐'.repeat(r.difficulty);
    const ings = r.ingredients.map(id => {
      const ing = INGREDIENTS.find(x=>x.id===id);
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style="background:${ing.color};color:${getContrastColor(ing.color)}">${ing.name}</span>`;
    }).join(' ');
    return `<div class="recipe-card anim-fade-in" style="animation-delay:${i*0.07}s">
      <div class="flex items-start justify-between mb-1">
        <div class="flex items-center gap-2">
          <span style="font-size:22px">${r.emoji}</span>
          <div>
            <h3 class="font-bold text-sm" style="color:#4A2C0F">${r.name}</h3>
            <div class="text-xs">${stars}</div>
          </div>
        </div>
        <span class="text-xs font-bold px-2 py-1 rounded-full" style="background:#FFD700;color:#4A2C0F">💰 ${r.tip}</span>
      </div>
      <div class="flex flex-wrap gap-1 mt-2">${ings}</div>
    </div>`;
  }).join('');
}

function getContrastColor(hex) {
  if (!hex || hex.length < 7) return '#ffffff';
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return (r*299+g*587+b*114)/1000 > 128 ? '#1a0a2e' : '#ffffff';
}

// ====== SCORES ======
function renderScores() {
  const c = document.getElementById('scoresList');
  if (!c) return;
  if (!savedScores.length) {
    c.innerHTML = `<div class="text-center py-8" style="color:#C8A8E8">
      <div style="font-size:36px;margin-bottom:12px">🏆</div>
      <p class="font-semibold text-white">No scores yet!</p>
      <p class="text-sm mt-1 opacity-70">Play a game to set your first record.</p>
    </div>`;
    return;
  }
  c.innerHTML = savedScores.slice(0,10).map((s,i)=>{
    const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
    return `<div class="flex items-center gap-3 p-3 mb-2 rounded-xl anim-fade-in" style="background:rgba(255,255,255,0.08);animation-delay:${i*0.05}s">
      <span style="font-size:16px;width:28px;text-align:center">${medal||('#'+(i+1))}</span>
      <div style="flex:1">
        <p class="font-bold text-white text-sm">${s.player_name||'Player'}</p>
        <p class="text-xs" style="color:#C8A8E8">Level ${s.level_reached||1} • ${s.total_served||0} served</p>
      </div>
      <span class="font-bold text-lg" style="color:#FFD700">${s.high_score||0}</span>
    </div>`;
  }).join('');
}

// ====== CUSTOMER SVG — FIX: all hair styles now handled ======
function generateCustomerSVG(type) {
  const c = type;
  let hairSVG = '';

  switch(c.hairStyle) {
    // Original styles kept
    case 'short':
      hairSVG = `<ellipse cx="32" cy="18" rx="18" ry="12" fill="${c.hair}"/>`;
      break;
    case 'afro':
      hairSVG = `<circle cx="32" cy="16" r="20" fill="${c.hair}"/>`;
      break;
    case 'long':
      hairSVG = `<ellipse cx="32" cy="18" rx="18" ry="12" fill="${c.hair}"/>
        <rect x="14" y="22" width="8" height="24" rx="4" fill="${c.hair}"/>
        <rect x="42" y="22" width="8" height="24" rx="4" fill="${c.hair}"/>`;
      break;
    case 'spiky':
      hairSVG = `<polygon points="18,20 24,4 30,18" fill="${c.hair}"/>
        <polygon points="26,18 32,2 38,16" fill="${c.hair}"/>
        <polygon points="34,18 40,4 46,20" fill="${c.hair}"/>`;
      break;
    case 'ponytail':
      hairSVG = `<ellipse cx="32" cy="18" rx="18" ry="12" fill="${c.hair}"/>
        <rect x="44" y="14" width="6" height="20" rx="3" fill="${c.hair}"/>`;
      break;
    case 'curly':
      hairSVG = `<circle cx="20" cy="16" r="8" fill="${c.hair}"/>
        <circle cx="32" cy="12" r="9" fill="${c.hair}"/>
        <circle cx="44" cy="16" r="8" fill="${c.hair}"/>`;
      break;
    case 'bun':
      hairSVG = `<ellipse cx="32" cy="18" rx="18" ry="12" fill="${c.hair}"/>
        <circle cx="32" cy="6" r="8" fill="${c.hair}"/>`;
      break;
    // ====== NEW: styles used in CUSTOMER_TYPES ======
    case 'twin-tails':
      hairSVG = `<ellipse cx="32" cy="18" rx="18" ry="12" fill="${c.hair}"/>
        <rect x="10" y="14" width="7" height="22" rx="3.5" fill="${c.hair}"/>
        <rect x="47" y="14" width="7" height="22" rx="3.5" fill="${c.hair}"/>
        <circle cx="13" cy="14" r="4" fill="${c.hair}"/>
        <circle cx="51" cy="14" r="4" fill="${c.hair}"/>`;
      break;
    case 'long-curl':
      hairSVG = `<ellipse cx="32" cy="17" rx="18" ry="12" fill="${c.hair}"/>
        <path d="M14,22 Q10,34 14,42 Q18,50 14,56" stroke="${c.hair}" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M50,22 Q54,34 50,42 Q46,50 50,56" stroke="${c.hair}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      break;
    case 'short-bob':
      hairSVG = `<ellipse cx="32" cy="20" rx="18" ry="13" fill="${c.hair}"/>
        <rect x="14" y="20" width="8" height="12" rx="2" fill="${c.hair}"/>
        <rect x="42" y="20" width="8" height="12" rx="2" fill="${c.hair}"/>`;
      break;
    case 'ponytail-cute':
      hairSVG = `<ellipse cx="32" cy="18" rx="18" ry="12" fill="${c.hair}"/>
        <rect x="46" y="12" width="7" height="24" rx="3.5" fill="${c.hair}"/>
        <circle cx="46" cy="16" r="5" fill="${c.hair}"/>`;
      break;
    case 'twin-buns':
      hairSVG = `<ellipse cx="32" cy="20" rx="17" ry="12" fill="${c.hair}"/>
        <circle cx="18" cy="8"  r="8" fill="${c.hair}"/>
        <circle cx="46" cy="8"  r="8" fill="${c.hair}"/>`;
      break;
    case 'wavy':
      hairSVG = `<ellipse cx="32" cy="17" rx="18" ry="12" fill="${c.hair}"/>
        <path d="M14,22 Q12,30 16,36 Q12,42 16,50" stroke="${c.hair}" stroke-width="8" fill="none" stroke-linecap="round"/>
        <path d="M50,22 Q52,30 48,36 Q52,42 48,50" stroke="${c.hair}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
      break;
    case 'long-bob':
      hairSVG = `<ellipse cx="32" cy="18" rx="18" ry="12" fill="${c.hair}"/>
        <rect x="14" y="22" width="8" height="18" rx="4" fill="${c.hair}"/>
        <rect x="42" y="22" width="8" height="18" rx="4" fill="${c.hair}"/>`;
      break;
    case 'messy-cute':
      hairSVG = `<ellipse cx="32" cy="18" rx="18" ry="12" fill="${c.hair}"/>
        <ellipse cx="18" cy="12" rx="7" ry="5" fill="${c.hair}" transform="rotate(-20,18,12)"/>
        <ellipse cx="46" cy="12" rx="7" ry="5" fill="${c.hair}" transform="rotate(20,46,12)"/>
        <ellipse cx="32" cy="8"  rx="6" ry="4" fill="${c.hair}" transform="rotate(-10,32,8)"/>`;
      break;
    default:
      hairSVG = `<ellipse cx="32" cy="18" rx="18" ry="12" fill="${c.hair}"/>`;
  }

  // Accessory SVG — expanded to cover all types in CUSTOMER_TYPES
  let accSVG = '';
  switch(c.accessory) {
    case 'glasses':
      accSVG = `<circle cx="24" cy="28" r="5" fill="none" stroke="#555" stroke-width="1.5"/>
        <circle cx="40" cy="28" r="5" fill="none" stroke="#555" stroke-width="1.5"/>
        <line x1="29" y1="28" x2="35" y2="28" stroke="#555" stroke-width="1.5"/>`;
      break;
    case 'hat':
      accSVG = `<rect x="18" y="8" width="28" height="4" rx="1" fill="#444"/>
        <rect x="22" y="0" width="20" height="10" rx="3" fill="#444"/>`;
      break;
    case 'bow':
      accSVG = `<polygon points="26,6 32,10 26,14" fill="${c.hair}" opacity="0.8"/>
        <polygon points="38,6 32,10 38,14" fill="${c.hair}" opacity="0.8"/>
        <circle cx="32" cy="10" r="3" fill="${c.hair}"/>`;
      break;
    case 'ribbon':
      accSVG = `<rect x="28" y="4" width="8" height="12" rx="2" fill="${c.hair}" opacity="0.85"/>
        <rect x="22" y="7" width="20" height="5" rx="2" fill="${c.hair}"/>`;
      break;
    case 'heart':
      accSVG = `<path d="M32,14 Q28,8 24,12 Q20,16 32,24 Q44,16 40,12 Q36,8 32,14Z" fill="#FF6B9D" opacity="0.9" transform="scale(0.6) translate(21,3)"/>`;
      break;
    case 'flower':
      accSVG = `<circle cx="32" cy="8" r="3" fill="#FFD700"/>
        <circle cx="27" cy="7" r="2.5" fill="${c.hair}" opacity="0.85"/>
        <circle cx="37" cy="7" r="2.5" fill="${c.hair}" opacity="0.85"/>
        <circle cx="30" cy="4" r="2.5" fill="${c.hair}" opacity="0.85"/>
        <circle cx="34" cy="4" r="2.5" fill="${c.hair}" opacity="0.85"/>`;
      break;
    case 'star':
      accSVG = `<polygon points="32,3 34,8 40,8 35,12 37,18 32,14 27,18 29,12 24,8 30,8" fill="#FFD700" opacity="0.9" transform="scale(0.55) translate(26,2)"/>`;
      break;
    case 'ribbons':
      accSVG = `<rect x="14" y="16" width="5" height="14" rx="2.5" fill="${c.hair}" opacity="0.85"/>
        <rect x="45" y="16" width="5" height="14" rx="2.5" fill="${c.hair}" opacity="0.85"/>`;
      break;
    case 'bells':
      accSVG = `<circle cx="24" cy="42" r="4" fill="#FFD700" opacity="0.9"/>
        <circle cx="40" cy="42" r="4" fill="#FFD700" opacity="0.9"/>`;
      break;
  }

  // Cute eyes matching eyeColor
  const eyeColor = c.eyeColor || '#333';

  return `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    ${hairSVG}
    <ellipse cx="32" cy="30" rx="16" ry="18" fill="${c.skin}"/>
    <!-- cute eyes -->
    <circle cx="25" cy="27" r="4" fill="white"/>
    <circle cx="39" cy="27" r="4" fill="white"/>
    <circle cx="26" cy="27" r="2.5" fill="${eyeColor}"/>
    <circle cx="40" cy="27" r="2.5" fill="${eyeColor}"/>
    <circle cx="27" cy="26" r="1" fill="white"/>
    <circle cx="41" cy="26" r="1" fill="white"/>
    <!-- blush -->
    <ellipse cx="20" cy="33" rx="4" ry="2.5" fill="#FF9999" opacity="0.45"/>
    <ellipse cx="44" cy="33" rx="4" ry="2.5" fill="#FF9999" opacity="0.45"/>
    <!-- mouth -->
    <path d="M27,38 Q32,42 37,38" stroke="#E08080" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    ${accSVG}
    <!-- body -->
    <rect x="20" y="48" width="24" height="30" rx="6" fill="${c.shirt}"/>
    <rect x="10" y="50" width="10" height="20" rx="5" fill="${c.shirt}"/>
    <rect x="44" y="50" width="10" height="20" rx="5" fill="${c.shirt}"/>
  </svg>`;
}

// ====== INGREDIENT SHELF ======
function renderIngredientShelf() {
  const shelf = document.getElementById('ingredientShelf');
  if (!shelf) return;
  shelf.innerHTML = INGREDIENTS.map(ing => `
    <div class="bottle flex-col items-center" style="display:flex;flex-direction:column;align-items:center" onclick="addIngredient('${ing.id}')" data-ing="${ing.id}">
      <div class="bottle-cap" style="background:${ing.cap}"></div>
      <div class="bottle-neck" style="background:${ing.body}"></div>
      <div class="bottle-body" style="background:${ing.body}">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 20%,${ing.color} 100%);opacity:0.6"></div>
        <div class="bottle-label">${ing.name}</div>
      </div>
    </div>
  `).join('');
}

// ====== GAME LOGIC ======
function startGame() {
  // Clear old timers
  if (gameState.spawnTimer)    clearInterval(gameState.spawnTimer);
  if (gameState.customerTimer) clearInterval(gameState.customerTimer);

  gameState = {
    score:0, lives:3, level:1, served:0, perfectCount:0, combo:0,
    paused:false, running:true,
    customers:[], selectedCustomer:null,
    glass:{ ingredients:[], shaken:false },
    customerTimer:null, spawnTimer:null,
    maxCustomers:2, spawnInterval:4000, patienceBase:22,
    levelGoals:[5,8,12,15,20,25,30]
  };

  updateHUD();
  renderIngredientShelf();
  showScreen('gameScreen');
  clearGlass();

  const slots = document.getElementById('customerSlots');
  if (slots) slots.innerHTML = '';

  setTimeout(() => {
    if (gameState.running) spawnCustomer();
  }, 800);

  gameState.spawnTimer = setInterval(() => {
    if (!gameState.paused && gameState.running) spawnCustomer();
  }, gameState.spawnInterval);

  gameState.customerTimer = setInterval(() => {
    if (!gameState.paused && gameState.running) tickPatience();
  }, 1000);

  initIcons();
}

function updateHUD() {
  const el = id => document.getElementById(id);
  if (el('scoreDisplay')) el('scoreDisplay').textContent = gameState.score;
  if (el('livesDisplay')) el('livesDisplay').textContent = '❤️'.repeat(Math.max(0, gameState.lives));
  if (el('levelBadge'))   el('levelBadge').textContent   = gameState.level;
  if (el('servedCount'))  el('servedCount').textContent  = gameState.served;
  const goal = gameState.levelGoals[Math.min(gameState.level-1, gameState.levelGoals.length-1)];
  if (el('levelGoal'))    el('levelGoal').textContent    = goal;
}

function spawnCustomer() {
  if (gameState.customers.length >= gameState.maxCustomers) return;
  const maxDiff = Math.min(gameState.level, 3);
  const available = RECIPES.filter(r => r.difficulty <= maxDiff);
  const recipe    = available[Math.floor(Math.random() * available.length)];
  const custType  = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)];
  const patience  = Math.max(10, gameState.patienceBase - (gameState.level-1)*2);
  const customer  = {
    id: Date.now() + '_' + Math.random().toString(36).slice(2,6),
    recipe, type: custType,
    patience, maxPatience: patience,
    served: false
  };
  gameState.customers.push(customer);
  renderCustomers();
}

function renderCustomers() {
  const slots = document.getElementById('customerSlots');
  if (!slots) return;
  const existing = new Map([...slots.children].map(el => [el.dataset.custId, el]));

  gameState.customers.forEach(cust => {
    if (existing.has(cust.id)) {
      const el  = existing.get(cust.id);
      const pFill = el.querySelector('.patience-fill');
      const pct = (cust.patience / cust.maxPatience) * 100;
      if (pFill) {
        pFill.style.width      = pct + '%';
        pFill.style.background = pct > 50 ? '#00B894' : pct > 25 ? '#FDCB6E' : '#E84393';
      }
      el.style.outline = gameState.selectedCustomer === cust.id ? '3px solid #FFD700' : 'none';
      existing.delete(cust.id);
    } else {
      const div = document.createElement('div');
      div.dataset.custId = cust.id;
      div.className = 'anim-customer-walk cursor-pointer';
      div.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;min-width:60px;max-width:82px;outline-offset:4px;border-radius:12px;padding:4px;flex-shrink:0';
      div.onclick = () => selectCustomer(cust.id);

      const orderBubble = `<div class="order-bubble text-center">
        <span style="font-size:18px">${cust.recipe.emoji}</span>
        <p class="text-xs font-bold" style="color:#333;white-space:nowrap;max-width:70px;overflow:hidden;text-overflow:ellipsis">${cust.recipe.name}</p>
      </div>`;
      const avatar = `<div class="customer-avatar">${generateCustomerSVG(cust.type)}</div>`;
      const pBar   = `<div class="patience-bar w-full"><div class="patience-fill" style="width:100%;background:#00B894"></div></div>`;

      div.innerHTML = orderBubble + avatar + pBar;
      if (gameState.selectedCustomer === cust.id) div.style.outline = '3px solid #FFD700';
      slots.appendChild(div);
    }
  });

  // Remove customers who have left
  existing.forEach(el => {
    el.classList.add('anim-customer-leave');
    setTimeout(() => { if (el.parentNode) el.remove(); }, 400);
  });
}

function selectCustomer(id) {
  gameState.selectedCustomer = id;
  const cust = gameState.customers.find(c => c.id === id);
  if (!cust) return;

  const hint = document.getElementById('recipeHintContent');
  if (hint) {
    hint.innerHTML = cust.recipe.ingredients.map(iid => {
      const ing = INGREDIENTS.find(x => x.id === iid);
      return `<span style="color:${ing.color}">● ${ing.name}</span>`;
    }).join('<br>');
  }
  renderCustomers();
}

function tickPatience() {
  let lostLife = false;
  gameState.customers = gameState.customers.filter(c => {
    c.patience--;
    if (c.patience <= 0) {
      if (gameState.selectedCustomer === c.id) {
        gameState.selectedCustomer = null;
        const hint = document.getElementById('recipeHintContent');
        if (hint) hint.textContent = 'Select a customer!';
      }
      lostLife = true;
      gameState.combo = 0;
      return false;
    }
    return true;
  });

  if (lostLife) {
    gameState.lives--;
    showToast('Customer left! 💔', '#E84393');
    const slots = document.getElementById('customerSlots');
    if (slots) {
      slots.classList.add('anim-shake');
      setTimeout(() => slots.classList.remove('anim-shake'), 500);
    }
    if (gameState.lives <= 0) { endGame(); return; }
    updateHUD();
  }
  renderCustomers();
}

// ====== GLASS / MIXING ======
function addIngredient(ingId) {
  if (!gameState.running || gameState.paused) return;
  if (gameState.glass.ingredients.length >= 5) {
    showToast('Glass is full!', '#E84393');
    return;
  }
  gameState.glass.ingredients.push(ingId);
  gameState.glass.shaken = false;
  updateGlassVisual();

  const bottle = document.querySelector(`[data-ing="${ingId}"]`);
  if (bottle) {
    bottle.classList.add('anim-bounce');
    setTimeout(() => bottle.classList.remove('anim-bounce'), 600);
  }

  const shakeBtn = document.getElementById('shakeBtn');
  const serveBtn = document.getElementById('serveBtn');
  if (shakeBtn) shakeBtn.disabled = false;
  if (serveBtn) serveBtn.disabled = true;
}

function updateGlassVisual() {
  const liquid = document.getElementById('glassLiquid');
  if (!liquid) return;
  const ings = gameState.glass.ingredients;
  if (!ings.length) {
    liquid.style.height     = '0%';
    liquid.style.background = 'transparent';
    return;
  }
  const pct    = Math.min(90, ings.length * 20);
  const colors = ings.map(id => INGREDIENTS.find(x => x.id === id).color);

  if (gameState.glass.shaken) {
    const sel      = gameState.selectedCustomer
      ? gameState.customers.find(c => c.id === gameState.selectedCustomer) : null;
    const mixColor = sel ? sel.recipe.mix : colors[colors.length-1];
    liquid.style.background = mixColor;
  } else {
    const stops = colors.map((c,i) =>
      `${c} ${(i/colors.length)*100}%, ${c} ${((i+1)/colors.length)*100}%`
    ).join(',');
    liquid.style.background = `linear-gradient(0deg,${stops})`;
  }
  liquid.style.height = pct + '%';
}

function shakeGlass() {
  if (!gameState.glass.ingredients.length) return;
  gameState.glass.shaken = true;
  const glass = document.getElementById('activeGlass');
  if (!glass) return;
  glass.classList.add('anim-shaker');
  const shakeBtn = document.getElementById('shakeBtn');
  const serveBtn = document.getElementById('serveBtn');
  if (shakeBtn) shakeBtn.disabled = true;
  setTimeout(() => {
    glass.classList.remove('anim-shaker');
    updateGlassVisual();
    if (serveBtn) serveBtn.disabled = false;
    if (shakeBtn) shakeBtn.disabled = false;
  }, 900);
}

function clearGlass() {
  gameState.glass = { ingredients:[], shaken:false };
  updateGlassVisual();
  const shakeBtn = document.getElementById('shakeBtn');
  const serveBtn = document.getElementById('serveBtn');
  if (shakeBtn) shakeBtn.disabled = true;
  if (serveBtn) serveBtn.disabled = true;
  const hint = document.getElementById('recipeHintContent');
  if (hint) hint.textContent = 'Select a customer!';
}

function dumpDrink() {
  clearGlass();
  showToast('Drink dumped! 🗑️', '#6C5CE7');
}

function serveDrink() {
  if (!gameState.selectedCustomer) { showToast('Select a customer first!', '#F39C12'); return; }
  if (!gameState.glass.shaken)     { showToast('Shake it first!', '#F39C12'); return; }
  const cust = gameState.customers.find(c => c.id === gameState.selectedCustomer);
  if (!cust) { showToast('Customer not found!', '#E84393'); return; }

  const required = [...cust.recipe.ingredients].sort();
  const made     = [...gameState.glass.ingredients].sort();
  const perfect  = JSON.stringify(required) === JSON.stringify(made);

  const glass = document.getElementById('activeGlass');
  if (glass) {
    glass.style.setProperty('--serve-x', '80px');
    glass.classList.add('anim-serve');
  }

  setTimeout(() => {
    if (glass) {
      glass.classList.remove('anim-serve');
      glass.style.removeProperty('--serve-x');
    }

    if (perfect) {
      gameState.combo++;
      const mult   = Math.min(gameState.combo, 5);
      const points = cust.recipe.tip * 2 * mult;
      gameState.score += points;
      gameState.perfectCount++;
      showToast(`Perfect! +${points} 🌟 Combo x${mult}`, '#00B894');
      spawnScorePopup('+' + points);
    } else {
      const matched = made.filter(id => required.includes(id)).length;
      if (matched > 0) {
        const points = Math.floor(cust.recipe.tip * (matched / required.length));
        gameState.score += points;
        gameState.combo  = 0;
        showToast(`Close enough! +${points} 💰`, '#FDCB6E');
        spawnScorePopup('+' + points);
      } else {
        gameState.combo = 0;
        showToast('Wrong drink! 😬', '#E84393');
      }
    }

    gameState.served++;
    gameState.customers        = gameState.customers.filter(c => c.id !== cust.id);
    gameState.selectedCustomer = null;
    clearGlass();
    renderCustomers();
    updateHUD();
    checkLevelUp();
  }, 500);
}

function spawnScorePopup(text) {
  const area = document.getElementById('customerArea');
  if (!area) return;
  const popup = document.createElement('div');
  popup.className    = 'score-popup anim-float-up';
  popup.textContent  = text;
  popup.style.left   = '50%';
  popup.style.bottom = '30%';
  popup.style.transform = 'translateX(-50%)';
  area.appendChild(popup);
  setTimeout(() => { if (popup.parentNode) popup.remove(); }, 1000);
}

function checkLevelUp() {
  const goal = gameState.levelGoals[Math.min(gameState.level-1, gameState.levelGoals.length-1)];
  if (gameState.served >= goal) {
    gameState.level++;
    gameState.served = 0;
    gameState.maxCustomers  = Math.min(4, 2 + Math.floor(gameState.level/2));
    gameState.spawnInterval = Math.max(2000, 4000 - gameState.level*300);
    gameState.patienceBase  = Math.max(10, 22 - gameState.level*1.5);

    clearInterval(gameState.spawnTimer);
    gameState.spawnTimer = setInterval(() => {
      if (!gameState.paused && gameState.running) spawnCustomer();
    }, gameState.spawnInterval);

    gameState.paused = true;
    const numEl = document.getElementById('newLevelNum');
    const msgEl = document.getElementById('levelUpMsg');
    if (numEl) numEl.textContent = gameState.level;
    const msgs = [
      'Customers are getting thirstier!','New recipes unlocked!',
      'Tips are bigger!','The rush is on!',"You're a pro bartender!"
    ];
    if (msgEl) msgEl.textContent = msgs[Math.min(gameState.level-2, msgs.length-1)];
    showScreen('levelUpScreen');
    updateHUD();
  }
}

function continuePlaying() {
  gameState.paused = false;
  showScreen('gameScreen');
  initIcons();
}

function pauseGame() {
  gameState.paused = true;
  showScreen('pauseScreen');
  initIcons();
}

function resumeGame() {
  gameState.paused = false;
  showScreen('gameScreen');
  initIcons();
}

function quitToMenu() {
  endGame(true);
  showScreen('menuScreen');
  initIcons();
}

async function endGame(silent) {
  gameState.running = false;
  if (gameState.spawnTimer)    clearInterval(gameState.spawnTimer);
  if (gameState.customerTimer) clearInterval(gameState.customerTimer);
  gameState.spawnTimer    = null;
  gameState.customerTimer = null;

  if (!silent) {
    const totalServed = gameState.served +
      gameState.levelGoals.slice(0, gameState.level-1).reduce((a,b)=>a+b, 0);
    const el = id => document.getElementById(id);
    if (el('finalScore'))  el('finalScore').textContent  = gameState.score;
    if (el('finalServed')) el('finalServed').textContent = totalServed;
    if (el('finalLevel'))  el('finalLevel').textContent  = gameState.level;
    if (el('finalPerfect'))el('finalPerfect').textContent= gameState.perfectCount;
    showScreen('gameOverScreen');
    initIcons();
  }

  if (gameState.score > 0) {
    if (savedScores.length >= 999) { showToast('Score limit reached!','#E84393'); return; }
    const totalServed = gameState.served +
      gameState.levelGoals.slice(0, gameState.level-1).reduce((a,b)=>a+b, 0);
    try {
      const result = await window.dataSdk.create({
        player_name:'Player', high_score:gameState.score,
        total_served:totalServed, level_reached:gameState.level,
        last_played:new Date().toISOString()
      });
      if (!result.isOk) console.warn('Failed to save score');
    } catch(e) { console.warn('Score save error', e); }
  }
}

// ====== INIT ======
document.addEventListener('DOMContentLoaded', () => {
  renderRecipes();
  renderScores();
  initIcons();
});
