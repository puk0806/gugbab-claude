#!/usr/bin/env node
/**
 * install-cleanup.test.js — install-cleanup.js 테스트
 * 실행: node scripts/install-cleanup.test.js
 *
 * 3계층 커버 (adversarial-testing.md):
 *  - 정상: 옵션 OFF 시 훅·배선·rules·플러그인·마커 정리, keep 시 보존
 *  - 악성 유저 방어: 커스텀 훅 임의 삭제 금지, 잘못된 JSON으로 설정 파괴 시도 방어
 *  - 이상·경계 경로: settings 없음, hooks 폴더 없음, dangling symlink, 하위 디렉토리, 공백 경로
 */

const { execSync } = require('child_process')
const crypto = require('crypto')
const fs = require('fs')
const os = require('os')
const path = require('path')

const SCRIPT = path.join(__dirname, 'install-cleanup.js')

// 매니페스트 해시 계산 (cleanup과 동일 규칙: sha256 hex)
const sha256 = (content) => crypto.createHash('sha256').update(content).digest('hex')

let passed = 0, failed = 0

function assert(desc, actual, expected) {
  const pass = actual === expected
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대: ${JSON.stringify(expected)}, 실제: ${JSON.stringify(actual)})`}`)
  pass ? passed++ : failed++
}

// ── 픽스처 헬퍼 ─────────────────────────────────────────────────────────

// 소스 레포 흉내: 현행 훅 목록만 존재 (memory-stop-guard 등 폐지 훅 없음)
const SOURCE_HOOKS = [
  '_lib.js', 'bash-guard.js', 'auto-approve.js', 'deliverable-guard.js',
  'memory-pull.js', 'memory-sync.js', 'codex-review-guard.js',
  'branch-protection.js', 'staleness-check.js', 'session-export.js',
]

function makeSource(root) {
  const hooksDir = path.join(root, '.claude', 'hooks')
  fs.mkdirSync(hooksDir, { recursive: true })
  for (const h of SOURCE_HOOKS) fs.writeFileSync(path.join(hooksDir, h), `// source ${h}\n`)
  return root
}

const H = (name) => ({ type: 'command', command: `node $CLAUDE_PROJECT_DIR/.claude/hooks/${name}` })

// 과거 Y 설치 + 폐지 훅 잔재가 섞인 "오염된" 대상 프로젝트 생성
function makeTarget(root, opts = {}) {
  const claudeDir = path.join(root, '.claude')
  const hooksDir = path.join(claudeDir, 'hooks')
  const rulesDir = path.join(claudeDir, 'rules')
  fs.mkdirSync(hooksDir, { recursive: true })
  fs.mkdirSync(rulesDir, { recursive: true })

  const hookFiles = opts.hookFiles || [
    'bash-guard.js', 'deliverable-guard.js',
    'memory-pull.js', 'memory-sync.js',
    'codex-review-guard.js', 'branch-protection.js',
    'memory-stop-guard.js', // 폐지 훅 잔재
    'staleness-check.js',
  ]
  for (const h of hookFiles) fs.writeFileSync(path.join(hooksDir, h), `// target ${h}\n`)

  const ruleFiles = opts.ruleFiles || ['git.md', 'memory-sync.md', 'codex-review.md']
  for (const r of ruleFiles) fs.writeFileSync(path.join(rulesDir, r), `# ${r}\n`)

  const settings = opts.settings !== undefined ? opts.settings : {
    defaultMode: 'acceptEdits',
    enabledPlugins: {
      'superpowers@superpowers-marketplace': true,
      'codex@openai-codex': true,
    },
    permissions: { allow: ['Read'], deny: [] },
    hooks: {
      PreToolUse: [
        { matcher: '*', hooks: [H('bash-guard.js')] },
        { matcher: 'Bash', hooks: [H('deliverable-guard.js')] },
        { matcher: 'Bash', hooks: [H('branch-protection.js')] },
      ],
      PostToolUse: [
        { matcher: 'Write', hooks: [H('deliverable-guard.js'), H('memory-sync.js')] },
        { matcher: 'Edit', hooks: [H('deliverable-guard.js'), H('memory-sync.js')] },
      ],
      SessionStart: [{ hooks: [H('memory-pull.js'), H('session-start.js')] }],
      InstructionsLoaded: [{
        hooks: [
          { type: 'command', command: 'node $CLAUDE_PROJECT_DIR/.claude/hooks/staleness-check.js --strict' },
        ],
      }],
      Stop: [{ hooks: [H('deliverable-guard.js'), H('codex-review-guard.js'), H('memory-stop-guard.js'), H('session-export.js')] }],
    },
  }
  if (settings !== null) {
    fs.writeFileSync(path.join(claudeDir, 'settings.json'),
      typeof settings === 'string' ? settings : JSON.stringify(settings, null, 2))
  }

  if (opts.marker !== false) fs.writeFileSync(path.join(claudeDir, '.codex-review-done'), '')

  // 기본값: 이 대상은 "매니페스트가 있는 정상 설치"를 모델링한다 — makeTarget이 심은
  // 훅 파일들을 설치 시점 해시와 함께 기록해, 소유 증명 기반 정리가 작동하게 한다.
  // 레거시(매니페스트 없는 구버전 설치)를 모델링하는 테스트는 manifest: false를 넘긴다.
  if (opts.manifest !== false) {
    const hookHashes = {}
    for (const h of hookFiles) hookHashes[h] = sha256(`// target ${h}\n`)
    fs.writeFileSync(path.join(claudeDir, '.install-manifest.json'), JSON.stringify({
      version: 1,
      memoryManaged: hookFiles.some((h) => /^memory-(pull|sync)/.test(h)),
      agents: [], skills: [], hooks: hookFiles,
      // rules 도 설치 관리 파일로 기록 (2026-08-26) — 소유 증명 없이는 옵션 OFF 규칙을 지우지 않는다
      rules: ruleFiles,
      hashes: { agents: {}, skills: {}, hooks: hookHashes,
        rules: Object.fromEntries(ruleFiles.map((r) => [r, sha256(`# ${r}\n`)])) },
    }, null, 2))
  }

  if (opts.repoMemory !== false) {
    const mem = path.join(root, 'memory')
    fs.mkdirSync(mem, { recursive: true })
    fs.writeFileSync(path.join(mem, 'MEMORY.md'), '# index\n')
    fs.writeFileSync(path.join(mem, 'note-a.md'), 'repo note a\n')
  }
  return root
}

function run(target, source, globalRoot, keeps = [], expectFail = false) {
  const cmd = [
    'node', `"${SCRIPT}"`,
    target !== null ? `--target "${target}"` : '',
    source !== null ? `--source "${source}"` : '',
    globalRoot ? `--global-root "${globalRoot}"` : '',
    ...keeps,
  ].filter(Boolean).join(' ')
  try {
    return { out: execSync(cmd, { encoding: 'utf8' }), code: 0 }
  } catch (e) {
    if (!expectFail) console.log(`  (스크립트 실패: ${e.message})`)
    return { out: (e.stdout || '') + (e.stderr || ''), code: e.status ?? 1 }
  }
}

function readSettings(target) {
  return JSON.parse(fs.readFileSync(path.join(target, '.claude', 'settings.json'), 'utf8'))
}

function flatHooks(settings) {
  return JSON.stringify(settings.hooks || {})
}

function tmp(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `icu-${name}-`))
}

// 전역 memory 루트에서 인코딩된 프로젝트 경로 계산 (memory-pull.js와 동일 규칙)
function encoded(target) {
  return path.resolve(target).replace(/[/\\_]/g, '-')
}

// ═══════════════════════════════════════════════════════════════════════
// 정상 계층 (Happy path)
// ═══════════════════════════════════════════════════════════════════════

console.log('\n[정상] memory OFF → 훅·배선·rule·레포 memory 정리 + 전역 이전')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const glo = tmp('glo')
  run(tgt, src, glo)

  assert('memory-pull.js 삭제', fs.existsSync(path.join(tgt, '.claude/hooks/memory-pull.js')), false)
  assert('memory-sync.js 삭제', fs.existsSync(path.join(tgt, '.claude/hooks/memory-sync.js')), false)
  assert('memory-sync.md rule 삭제', fs.existsSync(path.join(tgt, '.claude/rules/memory-sync.md')), false)
  assert('무관한 rule(git.md) 보존', fs.existsSync(path.join(tgt, '.claude/rules/git.md')), true)

  const s = readSettings(tgt)
  assert('배선에서 memory-pull 제거', flatHooks(s).includes('memory-pull'), false)
  assert('배선에서 memory-sync 제거', flatHooks(s).includes('memory-sync'), false)
  assert('SessionStart의 다른 훅(session-start) 보존', flatHooks(s).includes('session-start.js'), true)

  const gloMem = path.join(glo, encoded(tgt), 'memory')
  assert('레포 memory → 전역 이전 (note-a.md)', fs.existsSync(path.join(gloMem, 'note-a.md')), true)
  assert('레포 memory/ 폴더 삭제', fs.existsSync(path.join(tgt, 'memory')), false)
}

