// doctor — 설치·조립 상태 점검 (계획서 4장 부가 명령)
// 외부 명령(claude·security·comux)은 exec 로 주입해 시험한다
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const defaultExec = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 10000 }).trim();
const realOr = (p) => { try { return fs.realpathSync(p); } catch { return null; } };

function runDoctor({ paths, project, exec = defaultExec, env = process.env, platform = process.platform, nodeVersion = process.version }) {
  const out = [];
  const add = (key, level, msg) => out.push({ key, level, msg });

  const major = Number(String(nodeVersion).replace(/^v/, '').split('.')[0]);
  add('node', major >= 18 ? 'ok' : 'fail', `node ${nodeVersion}${major >= 18 ? '' : ' — 18 이상이 필요합니다'}`);

  try { add('claude', 'ok', `claude ${exec('claude', ['--version'])}`); } catch { add('claude', 'fail', 'claude 를 찾지 못했습니다 — Claude Code 설치 필요'); }

  let manifest = null;
  try { manifest = JSON.parse(fs.readFileSync(paths.manifestPath, 'utf8')); } catch { add('manifest', 'fail', `manifest.json 을 읽지 못했습니다 (${paths.manifestPath})`); }
  if (manifest) {
    const missing = Object.entries(manifest.items || {}).filter(([, it]) => {
      if (!it.path) return false;
      const p = path.join(paths.codeHome, it.path, it.type === 'skill' ? 'SKILL.md' : '');
      return !fs.existsSync(p);
    }).map(([id]) => id);
    add('manifest', missing.length ? 'fail' : 'ok', missing.length ? `없는 파일을 가리키는 항목 ${missing.length}개: ${missing.slice(0, 10).join(', ')}` : `manifest 항목 ${Object.keys(manifest.items || {}).length}개`);
  }

  // 로그인 공유 — 기본 키체인 항목을 쓰게 하는 CLAUDE_SECURESTORAGE_CONFIG_DIR= 는 문서에 없는 내부 변수 (PoC 1)
  if (platform === 'darwin') {
    try {
      exec('security', ['find-generic-password', '-s', 'Claude Code-credentials']);
      add('login', 'ok', '기본 키체인 로그인 항목 있음 — 래퍼는 CLAUDE_SECURESTORAGE_CONFIG_DIR=(빈 값)으로 이 항목을 씁니다 (문서에 없는 내부 변수 — claude 업데이트 뒤 "Not logged in" 이면 이것부터 확인)');
    } catch { add('login', 'warn', '기본 키체인에 Claude Code 로그인 항목이 없습니다 — 먼저 `claude` 로 한 번 로그인하세요 (래퍼는 CLAUDE_SECURESTORAGE_CONFIG_DIR= 로 그 항목을 공유)'); }
  } else {
    add('login', 'info', `${platform}: 키체인 점검 건너뜀 — 로그인이 안 되면 CLAUDE_SECURESTORAGE_CONFIG_DIR 동작을 확인하세요`);
  }

  if (env.COPAD_MUX) add('mux', 'ok', 'comux 안에서 실행 중 (/harness 화면은 옆 창에 뜸)');
  else if (env.TMUX) add('mux', 'ok', 'tmux 안에서 실행 중 (/harness 화면은 팝업으로 뜸)');
  else add('mux', 'info', '일반 터미널 (/harness 화면은 macOS 면 새 터미널 창, 그 밖엔 실행할 명령 안내)');

  // 설정 폴더 링크 — 하네스 원본·~/.claude 밖이나 없는 곳을 가리키면 경고
  if (project && project.configDir && fs.existsSync(project.configDir)) {
    const realCode = realOr(paths.codeHome);
    const realClaude = realOr(path.join(paths.home || '', '.claude'));
    const bad = [];
    const scan = (dir, depth) => {
      let entries = [];
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isSymbolicLink()) {
          const real = realOr(p);
          const okHome = (base) => base && real && (real === base || real.startsWith(base + path.sep));
          if (!real || !(okHome(realCode) || okHome(realClaude))) bad.push(path.relative(project.configDir, p));
        } else if (e.isDirectory() && depth < 1 && !['projects', 'plugins', 'plans'].includes(e.name)) scan(p, depth + 1);
      }
    };
    scan(project.configDir, 0);
    add('links', bad.length ? 'warn' : 'ok', bad.length ? `깨졌거나 밖을 가리키는 링크 ${bad.length}개: ${bad.join(', ')}` : `설정 폴더 링크 정상 (${project.configDir})`);
  }

  try { fs.mkdirSync(paths.dataDir, { recursive: true }); fs.accessSync(paths.dataDir, fs.constants.W_OK); add('data', 'ok', `데이터 폴더 ${paths.dataDir}`); }
  catch { add('data', 'fail', `데이터 폴더에 쓸 수 없습니다: ${paths.dataDir}`); }
  return out;
}

module.exports = { runDoctor };
