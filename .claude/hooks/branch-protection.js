#!/usr/bin/env node
// branch-protection.js — PreToolUse Bash
//
// 브랜치 보호 규칙 강제 (2가지):
//   1. main/master 브랜치로 직접 push 금지 — PR을 통해 머지해야 함
//   2. 피처 브랜치에서 새 브랜치 생성 금지 — 새 브랜치는 반드시 main(또는 master)에서
//
// 명령 해석은 bash-guard.js 의 셸 분석기(analyzeShell)를 공유한다 (2026-09-26 사각지대 감사 C2):
//   파이프·체인·$()·서브셸·bash -c·env/command 전치·git 전역 옵션(-C 등)·따옴표 분할·대소문자를
//   풀어 실제 실행될 git 명령만 검사 → 인용 텍스트(echo "git push origin main")는 오탐하지 않는다.
// push 대상 판정은 refspec 단위: -u/--set-upstream, +main, refs/heads/main, HEAD:main, :main(삭제),
//   --all/--mirror, 동적 refspec("$(…)"), --repo=<원격>(뒤 인자가 전부 refspec)까지 main/master 대상이면 차단.
//   브랜치명에 main 이 "포함"될 뿐인 feature/main-fix, main-backup 은 허용.
//
// 2026-11-06 감사 보강:
//   - 판정 기준 레포 = 실제로 git 이 도는 폴더: 훅 입력 cwd(input.cwd) → 앞선 cd/pushd → git -C 를 따라간다.
//     예전엔 훅 프로세스 cwd 의 브랜치만 읽고, 비면(detached HEAD·레포 아님) 통과시켜
//     `git -C <레포> push origin HEAD:main`, detached 의 `git push origin HEAD:main` 이 빠져나갔다.
//   - 브랜치를 못 읽으면(detached·레포 아님·동적 경로·서브셸 cd·GIT_DIR/--git-dir) push 는 막는다(fail-closed).
//     보호 브랜치가 아닌 원격 브랜치 삭제(--delete feature/x)만 예외.
//   - 분석기가 내용을 볼 수 없는 셸 넘김(echo … | sh, cat <<'EOF' | bash, bash <<<…, xargs git, $(echo git) push,
//     eval "$X", source, sh -c "$(…)", python -c/node -e) 에 push 문자열이 있으면 차단.
//   - Rule 2 생성 변형 추가: git branch <새이름>(-c 복사 포함), git worktree add -b/-B/--orphan·이름 자동 생성,
//     붙여 쓴 -bx/-cx, 짧은 옵션 묶음(-qb), --create=x, --orphan.
// bash-guard.js 를 불러올 수 없으면(단독 설치 등) 정규식 판정으로 폴백한다.

const { execFileSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const PROTECTED = new Set(['main', 'master'])
const isProtected = (b) => typeof b === 'string' && PROTECTED.has(b.toLowerCase())
const TAG = '[branch-protection]'
const HOME = (() => { try { return path.resolve(os.homedir()) } catch { return null } })()

let analyzer = null
try { analyzer = require('./bash-guard.js') } catch { analyzer = null }
let W = null
try { W = require('./lib/winpath') } catch { W = null }
const IS_WIN = process.platform === 'win32'

function blockPush(reason, onProtected) {
  process.stderr.write(`${TAG} main 브랜치로 직접 push할 수 없습니다.${reason ? ` (${reason})` : ''}\n`)
  process.stderr.write('  → PR(Pull Request)을 통해 머지해야 합니다.\n')
  if (onProtected) {
    process.stderr.write('\n  아래 순서로 진행하세요:\n')
    process.stderr.write('\n  1) 피처 브랜치 생성 (현재 커밋이 함께 이동됩니다):\n')
    process.stderr.write('       git checkout -b feature/{작업명}\n')
    process.stderr.write('\n  2) 피처 브랜치로 push:\n')
    process.stderr.write('       git push origin feature/{작업명}\n')
    process.stderr.write('\n  3) GitHub에서 PR 생성 후 main에 머지하세요.\n')
  }
  process.exit(2)
}

function blockUnknownBranch(reason) {
  process.stderr.write(`${TAG} push 할 레포의 현재 브랜치를 확인할 수 없어 안전을 위해 막았습니다. (${reason})\n`)
  process.stderr.write('  → 피처 브랜치를 체크아웃한 레포 폴더에서, 경로를 변수·서브셸 없이 적어 다시 실행하세요:\n')
  process.stderr.write('      cd <레포 경로> && git push origin feature/{작업명}\n')
  process.exit(2)
}

function blockOpaque(what) {
  process.stderr.write(`${TAG} 내용을 확인할 수 없는 셸 넘김(${what})에 push 가 들어 있어 막았습니다.\n`)
  process.stderr.write('  → main 보호 검사를 거치도록 git push 를 직접 실행하세요: git push origin feature/{작업명}\n')
  process.exit(2)
}

function blockBranchCreate(currentBranch) {
  process.stderr.write(`${TAG} 피처 브랜치(${currentBranch})에서 새 브랜치를 만들 수 없습니다.\n`)
  process.stderr.write('  → 새 브랜치는 반드시 main에서 생성해야 합니다:\n')
  process.stderr.write('      git checkout main\n')
  process.stderr.write('      git checkout -b feature/{작업명}\n')
  process.exit(2)
}

// dir 의 현재 브랜치 ('' = detached HEAD · 레포 아님 · 없는 폴더 · dir 모름)
const branchCache = new Map()
function currentBranchOf(dir) {
  if (!dir) return ''
  if (branchCache.has(dir)) return branchCache.get(dir)
  let b = ''
  try {
    // 셸을 거치지 않는다 — '2>/dev/null' 은 윈도우 cmd.exe 에서 실패해 브랜치를 못 읽고 통과했다
    b = execFileSync('git', ['branch', '--show-current'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], cwd: dir, timeout: 5000,
    }).trim()
  } catch { b = '' }
  branchCache.set(dir, b)
  return b
}

const cleanValue = (v) => String(v).replace(/[​-‍⁠﻿­]/g, '')

// 셸 단어 → 절대 폴더 (정적으로 모르면 null)
function resolveDirWord(word, base) {
  if (!word || word.dyn || word.subst) return null
  let v = cleanValue(word.value)
  if (!v || v === '-') return null
  if (v === '~' || v.startsWith('~/')) { if (!HOME) return null; v = HOME + v.slice(1) }
  else if (v.startsWith('~')) return null // ~user
  if (IS_WIN && W) v = W.msysToWin(v.replace(/\\/g, '/'), true)
  try {
    if (path.isAbsolute(v)) return path.resolve(v)
    return base ? path.resolve(base, v) : null
  } catch { return null }
}

