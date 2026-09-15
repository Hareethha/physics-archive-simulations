const canvas =
  document.getElementById("vectorCanvas");

const ctx =
  canvas.getContext("2d");


const modeButtons =
  document.querySelectorAll(".mode-button");

const modeTitle =
  document.getElementById("modeTitle");

const modeDescription =
  document.getElementById("modeDescription");

const canvasHelp =
  document.getElementById("canvasHelp");


const aMagnitudeSlider =
  document.getElementById("aMagnitude");

const aAngleSlider =
  document.getElementById("aAngle");

const bMagnitudeSlider =
  document.getElementById("bMagnitude");

const bAngleSlider =
  document.getElementById("bAngle");


const aMagnitudeValue =
  document.getElementById("aMagnitudeValue");

const aAngleValue =
  document.getElementById("aAngleValue");

const bMagnitudeValue =
  document.getElementById("bMagnitudeValue");

const bAngleValue =
  document.getElementById("bAngleValue");


const angleReferenceButtons =
  document.querySelectorAll(".angle-reference");


const showGrid =
  document.getElementById("showGrid");

const showComponents =
  document.getElementById("showComponents");

const showLabels =
  document.getElementById("showLabels");

const showAngles =
  document.getElementById("showAngles");


const vectorBControls =
  document.getElementById("vectorBControls");

const resolutionControls =
  document.getElementById("resolutionControls");


const pillA =
  document.getElementById("pillA");

const pillB =
  document.getElementById("pillB");

const pillBBox =
  document.getElementById("pillBBox");

const pillResult =
  document.getElementById("pillResult");

const pillResultBox =
  document.getElementById("pillResultBox");


const aVectorReadout =
  document.getElementById("aVectorReadout");

const aMagnitudeReadout =
  document.getElementById("aMagnitudeReadout");

const axReadout =
  document.getElementById("axReadout");

const ayReadout =
  document.getElementById("ayReadout");

const trigFormulaX =
  document.getElementById("trigFormulaX");

const trigFormulaY =
  document.getElementById("trigFormulaY");

const resultVectorReadout =
  document.getElementById("resultVectorReadout");

const resultMagnitudeReadout =
  document.getElementById("resultMagnitudeReadout");

const resultDirectionReadout =
  document.getElementById("resultDirectionReadout");

const teachingReadout =
  document.getElementById("teachingReadout");


const preset345 =
  document.getElementById("preset345");

const presetForce =
  document.getElementById("presetForce");

const presetWalk =
  document.getElementById("presetWalk");

const presetVelocity =
  document.getElementById("presetVelocity");

const resetBtn =
  document.getElementById("resetBtn");


const COLORS = {

  dark: "#432b36",

  plum: "#684453",

  rose: "#cb82a2",

  pink: "#edbace",

  palePink: "#f8d5e2",

  cream: "#fff5df",

  grid: "#f1dce5",

  muted: "#866a76",

  white: "#fffefe"
};


const world = {

  xmin: -10,

  xmax: 10,

  ymin: -8,

  ymax: 8
};


const state = {

  mode: "draw",

  angleReference: "x",

  A: {
    magnitude: 5,
    angle: 36.87
  },

  B: {
    magnitude: 4,
    angle: 90
  },

  dragging: null
};



