#!/usr/bin/env node
// install-cleanup.js — project-install.sh 재설치 시 이전 설치 잔재 정리
//
// 문제 배경 (2026-08-07): 설치 스크립트는 훅·rules·settings를 "추가 복사"만 하고
// 이전 설치의 잔재를 지우지 않는다. 옵션을 N으로 바꿔 재설치해도
//  (a) 옛 훅 파일·배선·rules가 그대로 남아 옵션이 계속 동작하고
//  (b) settings.json 덮어쓰기를 skip하면 선택이 전혀 반영되지 않으며
//  (c) 소스에서 폐지된 훅(memory-stop-guard 등)·구세대 .cjs 훅이 영구 잔존한다.
// 이 스크립트가 재설치 시점에 위 잔재를 정리한다.
//
// 사용: node scripts/install-cleanup.js --target <프로젝트> --source <이 레포>
//        [--global-root <전역 projects 루트>]   (기본: ~/.claude/projects — 테스트용 오버라이드)
//        [--keep-memory] [--keep-codex] [--keep-branch-protection]
//        [--keep-superpowers] [--keep-readme-guard] [--keep-staleness-strict]
//        [--keep-dev] [--keep-typescript]   (템플릿 파생 — 다운그레이드 재설치 시 dev·TS 훅 정리)
//
// keep 플래그가 없는 옵션은 "이번 설치에서 OFF" 로 간주하고 해당 잔재를 정리한다.
// 실패해도 설치 흐름을 막지 않는다 — 필수 인자 누락 외에는 항상 exit 0.

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

// ── 인자 파싱 ───────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
};

const targetArg = argValue('--target');
const sourceArg = argValue('--source');
if (!targetArg || !sourceArg) {
  console.error('사용법: install-cleanup.js --target <dir> --source <dir> [--global-root <dir>] [--keep-*]');
  process.exit(1);
}

const target = path.resolve(targetArg);
const source = path.resolve(sourceArg);
const globalRoot = argValue('--global-root') || path.join(os.homedir(), '.claude', 'projects');

const keep = {
  memory: args.includes('--keep-memory'),
  codex: args.includes('--keep-codex'),
  branchProtection: args.includes('--keep-branch-protection'),
  superpowers: args.includes('--keep-superpowers'),
  readmeGuard: args.includes('--keep-readme-guard'),
  stalenessStrict: args.includes('--keep-staleness-strict'),
  dev: args.includes('--keep-dev'),               // dev 템플릿 선택 시 (tdd 계열 훅 유지)
  typescript: args.includes('--keep-typescript'), // TS 템플릿 선택 시
  // --legacy: dev 유지하되 tdd-guard만 제외 (레거시 대형 프로젝트 프로파일). 이전 설치가 일반 dev였다면
  // tdd-guard 파일·배선이 남아 계속 차단하므로 독립 옵션으로 정리한다
  legacy: args.includes('--legacy'),
  // --keep-authoring: 이 프로젝트에서 스킬·에이전트를 직접 작성할 때만 작성 규칙 5종 유지 (2026-08-26)
  authoring: args.includes('--keep-authoring'),
};

// ── 옵션 → 산출물 매핑 ──────────────────────────────────────────────────
// 훅은 확장자 없는 base 이름 (.js/.cjs 양쪽 매칭)
// dev·typescript는 사용자 opt-in이 아니라 템플릿 파생이지만, 다운그레이드 재설치
// (dev → util 등) 시 남은 강제 훅이 계속 차단 동작을 하므로 동일 메커니즘으로 정리한다
const OPTION_HOOKS = {
  memory: ['memory-pull', 'memory-sync'],
  codex: ['codex-review-guard'],
  branchProtection: ['branch-protection'],
  // legacy 프로파일이면 tdd-guard는 dev 유지 대상에서 빠진다 → 아래 tddGuard 항목으로 독립 정리
  dev: ['test-fake-guard', 'adversarial-test-guard', 'fake-impl-guard'],
  tddGuard: ['tdd-guard'],
  typescript: ['typescript-quality'],
};
// tdd-guard 유지 조건: dev 선택 AND legacy 아님
keep.tddGuard = keep.dev && !keep.legacy;
const OPTION_RULES = {
  memory: ['memory-sync.md'],
  codex: ['codex-review.md'],
  // 스킬·에이전트 *작성* 규칙 — 대상 프로젝트에서 자산을 만들지 않으면 세션마다 ~6k 토큰 노이즈
  authoring: ['agent-design.md', 'creation-workflow.md', 'verification-policy.md', 'commands.md', 'readme-update.md'],
};
const OPTION_PLUGINS = {
  codex: 'codex@openai-codex',
  superpowers: 'superpowers@superpowers-marketplace',
};

