const canvas =
  document.getElementById("simCanvas");

const ctx =
  canvas.getContext("2d");


const newJourneyBtn =
  document.getElementById("newJourneyBtn");

const resetBtn =
  document.getElementById("resetBtn");

const hidePathBtn =
  document.getElementById("hidePathBtn");


const startReadout =
  document.getElementById("startReadout");

const currentReadout =
  document.getElementById("currentReadout");

const quadrantReadout =
  document.getElementById("quadrantReadout");

const distanceReadout =
  document.getElementById("distanceReadout");

const vectorReadout =
  document.getElementById("vectorReadout");

const dxReadout =
  document.getElementById("dxReadout");

const dyReadout =
  document.getElementById("dyReadout");

const magnitudeReadout =
  document.getElementById("magnitudeReadout");

const teachingReadout =
  document.getElementById("teachingReadout");


const COLORS = {
  dark: "#442c37",
  plum: "#684454",
  rose: "#c981a0",
  pink: "#efbfd2",
  pinkLight: "#f7d6e3",
  cream: "#fff5df",
  muted: "#876a77",
  grid: "#f2dfe7",
  white: "#fffefe"
};


const WORLD = {
  xmin: -10,
  xmax: 10,

  ymin: -7,
  ymax: 7
};


const state = {

  start: {
    x: -5,
    y: -3
  },

  current: {
    x: -5,
    y: -3
  },

  path: [
    {
      x: -5,
      y: -3
    }
  ],

  distance: 0,

  dragging: false,

  hidePath: false
};



function worldToScreen(point) {

  const padding =
    55;


  const width =
    canvas.width -
    2 * padding;


  const height =
    canvas.height -
    2 * padding;


  const x =
    padding +
    (
      (
        point.x -
        WORLD.xmin
      ) /
      (
        WORLD.xmax -
        WORLD.xmin
      )
    ) *
    width;


  const y =
    canvas.height -
    padding -
    (
      (
        point.y -
        WORLD.ymin
      ) /
      (
        WORLD.ymax -
        WORLD.ymin
      )
    ) *
    height;


  return {
    x,
    y
  };
}



function screenToWorld(
  x,
  y
) {

  const padding =
    55;


  const width =
    canvas.width -
    2 * padding;


  const height =
    canvas.height -
    2 * padding;


  let worldX =
    WORLD.xmin +
    (
      (
        x -
        padding
      ) /
      width
    ) *
    (
      WORLD.xmax -
      WORLD.xmin
    );


  let worldY =
    WORLD.ymin +
    (
      (
        canvas.height -
        padding -
        y
      ) /
      height
    ) *
    (
      WORLD.ymax -
      WORLD.ymin
    );


  worldX =
    Math.max(
      WORLD.xmin,
      Math.min(
        WORLD.xmax,
        worldX
      )
    );


  worldY =
    Math.max(
      WORLD.ymin,
      Math.min(
        WORLD.ymax,
        worldY
      )
    );


  return {
    x: worldX,
    y: worldY
  };
}



function distanceBetween(
  a,
  b
) {

  return Math.sqrt(
    (
      b.x -
      a.x
    ) ** 2 +
    (
      b.y -
      a.y
    ) ** 2
  );
}



function signed(
  value
) {

  if (
    Math.abs(value) <
    0.005
  ) {

    return "0.00";
  }


  if (
    value >
    0
  ) {

    return (
      "+" +
      value.toFixed(2)
    );
  }


  return (
    "−" +
    Math.abs(value)
      .toFixed(2)
  );
}



function coordinateText(
  point
) {

  return (
    `(${signed(
      point.x
    )}, ${signed(
      point.y
    )})`
  );
}



function getDisplacement() {

  return {

    x:
      state.current.x -
      state.start.x,

    y:
      state.current.y -
      state.start.y

  };
}