const modeInfo = {

  draw: {

    title:
      "Draw a Vector",

    description:
      "A vector is represented by an arrow. Its length represents magnitude and its arrowhead represents direction.",

    help:
      "Drag the circular handle at the head of vector A.",

    teaching:
      "Changing the arrow length changes magnitude. Rotating it changes direction."

  },


  addition: {

    title:
      "Head-to-Tail Addition",

    description:
      "Place the tail of B at the head of A. The resultant joins the original starting point to the final endpoint.",

    help:
      "Drag A or B. B is automatically drawn head-to-tail from A.",

    teaching:
      "The resultant is not generally A + B as ordinary magnitudes. Direction matters."

  },


  components: {

    title:
      "Vector Components",

    description:
      "The horizontal and vertical components describe how much of one vector lies along each coordinate axis.",

    help:
      "Drag vector A and watch its horizontal and vertical projections change.",

    teaching:
      "The components are not extra vectors. Together they reconstruct the original vector."

  },


  resolve: {

    title:
      "Resolve with Trigonometry",

    description:
      "Use the vector as the hypotenuse of a right triangle and resolve it along the coordinate axes.",

    help:
      "Change the magnitude, angle, or angle reference.",

    teaching:
      "Cosine belongs to the component adjacent to the stated angle."

  },


  componentAddition: {

    title:
      "Add Vectors Through Components",

    description:
      "Add horizontal components to horizontal components and vertical components to vertical components.",

    help:
      "Change A and B and watch the component sums build the resultant.",

    teaching:
      "Component addition works systematically for vectors in any quadrant."

  },


  subtract: {

    title:
      "Vector Subtraction",

    description:
      "Subtracting B means adding the opposite vector: A − B = A + (−B).",

    help:
      "Change A and B. The opposite vector −B is shown automatically.",

    teaching:
      "A vector can change even when its magnitude remains unchanged."

  }

};



function radians(degrees) {

  return degrees *
    Math.PI / 180;
}



function degrees(radiansValue) {

  return radiansValue *
    180 / Math.PI;
}



function vectorFromPolar(
  magnitude,
  angle
) {

  const theta =
    radians(angle);


  return {

    x:
      magnitude *
      Math.cos(theta),

    y:
      magnitude *
      Math.sin(theta)

  };
}



function magnitude(vector) {

  return Math.sqrt(
    vector.x ** 2 +
    vector.y ** 2
  );
}



function add(a, b) {

  return {

    x:
      a.x + b.x,

    y:
      a.y + b.y

  };
}



function subtract(a, b) {

  return {

    x:
      a.x - b.x,

    y:
      a.y - b.y

  };
}



function opposite(v) {

  return {

    x: -v.x,

    y: -v.y

  };
}



function directionAngle(vector) {

  if (
    magnitude(vector) <
      0.0001
  ) {

    return null;
  }


  let angle =
    degrees(
      Math.atan2(
        vector.y,
        vector.x
      )
    );


  if (
    angle < 0
  ) {

    angle += 360;
  }


  return angle;
}



function formatted(value) {

  if (
    Math.abs(value) <
      0.005
  ) {

    return "0.00";
  }


  return value.toFixed(2);
}



function vectorText(vector) {

  return (
    `(${formatted(vector.x)}, ${formatted(vector.y)})`
  );
}



function worldToScreen(point) {

  const padding =
    55;


  const usableWidth =
    canvas.width -
    2 * padding;


  const usableHeight =
    canvas.height -
    2 * padding;


  return {

    x:
      padding +
      (
        (
          point.x -
          world.xmin
        ) /
        (
          world.xmax -
          world.xmin
        )
      ) *
      usableWidth,

    y:
      canvas.height -
      padding -
      (
        (
          point.y -
          world.ymin
        ) /
        (
          world.ymax -
          world.ymin
        )
      ) *
      usableHeight

  };
}



function screenToWorld(x, y) {

  const padding =
    55;


  const usableWidth =
    canvas.width -
    2 * padding;


  const usableHeight =
    canvas.height -
    2 * padding;


  return {

    x:
      world.xmin +
      (
        (
          x -
          padding
        ) /
        usableWidth
      ) *
      (
        world.xmax -
        world.xmin
      ),

    y:
      world.ymin +
      (
        (
          canvas.height -
          padding -
          y
        ) /
        usableHeight
      ) *
      (
        world.ymax -
        world.ymin
      )

  };
}



function A() {

  return vectorFromPolar(
    state.A.magnitude,
    state.A.angle
  );
}



function B() {

  return vectorFromPolar(
    state.B.magnitude,
    state.B.angle
  );
}



