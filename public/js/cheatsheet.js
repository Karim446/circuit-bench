"use strict";
/* ================= cheatsheet ================= */
const CHEAT=[
 ['Troubleshooting method',`<ol style="margin:0;padding-left:18px"><li>Predict expected node voltages</li><li>Check power, ground, current limit, heat</li><li>Measure along the path; half-split</li><li>List faults that match the reading exactly</li><li>Confirm with one test, fix, verify</li></ol>`],
 ['Fault signatures',`<table><tr><td>Node at full supply</td><td>no current: open downstream</td></tr><tr><td>Node at 0 V</td><td>short to ground, or open upstream</td></tr><tr><td>0 V across a resistor</td><td>its path is open</td></tr><tr><td>Whole supply across one part</td><td>that part is open</td></tr><tr><td>Off but not extreme</td><td>loading, wrong value, partly-on device</td></tr><tr><td>Op-amp output at rail</td><td>broken feedback, or real clipping</td></tr><tr><td>Rail low + supply in CC + warm cap</td><td>shorted capacitor</td></tr><tr><td>Drain/collector mid-supply, hot</td><td>transistor under-driven</td></tr></table>`],
 ['Units and anchors',`<ul><li>p 10⁻¹², n 10⁻⁹, µ 10⁻⁶, m 10⁻³, k 10³, M 10⁶</li><li>V/kΩ = mA; kΩ × µF = ms; kΩ × nF = µs</li><li>1 V across 1 kΩ = 1 mA = 1 mW</li></ul>`],
 ['DC formulas',`<ul><li>V = IR; P = VI = I²R = V²/R</li><li>Series: R1 + R2. Parallel: R1R2/(R1 + R2), less than the smallest</li><li>KCL: in = out at a node. KVL: drops = supply around a loop</li><li>Derate resistors to ≤ 50% of rating (¼ W common)</li></ul>`],
 ['Divider, loading, Thevenin',`<ul><li>Vout = Vin·R2/(R1 + R2)</li><li>Loaded: use R2‖RL in place of R2</li><li>Vth = open-circuit V; Rth = R with sources shorted</li><li>Divider Rth = R1‖R2; keep RL ≥ 10·Rth</li><li>Vload = Vth·RL/(Rth + RL)</li></ul>`],
 ['Diodes and LEDs',`<table><tr><td>Silicon</td><td>≈ 0.7 V</td></tr><tr><td>Schottky</td><td>≈ 0.3 V</td></tr><tr><td>Red / yellow</td><td>≈ 2.0 V</td></tr><tr><td>Green</td><td>≈ 2.2 V</td></tr><tr><td>Blue / white</td><td>≈ 3.0–3.1 V</td></tr></table><ul><li>R = (Vs − Vf)/I, round up</li><li>LED reverse rating ≈ 5 V</li><li>Flyback diode across coil, cathode to +V</li></ul>`],
 ['Zener regulator',`<ul><li>Regulates only if Vs·RL/(RS + RL) > Vz</li><li>IS = (Vs − Vz)/RS; IL = Vz/RL; Iz = IS − IL</li><li>Zener power = Vz·Iz</li></ul>`],
 ['BJT switch',`<ul><li><b>Active region: Ic = β·Ib</b></li><li><b>Ie = Ic + Ib = (β + 1)·Ib</b></li><li>α = Ic/Ie = β/(β + 1) ≈ 1, so Ic ≈ Ie</li><li>VBE ≈ 0.7 V; VCE(sat) ≈ 0.2 V</li><li>Ic(sat) = (Vcc − 0.2)/RC</li><li>Saturated if β·Ib ≥ Ic(sat)</li><li>RB = (Vin − 0.7)/(k·Ic/β_min), k = 5–10; round down</li></ul>`],
 ['MOSFET switch',`<ul><li>VGS(th) = barely on; check RDS(on) at your actual VGS</li><li>3.3 V drive needs a logic-level part</li><li>Gate pull-down 10–100 kΩ; gate resistor 10–100 Ω</li><li>N-channel on the low side: VGS = gate voltage</li><li>Heat = I²·RDS(on)</li></ul>`],
 ['Op-amps',`<table><tr><td>Inverting</td><td>−RF/RIN</td></tr><tr><td>Non-inverting</td><td>1 + RF/RG</td></tr><tr><td>Follower</td><td>1 (buffer)</td></tr><tr><td>Comparator</td><td>rail by sign of V+ − V−</td></tr><tr><td>TIA</td><td>Vout = I·RF</td></tr></table><ul><li>Feedback ⇒ V− = V+, no input current</li><li>Output never exceeds the rails</li></ul>`],
 ['RC and filters',`<table><tr><td>1τ</td><td>63%</td></tr><tr><td>2.2τ</td><td>90% (10–90% rise time)</td></tr><tr><td>3τ</td><td>95%</td></tr><tr><td>5τ</td><td>99%</td></tr></table><ul><li>τ = RC; Vc = Vs(1 − e^(−t/τ)); t = −τ·ln(1 − x)</li><li>fc = 1/(2πRC); −20 dB/decade above</li><li>DC steady state: cap = open; at a step: uncharged cap = short</li><li>100 nF decoupling at every IC power pin</li></ul>`],
 ['Signals, AC and dB',`<ul><li>Sine: Vrms = Vpk/√2 ≈ 0.707·Vpk; Vpp = 2·Vpk</li><li>PWM 0–V: average D·V, RMS V·√D</li><li>f = 1/T; P = Vrms²/R</li><li>Xc = 1/(2πfC); XL = 2πfL</li></ul><table><tr><th>dB</th><th>Power ×</th><th>Voltage ×</th></tr><tr><td>3</td><td>2</td><td>1.41</td></tr><tr><td>6</td><td>4</td><td>2</td></tr><tr><td>10</td><td>10</td><td>3.16</td></tr><tr><td>20</td><td>100</td><td>10</td></tr></table><ul><li>Power dB = 10·log₁₀; voltage dB = 20·log₁₀</li><li>dBm = 10·log₁₀(P/1 mW); 0 dBm = 1 mW</li><li>Rx = Tx − losses; margin = Rx − sensitivity</li><li>SM ≈ 0.35 dB/km @1310; MM ≈ 3 dB/km @850; connector ≈ 0.5 dB</li></ul>`],
 ['Linux for diagnostics',`<table><tr><td><code>dmesg | grep -i err</code></td><td>kernel errors</td></tr><tr><td><code>journalctl -k -f</code></td><td>follow kernel log</td></tr><tr><td><code>lspci -vv</code>, <code>lsusb</code></td><td>enumerated devices</td></tr><tr><td><code>i2cdetect -y 1</code></td><td>scan I²C bus 1</td></tr><tr><td><code>i2cget -y 1 0x48 0x00</code></td><td>read a register</td></tr><tr><td><code>ethtool eth0</code> / <code>-S</code></td><td>link settings / counters</td></tr><tr><td><code>ip -s link</code></td><td>interfaces and stats</td></tr><tr><td><code>cat /sys/class/net/eth0/carrier</code></td><td>link up (1) or down (0)</td></tr><tr><td><code>grep -c PASS log</code></td><td>count matches</td></tr><tr><td><code>awk '{print $3}'</code></td><td>third column</td></tr><tr><td><code>sort | uniq -c | sort -rn</code></td><td>count and rank</td></tr><tr><td><code>tail -f log</code></td><td>watch a file</td></tr><tr><td><code>watch -n1 cmd</code></td><td>rerun every second</td></tr><tr><td colspan="2" class="note">Practice all of these in the Linux tab.</td></tr><tr><td><code>ps aux | grep py</code></td><td>find a process</td></tr><tr><td><code>chmod +x run.sh</code></td><td>make executable</td></tr></table><pre>import subprocess
out = subprocess.run(["ethtool", "eth0"],
    capture_output=True, text=True).stdout</pre>`],
 ['Logic levels',`<table><tr><th></th><th>V_IH</th><th>V_IL</th></tr><tr><td>3.3 V CMOS</td><td>2.31</td><td>0.99</td></tr><tr><td>5 V CMOS</td><td>3.5</td><td>1.5</td></tr><tr><td>TTL-level</td><td>2.0</td><td>0.8</td></tr></table><ul><li>3.3 V → 5 V CMOS: not guaranteed</li><li>5 V → 3.3 V: only if 5 V-tolerant</li><li>Floating input = undefined; add a pull</li></ul>`],
 ['Pull-ups and edges',`<ul><li>Open-drain only pulls low; needs a pull-up</li><li>tr ≈ 2.2·R·C (rise slow, fall fast)</li><li>R ≥ VCC/I_sink; R ≤ tr(max)/(2.2·C)</li><li>Internal pull-ups ≈ 20–50 kΩ: too weak for fast lines</li></ul>`],
 ['Power',`<table><tr><th></th><th>Linear</th><th>Buck</th></tr><tr><td>Heat</td><td>(Vin − Vout)·I</td><td>≈ 5–15% of Pout</td></tr><tr><td>Efficiency</td><td>Vout/Vin</td><td>85–95%</td></tr><tr><td>Noise</td><td>quiet</td><td>switching ripple</td></tr><tr><td>Formula</td><td>Vin ≥ Vout + dropout</td><td>Vout = D·Vin</td></tr></table><ul><li>Iin(buck) = Vout·Iout/(η·Vin)</li><li>Bench supply CC light = current limit hit</li></ul>`],
 ['DMM rules',`<ul><li>V: parallel, powered. A: series, break the circuit</li><li>Ω and continuity: power off, lift a leg</li><li>Diode mode: shows Vf; OL in reverse</li><li>Meter input ≈ 10 MΩ: loads high-Z nodes</li><li>Leads still in the A jack + voltage = blown fuse</li></ul>`],
 ['Scope rules',`<ul><li>Ground clip to circuit ground only (it is earthed)</li><li>Match probe and channel (1× / 10×)</li><li>AC coupling for small ripple on DC</li><li>Unstable trace: fix trigger source and level</li><li>Ringing on edges: shorten the ground lead, check bandwidth</li></ul>`],
 ['Resistor color code',`<table><tr><td>0 black</td><td>1 brown</td><td>2 red</td><td>3 orange</td><td>4 yellow</td></tr><tr><td>5 green</td><td>6 blue</td><td>7 violet</td><td>8 gray</td><td>9 white</td></tr></table><p style="margin:6px 0 0">Band 1, band 2, multiplier (number of zeros), tolerance (gold 5%, silver 10%). Brown-black-red = 1 kΩ; yellow-violet-orange = 47 kΩ.</p><p style="margin:4px 0 0">E12: 10 12 15 18 22 27 33 39 47 56 68 82</p>`],
 ['Python for test scripts',`<pre>counts = {}
with open("log.txt") as f:
    for line in f:
        if "ERROR" in line:
            port = line.split()[2]
            counts[port] = counts.get(port, 0) + 1</pre><pre>import re
m = re.search(r"freq=(\\d+\\.?\\d*)", line)
if m: freq = float(m.group(1))</pre><pre>import csv
for row in csv.DictReader(open("meas.csv")):
    v = float(row["volts"])
    if not 3.2 &lt;= v &lt;= 3.4: print("FAIL", row)</pre><pre>reg = 0x5A
bit3 = (reg >> 3) &amp; 1
reg |= 1 &lt;&lt; 7      # set bit 7
reg &amp;= ~(1 &lt;&lt; 1)   # clear bit 1</pre><pre>import pyvisa, time
psu = pyvisa.ResourceManager().open_resource(addr)
psu.write("VOLT 5"); time.sleep(0.2)
i = float(psu.query("MEAS:CURR?"))
assert i &lt; 0.35, f"over-current: {i} A"</pre><pre>import serial
s = serial.Serial("COM3", 9600, timeout=1)
s.write(b"PING\\n"); reply = s.readline()</pre>`],
 ['Interview phrasing',`<ul><li>“First I’d predict what this node should read…”</li><li>“That reading fits two faults; I’d separate them by…”</li><li>“Before blaming the circuit I’d check the supply isn’t current-limiting.”</li><li>“I’d swap one thing at a time so I know which change fixed it.”</li><li>“Then I’d document repro steps, versions and readings in the bug.”</li></ul>`]];

