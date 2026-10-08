#!/usr/bin/env node
/**
 * auto-format.test.js
 * 실행: node .claude/hooks/auto-format.test.js
 *
 * 가짜 포매터(실행 파일)를 임시 프로젝트에 심어 "언어별로 맞는 포매터를, 설정·설치돼 있을 때만" 부르는지 검증한다.
 * 3계층: 정상(언어별 선택·정리 안내) / 악성·우회(파일 이름 명령 주입, 프로젝트 밖·심볼릭 링크·node_modules)
 *        / 이상·경계(설정만·도구만 있음, 포매터 실패·시간 초과 없음, 깨진 입력)
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'auto-format.js')

let passed = 0, failed = 0
const check = (desc, cond, detail) => {
  console.log(`  ${cond ? '✅' : '❌'} ${desc}${cond ? '' : ` → FAIL ${detail !== undefined ? JSON.stringify(detail).slice(0, 300) : ''}`}`)
  cond ? passed++ : failed++
}

const base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'afmt-')))
const LOG = path.join(base, 'calls.log')
// 가짜 포매터: 호출 기록을 남기고, 대상 파일 끝에 "// formatted-by-<이름>" 를 붙인다 (FAIL 모드면 실패)
function fakeBin(p, name, { fail = false } = {}) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, `#!/usr/bin/env node
const fs=require('fs');fs.appendFileSync(${JSON.stringify(LOG)}, ${JSON.stringify(name)}+' '+JSON.stringify(process.argv.slice(2))+'\\n');
${fail ? "process.stderr.write('syntax error at line 1');process.exit(1);" : ''}
const f=process.argv[process.argv.length-1];fs.appendFileSync(f,'\\n// formatted-by-${name}');
`)
  fs.chmodSync(p, 0o755)
}
function project(name, files, bins = {}) {
  const dir = path.join(base, name)
  fs.mkdirSync(dir, { recursive: true })
  for (const [f, c] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), c) }
  for (const [rel, opt] of Object.entries(bins)) fakeBin(path.join(dir, rel), opt.name, opt)
  return dir
}
function run(root, file, { tool = 'Write', event = 'PostToolUse', envPath } = {}) {
  const input = JSON.stringify({ hook_event_name: event, tool_name: tool, tool_input: { file_path: file, content: 'x' } })
  const env = { ...process.env, CLAUDE_PROJECT_DIR: root }
  if (envPath !== undefined) env.PATH = envPath
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', env, timeout: 30000 })
  let ctx = null
  try { ctx = JSON.parse(r.stdout).hookSpecificOutput.additionalContext } catch { /* 출력 없음 */ }
  return { code: r.status, ctx }
}
const calls = () => (fs.existsSync(LOG) ? fs.readFileSync(LOG, 'utf8').trim().split('\n').filter(Boolean) : [])
const reset = () => { try { fs.rmSync(LOG) } catch { /* ignore */ } }

console.log('🔍 auto-format 테스트 시작')

console.log('\n── 정상 경로 (언어별 선택) ──')
{
  const P = project('prettier', { '.prettierrc': '{}', 'src/a.ts': 'const a=1' }, { 'node_modules/.bin/prettier': { name: 'prettier' } })
  reset(); const r = run(P, 'src/a.ts')
  check('TS + prettier 설정·설치 → prettier 실행', calls().length === 1 && calls()[0].startsWith('prettier'), calls())
  check('정리되면 "다시 Read" 안내', r.ctx && r.ctx.includes('prettier') && r.ctx.includes('Read'), r)
  check('파일이 실제로 바뀜', fs.readFileSync(path.join(P, 'src/a.ts'), 'utf8').includes('formatted-by-prettier'))
  reset(); run(P, path.join(P, 'src/a.ts'), { tool: 'Edit' })
  check('Edit 도 동일 (절대경로)', calls().length === 1)
}
{
  const P = project('biome', { 'biome.json': '{}', '.prettierrc': '{}', 'a.tsx': 'x' }, { 'node_modules/.bin/biome': { name: 'biome' }, 'node_modules/.bin/prettier': { name: 'prettier' } })
  reset(); run(P, 'a.tsx')
  check('biome·prettier 둘 다 있으면 biome 우선', calls().length === 1 && calls()[0].startsWith('biome ["format","--write"'), calls())
}
{
  const P = project('pkgprettier', { 'package.json': '{"name":"x","prettier":{"semi":false}}', 'a.js': 'x' }, { 'node_modules/.bin/prettier': { name: 'prettier' } })
  reset(); run(P, 'a.js')
  check('package.json 의 "prettier" 키도 설정으로 인정', calls().length === 1)
}
{
  const P = project('mono', { '.prettierrc': '{}', 'packages/web/src/a.ts': 'x' }, { 'node_modules/.bin/prettier': { name: 'prettier' } })
  reset(); run(P, 'packages/web/src/a.ts')
  check('모노레포 하위 파일 → 루트 설정·도구 사용', calls().length === 1)
}
{
  const P = project('ruff', { 'pyproject.toml': '[tool.ruff]\nline-length = 100\n', 'app/main.py': 'x=1' }, { '.venv/bin/ruff': { name: 'ruff' } })
  reset(); run(P, 'app/main.py')
  check('Python + [tool.ruff] + .venv ruff → ruff format', calls().length === 1 && calls()[0].startsWith('ruff ["format"'), calls())
}
{
  const P = project('black', { 'pyproject.toml': '[tool.black]\nline-length = 88\n', 'a.py': 'x=1' }, { '.venv/bin/black': { name: 'black' } })
  reset(); run(P, 'a.py')
  check('Python + [tool.black] → black', calls().length === 1 && calls()[0].startsWith('black'), calls())
}
{
  const binDir = path.join(base, 'pathbin'); fakeBin(path.join(binDir, 'rustfmt'), 'rustfmt')
  const P = project('rust', { 'Cargo.toml': '[package]\nname="x"\nedition = "2024"\n', 'src/main.rs': 'fn main(){}' })
  reset(); run(P, 'src/main.rs', { envPath: `${binDir}${path.delimiter}${process.env.PATH}` })
  check('Rust + Cargo.toml + rustfmt → Cargo 의 edition 전달', calls().length === 1 && calls()[0].includes('"--edition","2024"'), calls())
}