function resultVector() {

  const a = A();

  const b = B();


  if (
    state.mode ===
      "addition" ||
    state.mode ===
      "componentAddition"
  ) {

    return add(a, b);
  }


  if (
    state.mode ===
      "subtract"
  ) {

    return subtract(a, b);
  }


  return null;
}



function setPolarFromVector(
  target,
  vector
) {

  target.magnitude =
    Math.min(
      9,
      magnitude(vector)
    );


  let angle =
    directionAngle(vector);


  if (
    angle === null
  ) {

    angle = 0;
  }


  target.angle =
    angle;
}



function pointerPosition(event) {

  const rect =
    canvas.getBoundingClientRect();


  return {

    x:
      (
        event.clientX -
        rect.left
      ) *
      canvas.width /
      rect.width,

    y:
      (
        event.clientY -
        rect.top
      ) *
      canvas.height /
      rect.height

  };
}



function screenDistance(a, b) {

  return Math.sqrt(
    (
      a.x -
      b.x
    ) ** 2 +
    (
      a.y -
      b.y
    ) ** 2
  );
}



/* MODE HANDLING */

function setMode(mode) {

  state.mode =
    mode;


  modeButtons.forEach(
    button => {

      button.classList.toggle(
        "active",
        button.dataset.mode ===
          mode
      );

    }
  );


  const info =
    modeInfo[mode];


  modeTitle.textContent =
    info.title;


  modeDescription.textContent =
    info.description;


  canvasHelp.textContent =
    info.help;


  vectorBControls.classList.toggle(
    "hidden",

    ![
      "addition",
      "componentAddition",
      "subtract"
    ].includes(mode)
  );


  resolutionControls.classList.toggle(
    "hidden",

    mode !== "resolve"
  );


  pillBBox.classList.toggle(
    "hidden",

    ![
      "addition",
      "componentAddition",
      "subtract"
    ].includes(mode)
  );


  pillResultBox.classList.toggle(
    "hidden",

    ![
      "addition",
      "componentAddition",
      "subtract"
    ].includes(mode)
  );


  update();
}



modeButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        setMode(
          button.dataset.mode
        );

      }
    );

  }
);



/* SLIDERS */

function updateStateFromSliders() {

  state.A.magnitude =
    Number(
      aMagnitudeSlider.value
    );


  state.A.angle =
    Number(
      aAngleSlider.value
    );


  state.B.magnitude =
    Number(
      bMagnitudeSlider.value
    );


  state.B.angle =
    Number(
      bAngleSlider.value
    );


  update();
}



[
  aMagnitudeSlider,
  aAngleSlider,
  bMagnitudeSlider,
  bAngleSlider
].forEach(
  slider => {

    slider.addEventListener(
      "input",
      updateStateFromSliders
    );

  }
);



[
  showGrid,
  showComponents,
  showLabels,
  showAngles
].forEach(
  control => {

    control.addEventListener(
      "change",
      update
    );

  }
);



angleReferenceButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        state.angleReference =
          button.dataset.angleRef;


        angleReferenceButtons.forEach(
          item => {

            item.classList.toggle(
              "active",
              item === button
            );

          }
        );


        update();
      }
    );

  }
);



/* DRAG */

canvas.addEventListener(
  "pointerdown",
  event => {

    const pointer =
      pointerPosition(event);


    const origin =
      worldToScreen({
        x: 0,
        y: 0
      });


    const a =
      A();


    const aHead =
      worldToScreen(a);


    if (
      screenDistance(
        pointer,
        aHead
      ) < 30
    ) {

      state.dragging =
        "A";

      canvas.setPointerCapture(
        event.pointerId
      );

      return;
    }


    if (
      [
        "addition",
        "componentAddition",
        "subtract"
      ].includes(
        state.mode
      )
    ) {

      const b =
        B();


      let bHeadWorld;


      if (
        state.mode ===
          "addition"
      ) {

        bHeadWorld =
          add(a, b);
      }

      else {

        bHeadWorld =
          b;
      }


      const bHead =
        worldToScreen(
          bHeadWorld
        );


      if (
        screenDistance(
          pointer,
          bHead
        ) < 30
      ) {

        state.dragging =
          "B";

        canvas.setPointerCapture(
          event.pointerId
        );

      }
    }

  }
);



