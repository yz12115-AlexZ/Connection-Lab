let yaoLines = [];
let currentCoins = [];
let result = null;

let isTossing = false;
let tossStartTime = 0;
let tossDuration = 1200;
let animatedCoins = ["?", "?", "?"];

let coinFrontImg;
let coinBackImg;

let button = {
  x: 450,
  y: 585,
  w: 240,
  h: 52
};

const trigramMap = {
  "111": { name: "乾", symbol: "☰", nature: "天" },
  "000": { name: "坤", symbol: "☷", nature: "地" },
  "100": { name: "震", symbol: "☳", nature: "雷" },
  "001": { name: "艮", symbol: "☶", nature: "山" },
  "010": { name: "坎", symbol: "☵", nature: "水" },
  "101": { name: "离", symbol: "☲", nature: "火" },
  "110": { name: "兑", symbol: "☱", nature: "泽" },
  "011": { name: "巽", symbol: "☴", nature: "风" }
};

const hexagrams = {
  "乾-乾": { num: 1, name: "乾为天" },
  "坤-坤": { num: 2, name: "坤为地" },
  "坎-震": { num: 3, name: "水雷屯" },
  "艮-坎": { num: 4, name: "山水蒙" },
  "坎-乾": { num: 5, name: "水天需" },
  "乾-坎": { num: 6, name: "天水讼" },
  "坤-坎": { num: 7, name: "地水师" },
  "坎-坤": { num: 8, name: "水地比" },
  "巽-乾": { num: 9, name: "风天小畜" },
  "乾-兑": { num: 10, name: "天泽履" },
  "坤-乾": { num: 11, name: "地天泰" },
  "乾-坤": { num: 12, name: "天地否" },
  "乾-离": { num: 13, name: "天火同人" },
  "离-乾": { num: 14, name: "火天大有" },
  "坤-艮": { num: 15, name: "地山谦" },
  "震-坤": { num: 16, name: "雷地豫" },
  "兑-震": { num: 17, name: "泽雷随" },
  "艮-巽": { num: 18, name: "山风蛊" },
  "坤-兑": { num: 19, name: "地泽临" },
  "巽-坤": { num: 20, name: "风地观" },
  "离-震": { num: 21, name: "火雷噬嗑" },
  "艮-离": { num: 22, name: "山火贲" },
  "艮-坤": { num: 23, name: "山地剥" },
  "坤-震": { num: 24, name: "地雷复" },
  "乾-震": { num: 25, name: "天雷无妄" },
  "艮-乾": { num: 26, name: "山天大畜" },
  "艮-震": { num: 27, name: "山雷颐" },
  "兑-巽": { num: 28, name: "泽风大过" },
  "坎-坎": { num: 29, name: "坎为水" },
  "离-离": { num: 30, name: "离为火" },
  "兑-艮": { num: 31, name: "泽山咸" },
  "震-巽": { num: 32, name: "雷风恒" },
  "乾-艮": { num: 33, name: "天山遁" },
  "震-乾": { num: 34, name: "雷天大壮" },
  "离-坤": { num: 35, name: "火地晋" },
  "坤-离": { num: 36, name: "地火明夷" },
  "巽-离": { num: 37, name: "风火家人" },
  "离-兑": { num: 38, name: "火泽睽" },
  "坎-艮": { num: 39, name: "水山蹇" },
  "震-坎": { num: 40, name: "雷水解" },
  "艮-兑": { num: 41, name: "山泽损" },
  "巽-震": { num: 42, name: "风雷益" },
  "兑-乾": { num: 43, name: "泽天夬" },
  "乾-巽": { num: 44, name: "天风姤" },
  "兑-坤": { num: 45, name: "泽地萃" },
  "坤-巽": { num: 46, name: "地风升" },
  "兑-坎": { num: 47, name: "泽水困" },
  "坎-巽": { num: 48, name: "水风井" },
  "兑-离": { num: 49, name: "泽火革" },
  "离-巽": { num: 50, name: "火风鼎" },
  "震-震": { num: 51, name: "震为雷" },
  "艮-艮": { num: 52, name: "艮为山" },
  "巽-艮": { num: 53, name: "风山渐" },
  "震-兑": { num: 54, name: "雷泽归妹" },
  "震-离": { num: 55, name: "雷火丰" },
  "离-艮": { num: 56, name: "火山旅" },
  "巽-巽": { num: 57, name: "巽为风" },
  "兑-兑": { num: 58, name: "兑为泽" },
  "巽-坎": { num: 59, name: "风水涣" },
  "坎-兑": { num: 60, name: "水泽节" },
  "巽-兑": { num: 61, name: "风泽中孚" },
  "震-艮": { num: 62, name: "雷山小过" },
  "坎-离": { num: 63, name: "水火既济" },
  "离-坎": { num: 64, name: "火水未济" }
};

