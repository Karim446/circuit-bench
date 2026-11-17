"use strict";
/* ================= netlist + DC solver ================= */
const PFX={p:1e-12,n:1e-9,u:1e-6,'µ':1e-6,m:1e-3,'':1,k:1e3,M:1e6,G:1e9};
function parseVal(str){if(str==null)return NaN;const m=String(str).match(/(-?\d*\.?\d+)\s*([pnuµmkMG]?)/);return m?parseFloat(m[1])*PFX[m[2]||'']:NaN;}
const pkey=p=>`${Math.round(p[0]*2)/2},${Math.round(p[1]*2)/2}`;
function onSeg(p,a,b){const cr=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(Math.abs(cr)>0.8*Math.hypot(b[0]-a[0],b[1]-a[1]))return false;return p[0]>=Math.min(a[0],b[0])-.6&&p[0]<=Math.max(a[0],b[0])+.6&&p[1]>=Math.min(a[1],b[1])-.6&&p[1]<=Math.max(a[1],b[1])+.6;}
/* Build connectivity, device list, and net names from a recorded schematic */
function extract(N){
 const par={},find=k=>{while(par[k]!==k){par[k]=par[par[k]];k=par[k];}return k;},add=k=>{if(!(k in par))par[k]=k;},uni=(a,b)=>{add(a);add(b);const x=find(a),y=find(b);if(x!==y)par[x]=y;};
 const pts=[],P=p=>{add(pkey(p));pts.push(p);};
 N.comps.forEach(c=>{P(c.a);P(c.b);});N.ops.forEach(o=>{P(o.top);P(o.bot);P(o.out);});N.bjts.forEach(q=>{P(q.b);P(q.c);P(q.e);});N.fets.forEach(q=>{P(q.g);P(q.d);P(q.s);});
 N.rails.forEach(r=>P(r.p));N.terms.forEach(t=>P(t.p));N.gnds.forEach(g=>P(g));N.probes.forEach(q=>P(q.p));N.dots.forEach(d=>P(d));N.wires.forEach(w=>w.forEach(P));
 N.wires.forEach(w=>{for(let i=0;i<w.length-1;i++){uni(pkey(w[i]),pkey(w[i+1]));for(const p of pts)if(onSeg(p,w[i],w[i+1]))uni(pkey(p),pkey(w[i]));}});
 add('GND');N.gnds.forEach(g=>uni(pkey(g),'GND'));
 const root=p=>find(pkey(p)),G0=find('GND');
 const nets=new Map();const net=r=>{if(!nets.has(r))nets.set(r,{root:r,name:null,gnd:r===G0,labels:[],pts:[]});return nets.get(r);};
 N.rails.forEach(r=>net(root(r.p)).labels.push(r.label.replace(/\s/g,'')));
 N.terms.forEach(t=>{const n=net(root(t.p));const l=t.label.replace(/\s*=.*$/,'').replace(/\s+/g,'_');n.labels.push(l);});
 const allPts=[...N.probes.map(q=>q.p),...N.terms.map(t=>t.p),...N.dots,...N.wires.flat(),...pts];
 allPts.forEach(p=>net(root(p)).pts.push(p));
 let k=1;[...nets.values()].forEach(n=>{n.name=n.gnd?'0':(n.labels[0]||`N${k++}`);});
 const used=new Set();[...nets.values()].forEach(n=>{let nm=n.name,i=2;while(used.has(nm)&&!n.gnd)nm=n.name+'_'+i++;n.name=nm;used.add(nm);});
 return{root,G0,nets,nameOf:p=>nets.get(root(p))?.name??'?'};
}
/* Device list with values; faults: {ref:{mode:'open'|'short'}}, vals:{ref:number|bool} */
function devices(N){
 const D=[];
 N.comps.forEach((c,i)=>{const ref='c'+i;let v=c.opt.sv??parseVal(c.val);
  const d={ref,type:c.type,name:c.name||c.type.toUpperCase(),label:c.val,a:c.a,b:c.b,src:c};
  if(c.type==='res'){d.value=v;d.unit='Ω';}
  else if(c.type==='src'){d.value=v;d.unit='V';}
  else if(c.type==='cap'){d.value=v;d.unit='F';}
  else if(c.type==='led'){d.value=c.opt.vf??2.0;d.unit='V (Vf)';}
  else if(c.type==='diode'){d.value=0.7;d.unit='V (Vf)';}
  else if(c.type==='zener'){d.value=isFinite(v)?v:5.1;d.unit='V (Vz)';}
  else if(c.type==='isrc'){d.value=v;d.unit='A';}
  else if(c.type==='photo'){d.value=c.opt.iph??0;d.unit='A';}
  else if(c.type==='sw'){d.value=!!c.opt.closed;d.unit='';}
  else if(c.type==='coil'){d.value=0;d.unit='';}
  D.push(d);});
 N.rails.forEach((r,i)=>D.push({ref:'r'+i,type:'rail',name:r.label,value:r.v??parseVal(r.label),unit:'V',p:r.p}));
 N.terms.forEach((t,i)=>{const v=t.v??parseVal(t.label);if(isFinite(v))D.push({ref:'t'+i,type:'term',name:t.label.replace(/\s*=.*$/,''),value:v,unit:'V',p:t.p});});
 N.ops.forEach((o,i)=>D.push({ref:'o'+i,type:'opamp',name:'U'+(i+1),src:o,value:o.vp,unit:'V rails'}));
 N.bjts.forEach((q,i)=>D.push({ref:'q'+i,type:'npn',name:q.name,src:q,value:q.beta,unit:'β'}));
 N.fets.forEach((q,i)=>D.push({ref:'m'+i,type:'nmos',name:q.name,src:q,value:q.vth,unit:'V (Vth)'}));
 return D;
}
const GMIN=1e-12,RON=0.05,ROFF=1e9;
function simulate(N,ex,D,faults={},vals={},tr=null){
 const idx=new Map();let n=0;const ni=p=>{const r=ex.root(p);if(r===ex.G0)return -1;if(!idx.has(r))idx.set(r,n++);return idx.get(r);};
 const E=[],missing=[];
 for(const d of D){const f=faults[d.ref]?.mode,v=vals[d.ref]??d.value;
  if(f==='open')continue;
  if(['res','src','isrc','cap','led','diode','zener','photo','sw','coil'].includes(d.type)){const a=ni(d.a),b=ni(d.b);
   if(f==='short'){E.push({k:'R',a,b,r:1e-3,ref:d.ref});continue;}
   if(d.type==='res'){if(!isFinite(v)||v<=0){missing.push(d.name);continue;}E.push({k:'R',a,b,r:v,ref:d.ref});}
   else if(d.type==='src')E.push({k:'V',p:b,n:a,v:tr&&tr.wave[d.ref]?tr.wave[d.ref](tr.t):v,ref:d.ref});
   else if(d.type==='cap'){if(tr){const G=v/tr.dt;E.push({k:'Rc',a,b,G,ieq:-G*(tr.capV[d.ref]||0),ref:d.ref});}else E.push({k:'R',a,b,r:1e12,ref:d.ref});}
   else if(d.type==='coil'){const Rw=120,L=0.05;if(tr){const Lh=L/tr.dt,G=1/(Rw+Lh);E.push({k:'Rc',a,b,G,ieq:Lh*G*(tr.indI[d.ref]||0),ref:d.ref});}else E.push({k:'R',a,b,r:Rw,ref:d.ref});}
   else if(d.type==='sw')E.push({k:'R',a,b,r:v?1e-3:1e12,ref:d.ref});
   else if(d.type==='isrc')E.push({k:'I',a,b,i:v,ref:d.ref});
   else if(d.type==='photo')E.push({k:'I',a:b,b:a,i:v,ref:d.ref});
   else E.push({k:'D',a,b,vf:d.type==='zener'?0.7:v,vz:d.type==='zener'?v:null,st:'off',ref:d.ref});}
  else if(d.type==='rail'||d.type==='term')E.push({k:'V',p:ni(d.p),n:-1,v:tr&&tr.wave[d.ref]?tr.wave[d.ref](tr.t):v,ref:d.ref});
  else if(d.type==='opamp'){const o=d.src;E.push({k:'OA',pp:ni(o.plusTop?o.top:o.bot),nn:ni(o.plusTop?o.bot:o.top),out:ni(o.out),vp:o.vp,vn:o.vn,st:'lin',ref:d.ref});}
  else if(d.type==='npn'){const q=d.src;if(f==='short'){E.push({k:'R',a:ni(q.c),b:ni(q.e),r:1e-3,ref:d.ref});continue;}E.push({k:'Q',b:ni(q.b),c:ni(q.c),e:ni(q.e),beta:v,st:'off',ref:d.ref});}
  else if(d.type==='nmos'){const q=d.src;if(f==='short'){E.push({k:'R',a:ni(q.d),b:ni(q.s),r:1e-3,ref:d.ref});continue;}E.push({k:'M',g:ni(q.g),d:ni(q.d),s:ni(q.s),vth:v,vfull:Math.max(q.vfull,v+0.5),ron:q.ron,r:ROFF,ref:d.ref});}
 }
 if(missing.length)return{error:`Missing values for ${missing.join(', ')}.`};
 const vsrc=E.filter(e=>e.k==='V');let x=null,V=null;
 const Vn=i=>i<0?0:V[i];
 for(let it=0;it<120;it++){
  const S=n+vsrc.length,A=Array.from({length:S},()=>new Float64Array(S)),z=new Float64Array(S);
  const g=(a,b,c)=>{if(a>=0)A[a][a]+=c;if(b>=0)A[b][b]+=c;if(a>=0&&b>=0){A[a][b]-=c;A[b][a]-=c;}};
  const cur=(a,b,i)=>{if(a>=0)z[a]-=i;if(b>=0)z[b]+=i;};
  const gm=(oa,ob,ca,cb,c)=>{if(oa>=0){if(ca>=0)A[oa][ca]+=c;if(cb>=0)A[oa][cb]-=c;}if(ob>=0){if(ca>=0)A[ob][ca]-=c;if(cb>=0)A[ob][cb]+=c;}};
  for(let i=0;i<n;i++)A[i][i]+=GMIN;
  let j=n;
  for(const e of E){
   if(e.k==='R')g(e.a,e.b,1/e.r);
   else if(e.k==='I')cur(e.a,e.b,e.i);
   else if(e.k==='V'){e.j=j;if(e.p>=0){A[e.p][j]+=1;A[j][e.p]+=1;}if(e.n>=0){A[e.n][j]-=1;A[j][e.n]-=1;}z[j]=e.v;j++;}
   else if(e.k==='D'){if(e.st==='on'){g(e.a,e.b,1/RON);cur(e.a,e.b,-e.vf/RON);}else if(e.st==='rev'){g(e.a,e.b,1/RON);cur(e.a,e.b,e.vz/RON);}else g(e.a,e.b,1/ROFF);}
   else if(e.k==='OA'){if(e.out>=0){A[e.out][e.out]+=1;if(e.st==='lin'){const Ag=1e5;if(e.pp>=0)A[e.out][e.pp]-=Ag;if(e.nn>=0)A[e.out][e.nn]+=Ag;}else z[e.out]+=e.st==='hi'?e.vp:e.vn;}}
   else if(e.k==='Rc'){g(e.a,e.b,e.G);cur(e.a,e.b,e.ieq);}
   else if(e.k==='Q'){if(e.st==='bd'){g(e.b,e.e,1/ROFF);g(e.c,e.e,1/RON);cur(e.c,e.e,-60/RON);}else if(e.st==='off'){g(e.b,e.e,1/ROFF);g(e.c,e.e,1/ROFF);}else{const G=1/RON;g(e.b,e.e,G);cur(e.b,e.e,-0.7*G);
     if(e.st==='act'){gm(e.c,e.e,e.b,e.e,e.beta*G);cur(e.c,e.e,-e.beta*0.7*G);g(e.c,e.e,1/ROFF);}else{g(e.c,e.e,G);cur(e.c,e.e,-0.2*G);}}}
   else if(e.k==='M')g(e.d,e.s,1/e.r);
  }
  x=gauss(A,z);if(!x)return{error:'The circuit could not be solved (check for shorted sources or loops of voltage sources).'};
  V=x;let changed=false;
  for(const e of E){
   if(e.k==='D'){const vd=Vn(e.a)-Vn(e.b);let ns=e.st;
    if(e.st==='off'){if(vd>e.vf+1e-6)ns='on';else if(e.vz!=null&&-vd>e.vz+1e-6)ns='rev';}
    else if(e.st==='on'){if((vd-e.vf)/RON<-1e-9)ns='off';}
    else if(e.st==='rev'){if((-vd-e.vz)/RON<-1e-9)ns='off';}
    if(ns!==e.st){e.st=ns;changed=true;}}
   else if(e.k==='OA'){const vo=Vn(e.out),drive=1e5*(Vn(e.pp)-Vn(e.nn));let ns=e.st;
    if(e.st==='lin'){if(vo>e.vp+1e-6)ns='hi';else if(vo<e.vn-1e-6)ns='lo';}
    else if(e.st==='hi'){if(drive<e.vp)ns='lin';}else if(e.st==='lo'){if(drive>e.vn)ns='lin';}
    if(ns!==e.st){e.st=ns;changed=true;}}
   else if(e.k==='Q'){const vbe=Vn(e.b)-Vn(e.e),vce=Vn(e.c)-Vn(e.e),ib=(vbe-0.7)/RON;let ns=e.st;
    if(e.st==='off'){if(vbe>0.7+1e-6)ns='act';else if(vce>60+1e-6)ns='bd';}
    else if(e.st==='bd'){if((vce-60)/RON<-1e-9)ns=vbe>0.7?'act':'off';}
    else if(ib<-1e-12)ns='off';
    else if(e.st==='act'){if(vce<0.2-1e-6)ns='sat';}
    else if(e.st==='sat'){const ic=(vce-0.2)/RON;if(ic>e.beta*ib*1.0001)ns='act';}
    if(ns!==e.st){e.st=ns;changed=true;}}
   else if(e.k==='M'){const vgs=Vn(e.g)-Vn(e.s);let r;if(vgs<e.vth)r=ROFF;else if(vgs>=e.vfull)r=e.ron;else r=Math.exp(Math.log(200)+(Math.log(e.ron)-Math.log(200))*(vgs-e.vth)/(e.vfull-e.vth));
    if(Math.abs(Math.log(r/e.r))>0.01){e.r=r;changed=true;}}
  }
  if(!changed){
   const volt=new Map();for(const [r,i] of idx)volt.set(r,V[i]);volt.set(ex.G0,0);
   const I={};for(const e of E){let i=0;
    if(e.k==='R')i=(Vn(e.a)-Vn(e.b))/e.r;else if(e.k==='Rc')i=e.G*(Vn(e.a)-Vn(e.b))+e.ieq;else if(e.k==='V')i=-x[e.j];else if(e.k==='I')i=e.i;
    else if(e.k==='D'){const vd=Vn(e.a)-Vn(e.b);i=e.st==='on'?(vd-e.vf)/RON:e.st==='rev'?-(-vd-e.vz)/RON:vd/ROFF;}
    else if(e.k==='Q'){const ib=e.st==='off'||e.st==='bd'?0:(Vn(e.b)-Vn(e.e)-0.7)/RON;i={ib,ic:e.st==='act'?e.beta*ib:e.st==='sat'?(Vn(e.c)-Vn(e.e)-0.2)/RON:e.st==='bd'?(Vn(e.c)-Vn(e.e)-60)/RON:0,st:e.st};}
    else if(e.k==='M')i={id:(Vn(e.d)-Vn(e.s))/e.r,st:e.r>=ROFF?'off':e.r<=e.ron*1.01?'on':'partly on'};
    else if(e.k==='OA')i={st:e.st};
    I[e.ref]=i;}
   return{volt,I,netV:p=>volt.get(ex.root(p))??0};}
 }
 return{error:'The solver did not settle on a consistent state.'};
}
function gauss(A,b){const n=b.length;const M=A.map((r,i)=>{const a=Array.from(r);a.push(b[i]);return a;});
 for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;if(Math.abs(M[p][c])<1e-14)return null;[M[c],M[p]]=[M[p],M[c]];
  for(let r=c+1;r<n;r++){const f=M[r][c]/M[c][c];if(f)for(let k=c;k<=n;k++)M[r][k]-=f*M[c][k];}}
 const x=new Array(n).fill(0);for(let r=n-1;r>=0;r--){let s=M[r][n];for(let k=r+1;k<n;k++)s-=M[r][k]*x[k];x[r]=s/M[r][r];}return x;}
