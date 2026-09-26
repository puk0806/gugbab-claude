'use strict';
// migrate-settings.test.js — 재설치 시 settings.json 덮어쓰기 N(보존) 경로의 최소 이관 (2026-09-26)
// 실행: node --test scripts/migrate-settings.test.js
//
// 3계층 (rules/adversarial-testing.md):
//  - 정상: 구버전 InstructionsLoaded 배선(instructions-loaded·staleness-check)만 SessionStart 로 이관, .bak 생성
//  - 악성·오남용: 깨진 JSON·배열 루트·symlink settings·위장 이름(xinstructions-loaded.js)·사용자 커스텀 훅 보존
//  - 경계: 이미 SessionStart 에 있음(중복 금지), 멱등(2회 실행 동일), .bak 기존 파일 비파괴, settings 없음

const { test } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const SCRIPT = path.join(__dirname, 'migrate-settings.js');
const OLD = (n, extra = '') => ({ type: 'command', command: `node $CLAUDE_PROJECT_DIR/.claude/hooks/${n}${extra}` });

const setup = (settings, raw) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'migrate settings '));
  fs.mkdirSync(path.join(dir, '.claude'));
  const f = path.join(dir, '.claude', 'settings.json');
  if (raw !== undefined) fs.writeFileSync(f, raw);
  else if (settings !== null) fs.writeFileSync(f, JSON.stringify(settings, null, 2));
  return { dir, f };
};
const run = (f) => spawnSync('node', [SCRIPT, '--settings', f], { encoding: 'utf8' });
const cmds = (s, ev) => (s.hooks?.[ev] || []).flatMap((g) => (g.hooks || []).map((h) => h.command));

const legacy = () => ({
  permissions: { allow: ['Read', 'Bash(make*)'] },          // 사용자 커스텀
  env: { MY_VAR: '1' },                                     // 사용자 커스텀
  hooks: {
    SessionStart: [{ hooks: [OLD('session-start.js')] }],
    InstructionsLoaded: [{
      hooks: [
        OLD('instructions-loaded.js'),
        OLD('staleness-check.js', ' --strict'),
        { type: 'command', command: 'node ./my-own-il-hook.js' }, // 사용자 자체 InstructionsLoaded 훅
      ],
    }],
    Stop: [{ hooks: [OLD('cc-notify.js')] }],
  },
});

