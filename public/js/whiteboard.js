"use strict";
/* ================= whiteboard ================= */
const WB_COL={ink:['#1C2B3A','#E6EDF3'],red:['#C8202A','#FF6B70'],blue:['#1F5FBF','#7DB2FF'],green:['#1E7A55','#5BC79A']};
const wb={view:{x:0,y:0,z:1},touches:new Map(),gest:null,space:false,strokes:[],undo:[],redo:[],tool:'pen',color:'ink',size:2.4,bg:null,penSeen:false,cur:null,cv:null,cache:null,dpr:1,w:0,h:0};
const isDark=()=>typeof document!=='undefined'&&document.documentElement.dataset.theme==='dark';
function wbInit(){
 const el=$('wb');
 el.innerHTML=`<div class="wb-resize" id="wbResize" title="Drag to resize"></div><div class="wb-bar">
 <div class="seg">${[['pen','Pen'],['hl','Highlight'],['erase','Eraser'],['select','Select'],['pan','Pan']].map(([k,l])=>`<button type="button" data-tool="${k}" class="${k==='pen'?'on':''}"${k==='select'?' title="Select (S toggles back to your last tool)"':''}>${l}</button>`).join('')}</div>
 <div class="wb-cols">${Object.keys(WB_COL).map(c=>`<button type="button" data-col="${c}" class="sw-${c}${c==='ink'?' on':''}" aria-label="${c} ink"></button>`).join('')}</div>
 <div class="seg">${[[1.4,'S'],[2.4,'M'],[4,'L']].map(([v,l])=>`<button type="button" data-size="${v}" class="${l==='M'?'on':''}" aria-label="Line width ${l}">${l}</button>`).join('')}</div>
 <span class="wb-sep"></span><button type="button" class="wbb" id="wbUndo" title="Undo (Ctrl+Z)">Undo</button><button type="button" class="wbb" id="wbRedo" title="Redo (Ctrl+Shift+Z)">Redo</button><button type="button" class="wbb" id="wbClear">Clear</button><button type="button" class="wbb" id="wbPaste" hidden title="Paste (Ctrl+V)">Paste</button>
 <span class="wb-sep"></span><button type="button" class="wbb" id="wbAdd" title="Place the schematic you are looking at on the board">Add schematic</button><label class="wb-follow" title="Each new practice circuit clears the board and adds its schematic"><input type="checkbox" id="wbFollow"> Follow problems</label>
 <span class="wb-grow"></span><button type="button" class="wbb" id="wbCopy">Copy</button><button type="button" class="wbb" id="wbSave">Save</button>${canShareFiles?'<button type="button" class="wbb" id="wbShare">Share</button>':''}<button type="button" class="wbb" id="wbFull" title="Full screen" aria-label="Toggle full screen">⤢</button><button type="button" class="wbb" id="wbClose" aria-label="Close whiteboard">×</button></div>
 <div class="wb-area" id="wbArea"><canvas id="wbCv"></canvas><div class="wb-zoom"><button type="button" data-z="out" aria-label="Zoom out">−</button><button type="button" data-z="reset" id="wbZ" title="Reset to 100%">100%</button><button type="button" data-z="in" aria-label="Zoom in">+</button><button type="button" data-z="fit" title="Zoom to fit everything">Fit</button></div><div class="wb-selbar" id="wbSelBar" hidden><button type="button" data-sa="copy">Copy</button><button type="button" data-sa="dup">Duplicate</button><button type="button" data-sa="img">Copy image</button><button type="button" data-sa="del" class="danger">Delete</button></div><div class="wb-hint" id="wbHint">Write out your working here with a pen, finger or mouse. Once an Apple Pencil is used, your palm and fingers are ignored on the board and toolbar while you write. Two-finger drag to move around and pinch to zoom (or use Pan, the scroll wheel, or hold Space and drag). Right-click drag erases.</div></div>`;
 const cv=$('wbCv'),area=$('wbArea');wb.cv=cv;wb.cache=document.createElement('canvas');
 try{const s=JSON.parse(localStorage.getItem('bench.wb')||'null');if(s&&Array.isArray(s.strokes))wb.strokes=s.strokes;}catch(e){}
 try{const v=JSON.parse(localStorage.getItem('bench.wbview')||'null');if(v&&isFinite(v.x)&&isFinite(v.y)&&v.z>0)wb.view=v;}catch(e){}
 if(wb.strokes.length)$('wbHint').style.display='none';
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(wbResize).observe(area);
 const scr=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top];};
 const pt=e=>{const r=cv.getBoundingClientRect(),V=wb.view;return[+((e.clientX-r.left-V.x)/V.z).toFixed(1),+((e.clientY-r.top-V.y)/V.z).toFixed(1),e.pointerType==='pen'?+(e.pressure||0.5).toFixed(2):0.5];};
 const recentPen=()=>wb.penDown||Date.now()-(wb.penT||0)<900,palm=e=>e.pointerType==='touch'&&wb.penSeen;
 el.addEventListener('pointerdown',e=>{if(e.pointerType==='pen')wb.penT=Date.now();if(palm(e)&&e.target!==cv&&recentPen()){e.preventDefault();e.stopPropagation();wb.blockUntil=Date.now()+700;}},true);
 el.addEventListener('click',e=>{if(Date.now()<(wb.blockUntil||0)&&e.pointerType!=='pen'&&e.pointerType!=='mouse'){e.preventDefault();e.stopPropagation();}},true);
 el.addEventListener('touchstart',e=>{if(wb.penSeen&&e.target!==cv&&recentPen())e.preventDefault();},{capture:true,passive:false});
 document.addEventListener('touchmove',e=>{if(wb.penDown||(wb.cur&&!$('wb').hidden))e.preventDefault();},{passive:false});
 cv.addEventListener('pointerdown',e=>{if(e.pointerType==='pen'){wb.penSeen=true;wb.penDown=true;wb.penT=Date.now();}
  if(e.pointerType==='touch'){wb.touches.set(e.pointerId,scr(e));if(wb.touches.size===2&&!wb.penDown){if(wb.cur&&wb.cur.ptype==='touch'){wb.cur=null;wbRedraw();}const [a,b]=[...wb.touches.values()];wb.gest={m:[(a[0]+b[0])/2,(a[1]+b[1])/2],d:Math.hypot(a[0]-b[0],a[1]-b[1])||1,v:{...wb.view}};$('wbSelBar').hidden=true;return;}if(wb.gest)return;}
  if(palm(e))return;
  const panBtn=e.pointerType==='mouse'&&(e.button===1||(e.button===0&&wb.space));if((wb.tool==='pan'&&!(e.pointerType==='mouse'&&e.button===2))||panBtn){if(wb.cur)return;e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(x){}wb.cur={pan:true,id:e.pointerId,s0:scr(e),v0:{...wb.view}};area.classList.add('grabbing');$('wbSelBar').hidden=true;return;}const rub=(e.pointerType==='mouse'&&e.button===2)||e.button===5;if(e.pointerType==='mouse'&&e.button!==0&&!rub)return;if(wb.cur)return;
  e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(x){}$('wbHint').style.display='none';const p=pt(e);
  if(wb.tool==='select'&&!rub){wbSelDown(p,e.pointerId);return;}
  wbSelClear();
  if(wb.tool==='erase'||rub){if(rub)area.classList.add('erasing');wb.cur={erase:true,before:wbSnap(),n:0,id:e.pointerId};wbErase(p);}else wb.cur={tool:wb.tool==='pan'||wb.tool==='select'?'pen':wb.tool,color:wb.color,size:wb.size,pts:[p],id:e.pointerId,ptype:e.pointerType};});
 cv.addEventListener('pointermove',e=>{if(e.pointerType==='pen')wb.penT=Date.now();
  if(e.pointerType==='touch'&&wb.touches.has(e.pointerId)){wb.touches.set(e.pointerId,scr(e));if(wb.gest&&wb.touches.size>=2){const [a,b]=[...wb.touches.values()],m=[(a[0]+b[0])/2,(a[1]+b[1])/2],d=Math.hypot(a[0]-b[0],a[1]-b[1])||1,G=wb.gest,z=Math.max(0.15,Math.min(6,G.v.z*d/G.d));wb.view={z,x:m[0]-(G.m[0]-G.v.x)*z/G.v.z,y:m[1]-(G.m[1]-G.v.y)*z/G.v.z};wbViewChanged();return;}if(wb.gest)return;}
  const c=wb.cur;if(!c||c.id!==e.pointerId)return;
  if(c.pan){const q=scr(e);wb.view={...c.v0,x:c.v0.x+q[0]-c.s0[0],y:c.v0.y+q[1]-c.s0[1]};wbViewChanged();return;}
  if(c.marq||c.move){wbSelMove(pt(e));return;}
  const evs=e.getCoalescedEvents?e.getCoalescedEvents():[e];for(const ev of (evs.length?evs:[e])){const p=pt(ev);if(c.erase)wbErase(p);else c.pts.push(p);}if(!c.erase)wbLive();});
 const end=e=>{if(e.pointerType==='pen'){wb.penDown=false;wb.penT=Date.now();}
  if(e.pointerType==='touch'){wb.touches.delete(e.pointerId);if(wb.gest){if(wb.touches.size<2){wb.gest=null;wbSelUI();}return;}}
  const c=wb.cur;if(!c||c.id!==e.pointerId)return;wb.cur=null;
  if(c.pan){area.classList.remove('grabbing');clearTimeout(wbIdle);wbRedraw();wbSelUI();return;}
  if(c.ptype)delete c.ptype;
  if(c.marq||c.move){wbSelUp(c);return;}
  area.classList.toggle('erasing',wb.tool==='erase');
  if(c.erase){if(c.n){wbPush(c.before);}}else{if(c.pts.length===1){const p=c.pts[0];c.pts.push([p[0]+0.2,p[1]+0.2,p[2]]);}wbPush();delete c.id;wb.strokes.push(c);}
  wbRedraw();wbStore();};
 cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
 cv.addEventListener('contextmenu',e=>e.preventDefault());
 cv.addEventListener('mousedown',e=>{if(e.button===1)e.preventDefault();});cv.addEventListener('auxclick',e=>{if(e.button===1)e.preventDefault();});
 area.addEventListener('wheel',e=>{if(e.target.closest('.wb-zoom,.wb-selbar'))return;e.preventDefault();const q=scr(e),V=wb.view;
  if(e.ctrlKey||e.metaKey){const dy=e.deltaMode===1?e.deltaY*20:e.deltaY,k=Math.abs(dy)<30?0.012:0.0025,z=Math.max(0.15,Math.min(6,V.z*Math.exp(-dy*k)));wb.view={z,x:q[0]-(q[0]-V.x)*z/V.z,y:q[1]-(q[1]-V.y)*z/V.z};}
  else{const k=e.deltaMode===1?20:1;wb.view={...V,x:V.x-e.deltaX*k,y:V.y-e.deltaY*k};}wbViewChanged();},{passive:false});
 el.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{const a=b.dataset.z;if(a==='fit')return wbFit();if(a==='reset'){wb.view={x:0,y:0,z:1};return wbViewChanged();}wbZoomBy(a==='in'?1.25:0.8);});
 area.addEventListener('pointerenter',()=>wb.hover=true);area.addEventListener('pointerleave',()=>wb.hover=false);
 document.addEventListener('keydown',e=>{if(e.code!=='Space'||$('wb').hidden||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||!(wb.hover||e.target.closest('#wb')))return;e.preventDefault();if(!wb.space){wb.space=true;area.classList.add('panning');}});
 document.addEventListener('keyup',e=>{if(e.code==='Space'&&wb.space){wb.space=false;if(wb.tool!=='pan')area.classList.remove('panning');}});
 wbGrid();
 $('wbSelBar').querySelectorAll('[data-sa]').forEach(b=>b.onclick=()=>wbSelAction(b.dataset.sa));$('wbPaste').onclick=wbPaste;
 el.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{wb.tool=b.dataset.tool;el.querySelectorAll('[data-tool]').forEach(x=>x.classList.toggle('on',x===b));area.classList.toggle('erasing',wb.tool==='erase');area.classList.toggle('selecting',wb.tool==='select');area.classList.toggle('panning',wb.tool==='pan'||wb.space);if(wb.tool!=='select')wbSelClear();});
 el.querySelectorAll('[data-col]').forEach(b=>b.onclick=()=>{wb.color=b.dataset.col;el.querySelectorAll('[data-col]').forEach(x=>x.classList.toggle('on',x===b));if(wb.tool==='erase')el.querySelector('[data-tool=pen]').click();});
 el.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{wb.size=+b.dataset.size;el.querySelectorAll('[data-size]').forEach(x=>x.classList.toggle('on',x===b));});
 $('wbUndo').onclick=wbUndo;$('wbRedo').onclick=wbRedo;$('wbClear').onclick=()=>{if(!wb.strokes.length&&!wb.bg)return;wbSelClear(true);wbPush();wb.strokes=[];wb.bg=null;wbRedraw();wbStore();};
 $('wbAdd').onclick=()=>wbAddSchematic(false);$('wbFollow').checked=!!prefs.wbFollow;$('wbFollow').onchange=e=>{prefs.wbFollow=e.target.checked;store.set('bench.prefs',prefs);if(prefs.wbFollow&&view==='practice')wbFollowNow();};
 $('wbCopy').onclick=()=>{if(!wbBounds()){toast('The board is empty.');return;}navigator.clipboard.write([new ClipboardItem({'image/png':wbBlob()})]).then(()=>toast('Copied. Paste it into your notes.')).catch(async()=>{toast('Copy isn’t allowed here, so it was saved instead.');downloadBlob(await wbBlob(),'whiteboard.png');});};
 $('wbSave').onclick=async()=>{if(!wbBounds()){toast('The board is empty.');return;}downloadBlob(await wbBlob(),'whiteboard.png');};
 if($('wbShare'))$('wbShare').onclick=async()=>{if(!wbBounds()){toast('The board is empty.');return;}try{await navigator.share({files:[new File([await wbBlob()],'whiteboard.png',{type:'image/png'})],title:'Whiteboard'});}catch(e){}};
 $('wbFull').onclick=()=>{el.classList.toggle('full');};$('wbClose').onclick=()=>toggleWB(false);
 const rs=$('wbResize');rs.addEventListener('pointerdown',e=>{e.preventDefault();rs.setPointerCapture(e.pointerId);const mv=ev=>{const Z=UZ(),w=Math.max(320,Math.min((innerWidth-360)/Z,(innerWidth-ev.clientX)/Z));document.documentElement.style.setProperty('--wbw',w+'px');prefs.wbw=w;};const up=()=>{rs.removeEventListener('pointermove',mv);rs.removeEventListener('pointerup',up);store.set('bench.prefs',prefs);if(view==='practice'&&cur)requestAnimationFrame(()=>fitAll($('card')));};rs.addEventListener('pointermove',mv);rs.addEventListener('pointerup',up);});
 if(prefs.wbw)document.documentElement.style.setProperty('--wbw',prefs.wbw+'px');
 $('wbTog').onclick=()=>toggleWB();if(prefs.wbOpen)toggleWB(true);}
