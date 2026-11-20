"use strict";
/* ---------- helpers ---------- */
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const E12=[1,1.2,1.5,1.8,2.2,2.7,3.3,3.9,4.7,5.6,6.8,8.2];
function res(lo,hi){const o=[];for(let e=0;e<=6;e++)for(const m of E12){const v=+(m*10**e).toPrecision(3);if(v>=lo&&v<=hi)o.push(v);}return o.length?pick(o):nearE12((lo+hi)/2);}
const sig=(x,n=3)=>+(+x).toPrecision(n);
// Answers as shown to the user: whole numbers in full (ADC codes, register values), otherwise 3 significant figures.
const showVal=(v,a)=>{if(Number.isInteger(v))return v;if(a&&a.abs>0&&!a.tol)return +v.toFixed(Math.max(0,Math.ceil(-Math.log10(a.abs))));return sig(v,3);};
function eng(v,unit,n=3){if(!isFinite(v)||Math.abs(v)<1e-15)return `0 ${unit}`;const P={'-12':'p','-9':'n','-6':'µ','-3':'m','0':'','3':'k','6':'M','9':'G'};let e=Math.floor(Math.log10(Math.abs(v))/3)*3;e=Math.max(-12,Math.min(9,e));let m=sig(v/10**e,n);if(Math.abs(m)>=1000&&e<9){e+=3;m=sig(v/10**e,n);}return `${m} ${P[e]}${unit}`;}
const ohm=v=>eng(v,'Ω');
const f2=(v,d=2)=>String(+v.toFixed(d));
const capv=v=>eng(v,'F');
const num=(value,unit,o={})=>({type:'num',value,unit,tol:o.tol??0.03,abs:o.abs??0});
function mc(correct,wrongs){const opts=shuffle([correct,...wrongs]);return{type:'mc',options:opts,correct:opts.indexOf(correct)};}
const hl=s=>`<span class="hl">${s}</span>`;

/* ---------- schematic drawing ---------- */
const BODIES={
 res:'<path class="sw" d="M-20 0 L-17.5 -7 L-12.5 7 L-7.5 -7 L-2.5 7 L2.5 -7 L7.5 7 L12.5 -7 L17.5 7 L20 0"/>',
 cap:'<path class="sw" d="M-20 0 H-4 M20 0 H4"/><path class="sw thick" d="M-4 -12 V12 M4 -12 V12"/>',
 diode:'<path class="sw" d="M-20 0 H-8 M8 0 H20 M8 -10 V10"/><path class="sf" d="M-8 -10 L8 0 L-8 10 Z"/>',
 zener:'<path class="sw" d="M-20 0 H-8 M8 0 H20 M4 -13 L8 -10 V10 L12 13"/><path class="sf" d="M-8 -10 L8 0 L-8 10 Z"/>',
 led:'<path class="sw" d="M-20 0 H-8 M8 0 H20 M8 -10 V10 M-1 -12 L5 -20 M6 -10 L12 -18"/><path class="sf" d="M-8 -10 L8 0 L-8 10 Z M5.5 -21 L0.5 -19.2 L3.6 -16.6 Z M12.5 -19 L7.5 -17.2 L10.6 -14.6 Z"/>',
 photo:'<path class="sw" d="M-20 0 H-8 M8 0 H20 M8 -10 V10 M-9 -25 L-3 -16 M-2 -27 L4 -18"/><path class="sf" d="M-8 -10 L8 0 L-8 10 Z M-2.6 -14.6 L-3.7 -19.8 L-6.6 -17.6 Z M4.4 -16.6 L3.3 -21.8 L0.4 -19.6 Z"/>',
 coil:'<path class="sw" d="M-20 0 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0"/>',
 sw:'<path class="sw" d="M-20 0 H-12 M12 0 H20 M-8 -2 L10 -13"/><circle class="st" cx="-10" cy="0" r="2.6"/><circle class="st" cx="10" cy="0" r="2.6"/>',
 src:'<circle class="sw" cx="0" cy="0" r="17"/>',
 isrc:'<circle class="sw" cx="0" cy="0" r="17"/><path class="sw" d="M-9 0 H5"/><path class="sf" d="M10 0 L2 -5.5 L2 5.5 Z"/>',
};

