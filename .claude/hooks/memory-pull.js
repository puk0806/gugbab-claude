'use strict';
// SessionStart: 전역 memory 디렉토리 보장 + 레포 → 전역 반영 (git 조작 없음)
//
// 1) 과거 symlink 구조(전역 → 레포)를 발견하면 실제 디렉토리로 마이그레이션
// 2) 레포 memory/ 파일이 전역에 없거나 내용이 다르면서 더 최신이면 전역으로 복사
//    (다른 데스크탑에서 push한 내용을 git pull 받은 뒤 세션을 시작하면 전역에 반영됨)
// 커밋·푸시·pull은 전부 사용자가 직접 수행한다.
const os = require('os');
const fs = require('fs');
const path = require('path');

const projectDir = process.env.CLAUDE_PROJECT_DIR;
if (!projectDir) process.exit(0);

// 전역 저장소 경로: 훅 입력 transcript_path 의 디렉토리(실제 저장소) 우선, 없으면 Claude Code 인코딩 규칙.
// 인코딩·검증 로직은 session-export.js 의 공통 함수 하나로 통일 (2026-09-26 — 구 규칙은 / _ 만 치환해
// 점·공백·비ASCII 경로에서 엉뚱한 전역 디렉토리를 만들었다). session-export.js 는 공통 훅이라 항상 설치된다.
let projectStoreDir;
try { ({ projectStoreDir } = require('./session-export.js')); } catch { process.exit(0); }
let hookInput = {};
try { hookInput = JSON.parse(fs.readFileSync(0, 'utf8') || '{}') || {}; } catch { hookInput = {}; }
const repoMemory = path.join(projectDir, 'memory');
const storeDir = projectStoreDir(os.homedir(), projectDir, hookInput && hookInput.transcript_path);
if (!storeDir) process.exit(0);
const globalMemory = path.join(storeDir, 'memory');

try {
  // ── 1단계: 전역 memory를 실제 디렉토리로 보장 (symlink 마이그레이션) ──
  let stat = null;
  try { stat = fs.lstatSync(globalMemory); } catch {}

  if (stat && stat.isSymbolicLink()) {
    fs.unlinkSync(globalMemory);
    stat = null;
  }
  if (!stat) fs.mkdirSync(globalMemory, { recursive: true });

  // ── 2단계: 레포 memory/ → 전역 반영 ──
  if (fs.existsSync(repoMemory)) {
    for (const name of fs.readdirSync(repoMemory)) {
      // 항목 하나(깨진 symlink 등)의 오류가 나머지 파일 동기화를 막지 않도록 격리
      try {
        const src = path.join(repoMemory, name);
        const dst = path.join(globalMemory, name);
        if (!fs.statSync(src).isFile()) continue;

        let copy = false;
        if (!fs.existsSync(dst)) {
          copy = true; // 전역에 없음 (fresh clone / 새 파일)
        } else {
          const differs = fs.readFileSync(src, 'utf8') !== fs.readFileSync(dst, 'utf8');
          // 내용이 다르고 레포 쪽이 최신이면 (git pull 직후) 전역 갱신
          copy = differs && fs.statSync(src).mtimeMs > fs.statSync(dst).mtimeMs;
        }
        if (copy) fs.copyFileSync(src, dst);
      } catch {
        // 개별 항목 오류는 건너뛰고 계속 진행
      }
    }
  }
} catch {
  // 세션 시작 절대 차단 금지
}
process.exit(0);
