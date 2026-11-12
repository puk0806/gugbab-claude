#!/usr/bin/env node
/**
 * relations-check.test.js — relations.json 검사 로직 시험 (node scripts/relations-check.test.js)
 * 2026-11-11 relation-guard 훅을 걷어내며 그 훅 시험 중 검사 로직(check) 부분을 옮겼다. 훅 입출력(저장 알림·커밋 차단) 시험은 훅과 함께 뺐다.
 *
 * 3계층: 정상(분류된 관계 통과·새 언급/새 항목 검출·분류 후 통과·requires·같은 묶음)
 *        / 악성·우회(깨진·오염된 relations.json·없는 항목 참조·초대용량 파일)
 *        / 이상·경계(relations.json 없음·빈 파일·이름 일부 일치·중복 소속·잘못된 분류값)
 */
'use strict'
const fs = require('fs')
const os = require('os')
const path = require('path')
const { check } = require('./relations-check.js')

let passed = 0, failed = 0
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'relc-'))

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
  '.claude/skills/sk-one/SKILL.md': '---\nname: sk-one\n---\nalpha 가 쓴다\n',
  '.claude/commands/do-it.md': '`.claude/rules/x.md` 를 따른다\n',
}

function repo(name, { files = {}, relations = RELATIONS } = {}) {
  const dir = path.join(base, name)
  fs.mkdirSync(dir, { recursive: true })
  for (const [f, c] of Object.entries({ ...FILES, ...files })) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true })
    fs.writeFileSync(path.join(dir, f), c)
  }
  if (relations !== null) fs.writeFileSync(path.join(dir, 'relations.json'), typeof relations === 'string' ? relations : JSON.stringify(relations, null, 2))
  return dir
}
const probs = (d) => { const r = check(d, null); return r.skip ? null : r.problems.join('\n') }
const clone = () => JSON.parse(JSON.stringify(RELATIONS))
function t(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`) } catch (e) { failed++; console.log(`  ✗ ${name}\n      ${e.message}`) }
}
function ok(cond, msg) { if (!cond) throw new Error(msg) }

console.log('정상')
t('분류가 다 된 레포는 문제 0건', () => {
  const p = probs(repo('clean'))
  ok(p === '', '문제 없어야 함: ' + p)
})
t('새 에이전트가 다른 항목을 언급하고 블록이 없으면 둘 다 잡는다', () => {
  const p = probs(repo('new-agent', { files: { '.claude/agents/cat/gamma.md': '---\nname: gamma\n---\nalpha 를 부른다\n' } }))
  ok(p.includes('agent:gamma>agent:alpha'), '분류 안 된 관계: ' + p)
  ok(p.includes('agent:gamma') && /블록/.test(p), '블록 소속 없음: ' + p)
})
t('한 항목만 검사하면 그 항목 문제만 본다', () => {
  const d = repo('only', { files: { '.claude/agents/cat/gamma.md': 'alpha 를 부른다\n' } })
  const r = check(d, 'agent:beta')
  ok(!r.skip && r.problems.every(x => !x.includes('agent:gamma>')), 'beta 만 봐야 함: ' + r.problems.join('\n'))
})
t('관계를 분류하고 블록에 넣으면 통과한다', () => {
  const rel = clone(); rel.blocks.blk.items.push('agent:gamma'); rel.edges['agent:gamma>agent:alpha'] = 'requires'
  const p = probs(repo('fixed', { files: { '.claude/agents/cat/gamma.md': 'alpha 를 부른다\n' }, relations: rel }))
  ok(p === '', '통과해야 함: ' + p)
})
t('requires 에 적힌 관계와 같은 묶음 안의 언급은 따로 분류하지 않아도 된다', () => {
  const rel = clone(); delete rel.edges['agent:alpha>agent:beta']; rel.requires = { 'agent:alpha': ['agent:beta'] }
  const p = probs(repo('req-bundle', { relations: rel }))
  ok(p === '', 'requires·같은 묶음은 분류된 것: ' + p)
})
t('새 훅이 묶음·단독 어디에도 없으면 잡는다', () => {
  const p = probs(repo('new-hook', { files: { '.claude/hooks/c-guard.js': 'module.exports = {}\n' } }))
  ok(p.includes('hook:c-guard'), '새 훅 소속 없음: ' + p)
})
t('체크리스트 원본이 있으면 훅·룰·커맨드 항목 줄이 있어야 한다', () => {
  const head = 'docs/plans/page/checklist-head.md'
  const p = probs(repo('cl-missing', { files: { [head]: '- [x] **a-guard** — a\n- [ ] **b-guard** (기본 켬) — b\n- [x] **x.md** — x\n' } }))
  ok(p.includes('command:do-it') && p.includes('체크리스트'), '커맨드 줄 없음: ' + p)
  const q = probs(repo('cl-ok', { files: { [head]: '- [x] **a-guard** — a\n- [ ] **b-guard** (기본 켬) — b\n- [x] **x.md** — x\n- [ ] **/do-it** (기본 켬) — d\n' } }))
  ok(q === '', '모두 있으면 통과: ' + q)
})

console.log('악성·우회')
t('relations.json 이 깨진 JSON 이면 문제로 잡는다 (조용히 통과시키지 않음)', () => {
  const p = probs(repo('broken', { relations: '{깨진' }))
  ok(p && p.includes('relations.json'), '깨진 원본: ' + p)
})
t('형식이 틀리거나 __proto__ 키가 있어도 죽지 않고 오염되지 않는다', () => {
  const evil = '{"__proto__":{"polluted":1},"bundles":[],"blocks":{"__proto__":{"items":["agent:alpha"]}},"standalone":"x","edges":{"constructor>prototype":"uses"},"requires":{"hook:a-guard":"hook:b-guard"}}'
  const p = probs(repo('evil', { relations: evil }))
  ok(p && p.length > 0, '형식 오류·소속 없음을 잡아야 함')
  ok({}.polluted === undefined, '프로토타입 오염 없음')
})
t('relations.json 이 없는 항목을 가리키면 잡는다', () => {
  const rel = clone(); rel.requires = { 'agent:alpha': ['agent:없는-에이전트'] }; rel.edges['agent:ghost>agent:alpha'] = 'uses'
  const p = probs(repo('unknown', { relations: rel }))
  ok(p.includes('agent:없는-에이전트') && p.includes('agent:ghost'), '없는 항목: ' + p)
})
t('초대용량 파일도 죽지 않고 처리한다 (앞부분만 읽음)', () => {
  const p = probs(repo('big', { files: { '.claude/agents/cat/huge.md': 'x '.repeat(1500000) + '\nalpha\n' } }))
  ok(p.includes('agent:huge'), '새 항목 소속 없음은 잡아야 함: ' + p.slice(0, 300))
})

console.log('이상·경계')
t('relations.json 이 없는 레포는 검사하지 않는다(skip)', () => {
  ok(check(repo('no-rel', { relations: null }), null).skip, 'skip 이어야 함')
})
t('빈 에이전트 파일도 깨지지 않는다', () => {
  const rel = clone(); rel.blocks.blk.items.push('agent:empty')
  const p = probs(repo('empty', { files: { '.claude/agents/cat/empty.md': '' }, relations: rel }))
  ok(p === '', '빈 파일 통과: ' + p)
})
t('다른 이름의 일부(sqlx 안의 sql)는 언급으로 치지 않는다', () => {
  const rel = clone(); rel.blocks.blk.items.push('skill:sql'); rel.standalone.push('rule:y.md')
  const p = probs(repo('substr', { files: { '.claude/skills/sql/SKILL.md': 'sql\n', '.claude/rules/y.md': 'sqlx 와 my-sql-tool 을 쓴다\n' }, relations: rel }))
  ok(p === '', '부분 일치는 무시: ' + p)
})
t('한 항목이 블록 두 곳·묶음 두 곳에 있으면 잡는다', () => {
  const rel = clone(); rel.blocks.blk2 = { title: '둘째', items: ['agent:alpha'] }; rel.bundles.g2 = { title: '둘째', items: ['hook:a-guard'] }
  const p = probs(repo('dup', { relations: rel }))
  ok(p.includes('agent:alpha') && p.includes('hook:a-guard'), '중복 소속: ' + p)
})
t('정해진 분류값이 아니면 분류되지 않은 것으로 본다', () => {
  const rel = clone(); rel.edges['agent:alpha>agent:beta'] = 'maybe'
  const p = probs(repo('badkind', { relations: rel }))
  ok(p.includes('agent:alpha>agent:beta'), '잘못된 분류값: ' + p)
})

fs.rmSync(base, { recursive: true, force: true })
console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
