"use strict";
/* ================= app ================= */
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}try{const sec=k==='bench.stats'?'stats':k==='bench.prefs'?'progress':null;if(sec&&typeof syncSt!=='undefined')syncTouch(sec);}catch(e){}}};
let stats=store.get('bench.stats',{}),prefs=store.get('bench.prefs',{topics:TOPICS.map(t=>t.id),faultOnly:false,weak:false});
(()=>{const known=prefs.known||['dc','diode','xstr','opamp','rc','digital','power','meas','portfolio'];TOPICS.forEach(t=>{if(!known.includes(t.id)){known.push(t.id);if(!prefs.topics.includes(t.id))prefs.topics.push(t.id);}});prefs.known=known;delete prefs.pySolved;delete prefs.shSolved;try{for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&k.startsWith('bench.py.'))localStorage.removeItem(k);}}catch(e){}try{localStorage.setItem('bench.prefs',JSON.stringify(prefs));}catch(e){}})();
G.forEach(g=>{g.key=g.topic+':'+G.filter(x=>x.topic===g.topic).indexOf(g);});
const session={tried:0,first:0,streak:0};let cur=null,lastGen=null,view='practice';
const $=id=>document.getElementById(id);
const topicName=id=>TOPICS.find(t=>t.id===id).name;
const KIND={calc:'Calculate',diagnose:'Diagnose',concept:'Concept'};
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),3200);}

/* ---------- practice ---------- */
function renderSide(){
 $('topicList').innerHTML=TOPICS.map((t,i)=>{const st=stats[t.id]||{a:0,c:0},pct=st.a?Math.round(st.c/st.a*100):0,gh=i===0&&t.focus?'<div class="tgrp">Recruiter focus</div>':t.focus||!(TOPICS[i-1]||{}).focus?'':'<div class="tgrp">Everything else</div>';
  return gh+`<label class="topic"><input type="checkbox" data-t="${t.id}" ${prefs.topics.includes(t.id)?'checked':''}><span>${t.name}</span><span class="ct">${st.a?`${st.c}/${st.a}`:''}</span><span class="bar"><i style="width:${pct}%"></i></span></label>`;}).join('');
 $('topicList').querySelectorAll('input').forEach(i=>i.onchange=()=>{const t=i.dataset.t;prefs.topics=i.checked?[...new Set([...prefs.topics,t])]:prefs.topics.filter(x=>x!==t);store.set('bench.prefs',prefs);if(!cur||!prefs.topics.includes(cur.topic))next();});
 $('faultOnly').checked=prefs.faultOnly;$('weakMode').checked=prefs.weak;$('missMode').checked=!!prefs.missMode;const mc=missCount();$('missLbl').textContent=mc?`Revisit my misses (${mc})`:'Revisit my misses';}
function renderScore(){const acc=session.tried?Math.round(session.first/session.tried*100):0;
 $('score').innerHTML=`<span>This session: <b>${session.first}/${session.tried}</b> right first try${session.tried?` (${acc}%)`:''}</span><span>Streak: <b>${session.streak}</b></span>`;}
function missCount(){return Object.values(stats.miss||{}).reduce((a,b)=>a+b,0);}
function pool(){if(prefs.missMode)return G.filter(g=>(stats.miss||{})[g.key]>0);return G.filter(g=>prefs.topics.includes(g.topic)&&(!prefs.faultOnly||g.kind==='diagnose'));}
function weight(g){if(!prefs.weak)return 1;const st=stats[g.topic];if(!st||st.a<3)return 1.5;return 0.4+2.6*(1-st.c/st.a);}
function next(){
 const P=pool();
 if(!P.length){cur=null;$('card').innerHTML=`<div class="empty"><h3 class="qt">Nothing to practice</h3><p>${prefs.missMode?'No missed questions to revisit. Every question you miss on the first try lands here until you get it right.':prefs.faultOnly?'Fault-finding only is on, and none of the selected topics have diagnose questions. Turn it off or add DC, Diodes, Transistors, Op-amps or Portfolio.':'Select at least one topic on the left.'}</p></div>`;return;}
 let g,q=null,n=0,sch=null;
 while(!q&&n++<40){const cand=P.length>1?P.filter(x=>x!==lastGen):P,tot=cand.reduce((a,x)=>a+weight(x),0);let r=Math.random()*tot;g=cand[cand.length-1];for(const x of cand){r-=weight(x);if(r<=0){g=x;break;}}
  LAST_SCH=null;try{q=g.fn();sch=LAST_SCH;}catch(e){console.error(e);q=null;}}
 if(!q){$('card').innerHTML='<div class="empty">Could not generate a question. Press N to try again.</div>';return;}
 lastGen=g;cur={...q,topic:g.topic,kind:g.kind,recorded:false,hintN:0,done:false,usedHelp:false,sch:q.svg?sch:null};render();if(prefs.wbFollow)wbFollowNow();}