/* ---------- subscripts (V_in, V_out, …) ---------- */
const SUBTOK=(svg)=>new RegExp(`\\b(?:(V)(in|out|th|ref|cc|DD|CE|BE|GS|DS|IH|IL|OH|OL|rms|pk|pp|avg|z|f|s|c|d)|(R)(in|IN|out|th|L|B|F|G|S|PU|PD|DS${svg?'|C':''})|(I)(in|out|c|b|e|E|L|z|ph|d|sink)|(f)(c)|(X)(c|C|L)|([VRI])_([A-Za-z]+))(\\((?:th|on|sat|max|min)\\))?(?![A-Za-z0-9]|-\\d)`,'g');
const SUB_H=SUBTOK(false),SUB_S=SUBTOK(true);
function subParts(m){const a=[...m];for(let i=1;i<=11;i+=2)if(a[i])return[a[i],a[i+1]+(a[13]||'')];return[m[0],''];}
function svgSub(t){t=String(t);let out='',last=0,open=0;SUB_S.lastIndex=0;let m;
 while((m=SUB_S.exec(t))){const[b,sb]=subParts(m);out+=t.slice(last,m.index)+`${b}<tspan dy="3.5" style="font-size:72%">${sb}</tspan><tspan dy="-3.5">`;open++;last=m.index+m[0].length;}
 return out+t.slice(last)+'</tspan>'.repeat(open);}
function subify(root){if(!root||typeof document==='undefined')return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||p.closest('svg,script,style,pre,code,textarea,sub'))return NodeFilter.FILTER_REJECT;SUB_H.lastIndex=0;return SUB_H.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
 const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
 nodes.forEach(n=>{const t=n.nodeValue,f=document.createDocumentFragment();let last=0,m;SUB_H.lastIndex=0;
  while((m=SUB_H.exec(t))){const[b,sb]=subParts(m);f.append(t.slice(last,m.index)+b);const e=document.createElement('sub');e.textContent=sb;f.append(e);last=m.index+m[0].length;}
  f.append(t.slice(last));n.replaceWith(f);});}
