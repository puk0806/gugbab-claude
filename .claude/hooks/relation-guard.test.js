#!/usr/bin/env node
/**
 * relation-guard.test.js
 * 실행: node .claude/hooks/relation-guard.test.js
 *
 * 3계층: 정상(분류된 관계 통과·새 언급/새 항목 안내·커밋 차단·분류 후 통과)
 *        / 악성·우회(경로 탈출·깨진·오염된 relations.json·없는 항목 참조·체인 속 git commit·초대용량 파일)
 *        / 이상·경계(relations.json 없음·빈 파일·이름 일부 일치·대상 아닌 도구·깨진 입력·중복 소속·잘못된 분류값)
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'relation-guard.js')

let passed = 0, failed = 0
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'relg-'))

const RELATIONS = {
  version: 1,
  bundles: { g: { title: '묶음', items: ['hook:a-guard', 'rule:x.md'] } },
  standalone: ['hook:b-guard', 'command:do-it'],
  blocks: { blk: { title: '블록', items: ['agent:alpha', 'agent:beta', 'skill:sk-one'] } },
  requires: {},
  conflicts: [],
  edges: { 'hook:a-guard>hook:b-guard': 'code', 'agent:alpha>agent:beta': 'uses', 'command:do-it>rule:x.md': 'uses' },
}
const FILES = {
  '.claude/hooks/a-guard.js': "// b-guard 의 함수를 쓴다\nmodule.exports = {}\n",
  '.claude/hooks/a-guard.test.js': '// 테스트 파일은 항목이 아니다 — z-unknown-guard\n',
  '.claude/hooks/b-guard.js': 'module.exports = {}\n',
  '.claude/rules/x.md': '# x\n`a-guard` 훅이 막는다\n',
  '.claude/agents/cat/alpha.md': '---\nname: alpha\n---\n`sk-one` 스킬과 beta 에이전트를 쓴다\n',
  '.claude/agents/cat/beta.md': '---\nname: beta\n---\n본문\n',
  '.claude/agents/CLAUDE.md': '# 에이전트 안내 — alpha\n',
  '.claude/skills/sk-one/SKILL.md': '---\nname: sk-one\n---\nalpha 가 쓴다\n',
  '.claude/commands/do-it.md': '`.claude/rules/x.md` 를 따른다\n',
}

function repo(name, { files = {}, relations = RELATIONS, omit = [] } = {}) {
  const dir = path.join(base, name)
  fs.mkdirSync(path.join(dir, '.git'), { recursive: true })
  const all = { ...FILES, ...files }
  for (const [f, c] of Object.entries(all)) {
    if (omit.includes(f)) continue
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true })
    fs.writeFileSync(path.join(dir, f), c)
  }
  if (relations !== null) fs.writeFileSync(path.join(dir, 'relations.json'), typeof relations === 'string' ? relations : JSON.stringify(relations, null, 2))
  return dir
}

function run(input, cwd) {
  const raw = typeof input === 'string' ? input : JSON.stringify(input)
  const r = spawnSync(process.execPath, [HOOK], { input: raw, encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: cwd || '' }, timeout: 60000 })
  let out = null
  try { out = r.stdout.trim() ? JSON.parse(r.stdout) : null } catch { out = { parseError: r.stdout } }
  return { status: r.status, out, stderr: r.stderr }
}
const commit = (dir, cmd = 'git commit -m x') => run({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: cmd }, cwd: dir }, dir)
const saved = (dir, rel, tool = 'Write') => run({ hook_event_name: 'PostToolUse', tool_name: tool, tool_input: { file_path: path.join(dir, rel) }, cwd: dir }, dir)
const denied = (r) => !!(r.out && r.out.hookSpecificOutput && r.out.hookSpecificOutput.permissionDecision === 'deny')
const reason = (r) => (r.out && r.out.hookSpecificOutput && (r.out.hookSpecificOutput.permissionDecisionReason || r.out.hookSpecificOutput.additionalContext)) || ''

function t(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { failed++; console.log(`  ✗ ${name}\n      ${e.message}`) }
}
function ok(cond, msg) { if (!cond) throw new Error(msg) }

console.log('정상')
t('분류가 다 된 레포는 커밋을 막지 않는다', () => {
  const d = repo('clean')
  const r = commit(d)
  ok(r.status === 0 && !denied(r), '차단되면 안 됨: ' + reason(r))
})
t('분류된 파일을 저장하면 아무 안내도 하지 않는다', () => {
  const d = repo('clean-save')
  const r = saved(d, '.claude/agents/cat/beta.md', 'Edit')
  ok(r.status === 0 && r.out === null, '출력이 없어야 함: ' + JSON.stringify(r.out))
})
t('새 에이전트가 다른 항목을 언급하고 블록이 없으면 저장할 때 둘 다 알린다', () => {
  const d = repo('new-agent', { files: { '.claude/agents/cat/gamma.md': '---\nname: gamma\n---\nalpha 를 부른다\n' } })
  const r = saved(d, '.claude/agents/cat/gamma.md')
  const txt = reason(r)
  ok(r.status === 0, 'PostToolUse 는 막지 않는다')
  ok(r.out && r.out.hookSpecificOutput.hookEventName === 'PostToolUse', 'PostToolUse 안내여야 함')
  ok(txt.includes('agent:gamma>agent:alpha'), '분류 안 된 관계 안내: ' + txt)
  ok(txt.includes('agent:gamma') && /블록/.test(txt), '블록 소속 없음 안내: ' + txt)
})
t('같은 상태로 커밋하면 차단하고 고칠 곳을 알려준다', () => {
  const d = repo('new-agent-commit', { files: { '.claude/agents/cat/gamma.md': 'alpha 를 부른다\n' } })
  const r = commit(d)
  ok(denied(r), '차단되어야 함')
  ok(reason(r).includes('agent:gamma>agent:alpha') && reason(r).includes('relations.json'), '고칠 곳 안내: ' + reason(r))
})
t('관계를 분류하고 블록에 넣으면 커밋이 통과한다', () => {
  const rel = JSON.parse(JSON.stringify(RELATIONS))
  rel.blocks.blk.items.push('agent:gamma')
  rel.edges['agent:gamma>agent:alpha'] = 'requires'
  const d = repo('new-agent-fixed', { files: { '.claude/agents/cat/gamma.md': 'alpha 를 부른다\n' }, relations: rel })
  const r = commit(d)
  ok(!denied(r), '통과해야 함: ' + reason(r))
})
t('requires 에 적힌 관계와 같은 묶음 안의 언급은 따로 분류하지 않아도 된다', () => {
  const rel = JSON.parse(JSON.stringify(RELATIONS))
  delete rel.edges['agent:alpha>agent:beta']
  rel.requires = { 'agent:alpha': ['agent:beta'] }
  const d = repo('req-bundle', { relations: rel })
  ok(!denied(commit(d)), 'requires 로 분류된 것으로 봐야 함 (x.md→a-guard 는 같은 묶음)')
})
t('새 훅이 묶음·단독 어디에도 없으면 차단한다', () => {
  const d = repo('new-hook', { files: { '.claude/hooks/c-guard.js': 'module.exports = {}\n' } })
  const r = commit(d)
  ok(denied(r) && reason(r).includes('hook:c-guard'), '새 훅 소속 없음: ' + reason(r))
})
t('체크리스트 원본이 있으면 훅·룰·커맨드 항목 줄이 있어야 한다', () => {
  const head = 'docs/plans/page/checklist-head.md'
  const without = repo('cl-missing', { files: { [head]: '- [x] **a-guard** — a\n- [ ] **b-guard** (기본 켬) — b\n- [x] **x.md** — x\n' } })
  const r = commit(without)
  ok(denied(r) && reason(r).includes('command:do-it') && reason(r).includes('체크리스트'), '커맨드 줄 없음: ' + reason(r))
  const withAll = repo('cl-ok', { files: { [head]: '- [x] **a-guard** — a\n- [ ] **b-guard** (기본 켬) — b\n- [x] **x.md** — x\n- [ ] **/do-it** (기본 켬) — d\n' } })
  ok(!denied(commit(withAll)), '모두 있으면 통과')
})

