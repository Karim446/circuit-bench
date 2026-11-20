"use strict";
/* ================= sync across devices + offline ================= */
const SYNC_SECS=['stats','progress','wb'];
const SYNC_PREF_KEYS=['topics','faultOnly','weak','missMode','known','done','wbFollow','days','idate','mocks','mockCfg','srs','verbal'];
const syncSt={cfg:store.get('bench.sync',null),meta:store.get('bench.syncmeta',{ts:{},h:{},srv:{}}),timer:null,busy:false,again:false,suspend:false,status:'',err:''};
const fnv=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);}return(h>>>0).toString(36)+':'+s.length;};
function syncData(sec){
 if(sec==='stats')return stats;
 if(sec==='progress'){const o={};SYNC_PREF_KEYS.forEach(k=>{if(prefs[k]!==undefined)o[k]=prefs[k];});return o;}
 if(sec==='wb')return{strokes:typeof wb!=='undefined'?wb.strokes:[]};}
function syncSaveMeta(){try{localStorage.setItem('bench.syncmeta',JSON.stringify(syncSt.meta));}catch(e){}}
function syncTouch(sec){if(syncSt.suspend)return;const h=fnv(JSON.stringify(syncData(sec)));if(syncSt.meta.h[sec]===h)return;syncSt.meta.h[sec]=h;syncSt.meta.ts[sec]=Date.now();syncSaveMeta();if(syncSt.cfg){clearTimeout(syncSt.timer);syncSt.timer=setTimeout(()=>syncNow(),3500);}}
function syncApply(sec,data){syncSt.suspend=true;try{
 if(sec==='stats'){stats=data||{};localStorage.setItem('bench.stats',JSON.stringify(stats));}
 else if(sec==='progress'){SYNC_PREF_KEYS.forEach(k=>{if(data&&k in data)prefs[k]=data[k];});localStorage.setItem('bench.prefs',JSON.stringify(prefs));}
 else if(sec==='wb'&&typeof wb!=='undefined'){wbSelClear(true);wb.strokes=(data&&data.strokes)||[];wb.undo=[];wb.redo=[];wbRedraw();localStorage.setItem('bench.wb',JSON.stringify({strokes:wb.strokes}));}
 syncSt.meta.h[sec]=fnv(JSON.stringify(syncData(sec)));}catch(e){console.warn(e);}finally{syncSt.suspend=false;}}
async function syncId(code){const norm=code.toUpperCase().replace(/[^A-Z0-9]/g,'');const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('circuit-bench:'+norm));return[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');}
function syncNewCode(){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789',r=new Uint8Array(20);crypto.getRandomValues(r);const c=[...r].map(b=>A[b%A.length]).join('');return c.match(/.{5}/g).join('-');}
function syncRefreshUI(changed){if(!changed.length)return;renderSide();if(changed.includes('progress')||changed.includes('stats')){const ae=document.activeElement;if(view==='home')renderHome(true);else if(!(ae&&(ae.tagName==='TEXTAREA'||ae.tagName==='INPUT'))&&view!=='practice'&&!mock.on)route();}toast('Synced changes from your other device.');}
async function syncNow(){const cfg=syncSt.cfg;if(!cfg)return;if(syncSt.busy){syncSt.again=true;return;}if(!navigator.onLine){syncSt.status='Offline. Changes will sync when you reconnect.';syncPanel();return;}
 syncSt.busy=true;syncSt.err='';SYNC_SECS.forEach(s=>{if(syncSt.meta.ts[s]==null){syncSt.meta.h[s]=fnv(JSON.stringify(syncData(s)));syncSt.meta.ts[s]=cfg.joined?0:Date.now();}});
 const sections={};let skipped='';
 for(const s of SYNC_SECS){if((syncSt.meta.ts[s]||0)>(syncSt.meta.srv[s]||0)){const data=syncData(s),js=JSON.stringify(data);if(s==='wb'&&js.length>900000){skipped=' The whiteboard is too large to sync; clear some of it.';continue;}sections[s]={ts:syncSt.meta.ts[s],data};}}
 try{const res=await fetch('/api/sync',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:cfg.id,sections,have:Object.fromEntries(SYNC_SECS.map(s=>[s,Math.max(syncSt.meta.ts[s]||0,syncSt.meta.srv[s]||0)]))})});
  if(res.status===404)throw new Error('The sync server isn’t deployed yet. See the setup steps.');const j=await res.json().catch(()=>({}));if(!res.ok)throw new Error(j.error||('Server error '+res.status));
  const changed=[];for(const [s,v] of Object.entries(j.sections||{})){if(!SYNC_SECS.includes(s))continue;syncSt.meta.srv[s]=v.ts;if(v.ts>(syncSt.meta.ts[s]||0)&&'data' in v){syncApply(s,v.data);syncSt.meta.ts[s]=v.ts;changed.push(s);}}
  cfg.joined=false;cfg.last=Date.now();try{localStorage.setItem('bench.sync',JSON.stringify(cfg));}catch(e){}syncSaveMeta();syncSt.status='Synced'+skipped;syncRefreshUI(changed);}
 catch(e){syncSt.err=e.message||String(e);syncSt.status='';}
 finally{syncSt.busy=false;syncPanel();syncDot();if(syncSt.again){syncSt.again=false;setTimeout(syncNow,500);}}}