function getQuadrant(
  point
) {

  const x =
    point.x;

  const y =
    point.y;


  if (
    Math.abs(x) <
      0.05 &&
    Math.abs(y) <
      0.05
  ) {

    return "Origin";
  }


  if (
    Math.abs(x) <
      0.05
  ) {

    return "y-axis";
  }


  if (
    Math.abs(y) <
      0.05
  ) {

    return "x-axis";
  }


  if (
    x > 0 &&
    y > 0
  ) {

    return "I";
  }


  if (
    x < 0 &&
    y > 0
  ) {

    return "II";
  }


  if (
    x < 0 &&
    y < 0
  ) {

    return "III";
  }


  return "IV";
}



function getPointerPosition(
  event
) {

  const rect =
    canvas.getBoundingClientRect();


  return {

    x:
      (
        event.clientX -
        rect.left
      ) *
      (
        canvas.width /
        rect.width
      ),

    y:
      (
        event.clientY -
        rect.top
      ) *
      (
        canvas.height /
        rect.height
      )

  };
}



canvas.addEventListener(
  "pointerdown",
  event => {

    const pointer =
      getPointerPosition(
        event
      );


    const object =
      worldToScreen(
        state.current
      );


    const d =
      Math.sqrt(
        (
          pointer.x -
          object.x
        ) ** 2 +
        (
          pointer.y -
          object.y
        ) ** 2
      );


    if (
      d <= 35
    ) {

      state.dragging =
        true;


      canvas.setPointerCapture(
        event.pointerId
      );
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
      getPointerPosition(
        event
      );


    const next =
      screenToWorld(
        pointer.x,
        pointer.y
      );


    const step =
      distanceBetween(
        state.current,
        next
      );


    /*
      Ignore microscopic pointer jitter.
    */

    if (
      step >
      0.015
    ) {

      state.distance +=
        step;


      state.current = {
        x: next.x,
        y: next.y
      };


      const previousPathPoint =
        state.path[
          state.path.length -
          1
        ];


      /*
        Store points only after enough
        motion to keep the path smooth
        without creating thousands of points.
      */

      if (
        distanceBetween(
          previousPathPoint,
          next
        ) >
        0.06
      ) {

        state.path.push({
          x: next.x,
          y: next.y
        });
      }


      update();
    }
  }
);



canvas.addEventListener(
  "pointerup",
  event => {

    state.dragging =
      false;


    if (
      canvas.hasPointerCapture(
        event.pointerId
      )
    ) {

      canvas.releasePointerCapture(
        event.pointerId
      );
    }
  }
);



canvas.addEventListener(
  "pointercancel",
  () => {

    state.dragging =
      false;
  }
);



newJourneyBtn.addEventListener(
  "click",
  () => {

    state.start = {
      x: state.current.x,
      y: state.current.y
    };


    state.distance =
      0;


    state.path = [
      {
        x: state.current.x,
        y: state.current.y
      }
    ];


    update();
  }
);



resetBtn.addEventListener(
  "click",
  () => {

    state.start = {
      x: -5,
      y: -3
    };


    state.current = {
      x: -5,
      y: -3
    };


    state.path = [
      {
        x: -5,
        y: -3
      }
    ];


    state.distance =
      0;


    state.hidePath =
      false;


    hidePathBtn.textContent =
      "Hide Distance Path";


    update();
  }
);



hidePathBtn.addEventListener(
  "click",
  () => {

    state.hidePath =
      !state.hidePath;


    hidePathBtn.textContent =
      state.hidePath
        ? "Show Distance Path"
        : "Hide Distance Path";


    update();
  }
);



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

  ctx.lineWidth =
    1;


  for (
    let x =
      Math.ceil(
        WORLD.xmin
      );

    x <=
      WORLD.xmax;

    x++
  ) {

    const a =
      worldToScreen({
        x,
        y:
          WORLD.ymin
      });


    const b =
      worldToScreen({
        x,
        y:
          WORLD.ymax
      });


    ctx.strokeStyle =
      x === 0
        ? COLORS.plum
        : COLORS.grid;


    ctx.lineWidth =
      x === 0
        ? 2.4
        : 1;


    ctx.beginPath();

    ctx.moveTo(
      a.x,
      a.y
    );

    ctx.lineTo(
      b.x,
      b.y
    );

    ctx.stroke();
  }


  for (
    let y =
      Math.ceil(
        WORLD.ymin
      );

    y <=
      WORLD.ymax;

    y++
  ) {

    const a =
      worldToScreen({
        x:
          WORLD.xmin,
        y
      });


    const b =
      worldToScreen({
        x:
          WORLD.xmax,
        y
      });


    ctx.strokeStyle =
      y === 0
        ? COLORS.plum
        : COLORS.grid;


    ctx.lineWidth =
      y === 0
        ? 2.4
        : 1;


    ctx.beginPath();

    ctx.moveTo(
      a.x,
      a.y
    );

    ctx.lineTo(
      b.x,
      b.y
    );

    ctx.stroke();
  }
}



