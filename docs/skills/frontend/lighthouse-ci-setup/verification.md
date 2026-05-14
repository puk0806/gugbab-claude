---
skill: lighthouse-ci-setup
category: frontend
version: v1
date: 2026-05-14
status: PENDING_TEST
---

# lighthouse-ci-setup 스킬 검증 기록

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `lighthouse-ci-setup` |
| 스킬 경로 | `.claude/skills/frontend/lighthouse-ci-setup/SKILL.md` |
| 검증일 | 2026-05-14 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 패키지 | `@lhci/cli@0.15.1` (2025-06-26), `treosh/lighthouse-ci-action@v12` |

---

## 1. 작업 목록 (Task List)

- [✅] Lighthouse CI 공식 레포 README 확인
- [✅] 공식 Getting Started 문서 확인
- [✅] 공식 Configuration 문서 확인 (GitHub + Pages 양쪽)
- [✅] treosh/lighthouse-ci-action 공식 레포 확인
- [✅] web.dev/articles/vitals (Core Web Vitals 정의) 확인
- [✅] Chrome for Developers TBT 임계치 문서 확인
- [✅] npm @lhci/cli 최신 버전 확인 (0.15.1, 2025-06-26)
- [✅] Lighthouse 점수 가중치 조사 (TBT 30 / LCP 25 / CLS 25 / FCP 10 / SI 10)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성 (lighthouserc.json, GitHub Actions YAML)
- [✅] 흔한 실수 패턴 정리 (variance, throttling, startServerCommand 등)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | `lighthouse-ci/docs/getting-started.md` | 설치 명령, autorun/collect/assert/upload 구조, lighthouserc 예시 확보 |
| 조사 | WebFetch | `lighthouse-ci/docs/configuration.md` | collect/assert/upload 전체 옵션, preset 종류 확보 |
| 조사 | WebFetch | `treosh/lighthouse-ci-action` README | v12.6.2 (2026-03-12), inputs 목록 확보 |
| 조사 | WebFetch | `web.dev/articles/vitals` | LCP 2.5s / INP 200ms / CLS 0.1 threshold 확보. INP가 FID 대체 |
| 조사 | WebFetch | `developer.chrome.com/.../lighthouse-total-blocking-time` | TBT 모바일 0-200(green)/200-600(orange)/600+(red) 확보 |
| 조사 | WebFetch | `googlechrome.github.io/lighthouse-ci/docs/configuration.html` | assertion 문법 + 메트릭별 maxNumericValue 예시 |
| 조사 | WebFetch | `github.com/GoogleChrome/lighthouse-ci` README | 현재 버전 0.15.1, Node 18, treosh는 community 프로젝트 |
| 교차 검증 | WebSearch | "@lhci/cli npm latest version 2026" | 0.15.1 (10개월 전) 재확인 |
| 교차 검증 | WebSearch | "Lighthouse TBT threshold good poor lab metric" | TBT < 200ms (모바일), 점수 가중치 30% 재확인 |
| 교차 검증 | WebSearch | "lighthouse-ci assertions categories performance minScore 0.9 example" | `categories:performance` 키 + `["error", {"minScore": 0.9}]` 문법 재확인 |
| 교차 검증 | WebSearch | "lighthouse performance score weights 2026" | TBT 30 / LCP 25 / CLS 25 / FCP 10 / SI 10 — 복수 소스 일치 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Lighthouse CI 공식 레포 | https://github.com/GoogleChrome/lighthouse-ci | ⭐⭐⭐ High | 2026-05-14 | Google Chrome 공식 |
| LHCI Getting Started | https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md | ⭐⭐⭐ High | 2026-05-14 | 공식 문서 |
| LHCI Configuration (GH) | https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md | ⭐⭐⭐ High | 2026-05-14 | 공식 문서 |
| LHCI Configuration (Pages) | https://googlechrome.github.io/lighthouse-ci/docs/configuration.html | ⭐⭐⭐ High | 2026-05-14 | 공식 문서 미러 |
| treosh/lighthouse-ci-action | https://github.com/treosh/lighthouse-ci-action | ⭐⭐⭐ High | 2026-05-14 | 사실상 표준 GH Action (v12) — LHCI README가 community project로 링크 |
| web.dev Core Web Vitals | https://web.dev/articles/vitals | ⭐⭐⭐ High | 2026-05-14 | Google 공식 — CWV threshold 정의 |
| Chrome for Devs TBT | https://developer.chrome.com/docs/lighthouse/performance/lighthouse-total-blocking-time | ⭐⭐⭐ High | 2026-05-14 | 공식 — TBT 임계치 |
| npm @lhci/cli | https://www.npmjs.com/package/@lhci/cli | ⭐⭐⭐ High | 2026-05-14 | 0.15.1 버전 확인 (검색 결과 경유) |
| DebugBear Lighthouse 가중치 | https://www.debugbear.com/docs/metrics/lighthouse-performance | ⭐⭐ Medium | 2026-05-14 | 점수 가중치 보조 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (`@lhci/cli@0.15.1`, `treosh/lighthouse-ci-action@v12`, Node 18+)
- [✅] deprecated된 패턴을 권장하지 않음 (FID → INP 반영, TTI 가중치 0 명시)
- [✅] 코드 예시가 실행 가능한 형태임 (lighthouserc.json, YAML 모두 공식 문서 기준)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description, example 3개)
- [✅] 소스 URL과 검증일 명시 (7개 공식 URL + 2026-05-14)
- [✅] 핵심 개념 설명 포함 (collect/assert/upload 구조, CWV vs 랩 메트릭)
- [✅] 코드 예시 포함 (Next.js/SPA/정적, GitHub Actions, LHCI Server)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (upload target 비교표)
- [✅] 흔한 실수 패턴 포함 (7개 함정 섹션)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (실 baseline 임계치 명시)
- [✅] 범용적으로 사용 가능 (Next.js/Vite/CRA 모두 커버, 특정 프로젝트 종속 X)

