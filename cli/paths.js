// 위치 계산 — 코드(하네스 원본)와 데이터(프로젝트별 설정·profile·로그)를 나눈다
//   codeHome : bin/gugbab-claude 가 있는 레포 (배포 = ~/gugbab, 개발 = 작업 트리)
//   dataDir  : GUGBAB_DATA > 개발 모드면 ~/.gugbab-dev > codeHome (계획서 2.1 — ~/gugbab/projects·profile.json)
//              개발 모드 데이터를 ~/gugbab 에 두면 나중에 설치(git clone ~/gugbab)가 "폴더 있음" 으로 막히므로 따로 둔다
'use strict';
const os = require('os');
const path = require('path');

function getPaths({ env = process.env, codeHome } = {}) {
  const home = env.HOME || os.homedir();
  const code = path.resolve(codeHome || env.GUGBAB_HOME || path.join(__dirname, '..'));
  const dev = env.GUGBAB_DEV === '1';
  const dataDir = env.GUGBAB_DATA ? path.resolve(env.GUGBAB_DATA) : dev ? path.join(home, '.gugbab-dev') : code;
  return {
    home,
    codeHome: code,
    harnessRoot: path.join(code, '.claude'), // 결정 19 — harness/ 이동 전
    manifestPath: path.join(code, 'manifest.json'),
    dev,
    dataDir,
    projectsDir: path.join(dataDir, 'projects'),
    profilePath: path.join(dataDir, 'profile.json'),
    logsDir: path.join(dataDir, 'logs'),
    stateDir: path.join(dataDir, 'state'),
    claudeHome: path.join(home, '.claude'),
  };
}

module.exports = { getPaths };
