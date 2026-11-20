"use strict";
/* ================= v2 app: home, interview, cards, search, theme ================= */
const dayStr=(d=new Date())=>d.toLocaleDateString('en-CA');
const txt=h=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent.trim();};
function dayMark(){const t=dayStr(),d=prefs.days||[];if(d[d.length-1]===t)return;prefs.days=[...new Set([...d,t])].slice(-200);store.set('bench.prefs',prefs);}
function streak(){const set=new Set(prefs.days||[]);let n=0;const d=new Date();if(!set.has(dayStr(d)))d.setDate(d.getDate()-1);while(set.has(dayStr(d))){n++;d.setDate(d.getDate()-1);}return n;}
function mastery(id){const st=stats[id];return st&&st.a?(st.c/st.a)*Math.min(1,st.a/8):0;}
function readiness(){const circ=TOPICS.reduce((a,t)=>a+mastery(t.id),0)/TOPICS.length,mk=(prefs.mocks||[]).slice(-3),mock=mk.length?mk.reduce((a,m)=>a+m.score/m.n,0)/mk.length:0;
 return{total:Math.round(100*(0.75*circ+0.25*mock)),circ,mock};}
function practiceTopic(id){prefs.topics=[id];prefs.missMode=false;store.set('bench.prefs',prefs);renderSide();cur=null;location.hash='#practice';if(view==='practice')next();}
/* ---------- home ---------- */
let homeHtml='';
function renderHome(live){
 const R=readiness(),el=$('home'),tm=TOPICS.map(t=>({t,m:mastery(t.id),st:stats[t.id]||{a:0,c:0}})),weak=[...tm].sort((a,b)=>a.m-b.m||a.st.a-b.st.a),mocks=prefs.mocks||[],last=mocks[mocks.length-1],due=cardsDue().length,misses=missCount(),S=streak();
 const acts=[],w=weak[0];
 if(w)acts.push(w.st.a<3?{t:`Start ${w.t.name}`,d:w.st.a?`Only ${w.st.a} ${w.st.a===1?'try':'tries'} so far. Read the lesson, then do a few more.`:'You haven’t practiced this yet. Read the lesson, then try a few.',href:'#learn/'+w.t.id,b:'Open lesson'}:{t:`Drill ${w.t.name}`,d:`Your weakest topic: ${w.st.c} of ${w.st.a} right on the first try.`,topic:w.t.id,b:'Practice'});
 if(!last||Date.now()-last.d>3*864e5)acts.push({t:'Take a mock interview',d:last?'It’s been a few days since your last one.':'Ten mixed questions, timed, no hints. This is the best measure of where you stand.',href:'#interview/mock',b:'Start'});
 if(due)acts.push({t:`Review ${due} flashcard${due>1?'s':''}`,d:'Short recall reps keep formulas and definitions fresh.',href:'#cards',b:'Review'});
 if(misses)acts.push({t:`Revisit ${misses} missed question${misses>1?'s':''}`,d:'The same question types come back with new values until you get them right.',miss:1,b:'Revisit'});
 const unrated=EXPLAIN.find(x=>!(prefs.verbal||{})[x[0]]);if(unrated)acts.push({t:'Explain one out loud',d:txt(unrated[2]),href:'#interview/x/'+unrated[0],b:'Try it'});
 let cd='';if(prefs.idate){const n=Math.ceil((new Date(prefs.idate+'T00:00')-new Date(dayStr()+'T00:00'))/864e5);cd=n>1?`${n} days to go`:n===1?'Tomorrow':n===0?'Today. Good luck!':'Date has passed';}
 const days=[];for(let i=27;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(dayStr(d));}const dset=new Set(prefs.days||[]);
 const C=2*Math.PI*52,pct=v=>Math.round(v*100)+'%',tries=TOPICS.reduce((a,t)=>a+((stats[t.id]||{}).a||0),0),right=TOPICS.reduce((a,t)=>a+((stats[t.id]||{}).c||0),0);
 const html=`<div class="hgrid"><div class="hcard hring"><svg viewBox="0 0 140 140" role="img" aria-label="Readiness ${R.total} percent"><circle cx="70" cy="70" r="52" class="rg-bg"/><circle cx="70" cy="70" r="52" class="rg-fg" stroke-dasharray="${C*R.total/100} ${C}" transform="rotate(-90 70 70)"/><text x="70" y="68" class="rg-n">${R.total}</text><text x="70" y="90" class="rg-l">readiness</text></svg>
  <p class="note" style="text-align:center;margin:6px 0 12px">Three quarters from topic mastery, one quarter from your last three mock interviews.</p>
  <div class="hstat"><span><b>${S}</b> day streak</span><span><b>${(prefs.days||[]).length}</b> day${(prefs.days||[]).length===1?'':'s'} practiced</span></div>
  <div class="heat" aria-label="Last 28 days">${days.map(d=>`<i class="${dset.has(d)?'on':''}" title="${d}"></i>`).join('')}</div>
  <label class="hdate">Interview date <input type="date" id="idate" value="${prefs.idate||''}"></label>${cd?`<p class="hcd">${cd}</p>`:''}</div>
 <div class="hcard"><h3 class="hh">Do this next</h3><div class="acts">${acts.slice(0,4).map((a,i)=>`<div class="act"><div><b>${a.t}</b><p>${a.d}</p></div>${a.href?`<a class="btn${i?' ghost':''}" href="${a.href}">${a.b}</a>`:`<button class="btn${i?' ghost':''}" ${a.topic?`data-topic="${a.topic}"`:'data-miss="1"'}>${a.b}</button>`}</div>`).join('')}</div>
  <div class="hmini"><a href="#practice"><b>${tries}</b>Questions tried</a><a href="#practice"><b>${tries?pct(right/tries):'–'}</b>Right first try</a><a href="#learn"><b>${(prefs.done||[]).length}/${LESSONS.length}</b>Lessons</a><a href="#cards"><b>${cardsAll().filter(c=>((prefs.srs||{})[c.id]||[0])[0]>=3).length}/${cardsAll().length}</b>Cards learned</a><a href="#interview/mock"><b>${mocks.length?pct(last.score/last.n):'–'}</b>Last mock</a></div>
  <p class="note" style="margin:14px 0 0">Coding, C and firmware questions live in <a href="https://claude.ai/artifact/FKqcX3pmMQ4kCHR1uwmQja" target="_blank" rel="noopener">Daily Reps</a>. This site is circuits and hardware only.</p></div></div>
 <div class="hcard" style="margin-top:20px"><h3 class="hh">Topic mastery <span class="note" style="font-weight:400">weakest first · accuracy on the first try, discounted until you have 8 attempts</span></h3>
  <div class="trows">${weak.map(x=>`<div class="trow"><span class="tn">${x.t.name}</span><span class="bar"><i style="width:${Math.round(x.m*100)}%"></i></span><span class="tp">${x.st.a?`${pct(x.st.c/x.st.a)} · ${x.st.a} ${x.st.a===1?'try':'tries'}`:'not started'}</span><a class="linkish" href="#learn/${x.t.id}">Lesson</a><button class="btn ghost sm" data-topic="${x.t.id}">Practice</button></div>`).join('')}</div></div>
 ${mocks.length?`<div class="hcard" style="margin-top:20px"><h3 class="hh">Mock interviews</h3>${plot({w:900,h:180,x:[0.5,Math.max(5,mocks.length)+0.5],y:[0,105],xfmt:x=>Number.isInteger(x)?'#'+x:'',yfmt:y=>y+'%',series:[{pts:mocks.map((m,i)=>[i+1,100*m.score/m.n]),cls:'pl1'}],pts:mocks.map((m,i)=>({x:i+1,y:100*m.score/m.n})),xlabel:'attempt',ylabel:'score'})}</div>`:''}`;
 if(live&&(html===homeHtml||document.activeElement===$('idate')))return;
 homeHtml=html;el.innerHTML=html;
 $('idate').onchange=e=>{prefs.idate=e.target.value;store.set('bench.prefs',prefs);renderHome();};
 el.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>practiceTopic(b.dataset.topic));
 el.querySelectorAll('[data-miss]').forEach(b=>b.onclick=()=>{prefs.missMode=true;store.set('bench.prefs',prefs);renderSide();cur=null;location.hash='#practice';});
 if(!live)window.scrollTo({top:0});}