canvas.addEventListener(
  "pointermove",
  event => {

    if (
      !state.dragging
    ) {

      return;
    }


    const pointer =
      pointerPosition(event);


    const worldPoint =
      screenToWorld(
        pointer.x,
        pointer.y
      );


    if (
      state.dragging ===
        "A"
    ) {

      setPolarFromVector(
        state.A,
        worldPoint
      );

    }


    if (
      state.dragging ===
        "B"
    ) {

      let vector =
        worldPoint;


      if (
        state.mode ===
          "addition"
      ) {

        vector =
          subtract(
            worldPoint,
            A()
          );

      }


      setPolarFromVector(
        state.B,
        vector
      );

    }


    syncSliders();

    update();

  }
);



canvas.addEventListener(
  "pointerup",
  () => {

    state.dragging =
      null;
  }
);



canvas.addEventListener(
  "pointercancel",
  () => {

    state.dragging =
      null;
  }
);



function syncSliders() {

  aMagnitudeSlider.value =
    state.A.magnitude;

  aAngleSlider.value =
    state.A.angle;


  bMagnitudeSlider.value =
    state.B.magnitude;

  bAngleSlider.value =
    state.B.angle;
}



/* PRESETS */

preset345.addEventListener(
  "click",
  () => {

    state.A.magnitude = 3;
    state.A.angle = 0;

    state.B.magnitude = 4;
    state.B.angle = 90;

    syncSliders();

    setMode("addition");
  }
);



presetForce.addEventListener(
  "click",
  () => {

    /*
      Canvas has a 9-unit display range,
      so the vector is scaled visually.
      Readout concept remains 20 N.
    */

    state.A.magnitude = 8;
    state.A.angle = 30;

    syncSliders();

    setMode("resolve");

    teachingReadout.textContent =
      "Force example: for 20 N at 30°, Fx = 20 cos 30° = 17.3 N and Fy = 20 sin 30° = 10.0 N.";
  }
);



presetWalk.addEventListener(
  "click",
  () => {

    state.A.magnitude = 8;
    state.A.angle = 30;

    state.B.magnitude = 9;
    state.B.angle = 180;

    syncSliders();

    setMode(
      "componentAddition"
    );


    teachingReadout.textContent =
      "PDF example: 10 m at 30° north of east followed by 12 m west gives Rx = −3.34 m and Ry = +5.00 m.";
  }
);



presetVelocity.addEventListener(
  "click",
  () => {

    state.A.magnitude = 6;
    state.A.angle = 0;

    state.B.magnitude = 6;
    state.B.angle = 90;

    syncSliders();

    setMode("subtract");


    teachingReadout.textContent =
      "Velocity-change example: vf − vi = (0,6) − (6,0) = (−6,+6) m/s, with magnitude 8.49 m/s.";
  }
);



resetBtn.addEventListener(
  "click",
  () => {

    state.A.magnitude = 5;
    state.A.angle = 36.87;

    state.B.magnitude = 4;
    state.B.angle = 90;

    state.angleReference =
      "x";

    showGrid.checked = true;
    showComponents.checked = true;
    showLabels.checked = true;
    showAngles.checked = true;

    syncSliders();

    setMode("draw");
  }
);



/* DRAWING */

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



