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
  if (INTERPRETERS.test(nm)) return { kind: 'interp', what: `${nm} 인라인 코드·표준입력` }
  return null
}

function checkOpaque(cmd, acc) {
  const hasPush = /push/i.test(cmd)
  if (!hasPush) return
  // 인터프리터 코드는 git 과 push 가 같은 줄 가까이 있을 때만 (2026-11-09 오탐: heredoc 의 `pos.push(x)` 와 다른 줄 `git:` 로 막힘).
  // JS 배열 메서드 `.push(` 는 뺀다. 여러 줄·인코딩으로 숨긴 코드는 원래 이 휴리스틱의 한계
  const hasGitPush = /\bgit\b[^\n]{0,80}?\bpush\b/i.test(cmd.replace(/\.push\s*\(/g, ''))
  for (const u of acc.unknown) blockOpaque(`해석 불가: ${u}`)
  for (const inv of acc.invocations) {
    const o = opaqueFeed(inv)
    if (!o) continue
    if (o.kind === 'shell' || hasGitPush) blockOpaque(o.what)
  }
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
  checkOpaque(cmd, acc)
  if (!acc.invocations.some(i => i.name === 'git')) return

  const gitEnvRedirect = /\bGIT_(?:DIR|WORK_TREE)=/.test(cmd)
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