/* Keeps Home current without a reload: picks up progress made in another tab or on another device,
   and rolls the streak, countdown and due cards over at midnight. */
function homeRefresh(){if(view==='home'&&document.visibilityState!=='hidden')renderHome(true);}
function homeLiveInit(){setInterval(homeRefresh,20000);document.addEventListener('visibilitychange',homeRefresh);window.addEventListener('focus',homeRefresh);
 window.addEventListener('storage',e=>{if(e.key==='bench.stats')stats=store.get('bench.stats',{});else if(e.key==='bench.prefs')prefs=store.get('bench.prefs',prefs);else return;renderSide();homeRefresh();});}
/* ---------- interview: mock + explain ---------- */
const mock={on:false,qs:[],i:0,t0:0,limit:0,tick:null,result:null};
function renderInterview(sub,id){
 const V=prefs.verbal||{},cats=[...new Set(EXPLAIN.map(x=>x[1]))];if(sub!=='x')sub='mock';
 $('ivnav').innerHTML=`<a href="#interview/mock" class="${sub==='mock'?'on':''}">Mock interview<small>Timed, mixed topics, no hints</small></a>`+cats.map(c=>`<div class="lgroup">Explain: ${c}</div>`+EXPLAIN.filter(x=>x[1]===c).map(x=>`<a href="#interview/x/${x[0]}" class="${sub==='x'&&id===x[0]?'on':''}">${V[x[0]]===3?'<span class="done">✓</span> ':V[x[0]]?'<span class="done" style="color:var(--ink2)">~</span> ':''}${txt(x[2]).replace(/\.$/,'')}</a>`).join('')).join('');
 if(sub==='x')renderExplain(EXPLAIN.find(x=>x[0]===id)||EXPLAIN[0]);else if(mock.on)mockRender();else if(mock.result)mockResults();else mockSetup();window.scrollTo({top:0});}
