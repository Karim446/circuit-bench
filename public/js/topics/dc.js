"use strict";
/* ================= DC fundamentals ================= */
def('dc','calc',()=>{
 const V=pick([3.3,5,9,12,15,24]),R=res(100,10000),I=V/R,s=new Sch(520,280);
 s.two('src',[110,230],[110,70],'',`${V} V`,{left:true});s.wire([110,70],[330,70]);s.two('res',[330,70],[330,230],'R1',ohm(R));s.wire([330,230],[110,230]);s.gnd(220,230);
 return{title:'Ohm’s law warm-up',prompt:`<p>What current flows through R1?</p>`,svg:s.svg(),answer:num(I*1e3,'mA'),
 hints:['Ohm’s law rearranged for current: I = V / R.',`Write R in ohms: ${ohm(R)} = ${R} Ω.`],
 solution:`<p>I = V / R = ${V} V / ${R} Ω = <b>${eng(I,'A')}</b></p>`,
 takeaway:'Anchor: 1 V across 1 kΩ is 1 mA. Scale from there to sanity-check any answer in your head.'};});

def('dc','calc',()=>{
 const V=pick([5,9,12,24]),R1=res(470,4700),R2=res(1000,10000),R3=res(1000,10000),Rp=R2*R3/(R2+R3),Req=R1+Rp,I=V/Req,Vp=I*Rp,v=ri(0,2);
 const s=new Sch(520,290);s.two('src',[80,240],[80,70],'',`${V} V`,{left:true});s.wire([80,70],[110,70]);s.two('res',[110,70],[230,70],'R1',ohm(R1));s.wire([230,70],[380,70]);
 s.two('res',[280,70],[280,240],'R2',ohm(R2));s.two('res',[380,70],[380,240],'R3',ohm(R3));s.wire([380,240],[80,240]);s.gnd(180,240);s.dot(280,70);s.dot(280,240);
 const ask=[['What total resistance does the supply see?',num(Req/1e3,'kΩ')],['What current leaves the supply?',num(I*1e3,'mA')],['What voltage is across R3?',num(Vp,'V')]][v];
 return{title:'Series–parallel network',prompt:`<p>${ask[0]}</p>`,svg:s.svg(),answer:ask[1],
 hints:['R2 and R3 connect to the same two nodes, so they are in parallel. Combine them first.',`R2 ‖ R3 = R2·R3/(R2+R3) = ${ohm(Rp)}.`,v===0?'That pair is in series with R1, so just add R1.':v===1?`Req = R1 + (R2‖R3) = ${ohm(Req)}. Now use I = V / Req.`:`The pair and R1 form a divider: V(R3) = V · (R2‖R3) / (R1 + R2‖R3).`],
 solution:`<p>R2 ‖ R3 = ${ohm(Rp)}<br>Req = ${ohm(R1)} + ${ohm(Rp)} = ${ohm(Req)}<br>I = ${V} V / ${ohm(Req)} = ${eng(I,'A')}<br>V(R3) = I × (R2‖R3) = ${f2(Vp)} V</p><p>Answer: <b>${[ohm(Req),eng(I,'A'),f2(Vp)+' V'][v]}</b></p>`,
 takeaway:'Reduce the network from the far end toward the source, one obvious series or parallel pair at a time.'};});

def('dc','calc',()=>{
 const V=pick([5,9,12,15,24]),R1=res(1000,47000),R2=res(1000,47000),Vo=V*R2/(R1+R2),s=divSch(V,R1,R2);
 return{title:'Voltage divider',prompt:`<p>Nothing is connected to the output. What voltage is at Vout?</p>`,svg:s.svg(),answer:num(Vo,'V'),
 hints:['With no load, the same current flows through R1 and R2, so the supply splits in proportion to resistance.','Vout is the voltage across the bottom resistor: Vout = Vin · R2 / (R1 + R2).',`R2 / (R1 + R2) = ${f2(R2/(R1+R2),3)}`],
 solution:`<p>Vout = ${V} V × ${ohm(R2)} / (${ohm(R1)} + ${ohm(R2)}) = <b>${f2(Vo)} V</b></p>`,
 takeaway:'Before calculating, predict: if R2 is the larger resistor, Vout must be more than half the supply.'};});