/* ---------- copy / save / share schematic images ---------- */
const EXPORT_VARS='--paper:#FFFFFF;--grid:#E3E9EF;--grid2:#CCD8E3;--ink:#1C2B3A;--ink2:#566778;--line:#BCC9D5;--probe:#C8202A;--hl:#B3DFF7;--ok:#1E7A55;--okbg:#E1F2E9;--badbg:#FBE6E6;--panel:#FFFFFF';
function svgMarkup(svg){
 const holder=document.createElement('div');holder.style.cssText=EXPORT_VARS+';position:fixed;left:-10000px;top:0;';
 const c=svg.cloneNode(true);holder.appendChild(c);document.body.appendChild(holder);
 c.querySelectorAll('.hit,.whit').forEach(e=>e.remove());
 const vb=c.viewBox.baseVal;c.setAttribute('width',vb.width);c.setAttribute('height',vb.height);c.setAttribute('xmlns','http://www.w3.org/2000/svg');
 const props=['fill','stroke','stroke-width','stroke-dasharray','stroke-linecap','stroke-linejoin','font-size','font-family','font-weight','opacity','display','text-anchor'];
 [c,...c.querySelectorAll('*')].forEach(el=>{const cs=getComputedStyle(el);el.setAttribute('style',props.map(k=>`${k}:${cs.getPropertyValue(k)}`).join(';'));});
 const xml=new XMLSerializer().serializeToString(c);holder.remove();return{xml,w:vb.width,h:vb.height};}
