#!/usr/bin/env node
/**
 * gen-settings.test.js
 * 실행: node scripts/gen-settings.test.js
 */

const { execSync } = require('child_process')
const path = require('path')
const GEN = path.join(__dirname, 'gen-settings.js')

let passed = 0, failed = 0

function generate(...flags) {
  const output = execSync(`node "${GEN}" ${flags.join(' ')}`, { encoding: 'utf8' })
  return JSON.parse(output)
}

function assert(desc, actual, expected) {
  const pass = actual === expected
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대: ${expected}, 실제: ${actual})`}`)
  pass ? passed++ : failed++
}

// ── superpowers 조건부 ───────────────────────────────────────────────────
console.log('\n[enabledPlugins] superpowers 조건부 포함')
{
  const s = generate()
  assert('플래그 없음 → enabledPlugins 없음', s.enabledPlugins, undefined)
}
{
  const s = generate('--superpowers')
  assert('--superpowers → superpowers 포함', s.enabledPlugins?.['superpowers@superpowers-marketplace'], true)
  assert('--superpowers만 → codex 미포함', s.enabledPlugins?.['codex@openai-codex'], undefined)
}
{
  const s = generate('--codex')
  assert('--codex만 → codex 포함', s.enabledPlugins?.['codex@openai-codex'], true)
  assert('--codex만 → superpowers 미포함', s.enabledPlugins?.['superpowers@superpowers-marketplace'], undefined)
}
{
  const s = generate('--superpowers', '--codex')
  assert('--superpowers --codex → 둘 다 포함 (superpowers)', s.enabledPlugins?.['superpowers@superpowers-marketplace'], true)
  assert('--superpowers --codex → 둘 다 포함 (codex)', s.enabledPlugins?.['codex@openai-codex'], true)
}

// ── 다른 플래그와 조합 ───────────────────────────────────────────────────
console.log('\n[enabledPlugins] 다른 플래그 조합')
{
  const s = generate('--superpowers', '--dev', '--typescript', '--memory')
  assert('--superpowers + dev flags → superpowers 포함', s.enabledPlugins?.['superpowers@superpowers-marketplace'], true)
  assert('codex 미포함 유지', s.enabledPlugins?.['codex@openai-codex'], undefined)
}
{
  const s = generate('--superpowers', '--codex', '--dev', '--memory', '--readme-guard')
  assert('전체 플래그 → superpowers 포함', s.enabledPlugins?.['superpowers@superpowers-marketplace'], true)
  assert('전체 플래그 → codex 포함', s.enabledPlugins?.['codex@openai-codex'], true)
}

// ── 기본 구조 검증 ───────────────────────────────────────────────────────
console.log('\n[구조] 필수 필드')
{
  const s = generate()
  assert('permissions.defaultMode = acceptEdits (공식 문서 위치)', s.permissions?.defaultMode, 'acceptEdits')
  assert('최상위 defaultMode 는 없음 (무시되는 잘못된 위치)', 'defaultMode' in s, false)
  assert('permissions.allow 존재', Array.isArray(s.permissions?.allow), true)
  assert('permissions.deny 존재', Array.isArray(s.permissions?.deny), true)
  assert('hooks.Stop 존재', Array.isArray(s.hooks?.Stop), true)
  assert('statusLine 존재', typeof s.statusLine, 'object')
  assert('플러그인 없으면 enabledPlugins 필드 자체 없음', 'enabledPlugins' in s, false)
}

