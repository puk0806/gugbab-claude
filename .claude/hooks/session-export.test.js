'use strict';
// session-export.js 단위 테스트 — node .claude/hooks/session-export.test.js
const assert = require('assert');
const { parseTranscript, buildMarkdown, cleanUserText } = require('./session-export.js');

let pass = 0;
let fail = 0;
function check(desc, fn) {
  try { fn(); pass++; console.log(`  ✓ ${desc}`); }
  catch (e) { fail++; console.error(`  ✗ ${desc}\n    ${e.message}`); }
}

const L = (o) => JSON.stringify(o);

// ── cleanUserText ────────────────────────────────────────────────────────
check('system-reminder 블록 제거', () => {
  assert.strictEqual(cleanUserText('질문<system-reminder>노이즈</system-reminder>입니다'), '질문입니다');
});
check('인터럽트 메시지는 null', () => {
  assert.strictEqual(cleanUserText('[Request interrupted by user]'), null);
});
check('빈 문자열은 null', () => {
  assert.strictEqual(cleanUserText('  '), null);
});
check('긴 텍스트는 잘림', () => {
  const out = cleanUserText('a'.repeat(3000));
  assert.ok(out.length < 3000 && out.endsWith('…(생략)'));
});

// ── parseTranscript ──────────────────────────────────────────────────────
const jsonl = [
  L({ type: 'ai-title', aiTitle: '테스트 세션' }),
  L({ type: 'user', timestamp: '2026-07-08T01:00:00Z', gitBranch: 'main',
      message: { role: 'user', content: '첫 번째 질문' } }),
  L({ type: 'assistant', timestamp: '2026-07-08T01:00:10Z',
      message: { role: 'assistant', content: [
        { type: 'thinking', thinking: '생각' },
        { type: 'text', text: '첫 번째 답변' },
        { type: 'tool_use', name: 'Write', input: { file_path: '/proj/a.js' } },
        { type: 'tool_use', name: 'Bash', input: { command: 'ls' } },
      ] } }),
  L({ type: 'user', timestamp: '2026-07-08T01:00:20Z',
      message: { role: 'user', content: [{ type: 'tool_result', content: '도구 결과' }] } }),
  L({ type: 'assistant', timestamp: '2026-07-08T01:00:30Z',
      message: { role: 'assistant', content: [
        { type: 'text', text: '이어지는 답변' },
        { type: 'tool_use', name: 'Edit', input: { file_path: '/proj/a.js' } },
        { type: 'tool_use', name: 'Edit', input: { file_path: '/proj/b.js' } },
      ] } }),
  L({ type: 'user', timestamp: '2026-07-08T01:01:00Z',
      message: { role: 'user', content: '두 번째 질문' } }),
  L({ type: 'assistant', timestamp: '2026-07-08T01:01:10Z', isSidechain: true,
      message: { role: 'assistant', content: [{ type: 'text', text: '사이드체인 — 제외돼야 함' }] } }),
].join('\n');

const parsed = parseTranscript(jsonl);

check('제목 추출', () => assert.strictEqual(parsed.title, '테스트 세션'));
check('턴 2개 (tool_result는 턴 아님)', () => assert.strictEqual(parsed.turns.length, 2));
check('턴1: 같은 턴의 assistant 텍스트 병합', () =>
  assert.deepStrictEqual(parsed.turns[0].assistant, ['첫 번째 답변', '이어지는 답변']));
check('thinking 블록 제외', () =>
  assert.ok(!parsed.turns[0].assistant.join('').includes('생각')));
check('sidechain 제외', () =>
  assert.ok(!JSON.stringify(parsed.turns).includes('사이드체인')));
check('브랜치·타임스탬프 추출', () => {
  assert.strictEqual(parsed.branch, 'main');
  assert.strictEqual(parsed.firstTs, '2026-07-08T01:00:00Z');
  assert.strictEqual(parsed.lastTs, '2026-07-08T01:01:00Z');
});
check('도구 사용 통계 (tool_use 직접 추출)', () =>
  assert.deepStrictEqual(parsed.toolCounts, { Write: 1, Bash: 1, Edit: 2 }));
check('수정 파일 추출 — Write/Edit 대상, 중복 제거', () =>
  assert.deepStrictEqual(parsed.modifiedFiles, ['/proj/a.js', '/proj/b.js']));

// ── buildMarkdown ────────────────────────────────────────────────────────
const md = buildMarkdown(parsed, 'abcd1234-5678', [{ round: 1, body: '리뷰 내용' }]);

