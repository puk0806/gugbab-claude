#!/usr/bin/env node
// 훅 디스패처 — 조립된 settings.json 은 이벤트마다 이 파일 하나만 연결한다 (계획서 6장, PoC 4 확인)
//   node cli/hook.js <이벤트>   (stdin = Claude Code 훅 입력 JSON)
// 실행할 때마다 manifest·적용 층을 다시 읽으므로 켜기·끄기가 바로 반영된다. 고정 훅은 꺼져 있어도 실행한다
// 결과 합치기 (공식: 한 이벤트의 훅은 병렬로 모두 돈다 — code.claude.com/docs/en/hooks "run in parallel"):
//   켜진 훅을 순서대로 끝까지 다 돌린 뒤 한 번에 결정한다 (차단 훅 뒤의 기록·안내 훅도 돈다)
//   exit 2 하나라도 → 모은 사유(stderr·deny·block)를 이어붙여 exit 2 (PermissionRequest 는 공식상 exit 2 무시)
//   결정 deny > ask > allow / 안내·메시지는 이어붙임 (SessionStart 등 9,000자 상한 — 공식 상한 10,000자)
// 훅 오류(크래시·시간 초과)는 기본적으로 차단하지 않고 <데이터>/logs/hook-errors.log 에 남긴다
//   예외: 차단형 보안 훅(FAIL_CLOSED)이 PreToolUse·PermissionRequest 에서 실패하면 공식 onFailure:"block" 처럼 막는다
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { getPaths } = require('./paths');
const { resolve } = require('./resolve');
const { loadLayers, readJsonObject } = require('./layers');

const TOOL_EVENTS = new Set(['PreToolUse', 'PostToolUse', 'PostToolUseFailure', 'PermissionRequest']);
const GATE_EVENTS = new Set(['PreToolUse', 'PermissionRequest']); // 도구 실행 전 — 보안 훅 실패 시 막는 이벤트
const CONTEXT_EVENTS = new Set(['SessionStart', 'UserPromptSubmit']); // 일반 출력이 Claude 에게 들어가는 이벤트
const RANK = { allow: 1, ask: 2, deny: 3 };
// 실패하면 막는 훅 — manifest 항목의 failClosed(true/false)가 우선, 없으면 이 기본 목록(셸 명령·비밀 파일·비밀값·main push 차단)
// (2026-11-06) 디스패처 하나에 훅이 다 묶여 있어 settings 의 onFailure 로는 훅별 구분이 안 된다 → 디스패처 안에서 판정
const FAIL_CLOSED = new Set(['hook:bash-guard', 'hook:protect-secrets', 'hook:parry', 'hook:branch-protection']);
const PRIORITY_CONTEXT = ['hook:wrapper-version-check']; // "첫 답변 맨 위에 [gugbab] 한 줄" 안내 — 잘리지 않게 맨 앞
const CAP = 9000; // 공식 상한 10,000자(넘으면 파일 경로 + 앞 2,000자만) — 여유를 둔다
const MAX_TOTAL_S = 600; // compose 가 settings 에 넣는 디스패처 timeout 상한과 같다

const event = process.argv[2] || '';
if (!/^[A-Za-z]+$/.test(event)) process.exit(0);

let raw = '';
try { raw = fs.readFileSync(0, 'utf8'); } catch { /* 빈 입력 */ }
let input = {};
let inputOk = false;
try { const v = JSON.parse(raw); if (v && typeof v === 'object' && !Array.isArray(v)) { input = v; inputOk = true; } } catch { /* 깨진 입력 */ }
// 도구 이벤트인데 도구 이름을 못 읽으면 도구별 훅(matcher Bash·Write…)이 하나도 안 돈다 — 가드가 빠진 채 통과하지 않게
if (TOOL_EVENTS.has(event) && (!inputOk || typeof input.tool_name !== 'string')) {
  if (event === 'PreToolUse') { process.stderr.write('[gugbab] 훅 입력(JSON)을 읽지 못해 안전 검사를 할 수 없어 도구 실행을 막습니다\n'); process.exit(2); }
  if (event === 'PermissionRequest') process.exit(0); // 결정 없음 — 평소 확인 창
}

const paths = getPaths();
// 윈도우는 실제 표기(.native) — JS realpath 는 입력 대소문자를 그대로 둬 같은 폴더가 다른 문자열이 된다 (winfs.js)
const realOr = (p) => require('./winfs').realOrNull(p);

function logError(hookId, msg) {
  try {
    fs.mkdirSync(paths.logsDir, { recursive: true });
    const proj = path.basename(path.dirname(process.env.CLAUDE_CONFIG_DIR || '')) || '-';
    fs.appendFileSync(path.join(paths.logsDir, 'hook-errors.log'), `${new Date().toISOString()} ${proj} ${event} ${hookId} ${msg}\n`);
  } catch { /* 기록 실패는 무시 */ }
}