// refspec → 원격 대상 브랜치명 (HEAD/@ 는 현재 브랜치)
function refDestination(value, branch) {
  const s = String(value).replace(/^\+/, '')
  const colon = s.indexOf(':')
  let dst = colon >= 0 ? s.slice(colon + 1) : s
  if (colon >= 0 && dst === '') dst = s.slice(0, colon)
  if (dst === 'HEAD' || dst === '@') dst = branch
  return String(dst || '').replace(/^refs\/heads\//i, '')
}

// ── 예외: 빈 원격에 main 첫 push (2026-11-16 사용자 결정 — "빈 레포에 최초의 메인 브랜치 생성에만 허용") ──
// 원격에 ref 가 하나도 없을 때(브랜치·태그 전부 없음)만 main/master 를 만드는 push 를 통과시킨다. 하나라도 어긋나면 예전처럼 막는다.
//   · 옵션은 -u/--set-upstream·-q·-v·--progress 만 (force·--all·--tags·삭제·--mirror·push-option 등은 예외 아님)
//   · 원격은 이름 하나(정적), 그 원격의 url 은 정확히 하나, pushurl·uploadpack·receivepack 설정 없음,
//     어느 범위에도 url.*.insteadOf·pushInsteadOf 없음 — 확인하는 곳과 push 하는 곳이 다르게 만들 수 없게
//   · url 은 https·ssh(ssh:// 또는 user@host:path)·절대 경로·file:// 만 (ext:: 같은 명령 실행형 거부)
//   · git ls-remote 를 셸 없이 8초 제한, 비밀번호 창·ssh 질문 끔으로 실행 — 실패·시간 초과·출력 있음 = 빈 레포 아님
//   · 확인과 push 사이에 누가 main 을 만들면 force 가 아니므로 git 이 push 를 거절한다(덮어쓰기 없음)
// 사용자가 "푸시"를 직접 요청해야 하는 규칙(task-confirm-guard)과 확인 창(bash-guard)은 그대로 적용된다
const FIRST_PUSH_OPTS = new Set(['-u', '--set-upstream', '-q', '--quiet', '-v', '--verbose', '--progress', '--no-progress', '-uq', '-qu'])
function gitOut(dir, args, timeout = 3000) {
  try {
    return { ok: true, out: execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout }) }
  } catch (e) { return { ok: false, status: e.status, out: (e.stdout || '').toString() } }
}
function firstMainPushAllowed(dir, branch, args, p) {
  if (!dir || p.force || p.pushAll || p.deleteMode) return false
  if (args.some(a => a.dyn || a.subst)) return false
  const vals = args.map(a => cleanValue(a.value))
  const opts = vals.filter(v => v.startsWith('-'))
  if (opts.some(v => !FIRST_PUSH_OPTS.has(v))) return false
  const remote = p.remote ? cleanValue(p.remote.value) : ''
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(remote)) return false
  // 대상: refspec 없음(현재 브랜치가 main/master) 또는 main/master 를 만드는 refspec 하나
  if (p.refspecs.length > 1) return false
  if (p.refspecs.length === 0) { if (!isProtected(branch)) return false }
  else {
    const r = cleanValue(p.refspecs[0].value)
    if (r.startsWith('+') || r.startsWith(':') || !/^[A-Za-z0-9._\/@-]+(?::[A-Za-z0-9._\/-]+)?$/.test(r)) return false
    if (!isProtected(refDestination(r, branch))) return false
  }
  // 원격 설정 — url 정확히 하나, 확인 대상을 바꾸는 설정 없음
  const urls = gitOut(dir, ['config', '--get-all', `remote.${remote}.url`])
  const urlList = urls.ok ? urls.out.split('\n').map(s => s.trim()).filter(Boolean) : []
  if (urlList.length !== 1) return false
  for (const k of ['pushurl', 'uploadpack', 'receivepack', 'vcs', 'proxy']) {
    if (gitOut(dir, ['config', '--get-all', `remote.${remote}.${k}`]).out.trim()) return false
  }
  if (gitOut(dir, ['config', '--get-regexp', '^url\\..*\\.(push)?insteadof$']).out.trim()) return false
  const url = urlList[0]
  const okUrl = /^https:\/\/[^\s]+$/i.test(url) || /^ssh:\/\/[^\s]+$/i.test(url) || /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+:[^\s]+$/.test(url)
    || /^file:\/\/\/[^\s]+$/i.test(url) || (path.isAbsolute(url) && !url.includes('::')) || /^[A-Za-z]:[\\/]/.test(url)
  if (!okUrl || /::/.test(url)) return false
  // 원격이 정말 비었는가 — 셸 없이, 묻는 창 없이, 8초 제한
  try {
    const out = execFileSync('git', ['-c', 'protocol.ext.allow=never', '-c', 'core.askPass=', 'ls-remote', '--', url], {
      cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 8000,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_ASKPASS: '', SSH_ASKPASS: '', GIT_SSH_COMMAND: 'ssh -o BatchMode=yes -o ConnectTimeout=5' },
    })
    return out.trim() === ''
  } catch { return false }
}

// parsePushArgs + --repo 보정 — --repo(=)<원격> 이 있으면 남은 위치 인자는 모두 refspec 이다
function pushArgs(args) {
  const p = analyzer.parsePushArgs(args)
  const hasRepo = args.some(a => /^--repo(?:=|$)/.test(cleanValue(a.value)))
  if (hasRepo && p.remote) return { ...p, remote: null, refspecs: [p.remote, ...p.refspecs] }
  return p
}

