"use strict";
/* ================= Python practice ================= */
const PY_BASE=(typeof window!=='undefined'&&window.PYODIDE_BASE)||'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/';
const PY_SCRATCH={id:'scratch',group:'Start here',title:'Scratchpad',prompt:'<p>Run any Python here. The standard library is available (re, json, csv, struct, math, itertools, collections…). Use it to try ideas before you write them into an exercise.</p>',starter:'nums = [3.30, 3.41, 3.19]\nprint([n for n in nums if not 3.2 <= n <= 3.4])\n',tests:'',hints:[],solution:''};
const py={w:null,ready:false,busy:false,timer:null,out:'',done:null,pending:null,cur:null,hintN:0};
function pyWorkerSrc(){return `let P=null;self.onmessage=async e=>{const m=e.data;try{if(!P){importScripts(m.base+'pyodide.js');P=await loadPyodide({indexURL:m.base});P.setStdout({batched:s=>postMessage({t:'out',s})});P.setStderr({batched:s=>postMessage({t:'out',s})});postMessage({t:'ready'});}if(m.t==='run'){P.globals.set('__user_code',m.code);P.globals.set('__tests',m.tests||'');const r=await P.runPythonAsync(m.harness);postMessage({t:'result',r:JSON.parse(r)});}}catch(err){postMessage({t:'fail',msg:String(err&&err.message||err)});}};`;}
function pyStatus(t,cls=''){const e=$('pyStatus');if(e){e.textContent=t;e.className='note '+cls;}}
function pyStart(){if(py.w)return;py.ready=false;py.w=(location.protocol.startsWith('http')&&!py.blob)?new Worker('py-worker.js'):new Worker(URL.createObjectURL(new Blob([pyWorkerSrc()],{type:'text/javascript'})));py.w.onmessage=pyMsg;py.w.onerror=e=>{if(!py.ready&&!py.blob&&location.protocol.startsWith('http')){e.preventDefault&&e.preventDefault();py.blob=true;try{py.w.terminate();}catch(x){}py.w=null;const pend=py.pending;pyStart();py.pending=pend;return;}pyMsg({data:{t:'fail',msg:e.message||'worker error'}});};py.w.postMessage({t:'boot',base:PY_BASE});pyStatus('Loading Python (about 10 MB the first time, cached after that)…');}
function pyMsg(e){const m=e.data;
 if(m.t==='ready'){py.ready=true;pyStatus('Python is ready.');if(py.pending){const j=py.pending;py.pending=null;pyExec(j);}}
 else if(m.t==='out'){py.out+=m.s+'\n';const o=$('pyOut');if(o){o.hidden=false;o.textContent=py.out.slice(-20000);}}
 else if(m.t==='result'){clearTimeout(py.timer);py.busy=false;const d=py.done;py.done=null;d&&d(m.r);}
 else if(m.t==='fail'){clearTimeout(py.timer);py.busy=false;if(!py.ready){pyStatus('Couldn’t load Python ('+m.msg+'). Check your connection, then press Run again.','warn');try{py.w.terminate();}catch(x){}py.w=null;py.pending=null;py.done=null;}else{const d=py.done;py.done=null;d&&d({results:[],error:m.msg});}}}
function pyRun(code,tests,done){if(py.busy)return false;py.busy=true;py.out='';py.done=done;pyStart();const j={code,tests};if(py.ready)pyExec(j);else py.pending=j;return true;}
function pyExec(j){pyStatus('Running…');py.w.postMessage({t:'run',code:j.code,tests:j.tests,harness:PY_HARNESS,base:PY_BASE});clearTimeout(py.timer);
 py.timer=setTimeout(()=>{try{py.w.terminate();}catch(x){}py.w=null;py.ready=false;py.busy=false;const d=py.done;py.done=null;d&&d({results:[],error:'Stopped after 10 seconds. Is there an infinite loop? Python was restarted.'});},10000);}
