// ============================================
// p5.js 可愛拼圖測驗
// 不需要額外圖片，所有圖案由程式自動生成
// ============================================

const ROWS = 3;
const COLS = 3;
const TOTAL_PIECES = 9;

let canvas;
let sourceImg;
let pieces = [];
let questions = [];

let gameState = "GRID";
// GRID：拼圖畫面
// QUIZ：答題畫面
// RESULT：答題結果
// FINISHED：完成畫面

let activeQuestionIndex = -1;
let selectedOption = -1;

let score = 0;
let wrongGrids = [];

let startTime = 0;
let endTime = 0;
let totalTime = 0;

let confetti = [];
let showImageModal = false;

let layout = {
  boardSize: 0,
  pieceSize: 0,
  boardX: 0,
  boardY: 0,
  benchX: 0,
  benchY: 0
};

// ============================================
// 初始化
// ============================================

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);

  textFont("Arial");
  textAlign(CENTER, CENTER);
  imageMode(CORNER);
  rectMode(CORNER);

  // 由程式直接生成可愛圖片
  sourceImg = createCuteSourceImage();

  initQuestions();
  initGame();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  recalculateLayout();
}

function initGame() {
  score = 0;
  wrongGrids = [];
  confetti = [];
  activeQuestionIndex = -1;
  selectedOption = -1;
  showImageModal = false;

  startTime = millis();
  endTime = 0;
  totalTime = 0;

  gameState = "GRID";

  initPieces();
  recalculateLayout();
}

// ============================================
// 自動生成可愛圖片
// ============================================

function createCuteSourceImage() {
  const g = createGraphics(600, 600);

  g.background(255, 226, 241);

  // 背景漸層
  for (let y = 0; y < 600; y++) {
    const amount = y / 600;

    const r = lerp(255, 220, amount);
    const green = lerp(230, 245, amount);
    const b = lerp(245, 255, amount);

    g.stroke(r, green, b);
    g.line(0, y, 600, y);
  }

  // 彩虹
  g.noFill();
  g.strokeWeight(24);

  g.stroke("#FFB3C6");
  g.arc(300, 410, 470, 470, PI, TWO_PI);

  g.stroke("#FFD166");
  g.arc(300, 410, 420, 420, PI, TWO_PI);

  g.stroke("#A8DADC");
  g.arc(300, 410, 370, 370, PI, TWO_PI);

  g.stroke("#A9DEF9");
  g.arc(300, 410, 320, 320, PI, TWO_PI);

  // 雲朵
  drawCuteCloud(g, 105, 120, 0.9);
  drawCuteCloud(g, 490, 130, 0.8);

  // 星星
  drawCuteStar(g, 95, 260, 25, "#FFD166");
  drawCuteStar(g, 500, 270, 30, "#FF9FCE");
  drawCuteStar(g, 300, 80, 22, "#FFF176");

  // 愛心
  drawCuteHeart(g, 165, 430, 28, "#FF82B2");
  drawCuteHeart(g, 440, 430, 25, "#FF82B2");

  // 小花
  drawCuteFlower(g, 80, 505, 1);
  drawCuteFlower(g, 520, 505, 1);

  // 小熊
  drawCuteBear(g, 300, 350, 1.2);

  // 裝飾小圓點
  g.noStroke();
  g.fill("#FFFFFF");
  g.ellipse(190, 165, 12, 12);
  g.ellipse(410, 180, 10, 10);
  g.ellipse(150, 330, 9, 9);
  g.ellipse(460, 350, 12, 12);

  return g;
}

function drawCuteCloud(g, x, y, s) {
  g.push();
  g.translate(x, y);
  g.scale(s);

  g.noStroke();
  g.fill(255, 255, 255, 235);

  g.ellipse(-35, 10, 60, 42);
  g.ellipse(0, -5, 78, 58);
  g.ellipse(38, 10, 60, 42);
  g.rect(-50, 10, 100, 30, 15);

  g.pop();
}

