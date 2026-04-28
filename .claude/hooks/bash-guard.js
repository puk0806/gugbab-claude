#!/usr/bin/env node
/**
 * bash-guard.js
 * Claude Code PreToolUse + PermissionRequest Hook
 *
 * 목적: Bash 명령어 안전 관리
 *
 * PreToolUse:
 *   - 위험한 Bash 패턴 → deny
 *   - 안전한 cd+git / heredoc 패턴 → allow (Claude Code 하드코딩 휴리스틱 우회)
 *   - 그 외 → null (다른 훅에 위임)
 *
 * PermissionRequest:
 *   - git commit / git push → null (사용자 확인 필요)
 *   - 그 외 Bash → allow
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

const DENY_PATTERNS = [
  // verification.md / SKILL.md를 Bash(sed/awk/perl/echo/cat)로 직접 수정 차단
  { pattern: /\bsed\b.*verification\.md/, reason: 'verification.md는 Bash(sed)로 수정할 수 없습니다. Write/Edit 도구를 사용하세요 (verification-guard 훅 통과 필수).' },
  { pattern: /\bsed\b.*SKILL\.md/, reason: 'SKILL.md는 Bash(sed)로 수정할 수 없습니다. Write/Edit 도구를 사용하세요.' },
  { pattern: /\bawk\b.*verification\.md/, reason: 'verification.md는 Bash(awk)로 수정할 수 없습니다. Write/Edit 도구를 사용하세요.' },
  { pattern: /\bawk\b.*SKILL\.md/, reason: 'SKILL.md는 Bash(awk)로 수정할 수 없습니다. Write/Edit 도구를 사용하세요.' },
  { pattern: /\bperl\b.*-[ip].*verification\.md/, reason: 'verification.md는 Bash(perl)로 수정할 수 없습니다. Write/Edit 도구를 사용하세요.' },
  { pattern: /\bperl\b.*-[ip].*SKILL\.md/, reason: 'SKILL.md는 Bash(perl)로 수정할 수 없습니다. Write/Edit 도구를 사용하세요.' },
  { pattern: /\becho\b.*>.*verification\.md/, reason: 'verification.md는 Bash(echo)로 수정할 수 없습니다. Write/Edit 도구를 사용하세요.' },
  { pattern: /\bcat\b.*>.*verification\.md/, reason: 'verification.md는 Bash(cat)로 수정할 수 없습니다. Write/Edit 도구를 사용하세요.' },
  // 기존 위험 패턴
  { pattern: /git\s+push\s+(--force|-f)\b/, reason: 'force push는 히스토리를 덮어씁니다. 직접 실행하세요.' },
  { pattern: /git\s+push\s+.*-f\b/, reason: 'force push 감지. 직접 실행하세요.' },
  { pattern: /rm\s+-rf\s+\/(bin|boot|dev|etc|lib|lib64|proc|root|sbin|sys|usr|var)(\/|$|\s|$)/, reason: '시스템 디렉토리 삭제는 차단됩니다.' },
  { pattern: /rm\s+-rf\s+\/$/, reason: '루트 디렉토리 삭제는 차단됩니다.' },
  { pattern: /rm\s+-rf\s+\/\s/, reason: '루트 디렉토리 삭제는 차단됩니다.' },
  { pattern: /rm\s+-rf\s+\.\.\//, reason: '상위 디렉토리 삭제는 차단됩니다.' },
  { pattern: /curl\s+.*\|\s*(ba)?sh/, reason: '원격 스크립트 실행(curl|bash)은 차단됩니다.' },
  { pattern: /wget\s+.*\|\s*(ba)?sh/, reason: '원격 스크립트 실행(wget|bash)은 차단됩니다.' },
  { pattern: /chmod\s+777/, reason: '777 권한 설정은 보안 위험입니다.' },
  { pattern: /git\s+reset\s+--hard\s+HEAD~[2-9]\d*/, reason: '10개 이상의 커밋 되돌리기는 위험합니다. 직접 실행하세요.' },
  { pattern: /:\s*\(\)\s*\{.*:\|:.*\}/, reason: 'Fork bomb 패턴 감지. 차단합니다.' },
]

const REQUIRE_APPROVAL_PATTERNS = [
  /git\s+commit\b/,
  /git\s+push\b/,
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

function handlePreToolUse(toolName, toolInput, cwd) {
  if (toolName !== 'Bash') return null

  const cmd = (toolInput.command || '').trim()

  for (const { pattern, reason } of DENY_PATTERNS) {
    if (pattern.test(cmd)) {
      return {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: reason,
        },
      }
    }
  }

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

function handlePermissionRequest(toolName, toolInput) {
  if (toolName !== 'Bash') return null

  const cmd = (toolInput.command || '').trim()
  for (const pattern of REQUIRE_APPROVAL_PATTERNS) {
    if (pattern.test(cmd)) return null // 사용자 확인 필요
  }

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
    ? handlePermissionRequest(tool_name, tool_input)
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
}
