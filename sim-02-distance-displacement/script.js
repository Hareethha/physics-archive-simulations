const canvas =
  document.getElementById("journeyCanvas");

const ctx =
  canvas.getContext("2d");


const presetButtons =
  document.querySelectorAll("[data-preset]");

const directionButtons =
  document.querySelectorAll("[data-positive]");

const endpointButtons =
  document.querySelectorAll("[data-endpoint]");


const targetSlider =
  document.getElementById("targetSlider");

const targetValue =
  document.getElementById("targetValue");

const moveTargetBtn =
  document.getElementById("moveTargetBtn");

const newStartBtn =
  document.getElementById("newStartBtn");

const originSlider =
  document.getElementById("originSlider");

const pauseBtn =
  document.getElementById("pauseBtn");

const resetBtn =
  document.getElementById("resetBtn");

const hideRouteBtn =
  document.getElementById("hideRouteBtn");


const distanceReadout =
  document.getElementById("distanceReadout");

const displacementReadout =
  document.getElementById("displacementReadout");

const magnitudeReadout =
  document.getElementById("magnitudeReadout");

const relationshipReadout =
  document.getElementById("relationshipReadout");

const relationshipExplanation =
  document.getElementById("relationshipExplanation");

const teachingReadout =
  document.getElementById("teachingReadout");

const journeyText =
  document.getElementById("journeyText");

const endpointMessage =
  document.getElementById("endpointMessage");

const topStart =
  document.getElementById("topStart");

const topCurrent =
  document.getElementById("topCurrent");

const topDirection =
  document.getElementById("topDirection");


const COLORS = {

  plum: "#65404f",

  dark:
    "#472b37",

  rose:
    "#c77d9d",

  pink:
    "#efbfd2",

  pinkLight:
    "#f8d4e2",

  blush:
    "#fff1f6",

  cream:
    "#fff8ef",

  muted:
    "#876b78",

  line:
    "#dfb6c7",

  lightLine:
    "#f0d9e2",

  white:
    "#fffefe"
};


const state = {

  positive:
    "right",

  origin:
    0,

  startWorld:
    -3,

  cartWorld:
    -3,

  targetWorld:
    5,

  distance:
    0,

  journeyPoints:
    [-3],

  queue:
    [],

  activeTarget:
    null,

  paused:
    false,

  hideRoute:
    false,

  speed:
    4,

  previousDirection:
    null,

  reversals:
    0
};


const minWorld =
  -10;

const maxWorld =
  10;


const trackY =
  195;

const rulerY =
  290;


let lastTimestamp =
  null;



/* -----------------------------
   GENERAL HELPERS
----------------------------- */


function clamp(value, min, max) {

  return Math.max(
    min,
    Math.min(max, value)
  );
}


function approximatelyEqual(
  a,
  b,
  tolerance = 0.0001
) {

  return Math.abs(a - b) <
    tolerance;
}


function positiveFactor() {

  return state.positive === "right"
    ? 1
    : -1;
}


function coordinateOf(worldPosition) {

  return (
    positiveFactor() *
    (
      worldPosition -
      state.origin
    )
  );
}


function signed(value, digits = 1) {

  if (
    approximatelyEqual(
      value,
      0
    )
  ) {

    return `0.${"0".repeat(
      Math.max(
        digits - 1,
        0
      )
    )}`;
  }


  const symbol =
    value > 0
      ? "+"
      : "−";


  return (
    symbol +
    Math.abs(value)
      .toFixed(digits)
  );
}


function coordinateText(
  worldPosition
) {

  return (
    signed(
      coordinateOf(
        worldPosition
      )
    ) +
    " m"
  );
}


function worldToScreen(
  worldPosition
) {

  const padding =
    65;

  const usable =
    canvas.width -
    2 * padding;


  return (
    padding +
    (
      (
        worldPosition -
        minWorld
      ) /
      (
        maxWorld -
        minWorld
      )
    ) *
    usable
  );
}



/* -----------------------------
   RESET
----------------------------- */


function clearActiveButtons() {

  presetButtons.forEach(
    button =>
      button.classList.remove(
        "active"
      )
  );


  endpointButtons.forEach(
    button =>
      button.classList.remove(
        "active"
      )
  );
}


function stopMotion() {

  state.queue =
    [];

  state.activeTarget =
    null;

  state.paused =
    false;

  pauseBtn.textContent =
    "Pause";
}