function render(){
 const q=cur,c=$('card'),hasSim=q.sch&&!q.sch.N.unsupported;
 c.innerHTML=`<div class="qgrid ${q.svg?'':'nosvg'}">${q.svg?`<div class="qleft"><div class="sheet" data-name="${q.title.replace(/"/g,'')}">${fitSvgTag(q.svg)}</div></div>`:''}<div class="qright">
 <div class="meta"><span class="pill">${topicName(q.topic)}</span><span class="pill ${q.kind}">${KIND[q.kind]}</span></div>
 <h3 class="qt">${q.title}</h3><div class="prompt">${q.prompt}</div>
 <div id="ansZone"></div><div class="feedback" id="fb" aria-live="polite"></div>
 <ol class="hints" id="hints"></ol><div id="sol"></div>
 <div class="tools"><button class="btn ghost" id="hintBtn"></button><button class="btn ghost" id="solBtn">Show solution</button><button class="btn ghost" id="calcBtn">Calculator</button><button class="btn ghost claude" id="askBtn">Ask Claude</button>${hasSim?'<button class="btn ghost" id="simBtn">Open in simulator</button>':''}<button class="btn" id="nextBtn">Next circuit</button></div>
 <details class="formulas"><summary>Formulas for ${topicName(q.topic)}</summary><ul>${FORMULAS[q.topic].map(f=>`<li>${f}</li>`).join('')}</ul></details></div></div>`;
 requestAnimationFrame(()=>fitAll(c));subify(c.querySelector('.qright'));attachTools(c,q.title);
 const z=$('ansZone');
 if(q.answer.type==='num'){z.innerHTML=`<div class="answer"><div class="meter"><div class="dmm"><input id="ans" inputmode="decimal" autocomplete="off" placeholder="0.00" aria-label="Your answer in ${q.answer.unit}"><span class="unit">${q.answer.unit}</span></div></div><button class="btn" id="checkBtn">Check</button></div><div class="err" id="err"></div>`;
  $('checkBtn').onclick=checkNum;$('ans').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();cur.done?next():checkNum();}});$('ans').addEventListener('input',()=>$('err').textContent='');setTimeout(()=>$('ans').focus({preventScroll:true}),0);}
 else{z.innerHTML=`<div class="opts">${q.answer.options.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join('')}</div>`;subify(z);z.querySelectorAll('.opt').forEach(b=>b.onclick=()=>checkMC(+b.dataset.i,b));}
 $('hintBtn').onclick=showHint;$('solBtn').onclick=()=>reveal(false);$('nextBtn').onclick=next;$('askBtn').onclick=askClaude;$('calcBtn').onclick=()=>toggleCalc();if(!$('calc').hidden)preview();if(hasSim)$('simBtn').onclick=()=>{loadSim(cur.sch,cur.title);location.hash='#sim';};
 updHint();window.scrollTo({top:0});}
function updHint(){const b=$('hintBtn'),t=cur.hints.length,n=cur.hintN;b.textContent=cur.done?'Hints':n>=t?'No more hints':`Hint ${n+1} of ${t}`;b.disabled=n>=t||cur.done;}
function showHint(){if(!cur||cur.done||cur.hintN>=cur.hints.length)return;const li=document.createElement('li');li.dataset.n=cur.hintN+1;li.innerHTML=hl(cur.hints[cur.hintN]);subify(li);$('hints').appendChild(li);cur.hintN++;cur.usedHelp=true;updHint();}
function record(ok){if(cur.recorded)return;cur.recorded=true;const st=stats[cur.topic]||{a:0,c:0};st.a++;session.tried++;
 dayMark();const clean=ok&&!cur.usedHelp;if(clean){st.c++;session.first++;session.streak++;}else session.streak=0;
 const mk=G.find(g=>g.topic===cur.topic&&g===lastGen)?.key;if(mk){const M=stats.miss||(stats.miss={});if(!ok)M[mk]=(M[mk]||0)+1;else if(clean&&M[mk]){M[mk]--;if(!M[mk])delete M[mk];}}stats[cur.topic]=st;store.set('bench.stats',stats);renderScore();renderSide();}
function fmtAns(a){return `${showVal(a.value,a)} ${a.unit}`;}
function checkNum(){
 if(cur.done)return;const raw=$('ans').value.trim().replace(',','.').replace(/[^0-9eE+\-.]/g,'');const x=parseFloat(raw);
 if(raw===''||!isFinite(x)){$('err').textContent=`Enter a number in ${cur.answer.unit}.`;return;}
 const a=cur.answer,ok=Math.abs(x-a.value)<=Math.max(a.tol*Math.abs(a.value),a.abs,1e-9);
 if(ok){record(true);$('fb').className='feedback good';$('fb').textContent=cur.usedHelp?`Correct: ${fmtAns(a)}. (Hints used, so it won’t count toward your streak.)`:`Correct: ${fmtAns(a)}.`;reveal(true);}
 else{record(false);$('fb').className='feedback bad';const ratio=a.value!==0?x/a.value:null;let msg=`Not quite. Your answer is ${x>a.value?'too high':'too low'}.`;
  if(ratio&&Math.abs(Math.log10(Math.abs(ratio))-Math.round(Math.log10(Math.abs(ratio))))<0.02&&Math.round(Math.log10(Math.abs(ratio)))!==0)msg+=' It’s off by a power of 10, so check your units and prefixes.';
  else if(ratio&&Math.abs(ratio+1)<0.03)msg+=' The magnitude is right; check the sign.';
  $('fb').textContent=msg+' Try again, take a hint, or show the solution.';}}
function checkMC(i,btn){
 if(cur.done)return;const ok=i===cur.answer.correct;
 if(ok){btn.classList.add('right');record(true);$('fb').className='feedback good';$('fb').textContent=cur.usedHelp?'Correct. (Hints or retries used, so it won’t count toward your streak.)':'Correct.';reveal(true);}
 else{btn.classList.add('wrong');btn.disabled=true;record(false);cur.usedHelp=true;$('fb').className='feedback bad';$('fb').textContent='Not that one. Try another, or take a hint.';}}
function reveal(solved){
 if(!cur)return;if(!solved){record(false);if(!cur.done){$('fb').className='feedback';$('fb').textContent=cur.answer.type==='num'?`Answer: ${fmtAns(cur.answer)}.`:'';}}
 cur.done=true;if(cur.answer.type==='mc')$('ansZone').querySelectorAll('.opt').forEach((b,i)=>{b.disabled=true;if(i===cur.answer.correct)b.classList.add('right');});
 const inp=$('ans');if(inp)inp.readOnly=true;if(!$('calc').hidden)preview();const cb=$('checkBtn');if(cb)cb.disabled=true;
 $('sol').innerHTML=`<div class="solution"><h4>Worked solution</h4>${cur.solution}<p class="angle"><b>Interview angle:</b> ${cur.takeaway}</p></div>`;subify($('sol'));
 $('solBtn').disabled=true;updHint();$('nextBtn').focus({preventScroll:true});}

/* ---------- Ask Claude ---------- */
const strip=h=>h.replace(/<br\s*\/?>/g,'\n').replace(/<\/p>/g,'\n').replace(/<[^>]+>/g,'').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&amp;/g,'&').replace(/\n{3,}/g,'\n\n').trim();
function claudePrompt(q){
 let t=`I'm preparing for a technical interview for a hardware test engineering role, which includes circuit troubleshooting. Help me work through this practice problem step by step. Explain the reasoning the way an interviewer would want to hear it, and ask me to try each step before you show it.\n\nProblem: ${q.title}\n${strip(q.prompt)}\n`;
 if(q.sch)t+=`\nCircuit, transcribed from the schematic:\n${describe(q.sch.N)}\n`;
 if(q.answer.type==='mc')t+=`\nAnswer choices:\n${q.answer.options.map((o,i)=>`${'ABCDE'[i]}. ${o}`).join('\n')}\n`;else t+=`\nThe answer should be given in ${q.answer.unit}.\n`;
 t+=`\nAssumptions: silicon diode drop 0.7 V, LED forward voltage as stated, BJT VBE 0.7 V and VCE(sat) 0.2 V, ideal op-amps.`;
 if(q.done)t+=`\n\nI've already seen the answer (${q.answer.type==='mc'?q.answer.options[q.answer.correct]:fmtAns(q.answer)}). Help me understand why, and give me a similar problem to try.`;
 return t;}
