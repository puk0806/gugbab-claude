// verification-gate.js — Stop (개발 전용)
// 소스 파일이 수정됐는데 테스트 파일 변경이 없으면 경고만 출력 (차단 안 함)
const path = require('path')
const { run } = require(path.join(__dirname, '_lib.js'))

try {
  // 스테이징됐거나 unstaged인 변경 파일 모두 확인
  const stagedRaw   = run('git diff --cached --name-only')
  const unstagedRaw = run('git diff --name-only')
  const changed = [...new Set([
    ...stagedRaw.split('\n'),
    ...unstagedRaw.split('\n'),
  ])].filter(Boolean)

  if (changed.length === 0) process.exit(0)

  const SRC_RE  = /\.(ts|tsx|js|jsx|rs|java|py|go|cs|swift|kt)$/
  const TEST_RE = /(\.(test|spec)\.(ts|tsx|js|jsx)|__tests__\/|Tests?\.(rs|java)|test_[^/]+\.py|_test\.(go|py|rs))$/

  const srcFiles  = changed.filter(f => SRC_RE.test(f) && !TEST_RE.test(f))
  const testFiles = changed.filter(f => TEST_RE.test(f))

  if (srcFiles.length > 0 && testFiles.length === 0) {
    process.stderr.write('[verification-gate] 경고: 소스 파일이 수정됐지만 테스트 파일 변경이 없습니다\n')
    srcFiles.slice(0, 5).forEach(f => process.stderr.write(`  - ${f}\n`))
    if (srcFiles.length > 5) process.stderr.write(`  ... 외 ${srcFiles.length - 5}개\n`)
    process.stderr.write('  → 관련 테스트 파일도 함께 업데이트하세요\n')
  }
} catch {}

process.exit(0)
