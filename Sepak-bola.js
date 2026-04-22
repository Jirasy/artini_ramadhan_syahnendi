// ============================================
// DATABASE TIM (70+ TIM)
// ============================================
const teamsDatabase = {
    // Premier League
    "arsenal": { name: "Arsenal", color: "#EF0107" },
    "manutd": { name: "Manchester United", color: "#DA291C" },
    "liverpool": { name: "Liverpool", color: "#C8102E" },
    "mancity": { name: "Manchester City", color: "#6CABDD" },
    "chelsea": { name: "Chelsea", color: "#034694" },
    "tottenham": { name: "Tottenham", color: "#FFFFFF" },
    "newcastle": { name: "Newcastle United", color: "#FFFFFF" },
    "westham": { name: "West Ham", color: "#7A263A" },
    "liverpool": { name: "Aston Villa", color: "#95BWE5" },
    "brighton": { name: "Brighton", color: "#0057B8" },

    // La Liga
    "realmadrid": { name: "Real Madrid", color: "#FFFFFF" },
    "barcelona": { name: "Barcelona", color: "#A50044" },
    "atletico": { name: "Atlético Madrid", color: "#CB3524" },
    "sevilla": { name: "Sevilla", color: "#FFFFFF" },
    "betis": { name: "Real Betis", color: "#009846" },
    "villareal": { name: "Villarreal", color: "#F2C500" },
    "realsociedad": { name: "Real Sociedad", color: "#0A4B8C" },
    "athletic": { name: "Athletic Bilbao", color: "#EE2523" },

    // Serie A
    "juventus": { name: "Juventus", color: "#FFFFFF" },
    "inter": { name: "Inter Milan", color: "#010E80" },
    "milan": { name: "AC Milan", color: "#FB090B" },
    "napoli": { name: "Napoli", color: "#12ADD4" },
    "roma": { name: "AS Roma", color: "#8E1B26" },
    "lazio": { name: "Lazio", color: "#87CEEB" },
    "atalanta": { name: "Atalanta", color: "#1E4D8C" },
    "fiorentina": { name: "Fiorentina", color: "#5C2092" },

    // Bundesliga
    "bayern": { name: "Bayern Munich", color: "#DC052D" },
    "dortmund": { name: "Borussia Dortmund", color: "#FDE100" },
    "leverkusen": { name: "Bayer Leverkusen", color: "#E32219" },
    "rbleipzig": { name: "RB Leipzig", color: "#DD0741" },
    "frankfurt": { name: "Eintracht Frankfurt", color: "#E1000E" },
    "mgladbach": { name: "M\"gladbach", color: "#FFFFFF" },

    // Ligue 1
    "psg": { name: "PSG", color: "#004170" },
    "marseille": { name: "Olympique Marseille", color: "#0099CC" },
    "lyon": { name: "Olympique Lyon", color: "#091C3E" },
    "monaco": { name: "AS Monaco", color: "#D92131" },
    "lille": { name: "Lille", color: "#E10214" },
    "rennes": { name: "Stade Rennais", color: "#E30613" },

    // Portugal
    "benfica": { name: "Benfica", color: "#D8181D" },
    "porto": { name: "Porto", color: "#003087" },
    "sporting": { name: "Sporting CP", color: "#1D9E43" },
    "braga": { name: "Braga", color: "#E4002B" },

    // Belanda
    "ajax": { name: "Ajax", color: "#FFFFFF" },
    "feyenoord": { name: "Feyenoord", color: "#D2122E" },
    "psveindhoven": { name: "PSV Eindhoven", color: "#E30613" },
    "az": { name: "AZ Alkmaar", color: "#FFFFFF" },

    // Brasil
    "flamengo": { name: "Flamengo", color: "#D8181D" },
    "palmeiras": { name: "Palmeiras", color: "#1E8C42" },
    "corinthians": { name: "Corinthians", color: "#FFFFFF" },
    "saopaulo": { name: "São Paulo", color: "#D8181D" },
    "santos": { name: "Santos", color: "#FFFFFF" },
    "botafogo": { name: "Botafogo", color: "#000000" },
    "vasco": { name: "Vasco da Gama", color: "#000000" },
    "cruzeiro": { name: "Cruzeiro", color: "#1E4D8C" },

    // Argentina
    "boca": { name: "Boca Juniors", color: "#FCD116" },
    "river": { name: "River Plate", color: "#FFFFFF" },
    "independiente": { name: "Independiente", color: "#D8181D" },
    "racing": { name: "Racing Club", color: "#6B8CC4" },
    "sanlorenzo": { name: "San Lorenzo", color: "#1E4D8C" },

    // Lainnya
    "galatasaray": { name: "Galatasaray", color: "#D8181D" },
    "fenerbahce": { name: "Fenerbahçe", color: "#FDB913" },
    "shakhtar": { name: "Shakhtar Donetsk", color: "#FDB913" },
    "zenit": { name: "Zenit", color: "#0058A5" },
    "celtic": { name: "Celtic", color: "#018749" },
    "rangers": { name: "Rangers", color: "#FFFFFF" },
    "olympiacos": { name: "Olympiacos", color: "#D8181D" },
    "aek": { name: "AEK Athens", color: "#D8181D" },
    "clubbrugge": { name: "Club Brugge", color: "#000000" },
    "youngboys": { name: "Young Boys", color: "#FDE100" },
    "copenhagen": { name: "FC Copenhagen", color: "#FFFFFF" },
    "rosenborg": { name: "Rosenborg", color: "#FFFFFF" },
    "salzburg": { name: "Red Bull Salzburg", color: "#E30613" },
    "dinamozagreb": { name: "Dinamo Zagreb", color: "#1E4D8C" },
    "ferencvaros": { name: "Ferencváros", color: "#FFFFFF" },
    "legia": { name: "Legia Warsaw", color: "#FFFFFF" },
    "spartapraha": { name: "Sparta Prague", color: "#E30613" },
    "fcsb": { name: "FCSB Steaua", color: "#FFFFFF" },
    "maccabi": { name: "Maccabi Tel Aviv", color: "#FDB913" },
    "alhilal": { name: "Al Hilal", color: "#0054A6" },
    "alahly": { name: "Al Ahly", color: "#D8181D" },
    "wydad": { name: "Wydad Casablanca", color: "#D8181D" },
    "mamelodi": { name: "Mamelodi Sundowns", color: "#00008B" },
    "sydney": { name: "Sydney FC", color: "#0054A6" },
    "urawa": { name: "Urawa Red Diamonds", color: "#D8181D" },
    "yokohama": { name: "Yokohama F. Marinos", color: "#0054A6" },
    "kashima": { name: "Kashima Antlers", color: "#FDB913" },
    "ulsan": { name: "Ulsan Hyundai", color: "#0054A6" },
    "beijing": { name: "Beijing Guoan", color: "#0054A6" },
    "custom": { name: "Custom Team", color: "#FF0000" }
};

