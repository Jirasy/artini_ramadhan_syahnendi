 // Game state
        let playerScore = 0;
        let aiScore = 0;
        let gameActive = true;

        // Choice mappings
        const choices = {
            rock: { emoji: '✊', name: 'Batu' },
            paper: { emoji: '✋', name: 'Kertas' },
            scissors: { emoji: '✌️', name: 'Gunting' }
        };

        const choicesArray = Object.keys(choices);

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            updateBackground();
            updateTime();
            setupEventListeners();
            
            // Update every minute
            setInterval(updateTime, 60000);
            // Update background every 30 minutes
            setInterval(updateBackground, 30 * 60 * 1000);
        });

        // Update background based on time of day
        function updateBackground() {
            const now = new Date();
            const hours = now.getHours();
            const bgElement = document.querySelector('.sky-background');
            
            let timeClass = '';
            
            if (hours >= 0 && hours < 5) {
                timeClass = 'night';
            } else if (hours >= 5 && hours < 7) {
                timeClass = 'early-morning';
            } else if (hours >= 7 && hours < 11) {
                timeClass = 'morning';
            } else if (hours >= 11 && hours < 14) {
                timeClass = 'noon';
            } else if (hours >= 14 && hours < 17) {
                timeClass = 'afternoon';
            } else if (hours >= 17 && hours < 19) {
                timeClass = 'evening';
            } else if (hours >= 19 && hours < 23) {
                timeClass = 'dusk';
            } else {
                timeClass = 'night';
            }
            
            // Remove old classes
            bgElement.className = 'sky-background';
            bgElement.classList.add(timeClass);
            
            // Add stars for night time
            if (timeClass === 'night' || timeClass === 'early-morning' || timeClass === 'dusk') {
                createStars();
            } else {
                removeStars();
            }
        }
        
        
        // Create twinkling stars
        function createStars() {
            const bg = document.querySelector('.sky-background');
            if (bg.querySelectorAll('.star').length > 0) return;
            
            for (let i = 0; i < 100; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.animationDelay = Math.random() * 3 + 's';
                bg.appendChild(star);
            }
        }

        // Remove stars
        function removeStars() {
            const stars = document.querySelectorAll('.star');
            stars.forEach(star => star.remove());
        }

        // Update time display
        function updateTime() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            document.getElementById('current-time').textContent = `${hours}:${minutes}`;
            
            // Update greeting
            const timeOfDay = now.getHours();
            let greeting = '';
            if (timeOfDay >= 5 && timeOfDay < 11) greeting = '🌅 Selamat Pagi';
            else if (timeOfDay >= 11 && timeOfDay < 15) greeting = '☀️ Selamat Siang';
            else if (timeOfDay >= 15 && timeOfDay < 18) greeting = '🌤️ Selamat Sore';
            else if (timeOfDay >= 18 && timeOfDay < 24) greeting = '🌙 Selamat Malam';
            else greeting = '🌙 Selamat Malam';
            
            document.getElementById('current-greeting').textContent = greeting;
            updateBackground();
        }

        // Setup event listeners
        function setupEventListeners() {
            document.querySelectorAll('.choice-btn').forEach(btn => {
                btn.addEventListener('click', () => handlePlayerChoice(btn.dataset.choice));
            });
            
            document.getElementById('play-again-btn').addEventListener('click', resetRound);
        }

        // Handle player choice
        function handlePlayerChoice(playerChoice) {
            if (!gameActive) return;
            
            gameActive = false;
            
            // Get AI choice
            const aiChoice = choicesArray[Math.floor(Math.random() * 3)];
            
            // Highlight player choice
            document.querySelectorAll('.choice-btn').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.choice === playerChoice) {
                    btn.classList.add('selected');
                }
                btn.disabled = true;
            });
            
            // Delay for animation
            setTimeout(() => {
                displayResult(playerChoice, aiChoice);
            }, 800);
        }

        // Determine winner
        function determineWinner(player, ai) {
            if (player === ai) return 'draw';
            if (
                (player === 'rock' && ai === 'scissors') ||
                (player === 'paper' && ai === 'rock') ||
                (player === 'scissors' && ai === 'paper')
            ) {
                return 'win';
            }
            return 'lose';
        }

        // Display result
        function displayResult(playerChoice, aiChoice) {
            const result = determineWinner(playerChoice, aiChoice);
            
            // Update scores
            if (result === 'win') {
                playerScore++;
                document.getElementById('game-status').textContent = '🎉 Menang!';
                document.getElementById('game-status').style.color = '#4ade80';
            } else if (result === 'lose') {
                aiScore++;
                document.getElementById('game-status').textContent = '😅 Kalah!';
                document.getElementById('game-status').style.color = '#f87171';
            } else {
                document.getElementById('game-status').textContent = '🤝 Seri!';
                document.getElementById('game-status').style.color = '#fbbf24';
            }
            
            // Update score display
            document.getElementById('player-score').classList.add('score-update');
            document.getElementById('ai-score').classList.add('score-update');
            document.getElementById('player-score').textContent = playerScore;
            document.getElementById('ai-score').textContent = aiScore;
            
            // Show result
            document.getElementById('player-emoji').textContent = choices[playerChoice].emoji;
            document.getElementById('player-choice-name').textContent = choices[playerChoice].name;
            document.getElementById('ai-emoji').textContent = choices[aiChoice].emoji;
            document.getElementById('ai-choice-name').textContent = choices[aiChoice].name;
            
            document.getElementById('result-area').classList.remove('hidden');
            
            // Remove animation classes for next update
            setTimeout(() => {
                document.getElementById('player-score').classList.remove('score-update');
                document.getElementById('ai-score').classList.remove('score-update');
            }, 500);
        }

        // Reset round
        function resetRound() {
            gameActive = true;
            document.getElementById('result-area').classList.add('hidden');
            document.querySelectorAll('.choice-btn').forEach(btn => {
                btn.classList.remove('selected');
                btn.disabled = false;
            });
            document.getElementById('game-status').textContent = 'Siap?';
            document.getElementById('game-status').style.color = '';
        }