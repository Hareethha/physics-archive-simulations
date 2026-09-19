
const $ = id => document.getElementById(id);
const tabs = document.querySelectorAll('.tab');
const panes = document.querySelectorAll('.tabpane');
let activeTab = 'independent';
let playing = false;
let animationFrame = null;
let lastAnimationStamp = null;
const timeSliderByTab = {
  independent:'indTime',
  builder:'bTime',
  horizontal:'hTime',
  angle:'aTime',
  unequal:'uTime',
  graphs:'gTime'
};
const tabNames = {
  independent:'Independent Components',
  builder:'Projectile Builder',
  horizontal:'Horizontal Launch',
  angle:'Angle & Range',
  unequal:'Unequal Heights',
  graphs:'Graph Lab'
};
function setTab(name){
  stopAnimation();
  activeTab=name;
  tabs.forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
  panes.forEach(p=>p.classList.toggle('hidden',p.id!==name));
  $('transportMode').textContent=tabNames[name]||name;
  updateAll();
  updateEquationPanel();
}
tabs.forEach(btn=>btn.addEventListener('click',()=>setTab(btn.dataset.tab)));
const gfmt = n => (Math.abs(n)<1e-10? '0.00' : n.toFixed(2));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function sign(n,d=2){return (n>=0?'+':'−')+Math.abs(n).toFixed(d)}

function components(v0,deg){const th=deg*Math.PI/180; return {vx:v0*Math.cos(th), vy:v0*Math.sin(th), th};}
function timeToY(y0, vy0, g, yTarget=0){
  // yTarget = y0 + vy0 t - 1/2 g t^2
  const a = -0.5*g, b = vy0, c = y0 - yTarget;
  const disc = b*b - 4*a*c;
  if(disc < 0) return null;
  const r1 = (-b + Math.sqrt(disc)) / (2*a);
  const r2 = (-b - Math.sqrt(disc)) / (2*a);
  const good=[r1,r2].filter(v=>v>=-1e-9).sort((a,b)=>a-b);
  return good.length?good[good.length-1]:null;
}
function drawAxes(ctx,W,H,m,xmin,xmax,ymin,ymax,xlab,ylab){
  ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#f3dde6';ctx.lineWidth=1;
  for(let i=0;i<=8;i++){let x=m.l+i*(W-m.l-m.r)/8;ctx.beginPath();ctx.moveTo(x,m.t);ctx.lineTo(x,H-m.b);ctx.stroke();}
  for(let i=0;i<=5;i++){let y=m.t+i*(H-m.t-m.b)/5;ctx.beginPath();ctx.moveTo(m.l,y);ctx.lineTo(W-m.r,y);ctx.stroke();}
  const X=x=>m.l+(x-xmin)/(xmax-xmin)*(W-m.l-m.r), Y=y=>H-m.b-(y-ymin)/(ymax-ymin)*(H-m.t-m.b);
  ctx.strokeStyle='#664151';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(m.l,m.t);ctx.lineTo(m.l,H-m.b);ctx.lineTo(W-m.r,H-m.b);ctx.stroke();
  ctx.fillStyle='#664151';ctx.font='bold 15px Trebuchet MS';ctx.fillText(xlab,W-52,H-12);ctx.save();ctx.translate(20,H/2);ctx.rotate(-Math.PI/2);ctx.fillText(ylab,0,0);ctx.restore();
  return {X,Y};
}
function drawArrow(ctx,x1,y1,x2,y2,col,label){
  ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  const ang=Math.atan2(y2-y1,x2-x1), ah=8;
  ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-ah*Math.cos(ang-Math.PI/6), y2-ah*Math.sin(ang-Math.PI/6));ctx.lineTo(x2-ah*Math.cos(ang+Math.PI/6), y2-ah*Math.sin(ang+Math.PI/6));ctx.closePath();ctx.fill();
  if(label){ctx.font='13px Trebuchet MS';ctx.fillText(label,x2+8,y2+4)}
}