async function syncEnable(code,joined){const id=await syncId(code);syncSt.cfg={code,id,joined,last:0};try{localStorage.setItem('bench.sync',JSON.stringify(syncSt.cfg));}catch(e){}if(joined){syncSt.meta.ts={};syncSt.meta.srv={};}else syncSt.meta.srv={};syncSaveMeta();syncPanel();await syncNow();}
function syncDisable(){syncSt.cfg=null;try{localStorage.removeItem('bench.sync');}catch(e){}syncSt.meta.srv={};syncSaveMeta();syncPanel();syncDot();}
function syncDot(){const b=$('syncTog');if(!b)return;b.classList.toggle('synced',!!syncSt.cfg&&!syncSt.err);b.classList.toggle('syncerr',!!syncSt.err);}
const ago=t=>{if(!t)return 'never';const s=Math.round((Date.now()-t)/1000);return s<10?'just now':s<60?s+' s ago':s<3600?Math.round(s/60)+' min ago':Math.round(s/3600)+' h ago';};
function offlineInfo(){try{return{sw:!!(navigator.serviceWorker&&navigator.serviceWorker.controller)};}catch(e){return{sw:false};}}
async function syncPanel(){const el=$('syncp');if(!el||el.hidden)return;const c=syncSt.cfg,off=offlineInfo();
 el.innerHTML=`<div class="calc-head"><b>Sync and offline</b><button class="calc-x" id="syncX" aria-label="Close">×</button></div>
 <h4 class="sp-h">Sync between devices</h4>
 ${c?`<p class="sp-p">This device is syncing stats, missed questions, lesson, flashcard and mock interview progress, and the whiteboard.</p><p class="sp-p">Sync code (enter it on your other device):</p><div class="sp-code"><code>${c.code}</code><button class="calc-use" id="syncCopy">Copy</button></div><p class="sp-p note">Last synced: ${ago(c.last)}${syncSt.busy?' · syncing…':''}</p>${syncSt.status?`<p class="sp-p" style="color:var(--ok)">${syncSt.status}</p>`:''}${syncSt.err?`<p class="sp-p warn">${syncSt.err}</p>`:''}<div class="row"><button class="btn" id="syncGo">Sync now</button><button class="btn ghost" id="syncOff">Turn off here</button></div>`
 :`<p class="sp-p">Keep your laptop and iPad in step: stats, missed questions, progress and whiteboard.</p><button class="btn" id="syncNew">Turn on sync</button><p class="sp-p" style="margin-top:12px">Already on elsewhere? Enter that device’s code:</p><div class="sp-code"><input id="syncIn" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocapitalize="characters" autocomplete="off" spellcheck="false"><button class="calc-use" id="syncJoin">Connect</button></div>${syncSt.err?`<p class="sp-p warn">${syncSt.err}</p>`:''}<p class="sp-p note">The code is the only key to your data, so treat it like a password. The server only ever sees a hash of it.</p>`}
 <h4 class="sp-h">Display size</h4><p class="sp-p note">Auto scales the whole site to your screen (now ${Math.round(UZ()*100)}%).</p><div class="seg" id="uiSeg" style="margin-bottom:6px">${['auto','1','1.15','1.3','1.5'].map(v=>`<button data-ui="${v}" class="${(prefs.uiScale||'auto')===v?'on':''}">${v==='auto'?'Auto':Math.round(v*100)+'%'}</button>`).join('')}</div>
 <h4 class="sp-h">Offline</h4>
 <p class="sp-p">${off.sw?'✓ The site works offline on this device.':location.protocol.startsWith('http')?'Offline mode turns on after this page reloads once.':'Offline mode needs the site to be served over https (it is on Cloudflare).'}</p>
 <p class="sp-p note">On iPad: Share → Add to Home Screen to open it like an app.</p>`;
 $('syncX').onclick=()=>toggleSync(false);
 el.querySelectorAll('[data-ui]').forEach(b=>b.onclick=()=>{prefs.uiScale=b.dataset.ui;try{localStorage.setItem('bench.prefs',JSON.stringify(prefs));}catch(e){}uiScale();syncPanel();});
 if(c){$('syncCopy').onclick=()=>{try{navigator.clipboard.writeText(c.code);toast('Code copied.');}catch(e){}};$('syncGo').onclick=()=>syncNow();$('syncOff').onclick=()=>{if(confirm('Stop syncing on this device? Your local data stays here.'))syncDisable();};}
 else{$('syncNew').onclick=()=>syncEnable(syncNewCode(),false);$('syncJoin').onclick=()=>{const v=$('syncIn').value.trim();if(v.replace(/[^A-Za-z0-9]/g,'').length<20){toast('Enter the full 20-character code.');return;}if(confirm('Connecting replaces this device’s progress with what’s saved for that code (anything not yet saved there is kept). Continue?'))syncEnable(v.toUpperCase(),true);};}}