function drawCuteStar(g, x, y, radius, starColor) {
  g.push();
  g.translate(x, y);

  g.noStroke();
  g.fill(starColor);

  g.beginShape();

  for (let i = 0; i < 10; i++) {
    const angle = -HALF_PI + i * PI / 5;
    const r = i % 2 === 0 ? radius : radius * 0.45;

    g.vertex(
      cos(angle) * r,
      sin(angle) * r
    );
  }

  g.endShape(CLOSE);
  g.pop();
}

function drawCuteHeart(g, x, y, size, heartColor) {
  g.push();
  g.translate(x, y);

  g.noStroke();
  g.fill(heartColor);

  g.beginShape();

  g.vertex(0, size);

  g.bezierVertex(
    -size * 1.2,
    -size * 0.1,
    -size * 0.8,
    -size,
    0,
    -size * 0.35
  );

  g.bezierVertex(
    size * 0.8,
    -size,
    size * 1.2,
    -size * 0.1,
    0,
    size
  );

  g.endShape(CLOSE);
  g.pop();
}

function drawCuteBear(g, x, y, s) {
  g.push();
  g.translate(x, y);
  g.scale(s);

  // 耳朵
  g.fill("#B97855");
  g.stroke("#8D573F");
  g.strokeWeight(5);

  g.ellipse(-75, -75, 72, 72);
  g.ellipse(75, -75, 72, 72);

  // 耳朵內側
  g.noStroke();
  g.fill("#F6B6A2");

  g.ellipse(-75, -75, 38, 38);
  g.ellipse(75, -75, 38, 38);

  // 小熊臉
  g.fill("#C98763");
  g.stroke("#8D573F");
  g.strokeWeight(5);

  g.ellipse(0, 0, 190, 170);

  // 嘴巴區域
  g.noStroke();
  g.fill("#F7C7A7");
  g.ellipse(0, 35, 85, 60);

  // 眼睛
  g.fill("#4A3040");
  g.ellipse(-38, -15, 17, 24);
  g.ellipse(38, -15, 17, 24);

  // 眼睛高光
  g.fill(255);
  g.ellipse(-34, -20, 6, 8);
  g.ellipse(42, -20, 6, 8);

  // 鼻子
  g.fill("#4A3040");
  g.ellipse(0, 23, 24, 18);

  // 嘴巴
  g.noFill();
  g.stroke("#4A3040");
  g.strokeWeight(4);
  g.arc(0, 26, 42, 35, 0, PI);

  // 腮紅
  g.noStroke();
  g.fill(255, 145, 165, 150);

  g.ellipse(-72, 28, 32, 18);
  g.ellipse(72, 28, 32, 18);

  // 蝴蝶結
  g.fill("#FF82B2");
  g.ellipse(-24, 112, 58, 38);
  g.ellipse(24, 112, 58, 38);

  g.fill("#FF5D99");
  g.ellipse(0, 112, 28, 28);

  g.pop();
}

function drawCuteFlower(g, x, y, s) {
  g.push();
  g.translate(x, y);
  g.scale(s);

  // 花莖
  g.stroke("#69B578");
  g.strokeWeight(8);
  g.line(0, 20, 0, 85);

  // 花瓣
  g.noStroke();
  g.fill("#FF9FCE");

  g.ellipse(-22, 0, 35, 45);
  g.ellipse(22, 0, 35, 45);
  g.ellipse(0, -22, 45, 35);
  g.ellipse(0, 22, 45, 35);

  // 花心
  g.fill("#FFD166");
  g.ellipse(0, 0, 30, 30);

  g.pop();
}

// ============================================
// 題目
// ============================================

