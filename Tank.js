        // --- SETUP ---
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        
        let width, height;
        
        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }
        window.addEventListener("resize", resize);
        resize();

        // --- GAME STATE ---
        let gameRunning = false;
        let lastInputTime = Date.now();
        let isAutoMode = false;
        let score = 0;
        let currentLevel = 1;
        let playerColor = "#ff4757";
        
        let player;
        let bullets = [];
        let enemies = [];
        let particles = [];
        
        const keys = {};
        const mouse = { x: 0, y: 0, down: false };
        const touch = { x: 0, y: 0, active: false, id: null };

        // --- CLASSES ---

        class Tank {
            constructor(x, y, color, isPlayer) {
                this.x = x;
                this.y = y;
                this.radius = 20;
                this.color = color;
                this.angle = 0;
                this.speed = isPlayer ? 5 : 2;
                this.isPlayer = isPlayer;
                this.hp = isPlayer ? 100 : (30 + (currentLevel * 15));
                this.maxHp = this.hp;
                this.shootCooldown = 0;
                this.shootRate = isPlayer ? 15 : (50 - (currentLevel * 5));
                if(this.shootRate < 10) this.shootRate = 10;
            }

            update() {
                if (this.isPlayer && isAutoMode) {
                    this.aiBehavior();
                } else if (this.isPlayer) {
                    this.playerControl();
                } else {
                    this.enemyAI();
                }

                // Boundary
                if (this.x < this.radius) this.x = this.radius;
                if (this.x > width - this.radius) this.x = width - this.radius;
                if (this.y < this.radius) this.y = this.radius;
                if (this.y > height - this.radius) this.y = height - this.radius;

                if (this.shootCooldown > 0) this.shootCooldown--;
            }

            playerControl() {
                if (keys["w"] || keys["W"] || keys["ArrowUp"]) this.y -= this.speed;
                if (keys["s"] || keys["S"] || keys["ArrowDown"]) this.y += this.speed;
                if (keys["a"] || keys["A"] || keys["ArrowLeft"]) this.x -= this.speed;
                if (keys["d"] || keys["D"] || keys["ArrowRight"]) this.x += this.speed;

                let targetX, targetY;
                if (touch.active) {
                    targetX = touch.x;
                    targetY = touch.y;
                } else {
                    targetX = mouse.x;
                    targetY = mouse.y;
                }

                const dx = targetX - this.x;
                const dy = targetY - this.y;
                this.angle = Math.atan2(dy, dx);

                if (mouse.down || touch.active) {
                    this.shoot();
                }
            }

            aiBehavior() {
                if (enemies.length === 0) return;

                let nearest = null;
                let minDist = Infinity;

                enemies.forEach(e => {
                    const dist = Math.hypot(e.x - this.x, e.y - this.y);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = e;
                    }
                });

                if (nearest) {
                    const dx = nearest.x - this.x;
                    const dy = nearest.y - this.y;
                    this.angle = Math.atan2(dy, dx);
                    const dist = Math.hypot(dx, dy);
                    
                    if (dist < 150) {
                        this.x -= Math.cos(this.angle) * (this.speed * 0.5);
                        this.y -= Math.sin(this.angle) * (this.speed * 0.5);
                    } else if (dist > 400) {
                         this.x += Math.cos(this.angle) * this.speed;
                         this.y += Math.sin(this.angle) * this.speed;
                    }
                    this.shoot();
                }
            }

            enemyAI() {
                if (player) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    this.angle = Math.atan2(dy, dx);
                    
                    const dist = Math.hypot(dx, dy);
                    
                    if (dist > 150) {
                        this.x += Math.cos(this.angle) * this.speed;
                        this.y += Math.sin(this.angle) * this.speed;
                    }

                    if (dist < 400) {
                        this.shoot();
                    }
                }
            }

            shoot() {
                if (this.shootCooldown <= 0) {
                    bullets.push(new Bullet(
                        this.x + Math.cos(this.angle) * (this.radius + 5),
                        this.y + Math.sin(this.angle) * (this.radius + 5),
                        this.angle,
                        this.isPlayer
                    ));
                    this.shootCooldown = this.shootRate;
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);

                ctx.fillStyle = this.color;
                ctx.fillRect(-15, -15, 30, 30);
                
                ctx.fillStyle = "#555";
                ctx.fillRect(0, -5, 25, 10);
                
                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.fillStyle = this.isPlayer ? "#fff" : "#333";
                ctx.fill();

                ctx.restore();

                // HP Bar
                if (this.hp < this.maxHp) {
                    ctx.fillStyle = "red";
                    ctx.fillRect(this.x - 20, this.y - 35, 40, 5);
                    ctx.fillStyle = "#0f0";
                    ctx.fillRect(this.x - 20, this.y - 35, 40 * (this.hp / this.maxHp), 5);
                }
            }
        }

        class Bullet {
            constructor(x, y, angle, isPlayerBullet) {
                this.x = x;
                this.y = y;
                this.angle = angle;
                this.speed = 10;
                this.radius = 4;
                this.isPlayerBullet = isPlayerBullet;
                this.markedForDeletion = false;
            }

            update() {
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;

                if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                    this.markedForDeletion = true;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.isPlayerBullet ? "#ffff00" : "#ff6b6b";
                ctx.fill();
            }
        }

        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.velocity = {
                    x: (Math.random() - 0.5) * 5,
                    y: (Math.random() - 0.5) * 5
                };
                this.radius = Math.random() * 3;
                this.alpha = 1;
            }

            update() {
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                this.alpha -= 0.02;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // --- GAME FUNCTIONS ---

        function spawnEnemy() {
            const side = Math.floor(Math.random() * 4);
            let x, y;
            const margin = 30;
            
            if (side === 0) { x = Math.random() * width; y = -margin; }
            else if (side === 1) { x = width + margin; y = Math.random() * height; }
            else if (side === 2) { x = Math.random() * width; y = height + margin; }
            else { x = -margin; y = Math.random() * height; }

            enemies.push(new Tank(x, y, "#a55eea", false));
        }

        function createExplosion(x, y, color) {
            for (let i = 0; i < 10; i++) {
                particles.push(new Particle(x, y, color));
            }
        }

        function startGame() {
            document.getElementById("mainMenu").classList.add("hidden");
            document.getElementById("gameOverScreen").classList.add("hidden");
            
            playerColor = document.getElementById("tankColor").value;
            currentLevel = parseInt(document.getElementById("levelSelect").value);
            
            score = 0;
            bullets = [];
            enemies = [];
            particles = [];
            
            player = new Tank(width / 2, height / 2, playerColor, true);
            
            gameRunning = true;
            lastInputTime = Date.now();
            isAutoMode = false;
            
            spawnEnemy();
            updateHUD();
            animate();
        }

        function showMainMenu() {
            document.getElementById("gameOverScreen").classList.add("hidden");
            document.getElementById("mainMenu").classList.remove("hidden");
            gameRunning = false;
        }

        function gameOver() {
            gameRunning = false;
            document.getElementById("finalScore").innerText = "Score: " + score;
            document.getElementById("gameOverScreen").classList.remove("hidden");
        }

        function updateHUD() {
            document.getElementById("levelDisplay").innerText = currentLevel;
            document.getElementById("scoreDisplay").innerText = score;
            document.getElementById("hpDisplay").innerText = Math.max(0, Math.floor(player ? player.hp : 0));
            
            const autoStatus = document.getElementById("auto-status");
            autoStatus.style.display = isAutoMode ? "block" : "none";
        }

        function animate() {
            if (!gameRunning) return;
            
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.fillRect(0, 0, width, height);

            // Auto Play Check
            if (Date.now() - lastInputTime > 2000 && !isAutoMode) {
                isAutoMode = true;
                updateHUD();
            }

            // Player
            player.update();
            player.draw();

// Bullets
            bullets.forEach((bullet, index) => {
                bullet.update();
                bullet.draw();
                if (bullet.markedForDeletion) {
                    bullets.splice(index, 1);
                }
            });

            // Enemies
            enemies.forEach((enemy, eIndex) => {
                enemy.update();
                enemy.draw();

                // Bullet vs Enemy
                bullets.forEach((bullet, bIndex) => {
                    if (bullet.isPlayerBullet) {
                        const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
                        if (dist < enemy.radius + bullet.radius) {
                            createExplosion(bullet.x, bullet.y, "#a55eea");
                            enemy.hp -= 20;
                            bullets.splice(bIndex, 1);
                            
                            if (enemy.hp <= 0) {
                                createExplosion(enemy.x, enemy.y, "#a55eea");
                                enemies.splice(eIndex, 1);
                                score += 100;
                                updateHUD();
                                setTimeout(spawnEnemy, 1000);
                            }
                        }
                    }
                });

                // Player vs Enemy collision
                const distPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
                if (distPlayer < player.radius + enemy.radius) {
                    player.hp -= 1;
                    if (player.hp <= 0) {
                        createExplosion(player.x, player.y, playerColor);
                        gameOver();
                    }
                }
            });

            // Bullet vs Player
            bullets.forEach((bullet, bIndex) => {
                if (!bullet.isPlayerBullet) {
                    const dist = Math.hypot(bullet.x - player.x, bullet.y - player.y);
                    if (dist < player.radius + bullet.radius) {
                        createExplosion(bullet.x, bullet.y, "#ff6b6b");
                        player.hp -= 10;
                        bullets.splice(bIndex, 1);
                        
                        if (player.hp <= 0) {
                            createExplosion(player.x, player.y, playerColor);
                            gameOver();
                        }
                    }
                }
            });

            // Particles
            particles.forEach((particle, index) => {
                particle.update();
                particle.draw();
                if (particle.alpha <= 0) {
                    particles.splice(index, 1);
                }
            });

            // Win condition
            let targetScore = currentLevel * 1000;
            if (score >= targetScore) {
                gameRunning = false;
                alert("LEVEL " + currentLevel + " COMPLETE!");
                showMainMenu();
            }

            updateHUD();
            requestAnimationFrame(animate);
        }

        // --- EVENT LISTENERS ---

        window.addEventListener("keydown", (e) => {
            keys[e.key] = true;
            lastInputTime = Date.now();
            isAutoMode = false;
            updateHUD();
        });
        window.addEventListener("keyup", (e) => keys[e.key] = false);

        window.addEventListener("mousemove", (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            lastInputTime = Date.now();
            isAutoMode = false;
            updateHUD();
        });
        window.addEventListener("mousedown", () => {
            mouse.down = true;
            lastInputTime = Date.now();
            isAutoMode = false;
            updateHUD();
        });
        window.addEventListener("mouseup", () => mouse.down = false);

        // Touch
        canvas.addEventListener("touchstart", (e) => {
            e.preventDefault();
            touch.id = e.touches[0].identifier;
            touch.x = e.touches[0].clientX;
            touch.y = e.touches[0].clientY;
            touch.active = true;
            lastInputTime = Date.now();
            isAutoMode = false;
            updateHUD();
        }, { passive: false });

        canvas.addEventListener("touchmove", (e) => {
            e.preventDefault();
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === touch.id) {
                    touch.x = e.touches[i].clientX;
                    touch.y = e.touches[i].clientY;
                    lastInputTime = Date.now();
                    isAutoMode = false;
                    updateHUD();
                }
            }
        }, { passive: false });

        canvas.addEventListener("touchend", (e) => {
            e.preventDefault();
            let found = false;
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === touch.id) {
                    found = true;
                }
            }
            if (!found) touch.active = false;
        });
