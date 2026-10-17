'use strict';
// build-defaults-doc.test.js — manifest.json → docs/DEFAULTS.md (기본값·고정 목록·프리셋별 구성)
// 정상 / 악성·우회 / 경계 3계층
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { buildDefaultsDoc, mdCell } = require('./build-defaults-doc');

const REPO = path.resolve(__dirname, '..');
const SCRIPT = path.join(__dirname, 'build-defaults-doc.js');

function fakeManifest() {
  return {
    items: {
      'setting:위험 명령 차단': { type: 'setting', state: 'lock' },
      'hook:bash-guard': { type: 'hook', state: 'lock' },
      'hook:tdd-guard': { type: 'hook', state: 'on' },
      'hook:cc-notify': { type: 'hook', state: 'off' },
      'rule:git.md': { type: 'rule', state: 'on' },
      'command:commit': { type: 'command', state: 'on' },
      'agent:fact-checker': { type: 'agent', state: 'lock' },
      'agent:rust-dev': { type: 'agent', state: 'off' },
      'skill:axum': { type: 'skill', state: 'off' },
      'skill:sqlx': { type: 'skill', state: 'off' },
      'skill:lonely': { type: 'skill', state: 'off' },
      'skill:legacy': { type: 'skill', state: 'off' },
    },
    relations: {
      bundles: { q: { title: '테스트 품질', items: ['hook:tdd-guard'] } },
      blocks: {
        rust: { title: 'Rust', items: ['agent:rust-dev', 'skill:axum', 'skill:sqlx'] },
        legacy: { title: '레거시', items: ['skill:legacy'] },
      },
      requires: { 'command:commit': ['rule:git.md'] },
      conflicts: [['block:legacy', 'hook:tdd-guard']],
      presets: {
        rust: { title: 'Rust Axum', enable: ['block:rust'] },
        old: { title: '애드온 · 레거시', enable: ['block:legacy'] },
      },
    },
  };
}

// ── 정상 ─────────────────────────────────────────────────────────────
test('정상: 실제 레포 docs/DEFAULTS.md 가 manifest 재생성 결과와 같다 (손으로 고치거나 재생성을 빠뜨리지 않았는지)', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(REPO, 'manifest.json'), 'utf8'));
  const onDisk = fs.readFileSync(path.join(REPO, 'docs', 'DEFAULTS.md'), 'utf8');
  assert.strictEqual(onDisk, buildDefaultsDoc(manifest), 'node scripts/build-defaults-doc.js 로 다시 만드세요');
});

test('정상: --check 는 최신이면 exit 0', () => {
  const r = spawnSync(process.execPath, [SCRIPT, '--check'], { encoding: 'utf8' });
  assert.strictEqual(r.status, 0, r.stderr);
});

test('정상: 요약 표 — 종류별 고정·켬·끔 개수와 합계', () => {
  const md = buildDefaultsDoc(fakeManifest());
  assert.match(md, /^\| 설정 \| 1 \| 0 \| 0 \| 1 \|$/m);
  assert.match(md, /^\| 훅 \| 1 \| 1 \| 1 \| 3 \|$/m);
  assert.match(md, /^\| 스킬 \| 0 \| 0 \| 4 \| 4 \|$/m);
  assert.match(md, /^\| \*\*합계\*\* \| \*\*3\*\* \| \*\*3\*\* \| \*\*6\*\* \| \*\*12\*\* \|$/m);
});

test('정상: 고정·켬 목록, 꺼짐은 블록별로 묶고 블록 밖 항목은 따로', () => {
  const md = buildDefaultsDoc(fakeManifest());
  const lock = md.slice(md.indexOf('## 🔒 고정'), md.indexOf('## ✅ 기본으로 켜짐'));
  assert.match(lock, /위험 명령 차단/);
  assert.match(lock, /bash-guard/);
  assert.match(lock, /fact-checker/);
  const off = md.slice(md.indexOf('## ⬜ 기본으로 꺼짐'), md.indexOf('## 블록 구성'));
  assert.match(off, /<summary>Rust — 꺼진 항목 3개<\/summary>/);
  assert.match(off, /블록에 없는 꺼진 스킬·에이전트[\s\S]*lonely/);
  assert.match(off, /cc-notify/);
});