function initQuestions() {
  questions = [
    {
      question: "p5.js 中用來設定畫布大小的函式是什麼？",
      options: [
        "A. createCanvas()",
        "B. setWindow()",
        "C. makeCanvas()"
      ],
      answer: 0
    },
    {
      question: "哪一個函式只會在程式開始時執行一次？",
      options: [
        "A. draw()",
        "B. setup()",
        "C. start()"
      ],
      answer: 1
    },
    {
      question: "哪一個函式會不斷重複執行以進行繪圖？",
      options: [
        "A. loop()",
        "B. setup()",
        "C. draw()"
      ],
      answer: 2
    },
    {
      question: "如何設定圖形的填滿顏色？",
      options: [
        "A. fill()",
        "B. color()",
        "C. background()"
      ],
      answer: 0
    },
    {
      question: "哪一個函式可以畫出一個圓形？",
      options: [
        "A. rect()",
        "B. circle()",
        "C. line()"
      ],
      answer: 1
    },
    {
      question: "設定線條或邊框顏色時，應使用哪個函式？",
      options: [
        "A. stroke()",
        "B. lineStyle()",
        "C. border()"
      ],
      answer: 0
    },
    {
      question: "設定背景顏色的函式是什麼？",
      options: [
        "A. fill()",
        "B. background()",
        "C. clear()"
      ],
      answer: 1
    },
    {
      question: "繪製矩形的 p5.js 語法是哪一個？",
      options: [
        "A. square()",
        "B. box()",
        "C. rect()"
      ],
      answer: 2
    },
    {
      question: "滑鼠目前的 X 軸座標變數名稱是什麼？",
      options: [
        "A. mouseX",
        "B. xMouse",
        "C. cursorX"
      ],
      answer: 0
    }
  ];
}

// ============================================
// 拼圖初始化
// ============================================

function initPieces() {
  pieces = [];

  for (let i = 0; i < TOTAL_PIECES; i++) {
    const row = floor(i / COLS);
    const col = i % COLS;

    pieces.push({
      id: i,
      row: row,
      col: col,

      unlocked: false,
      isCorrect: false,
      placed: false,

      currentX: 0,
      currentY: 0,

      targetX: 0,
      targetY: 0,

      homeX: 0,
      homeY: 0,

      isDragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0
    });
  }
}

// ============================================
// 響應式配置
// ============================================

function recalculateLayout() {
  const isMobile = width < 700;

  if (isMobile) {
    layout.boardSize = min(width * 0.86, height * 0.42);

    layout.boardX = width / 2 - layout.boardSize / 2;
    layout.boardY = height * 0.58 - layout.boardSize / 2;

    layout.pieceSize = layout.boardSize / 3;

    layout.benchX = width * 0.06;
    layout.benchY = height * 0.15;
  } else {
    layout.boardSize = min(width * 0.42, height * 0.58);

    layout.boardX = width * 0.58 - layout.boardSize / 2;
    layout.boardY = height * 0.52 - layout.boardSize / 2;

    layout.pieceSize = layout.boardSize / 3;

    layout.benchX = width * 0.05;
    layout.benchY = height * 0.28;
  }

  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];

    piece.targetX =
      layout.boardX + piece.col * layout.pieceSize;

    piece.targetY =
      layout.boardY + piece.row * layout.pieceSize;

    piece.homeX =
      layout.benchX +
      (i % 3) * layout.pieceSize * 1.05;

    piece.homeY =
      layout.benchY +
      floor(i / 3) * layout.pieceSize * 1.05;

    if (piece.placed) {
      piece.currentX = piece.targetX;
      piece.currentY = piece.targetY;
    } else if (!piece.isDragging) {
      piece.currentX = piece.homeX;
      piece.currentY = piece.homeY;
    }
  }
}

// ============================================
// 主畫面
// ============================================

function draw() {
  drawCuteBackground();

  if (gameState === "FINISHED") {
    drawFinishedScreen();
  } else {
    drawGameScreen();
  }

  if (confetti.length > 0) {
    updateAndDrawConfetti();
  }

  if (showImageModal) {
    drawImageModal();
  }
}

