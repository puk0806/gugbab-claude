---
skill: dream-privacy-consent-ui
category: frontend
version: v1
date: 2026-05-15
status: PENDING_TEST
---

# dream-privacy-consent-ui 검증 기록

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dream-privacy-consent-ui` |
| 스킬 경로 | `.claude/skills/frontend/dream-privacy-consent-ui/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator (agent) |
| 스킬 버전 | v1 |
| 적용 법령 기준 | 한국 개인정보 보호법(2024년 9월 15일 시행령 적용) · GDPR(2016/679) · ePrivacy Directive |

---

## 1. 작업 목록 (Task List)

- [✅] 한국 개인정보 보호법 제23조(민감정보) 원문 확인 — law.go.kr
- [✅] 개인정보보호위원회(PIPC) 분리 동의·필수동의 폐지 가이드 확인 — pipc.go.kr
- [✅] GDPR Art.6/Art.7/Art.9 공식 텍스트 확인 — gdpr-info.eu
- [✅] EDPB Cookie Banner Taskforce Report (2023) 확인 — edpb.europa.eu
- [✅] ICO 가이드(Special category data, Consent) 확인 — ico.org.uk
- [✅] 한국 만 14세 미만 법정대리인 동의 절차 확인 — privacy.go.kr·easylaw.go.kr
- [✅] ePrivacy Directive Art.5(3) — localStorage·IndexedDB 동의 요건 확인
- [✅] 동의 기록 보관 요건(Art.7(1)) — ICO + Secure Privacy 교차 확인
- [✅] 한국 국외이전 별도 동의(제28조의8) 확인
- [✅] OpenAI·Anthropic 처리방침 관련 검색 (DPF 가입 여부는 *각 사 정책 확인 필요*로 명시)
- [✅] 다크 패턴 회피 — CNIL 과징금 사례 + EDPB 가이드 확인
- [✅] WCAG 2.2 동의 UI 접근성 권고 확인
- [✅] SKILL.md 파일 작성
- [✅] 실사용 테스트 (skill-tester 호출 완료 — 2026-05-15, 3/3 PASS)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | 한국 민감정보 별도 동의 처리 목적 항목 보관기간 | law.go.kr·pipc.go.kr·privacy.go.kr 등 10건 |
| 조사 | WebSearch | GDPR Art.6 lawful basis Art.9 explicit consent withdrawal | ICO·gdpr-info.eu·EDPB 등 10건 |
| 조사 | WebSearch | 정보통신망법 만 14세 미만 법정대리인 동의 | easylaw.go.kr·privacy.go.kr·kimchang 등 10건 |
| 조사 | WebSearch | GDPR cookie consent dark patterns pre-ticked EDPB | EDPB 보고서·CookieYes·CNIL 사례 등 10건 |
| 조사 | WebSearch | 한국 국외이전 별도 동의 OpenAI Anthropic 해외처리 | OpenAI policies·삼성SDS·코리아사이언스 등 10건 |
| 조사 | WebSearch | GDPR consent record proof timestamp version Article 7 | ICO·Secure Privacy·gdpr-info.eu 등 10건 |
| 조사 | WebSearch | PIPC 동의 받는 방법 분리 동의 필수 선택 | pipc.go.kr·catchsecu·boannews 등 10건 |
| 조사 | WebSearch | web.dev privacy UX consent dialog accessibility 2025 | UXmatters·secureprivacy·cookie-script 등 10건 |
| 조사 | WebSearch | 개인정보보호법 민감정보 정의 사상 신념 정신 심리 건강 제23조 | casenote·moleg·prespres·nepla 등 10건 |
| 조사 | WebSearch | GDPR ePrivacy localStorage IndexedDB consent | clym·iubenda·secureprivacy 등 10건 |
| 조사 | WebSearch | 개인정보 보호법 필수동의 폐지 2024-09-15 시행령 | privacy.go.kr·boannews·moleg 등 10건 |
| 교차 검증 | WebSearch | 핵심 11개 클레임, 독립 소스 2개 이상 | VERIFIED 11 / DISPUTED 0 / UNVERIFIED 0 (단, 일부 *주의* 표기) |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 국가법령정보센터 — 개인정보 보호법 | https://www.law.go.kr/LSW/lsInfoP.do?lsId=011357 | ⭐⭐⭐ High | 2026-05-15 | 1차 법령 |
| 국가법령정보센터 — 개인정보 보호법 시행령 | https://www.law.go.kr/LSW/lsInfoP.do?lsId=011468 | ⭐⭐⭐ High | 2026-05-15 | 1차 법령 |
| 개인정보보호위원회(PIPC) | https://www.pipc.go.kr/ | ⭐⭐⭐ High | 2026-05-15 | 한국 감독기관 공식 |
| 찾기쉬운 생활법령정보 — 14세 미만 동의 | https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=659 | ⭐⭐⭐ High | 2026-05-15 | 정부 공식 |
| 개인정보보호 포털 (privacy.go.kr) | https://www.privacy.go.kr/ | ⭐⭐⭐ High | 2026-05-15 | PIPC 산하 |
| GDPR Art.6 | https://gdpr-info.eu/art-6-gdpr/ | ⭐⭐⭐ High | 2026-05-15 | GDPR 원문 |
| GDPR Art.7 | https://gdpr-info.eu/art-7-gdpr/ | ⭐⭐⭐ High | 2026-05-15 | GDPR 원문 |
| GDPR Art.9 | https://gdpr-info.eu/art-9-gdpr/ | ⭐⭐⭐ High | 2026-05-15 | GDPR 원문 |
| EDPB Cookie Banner Taskforce Report (2023) | https://www.edpb.europa.eu/system/files/2023-01/edpb_20230118_report_cookie_banner_taskforce_en.pdf | ⭐⭐⭐ High | 2026-05-15 | EU 감독기관 공식 |
| ICO — Special category data | https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/lawful-basis-for-processing/special-category-data/ | ⭐⭐⭐ High | 2026-05-15 | UK 감독기관 |
| ICO — Consent | https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/consent/how-should-we-obtain-record-and-manage-consent/ | ⭐⭐⭐ High | 2026-05-15 | UK 감독기관 |
| 김·장 법률사무소 — 아동·청소년 개인정보 보호 가이드라인 | https://www.kimchang.com/ko/insights/detail.kc?sch_section=4&idx=25475 | ⭐⭐ Medium | 2026-05-15 | 법무법인 해설 |
| 보안뉴스 — 필수동의 폐지 시행 | https://m.boannews.com/html/detail.html?idx=132828 | ⭐⭐ Medium | 2026-05-15 | 업계 보도 |
| Secure Privacy — Consent audit evidence | https://secureprivacy.ai/blog/gdpr-consent-audit-evidence-requirements | ⭐⭐ Medium | 2026-05-15 | 컨설팅 가이드 |
| CookieYes — Dark Patterns | https://www.cookieyes.com/blog/dark-patterns-in-cookie-consent/ | ⭐⭐ Medium | 2026-05-15 | 업계 가이드 |
| Cookie-Script — WCAG Cookie Banner | https://cookie-script.com/guides/web-accessibility-and-cookie-banners-compliance-checklist | ⭐⭐ Medium | 2026-05-15 | 업계 가이드 |
| Clym — Cookies vs localStorage | https://www.clym.io/blog/what-are-cookies-local-storage-and-session-storage-from-a-privacy-law-perspective | ⭐⭐ Medium | 2026-05-15 | 업계 가이드 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 한국 개인정보 보호법 제23조 민감정보 정의(사상·신념·건강·성생활 등) 명시 — law.go.kr 원문 확인
- [✅] 한국 필수동의 폐지(2024-09-15 시행) 정확히 반영 — PIPC 가이드 확인
- [✅] GDPR Art.6 6가지 적법 근거 정확 — gdpr-info.eu 원문 확인
- [✅] GDPR Art.9 explicit consent 요건 정확 — ICO 확인
- [✅] GDPR Recital 32 미리 체크된 박스 금지 명시 — gdpr-info.eu 확인
- [✅] Art.7(3) 철회 용이성 원칙 명시 — ICO 확인
- [✅] ePrivacy Directive Art.5(3) localStorage·IndexedDB 적용 — 복수 소스 확인
- [✅] 한국 만 14세 미만 법정대리인 동의 + 확인 방법 6가지 — privacy.go.kr 확인
- [✅] 한국 국외이전 별도 동의(제28조의8) 명시 항목 정확 — PIPC 가이드 확인
- [✅] EDPB Cookie Banner Taskforce 위반 사례 정확 — EDPB 보고서 확인
- [✅] CNIL Google €150M·Facebook €60M 과징금 사례 정확 — 복수 소스 교차 확인

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description with examples)
- [✅] 소스 URL과 검증일 명시 (상단 + 하단 참고 소스)
- [✅] 핵심 원칙 5가지 Quick Reference
- [✅] 한국법·GDPR 양쪽 설명 포함
- [✅] React/TypeScript 코드 예시 포함
- [✅] 분리 동의 매트릭스 포함
- [✅] 다크 패턴 회피 체크리스트 포함
- [✅] 미성년자 동의 절차 포함
- [✅] 동의 기록 보관 스키마 포함
- [✅] 흔한 함정(anti-pattern) 12가지 포함
- [✅] 출시 전 통합 체크리스트 포함
- [✅] 짝 스킬(humanities/dream-content-privacy-ethics) 링크 명시
- [✅] 법률 자문 권유 명시