function mockSetup(){const c=prefs.mockCfg||{n:10,per:2,scope:'all'},mocks=prefs.mocks||[],seg=(k,opts)=>`<div class="seg" data-k="${k}">${opts.map(([v,l])=>`<button data-v="${v}" class="${String(c[k])===String(v)?'on':''}">${l}</button>`).join('')}</div>`;
 $('ivmain').innerHTML=`<div class="lesson"><h2>Mock interview</h2><p class="lead">Mixed questions against the clock, with no hints and no feedback until the end, like the real thing. Use the whiteboard and calculator as you would scratch paper.</p>
 <div class="hcard"><div class="mkopt"><span>Questions</span>${seg('n',[[5,'5'],[10,'10'],[15,'15'],[20,'20']])}</div><div class="mkopt"><span>Time per question</span>${seg('per',[[1.5,'1.5 min'],[2,'2 min'],[3,'3 min']])}</div><div class="mkopt"><span>Topics</span>${seg('scope',[['all','All'],['weak','My 5 weakest'],['sel','My Practice selection']])}</div>
 <button class="btn" id="mkGo" style="margin-top:8px">Start mock interview</button></div>
 ${mocks.length?`<h3>History</h3><table><tr><th>Date</th><th>Score</th><th>Time used</th></tr>${mocks.slice(-8).reverse().map(m=>`<tr><td>${new Date(m.d).toLocaleDateString()}</td><td><b>${m.score}/${m.n}</b> (${Math.round(100*m.score/m.n)}%)</td><td>${Math.floor(m.secs/60)}:${String(m.secs%60).padStart(2,'0')}</td></tr>`).join('')}</table>`:''}</div>`;
 $('ivmain').querySelectorAll('.seg').forEach(s=>s.querySelectorAll('button').forEach(b=>b.onclick=()=>{c[s.dataset.k]=isNaN(+b.dataset.v)?b.dataset.v:+b.dataset.v;prefs.mockCfg=c;store.set('bench.prefs',prefs);mockSetup();}));
 $('mkGo').onclick=()=>mockStart(c);}
