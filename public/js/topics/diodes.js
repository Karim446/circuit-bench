"use strict";
/* ================= Diodes & LEDs ================= */
def('diode','calc',()=>{
 const V=pick([5,9,12]),L=pick(LEDS),I=pick([10,15,20])/1e3,R=(V-L.vf)/I,s=ledSch(V,'?',{vf:L.vf,sv:e12Up(R)});
 return{title:'LED current-limiting resistor',prompt:`<p>A ${L.c} LED (Vf ≈ ${L.vf} V) should run at ${I*1e3} mA. What resistor value do you need?</p>`,svg:s.svg(),answer:num(R,'Ω',{tol:.02}),
 hints:['The LED holds roughly its forward voltage; the resistor takes whatever is left of the supply.',`Voltage across R1 = ${V} − ${L.vf} = ${f2(V-L.vf)} V.`,'Then R = V(R1) / I.'],
 solution:`<p>R = (${V} − ${L.vf}) / ${I*1e3} mA = <b>${f2(R,0)} Ω</b>. Round up to the next standard value, ${ohm(e12Up(R))}, so the current lands slightly under target.</p>`,
 takeaway:'Always round LED resistors up. A little less current is invisible; a little more shortens the LED’s life.'};});

def('diode','calc',()=>{
 const V=pick([5,9,12]),L=pick(LEDS),R=res(150,1000),I=(V-L.vf)/R,s=ledSch(V,ohm(R),{vf:L.vf});
 return{title:'LED current',prompt:`<p>The LED is ${L.c} (Vf ≈ ${L.vf} V). How much current flows?</p>`,svg:s.svg(),answer:num(I*1e3,'mA'),
 hints:['Treat the LED as a fixed voltage drop of Vf.',`V across R1 = ${V} − ${L.vf} = ${f2(V-L.vf)} V. Use Ohm’s law on R1.`],
 solution:`<p>I = (${V} − ${L.vf}) / ${R} Ω = <b>${eng(I,'A')}</b></p>`,
 takeaway:'The resistor sets LED current. The LED’s own “resistance” isn’t a useful number.'};});

def('diode','diagnose',()=>{
 const V=pick([3.3,5,9,12]),R=res(220,1000),s=ledSch(V,ohm(R),{reversed:true});
 return{title:'Backwards LED',prompt:`<p>LED1 was installed as drawn. What voltage would you measure across R1?</p>`,svg:s.svg(),answer:num(0,'V',{abs:0.05}),
 hints:['Look at the LED symbol: which way does the triangle point compared with conventional current from + to −?','A reverse-biased diode blocks current.','No current through R1 means no voltage across it.'],
 solution:`<p>The LED is reverse biased, so no current flows. V(R1) = I·R = <b>0 V</b>, and the full ${V} V appears across the LED.</p>${V>5?`<p>Watch out: LEDs are only rated for about 5 V reverse, so ${V} V can damage this one.</p>`:''}`,
 takeaway:'Signature of a backwards LED: zero volts across its resistor and the whole supply across the LED.'};});

def('diode','calc',()=>{
 const V=pick([5,9,12]),R=res(220,4700),I=(V-0.7)/R,s=ledSch(V,ohm(R),{diode:true}),v=Math.random()<.5;
 return{title:'Silicon diode in series',prompt:`<p>D1 is a silicon diode. ${v?'How much current flows?':'What voltage is across R1?'}</p>`,svg:s.svg(),answer:v?num(I*1e3,'mA'):num(V-0.7,'V',{abs:0.05}),
 hints:['A forward-biased silicon diode drops about 0.7 V.',`R1 gets the rest: ${V} − 0.7 = ${f2(V-0.7)} V.`],
 solution:`<p>V(R1) = ${V} − 0.7 = ${f2(V-0.7)} V; I = ${f2(V-0.7)} / ${R} = ${eng(I,'A')}</p><p>Answer: <b>${v?eng(I,'A'):f2(V-0.7)+' V'}</b></p>`,
 takeaway:'0.7 V is the go-to approximation. Say “about” when you use it; it varies with current and temperature.'};});

def('diode','diagnose',()=>{
 const V=pick([5,9,12]),L=pick(LEDS.slice(0,3)),R=res(220,680);
 const F=[{t:'LED1 is open or installed backwards',m:V,obs:'LED dark, R1 cool'},{t:'The anode node is shorted to ground',m:0,obs:'LED dark, R1 very hot'},{t:'R1 is open',m:0,obs:'LED dark, R1 cool'},{t:'Working normally',m:L.vf,obs:'LED lit'}];
 const act=pick(F),s=ledSch(V,ohm(R),{vf:L.vf});s.probe(350,70,'A',`${f2(act.m,1)} V`,30,30);
 return{title:'LED won’t light',prompt:`<p>You measure point A as shown. Observation: <b>${act.obs}</b>. Which fault fits both the reading and the observation?</p>`,svg:s.svg(),answer:mc(act.t,F.filter(f=>f!==act).map(f=>f.t)),
 hints:['If no current flows through R1, there is no drop across it, so A sits at the supply voltage.','A at 0 V means either nothing reaches the node (R1 open) or the node is tied to ground (a short). Temperature tells those apart.',`A working ${L.c} LED holds A near ${L.vf} V.`],
 solution:`<table><tr><th>Fault</th><th>A reads</th><th>Clue</th></tr>${F.map(f=>`<tr><td>${f===act?'<b>'+f.t+'</b>':f.t}</td><td>${f2(f.m,1)} V</td><td>${f.obs}</td></tr>`).join('')}</table>`,
 takeaway:'Two faults can give the same voltage. Use a second clue (temperature, current draw, smell) to separate them, and say so out loud.'};});