let LAST_SCH=null;
class Sch{
 constructor(w=520,h=310){this.w=w;this.h=h;this.o=[];this.N={wires:[],comps:[],rails:[],terms:[],gnds:[],dots:[],probes:[],ops:[],bjts:[],fets:[],unsupported:false};}
 add(s){this.o.push(s);return this;}
 wire(...p){this.N.wires.push(p.map(q=>[q[0],q[1]]));return this.add(`<polyline class="sw" points="${p.map(q=>q.join(',')).join(' ')}"/>`);}
 dot(x,y){this.N.dots.push([x,y]);return this.add(`<circle class="sd" cx="${x}" cy="${y}" r="3.3"/>`);}
 text(x,y,t,c='sv',a='middle'){return this.add(`<text class="${c}" x="${x}" y="${y}" text-anchor="${a}">${svgSub(t)}</text>`);}
 gnd(x,y){this.N.gnds.push([x,y]);return this.add(`<path class="sw" d="M${x} ${y} v10 M${x-12} ${y+10} h24 M${x-7} ${y+15} h14 M${x-3} ${y+20} h6"/>`);}
 rail(x,y,label,o={}){this.N.rails.push({p:[x,y],label,v:o.v});this.add(`<path class="sw" d="M${x} ${y} v-10 M${x-10} ${y-10} h20"/>`);return this.text(x,y-16,label,'sn');}
 term(x,y,label,side='left',o={}){this.N.terms.push({p:[x,y],label,v:o.v});this.add(`<circle class="st" cx="${x}" cy="${y}" r="4"/>`);if(side==='left')return this.text(x-10,y+5,label,'sn','end');if(side==='right')return this.text(x+10,y+5,label,'sn','start');return this.text(x,y-11,label,'sn');}
 probe(x,y,tag,reading,dx=26,dy=-26){this.N.probes.push({p:[x,y],tag,reading});const tx=x+dx,ty=y+dy;this.add('<g class="probe">');this.add(`<line class="pl" x1="${x}" y1="${y}" x2="${tx}" y2="${ty}"/><circle class="pd" cx="${x}" cy="${y}" r="4.5"/>`);const label=reading!=null?`${tag} = ${reading}`:tag;const w=label.length*7.3+16;const bx=dx===0?tx-w/2:(dx>0?tx:tx-w);this.add(`<rect class="pb" x="${bx}" y="${ty-11}" width="${w}" height="21" rx="4"/>`);this.text(bx+w/2,ty+4.5,label,'pt');return this.add('</g>');}
 two(type,a,b,name='',val='',opt={}){
  this.N.comps.push({type,a:[a[0],a[1]],b:[b[0],b[1]],name,val,opt});
  const[x1,y1]=a,[x2,y2]=b,dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;
  const half=type==='src'||type==='isrc'?17:20,cx=(x1+x2)/2,cy=(y1+y2)/2,ang=Math.atan2(dy,dx)*180/Math.PI;
  this.add(`<line class="sw" x1="${x1}" y1="${y1}" x2="${cx-ux*half}" y2="${cy-uy*half}"/><line class="sw" x1="${cx+ux*half}" y1="${cy+uy*half}" x2="${x2}" y2="${y2}"/>`);
  this.add(`<g transform="translate(${cx} ${cy}) rotate(${ang})">${BODIES[type]}</g>`);
  if(type==='src'){this.text(cx+ux*8,cy+uy*8+5,'+','spm');this.text(cx-ux*8,cy-uy*8+5,'−','spm');}
  const horiz=Math.abs(dy)<Math.abs(dx);
  if(horiz){if(name)this.text(cx,cy-17,name,'sn');if(val)this.text(cx,cy+28,val,'sv');}
  else{const s=opt.left?-1:1,an=opt.left?'end':'start',ox=cx+s*(type==='src'||type==='isrc'?25:(type==='led'||type==='photo'||type==='zener'?24:17));if(name)this.text(ox,cy-3,name,'sn',an);if(val)this.text(ox,cy+14,val,'sv',an);}
  return this;}
 opamp(x,y,plusTop=false,o={}){
  this.N.ops.push({x,y,top:[x-32,y-16],bot:[x-32,y+16],out:[x+36,y],plusTop,vp:o.vp??12,vn:o.vn??-12});
  this.add(`<path class="sw" d="M${x-32} ${y-36} L${x-32} ${y+36} L${x+36} ${y} Z"/>`);
  this.text(x-23,y-11,plusTop?'+':'−','spm');this.text(x-23,y+21,plusTop?'−':'+','spm');
  return{top:[x-32,y-16],bot:[x-32,y+16],out:[x+36,y]};}
 npn(x,y,name='Q1',o={}){
  this.N.bjts.push({x,y,b:[x-26,y],c:[x+10,y-36],e:[x+10,y+36],name,beta:o.beta??100});
  const tip=[x+7,y+17.7],d=[18/22.8,14/22.8],n=[-d[1],d[0]];
  const p1=[tip[0]-7*d[0]+4*n[0],tip[1]-7*d[1]+4*n[1]],p2=[tip[0]-7*d[0]-4*n[0],tip[1]-7*d[1]-4*n[1]];
  this.add(`<path class="sw" d="M${x-26} ${y} H${x-8} M${x-8} ${y-6} L${x+10} ${y-20} V${y-36} M${x-8} ${y+6} L${x+10} ${y+20} V${y+36}"/><path class="sw thick" d="M${x-8} ${y-15} V${y+15}"/><path class="sf" d="M${tip[0]} ${tip[1]} L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} Z"/>`);
  this.text(x+18,y+5,name,'sn','start');
  return{b:[x-26,y],c:[x+10,y-36],e:[x+10,y+36]};}
 nmos(x,y,name='Q1',o={}){
  this.N.fets.push({x,y,g:[x-28,y],d:[x+10,y-36],s:[x+10,y+36],name:name||'Q1',vth:o.vth??1.5,vfull:o.vfull??2.5,ron:o.ron??0.05});
  this.add(`<path class="sw" d="M${x-28} ${y} H${x-12} M${x-12} ${y-16} V${y+16} M${x-6} ${y-13} H${x+10} V${y-36} M${x-6} ${y+13} H${x+10} V${y+36} M${x-6} ${y} H${x+10} V${y+13}"/><path class="sw thick" d="M${x-6} ${y-19} V${y-8} M${x-6} ${y-5} V${y+5} M${x-6} ${y+8} V${y+19}"/><path class="sf" d="M${x-5} ${y} L${x+3} ${y-4} L${x+3} ${y+4} Z"/>`);
  this.text(x+18,y+5,name,'sn','start');
  return{g:[x-28,y],d:[x+10,y-36],s:[x+10,y+36]};}
 box(x,y,w,h,label,sub=''){this.N.unsupported=true;this.add(`<rect class="bx" x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/>`);this.text(x+w/2,y+h/2+(sub?-3:5),label,'sn');if(sub)this.text(x+w/2,y+h/2+15,sub,'sv');return this;}
 svg(desc='Circuit schematic'){LAST_SCH=this;return `<svg viewBox="0 0 ${this.w} ${this.h}" role="img" aria-label="${desc}">${this.o.join('')}</svg>`;}
}
function nearE12(x){let best=1,bd=1e99;for(let e=-1;e<=7;e++)for(const m of E12){const v=+(m*10**e).toPrecision(3);const d=Math.abs(Math.log(v/x));if(d<bd){bd=d;best=v;}}return best;}
function e12Up(x){for(let e=-1;e<=7;e++)for(const m of E12){const v=+(m*10**e).toPrecision(3);if(v>=x*0.999)return v;}return x;}
function e12Down(x){let b=null;for(let e=-1;e<=7;e++)for(const m of E12){const v=+(m*10**e).toPrecision(3);if(v<=x*1.001)b=v;}return b??x;}
/* ---------- topics ---------- */
const TOPICS=[
 {id:'dc',name:'DC fundamentals'},
 {id:'diode',name:'Diodes & LEDs'},
 {id:'xstr',name:'Transistor switches'},
 {id:'opamp',name:'Op-amps'},
 {id:'rc',name:'RC circuits & filters'},
 {id:'ac',name:'Signals, AC & dB'},
 {id:'digital',name:'Digital interfacing'},
 {id:'power',name:'Power'},
 {id:'meas',name:'Measurement technique'},
 {id:'portfolio',name:'Your portfolio circuits'}];
