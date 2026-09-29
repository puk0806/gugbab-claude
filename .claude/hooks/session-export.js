'use strict';
// Stop: 세션 대화 요약을 강제 보존 (y/N 선택과 무관하게 항상 동작)
//   - Stop(매 턴):  ~/.claude/projects/<해시>/exports/ 에만 기록 — 레포 git status를 오염시키지 않음
//   - --refresh:    커밋 배치 시점에 레포 exports/ 로 전체 요약 생성 (Y 프로젝트만, 직후 [export] 커밋)
//                   refresh는 트랜스크립트 전체를 다시 읽으므로 직전 push 턴 꼬리까지 포함됨
// Y/N 판별: 레포에 memory/ 디렉토리가 존재하면 Y (과거 symlink 감지 방식은 2026-07-10 폐기)
// 내용: 사용자 요청 + Claude 응답 텍스트(작업 보고) + 수정 파일 + Codex 리뷰 라운드 출력
// 도구 호출 원문·thinking 은 제외 (원본은 JSONL 트랜스크립트에 항상 남음)
// 수정 파일·도구 통계는 트랜스크립트의 tool_use 블록에서 직접 추출 — 다른 훅 의존 없음
const fs = require('fs');
const os = require('os');
const path = require('path');

const USER_TEXT_LIMIT = 1500;   // 사용자 요청 1건당 최대 길이
const CODEX_LINE_LIMIT = 120;   // Codex 라운드 파일 1개당 최대 라인

// ── 텍스트 정리 ─────────────────────────────────────────────────────────
function cleanUserText(text) {
  let t = text
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
    .replace(/<command-name>[\s\S]*?<\/command-name>/g, '')
    .replace(/<command-message>[\s\S]*?<\/command-message>/g, '')
    .replace(/<command-args>[\s\S]*?<\/command-args>/g, '')
    .replace(/<local-command-std(out|err)>[\s\S]*?<\/local-command-std\1>/g, '')
    .trim();
  if (!t || t.startsWith('[Request interrupted')) return null;
  if (t.length > USER_TEXT_LIMIT) t = t.slice(0, USER_TEXT_LIMIT) + '\n…(생략)';
  return t;
}

// ── 트랜스크립트 파싱 ───────────────────────────────────────────────────
const FILE_EDIT_TOOLS = ['Write', 'Edit', 'NotebookEdit'];

function parseTranscript(jsonlText) {
  const turns = [];   // { user: string|null, assistant: string[] }
  let title = null;
  let firstTs = null;
  let lastTs = null;
  let branch = null;
  let current = null;
  const toolCounts = {};      // { Write: 3, Bash: 12, ... }
  const modifiedFiles = [];   // Write/Edit/NotebookEdit 대상 file_path (중복 제거)

  for (const line of jsonlText.split('\n')) {
    if (!line.trim()) continue;
    let o;
    try { o = JSON.parse(line); } catch { continue; }

    if (o.type === 'ai-title' && typeof o.aiTitle === 'string') { title = o.aiTitle; continue; }
    if (o.type !== 'user' && o.type !== 'assistant') continue;
    if (o.isSidechain) continue;

    if (o.timestamp) {
      if (!firstTs) firstTs = o.timestamp;
      lastTs = o.timestamp;
    }
    if (o.gitBranch) branch = o.gitBranch;

    const content = o.message && o.message.content;

    if (o.type === 'user') {
      let text = null;
      if (typeof content === 'string') {
        text = cleanUserText(content);
      } else if (Array.isArray(content)) {
        if (content.some(b => b.type === 'tool_result')) continue; // 도구 결과 반환 — 사용자 발화 아님
        const joined = content.filter(b => b.type === 'text').map(b => b.text).join('\n');
        text = cleanUserText(joined);
      }
      if (text) {
        current = { user: text, assistant: [] };
        turns.push(current);
      }
      continue;
    }

    // assistant — text 블록 수집 (thinking 제외) + tool_use 통계 추출
    if (!Array.isArray(content)) continue;
    for (const b of content) {
      if (b.type === 'tool_use' && b.name) {
        toolCounts[b.name] = (toolCounts[b.name] || 0) + 1;
        const fp = b.input && b.input.file_path;
        if (FILE_EDIT_TOOLS.includes(b.name) && fp && !modifiedFiles.includes(fp)) {
          modifiedFiles.push(fp);
        }
        continue;
      }
      if (b.type !== 'text' || !b.text || !b.text.trim()) continue;
      if (!current) {
        current = { user: null, assistant: [] };
        turns.push(current);
      }
      current.assistant.push(b.text.trim());
    }
  }

  return { turns, title, firstTs, lastTs, branch, toolCounts, modifiedFiles };
}

