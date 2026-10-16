#!/usr/bin/env node
/**
 * relation-guard.js — 훅·룰·커맨드·에이전트·스킬 관계가 분류 없이 늘어나지 않게 막는다 (2026-10-16)
 *
 * 관계 원본은 레포 최상위 relations.json (계획서 14장, 결정 13장 15·16번):
 *   bundles(같이 켜고 끄는 묶음) · standalone(묶음 없는 훅·룰·커맨드) · blocks(스킬·에이전트 스택 블록)
 *   requires(필수 의존) · conflicts · variants · edges("from>to": requires|uses|mention|code)
 *
 * 이벤트:
 *   PostToolUse Write|Edit|MultiEdit — .claude/{hooks,agents,skills,rules,commands} 파일이나 relations.json 을 저장하면
 *     그 항목의 분류 안 된 언급·소속 없음 등을 Claude 에게 알린다 (막지 않음)
 *   PreToolUse Bash — git commit 이면 레포 전체를 검사해 문제가 하나라도 있으면 차단
 *
 * 자동 분류: 스킬이 무엇이든 언급하는 것, 에이전트가 스킬을 언급하는 것은 uses.
 *           requires 에 적힌 관계, 같은 묶음 안의 언급은 따로 적지 않는다.
 * relations.json 이 없는 레포(다른 프로젝트)에서는 아무것도 하지 않는다.
 */
'use strict'

const fs = require('fs')
const path = require('path')

const KINDS = new Set(['requires', 'uses', 'mention', 'code'])
const MAX_READ = 2 * 1024 * 1024 // 파일당 읽는 최대 바이트 — 초대용량 파일로 훅을 멈추게 하지 못하게
const MAX_SKILL_FILES = 200
const MAX_LIST = 40
const AREAS = ['hooks', 'agents', 'skills', 'rules', 'commands']

let analyzer = null
try { analyzer = require('./bash-guard.js') } catch { analyzer = null }

const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k)
const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v)

function readHead(file) {
  let fd = null
  try {
    fd = fs.openSync(file, 'r')
    const buf = Buffer.alloc(MAX_READ)
    const n = fs.readSync(fd, buf, 0, MAX_READ, 0)
    return buf.toString('utf8', 0, n)
  } catch { return '' } finally { if (fd !== null) try { fs.closeSync(fd) } catch {} }
}

function listDir(dir) {
  try { return fs.readdirSync(dir, { withFileTypes: true }) } catch { return [] }
}

function walkMd(dir, out, limit) {
  for (const e of listDir(dir)) {
    if (out.length >= limit) return out
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walkMd(p, out, limit)
    else if (e.isFile() && e.name.endsWith('.md')) out.push(p)
  }
  return out
}

// 레포의 항목 목록: id → { type, name, files }
function scanItems(root) {
  const C = path.join(root, '.claude')
  const items = new Map()
  const add = (type, name, files) => items.set(type + ':' + name, { type, name, files })
  for (const e of listDir(path.join(C, 'hooks'))) {
    if (e.isFile() && e.name.endsWith('.js') && !e.name.endsWith('.test.js')) add('hook', e.name.slice(0, -3), [path.join(C, 'hooks', e.name)])
  }
  for (const e of listDir(path.join(C, 'rules'))) if (e.isFile() && e.name.endsWith('.md')) add('rule', e.name, [path.join(C, 'rules', e.name)])
  for (const e of listDir(path.join(C, 'commands'))) {
    if (e.isFile() && e.name.endsWith('.md') && e.name !== 'CLAUDE.md') add('command', e.name.slice(0, -3), [path.join(C, 'commands', e.name)])
  }
  for (const f of walkMd(path.join(C, 'agents'), [], 2000)) {
    if (path.basename(f) !== 'CLAUDE.md') add('agent', path.basename(f, '.md'), [f])
  }
  for (const e of listDir(path.join(C, 'skills'))) {
    const dir = path.join(C, 'skills', e.name)
    if (e.isDirectory() && fs.existsSync(path.join(dir, 'SKILL.md'))) add('skill', e.name, walkMd(dir, [], MAX_SKILL_FILES))
  }
  return items
}

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
function patternOf(it) {
  if (it.type === 'command') return new RegExp('(?<![A-Za-z0-9_./-])/' + esc(it.name) + '(?![A-Za-z0-9_-])')
  return new RegExp('(?<![A-Za-z0-9_-])' + esc(it.name) + '(?![A-Za-z0-9_-])')
}

