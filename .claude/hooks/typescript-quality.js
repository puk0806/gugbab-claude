// PostToolUse Write|Edit — .ts/.tsx 저장 시 tsc --noEmit 자동 실행 (오류 있으면 차단)
//
// 옵션:
//   --changed-only  레거시 대형 프로젝트 모드. 전체 프로젝트를 검사하되
//                   ① --incremental 로 2회차부터 빠르게 (tsBuildInfo·베이스라인은 ~/.claude/typescript-quality/ 에 보관 — 레포 오염 없음, 재부팅에도 유지)
//                   ② 타임아웃 30s → 180s
//                   ③ 차단 판정은 "이번 저장으로 *새로 생긴* 에러"만으로 한다:
//                      - 방금 저장한 파일의 에러 중 이전 실행(베이스라인)에 없던 것
//                      - 다른 파일에서 새로 생긴 에러 (공유 타입·export 시그니처를 바꿔 소비자가 깨진 경우 —
//                        2026-08-26 Codex 리뷰 지적: 편집 파일만 보면 이 회귀를 통째로 놓친다)
//                      기존 에러가 수백 건인 코드베이스에서 무관한 에러 때문에 모든 편집이 막히는 문제는
//                      베이스라인(직전 통과 시점의 에러 집합)과의 차집합으로 해결한다.
//                      exit 0 일 때만 베이스라인을 갱신한다 (차단된 실행의 에러를 흡수하면 다음 저장이 그냥 통과해버린다).
//                      에러 키는 `파일|TS코드|메시지` — 줄 번호를 빼서 편집으로 줄이 밀린 기존 에러가 "새 에러"로 오인되지 않게 한다.
//                      단, 키별 **개수(multiset)** 를 보관한다 — 집합으로 두면 같은 파일에 같은 메시지의 에러가 하나 더
//                      생겨도 구분이 안 돼 통과한다 (Codex R2 지적). 개수가 늘어난 만큼을 새 에러로 본다.
//   --seed          베이스라인만 생성하고 종료 (차단 없음). 설치 스크립트가 레거시 프로파일 설치 직후 호출한다.
//                   베이스라인이 없는 첫 저장은 비교 기준이 없어 편집 파일의 에러로만 판정할 수밖에 없는데(다른 파일의
//                   회귀를 그 한 번은 놓친다 — Codex R2 지적), 설치 시점에 시드해 두면 그 공백이 없다.
//                   `--project <dir>` 로 tsconfig.json 이 있는 디렉토리를 지정한다 (기본: cwd).
//   --timeout-ms=N  tsc 타임아웃 재정의 (테스트·초대형 레포용).
//
// 타임아웃 정책 (Codex R2): 1회 타임아웃은 일시 장애로 보고 경고만(exit 0), **연속 2회째부터는 차단(exit 2)** —
//   tsc가 계속 안 끝나는 상태로 저장이 무검사 통과되는 것을 막는다. 정상 완료(통과·에러 모두) 시 카운터 리셋.
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const ARGV = process.argv.slice(2);
const CHANGED_ONLY = ARGV.includes('--changed-only');
const SEED = ARGV.includes('--seed');
const argValue = (name) => {
  const i = ARGV.indexOf(name);
  if (i >= 0 && ARGV[i + 1]) return ARGV[i + 1];
  const eq = ARGV.find(a => a.startsWith(name + '='));
  return eq ? eq.slice(name.length + 1) : null;
};
const TIMEOUT_OVERRIDE = Number(argValue('--timeout-ms')) || null;