console.log('\n[정상] codex OFF → 훅·rule·플러그인·마커·배선 정리')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const glo = tmp('glo')
  run(tgt, src, glo, ['--keep-memory'])

  assert('codex-review-guard.js 삭제', fs.existsSync(path.join(tgt, '.claude/hooks/codex-review-guard.js')), false)
  assert('codex-review.md rule 삭제', fs.existsSync(path.join(tgt, '.claude/rules/codex-review.md')), false)
  assert('.codex-review-done 마커 삭제', fs.existsSync(path.join(tgt, '.claude/.codex-review-done')), false)
  const s = readSettings(tgt)
  assert('codex 플러그인 제거', s.enabledPlugins?.['codex@openai-codex'], undefined)
  assert('Stop 배선에서 codex-review-guard 제거', flatHooks(s).includes('codex-review-guard'), false)
  assert('--keep-memory → memory 훅 파일 보존', fs.existsSync(path.join(tgt, '.claude/hooks/memory-sync.js')), true)
  assert('--keep-memory → memory 배선 보존', flatHooks(s).includes('memory-sync.js'), true)
  assert('--keep-memory → 레포 memory/ 보존', fs.existsSync(path.join(tgt, 'memory')), true)
}

console.log('\n[정상] branch-protection OFF / superpowers OFF')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  run(tgt, src, tmp('glo'))
  const s = readSettings(tgt)
  assert('branch-protection.js 삭제', fs.existsSync(path.join(tgt, '.claude/hooks/branch-protection.js')), false)
  assert('배선에서 branch-protection 제거', flatHooks(s).includes('branch-protection'), false)
  assert('superpowers 플러그인 제거', s.enabledPlugins?.['superpowers@superpowers-marketplace'], undefined)
  assert('플러그인 전부 제거 시 enabledPlugins 필드 삭제', 'enabledPlugins' in s, false)
}

console.log('\n[정상] keep 플래그 → 해당 옵션 완전 보존')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  run(tgt, src, tmp('glo'), ['--keep-memory', '--keep-codex', '--keep-branch-protection', '--keep-superpowers'])
  const s = readSettings(tgt)
  assert('codex 훅 보존', fs.existsSync(path.join(tgt, '.claude/hooks/codex-review-guard.js')), true)
  assert('codex 플러그인 보존', s.enabledPlugins?.['codex@openai-codex'], true)
  assert('superpowers 플러그인 보존', s.enabledPlugins?.['superpowers@superpowers-marketplace'], true)
  assert('branch-protection 배선 보존', flatHooks(s).includes('branch-protection.js'), true)
  assert('마커 보존', fs.existsSync(path.join(tgt, '.claude/.codex-review-done')), true)
}

console.log('\n[정상] 폐지 훅(retired)은 소유 확인(레거시: --delete-orphans) 후 keep과 무관하게 정리')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), { manifest: false })
  run(tgt, src, tmp('glo'), ['--keep-memory', '--keep-codex', '--keep-branch-protection', '--delete-orphans'])
  const s = readSettings(tgt)
  assert('memory-stop-guard.js 파일 삭제', fs.existsSync(path.join(tgt, '.claude/hooks/memory-stop-guard.js')), false)
  assert('memory-stop-guard 배선 제거', flatHooks(s).includes('memory-stop-guard'), false)
}

console.log('\n[악성 방어] 폐지 훅 이름과 겹치는 파일 — 소유 증명 없으면(레거시·무플래그) 보존')
{
  // 대상 프로젝트가 같은 이름의 자체 훅을 운영 중일 수 있다. 매니페스트도 없고
  // 사용자 확인(--delete-orphans)도 없으면 파일·배선 모두 건드리지 않는다.
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), { manifest: false })
  const { out } = run(tgt, src, tmp('glo'), ['--keep-memory', '--keep-codex', '--keep-branch-protection'])
  assert('memory-stop-guard.js 보존', fs.existsSync(path.join(tgt, '.claude/hooks/memory-stop-guard.js')), true)
  assert('배선도 보존 (파일과 일관)', flatHooks(readSettings(tgt)).includes('memory-stop-guard'), true)
  assert('보존 경고 출력', out.includes('memory-stop-guard'), true)
}

console.log('\n[정상] .cjs 구세대 훅 → 파일 삭제, keep 옵션은 배선을 .js로 재작성')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), {
    hookFiles: ['bash-guard.js', 'memory-pull.cjs', 'memory-sync.cjs', 'codex-review-guard.cjs'],
    settings: {
      defaultMode: 'acceptEdits',
      hooks: {
        PostToolUse: [{ matcher: 'Write', hooks: [H('memory-sync.cjs')] }],
        SessionStart: [{ hooks: [H('memory-pull.cjs')] }],
        Stop: [{ hooks: [H('codex-review-guard.cjs')] }],
      },
    },
  })
  run(tgt, src, tmp('glo'), ['--keep-memory'])
  const s = readSettings(tgt)
  assert('memory-sync.cjs 파일 삭제', fs.existsSync(path.join(tgt, '.claude/hooks/memory-sync.cjs')), false)
  assert('keep-memory → 배선이 .js로 재작성', flatHooks(s).includes('memory-sync.js'), true)
  assert('.cjs 배선 잔존 없음', flatHooks(s).includes('.cjs'), false)
  assert('codex OFF → .cjs 배선도 그냥 제거', flatHooks(s).includes('codex-review-guard'), false)
}

console.log('\n[정상] staleness --strict: keep 없으면 다운그레이드, keep 있으면 유지')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  run(tgt, src, tmp('glo'))
  assert('--strict 제거됨', flatHooks(readSettings(tgt)).includes('--strict'), false)
  assert('staleness-check.js 자체는 유지', flatHooks(readSettings(tgt)).includes('staleness-check.js'), true)
}
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  run(tgt, src, tmp('glo'), ['--keep-staleness-strict'])
  assert('keep → --strict 유지', flatHooks(readSettings(tgt)).includes('--strict'), true)
}

console.log('\n[정상] readme-guard OFF + memory 유지 → deliverable-guard --no-readme 재배선')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  run(tgt, src, tmp('glo'), ['--keep-memory'])
  const s = readSettings(tgt)
  const preBash = (s.hooks.PreToolUse || []).filter(g => g.matcher === 'Bash')
  const preCmds = JSON.stringify(preBash)
  assert('PreToolUse Bash deliverable-guard → --no-readme', preCmds.includes('deliverable-guard.js --no-readme'), true)
  const stopCmds = JSON.stringify(s.hooks.Stop || [])
  assert('Stop deliverable-guard → --no-readme', stopCmds.includes('deliverable-guard.js --no-readme'), true)
  assert('PostToolUse Write의 deliverable-guard는 bare 유지', JSON.stringify(s.hooks.PostToolUse[0]).includes('deliverable-guard.js"'), true)
}

console.log('\n[정상] readme-guard OFF + memory OFF → PreToolUse Bash의 deliverable-guard 항목 제거')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  run(tgt, src, tmp('glo'))
  const s = readSettings(tgt)
  const preBash = JSON.stringify((s.hooks.PreToolUse || []).filter(g => g.matcher === 'Bash'))
  assert('PreToolUse Bash에 deliverable-guard 없음', preBash.includes('deliverable-guard'), false)
}

console.log('\n[정상] keep-readme-guard → PreToolUse Bash·Stop 모두 bare deliverable-guard')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  run(tgt, src, tmp('glo'), ['--keep-readme-guard'])
  const s = readSettings(tgt)
  assert('배선에 --no-readme 없음', flatHooks(s).includes('--no-readme'), false)
  const preBash = JSON.stringify((s.hooks.PreToolUse || []).filter(g => g.matcher === 'Bash'))
  assert('PreToolUse Bash에 deliverable-guard 유지', preBash.includes('deliverable-guard.js'), true)
}

