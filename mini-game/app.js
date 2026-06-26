const rounds = [
  {
    concept: "Scratch",
    title: "綠旗出發",
    prompt: "角色要開始執行程式，第一塊積木應該放哪一個？",
    kind: "scratch",
    visual: "？\n移動 10 步\n說「完成」",
    answers: [
      { text: "當綠旗被點擊", correct: true, explain: "事件積木會啟動下面的程式。" },
      { text: "停止全部", correct: false, explain: "停止全部會讓程式結束，不會開始動作。" },
      { text: "等待 1 秒", correct: false, explain: "等待可以延遲，但不能當作啟動事件。" },
    ],
    review: "Scratch 程式通常先由事件積木啟動，例如「當綠旗被點擊」。",
  },
  {
    concept: "Scratch",
    title: "重複幾次",
    prompt: "每次移動 10 步，要總共移動 40 步，重複次數要填多少？",
    kind: "scratch",
    visual: "重複（？）次\n　移動 10 步",
    answers: [
      { text: "2 次", correct: false, explain: "2 次只會走 20 步。" },
      { text: "4 次", correct: true, explain: "4 × 10 = 40。" },
      { text: "10 次", correct: false, explain: "10 次會走到 100 步，太多了。" },
    ],
    review: "重複次數可以用總距離除以每次移動距離來判斷。",
  },
  {
    concept: "C++",
    title: "印出文字",
    prompt: "要在 C++ 畫面上印出 Hello，哪一行最正確？",
    kind: "code",
    visual: "____",
    answers: [
      { text: 'cout << "Hello";', correct: true, explain: "cout 搭配 << 可以把內容輸出到畫面。" },
      { text: 'cin >> "Hello";', correct: false, explain: "cin 是讀入資料，不是印出文字。" },
      { text: 'cout >> "Hello";', correct: false, explain: "cout 的資料方向是 <<。" },
    ],
    review: "C++ 輸出使用 cout <<，字串要放在雙引號裡。",
  },
  {
    concept: "C++",
    title: "讀入分數",
    prompt: "已經有 int score;，要讓使用者輸入 score，哪一行正確？",
    kind: "code",
    visual: "int score;\n____",
    answers: [
      { text: "cin << score;", correct: false, explain: "cin 的資料方向要使用 >>。" },
      { text: "cin >> score;", correct: true, explain: "資料會從輸入流進 score 變數。" },
      { text: "cout >> score;", correct: false, explain: "cout 是輸出，不是讀入。" },
    ],
    review: "C++ 讀入使用 cin >> 變數名稱。",
  },
  {
    concept: "C++",
    title: "變數盒子",
    prompt: "要建立整數變數 level，並把 2 放進去，哪一行正確？",
    kind: "code",
    visual: "建立整數 level\n放入數字 2",
    answers: [
      { text: "level int = 2;", correct: false, explain: "資料型態要放在變數名稱前面。" },
      { text: "int level = 2;", correct: true, explain: "int 宣告整數，= 把 2 放進 level。" },
      { text: "int = level 2;", correct: false, explain: "宣告順序不完整。" },
    ],
    review: "宣告整數變數可寫成 int level = 2;。",
  },
  {
    concept: "C++",
    title: "及格判斷",
    prompt: "如果 score 大於等於 60 就印出 Pass，條件要怎麼寫？",
    kind: "code",
    visual: "if ( <span class=\"blank\">____</span> ) {\n    cout << \"Pass\";\n}",
    answers: [
      { text: "score >= 60", correct: true, explain: ">= 表示大於或等於，符合及格判斷。" },
      { text: "score = 60", correct: false, explain: "一個等號是指定值，不是比較。" },
      { text: "score < 60", correct: false, explain: "這是在檢查不及格。" },
    ],
    review: "if 的括號裡放條件，>= 可表示大於或等於。",
  },
  {
    concept: "C++",
    title: "for 迴圈追蹤",
    prompt: "這段程式會印出什麼？",
    kind: "code",
    visual: "for (int i = 1; i <= 3; i++) {\n    cout << i;\n}",
    answers: [
      { text: "123", correct: true, explain: "i 依序是 1、2、3，接著變成 4 後停止。" },
      { text: "0123", correct: false, explain: "i 的初始值是 1，不是 0。" },
      { text: "一直印 1", correct: false, explain: "i++ 會讓 i 每圈增加。" },
    ],
    review: "for 迴圈要看初始值、條件、更新三個地方。",
  },
  {
    concept: "C++",
    title: "while 不迷路",
    prompt: "要讓 while 從 1 印到 5 後停止，空格應該補哪一組？",
    kind: "code",
    visual: "int i = 1;\nwhile ( <span class=\"blank\">____</span> ) {\n    cout << i;\n    <span class=\"blank\">____</span>;\n}",
    answers: [
      { text: "i <= 5 / i++", correct: true, explain: "條件包含 5，每圈 i++ 才能慢慢停止。" },
      { text: "i = 5 / i++", correct: false, explain: "一個等號不是比較條件。" },
      { text: "i <= 5 / i = 1", correct: false, explain: "i 一直回到 1，會停不下來。" },
    ],
    review: "while 需要正確條件，也要在迴圈中更新控制變數。",
  },
];

