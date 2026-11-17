"use strict";
/* ================= plots + widgets ================= */
function niceStep(span,n){const s0=span/n,m=10**Math.floor(Math.log10(s0)),e=s0/m;return(e>5?10:e>2?5:e>1?2:1)*m;}
function plot(o){
 const W=o.w||560,H=o.h||260,L=56,Rm=18,T=16,B=42,[x0,x1]=o.x,[y0,y1]=o.y,pw=W-L-Rm,ph=H-T-B;
 const fx=o.xlog?v=>L+(Math.log10(v)-Math.log10(x0))/(Math.log10(x1)-Math.log10(x0))*pw:v=>L+(v-x0)/(x1-x0)*pw;
 const fy=v=>T+(1-(Math.max(y0,Math.min(y1,v))-y0)/(y1-y0))*ph;
 let g='';const xf=o.xfmt||(v=>sig(v,3)),yf=o.yfmt||(v=>sig(v,3));
 const xt=[];if(o.xlog){for(let e=Math.ceil(Math.log10(x0));e<=Math.floor(Math.log10(x1));e++)xt.push(10**e);}else{const st=niceStep(x1-x0,6);for(let v=Math.ceil(x0/st)*st;v<=x1+1e-9;v+=st)xt.push(+v.toPrecision(10));}
 const st=niceStep(y1-y0,5),yt=[];for(let v=Math.ceil(y0/st)*st;v<=y1+1e-9;v+=st)yt.push(+v.toPrecision(10));
 xt.forEach(v=>{const X=fx(v);g+=`<line class="plg" x1="${X}" y1="${T}" x2="${X}" y2="${T+ph}"/><text class="ptk" x="${X}" y="${T+ph+16}" text-anchor="middle">${xf(v)}</text>`;});
 yt.forEach(v=>{const Y=fy(v);g+=`<line class="plg" x1="${L}" y1="${Y}" x2="${L+pw}" y2="${Y}"/><text class="ptk" x="${L-6}" y="${Y+4}" text-anchor="end">${yf(v)}</text>`;});
 g+=`<line class="pla" x1="${L}" y1="${T+ph}" x2="${L+pw}" y2="${T+ph}"/><line class="pla" x1="${L}" y1="${T}" x2="${L}" y2="${T+ph}"/>`;
 (o.hl||[]).forEach(h=>{const Y=fy(h.y);g+=`<line class="${h.cls||'pl2'} pld" x1="${L}" y1="${Y}" x2="${L+pw}" y2="${Y}" style="stroke-width:1.4"/>${h.label?`<text class="ptk" x="${L+pw-4}" y="${Y-5}" text-anchor="end">${h.label}</text>`:''}`;});
 (o.vl||[]).forEach(h=>{const X=fx(h.x);g+=`<line class="${h.cls||'pl2'} pld" x1="${X}" y1="${T}" x2="${X}" y2="${T+ph}" style="stroke-width:1.4"/>${h.label?`<text class="ptk" x="${X+4}" y="${T+12}">${h.label}</text>`:''}`;});
 (o.series||[]).forEach(sr=>{g+=`<polyline class="${sr.cls||'pl1'}${sr.dash?' pld':''}"${sr.style?` style="${sr.style}"`:''} points="${sr.pts.filter(p=>isFinite(p[1])&&(!o.xlog||p[0]>0)).map(p=>`${fx(p[0]).toFixed(1)},${fy(p[1]).toFixed(1)}`).join(' ')}"/>`;});
 (o.pts||[]).forEach(p=>{g+=`<circle class="pmk" cx="${fx(p.x)}" cy="${fy(p.y)}" r="5"/>${p.label?`<text class="ptk" x="${fx(p.x)+8}" y="${fy(p.y)-8}" style="fill:var(--probe);font-weight:600">${p.label}</text>`:''}`;});
 if(o.xlabel)g+=`<text class="ptk" x="${L+pw/2}" y="${H-6}" text-anchor="middle">${svgSub(o.xlabel)}</text>`;
 if(o.ylabel)g+=`<text class="ptk" x="${L-50}" y="${T-4}" text-anchor="start">${svgSub(o.ylabel)}</text>`;
 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.aria||'Plot'}">${g}</svg>`;}
