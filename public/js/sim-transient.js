"use strict";
/* ================= transient analysis ================= */
const TR_COL=['var(--probe)','#1F5FBF','var(--ok)','#B26B00'];
function waveFn(w){if(!w||w.type!=='sq')return null;const P=1/w.f;return t=>((((t%P)+P)%P)<w.duty*P?w.hi:w.lo);}
function transient(N,ex,D,faults,vals,o){
 const waves={};for(const [r,w] of Object.entries(o.waves||{})){const f=waveFn(w);if(f)waves[r]=f;}
 const caps=D.filter(d=>d.type==='cap'&&!faults[d.ref]),coils=D.filter(d=>d.type==='coil'&&!faults[d.ref]),capV={},indI={};
 caps.forEach(d=>capV[d.ref]=0);coils.forEach(d=>indI[d.ref]=0);
 const w0={};for(const r in waves)w0[r]=()=>waves[r](-1e-12);
 const r0=simulate(N,ex,D,faults,vals,{dt:o.T*1e-9,t:0,wave:w0,capV,indI});if(r0.error)return{error:r0.error};
 const vRun={...vals};D.filter(d=>d.type==='sw').forEach(d=>{if(!faults[d.ref])vRun[d.ref]=!(vals[d.ref]??d.value);});
 const n=o.steps||500,dt=o.T/n,t=[0],ys=o.traces.map(rt=>[r0.volt.get(rt)??0]);
 for(let k=1;k<=n;k++){const tt=k*dt,r=simulate(N,ex,D,faults,vRun,{dt,t:tt,wave:waves,capV,indI});if(r.error)return{error:`At t = ${eng(tt,'s')}: ${r.error}`};
  caps.forEach(d=>capV[d.ref]=r.netV(d.a)-r.netV(d.b));coils.forEach(d=>indI[d.ref]=typeof r.I[d.ref]==='number'?r.I[d.ref]:0);
  t.push(tt);o.traces.forEach((rt,i)=>ys[i].push(r.volt.get(rt)??0));}
 return{t,ys};}
function repPoint(ex,N,root){const cand=[...N.probes.map(q=>q.p),...N.terms.map(t=>t.p),...N.dots,...N.comps.flatMap(c=>[c.a,c.b]),...N.wires.flat()];return cand.find(p=>ex.root(p)===root);}
function trDefaults(ex,D){const s=sim.sch,N=s.N;if(sim.tr&&sim.tr.sch===s)return;
 let tau=0;D.forEach(d=>{if(d.type==='cap'){const C=sim.vals[d.ref]??d.value,nodes=[ex.root(d.a),ex.root(d.b)].filter(r=>r!==ex.G0);let g=0;D.forEach(e=>{if(e.type==='res'&&(nodes.includes(ex.root(e.a))||nodes.includes(ex.root(e.b))))g+=1/(sim.vals[e.ref]??e.value);});tau=Math.max(tau,(g?1/g:1000)*C);}if(d.type==='coil')tau=Math.max(tau,0.05/120);});
 const waves={};D.forEach(d=>{if(d.type==='term'&&/vin|gpio|driver|pulse/i.test(d.name)){waves[d.ref]={type:'sq',lo:0,hi:d.value||3.3,f:sig(1/(tau?10*tau:1e-3),2),duty:0.5};}});
 const wl=Object.values(waves),T=wl.length?2/wl[0].f:tau?6*tau:1e-3,traces=[];
 const add=p=>{if(!p)return;const r=ex.root(p);if(r!==ex.G0&&!traces.includes(r)&&traces.length<3)traces.push(r);};
 Object.keys(waves).forEach(ref=>add(D.find(x=>x.ref===ref).p));N.probes.forEach(q=>add(q.p));
 D.forEach(d=>{if(d.type==='cap')add(ex.root(d.b)===ex.G0?d.a:d.b);if(d.type==='coil')add(d.b);});N.terms.forEach(t=>{if(/out|adc|mcu/i.test(t.label))add(t.p);});
 if(!traces.length){const f=[...ex.nets.values()].find(n=>!n.gnd&&!n.labels.length);if(f)traces.push(f.root);}
 sim.tr={sch:s,T:sig(T,2),waves,traces};}