function mockStart(c){let ids=TOPICS.map(t=>t.id);if(c.scope==='weak')ids=[...ids].sort((a,b)=>mastery(a)-mastery(b)).slice(0,5);else if(c.scope==='sel'&&prefs.topics.length)ids=prefs.topics;
 const byT={};G.forEach(g=>{if(ids.includes(g.topic))(byT[g.topic]=byT[g.topic]||[]).push(g);});const order=shuffle(Object.keys(byT)),qs=[],used=new Set();let k=0,guard=0;
 while(qs.length<c.n&&guard++<600){const t=order[k++%order.length],g=pick(byT[t]);if(used.has(g.key)&&guard<300)continue;let q=null;try{q=g.fn();}catch(e){}if(!q)continue;used.add(g.key);qs.push({...q,topic:t,key:g.key});}
 if(!qs.length){toast('No questions available for that selection.');return;}
 Object.assign(mock,{on:true,qs,i:0,t0:Date.now(),limit:Math.round(qs.length*c.per*60),result:null});clearInterval(mock.tick);mock.tick=setInterval(mockClock,500);mockRender();}
function mockLeft(){return Math.max(0,mock.limit-Math.floor((Date.now()-mock.t0)/1000));}
function mockClock(){if(!mock.on){clearInterval(mock.tick);return;}const s=mockLeft(),e=$('mkClock');if(e){e.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')} left`;e.classList.toggle('low',s<60);}if(s<=0)mockFinish();}
function mockRender(){const q=mock.qs[mock.i],el=$('ivmain'),n=mock.qs.length;
 el.innerHTML=`<div class="mk-top"><b>Question ${mock.i+1} of ${n}</b><span id="mkClock" class="mk-clock"></span><button class="btn ghost sm" id="mkEnd">End now</button></div><div class="mk-bar"><i style="width:${100*mock.i/n}%"></i></div>
 <div class="qgrid ${q.svg?'':'nosvg'}">${q.svg?`<div class="qleft"><div class="sheet" data-name="${q.title.replace(/"/g,'')}">${fitSvgTag(q.svg)}</div></div>`:''}<div class="qright"><div class="meta"><span class="pill">${topicName(q.topic)}</span></div><h3 class="qt">${q.title}</h3><div class="prompt">${q.prompt}</div><div id="mkAns"></div><div class="tools"><button class="btn ghost" id="mkSkip">Skip</button></div></div></div>`;
 const z=$('mkAns');
 if(q.answer.type==='num'){z.innerHTML=`<div class="answer"><div class="meter"><div class="dmm"><input id="mkIn" inputmode="decimal" autocomplete="off" placeholder="0.00" aria-label="Your answer in ${q.answer.unit}"><span class="unit">${q.answer.unit}</span></div></div><button class="btn" id="mkSub">Submit</button></div>`;
  const go=()=>{const raw=$('mkIn').value.trim().replace(',','.').replace(/[^0-9eE+\-.]/g,''),x=parseFloat(raw);if(raw===''||!isFinite(x)){toast('Enter a number, or press Skip.');return;}const a=q.answer;mockAnswer(`${x} ${a.unit}`,Math.abs(x-a.value)<=Math.max(a.tol*Math.abs(a.value),a.abs,1e-9));};
  $('mkSub').onclick=go;$('mkIn').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go();}};setTimeout(()=>$('mkIn')&&$('mkIn').focus({preventScroll:true}),0);}
 else{z.innerHTML=`<div class="opts">${q.answer.options.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join('')}</div>`;z.querySelectorAll('.opt').forEach(b=>b.onclick=()=>mockAnswer(txt(q.answer.options[+b.dataset.i]),+b.dataset.i===q.answer.correct));}
 $('mkSkip').onclick=()=>mockAnswer('skipped',false);$('mkEnd').onclick=()=>{if(confirm('End the mock now? Unanswered questions count as wrong.'))mockFinish();};
 requestAnimationFrame(()=>fitAll(el));subify(el.querySelector('.qright'));attachTools(el,q.title);mockClock();window.scrollTo({top:0});if(prefs.wbFollow)wbFollowNow();}