function drawCuteBackground() {
  for (let y = 0; y < height; y += 4) {
    const amount = y / height;

    const r = lerp(255, 220, amount);
    const g = lerp(238, 248, amount);
    const b = lerp(250, 255, amount);

    stroke(r, g, b);
    line(0, y, width, y);
  }

  noStroke();

  drawCloud(width * 0.08, height * 0.13, 0.9);
  drawCloud(width * 0.87, height * 0.16, 0.75);

  drawHeart(
    width * 0.93,
    height * 0.82,
    25,
    color(255, 160, 190)
  );

  drawHeart(
    width * 0.06,
    height * 0.78,
    18,
    color(255, 190, 120)
  );

  drawStar(
    width * 0.3,
    height * 0.12,
    14,
    color(255, 207, 92)
  );

  drawStar(
    width * 0.72,
    height * 0.08,
    18,
    color(255, 195, 215)
  );
}

function drawCloud(x, y, s) {
  push();
  translate(x, y);
  scale(s);

  noStroke();
  fill(255, 255, 255, 210);

  ellipse(-38, 8, 55, 38);
  ellipse(0, -6, 70, 55);
  ellipse(40, 10, 58, 40);
  rect(-45, 8, 90, 28, 15);

  pop();
}

function drawHeart(x, y, size, heartColor) {
  push();
  translate(x, y);

  noStroke();
  fill(heartColor);

  beginShape();

  vertex(0, size * 0.8);

  bezierVertex(
    -size * 1.2,
    size * 0.05,
    -size * 0.65,
    -size * 0.75,
    0,
    -size * 0.15
  );

  bezierVertex(
    size * 0.65,
    -size * 0.75,
    size * 1.2,
    size * 0.05,
    0,
    size * 0.8
  );

  endShape(CLOSE);
  pop();
}

function drawStar(x, y, radius, starColor) {
  push();
  translate(x, y);

  noStroke();
  fill(starColor);

  beginShape();

  for (let i = 0; i < 10; i++) {
    const angle = -HALF_PI + i * PI / 5;
    const r = i % 2 === 0 ? radius : radius * 0.45;

    vertex(
      cos(angle) * r,
      sin(angle) * r
    );
  }

  endShape(CLOSE);
  pop();
}

function drawGameScreen() {
  drawHeader();
  drawBench();
  drawPuzzleBoard();
  drawPieces();

  if (gameState === "QUIZ" || gameState === "RESULT") {
    drawQuizModal();
  }
}

function drawHeader() {
  textAlign(CENTER, CENTER);

  fill(104, 72, 121);
  textSize(min(30, width * 0.055));
  text("🌈 p5.js 可愛拼圖學習屋 🌈", width / 2, 38);

  fill(145, 105, 151);
  textSize(15);
  text(
    "答對小問題，解鎖可愛拼圖，完成你的夢幻作品！",
    width / 2,
    72
  );
}

function drawBench() {
  const isMobile = width < 700;

  const boxX = isMobile ? width * 0.04 : width * 0.025;
  const boxY = isMobile ? height * 0.095 : height * 0.16;
  const boxW = isMobile ? width * 0.92 : width * 0.39;
  const boxH = isMobile ? height * 0.27 : height * 0.62;

  drawCutePanel(
    boxX,
    boxY,
    boxW,
    boxH,
    color(255, 255, 255, 150)
  );

  textAlign(CENTER, CENTER);

  fill(112, 77, 130);
  textSize(17);
  text("🧸 拼圖小房間", boxX + boxW / 2, boxY + 25);

  fill(164, 122, 165);
  textSize(12);
  text(
    "點擊問號開始答題",
    boxX + boxW / 2,
    boxY + 50
  );
}

function drawCutePanel(x, y, w, h, panelColor) {
  push();

  noStroke();
  fill(255, 255, 255, 90);
  rect(x + 6, y + 8, w, h, 22);

  fill(panelColor);
  rect(x, y, w, h, 22);

  stroke(255, 255, 255, 220);
  strokeWeight(2);
  noFill();
  rect(x, y, w, h, 22);

  pop();
}

