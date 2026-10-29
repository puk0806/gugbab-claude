#!/usr/bin/env node
// wrapper-matrix.js — 전체 항목·프리셋 켜기·끄기 매트릭스 (맥·윈도우 공용, 2026-10-20 윈도우 지원 실사용 검증)
//   래퍼 명령(on·off·preset)을 실제로 실행하고, 조립된 설정 폴더(<데이터>/projects/<이름>/.claude)에 결과가 반영되는지 본다
//   ① 프리셋 13종 — 각각 새 프로젝트에 적용 → 그 블록의 모든 항목이 설정 폴더에 생김 (기대값 = manifest 블록 구성, 제품 계산 코드와 독립)
//   ② 모든 항목 — 기본이 켜짐이면 끄고 다시 켜고, 꺼짐이면 켜고 다시 끄며 매번 설정 폴더 확인. 고정(+고정이 필요로 하는 것)은 끄기 거부
//   ③ (--with-claude) 프리셋마다 실제 claude 세션 시작 정보에 대표 항목이 보이는지
// 사용: node scripts/wrapper-matrix.js [--dev] [--with-claude] [--model haiku] [--only preset|items]
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const WIN = process.platform === 'win32';
const argv = process.argv.slice(2);
const MODE = argv.includes('--dev') ? 'dev' : 'installed';
const WITH_CLAUDE = argv.includes('--with-claude');
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const MODEL = opt('--model') || 'haiku';
const ONLY = opt('--only');

const REPO = path.resolve(__dirname, '..');
const CODE = MODE === 'dev' ? REPO : path.resolve(opt('--home') || path.join(os.homedir(), 'gugbab')); // --home <설치 폴더>
const manifest = JSON.parse(fs.readFileSync(path.join(CODE, 'manifest.json'), 'utf8'));
const items = manifest.items, rel = manifest.relations;
const real = (p) => (WIN ? fs.realpathSync.native(p) : fs.realpathSync(p));
const WORK = real(fs.mkdtempSync(path.join(os.homedir(), '.gugbab-matrix-')));
const DATA = path.join(WORK, 'data');
const TRANSCRIPT_PREFIX = WORK.replace(/[^A-Za-z0-9]/g, '-');
process.on('exit', () => {
  try { fs.rmSync(WORK, { recursive: true, force: true }); } catch { /* */ }
  const pj = path.join(os.homedir(), '.claude', 'projects');
  try { for (const d of fs.readdirSync(pj)) if (d === TRANSCRIPT_PREFIX || d.startsWith(TRANSCRIPT_PREFIX + '-')) fs.rmSync(path.join(pj, d), { recursive: true, force: true }); } catch { /* */ }
});
fs.mkdirSync(path.join(DATA, 'state'), { recursive: true });
fs.writeFileSync(path.join(DATA, 'state', 'update-check.json'), JSON.stringify({ at: Date.now() }));

let PASS = 0, FAIL = 0; const fails = [];
const check = (m, cond, detail = '') => { if (cond) PASS++; else { FAIL++; fails.push(`${m}${detail ? ` — ${detail}` : ''}`); console.log(`  ✗ ${m}${detail ? ` — ${detail}` : ''}`); } };