check('제목·세션 ID 포함', () => {
  assert.ok(md.includes('# 세션 요약 — 테스트 세션'));
  assert.ok(md.includes('abcd1234-5678'));
});
check('요청·응답 포함', () => {
  assert.ok(md.includes('첫 번째 질문'));
  assert.ok(md.includes('첫 번째 답변'));
  assert.ok(md.includes('두 번째 질문'));
});
check('수정 파일·도구 통계 포함', () => {
  assert.ok(md.includes('/proj/a.js'));
  assert.ok(md.includes('Edit 2회'));
});
check('Codex 리뷰 섹션 포함', () => {
  assert.ok(md.includes('## Codex 리뷰 기록'));
  assert.ok(md.includes('리뷰 내용'));
});

// ── resolveRefreshTarget (--refresh 대상 선택) ──────────────────────────
const fs = require('fs');
const os = require('os');
const path = require('path');
const { resolveRefreshTarget } = require('./session-export.js');

const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'se-refresh-'));
const fakeProject = '/Users/tester/my_proj';
const encDir = path.join(fakeHome, '.claude', 'projects', fakeProject.replace(/[/\_]/g, '-'));
fs.mkdirSync(encDir, { recursive: true });
fs.writeFileSync(path.join(encDir, 'old-session.jsonl'), '{}');
fs.writeFileSync(path.join(encDir, 'current-session.jsonl'), '{}');
const past = new Date(Date.now() - 60000);
fs.utimesSync(path.join(encDir, 'old-session.jsonl'), past, past);

check('refresh: 최신 mtime .jsonl(현재 세션) 선택', () => {
  const t = resolveRefreshTarget(fakeHome, fakeProject);
  assert.strictEqual(t.session_id, 'current-session');
  assert.strictEqual(t.transcript_path, path.join(encDir, 'current-session.jsonl'));
});
check('refresh: 프로젝트 경로 없으면 null', () => {
  assert.strictEqual(resolveRefreshTarget(fakeHome, null), null);
  assert.strictEqual(resolveRefreshTarget(fakeHome, '/no/such/project'), null);
});
fs.rmSync(fakeHome, { recursive: true, force: true });

// ── resolveDest — Stop은 로컬 고정, --refresh만 레포 ────────────────────
const { resolveDest } = require('./session-export.js');
const fakeRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'se-repo-'));
fs.mkdirSync(path.join(fakeRepo, 'memory'));
const savedProjectDir = process.env.CLAUDE_PROJECT_DIR;
process.env.CLAUDE_PROJECT_DIR = fakeRepo;

// 기대값을 path.join 으로 — 맥은 '/fake/local/exports' 그대로, 윈도우는 '\fake\local\exports' (path 모듈 구분자 차이일 뿐 같은 폴더)
check('Stop(기본): Y 프로젝트여도 로컬 exports/ (git status 오염 방지)', () => {
  const d = resolveDest('/fake/local/t.jsonl');
  assert.strictEqual(d.destDir, path.join('/fake/local', 'exports'));
  assert.strictEqual(d.repoRoot, null);
});
check('--refresh(toRepo=true): Y 프로젝트 → 레포 exports/', () => {
  const d = resolveDest('/fake/local/t.jsonl', true);
  assert.strictEqual(d.destDir, path.join(fakeRepo, 'exports'));
  assert.strictEqual(d.repoRoot, fakeRepo);
});
check('--refresh여도 N 프로젝트(memory/ 없음) → 로컬', () => {
  process.env.CLAUDE_PROJECT_DIR = '/no/such/project';
  const d = resolveDest('/fake/local/t.jsonl', true);
  assert.strictEqual(d.destDir, path.join('/fake/local', 'exports'));
});

if (savedProjectDir === undefined) delete process.env.CLAUDE_PROJECT_DIR;
else process.env.CLAUDE_PROJECT_DIR = savedProjectDir;
fs.rmSync(fakeRepo, { recursive: true, force: true });