// 소스 레포에서 폐지된 훅 (gen-settings 훅 다이어트 목록과 정렬).
// keep 여부와 무관하게 정리 대상이지만, *이 설치가 만든 파일이라는 증명*이 있을 때만
// 삭제한다 — 매니페스트 hooks 기록+해시 일치, 또는 레거시 1회 확인(--delete-orphans).
// 대상 프로젝트가 같은 이름의 자체 훅을 운영할 수 있다 (2026-08-12 적대적 리뷰 지적).
const RETIRED_HOOKS = [
  'memory-stop-guard', 'session-summary', 'session-handoff', 'pending-test-guard',
  'readme-guard', 'task-plan-guard', 'confirmation-gate', 'verification-gate',
  'careful-with-judge',
];

const hooksDir = path.join(target, '.claude', 'hooks');
const rulesDir = path.join(target, '.claude', 'rules');
const settingsFile = path.join(target, '.claude', 'settings.json');

const log = (msg) => console.log(`  [cleanup] ${msg}`);
const warn = (msg) => console.log(`  [cleanup] ⚠ ${msg}`);

// ── 설치 매니페스트 (2026-08-12 신설) ────────────────────────────────────
// "이 설치가 관리하는 파일 목록"의 명시적 기록. project-install.sh가 설치 마지막에
// 갱신한다. 매니페스트가 있으면 소유권을 추측하지 않는다:
//  - 매니페스트에 있는데 소스에 없는 파일 = 폐기된 관리 파일 → 삭제 (폐기가 재설치로 수렴)
//  - 매니페스트에 없는 파일 = 사용자 커스텀 → 절대 삭제하지 않음
//  - memoryManaged 필드가 memory/ 소유권을 결정 (훅 흔적 휴리스틱보다 우선)
// 매니페스트가 없는 구버전 설치는 설치 스크립트가 1회 확인을 받아 --delete-orphans를
// 넘긴다. 파싱 실패(손상·조작) 시에는 어떤 삭제도 하지 않는다.
const manifestFile = path.join(target, '.claude', '.install-manifest.json');
const deleteOrphansFlag = args.includes('--delete-orphans');
let manifest = null;
let manifestBroken = false;
if (fs.existsSync(manifestFile)) {
  try {
    const m = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    const hs = (m.hashes && typeof m.hashes === 'object') ? m.hashes : {};
    manifest = {
      agents: new Set(Array.isArray(m.agents) ? m.agents : []),
      skills: new Set(Array.isArray(m.skills) ? m.skills : []),
      // 설치 시점 콘텐츠 sha256 — "설치 후 손대지 않았음"의 증거. 이 해시가 현재 파일과
      // 일치할 때만 폐기 삭제를 수행한다 (로컬 수정본을 지우면 사용자 작업이 유실된다).
      hooks: new Set(Array.isArray(m.hooks) ? m.hooks : []),
      commands: new Set(Array.isArray(m.commands) ? m.commands : []),
      // rules 는 2026-08-26부터 기록 — 없으면(구버전) null 로 두고 소스 동일성 폴백을 쓴다
      rules: Array.isArray(m.rules) ? new Set(m.rules) : null,
      hashes: {
        agents: (hs.agents && typeof hs.agents === 'object') ? hs.agents : {},
        skills: (hs.skills && typeof hs.skills === 'object') ? hs.skills : {},
        hooks: (hs.hooks && typeof hs.hooks === 'object') ? hs.hooks : {},
        commands: (hs.commands && typeof hs.commands === 'object') ? hs.commands : {},
        rules: (hs.rules && typeof hs.rules === 'object') ? hs.rules : {},
      },
      memoryManaged: m.memoryManaged === true,
    };
  } catch {
    manifestBroken = true;
    warn('.install-manifest.json 파싱 실패 — 매니페스트 기반 정리를 전부 건너뜁니다 (삭제 없음, 경고만)');
  }
}

