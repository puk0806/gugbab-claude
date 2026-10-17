#!/usr/bin/env node
// gugbab-claude 하위 명령 — bin/gugbab-claude 가 부른다
//   prepare [--no-update]   업데이트 → 프로젝트 확인 → 조립, 설정 폴더 경로를 stdout 으로 (래퍼 실행 직전)
//   compose                 조립만
//   status                  이 프로젝트에 적용된 항목 요약
//   doctor                  설치·조립 상태 점검
//   on|off <항목> [--all]   켜기·끄기 (기본 = 이 프로젝트, --all = 모든 프로젝트)
//   preset [이름] [--all]   프리셋 목록 / 적용 (블록·묶음 조합)
//   harness                 켜기·끄기 화면(TUI) — 터미널에서
//   harness --open          화면을 comux 옆 창 · tmux 팝업 · 새 터미널 창에 띄움 (/harness 가 부름, --dry-run 은 계획만)
'use strict';
const fs = require('fs');
const path = require('path');
const { getPaths } = require('./paths');
const { resolveProject } = require('./project');
const { resolve, expand } = require('./resolve');
const { loadLayers, readJsonObject, readSkipped } = require('./layers');
const { applyToggle, applyPreset, explainUnchanged, commitLayer, layerIndex } = require('./apply');
const { compose } = require('./compose');
const { checkUpdate, readChannel } = require('./update');
const { runDoctor } = require('./doctor');
const { statusLines } = require('./status');

const USAGE = `사용법: gugbab-claude [claude 인자…]
       gugbab-claude status | doctor | update
       gugbab-claude on|off <항목|bundle:이름|block:이름> [--all]
       gugbab-claude preset [이름] [--all]
       gugbab-claude harness [--open [--dry-run]]   켜기·끄기 화면
       gugbab-claude --raw [claude 인자…]   하네스 없이 실행`;

const args = process.argv.slice(2);
const cmd = args[0];
const paths = getPaths();

// state/channel.json — install.sh 가 기록 (stable · main · branch + 브랜치 이름)
function channelOf(ch) {
  if (ch.channel === 'main') return { channel: 'main' };
  if (ch.channel === 'branch') return { channel: 'branch', branch: typeof ch.branch === 'string' ? ch.branch : null };
  return { channel: 'stable' };
}
// claude-version-check 훅이 남긴 기록(<데이터>/state/claude-version.json)의 한 줄 요약 — 훅이 없거나 기록이 없으면 null
function claudeVersionSummary() {
  try { return require(path.join(paths.harnessRoot, 'hooks', 'claude-version-check.js')).readClaudeVersionState(paths.stateDir).summary || null; } catch { return null; }
}
function fail(msg) { process.stderr.write(msg + '\n'); process.exit(1); }
function loadManifest() {
  try { return JSON.parse(fs.readFileSync(paths.manifestPath, 'utf8')); }
  catch (e) { return fail(`[gugbab] manifest.json 을 읽지 못했습니다 (${paths.manifestPath}): ${e.message}`); }
}
function context() {
  const manifest = loadManifest();
  const project = resolveProject(process.cwd(), paths.dataDir);
  const resolved = resolve(manifest, loadLayers(paths, project));
  return { manifest, project, resolved };
}
function report(lines) {
  const uniq = [...new Set(lines)];
  if (!uniq.length) return;
  const shown = uniq.slice(0, 8).map(l => `[gugbab] ${l}`);
  if (uniq.length > 8) shown.push(`[gugbab] …외 ${uniq.length - 8}개 — gugbab-claude status`);
  process.stderr.write(shown.join('\n') + '\n');
}