function preload() {
  coinFrontImg = loadImage("coin_front.png");
  coinBackImg = loadImage("coin_back.png");
}
function setup() {
  let canvas = createCanvas(900, 650);
  canvas.parent(document.querySelector(".canvas-wrap"));
  textFont("serif");
  textAlign(CENTER, CENTER);
  imageMode(CENTER);
}

function draw() {
  background(245, 236, 216);

  updateTossAnimation();

  drawTitle();
  drawCoins();
  drawHistory();
  drawHexagram();
  drawResult();
  drawButton();
}

function drawTitle() {
  fill(35, 25, 15);
  noStroke();
  textSize(34);
  text("Six-Line Coin Divination", width / 2, 45);

  textSize(15);
  fill(90, 70, 50);
  text(
    "Click the button to toss three coins. Each toss creates one line. Six lines form a hexagram.",
    width / 2,
    82
  );
}

function drawCoins() {
  textSize(18);
  fill(45, 30, 15);
  noStroke();
  text("Current Coins", 170, 130);

  for (let i = 0; i < 3; i++) {
    let x = 90 + i * 80;
    let y = 190;
    let coinSize = 62;

    if (isTossing) {
      y += sin(frameCount * 0.35 + i) * 10;
      coinSize += sin(frameCount * 0.4 + i) * 4;
    }

    let side = isTossing ? animatedCoins[i] : currentCoins[i] || "?";
    drawCoinWithImage(x, y, coinSize, side, i, isTossing);
  }
}

function drawCoinWithImage(x, y, size, side, index, animating = false) {
  push();
  translate(x, y);

  let angle = map(stableNoise(index + 10), 0, 1, -0.18, 0.18);
  if (animating) {
    angle += frameCount * 0.28 * (index + 1);
  }
  rotate(angle);

  noStroke();
  fill(0, 45);
  ellipse(5, 7, size * 0.92, size * 0.82);

  let imgToDraw = null;
  if (side === "字") {
    imgToDraw = coinFrontImg;
  } else if (side === "背") {
    imgToDraw = coinBackImg;
  }

  if (imgToDraw) {
    let ctx = drawingContext;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    image(imgToDraw, 0, 0, size, size);

    ctx.restore();

    noFill();
    stroke(90, 60, 25, 120);
    strokeWeight(1.5);
    circle(0, 0, size);
  } else {
    drawUnknownCoin(size);
  }

  pop();
}

function drawUnknownCoin(size) {
  let ctx = drawingContext;
  let gradient = ctx.createRadialGradient(
    -size * 0.25,
    -size * 0.25,
    size * 0.05,
    0,
    0,
    size * 0.55
  );
  gradient.addColorStop(0, "#f3cd72");
  gradient.addColorStop(0.3, "#c58a35");
  gradient.addColorStop(0.65, "#87531f");
  gradient.addColorStop(1, "#4f2d12");

  ctx.fillStyle = gradient;
  noStroke();
  circle(0, 0, size);

  noFill();
  stroke("#3b210c");
  strokeWeight(3);
  circle(0, 0, size * 0.95);

  fill("#2d1908");
  noStroke();
  textSize(size * 0.3);
  text("?", 0, 0);
}

function drawHistory() {
  const names = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];

  fill(45, 30, 15);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(18);
  text("Record", 45, 270);

  textSize(14);

  for (let i = 0; i < 6; i++) {
    let y = 310 + i * 35;
    let yao = yaoLines[i];

    if (yao) {
      let textLine = `${names[i]}: ${yao.coins.join(" ")} → ${yao.label}`;
      if (yao.changing) {
        textLine += ` ${yao.mark}`;
      }

      fill(50, 35, 20);
      text(textLine, 45, y);
    } else {
      fill(150, 130, 100);
      text(`${names[i]}: Waiting for toss`, 45, y);
    }
  }

  textAlign(CENTER, CENTER);
}

function drawHexagram() {
  fill(45, 30, 15);
  noStroke();
  textSize(18);
  text("Hexagram", 460, 130);

  const x = 460;
  const topY = 170;
  const gapY = 45;
  const len = 90;
  const breakGap = 26;

  for (let i = 0; i < 6; i++) {
    let y = topY + (5 - i) * gapY;
    let yao = yaoLines[i];

    strokeWeight(12);
    strokeCap(ROUND);

    if (!yao) {
      stroke(210, 195, 170);
      drawYinLine(x, y, len, breakGap);
      continue;
    }

    stroke(35, 25, 15);

    if (yao.isYang) {
      drawYangLine(x, y, len);
    } else {
      drawYinLine(x, y, len, breakGap);
    }

    if (yao.changing) {
      noStroke();
      fill(160, 55, 40);
      textSize(22);
      text(yao.mark, x + 130, y);
    }
  }

  noStroke();
  fill(100, 80, 60);
  textSize(13);
  text("The six lines are generated from bottom to top.", 460, 465);
}