const FORMULAS={
 dc:['V = I·R','P = V·I = I²R = V²/R; keep P under ~50% of the rating','Series: R = R1 + R2;  parallel: R1R2/(R1+R2)','Divider: Vout = Vin·R2/(R1+R2)','Loaded divider: replace R2 with R2‖RL','Thevenin of a divider: Vth = open-circuit Vout, Rth = R1‖R2','KCL: currents into a node sum to zero. KVL: voltages around a loop sum to zero','Current divider: I1 = Itotal·R2/(R1 + R2)'],
 diode:['Silicon ≈ 0.7 V; red LED ≈ 2.0 V; green ≈ 2.2 V; blue/white ≈ 3.0–3.1 V','LED resistor: R = (Vs − Vf) / I, round up to a standard value','Reverse biased → no current (LED reverse rating is only ~5 V)','Zener regulator: Is = (Vs − Vz)/Rs, Iz = Is − IL; check it regulates: Vs·RL/(Rs+RL) > Vz','Flyback diode: across the coil, cathode to +V'],
 xstr:['Active region: Ic = β·Ib','KCL at the transistor: Ie = Ic + Ib = (β + 1)·Ib','BJT on: VBE ≈ 0.7 V, VCE(sat) ≈ 0.2 V','Saturated when β·Ib ≥ Ic(sat) = (Vcc − 0.2)/Rc','Base resistor: Rb = (Vin − 0.7) / (k·Ic/β), with k ≈ 5–10','MOSFET: need VGS well above VGS(th); RDS(on) is only guaranteed at the VGS in the datasheet','Low-side N-channel: source at ground, so VGS = gate drive voltage','Gate pull-down (10–100 kΩ) keeps the FET off while the pin floats'],
 opamp:['Golden rules: no input current; with negative feedback, V+ = V−','Inverting: Vout = −(Rf/Rin)·Vin','Non-inverting: Vout = (1 + Rf/Rg)·Vin','Follower: Vout = Vin (buffer: high input Z, low output Z)','Comparator (open loop): output goes to a rail','TIA: Vout = I·Rf','Output can never exceed the rails'],
 rc:['τ = R·C','Charging: Vc = Vs(1 − e^(−t/τ)); 63% at 1τ, ~99% at 5τ','Time to fraction x: t = −τ·ln(1 − x)','RC low-pass cutoff: fc = 1/(2πRC)','DC steady state: capacitor = open circuit'],
 ac:['Sine: Vrms = Vpk/√2; Vpp = 2·Vpk','PWM 0–V: average D·V, RMS V·√D','f = 1/T; P = Vrms²/R','Power dB = 10·log₁₀(P2/P1); voltage dB = 20·log₁₀(V2/V1)','dBm = 10·log₁₀(P / 1 mW); 0 dBm = 1 mW','Link budget: Rx = Tx − losses; margin = Rx − sensitivity','Xc = 1/(2πfC); XL = 2πfL'],
 digital:['10–90% rise time ≈ 2.2·R·C','Largest pull-up for a rise time: R = tr / (2.2·C)','Smallest pull-up: R = Vcc / I_sink(max)','Open-drain needs a pull-up to ever go high','CMOS V_IH ≈ 0.7·VDD; TTL V_IH = 2.0 V'],
 power:['Linear regulator heat: P = (Vin − Vout)·I','Linear efficiency ≈ Vout / Vin','Minimum Vin = Vout + dropout','Buck (ideal): Vout = D·Vin','Buck input current: Iin = Vout·Iout / (η·Vin)','Bench supply in CC mode = current limit, voltage sags'],
 meas:['Voltage: in parallel. Current: in series (break the circuit)','Resistance and continuity: power off, ideally one leg lifted','Diode test shows Vf','Scope ground clip goes to circuit ground only','10× probe ↔ 10× channel setting','AC coupling to see small ripple; trigger to stabilize'],
 portfolio:['Threshold: Vs(trip) = Vz·(R1 + R2)/R2','TIA: Vout = I·Rf','Rise time ≈ 2.2·R·C; keep it a small fraction of the pulse high time','Pull-up range: Vcc/I_sink ≤ R ≤ tr(max)/(2.2·C)']};

