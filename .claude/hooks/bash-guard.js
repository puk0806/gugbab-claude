#!/usr/bin/env node
/**
 * bash-guard.js
 * Claude Code PreToolUse + PermissionRequest Hook
 *
 * 목적: Bash 명령어 안전 관리
 *
 * PreToolUse:
 *   - 위험한 Bash 패턴 → deny (정규식 + classifyShell 명령 단위 분류)
 *   - 사용자 확인 대상(commit/push/publish, 프로젝트 밖 rm, sudo, dd …) → ask
 *   - git reset --hard: 미푸시 커밋·커밋 안 한 작업만 지우면 자동, 푸시된 커밋을 지우면 deny (2026-10-06)
 *   - 정적 판정 불가(동적 명령명·파싱 실패) → null (allow 하지 않음)
 *   - 안전한 cd+git / heredoc / compound / script 패턴 → allow (Claude Code 하드코딩 휴리스틱 우회)
 *   - 그 외 → null (다른 훅에 위임)
 *   ※ 파이프·체인·$()·서브셸·bash -c·env/command 전치·git -C 등 우회 형태도 일반 형태와 동일 판정
 *
 * PermissionRequest:
 *   - PreToolUse 와 같은 분류기로 위험(deny/ask)·판정 불가 → null (사용자 확인)
 *   - 그 외 Bash → allow (읽기 전용·일반 개발 명령 프롬프트 마찰 제거)
 *   - Bash 외 도구 → null (auto-approve.js에 위임)
 *
 * 안전 패턴 자동 허용 — 경로 경계는 동적으로 감지:
 *   1. stdin JSON의 cwd 필드 (Claude Code 표준)
 *   2. CLAUDE_PROJECT_DIR 환경변수
 *   3. process.cwd()
 *   위 cwd에서 .git / .claude 상향 탐색해 프로젝트 루트 확정,
 *   추가 경계는 CLAUDE_BASH_GUARD_ALLOWED_DIRS 환경변수(콜론 구분)와
 *   .claude/settings.json 의 permissions.additionalDirectories로 지정 가능.
 */

const readline = require('readline')
const path = require('path')
const fs = require('fs')

// 보호 파일(verification.md / SKILL.md / memory/)은 Bash *쓰기 연산*만 차단
// 읽기 전용 사용(grep / diff / cat FILE / sed -n / awk 출력)은 허용 — 오탐 방지
// 쓰기 연산 판정: sed -i / perl -i / awk -i inplace / 리다이렉트(> >>) / tee
function buildProtectedWritePatterns() {
  const targets = [
    { re: 'verification\\.md', label: 'verification.md', hint: ' (verification-guard 훅 통과 필수)' },
    { re: 'SKILL\\.md', label: 'SKILL.md', hint: '' },
    { re: '\\bmemory\\/', label: 'memory/ 파일', hint: ' (memory-sync 자동 동기화)' },
  ]
  const patterns = []
  for (const { re, label, hint } of targets) {
    const reason = `${label}은(는) Bash 쓰기 연산으로 수정할 수 없습니다. Write/Edit 도구를 사용하세요${hint}. (읽기 전용 grep/diff/cat은 허용)`
    // in-place 편집: sed -i / perl -i (같은 statement 안에서만 매칭)
    patterns.push({ pattern: new RegExp(`\\bsed\\b[^|;&\\n]*\\s-[a-zA-Z]*i[a-zA-Z]*\\b[^|;&\\n]*${re}`), reason })
    patterns.push({ pattern: new RegExp(`\\bperl\\b[^|;&\\n]*\\s-[a-zA-Z]*i[^|;&\\n]*${re}`), reason })
    patterns.push({ pattern: new RegExp(`\\bawk\\b[^|;&\\n]*-i\\s*inplace[^|;&\\n]*${re}`), reason })
    // 리다이렉트로 덮어쓰기·이어쓰기: echo/cat/printf/sed/awk ... > FILE
    patterns.push({ pattern: new RegExp(`>>?\\s*\\S*${re}`), reason })
    // tee로 쓰기
    patterns.push({ pattern: new RegExp(`\\btee\\b\\s+(?:-a\\s+)?\\S*${re}`), reason })
  }
  return patterns
}