function drawGrid() {

  if (
    !showGrid.checked
  ) {

    return;
  }


  for (
    let x = world.xmin;
    x <= world.xmax;
    x++
  ) {

    const p1 =
      worldToScreen({
        x,
        y:
          world.ymin
      });


    const p2 =
      worldToScreen({
        x,
        y:
          world.ymax
      });


    ctx.strokeStyle =
      x === 0
        ? COLORS.plum
        : COLORS.grid;


    ctx.lineWidth =
      x === 0
        ? 2.3
        : 1;


    ctx.beginPath();

    ctx.moveTo(
      p1.x,
      p1.y
    );

    ctx.lineTo(
      p2.x,
      p2.y
    );

    ctx.stroke();
  }


  for (
    let y = world.ymin;
    y <= world.ymax;
    y++
  ) {

    const p1 =
      worldToScreen({
        x:
          world.xmin,
        y
      });


    const p2 =
      worldToScreen({
        x:
          world.xmax,
        y
      });


    ctx.strokeStyle =
      y === 0
        ? COLORS.plum
        : COLORS.grid;


    ctx.lineWidth =
      y === 0
        ? 2.3
        : 1;


    ctx.beginPath();

    ctx.moveTo(
      p1.x,
      p1.y
    );

    ctx.lineTo(
      p2.x,
      p2.y
    );

    ctx.stroke();
  }
}



function drawAxesLabels() {

  const origin =
    worldToScreen({
      x: 0,
      y: 0
    });


  ctx.fillStyle =
    COLORS.muted;


  ctx.font =
    "12px Trebuchet MS";


  ctx.textAlign =
    "center";


  for (
    let x = -9;
    x <= 9;
    x++
  ) {

    if (
      x === 0
    ) {
      continue;
    }


    const p =
      worldToScreen({
        x,
        y: 0
      });


    ctx.fillText(
      x,
      p.x,
      origin.y + 18
    );
  }


  ctx.textAlign =
    "right";


  for (
    let y = -7;
    y <= 7;
    y++
  ) {

    if (
      y === 0
    ) {
      continue;
    }


    const p =
      worldToScreen({
        x: 0,
        y
      });


    ctx.fillText(
      y,
      origin.x - 8,
      p.y + 4
    );
  }


  ctx.fillStyle =
    COLORS.dark;


  ctx.font =
    "bold 15px Trebuchet MS";


  ctx.textAlign =
    "right";


  ctx.fillText(
    "+x",
    canvas.width - 20,
    origin.y - 10
  );


  ctx.textAlign =
    "left";


  ctx.fillText(
    "+y",
    origin.x + 10,
    20
  );
}



function drawArrow(
  startWorld,
  endWorld,
  color,
  width,
  label
) {

  const start =
    worldToScreen(
      startWorld
    );


  const end =
    worldToScreen(
      endWorld
    );


  const angle =
    Math.atan2(
      end.y -
      start.y,

      end.x -
      start.x
    );


  ctx.strokeStyle =
    color;

  ctx.fillStyle =
    color;

  ctx.lineWidth =
    width;


  ctx.beginPath();

  ctx.moveTo(
    start.x,
    start.y
  );

  ctx.lineTo(
    end.x,
    end.y
  );

  ctx.stroke();


  const size =
    14;


  ctx.beginPath();

  ctx.moveTo(
    end.x,
    end.y
  );

  ctx.lineTo(
    end.x -
    size *
    Math.cos(
      angle -
      Math.PI / 6
    ),

    end.y -
    size *
    Math.sin(
      angle -
      Math.PI / 6
    )
  );

  ctx.lineTo(
    end.x -
    size *
    Math.cos(
      angle +
      Math.PI / 6
    ),

    end.y -
    size *
    Math.sin(
      angle +
      Math.PI / 6
    )
  );

  ctx.closePath();

  ctx.fill();


  if (
    showLabels.checked &&
    label
  ) {

    ctx.fillStyle =
      color;


    ctx.font =
      "bold 15px Trebuchet MS";


    ctx.textAlign =
      "center";


    ctx.fillText(
      label,
      (
        start.x +
        end.x
      ) / 2,
      (
        start.y +
        end.y
      ) / 2 -
      11
    );

  }
}