// ── 프로젝트 경로 인코딩 (2026-09-26 실측 기준) ─────────────────────────
// Claude Code 2.1.282 에서 `claude -p` 를 해당 경로에서 실행해 생성된 ~/.claude/projects 디렉토리명을 그대로 기대값으로 쓴다
// (구현 로직을 복제하지 않는다 — 기대값은 실측 문자열).
const { encodeProjectPath, projectStoreDir, resolveProjectDir } = require('./session-export.js');
check('인코딩 실측: 일반 경로 (/ · _ → -)', () => {
  assert.strictEqual(encodeProjectPath('/Users/lf/Desktop/gugbab-workspace/00_gugbab-claude'),
    '-Users-lf-Desktop-gugbab-workspace-00-gugbab-claude');
});
check('인코딩 실측: 점·공백·한글·@·+ 는 각각 - (구 규칙은 / _ 만 치환해 불일치)', () => {
  assert.strictEqual(
    encodeProjectPath('/private/tmp/claude-501/-Users-lf-Desktop-gugbab-workspace-00-gugbab-claude/64863110-4333-4f2b-963a-d8c76a43ec50/scratchpad/enc test.v1 한글_x@y+z'),
    '-private-tmp-claude-501--Users-lf-Desktop-gugbab-workspace-00-gugbab-claude-64863110-4333-4f2b-963a-d8c76a43ec50-scratchpad-enc-test-v1----x-y-z');
});
// 맥 실측값이라 플랫폼을 맥(win=false)으로 고정 — 윈도우에선 `/a/…` 가 MSYS 드라이브 표기(`A:/…`)로 해석된다
check('인코딩 실측: 이모지(서로게이트 쌍)는 - 2개', () => {
  assert.strictEqual(encodeProjectPath('/a/e😀m', false), '-a-e--m');
});
check('인코딩 악성: ../ 가 섞여도 결과에 경로 구분자·점이 남지 않는다 (projects 밖 탈출 불가)', () => {
  const e = encodeProjectPath('/x/../../etc');
  assert.ok(!/[/.\\]/.test(e), e);
});
check('인코딩 경계: 빈 값·비문자열은 null', () => {
  for (const v of [undefined, null, '', 42, {}]) assert.strictEqual(encodeProjectPath(v), null);
});

// home 을 path.resolve('/h') 로 — 맥은 '/h' 그대로(기대값 불변), 윈도우는 'C:\h'. 실제 os.homedir() 는 늘 드라이브가 붙은
// 절대경로라, 드라이브 없는 '/h' 는 윈도우에선 실사용에 없는 입력이었다 (2026-10-20)
check('저장소 경로: transcript_path 가 projects 바로 아래면 그 디렉토리를 그대로 쓴다 (인코딩 추측보다 우선)', () => {
  const home = path.resolve('/h');
  assert.strictEqual(projectStoreDir(home, '/any/proj', path.join(home, '.claude/projects/-real-dir/abc.jsonl')), path.join(home, '.claude/projects/-real-dir'));
});
check('저장소 경로 악성: projects 밖·상위 탈출·중첩 transcript_path 는 무시하고 인코딩으로 폴백', () => {
  const home = path.resolve('/h');
  const want = path.join(home, '.claude/projects', encodeProjectPath('/p/q'));
  for (const tp of ['/etc/passwd', '/h/.claude/projects/../../evil/x.jsonl', '/h/.claude/projects/a/b/x.jsonl', '/h/.claude/projects/x.jsonl', 42]) {
    assert.strictEqual(projectStoreDir(home, '/p/q', tp), want, String(tp));
  }
});