console.log('악성·우회')
t('file_path 가 ../ 로 레포 밖을 가리키면 무시한다', () => {
  const d = repo('escape')
  const outside = path.join(base, 'outside-agent.md')
  fs.writeFileSync(outside, 'alpha beta')
  const r = run({ hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: path.join(d, '.claude/agents/../../outside-agent.md') }, cwd: d }, d)
  ok(r.status === 0 && r.out === null, '레포 밖 파일은 대상이 아님: ' + JSON.stringify(r.out))
})
t('relations.json 이 깨진 JSON 이면 커밋을 막는다 (조용히 통과시키지 않음)', () => {
  const d = repo('broken', { relations: '{깨진' })
  const r = commit(d)
  ok(denied(r) && reason(r).includes('relations.json'), '깨진 원본 차단: ' + reason(r))
})
t('relations.json 형식이 틀리거나 __proto__ 키가 있어도 죽지 않고 오염되지 않는다', () => {
  const evil = '{"__proto__":{"polluted":1},"bundles":[],"blocks":{"__proto__":{"items":["agent:alpha"]}},"standalone":"x","edges":{"constructor>prototype":"uses"},"requires":{"hook:a-guard":"hook:b-guard"}}'
  const d = repo('evil', { relations: evil })
  const r = commit(d)
  ok(r.status === 0, '죽으면 안 됨: ' + r.stderr)
  ok(denied(r), '형식 오류·소속 없음으로 차단되어야 함')
  ok({}.polluted === undefined, '프로토타입 오염 없음')
})
t('relations.json 이 없는 항목을 가리키면 알린다', () => {
  const rel = JSON.parse(JSON.stringify(RELATIONS))
  rel.requires = { 'agent:alpha': ['agent:없는-에이전트'] }
  rel.edges['agent:ghost>agent:alpha'] = 'uses'
  const d = repo('unknown', { relations: rel })
  const r = commit(d)
  ok(denied(r) && reason(r).includes('agent:없는-에이전트') && reason(r).includes('agent:ghost'), '없는 항목: ' + reason(r))
})
t('체인·옵션 속 git commit 도 잡고, 문자열 속 글자나 다른 git 명령은 잡지 않는다', () => {
  const d = repo('chain', { files: { '.claude/hooks/c-guard.js': '' } })
  ok(denied(commit(d, 'echo hi && git commit -m x')), '체인 속 commit')
  ok(denied(commit(d, 'git -C . commit --amend')), '-C 옵션 뒤 commit')
  ok(!denied(commit(d, 'echo "git commit"')), '따옴표 속 글자는 명령이 아님')
  ok(!denied(commit(d, 'git log --grep commit')), 'git log 는 커밋이 아님')
})
t('초대용량 파일도 죽지 않고 처리한다 (앞부분만 읽음)', () => {
  const big = 'x '.repeat(1500000) + '\nalpha\n'
  const d = repo('big', { files: { '.claude/agents/cat/huge.md': big } })
  const r = commit(d)
  ok(r.status === 0, '죽으면 안 됨')
  ok(denied(r) && reason(r).includes('agent:huge'), '새 항목 소속 없음은 잡아야 함: ' + reason(r))
})