function drawHandle(
  point,
  color
) {

  const p =
    worldToScreen(
      point
    );


  ctx.fillStyle =
    COLORS.white;

  ctx.strokeStyle =
    color;

  ctx.lineWidth =
    3;


  ctx.beginPath();

  ctx.arc(
    p.x,
    p.y,
    9,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.stroke();
}



function drawComponentsFor(
  vector,
  color,
  prefix
) {

  if (
    !showComponents.checked
  ) {

    return;
  }


  const origin = {
    x: 0,
    y: 0
  };


  const horizontal = {
    x:
      vector.x,
    y: 0
  };


  ctx.save();


  ctx.setLineDash([
    6,
    5
  ]);


  drawArrow(
    origin,
    horizontal,
    color,
    1.7,
    `${prefix}ₓ`
  );


  drawArrow(
    horizontal,
    vector,
    color,
    1.7,
    `${prefix}ᵧ`
  );


  ctx.restore();
}



function drawAngle(
  vector,
  color
) {

  if (
    !showAngles.checked ||
    magnitude(vector) <
      0.2
  ) {

    return;
  }


  const origin =
    worldToScreen({
      x: 0,
      y: 0
    });


  let theta =
    Math.atan2(
      -vector.y,
      vector.x
    );


  const radius =
    42;


  ctx.strokeStyle =
    color;

  ctx.lineWidth =
    1.5;


  ctx.beginPath();


  ctx.arc(
    origin.x,
    origin.y,
    radius,
    0,
    theta,
    theta < 0
  );


  ctx.stroke();
}



/* MODE-SPECIFIC DRAWING */

function drawVectorScene() {

  const a =
    A();

  const b =
    B();


  const origin = {
    x: 0,
    y: 0
  };


  if (
    state.mode ===
      "draw"
  ) {

    drawArrow(
      origin,
      a,
      COLORS.rose,
      4,
      "A"
    );

    drawHandle(
      a,
      COLORS.rose
    );

    drawAngle(
      a,
      COLORS.rose
    );
  }


  if (
    state.mode ===
      "components" ||
    state.mode ===
      "resolve"
  ) {

    drawComponentsFor(
      a,
      COLORS.rose,
      "A"
    );


    drawArrow(
      origin,
      a,
      COLORS.plum,
      4,
      "A"
    );


    drawHandle(
      a,
      COLORS.rose
    );


    drawAngle(
      a,
      COLORS.rose
    );
  }


  if (
    state.mode ===
      "addition"
  ) {

    const end =
      add(a, b);


    drawArrow(
      origin,
      a,
      COLORS.rose,
      4,
      "A"
    );


    drawArrow(
      a,
      end,
      COLORS.pink,
      4,
      "B"
    );


    drawArrow(
      origin,
      end,
      COLORS.plum,
      3,
      "R"
    );


    drawHandle(
      a,
      COLORS.rose
    );


    drawHandle(
      end,
      COLORS.pink
    );
  }


  if (
    state.mode ===
      "componentAddition"
  ) {

    const result =
      add(a, b);


    drawComponentsFor(
      a,
      COLORS.rose,
      "A"
    );


    drawComponentsFor(
      b,
      COLORS.pink,
      "B"
    );


    drawArrow(
      origin,
      a,
      COLORS.rose,
      3.5,
      "A"
    );


    drawArrow(
      origin,
      b,
      COLORS.pink,
      3.5,
      "B"
    );


    drawArrow(
      origin,
      result,
      COLORS.plum,
      4,
      "R"
    );


    drawHandle(
      a,
      COLORS.rose
    );


    drawHandle(
      b,
      COLORS.pink
    );
  }


  if (
    state.mode ===
      "subtract"
  ) {

    const negB =
      opposite(b);


    const result =
      subtract(a, b);


    drawArrow(
      origin,
      a,
      COLORS.rose,
      4,
      "A"
    );


    drawArrow(
      origin,
      b,
      COLORS.pink,
      3,
      "B"
    );


    drawArrow(
      a,
      result,
      COLORS.pink,
      3,
      "−B"
    );


    drawArrow(
      origin,
      result,
      COLORS.plum,
      4,
      "A − B"
    );


    drawHandle(
      a,
      COLORS.rose
    );


    drawHandle(
      b,
      COLORS.pink
    );
  }
}



function draw() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  drawBackground();

  drawGrid();

  drawAxesLabels();

  drawVectorScene();
}



