const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        
        canvas.width = 400;
        canvas.height = 400;
        
        const GRID_SIZE = 20;
        const TILE_COUNT = canvas.width / GRID_SIZE;

        let snake = [];
        let food = { x: 10, y: 10 };
        let dx = 0;
        let dy = 0;
        let score = 0;
        let foodEaten = 0;
        let gameSpeed = 120;
        let baseSpeed = 120;
        let gameLoopId = null;
        let isGameRunning = false;
        let isEndless = false;
        let selectedColor = "rainbow";
        let customColor = "#4CAF50";
        let rainbowHue = 0;

        const mainMenu = document.getElementById("main-menu");
        const gameOverScreen = document.getElementById("game-over");
        const hud = document.getElementById("hud");
        const scoreEl = document.getElementById("score");
        const lengthEl = document.getElementById("length");
        const finalScoreEl = document.getElementById("final-score");
        const finalLengthEl = document.getElementById("final-length");
        const finalFoodEl = document.getElementById("final-food");
        const customColorInput = document.getElementById("custom-color-input");

        // COLOR SELECTION
        document.querySelectorAll(".color-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                selectedColor = this.dataset.color;
                if (selectedColor === "custom") {
                    customColorInput.style.display = "block";
                } else {
                    customColorInput.style.display = "none";
                }
            });
        });

        customColorInput.addEventListener("input", function() {
            customColor = this.value;
        });

        // MODE SELECTION
        document.querySelectorAll(".mode-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                gameSpeed = this.dataset.speed;
            });
        });

        // KEYBOARD CONTROLS
        document.addEventListener("keydown", function(e) {
            if(!isGameRunning) return;
            if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
            
            switch(e.key) {
                case "ArrowLeft": case "a": case "A": changeDirection("LEFT"); break;
                case "ArrowUp": case "w": case "W": changeDirection("UP"); break;
                case "ArrowRight": case "d": case "D": changeDirection("RIGHT"); break;
                case "ArrowDown": case "s": case "S": changeDirection("DOWN"); break;
            }
        });

        // MOUSE/TOUCH CONTROLS FOR D-PAD
        document.getElementById("btn-up").addEventListener("mousedown", () => changeDirection("UP"));
        document.getElementById("btn-down").addEventListener("mousedown", () => changeDirection("DOWN"));
        document.getElementById("btn-left").addEventListener("mousedown", () => changeDirection("LEFT"));
        document.getElementById("btn-right").addEventListener("mousedown", () => changeDirection("RIGHT"));

        // CHANGE DIRECTION
        function changeDirection(newDirection) {
            if (!isGameRunning) return;
            
            const goingUp = dy === -1;
            const goingDown = dy === 1;
            const goingRight = dx === 1;
            const goingLeft = dx === -1;

            if (newDirection === "LEFT" && !goingRight) { dx = -1; dy = 0; }
            if (newDirection === "UP" && !goingDown) { dx = 0; dy = -1; }
            if (newDirection === "RIGHT" && !goingLeft) { dx = 1; dy = 0; }
            if (newDirection === "DOWN" && !goingUp) { dx = 0; dy = 1; }
        }

        // START GAME
        function startGame() {
            // Setup speed
            if (gameSpeed === "endless") {
                isEndless = true;
                baseSpeed = 150;
                gameSpeed = baseSpeed;
            } else {
                isEndless = false;
                gameSpeed = parseInt(gameSpeed);
                baseSpeed = gameSpeed;
            }

            // Reset game state
            snake = [{ x: 10, y: 10 }];
            food = spawnFood();
            dx = 1;
            dy = 0;
            score = 0;
            foodEaten = 0;
            rainbowHue = 0;

            // Update UI
            scoreEl.innerText = score;
            lengthEl.innerText = snake.length;
            mainMenu.classList.add("hidden");
            gameOverScreen.classList.add("hidden");
            hud.classList.remove("hidden");

            // Start game loop
            isGameRunning = true;
            if (gameLoopId) clearInterval(gameLoopId);
            gameLoopId = setInterval(gameLoop, gameSpeed);
        }

        // SHOW MAIN MENU
        function showMainMenu() {
            gameOverScreen.classList.add("hidden");
            mainMenu.classList.remove("hidden");
            hud.classList.add("hidden");
            
            // Clear canvas
            ctx.fillStyle = "#0d0d1a";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // GAME LOOP
        function gameLoop() {
            // Move snake
            const head = { x: snake[0].x + dx, y: snake[0].y + dy };
            snake.unshift(head);

            // Check wall collision
            if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
                gameOver();
                return;
            }

            // Check self collision
            for (let i = 1; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    gameOver();
                    return;
                }
            }

            // Check food collision
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                foodEaten++;
                scoreEl.innerText = score;
                lengthEl.innerText = snake.length;
                food = spawnFood();

                // Endless mode: increase speed
                if (isEndless && gameSpeed > 40) {
                    gameSpeed -= 2;
                    clearInterval(gameLoopId);
                    gameLoopId = setInterval(gameLoop, gameSpeed);
                }
            } else {
                snake.pop();
            }

            // Update rainbow hue
            rainbowHue = (rainbowHue + 5) % 360;

            drawGame();
        }

        // SPAWN FOOD
        function spawnFood() {
            let newFood;
            while (true) {
                newFood = {
                    x: Math.floor(Math.random() * TILE_COUNT),
                    y: Math.floor(Math.random() * TILE_COUNT)
                };

                // Check if food spawns on snake body
                let collision = false;
                for (let part of snake) {
                    if (part.x === newFood.x && part.y === newFood.y) {
                        collision = true;
                        break;
                    }
                }
                if (!collision) break;
            }
            return newFood;
        }

        // DRAW GAME
        function drawGame() {
            // Clear canvas
            ctx.fillStyle = "#0d0d1a";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw grid
            ctx.strokeStyle = "#1a1a2e";
            ctx.lineWidth = 1;
            for (let i = 0; i <= TILE_COUNT; i++) {
                ctx.beginPath();
                ctx.moveTo(i * GRID_SIZE, 0);
                ctx.lineTo(i * GRID_SIZE, canvas.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * GRID_SIZE);
                ctx.lineTo(canvas.width, i * GRID_SIZE);
                ctx.stroke();
            }

            // Draw snake
            snake.forEach((part, index) => {
                let fillStyle;

                if (selectedColor === "rainbow") {
                    const hue = (rainbowHue + index * 15) % 360;
                    fillStyle = `hsl(${hue}, 100%, 50%)`;
                } else if (selectedColor === "custom") {
                    fillStyle = customColor;
                } else {
                    fillStyle = selectedColor;
                }

                ctx.fillStyle = fillStyle;

                // Head is slightly larger
                const size = index === 0 ? GRID_SIZE - 2 : GRID_SIZE - 4;
                const offset = index === 0 ? 1 : 2;

                ctx.fillRect(
                    part.x * GRID_SIZE + offset,
                    part.y * GRID_SIZE + offset,
                    size,
                    size
                );
            });

            // Draw food
            ctx.fillStyle = "#ff6b6b";
            ctx.shadowColor = "#ff6b6b";
            ctx.shadowBlur = 15;
            ctx.fillRect(food.x * GRID_SIZE + 3, food.y * GRID_SIZE + 3, GRID_SIZE - 6, GRID_SIZE - 6);
            ctx.shadowBlur = 0;
        }

        // GAME OVER
        function gameOver() {
            isGameRunning = false;
            clearInterval(gameLoopId);

            finalScoreEl.innerText = score;
            finalLengthEl.innerText = snake.length;
            finalFoodEl.innerText = foodEaten;

            hud.classList.add("hidden");
            gameOverScreen.classList.remove("hidden");
        }

        // INITIALIZE
        ctx.fillStyle = "#0d0d1a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("🐍 Snake Game", canvas.width / 2, canvas.height / 2);
        ctx.font = "14px Arial";
        ctx.fillStyle = "#a0a0a0";
        ctx.fillText("Pilih menu untuk mulai", canvas.width / 2, canvas.height / 2 + 30);