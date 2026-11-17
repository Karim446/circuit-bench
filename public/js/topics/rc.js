"use strict";
/* ================= RC ================= */
const CAPS=[10e-9,22e-9,47e-9,100e-9,220e-9,470e-9,1e-6,2.2e-6,4.7e-6,10e-6];
function rcSch(V,R,C){const s=new Sch(520,290);s.two('src',[80,240],[80,70],'',`${V} V`,{left:true});s.wire([80,70],[110,70]);s.two('sw',[110,70],[170,70],'S1 (t = 0)','');s.wire([170,70],[190,70]);s.two('res',[190,70],[300,70],'R',ohm(R));s.wire([300,70],[380,70]);s.two('cap',[380,70],[380,240],'C',capv(C));s.wire([380,240],[80,240]);s.gnd(230,240);s.text(420,62,'Vc','sn');return s;}
def('rc','calc',()=>{
 const R=res(1000,100000),C=pick(CAPS),tau=R*C,s=rcSch(5,R,C);const u=tau<1e-3?['µs',1e6]:tau<1?['ms',1e3]:['s',1];
 return{title:'Time constant',prompt:`<p>What is the RC time constant τ?</p>`,svg:s.svg(),answer:num(tau*u[1],u[0]),
 hints:['τ = R × C, in seconds when R is in ohms and C in farads.',`R = ${R} Ω, C = ${C.toExponential(1)} F.`,'Shortcut: kΩ × µF = ms.'],
 solution:`<p>τ = ${ohm(R)} × ${capv(C)} = <b>${eng(tau,'s')}</b></p>`,takeaway:'1τ ≈ 63%, 3τ ≈ 95%, 5τ ≈ 99%. Know these without a calculator.'};});
def('rc','calc',()=>{
 const V=pick([5,9,12]),R=res(1000,47000),C=pick(CAPS.slice(3)),tau=R*C,k=pick([0.5,1,2,3]),t=k*tau,Vc=V*(1-Math.exp(-k)),s=rcSch(V,R,C);
 return{title:'Capacitor charging',prompt:`<p>C starts discharged. S1 closes at t = 0. What is Vc at t = ${eng(t,'s')}?</p>`,svg:s.svg(),answer:num(Vc,'V'),
 hints:['Find τ = RC first.',`τ = ${eng(tau,'s')}, so t = ${k}τ.`,'Vc = Vs · (1 − e^(−t/τ)).'],
 solution:`<p>τ = ${eng(tau,'s')}; t/τ = ${k}<br>Vc = ${V} × (1 − e^(−${k})) = <b>${f2(Vc)} V</b></p>`,takeaway:'Express time in units of τ first; then the exponent is a small number you can reason about.'};});
def('rc','calc',()=>{
 const V=5,R=res(1000,47000),C=pick(CAPS.slice(3)),tau=R*C,x=pick([0.5,0.632,0.9,0.95,0.99]),t=-tau*Math.log(1-x),s=rcSch(V,R,C);const u=t<1e-3?['µs',1e6]:t<1?['ms',1e3]:['s',1];
 return{title:'Time to charge',prompt:`<p>How long after S1 closes until C reaches ${f2(x*100,1)}% of the supply?</p>`,svg:s.svg(),answer:num(t*u[1],u[0]),
 hints:['Solve x = 1 − e^(−t/τ) for t.','t = −τ · ln(1 − x).',`τ = ${eng(tau,'s')}.`],
 solution:`<p>t = −${eng(tau,'s')} × ln(1 − ${x}) = <b>${eng(t,'s')}</b> (${f2(t/tau,2)}τ)</p>`,takeaway:'50% takes 0.69τ, 90% takes 2.3τ. The 2.2RC rise-time rule comes straight from this.'};});
