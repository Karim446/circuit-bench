"use strict";
/* ================= Op-amps ================= */
const clip=v=>Math.max(-12,Math.min(12,v));
def('opamp','calc',()=>{
 const Vin=pick([-1,1])*sig(rnd(0.1,2),2),Rin=res(1000,22000),Rf=res(1000,100000),ideal=-Rf/Rin*Vin,Vo=clip(ideal),{s}=invSch(Rin,Rf,{vin:Vin});
 return{title:'Inverting amplifier',prompt:`<p>Vin = ${Vin} V. The op-amp runs on ±12 V and its output can swing rail to rail. What is Vout?</p>`,svg:s.svg(),answer:num(Vo,'V',{abs:0.05}),
 hints:['With negative feedback, the − input is held at the + input’s voltage: 0 V here (a virtual ground).',`So the input current is Vin/RIN, and all of it flows through RF. Gain = −RF/RIN = ${f2(-Rf/Rin,3)}.`,'Finally, check against the rails: the output can’t go past ±12 V.'],
 solution:`<p>Vout = −(${ohm(Rf)}/${ohm(Rin)}) × ${Vin} = ${f2(ideal)} V${Math.abs(ideal)>12?`, beyond the rails, so it <b>clips at ${Vo} V</b>.`:` = <b>${f2(Vo)} V</b>.`}</p>`,
 takeaway:'Always finish with a rail check. “The math says 18 V but the supply is 12 V” is exactly what interviewers want you to catch.'};});

def('opamp','calc',()=>{
 const Vin=sig(rnd(0.1,2),2),Rg=res(1000,22000),Rf=res(1000,100000),G=1+Rf/Rg,ideal=G*Vin,Vo=clip(ideal),{s}=noninvSch(Rg,Rf,Vin);
 return{title:'Non-inverting amplifier',prompt:`<p>Vin = ${Vin} V. ±12 V rails, rail-to-rail output. What is Vout?</p>`,svg:s.svg(),answer:num(Vo,'V',{abs:0.05}),
 hints:['Negative feedback forces V− = V+ = Vin.','RF and RG form a divider from Vout: V− = Vout · RG/(RF+RG). Set that equal to Vin.',`Gain = 1 + RF/RG = ${f2(G,3)}. Then check the rails.`],
 solution:`<p>Vout = (1 + ${ohm(Rf)}/${ohm(Rg)}) × ${Vin} = ${f2(ideal)} V${ideal>12?`, beyond +12 V, so it <b>clips at 12 V</b>.`:` = <b>${f2(Vo)} V</b>.`}</p>`,
 takeaway:'Non-inverting gain is never below 1, and the input draws essentially no current.'};});

def('opamp','calc',()=>{
 const Vin=sig(rnd(0.2,4.8),2),Vref=sig(rnd(0.5,4.5),2),s=new Sch(520,270),p=s.opamp(330,170,true,{vp:5,vn:0});
 s.term(90,154,`Vin = ${Vin} V`,'left');s.wire([90,154],p.top);s.term(90,186,`Vref = ${Vref} V`,'left');s.wire([90,186],p.bot);s.wire(p.out,[455,170]);s.term(455,170,'Vout','right');
 if(Math.abs(Vin-Vref)<0.05)return null;
 const Vo=Vin>Vref?5:0;
 return{title:'Comparator',prompt:`<p>This op-amp is used open loop on a single 0–5 V supply with a rail-to-rail output. What is Vout?</p>`,svg:s.svg(),answer:num(Vo,'V',{abs:0.1}),
 hints:['No feedback path means no virtual short. The output just slams toward a rail.','If V+ > V−, the output goes to the positive rail; otherwise it goes to the negative rail (0 V here).'],
 solution:`<p>V+ = ${Vin} V ${Vin>Vref?'&gt;':'&lt;'} V− = ${Vref} V, so <b>Vout = ${Vo} V</b>.</p>`,
 takeaway:'This is exactly the low-supply indicator’s decision stage. Real comparators often have open-drain outputs, so they need a pull-up.'};});

