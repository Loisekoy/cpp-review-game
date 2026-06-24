const missions = [
  {
    type: "sequence",
    title: "排好 Scratch 積木",
    prompt: "讓角色出發、走到星星，最後說出「完成！」。",
    tags: ["Scratch", "順序", "事件"],
    review: "Scratch 會由上往下執行積木，先事件、再動作、最後說話。",
  },
  {
    type: "quiz",
    title: "抓住重複的力量",
    prompt: "角色每次走 10 步，要走到 50 步的位置，重複幾次？",
    tags: ["Scratch", "重複", "乘法"],
    visual: {
      kind: "scratch",
      text: "重複（？）次\n　移動 10 步",
      className: "block-control",
    },
    answers: ["3 次", "5 次", "10 次", "50 次"],
    correct: 1,
    success: "答對了！5 × 10 = 50 步。",
    hint: "把總距離 50 除以每次移動的 10。",
    review: "Scratch 的重複積木，相當於讓同一段指令執行很多次。",
  },
  {
    type: "quiz",
    title: "接好 C++ 輸入輸出",
    prompt: "哪一組符號能正確讀入 score，再把 score 印出來？",
    tags: ["C++", "cin", "cout"],
    visual: {
      kind: "code",
      text: "int score;\ncin  __  score;\ncout __  score;",
    },
    answers: [
      "cin << score;　cout >> score;",
      "cin >> score;　cout << score;",
      "cin == score;　cout = score;",
      "cin >= score;　cout <= score;",
    ],
    correct: 1,
    success: "連接成功！cin 用 >>，cout 用 <<。",
    hint: "想像資料流向：輸入流進變數，輸出流向畫面。",
    review: "C++ 輸入使用 cin >>，輸出使用 cout <<。",
  },
  {
    type: "quiz",
    title: "把 Scratch 翻成 C++",
    prompt: "這塊 Scratch 判斷，最接近哪一段 C++？",
    tags: ["Scratch", "C++", "if 判斷"],
    visual: {
      kind: "scratch",
      text: "如果〈score ≥ 60〉那麼\n　說「Pass」",
      className: "block-control",
    },
    answers: [
      "if (score >= 60) { cout << \"Pass\"; }",
      "while (score >= 60) { cin >> score; }",
      "for (score = 60) { cout << \"Pass\"; }",
      "if (score = 60) { cin << \"Pass\"; }",
    ],
    correct: 0,
    success: "翻譯成功！Scratch 的「如果」就是 C++ 的 if。",
    hint: "找出 if、比較符號 >=，以及輸出 Pass 的 cout。",
    review: "Scratch 的條件積木可以對照 C++ 的 if (條件) { 指令 }。",
  },
  {
    type: "final",
    title: "修好 while 終極題",
    prompt: "讓程式正確輸出 1、2、3、4、5。選出條件與更新指令。",
    tags: ["C++", "while", "追蹤"],
    review: "while 要先設定初始值、檢查條件，並在每一圈更新 i，才能正確停止。",
  },
];

const sequenceBlocks = [
  { id: "flag", text: "當綠旗被點擊", className: "block-event" },
  { id: "move", text: "移動 50 步", className: "block-motion" },
  { id: "turn", text: "右轉 15 度", className: "block-motion" },
  { id: "say", text: "說「完成！」", className: "block-looks" },
];

const correctSequence = ["flag", "move", "say"];

const state = {
  missionIndex: 0,
  score: 0,
  lives: 3,
  sequence: [],
  selectedAnswer: null,
  answers: [],
};