def('dc','calc',()=>{
 const V=pick([5,9,12,24]),R1=res(1000,22000),R2=res(1000,22000),RL=res(R2*0.3,R2*12),Rp=R2*RL/(R2+RL),Vo=V*Rp/(R1+Rp),Vu=V*R2/(R1+R2);
 const s=divSch(V,R1,R2,{RL});s.probe(260,155,'Vout','?',-36,-34);
 return{title:'Loaded divider',prompt:`<p>A load RL is now connected to the divider output. What is Vout?</p>`,svg:s.svg(),answer:num(Vo,'V'),
 hints:['RL connects to the same two nodes as R2, so it is in parallel with R2.',`R2 ‖ RL = ${ohm(Rp)}.`,'Now it is an ordinary divider: Vout = Vin · (R2‖RL) / (R1 + R2‖RL).'],
 solution:`<p>R2 ‖ RL = ${ohm(Rp)}<br>Vout = ${V} × ${ohm(Rp)} / (${ohm(R1)} + ${ohm(Rp)}) = <b>${f2(Vo)} V</b></p><p>Unloaded it would be ${f2(Vu)} V, so the load pulls it down ${f2((1-Vo/Vu)*100,0)}%.</p>`,
 takeaway:'Rule of thumb: the load should be at least 10× the divider’s Thevenin resistance (R1‖R2), or the output sags noticeably.'};});

def('dc','calc',()=>{
 const V=pick([5,9,12,24]),R1=res(1000,47000),R2=res(1000,47000),Vth=V*R2/(R1+R2),Rth=R1*R2/(R1+R2),v=Math.random()<.5,s=divSch(V,R1,R2);
 return{title:'Thevenin equivalent',prompt:`<p>Looking back into Vout, what is the Thevenin ${v?'voltage':'resistance'}?</p>`,svg:s.svg(),answer:v?num(Vth,'V'):num(Rth/1e3,'kΩ'),
 hints:v?['Thevenin voltage is the open-circuit voltage at the terminals.','With nothing connected, that is just the divider output: Vin · R2/(R1+R2).']:['To find Thevenin resistance, turn off the sources: a voltage source becomes a short.','With the supply shorted, R1 and R2 both run from Vout to ground.','So Rth = R1 ‖ R2.'],
 solution:`<p>Vth = ${V} × ${ohm(R2)}/(${ohm(R1)}+${ohm(R2)}) = ${f2(Vth)} V<br>Rth = R1 ‖ R2 = ${ohm(Rth)}</p><p>Answer: <b>${v?f2(Vth)+' V':ohm(Rth)}</b></p><p>Any load then sees Vout = Vth · RL/(Rth + RL).</p>`,
 takeaway:'Thevenin turns “what happens when I load this?” into a one-line divider. Interviewers like hearing you reach for it.'};});