// ── 훅 다이어트 (2026-07) 배선 검증 ─────────────────────────────────────
console.log('\n[훅 다이어트] deliverable-guard 통합 · 제거 훅 미참조')
{
  const flat = (s) => JSON.stringify(s.hooks)
  const s = generate('--dev', '--memory', '--readme-guard', '--codex')
  assert('Stop에 deliverable-guard 포함', flat(s).includes('deliverable-guard.js') , true)
  assert('제거된 훅 미참조 (pending-test/readme/session-summary/handoff/task-plan/confirmation-gate/verification-gate/careful-with-judge/memory-stop)',
    /pending-test-guard|readme-guard\.js|session-summary|session-handoff|task-plan-guard|confirmation-gate|verification-gate|careful-with-judge|memory-stop-guard/.test(flat(s)), false)
  assert('UserPromptSubmit 이벤트 제거됨', 'UserPromptSubmit' in s.hooks, false)
  const stopCmds = s.hooks.Stop[0].hooks.map(h => h.command)
  assert('Stop 훅 4개 이하 (deliverable+codex+export+notify — memory-stop 제거)', stopCmds.length <= 4, true)
  assert('Stop에 session-export 포함 (강제 보존)', stopCmds.some(c => c.includes('session-export.js')), true)
}
{
  const s = generate('--util')
  assert('util 모드 Stop에 session-export+cc-notify만 (opt-in 미선택)', s.hooks.Stop[0].hooks.length, 2)
  assert('util 모드 Stop에도 session-export 포함 (강제 보존)',
    JSON.stringify(s.hooks.Stop).includes('session-export.js'), true)
  const utilPreWrite = s.hooks.PreToolUse.find(b => b.matcher === 'Write').hooks.map(h => h.command).join(' ')
  assert('util 모드 PreToolUse Write에 구조 검증 3종 미포함 (최소 구성)',
    ['verification-guard', 'skill-md-guard', 'agent-md-guard'].some(n => utilPreWrite.includes(n)), false)
}
{
  const s = generate('--util', '--readme-guard', '--branch-protection')
  const flatPre = JSON.stringify(s.hooks.PreToolUse)
  const flatStop = JSON.stringify(s.hooks.Stop)
  const flatPost = JSON.stringify(s.hooks.PostToolUse)
  assert('util + --readme-guard → PreToolUse Bash에 deliverable-guard 보존', flatPre.includes('deliverable-guard'), true)
  assert('util + --readme-guard → Stop에 deliverable-guard 보존', flatStop.includes('deliverable-guard'), true)
  assert('util + --readme-guard → PostToolUse 세션 추적 배선', flatPost.includes('deliverable-guard'), true)
  assert('util + --branch-protection → PreToolUse Bash에 branch-protection 보존', flatPre.includes('branch-protection'), true)
}
{
  const s = generate('--dev')
  const stopDeliverable = s.hooks.Stop[0].hooks.find(h => h.command.includes('deliverable-guard'))
  assert('--readme-guard 미선택 → Stop deliverable에 --no-readme 전달', stopDeliverable.command.includes('--no-readme'), true)
}
{
  const s = generate('--dev', '--readme-guard')
  const stopDeliverable = s.hooks.Stop[0].hooks.find(h => h.command.includes('deliverable-guard'))
  assert('--readme-guard 선택 → Stop deliverable README 검사 활성 (--no-readme 없음)', stopDeliverable.command.includes('--no-readme'), false)
}

// ── memory push 가드 배선 (2026-07-10) ──────────────────────────────────
console.log('\n[memory 가드] --memory 시 PreToolUse Bash에 deliverable-guard 배선')
{
  const preBashCmds = (s) => (s.hooks.PreToolUse.filter(b => b.matcher === 'Bash')
    .flatMap(b => b.hooks.map(h => h.command))).join(' | ')
  const m = generate('--dev', '--memory')
  assert('--memory(readme-guard 없이) → PreToolUse Bash에 deliverable --no-readme 배선',
    preBashCmds(m).includes('deliverable-guard.js --no-readme'), true)
  const r = generate('--dev', '--memory', '--readme-guard')
  assert('--memory + --readme-guard → 플래그 없는 deliverable 배선 (중복 없음)',
    preBashCmds(r).includes('deliverable-guard.js') && !preBashCmds(r).includes('--no-readme'), true)
  const neither = generate('--dev')
  assert('memory·readme-guard 둘 다 없으면 PreToolUse Bash에 deliverable 미배선',
    preBashCmds(neither).includes('deliverable-guard'), false)
  const u = generate('--util', '--memory')
  assert('util + --memory → PreToolUse Bash에 deliverable --no-readme 배선',
    preBashCmds(u).includes('deliverable-guard.js --no-readme'), true)
}