test('정상: 프리셋별 상세 — resolve 로 계산한 새로 켜지는 것·충돌로 꺼지는 것, 애드온 표시, 켜짐·꺼짐 전체 목록', () => {
  const md = buildDefaultsDoc(fakeManifest());
  const detail = md.slice(md.indexOf('## 프리셋별 상세'));
  const rust = detail.slice(detail.indexOf('### `rust`'), detail.indexOf('### `old`'));
  assert.match(rust, /켜는 블록: `rust`/);
  assert.match(rust, /🔒 고정 3 · ✅ 켜짐 6 · ⬜ 꺼짐 3/);
  assert.match(rust, /새로 켜짐 3개 \(에이전트 1 · 스킬 2\)/);
  assert.match(rust, /<summary>⬜ 꺼짐 3개<\/summary>[\s\S]*cc-notify[\s\S]*lonely/);
  const old = detail.slice(detail.indexOf('### `old`'));
  assert.match(old, /애드온 — 다른 프리셋에 더해 씀/);
  assert.match(old, /충돌로 꺼짐 1개: tdd-guard/);
  const baseSec = detail.slice(detail.indexOf('### 기본'), detail.indexOf('### `rust`'));
  assert.match(baseSec, /🔒 고정 3 · ✅ 켜짐 3 · ⬜ 꺼짐 6/);
  assert.doesNotMatch(baseSec, /켜는 블록/);
});

test('정상: 한눈 표 — 기본 + 프리셋마다 고정·켜짐·꺼짐 수와 종류별 켜짐/전체', () => {
  const md = buildDefaultsDoc(fakeManifest());
  assert.match(md, /^\| 기본 \| 프리셋 없음 \(처음 상태\) \| 3 \| 3 \| 6 \| 1\/1 \| 2\/3 \| 1\/1 \| 1\/1 \| 1\/2 \| 0\/4 \|$/m);
  assert.match(md, /^\| `rust` \| Rust Axum \| 3 \| 6 \| 3 \| 1\/1 \| 2\/3 \| 1\/1 \| 1\/1 \| 2\/2 \| 2\/4 \|$/m);
  assert.match(md, /^\| `old` \| 애드온 · 레거시 \| 3 \| 3 \| 6 \| 1\/1 \| 1\/3 \|/m, '충돌로 tdd-guard 꺼짐 → 훅 1/3');
});

test('정상: 항목 × 프리셋 표 — 칸마다 resolve 결과와 같음(고정 🔒, 켬 ✅, 끔 ⬜), 스킬·에이전트는 블록 칸', () => {
  const m = fakeManifest();
  const md = buildDefaultsDoc(m);
  const grid = md.slice(md.indexOf('## 항목 × 프리셋 표'), md.indexOf('## 프리셋별 상세'));
  assert.match(grid, /^\| 항목 \| 기본 \| `rust` \| `old` \|$/m, '훅 표 머리');
  assert.match(grid, /^\| 항목 \| 블록 \| 기본 \| `rust` \| `old` \|$/m, '스킬 표 머리');
  assert.match(grid, /^\| bash-guard \| 🔒 \| 🔒 \| 🔒 \|$/m);
  assert.match(grid, /^\| tdd-guard \| ✅ \| ✅ \| ⬜ \|$/m, '충돌로 old 에서 꺼짐');
  assert.match(grid, /^\| axum \| Rust \| ⬜ \| ✅ \| ⬜ \|$/m);
  assert.match(grid, /^\| lonely \| — \| ⬜ \| ⬜ \| ⬜ \|$/m);
  // 모든 항목이 정확히 한 줄씩
  for (const id of Object.keys(m.items)) {
    const name = id.replace(/^[a-z]+:/, '');
    assert.strictEqual(grid.split('\n').filter((l) => l.startsWith(`| ${name} |`)).length, 1, name);
  }
});

test('정상: 기본 프리셋 설정 안내 — 처음 실행·나중에 바꾸기·범위·git 공유·우선순위', () => {
  const md = buildDefaultsDoc(fakeManifest());
  const s = md.slice(md.indexOf('## 기본 프리셋 설정'), md.indexOf('## 프리셋 한눈 표'));
  for (const re of [/처음 실행할 때 고름/, /\/harness/, /gugbab-claude preset/, /--all/, /\.gugbab\.json/, /우선순위/]) assert.match(s, re);
});

test('정상: 블록·묶음 구성 표', () => {
  const md = buildDefaultsDoc(fakeManifest());
  assert.match(md, /^\| `block:rust` \| Rust \| 3 \| 0 \|$/m);
  assert.match(md, /^\| `bundle:q` \| 테스트 품질 \| tdd-guard \|$/m);
});

// ── 악성·우회 ────────────────────────────────────────────────────────
test('악성: 이름·제목에 | · 줄바꿈 · 이스케이프 문자가 있어도 표가 깨지지 않음', () => {
  const m = fakeManifest();
  m.items['skill:a|b\nc\u001b[31m'] = { type: 'skill', state: 'lock' };
  m.relations.blocks.rust.title = 'Ru|st\n깨짐';
  const md = buildDefaultsDoc(m);
  assert.ok(!md.includes('\u001b'), '제어문자 제거');
  assert.match(md, /a\\\|b c/, '| 는 \\| 로, 줄바꿈은 공백으로');
  const row = md.split('\n').find((l) => l.startsWith('| `block:rust`'));
  assert.strictEqual(row.split(/(?<!\\)\|/).length - 2, 4, '표 칸 수 유지');
  const gridRow = md.split('\n').find((l) => l.startsWith('| a\\|b c |'));
  assert.ok(gridRow, '항목 × 프리셋 표에도 이스케이프된 이름');
  assert.strictEqual(gridRow.split(/(?<!\\)\|/).length - 2, 5, '항목 × 프리셋 칸 수 유지(항목·블록·기본·프리셋 2)');
  m.relations.presets.rust.title = '<img src=x onerror=alert(1)>';
  assert.ok(!buildDefaultsDoc(m).includes('<img'), '프리셋 제목의 HTML 은 엔티티로');
  assert.strictEqual(mdCell('x|y\r\nz<script>'), 'x\\|y z&lt;script&gt;');
});