### 4-3. 실용성

- [✅] React 컴포넌트 예시 — 실제 사용 가능 수준
- [✅] CSS 다크 패턴 회피 비교 예시 포함
- [✅] 서버 측 동의 로그 스키마 포함
- [✅] Age gate + Just-in-time consent 패턴 포함
- [✅] WCAG 2.2 접근성 권고 포함
- [✅] 한국·GDPR 모두 적용되는 통합 가이드(가장 엄격한 기준 통합)
- [✅] 특정 프로젝트 종속 없음 — 범용 패턴

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] skill-tester 호출 완료 (2026-05-15)
- [✅] 테스트 질문 3개로 PASS 확인 (3/3 PASS)
- [✅] verification.md 섹션 5·6·7·8 업데이트 완료

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (도메인 에이전트 미지정, general-purpose 대체)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 한국 개인정보보호법 제23조 — 꿈 데이터 민감정보 해당 여부 + 별도 동의 UI 구성**
- PASS
- 근거: SKILL.md "2.1 민감정보 정의 (제23조)" + "2.2 민감정보 처리 요건" + "5.1 분리해야 할 동의 항목 매트릭스" + "13. 흔한 함정" 섹션
- 상세: 꿈 데이터의 민감정보 해당 조건 3가지(정신 건강→건강, 종교적·사상적→사상·신념, 성적→성생활)가 섹션 2.1에 명확히 서술됨. 별도 체크박스 필수 요건(제23조 제1항 제1호) 및 "한 체크박스로 묶으면 무효" anti-pattern이 섹션 2.2에 명시됨. React 코드(섹션 4.2)에서 `sensitiveData` 체크박스가 실제로 분리되어 있음.