function mockAnswer(given,ok){const q=mock.qs[mock.i];q.given=given;q.ok=ok;mock.i++;if(mock.i>=mock.qs.length)mockFinish();else mockRender();}
function mockFinish(){if(!mock.on)return;mock.on=false;clearInterval(mock.tick);const secs=Math.min(mock.limit,Math.floor((Date.now()-mock.t0)/1000)),by={};let score=0;const M=stats.miss||(stats.miss={});
 mock.qs.forEach(q=>{const b=by[q.topic]||(by[q.topic]=[0,0]);b[1]++;const st=stats[q.topic]||(stats[q.topic]={a:0,c:0});st.a++;if(q.ok){score++;b[0]++;st.c++;}else M[q.key]=(M[q.key]||0)+1;});
 store.set('bench.stats',stats);prefs.mocks=[...(prefs.mocks||[]),{d:Date.now(),n:mock.qs.length,score,secs,by}].slice(-30);store.set('bench.prefs',prefs);dayMark();renderSide();mock.result={score,secs,by};if(view==='interview')mockResults();else toast('Time’s up: your mock interview has ended.');}
function mockResults(){const r=mock.result,n=mock.qs.length,p=Math.round(100*r.score/n),ans=q=>q.answer.type==='num'?`${showVal(q.answer.value)} ${q.answer.unit}`:txt(q.answer.options[q.answer.correct]);
 $('ivmain').innerHTML=`<div class="lesson" style="max-width:920px"><h2>Mock interview results</h2><div class="mk-score"><div><b>${r.score}/${n}</b><span>${p}%</span></div><p>${p>=85?'Strong. Keep the rhythm with a mock every few days.':p>=65?'Solid base. Work through the misses below, then drill those topics.':'Use this as a map: start with the topics at the top of the table.'}<br><span class="note">Time used: ${Math.floor(r.secs/60)}:${String(r.secs%60).padStart(2,'0')} of ${Math.floor(mock.limit/60)}:${String(mock.limit%60).padStart(2,'0')}</span></p></div>
 <h3>By topic</h3><table>${Object.entries(r.by).sort((a,b)=>a[1][0]/a[1][1]-b[1][0]/b[1][1]).map(([t,[c,a]])=>`<tr><td>${topicName(t)}</td><td><b>${c}/${a}</b></td><td><button class="btn ghost sm" data-topic="${t}">Practice</button> <a class="linkish" href="#learn/${t}">Lesson</a></td></tr>`).join('')}</table>
 <h3>Review</h3>${mock.qs.map((q,i)=>`<details class="mk-rev ${q.ok?'ok':'bad'}"><summary><span>${q.ok?'✓':'✗'}</span> ${i+1}. ${q.title} <small>${q.given===undefined?'not reached':'you: '+q.given}</small></summary><div class="prompt">${q.prompt}</div>${q.svg?`<div class="sheet mini">${fitSvgTag(q.svg)}</div>`:''}<div class="solution"><h4>Answer: ${ans(q)}</h4>${q.solution}<p class="angle"><b>Interview angle:</b> ${q.takeaway}</p></div></details>`).join('')}
 <div class="tools" style="margin-top:20px"><button class="btn" id="mkAgain">New mock</button><button class="btn ghost" id="mkMiss">Revisit my misses in Practice</button></div></div>`;
 const el=$('ivmain');subify(el);el.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>fitAll(d)));el.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>practiceTopic(b.dataset.topic));
 $('mkAgain').onclick=()=>{mock.result=null;mockSetup();};$('mkMiss').onclick=()=>{prefs.missMode=true;store.set('bench.prefs',prefs);renderSide();cur=null;location.hash='#practice';};window.scrollTo({top:0});}