const baseOf = (file) => file.replace(/\.c?js$/, '');
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 소스 레포의 현행 훅 파일 목록
let sourceHooks = [];
try { sourceHooks = fs.readdirSync(path.join(source, '.claude', 'hooks')); } catch {}
const sourceHookSet = new Set(sourceHooks);

// 정리 대상 훅 base 집합: 폐지 훅 + OFF 옵션 훅. 두 부류 모두 *파일 삭제*에는
// 소유 증명이 필요하다 — 옵션을 끈 것은 "통합을 제거해 달라"는 뜻이지, 동명의
// 프로젝트 자체 훅 파일을 지워도 된다는 동의가 아니다 (2026-08-12 적대적 리뷰 지적).
const removeBases = new Set(RETIRED_HOOKS);
for (const [opt, bases] of Object.entries(OPTION_HOOKS)) {
  if (!keep[opt]) bases.forEach((b) => removeBases.add(b));
}
// 소유 증명 실패로 보존한 훅 base — 배선 수술에서도 제외해 파일·배선 일관 유지
const preservedHookBases = new Set();

// "이 설치가 만든 훅"인지 증명: 매니페스트 hooks 기록 + 설치 시점 해시 일치.
// 매니페스트 없는 레거시 설치는 사용자 1회 확인(--delete-orphans)이 증명을 대신한다.
const installedHookOwned = (entry, full) => {
  if (manifestBroken) return false;
  if (manifest) {
    if (!manifest.hooks.has(entry)) return false;
    const recorded = manifest.hashes.hooks[entry];
    if (typeof recorded !== 'string') return false;
    try {
      return crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex') === recorded;
    } catch { return false; }
  }
  return deleteOrphansFlag;
};

// ── 0. settings.json 선(先)파싱 — 파괴적 정리의 게이트 ─────────────────
// 배선을 고칠 수 없는 상태(파싱 불가)에서 훅 파일만 지우면 배선이 삭제된 파일을
// 가리키는 반쪽 상태가 된다. 파싱 실패 시 훅 파일 삭제와 배선 정리를 함께 스킵한다.
let settings = null;        // 파싱된 settings (없으면 null)
let settingsBroken = false; // 파일은 있는데 파싱 불가
try {
  if (fs.existsSync(settingsFile)) {
    try { settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8')); } catch {
      settingsBroken = true;
      warn('settings.json 파싱 실패 — 배선을 고칠 수 없으므로 훅 파일 삭제·배선 정리를 스킵합니다 (파일은 그대로 둡니다)');
    }
  }
} catch {}

// memory 관리 흔적 수집 — 훅 파일 삭제 *전에* 수행해야 한다.
// 레포 memory/ 폴더는 이 설치가 관리하던 것일 수도, 프로젝트 고유 데이터일 수도 있다.
// memory 훅 파일 또는 배선(깨진 settings라도 원문 검사)이 있어야만 "관리 대상"으로 본다.
const MEMORY_EVIDENCE_RE = /memory-(pull|sync|stop-guard)\.c?js/;
let memoryEvidence = false;
try { memoryEvidence = fs.readdirSync(hooksDir).some((e) => MEMORY_EVIDENCE_RE.test(e)); } catch {}
if (!memoryEvidence) {
  try { memoryEvidence = MEMORY_EVIDENCE_RE.test(fs.readFileSync(settingsFile, 'utf8')); } catch {}
}