const SESSION_VARS = /^(CLAUDECODE|CLAUDE_CODE_.*|CLAUDE_PID|CLAUDE_EFFORT|CLAUDE_PLUGIN_DATA|CLAUDE_PROJECT_DIR|CLAUDE_CONFIG_DIR|CLAUDE_SECURESTORAGE_CONFIG_DIR|GUGBAB_.*)$/;
function env() { const e = {}; for (const [k, v] of Object.entries(process.env)) if (!SESSION_VARS.test(k)) e[k] = v; e.GUGBAB_DATA = DATA; if (MODE === 'dev') e.GUGBAB_HOME = REPO; return e; }
function g(dir, args) {
  const [file, pre] = WIN ? [process.execPath, [path.join(CODE, 'cli', 'launch.js')]] : ['sh', [path.join(CODE, 'bin', 'gugbab-claude')]];
  const r = spawnSync(file, [...pre, ...args], { cwd: dir, env: env(), encoding: 'utf8', timeout: 300000, maxBuffer: 64 * 1024 * 1024 });
  return (r.stdout || '') + (r.stderr || '');
}
const GIT_ENV = { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
function newproj(name) {
  const d = path.join(WORK, 'ws', name); fs.mkdirSync(d, { recursive: true });
  execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: d, env: GIT_ENV });
  return d;
}
function cfgOf(dir) {
  const idx = JSON.parse(fs.readFileSync(path.join(DATA, 'projects', 'index.json'), 'utf8'));
  return path.join(DATA, 'projects', idx[real(dir)], '.claude');
}
const SUB = { rule: 'rules', command: 'commands', agent: 'agents', skill: 'skills' };
// 항목이 설정 폴더에 연결돼 있는가 (null = 이 방법으로 확인할 수 없는 종류)
function present(cfg, id) {
  const it = items[id];
  if (SUB[it.type]) return fs.existsSync(path.join(cfg, SUB[it.type], path.basename(it.path), it.type === 'skill' ? 'SKILL.md' : ''));
  if (it.type === 'setting') {
    let st = {}; try { st = JSON.parse(fs.readFileSync(path.join(cfg, 'settings.json'), 'utf8')); } catch { /* */ }
    if (it.key === 'claudeMd') return fs.existsSync(path.join(cfg, 'CLAUDE.md'));
    if (it.key === 'statusLine') return !!st.statusLine;
    if (String(it.key).startsWith('permissions.')) return !!(st.permissions && st.permissions[it.key.slice(12)] !== undefined);
    if (String(it.key).startsWith('plugin:')) return !!(st.enabledPlugins && st.enabledPlugins[it.key.slice(7)] === true);
    return null;
  }
  return null; // 훅은 hookCount 로 따로 본다 (실제 실행은 wrapper-e2e.js)
}
// 훅은 설정 폴더에 연결되지 않고 디스패처가 실행 때 고른다 → status 의 "훅 N/전체" 가 끄기·켜기마다 1씩 바뀌는지 본다 (2026-10-22)
function hookCount(dir) {
  const m = /훅 (\d+)\/(\d+)/.exec(g(dir, ['status']));
  return m ? Number(m[1]) : null;
}
let UNCHECKED = 0; // 이 매트릭스로 확인할 방법이 없어 넘어간 항목 수 (끝에 출력)

// 고정 집합 — manifest lock + 고정이 필요로 하는 것(requires 전파). 제품 resolve.js 와 독립으로 계산
const expandRaw = (raw) => raw.startsWith('block:') ? (rel.blocks[raw.slice(6)] || { items: [] }).items : raw.startsWith('bundle:') ? (rel.bundles[raw.slice(7)] || { items: [] }).items : [raw];
const locked = new Set(Object.entries(items).filter(([, it]) => it.state === 'lock').map(([id]) => id));
for (let grew = true; grew;) { grew = false; for (const id of [...locked]) for (const raw of (rel.requires[id] || [])) for (const d of expandRaw(raw)) if (items[d] && !locked.has(d)) { locked.add(d); grew = true; } }

