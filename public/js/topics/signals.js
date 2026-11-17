"use strict";
/* ================= Signals & AC ================= */
def('ac','calc',()=>{
 const v=ri(0,2),Vpk=sig(rnd(1,170),3);let q,ans,sol;
 if(v===0){ans=Vpk/Math.SQRT2;q=`A sine wave has a peak of ${Vpk} V. What is its RMS value?`;sol=`<p>Vrms = Vpk/√2 = ${Vpk}/1.414 = <b>${f2(ans)} V</b></p>`;}
 else if(v===1){const Vpp=sig(2*Vpk,3);ans=Vpp/(2*Math.SQRT2);q=`A sine wave measures ${Vpp} V peak-to-peak on a scope. What is its RMS value?`;sol=`<p>Vpk = Vpp/2 = ${f2(Vpp/2)} V; Vrms = Vpk/√2 = <b>${f2(ans)} V</b></p>`;}
 else{const Vr=sig(Vpk/Math.SQRT2,3);ans=Vr*Math.SQRT2;q=`A DMM on AC reads ${Vr} V (RMS) on a sine wave. What is the peak voltage?`;sol=`<p>Vpk = √2 × Vrms = 1.414 × ${Vr} = <b>${f2(ans)} V</b></p>`;}
 return{title:'Peak, peak-to-peak and RMS',prompt:`<p>${q}</p>`,svg:null,answer:num(ans,'V'),hints:['For a sine wave, Vrms = Vpk/√2 ≈ 0.707 × Vpk.','Peak-to-peak is twice the peak: Vpp = 2·Vpk.'],solution:sol,takeaway:'US mains is 120 V RMS, about 170 V peak. Meters read RMS; scopes show peak and peak-to-peak, so say which one you mean.'};});
def('ac','calc',()=>{
 const Vh=pick([3.3,5,12]),D=pick([0.1,0.2,0.25,0.4,0.5,0.75]),v=Math.random()<.55,avg=D*Vh,rms=Vh*Math.sqrt(D);
 return{title:'PWM average and RMS',prompt:`<p>A PWM signal switches between 0 V and ${Vh} V at ${D*100}% duty cycle. What is its ${v?'average (DC) value':'RMS value'}?</p>`,svg:null,answer:num(v?avg:rms,'V'),
 hints:['Duty cycle D is the fraction of each period the signal is high.',v?'Average = D × Vhigh: the area under the waveform divided by the period.':'RMS squares first, then averages, then takes the root: Vrms = √(D·Vhigh²) = Vhigh·√D.'],
 solution:`<p>Average = ${D} × ${Vh} = ${f2(avg)} V; RMS = ${Vh} × √${D} = ${f2(rms)} V</p><p>Answer: <b>${f2(v?avg:rms)} V</b></p>`,
 takeaway:'A DMM on DC shows the average of a PWM signal. That is why a filtered PWM pin works as a crude DAC.'};});