// ============================================
// VARIABEL GAME
// ============================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameRunning = false;
let isPaused = false;
let isGoalScored = false;
let playerPosition = "attacker";
let fieldWidth, fieldHeight;

// Input
const keys = { w: false, a: false, s: false, d: false, space: false };
const touchInput = { x: 0, y: 0, shooting: false, active: false };

// Tim User
const userTeam = {
    name: "Player",
    color: "#FF0000",
    player: { x: 0, y: 0, r: 20, vx: 0, vy: 0, speed: 5 },
    keeper: { x: 0, y: 0, r: 22, speed: 3, targetY: 0 },
    score: 0
};

// Tim AI (Lawan)
const enemyTeam = {
    name: "CPU",
    color: "#0000FF",
    player: { x: 0, y: 0, r: 20, vx: 0, vy: 0, speed: 4.5 },
    keeper: { x: 0, y: 0, r: 22, speed: 2.5, targetY: 0 },
    score: 0
};

// Bola
const ball = { x: 0, y: 0, r: 10, vx: 0, vy: 0, friction: 0.985 };
const goal = { w: 14, h: 140 };

// ============================================
// INISIALISASI
// ============================================
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    fieldWidth = canvas.width;
    fieldHeight = canvas.height;

    if (!gameRunning) {
        resetPositions();
    }
}