function toggleWB(force){const el=$('wb'),open=force??el.hidden;el.hidden=!open;$('wbTog').classList.toggle('on',open);$('wbTog').setAttribute('aria-expanded',open);document.body.classList.toggle('wb-open',open);
 if(!open)el.classList.remove('full');prefs.wbOpen=open;store.set('bench.prefs',prefs);if(open)requestAnimationFrame(wbResize);if(view==='practice'&&cur)requestAnimationFrame(()=>fitAll($('card')));}
function wbResize(){const a=$('wbArea');if(!a||$('wb').hidden)return;const r=a.getBoundingClientRect();if(!r.width)return;wb.dpr=window.devicePixelRatio||1;wb.w=r.width;wb.h=r.height;
 wb.cv.width=Math.round(r.width*wb.dpr);wb.cv.height=Math.round(r.height*wb.dpr);wbRedraw();}
function wbMargin(){const W=wb.w,H=wb.h,A=12e6/(wb.dpr*wb.dpr),m=(-2*(W+H)+Math.sqrt(4*(W+H)**2-16*(W*H-A)))/8;return Math.max(0,Math.min(Math.max(W,H)*1.5,m||0));}
const UZ=()=>window.UIZ||1;
function uiScale(){const pref=(typeof prefs!=='undefined'&&prefs.uiScale)||'auto',W=window.innerWidth;let z=pref==='auto'?Math.min(1.6,Math.max(1,W/1800)):+pref;if(W/z<1050)z=Math.max(1,W/1050);z=Math.round(z*100)/100;
 const old=UZ();window.UIZ=z;document.documentElement.style.zoom=z===1?'':String(z);if(old!==z&&typeof cur!=='undefined'){requestAnimationFrame(()=>{if(view==='practice'&&cur)fitAll($('card'));if(typeof wbGrid==='function')wbGrid();if(typeof wbResize==='function')wbResize();});}return z;}
