#!/usr/bin/env node
// package-manager-guard.js — PreToolUse Bash Hook (개발 템플릿)
//
// 목적: 프로젝트가 쓰는 패키지 매니저 강제 (2026-10-06 사용자 요청)
//   lock 파일로 매니저를 판단해, 다른 매니저로 의존성을 바꾸는 명령(설치·추가·삭제·업데이트)을 차단한다.
//   다른 매니저로 설치하면 lock 파일이 둘로 갈라져 팀원·CI 와 의존성 버전이 어긋난다.
//
// 판정:
//   - JS:     pnpm-lock.yaml→pnpm · yarn.lock→yarn · package-lock.json→npm · bun.lock(b)→bun
//   - Python: uv.lock→uv · poetry.lock→poetry · Pipfile.lock→pipenv
//   - 실행 명령(npm run test 등)은 lock 파일을 바꾸지 않으므로 통과
//   - 같은 언어의 lock 파일이 둘 이상이거나 없으면 판단 불가 → 통과
// 명령 파싱은 bash-guard 의 analyzeShell 재사용 — 파이프·체인·치환 속 명령도 동일 판정

const fs = require('fs')
const path = require('path')

let analyzeShell = null, findProjectRoot = null
try { ({ analyzeShell, findProjectRoot } = require('./bash-guard.js')) } catch { /* 미설치 → 통과 */ }

const JS_LOCKS = [['pnpm-lock.yaml', 'pnpm'], ['yarn.lock', 'yarn'], ['package-lock.json', 'npm'], ['bun.lock', 'bun'], ['bun.lockb', 'bun']]
const PY_LOCKS = [['uv.lock', 'uv'], ['poetry.lock', 'poetry'], ['Pipfile.lock', 'pipenv']]

// 매니저별로 의존성을 바꾸는 서브커맨드
const JS_MUTATING = {
  npm: new Set(['install', 'i', 'in', 'ins', 'inst', 'insta', 'instal', 'isnt', 'isnta', 'isntal', 'add', 'ci', 'uninstall', 'un', 'unlink', 'remove', 'rm', 'r', 'update', 'up', 'upgrade', 'udpate']),
  pnpm: new Set(['install', 'i', 'add', 'remove', 'rm', 'uninstall', 'un', 'update', 'up', 'upgrade', 'import']),
  yarn: new Set(['install', 'add', 'remove', 'upgrade', 'up', 'upgrade-interactive']),
  bun: new Set(['install', 'i', 'add', 'a', 'remove', 'rm', 'update']),
}
const JS_SUGGEST = { pnpm: 'pnpm install / pnpm add <패키지>', yarn: 'yarn / yarn add <패키지>', npm: 'npm install / npm install <패키지>', bun: 'bun install / bun add <패키지>' }
const PY_SUGGEST = { uv: 'uv sync / uv add <패키지>', poetry: 'poetry install / poetry add <패키지>', pipenv: 'pipenv install / pipenv install <패키지>' }

function detect(dir, table) {
  const found = new Set()
  for (const [file, mgr] of table) {
    try { if (fs.existsSync(path.join(dir, file))) found.add(mgr) } catch { /* ignore */ }
  }
  return found.size === 1 ? [...found][0] : null // 0개·2개 이상 → 판단 불가
}

