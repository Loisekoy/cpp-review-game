const GRID_SIZE = 18;
const INITIAL_SNAKE = [
  { x: 8, y: 9 },
  { x: 7, y: 9 },
  { x: 6, y: 9 },
];

const tokens = [
  {
    label: "int",
    color: "#ffc33d",
    tip: "int 可以存整數，例如分數、長度或次數。",
  },
  {
    label: "if",
    color: "#59ced0",
    tip: "if 會檢查條件，成立才執行裡面的程式。",
  },
  {
    label: "for",
    color: "#8f59ce",
    tip: "for 適合重複固定次數的動作。",
  },
  {
    label: "while",
    color: "#3faa72",
    tip: "while 會在條件成立時持續重複。",
  },
  {
    label: "cout",
    color: "#f35e47",
    tip: "cout << 可以把結果印到畫面上。",
  },
  {
    label: "cin",
    color: "#2f5bea",
    tip: "cin >> 可以把輸入讀進變數。",
  },
  {
    label: "==",
    color: "#ffc33d",
    tip: "== 用來比較兩邊是否相等。",
  },
  {
    label: "%",
    color: "#59ced0",
    tip: "% 可以取得除法後的餘數。",
  },
];

const directionMap = {
  ArrowUp: { x: 0, y: -1 },
  KeyW: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  KeyS: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  KeyA: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  KeyD: { x: 1, y: 0 },
};

const elements = {
  canvas: document.querySelector("#gameCanvas"),
  scoreValue: document.querySelector("#scoreValue"),
  lengthValue: document.querySelector("#lengthValue"),
  speedValue: document.querySelector("#speedValue"),
  bestValue: document.querySelector("#bestValue"),
  startButton: document.querySelector("#startButton"),
  pauseButton: document.querySelector("#pauseButton"),
  restartButton: document.querySelector("#restartButton"),
  overlay: document.querySelector("#gameOverlay"),
  overlayTitle: document.querySelector("#overlayTitle"),
  overlayText: document.querySelector("#overlayText"),
  currentToken: document.querySelector("#currentToken"),
  currentTip: document.querySelector("#currentTip"),
  tokenLog: document.querySelector("#tokenLog"),
  resultDialog: document.querySelector("#resultDialog"),
  resultBadge: document.querySelector("#resultBadge"),
  finalScore: document.querySelector("#finalScore"),
  resultTitle: document.querySelector("#resultTitle"),
  resultMessage: document.querySelector("#resultMessage"),
  playAgainButton: document.querySelector("#playAgainButton"),
};

const ctx = elements.canvas.getContext("2d");

const state = {
  snake: [],
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
  food: null,
  score: 0,
  eaten: 0,
  speedLevel: 1,
  running: false,
  paused: false,
  gameOver: false,
  started: false,
  lastStepAt: 0,
  animationId: null,
  log: [],
  nextTokenIndex: 0,
  touchStart: null,
};

function loadBestScore() {
  try {
    return Number(localStorage.getItem("codeSnakeBest") || 0);
  } catch {
    return 0;
  }
}

function saveBestScore(score) {
  try {
    localStorage.setItem("codeSnakeBest", String(score));
  } catch {
    // The game is still playable when storage is unavailable.
  }
}

function copyInitialSnake() {
  return INITIAL_SNAKE.map((segment) => ({ ...segment }));
}

function resetGame() {
  state.snake = copyInitialSnake();
  state.direction = { x: 1, y: 0 };
  state.nextDirection = { x: 1, y: 0 };
  state.score = 0;
  state.eaten = 0;
  state.speedLevel = 1;
  state.running = false;
  state.paused = false;
  state.gameOver = false;
  state.started = false;
  state.lastStepAt = 0;
  state.log = [];
  state.nextTokenIndex = 0;
  state.food = createFood({ x: 12, y: 9 });
  if (elements.resultDialog.open) elements.resultDialog.close();
  setOverlay("準備開始", "按開始進入遊戲");
  updateStatus();
  render();
}

function createFood(position) {
  const token = tokens[state.nextTokenIndex % tokens.length];
  state.nextTokenIndex += 1;
  return {
    ...position,
    token,
  };
}

function spawnFood() {
  const occupied = new Set(state.snake.map((segment) => `${segment.x},${segment.y}`));
  const emptyCells = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (!occupied.has(`${x},${y}`)) emptyCells.push({ x, y });
    }
  }

  const next = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  state.food = createFood(next);
}

function setOverlay(title, text) {
  elements.overlay.hidden = false;
  elements.overlayTitle.textContent = title;
  elements.overlayText.textContent = text;
}