function toggleSync(force){const el=$('syncp'),open=force??el.hidden;el.hidden=!open;$('syncTog').classList.toggle('on',open);$('syncTog').setAttribute('aria-expanded',open);if(open){if(!$('calc').hidden)toggleCalc(false);syncPanel();}}
function syncInit(){$('syncTog').onclick=()=>toggleSync();syncDot();
 if(syncSt.cfg)syncNow();
 // Check for changes from other devices: every 30 s while Home is showing, every 2 min elsewhere.
 let lastPoll=Date.now();setInterval(()=>{if(!syncSt.cfg||document.visibilityState!=='visible')return;if(view==='home'||Date.now()-lastPoll>=115000){lastPoll=Date.now();syncNow();}},30000);
 document.addEventListener('visibilitychange',()=>{if(!syncSt.cfg)return;if(document.visibilityState==='visible')syncNow();else if(syncSt.timer){clearTimeout(syncSt.timer);syncSt.timer=null;syncNow();}});
 window.addEventListener('online',()=>{if(syncSt.cfg)syncNow();});
 if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(e=>console.warn('SW',e));}
function init(){
 uiScale();let rsT;window.addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(uiScale,150);});
 if(window.matchMedia('(max-width:820px)').matches)$('settings').removeAttribute('open');
 renderSide();renderScore();
 $('allBtn').onclick=()=>{prefs.topics=TOPICS.map(t=>t.id);store.set('bench.prefs',prefs);renderSide();next();};
 $('noneBtn').onclick=()=>{prefs.topics=[];store.set('bench.prefs',prefs);renderSide();next();};
 $('faultOnly').onchange=e=>{prefs.faultOnly=e.target.checked;store.set('bench.prefs',prefs);next();};
 $('weakMode').onchange=e=>{prefs.weak=e.target.checked;store.set('bench.prefs',prefs);};
 $('missMode').onchange=e=>{prefs.missMode=e.target.checked;store.set('bench.prefs',prefs);next();};
 $('resetBtn').onclick=()=>{if(confirm('Reset all saved topic stats?')){stats={};store.set('bench.stats',stats);renderSide();}};
 document.addEventListener('keydown',e=>{if(view!=='practice'||e.target.tagName==='INPUT'||e.metaKey||e.ctrlKey||e.altKey)return;const k=e.key.toLowerCase();if(k==='n')next();else if(k==='h')showHint();else if(k==='c')toggleCalc();});
 initCalc();wbInit();syncInit();v2Init();
 document.addEventListener('keydown',e=>{const t=e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')return;const k=e.key.toLowerCase();
  if(!$('wb').hidden&&wb.tool==='select'){const mod=e.metaKey||e.ctrlKey;if(wb.sel&&(e.key==='Delete'||e.key==='Backspace')){e.preventDefault();wbSelAction('del');return;}if(e.key==='Escape'&&wb.sel){wbSelClear();return;}if(mod&&k==='c'&&wb.sel){e.preventDefault();wbSelAction('copy');return;}if(mod&&k==='d'&&wb.sel){e.preventDefault();wbSelAction('dup');return;}if(mod&&k==='v'&&wb.clip){e.preventDefault();wbPaste();return;}}
  if((e.metaKey||e.ctrlKey)&&k==='z'&&!$('wb').hidden){e.preventDefault();e.shiftKey?wbRedo():wbUndo();return;}if((e.metaKey||e.ctrlKey)&&k==='y'&&!$('wb').hidden){e.preventDefault();wbRedo();return;}
  if(e.metaKey||e.ctrlKey||e.altKey)return;if(k==='s'&&!$('wb').hidden){if(wb.tool==='select'){$('wb').querySelector(`[data-tool=${wb.prevTool&&wb.prevTool!=='select'?wb.prevTool:'pen'}]`).click();}else{wb.prevTool=wb.tool;$('wb').querySelector('[data-tool=select]').click();}return;}if(k==='w')toggleWB();else if(k==='c'&&view!=='practice')toggleCalc();});
 window.addEventListener('hashchange',route);route();}
