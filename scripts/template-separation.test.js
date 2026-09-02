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
// 느린 테스트: 설치 실행 20여 회(회당 수 초). 파일 복사만 하므로 병렬 없이 순차 실행.
// 2026-09-01: seo-geo(11) 애드온 템플릿 — 단독·java 병행(프로파일 전환 수렴)·nextjs 병행 케이스 추가.

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

// 설치 실행 — 모든 y/N 질문은 빈 줄(기본값 N)로 응답.
// answers: 템플릿 입력 직후 이어지는 질문들에 순서대로 줄 응답 (예: ['', '', '', 'c'] = memory·superpowers·codex 기본 + SEO 프로파일 c)
function install(tmpl, dir, answers = []) {
  const input = `${dir}\n${tmpl}\n` + answers.map((a) => `${a}\n`).join('') + '\n'.repeat(60);
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

// ── seo-geo(11) 애드온 템플릿 (2026-09-01) ──────────────────────────────

// seo-geo 소유 스킬 — 전체 프로파일 (설치 스크립트 SEO_GEO_SKILLS 와 동일해야 함)
const SEO_GEO_FULL = [
  'frontend/bot-management-seo', 'frontend/ecommerce-seo', 'frontend/geo-ai-discoverability',
  'frontend/google-indexing-api', 'frontend/i18n-seo', 'frontend/image-optimization-seo',
  'frontend/kakao-share-optimization', 'frontend/local-business-seo', 'frontend/mobile-seo-pwa',
  'frontend/naver-seo-specifics', 'frontend/schema-org-patterns', 'frontend/search-console-webmaster',
  'frontend/security-headers-seo', 'frontend/seo-monitoring-automation', 'frontend/seo-static-html',
  'frontend/structured-data-validation-api', 'frontend/url-canonicalization-redirects',
  'writing/content-eeat-quality', 'writing/multilingual-content-strategy', 'writing/ymyl-content-seo',
  'writing/accessibility-vpat-writing', 'devops/site-migration-seo',
].sort();
// 커머스 프로파일(c)에서 빠지는 8종 (SEO_NONCOMMERCE_SKILLS)
const SEO_NONCOMMERCE = [
  'frontend/local-business-seo', 'frontend/i18n-seo', 'frontend/google-indexing-api',
  'frontend/seo-monitoring-automation', 'writing/ymyl-content-seo', 'writing/multilingual-content-strategy',
  'writing/accessibility-vpat-writing', 'devops/site-migration-seo',
];
const SEO_GEO_COMMERCE = SEO_GEO_FULL.filter((s) => !SEO_NONCOMMERCE.includes(s));
// 프레임워크 종속 — seo-geo 가 소유하지 않는 SEO 스킬 (nextjs·react-spa 소유)
const SEO_FRAMEWORK_BOUND = ['frontend/seo-nextjs', 'frontend/seo-vite-spa', 'frontend/og-image-generation'];
const SEO_GEO_AGENTS = [
  'meta/claude-code-guide.md', 'research/web-searcher.md', 'validation/content-quality-reviewer.md',
  'validation/fact-checker.md', 'validation/seo-auditor.md', 'validation/source-validator.md',
];

test('seo-geo 단독(11): 소유 스킬 22종·에이전트 6종만, dev 훅 없음, SEO CLAUDE.md', () => {
  const dir = mktarget('seo');
  try {
    // 질문 순서: memory·superpowers 기본(n) → SEO 프로파일(엔터 = y 전체) → 나머지 기본
    install('11', dir);
    assert.deepStrictEqual(skillDirs(dir), SEO_GEO_FULL, 'seo-geo 단독 스킬 집합이 소유 목록과 다름');
    assert.deepStrictEqual(agentFiles(dir), SEO_GEO_AGENTS, 'seo-geo 단독 에이전트 집합이 화이트리스트와 다름');
    const hooks = fs.readdirSync(path.join(dir, '.claude', 'hooks'));
    assert.ok(!hooks.includes('tdd-guard.js') && !hooks.includes('typescript-quality.js'),
      '비개발 템플릿인데 dev/TS 훅이 설치됨');
    assert.ok(hooks.includes('deliverable-guard.js'), '공통 훅 누락');
    const rules = fs.readdirSync(path.join(dir, '.claude', 'rules')).sort();
    assert.deepStrictEqual(rules, ['git.md', 'info-verification.md', 'task-workflow.md']);
    const claude = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
    assert.ok(/SEO·GEO 작업 원칙/.test(claude), 'seo-geo CLAUDE.md 도메인 섹션 누락');
    assert.ok(/동적 렌더링·클로킹 금지/.test(claude), 'seo-geo 금지 사항 누락');
    // 프로파일 n 입력은 거부되고 재질문된다 (제외가 필요하면 템플릿에서 빼라는 안내)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('악성: seo-geo 프로파일에 n 을 넣어도 SEO 제외로 빠지지 않고 재질문 후 y 로 진행된다', () => {
  const dir = mktarget('seo-n');
  try {
    // memory, superpowers 기본 → SEO 에 'n'(거부) → 'y' → 나머지 기본
    const out = install('11', dir, ['', '', 'n', 'y']);
    assert.ok(/SEO 제외\(n\)가 없습니다/.test(out), 'n 거부 안내 미출력');
    assert.deepStrictEqual(skillDirs(dir), SEO_GEO_FULL, 'n 입력이 SEO 제외로 새어 들어감');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('java-spring-legacy + seo-geo (5,11) 커머스: java 코어 + SEO 커머스 14종, 프론트 전용 에이전트는 여전히 제외', () => {
  const dir = mktarget('java-seo');
  try {
    // memory·superpowers·codex 기본 → SEO 프로파일 c → 나머지 기본
    install('5,11', dir, ['', '', '', 'c']);
    const s = skillDirs(dir);
    for (const must of ['backend/spring-security-5-jwt-jjwt10', 'backend/xss-lucy-jsoup',
      'backend/webflux-webclient-in-sync-app', 'backend/logback-mdc-tracing']) {
      assert.ok(s.includes(must), `java 코어 스킬 누락: ${must}`);
    }
    for (const must of SEO_GEO_COMMERCE) assert.ok(s.includes(must), `SEO 커머스 스킬 누락: ${must}`);
    for (const no of [...SEO_NONCOMMERCE, ...SEO_FRAMEWORK_BOUND]) assert.ok(!s.includes(no), `커머스 프로파일에 무관 SEO 잔존: ${no}`);
    // java 누수 목록은 seo-geo 소유분(site-migration-seo — 커머스에선 어차피 제외) 외 전부 부재
    for (const leak of JAVA_LEAKS) assert.ok(!s.includes(leak), `java 누수 잔존: ${leak}`);
    // 그 외 frontend 스킬은 seo-geo 소유분뿐이어야 함
    const fe = s.filter((x) => x.startsWith('frontend/'));
    assert.deepStrictEqual(fe, SEO_GEO_COMMERCE.filter((x) => x.startsWith('frontend/')), 'frontend 스킬이 SEO 소유분 밖으로 확장됨');
    const a = agentFiles(dir);
    for (const must of ['validation/seo-auditor.md', 'validation/content-quality-reviewer.md',
      'backend/java-backend-developer.md', 'backend/java-backend-architect.md']) {
      assert.ok(a.includes(must), `필수 에이전트 누락: ${must}`);
    }
    for (const no of ['validation/a11y-auditor.md', 'validation/build-perf-benchmarker.md',
      'validation/perf-report-writer.md', 'frontend/frontend-developer.md', 'frontend/CLAUDE.md']) {
      assert.ok(!a.includes(no), `프론트 전용 에이전트 누수: ${no}`);
    }
    // dev 훅·java 규칙은 java 템플릿이 보탠다
    const hooks = fs.readdirSync(path.join(dir, '.claude', 'hooks'));
    assert.ok(hooks.includes('tdd-guard.js') && !hooks.includes('typescript-quality.js'));
    const rules = fs.readdirSync(path.join(dir, '.claude', 'rules')).sort();
    assert.deepStrictEqual(rules, ['adversarial-testing.md', 'git.md', 'info-verification.md', 'java.md', 'task-workflow.md']);
    // CLAUDE.md: java 베이스 + seo-geo 도메인 섹션 append
    const claude = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
    assert.ok(/`jakarta\.\*` import 금지/.test(claude), 'java 베이스 CLAUDE.md 아님');
    assert.ok(/SEO·GEO 작업 원칙/.test(claude), 'seo-geo 도메인 섹션이 append 되지 않음');
    // 애드온 금지 사항은 베이스 `## 금지 사항` 안에 병합돼야 한다 (Codex R3)
    const prohibit = claude.split('## 금지 사항')[1].split('\n---')[0];
    assert.ok(/동적 렌더링·클로킹 금지/.test(prohibit), 'seo-geo 금지 사항이 베이스 금지 사항에 병합되지 않음');
    assert.ok(/`jakarta\.\*` import 금지/.test(prohibit), 'java 금지 사항이 병합 과정에서 밀려남');
    assert.ok(!/<!-- common-rules -->/.test(claude), '자리표시자가 남음');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('업그레이드: 5,11 전체→커머스 프로파일 전환 재설치에서 무관 8종(짝 docs 포함)이 수렴하고 dream 잔재도 prune 된다', () => {
  const dir = mktarget('java-seo-up');
  try {
    install('5,11', dir);                                    // 전체 프로파일 (엔터 = y)
    const s0 = skillDirs(dir);
    for (const must of SEO_GEO_FULL) assert.ok(s0.includes(must), `전제: 전체 프로파일 스킬 누락 ${must}`);
    const i18nDoc = path.join(dir, 'docs', 'skills', 'frontend', 'i18n-seo', 'verification.md');
    assert.ok(fs.existsSync(i18nDoc), '전제: i18n-seo 짝 docs 복사됨');
    // 수리 전 설치가 남긴 dream 잔재 (소유 증명 부여) — seo-geo 병행 조합도 leakscope 라 수렴해야 함
    const leakRel = 'architecture/dream-journal-data-modeling/SKILL.md';
    const leakDest = path.join(dir, '.claude', 'skills', leakRel);
    fs.mkdirSync(path.dirname(leakDest), { recursive: true });
    fs.copyFileSync(path.join(REPO, '.claude', 'skills', leakRel), leakDest);
    const mfPath = path.join(dir, '.claude', '.install-manifest.json');
    const mf = JSON.parse(fs.readFileSync(mfPath, 'utf8'));
    mf.skills.push(leakRel); mf.hashes.skills[leakRel] = sha(leakDest);
    fs.writeFileSync(mfPath, JSON.stringify(mf, null, 2));
    // 사용자가 로컬 수정한 SEO 스킬 — 프로파일 전환으로 빠지더라도 파괴 금지
    const modSkill = path.join(dir, '.claude', 'skills', 'writing', 'ymyl-content-seo', 'SKILL.md');
    fs.appendFileSync(modSkill, '\n<!-- 로컬 수정 -->\n');

    install('5,11', dir, ['', '', '', 'c']);
    const s1 = skillDirs(dir);
    for (const gone of SEO_NONCOMMERCE.filter((x) => x !== 'writing/ymyl-content-seo')) {
      assert.ok(!s1.includes(gone), `커머스 전환 후 무관 스킬 잔존: ${gone}`);
    }
    assert.ok(fs.existsSync(modSkill), '사용자 수정본이 프로파일 전환 prune 에 삭제됨 — 파괴 방어 실패');
    assert.ok(!fs.existsSync(i18nDoc), '무관 스킬의 짝 docs 잔존 — docs 미수렴');
    for (const keep of SEO_GEO_COMMERCE) assert.ok(s1.includes(keep), `커머스 소유 스킬이 과잉 prune: ${keep}`);
    assert.ok(s1.includes('backend/spring-security-5-jwt-jjwt10'), 'java 코어가 프로파일 전환에 휘말림');
    assert.ok(!fs.existsSync(leakDest), 'seo-geo 병행 조합에서 dream 잔재가 prune 되지 않음');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('nextjs + seo-geo (3,11): 프레임워크 종속 seo-nextjs 는 nextjs 가, seo-static-html 은 seo-geo 가 보태고 vite 전용은 없다', () => {
  const dir = mktarget('next-seo');
  try {
    // memory·superpowers·codex·legacy 기본 → SEO 프로파일 엔터(y) → 나머지 기본
    install('3,11', dir);
    const s = skillDirs(dir);
    assert.ok(s.includes('frontend/seo-nextjs'), 'nextjs 소유 seo-nextjs 누락');
    assert.ok(s.includes('frontend/seo-static-html'), 'seo-geo 소유 seo-static-html 누락 (기존엔 어느 템플릿도 export 안 함)');
    assert.ok(s.includes('frontend/og-image-generation'), 'nextjs 소유 og-image-generation 누락');
    assert.ok(!s.includes('frontend/seo-vite-spa'), 'react-spa 전용 seo-vite-spa 누수');
    for (const must of SEO_GEO_FULL) assert.ok(s.includes(must), `SEO 전체 프로파일 스킬 누락: ${must}`);
    const hooks = fs.readdirSync(path.join(dir, '.claude', 'hooks'));
    assert.ok(hooks.includes('typescript-quality.js'), 'nextjs 병행인데 TS 훅 없음');
    // CLAUDE.md: nextjs 베이스 + seo-geo 도메인 섹션 append (macOS BSD sed 회귀 방지 — 2026-09-01 수정)
    const claude = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
    assert.ok(/`use client` 남용 금지/.test(claude), 'nextjs 베이스 CLAUDE.md 아님');
    assert.ok(/SEO·GEO 작업 원칙/.test(claude), 'seo-geo 도메인 섹션이 append 되지 않음');
    assert.ok(/동적 렌더링·클로킹 금지/.test(claude.split('## 금지 사항')[1].split('\n---')[0]),
      'seo-geo 금지 사항이 베이스 금지 사항에 병합되지 않음');
    assert.ok(!/\n\n\n/.test(claude), 'CLAUDE.md 에 3연속 빈 줄 — 빈 줄 접기 미동작');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('악성·순서: 애드온을 먼저 쓴 11,5 도 java 가 CLAUDE.md 베이스가 되어 스택 가드레일이 유지된다 (Codex R1)', () => {
  const dir = mktarget('addon-first');
  try {
    // 정규화 후 순서는 5,11 과 같으므로 질문 순서도 동일: memory·superpowers·codex 기본 → SEO c
    const out = install('11,5', dir, ['', '', '', 'c']);
    assert.ok(/애드온 템플릿\(seo-geo\)은 뒤로 정렬/.test(out), '순서 정규화 안내 미출력');
    assert.ok(/CLAUDE\.md \(기본 템플릿: java-spring-legacy\)/.test(out), 'CLAUDE.md 베이스가 java 가 아님');
    const claude = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
    assert.ok(/`jakarta\.\*` import 금지/.test(claude), 'java 금지 사항이 빠짐 — 애드온이 베이스가 됨');
    assert.ok(/@\.claude\/rules\/java\.md/.test(claude), 'java 규칙 참조가 빠짐');
    assert.ok(/SEO·GEO 작업 원칙/.test(claude), 'seo-geo 도메인 섹션 누락');
    // 산출물 집합은 5,11 과 동일해야 한다
    const s = skillDirs(dir);
    for (const must of [...SEO_GEO_COMMERCE, 'backend/spring-security-5-jwt-jjwt10']) assert.ok(s.includes(must), `누락: ${must}`);
    assert.deepStrictEqual(fs.readdirSync(path.join(dir, '.claude', 'rules')).sort(),
      ['adversarial-testing.md', 'git.md', 'info-verification.md', 'java.md', 'task-workflow.md']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('다운그레이드: 5,11 → 5 재설치에서 seo-geo 자산(스킬·짝 docs·에이전트)이 수렴하고 java 는 그대로다 (Codex R2)', () => {
  const dir = mktarget('addon-removed');
  try {
    install('5,11', dir);                                    // 전체 프로파일
    assert.ok(skillDirs(dir).includes('frontend/schema-org-patterns'), '전제: SEO 스킬 설치됨');
    const seoDoc = path.join(dir, 'docs', 'skills', 'frontend', 'schema-org-patterns');
    assert.ok(fs.existsSync(seoDoc), '전제: SEO 짝 docs 설치됨');
    // 사용자가 로컬 수정한 SEO 스킬 — 애드온을 빼더라도 파괴 금지
    const modSkill = path.join(dir, '.claude', 'skills', 'frontend', 'naver-seo-specifics', 'SKILL.md');
    fs.appendFileSync(modSkill, '\n<!-- 로컬 수정 -->\n');

    install('5', dir);
    const s = skillDirs(dir);
    for (const gone of SEO_GEO_FULL.filter((x) => x !== 'frontend/naver-seo-specifics')) {
      assert.ok(!s.includes(gone), `애드온 제거 후 SEO 스킬 잔존: ${gone}`);
    }
    assert.ok(fs.existsSync(modSkill), '사용자 수정본이 애드온 제거 prune 에 삭제됨 — 파괴 방어 실패');
    assert.ok(!fs.existsSync(seoDoc), 'SEO 짝 docs 잔존 — 스테일 문서');
    const a = agentFiles(dir);
    assert.ok(!a.includes('validation/seo-auditor.md') && !a.includes('validation/content-quality-reviewer.md'),
      'SEO 에이전트 잔존');
    assert.ok(s.includes('backend/spring-security-5-jwt-jjwt10') && a.includes('backend/java-backend-developer.md'),
      'java 자산이 다운그레이드에 휘말림');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('다운그레이드: 11 → util 재설치에서 SEO 스킬·에이전트가 전부 수렴하고 util 소유 에이전트는 남는다 (Codex R2)', () => {
  const dir = mktarget('seo-to-util');
  try {
    install('11', dir);
    assert.ok(agentFiles(dir).includes('validation/seo-auditor.md'), '전제: seo-auditor 설치됨');
    install('1', dir);
    assert.deepStrictEqual(skillDirs(dir).filter((x) => SEO_GEO_FULL.includes(x)), [], 'util 다운그레이드 후 SEO 스킬 잔존');
    const a = agentFiles(dir);
    assert.ok(!a.includes('validation/seo-auditor.md') && !a.includes('validation/content-quality-reviewer.md'), 'SEO 에이전트 잔존');
    for (const keep of ['validation/fact-checker.md', 'validation/source-validator.md', 'research/web-searcher.md', 'meta/claude-code-guide.md']) {
      assert.ok(a.includes(keep), `util 소유 에이전트가 과잉 prune: ${keep}`);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('seo-geo 단독 + 작성 도구 y: 화이트리스트와 무관하게 작성 에이전트 3종이 설치된다 (Codex R3)', () => {
  const dir = mktarget('seo-authoring');
  try {
    // memory·superpowers 기본 → SEO 엔터(y) → 작성 도구 y → 나머지 기본
    install('11', dir, ['', '', '', 'y']);
    const a = agentFiles(dir);
    for (const must of ['meta/agent-creator.md', 'meta/skill-creator.md', 'meta/skill-tester.md', 'CLAUDE.md']) {
      assert.ok(a.includes(must), `작성 도구 y 인데 누락: ${must}`);
    }
    assert.deepStrictEqual(a.filter((x) => !['meta/agent-creator.md', 'meta/skill-creator.md', 'meta/skill-tester.md', 'CLAUDE.md'].includes(x)),
      SEO_GEO_AGENTS, '작성 도구 외 에이전트가 화이트리스트를 벗어남');
    const rules = fs.readdirSync(path.join(dir, '.claude', 'rules')).sort();
    assert.ok(rules.includes('creation-workflow.md') && rules.includes('verification-policy.md'), '작성 규칙 누락');
    assert.ok(fs.existsSync(path.join(dir, '.claude', 'skills', 'CLAUDE.md')), 'skills/CLAUDE.md 누락');
    // 작성 도구 n 으로 재설치하면 3종은 빠지고(옵션 제외 기록) SEO 자산은 그대로
    install('11', dir);
    const a2 = agentFiles(dir);
    assert.deepStrictEqual(a2, SEO_GEO_AGENTS, '작성 도구 n 재설치 후 집합이 화이트리스트로 수렴하지 않음');
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
