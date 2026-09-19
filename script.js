
const $=id=>document.getElementById(id), g=9.8;
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));
 document.querySelectorAll(".tabpane").forEach(p=>p.classList.add("hidden"));$(b.dataset.tab).classList.remove("hidden");
 if(b.dataset.tab==="compare")updateCompare();else updateSingle();
}));
function signed(v,d=2){if(Math.abs(v)<1e-10)return (0).toFixed(d);return(v>0?"+":"−")+Math.abs(v).toFixed(d)}
function singleParams(){
 const dir=$("positiveDir").value, H=+$("originHeight").value, mode=$("launchMode").value, s=+$("speed").value;
 const ay=dir==="up"?-g:g;
 let vi=0;if(mode==="up")vi=dir==="up"?s:-s;if(mode==="down")vi=dir==="up"?-s:s;
 const ground=dir==="up"?-H:H;
 const disc=vi*vi+2*ay*ground;
 let impact=(-vi+Math.sqrt(Math.max(0,disc)))/ay;
 if(!(impact>0)) impact=(-vi-Math.sqrt(Math.max(0,disc)))/ay;
 return{dir,H,mode,s,ay,vi,ground,impact:Math.max(0,impact)};
}
function state(p,t){return{y:p.vi*t+.5*p.ay*t*t,v:p.vi+p.ay*t,a:p.ay}}
function drawSingle(p,s,t){
 const cv=$("track"),c=cv.getContext("2d"),W=cv.width,H=cv.height;c.clearRect(0,0,W,H);c.fillStyle="#fff";c.fillRect(0,0,W,H);
 const top=40,bottom=H-55,groundY=bottom,originY=top+70,scale=(groundY-originY)/p.H;
 c.strokeStyle="#684453";c.lineWidth=4;c.beginPath();c.moveTo(130,groundY);c.lineTo(W-80,groundY);c.stroke();
 c.fillStyle="#846a75";c.font="14px Trebuchet MS";c.fillText("ground",W-150,groundY-10);
 c.strokeStyle="#e7bfd0";c.lineWidth=2;c.beginPath();c.moveTo(240,originY);c.lineTo(W-120,originY);c.stroke();c.fillStyle="#846a75";c.fillText("chosen origin  y = 0",W-270,originY-10);
 const physicalHeight=p.H+(p.dir==="up"?s.y:-s.y),py=Math.max(originY-150,Math.min(groundY,groundY-physicalHeight*scale));
 c.fillStyle="#f8d4e2";c.strokeStyle="#684453";c.lineWidth=2.5;c.beginPath();c.arc(400,py,18,0,Math.PI*2);c.fill();c.stroke();
 c.fillStyle="#432b36";c.font="bold 14px Trebuchet MS";c.fillText(`t=${t.toFixed(2)} s`,430,py+5);
 c.strokeStyle="#ca82a0";c.lineWidth=3;c.beginPath();c.moveTo(510,py);let len=Math.min(90,Math.abs(s.v)*5);c.lineTo(510,py+(s.v*(p.dir==="up"?-1:1)>=0?-len:len));c.stroke();
 c.fillStyle="#ca82a0";c.fillText("velocity",525,py-4);
 c.strokeStyle="#684453";c.beginPath();c.moveTo(620,py-35);c.lineTo(620,py+45);c.stroke();c.fillStyle="#684453";c.fillText("gravity",635,py+10);
 c.fillStyle="#684453";c.font="13px Trebuchet MS";c.fillText(p.dir==="up"?"+y ↑":"+y ↓",170,85);
}
function drawVA(p,t){
 const cv=$("vaGraph"),c=cv.getContext("2d"),W=cv.width,H=cv.height,m={l:70,r:25,t:20,b:42},T=Math.max(.5,p.impact);
 const vals=[p.vi,p.vi+p.ay*T,p.ay,0],mn=Math.min(...vals)-2,mx=Math.max(...vals)+2;
 const X=x=>m.l+x/T*(W-m.l-m.r),Y=y=>H-m.b-(y-mn)/(mx-mn)*(H-m.t-m.b);
 c.clearRect(0,0,W,H);c.fillStyle="#fff";c.fillRect(0,0,W,H);c.strokeStyle="#f1dce5";for(let i=0;i<=8;i++){let x=m.l+i*(W-m.l-m.r)/8;c.beginPath();c.moveTo(x,m.t);c.lineTo(x,H-m.b);c.stroke()}
 if(mn<0&&mx>0){c.strokeStyle="#684453";c.beginPath();c.moveTo(m.l,Y(0));c.lineTo(W-m.r,Y(0));c.stroke()}
 c.strokeStyle="#ca82a0";c.lineWidth=3;c.beginPath();c.moveTo(X(0),Y(p.vi));c.lineTo(X(T),Y(p.vi+p.ay*T));c.stroke();
 c.strokeStyle="#684453";c.setLineDash([7,5]);c.beginPath();c.moveTo(X(0),Y(p.ay));c.lineTo(X(T),Y(p.ay));c.stroke();c.setLineDash([]);
 c.fillStyle="#fff";c.strokeStyle="#432b36";c.lineWidth=2;c.beginPath();c.arc(X(t),Y(p.vi+p.ay*t),6,0,Math.PI*2);c.fill();c.stroke();
 c.fillStyle="#684453";c.font="13px Trebuchet MS";c.fillText("velocity",W-130,Y(p.vi+p.ay*T)-8);c.fillText("acceleration",W-145,Y(p.ay)-8);c.fillText("time",W-58,H-12);
}
function updateSingle(){
 const p=singleParams();$("speed").disabled=p.mode==="drop";if(p.mode==="drop")$("speed").value=0;
 const q=singleParams();$("time").max=q.impact.toFixed(2);let t=Math.min(+$("time").value,q.impact);$("time").value=t;
 const s=state(q,t);$("originLabel").textContent=q.H.toFixed(1)+" m";$("speedLabel").textContent=(+$("speed").value).toFixed(1)+" m/s";$("timeLabel").textContent=t.toFixed(2)+" s";
 $("yPill").textContent=s.y.toFixed(2)+" m";$("vPill").textContent=s.v.toFixed(2)+" m/s";$("aPill").textContent=s.a.toFixed(2)+" m/s²";
 $("signRead").textContent=q.dir==="up"?"Up is + ; gravity is −":"Down is + ; gravity is +";
 $("signText").textContent=`Ground coordinate = ${signed(q.ground)} m in this convention.`;
 $("velRead").textContent=`v_y = ${signed(s.v)} m/s`;$("velText").textContent=s.v===0?"Momentarily at rest.":(s.v>0?"Motion is in the positive coordinate direction.":"Motion is in the negative coordinate direction.");
 $("accRead").textContent=`a_y = ${signed(s.a)} m/s²`;
 $("eqRead").textContent=`y = v_i t + ½a_y t² = ${s.y.toFixed(2)} m`;
 $("eqText").textContent=`v_i = ${signed(q.vi)} m/s, a_y = ${signed(q.ay)} m/s².`;
 $("cue").textContent=q.mode==="drop"?"Dropped means v_i = 0 in the chosen frame. Gravity then changes the velocity immediately after release.":"The object's velocity direction can change while gravity keeps pointing downward.";
 drawSingle(q,s,t);drawVA(q,t);
}
["positiveDir","originHeight","launchMode","speed","time"].forEach(id=>$(id).addEventListener("input",updateSingle));
$("toImpact").addEventListener("click",()=>{const p=singleParams();$("time").value=p.impact;updateSingle()});
$("reset").addEventListener("click",()=>{$("positiveDir").value="up";$("originHeight").value=19.6;$("launchMode").value="drop";$("speed").value=0;$("time").value=0;updateSingle()});

