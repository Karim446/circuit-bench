"use strict";
/* ================= mock Linux shell ================= */
const SH_HOME='/home/karim';
function shData(){
 const burn=[];const ev=[['PCIE_AER_CORRECTABLE',5],['ECC_CORRECTED',3],['FAN_TACH_LOW',2],['I2C_NAK',1]];let m=0;
 const seq=['PCIE_AER_CORRECTABLE','INFO','ECC_CORRECTED','PCIE_AER_CORRECTABLE','INFO','FAN_TACH_LOW','PCIE_AER_CORRECTABLE','ECC_CORRECTED','INFO','I2C_NAK','PCIE_AER_CORRECTABLE','INFO','FAN_TACH_LOW','ECC_CORRECTED','PCIE_AER_CORRECTABLE','INFO'];
 seq.forEach((e,i)=>{m+=7;const t=`2026-11-03 0${2+Math.floor(m/60)}:${String(m%60).padStart(2,'0')}:${String((i*13)%60).padStart(2,'0')}`;burn.push(e==='INFO'?`${t} slot${1+i%4} INFO loop ${i+1} complete`:`${t} slot${[3,1,3,2][i%4]} ERR ${e}`);});
 const kern=['[    0.000000] Linux version 6.8.0-45-generic (buildd@lcy02) #45-Ubuntu SMP',
 '[    1.204511] pcieport 0000:00:1c.0: AER: enabled with IRQ 122',
 '[    2.104512] ixgbe 0000:03:00.0 eth0: NIC Link is Down',
 '[    3.881020] i2c i2c-1: Synopsys DesignWare I2C adapter',
 '[   12.345678] ixgbe 0000:03:00.0 eth0: NIC Link is Up 10 Gbps, Flow Control: RX/TX',
 '[   13.000100] usb 1-1: new high-speed USB device number 2 using xhci_hcd',
 '[   15.500000] igb 0000:04:00.0 eth1: igb: eth1 NIC Link is Up 1000 Mbps Full Duplex',
 '[   41.002233] pcieport 0000:00:1c.0: AER: Corrected error received: 0000:03:00.0',
 '[   41.002240] ixgbe 0000:03:00.0: PCIe Bus Error: severity=Corrected, type=Physical Layer',
 '[   57.118812] i2c_designware i2c-1: controller timed out',
 '[   57.118830] tmp102 1-0048: error reading temperature: -110',
 '[   88.400100] EXT4-fs (nvme0n1p2): mounted filesystem with ordered data mode',
 '[  120.010010] ixgbe 0000:03:00.0 eth0: NIC Link is Down',
 '[  121.700300] ixgbe 0000:03:00.0 eth0: NIC Link is Up 10 Gbps, Flow Control: RX/TX',
 '[  300.555000] mce: [Hardware Error]: Machine check events logged',
 '[  301.000000] EDAC MC0: 1 CE memory read error on CPU_SrcID#0_Ha#0_Chan#1_DIMM#0',
 '[  450.123456] igb 0000:04:00.0 eth1: Detected Tx Unit Hang',
 '[  452.000001] nvme nvme0: I/O 412 QID 3 timeout, aborting'];
 const cpu=[0,1,2,3].map(i=>`processor\t: ${i}\nvendor_id\t: GenuineIntel\nmodel name\t: Intel(R) Atom(TM) C3758 @ 2.20GHz\ncpu MHz\t\t: 2200.000\n`).join('\n');
 return{
 '/home/karim/results.csv':'serial,volts,status\nSN1001,3.31,PASS\nSN1002,3.29,PASS\nSN1003,3.47,FAIL\nSN1004,3.30,PASS\nSN1005,3.12,FAIL\nSN1006,3.33,PASS\nSN1007,3.28,PASS\nSN1008,0.00,FAIL\nSN1009,3.32,PASS\nSN1010,3.30,PASS\n',
 '/home/karim/notes.txt':'TODO\n- rerun burn-in on slot3\n- check eth2 cabling\n- ask about the PSU current limit\n',
 '/home/karim/run_tests.py':'#!/usr/bin/env python3\nimport subprocess\n\nout = subprocess.run(["ethtool", "eth0"], capture_output=True, text=True).stdout\nprint("Link detected: yes" in out)\n',
 '/var/log/kern.log':kern.join('\n')+'\n',
 '/var/log/syslog':['Nov  3 10:00:01 dut-07 systemd[1]: Started Daily apt download activities.','Nov  3 10:02:14 dut-07 diagd[812]: starting burn-in on slots 1-4','Nov  3 10:05:44 dut-07 diagd[812]: slot3 reported PCIE_AER_CORRECTABLE','Nov  3 10:30:00 dut-07 CRON[2201]: (root) CMD (/usr/local/bin/collect_stats)','Nov  3 11:12:09 dut-07 diagd[812]: burn-in loop 16 complete','Nov  3 11:15:31 dut-07 kernel: [  452.000001] nvme nvme0: I/O 412 QID 3 timeout, aborting'].join('\n')+'\n',
 '/var/log/diag/burnin.log':burn.join('\n')+'\n',
 '/var/log/diag/memtest.log':'pattern walking_ones   PASS\npattern walking_zeros  PASS\npattern checkerboard   FAIL addr=0x7f3a1040 expected=0xAA got=0xA8\npattern random         PASS\n',
 '/etc/hostname':'dut-07\n','/etc/os-release':'PRETTY_NAME="Ubuntu 24.04 LTS"\nNAME="Ubuntu"\nVERSION_ID="24.04"\n',
 '/proc/cpuinfo':cpu,'/proc/uptime':'86412.27 341022.10\n','/proc/loadavg':'0.42 0.37 0.31 1/212 2307\n',
 '/sys/class/net/eth0/carrier':'1\n','/sys/class/net/eth0/operstate':'up\n','/sys/class/net/eth0/speed':'10000\n',
 '/sys/class/net/eth1/carrier':'1\n','/sys/class/net/eth1/operstate':'up\n','/sys/class/net/eth1/speed':'1000\n',
 '/sys/class/net/eth2/carrier':'0\n','/sys/class/net/eth2/operstate':'down\n','/sys/class/net/eth2/speed':'-1\n',
 '/sys/bus/i2c/devices/1-0048/name':'tmp102\n','/sys/bus/i2c/devices/1-0050/name':'24c02\n','/sys/bus/i2c/devices/1-0068/name':'ds1307\n'};}
const SH_NET={eth0:{mac:'28:99:3a:4f:10:01',up:true,speed:'10000Mb/s',port:'FIBRE',drv:'ixgbe',bus:'0000:03:00.0',ip:'10.20.0.17/24',rx:918273645,tx:772001234,rxp:8813377,txp:7120034,crc:0,fifo:0},
 eth1:{mac:'28:99:3a:4f:10:02',up:true,speed:'1000Mb/s',port:'Twisted Pair',drv:'igb',bus:'0000:04:00.0',ip:'192.168.1.17/24',rx:120044321,tx:98123007,rxp:990123,txp:801223,crc:1287,fifo:12},
 eth2:{mac:'28:99:3a:4f:10:03',up:false,speed:'Unknown!',port:'FIBRE',drv:'ixgbe',bus:'0000:03:00.1',ip:null,rx:0,tx:0,rxp:0,txp:0,crc:0,fifo:0}};
