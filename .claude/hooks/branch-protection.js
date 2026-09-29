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
//   --all/--mirror, 동적 refspec("$(…)")까지 main/master 대상이면 차단.
//   브랜치명에 main 이 "포함"될 뿐인 feature/main-fix, main-backup 은 허용.
// bash-guard.js 를 불러올 수 없으면(단독 설치 등) 기존 정규식 판정으로 폴백한다.

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const PROTECTED = new Set(['main', 'master'])
const isProtected = (b) => typeof b === 'string' && PROTECTED.has(b.toLowerCase())
const TAG = '[branch-protection]'

let analyzer = null
try { analyzer = require('./bash-guard.js') } catch { analyzer = null }

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

function blockBranchCreate(currentBranch) {
  process.stderr.write(`${TAG} 피처 브랜치(${currentBranch})에서 새 브랜치를 만들 수 없습니다.\n`)
  process.stderr.write('  → 새 브랜치는 반드시 main에서 생성해야 합니다:\n')
  process.stderr.write('      git checkout main\n')
  process.stderr.write('      git checkout -b feature/{작업명}\n')
  process.exit(2)
}

const branchCache = new Map()
function currentBranchOf(dir) {
  const key = dir || '.'
  if (branchCache.has(key)) return branchCache.get(key)
  let b = ''
  try {
    b = execSync('git branch --show-current 2>/dev/null', {
      encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], cwd: dir ? path.resolve(dir) : undefined,
    }).trim()
  } catch { b = '' }
  branchCache.set(key, b)
  return b
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

function checkWithAnalyzer(cmd, baseBranch) {
  const acc = analyzer.analyzeShell(cmd)
  for (const inv of acc.invocations) {
    if (inv.name !== 'git' || !inv.git || !inv.git.sub) continue
    const g = inv.git
    const dirWord = g.dir && !g.dir.dyn ? g.dir.value : null
    const branch = dirWord ? (currentBranchOf(dirWord) || baseBranch) : baseBranch

    // ── Rule 1: main/master 대상 push 금지 ──
    if (g.sub === 'push') {
      const p = analyzer.parsePushArgs(g.args)
      const onProtected = isProtected(branch)
      if (onProtected) {
        // main 위에서는 다른 브랜치 원격 삭제(--delete feature/x)만 허용 — 기존 동작 유지
        const pureDelete = p.deleteMode && p.refspecs.length > 0
          && p.refspecs.every(r => !r.dyn && !isProtected(refDestination(r.value, branch)))
        if (!pureDelete) blockPush(`현재 브랜치 ${branch}`, true)
        continue
      }
      if (p.pushAll) blockPush('--all/--mirror 는 main 을 포함합니다', false)
      for (const r of p.refspecs) {
        if (r.dyn) blockPush(`정적으로 확인할 수 없는 refspec: ${r.value}`, false)
        const dst = refDestination(r.value, branch)
        if (isProtected(dst)) blockPush(`대상 ${dst}`, false)
      }
      continue
    }

    // ── Rule 2: 피처 브랜치에서 새 브랜치 생성 금지 ──
    const vals = g.args.map(a => a.value)
    const creates = (g.sub === 'checkout' && vals.some(v => /^-[bB]$/.test(v)))
      || (g.sub === 'switch' && vals.some(v => /^(?:-c|-C|--create|--force-create)$/.test(v)))
    if (creates && !isProtected(branch)) blockBranchCreate(branch)
  }
}

// 폴백 — bash-guard.js 를 불러올 수 없을 때의 기존(정규식) 판정
function checkLegacy(cmd, currentBranch) {
  const beforeHeredoc = cmd.split(/<<\s*['"]?[A-Z_]+['"]?/)[0]
  const segments = beforeHeredoc.split(/&&|\|\||;|\||\n/).map(s => s.trim()).filter(Boolean)
  for (const seg of segments) {
    if (/^git\s+(?:-\S+\s+(?:\S+\s+)?)*push\b/i.test(seg) && !/--delete\b/.test(seg)) {
      const onProtected = isProtected(currentBranch)
      const explicit = /\s\+?(?:refs\/heads\/)?(?:main|master)(?:\s|$)/i.test(seg) || /:(?:refs\/heads\/)?(?:main|master)\b/i.test(seg)
      if (onProtected || explicit) blockPush('', onProtected)
    }
    if (!isProtected(currentBranch) && /^git\s+(checkout\s+-b|switch\s+-c)\b/.test(seg)) blockBranchCreate(currentBranch)
  }
}

try {
  const raw = fs.readFileSync('/dev/stdin', 'utf8')
  const input = JSON.parse(raw || '{}')

  if (input.tool_name !== 'Bash') process.exit(0)

  const cmdRaw = input.tool_input && input.tool_input.command
  if (typeof cmdRaw !== 'string') process.exit(0)
  const cmd = cmdRaw.trim()
  if (!cmd) process.exit(0)

  if (analyzer && typeof analyzer.analyzeShell === 'function' && typeof analyzer.parsePushArgs === 'function') {
    // git 명령이 하나라도 있을 때만 현재 브랜치 조회 (매 Bash 호출마다 git 실행 방지)
    const hasGit = analyzer.analyzeShell(cmd).invocations.some(i => i.name === 'git')
    if (!hasGit) process.exit(0)
    const base = currentBranchOf(null)
    if (!base) process.exit(0) // detached HEAD 또는 git 레포 아님
    checkWithAnalyzer(cmd, base)
  } else {
    if (!/\bgit\b/i.test(cmd)) process.exit(0)
    const base = currentBranchOf(null)
    if (!base) process.exit(0)
    checkLegacy(cmd, base)
  }
} catch {}

process.exit(0)