def('ac','calc',()=>{
 const v=ri(0,3);let q,ans,unit,sol,h;
 if(v===0){const vin=sig(rnd(0.05,1),2),G=pick([2,5,10,20,50,100,0.5,0.1]),vout=sig(vin*G,3);ans=20*Math.log10(vout/vin);unit='dB';q=`An amplifier turns a ${vin} V signal into ${vout} V. What is its voltage gain in dB?`;sol=`<p>Gain = 20·log₁₀(${vout}/${vin}) = <b>${f2(ans,1)} dB</b></p>`;h=['Voltage (and current) ratios use 20·log₁₀.','dB = 20·log₁₀(Vout/Vin).'];}
 else if(v===1){const pin=pick([1,2,5,10]),G=pick([2,4,10,100,0.5,0.25]),pout=sig(pin*G,3);ans=10*Math.log10(pout/pin);unit='dB';q=`A stage takes ${pin} mW in and delivers ${pout} mW out. What is its power gain in dB?`;sol=`<p>Gain = 10·log₁₀(${pout}/${pin}) = <b>${f2(ans,1)} dB</b></p>`;h=['Power ratios use 10·log₁₀, not 20.','Anchors: 2× power ≈ 3 dB, 10× = 10 dB.'];}
 else if(v===2){const dB=pick([-20,-6,-3,6,12,20,40]);ans=10**(dB/20);unit='×';q=`A filter’s response is ${dB} dB at some frequency. By what factor does it scale the voltage?`;sol=`<p>Ratio = 10^(${dB}/20) = <b>${f2(ans,3)}</b></p>`;h=['Reverse the voltage formula: ratio = 10^(dB/20).','Anchors: −3 dB ≈ 0.707, −6 dB ≈ 0.5, −20 dB = 0.1.'];}
 else{const dB=pick([3,10,13,20,30]);ans=10**(dB/10);unit='×';q=`An amplifier has ${dB} dB of power gain. By what factor does it multiply power?`;sol=`<p>Ratio = 10^(${dB}/10) = <b>${f2(ans,3)}</b></p>`;h=['Reverse the power formula: ratio = 10^(dB/10).','Every 10 dB is another 10×; 3 dB is about 2×.'];}
 return{title:'Decibels',prompt:`<p>${q}</p>`,svg:null,answer:num(ans,unit,unit==='dB'?{abs:0.15}:{tol:.03}),hints:h,solution:sol,takeaway:'Decibels turn multiplying gains into adding them, which is why link budgets and filter specs are written in dB.'};});
def('ac','calc',()=>{
 const v=Math.random()<.5;let ans,unit,q,sol;
 if(v){const P=pick([0.01,0.05,0.1,0.5,1,2,5,10,20,100]);ans=10*Math.log10(P);unit='dBm';q=`Convert ${P} mW to dBm.`;sol=`<p>dBm = 10·log₁₀(${P} mW / 1 mW) = <b>${f2(ans,1)} dBm</b></p>`;}
 else{const d=pick([-30,-20,-13,-10,-7,-3,0,3,5,10]);ans=10**(d/10);unit='mW';q=`An optic reports ${d} dBm of receive power. How many milliwatts is that?`;sol=`<p>P = 10^(${d}/10) mW = <b>${eng(ans/1000,'W')}</b></p>`;}
 return{title:'dBm',prompt:`<p>${q}</p>`,svg:null,answer:num(ans,unit,unit==='dBm'?{abs:0.15}:{tol:.03}),hints:['dBm is power relative to 1 mW: dBm = 10·log₁₀(P / 1 mW).','0 dBm = 1 mW; +10 dBm = 10 mW; −10 dBm = 0.1 mW; every 3 dB doubles or halves.'],solution:sol,takeaway:'Optical transceivers report Tx and Rx power in dBm through DOM. Reading those numbers fluently is routine in optics testing.'};});
def('ac','calc',()=>{
 const mm=Math.random()<.4,tx=sig(rnd(-4,1),2),km=mm?sig(rnd(0.1,0.4),2):pick([2,5,10,20]),loss=mm?3.0:0.35,nc=ri(2,4),cl=0.5,sens=mm?-11:pick([-14,-18,-20]),rx=tx-km*loss-nc*cl,v=Math.random()<.5;
 return{title:'Optical link budget',prompt:`<p>A ${mm?'multimode (850 nm)':'single-mode (1310 nm)'} link: transmitter ${tx} dBm, ${km} km of fiber at ${loss} dB/km, and ${nc} connectors at ${cl} dB each. Receiver sensitivity is ${sens} dBm. ${v?'What receive power do you expect?':'How much margin does the link have?'}</p>`,svg:null,answer:num(v?rx:rx-sens,v?'dBm':'dB',{abs:0.1}),
 hints:['In dB, losses simply subtract.',`Fiber loss = ${km} × ${loss} = ${f2(km*loss)} dB; connectors = ${nc} × ${cl} = ${f2(nc*cl)} dB.`,'Margin = expected receive power − receiver sensitivity.'],
 solution:`<p>Rx = ${tx} − ${f2(km*loss)} − ${f2(nc*cl)} = ${f2(rx)} dBm<br>Margin = ${f2(rx)} − (${sens}) = ${f2(rx-sens)} dB</p><p>Answer: <b>${v?f2(rx)+' dBm':f2(rx-sens)+' dB'}</b>${rx-sens<3?'. Under about 3 dB of margin is risky; dirty connectors alone can eat that.':''}</p>`,
 takeaway:'If an optic’s DOM receive power is far below this estimate, suspect dirty or damaged connectors before blaming the optic.'};});