// 한 항목의 파일들에서 다른 항목 이름이 나오는 곳 → 대상 id 목록
function mentionsOf(id, items, patterns) {
  const it = items.get(id)
  if (!it) return []
  const text = it.files.map(readHead).join('\n')
  if (!text) return []
  const out = []
  for (const [tid, re] of patterns) if (tid !== id && re.test(text)) out.push(tid)
  return out
}

// relations.json 읽기 + 형식 검사. 자기 키만 읽고 형식이 틀린 칸은 문제로 남긴다
function loadRelations(root) {
  const file = path.join(root, 'relations.json')
  if (!fs.existsSync(file)) return { missing: true }
  let raw
  try { raw = JSON.parse(readHead(file)) } catch (e) { return { broken: 'relations.json 을 JSON 으로 읽을 수 없습니다 (' + String(e.message).slice(0, 80) + ')' } }
  if (!isObj(raw)) return { broken: 'relations.json 최상위가 객체가 아닙니다' }
  const problems = []
  const groups = (key) => {
    const m = new Map()
    const v = own(raw, key) ? raw[key] : {}
    if (!isObj(v)) { problems.push(`${key} 는 { 이름: { items: [...] } } 형태여야 합니다`); return m }
    for (const k of Object.keys(v)) {
      const g = v[k]
      if (!isObj(g) || !Array.isArray(g.items) || g.items.some(x => typeof x !== 'string')) { problems.push(`${key}.${k}.items 는 문자열 배열이어야 합니다`); continue }
      m.set(k, g.items.slice())
    }
    return m
  }
  const bundles = groups('bundles')
  const blocks = groups('blocks')
  let standalone = own(raw, 'standalone') ? raw.standalone : []
  if (!Array.isArray(standalone) || standalone.some(x => typeof x !== 'string')) { problems.push('standalone 은 문자열 배열이어야 합니다'); standalone = [] }
  const requires = new Map()
  const rv = own(raw, 'requires') ? raw.requires : {}
  if (!isObj(rv)) problems.push('requires 는 { 항목: [필요한 항목...] } 형태여야 합니다')
  else for (const k of Object.keys(rv)) {
    if (!Array.isArray(rv[k]) || rv[k].some(x => typeof x !== 'string')) { problems.push(`requires.${k} 는 문자열 배열이어야 합니다`); continue }
    requires.set(k, rv[k].slice())
  }
  const edges = new Map()
  const ev = own(raw, 'edges') ? raw.edges : {}
  if (!isObj(ev)) problems.push('edges 는 { "from>to": 분류 } 형태여야 합니다')
  else for (const k of Object.keys(ev)) edges.set(k, ev[k])
  let conflicts = own(raw, 'conflicts') ? raw.conflicts : []
  if (!Array.isArray(conflicts) || conflicts.some(c => !Array.isArray(c) || c.some(x => typeof x !== 'string'))) { problems.push('conflicts 는 [[항목, 항목], ...] 형태여야 합니다'); conflicts = [] }
  return { bundles, blocks, standalone, requires, edges, conflicts, problems }
}

function autoUses(from, to) {
  const ft = from.split(':')[0], tt = to.split(':')[0]
  return ft === 'skill' || (ft === 'agent' && tt === 'skill')
}

/**
 * 검사. only 를 주면 그 항목에서 나가는 언급만 보고(저장 시), 구조 검사는 항상 전체.
 * 반환: { skip:true } (relations.json 없음) | { problems: [문장...] }
 */