test('정상: 두 훅만 SessionStart 로 이관, 인자(--strict) 보존, 사용자 커스텀·자체 IL 훅 보존, .bak 생성', () => {
  const { dir, f } = setup(legacy());
  const orig = fs.readFileSync(f, 'utf8');
  const r = run(f);
  assert.strictEqual(r.status, 0, r.stderr);
  const s = JSON.parse(fs.readFileSync(f, 'utf8'));
  const ss = cmds(s, 'SessionStart');
  assert.ok(ss.some((c) => c.endsWith('/hooks/instructions-loaded.js')));
  assert.ok(ss.some((c) => c.endsWith('/hooks/staleness-check.js --strict')), '--strict 인자 유실');
  assert.ok(ss.some((c) => c.endsWith('/hooks/session-start.js')), '기존 SessionStart 훅 유실');
  assert.deepStrictEqual(cmds(s, 'InstructionsLoaded'), ['node ./my-own-il-hook.js'], '사용자 IL 훅이 삭제·이동됨');
  assert.deepStrictEqual(s.permissions, { allow: ['Read', 'Bash(make*)'] });
  assert.deepStrictEqual(s.env, { MY_VAR: '1' });
  // 다른 훅은 이관하지 않는다 — 무따옴표 우리 훅 배선의 따옴표 교정(감사 B)만 적용
  assert.deepStrictEqual(cmds(s, 'Stop'), ['node "$CLAUDE_PROJECT_DIR"/.claude/hooks/cc-notify.js']);
  assert.strictEqual(fs.readFileSync(`${f}.bak`, 'utf8'), orig, '.bak 이 원본과 다름');
  assert.match(r.stdout, /InstructionsLoaded → SessionStart/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('멱등: 2회 실행 결과가 1회와 바이트 동일, 2회차는 .bak 을 새로 만들지 않는다', () => {
  const { dir, f } = setup(legacy());
  run(f);
  const once = fs.readFileSync(f, 'utf8');
  const bakOnce = fs.readFileSync(`${f}.bak`, 'utf8');
  const r2 = run(f);
  assert.strictEqual(r2.status, 0);
  assert.strictEqual(fs.readFileSync(f, 'utf8'), once);
  assert.strictEqual(fs.readFileSync(`${f}.bak`, 'utf8'), bakOnce, '2회차가 .bak 을 덮어씀');
  assert.ok(!fs.existsSync(`${f}.bak.1`), '2회차가 불필요한 백업 생성');
  const ss = cmds(JSON.parse(once), 'SessionStart');
  assert.strictEqual(ss.filter((c) => /instructions-loaded\.js/.test(c)).length, 1);
  assert.strictEqual(ss.filter((c) => /staleness-check\.js/.test(c)).length, 1);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('경계: 이미 SessionStart 에 있으면 중복 추가 없이 InstructionsLoaded 쪽만 제거하고 빈 이벤트는 지운다', () => {
  const s0 = {
    hooks: {
      SessionStart: [{ hooks: [OLD('instructions-loaded.js'), OLD('staleness-check.js')] }],
      InstructionsLoaded: [{ hooks: [OLD('instructions-loaded.js'), OLD('staleness-check.js', ' --strict')] }],
    },
  };
  const { dir, f } = setup(s0);
  assert.strictEqual(run(f).status, 0);
  const s = JSON.parse(fs.readFileSync(f, 'utf8'));
  const ss = cmds(s, 'SessionStart');
  assert.strictEqual(ss.length, 2, `중복 추가됨: ${JSON.stringify(ss)}`);
  assert.strictEqual(s.hooks.InstructionsLoaded, undefined, '빈 InstructionsLoaded 이벤트가 남음');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('경계: SessionStart 가 없거나 source matcher 그룹뿐이면 matcher 없는 새 그룹에 넣는다 (compact 전용 그룹 오염 금지)', () => {
  const s0 = {
    hooks: {
      SessionStart: [{ matcher: 'compact', hooks: [{ type: 'command', command: 'echo compact' }] }],
      InstructionsLoaded: [{ hooks: [OLD('instructions-loaded.js')] }, { hooks: [OLD('instructions-loaded.js')] }],
    },
  };
  const { dir, f } = setup(s0);
  run(f);
  const s = JSON.parse(fs.readFileSync(f, 'utf8'));
  assert.deepStrictEqual(s.hooks.SessionStart[0], s0.hooks.SessionStart[0], 'matcher 그룹이 변경됨');
  const plain = s.hooks.SessionStart.filter((g) => !g.matcher);
  assert.strictEqual(plain.length, 1);
  assert.strictEqual(plain[0].hooks.length, 1, 'IL 에 중복 기재된 훅이 두 번 추가됨');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('악성: 위장 이름(xinstructions-loaded.js, staleness-check.js.evil)·다른 경로는 건드리지 않는다', () => {
  const s0 = {
    hooks: {
      InstructionsLoaded: [{ hooks: [
        { type: 'command', command: 'node ./.claude/hooks/xinstructions-loaded.js' },
        { type: 'command', command: 'node ./.claude/hooks/staleness-check.js.evil' },
        { type: 'command', command: 'node ./tools/staleness-check.js' },
      ] }],
    },
  };
  const { dir, f } = setup(s0);
  const before = fs.readFileSync(f, 'utf8');
  const r = run(f);
  assert.strictEqual(r.status, 0);
  assert.strictEqual(fs.readFileSync(f, 'utf8'), before, '무관한 훅이 이관됨');
  assert.ok(!fs.existsSync(`${f}.bak`), '변경 없음인데 백업 생성');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('악성: 깨진 JSON 은 수정하지 않고 명확한 이관 불가 경고 후 exit 0', () => {
  const { dir, f } = setup(undefined, '{ "hooks": { "InstructionsLoaded": [ ,,, ');
  const before = fs.readFileSync(f, 'utf8');
  const r = run(f);
  assert.strictEqual(r.status, 0, '설치를 막으면 안 됨');
  assert.strictEqual(fs.readFileSync(f, 'utf8'), before);
  assert.match(r.stdout, /⚠.*파싱 실패.*이관.*수동/s);
  assert.ok(!fs.existsSync(`${f}.bak`));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('악성·경계: 루트가 배열/null·hooks 가 문자열·InstructionsLoaded 가 객체여도 크래시·파괴 없음', () => {
  for (const raw of ['[]', 'null', '{"hooks":"x"}', '{"hooks":{"InstructionsLoaded":{"a":1}}}', '"str"']) {
    const { dir, f } = setup(undefined, raw);
    const r = run(f);
    assert.strictEqual(r.status, 0, `${raw}: ${r.stderr}`);
    assert.strictEqual(fs.readFileSync(f, 'utf8'), raw, `${raw}: 파일 변경됨`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('악성: settings.json 이 symlink 면 링크 대상에 쓰지 않고 경고만 한다', () => {
  const { dir, f } = setup(null);
  const outside = path.join(dir, 'outside.json');
  fs.writeFileSync(outside, JSON.stringify(legacy()));
  fs.symlinkSync(outside, f);
  const before = fs.readFileSync(outside, 'utf8');
  const r = run(f);
  assert.strictEqual(r.status, 0);
  assert.strictEqual(fs.readFileSync(outside, 'utf8'), before, 'symlink 대상이 변경됨');
  assert.ok(fs.lstatSync(f).isSymbolicLink(), 'symlink 가 일반 파일로 교체됨');
  assert.match(r.stdout, /⚠.*symlink/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('경계: 기존 .bak 이 있으면 덮어쓰지 않고 다음 번호로 백업한다', () => {
  const { dir, f } = setup(legacy());
  fs.writeFileSync(`${f}.bak`, 'USER BACKUP');
  run(f);
  assert.strictEqual(fs.readFileSync(`${f}.bak`, 'utf8'), 'USER BACKUP');
  assert.ok(fs.existsSync(`${f}.bak.1`));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('경계: settings.json 이 없으면 아무것도 만들지 않고 exit 0', () => {
  const { dir, f } = setup(null);
  const r = run(f);
  assert.strictEqual(r.status, 0);
  assert.ok(!fs.existsSync(f));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('경계: 인자 누락은 exit 1', () => {
  const r = spawnSync('node', [SCRIPT], { encoding: 'utf8' });
  assert.strictEqual(r.status, 1);
});

test('따옴표: 우리 훅 배선(.claude/hooks/)의 무따옴표 $CLAUDE_PROJECT_DIR 는 교정, statusLine·사용자 명령은 경고만 (2026-09-26 감사 B)', () => {
  const { dir, f } = setup({ hooks: { Stop: [{ hooks: [OLD('cc-notify.js')] }] }, statusLine: { type: 'command', command: 'bash $CLAUDE_PROJECT_DIR/.claude/hooks/statusline.sh' } });
  const r = run(f);
  const s = JSON.parse(fs.readFileSync(f, 'utf8'));
  assert.deepStrictEqual(cmds(s, 'Stop'), ['node "$CLAUDE_PROJECT_DIR"/.claude/hooks/cc-notify.js']);
  assert.strictEqual(s.statusLine.command, 'bash $CLAUDE_PROJECT_DIR/.claude/hooks/statusline.sh', 'statusLine 이 수정됨');
  assert.match(r.stdout, /⚠.*따옴표.*1개/s);
  assert.ok(fs.existsSync(`${f}.bak`), '교정인데 .bak 없음');
  fs.rmSync(dir, { recursive: true, force: true });

  const ok = setup({ hooks: { Stop: [{ hooks: [
    { type: 'command', command: 'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/cc-notify.js' },
    { type: 'command', command: 'node "${CLAUDE_PROJECT_DIR}/.claude/hooks/x.js"' },
    { type: 'command', command: '${CLAUDE_PROJECT_DIR}/.claude/hooks/y.sh', args: [] },
  ] }] } });
  const r2 = run(ok.f);
  assert.doesNotMatch(r2.stdout, /따옴표/);
  fs.rmSync(ok.dir, { recursive: true, force: true });
});

// ── 감사 B (2026-09-26): 보존(N) 경로 잔재 — 따옴표 교정 + 설치본에 파일 없는 폐지 훅 배선 제거 ──
const H2 = (c) => ({ type: 'command', command: c });
const withHooks = (s0, hookFiles = []) => {
  const x = setup(s0);
  const hd = path.join(x.dir, '.claude', 'hooks');
  fs.mkdirSync(hd, { recursive: true });
  for (const h of hookFiles) fs.writeFileSync(path.join(hd, h), '// hook\n');
  return x;
};

test('B 정상: 따옴표 교정 — $VAR·${VAR} 두 형태, 인자 보존, 이미 따옴표/exec 형식은 불변', () => {
  const s0 = { hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [
    H2('node $CLAUDE_PROJECT_DIR/.claude/hooks/bash-guard.js'),
    H2('node ${CLAUDE_PROJECT_DIR}/.claude/hooks/deliverable-guard.js --no-readme'),
    H2('node "$CLAUDE_PROJECT_DIR"/.claude/hooks/auto-approve.js'),
    { type: 'command', command: '${CLAUDE_PROJECT_DIR}/.claude/hooks/y.sh', args: [] },
  ] }] } };
  const { dir, f } = withHooks(s0, ['bash-guard.js', 'deliverable-guard.js', 'auto-approve.js']);
  assert.strictEqual(run(f).status, 0);
  const c = cmds(JSON.parse(fs.readFileSync(f, 'utf8')), 'PreToolUse');
  assert.deepStrictEqual(c, [
    'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/bash-guard.js',
    'node "${CLAUDE_PROJECT_DIR}"/.claude/hooks/deliverable-guard.js --no-readme',
    'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/auto-approve.js',
    '${CLAUDE_PROJECT_DIR}/.claude/hooks/y.sh',
  ]);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('B 악성: 따옴표 교정은 우리 훅 경로·단순 명령만 — 사용자 명령·중첩 따옴표·이스케이프는 불변(경고만)', () => {
  const user = [
    'node $CLAUDE_PROJECT_DIR/scripts/my-hook.js',                          // 사용자 자체 경로
    'bash -c "node $CLAUDE_PROJECT_DIR/.claude/hooks/cc-notify.js"',        // 중첩 따옴표 — 교정하면 오히려 분할됨
    "sh -c 'node $CLAUDE_PROJECT_DIR/.claude/hooks/cc-notify.js'",
    'echo \\$CLAUDE_PROJECT_DIR/.claude/hooks/cc-notify.js',                // 이스케이프(리터럴)
    'node $CLAUDE_PROJECT_DIRX/.claude/hooks/cc-notify.js',                 // 다른 변수명
  ];
  const { dir, f } = withHooks({ hooks: { Stop: [{ hooks: user.map(H2) }] } }, ['cc-notify.js']);
  const before = fs.readFileSync(f, 'utf8');
  const r = run(f);
  assert.strictEqual(fs.readFileSync(f, 'utf8'), before, '사용자 명령이 수정됨');
  assert.ok(!fs.existsSync(`${f}.bak`), '변경 없음인데 백업 생성');
  assert.match(r.stdout, /⚠.*따옴표/s);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('B 정상: 설치본에 파일 없는 폐지 훅(memory-stop-guard 등) 배선 제거 — 빈 그룹·이벤트 정리, 나머지 보존', () => {
  const s0 = { permissions: { allow: ['Read'] }, hooks: {
    Stop: [{ hooks: [OLD('deliverable-guard.js'), OLD('memory-stop-guard.js'), OLD('session-export.js')] }],
    SessionStart: [{ hooks: [H2('node "$CLAUDE_PROJECT_DIR"/.claude/hooks/session-handoff-inject.js')] }],
    UserPromptSubmit: [{ hooks: [OLD('confirmation-gate.cjs')] }, { hooks: [H2('node ./mine.js')] }],
  } };
  const { dir, f } = withHooks(s0, ['deliverable-guard.js', 'session-export.js']);
  const r = run(f);
  assert.strictEqual(r.status, 0);
  const s = JSON.parse(fs.readFileSync(f, 'utf8'));
  assert.deepStrictEqual(cmds(s, 'Stop'), ['node "$CLAUDE_PROJECT_DIR"/.claude/hooks/deliverable-guard.js', 'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/session-export.js']);
  assert.strictEqual(s.hooks.SessionStart, undefined, '비워진 이벤트가 남음');
  assert.deepStrictEqual(s.hooks.UserPromptSubmit, [{ hooks: [H2('node ./mine.js')] }], '사용자 그룹 변경 또는 빈 그룹 잔존');
  assert.deepStrictEqual(s.permissions, { allow: ['Read'] });
  assert.match(r.stdout, /폐지 훅 배선 제거.*memory-stop-guard/s);
  assert.ok(fs.existsSync(`${f}.bak`));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('B 악성: 파일이 설치본에 있거나·사용자 자체 이름·위장 이름·복합 명령이면 배선을 절대 제거하지 않는다', () => {
  const keep = [
    'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/memory-stop-guard.js',        // 파일 존재 → 보존
    'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/my-team-guard.js',            // 우리 레포에 없던 이름(파일 없음)
    'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/xreadme-guard.js',            // 위장 이름
    'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/readme-guard.js.evil',
    'node ./tools/readme-guard.js',                                         // 다른 경로
    'node "$CLAUDE_PROJECT_DIR"/.claude/hooks/readme-guard.js && node ./mine.js', // 복합 — 사용자 부분 유실 방지
  ];
  const { dir, f } = withHooks({ hooks: { Stop: [{ hooks: keep.map(H2) }] } }, ['memory-stop-guard.js']);
  const before = fs.readFileSync(f, 'utf8');
  assert.strictEqual(run(f).status, 0);
  assert.strictEqual(fs.readFileSync(f, 'utf8'), before, '보존해야 할 배선이 제거·변경됨');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('B 경계: 교정+제거 후 2회차 실행은 바이트 동일·추가 백업 없음(멱등), 깨진 JSON 은 무수정', () => {
  const s0 = { hooks: { Stop: [{ hooks: [OLD('memory-stop-guard.js'), OLD('cc-notify.js')] }] } };
  const { dir, f } = withHooks(s0, ['cc-notify.js']);
  run(f);
  const once = fs.readFileSync(f, 'utf8');
  run(f);
  assert.strictEqual(fs.readFileSync(f, 'utf8'), once);
  assert.ok(!fs.existsSync(`${f}.bak.1`), '2회차 불필요한 백업');
  fs.rmSync(dir, { recursive: true, force: true });

  const bad = withHooks(null);
  fs.writeFileSync(bad.f, '{ "hooks": { "Stop": [ node $CLAUDE_PROJECT_DIR/.claude/hooks/memory-stop-guard.js');
  const b0 = fs.readFileSync(bad.f, 'utf8');
  assert.strictEqual(run(bad.f).status, 0);
  assert.strictEqual(fs.readFileSync(bad.f, 'utf8'), b0);
  fs.rmSync(bad.dir, { recursive: true, force: true });
});

test('B 악성: symlink settings 는 교정·제거 대상이어도 링크 대상에 쓰지 않는다', () => {
  const { dir, f } = withHooks(null);
  const outside = path.join(dir, 'outside.json');
  fs.writeFileSync(outside, JSON.stringify({ hooks: { Stop: [{ hooks: [OLD('memory-stop-guard.js')] }] } }));
  fs.symlinkSync(outside, f);
  const before = fs.readFileSync(outside, 'utf8');
  const r = run(f);
  assert.strictEqual(r.status, 0);
  assert.strictEqual(fs.readFileSync(outside, 'utf8'), before);
  assert.match(r.stdout, /⚠.*symlink/);
  fs.rmSync(dir, { recursive: true, force: true });
});
