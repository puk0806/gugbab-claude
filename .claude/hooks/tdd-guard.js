// PostToolUse Write|Edit — 소스 파일 수정 시 대응 테스트 파일 존재 여부 검사 (경고만, 차단 안 함)
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
    filePath.includes('.claude/commands')
  ) {
    process.exit(0);
  }

  const testPatterns = [
    path.join(dir, `${basename}.test${ext}`),
    path.join(dir, `${basename}.spec${ext}`),
    path.join(dir, '__tests__', `${basename}.test${ext}`),
    path.join(path.dirname(dir), '__tests__', `${basename}.test${ext}`),
  ];

  const hasTest = testPatterns.some(p => {
    try { return fs.existsSync(p); } catch { return false; }
  });

  if (!hasTest) {
    process.stderr.write(`[tdd-guard] ⚠️  테스트 없음: ${path.relative(process.cwd(), filePath)}\n`);
    process.stderr.write(`[tdd-guard] 권장: ${basename}.test${ext} 작성\n`);
  }
} catch {}

process.exit(0);
