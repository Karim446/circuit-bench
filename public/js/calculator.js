"use strict";
/* ================= calculator ================= */
function calcEval(src,ans){
 const s=src.replace(/×/g,'*').replace(/÷/g,'/').replace(/[−–]/g,'-').replace(/‖/g,'||').replace(/µ/g,'u').replace(/π/g,'pi').replace(/√/g,'sqrt ').trim();
 if(!s)throw new Error('');let i=0;
 const peek=()=>{while(s[i]===' ')i++;return s[i];};
 const num=()=>{peek();const m=/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i));if(!m)return null;i+=m[0].length;let v=parseFloat(m[0]);const sm=/^[pnumkMG](?![a-zA-Z])/.exec(s.slice(i));if(sm){v*=PFX[sm[0]];i++;}return v;};
 const F={sqrt:Math.sqrt,ln:Math.log,log:Math.log10,exp:Math.exp,sin:Math.sin,cos:Math.cos,tan:Math.tan,abs:Math.abs};
 const close=()=>{if(peek()!==')')throw new Error('Missing )');i++;};
 function expr(){let v=par();for(;;){const c=peek();if(c==='+'){i++;v+=par();}else if(c==='-'){i++;v-=par();}else return v;}}
 function par(){let v=mul();for(;;){peek();if(s.startsWith('||',i)){i+=2;const w=mul();v=1/(1/v+1/w);}else return v;}}
 function mul(){let v=unary();for(;;){const c=peek();if(c==='*'){i++;v*=unary();}else if(c==='/'){i++;v/=unary();}else if(c&&/[0-9.a-zA-Z(]/.test(c))v*=unary();else return v;}}
 function unary(){const c=peek();if(c==='-'){i++;return -unary();}if(c==='+'){i++;return unary();}return pow();}
 function pow(){const b=atom();if(peek()==='^'){i++;return b**unary();}return b;}
 function atom(){const c=peek();if(c==='('){i++;const v=expr();close();return v;}
  const n=num();if(n!=null)return n;
  const m=/^[a-zA-Z_]+/.exec(s.slice(i));if(!m)throw new Error(c?`Unexpected “${c}”`:'Incomplete expression');i+=m[0].length;const id=m[0].toLowerCase();
  if(id==='pi')return Math.PI;if(id==='e')return Math.E;if(id==='ans')return ans;
  if(id==='par'){if(peek()!=='(')throw new Error('Use par(a, b, …)');i++;let sum=0;for(;;){sum+=1/expr();if(peek()===','){i++;continue;}break;}close();return 1/sum;}
  if(F[id]){if(peek()==='('){i++;const v=expr();close();return F[id](v);}return F[id](unary());}
  throw new Error(`Unknown “${m[0]}”`);}
 const v=expr();if(peek()!==undefined)throw new Error(`Unexpected “${s[i]}”`);if(!isFinite(v))throw new Error('Result is not a finite number');return v;}
