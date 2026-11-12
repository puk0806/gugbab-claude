// pre-approval-write.js — 승인 전 셸 명령(Bash·Monitor)이 파일을 바꾸는지 판정 (task-confirm-guard 전용, 2026-11-10)
//
// 배경: task-confirm-guard 는 Write·Edit·NotebookEdit 만 막아, 승인 전에도 `python3 - <<EOF … open(p,'w')`·`cp x .claude/hooks/`·
//       `sed -i`·`node scripts/build-manifest.js` 로 파일을 바꿀 수 있었다(사용자 결정 2 — "승인 전에는 어떤 방법으로도 파일이 바뀌지 않는다").
// 판정: 막을 이유 문자열을 돌려준다(null = 통과). 읽기·테스트 실행·임시 폴더(메모리·계획 포함) 쓰기는 통과.
//   ① 쓰기 리다이렉트·쓰기 명령(cp·mv·rm·touch·mkdir·tee·sed -i …)의 대상이 예외 폴더가 아니면 막음
//   ② git 의 작업 트리 변경(checkout·restore·reset --hard·apply·stash·clean·pull …)
//   ③ 인터프리터 인라인 코드(python -c·heredoc·node -e …)에 파일 쓰기·삭제·프로세스 실행 API가 보이면 막음
//      스크립트 파일은 테스트 파일이면 통과, 아니면 내용을 읽어 같은 검사(셸 스크립트는 이 판정을 다시 적용)
//   ④ 패키지 매니저: 설치·제거·버전 변경은 막고, 스크립트(npm run x)는 package.json 의 실제 명령을 다시 판정
//   ⑤ 포매터·코드 생성기의 쓰기 옵션(prettier --write·eslint --fix·tsc(--noEmit 없이)·jest -u …)
//   ⑥ 해석할 수 없는 명령(닫히지 않은 따옴표·eval·변수 명령 이름 등)은 막음 (fail-closed)
// 한계: 알려지지 않은 프로그램이 스스로 파일을 쓰는 것(예: 임의 CLI 의 출력 파일 생성)은 이름만으로 알 수 없어 통과한다.
//       난독화한 인라인 코드(문자열 조립 후 getattr·동적 require)는 eval·getattr·동적 require 자체를 막아 줄인다.

'use strict'
const fs = require('fs')
const os = require('os')
const path = require('path')

let G = null
try { G = require('../bash-guard.js'); if (typeof G.analyzeShell !== 'function') G = null } catch { G = null }

const MAX_DEPTH = 3
const MAX_SCRIPT_BYTES = 1024 * 1024
const HOME = (() => { try { return os.homedir() } catch { return null } })()

