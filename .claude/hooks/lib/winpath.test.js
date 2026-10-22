#!/usr/bin/env node
/**
 * winpath.test.js
 * 실행: node .claude/hooks/lib/winpath.test.js
 *
 * 3계층: 정상(윈도우 세 가지 경로 모양 → 같은 비교값, 맥은 그대로)
 *        / 악성·우회(접두만 같은 형제 폴더, 대소문자·MSYS 표기로 허용 폴더 밖을 안으로 위장, `..` 섞기)
 *        / 이상·경계(빈 값·비문자열·드라이브 루트·UNC·끝 슬래시)
 * 플랫폼 인자를 직접 넘겨 맥·윈도우 어디서 돌려도 같은 결과를 본다
 */
const { toSlash, msysToWin, normPath, isAbs, isUnder, samePath } = require('./winpath')

let passed = 0, failed = 0
function eq(desc, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  console.log(`  ${ok ? '✅' : '❌'} ${desc}${ok ? '' : ` → FAIL (기대 ${JSON.stringify(want)}, 실제 ${JSON.stringify(got)})`}`)
  ok ? passed++ : failed++
}
const W = true, P = false

console.log('\n[정상]')
eq('toSlash 윈도우', toSlash('C:\\Users\\x\\a.js', W), 'C:/Users/x/a.js')
eq('toSlash 맥은 그대로(\\ 는 파일명 글자)', toSlash('/a/b\\c', P), '/a/b\\c')
eq('msysToWin /c/Users', msysToWin('/c/Users/x', W), 'C:/Users/x')
eq('msysToWin 드라이브만', msysToWin('/d', W), 'D:/')
eq('msysToWin 맥은 그대로', msysToWin('/c/Users/x', P), '/c/Users/x')
eq('normPath 세 모양이 같은 값', [normPath('C:\\Users\\X', W), normPath('c:/users/x', W), normPath('/c/Users/x', W)], ['c:/users/x', 'c:/users/x', 'c:/users/x'])
eq('isUnder 네이티브 ⊂ 슬래시', isUnder('C:\\proj\\src\\a.ts', 'C:/proj', W), true)
eq('isUnder MSYS ⊂ 네이티브', isUnder('/c/proj/src', 'C:\\proj', W), true)
eq('isUnder 맥', isUnder('/Users/a/p/x', '/Users/a/p', P), true)
eq('samePath 드라이브 대소문자', samePath('c:\\Proj', 'C:/proj/', W), true)
eq('isAbs 윈도우 세 모양', [isAbs('C:\\a', W), isAbs('C:/a', W), isAbs('/c/a', W)], [true, true, true])

console.log('\n[악성·우회]')
eq('접두만 같은 형제 폴더는 아래가 아님', isUnder('C:\\proj-evil\\a', 'C:\\proj', W), false)
eq('맥 접두 형제', isUnder('/a/bc', '/a/b', P), false)
eq('맥에서 대소문자 다르면 다른 경로(POSIX 규칙)', samePath('/A/b', '/a/b', P), false)
eq('다른 드라이브는 아래가 아님', isUnder('D:\\proj\\a', 'C:\\proj', W), false)
eq('MSYS 다른 드라이브', isUnder('/d/proj', 'C:/proj', W), false)
eq('/tmp 같은 MSYS 비드라이브 경로는 변환하지 않음', msysToWin('/tmp/x', W), '/tmp/x')
eq('두 글자 폴더(/cd/x)는 드라이브가 아님', msysToWin('/cd/x', W), '/cd/x')
// `..` 섞기 — 글자로는 허용 폴더로 시작하지만 실제로는 밖 (2026-10-22 맥 회귀 검토에서 찾은 구멍)
eq('`..` 로 빠져나간 경로는 아래가 아님 (윈도우)', isUnder('C:/proj/../evil', 'C:/proj', W), false)
eq('`..` 네이티브·MSYS 표기도 같음', [isUnder('C:\\proj\\..\\evil\\a', 'C:\\proj', W), isUnder('/c/proj/../evil', 'C:/proj', W)], [false, false])
eq('`..` 로 빠져나간 경로는 아래가 아님 (맥)', isUnder('/Users/a/p/../q/x', '/Users/a/p', P), false)
eq('`..` 를 여러 번 겹쳐 루트 위로 — 루트에서 멈춤', [normPath('C:/proj/../../..', W), normPath('/a/../../..', P)], ['c:/', '/'])
eq('부모 쪽에 `..` 를 넣어 범위를 넓히는 것도 정리됨', isUnder('C:/Windows/x', 'C:/proj/..', W), true)
eq('UNC 공유 위로는 못 올라감', [normPath('\\\\srv\\share\\x\\..\\..', W), isUnder('//srv/share/../other', '//srv/share', W)], ['//srv/share', true])
eq('같은 폴더 안 `..` 는 그대로 아래', [isUnder('C:/proj/src/../a', 'C:/proj', W), isUnder('/a/b/c/../d', '/a/b', P)], [true, true])
eq('`.`·겹친 슬래시 정리', [normPath('C:/proj/./x//y/', W), normPath('/a/./b//c/', P)], ['c:/proj/x/y', '/a/b/c'])
eq('맥에서 `//a` 는 UNC 가 아님', normPath('//a/b', P), '/a/b')

console.log('\n[이상·경계]')
eq('빈 값', [toSlash('', W), msysToWin('', W), normPath('', W), isAbs('', W)], ['', '', '', false])
eq('비문자열', [toSlash(null, W), normPath(undefined, W), isAbs(42, W), isUnder(null, 'C:/', W), samePath(null, null, W)], ['', '', false, false, false])
eq('드라이브 루트 끝 슬래시 유지', normPath('C:\\', W), 'c:/')
eq('드라이브 루트 아래', isUnder('C:\\Windows', 'C:\\', W), true)
eq('UNC 절대', isAbs('\\\\server\\share\\x', W), true)
eq('상대 경로는 절대 아님', [isAbs('a\\b', W), isAbs('a/b', P)], [false, false])
eq('맥 루트', normPath('/', P), '/')
eq('상대 경로 `..` 는 앞에 남김(위로 갈 곳을 모름)', [normPath('a/../../b', P), normPath('..', P), normPath('.', P)], ['../b', '..', '.'])
eq('`..` 이름이 들어간 폴더(`a..b`)는 건드리지 않음', normPath('/x/a..b/c', P), '/x/a..b/c')

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 전체 통과')