const calc={ans:0,hist:[],val:null};
function calcFmt(v){const e=eng(v,'',4).trim();return{e,full:String(sig(v,10))};}
function initCalc(){
 const el=$('calc');
 const K=[['AC','op'],['⌫','op'],['(','op'],[')','op'],['‖','op'],['÷','op'],['7'],['8'],['9'],['√','op'],['^','op'],['×','op'],['4'],['5'],['6'],['π','op'],['ln','op'],['−','op'],['1'],['2'],['3'],['EE','op'],['log','op'],['+','op'],['0'],['.'],['ans','op'],['1/x','op'],['=','eq'],['p','pf'],['n','pf'],['µ','pf'],['m','pf'],['k','pf'],['M','pf']];
 el.innerHTML=`<div class="calc-head"><b>Calculator</b><button class="calc-x" id="calcX" aria-label="Close calculator">×</button></div><div class="calc-hist" id="calcHist"></div>
 <input id="calcIn" autocomplete="off" spellcheck="false" inputmode="decimal" placeholder="12 × 4.7k / (10k + 4.7k)" aria-label="Expression">
 <div class="calc-res" id="calcRes"></div>
 <div class="calc-keys">${K.map(([k,c])=>`<button type="button" class="${c||''}" data-k="${k}">${k}</button>`).join('')}</div>
 <p class="note">Prefixes: p n µ (or u) m k M G, e.g. 4.7k, 100n. Parallel: 10k‖4.7k or par(a, b, c). <b>ans</b> = last result; starting with an operator (× ÷ + − ^ ‖) continues from it. log is base 10, ln is natural.</p>`;
 const inp=$('calcIn');
 const OPS=['÷','×','−','+','^','‖','*','/','-','|'];
 const ins=t=>{const a=inp.selectionStart??inp.value.length,b=inp.selectionEnd??a;inp.value=inp.value.slice(0,a)+t+inp.value.slice(b);inp.selectionStart=inp.selectionEnd=a+t.length;preview();};
 el.querySelector('.calc-keys').onclick=e=>{const k=e.target.dataset.k;if(!k)return;
  if(k==='AC'){inp.value='';preview();}
  else if(k==='⌫'){const a=inp.selectionStart,b=inp.selectionEnd;if(a!==b){inp.value=inp.value.slice(0,a)+inp.value.slice(b);inp.selectionStart=inp.selectionEnd=a;}else if(a>0){inp.value=inp.value.slice(0,a-1)+inp.value.slice(a);inp.selectionStart=inp.selectionEnd=a-1;}preview();}
  else if(k==='=')commit();
  else if(k==='EE')ins('e');else if(k==='√')ins('√(');else if(k==='ln'||k==='log')ins(k+'(');
  else if(k==='1/x'){inp.value=inp.value.trim()?`1/(${inp.value})`:calc.hist.length?'1/ans':'1/(';inp.selectionStart=inp.selectionEnd=inp.value.length;preview();}
  else if(OPS.includes(k)&&!inp.value.trim()&&calc.hist.length)ins('ans'+k);
  else ins(k);
  if(!matchMedia('(pointer:coarse)').matches)inp.focus();};
 inp.oninput=preview;
 inp.onkeydown=e=>{if(e.key.length===1&&OPS.includes(e.key)&&!inp.value.trim()&&calc.hist.length&&!e.ctrlKey&&!e.metaKey){e.preventDefault();ins('ans'+e.key);return;}if(e.key==='Enter'){e.preventDefault();commit();}else if(e.key==='Escape')toggleCalc(false);else if(e.key==='ArrowUp'&&calc.hist.length&&!inp.value){inp.value=calc.hist[0].x;preview();}};
 $('calcX').onclick=()=>toggleCalc(false);
 $('calcTog').onclick=()=>toggleCalc();
 if(prefs.calcOpen)toggleCalc(true,false);
 preview();}
function preview(){const inp=$('calcIn'),out=$('calcRes');let html='';calc.val=null;
 if(inp.value.trim()){try{const v=calcEval(inp.value,calc.ans);calc.val=v;const f=calcFmt(v);html=`<div class="v">${f.e}<small>${f.full}</small></div>`;}catch(e){html=e.message?`<div class="e">${e.message}</div>`:'';}}
 const canUse=calc.val!=null&&$('ans')&&!$('ans').readOnly&&view==='practice';
 out.innerHTML=html+(canUse?`<button class="calc-use" id="calcUse" title="Copies the plain number. Make sure it is in the unit the question asks for.">Use as answer</button>`:'');
 if(canUse)$('calcUse').onclick=()=>{$('ans').value=String(sig(calc.val,6));$('ans').focus();toast(`Entered ${sig(calc.val,6)}. Check it’s in ${cur.answer.unit}.`);};}
function commit(){const inp=$('calcIn');if(!inp.value.trim())return;try{const v=calcEval(inp.value,calc.ans);calc.ans=v;calc.hist.unshift({x:inp.value,v});calc.hist=calc.hist.slice(0,10);inp.value='';renderHist();preview();
  $('calcRes').insertAdjacentHTML('afterbegin',`<div class="v">${calcFmt(v).e}<small>${calcFmt(v).full} (saved as ans)</small></div>`);
  calc.val=v;const canUse=$('ans')&&!$('ans').readOnly&&view==='practice';if(canUse&&!$('calcUse')){preview();}}catch(e){preview();}}
function renderHist(){$('calcHist').innerHTML=calc.hist.map((h,i)=>`<button type="button" data-i="${i}" title="Insert this result"><span>${h.x.replace(/</g,'&lt;')}</span><span>${calcFmt(h.v).e}</span></button>`).join('');
 $('calcHist').querySelectorAll('button').forEach(b=>b.onclick=()=>{const inp=$('calcIn');const v=String(sig(calc.hist[+b.dataset.i].v,8));const a=inp.selectionStart??inp.value.length;inp.value=inp.value.slice(0,a)+v+inp.value.slice(a);preview();inp.focus();});}
function toggleCalc(force,focus=true){const el=$('calc'),open=force??el.hidden;el.hidden=!open;$('calcTog').classList.toggle('on',open);$('calcTog').setAttribute('aria-expanded',open);document.body.classList.toggle('calc-open',open);
 prefs.calcOpen=open;store.set('bench.prefs',prefs);if(open){preview();if(focus&&!matchMedia('(pointer:coarse)').matches)$('calcIn').focus();}
 if(view==='practice'&&cur)requestAnimationFrame(()=>fitAll($('card')));}