function drawYangLine(x, y, len) {
  line(x - len, y, x + len, y);
}

function drawYinLine(x, y, len, breakGap) {
  line(x - len, y, x - breakGap, y);
  line(x + breakGap, y, x + len, y);
}

function drawResult() {
  fill(45, 30, 15);
  noStroke();
  textSize(18);
  text("Result", 710, 130);

  if (!result) {
    fill(130, 110, 85);
    textSize(15);
    text("Complete six tosses to reveal the hexagram.", 710, 210);
    return;
  }

  fill(35, 25, 15);
  textSize(24);
  text(`第 ${result.hex.num} 卦`, 710, 180);

  textSize(28);
  text(result.hex.name, 710, 225);

  textSize(17);
  fill(70, 50, 35);
  text(`上卦: ${result.upper.name} ${result.upper.symbol} ${result.upper.nature}`, 710, 285);
  text(`下卦: ${result.lower.name} ${result.lower.symbol} ${result.lower.nature}`, 710, 320);
}

function drawButton() {
  let disabled = yaoLines.length >= 6;
  let hover = insideButton();

  noStroke();

  if (isTossing || disabled) {
    fill(145, 130, 105);
  } else if (hover) {
    fill(70, 50, 30);
  } else {
    fill(35, 25, 15);
  }

  rectMode(CENTER);
  rect(button.x, button.y, button.w, button.h, 16);

  fill(255);
  textSize(18);

  if (isTossing) {
    text("Tossing...", button.x, button.y);
  } else if (disabled) {
    text("Completed. Press R to Reset", button.x, button.y);
  } else {
    text(`Toss Coins ${yaoLines.length}/6`, button.x, button.y);
  }
}

function mousePressed() {
  if (insideButton()) {
    if (yaoLines.length < 6 && !isTossing) {
      startTossAnimation();
    }
  }
}

function keyPressed() {
  if (key === "r" || key === "R") {
    resetGame();
  }
}

function insideButton() {
  return (
    mouseX > button.x - button.w / 2 &&
    mouseX < button.x + button.w / 2 &&
    mouseY > button.y - button.h / 2 &&
    mouseY < button.y + button.h / 2
  );
}

function startTossAnimation() {
  isTossing = true;
  tossStartTime = millis();
  animatedCoins = ["?", "?", "?"];
}

function updateTossAnimation() {
  if (!isTossing) return;

  if (frameCount % 5 === 0) {
    for (let i = 0; i < 3; i++) {
      animatedCoins[i] = Math.random() < 0.5 ? "背" : "字";
    }
  }

  if (millis() - tossStartTime >= tossDuration) {
    finishToss();
  }
}

function finishToss() {
  isTossing = false;
  currentCoins = [];

  let sum = 0;

  for (let i = 0; i < 3; i++) {
    let isBackSide = Math.random() < 0.5;

    if (isBackSide) {
      currentCoins.push("背");
      sum += 3; // 阳
    } else {
      currentCoins.push("字");
      sum += 2; // 阴
    }
  }

  let lineInfo = getLineInfo(sum);

  yaoLines.push({
    coins: [...currentCoins],
    sum: sum,
    ...lineInfo
  });

  if (yaoLines.length === 6) {
    result = calculateHexagram();
    window._hexagramData = { lines: [...yaoLines], ...result };
    if (typeof onHexagramComplete === "function") onHexagramComplete();
  }
}

function getLineInfo(sum) {
  if (sum === 6) {
    return {
      label: "老阴",
      isYang: false,
      changing: true,
      mark: "×"
    };
  }

  if (sum === 7) {
    return {
      label: "少阳",
      isYang: true,
      changing: false,
      mark: ""
    };
  }

  if (sum === 8) {
    return {
      label: "少阴",
      isYang: false,
      changing: false,
      mark: ""
    };
  }

  if (sum === 9) {
    return {
      label: "老阳",
      isYang: true,
      changing: true,
      mark: "○"
    };
  }
}

function calculateHexagram() {
  let lowerKey = yaoLines
    .slice(0, 3)
    .map(yao => (yao.isYang ? "1" : "0"))
    .join("");

  let upperKey = yaoLines
    .slice(3, 6)
    .map(yao => (yao.isYang ? "1" : "0"))
    .join("");

  let lower = trigramMap[lowerKey];
  let upper = trigramMap[upperKey];
  let hex = hexagrams[`${upper.name}-${lower.name}`];

  return {
    lower,
    upper,
    hex
  };
}

function resetGame() {
  yaoLines = [];
  currentCoins = [];
  result = null;
  isTossing = false;
  animatedCoins = ["?", "?", "?"];
  if (typeof onHexagramReset === "function") onHexagramReset();
}

function stableNoise(n) {
  let x = Math.sin(n * 9999.123) * 43758.5453;
  return x - Math.floor(x);
}