let manifest;
try { manifest = JSON.parse(fs.readFileSync(paths.manifestPath, 'utf8')); } catch (e) {
  const msg = `[gugbab] manifest.json 을 읽지 못했습니다 (${paths.manifestPath}) — \`gugbab-claude doctor\` 로 확인하세요`;
  logError('-', `manifest 읽기 실패: ${e.message}`);
  process.stderr.write(msg + '\n');
  process.exit(TOOL_EVENTS.has(event) ? 2 : 0); // 안전 가드가 다 꺼진 채 도구를 쓰지 않게
}

// 래퍼 데이터 폴더의 projects/<이름>/.claude 일 때만 그 프로젝트 층을 읽는다 — 다른 곳이면 기본값
function projectContext() {
  const cfg = process.env.CLAUDE_CONFIG_DIR;
  const realCfg = cfg && path.isAbsolute(cfg) ? realOr(cfg) : null;
  const realProjects = realOr(paths.projectsDir);
  if (!realCfg || !realProjects || path.basename(realCfg) !== '.claude' || path.dirname(path.dirname(realCfg)) !== realProjects) return null;
  const state = readJsonObject(path.join(realCfg, '.gugbab-state.json'));
  const root = typeof state.projectRoot === 'string' ? state.projectRoot : (process.env.CLAUDE_PROJECT_DIR || process.cwd());
  return { project: { root, settingsPath: path.join(path.dirname(realCfg), 'settings.json') }, skipped: new Set(Array.isArray(state.skippedHooks) ? state.skippedHooks : []) };
}

function matchOne(matcher, subject) {
  try { return new RegExp(`^(?:${matcher})$`).test(subject); } catch { return false; }
}
// 공식: PreToolUse·PermissionRequest 의 Bash matcher(Bash·Bash|PowerShell·Bash.* 등)는 Monitor 셸 명령에도 걸린다 (v2.1.314+).
// 훅에는 Monitor 입력을 그대로 넘긴다(tool_name Monitor, tool_input.command). PostToolUse 의 Bash matcher 는 Monitor 에 안 돈다
function matches(matcher, subject) {
  if (!matcher || matcher === '*') return true;
  if (typeof subject !== 'string') return false;
  if (matchOne(matcher, subject)) return true;
  return subject === 'Monitor' && GATE_EVENTS.has(event) && matchOne(matcher, 'Bash');
}
// 공식(2.1.314): Bash matcher 로 Monitor 에 걸린 훅은 막기(deny)·묻기(ask)만 되고 허용(allow)·명령 바꾸기(updatedInput)는 무시된다.
// 디스패처는 matcher '*' 하나로 등록돼 Claude Code 가 이 구분을 못 하므로 여기서 같은 규칙을 적용한다 (2026-11-11)
function viaBashOnly(matcher) {
  return subject === 'Monitor' && !!matcher && matcher !== '*' && !matchOne(matcher, 'Monitor');
}

const ctx = projectContext();
const resolved = resolve(manifest, ctx ? loadLayers(paths, ctx.project) : []);
const subject = TOOL_EVENTS.has(event) ? input.tool_name : (input.source ?? input.trigger ?? input.matcher);
const hooksDir = realOr(path.join(paths.codeHome, '.claude', 'hooks'));
const order = ((manifest.hookOrder || {})[event] || []).filter(h => h && resolved.enabled.has(h.id) && !(ctx && ctx.skipped.has(h.id)));
const list = order.filter(h => matches(h.matcher, subject));
const secOf = (s) => (Number(s) > 0 ? Number(s) : 60);
// 시간 예산 — Claude Code 는 settings 의 timeout(compose: 이 이벤트 훅 timeout 합, 600초 상한)이 지나면 디스패처를 죽인다.
// 그 전에 끝내야 고정 보안 훅을 판정할 수 있다 → 같은 합에서 2초 여유를 빼고 훅마다 남은 시간 안에서 돌린다
const deadline = Date.now() + Math.max(1000, Math.min(MAX_TOTAL_S, order.reduce((n, h) => n + secOf(h.timeout), 0)) * 1000 - 2000);

const env = { ...process.env, GUGBAB_HOME: paths.codeHome, GUGBAB_ENABLED: [...resolved.enabled].join(','), GUGBAB_STATE_DIR: paths.stateDir };
const decisions = [];
const contexts = []; // { id, text }
const plains = [];   // { id, text }
const systemMessages = [];
const blockReasons = [];
const exit2 = [];         // exit 2 사유 (stderr)
const failClosed = [];    // 실패한 차단형 보안 훅 사유
const prDecisions = [];   // PermissionRequest decision 객체
let stopContinue = null;
const extraStderr = [];