function askClaude(){const t=claudePrompt(cur);try{navigator.clipboard.writeText(t);}catch(e){}
 window.open('https://claude.ai/new?q='+encodeURIComponent(t),'_blank','noopener');toast('Opened Claude in a new tab. The prompt is also on your clipboard if it doesn’t prefill.');}

/* ---------- learn ---------- */
function renderLearn(id){
 const L=LESSONS.find(l=>l.id===id)||LESSONS[0];
 const dn=prefs.done||[];$('lnav').innerHTML=`<p class="note" style="margin:0 0 10px">${dn.length}/${LESSONS.length} lessons done</p>`+LESSONS.map((l,i)=>{const f=FOCUS.includes(l.id),pf=i>0&&FOCUS.includes(LESSONS[i-1].id);return (i===0&&f?'<div class="lgroup">Recruiter focus</div>':!f&&pf?'<div class="lgroup">Everything else</div>':'')+`<a href="#learn/${l.id}" class="${l===L?'on':''}">${dn.includes(l.id)?'<span class="done">✓</span> ':''}${l.title}<small>${l.sub}</small></a>`;}).join('');
 const m=$('lesson');m.innerHTML=`<h2>${L.title}</h2><p class="lead">${L.lead}</p>${L.sections.map((s,i)=>`<h3>${s.h}</h3>${s.html}${s.w?`<div data-w="${i}"></div>`:''}`).join('')}<div class="tools" style="margin-top:30px"><button class="btn ghost" id="lDone">${dn.includes(L.id)?'✓ Done':'Mark as done'}</button><button class="btn" id="lPractice">Practice ${L.title}</button>${LESSONS.indexOf(L)<LESSONS.length-1?`<a class="btn ghost" style="text-decoration:none" href="#learn/${LESSONS[LESSONS.indexOf(L)+1].id}">Next lesson: ${LESSONS[LESSONS.indexOf(L)+1].title}</a>`:''}</div>`;
 subify(m);m.querySelectorAll('[data-w]').forEach(d=>{d.dataset.name=L.sections[+d.dataset.w].h;mountWidget(d,L.sections[+d.dataset.w].w());});
 $('lDone').onclick=()=>{const d=prefs.done||[];const i=d.indexOf(L.id);if(i<0)d.push(L.id);else d.splice(i,1);prefs.done=d;store.set('bench.prefs',prefs);renderLearn(L.id);};
 $('lPractice').onclick=()=>{prefs.missMode=false;prefs.topics=[L.id];store.set('bench.prefs',prefs);renderSide();location.hash='#practice';next();};
 window.scrollTo({top:0});}