let exT=null;
function renderExplain(E){const [id,cat,q,keys,model]=E,V=prefs.verbal||{},i=EXPLAIN.indexOf(E),nx=EXPLAIN[(i+1)%EXPLAIN.length];clearInterval(exT);
 $('ivmain').innerHTML=`<div class="lesson"><div class="meta"><span class="pill">${cat}</span>${V[id]?`<span class="pill ${V[id]===3?'okp':''}">${['','Missed it','Partly','Nailed it'][V[id]]}</span>`:''}</div><h2 style="font-size:30px">${q}</h2>
 <p class="lead" style="margin-bottom:12px">Answer out loud as if the interviewer just asked. Aim for 60–90 seconds, then check yourself against the key points.</p>
 <div class="tools" style="margin:0 0 10px"><button class="btn ghost" id="exGo">Start 2:00 timer</button><span id="exClock" class="mk-clock"></span></div>
 <textarea id="exNotes" class="exnotes" rows="5" placeholder="Optional: type or dictate your answer here. It’s included if you ask Claude to grade it."></textarea>
 <div class="tools"><button class="btn" id="exShow">Show key points</button><button class="btn ghost claude" id="exAsk">Ask Claude to grade my answer</button><a class="btn ghost" style="text-decoration:none" href="#interview/x/${nx[0]}">Next question</a></div><div id="exKey"></div></div>`;
 $('exGo').onclick=()=>{clearInterval(exT);const t0=Date.now();const up=()=>{const s=120-Math.floor((Date.now()-t0)/1000),e=$('exClock');if(!e){clearInterval(exT);return;}e.textContent=s>0?`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`:'Time. Wrap up.';e.classList.toggle('low',s<20);if(s<=0)clearInterval(exT);};up();exT=setInterval(up,500);};
 $('exShow').onclick=()=>{$('exKey').innerHTML=`<h3>Key points</h3><div class="exkeys">${keys.map(k=>`<label class="toggle"><input type="checkbox"> ${k}</label>`).join('')}</div><div class="solution" style="margin-top:14px"><h4>A strong answer</h4><p>${model}</p></div><p style="margin:14px 0 6px"><b>How did it go?</b></p><div class="seg" id="exRate">${[[1,'Missed it'],[2,'Partly'],[3,'Nailed it']].map(([v,l])=>`<button data-v="${v}" class="${V[id]===v?'on':''}">${l}</button>`).join('')}</div>`;subify($('exKey'));
  $('exRate').querySelectorAll('button').forEach(b=>b.onclick=()=>{prefs.verbal={...(prefs.verbal||{}),[id]:+b.dataset.v};store.set('bench.prefs',prefs);dayMark();renderInterview('x',id);$('exShow').click();});$('exKey').scrollIntoView({behavior:'smooth',block:'nearest'});};
 $('exAsk').onclick=()=>{const a=$('exNotes').value.trim(),t=`I'm practicing for a hardware/electrical engineering interview. Grade my answer to this question the way a senior interviewer would: what was strong, what was missing or wrong, and how to tighten it to about 75 seconds spoken. Then ask me one realistic follow-up question.\n\nQuestion: ${txt(q)}\n\nPoints a strong answer usually covers:\n${keys.map(k=>'- '+txt(k)).join('\n')}\n\nMy answer:\n${a||'(I will give my answer in my next message.)'}`;try{navigator.clipboard.writeText(t);}catch(e){}window.open('https://claude.ai/new?q='+encodeURIComponent(t),'_blank','noopener');toast('Opened Claude in a new tab. The prompt is also on your clipboard.');};}
/* ---------- flashcards (spaced repetition) ---------- */
let CARDS=null;const INTV=[0,1,3,7,16,35],cardS={q:[],cur:null,flip:false,topic:null,ahead:false};
function cardsAll(){if(CARDS)return CARDS;CARDS=[...FCARDS.map(([t,f,b])=>({topic:t,front:f,back:b})),...QBANK.map(x=>({topic:x.topic,front:x.q,back:x.a+'.',why:x.why}))].map(c=>({...c,id:'c'+fnv(txt(c.front))}));return CARDS;}
function cardsDue(topic){const today=dayStr(),S=prefs.srs||{};return cardsAll().filter(c=>(!topic||c.topic===topic)&&(!S[c.id]||S[c.id][1]<=today));}
function renderCards(topic){topic=TOPICS.some(t=>t.id===topic)?topic:null;if(cardS.topic!==topic||(!cardS.cur&&!cardS.q.length)){cardS.topic=topic;cardS.ahead=false;cardS.q=shuffle(cardsDue(topic));cardS.cur=cardS.q.shift()||null;cardS.flip=false;}
 renderCardsNav(topic);window.scrollTo({top:0});
 drawCard();}
