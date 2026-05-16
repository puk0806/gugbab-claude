---
skill: n8n-webhook-patterns
category: devops
version: v1
date: 2026-05-15
status: APPROVED
---

# n8n Webhook 패턴 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `n8n-webhook-patterns` |
| 스킬 경로 | `.claude/skills/devops/n8n-webhook-patterns/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 짝 스킬 | `devops/n8n-self-hosting`, `devops/n8n-workflow-design`, `devops/n8n-error-handling` |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.n8n.io)
- [✅] 공식 GitHub 2순위 소스 확인 (n8n-io/n8n issues, PRs)
- [✅] 최신 버전 기준 내용 확인 (2026-05-15)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (응답 모드, 인증, 보안)
- [✅] 코드 예시 작성 (HMAC 검증, secret token, CORS, nginx/Caddy)
- [✅] 흔한 실수 패턴 정리 (13개 함정 표)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | VERIFICATION_TEMPLATE.md | 8개 섹션 구조 확인 |
| 중복 확인 | Glob | `.claude/skills/devops/**/SKILL.md` | n8n-webhook-patterns 없음, github-actions 등 3개 기존 |
| 조사 1 | WebSearch | n8n Webhook node Test/Production URL | 공식 docs 5개 + 커뮤니티 글 5개 수집 |
| 조사 2 | WebSearch | Respond mode (On Received, Last Node, Respond to Webhook) | 공식 Respond to Webhook 노드 문서 확인 |
| 조사 3 | WebSearch | Authentication (Basic, Header, JWT, HMAC) | HMAC은 노드에 빌트인 부재, Code 노드 수동 구현 확인 |
| 조사 4 | WebFetch | docs.n8n.io webhook 본문 | 노드 파라미터·응답 모드·옵션 추출 |
| 조사 5 | WebFetch | Respond to Webhook 노드 본문 | 6가지 Respond With 옵션 확인 |
| 조사 6 | WebFetch | webhook common-issues | Test/Production URL·IP 화이트리스트·타임아웃 이슈 확인 |
| 조사 7 | WebSearch | CORS allowed origins OPTIONS preflight | `WEBHOOK_CORS_ALLOWED_*` 환경변수 4종 확인 |
| 조사 8 | WebSearch | multipart binary file upload | Binary Data 옵션·Raw Body 충돌 확인 |
| 조사 9 | WebSearch | rate limiting reverse proxy | nginx/Caddy 구성 예시 확인 |
| 조사 10 | WebSearch | Stripe·GitHub·Slack·Telegram signature | 서명 헤더·알고리즘 표 작성 |
| 조사 11 | WebFetch | ryanandmattdatascience.com guide | `$json.body/query/headers/params` 표현식 정리 |
| 조사 12 | WebFetch | logicworkflow.com security | nginx limit_req_zone·HMAC timing-safe 비교 확인 |
| 교차 검증 | WebSearch | 6개 핵심 클레임, 독립 소스 2~3개씩 | VERIFIED 6 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| n8n Docs — Webhook node | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 1순위 |
| n8n Docs — Webhook workflow development | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/workflow-development/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — Webhook common issues | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/common-issues/ | ⭐⭐⭐ High | 2026-05-15 | 공식 함정 목록 |
| n8n Docs — Respond to Webhook | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/ | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| n8n Docs — Webhook credentials | https://docs.n8n.io/integrations/builtin/credentials/webhook/ | ⭐⭐⭐ High | 2026-05-15 | 공식 인증 문서 |
| n8n Docs — Reverse proxy webhook URL | https://docs.n8n.io/hosting/configuration/configuration-examples/webhook-url/ | ⭐⭐⭐ High | 2026-05-15 | 공식 호스팅 가이드 |
| n8n GitHub Issue #14876 | https://github.com/n8n-io/n8n/issues/14876 | ⭐⭐⭐ High | 2026-05-15 | multipart binary 버그 보고 |
| n8n GitHub Issue #18143 | https://github.com/n8n-io/n8n/issues/18143 | ⭐⭐⭐ High | 2026-05-15 | Wait 노드 CORS preflight 버그 |
| n8n Community — HMAC feature request | https://community.n8n.io/t/feature-proposal-hmac-signature-verification-for-webhook-node/223375 | ⭐⭐ Medium | 2026-05-15 | HMAC 미내장 사실 확인 |
| logicworkflow.com webhook security | https://logicworkflow.com/blog/n8n-webhook-security/ | ⭐⭐ Medium | 2026-05-15 | HMAC·rate limit 패턴 |
| ryanandmattdatascience.com guide | https://ryanandmattdatascience.com/n8n-webhook/ | ⭐⭐ Medium | 2026-05-15 | 표현식 문법 정리 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (검증일 2026-05-15, n8n 1.x 기준)
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임 (HMAC, secret token, nginx/Caddy 설정)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (4개 공식 URL + 2026-05-15)
- [✅] 핵심 개념 설명 포함 (13개 섹션)
- [✅] 코드 예시 포함 (HMAC, Code 노드, nginx, Caddy, curl)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (응답 모드별·인증별 사용 시점)
- [✅] 흔한 실수 패턴 포함 (13개 함정 표)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (꿈 해몽 워크플로우 예시)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X — 꿈 해몽은 예시일 뿐)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15, 3/3 PASS)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-05-15)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음)

---

## 4-A. 교차 검증 결과

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| 1 | Webhook 노드는 Test URL(`/webhook-test/`)·Production URL(`/webhook/`) 두 개를 발급, Active 토글 ON 시에만 Production 동작 | docs.n8n.io webhook + community.n8n.io 80228 | VERIFIED |
| 2 | 응답 모드 3종: Immediately / When Last Node Finishes / Using 'Respond to Webhook' Node | docs.n8n.io webhook + respondtowebhook + automategeniushub | VERIFIED |
| 3 | 인증 4종: None / Basic Auth / Header Auth / JWT Auth — HMAC은 노드 빌트인으로 제공되지 않음 | docs.n8n.io credentials webhook + community.n8n.io 223375 (feature request) + GitHub issue 13146 | VERIFIED |
| 4 | CORS 환경변수: `WEBHOOK_CORS_ALLOWED_ORIGINS`, `WEBHOOK_CORS_ALLOWED_METHODS`, `WEBHOOK_CORS_ALLOWED_HEADERS`, `N8N_CORS_ALLOW_ORIGIN` | corsproxy.io + Railway docs + prosperasoft.com | VERIFIED |
| 5 | multipart 처리: Binary Data 옵션 ON, Raw Body OFF, Binary Property 비워두면 모든 파일 자동 매핑 | prosperasoft.com + community.n8n.io 15945 + GitHub issue 14876 | VERIFIED |
| 6 | Respond `Immediately` 모드 시 후속 Respond to Webhook 노드는 실행되지만 응답에 반영되지 않음 (이미 200 전송됨) | automategeniushub.com + Synta.io blog | VERIFIED |

DISPUTED 0건 / UNVERIFIED 0건.

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (devops 도메인 전용 에이전트 없어 general-purpose 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Stripe에 등록할 URL 선택 — Test URL vs Production URL, Production 404 원인**
- PASS
- 근거: SKILL.md "1. Webhook 노드 기본 — Test URL vs Production URL" 섹션 표 + 중요 함정 2번 ("Active 토글 ON이어야만 응답한다. Inactive 상태면 404.") + 섹션 13 함정 표 "Production URL 404" 행
- 상세: Production URL(`/webhook/...`)을 외부 서비스에 등록해야 하며, 404 원인은 Active 토글 OFF임을 SKILL.md가 명확히 기술. Test URL은 1회 호출 후 만료라는 anti-pattern도 명시됨.

**Q2. `Immediately` + Respond to Webhook 노드 조합 모드 충돌 함정**
- PASS
- 근거: SKILL.md "3. 응답 모드 (Respond)" 섹션 표 + 섹션 13 함정 표 "`Respond: Immediately`인데 Respond to Webhook 무동작" 행
- 상세: `Immediately` 시 후속 Respond to Webhook 노드는 무시된다는 핵심 함정이 명확히 기술됨. 커스텀 상태 코드(201)·JSON을 반환하려면 `Using 'Respond to Webhook' Node` 모드로 바꿔야 함을 도출 가능.

**Q3. CORS 환경변수 4종 + multipart Binary Data 설정 (Raw Body OFF, Binary Property 비워두기)**
- PASS
- 근거: SKILL.md "6. CORS — 브라우저에서 직접 호출" 환경변수 블록 + "9. 파일 업로드 — Binary Data · multipart" 3단계 설정 + 섹션 13 "CORS preflight 실패" 행 + "multipart에서 파일명 손실" 행
- 상세: CORS 4종 환경변수(`WEBHOOK_CORS_ALLOWED_ORIGINS/METHODS/HEADERS`, `N8N_CORS_ALLOW_ORIGIN`) 완비. Binary Data ON, Raw Body OFF, Binary Property 비워두기라는 3가지 설정이 명확히 기술. "raw body와 binary 처리는 양립 불가"라는 anti-pattern 경고도 존재.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md 내에서 완전한 근거 확인.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (n8n Webhook 사용법 — 답변 정확성으로 검증 가능, content test로 충분)
- 최종 상태: APPROVED

---

> (참고) 원래 예정 메모: SKILL.md 작성 직후 skill-tester 에이전트 호출 예정. 본 문서는 PENDING_TEST 상태로 저장하고, skill-tester가 섹션 5·6을 갱신한다.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-05-15) |
| **최종 판정** | **APPROVED** |

검증 정책상 본 스킬은 *content test로 충분* 카테고리에 해당한다 (n8n Webhook 노드 사용법 — 답변 정확성으로 검증 가능, 빌드 산출물 검증 불필요). skill-tester가 content test PASS 판정 시 APPROVED로 전환 가능.

---

## 7. 개선 필요 사항

- [✅] skill-tester로 실전 질문 2~3개 PASS 확인 필요 (2026-05-15 완료, 3/3 PASS)
- [❌] n8n 버전 업그레이드 시 (특히 HMAC 내장 지원 추가 시) 섹션 5·10 갱신 — 차단 요인 아님, 선택 보강 (현재 HMAC 미내장은 community feature request 단계로 실제 추가 시 업데이트 권장)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (13개 섹션, 공식 docs 4종 + 보조 5종 교차 검증) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 Test/Production URL 404 원인 / Q2 Immediately+Respond to Webhook 모드 충돌 / Q3 CORS 환경변수+Binary Data 설정) → 3/3 PASS, APPROVED 전환 | skill-tester |
