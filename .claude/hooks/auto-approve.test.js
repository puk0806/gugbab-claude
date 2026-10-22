#!/usr/bin/env node
/**
 * auto-approve.test.js
 * 실행: node .claude/hooks/auto-approve.test.js
 */

const { execSync, spawnSync } = require('child_process')
const path = require('path')
const HOOK = path.join(__dirname, 'auto-approve.js')
const { IS_WIN } = require('./lib/winpath')
const { linkDir } = require('./lib/testfs')

let passed = 0, failed = 0

// stdin 은 셸을 거치지 않고 직접 넘긴다 — 구 `echo '<json>' | node` 는 윈도우 cmd.exe 가 작은따옴표를 몰라 전부 실패했다 (2026-10-20)
function runHook(toolName, toolInput = {}, eventName = 'PreToolUse', extra = {}) {
  const input = JSON.stringify({ hook_event_name: eventName, tool_name: toolName, tool_input: toolInput, ...extra })
  const r = spawnSync(process.execPath, [HOOK], { input, encoding: 'utf8', timeout: 5000 })
  try {
    const output = (r.stdout || '').trim()
    return output ? JSON.parse(output) : null
  } catch { return null }
}

function getDecision(result, eventName) {
  if (eventName === 'PermissionRequest') {
    return result?.hookSpecificOutput?.decision?.behavior ?? 'null'
  }
  return result?.hookSpecificOutput?.permissionDecision ?? 'null'
}

function test(desc, toolName, toolInput, expected, eventName = 'PreToolUse') {
  const result = runHook(toolName, toolInput, eventName)
  const actual = getDecision(result, eventName)
  const pass = actual === expected
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대: ${expected}, 실제: ${actual})`}`)
  if (!pass) console.log(`     출력: ${JSON.stringify(result)}`)
  pass ? passed++ : failed++
}

function section(title) { console.log(`\n── ${title} ──`) }

console.log('🔍 auto-approve 테스트 시작')

section('PreToolUse — 안전한 비-Bash 도구 → allow')
test('Read', 'Read', { file_path: 'README.md' }, 'allow')
test('Write', 'Write', { file_path: 'README.md' }, 'allow')
test('Edit', 'Edit', { file_path: 'README.md' }, 'allow')
test('Glob', 'Glob', { pattern: '**/*.ts' }, 'allow')
test('Grep', 'Grep', { pattern: 'test' }, 'allow')
test('WebSearch', 'WebSearch', { query: 'DDD' }, 'allow')
test('WebFetch', 'WebFetch', { url: 'https://example.com' }, 'allow')
test('Agent', 'Agent', { task: 'research' }, 'allow')
test('TodoWrite', 'TodoWrite', { todos: [] }, 'allow')

section('PreToolUse — Bash → null (bash-guard.js가 담당)')
test('Bash → null', 'Bash', { command: 'git status' }, 'null')

section('PreToolUse — 알 수 없는 도구 → null')
test('Unknown 도구', 'UnknownTool', {}, 'null')

section('PermissionRequest — 안전한 비-Bash 도구 → allow')
test('Read', 'Read', {}, 'allow', 'PermissionRequest')
test('Write', 'Write', {}, 'allow', 'PermissionRequest')
test('Edit', 'Edit', {}, 'allow', 'PermissionRequest')
test('Agent', 'Agent', {}, 'allow', 'PermissionRequest')
test('WebSearch', 'WebSearch', {}, 'allow', 'PermissionRequest')

section('PermissionRequest — Bash → null (bash-guard.js가 담당)')
test('Bash → null', 'Bash', { command: 'git status' }, 'null', 'PermissionRequest')

// 2026-10-06 — 설정이 없어 매번 확인 창이 뜨던 도구(C 분류)를 자동 승인으로 이동
section('2026-10-06 추가 도구 → allow (PreToolUse·PermissionRequest 모두)')
for (const tool of ['Skill', 'Monitor', 'Workflow', 'EnterWorktree', 'Artifact', 'ShareOnboardingGuide', 'NotebookEdit']) {
  test(`${tool} (Pre)`, tool, {}, 'allow')
  test(`${tool} (PermissionRequest)`, tool, {}, 'allow', 'PermissionRequest')
}