const INTERP_RE = /^(?:python(?:\d+(?:\.\d+)?)?|pypy3?|node|nodejs|deno|ruby|perl|php|osascript|swift|lua|Rscript|tsx|ts-node)$/
// 쓰기·삭제·실행·동적 코드 API — 출력(print·console.log·sys.stdout.write)은 제외하고 본다
const WRITE_API_RE = new RegExp([
  // python
  String.raw`\bopen\s*\([^)]*?,\s*(?:mode\s*=\s*)?[rf]?['"][^'"]*[wax+]`, String.raw`\.write_(?:text|bytes)\s*\(`, String.raw`\.writelines?\s*\(`,
  String.raw`\bos\.(?:remove|unlink|rename|replace|rmdir|removedirs|makedirs|mkdir|chmod|chown|system|popen|truncate|symlink|link|utime|exec\w*|spawn\w*)\b`,
  String.raw`\bshutil\.`, String.raw`\bsubprocess\b`, String.raw`\.(?:unlink|touch|mkdir|rmdir|rename|symlink_to|hardlink_to|chmod)\s*\(`,
  String.raw`\b(?:exec|eval|compile)\s*\(`, String.raw`__import__`, String.raw`\bimportlib\b`, String.raw`\bgetattr\s*\(`, String.raw`\bpty\.`, String.raw`\bctypes\b`,
  // node
  String.raw`\b(?:writeFile|appendFile|createWriteStream|copyFile|cpSync|renameSync|rmSync|rmdirSync|unlinkSync|mkdirSync|symlinkSync|linkSync|truncateSync|chmodSync|utimesSync|ftruncate)`,
  String.raw`\bfs(?:\.promises)?\.(?:write|rm|rename|unlink|mkdir|cp|copyFile|symlink|link|truncate|chmod|open)\w*`, String.raw`\b(?:promises|fsp)\.(?:write|rm|rename|unlink|mkdir|cp|copyFile|open)\w*`,
  String.raw`child_process`, String.raw`\b(?:execSync|execFileSync|spawnSync|execFile|spawn|fork)\s*\(`, String.raw`\bnew\s+Function\b`, String.raw`\bFunction\s*\(`,
  String.raw`\brequire\s*\(\s*(?!process\.cwd\(\)|path\.(?:join|resolve)\(|require\(\s*['"](?:node:)?(?:os|path)['"]\s*\)\.homedir\(\)|os\.homedir\(\)|__dirname|\$\{)[^'"\s)]`, String.raw`\bimport\s*\(\s*[^'"\s)]`, String.raw`process\.binding`, String.raw`\bvm\.`, String.raw`\bDeno\.(?:write|remove|rename|mkdir|run|Command)`, String.raw`\bBun\.(?:write|spawn)`,
  // ruby·perl·php
  String.raw`\bFile\.(?:write|open|delete|rename|unlink|chmod)`, String.raw`\bFileUtils\b`, String.raw`\bIO\.write`, String.raw`\bsystem\s*\(`, String.raw`\bunlink\b`,
  String.raw`\bopen\s*\(?\s*(?:my\s+)?\$?\w*\s*,\s*['"]?\s*(?:\+?[>|]|>>)`, String.raw`\bfile_put_contents\b`, String.raw`\bfopen\s*\([^)]*['"][wax+]`, String.raw`\bdo\s+shell\s+script\b`,
].join('|'))
const OUTPUT_ONLY_RE = /\b(?:sys\.)?(?:stdout|stderr)\.write\s*\(|process\.(?:stdout|stderr)\.write\s*\(/g

const TEST_FILE_RE = /(?:^|\/)(?:test_[^/]*\.py|[^/]*_test\.(?:py|go|rb)|[^/]*\.(?:test|spec)\.[cm]?[jt]sx?|[^/]*_spec\.rb)$/
const TEST_DIR_RE = /(?:^|\/)(?:__tests__|tests?|spec)\//
const PY_SAFE_MODULES = new Set(['pytest', 'unittest', 'json.tool', 'doctest', 'py_compile', 'tabnanny', 'pydoc', 'site', 'platform', 'sysconfig', 'timeit'])

const PKG_MANAGERS = new Set(['npm', 'pnpm', 'yarn', 'bun'])
const PKG_WRITE_SUBS = new Set(['install', 'i', 'in', 'ins', 'add', 'remove', 'rm', 'r', 'uninstall', 'un', 'unlink', 'update', 'up', 'upgrade', 'ci',
  'link', 'ln', 'dedupe', 'ddp', 'prune', 'version', 'publish', 'init', 'create', 'patch', 'patch-commit', 'rebuild', 'import', 'pack', 'set', 'config', 'pkg', 'fund'])
const PKG_EXEC_SUBS = new Set(['exec', 'dlx', 'x'])
const PKG_VALUE_OPTS = new Set(['--filter', '-F', '-C', '--dir', '--prefix', '-w', '--workspace', '--cwd'])
const PKG_READ_SUBS = new Set(['ls', 'list', 'outdated', 'view', 'info', 'show', 'why', 'help', 'audit', 'search', 'bin', 'root', 'whoami', 'ping', 'doctor', 'explain', 'query', 'licenses', '-v', '--version', '-h', '--help'])
const RUNNER_ALIASES = new Set(['npx', 'pnpx', 'bunx'])

// 도구별 쓰기 옵션 — 해당 옵션이 있으면 파일을 고친다
const TOOL_WRITE_FLAGS = {
  prettier: ['--write', '-w'], eslint: ['--fix'], stylelint: ['--fix'], biome: ['--write', '--fix', '--apply', '--apply-unsafe', '--unsafe'],
  ruff: ['--fix'], jest: ['-u', '--updateSnapshot', '--update-snapshot'], vitest: ['-u', '--update'], playwright: ['-u', '--update-snapshots'],
  gofmt: ['-w'], 'clang-format': ['-i'], autopep8: ['-i', '--in-place'], 'standard': ['--fix'], xo: ['--fix'], dprint: ['fmt'],
}
// 기본이 쓰기 — 확인 옵션이 있을 때만 통과
const DEFAULT_WRITE_TOOLS = { black: ['--check', '--diff'], isort: ['--check', '--check-only', '--diff'], rustfmt: ['--check'], 'ruff format': ['--check', '--diff'],
  tsc: ['--noEmit', '--help', '-h', '--version', '-v', '--showConfig', '--listFilesOnly'] }
const CODEGEN_TOOLS = new Set(['prisma', 'drizzle-kit', 'openapi-generator', 'openapi-generator-cli', 'graphql-codegen', 'protoc', 'buf', 'sqlc', 'orval', 'swagger-codegen', 'hygen', 'plop', 'create-react-app', 'create-next-app', 'degit', 'giget'])
const CODEGEN_READ = { prisma: ['validate', '--version', '-v', 'version', '--help'], 'drizzle-kit': ['check', '--version', '--help'] }

const WRITE_ALL = new Set(['rm', 'rmdir', 'unlink', 'shred', 'touch', 'mkdir', 'truncate', 'chmod', 'chown', 'chgrp', 'chflags', 'xattr', 'setfacl',
  'gzip', 'gunzip', 'bzip2', 'bunzip2', 'xz', 'unxz', 'zstd', 'trash', 'srm', 'mkfifo', 'mknod'])
const ALWAYS_BLOCK = new Set(['make', 'gmake', 'cmake', 'ninja', 'just', 'task', 'scons', 'bazel', 'patch', 'ex', 'vi', 'vim', 'nvim', 'nano', 'emacs', 'ed',
  'mkfs', 'diskutil', 'hdiutil', 'launchctl', 'crontab', 'defaults', 'plutil', 'sqlite3', 'mysql', 'psql', 'mongosh', 'redis-cli', 'ansible', 'terraform', 'pulumi', 'kubectl', 'helm'])
const GIT_WORKTREE_WRITE = new Set(['checkout', 'switch', 'restore', 'apply', 'am', 'merge', 'rebase', 'cherry-pick', 'revert', 'pull', 'clean', 'mv', 'rm',
  'worktree', 'submodule', 'sparse-checkout', 'checkout-index', 'read-tree', 'bisect', 'init', 'clone', 'stash', 'reset', 'config', 'filter-branch', 'filter-repo', 'lfs', 'archive', 'format-patch', 'bundle'])
const HARNESS_CLIS = new Set(['gugbab-claude', 'lfmall-claude'])
const HARNESS_WRITE_SUBS = new Set(['on', 'off', 'preset', 'update', 'self-update', 'install', 'uninstall', 'reset', 'migrate', 'channel', 'pin', 'set', 'enable', 'disable'])

const vals = (inv) => inv.args.map(a => G.cleanValue(a.value))
const positional = (v) => v.filter(x => !x.startsWith('-'))
const hasAny = (v, opts) => v.some(x => opts.some(o => x === o || x.startsWith(o + '=')))

function exemptAbs(abs, isExemptPath) {
  if (!abs) return false
  if (/^\/dev\/(?:null|zero|stdout|stderr|stdin|tty|fd\/\d+)$/.test(abs)) return true
  return !!isExemptPath(abs)
}

function expandHome(v) {
  if (HOME && (v === '~' || v.startsWith('~/'))) return HOME + v.slice(1)
  return v
}

// cd 를 따라 각 명령이 실행될 폴더를 추적한다(변수·치환으로 옮기면 null = 모름)
function trackCwd(inv, vcwd) {
  if (inv.name !== 'cd' && inv.name !== 'pushd') return vcwd
  const p = positional(vals(inv))
  if (!p.length) return HOME || null
  const a = inv.args.find(x => !G.cleanValue(x.value).startsWith('-'))
  if (!a || (a.dyn && !/^\$(?:\{HOME\}|HOME(?![A-Za-z0-9_]))/.test(a.value)) || a.subst) return null
  let v = G.cleanValue(a.value)
  if (a.dyn) v = (HOME || '') + v.replace(/^\$(?:\{HOME\}|HOME)/, '')
  v = expandHome(v)
  if (!path.isAbsolute(v)) { if (!vcwd) return null; v = path.resolve(vcwd, v) }
  return path.resolve(v)
}

function targetAbs(word, vcwd) {
  const r = G.resolveRmTarget(word, vcwd)
  return r ? r.abs : null
}

// `$NAME/…` 쓰기 대상 — 명령 안의 NAME 대입이 **모두** 글자 그대로의 값이면 그 값들로 펼친 경로 목록(하나라도 모르면 null).
// 쓰기 대상 판정에만 쓴다: 펼친 경로가 전부 예외 폴더일 때만 통과하므로, 어느 대입이 실제로 적용돼도 결과가 같다
const ASSIGN_VALUE_RE = /^(?:'([^']*)'|"([^"$`\\]*)"|([^\s;&|()<>'"$`\\]*))(?=$|[\s;&|)])/
function varCandidates(word, raw) {
  const m = /^\$(?:\{([A-Za-z_][A-Za-z0-9_]*)\}|([A-Za-z_][A-Za-z0-9_]*))([^$`]*)$/.exec(String(word.value))
  if (!m || word.subst) return null
  const name = m[1] || m[2], rest = m[3]
  if (/^(?:HOME|PWD)$/.test(name)) return null
  // 다른 방식으로 값을 바꾸면(read·for·export NAME=$(…)·declare·+= 등) 모름
  if (new RegExp(`(?:\\b(?:read|for|mapfile|readarray|declare|typeset|local|let|getopts|printf\\s+-v)\\b[^;&|\\n]*\\b${name}\\b)|\\b${name}\\+=`).test(raw)) return null
  const re = new RegExp(`(?:^|[\\s;&|(])(?:export\\s+)?${name}=`, 'g')
  const values = []
  for (const a of raw.matchAll(re)) {
    const vm = ASSIGN_VALUE_RE.exec(raw.slice(a.index + a[0].length))
    if (!vm) return null
    values.push(vm[1] ?? vm[2] ?? vm[3])
  }
  if (!values.length) return null
  // 따옴표 없이 쓴 변수는 공백·glob 에서 여러 단어로 나뉜다(`S="/tmp/a b"; touch $S/x` → b/x 를 현재 폴더에) — 그런 값은 모름
  if (!word.quoted && values.some(v => /[\s*?[\]]/.test(v))) return null
  return values.map(v => expandHome(v) + rest)
}

function readScript(file, vcwd) {
  let p = expandHome(file)
  if (!path.isAbsolute(p)) { if (!vcwd) return null; p = path.resolve(vcwd, p) }
  try {
    const st = fs.statSync(p)
    if (!st.isFile() || st.size > MAX_SCRIPT_BYTES) return null
    return { abs: p, text: fs.readFileSync(p, 'utf8') }
  } catch { return null }
}

function codeWrites(text) {
  return WRITE_API_RE.test(String(text).replace(OUTPUT_ONLY_RE, ' '))
}

// 패키지 매니저 스크립트 이름 → package.json 의 실제 명령
function pkgScript(dir, name) {
  if (!dir) return null
  try {
    const pj = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
    const s = pj && pj.scripts
    if (!s || typeof s !== 'object' || typeof s[name] !== 'string') return null
    return [s[`pre${name}`], s[name], s[`post${name}`]].filter(x => typeof x === 'string')
  } catch { return null }
}

function hasPackageJson(dir) {
  try { return !!dir && fs.statSync(path.join(dir, 'package.json')).isFile() } catch { return false }
}

function toolCheck(tool, rest) {
  const flags = TOOL_WRITE_FLAGS[tool]
  if (flags && hasAny(rest, flags)) return `${tool} ${rest.find(x => flags.some(f => x === f || x.startsWith(f + '=')))} 은 파일을 고칩니다`
  const key = tool === 'ruff' && rest[0] === 'format' ? 'ruff format' : tool
  const safe = DEFAULT_WRITE_TOOLS[key]
  if (safe && !hasAny(rest, safe)) return `${key} 는 확인 옵션(${safe[0]}) 없이 실행하면 파일을 고칩니다`
  if (CODEGEN_TOOLS.has(tool)) {
    const ok = CODEGEN_READ[tool]
    if (!ok || !rest.some(x => ok.includes(x))) return `${tool} 는 파일을 만들거나 고칠 수 있습니다`
  }
  return null
}

function checkPkg(inv, v, vcwd, depth, ctx) {
  let dir = vcwd, filtered = false, k = 0
  for (; k < v.length; k++) {
    if (PKG_VALUE_OPTS.has(v[k])) {
      if (v[k] === '-C' || v[k] === '--dir' || v[k] === '--prefix' || v[k] === '--cwd') { const d = v[k + 1]; dir = d ? (path.isAbsolute(expandHome(d)) ? expandHome(d) : (vcwd ? path.resolve(vcwd, d) : null)) : null } else filtered = true
      k++; continue
    }
    if (v[k].startsWith('--filter=') || v[k].startsWith('--workspace=')) { filtered = true; continue }
    if (v[k].startsWith('-') && !PKG_READ_SUBS.has(v[k])) continue
    break
  }
  const sub = v[k]
  if (sub === undefined) return inv.name === 'yarn' || inv.name === 'bun' ? `${inv.name} 를 인자 없이 실행하면 의존성을 설치합니다` : null
  const rest = v.slice(k + 1)
  if (PKG_READ_SUBS.has(sub)) return sub === 'audit' && rest.includes('fix') ? `${inv.name} audit fix 는 의존성을 바꿉니다` : null
  if (PKG_WRITE_SUBS.has(sub)) return `${inv.name} ${sub} 는 의존성·패키지 파일을 바꿉니다`
  if (PKG_EXEC_SUBS.has(sub)) return checkRunner(rest, vcwd, depth, ctx)
  const name = sub === 'run' || sub === 'run-script' ? rest.find(x => !x.startsWith('-')) : sub
  if (!name) return null
  const scripts = filtered ? null : pkgScript(dir, name)
  if (!scripts) {
    if (/^(?:test|t|tst|lint|typecheck|type-check|check|tsc)(?::|$)/.test(name) && !/fix|write|update|format/i.test(name)) return null
    // package.json 은 있는데 그 이름의 스크립트가 없다 = 설치된 실행 파일(pnpm vitest·yarn tsc) — 도구 규칙으로 본다
    if (!filtered && hasPackageJson(dir) && sub !== 'run' && sub !== 'run-script') return checkRunner(v.slice(k), vcwd, depth, ctx)
    return `${inv.name} ${name} 스크립트의 실제 명령을 찾지 못해(--filter·package.json 없음) 파일을 바꾸는지 알 수 없습니다`
  }
  for (const s of scripts) {
    const r = reasonFor(s, dir, depth + 1, ctx)
    if (r) return `${inv.name} ${name} → ${r}`
  }
  return null
}

function checkRunner(rest, vcwd, depth, ctx) {
  const r = rest.filter(x => x !== '--yes' && x !== '-y' && !x.startsWith('--package'))
  const tool = (r.find(x => !x.startsWith('-')) || '').replace(/@[^/]*$/, '').replace(/^.*\//, '')
  if (!tool) return null
  const after = r.slice(r.findIndex(x => !x.startsWith('-')) + 1)
  if (tool === 'tsx' || tool === 'ts-node') return checkScriptArgs(tool, after, vcwd, depth, ctx)
  return toolCheck(tool, after)
}

// 인터프리터 — 인라인 코드면 내용 검사, 스크립트 파일이면 테스트 파일은 통과·아니면 내용 검사
function checkScriptArgs(name, v, vcwd, depth, ctx) {
  if (/^node/.test(name) && v.includes('--test')) return null
  for (let i = 0; i < v.length; i++) {
    const x = v[i]
    if (x === '-m' && /^py/.test(name)) {
      const mod = v[i + 1] || ''
      return PY_SAFE_MODULES.has(mod) ? null : `${name} -m ${mod || '?'} 모듈은 파일을 바꾸는지 알 수 없습니다`
    }
    if (/^(?:-c|-e|-p|-pe|-E|-r|--eval|--print|--command|-)$/.test(x) || /^--(?:eval|print)=/.test(x)) {
      return codeWrites(ctx.raw) ? `${name} 인라인 코드에 파일 쓰기·삭제·명령 실행 코드가 있습니다` : null
    }
    if (/^-(?:W|X|Q|I|O)$/.test(x)) { i++; continue }
    if (x.startsWith('-')) continue
    if (TEST_FILE_RE.test(x) || TEST_DIR_RE.test(x)) return null
    const sc = readScript(x, vcwd)
    if (!sc) return `${name} 스크립트(${x})를 읽을 수 없어 파일을 바꾸는지 알 수 없습니다`
    return codeWrites(sc.text) ? `${name} 스크립트(${path.basename(x)})에 파일 쓰기·삭제·명령 실행 코드가 있습니다` : null
  }
  // 스크립트 인자 없음 = 표준입력·heredoc 으로 코드를 받는다
  return codeWrites(ctx.raw) ? `${name} 표준입력 코드에 파일 쓰기·삭제·명령 실행 코드가 있습니다` : null
}

function checkShell(inv, v, vcwd, depth, ctx) {
  // -c '…' 와 표준입력 내용은 bash-guard 해석기가 이미 펼쳐 같은 목록에 넣는다. 스크립트 파일만 읽어 다시 판정
  for (let i = 0; i < v.length; i++) {
    const x = v[i]
    if (/^-[A-Za-z]*c[A-Za-z]*$/.test(x) || x === '-s' || x === '-') return null
    if (/^[-+]o$/.test(x)) { i++; continue }
    if (x.startsWith('-') || x.startsWith('+')) continue
    const sc = readScript(x, vcwd)
    if (!sc) return `${inv.name} 스크립트(${x})를 읽을 수 없어 파일을 바꾸는지 알 수 없습니다`
    const r = reasonFor(sc.text, path.dirname(sc.abs) === vcwd ? vcwd : vcwd, depth + 1, ctx)
    return r ? `${inv.name} ${path.basename(x)} → ${r}` : null
  }
  if (inv.inPipe) return null // 파이프로 받은 내용은 해석기가 펼쳤거나(echo·heredoc) 모르는 내용 — 모르는 내용은 아래에서
  return null
}

function checkGit(inv, vcwd) {
  const g = inv.git
  if (!g || !g.sub || g.subDyn) return 'git 하위 명령을 정적으로 알 수 없습니다'
  if (Object.keys(g.aliases || {}).length) return 'git -c alias 로 정의한 명령은 판정할 수 없습니다'
  const a = g.args.map(x => G.cleanValue(x.value))
  const sub = g.sub
  if (!GIT_WORKTREE_WRITE.has(sub)) return null
  if (sub === 'stash' && (a[0] === 'list' || a[0] === 'show')) return null
  if (sub === 'worktree' && a[0] === 'list') return null
  if (sub === 'submodule' && (a.length === 0 || a[0] === 'status' || a[0] === 'summary' || a[0] === 'foreach' && false)) return null
  if (sub === 'clean' && a.some(x => x === '-n' || x === '--dry-run' || /^-[a-z]*n/.test(x))) return null
  if (sub === 'apply' && a.some(x => ['--check', '--stat', '--numstat', '--summary'].includes(x)) && !a.includes('--apply')) return null
  if (sub === 'reset' && !a.some(x => ['--hard', '--merge', '--keep'].includes(x))) return null // --soft·--mixed·경로 지정은 인덱스·HEAD 만 바꾼다
  if (sub === 'rm' && a.includes('--cached')) return null
  if (sub === 'config' && a.some(x => /^(?:--get|--get-all|--get-regexp|--list|-l|--show-origin|--show-scope)$/.test(x))) return null
  if (sub === 'lfs' && ['ls-files', 'status', 'env', 'version', 'track'].includes(a[0]) && a[0] !== 'track') return null
  if (sub === 'bisect' && ['log', 'view', 'visualize'].includes(a[0])) return null
  if (sub === 'clone' || sub === 'init' || sub === 'archive' || sub === 'format-patch' || sub === 'bundle') {
    const dest = sub === 'archive' ? (a.find(x => x.startsWith('--output=')) || '').slice(9) || null
      : sub === 'format-patch' ? ((a[a.indexOf('-o') + 1]) || (a.find(x => x.startsWith('--output-directory=')) || '').slice(19) || null)
        : sub === 'bundle' ? (a[0] === 'create' ? a[1] : null) : positional(a).slice(sub === 'clone' ? 1 : 0).pop()
    if (sub === 'archive' && !dest) return null // 표준출력으로 — 쓰기는 리다이렉트가 판정
    if (dest && path.isAbsolute(expandHome(dest)) && ctxExempt(path.resolve(expandHome(dest)))) return null
    if (dest && vcwd && !path.isAbsolute(expandHome(dest)) && ctxExempt(path.resolve(vcwd, dest))) return null
    if (sub === 'bundle' && a[0] !== 'create') return null
  }
  return `git ${sub} 는 작업 트리·저장소 파일을 바꿉니다`
}

let ctxExempt = () => false

// 한 명령 문자열의 이유 — depth 는 스크립트·package.json 을 따라간 깊이
function reasonFor(cmd, cwd, depth, ctx) {
  if (depth > MAX_DEPTH) return '스크립트를 너무 깊이 따라가야 해 판정할 수 없습니다'
  // 같은 명령 안에서 글자 그대로 정한 변수(`S=/tmp/x; node $S/a.js`)는 풀어서 본다 — bash-guard 와 같은 풀이
  const lit = typeof G.resolveLiteralVars === 'function' ? G.resolveLiteralVars(cmd) : null
  if (lit && lit.changed && typeof lit.cmd === 'string') cmd = lit.cmd
  const acc = G.analyzeShell(cmd)
  if (acc.unknown.length) return `명령을 해석할 수 없습니다(${acc.unknown[0]})`
  let vcwd = cwd
  for (const inv of acc.invocations) {
    if (inv.dynamicName) return '실행할 명령 이름이 변수라 판정할 수 없습니다'
    const name = inv.name
    const v = vals(inv)
    // 쓰기 리다이렉트·쓰기 명령 대상
    const targets = [...G.writeLocationTargets(inv)]
    if (WRITE_ALL.has(name)) {
      if (name === 'chmod' || name === 'chown' || name === 'chgrp') targets.push(...inv.args.filter(a => !a.value.startsWith('-')).slice(1))
      else if (name === 'xattr' && !v.some(x => /^-[a-z]*[wdc]/.test(x))) { /* 읽기 */ } else targets.push(...inv.args.filter(a => !a.value.startsWith('-')))
    }
    if (name === 'dd') for (const a of inv.args) if (/^of=/.test(a.value)) targets.push({ ...a, value: a.value.slice(3) })
    if ((name === 'curl') ) {
      for (let i = 0; i < inv.args.length; i++) {
        const x = G.cleanValue(inv.args[i].value)
        if (x === '-o' || x === '--output' || x === '--output-dir' || x === '-c' || x === '--cookie-jar' || x === '-D' || x === '--dump-header') { if (inv.args[i + 1]) targets.push(inv.args[i + 1]) }
        else if (/^--(?:output|output-dir|cookie-jar|dump-header)=/.test(x)) targets.push({ ...inv.args[i], value: x.replace(/^[^=]+=/, '') })
        else if (/^-[A-Za-z]*[OJ]/.test(x) || x === '--remote-name' || x === '--remote-name-all') targets.push({ value: vcwd ? vcwd + '/x' : 'x', dyn: !vcwd })
      }
    }
    if (name === 'wget' && !v.some(x => x === '--spider' || x === '-O-' || x === '-qO-')) {
      const o = v.indexOf('-O')
      if (o >= 0 && v[o + 1] === '-') { /* 표준출력 */ } else if (o >= 0 && inv.args[o + 1]) targets.push(inv.args[o + 1])
      else targets.push({ value: vcwd ? vcwd + '/x' : 'x', dyn: !vcwd })
    }
    for (const t of targets) {
      const raw = G.cleanValue(t.value)
      if (raw === '-' && (name === 'curl' || name === 'wget')) continue // 표준출력
      if (/^\/dev\/(?:null|zero|stdout|stderr|stdin|tty|fd\/\d+)$/.test(raw) || /^&?\d*$/.test(raw) && t.dup) continue
      const isDyn = t.dyn && !/^\$(?:\{(?:HOME|PWD)\}|(?:HOME|PWD))/.test(t.value)
      if (isDyn) {
        const cands = varCandidates(t, ctx.raw)
        if (cands && cands.every(c => path.isAbsolute(c) && exemptAbs(path.resolve(c), ctx.isExemptPath))) continue
      }
      const abs = isDyn ? null : targetAbs(t, vcwd)
      if (!exemptAbs(abs, ctx.isExemptPath)) return `${name || '리다이렉트'} 가 ${abs ? path.basename(abs) || abs : '알 수 없는 위치'} 에 씁니다`
    }
    if (ALWAYS_BLOCK.has(name)) return `${name} 는 파일을 바꿀 수 있는 명령입니다`
    if ((name === 'sed' || name === 'gsed' || name === 'perl') && inv.args.some(a => /^-[A-Za-z]*i/.test(a.value) || a.value.startsWith('--in-place'))) {
      // 대상은 위 targets 에서 이미 봤다 — 여기는 대상 없이 -i 만 있는 경우
    }
    if ((name === 'tar' || name === 'bsdtar' || name === 'gtar') && !v.some(x => /^-?[A-Za-z]*t/.test(x) && !/^-?[A-Za-z]*[xc]/.test(x))) {
      const cdir = v.indexOf('-C')
      const dest = cdir >= 0 ? v[cdir + 1] : null
      const fIdx = v.findIndex(x => /^-?[A-Za-z]*f$/.test(x))
      const creates = v.some(x => /^-?[A-Za-z]*c/.test(x) && !x.startsWith('--'))
      const out = creates && fIdx >= 0 ? v[fIdx + 1] : dest
      const abs = out ? (path.isAbsolute(expandHome(out)) ? path.resolve(expandHome(out)) : (vcwd ? path.resolve(vcwd, out) : null)) : vcwd
      if (!exemptAbs(abs, ctx.isExemptPath)) return `${name} 가 파일을 풀거나 만듭니다`
    }
    if (name === 'unzip' && !v.some(x => x === '-l' || x === '-Z' || x === '-t' || x === '-v')) {
      const d = v.indexOf('-d')
      const out = d >= 0 ? v[d + 1] : null
      const abs = out ? (path.isAbsolute(expandHome(out)) ? path.resolve(expandHome(out)) : (vcwd ? path.resolve(vcwd, out) : null)) : vcwd
      if (!exemptAbs(abs, ctx.isExemptPath)) return 'unzip 이 파일을 풉니다'
    }
    if (name === 'git') { const r = checkGit(inv, vcwd); if (r) return r }
    // `preset` 에 이름이 없으면 목록만 보여 준다(cli/main.js — 이름 없으면 출력 후 끝) → 판정 대상 아님 (2026-11-11, /harness preset 오탐)
    if (HARNESS_CLIS.has(name) && HARNESS_WRITE_SUBS.has(positional(v)[0]) && !(positional(v)[0] === 'preset' && positional(v).length === 1)) return `${name} ${positional(v)[0]} 는 하네스 설정을 바꿉니다`
    if (PKG_MANAGERS.has(name)) { const r = checkPkg(inv, v, vcwd, depth, ctx); if (r) return r }
    if (RUNNER_ALIASES.has(name)) { const r = checkRunner(v, vcwd, depth, ctx); if (r) return r }
    if (INTERP_RE.test(name)) { const r = checkScriptArgs(name, v, vcwd, depth, ctx); if (r) return r }
    if (G.SHELL_NAMES.has(name)) { const r = checkShell(inv, v, vcwd, depth, ctx); if (r) return r }
    if (name === 'source' || name === '.') {
      const sc = readScript(v[0] || '', vcwd)
      if (!sc) return `${name} 로 읽을 스크립트를 찾지 못했습니다`
      const r = reasonFor(sc.text, vcwd, depth + 1, ctx)
      if (r) return r
    }
    if (TOOL_WRITE_FLAGS[name] || DEFAULT_WRITE_TOOLS[name] || CODEGEN_TOOLS.has(name) || name === 'ruff') { const r = toolCheck(name, v); if (r) return r }
    if (['gradle', 'gradlew', './gradlew', 'mvn', 'mvnw', './mvnw'].includes(name) || /gradlew$|mvnw$/.test(name)) {
      const bad = positional(v).find(x => /spotless(?:Apply)?$|format|generate|openApi|clean|publish|install|wrapper|flyway|liquibase|jooq|deploy|release/i.test(x))
      if (bad) return `${name} ${bad} 는 파일을 만들거나 고칩니다`
    }
    if (name === 'cargo') {
      const sub = positional(v)[0]
      if (['fmt', 'fix', 'add', 'remove', 'rm', 'update', 'install', 'new', 'init', 'generate-lockfile', 'vendor', 'publish'].includes(sub) && !(sub === 'fmt' && v.includes('--check'))) return `cargo ${sub} 는 파일을 바꿉니다`
    }
    if (name === 'go') {
      const p = positional(v)
      if (['fmt', 'generate', 'get', 'install', 'work', 'fix'].includes(p[0]) || (p[0] === 'mod' && !['download', 'verify', 'graph', 'why'].includes(p[1]))) return `go ${p.slice(0, 2).join(' ')} 는 파일을 바꿉니다`
    }
    if (['pip', 'pip3', 'uv', 'poetry', 'pipenv', 'pdm', 'conda', 'brew', 'gem', 'bundle', 'composer'].includes(name)) {
      const p = positional(v)
      if ((name === 'uv' || name === 'poetry' || name === 'pdm' || name === 'pipenv') && p[0] === 'run') {
        const r = reasonFor(inv.args.slice(inv.args.findIndex(a => a.value === 'run') + 1).map(a => `'${String(G.cleanValue(a.value)).replace(/'/g, `'\\''`)}'`).join(' '), vcwd, depth + 1, ctx)
        if (r) return r
      } else if (!['list', 'show', 'freeze', 'check', 'search', 'info', 'outdated', 'tree', 'doctor', 'config', 'env', 'version', '--version', 'help', 'pip'].includes(p[0]) || (name === 'uv' && p[0] === 'pip' && !['list', 'show', 'freeze', 'check'].includes(p[1]))) {
        return `${name} ${p[0] || ''} 는 패키지·잠금 파일을 바꿀 수 있습니다`
      }
    }
    if ((name === 'docker' || name === 'podman') && (v.includes('cp') || (positional(v)[0] === 'run' && v.some(x => /^(?:-v|--volume|--mount)(?:=|$)/.test(x))) || (positional(v)[0] === 'compose' && v.includes('up') && false))) return `${name} 가 호스트 파일을 바꿀 수 있습니다`
    vcwd = trackCwd(inv, vcwd)
  }
  return null
}

// 승인 전 셸 명령의 차단 이유 (null = 통과). opts.isExemptPath(abs) — 임시·메모리·계획 폴더
function preApprovalWriteReason(cmd, cwd, opts = {}) {
  if (typeof cmd !== 'string' || !cmd.trim()) return null
  if (!G) return 'bash-guard 해석기를 불러오지 못해 명령이 파일을 바꾸는지 판정할 수 없습니다'
  const isExemptPath = typeof opts.isExemptPath === 'function' ? opts.isExemptPath : () => false
  ctxExempt = (abs) => exemptAbs(abs, isExemptPath)
  try {
    return reasonFor(cmd.trim(), cwd ? path.resolve(cwd) : null, 0, { raw: cmd, isExemptPath })
  } catch (e) {
    return `판정 중 오류가 나 통과시키지 않습니다(${e && e.message ? e.message.slice(0, 80) : 'unknown'})`
  }
}

module.exports = { preApprovalWriteReason, codeWrites, WRITE_API_RE }