const elements = {
  levelCount: document.querySelector("#levelCount"),
  scoreValue: document.querySelector("#scoreValue"),
  livesValue: document.querySelector("#livesValue"),
  resetButton: document.querySelector("#resetButton"),
  levelTrack: document.querySelector("#levelTrack"),
  missionNumber: document.querySelector("#missionNumber"),
  missionTitle: document.querySelector("#missionTitle"),
  missionPrompt: document.querySelector("#missionPrompt"),
  conceptTags: document.querySelector("#conceptTags"),
  bestScore: document.querySelector("#bestScore"),
  playPanel: document.querySelector("#playPanel"),
  feedbackBar: document.querySelector("#feedbackBar"),
  feedbackText: document.querySelector("#feedbackText"),
  resultDialog: document.querySelector("#resultDialog"),
  resultBadge: document.querySelector("#resultBadge"),
  resultTitle: document.querySelector("#resultTitle"),
  finalScore: document.querySelector("#finalScore"),
  resultMessage: document.querySelector("#resultMessage"),
  playAgainButton: document.querySelector("#playAgainButton"),
  reviewButton: document.querySelector("#reviewButton"),
  reviewList: document.querySelector("#reviewList"),
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
    return Number(localStorage.getItem("cppReviewBest") || 0);
  } catch {
    return 0;
  }
}

function saveBestScore(score) {
  try {
    localStorage.setItem("cppReviewBest", String(score));
  } catch {
    // The game remains fully playable when storage is unavailable.
  }
}

function setFeedback(text, tone = "neutral") {
  elements.feedbackText.textContent = text;
  elements.feedbackBar.dataset.tone = tone;
}

function buildTrack() {
  elements.levelTrack.innerHTML = missions
    .map(
      (mission, index) => `
        <li data-index="${index + 1}" data-level="${index}">
          <span>${escapeHtml(mission.tags[0])}</span>
        </li>`,
    )
    .join("");
}

function updateStatus() {
  elements.levelCount.textContent = `${state.missionIndex + 1} / ${missions.length}`;
  elements.scoreValue.textContent = state.score;
  elements.livesValue.textContent = Array.from({ length: 3 }, (_, index) =>
    index < state.lives ? "♥" : "♡",
  ).join(" ");
  elements.bestScore.textContent = Math.max(loadBestScore(), state.score);

  elements.levelTrack.querySelectorAll("li").forEach((item, index) => {
    item.classList.toggle("done", index < state.missionIndex);
    item.classList.toggle("active", index === state.missionIndex);
  });
}

function renderMission() {
  const mission = missions[state.missionIndex];
  elements.missionNumber.textContent = `任務 ${String(state.missionIndex + 1).padStart(2, "0")}`;
  elements.missionTitle.textContent = mission.title;
  elements.missionPrompt.textContent = mission.prompt;
  elements.conceptTags.innerHTML = mission.tags
    .map((tag) => `<span class="concept-tag">${escapeHtml(tag)}</span>`)
    .join("");

  state.selectedAnswer = null;
  if (mission.type === "sequence") renderSequenceMission();
  if (mission.type === "quiz") renderQuizMission(mission);
  if (mission.type === "final") renderFinalMission();
  updateStatus();
}

function renderSequenceMission() {
  elements.playPanel.innerHTML = `
    <div class="scratch-stage" aria-label="Scratch 角色與星星舞台">
      <img class="sprite" src="assets/sprite.svg" alt="等待出發的程式角色" />
    </div>
    <div class="block-workspace">
      <div class="block-bank">
        <span class="workspace-title">積木區</span>
        <div id="blockBank"></div>
      </div>
      <div class="sequence-tray">
        <span class="workspace-title">程式區</span>
        <div id="sequenceTray"></div>
      </div>
    </div>
    <div class="action-row">
      <button class="secondary-button" id="clearSequence" type="button">清除</button>
      <button class="primary-button" id="runSequence" type="button">執行程式</button>
    </div>
  `;

  renderSequenceBlocks();
  document.querySelector("#clearSequence").addEventListener("click", () => {
    state.sequence = [];
    renderSequenceBlocks();
    setFeedback("程式區已清空，再排一次。", "neutral");
  });
  document.querySelector("#runSequence").addEventListener("click", checkSequence);
}