const pyKey=id=>'bench.py.'+id;
function pyList(){return[PY_SCRATCH,...PYEX];}
function renderPython(id){
 const all=pyList(),E=all.find(x=>x.id===id)||all[1];py.cur=E;py.hintN=0;const solved=prefs.pySolved||[];
 const groups=[...new Set(all.map(x=>x.group))];
 $('pynav').innerHTML=`<p class="note" style="margin:0 0 10px">${solved.length}/${PYEX.length} solved</p>`+groups.map(g=>`<div class="lgroup">${g}</div>`+all.filter(x=>x.group===g).map(x=>`<a href="#python/${x.id}" class="${x===E?'on':''}">${solved.includes(x.id)?'<span class="done">✓</span> ':''}${x.title}</a>`).join('')).join('');
 const isS=E.id==='scratch';let saved=null;try{saved=localStorage.getItem(pyKey(E.id));}catch(e){}
 $('pymain').innerHTML=`<h2>${E.title}</h2><div class="meta" style="margin-bottom:12px"><span class="pill">${E.group}</span>${solved.includes(E.id)?'<span class="pill okp">Solved</span>':''}</div>
 <div class="prompt">${E.prompt}</div>
 <div class="code-wrap"><div class="code-bar"><span>your_code.py</span><span>Tab indents · ${/Mac|iPhone|iPad/.test(navigator.platform||'')?'⌘':'Ctrl'}+Enter runs</span></div><textarea id="code" class="code" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Python code"></textarea></div>
 <div class="tools"><button class="btn" id="pyRunB">${isS?'Run':'Run tests'}</button>${isS?'':'<button class="btn ghost" id="pyHint"></button><button class="btn ghost" id="pySol">Show solution</button>'}<button class="btn ghost" id="pyReset">Reset code</button><button class="btn ghost claude" id="pyAsk">Ask Claude</button></div>
 <div id="pyStatus" class="note">${py.ready?'Python is ready.':'Python loads the first time you press Run.'}</div><ol class="hints" id="pyHints"></ol><div id="pyRes"></div><pre id="pyOut" class="pyout" hidden></pre><div id="pySolBox"></div>`;
 const ta=$('code');ta.value=saved??E.starter;pySize();
 let tmr;ta.addEventListener('input',()=>{pySize();clearTimeout(tmr);tmr=setTimeout(()=>{try{localStorage.setItem(pyKey(E.id),ta.value);}catch(e){}syncTouch('py');},300);});
 ta.addEventListener('keydown',pyKeys);
 $('pyRunB').onclick=pyGo;$('pyReset').onclick=()=>{if(ta.value!==E.starter&&!confirm('Replace your code with the starter code?'))return;ta.value=E.starter;try{localStorage.removeItem(pyKey(E.id));}catch(e){}syncTouch('py');pySize();};
 $('pyAsk').onclick=()=>{const t=pyPrompt(E,ta.value);try{navigator.clipboard.writeText(t);}catch(e){}window.open('https://claude.ai/new?q='+encodeURIComponent(t),'_blank','noopener');toast('Opened Claude in a new tab. The prompt is also on your clipboard.');};
 if(!isS){pyHintBtn();$('pyHint').onclick=()=>{if(py.hintN>=E.hints.length)return;const li=document.createElement('li');li.dataset.n=py.hintN+1;li.innerHTML=hl(E.hints[py.hintN]);$('pyHints').appendChild(li);py.hintN++;pyHintBtn();};
  $('pySol').onclick=()=>{$('pySolBox').innerHTML=`<div class="solution"><h4>Reference solution</h4><pre class="pysol"></pre><button class="btn ghost" id="pyLoad">Load into editor</button></div>`;$('pySolBox').querySelector('pre').textContent=E.solution;$('pyLoad').onclick=()=>{ta.value=E.solution;pySize();ta.dispatchEvent(new Event('input'));};};}
 if(prefs.pyWarm)pyStart();window.scrollTo({top:0});}