// Independent components
function indState(){
  const h=+$('indHeight').value, vx=+$('indVx').value, g=+$('indG').value, t=+$('indTime').value;
  const tLand=Math.sqrt(2*h/g), y=Math.max(0,h-0.5*g*t*t), x=vx*t;
  return {h,vx,g,t,tLand,y,x};
}
function drawIndependent(){
  const s=indState();
  $('indHeightLabel').textContent=gfmt(s.h)+' m'; $('indVxLabel').textContent=gfmt(s.vx)+' m/s'; $('indGLabel').textContent=gfmt(s.g)+' m/s²'; $('indTimeLabel').textContent=gfmt(s.t)+' s';
  $('indBallA').textContent=`(0, ${gfmt(s.y)})`; $('indBallB').textContent=`(${gfmt(s.x)}, ${gfmt(s.y)})`; $('indVerticalSame').textContent='same y';
  $('indYRead').textContent=`y_A = y_B = ${gfmt(s.h)} − ½(${gfmt(s.g)})(${gfmt(s.t)})² = ${gfmt(s.y)} m`;
  $('indXRead').textContent=`x_A = 0, x_B = (${gfmt(s.vx)})(${gfmt(s.t)}) = ${gfmt(s.x)} m`;
  const cv=$('indCanvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height; const m={l:65,r:30,t:25,b:45};
  const xmax=Math.max(8,s.vx*s.tLand*1.15), {X,Y}=drawAxes(ctx,W,H,m,0,xmax,0,Math.max(s.h*1.1,2),'x','y');
  const ypix=Y(s.y); const xB=X(s.x), xA=X(0.6);
  // ledge
  ctx.strokeStyle='#664151'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(X(0),Y(s.h)); ctx.lineTo(X(Math.max(1,xmax*0.15)),Y(s.h)); ctx.stroke();
  ctx.fillStyle='#ca7b9c'; ctx.beginPath(); ctx.arc(xA,ypix,10,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#432b35'; ctx.stroke();
  ctx.fillStyle='#664151'; ctx.fillText('A',xA-4,ypix-16);
  ctx.fillStyle='#c69a67'; ctx.beginPath(); ctx.arc(xB,ypix,10,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#432b35'; ctx.stroke();
  ctx.fillStyle='#664151'; ctx.fillText('B',xB-4,ypix-16);
  ctx.setLineDash([6,5]); ctx.strokeStyle='#c69a67'; ctx.beginPath(); ctx.moveTo(xA,ypix); ctx.lineTo(xB,ypix); ctx.stroke(); ctx.setLineDash([]);
  drawArrow(ctx,xB,ypix-24,xB+35,ypix-24,'#c69a67','v₀ₓ');
}
['indHeight','indVx','indG','indTime'].forEach(id=>$(id).addEventListener('input',drawIndependent));
$('indReset').addEventListener('click',()=>{$('indHeight').value=10;$('indVx').value=8;$('indG').value=9.8;$('indTime').value=0.8;drawIndependent();});
$('indLanding').addEventListener('click',()=>{$('indTime').value=indState().tLand;drawIndependent();});

// Builder
function builderState(){
  const v0=+$('bV0').value, th=+$('bTheta').value, y0=+$('bY0').value, g=+$('bG').value, t=+$('bTime').value;
  const c=components(v0,th); const tFlight=timeToY(y0,c.vy,g,0); const tUse=Math.min(t, tFlight??t);
  const x=c.vx*tUse, y=y0+c.vy*tUse-0.5*g*tUse*tUse, vy=c.vy-g*tUse, speed=Math.hypot(c.vx,vy), tTop=c.vy/g;
  return {v0,th,y0,g,t:tUse,tRaw:t,c,tFlight,x,y,vy,speed,tTop};
}
function drawBuilder(){
  const s=builderState(); $('bTime').max=(Math.max(1,s.tFlight??5)).toFixed(2);
  $('bV0Label').textContent=gfmt(s.v0)+' m/s'; $('bThetaLabel').textContent=gfmt(s.th)+'°'; $('bY0Label').textContent=gfmt(s.y0)+' m'; $('bGLabel').textContent=gfmt(s.g)+' m/s²'; $('bTimeLabel').textContent=gfmt(s.t)+' s';
  $('bVxPill').textContent=gfmt(s.c.vx)+' m/s'; $('bVyPill').textContent=gfmt(s.c.vy)+' m/s'; $('bSpeedPill').textContent=gfmt(s.speed)+' m/s';
  $('bPosRead').textContent=`x = ${gfmt(s.x)} m, y = ${gfmt(s.y)} m`;
  $('bVelRead').textContent=`vₓ = ${gfmt(s.c.vx)} m/s, vᵧ = ${gfmt(s.vy)} m/s`;
  $('bEqRead').textContent=`x = v₀ₓt, y = y₀ + v₀ᵧt − ½gt²`;
  const cv=$('builderCanvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height; const m={l:65,r:25,t:25,b:45};
  const xmax=Math.max(10,(s.c.vx*(s.tFlight||2))*1.1+2), ymax=Math.max(5, s.y0 + (s.c.vy*s.c.vy)/(2*s.g) + 2);
  const {X,Y}=drawAxes(ctx,W,H,m,0,xmax,0,ymax,'x','y');
  ctx.strokeStyle='#ca7b9c'; ctx.lineWidth=3; ctx.beginPath();
  for(let i=0;i<=220;i++){ let tt=(s.tFlight||2)*i/220; let xx=s.c.vx*tt, yy=s.y0+s.c.vy*tt-0.5*s.g*tt*tt; yy=Math.max(0,yy); i?ctx.lineTo(X(xx),Y(yy)):ctx.moveTo(X(xx),Y(yy)); }
  ctx.stroke();
  const px=X(s.x), py=Y(Math.max(0,s.y)); ctx.fillStyle='#ca7b9c'; ctx.beginPath(); ctx.arc(px,py,10,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#432b35'; ctx.stroke();
  drawArrow(ctx,px,py,px+clamp(s.c.vx*4,-70,70),py,'#c69a67','vₓ');
  drawArrow(ctx,px,py,px,py-clamp(s.vy*4,-70,70),'#664151','vᵧ');
  drawArrow(ctx,px,py,px+clamp(s.c.vx*3,-60,60),py-clamp(s.vy*3,-60,60),'#b46b8b','v');
  drawArrow(ctx,px,py,px,py+45,'#8b8b8b','a');
}
['bV0','bTheta','bY0','bG','bTime'].forEach(id=>$(id).addEventListener('input',drawBuilder));
$('bReset').addEventListener('click',()=>{$('bV0').value=20;$('bTheta').value=35;$('bY0').value=0;$('bG').value=9.8;$('bTime').value=1.1;drawBuilder();});
$('bApex').addEventListener('click',()=>{$('bTime').value=builderState().tTop;drawBuilder();});

// Horizontal launch
function horizontalState(){
  const vx=+$('hVx').value,h=+$('hHeight').value,g=+$('hG').value,t=+$('hTime').value; const tF=Math.sqrt(2*h/g); const tu=Math.min(t,tF);
  const x=vx*tu, y=h-0.5*g*tu*tu, vy=-g*tu, speed=Math.hypot(vx,vy); const ang=Math.atan2(Math.abs(vy),vx)*180/Math.PI;
  return {vx,h,g,t:tu,tF,x,y,vy,speed,ang};
}
function drawHorizontal(){
  const s=horizontalState(); $('hTime').max=(s.tF+0.2).toFixed(2);
  $('hVxLabel').textContent=gfmt(s.vx)+' m/s'; $('hHeightLabel').textContent=gfmt(s.h)+' m'; $('hGLabel').textContent=gfmt(s.g)+' m/s²'; $('hTimeLabel').textContent=gfmt(s.t)+' s';
  $('hTimePill').textContent=gfmt(s.tF)+' s'; $('hRangePill').textContent=gfmt(s.vx*s.tF)+' m'; $('hImpactPill').textContent=gfmt(Math.hypot(s.vx,-s.g*s.tF))+' m/s';
  $('hStep1').textContent=`t = √(2h/g) = √(2·${gfmt(s.h)}/${gfmt(s.g)}) = ${gfmt(s.tF)} s`;
  $('hStep2').textContent=`Δx = vₓt = (${gfmt(s.vx)})(${gfmt(s.tF)}) = ${gfmt(s.vx*s.tF)} m`;
  $('hStep3').textContent=`vₓ = ${gfmt(s.vx)} m/s, vᵧ = ${gfmt(-s.g*s.tF)} m/s, |v| = ${gfmt(Math.hypot(s.vx,-s.g*s.tF))} m/s`;
  const cv=$('horizontalCanvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height; const m={l:65,r:25,t:25,b:45};
  const range=s.vx*s.tF, xmax=Math.max(4,range*1.25), ymax=Math.max(2,s.h*1.3);
  const {X,Y}=drawAxes(ctx,W,H,m,0,xmax,0,ymax,'x','y');
  ctx.strokeStyle='#664151'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(X(0),Y(s.h)); ctx.lineTo(X(Math.max(.4,xmax*.2)),Y(s.h)); ctx.stroke();
  ctx.strokeStyle='#ca7b9c'; ctx.lineWidth=3; ctx.beginPath();
  for(let i=0;i<=200;i++){ let tt=s.tF*i/200, xx=s.vx*tt, yy=s.h-0.5*s.g*tt*tt; yy=Math.max(0,yy); i?ctx.lineTo(X(xx),Y(yy)):ctx.moveTo(X(xx),Y(yy)); }
  ctx.stroke();
  const px=X(s.x), py=Y(Math.max(0,s.y)); ctx.fillStyle='#ca7b9c'; ctx.beginPath(); ctx.arc(px,py,10,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#432b35'; ctx.stroke();
  drawArrow(ctx,px,py,px+40,py,'#c69a67','vₓ'); drawArrow(ctx,px,py,px,py+clamp(s.g*s.t*5,-70,70),'#664151','vᵧ');
}
['hVx','hHeight','hG','hTime'].forEach(id=>$(id).addEventListener('input',drawHorizontal));
$('hReset').addEventListener('click',()=>{$('hVx').value=3.0;$('hHeight').value=1.25;$('hG').value=9.8;$('hTime').value=0.3;drawHorizontal();});
$('hLanding').addEventListener('click',()=>{$('hTime').value=horizontalState().tF;drawHorizontal();});

// Angle & range
function angleState(){
  const v0=+$('aV0').value, th=+$('aTheta').value, g=+$('aG').value, t=+$('aTime').value, compare=$('aCompare').checked;
  const c=components(v0,th); const T=2*c.vy/g, H=(c.vy*c.vy)/(2*g), R=c.vx*T, tTop=c.vy/g;
  const tc=Math.min(t,T), x=c.vx*tc, y=c.vy*tc-0.5*g*tc*tc, vy=c.vy-g*tc;
  const thc=90-th; const cc=components(v0,thc); const Tc=2*cc.vy/g, Hc=(cc.vy*cc.vy)/(2*g), Rc=cc.vx*Tc;
  return {v0,th,g,t:tc,compare,c,T,H,R,tTop,x,y,vy,thc,cc,Tc,Hc,Rc};
}
function drawAngle(){
  const s=angleState(); $('aTime').max=(Math.max(s.T,s.Tc)+0.2).toFixed(2);
  $('aV0Label').textContent=gfmt(s.v0)+' m/s'; $('aThetaLabel').textContent=gfmt(s.th)+'°'; $('aGLabel').textContent=gfmt(s.g)+' m/s²'; $('aTimeLabel').textContent=gfmt(s.t)+' s';
  $('aRangePill').textContent=gfmt(s.R)+' m'; $('aHeightPill').textContent=gfmt(s.H)+' m'; $('aFlightPill').textContent=gfmt(s.T)+' s';
  $('aTopRead').textContent=`At the top: vᵧ = 0, vₓ = ${gfmt(s.c.vx)} m/s, so speed = ${gfmt(Math.abs(s.c.vx))} m/s`;
  $('aCompRead').textContent=`${gfmt(s.th)}° and ${gfmt(s.thc)}°`; $('aCompText').textContent = s.compare ? `These complementary angles have the same range ${gfmt(s.R)} m when launch and landing heights are equal, but their heights and flight times differ.` : 'Turn on the comparison to see complementary angles side by side.';
  $('aFormulaRead').textContent=`T = 2v₀sinθ/g, H = v₀²sin²θ/(2g), R = v₀²sin2θ/g`;
  const cv=$('angleCanvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height; const m={l:65,r:25,t:25,b:45};
  const xmax=Math.max(s.R,s.Rc)*1.1+2, ymax=Math.max(s.H,s.Hc)*1.15+2; const {X,Y}=drawAxes(ctx,W,H,m,0,Math.max(5,xmax),0,Math.max(4,ymax),'x','y');
  function plot(vx,vy,T,col){ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=220;i++){let tt=T*i/220,xx=vx*tt,yy=vy*tt-0.5*s.g*tt*tt;i?ctx.lineTo(X(xx),Y(yy)):ctx.moveTo(X(xx),Y(yy));}ctx.stroke();}
  plot(s.c.vx,s.c.vy,s.T,'#ca7b9c'); if(s.compare) plot(s.cc.vx,s.cc.vy,s.Tc,'#c69a67');
  const px=X(s.x), py=Y(Math.max(0,s.y)); ctx.fillStyle='#ca7b9c'; ctx.beginPath(); ctx.arc(px,py,10,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#432b35'; ctx.stroke();
  drawArrow(ctx,px,py,px+clamp(s.c.vx*3,-60,60),py,'#c69a67','vₓ'); drawArrow(ctx,px,py,px,py-clamp(s.vy*3,-60,60),'#664151','vᵧ');
  ctx.fillStyle='#664151'; ctx.font='13px Trebuchet MS'; ctx.fillText(`${s.th}°`, X(0.5), Y(0.4)); if(s.compare) ctx.fillText(`${s.thc}°`,X(0.5),Y(1.4));
}
['aV0','aTheta','aG','aTime','aCompare'].forEach(id=>$(id).addEventListener('input',drawAngle));
$('aReset').addEventListener('click',()=>{$('aV0').value=20;$('aTheta').value=30;$('aG').value=9.8;$('aTime').value=0.7;$('aCompare').checked=true;drawAngle();});
$('aApex').addEventListener('click',()=>{$('aTime').value=angleState().tTop;drawAngle();});

// Unequal heights
function unequalState(){
  const vx=+$('uVx').value, vy0=+$('uVy').value, h=+$('uHeight').value, g=+$('uG').value, t=+$('uTime').value;
  const tTop=vy0/g; const tReturn=2*vy0/g; const tGround=timeToY(0,vy0,g,-h); const tu=Math.min(t,tGround??t);
  const x=vx*tu, y=vy0*tu-0.5*g*tu*tu, vy=vy0-g*tu; const range=vx*(tGround||0); const speed=Math.hypot(vx, vy0-g*(tGround||0));
  return {vx,vy0,h,g,t:tu,tTop,tReturn,tGround,x,y,vy,range,speed};
}
function drawUnequal(){
  const s=unequalState(); $('uTime').max=(Math.max(4,s.tGround||4)+0.2).toFixed(2);
  $('uVxLabel').textContent=gfmt(s.vx)+' m/s'; $('uVyLabel').textContent=gfmt(s.vy0)+' m/s'; $('uHeightLabel').textContent=gfmt(s.h)+' m'; $('uGLabel').textContent=gfmt(s.g)+' m/s²'; $('uTimeLabel').textContent=gfmt(s.t)+' s';
  $('uTopPill').textContent=gfmt(s.tTop)+' s'; $('uReturnPill').textContent=gfmt(s.tReturn)+' s'; $('uGroundPill').textContent=gfmt(s.tGround)+' s';
  $('uEventRead').textContent = s.t < s.tTop ? 'Before the top' : s.t < s.tReturn ? 'After the top but still above launch height' : s.t < s.tGround ? 'Below launch height, still in flight' : 'Ground impact';
  $('uImpactRead').textContent = `Range = ${gfmt(s.range)} m, impact speed ≈ ${gfmt(Math.hypot(s.vx, s.vy0 - s.g*s.tGround))} m/s`;
  const cv=$('unequalCanvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height; const m={l:65,r:25,t:25,b:45};
  const xmax=Math.max(8,s.range*1.1+2), ymax=Math.max(5, s.h + (s.vy0*s.vy0)/(2*s.g) + 2); const {X,Y}=drawAxes(ctx,W,H,m,0,xmax,-s.h*1.1,ymax,'x','y');
  // cliff
  ctx.strokeStyle='#664151'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(0.5),Y(0)); ctx.moveTo(X(0),Y(0)); ctx.lineTo(X(0),Y(-s.h)); ctx.lineTo(X(xmax),Y(-s.h)); ctx.stroke();
  ctx.strokeStyle='#ca7b9c'; ctx.lineWidth=3; ctx.beginPath(); for(let i=0;i<=220;i++){let tt=s.tGround*i/220, xx=s.vx*tt, yy=s.vy0*tt-0.5*s.g*tt*tt; if(i===0) ctx.moveTo(X(xx),Y(yy)); else ctx.lineTo(X(xx),Y(yy));} ctx.stroke();
  const px=X(s.x), py=Y(s.y); ctx.fillStyle='#ca7b9c'; ctx.beginPath(); ctx.arc(px,py,10,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#432b35'; ctx.stroke();
  drawArrow(ctx,px,py,px+clamp(s.vx*3,-60,60),py,'#c69a67','vₓ'); drawArrow(ctx,px,py,px,py-clamp(s.vy*3,-60,60),'#664151','vᵧ');
}
['uVx','uVy','uHeight','uG','uTime'].forEach(id=>$(id).addEventListener('input',drawUnequal));
$('uReset').addEventListener('click',()=>{$('uVx').value=14.7;$('uVy').value=9.8;$('uHeight').value=19.6;$('uG').value=9.8;$('uTime').value=1.0;drawUnequal();});
$('uLanding').addEventListener('click',()=>{$('uTime').value=unequalState().tGround;drawUnequal();});

// Graph lab
function graphScenario(){
  const s=$('gScenario').value;
  if(s==='builder'){
    const b=builderState(); return {name:'Projectile Builder', T:b.tFlight||3, x:t=>b.c.vx*t, y:t=>b.y0+b.c.vy*t-0.5*b.g*t*t, vx:t=>b.c.vx, vy:t=>b.c.vy-b.g*t, ax:t=>0, ay:t=>-b.g};
  }
  if(s==='horizontal'){
    const h=horizontalState(); return {name:'Horizontal Launch', T:h.tF, x:t=>h.vx*t, y:t=>h.h-0.5*h.g*t*t, vx:t=>h.vx, vy:t=>-h.g*t, ax:t=>0, ay:t=>-h.g};
  }
  if(s==='angle'){
    const a=angleState(); return {name:'Angle & Range', T:a.T, x:t=>a.c.vx*t, y:t=>a.c.vy*t-0.5*a.g*t*t, vx:t=>a.c.vx, vy:t=>a.c.vy-a.g*t, ax:t=>0, ay:t=>-a.g};
  }
  const u=unequalState(); return {name:'Unequal Heights', T:u.tGround, x:t=>u.vx*t, y:t=>u.vy0*t-0.5*u.g*t*t, vx:t=>u.vx, vy:t=>u.vy0-u.g*t, ax:t=>0, ay:t=>-u.g};
}
function drawCurve(canvasId,T,fx,fy,labels){
  const cv=$(canvasId),ctx=cv.getContext('2d'),W=cv.width,H=cv.height; const m={l:65,r:25,t:20,b:40};
  let xmin=0,xmax=T,ymin=Infinity,ymax=-Infinity;
  for(let i=0;i<=280;i++){let t=T*i/280; let y=fy(t); ymin=Math.min(ymin,y); ymax=Math.max(ymax,y);} if(ymax-ymin<1){ymax+=1;ymin-=1;} const pad=.15*(ymax-ymin||1); ymin-=pad; ymax+=pad;
  const {X,Y}=drawAxes(ctx,W,H,m,xmin,xmax,ymin,ymax,labels.x,labels.y);
  ctx.strokeStyle=labels.color||'#ca7b9c'; ctx.lineWidth=3; ctx.beginPath(); for(let i=0;i<=280;i++){let t=T*i/280; let x=fx(t), y=fy(t); i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y));} ctx.stroke();
  return {ctx,X,Y,W,H,m,ymin,ymax};
}
function drawGraphs(){
  const sc=graphScenario(); $('gTime').max=(sc.T+0.1).toFixed(2); const t=clamp(+$('gTime').value,0,sc.T); $('gTime').value=t; $('gTimeLabel').textContent=gfmt(t)+' s';
  // trajectory y vs x
  {
    const cv=$('gTraj'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height; const m={l:65,r:25,t:20,b:40};
    let xmax=0,ymin=Infinity,ymax=-Infinity; for(let i=0;i<=280;i++){let tt=sc.T*i/280,x=sc.x(tt),y=sc.y(tt); xmax=Math.max(xmax,x); ymin=Math.min(ymin,y); ymax=Math.max(ymax,y);} ymin=Math.min(ymin,0); if(ymax-ymin<1){ymax+=1;ymin-=1;} const pad=.15*(ymax-ymin||1); ymin-=pad; ymax+=pad; const {X,Y}=drawAxes(ctx,W,H,m,0,xmax*1.05+1,ymin,ymax,'x','y');
    ctx.strokeStyle='#ca7b9c';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=280;i++){let tt=sc.T*i/280,x=sc.x(tt),y=sc.y(tt);i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y));}ctx.stroke();
    ctx.fillStyle='#ca7b9c';ctx.beginPath();ctx.arc(X(sc.x(t)),Y(sc.y(t)),5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#432b35';ctx.stroke();
  }
  // x vs t
  { const info=drawCurve('gX',sc.T,t=>t,sc.x,{x:'t',y:'x',color:'#c69a67'}); const {ctx,X,Y}=info; ctx.fillStyle='#c69a67';ctx.beginPath();ctx.arc(X(t),Y(sc.x(t)),5,0,Math.PI*2);ctx.fill(); }
  // y vs t
  { const info=drawCurve('gY',sc.T,t=>t,sc.y,{x:'t',y:'y',color:'#ca7b9c'}); const {ctx,X,Y}=info; ctx.fillStyle='#ca7b9c';ctx.beginPath();ctx.arc(X(t),Y(sc.y(t)),5,0,Math.PI*2);ctx.fill(); }
  // v graph
  {
    const cv=$('gV'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height,m={l:65,r:25,t:20,b:40};
    let ymin=Infinity,ymax=-Infinity; for(let i=0;i<=280;i++){let tt=sc.T*i/280; ymin=Math.min(ymin,sc.vx(tt),sc.vy(tt)); ymax=Math.max(ymax,sc.vx(tt),sc.vy(tt));} if(ymax-ymin<1){ymax+=1;ymin-=1;} const pad=.15*(ymax-ymin||1); ymin-=pad; ymax+=pad; const {X,Y}=drawAxes(ctx,W,H,m,0,sc.T,ymin,ymax,'t','v');
    ctx.strokeStyle='#c69a67';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=280;i++){let tt=sc.T*i/280;i?ctx.lineTo(X(tt),Y(sc.vx(tt))):ctx.moveTo(X(tt),Y(sc.vx(tt)));}ctx.stroke();
    ctx.strokeStyle='#664151';ctx.beginPath();for(let i=0;i<=280;i++){let tt=sc.T*i/280;i?ctx.lineTo(X(tt),Y(sc.vy(tt))):ctx.moveTo(X(tt),Y(sc.vy(tt)));}ctx.stroke();
    ctx.fillStyle='#c69a67';ctx.beginPath();ctx.arc(X(t),Y(sc.vx(t)),5,0,Math.PI*2);ctx.fill(); ctx.fillStyle='#664151';ctx.beginPath();ctx.arc(X(t),Y(sc.vy(t)),5,0,Math.PI*2);ctx.fill();
    ctx.font='bold 14px Trebuchet MS';ctx.fillStyle='#c69a67';ctx.fillText('vₓ',W-92,28);ctx.fillStyle='#664151';ctx.fillText('vᵧ',W-52,28);
  }
  // a graph
  {
    const cv=$('gA'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height,m={l:65,r:25,t:20,b:40};
    let ymin=Math.min(sc.ay(0),-0.5)-1, ymax=Math.max(sc.ax(0),0.5)+1; const {X,Y}=drawAxes(ctx,W,H,m,0,sc.T,ymin,ymax,'t','a');
    ctx.strokeStyle='#c69a67';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(0),Y(sc.ax(0)));ctx.lineTo(X(sc.T),Y(sc.ax(sc.T)));ctx.stroke();
    ctx.strokeStyle='#664151';ctx.beginPath();ctx.moveTo(X(0),Y(sc.ay(0)));ctx.lineTo(X(sc.T),Y(sc.ay(sc.T)));ctx.stroke();
    ctx.fillStyle='#c69a67';ctx.beginPath();ctx.arc(X(t),Y(sc.ax(t)),5,0,Math.PI*2);ctx.fill(); ctx.fillStyle='#664151';ctx.beginPath();ctx.arc(X(t),Y(sc.ay(t)),5,0,Math.PI*2);ctx.fill();
    ctx.font='bold 14px Trebuchet MS';ctx.fillStyle='#c69a67';ctx.fillText('aₓ',W-92,28);ctx.fillStyle='#664151';ctx.fillText('aᵧ',W-52,28);
  }
  $('gState').textContent=`${sc.name}: x=${gfmt(sc.x(t))} m, y=${gfmt(sc.y(t))} m, vₓ=${gfmt(sc.vx(t))} m/s, vᵧ=${gfmt(sc.vy(t))} m/s`;
  $('gDistinction').textContent='Trajectory slope gives dy/dx = vᵧ/vₓ';
  $('gArea').textContent=`At this instant, Δx and Δy come from the accumulated areas under vₓ(t) and vᵧ(t).`;
}
['gScenario','gTime'].forEach(id=>$(id).addEventListener('input',drawGraphs));


function currentTimeSlider(){
  return $(timeSliderByTab[activeTab]);
}
function setPlayButton(){
  $('transportPlay').textContent = playing ? '❚❚ Pause' : '▶ Play';
  $('transportPlay').classList.toggle('primary', !playing);
}
function stopAnimation(){
  playing=false;
  lastAnimationStamp=null;
  if(animationFrame!==null){cancelAnimationFrame(animationFrame);animationFrame=null;}
  if($('transportPlay')) setPlayButton();
}
function animationTick(stamp){
  if(!playing) return;
  if(lastAnimationStamp===null) lastAnimationStamp=stamp;
  const dt=Math.min(0.08,(stamp-lastAnimationStamp)/1000);
  lastAnimationStamp=stamp;
  const slider=currentTimeSlider();
  if(!slider){stopAnimation();return;}
  const speed=parseFloat($('transportSpeed').value)||1;
  const min=parseFloat(slider.min)||0, max=parseFloat(slider.max)||1;
  let value=parseFloat(slider.value)||min;
  value += dt*speed;
  if(value>=max){value=max;slider.value=value;slider.dispatchEvent(new Event('input',{bubbles:true}));stopAnimation();return;}
  slider.value=value;
  slider.dispatchEvent(new Event('input',{bubbles:true}));
  animationFrame=requestAnimationFrame(animationTick);
}
$('transportPlay').addEventListener('click',()=>{
  const slider=currentTimeSlider();
  if(!slider) return;
  if(playing){stopAnimation();return;}
  const max=parseFloat(slider.max)||1;
  if(parseFloat(slider.value)>=max-1e-6){slider.value=parseFloat(slider.min)||0;slider.dispatchEvent(new Event('input',{bubbles:true}));}
  playing=true;lastAnimationStamp=null;setPlayButton();animationFrame=requestAnimationFrame(animationTick);
});
$('transportRestart').addEventListener('click',()=>{
  stopAnimation();
  const slider=currentTimeSlider();
  if(slider){slider.value=parseFloat(slider.min)||0;slider.dispatchEvent(new Event('input',{bubbles:true}));}
});
if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  $('transportSpeed').value='0.5';
}

function loadWorkedExample(){
  const ex=$('workedExample').value;
  stopAnimation();
  if(ex==='horizontal-notes'){
    $('hVx').value=3.0;$('hHeight').value=1.25;$('hG').value=9.8;$('hTime').value=0;
    setTab('horizontal');drawHorizontal();
  }else if(ex==='angled-notes'){
    $('aV0').value=20;$('aTheta').value=30;$('aG').value=9.8;$('aTime').value=0;$('aCompare').checked=true;
    setTab('angle');drawAngle();
  }else if(ex==='cliff-notes'){
    $('uVx').value=14.7;$('uVy').value=9.8;$('uHeight').value=19.6;$('uG').value=9.8;$('uTime').value=0;
    setTab('unequal');drawUnequal();
  }
  updateEquationPanel();
}
$('loadExample').addEventListener('click',loadWorkedExample);

function eqCard(label, equation, note=''){
  return `<div class="eq-card"><span class="eq-label">${label}</span><strong>${equation}</strong>${note?`<p>${note}</p>`:''}</div>`;
}
function updateEquationPanel(){
  if(!$('equationBody')) return;
  let title=tabNames[activeTab]||activeTab, cards=[];
  if(activeTab==='independent'){
    const s=indState();
    cards=[
      eqCard('Vertical motion',`y_A = y_B = h − ½gt² = ${gfmt(s.y)} m`,'Same y because both objects have the same vertical initial conditions.'),
      eqCard('Ball A horizontal',`x_A = 0`,'The dropped ball has no horizontal velocity.'),
      eqCard('Ball B horizontal',`x_B = v₀ₓt = ${gfmt(s.x)} m`,'Horizontal speed changes x, not the vertical fall time.')
    ];
  }else if(activeTab==='builder'){
    const s=builderState();
    cards=[
      eqCard('Resolve launch velocity',`v₀ₓ=${gfmt(s.c.vx)} m/s,  v₀ᵧ=${gfmt(s.c.vy)} m/s`),
      eqCard('Position',`x=v₀ₓt=${gfmt(s.x)} m,  y=y₀+v₀ᵧt−½gt²=${gfmt(s.y)} m`),
      eqCard('Velocity',`vₓ=${gfmt(s.c.vx)} m/s,  vᵧ=v₀ᵧ−gt=${gfmt(s.vy)} m/s`)
    ];
  }else if(activeTab==='horizontal'){
    const s=horizontalState();
    cards=[
      eqCard('Vertical determines time',`T=√(2h/g)=${gfmt(s.tF)} s`),
      eqCard('Horizontal range',`R=vₓT=${gfmt(s.vx*s.tF)} m`),
      eqCard('Impact velocity',`vᵧ=−gT=${gfmt(-s.g*s.tF)} m/s, |v|=${gfmt(Math.hypot(s.vx,-s.g*s.tF))} m/s`)
    ];
  }else if(activeTab==='angle'){
    const s=angleState();
    cards=[
      eqCard('Time to top',`t_top=v₀sinθ/g=${gfmt(s.tTop)} s`),
      eqCard('Maximum rise',`H=v₀²sin²θ/(2g)=${gfmt(s.H)} m`),
      eqCard('Equal-height range',`R=v₀²sin(2θ)/g=${gfmt(s.R)} m`,'This shortcut requires equal launch and landing heights.')
    ];
  }else if(activeTab==='unequal'){
    const s=unequalState();
    cards=[
      eqCard('Actual landing event',`−h=v₀ᵧT−½gT²  →  T=${gfmt(s.tGround)} s`),
      eqCard('Range',`R=v₀ₓT=${gfmt(s.range)} m`),
      eqCard('Impact components',`vₓ=${gfmt(s.vx)} m/s,  vᵧ=${gfmt(s.vy0-s.g*s.tGround)} m/s`)
    ];
  }else{
    const sc=graphScenario(), t=parseFloat($('gTime').value)||0;
    cards=[
      eqCard('Trajectory slope', Math.abs(sc.vx(t))<1e-10 ? 'dy/dx is undefined because vₓ = 0' : `dy/dx = vᵧ/vₓ = ${gfmt(sc.vy(t)/sc.vx(t))}`,'This slope gives direction in space, not velocity by itself.'),
      eqCard('Horizontal area',`Δx = ∫vₓdt = ${gfmt(sc.x(t)-sc.x(0))} m`),
      eqCard('Vertical area',`Δy = ∫vᵧdt = ${gfmt(sc.y(t)-sc.y(0))} m`)
    ];
  }
  $('equationTitle').textContent=title;
  $('equationBody').innerHTML=cards.join('');
}
$('equationToggle').addEventListener('click',()=>{
  const panel=$('equationPanel');
  panel.classList.toggle('hidden');
  $('equationToggle').textContent=panel.classList.contains('hidden')?'Show equations':'Hide equations';
  updateEquationPanel();
});
$('equationClose').addEventListener('click',()=>{
  $('equationPanel').classList.add('hidden');
  $('equationToggle').textContent='Show equations';
});
document.addEventListener('input',e=>{
  if(e.target.matches('input,select')) updateEquationPanel();
});

function updateAll(){drawIndependent();drawBuilder();drawHorizontal();drawAngle();drawUnequal();drawGraphs();updateEquationPanel();}
setPlayButton();
updateAll();