function drawCard(){const c=cardS.cur,el=$('cdmain'),left=cardS.q.length+(c?1:0);
 if(!c){el.innerHTML=`<div class="lesson"><h2>All caught up</h2><p class="lead">No cards are due${cardS.topic?' in '+topicName(cardS.topic):''}. Cards come back after 1, 3, 7, 16 and 35 days as you get them right.</p><div class="tools"><button class="btn" id="cdAhead">Review ahead anyway</button><a class="btn ghost" style="text-decoration:none" href="#home">Back to Home</a></div></div>`;
  $('cdAhead').onclick=()=>{cardS.ahead=true;cardS.q=shuffle(cardsAll().filter(x=>!cardS.topic||x.topic===cardS.topic));cardS.cur=cardS.q.shift()||null;cardS.flip=false;drawCard();};return;}
 const box=((prefs.srs||{})[c.id]||[0])[0];
 el.innerHTML=`<div class="cdwrap"><div class="meta" style="justify-content:space-between"><span><span class="pill">${topicName(c.topic)}</span> <span class="pill">${box?'Level '+box+' of 5':'New'}</span></span><span>${left} left</span></div>
 <button class="fcard ${cardS.flip?'flip':''}" id="fcard" aria-label="Flashcard. Press to flip."><div class="fc-q">${c.front}</div>${cardS.flip?`<div class="fc-a">${c.back}</div>${c.why?`<div class="fc-w">${c.why}</div>`:''}`:'<div class="fc-hint">Say the answer, then press Space or tap to check</div>'}</button>
 ${cardS.flip?`<div class="cdbtns"><button class="btn ghost" data-g="0">Again <kbd>1</kbd></button><button class="btn" data-g="1">Got it <kbd>2</kbd></button><button class="btn ghost" data-g="2">Easy <kbd>3</kbd></button></div>`:''}</div>`;
 subify(el);$('fcard').onclick=()=>{if(!cardS.flip){cardS.flip=true;drawCard();}};el.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>cardGrade(+b.dataset.g));}
function cardGrade(g){const c=cardS.cur;if(!c||!cardS.flip)return;const S=prefs.srs||(prefs.srs={}),old=(S[c.id]||[0])[0],box=g===0?1:Math.min(5,old+g),d=new Date();d.setDate(d.getDate()+(g===0?0:INTV[box]));S[c.id]=[box,dayStr(d)];store.set('bench.prefs',prefs);dayMark();
 if(g===0)cardS.q.push(c);cardS.cur=cardS.q.shift()||null;cardS.flip=false;drawCard();if(view==='cards')renderCardsNav(cardS.topic);}
function renderCardsNav(topic){const all=cardsAll(),S=prefs.srs||{},cnt=t=>cardsDue(t).length;$('cdnav').innerHTML=`<p class="note" style="margin:0 0 10px">${all.filter(c=>(S[c.id]||[0])[0]>=3).length}/${all.length} cards learned</p><a href="#cards" class="${!topic?'on':''}">All topics<small>${cnt()} due</small></a>`+TOPICS.filter(t=>all.some(c=>c.topic===t.id)).map(t=>`<a href="#cards/${t.id}" class="${topic===t.id?'on':''}">${t.name}<small>${cnt(t.id)} due</small></a>`).join('');}
/* ---------- search palette ---------- */
let PAL=null,palSel=0,palList=[];
function palItems(){if(PAL)return PAL;const it=[],add=(t,sub,go,body='')=>it.push({t,sub,go,k:(t+' '+sub).toLowerCase(),b:body.toLowerCase()}),goto=h=>()=>{location.hash=h;};
 [['Home','#home'],['Practice','#practice'],['Mock interview','#interview/mock'],['Learn','#learn'],['Flashcards','#cards'],['Cheatsheet','#cheat'],['Simulator','#sim']].forEach(([t,h])=>add(t,'Go to',goto(h)));
 add('Calculator','Tool',()=>toggleCalc(true));add('Whiteboard','Tool',()=>toggleWB(true));add('Sync, offline and display size','Tool',()=>toggleSync(true));add('Switch theme (auto / light / dark)','Tool',cycleTheme);
 TOPICS.forEach(t=>add('Practice '+t.name,'Practice topic',()=>practiceTopic(t.id)));
 LESSONS.forEach(l=>{add(l.title,'Lesson',goto('#learn/'+l.id));l.sections.forEach(s=>{const h=txt(s.h);add(h,'Lesson · '+l.title,()=>{location.hash='#learn/'+l.id;setTimeout(()=>{const e=[...document.querySelectorAll('#lesson h3')].find(x=>x.textContent.trim()===h);if(e)e.scrollIntoView({block:'start'});},120);},txt(s.html));});});
 TOPICS.forEach(t=>(FORMULAS[t.id]||[]).forEach(f=>add(f,'Formula · '+t.name,goto('#learn/'+t.id))));
 CHEAT.forEach(c=>add(c[0],'Cheatsheet',()=>{location.hash='#cheat';setTimeout(()=>{const e=[...document.querySelectorAll('#cheat .ccard h3')].find(x=>x.textContent.trim()===txt(c[0]));if(e){e.scrollIntoView({block:'center'});e.parentElement.classList.add('flash');setTimeout(()=>e.parentElement.classList.remove('flash'),1500);}},120);},txt(c[1])));
 EXPLAIN.forEach(x=>add(txt(x[2]),'Explain out loud',goto('#interview/x/'+x[0])));
 return PAL=it;}
