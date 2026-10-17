// 적용 층 — 계획서 5.2 적용 순서 중 사용자가 바꾸는 세 곳
//   profile.json                       모든 프로젝트 (enable·disable)
//   <dataDir>/projects/<이름>/settings.json  연 프로젝트 (enable·disable)
//   <프로젝트>/.gugbab.json             git 으로 공유하는 프로젝트만 (lock·enable·disable)
// 고정(lock)은 .gugbab.json 에서만 받는다 — /harness 로 바뀌는 파일이 고정을 만들 수 없게
'use strict';
const fs = require('fs');
const path = require('path');

const MAX_BYTES = 1024 * 1024;

function readJsonObject(file) {
  try {
    const st = fs.statSync(file);
    if (!st.isFile() || st.size > MAX_BYTES) return {};
    const v = JSON.parse(fs.readFileSync(file, 'utf8'));
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch { return {}; }
}

function pick(obj, keys, source) {
  const out = { source };
  for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
}

// 프로젝트 안의 진짜 파일만 — 링크로 밖을 가리키면 읽지 않는다
function readProjectFile(root, name) {
  const file = path.join(root, name);
  try {
    const real = fs.realpathSync(file);
    const realRoot = fs.realpathSync(root);
    if (path.dirname(real) !== realRoot) return {};
  } catch { return {}; }
  return readJsonObject(file);
}

function loadLayers(paths, project) {
  return [
    pick(readJsonObject(paths.profilePath), ['enable', 'disable'], 'profile'),
    pick(readJsonObject(project.settingsPath), ['enable', 'disable'], 'project'),
    pick(readProjectFile(project.root, '.gugbab.json'), ['lock', 'enable', 'disable'], '.gugbab.json'),
  ];
}

function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2) + '\n');
  fs.renameSync(tmp, file);
}

// 조립 기록(.gugbab-state.json) — 프로젝트 자체 .claude 가 이미 가져서 래퍼가 건너뛴 훅·항목 (결정 22)
function readSkipped(configDir) {
  const st = readJsonObject(path.join(configDir, '.gugbab-state.json'));
  const list = (v) => (Array.isArray(v) ? v.filter(x => typeof x === 'string') : []);
  return new Set([...list(st.skippedHooks), ...list(st.skippedItems)]);
}

module.exports = { loadLayers, readJsonObject, readProjectFile, readSkipped, writeJson };