console.log('\n[정상] 빈 그룹 정리 — 마지막 훅 제거 시 matcher 그룹도 제거')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), {
    settings: {
      defaultMode: 'acceptEdits',
      hooks: {
        SessionStart: [{ hooks: [H('memory-pull.js')] }],
        PostToolUse: [{ matcher: 'Write', hooks: [H('memory-sync.js')] }],
      },
    },
  })
  run(tgt, src, tmp('glo'))
  const s = readSettings(tgt)
  assert('빈 SessionStart 이벤트 제거', 'SessionStart' in (s.hooks || {}), false)
  assert('빈 PostToolUse 이벤트 제거', 'PostToolUse' in (s.hooks || {}), false)
}

console.log('\n[정상] 전역 memory symlink → 실제 디렉토리 마이그레이션')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const glo = tmp('glo')
  const gloProj = path.join(glo, encoded(tgt))
  fs.mkdirSync(gloProj, { recursive: true })
  fs.symlinkSync(path.join(tgt, 'memory'), path.join(gloProj, 'memory')) // 구버전 symlink 재현
  run(tgt, src, glo)

  const st = fs.lstatSync(path.join(gloProj, 'memory'))
  assert('symlink → 실제 디렉토리', st.isSymbolicLink(), false)
  assert('디렉토리로 존재', st.isDirectory(), true)
  assert('파일 보존 (note-a.md)', fs.existsSync(path.join(gloProj, 'memory/note-a.md')), true)
  assert('레포 memory/ 삭제', fs.existsSync(path.join(tgt, 'memory')), false)
}

// ═══════════════════════════════════════════════════════════════════════
// 악성 유저 방어 계층 (Adversarial)
// ═══════════════════════════════════════════════════════════════════════

console.log('\n[악성 방어] 사용자 커스텀 훅은 절대 삭제하지 않음 (임의 삭제 공격 방어)')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), {
    hookFiles: ['my-custom-hook.js', '../../evil.js'.replace(/\//g, '_'), 'memory-sync.js'],
  })
  const { out } = run(tgt, src, tmp('glo'))
  assert('커스텀 훅 보존', fs.existsSync(path.join(tgt, '.claude/hooks/my-custom-hook.js')), true)
  assert('커스텀 훅 경고 출력', out.includes('my-custom-hook.js'), true)
  assert('알려진 잔재(memory-sync.js)는 삭제', fs.existsSync(path.join(tgt, '.claude/hooks/memory-sync.js')), false)
}

console.log('\n[정상] 매니페스트가 관리하는 폐기 에이전트 → 재설치 시 자동 삭제, 커스텀은 보존')
{
  // 매니페스트에 기록된 파일(=설치가 넣은 파일)이 소스에서 사라졌으면 폐기된 것 → 삭제.
  // 단, 삭제는 설치 당시 해시와 현재 내용이 일치할 때만(=설치 후 손대지 않은 파일만).
  // 매니페스트에 없는 파일은 사용자 커스텀 → 매니페스트가 있어도 절대 삭제하지 않는다.
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const agents = path.join(tgt, '.claude', 'agents', 'meta')
  fs.mkdirSync(agents, { recursive: true })
  const retired = '# retired agent\n'
  fs.writeFileSync(path.join(agents, 'planner.md'), retired)
  fs.writeFileSync(path.join(agents, 'my-custom.md'), '# user custom\n')
  fs.writeFileSync(path.join(tgt, '.claude', '.install-manifest.json'), JSON.stringify({
    version: 1, agents: ['meta/planner.md'], skills: [], memoryManaged: true,
    hashes: { agents: { 'meta/planner.md': sha256(retired) }, skills: {} },
  }))
  const { out } = run(tgt, src, tmp('glo'))
  assert('매니페스트 관리분(planner.md) 삭제', fs.existsSync(path.join(agents, 'planner.md')), false)
  assert('매니페스트 밖 커스텀(my-custom.md) 보존', fs.existsSync(path.join(agents, 'my-custom.md')), true)
  assert('커스텀은 경고로 안내', out.includes('my-custom.md'), true)
}

console.log('\n[정상] 작성 규칙 5종 — --keep-authoring 없으면 소유 증명(매니페스트 해시 또는 소스 동일) 하에 삭제, 있으면 보존 (2026-08-26)')
{
  const src = makeSource(tmp('src'))
  // 소스 레포에 규칙 원본 존재 (폴백 증명용)
  const srcRules = path.join(src, '.claude', 'rules'); fs.mkdirSync(srcRules, { recursive: true })
  fs.writeFileSync(path.join(srcRules, 'creation-workflow.md'), '# cw source\n')
  const tgt = makeTarget(tmp('tgt'))
  const rulesDir = path.join(tgt, '.claude', 'rules')
  fs.writeFileSync(path.join(rulesDir, 'agent-design.md'), '# ad installed\n')      // 매니페스트 해시 일치
  fs.writeFileSync(path.join(rulesDir, 'creation-workflow.md'), '# cw source\n')   // 매니페스트에 없지만 소스와 동일 (구버전 설치)
  fs.writeFileSync(path.join(rulesDir, 'commands.md'), '# project own commands rule\n') // 매니페스트에 없고 소스와 다름 = 자체 규칙
  fs.writeFileSync(path.join(rulesDir, 'readme-update.md'), '# edited\n')          // 매니페스트에 있지만 해시 불일치 = 로컬 수정
  fs.writeFileSync(path.join(rulesDir, 'git.md'), '# git\n')
  const m = JSON.parse(fs.readFileSync(path.join(tgt, '.claude', '.install-manifest.json'), 'utf8'))
  m.rules = ['agent-design.md', 'readme-update.md']
  m.hashes.rules = { 'agent-design.md': sha256('# ad installed\n'), 'readme-update.md': sha256('# original\n') }
  fs.writeFileSync(path.join(tgt, '.claude', '.install-manifest.json'), JSON.stringify(m))
  const { out } = run(tgt, src, tmp('glo'))
  assert('매니페스트 해시 일치 → agent-design.md 삭제', fs.existsSync(path.join(rulesDir, 'agent-design.md')), false)
  assert('구버전(미기록)이지만 소스와 동일 → creation-workflow.md 삭제', fs.existsSync(path.join(rulesDir, 'creation-workflow.md')), false)
  assert('프로젝트 자체 규칙(미기록·소스와 다름) → commands.md 보존', fs.existsSync(path.join(rulesDir, 'commands.md')), true)
  assert('로컬 수정본(해시 불일치) → readme-update.md 보존', fs.existsSync(path.join(rulesDir, 'readme-update.md')), true)
  assert('보존 경고 출력', /commands\.md/.test(out) && /readme-update\.md/.test(out), true)
  assert('공통 git.md 보존', fs.existsSync(path.join(rulesDir, 'git.md')), true)
}

console.log('\n[정상] settings 보존 경로에서 최상위 defaultMode → permissions.defaultMode 이관 (2026-08-26)')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), { hookFiles: ['bash-guard.js'], settings: { defaultMode: 'acceptEdits', permissions: { allow: ['Read'] }, hooks: {} } })
  run(tgt, src, tmp('glo'))
  const s = readSettings(tgt)
  assert('permissions.defaultMode 로 이관', s.permissions.defaultMode, 'acceptEdits')
  assert('최상위 defaultMode 제거', 'defaultMode' in s, false)
  assert('기존 permissions.allow 보존', JSON.stringify(s.permissions.allow), '["Read"]')
}
{
  // 둘 다 있으면 중첩 값이 우선 — 최상위만 제거
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), { hookFiles: ['bash-guard.js'], settings: { defaultMode: 'plan', permissions: { defaultMode: 'auto' }, hooks: {} } })
  run(tgt, src, tmp('glo'))
  const s = readSettings(tgt)
  assert('중첩 값 유지(auto)', s.permissions.defaultMode, 'auto')
  assert('최상위 제거', 'defaultMode' in s, false)
}
{
  // 악성·경계: permissions 가 배열/문자열 등 객체가 아니면 객체로 교체하되 크래시 없음, defaultMode 가 문자열이 아니면 건드리지 않음
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), { hookFiles: ['bash-guard.js'], settings: { defaultMode: { evil: 1 }, permissions: 'oops', hooks: {} } })
  const { code } = run(tgt, src, tmp('glo'))
  const s = readSettings(tgt)
  assert('비문자열 defaultMode 는 이관하지 않음(유지)', typeof s.defaultMode, 'object')
  assert('exit 0', code, 0)
}
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  fs.writeFileSync(path.join(tgt, '.claude', 'rules', 'agent-design.md'), '# a\n')
  run(tgt, src, tmp('glo'), ['--keep-authoring'])
  assert('--keep-authoring → agent-design.md 보존', fs.existsSync(path.join(tgt, '.claude/rules/agent-design.md')), true)
}

