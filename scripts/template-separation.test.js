'use strict';
// template-separation.test.js — 템플릿 분리 E2E (2026-08-31)
//
// project-install.sh를 템플릿별로 **실제 실행**해 산출물 분리 불변식을 검증한다.
// 수동 리허설로만 확인하던 "템플릿 간 불필요한 정보 누수 없음"을 자동 회귀 테스트로 구조화.
//
// 3계층 구성 (rules/adversarial-testing.md):
//  - 정상: 각 템플릿의 포함/제외 불변식 (java 누수 차단·references 복사·rules/commands 구성)
//  - 악성·오남용: 구버전 누수 잔재 prune / 사용자 수정본·커스텀 파일 파괴 시도 방어
//  - 경계: 손상된 매니페스트에서 어떤 삭제도 일어나지 않는지
//
// 느린 테스트: 설치 실행 8회(회당 수 초). 파일 복사만 하므로 병렬 없이 순차 실행.

const { test } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REPO = path.resolve(__dirname, '..');
const INSTALLER = path.join(REPO, 'project-install.sh');

const mktarget = (name) => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), `tmpl-sep-${name}-`));
  return d;
};

// 설치 실행 — 모든 y/N 질문은 빈 줄(기본값 N)로 응답
function install(tmpl, dir) {
  const input = `${dir}\n${tmpl}\n` + '\n'.repeat(60);
  const r = spawnSync('bash', [INSTALLER], { input, encoding: 'utf8', timeout: 120000 });
  assert.strictEqual(r.status, 0,
    `install(${tmpl}) 실패 status=${r.status}\n--- stdout tail ---\n${(r.stdout || '').slice(-800)}\n--- stderr tail ---\n${(r.stderr || '').slice(-400)}`);
  return r.stdout;
}

const skillDirs = (dir) => {
  const root = path.join(dir, '.claude', 'skills');
  const out = [];
  if (!fs.existsSync(root)) return out;
  for (const cat of fs.readdirSync(root)) {
    const catDir = path.join(root, cat);
    if (!fs.statSync(catDir).isDirectory()) continue;
    for (const name of fs.readdirSync(catDir)) {
      if (fs.statSync(path.join(catDir, name)).isDirectory()) out.push(`${cat}/${name}`);
    }
  }
  return out.sort();
};

const agentFiles = (dir) => {
  const root = path.join(dir, '.claude', 'agents');
  const out = [];
  if (!fs.existsSync(root)) return out;
  const walk = (d, prefix) => {
    for (const e of fs.readdirSync(d)) {
      const full = path.join(d, e);
      if (fs.statSync(full).isDirectory()) walk(full, `${prefix}${e}/`);
      else out.push(`${prefix}${e}`);
    }
  };
  walk(root, '');
  return out.sort();
};

const nonSkillMdFiles = (dir) => {
  const root = path.join(dir, '.claude', 'skills');
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d)) {
      const full = path.join(d, e);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (e !== 'SKILL.md') out.push(full);
    }
  };
  if (fs.existsSync(root)) walk(root);
  return out;
};

const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

// 어떤 dev 템플릿에도 있어선 안 되는 dream 전용 스킬 (dream-interpretation 템플릿 전용)
const DREAM_ONLY = [
  'meta/dream-app-ab-testing-prompts',
  'meta/dream-interpretation-prompt-engineering',
  'meta/dream-safety-classifier-prompts',
  'architecture/dream-journal-data-modeling',
];

// java 템플릿에서 제외돼야 하는 누수 후보 (2026-08-31 수리분)
const JAVA_LEAKS = [
  ...DREAM_ONLY,
  'devops/n8n-error-handling', 'devops/n8n-llm-integration', 'devops/n8n-self-hosting',
  'devops/n8n-webhook-patterns', 'devops/n8n-workflow-design',
  'devops/site-migration-seo', 'devops/github-actions-visual-regression', 'devops/vercel-sandbox',
  'architecture/frontend-domain-structure',
];

const JAVA_EXCLUDED_AGENTS = [
  'frontend/CLAUDE.md',
  'validation/seo-auditor.md', 'validation/content-quality-reviewer.md', 'validation/a11y-auditor.md',
  'validation/build-perf-benchmarker.md', 'validation/perf-report-writer.md',
];

// ── 정상 계층: 템플릿별 포함/제외 불변식 ─────────────────────────────────

