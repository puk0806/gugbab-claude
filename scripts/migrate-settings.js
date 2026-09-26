#!/usr/bin/env node
// migrate-settings.js — 재설치에서 settings.json 덮어쓰기를 거절(N)한 경우의 최소 이관 (2026-09-26)
//
// 배경: 2026-09-25 에 instructions-loaded.js·staleness-check.js 배선을 InstructionsLoaded → SessionStart 로
// 옮겼다(공식 문서상 InstructionsLoaded 는 출력 폐기). 그런데 "로컬 설정 보존을 위해 settings.json 은 N" 으로
// 재설치하면 구버전 배선이 그대로 남아 경고가 계속 버려졌다(감사 F3).
//
// 이 스크립트는 사용자 settings 를 통째로 덮지 않고 **그 두 훅 항목만** 옮긴다:
//  - InstructionsLoaded 의 해당 두 훅 → SessionStart(matcher 없는 그룹)로 이동, 명령 텍스트(인자 포함) 보존
//  - SessionStart 에 이미 같은 훅이 있으면 추가하지 않는다(중복 실행 = 경고 2회)
//  - 그 외 모든 키·훅(사용자 자체 InstructionsLoaded 훅 포함)은 그대로 둔다
//  - 변경이 있을 때만 원본을 settings.json.bak(이미 있으면 .bak.N)으로 백업한 뒤 원자적 교체
//  - 깨진 JSON·비정상 구조·symlink 는 수정하지 않고 경고만 — 설치는 절대 막지 않는다(항상 exit 0)
// 추가로 무따옴표 `$CLAUDE_PROJECT_DIR` 배선(공백 경로에서 훅 전체 불능)을 감지해 경고한다(수정은 하지 않음).
//
// 사용: node scripts/migrate-settings.js --settings <.claude/settings.json 경로>

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const i = args.indexOf('--settings');
const file = i >= 0 ? args[i + 1] : null;
if (!file) {
  console.error('사용법: migrate-settings.js --settings <settings.json>');
  process.exit(1);
}

const log = (m) => console.log(`  [settings] ${m}`);
const warn = (m) => console.log(`  [settings] ⚠ ${m}`);