// ── 0.7 memory OFF: 전역 symlink 마이그레이션 + 레포 memory/ 전역 이전 ──
// 훅 파일 삭제 *전에* 수행한다 — 마이그레이션이 실패하면 memory 잔재(훅·rule·배선)를
// 이번 실행에서 보존해, 다음 재설치 때 관리 흔적이 남아 있어 재시도가 가능하다
// (증거를 먼저 지우면 실패 후 레포 memory/가 "무관 데이터"로 분류되는 split-brain 발생).
// 구버전(setup-memory-link.sh)이 만든 전역→레포 symlink가 남아 있으면, N 프로젝트인데도
// Claude Code 네이티브 메모리가 레포에 저장된다. 실제 디렉토리로 전환하고 파일을 보존한다.
let memorySafe = true; // false = 이번 실행에서 memory 잔재 정리 보류 (재시도 증거 보존)
if (!keep.memory) {
  if (settingsBroken) {
    // 배선을 못 고치는 상태에서 memory만 옮기면 반쪽 상태 — 파괴적 이동도 함께 스킵
    warn('settings.json 파싱 실패 상태 — memory 마이그레이션도 스킵합니다');
    memorySafe = false;
  } else {
    try {
      // memory-pull.js와 동일한 경로 인코딩 규칙 (/, _ → -)
      const encoded = target.replace(/[/\\_]/g, '-');
      const globalMem = path.join(globalRoot, encoded, 'memory');
      const repoMem = path.join(target, 'memory');

      let managed = memoryEvidence;
      let skipMemory = false;

      // 매니페스트가 있으면 memory/ 소유권은 명시적 선언이 결정한다 — 훅 흔적 휴리스틱보다 우선.
      if (manifest) {
        if (manifest.memoryManaged) {
          managed = true;
        } else {
          warn('설치 매니페스트가 memory/ 를 관리 대상으로 표시하지 않음 — 이전하지 않습니다');
          skipMemory = true;
        }
      }

      let lst = null;
      if (!skipMemory) { try { lst = fs.lstatSync(globalMem); } catch {} }
      if (lst && lst.isSymbolicLink()) {
        // 레포 memory/ 를 가리키는 링크만 구버전 관리 구조로 인정한다.
        // 다른 곳을 가리키면 사용자 커스텀 구성일 수 있으므로 건드리지 않는다.
        const linkTarget = path.resolve(path.dirname(globalMem), fs.readlinkSync(globalMem));
        if (linkTarget === repoMem) {
          managed = true;
          fs.unlinkSync(globalMem);
          lst = null;
          log('구버전 전역 memory symlink 제거');
        } else {
          warn(`전역 memory symlink가 레포 밖(${linkTarget})을 가리킴 — 커스텀 구성으로 간주하고 건드리지 않습니다`);
          skipMemory = true;
        }
      }

      const repoMemExists = !skipMemory && fs.existsSync(repoMem) && fs.statSync(repoMem).isDirectory();
      if (repoMemExists && !managed) {
        // 관리 흔적(memory 훅 파일·배선·symlink)이 하나도 없으면 프로젝트 고유 데이터로 간주
        warn('레포 memory/ 폴더가 있으나 이 설치가 관리하던 흔적(memory 훅·배선·symlink)이 없어 건드리지 않습니다');
        skipMemory = true;
      }

      if (!skipMemory && managed && !lst) fs.mkdirSync(globalMem, { recursive: true });

      if (!skipMemory && repoMemExists) {
        let leftovers = false;
        for (const entry of fs.readdirSync(repoMem)) {
          const src = path.join(repoMem, entry);
          if (!fs.statSync(src).isFile()) {
            warn(`레포 memory/${entry} 는 파일이 아니라 이전하지 않음 — 수동 확인 필요`);
            leftovers = true;
            continue;
          }
          // 소유권은 훅 흔적으로 *추정*한 것이라, memory/ 를 다른 용도로 재사용한
          // 프로젝트가 managed 로 잡힐 수 있다. 메모리 아티팩트(.md)만 이전하고
          // 그 외 파일은 손대지 않는다 — 앱 데이터를 전역으로 옮겨 런타임을 깨뜨리는
          // 사고를 막는다(2026-08-12 적대적 리뷰 지적).
          if (!entry.toLowerCase().endsWith('.md')) {
            warn(`레포 memory/${entry} 는 메모리 아티팩트(.md)가 아니라 이전하지 않음 — 프로젝트 고유 파일로 간주합니다`);
            leftovers = true;
            continue;
          }
          const dst = path.join(globalMem, entry);
          // 병합 규칙: 전역에 없으면 복사. 내용 충돌 시 mtime이 최신인 쪽을 본 파일로 두되,
          // 지는 쪽도 .conflict 파일로 보존한다 — mtime만 믿고 폐기하면 클럭 스큐·백업 복원
          // 케이스에서 비가역 데이터 손실이 생긴다
          if (!fs.existsSync(dst)) {
            fs.copyFileSync(src, dst);
          } else if (fs.readFileSync(src, 'utf8') !== fs.readFileSync(dst, 'utf8')) {
            let conflict = `${dst}.conflict`;
            for (let n = 1; fs.existsSync(conflict); n++) conflict = `${dst}.conflict${n}`;
            if (fs.statSync(src).mtimeMs > fs.statSync(dst).mtimeMs) {
              fs.copyFileSync(dst, conflict); // 밀려나는 전역본 보존
              fs.copyFileSync(src, dst);
            } else {
              fs.copyFileSync(src, conflict); // 레포본 보존
            }
            warn(`memory 내용 충돌: ${entry} — 양쪽 모두 보존 (${path.basename(conflict)} 확인 후 정리하세요)`);
          }
          fs.unlinkSync(src);
        }
        if (!leftovers) {
          fs.rmdirSync(repoMem);
          log('레포 memory/ → 전역으로 이전 완료 (레포 폴더 삭제)');
        } else {
          log('레포 memory/ 파일 이전 완료 (하위 항목이 남아 폴더는 보존)');
        }
      }
    } catch (e) {
      warn(`memory 마이그레이션 실패 — memory 잔재(훅·rule·배선)를 보존합니다. 원인 해결 후 재설치하면 재시도됩니다: ${e.message}`);
      memorySafe = false;
    }
  }
}
if (!memorySafe) {
  // 재시도 증거 보존: 이번 실행에서는 memory 훅을 정리 대상에서 제외한다
  for (const b of OPTION_HOOKS.memory) removeBases.delete(b);
}

