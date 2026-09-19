
const $=id=>document.getElementById(id);
const ids=["x0","v0","a1","t1","a2","t2","a3","t3","showAreas","showPosition"];
function stage(xi,vi,a,t){let vf=vi+a*t,dx=vi*t+.5*a*t*t,xf=xi+dx;return{xi,vi,a,t,vf,dx,xf}}
function data(){
 let x0=+$("x0").value,v0=+$("v0").value,s1=stage(x0,v0,+$("a1").value,+$("t1").value);
 let s2=stage(s1.xf,s1.vf,+$("a2").value,+$("t2").value);let s3=stage(s2.xf,s2.vf,+$("a3").value,+$("t3").value);
 return{x0,v0,st:[s1,s2,s3],T:s1.t+s2.t+s3.t,dx:s1.dx+s2.dx+s3.dx,vf:s3.vf,xf:s3.xf}
}
function signed(v,d=1){if(Math.abs(v)<1e-9)return (0).toFixed(d);return(v>0?"+":"−")+Math.abs(v).toFixed(d)}
function stateAt(d,t){
 let elapsed=0,x=d.x0,v=d.v0;
 for(const s of d.st){if(t<=elapsed+s.t){let tau=t-elapsed;return{x:x+v*tau+.5*s.a*tau*tau,v:v+s.a*tau,a:s.a}}x=s.xf;v=s.vf;elapsed+=s.t}
 return{x:d.xf,v:d.vf,a:d.st[2].a}
}
function range(fn,T){let mn=Infinity,mx=-Infinity;for(let i=0;i<=350;i++){let y=fn(T*i/350);mn=Math.min(mn,y);mx=Math.max(mx,y)}if(mx-mn<1){mn-=1;mx+=1}let p=.18*(mx-mn);return[mn-p,mx+p]}
function axes(c,W,H,m,mn,mx,T,label){
 const X=t=>m.l+t/T*(W-m.l-m.r),Y=y=>H-m.b-(y-mn)/(mx-mn)*(H-m.t-m.b);c.fillStyle="#fff";c.fillRect(0,0,W,H);c.strokeStyle="#f1dce5";c.lineWidth=1;
 for(let i=0;i<=9;i++){let x=m.l+i*(W-m.l-m.r)/9;c.beginPath();c.moveTo(x,m.t);c.lineTo(x,H-m.b);c.stroke()}for(let i=0;i<=6;i++){let y=m.t+i*(H-m.t-m.b)/6;c.beginPath();c.moveTo(m.l,y);c.lineTo(W-m.r,y);c.stroke()}
 if(mn<0&&mx>0){c.strokeStyle="#684453";c.lineWidth=1.5;c.beginPath();c.moveTo(m.l,Y(0));c.lineTo(W-m.r,Y(0));c.stroke()}c.strokeStyle="#684453";c.lineWidth=1.6;c.beginPath();c.moveTo(m.l,m.t);c.lineTo(m.l,H-m.b);c.lineTo(W-m.r,H-m.b);c.stroke();
 c.fillStyle="#684453";c.font="14px Trebuchet MS";c.fillText("t (s)",W-55,H-12);c.save();c.translate(18,H/2);c.rotate(-Math.PI/2);c.fillText(label,0,0);c.restore();return{X,Y}
}
function drawV(d){
 const cv=$("vgraph"),c=cv.getContext("2d"),W=cv.width,H=cv.height,m={l:70,r:25,t:20,b:42},fn=t=>stateAt(d,t).v,[mn,mx]=range(fn,d.T),{X,Y}=axes(c,W,H,m,mn,mx,d.T,"v (m/s)"),zero=Y(0);
 let elapsed=0;const fills=["rgba(248,212,226,.42)","rgba(255,245,223,.65)","rgba(202,130,160,.20)"];
 d.st.forEach((s,i)=>{let t0=elapsed,t1=elapsed+s.t,v0=s.vi,v1=s.vf;if($("showAreas").checked){c.fillStyle=fills[i];c.beginPath();c.moveTo(X(t0),zero);c.lineTo(X(t0),Y(v0));c.lineTo(X(t1),Y(v1));c.lineTo(X(t1),zero);c.closePath();c.fill()}
 c.strokeStyle=i===0?"#ca82a0":i===1?"#c59767":"#684453";c.lineWidth=3;c.beginPath();c.moveTo(X(t0),Y(v0));c.lineTo(X(t1),Y(v1));c.stroke();
 c.fillStyle="#846a75";c.font="12px Trebuchet MS";c.textAlign="center";c.fillText(`stage ${i+1}`,X((t0+t1)/2),m.t+18);elapsed=t1});
}
function drawX(d){
 const cv=$("xgraph"),c=cv.getContext("2d"),W=cv.width,H=cv.height,m={l:70,r:25,t:20,b:42},fn=t=>stateAt(d,t).x,[mn,mx]=range(fn,d.T),{X,Y}=axes(c,W,H,m,mn,mx,d.T,"x (m)");
 c.strokeStyle="#ca82a0";c.lineWidth=3;c.beginPath();for(let i=0;i<=400;i++){let t=d.T*i/400;i?c.lineTo(X(t),Y(fn(t))):c.moveTo(X(t),Y(fn(t)))}c.stroke();
 let elapsed=0;d.st.slice(0,2).forEach(s=>{elapsed+=s.t;c.fillStyle="#fff";c.strokeStyle="#684453";c.lineWidth=2;c.beginPath();c.arc(X(elapsed),Y(fn(elapsed)),6,0,Math.PI*2);c.fill();c.stroke()});
}
function approximateDistance(d){
 let dist=0,prev=stateAt(d,0).x,N=3000;for(let i=1;i<=N;i++){let x=stateAt(d,d.T*i/N).x;dist+=Math.abs(x-prev);prev=x}return dist
}
function update(){
 const d=data();["x0","v0","a1","t1","a2","t2","a3","t3"].forEach(id=>{$(id+"Label")&&($(id+"Label").textContent=(id.startsWith("t")?(+$(id).value).toFixed(1)+" s":id.startsWith("a")?signed(+$(id).value)+" m/s²":signed(+$(id).value)+" "+(id==="x0"?"m":"m/s")))});
 d.st.forEach((s,i)=>{$(`s${i+1}Summary`).textContent=`x: ${s.xi.toFixed(1)} → ${s.xf.toFixed(1)} m · v: ${s.vi.toFixed(1)} → ${s.vf.toFixed(1)} m/s · Δx=${s.dx.toFixed(1)} m`});
 $("node1").textContent=`x=${d.st[0].xf.toFixed(1)}, v=${d.st[0].vf.toFixed(1)}`;$("node2").textContent=`x=${d.st[1].xf.toFixed(1)}, v=${d.st[1].vf.toFixed(1)}`;$("node3").textContent=`x=${d.xf.toFixed(1)}, v=${d.vf.toFixed(1)}`;
 $("startNode").textContent=`x=${d.x0.toFixed(1)}, v=${d.v0.toFixed(1)}`;$("timePill").textContent=d.T.toFixed(1)+" s";$("dxPill").textContent=d.dx.toFixed(1)+" m";$("vfPill").textContent=d.vf.toFixed(1)+" m/s";
 $("stageDx").textContent=d.st.map((s,i)=>`Δx${i+1}=${s.dx.toFixed(1)} m`).join(" · ");$("totalDx").textContent=`Δx_total = ${d.dx.toFixed(2)} m`;
 const dist=approximateDistance(d);$("distanceText").textContent=Math.abs(dist-Math.abs(d.dx))<.02?`No reversal: distance = ${dist.toFixed(2)} m.`:`Reversal occurs: distance = ${dist.toFixed(2)} m, larger than |Δx|.`;
 $("avgV").textContent=`v̄ = ${(d.dx/d.T).toFixed(2)} m/s`;$("avgA").textContent=`ā = ${((d.vf-d.v0)/d.T).toFixed(2)} m/s²`;
 $("cue").textContent=`Stage 2 begins with v_i=${d.st[0].vf.toFixed(2)} m/s and x_i=${d.st[0].xf.toFixed(2)} m — exactly the final state of stage 1. Each stage uses its own elapsed time.`;
 $("positionWrap").style.display=$("showPosition").checked?"block":"none";drawV(d);if($("showPosition").checked)drawX(d);
}
ids.forEach(id=>$(id).addEventListener("input",update));
$("cyclist").addEventListener("click",()=>{const v={x0:0,v0:0,a1:2,t1:4,a2:0,t2:3,a3:-4,t3:2};Object.entries(v).forEach(([k,val])=>$(k).value=val);update()});
$("reset").addEventListener("click",()=>{$("cyclist").click();$("showAreas").checked=$("showPosition").checked=true;update()});
update();
