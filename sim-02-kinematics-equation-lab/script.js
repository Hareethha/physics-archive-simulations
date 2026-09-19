
const $=id=>document.getElementById(id);
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));
 document.querySelectorAll(".tabpane").forEach(p=>p.classList.add("hidden"));$(b.dataset.tab).classList.remove("hidden");updateAll();
}));
const eqs=[
 {id:"vf",vars:["vf","vi","a","t"],label:"v_f = v_i + at"},
 {id:"dxvf",vars:["dx","vi","vf","t"],label:"Δx = ½(v_i + v_f)t"},
 {id:"dxvi",vars:["dx","vi","a","t"],label:"Δx = v_it + ½at²"},
 {id:"dxvf2",vars:["dx","vf","a","t"],label:"Δx = v_ft − ½at²"},
 {id:"notime",vars:["vf","vi","a","dx"],label:"v_f² = v_i² + 2aΔx"}
];
let known=new Set(["vi","a","dx"]);
document.querySelectorAll(".chip").forEach(b=>b.addEventListener("click",()=>{const q=b.dataset.q;if(known.has(q))known.delete(q);else known.add(q);b.classList.toggle("on");updateChooser()}));
$("target").addEventListener("change",updateChooser);$("constantA").addEventListener("change",updateChooser);
function updateChooser(){
 const target=$("target").value,constant=$("constantA").checked;
 const candidates=eqs.filter(e=>e.vars.includes(target)&&e.vars.filter(v=>v!==target).every(v=>known.has(v)));
 let best=candidates[0]||null;
 $("choiceEq").textContent=best?best.label:"No direct equation from the selected information";
 $("choiceWhy").textContent=best?`It contains ${target} and only quantities you marked as known.`:"Either another quantity is needed, or a different problem interval must be chosen.";
 $("assumption").textContent=constant?"Constant acceleration condition satisfied":"These equations are not valid across an interval with changing acceleration";
 drawChooser(best,constant,target);
}
function drawChooser(best,constant,target){
 const cv=$("chooserCanvas"),c=cv.getContext("2d"),W=cv.width,H=cv.height;c.clearRect(0,0,W,H);c.fillStyle="#fff";c.fillRect(0,0,W,H);
 c.font="bold 16px Trebuchet MS";c.textAlign="center";
 const vars=[["vi","vᵢ",120,95],["vf","v_f",780,95],["a","a",120,420],["t","t",450,420],["dx","Δx",780,420]];
 vars.forEach(([id,label,x,y])=>{let active=known.has(id)||id===target;c.fillStyle=id===target?"#fff5df":active?"#ffeaf2":"#fff";c.strokeStyle=id===target?"#c59767":active?"#ca82a0":"#e7bfd0";c.lineWidth=2;c.beginPath();c.roundRect(x-55,y-28,110,56,15);c.fill();c.stroke();c.fillStyle="#432b36";c.fillText(label,x,y+6)});
 const boxes=[
 ["v_f = v_i + at",450,120],["Δx = ½(v_i + v_f)t",450,205],["Δx = v_it + ½at²",450,290],["v_f² = v_i² + 2aΔx",450,375]
 ];
 boxes.forEach(([txt,x,y])=>{let hit=best&&best.label===txt;c.fillStyle=hit?"#684453":"#fff6fa";c.strokeStyle=hit?"#684453":"#e7bfd0";c.lineWidth=2;c.beginPath();c.roundRect(x-170,y-25,340,50,14);c.fill();c.stroke();c.fillStyle=hit?"#fff":"#684453";c.fillText(txt,x,y+6)});
 if(!constant){c.fillStyle="rgba(255,255,255,.82)";c.fillRect(0,0,W,H);c.fillStyle="#684453";c.font="bold 22px Georgia";c.fillText("Choose an interval with constant acceleration first.",W/2,H/2)}
}
$("u").addEventListener("input",updateBrake);$("b").addEventListener("input",updateBrake);
function updateBrake(){
 const u=+$("u").value,b=+$("b").value,t=u/b,d=u*u/(2*b);
 $("uLabel").textContent=u.toFixed(0)+" m/s";$("bLabel").textContent=b.toFixed(1)+" m/s²";$("tStopPill").textContent=t.toFixed(2)+" s";$("dStopPill").textContent=d.toFixed(2)+" m";
 $("tStopRead").textContent=`t_stop = ${t.toFixed(2)} s`;$("dStopRead").textContent=`d = ${d.toFixed(2)} m`;
 $("scaleCue").textContent=`At fixed b, doubling u doubles stopping time but multiplies stopping distance by four. Current ratio d/t = ${(d/t).toFixed(2)} m/s.`;
 drawBrake(u,b,t,d);
}
function drawBrake(u,b,T,d){
 const cv=$("brakeGraph"),c=cv.getContext("2d"),W=cv.width,H=cv.height,m={l:70,r:30,t:25,b:45},X=t=>m.l+t/T*(W-m.l-m.r),Y=v=>H-m.b-v/u*(H-m.t-m.b);
 c.clearRect(0,0,W,H);c.fillStyle="#fff";c.fillRect(0,0,W,H);c.strokeStyle="#f1dce5";for(let i=0;i<=8;i++){let x=m.l+i*(W-m.l-m.r)/8;c.beginPath();c.moveTo(x,m.t);c.lineTo(x,H-m.b);c.stroke()}
 c.fillStyle="rgba(202,130,160,.20)";c.beginPath();c.moveTo(X(0),Y(0));c.lineTo(X(0),Y(u));c.lineTo(X(T),Y(0));c.closePath();c.fill();
 c.strokeStyle="#ca82a0";c.lineWidth=3;c.beginPath();c.moveTo(X(0),Y(u));c.lineTo(X(T),Y(0));c.stroke();c.strokeStyle="#684453";c.lineWidth=1.7;c.beginPath();c.moveTo(m.l,Y(0));c.lineTo(W-m.r,Y(0));c.moveTo(m.l,m.t);c.lineTo(m.l,H-m.b);c.stroke();
 c.fillStyle="#684453";c.font="14px Trebuchet MS";c.fillText(`area = d = ${d.toFixed(2)} m`,W/2,H/2);c.fillText("t (s)",W-55,H-12);c.save();c.translate(18,H/2);c.rotate(-Math.PI/2);c.fillText("v (m/s)",0,0);c.restore();
}
$("doubleSpeed").addEventListener("click",()=>{$("u").value=Math.min(40,+$("u").value*2);updateBrake()});
$("halfBraking").addEventListener("click",()=>{$("b").value=Math.max(1,+$("b").value/2);updateBrake()});
$("brakeReset").addEventListener("click",()=>{$("u").value=20;$("b").value=5;updateBrake()});
$("targetX").addEventListener("input",updateQuadratic);$("quadReset").addEventListener("click",()=>{$("targetX").value=8;updateQuadratic()});
function updateQuadratic(){
 const x=+$("targetX").value,D=36-4*x;$("targetXLabel").textContent=x.toFixed(1)+" m";
 let roots=[];if(D>=-1e-9){let s=Math.sqrt(Math.max(0,D));roots=[(6-s)/2,(6+s)/2].filter(t=>t>=0&&t<=6)}
 $("rootsRead").textContent=roots.length?roots.map(t=>`${t.toFixed(2)} s`).join(" and "):"No real visit";
 $("rootVelocities").textContent=roots.length?roots.map(t=>`v(${t.toFixed(2)}) = ${(6-2*t).toFixed(2)} m/s`).join(" · "):"The target lies above the turning position.";
 if(roots.length===2){let dist=9+(9-x);$("distanceRead").textContent=`${dist.toFixed(2)} m by the second visit`;
 $("quadCue").textContent="The same coordinate is reached once while moving right and again while returning left. Both quadratic roots are physically meaningful."}
 else if(roots.length===1){$("distanceRead").textContent="9.00 m at the turning point";$("quadCue").textContent="The two roots merge at the turning point, where velocity is zero."}
 else{$("distanceRead").textContent="—";$("quadCue").textContent="The cart never reaches a position above its maximum x = 9 m."}
 drawQuadratic(x,roots);
}
function drawQuadratic(target,roots){
 const cv=$("quadGraph"),c=cv.getContext("2d"),W=cv.width,H=cv.height,m={l:65,r:25,t:20,b:42},X=t=>m.l+t/6*(W-m.l-m.r),Y=x=>H-m.b-x/10*(H-m.t-m.b);
 c.clearRect(0,0,W,H);c.fillStyle="#fff";c.fillRect(0,0,W,H);c.strokeStyle="#f1dce5";for(let i=0;i<=6;i++){let x=m.l+i*(W-m.l-m.r)/6;c.beginPath();c.moveTo(x,m.t);c.lineTo(x,H-m.b);c.stroke()}
 for(let i=0;i<=5;i++){let y=m.t+i*(H-m.t-m.b)/5;c.beginPath();c.moveTo(m.l,y);c.lineTo(W-m.r,y);c.stroke()}
 c.strokeStyle="#c59767";c.setLineDash([7,5]);c.beginPath();c.moveTo(m.l,Y(target));c.lineTo(W-m.r,Y(target));c.stroke();c.setLineDash([]);
 c.strokeStyle="#ca82a0";c.lineWidth=3;c.beginPath();for(let i=0;i<=300;i++){let t=6*i/300,x=6*t-t*t;i?c.lineTo(X(t),Y(x)):c.moveTo(X(t),Y(x))}c.stroke();
 c.fillStyle="#fff";c.strokeStyle="#684453";c.lineWidth=2;roots.forEach(t=>{c.beginPath();c.arc(X(t),Y(target),7,0,Math.PI*2);c.fill();c.stroke()});
 c.fillStyle="#fff5df";c.beginPath();c.arc(X(3),Y(9),8,0,Math.PI*2);c.fill();c.stroke();c.fillStyle="#684453";c.font="13px Trebuchet MS";c.fillText("turn (3 s, 9 m)",X(3)+12,Y(9)-10);
}
function updateAll(){updateChooser();updateBrake();updateQuadratic()}
updateAll();
