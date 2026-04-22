const size = 21; // ukuran maze (harus ganjil)
let maze;
let playerPos;
const finishPos = {x: size-2, y: size-2};

let steps = 0;
let startTime;
let timerInterval;

const gameBoard = document.getElementById("game-board");
const statusDisplay = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

function generateMaze() {
  maze = Array.from({length: size}, () => Array(size).fill(1));

  function carve(x, y) {
    const directions = [[0,-2],[0,2],[-2,0],[2,0]].sort(() => Math.random()-0.5);
    for (let [dx,dy] of directions) {
      const nx = x+dx, ny = y+dy;
      if (nx>0 && nx<size-1 && ny>0 && ny<size-1 && maze[ny][nx]===1) {
        maze[ny][nx] = 0;
        maze[y+dy/2][x+dx/2] = 0;
        carve(nx,ny);
      }
    }
  }

  maze[1][1] = 0;
  carve(1,1);

  playerPos = {x:1,y:1};
}

function renderMaze() {
  gameBoard.innerHTML = "";
  for (let y=0; y<size; y++) {
    for (let x=0; x<size; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (maze[y][x] === 1) cell.classList.add("wall");
      else cell.classList.add("path");

      if (x === playerPos.x && y === playerPos.y) cell.classList.add("player");
      if (x === finishPos.x && y === finishPos.y) cell.classList.add("finish");

      gameBoard.appendChild(cell);
    }
  }
}

function movePlayer(dx, dy) {
  const newX = playerPos.x + dx;
  const newY = playerPos.y + dy;
  if (maze[newY][newX] === 0) {
    playerPos = {x:newX, y:newY};
    steps++;
    updateInfo();
    renderMaze();
    checkWin();
  }
}

function checkWin() {
  if (playerPos.x === finishPos.x && playerPos.y === finishPos.y) {
    clearInterval(timerInterval);
    const timeTaken = Math.floor((Date.now() - startTime)/1000);
    const score = Math.max(1000 - (steps + timeTaken), 0);
    statusDisplay.textContent = `Selamat! Kamu keluar dari maze 🎉 | Langkah: ${steps}, Waktu: ${timeTaken} detik, Score: ${score}`;
    document.removeEventListener("keydown", handleKey);
  }
}

function handleKey(e) {
  switch(e.key) {
    case "ArrowUp": movePlayer(0,-1); break;
    case "ArrowDown": movePlayer(0,1); break;
    case "ArrowLeft": movePlayer(-1,0); break;
    case "ArrowRight": movePlayer(1,0); break;
  }
}

function updateInfo() {
  const timeTaken = Math.floor((Date.now() - startTime)/1000);
  const score = Math.max(1000 - (steps + timeTaken), 0);
  document.getElementById("steps").textContent = "Langkah: " + steps;
  document.getElementById("time").textContent = "Waktu: " + timeTaken + " detik";
  document.getElementById("score").textContent = "Score: " + score;
}

function startGame() {
  generateMaze();
  steps = 0;
  startTime = Date.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateInfo, 1000);
  statusDisplay.textContent = "Maze baru dimulai!";
  document.addEventListener("keydown", handleKey);
  renderMaze();
  updateInfo();
}

restartBtn.addEventListener("click", startGame);
startGame();