function resetPositions() {
    // Bola di tengah
    ball.x = fieldWidth / 2;
    ball.y = fieldHeight / 2;
    ball.vx = 0;
    ball.vy = 0;

    if (playerPosition === "attacker") {
        // User: Player di kiri, Keeper di gawang kiri
        userTeam.player.x = fieldWidth * 0.2;
        userTeam.player.y = fieldHeight / 2;
        userTeam.keeper.x = 40;
        userTeam.keeper.y = fieldHeight / 2;

        // Enemy: Player di kanan, Keeper di gawang kanan
        enemyTeam.player.x = fieldWidth * 0.8;
        enemyTeam.player.y = fieldHeight / 2;
        enemyTeam.keeper.x = fieldWidth - 40;
        enemyTeam.keeper.y = fieldHeight / 2;
    }

    // Init keeper target
    userTeam.keeper.targetY = fieldHeight / 2;
    enemyTeam.keeper.targetY = fieldHeight / 2;
}

// ============================================
// PEMILIHAN POSISI
// ============================================
function selectPosition(pos) {
    playerPosition = "attacker";
}

// ============================================
// INPUT HANDLING
// ============================================
window.addEventListener("keydown", function (e) {
    const key = e.key.toLowerCase();
    if (key === "w" || key === "arrowup") keys.w = true;
    if (key === "a" || key === "arrowleft") keys.a = true;
    if (key === "s" || key === "arrowdown") keys.s = true;
    if (key === "d" || key === "arrowright") keys.d = true;
    if (key === " ") keys.space = true;
    if (key === "escape") togglePause();
});

window.addEventListener("keyup", function (e) {
    const key = e.key.toLowerCase();
    if (key === "w" || key === "arrowup") keys.w = false;
    if (key === "a" || key === "arrowleft") keys.a = false;
    if (key === "s" || key === "arrowdown") keys.s = false;
    if (key === "d" || key === "arrowright") keys.d = false;
    if (key === " ") keys.space = false;
});

// Touch Controls
const joystick = document.getElementById("joystick");
const joystickKnob = document.getElementById("joystick-knob");
const btnShoot = document.getElementById("btn-shoot");
let joystickCenter = { x: 0, y: 0 };

joystick.addEventListener("touchstart", function (e) {
    e.preventDefault();
    touchInput.active = true;
    const rect = joystick.getBoundingClientRect();
    joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    handleJoystickMove(e.touches[0]);
}, { passive: false });

joystick.addEventListener("touchmove", function (e) {
    e.preventDefault();
    if (touchInput.active) {
        handleJoystickMove(e.touches[0]);
    }
}, { passive: false });

joystick.addEventListener("touchend", function () {
    touchInput.active = false;
    touchInput.x = 0;
    touchInput.y = 0;
    joystickKnob.style.transform = "translate(-50%, -50%)";
});

function handleJoystickMove(touch) {
    const maxDist = 40;
    let dx = touch.clientX - joystickCenter.x;
    let dy = touch.clientY - joystickCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxDist) {
        dx = (dx / dist) * maxDist;
        dy = (dy / dist) * maxDist;
    }

    joystickKnob.style.transform = "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px))";
    touchInput.x = dx / maxDist;
    touchInput.y = dy / maxDist;
}

btnShoot.addEventListener("touchstart", function (e) {
    e.preventDefault();
    touchInput.shooting = true;
}, { passive: false });

btnShoot.addEventListener("touchend", function () {
    touchInput.shooting = false;
});

// ============================================
// ORIENTATION WARNING
// ============================================
function checkOrientation() {
    const warning = document.getElementById("orientation-warning");

    // Jika di desktop, sembunyikan warning
    if (window.innerWidth > 768) {
        warning.classList.add("hidden");
        return;
    }

    // Jika portrait di mobile, tampilkan warning
    if (window.innerHeight > window.innerWidth) {
        warning.classList.remove("hidden");
    } else {
        warning.classList.add("hidden");
    }
}

function ignoreOrientation() {
    document.getElementById("orientation-warning").classList.add("hidden");
}

