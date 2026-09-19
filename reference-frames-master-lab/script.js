
const $ = id => document.getElementById(id);
const tabs = document.querySelectorAll('.tab');
const panes = document.querySelectorAll('.tabpane');
function setTab(name){
  tabs.forEach(b=>b.classList.toggle('active', b.dataset.tab===name));
  panes.forEach(p=>p.classList.toggle('hidden', p.id!==name));
  updateAll();
}
tabs.forEach(btn=>btn.addEventListener('click', ()=>setTab(btn.dataset.tab)));

function sign(v,d=2){ if(Math.abs(v)<1e-10) return (0).toFixed(d); return (v>0?'+':'−')+Math.abs(v).toFixed(d); }
function clamp(x,a,b){ return Math.max(a,Math.min(b,x)); }

// ---------- Shared canvas helpers ----------
function drawAxes(ctx,W,H,m,xmin,xmax,ymin,ymax,xlabel,ylabel){
  ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#f1dce5'; ctx.lineWidth=1;
  for(let i=0;i<=8;i++){ let x=m.l+i*(W-m.l-m.r)/8; ctx.beginPath(); ctx.moveTo(x,m.t); ctx.lineTo(x,H-m.b); ctx.stroke(); }
  for(let i=0;i<=5;i++){ let y=m.t+i*(H-m.t-m.b)/5; ctx.beginPath(); ctx.moveTo(m.l,y); ctx.lineTo(W-m.r,y); ctx.stroke(); }
  const X=x=>m.l+(x-xmin)/(xmax-xmin)*(W-m.l-m.r), Y=y=>H-m.b-(y-ymin)/(ymax-ymin)*(H-m.t-m.b);
  if(ymin<0 && ymax>0){ ctx.strokeStyle='#684453'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.moveTo(m.l,Y(0)); ctx.lineTo(W-m.r,Y(0)); ctx.stroke(); }
  if(xmin<0 && xmax>0){ ctx.strokeStyle='#684453'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.moveTo(X(0),m.t); ctx.lineTo(X(0),H-m.b); ctx.stroke(); }
  ctx.strokeStyle='#684453'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,H-m.b); ctx.lineTo(W-m.r,H-m.b); ctx.stroke();
  ctx.fillStyle='#684453'; ctx.font='13px Trebuchet MS';
  ctx.fillText(xlabel,W-55,H-12); ctx.save(); ctx.translate(18,H/2); ctx.rotate(-Math.PI/2); ctx.fillText(ylabel,0,0); ctx.restore();
  return {X,Y};
}