// ── 1. 훅 파일 정리 ─────────────────────────────────────────────────────
// 삭제 기준: (a) 정리 대상 base  (b) 소스에 .js 원본이 있는 구세대 .cjs 트윈
// 그 외 소스에 없는 파일은 사용자 커스텀 훅일 수 있으므로 절대 삭제하지 않고 경고만 한다.
const cjsRewrites = new Set(); // 배선을 .cjs → .js 로 재작성할 base 목록
try {
  if (settingsBroken) throw new Error('skip'); // 배선 수정 불가 → 파일 삭제도 스킵
  for (const entry of fs.readdirSync(hooksDir)) {
    const full = path.join(hooksDir, entry);
    if (!fs.statSync(full).isFile()) continue;
    if (!/\.c?js$/.test(entry)) continue;

    const base = baseOf(entry);
    if (removeBases.has(base)) {
      if (installedHookOwned(entry, full)) {
        fs.unlinkSync(full);
        log(`잔재 훅 삭제: ${entry}`);
      } else {
        preservedHookBases.add(base);
        warn(`정리 대상 훅 이름과 겹치는 ${entry} — 이 설치가 만든 파일이라는 증명(매니페스트 해시)이 없어 파일·배선을 보존합니다. 잔재가 맞으면 직접 삭제하세요`);
      }
    } else if (entry.endsWith('.cjs') && sourceHookSet.has(`${base}.js`)) {
      fs.unlinkSync(full);
      cjsRewrites.add(base);
      log(`구세대 .cjs 훅 삭제: ${entry} (배선은 ${base}.js 로 재작성)`);
    } else if (!sourceHookSet.has(entry)) {
      warn(`알 수 없는 훅 보존 (커스텀 훅 가능성): ${entry} — 불필요하면 직접 삭제하세요`);
    }
  }
} catch {} // hooks 폴더 없음 — 정리할 것 없음