/* ---------- cheatsheet ---------- */
function renderCheat(){if($('cheat').dataset.done)return;$('cheat').dataset.done=1;
 $('cheat').innerHTML=`<div class="row" style="justify-content:space-between"><div><h2>Cheatsheet</h2><p class="lead">Everything on one page. Print it or skim it right before the interview.</p></div><button class="btn ghost noprint" onclick="window.print()">Print</button></div><div class="cgrid">${CHEAT.map(([h,b])=>`<div class="ccard"><h3>${h}</h3>${b}</div>`).join('')}</div>`;subify($('cheat'));}

/* ---------- simulator ---------- */
const sim={sch:null,title:'',faults:{},vals:{},sel:null,hidden:null,guess:null,all:true,gi:null};
let LIB=null;
function lib(){if(LIB)return LIB;LIB=[];const seen=new Set();G.forEach((g,gi)=>{for(let k=0;k<6;k++){LAST_SCH=null;let q=null;try{q=g.fn();}catch(e){}if(!q||!q.svg||!LAST_SCH)continue;if(LAST_SCH.N.unsupported)break;if(seen.has(q.title))break;seen.add(q.title);LIB.push({gi,title:q.title,topic:g.topic});break;}});return LIB;}
function loadSim(sch,title,gi=null){Object.assign(sim,{sch,title,faults:{},vals:{},sel:null,hidden:null,guess:null,gi,tr:null});if(view==='sim')renderSim();}
function libLoad(gi){let q=null;for(let k=0;k<10&&!q;k++){LAST_SCH=null;q=G[gi].fn();}loadSim(LAST_SCH,q.title,gi);}
function renderSim(){
 const L=lib();if(!sim.sch)libLoad(L[0].gi);
 $('simwrap').innerHTML=`<div class="simbar"><select id="simLib" aria-label="Circuit library"><option value="">${sim.gi==null?'From practice: '+sim.title:'Choose a circuit…'}</option>${TOPICS.map(t=>{const it=L.filter(x=>x.topic===t.id);return it.length?`<optgroup label="${t.name}">${it.map(x=>`<option value="${x.gi}" ${x.gi===sim.gi?'selected':''}>${x.title}</option>`).join('')}</optgroup>`:'';}).join('')}</select>
 ${sim.gi!=null?'<button class="btn ghost" id="simNew">New values</button>':''}<button class="btn ghost" id="simFault">${sim.hidden?'New hidden fault':'Hide a random fault'}</button><button class="btn ghost" id="simReset">Clear faults</button>
 <div class="seg" id="simMode"><button data-mode="dc" class="${sim.mode!=='tran'?'on':''}">DC</button><button data-mode="tran" class="${sim.mode==='tran'?'on':''}">Transient</button></div><label class="toggle" ${sim.mode==='tran'?'style="display:none"':''}><input type="checkbox" id="simAll" ${sim.all?'checked':''}> Show node voltages</label></div>
 <div class="simgrid"><div><div class="sheet" id="simSheet"></div><div id="simPlotBox"></div><p class="note" id="simHelp">Hover any wire to measure it like a DMM. Click a part to change its value or make it open or shorted. Switches toggle when clicked.</p></div><div class="simside" id="simSide"></div></div>
 <div class="sandbox"><h3 style="margin:0 0 6px">Free-build sandbox</h3><p class="note" style="max-width:75ch">For building anything from scratch, this embeds Falstad’s open-source CircuitJS simulator (animated currents, scopes, transient analysis). There is no browser version of LTspice itself; CircuitJS is the closest interactive option, and ngspice/EEcircuit covers netlist-level SPICE.</p><div class="row"><button class="btn ghost" id="sbBtn">Load sandbox here</button><a class="linkish" href="https://www.falstad.com/circuit/circuitjs.html" target="_blank" rel="noopener">Open CircuitJS in a new tab</a><a class="linkish" href="https://eecircuit.com" target="_blank" rel="noopener">EEcircuit (ngspice in the browser)</a></div><div id="sbFrame"></div></div>`;
 $('simLib').onchange=e=>{if(e.target.value!=='')libLoad(+e.target.value);};
 if($('simNew'))$('simNew').onclick=()=>libLoad(sim.gi);
 $('simFault').onclick=hideFault;$('simReset').onclick=()=>{sim.faults={};sim.hidden=null;sim.guess=null;drawSim();};
 $('simAll').onchange=e=>{sim.all=e.target.checked;drawSim();};
 $('simMode').querySelectorAll('button').forEach(b=>b.onclick=()=>{sim.mode=b.dataset.mode;renderSim();});
 $('sbBtn').onclick=()=>{$('sbFrame').innerHTML='<iframe src="https://www.falstad.com/circuit/circuitjs.html" title="CircuitJS sandbox" loading="lazy"></iframe><p class="note">If the frame stays blank, use “Open CircuitJS in a new tab.”</p>';};
 drawSim();}