def('dc','calc',()=>{
 const R=res(47,2200),target=pick([rnd(.1,.4),rnd(.58,.92),rnd(1.3,3)]);let V=Math.sqrt(target*0.25*R);V=Math.max(1,Math.round(V*2)/2);
 const P=V*V/R,ratio=P/0.25,s=new Sch(520,280);
 s.two('src',[110,230],[110,70],'',`${V} V`,{left:true});s.wire([110,70],[330,70]);s.two('res',[330,70],[330,230],'R1',`${ohm(R)}, ¼ W`);s.wire([330,230],[110,230]);s.gnd(220,230);
 const C=['Fine: it runs well under half its rating','Marginal: within rating but hot, so use a ½ W part','No: it exceeds its ¼ W rating and will overheat'];
 const correct=ratio<0.5?C[0]:ratio<=1?C[1]:C[2],isNum=Math.random()<.45;
 return{title:'Resistor power rating',prompt:isNum?`<p>How much power does R1 dissipate?</p>`:`<p>Is a ¼ W resistor appropriate here?</p>`,svg:s.svg(),
 answer:isNum?num(P*1e3,'mW'):mc(correct,C.filter(c=>c!==correct)),
 hints:['You know V across the resistor and R, so P = V² / R is the quickest form.',`P = ${V}² / ${R} = ${eng(P,'W')}.`,'¼ W = 250 mW. Good practice is to stay under about 50% of the rating.'],
 solution:`<p>P = V²/R = ${V}² / ${R} Ω = <b>${eng(P,'W')}</b>, which is ${f2(ratio*100,0)}% of 250 mW.</p><p>${correct}.</p>`,
 takeaway:'Derating matters: a resistor at 90% of its rating runs very hot and drifts. Mentioning that unprompted signals real bench experience.'};});

def('dc','calc',()=>{
 const V=pick([5,9,12]),Ra=res(330,4700),Rb=res(330,4700),Rc=res(330,4700),Ia=V/Ra,Ib=V/Rb,Ic=V/Rc,It=Ia+Ib+Ic,s=new Sch(520,290);
 s.two('src',[80,240],[80,70],'',`${V} V`,{left:true});s.wire([80,70],[420,70]);s.two('res',[220,70],[220,240],'R1',ohm(Ra));s.two('res',[320,70],[320,240],'R2',ohm(Rb));s.two('res',[420,70],[420,240],'R3','?',{sv:Rc});
 s.wire([80,240],[420,240]);s.gnd(150,240);[220,320].forEach(x=>{s.dot(x,70);s.dot(x,240);});s.probe(150,70,'I total',eng(It,'A'),0,-32);
 const Itr=sig(It*1e3,3)/1e3;
 return{title:'KCL: find the missing branch',prompt:`<p>The supply current is measured as shown. R3’s value is unknown. How much current flows through R3?</p>`,svg:s.svg(),answer:num((Itr-Ia-Ib)*1e3,'mA',{tol:.04}),
 hints:['KCL: the current leaving the supply splits among the branches and must add back up to the total.','Each branch has the full supply voltage across it, so Ohm’s law gives I1 and I2.',`I1 = ${eng(Ia,'A')}, I2 = ${eng(Ib,'A')}. Subtract both from the total.`],
 solution:`<p>I1 = ${V}/${ohm(Ra)} = ${eng(Ia,'A')}<br>I2 = ${V}/${ohm(Rb)} = ${eng(Ib,'A')}<br>I3 = ${eng(Itr,'A')} − ${eng(Ia,'A')} − ${eng(Ib,'A')} = <b>${eng(Itr-Ia-Ib,'A')}</b></p><p>(So R3 ≈ ${ohm(V/(Itr-Ia-Ib))}.)</p>`,
 takeaway:'KCL is how you find a current you can’t measure directly. It also shows up in troubleshooting: a branch drawing too much points at a short.'};});

def('dc','calc',()=>{
 const V=pick([9,12,15,24]),R1=res(470,4700),R2=res(470,4700),R3=res(470,4700),I=V/(R1+R2+R3),V1=+(I*R1).toFixed(2),V2=+(I*R2).toFixed(2),s=new Sch(520,300);
 s.two('src',[70,240],[70,70],'',`${V} V`,{left:true});s.wire([70,70],[110,70]);s.two('res',[110,70],[210,70],'R1','',{sv:R1});s.wire([210,70],[250,70]);s.two('res',[250,70],[350,70],'R2','',{sv:R2});s.wire([350,70],[430,70]);
 s.two('res',[430,70],[430,240],'R3','?',{sv:R3});s.wire([430,240],[70,240]);s.gnd(250,240);s.probe(160,70,'V(R1)',`${V1} V`,0,52);s.probe(300,70,'V(R2)',`${V2} V`,0,52);
 return{title:'KVL around a loop',prompt:`<p>You measure the voltage across R1 and R2. What is the voltage across R3?</p>`,svg:s.svg(),answer:num(V-V1-V2,'V',{abs:0.02}),
 hints:['KVL: going around the loop, the drops across the resistors add up to the supply voltage.',`So V(R3) = ${V} − V(R1) − V(R2).`],
 solution:`<p>V(R3) = ${V} − ${V1} − ${V2} = <b>${f2(V-V1-V2)} V</b></p>`,
 takeaway:'On the bench, KVL tells you where voltage “went.” If one part takes almost all the supply, that part is probably open.'};});

