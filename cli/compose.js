// 조립 — 연 프로젝트의 설정 폴더(<dataDir>/projects/<이름>/.claude = 그 세션의 CLAUDE_CONFIG_DIR)를 만든다
//   ① 켜진 룰·커맨드·에이전트·스킬·공통 CLAUDE.md → 하네스 원본으로 심볼릭 링크 (PoC 3)
//   ② projects/·plugins/·plans/·sessions/ → ~/.claude 쪽 링크 (대화기록·메모리·플러그인·계획·실행 중 세션 목록 공유 — 결정 2·38, PoC 8·플러그인)
//   ③ settings.json 은 일반 파일 — 권한·상태줄·플러그인 + 이벤트마다 디스패처(cli/hook.js) 하나 (PoC 4)
//   ④ .claude.json 에 온보딩 완료 표시와 이 폴더의 신뢰 기록만 옮김 (첫 실행 화면 PoC)
// 프로젝트가 이미 가진 항목(.claude/ 아래 같은 이름, settings.json 에 연결된 같은 훅)은 건너뛴다 — 두 번 실행·중복 방지
// 사용자가 설정 폴더에 직접 만든 것은 건드리지 않는다. 지우는 것은 우리가 만든 링크(.gugbab-managed.json 기록)뿐
'use strict';
const fs = require('fs');
const path = require('path');

const TOOL_EVENTS = new Set(['PreToolUse', 'PostToolUse', 'PostToolUseFailure', 'PermissionRequest']);
const SHARED = ['projects', 'plugins', 'plans', 'sessions'];
// 처음부터 만들어 둘 공유 폴더 — 없으면 claude 가 설정 폴더 안에 진짜 폴더를 만들어 공유가 끊긴다
const CREATE_SHARED = new Set(['plans', 'sessions']);
const SESSION_ENTRY = /^\d{1,10}(?:\.[0-9a-f]{16,128})?\.(?:json|key)$/;
const SUBDIR = { rule: 'rules', command: 'commands', agent: 'agents', skill: 'skills' };
const UNSAFE_SHELL = /["$`\\\n\r]/;

const lstat = (p) => { try { return fs.lstatSync(p); } catch { return null; } };
const readJson = (p, fallback) => { try { const v = JSON.parse(fs.readFileSync(p, 'utf8')); return v && typeof v === 'object' && !Array.isArray(v) ? v : fallback; } catch { return fallback; } };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function under(child, parent) { return child === parent || child.startsWith(parent + path.sep); }
function realOrNull(p) { try { return fs.realpathSync(p); } catch { return null; } }

function writeIfChanged(file, content, mode) {
  let cur = null;
  try { cur = fs.readFileSync(file, 'utf8'); } catch { /* 없음 */ }
  if (cur === content && (!mode || (fs.statSync(file).mode & 0o777) === mode)) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, content, mode ? { mode } : undefined);
  if (mode) fs.chmodSync(tmp, mode);
  fs.renameSync(tmp, file);
  return true;
}

// 설정 폴더에 이미 진짜 sessions/ 폴더가 있으면(결정 38 이전에 띄운 세션) 안의 세션 기록을 공유 폴더로 옮기고 비운다
//   sessions/ = 실행 중인 세션 목록(<pid>.json·<pid>.<hex>.key). 설정 폴더마다 따로 두면 ListAgents·SendMessage 가 서로를 못 찾는다
//   옮기는 것은 이름이 세션 기록 형식인 일반 파일뿐 — 링크·폴더·낯선 파일이 있으면 손대지 않고 링크도 걸지 않는다
//   같은 이름이 이미 있으면(같은 pid 번호) 더 최근 것을 남긴다. 실행 중인 세션은 다음 갱신 때 링크를 거쳐 다시 쓴다
function migrateSessions(src, target) {
  const st = lstat(src);
  if (!st || st.isSymbolicLink()) return { changed: false };
  if (!st.isDirectory()) return { changed: false, blocked: '설정 폴더에 sessions 파일이 있어 링크하지 않습니다' };
  let tst;
  try { tst = fs.statSync(target); } catch { tst = null; }
  if (!tst || !tst.isDirectory()) return { changed: false, blocked: `${target} 가 폴더가 아니라 옮기지 않습니다` };
  let changed = false;
  const left = [];
  for (const name of fs.readdirSync(src)) {
    const from = path.join(src, name);
    const fst = lstat(from);
    if (!SESSION_ENTRY.test(name) || !fst || !fst.isFile()) { left.push(name); continue; }
    const to = path.join(target, name);
    const dst = lstat(to);
    try {
      if (dst && (!dst.isFile() || dst.mtimeMs >= fst.mtimeMs)) {
        if (!dst.isFile()) { left.push(name); continue; }
        fs.unlinkSync(from); // 공유 폴더 쪽이 더 최근
      } else {
        fs.renameSync(from, to);
      }
      changed = true;
    } catch { left.push(name); }
  }
  if (left.length) return { changed, blocked: `설정 폴더 sessions/ 에 옮기지 못한 항목이 있어 링크하지 않습니다 (${left.slice(0, 3).join(', ')}${left.length > 3 ? ' …' : ''})` };
  try { fs.rmdirSync(src); } catch { return { changed, blocked: '설정 폴더 sessions/ 를 비우지 못해 링크하지 않습니다' }; }
  return { changed: true };
}

