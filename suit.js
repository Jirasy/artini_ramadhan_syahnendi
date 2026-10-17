let playerScore = 0;
let aiScore = 0;
let gameActive = true;

const choices = {
    rock: { emoji: '✊', name: 'Batu' },
    paper: { emoji: '✋', name: 'Kertas' },
    scissors: { emoji: '✌️', name: 'Gunting' }
};

const choicesArray = Object.keys(choices);

document.addEventListener('DOMContentLoaded', () => {
    updateBackground();
    updateTime();
    setupEventListeners();
    
    setInterval(updateTime, 60000);
});

function updateBackground() {
    const now = new Date();
    const hours = now.getHours();
    const bgElement = document.querySelector('.sky-background');
    if (!bgElement) return;
    
    let timeClass = 'night';
    if (hours >= 5 && hours < 7) timeClass = 'early-morning';
    else if (hours >= 7 && hours < 11) timeClass = 'morning';
    else if (hours >= 11 && hours < 14) timeClass = 'noon';
    else if (hours >= 14 && hours < 17) timeClass = 'afternoon';
    else if (hours >= 17 && hours < 19) timeClass = 'evening';
    else if (hours >= 19 && hours < 23) timeClass = 'dusk';
    
    bgElement.className = 'sky-background ' + timeClass;
}

function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const timeEl = document.getElementById('current-time');
    if (timeEl) timeEl.textContent = `${hours}:${minutes}`;
    
    const timeOfDay = now.getHours();
    let greeting = '🌅 Selamat Pagi';
    if (timeOfDay >= 11 && timeOfDay < 15) greeting = '☀️ Selamat Siang';
    else if (timeOfDay >= 15 && timeOfDay < 18) greeting = '🌤️ Selamat Sore';
    else if (timeOfDay >= 18 || timeOfDay < 5) greeting = '🌙 Selamat Malam';
    
    const greetingEl = document.getElementById('current-greeting');
    if (greetingEl) greetingEl.textContent = greeting;
    
    updateBackground();
}

function setupEventListeners() {
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', () => handlePlayerChoice(btn.dataset.choice));
    });
    
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', resetRound);
    }
}

function handlePlayerChoice(playerChoice) {
    if (!gameActive) return;
    gameActive = false;
    
    const aiChoice = choicesArray[Math.floor(Math.random() * 3)];
    
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.choice === playerChoice) {
            btn.classList.add('selected');
        }
        btn.disabled = true;
    });
    
    setTimeout(() => {
        displayResult(playerChoice, aiChoice);
    }, 300);
}

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
    
    document.getElementById('player-score').textContent = playerScore;
    document.getElementById('ai-score').textContent = aiScore;
    
    document.getElementById('player-emoji').textContent = choices[playerChoice].emoji;
    document.getElementById('player-choice-name').textContent = choices[playerChoice].name;
    document.getElementById('ai-emoji').textContent = choices[aiChoice].emoji;
    document.getElementById('ai-choice-name').textContent = choices[aiChoice].name;
    
    document.getElementById('result-area').classList.remove('hidden');
}

function resetRound() {
    gameActive = true;
    document.getElementById('result-area').classList.add('hidden');
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.disabled = false;
    });
    const statusEl = document.getElementById('game-status');
    statusEl.textContent = 'Siap?';
    statusEl.style.color = '';
}