def('ac','calc',()=>{
 const cap=Math.random()<.6,f=pick([60,1e3,10e3,100e3,1e6]);let X,q;
 if(cap){const C=pick([1e-9,10e-9,100e-9,1e-6,10e-6]);X=1/(2*Math.PI*f*C);q=`What is the reactance of a ${capv(C)} capacitor at ${eng(f,'Hz')}?`;}
 else{const L=pick([1e-6,10e-6,100e-6,1e-3,10e-3]);X=2*Math.PI*f*L;q=`What is the reactance of a ${eng(L,'H')} inductor at ${eng(f,'Hz')}?`;}
 const u=X>=1000?['kΩ',1e-3]:['Ω',1];
 return{title:'Reactance',prompt:`<p>${q}</p>`,svg:null,answer:num(X*u[1],u[0]),
 hints:[cap?'Capacitive reactance: Xc = 1/(2π·f·C). It falls as frequency rises.':'Inductive reactance: XL = 2π·f·L. It rises with frequency.','Work in base units (Hz, F, H), then convert the answer.'],
 solution:`<p>${cap?'Xc = 1/(2πfC)':'XL = 2πfL'} = <b>${ohm(X)}</b></p>`,takeaway:'Capacitors act like shorts at high frequency and opens at DC; inductors are the opposite. That one sentence explains decoupling, filters and flyback.'};});
def('ac','calc',()=>{const V=pick([12,24,120]),R=res(10,1000),P=V*V/R;return{title:'AC power',prompt:`<p>${V} V RMS is applied across a ${ohm(R)} resistor. What average power does it dissipate?</p>`,svg:null,answer:num(P,'W'),hints:['RMS is defined so the DC formulas still work: P = Vrms²/R.','Don’t use the peak voltage here.'],solution:`<p>P = ${V}² / ${ohm(R)} = <b>${eng(P,'W')}</b></p>`,takeaway:'That is the point of RMS: it is the DC-equivalent heating value.'};});
const ACQ=[
 ['An average-responding DMM reads a 5 V square wave incorrectly on its AC range. Why?','It assumes a sine and scales the average by 1.11; only a true-RMS meter handles other wave shapes',['Square waves have no RMS value','AC ranges only work above 1 kHz','The meter must be DC-coupled for square waves'],'Meters calibrated for sines measure something else and apply a correction factor.'],
 ['What does −3 dB mean at a filter’s cutoff frequency?','Half the power, or about 70.7% of the voltage',['Half the voltage','One third of the voltage','The signal is fully blocked'],'10·log₁₀(0.5) ≈ −3.'],
 ['Doubling the frequency does what to a capacitor’s reactance?','Halves it',['Doubles it','Leaves it unchanged','Quarters it'],'Xc = 1/(2πfC).'],
 ['An optic reports −40 dBm receive power while the far end transmits normally. Most likely?','No light is arriving: broken or disconnected fiber, or a badly contaminated connector',['The link is healthy; −40 dBm is strong','The receiver is saturated','The fiber is too short'],'−40 dBm is 0.1 µW.'],
 ['Why do engineers add decibels instead of multiplying gains?','Logarithms turn multiplication into addition, so cascaded gains and losses just sum',['dB values are more accurate','Gains cannot be multiplied','It removes the need for units'],'log(a·b) = log a + log b.'],
 ['A scope shows 10 Vpp on a sine wave. A true-RMS DMM on AC reads about…','3.54 V',['10 V','5 V','7.07 V'],'Vpk = 5 V, then divide by √2.']];
def('ac','concept',()=>{const m=pick(ACQ);return{title:'Signals and decibels',prompt:`<p>${m[0]}</p>`,svg:null,answer:mc(m[1],m[2]),hints:[m[3]],solution:`<p><b>${m[1]}.</b></p>`,takeaway:'Be precise about units: peak vs RMS, dB vs dBm. Interviewers notice.'};});
