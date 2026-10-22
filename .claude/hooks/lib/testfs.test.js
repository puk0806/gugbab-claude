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
  // 윈도우에서 권한이 없어 null 이면 "건너뜀" 이지만, 그때도 링크가 생기지 않았는지는 본다 (늘 통과하는 판정 금지 — 2026-10-22)
  const fln = path.join(dir, 'f-ln')
  const r = trySymlink(path.join(src, 'a.txt'), fln, 'file')
  if (r === true) check('파일 링크 성공 → 링크로 원본 내용이 읽힘', fs.lstatSync(fln).isSymbolicLink() && fs.readFileSync(fln, 'utf8') === 'A')
  else if (IS_WIN && r === null) { check('파일 링크 권한 부족(null) → 아무것도 만들지 않음', !fs.existsSync(fln)); console.log('  ⏭ 이 PC 는 파일 심볼릭 링크 권한이 없어 링크 읽기 시험은 건너뜀') }
  else check('파일 링크 결과는 true(성공) 또는 윈도우의 null 뿐', false, r)
  check('맥·리눅스는 파일 링크가 반드시 성공', IS_WIN || r === true, r)

  console.log('\n[이상·경계]')
  let threw = false
  try { linkDir(src, path.join(dir, 'ln')) } catch { threw = true }
  check('이미 있는 자리에 폴더 링크 → 오류', threw)
  // 부모 폴더가 없을 때: 권한 문제가 아니므로 던져야 한다. 단 윈도우는 권한 검사가 먼저라 null 이 올 수 있음 — 그때도 true(성공)는 안 됨
  let res, err = null
  try { res = trySymlink(path.join(src, 'a.txt'), path.join(dir, 'no-such-dir', 'x'), 'file') } catch (e) { err = e }
  check('부모 폴더가 없으면 오류(ENOENT)를 던지거나, 윈도우 권한 부족이면 null — 성공으로 보지 않음',
    (err && err.code === 'ENOENT') || (IS_WIN && res === null), err ? err.code : res)
  check('부모 폴더가 없는 자리에 아무것도 생기지 않음', !fs.existsSync(path.join(dir, 'no-such-dir')))
  check('윈도우 금지 문자 파일명', nameAllowed('a"b.py') === !IS_WIN && nameAllowed('a<b') === !IS_WIN)
  check('보통 파일명·한글·공백은 허용', nameAllowed('한글 파일.ts') && nameAllowed('my file.js'))
} finally {
  fs.rmSync(dir, { recursive: true, force: true })
}
console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 전체 통과')