function presetsPass() {
  console.log(`== ① 프리셋 ${Object.keys(rel.presets).length}종`);
  for (const [name, p] of Object.entries(rel.presets)) {
    const d = newproj(`preset-${name}`);
    const out = g(d, ['preset', name]);
    check(`preset ${name}: 기록됨`, out.includes(`프리셋 ${name}`), out.split('\n')[0]);
    g(d, ['compose']);
    const cfg = cfgOf(d);
    const want = [...new Set(p.enable.flatMap(expandRaw))].filter(id => items[id]);
    // 충돌 규칙으로 꺼지는 것(예: nexacro 블록 ↔ tdd-guard)은 블록 항목이 아니라 기대 목록에 없다
    const missing = want.filter(id => present(cfg, id) === false);
    check(`preset ${name}: 블록 항목 ${want.length}개가 설정 폴더에 연결`, missing.length === 0, missing.slice(0, 5).join(', '));
    // 충돌 규칙(relations.conflicts) — 프리셋이 a 를 켜면 b 는 꺼져야 한다 (예: nexacro 블록 ↔ tdd-guard)
    for (const [a, b] of rel.conflicts || []) {
      if (!p.enable.includes(a) || !items[b]) continue;
      const offLine = (g(d, ['status']).split('\n').find(l => l.includes('끔(기본 켬)')) || '');
      check(`preset ${name}: 충돌 ${a} ↔ ${b} → ${b} 꺼짐 + 안내`, out.includes(`충돌: ${a} 를 켜서 ${b} 를 끕니다`) && offLine.includes(b), offLine.trim());
    }
    if (WITH_CLAUDE) {
      const sample = want.find(id => items[id].type === 'agent') || want.find(id => items[id].type === 'skill');
      if (sample) {
        const r = g(d, ['-p', 'ok', '--max-turns', '1', '--output-format', 'stream-json', '--verbose', '--model', MODEL]);
        const init = r.split(/\r?\n/).map(l => { try { return JSON.parse(l); } catch { return null; } }).find(x => x && x.subtype === 'init');
        const nm = path.basename(items[sample].path, '.md');
        const listed = !!init && [...(init.agents || []), ...(init.skills || [])].some(x => x === nm || String(x).endsWith(':' + nm));
        check(`preset ${name}: claude 세션에 ${sample} 보임`, listed, init ? '' : '세션 시작 정보 없음');
      }
    }
    console.log(`  · ${name} 확인`);
  }
}