console.log('\n[정상] commands 정리 (2026-08-26) — 옵션 OFF·소스 폐기분은 소유 증명 시 삭제, 커스텀·수정본 보존')
{
  const src = makeSource(tmp('src'))
  // 소스에 커맨드 3종 존재
  const srcCmd = path.join(src, '.claude', 'commands')
  fs.mkdirSync(srcCmd, { recursive: true })
  for (const c of ['commit.md', 'codex-review.md', 'tdd-implement.md']) fs.writeFileSync(path.join(srcCmd, c), `# ${c}\n`)
  const tgt = makeTarget(tmp('tgt'))
  const tgtCmd = path.join(tgt, '.claude', 'commands')
  fs.mkdirSync(tgtCmd, { recursive: true })
  const body = (c) => `# ${c}\n`
  for (const c of ['commit.md', 'codex-review.md', 'tdd-implement.md', 'retired-cmd.md']) fs.writeFileSync(path.join(tgtCmd, c), body(c))
  fs.writeFileSync(path.join(tgtCmd, 'my-custom.md'), '# user custom\n')          // 매니페스트 밖
  fs.writeFileSync(path.join(tgtCmd, 'create-plan.md'), '# user edited create-plan\n') // 관리분이지만 로컬 수정
  fs.writeFileSync(path.join(tgt, '.claude', '.install-manifest.json'), JSON.stringify({
    version: 1, memoryManaged: false, agents: [], skills: [], hooks: [],
    commands: ['commit.md', 'codex-review.md', 'tdd-implement.md', 'retired-cmd.md', 'create-plan.md'],
    hashes: { agents: {}, skills: {}, hooks: {}, commands: {
      'commit.md': sha256(body('commit.md')), 'codex-review.md': sha256(body('codex-review.md')),
      'tdd-implement.md': sha256(body('tdd-implement.md')), 'retired-cmd.md': sha256(body('retired-cmd.md')),
      'create-plan.md': sha256('# original create-plan\n'),
    } },
  }))
  // 재설치: codex OFF, dev OFF(util 다운그레이드)
  const { out } = run(tgt, src, tmp('glo'))
  assert('codex OFF → codex-review.md 삭제', fs.existsSync(path.join(tgtCmd, 'codex-review.md')), false)
  assert('dev OFF → tdd-implement.md 삭제', fs.existsSync(path.join(tgtCmd, 'tdd-implement.md')), false)
  assert('소스에서 폐기된 retired-cmd.md 삭제', fs.existsSync(path.join(tgtCmd, 'retired-cmd.md')), false)
  assert('공통 commit.md 보존', fs.existsSync(path.join(tgtCmd, 'commit.md')), true)
  assert('매니페스트 밖 커스텀 보존', fs.existsSync(path.join(tgtCmd, 'my-custom.md')), true)
  assert('로컬 수정된 관리분(create-plan.md, 해시 불일치) 보존', fs.existsSync(path.join(tgtCmd, 'create-plan.md')), true)
  assert('수정본 보존 경고 출력', out.includes('create-plan.md'), true)
}
{
  // 옵션 유지 시에는 삭제하지 않음 (keep-codex + keep-dev)
  const src = makeSource(tmp('src'))
  const srcCmd = path.join(src, '.claude', 'commands'); fs.mkdirSync(srcCmd, { recursive: true })
  for (const c of ['codex-review.md', 'tdd-implement.md']) fs.writeFileSync(path.join(srcCmd, c), `# ${c}\n`)
  const tgt = makeTarget(tmp('tgt'))
  const tgtCmd = path.join(tgt, '.claude', 'commands'); fs.mkdirSync(tgtCmd, { recursive: true })
  for (const c of ['codex-review.md', 'tdd-implement.md']) fs.writeFileSync(path.join(tgtCmd, c), `# ${c}\n`)
  fs.writeFileSync(path.join(tgt, '.claude', '.install-manifest.json'), JSON.stringify({
    version: 1, memoryManaged: false, agents: [], skills: [], hooks: [],
    commands: ['codex-review.md', 'tdd-implement.md'],
    hashes: { agents: {}, skills: {}, hooks: {}, commands: { 'codex-review.md': sha256('# codex-review.md\n'), 'tdd-implement.md': sha256('# tdd-implement.md\n') } },
  }))
  run(tgt, src, tmp('glo'), ['--keep-codex', '--keep-dev'])
  assert('keep-codex → codex-review.md 보존', fs.existsSync(path.join(tgtCmd, 'codex-review.md')), true)
  assert('keep-dev → tdd-implement.md 보존', fs.existsSync(path.join(tgtCmd, 'tdd-implement.md')), true)
}
{
  // 악성: 매니페스트에 commands 기록이 없는(구버전) 설치 → 옵션 OFF여도 소유 증명 불가 → 삭제하지 않고 경고
  const src = makeSource(tmp('src'))
  const srcCmd = path.join(src, '.claude', 'commands'); fs.mkdirSync(srcCmd, { recursive: true })
  fs.writeFileSync(path.join(srcCmd, 'codex-review.md'), '# codex-review.md\n')
  const tgt = makeTarget(tmp('tgt'))
  const tgtCmd = path.join(tgt, '.claude', 'commands'); fs.mkdirSync(tgtCmd, { recursive: true })
  fs.writeFileSync(path.join(tgtCmd, 'codex-review.md'), '# codex-review.md\n')
  const { out } = run(tgt, src, tmp('glo'))
  assert('commands 미기록 매니페스트 → codex-review.md 보존(증명 불가)', fs.existsSync(path.join(tgtCmd, 'codex-review.md')), true)
  assert('미확인 잔재 경고', out.includes('codex-review.md'), true)
}

console.log('\n[악성 방어] 관리 파일이라도 로컬에서 수정됐으면(해시 불일치) 삭제하지 않음')
{
  // 사용자가 설치된 파일을 고쳐서 쓰고 있는데 소스에서 폐기됐다고 지우면 수정분이 유실된다.
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const agents = path.join(tgt, '.claude', 'agents', 'meta')
  fs.mkdirSync(agents, { recursive: true })
  fs.writeFileSync(path.join(agents, 'planner.md'), '# retired BUT locally customized\n')
  fs.writeFileSync(path.join(tgt, '.claude', '.install-manifest.json'), JSON.stringify({
    version: 1, agents: ['meta/planner.md'], skills: [], memoryManaged: true,
    hashes: { agents: { 'meta/planner.md': sha256('# original installed content\n') } },
  }))
  const { out } = run(tgt, src, tmp('glo'))
  assert('로컬 수정된 관리 파일 보존', fs.existsSync(path.join(agents, 'planner.md')), true)
  assert('수정 감지 경고 출력', out.includes('planner.md'), true)
}

console.log('\n[경계] 매니페스트에 해시 기록이 없는 관리 파일 → 보수적으로 보존')
{
  // 해시 없이는 "설치 후 안 건드렸다"를 증명할 수 없으므로 삭제하지 않는다.
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const agents = path.join(tgt, '.claude', 'agents', 'meta')
  fs.mkdirSync(agents, { recursive: true })
  fs.writeFileSync(path.join(agents, 'planner.md'), '# retired agent\n')
  fs.writeFileSync(path.join(tgt, '.claude', '.install-manifest.json'), JSON.stringify({
    version: 1, agents: ['meta/planner.md'], skills: [], memoryManaged: true,
  }))
  run(tgt, src, tmp('glo'))
  assert('해시 미기록 관리 파일 보존', fs.existsSync(path.join(agents, 'planner.md')), true)
}

