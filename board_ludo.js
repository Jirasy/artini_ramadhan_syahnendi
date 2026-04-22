// ============ BOARD DATA ============
const COLORS = ['#E53935', '#43A047', '#1E88E5', '#FDD835'];
const COLOR_NAMES = ['Merah', 'Hijau', 'Biru', 'Kuning'];

// Star safe cells (indices on 52-cell main path)
const SAFE_POSITIONS = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Player start positions on main path (relative pos 0 for each player)
const COLOR_START = [0, 13, 26, 39];

// The main 52-cell clockwise path (row, col on 15x15 grid)
const MAIN_PATH = [
  {r:13,c:6},{r:12,c:6},{r:11,c:6},{r:10,c:6},{r:9,c:6},
  {r:8,c:5},{r:8,c:4},{r:8,c:3},{r:8,c:2},{r:8,c:1},{r:8,c:0},
  {r:7,c:0},
  {r:6,c:0},{r:6,c:1},{r:6,c:2},{r:6,c:3},{r:6,c:4},{r:6,c:5},
  {r:5,c:6},{r:4,c:6},{r:3,c:6},{r:2,c:6},{r:1,c:6},
  {r:0,c:6},
  {r:0,c:7},{r:0,c:8},
  {r:1,c:8},{r:2,c:8},{r:3,c:8},{r:4,c:8},{r:5,c:8},
  {r:6,c:9},{r:6,c:10},{r:6,c:11},{r:6,c:12},{r:6,c:13},{r:6,c:14},
  {r:7,c:14},
  {r:8,c:14},{r:8,c:13},{r:8,c:12},{r:8,c:11},{r:8,c:10},{r:8,c:9},
  {r:9,c:8},{r:10,c:8},{r:11,c:8},{r:12,c:8},{r:13,c:8},
  {r:14,c:8},
  {r:14,c:7},{r:14,c:6}
];

// Home stretch paths (6 cells per color toward center)
const HOME_PATHS = [
  [{r:13,c:7},{r:12,c:7},{r:11,c:7},{r:10,c:7},{r:9,c:7},{r:8,c:7}],  // Red
  [{r:7,c:1},{r:7,c:2},{r:7,c:3},{r:7,c:4},{r:7,c:5},{r:7,c:6}],       // Green
  [{r:1,c:7},{r:2,c:7},{r:3,c:7},{r:4,c:7},{r:5,c:7},{r:6,c:7}],       // Blue
  [{r:7,c:13},{r:7,c:12},{r:7,c:11},{r:7,c:10},{r:7,c:9},{r:7,c:8}]    // Yellow
];

// Precompute lookup maps for O(1) cell queries
const mainPathMap = new Map(); // "r_c" -> index
MAIN_PATH.forEach((p, i) => mainPathMap.set(`${p.r}_${p.c}`, i));

const homeStretchMap = new Map(); // "r_c" -> colorIndex
HOME_PATHS.forEach((path, ci) => {
  path.forEach(p => homeStretchMap.set(`${p.r}_${p.c}`, ci));
});

// Home zone bounds per color
const HOME_ZONES = [
  {rMin:9,rMax:14,cMin:0,cMax:5},   // Red
  {rMin:0,rMax:5,cMin:0,cMax:5},    // Green
  {rMin:0,rMax:5,cMin:9,cMax:14},   // Blue
  {rMin:9,rMax:14,cMin:9,cMax:14},  // Yellow
];

// Inner base areas (where pawns sit when "home")
const HOME_INNER = [
  {rMin:11,rMax:13,cMin:1,cMax:3, r0:11, c0:1}, // Red
  {rMin:1,rMax:3,cMin:1,cMax:3,   r0:1,  c0:1}, // Green
  {rMin:1,rMax:3,cMin:10,cMax:12, r0:1,  c0:10},// Blue
  {rMin:10,rMax:12,cMin:10,cMax:12,r0:10,c0:10},// Yellow
];

// Pawn slot positions within 3x3 inner grid (skip center [1,1])
const PAWN_SLOTS = [[0,0],[0,2],[2,0],[2,2]];

function getAbsolutePosition(playerIdx, relativePos) {
  return (COLOR_START[playerIdx] + relativePos) % 52;
}

function isSafeCell(pathIdx) {
  return SAFE_POSITIONS.has(pathIdx);
}

function getCellColorZone(r, c) {
  for (let i = 0; i < 4; i++) {
    const z = HOME_ZONES[i];
    if (r >= z.rMin && r <= z.rMax && c >= z.cMin && c <= z.cMax) return i;
  }
  return -1;
}

function isInnerBase(r, c) {
  for (let i = 0; i < 4; i++) {
    const z = HOME_INNER[i];
    if (r >= z.rMin && r <= z.rMax && c >= z.cMin && c <= z.cMax) {
      const pr = r - z.r0, pc = c - z.c0;
      if (pr === 1 && pc === 1) return {color: i, slot: -1}; // center of inner = no slot
      const slotIdx = PAWN_SLOTS.findIndex(s => s[0] === pr && s[1] === pc);
      if (slotIdx >= 0) return {color: i, slot: slotIdx};
    }
  }
  return null;
}

function isCenterCell(r, c) {
  return r >= 6 && r <= 8 && c >= 6 && c <= 8;
}
