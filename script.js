const canvas = document.getElementById("simCanvas");
const ctx = canvas.getContext("2d");

const frameButtons = document.querySelectorAll("[data-frame]");
const positiveButtons = document.querySelectorAll("[data-positive]");

const moveLeftBtn = document.getElementById("moveLeftBtn");
const stopBtn = document.getElementById("stopBtn");
const moveRightBtn = document.getElementById("moveRightBtn");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const resetBtn = document.getElementById("resetBtn");

const frameBadge = document.getElementById("frameBadge");

const coordReadout = document.getElementById("coordReadout");
const signReadout = document.getElementById("signReadout");
const locationReadout = document.getElementById("locationReadout");
const groundMotionReadout = document.getElementById("groundMotionReadout");
const frameMotionReadout = document.getElementById("frameMotionReadout");
const keyIdeaReadout = document.getElementById("keyIdeaReadout");

const COLORS = {
  dark: "#5f3948",
  dark2: "#7a5060",
  muted: "#8f6a79",
  line: "#d7a8bb",
  softLine: "#ead0db",
  panel: "#fffafc",
  cream: "#fff7ef",
  blush: "#f8dce8",
  rose: "#f1bfd2",
  pale: "#fff3f8",
  white: "#fffefe"
};

const state = {
  frame: "ground",
  positive: "right",
  cartPos: -3,
  originPos: 0,
  cartVel: 0,
  speed: 2,
  dragging: null,
  minWorld: -10,
  maxWorld: 10,
  scale: 42
};

const landmarks = [
  { x: -8, label: "Tree", type: "tree" },
  { x: -4, label: "Cone", type: "cone" },
  { x: 3, label: "Post", type: "post" },
  { x: 7, label: "Tree", type: "tree" }
];

const trackY = 210;
const rulerY = 325;
const cartY = 165;

let lastTime = 0;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function snap(value, step) {
  return Math.round(value / step) * step;
}

function approximatelyZero(value, eps = 0.0001) {
  return Math.abs(value) < eps;
}

function signedNumber(value, decimals = 1) {
  const v = approximatelyZero(value) ? 0 : value;
  const sign = v >= 0 ? "+" : "−";
  return `${sign}${Math.abs(v).toFixed(decimals)}`;
}

function setActiveButton(group, activeValue, attributeName) {
  group.forEach(btn => {
    btn.classList.toggle("active", btn.dataset[attributeName] === activeValue);
  });
}

function updateMotionButtons() {
  moveLeftBtn.classList.toggle("active", state.cartVel < 0);
  stopBtn.classList.toggle("active", approximatelyZero(state.cartVel));
  moveRightBtn.classList.toggle("active", state.cartVel > 0);
}

function setFrame(frame) {
  state.frame = frame;
  setActiveButton(frameButtons, frame, "frame");
  frameBadge.textContent =
    frame === "ground" ? "Current frame: Ground" : "Current frame: Cart";
}

function setPositiveDirection(dir) {
  state.positive = dir;
  setActiveButton(positiveButtons, dir, "positive");
}

function setVelocity(direction) {
  if (direction === "left") {
    state.cartVel = -state.speed;
  } else if (direction === "right") {
    state.cartVel = state.speed;
  } else {
    state.cartVel = 0;
  }
  updateMotionButtons();
}

function resetSimulation() {
  state.frame = "ground";
  state.positive = "right";
  state.cartPos = -3;
  state.originPos = 0;
  state.cartVel = 0;
  state.speed = 2;

  speedSlider.value = state.speed;
  speedValue.textContent = state.speed.toFixed(1);

  setFrame(state.frame);
  setPositiveDirection(state.positive);
  updateMotionButtons();
}

frameButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    setFrame(btn.dataset.frame);
  });
});

positiveButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    setPositiveDirection(btn.dataset.positive);
  });
});

moveLeftBtn.addEventListener("click", () => setVelocity("left"));
stopBtn.addEventListener("click", () => setVelocity("stop"));
moveRightBtn.addEventListener("click", () => setVelocity("right"));

speedSlider.addEventListener("input", () => {
  state.speed = parseFloat(speedSlider.value);
  speedValue.textContent = state.speed.toFixed(1);

  if (!approximatelyZero(state.cartVel)) {
    state.cartVel = Math.sign(state.cartVel) * state.speed;
  }
});

resetBtn.addEventListener("click", resetSimulation);