// ── 2. rules 정리 ───────────────────────────────────────────────────────
// 소유 증명 없이 이름만으로 지우면 대상 프로젝트가 같은 이름으로 운영하는 자체 규칙이 날아간다
// (2026-08-26 Codex 리뷰). 증명 = 매니페스트 rules 기록 + 설치 시점 해시 일치, 또는
// (매니페스트에 rules 기록이 없는 구버전 설치) 소스 레포의 동일 파일과 내용이 완전히 같음.
const ruleOwned = (rule) => {
  const full = path.join(rulesDir, rule);
  let current = null;
  try { current = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex'); } catch { return false; }
  if (manifest && manifest.rules && manifest.rules.has(rule)) {
    return manifest.hashes.rules[rule] === current;
  }
  if (manifestBroken) return false;
  // 폴백: 소스와 바이트 단위로 같으면 설치본이 손대지 않은 관리 파일
  try {
    const src = crypto.createHash('sha256').update(fs.readFileSync(path.join(source, '.claude', 'rules', rule))).digest('hex');
    return src === current;
  } catch { return false; }
};
for (const [opt, rules] of Object.entries(OPTION_RULES)) {
  if (keep[opt]) continue;
  if (opt === 'memory' && !memorySafe) continue; // 마이그레이션 미완 — 재시도 증거 보존
  for (const rule of rules) {
    const full = path.join(rulesDir, rule);
    if (!fs.existsSync(full)) continue;
    if (!ruleOwned(rule)) {
      warn(`rule ${rule} 은(는) 이 설치가 만든 파일이라는 증명이 없어 보존합니다 (프로젝트 자체 규칙이거나 로컬 수정본) — 불필요하면 직접 삭제하세요`);
      continue;
    }
    try { fs.unlinkSync(full); log(`잔재 rule 삭제: ${rule}`); } catch {}
  }
}

// ── 3. codex 마커 정리 ──────────────────────────────────────────────────
if (!keep.codex) {
  try {
    const marker = path.join(target, '.claude', '.codex-review-done');
    if (fs.existsSync(marker)) { fs.unlinkSync(marker); log('마커 삭제: .codex-review-done'); }
  } catch {}
}

// ── 4. settings.json 배선 수술 ──────────────────────────────────────────
// settings 덮어쓰기를 skip해도 옵션 선택이 반영되도록, 기존 파일에서 해당 배선만 제거·재작성한다.
// 파싱 불가능한 파일은 절대 건드리지 않는다 (사용자 설정 파괴 방지 — 0단계 선파싱에서 게이트).
try {
  {
    if (settings) {
      const before = JSON.stringify(settings);
      // 구버전 설치의 최상위 `defaultMode` 는 무효 위치 — settings 덮어쓰기를 skip 해도 올바른 위치로 옮긴다
      // (2026-08-26 Codex 리뷰: 이 이관이 없으면 보존 경로의 기존 설치가 영원히 깨진 스키마에 남는다)
      if (typeof settings.defaultMode === 'string') {
        if (!settings.permissions || typeof settings.permissions !== 'object') settings.permissions = {};
        if (typeof settings.permissions.defaultMode !== 'string') {
          settings.permissions.defaultMode = settings.defaultMode;
          log(`settings.json: 최상위 defaultMode("${settings.defaultMode}") → permissions.defaultMode 로 이관`);
        } else {
          log(`settings.json: 무효한 최상위 defaultMode 제거 (permissions.defaultMode="${settings.permissions.defaultMode}" 유지)`);
        }
        delete settings.defaultMode;
      }
      // 소유 미증명으로 파일을 보존한 훅은 배선도 남긴다 (반쪽 상태 방지)
      const wiringBases = [...removeBases].filter((b) => !preservedHookBases.has(b));
      const removeRe = wiringBases.length > 0
        ? new RegExp(`/hooks/(${wiringBases.map(escapeRe).join('|')})\\.c?js(\\s|$)`)
        : null;

      const rewriteCommand = (cmd, event, matcher) => {
        let c = cmd;
        // 구세대 .cjs 배선 → .js 재작성 (keep 옵션 훅)
        for (const base of cjsRewrites) {
          c = c.replace(`/hooks/${base}.cjs`, `/hooks/${base}.js`);
        }
        // staleness --strict: keep 아니면 다운그레이드
        if (!keep.stalenessStrict) {
          c = c.replace(/staleness-check\.js\s+--strict/, 'staleness-check.js');
        }
        // typescript-quality --changed-only: 레거시 프로파일 선택 여부에 맞춰 재작성
        // (settings 덮어쓰기 skip 시 기존 전체 검사 배선이 그대로 남던 문제 — 2026-08-26 Codex 리뷰)
        if (keep.typescript && c.includes('typescript-quality.js')) {
          if (keep.legacy) {
            if (!/typescript-quality\.js\s+--changed-only/.test(c)) {
              c = c.replace(/typescript-quality\.js/, 'typescript-quality.js --changed-only');
            }
          } else {
            c = c.replace(/typescript-quality\.js\s+--changed-only/, 'typescript-quality.js');
          }
        }
        // readme-guard 재배선 (deliverable-guard 인자 조정)
        if (c.includes('deliverable-guard.js')) {
          if (keep.readmeGuard) {
            c = c.replace(/deliverable-guard\.js\s+--no-readme/, 'deliverable-guard.js');
          } else if (
            (event === 'PreToolUse' && matcher === 'Bash') || event === 'Stop'
          ) {
            if (!c.includes('--no-readme')) c = c.replace('deliverable-guard.js', 'deliverable-guard.js --no-readme');
          }
        }
        return c;
      };

      if (settings.hooks && typeof settings.hooks === 'object') {
        for (const [event, groups] of Object.entries(settings.hooks)) {
          if (!Array.isArray(groups)) continue;
          for (const group of groups) {
            if (!Array.isArray(group?.hooks)) continue;
            group.hooks = group.hooks
              .filter((h) => {
                const cmd = h?.command || '';
                if (removeRe && removeRe.test(cmd)) return false;
                // readme-guard OFF + memory OFF → PreToolUse Bash의 deliverable-guard 항목 자체 제거
                // (gen-settings: 이 항목은 readme-guard 또는 memory 선택 시에만 존재)
                if (
                  !keep.readmeGuard && !keep.memory &&
                  event === 'PreToolUse' && group.matcher === 'Bash' &&
                  cmd.includes('deliverable-guard.js')
                ) return false;
                return true;
              })
              .map((h) => (h?.command ? { ...h, command: rewriteCommand(h.command, event, group.matcher) } : h));
          }
          // 빈 그룹 → 그룹 제거, 그룹이 다 비면 이벤트 제거
          settings.hooks[event] = groups.filter((g) => !Array.isArray(g?.hooks) || g.hooks.length > 0);
          if (settings.hooks[event].length === 0) delete settings.hooks[event];
        }
      }

      // 플러그인 정리
      if (settings.enabledPlugins && typeof settings.enabledPlugins === 'object') {
        for (const [opt, plugin] of Object.entries(OPTION_PLUGINS)) {
          if (!keep[opt] && plugin in settings.enabledPlugins) {
            delete settings.enabledPlugins[plugin];
            log(`플러그인 제거: ${plugin}`);
          }
        }
        if (Object.keys(settings.enabledPlugins).length === 0) delete settings.enabledPlugins;
      }

      if (JSON.stringify(settings) !== before) {
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2) + '\n');
        log('settings.json 배선 정리 완료');
      }
    }
  }
} catch (e) {
  warn(`settings.json 정리 중 오류 — 건너뜀: ${e.message}`);
}