const isFailClosed = (id) => {
  const it = (manifest.items || {})[id] || {};
  return typeof it.failClosed === 'boolean' ? it.failClosed : FAIL_CLOSED.has(id);
};
// 실패 처리 — 차단형 보안 훅이 도구 실행 전 이벤트에서 실패하면 막는다(공식 onFailure:block 과 같은 효과), 나머지는 기록만
function failed(h, why, notice) {
  logError(h.id, why);
  if (GATE_EVENTS.has(event) && isFailClosed(h.id)) {
    failClosed.push(`[gugbab] 보안 훅 ${h.id.replace(/^hook:/, '')} 이 실행되지 못해(${why}) 안전을 위해 막습니다 — \`gugbab-claude doctor\` 로 확인하세요`);
  } else if (notice) extraStderr.push(notice);
}

for (const h of list) {
  const it = (manifest.items || {})[h.id] || {};
  const file = typeof it.path === 'string' ? path.resolve(paths.codeHome, it.path) : null;
  const real = file && realOr(file);
  if (!real || !hooksDir || path.dirname(real) !== hooksDir || !real.endsWith('.js')) { failed(h, `hooks 폴더 밖이거나 없는 파일이라 실행하지 않음 (${it.path})`); continue; }
  const args = Array.isArray(h.args) ? h.args.filter(a => typeof a === 'string' && /^--?[a-z0-9-]+$/.test(a)) : [];
  const left = deadline - Date.now();
  if (left < 200) { failed(h, '디스패처 시간 예산을 다 써서 실행하지 않음', `[gugbab] ${h.id} 시간 부족 — 건너뜀`); continue; }
  const timeoutMs = Math.min(secOf(h.timeout) * 1000, left);
  const r = spawnSync(process.execPath, [real, ...args], { input: raw, encoding: 'utf8', env, timeout: timeoutMs, maxBuffer: 16 * 1024 * 1024 });
  if (r.error && r.error.code === 'ETIMEDOUT') { failed(h, `시간 초과 (${Math.round(timeoutMs / 100) / 10}초)`, `[gugbab] ${h.id} 시간 초과 — 건너뜀`); continue; }
  if (r.error) { failed(h, `실행 실패: ${r.error.message}`); continue; }
  if (r.status === 2) {
    // PermissionRequest: 공식상 exit 2 는 무시되고 stderr 도 버려진다 — 다른 훅의 결정은 그대로 살린다
    if (event !== 'PermissionRequest') exit2.push((r.stderr || '').trimEnd() || `[gugbab] ${h.id} 가 차단했습니다`);
    continue;
  }
  if (r.status !== 0) { failed(h, `종료 코드 ${r.status}${r.signal ? ' ' + r.signal : ''}: ${(r.stderr || '').trim().slice(0, 300)}`, `[gugbab] ${h.id} 오류(비차단)`); continue; }
  if (r.stderr) extraStderr.push(r.stderr.trimEnd());
  const out = (r.stdout || '').trim();
  if (!out) continue;
  let j = null;
  if (out.startsWith('{')) {
    try { j = JSON.parse(out); } catch { j = null; }
    if (!j || typeof j !== 'object') { failed(h, '출력 JSON 을 읽을 수 없음'); if (GATE_EVENTS.has(event) && isFailClosed(h.id)) continue; }
  }
  if (!j || typeof j !== 'object') { plains.push({ id: h.id, text: out }); continue; }
  const hs = j.hookSpecificOutput && typeof j.hookSpecificOutput === 'object' ? j.hookSpecificOutput : {};
  const bashOnly = viaBashOnly(h.matcher); // Monitor 를 Bash 로 간주해 돌린 훅 — allow·updatedInput 은 버린다
  if (hs.permissionDecision && RANK[hs.permissionDecision] && !(bashOnly && hs.permissionDecision === 'allow')) decisions.push({ d: hs.permissionDecision, reason: hs.permissionDecisionReason });
  if (hs.decision && typeof hs.decision === 'object' && (hs.decision.behavior === 'deny' || (hs.decision.behavior === 'allow' && !bashOnly))) prDecisions.push(hs.decision);
  if (typeof hs.additionalContext === 'string' && hs.additionalContext) contexts.push({ id: h.id, text: hs.additionalContext });
  if (j.decision === 'block') blockReasons.push(j.reason || '');
  if (j.continue === false) stopContinue = { stopReason: j.stopReason || '' };
  if (typeof j.systemMessage === 'string' && j.systemMessage) systemMessages.push({ id: h.id, text: j.systemMessage });
}