const pointsPerRound = 100 / rounds.length;

const state = {
  index: 0,
  score: 0,
  streak: 0,
  completed: 0,
  hadMistake: false,
  review: [],
};

const elements = {
  roundCounter: document.querySelector("#roundCounter"),
  scoreValue: document.querySelector("#scoreValue"),
  streakValue: document.querySelector("#streakValue"),
  bestValue: document.querySelector("#bestValue"),
  energyMeter: document.querySelector("#energyMeter"),
  checkpoints: document.querySelector("#checkpoints"),
  runner: document.querySelector("#runner"),
  feedback: document.querySelector("#feedback"),
  feedbackText: document.querySelector("#feedbackText"),
  conceptLabel: document.querySelector("#conceptLabel"),
  challengeTitle: document.querySelector("#challengeTitle"),
  challengePrompt: document.querySelector("#challengePrompt"),
  promptWindow: document.querySelector("#promptWindow"),
  answers: document.querySelector("#answers"),
  nextButton: document.querySelector("#nextButton"),
  resetButton: document.querySelector("#resetButton"),
  resultDialog: document.querySelector("#resultDialog"),
  resultBadge: document.querySelector("#resultBadge"),
  resultTitle: document.querySelector("#resultTitle"),
  finalScore: document.querySelector("#finalScore"),
  resultMessage: document.querySelector("#resultMessage"),
  reviewList: document.querySelector("#reviewList"),
  playAgainButton: document.querySelector("#playAgainButton"),
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadBestScore() {
  try {
    return Number(localStorage.getItem("energyRelayBest") || 0);
  } catch {
    return 0;
  }
}

function saveBestScore(score) {
  try {
    localStorage.setItem("energyRelayBest", String(score));
  } catch {
    // Local storage can fail in private windows; the game still works.
  }
}

function setFeedback(message, tone = "neutral") {
  elements.feedbackText.textContent = message;
  elements.feedback.dataset.tone = tone;
}

function buildStaticPieces() {
  elements.energyMeter.innerHTML = rounds
    .map((_, index) => `<span class="energy-dot" data-energy="${index}"></span>`)
    .join("");

  elements.checkpoints.innerHTML = rounds
    .map((_, index) => `<li data-step="${index}">${index + 1}</li>`)
    .join("");
}

function renderStatus() {
  const shownIndex = Math.min(state.index + 1, rounds.length);
  const score = Math.min(100, Math.round(state.score));

  elements.roundCounter.textContent = `${shownIndex} / ${rounds.length}`;
  elements.scoreValue.textContent = score;
  elements.streakValue.textContent = state.streak;
  elements.bestValue.textContent = Math.max(loadBestScore(), score);

  elements.energyMeter.querySelectorAll(".energy-dot").forEach((dot, index) => {
    dot.classList.toggle("filled", index < state.completed);
  });

  elements.checkpoints.querySelectorAll("li").forEach((item, index) => {
    item.classList.toggle("done", index < state.completed);
    item.classList.toggle("active", index === state.index);
  });

  const progressPercent = rounds.length <= 1 ? 0 : (state.completed / rounds.length) * 100;
  elements.runner.style.setProperty("--runner-left", `${progressPercent}%`);
}

function renderPrompt(round) {
  const content = round.visual.replaceAll("\n", "<br>");
  if (round.kind === "scratch") {
    elements.promptWindow.innerHTML = `<div class="scratch-card">${content}</div>`;
    return;
  }

  elements.promptWindow.innerHTML = `<div class="code-card">${content}</div>`;
}

function renderRound() {
  const round = rounds[state.index];
  state.hadMistake = false;
  elements.nextButton.hidden = true;

  elements.conceptLabel.textContent = round.concept;
  elements.challengeTitle.textContent = round.title;
  elements.challengePrompt.textContent = round.prompt;
  renderPrompt(round);

  elements.answers.innerHTML = round.answers
    .map(
      (answer, index) => `
        <button class="answer-button" data-answer="${index}" type="button">
          ${round.concept === "C++" ? `<code>${escapeHtml(answer.text)}</code>` : escapeHtml(answer.text)}
        </button>`,
    )
    .join("");

  elements.answers.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => chooseAnswer(Number(button.dataset.answer), button));
  });

  setFeedback("選一個正確指令，幫角色充能前進。", "neutral");
  renderStatus();
}