console.log('\n── 실행하지 않아야 하는 경우 ──')
{
  const P = project('noconf', { 'a.ts': 'x' }, { 'node_modules/.bin/prettier': { name: 'prettier' } })
  reset(); const r = run(P, 'a.ts')
  check('도구만 있고 설정 없음 → 실행 안 함', calls().length === 0 && r.ctx === null)
}
{
  const P = project('nobin', { '.prettierrc': '{}', 'a.ts': 'x' })
  reset(); const r = run(P, 'a.ts')
  check('설정만 있고 도구 미설치 → 실행 안 함 (내려받지 않음)', calls().length === 0 && r.ctx === null)
}
{
  const P = project('java', { '.prettierrc': '{}', 'A.java': 'class A{}' }, { 'node_modules/.bin/prettier': { name: 'prettier' } })
  reset(); run(P, 'A.java')
  check('Java 파일 → 대상 아님', calls().length === 0)
}
{
  const P = project('pyjs', { '.prettierrc': '{}', 'a.py': 'x' }, { 'node_modules/.bin/prettier': { name: 'prettier' } })
  reset(); run(P, 'a.py')
  check('Python 파일에 JS 포매터를 쓰지 않음', calls().length === 0)
}
{
  const P = project('nm', { '.prettierrc': '{}', 'node_modules/x/a.js': 'x', 'dist/a.js': 'x' }, { 'node_modules/.bin/prettier': { name: 'prettier' } })
  reset(); run(P, 'node_modules/x/a.js'); run(P, 'dist/a.js')
  check('node_modules·dist 안 파일 → 실행 안 함', calls().length === 0)
}

console.log('\n── 악성·우회 시도 ──')
{
  const P = project('inject', { '.prettierrc': '{}' }, { 'node_modules/.bin/prettier': { name: 'prettier' } })
  const evil = 'a;touch PWNED;.ts'
  fs.writeFileSync(path.join(P, evil), 'x')
  reset(); run(P, evil)
  check('파일 이름의 셸 문자로 명령 주입 안 됨', !fs.existsSync(path.join(P, 'PWNED')) && calls().length === 1)
}
{
  const P = project('outside', { '.prettierrc': '{}' }, { 'node_modules/.bin/prettier': { name: 'prettier' } })
  const out = path.join(base, 'elsewhere.ts'); fs.writeFileSync(out, 'x')
  reset(); run(P, out); run(P, '../elsewhere.ts')
  check('프로젝트 밖 파일(절대·상대 이동) → 손대지 않음', calls().length === 0 && fs.readFileSync(out, 'utf8') === 'x')
}
{
  const P = project('symlink', { '.prettierrc': '{}' }, { 'node_modules/.bin/prettier': { name: 'prettier' } })
  const target = path.join(base, 'secret.ts'); fs.writeFileSync(target, 'x')
  fs.symlinkSync(target, path.join(P, 'link.ts'))
  reset(); run(P, 'link.ts')
  check('프로젝트 안 심볼릭 링크(밖을 가리킴) → 손대지 않음', calls().length === 0 && fs.readFileSync(target, 'utf8') === 'x')
}

console.log('\n── 이상·경계 경로 ──')
{
  const P = project('fail', { '.prettierrc': '{}', 'a.ts': 'x' }, { 'node_modules/.bin/prettier': { name: 'prettier', fail: true } })
  reset(); const r = run(P, 'a.ts')
  check('포매터 실패 → 막지 않고(exit 0) 경고만', r.code === 0 && r.ctx && r.ctx.includes('실행 실패'), r)
  check('실패 시 파일 그대로', fs.readFileSync(path.join(P, 'a.ts'), 'utf8') === 'x')
}
{
  const P = project('same', { '.prettierrc': '{}', 'a.ts': 'x' })
  const noop = path.join(P, 'node_modules/.bin/prettier'); fs.mkdirSync(path.dirname(noop), { recursive: true })
  fs.writeFileSync(noop, '#!/usr/bin/env node\n'); fs.chmodSync(noop, 0o755)
  const r = run(P, 'a.ts')
  check('이미 정리된 파일(변화 없음) → 안내 없음', r.code === 0 && r.ctx === null)
}
{
  const P = project('del', { '.prettierrc': '{}' }, { 'node_modules/.bin/prettier': { name: 'prettier' } })
  reset(); const r = run(P, 'gone.ts')
  check('존재하지 않는 파일 → 크래시 없이 통과', r.code === 0 && calls().length === 0)
}
for (const [desc, stdin] of [['깨진 JSON', '{x'], ['빈 입력', ''], ['null', 'null'],
  ['PreToolUse 이벤트', JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { file_path: 'a.ts' } })],
  ['file_path 비문자열', JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: 1 } })],
  ['Bash 도구', JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: 'x' } })]]) {
  const r = spawnSync('node', [HOOK], { input: stdin, encoding: 'utf8', timeout: 5000 })
  check(`${desc} → exit 0, 출력 없음`, r.status === 0 && !(r.stdout || '').trim())
}

fs.rmSync(base, { recursive: true, force: true })
console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