const MIGRATE_BASES = ['instructions-loaded', 'staleness-check'];
// 경로 구분자 직후의 정확한 파일명 + 뒤는 공백·따옴표·끝만 허용 (xinstructions-loaded.js, *.js.evil 배제)
const baseRe = (b) => new RegExp(`\\.claude/hooks/${b}\\.c?js(?=[\\s"']|$)`);
const baseOf = (cmd) => MIGRATE_BASES.find((b) => typeof cmd === 'string' && baseRe(b).test(cmd)) || null;
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function main() {
  let st;
  try { st = fs.lstatSync(file); } catch { return; } // 파일 없음 — 할 일 없음
  const isLink = st.isSymbolicLink();

  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); } catch (e) {
    warn(`settings.json 을 읽을 수 없어 InstructionsLoaded → SessionStart 이관을 건너뜁니다 (${e.code || e.message})`);
    return;
  }
  let s;
  try { s = JSON.parse(raw); } catch {
    warn('settings.json 파싱 실패 — 구버전 InstructionsLoaded 배선 이관을 할 수 없습니다. 파일은 그대로 둡니다.');
    warn('  수동 조치: hooks.InstructionsLoaded 의 instructions-loaded.js·staleness-check.js 항목을 hooks.SessionStart 로 옮기세요');
    return;
  }
  if (!isObj(s)) { warn('settings.json 최상위가 객체가 아니라 이관을 건너뜁니다 (파일 그대로 둠)'); return; }

  checkQuoting(s);

  const hooks = s.hooks;
  if (!isObj(hooks) || hooks.InstructionsLoaded === undefined) return;
  const il = hooks.InstructionsLoaded;
  if (!Array.isArray(il)) { warn('hooks.InstructionsLoaded 가 배열이 아니라 이관을 건너뜁니다 (파일 그대로 둠)'); return; }
  if (hooks.SessionStart !== undefined && !Array.isArray(hooks.SessionStart)) {
    warn('hooks.SessionStart 가 배열이 아니라 이관을 건너뜁니다 (파일 그대로 둠)'); return;
  }

  // 1) InstructionsLoaded 에서 대상 두 훅 추출
  const pulled = [];
  const newIl = [];
  for (const g of il) {
    if (!isObj(g) || !Array.isArray(g.hooks)) { newIl.push(g); continue; }
    const keepHooks = [];
    for (const h of g.hooks) {
      const b = isObj(h) ? baseOf(h.command) : null;
      if (b) pulled.push({ base: b, hook: h }); else keepHooks.push(h);
    }
    if (keepHooks.length > 0) newIl.push({ ...g, hooks: keepHooks });
    else if (keepHooks.length === 0 && g.hooks.length === 0) newIl.push(g); // 원래 빈 그룹 — 사용자 것, 손대지 않음
  }
  if (pulled.length === 0) return;

  // 2) SessionStart 에 없는 것만 추가 (IL 안의 중복 기재도 1회로)
  const ss = Array.isArray(hooks.SessionStart) ? hooks.SessionStart : [];
  const present = new Set();
  for (const g of ss) for (const h of (isObj(g) && Array.isArray(g.hooks) ? g.hooks : [])) {
    const b = isObj(h) ? baseOf(h.command) : null;
    if (b) present.add(b);
  }
  const toAdd = [];
  for (const p of pulled) {
    if (present.has(p.base)) { log(`${p.base}.js 는 이미 SessionStart 에 있어 중복 추가하지 않습니다`); continue; }
    present.add(p.base);
    toAdd.push(p.hook);
  }
  if (toAdd.length > 0) {
    // source matcher 가 걸린 그룹(예: compact 전용)에 넣으면 startup 에서 안 돈다 → matcher 없는(=전체) 그룹
    let target = ss.find((g) => isObj(g) && Array.isArray(g.hooks) && (g.matcher === undefined || g.matcher === '' || g.matcher === '*'));
    if (!target) { target = { hooks: [] }; ss.push(target); }
    target.hooks.push(...toAdd);
  }
  hooks.SessionStart = ss;
  if (newIl.length > 0) hooks.InstructionsLoaded = newIl; else delete hooks.InstructionsLoaded;

  if (isLink) {
    warn('settings.json 이 symlink 라 링크 대상(프로젝트 밖일 수 있음)에 쓰지 않습니다 — 구버전 InstructionsLoaded 배선이 남아 있습니다.');
    warn('  수동 조치: hooks.InstructionsLoaded 의 instructions-loaded.js·staleness-check.js 항목을 hooks.SessionStart 로 옮기세요');
    return;
  }

  // 3) 백업 후 원자적 교체
  let bak = `${file}.bak`;
  for (let n = 1; fs.existsSync(bak); n++) bak = `${file}.bak.${n}`;
  try {
    fs.writeFileSync(bak, raw, { flag: 'wx' });
    const tmp = `${file}.migrate-${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(s, null, 2) + '\n', { flag: 'wx' });
    fs.renameSync(tmp, file);
  } catch (e) {
    warn(`settings.json 이관 저장 실패 — 원본 유지 (${e.code || e.message}). 수동으로 InstructionsLoaded 의 두 훅을 SessionStart 로 옮기세요`);
    return;
  }
  log(`구버전 배선 이관: InstructionsLoaded → SessionStart (${pulled.map((p) => `${p.base}.js`).join(', ')}) — 다른 설정은 보존`);
  log(`  원본 백업: ${path.basename(bak)}`);
}

// 셸 형태 명령에서 따옴표 없는 placeholder 감지. exec 형식(args 배열)은 따옴표가 필요 없다(공식 문서).
function checkQuoting(s) {
  const cmds = [];
  if (isObj(s.hooks)) {
    for (const groups of Object.values(s.hooks)) {
      if (!Array.isArray(groups)) continue;
      for (const g of groups) for (const h of (isObj(g) && Array.isArray(g.hooks) ? g.hooks : [])) {
        if (isObj(h) && typeof h.command === 'string' && !Array.isArray(h.args)) cmds.push(h.command);
      }
    }
  }
  if (isObj(s.statusLine) && typeof s.statusLine.command === 'string') cmds.push(s.statusLine.command);
  const bare = cmds.filter((c) => /(^|[^"])\$\{?CLAUDE_PROJECT_DIR\b/.test(c));
  if (bare.length > 0) {
    warn(`따옴표 없는 $CLAUDE_PROJECT_DIR 배선 ${bare.length}개 — 프로젝트 경로에 공백이 있으면 해당 훅이 전부 실행 실패합니다.`);
    warn('  조치: settings.json 을 덮어쓰기(y)로 재설치하거나, 명령을 node "$CLAUDE_PROJECT_DIR"/.claude/hooks/<훅>.js 형태로 고치세요');
  }
}

try { main(); } catch (e) { warn(`settings.json 이관 중 오류 — 건너뜀: ${e.message}`); }
process.exit(0);
