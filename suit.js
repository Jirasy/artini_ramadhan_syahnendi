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
    updateTime();
    setupEventListeners();
    
    // Update time every minute
    setInterval(updateTime, 60000);
});

// Update time and greeting display
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const timeEl = document.getElementById('current-time');
    if (timeEl) timeEl.textContent = `${hours}:${minutes}`;
    
    const timeOfDay = now.getHours();
    let greeting = '';
    if (timeOfDay >= 5 && timeOfDay < 11) greeting = '🌅 Selamat Pagi';
    else if (timeOfDay >= 11 && timeOfDay < 15) greeting = '☀️ Selamat Siang';
    else if (timeOfDay >= 15 && timeOfDay < 18) greeting = '🌤️ Selamat Sore';
    else greeting = '🌙 Selamat Malam';
    
    const greetingEl = document.getElementById('current-greeting');
    if (greetingEl) greetingEl.textContent = greeting;
}

// Setup event listeners
function setupEventListeners() {
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', () => handlePlayerChoice(btn.dataset.choice));
    });
    
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', resetRound);
    }
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
    
    // Fast response delay
    setTimeout(() => {
        displayResult(playerChoice, aiChoice);
    }, 250);
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
    const statusEl = document.getElementById('game-status');
    
    if (result === 'win') {
        playerScore++;
        statusEl.textContent = '🎉 Menang!';
        statusEl.style.color = '#4ade80';
    } else if (result === 'lose') {
        aiScore++;
        statusEl.textContent = '😅 Kalah!';
        statusEl.style.color = '#f87171';
    } else {
        statusEl.textContent = '🤝 Seri!';
        statusEl.style.color = '#fbbf24';
    }
    
    // Update score display
    document.getElementById('player-score').textContent = playerScore;
    document.getElementById('ai-score').textContent = aiScore;
    
    // Show result choices
    document.getElementById('player-emoji').textContent = choices[playerChoice].emoji;
    document.getElementById('player-choice-name').textContent = choices[playerChoice].name;
    document.getElementById('ai-emoji').textContent = choices[aiChoice].emoji;
    document.getElementById('ai-choice-name').textContent = choices[aiChoice].name;
    
    document.getElementById('result-area').classList.remove('hidden');
}

// Reset round
function resetRound() {
    gameActive = true;
    document.getElementById('result-area').classList.add('hidden');
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.disabled = false;
    });
    const statusEl = document.getElementById('game-status');
    statusEl.textContent = 'Siap?';
    statusEl.style.color = '#facc15';
}
