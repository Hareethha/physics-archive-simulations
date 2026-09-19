
const $=id=>document.getElementById(id);
const els=["xi","vi","acc","time","showArea","showSplit"];
function sign(v,d=1){if(Math.abs(v)<1e-9)return (0).toFixed(d);return (v>0?"+":"−")+Math.abs(v).toFixed(d)}
function vals(){return {xi:+$("xi").value,vi:+$("vi").value,a:+$("acc").value,t:+$("time").value}}
function motion(p){let vf=p.vi+p.a*p.t,dx=p.vi*p.t+.5*p.a*p.t*p.t,xf=p.xi+dx,av=(p.vi+vf)/2;return{...p,vf,dx,xf,av}}
function limits(fn,T){let mn=Infinity,mx=-Infinity;for(let i=0;i<=300;i++){let y=fn(T*i/300);mn=Math.min(mn,y);mx=Math.max(mx,y)}if(mx-mn<1){mn-=1;mx+=1}let pad=.18*(mx-mn);return[mn-pad,mx+pad]}
function axes(c,W,H,m,ymin,ymax,T,ylabel){
 c.fillStyle="#fff";c.fillRect(0,0,W,H);c.strokeStyle="#f1dce5";c.lineWidth=1;
 for(let i=0;i<=8;i++){let x=m.l+i*(W-m.l-m.r)/8;c.beginPath();c.moveTo(x,m.t);c.lineTo(x,H-m.b);c.stroke()}
 for(let i=0;i<=6;i++){let y=m.t+i*(H-m.t-m.b)/6;c.beginPath();c.moveTo(m.l,y);c.lineTo(W-m.r,y);c.stroke()}
 const Y=y=>H-m.b-(y-ymin)/(ymax-ymin)*(H-m.t-m.b),X=t=>m.l+t/T*(W-m.l-m.r);
 if(ymin<0&&ymax>0){c.strokeStyle="#684453";c.lineWidth=1.5;c.beginPath();c.moveTo(m.l,Y(0));c.lineTo(W-m.r,Y(0));c.stroke()}
 c.strokeStyle="#684453";c.lineWidth=1.6;c.beginPath();c.moveTo(m.l,m.t);c.lineTo(m.l,H-m.b);c.lineTo(W-m.r,H-m.b);c.stroke();
 c.fillStyle="#684453";c.font="14px Trebuchet MS";c.fillText("t (s)",W-58,H-12);c.save();c.translate(18,(m.t+H-m.b)/2);c.rotate(-Math.PI/2);c.fillText(ylabel,0,0);c.restore();return{X,Y}
}
function drawTrack(p){
 const cv=$("track"),c=cv.getContext("2d"),W=cv.width,H=cv.height;c.clearRect(0,0,W,H);c.fillStyle="#fff";c.fillRect(0,0,W,H);
 const xmin=-18,xmax=18,X=x=>55+(x-xmin)/(xmax-xmin)*(W-110),y=110;
 c.strokeStyle="#684453";c.lineWidth=3;c.beginPath();c.moveTo(55,y);c.lineTo(W-55,y);c.stroke();
 for(let x=-15;x<=15;x+=5){let sx=X(x);c.strokeStyle="#e7bfd0";c.lineWidth=1.4;c.beginPath();c.moveTo(sx,y-10);c.lineTo(sx,y+10);c.stroke();c.fillStyle="#846a75";c.font="12px Trebuchet MS";c.textAlign="center";c.fillText(x,sx,y+28)}
 let sx=Math.max(55,Math.min(W-55,X(p.xf)));c.fillStyle="#f8d4e2";c.strokeStyle="#684453";c.lineWidth=2.5;c.beginPath();c.roundRect(sx-31,y-44,62,30,8);c.fill();c.stroke();c.fillStyle="#432b36";c.font="bold 13px Trebuchet MS";c.fillText("cart",sx,y-54);
 let sxi=X(p.xi);c.strokeStyle="#ca82a0";c.lineWidth=2;c.beginPath();c.moveTo(sxi,y-65);c.lineTo(sxi,y+10);c.stroke();c.fillStyle="#684453";c.fillText("start",sxi,y-73);
}
function drawV(p){
 const cv=$("vgraph"),c=cv.getContext("2d"),W=cv.width,H=cv.height,m={l:68,r:25,t:20,b:42},T=Math.max(1,p.t);
 const fn=t=>p.vi+p.a*t,[mn,mx]=limits(fn,T),{X,Y}=axes(c,W,H,m,mn,mx,T,"v (m/s)"),zero=Y(0);
 if($("showArea").checked&&p.t>0){
   const end=X(p.t),top0=Y(p.vi),top1=Y(p.vf);
   if($("showSplit").checked){
     c.fillStyle="rgba(248,212,226,.55)";c.fillRect(X(0),Math.min(zero,top0),end-X(0),Math.abs(zero-top0));
     c.fillStyle="rgba(197,151,103,.20)";c.beginPath();c.moveTo(X(0),top0);c.lineTo(end,top1);c.lineTo(end,top0);c.closePath();c.fill();
   }else{
     c.fillStyle="rgba(202,130,160,.20)";c.beginPath();c.moveTo(X(0),zero);c.lineTo(X(0),top0);c.lineTo(end,top1);c.lineTo(end,zero);c.closePath();c.fill();
   }
 }
 c.strokeStyle="#ca82a0";c.lineWidth=3;c.beginPath();c.moveTo(X(0),Y(p.vi));c.lineTo(X(p.t),Y(p.vf));c.stroke();
 c.fillStyle="#fff";c.strokeStyle="#432b36";c.lineWidth=2;c.beginPath();c.arc(X(p.t),Y(p.vf),6,0,Math.PI*2);c.fill();c.stroke();
}
function drawX(p){
 const cv=$("xgraph"),c=cv.getContext("2d"),W=cv.width,H=cv.height,m={l:68,r:25,t:20,b:42},T=Math.max(1,p.t);
 const fn=t=>p.xi+p.vi*t+.5*p.a*t*t,[mn,mx]=limits(fn,T),{X,Y}=axes(c,W,H,m,mn,mx,T,"x (m)");
 c.strokeStyle="#ca82a0";c.lineWidth=3;c.beginPath();for(let i=0;i<=300;i++){let t=T*i/300;i?c.lineTo(X(t),Y(fn(t))):c.moveTo(X(t),Y(fn(t)))}c.stroke();
 c.fillStyle="#fff";c.strokeStyle="#432b36";c.lineWidth=2;c.beginPath();c.arc(X(p.t),Y(p.xf),6,0,Math.PI*2);c.fill();c.stroke();
}
function update(){
 const p=motion(vals());
 $("xiLabel").textContent=sign(p.xi)+" m";$("viLabel").textContent=sign(p.vi)+" m/s";$("aLabel").textContent=sign(p.a)+" m/s²";$("tLabel").textContent=p.t.toFixed(2)+" s";
 $("xPill").textContent=p.xf.toFixed(2)+" m";$("vPill").textContent=p.vf.toFixed(2)+" m/s";$("dxPill").textContent=p.dx.toFixed(2)+" m";
 $("vfRead").textContent=`v_f = ${p.vf.toFixed(2)} m/s`;$("avgRead").textContent=`v̄ = ${p.av.toFixed(2)} m/s`;
 $("dxRead").textContent=`Δx = ${p.dx.toFixed(2)} m`;$("areaEquation").textContent=`vᵢt + ½at² = ${(p.vi*p.t).toFixed(2)} + ${(.5*p.a*p.t*p.t).toFixed(2)} = ${p.dx.toFixed(2)} m`;
 $("xfRead").textContent=`x_f = ${p.xf.toFixed(2)} m`;$("noTimeRead").textContent=`v_f² = ${(p.vf*p.vf).toFixed(2)} ; v_i²+2aΔx = ${(p.vi*p.vi+2*p.a*p.dx).toFixed(2)}`;
 let cue="";
 if(Math.abs(p.a)<1e-9) cue="Acceleration is zero, so velocity is constant and the v–t graph is horizontal. Its rectangular signed area is vt.";
 else if(Math.abs(p.vf)<.08) cue="At this instant the velocity is zero. If the sign changes afterward, this is a turning point rather than permanent rest.";
 else if(p.vi*p.vf<0) cue="Velocity has crossed zero during the interval. Positive and negative v–t areas partly cancel in displacement.";
 else cue="For constant acceleration the v–t graph is straight. The rectangle vᵢt plus the triangle ½at² gives the total signed displacement.";
 $("cue").textContent=cue;drawTrack(p);drawV(p);drawX(p);
}
els.forEach(id=>$(id).addEventListener("input",update));
document.querySelectorAll("[data-preset]").forEach(b=>b.addEventListener("click",()=>{
 const key=b.dataset.preset,presets={constant:[0,3,0,4],slowing:[0,7,-2,2],reverse:[0,6,-2,4],speeding:[-2,1,2,3]},q=presets[key];
 ["xi","vi","acc","time"].forEach((id,i)=>$(id).value=q[i]);update();
}));
$("reset").addEventListener("click",()=>{["xi","vi","acc","time"].forEach((id,i)=>$(id).value=[0,4,-2,2][i]);$("showArea").checked=$("showSplit").checked=true;update()});
update();