function hideOverlay() {
  elements.overlay.hidden = true;
}

function tickDuration() {
  return Math.max(78, 168 - (state.speedLevel - 1) * 12);
}

function updateStatus() {
  elements.scoreValue.textContent = state.score;
  elements.lengthValue.textContent = state.snake.length;
  elements.speedValue.textContent = state.speedLevel;
  elements.bestValue.textContent = Math.max(loadBestScore(), state.score);

  elements.currentToken.textContent = state.food.token.label;
  elements.currentToken.style.background = state.food.token.color;
  elements.currentToken.style.color = state.food.token.label === "cin" ? "white" : "#182128";
  elements.currentTip.textContent = state.food.token.tip;

  elements.pauseButton.disabled = !state.started || state.gameOver;
  elements.startButton.disabled = state.running && !state.paused;
  if (state.running && !state.paused) {
    elements.startButton.textContent = "進行中";
  } else {
    elements.startButton.textContent = state.started ? "繼續" : "開始";
  }

  elements.tokenLog.innerHTML = state.log.length
    ? state.log
        .slice(0, 6)
        .map(
          (item) =>
            `<li><strong>${item.label}</strong> +${item.points}，${item.tip}</li>`,
        )
        .join("")
    : "<li>還沒有吃到語法能量</li>";
}

function startGame() {
  if (state.gameOver) resetGame();
  state.running = true;
  state.paused = false;
  state.started = true;
  state.lastStepAt = 0;
  hideOverlay();
  updateStatus();
  requestLoop();
  elements.canvas.focus();
}

function pauseGame() {
  if (!state.started || state.gameOver) return;

  state.paused = !state.paused;
  state.running = !state.paused;
  if (state.paused) {
    setOverlay("暫停中", "按繼續回到遊戲");
  } else {
    hideOverlay();
    state.lastStepAt = 0;
    requestLoop();
  }
  updateStatus();
}

function requestLoop() {
  if (state.animationId) cancelAnimationFrame(state.animationId);
  state.animationId = requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  render();
  if (!state.running || state.paused || state.gameOver) return;

  if (!state.lastStepAt) state.lastStepAt = timestamp;
  if (timestamp - state.lastStepAt >= tickDuration()) {
    stepGame();
    state.lastStepAt = timestamp;
  }

  state.animationId = requestAnimationFrame(gameLoop);
}

function stepGame() {
  state.direction = state.nextDirection;
  const head = state.snake[0];
  const nextHead = {
    x: head.x + state.direction.x,
    y: head.y + state.direction.y,
  };

  if (isWallCollision(nextHead) || isSelfCollision(nextHead)) {
    endGame();
    return;
  }

  state.snake.unshift(nextHead);

  if (nextHead.x === state.food.x && nextHead.y === state.food.y) {
    eatFood();
  } else {
    state.snake.pop();
  }

  updateStatus();
}

function isWallCollision(position) {
  return position.x < 0 || position.x >= GRID_SIZE || position.y < 0 || position.y >= GRID_SIZE;
}

function isSelfCollision(position) {
  return state.snake.some((segment) => segment.x === position.x && segment.y === position.y);
}

function eatFood() {
  const points = 10 + Math.max(0, state.speedLevel - 1) * 2;
  const token = state.food.token;
  state.score += points;
  state.eaten += 1;
  state.speedLevel = 1 + Math.floor(state.eaten / 4);
  state.log.unshift({ ...token, points });
  spawnFood();
}

function endGame() {
  state.running = false;
  state.gameOver = true;
  saveBestScore(Math.max(loadBestScore(), state.score));
  render();
  updateStatus();
  showResults();
}

function showResults() {
  elements.resultBadge.textContent = state.score;
  elements.finalScore.textContent = state.score;

  if (state.score >= 100) {
    elements.resultTitle.textContent = "程式蛇高手";
    elements.resultMessage.textContent = `吃到 ${state.eaten} 個語法能量，控制節奏很穩。`;
  } else if (state.score >= 50) {
    elements.resultTitle.textContent = "穩定前進";
    elements.resultMessage.textContent = `吃到 ${state.eaten} 個語法能量，可以再挑戰更長。`;
  } else {
    elements.resultTitle.textContent = "再跑一次";
    elements.resultMessage.textContent = "先熟悉轉彎節奏，再去吃更遠的語法能量。";
  }

  elements.resultDialog.showModal();
}

function setDirection(next) {
  const isReverse =
    next.x + state.direction.x === 0 && next.y + state.direction.y === 0;
  if (isReverse) return;
  state.nextDirection = next;
  if (!state.started || state.paused) startGame();
}