function wbXf(c){const V=wb.view,d=wb.dpr;c.setTransform(d*V.z,0,0,d*V.z,d*V.x,d*V.y);}
function wbGrid(){const a=$('wbArea');if(!a)return;const V=wb.view,Z=UZ(),g=24*V.z/Z;a.style.backgroundSize=`${g}px ${g}px`;a.style.backgroundPosition=`${V.x/Z}px ${V.y/Z}px`;const z=$('wbZ');if(z)z.textContent=Math.round(V.z*100)+'%';}
let wbVT=null,wbRAF=0,wbIdle=null;function wbViewChanged(){wbGrid();$('wbSelBar').hidden=true;if(!wbRAF)wbRAF=requestAnimationFrame(()=>{wbRAF=0;wbBlit();});clearTimeout(wbIdle);wbIdle=setTimeout(()=>{wbRedraw();if(!wb.gest&&!(wb.cur&&wb.cur.pan))wbSelUI();},120);clearTimeout(wbVT);wbVT=setTimeout(()=>{try{localStorage.setItem('bench.wbview',JSON.stringify(wb.view));}catch(e){}},300);}
function wbZoomBy(f){const V=wb.view,cx=wb.w/2,cy=wb.h/2,z=Math.max(0.15,Math.min(6,V.z*f));wb.view={z,x:cx-(cx-V.x)*z/V.z,y:cy-(cy-V.y)*z/V.z};wbViewChanged();}
function wbFit(){const b=wbBounds();if(!b){wb.view={x:0,y:0,z:1};return wbViewChanged();}const z=Math.max(0.15,Math.min(2,Math.min(wb.w/b.w,(wb.h-50)/b.h)));wb.view={z,x:(wb.w-b.w*z)/2-b.x*z,y:(wb.h-b.h*z)/2-b.y*z};wbViewChanged();}
const wbSnap=()=>({strokes:wb.strokes.slice(),bg:wb.bg});
function wbPush(s){wb.undo.push(s||wbSnap());if(wb.undo.length>100)wb.undo.shift();wb.redo=[];}
function wbUndo(){if(!wb.undo.length)return;wbSelClear(true);wb.redo.push(wbSnap());const s=wb.undo.pop();wb.strokes=s.strokes;wb.bg=s.bg;wbRedraw();wbStore();}
function wbRedo(){if(!wb.redo.length)return;wbSelClear(true);wb.undo.push(wbSnap());const s=wb.redo.pop();wb.strokes=s.strokes;wb.bg=s.bg;wbRedraw();wbStore();}
let wbT=null;function wbStore(){clearTimeout(wbT);wbT=setTimeout(()=>{try{localStorage.setItem('bench.wb',JSON.stringify({strokes:wb.strokes}));}catch(e){}if(typeof syncSt!=='undefined')syncTouch('wb');},400);}
function wbStroke(x,s,dark){const P=s.pts;x.lineCap='round';x.lineJoin='round';x.strokeStyle=WB_COL[s.color][dark?1:0];
 if(s.tool==='hl'){x.save();x.globalAlpha=0.28;x.lineWidth=s.size*7;x.beginPath();x.moveTo(P[0][0],P[0][1]);for(let i=1;i<P.length;i++)x.lineTo(P[i][0],P[i][1]);x.stroke();x.restore();return;}
 for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];x.lineWidth=s.size*(0.45+1.1*((a[2]+b[2])/2));x.beginPath();
  if(i>=2){const p0=P[i-2];x.moveTo((p0[0]+a[0])/2,(p0[1]+a[1])/2);x.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}else{x.moveTo(a[0],a[1]);x.lineTo((a[0]+b[0])/2,(a[1]+b[1])/2);}x.stroke();}
 const n=P.length,a=P[n-2],b=P[n-1];x.beginPath();x.moveTo((a[0]+b[0])/2,(a[1]+b[1])/2);x.lineTo(b[0],b[1]);x.stroke();}