function worldToScreenX(worldX) {
  const relativeX =
    state.frame === "ground" ? worldX : worldX - state.cartPos;
  return canvas.width / 2 + relativeX * state.scale;
}

function screenToWorldX(screenX) {
  const relativeX = (screenX - canvas.width / 2) / state.scale;
  return state.frame === "ground" ? relativeX : relativeX + state.cartPos;
}

function cartScreenX() {
  return state.frame === "ground" ? worldToScreenX(state.cartPos) : canvas.width / 2;
}

function positiveFactor() {
  return state.positive === "right" ? 1 : -1;
}

function cartCoordinate() {
  return positiveFactor() * (state.cartPos - state.originPos);
}

function getPointerPos(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height)
  };
}

canvas.addEventListener("pointerdown", (event) => {
  const p = getPointerPos(event);
  const cX = cartScreenX();
  const originX = worldToScreenX(state.originPos);

  const overCart =
    p.x >= cX - 40 && p.x <= cX + 40 && p.y >= cartY - 20 && p.y <= cartY + 28;

  const overOrigin =
    Math.abs(p.x - originX) <= 14 && p.y >= trackY - 115 && p.y <= rulerY + 20;

  if (overCart) {
    state.dragging = "cart";
    state.cartVel = 0;
    updateMotionButtons();
    canvas.setPointerCapture(event.pointerId);
  } else if (overOrigin) {
    state.dragging = "origin";
    canvas.setPointerCapture(event.pointerId);
  }
});

canvas.addEventListener("pointermove", (event) => {
  if (!state.dragging) return;

  const p = getPointerPos(event);
  const worldX = clamp(screenToWorldX(p.x), state.minWorld, state.maxWorld);

  if (state.dragging === "cart") {
    state.cartPos = snap(worldX, 0.25);
  } else if (state.dragging === "origin") {
    state.originPos = snap(worldX, 1);
  }
});

canvas.addEventListener("pointerup", () => {
  state.dragging = null;
});

canvas.addEventListener("pointercancel", () => {
  state.dragging = null;
});

function drawBackgroundGlow() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#fffdfd");
  gradient.addColorStop(1, "#fff3f8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawTrack() {
  ctx.lineWidth = 4;
  ctx.strokeStyle = COLORS.dark;
  ctx.beginPath();
  ctx.moveTo(40, trackY);
  ctx.lineTo(canvas.width - 40, trackY);
  ctx.stroke();

  for (let x = 50; x < canvas.width - 40; x += 35) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = COLORS.line;
    ctx.beginPath();
    ctx.moveTo(x, trackY + 7);
    ctx.lineTo(x + 12, trackY + 18);
    ctx.stroke();
  }
}

function drawRuler() {
  const minVisibleWorld = screenToWorldX(0) - 1;
  const maxVisibleWorld = screenToWorldX(canvas.width) + 1;

  ctx.lineWidth = 2;
  ctx.strokeStyle = COLORS.dark2;
  ctx.beginPath();
  ctx.moveTo(40, rulerY);
  ctx.lineTo(canvas.width - 40, rulerY);
  ctx.stroke();

  ctx.font = "15px Trebuchet MS";
  ctx.fillStyle = COLORS.dark;
  ctx.textAlign = "center";

  for (let m = Math.floor(minVisibleWorld); m <= Math.ceil(maxVisibleWorld); m++) {
    const sx = worldToScreenX(m);
    if (sx < 20 || sx > canvas.width - 20) continue;

    ctx.lineWidth = 1.2;
    ctx.strokeStyle = COLORS.dark2;
    ctx.beginPath();
    ctx.moveTo(sx, rulerY - 10);
    ctx.lineTo(sx, rulerY + 10);
    ctx.stroke();

    let label = positiveFactor() * (m - state.originPos);
    if (approximatelyZero(label)) label = 0;

    const isInteger = Math.abs(label - Math.round(label)) < 0.001;
    const labelText = isInteger ? String(Math.round(label)) : label.toFixed(1);

    ctx.fillText(labelText, sx, rulerY + 28);
  }

  ctx.textAlign = "left";
  ctx.font = "16px Trebuchet MS";
  ctx.fillStyle = COLORS.dark;

  if (state.positive === "right") {
    ctx.strokeStyle = COLORS.dark;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 150, rulerY - 38);
    ctx.lineTo(canvas.width - 70, rulerY - 38);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width - 70, rulerY - 38);
    ctx.lineTo(canvas.width - 82, rulerY - 45);
    ctx.lineTo(canvas.width - 82, rulerY - 31);
    ctx.closePath();
    ctx.fill();

    ctx.fillText("+x", canvas.width - 64, rulerY - 33);
  } else {
    ctx.strokeStyle = COLORS.dark;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 70, rulerY - 38);
    ctx.lineTo(canvas.width - 150, rulerY - 38);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width - 150, rulerY - 38);
    ctx.lineTo(canvas.width - 138, rulerY - 45);
    ctx.lineTo(canvas.width - 138, rulerY - 31);
    ctx.closePath();
    ctx.fill();

    ctx.fillText("+x", canvas.width - 64, rulerY - 33);
  }
}