/* READOUTS */

function updateReadouts() {

  const a =
    A();

  const b =
    B();


  const result =
    resultVector();


  aMagnitudeValue.textContent =
    state.A.magnitude.toFixed(2);


  aAngleValue.textContent =
    `${state.A.angle.toFixed(1)}°`;


  bMagnitudeValue.textContent =
    state.B.magnitude.toFixed(2);


  bAngleValue.textContent =
    `${state.B.angle.toFixed(1)}°`;


  pillA.textContent =
    vectorText(a);


  pillB.textContent =
    vectorText(b);


  aVectorReadout.textContent =
    `A = ${vectorText(a)}`;


  aMagnitudeReadout.textContent =
    `|A| = ${magnitude(a).toFixed(2)}`;


  axReadout.textContent =
    `Aₓ = ${formatted(a.x)}`;


  ayReadout.textContent =
    `Aᵧ = ${formatted(a.y)}`;


  if (
    state.angleReference ===
      "x"
  ) {

    trigFormulaX.textContent =
      "Aₓ = A cos θ";


    trigFormulaY.textContent =
      "Aᵧ = A sin θ";

  }

  else {

    trigFormulaX.textContent =
      "Aₓ = A sin φ";


    trigFormulaY.textContent =
      "Aᵧ = A cos φ";

  }


  if (
    result
  ) {

    const resultMagnitude =
      magnitude(result);


    const resultAngle =
      directionAngle(result);


    pillResult.textContent =
      vectorText(result);


    resultVectorReadout.textContent =
      `R = ${vectorText(result)}`;


    resultMagnitudeReadout.textContent =
      `|R| = ${resultMagnitude.toFixed(2)}`;


    resultDirectionReadout.textContent =
      resultAngle === null
        ? "Direction undefined for the zero vector."
        : `Direction = ${resultAngle.toFixed(1)}° counterclockwise from +x`;

  }

  else {

    pillResult.textContent =
      "—";


    resultVectorReadout.textContent =
      "—";


    resultMagnitudeReadout.textContent =
      "—";


    resultDirectionReadout.textContent =
      "—";

  }


  const info =
    modeInfo[state.mode];


  teachingReadout.textContent =
    info.teaching;


  /*
    More specific conceptual messages.
  */


  if (
    state.mode ===
      "draw" &&
    state.A.magnitude <
      0.05
  ) {

    teachingReadout.textContent =
      "The zero vector has zero magnitude. Its direction is not defined.";
  }


  if (
    state.mode ===
      "addition" &&
    result
  ) {

    teachingReadout.textContent =
      "A and B are placed head-to-tail. R joins the original tail to the final head.";
  }


  if (
    state.mode ===
      "componentAddition" &&
    result
  ) {

    teachingReadout.textContent =
      `Rₓ = ${formatted(a.x)} + ${formatted(b.x)} = ${formatted(result.x)}, while Rᵧ = ${formatted(a.y)} + ${formatted(b.y)} = ${formatted(result.y)}.`;
  }


  if (
    state.mode ===
      "subtract" &&
    result
  ) {

    teachingReadout.textContent =
      `Subtract component by component: (${formatted(a.x)} − ${formatted(b.x)}, ${formatted(a.y)} − ${formatted(b.y)}) = ${vectorText(result)}.`;
  }

}



function update() {

  draw();

  updateReadouts();
}



syncSliders();

setMode("draw");

update();