function wbPaint(x,dark,skipSel,only){const sl=skipSel&&wb.sel;if(wb.bg&&!(sl&&wb.sel.bg)&&(!only||only.bg))x.drawImage(wb.bg.img,wb.bg.x,wb.bg.y,wb.bg.w,wb.bg.h);for(const s of wb.strokes){if(sl&&wb.sel.strokes.has(s))continue;if(only&&!only.strokes.has(s))continue;wbStroke(x,s,dark);}}
function wbRedraw(skipSel){const c=wb.cache;if(!c||!wb.w)return;const V=wb.view,d=wb.dpr,M=wbMargin(),cw=Math.round((wb.w+2*M)*d),ch=Math.round((wb.h+2*M)*d);if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;}const x=c.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,c.width,c.height);x.setTransform(d*V.z,0,0,d*V.z,d*(V.x+M),d*(V.y+M));wbPaint(x,isDark(),skipSel);wb.cacheView={...V,m:M};wb.lastFull=performance.now();
 const v=wb.cv.getContext('2d');v.setTransform(1,0,0,1,0,0);v.clearRect(0,0,wb.cv.width,wb.cv.height);v.drawImage(c,-M*d,-M*d);wbXf(v);wbOverlay(v);}
function wbBlit(){const c=wb.cache,cv=wb.cacheView;if(!c||!c.width||!cv)return wbRedraw();const V=wb.view,k=V.z/cv.z,d=wb.dpr,M=cv.m;
 const ox=V.x-(M+cv.x)*k,oy=V.y-(M+cv.y)*k,covered=ox<=1&&oy<=1&&ox+(wb.w+2*M)*k>=wb.w-1&&oy+(wb.h+2*M)*k>=wb.h-1;
 if(!covered&&performance.now()-(wb.lastFull||0)>90){const sel=wb.cur&&wb.cur.move;return wbRedraw(sel);}
 const v=wb.cv.getContext('2d');v.setTransform(1,0,0,1,0,0);v.clearRect(0,0,wb.cv.width,wb.cv.height);v.drawImage(c,d*ox,d*oy,c.width*k,c.height*k);}