// ── 구조 검증 3종 사전 차단 격상 (2026-07) ──────────────────────────────
console.log('\n[사전 차단] verification/skill-md/agent-md — PreToolUse Write')
{
  const s = generate('--dev')
  const preWrite = s.hooks.PreToolUse.find(b => b.matcher === 'Write').hooks.map(h => h.command).join(' ')
  const postWrite = s.hooks.PostToolUse.find(b => b.matcher === 'Write').hooks.map(h => h.command).join(' ')
  const postEdit = s.hooks.PostToolUse.find(b => b.matcher === 'Edit').hooks.map(h => h.command).join(' ')
  assert('PreToolUse Write에 구조 검증 3종 배선',
    ['verification-guard', 'skill-md-guard', 'agent-md-guard'].every(n => preWrite.includes(n)), true)
  assert('PostToolUse Write에서 차단형 구조 검증(skill-md·agent-md) 제거 — Pre 에서 이미 사전 차단',
    ['skill-md-guard', 'agent-md-guard'].some(n => postWrite.includes(n)), false)
  // verification-guard 는 Post Write 를 경고 전용(날짜 4곳 불일치)으로 처리 — 배선 누락 시 Write 로 만든
  // verification.md 의 날짜 불일치가 세션 시작 전까지 드러나지 않았다 (2026-10-05)
  assert('PostToolUse Write에 verification-guard 배선 (날짜 불일치 경고 전용)', postWrite.includes('verification-guard'), true)
  assert('PostToolUse Edit에 구조 검증 3종 배선 (디스크 재읽기)',
    ['verification-guard', 'skill-md-guard', 'agent-md-guard'].every(n => postEdit.includes(n)), true)
  const editCmds = s.hooks.PostToolUse.find(b => b.matcher === 'Edit').hooks.map(h => h.command)
  const writeCmds = s.hooks.PostToolUse.find(b => b.matcher === 'Write').hooks.map(h => h.command)
  assert('PostToolUse Edit 선두 = deliverable-guard (추적이 차단 훅보다 먼저)',
    editCmds[0].includes('deliverable-guard'), true)
  assert('PostToolUse Write 선두 = deliverable-guard',
    writeCmds[0].includes('deliverable-guard'), true)
}

// ── 적대적 테스트 훅 배선 (dev 전용) ────────────────────────────────────
console.log('\n[적대적 테스트] adversarial-test-guard · fake-impl-guard — dev PostToolUse')
{
  const dev = generate('--dev')
  const devWrite = dev.hooks.PostToolUse.find(b => b.matcher === 'Write').hooks.map(h => h.command).join(' ')
  const devEdit = dev.hooks.PostToolUse.find(b => b.matcher === 'Edit').hooks.map(h => h.command).join(' ')
  assert('dev PostToolUse Write에 adversarial-test-guard 배선', devWrite.includes('adversarial-test-guard'), true)
  assert('dev PostToolUse Write에 fake-impl-guard 배선', devWrite.includes('fake-impl-guard'), true)
  assert('dev PostToolUse Edit에 adversarial-test-guard 배선', devEdit.includes('adversarial-test-guard'), true)
  assert('dev PostToolUse Edit에 fake-impl-guard 배선', devEdit.includes('fake-impl-guard'), true)

  const util = generate('--util')
  const utilWriteBlock = util.hooks.PostToolUse.find(b => b.matcher === 'Write')
  const utilWrite = utilWriteBlock ? utilWriteBlock.hooks.map(h => h.command).join(' ') : ''
  assert('util 모드에는 adversarial-test-guard 미배선', utilWrite.includes('adversarial-test-guard'), false)
  assert('util 모드에는 fake-impl-guard 미배선', utilWrite.includes('fake-impl-guard'), false)
}