function check(root, only) {
  const rel = loadRelations(root)
  if (rel.missing) return { skip: true }
  if (rel.broken) return { problems: [rel.broken] }
  const problems = rel.problems.slice()
  const items = scanItems(root)
  const exists = id => items.has(id)

  // 없는 항목 참조
  const referenced = new Set()
  const ref = (id, where) => { if (typeof id === 'string' && !exists(id)) referenced.add(`${id} (${where})`) }
  for (const [k, list] of rel.bundles) for (const id of list) ref(id, 'bundles.' + k)
  for (const [k, list] of rel.blocks) for (const id of list) ref(id, 'blocks.' + k)
  for (const id of rel.standalone) ref(id, 'standalone')
  for (const [k, list] of rel.requires) { ref(k, 'requires'); for (const id of list) ref(id, 'requires.' + k) }
  for (const k of rel.edges.keys()) {
    const [a, b] = k.split('>')
    if (!a || !b) { problems.push(`edges 키 "${k}" 는 "from>to" 형태여야 합니다`); continue }
    ref(a, 'edges'); ref(b, 'edges')
  }
  for (const c of rel.conflicts) for (const id of c) {
    if (id.startsWith('block:')) { if (!rel.blocks.has(id.slice(6))) referenced.add(`${id} (conflicts)`) } else if (id.startsWith('bundle:')) { if (!rel.bundles.has(id.slice(7))) referenced.add(`${id} (conflicts)`) } else ref(id, 'conflicts')
  }
  for (const r of referenced) problems.push(`relations.json 이 없는 항목을 가리킵니다: ${r}`)

  // 소속: 스킬·에이전트는 블록 정확히 하나, 훅·룰·커맨드는 묶음·블록·standalone 중 한 곳
  const blockOf = new Map(), bundleOf = new Map()
  for (const [k, list] of rel.blocks) for (const id of list) blockOf.set(id, (blockOf.get(id) || []).concat(k))
  for (const [k, list] of rel.bundles) for (const id of list) bundleOf.set(id, (bundleOf.get(id) || []).concat(k))
  const alone = new Set(rel.standalone)
  for (const [id, it] of items) {
    const bl = blockOf.get(id) || [], bu = bundleOf.get(id) || []
    if (bl.length > 1) problems.push(`${id} 가 블록 여러 곳에 있습니다 (${bl.join(', ')}) — 하나만 남기세요`)
    if (bu.length > 1) problems.push(`${id} 가 묶음 여러 곳에 있습니다 (${bu.join(', ')}) — 하나만 남기세요`)
    if ((it.type === 'agent' || it.type === 'skill') && bl.length === 0) problems.push(`${id} 가 어느 블록에도 없습니다 — relations.json 의 blocks 중 맞는 곳에 넣으세요`)
    if ((it.type === 'hook' || it.type === 'rule' || it.type === 'command') && !bl.length && !bu.length && !alone.has(id)) problems.push(`${id} 가 묶음·블록·standalone 어디에도 없습니다 — relations.json 에서 소속을 정하세요`)
  }

  // 체크리스트 원본이 있으면 훅·룰·커맨드는 항목 줄이 있어야 한다 (기본값·설명 누락 방지)
  const head = path.join(root, 'docs', 'plans', 'page', 'checklist-head.md')
  if (fs.existsSync(head)) {
    const text = readHead(head)
    for (const [id, it] of items) {
      if (!['hook', 'rule', 'command'].includes(it.type)) continue
      const label = it.type === 'command' ? '/' + it.name : it.name
      if (!text.includes('**' + label + '**')) problems.push(`${id} 의 체크리스트 항목 줄이 없습니다 — docs/plans/page/checklist-head.md 에 "- [ ] **${label}** (기본 켬/끔) — 설명" 을 추가하세요`)
    }
  }

  // 분류 안 된 언급
  const patterns = [...items].map(([id, it]) => [id, patternOf(it)])
  const sources = only ? (items.has(only) ? [only] : []) : [...items.keys()]
  for (const from of sources) {
    for (const to of mentionsOf(from, items, patterns)) {
      if (autoUses(from, to)) continue
      if ((rel.requires.get(from) || []).includes(to)) continue
      const fb = bundleOf.get(from) || [], tb = bundleOf.get(to) || []
      if (fb.some(b => tb.includes(b))) continue
      const key = from + '>' + to
      const kind = rel.edges.get(key)
      if (typeof kind === 'string' && KINDS.has(kind)) continue
      problems.push(`분류 안 된 관계 ${key} — relations.json 의 edges 에 "${key}": "requires|uses|mention|code" 를 추가하세요 (requires 면 requires 칸에)`)
    }
  }
  return { problems }
}

// 프로젝트 루트: CLAUDE_PROJECT_DIR → cwd 순, 위로 올라가며 relations.json 이 있는 곳
function rootOf(input) {
  const starts = [process.env.CLAUDE_PROJECT_DIR, typeof input.cwd === 'string' ? input.cwd : null].filter(Boolean)
  for (const s of starts) {
    let d = path.resolve(s)
    for (let i = 0; i < 40; i++) {
      if (fs.existsSync(path.join(d, 'relations.json'))) return d
      const up = path.dirname(d)
      if (up === d) break
      d = up
    }
  }
  return null
}