// 여러 훅의 글을 합쳐 상한 안으로 — 우선 훅은 맨 앞, 넘치면 각자 몫(남은 자리를 고르게)만큼 자르고 "…(N자 생략)" 표시
function fitAll(parts, SEP = '\n\n', cap = CAP) {
  const items = [...parts.filter(p => PRIORITY_CONTEXT.includes(p.id)), ...parts.filter(p => !PRIORITY_CONTEXT.includes(p.id))].map(p => p.text);
  if (!items.length) return '';
  const total = items.reduce((n, t) => n + t.length, 0) + SEP.length * (items.length - 1);
  if (total <= cap) return items.join(SEP);
  const mark = (n) => `\n…(${n}자 생략)`;
  const room = cap - SEP.length * (items.length - 1);
  const alloc = new Array(items.length).fill(0);
  // 고르게 나누기(water-filling) — 짧은 글은 다 넣고 남은 자리를 긴 글에 나눠 준다. 우선 훅부터 채워 잘림을 줄인다
  let remaining = room;
  let open = items.map((_, i) => i);
  while (open.length && remaining > 0) {
    const share = Math.floor(remaining / open.length);
    const fits = open.filter(i => items[i].length - alloc[i] <= share);
    if (!fits.length) { for (const i of open) alloc[i] += share; remaining -= share * open.length; break; }
    for (const i of fits) { remaining -= items[i].length - alloc[i]; alloc[i] = items[i].length; }
    open = open.filter(i => !fits.includes(i));
  }
  return items.map((t, i) => {
    if (alloc[i] >= t.length) return t;
    const keep = Math.max(0, alloc[i] - mark(t.length).length);
    return t.slice(0, keep) + mark(t.length - keep);
  }).join(SEP).slice(0, cap);
}

// ── 차단 결정 ──
if (failClosed.length && event === 'PreToolUse') exit2.push(...failClosed);
if (exit2.length) {
  const reasons = [...exit2, ...blockReasons.filter(Boolean), ...decisions.filter(x => x.d === 'deny').map(x => x.reason).filter(Boolean)];
  process.stderr.write([...reasons, ...extraStderr].join('\n') + '\n');
  process.exit(2);
}
if (extraStderr.length) process.stderr.write(extraStderr.join('\n') + '\n');

const result = {};
const hso = {};
if (decisions.length) {
  const top = Math.max(...decisions.map(x => RANK[x.d]));
  const win = decisions.filter(x => RANK[x.d] === top);
  hso.hookEventName = event;
  hso.permissionDecision = win[0].d;
  const reasons = win.map(x => x.reason).filter(Boolean);
  if (reasons.length) hso.permissionDecisionReason = reasons.join('\n');
}
// PermissionRequest — deny 가 이긴다(보안 훅 실패도 deny). deny 는 message·interrupt, allow 는 updatedInput·updatedPermissions 를 그대로
if (event === 'PermissionRequest' && failClosed.length) prDecisions.push({ behavior: 'deny', message: failClosed.join('\n') });
if (prDecisions.length) {
  const denies = prDecisions.filter(d => d.behavior === 'deny');
  let decision;
  if (denies.length) {
    decision = { behavior: 'deny' };
    const msgs = denies.map(d => d.message).filter(m => typeof m === 'string' && m);
    if (msgs.length) decision.message = msgs.join('\n');
    if (denies.some(d => d.interrupt === true)) decision.interrupt = true;
  } else {
    decision = { behavior: 'allow' };
    const withInput = prDecisions.filter(d => d.updatedInput && typeof d.updatedInput === 'object');
    if (withInput.length) decision.updatedInput = withInput[withInput.length - 1].updatedInput;
    const perms = prDecisions.flatMap(d => (Array.isArray(d.updatedPermissions) ? d.updatedPermissions : []));
    if (perms.length) decision.updatedPermissions = perms;
  }
  hso.hookEventName = event; hso.decision = decision;
}
if (CONTEXT_EVENTS.has(event) && plains.length) { contexts.push(...plains); plains.length = 0; }
if (contexts.length) { hso.hookEventName = event; hso.additionalContext = fitAll(contexts); }
if (Object.keys(hso).length) result.hookSpecificOutput = hso;
if (blockReasons.length) { result.decision = 'block'; result.reason = blockReasons.filter(Boolean).join('\n'); }
if (stopContinue) { result.continue = false; if (stopContinue.stopReason) result.stopReason = stopContinue.stopReason; }
if (systemMessages.length) result.systemMessage = fitAll(systemMessages, '\n');

if (Object.keys(result).length) process.stdout.write(JSON.stringify(result));
else if (plains.length) process.stdout.write(fitAll(plains, '\n'));
process.exit(0);