// ============================================
// LOGIKA GAME
// ============================================
function update() {
    if (isPaused || !gameRunning || isGoalScored) {
        return;
    }

    // === 1. GERAKAN USER ===
    if (playerPosition === "attacker") {
        // Kontrol Player
        let moveX = 0;
        let moveY = 0;

        if (keys.w) moveY = -1;
        if (keys.s) moveY = 1;
        if (keys.a) moveX = -1;
        if (keys.d) moveX = 1;

        if (touchInput.active) {
            moveX = touchInput.x;
            moveY = touchInput.y;
        }

        if (moveX !== 0 || moveY !== 0) {
            const len = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= len;
            moveY /= len;
        }

        userTeam.player.x += moveX * userTeam.player.speed;
        userTeam.player.y += moveY * userTeam.player.speed;

        // Batas Player
        keepInBounds(userTeam.player);
    }

    // === 2. GERAKAN AI (PLAYER) ===
    let aiMoveX = 0;
    let aiMoveY = 0;
    const target = ball;

    const dxAI = target.x - enemyTeam.player.x;
    const dyAI = target.y - enemyTeam.player.y;
    const distAI = Math.sqrt(dxAI * dxAI + dyAI * dyAI);

    if (distAI > 0) {
        aiMoveX = dxAI / distAI;
        aiMoveY = dyAI / distAI;
    }

    enemyTeam.player.x += aiMoveX * enemyTeam.player.speed;
    enemyTeam.player.y += aiMoveY * enemyTeam.player.speed;
    keepInBounds(enemyTeam.player);

    // === 3. GERAKAN KEEPER AI ===
    updateKeeper(enemyTeam.keeper, ball, false);


        updateKeeper(userTeam.keeper, ball, true);

    // === 5. GERAKAN BOLA ===
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vx *= ball.friction;
    ball.vy *= ball.friction;

    if (Math.abs(ball.vx) < 0.05) ball.vx = 0;
    if (Math.abs(ball.vy) < 0.05) ball.vy = 0;

    // === 6. TUMBUKAN ===
    checkBallCollision(userTeam.player, true);
    checkBallCollision(enemyTeam.player, false);

    // Keeper menangkap bola
    checkKeeperSave(userTeam.keeper, true);
    checkKeeperSave(enemyTeam.keeper, false);

    // === 7. BATAS LAPANGAN & GOL ===
    checkFieldBounds();
}

function updateKeeper(keeper, targetBall, isUser) {
    // Keeper mengikuti posisi Y bola dengan delay
    let targetY = targetBall.y;

    // Batas gawang
    const goalTop = goal.h / 2 + 20;
    const goalBottom = fieldHeight - goal.h / 2 - 20;

    if (targetY < goalTop) targetY = goalTop;
    if (targetY > goalBottom) targetY = goalBottom;

    // Gerakan pelan menuju target Y
    const dy = targetY - keeper.y;
    keeper.y += dy * 0.08;

    // Gerakan kecil kiri-kanan (menjaga posisi)
    const goalX = isUser ? 30 : fieldWidth - 30;
    const dx = goalX - keeper.x;
    keeper.x += dx * 0.05;

    // Clamp posisi keeper
    if (keeper.y < goalTop) keeper.y = goalTop;
    if (keeper.y > goalBottom) keeper.y = goalBottom;
}

function keepInBounds(entity) {
    const margin = entity.r;
    if (entity.x - margin < 0) entity.x = margin;
    if (entity.x + margin > fieldWidth) entity.x = fieldWidth - margin;
    if (entity.y - margin < 0) entity.y = margin;
    if (entity.y + margin > fieldHeight) entity.y = fieldHeight - margin;
}

function checkBallCollision(entity, isUserControlled) {
    const dx = ball.x - entity.x;
    const dy = ball.y - entity.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = ball.r + entity.r;

    if (dist < minDist) {
        const angle = Math.atan2(dy, dx);
        const force = 12;

        ball.vx = Math.cos(angle) * force;
        ball.vy = Math.sin(angle) * force;

        // Shoot keras jika tombol ditekan
        if ((keys.space || touchInput.shooting) && isUserControlled && playerPosition === "attacker") {
            ball.vx *= 2.0;
            ball.vy *= 2.0;
        }

        // Pisahkan bola dari pemain
        const overlap = minDist - dist;
        ball.x += Math.cos(angle) * overlap;
        ball.y += Math.sin(angle) * overlap;
    }
}