// ── 윈도우 규칙 (플랫폼 인자 win=true 로 맥에서도 도는 순수 검사) ────────────
// 기대값은 2026-10-20 윈도우 PC 실측 디렉토리명 (Claude Code 가 실제로 만든 이름)
check('인코딩 실측(윈도우): `C:\\Users\\LF_USER\\…\\proj` → `C--Users-LF-USER-…-proj`', () => {
  assert.strictEqual(encodeProjectPath('C:\\Users\\LF_USER\\AppData\\Local\\Temp\\x\\proj', true), 'C--Users-LF-USER-AppData-Local-Temp-x-proj');
});
check('인코딩(윈도우): 슬래시 `C:/…`·MSYS `/c/…` 표기도 네이티브와 같은 이름', () => {
  const want = 'C--Users-LF-USER-proj';
  assert.strictEqual(encodeProjectPath('C:/Users/LF_USER/proj', true), want);
  assert.strictEqual(encodeProjectPath('/c/Users/LF_USER/proj', true), want);
});
check('인코딩(윈도우) 악성: `..`·드라이브·UNC 가 섞여도 결과에 구분자·점·콜론이 남지 않는다', () => {
  for (const p of ['C:\\x\\..\\..\\Windows', '\\\\server\\share\\..\\x', 'C:/a/../../b', '/c/../../etc']) {
    const e = encodeProjectPath(p, true);
    assert.ok(!/[\\/.:]/.test(e), `${p} → ${e}`);
  }
});
check('인코딩 맥 고정: win=false 면 MSYS 모양 `/c/…` 도 바꾸지 않는다 (맥에선 진짜 경로)', () => {
  assert.strictEqual(encodeProjectPath('/c/Users/lf/proj', false), '-c-Users-lf-proj');
});
check('Codex 라운드 폴더: 맥은 /tmp 하나, 윈도우는 os.tmpdir()(Git Bash /tmp) 먼저', () => {
  const { codexRoundDirs } = require('./session-export.js');
  assert.deepStrictEqual(codexRoundDirs(false, '/var/folders/x/T'), ['/tmp']);
  assert.deepStrictEqual(codexRoundDirs(true, 'C:\\Users\\u\\AppData\\Local\\Temp'), ['C:\\Users\\u\\AppData\\Local\\Temp', '/tmp']);
  assert.deepStrictEqual(codexRoundDirs(true, ''), ['/tmp']);
});
if (process.platform === 'win32') {
  check('저장소 경로(윈도우): transcript_path 대소문자·구분자가 달라도 projects 바로 아래면 신뢰', () => {
    const home = 'C:\\Users\\LF_USER';
    const tp = 'c:/users/lf_user/.CLAUDE/projects/C--x-proj/abc.jsonl';
    assert.strictEqual(projectStoreDir(home, 'C:\\x\\proj', tp), path.dirname(path.resolve(tp)));
  });
  check('저장소 경로(윈도우) 악성: 접두만 같은 형제·`..` 탈출·다른 드라이브는 무시하고 인코딩 폴백', () => {
    const home = 'C:\\Users\\LF_USER';
    const want = path.join(home, '.claude', 'projects', 'C--x-proj');
    for (const tp of ['C:\\Users\\LF_USER\\.claude\\projects-evil\\d\\a.jsonl', 'C:\\Users\\LF_USER\\.claude\\projects\\..\\..\\evil\\a.jsonl',
      'D:\\Users\\LF_USER\\.claude\\projects\\d\\a.jsonl', 'C:\\Users\\LF_USER\\.claude\\projects\\a.jsonl']) {
      assert.strictEqual(projectStoreDir(home, 'C:\\x\\proj', tp), want, tp);
    }
  });
} else {
  console.log('  ⚠️ 건너뜀: 저장소 경로(윈도우) 2종 — 윈도우 전용 (path.resolve 가 드라이브를 붙이는 동작은 윈도우에서만)');
}
// 래퍼(gugbab-claude) 설정 폴더의 projects/ 는 ~/.claude/projects 링크 — transcript_path 가 링크 경로로 와도 실제 폴더를 쓴다 (2026-10-16)
check('저장소 경로: 링크된 설정 폴더 projects 아래 transcript → 실제 ~/.claude/projects/<dir>', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'se-home-'));
  const real = path.join(home, '.claude', 'projects', '-real-dir');
  fs.mkdirSync(real, { recursive: true });
  const cfg = fs.mkdtempSync(path.join(os.tmpdir(), 'se-cfg-'));
  // 윈도우는 래퍼가 junction 으로 연결 (심볼릭 링크는 개발자 모드 없이 EPERM)
  require('./lib/testfs').linkDir(path.join(home, '.claude', 'projects'), path.join(cfg, 'projects'));
  assert.strictEqual(projectStoreDir(home, '/any/proj', path.join(cfg, 'projects', '-real-dir', 'abc.jsonl')), fs.realpathSync(real));
  // 링크가 아니라 이름만 projects 인 다른 폴더 → 무시하고 인코딩 폴백
  const fake = fs.mkdtempSync(path.join(os.tmpdir(), 'se-fake-'));
  fs.mkdirSync(path.join(fake, 'projects', '-real-dir'), { recursive: true });
  assert.strictEqual(projectStoreDir(home, '/p/q', path.join(fake, 'projects', '-real-dir', 'abc.jsonl')), path.join(home, '.claude', 'projects', encodeProjectPath('/p/q')));
  fs.unlinkSync(path.join(cfg, 'projects')); // 링크만 먼저 제거 — 링크 너머 home 내용을 rm 이 따라가지 않게
  for (const d of [home, cfg, fake]) fs.rmSync(d, { recursive: true, force: true });
});
check('저장소 경로 경계: 프로젝트 경로도 transcript 도 없으면 null', () => {
  assert.strictEqual(projectStoreDir('/h', null, null), null);
});

