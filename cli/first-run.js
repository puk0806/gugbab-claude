// 처음 실행 — 프로젝트(git 최상위 폴더)에서 gugbab-claude 를 처음 띄울 때 기본으로 켤 프리셋을 고른다 (계획서 결정 31)
//   프로젝트 파일로 스택을 감지해 추천하고, 번호로 고르면(여러 개는 쉼표, Enter = 추천, 0 = 안 고름) 이 프로젝트 설정에 적용한다
//   한 번 물으면 프로젝트 설정에 firstRun 을 남겨 다시 묻지 않는다. 터미널이 아니거나 -p 이거나 이미 설정이 있으면 묻지 않는다
//   .gugbab.json 이 있어 묻지 않을 때는 그 사실을 한 번만 알린다(noticeSkipOnce)
'use strict';
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { applyPreset, commitLayer } = require('./apply');

const MAX_FILE = 1024 * 1024;
const MAX_TRIES = 3;

// 프로젝트 안의 일반 파일만 — 링크·폴더·너무 큰 파일은 읽지 않는다
function safeRead(file) {
  try {
    const st = fs.lstatSync(file);
    if (!st.isFile() || st.size > MAX_FILE) return null;
    return fs.readFileSync(file, 'utf8');
  } catch { return null; }
}

function detectStack(root) {
  const suggest = [];
  const reasons = [];
  const add = (preset, why) => { if (!suggest.includes(preset)) { suggest.push(preset); reasons.push(why); } };
  const pkg = safeRead(path.join(root, 'package.json'));
  if (pkg) {
    try {
      const j = JSON.parse(pkg);
      const deps = { ...(j && j.dependencies), ...(j && j.devDependencies) };
      if (deps.next) add('nextjs', 'package.json 에 next');
      else if (deps.react) add('nextjs', 'package.json 에 react');
    } catch { /* 깨진 package.json 무시 */ }
  }
  const java = safeRead(path.join(root, 'pom.xml')) || safeRead(path.join(root, 'build.gradle')) || safeRead(path.join(root, 'build.gradle.kts'));
  if (java) {
    const m = java.match(/spring-boot-starter-parent<\/artifactId>\s*<version>(\d+)\./) || java.match(/org\.springframework\.boot['"]?\)?\s*version\s*['"](\d+)\./);
    if (m && Number(m[1]) >= 3) add('java-modern', `Spring Boot ${m[1]}.x`);
    else add('java-legacy', m ? `Spring Boot ${m[1]}.x` : 'Java 빌드 파일(pom.xml·build.gradle)');
  }
  if (safeRead(path.join(root, 'Cargo.toml')) !== null) add('rust', 'Cargo.toml');
  if (safeRead(path.join(root, 'pyproject.toml')) !== null || safeRead(path.join(root, 'requirements.txt')) !== null) add('python', 'pyproject.toml·requirements.txt');
  if (safeRead(path.join(root, 'ProjectSettings', 'ProjectVersion.txt')) !== null) add('unity', 'Unity ProjectSettings');
  return { suggest, reasons };
}

const presetsOf = (manifest) => Object.keys(((manifest && manifest.relations) || {}).presets || {});

function shouldAsk({ project, argv = [], isTTY, env = process.env, manifest }) {
  if (!isTTY) return { ask: false, reason: '터미널 아님' };
  if (argv.some((a) => a === '-p' || a === '--print')) return { ask: false, reason: '한 번 실행(-p)' };
  if (env.GUGBAB_NO_FIRST_RUN) return { ask: false, reason: 'GUGBAB_NO_FIRST_RUN' };
  try { fs.lstatSync(project.settingsPath); return { ask: false, reason: '이미 이 프로젝트 설정이 있음' }; } catch { /* 없음 */ }
  try { fs.lstatSync(path.join(project.root, '.gugbab.json')); return { ask: false, reason: '.gugbab.json 이 있음 (git 공유 설정)', notice: true }; } catch { /* 없음 */ }
  if (!presetsOf(manifest).length) return { ask: false, reason: '프리셋 없음' };
  return { ask: true, reason: '' };
}

// .gugbab.json 때문에 묻지 않을 때 한 번만 알린다 — 말없이 건너뛰면 "처음 실행인데 프리셋 질문이 안 나온다" 로 보인다 (2026-10-23 윈도우 보고)
//   표시 파일을 먼저 만들고('wx' — 이미 있거나 링크면 실패) 만든 경우에만 알린다. 못 만들면 매번 알리지 않도록 조용히 넘어간다
function noticeSkipOnce({ project, output = process.stdout }) {
  const mark = path.join(path.dirname(project.settingsPath), '.first-run-notice');
  try {
    fs.mkdirSync(path.dirname(mark), { recursive: true });
    fs.writeFileSync(mark, JSON.stringify({ reason: '.gugbab.json', at: new Date().toISOString() }) + '\n', { flag: 'wx' });
  } catch { return false; }
  output.write('[gugbab] 이 프로젝트에는 .gugbab.json(git 공유 설정)이 있어 프리셋을 묻지 않고 그 설정으로 시작합니다 — 바꾸려면 /harness 또는 gugbab-claude preset (이 안내는 한 번만)\n');
  return true;
}

function parseChoice(input, names, suggest = []) {
  const s = String(input == null ? '' : input).trim();
  if (s.length > 100) return { error: '입력이 너무 깁니다' };
  if (s === '') return { presets: suggest.filter((n) => names.includes(n)) };
  if (s === '0') return { presets: [] };
  if (!/^\d+(?:\s*,\s*\d+)*$/.test(s)) return { error: '번호와 쉼표만 쓸 수 있습니다' };
  const nums = s.split(',').map((x) => Number(x.trim()));
  if (nums.length > Math.min(10, names.length)) return { error: '너무 많이 골랐습니다' };
  const out = [];
  for (const n of nums) {
    if (!Number.isInteger(n) || n < 1 || n > names.length) return { error: `없는 번호입니다: ${n}` };
    if (!out.includes(names[n - 1])) out.push(names[n - 1]);
  }
  return { presets: out };
}

function promptText({ projectId, manifest, suggest = [], reasons = [] }) {
  const presets = ((manifest && manifest.relations) || {}).presets || {};
  const names = Object.keys(presets);
  const clean = (x) => String(x == null ? '' : x).replace(/[\u0000-\u001f\u007f-\u009f]/g, '');
  const lines = [`[gugbab] 이 프로젝트(${clean(projectId)})에서 처음 실행합니다 — 기본으로 켤 프리셋(스택별 스킬·에이전트 묶음)을 고르세요`];
  const sug = suggest.filter((n) => names.includes(n));
  if (sug.length) lines.push(`  감지: ${reasons.slice(0, sug.length).map(clean).join(', ')} → 추천 ${sug.join(' · ')}`);
  names.forEach((n, i) => {
    const t = clean(presets[n].title || '');
    lines.push(`  ${String(i + 1).padStart(2)}) ${n.padEnd(16)} ${t}${sug.includes(n) ? '  ★ 추천' : ''}`);
  });
  lines.push('   0) 고르지 않음 (기본값만 — 나중에 /harness 의 p 로 고를 수 있음)');
  lines.push(`번호를 입력하세요 (여러 개는 쉼표, 그냥 Enter = ${sug.length ? `추천(${sug.join(' · ')})` : '고르지 않음'}): `);
  return lines.join('\n');
}

function applyChoice({ manifest, paths, project, presets, composeFn }) {
  const at = new Date().toISOString();
  return commitLayer({
    manifest, paths, project, scope: 'project', composeFn,
    mutate: (cur) => {
      let l = cur;
      for (const p of presets) l = applyPreset(l, p, manifest);
      return { ...l, firstRun: { presets: [...presets], at } };
    },
  });
}

function runFirstRun({ manifest, paths, project, input = process.stdin, output = process.stdout, composeFn }) {
  const names = presetsOf(manifest);
  const { suggest, reasons } = detectStack(project.root);
  output.write(promptText({ projectId: project.id, manifest, suggest, reasons }));
  return new Promise((resolveP) => {
    const rl = readline.createInterface({ input, terminal: false });
    let tries = 0;
    let done = false;
    const finish = (presets) => {
      if (done) return;
      done = true;
      rl.close();
      let r = { turnedOn: [] };
      try { r = applyChoice({ manifest, paths, project, presets, composeFn }); } catch (e) { output.write(`\n[gugbab] 프리셋 적용 실패(무시하고 시작): ${e.message}\n`); }
      output.write(presets.length
        ? `\n[gugbab] 프리셋 ${presets.join(' · ')} 를 이 프로젝트에 적용했습니다 (${r.turnedOn.length}개 켬) — 바꾸려면 /harness 또는 gugbab-claude preset\n`
        : '\n[gugbab] 프리셋을 고르지 않았습니다 — 기본값으로 시작합니다 (나중에 /harness 의 p 로 고를 수 있음)\n');
      resolveP({ presets, turnedOn: r.turnedOn });
    };
    rl.on('line', (line) => {
      if (done) return;
      const c = parseChoice(line, names, suggest);
      if (!c.error) return finish(c.presets);
      tries++;
      if (tries >= MAX_TRIES) { output.write(`\n[gugbab] ${c.error}\n`); return finish([]); }
      output.write(`[gugbab] ${c.error} — 다시 입력하세요: `);
    });
    rl.on('close', () => finish([])); // 입력이 끝나면(EOF·Ctrl-D) 고르지 않음
  });
}

module.exports = { detectStack, shouldAsk, noticeSkipOnce, parseChoice, promptText, applyChoice, runFirstRun };