// 프로젝트 자체 settings.json 에 이미 연결된 하네스 훅 이름들
function projectWiredHooks(root) {
  const names = new Set();
  for (const f of ['settings.json', 'settings.local.json']) {
    const s = readJson(path.join(root, '.claude', f), {});
    for (const groups of Object.values(s.hooks || {})) {
      for (const g of Array.isArray(groups) ? groups : []) for (const h of (g && g.hooks) || []) {
        const m = /\.claude\/hooks\/([a-z0-9-]+)\.js\b/.exec(String(h && h.command || ''));
        if (m) names.add(m[1]);
      }
    }
  }
  return names;
}

// 이 프로젝트의 메모리·대화 폴더 — 설정 폴더 쪽 경로와 링크를 따라간 실제 위치(~/.claude/projects/<인코딩>)
// 인코딩은 Claude Code 와 같게(영숫자 밖 → -). 200자 넘으면 Claude Code 가 잘라 해시를 붙이므로 넣지 않고(지금처럼 확인 창),
// 경로에 : 가 있으면 목록 구분자와 겹쳐 넣지 않는다
function projectMemoryDirs(cfg, claudeHome, root) {
  const enc = String(root || '').replace(/[^A-Za-z0-9]/g, '-');
  if (!enc || enc.length > 200) return [];
  const dirs = [path.join(cfg, 'projects', enc), path.join(claudeHome, 'projects', enc)];
  return [root, ...dirs].some(d => String(d).includes(':')) ? [] : dirs;
}

