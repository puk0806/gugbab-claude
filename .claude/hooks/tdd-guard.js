// PostToolUse Write|Edit — 소스 파일 수정 시 대응 테스트 파일 존재 여부 검사 (없으면 차단)
const fs = require('fs');
const path = require('path');

// 프로젝트 밖 파일에는 발동하지 않는다 — 코드 품질/테스트 강제 훅은 CLAUDE_PROJECT_DIR(없으면 cwd)
// 하위 산출물에만 적용한다. symlink·`..`·대소문자(macOS)·상대경로·루트 접두 충돌까지 realpath로 정규화한다.
function realCanonical(p) {
  try { return fs.realpathSync(p); } catch {}
  try { return path.join(fs.realpathSync(path.dirname(p)), path.basename(p)); } catch {}
  return path.resolve(p);
}
function resolveProjectRoot(baseCwd) {
  let raw = process.env.CLAUDE_PROJECT_DIR || baseCwd || process.cwd();
  // 윈도우 — Git Bash 표기(/c/…)면 C:/… 로 (그대로 두면 모든 파일이 "프로젝트 밖"이 되어 검사가 꺼진다, 2026-10-20 실측)
  if (process.platform === 'win32') { const m = /^\/([a-zA-Z])(\/.*)?$/.exec(raw); if (m) raw = `${m[1].toUpperCase()}:${m[2] || '/'}`; }
  return realCanonical(raw);
}
// realpath는 symlink만 풀 뿐 대소문자를 온디스크 표기로 정규화하지 않는다(실측 확인) —
// macOS(APFS 기본: 대소문자 구분 없음)·Windows 대비 darwin/win32에서는 비교 직전 소문자로 접어
// 대소문자만 다른 CLAUDE_PROJECT_DIR도 같은 디렉토리로 인식하게 한다.
const CASE_INSENSITIVE_FS = process.platform === 'darwin' || process.platform === 'win32';
function isInsideProject(targetPath, baseCwd) {
  if (!targetPath) return false;
  const base = baseCwd || process.cwd();
  const abs = path.isAbsolute(targetPath) ? targetPath : path.resolve(base, targetPath);
  const real = realCanonical(abs);
  const root = resolveProjectRoot(baseCwd);
  const foldedReal = CASE_INSENSITIVE_FS ? real.toLowerCase() : real;
  const foldedRoot = CASE_INSENSITIVE_FS ? root.toLowerCase() : root;
  const rel = path.relative(foldedRoot, foldedReal);
  return rel === '' || (rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel));
}

try {
  const input = JSON.parse(fs.readFileSync(0, 'utf8')); // fd 0 — '/dev/stdin' 은 윈도우에 없다
  const filePath = input.tool_input?.file_path || input.tool_input?.path;
  if (!filePath) process.exit(0);
  if (!isInsideProject(filePath, input.cwd)) process.exit(0);

  const ext = path.extname(filePath);
  const sourceExts = ['.ts', '.tsx', '.js', '.jsx', '.py', '.rs'];
  if (!sourceExts.includes(ext)) process.exit(0);

  const basename = path.basename(filePath, ext);
  const dir = path.dirname(filePath);

  // 테스트 파일 자체, 설정 파일, 훅 파일은 건너뜀
  // 윈도우는 file_path 가 `.claude\hooks\…` — 슬래시로 바꿔 판정한다 (2026-10-20 윈도우 PC 실측: 훅·scripts 수정마다 오탐 차단)
  const slashPath = process.platform === 'win32' ? filePath.replace(/\\/g, '/') : filePath;
  if (
    basename.includes('.test') ||
    basename.includes('.spec') ||
    basename.includes('_test') ||
    slashPath.includes('__tests__') ||
    slashPath.includes('.claude/hooks') ||
    slashPath.includes('.claude/commands') ||
    /(?:^|\/)scripts\//.test(slashPath) ||
    // *.config.ts / *.config.js / *.config.mjs 등 순수 설정 파일
    /\.config\.[a-z]+$/.test(path.basename(filePath)) ||
    // Service Worker (브라우저 환경 의존, 단위 테스트 불가)
    basename === 'sw' ||
    // DB 커넥션 셋업 (통합 테스트로만 검증 가능)
    /(?:^|\/)lib\/db\//.test(slashPath)
  ) {
    process.exit(0);
  }

  // 테스트 파일은 소스와 확장자가 다를 수 있음 (예: .ts 훅 소스 + renderHook용 .test.tsx)
  const crossExts = {
    '.ts': ['.ts', '.tsx'],
    '.tsx': ['.tsx', '.ts'],
    '.js': ['.js', '.jsx'],
    '.jsx': ['.jsx', '.js'],
  };
  const testExts = crossExts[ext] || [ext];

  const testPatterns = testExts.flatMap(testExt => [
    path.join(dir, `${basename}.test${testExt}`),
    path.join(dir, `${basename}.spec${testExt}`),
    path.join(dir, '__tests__', `${basename}.test${testExt}`),
    path.join(dir, '__tests__', `${basename}.spec${testExt}`),
    path.join(path.dirname(dir), '__tests__', `${basename}.test${testExt}`),
    path.join(path.dirname(dir), '__tests__', `${basename}.spec${testExt}`),
  ]);

  const hasTest = testPatterns.some(p => {
    try { return fs.existsSync(p); } catch { return false; }
  });

  if (!hasTest) {
    // exit 2 차단 시 모델에 전달되는 메시지는 stderr (stdout은 유실됨)
    process.stderr.write(
      `[tdd-guard] 테스트 파일 없음: ${path.relative(process.cwd(), filePath)}\n` +
      `즉시 생성하세요: ${basename}.test${ext}` +
      (testExts.length > 1 ? ` (또는 ${basename}.test${testExts[1]})` : '') +
      `\n`
    );
    process.exit(2);
  }
} catch {}

process.exit(0);
