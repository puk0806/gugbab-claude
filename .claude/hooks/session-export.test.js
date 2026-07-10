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

check('Stop(기본): Y 프로젝트여도 로컬 exports/ (git status 오염 방지)', () => {
  const d = resolveDest('/fake/local/t.jsonl');
  assert.strictEqual(d.destDir, '/fake/local/exports');
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
  assert.strictEqual(d.destDir, '/fake/local/exports');
});

if (savedProjectDir === undefined) delete process.env.CLAUDE_PROJECT_DIR;
else process.env.CLAUDE_PROJECT_DIR = savedProjectDir;
fs.rmSync(fakeRepo, { recursive: true, force: true });

console.log(`\nsession-export.test.js: ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
