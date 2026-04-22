 // Default configuration
    const defaultConfig = {
      game_title: "TURBO RACER"
    };
    
    // Game state
    let gameState = {
      carColor: "#ff3333",
      level: 1,
      mode: "classic",
      score: 0,
      lives: 3,
      speed: 100,
      isPlaying: false,
      isPaused: false,
      playerX: 50,
      enemies: [],
      powerups: [],
      animationId: null,
      lastTime: 0,
      roadLineInterval: null,
      boostActive: false,
      invincible: false
    };
    
    // Color options
    const carColors = [
      { name: "Merah", primary: "#ff3333", secondary: "#cc0000" },
      { name: "Biru", primary: "#3366ff", secondary: "#0044cc" },
      { name: "Hijau", primary: "#33cc33", secondary: "#009900" },
      { name: "Kuning", primary: "#ffcc00", secondary: "#cc9900" },
      { name: "Ungu", primary: "#9933ff", secondary: "#6600cc" },
      { name: "Oranye", primary: "#ff6600", secondary: "#cc5200" },
      { name: "Pink", primary: "#ff66b2", secondary: "#cc3385" },
      { name: "Cyan", primary: "#00cccc", secondary: "#009999" }
    ];
    
    // Level configurations
    const levels = [
      { id: 1, name: "Mudah", emoji: "🌟", enemySpeed: 3, spawnRate: 2000 },
      { id: 2, name: "Sedang", emoji: "⭐", enemySpeed: 5, spawnRate: 1500 },
      { id: 3, name: "Sulit", emoji: "💫", enemySpeed: 7, spawnRate: 1000 }
    ];
    
    // Game modes
    const gameModes = [
      { id: "classic", name: "Klasik", emoji: "🏁", description: "Hindari mobil lain" },
      { id: "turbo", name: "Turbo", emoji: "⚡", description: "Kecepatan ekstra!" }
    ];
    
    // Initialize menu
    function initMenu() {
      // Create stars
      const starsContainer = document.getElementById("stars");
      for (let i = 0; i < 50; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.left = Math.random() * 100 + "%";
        star.style.top = Math.random() * 100 + "%";
        star.style.animationDelay = Math.random() * 2 + "s";
        starsContainer.appendChild(star);
      }
      
      // Create color options
      const colorContainer = document.getElementById("color-options");
      colorContainer.innerHTML = "";
      carColors.forEach((color, index) => {
        const option = document.createElement("div");
        option.className = "color-option" + (index === 0 ? " selected" : "");
        option.style.background = `linear-gradient(135deg, ${color.primary}, ${color.secondary})`;
        option.title = color.name;
        option.onclick = () => selectColor(color, option);
        colorContainer.appendChild(option);
      });
      
      // Create level options
      const levelContainer = document.getElementById("level-options");
      levelContainer.innerHTML = "";
      levels.forEach((level, index) => {
        const card = document.createElement("div");
        card.className = "level-card" + (index === 0 ? " selected" : "");
        card.innerHTML = `
          <div class="text-3xl mb-2">${level.emoji}</div>
          <div class="text-white font-bold">${level.name}</div>
        `;
        card.onclick = () => selectLevel(level, card);
        levelContainer.appendChild(card);
      });
      
      // Create mode options
      const modeContainer = document.getElementById("mode-options");
      modeContainer.innerHTML = "";
      gameModes.forEach((mode, index) => {
        const card = document.createElement("div");
        card.className = "level-card" + (index === 0 ? " selected" : "");
        card.innerHTML = `
          <div class="text-3xl mb-2">${mode.emoji}</div>
          <div class="text-white font-bold">${mode.name}</div>
          <div class="text-gray-400 text-xs">${mode.description}</div>
        `;
        card.onclick = () => selectMode(mode, card);
        modeContainer.appendChild(card);
      });
      
      // Event listeners
      document.getElementById("start-btn").onclick = startGame;
      document.getElementById("restart-btn").onclick = restartGame;
      document.getElementById("menu-btn").onclick = showMenu;
      document.getElementById("resume-btn").onclick = resumeGame;
      document.getElementById("quit-btn").onclick = showMenu;
    }
    
    function selectColor(color, element) {
      document.querySelectorAll(".color-option").forEach(el => el.classList.remove("selected"));
      element.classList.add("selected");
      gameState.carColor = color.primary;
      
      // Update preview
      const gradient = document.querySelector("#carGradient");
      gradient.innerHTML = `
        <stop offset="0%" style="stop-color:${color.primary}"/>
        <stop offset="100%" style="stop-color:${color.secondary}"/>
      `;
    }
    
    function selectLevel(level, element) {
      document.querySelectorAll("#level-options .level-card").forEach(el => el.classList.remove("selected"));
      element.classList.add("selected");
      gameState.level = level.id;
    }
    
    function selectMode(mode, element) {
      document.querySelectorAll("#mode-options .level-card").forEach(el => el.classList.remove("selected"));
      element.classList.add("selected");
      gameState.mode = mode.id;
    }
    
    function startGame() {
      document.getElementById("menu-screen").classList.add("hidden");
      document.getElementById("game-screen").classList.remove("hidden");
      
      // Reset game state
      gameState.score = 0;
      gameState.lives = 3;
      gameState.speed = gameState.mode === "turbo" ? 150 : 100;
      gameState.isPlaying = true;
      gameState.isPaused = false;
      gameState.playerX = 50;
      gameState.enemies = [];
      gameState.powerups = [];
      gameState.boostActive = false;
      gameState.invincible = false;
      
      // Hide overlays
      document.getElementById("game-over").classList.add("hidden");
      document.getElementById("pause-overlay").classList.add("hidden");
      
      // Create player car
      createPlayerCar();
      
      // Update HUD
      updateHUD();
      
      // Create road lines
      createRoadLines();
      
      // Start spawning enemies
      startEnemySpawner();
      
      // Start powerup spawner
      startPowerupSpawner();
      
      // Start game loop
      gameState.lastTime = performance.now();
      gameLoop();
    }
    
    function createPlayerCar() {
      const container = document.getElementById("player-container");
      const selectedColor = carColors.find(c => c.primary === gameState.carColor) || carColors[0];
      
      container.innerHTML = `
        <svg class="player-car" id="player-car" viewBox="0 0 50 90" style="left: calc(${gameState.playerX}% - 25px);">
          <defs>
            <linearGradient id="playerCarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${selectedColor.primary}"/>
              <stop offset="100%" style="stop-color:${selectedColor.secondary}"/>
            </linearGradient>
          </defs>
          <path d="M10,80 L10,35 Q10,25 15,20 L20,10 Q25,5 25,5 Q25,5 30,10 L35,20 Q40,25 40,35 L40,80 Q40,85 35,85 L15,85 Q10,85 10,80" fill="url(#playerCarGradient)"/>
          <path d="M15,35 L18,22 Q25,18 32,22 L35,35 Z" fill="#87CEEB"/>
          <rect x="15" y="40" width="20" height="15" rx="2" fill="#87CEEB" opacity="0.8"/>
          <ellipse cx="15" cy="75" rx="3" ry="5" fill="#ffff00"/>
          <ellipse cx="35" cy="75" rx="3" ry="5" fill="#ffff00"/>
          <rect x="23" y="10" width="4" height="70" fill="white" opacity="0.3"/>
          <rect x="5" y="25" width="8" height="20" rx="3" fill="#222"/>
          <rect x="37" y="25" width="8" height="20" rx="3" fill="#222"/>
          <rect x="5" y="60" width="8" height="20" rx="3" fill="#222"/>
          <rect x="37" y="60" width="8" height="20" rx="3" fill="#222"/>
        </svg>
      `;
    }
    
    function createRoadLines() {
      const container = document.getElementById("road-lines");
      container.innerHTML = "";
      
      // Create multiple road lines
      for (let i = 0; i < 8; i++) {
        const line = document.createElement("div");
        line.className = "road-line";
        line.style.left = "50%";
        line.style.marginLeft = "-4px";
        line.style.top = (i * 100) + "px";
        line.style.animationDuration = (2 - (gameState.level - 1) * 0.3) + "s";
        line.style.animationDelay = (i * 0.25) + "s";
        container.appendChild(line);
      }
    }
    
    function startEnemySpawner() {
      const levelConfig = levels.find(l => l.id === gameState.level);
      
      if (gameState.enemySpawnInterval) {
        clearInterval(gameState.enemySpawnInterval);
      }
      
      gameState.enemySpawnInterval = setInterval(() => {
        if (gameState.isPlaying && !gameState.isPaused) {
          spawnEnemy();
        }
      }, levelConfig.spawnRate);
    }
    
    function spawnEnemy() {
      const road = document.getElementById("road");
      const roadWidth = road.offsetWidth;
      const minX = 100;
      const maxX = roadWidth - 150;
      const x = minX + Math.random() * (maxX - minX);
      
      const enemyColors = ["#444", "#555", "#666", "#333", "#777"];
      const color = enemyColors[Math.floor(Math.random() * enemyColors.length)];
      
      const enemy = {
        id: Date.now() + Math.random(),
        x: x,
        y: -100,
        color: color,
        speed: levels.find(l => l.id === gameState.level).enemySpeed
      };
      
      gameState.enemies.push(enemy);
      renderEnemies();
    }
    
    function startPowerupSpawner() {
      if (gameState.powerupSpawnInterval) {
        clearInterval(gameState.powerupSpawnInterval);
      }
      
      gameState.powerupSpawnInterval = setInterval(() => {
        if (gameState.isPlaying && !gameState.isPaused && Math.random() < 0.3) {
          spawnPowerup();
        }
      }, 5000);
    }
    
    function spawnPowerup() {
      const road = document.getElementById("road");
      const roadWidth = road.offsetWidth;
      const minX = 100;
      const maxX = roadWidth - 140;
      const x = minX + Math.random() * (maxX - minX);
      
      const types = [
        { type: "shield", color: "#00bfff", emoji: "🛡️" },
        { type: "boost", color: "#ff6600", emoji: "⚡" },
        { type: "life", color: "#ff66b2", emoji: "❤️" }
      ];
      
      const powerupType = types[Math.floor(Math.random() * types.length)];
      
      const powerup = {
        id: Date.now() + Math.random(),
        x: x,
        y: -50,
        ...powerupType
      };
      
      gameState.powerups.push(powerup);
      renderPowerups();
    }
    
    function renderEnemies() {
      const container = document.getElementById("enemies-container");
      container.innerHTML = gameState.enemies.map(enemy => `
        <svg class="enemy-car" data-id="${enemy.id}" viewBox="0 0 50 90" style="left: ${enemy.x}px; top: ${enemy.y}px;">
          <path d="M10,10 L10,55 Q10,65 15,70 L20,80 Q25,85 25,85 Q25,85 30,80 L35,70 Q40,65 40,55 L40,10 Q40,5 35,5 L15,5 Q10,5 10,10" fill="${enemy.color}"/>
          <path d="M15,55 L18,68 Q25,72 32,68 L35,55 Z" fill="#87CEEB" opacity="0.7"/>
          <rect x="15" y="35" width="20" height="15" rx="2" fill="#87CEEB" opacity="0.6"/>
          <ellipse cx="15" cy="15" rx="3" ry="5" fill="#ff3333"/>
          <ellipse cx="35" cy="15" rx="3" ry="5" fill="#ff3333"/>
          <rect x="5" y="15" width="8" height="20" rx="3" fill="#111"/>
          <rect x="37" y="15" width="8" height="20" rx="3" fill="#111"/>
          <rect x="5" y="50" width="8" height="20" rx="3" fill="#111"/>
          <rect x="37" y="50" width="8" height="20" rx="3" fill="#111"/>
        </svg>
      `).join("");
    }
    
    function renderPowerups() {
      const container = document.getElementById("powerups-container");
      container.innerHTML = gameState.powerups.map(p => `
        <div class="powerup" data-id="${p.id}" style="left: ${p.x}px; top: ${p.y}px; background: radial-gradient(circle, ${p.color}, ${p.color}88);">
          <span style="font-size: 24px; display: flex; align-items: center; justify-content: center; height: 100%;">${p.emoji}</span>
        </div>
      `).join("");
    }
    
    function gameLoop(currentTime) {
      if (!gameState.isPlaying) return;
      
      if (gameState.isPaused) {
        gameState.animationId = requestAnimationFrame(gameLoop);
        return;
      }
      
      const deltaTime = (currentTime - gameState.lastTime) / 16.67;
      gameState.lastTime = currentTime;
      
      // Update enemies
      updateEnemies(deltaTime);
      
      // Update powerups
      updatePowerups(deltaTime);
      
      // Check collisions
      checkCollisions();
      
      // Update score
      gameState.score += Math.floor(deltaTime * (gameState.level * 0.5));
      
      // Update speed display
      const displaySpeed = Math.floor(gameState.speed + (gameState.boostActive ? 50 : 0));
      
      // Update HUD
      updateHUD();
      
      // Update speed lines opacity
      const speedLines = document.getElementById("speed-lines");
      speedLines.style.opacity = gameState.boostActive ? "0.5" : "0";
      
      gameState.animationId = requestAnimationFrame(gameLoop);
    }
    
    function updateEnemies(deltaTime) {
      const road = document.getElementById("road");
      const roadHeight = road.offsetHeight;
      const levelConfig = levels.find(l => l.id === gameState.level);
      
      gameState.enemies.forEach(enemy => {
        enemy.y += (levelConfig.enemySpeed + (gameState.boostActive ? 3 : 0)) * deltaTime;
      });
      
      // Remove off-screen enemies
      gameState.enemies = gameState.enemies.filter(e => e.y < roadHeight + 100);
      
      renderEnemies();
    }
    
    function updatePowerups(deltaTime) {
      const road = document.getElementById("road");
      const roadHeight = road.offsetHeight;
      
      gameState.powerups.forEach(p => {
        p.y += 3 * deltaTime;
      });
      
      // Remove off-screen powerups
      gameState.powerups = gameState.powerups.filter(p => p.y < roadHeight + 50);
      
      renderPowerups();
    }
    
    function checkCollisions() {
      const playerCar = document.getElementById("player-car");
      if (!playerCar) return;
      
      const playerRect = playerCar.getBoundingClientRect();
      const road = document.getElementById("road");
      const roadRect = road.getBoundingClientRect();
      
      // Check enemy collisions
      gameState.enemies.forEach(enemy => {
        const enemyX = roadRect.left + enemy.x;
        const enemyY = roadRect.top + enemy.y;
        
        const enemyRect = {
          left: enemyX,
          right: enemyX + 50,
          top: enemyY,
          bottom: enemyY + 90
        };
        
        if (isColliding(playerRect, enemyRect)) {
          if (!gameState.invincible) {
            handleCrash(enemy);
          }
        }
      });
      
      // Check powerup collisions
      gameState.powerups = gameState.powerups.filter(powerup => {
        const powerupX = roadRect.left + powerup.x;
        const powerupY = roadRect.top + powerup.y;
        
        const powerupRect = {
          left: powerupX,
          right: powerupX + 40,
          top: powerupY,
          bottom: powerupY + 40
        };
        
        if (isColliding(playerRect, powerupRect)) {
          collectPowerup(powerup);
          return false;
        }
        return true;
      });
      
      renderPowerups();
    }
    
    function isColliding(rect1, rect2) {
      return !(rect1.right < rect2.left + 10 || 
               rect1.left > rect2.right - 10 || 
               rect1.bottom < rect2.top + 10 || 
               rect1.top > rect2.bottom - 10);
    }
    
    function handleCrash(enemy) {
      // Remove the enemy
      gameState.enemies = gameState.enemies.filter(e => e.id !== enemy.id);
      
      // Create explosion effect
      const road = document.getElementById("road");
      const explosion = document.createElement("div");
      explosion.className = "explosion";
      explosion.style.left = enemy.x + "px";
      explosion.style.top = enemy.y + "px";
      road.appendChild(explosion);
      setTimeout(() => explosion.remove(), 500);
      
      // Lose a life
      gameState.lives--;
      updateHUD();
      
      // Brief invincibility
      gameState.invincible = true;
      const playerCar = document.getElementById("player-car");
      if (playerCar) {
        playerCar.style.opacity = "0.5";
        setTimeout(() => {
          gameState.invincible = false;
          if (playerCar) playerCar.style.opacity = "1";
        }, 2000);
      }
      
      // Check game over
      if (gameState.lives <= 0) {
        gameOver();
      }
      
      renderEnemies();
    }
    
    function collectPowerup(powerup) {
      switch (powerup.type) {
        case "shield":
          gameState.invincible = true;
          const playerCar = document.getElementById("player-car");
          if (playerCar) {
            playerCar.style.filter = "drop-shadow(0 0 20px #00bfff)";
            setTimeout(() => {
              gameState.invincible = false;
              if (playerCar) playerCar.style.filter = "drop-shadow(0 10px 20px rgba(0,0,0,0.5))";
            }, 5000);
          }
          break;
        case "boost":
          gameState.boostActive = true;
          setTimeout(() => {
            gameState.boostActive = false;
          }, 3000);
          break;
        case "life":
          if (gameState.lives < 5) {
            gameState.lives++;
            updateHUD();
          }
          break;
      }
    }
    
    function updateHUD() {
      document.getElementById("score").textContent = gameState.score.toLocaleString();
      document.getElementById("speed").textContent = Math.floor(gameState.speed + (gameState.boostActive ? 50 : 0)) + " km/h";
      document.getElementById("lives").textContent = "❤️".repeat(gameState.lives) + "🖤".repeat(Math.max(0, 3 - gameState.lives));
    }
    
    function gameOver() {
      gameState.isPlaying = false;
      
      if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
      }
      if (gameState.enemySpawnInterval) {
        clearInterval(gameState.enemySpawnInterval);
      }
      if (gameState.powerupSpawnInterval) {
        clearInterval(gameState.powerupSpawnInterval);
      }
      
      document.getElementById("final-score").textContent = gameState.score.toLocaleString();
      document.getElementById("game-over").classList.remove("hidden");
    }
    
    function restartGame() {
      document.getElementById("game-over").classList.add("hidden");
      startGame();
    }
    
    function showMenu() {
      gameState.isPlaying = false;
      
      if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
      }
      if (gameState.enemySpawnInterval) {
        clearInterval(gameState.enemySpawnInterval);
      }
      if (gameState.powerupSpawnInterval) {
        clearInterval(gameState.powerupSpawnInterval);
      }
      
      document.getElementById("game-screen").classList.add("hidden");
      document.getElementById("menu-screen").classList.remove("hidden");
    }
    
    function togglePause() {
      if (!gameState.isPlaying) return;
      
      gameState.isPaused = !gameState.isPaused;
      document.getElementById("pause-overlay").classList.toggle("hidden", !gameState.isPaused);
    }
    
    function resumeGame() {
      gameState.isPaused = false;
      document.getElementById("pause-overlay").classList.add("hidden");
      gameState.lastTime = performance.now();
    }
    
    // Keyboard controls
    const keys = {};
    
    document.addEventListener("keydown", (e) => {
      keys[e.key] = true;
      
      if (e.key === "Escape" && gameState.isPlaying) {
        togglePause();
      }
      
      if ((e.key === "ArrowUp" || e.key === "w" || e.key === "W") && !gameState.boostActive) {
        gameState.boostActive = true;
        setTimeout(() => {
          gameState.boostActive = false;
        }, 500);
      }
      
      updatePlayerPosition();
    });
    
    document.addEventListener("keyup", (e) => {
      keys[e.key] = false;
    });
    
    function updatePlayerPosition() {
      if (!gameState.isPlaying || gameState.isPaused) return;
      
      const moveSpeed = 5;
      
      if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
        gameState.playerX = Math.max(20, gameState.playerX - moveSpeed);
      }
      if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
        gameState.playerX = Math.min(80, gameState.playerX + moveSpeed);
      }
      
      const playerCar = document.getElementById("player-car");
      if (playerCar) {
        playerCar.style.left = `calc(${gameState.playerX}% - 25px)`;
      }
    }
    
    // Continuous movement check
    setInterval(updatePlayerPosition, 16);
    
    // Touch controls for mobile
    let touchStartX = 0;
    
    document.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    });
    
    document.addEventListener("touchmove", (e) => {
      if (!gameState.isPlaying || gameState.isPaused) return;
      
      const touchX = e.touches[0].clientX;
      const diff = touchX - touchStartX;
      
      if (Math.abs(diff) > 10) {
        gameState.playerX += diff > 0 ? 3 : -3;
        gameState.playerX = Math.max(20, Math.min(80, gameState.playerX));
        
        const playerCar = document.getElementById("player-car");
        if (playerCar) {
          playerCar.style.left = `calc(${gameState.playerX}% - 25px)`;
        }
        
        touchStartX = touchX;
      }
    });
    
    // Element SDK integration
    async function onConfigChange(config) {
      const title = config.game_title || defaultConfig.game_title;
      const titleEl = document.getElementById("game-title");
      if (titleEl) {
        titleEl.textContent = title;
      }
    }
    
    // Initialize Element SDK
    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange,
        mapToCapabilities: (config) => ({
          recolorables: [],
          borderables: [],
          fontEditable: undefined,
          fontSizeable: undefined
        }),
        mapToEditPanelValues: (config) => new Map([
          ["game_title", config.game_title || defaultConfig.game_title]
        ])
      });
    }
    
    // Initialize the menu
    initMenu();