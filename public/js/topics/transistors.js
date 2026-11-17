"use strict";
/* ================= Transistor switches ================= */
def('xstr','calc',()=>{
 const Vin=pick([3.3,5]),Ic=pick([20,50,100,150])/1e3,beta=pick([100,150,200]),k=pick([5,10]),Ib=k*Ic/beta,Rb=(Vin-0.7)/Ib,{s}=bjtSch(`${Vin} V`,'?',{lab:ohm(nearE12(11.8/Ic)),beta,rbv:e12Down(Rb)});
 return{title:'Sizing a BJT base resistor',prompt:`<p>The load needs ${Ic*1e3} mA. The transistor’s minimum β is ${beta}. With a ${k}× overdrive margin on base current, what is the largest RB you can use?</p>`,svg:s.svg(),answer:num(Rb,'Ω',{tol:.03}),
 hints:['Base current needed just to reach the load current: Ib = Ic / β.',`With the margin: Ib = ${k} × ${Ic*1e3} mA / ${beta} = ${eng(Ib,'A')}.`,'The base–emitter junction drops about 0.7 V, so RB sees Vin − 0.7 V.'],
 solution:`<p>Ib = ${k} × ${eng(Ic,'A')} / ${beta} = ${eng(Ib,'A')}<br>RB = (${Vin} − 0.7) / ${eng(Ib,'A')} = <b>${ohm(Rb)}</b></p><p>Choose the next standard value <i>down</i> (${ohm(e12Down(Rb))}) so you get at least that much base current.</p>`,
 takeaway:'Use minimum β from the datasheet and overdrive it. Designing to typical β gives a transistor that only sometimes saturates.'};});

def('xstr','calc',()=>{
 const Vcc=12,Rc=res(220,2200),beta=pick([100,150,200]),Vin=5,IcSat=(Vcc-0.2)/Rc,want=Math.random()<.6;
 const Rb=nearE12((Vin-0.7)/((IcSat/beta)*(want?rnd(2.5,6):rnd(.2,.65)))),Ib=(Vin-0.7)/Rb,Ica=beta*Ib,sat=Ica>=IcSat,Vce=sat?0.2:Vcc-Ica*Rc;
 const{s,q}=bjtSch('5 V',ohm(Rb),{lab:ohm(Rc),beta});s.probe(q.c[0],q.c[1],'VCE','?',44,-8);
 return{title:'Is the BJT saturated?',prompt:`<p>Vin is high (5 V). β = ${beta}. What is VCE?</p>`,svg:s.svg(),answer:num(Vce,'V',sat?{abs:0.15}:{tol:.04}),
 hints:['Compute the base current: Ib = (Vin − 0.7)/RB.','Compute the most collector current the circuit could allow: Ic(sat) = (12 − 0.2)/RC.','Compare β·Ib with Ic(sat). If β·Ib is bigger, the transistor is saturated and VCE ≈ 0.2 V. Otherwise VCE = 12 − β·Ib·RC.'],
 solution:`<p>Ib = (5 − 0.7)/${ohm(Rb)} = ${eng(Ib,'A')}<br>β·Ib = ${eng(Ica,'A')}; Ic(sat) = 11.8/${ohm(Rc)} = ${eng(IcSat,'A')}</p><p>${sat?`β·Ib ≥ Ic(sat), so it is <b>saturated: VCE ≈ 0.2 V</b>.`:`β·Ib &lt; Ic(sat), so it is in the active region: VCE = 12 − ${eng(Ica,'A')}×${ohm(Rc)} = <b>${f2(Vce)} V</b>. It is not a proper switch, and it will run warm.`}</p>`,
 takeaway:'A “switch” stuck at several volts VCE is under-driven: increase base current (smaller RB) or use a MOSFET.'};});