const DENY_PATTERNS = [
  ...buildProtectedWritePatterns(),
  // 위험 명령 패턴
  { pattern: /git\s+push\s+(--force|-f)\b/, reason: 'force push는 히스토리를 덮어씁니다. 직접 실행하세요.' },
  // (구 `git\s+push\s+.*-f\b` 는 `git push origin feature-f` 를 오탐해 제거 — 뒤쪽 -f·+refspec·전치 옵션은 classifyShell 이 토큰 단위로 판정)
  { pattern: /rm\s+-rf\s+\/(bin|boot|dev|etc|lib|lib64|proc|root|sbin|sys|usr|var)(\/|$|\s|$)/, reason: '시스템 디렉토리 삭제는 차단됩니다.' },
  { pattern: /rm\s+-rf\s+\/$/, reason: '루트 디렉토리 삭제는 차단됩니다.' },
  { pattern: /rm\s+-rf\s+\/\s/, reason: '루트 디렉토리 삭제는 차단됩니다.' },
  { pattern: /rm\s+-rf\s+\.\.\//, reason: '상위 디렉토리 삭제는 차단됩니다.' },
  // 구 careful-with-judge.js에서 흡수한 고위험 rm 패턴
  { pattern: /rm\s+-[a-zA-Z]*rf?[a-zA-Z]*\s+(~|\$HOME)\/?\s*$/, reason: '홈 디렉토리 삭제는 차단됩니다.' },
  { pattern: /rm\s+-[a-zA-Z]*rf?[a-zA-Z]*\s+\.\s*$/, reason: '현재 디렉토리 전체 삭제는 차단됩니다.' },
  { pattern: /rm\s+-[a-zA-Z]*rf?[a-zA-Z]*\s+\S*\.(git|claude|ssh)\/?\s*$/, reason: '.git / .claude / .ssh 디렉토리 삭제는 차단됩니다.' },
  { pattern: /curl\s+.*\|\s*(ba)?sh/, reason: '원격 스크립트 실행(curl|bash)은 차단됩니다.' },
  { pattern: /wget\s+.*\|\s*(ba)?sh/, reason: '원격 스크립트 실행(wget|bash)은 차단됩니다.' },
  { pattern: /chmod\s+777/, reason: '777 권한 설정은 보안 위험입니다.' },
  // (구 `git reset --hard HEAD~[2-9]` 정적 차단은 2026-10-06 제거 — 푸시 여부를 git 으로 확인하는 classifyGit 판정으로 대체)
  { pattern: /:\s*\(\)\s*\{.*:\|:.*\}/, reason: 'Fork bomb 패턴 감지. 차단합니다.' },
]

// 안전 패턴 자동 허용 — heredoc 출력에 허용되는 비실행 확장자
const SAFE_FILE_EXT = /\.(?:tsx?|jsx?|json|md|txt|css|scss|sass|less|html?|ya?ml|toml|env\.sample|gitignore|test\.\w+|spec\.\w+|d\.ts)$/i

// 안전 패턴 자동 허용 — heredoc 출력에 절대 쓰면 안 되는 경로
const HEREDOC_FORBIDDEN_PATHS = [
  /(?:^|\/)\.zshrc$/,
  /(?:^|\/)\.bashrc$/,
  /(?:^|\/)\.bash_profile$/,
  /(?:^|\/)\.profile$/,
  /(?:^|\/)\.envrc$/,
  /\/\.ssh\//,
  /(?:^|\/)crontab$/,
  /(?:^|\/)sudoers$/,
  /(?:^|\/)hosts$/,
  /(?:^|\/)\.npmrc$/,
  /\/\.git\/hooks\//,
  /\/etc\//,
]

// brace expansion 자동 허용 — 첫 단어가 이 목록에 있는 read-only 명령일 때만 허용
const SAFE_READONLY_COMMANDS = new Set([
  // 파일 시스템 조회
  'ls', 'll', 'find', 'stat', 'file', 'tree', 'pwd', 'realpath', 'readlink',
  // 컨텐츠 읽기
  'cat', 'head', 'tail', 'less', 'more',
  // 검색
  'grep', 'egrep', 'fgrep', 'rg', 'ack',
  // 카운팅·측정
  'wc', 'du', 'df',
  // 비교
  'diff', 'cmp',
  // 텍스트 처리 (단, sed -i 는 별도 차단)
  'sort', 'uniq', 'cut', 'tr', 'awk', 'sed',
  // 출력
  'echo', 'printf',
  // 메타
  'which', 'type', 'whoami', 'date', 'hostname', 'env',
  // xargs는 별도 처리 (다음 단어가 안전 명령일 때만 허용)
  'xargs',
])

// cd+git 컴파운드 안에서 위험 신호로 보는 패턴 (있으면 자동 허용 거부)
const CD_COMPOUND_DANGER = [
  /\b(?:bash|sh|zsh|eval|source|exec)\s+/,
  /curl\s.*\|\s*(?:ba)?sh\b/,
  /wget\s.*\|\s*(?:ba)?sh\b/,
  /\bgit\s+(?:push|commit|reset\s+--hard|clean\s+-[fdx]+|checkout\b)/,
  /\brm\s+-rf?\b/,
  /\bchmod\s+\+x\b/,
  />\s*~\/\.\w/,           // 홈 디렉토리 dotfile에 리다이렉트
  />\s*\/etc\//,            // /etc 리다이렉트
]

function existsSync(p) {
  try { fs.accessSync(p); return true } catch { return false }
}

// cwd에서 위로 올라가며 .git 또는 .claude 디렉토리를 찾아 프로젝트 루트로 사용
function findProjectRoot(startCwd) {
  if (!startCwd || typeof startCwd !== 'string') return null
  let dir
  try { dir = path.resolve(startCwd) } catch { return null }
  const root = path.parse(dir).root
  while (dir && dir !== root) {
    if (existsSync(path.join(dir, '.git')) || existsSync(path.join(dir, '.claude'))) {
      return dir
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

// 허용 경계 디렉토리 목록 — 우선순위: stdin.cwd 기반 프로젝트 루트 + env var + settings.json
function getAllowedDirs(stdinCwd) {
  const dirs = new Set()

  const cwd = stdinCwd || process.env.CLAUDE_PROJECT_DIR || process.cwd()
  const projectRoot = findProjectRoot(cwd) || cwd
  if (projectRoot) {
    try { dirs.add(path.resolve(projectRoot)) } catch { /* ignore */ }
  }

  if (process.env.CLAUDE_PROJECT_DIR) {
    try { dirs.add(path.resolve(process.env.CLAUDE_PROJECT_DIR)) } catch { /* ignore */ }
  }

  const envExtra = process.env.CLAUDE_BASH_GUARD_ALLOWED_DIRS
  if (envExtra) {
    envExtra.split(':').filter(Boolean).forEach(d => {
      try { dirs.add(path.resolve(d)) } catch { /* ignore */ }
    })
  }

  if (projectRoot) {
    try {
      const settingsPath = path.join(projectRoot, '.claude', 'settings.json')
      if (existsSync(settingsPath)) {
        const raw = fs.readFileSync(settingsPath, 'utf8')
        const settings = JSON.parse(raw)
        const extra = settings?.permissions?.additionalDirectories
        if (Array.isArray(extra)) {
          extra.forEach(d => {
            if (typeof d === 'string') {
              try { dirs.add(path.resolve(d)) } catch { /* ignore */ }
            }
          })
        }
      }
    } catch { /* ignore */ }
  }

  return [...dirs]
}

function isUnderAllowed(absPath, allowedDirs) {
  if (!absPath || !absPath.startsWith('/')) return false
  const norm = path.resolve(absPath)
  return allowedDirs.some(d => norm === d || norm.startsWith(d + path.sep))
}

function isUnderTempDir(absPath) {
  if (!absPath || !absPath.startsWith('/')) return false
  const norm = path.resolve(absPath)
  return norm.startsWith('/tmp/')
    || norm.startsWith('/private/tmp/')
    || norm.startsWith('/var/folders/')
    || norm.startsWith('/private/var/folders/')
}

// 안전 패턴: cd <abs path under allowed> && <safe rest>
// → Claude Code의 "cd before git" 경고 우회
function isCdGitSafe(cmd, allowedDirs) {
  if (hasNonRmRisk(cmd, allowedDirs)) return false
  const trimmed = cmd.trim()
  // 첫 줄에서 cd 컴파운드 추출
  const firstLine = trimmed.split('\n')[0]
  const m = firstLine.match(/^cd\s+(\S+)\s*&&\s*(.+)$/)
  if (!m) return false

  const target = m[1]
  const rest = m[2]

  if (!target.startsWith('/')) return false
  if (!isUnderAllowed(target, allowedDirs)) return false

  // 컴파운드 나머지에 위험 신호가 있으면 거부
  if (CD_COMPOUND_DANGER.some(p => p.test(rest))) return false

  // 컴파운드 뒤에 추가 줄이 있으면 ( cmd 가 멀티라인 ) 거부 — 의심스러움
  if (trimmed.split('\n').length > 1) return false

  return true
}

// 안전 패턴: cat > <safe path> << 'EOF' (또는 \EOF) ... EOF
// → Claude Code의 "brace+quote obfuscation" 경고 우회
function isHeredocSafe(cmd, allowedDirs) {
  if (hasNonRmRisk(cmd, allowedDirs)) return false
  const firstLine = cmd.split('\n')[0]
  // cat/tee > FILE << 'DELIM'  또는  << \DELIM 만 허용 (확장 차단되는 형태)
  const m = firstLine.match(
    /^\s*(?:cat|tee)\s+>>?\s*(\S+)\s+<<-?\s*(?:'([A-Za-z_][A-Za-z0-9_]*)'|\\([A-Za-z_][A-Za-z0-9_]*))/,
  )
  if (!m) return false

  const outPath = m[1]
  if (!outPath.startsWith('/')) return false  // 절대경로만

  // 출력 경로 안전성: 허용 디렉토리 또는 임시 디렉토리
  if (!isUnderAllowed(outPath, allowedDirs) && !isUnderTempDir(outPath)) return false

  // 위험 경로(쉘 시작 파일, ssh, git hooks 등) 차단
  if (HEREDOC_FORBIDDEN_PATHS.some(p => p.test(outPath))) return false

  // 비실행 확장자만
  if (!SAFE_FILE_EXT.test(outPath)) return false

  // 후속 실행 차단:
  // - chmod +x: 파일에 실행 비트 부여는 스크립트 의도, 차단
  // - eval / source / `.` cmd: 동적 코드 평가, 차단 (단순 . 은 false positive 방지)
  // - curl|bash: 원격 스크립트 실행 (DENY에도 있지만 한 번 더)
  // 단, node/python 같은 인터프리터로 heredoc 결과 파일을 직접 실행하는 것은
  // Bash(node*) 등이 이미 permissions.allow 에 있어 동등 공격면이 존재하므로 추가 차단 안 함.
  // 비-셸 확장자(.tsx/.ts/.json 등)만 허용하는 것으로 충분히 좁혀져 있음.
  if (/\bchmod\s+\+x\b/.test(cmd)) return false
  if (/\b(?:eval|source|\.)\s+\S+/.test(cmd) && /\beval\s|\bsource\s|^\s*\.\s/.test(cmd)) return false
  if (/curl\s.*\|\s*(?:ba)?sh\b/.test(cmd)) return false

  return true
}

// 컴파운드 statement 자동 허용 시 첫 단어 화이트리스트
const COMPOUND_SAFE_COMMANDS = new Set([
  // 파일 조작
  'cp', 'mv', 'rm', 'mkdir', 'touch', 'ln',
  // 읽기·검색
  'ls', 'll', 'cat', 'head', 'tail', 'less', 'more',
  'find', 'grep', 'egrep', 'fgrep', 'rg', 'ack',
  'wc', 'du', 'df', 'stat', 'file', 'tree',
  'diff', 'cmp', 'sort', 'uniq', 'cut', 'tr', 'awk', 'sed', 'tee',
  // 출력·메타
  'echo', 'printf', 'pwd', 'which', 'whoami', 'date', 'hostname', 'env', 'realpath',
  // 빌드/테스트 (각 도구의 read-only/일반 사용은 Bash(pnpm*) 등으로 이미 허용됨)
  'pnpm', 'npm', 'yarn', 'npx', 'bunx', 'node', 'tsc', 'eslint', 'biome', 'prettier',
  'vitest', 'jest', 'mocha',
  'cargo', 'rustc',
  'java', 'javac', 'mvn', 'gradle', './gradlew',
  // git (위험 서브커맨드는 별도 차단)
  'git',
  // xargs (다음 명령도 검사)
  'xargs',
])

// rm 인자가 "그대로 읽히는" 경로인가 — 홈(~)·변수·따옴표·치환·상위(..) 는 자동 허용 대상에서 제외
function isPlainRelativeRmArg(a) {
  if (/[~$"'`\\]/.test(a)) return false
  if (/(?:^|\/)\.\.(?:\/|$)/.test(a)) return false
  return true
}

function isStatementSafeForCompound(stmt, allowedDirs) {
  const trimmed = stmt.trim()
  if (!trimmed) return false

  // 첫 단어 안전성
  const firstWord = (trimmed.match(/^(\S+)/) || [])[1]
  if (!firstWord || /[{}'"`\\$]/.test(firstWord)) return false
  if (!COMPOUND_SAFE_COMMANDS.has(firstWord)) return false

  // git: 위험 서브커맨드 차단
  if (firstWord === 'git' && /\bgit\s+(?:push|commit|reset\s+--hard|clean\s+-[fdx]|checkout\b)/.test(trimmed)) {
    return false
  }

  // rm: 시스템·dotfile·forbidden 차단
  if (firstWord === 'rm') {
    if (/^rm\s+(?:-\S+\s+)*\/(?:bin|boot|dev|etc|lib|lib64|proc|root|sbin|sys|usr|var)\b/.test(trimmed)) return false
    if (/^rm\s+(?:-\S+\s+)*\/$/.test(trimmed)) return false
    if (/\.zshrc\b|\.bashrc\b|\.bash_profile\b|\.profile\b|\.envrc\b|\/\.ssh\/|\/\.git\/hooks\//.test(trimmed)) return false
    if (/\s\.\.\//.test(trimmed)) return false  // 상위 디렉토리
  }

  // chmod +x 차단
  if (firstWord === 'chmod' && /\+x\b/.test(trimmed)) return false

  // 위험한 redirect (>file)
  if (/>\s*\/(?:etc|usr|bin|sbin|sys|proc|dev|root)\//.test(trimmed)) return false
  if (/>\s*\S*\.zshrc\b/.test(trimmed)) return false
  if (/>\s*\S*\.bashrc\b/.test(trimmed)) return false
  if (/>\s*\S*\/\.ssh\//.test(trimmed)) return false

  // cp/mv 대상 경로 안전성 — 마지막 인자가 절대경로면 검증
  if (firstWord === 'cp' || firstWord === 'mv') {
    const args = trimmed.split(/\s+/).slice(1).filter(a => !a.startsWith('-'))
    const dest = args[args.length - 1]
    if (dest && dest.startsWith('/')) {
      if (!isUnderAllowed(dest, allowedDirs) && !isUnderTempDir(dest)) return false
    }
  }

  // rm 대상 절대경로도 안전 영역만
  if (firstWord === 'rm') {
    const args = trimmed.split(/\s+/).slice(1).filter(a => !a.startsWith('-'))
    for (const a of args) {
      if (!isPlainRelativeRmArg(a)) return false // ~ · $VAR · 따옴표 · .. → 경로 해석 불가/밖 가능
      if (a.startsWith('/')) {
        if (!isUnderAllowed(a, allowedDirs) && !isUnderTempDir(a)) return false
      }
    }
  }

  // xargs 다음 명령은 read-only 화이트리스트만 허용
  // (xargs rm/mv/cp 같이 여러 파일을 한 번에 변경하는 패턴은 위험)
  if (firstWord === 'xargs') {
    const m = trimmed.match(/^xargs(?:\s+-\S+)*\s+(\S+)/)
    const nextCmd = m ? m[1] : null
    if (!nextCmd) return false
    if (/[{}'"\\]/.test(nextCmd)) return false
    if (!SAFE_READONLY_COMMANDS.has(nextCmd)) return false
    if (nextCmd === 'xargs') return false
  }

  return true
}

// 멀티라인 스크립트에서 추가로 허용하는 명령들
const SCRIPT_EXTRA_SAFE = new Set([
  'cd',
  'sleep', 'wait', 'kill',
  'export', 'unset',
  'curl', 'wget',  // URL은 별도 localhost 검증
  'python', 'python3',
  'jq', 'yq',
  'basename', 'dirname',
  'true', 'false', 'test', '[',
])

const SCRIPT_ALL_SAFE = new Set([...COMPOUND_SAFE_COMMANDS, ...SCRIPT_EXTRA_SAFE])

// 알려진 로컬 개발 서버 패턴 (백그라운드 실행 허용 대상)
const LOCAL_SERVER_PATTERNS = [
  /^python3?\s+(?:-u\s+)?-m\s+http\.server\b/,
  /^npx\s+(?:-y\s+)?(?:serve|http-server|live-server|vite|next\s+dev|wrangler\s+dev)\b/,
  /^(?:pnpm|npm|yarn)\s+(?:run\s+)?(?:dev|start|preview|serve|watch)\b/,
  /^node\s+(?:--\S+\s+)*\S*server\S*\.js\b/,
  /^vite(?:\s+(?:dev|preview))?\b/,
]

function isLocalhostUrl(url) {
  if (!url) return false
  const cleaned = url.replace(/^["']|["']$/g, '')
  return /^https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?(?:[/?#]|$)/.test(cleaned)
}

function isReadOnlyPipeChain(stmt, allowedDirs, safeVars) {
  const stages = quoteAwareSplit(stmt, '|')
  for (const stage of stages) {
    const fw = (stage.match(/^(\S+)/) || [])[1]
    if (!fw || /[{}'"`\\$]/.test(fw)) return false
    if (!SAFE_READONLY_COMMANDS.has(fw) && fw !== 'basename' && fw !== 'dirname') return false
    if (!validateLineReferences(stage, allowedDirs, safeVars)) return false
  }
  return true
}

// $VAR 가 모두 safeVars 에 있는지 + 절대경로가 모두 안전 영역인지 + URL 이 localhost 인지
function validateLineReferences(line, allowedDirs, safeVars) {
  // 단일따옴표 영역 제거 (확장 안 됨)
  const noSingleQuotes = removeSingleQuotedSegments(line)

  // $VAR 검증 — 더블쿼트 안에서도 확장되므로 noSingleQuotes 에서 검색
  const varMatches = [...noSingleQuotes.matchAll(/\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g)]
  for (const v of varMatches) {
    const name = v[1]
    if (!safeVars.has(name)) return false
  }
  // $1, $@, $#, $? 등 positional/special 거부
  if (/\$[0-9@#\?\*]/.test(noSingleQuotes)) return false
  // $! BG PID — 별도 처리 (할당 시점에서만 허용)
  if (/\$!/.test(noSingleQuotes)) return false

  // URL 검증 — 따옴표 안/밖 모두 검사 (URL은 보통 따옴표로 감싸짐)
  const urlMatches = noSingleQuotes.match(/https?:\/\/[^\s"'<>|]+/g) || []
  for (const u of urlMatches) {
    if (!isLocalhostUrl(u)) return false
  }

  // 절대경로 검증 — 더블쿼트 안의 텍스트는 제외 (echo 등의 인자에 들어간 경로는 텍스트일 뿐)
  // 명령에 직접 인자로 전달된 경로(따옴표 밖)만 체크
  const noQuotes = noSingleQuotes.replace(/"[^"]*"/g, '""')
  const pathMatches = noQuotes.match(/(?<![:/])\/(?:[a-zA-Z0-9._-]+\/?)+/g) || []
  for (const p of pathMatches) {
    if (/^\/dev\/(?:null|stdin|stdout|stderr)$/.test(p)) continue
    // URL 의 /path 부분일 수 있음 (URL은 따옴표 밖에 직접 쓰일 때)
    if (urlMatches.some(u => u.includes(p))) continue
    if (isUnderTempDir(p)) continue
    if (isUnderAllowed(p, allowedDirs)) continue
    return false
  }

  return true
}

function removeSingleQuotedSegments(line) {
  // '...' 영역을 빈 문자열로 (이스케이프된 ' 는 sh 에서 일반적으로 안 됨)
  return line.replace(/'[^']*'/g, "''")
}

// quote-aware split — 따옴표 안에 있는 구분자는 무시
function quoteAwareSplit(line, sep) {
  const parts = []
  let buf = ''
  let inSingle = false, inDouble = false
  let i = 0
  while (i < line.length) {
    const ch = line[i]
    if (ch === "'" && !inDouble) { inSingle = !inSingle; buf += ch; i++; continue }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; buf += ch; i++; continue }
    if (!inSingle && !inDouble) {
      // 구분자 매칭
      if (sep === '|') {
        // | 분리 (단, ||는 제외)
        if (ch === '|' && line[i + 1] !== '|' && line[i - 1] !== '|') {
          parts.push(buf.trim())
          buf = ''
          i++
          continue
        }
      } else if (sep === 'compound') {
        // && 또는 || 분리
        if ((ch === '&' && line[i + 1] === '&') || (ch === '|' && line[i + 1] === '|')) {
          parts.push(buf.trim())
          buf = ''
          i += 2
          continue
        }
      }
    }
    buf += ch
    i++
  }
  if (buf.trim()) parts.push(buf.trim())
  return parts.filter(Boolean)
}

function extractCommandSubstitutions(line) {
  // 중첩 미지원 (간단한 $(cmd) 만)
  const matches = []
  const re = /\$\(([^()]+)\)/g
  let m
  while ((m = re.exec(line)) !== null) matches.push(m[1])
  return matches
}

// 안전 패턴: 멀티라인 셸 스크립트 (디버그·빌드 verify·로컬 서버 테스트 등)
// 변수 추적 + $() read-only 검증 + localhost URL + BG 서버 + kill 추적
function isShellScriptSafe(cmd, allowedDirs) {
  const trimmed = cmd.trim()
  if (!trimmed) return false
  if (hasNonRmRisk(trimmed, allowedDirs)) return false

  // 다른 핸들러 영역 양보 — heredoc 은 별도, cd-only 도 별도
  if (/<<-?\s*['\\]?[A-Za-z_]/.test(trimmed)) return false
  if (/`/.test(trimmed)) return false  // 백틱 차단 (정확한 추출 어려움)

  // 멀티라인 / 컴파운드 / 백그라운드 / 변수할당 / $() / pipe 가 있을 때만 적용
  // 단일 단순 명령은 다른 핸들러나 permissions.allow 에 위임
  const hasMultiline = trimmed.includes('\n')
  const hasCompound = /&&|\|\|/.test(trimmed)
  const hasBackground = /&\s*$/m.test(trimmed)
  const hasAssignment = /^[A-Za-z_][A-Za-z0-9_]*=/m.test(trimmed)
  const hasCmdSub = /\$\(/.test(trimmed)
  const hasPipe = /\s\|\s/.test(trimmed)
  const hasVarRef = /\$[A-Za-z_!]/.test(trimmed)
  if (!hasMultiline && !hasCompound && !hasBackground && !hasAssignment && !hasCmdSub && !hasPipe && !hasVarRef) {
    return false
  }

  // 줄별 / && || 으로 분리해서 statement 시퀀스 만들기 (quote-aware)
  const rawLines = trimmed.split('\n')
  const statements = []
  for (const raw of rawLines) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const parts = quoteAwareSplit(line, 'compound')
    for (const p of parts) {
      const t = p.trim()
      if (t) statements.push(t)
    }
  }
  if (statements.length === 0) return false

  // 컨텍스트
  const safeVars = new Set()
  let lastWasBgServer = false  // 직전 statement 가 BG 로컬 서버였는가

  for (const rawStmt of statements) {
    let stmt = rawStmt.trim()
    if (!stmt) continue

    // 끝의 & 제거 후 BG 여부 추적
    let isBackground = false
    if (/&\s*$/.test(stmt)) {
      isBackground = true
      stmt = stmt.replace(/&\s*$/, '').trim()
    }

    // 변수 할당 (VAR=value)
    const assign = stmt.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (assign) {
      const name = assign[1]
      const value = assign[2].trim()
      // VAR=$!  — 직전이 안전한 BG 서버일 때만 허용
      if (value === '$!') {
        if (lastWasBgServer) {
          safeVars.add(name)
          lastWasBgServer = false
          continue
        }
        return false
      }
      // VAR=$(safe-readonly-pipe)
      const subMatch = value.match(/^["']?\$\(([^()]+)\)["']?$/)
      if (subMatch) {
        if (isReadOnlyPipeChain(subMatch[1].trim(), allowedDirs, safeVars)) {
          safeVars.add(name)
          lastWasBgServer = false
          continue
        }
        return false
      }
      // VAR=리터럴 (숫자, 따옴표 안 문자열, 단순 단어, 허용 영역의 절대경로)
      if (/^\d+$/.test(value) ||
          /^["'][^$`"'\\]*["']$/.test(value) ||
          /^[\w./:-]+$/.test(value)) {
        safeVars.add(name)
        lastWasBgServer = false
        continue
      }
      return false  // 알 수 없는 할당
    }

    // 일반 statement — 첫 단어 검사
    const firstWord = (stmt.match(/^(\S+)/) || [])[1]
    if (!firstWord || /[{}'"`\\$]/.test(firstWord)) return false
    if (!SCRIPT_ALL_SAFE.has(firstWord)) return false

    // cd <safe>
    if (firstWord === 'cd') {
      const target = stmt.split(/\s+/)[1]
      if (!target || !target.startsWith('/')) return false
      if (!isUnderAllowed(target, allowedDirs) && !isUnderTempDir(target)) return false
    }

    // git: 위험 서브커맨드 차단
    if (firstWord === 'git' && /\bgit\s+(?:push|commit|reset\s+--hard|clean\s+-[fdx]|checkout\b)/.test(stmt)) {
      return false
    }

    // rm/cp/mv 경로 검사
    if (firstWord === 'rm' || firstWord === 'cp' || firstWord === 'mv') {
      const args = stmt.split(/\s+/).slice(1).filter(a => !a.startsWith('-'))
      for (const a of args) {
        if (firstWord === 'rm' && !isPlainRelativeRmArg(a)) return false
        if (a.startsWith('/')) {
          if (!isUnderAllowed(a, allowedDirs) && !isUnderTempDir(a)) return false
        }
      }
    }

    // chmod +x 차단
    if (firstWord === 'chmod' && /\+x\b/.test(stmt)) return false

    // ln -s / ln: 대상이 안전 영역이어야 함
    if (firstWord === 'ln') {
      const args = stmt.split(/\s+/).slice(1).filter(a => !a.startsWith('-'))
      const target = args[args.length - 1]
      if (target && target.startsWith('/')) {
        if (!isUnderAllowed(target, allowedDirs) && !isUnderTempDir(target)) return false
      }
    }

    // kill — 안전 변수 PID 만 허용
    if (firstWord === 'kill') {
      // kill $VAR 또는 kill SIGNAL $VAR
      const killVars = [...stmt.matchAll(/\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g)].map(m => m[1])
      if (killVars.length === 0) return false  // 리터럴 PID 거부 (안전 추적 불가)
      for (const v of killVars) {
        if (!safeVars.has(v)) return false
      }
    }

    // 백그라운드 — 알려진 로컬 서버만
    if (isBackground) {
      const cmdOnly = stmt.replace(/\s*>.*$/, '').replace(/\s*2>.*$/, '').trim()
      if (!LOCAL_SERVER_PATTERNS.some(p => p.test(cmdOnly))) return false
      lastWasBgServer = true
    } else {
      lastWasBgServer = false
    }

    // 파이프 체인 — 모든 단계 검사 (quote-aware split)
    const stages = quoteAwareSplit(stmt, '|')
    for (const stage of stages) {
      const fw = (stage.match(/^(\S+)/) || [])[1]
      if (!fw) return false
      if (!SCRIPT_ALL_SAFE.has(fw)) return false
      // 파이프 각 단계에서도 git 위험 서브커맨드·publish 차단 (구: statement 첫 단어만 검사 → `true | git push` 우회)
      if (fw === 'git' && /\bgit\s+(?:push|commit|reset\s+--hard|clean\s+-[fdx]|checkout\b)/.test(stage)) return false
      if (/^(?:npm|pnpm|yarn|bun)$/.test(fw) && /\bpublish\b/.test(stage)) return false
      // xargs 다음 명령은 read-only
      if (fw === 'xargs') {
        const m = stage.match(/^xargs(?:\s+-\S+)*\s+(\S+)/)
        const next = m ? m[1] : null
        if (!next || /[{}'"`\\$]/.test(next)) return false
        if (!SAFE_READONLY_COMMANDS.has(next)) return false
        if (next === 'xargs') return false
      }
    }

    // $() 내부 검증 — read-only pipe 만
    const cmdSubs = extractCommandSubstitutions(stmt)
    for (const sub of cmdSubs) {
      if (!isReadOnlyPipeChain(sub, allowedDirs, safeVars)) return false
    }

    // 위험한 redirect (단, /dev/null /dev/stdout /dev/stderr 는 허용)
    if (/>\s*\/(?:etc|usr|bin|sbin|sys|proc|root)\//.test(stmt)) return false
    if (/>\s*\/dev\/(?!null|stdout|stderr|stdin\b)/.test(stmt)) return false
    if (/>\s*\S*\.zshrc\b/.test(stmt)) return false
    if (/>\s*\S*\.bashrc\b/.test(stmt)) return false
    if (/>\s*\S*\/\.ssh\//.test(stmt)) return false

    // 기타 변수/경로/URL 참조 검증
    if (!validateLineReferences(stmt, allowedDirs, safeVars)) return false
  }

  return true
}

// 안전 패턴: A && B && C ... 형태의 컴파운드 명령
// → "/tmp access" 권한 트리거나 복합 패턴 휴리스틱 우회
// 모든 statement(파이프 단계 포함)가 화이트리스트 명령 + 경로가 안전 영역일 때만 허용
function isCompoundSafe(cmd, allowedDirs) {
  const trimmed = cmd.trim()
  if (!trimmed || trimmed.includes('\n')) return false
  if (hasNonRmRisk(trimmed, allowedDirs)) return false // `a && b; git push` 처럼 ; 뒤에 숨은 명령 포함

  // 동적 코드 평가 차단
  if (/\$\(/.test(trimmed)) return false
  if (/`/.test(trimmed)) return false

  // 다른 핸들러 영역 양보
  if (/<<-?\s*['\\]?[A-Za-z_]/.test(trimmed)) return false  // heredoc
  if (/^\s*cd\s/.test(trimmed)) return false                // cd compound

  // 컴파운드(&&, ||)가 있어야 적용
  if (!/&&|\|\|/.test(trimmed)) return false

  const statements = trimmed.split(/\s*(?:&&|\|\|)\s*/).filter(Boolean)

  for (const stmt of statements) {
    const stages = stmt.split(/\s*\|\s*/).filter(Boolean)
    for (const stage of stages) {
      if (!isStatementSafeForCompound(stage, allowedDirs)) return false
    }
  }

  return true
}

// 안전 패턴: 첫 단어가 read-only 명령이고 brace expansion이 인자에서만 일어남
// → Claude Code의 "Brace expansion" 경고 우회
function isBraceExpansionSafe(cmd) {
  const trimmed = cmd.trim()
  if (!trimmed) return false
  if (hasNonRmRisk(trimmed, [])) return false

  // 실제로 brace expansion(쉼표 포함)을 쓰지 않으면 적용 대상 아님
  if (!/\{[^{}]*,[^{}]*\}/.test(trimmed)) return false

  // 컴파운드(;, &&, ||, 개행)는 거부 — 다중 명령 조합은 보수적으로 묻기
  if (trimmed.includes(';')) return false
  if (trimmed.includes('&&')) return false
  if (trimmed.includes('||')) return false
  if (trimmed.includes('\n')) return false

  // backtick / $(..) 명령 치환 거부 — 동적 코드 실행
  if (/\$\(/.test(trimmed)) return false
  if (/`/.test(trimmed)) return false

  // 파이프 체인: 모든 단계가 read-only 명령이어야 함
  const stages = trimmed.split(/\s\|\s/).map(s => s.trim()).filter(Boolean)

  for (const stage of stages) {
    const firstWord = (stage.match(/^(\S+)/) || [])[1]
    if (!firstWord) return false

    // 명령어 이름 자체에 brace/quote가 있으면 obfuscation 의심
    if (/[{}'"\\]/.test(firstWord)) return false

    if (!SAFE_READONLY_COMMANDS.has(firstWord)) return false

    // xargs는 다음 단어도 안전 명령이어야 함
    if (firstWord === 'xargs') {
      const m = stage.match(/^xargs(?:\s+-\S+)*\s+(\S+)/)
      const nextCmd = m ? m[1] : null
      if (!nextCmd) return false
      if (/[{}'"\\]/.test(nextCmd)) return false
      if (!SAFE_READONLY_COMMANDS.has(nextCmd)) return false
      if (nextCmd === 'xargs') return false  // xargs xargs 금지
    }
  }

  // sed -i (in-place) 차단 — 파일 수정
  if (/\bsed\s+(?:-\w*i\b|-i\s|-i$)/.test(trimmed)) return false

  // redirect 검사: > /dangerous/path 차단
  // `2>` 같은 fd 지정 redirect도 검출 (앞에 숫자가 있어도 매칭)
  const redirects = [...trimmed.matchAll(/[0-9]?>>?\s*(\S+)/g)]
  for (const r of redirects) {
    const target = r[1]
    if (target === '/dev/null') continue
    if (target.startsWith('&')) continue  // &1, &2 fd 복제
    if (HEREDOC_FORBIDDEN_PATHS.some(p => p.test(target))) return false
    // 절대경로 redirect가 /tmp 또는 워크스페이스가 아닌 시스템 영역이면 차단
    if (target.startsWith('/') && !target.startsWith('/tmp/') && !target.startsWith('/var/folders/') && !target.startsWith('/private/')) {
      // /Users/x/.zshrc 같은 건 이미 위에서 차단. 그 외 시스템 영역 추가 차단.
      if (/^\/(?:etc|usr|bin|sbin|var|sys|proc|dev|root)\//.test(target)) return false
    }
  }

  return true
}

// ─────────────────────────────────────────────────────────────
// 셸 명령 분석기 (2026-09-26 사각지대 감사 C1·C3·C6 대응)
//
// 정규식 문자열 매칭은 파이프 단계·체인·치환·서브셸·`bash -c`·명령 전치(env/command/…)·
// git 전역 옵션(-C 등)·따옴표 분할(gi"t")을 놓친다. 명령을 셸 문법 수준으로 풀어
// "실제로 실행될 명령(invocation)" 목록을 만든 뒤 명령 단위로 위험을 분류한다.
//
// 보수 원칙: 정적으로 해석할 수 없는 것(동적 명령명·닫히지 않은 따옴표·과도한 중첩)은
// 'unknown' — PreToolUse 에서 allow 하지 않고 PermissionRequest 에서 자동 승인하지 않는다.
// 한계: 셸 문법 완전 구현이 아니다(case 패턴·산술식 등은 근사). 그래서 근사가 틀리면
//       항상 "더 묻는" 쪽으로 틀리도록 설계했다.
// ─────────────────────────────────────────────────────────────
const os = require('os')

const MAX_ANALYZE_LEN = 1000000
const MAX_DEPTH = 8
const ZERO_WIDTH_RE = /[​-‍⁠﻿­]/g
const HOME_DIR = (() => { try { return path.resolve(os.homedir()) } catch { return null } })()

const SHELL_NAMES = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh', 'mksh', 'ash', 'fish', 'yash', 'tcsh', 'csh'])
const RESERVED_SKIP = new Set(['!', '{', '}', 'if', 'then', 'elif', 'else', 'fi', 'while', 'until', 'do', 'done', 'esac', 'time', 'coproc'])
const FETCHERS = new Set(['curl', 'wget', 'fetch', 'http', 'https', 'aria2c', 'xh'])
const EXEC_SINKS = new Set(['eval', 'source', '.'])
const PUBLISHERS = new Set(['npm', 'pnpm', 'yarn', 'bun', 'cargo'])
const SYSTEM_DIRS = ['/bin', '/boot', '/dev', '/etc', '/lib', '/lib64', '/proc', '/root', '/sbin', '/sys', '/usr',
  '/var', '/opt', '/System', '/Library', '/Applications', '/private/etc', '/private/var', '/cores', '/Volumes']
const LEVEL_RANK = { deny: 3, ask: 2, unknown: 1 }

function isInterpreterName(name) {
  return SHELL_NAMES.has(name) || /^python[\d.]*$/.test(name) || /^(?:node|nodejs|perl|ruby|php|lua|pwsh|powershell|osascript|deno|bun|tclsh|Rscript)$/i.test(name)
}

function newWord() { return { value: '', quoted: false, dyn: false, subst: false, tilde: false } }

// "..." 내부 — $ 확장·$(…)·`…` 는 살아 있다
function readDouble(src, i, cur, st) {
  const n = src.length
  while (i < n) {
    const c = src[i]
    if (c === '"') return i + 1
    if (c === '\\' && i + 1 < n) {
      const nx = src[i + 1]
      if ('$`"\\\n'.includes(nx)) { if (nx !== '\n') cur.value += nx; i += 2; continue }
      cur.value += c; i++; continue
    }
    if (c === '$' && src[i + 1] === '(') {
      const r = readBalanced(src, i + 2, st); addSub(st, r.inner, cur); cur.value += '$(…)'; i = r.end; continue
    }
    if (c === '`') { const r = readBacktick(src, i + 1, st); addSub(st, r.inner, cur); cur.value += '`…`'; i = r.end; continue }
    if (c === '$') { cur.dyn = true; cur.value += c; i++; continue }
    cur.value += c; i++
  }
  st.error = st.error || '닫히지 않은 큰따옴표'
  return n
}

// $( … ) / <( … ) 의 짝 괄호 찾기 — 따옴표·이스케이프 인지
function readBalanced(src, i, st) {
  const n = src.length, start = i
  let depth = 1
  const heredocs = [] // $( cat <<'EOF' … EOF ) — 본문의 따옴표·괄호는 짝 계산에서 제외
  while (i < n) {
    const c = src[i]
    if (c === '\\') { i += 2; continue }
    if (c === '<' && src[i + 1] === '<' && src[i + 2] !== '<') {
      const m = /^<<-?[ \t]*(?:'([^'\n]*)'|"([^"\n]*)"|\\?([A-Za-z_0-9]+))/.exec(src.slice(i, i + 256))
      if (m) { heredocs.push({ delim: m[1] ?? m[2] ?? m[3], strip: m[0].startsWith('<<-') }); i += m[0].length; continue }
    }
    if (c === '\n' && heredocs.length) {
      i++
      for (const hd of heredocs.splice(0)) {
        while (i < n) {
          const nl = src.indexOf('\n', i)
          const line = src.slice(i, nl < 0 ? n : nl)
          i = nl < 0 ? n : nl + 1
          if ((hd.strip ? line.replace(/^\t+/, '') : line) === hd.delim) break
        }
      }
      continue
    }
    if (c === "'") { const j = src.indexOf("'", i + 1); if (j < 0) break; i = j + 1; continue }
    if (c === '"') {
      i++
      while (i < n && src[i] !== '"') i += src[i] === '\\' ? 2 : 1
      i++; continue
    }
    if (c === '(') depth++
    else if (c === ')') { depth--; if (depth === 0) return { inner: src.slice(start, i), end: i + 1 } }
    i++
  }
  st.error = st.error || '닫히지 않은 $( … )'
  return { inner: src.slice(start), end: n }
}

function readBacktick(src, i, st) {
  const n = src.length
  let j = i
  while (j < n) {
    if (src[j] === '\\') { j += 2; continue }
    if (src[j] === '`') return { inner: src.slice(i, j).replace(/\\([`\\$])/g, '$1'), end: j + 1 }
    j++
  }
  st.error = st.error || '닫히지 않은 백틱'
  return { inner: src.slice(i), end: n }
}

// $'…' (ANSI-C 인용) — 이스케이프 해석해 실제 문자열로
function readAnsiC(src, i, st) {
  const n = src.length
  let out = ''
  const simple = { n: '\n', t: '\t', r: '\r', a: '\x07', b: '\b', e: '\x1b', E: '\x1b', f: '\f', v: '\v', '\\': '\\', "'": "'", '"': '"', '?': '?' }
  while (i < n) {
    const c = src[i]
    if (c === "'") return { value: out, end: i + 1 }
    if (c === '\\' && i + 1 < n) {
      const nx = src[i + 1]
      if (simple[nx] !== undefined) { out += simple[nx]; i += 2; continue }
      let m
      if ((m = /^x([0-9a-fA-F]{1,2})/.exec(src.slice(i + 1, i + 4)))) { out += String.fromCharCode(parseInt(m[1], 16)); i += 1 + m[0].length; continue }
      if ((m = /^u([0-9a-fA-F]{1,4})/.exec(src.slice(i + 1, i + 6)))) { out += String.fromCharCode(parseInt(m[1], 16)); i += 1 + m[0].length; continue }
      if ((m = /^U([0-9a-fA-F]{1,8})/.exec(src.slice(i + 1, i + 10)))) { try { out += String.fromCodePoint(parseInt(m[1], 16)) } catch { /* 무효 코드포인트 */ } i += 1 + m[0].length; continue }
      if ((m = /^([0-7]{1,3})/.exec(src.slice(i + 1, i + 4)))) { out += String.fromCharCode(parseInt(m[1], 8)); i += 1 + m[0].length; continue }
      out += nx; i += 2; continue
    }
    out += c; i++
  }
  st.error = st.error || "닫히지 않은 $'…'"
  return { value: out, end: n }
}

function addSub(st, inner, cur) {
  cur.dyn = true
  cur.subst = true
  st.subs.push(inner)
}

// heredoc 본문 건너뛰기 — 따옴표 구분자면 본문은 순수 텍스트, 아니면 본문 속 치환만 분석
function skipHeredocs(src, i, list, st) {
  const n = src.length
  for (const hd of list) {
    let body = ''
    while (i < n) {
      const nl = src.indexOf('\n', i)
      const line = src.slice(i, nl < 0 ? n : nl)
      i = nl < 0 ? n : nl + 1
      if ((hd.strip ? line.replace(/^\t+/, '') : line) === hd.delim) break
      body += line + '\n'
    }
    if (!hd.quoted) {
      for (let k = 0; k < body.length; k++) {
        if (body[k] === '\\') { k++; continue }
        if (body[k] === '$' && body[k + 1] === '(') { const r = readBalanced(body, k + 2, st); st.subs.push(r.inner); k = r.end - 1; continue }
        if (body[k] === '`') { const r = readBacktick(body, k + 1, st); st.subs.push(r.inner); k = r.end - 1 }
      }
    }
  }
  return i
}

// 셸 어휘 분석 — 따옴표 제거된 단어 + 연산자 토큰
function lexShell(src, st) {
  const tokens = []
  const n = src.length
  const pending = []
  let i = 0, cur = null, heredocExpect = null, redirNext = false

  const start = () => { if (!cur) cur = newWord() }
  const end = () => {
    if (!cur) return
    const w = cur; cur = null
    if (heredocExpect) { pending.push({ delim: w.value, strip: heredocExpect.strip, quoted: w.quoted }); heredocExpect = null; return }
    if (redirNext) { redirNext = false; tokens.push({ t: 'redir', w }); return }
    tokens.push({ t: 'word', w })
  }
  const op = (v) => { end(); tokens.push({ t: 'op', v }) }

  while (i < n) {
    const ch = src[i]
    if (ch === '\\') {
      if (src[i + 1] === '\n') { i += 2; continue } // 줄 연속
      start(); cur.quoted = true
      if (i + 1 < n) cur.value += src[i + 1]
      i += 2; continue
    }
    if (ch === "'") {
      start(); cur.quoted = true
      const j = src.indexOf("'", i + 1)
      if (j < 0) { st.error = st.error || '닫히지 않은 작은따옴표'; cur.value += src.slice(i + 1); i = n; continue }
      cur.value += src.slice(i + 1, j); i = j + 1; continue
    }
    if (ch === '$' && src[i + 1] === "'") {
      start(); cur.quoted = true
      const r = readAnsiC(src, i + 2, st); cur.value += r.value; i = r.end; continue
    }
    if (ch === '"') { start(); cur.quoted = true; i = readDouble(src, i + 1, cur, st); continue }
    if (ch === '$' && src[i + 1] === '(') {
      start(); const r = readBalanced(src, i + 2, st); addSub(st, r.inner, cur); cur.value += '$(…)'; i = r.end; continue
    }
    if (ch === '`') { start(); const r = readBacktick(src, i + 1, st); addSub(st, r.inner, cur); cur.value += '`…`'; i = r.end; continue }
    if ((ch === '<' || ch === '>') && src[i + 1] === '(') {
      end(); start(); const r = readBalanced(src, i + 2, st); addSub(st, r.inner, cur); cur.value += ch + '(…)'; i = r.end; continue
    }
    if (ch === '$') { start(); cur.dyn = true; cur.value += '$'; i++; continue }
    if (ch === '\n') {
      op('\n'); i++
      if (pending.length) i = skipHeredocs(src, i, pending.splice(0), st)
      continue
    }
    if (/\s/.test(ch)) { end(); i++; continue } // 유니코드 공백도 구분자로 — 보수적(더 많이 탐지)
    if (ch === '#' && !cur) { while (i < n && src[i] !== '\n') i++; continue }
    if (ch === ';') { op(';'); i++; continue }
    if (ch === '&') {
      if (src[i + 1] === '&') { op('&&'); i += 2; continue }
      if (src[i + 1] === '>') { end(); i += src[i + 2] === '>' ? 3 : 2; redirNext = true; continue }
      op('&'); i++; continue
    }
    if (ch === '|') {
      if (src[i + 1] === '|') { op('||'); i += 2; continue }
      op('|'); i += src[i + 1] === '&' ? 2 : 1; continue
    }
    if (ch === '(' || ch === ')') { op(ch); i++; continue }
    if (ch === '<' || ch === '>') {
      if (cur && !cur.quoted && !cur.dyn && /^\d+$/.test(cur.value)) cur = null // fd 번호 (2>)
      else end()
      let j = i + 1
      if (ch === '<' && src[j] === '<') {
        if (src[j + 1] === '<') { i = j + 2; redirNext = true; continue } // here-string
        j++
        let strip = false
        if (src[j] === '-') { strip = true; j++ }
        heredocExpect = { strip }; i = j; continue
      }
      if (src[j] === '>' || src[j] === '|' || src[j] === '&' || (ch === '<' && src[j] === '>')) j++
      i = j; redirNext = true; continue
    }
    if (ch === '~' && !cur) { start(); cur.tilde = true; cur.value += '~'; i++; continue }
    start(); cur.value += ch; i++
  }
  end()
  return tokens
}

// {a,b} 중괄호 확장 — 인용·확장 없는 단어만 (bash 는 명령 위치에서도 확장한다: {git,push})
function braceExpand(s, budget) {
  const m = /^([\s\S]*?)\{([^{}]*,[^{}]*)\}([\s\S]*)$/.exec(s)
  if (!m) return [s]
  const out = []
  for (const alt of m[2].split(',')) {
    for (const r of braceExpand(m[1] + alt + m[3], budget)) {
      out.push(r)
      if (out.length >= budget) return out
    }
  }
  return out
}

function expandWord(w) {
  if (w.quoted || w.dyn || !/\{[^{}]*,[^{}]*\}/.test(w.value)) return [w]
  return braceExpand(w.value, 256).map(v => ({ ...w, value: v, tilde: v === '~' || v.startsWith('~/') }))
}

// 토큰 → 단순 명령 목록 (파이프라인·서브셸 문맥 포함)
function splitCommands(tokens) {
  const cmds = []
  let cur = null, pipeline = 0, parenDepth = 0
  const flush = () => { if (cur && cur.words.length) cmds.push(cur); cur = null }
  for (const tk of tokens) {
    if (tk.t === 'op') {
      flush()
      if (tk.v === '(') parenDepth++
      else if (tk.v === ')') parenDepth = Math.max(0, parenDepth - 1)
      else if (tk.v !== '|') pipeline++
      continue
    }
    if (!cur) cur = { words: [], redirs: [], pipeline, inParen: parenDepth > 0 }
    if (tk.t === 'redir') cur.redirs.push(tk.w)
    else cur.words.push(...expandWord(tk.w))
  }
  flush()
  const sizes = {}
  for (const c of cmds) sizes[c.pipeline] = (sizes[c.pipeline] || 0) + 1
  for (const c of cmds) c.inPipe = sizes[c.pipeline] > 1
  return cmds
}

function cleanValue(v) { return String(v).replace(ZERO_WIDTH_RE, '') }

function cmdNameOf(w) {
  const v = cleanValue(w.value)
  return (v.includes('/') ? v.slice(v.lastIndexOf('/') + 1) : v).toLowerCase()
}

function isAssignmentWord(w) { return /^[A-Za-z_][A-Za-z0-9_]*(?:\[[^\]]*\])?\+?=/.test(w.value) }

// sh -c 'SCRIPT' 의 SCRIPT 단어 (없으면 null)
function shellDashC(args) {
  let hasC = false
  for (let i = 0; i < args.length; i++) {
    const v = args[i].value
    if (v === '--') { return hasC ? args[i + 1] || null : null }
    if (/^--(?:rcfile|init-file)$/.test(v)) { i++; continue }
    if (/^[-+]o$/.test(v)) { i++; continue }
    if (/^[-+][A-Za-z]+$/.test(v)) { if (v[0] === '-' && v.includes('c')) hasC = true; continue }
    if (v.startsWith('--')) continue
    return hasC ? args[i] : null
  }
  return null
}

// 인터프리터가 stdin 에서 코드를 읽는가 (curl … | <이것>)
function readsStdin(inv) {
  const vals = inv.args.map(a => a.value)
  if (SHELL_NAMES.has(inv.name)) {
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i]
      if (v === '--') return vals[i + 1] === undefined || vals[i + 1] === '-'
      if (/^[-+]o$/.test(v)) { i++; continue }
      if (/^-[A-Za-z]+$/.test(v)) { if (v.includes('c')) return false; if (v.includes('s')) return true; continue }
      if (v.startsWith('-') && v !== '-') continue
      return v === '-'
    }
    return true
  }
  for (let i = 0; i < vals.length; i++) {
    const v = vals[i]
    if (/^-(?:c|e|m|p|E|r)$/.test(v) || /^--(?:eval|print|command)$/.test(v)) return false
    if (/^-[WXQ]$/.test(v)) { i++; continue }
    if (v === '-') return true
    if (v.startsWith('-')) continue
    return false // 스크립트 파일 인자
  }
  return true
}

// git 전역 옵션 건너뛰고 서브커맨드 추출 + -c alias.X= 별칭 해석
function parseGitInvocation(args) {
  const aliases = {}
  let dir = null, i = 0
  while (i < args.length) {
    const v = cleanValue(args[i].value)
    if (v === '-C') { dir = args[i + 1] || null; i += 2; continue }
    if (v === '-c') {
      const kv = args[i + 1]
      if (kv) { const m = /^alias\.([^=]+)=([\s\S]*)$/i.exec(kv.value); if (m) aliases[m[1].toLowerCase()] = m[2] }
      i += 2; continue
    }
    if (/^--(?:git-dir|work-tree|namespace|super-prefix|config-env|attr-source)$/.test(v)) { i += 2; continue }
    if (v.startsWith('-')) { i++; continue }
    break
  }
  if (i >= args.length) return { sub: null, subDyn: false, args: [], dir, aliases }
  return { sub: cleanValue(args[i].value).toLowerCase(), subDyn: !!args[i].dyn, args: args.slice(i + 1), dir, aliases }
}

function wordsOf(src) {
  const st = { error: null, subs: [] }
  return lexShell(src, st).filter(t => t.t === 'word').map(t => t.w)
}

// 전치 명령(env/command/sudo/xargs/…)을 벗기고 실제 명령을 invocation 으로 기록
function collectInvocations(words, ctx, acc, meta) {
  let w = words.slice()
  let sudo = false
  for (let guard = 0; guard < 64 && w.length; guard++) {
    while (w.length && isAssignmentWord(w[0])) w.shift()
    if (!w.length) return
    const nm = cmdNameOf(w[0])
    if (w[0].dyn) break
    if (RESERVED_SKIP.has(nm) && !w[0].quoted) { w.shift(); continue }
    if (nm === 'function' && !w[0].quoted) { w.splice(0, 2); continue }
    if (nm === 'command') {
      w.shift()
      while (w.length && /^-[pvV]+$/.test(w[0].value)) { if (/[vV]/.test(w[0].value)) return; w.shift() } // -v/-V 는 조회만
      continue
    }
    if (nm === 'builtin' || nm === 'nohup' || nm === 'noglob' || nm === 'busybox') { w.shift(); continue }
    if (nm === 'exec' || nm === 'nice' || nm === 'stdbuf' || nm === 'caffeinate') {
      w.shift()
      while (w.length && w[0].value.startsWith('-')) {
        const o = w.shift().value
        if (o === '--') break
        if ((nm === 'exec' && o === '-a') || (nm === 'nice' && o === '-n') || (nm === 'stdbuf' && /^-[ioe]$/.test(o)) || (nm === 'caffeinate' && /^-[tw]$/.test(o))) w.shift()
      }
      continue
    }
    if (nm === 'timeout' || nm === 'gtimeout') {
      w.shift()
      while (w.length && w[0].value.startsWith('-')) {
        const o = w.shift().value
        if (o === '--') break
        if (/^(?:-s|-k|--signal|--kill-after)$/.test(o)) w.shift()
      }
      w.shift() // duration
      continue
    }
    if (nm === 'env') {
      w.shift()
      let split = null
      while (w.length) {
        const o = w[0].value
        if (o === '--') { w.shift(); break }
        if (isAssignmentWord(w[0])) { w.shift(); continue }
        if (o === '-') { w.shift(); continue }
        if (!o.startsWith('-')) break
        w.shift()
        if (/^(?:-u|-C|-P|--unset|--chdir)$/.test(o)) w.shift()
        else if (o === '-S' || o === '--split-string') split = w.shift() || null
        else if (/^-S./.test(o)) split = { ...newWord(), value: o.slice(2) }
        else if (o.startsWith('--split-string=')) split = { ...newWord(), value: o.slice(15) }
      }
      if (split) {
        if (split.dyn) { acc.unknown.push('env -S 동적 문자열') }
        w = [...wordsOf(split.value), ...w]
      }
      if (!w.length) return
      continue
    }
    if (nm === 'sudo' || nm === 'doas') {
      sudo = true
      w.shift()
      while (w.length && w[0].value.startsWith('-')) {
        const o = w.shift().value
        if (o === '--') break
        if (/^-[ugpChDrtUT]$/.test(o)) w.shift()
      }
      if (!w.length) { acc.invocations.push({ name: nm, args: [], sudo: true, ...meta }); return }
      continue
    }
    if (nm === 'xargs') {
      w.shift()
      while (w.length && w[0].value.startsWith('-')) {
        const o = w.shift().value
        if (o === '--') break
        if (/^-[IdEsnPLa]$/.test(o)) w.shift()
      }
      if (!w.length) return
      continue
    }
    break
  }
  if (!w.length) return

  const inv = { name: cmdNameOf(w[0]), dynamicName: !!w[0].dyn, args: w.slice(1), sudo, ...meta }
  acc.invocations.push(inv)
  if (inv.dynamicName) return

  const depth = ctx.depth + 1
  if (SHELL_NAMES.has(inv.name)) {
    const script = shellDashC(inv.args)
    if (script) analyzeShellInto(script.value, depth, acc, true)
  } else if (inv.name === 'eval') {
    analyzeShellInto(inv.args.map(a => a.value).join(' '), depth, acc, true)
  } else if (inv.name === 'find') {
    for (let k = 0; k < inv.args.length; k++) {
      if (/^-(?:exec|execdir|ok|okdir)$/.test(inv.args[k].value)) {
        const sub = []
        k++
        while (k < inv.args.length && inv.args[k].value !== ';' && inv.args[k].value !== '+') sub.push(inv.args[k++])
        collectInvocations(sub, ctx, acc, meta)
      }
    }
  } else if (inv.name === 'git') {
    let g = parseGitInvocation(inv.args)
    if (g.sub && !g.subDyn && g.aliases[g.sub] !== undefined) {
      const val = g.aliases[g.sub]
      if (val.startsWith('!')) analyzeShellInto(val.slice(1), depth, acc, true)
      else {
        const aw = wordsOf(val)
        if (aw.length) g = { ...g, sub: cmdNameOf(aw[0]), args: [...aw.slice(1), ...g.args] }
      }
    }
    inv.git = g
  }
}

function analyzeShellInto(src, depth, acc, inSub) {
  if (depth > MAX_DEPTH) { acc.unknown.push('중첩 과다'); return }
  const st = { error: null, subs: [] }
  const tokens = lexShell(src, st)
  if (st.error) acc.unknown.push(st.error)
  for (const sub of st.subs) analyzeShellInto(sub, depth + 1, acc, true)
  const scope = acc.seq++
  for (const c of splitCommands(tokens)) {
    collectInvocations(c.words, { depth }, acc, {
      pipeline: `${scope}:${c.pipeline}`,
      subshell: !!(inSub || c.inParen || c.inPipe),
      fromSub: !!inSub,
      argSubst: c.words.slice(1).some(x => x.subst),
      redirs: c.redirs,
    })
  }
}

function analyzeShell(cmd) {
  const acc = { invocations: [], unknown: [], seq: 0 }
  if (typeof cmd !== 'string') { acc.unknown.push('비문자열 명령'); return acc }
  if (cmd.length > MAX_ANALYZE_LEN) { acc.unknown.push('명령 길이 초과'); return acc }
  analyzeShellInto(cmd, 0, acc, false)
  return acc
}

// rm 대상 단어 → 절대경로 (해석 불가면 null). glob 이면 glob 이 걸린 디렉토리 + glob:true
function resolveRmTarget(w, vcwd) {
  let v = cleanValue(w.value)
  if (w.tilde) {
    if (!HOME_DIR || !(v === '~' || v.startsWith('~/'))) return null
    v = HOME_DIR + v.slice(1)
  } else if (w.dyn) {
    const h = /^\$(?:\{HOME\}|HOME(?![A-Za-z0-9_]))([\s\S]*)$/.exec(v)
    const p = /^\$(?:\{PWD\}|PWD(?![A-Za-z0-9_]))([\s\S]*)$/.exec(v)
    if (h && HOME_DIR) v = HOME_DIR + h[1]
    else if (p && vcwd) v = vcwd + p[1]
    else return null
    if (v.includes('$') || v.includes('`')) return null
  }
  if (!v) return null
  if (!v.startsWith('/')) { if (!vcwd) return null; v = vcwd + '/' + v }
  const g = v.search(/[*?[]/)
  if (g >= 0) {
    const base = v.slice(0, g)
    const dir = base.endsWith('/') ? base : path.dirname(base)
    return { abs: path.resolve(dir), glob: true }
  }
  return { abs: path.resolve(v), glob: false }
}

function isAncestorOrSame(dir, of) { return !!of && (of === dir || of.startsWith(dir === '/' ? '/' : dir + '/')) }

function classifyRm(inv, ctx, add) {
  let recursive = false, endOpts = false
  const targets = []
  for (const a of inv.args) {
    const v = a.value
    if (!endOpts && v === '--') { endOpts = true; continue }
    if (!endOpts && /^-[A-Za-z]+$/.test(v)) { if (/[rR]/.test(v)) recursive = true; continue }
    if (!endOpts && v.startsWith('--')) { if (v === '--recursive') recursive = true; continue }
    targets.push(a)
  }
  for (const t of targets) {
    const r = resolveRmTarget(t, ctx.vcwd)
    if (!r) { add('ask', `rm 대상 경로를 정적으로 해석할 수 없습니다(${t.value}). 사용자 확인이 필요합니다.`); continue }
    const abs = r.abs
    if (abs === '/') { add('deny', '루트 디렉토리 삭제는 차단됩니다.'); continue }
    if (HOME_DIR && isAncestorOrSame(abs, HOME_DIR)) { add('deny', '홈 디렉토리(또는 그 상위) 삭제는 차단됩니다.'); continue }
    const base = path.basename(abs)
    if (['.git', '.claude', '.ssh'].includes(base) || /\/\.ssh(?:\/|$)/.test(abs)) { add('deny', '.git / .claude / .ssh 디렉토리 삭제는 차단됩니다.'); continue }
    if (isUnderTempDir(abs)) continue
    if (SYSTEM_DIRS.some(d => isAncestorOrSame(d, abs))) {
      add(recursive ? 'deny' : 'ask', '시스템 디렉토리 삭제는 차단됩니다.'); continue
    }
    if (ctx.root && isAncestorOrSame(abs, ctx.root)) { add(recursive ? 'deny' : 'ask', '프로젝트 루트(또는 그 상위) 전체 삭제는 차단됩니다.'); continue }
    if (ctx.startCwd && abs === ctx.startCwd) { add(recursive ? 'deny' : 'ask', '현재 디렉토리 전체 삭제는 차단됩니다.'); continue }
    if (ctx.allowedDirs.includes(abs)) { add('ask', `허용 디렉토리 루트 전체 삭제(${abs})는 사용자 확인이 필요합니다.`); continue }
    if (isUnderAllowed(abs, ctx.allowedDirs)) continue
    add('ask', `프로젝트 루트 밖 경로 삭제(${abs})는 사용자 확인이 필요합니다.`)
  }
}

// git push 인자 → { remote, refspecs, force, pushAll, deleteMode } (branch-protection 과 공용)
const PUSH_VALUE_OPTS = new Set(['-o', '--push-option', '--repo', '--receive-pack', '--exec'])
function parsePushArgs(args) {
  const positional = []
  let force = false, pushAll = false, deleteMode = false
  for (let i = 0; i < args.length; i++) {
    const v = cleanValue(args[i].value)
    if (v === '--') { positional.push(...args.slice(i + 1)); break }
    if (v.startsWith('-') && v.length > 1) {
      if (PUSH_VALUE_OPTS.has(v)) { i++; continue }
      if (/^--force(?:$|=|-with-lease|-if-includes)/.test(v)) force = true
      else if (/^--(?:all|mirror|branches)$/.test(v)) pushAll = true
      else if (v === '--delete') deleteMode = true
      else if (/^-[A-Za-z0-9]+$/.test(v)) { if (v.includes('f')) force = true; if (v.includes('d')) deleteMode = true }
      continue
    }
    positional.push(args[i])
  }
  return { remote: positional[0] || null, refspecs: positional.slice(1), force, pushAll, deleteMode }
}

// reset --hard 대상 커밋까지 되돌릴 때 지워지는 커밋 중 이미 푸시된(원격 브랜치에 있는) 것의 수
// 반환: 숫자(0 = 전부 미푸시 → 자동 허용) | null(판정 불가 → 사용자 확인)
// execFileSync + 인자 배열 — 셸을 거치지 않으므로 대상 문자열로 명령 주입 불가. 대상은 ref 문자만 허용
const GIT_REF_RE = /^[A-Za-z0-9_.\/@{}^~-]{1,200}$/
function pushedCommitsDiscarded(target, dir) {
  if (!GIT_REF_RE.test(target) || target.startsWith('-')) return null
  const { execFileSync } = require('child_process')
  const run = (args) => execFileSync('git', args, { cwd: dir || undefined, encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  try {
    const total = Number(run(['rev-list', '--count', `${target}..HEAD`]))
    const unpushed = Number(run(['rev-list', '--count', `${target}..HEAD`, '--not', '--remotes']))
    if (!Number.isInteger(total) || !Number.isInteger(unpushed)) return null
    return total - unpushed
  } catch { return null }
}

function classifyGit(g, add, ctx) {
  if (!g || !g.sub) return
  if (g.subDyn) { add('unknown', 'git 서브커맨드를 정적으로 해석할 수 없습니다.'); return }
  const vals = g.args.map(a => cleanValue(a.value))
  if (g.sub === 'push') {
    const p = parsePushArgs(g.args)
    const force = p.force || p.refspecs.some(r => cleanValue(r.value).startsWith('+'))
    if (force) add('deny', 'force push는 히스토리를 덮어씁니다. 직접 실행하세요.')
    else add('ask', 'git push 는 사용자 확인이 필요합니다 (커밋·푸시는 명시적 요청 시에만).')
    return
  }
  if (g.sub === 'commit') { add('ask', 'git commit 은 사용자 확인이 필요합니다 (커밋·푸시는 명시적 요청 시에만).'); return }
  // reset --hard (2026-10-06 사용자 결정): 커밋 안 한 작업·푸시 안 된 커밋만 지우면 자동 허용(의도된 리셋),
  // 이미 푸시된 커밋을 지우면 차단(원격과 어긋나 되돌리기 어려움), 판정 불가(동적 대상·git 실패)면 확인.
  // git clean -f 는 자동 허용으로 전환 (같은 결정 — 이전엔 확인)
  if (g.sub === 'reset' && vals.includes('--hard')) {
    const targetArg = g.args.find(a => !cleanValue(a.value).startsWith('-'))
    if (targetArg && targetArg.dyn) { add('ask', 'git reset --hard 대상이 변수라 푸시 여부를 판정할 수 없습니다. 사용자 확인이 필요합니다.'); return }
    const target = targetArg ? cleanValue(targetArg.value) : 'HEAD'
    if (target === 'HEAD') return // 커밋 안 한 작업만 버림
    let dir = ctx && ctx.vcwd
    if (g.dir) {
      const r = resolveRmTarget(g.dir, dir)
      dir = r && !r.glob ? r.abs : null
      if (!dir) { add('ask', 'git -C 경로를 해석할 수 없어 푸시 여부를 판정할 수 없습니다. 사용자 확인이 필요합니다.'); return }
    }
    if (!dir) { add('ask', '현재 디렉토리를 알 수 없어 reset 대상의 푸시 여부를 판정할 수 없습니다. 사용자 확인이 필요합니다.'); return }
    const pushed = pushedCommitsDiscarded(target, dir)
    if (pushed === null) { add('ask', `git reset --hard ${target} 의 푸시 여부를 판정할 수 없습니다. 사용자 확인이 필요합니다.`); return }
    if (pushed > 0) add('deny', `git reset --hard ${target} 는 이미 푸시된 커밋 ${pushed}개를 지웁니다. 원격과 어긋나므로 차단합니다 — 직접 실행하세요.`)
    return
  }
}

// ── 2026-10-06 사용자 결정 추가 분류 ────────────────────────────────────────
// 개인키·인증 파일 판정은 protect-secrets.js 와 공유 (Read 도구와 Bash 의 판정 일관성)
let _isSecretReadPath = null
try { _isSecretReadPath = require('./protect-secrets.js').isSecretReadPath } catch { /* 미설치 → 검사 생략 */ }

// 인자 중 개인키·인증 파일(또는 ~/.ssh 디렉토리)을 가리키는 것이 있으면 차단 — cat·cp·grep·scp 등 명령 무관
function classifySecretArgs(inv, ctx, add) {
  if (!_isSecretReadPath) return
  for (const a of inv.args) {
    const raw = cleanValue(a.value)
    if (a.dyn && !/^\$(?:\{HOME\}|HOME)(?![A-Za-z0-9_])/.test(raw)) continue
    const v = raw.replace(/^-{1,2}[A-Za-z][\w-]*=/, '') // --file=~/.ssh/id_rsa
    if (!v || v.startsWith('-')) continue
    const r = resolveRmTarget({ ...a, value: v }, ctx.vcwd)
    if (r && _isSecretReadPath(r.abs)) { add('deny', `개인키·인증 파일(${v}) 접근은 차단됩니다. 필요하면 사용자가 직접 확인하세요.`); return }
  }
}

// gh — 조회는 자동, GitHub 에 반영되는 쓰기는 확인, 레포 삭제는 차단
const GH_VALUE_FLAGS = new Set(['-R', '--repo', '--hostname'])
const GH_READONLY_TOP = new Set(['auth', 'config', 'extension', 'alias', 'completion', 'help', 'version', 'status', 'search', 'browse'])
const GH_READONLY_ACTIONS = new Set(['view', 'list', 'ls', 'status', 'diff', 'checks', 'download', 'clone', 'checkout', 'watch', 'browse'])
function classifyGh(vals, add) {
  const pos = []
  for (let i = 0; i < vals.length; i++) {
    const v = vals[i]
    if (GH_VALUE_FLAGS.has(v)) { i++; continue }
    if (v.startsWith('-')) { if (pos.length === 0 && (v === '--version' || v === '--help')) return; continue }
    pos.push(v)
    if (pos.length === 2) break
  }
  const [sub, action] = pos
  if (!sub || GH_READONLY_TOP.has(sub)) return
  if (sub === 'api') {
    let write = false
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i]
      const m = /^(?:-X|--method)(?:=(.*))?$/.exec(v) || /^-X(.+)$/.exec(v)
      if (m) { const method = (m[1] !== undefined ? m[1] : vals[i + 1] || '').toUpperCase(); if (method !== 'GET') write = true }
      if (/^(?:-f|-F|--field|--raw-field|--input)(?:=|$)/.test(v)) write = true
    }
    if (write) add('ask', 'gh api 쓰기 요청(POST·PATCH·DELETE 등)은 GitHub 에 바로 반영돼 사용자 확인이 필요합니다.')
    return
  }
  if (sub === 'repo' && action === 'delete') { add('deny', 'gh repo delete 는 되돌릴 수 없어 차단됩니다. 직접 실행하세요.'); return }
  if (action && GH_READONLY_ACTIONS.has(action)) return
  add('ask', `gh ${sub}${action ? ' ' + action : ''} 는 GitHub 에 반영되는 작업이라 사용자 확인이 필요합니다.`)
}

// curl·wget 파일 업로드 — 데이터 유출 경로
function classifyUpload(nm, vals, add) {
  const reason = `${nm} 로 파일을 외부에 업로드하는 요청은 사용자 확인이 필요합니다.`
  if (nm === 'curl') {
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i]
      if (/^(?:-F|--form|--form-string|-T|--upload-file)(?:=|$)/.test(v) || (/^-[A-Za-z]*[FT]/.test(v) && !v.startsWith('--'))) { add('ask', reason); return }
      const dm = /^(?:-d|--data|--data-binary|--data-urlencode|--data-raw|--json)(?:=(.*))?$/.exec(v) || /^-d(.+)$/.exec(v)
      if (dm) {
        const val = dm[1] !== undefined ? dm[1] : (vals[i + 1] || '')
        if (/(?:^|=)@/.test(val)) { add('ask', reason); return }
      }
    }
  } else if (nm === 'wget') {
    if (vals.some(v => /^--(?:post-file|body-file)(?:=|$)/.test(v))) add('ask', reason)
  }
}

// 프로세스가 이 Claude 세션의 자손인가 — ps 로 부모를 거슬러 올라가 확인
// 세션 PID = 훅 프로세스의 조상 중 이름이 claude 인 가장 가까운 프로세스 (테스트는 BASH_GUARD_TEST_SESSION_PID 로 지정)
let _procTable = null
function procTable() {
  if (_procTable) return _procTable
  _procTable = new Map()
  try {
    const out = require('child_process').execFileSync('ps', ['-axo', 'pid=,ppid=,comm='], { encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] })
    for (const line of out.split('\n')) {
      const m = /^\s*(\d+)\s+(\d+)\s+(.*)$/.exec(line)
      if (m) _procTable.set(Number(m[1]), { ppid: Number(m[2]), comm: m[3].trim() })
    }
  } catch { /* ps 실패 → 빈 표 = 판정 불가 */ }
  return _procTable
}
function sessionPid() {
  const forced = Number(process.env.BASH_GUARD_TEST_SESSION_PID)
  if (Number.isInteger(forced) && forced > 1) return forced
  const t = procTable()
  let pid = process.ppid
  for (let hop = 0; pid > 1 && hop < 64; hop++) {
    const p = t.get(pid)
    if (!p) return null
    if (/(?:^|\/)claude(?:\.exe)?$/i.test(p.comm)) return pid
    pid = p.ppid
  }
  return null
}
function isSessionDescendant(pid, root) {
  if (!root || pid === root) return false
  const t = procTable()
  let cur = pid
  for (let hop = 0; cur > 1 && hop < 64; hop++) {
    const p = t.get(cur)
    if (!p) return false
    if (p.ppid === root) return true
    cur = p.ppid
  }
  return false
}

// docker 정리(prune)·볼륨 삭제, 일괄·강제 종료 — 다른 프로젝트 데이터·사용자 프로세스에 영향
function classifyDockerKill(nm, vals, add) {
  if (nm === 'docker' || nm === 'podman') {
    if (vals.includes('prune') || (vals.includes('volume') && (vals.includes('rm') || vals.includes('remove')))) {
      add('ask', `${nm} 정리·볼륨 삭제는 누가 만들었든 전부 지워 사용자 확인이 필요합니다.`)
    }
    return
  }
  if (nm === 'killall' || nm === 'pkill') { add('ask', `${nm} 는 이름으로 여러 프로세스를 한꺼번에 종료해 사용자 확인이 필요합니다.`); return }
  if (nm !== 'kill') return
  const forceIdx = vals.findIndex((v, i) => /^-(?:9|KILL|SIGKILL)$/i.test(v) || (v === '-s' && /^(?:9|KILL|SIGKILL)$/i.test(vals[i + 1] || '')))
  if (forceIdx < 0) return
  const targets = vals.filter((v, i) => !v.startsWith('-') && !(i > 0 && vals[i - 1] === '-s'))
  const root = sessionPid()
  const mine = targets.length > 0 && root && targets.every(v => /^\d+$/.test(v) && isSessionDescendant(Number(v), root))
  if (!mine) add('ask', 'kill -9 대상이 이 Claude 세션이 띄운 프로세스가 아니거나 확인할 수 없습니다. 사용자 확인이 필요합니다.')
}

// 명령 전체 위험 분류 — PreToolUse·PermissionRequest 공용 (판정 일관성)
// 반환: { level: 'deny'|'ask'|'unknown'|null, reason }
const _classifyCache = new Map()
function classifyShell(cmd, opts = {}) {
  const cwdIn = opts.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd()
  const key = `${opts.skipRm ? 1 : 0}\0${cwdIn}\0${(opts.allowedDirs || []).join(':')}\0${cmd}`
  if (_classifyCache.has(key)) return _classifyCache.get(key)

  let best = { level: null, reason: '' }
  const add = (level, reason) => { if ((LEVEL_RANK[level] || 0) > (LEVEL_RANK[best.level] || 0)) best = { level, reason } }

  const acc = analyzeShell(cmd)
  for (const u of acc.unknown) add('unknown', `명령을 정적으로 해석할 수 없습니다(${u}).`)

  let startCwd = null
  try { startCwd = path.resolve(cwdIn) } catch { /* ignore */ }
  const ctx = {
    vcwd: startCwd,
    startCwd,
    root: startCwd ? (findProjectRoot(startCwd) || startCwd) : null,
    allowedDirs: opts.allowedDirs || getAllowedDirs(cwdIn),
  }

  const pipelines = {}
  for (const inv of acc.invocations) {
    (pipelines[inv.pipeline] = pipelines[inv.pipeline] || []).push(inv)
    if (inv.dynamicName) { add('unknown', '명령 이름이 변수·치환이라 정적으로 판정할 수 없습니다.'); continue }
    if (inv.sudo) add('ask', 'sudo/doas 권한 상승 명령은 사용자 확인이 필요합니다.')
    const nm = inv.name
    const vals = inv.args.map(a => cleanValue(a.value))

    if (nm === 'cd' || nm === 'pushd' || nm === 'popd') {
      const t = inv.args.find(a => !/^-[LPe@]$/.test(a.value))
      if (inv.subshell || nm === 'popd') { ctx.vcwd = null; continue } // 서브셸 cd 는 부모에 영향 없음 → 추적 포기(보수)
      if (!t) { ctx.vcwd = HOME_DIR; continue }
      const r = resolveRmTarget(t, ctx.vcwd)
      ctx.vcwd = r && !r.glob && t.value !== '-' ? r.abs : null
      continue
    }
    classifySecretArgs(inv, ctx, add)
    if (nm === 'git') { classifyGit(inv.git, add, ctx); continue }
    if (nm === 'gh') { classifyGh(vals, add); continue }
    if (nm === 'curl' || nm === 'wget') { classifyUpload(nm, vals, add); continue }
    if (['docker', 'podman', 'kill', 'killall', 'pkill'].includes(nm)) { classifyDockerKill(nm, vals, add); continue }
    if (PUBLISHERS.has(nm)) {
      const cut = vals.indexOf('--')
      const head = (cut >= 0 ? vals.slice(0, cut) : vals).map(v => v.toLowerCase())
      if (head.includes('publish')) add('ask', '패키지 publish 는 사용자 확인이 필요합니다.')
      continue
    }
    if (nm === 'rm') { if (!opts.skipRm) classifyRm(inv, ctx, add); continue }
    if (nm === 'chmod') {
      if (vals.some(v => /^0?777$/.test(v) || /^(?:a|ugo)[+=]rwx$/.test(v))) add('deny', '777 권한 설정은 보안 위험입니다.')
      continue
    }
    if (nm === 'dd') { add('ask', 'dd 는 디스크·파일을 덮어쓸 수 있습니다. 사용자 확인이 필요합니다.'); continue }
    if (/^(?:mkfs|newfs)/.test(nm) || ['shutdown', 'reboot', 'halt', 'poweroff'].includes(nm)
      || (nm === 'diskutil' && vals.some(v => /^(?:erase|partition|zero|random|secureErase)/i.test(v)))) {
      add('ask', '시스템·디스크 변경 명령은 사용자 확인이 필요합니다.'); continue
    }
    // 원격 코드를 치환으로 받아 실행: bash <(curl …), sh -c "$(curl …)", eval "$(curl …)"
    if ((isInterpreterName(nm) || EXEC_SINKS.has(nm)) && inv.argSubst && acc.invocations.some(x => x.fromSub && FETCHERS.has(x.name))) {
      add('deny', '원격 스크립트 실행(치환으로 받은 코드 실행)은 차단됩니다.')
    }
  }
  // 원격 코드를 파이프로 받아 실행: curl … | sh / python3 / sudo bash
  for (const list of Object.values(pipelines)) {
    const f = list.findIndex(x => FETCHERS.has(x.name))
    if (f < 0) continue
    if (list.slice(f + 1).some(x => (isInterpreterName(x.name) || EXEC_SINKS.has(x.name)) && readsStdin(x))) {
      add('deny', '원격 스크립트 실행(curl|wget → 인터프리터)은 차단됩니다.')
    }
  }

  if (_classifyCache.size > 200) _classifyCache.clear()
  _classifyCache.set(key, best)
  return best
}

// 안전 패턴(allow) 함수들의 공통 게이트 — commit/push/publish/원격실행/동적명령이 섞이면 자동 허용 금지
// rm 경로는 각 함수가 allowedDirs 기준으로 따로 검사하므로 여기선 제외
function hasNonRmRisk(cmd, allowedDirs) {
  return classifyShell(cmd, { skipRm: true, allowedDirs: allowedDirs || [] }).level !== null
}

function denyResult(reason) {
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason } }
}

function handlePreToolUse(toolName, toolInput, cwd) {
  if (toolName !== 'Bash') return null

  const rawCmd = toolInput && toolInput.command
  if (rawCmd !== undefined && rawCmd !== null && typeof rawCmd !== 'string') return null
  const cmd = (rawCmd || '').trim()

  for (const { pattern, reason } of DENY_PATTERNS) {
    if (pattern.test(cmd)) return denyResult(reason)
  }

  // 명령 단위 위험 분류 — 우회 형태(파이프·체인·치환·래퍼)도 일반 형태와 같은 판정
  const risk = classifyShell(cmd, { cwd })
  if (risk.level === 'deny') return denyResult(risk.reason)
  if (risk.level === 'ask') {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: `bash-guard: ${risk.reason}`,
      },
    }
  }
  if (risk.level === 'unknown') return null // 정적 판정 불가 — allow 하지 않고 기본 권한 흐름에 맡긴다

  // 안전 패턴 자동 허용 — 휴리스틱 우회 (cd+git, heredoc, brace, compound, multiline shell)
  const allowedDirs = getAllowedDirs(cwd)
  if (isCdGitSafe(cmd, allowedDirs)
   || isHeredocSafe(cmd, allowedDirs)
   || isBraceExpansionSafe(cmd)
   || isCompoundSafe(cmd, allowedDirs)
   || isShellScriptSafe(cmd, allowedDirs)) {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'allow',
        permissionDecisionReason: 'bash-guard: 안전 패턴 자동 허용 (read-only 명령 + 안전한 경로/redirect + 위험 명령 없음)',
      },
    }
  }

  return null
}

// PermissionRequest — PreToolUse 와 같은 분류기를 재사용한다 (판정 일관성).
// 위험(deny/ask)·정적 판정 불가(unknown)는 자동 승인하지 않고 사용자 확인으로 넘긴다.
// 그 외 읽기 전용·일반 개발 명령은 프롬프트 마찰 제거 의도대로 자동 승인 유지.
function handlePermissionRequest(toolName, toolInput, cwd) {
  if (toolName !== 'Bash') return null

  const rawCmd = toolInput && toolInput.command
  if (rawCmd !== undefined && rawCmd !== null && typeof rawCmd !== 'string') return null
  if (rawCmd === null) return null
  const cmd = (rawCmd || '').trim()

  if (DENY_PATTERNS.some(({ pattern }) => pattern.test(cmd))) return null
  if (classifyShell(cmd, { cwd }).level !== null) return null // 사용자 확인 필요

  return {
    hookSpecificOutput: {
      hookEventName: 'PermissionRequest',
      decision: { behavior: 'allow' },
    },
  }
}

// 프로젝트 내부 .claude/ 모니터링 경로 — 삭제·이동 시 README 동기화 필요
// 셸 구문 단위(statement)로 판단 — node -e "..." 등 인수 내부 문자열은 제외
function postToolUseMonitoredPath(cmd) {
  // 세미콜론·&&·||·개행으로 구분된 개별 구문으로 분리
  const statements = cmd.split(/;|&&|\|\||\n/)
  return statements.some(stmt => {
    const s = stmt.trim()
    // 구문이 rm / mv 로 시작하고, 상대 경로 .claude/(hooks|skills|agents)/ 를 포함
    return /^(rm|mv)\s/.test(s) && /\s\.claude\/(hooks|skills|agents)\//.test(s)
  })
}

function handlePostToolUse(toolName, toolInput) {
  if (toolName !== 'Bash') return null

  const cmd = (toolInput.command || '').trim()

  if (postToolUseMonitoredPath(cmd)) {
    return {
      decision: 'block',
      reason: 'README.md 동기화 필요: .claude/ 경로 파일이 삭제·이동됐습니다. 프로젝트 구조도·목록·스킬 수를 README.md에 즉시 반영하세요.',
    }
  }

  return null
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()

  if (!raw) return process.exit(0)

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }

  const { hook_event_name, hookEventName, tool_name, tool_input = {}, cwd } = input
  const eventName = hook_event_name || hookEventName

  const result = eventName === 'PermissionRequest'
    ? handlePermissionRequest(tool_name, tool_input, cwd)
    : eventName === 'PostToolUse'
      ? handlePostToolUse(tool_name, tool_input)
      : handlePreToolUse(tool_name, tool_input, cwd)

  if (result) process.stdout.write(JSON.stringify(result) + '\n')

  process.exit(0)
}

// 테스트에서 import 가능하도록 export — main 모듈로 직접 실행될 때만 main() 호출
if (require.main === module) {
  main().catch(() => process.exit(0))
}

module.exports = {
  findProjectRoot,
  getAllowedDirs,
  isCdGitSafe,
  isHeredocSafe,
  isBraceExpansionSafe,
  isCompoundSafe,
  isStatementSafeForCompound,
  isShellScriptSafe,
  isLocalhostUrl,
  isReadOnlyPipeChain,
  isUnderAllowed,
  isUnderTempDir,
  handlePreToolUse,
  handlePermissionRequest,
  handlePostToolUse,
  analyzeShell,
  classifyShell,
  parseGitInvocation,
  parsePushArgs,
}