function drawOrigin() {
  const x = worldToScreenX(state.originPos);

  ctx.strokeStyle = COLORS.dark;
  ctx.fillStyle = COLORS.rose;

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, trackY - 82);
  ctx.lineTo(x, rulerY + 6);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, trackY - 92, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 16px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.dark;
  ctx.fillText("Origin", x, trackY - 110);
  ctx.font = "15px Trebuchet MS";
  ctx.fillText("0", x, rulerY - 16);
}

function drawTree(x, baseY) {
  ctx.strokeStyle = COLORS.dark2;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.lineTo(x, baseY - 32);
  ctx.stroke();

  ctx.fillStyle = COLORS.blush;
  ctx.beginPath();
  ctx.moveTo(x - 16, baseY - 24);
  ctx.lineTo(x, baseY - 48);
  ctx.lineTo(x + 16, baseY - 24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 14, baseY - 10);
  ctx.lineTo(x, baseY - 34);
  ctx.lineTo(x + 14, baseY - 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawCone(x, baseY) {
  ctx.strokeStyle = COLORS.dark2;
  ctx.fillStyle = COLORS.rose;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x - 12, baseY);
  ctx.lineTo(x, baseY - 22);
  ctx.lineTo(x + 12, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawPost(x, baseY) {
  ctx.strokeStyle = COLORS.dark2;
  ctx.fillStyle = COLORS.cream;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.lineTo(x, baseY - 34);
  ctx.stroke();

  ctx.fillRect(x - 14, baseY - 52, 28, 18);
  ctx.strokeRect(x - 14, baseY - 52, 28, 18);
}

function drawLandmarks() {
  const baseY = trackY;

  landmarks.forEach(item => {
    const sx = worldToScreenX(item.x);
    if (sx < -60 || sx > canvas.width + 60) return;

    if (item.type === "tree") drawTree(sx, baseY);
    if (item.type === "cone") drawCone(sx, baseY);
    if (item.type === "post") drawPost(sx, baseY);

    ctx.fillStyle = COLORS.muted;
    ctx.font = "14px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText(item.label, sx, baseY - 62);
  });
}

function drawCart() {
  const x = cartScreenX();
  const y = cartY;

  ctx.strokeStyle = COLORS.dark;
  ctx.fillStyle = COLORS.pale;
  ctx.lineWidth = 2.5;

  ctx.fillRect(x - 34, y - 18, 68, 28);
  ctx.strokeRect(x - 34, y - 18, 68, 28);

  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.arc(x - 20, y + 15, 8, 0, Math.PI * 2);
  ctx.arc(x + 20, y + 15, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = COLORS.blush;
  ctx.beginPath();
  ctx.moveTo(x - 26, y - 18);
  ctx.lineTo(x - 12, y - 34);
  ctx.lineTo(x + 16, y - 34);
  ctx.lineTo(x + 28, y - 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = COLORS.dark;
  ctx.font = "bold 16px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText("Cart", x, y - 44);

  if (!approximatelyZero(state.cartVel)) {
    const dir = Math.sign(state.cartVel);
    const arrowLength = 42;
    const startX = x - dir * 18;
    const endX = startX + dir * arrowLength;
    const ay = y - 64;

    ctx.lineWidth = 2;
    ctx.strokeStyle = COLORS.dark;
    ctx.beginPath();
    ctx.moveTo(startX, ay);
    ctx.lineTo(endX, ay);
    ctx.stroke();

    ctx.fillStyle = COLORS.dark;
    ctx.beginPath();
    ctx.moveTo(endX, ay);
    ctx.lineTo(endX - dir * 10, ay - 6);
    ctx.lineTo(endX - dir * 10, ay + 6);
    ctx.closePath();
    ctx.fill();

    ctx.font = "14px Trebuchet MS";
    ctx.fillText("ground motion", x, ay - 10);
  }
}

function drawFrameLabel() {
  ctx.fillStyle = COLORS.dark;
  ctx.font = "bold 17px Trebuchet MS";
  ctx.textAlign = "left";
  ctx.fillText(
    state.frame === "ground"
      ? "View: Ground frame"
      : "View: Cart frame",
    24,
    30
  );

  ctx.fillStyle = COLORS.muted;
  ctx.font = "15px Trebuchet MS";
  ctx.fillText(
    state.frame === "ground"
      ? "The track and landmarks are fixed; the cart may move."
      : "The cart is fixed at the center; the track and landmarks move past it.",
    24,
    55
  );
}

function draw() {
  drawBackgroundGlow();
  drawFrameLabel();
  drawTrack();
  drawLandmarks();
  drawOrigin();
  drawCart();
  drawRuler();
}

function updateReadouts() {
  const coord = cartCoordinate();
  const physicalDelta = state.cartPos - state.originPos;
  const distanceFromOrigin = Math.abs(physicalDelta);

  coordReadout.textContent = `x = ${signedNumber(coord)} m`;

  if (approximatelyZero(coord)) {
    signReadout.textContent = "The coordinate is zero. The cart is at the origin.";
  } else if (coord > 0) {
    signReadout.textContent = "The coordinate is positive in the current convention.";
  } else {
    signReadout.textContent = "The coordinate is negative in the current convention.";
  }

  if (approximatelyZero(physicalDelta)) {
    locationReadout.textContent = "The cart is at the origin.";
  } else if (physicalDelta > 0) {
    locationReadout.textContent = `The cart is ${distanceFromOrigin.toFixed(1)} m to the right of the origin.`;
  } else {
    locationReadout.textContent = `The cart is ${distanceFromOrigin.toFixed(1)} m to the left of the origin.`;
  }

  let groundMotionText = "";
  if (approximatelyZero(state.cartVel)) {
    groundMotionText = "The cart is stationary relative to the ground.";
  } else if (state.cartVel > 0) {
    groundMotionText = "The cart is moving right relative to the ground.";
  } else {
    groundMotionText = "The cart is moving left relative to the ground.";
  }
  groundMotionReadout.textContent = groundMotionText;

  let chosenFrameText = "";
  if (state.frame === "ground") {
    if (approximatelyZero(state.cartVel)) {
      chosenFrameText = "In the ground frame, the cart is stationary.";
    } else if (state.cartVel > 0) {
      chosenFrameText = "In the ground frame, the cart is moving right.";
    } else {
      chosenFrameText = "In the ground frame, the cart is moving left.";
    }
  } else {
    chosenFrameText =
      "In the cart frame, the cart is at rest while the surroundings move past it.";
  }
  frameMotionReadout.textContent = chosenFrameText;

  if (coord < 0 && state.cartVel > 0) {
    keyIdeaReadout.textContent =
      "Important: the cart can be at a negative position while moving right. A negative coordinate does not mean it is moving left.";
  } else if (coord > 0 && state.cartVel < 0) {
    keyIdeaReadout.textContent =
      "Important: the cart can be at a positive position while moving left. Position and direction of motion are different ideas.";
  } else if (state.frame === "cart") {
    keyIdeaReadout.textContent =
      "Reference-frame idea: in the cart frame, the cart is at rest even though it may be moving relative to the ground.";
  } else {
    keyIdeaReadout.textContent =
      "A position tells us where the cart is, not how it is moving.";
  }
}

function animate(timestamp) {
  if (!lastTime) lastTime = timestamp;
  let dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (dt > 0.05) dt = 0.05;

  if (!state.dragging) {
    state.cartPos += state.cartVel * dt;
    if (state.cartPos <= state.minWorld) {
      state.cartPos = state.minWorld;
      state.cartVel = 0;
      updateMotionButtons();
    }
    if (state.cartPos >= state.maxWorld) {
      state.cartPos = state.maxWorld;
      state.cartVel = 0;
      updateMotionButtons();
    }
  }

  draw();
  updateReadouts();
  requestAnimationFrame(animate);
}

resetSimulation();
requestAnimationFrame(animate);