// ── 레거시 대형 프로젝트 프로파일 (2026-08-26) ───────────────────────────
console.log('\n[--legacy] tdd-guard 제외 · typescript-quality --changed-only')
{
  const cmds = (s, matcher) => {
    const blk = s.hooks.PostToolUse.find(b => b.matcher === matcher)
    return blk ? blk.hooks.map(h => h.command) : []
  }
  const s = generate('--dev', '--typescript', '--legacy')
  const w = cmds(s, 'Write'), e = cmds(s, 'Edit')
  assert('legacy: Write에 tdd-guard 미배선', w.some(c => c.includes('tdd-guard')), false)
  assert('legacy: Edit에 tdd-guard 미배선', e.some(c => c.includes('tdd-guard')), false)
  assert('legacy: adversarial-test-guard는 유지', w.some(c => c.includes('adversarial-test-guard')), true)
  assert('legacy: fake-impl-guard는 유지', w.some(c => c.includes('fake-impl-guard')), true)
  assert('legacy: test-fake-guard(PreToolUse Bash)는 유지',
    JSON.stringify(s.hooks.PreToolUse).includes('test-fake-guard'), true)
  const tsW = w.find(c => c.includes('typescript-quality'))
  const tsE = e.find(c => c.includes('typescript-quality'))
  assert('legacy: Write typescript-quality에 --changed-only 전달', (tsW || '').endsWith('typescript-quality.js --changed-only'), true)
  assert('legacy: Edit typescript-quality에 --changed-only 전달', (tsE || '').endsWith('typescript-quality.js --changed-only'), true)

  // 악성·오남용: --legacy 만 단독으로 줘도 dev 훅이 생기거나 사라지지 않아야 함 (dev 미선택 = 강제 훅 없음)
  const only = generate('--legacy')
  assert('--legacy 단독 → dev 훅 없음 (tdd/adversarial/fake-impl 전부 미배선)',
    /tdd-guard|adversarial-test-guard|fake-impl-guard/.test(JSON.stringify(only.hooks)), false)
  assert('--legacy 단독 → typescript-quality 없음 (--typescript 미선택)',
    JSON.stringify(only.hooks).includes('typescript-quality'), false)

  // 경계: legacy 없는 기본 dev+TS 는 기존 그대로 (회귀 방지)
  const base = generate('--dev', '--typescript')
  const bw = cmds(base, 'Write')
  assert('legacy 없음 → tdd-guard 배선 유지', bw.some(c => c.includes('tdd-guard')), true)
  assert('legacy 없음 → typescript-quality 인자 없음', bw.some(c => c.endsWith('typescript-quality.js')), true)

  // util + legacy: util 은 강제 훅 자체가 없으므로 legacy 가 아무것도 추가하지 않아야 함
  const u = generate('--util', '--legacy')
  assert('util + legacy → typescript-quality 미배선', JSON.stringify(u.hooks).includes('typescript-quality'), false)
}