/* Plain-text netlist for Claude */
function describe(N){
 const ex=extract(N),nm=ex.nameOf,L=[];
 N.comps.forEach(c=>{const nmc=c.name||'';const v=c.val&&c.val.trim()?c.val:'';
  if(c.type==='src')L.push(`DC source ${v}: + terminal at ${nm(c.b)}, − terminal at ${nm(c.a)}`);
  else if(c.type==='res')L.push(`Resistor ${nmc}${v?` (${v})`:''} between ${nm(c.a)} and ${nm(c.b)}`);
  else if(c.type==='cap')L.push(`Capacitor ${nmc} (${v}) between ${nm(c.a)} and ${nm(c.b)}`);
  else if(c.type==='coil')L.push(`Inductor/relay coil ${nmc} between ${nm(c.a)} and ${nm(c.b)}`);
  else if(c.type==='sw')L.push(`Switch ${nmc} (open, closes at t = 0) between ${nm(c.a)} and ${nm(c.b)}`);
  else if(c.type==='isrc')L.push(`DC current source ${v}: current flows out of its arrow end at ${nm(c.b)} and returns at ${nm(c.a)}`);
  else if(c.type==='photo')L.push(`Photodiode ${nmc}: anode at ${nm(c.a)}, cathode at ${nm(c.b)}`);
  else L.push(`${c.type==='led'?'LED':c.type==='zener'?'Zener diode':'Diode'} ${nmc}${c.type==='zener'&&v?` (${v})`:''}: anode at ${nm(c.a)}, cathode at ${nm(c.b)}`);});
 N.rails.forEach(r=>L.push(`Supply rail ${r.label} at net ${nm(r.p)}`));
 N.terms.forEach(t=>L.push(`Terminal "${t.label}" at net ${nm(t.p)}`));
 N.ops.forEach(o=>L.push(`Op-amp: non-inverting (+) input at ${nm(o.plusTop?o.top:o.bot)}, inverting (−) input at ${nm(o.plusTop?o.bot:o.top)}, output at ${nm(o.out)} (supply ${o.vn} V to ${o.vp} V)`));
 N.bjts.forEach(q=>L.push(`NPN transistor ${q.name}: base ${nm(q.b)}, collector ${nm(q.c)}, emitter ${nm(q.e)}`));
 N.fets.forEach(q=>L.push(`N-channel MOSFET ${q.name}: gate ${nm(q.g)}, drain ${nm(q.d)}, source ${nm(q.s)}`));
 N.probes.forEach(p=>L.push(`Measurement point ${p.tag} on net ${nm(p.p)}${p.reading&&p.reading!=='?'?`: reads ${p.reading}`:' (the unknown asked about)'}`));
 return L.map(l=>'- '+l).join('\n')+'\n(Net 0 is ground.)';
}