### 4-4. 클레임 교차 검증 결과

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|----------|----------|------|
| 1 | `@lhci/cli` 최신 버전은 0.15.1 (2025-06-26) | LHCI 공식 레포 | npm 검색 결과 | **VERIFIED** |
| 2 | `numberOfRuns` 기본값은 3 | LHCI configuration.md | LHCI Pages config | **VERIFIED** |
| 3 | preset 종류: `lighthouse:all` / `:recommended` / `:no-pwa` | LHCI configuration.md | LHCI Pages config | **VERIFIED** |
| 4 | assertion 문법 `[level, options]` (eslint-style) | LHCI Pages config | DEV Community + CSS-Tricks 예시 일치 | **VERIFIED** |
| 5 | `categories:performance` 키로 카테고리 점수 assert | LHCI Pages config | WebSearch (DEV/Medium 예시 일치) | **VERIFIED** |
| 6 | LCP good ≤ 2.5s, CLS good ≤ 0.1 | web.dev/vitals | (Google 공식) — 단일이지만 1차 권위 자료 | **VERIFIED** |
| 7 | INP가 FID 대체 (2024-03) | web.dev/vitals | (단일이지만 Google 공식 발표) | **VERIFIED** |
| 8 | TBT good ≤ 200ms (모바일) | developer.chrome.com TBT | DebugBear/SigNoz/Unlighthouse 일치 | **VERIFIED** |
| 9 | Lighthouse 점수 가중치 — TBT 30 / LCP 25 / CLS 25 / FCP 10 / SI 10 | DebugBear | WebSearch 복수 소스(Flutebyte, dev.to, Unlighthouse) 일치 | **VERIFIED** |
| 10 | TTI는 Lighthouse 10부터 점수 가중치 0 | WebSearch 결과(여러 출처) | DebugBear "Lighthouse 10 dropped TTI" | **VERIFIED** (단, 본문에 `> 주의:` 표기로 메이저 버전 변경 가능성 안내) |
| 11 | `treosh/lighthouse-ci-action` v12가 현재 최신 | treosh README (v12.6.2, 2026-03-12) | LHCI 공식 README의 community projects 링크 | **VERIFIED** |
| 12 | treosh action은 community 프로젝트 (LHCI 공식 추천 아님) | LHCI 공식 README | treosh README 자체에 community 표기 | **VERIFIED** (본문에 표기) |
| 13 | aggregationMethod 4종 — median / optimistic / pessimistic / median-run | LHCI Pages config | LHCI GitHub config | **VERIFIED** |
| 14 | upload target — temporary-public-storage / lhci / filesystem | LHCI Pages config | LHCI GitHub config | **VERIFIED** |
| 15 | temporary-public-storage는 공개 URL + 수일 후 삭제 | LHCI Pages config | LHCI getting-started | **VERIFIED** |

DISPUTED: 0건
UNVERIFIED: 0건