// ── 신선도·규칙 경고 훅 배선 (2026-09-25) ────────────────────────────────
// 공식 문서: InstructionsLoaded 는 관측 전용(출력 폐기) → SessionStart(stdout·additionalContext 주입)로 이동
console.log('\n[SessionStart] instructions-loaded · staleness-check 는 SessionStart 에 배선, InstructionsLoaded 미배선')
{
  const hookCmds = (s, ev) => JSON.stringify((s.hooks[ev] || []).flatMap(g => g.hooks.map(h => h.command)))
  for (const flags of [[], ['--dev'], ['--util'], ['--memory'], ['--staleness-guard'], ['--util', '--staleness-guard']]) {
    const s = generate(...flags)
    const label = flags.join(' ') || '(기본)'
    const ss = hookCmds(s, 'SessionStart')
    assert(`${label} → SessionStart 에 instructions-loaded`, ss.includes('instructions-loaded.js'), true)
    assert(`${label} → SessionStart 에 staleness-check`, ss.includes('staleness-check.js'), true)
    assert(`${label} → InstructionsLoaded 이벤트 미배선 (출력 폐기 이벤트)`, s.hooks.InstructionsLoaded, undefined)
    // 경계: 중복 배선 금지 — 같은 훅이 두 번 실행되면 경고가 두 번 뜬다
    assert(`${label} → staleness-check 1회만 배선`, (ss.match(/staleness-check\.js/g) || []).length, 1)
  }
  // --staleness-guard 옵션은 --strict 로 전달, 미선택 시 --strict 없음
  assert('--staleness-guard → --strict 전달', hookCmds(generate('--staleness-guard'), 'SessionStart').includes('staleness-check.js --strict'), true)
  assert('기본 → --strict 없음', hookCmds(generate(), 'SessionStart').includes('--strict'), false)
  // 공식 문서: "All matching hooks run in parallel." — 배열 순서는 실행 순서를 보장하지 않으므로
  // 순서 단언 대신 "각 훅이 정확히 1회 배선" 만 확인한다 (2026-09-26 순서 가정 정정)
  const m = hookCmds(generate('--memory'), 'SessionStart')
  assert('--memory → memory-pull 1회만 배선', (m.match(/memory-pull\.js/g) || []).length, 1)
  // 악성 입력: 알 수 없는 플래그가 배선을 깨뜨리지 않음
  assert('알 수 없는 플래그 → SessionStart 배선 유지', hookCmds(generate('--unknown-flag'), 'SessionStart').includes('staleness-check.js'), true)
}

