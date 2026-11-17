"use strict";
/* ================= Power ================= */
def('power','calc',()=>{
 const Vin=pick([5,9,12]),Vout=Vin>6?pick([3.3,5]):3.3,I=pick([0.1,0.2,0.3,0.5,0.8,1]),P=(Vin-Vout)*I,v=Math.random()<.6,s=new Sch(520,230);
 s.term(80,110,`${Vin} V`,'left');s.wire([80,110],[190,110]);s.box(190,80,140,70,'Linear reg',`${Vout} V out`);s.wire([330,110],[410,110]);s.term(410,110,`${I} A load`,'right');s.wire([260,150],[260,175]);s.gnd(260,175);
 return{title:'Linear regulator',prompt:`<p>${v?'How much power does the regulator dissipate as heat?':'What is the regulator’s efficiency?'}</p>`,svg:s.svg(),answer:v?num(P,'W'):num(Vout/Vin*100,'%',{abs:0.6}),
 hints:['A linear regulator passes the full load current and drops the excess voltage across itself.',v?'P = (Vin − Vout) × I.':'Efficiency = Pout/Pin = (Vout·I)/(Vin·I) = Vout/Vin.'],
 solution:`<p>Heat = (${Vin} − ${Vout}) × ${I} = ${f2(P,3)} W; efficiency = ${Vout}/${Vin} = ${f2(Vout/Vin*100,1)}%</p><p>Answer: <b>${v?f2(P,3)+' W':f2(Vout/Vin*100,1)+'%'}</b></p>${P>1?'<p>Over about 1 W needs a heatsink. A buck converter would be the better choice here.</p>':''}`,takeaway:'Linear = simple and quiet but wastes (Vin − Vout)·I. Big drop plus big current means use a switcher.'};});
def('power','calc',()=>{
 const Vout=pick([3.3,5]),Vdo=pick([0.3,1.1,2.0]),Vmin=Vout+Vdo;
 return{title:'Dropout voltage',prompt:`<p>A ${Vout} V regulator has a dropout of ${Vdo} V at your load current. What is the minimum input voltage that keeps it regulating?</p>`,svg:null,answer:num(Vmin,'V',{abs:0.02}),
 hints:['Dropout is the smallest Vin − Vout the regulator needs to keep its output in spec.','Vin(min) = Vout + dropout.'],
 solution:`<p>Vin(min) = ${Vout} + ${Vdo} = <b>${f2(Vmin)} V</b>. Below that, the output follows the input down.</p>`,takeaway:'Battery projects live and die by dropout: a 1.1 V-dropout 5 V regulator stops regulating at 6.1 V.'};});
def('power','calc',()=>{
 const Vin=pick([12,24]),Vout=pick([3.3,5]),Io=pick([0.5,1,2]),eta=pick([0.85,0.9]),v=Math.random()<.5,Iin=Vout*Io/(eta*Vin);
 return{title:'Buck converter',prompt:v?`<p>An ideal buck converter steps ${Vin} V down to ${Vout} V. What duty cycle does it run at?</p>`:`<p>A buck converter makes ${Vout} V at ${Io} A from ${Vin} V with ${eta*100}% efficiency. What current does it draw from the input?</p>`,svg:null,answer:v?num(Vout/Vin*100,'%',{abs:0.5}):num(Iin,'A'),
 hints:v?['A buck switches the input on and off; the inductor and capacitor average it.','Vout ≈ D × Vin.']:['Power is (nearly) conserved, not current: Pin = Pout / η.','Iin = Vout·Iout / (η·Vin).'],
 solution:v?`<p>D = ${Vout}/${Vin} = <b>${f2(Vout/Vin*100,1)}%</b></p>`:`<p>Pout = ${f2(Vout*Io,2)} W; Pin = ${f2(Vout*Io/eta,2)} W; Iin = Pin/${Vin} = <b>${f2(Iin,3)} A</b></p><p>Less current comes out of the input than goes into the load. A linear regulator would draw the full ${Io} A.</p>`,takeaway:'Bucks trade complexity and switching noise for efficiency. Input current is lower than output current.'};});
def('power','concept',()=>({title:'Bench supply behavior',prompt:'<p>A circuit works at light load, but when its motor starts the output voltage collapses and the bench supply’s CC light turns on. What is happening?</p>',svg:null,
 answer:mc('The supply hit its current limit and is lowering the voltage to hold the current',['The supply’s voltage setpoint is drifting','The motor’s back-EMF is raising the voltage','The ground lead is too thick']),
 hints:['CV = constant voltage mode; CC = constant current mode.','In CC mode the supply sacrifices voltage to stay at the current limit.'],
 solution:'<p><b>Current limit.</b> A motor’s startup (stall) current can be many times its running current. Raise the limit if it is safe, or check for a short.</p>',takeaway:'Before blaming the circuit, look at the bench supply. CC mode makes perfectly good circuits behave strangely.'}));
