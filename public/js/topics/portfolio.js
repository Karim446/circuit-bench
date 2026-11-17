"use strict";
/* ================= Portfolio ================= */
def('portfolio','calc',()=>{
 const Vz=3.3,R2=10000,v=Math.random()<.5;let R1,Vth,ans,q,sol;
 if(v){R1=res(2200,15000);Vth=Vz*(R1+R2)/R2;ans=num(Vth,'V');q='At what supply voltage does the LED turn on?';sol=`<p>The comparator flips when R2’s voltage equals Vz: Vs · R2/(R1+R2) = ${Vz}<br>Vs(trip) = ${Vz} × (${ohm(R1)} + ${ohm(R2)})/${ohm(R2)} = <b>${f2(Vth)} V</b></p>`;}
 else{Vth=pick([6,7,7.5,8,9]);R1=R2*(Vth/Vz-1);ans=num(R1/1e3,'kΩ');q=`You want the LED to come on when the supply drops below ${Vth} V. What should R1 be?`;sol=`<p>Vs(trip) = Vz·(R1 + R2)/R2 → R1 = R2·(Vs/Vz − 1) = 10 kΩ × (${Vth}/${Vz} − 1) = <b>${ohm(R1)}</b>. In your build, the potentiometer let you trim this.</p>`;}
 const{s}=lsiSch(R1,R2,Vz,{hideR1:!v});
 return{title:'Low-supply indicator: trip point',prompt:`<p>This is your low-supply indicator. The comparator output goes high (LED on) when its − input falls below its + input. ${q}</p>`,svg:s.svg(),answer:ans,
 hints:['The zener holds the + input at a fixed reference that doesn’t depend on the supply.','The − input is a scaled copy of the supply: Vs · R2/(R1 + R2).','The LED switches at the supply voltage where those two are equal.'],
 solution:sol,takeaway:'Be ready to say why the Zener is there: the reference must not move when the supply moves, or the comparison is meaningless.'};});
def('portfolio','diagnose',()=>{
 const F=[{t:'Z1 is open, so the reference rises toward 5 V',obs:'LED stays on even with a fresh supply',m:'+ input = 5.0 V'},{t:'R2 is open, so the − input sits at the full supply',obs:'LED never turns on, even with a nearly dead supply',m:'− input = Vs'},{t:'R1 is open, so the − input is pulled to 0 V',obs:'LED stays on even with a fresh supply',m:'− input = 0 V'},{t:'The LED is installed backwards',obs:'LED never lights',m:'comparator output = high (≈5 V) with a low supply'}];
 const act=pick(F),{s}=lsiSch(15000,10000,3.3);
 return{title:'Low-supply indicator: fault',prompt:`<p>Symptom: <b>${act.obs}</b>. You measure: <b>${act.m}</b>. What is wrong?</p>`,svg:s.svg(),answer:mc(act.t,F.filter(f=>f!==act).map(f=>f.t)),
 hints:['Ask what each input should read: + should be ~3.3 V (zener), − should be a fraction of Vs.','An open bottom resistor in a divider leaves the node at the top voltage; an open top resistor leaves it at the bottom.','If the comparator output is already correct, the fault is downstream of it.'],
 solution:`<table><tr><th>Fault</th><th>Reading</th><th>Symptom</th></tr>${F.map(f=>`<tr><td>${f===act?'<b>'+f.t+'</b>':f.t}</td><td>${f.m}</td><td>${f.obs}</td></tr>`).join('')}</table>`,
 takeaway:'Walk through your own circuit stage by stage, saying what each node should read. That is what “walk me through this” really tests.'};});