function resetJourney(
  start = -3
) {

  stopMotion();

  state.startWorld =
    start;

  state.cartWorld =
    start;

  state.distance =
    0;

  state.journeyPoints =
    [start];

  state.previousDirection =
    null;

  state.reversals =
    0;


  clearActiveButtons();


  updateEverything();
}



/* -----------------------------
   MOTION
----------------------------- */


function queueJourney(
  start,
  points
) {

  resetJourney(
    start
  );


  state.queue =
    [...points];


  startNextLeg();
}


function startNextLeg() {

  if (
    state.activeTarget !==
      null ||
    state.queue.length === 0
  ) {

    return;
  }


  const next =
    state.queue.shift();


  if (
    approximatelyEqual(
      next,
      state.cartWorld
    )
  ) {

    state.journeyPoints.push(
      next
    );

    startNextLeg();

    return;
  }


  const direction =
    Math.sign(
      next -
      state.cartWorld
    );


  if (
    state.previousDirection !==
      null &&
    direction !==
      state.previousDirection
  ) {

    state.reversals +=
      1;
  }


  state.previousDirection =
    direction;


  state.activeTarget =
    next;
}


function finishActiveLeg() {

  if (
    state.activeTarget ===
      null
  ) {

    return;
  }


  state.cartWorld =
    state.activeTarget;


  state.journeyPoints.push(
    state.activeTarget
  );


  state.activeTarget =
    null;


  startNextLeg();
}


function moveToTarget(
  target
) {

  if (
    state.activeTarget !==
      null
  ) {

    state.queue.push(
      target
    );

    return;
  }


  state.queue.push(
    target
  );


  startNextLeg();
}



/* -----------------------------
   PRESETS
----------------------------- */


function loadPreset(
  preset
) {

  clearActiveButtons();


  const activeButton =
    document.querySelector(
      `[data-preset="${preset}"]`
    );


  if (
    activeButton
  ) {

    activeButton
      .classList.add(
        "active"
      );
  }


  if (
    preset ===
      "direct"
  ) {

    queueJourney(
      -3,
      [5]
    );
  }


  if (
    preset ===
      "turn"
  ) {

    queueJourney(
      -3,
      [5, 1]
    );
  }


  if (
    preset ===
      "round"
  ) {

    queueJourney(
      -3,
      [5, -3]
    );
  }
}



/* -----------------------------
   ENDPOINT EXPERIMENT
----------------------------- */


function runEndpointRoute(
  route
) {

  clearActiveButtons();


  const button =
    document.querySelector(
      `[data-endpoint="${route}"]`
    );


  if (
    button
  ) {

    button.classList.add(
      "active"
    );
  }


  if (
    route ===
      "A"
  ) {

    endpointMessage.textContent =
      "Journey A: same endpoints, direct path. Distance = 4 m and displacement = +4 m in the default convention.";

    queueJourney(
      -3,
      [1]
    );
  }


  if (
    route ===
      "B"
  ) {

    endpointMessage.textContent =
      "Journey B: same endpoints, but the cart first travels beyond the final point and returns. Distance = 12 m while displacement is still +4 m.";

    queueJourney(
      -3,
      [5, 1]
    );
  }


  if (
    route ===
      "C"
  ) {

    endpointMessage.textContent =
      "Journey C: the endpoints are unchanged again, but several extra legs make the total distance much larger. Endpoints alone cannot reveal the distance travelled.";

    queueJourney(
      -3,
      [8, -5, 1]
    );
  }
}



/* -----------------------------
   CONTROLS
----------------------------- */


presetButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        loadPreset(
          button.dataset.preset
        );
      }
    );
  }
);


endpointButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        runEndpointRoute(
          button.dataset.endpoint
        );
      }
    );
  }
);


directionButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        state.positive =
          button.dataset.positive;


        directionButtons.forEach(
          b =>
            b.classList.toggle(
              "active",
              b === button
            )
        );


        updateEverything();
      }
    );
  }
);


targetSlider.addEventListener(
  "input",
  () => {

    state.targetWorld =
      Number(
        targetSlider.value
      );


    updateTargetLabel();
  }
);


moveTargetBtn.addEventListener(
  "click",
  () => {

    clearActiveButtons();

    moveToTarget(
      state.targetWorld
    );
  }
);


originSlider.addEventListener(
  "input",
  () => {

    state.origin =
      Number(
        originSlider.value
      );


    updateEverything();
  }
);