function resizeCanvasForDisplay() {
  const rect = elements.canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.round(rect.width * dpr);
  const height = Math.round(rect.height * dpr);
  if (elements.canvas.width !== width || elements.canvas.height !== height) {
    elements.canvas.width = width;
    elements.canvas.height = height;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return {
    width: rect.width,
    height: rect.height,
    cell: rect.width / GRID_SIZE,
  };
}

function render() {
  const board = resizeCanvasForDisplay();
  drawBoard(board);
  drawFood(board);
  drawSnake(board);
}

function drawBoard(board) {
  ctx.clearRect(0, 0, board.width, board.height);
  ctx.fillStyle = "#eaf8ff";
  ctx.fillRect(0, 0, board.width, board.height);
  ctx.strokeStyle = "#cdebf5";
  ctx.lineWidth = 1;

  for (let i = 1; i < GRID_SIZE; i += 1) {
    const offset = i * board.cell;
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset, board.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, offset);
    ctx.lineTo(board.width, offset);
    ctx.stroke();
  }
}

function drawFood(board) {
  const { x, y, token } = state.food;
  const pad = board.cell * 0.13;
  const foodX = x * board.cell + pad;
  const foodY = y * board.cell + pad;
  const size = board.cell - pad * 2;

  drawRoundedRect(foodX, foodY, size, size, Math.max(5, board.cell * 0.18), token.color);
  ctx.strokeStyle = "#182128";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = token.label === "cin" ? "white" : "#182128";
  ctx.font = `900 ${Math.max(11, board.cell * 0.28)}px Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(token.label, foodX + size / 2, foodY + size / 2 + 1, size - 4);
}

function drawSnake(board) {
  state.snake.forEach((segment, index) => {
    const pad = board.cell * 0.1;
    const x = segment.x * board.cell + pad;
    const y = segment.y * board.cell + pad;
    const size = board.cell - pad * 2;
    const color = index === 0 ? "#2f5bea" : index % 2 ? "#3faa72" : "#59ced0";
    drawRoundedRect(x, y, size, size, Math.max(6, board.cell * 0.22), color);
    ctx.strokeStyle = "#182128";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (index === 0) drawEyes(x, y, size);
  });
}

function drawEyes(x, y, size) {
  const eyeRadius = Math.max(2, size * 0.08);
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const side = size * 0.2;
  const front = size * 0.18;
  const horizontal = state.direction.x !== 0;

  const eyes = horizontal
    ? [
        { x: centerX + state.direction.x * front, y: centerY - side },
        { x: centerX + state.direction.x * front, y: centerY + side },
      ]
    : [
        { x: centerX - side, y: centerY + state.direction.y * front },
        { x: centerX + side, y: centerY + state.direction.y * front },
      ];

  ctx.fillStyle = "white";
  eyes.forEach((eye) => {
    ctx.beginPath();
    ctx.arc(eye.x, eye.y, eyeRadius * 1.8, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#182128";
  eyes.forEach((eye) => {
    ctx.beginPath();
    ctx.arc(eye.x, eye.y, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawRoundedRect(x, y, width, height, radius, fill) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

document.addEventListener("keydown", (event) => {
  const next = directionMap[event.code];
  if (!next) return;
  event.preventDefault();
  setDirection(next);
});

elements.canvas.addEventListener("touchstart", (event) => {
  const touch = event.changedTouches[0];
  state.touchStart = { x: touch.clientX, y: touch.clientY };
});

elements.canvas.addEventListener("touchend", (event) => {
  if (!state.touchStart) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - state.touchStart.x;
  const dy = touch.clientY - state.touchStart.y;
  state.touchStart = null;

  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    setDirection({ x: dx > 0 ? 1 : -1, y: 0 });
  } else {
    setDirection({ x: 0, y: dy > 0 ? 1 : -1 });
  }
});

document.querySelectorAll("[data-direction]").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.direction;
    if (direction === "up") setDirection({ x: 0, y: -1 });
    if (direction === "down") setDirection({ x: 0, y: 1 });
    if (direction === "left") setDirection({ x: -1, y: 0 });
    if (direction === "right") setDirection({ x: 1, y: 0 });
  });
});

elements.startButton.addEventListener("click", startGame);
elements.pauseButton.addEventListener("click", pauseGame);
elements.restartButton.addEventListener("click", resetGame);
elements.playAgainButton.addEventListener("click", resetGame);
window.addEventListener("resize", render);

resetGame();
