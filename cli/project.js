// 프로젝트 판별 — 현재 폴더의 git 최상위(없으면 현재 폴더)가 프로젝트. 이름은 폴더 이름, 겹치면 경로 해시 4자를 붙인다
// 매핑: <dataDir>/projects/index.json  { "<실경로>": "<이름>" }
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { realpath, renameRetry } = require('./winfs');

// 설정 폴더 이름으로 써도 안전한 이름 — 영숫자·점·밑줄·하이픈만, 점으로 시작 금지, 64자
function safeName(s) {
  let n = String(s || '').replace(/[^A-Za-z0-9._-]/g, '-').replace(/^\.+/, '').slice(0, 64);
  if (!n || /^[.-]*$/.test(n) && n.includes('.')) n = 'project';
  return n || 'project';
}

// 윈도우는 실제 표기(.native)로 — JS realpath 는 입력 대소문자를 그대로 둬 `c:\a` 와 `C:\a` 가 다른 프로젝트가 된다 (2026-10-20 실측)
function projectRoot(cwd) {
  try {
    const top = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).trim();
    if (top) return realpath(top);
  } catch { /* git 아님 */ }
  try { return realpath(cwd); } catch { return path.resolve(cwd); }
}

function readIndex(file) {
  try {
    const v = JSON.parse(fs.readFileSync(file, 'utf8'));
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch { return {}; }
}

function resolveProject(cwd, dataDir) {
  const root = projectRoot(cwd);
  const projectsDir = path.join(dataDir, 'projects');
  const indexFile = path.join(projectsDir, 'index.json');
  const index = readIndex(indexFile);
  let id = typeof index[root] === 'string' ? safeName(index[root]) : null;
  if (!id || id !== index[root]) {
    const base = root === path.parse(root).root ? 'root' : safeName(path.basename(root));
    const taken = new Set(Object.entries(index).filter(([p]) => p !== root).map(([, v]) => v));
    id = taken.has(base) ? `${base}-${crypto.createHash('sha256').update(root).digest('hex').slice(0, 4)}` : base;
    index[root] = id;
    fs.mkdirSync(projectsDir, { recursive: true });
    const tmp = `${indexFile}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(index, null, 2) + '\n');
    renameRetry(tmp, indexFile);
  }
  const dir = path.join(projectsDir, id);
  return { root, id, dir, configDir: path.join(dir, '.claude'), settingsPath: path.join(dir, 'settings.json') };
}

module.exports = { resolveProject, projectRoot, safeName };
