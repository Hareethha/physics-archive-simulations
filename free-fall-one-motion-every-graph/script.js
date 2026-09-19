
const $=id=>document.getElementById(id),g=9.8;
function p(){let vi=+$("vi").value,drop=+$("drop").value,impact=(vi+Math.sqrt(vi*vi+2*g*drop))/g,top=vi/g,returnT=2*vi/g;return{vi,drop,impact,top,returnT,ymax:vi*vi/(2*g)}}
function state(P,t){return{y:P.vi*t-.5*g*t*t,v:P.vi-g*t,a:-g}}
function axes(c,W,H,m,ymin,ymax,T,label){
 const X=t=>m.l+t/T*(W-m.l-m.r),Y=y=>H-m.b-(y-ymin)/(ymax-ymin)*(H-m.t-m.b);
 c.fillStyle="#fff";c.fillRect(0,0,W,H);c.strokeStyle="#f1dce5";c.lineWidth=1;
 for(let i=0;i<=8;i++){let x=m.l+i*(W-m.l-m.r)/8;c.beginPath();c.moveTo(x,m.t);c.lineTo(x,H-m.b);c.stroke()}
 for(let i=0;i<=5;i++){let y=m.t+i*(H-m.t-m.b)/5;c.beginPath();c.moveTo(m.l,y);c.lineTo(W-m.r,y);c.stroke()}
 if(ymin<0&&ymax>0){c.strokeStyle="#684453";c.lineWidth=1.3;c.beginPath();c.moveTo(m.l,Y(0));c.lineTo(W-m.r,Y(0));c.stroke()}
 c.strokeStyle="#684453";c.lineWidth=1.5;c.beginPath();c.moveTo(m.l,m.t);c.lineTo(m.l,H-m.b);c.lineTo(W-m.r,H-m.b);c.stroke();
 c.fillStyle="#684453";c.font="13px Trebuchet MS";c.fillText("t",W-35,H-12);c.save();c.translate(18,H/2);c.rotate(-Math.PI/2);c.fillText(label,0,0);c.restore();return{X,Y}
}
function drawTrack(P,S,t){
 const cv=$("track"),c=cv.getContext("2d"),W=cv.width,H=cv.height;c.clearRect(0,0,W,H);c.fillStyle="#fff";c.fillRect(0,0,W,H);
 const xmin=-P.drop-2,xmax=P.ymax+2,X=y=>80+(y-xmin)/(xmax-xmin)*(W-150),line=145;
 c.strokeStyle="#684453";c.lineWidth=3;c.beginPath();c.moveTo(70,line);c.lineTo(W-60,line);c.stroke();
 [0,P.ymax,-P.drop].forEach((y,i)=>{let x=X(y);c.strokeStyle=i===1?"#c59767":"#e7bfd0";c.beginPath();c.moveTo(x,line-34);c.lineTo(x,line+34);c.stroke();c.fillStyle="#846a75";c.font="12px Trebuchet MS";c.textAlign="center";c.fillText(i===0?"launch":i===1?"apex":"ground",x,line+55)});
 c.fillStyle="#f8d4e2";c.strokeStyle="#684453";c.lineWidth=2.5;c.beginPath();c.arc(X(S.y),line,16,0,Math.PI*2);c.fill();c.stroke();
 c.fillStyle="#432b36";c.font="bold 13px Trebuchet MS";c.fillText(`y=${S.y.toFixed(2)} m`,X(S.y),line-30);
 c.strokeStyle="#ca82a0";c.lineWidth=3;c.beginPath();c.moveTo(X(S.y),line-65);let dir=S.v>=0?1:-1,len=Math.min(80,Math.abs(S.v)*4);c.lineTo(X(S.y)+dir*len,line-65);c.stroke();
}
function drawY(P,S,t){
 const cv=$("ygraph"),c=cv.getContext("2d"),W=cv.width,H=cv.height,m={l:68,r:25,t:20,b:42},ymin=-P.drop-2,ymax=P.ymax+2,{X,Y}=axes(c,W,H,m,ymin,ymax,P.impact,"y (m)");
 c.strokeStyle="#ca82a0";c.lineWidth=3;c.beginPath();for(let i=0;i<=400;i++){let tt=P.impact*i/400,y=P.vi*tt-.5*g*tt*tt;i?c.lineTo(X(tt),Y(y)):c.moveTo(X(tt),Y(y))}c.stroke();
 if($("showTangent").checked){let span=.35,t1=Math.max(0,t-span),t2=Math.min(P.impact,t+span);c.strokeStyle="#c59767";c.lineWidth=2;c.beginPath();c.moveTo(X(t1),Y(S.y+S.v*(t1-t)));c.lineTo(X(t2),Y(S.y+S.v*(t2-t)));c.stroke()}
 c.fillStyle="#fff";c.strokeStyle="#432b36";c.lineWidth=2;c.beginPath();c.arc(X(t),Y(S.y),6,0,Math.PI*2);c.fill();c.stroke();
}
function drawV(P,S,t){
 const cv=$("vgraph"),c=cv.getContext("2d"),W=cv.width,H=cv.height,m={l:68,r:25,t:20,b:42},vend=P.vi-g*P.impact,ymin=vend-2,ymax=P.vi+2,{X,Y}=axes(c,W,H,m,ymin,ymax,P.impact,"v (m/s)"),zero=Y(0);
 if($("showVArea").checked){c.fillStyle="rgba(202,130,160,.20)";c.beginPath();c.moveTo(X(0),zero);c.lineTo(X(0),Y(P.vi));c.lineTo(X(t),Y(S.v));c.lineTo(X(t),zero);c.closePath();c.fill()}
 c.strokeStyle="#ca82a0";c.lineWidth=3;c.beginPath();c.moveTo(X(0),Y(P.vi));c.lineTo(X(P.impact),Y(vend));c.stroke();
 c.fillStyle="#fff";c.strokeStyle="#432b36";c.lineWidth=2;c.beginPath();c.arc(X(t),Y(S.v),6,0,Math.PI*2);c.fill();c.stroke();
}
function drawA(P,S,t){
 const cv=$("agraph"),c=cv.getContext("2d"),W=cv.width,H=cv.height,m={l:68,r:25,t:20,b:42},ymin=-12,ymax=2,{X,Y}=axes(c,W,H,m,ymin,ymax,P.impact,"a (m/s²)"),zero=Y(0);
 if($("showAArea").checked){c.fillStyle="rgba(104,68,83,.10)";c.fillRect(X(0),Y(0),X(t)-X(0),Y(-g)-Y(0))}
 c.strokeStyle="#684453";c.lineWidth=3;c.beginPath();c.moveTo(X(0),Y(-g));c.lineTo(X(P.impact),Y(-g));c.stroke();
 c.fillStyle="#fff";c.strokeStyle="#432b36";c.lineWidth=2;c.beginPath();c.arc(X(t),Y(-g),6,0,Math.PI*2);c.fill();c.stroke();
}
function update(){
 const P=p();$("time").max=P.impact.toFixed(2);let t=Math.min(+$("time").value,P.impact);$("time").value=t;const S=state(P,t);
 $("viLabel").textContent=P.vi.toFixed(1)+" m/s";$("dropLabel").textContent=P.drop.toFixed(1)+" m";$("timeLabel").textContent=t.toFixed(2)+" s";$("yPill").textContent=S.y.toFixed(2)+" m";$("vPill").textContent=S.v.toFixed(2)+" m/s";
 $("stateRead").textContent=`y=${S.y.toFixed(2)} m, v=${S.v.toFixed(2)} m/s, a=−9.8 m/s²`;
 $("stateText").textContent=S.v>0?"Ball moving upward and slowing.":Math.abs(S.v)<.04?"Ball momentarily at rest at the apex.":"Ball moving downward and speeding up.";
 const disp=S.y,$("dispRead").textContent=`Δy = ${disp.toFixed(2)} m`;
 const dv=-g*t;$("dvRead").textContent=`Δv = ${dv.toFixed(2)} m/s`;$("dvText").textContent=`v = v_i + Δv = ${P.vi.toFixed(2)} + (${dv.toFixed(2)}) = ${S.v.toFixed(2)} m/s`;
 let event="Ordinary flight";let eventText="All four representations describe the same instant.";
 if(Math.abs(t-P.top)<.03){event="Apex";eventText="y is maximum, the tangent on y–t is horizontal, v=0, and a remains −g."}
 else if(Math.abs(t-P.returnT)<.03&&P.returnT<=P.impact){event="Launch height again";eventText="The ball crosses y=0 while moving downward. This is not the turning point."}
 else if(Math.abs(t-P.impact)<.03){event="Impact";eventText="The free-fall model ends here because contact with the ground adds another force."}
 $("eventRead").textContent=event;$("eventText").textContent=eventText;
 $("cue").textContent="The acceleration graph never flips at the top. The velocity graph crosses zero there; the position graph merely has a horizontal tangent.";
 drawTrack(P,S,t);drawY(P,S,t);drawV(P,S,t);drawA(P,S,t);
}
["vi","drop","time","showVArea","showAArea","showTangent"].forEach(id=>$(id).addEventListener("input",update));
$("jumpTop").addEventListener("click",()=>{$("time").value=p().top;update()});
$("jumpLaunch").addEventListener("click",()=>{$("time").value=Math.min(p().returnT,p().impact);update()});
$("jumpImpact").addEventListener("click",()=>{$("time").value=p().impact;update()});
update();