**Q2. GDPR Art.9 explicit consent vs Art.6(a) consent 차이 + Art.6(f) 단독 사용 가능 여부**
- PASS
- 근거: SKILL.md "3.1 Art.6 — 적법 처리 근거 6가지" + "3.2 Art.9 — 민감정보(Special Category Data)" 섹션
- 상세: Art.6(f) 표에 "주의: 민감정보엔 미적용" 명시. Art.6 주의 박스에 "꿈 데이터 민감정보 가능성 있으면 (f) 단독 불가, Art.9 별도 조건 필요" 명시. Explicit consent 정의 — "일반 consent + 명백히 표현된 진술(체크박스 + 명시 문구, 음성 녹음, 서명 등)"이 섹션 3.2에 정확히 서술됨. Art.9 처리 조건이 Art.6과 *별도로* 충족 필요함을 명시.

**Q3. 만 14세 미만 법정대리인 동의 구현 + 다크 패턴 버튼 시각 비대칭 문제**
- PASS
- 근거: SKILL.md "7. 미성년자 동의 — 만 14세 미만" + "6. 다크 패턴 회피 체크리스트" + "6.1 CSS 다크 패턴 회피 예시" + "13. 흔한 함정" 섹션
- 상세: 법정대리인 동의 확인 방법 6가지(시행령 제17조의2)가 섹션 7.4에 명시됨. "보호자 동의 체크박스만 받으면 무효" anti-pattern 경고 포함. 시각 비대칭 버튼(수락만 강조 컬러/거부 회색 작은 글씨)이 EDPB Cookie Banner Taskforce 위반 사례로 섹션 3.4·6에 명시. 실제 CNIL Google €150M, Facebook €60M 과징금 근거(2022) 포함. 섹션 6.1 CSS 코드에서 `.btn-accept`와 `.btn-reject` 동일 시각 비중 예시 제공.