// ---------- Frame Switcher ----------
function frameState(){
  const vT = +$('trainVel').value;
  const vPT = +$('passRel').value;
  const vPG = vT + vPT;
  const t = +$('frameTime').value;
  const xT = vT*t;
  const xP = xT + vPT*t;
  const observer = $('frameObserver').value;
  let xObs=0, vObs=0;
  if(observer==='train'){ xObs=xT; vObs=vT; }
  else if(observer==='passenger'){ xObs=xP; vObs=vPG; }
  return {vT,vPT,vPG,t,xT,xP,observer,xObs,vObs,xTrainObs:xT-xObs,xPassObs:xP-xObs};
}
function drawFrame(){
  const s=frameState();
  $('trainVelLabel').textContent = sign(s.vT,1)+' m/s';
  $('passRelLabel').textContent = sign(s.vPT,1)+' m/s';
  $('frameTimeLabel').textContent = s.t.toFixed(2)+' s';
  $('pillTrainGround').textContent = sign(s.vT,1)+' m/s';
  $('pillPassTrain').textContent = sign(s.vPT,1)+' m/s';
  $('pillPassGround').textContent = sign(s.vPG,1)+' m/s';
  const cv=$('frameCanvas'), ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H);
  const xmin=-40, xmax=40;
  const X=x=>65+(x-xmin)/(xmax-xmin)*(W-130);
  const railY=310;
  ctx.strokeStyle='#684453'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(55,railY); ctx.lineTo(W-55,railY); ctx.stroke();
  for(let x=-30;x<=30;x+=10){ let sx=X(x); ctx.strokeStyle='#e7bfd0'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.moveTo(sx,railY-10); ctx.lineTo(sx,railY+10); ctx.stroke(); ctx.fillStyle='#846a75'; ctx.font='12px Trebuchet MS'; ctx.textAlign='center'; ctx.fillText(String(x),sx,railY+28); }
  const tx=clamp(X(s.xTrainObs),90,W-170), px=clamp(X(s.xPassObs),90,W-90);
  ctx.fillStyle='#f4dbe6'; ctx.strokeStyle='#684453'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.roundRect(tx-110, railY-70, 220, 52, 14); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#684453'; ctx.font='bold 15px Trebuchet MS'; ctx.fillText('train', tx, railY-83);
  ctx.fillStyle='#ca82a0'; ctx.beginPath(); ctx.arc(px,railY-44,13,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#432b36'; ctx.stroke();
  ctx.fillStyle='#432b36'; ctx.fillText('passenger', px, railY-90);
  ctx.fillStyle='#846a75'; ctx.textAlign='left'; ctx.font='13px Trebuchet MS';
  ctx.fillText('Observer: '+s.observer, 70, 40);
  if($('frameShowCoords').checked){
    ctx.fillText(`train coordinate = ${s.xTrainObs.toFixed(2)} m`, 70, 64);
    ctx.fillText(`passenger coordinate = ${s.xPassObs.toFixed(2)} m`, 70, 84);
  }
  function velArrow(x,y,v,col,label){
    let len=Math.min(110,Math.abs(v)*7), dir=v>=0?1:-1;
    ctx.strokeStyle=col; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+dir*len,y); ctx.stroke();
    ctx.fillStyle=col; ctx.font='13px Trebuchet MS'; ctx.fillText(label+': '+sign(v,1)+' m/s', x+dir*len+(dir>0?8:-115), y+4);
  }
  let vTrainObs = s.vT - s.vObs; let vPassObs = s.vPG - s.vObs;
  velArrow(tx, railY-120, vTrainObs, '#684453','train');
  velArrow(px, railY-150, vPassObs, '#ca82a0','passenger');
  $('frameRead').textContent = `Observing from the ${s.observer}`;
  $('frameReadText').textContent = s.observer==='ground' ? 'Ground coordinates describe both the train and the passenger moving across the platform.' : s.observer==='train' ? 'In the train frame, the train itself is at rest and only motion relative to the train remains.' : 'In the passenger frame, the passenger is at rest by definition.';
  $('frameVelEq').textContent = `v_passenger/G = ${sign(s.vPT,1)} + ${sign(s.vT,1)} = ${sign(s.vPG,1)} m/s`;
  $('swapRead').textContent = `v_train/passenger = ${sign(-s.vPT,1)} m/s`;
  if(s.observer==='train') $('frameCue').textContent='The same physical situation can look stationary or moving depending on the chosen frame. The train is at rest only in its own frame.';
  else if(s.observer==='passenger') $('frameCue').textContent='Every object is at rest in its own frame. This is not a trick: it is exactly what “relative to” means.';
  else $('frameCue').textContent='Ground, train, and passenger can all assign different velocities to the same object without contradiction.';
}
['frameObserver','trainVel','passRel','frameTime','frameShowCoords'].forEach(id=>$(id).addEventListener('input', drawFrame));
$('frameForward').addEventListener('click',()=>{$('trainVel').value=12;$('passRel').value=2;$('frameObserver').value='ground';drawFrame();});
$('frameBackward').addEventListener('click',()=>{$('trainVel').value=12;$('passRel').value=-2;$('frameObserver').value='train';drawFrame();});
$('frameReset').addEventListener('click',()=>{$('trainVel').value=12;$('passRel').value=2;$('frameTime').value=4;$('frameObserver').value='ground';$('frameShowCoords').checked=true;drawFrame();});