function palOpen(){const p=$('pal');p.hidden=false;const i=$('palIn');i.value='';palDraw();i.focus();}
function palClose(){$('pal').hidden=true;}
function palDraw(){const q=$('palIn').value.toLowerCase().trim().split(/\s+/).filter(Boolean),all=palItems();const sc=x=>(q.every(w=>x.k.includes(w))?4:0)+(x.t.toLowerCase().startsWith(q[0])?2:0)+(x.sub.startsWith('Formula')?0:1);palList=(q.length?all.filter(x=>q.every(w=>x.k.includes(w)||x.b.includes(w))).sort((a,b)=>sc(b)-sc(a)):all.slice(0,13)).slice(0,12);palSel=Math.min(palSel,Math.max(0,palList.length-1));
 $('palList').innerHTML=palList.length?palList.map((x,i)=>`<button class="${i===palSel?'on':''}" data-i="${i}"><span>${x.t.replace(/</g,'&lt;')}</span><small>${x.sub}</small></button>`).join(''):'<p class="note" style="padding:10px 14px;margin:0">Nothing matches. Try “pull-up”, “setup time” or “PoE”.</p>';
 $('palList').querySelectorAll('button').forEach(b=>b.onclick=()=>palRun(+b.dataset.i));}
function palRun(i){const x=palList[i];palClose();if(x)x.go();}
/* ---------- theme ---------- */
function themeMode(){try{return localStorage.getItem('bench.theme')||'auto';}catch(e){return 'auto';}}
function applyTheme(){const m=themeMode(),dark=m==='dark'||(m==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';const b=$('themeTog');if(b)b.title=`Theme: ${m}. Click to change`;if(typeof wb!=='undefined'&&wb.cv&&wb.w)wbRedraw();}
function cycleTheme(){const m={auto:'light',light:'dark',dark:'auto'}[themeMode()];try{localStorage.setItem('bench.theme',m);}catch(e){}applyTheme();toast(`Theme: ${m==='auto'?'follows your device':m}`);}
function v2Init(){applyTheme();homeLiveInit();try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);}catch(e){}
 $('themeTog').onclick=cycleTheme;$('palTog').onclick=palOpen;$('palIn').oninput=()=>{palSel=0;palDraw();};
 $('palIn').onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();palSel=Math.min(palList.length-1,palSel+1);palDraw();}else if(e.key==='ArrowUp'){e.preventDefault();palSel=Math.max(0,palSel-1);palDraw();}else if(e.key==='Enter'){e.preventDefault();palRun(palSel);}else if(e.key==='Escape')palClose();};
 $('pal').onclick=e=>{if(e.target.id==='pal')palClose();};
 document.addEventListener('keydown',e=>{const k=e.key.toLowerCase(),typing=/INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
  if((e.metaKey||e.ctrlKey)&&k==='k'){e.preventDefault();$('pal').hidden?palOpen():palClose();return;}
  if(typing||e.metaKey||e.ctrlKey||e.altKey)return;if(k==='/'){e.preventDefault();palOpen();return;}
  if(view==='cards'&&cardS.cur){if(e.code==='Space'||k==='enter'){if(wb.hover&&!$('wb').hidden)return;e.preventDefault();if(!cardS.flip){cardS.flip=true;drawCard();}}else if(cardS.flip&&['1','2','3'].includes(k))cardGrade(+k-1);}});}