const G=[];
// "A 8-bit ADC" → "An 8-bit ADC" when a generated number starts with a vowel sound.
const aAn=t=>typeof t==='string'?t.replace(/\b([Aa]) (?=8|1[18](?!\d))/g,'$1n '):t;
function def(topic,kind,fn){G.push({topic,kind,fn:()=>{const q=fn();if(q){q.prompt=aAn(q.prompt);q.solution=aAn(q.solution);}return q;}});}
const LEDS=[{c:'red',vf:2.0},{c:'green',vf:2.2},{c:'yellow',vf:2.1},{c:'blue',vf:3.0},{c:'white',vf:3.1}];

/* ---------- shared schematics ---------- */
function divSch(V,R1,R2,o={}){
 const s=new Sch(520,300);
 s.two('src',[90,240],[90,70],'',`${V} V`,{left:true});
 s.wire([90,70],[260,70]);
 s.two('res',[260,70],[260,155],'R1',ohm(R1));
 s.two('res',[260,155],[260,240],'R2',o.hideR2?'?':ohm(R2));
 s.wire([90,240],[260,240]);s.gnd(175,240);
 if(o.RL){s.wire([260,155],[390,155]);s.two('res',[390,155],[390,240],'RL',ohm(o.RL));s.wire([260,240],[390,240]);s.dot(260,155);s.dot(260,240);}
 else{s.wire([260,155],[340,155]);s.term(340,155,'Vout','right');s.dot(260,155);}
 return s;}
function ledSch(V,rlab,o={}){
 const s=new Sch(520,290),t=o.diode?'diode':'led',n=o.diode?'D1':'LED1';
 s.two('src',[80,240],[80,70],'',`${V} V`,{left:true});s.wire([80,70],[140,70]);s.two('res',[140,70],[260,70],'R1',rlab,{sv:o.sv});s.wire([260,70],[350,70]);
 if(o.reversed)s.two(t,[350,240],[350,70],n,'',{vf:o.vf});else s.two(t,[350,70],[350,240],n,'',{vf:o.vf});
 s.wire([350,240],[80,240]);s.gnd(215,240);return s;}
function bjtSch(vinLab,rbLab,load){
 const s=new Sch(520,320);s.rail(330,40,'+12 V');
 const q=s.npn(320,250,'Q1',{beta:load.beta??100});
 if(load.led){s.two('res',[330,40],[330,125],'RC',load.lab);s.two('led',[330,125],q.c,'LED1');}
 else s.two('res',[330,40],q.c,'RC',load.lab);
 s.gnd(q.e[0],q.e[1]);s.term(100,250,vinLab,'left');s.wire([100,250],[130,250]);s.two('res',[130,250],[250,250],'RB',rbLab,{sv:load.rbv});s.wire([250,250],q.b);
 return{s,q};}
function nmosSch(o){
 const s=new Sch(520,340);s.rail(330,40,`+${o.V||12} V`);const q=s.nmos(320,250,'Q1',o.fet||{});
 if(o.led){s.two('res',[330,40],[330,120],'R1',o.lab||'');s.two('led',[330,120],q.d,'LED1');}
 else s.two('res',[330,40],q.d,'Load',o.lab||'',{sv:o.lsv});
 s.gnd(q.s[0],q.s[1]);s.term(80,250,'GPIO','left',{v:o.vg??3.3});s.wire([80,250],[110,250]);s.two('res',[110,250],[200,250],'RG','100 Ω');s.wire([200,250],q.g);
 if(o.pd){s.dot(250,250);s.two('res',[250,250],[250,310],'RPD','100 kΩ',{left:true});s.gnd(250,310);}
 return{s,q};}