section('MCP 도구 → allow')
for (const tool of ['mcp__claude_ai_Claude_Docs__batch', 'mcp__claude_ai_Claude_Docs__update', 'mcp__claude_ai_Google_Drive__read_file_content',
  'mcp__claude-in-chrome__computer', 'mcp__plugin_vercel_vercel__authenticate', 'mcp__x__shareholder_report', 'mcp__x__deleted_items_list']) {
  test(`${tool} (Pre)`, tool, {}, 'allow')
  test(`${tool} (PermissionRequest)`, tool, {}, 'allow', 'PermissionRequest')
}

// 2026-10-06 사용자 결정 — 되돌릴 수 없거나 외부에 공개하는 MCP 동작은 확인
section('삭제·공유 계열 MCP·Artifact 삭제 → 확인 (Pre=ask, PermissionRequest=null)')
for (const tool of ['mcp__claude_ai_Claude_Docs__delete', 'mcp__claude_ai_Google_Drive__share_file', 'mcp__claude_ai_Google_Drive__trash_file',
  'mcp__x__remove_member', 'mcp__x__purge-cache', 'mcp__x__REVOKE_TOKEN']) {
  test(`${tool} (Pre)`, tool, {}, 'ask')
  test(`${tool} (PermissionRequest)`, tool, {}, 'null', 'PermissionRequest')
}
test('Artifact action=delete (Pre)', 'Artifact', { action: 'delete', url: 'x' }, 'ask')
test('Artifact action=delete (PermissionRequest)', 'Artifact', { action: 'delete' }, 'null', 'PermissionRequest')
test('Artifact action=publish → 자동', 'Artifact', { action: 'publish' }, 'allow')

section('프로젝트 밖 쓰기 → 확인 / 안쪽·메모리·임시 → 자동')
{
  const os = require('os')
  const HOME = os.homedir()
  test('Write ~/Documents/x.txt (밖)', 'Write', { file_path: `${HOME}/Documents/x.txt` }, 'ask')
  test('Edit /etc/hosts (밖)', 'Edit', { file_path: '/etc/hosts' }, 'ask')
  test('Write ~/.claude/settings.json (전역 설정 — 밖)', 'Write', { file_path: `${HOME}/.claude/settings.json` }, 'ask')
  test('Write 프로젝트 상위로 이동 위장 ../outside.txt', 'Write', { file_path: '../outside.txt' }, 'ask')
  test('Write 밖 (PermissionRequest → 사용자에게)', 'Write', { file_path: `${HOME}/Documents/x.txt` }, 'null', 'PermissionRequest')
  test('Write 프로젝트 안 README.md', 'Write', { file_path: 'README.md' }, 'allow')
  test('Write 메모리 폴더', 'Write', { file_path: `${HOME}/.claude/projects/-x/memory/a.md` }, 'allow')
  test('Write 계획 폴더', 'Write', { file_path: `${HOME}/.claude/plans/p.md` }, 'allow')
  // 윈도우 임시 폴더는 %TEMP%(os.tmpdir()) — `/private/tmp` 는 맥 경로라 윈도우에선 의미가 없다
  test('Write 임시 폴더', 'Write', { file_path: IS_WIN ? path.join(os.tmpdir(), 'claude-1', 'a.txt') : '/private/tmp/claude-1/a.txt' }, 'allow')
  test('NotebookEdit 밖', 'NotebookEdit', { notebook_path: `${HOME}/Documents/n.ipynb` }, 'ask')
}

// 2026-10-16 계획서 12장 권한 정책 반영
section('12장 신규 자동 허용 → allow')
for (const tool of ['ArtifactComments', 'PushNotification', 'ExitWorktree', 'TaskStop', 'LSP']) {
  test(`${tool} (Pre)`, tool, {}, 'allow')
  test(`${tool} (PermissionRequest)`, tool, {}, 'allow', 'PermissionRequest')
}
test('ArtifactData get → 자동', 'ArtifactData', { action: 'get', collection: 'c', doc_id: 'd' }, 'allow')
test('ArtifactData batch → 자동', 'ArtifactData', { action: 'batch' }, 'allow')
test('ArtifactData delete → 확인', 'ArtifactData', { action: 'delete', collection: 'c', doc_id: 'd' }, 'ask')
test('ArtifactData delete (PermissionRequest → 사용자에게)', 'ArtifactData', { action: 'delete' }, 'null', 'PermissionRequest')
test('ArtifactData batch 안에 delete → 확인 (묶어서 우회 금지)', 'ArtifactData', { action: 'batch', batch: [{ action: 'set' }, { action: 'delete' }] }, 'ask')