// 저장한 파일 → 항목 id (대상 아니면 null). 레포 밖으로 나가는 경로는 무시
function itemOfPath(root, file) {
  const abs = path.resolve(root, file)
  const rel = path.relative(root, abs)
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null
  if (rel === 'relations.json') return { all: true }
  const parts = rel.split(path.sep)
  if (parts[0] !== '.claude' || !AREAS.includes(parts[1])) return null
  const area = parts[1], last = parts[parts.length - 1]
  if (area === 'hooks') return last.endsWith('.js') && !last.endsWith('.test.js') && parts.length === 3 ? { id: 'hook:' + last.slice(0, -3) } : null
  if (area === 'rules') return last.endsWith('.md') && parts.length === 3 ? { id: 'rule:' + last } : null
  if (area === 'commands') return last.endsWith('.md') && parts.length === 3 && last !== 'CLAUDE.md' ? { id: 'command:' + last.slice(0, -3) } : null
  if (area === 'agents') return last.endsWith('.md') && last !== 'CLAUDE.md' ? { id: 'agent:' + last.slice(0, -3) } : null
  if (area === 'skills') return parts.length >= 4 && last.endsWith('.md') ? { id: 'skill:' + parts[2] } : null
  return null
}

function isGitCommit(cmd) {
  if (typeof cmd !== 'string' || !cmd.trim()) return false
  if (analyzer && typeof analyzer.analyzeShell === 'function') {
    let acc
    try { acc = analyzer.analyzeShell(cmd) } catch { acc = null }
    if (acc && Array.isArray(acc.invocations)) {
      return acc.invocations.some(inv => {
        if (inv.name !== 'git') return false
        const args = (inv.args || []).map(a => String(a && a.value !== undefined ? a.value : a))
        for (let i = 0; i < args.length; i++) {
          const a = args[i]
          if (a === '-C' || a === '-c' || a === '--git-dir' || a === '--work-tree' || a === '--namespace') { i++; continue }
          if (a.startsWith('-')) continue
          return a === 'commit'
        }
        return false
      })
    }
  }
  return /(^|[;&|]\s*)git(\s+-\S+(\s+\S+)?)*\s+commit\b/.test(cmd)
}

function summary(problems) {
  const shown = problems.slice(0, MAX_LIST).map(p => '  - ' + p)
  if (problems.length > MAX_LIST) shown.push(`  … 외 ${problems.length - MAX_LIST}건`)
  return shown.join('\n')
}

function handle(input) {
  if (!isObj(input)) return null
  const event = input.hook_event_name || input.hookEventName
  if (event === 'PostToolUse' && ['Write', 'Edit', 'MultiEdit'].includes(input.tool_name)) {
    const file = isObj(input.tool_input) ? input.tool_input.file_path : null
    if (typeof file !== 'string' || !file) return null
    const root = rootOf(input)
    if (!root) return null
    const target = itemOfPath(root, file)
    if (!target) return null
    const r = check(root, target.all ? null : target.id)
    if (r.skip || !r.problems.length) return null
    const text = `[relation-guard] 관계 정리가 필요합니다 (relations.json — 계획서 14장). 지금 고치지 않으면 git commit 이 차단됩니다:\n${summary(r.problems)}`
    return { hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: text.slice(0, 9000) } }
  }
  if (event === 'PreToolUse' && input.tool_name === 'Bash') {
    const cmd = isObj(input.tool_input) ? input.tool_input.command : null
    if (!isGitCommit(cmd)) return null
    const root = rootOf(input)
    if (!root) return null
    const r = check(root, null)
    if (r.skip || !r.problems.length) return null
    const text = `[relation-guard] 분류 안 된 관계·소속 없는 항목이 있어 커밋을 막았습니다. relations.json 을 고친 뒤 다시 커밋하세요:\n${summary(r.problems)}`
    return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: text.slice(0, 9000) } }
  }
  return null
}

if (require.main === module) {
  let input = null
  try { input = JSON.parse(fs.readFileSync(0, 'utf8')) } catch { process.exit(0) }
  let r = null
  try { r = handle(input) } catch { r = null }
  if (r) process.stdout.write(JSON.stringify(r) + '\n')
  process.exit(0)
} else {
  module.exports = { handle, check, scanItems, loadRelations, itemOfPath, isGitCommit }
}