def('xstr','concept',()=>{
 const v=ri(0,3),{s}=nmosSch({lab:'motor',pd:v===2,lsv:12,fet:v===0?{vth:3,vfull:10}:{}});const Q=[
 ['The MOSFET has VGS(th) = 2–4 V and RDS(on) specified only at VGS = 10 V. It switches a 2 A load from a 3.3 V GPIO. What happens?','It may only partly turn on: at 3.3 V it can sit in its linear region with high resistance, so it gets hot and the load is under-driven',['It switches fully on, because 3.3 V is above the 2 V minimum threshold','It never conducts, because the gate needs exactly 10 V','The GPIO is damaged by continuous gate current']],
 ['The MOSFET is a logic-level part with RDS(on) guaranteed at VGS = 2.5 V. It is driven from a 3.3 V GPIO. Will it switch the load properly?','Yes: RDS(on) is guaranteed at 2.5 V, so 3.3 V fully enhances it',['No: logic-level FETs still need 10 V for full enhancement','Only with a gate resistor smaller than 1 Ω','No: 3.3 V will exceed its gate voltage rating']],
 ['Before RPD was added, the motor twitched during power-up and whenever the MCU reset. Why does RPD fix that?','While the GPIO is high-impedance the gate floats; RPD holds it at 0 V so the FET stays off',['It limits the inrush current into the gate','It speeds up switching by discharging the motor','It protects the GPIO from the motor’s flyback spike']],
 ['Why is an N-channel MOSFET normally placed on the low side (between load and ground)?','Its source sits at ground, so VGS equals the gate drive voltage directly',['N-channel parts can only block current flowing toward ground','It keeps the load at ground potential when off','High-side placement exceeds its drain current rating']]][v];
 return{title:'MOSFET as a switch',prompt:`<p>${Q[0]}</p>`,svg:s.svg(),answer:mc(Q[1],Q[2]),
 hints:['VGS(th) is where the FET just starts to conduct (often defined at 250 µA), not where it is fully on.','The datasheet’s RDS(on) only applies at the VGS it is specified at.','A MOSFET gate is a capacitor. Left floating, it holds or picks up charge.'],
 solution:`<p><b>${Q[1]}.</b></p>`,
 takeaway:'Check two datasheet lines: RDS(on) at the gate voltage you actually have, and the VGS(th) maximum.'};});

def('xstr','diagnose',()=>{
 const V=12,F=[{t:'RG is open, so the gate never sees the drive signal',g:3.3,gt:0,d:11.9,obs:'LED dark'},{t:'The MOSFET is not a logic-level part; 3.3 V leaves it only partly on',g:3.3,gt:3.3,d:5.2,obs:'LED dim, MOSFET hot'},{t:'R1 or LED1 is open (or the LED is backwards)',g:3.3,gt:3.3,d:0.02,obs:'LED dark'},{t:'The firmware is not driving the pin high',g:0,gt:0,d:11.9,obs:'LED dark'},{t:'Working normally',g:3.3,gt:3.3,d:0.05,obs:'LED lit'}];
 const act=pick(F),others=shuffle(F.filter(f=>f!==act)).slice(0,3),{s,q}=nmosSch({led:true,lab:'560 Ω'});
 s.probe(80,250,'A',`${act.g} V`,0,-44);s.probe(260,250,'B',`${act.gt} V`,0,50);s.probe(q.d[0],q.d[1],'C',`${act.d} V`,40,-10);
 return{title:'Low-side switch fault',prompt:`<p>The firmware is supposed to be turning the LED on. Observation: <b>${act.obs}</b>. Which fault explains the readings at A, B and C?</p>`,svg:s.svg(),answer:mc(act.t,others.map(o=>o.t)),
 hints:['Walk the signal path in order: pin (A) → gate (B) → drain (C). Find the first place the reading is wrong.','If A is fine but B is wrong, the fault is between them.','If the gate is right but the drain sits high or mid-supply, the FET is not conducting fully. If the drain is near 0 V yet the LED is dark, current is blocked elsewhere.'],
 solution:`<table><tr><th>Fault</th><th>A</th><th>B</th><th>C</th></tr>${F.map(f=>`<tr><td>${f===act?'<b>'+f.t+'</b>':f.t}</td><td>${f.g}</td><td>${f.gt}</td><td>${f.d}</td></tr>`).join('')}</table>`,
 takeaway:'Follow the signal from source to load and stop at the first wrong reading. That is half-splitting along the path.'};});