function allFaults(){const f={...sim.faults};if(sim.hidden)f[sim.hidden.ref]={mode:sim.hidden.mode};return f;}
function compGeom(d){if(d.a){const cx=(d.a[0]+d.b[0])/2,cy=(d.a[1]+d.b[1])/2,ang=Math.atan2(d.b[1]-d.a[1],d.b[0]-d.a[0])*180/Math.PI;return{cx,cy,ang,w:46,h:30};}
 if(d.type==='opamp')return{cx:d.src.x+2,cy:d.src.y,ang:0,w:72,h:76};if(d.type==='npn'||d.type==='nmos')return{cx:d.src.x-6,cy:d.src.y,ang:0,w:44,h:76};
 if(d.type==='rail')return{cx:d.p[0],cy:d.p[1]-14,ang:0,w:44,h:34};if(d.type==='term')return{cx:d.p[0],cy:d.p[1],ang:0,w:22,h:22};return null;}
function drawSim(){
 if(sim.mode==='tran'){$('simHelp').textContent='Click a wire to plot its voltage over time. Set input waveforms and the stop time on the right.';drawTran();return;}
 const pb=$('simPlotBox');if(pb)pb.innerHTML='';
 const s=sim.sch,N=s.N,ex=extract(N),D=devices(N),F=allFaults(),r=simulate(N,ex,D,F,sim.vals);sim.last={ex,D,r};
 let ov='';
 if(!sim.hidden)D.forEach(d=>{const f=sim.faults[d.ref];if(!f)return;const g=compGeom(d);if(!g)return;
  ov+=f.mode==='open'?`<g transform="translate(${g.cx} ${g.cy})"><path class="fx" d="M-10 -10 L10 10 M10 -10 L-10 10"/><text class="ft" x="-16" y="5" text-anchor="end">OPEN</text></g>`:`<line class="fx" x1="${d.a?d.a[0]:g.cx-20}" y1="${d.a?d.a[1]:g.cy-30}" x2="${d.b?d.b[0]:g.cx-20}" y2="${d.b?d.b[1]:g.cy+30}" style="stroke-dasharray:6 4"/><text class="ft" x="${g.cx-16}" y="${g.cy+5}" text-anchor="end">SHORT</text>`;});
 N.wires.forEach(w=>{ov+=`<polyline class="whit" data-net="${ex.root(w[0])}" points="${w.map(p=>p.join(',')).join(' ')}"/>`;});
 if(sim.all&&!sim.hidden&&!r.error){const done=new Set();
  const cand=[...N.probes.map(q=>q.p),...N.terms.map(t=>t.p),...N.dots,...N.comps.flatMap(c=>[c.a,c.b]),...N.wires.flat()];
  cand.forEach(p=>{const k=ex.root(p);if(k===ex.G0||done.has(k))return;done.add(k);const t=fmtV(r.netV(p)),w=t.length*7+10;ov+=`<g style="pointer-events:none"><rect class="vtb" x="${p[0]+7}" y="${p[1]-24}" width="${w}" height="17" rx="4"/><text class="vt" x="${p[0]+12}" y="${p[1]-11}">${t}</text></g>`;});}
 D.forEach(d=>{const g=compGeom(d);if(!g)return;ov+=`<g transform="translate(${g.cx} ${g.cy}) rotate(${g.ang})"><rect class="hit ${sim.sel===d.ref?'sel':''}" data-ref="${d.ref}" x="${-g.w/2}" y="${-g.h/2}" width="${g.w}" height="${g.h}" rx="5"/></g>`;});
 const svg=`<svg data-fit="1" viewBox="0 0 ${s.w} ${s.h}" role="img" aria-label="Interactive schematic"><g class="base">${s.o.join('')}</g>${ov}</svg>`;
 const sh=$('simSheet');sh.dataset.name=sim.title;sh.innerHTML=svg;attachTools(sh.parentElement,sim.title);sh.querySelectorAll('.probe').forEach(p=>p.style.display='none');requestAnimationFrame(()=>fitAll(sh));
 const tip=$('tip');
 sh.querySelectorAll('.whit').forEach(w=>{w.onmousemove=e=>{if(r.error)return;const n=ex.nets.get(w.dataset.net);tip.textContent=`${n?n.name:'net'}: ${fmtV(r.volt.get(w.dataset.net)??0)}`;tip.style.display='block';tip.style.left=e.clientX/UZ()+14+'px';tip.style.top=e.clientY/UZ()+12+'px';};w.onmouseleave=()=>tip.style.display='none';});
 sh.querySelectorAll('.hit').forEach(h=>h.onclick=()=>{const d=D.find(x=>x.ref===h.dataset.ref);if(d.type==='sw'&&!sim.hidden){sim.vals[d.ref]=!(sim.vals[d.ref]??d.value);}sim.sel=d.ref;drawSim();});
 drawSide(ex,D,r);}