function pyHintBtn(){const b=$('pyHint'),E=py.cur;if(!b)return;b.textContent=py.hintN>=E.hints.length?'No more hints':`Hint ${py.hintN+1} of ${E.hints.length}`;b.disabled=py.hintN>=E.hints.length;}
function pySize(){const ta=$('code');if(!ta)return;const n=ta.value.split('\n').length;ta.rows=Math.max(10,Math.min(32,n+2));}
function pyIns(ta,t){ta.focus();if(!document.execCommand||!document.execCommand('insertText',false,t))ta.setRangeText(t,ta.selectionStart,ta.selectionEnd,'end');ta.dispatchEvent(new Event('input'));}
function pyKeys(e){const ta=e.target;
 if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();pyGo();return;}
 if(e.key==='Tab'){e.preventDefault();const s=ta.selectionStart,ls=ta.value.lastIndexOf('\n',s-1)+1;
  if(e.shiftKey){const m=/^ {1,4}/.exec(ta.value.slice(ls));if(m){ta.setSelectionRange(ls,ls+m[0].length);pyIns(ta,'');ta.setSelectionRange(s-m[0].length,s-m[0].length);}}else pyIns(ta,'    ');return;}
 if(e.key==='Enter'&&!e.shiftKey){const s=ta.selectionStart,ls=ta.value.lastIndexOf('\n',s-1)+1,line=ta.value.slice(ls,s),ind=(/^ */.exec(line)[0]),extra=/:\s*$/.test(line)?'    ':'';e.preventDefault();pyIns(ta,'\n'+ind+extra);}}
function pyGo(){const E=py.cur,ta=$('code');if(!ta)return;prefs.pyWarm=true;store.set('bench.prefs',prefs);$('pyRes').innerHTML='';const o=$('pyOut');o.hidden=true;o.textContent='';
 if(!pyRun(ta.value,E.tests,r=>pyShow(E,r)))toast('Still running. Wait for it to finish.');}
function pyShow(E,r){const res=$('pyRes');if(!res)return;const pass=r.results.filter(x=>x.ok).length,tot=r.results.length;
 let h='';if(r.error)h+=`<div class="pyerr"><b>Error</b><pre></pre></div>`;
 if(tot)h+=`<ul class="pytests">${r.results.map(x=>`<li class="${x.ok?'ok':'bad'}"><span>${x.ok?'✓':'✗'}</span><div><b></b>${x.msg?'<div class="note"></div>':''}</div></li>`).join('')}</ul>`;
 const all=tot>0&&pass===tot&&!r.error;
 if(E.id!=='scratch')h=`<div class="verdict ${all?'good':'bad'}" style="margin:6px 0 8px">${all?'All tests pass.':`${pass} of ${tot} tests pass.`}</div>`+h;
 else if(!r.error)h+=`<div class="verdict good" style="margin:6px 0">Ran without errors.</div>`;
 if(all){const nx=PYEX[PYEX.indexOf(E)+1];h+=nx?`<a class="btn" style="text-decoration:none;display:inline-block;margin-top:6px" href="#python/${nx.id}">Next: ${nx.title}</a>`:'<p>That was the last exercise. Nice work.</p>';
  const sv=prefs.pySolved||[];if(!sv.includes(E.id)){sv.push(E.id);prefs.pySolved=sv;store.set('bench.prefs',prefs);toast('Solved!');const a=$('pynav').querySelector(`a[href="#python/${E.id}"]`);if(a&&!a.querySelector('.done'))a.insertAdjacentHTML('afterbegin','<span class="done">✓</span> ');}}
 res.innerHTML=h;if(r.error)res.querySelector('.pyerr pre').textContent=r.error;
 res.querySelectorAll('.pytests li').forEach((li,i)=>{li.querySelector('b').textContent=r.results[i].name;const n=li.querySelector('.note');if(n)n.textContent=r.results[i].msg;});
 pyStatus(py.out?'Output from print() is shown below.':'');py.last=r;}
function pyPrompt(E,code){const r=py.last;let t=`I'm preparing for Python interviews for hardware test and diagnostics engineering roles. Coach me on this exercise: ask guiding questions and give hints, but don't write the full solution unless I ask for it.\n\nExercise: ${E.title}\n${strip(E.prompt)}\n\nMy current code:\n\`\`\`python\n${code}\n\`\`\`\n`;
 if(r){if(r.error)t+=`\nRunning it gave this error:\n${r.error}\n`;const f=r.results.filter(x=>!x.ok);if(f.length)t+=`\nFailing tests:\n${f.map(x=>`- ${x.name}${x.msg?': '+x.msg:''}`).join('\n')}\n`;}
 if(E.tests)t+=`\nThe tests that check it:\n\`\`\`python\n${E.tests}\`\`\`\n`;return t;}