console.log('이상·경계')
t('relations.json 이 없는 레포(다른 프로젝트)는 아무것도 하지 않는다', () => {
  const d = repo('no-rel', { relations: null, files: { '.claude/hooks/c-guard.js': '' } })
  ok(!denied(commit(d)) && saved(d, '.claude/hooks/c-guard.js').out === null, '검사하지 않아야 함')
})
t('빈 에이전트 파일도 깨지지 않는다', () => {
  const rel = JSON.parse(JSON.stringify(RELATIONS)); rel.blocks.blk.items.push('agent:empty')
  const d = repo('empty', { files: { '.claude/agents/cat/empty.md': '' }, relations: rel })
  ok(!denied(commit(d)), '빈 파일 통과')
})
t('다른 이름의 일부(sqlx 안의 sql)는 언급으로 치지 않는다', () => {
  const rel = JSON.parse(JSON.stringify(RELATIONS)); rel.blocks.blk.items.push('skill:sql')
  const d = repo('substr', { files: { '.claude/skills/sql/SKILL.md': 'sql\n', '.claude/rules/y.md': 'sqlx 와 my-sql-tool 을 쓴다\n' }, relations: { ...rel, standalone: [...rel.standalone, 'rule:y.md'] } })
  ok(!denied(commit(d)), '부분 일치는 무시: ' + reason(commit(d)))
})
t('대상이 아닌 도구·이벤트·경로, 깨진 입력은 조용히 넘어간다', () => {
  const d = repo('noop')
  ok(run({ hook_event_name: 'PostToolUse', tool_name: 'Read', tool_input: { file_path: path.join(d, '.claude/agents/cat/alpha.md') }, cwd: d }, d).out === null, 'Read')
  ok(saved(d, 'README.md').out === null, '대상 아닌 경로')
  ok(run({ hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { command: 'git commit' }, cwd: d }, d).out === null, 'Bash 아닌 PreToolUse')
  const broken = run('{broken', d)
  ok(broken.status === 0 && broken.out === null, '깨진 JSON')
  ok(run({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 42 }, cwd: d }, d).out === null, 'command 비문자열')
})
t('한 항목이 블록 두 곳·묶음 두 곳에 있으면 알린다', () => {
  const rel = JSON.parse(JSON.stringify(RELATIONS))
  rel.blocks.blk2 = { title: '둘째', items: ['agent:alpha'] }
  rel.bundles.g2 = { title: '둘째', items: ['hook:a-guard'] }
  const d = repo('dup', { relations: rel })
  const r = commit(d)
  ok(denied(r) && reason(r).includes('agent:alpha') && reason(r).includes('hook:a-guard'), '중복 소속: ' + reason(r))
})
t('정해진 분류값(requires·uses·mention·code)이 아니면 분류되지 않은 것으로 본다', () => {
  const rel = JSON.parse(JSON.stringify(RELATIONS)); rel.edges['agent:alpha>agent:beta'] = 'maybe'
  const d = repo('badkind', { relations: rel })
  const r = commit(d)
  ok(denied(r) && reason(r).includes('agent:alpha>agent:beta'), '잘못된 분류값: ' + reason(r))
})
t('relations.json 자체를 저장해도 검사해서 문제를 알린다', () => {
  const rel = JSON.parse(JSON.stringify(RELATIONS)); rel.blocks.blk.items = ['agent:alpha']
  const d = repo('rel-save', { relations: rel })
  const r = saved(d, 'relations.json', 'Edit')
  ok(r.out && reason(r).includes('agent:beta'), 'relations.json 저장 시 전체 검사: ' + JSON.stringify(r.out))
})

fs.rmSync(base, { recursive: true, force: true })
console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