pauseBtn.addEventListener(
  "click",
  () => {

    state.paused =
      !state.paused;


    pauseBtn.textContent =
      state.paused
        ? "Resume"
        : "Pause";
  }
);


resetBtn.addEventListener(
  "click",
  () => {

    state.origin =
      0;

    originSlider.value =
      0;


    state.positive =
      "right";


    directionButtons.forEach(
      button =>
        button.classList.toggle(
          "active",
          button.dataset.positive ===
            "right"
        )
    );


    targetSlider.value =
      5;

    state.targetWorld =
      5;


    resetJourney(
      -3
    );
  }
);


newStartBtn.addEventListener(
  "click",
  () => {

    stopMotion();


    state.startWorld =
      state.cartWorld;

    state.distance =
      0;

    state.journeyPoints =
      [
        state.cartWorld
      ];

    state.previousDirection =
      null;

    state.reversals =
      0;


    clearActiveButtons();


    updateEverything();
  }
);


hideRouteBtn.addEventListener(
  "click",
  () => {

    state.hideRoute =
      !state.hideRoute;


    hideRouteBtn.textContent =
      state.hideRoute
        ? "Show Journey History"
        : "Hide Journey History";


    updateEverything();
  }
);



/* -----------------------------
   READOUTS
----------------------------- */


function displacement() {

  return (
    positiveFactor() *
    (
      state.cartWorld -
      state.startWorld
    )
  );
}


function updateTargetLabel() {

  targetValue.textContent =
    `x = ${coordinateText(
      state.targetWorld
    )}`;
}


function updateJourneyText() {

  if (
    state.hideRoute
  ) {

    journeyText.textContent =
      `${coordinateText(
        state.startWorld
      )}   →   ?   →   ${coordinateText(
        state.cartWorld
      )}`;

    return;
  }


  const points =
    [...state.journeyPoints];


  if (
    !approximatelyEqual(
      points[
        points.length - 1
      ],
      state.cartWorld
    )
  ) {

    points.push(
      state.cartWorld
    );
  }


  journeyText.textContent =
    points
      .map(
        coordinateText
      )
      .join(
        "   →   "
      );
}


function updateTeachingMessage() {

  const dx =
    displacement();

  const magnitude =
    Math.abs(dx);


  if (
    state.distance <
      0.001
  ) {

    teachingReadout.textContent =
      "Distance and displacement are both zero before the journey begins.";

    return;
  }


  if (
    approximatelyEqual(
      state.cartWorld,
      state.startWorld
    ) &&
    state.distance >
      0
  ) {

    teachingReadout.textContent =
      "The cart has returned to its starting position. Displacement is zero, but distance is not: the cart definitely moved.";

    return;
  }


  if (
    state.reversals >
      0
  ) {

    teachingReadout.textContent =
      "The cart has reversed direction. Extra travel contributes to distance but can cancel from the net displacement.";

    return;
  }


  if (
    approximatelyEqual(
      state.distance,
      magnitude,
      0.03
    )
  ) {

    teachingReadout.textContent =
      "The cart has not reversed direction, so distance equals the magnitude of displacement.";

    return;
  }


  teachingReadout.textContent =
    "Distance remembers the complete journey. Displacement compares only the current position with the starting position.";
}


function updateReadouts() {

  const dx =
    displacement();

  const magnitude =
    Math.abs(dx);


  distanceReadout.textContent =
    `${state.distance.toFixed(
      2
    )} m`;


  displacementReadout.textContent =
    `${signed(
      dx,
      2
    )} m`;


  magnitudeReadout.textContent =
    `|Δx| = ${magnitude.toFixed(
      2
    )} m`;


  if (
    approximatelyEqual(
      state.distance,
      magnitude,
      0.03
    )
  ) {

    relationshipReadout.textContent =
      "d = |Δx|";


    relationshipExplanation.textContent =
      state.distance <
      0.001
        ? "The journey has not begun."
        : "No additional distance has been added by a reversal.";
  }

  else {

    relationshipReadout.textContent =
      "d > |Δx|";


    relationshipExplanation.textContent =
      "Some of the travelled path cancels from the net change in position.";
  }


  topStart.textContent =
    coordinateText(
      state.startWorld
    );


  topCurrent.textContent =
    coordinateText(
      state.cartWorld
    );


  topDirection.textContent =
    state.positive ===
      "right"
      ? "Right →"
      : "← Left";


  updateTeachingMessage();

  updateJourneyText();

  updateTargetLabel();
}