console.log('\n[악성 방어] 매니페스트에 경로 조작(../) 항목이 있어도 대상 폴더 밖은 건드리지 않음')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const outside = path.join(path.dirname(tgt), `outside-victim-${path.basename(tgt)}.md`)
  fs.writeFileSync(outside, '# outside file\n')
  const relEvil = path.relative(path.join(tgt, '.claude', 'agents'), outside)
  fs.mkdirSync(path.join(tgt, '.claude', 'agents'), { recursive: true })
  fs.writeFileSync(path.join(tgt, '.claude', '.install-manifest.json'), JSON.stringify({
    version: 1, agents: [relEvil], skills: [], memoryManaged: true,
    hashes: { agents: { [relEvil]: sha256('# outside file\n') } },
  }))
  run(tgt, src, tmp('glo'))
  assert('대상 폴더 밖 파일은 삭제되지 않음', fs.existsSync(outside), true)
  fs.unlinkSync(outside)
}

console.log('\n[악성 방어] 매니페스트 memoryManaged=false → 훅 흔적이 있어도 memory/ 를 건드리지 않음')
{
  // 훅 잔재 같은 정황 증거보다 매니페스트의 명시적 선언이 우선한다 —
  // memory/ 를 재사용 중인 프로젝트를 정황 추정으로 옮기는 사고 방지.
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt')) // memory 훅 흔적 있음
  fs.writeFileSync(path.join(tgt, '.claude', '.install-manifest.json'), JSON.stringify({
    version: 1, agents: [], skills: [], memoryManaged: false,
  }))
  const glo = tmp('glo')
  run(tgt, src, glo)
  assert('repo memory/ 보존', fs.existsSync(path.join(tgt, 'memory', 'note-a.md')), true)
  assert('전역 이전 안 함', fs.existsSync(path.join(glo, encoded(tgt), 'memory', 'note-a.md')), false)
}

console.log('\n[정상] 매니페스트 없음 + --delete-orphans (1회 확인 후) → 잔재 일괄 정리')
{
  // 구버전 설치처: 매니페스트가 없으므로 설치 스크립트가 사용자에게 1회 확인을 받고
  // 이 플래그를 넘긴다. 플래그가 있을 때만 잔재를 삭제한다.
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), { manifest: false })
  const agents = path.join(tgt, '.claude', 'agents', 'meta')
  fs.mkdirSync(agents, { recursive: true })
  fs.writeFileSync(path.join(agents, 'planner.md'), '# retired agent\n')
  run(tgt, src, tmp('glo'), ['--delete-orphans'])
  assert('잔재(planner.md) 삭제', fs.existsSync(path.join(agents, 'planner.md')), false)
}

console.log('\n[악성 방어] 깨진 매니페스트 JSON → 아무것도 삭제하지 않고 경고 폴백')
{
  // 조작·손상된 매니페스트로 임의 파일이 삭제되는 일이 없어야 한다.
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const agents = path.join(tgt, '.claude', 'agents', 'meta')
  fs.mkdirSync(agents, { recursive: true })
  fs.writeFileSync(path.join(agents, 'planner.md'), '# retired agent\n')
  fs.writeFileSync(path.join(tgt, '.claude', '.install-manifest.json'), '{broken json')
  const { out } = run(tgt, src, tmp('glo'), ['--delete-orphans'])
  assert('깨진 매니페스트 → 삭제 없음 (--delete-orphans 도 무시)', fs.existsSync(path.join(agents, 'planner.md')), true)
  assert('매니페스트 파싱 실패 경고', out.includes('매니페스트') || out.includes('manifest'), true)
}

console.log('\n[악성 방어] memory/ 를 다른 용도로 재사용한 프로젝트 → 비(非)메모리 파일은 이전·삭제하지 않음')
{
  // 시나리오: 예전에 memory 공유를 쓰다가 배선만 남긴 채 memory/ 를 앱 데이터 폴더로 재사용.
  // 관리 흔적(memory 훅)이 있으므로 managed 로 판정되지만, 메모리 아티팩트가 아닌
  // 파일까지 전역으로 옮기고 레포에서 지우면 런타임에 그 파일을 읽던 앱이 깨진다.
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const glo = tmp('glo')
  const mem = path.join(tgt, 'memory')
  fs.writeFileSync(path.join(mem, 'app-data.json'), '{"orders":[1,2,3]}\n')
  fs.writeFileSync(path.join(mem, 'fixtures.csv'), 'id,name\n1,a\n')

  const { out } = run(tgt, src, glo)
  const gloMem = path.join(glo, encoded(tgt), 'memory')

  assert('앱 데이터(app-data.json) 레포에 보존', fs.existsSync(path.join(mem, 'app-data.json')), true)
  assert('앱 데이터(fixtures.csv) 레포에 보존', fs.existsSync(path.join(mem, 'fixtures.csv')), true)
  assert('앱 데이터가 전역으로 새지 않음', fs.existsSync(path.join(gloMem, 'app-data.json')), false)
  assert('진짜 메모리(note-a.md)는 정상 이전', fs.existsSync(path.join(gloMem, 'note-a.md')), true)
  assert('비메모리 파일 잔존 시 memory/ 폴더 보존', fs.existsSync(mem), true)
  assert('사용자에게 경고 출력', out.includes('app-data.json'), true)
}

console.log('\n[경계] memory/ 에 .md 만 있으면 종전대로 전량 이전 + 폴더 삭제')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const glo = tmp('glo')
  run(tgt, src, glo)
  const gloMem = path.join(glo, encoded(tgt), 'memory')
  assert('MEMORY.md 이전', fs.existsSync(path.join(gloMem, 'MEMORY.md')), true)
  assert('note-a.md 이전', fs.existsSync(path.join(gloMem, 'note-a.md')), true)
  assert('memory/ 폴더 삭제 (잔존 파일 없음)', fs.existsSync(path.join(tgt, 'memory')), false)
}

console.log('\n[악성 방어] 깨진 settings.json → 파일 그대로 보존 + 배선 깨짐 방지 위해 훅 삭제도 스킵')
{
  const src = makeSource(tmp('src'))
  const broken = '{ "defaultMode": "acceptEdits", INVALID JSON !!!'
  const tgt = makeTarget(tmp('tgt'), { settings: broken })
  const { out, code } = run(tgt, src, tmp('glo'))
  const after = fs.readFileSync(path.join(tgt, '.claude/settings.json'), 'utf8')
  assert('settings.json 원본 그대로', after, broken)
  assert('exit 0 (설치 흐름 차단 금지)', code, 0)
  assert('경고 출력', /settings\.json.*(파싱|parse|경고|스킵)/i.test(out), true)
  // 배선을 고칠 수 없으면 훅 파일도 지우지 않는다 — 참조 깨진 반쪽 상태 방지 (codex 리뷰 반영)
  assert('훅 파일 삭제 스킵 (참조 무결성 보호)', fs.existsSync(path.join(tgt, '.claude/hooks/memory-sync.js')), true)
  assert('폐지 훅도 삭제 스킵', fs.existsSync(path.join(tgt, '.claude/hooks/memory-stop-guard.js')), true)
}

console.log('\n[악성 방어] --target 누락 → exit 1 (무단 실행 방어)')
{
  const src = makeSource(tmp('src'))
  const { code } = run(null, src, null, [], true)
  assert('exit code 1', code, 1)
}

console.log('\n[악성 방어] --source 누락 → exit 1')
{
  const tgt = makeTarget(tmp('tgt'))
  const { code } = run(tgt, null, null, [], true)
  assert('exit code 1', code, 1)
}

// ═══════════════════════════════════════════════════════════════════════
// 이상·경계 경로 계층 (Edge / Malformed)
// ═══════════════════════════════════════════════════════════════════════

console.log('\n[경계] settings.json 자체가 없음 → 크래시 없이 파일 정리만 수행')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), { settings: null })
  const { code } = run(tgt, src, tmp('glo'))
  assert('exit 0', code, 0)
  assert('훅 파일 정리 수행', fs.existsSync(path.join(tgt, '.claude/hooks/memory-pull.js')), false)
}

console.log('\n[경계] .claude/hooks 폴더 없음 → 크래시 없음')
{
  const src = makeSource(tmp('src'))
  const tgt = tmp('tgt')
  fs.mkdirSync(path.join(tgt, '.claude'), { recursive: true })
  const { code } = run(tgt, src, tmp('glo'))
  assert('exit 0', code, 0)
}

console.log('\n[경계] dangling symlink (대상 없는 전역 memory 링크) → 링크 제거 + 실제 디렉토리 생성')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), { repoMemory: false })
  const glo = tmp('glo')
  const gloProj = path.join(glo, encoded(tgt))
  fs.mkdirSync(gloProj, { recursive: true })
  fs.symlinkSync(path.join(tgt, 'memory'), path.join(gloProj, 'memory')) // 레포 memory 없음 → dangling
  const { code } = run(tgt, src, glo)
  assert('exit 0', code, 0)
  const st = fs.lstatSync(path.join(gloProj, 'memory'))
  assert('symlink 제거 + 실제 디렉토리', st.isDirectory() && !st.isSymbolicLink(), true)
}