function compose({ manifest, paths, project, resolved }) {
  const code = paths.codeHome;
  if (UNSAFE_SHELL.test(code)) throw new Error(`하네스 경로에 명령에 쓸 수 없는 문자가 있습니다: ${code}`);
  const realCode = realOrNull(code) || code;
  const cfg = project.configDir;
  const warnings = [];
  let changed = false;
  fs.mkdirSync(cfg, { recursive: true });

  const managedFile = path.join(cfg, '.gugbab-managed.json');
  const managed = readJson(managedFile, {});
  const prevLinks = new Set(Array.isArray(managed.links) ? managed.links : []);
  const isOn = (id) => resolved.enabled.has(id);
  const items = manifest.items || {};
  const isSelf = realOrNull(project.root) === realCode;

  // ① 링크 목표
  const desired = new Map(); // 설정 폴더 기준 이름 → 절대 목표
  const skippedItems = [];
  for (const [id, it] of Object.entries(items)) {
    if (!isOn(id)) continue;
    let rel = null;
    if (SUBDIR[it.type] && it.path) rel = path.join(SUBDIR[it.type], path.basename(it.path));
    else if (it.type === 'setting' && it.key === 'claudeMd' && it.path) { if (isSelf) continue; rel = 'CLAUDE.md'; }
    if (!rel) continue;
    const target = path.resolve(code, it.path);
    const real = realOrNull(target);
    if (!real || !under(real, realCode) || !under(target, code)) { warnings.push(`${id}: 하네스 폴더 밖이거나 없는 경로라 넣지 않습니다 (${it.path})`); continue; }
    if (SUBDIR[it.type] && lstat(path.join(project.root, '.claude', rel))) { skippedItems.push(id); continue; }
    desired.set(rel, target);
  }
  // ② 공유 링크
  for (const d of SHARED) {
    const target = path.join(paths.claudeHome, d);
    // plans 는 계획 모드를 처음 쓸 때, sessions 는 세션을 처음 띄울 때 생기는 폴더 — 미리 만들어야 설정 폴더에 따로 생기지 않는다
    if (CREATE_SHARED.has(d) && !lstat(target) && lstat(paths.claudeHome)) { try { fs.mkdirSync(target, { mode: 0o700 }); } catch { /* 아래에서 경고 */ } }
    if (!lstat(target)) { warnings.push(`${d}: ${target} 가 없어 링크를 건너뜁니다`); continue; }
    if (d === 'sessions') {
      const m = migrateSessions(path.join(cfg, d), target);
      if (m.changed) changed = true;
      if (m.blocked) { warnings.push(`sessions: ${m.blocked} — 다른 세션과 서로 보이지 않습니다`); continue; }
    }
    desired.set(d, target);
  }

  const nowLinks = [];
  for (const [rel, target] of desired) {
    const p = path.join(cfg, rel);
    const st = lstat(p);
    if (st && !st.isSymbolicLink()) { warnings.push(`${rel}: 설정 폴더에 직접 만든 ${st.isDirectory() ? '폴더' : '파일'}가 있어 그대로 둡니다`); continue; }
    if (st && fs.readlinkSync(p) === target) { nowLinks.push(rel); continue; }
    if (st && !prevLinks.has(rel)) { warnings.push(`${rel}: 다른 곳을 가리키는 링크가 있어 그대로 둡니다`); continue; }
    if (st) fs.unlinkSync(p);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.symlinkSync(target, p);
    nowLinks.push(rel); changed = true;
  }
  for (const rel of prevLinks) {
    if (desired.has(rel)) continue;
    const p = path.join(cfg, rel);
    const st = lstat(p);
    if (st && st.isSymbolicLink()) { fs.unlinkSync(p); changed = true; }
  }

  // ③ settings.json
  const base = manifest.base || {};
  const composed = {};
  const perm = {};
  for (const [id, it] of Object.entries(items)) {
    if (it.type !== 'setting' || !isOn(id) || typeof it.key !== 'string') continue;
    if (it.key.startsWith('permissions.')) {
      const k = it.key.slice(12);
      if (base.permissions && base.permissions[k] !== undefined) perm[k] = base.permissions[k];
    }
  }
  if (Object.keys(perm).length) composed.permissions = perm;
  const statusItem = Object.entries(items).find(([, it]) => it.type === 'setting' && it.key === 'statusLine');
  if (base.statusLine && statusItem && isOn(statusItem[0])) {
    composed.statusLine = { ...base.statusLine, command: String(base.statusLine.command || '').split('${GUGBAB_ROOT}').join(path.join(code, '.claude')) };
  }
  const plugins = { ...(base.enabledPlugins || {}) };
  for (const [id, it] of Object.entries(items)) if (it.type === 'setting' && String(it.key).startsWith('plugin:')) plugins[it.key.slice(7)] = isOn(id);
  for (const [name, bundle] of Object.entries(manifest.pluginBundles || {})) {
    const members = ((manifest.relations || {}).bundles || {})[bundle];
    plugins[name] = !!members && members.items.some(isOn);
  }
  if (Object.keys(plugins).length) composed.enabledPlugins = plugins;

  const wired = projectWiredHooks(project.root);
  const skippedHooks = [];
  const hooks = {};
  for (const [event, list] of Object.entries(manifest.hookOrder || {})) {
    if (!/^[A-Za-z]+$/.test(event)) { warnings.push(`이벤트 이름이 이상해 건너뜁니다: ${event}`); continue; }
    const active = list.filter(h => {
      if (!isOn(h.id)) return false;
      if (wired.has(h.id.slice(5))) { if (!skippedHooks.includes(h.id)) skippedHooks.push(h.id); return false; }
      return true;
    });
    if (!active.length) continue;
    const timeout = Math.min(600, active.reduce((n, h) => n + (Number(h.timeout) > 0 ? Number(h.timeout) : 60), 0));
    const entry = { hooks: [{ type: 'command', command: `node "${code}/cli/hook.js" ${event}`, timeout }] };
    hooks[event] = [TOOL_EVENTS.has(event) ? { matcher: '*', ...entry } : entry];
  }
  if (Object.keys(hooks).length) composed.hooks = hooks;

  // env — 이 프로젝트 메모리·대화 폴더를 훅 허용 폴더로 (결정 39). 자기 훅을 가진 프로젝트의 auto-approve 는
  // 설정 폴더 projects/ 링크를 따라가지 않아 메모리 수정마다 확인 창이 뜬다 → bash-guard 계열이 읽는 환경변수로 넘긴다
  const memDirs = desired.has('projects') ? projectMemoryDirs(cfg, paths.claudeHome, project.root) : [];
  if (memDirs.length) composed.env = { CLAUDE_BASH_GUARD_ALLOWED_DIRS: memDirs.join(':') };

  // 사용자가 넣은 값 보존 — 지난번 조립 결과와 달라진 칸은 사용자 것으로 본다
  const settingsFile = path.join(cfg, 'settings.json');
  const sst = lstat(settingsFile);
  const existing = sst && sst.isFile() ? readJson(settingsFile, {}) : {};
  const prev = managed.composed && typeof managed.composed === 'object' ? managed.composed : {};
  const out = {};
  for (const [k, v] of Object.entries(existing)) {
    if (k in composed) continue;
    if (k in prev && same(prev[k], v)) continue; // 우리가 넣었다가 이번에 뺀 칸
    out[k] = v;
  }
  Object.assign(out, composed);
  if (existing.permissions && composed.permissions) {
    const ours = new Set([...((prev.permissions || {}).allow || []), ...(composed.permissions.allow || [])]);
    const userAllow = (Array.isArray(existing.permissions.allow) ? existing.permissions.allow : []).filter(a => !ours.has(a));
    const extraKeys = Object.fromEntries(Object.entries(existing.permissions).filter(([k]) => !(k in composed.permissions) && !(k in (prev.permissions || {}))));
    out.permissions = { ...extraKeys, ...composed.permissions };
    if (userAllow.length) out.permissions.allow = [...(composed.permissions.allow || []), ...userAllow];
  }
  // env 는 키 단위 — 사용자가 넣은 다른 키는 보존, 우리가 넣었던 키는 이번 값으로(이번에 없으면 걷어냄)
  const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const ourEnv = new Set([...Object.keys(isObj(prev.env) ? prev.env : {}), ...Object.keys(composed.env || {})]);
  const env = { ...Object.fromEntries(Object.entries(isObj(existing.env) ? existing.env : {}).filter(([k]) => !ourEnv.has(k))), ...(composed.env || {}) };
  if (Object.keys(env).length) out.env = env; else delete out.env;
  if (sst && sst.isSymbolicLink()) fs.unlinkSync(settingsFile); // 링크였으면 일반 파일로 (PoC 3)
  if (writeIfChanged(settingsFile, JSON.stringify(out, null, 2) + '\n')) changed = true;

  // ④ .claude.json — 첫 실행 화면
  const cjFile = path.join(cfg, '.claude.json');
  const cj = readJson(cjFile, {});
  const homeCj = readJson(path.join(paths.home, '.claude.json'), {});
  const before = JSON.stringify(cj);
  for (const k of ['hasCompletedOnboarding', 'lastOnboardingVersion', 'theme']) if (homeCj[k] !== undefined && cj[k] === undefined) cj[k] = homeCj[k];
  const trust = homeCj.projects && homeCj.projects[project.root];
  if (trust && trust.hasTrustDialogAccepted === true) {
    cj.projects = cj.projects && typeof cj.projects === 'object' ? cj.projects : {};
    cj.projects[project.root] = { ...(cj.projects[project.root] || {}), hasTrustDialogAccepted: true };
  }
  if (JSON.stringify(cj) !== before || !lstat(cjFile)) {
    if (writeIfChanged(cjFile, JSON.stringify(cj, null, 2) + '\n', 0o600)) changed = true;
  } else if ((fs.statSync(cjFile).mode & 0o777) !== 0o600) fs.chmodSync(cjFile, 0o600);

  // 기록 — 다음 조립·디스패처가 읽는다
  if (writeIfChanged(managedFile, JSON.stringify({ links: nowLinks.sort(), composed }, null, 2) + '\n')) changed = true;
  writeIfChanged(path.join(cfg, '.gugbab-state.json'), JSON.stringify({ projectRoot: project.root, skippedHooks, skippedItems }, null, 2) + '\n');

  return { changed, warnings, skippedHooks, skippedItems, links: nowLinks };
}

module.exports = { compose, projectWiredHooks };