test('java-spring-legacy: 코어 포함 + 누수 0 + references 복사 + rules/commands 구성', () => {
  const dir = mktarget('jlegacy');
  try {
    install('5', dir);
    const s = skillDirs(dir);
    // 코어 포함
    for (const must of ['backend/spring-boot-2-to-3-migration', 'backend/redis-redisson-legacy',
      'backend/mybatis-mapper-patterns', 'backend/ehcache-2-legacy', 'architecture/ddd',
      'devops/docker-deployment', 'meta/claude-code-hook-authoring']) {
      assert.ok(s.includes(must), `필수 스킬 누락: ${must}`);
    }
    // 누수 제외
    for (const leak of JAVA_LEAKS) assert.ok(!s.includes(leak), `누수 스킬 잔존: ${leak}`);
    // 모던 전용 제외 + python 미설치 (backend 화이트리스트)
    for (const m of ['backend/spring-security-6-jwt-jjwt12', 'backend/springdoc-openapi-3',
      'backend/redis-redisson-modern', 'backend/aws-sdk-v2-s3-rekognition']) {
      assert.ok(!s.includes(m), `모던 전용 스킬 잔존: ${m}`);
    }
    assert.ok(!s.some((x) => x.startsWith('backend/python-')), 'python 스킬이 java 템플릿에 설치됨');
    // references 부속 파일 복사 (2026-08-31 수정)
    assert.ok(nonSkillMdFiles(dir).length > 0, 'references 부속 파일이 하나도 복사되지 않음');
    // 에이전트 제외/포함
    const a = agentFiles(dir);
    for (const ex of JAVA_EXCLUDED_AGENTS) assert.ok(!a.includes(ex), `누수 에이전트 잔존: ${ex}`);
    for (const must of ['validation/pr-reviewer.md', 'meta/changelog-writer.md',
      'backend/java-backend-developer.md']) {
      assert.ok(a.includes(must), `필수 에이전트 누락: ${must}`);
    }
    assert.ok(!a.includes('meta/agent-creator.md'), '작성 도구 기본 n인데 agent-creator 설치됨');
    // rules — 기본 5종 정확히
    const rules = fs.readdirSync(path.join(dir, '.claude', 'rules')).sort();
    assert.deepStrictEqual(rules,
      ['adversarial-testing.md', 'git.md', 'info-verification.md', 'java.md', 'task-workflow.md']);
    // commands 9종 (codex 미선택이라 codex-review 없음)
    const cmds = fs.readdirSync(path.join(dir, '.claude', 'commands'));
    assert.strictEqual(cmds.length, 9);
    assert.ok(!cmds.includes('codex-review.md'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('java-spring-modern: 모던 전용 포함 + 레거시 전용/누수 제외', () => {
  const dir = mktarget('jmodern');
  try {
    install('6', dir);
    const s = skillDirs(dir);
    for (const must of ['backend/spring-security-6-jwt-jjwt12', 'backend/springdoc-openapi-3',
      'backend/redis-redisson-modern', 'backend/aws-sdk-v2-s3-rekognition']) {
      assert.ok(s.includes(must), `모던 전용 스킬 누락: ${must}`);
    }
    for (const l of ['backend/spring-security-5-jwt-jjwt10', 'backend/swagger-springfox-2',
      'backend/redis-redisson-legacy', 'backend/ehcache-2-legacy', 'backend/aws-sdk-v1-s3-rekognition',
      'backend/spring-boot-2-to-3-migration']) {
      assert.ok(!s.includes(l), `레거시 전용 스킬 잔존: ${l}`);
    }
    for (const leak of JAVA_LEAKS) assert.ok(!s.includes(leak), `누수 스킬 잔존: ${leak}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('rust-axum: java 스킬 제외 + dream·프론트 아키텍처 누수 0', () => {
  const dir = mktarget('rust');
  try {
    install('4', dir);
    const s = skillDirs(dir);
    assert.ok(s.includes('backend/axum') && s.includes('backend/tokio'), 'rust 코어 스킬 누락');
    assert.ok(!s.includes('backend/mybatis-mapper-patterns') && !s.includes('backend/ehcache-2-legacy'),
      'java 스킬이 rust 템플릿에 설치됨');
    for (const d of [...DREAM_ONLY, 'architecture/frontend-domain-structure']) {
      assert.ok(!s.includes(d), `누수 스킬 잔존: ${d}`);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('unity-game: backend/frontend 카테고리 제외 + dream·프론트 아키텍처 누수 0', () => {
  const dir = mktarget('unity');
  try {
    install('7', dir);
    const s = skillDirs(dir);
    assert.ok(s.some((x) => x.startsWith('game/')), 'game 스킬 누락');
    assert.ok(!s.some((x) => x.startsWith('backend/') || x.startsWith('frontend/')),
      'backend/frontend 스킬이 unity 템플릿에 설치됨');
    for (const d of [...DREAM_ONLY, 'architecture/frontend-domain-structure']) {
      assert.ok(!s.includes(d), `누수 스킬 잔존: ${d}`);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('react-spa: backend는 claude-code-headless 예외 1종만 + dream frontend 제외', () => {
  const dir = mktarget('react');
  try {
    install('2', dir);
    const s = skillDirs(dir);
    const backend = s.filter((x) => x.startsWith('backend/'));
    assert.deepStrictEqual(backend, ['backend/claude-code-headless']);
    for (const d of DREAM_ONLY) assert.ok(!s.includes(d), `누수 스킬 잔존: ${d}`);
    assert.ok(!s.includes('frontend/dream-symbol-tagging'), 'dream frontend 스킬 잔존');
    assert.ok(nonSkillMdFiles(dir).length > 0, 'references 부속 파일 미복사');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('dream-interpretation(양성 대조): dream 전용 스킬이 실제로 포함된다', () => {
  const dir = mktarget('dream');
  try {
    install('9', dir);
    const s = skillDirs(dir);
    for (const d of DREAM_ONLY) assert.ok(s.includes(d), `dream 템플릿인데 ${d} 누락 — 제외 필터 과잉`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ── 악성·오남용 + 경계 계층 ──────────────────────────────────────────────

test('악성·경계: 순수 java 재설치 시 누수 잔재만 prune, 수정본·커스텀 파일은 파괴하지 않는다', () => {
  const dir = mktarget('adv');
  try {
    install('5', dir);
    const mfPath = path.join(dir, '.claude', '.install-manifest.json');
    const skillsRoot = path.join(dir, '.claude', 'skills');

    // (a) 구버전 설치가 남긴 누수 잔재 — 매니페스트 소유 증명 있음 → prune 대상
    const leakRel = 'meta/dream-safety-classifier-prompts/SKILL.md';
    const leakSrc = path.join(REPO, '.claude', 'skills', leakRel);
    const leakDest = path.join(skillsRoot, leakRel);
    fs.mkdirSync(path.dirname(leakDest), { recursive: true });
    fs.copyFileSync(leakSrc, leakDest);
    // (b) 누수 잔재지만 사용자가 수정한 파일 — 해시 불일치 → 보존해야 함
    const modRel = 'architecture/dream-journal-data-modeling/SKILL.md';
    const modDest = path.join(skillsRoot, modRel);
    fs.mkdirSync(path.dirname(modDest), { recursive: true });
    fs.copyFileSync(path.join(REPO, '.claude', 'skills', modRel), modDest);
    // (c) 매니페스트에 없는 커스텀 스킬 — 소유 미증명 → 절대 삭제 금지
    const customDest = path.join(skillsRoot, 'meta', 'my-custom-skill', 'SKILL.md');
    fs.mkdirSync(path.dirname(customDest), { recursive: true });
    fs.writeFileSync(customDest, '# 프로젝트 자체 커스텀 스킬\n');

    const mf = JSON.parse(fs.readFileSync(mfPath, 'utf8'));
    mf.skills.push(leakRel, modRel);
    mf.hashes.skills[leakRel] = sha(leakDest);            // 소유 증명 일치
    mf.hashes.skills[modRel] = sha(modDest);
    fs.writeFileSync(mfPath, JSON.stringify(mf, null, 2));
    fs.appendFileSync(modDest, '\n<!-- 사용자 로컬 수정 -->\n'); // 기록 후 수정 → 해시 불일치

    const out = install('5', dir);
    assert.ok(!fs.existsSync(leakDest), '소유 증명된 누수 잔재가 prune되지 않음');
    assert.ok(fs.existsSync(modDest), '사용자 수정본이 삭제됨 — 파괴 방어 실패');
    assert.ok(fs.existsSync(customDest), '커스텀 스킬이 삭제됨 — 파괴 방어 실패');
    assert.ok(/prune/.test(out), 'prune 로그 부재');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ── 업그레이드 경로 (2026-08-31 Codex R1: 순수 java 외 경로 미수렴 지적 반영) ──

test('업그레이드: 수리 전 rust 설치가 남긴 dream 잔재(references 포함)가 rust 재설치에서 수렴한다', () => {
  const dir = mktarget('rust-up');
  try {
    install('4', dir);
    const leakRel = 'meta/dream-safety-classifier-prompts/SKILL.md';
    const leakDest = path.join(dir, '.claude', 'skills', leakRel);
    fs.mkdirSync(path.dirname(leakDest), { recursive: true });
    fs.copyFileSync(path.join(REPO, '.claude', 'skills', leakRel), leakDest);
    // 구버전이 함께 복사해 둔 부속 references 파일 (Codex R2: SKILL.md만 prune하면 영구 잔존)
    const refRel = 'meta/dream-safety-classifier-prompts/references/REFERENCE.md';
    const refDest = path.join(dir, '.claude', 'skills', refRel);
    fs.mkdirSync(path.dirname(refDest), { recursive: true });
    fs.writeFileSync(refDest, '# 구버전 설치가 복사한 부속 파일\n');
    const mfPath = path.join(dir, '.claude', '.install-manifest.json');
    const mf = JSON.parse(fs.readFileSync(mfPath, 'utf8'));
    mf.skills.push(leakRel, refRel);
    mf.hashes.skills[leakRel] = sha(leakDest);
    mf.hashes.skills[refRel] = sha(refDest);
    fs.writeFileSync(mfPath, JSON.stringify(mf, null, 2));

    install('4', dir);
    assert.ok(!fs.existsSync(leakDest), 'rust 재설치에서 dream 잔재가 prune되지 않음');
    assert.ok(!fs.existsSync(refDest), 'references 부속 파일이 prune되지 않음 — 파일 단위 미수렴');
    assert.ok(!fs.existsSync(path.dirname(refDest)), '빈 references 디렉토리 잔존');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('업그레이드: java+rust 혼합 재설치에서도 dream 잔재는 수렴하고 rust 소유 n8n은 보존된다', () => {
  const dir = mktarget('mixed-up');
  try {
    install('5,4', dir);
    const s0 = skillDirs(dir);
    assert.ok(s0.includes('devops/n8n-workflow-design'), 'rust 소유 n8n이 혼합 설치에 없음 (전제 확인)');
    const leakRel = 'architecture/dream-journal-data-modeling/SKILL.md';
    const leakDest = path.join(dir, '.claude', 'skills', leakRel);
    fs.mkdirSync(path.dirname(leakDest), { recursive: true });
    fs.copyFileSync(path.join(REPO, '.claude', 'skills', leakRel), leakDest);
    const mfPath = path.join(dir, '.claude', '.install-manifest.json');
    const mf = JSON.parse(fs.readFileSync(mfPath, 'utf8'));
    mf.skills.push(leakRel);
    mf.hashes.skills[leakRel] = sha(leakDest);
    fs.writeFileSync(mfPath, JSON.stringify(mf, null, 2));

    install('5,4', dir);
    assert.ok(!fs.existsSync(leakDest), '혼합 재설치에서 dream 잔재가 prune되지 않음');
    assert.ok(skillDirs(dir).includes('devops/n8n-workflow-design'),
      'rust 소유 n8n이 혼합 재설치에서 삭제됨 — 과잉 prune');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('docs 수렴: 누수 스킬 prune 시 소유 증명된 짝 docs도 제거되고, 증명 없는 커스텀 docs는 보존된다', () => {
  const dir = mktarget('docs-up');
  try {
    install('5', dir);
    // 구버전 설치가 남긴 누수 스킬 + 짝 docs (둘 다 매니페스트 소유 증명 부여)
    const leakRel = 'meta/dream-safety-classifier-prompts/SKILL.md';
    const leakDest = path.join(dir, '.claude', 'skills', leakRel);
    fs.mkdirSync(path.dirname(leakDest), { recursive: true });
    fs.copyFileSync(path.join(REPO, '.claude', 'skills', leakRel), leakDest);
    const docRel = 'skills/meta/dream-safety-classifier-prompts/verification.md';
    const docDest = path.join(dir, 'docs', docRel);
    fs.mkdirSync(path.dirname(docDest), { recursive: true });
    fs.writeFileSync(docDest, '# 구버전 설치가 복사한 짝 docs\n');
    // 매니페스트에 없는 같은 폴더의 커스텀 docs — 삭제되면 안 됨
    const customDoc = path.join(dir, 'docs', 'skills', 'meta', 'dream-safety-classifier-prompts', 'my-notes.md');
    fs.writeFileSync(customDoc, '# 사용자 메모\n');

    const mfPath = path.join(dir, '.claude', '.install-manifest.json');
    const mf = JSON.parse(fs.readFileSync(mfPath, 'utf8'));
    mf.skills.push(leakRel);
    mf.hashes.skills[leakRel] = sha(leakDest);
    mf.docs = mf.docs || []; mf.hashes.docs = mf.hashes.docs || {};
    mf.docs.push(docRel);
    mf.hashes.docs[docRel] = sha(docDest);
    fs.writeFileSync(mfPath, JSON.stringify(mf, null, 2));

    install('5', dir);
    assert.ok(!fs.existsSync(leakDest), '누수 스킬이 prune되지 않음');
    assert.ok(!fs.existsSync(docDest), '소유 증명된 짝 docs가 prune되지 않음 — 스테일 문서 잔존');
    assert.ok(fs.existsSync(customDoc), '증명 없는 커스텀 docs가 삭제됨 — 파괴 방어 실패');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('업그레이드: docs 섹션이 없는 구버전 매니페스트에서도 미수정 짝 docs가 소스 동일 증명으로 수렴한다', () => {
  const dir = mktarget('legacy-docs');
  try {
    install('5', dir);
    const mfPath = path.join(dir, '.claude', '.install-manifest.json');
    // 구버전(2026-08-31 이전) 설치 시뮬레이션: 매니페스트에서 docs 섹션 제거
    const mf = JSON.parse(fs.readFileSync(mfPath, 'utf8'));
    delete mf.docs;
    delete mf.hashes.docs;
    // 누수 스킬(소유 증명) + 짝 docs — docs는 레포 원본의 미수정 사본 (구버전 설치가 복사한 상태)
    const leakRel = 'meta/dream-safety-classifier-prompts/SKILL.md';
    const leakDest = path.join(dir, '.claude', 'skills', leakRel);
    fs.mkdirSync(path.dirname(leakDest), { recursive: true });
    fs.copyFileSync(path.join(REPO, '.claude', 'skills', leakRel), leakDest);
    const docRel = 'skills/meta/dream-safety-classifier-prompts/verification.md';
    const docSrc = path.join(REPO, 'docs', docRel);
    assert.ok(fs.existsSync(docSrc), `전제: 레포에 ${docRel} 존재해야 함 (레포 구조 변경 시 테스트 갱신)`);
    const docDest = path.join(dir, 'docs', docRel);
    fs.mkdirSync(path.dirname(docDest), { recursive: true });
    fs.copyFileSync(docSrc, docDest);                       // 미수정 사본 → 소스 동일 증명으로 삭제돼야 함
    // 같은 폴더에 사용자가 수정한 docs — 소스와 달라짐 → 보존돼야 함
    const modDoc = path.join(dir, 'docs', 'skills', 'meta', 'dream-safety-classifier-prompts', 'modified.md');
    fs.writeFileSync(modDoc, '# 사용자 작성 문서 — 소스에 없음\n');
    mf.skills.push(leakRel);
    mf.hashes.skills[leakRel] = sha(leakDest);
    fs.writeFileSync(mfPath, JSON.stringify(mf, null, 2));

    install('5', dir);
    assert.ok(!fs.existsSync(leakDest), '누수 스킬이 prune되지 않음');
    assert.ok(!fs.existsSync(docDest), '구버전 매니페스트의 미수정 짝 docs가 소스 동일 증명으로 삭제되지 않음');
    assert.ok(fs.existsSync(modDoc), '소스에 없는 사용자 docs가 삭제됨 — 파괴 방어 실패');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('경계: 매니페스트가 손상(JSON 깨짐)돼도 설치는 성공하고 어떤 prune 삭제도 없다', () => {
  const dir = mktarget('corrupt');
  try {
    install('5', dir);
    const mfPath = path.join(dir, '.claude', '.install-manifest.json');
    // 누수 잔재 주입 + 매니페스트 파괴
    const leakDest = path.join(dir, '.claude', 'skills', 'meta', 'dream-safety-classifier-prompts', 'SKILL.md');
    fs.mkdirSync(path.dirname(leakDest), { recursive: true });
    fs.copyFileSync(path.join(REPO, '.claude', 'skills', 'meta', 'dream-safety-classifier-prompts', 'SKILL.md'), leakDest);
    fs.writeFileSync(mfPath, '{ 깨진 JSON !!!');

    install('5', dir);
    // 소유 증명 불가 → 잔재조차 삭제하면 안 됨 (커스텀일 수 있음)
    assert.ok(fs.existsSync(leakDest), '손상 매니페스트 상태에서 파일이 삭제됨 — 증명 없는 삭제');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