console.log('\n[경계] 레포 memory에 하위 디렉토리 존재 → 파일만 이전, 폴더는 보존 + 경고')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  fs.mkdirSync(path.join(tgt, 'memory/subdir'), { recursive: true })
  fs.writeFileSync(path.join(tgt, 'memory/subdir/deep.md'), 'deep\n')
  const glo = tmp('glo')
  const { out } = run(tgt, src, glo)
  assert('최상위 파일은 전역 이전', fs.existsSync(path.join(glo, encoded(tgt), 'memory/note-a.md')), true)
  assert('레포 memory/ 폴더 보존 (하위 디렉토리 존재)', fs.existsSync(path.join(tgt, 'memory/subdir/deep.md')), true)
  assert('경고 출력', /subdir|하위|수동/.test(out), true)
}

console.log('\n[경계] 내용 충돌 + 레포 쪽이 최신 → 레포 내용으로 갱신하되 기존 전역본은 .conflict로 보존')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const glo = tmp('glo')
  const gloMem = path.join(glo, encoded(tgt), 'memory')
  fs.mkdirSync(gloMem, { recursive: true })
  fs.writeFileSync(path.join(gloMem, 'note-a.md'), 'old global\n')
  const past = new Date(Date.now() - 86400000)
  fs.utimesSync(path.join(gloMem, 'note-a.md'), past, past)
  const { out } = run(tgt, src, glo)
  assert('레포(최신) 내용으로 갱신', fs.readFileSync(path.join(gloMem, 'note-a.md'), 'utf8'), 'repo note a\n')
  assert('밀려난 전역본 .conflict 보존 (데이터 손실 금지)', fs.readFileSync(path.join(gloMem, 'note-a.md.conflict'), 'utf8'), 'old global\n')
  assert('충돌 경고 출력', /conflict|충돌/.test(out), true)
}

console.log('\n[경계] 내용 충돌 + 전역 쪽이 최신 → 전역 유지하되 레포본은 .conflict로 보존 (mtime만 믿고 폐기 금지)')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const glo = tmp('glo')
  const gloMem = path.join(glo, encoded(tgt), 'memory')
  fs.mkdirSync(gloMem, { recursive: true })
  const past = new Date(Date.now() - 86400000)
  fs.utimesSync(path.join(tgt, 'memory/note-a.md'), past, past)
  fs.writeFileSync(path.join(gloMem, 'note-a.md'), 'newer global\n')
  run(tgt, src, glo)
  assert('전역(최신) 내용 유지', fs.readFileSync(path.join(gloMem, 'note-a.md'), 'utf8'), 'newer global\n')
  assert('레포본 .conflict 보존 (클럭 스큐·백업 복원 대비)', fs.readFileSync(path.join(gloMem, 'note-a.md.conflict'), 'utf8'), 'repo note a\n')
}

console.log('\n[경계] .conflict 파일명 충돌 → 숫자 suffix로 회피 (기존 conflict 덮어쓰기 금지)')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const glo = tmp('glo')
  const gloMem = path.join(glo, encoded(tgt), 'memory')
  fs.mkdirSync(gloMem, { recursive: true })
  fs.writeFileSync(path.join(gloMem, 'note-a.md'), 'newer global\n')
  fs.writeFileSync(path.join(gloMem, 'note-a.md.conflict'), 'previous conflict\n')
  const past = new Date(Date.now() - 86400000)
  fs.utimesSync(path.join(tgt, 'memory/note-a.md'), past, past)
  run(tgt, src, glo)
  assert('기존 .conflict 파일 보존', fs.readFileSync(path.join(gloMem, 'note-a.md.conflict'), 'utf8'), 'previous conflict\n')
  assert('새 충돌본은 .conflict1 로 저장', fs.readFileSync(path.join(gloMem, 'note-a.md.conflict1'), 'utf8'), 'repo note a\n')
}

console.log('\n[경계] hooks 키 없는 settings (플러그인만) → 구조 보존하며 플러그인만 제거')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), {
    settings: {
      defaultMode: 'acceptEdits',
      enabledPlugins: { 'codex@openai-codex': true },
      permissions: { allow: ['Read'] },
    },
  })
  const { code } = run(tgt, src, tmp('glo'))
  assert('exit 0', code, 0)
  const s = readSettings(tgt)
  assert('플러그인 제거', 'enabledPlugins' in s, false)
  assert('최상위 defaultMode → permissions.defaultMode 이관', s.permissions.defaultMode, 'acceptEdits')
  assert('최상위 defaultMode 제거', 'defaultMode' in s, false)
  assert('permissions 보존', JSON.stringify(s.permissions.allow), '["Read"]')
}

console.log('\n[경계] 공백 포함 경로에서도 정상 동작')
{
  const base = tmp('sp')
  const src = makeSource(path.join(base, 'src dir'))
  fs.mkdirSync(src, { recursive: true }) // makeSource가 이미 생성하지만 공백 경로 명시 확인
  const tgt = makeTarget((() => { const d = path.join(base, 'tgt dir'); fs.mkdirSync(d, { recursive: true }); return d })())
  const { code } = run(tgt, src, tmp('glo'))
  assert('exit 0', code, 0)
  assert('훅 정리 수행', fs.existsSync(path.join(tgt, '.claude/hooks/memory-sync.js')), false)
}

console.log('\n[경계] 변경 사항이 없으면 settings.json을 다시 쓰지 않음 (mtime 보존)')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), {
    hookFiles: ['bash-guard.js'],
    ruleFiles: ['git.md'],
    settings: { permissions: { defaultMode: 'acceptEdits' }, hooks: { PostToolUse: [{ matcher: 'Bash', hooks: [H('bash-guard.js')] }] } },
    marker: false,
    repoMemory: false,
  })
  const file = path.join(tgt, '.claude/settings.json')
  const past = new Date(Date.now() - 86400000)
  fs.utimesSync(file, past, past)
  const before = fs.statSync(file).mtimeMs
  run(tgt, src, tmp('glo'))
  assert('mtime 변화 없음', fs.statSync(file).mtimeMs, before)
}

console.log('\n[정상] 템플릿 다운그레이드 — dev·TS 훅도 keep 없으면 정리, keep 있으면 보존')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), {
    hookFiles: ['bash-guard.js', 'tdd-guard.js', 'test-fake-guard.js', 'adversarial-test-guard.js', 'fake-impl-guard.js', 'typescript-quality.js', 'memory-pull.js'],
    settings: {
      defaultMode: 'acceptEdits',
      hooks: {
        PreToolUse: [{ matcher: 'Bash', hooks: [H('test-fake-guard.js')] }],
        PostToolUse: [{ matcher: 'Write', hooks: [H('tdd-guard.js'), H('adversarial-test-guard.js'), H('fake-impl-guard.js'), H('typescript-quality.js')] }],
      },
    },
  })
  run(tgt, src, tmp('glo'))
  const s = readSettings(tgt)
  assert('tdd-guard.js 삭제', fs.existsSync(path.join(tgt, '.claude/hooks/tdd-guard.js')), false)
  assert('test-fake-guard.js 삭제', fs.existsSync(path.join(tgt, '.claude/hooks/test-fake-guard.js')), false)
  assert('adversarial-test-guard.js 삭제', fs.existsSync(path.join(tgt, '.claude/hooks/adversarial-test-guard.js')), false)
  assert('fake-impl-guard.js 삭제', fs.existsSync(path.join(tgt, '.claude/hooks/fake-impl-guard.js')), false)
  assert('typescript-quality.js 삭제', fs.existsSync(path.join(tgt, '.claude/hooks/typescript-quality.js')), false)
  assert('dev·TS 배선 전부 제거', /tdd-guard|test-fake-guard|adversarial-test-guard|fake-impl-guard|typescript-quality/.test(flatHooks(s)), false)
}
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), {
    hookFiles: ['tdd-guard.js', 'typescript-quality.js'],
    settings: {
      defaultMode: 'acceptEdits',
      hooks: { PostToolUse: [{ matcher: 'Write', hooks: [H('tdd-guard.js'), H('typescript-quality.js')] }] },
    },
  })
  run(tgt, src, tmp('glo'), ['--keep-dev', '--keep-typescript'])
  const s = readSettings(tgt)
  assert('--keep-dev → tdd-guard 보존', fs.existsSync(path.join(tgt, '.claude/hooks/tdd-guard.js')), true)
  assert('--keep-typescript → typescript-quality 보존', fs.existsSync(path.join(tgt, '.claude/hooks/typescript-quality.js')), true)
  assert('배선 보존', /tdd-guard\.js.*typescript-quality\.js/.test(flatHooks(s)), true)
}