// ── Codex 리뷰 라운드 파일 수집 (세션 시작 이후 생성분만) ────────────────
function collectCodexRounds(sessionStartMs) {
  const rounds = [];
  for (let i = 1; i <= 3; i++) {
    const fp = `/tmp/codex-r${i}.txt`;
    try {
      const st = fs.statSync(fp);
      if (st.mtimeMs < sessionStartMs) continue; // 이전 세션 잔재 제외
      const lines = fs.readFileSync(fp, 'utf8').split('\n');
      let body = lines.slice(0, CODEX_LINE_LIMIT).join('\n');
      if (lines.length > CODEX_LINE_LIMIT) body += `\n…(${lines.length - CODEX_LINE_LIMIT}줄 생략)`;
      rounds.push({ round: i, body });
    } catch { /* 파일 없음 */ }
  }
  return rounds;
}

// ── markdown 생성 ───────────────────────────────────────────────────────
function localDate(iso) {
  const d = iso ? new Date(iso) : new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function buildMarkdown(parsed, sessionId, codexRounds) {
  const { turns, title, firstTs, lastTs, branch, toolCounts, modifiedFiles } = parsed;
  const lines = [];

  lines.push(`# 세션 요약 — ${title || '(제목 없음)'}`);
  lines.push('');
  lines.push(`- 세션: \`${sessionId}\``);
  lines.push(`- 기간: ${firstTs || '?'} ~ ${lastTs || '?'}`);
  if (branch) lines.push(`- 브랜치: \`${branch}\``);
  const toolStr = Object.entries(toolCounts).map(([t, c]) => `${t} ${c}회`).join(' · ');
  if (toolStr) lines.push(`- 도구 사용: ${toolStr}`);
  if (modifiedFiles.length) {
    lines.push(`- 수정 파일 (${modifiedFiles.length}):`);
    for (const f of modifiedFiles) lines.push(`  - \`${f}\``);
  }
  lines.push('');
  lines.push('## 대화');
  lines.push('');

  let n = 0;
  for (const turn of turns) {
    n++;
    if (turn.user) {
      lines.push(`### [${n}] 요청`);
      lines.push('');
      lines.push(turn.user);
    } else {
      lines.push(`### [${n}] (자동 재개)`);
    }
    if (turn.assistant.length) {
      lines.push('');
      lines.push('**응답**');
      lines.push('');
      lines.push(turn.assistant.join('\n\n'));
    }
    lines.push('');
  }

  if (codexRounds.length) {
    lines.push('## Codex 리뷰 기록');
    lines.push('');
    for (const r of codexRounds) {
      lines.push(`### Round ${r.round}`);
      lines.push('');
      lines.push('```');
      lines.push(r.body);
      lines.push('```');
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ── 저장 위치 판정 ──────────────────────────────────────────────────────
// Stop(toRepo=false): 항상 로컬 exports/ — 매 턴 기록이 레포를 dirty로 만들지 않도록
// --refresh(toRepo=true): 레포에 memory/ 있으면(Y) 레포 exports/, 아니면(N) 로컬
function resolveDest(transcriptPath, toRepo = false, projectDir = process.env.CLAUDE_PROJECT_DIR) {
  const localDir = path.dirname(transcriptPath);
  const repoRoot = projectDir;
  if (toRepo) {
    try {
      if (repoRoot && fs.statSync(path.join(repoRoot, 'memory')).isDirectory()) {
        return { destDir: path.join(repoRoot, 'exports'), repoRoot };
      }
    } catch { /* memory 없음 → N 모드 */ }
  }
  return { destDir: path.join(localDir, 'exports'), repoRoot: null };
}

// ── 메인 ────────────────────────────────────────────────────────────────
function main(input, toRepo = false, projectDir = process.env.CLAUDE_PROJECT_DIR) {
  const data = JSON.parse(input);
  const sessionId = data.session_id;
  const transcriptPath = data.transcript_path;
  if (!sessionId || !transcriptPath || !fs.existsSync(transcriptPath)) return;

  const parsed = parseTranscript(fs.readFileSync(transcriptPath, 'utf8'));
  if (parsed.turns.length === 0) return; // 기록할 대화 없음

  const startMs = parsed.firstTs ? new Date(parsed.firstTs).getTime() : 0;
  const codexRounds = collectCodexRounds(startMs);

  const md = buildMarkdown(parsed, sessionId, codexRounds);
  const { destDir } = resolveDest(transcriptPath, toRepo, projectDir);
  const fileName = `${localDate(parsed.firstTs)}-${sessionId.slice(0, 8)}.md`;

  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(path.join(destDir, fileName), md);
  // 레포 저장(--refresh)도 워킹트리까지만 — 커밋·푸시는 사용자가 직접 (2026-07-10 자동 커밋 제거)
}

// ── 프로젝트 저장소 경로 (memory-pull·memory-sync 와 공유) ────────────────
// Claude Code 는 프로젝트 경로의 영숫자 외 모든 문자(UTF-16 코드 유닛 단위)를 '-' 로 바꿔
// ~/.claude/projects/<인코딩> 에 트랜스크립트·memory 를 둔다. 2026-09-26 실측(Claude Code 2.1.282):
//   ".../scratchpad/enc test.v1 한글_x@y+z" → "...-scratchpad-enc-test-v1----x-y-z", "e😀m" → "e--m"
// 구 규칙(/ 와 _ 만 치환)은 점·공백·비ASCII 경로에서 엉뚱한 디렉토리를 만들었다.
// 주의: 매우 긴 경로의 축약 규칙은 미실측 → 훅 입력의 transcript_path 가 있으면 그 디렉토리를 우선한다.
function encodeProjectPath(p) {
  if (typeof p !== 'string' || p === '') return null;
  return p.replace(/[^a-zA-Z0-9]/g, '-');
}

// transcript_path 가 ~/.claude/projects/<dir>/<file> 형태(바로 한 단계 아래)일 때만 신뢰한다 —
// 그 밖의 경로(상위 탈출·중첩·다른 루트)는 무시하고 인코딩으로 폴백한다.
function projectStoreDir(homeDir, projectDir, transcriptPath) {
  const root = path.join(homeDir, '.claude', 'projects');
  if (typeof transcriptPath === 'string' && transcriptPath) {
    const dir = path.dirname(path.resolve(transcriptPath));
    if (path.dirname(dir) === root && path.basename(dir) && dir !== root) return dir;
  }
  const enc = encodeProjectPath(projectDir);
  return enc ? path.join(root, enc) : null;
}

// Bash 도구 등 훅 밖에서 실행되면 CLAUDE_PROJECT_DIR 가 없다(공식: 훅·MCP·LSP 프로세스에만 설정).
// env → git 최상위 → cwd 순으로 폴백한다.
function gitToplevel(cwd) {
  try {
    const out = require('child_process').execFileSync('git', ['rev-parse', '--show-toplevel'],
      { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).trim();
    return out || null;
  } catch { return null; }
}
function resolveProjectDir(env = process.env, cwd = process.cwd()) {
  if (env && typeof env.CLAUDE_PROJECT_DIR === 'string' && env.CLAUDE_PROJECT_DIR) return env.CLAUDE_PROJECT_DIR;
  return gitToplevel(cwd) || cwd;
}

// ── --refresh: 커밋·푸시 직전 수동 최신화 ──────────────────────────────
// Stop 이벤트 없이 현재 세션(가장 최근에 기록 중인 .jsonl) 요약을 즉시 재생성.
// 커밋 시 메모리 정리 절차(memory-sync.md)의 2단계에서 Claude가 직접 실행한다.
function resolveRefreshTarget(homeDir, projectDir) {
  if (!projectDir) return null;
  const localDir = projectStoreDir(homeDir, projectDir, null);
  let entries;
  try { entries = fs.readdirSync(localDir); } catch { return null; }
  const jsonls = entries
    .filter(f => f.endsWith('.jsonl'))
    .map(f => ({ f, mtime: fs.statSync(path.join(localDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (jsonls.length === 0) return null;
  return {
    session_id: path.basename(jsonls[0].f, '.jsonl'),
    transcript_path: path.join(localDir, jsonls[0].f),
  };
}

// 세션을 시작한 경로(=저장소 키)는 git 최상위와 다를 수 있고(서브디렉토리 시작), macOS 는 /tmp ↔ /private/tmp
// 처럼 realpath 가 다를 수 있다 → 후보를 차례로 시도해 트랜스크립트가 있는 첫 경로를 쓴다.
function refreshCandidates(env = process.env, cwd = process.cwd()) {
  const raw = [];
  if (env && typeof env.CLAUDE_PROJECT_DIR === 'string' && env.CLAUDE_PROJECT_DIR) raw.push(env.CLAUDE_PROJECT_DIR);
  const top = gitToplevel(cwd);
  if (top) raw.push(top);
  raw.push(cwd);
  const out = [];
  for (const p of raw) {
    for (const v of [p, (() => { try { return fs.realpathSync(p); } catch { return null; } })()]) {
      if (v && !out.includes(v)) out.push(v);
    }
  }
  return out;
}

module.exports = {
  parseTranscript, buildMarkdown, resolveDest, cleanUserText, resolveRefreshTarget,
  encodeProjectPath, projectStoreDir, resolveProjectDir, refreshCandidates,
};

if (require.main === module) {
  if (process.argv.includes('--refresh')) {
    try {
      let done = false;
      for (const projectDir of refreshCandidates()) {
        const target = resolveRefreshTarget(os.homedir(), projectDir);
        if (!target) continue;
        main(JSON.stringify(target), true, projectDir); // 레포 exports/ 로 생성 (Y 프로젝트)
        process.stdout.write(`[session-export] refresh 완료: ${target.session_id.slice(0, 8)} (${projectDir})\n`);
        done = true;
        break;
      }
      // 무음 no-op 금지 — 찾지 못했으면 이유를 알린다 (exit 0: 커밋 흐름 비차단)
      if (!done) process.stdout.write(`[session-export] refresh 대상 세션을 찾지 못함 — 확인한 경로: ${refreshCandidates().join(', ')}\n`);
    } catch (e) { process.stdout.write(`[session-export] refresh 실패(비차단): ${e.message}\n`); }
    process.exit(0);
  }
  let input = '';
  process.stdin.on('data', d => (input += d));
  process.stdin.on('end', () => {
    try { main(input); } catch { /* Claude 작업 절대 차단 금지 */ }
    process.exit(0);
  });
}