function renderSequenceBlocks() {
  const bank = document.querySelector("#blockBank");
  const tray = document.querySelector("#sequenceTray");
  const remaining = sequenceBlocks.filter((block) => !state.sequence.includes(block.id));

  bank.innerHTML = remaining
    .map(
      (block) => `
        <button class="scratch-block ${block.className}" data-block-id="${block.id}" type="button">
          ${escapeHtml(block.text)}
        </button>`,
    )
    .join("");

  tray.innerHTML = state.sequence.length
    ? state.sequence
        .map((id, index) => {
          const block = sequenceBlocks.find((item) => item.id === id);
          return `
            <button class="scratch-block ${block.className}" data-tray-index="${index}" type="button">
              ${escapeHtml(block.text)}
            </button>`;
        })
        .join("")
    : '<div class="empty-tray">依照執行順序放入三塊積木</div>';

  bank.querySelectorAll("[data-block-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.sequence.length >= 3) {
        setFeedback("程式區只能放三塊積木，先移除一塊。", "error");
        return;
      }
      state.sequence.push(button.dataset.blockId);
      renderSequenceBlocks();
    });
  });

  tray.querySelectorAll("[data-tray-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.sequence.splice(Number(button.dataset.trayIndex), 1);
      renderSequenceBlocks();
    });
  });
}

function checkSequence() {
  const isCorrect =
    state.sequence.length === correctSequence.length &&
    state.sequence.every((id, index) => id === correctSequence[index]);

  if (!isCorrect) {
    handleWrong("順序還不對。程式要先收到綠旗事件，角色才會開始動。", state.sequence.join(" → "));
    return;
  }

  const sprite = document.querySelector(".sprite");
  sprite.classList.add("run");
  state.answers.push({ mission: missions[0].title, correct: true, answer: "綠旗 → 移動 → 說完成" });
  state.score += 20;
  setFeedback("角色成功到達星星！Scratch 會由上往下執行積木。", "success");
  setTimeout(nextMission, 1000);
}

function visualMarkup(visual) {
  if (visual.kind === "scratch") {
    return `
      <div class="scratch-example">
        <div class="scratch-block ${visual.className}">${escapeHtml(visual.text).replaceAll("\n", "<br>")}</div>
      </div>`;
  }

  const code = escapeHtml(visual.text).replaceAll("__", '<span class="blank">__</span>');
  return `<div class="code-window">${code}</div>`;
}

function renderQuizMission(mission) {
  elements.playPanel.innerHTML = `
    <div class="quiz-visual">${visualMarkup(mission.visual)}</div>
    <div class="answer-grid">
      ${mission.answers
        .map(
          (answer, index) => `
            <button class="answer-button" data-answer="${index}" type="button">
              ${mission.tags.includes("C++") ? `<code>${escapeHtml(answer)}</code>` : escapeHtml(answer)}
            </button>`,
        )
        .join("")}
    </div>
    <div class="action-row">
      <button class="primary-button" id="submitAnswer" type="button" disabled>送出答案</button>
    </div>
  `;

  const submit = document.querySelector("#submitAnswer");
  elements.playPanel.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedAnswer = Number(button.dataset.answer);
      elements.playPanel.querySelectorAll("[data-answer]").forEach((item) => {
        item.classList.toggle("selected", item === button);
      });
      submit.disabled = false;
    });
  });

  submit.addEventListener("click", () => checkQuiz(mission));
}

function checkQuiz(mission) {
  if (state.selectedAnswer !== mission.correct) {
    handleWrong(mission.hint, mission.answers[state.selectedAnswer]);
    return;
  }

  state.answers.push({
    mission: mission.title,
    correct: true,
    answer: mission.answers[state.selectedAnswer],
  });
  state.score += 20;
  setFeedback(mission.success, "success");
  setTimeout(nextMission, 850);
}