function prepare(withUpdate) {
  if (withUpdate) {
    const ch = readChannel({ codeHome: paths.codeHome, stateDir: paths.stateDir });
    try {
      const r = checkUpdate({ codeHome: paths.codeHome, stateDir: paths.stateDir, ...channelOf(ch), dev: paths.dev, pin: typeof ch.pin === 'string' ? ch.pin : null });
      if (r.message) process.stderr.write(r.message + '\n');
    } catch (e) { process.stderr.write(`[gugbab] 업데이트 확인 실패(무시): ${e.message}\n`); }
  }
  const { manifest, project, resolved } = context();
  const r = compose({ manifest, paths, project, resolved });
  report([
    ...resolved.warnings,
    ...r.warnings,
    ...resolved.refused.map(x => `🔒 고정이라 끄지 못함: ${x.id} (${x.source})`),
    ...resolved.unknown.map(x => `모르는 이름 무시: ${x}`),
  ]);
  return project;
}

// 층 하나를 고치고 결과를 알린다 — 안 바뀌었으면 왜 그런지(고정·위쪽 층·의존)를 같이
function changeAndReport({ manifest, project, all, ids, action, mutate, title }) {
  const scope = all ? 'profile' : 'project';
  let r;
  try { r = commitLayer({ manifest, paths, project, scope, mutate }); } catch (e) { fail(`[gugbab] ${e.message}`); }
  const lines = [`[gugbab] ${title ? `${title} → ` : ''}${all ? '모든 프로젝트' : `이 프로젝트(${project.id})`}에 기록했습니다`];
  if (r.turnedOn.length) lines.push(`  켬: ${r.turnedOn.join(', ')}`);
  if (r.turnedOff.length) lines.push(`  끔: ${r.turnedOff.join(', ')}`);
  const why = explainUnchanged(ids, action, r.layers, r.after, layerIndex(scope), manifest);
  if (!r.turnedOn.length && !r.turnedOff.length) lines.push('  바뀐 항목 없음');
  if (!(why.length === 1 && why[0] === '이미 그 상태입니다') || (!r.turnedOn.length && !r.turnedOff.length)) {
    for (const w of why.slice(0, 6)) lines.push(`  · ${w}`);
    if (why.length > 6) lines.push(`  · …외 ${why.length - 6}개`);
  }
  for (const wmsg of r.after.warnings) lines.push(`  ⚠ ${wmsg}`);
  lines.push(r.needRestart ? '  룰·에이전트·설정이 바뀌었습니다 — /exit 하면 래퍼가 대화를 이어서(--continue) 다시 시작합니다' : '  훅·스킬·커맨드는 바로 반영됩니다');
  process.stdout.write(lines.join('\n') + '\n');
}