function drawPuzzleBoard() {
  const boardX = layout.boardX;
  const boardY = layout.boardY;
  const boardSize = layout.boardSize;
  const pieceSize = layout.pieceSize;

  drawCutePanel(
    boardX - 12,
    boardY - 12,
    boardSize + 24,
    boardSize + 24,
    color(255, 255, 255, 180)
  );

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = boardX + c * pieceSize;
      const y = boardY + r * pieceSize;
      const index = r * COLS + c;
      const piece = pieces[index];

      if (piece.placed) {
        fill(255, 255, 255, 35);
      } else {
        fill(248, 215, 239, 150);
      }

      stroke(255, 255, 255, 230);
      strokeWeight(2);
      rect(x, y, pieceSize, pieceSize, 10);

      if (!piece.placed) {
        fill(185, 136, 182);
        textSize(13);
        text(
          `第 ${index + 1} 格`,
          x + pieceSize / 2,
          y + pieceSize / 2
        );
      }
    }
  }
}

function drawPieces() {
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];

    if (!piece.unlocked) {
      drawLockedPiece(piece);
    } else if (!piece.isDragging) {
      drawPuzzlePiece(piece);
    }
  }

  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];

    if (piece.unlocked && piece.isDragging) {
      drawPuzzlePiece(piece);
    }
  }
}

function drawLockedPiece(piece) {
  const x = piece.homeX;
  const y = piece.homeY;
  const size = layout.pieceSize;

  push();

  noStroke();
  fill(255, 255, 255, 180);
  rect(x + 4, y + 5, size, size, 14);

  fill(250, 189, 215);
  stroke(255, 255, 255, 230);
  strokeWeight(3);
  rect(x, y, size, size, 14);

  fill(255);
  noStroke();
  textSize(size * 0.35);
  text("?", x + size / 2, y + size * 0.42);

  fill(166, 100, 142);
  textSize(max(10, size * 0.11));
  text(
    `題目 ${piece.id + 1}`,
    x + size / 2,
    y + size * 0.82
  );

  pop();
}

function drawPuzzlePiece(piece) {
  const x = piece.currentX;
  const y = piece.currentY;
  const size = layout.pieceSize;

  const sourceW = sourceImg.width / COLS;
  const sourceH = sourceImg.height / ROWS;

  const sourceX = piece.col * sourceW;
  const sourceY = piece.row * sourceH;

  push();

  noStroke();
  fill(255, 255, 255, 120);
  rect(x + 5, y + 6, size, size, 10);

  image(
    sourceImg,
    x,
    y,
    size,
    size,
    sourceX,
    sourceY,
    sourceW,
    sourceH
  );

  stroke(255, 255, 255, 240);
  strokeWeight(3);
  noFill();
  rect(x, y, size, size, 8);

  pop();
}

// ============================================
// 答題視窗
// ============================================

function drawQuizModal() {
  push();

  fill(75, 45, 85, 160);
  noStroke();
  rect(0, 0, width, height);

  const modalW = min(580, width * 0.9);
  const modalH = min(500, height * 0.82);
  const modalX = width / 2 - modalW / 2;
  const modalY = height / 2 - modalH / 2;

  drawCutePanel(
    modalX,
    modalY,
    modalW,
    modalH,
    color(255, 250, 255, 245)
  );

  const question = questions[activeQuestionIndex];

  textAlign(CENTER, CENTER);

  fill(121, 77, 126);
  textSize(20);
  text(
    gameState === "RESULT"
      ? "🌟 答題結果 🌟"
      : "💡 小小挑戰題",
    width / 2,
    modalY + 35
  );

  fill(91, 65, 105);
  textSize(17);
  text(
    question.question,
    modalX + 30,
    modalY + 85,
    modalW - 60,
    60
  );

  for (let i = 0; i < question.options.length; i++) {
    const btnX = modalX + 30;
    const btnY = modalY + 165 + i * 68;
    const btnW = modalW - 60;
    const btnH = 50;

    let buttonColor = color(238, 218, 248);

    if (gameState === "QUIZ") {
      if (isMouseInside(btnX, btnY, btnW, btnH)) {
        buttonColor = color(211, 176, 237);
      }
    } else {
      if (i === question.answer) {
        buttonColor = color(169, 231, 186);
      } else if (i === selectedOption) {
        buttonColor = color(255, 178, 190);
      } else {
        buttonColor = color(238, 228, 240);
      }
    }

    drawCuteButton(
      btnX,
      btnY,
      btnW,
      btnH,
      buttonColor,
      question.options[i]
    );
  }

  if (gameState === "RESULT") {
    const piece = pieces[activeQuestionIndex];

    if (piece.isCorrect) {
      fill(66, 158, 94);
      textSize(16);
      text(
        "答對了！拼圖已解鎖，可以拖曳到右側拼圖板。",
        width / 2,
        modalY + modalH - 83
      );

      drawCuteButton(
        width / 2 - 90,
        modalY + modalH - 58,
        180,
        38,
        color(143, 205, 238),
        "開始拼圖"
      );
    } else {
      fill(214, 89, 115);
      textSize(15);
      text(
        `再想一下！正確答案是：${question.options[question.answer]}`,
        width / 2,
        modalY + modalH - 92
      );

      drawCuteButton(
        width / 2 - 90,
        modalY + modalH - 58,
        180,
        38,
        color(255, 190, 130),
        "再試一次"
      );
    }
  }

  pop();
}