function flySch(withD){
 const s=new Sch(520,330);s.rail(330,40,'+12 V');s.wire([330,40],[330,70]);s.two('coil',[330,70],[330,190],'K1','relay coil',{left:true});
 if(withD){s.wire([330,70],[410,70]);s.two('diode',[410,190],[410,70],'D1','');s.wire([410,190],[330,190]);s.dot(330,70);s.dot(330,190);}
 const q=s.npn(320,250);s.wire([330,190],q.c);s.gnd(q.e[0],q.e[1]);s.term(100,250,'Vin','left',{v:5});s.wire([100,250],[130,250]);s.two('res',[130,250],[250,250],'RB','',{sv:1000});s.wire([250,250],q.b);return s;}
function invSch(Rin,Rf,o={}){
 const s=new Sch(520,280),p=s.opamp(330,170,false);
 if(o.tia){s.two('photo',[190,250],[190,154],'PD1','',{left:true,iph:o.iph});s.gnd(190,250);s.wire([190,154],[250,154]);s.dot(190,154);}
 else{s.term(90,154,'Vin','left',{v:o.vin});s.wire([90,154],[100,154]);s.two('res',[100,154],[210,154],'RIN',ohm(Rin));s.wire([210,154],[250,154]);}
 s.wire([250,154],p.top);s.dot(250,154);s.wire([250,154],[250,90],[270,90]);s.two('res',[270,90],[390,90],'RF',ohm(Rf));s.wire([390,90],[420,90],[420,170]);
 s.wire(p.out,[455,170]);s.dot(420,170);s.term(455,170,'Vout','right');s.wire(p.bot,[280,186],[280,215]);s.gnd(280,215);return{s,p};}
function noninvSch(Rg,Rf,vin){
 const s=new Sch(520,340),p=s.opamp(330,170,true);
 s.term(90,154,'Vin','left',{v:vin});s.wire([90,154],p.top);s.wire(p.bot,[260,186],[260,250]);s.dot(260,250);
 s.wire([260,250],[280,250]);s.two('res',[280,250],[400,250],'RF',ohm(Rf));s.wire([400,250],[420,250],[420,170]);
 s.two('res',[260,250],[260,315],'RG',ohm(Rg),{left:true});s.gnd(260,315);s.wire(p.out,[455,170]);s.dot(420,170);s.term(455,170,'Vout','right');return{s,p};}
function puSch(rlab,clab,o={}){
 const s=new Sch(520,350);s.rail(300,40,'+3.3 V');s.two('res',[300,40],[300,140],'RPU',rlab,{sv:o.rv});s.wire([300,140],[440,140]);s.term(440,140,'MCU in','right');
 s.dot(300,140);s.dot(380,140);s.two('cap',[380,140],[380,240],'C line',clab);s.gnd(380,240);
 const q=s.nmos(290,276,'');s.wire([300,140],q.d);s.gnd(q.s[0],q.s[1]);s.term(190,276,o.drv||'driver','left',{v:0});s.wire([190,276],q.g);return s;}
function lsiSch(R1,R2,Vz,o={}){
 const s=new Sch(520,340),p=s.opamp(330,170,true,{vp:5,vn:0});
 s.rail(90,60,'Vs',{v:o.vs??9});s.two('res',[90,60],[90,230],'R1',o.hideR1?'?':ohm(R1),{left:true,sv:R1});s.dot(90,230);s.two('res',[90,230],[90,305],'R2',ohm(R2),{left:true});s.gnd(90,305);
 s.wire([90,230],[270,230],[270,186],p.bot);
 s.rail(210,40,'+5 V');s.two('res',[210,40],[210,110],'R3','',{sv:1000});s.dot(210,110);s.two('zener',[210,180],[210,110],'Z1',`${Vz} V`,{left:true});s.gnd(210,180);
 s.wire([210,110],[260,110],[260,154],p.top);
 s.wire(p.out,[376,170]);s.two('res',[376,170],[456,170],'R4','',{sv:330});s.wire([456,170],[480,170]);s.two('led',[480,170],[480,262],'LED',' ',{left:true});s.gnd(480,262);
 return{s,p};}