function svgPng(svg,scale=3){const{xml,w,h}=svgMarkup(svg);return new Promise((res,rej)=>{const img=new Image();img.onload=()=>{try{const cv=document.createElement('canvas');cv.width=Math.round(w*scale);cv.height=Math.round(h*scale);const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);x.drawImage(img,0,0,cv.width,cv.height);cv.toBlob(b=>b?res(b):rej(new Error('blob')),'image/png');}catch(e){rej(e);}};img.onerror=rej;img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml);});}
const slug=s=>(s||'circuit').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'circuit';
function downloadBlob(b,name){const u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);}
const canShareFiles=(()=>{try{return !!(navigator.canShare&&navigator.canShare({files:[new File([''],'x.png',{type:'image/png'})]}));}catch(e){return false;}})();
function attachTools(root,name){if(typeof document==='undefined')return;root.querySelectorAll('.sheet').forEach(sh=>{if(sh.querySelector(':scope>.sheet-tools'))return;const svg=sh.querySelector('svg');if(!svg)return;
 const t=document.createElement('div');t.className='sheet-tools';t.innerHTML=`<button type="button" data-a="copy">Copy</button><button type="button" data-a="save">Save PNG</button>${canShareFiles?'<button type="button" data-a="share">Share</button>':''}`;
 t.onclick=async e=>{const a=e.target.dataset.a;if(!a)return;const s=sh.querySelector('svg'),fn=slug(sh.dataset.name||name)+'.png';
  try{if(a==='copy'){await navigator.clipboard.write([new ClipboardItem({'image/png':svgPng(s)})]);toast('Copied. Paste it into your notes.');}
   else if(a==='save'){downloadBlob(await svgPng(s),fn);}
   else{const b=await svgPng(s);await navigator.share({files:[new File([b],fn,{type:'image/png'})],title:sh.dataset.name||'Circuit'});}}
  catch(err){if(err&&err.name==='AbortError')return;if(a==='copy'){toast('Copy isn’t allowed in this browser. Saving the image instead.');try{downloadBlob(await svgPng(s),fn);}catch(e2){downloadBlob(new Blob([svgMarkup(s).xml],{type:'image/svg+xml'}),fn.replace('.png','.svg'));}}else{downloadBlob(new Blob([svgMarkup(s).xml],{type:'image/svg+xml'}),fn.replace('.png','.svg'));}}};
 sh.appendChild(t);});}