function itemsPass() {
  const ids = Object.keys(items).sort();
  console.log(`== ② 모든 항목 ${ids.length}개 켜기·끄기 (고정 ${locked.size}개는 끄기 거부)`);
  const d = newproj('items');
  g(d, ['compose']);
  const cfg = cfgOf(d);
  let n = 0;
  for (const id of ids) {
    const it = items[id];
    if (it.type === 'hook') {
      const before = hookCount(d);
      if (locked.has(id)) {
        const out = g(d, ['off', id]);
        check(`🔒 ${id} 끄기 거부`, out.includes('고정'), out.split('\n')[0]);
        check(`🔒 ${id} 훅 수 그대로`, before !== null && hookCount(d) === before, `${before} → ${hookCount(d)}`);
      } else if (it.state === 'on') {
        g(d, ['off', id]);
        const off = hookCount(d);
        check(`${id} 끄기 → 켜진 훅 1개 줄어듦`, before !== null && off === before - 1, `${before} → ${off}`);
        g(d, ['on', id]);
        check(`${id} 다시 켜기 → 원래 수`, hookCount(d) === before, `${off} → ${hookCount(d)}`);
      } else {
        g(d, ['on', id]);
        const on = hookCount(d);
        check(`${id} 켜기 → 켜진 훅 1개 늘어남`, before !== null && on === before + 1, `${before} → ${on}`);
        g(d, ['off', id]);
        check(`${id} 다시 끄기 → 원래 수`, hookCount(d) === before, `${on} → ${hookCount(d)}`);
      }
      if (++n % 40 === 0) console.log(`  · ${n}/${ids.length}`);
      continue;
    }
    if (present(cfg, id) === null) UNCHECKED++;
    // 필수 의존이 있고 기본 끔인 항목은 새 프로젝트에서 — 같은 프로젝트에서 앞서 그 의존 항목을 켰다 끈 기록(사용자가 끔)이 있으면
    // 제품은 의도대로 "필수 의존 규칙 때문에 유지" 하므로, 순서 탓에 켜기가 안 되는 것을 실패로 세지 않게 (2026-10-28 /spec-extract 기본 끔)
    if (!locked.has(id) && it.state !== 'on' && (rel.requires || {})[id]) {
      const fd = newproj(`req-${id.replace(/[^a-z0-9]/gi, '-')}`);
      g(fd, ['compose']);
      const fcfg = cfgOf(fd);
      g(fd, ['on', id]);
      if (present(fcfg, id) !== null) check(`${id} 켜기(새 프로젝트) → 연결`, present(fcfg, id) === true);
      const needs = (rel.requires[id] || []).filter((r) => items[r]);
      const missing = needs.filter((r) => present(fcfg, r) === false);
      check(`${id} 켜기 → 필수 의존 ${needs.length}개도 연결`, missing.length === 0, missing.join(', '));
      g(fd, ['off', id]);
      if (present(fcfg, id) !== null) check(`${id} 다시 끄기 → 빠짐`, present(fcfg, id) === false);
      if (++n % 40 === 0) console.log(`  · ${n}/${ids.length}`);
      continue;
    }
    if (locked.has(id)) {
      const out = g(d, ['off', id]);
      check(`🔒 ${id} 끄기 거부`, out.includes('고정'), out.split('\n')[0]);
      if (present(cfg, id) !== null) check(`🔒 ${id} 여전히 연결`, present(cfg, id) === true);
    } else if (it.state === 'on') {
      g(d, ['off', id]);
      if (present(cfg, id) !== null) check(`${id} 끄기 → 설정 폴더에서 빠짐`, present(cfg, id) === false);
      g(d, ['on', id]);
      if (present(cfg, id) !== null) check(`${id} 다시 켜기 → 연결`, present(cfg, id) === true);
    } else {
      g(d, ['on', id]);
      if (present(cfg, id) !== null) check(`${id} 켜기 → 연결`, present(cfg, id) === true);
      g(d, ['off', id]);
      if (present(cfg, id) !== null) check(`${id} 다시 끄기 → 빠짐`, present(cfg, id) === false);
    }
    if (++n % 40 === 0) console.log(`  · ${n}/${ids.length}`);
  }
  // 한 번에 많이 — 모든 스킬 블록을 켰다 끄기(--all 이 아닌 이 프로젝트만)
  //   개수 비교(>=)는 하나도 안 늘어도 참이라 쓰지 않는다 — 블록에 든 스킬 하나하나가 연결됐는지 본다 (2026-10-22)
  const blockSkills = [...new Set(Object.values(rel.blocks).flatMap(b => b.items))].filter(id => items[id] && items[id].type === 'skill');
  for (const b of Object.keys(rel.blocks)) g(d, ['on', `block:${b}`]);
  const notLinked = blockSkills.filter(id => present(cfg, id) !== true);
  check(`모든 블록 켜기 → 블록에 든 스킬 ${blockSkills.length}개 전부 연결`, blockSkills.length > 0 && notLinked.length === 0, notLinked.slice(0, 5).join(', '));
  for (const b of Object.keys(rel.blocks)) g(d, ['off', `block:${b}`]);
  // 블록 끄기는 그 블록 항목을 명시적으로 끈다 — 기본 켬이라도 빠지고(예: spec-extraction 블록의 기본 켬 스킬), 고정만 남는다
  const wrongAfterOff = blockSkills.filter(id => present(cfg, id) !== locked.has(id));
  check('모든 블록 끄기 → 블록 스킬은 고정만 남고 모두 빠짐', wrongAfterOff.length === 0, wrongAfterOff.slice(0, 5).join(', '));
}

if (ONLY !== 'items') presetsPass();
if (ONLY !== 'preset') itemsPass();
console.log('');
console.log(`wrapper-matrix: 성공 ${PASS} · 실패 ${FAIL} (${MODE}, ${process.platform})`);
if (UNCHECKED) console.log(`  (설정 폴더로 확인할 방법이 없어 넘어간 항목 ${UNCHECKED}개 — 설정 중 settings.json 키로 안 드러나는 것)`);
if (fails.length) console.log('실패 목록:\n' + fails.map(f => `  - ${f}`).join('\n'));
process.exitCode = FAIL ? 1 : 0;