def('opamp','calc',()=>{
 const I=pick([1,2,5,10,20,50])*1e-6,Rf=res(10000,1000000),Vo=I*Rf;if(Vo>11)return null;const{s}=invSch(0,Rf,{tia:true,iph:I});
 return{title:'Transimpedance amplifier',prompt:`<p>The photodiode produces ${eng(I,'A')} of photocurrent. What is Vout?</p>`,svg:s.svg(),answer:num(Vo,'V',{tol:.03}),
 hints:['The − input is a virtual ground, so the photodiode sits at 0 V bias and its current can’t go into the op-amp input.','KCL at the − node: all of the photocurrent must flow through RF.','Vout = I × RF.'],
 solution:`<p>Vout = ${eng(I,'A')} × ${ohm(Rf)} = <b>${f2(Vo,3)} V</b></p>`,
 takeaway:'A TIA converts a tiny current into a usable voltage. It is the front end of every fiber-optic receiver.'};});

def('opamp','concept',()=>{
 const s=new Sch(520,270),p=s.opamp(330,170,true);s.wire([170,154],p.top);s.term(170,154,'from divider','left',{v:2.5});s.wire(p.bot,[270,186],[270,230],[420,230],[420,170]);s.dot(420,170);s.wire(p.out,[455,170]);s.term(455,170,'to ADC','right');
 return{title:'Voltage follower',prompt:`<p>A divider with a 50 kΩ Thevenin resistance feeds an ADC input that looks like 1 kΩ. Why does adding this follower fix the reading?</p>`,svg:s.svg(),
 answer:mc('Its input draws almost no current, so the divider is not loaded, and its low-impedance output drives the 1 kΩ easily',['It amplifies the signal by 2, compensating for the loss','It filters noise out of the divider','It level-shifts the signal for the ADC']),
 hints:['Without the buffer, 1 kΩ loads a 50 kΩ source: the voltage collapses.','Golden rule 1: no current flows into the op-amp inputs.'],
 solution:'<p><b>A follower has gain 1 but transforms impedance:</b> very high input impedance, very low output impedance. The divider sees an open circuit, and the ADC sees a strong source.</p>',
 takeaway:'“Buffer it” is a valid fix for a loaded divider, but name the reason: impedance, not gain.'};});

def('opamp','diagnose',()=>{
 const Rg=res(1000,10000),Rf=Rg*pick([4,9,19]),G=1+Rf/Rg,mode=pick(['nofb','follow','ok','clip']);
 const Vin=mode==='clip'?sig(rnd(13/G,24/G),2):sig(rnd(0.1,9/G),2);
 const meas={nofb:11.8,follow:Vin,ok:G*Vin,clip:11.8}[mode];
 const T={nofb:'No negative feedback: RF is open or RG is shorted',follow:'It is acting as a follower: RG is open or RF is shorted',ok:'Working correctly',clip:'Working correctly; the output is simply clipping at the rail'};
 const{s,p}=noninvSch(Rg,Rf,Vin);s.probe(90,154,'Vin',`${Vin} V`,0,-36);s.probe(p.out[0]+50,170,'Vout',`${f2(meas)} V`,0,-40);
 return{title:'Op-amp output problem',prompt:`<p>±12 V supply; the output saturates about 0.2 V inside the rails. Given the two readings, what is going on?</p>`,svg:s.svg(),answer:mc(T[mode],Object.values(T).filter(t=>t!==T[mode])),
 hints:[`First compute what Vout should be: gain = 1 + RF/RG ≈ ${f2(G,3)}.`,'Output at a rail with a small input means the loop isn’t closing, unless the math says it should be at the rail anyway.','Vout equal to Vin means the gain collapsed to 1. Which component failures make the circuit a follower?'],
 solution:`<p>Expected: ${f2(G,3)} × ${Vin} = ${f2(G*Vin)} V${G*Vin>11.8?' (beyond the rail)':''}. Measured: ${f2(meas)} V.</p><p><b>${T[mode]}.</b></p><table><tr><td>Rail, small input</td><td>feedback broken (RF open / RG shorted)</td></tr><tr><td>Vout = Vin</td><td>RG open or RF shorted</td></tr><tr><td>Rail, large input</td><td>normal clipping</td></tr></table>`,
 takeaway:'Output stuck at a rail is the classic op-amp fault signature. Check the math first; sometimes the rail is the correct answer.'};});