const ANSI_RE = /\x1b\[[0-9;]*m/g;
// tsc 진단 줄: `src/a.ts(3,7): error TS2322: ...` 또는 `src/a.ts:3:7 - error TS2322: ...`(pretty)
const DIAG_RE = /^(.*?)(?:\((\d+),(\d+)\)|:(\d+):(\d+)(?:\s+-)?):?\s+error\s+(TS\d+):\s*(.*)$/;

// 진단 줄 → { file, code, msg, key } (파일 접두어가 없는 전역 에러는 file='')
function parseDiag(line) {
  const m = DIAG_RE.exec(line);
  if (m) return { file: m[1].trim(), code: m[6], msg: m[7].trim(), key: `${m[1].trim()}|${m[6]}|${m[7].trim()}` };
  const g = /^error\s+(TS\d+):\s*(.*)$/.exec(line);
  if (g) return { file: '', code: g[1], msg: g[2].trim(), key: `|${g[1]}|${g[2].trim()}` };
  return null;
}

// 프로젝트별 상태 파일 경로 (증분 캐시·베이스라인·타임아웃 카운터). 같은 프로젝트면 세션이 달라도 재사용.
// 저장 위치는 사용자 홈의 `~/.claude/typescript-quality/` — 재부팅·tmp 정리에도 남아야 한다
// (Codex R3: tmp에 두면 재부팅 후 첫 저장이 베이스라인 없는 폴백으로 떨어져 소비자 회귀를 놓친다).
// 대상 레포 안에는 쓰지 않는다 (untracked 파일로 git status 오염). 홈에 못 쓰면 tmp로 폴백.
// 테스트는 TSQ_STATE_DIR 로 위치를 바꾼다.
function stateDir() {
  const candidates = [process.env.TSQ_STATE_DIR, path.join(os.homedir(), '.claude', 'typescript-quality'), os.tmpdir()].filter(Boolean);
  for (const d of candidates) {
    try { fs.mkdirSync(d, { recursive: true }); fs.accessSync(d, fs.constants.W_OK); return d; } catch {}
  }
  return os.tmpdir();
}
function stateFiles(projectRoot) {
  const key = crypto.createHash('sha1').update(projectRoot).digest('hex').slice(0, 12);
  const dir = stateDir();
  return {
    buildInfo: path.join(dir, `claude-tsq-${key}.tsbuildinfo`),
    baseline: path.join(dir, `claude-tsq-${key}.baseline.json`),
    timeouts: path.join(dir, `claude-tsq-${key}.timeouts`),
  };
}
// 베이스라인 = { key: count } (2026-08-26 이전의 배열 형식도 읽는다 — 각 키 count 1로 취급)
const countKeys = (diags) => { const m = new Map(); for (const d of diags) m.set(d.key, (m.get(d.key) || 0) + 1); return m; };
const saveBaseline = (file, counts) => { try { fs.writeFileSync(file, JSON.stringify(Object.fromEntries(counts))); } catch {} };
const loadBaseline = (file) => {
  try {
    if (!fs.existsSync(file)) return null;
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    const m = new Map();
    if (Array.isArray(raw)) { for (const k of raw) if (typeof k === 'string') m.set(k, (m.get(k) || 0) + 1); return m; }
    if (raw && typeof raw === 'object') {
      for (const [k, v] of Object.entries(raw)) if (Number.isInteger(v) && v > 0) m.set(k, v);
      return m;
    }
    return null;
  } catch { return null; }
};
const readTimeouts = (file) => { try { return parseInt(fs.readFileSync(file, 'utf8'), 10) || 0; } catch { return 0; } };
const writeTimeouts = (file, n) => { try { if (n > 0) fs.writeFileSync(file, String(n)); else fs.unlinkSync(file); } catch {} };

// tsc 실행 → { ok:true } | { timeout:true } | { ok:false, diags, lines }
function runTsc(projectRoot, { incremental, timeout }) {
  // 프로젝트 로컬 컴파일러만 사용 — `--yes` 는 로컬에 typescript 가 없으면 레지스트리에서 임의 버전을 받아
  // 실행하므로 결과가 머신마다 달라진다 (Codex R3). 로컬에 없으면 npx 가 비정상 종료 → 도구 장애 경로로 차단·안내.
  let cmd = 'npx --no-install tsc --noEmit';
  if (incremental) cmd += ` --incremental --tsBuildInfoFile "${stateFiles(projectRoot).buildInfo}"`;
  try {
    execSync(`cd "${projectRoot}" && ${cmd} 2>&1`, { timeout, stdio: ['ignore', 'pipe', 'pipe'] });
    return { ok: true, diags: [], lines: [] };
  } catch (e) {
    const output = (e.stdout || e.stderr || '').toString().trim();
    // execSync 타임아웃: code='ETIMEDOUT', signal='SIGTERM', status=null (killed 는 undefined 일 수 있음)
    if (e.code === 'ETIMEDOUT' || e.killed === true || (e.status === null && e.signal === 'SIGTERM')) return { timeout: true };
    const lines = output.replace(ANSI_RE, '').split('\n').filter(Boolean); // tsconfig pretty 등 ANSI 제거
    const diags = lines.map(parseDiag).filter(Boolean);
    // 비정상 종료인데 인식 가능한 진단이 하나도 없다 = 타입 에러가 아니라 *도구 장애*
    // (tsc 바이너리 없음·npx 실패·로더 크래시·출력 없는 exit≠0). 통과로 취급하면 게이트가 조용히 꺼진다 (Codex R3).
    if (diags.length === 0) return { toolFailure: true, lines };
    return { ok: false, lines, diags };
  }
}

// ── --seed: 베이스라인만 생성 ──────────────────────────────────────────────
if (SEED) {
  const projectRoot = path.resolve(argValue('--project') || process.cwd());
  if (!fs.existsSync(path.join(projectRoot, 'tsconfig.json'))) {
    process.stderr.write(`[typescript-quality] --seed: ${projectRoot} 에 tsconfig.json 이 없습니다\n`);
    process.exit(1);
  }
  const st = stateFiles(projectRoot);
  const r = runTsc(projectRoot, { incremental: true, timeout: TIMEOUT_OVERRIDE || 600000 });
  if (r.timeout) {
    process.stderr.write(`[typescript-quality] --seed: tsc 타임아웃 — 베이스라인을 만들지 못했습니다. --timeout-ms 를 늘려 재시도하세요\n`);
    process.exit(1);
  }
  if (r.toolFailure) {
    process.stderr.write(`[typescript-quality] --seed: tsc 가 진단 없이 실패했습니다 (도구 장애) — 베이스라인을 만들지 않습니다:\n`);
    r.lines.slice(0, 10).forEach(l => process.stderr.write(`  ${l}\n`));
    process.exit(1);
  }
  const counts = countKeys(r.diags);
  saveBaseline(st.baseline, counts);
  writeTimeouts(st.timeouts, 0);
  process.stdout.write(`[typescript-quality] 베이스라인 생성: 기존 TS 에러 ${r.diags.length}건 기록 (${st.baseline})\n`);
  process.exit(0);
}

try {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  const filePath = input.tool_input?.file_path || input.tool_input?.path;
  if (!filePath) process.exit(0);

  const ext = path.extname(filePath);
  if (!['.ts', '.tsx'].includes(ext)) process.exit(0);

  // tsconfig.json 탐색 (최대 5단계 상위)
  let dir = path.dirname(filePath);
  let tsconfig = null;
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, 'tsconfig.json');
    try {
      if (fs.existsSync(candidate)) { tsconfig = candidate; break; }
    } catch {}
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (!tsconfig) process.exit(0);

  const projectRoot = path.dirname(tsconfig);
  const st = stateFiles(projectRoot);
  const timeout = TIMEOUT_OVERRIDE || (CHANGED_ONLY ? 180000 : 30000);

  const r = runTsc(projectRoot, { incremental: CHANGED_ONLY, timeout });

  if (r.timeout) {
    const n = readTimeouts(st.timeouts) + 1;
    writeTimeouts(st.timeouts, n);
    if (n >= 2) {
      process.stderr.write(
        `[typescript-quality] ❌ tsc 가 ${Math.round(timeout / 1000)}s 안에 끝나지 않는 상태가 ${n}회 연속입니다 — 무검사 통과를 막기 위해 차단합니다.\n` +
        `  조치: 프로젝트에서 직접 \`npx tsc --noEmit\` 을 실행해 소요 시간·원인을 확인하고, settings.json 배선에 --timeout-ms=<ms> 를 추가하거나\n` +
        `  \`node .claude/hooks/typescript-quality.js --seed --project <tsconfig 디렉토리>\` 로 증분 캐시·베이스라인을 미리 만들어 두세요.\n`
      );
      process.exit(2);
    }
    process.stderr.write(
      `[typescript-quality] ⚠ tsc 가 ${Math.round(timeout / 1000)}s 안에 끝나지 않아 이번 검사를 건너뜁니다 (1회 경고 — 다음에도 타임아웃이면 차단).` +
      (CHANGED_ONLY ? '' : ' 대형 프로젝트면 settings.json 배선에 --changed-only 를 추가하세요.') + '\n'
    );
    process.exit(0);
  }
  if (r.toolFailure) {
    // 타임아웃과 같은 정책: 1회 경고, 연속 2회째부터 차단. 통과로 취급하면 게이트가 조용히 꺼진다.
    const n = readTimeouts(st.timeouts) + 1;
    writeTimeouts(st.timeouts, n);
    const head = r.lines.slice(0, 6).map(l => `  ${l}`).join('\n');
    if (n >= 2) {
      process.stderr.write(
        `[typescript-quality] ❌ tsc 가 타입 진단 없이 비정상 종료하는 상태가 ${n}회 연속입니다 (도구 장애 — 무검사 통과를 막기 위해 차단):\n${head}\n` +
        `  조치: 프로젝트에서 \`npx --no-install tsc --noEmit\` 을 직접 실행해 원인을 해결하세요. 로컬에 typescript 가 없으면 devDependency로 설치해야 합니다(이 훅은 레지스트리에서 받아 실행하지 않습니다).\n`
      );
      process.exit(2);
    }
    process.stderr.write(`[typescript-quality] ⚠ tsc 가 타입 진단 없이 비정상 종료했습니다 (1회 경고 — 다음에도 실패하면 차단):\n${head}\n`);
    process.exit(0);
  }
  writeTimeouts(st.timeouts, 0); // 정상 완료 → 카운터 리셋

  if (r.ok) {
    if (CHANGED_ONLY) saveBaseline(st.baseline, new Map()); // 통과 — 에러 0건이 새 베이스라인
    process.exit(0);
  }

  if (CHANGED_ONLY) {
    const diags = r.diags; // 여기 도달했으면 diags.length > 0 (진단 없는 실패는 위 toolFailure 경로)
    const currentCounts = countKeys(diags);

    // tsc 출력 경로는 projectRoot 기준 상대경로
    const rel = path.relative(projectRoot, filePath).split(path.sep).join('/');
    const baseline = loadBaseline(st.baseline);

    let offenders;
    if (baseline) {
      // 베이스라인 대비 *새로 생긴* 에러 — 파일 불문 (소비자 파일의 회귀 포함).
      // 같은 키가 베이스라인보다 많이 나오면 초과분만 새 에러로 본다 (multiset 차집합)
      const seen = new Map();
      offenders = diags.filter(d => {
        const n = (seen.get(d.key) || 0) + 1; seen.set(d.key, n);
        return n > (baseline.get(d.key) || 0);
      });
    } else {
      // 베이스라인 없음(시드 전·tmp 정리 후): 비교 기준이 없어 편집 파일의 에러로만 판정한다.
      // 이 한 번은 다른 파일의 회귀를 놓칠 수 있으므로 시드를 권고하고, 이번 결과를 베이스라인으로 확정한다.
      offenders = diags.filter(d => d.file === rel);
      process.stderr.write(
        `[typescript-quality] ⚠ 베이스라인이 없어 이번 저장은 편집 파일(${rel})의 에러로만 판정했습니다. ` +
        `다른 파일의 회귀를 놓치지 않으려면 \`node .claude/hooks/typescript-quality.js --seed --project ${projectRoot}\` 로 미리 시드하세요.\n`
      );
    }
    const preexisting = diags.length - offenders.length;

    if (offenders.length === 0) {
      saveBaseline(st.baseline, currentCounts); // 차단 없음 → 현재 에러 multiset을 베이스라인으로 확정
      if (preexisting > 0) {
        process.stderr.write(
          `[typescript-quality] ℹ 저장한 파일은 통과. 프로젝트의 기존 TS 에러 ${preexisting}건은 이 편집과 무관해 차단하지 않습니다.\n`
        );
      }
      process.exit(0);
    }

    const mine = offenders.filter(d => d.file === rel);
    const others = offenders.filter(d => d.file !== rel);
    process.stderr.write(
      `[typescript-quality] ❌ 이번 저장(${rel})으로 새로 생긴 TypeScript 오류 ${offenders.length}건 — 수정 후 재저장하세요:\n`
    );
    const fmt = d => `  ${d.file || '(global)'}: ${d.code} ${d.msg}`;
    mine.slice(0, 10).forEach(d => process.stderr.write(fmt(d) + '\n'));
    if (others.length > 0) {
      process.stderr.write(`  ── 다른 파일에서 새로 깨진 것 (이 파일의 타입/export 변경이 원인일 가능성) ──\n`);
      others.slice(0, 10).forEach(d => process.stderr.write(fmt(d) + '\n'));
    }
    if (offenders.length > 20) process.stderr.write(`  ... (이하 생략, 총 ${offenders.length}건)\n`);
    if (preexisting > 0) process.stderr.write(`  (참고: 기존 에러 ${preexisting}건은 차단 사유에서 제외)\n`);
    // 차단 시 베이스라인은 갱신하지 않는다
    process.exit(2);
  }

  process.stderr.write(`[typescript-quality] ❌ TypeScript 오류 — 수정 후 재저장하세요:\n`);
  r.lines.slice(0, 10).forEach(l => process.stderr.write(`  ${l}\n`));
  if (r.lines.length > 10) {
    process.stderr.write(`  ... (이하 생략, tsc --noEmit 로 전체 확인)\n`);
  }
  process.exit(2); // 차단
} catch {}

process.exit(0);
