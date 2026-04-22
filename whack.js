let score = 0;
let timeLeft = 30;
let gameInterval;
let moleInterval;
let moleSpeed = 800; // default Medium

const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const statusDisplay = document.getElementById("status");
const gameBoard = document.getElementById("game-board");
const startBtn = document.getElementById("startBtn");
const difficultySelect = document.getElementById("difficulty");

// Buat grid 3x3
for (let i = 0; i < 9; i++) {
  const hole = document.createElement("div");
  hole.classList.add("hole");
  gameBoard.appendChild(hole);
}

const holes = document.querySelectorAll(".hole");

function startGame() {
  // Reset
  score = 0;
  timeLeft = 30;
  moleSpeed = parseInt(difficultySelect.value);
  scoreDisplay.textContent = "Score: " + score;
  timerDisplay.textContent = "Time: " + timeLeft;
  statusDisplay.textContent = "";

  clearInterval(gameInterval);
  clearInterval(moleInterval);

  gameInterval = setInterval(updateTimer, 1000);
  moleInterval = setInterval(showMole, moleSpeed);
}

function updateTimer() {
  timeLeft--;
  timerDisplay.textContent = "Time: " + timeLeft;
  if (timeLeft <= 0) {
    clearInterval(gameInterval);
    clearInterval(moleInterval);
    statusDisplay.textContent = "Game Over! Final Score: " + score;
  }
}

function showMole() {
  holes.forEach(hole => hole.innerHTML = "");

  const randomHole = holes[Math.floor(Math.random() * holes.length)];
  const mole = document.createElement("div");
  mole.classList.add("mole");
  mole.textContent = "🐹";

  mole.addEventListener("click", () => {
    score++;
    scoreDisplay.textContent = "Score: " + score;
    mole.remove();
  });

  randomHole.appendChild(mole);

  // Mole hilang otomatis setelah 600ms
  setTimeout(() => {
    if (mole.parentElement) mole.remove();
  }, 600);
}

startBtn.addEventListener("click", startGame);