
const $=id=>document.getElementById(id),g=9.8;
function params(){const vi=+$("vi").value,drop=+$("drop").value,disc=vi*vi+2*g*drop,impact=(vi+Math.sqrt(disc))/g,top=vi/g,ymax=vi*vi/(2*g);return{vi,drop,impact,top,ymax}}
function state(p,t){return{y:p.vi*t-.5*g*t*t,v:p.vi-g*t}}
function rootsAtHeight(p,h){const D=p.vi*p.vi-2*g*h;if(D<0)return[];const s=Math.sqrt(D);return[(p.vi-s)/g,(p.vi+s)/g]}
function drawTrack(p,s,t,probe){
 const cv=$("track"),c=cv.getContext("2d"),W=cv.width,H=cv.height,top=40,bottom=H-55,span=p.ymax+p.drop+3,originY=top+(p.ymax+1)/span*(bottom-top),Y=y=>originY-y/span*(bottom-top);
 c.clearRect(0,0,W,H);c.fillStyle="#fff";c.fillRect(0,0,W,H);
 c.strokeStyle="#684453";c.lineWidth=4;c.beginPath();c.moveTo(100,Y(-p.drop));c.lineTo(W-80,Y(-p.drop));c.stroke();c.fillStyle="#846a75";c.font="13px Trebuchet MS";c.fillText("landing level",W-190,Y(-p.drop)-10);
 c.strokeStyle="#e7bfd0";c.lineWidth=2;c.beginPath();c.moveTo(150,Y(0));c.lineTo(W-120,Y(0));c.stroke();c.fillStyle="#846a75";c.fillText("launch level y=0",W-220,Y(0)-10);
 c.strokeStyle="#c59767";c.setLineDash([6,5]);c.beginPath();c.moveTo(160,Y(probe));c.lineTo(W-130,Y(probe));c.stroke();c.setLineDash([]);c.fillStyle="#c59767";c.fillText("probe height",W-210,Y(probe)-8);
 c.fillStyle="#f8d4e2";c.strokeStyle="#684453";c.lineWidth=2.5;c.beginPath();c.arc(400,Y(s.y),18,0,Math.PI*2);c.fill();c.stroke();c.fillStyle="#432b36";c.font="bold 14px Trebuchet MS";c.fillText(`t=${t.toFixed(2)} s`,430,Y(s.y)+4);
 c.fillStyle="#684453";c.font="13px Trebuchet MS";c.fillText(`apex ${p.ymax.toFixed(2)} m`,170,Y(p.ymax)-8);
 c.strokeStyle="#684453";c.lineWidth=2;c.beginPath();c.moveTo(650,Y(s.y)-35);c.lineTo(650,Y(s.y)+45);c.stroke();c.fillStyle="#684453";c.fillText("a = −g",670,Y(s.y)+8);
}
function drawGraph(p,t,probe){
 const cv=$("graph"),c=cv.getContext("2d"),W=cv.width,H=cv.height,m={l:68,r:25,t:20,b:42},ymin=-p.drop-2,ymax=p.ymax+2,X=x=>m.l+x/p.impact*(W-m.l-m.r),Y=y=>H-m.b-(y-ymin)/(ymax-ymin)*(H-m.t-m.b);
 c.clearRect(0,0,W,H);c.fillStyle="#fff";c.fillRect(0,0,W,H);c.strokeStyle="#f1dce5";for(let i=0;i<=8;i++){let x=m.l+i*(W-m.l-m.r)/8;c.beginPath();c.moveTo(x,m.t);c.lineTo(x,H-m.b);c.stroke()}
 c.strokeStyle="#684453";c.lineWidth=1.5;c.beginPath();c.moveTo(m.l,Y(0));c.lineTo(W-m.r,Y(0));c.stroke();
 c.strokeStyle="#c59767";c.setLineDash([6,5]);c.beginPath();c.moveTo(m.l,Y(probe));c.lineTo(W-m.r,Y(probe));c.stroke();c.setLineDash([]);
 c.strokeStyle="#ca82a0";c.lineWidth=3;c.beginPath();for(let i=0;i<=400;i++){let tt=p.impact*i/400,y=p.vi*tt-.5*g*tt*tt;i?c.lineTo(X(tt),Y(y)):c.moveTo(X(tt),Y(y))}c.stroke();
 const s=state(p,t);c.fillStyle="#fff";c.strokeStyle="#432b36";c.lineWidth=2;c.beginPath();c.arc(X(t),Y(s.y),6,0,Math.PI*2);c.fill();c.stroke();
 c.fillStyle="#fff5df";c.beginPath();c.arc(X(p.top),Y(p.ymax),7,0,Math.PI*2);c.fill();c.stroke();
 rootsAtHeight(p,probe).filter(r=>r>=0&&r<=p.impact).forEach(r=>{c.fillStyle="#fff";c.strokeStyle="#c59767";c.beginPath();c.arc(X(r),Y(probe),6,0,Math.PI*2);c.fill();c.stroke()});
 c.fillStyle="#684453";c.font="13px Trebuchet MS";c.fillText("time",W-55,H-12);c.save();c.translate(18,H/2);c.rotate(-Math.PI/2);c.fillText("y (m)",0,0);c.restore();
}
function update(){
 const p=params();$("time").max=p.impact.toFixed(2);$("probe").max=Math.max(0,p.ymax).toFixed(2);let t=Math.min(+$("time").value,p.impact);$("time").value=t;let probe=Math.min(+$("probe").value,p.ymax);$("probe").value=probe;
 const s=state(p,t);$("viLabel").textContent=p.vi.toFixed(1)+" m/s";$("dropLabel").textContent=p.drop.toFixed(1)+" m";$("timeLabel").textContent=t.toFixed(2)+" s";$("probeLabel").textContent=probe.toFixed(1)+" m";
 $("yPill").textContent=s.y.toFixed(2)+" m";$("vPill").textContent=s.v.toFixed(2)+" m/s";
 $("topRead").textContent=`t_top=${p.top.toFixed(2)} s, y_max=${p.ymax.toFixed(2)} m`;
 const impactV=p.vi-g*p.impact;$("impactRead").textContent=`t=${p.impact.toFixed(2)} s, v=${impactV.toFixed(2)} m/s`;
 $("impactText").textContent=p.drop===0?"The ball returns to the launch height with the same speed and opposite velocity.":"The landing point is below launch, so the descent lasts longer than the ascent.";
 const roots=rootsAtHeight(p,probe).filter(r=>r>=0&&r<=p.impact);if(roots.length===2){let v1=p.vi-g*roots[0],v2=p.vi-g*roots[1];$("symRead").textContent=`${roots[0].toFixed(2)} s and ${roots[1].toFixed(2)} s`;$("symText").textContent=`At y=${probe.toFixed(2)} m: v_up=${v1.toFixed(2)} m/s and v_down=${v2.toFixed(2)} m/s — equal speeds, opposite signs.`}else{$("symRead").textContent="Only one physical visit";$("symText").textContent="Choose a probe height below the apex to see the two symmetric visits."}
 const distance=p.ymax+(p.ymax+p.drop),disp=-p.drop;$("distRead").textContent=`distance=${distance.toFixed(2)} m · Δy=${disp.toFixed(2)} m`;
 $("distText").textContent="Distance adds the upward and downward path lengths. Displacement depends only on the endpoints.";
 $("cue").textContent=Math.abs(t-p.top)<.03?"At the apex, velocity is zero only for an instant. Acceleration is still −9.8 m/s², so velocity immediately becomes negative afterward.":(t<p.top?"The ball is moving upward while acceleration points downward, so it slows.":"The ball is moving downward and acceleration also points downward, so it speeds up.");
 drawTrack(p,s,t,probe);drawGraph(p,t,probe);
}
["vi","drop","time","probe"].forEach(id=>$(id).addEventListener("input",update));
$("sameHeight").addEventListener("click",()=>{$("vi").value=14.7;$("drop").value=0;$("probe").value=5;$("time").value=0;update()});
$("balcony").addEventListener("click",()=>{$("vi").value=9.8;$("drop").value=14.7;$("probe").value=0;$("time").value=0;update()});
$("jumpTop").addEventListener("click",()=>{$("time").value=params().top;update()});
$("jumpImpact").addEventListener("click",()=>{$("time").value=params().impact;update()});
update();