function wbLive(){const v=wb.cv.getContext('2d');v.setTransform(1,0,0,1,0,0);v.clearRect(0,0,wb.cv.width,wb.cv.height);const M=(wb.cacheView&&wb.cacheView.m)||0;v.drawImage(wb.cache,-M*wb.dpr,-M*wb.dpr);wbXf(v);if(wb.cur&&wb.cur.pts&&wb.cur.pts.length>1)wbStroke(v,wb.cur,isDark());wbOverlay(v);}
function wbErase(p){const r=12/wb.view.z;let hit=false;for(let i=wb.strokes.length-1;i>=0;i--){const s=wb.strokes[i],rr=r+(s.tool==='hl'?s.size*3.5:s.size);
  if(s.pts.some((q,k)=>{if(Math.hypot(q[0]-p[0],q[1]-p[1])<rr)return true;const o=s.pts[k+1];if(!o)return false;const dx=o[0]-q[0],dy=o[1]-q[1],L=dx*dx+dy*dy;if(!L)return false;const t=Math.max(0,Math.min(1,((p[0]-q[0])*dx+(p[1]-q[1])*dy)/L));return Math.hypot(q[0]+t*dx-p[0],q[1]+t*dy-p[1])<rr;})){wb.strokes.splice(i,1);hit=true;wb.cur.n++;}}
 if(hit)wbRedraw();}