switch (cmd) {
  case 'prepare': {
    const project = prepare(!args.includes('--no-update'));
    process.stdout.write(project.configDir + '\n');
    break;
  }
  case 'compose':
    prepare(false);
    break;
  case 'status': {
    const { manifest, project, resolved } = context();
    const version = require('./update').versionInfo({ codeHome: paths.codeHome, stateDir: paths.stateDir, dev: paths.dev });
    process.stdout.write(statusLines({ manifest, resolved, project, paths, skipped: readSkipped(project.configDir), version, claudeVersion: claudeVersionSummary() }).join('\n') + '\n');
    break;
  }
  case 'doctor': {
    const project = resolveProject(process.cwd(), paths.dataDir);
    const res = runDoctor({ paths, project });
    const icon = { ok: '✓', warn: '⚠', fail: '✗', info: '·' };
    process.stdout.write(res.map(x => `${icon[x.level]} ${x.msg}`).join('\n') + '\n');
    process.exit(res.some(x => x.level === 'fail') ? 1 : 0);
    break;
  }
  case 'update': {
    const ch = readChannel({ codeHome: paths.codeHome, stateDir: paths.stateDir });
    try { fs.rmSync(path.join(paths.stateDir, 'update-check.json'), { force: true }); } catch { /* 없음 */ }
    const r = checkUpdate({ codeHome: paths.codeHome, stateDir: paths.stateDir, ...channelOf(ch), dev: paths.dev, pin: null });
    process.stdout.write((r.message || `[gugbab] ${r.updated ? '갱신됨' : r.skipped === 'up-to-date' ? '이미 최신' : `건너뜀 (${r.skipped})`}`) + '\n');
    break;
  }
  case 'on':
  case 'off': {
    const id = args[1];
    const all = args.includes('--all');
    if (!id || id.startsWith('--')) fail('[gugbab] 켜거나 끌 항목을 적어 주세요 — 예: gugbab-claude off hook:cc-notify');
    const { manifest, project, resolved: before } = context();
    const ids = expand(id, manifest);
    if (!ids || !ids.length) fail(`[gugbab] 모르는 항목입니다: ${id} — gugbab-claude status 로 이름을 확인하세요`);
    if (cmd === 'off' && ids.every(i => before.locked.has(i))) fail(`[gugbab] 🔒 고정 항목이라 끌 수 없습니다: ${id}`);
    changeAndReport({ manifest, project, all, ids, action: cmd, mutate: (l) => applyToggle(l, cmd, id, manifest) });
    break;
  }
  case 'preset': {
    const name = args[1] && !args[1].startsWith('--') ? args[1] : null;
    const all = args.includes('--all');
    const manifest = loadManifest();
    const presets = (manifest.relations || {}).presets || {};
    if (!name) {
      const lines = ['프리셋 — gugbab-claude preset <이름> [--all] (블록·묶음을 한 번에 켬)'];
      for (const [n, p] of Object.entries(presets)) lines.push(`  ${n.padEnd(16)} ${p.title || ''}  (${(p.enable || []).join(', ')})`);
      process.stdout.write(lines.join('\n') + '\n');
      break;
    }
    if (!Object.prototype.hasOwnProperty.call(presets, name)) fail(`[gugbab] 모르는 프리셋입니다: ${name} — gugbab-claude preset 으로 목록 확인`);
    const project = resolveProject(process.cwd(), paths.dataDir);
    const ids = [...new Set(presets[name].enable.flatMap(g => expand(g, manifest) || []))];
    changeAndReport({ manifest, project, all, ids, action: 'on', mutate: (l) => applyPreset(l, name, manifest), title: `프리셋 ${name}` });
    break;
  }
  case 'harness': {
    const manifest = loadManifest();
    if (args.includes('--open')) {
      const { planLaunch, describePlan, launch, rootFromConfigDir } = require('./open');
      const root = rootFromConfigDir(process.env, paths.projectsDir) || resolveProject(process.cwd(), paths.dataDir).root;
      let plan;
      try { plan = planLaunch({ env: process.env, platform: process.platform, bin: path.join(paths.codeHome, 'bin', 'gugbab-claude'), root }); } catch (e) { fail(`[gugbab] ${e.message}`); }
      if (args.includes('--dry-run')) { process.stdout.write(`[${plan.kind}]\n${describePlan(plan)}\n`); break; }
      try { process.stdout.write(`[gugbab] ${launch(plan)}\n`); } catch (e) { fail(`[gugbab] ${e.message}`); }
      break;
    }
    if (!process.stdin.isTTY || !process.stdout.isTTY) fail('[gugbab] 켜기·끄기 화면은 터미널에서만 띄울 수 있습니다 — claude 안에서는 /harness (= gugbab-claude harness --open)');
    const project = resolveProject(process.cwd(), paths.dataDir);
    const { runTui, summaryLines } = require('./tui');
    const session = args.includes('--session');
    runTui({ manifest, paths, project, holdOnExit: session })
      .then((r) => { if (!session) process.stdout.write(summaryLines(r).join('\n') + '\n'); process.exit(0); })
      .catch((e) => fail(`[gugbab] ${e.message}`));
    break;
  }
  case undefined:
  case 'help':
  case '--help':
    process.stdout.write(USAGE + '\n');
    break;
  default:
    fail(`[gugbab] 모르는 명령: ${cmd}\n${USAGE}`);
}