### 발견된 gap

- 없음. 3개 질문 모두 SKILL.md 내 근거 섹션에서 충분한 정보를 제공.
- 선택적 보강 권장: 2024년 9월 15일 필수동의 폐지 이후 "약관·민감정보 동의를 어떻게 처리할지" 명시 항목이 섹션 2.3에 있으나, 민감정보(제23조)는 필수동의 폐지와 무관하게 별도 동의가 여전히 필요하다는 점을 명시하면 혼동 방지에 도움됨 (차단 요인 아님, 선택 보강).

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 법령 준수 동의 UI 패턴 — 공식 "실사용 필수 카테고리"(빌드 설정/워크플로우/설정+실행/마이그레이션) 미해당. 단, 사용자 명시 지시에 따라 PENDING_TEST 유지.
- 최종 상태: PENDING_TEST (사용자 명시 지시 — 법령 준수 스킬은 실제 서비스 적용 후 APPROVED 전환)

(이하 skill-tester 호출 이전 예정 기록 — 참고용 보존)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ 11/11 VERIFIED (복수 공식 소스 교차 검증) |
| 구조 완전성 | ✅ 13/13 항목 충족 |
| 실용성 | ✅ 7/7 항목 충족 |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-15, skill-tester → general-purpose) |
| **최종 판정** | **PENDING_TEST** (agent content test 3/3 PASS — 사용자 명시 지시로 PENDING_TEST 유지) |

> **PENDING_TEST 유지 사유:** 본 스킬은 *법령 준수가 핵심*이며 잘못된 적용 시 *법적 책임*이 따른다. SKILL.md는 공식 법령·감독기관 자료 기반으로 작성되었으나, 실제 서비스 구현 시점에 *법률 자문 + 최신 법령 개정 확인*이 필요하다. *실사용 필수 카테고리*에 준함.

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6·7·8 업데이트 (2026-05-15 완료, 3/3 PASS)
- [❌] OpenAI/Anthropic DPF(EU-US Data Privacy Framework) 가입 현황은 *서비스 구현 시점*에 각 사 정책에서 직접 확인 필요 (스킬에는 *확인 필요*로 명시) — 차단 요인 아님, 선택 확인 사항
- [❌] 한국 적정성 결정 후 EU→한국 이전은 별도 동의 불필요하나, *역방향*(한국→미국 OpenAI/Anthropic)은 한국법 제28조의8 별도 동의 여전히 필요 — SKILL.md에 *명시 강화 검토* (차단 요인 아님, 선택 보강)
- [❌] 2024-09-15 필수동의 폐지와 민감정보(제23조) 별도 동의 필수성이 혼동될 수 있음 — "필수동의 폐지는 계약 이행 근거 적용이며, 민감정보 별도 동의는 여전히 필수"를 섹션 2.2·2.3에 명시 강화 검토 (차단 요인 아님, 선택 보강)
- [❌] 실제 프로덕션 적용 시 *법률 자문* 진행 후 verification.md APPROVED 전환 — 실사용 필수 전제 조건

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성. 한국 PIPL + GDPR 통합 동의 UI 패턴. 민감정보·분리 동의·다크 패턴·미성년자·국외이전·동의 기록 보관·UX 패턴 종합 | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 한국법 제23조 민감정보 별도 동의 / Q2 GDPR Art.9 explicit consent vs Art.6(a) / Q3 만 14세 미만 법정대리인 + 다크 패턴) → 3/3 PASS, PENDING_TEST 유지 (사용자 명시 지시) | skill-tester |