function drawCuteButton(x, y, w, h, buttonColor, label) {
  push();

  noStroke();
  fill(130, 93, 145, 45);
  rect(x + 3, y + 5, w, h, 20);

  fill(buttonColor);
  stroke(255, 255, 255, 230);
  strokeWeight(2);
  rect(x, y, w, h, 20);

  fill(92, 63, 105);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(15);
  text(label, x + w / 2, y + h / 2);

  pop();
}

// ============================================
// 滑鼠互動
// ============================================

function mousePressed() {
  if (showImageModal) {
    showImageModal = false;
    return;
  }

  if (gameState === "FINISHED") {
    handleFinishedClick();
    return;
  }

  if (gameState === "QUIZ") {
    handleQuizClick();
    return;
  }

  if (gameState === "RESULT") {
    handleResultClick();
    return;
  }

  if (gameState === "GRID") {
    handleGridClick();
  }
}

function handleGridClick() {
  const size = layout.pieceSize;

  // 點擊尚未解鎖的題目
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];

    if (
      !piece.unlocked &&
      isInside(
        mouseX,
        mouseY,
        piece.homeX,
        piece.homeY,
        size,
        size
      )
    ) {
      activeQuestionIndex = i;
      selectedOption = -1;
      gameState = "QUIZ";
      return;
    }
  }

  // 拖曳已解鎖拼圖
  for (let i = pieces.length - 1; i >= 0; i--) {
    const piece = pieces[i];

    if (
      piece.unlocked &&
      !piece.placed &&
      isInside(
        mouseX,
        mouseY,
        piece.currentX,
        piece.currentY,
        size,
        size
      )
    ) {
      piece.isDragging = true;
      piece.dragOffsetX = mouseX - piece.currentX;
      piece.dragOffsetY = mouseY - piece.currentY;
      return;
    }
  }
}

function handleQuizClick() {
  const modal = getQuizModalBounds();
  const question = questions[activeQuestionIndex];

  for (let i = 0; i < question.options.length; i++) {
    const btnX = modal.x + 30;
    const btnY = modal.y + 165 + i * 68;
    const btnW = modal.w - 60;
    const btnH = 50;

    if (
      isInside(
        mouseX,
        mouseY,
        btnX,
        btnY,
        btnW,
        btnH
      )
    ) {
      selectedOption = i;

      const piece = pieces[activeQuestionIndex];

      if (i === question.answer) {
        piece.isCorrect = true;
        piece.unlocked = true;
        score += 100 / TOTAL_PIECES;
      } else {
        piece.isCorrect = false;

        if (!wrongGrids.includes(activeQuestionIndex + 1)) {
          wrongGrids.push(activeQuestionIndex + 1);
        }
      }

      gameState = "RESULT";
      return;
    }
  }
}