function checkKeeperSave(keeper, isUserKeeper) {
    const dx = ball.x - keeper.x;
    const dy = ball.y - keeper.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = ball.r + keeper.r + 5;

    if (dist < minDist) {
        // Bola ditangkap keeper
        const force = 8;

        // Tendang bola menjauh dari gawang
        if (isUserKeeper) {
            // Keeper user: tendang ke kanan
            ball.vx = Math.abs(force) + Math.random() * 3;
            ball.vy = (Math.random() - 0.5) * 10;
        } else {
            // Keeper AI: tendang ke kiri
            ball.vx = -Math.abs(force) - Math.random() * 3;
            ball.vy = (Math.random() - 0.5) * 10;
        }
    }
}

function checkFieldBounds() {
    const goalTop = (fieldHeight - goal.h) / 2;
    const goalBottom = (fieldHeight + goal.h) / 2;

    // Atas & bawah
    if (ball.y - ball.r < 0) {
        ball.y = ball.r;
        ball.vy *= -0.8;
    }
    if (ball.y + ball.r > fieldHeight) {
        ball.y = fieldHeight - ball.r;
        ball.vy *= -0.8;
    }

    // Kiri (bukan gawang)
    if (ball.x - ball.r < 0) {
        if (ball.y > goalTop && ball.y < goalBottom) {
            // GOL untuk tim kanan!
            if (!isGoalScored) {
                enemyTeam.score++;
                showGoalScored(enemyTeam.name);
            }
        } else {
            ball.x = ball.r;
            ball.vx *= -0.8;
        }
    }

    // Kanan (bukan gawang)
    if (ball.x + ball.r > fieldWidth) {
        if (ball.y > goalTop && ball.y < goalBottom) {
            // GOL untuk tim kiri!
            if (!isGoalScored) {
                userTeam.score++;
                showGoalScored(userTeam.name);
            }
        } else {
            ball.x = fieldWidth - ball.r;
            ball.vx *= -0.8;
        }
    }
}

function showGoalScored(scorer) {
    isGoalScored = true;
    updateScore();

    const goalMenu = document.getElementById("goal-menu");
    const goalText = document.getElementById("goal-text");
    const countdownEl = document.getElementById("countdown");

    goalText.innerText = "GOL UNTUK " + scorer.toUpperCase() + "!";
    goalMenu.classList.remove("hidden");

    let count = 3;
    countdownEl.innerText = count;

    const timer = setInterval(function () {
        count--;
        countdownEl.innerText = count;
        if (count <= 0) {
            clearInterval(timer);
            goalMenu.classList.add("hidden");
            resetPositions();
            isGoalScored = false;
        }
    }, 1000);
}

function updateScore() {
    document.getElementById("score-team1").innerText = userTeam.score;
    document.getElementById("score-team2").innerText = enemyTeam.score;

    document.getElementById("score-team1-badge").style.backgroundColor = userTeam.color;
    document.getElementById("score-team2-badge").style.backgroundColor = enemyTeam.color;
}

// ============================================
// RENDER
// ============================================
function draw() {
    // Background
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(0, 0, fieldWidth, fieldHeight);

    // Garis lapangan
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 3;

    // Border lapangan
    ctx.strokeRect(30, 30, fieldWidth - 60, fieldHeight - 60);

    // Garis tengah
    ctx.beginPath();
    ctx.moveTo(fieldWidth / 2, 30);
    ctx.lineTo(fieldWidth / 2, fieldHeight - 30);
    ctx.stroke();

    // Lingkaran tengah
    ctx.beginPath();
    ctx.arc(fieldWidth / 2, fieldHeight / 2, 80, 0, Math.PI * 2);
    ctx.stroke();

    // Kotak penalti kiri
    ctx.strokeRect(30, fieldHeight / 2 - 80, 100, 160);

    // Kotak penalti kanan
    ctx.strokeRect(fieldWidth - 130, fieldHeight / 2 - 80, 100, 160);

    // Gawang
    const goalTop = (fieldHeight - goal.h) / 2;

    // Gawang kiri
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(0, goalTop, goal.w, goal.h);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, goalTop, goal.w, goal.h);

    // Gawang kanan
    ctx.fillRect(fieldWidth - goal.w, goalTop, goal.w, goal.h);
    ctx.strokeRect(fieldWidth - goal.w, goalTop, goal.w, goal.h);

    // Gambar Keeper AI (kanan)
    drawKeeper(enemyTeam.keeper, enemyTeam.color);

    // Gambar Player AI
    drawPlayerEntity(enemyTeam.player, enemyTeam.color);

    // Gambar Keeper User (kiri)
    drawKeeper(userTeam.keeper, userTeam.color);

    // Gambar Player User
    drawPlayerEntity(userTeam.player, userTeam.color);

    // Gambar Bola
    drawBall();
}

