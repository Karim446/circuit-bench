// Smoke test: loads the site's scripts in the order index.html lists them (without a browser)
// and runs every question generator many times looking for broken output.
//   node tests/smoke.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const pub = path.join(__dirname, '..', 'public');
const html = fs.readFileSync(path.join(pub, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]).filter(f => f !== 'js/main.js');
if (!files.length) { console.error('no scripts found in index.html'); process.exit(1); }
global.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }, key(i) { return Object.keys(this._d)[i]; }, get length() { return Object.keys(this._d).length; } };
let bad = 0;
for (const f of files) {
  try { vm.runInThisContext(fs.readFileSync(path.join(pub, f), 'utf8'), { filename: f }); }
  catch (e) { console.error('LOAD FAILED', f, e.message); process.exit(1); }
}
const M = vm.runInThisContext('({G,TOPICS,FORMULAS,LESSONS,CHEAT,QBANK,FCARDS,EXPLAIN})');
const RUNS = +process.env.RUNS || 300, per = {};
M.G.forEach((g, gi) => {
  per[g.topic] = (per[g.topic] || 0) + 1;
  for (let i = 0; i < RUNS; i++) {
    let q;
    try { q = g.fn(); } catch (e) { console.log('THROW', gi, g.topic, e.message); bad++; break; }
    if (!q) continue;
    const js = JSON.stringify(q).replace(/"svg":null/, '');
    if (/\bNaN\b|\bInfinity\b|>undefined<|\bundefined [VAΩWFHs]/.test(js)) { console.log('BADTEXT', g.topic, q.title, js.match(/.{0,50}(NaN|undefined|Infinity).{0,30}/)?.[0]); bad++; break; }
    const a = q.answer;
    if (a.type === 'num') { if (!isFinite(a.value)) { console.log('BADNUM', q.title); bad++; break; } }
    else if (a.correct < 0 || new Set(a.options).size !== a.options.length || a.options.length < 2) { console.log('BADMC', g.topic, q.title, a.options); bad++; break; }
    if (!q.hints || !q.hints.length || !q.solution || !q.takeaway || !q.title) { console.log('MISSING', q.title); bad++; break; }
  }
});
const noLesson = M.TOPICS.filter(t => !M.LESSONS.find(l => l.id === t.id)).map(t => t.id);
const noFormula = M.TOPICS.filter(t => !M.FORMULAS[t.id]).map(t => t.id);
const badBank = M.QBANK.filter(x => !x.q || !x.a || !x.why).length;
const dupExplain = new Set(M.EXPLAIN.map(x => x[0])).size !== M.EXPLAIN.length;
if (noLesson.length) { console.log('topics without a lesson:', noLesson); bad++; }
if (noFormula.length) { console.log('topics without formulas:', noFormula); bad++; }
if (badBank) { console.log('incomplete question-bank items:', badBank); bad++; }
if (dupExplain) { console.log('duplicate explain ids'); bad++; }
console.log(`${files.length} files, ${M.G.length} generators x ${RUNS} runs, ${M.TOPICS.length} topics, ${M.LESSONS.length} lessons, ${M.CHEAT.length} cheat cards, ${M.QBANK.length} bank items, ${M.FCARDS.length} flashcards, ${M.EXPLAIN.length} explain prompts`);
console.log(bad ? `FAILED: ${bad} problem(s)` : 'OK');
process.exit(bad ? 1 : 0);