test('악성: 없는 블록을 가리키는 프리셋·이상한 프리셋 구성은 오류', () => {
  const m = fakeManifest();
  m.relations.presets.bad = { title: '깨짐', enable: ['block:ghost'] };
  assert.throws(() => buildDefaultsDoc(m), /프리셋 bad.*block:ghost/);
  const m2 = fakeManifest();
  m2.relations.presets.bad = { title: 'x', enable: 'block:rust' };
  assert.throws(() => buildDefaultsDoc(m2), /프리셋 bad/);
});

test('악성: --check 는 문서를 손으로 고쳤거나 낡았으면 exit 1, 다른 폴더에서 돌려도 레포 파일만 본다', () => {
  // 임시 사본 레포: 스크립트·resolve·manifest + 손댄 DEFAULTS.md
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'bdd-'));
  for (const f of ['scripts/build-defaults-doc.js', 'cli/resolve.js']) {
    fs.mkdirSync(path.dirname(path.join(d, f)), { recursive: true });
    fs.copyFileSync(path.join(REPO, f), path.join(d, f));
  }
  fs.writeFileSync(path.join(d, 'manifest.json'), JSON.stringify(fakeManifest()));
  fs.mkdirSync(path.join(d, 'docs'));
  const good = buildDefaultsDoc(fakeManifest());
  fs.writeFileSync(path.join(d, 'docs', 'DEFAULTS.md'), good.replace('합계', '합계(손으로 고침)'));
  let r = spawnSync(process.execPath, [path.join(d, 'scripts', 'build-defaults-doc.js'), '--check'], { encoding: 'utf8', cwd: os.tmpdir() });
  assert.strictEqual(r.status, 1, '손댄 문서는 실패');
  assert.match(r.stderr, /최신이 아닙니다/);
  fs.writeFileSync(path.join(d, 'docs', 'DEFAULTS.md'), good);
  r = spawnSync(process.execPath, [path.join(d, 'scripts', 'build-defaults-doc.js'), '--check'], { encoding: 'utf8', cwd: os.tmpdir() });
  assert.strictEqual(r.status, 0, r.stderr);
});

// ── 경계 ─────────────────────────────────────────────────────────────
test('경계: 프리셋·블록·묶음이 없는 manifest 도 문서를 만들고 "없음" 표시', () => {
  const md = buildDefaultsDoc({ items: { 'hook:a': { type: 'hook', state: 'on' } }, relations: {} });
  assert.match(md, /## 프리셋 한눈 표[\s\S]*프리셋 없음 — 아래는 기본 상태만/);
  assert.match(md, /^\| 기본 \| .* \| 0 \| 1 \| 0 \|/m, '프리셋이 없어도 기본 줄은 있음');
  assert.match(md, /## 블록 구성[\s\S]*없음/);
});

test('경계: 고정 항목이 필요로 하는 것은 모든 칸에서 🔒, 프리셋이 고정을 끄지 못함', () => {
  const m = fakeManifest();
  m.relations.requires['hook:bash-guard'] = ['hook:cc-notify'];
  m.relations.conflicts.push(['block:rust', 'hook:bash-guard']);
  const grid = buildDefaultsDoc(m);
  assert.match(grid, /^\| cc-notify \| 🔒 \| 🔒 \| 🔒 \|$/m, '고정의 필수 의존은 고정');
  assert.match(grid, /^\| bash-guard \| 🔒 \| 🔒 \| 🔒 \|$/m, '충돌이 있어도 고정은 그대로');
});

test('경계: 빈 manifest · null · 깨진 값은 예외 없이 빈 수치 문서 또는 명확한 오류', () => {
  const md = buildDefaultsDoc({});
  assert.match(md, /\*\*합계\*\* \| \*\*0\*\*/);
  assert.throws(() => buildDefaultsDoc(null), /manifest/);
  assert.throws(() => buildDefaultsDoc('{broken'), /manifest/);
});

test('경계: 같은 입력이면 결과가 같다 (결정적 — 날짜 등 변하는 값 없음)', () => {
  assert.strictEqual(buildDefaultsDoc(fakeManifest()), buildDefaultsDoc(fakeManifest()));
});
