"use strict";
/* ================= Digital ================= */
const LINEC=[50e-12,100e-12,220e-12,470e-12,1e-9,2.2e-9];
def('digital','calc',()=>{
 const R=pick([1000,2200,4700,10000,47000]),C=pick(LINEC),tr=2.2*R*C,s=puSch(ohm(R),capv(C));const u=tr<1e-6?['ns',1e9]:['µs',1e6];
 return{title:'Pull-up rise time',prompt:`<p>The open-drain driver releases the line. What is the 10–90% rise time?</p>`,svg:s.svg(),answer:num(tr*u[1],u[0]),
 hints:['When the FET turns off, the only thing pulling the line up is RPU charging C line: an RC charge.','10% → 90% of an RC charge takes about 2.2τ.',`τ = ${eng(R*C,'s')}.`],
 solution:`<p>tr ≈ 2.2 × ${ohm(R)} × ${capv(C)} = <b>${eng(tr,'s')}</b></p><p>Falling edges are fast because the FET actively pulls down; rising edges are slow because only the resistor pulls up.</p>`,takeaway:'Open-drain lines have asymmetric edges: a fast fall and a slow, RC-limited rise.'};});
def('digital','calc',()=>{
 const C=pick(LINEC),trm=pick([100e-9,300e-9,1e-6,2e-6]),R=trm/(2.2*C),s=puSch('?',capv(C),{rv:e12Down(R)});
 return{title:'Largest pull-up for a rise time',prompt:`<p>The rise time must be under ${eng(trm,'s')}. What is the largest pull-up resistor you can use?</p>`,svg:s.svg(),answer:num(R/1e3,'kΩ'),
 hints:['Start from tr ≈ 2.2·R·C.','Solve for R: R = tr / (2.2·C).'],
 solution:`<p>R ≤ ${eng(trm,'s')} / (2.2 × ${capv(C)}) = <b>${ohm(R)}</b>. Pick the next standard value below: ${ohm(e12Down(R))}.</p><p>The lower limit comes from the driver: R ≥ 3.3 V / I_sink(max).</p>`,takeaway:'Pull-up selection is a window: big enough for the driver’s current limit, small enough for the edge rate.'};});
def('digital','concept',()=>{
 const v=ri(0,4);let Q;
 if(v<3){const sc=[['A 3.3 V CMOS output drives a 5 V CMOS input whose V_IH = 0.7 × VDD.','Not guaranteed: 3.3 V is below the input’s 3.5 V V_IH'],['A 3.3 V output drives a 5 V part with TTL-compatible inputs (V_IH = 2.0 V).','Works reliably: 3.3 V comfortably exceeds 2.0 V'],['A 5 V output drives a 3.3 V MCU pin that is not 5 V tolerant.','Risky: it exceeds the input’s maximum rating and can damage it']][v];
  const all=['Not guaranteed: 3.3 V is below the input’s 3.5 V V_IH','Works reliably: 3.3 V comfortably exceeds 2.0 V','Risky: it exceeds the input’s maximum rating and can damage it','Works only if you add a pull-down resistor'];
  Q=[sc[0]+' Will it work?',sc[1],all.filter(a=>a!==sc[1])];}
 else if(v===3)Q=['An open-drain output with no pull-up connects to an MCU input. What does the input see when the output is released?','Nothing defines the level: the line floats, so it reads randomly or drifts',['A clean logic high','A clean logic low','Exactly half the supply voltage']];
 else Q=['A pushbutton connects an MCU input to ground when pressed; nothing else is attached. Released, the input reads randomly. Fix?','Add a pull-up resistor (or enable the internal pull-up) so the released state is a defined high',['Add a pull-down resistor to ground','Add a series resistor between button and pin','Add a capacitor from the pin to 3.3 V']];
 return{title:v<3?'Logic levels':v===3?'Open-drain outputs':'Floating inputs',prompt:`<p>${Q[0]}</p>`,svg:null,answer:mc(Q[1],Q[2]),
 hints:v<3?['Compare the driver’s V_OH with the receiver’s V_IH, and the driver’s maximum voltage with the receiver’s absolute max.','CMOS thresholds scale with supply (≈0.7·VDD); TTL thresholds are fixed at 2.0 V.']:['An open-drain/open-collector output can only pull low. Something else must pull high.','A CMOS input draws essentially no current, so an undriven line has no defined voltage.'],
 solution:`<p><b>${Q[1]}.</b></p>`,takeaway:'Whenever two boards or chips talk, check voltage levels and what happens when nobody is driving the line.'};});