function devReadout(d,r){const I=r.I?r.I[d.ref]:null;if(I==null)return '';
 if(typeof I==='object'){if(d.type==='npn')return `Region: <b>${{off:'cutoff',act:'active',sat:'saturated',bd:'avalanche breakdown (VCE ≈ 60 V)'}[I.st]}</b><br>Ib = ${fmtI(I.ib)}, Ic = ${fmtI(I.ic)}`;if(d.type==='nmos')return `State: <b>${I.st}</b><br>Id = ${fmtI(I.id)}`;if(d.type==='opamp')return `Output: <b>${{lin:'linear',hi:'at + rail',lo:'at − rail'}[I.st]}</b>`;return '';}
 if(d.a){const v=r.netV(d.a)-r.netV(d.b);return `V across = <b>${fmtV(v)}</b><br>I = <b>${fmtI(Math.abs(I))}</b><br>P = <b>${eng(Math.abs(v*I),'W')}</b>`;}
 return `Supplying <b>${fmtI(I)}</b>`;}
function drawSide(ex,D,r){
 const side=$('simSide');let h=`<h4>${sim.title}</h4>`;
 if(r.error)h+=`<p class="warn">${r.error}</p>`;
 if(sim.hidden){h+=`<p><b>A hidden fault is active.</b> Hover wires to take measurements. When you know which part failed, click it, then choose open or shorted.</p>`;
  const d=D.find(x=>x.ref===sim.sel);if(d)h+=`<p>Suspect: <b>${d.name}</b></p><div class="seg" style="margin-bottom:10px"><button data-g="open">It’s open</button><button data-g="short">It’s shorted</button></div>`;
  if(sim.guess)h+=`<p class="verdict ${sim.guess.ok?'good':'bad'}">${sim.guess.msg}</p>`;
  h+=`<button class="btn ghost" id="revealF">Reveal the fault</button>`;}
 else{const d=D.find(x=>x.ref===sim.sel);
  if(d){const f=sim.faults[d.ref]?.mode||'normal',v=sim.vals[d.ref]??d.value,canF=!['src','isrc','rail','term','opamp'].includes(d.type),canV=['res','src','isrc','cap','led','zener','rail','term','npn','nmos','photo'].includes(d.type);
   h+=`<p style="margin:0 0 6px"><b>${d.name}</b> <span class="note">${d.type}</span></p>`;
   if(d.type==='sw')h+=`<p>Switch is <b>${v?'closed':'open'}</b>. Click it on the schematic to toggle.</p>`;
   if(canV)h+=`<label class="note" for="valIn">Value (${d.unit}); accepts 4.7k, 100n…</label><input type="text" id="valIn" value="${typeof v==='number'?sig(v,4):''}" style="margin:3px 0 10px">`;
   if(canF)h+=`<div class="seg" style="margin-bottom:10px">${['normal','open','short'].map(m=>`<button data-m="${m}" class="${f===m?'on':''}">${m[0].toUpperCase()+m.slice(1)}</button>`).join('')}</div>`;
   if(!r.error)h+=`<p style="margin:0 0 12px">${devReadout(d,r)}</p>`;}
  else h+=`<p class="note">Click a part to edit it.</p>`;
  if(!r.error){const rows=[...ex.nets.values()].filter(n=>!n.gnd).map(n=>`<tr><td>${n.name}</td><td>${fmtV(r.volt.get(n.root)??0)}</td></tr>`).join('');h+=`<h4>Node voltages</h4><table>${rows}</table>`;
   const crow=D.filter(d=>d.type==='res').map(d=>{const I=r.I[d.ref],v=r.netV(d.a)-r.netV(d.b),P=I!=null?Math.abs(v*I):0;return `<tr><td>${d.name}</td><td>${I!=null?fmtI(Math.abs(I)):'open'}</td><td>${eng(P,'W')}${P>0.25?' <span class="warn">over ¼ W</span>':''}</td></tr>`;}).join('');
   if(crow)h+=`<h4>Resistors</h4><table><tr><th>Part</th><th>Current</th><th>Power</th></tr>${crow}</table>`;}
  h+=`<p class="note">Values are true values, including any shown as “?” in the practice question.</p>`;}
 side.innerHTML=h;subify(side);
 const vi=$('valIn');if(vi)vi.onchange=()=>{const x=parseVal(vi.value);if(isFinite(x)&&x>=0){sim.vals[sim.sel]=x;drawSim();}else toast('Enter a number, e.g. 4.7k or 100n.');};
 side.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const m=b.dataset.m;if(m==='normal')delete sim.faults[sim.sel];else sim.faults[sim.sel]={mode:m};drawSim();});
 side.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{const ok=sim.sel===sim.hidden.ref&&b.dataset.g===sim.hidden.mode,d=D.find(x=>x.ref===sim.sel);sim.guess={ok,msg:ok?`Correct: ${d.name} is ${sim.hidden.mode==='open'?'open':'shorted'}.`:sim.sel===sim.hidden.ref?'Right part, wrong failure mode.':'Not that one. Keep measuring.'};drawSim();});
 const rv=$('revealF');if(rv)rv.onclick=()=>{const d=D.find(x=>x.ref===sim.hidden.ref);sim.faults={[sim.hidden.ref]:{mode:sim.hidden.mode}};sim.hidden=null;sim.guess=null;sim.sel=d.ref;toast(`The fault was ${d.name} ${d.type==='res'||d.type==='cap'?'':''}${sim.faults[d.ref].mode==='open'?'open':'shorted'}.`);drawSim();};}
