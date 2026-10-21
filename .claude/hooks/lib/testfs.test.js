#!/usr/bin/env node
/**
 * testfs.test.js
 * 실행: node .claude/hooks/lib/testfs.test.js
 *
 * 3계층: 정상(폴더 링크가 만들어지고 그 안이 읽힘) / 악성·우회(링크가 밖을 가리켜도 realpath 로 실제 위치가 드러남)
 *        / 이상·경계(없는 목표·이미 있는 자리·윈도우에서 못 쓰는 파일명)
 */
const fs = require('fs')
const os = require('os')
const path = require('path')
const { IS_WIN, linkDir, trySymlink, nameAllowed } = require('./testfs')

let passed = 0, failed = 0
function check(desc, cond, detail) {
  console.log(`  ${cond ? '✅' : '❌'} ${desc}${cond ? '' : ` → FAIL ${detail === undefined ? '' : JSON.stringify(detail)}`}`)
  cond ? passed++ : failed++
}
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'testfs-'))
try {
  const src = path.join(dir, 'src'); fs.mkdirSync(src); fs.writeFileSync(path.join(src, 'a.txt'), 'A')

  console.log('\n[정상]')
  const kind = linkDir(src, path.join(dir, 'ln'))
  check('폴더 링크 종류', kind === (IS_WIN ? 'junction' : 'symlink'), kind)
  check('링크로 안의 파일이 읽힘', fs.readFileSync(path.join(dir, 'ln', 'a.txt'), 'utf8') === 'A')
  check('lstat 이 링크로 봄', fs.lstatSync(path.join(dir, 'ln')).isSymbolicLink())

  console.log('\n[악성·우회]')
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'testfs-out-'))
  linkDir(outside, path.join(dir, 'escape'))
  check('밖을 가리키는 링크의 실제 위치가 realpath 로 드러남', fs.realpathSync(path.join(dir, 'escape')).toLowerCase() === fs.realpathSync(outside).toLowerCase())
  fs.rmSync(path.join(dir, 'escape')); fs.rmSync(outside, { recursive: true, force: true })
  const r = trySymlink(path.join(src, 'a.txt'), path.join(dir, 'f-ln'), 'file')
  check('파일 링크 — 맥은 성공, 윈도우는 성공 또는 권한 부족(null)', IS_WIN ? (r === true || r === null) : r === true, r)

  console.log('\n[이상·경계]')
  let threw = false
  try { linkDir(src, path.join(dir, 'ln')) } catch { threw = true }
  check('이미 있는 자리에 폴더 링크 → 오류', threw)
  threw = false
  try { trySymlink(path.join(src, 'a.txt'), path.join(dir, 'no-such-dir', 'x'), 'file') } catch { threw = true }
  check('부모 폴더가 없으면 권한 문제가 아니므로 오류를 던짐', threw || IS_WIN)
  check('윈도우 금지 문자 파일명', nameAllowed('a"b.py') === !IS_WIN && nameAllowed('a<b') === !IS_WIN)
  check('보통 파일명·한글·공백은 허용', nameAllowed('한글 파일.ts') && nameAllowed('my file.js'))
} finally {
  fs.rmSync(dir, { recursive: true, force: true })
}
console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 전체 통과')