/* -----------------------------
   CANVAS DRAWING
----------------------------- */


function drawBackground() {

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      canvas.height
    );


  gradient.addColorStop(
    0,
    "#fffefe"
  );


  gradient.addColorStop(
    1,
    "#fff5f9"
  );


  ctx.fillStyle =
    gradient;


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
}


function drawTitle() {

  ctx.fillStyle =
    COLORS.dark;


  ctx.font =
    "bold 18px Trebuchet MS";


  ctx.textAlign =
    "left";


  ctx.fillText(
    "One-dimensional journey",
    26,
    34
  );


  ctx.fillStyle =
    COLORS.muted;


  ctx.font =
    "14px Trebuchet MS";


  ctx.fillText(
    "Distance follows the path. Displacement connects start to current position.",
    26,
    57
  );
}


function drawTrack() {

  ctx.strokeStyle =
    COLORS.plum;


  ctx.lineWidth =
    4;


  ctx.beginPath();

  ctx.moveTo(
    55,
    trackY
  );

  ctx.lineTo(
    canvas.width - 55,
    trackY
  );

  ctx.stroke();


  ctx.strokeStyle =
    COLORS.line;


  ctx.lineWidth =
    1;


  for (
    let x = 70;
    x < canvas.width - 70;
    x += 32
  ) {

    ctx.beginPath();

    ctx.moveTo(
      x,
      trackY + 7
    );

    ctx.lineTo(
      x + 12,
      trackY + 19
    );

    ctx.stroke();
  }
}


function drawRuler() {

  ctx.strokeStyle =
    COLORS.plum;


  ctx.lineWidth =
    2;


  ctx.beginPath();

  ctx.moveTo(
    55,
    rulerY
  );

  ctx.lineTo(
    canvas.width - 55,
    rulerY
  );

  ctx.stroke();


  ctx.textAlign =
    "center";


  ctx.font =
    "14px Trebuchet MS";


  for (
    let world = minWorld;
    world <= maxWorld;
    world += 1
  ) {

    const screen =
      worldToScreen(
        world
      );


    ctx.strokeStyle =
      COLORS.plum;


    ctx.lineWidth =
      1;


    ctx.beginPath();

    ctx.moveTo(
      screen,
      rulerY - 8
    );

    ctx.lineTo(
      screen,
      rulerY + 8
    );

    ctx.stroke();


    const coordinate =
      coordinateOf(
        world
      );


    ctx.fillStyle =
      COLORS.dark;


    ctx.fillText(
      approximatelyEqual(
        coordinate,
        0
      )
        ? "0"
        : (
          coordinate > 0
            ? `+${coordinate.toFixed(
                coordinate % 1 === 0
                  ? 0
                  : 1
              )}`
            : `−${Math.abs(
                coordinate
              ).toFixed(
                coordinate % 1 === 0
                  ? 0
                  : 1
              )}`
        ),

      screen,
      rulerY + 28
    );
  }


  drawPositiveDirectionArrow();
}


function drawPositiveDirectionArrow() {

  const y =
    rulerY + 60;


  ctx.strokeStyle =
    COLORS.rose;

  ctx.fillStyle =
    COLORS.rose;

  ctx.lineWidth =
    2.5;


  const centre =
    canvas.width / 2;


  if (
    state.positive ===
      "right"
  ) {

    ctx.beginPath();

    ctx.moveTo(
      centre - 55,
      y
    );

    ctx.lineTo(
      centre + 55,
      y
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
      centre + 55,
      y
    );

    ctx.lineTo(
      centre + 42,
      y - 7
    );

    ctx.lineTo(
      centre + 42,
      y + 7
    );

    ctx.closePath();

    ctx.fill();
  }

  else {

    ctx.beginPath();

    ctx.moveTo(
      centre + 55,
      y
    );

    ctx.lineTo(
      centre - 55,
      y
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
      centre - 55,
      y
    );

    ctx.lineTo(
      centre - 42,
      y - 7
    );

    ctx.lineTo(
      centre - 42,
      y + 7
    );

    ctx.closePath();

    ctx.fill();
  }


  ctx.fillStyle =
    COLORS.dark;


  ctx.font =
    "bold 14px Trebuchet MS";


  ctx.textAlign =
    "center";


  ctx.fillText(
    "+ direction",
    centre,
    y - 12
  );
}