function drawAxisLabels() {

  ctx.fillStyle =
    COLORS.muted;


  ctx.font =
    "12px Trebuchet MS";


  ctx.textAlign =
    "center";


  for (
    let x =
      WORLD.xmin;

    x <=
      WORLD.xmax;

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
      p.y + 18
    );
  }


  ctx.textAlign =
    "right";


  for (
    let y =
      WORLD.ymin;

    y <=
      WORLD.ymax;

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
      p.x - 8,
      p.y + 4
    );
  }


  const origin =
    worldToScreen({
      x: 0,
      y: 0
    });


  ctx.fillStyle =
    COLORS.dark;


  ctx.textAlign =
    "right";


  ctx.fillText(
    "0",
    origin.x - 7,
    origin.y + 17
  );


  ctx.font =
    "bold 15px Trebuchet MS";


  ctx.fillText(
    "+x",
    canvas.width - 24,
    origin.y - 10
  );


  ctx.textAlign =
    "left";


  ctx.fillText(
    "+y",
    origin.x + 10,
    24
  );
}



function drawQuadrants() {

  ctx.fillStyle =
    "rgba(104,68,84,0.13)";


  ctx.font =
    "italic 20px Georgia";


  const positions = [

    {
      text: "I",
      x: 7.8,
      y: 5.7
    },

    {
      text: "II",
      x: -7.8,
      y: 5.7
    },

    {
      text: "III",
      x: -7.8,
      y: -5.7
    },

    {
      text: "IV",
      x: 7.8,
      y: -5.7
    }

  ];


  positions.forEach(
    item => {

      const p =
        worldToScreen(
          item
        );


      ctx.textAlign =
        "center";


      ctx.fillText(
        item.text,
        p.x,
        p.y
      );
    }
  );
}



function drawPath() {

  if (
    state.hidePath ||
    state.path.length <
      2
  ) {

    return;
  }


  ctx.strokeStyle =
    COLORS.rose;


  ctx.lineWidth =
    5;


  ctx.lineCap =
    "round";


  ctx.lineJoin =
    "round";


  ctx.beginPath();


  const first =
    worldToScreen(
      state.path[0]
    );


  ctx.moveTo(
    first.x,
    first.y
  );


  for (
    let i = 1;
    i <
    state.path.length;
    i++
  ) {

    const p =
      worldToScreen(
        state.path[i]
      );


    ctx.lineTo(
      p.x,
      p.y
    );
  }


  const current =
    worldToScreen(
      state.current
    );


  ctx.lineTo(
    current.x,
    current.y
  );


  ctx.stroke();
}



function drawArrowHead(
  from,
  to
) {

  const angle =
    Math.atan2(
      to.y -
      from.y,

      to.x -
      from.x
    );


  const size =
    13;


  ctx.beginPath();


  ctx.moveTo(
    to.x,
    to.y
  );


  ctx.lineTo(

    to.x -
      size *
      Math.cos(
        angle -
        Math.PI / 6
      ),

    to.y -
      size *
      Math.sin(
        angle -
        Math.PI / 6
      )
  );


  ctx.lineTo(

    to.x -
      size *
      Math.cos(
        angle +
        Math.PI / 6
      ),

    to.y -
      size *
      Math.sin(
        angle +
        Math.PI / 6
      )
  );


  ctx.closePath();

  ctx.fill();
}