def('diode','calc',()=>{
 const Vz=pick([3.3,4.7,5.1,6.2]),Vs=pick([9,12,15]),Rs=res(220,1000),Is=(Vs-Vz)/Rs,inReg=Math.random()<.65;let RL,ans,sol,title;
 if(inReg){const RLmin=Vz/(Is*0.7);RL=res(RLmin,RLmin*5);const IL=Vz/RL,Iz=Is-IL;ans=num(Iz*1e3,'mA');title='How much current does the zener carry?';
  sol=`<p>Check regulation: without the zener, Vout = ${Vs}×${ohm(RL)}/(${ohm(Rs)}+${ohm(RL)}) = ${f2(Vs*RL/(Rs+RL))} V &gt; ${Vz} V, so the zener clamps at ${Vz} V.</p><p>Is = (${Vs} − ${Vz})/${ohm(Rs)} = ${eng(Is,'A')}<br>IL = ${Vz}/${ohm(RL)} = ${eng(IL,'A')}<br>Iz = Is − IL = <b>${eng(Iz,'A')}</b></p>`;}
 else{const RLmax=Vz*Rs/(Vs-Vz);RL=res(RLmax*0.2,RLmax*0.8);const Vo=Vs*RL/(Rs+RL);ans=num(Vo,'V');title='What is Vout?';
  sol=`<p>Check regulation: without the zener, Vout = ${Vs}×${ohm(RL)}/(${ohm(Rs)}+${ohm(RL)}) = ${f2(Vo)} V, which is <i>below</i> ${Vz} V.</p><p>The zener never reaches breakdown, so it carries no current and the circuit is just a divider: <b>Vout = ${f2(Vo)} V</b>.</p>`;}
 const s=new Sch(520,290);s.two('src',[80,240],[80,70],'',`${Vs} V`,{left:true});s.wire([80,70],[130,70]);s.two('res',[130,70],[240,70],'RS',ohm(Rs));s.wire([240,70],[400,70]);
 s.two('zener',[290,240],[290,70],'Z1',`${Vz} V`);s.two('res',[400,70],[400,240],'RL',ohm(RL));s.wire([400,240],[80,240]);s.gnd(180,240);s.dot(290,70);s.dot(290,240);s.text(345,60,'Vout','sn');
 return{title:'Zener regulator',prompt:`<p>${title}</p>`,svg:s.svg(),answer:ans,
 hints:['First check: with the zener removed, would Vout exceed Vz? If not, the zener does nothing.','If it regulates, Vout = Vz. The current through RS is (Vs − Vz)/RS.','That current splits: part goes to the load (Vz/RL), and the zener takes the rest.'],
 solution:sol,takeaway:'A zener only regulates while it carries current. Too heavy a load starves it and the output sags. That is a classic interview trap.'};});

def('diode','concept',()=>{
 const v=ri(0,2),s=flySch(v!==1);const Q=[
 ['What is D1 for?','It gives the coil’s current a path when the transistor turns off, clamping the voltage spike',['It blocks reverse current from the supply while the coil is energized','It regulates the coil voltage to exactly 12 V while it is on','It makes the relay release faster']],
 ['There is no diode across the coil. What happens each time the transistor switches off?','The collector sees a large voltage spike, well above 12 V, that can break down the transistor',['The relay never energizes','The coil draws excessive current while on','Nothing; diodes are only needed for AC coils']],
 ['Which way must D1 face?','Cathode to +12 V, anode to the collector, so it is reverse biased in normal operation',['Anode to +12 V, cathode to the collector, so it conducts while the coil is on','Either direction works, since it only conducts during the spike','It should go from the collector to ground instead']]][v];
 return{title:'Flyback diode',prompt:`<p>${Q[0]}</p>`,svg:s.svg(),answer:mc(Q[1],Q[2]),
 hints:['An inductor resists sudden changes in current: V = L·di/dt.','When the transistor snaps off, di/dt is huge, so the coil generates whatever voltage it takes to keep current flowing.','The diode gives that current a loop back through the coil instead of through the transistor.'],
 solution:`<p><b>${Q[1]}.</b></p><p>While the coil is on, the diode is reverse biased and does nothing. At turn-off, the coil’s current circulates through the diode and decays, so the collector is clamped about 0.7 V above +12 V instead of spiking. (It does make the relay release a bit slower.)</p>`,
 takeaway:'Any inductive load (relay, solenoid, motor) needs a flyback path. Missing flyback diodes are a classic cause of dead transistors.'};});