const R0=(v,d=2)=>sig(v,d+1);
const ro=items=>`<div class="readout">${items.map(([k,v])=>`<span>${k}: <b>${v}</b></span>`).join('')}</div>`;
const verdict=(ok,txt)=>`<div class="verdict ${ok?'good':'bad'}">${txt}</div>`;
function mountWidget(host,spec){
 const vals={};spec.controls.forEach(c=>vals[c.id]=c.val);host.className='wg';host.innerHTML='<div class="wg-ctl"></div><div class="wg-out"></div>';
 const ctl=host.firstChild,out=host.lastChild,upd=()=>{out.innerHTML=spec.render(vals);fitAll(out);subify(out);attachTools(out,host.dataset.name||'circuit');};
 spec.controls.forEach(c=>{const d=document.createElement('div');d.className='ctl';
  if(c.type==='seg'){d.innerHTML=`<label><span>${c.label}</span></label><div class="seg">${c.options.map(([v,l])=>`<button type="button" data-v="${v}" class="${String(v)===String(vals[c.id])?'on':''}">${l}</button>`).join('')}</div>`;
   d.querySelectorAll('button').forEach(b=>b.onclick=()=>{vals[c.id]=isNaN(+b.dataset.v)?b.dataset.v:+b.dataset.v;d.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));upd();});}
  else{const lg=!!c.log,toPos=v=>lg?Math.round(1000*Math.log(v/c.min)/Math.log(c.max/c.min)):v,fromPos=p=>lg?sig(c.min*(c.max/c.min)**(p/1000),3):+p;
   d.innerHTML=`<label for="w_${c.id}"><span>${c.label}</span><b></b></label><input type="range" id="w_${c.id}" min="${lg?0:c.min}" max="${lg?1000:c.max}" step="${lg?1:c.step||1}" value="${toPos(c.val)}">`;
   const b=d.querySelector('b'),i=d.querySelector('input'),show=()=>b.textContent=(c.fmt||(v=>v))(vals[c.id]);show();
   i.oninput=()=>{vals[c.id]=fromPos(+i.value);show();upd();};}
  ctl.appendChild(d);});
 subify(ctl);upd();}
function fitAll(el){el.querySelectorAll('svg[data-fit]').forEach(fitSvg);}
function fitSvg(svg){try{const bb=svg.getBBox();if(bb.width>0){const p=14;svg.setAttribute('viewBox',`${bb.x-p} ${bb.y-p} ${bb.width+2*p} ${bb.height+2*p}`);}}catch(e){}}
const fitSvgTag=h=>h.replace('<svg ','<svg data-fit="1" ');
const fitTag=h=>`<div class="sheet mini">${fitSvgTag(h)}</div>`;
function tagSim(s,tags){const N=s.N,ex=extract(N),D=devices(N),r=simulate(N,ex,D);if(r.error)return{r};
 tags.forEach(([p,lab,dx=10,dy=-12])=>{const v=r.netV(p),t=`${lab?lab+' ':''}${f2(v)} V`,w=t.length*7+12;s.add(`<rect class="vtb" x="${p[0]+dx}" y="${p[1]+dy-12}" width="${w}" height="18" rx="4"/><text class="vt" x="${p[0]+dx+6}" y="${p[1]+dy+1}">${t}</text>`);});return{r};}
const fmtR=v=>ohm(v),fmtV=v=>`${f2(v)} V`,fmtC=v=>capv(v),fmtI=v=>eng(v,'A'),fmtF=v=>eng(v,'Hz');
/* reusable widgets */
const W_RISE=()=>({controls:[{id:'R',label:'Pull-up R',min:470,max:100000,val:40000,log:1,fmt:fmtR},{id:'C',label:'Line capacitance',min:22e-12,max:4.7e-9,val:1e-9,log:1,fmt:fmtC},{id:'f',label:'Pulse frequency',min:1000,max:1e6,val:10000,log:1,fmt:fmtF},{id:'th',label:'Input threshold',type:'seg',options:[[2.31,'CMOS 0.7·VDD'],[2,'TTL 2.0 V']],val:2.31}],
 render:v=>{const tau=v.R*v.C,T=1/v.f,th=T/2,pts=[];for(let k=0;k<3;k++){const t0=k*T;pts.push([t0,0],[t0+th,0]);for(let i=0;i<=60;i++){const t=th*i/60;pts.push([t0+th+t,3.3*(1-Math.exp(-t/tau))]);}pts.push([t0+T,0]);}
  const vmax=3.3*(1-Math.exp(-th/tau)),tc=vmax>v.th?-tau*Math.log(1-v.th/3.3):null,tr=2.2*tau,miss=vmax<v.th;
  return plot({x:[0,3*T],y:[0,3.6],xfmt:x=>eng(x,'s',2),yfmt:y=>y,series:[{pts,cls:'pl1'}],hl:[{y:v.th,label:`threshold ${v.th} V`}],xlabel:'time',ylabel:'line voltage (V)'})+
  ro([['10–90% rise',eng(tr,'s')],['High time',eng(th,'s')],['Peak reached',fmtV(vmax)],['Time to threshold',tc?eng(tc,'s'):'never']])+
  verdict(!miss&&tc<0.3*th,miss?'Pulses are missed: the line never reaches the threshold before it is pulled low again.':tc>0.3*th?'Marginal: the edge crosses late, so jitter and noise will cause errors.':'Clean: the edge crosses the threshold early in the high time.');}});