// 2026-10-20 결정 40 — 세션 간 메시지는 받는 세션이 내용을 보고 진행 여부를 확인하므로 보내는 쪽은 자동
section('SendMessage → allow (받는 세션이 확인)')
test('SendMessage (Pre)', 'SendMessage', { to: 'peer', message: 'hi' }, 'allow')
test('SendMessage (PermissionRequest)', 'SendMessage', { to: 'peer', message: 'hi' }, 'allow', 'PermissionRequest')
test('SendMessage 입력이 비어도 자동 (도구 단위 판정)', 'SendMessage', {}, 'allow')
test('이름만 비슷한 SendMessageX 는 자동 허용 안 함', 'SendMessageX', {}, 'null')
test('소문자 sendmessage 는 자동 허용 안 함 (정확한 이름만)', 'sendmessage', {}, 'null')
test('공백 붙인 "SendMessage " 는 자동 허용 안 함', 'SendMessage ', {}, 'null')

section('12장 신규 확인 → ask (PermissionRequest=null)')
for (const tool of ['CronCreate', 'CronDelete', 'RemoteTrigger', 'DesignSync', 'PowerShell']) {
  test(`${tool} (Pre)`, tool, {}, 'ask')
  test(`${tool} (PermissionRequest)`, tool, {}, 'null', 'PermissionRequest')
}
test('Google Drive update_file(덮어쓰기) → 확인', 'mcp__claude_ai_Google_Drive__update_file', {}, 'ask')
test('Google Drive update_file (PermissionRequest)', 'mcp__claude_ai_Google_Drive__update_file', {}, 'null', 'PermissionRequest')
test('다른 서버 update_file 은 자동 (Drive 덮어쓰기만 확인)', 'mcp__claude_ai_Claude_Docs__update', {}, 'allow')

section('래퍼 설정 폴더(CLAUDE_CONFIG_DIR) 링크를 거친 메모리·계획 쓰기')
{
  const fs = require('fs')
  const os = require('os')
  const HOME = os.homedir()
  const realProjects = path.join(HOME, '.claude', 'projects')
  // CI 러너처럼 ~/.claude/projects 가 없으면 링크가 깨져 시험이 안 된다 — 없을 때만 만들고, 끝나면 만든 것만 지운다 (2026-10-22)
  const madeByTest = fs.existsSync(path.join(HOME, '.claude')) ? (fs.existsSync(realProjects) ? null : realProjects) : path.join(HOME, '.claude')
  fs.mkdirSync(realProjects, { recursive: true })
  // 임시 폴더는 원래 자동 허용이라 위장 시험이 안 된다 — 홈 아래에 잠깐 만들고 지운다
  const cfgLinked = fs.mkdtempSync(path.join(HOME, '.aa-cfg-'))
  const cfgReal = fs.mkdtempSync(path.join(HOME, '.aa-cfg-'))
  linkDir(realProjects, path.join(cfgLinked, 'projects')) // 윈도우는 junction (래퍼도 junction 으로 링크)
  fs.mkdirSync(path.join(cfgReal, 'projects'))
  const runIn = (filePath, env) => {
    const input = JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { file_path: filePath }, cwd: '/Users/nobody-project' })
    try {
      const out = execSync(`node "${HOOK}"`, { input, encoding: 'utf8', timeout: 5000, env: { ...process.env, ...env } }).trim()
      return out ? JSON.parse(out).hookSpecificOutput.permissionDecision : 'null'
    } catch { return 'CRASH' }
  }
  const check = (desc, actual, expected) => {
    const pass = actual === expected
    console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대: ${expected}, 실제: ${actual})`}`)
    pass ? passed++ : failed++
  }
  check('설정 폴더 projects → ~/.claude/projects 링크 안 메모리 → 자동',
    runIn(path.join(cfgLinked, 'projects', '-x', 'memory', 'a.md'), { CLAUDE_CONFIG_DIR: cfgLinked }), 'allow')
  check('설정 폴더 projects 가 링크 아닌 진짜 폴더 → 확인 (이름만 projects 인 폴더 위장)',
    runIn(path.join(cfgReal, 'projects', '-x', 'memory', 'a.md'), { CLAUDE_CONFIG_DIR: cfgReal }), 'ask')
  check('CLAUDE_CONFIG_DIR=/ 로 위장 → /etc/hosts 는 여전히 확인',
    runIn('/etc/hosts', { CLAUDE_CONFIG_DIR: '/' }), 'ask')
  check('링크된 projects 를 ../ 로 빠져나가기 → 확인',
    runIn(path.join(cfgLinked, 'projects', '..', '..', 'escape.txt'), { CLAUDE_CONFIG_DIR: cfgLinked }), 'ask')
  fs.rmSync(cfgLinked, { recursive: true, force: true })
  fs.rmSync(cfgReal, { recursive: true, force: true })
  if (madeByTest) fs.rmSync(madeByTest, { recursive: true, force: true })
}