def('rc','calc',()=>{
 const R=res(100,47000),C=pick(CAPS),fc=1/(2*Math.PI*R*C),s=new Sch(520,260);s.term(90,110,'Vin','left',{v:1});s.wire([90,110],[110,110]);s.two('res',[110,110],[230,110],'R',ohm(R));s.wire([230,110],[400,110]);s.dot(310,110);s.two('cap',[310,110],[310,210],'C',capv(C));s.gnd(310,210);s.term(400,110,'Vout','right');
 const u=fc>=1000?['kHz',1e-3]:['Hz',1];
 return{title:'RC low-pass filter',prompt:`<p>What is the −3 dB cutoff frequency?</p>`,svg:s.svg(),answer:num(fc*u[1],u[0]),
 hints:['fc = 1 / (2π·R·C).',`RC = ${eng(R*C,'s')}.`],
 solution:`<p>fc = 1/(2π × ${ohm(R)} × ${capv(C)}) = <b>${eng(fc,'Hz')}</b></p><p>Above fc the output falls 20 dB per decade. At fc, Vout ≈ 0.707·Vin.</p>`,takeaway:'Every pull-up plus line capacitance is accidentally one of these filters.'};});
def('rc','calc',()=>{
 const V=pick([9,12]),R1=res(1000,10000),R2=res(1000,10000),C=pick(CAPS),s=new Sch(520,290),v=Math.random()<.7;
 s.two('src',[80,240],[80,70],'',`${V} V`,{left:true});s.wire([80,70],[110,70]);s.two('res',[110,70],[230,70],'R1',ohm(R1));s.wire([230,70],[400,70]);s.two('res',[300,70],[300,240],'R2',ohm(R2));s.two('cap',[400,70],[400,240],'C',capv(C));s.wire([400,240],[80,240]);s.gnd(190,240);s.dot(300,70);s.dot(300,240);
 const Vc=V*R2/(R1+R2);
 return{title:'DC steady state',prompt:`<p>The circuit has been powered for a long time. ${v?'What is the voltage across C?':'What current flows through C?'}</p>`,svg:s.svg(),answer:v?num(Vc,'V'):num(0,'mA',{abs:0.01}),
 hints:['After a long time at DC, the capacitor is fully charged and no current flows into it.','Treat it as an open circuit and redraw.','What is left is a plain divider.'],
 solution:`<p>C acts as an open circuit, so I(C) = 0 and Vc = ${V} × ${ohm(R2)}/(${ohm(R1)}+${ohm(R2)}) = ${f2(Vc)} V.</p><p>Answer: <b>${v?f2(Vc)+' V':'0 mA'}</b></p>`,takeaway:'Capacitors block DC. In steady state, delete them; at the instant of a step, treat an uncharged cap as a short.'};});
def('rc','concept',()=>{
 const v=Math.random()<.5;const Q=v?['Why do decoupling capacitors (typically 100 nF) sit right at each IC’s power pins?','They supply fast current spikes locally, so trace inductance back to the regulator doesn’t make the supply dip',['They filter 60 Hz hum out of the supply','They raise the supply slightly when the chip is busy','They protect the IC from reverse polarity']]:['A board’s 3.3 V rail reads 0.2 V, the bench supply is in current limit, and one ceramic capacitor on the rail is warm. Most likely cause?','A decoupling capacitor has failed short, pulling the rail to ground',['The regulator’s output capacitor is open','The regulator needs a higher input voltage','The bench supply’s voltage setting is too low']];
 return{title:v?'Decoupling capacitors':'Rail pulled down',prompt:`<p>${Q[0]}</p>`,svg:null,answer:mc(Q[1],Q[2]),
 hints:v?['Digital chips draw current in very short bursts when they switch.','Long traces are inductors: V = L·di/dt. Fast current changes cause voltage dips.']:['A rail near 0 V with the supply limiting current means something is drawing a lot of current to ground.','The warm part is where the power is being dissipated.'],
 solution:`<p><b>${Q[1]}.</b></p>${v?'':'<p>To find which one: feel or use a thermal camera, or inject a low current-limited voltage and look for the hot spot. You can also cut the rail into sections and see where the short goes away.</p>'}`,takeaway:'A shorted cap is one of the most common board faults: rail low, supply current-limiting, one hot part.'};});
