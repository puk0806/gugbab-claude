const fs = require('fs'), path = require('path');
const R = process.argv[2];
const OUT = process.argv[3];
const SK = 'SKILL' + '.md';
const fm = t => { const m = t.match(/^---\n([\s\S]*?)\n---/); if (!m) return {}; const o = {}; let k = null; for (const l of m[1].split('\n')) { const mm = l.match(/^([a-zA-Z-]+):\s*(.*)$/); if (mm) { k = mm[1]; o[k] = mm[2].replace(/^[>|]-?\s*$/, ''); } else if (k && /^\s/.test(l)) o[k] += ' ' + l.trim(); } return o; };
const clean = s => (s || '').replace(/<example>.*?<\/example>/g, '').replace(/\s+/g, ' ').replace(/^["']|["']$/g, '').trim();
const cat = {};
for (const c of fs.readdirSync(path.join(R, 'docs/skills'))) { const d = path.join(R, 'docs/skills', c); if (!fs.statSync(d).isDirectory()) continue; for (const n of fs.readdirSync(d)) cat[n] = c; }
const skills = fs.readdirSync(path.join(R, '.claude/skills')).filter(n => fs.existsSync(path.join(R, '.claude/skills', n, SK))).map(n => { const f = fm(fs.readFileSync(path.join(R, '.claude/skills', n, SK), 'utf8')); return { n, c: cat[n] || '?', d: clean(f.description).slice(0, 150) }; });
const agents = [];
const ad = path.join(R, '.claude/agents');
for (const c of fs.readdirSync(ad)) { const d = path.join(ad, c); if (!fs.statSync(d).isDirectory()) continue; for (const f of fs.readdirSync(d).filter(x => x.endsWith('.md'))) { const t = fs.readFileSync(path.join(d, f), 'utf8'); const o = fm(t); const body = t.replace(/^---[\s\S]*?---/, ''); const esc = s => s.replace(/[.]/g, '\\.'); const refs = skills.map(s => s.n).filter(s => new RegExp('(^|[^a-z0-9-])' + esc(s) + '([^a-z0-9-]|$)').test(body)); agents.push({ n: f.replace('.md', ''), c, d: clean(o.description).slice(0, 130), m: o.model, skills: refs, body }); } }
for (const a of agents) { a.agents = agents.filter(b => b !== a && new RegExp('(^|[^a-z0-9-])' + b.n + '([^a-z0-9-]|$)').test(a.body)).map(b => b.n); delete a.body; }
const rules = fs.readdirSync(path.join(R, '.claude/rules')).map(f => { const t = fs.readFileSync(path.join(R, '.claude/rules', f), 'utf8'); const o = fm(t); return { n: f, paths: o.paths || '', h: (t.replace(/^---[\s\S]*?---\n/, '').match(/^#\s+(.*)$/m) || [])[1] }; });
const cmds = fs.readdirSync(path.join(R, '.claude/commands')).map(f => { const o = fm(fs.readFileSync(path.join(R, '.claude/commands', f), 'utf8')); return { n: f, d: clean(o.description).slice(0, 130) }; });
fs.writeFileSync(OUT, JSON.stringify({ skills, agents, rules, cmds }, null, 1));
const bc = {}; skills.forEach(s => bc[s.c] = (bc[s.c] || 0) + 1);
console.log(JSON.stringify(bc)); console.log('skills', skills.length, 'agents', agents.length, 'rules', rules.length, 'cmds', cmds.length);
