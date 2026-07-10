'use strict';
// Stop: 세션 대화 요약을 강제 보존 (y/N 선택과 무관하게 항상 동작)
//   - memory 공유(Y) 모드: <레포>/exports/ 에 저장 (워킹트리만 — 커밋·푸시는 사용자가 직접)
//   - 비공유(N) 모드:     ~/.claude/projects/<해시>/exports/ 에 저장 (로컬 전용)
// Y/N 판별: 레포에 memory/ 디렉토리가 존재하면 Y (과거 symlink 감지 방식은 2026-07-10 폐기)
// 내용: 사용자 요청 + Claude 응답 텍스트(작업 보고) + 수정 파일 + Codex 리뷰 라운드 출력
// 도구 호출 원문·thinking 은 제외 (원본은 JSONL 트랜스크립트에 항상 남음)
// 수정 파일·도구 통계는 트랜스크립트의 tool_use 블록에서 직접 추출 — 다른 훅 의존 없음
const fs = require('fs');
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

// ── 저장 위치 판정: 레포에 memory/ 디렉토리 존재 → Y(레포) / 아니면 N(로컬) ──
function resolveDest(transcriptPath) {
  const localDir = path.dirname(transcriptPath);
  const repoRoot = process.env.CLAUDE_PROJECT_DIR;
  try {
    if (repoRoot && fs.statSync(path.join(repoRoot, 'memory')).isDirectory()) {
      return { destDir: path.join(repoRoot, 'exports'), repoRoot };
    }
  } catch { /* memory 없음 → N 모드 */ }
  return { destDir: path.join(localDir, 'exports'), repoRoot: null };
}

// ── 메인 ────────────────────────────────────────────────────────────────
function main(input) {
  const data = JSON.parse(input);
  const sessionId = data.session_id;
  const transcriptPath = data.transcript_path;
  if (!sessionId || !transcriptPath || !fs.existsSync(transcriptPath)) return;

  const parsed = parseTranscript(fs.readFileSync(transcriptPath, 'utf8'));
  if (parsed.turns.length === 0) return; // 기록할 대화 없음

  const startMs = parsed.firstTs ? new Date(parsed.firstTs).getTime() : 0;
  const codexRounds = collectCodexRounds(startMs);

  const md = buildMarkdown(parsed, sessionId, codexRounds);
  const { destDir, repoRoot } = resolveDest(transcriptPath);
  const fileName = `${localDate(parsed.firstTs)}-${sessionId.slice(0, 8)}.md`;

  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(path.join(destDir, fileName), md);
  // Y 모드도 워킹트리 저장까지만 — 커밋·푸시는 사용자가 직접 (2026-07-10 자동 커밋 제거)
}

module.exports = { parseTranscript, buildMarkdown, resolveDest, cleanUserText };

if (require.main === module) {
  let input = '';
  process.stdin.on('data', d => (input += d));
  process.stdin.on('end', () => {
    try { main(input); } catch { /* Claude 작업 절대 차단 금지 */ }
    process.exit(0);
  });
}