const SH_DOCS={ls:'list directory contents (-l long, -a all)',cd:'change directory',pwd:'print working directory',cat:'print files',head:'first lines (-n N)',tail:'last lines (-n N, -n +N from line N)',grep:'search text (-i ignore case, -v invert, -c count, -n line numbers, -E extended, -o only match, -r recursive, -w word)',wc:'count lines/words/chars (-l -w -c)',sort:'sort lines (-n numeric, -r reverse, -u unique, -k N field, -t sep)',uniq:'collapse repeated adjacent lines (-c count). Usually after sort',cut:'pick fields (-d delimiter -f list) or characters (-c)',tr:'translate or delete characters (tr a-z A-Z, tr -d ",")',sed:"stream editor: s/old/new/g, -n 'Np', '/re/d'",awk:"field processing: awk -F, 'NR>1 {print $1}'",find:"find files: find /var/log -name '*.log' -type f",echo:'print text',dmesg:'kernel ring buffer',lspci:'list PCI devices',lsusb:'list USB devices',ip:'ip link | ip addr | ip -s link',ethtool:'ethtool IFACE | -S IFACE (counters) | -i IFACE (driver)',i2cdetect:'scan an I²C bus: i2cdetect -y 1 (-l lists buses)',i2cget:'read a register: i2cget -y BUS ADDR REG',i2cset:'write a register: i2cset -y BUS ADDR REG VALUE',sensors:'hardware sensor readings',uptime:'time since boot',free:'memory usage (-h)',df:'disk usage (-h)',ps:'processes (ps aux)',history:'previous commands',clear:'clear the screen',whoami:'current user',hostname:'machine name',uname:'kernel info (-a)',touch:'create an empty file',rm:'remove a file',tee:'copy stdin to a file and stdout',watch:'rerun a command periodically',man:'show help for a command',help:'list commands'};
function mkShell(){
 const S={cwd:SH_HOME,fs:shData(),hist:[],i2c:{1:{0x48:{0:0x1a,1:0x60,2:0x4b,3:0x50},0x50:{0:0xde,1:0xad,2:0xbe,3:0xef},0x68:{0:0x12}},0:{}}};
 const abs=p=>{if(!p)return S.cwd;if(p==='~'||p.startsWith('~/'))p=SH_HOME+p.slice(1);const parts=(p.startsWith('/')?p:S.cwd+'/'+p).split('/'),o=[];for(const x of parts){if(!x||x==='.')continue;if(x==='..')o.pop();else o.push(x);}return '/'+o.join('/');};
 const isDir=p=>p==='/'||Object.keys(S.fs).some(f=>f.startsWith(p+'/'));
 const ls=p=>{const pre=p==='/'?'/':p+'/',set=new Set();for(const f of Object.keys(S.fs))if(f.startsWith(pre))set.add(f.slice(pre.length).split('/')[0]);return[...set].sort();};
 const read=p=>{const a=abs(p);if(a in S.fs)return S.fs[a];if(isDir(a))throw new Error(`${p}: Is a directory`);throw new Error(`${p}: No such file or directory`);};
 const lines=t=>{const L=t.split('\n');if(L.length&&L[L.length-1]==='')L.pop();return L;};
 const join=L=>L.length?L.join('\n')+'\n':'';
 const glob2re=g=>new RegExp('^'+g.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'[^/]*').replace(/\?/g,'[^/]')+'$');
 const flagsOf=(args,known)=>{const f={},rest=[];for(let i=0;i<args.length;i++){const a=args[i];if(a==='--'){rest.push(...args.slice(i+1));break;}if(/^-[A-Za-z]+$/.test(a)&&a.length>1&&[...a.slice(1)].every(c=>known.includes(c)))[...a.slice(1)].forEach(c=>f[c]=true);else rest.push(a);}return{f,rest};};
 const numv=s=>{const m=/^\s*([-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?)/.exec(s);return m?parseFloat(m[1]):0;};
 function bre(p){let o='';for(let i=0;i<p.length;i++){const c=p[i];if(c==='\\'&&i+1<p.length){const n=p[++i];o+='|(){}+?'.includes(n)?n:'\\'+n;}else o+='|(){}+?'.includes(c)?'\\'+c:c;}return o;}
 const C={};
 C.help=()=>({out:'Commands: '+Object.keys(SH_DOCS).sort().join(', ')+'\nPipes (|), redirection (> and >>), ; and && all work. Try: man grep\n'});
 C.man=a=>a[0]&&SH_DOCS[a[0]]?{out:`${a[0]}: ${SH_DOCS[a[0]]}\n`}:{err:`No manual entry for ${a[0]||'(nothing)'}\n`,code:1};
 C.echo=a=>{let n=false;if(a[0]==='-n'){n=true;a=a.slice(1);}if(a[0]==='-e')a=a.slice(1);return{out:a.join(' ')+(n?'':'\n')};};
 C.pwd=()=>({out:S.cwd+'\n'});
 C.cd=a=>{const p=abs(a[0]||'~');if(!isDir(p))return{err:`cd: ${a[0]}: No such file or directory\n`,code:1};S.cwd=p;return{out:''};};
 C.ls=a=>{const{f,rest}=flagsOf(a,'la1h');const ps=rest.length?rest:['.'];let o='';
  ps.forEach((p,k)=>{const P=abs(p);if(P in S.fs){o+=(f.l?`-rw-r--r-- 1 karim karim ${String(S.fs[P].length).padStart(6)} Nov  3 10:00 `:'')+p+'\n';return;}if(!isDir(P)){o+=`ls: cannot access '${p}': No such file or directory\n`;return;}
   if(ps.length>1)o+=(k?'\n':'')+p+':\n';const items=ls(P);
   if(f.l)o+=`total ${items.length*4}\n`+items.map(n=>{const full=(P==='/'?'':P)+'/'+n,d=!(full in S.fs);return `${d?'drwxr-xr-x':'-rw-r--r--'} ${d?2:1} karim karim ${String(d?4096:S.fs[full].length).padStart(6)} Nov  3 10:00 ${n}`;}).join('\n')+'\n';
   else o+=items.join(f['1']?'\n':'  ')+'\n';});return{out:o};};
 C.cat=(a,inp)=>{if(!a.length||a[0]==='-')return{out:inp};let o='';for(const p of a)o+=read(p);return{out:o};};
 const nOpt=(a,def)=>{let n=def,plus=false;const rest=[];for(let i=0;i<a.length;i++){const x=a[i];if(x==='-n'){const v=a[++i]||'';plus=v.startsWith('+');n=parseInt(v);}else if(/^-n[+]?\d+$/.test(x)){plus=x[2]==='+';n=parseInt(x.slice(2));}else if(/^-\d+$/.test(x))n=parseInt(x.slice(1));else if(x==='-f'){}else rest.push(x);}return{n:Math.abs(n),plus,rest};};
 C.head=(a,inp)=>{const{n,rest}=nOpt(a,10);const t=rest.length?rest.map(read).join(''):inp;return{out:join(lines(t).slice(0,n))};};
 C.tail=(a,inp)=>{const{n,plus,rest}=nOpt(a,10);const t=rest.length?rest.map(read).join(''):inp;const L=lines(t);let note=a.includes('-f')?'(tail -f follows a file live; in this simulated shell it shows the current end and returns)\n':'';return{out:join(plus?L.slice(Math.max(0,n-1)):L.slice(-n||L.length)),err:note};};
 C.grep=(a,inp)=>{const known='ivcnEorhwFl';let f={},pat=null,files=[],A=0,Bc=0;for(let i=0;i<a.length;i++){const x=a[i];if(x==='-e'){pat=a[++i];continue;}let cm=/^-([ABC])(\d*)$/.exec(x);if(cm){const nv=cm[2]?+cm[2]:+a[++i];if(cm[1]!=='B')A=nv;if(cm[1]!=='A')Bc=nv;continue;}if(/^-[A-Za-z]+$/.test(x)&&[...x.slice(1)].every(c=>known.includes(c))){[...x.slice(1)].forEach(c=>f[c]=true);continue;}if(pat===null)pat=x;else files.push(x);}
  if(pat===null)return{err:'Usage: grep [OPTION]... PATTERNS [FILE]...\n',code:2};
  let src=f.F?pat.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'):f.E?pat:bre(pat);if(f.w)src=`\\b(?:${src})\\b`;let re;try{re=new RegExp(src,f.i?'i':'');}catch(e){return{err:`grep: invalid pattern: ${pat}\n`,code:2};}
  let srcs=[];if(files.length){for(const p of files){const P=abs(p);if(isDir(P)){if(!f.r){srcs.push({name:p,err:`grep: ${p}: Is a directory\n`});continue;}Object.keys(S.fs).filter(k=>k.startsWith(P+'/')).sort().forEach(k=>srcs.push({name:k,text:S.fs[k]}));}else{try{srcs.push({name:p,text:read(p)});}catch(e){srcs.push({name:p,err:`grep: ${e.message}\n`});}}}}else srcs=[{name:'(stdin)',text:inp}];
  const multi=srcs.length>1&&!f.h;let o='',err='',any=false;
  for(const s of srcs){if(s.err){err+=s.err;continue;}const L=lines(s.text);let c=0;const hitI=[];L.forEach((l,i)=>{if(re.test(l)!==!!f.v)hitI.push(i);});c=hitI.length;if(c)any=true;
   if(!f.c&&!f.l){if(A||Bc){const show=new Set();hitI.forEach(i=>{for(let k=Math.max(0,i-Bc);k<=Math.min(L.length-1,i+A);k++)show.add(k);});let last=-2;[...show].sort((x,y)=>x-y).forEach(k=>{if(last>=0&&k>last+1)o+='--\n';const hit=hitI.includes(k);o+=(multi?s.name+(hit?':':'-'):'')+(f.n?(k+1)+(hit?':':'-'):'')+L[k]+'\n';last=k;});}
    else hitI.forEach(i=>{const l=L[i],pre=(multi?s.name+':':'')+(f.n?(i+1)+':':'');if(f.o&&!f.v){const g=new RegExp(re.source,re.flags+'g');(l.match(g)||[]).forEach(mm=>o+=pre+mm+'\n');}else o+=pre+l+'\n';});}
   if(f.c)o+=(multi?s.name+':':'')+c+'\n';else if(f.l&&c)o+=s.name+'\n';}
  return{out:o,err,code:any?0:1};};
 C.wc=(a,inp)=>{const{f,rest}=flagsOf(a,'lwc');const one=t=>{const l=(t.match(/\n/g)||[]).length,w=(t.match(/\S+/g)||[]).length,c=t.length;const parts=[];if(f.l||(!f.l&&!f.w&&!f.c))parts.push(l);if(f.w||(!f.l&&!f.w&&!f.c))parts.push(w);if(f.c||(!f.l&&!f.w&&!f.c))parts.push(c);return parts;};
  if(!rest.length){const p=one(inp);return{out:p.join(' ')+'\n'};}let o='';const tot=[0,0,0];rest.forEach(p=>{const v=one(read(p));v.forEach((x,i)=>tot[i]+=x);o+=v.map(x=>String(x).padStart(p.length>1?7:0)).join(' ')+' '+p+'\n';});if(rest.length>1)o+=tot.slice(0,one('').length).join(' ')+' total\n';return{out:o};};
 C.sort=(a,inp)=>{let f={},k=null,t=null,files=[];for(let i=0;i<a.length;i++){const x=a[i];if(x==='-k'){k=parseInt(a[++i]);continue;}if(/^-k\d+/.test(x)){k=parseInt(x.slice(2));continue;}if(x==='-t'){t=a[++i];continue;}if(/^-t./.test(x)){t=x.slice(2);continue;}if(/^-[nrufh]+$/.test(x)){[...x.slice(1)].forEach(c=>f[c]=true);continue;}files.push(x);}
  let L=lines(files.length?files.map(read).join(''):inp);const key=l=>{if(!k)return l;const parts=t?l.split(t):l.trim().split(/\s+/);return parts.slice(k-1).join(t||' ');};
  L=L.map((l,i)=>({l,i,k:key(l)}));L.sort((x,y)=>{let r;if(f.n||f.h)r=numv(x.k)-numv(y.k);else{const X=f.f?x.k.toLowerCase():x.k,Y=f.f?y.k.toLowerCase():y.k;r=X<Y?-1:X>Y?1:0;}if(!r&&!f.n)r=0;return(f.r?-r:r)||(x.i-y.i);});
  let out=L.map(x=>x.l);if(f.u)out=out.filter((l,i)=>i===0||l!==out[i-1]);return{out:join(out)};};
 C.uniq=(a,inp)=>{const{f,rest}=flagsOf(a,'cdu');const L=lines(rest.length?read(rest[0]):inp),g=[];for(const l of L){if(g.length&&g[g.length-1].l===l)g[g.length-1].n++;else g.push({l,n:1});}
  return{out:join(g.filter(x=>f.d?x.n>1:f.u?x.n===1:true).map(x=>f.c?`${String(x.n).padStart(7)} ${x.l}`:x.l))};};
 const ranges=(spec,max)=>{const s=new Set();for(const part of spec.split(',')){const m=/^(\d*)-(\d*)$/.exec(part);if(m){const a=m[1]?+m[1]:1,b=m[2]?+m[2]:max;for(let i=a;i<=b;i++)s.add(i);}else s.add(+part);}return[...s].sort((x,y)=>x-y);};
 C.cut=(a,inp)=>{let d='\t',fl=null,cl=null,files=[];for(let i=0;i<a.length;i++){const x=a[i];if(x==='-d')d=a[++i];else if(x.startsWith('-d'))d=x.slice(2);else if(x==='-f')fl=a[++i];else if(x.startsWith('-f'))fl=x.slice(2);else if(x==='-c')cl=a[++i];else if(x.startsWith('-c'))cl=x.slice(2);else files.push(x);}
  if(!fl&&!cl)return{err:'cut: you must specify a list of bytes, characters, or fields\n',code:1};const L=lines(files.length?files.map(read).join(''):inp);
  return{out:join(L.map(l=>{if(cl){const r=ranges(cl,l.length);return r.map(i=>l[i-1]||'').join('');}if(!l.includes(d))return l;const p=l.split(d);return ranges(fl,p.length).filter(i=>i<=p.length).map(i=>p[i-1]).join(d);}))};};
 const trSet=s=>{s=s.replace(/\\n/g,'\n').replace(/\\t/g,'\t');let o='';for(let i=0;i<s.length;i++){if(s[i+1]==='-'&&i+2<s.length){for(let c=s.charCodeAt(i);c<=s.charCodeAt(i+2);c++)o+=String.fromCharCode(c);i+=2;}else o+=s[i];}return o;};
 C.tr=(a,inp)=>{if(a[0]==='-d'){const set=trSet(a[1]||'');return{out:[...inp].filter(c=>!set.includes(c)).join('')};}if(a[0]==='-s'){const set=trSet(a[1]||'');let o='';for(const c of inp)if(!(set.includes(c)&&o.endsWith(c)))o+=c;return{out:o};}const A=trSet(a[0]||''),B=trSet(a[1]||'');return{out:[...inp].map(c=>{const i=A.indexOf(c);return i<0?c:(B[Math.min(i,B.length-1)]??c);}).join('')};};
 C.sed=(a,inp)=>{let n=false,E=false,scripts=[],files=[];for(let i=0;i<a.length;i++){const x=a[i];if(x==='-n')n=true;else if(x==='-E'||x==='-r')E=true;else if(x==='-e')scripts.push(a[++i]);else if(!scripts.length)scripts.push(x);else files.push(x);}
  const cmds=[];for(const sc of scripts)for(let part of sc.split(/;(?![^/]*\/[gip]*$)/)){part=part.trim();if(!part)continue;let addr=null,m;
   const one=()=>{let mm;if((mm=/^(\d+|\$)/.exec(part))){part=part.slice(mm[0].length);return{n:mm[1]};}if((mm=/^\/((?:\\.|[^/])*)\//.exec(part))){part=part.slice(mm[0].length);return{re:new RegExp(E?mm[1]:bre(mm[1]))};}return null;};const a1=one();if(a1){addr=a1;if(part[0]===','){part=part.slice(1);const a2=one();if(a2)addr={from:a1,to:a2,on:false};}}
   part=part.trim();if(part[0]==='s'){const dl=part[1],ps=[];let cur='',i=2;for(;i<part.length;i++){if(part[i]==='\\'&&part[i+1]===dl){cur+=dl;i++;}else if(part[i]===dl){ps.push(cur);cur='';}else cur+=part[i];}ps.push(cur);const fl=ps[2]||'';cmds.push({addr,c:'s',re:new RegExp(E?ps[0]:bre(ps[0]),(fl.includes('g')?'g':'')+(fl.includes('i')||fl.includes('I')?'i':'')),rep:(ps[1]||'').replace(/\\(\d)/g,'$$$1').replace(/&/g,'$$&'),p:fl.includes('p')});}
   else if(part==='d'||part==='p')cmds.push({addr,c:part});else return{err:`sed: unsupported command: ${part}\n`,code:1};}
  const L=lines(files.length?files.map(read).join(''):inp),out=[];
  L.forEach((l,i)=>{let del=false;const one=ad=>ad.n?(ad.n==='$'?i===L.length-1:+ad.n===i+1):ad.re.test(l);const hit=ad=>{if(!ad)return true;if(!ad.from)return one(ad);if(!ad.on){if(one(ad.from)){ad.on=!(ad.to.n&&ad.to.n!=='$'&&+ad.to.n<=i+1);return true;}return false;}if(one(ad.to)||(ad.to.n&&ad.to.n!=='$'&&+ad.to.n<=i+1))ad.on=false;return true;};for(const c of cmds){if(!hit(c.addr))continue;if(c.c==='d'){del=true;break;}if(c.c==='p')out.push(l);if(c.c==='s'){const nl=l.replace(c.re,c.rep);if(c.p&&nl!==l)out.push(nl);l=nl;}}if(!del&&!n)out.push(l);});
  return{out:join(out)};};
 C.awk=(a,inp)=>{let FS=null,prog=null,files=[],vars={};for(let i=0;i<a.length;i++){const x=a[i];if(x==='-F')FS=a[++i];else if(x.startsWith('-F'))FS=x.slice(2);else if(x==='-v'){const [k,v]=a[++i].split('=');vars[k]=v;}else if(prog===null)prog=x;else files.push(x);}
  if(prog===null)return{err:"usage: awk [-F sep] 'program' [file ...]\n",code:2};
  try{return{out:awkRun(prog,FS,files.length?files.map(read).join(''):inp,vars)};}catch(e){return{err:`awk: ${e.message}\n`,code:2};}};
 C.find=a=>{let paths=[],name=null,iname=false,type=null;for(let i=0;i<a.length;i++){const x=a[i];if(x==='-name'){name=a[++i];}else if(x==='-iname'){name=a[++i];iname=true;}else if(x==='-type')type=a[++i];else paths.push(x);}if(!paths.length)paths=['.'];
  const re=name?new RegExp(glob2re(name).source,iname?'i':''):null;let o='';
  for(const p of paths){const P=abs(p);if(!isDir(P)&&!(P in S.fs)){o+=`find: '${p}': No such file or directory\n`;continue;}const all=new Set();if(P in S.fs)all.add(P);Object.keys(S.fs).filter(k=>k.startsWith(P==='/'?'/':P+'/')).forEach(k=>{all.add(k);let d=k;while((d=d.slice(0,d.lastIndexOf('/')))&&d.length>P.length)all.add(d+'/');});all.add(P+'/');
   [...all].sort().forEach(k=>{const dir=k.endsWith('/'),full=dir?k.slice(0,-1)||'/':k;if(type==='f'&&dir)return;if(type==='d'&&!dir)return;const base=full.split('/').pop();if(re&&!re.test(base))return;const shown=p+full.slice(P.length);o+=(shown||p)+'\n';});}
  return{out:o};};
 C.touch=a=>{a.forEach(p=>{const P=abs(p);if(!(P in S.fs))S.fs[P]='';});return{out:''};};
 C.rm=a=>{let err='';a.filter(x=>!x.startsWith('-')).forEach(p=>{const P=abs(p);if(P in S.fs){if(!P.startsWith(SH_HOME))err+=`rm: cannot remove '${p}': Permission denied\n`;else delete S.fs[P];}else err+=`rm: cannot remove '${p}': No such file or directory\n`;});return{out:'',err,code:err?1:0};};
 C.tee=(a,inp)=>{const app=a[0]==='-a',fs=a.filter(x=>x!=='-a');fs.forEach(p=>{const P=abs(p);S.fs[P]=(app?(S.fs[P]||''):'')+inp;});return{out:inp};};
 C.history=()=>({out:S.hist.map((h,i)=>`${String(i+1).padStart(5)}  ${h}`).join('\n')+'\n'});
 C.whoami=()=>({out:'karim\n'});C.hostname=()=>({out:'dut-07\n'});
 C.uname=a=>({out:a.includes('-a')?'Linux dut-07 6.8.0-45-generic #45-Ubuntu SMP x86_64 GNU/Linux\n':'Linux\n'});
 C.date=()=>({out:'Tue Nov  3 11:20:42 PST 2026\n'});C.uptime=()=>({out:' 11:20:42 up 1 day, 0:00,  1 user,  load average: 0.42, 0.37, 0.31\n'});
 C.dmesg=(a)=>({out:S.fs['/var/log/kern.log']});
 C.lspci=()=>({out:'00:00.0 Host bridge: Intel Corporation Atom Processor C3000 Series System Agent (rev 11)\n00:1c.0 PCI bridge: Intel Corporation Atom Processor C3000 Series PCI Express Root Port (rev 11)\n03:00.0 Ethernet controller: Intel Corporation 82599ES 10-Gigabit SFI/SFP+ Network Connection (rev 01)\n03:00.1 Ethernet controller: Intel Corporation 82599ES 10-Gigabit SFI/SFP+ Network Connection (rev 01)\n04:00.0 Ethernet controller: Intel Corporation I210 Gigabit Network Connection (rev 03)\n05:00.0 Non-Volatile memory controller: Samsung Electronics Co Ltd NVMe SSD Controller PM9A1/PM9A3/980PRO\n00:15.0 USB controller: Intel Corporation Atom Processor C3000 Series USB 3.0 xHCI Controller (rev 11)\n'});
 C.lsusb=()=>({out:'Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub\nBus 001 Device 002: ID 0403:6001 Future Technology Devices International, Ltd FT232 Serial (UART) IC\nBus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub\n'});
 C.ip=a=>{const st=a.includes('-s'),w=a.filter(x=>!x.startsWith('-'));const obj=w[0]||'';if(!['link','l','addr','a','address'].includes(obj))return{err:'Usage: ip [ -s ] { link | addr }\n',code:1};const addr=obj[0]==='a';let i=1,o=`1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n${addr?'    inet 127.0.0.1/8 scope host lo\n':''}`;
  for(const [n,v] of Object.entries(SH_NET)){i++;o+=`${i}: ${n}: <${v.up?'BROADCAST,MULTICAST,UP,LOWER_UP':'NO-CARRIER,BROADCAST,MULTICAST,UP'}> mtu 1500 qdisc mq state ${v.up?'UP':'DOWN'} mode DEFAULT group default qlen 1000\n    link/ether ${v.mac} brd ff:ff:ff:ff:ff:ff\n`;if(addr&&v.ip)o+=`    inet ${v.ip} brd ${v.ip.replace(/\.\d+\/\d+$/,'.255')} scope global ${n}\n`;if(st)o+=`    RX:  bytes packets errors dropped  missed   mcast\n    ${String(v.rx).padStart(10)} ${String(v.rxp).padStart(7)} ${String(v.crc).padStart(6)} ${String(v.fifo).padStart(7)}       0       0\n    TX:  bytes packets errors dropped carrier collsns\n    ${String(v.tx).padStart(10)} ${String(v.txp).padStart(7)}      0       0       0       0\n`;}
  return{out:o};};
 C.ethtool=a=>{const opt=a.find(x=>x.startsWith('-')),ifc=a.find(x=>!x.startsWith('-'));const v=SH_NET[ifc];if(!v)return{err:`netlink error: no device matches name (${ifc||'none'})\n`,code:1};
  if(opt==='-S')return{out:`NIC statistics:\n     rx_packets: ${v.rxp}\n     tx_packets: ${v.txp}\n     rx_bytes: ${v.rx}\n     tx_bytes: ${v.tx}\n     rx_errors: ${v.crc+v.fifo}\n     tx_errors: 0\n     rx_crc_errors: ${v.crc}\n     rx_fifo_errors: ${v.fifo}\n     rx_missed_errors: 0\n     tx_timeout_count: ${ifc==='eth1'?1:0}\n`};
  if(opt==='-i')return{out:`driver: ${v.drv}\nversion: 6.8.0-45-generic\nfirmware-version: ${v.drv==='igb'?'3.25, 0x800005d0':'0x800008a4'}\nbus-info: ${v.bus}\nsupports-statistics: yes\n`};
  return{out:`Settings for ${ifc}:\n\tSupported ports: [ ${v.port} ]\n\tSpeed: ${v.speed}\n\tDuplex: ${v.up?'Full':'Unknown! (255)'}\n\tAuto-negotiation: ${v.port==='FIBRE'?'off':'on'}\n\tPort: ${v.port}\n\tLink detected: ${v.up?'yes':'no'}\n`};};
 const hx=s=>{const n=parseInt(s,s&&/^0x/i.test(s)?16:10);return isNaN(n)?null:n;};
 C.i2cdetect=a=>{if(a.includes('-l'))return{out:'i2c-0\tsmbus     \tSMBus I801 adapter at e000   \tSMBus adapter\ni2c-1\ti2c       \tSynopsys DesignWare I2C adapter\tI2C adapter\n'};const bus=a.filter(x=>!x.startsWith('-'))[0];if(bus==null)return{err:'Error: No i2c-bus specified!\n',code:1};const B=S.i2c[+bus];if(!B)return{err:`Error: Could not open file '/dev/i2c-${bus}': No such file or directory\n`,code:1};
  let o=a.includes('-y')?'':`WARNING! This program can confuse your I2C bus.\nI will probe file /dev/i2c-${bus}. Continue? [Y/n] Y   (add -y to skip this prompt)\n`;o+='     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f\n';
  for(let base=0;base<0x80;base+=16){let row=base.toString(16).padStart(2,'0')+':';for(let c=0;c<16;c++){const ad=base+c;if(ad<3||ad>0x77)row+='   ';else if(B[ad])row+=' '+(ad===0x68&&+bus===1?'UU':ad.toString(16).padStart(2,'0'));else row+=' --';}o+=row.trimEnd()+'\n';}return{out:o};};
 C.i2cget=a=>{const f=a.includes('-f'),w=a.filter(x=>!x.startsWith('-'));const[bus,ad,reg]=[hx(w[0]),hx(w[1]),w[2]!=null?hx(w[2]):0];const B=S.i2c[bus];if(bus==null||ad==null)return{err:'Usage: i2cget [-f] [-y] I2CBUS CHIP-ADDRESS [DATA-ADDRESS]\n',code:1};if(!B)return{err:`Error: Could not open file '/dev/i2c-${w[0]}'\n`,code:1};
  if(ad===0x68&&bus===1&&!f)return{err:'Error: Could not set address to 0x68: Device or resource busy\n',code:1};const dev=B[ad];if(!dev)return{err:'Error: Read failed\n',code:1};return{out:'0x'+((dev[reg]??0xff)&0xff).toString(16).padStart(2,'0')+'\n',err:a.includes('-y')?'':'(add -y to skip the confirmation prompt)\n'};};
 C.i2cset=a=>{const w=a.filter(x=>!x.startsWith('-'));const[bus,ad,reg,val]=w.map(hx);const B=S.i2c[bus];if(val==null)return{err:'Usage: i2cset [-y] I2CBUS CHIP-ADDRESS DATA-ADDRESS VALUE\n',code:1};if(!B||!B[ad])return{err:'Error: Write failed\n',code:1};B[ad][reg]=val&0xff;return{out:''};};
 C.sensors=()=>{const t=S.i2c[1][0x48][0];return{out:`tmp102-i2c-1-48\nAdapter: Synopsys DesignWare I2C adapter\ntemp1:        +${t.toFixed(1)}°C\n\ncoretemp-isa-0000\nAdapter: ISA adapter\nPackage id 0:  +47.0°C  (high = +98.0°C, crit = +102.0°C)\n`};};
 C.free=a=>({out:a.includes('-h')?'               total        used        free      shared  buff/cache   available\nMem:            15Gi       2.1Gi        10Gi        12Mi       3.2Gi        13Gi\nSwap:          2.0Gi          0B       2.0Gi\n':'               total        used        free      shared  buff/cache   available\nMem:        16314392     2210044    10741220       12288     3363128    13788012\nSwap:        2097148           0     2097148\n'});
 C.df=()=>({out:'Filesystem      Size  Used Avail Use% Mounted on\n/dev/nvme0n1p2  234G   41G  181G  19% /\ntmpfs           7.8G     0  7.8G   0% /dev/shm\n'});
 C.ps=()=>({out:'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot           1  0.0  0.1 167712 11920 ?        Ss   Nov02   0:03 /sbin/init\nroot         812  2.1  0.4 412220 70112 ?        Ssl  Nov02  31:07 /usr/local/bin/diagd --burnin\nroot        1033  0.0  0.0  15420  5520 ?        Ss   Nov02   0:00 sshd: /usr/sbin/sshd -D\nkarim       2240  0.0  0.0  10540  5200 pts/0    Ss   11:02   0:00 -bash\n'});
 C.top=()=>({out:'top - 11:20:42 up 1 day,  1 user,  load average: 0.42, 0.37, 0.31\nTasks: 212 total,   1 running, 211 sleeping\n    PID USER      %CPU %MEM COMMAND\n    812 root       2.1  0.4 diagd\n   2307 karim      0.3  0.0 top\n(snapshot; real top updates live, press q to quit)\n'});
 C.ping=a=>{const h=a.filter(x=>!x.startsWith('-')&&!/^\d+$/.test(x))[0]||'';return{out:`PING ${h} 56(84) bytes of data.\n64 bytes from ${h}: icmp_seq=1 ttl=64 time=0.212 ms\n64 bytes from ${h}: icmp_seq=2 ttl=64 time=0.198 ms\n\n--- ${h} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss\n`};};
 C.python3=C.python=()=>({err:'This shell is simulated, so Python isn’t available here. Use the Python tab for real Python.\n',code:127});
 C.chmod=a=>a.length<2?{err:'chmod: missing operand\n',code:1}:{out:''};
 function tokenize(line){const t=[];let cur='',q=null,has=false,quoted=false;const push=()=>{if(has)t.push({v:cur,q:quoted});cur='';has=false;quoted=false;};
  for(let i=0;i<line.length;i++){const c=line[i];if(q){if(c===q)q=null;else if(c==='\\'&&q==='"'&&'"\\$`'.includes(line[i+1])){cur+=line[++i];}else cur+=c;continue;}
   if(c==="'"||c==='"'){q=c;has=true;quoted=true;continue;}if(c==='\\'&&i+1<line.length){cur+=line[++i];has=true;continue;}if(/\s/.test(c)){push();continue;}
   if(c==='|'||c===';'||c==='>'||c==='&'||c==='<'){push();if(c==='>'&&line[i+1]==='>'){t.push({op:'>>'});i++;}else if(c==='&'&&line[i+1]==='&'){t.push({op:'&&'});i++;}else if(c==='|'&&line[i+1]==='|'){t.push({op:'||'});i++;}else t.push({op:c});continue;}
   cur+=c;has=true;}if(q)throw new Error('unexpected end of input (unclosed quote)');push();return t;}
 function expand(tok){if(!tok.q&&(tok.v==='~'||tok.v.startsWith('~/')))tok={v:SH_HOME+tok.v.slice(1),q:false};if(tok.q||!/[*?]/.test(tok.v))return[tok.v];const P=abs(tok.v),dir=P.slice(0,P.lastIndexOf('/'))||'/',re=glob2re(P.split('/').pop());const hits=ls(dir).filter(n=>re.test(n)).map(n=>{const rel=tok.v.includes('/')?tok.v.slice(0,tok.v.lastIndexOf('/')+1)+n:n;return rel;});return hits.length?hits:[tok.v];}
 function runPipeline(segs,redir,stdin){let inp='',err='',code=0,out='';if(stdin!=null){try{inp=read(stdin);}catch(e){return{out:'',err:'bash: '+e.message+'\n',code:1};}}
  for(const seg of segs){if(!seg.length){return{out:'',err:'syntax error near unexpected token `|\'\n',code:2};}let[cmd,...args]=seg;if(cmd==='sudo'){[cmd,...args]=args;}if(cmd==='watch'){const r=runLine(args.filter(x=>!/^-n$|^\d+(\.\d+)?$/.test(x)).join(' '),true);return{out:'(watch reruns this every 2 s; showing one run)\n'+r.out,err:r.err,code:r.code};}
   const f=C[cmd];if(!f){err+=`${cmd}: command not found\n`;code=127;inp='';continue;}
   try{const r=f(args,inp)||{};inp=r.out||'';if(r.err)err+=r.err;code=r.code||0;}catch(e){err+=`${cmd}: ${e.message}\n`;inp='';code=1;}}
  out=inp;if(redir){const P=abs(redir.file);if(isDir(P))return{out:'',err:`bash: ${redir.file}: Is a directory\n`,code:1};S.fs[P]=(redir.app?(S.fs[P]||''):'')+out;out='';}return{out,err,code};}
 function runLine(line,nested){let toks;try{toks=tokenize(line);}catch(e){return{out:'',err:'bash: '+e.message+'\n',code:2};}
  let out='',err='',code=0,i=0;
  while(i<toks.length){const segs=[[]];let redir=null,op=null,stdin=null;
   for(;i<toks.length;i++){const t=toks[i];if(t.op==='|')segs.push([]);else if(t.op==='>'||t.op==='>>'){const f=toks[++i];if(!f||f.op){return{out,err:err+'bash: syntax error near unexpected token `newline\'\n',code:2};}redir={file:f.v,app:t.op==='>>'};}else if(t.op==='<'){const f=toks[++i];if(!f||f.op)return{out,err:err+'bash: syntax error near unexpected token `newline\'\n',code:2};stdin=f.v;}else if(t.op===';'||t.op==='&&'||t.op==='||'){op=t.op;i++;break;}else if(t.op==='&'){}else segs[segs.length-1].push(...expand(t));}
   if(segs.length===1&&!segs[0].length){if(op)continue;break;}
   const r=runPipeline(segs,redir,stdin);out+=r.out;err+=r.err;code=r.code;if(op==='&&'&&code!==0)break;if(op==='||'&&code===0)break;}
  return{out,err,code};}
 return{S,abs,run(line){const t=line.trim();if(!t)return{out:'',err:'',code:0};S.hist.push(t);if(t==='clear')return{clear:true,out:'',err:'',code:0};return runLine(t);},
  complete(word,first){if(first)return Object.keys(C).concat(['sudo','watch','clear']).filter(c=>c.startsWith(word)).sort();const i=word.lastIndexOf('/'),dirPart=i>=0?word.slice(0,i+1):'',base=word.slice(i+1),P=abs(dirPart||'.');return ls(P).filter(n=>n.startsWith(base)).map(n=>{const full=(P==='/'?'':P)+'/'+n;return dirPart+n+(isDir(full)?'/':'');});},
  prompt(){return `karim@dut-07:${S.cwd===SH_HOME?'~':S.cwd.startsWith(SH_HOME+'/')?'~'+S.cwd.slice(SH_HOME.length):S.cwd}$`;}};}
/* tiny awk */
function awkSplitTop(s,sep){const o=[];let d=0,q=false,re=false,cur='';for(let i=0;i<s.length;i++){const c=s[i];if(q){cur+=c;if(c==='\\'){cur+=s[++i]||'';}else if(c==='"')q=false;continue;}if(c==='"'){q=true;cur+=c;continue;}if('([{'.includes(c))d++;if(')]}'.includes(c))d--;if(d===0&&sep.includes(c)){o.push(cur);cur='';continue;}cur+=c;}o.push(cur);return o;}
function awkJS(src){
 src=src.replace(/(\$\(?[\w.+\-*/ ]+\)?|\b[A-Za-z_]\w*|"[^"]*")\s*(!?)~\s*\/((?:\\.|[^/])*)\//g,(m,l,neg,re)=>`${neg?'!':''}/${re}/.test(${l})`);
 let o='',i=0,prevVal=false;const FN={length:'FN.length',toupper:'FN.toupper',tolower:'FN.tolower',substr:'FN.substr',int:'FN.int',sqrt:'FN.sqrt',index:'FN.index',sprintf:'FN.sprintf'};
 const val=t=>{if(prevVal)o+='+""+';o+=t;prevVal=true;};
 while(i<src.length){const c=src[i];
  if(/\s/.test(c)){i++;continue;}
  if(c==='"'){let j=i+1;while(j<src.length&&src[j]!=='"'){if(src[j]==='\\')j++;j++;}val(src.slice(i,j+1));i=j+1;continue;}
  if(c==='/'&&!prevVal){let j=i+1;while(j<src.length&&src[j]!=='/'){if(src[j]==='\\')j++;j++;}const re=src.slice(i,j+1);i=j+1;if(src.slice(i).trimStart().startsWith('.test('))val(re);else val(`${re}.test(F(0))`);continue;}
  if(/[0-9.]/.test(c)){const m=/^(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?/.exec(src.slice(i));val(m[0]);i+=m[0].length;continue;}
  if(c==='$'){i++;let m=/^(\d+|NF|NR|[A-Za-z_]\w*)/.exec(src.slice(i));if(m){const x=m[1];val(`F(${/^\d+$/.test(x)?x:(x==='NF'||x==='NR'?'S.'+x:'V.'+x)})`);i+=x.length;}else if(src[i]==='('){let d=0,j=i;for(;j<src.length;j++){if(src[j]==='(')d++;if(src[j]===')'){d--;if(!d)break;}}val(`F(${awkJS(src.slice(i+1,j))})`);i=j+1;}continue;}
  if(/[A-Za-z_]/.test(c)){const m=/^[A-Za-z_]\w*/.exec(src.slice(i))[0];i+=m.length;const nx=src.slice(i).trimStart()[0];
   if(m==='in')throw new Error('arrays and for-in loops are not supported in this simplified awk');
   if(nx==='('&&FN[m]){if(prevVal)o+='+""+';o+=FN[m];prevVal=false;continue;}
   if(['NR','NF','FS','OFS','FILENAME'].includes(m))val('S.'+m);else val('V.'+m);if(src.slice(i).trimStart().startsWith('['))throw new Error('arrays are not supported in this simplified awk');continue;}
  if(c==='('){if(prevVal)o+='+""+';o+='(';prevVal=false;i++;continue;}
  if(c===')'){o+=')';prevVal=true;i++;continue;}
  const op=/^(\+\+|--|\+=|-=|\*=|\/=|%=|==|!=|<=|>=|&&|\|\||[-+*/%<>=!?:,^])/.exec(src.slice(i));if(op){let t=op[0];if(t==='^')t='**';if((t==='++'||t==='--')&&prevVal){o+=t;i+=2;continue;}o+=t;prevVal=false;i+=op[0].length;continue;}
  throw new Error(`can't parse "${src.slice(i,i+12)}"`);}
 return o;}
function awkStmt(st){st=st.trim();if(!st)return '';
 if(/^if\s*\(/.test(st)){let d=0,j=st.indexOf('(');for(;j<st.length;j++){if(st[j]==='(')d++;if(st[j]===')'){d--;if(!d)break;}}const cond=st.slice(st.indexOf('(')+1,j);let rest=st.slice(j+1).trim(),els='';const em=/\belse\b/.exec(rest);if(em){els=rest.slice(em.index+4);rest=rest.slice(0,em.index);}return `if(B(${awkJS(cond)})){${awkBlock(rest)}}${els?`else{${awkBlock(els)}}`:''}`;}
 if(st==='next')return 'return "next";';
 if(/^printf\b/.test(st)){const args=awkSplitTop(st.slice(6).replace(/^\s*\(|\)\s*$/g,''),',').map(awkJS);return `out.push({raw:FN.sprintf(${args.join(',')})});`;}
 if(/^print\b/.test(st)){const rest=st.slice(5).trim();if(!rest)return 'out.push(F(0));';const parts=awkSplitTop(rest.replace(/^\(|\)$/g,''),',').map(p=>`P(${awkJS(p)})`);return `out.push([${parts.join(',')}].join(S.OFS));`;}
 return awkJS(st)+';';}
function awkBlock(src){src=src.trim().replace(/^\{|\}$/g,'');return awkSplitTop(src,';\n').map(awkStmt).join('\n');}
function awkRun(prog,FS,input,vars={}){
 const rules=[];let i=0;const s=prog.trim();
 while(i<s.length){while(i<s.length&&/[\s;]/.test(s[i]))i++;if(i>=s.length)break;let kind='main',pat=null;
  if(/^BEGIN\b/.test(s.slice(i))){kind='begin';i+=5;}else if(/^END\b/.test(s.slice(i))){kind='end';i+=3;}
  else if(s[i]!=='{'){let j=i,inS=false,inR=false;while(j<s.length){const c=s[j];if(inS){if(c==='\\')j++;else if(c==='"')inS=false;}else if(inR){if(c==='\\')j++;else if(c==='/')inR=false;}else{if(c==='"')inS=true;else if(c==='/'&&(j===i||/[\s(!~&|,]/.test(s[j-1])))inR=true;else if(c==='{')break;}j++;}pat=s.slice(i,j).trim();i=j;}
  while(i<s.length&&/\s/.test(s[i]))i++;let act=null;
  if(s[i]==='{'){let d=0,j=i,inS=false;for(;j<s.length;j++){const c=s[j];if(inS){if(c==='\\')j++;else if(c==='"')inS=false;continue;}if(c==='"')inS=true;else if(c==='{')d++;else if(c==='}'){d--;if(!d)break;}}if(d)throw new Error('missing }');act=s.slice(i+1,j);i=j+1;}
  rules.push({kind,test:pat?new Function('F','S','V','FN','B','return B('+awkJS(pat)+')'):null,run:new Function('F','S','V','FN','out','P','B',act==null?'out.push(F(0));':awkBlock(act))});}
 const V=new Proxy(Object.assign({},vars),{get:(t,k)=>k in t?t[k]:0});const S={NR:0,NF:0,FS:FS==null?' ':FS.replace(/\\t/g,'\t'),OFS:' ',FILENAME:''};
 let fields=[],line='';const isNum=x=>/^\s*[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?\s*$/.test(x);
 const F=n=>{n=+n;if(n===0)return line;const v=fields[n-1];return v==null?'':(isNum(v)?parseFloat(v):v);};
 const P=v=>typeof v==='number'?(Number.isInteger(v)?String(v):String(+v.toPrecision(6))):String(v);
 const B=v=>typeof v==='string'?v!=='':!!v;
 const FN={length:x=>String(x===undefined?line:x).length,toupper:x=>String(x).toUpperCase(),tolower:x=>String(x).toLowerCase(),substr:(x,a,n)=>String(x).substr(Math.max(0,a-1),n===undefined?undefined:n),int:x=>Math.trunc(x),sqrt:Math.sqrt,index:(a,b)=>String(a).indexOf(b)+1,
  sprintf:(f,...a)=>{let k=0;return String(f).replace(/\\n/g,'\n').replace(/\\t/g,'\t').replace(/%(-?)(\d*)(?:\.(\d+))?([sdifxXc%])/g,(m,l,w,p,c)=>{if(c==='%')return '%';let v=a[k++];let t;if(c==='d'||c==='i')t=String(Math.trunc(+v||0));else if(c==='f')t=(+v||0).toFixed(p===undefined?6:+p);else if(c==='x'||c==='X'){t=(Math.trunc(+v)>>>0).toString(16);if(c==='X')t=t.toUpperCase();}else if(c==='c')t=String(v)[0]||'';else{t=P(v);if(p!==undefined)t=t.slice(0,+p);}if(w)t=l?t.padEnd(+w):t.padStart(+w);return t;});}};
 const out=[];const split=l=>S.FS===' '?l.trim().split(/\s+/).filter(Boolean):l.split(S.FS.length===1?S.FS:new RegExp(S.FS));
 for(const r of rules)if(r.kind==='begin')r.run(F,S,V,FN,out,P,B);
 const L=input.split('\n');if(L.length&&L[L.length-1]==='')L.pop();
 outer:for(const l of L){line=l;fields=split(l);S.NR++;S.NF=fields.length;for(const r of rules){if(r.kind!=='main')continue;if(r.test&&!r.test(F,S,V,FN,B))continue;if(r.run(F,S,V,FN,out,P,B)==='next')continue outer;}}
 for(const r of rules)if(r.kind==='end')r.run(F,S,V,FN,out,P,B);
 let txt='';for(const x of out)txt+=typeof x==='object'?x.raw:x+'\n';return txt;}
/* tasks */
const SH_TASKS=[
 {id:'kern-errors',title:'Count kernel errors',q:'How many lines in <code>/var/log/kern.log</code> mention “error” in any capitalization?',sol:'grep -ci error /var/log/kern.log',hints:['<code>grep</code> searches; <code>-i</code> ignores case.','<code>-c</code> prints a count instead of the lines.']},
 {id:'link-events',title:'Find link flaps',q:'Show only the <b>eth0</b> link up/down messages from the kernel log (use <code>dmesg</code>).',sol:"dmesg | grep 'eth0: NIC Link'",hints:['Pipe one command into another with <code>|</code>.','The messages contain “eth0: NIC Link”. Quote patterns that contain spaces.']},
 {id:'failed-serials',title:'Which boards failed?',q:'Print just the serial numbers of the boards that FAILED in <code>~/results.csv</code>.',sol:'grep FAIL results.csv | cut -d, -f1',hints:['First filter the lines with <code>grep FAIL</code>.','<code>cut -d, -f1</code> keeps the first comma-separated field.']},
 {id:'pass-fail',title:'Tally PASS and FAIL',q:'Count how many results are PASS and how many are FAIL in <code>results.csv</code> (one line per status with its count).',sol:'tail -n +2 results.csv | cut -d, -f3 | sort | uniq -c',hints:['Skip the header with <code>tail -n +2</code> (start from line 2).','<code>uniq -c</code> counts repeats, but only adjacent ones, so <code>sort</code> first.']},
 {id:'crc-eth1',title:'Read a NIC counter',q:'Print eth1’s <code>rx_crc_errors</code> counter line from the driver statistics.',sol:'ethtool -S eth1 | grep rx_crc_errors',hints:['<code>ethtool -S IFACE</code> dumps NIC counters.','Filter the one line you want with <code>grep</code>.']},
 {id:'eth2-carrier',title:'Is eth2 linked?',q:'Read whether eth2 has carrier (link) straight from sysfs.',sol:'cat /sys/class/net/eth2/carrier',hints:['Per-interface state lives under <code>/sys/class/net/IFACE/</code>.','The file is called <code>carrier</code>: 1 means link, 0 means no link.']},
 {id:'i2c-scan',title:'Scan the I²C bus',q:'Scan I²C bus 1 without the confirmation prompt.',sol:'i2cdetect -y 1',hints:['The tool is <code>i2cdetect</code>.','<code>-y</code> skips the interactive prompt; the last argument is the bus number.']},
 {id:'i2c-read',title:'Read a sensor register',q:'Read register 0x00 of the temperature sensor at address 0x48 on bus 1. (Bonus: what temperature is it?)',sol:'i2cget -y 1 0x48 0x00',hints:['<code>i2cget -y BUS ADDRESS REGISTER</code>.','The answer is a hex byte; a TMP102’s register 0 holds the temperature in °C in its upper byte.']},
 {id:'find-logs',title:'Find log files',q:'List every file ending in <code>.log</code> anywhere under <code>/var/log</code>.',sol:"find /var/log -name '*.log'",hints:['<code>find PATH -name PATTERN</code>.','Quote the glob (<code>\'*.log\'</code>) so the shell doesn’t expand it first.']},
 {id:'rank-errors',title:'Rank burn-in errors',q:'From <code>/var/log/diag/burnin.log</code>, count each ERR type and list them most frequent first.',sol:"grep ERR /var/log/diag/burnin.log | awk '{print $5}' | sort | uniq -c | sort -rn",hints:['Keep the ERR lines, then pull out the error-name column (it’s the 5th field) with <code>awk \'{print $5}\'</code>.','<code>sort | uniq -c</code> counts; <code>sort -rn</code> ranks the counts numerically, highest first.']},
 {id:'avg-volts',title:'Average a column',q:'Use awk to print the average of the <code>volts</code> column in <code>results.csv</code> (skip the header).',sol:"awk -F, 'NR>1 {s+=$2; n++} END {print s/n}' results.csv",hints:['<code>-F,</code> splits on commas; <code>NR&gt;1</code> skips the header line.','Accumulate in a variable, then print in an <code>END {…}</code> block.']},
 {id:'cpu-count',title:'Count CPU cores',q:'How many processor entries are listed in <code>/proc/cpuinfo</code>?',sol:'grep -c processor /proc/cpuinfo',hints:['Each core has a line starting with “processor”.','<code>grep -c</code> counts matching lines.']}];
const shNorm=t=>(t||'').split('\n').map(l=>l.trim().replace(/\s+/g,' ')).filter(Boolean).join('\n');
const shExpected={};function shExp(T){if(!(T.id in shExpected)){const x=mkShell();const r=x.run(T.sol);shExpected[T.id]=shNorm(r.out);}return shExpected[T.id];}
let SH=null,shTask=null;
function renderShell(id){
 if(!SH)SH=mkShell();const solved=prefs.shSolved||[];shTask=SH_TASKS.find(t=>t.id===id)||SH_TASKS.find(t=>!solved.includes(t.id))||SH_TASKS[0];
 $('shnav').innerHTML=`<p class="note" style="margin:0 0 10px">${solved.length}/${SH_TASKS.length} tasks done</p>`+SH_TASKS.map(t=>`<a href="#linux/${t.id}" class="${t===shTask?'on':''}">${solved.includes(t.id)?'<span class="done">✓</span> ':''}${t.title}</a>`).join('');
 $('shmain').innerHTML=`<h2>Linux shell</h2><p class="lead" style="margin-bottom:14px">A simulated diagnostics box (<b>dut-07</b>) with logs, NICs, an I²C bus and test results. Nothing here touches a real machine. Type <code>help</code> to see the commands, or <code>man grep</code> for options.</p>
 <div class="shtask"><div class="meta"><span class="pill">Task</span>${solved.includes(shTask.id)?'<span class="pill okp">Done</span>':''}</div><h3 style="margin:4px 0 6px">${shTask.title}</h3><p style="margin:0 0 8px">${shTask.q}</p><ol class="hints" id="shHints"></ol><div id="shSol"></div>
 <div class="tools" style="margin:6px 0 0"><button class="btn ghost" id="shHint">Hint</button><button class="btn ghost" id="shShow">Show a command</button><button class="btn ghost" id="shReset">Reset machine</button></div><div id="shVerdict"></div></div>
 <div class="term" id="term" role="log" aria-live="polite"><div id="termOut"></div><div class="term-line"><span class="term-ps" id="termPs"></span><input id="termIn" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Shell command"></div></div>
 <p class="note">↑/↓ history · Tab completes commands and paths · <code>clear</code> clears the screen. The task is checked against the output of each command you run.</p>`;
 let hn=0;$('shHint').onclick=()=>{if(hn>=shTask.hints.length)return;const li=document.createElement('li');li.dataset.n=hn+1;li.innerHTML=hl(shTask.hints[hn]);$('shHints').appendChild(li);hn++;if(hn>=shTask.hints.length)$('shHint').disabled=true;};
 $('shShow').onclick=()=>{$('shSol').innerHTML=`<p style="margin:0 0 8px">One way: <code class="shcmd"></code> <button class="linkish" id="shPaste">paste it in</button></p>`;$('shSol').querySelector('code').textContent=shTask.sol;$('shPaste').onclick=()=>{$('termIn').value=shTask.sol;$('termIn').focus();};};
 $('shReset').onclick=()=>{SH=mkShell();shLog('',true);shPrint('Machine reset to its original state.\n','note');shPs();};
 shLog('',true);(sh_buf||[]).forEach(x=>shPrint(x.t,x.c,true));shPs();
 const inp=$('termIn');$('term').onclick=e=>{if(!window.getSelection().toString())inp.focus();};
 inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();shExec(inp.value);inp.value='';SH.hi=SH.S.hist.length;}
  else if(e.key==='ArrowUp'){e.preventDefault();const h=SH.S.hist;SH.hi=Math.max(0,(SH.hi??h.length)-1);if(h[SH.hi]!=null)inp.value=h[SH.hi];}
  else if(e.key==='ArrowDown'){e.preventDefault();const h=SH.S.hist;SH.hi=Math.min(h.length,(SH.hi??h.length)+1);inp.value=h[SH.hi]??'';}
  else if(e.key==='Tab'){e.preventDefault();const v=inp.value,pos=inp.selectionStart,before=v.slice(0,pos),m=/(\S*)$/.exec(before),w=m[1],first=!/\S\s/.test(before.slice(0,before.length-w.length)+' ')&&before.trim()===w;const opts=SH.complete(w,first&&!before.slice(0,before.length-w.length).trim());
   if(opts.length===1){const add=opts[0].slice(w.length)+(opts[0].endsWith('/')?'':' ');inp.value=before+add+v.slice(pos);inp.selectionStart=inp.selectionEnd=pos+add.length;}else if(opts.length>1){let pre=opts[0];for(const o of opts)while(!o.startsWith(pre))pre=pre.slice(0,-1);if(pre.length>w.length){inp.value=before+pre.slice(w.length)+v.slice(pos);}else{shPrint(SH.prompt()+' '+v+'\n','cmd');shPrint(opts.join('  ')+'\n');}}}
  else if(e.key==='l'&&e.ctrlKey){e.preventDefault();shLog('',true);sh_buf=[];}};
 if(!matchMedia('(pointer:coarse)').matches)setTimeout(()=>inp.focus(),0);window.scrollTo({top:0});}
let sh_buf=[];
function shPs(){$('termPs').textContent=SH.prompt();}
function shLog(t,clear){if(clear)$('termOut').innerHTML='';}
function shPrint(t,cls='',replay=false){if(!t)return;const p=document.createElement('pre');p.className='tl '+cls;p.textContent=t.replace(/\n$/,'');$('termOut').appendChild(p);if(!replay){sh_buf.push({t,c:cls});if(sh_buf.length>400)sh_buf=sh_buf.slice(-300);}const term=$('term');term.scrollTop=term.scrollHeight;}
function shExec(line){shPrint(SH.prompt()+' '+line+'\n','cmd');const r=SH.run(line);if(r.clear){shLog('',true);sh_buf=[];shPs();return;}if(r.out)shPrint(r.out);if(r.err)shPrint(r.err,'err');shPs();
 if(!line.trim()||!shTask)return;const got=shNorm(r.out),exp=shExp(shTask);
 if(got&&got===exp){const s=prefs.shSolved||[];if(!s.includes(shTask.id)){s.push(shTask.id);prefs.shSolved=s;store.set('bench.prefs',prefs);}const nx=SH_TASKS.find(t=>!s.includes(t.id));
  $('shVerdict').innerHTML=`<div class="verdict good" style="margin-top:8px">Correct. ${shTask.id==='i2c-read'?'0x1a = 26 °C. ':''}${nx?`<a href="#linux/${nx.id}" class="linkish" style="font-size:15px">Next task: ${nx.title}</a>`:'All tasks done!'}</div>`;
  const cnt=$('shnav').querySelector('p');if(cnt)cnt.textContent=`${s.length}/${SH_TASKS.length} tasks done`;const a=$('shnav').querySelector(`a[href="#linux/${shTask.id}"]`);if(a&&!a.querySelector('.done'))a.insertAdjacentHTML('afterbegin','<span class="done">✓</span> ');}}
