// PostToolUse Write|Edit — 소스 파일 수정 시 대응 테스트 파일 존재 여부 검사 (없으면 차단)
const fs = require('fs');
const path = require('path');

try {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  const filePath = input.tool_input?.file_path || input.tool_input?.path;
  if (!filePath) process.exit(0);

  const ext = path.extname(filePath);
  const sourceExts = ['.ts', '.tsx', '.js', '.jsx', '.py', '.rs'];
  if (!sourceExts.includes(ext)) process.exit(0);

  const basename = path.basename(filePath, ext);
  const dir = path.dirname(filePath);

  // 테스트 파일 자체, 설정 파일, 훅 파일은 건너뜀
  if (
    basename.includes('.test') ||
    basename.includes('.spec') ||
    basename.includes('_test') ||
    filePath.includes('__tests__') ||
    filePath.includes('.claude/hooks') ||
    filePath.includes('.claude/commands') ||
    /(?:^|\/)scripts\//.test(filePath) ||
    // *.config.ts / *.config.js / *.config.mjs 등 순수 설정 파일
    /\.config\.[a-z]+$/.test(path.basename(filePath)) ||
    // Service Worker (브라우저 환경 의존, 단위 테스트 불가)
    basename === 'sw' ||
    // DB 커넥션 셋업 (통합 테스트로만 검증 가능)
    /(?:^|\/)lib\/db\//.test(filePath)
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