function riseTime(t,y){const lo=Math.min(...y),hi=Math.max(...y);if(hi-lo<1e-6)return null;const a=lo+0.1*(hi-lo),b=lo+0.9*(hi-lo);let ta=null;for(let i=1;i<y.length;i++){if(ta==null&&y[i-1]<a&&y[i]>=a)ta=t[i];if(ta!=null&&y[i-1]<b&&y[i]>=b)return t[i]-ta;}return null;}
function drawTran(){
 const s=sim.sch,N=s.N,ex=extract(N),D=devices(N),F=allFaults();trDefaults(ex,D);const tr=sim.tr;
 const res=transient(N,ex,D,F,sim.vals,{T:tr.T,steps:500,waves:tr.waves,traces:tr.traces});sim.last={ex,D,r:{}};
 let ov='';N.wires.forEach(w=>{ov+=`<polyline class="whit" data-net="${ex.root(w[0])}" points="${w.map(p=>p.join(',')).join(' ')}"/>`;});
 tr.traces.forEach((rt,i)=>{const n=ex.nets.get(rt),p=repPoint(ex,N,rt);if(!n||!p)return;ov+=`<g style="pointer-events:none"><circle cx="${p[0]}" cy="${p[1]}" r="6.5" style="fill:${TR_COL[i]};stroke:var(--panel);stroke-width:2"/><text x="${p[0]+10}" y="${p[1]-9}" style="font-size:13px;font-weight:700;fill:${TR_COL[i]}">${n.name}</text></g>`;});
 D.forEach(d=>{const g=compGeom(d);if(!g)return;ov+=`<g transform="translate(${g.cx} ${g.cy}) rotate(${g.ang})"><rect class="hit" data-ref="${d.ref}" x="${-g.w/2}" y="${-g.h/2}" width="${g.w}" height="${g.h}" rx="5"/></g>`;});
 const sh=$('simSheet');sh.dataset.name=sim.title;sh.innerHTML=`<svg data-fit="1" viewBox="0 0 ${s.w} ${s.h}" role="img" aria-label="Schematic for transient analysis"><g class="base">${s.o.join('')}</g>${ov}</svg>`;sh.querySelectorAll('.probe').forEach(p=>p.style.display='none');attachTools(sh.parentElement,sim.title);requestAnimationFrame(()=>fitAll(sh));
 const tip=$('tip');sh.querySelectorAll('.whit').forEach(w=>{w.onmousemove=e=>{const n=ex.nets.get(w.dataset.net);tip.textContent=`${n?n.name:'net'}: click to ${tr.traces.includes(w.dataset.net)?'remove from':'add to'} the plot`;tip.style.display='block';tip.style.left=e.clientX/UZ()+14+'px';tip.style.top=e.clientY/UZ()+12+'px';};w.onmouseleave=()=>tip.style.display='none';
  w.onclick=()=>{const k=w.dataset.net;if(k===ex.G0)return;const i=tr.traces.indexOf(k);if(i>=0)tr.traces.splice(i,1);else{if(tr.traces.length>=4)tr.traces.shift();tr.traces.push(k);}tip.style.display='none';drawSim();};});
 sh.querySelectorAll('.hit').forEach(h=>h.onclick=()=>{const d=D.find(x=>x.ref===h.dataset.ref);if(['term','rail','src'].includes(d.type)){const row=document.querySelector(`[data-wave="${d.ref}"]`);if(row){row.scrollIntoView({block:'nearest'});row.classList.add('flash');setTimeout(()=>row.classList.remove('flash'),900);}}else toast('Switch to DC mode to change part values or inject faults.');});
 const box=$('simPlotBox');
 if(res.error){box.innerHTML=`<p class="warn">${res.error}</p>`;}
 else{const all=res.ys.flat();let lo=Math.min(0,...all),hi=Math.max(...all);if(hi-lo<1e-3){hi+=1;lo-=1;}const pad=(hi-lo)*0.08;
  box.innerHTML=`<div class="sheet mini" data-name="${sim.title} transient">${plot({w:620,h:270,x:[0,tr.T],y:[lo-pad,hi+pad],xfmt:x=>eng(x,'s',2),series:res.ys.map((ys,i)=>({pts:res.t.map((t,k)=>[t,ys[k]]),style:`stroke:${TR_COL[i]}`})),xlabel:'time',ylabel:'volts'}).replace('<svg ','<svg data-fit="1" ')}</div><div class="tr-legend">${tr.traces.map((rt,i)=>`<span><i style="background:${TR_COL[i]}"></i>${ex.nets.get(rt)?.name||'?'}</span>`).join('')}</div>`;
  attachTools(box,sim.title+' transient');requestAnimationFrame(()=>fitAll(box));}
 const srcs=D.filter(d=>['term','rail','src'].includes(d.type));
 let h=`<h4>${sim.title}</h4><p class="note" style="margin:0 0 10px">Steps the circuit through time (backward Euler, 500 steps). Capacitors start uncharged and inductors with no current; switches flip at t = 0.</p>
 <label class="note" for="trT">Stop time (accepts 5m, 200u…)</label><div class="row" style="margin:3px 0 12px"><input type="text" id="trT" value="${eng(tr.T,'s').replace(' ','')}" style="width:110px"><button class="btn ghost" id="trHalf" style="padding:5px 10px">÷2</button><button class="btn ghost" id="trDbl" style="padding:5px 10px">×2</button></div>`;
 if(srcs.length){h+='<h4>Inputs</h4>';srcs.forEach(d=>{const w=tr.waves[d.ref];h+=`<div class="wave" data-wave="${d.ref}"><div class="row" style="justify-content:space-between"><b>${d.name}</b><div class="seg"><button data-wt="dc" class="${!w?'on':''}">DC</button><button data-wt="sq" class="${w?'on':''}">Square</button></div></div>${w?`<div class="wave-grid"><label>High<input type="text" data-wk="hi" value="${w.hi}"></label><label>Low<input type="text" data-wk="lo" value="${w.lo}"></label><label>Freq<input type="text" data-wk="f" value="${eng(w.f,'').trim()}"></label><label>Duty %<input type="text" data-wk="duty" value="${Math.round(w.duty*100)}"></label></div>`:`<p class="note" style="margin:2px 0 0">${f2(sim.vals[d.ref]??d.value)} V constant</p>`}</div>`;});}
 if(!res.error){h+='<h4 style="margin-top:12px">Plotted nodes</h4><table><tr><th></th><th>Min</th><th>Max</th><th>End</th></tr>'+tr.traces.map((rt,i)=>{const y=res.ys[i];return `<tr><td><span class="tr-dot" style="background:${TR_COL[i]}"></span>${ex.nets.get(rt)?.name||'?'} <button class="linkish" data-rm="${i}" aria-label="Remove">×</button></td><td>${f2(Math.min(...y))}</td><td>${f2(Math.max(...y))}</td><td>${f2(y[y.length-1])}</td></tr>`;}).join('')+'</table>';
  const rt=res.ys.map((y,i)=>[i,riseTime(res.t,y)]).filter(x=>x[1]);if(rt.length)h+=`<p class="note">10–90% rise: ${rt.map(([i,v])=>`${ex.nets.get(tr.traces[i])?.name}: <b>${eng(v,'s')}</b>`).join(', ')}</p>`;
  h+='<p class="note">Click any wire to plot it (up to 4).</p>';}
 const side=$('simSide');side.innerHTML=h;subify(side);
 const setT=v=>{if(isFinite(v)&&v>0){tr.T=v;drawSim();}};$('trT').onchange=e=>setT(parseVal(e.target.value.replace(/s$/,'')));$('trHalf').onclick=()=>setT(tr.T/2);$('trDbl').onclick=()=>setT(tr.T*2);
 side.querySelectorAll('[data-wave]').forEach(row=>{const ref=row.dataset.wave,d=D.find(x=>x.ref===ref);row.querySelectorAll('[data-wt]').forEach(b=>b.onclick=()=>{if(b.dataset.wt==='dc')delete tr.waves[ref];else tr.waves[ref]={type:'sq',lo:0,hi:(sim.vals[ref]??d.value)||3.3,f:sig(2/tr.T*2,2)||1000,duty:0.5};drawSim();});
  row.querySelectorAll('[data-wk]').forEach(inp=>inp.onchange=()=>{const w=tr.waves[ref];let v=parseVal(inp.value);if(!isFinite(v)){toast('Enter a number.');return;}if(inp.dataset.wk==='duty')v=Math.max(1,Math.min(99,v))/100;if(inp.dataset.wk==='f'&&v<=0)return;w[inp.dataset.wk]=v;drawSim();});});
 side.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{tr.traces.splice(+b.dataset.rm,1);drawSim();});}