def('dc','diagnose',()=>{
 const V=pick([5,9,12]),R1=res(2200,22000),R2=res(2200,22000),exp=V*R2/(R1+R2),load=V*(R2/2)/(R1+R2/2),small=V*(R2/10)/(R1+R2/10);
 const F=[{t:'R1 is open (or Vout is shorted to ground)',m:0},{t:'R2 is open (or R1 is shorted)',m:V},{t:'An external load equal to R2 is connected to Vout',m:load},{t:'R2 was installed at 1/10 of its marked value',m:small},{t:'Nothing is wrong; the divider is working',m:exp}];
 const act=pick(F),others=shuffle(F.filter(f=>f!==act)).slice(0,3),s=divSch(V,R1,R2);
 s.probe(260,155,'A',`${f2(act.m)} V`,-36,-34);s.probe(90,70,'Supply',`${f2(V,1)} V`,34,-30);
 return{title:'Divider fault-finding',prompt:`<p>You measure the two points shown. Which single fault explains reading A?</p>`,svg:s.svg(),answer:mc(act.t,others.map(o=>o.t)),
 hints:['Step 1: predict what Vout should read if everything works.',`Expected: ${f2(exp)} V. How does reading A compare?`,'Step 2: predict the reading each candidate fault would give, and keep the one that matches.'],
 solution:`<table><tr><th>If…</th><th>Vout would read</th></tr>${F.map(f=>`<tr><td>${f===act?'<b>'+f.t+'</b>':f.t}</td><td>${f2(f.m)} V</td></tr>`).join('')}</table>`,
 takeaway:'Say it this way in the interview: “I’d predict the reading for each possible fault and keep only the ones that match what I measured.”'};});

def('dc','calc',()=>{
 const It=pick([5,10,20,50])/1e3,R1=res(330,10000),R2=res(330,10000),I1=It*R2/(R1+R2),s=new Sch(520,290);
 s.two('isrc',[80,240],[80,70],'',eng(It,'A'),{left:true});s.wire([80,70],[360,70]);s.two('res',[240,70],[240,240],'R1',ohm(R1));s.two('res',[360,70],[360,240],'R2',ohm(R2));s.wire([360,240],[80,240]);s.gnd(160,240);s.dot(240,70);s.dot(240,240);
 return{title:'Current divider',prompt:`<p>A ${eng(It,'A')} current source feeds R1 and R2 in parallel. How much current flows through R1?</p>`,svg:s.svg(),answer:num(I1*1e3,'mA'),
 hints:['Parallel branches split current in inverse proportion to resistance: the smaller resistor carries more.','Current divider: I(R1) = Itotal × R2/(R1 + R2). Note it is the other resistor on top.',`R2/(R1 + R2) = ${f2(R2/(R1+R2),3)}.`],
 solution:`<p>I(R1) = ${eng(It,'A')} × ${ohm(R2)}/(${ohm(R1)} + ${ohm(R2)}) = <b>${eng(I1,'A')}</b></p><p>Check: the voltage across both is ${eng(It*R1*R2/(R1+R2),'V')}, and that divided by R1 gives the same current.</p>`,
 takeaway:'Sanity check before calculating: the branch with the smaller resistor must carry more than half the current.'};});