/* whiteboard selection: drag a box to select, drag inside it to move */
function wbItemBox(s){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const pad=s.tool==='hl'?s.size*3.5:s.size*1.5;for(const p of s.pts){x0=Math.min(x0,p[0]-pad);y0=Math.min(y0,p[1]-pad);x1=Math.max(x1,p[0]+pad);y1=Math.max(y1,p[1]+pad);}return{x0,y0,x1,y1};}
function wbSelBox(){const S=wb.sel;if(!S)return null;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const s of S.strokes){const b=wbItemBox(s);x0=Math.min(x0,b.x0);y0=Math.min(y0,b.y0);x1=Math.max(x1,b.x1);y1=Math.max(y1,b.y1);}
 if(S.bg&&wb.bg){x0=Math.min(x0,wb.bg.x);y0=Math.min(y0,wb.bg.y);x1=Math.max(x1,wb.bg.x+wb.bg.w);y1=Math.max(y1,wb.bg.y+wb.bg.h);}if(x1<x0)return null;const m=8;return{x:x0-m,y:y0-m,w:x1-x0+2*m,h:y1-y0+2*m};}
function wbOverlay(v){const c=wb.cur,dark=isDark();
 if(c&&c.move&&wb.sel){v.save();v.translate(c.dx,c.dy);if(wb.sel.bg&&wb.bg)v.drawImage(wb.bg.img,wb.bg.x,wb.bg.y,wb.bg.w,wb.bg.h);for(const s of wb.sel.strokes)wbStroke(v,s,dark);v.restore();}
 let box=null;if(c&&c.marq)box={x:Math.min(c.a[0],c.b[0]),y:Math.min(c.a[1],c.b[1]),w:Math.abs(c.b[0]-c.a[0]),h:Math.abs(c.b[1]-c.a[1])};else{const b=wbSelBox();if(b)box={x:b.x+(c&&c.move?c.dx:0),y:b.y+(c&&c.move?c.dy:0),w:b.w,h:b.h};}
 if(box){v.save();const iz=1/wb.view.z;v.setLineDash([6*iz,4*iz]);v.lineWidth=1.5*iz;v.strokeStyle=dark?'#7DB2FF':'#1F5FBF';v.fillStyle=dark?'rgba(125,178,255,.08)':'rgba(31,95,191,.06)';v.fillRect(box.x,box.y,box.w,box.h);v.strokeRect(box.x,box.y,box.w,box.h);v.restore();}}