console.log('\n[정상] 레거시 프로파일 재설치(--keep-dev --legacy) — 이전 일반 dev 설치의 tdd-guard만 정리, 나머지 dev 훅은 보존')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), {
    hookFiles: ['tdd-guard.js', 'test-fake-guard.js', 'adversarial-test-guard.js', 'fake-impl-guard.js', 'typescript-quality.js'],
    settings: {
      defaultMode: 'acceptEdits',
      hooks: {
        PreToolUse: [{ matcher: 'Bash', hooks: [H('test-fake-guard.js')] }],
        PostToolUse: [{ matcher: 'Write', hooks: [H('tdd-guard.js'), H('adversarial-test-guard.js'), H('fake-impl-guard.js'), H('typescript-quality.js')] }],
      },
    },
  })
  run(tgt, src, tmp('glo'), ['--keep-dev', '--keep-typescript', '--legacy'])
  const s = readSettings(tgt)
  assert('--legacy → tdd-guard.js 삭제', fs.existsSync(path.join(tgt, '.claude/hooks/tdd-guard.js')), false)
  assert('--legacy → tdd-guard 배선 제거', /tdd-guard/.test(flatHooks(s)), false)
  assert('--legacy → adversarial-test-guard 보존', fs.existsSync(path.join(tgt, '.claude/hooks/adversarial-test-guard.js')), true)
  assert('--legacy → fake-impl-guard 보존', fs.existsSync(path.join(tgt, '.claude/hooks/fake-impl-guard.js')), true)
  assert('--legacy → test-fake-guard 보존', fs.existsSync(path.join(tgt, '.claude/hooks/test-fake-guard.js')), true)
  assert('--legacy → typescript-quality 보존', fs.existsSync(path.join(tgt, '.claude/hooks/typescript-quality.js')), true)
  assert('--legacy → 나머지 dev·TS 배선 보존', /adversarial-test-guard\.js.*fake-impl-guard\.js.*typescript-quality\.js/.test(flatHooks(s)), true)
}
console.log('\n[정상] settings.json 보존(덮어쓰기 skip) 경로에서 --legacy 가 typescript-quality 배선을 --changed-only 로 재작성 (Codex R1)')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), {
    hookFiles: ['typescript-quality.js', 'adversarial-test-guard.js'],
    settings: {
      defaultMode: 'acceptEdits',
      hooks: { PostToolUse: [
        { matcher: 'Write', hooks: [H('adversarial-test-guard.js'), H('typescript-quality.js')] },
        { matcher: 'Edit',  hooks: [H('typescript-quality.js')] },
      ] },
    },
  })
  run(tgt, src, tmp('glo'), ['--keep-dev', '--keep-typescript', '--legacy'])
  const s = readSettings(tgt)
  const cmds = s.hooks.PostToolUse.flatMap(g => g.hooks.map(h => h.command)).filter(c => c.includes('typescript-quality'))
  assert('typescript-quality 배선 2곳 모두 --changed-only 부착', cmds.length === 2 && cmds.every(c => c.endsWith('typescript-quality.js --changed-only')), true)
  // 멱등: 다시 실행해도 --changed-only 가 중복되지 않음
  run(tgt, src, tmp('glo'), ['--keep-dev', '--keep-typescript', '--legacy'])
  const s2 = readSettings(tgt)
  const cmds2 = s2.hooks.PostToolUse.flatMap(g => g.hooks.map(h => h.command)).filter(c => c.includes('typescript-quality'))
  assert('재실행 멱등 (--changed-only 중복 없음)', cmds2.every(c => (c.match(/--changed-only/g) || []).length === 1), true)
}
{
  // 반대 방향: 레거시 → 일반 dev 로 되돌리면 --changed-only 제거
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), {
    hookFiles: ['typescript-quality.js'],
    settings: { defaultMode: 'acceptEdits', hooks: { PostToolUse: [{ matcher: 'Write', hooks: [
      { type: 'command', command: 'node $CLAUDE_PROJECT_DIR/.claude/hooks/typescript-quality.js --changed-only' },
    ] }] } },
  })
  run(tgt, src, tmp('glo'), ['--keep-dev', '--keep-typescript'])
  const s = readSettings(tgt)
  const cmd = s.hooks.PostToolUse[0].hooks[0].command
  assert('legacy 해제 → --changed-only 제거', cmd.endsWith('typescript-quality.js'), true)
}
{
  // 악성·오남용: --legacy 만 있고 --keep-typescript 없으면 typescript-quality 는 삭제 대상 — 재작성이 아니라 제거돼야 함
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), {
    hookFiles: ['typescript-quality.js'],
    settings: { defaultMode: 'acceptEdits', hooks: { PostToolUse: [{ matcher: 'Write', hooks: [H('typescript-quality.js')] }] } },
  })
  run(tgt, src, tmp('glo'), ['--legacy'])
  const s = readSettings(tgt)
  assert('--legacy 단독(TS 미유지) → typescript-quality 배선 제거', /typescript-quality/.test(flatHooks(s)), false)
}
{
  // 악성·오남용: --legacy 만 주고 --keep-dev 가 없으면 legacy 가 dev 훅을 "살리는" 쪽으로 작동해선 안 됨
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), {
    hookFiles: ['tdd-guard.js', 'adversarial-test-guard.js'],
    settings: { defaultMode: 'acceptEdits', hooks: { PostToolUse: [{ matcher: 'Write', hooks: [H('tdd-guard.js'), H('adversarial-test-guard.js')] }] } },
  })
  run(tgt, src, tmp('glo'), ['--legacy'])
  assert('--legacy 단독 → tdd-guard 삭제 (dev 미유지)', fs.existsSync(path.join(tgt, '.claude/hooks/tdd-guard.js')), false)
  assert('--legacy 단독 → adversarial-test-guard 도 삭제 (dev 미유지)', fs.existsSync(path.join(tgt, '.claude/hooks/adversarial-test-guard.js')), false)
}

console.log('\n[악성 방어] 관리 흔적 없는 memory/ 폴더 → 절대 이전·삭제하지 않음 (무관한 프로젝트 데이터 보호)')
{
  const src = makeSource(tmp('src'))
  // memory 훅 파일도, 배선도, symlink도, 매니페스트도 없는 레거시 프로젝트 —
  // memory/는 프로젝트 고유 데이터일 수 있음 (흔적 휴리스틱 경로 검증)
  const tgt = makeTarget(tmp('tgt'), {
    manifest: false,
    hookFiles: ['bash-guard.js'],
    settings: { defaultMode: 'acceptEdits', hooks: { PostToolUse: [{ matcher: 'Bash', hooks: [H('bash-guard.js')] }] } },
  })
  const glo = tmp('glo')
  const { out } = run(tgt, src, glo)
  assert('레포 memory/ 그대로 보존', fs.existsSync(path.join(tgt, 'memory/note-a.md')), true)
  assert('전역으로 이전하지 않음', fs.existsSync(path.join(glo, encoded(tgt), 'memory/note-a.md')), false)
  assert('보존 사유 경고 출력', /관리.*흔적|managed|건드리지/.test(out), true)
}

console.log('\n[악성 방어] 전역 symlink가 레포 밖을 가리킴 → 사용자 커스텀 링크로 간주, 건드리지 않음')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), {
    manifest: false, // 레거시 경로 — symlink 안전 검사가 실제로 실행되게 한다
    hookFiles: ['bash-guard.js'],
    settings: { defaultMode: 'acceptEdits' },
    repoMemory: false,
  })
  const glo = tmp('glo')
  const elsewhere = tmp('elsewhere')
  fs.writeFileSync(path.join(elsewhere, 'custom.md'), 'custom\n')
  const gloProj = path.join(glo, encoded(tgt))
  fs.mkdirSync(gloProj, { recursive: true })
  fs.symlinkSync(elsewhere, path.join(gloProj, 'memory'))
  const { code, out } = run(tgt, src, glo)
  assert('exit 0', code, 0)
  assert('레포 밖 symlink 보존', fs.lstatSync(path.join(gloProj, 'memory')).isSymbolicLink(), true)
  assert('경고 출력', /symlink|링크/.test(out), true)
}