// ── $CLAUDE_PROJECT_DIR 따옴표 (2026-09-26) ─────────────────────────────
// 공식 문서(hooks "Reference scripts by path"): "In shell form, wrap each placeholder in double quotes."
// 무따옴표면 공백 포함 경로에서 단어 분리 → Cannot find module → 모든 가드 fail-open
console.log('\n[quoting] 모든 훅·statusLine 명령이 "$CLAUDE_PROJECT_DIR" 로 따옴표 처리')
{
  const fs = require('fs')
  const os = require('os')
  const { spawnSync } = require('child_process')
  const allCmds = (s) => [
    ...Object.values(s.hooks).flatMap(groups => groups.flatMap(g => g.hooks.map(h => h.command))),
    s.statusLine.command,
  ]
  const combos = [[], ['--dev', '--typescript', '--legacy'], ['--dev', '--typescript'], ['--util'],
    ['--memory', '--codex', '--readme-guard', '--staleness-guard', '--branch-protection'],
    ['--util', '--memory', '--codex', '--readme-guard', '--branch-protection']]
  for (const flags of combos) {
    const label = flags.join(' ') || '(기본)'
    const cmds = allCmds(generate(...flags))
    // 악성·경계: 무따옴표 형태($CLAUDE_PROJECT_DIR/ 가 따옴표 없이 시작)가 하나라도 남으면 실패
    const bare = cmds.filter(c => /(^|[^"])\$\{?CLAUDE_PROJECT_DIR\}?\//.test(c))
    assert(`${label} → 무따옴표 $CLAUDE_PROJECT_DIR 0건`, bare.length, 0)
    assert(`${label} → 모든 명령이 "$CLAUDE_PROJECT_DIR"/.claude/hooks/ 형식`,
      cmds.every(c => c.includes('"$CLAUDE_PROJECT_DIR"/.claude/hooks/')), true)
  }
  // 실제 셸 실행: 공백·따옴표 유사 문자·한글이 섞인 프로젝트 경로에서 훅 스크립트가 실행되는지
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'gen settings q '))
  const proj = path.join(base, "my proj 한글 (v2)")
  fs.mkdirSync(path.join(proj, '.claude', 'hooks'), { recursive: true })
  const marker = path.join(base, 'ran.txt')
  const s = generate('--dev', '--typescript', '--memory', '--codex', '--staleness-guard', '--branch-protection')
  const names = new Set(allCmds(s).map(c => (c.match(/\.claude\/hooks\/([\w.-]+)/) || [])[1]).filter(Boolean))
  for (const n of names) {
    const body = n.endsWith('.sh')
      ? `echo "${n} $*" >> "${marker}"\n`
      : `require('fs').appendFileSync(${JSON.stringify(marker)}, ${JSON.stringify(n)} + ' ' + process.argv.slice(2).join(' ') + '\\n')\n`
    fs.writeFileSync(path.join(proj, '.claude', 'hooks', n), body)
  }
  let okAll = true
  for (const c of allCmds(s)) {
    const r = spawnSync('bash', ['-c', c], { env: { ...process.env, CLAUDE_PROJECT_DIR: proj }, encoding: 'utf8', input: '{}' })
    if (r.status !== 0) { okAll = false; console.log(`    실패: ${c}\n    ${r.stderr.slice(0, 200)}`) }
  }
  assert('공백·한글·괄호 경로에서 모든 배선 명령 exit 0', okAll, true)
  const ran = fs.existsSync(marker) ? fs.readFileSync(marker, 'utf8') : ''
  assert('--strict 인자가 스크립트까지 그대로 전달', /staleness-check\.js --strict/.test(ran), true)
  assert('--no-readme 인자가 스크립트까지 그대로 전달', /deliverable-guard\.js --no-readme/.test(ran), true)
  fs.rmSync(base, { recursive: true, force: true })
}

// ── 원본 레포 settings.json ↔ 생성기 전체 옵션 출력 동기 (2026-10-05) ──────
// 원본 레포는 모든 옵션을 켠 설치본과 같은 설정을 써야 한다(원본에서 훅을 실사용하며 검증하는 구조).
// 손으로 고친 settings.json 이 생성기와 어긋나 statusLine 누락·allow 누락·훅 배선 누락(verification-guard
// PostToolUse Write)이 생긴 것을 계기로, 의미 단위(훅은 이벤트별 matcher::command 집합, 권한은 집합)로 비교한다.
console.log('\n[회귀] 원본 .claude/settings.json == gen-settings 전체 옵션 출력 (의미 비교)')
{
  const full = generate('--dev', '--typescript', '--memory', '--superpowers', '--codex', '--readme-guard', '--staleness-guard', '--branch-protection')
  const repo = JSON.parse(require('fs').readFileSync(path.join(__dirname, '..', '.claude', 'settings.json'), 'utf8'))
  const norm = (s) => {
    const o = JSON.parse(JSON.stringify(s))
    for (const ev of Object.keys(o.hooks || {})) {
      o.hooks[ev] = o.hooks[ev].flatMap((g) => g.hooks.map((h) => `${g.matcher || ''} :: ${h.command}`)).sort()
    }
    for (const k of ['allow', 'deny', 'ask', 'additionalDirectories']) if (o.permissions && o.permissions[k]) o.permissions[k] = [...o.permissions[k]].sort()
    if (o.enabledPlugins) o.enabledPlugins = Object.fromEntries(Object.entries(o.enabledPlugins).sort())
    const sorted = (v) => Array.isArray(v) ? v.map(sorted) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sorted(v[k])])) : v
    return JSON.stringify(sorted(o))
  }
  assert('원본 settings.json 이 생성기 전체 옵션 출력과 의미상 동일', norm(repo) === norm(full), true)
  // 악성·경계: 비교기가 실제 차이를 잡는지 (항상 true 인 가짜 비교 방지)
  const tampered = JSON.parse(JSON.stringify(full)); tampered.permissions.allow.push('Bash(curl*)')
  assert('비교기: allow 1줄 추가를 차이로 판정', norm(tampered) === norm(full), false)
  const unwired = JSON.parse(JSON.stringify(full)); unwired.hooks.PostToolUse[0].hooks.pop()
  assert('비교기: 훅 1개 배선 누락을 차이로 판정', norm(unwired) === norm(full), false)
}

// ── 최종 ────────────────────────────────────────────────────────────────
console.log(`\n결과: ${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