// resolveProjectDir: env → git toplevel → cwd
const { execSync } = require('child_process');
// .native — 윈도우 CI 러너 임시 폴더는 8.3 짧은 이름(RUNNER~1)이라 git toplevel(긴 이름)과 맞추려면 실제 표기로 (2026-10-22)
const gitRepo = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'se-git-')));
execSync('git init -q', { cwd: gitRepo });
fs.mkdirSync(path.join(gitRepo, 'sub', 'deep'), { recursive: true });
const outside = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'se-nogit-')));
check('프로젝트 루트: env 가 있으면 env', () => {
  assert.strictEqual(resolveProjectDir({ CLAUDE_PROJECT_DIR: '/from/env' }, gitRepo), '/from/env');
});
check('프로젝트 루트: env 없음 + 서브디렉토리 cwd → git toplevel', () => {
  assert.strictEqual(fs.realpathSync.native(resolveProjectDir({}, path.join(gitRepo, 'sub', 'deep'))), gitRepo);
});
check('프로젝트 루트: env 빈 문자열은 없음으로 취급', () => {
  assert.strictEqual(fs.realpathSync.native(resolveProjectDir({ CLAUDE_PROJECT_DIR: '' }, gitRepo)), gitRepo);
});
check('프로젝트 루트: 레포 밖 cwd → cwd 그대로', () => {
  assert.strictEqual(resolveProjectDir({}, outside), outside);
});

// --refresh CLI 통합: Bash 도구처럼 CLAUDE_PROJECT_DIR 없이, 레포 서브디렉토리에서 실행
const { spawnSync } = require('child_process');
const HOOK = path.join(__dirname, 'session-export.js');
const cliHome = fs.mkdtempSync(path.join(os.tmpdir(), 'se-cli-home-'));
fs.mkdirSync(path.join(gitRepo, 'memory'));
const store = path.join(cliHome, '.claude', 'projects', encodeProjectPath(gitRepo));
fs.mkdirSync(store, { recursive: true });
const tline = (o) => JSON.stringify(o);
fs.writeFileSync(path.join(store, 'sess1234-aaaa.jsonl'), [
  tline({ type: 'user', timestamp: '2026-09-26T01:00:00Z', message: { content: 'refresh 폴백 테스트 요청' } }),
  tline({ type: 'assistant', timestamp: '2026-09-26T01:00:05Z', message: { content: [{ type: 'text', text: '응답' }] } }),
].join('\n'));
// 윈도우 os.homedir() 는 USERPROFILE 을 본다 — HOME 만 바꾸면 실제 홈의 저장소를 찾는다
const envNoProj = { ...process.env, HOME: cliHome, USERPROFILE: cliHome };
delete envNoProj.CLAUDE_PROJECT_DIR;
check('--refresh: env 없이 서브디렉토리에서 실행해도 레포 exports/ 에 생성 (무음 no-op 회귀 방지)', () => {
  const r = spawnSync('node', [HOOK, '--refresh'], { cwd: path.join(gitRepo, 'sub', 'deep'), env: envNoProj, encoding: 'utf8' });
  assert.strictEqual(r.status, 0, r.stderr);
  const out = path.join(gitRepo, 'exports');
  assert.ok(fs.existsSync(out) && fs.readdirSync(out).some((f) => f.endsWith('-sess1234.md')), `exports 미생성: ${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /refresh 완료/);
});
check('--refresh 경계: 레포 밖·트랜스크립트 없는 cwd 에서는 아무것도 쓰지 않고 이유를 알린 뒤 exit 0', () => {
  const r = spawnSync('node', [HOOK, '--refresh'], { cwd: outside, env: envNoProj, encoding: 'utf8' });
  assert.strictEqual(r.status, 0);
  assert.ok(!fs.existsSync(path.join(outside, 'exports')), '레포 밖에 exports 생성');
  assert.match(r.stdout + r.stderr, /refresh 대상 세션을 찾지 못함/);
});
fs.rmSync(cliHome, { recursive: true, force: true });
fs.rmSync(gitRepo, { recursive: true, force: true });
fs.rmSync(outside, { recursive: true, force: true });

console.log(`\nsession-export.test.js: ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