function drawDisplacement() {

  const start =
    worldToScreen(
      state.start
    );


  const end =
    worldToScreen(
      state.current
    );


  const screenDistance =
    Math.sqrt(
      (
        end.x -
        start.x
      ) ** 2 +
      (
        end.y -
        start.y
      ) ** 2
    );


  if (
    screenDistance <
      5
  ) {

    return;
  }


  ctx.strokeStyle =
    COLORS.plum;


  ctx.fillStyle =
    COLORS.plum;


  ctx.lineWidth =
    3;


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


  drawArrowHead(
    start,
    end
  );
}



function drawStart() {

  const p =
    worldToScreen(
      state.start
    );


  ctx.fillStyle =
    COLORS.cream;


  ctx.strokeStyle =
    COLORS.plum;


  ctx.lineWidth =
    2;


  ctx.beginPath();


  ctx.arc(
    p.x,
    p.y,
    10,
    0,
    Math.PI * 2
  );


  ctx.fill();

  ctx.stroke();


  ctx.fillStyle =
    COLORS.dark;


  ctx.font =
    "bold 12px Trebuchet MS";


  ctx.textAlign =
    "center";


  ctx.fillText(
    "START",
    p.x,
    p.y - 17
  );
}



function drawObject() {

  const p =
    worldToScreen(
      state.current
    );


  ctx.fillStyle =
    COLORS.pink;


  ctx.strokeStyle =
    COLORS.plum;


  ctx.lineWidth =
    3;


  ctx.beginPath();


  ctx.arc(
    p.x,
    p.y,
    17,
    0,
    Math.PI * 2
  );


  ctx.fill();

  ctx.stroke();


  ctx.fillStyle =
    COLORS.white;


  ctx.beginPath();


  ctx.arc(
    p.x - 5,
    p.y - 5,
    4,
    0,
    Math.PI * 2
  );


  ctx.fill();
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

  drawQuadrants();

  drawPath();

  drawDisplacement();

  drawAxisLabels();

  drawStart();

  drawObject();
}



function updateReadouts() {

  const delta =
    getDisplacement();


  const magnitude =
    Math.sqrt(
      delta.x ** 2 +
      delta.y ** 2
    );


  startReadout.textContent =
    coordinateText(
      state.start
    );


  currentReadout.textContent =
    coordinateText(
      state.current
    );


  quadrantReadout.textContent =
    getQuadrant(
      state.current
    );


  distanceReadout.textContent =
    `${state.distance.toFixed(
      2
    )} m`;


  vectorReadout.textContent =
    `Δr = (${signed(
      delta.x
    )}, ${signed(
      delta.y
    )}) m`;


  dxReadout.textContent =
    `Δx = ${signed(
      delta.x
    )} m`;


  dyReadout.textContent =
    `Δy = ${signed(
      delta.y
    )} m`;


  magnitudeReadout.textContent =
    `|Δr| = ${magnitude.toFixed(
      2
    )} m`;


  if (
    state.distance <
      0.01
  ) {

    teachingReadout.textContent =
      "Before the object moves, both distance and displacement are zero.";
  }

  else if (
    magnitude <
      0.08
  ) {

    teachingReadout.textContent =
      "The object has returned to its starting point. Displacement is zero, but distance is not zero because a journey occurred.";
  }

  else if (
    state.distance >
      magnitude +
      0.15
  ) {

    teachingReadout.textContent =
      "The curved pink route is longer than the straight displacement vector. Distance depends on the path; displacement depends only on the endpoints.";
  }

  else {

    teachingReadout.textContent =
      "The journey is approximately straight, so distance is currently close to the magnitude of displacement.";
  }
}



function update() {

  draw();

  updateReadouts();
}


update();