def('portfolio','calc',()=>{
 const I=pick([2,5,10,20])*1e-6,Vt=pick([1,2,2.5,3]),Rf=Vt/I,{s}=invSch(0,Rf,{tia:true,iph:I});
 return{title:'Receiver TIA: choose RF',prompt:`<p>On the receiver board, the photodiode makes about ${eng(I,'A')} when the IR LED is on. You want ${Vt} V out of the TIA. What feedback resistor do you need?</p>`,svg:s.svg().replace(ohm(Rf),'?'),answer:num(Rf/1e3,'kΩ'),
 hints:['TIA: all the photocurrent flows through RF.','Vout = I·RF, so RF = Vout / I.'],
 solution:`<p>RF = ${Vt} V / ${eng(I,'A')} = <b>${ohm(Rf)}</b></p><p>Large RF gives more gain but less bandwidth and more noise. A small cap across RF keeps it stable.</p>`,takeaway:'If asked “what would you change,” mention the gain–bandwidth trade-off in the TIA. It is a strong, specific answer.'};});
def('portfolio','calc',()=>{
 const R=pick([30000,40000,50000]),C=pick([470e-12,1e-9,2.2e-9]),f=pick([5e3,10e3,20e3,50e3]),tr=2.2*R*C,th=1/(2*f),s=puSch(`${ohm(R)} (internal)`,capv(C),{drv:'pulse out'});
 return{title:'The pulse-loss problem',prompt:`<p>Like your Ouster fix: an open-drain pulse output at ${eng(f,'Hz')} relies on the MCU’s ~${ohm(R)} internal pull-up, and the cable adds about ${capv(C)}. What is the rise time?</p>`,svg:s.svg(),answer:num(tr*1e6,'µs'),
 hints:['Rising edges come only from the pull-up charging the line capacitance.','tr ≈ 2.2·R·C.',`Compare it with the pulse high time: 1/(2f) = ${eng(th,'s')}.`],
 solution:`<p>tr ≈ 2.2 × ${ohm(R)} × ${capv(C)} = <b>${eng(tr,'s')}</b>, which is ${f2(tr/th*100,0)}% of the ${eng(th,'s')} high time.</p><p>${tr>0.3*th?'The line barely reaches the logic-high threshold before it is pulled low again, so edges get missed. That is pulse loss.':'Here it is fine, but with more cable or a higher frequency it quickly becomes a problem.'} A stronger external pull-up (smaller R) speeds up the edge.</p>`,
 takeaway:'Your Ouster story in one line: weak pull-up × cable capacitance = slow rising edge; missed edges at high frequency; fixed with a stronger pull-up plus faster sampling.'};});
def('portfolio','diagnose',()=>{
 const Cs=[470e-12,1e-9,2.2e-9],cand=[100,220,470,1000,2200,4700,10000,22000,47000];let tries=0,out=null;
 while(!out&&tries++<50){const C=pick(Cs),f=pick([5e3,10e3,20e3,50e3]),Rmax=0.1/(2*f)/(2.2*C),Rmin=3.3/0.004;
  const ok=cand.filter(r=>r>=Rmin&&r<=Rmax),slow=cand.filter(r=>r>Rmax),strong=cand.filter(r=>r<Rmin);
  if(ok.length&&slow.length>=2&&strong.length>=1)out={C,f,Rmax,Rmin,c:pick(ok),w:[pick(strong),...shuffle(slow).slice(0,2)]};}
 const o=out,s=puSch('?',capv(o.C),{drv:'pulse out',rv:o.c});
 return{title:'Choosing the fix',prompt:`<p>Pulses at ${eng(o.f,'Hz')}; line capacitance ${capv(o.C)}. The driver can sink at most 4 mA. You want the rise time under 10% of the high time. Which pull-up works?</p>`,svg:s.svg(),answer:mc(ohm(o.c),o.w.map(ohm)),
 hints:['Upper limit (edge speed): R ≤ tr(max)/(2.2·C), where tr(max) = 0.1 × 1/(2f).','Lower limit (driver current): R ≥ 3.3 V / 4 mA ≈ 825 Ω.'],
 solution:`<p>tr(max) = ${eng(0.1/(2*o.f),'s')} → R ≤ ${ohm(o.Rmax)}<br>R ≥ 3.3 V / 4 mA = ${ohm(o.Rmin)}</p><p>Only <b>${ohm(o.c)}</b> sits inside that window. Smaller values overload the driver; larger ones are too slow.</p>`,takeaway:'Pull-up selection is a window with two walls: driver sink current and edge speed. Explaining both walls is a strong answer.'};});