function drawOrigin() {

  const x =
    worldToScreen(
      state.origin
    );


  ctx.strokeStyle =
    COLORS.rose;


  ctx.lineWidth =
    2;


  ctx.beginPath();

  ctx.moveTo(
    x,
    trackY - 52
  );

  ctx.lineTo(
    x,
    rulerY + 8
  );

  ctx.stroke();


  ctx.fillStyle =
    COLORS.pink;


  ctx.beginPath();

  ctx.arc(
    x,
    trackY - 61,
    8,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.strokeStyle =
    COLORS.plum;

  ctx.stroke();


  ctx.fillStyle =
    COLORS.dark;


  ctx.textAlign =
    "center";


  ctx.font =
    "bold 13px Trebuchet MS";


  ctx.fillText(
    "origin",
    x,
    trackY - 77
  );
}


function drawStartMarker() {

  const x =
    worldToScreen(
      state.startWorld
    );


  ctx.fillStyle =
    COLORS.cream;


  ctx.strokeStyle =
    COLORS.plum;


  ctx.lineWidth =
    2;


  ctx.beginPath();

  ctx.moveTo(
    x,
    trackY - 21
  );

  ctx.lineTo(
    x + 10,
    trackY - 10
  );

  ctx.lineTo(
    x,
    trackY + 1
  );

  ctx.lineTo(
    x - 10,
    trackY - 10
  );

  ctx.closePath();

  ctx.fill();

  ctx.stroke();


  ctx.fillStyle =
    COLORS.dark;


  ctx.textAlign =
    "center";


  ctx.font =
    "bold 12px Trebuchet MS";


  ctx.fillText(
    "START",
    x,
    trackY - 31
  );
}


function drawCart() {

  const x =
    worldToScreen(
      state.cartWorld
    );


  const y =
    trackY - 8;


  ctx.strokeStyle =
    COLORS.plum;


  ctx.fillStyle =
    COLORS.blush;


  ctx.lineWidth =
    2.3;


  ctx.beginPath();

  ctx.roundRect(
    x - 35,
    y - 30,
    70,
    30,
    8
  );

  ctx.fill();

  ctx.stroke();


  ctx.fillStyle =
    COLORS.pinkLight;


  ctx.beginPath();

  ctx.moveTo(
    x - 26,
    y - 30
  );

  ctx.lineTo(
    x - 12,
    y - 44
  );

  ctx.lineTo(
    x + 15,
    y - 44
  );

  ctx.lineTo(
    x + 28,
    y - 30
  );

  ctx.closePath();

  ctx.fill();

  ctx.stroke();


  ctx.fillStyle =
    COLORS.white;


  ctx.beginPath();

  ctx.arc(
    x - 21,
    y + 6,
    8,
    0,
    Math.PI * 2
  );

  ctx.arc(
    x + 21,
    y + 6,
    8,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.stroke();


  ctx.fillStyle =
    COLORS.dark;


  ctx.textAlign =
    "center";


  ctx.font =
    "bold 13px Trebuchet MS";


  ctx.fillText(
    "cart",
    x,
    y - 53
  );
}


function drawArrowHead(
  x,
  y,
  direction
) {

  ctx.beginPath();

  ctx.moveTo(
    x,
    y
  );

  ctx.lineTo(
    x -
      direction * 11,
    y - 6
  );

  ctx.lineTo(
    x -
      direction * 11,
    y + 6
  );

  ctx.closePath();

  ctx.fill();
}


function drawDisplacement() {

  const startX =
    worldToScreen(
      state.startWorld
    );


  const currentX =
    worldToScreen(
      state.cartWorld
    );


  const y =
    110;


  ctx.strokeStyle =
    COLORS.plum;

  ctx.fillStyle =
    COLORS.plum;

  ctx.lineWidth =
    3;


  if (
    approximatelyEqual(
      startX,
      currentX
    )
  ) {

    ctx.fillStyle =
      COLORS.dark;


    ctx.textAlign =
      "center";


    ctx.font =
      "bold 14px Trebuchet MS";


    ctx.fillText(
      "Δx = 0",
      startX,
      y
    );


    return;
  }


  ctx.beginPath();

  ctx.moveTo(
    startX,
    y
  );

  ctx.lineTo(
    currentX,
    y
  );

  ctx.stroke();


  drawArrowHead(
    currentX,
    y,
    Math.sign(
      currentX -
      startX
    )
  );


  ctx.fillStyle =
    COLORS.dark;


  ctx.textAlign =
    "center";


  ctx.font =
    "bold 13px Trebuchet MS";


  ctx.fillText(
    "displacement",
    (
      startX +
      currentX
    ) / 2,
    y - 12
  );
}


function getDisplayedSegments() {

  const segments =
    [];


  const points =
    [
      ...state.journeyPoints
    ];


  if (
    !approximatelyEqual(
      points[
        points.length - 1
      ],
      state.cartWorld
    )
  ) {

    points.push(
      state.cartWorld
    );
  }


  for (
    let i = 0;
    i <
    points.length - 1;
    i++
  ) {

    segments.push(
      [
        points[i],
        points[i + 1]
      ]
    );
  }


  return segments.slice(
    -4
  );
}


function drawJourneyLegs() {

  if (
    state.hideRoute
  ) {

    ctx.fillStyle =
      COLORS.muted;


    ctx.textAlign =
      "center";


    ctx.font =
      "italic 14px Trebuchet MS";


    ctx.fillText(
      "Journey history hidden — only the endpoints are visible.",
      canvas.width / 2,
      440
    );


    return;
  }


  const segments =
    getDisplayedSegments();


  ctx.fillStyle =
    COLORS.muted;


  ctx.textAlign =
    "left";


  ctx.font =
    "bold 13px Trebuchet MS";


  ctx.fillText(
    "Journey legs",
    58,
    410
  );


  if (
    segments.length ===
      0
  ) {

    ctx.font =
      "13px Trebuchet MS";


    ctx.fillText(
      "No distance travelled yet.",
      58,
      436
    );


    return;
  }


  segments.forEach(
    (
      segment,
      index
    ) => {

      const [
        from,
        to
      ] =
        segment;


      const y =
        438 +
        index * 28;


      const x1 =
        worldToScreen(
          from
        );


      const x2 =
        worldToScreen(
          to
        );


      const direction =
        Math.sign(
          x2 -
          x1
        );


      ctx.strokeStyle =
        COLORS.rose;

      ctx.fillStyle =
        COLORS.rose;

      ctx.lineWidth =
        2;


      ctx.beginPath();

      ctx.moveTo(
        x1,
        y
      );

      ctx.lineTo(
        x2,
        y
      );

      ctx.stroke();


      drawArrowHead(
        x2,
        y,
        direction
      );


      const legDistance =
        Math.abs(
          to -
          from
        );


      ctx.fillStyle =
        COLORS.dark;


      ctx.textAlign =
        "center";


      ctx.font =
        "12px Trebuchet MS";


      ctx.fillText(
        `${legDistance.toFixed(
          1
        )} m`,
        (
          x1 +
          x2
        ) / 2,
        y - 6
      );
    }
  );
}


function draw() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  drawBackground();

  drawTitle();

  drawDisplacement();

  drawTrack();

  drawOrigin();

  drawStartMarker();

  drawCart();

  drawRuler();

  drawJourneyLegs();
}



/* -----------------------------
   UPDATE EVERYTHING
----------------------------- */


function updateEverything() {

  draw();

  updateReadouts();
}



/* -----------------------------
   ANIMATION
----------------------------- */


function animate(
  timestamp
) {

  if (
    lastTimestamp ===
      null
  ) {

    lastTimestamp =
      timestamp;
  }


  let deltaTime =
    (
      timestamp -
      lastTimestamp
    ) /
    1000;


  lastTimestamp =
    timestamp;


  deltaTime =
    Math.min(
      deltaTime,
      0.05
    );


  if (
    !state.paused &&
    state.activeTarget !==
      null
  ) {

    const difference =
      state.activeTarget -
      state.cartWorld;


    const direction =
      Math.sign(
        difference
      );


    let movement =
      direction *
      state.speed *
      deltaTime;


    if (
      Math.abs(
        movement
      ) >=
      Math.abs(
        difference
      )
    ) {

      movement =
        difference;
    }


    state.cartWorld +=
      movement;


    state.distance +=
      Math.abs(
        movement
      );


    if (
      approximatelyEqual(
        state.cartWorld,
        state.activeTarget,
        0.0005
      )
    ) {

      finishActiveLeg();
    }
  }


  updateEverything();


  requestAnimationFrame(
    animate
  );
}



/* -----------------------------
   INITIALISE
----------------------------- */


resetJourney(
  -3
);


updateTargetLabel();


requestAnimationFrame(
  animate
);