/* BJT current relationships */
def('xstr','calc',()=>{
 const beta=pick([50,80,100,150,200,250]),v=ri(0,4);let Ib,Ic,Ie,given,ask,ans,unit,sol;
 if(v<=1){Ib=sig(rnd(10,200),2)*1e-6;Ic=beta*Ib;Ie=Ic+Ib;given={Ib};ask=v===0?'Ic':'Ie';ans=(v===0?Ic:Ie)*1e3;unit='mA';
  sol=`<p>Ic = β·Ib = ${beta} × ${eng(Ib,'A')} = ${eng(Ic,'A')}<br>Ie = Ic + Ib = ${eng(Ic,'A')} + ${eng(Ib,'A')} = ${eng(Ie,'A')}</p><p>Answer: <b>${eng(v===0?Ic:Ie,'A')}</b></p>`;}
 else if(v===2){Ic=sig(rnd(2,100),2)*1e-3;Ib=Ic/beta;Ie=Ic+Ib;given={Ic};ask='Ib';ans=Ib*1e6;unit='µA';sol=`<p>Ib = Ic/β = ${eng(Ic,'A')} / ${beta} = <b>${eng(Ib,'A')}</b></p>`;}
 else if(v===3){Ie=sig(rnd(2,100),2)*1e-3;Ib=Ie/(beta+1);Ic=Ie-Ib;given={Ie};ask='Ib';ans=Ib*1e6;unit='µA';sol=`<p>Ie = (β + 1)·Ib, so Ib = Ie/(β + 1) = ${eng(Ie,'A')} / ${beta+1} = <b>${eng(Ib,'A')}</b><br>(Ic = Ie − Ib = ${eng(Ic,'A')})</p>`;}
 else{Ic=sig(rnd(5,50),2)*1e-3;Ib=Ic/beta;Ie=Ic+Ib;Ie=sig(Ie,4);given={Ic,Ie};ask='β';ans=Ic/(Ie-Ic);unit='β';sol=`<p>Ib = Ie − Ic = ${eng(Ie,'A',4)} − ${eng(Ic,'A',4)} = ${eng(Ie-Ic,'A')}<br>β = Ic/Ib = <b>${f2(ans,0)}</b></p>`;}
 const s=new Sch(440,300),q=s.npn(220,150,'Q1');s.wire(q.b,[120,150]);s.term(120,150,'B','left');s.wire(q.c,[230,60]);s.term(230,60,'C','top');s.wire(q.e,[230,245]);s.term(230,245,'E','right');
 const lab=(k,val)=>given[k]!=null?eng(given[k],'A',k==='Ie'&&v===4?4:3):(ask===k?'?':'—');
 s.probe(150,150,'Ib',lab('Ib'),0,-34);s.probe(230,88,'Ic',lab('Ic'),26,0);s.probe(230,218,'Ie',lab('Ie'),26,0);s.N.unsupported=true;
 const gv=Object.entries(given).map(([k,x])=>`${k} = ${eng(x,'A',k==='Ie'&&v===4?4:3)}`).join(' and ');
 return{title:'BJT current relationships',prompt:`<p>The transistor is in its active region${v===4?'':` with β = ${beta}`}. Given ${gv}, find ${ask==='β'?'β':ask}.</p>`,svg:s.svg(),answer:num(ans,unit,{tol:v===4?0.03:0.02}),
 hints:['In the active region the collector current is a fixed multiple of the base current: Ic = β·Ib.','KCL at the transistor: the emitter carries everything that goes in, so Ie = Ic + Ib = (β + 1)·Ib.',v===4?'Find Ib first from Ie − Ic, then β = Ic/Ib.':v===3?'Rearrange Ie = (β + 1)·Ib for Ib.':'Plug in the numbers; watch the µA/mA prefixes.'],
 solution:sol,takeaway:'Since β is large, Ie ≈ Ic (within about 1%). Interviewers like hearing you say that, and also that the exact relationship is Ie = Ic + Ib.'};});
def('xstr','calc',()=>{
 const beta=pick([80,100,150,200]),Vin=pick([3.3,5]),Rc=res(220,2200),IcMax=0.55*(11.8/Rc),Ibt=IcMax/beta*rnd(0.4,0.95),Rb=nearE12((Vin-0.7)/Ibt),Ib=(Vin-0.7)/Rb,Ic=beta*Ib,Ie=Ic+Ib,Vc=12-Ic*Rc,v=ri(0,2);
 if(Vc<1)return null;
 const{s,q}=bjtSch(`${Vin} V`,ohm(Rb),{lab:ohm(Rc),beta});s.probe(q.c[0],q.c[1],'VC','?',44,-8);
 const asks=[['the collector current Ic',num(Ic*1e3,'mA')],['the emitter current Ie',num(Ie*1e3,'mA')],['the collector voltage VC',num(Vc,'V')]][v];
 return{title:'BJT in the active region',prompt:`<p>β = ${beta}. The input is high (${Vin} V). Find ${asks[0]}.</p>`,svg:s.svg(),answer:asks[1],
 hints:['Base current first: Ib = (Vin − 0.7)/RB.','Collector current: Ic = β·Ib. Check it is below Ic(sat) = (12 − 0.2)/RC, so the transistor really is active.',v===1?'Emitter current: Ie = Ic + Ib.':v===2?'The collector sits below the rail by the drop across RC: VC = 12 − Ic·RC.':'That β·Ib is your answer when the transistor is not saturated.'],
 solution:`<p>Ib = (${Vin} − 0.7)/${ohm(Rb)} = ${eng(Ib,'A')}<br>Ic = ${beta} × ${eng(Ib,'A')} = ${eng(Ic,'A')} (Ic(sat) = ${eng(11.8/Rc,'A')}, so it is active)<br>Ie = Ic + Ib = ${eng(Ie,'A')}<br>VC = 12 − ${eng(Ic,'A')} × ${ohm(Rc)} = ${f2(Vc)} V</p><p>Answer: <b>${[eng(Ic,'A'),eng(Ie,'A'),f2(Vc)+' V'][v]}</b></p>`,
 takeaway:'Always check the region before trusting Ic = β·Ib. If β·Ib exceeds what the load allows, the transistor saturates and the load sets Ic.'};});