// 명령이 바꾸려는 대상 디렉토리부터 프로젝트 루트까지 올라가며 lock 파일이 있는 가장 가까운 곳 (모노레포 하위 패키지 대응)
function managerFor(table, startDir, rootDir) {
  let dir = startDir
  for (let hop = 0; dir && hop < 32; hop++) {
    const m = detect(dir, table)
    if (m) return m
    if (dir === rootDir) break
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

function firstPositional(args) {
  for (const a of args) { if (!a.startsWith('-')) return a }
  return null
}

// 반환: { manager, used, kind } (위반) | null
function violationOf(inv, jsMgr, pyMgr) {
  const name = inv.name
  const vals = inv.args
  if (JS_MUTATING[name]) {
    if (!jsMgr || jsMgr === name) return null
    const sub = firstPositional(vals)
    const mutating = name === 'yarn' && sub === null ? true : (sub !== null && JS_MUTATING[name].has(sub))
    return mutating ? { manager: jsMgr, used: `${name} ${sub || ''}`.trim(), kind: 'js' } : null
  }
  if (!pyMgr) return null
  // pip / pip3 / python -m pip
  let pipArgs = null
  if (/^pip(?:3(?:\.\d+)?)?$/.test(name)) pipArgs = vals
  else if (/^python(?:3(?:\.\d+)?)?$/.test(name)) {
    const i = vals.indexOf('-m')
    if (i >= 0 && /^pip(?:3)?$/.test(vals[i + 1] || '')) pipArgs = vals.slice(i + 2)
  }
  if (pipArgs) {
    const sub = firstPositional(pipArgs)
    return sub === 'install' || sub === 'uninstall' ? { manager: pyMgr, used: `pip ${sub}`, kind: 'py' } : null
  }
  if (name === 'uv' && pyMgr !== 'uv') {
    const sub = firstPositional(vals)
    if (['add', 'remove', 'sync', 'lock'].includes(sub)) return { manager: pyMgr, used: `uv ${sub}`, kind: 'py' }
    if (sub === 'pip' && ['install', 'uninstall'].includes(vals[vals.indexOf('pip') + 1])) return { manager: pyMgr, used: 'uv pip install', kind: 'py' }
    return null
  }
  if (name === 'uv' && pyMgr === 'uv') {
    // uv 프로젝트에서 uv pip install 은 lock 을 우회해 venv 만 바꾼다
    const sub = firstPositional(vals)
    if (sub === 'pip' && vals[vals.indexOf('pip') + 1] === 'install') return { manager: 'uv', used: 'uv pip install', kind: 'py' }
    return null
  }
  if (name === 'poetry' && pyMgr !== 'poetry') {
    const sub = firstPositional(vals)
    return ['add', 'remove', 'install', 'update', 'lock'].includes(sub) ? { manager: pyMgr, used: `poetry ${sub}`, kind: 'py' } : null
  }
  if (name === 'pipenv' && pyMgr !== 'pipenv') {
    const sub = firstPositional(vals)
    return ['install', 'uninstall', 'update', 'lock', 'sync'].includes(sub) ? { manager: pyMgr, used: `pipenv ${sub}`, kind: 'py' } : null
  }
  return null
}

function check(command, cwd) {
  if (typeof command !== 'string' || !command.trim() || !analyzeShell) return null
  let acc
  try { acc = analyzeShell(command) } catch { return null }
  const start = path.resolve(cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd())
  const root = (findProjectRoot && findProjectRoot(start)) || start
  const jsMgr = managerFor(JS_LOCKS, start, root)
  const pyMgr = managerFor(PY_LOCKS, start, root)
  if (!jsMgr && !pyMgr) return null
  for (const inv of acc.invocations) {
    if (inv.dynamicName) continue
    const v = violationOf({ name: inv.name, args: inv.args.map(a => String(a.value)) }, jsMgr, pyMgr)
    if (v) {
      const how = v.kind === 'js' ? JS_SUGGEST[v.manager] : PY_SUGGEST[v.manager]
      return `[package-manager-guard] 이 프로젝트는 lock 파일 기준 ${v.manager} 를 씁니다. \`${v.used}\` 는 lock 파일을 갈라지게 하므로 차단합니다. 대신: ${how}`
    }
  }
  return null
}

function handle(input) {
  if (!input || typeof input !== 'object') return null
  if ((input.hook_event_name || input.hookEventName) !== 'PreToolUse' || input.tool_name !== 'Bash') return null
  const cmd = input.tool_input && input.tool_input.command
  const reason = check(cmd, typeof input.cwd === 'string' ? input.cwd : undefined)
  if (!reason) return null
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason } }
}

if (require.main === module) {
  let input = null
  try { input = JSON.parse(fs.readFileSync(0, 'utf8')) } catch { process.exit(0) }
  const r = handle(input)
  if (r) process.stdout.write(JSON.stringify(r) + '\n')
  process.exit(0)
} else {
  module.exports = { handle, check, violationOf, managerFor }
}