// 2026-10-20 윈도우 2단계 — PoC 실측: 프로젝트 안 Write(C:\repo\poc-tmp.txt, cwd=C:\repo)·%TEMP% 아래 Write 가 allow 대신 ask
section('윈도우 — 프로젝트·임시·메모리 쓰기 자동 / 밖·우회는 확인')
if (!IS_WIN) {
  console.log('  ⚠️ 건너뜀: 윈도우 경로 쓰기 시험 (맥 — 윈도우 PC 에서만 의미 있음)')
} else {
  const fs = require('fs')
  const os = require('os')
  const HOME = os.homedir()
  const ROOT = path.resolve(__dirname, '..', '..')              // 이 레포 (C:\…, .git 있음)
  const at = (desc, filePath, expected, cwd = ROOT) => {
    const actual = getDecision(runHook('Write', { file_path: filePath, content: 'x' }, 'PreToolUse', { cwd }), 'PreToolUse')
    const pass = actual === expected
    console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대: ${expected}, 실제: ${actual})`}`)
    pass ? passed++ : failed++
  }
  // 정상
  at('PoC: 프로젝트 안 C:\\<repo>\\poc-tmp.txt (cwd=<repo>)', path.join(ROOT, 'poc-tmp.txt'), 'allow')
  at('드라이브 소문자 c:\\<repo>\\x', ROOT[0].toLowerCase() + ROOT.slice(1) + '\\x.txt', 'allow')
  at('슬래시 C:/<repo>/x', ROOT.replace(/\\/g, '/') + '/x.txt', 'allow')
  at('MSYS /c/<repo>/x', '/' + ROOT[0].toLowerCase() + ROOT.slice(2).replace(/\\/g, '/') + '/x.txt', 'allow')
  at('공백·한글 하위 폴더 <repo>\\내 폴더\\가.txt', path.join(ROOT, '내 폴더', '가.txt'), 'allow')
  at('PoC: %TEMP% 아래', path.join(os.tmpdir(), 'poc', 'a.txt'), 'allow')
  at('~\\.claude\\projects\\-x\\memory\\a.md (~\\ 표기)', '~\\.claude\\projects\\-x\\memory\\a.md', 'allow')
  at('메모리 폴더 대소문자 섞임 (NTFS 대소문자 무시)', path.join(HOME, '.CLAUDE', 'Projects', '-x', 'memory', 'a.md'), 'allow')
  // 악성·우회
  at('접두만 같은 형제 폴더 <repo>-evil\\x', ROOT + '-evil\\x.txt', 'ask')
  at('<repo>\\..\\x 로 빠져나가기', ROOT + '\\..\\x.txt', 'ask')
  at('다른 드라이브 D:\\x', 'D:\\x.txt', 'ask')
  at('UNC \\\\srv\\share\\x', '\\\\srv\\share\\x.txt', 'ask')
  at('드라이브 상대 C:x.txt (현재 폴더 모름)', 'C:x.txt', 'ask')
  at('홈 ~\\Documents\\x', '~\\Documents\\x.txt', 'ask')
  at('%TEMP% 자체를 .. 로 벗어나기', path.join(os.tmpdir(), '..', 'x.txt'), 'ask')
  at('~/.claude/settings.json (전역 설정)', path.join(HOME, '.claude', 'settings.json'), 'ask')
  at('C:\\Windows\\System32\\x.dll', 'C:\\Windows\\System32\\x.dll', 'ask')
  // junction 탈출 — 프로젝트(또는 임시) 안 링크가 밖을 가리키면 글자 위치가 안이어도 확인
  const base = fs.mkdtempSync(path.join(HOME, '.aa-win-'))
  const proj = path.join(base, 'proj'), outside = path.join(base, 'outside')
  fs.mkdirSync(path.join(proj, '.git'), { recursive: true }); fs.mkdirSync(outside)
  linkDir(outside, path.join(proj, 'out'))
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'aa-win-'))
  linkDir(outside, path.join(tmpBase, 'out'))
  at('프로젝트 안 일반 폴더 → 자동', path.join(proj, 'in', 'x.txt'), 'allow', proj)
  at('프로젝트 안 junction → 밖 폴더 쓰기 → 확인', path.join(proj, 'out', 'x.txt'), 'ask', proj)
  at('%TEMP% 안 junction → 밖 폴더 쓰기 → 확인', path.join(tmpBase, 'out', 'x.txt'), 'ask', proj)
  fs.rmSync(base, { recursive: true, force: true })
  fs.rmSync(tmpBase, { recursive: true, force: true })
}