console.log('\n[악성 방어] 깨진 settings.json + memory OFF → memory 마이그레이션도 스킵 (파괴적 이동 전면 게이트)')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), { settings: '{ BROKEN JSON' })
  const glo = tmp('glo')
  const { code } = run(tgt, src, glo)
  assert('exit 0', code, 0)
  assert('레포 memory/ 보존', fs.existsSync(path.join(tgt, 'memory/note-a.md')), true)
  assert('전역 이전 없음', fs.existsSync(path.join(glo, encoded(tgt), 'memory/note-a.md')), false)
}

console.log('\n[경계] memory 마이그레이션 실패 → 잔재 보존으로 재시도 가능 (split-brain 방지)')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const glo = tmp('glo')
  // 전역 memory 경로를 "파일"로 막아 마이그레이션 강제 실패 유도
  const gloProj = path.join(glo, encoded(tgt))
  fs.mkdirSync(gloProj, { recursive: true })
  fs.writeFileSync(path.join(gloProj, 'memory'), 'obstacle — not a directory\n')
  const { code, out } = run(tgt, src, glo)
  assert('exit 0 (설치 흐름 비차단)', code, 0)
  assert('실패 경고 출력', /실패|오류/.test(out), true)
  assert('레포 memory/ 보존', fs.existsSync(path.join(tgt, 'memory/note-a.md')), true)
  // 관리 증거(훅·rule·배선)를 보존해야 다음 재설치에서 마이그레이션을 재시도할 수 있다
  assert('memory 훅 파일 보존 (재시도 증거)', fs.existsSync(path.join(tgt, '.claude/hooks/memory-sync.js')), true)
  assert('memory-sync.md rule 보존', fs.existsSync(path.join(tgt, '.claude/rules/memory-sync.md')), true)
  assert('memory 배선 보존', flatHooks(readSettings(tgt)).includes('memory-sync.js'), true)
  assert('memory 외 정리(codex 등)는 정상 수행', fs.existsSync(path.join(tgt, '.claude/hooks/codex-review-guard.js')), false)

  // ── 2차 재실행: 장애물 제거 후 → 보존된 증거 덕에 마이그레이션 완료 ──
  fs.unlinkSync(path.join(gloProj, 'memory'))
  const second = run(tgt, src, glo)
  assert('재실행 exit 0', second.code, 0)
  assert('재실행에서 전역 이전 완료', fs.existsSync(path.join(gloProj, 'memory/note-a.md')), true)
  assert('재실행에서 레포 memory/ 삭제', fs.existsSync(path.join(tgt, 'memory')), false)
  assert('재실행에서 memory 훅 정리 완료', fs.existsSync(path.join(tgt, '.claude/hooks/memory-sync.js')), false)
}

console.log('\n[경계] 소스에 없는 스킬·에이전트 → 삭제하지 않고 경고만 (템플릿 축소 잔재 감지)')
{
  const src = makeSource(tmp('src'))
  fs.mkdirSync(path.join(src, '.claude/skills/frontend/kept-skill'), { recursive: true })
  fs.writeFileSync(path.join(src, '.claude/skills/frontend/kept-skill/SKILL.md'), '# kept\n')
  fs.mkdirSync(path.join(src, '.claude/agents/meta'), { recursive: true })
  fs.writeFileSync(path.join(src, '.claude/agents/meta/kept-agent.md'), '# kept\n')

  const tgt = makeTarget(tmp('tgt'))
  fs.mkdirSync(path.join(tgt, '.claude/skills/frontend/kept-skill'), { recursive: true })
  fs.writeFileSync(path.join(tgt, '.claude/skills/frontend/kept-skill/SKILL.md'), '# kept\n')
  fs.mkdirSync(path.join(tgt, '.claude/skills/backend/orphan-skill'), { recursive: true })
  fs.writeFileSync(path.join(tgt, '.claude/skills/backend/orphan-skill/SKILL.md'), '# orphan\n')
  fs.mkdirSync(path.join(tgt, '.claude/agents/meta'), { recursive: true })
  fs.writeFileSync(path.join(tgt, '.claude/agents/meta/kept-agent.md'), '# kept\n')
  fs.writeFileSync(path.join(tgt, '.claude/agents/meta/orphan-agent.md'), '# orphan\n')

  const { out } = run(tgt, src, tmp('glo'))
  assert('고아 스킬 파일 보존 (삭제 금지)', fs.existsSync(path.join(tgt, '.claude/skills/backend/orphan-skill/SKILL.md')), true)
  assert('고아 에이전트 파일 보존 (삭제 금지)', fs.existsSync(path.join(tgt, '.claude/agents/meta/orphan-agent.md')), true)
  assert('고아 스킬 경고 출력', out.includes('backend/orphan-skill'), true)
  assert('고아 에이전트 경고 출력', out.includes('meta/orphan-agent.md'), true)
  assert('소스에 있는 스킬은 경고 없음', out.includes('kept-skill'), false)
  assert('소스에 있는 에이전트는 경고 없음', out.includes('kept-agent'), false)
}

console.log('\n[악성 방어] 옵션 OFF 훅 이름과 겹치는 커스텀 파일 — 소유 증명 없으면 보존')
{
  // "옵션을 끔"은 통합 제거 의사지, 동명의 프로젝트 자체 훅을 지워도 된다는 동의가 아니다.
  // 레거시(매니페스트 없음)에서 codex OFF여도 codex-review-guard.js 파일·배선을 보존한다.
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'), { manifest: false })
  const { out } = run(tgt, src, tmp('glo'), ['--keep-memory', '--keep-branch-protection'])
  assert('codex-review-guard.js 보존', fs.existsSync(path.join(tgt, '.claude/hooks/codex-review-guard.js')), true)
  assert('배선도 보존 (파일과 일관)', flatHooks(readSettings(tgt)).includes('codex-review-guard'), true)
  assert('보존 경고 출력', out.includes('codex-review-guard'), true)
}

console.log('\n[정상] 매니페스트가 hooks 소유를 증명(기록+해시 일치) → 폐지 훅 파일·배선 정리')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const hookPath = path.join(tgt, '.claude/hooks/memory-stop-guard.js')
  const h = sha256(fs.readFileSync(hookPath))
  fs.writeFileSync(path.join(tgt, '.claude', '.install-manifest.json'), JSON.stringify({
    version: 1, agents: [], skills: [], hooks: ['memory-stop-guard.js'], memoryManaged: false,
    hashes: { agents: {}, skills: {}, hooks: { 'memory-stop-guard.js': h } },
  }))
  run(tgt, src, tmp('glo'), ['--keep-memory', '--keep-codex', '--keep-branch-protection'])
  assert('소유 증명된 폐지 훅 파일 삭제', fs.existsSync(hookPath), false)
  assert('배선 제거', flatHooks(readSettings(tgt)).includes('memory-stop-guard'), false)
}

console.log('\n[악성 방어] 매니페스트에 기록됐어도 로컬 수정(해시 불일치)된 폐지 훅은 보존')
{
  const src = makeSource(tmp('src'))
  const tgt = makeTarget(tmp('tgt'))
  const hookPath = path.join(tgt, '.claude/hooks/memory-stop-guard.js')
  fs.writeFileSync(path.join(tgt, '.claude', '.install-manifest.json'), JSON.stringify({
    version: 1, agents: [], skills: [], hooks: ['memory-stop-guard.js'], memoryManaged: false,
    hashes: { agents: {}, skills: {}, hooks: { 'memory-stop-guard.js': sha256('# original hook content\n') } },
  }))
  const { out } = run(tgt, src, tmp('glo'), ['--keep-memory', '--keep-codex', '--keep-branch-protection'])
  assert('로컬 수정된 폐지 훅 보존', fs.existsSync(hookPath), true)
  assert('배선도 보존 (파일과 일관)', flatHooks(readSettings(tgt)).includes('memory-stop-guard'), true)
  assert('보존 경고 출력', out.includes('memory-stop-guard'), true)
}

// ── 결과 ────────────────────────────────────────────────────────────────
console.log(`\n═══ 결과: ${passed} PASS / ${failed} FAIL ═══`)
process.exit(failed > 0 ? 1 : 0)
