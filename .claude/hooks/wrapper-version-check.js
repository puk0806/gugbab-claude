#!/usr/bin/env node
/**
 * wrapper-version-check.js — SessionStart: 이 세션을 띄운 래퍼가 지금 설치된 하네스와 같은 버전인지 확인 (비차단, 안내만)
 *
 *   래퍼(gugbab-claude)는 업데이트되면 새 버전 자신으로 다시 실행하고(2026-10-19), claude 를 띄울 때 하네스 커밋을
 *   GUGBAB_WRAPPER_REV 로 넘긴다. 이 훅은 그 값을 설치본의 HEAD 와 비교한다.
 *   ① 값이 없음 = 다시 실행 기능이 없던 예전 래퍼(v1.0.4 이하)가 업데이트한 직후 띄운 세션
 *      → 래퍼 수정이 이 세션에 반영되지 않았으니 터미널에서 다시 실행하라고 안내 (재시작 표시는 남기지 않는다 —
 *        예전 래퍼의 재시작은 여전히 값을 넘기지 않아 매번 다시 시작하게 되므로)
 *   ② 값이 HEAD 와 다름 = 세션 도중(다른 세션 등에서) 하네스가 업데이트됨
 *      → 설정 폴더에 재시작 표시(.gugbab-restart)를 남겨 /exit 하면 래퍼가 새 버전으로 대화를 이어서 다시 띄우게 하고 안내
 *   건너뜀: 개발 모드(GUGBAB_DEV≠0), 래퍼가 조립한 설정 폴더가 아님, 커밋을 알 수 없음(unknown·형식 틀림), git 실패
 *
 *   입력 환경: GUGBAB_DEV · GUGBAB_HOME(하네스 폴더, 디스패처·래퍼가 넘김) · GUGBAB_WRAPPER_REV · CLAUDE_CONFIG_DIR
 *   출력: hookSpecificOutput.additionalContext + systemMessage (SessionStart). 항상 exit 0
 *   모듈: checkWrapperVersion({ env, headOf })
 */
'use strict'
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const SHA_RE = /^[0-9a-f]{40}$/

function defaultHeadOf(home) {
  const out = execFileSync('git', ['-C', home, 'rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 2000, maxBuffer: 4096 })
  return String(out).trim()
}

// 래퍼가 조립한 설정 폴더 = 실제 폴더 이름이 .claude 이고 안에 일반 파일 .gugbab-state.json 이 있음
function wrapperConfigDir(cfg) {
  if (typeof cfg !== 'string' || !path.isAbsolute(cfg)) return null
  try {
    const real = fs.realpathSync(cfg)
    if (path.basename(real) !== '.claude' || !fs.statSync(real).isDirectory()) return null
    if (!fs.lstatSync(path.join(real, '.gugbab-state.json')).isFile()) return null
    return real
  } catch { return null }
}

function versionOf(home) {
  try {
    const v = fs.readFileSync(path.join(home, 'VERSION'), 'utf8').trim()
    return /^\d{1,6}\.\d{1,6}\.\d{1,6}$/.test(v) ? `v${v}` : null
  } catch { return null }
}

// 재시작 표시 — 이미 있으면 그대로, 링크·폴더 등 일반 파일이 아닌 것이 있으면 건드리지 않음
function markRestart(cfgDir) {
  const f = path.join(cfgDir, '.gugbab-restart')
  try { return fs.lstatSync(f).isFile() } catch { /* 없음 → 새로 */ }
  try { fs.writeFileSync(f, 'wrapper-version-check\n', { flag: 'wx' }); return true } catch { return false }
}

function checkWrapperVersion({ env = process.env, headOf = defaultHeadOf } = {}) {
  const res = { kind: null, marked: false, message: null }
  if (env.GUGBAB_DEV !== '0') return res
  const cfgDir = wrapperConfigDir(env.CLAUDE_CONFIG_DIR)
  if (!cfgDir) return res
  const home = env.GUGBAB_HOME
  if (typeof home !== 'string' || !path.isAbsolute(home)) return res
  const rev = env.GUGBAB_WRAPPER_REV
  let head
  try { head = headOf(home) } catch { return res }
  if (!SHA_RE.test(head || '')) return res
  const ver = versionOf(home)
  const now = ver ? `하네스 ${ver}` : '하네스'
  if (rev === undefined) {
    res.kind = 'old-wrapper'
    res.message = `이 세션은 업데이트 전 버전의 래퍼로 시작됐습니다 — ${now}로 갱신됐지만 래퍼 자체의 수정은 이 세션에 반영되지 않았습니다. ` +
      '`/exit` 후 터미널에서 `gugbab-claude -c` 로 다시 실행하면 대화를 이어서 새 래퍼로 열립니다. (이 안내는 다시 실행 기능이 들어간 버전으로 한 번 넘어갈 때만 나옵니다)'
    return res
  }
  if (!SHA_RE.test(rev) || rev === head) return res
  res.kind = 'updated-during-session'
  res.marked = markRestart(cfgDir)
  res.message = `이 세션이 열린 뒤 ${now}가 업데이트됐습니다 (${rev.slice(0, 7)} → ${head.slice(0, 7)}). ` +
    (res.marked
      ? '`/exit` 하면 래퍼가 새 버전으로 대화를 이어서(--continue) 다시 시작합니다.'
      : '`/exit` 후 터미널에서 `gugbab-claude -c` 로 다시 실행하면 새 버전으로 대화를 이어 갑니다.')
  return res
}

module.exports = { checkWrapperVersion, wrapperConfigDir, markRestart }

if (require.main === module) {
  const hardStop = setTimeout(() => process.exit(0), 3000) // SessionStart 지연 상한
  hardStop.unref()
  let raw = ''
  try { raw = fs.readFileSync(0, 'utf8') } catch { process.exit(0) }
  let input
  try { input = JSON.parse(raw) } catch { process.exit(0) }
  const event = input && (input.hook_event_name || input.hookEventName)
  if (event !== 'SessionStart') process.exit(0)
  let r
  try { r = checkWrapperVersion() } catch { process.exit(0) }
  if (r.message) {
    const text = `[wrapper-version-check] ${r.message}`
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: `${text}\n이 내용을 사용자에게 한 번 알려 주세요.` }, systemMessage: text }) + '\n')
  }
  process.exit(0)
}