function impactTime(vi,H){const disc=vi*vi+2*g*H;return (-vi+Math.sqrt(disc))/g}
function updateCompare(){
 const vb=-(+$("bSpeed").value),ta=Math.sqrt(2*19.6/g),tb=impactTime(-vb,19.6),T=Math.max(ta,tb);$("compareTime").max=T.toFixed(2);
 let t=Math.min(+$("compareTime").value,T);$("compareTime").value=t;
 const ya=Math.max(-19.6,-.5*g*t*t), va=-g*Math.min(t,ta);
 const yb=Math.max(-19.6,vb*t-.5*g*t*t), vbnow= t>=tb ? vb-g*tb : vb-g*t;
 $("bSpeedLabel").textContent=Math.abs(vb).toFixed(1)+" m/s";$("compareTimeLabel").textContent=t.toFixed(2)+" s";
 $("aState").textContent=`y=${ya.toFixed(2)} m, v=${va.toFixed(2)} m/s, impact=${ta.toFixed(2)} s`;
 $("bState").textContent=`y=${yb.toFixed(2)} m, v=${vbnow.toFixed(2)} m/s, impact=${tb.toFixed(2)} s`;
 $("bInitial").textContent=`Initial velocity = ${vb.toFixed(1)} m/s downward.`;
 $("compareCue").textContent= tb<ta ? `Ball B lands ${(ta-tb).toFixed(2)} s earlier, even though both accelerations are identical.`:"With zero throw speed the two motions are identical.";
 drawCompare(t,ta,tb,ya,yb);
}
function drawCompare(t,ta,tb,ya,yb){
 const cv=$("compareTrack"),c=cv.getContext("2d"),W=cv.width,H=cv.height,top=45,bottom=H-55,scale=(bottom-top)/19.6;
 c.clearRect(0,0,W,H);c.fillStyle="#fff";c.fillRect(0,0,W,H);c.strokeStyle="#684453";c.lineWidth=4;c.beginPath();c.moveTo(80,bottom);c.lineTo(W-60,bottom);c.stroke();
 c.strokeStyle="#e7bfd0";c.lineWidth=1.5;for(let h=0;h<=20;h+=4){let y=bottom-h*scale;c.beginPath();c.moveTo(90,y);c.lineTo(W-80,y);c.stroke();c.fillStyle="#846a75";c.font="12px Trebuchet MS";c.fillText(`${h} m`,40,y+4)}
 const pa=bottom-(19.6+ya)*scale,pb=bottom-(19.6+yb)*scale;
 [["A",310,pa,"#ca82a0"],["B",590,pb,"#684453"]].forEach(([name,x,y,col])=>{c.fillStyle=col;c.beginPath();c.arc(x,y,18,0,Math.PI*2);c.fill();c.fillStyle="#432b36";c.font="bold 14px Trebuchet MS";c.fillText(name,x+25,y+5)});
 c.fillStyle="#846a75";c.fillText(`A impact: ${ta.toFixed(2)} s`,240,30);c.fillText(`B impact: ${tb.toFixed(2)} s`,520,30);
}
["bSpeed","compareTime"].forEach(id=>$(id).addEventListener("input",updateCompare));
$("compareImpact").addEventListener("click",()=>{$("compareTime").value=$("compareTime").max;updateCompare()});
$("compareReset").addEventListener("click",()=>{$("bSpeed").value=4.9;$("compareTime").value=0;updateCompare()});
updateSingle();updateCompare();