// ── 분석기가 내용을 볼 수 없는 셸 넘김 ──
const SHELLS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh', 'mksh', 'ash', 'fish', 'yash', 'tcsh', 'csh'])
const INTERPRETERS = /^(?:python[0-9.]*|node|nodejs|deno|bun|perl[0-9.]*|ruby|php|lua|osascript|pwsh|powershell)$/
function opaqueFeed(inv) {
  if (inv.dynamicName) return { kind: 'shell', what: '명령 이름이 변수·치환' }
  const nm = inv.name
  const vals = inv.args.map(a => cleanValue(a.value))
  if (nm === 'eval') return inv.args.some(a => a.dyn || a.subst) ? { kind: 'shell', what: 'eval 동적 문자열' } : null
  if (nm === 'source' || nm === '.') return { kind: 'shell', what: `${nm} 로 읽는 스크립트` }
  if (SHELLS.has(nm)) {
    let hasC = false, positional = null, stdinFlag = false
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i]
      if (v === '--') { positional = i + 1 < vals.length ? i + 1 : null; break }
      if (/^[-+]o$/.test(v) || /^--(?:rcfile|init-file)$/.test(v)) { i++; continue }
      if (/^-[A-Za-z]+$/.test(v)) { if (v.includes('c')) hasC = true; if (v.includes('s')) stdinFlag = true; continue }
      if (v.startsWith('-') && v !== '-') continue
      positional = i; break
    }
    if (hasC) {
      const script = positional != null ? inv.args[positional] : null
      return script && (script.dyn || script.subst) ? { kind: 'shell', what: `${nm} -c 동적 스크립트` } : null
    }
    if (stdinFlag || positional == null || vals[positional] === '-') return { kind: 'shell', what: `${nm} 표준입력` }
    return null // 스크립트 파일 실행 — 내용 미확인(한계)
  }
  if (INTERPRETERS.test(nm)) return { kind: 'interp', what: `${nm} 인라인 코드·표준입력`, script: interpScriptIndex(vals) }
  return null
}

// 인터프리터가 스크립트 파일을 돌리면 그 파일의 인자 위치, 인라인 코드·표준입력·모듈(-m)이면 -1 (2026-11-13)
// 값을 받는 옵션(-r·--require·-W 등)은 다음 인자를 건너뛴다. 모르는 형태는 -1 = 예전처럼 명령 전체 글자로 판정
function interpScriptIndex(vals) {
  for (let i = 0; i < vals.length; i++) {
    const v = vals[i]
    if (v == null) return -1
    if (v === '-' || v === '--') return -1
    if (/^(?:-[ecpm]|-pe|-E|--eval|--print|--command|-[A-Za-z]*[cem])$/.test(v) || /^--(?:eval|print)=/.test(v)) return -1
    if (/^(?:-r|--require|--import|--loader|-W|-X|-Q|-I|-O|--env-file|--conditions|-C)$/.test(v)) { i++; continue }
    if (v.startsWith('-')) continue
    return i
  }
  return -1
}

