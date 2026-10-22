#!/usr/bin/env node
// 훅 디스패처 — 조립된 settings.json 은 이벤트마다 이 파일 하나만 연결한다 (계획서 6장, PoC 4 확인)
//   node cli/hook.js <이벤트>   (stdin = Claude Code 훅 입력 JSON)
// 실행할 때마다 manifest·적용 층을 다시 읽으므로 켜기·끄기가 바로 반영된다. 고정 훅은 꺼져 있어도 실행한다
// 결과 합치기: exit 2 하나라도 → 그 stderr 로 즉시 차단 / 결정 deny > ask > allow / 안내·메시지는 이어붙임
// 훅 오류(크래시·시간 초과)는 차단하지 않고 <데이터>/logs/hook-errors.log 에 남긴다
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { getPaths } = require('./paths');
const { resolve } = require('./resolve');
const { loadLayers, readJsonObject } = require('./layers');

const TOOL_EVENTS = new Set(['PreToolUse', 'PostToolUse', 'PostToolUseFailure', 'PermissionRequest']);
const CONTEXT_EVENTS = new Set(['SessionStart', 'UserPromptSubmit']); // 일반 출력이 Claude 에게 들어가는 이벤트
const RANK = { allow: 1, ask: 2, deny: 3 };

const event = process.argv[2] || '';
if (!/^[A-Za-z]+$/.test(event)) process.exit(0);

let raw = '';
try { raw = fs.readFileSync(0, 'utf8'); } catch { /* 빈 입력 */ }
let input = {};
try { const v = JSON.parse(raw); if (v && typeof v === 'object') input = v; } catch { /* 깨진 입력 — 그대로 전달 */ }

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

function matches(matcher, subject) {
  if (!matcher || matcher === '*') return true;
  if (typeof subject !== 'string') return false;
  try { return new RegExp(`^(?:${matcher})$`).test(subject); } catch { return false; }
}

const ctx = projectContext();
const resolved = resolve(manifest, ctx ? loadLayers(paths, ctx.project) : []);
const subject = TOOL_EVENTS.has(event) ? input.tool_name : (input.source ?? input.trigger ?? input.matcher);
const hooksDir = realOr(path.join(paths.codeHome, '.claude', 'hooks'));
const list = ((manifest.hookOrder || {})[event] || []).filter(h => h && resolved.enabled.has(h.id) && !(ctx && ctx.skipped.has(h.id)) && matches(h.matcher, subject));

const env = { ...process.env, GUGBAB_HOME: paths.codeHome, GUGBAB_ENABLED: [...resolved.enabled].join(','), GUGBAB_STATE_DIR: paths.stateDir };
const decisions = [];
const contexts = [];
const plains = [];
const systemMessages = [];
const blockReasons = [];
let behavior = null;
let stopContinue = null;
const extraStderr = [];

for (const h of list) {
  const it = (manifest.items || {})[h.id] || {};
  const file = typeof it.path === 'string' ? path.resolve(paths.codeHome, it.path) : null;
  const real = file && realOr(file);
  if (!real || !hooksDir || path.dirname(real) !== hooksDir || !real.endsWith('.js')) { logError(h.id, `hooks 폴더 밖이거나 없는 파일이라 실행하지 않음 (${it.path})`); continue; }
  const args = Array.isArray(h.args) ? h.args.filter(a => typeof a === 'string' && /^--?[a-z0-9-]+$/.test(a)) : [];
  const timeoutMs = (Number(h.timeout) > 0 ? Number(h.timeout) : 60) * 1000;
  const r = spawnSync(process.execPath, [real, ...args], { input: raw, encoding: 'utf8', env, timeout: timeoutMs, maxBuffer: 16 * 1024 * 1024 });
  if (r.error && r.error.code === 'ETIMEDOUT') { logError(h.id, `시간 초과 (${timeoutMs / 1000}초)`); extraStderr.push(`[gugbab] ${h.id} 시간 초과 — 건너뜀`); continue; }
  if (r.error) { logError(h.id, `실행 실패: ${r.error.message}`); continue; }
  if (r.status === 2) { process.stderr.write(r.stderr || `[gugbab] ${h.id} 가 차단했습니다\n`); process.exit(2); }
  if (r.status !== 0) { logError(h.id, `종료 코드 ${r.status}${r.signal ? ' ' + r.signal : ''}: ${(r.stderr || '').trim().slice(0, 300)}`); extraStderr.push(`[gugbab] ${h.id} 오류(비차단)`); continue; }
  if (r.stderr) extraStderr.push(r.stderr.trimEnd());
  const out = (r.stdout || '').trim();
  if (!out) continue;
  let j = null;
  if (out.startsWith('{')) { try { j = JSON.parse(out); } catch { j = null; } }
  if (!j || typeof j !== 'object') { plains.push(out); continue; }
  const hs = j.hookSpecificOutput || {};
  if (hs.permissionDecision && RANK[hs.permissionDecision]) decisions.push({ d: hs.permissionDecision, reason: hs.permissionDecisionReason });
  if (hs.decision && hs.decision.behavior) behavior = behavior === 'deny' ? 'deny' : hs.decision.behavior;
  if (typeof hs.additionalContext === 'string' && hs.additionalContext) contexts.push(hs.additionalContext);
  if (j.decision === 'block') blockReasons.push(j.reason || '');
  if (j.continue === false) stopContinue = { stopReason: j.stopReason || '' };
  if (typeof j.systemMessage === 'string' && j.systemMessage) systemMessages.push(j.systemMessage);
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
if (behavior) { hso.hookEventName = event; hso.decision = { behavior }; }
if (CONTEXT_EVENTS.has(event) && plains.length) { contexts.push(...plains); plains.length = 0; }
if (contexts.length) { hso.hookEventName = event; hso.additionalContext = contexts.join('\n\n'); }
if (Object.keys(hso).length) result.hookSpecificOutput = hso;
if (blockReasons.length) { result.decision = 'block'; result.reason = blockReasons.filter(Boolean).join('\n'); }
if (stopContinue) { result.continue = false; if (stopContinue.stopReason) result.stopReason = stopContinue.stopReason; }
if (systemMessages.length) result.systemMessage = systemMessages.join('\n');

if (Object.keys(result).length) process.stdout.write(JSON.stringify(result));
else if (plains.length) process.stdout.write(plains.join('\n'));
process.exit(0);