function handleResultClick() {
  const modal = getQuizModalBounds();

  const btnX = width / 2 - 90;
  const btnY = modal.y + modal.h - 58;
  const btnW = 180;
  const btnH = 38;

  if (
    isInside(
      mouseX,
      mouseY,
      btnX,
      btnY,
      btnW,
      btnH
    )
  ) {
    const piece = pieces[activeQuestionIndex];

    if (piece.isCorrect) {
      gameState = "GRID";
      activeQuestionIndex = -1;
      selectedOption = -1;
    } else {
      gameState = "QUIZ";
      selectedOption = -1;
    }
  }
}

function handleFinishedClick() {
  const btnW = 170;
  const btnH = 46;
  const btnY = height * 0.86;

  const restartX = width / 2 - btnW - 12;
  const imageX = width / 2 + 12;

  if (
    isInside(
      mouseX,
      mouseY,
      restartX,
      btnY,
      btnW,
      btnH
    )
  ) {
    initGame();
    return;
  }

  if (
    isInside(
      mouseX,
      mouseY,
      imageX,
      btnY,
      btnW,
      btnH
    )
  ) {
    showImageModal = true;
  }
}

function mouseDragged() {
  if (gameState !== "GRID") return;

  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];

    if (piece.isDragging) {
      piece.currentX = mouseX - piece.dragOffsetX;
      piece.currentY = mouseY - piece.dragOffsetY;
    }
  }
}

function mouseReleased() {
  if (gameState !== "GRID") return;

  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];

    if (piece.isDragging) {
      piece.isDragging = false;

      const distance = dist(
        piece.currentX,
        piece.currentY,
        piece.targetX,
        piece.targetY
      );

      if (distance < layout.pieceSize * 0.32) {
        piece.currentX = piece.targetX;
        piece.currentY = piece.targetY;
        piece.placed = true;
      }
    }
  }

  checkFinished();
}

// ============================================
// 完成畫面
// ============================================

function checkFinished() {
  const allPlaced = pieces.every((piece) => piece.placed);

  if (allPlaced) {
    gameState = "FINISHED";

    endTime = millis();
    totalTime = round((endTime - startTime) / 1000);
    score = round(score);

    if (score >= 60) {
      createConfetti();
    }
  }
}

function drawFinishedScreen() {
  textAlign(CENTER, CENTER);

  fill(112, 76, 131);
  textSize(min(32, width * 0.06));
  text("🎉 恭喜完成可愛拼圖！ 🎉", width / 2, height * 0.1);

  const isMobile = width < 700;

  const imageSize = isMobile
    ? min(width * 0.64, height * 0.32)
    : min(width * 0.36, height * 0.5);

  const imageX = isMobile
    ? width / 2 - imageSize / 2
    : width * 0.08;

  const imageY = isMobile
    ? height * 0.16
    : height * 0.25;

  drawCutePanel(
    imageX - 10,
    imageY - 10,
    imageSize + 20,
    imageSize + 20,
    color(255, 255, 255, 190)
  );

  image(sourceImg, imageX, imageY, imageSize, imageSize);

  const panelX = isMobile ? width * 0.08 : width * 0.55;
  const panelY = isMobile ? height * 0.53 : height * 0.24;
  const panelW = isMobile ? width * 0.84 : width * 0.38;
  const panelH = isMobile ? height * 0.27 : height * 0.5;

  drawCutePanel(
    panelX,
    panelY,
    panelW,
    panelH,
    color(255, 250, 255, 220)
  );

  textAlign(LEFT, TOP);

  fill(121, 77, 126);
  textSize(20);
  text("📊 學習成果", panelX + 25, panelY + 22);

  fill(91, 65, 105);
  textSize(16);
  text(`🌟 得分：${score} 分`, panelX + 25, panelY + 70);
  text(`⏱ 花費時間：${totalTime} 秒`, panelX + 25, panelY + 105);

  const wrongText =
    wrongGrids.length === 0
      ? "全部答對！"
      : wrongGrids.join("、") + " 題";

  fill(
    wrongGrids.length === 0
      ? color(62, 164, 97)
      : color(214, 89, 115)
  );

  text(`📝 曾答錯：${wrongText}`, panelX + 25, panelY + 140);

  fill(121, 77, 126);
  textSize(15);
  text("九宮格答題紀錄：", panelX + 25, panelY + 185);

  drawMiniResultGrid(panelX + 25, panelY + 215);

  textAlign(CENTER, CENTER);

  const btnW = 170;
  const btnH = 46;
  const btnY = height * 0.86;

  drawCuteButton(
    width / 2 - btnW - 12,
    btnY,
    btnW,
    btnH,
    color(206, 178, 242),
    "🔄 再玩一次"
  );

  drawCuteButton(
    width / 2 + 12,
    btnY,
    btnW,
    btnH,
    color(166, 224, 195),
    "🔍 查看完整圖"
  );
}