// 명령을 띄울 수 있는 코드 — 넓게 잡는다(놓치면 인자로 넘긴 git push 가 실행된다). 동적 require·import·eval 도 포함
const SPAWN_RE = /child_process|\bexecSync\b|\bexecFile|\bspawn|\bsubprocess\b|\bos\.(?:system|popen|exec|spawn)|\bsystem\s*\(|\bDeno\.(?:run|Command)|\bBun\.(?:spawn|\$)|\bexec\s*\(|\beval\s*\(|\bFunction\s*\(|\bshell_exec\b|\bpassthru\b|\bproc_open\b|\bpopen\b|\bIO\.popen\b|\bOpen3\b|%x\{|\bqx\s*[{(\/]|do shell script|\brequire\s*\(\s*[^'"\s)]|\bimport\s*\(\s*[^'"\s)]|\b__import__\b|\bimportlib\b|\bgetattr\s*\(|\bctypes\b|\bpty\b|\bsh\b\s*\(|\bzx\b|\bexeca\b|\bshelljs\b/
const gitPushIn = (s) => /\bgit\b[^\n]{0,80}?\bpush\b/i.test(s.replace(/\.push\s*\(/g, ''))

function checkOpaque(cmd, acc, startDir) {
  const hasPush = /push/i.test(cmd)
  // 인터프리터 코드는 git 과 push 가 같은 줄 가까이 있을 때만 (2026-11-09 오탐: heredoc 의 `pos.push(x)` 와 다른 줄 `git:` 로 막힘).
  // JS 배열 메서드 `.push(` 는 뺀다. 여러 줄·인코딩으로 숨긴 코드는 원래 이 휴리스틱의 한계
  const hasGitPush = hasPush && gitPushIn(cmd)
  if (hasPush) for (const u of acc.unknown) blockOpaque(`해석 불가: ${u}`)
  let vcwd = startDir
  for (const inv of acc.invocations) {
    if (inv.name === 'cd' || inv.name === 'pushd' || inv.name === 'popd') {
      if (inv.subshell || inv.name === 'popd') { vcwd = null; continue }
      const t = inv.args.find(a => !/^-[LPe@]$/.test(a.value))
      vcwd = t ? resolveDirWord(t, vcwd) : HOME
      continue
    }
    const o = opaqueFeed(inv)
    if (!o) continue
    if (!hasPush) continue
    if (o.kind === 'interp' && o.script >= 0 && hasGitPush) {
      // 스크립트 파일 실행 — 명령 글자의 git push 는 그 스크립트에 넘기는 인자(검색어·메시지 등)일 수 있다 (2026-11-13 오탐).
      // 스크립트를 읽어 명령을 띄우는 코드가 없으면 인자는 값일 뿐이라 통과. 못 읽거나 띄우는 코드가 있으면 예전처럼 막는다.
      // (스크립트 파일 자체의 내용은 원래 검사하지 않는다 — 셸 스크립트 파일과 같은 한계, 인자에 push 가 없으면 이전과 동일하게 통과)
      const word = inv.args[o.script]
      const rel = cleanValue(word.value)
      const abs = word.dyn || word.subst || !rel ? null : path.isAbsolute(rel) ? rel : vcwd ? path.resolve(vcwd, rel) : null
      let text = null
      try { const st = abs && fs.statSync(abs); if (st && st.isFile() && st.size <= 2 * 1024 * 1024) text = fs.readFileSync(abs, 'utf8') } catch { text = null }
      if (text == null) blockOpaque(`${inv.name} 스크립트(${rel || '동적 경로'}) 내용 확인 불가`)
      // 백틱: JS·TS 에선 템플릿 문자열이지만 perl·ruby·php·셸에선 명령 실행 — JS 계열 확장자가 아니면 백틱도 실행으로 본다
      const backtickRuns = !/\.(?:[cm]?js|[cm]?ts|jsx|tsx)$/i.test(abs) && text.includes('`')
      if (SPAWN_RE.test(text) || backtickRuns || gitPushIn(text)) blockOpaque(`${inv.name} 스크립트(${path.basename(abs)})가 명령을 띄울 수 있음`)
      // 인자 말고 명령의 다른 곳(같은 줄의 다른 인터프리터 인라인 코드 등)은 그 호출에서 따로 판정된다
      continue
    }
    if (o.kind === 'shell' || hasGitPush) blockOpaque(o.what)
  }
  if (!hasPush) return
  // xargs 는 분석기가 벗겨 내므로 원문으로 본다 — xargs 가 git·셸에 인자를 이어 붙이면 refspec 을 알 수 없다
  if (/\bxargs\b[^\n;&|]*\b(?:git(?:\.exe)?|sh|bash|zsh|dash|eval)\b/i.test(cmd)) blockOpaque('xargs 로 넘긴 인자')
}

// ── Rule 2: 새 브랜치를 만드는 git 호출인가 ──
const BRANCH_NON_CREATE = /^(?:-[A-Za-z]*[dDmMlaruv][A-Za-z]*|--(?:delete|move|list|all|remotes|verbose|contains|no-contains|merged|no-merged|points-at|show-current|set-upstream-to|unset-upstream|edit-description|format|sort|column|no-column|ignore-case|omit-empty|abbrev|no-abbrev)(?:=.*)?)$/
function createsBranch(g) {
  const vals = []
  for (const a of g.args) { const v = cleanValue(a.value); if (v === '--') break; vals.push(v) }
  if (g.sub === 'checkout') return vals.some(v => /^-[A-Za-z]*[bB][A-Za-z]*$/.test(v) || /^-[A-Za-z]*[bB]./.test(v) || v === '--orphan' || v.startsWith('--orphan='))
  if (g.sub === 'switch') return vals.some(v => /^-[A-Za-z]*[cC]/.test(v) || /^--(?:create|force-create|orphan)(?:=|$)/.test(v))
  if (g.sub === 'branch') {
    if (vals.some(v => BRANCH_NON_CREATE.test(v))) return false
    return vals.some(v => !v.startsWith('-'))
  }
  if (g.sub === 'worktree') {
    if (vals[0] !== 'add') return false
    const rest = vals.slice(1)
    if (rest.some(v => /^-[A-Za-z]*[bB]/.test(v) || /^--orphan(?:=|$)/.test(v))) return true
    if (rest.some(v => v === '-d' || v === '--detach')) return false
    // 커밋 지정 없이 경로만 주면 경로 이름으로 새 브랜치를 만든다(git worktree add 기본 동작)
    const positional = rest.filter(v => !v.startsWith('-'))
    return positional.length === 1
  }
  return false
}

function checkWithAnalyzer(cmd, startDir) {
  const acc = analyzer.analyzeShell(cmd)
  checkOpaque(cmd, acc, startDir)
  if (!acc.invocations.some(i => i.name === 'git')) return

  const gitEnvRedirect = /\bGIT_(?:DIR|WORK_TREE)=/.test(cmd)
  // 빈 원격 첫 push 예외는 명령 안에 push 가 하나일 때만 — 첫 push 뒤 같은 명령에서 main 에 계속 push 하지 못하게
  const pushCount = acc.invocations.filter(i => i.name === 'git' && i.git && i.git.sub === 'push').length
  let vcwd = startDir
  for (const inv of acc.invocations) {
    const nm = inv.name
    if (nm === 'cd' || nm === 'pushd' || nm === 'popd') {
      if (inv.subshell || nm === 'popd') { vcwd = null; continue } // 서브셸 cd 는 부모에 영향 없음 → 추적 포기(보수)
      const t = inv.args.find(a => !/^-[LPe@]$/.test(a.value))
      vcwd = t ? resolveDirWord(t, vcwd) : HOME
      continue
    }
    if (nm !== 'git' || !inv.git || !inv.git.sub) continue
    const g = inv.git
    const pre = inv.args.map(a => cleanValue(a.value))
    let dir = vcwd
    if (g.dir) dir = pre.filter(v => v === '-C').length > 1 ? null : resolveDirWord(g.dir, vcwd)
    let unknownWhy = ''
    if (gitEnvRedirect || pre.some(v => /^--(?:git-dir|work-tree)(?:=|$)/.test(v))) { dir = null; unknownWhy = 'GIT_DIR·--git-dir·--work-tree 로 다른 레포 지정' }
    const branch = currentBranchOf(dir)
    if (!unknownWhy) unknownWhy = !dir ? '경로를 정적으로 알 수 없음(변수·서브셸 cd·없는 경로)' : 'detached HEAD 이거나 git 레포가 아님'

    // ── Rule 1: main/master 대상 push 금지 ──
    if (g.sub === 'push') {
      const p = pushArgs(g.args)
      // 보호 브랜치가 아닌 원격 브랜치 삭제(--delete feature/x)만은 현재 브랜치와 무관하게 허용 — 기존 동작 유지
      const pureDelete = p.deleteMode && p.refspecs.length > 0
        && p.refspecs.every(r => { if (r.dyn) return false; const d = refDestination(r.value, branch); return !!d && !isProtected(d) })
      if (pureDelete) continue
      if (!branch) blockUnknownBranch(unknownWhy)
      // 예외: 원격이 완전히 빈 레포에 main 을 처음 만드는 push 하나 (2026-11-16 사용자 결정) — 조건은 firstMainPushAllowed
      if (pushCount === 1 && firstMainPushAllowed(dir, branch, g.args, p)) continue
      if (isProtected(branch)) blockPush(`현재 브랜치 ${branch}`, true)
      if (p.pushAll) blockPush('--all/--mirror 는 main 을 포함합니다', false)
      for (const r of p.refspecs) {
        if (r.dyn) blockPush(`정적으로 확인할 수 없는 refspec: ${r.value}`, false)
        const dst = refDestination(r.value, branch)
        if (isProtected(dst)) blockPush(`대상 ${dst}`, false)
      }
      continue
    }

    // ── Rule 2: 피처 브랜치에서 새 브랜치 생성 금지 (브랜치를 알 때만 — detached 에서의 분기는 막지 않는다) ──
    if (branch && !isProtected(branch) && createsBranch(g)) blockBranchCreate(branch)
  }
}

// 폴백 — bash-guard.js 를 불러올 수 없을 때의 정규식 판정
function checkLegacy(cmd, currentBranch) {
  const beforeHeredoc = cmd.split(/<<\s*['"]?[A-Z_]+['"]?/)[0]
  if (/push/i.test(cmd) && /(?:\|\s*(?:sh|bash|zsh)\b|<<<|\bxargs\b|\beval\b|\$\(\s*echo\s+git)/i.test(cmd)) blockOpaque('셸 넘김')
  const segments = beforeHeredoc.split(/&&|\|\||;|\||\n/).map(s => s.trim()).filter(Boolean)
  for (const seg of segments) {
    if (/^git(?:\.exe)?\s+(?:-\S+\s+(?:\S+\s+)?)*push\b/i.test(seg) && !/--delete\b/.test(seg)) {
      const onProtected = isProtected(currentBranch)
      const explicit = /\s\+?(?:refs\/heads\/)?(?:main|master)(?:\s|$)/i.test(seg) || /:(?:refs\/heads\/)?(?:main|master)\b/i.test(seg)
      if (onProtected || explicit) blockPush('', onProtected)
      if (!currentBranch) blockUnknownBranch('detached HEAD 이거나 git 레포가 아님')
    }
    if (currentBranch && !isProtected(currentBranch) && /^git(?:\.exe)?\s+(checkout\s+-[A-Za-z]*b|switch\s+-[A-Za-z]*c|branch\s+[^-\s]|worktree\s+add\b.*\s-[bB])/i.test(seg)) blockBranchCreate(currentBranch)
  }
}

// 입력은 fd 0 으로 읽는다('/dev/stdin' 은 윈도우에 없어 예외 → 아래 catch 로 조용히 통과했다).
// 보안 훅이라 입력이 비었거나 JSON 객체가 아니면 통과시키지 않고 막는다 (2026-10-20 윈도우 계획 1단계)
let input = null
try { input = JSON.parse(fs.readFileSync(0, 'utf8')) } catch { input = null }
if (!input || typeof input !== 'object' || Array.isArray(input)) {
  process.stderr.write(`${TAG} 훅 입력(JSON)을 읽지 못해 안전을 위해 차단했습니다.\n`)
  process.exit(2)
}

try {
  if (input.tool_name !== 'Bash' && input.tool_name !== 'Monitor') process.exit(0) // Monitor 도 셸 명령(v2.1.314+)

  const cmdRaw = input.tool_input && input.tool_input.command
  if (typeof cmdRaw !== 'string') process.exit(0)
  const cmd = cmdRaw.trim()
  if (!cmd) process.exit(0)

  // 기준 폴더 = 세션 cwd(input.cwd, Bash 의 cd 를 반영) → 없으면 훅 프로세스 cwd
  let startDir = null
  try { startDir = typeof input.cwd === 'string' && input.cwd ? path.resolve(input.cwd) : process.cwd() } catch { startDir = null }

  if (analyzer && typeof analyzer.analyzeShell === 'function' && typeof analyzer.parsePushArgs === 'function') {
    checkWithAnalyzer(cmd, startDir)
  } else {
    if (!/\bgit\b/i.test(cmd) && !/push/i.test(cmd)) process.exit(0)
    checkLegacy(cmd, currentBranchOf(startDir))
  }
} catch {
  // 판정 중 예외 — push 가 들어 있으면 막는다(보안 훅 fail-closed), 아니면 통과
  try {
    const c = input.tool_input && input.tool_input.command
    if (typeof c === 'string' && /\bpush\b/i.test(c) && /git/i.test(c)) {
      process.stderr.write(`${TAG} push 판정 중 오류가 나 안전을 위해 막았습니다.\n`)
      process.exit(2)
    }
  } catch {}
}

process.exit(0)