function renderFinalMission() {
  elements.playPanel.innerHTML = `
    <div class="quiz-visual">
      <div class="code-window">int i = 1;\nwhile (<span class="blank">__________</span>) {\n    cout &lt;&lt; i;\n    <span class="blank">__________;</span>\n}</div>
    </div>
    <div class="final-grid">
      <div class="final-field">
        <label for="loopCondition">while 的條件是？</label>
        <select id="loopCondition">
          <option value="">請選擇</option>
          <option value="i<5">i &lt; 5</option>
          <option value="i<=5">i &lt;= 5</option>
          <option value="i=5">i = 5</option>
          <option value="i>=5">i &gt;= 5</option>
        </select>
      </div>
      <div class="final-field">
        <label for="loopUpdate">每一圈如何更新？</label>
        <select id="loopUpdate">
          <option value="">請選擇</option>
          <option value="i--">i--</option>
          <option value="i++">i++</option>
          <option value="i=1">i = 1</option>
          <option value="cout">cout &lt;&lt; i</option>
        </select>
      </div>
    </div>
    <div class="action-row">
      <button class="primary-button" id="submitFinal" type="button">破解程式</button>
    </div>
  `;

  document.querySelector("#submitFinal").addEventListener("click", checkFinal);
}

function checkFinal() {
  const condition = document.querySelector("#loopCondition").value;
  const update = document.querySelector("#loopUpdate").value;

  if (condition !== "i<=5" || update !== "i++") {
    handleWrong("要輸出到 5，條件必須包含 5；每一圈也要讓 i 增加。", `${condition || "未選"} / ${update || "未選"}`);
    return;
  }

  state.answers.push({ mission: missions[4].title, correct: true, answer: "i <= 5 / i++" });
  state.score += 20;
  setFeedback("終極題破解成功！while 會正確輸出 1 到 5 並停止。", "success");
  setTimeout(showResults, 900);
}

function handleWrong(message, answer) {
  state.lives -= 1;
  state.answers.push({
    mission: missions[state.missionIndex].title,
    correct: false,
    answer: answer || "未完成",
  });
  updateStatus();
  setFeedback(message, "error");

  if (state.lives <= 0) {
    setTimeout(() => showResults(true), 600);
  }
}

function nextMission() {
  state.missionIndex += 1;
  if (state.missionIndex >= missions.length) {
    showResults();
    return;
  }
  renderMission();
  setFeedback("下一關已開啟！", "neutral");
}

function showResults(outOfLives = false) {
  const score = state.score;
  const best = Math.max(loadBestScore(), score);
  saveBestScore(best);
  elements.bestScore.textContent = best;
  elements.finalScore.textContent = score;

  if (score >= 90) {
    elements.resultBadge.textContent = "S";
    elements.resultTitle.textContent = "程式闖關王";
    elements.resultMessage.textContent = "Scratch 與 C++ 的核心概念都接得很好！";
  } else if (score >= 60) {
    elements.resultBadge.textContent = "A";
    elements.resultTitle.textContent = "程式探險家";
    elements.resultMessage.textContent = "基礎很穩，再挑戰一次就能把細節補齊。";
  } else {
    elements.resultBadge.textContent = "B";
    elements.resultTitle.textContent = outOfLives ? "補給時間" : "勇敢挑戰者";
    elements.resultMessage.textContent = "看完答題回顧，再試一次會進步很多。";
  }

  elements.reviewList.hidden = true;
  elements.reviewButton.textContent = "查看答題回顧";
  elements.reviewList.innerHTML = missions
    .map((mission) => `<li><strong>${escapeHtml(mission.title)}：</strong>${escapeHtml(mission.review)}</li>`)
    .join("");
  elements.resultDialog.showModal();
}

function resetGame() {
  state.missionIndex = 0;
  state.score = 0;
  state.lives = 3;
  state.sequence = [];
  state.selectedAnswer = null;
  state.answers = [];
  if (elements.resultDialog.open) elements.resultDialog.close();
  renderMission();
  setFeedback("新的闖關開始了！", "neutral");
}

elements.resetButton.addEventListener("click", resetGame);
elements.playAgainButton.addEventListener("click", resetGame);
elements.reviewButton.addEventListener("click", () => {
  elements.reviewList.hidden = !elements.reviewList.hidden;
  elements.reviewButton.textContent = elements.reviewList.hidden ? "查看答題回顧" : "收起答題回顧";
});

buildTrack();
renderMission();