function chooseAnswer(answerIndex, button) {
  const round = rounds[state.index];
  const answer = round.answers[answerIndex];

  if (!answer.correct) {
    state.hadMistake = true;
    state.streak = 0;
    button.classList.add("wrong");
    button.disabled = true;
    setFeedback(answer.explain, "error");
    renderStatus();
    return;
  }

  const points = state.hadMistake ? pointsPerRound * 0.64 : pointsPerRound;
  state.score += points;
  state.streak += 1;
  state.completed += 1;
  state.review.push({
    title: round.title,
    text: round.review,
    firstTry: !state.hadMistake,
  });

  elements.answers.querySelectorAll("button").forEach((item) => {
    item.disabled = true;
  });
  button.classList.add("correct");
  elements.runner.classList.add("pop");
  setTimeout(() => elements.runner.classList.remove("pop"), 240);

  setFeedback(answer.explain, "success");
  elements.nextButton.textContent = state.index === rounds.length - 1 ? "看結果" : "下一題";
  elements.nextButton.hidden = false;
  renderStatus();
}

function goNext() {
  if (state.index >= rounds.length - 1) {
    showResults();
    return;
  }

  state.index += 1;
  renderRound();
}

function showResults() {
  const finalScore = Math.min(100, Math.round(state.score));
  saveBestScore(Math.max(loadBestScore(), finalScore));
  elements.finalScore.textContent = finalScore;

  if (finalScore >= 90) {
    elements.resultBadge.textContent = "S";
    elements.resultTitle.textContent = "程式能量隊長";
    elements.resultMessage.textContent = "Scratch 和 C++ 的轉換觀念很穩，可以挑戰當小老師。";
  } else if (finalScore >= 70) {
    elements.resultBadge.textContent = "A";
    elements.resultTitle.textContent = "穩定接力員";
    elements.resultMessage.textContent = "大方向都抓到了，回頭看錯題就會更熟。";
  } else {
    elements.resultBadge.textContent = "B";
    elements.resultTitle.textContent = "勇敢練習員";
    elements.resultMessage.textContent = "先把輸入輸出、if、迴圈三個核心補起來，再玩一次。";
  }

  elements.reviewList.innerHTML = rounds
    .map((round) => {
      const result = state.review.find((item) => item.title === round.title);
      const mark = result?.firstTry ? "一次答對" : result ? "修正後答對" : "未完成";
      return `<li><strong>${escapeHtml(round.title)}：</strong>${escapeHtml(mark)}，${escapeHtml(round.review)}</li>`;
    })
    .join("");

  renderStatus();
  elements.resultDialog.showModal();
}

function resetGame() {
  state.index = 0;
  state.score = 0;
  state.streak = 0;
  state.completed = 0;
  state.hadMistake = false;
  state.review = [];
  if (elements.resultDialog.open) elements.resultDialog.close();
  renderRound();
}

elements.nextButton.addEventListener("click", goNext);
elements.resetButton.addEventListener("click", resetGame);
elements.playAgainButton.addEventListener("click", resetGame);

buildStaticPieces();
renderRound();