section('악성·우회 시도 → null (자동 승인 금지)')
test('ExitPlanMode — 사용자 결정으로 자동 (확인은 task-confirm-guard 가 강제)', 'ExitPlanMode', {}, 'allow')
test('ExitPlanMode (PermissionRequest)', 'ExitPlanMode', {}, 'allow', 'PermissionRequest')
test('"mcp__" 단독 — 서버·도구 이름 없음', 'mcp__', {}, 'null')
test('"mcp__server" — 도구 이름 없음', 'mcp__server', {}, 'null')
test('"mcp__server__" — 빈 도구 이름', 'mcp__server__', {}, 'null')
test('"xmcp__a__b" — 접두 위장', 'xmcp__a__b', {}, 'null')
test('"Bash " — 공백 붙인 위장', 'Bash ', {}, 'null')
test('"skill" — 대소문자 위장', 'skill', {}, 'null')
test('"mcp__a__b; rm -rf /" — 이름에 셸 문자', 'mcp__a__b; rm -rf /', {}, 'null')
test('Bash 를 MCP 처럼 보이게 (mcp__x__Bash 는 MCP 도구라 허용, Bash 자체는 아님)', 'Bash', {}, 'null', 'PermissionRequest')

section('이상·경계 입력 → null (크래시 없이)')
{
  const { execSync } = require('child_process')
  const raw = (stdin) => {
    try { return execSync(`node "${HOOK}"`, { input: stdin, encoding: 'utf8', timeout: 3000 }).trim() } catch { return 'CRASH' }
  }
  const cases = [
    ['빈 stdin', ''],
    ['깨진 JSON', '{not json'],
    ['JSON null', 'null'],
    ['배열', '[]'],
    ['tool_name 숫자', JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 42 })],
    ['tool_name 객체', JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: { name: 'Read' } })],
    ['tool_name 누락', JSON.stringify({ hook_event_name: 'PreToolUse' })],
    ['이벤트 누락 (Read)', JSON.stringify({ tool_name: 'Read' })],
    ['다른 이벤트(PostToolUse)', JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Read' })],
    ['초장문 도구 이름', JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'mcp__a__' + 'b'.repeat(100000) + ' x' })],
  ]
  for (const [desc, stdin] of cases) {
    const out = raw(stdin)
    const pass = out === ''
    console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (출력: ${out.slice(0, 120)})`}`)
    pass ? passed++ : failed++
  }
}

console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