function wbSelDown(p,id){const b=wbSelBox();if(b&&p[0]>=b.x&&p[0]<=b.x+b.w&&p[1]>=b.y&&p[1]<=b.y+b.h){wb.cur={move:true,start:p,dx:0,dy:0,id,before:wbSnap()};$('wbSelBar').hidden=true;wbRedraw(true);return;}
 wbSelClear(true);wb.cur={marq:true,a:p,b:p,id};wbRedraw();}
function wbSelMove(p){const c=wb.cur;if(c.marq)c.b=p;else{c.dx=p[0]-c.start[0];c.dy=p[1]-c.start[1];}wbLive();}
function wbSelUp(c){
 if(c.marq){const x0=Math.min(c.a[0],c.b[0]),x1=Math.max(c.a[0],c.b[0]),y0=Math.min(c.a[1],c.b[1]),y1=Math.max(c.a[1],c.b[1]);if(x1-x0<4&&y1-y0<4){wbSelClear();return;}
  const inR=p=>p[0]>=x0&&p[0]<=x1&&p[1]>=y0&&p[1]<=y1,strokes=wb.strokes.filter(s=>s.pts.filter(inR).length>=Math.max(1,0.6*s.pts.length)),bg=!!(wb.bg&&inR([wb.bg.x+wb.bg.w/2,wb.bg.y+wb.bg.h/2]));
  wb.sel=strokes.length||bg?{strokes:new Set(strokes),bg}:null;wbRedraw();wbSelUI();return;}
 if(Math.abs(c.dx)<0.5&&Math.abs(c.dy)<0.5){wbRedraw();wbSelUI();return;}
 wbPush(c.before);wbShiftSel(c.dx,c.dy);wbRedraw();wbStore();wbSelUI();}
function wbShiftSel(dx,dy){const ns=new Set();wb.strokes=wb.strokes.map(s=>{if(!wb.sel.strokes.has(s))return s;const t={...s,pts:s.pts.map(p=>[+(p[0]+dx).toFixed(1),+(p[1]+dy).toFixed(1),p[2]])};ns.add(t);return t;});wb.sel.strokes=ns;if(wb.sel.bg&&wb.bg)wb.bg={...wb.bg,x:wb.bg.x+dx,y:wb.bg.y+dy};}
function wbSelClear(silent){const had=!!wb.sel;wb.sel=null;if(had&&!silent)wbRedraw();if($('wbSelBar'))$('wbSelBar').hidden=true;}
function wbSelUI(){const bar=$('wbSelBar');if(!bar)return;const b=wbSelBox();if(!b||wb.cur){bar.hidden=true;return;}bar.hidden=false;
 bar.querySelector('[data-sa=copy]').hidden=bar.querySelector('[data-sa=dup]').hidden=!wb.sel.strokes.size;
 const V=wb.view,sb={x:b.x*V.z+V.x,y:b.y*V.z+V.y,w:b.w*V.z,h:b.h*V.z};const Z=UZ(),bw=(bar.offsetWidth||260)*Z,bh=(bar.offsetHeight||34)*Z;let x=Math.max(4,Math.min(sb.x,wb.w-bw-4)),y=sb.y-bh-8;if(y<4)y=Math.min(sb.y+sb.h+8,wb.h-bh-4);bar.style.left=x/Z+'px';bar.style.top=y/Z+'px';}