// ── 5. 템플릿 축소 잔재 감지 (경고만) ──────────────────────────────────
// 소스 레포에 더 이상 없는 스킬·에이전트는 사용자가 직접 추가했을 수도 있으므로
// 자동 삭제하지 않고 목록만 경고한다.
const listRel = (root) => {
  const acc = [];
  const walk = (dir) => {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile()) acc.push(path.relative(root, full));
    }
  };
  walk(root);
  return acc;
};

// commands 는 옵션 파생 항목이 있다 — 옵션 OFF 시 소스에 파일이 있어도 폐기 대상 (2026-08-26 Codex 리뷰:
// /codex-review 는 Codex OFF 후에도, dev 전용 커맨드는 util 다운그레이드 후에도 남아 오도한다).
// 삭제 판정은 아래 skills/agents 와 동일한 소유 증명 규칙(매니페스트 + 해시 일치)을 그대로 적용한다.
const COMMANDS_DEV = ['create-plan.md', 'fix-pr.md', 'update-docs.md', 'tdd-implement.md', 'agent-status.md', 'sparc-refine.md'];
const optionOffCommands = new Set([
  ...(keep.codex ? [] : ['codex-review.md']),
  ...(keep.dev ? [] : COMMANDS_DEV),
]);

for (const kind of ['skills', 'agents', 'commands']) {
  const srcRoot = path.join(source, '.claude', kind);
  const tgtRoot = path.join(target, '.claude', kind);
  if (!fs.existsSync(tgtRoot)) continue;
  const srcSet = new Set(listRel(srcRoot));
  const orphans = listRel(tgtRoot).filter((rel) =>
    !srcSet.has(rel) || (kind === 'commands' && optionOffCommands.has(rel)));
  if (orphans.length === 0) continue;

  // 삭제 판정 — 안전한 쪽으로만:
  //  매니페스트 유효: 매니페스트에 기록되고 + 설치 시점 해시와 현재 내용이 일치할 때만 삭제
  //    (해시 불일치 = 로컬 수정본 → 보존, 해시 미기록 = 증명 불가 → 보존)
  //  매니페스트 없음: --delete-orphans(설치 스크립트가 1회 확인 후 전달)일 때만 삭제
  //  매니페스트 손상: 어떤 경우에도 삭제하지 않음
  const removed = [];
  const unknown = [];
  const localEdits = [];
  for (const rel of orphans) {
    if (manifest) {
      if (!manifest[kind].has(rel)) { unknown.push(rel); continue; }
      const recorded = manifest.hashes[kind][rel];
      let current = null;
      if (typeof recorded === 'string') {
        try {
          current = crypto.createHash('sha256')
            .update(fs.readFileSync(path.join(tgtRoot, rel))).digest('hex');
        } catch { /* 읽기 실패 → 삭제 증거 불충분으로 보존 */ }
      }
      if (current !== null && current === recorded) removed.push(rel);
      else localEdits.push(rel);
    } else if (!manifestBroken && deleteOrphansFlag) {
      removed.push(rel);
    } else {
      unknown.push(rel);
    }
  }
  for (const rel of removed) {
    try {
      fs.unlinkSync(path.join(tgtRoot, rel));
      log(`폐기된 관리 ${kind} 삭제: .claude/${kind}/${rel}`);
    } catch {
      warn(`.claude/${kind}/${rel} 삭제 실패 — 직접 확인하세요`);
    }
  }
  if (localEdits.length > 0) {
    warn(`폐기된 관리 ${kind} ${localEdits.length}건이 설치 시점과 내용이 다르거나 해시 기록이 없어 보존합니다 — 로컬 수정본일 수 있으니 직접 확인 후 삭제하세요:`);
    for (const rel of localEdits) console.log(`      - .claude/${kind}/${rel}`);
  }
  if (unknown.length > 0) {
    warn(`소스 레포에 없는 ${kind} ${unknown.length}건 발견 — 커스텀 파일 또는 미확인 잔재. 자동 삭제하지 않으니 직접 확인하세요:`);
    for (const rel of unknown) console.log(`      - .claude/${kind}/${rel}`);
  }
}

// ── 6. 빈 디렉토리 정리 ─────────────────────────────────────────────────
// 이전 재설치가 폐기 스킬의 SKILL.md 만 지우고 폴더를 남기면(2026-06 개편 잔재 등) 매니페스트 대상이
// 아니라 위 루프가 건드리지 않는다. 빈 폴더는 내용이 없으니 소유 증명 없이 지워도 잃는 것이 없다.
// 실프로젝트 사본 리허설에서 40개가 남아 있던 것을 계기로 추가 (2026-08-26).
for (const kind of ['skills', 'agents', 'commands']) {
  const root = path.join(target, '.claude', kind);
  if (!fs.existsSync(root)) continue;
  let removed = 0;
  const sweep = (dir) => {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) if (e.isDirectory()) sweep(path.join(dir, e.name));
    if (dir === root) return;
    try {
      if (fs.readdirSync(dir).length === 0) { fs.rmdirSync(dir); removed++; }
    } catch {}
  };
  sweep(root);
  if (removed > 0) log(`빈 디렉토리 정리: .claude/${kind}/ 하위 ${removed}개`);
}

process.exit(0);