> 클레임 10(TTI 가중치 0)은 공식 문서의 정확한 weight 테이블을 1차 소스로 못 잡고 web.dev/DebugBear 등 2차 소스에 의존했다. SKILL.md 본문에 `> 주의: ... 메이저 버전 업데이트 시 변경될 수 있다`로 명시했으며 [공식 Scoring Calculator](https://googlechrome.github.io/lighthouse/scorecalc/) 링크를 같이 안내했다.

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-14
**수행자**: skill-tester → general-purpose (frontend-developer 미사용 — general-purpose 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. performance 카테고리 0.9 미만 빌드 실패 + TBT pessimistic assertion 구성**
- PASS
- 근거: SKILL.md "4. Assertions — baseline 임계치 설정" 섹션 (4-2 카테고리 점수 assertion, 4-3 메트릭별 임계치, 4-4 aggregationMethod 선택)
- 상세: `"categories:performance": ["error", { "minScore": 0.9 }]` 문법과 `"total-blocking-time": ["error", { "maxNumericValue": 300, "aggregationMethod": "pessimistic" }]` 예시가 직접 포함됨. `"warn"` vs `"error"` 레벨 차이(exit code 0 vs non-zero) 및 TBT에 pessimistic 권장 이유(worst-case 보호)가 명확히 설명됨

**Q2. GitHub Actions에서 Lighthouse 점수가 매번 흔들릴 때 안정화 방법**
- PASS
- 근거: SKILL.md "7. 흔한 함정" 섹션 (7-1 variance 큰 메트릭은 numberOfRuns 3+, 7-2 CI 머신 사양 차이, 7-3 네트워크 throttling) + 섹션 5-1 treosh action runs 기본값 경고
- 상세: numberOfRuns 3(최소)/5(안정성 우선), aggregationMethod median/pessimistic 조합, 절대값보다 카테고리 점수 assertion, throttlingMethod "simulate" 재현성 향상, ±10~20% 흔들림 대응 임계치 여유 설정 전략까지 망라됨. false positive 빈발 anti-pattern 명시됨

**Q3. temporary-public-storage 보안 주의 — 비공개 사이트 audit 결과 처리**
- PASS
- 근거: SKILL.md "6. 결과 업로드 — temporary-public-storage vs LHCI Server" 섹션
- 상세: "공개 URL로 노출된다" 주의 블록과 대안(LHCI Server 또는 filesystem + private artifact) 명시됨. 비교표(temporary-public-storage/lhci/filesystem)와 사용처 기준(POC vs 팀 운영)까지 포함됨. 체크리스트 섹션 8에도 동일 기준 반복 확인됨

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md에서 직접 근거 도출 가능

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 빌드 설정 / CI 워크플로우 (실사용 필수 카테고리)
- 최종 상태: PENDING_TEST 유지 (content test PASS이나 실사용 필수 카테고리 — 실제 GitHub Actions 실행 결과 검증 후 APPROVED 전환)

---

> **참고 (skill-creator 작성 시점 원문)**: 본 스킬은 실사용 필수 카테고리(CI 워크플로우 빌드 설정 — 실행 결과·산출물로만 최종 검증 가능)에 해당하므로 content test PASS만으로 APPROVED 전환 불가이며 최종 상태는 PENDING_TEST로 유지된다.

**스킬 작성 시점**: 2026-05-14
**최종 status 결정 근거**: 실사용 필수 카테고리(빌드/CI 설정 스킬) — `verification-policy.md` 기준.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-14 수행 — 3/3 PASS) |
| **최종 판정** | **PENDING_TEST** (실사용 필수 카테고리, content test PASS) |

판정 사유: 1단계(오프라인 내용 검증) 완료 + 2단계(agent content test) 3/3 PASS 완료. 본 스킬은 *실사용 필수 카테고리*(CI 빌드 설정)이므로 실제 GitHub Actions 워크플로우 실행 및 산출 LHCI 리포트 검증까지 거쳐야 APPROVED 전환 가능.

---

## 7. 개선 필요 사항

- [❌] Lighthouse 점수 가중치(TBT 30 / LCP 25 / CLS 25 / FCP 10 / SI 10)의 1차 출처(공식 lighthouse 레포 scoring 문서) 직접 확인 — 현재 2차 소스 의존. **선택 보강** (차단 요인 아님 — 본문에 `> 주의:` 표기 및 공식 Scoring Calculator 링크로 대응 완료)
- [❌] LHCI Server self-hosting 가이드 (Docker 등) — 별도 스킬로 분리 가능. **선택 보강** (차단 요인 아님 — 본 스킬 범위 밖, 독립 스킬 생성으로 처리)
- [❌] performance budget(`budgetPath`) 상세 — 본 스킬에 추가하거나 별도 스킬 분리. **선택 보강** (차단 요인 아님 — 현재 스킬에서 budgetPath 입력 옵션 소개 수준으로 충분)
- [✅] skill-tester 호출 → 섹션 5 추가 기록 (2026-05-14 완료, 3/3 PASS)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성. LHCI 0.15.1 + treosh action v12 + Core Web Vitals 2026-05 기준. 15개 클레임 모두 VERIFIED. | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 performance/TBT assert 구성 / Q2 CI variance 안정화 / Q3 upload target 보안 선택) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