const wbClone=(s,d)=>({...s,pts:s.pts.map(p=>[+(p[0]+d).toFixed(1),+(p[1]+d).toFixed(1),p[2]])});
function wbSelAction(a){const S=wb.sel;if(!S)return;
 if(a==='copy'){wb.clip=[...S.strokes];wb.clipN=0;$('wbPaste').hidden=!wb.clip.length;toast(S.bg&&!S.strokes.size?'The schematic can be moved but not copied.':'Copied. Press Paste (or Ctrl+V) to place a copy.');}
 else if(a==='dup'){if(!S.strokes.size)return;wbPush();const copies=[...S.strokes].map(s=>wbClone(s,24));wb.strokes=wb.strokes.concat(copies);wb.sel={strokes:new Set(copies),bg:false};wbRedraw();wbStore();wbSelUI();}
 else if(a==='del'){wbPush();wb.strokes=wb.strokes.filter(s=>!S.strokes.has(s));if(S.bg)wb.bg=null;wbSelClear(true);wbRedraw();wbStore();}
 else if(a==='img'){const b=wbSelBox();navigator.clipboard.write([new ClipboardItem({'image/png':wbBlob({box:b,only:S})})]).then(()=>toast('Selection copied as an image.')).catch(async()=>{downloadBlob(await wbBlob({box:b,only:S}),'selection.png');toast('Copy isn’t allowed here, so it was saved instead.');});}}
function wbPaste(){if(!wb.clip||!wb.clip.length)return;wb.clipN=(wb.clipN||0)+1;wbPush();const copies=wb.clip.map(s=>wbClone(s,24*wb.clipN));wb.strokes=wb.strokes.concat(copies);
 if(wb.tool!=='select')$('wb').querySelector('[data-tool=select]').click();wb.sel={strokes:new Set(copies),bg:false};wbRedraw();wbStore();wbSelUI();}
function wbBounds(){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const s of wb.strokes){const pad=s.tool==='hl'?s.size*4:s.size*2;for(const p of s.pts){x0=Math.min(x0,p[0]-pad);y0=Math.min(y0,p[1]-pad);x1=Math.max(x1,p[0]+pad);y1=Math.max(y1,p[1]+pad);}}
 if(wb.bg){x0=Math.min(x0,wb.bg.x);y0=Math.min(y0,wb.bg.y);x1=Math.max(x1,wb.bg.x+wb.bg.w);y1=Math.max(y1,wb.bg.y+wb.bg.h);}
 if(x1<x0)return null;const m=24;return{x:x0-m,y:y0-m,w:x1-x0+2*m,h:y1-y0+2*m};}
function wbBlob(o={}){return new Promise((res,rej)=>{const b=o.box||wbBounds();if(!b){rej(new Error('empty'));return;}const s=2,c=document.createElement('canvas');c.width=Math.ceil(b.w*s);c.height=Math.ceil(b.h*s);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.setTransform(s,0,0,s,-b.x*s,-b.y*s);wbPaint(x,false,false,o.only);c.toBlob(bl=>bl?res(bl):rej(new Error('blob')),'image/png');});}
function currentSchematic(){if(view==='practice')return $('card').querySelector('.qleft svg');if(view==='sim')return $('simSheet')?.querySelector('svg');
 const vis=[...document.querySelectorAll('.view.on .sheet svg')].find(s=>{const r=s.getBoundingClientRect();return r.bottom>60&&r.top<innerHeight;});return vis||null;}
async function wbAddSchematic(silent){const svg=currentSchematic();if(!svg){if(!silent)toast('There’s no schematic on screen to add.');return;}
 try{const blob=await svgPng(svg,2),img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=URL.createObjectURL(blob);});
  const vb=svg.viewBox.baseVal,W=wb.w||400,H=wb.h||400;let w=Math.min(W-32,vb.width*1.1),h=w*vb.height/vb.width;if(h>H*0.55){h=H*0.55;w=h*vb.width/vb.height;}
  const V=wb.view;wbPush();wb.bg={img,x:(16-V.x)/V.z,y:(16-V.y)/V.z,w:w/V.z,h:h/V.z};$('wbHint').style.display='none';wbRedraw();}catch(e){if(!silent)toast('Couldn’t add the schematic.');}}
function wbFollowNow(){if($('wb').hidden||!prefs.wbFollow)return;if(wb.strokes.length||wb.bg)wbPush();wb.strokes=[];wb.bg=null;wb.view={x:0,y:0,z:1};wbGrid();wbRedraw();wbStore();setTimeout(()=>wbAddSchematic(true),80);}