function drawMiniResultGrid(x, y) {
  const size = 30;
  const gap = 7;

  for (let i = 0; i < TOTAL_PIECES; i++) {
    const row = floor(i / 3);
    const col = i % 3;

    const gx = x + col * (size + gap);
    const gy = y + row * (size + gap);

    fill(
      pieces[i].isCorrect
        ? color(146, 220, 167)
        : color(255, 180, 194)
    );

    stroke(255);
    strokeWeight(1);
    rect(gx, gy, size, size, 8);

    fill(95, 65, 105);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(12);
    text(
      i + 1,
      gx + size / 2,
      gy + size / 2
    );
  }
}

// ============================================
// 完整圖片視窗
// ============================================

function drawImageModal() {
  fill(75, 45, 85, 190);
  noStroke();
  rect(0, 0, width, height);

  const imgSize = min(width * 0.78, height * 0.7);
  const imgX = width / 2 - imgSize / 2;
  const imgY = height / 2 - imgSize / 2;

  drawCutePanel(
    imgX - 10,
    imgY - 10,
    imgSize + 20,
    imgSize + 20,
    color(255, 250, 255, 245)
  );

  image(sourceImg, imgX, imgY, imgSize, imgSize);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(
    "點擊任意位置關閉圖片",
    width / 2,
    imgY + imgSize + 35
  );
}

// ============================================
// 彩帶
// ============================================

function createConfetti() {
  confetti = [];

  for (let i = 0; i < 130; i++) {
    confetti.push({
      x: random(width),
      y: random(-height, 0),
      size: random(6, 13),
      color: color(
        random(180, 255),
        random(150, 240),
        random(180, 255)
      ),
      speedX: random(-1.5, 1.5),
      speedY: random(2, 5),
      angle: random(TWO_PI),
      rotationSpeed: random(-0.08, 0.08)
    });
  }
}

function updateAndDrawConfetti() {
  for (let i = 0; i < confetti.length; i++) {
    const item = confetti[i];

    push();

    translate(item.x, item.y);
    rotate(item.angle);

    noStroke();
    fill(item.color);

    rectMode(CENTER);
    rect(0, 0, item.size, item.size * 1.6, 3);

    pop();

    item.x += item.speedX;
    item.y += item.speedY;
    item.angle += item.rotationSpeed;

    if (item.y > height + 20) {
      item.y = -20;
      item.x = random(width);
    }
  }

  rectMode(CORNER);
}

// ============================================
// 工具函式
// ============================================

function getQuizModalBounds() {
  const modalW = min(580, width * 0.9);
  const modalH = min(500, height * 0.82);
  const modalX = width / 2 - modalW / 2;
  const modalY = height / 2 - modalH / 2;

  return {
    x: modalX,
    y: modalY,
    w: modalW,
    h: modalH
  };
}

function isInside(px, py, x, y, w, h) {
  return (
    px >= x &&
    px <= x + w &&
    py >= y &&
    py <= y + h
  );
}

function isMouseInside(x, y, w, h) {
  return isInside(mouseX, mouseY, x, y, w, h);
}