function hideFault(){const N=sim.sch.N,ex=extract(N),D=devices(N),base=simulate(N,ex,D,{},sim.vals);if(base.error){toast('Fix the circuit first.');return;}
 const cands=D.filter(d=>['res','led','diode','zener','cap','coil','npn','nmos'].includes(d.type));
 for(let t=0;t<60;t++){const d=pick(cands),mode=pick(['open','short']),r=simulate(N,ex,D,{[d.ref]:{mode}},sim.vals);if(r.error)continue;let diff=0;for(const [k,v] of base.volt)diff=Math.max(diff,Math.abs(v-(r.volt.get(k)??0)));if(diff>0.15){sim.faults={};sim.hidden={ref:d.ref,mode};sim.guess=null;sim.sel=null;drawSim();toast('A random part has failed. Find it.');return;}}
 toast('Couldn’t find a fault that changes this circuit noticeably.');}

/* ---------- router ---------- */
function route(){const h=(location.hash||'#home').slice(1).split('/'),V=['home','practice','interview','learn','cards','cheat','sim'],v=V.includes(h[0])?h[0]:'home';view=v;document.title={home:'Home',practice:'Practice',interview:'Interview',learn:'Learn',cards:'Cards',cheat:'Cheatsheet',sim:'Simulator'}[v]+' · Circuit Bench';
 document.querySelectorAll('.view').forEach(x=>x.classList.toggle('on',x.id==='v-'+v));document.querySelectorAll('.tabs a').forEach(a=>a.classList.toggle('on',a.dataset.v===v));$('tip').style.display='none';
 if(v==='home')renderHome();else if(v==='practice'){if(!cur)next();else requestAnimationFrame(()=>fitAll($('card')));}
 else if(v==='interview')renderInterview(h[1],h[2]);else if(v==='cards')renderCards(h[1]);
 else if(v==='learn')renderLearn(h[1]);else if(v==='cheat')renderCheat();else renderSim();if(!$('calc').hidden)preview();
 // keep the active tab visible in the (horizontally scrolling) tab bar without moving the page
 const on=document.querySelector('.tabs a.on');if(on){const tb=on.parentElement,r=on.getBoundingClientRect(),t=tb.getBoundingClientRect();if(r.left<t.left||r.right>t.right)tb.scrollLeft+=r.left-t.left-(t.width-r.width)/2;}}