// ---------- Relative Playground ----------
function relState(){
  const xA0=+$('relAX').value, xB0=+$('relBX').value, vA=+$('relAV').value, vB=+$('relBV').value, t=+$('relTime').value;
  const xA=xA0+vA*t, xB=xB0+vB*t, observer=$('relativeObserver').value;
  let xObs=0,vObs=0; if(observer==='A'){xObs=xA;vObs=vA;} else if(observer==='B'){xObs=xB;vObs=vB;}
  return {xA0,xB0,vA,vB,t,xA,xB,observer,xObs,vObs,xAObs:xA-xObs,xBObs:xB-xObs,xAB:xA-xB,vAB:vA-vB,vBA:vB-vA};
}
function drawRelative(){
  const s=relState();
  $('relAXLabel').textContent=sign(s.xA0,1)+' m'; $('relBXLabel').textContent=sign(s.xB0,1)+' m'; $('relAVLabel').textContent=sign(s.vA,1)+' m/s'; $('relBVLabel').textContent=sign(s.vB,1)+' m/s'; $('relTimeLabel').textContent=s.t.toFixed(2)+' s';
  $('pillXAB').textContent=sign(s.xAB,2)+' m'; $('pillVAB').textContent=sign(s.vAB,1)+' m/s'; $('pillVBA').textContent=sign(s.vBA,1)+' m/s';
  const cv=$('relativeCanvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height; ctx.clearRect(0,0,W,H); ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H);
  const xmin=-30,xmax=30, X=x=>70+(x-xmin)/(xmax-xmin)*(W-140), y=250;
  ctx.strokeStyle='#684453'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(60,y); ctx.lineTo(W-60,y); ctx.stroke();
  for(let x=-25;x<=25;x+=5){ let sx=X(x); ctx.strokeStyle='#e7bfd0'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(sx,y-10); ctx.lineTo(sx,y+10); ctx.stroke(); ctx.fillStyle='#846a75'; ctx.font='12px Trebuchet MS'; ctx.textAlign='center'; ctx.fillText(String(x),sx,y+28); }
  const ax=clamp(X(s.xAObs),80,W-80), bx=clamp(X(s.xBObs),80,W-80);
  ctx.fillStyle='#ca82a0'; ctx.beginPath(); ctx.arc(ax,y-40,18,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#432b36'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle='#684453'; ctx.beginPath(); ctx.arc(bx,y-40,18,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#432b36'; ctx.font='bold 14px Trebuchet MS'; ctx.fillText('A',ax,y-70); ctx.fillText('B',bx,y-70);
  function arrow(x0,yy,v,col,label){ let len=Math.min(95,Math.abs(v)*8), dir=v>=0?1:-1; ctx.strokeStyle=col; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x0,yy); ctx.lineTo(x0+dir*len,yy); ctx.stroke(); ctx.fillStyle=col; ctx.font='13px Trebuchet MS'; ctx.fillText(label+': '+sign(v,1), x0+dir*len+(dir>0?8:-88), yy+4); }
  arrow(ax,y-110,s.vA-s.vObs,'#ca82a0','A'); arrow(bx,y-140,s.vB-s.vObs,'#684453','B');
  $('relPosRead').textContent = `x_A/B = ${s.xA.toFixed(2)} − ${s.xB.toFixed(2)} = ${sign(s.xAB,2)} m`;
  $('relVelRead').textContent = `v_A/B = ${sign(s.vA,1)} − ${sign(s.vB,1)} = ${sign(s.vAB,1)} m/s`;
  if(Math.abs(s.vAB)<1e-10){ $('relMeaning').textContent='Zero relative velocity'; $('relMeaningText').textContent='A and B may still move relative to the ground, but they stay at fixed separation.'; $('relCue').textContent='Equal ground velocities create rest between the objects.'; }
  else if(s.vAB>0){ $('relMeaning').textContent='A moves in the positive direction relative to B'; $('relMeaningText').textContent='Relative to B, A drifts right.'; $('relCue').textContent='Switching to B’s frame makes B the origin, so A’s motion is described entirely by x_A/B and v_A/B.'; }
  else { $('relMeaning').textContent='A moves in the negative direction relative to B'; $('relMeaningText').textContent='Relative to B, A drifts left.'; $('relCue').textContent='Relative motion is not another kind of motion — it is the same motion described from a shifted frame.'; }
}
['relativeObserver','relAX','relBX','relAV','relBV','relTime'].forEach(id=>$(id).addEventListener('input', drawRelative));
$('relEqual').addEventListener('click',()=>{$('relAX').value=18;$('relBX').value=7;$('relAV').value=3;$('relBV').value=3;$('relativeObserver').value='B';$('relTime').value=2;drawRelative();});
$('relDifferent').addEventListener('click',()=>{$('relAX').value=18;$('relBX').value=7;$('relAV').value=5;$('relBV').value=1;$('relativeObserver').value='ground';$('relTime').value=2;drawRelative();});

// ---------- Train Lab ----------
function trainState(){ const vT=+$('train2Vel').value, vPT=+$('pass2Rel').value, t=+$('train2Time').value; return {vT,vPT,vPG:vT+vPT,t}; }
function drawTrain(){
  const s=trainState();
  $('train2VelLabel').textContent=sign(s.vT,1)+' m/s'; $('pass2RelLabel').textContent=sign(s.vPT,1)+' m/s'; $('train2TimeLabel').textContent=s.t.toFixed(2)+' s';
  $('trainPillRel').textContent=sign(s.vPT,1)+' m/s'; $('trainPillGround').textContent=sign(s.vPG,1)+' m/s';
  let regime='right on ground';
  if(Math.abs(s.vPG)<1e-10) regime='stationary on ground'; else if(s.vPG<0) regime='left on ground';
  $('trainPillRegime').textContent=regime;
  const cv=$('trainCanvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height; ctx.clearRect(0,0,W,H); ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H);
  const railY=310; ctx.strokeStyle='#684453'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(60,railY); ctx.lineTo(W-60,railY); ctx.stroke();
  const trainX=180 + s.vT*s.t*8; const tx=clamp(trainX,180,W-180); const px=clamp(tx + s.vPT*s.t*8, 90, W-90);
  ctx.fillStyle='#f4dbe6'; ctx.strokeStyle='#684453'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.roundRect(tx-120, railY-75, 240, 55, 15); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#684453'; ctx.font='bold 16px Trebuchet MS'; ctx.fillText('train',tx,railY-88);
  ctx.fillStyle='#ca82a0'; ctx.beginPath(); ctx.arc(px, railY-45, 13, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle='#432b36'; ctx.stroke();
  ctx.fillStyle='#432b36'; ctx.font='bold 14px Trebuchet MS'; ctx.fillText('passenger',px,railY-97);
  function arrow(x,y,v,col,text){ let len=Math.min(100,Math.abs(v)*7), dir=v>=0?1:-1; ctx.strokeStyle=col; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+dir*len,y); ctx.stroke(); ctx.fillStyle=col; ctx.fillText(text, x+dir*len+(dir>0?8:-115), y+4); }
  arrow(tx,railY-130,s.vT,'#684453','train/G '+sign(s.vT,1)); arrow(px,railY-160,s.vPT,'#ca82a0','pass/train '+sign(s.vPT,1)); arrow(px,railY-190,s.vPG,'#c59767','pass/G '+sign(s.vPG,1));
  $('trainGroundRead').textContent=`${sign(s.vPT,1)} + ${sign(s.vT,1)} = ${sign(s.vPG,1)} m/s`;
  $('trainRegimeRead').textContent = regime;
  $('trainRegimeText').textContent = Math.abs(s.vPG)<1e-10 ? 'The passenger walks backward exactly fast enough to cancel the train’s motion.' : s.vPG<0 ? 'The passenger walks backward faster than the train moves forward, so ground motion is leftward.' : 'Even if the passenger walks backward in the train, the ground motion can still be rightward.';
}
['train2Vel','pass2Rel','train2Time'].forEach(id=>$(id).addEventListener('input', drawTrain));
$('trainSlowBack').addEventListener('click',()=>{$('train2Vel').value=12;$('pass2Rel').value=-2;$('train2Time').value=4;drawTrain();});
$('trainJustStationary').addEventListener('click',()=>{$('train2Vel').value=12;$('pass2Rel').value=-12;$('train2Time').value=2;drawTrain();});
$('trainFastBack').addEventListener('click',()=>{$('train2Vel').value=12;$('pass2Rel').value=-15;$('train2Time').value=2;drawTrain();});

// ---------- Pursuit ----------
function applyPursuitPreset(){
  const p=$('pursuitPreset').value;
  if(p==='cyclist'){ $('pAX').value=0; $('pBX').value=60; $('pAV').value=8; $('pBV').value=5; $('pTime').max=30; }
  else if(p==='opposite'){ $('pAX').value=0; $('pBX').value=100; $('pAV').value=6; $('pBV').value=-4; $('pTime').max=20; }
}
function pursuitState(){
  const xA0=+$('pAX').value, xB0=+$('pBX').value, vA=+$('pAV').value, vB=+$('pBV').value, t=+$('pTime').value;
  const xA=xA0+vA*t, xB=xB0+vB*t, gap=xB-xA, sep=Math.abs(gap), rel=vB-vA;
  let meet=null; if(Math.abs(rel)>1e-10) meet=(xA0-xB0)/rel; if(!(meet>=0)) meet=null;
  return {xA0,xB0,vA,vB,t,xA,xB,gap,sep,rel,meet};
}
function drawPursuit(){
  if($('pursuitPreset').value!=='custom') applyPursuitPreset();
  const s=pursuitState();
  $('pAXLabel').textContent=sign(s.xA0,0)+' m'; $('pBXLabel').textContent=sign(s.xB0,0)+' m'; $('pAVLabel').textContent=sign(s.vA,1)+' m/s'; $('pBVLabel').textContent=sign(s.vB,1)+' m/s'; $('pTimeLabel').textContent=s.t.toFixed(2)+' s';
  $('pillGap').textContent=sign(s.gap,2)+' m'; $('pillSep').textContent=s.sep.toFixed(2)+' m'; $('pillRelVel').textContent=sign(s.rel,1)+' m/s';
  const cv=$('pursuitCanvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height; ctx.clearRect(0,0,W,H); ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H);
  const xmin=-20,xmax=130, X=x=>65+(x-xmin)/(xmax-xmin)*(W-130), y=250;
  ctx.strokeStyle='#684453'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(55,y); ctx.lineTo(W-55,y); ctx.stroke();
  for(let x=0;x<=120;x+=20){ let sx=X(x); ctx.strokeStyle='#e7bfd0'; ctx.lineWidth=1.1; ctx.beginPath(); ctx.moveTo(sx,y-9); ctx.lineTo(sx,y+9); ctx.stroke(); ctx.fillStyle='#846a75'; ctx.font='12px Trebuchet MS'; ctx.textAlign='center'; ctx.fillText(String(x),sx,y+27); }
  let ax=clamp(X(s.xA),70,W-70), bx=clamp(X(s.xB),70,W-70);
  ctx.fillStyle='#ca82a0'; ctx.beginPath(); ctx.arc(ax,y-42,17,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#432b36'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle='#684453'; ctx.beginPath(); ctx.arc(bx,y-42,17,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#432b36'; ctx.font='bold 14px Trebuchet MS'; ctx.fillText('A',ax,y-72); ctx.fillText('B',bx,y-72);
  ctx.strokeStyle='#c59767'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(ax,y-108); ctx.lineTo(bx,y-108); ctx.stroke(); ctx.fillStyle='#c59767'; ctx.fillText('signed gap s', (ax+bx)/2, y-118);
  $('pClosing').textContent = s.rel<0 ? `Gap shrinking at ${Math.abs(s.rel).toFixed(2)} m/s` : s.rel>0 ? `Gap growing at ${Math.abs(s.rel).toFixed(2)} m/s` : 'Constant separation';
  $('pClosingText').textContent = s.rel<0 ? 'Object A is gaining on B.' : s.rel>0 ? 'Object B moves away from A.' : 'The signed gap does not change.';
  $('pMeet').textContent = s.meet!==null ? `t_meet = ${s.meet.toFixed(2)} s` : 'No future meeting in this constant-velocity model';
  $('pRelVelRead').textContent = `v_B/A = ${sign(s.vB,1)} − ${sign(s.vA,1)} = ${sign(s.rel,1)} m/s`;
  if(s.meet!==null && Math.abs(s.t-s.meet)<0.03) $('pCue').textContent='Meeting means the signed gap is zero. That is different from merely having equal velocities.';
  else if(s.rel<0) $('pCue').textContent='A negative value of v_B/A means the gap decreases.';
  else $('pCue').textContent='The sign of the relative velocity already tells you whether the gap opens or closes.';
}
['pursuitPreset','pAX','pBX','pAV','pBV','pTime'].forEach(id=>$(id).addEventListener('input', drawPursuit));
$('pJumpMeet').addEventListener('click',()=>{ const s=pursuitState(); if(s.meet!==null){ $('pTime').value=s.meet; drawPursuit(); } });
$('pReset').addEventListener('click',()=>{ applyPursuitPreset(); $('pTime').value=0; drawPursuit(); });

// ---------- Delayed Start ----------
function delayedState(){
  const vR=+$('dRunner').value, delay=+$('dDelay').value, a=+$('dAccel').value, t=+$('dTime').value;
  const head=vR*delay;
  const xR=head + vR*t;
  const xC=0.5*a*t*t;
  const vC=a*t;
  const gap=xR-xC;
  const tEqual=vR/a;
  const gapAtEqual=head + vR*tEqual - 0.5*a*tEqual*tEqual;
  let catchT=null;
  const A=0.5*a, B=-vR, C=-head;
  const disc=B*B - 4*A*C;
  if(disc>=0){ catchT = (-B + Math.sqrt(disc)) / (2*A); if(!(catchT>=0)) catchT=null; }
  return {vR,delay,a,t,head,xR,xC,vC,gap,tEqual,gapAtEqual,catchT};
}
function drawDelayed(){
  const s=delayedState();
  $('dRunnerLabel').textContent=sign(s.vR,1)+' m/s'; $('dDelayLabel').textContent=s.delay.toFixed(1)+' s'; $('dAccelLabel').textContent=sign(s.a,1)+' m/s²'; $('dTimeLabel').textContent=s.t.toFixed(2)+' s';
  $('dHeadStart').textContent=s.head.toFixed(2)+' m'; $('dGapPill').textContent=sign(s.gap,2)+' m'; $('dCyclistVelPill').textContent=sign(s.vC,2)+' m/s';
  const cv=$('delayedCanvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height; ctx.clearRect(0,0,W,H); ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H);
  const xmax=Math.max(70, s.xR, s.catchT? s.head+s.vR*s.catchT:0)+10, xmin=-5, X=x=>70+(x-xmin)/(xmax-xmin)*(W-140), y=250;
  ctx.strokeStyle='#684453'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(60,y); ctx.lineTo(W-60,y); ctx.stroke();
  const rx=clamp(X(s.xR),80,W-80), cx=clamp(X(s.xC),80,W-80);
  ctx.fillStyle='#684453'; ctx.beginPath(); ctx.arc(rx,y-42,17,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#432b36'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle='#ca82a0'; ctx.beginPath(); ctx.arc(cx,y-42,17,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#432b36'; ctx.font='bold 14px Trebuchet MS'; ctx.fillText('runner',rx,y-75); ctx.fillText('cyclist',cx,y-75);
  ctx.strokeStyle='#c59767'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx,y-115); ctx.lineTo(rx,y-115); ctx.stroke(); ctx.fillStyle='#c59767'; ctx.fillText('gap', (cx+rx)/2, y-125);
  ctx.fillStyle='#846a75'; ctx.font='13px Trebuchet MS'; ctx.fillText(`runner head start at cyclist start: ${s.head.toFixed(2)} m`,70,45); ctx.fillText(`shared clock: t = 0 at cyclist start`,70,66);
  $('dVelMatch').textContent = `t = ${s.tEqual.toFixed(2)} s ; gap = ${s.gapAtEqual.toFixed(2)} m`;
  $('dVelMatchText').textContent = 'At this instant the runner and cyclist have equal velocities, but they are not yet at the same position.';
  $('dCatchRead').textContent = s.catchT!==null ? `t = ${s.catchT.toFixed(2)} s after cyclist start` : 'No catch';
  $('dCatchText').textContent = s.catchT!==null ? `That is ${(s.catchT+s.delay).toFixed(2)} s after the runner first passes.` : 'With these values the cyclist never catches the runner.';
  $('dState').textContent = `x_runner=${s.xR.toFixed(2)} m, x_cyclist=${s.xC.toFixed(2)} m`;
  $('dStateText').textContent = Math.abs(s.t-s.tEqual)<0.03 ? 'Equal velocities now. The gap is at its maximum.' : s.catchT!==null && Math.abs(s.t-s.catchT)<0.03 ? 'Equal positions now. The cyclist catches the runner.' : s.t<s.tEqual ? 'Before equal velocities, the runner keeps pulling away.' : 'After equal velocities, the cyclist closes the gap.';
}
['dRunner','dDelay','dAccel','dTime'].forEach(id=>$(id).addEventListener('input', drawDelayed));
$('dEqualVel').addEventListener('click',()=>{ $('dTime').value=delayedState().tEqual; drawDelayed(); });
$('dCatch').addEventListener('click',()=>{ const s=delayedState(); if(s.catchT!==null){ $('dTime').value=s.catchT; drawDelayed(); } });

// ---------- Graph View ----------
function graphScenarioData(){
  const type=$('graphScenario').value;
  if(type==='playground'){
    const s=relState();
    return {
      labelA:'A', labelB:'B', T:10,
      xA:t => s.xA0 + s.vA*t,
      xB:t => s.xB0 + s.vB*t,
      vA:t => s.vA,
      vB:t => s.vB,
      gap0: s.xB0 - s.xA0,
      rel: t => s.vB - s.vA,
      note:'Relative playground'
    };
  } else if(type==='pursuit'){
    const s=pursuitState();
    return {
      labelA:'A', labelB:'B', T:Math.max(20, s.meet? s.meet*1.3:20),
      xA:t => s.xA0 + s.vA*t,
      xB:t => s.xB0 + s.vB*t,
      vA:t => s.vA,
      vB:t => s.vB,
      gap0: s.xB0 - s.xA0,
      rel: t => s.vB - s.vA,
      note:'Constant-velocity pursuit'
    };
  } else {
    const s=delayedState();
    return {
      labelA:'cyclist', labelB:'runner', T:Math.max(8, s.catchT? s.catchT*1.2:8),
      xA:t => 0.5*s.a*t*t,
      xB:t => s.head + s.vR*t,
      vA:t => s.a*t,
      vB:t => s.vR,
      gap0: s.head,
      rel: t => s.vR - s.a*t,
      note:'Delayed-start pursuit'
    };
  }
}
function drawGraphs(){
  const G=graphScenarioData();
  $('graphTime').max = G.T.toFixed(2);
  let t=clamp(+$('graphTime').value,0,G.T); $('graphTime').value=t; $('graphTimeLabel').textContent=t.toFixed(2)+' s';
  const xA=G.xA(t), xB=G.xB(t), vA=G.vA(t), vB=G.vB(t), gap=xB-xA, rel=G.rel(t);
  // position graph
  {
    const cv=$('graphPosCanvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height,m={l:68,r:25,t:20,b:42};
    let ymin=Infinity,ymax=-Infinity; for(let i=0;i<=300;i++){ let tt=G.T*i/300, ya=G.xA(tt), yb=G.xB(tt); ymin=Math.min(ymin,ya,yb); ymax=Math.max(ymax,ya,yb);} if(ymax-ymin<1){ymin-=1;ymax+=1;} const pad=0.15*(ymax-ymin); ymin-=pad; ymax+=pad;
    const {X,Y}=drawAxes(ctx,W,H,m,0,G.T,ymin,ymax,'t (s)','position');
    ctx.strokeStyle='#ca82a0'; ctx.lineWidth=3; ctx.beginPath(); for(let i=0;i<=300;i++){ let tt=G.T*i/300, yy=G.xA(tt); i?ctx.lineTo(X(tt),Y(yy)):ctx.moveTo(X(tt),Y(yy)); } ctx.stroke();
    ctx.strokeStyle='#684453'; ctx.beginPath(); for(let i=0;i<=300;i++){ let tt=G.T*i/300, yy=G.xB(tt); i?ctx.lineTo(X(tt),Y(yy)):ctx.moveTo(X(tt),Y(yy)); } ctx.stroke();
    ctx.fillStyle='#fff'; ctx.strokeStyle='#432b36'; ctx.lineWidth=2; [ [xA,'#ca82a0'],[xB,'#684453'] ].forEach((arr,idx)=>{});
    ctx.fillStyle='#fff'; ctx.strokeStyle='#432b36'; ctx.beginPath(); ctx.arc(X(t),Y(xA),5,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(X(t),Y(xB),5,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle='#c59767'; ctx.setLineDash([6,5]); ctx.beginPath(); ctx.moveTo(X(t),Y(xA)); ctx.lineTo(X(t),Y(xB)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#684453'; ctx.font='12px Trebuchet MS'; ctx.fillText(G.labelA, W-120, 30); ctx.fillText(G.labelB, W-120, 48);
  }
  // velocity graph
  {
    const cv=$('graphVelCanvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height,m={l:68,r:25,t:20,b:42};
    let ymin=Infinity,ymax=-Infinity; for(let i=0;i<=300;i++){ let tt=G.T*i/300, ya=G.vA(tt), yb=G.vB(tt); ymin=Math.min(ymin,ya,yb); ymax=Math.max(ymax,ya,yb);} if(ymax-ymin<1){ymin-=1;ymax+=1;} const pad=0.18*(ymax-ymin); ymin-=pad; ymax+=pad;
    const {X,Y}=drawAxes(ctx,W,H,m,0,G.T,ymin,ymax,'t (s)','velocity');
    ctx.strokeStyle='#ca82a0'; ctx.lineWidth=3; ctx.beginPath(); for(let i=0;i<=300;i++){ let tt=G.T*i/300, yy=G.vA(tt); i?ctx.lineTo(X(tt),Y(yy)):ctx.moveTo(X(tt),Y(yy)); } ctx.stroke();
    ctx.strokeStyle='#684453'; ctx.beginPath(); for(let i=0;i<=300;i++){ let tt=G.T*i/300, yy=G.vB(tt); i?ctx.lineTo(X(tt),Y(yy)):ctx.moveTo(X(tt),Y(yy)); } ctx.stroke();
    ctx.fillStyle='#fff'; ctx.strokeStyle='#432b36'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(X(t),Y(vA),5,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(X(t),Y(vB),5,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle='#c59767'; ctx.setLineDash([6,5]); ctx.beginPath(); ctx.moveTo(X(t),Y(vA)); ctx.lineTo(X(t),Y(vB)); ctx.stroke(); ctx.setLineDash([]);
  }
  // relative velocity + area
  {
    const cv=$('graphRelCanvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height,m={l:68,r:25,t:20,b:42};
    let ymin=Infinity,ymax=-Infinity; for(let i=0;i<=300;i++){ let tt=G.T*i/300, yy=G.rel(tt); ymin=Math.min(ymin,yy); ymax=Math.max(ymax,yy);} if(ymax-ymin<1){ymin-=1;ymax+=1;} const pad=0.18*(ymax-ymin); ymin-=pad; ymax+=pad;
    const {X,Y}=drawAxes(ctx,W,H,m,0,G.T,ymin,ymax,'t (s)','v_B/A');
    if($('graphShowArea').checked){
      ctx.fillStyle='rgba(202,130,160,.18)'; ctx.beginPath(); ctx.moveTo(X(0),Y(0));
      for(let i=0;i<=220;i++){ let tt=t*i/220; ctx.lineTo(X(tt),Y(G.rel(tt))); }
      ctx.lineTo(X(t),Y(0)); ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle='#c59767'; ctx.lineWidth=3; ctx.beginPath(); for(let i=0;i<=300;i++){ let tt=G.T*i/300, yy=G.rel(tt); i?ctx.lineTo(X(tt),Y(yy)):ctx.moveTo(X(tt),Y(yy)); } ctx.stroke();
    ctx.fillStyle='#fff'; ctx.strokeStyle='#432b36'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(X(t),Y(rel),5,0,Math.PI*2); ctx.fill(); ctx.stroke();
  }
  let deltaGap;
  if(G.note==='Delayed-start pursuit') deltaGap = G.gap0 + vB*t - xA - G.gap0; else deltaGap = G.rel(0)*t; // works for const rel, but use general calc below
  // general integral approx
  let area=0, N=400, dt=t/N; for(let i=0;i<N;i++){ let tm=(i+0.5)*dt; area += G.rel(tm)*dt; }
  $('graphGapRead').textContent = `s(t) = ${gap.toFixed(2)} m`;
  $('graphRelRead').textContent = `v_B/A = ${sign(rel,2)} m/s`;
  $('graphAreaRead').textContent = `Δs = ${area.toFixed(2)} m`;
  $('graphCue').textContent = gap===0 ? 'Intersection on the position-time graph means equal positions at the same time.' : Math.abs(rel)<0.03 ? 'Equal slopes on the position graph mean equal velocities, so the gap is momentarily not changing.' : 'The relative-velocity graph compresses the whole pursuit question into one line: its sign tells you whether the gap opens or closes.';
}
['graphScenario','graphTime','graphShowArea'].forEach(id=>$(id).addEventListener('input', drawGraphs));

function updateAll(){ drawFrame(); drawRelative(); drawTrain(); drawPursuit(); drawDelayed(); drawGraphs(); }

// initialize presets
$('pursuitPreset').value='cyclist'; applyPursuitPreset();
updateAll();