function drawBall() {
    // Shadow bola
    ctx.beginPath();
    ctx.ellipse(ball.x, ball.y + ball.r - 3, ball.r * 0.8, ball.r * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    // Bola utama
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Detail bola (polygon)
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y - ball.r + 3);
    for (let i = 1; i <= 5; i++) {
        const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
        ctx.lineTo(ball.x + ball.r * 0.5 * Math.cos(angle), ball.y + ball.r * 0.5 * Math.sin(angle));
    }
    ctx.closePath();
    ctx.fillStyle = "#444";
    ctx.fill();
}

function drawPlayerEntity(p, color) {
    // Shadow
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + p.r - 5, p.r * 0.7, p.r * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fill();

    // Body pemain
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inisial nama
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("P", p.x, p.y);
}

function drawKeeper(k, color) {
    // Shadow
    ctx.beginPath();
    ctx.ellipse(k.x, k.y + k.r - 5, k.r * 0.7, k.r * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fill();

    // Keeper body
    ctx.beginPath();
    ctx.arc(k.x, k.y, k.r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Keeper gloves
    ctx.beginPath();
    ctx.arc(k.x - k.r, k.y, 8, 0, Math.PI * 2);
    ctx.arc(k.x + k.r, k.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD700";
    ctx.fill();

    // Label K
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("K", k.x, k.y);
}

// ============================================
// GAME LOOP
// ============================================
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ============================================
// KONTROL MENU
// ============================================
function updateTeamInput() {
    const preset = document.getElementById("team-preset").value;
    const nameInput = document.getElementById("player-name");
    const colorInput = document.getElementById("player-color");
    const customGroup = document.getElementById("custom-name-group");

    if (preset === "custom") {
        customGroup.style.display = "block";
        nameInput.value = "";
        colorInput.value = "#FF0000";
    } else if (teamsDatabase[preset]) {
        customGroup.style.display = "none";
        nameInput.value = teamsDatabase[preset].name;
        colorInput.value = teamsDatabase[preset].color;
    }
}

function startGame() {
    const preset = document.getElementById("team-preset").value;

    // Setup tim user
    if (preset === "custom") {
        userTeam.name = document.getElementById("player-name").value || "Custom";
        userTeam.color = document.getElementById("player-color").value;
    } else if (teamsDatabase[preset]) {
        userTeam.name = teamsDatabase[preset].name;
        userTeam.color = teamsDatabase[preset].color;
    }

    // Setup tim enemy (acak)
    const keys = Object.keys(teamsDatabase).filter(function (k) {
        return k !== preset && k !== "custom";
    });
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    enemyTeam.name = teamsDatabase[randomKey].name;
    enemyTeam.color = teamsDatabase[randomKey].color;

    // Reset skor
    userTeam.score = 0;
    enemyTeam.score = 0;

    // Setup UI
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("pause-menu").classList.add("hidden");
    document.getElementById("goal-menu").classList.add("hidden");

    resize();
    resetPositions();
    updateScore();

    gameRunning = true;
    isPaused = false;
    isGoalScored = false;
}

function togglePause() {
    if (!gameRunning) return;

    isPaused = !isPaused;

    if (isPaused) {
        document.getElementById("pause-menu").classList.remove("hidden");
    } else {
        document.getElementById("pause-menu").classList.add("hidden");
    }
}

function resumeGame() {
    togglePause();
}

function resetGame() {
    userTeam.score = 0;
    enemyTeam.score = 0;
    updateScore();
    resetPositions();
    togglePause();
}

function quitGame() {
    gameRunning = false;
    isPaused = false;
    isGoalScored = false;
    document.getElementById("pause-menu").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
}

// ============================================
// START
// ============================================
window.addEventListener("resize", function () {
    resize();
    checkOrientation();
});

// Check orientation on load
window.addEventListener("load", function () {
    checkOrientation();
});

// Also check orientation on change
window.addEventListener("orientationchange", function () {
    setTimeout(checkOrientation, 100);
});

// Initialize
resize();
gameLoop();