---
skill: bot-management-seo
category: frontend
version: v1
date: 2026-06-04
status: APPROVED
---

# bot-management-seo 검증 기록

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `bot-management-seo` |
| 스킬 경로 | `.claude/skills/frontend/bot-management-seo/SKILL.md` |
| 검증일 | 2026-06-04 |
| 검증자 | skill-creator (Claude) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Google Search Central, Cloudflare Bots Docs, AWS WAF Developer Guide)
- [✅] 공식 GitHub 2순위 소스 확인 (해당 없음 — 모두 공식 문서 사이트에서 직접 확인)
- [✅] 최신 버전 기준 내용 확인 (2026-06-04 기준)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (Verified Bots, CategorySearchEngine 레이블, 역DNS 검증)
- [✅] 코드 예시 작성 (Cloudflare 룰, AWS WAF JSON, 역DNS 명령어)
- [✅] 흔한 실수 패턴 정리 (8개 항목 표)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | Googlebot IP ranges JSON / Cloudflare Verified Bots / AWS WAF Bot Control / Googlebot reverse DNS | 4개 키워드 검색, 공식 문서 URL 확보 |
| 조사 | WebFetch | Google Verify Googlebot / Cloudflare Verified Bots / AWS WAF Bot Control rule group / Cloudflare Super Bot Fight Mode | 4개 공식 문서 페이지 직접 fetch, 정확한 레이블·동작·필드명 확보 |
| 보강 조사 | WebSearch | Googlebot/2.1 User-Agent / Naver Yeti UA / Bingbot UA·IP | User-Agent 문자열 정확 확인 |
| 교차 검증 | WebSearch | 5개 핵심 클레임, 독립 소스 2개 이상 대조 | VERIFIED 5 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Google Search Central — Verify Googlebot | https://developers.google.com/search/docs/crawling-indexing/verifying-googlebot | ⭐⭐⭐ High | 2026-06-04 | 공식 문서 |
| Google Search Central — Common Crawlers | https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers | ⭐⭐⭐ High | 2026-06-04 | 공식 문서 |
| Google — Googlebot IP JSON | https://developers.google.com/static/search/apis/ipranges/googlebot.json | ⭐⭐⭐ High | 2026-06-04 | 공식 데이터 (일일 갱신) |
| Cloudflare — Verified Bots | https://developers.cloudflare.com/bots/concepts/bot/verified-bots/ | ⭐⭐⭐ High | 2026-06-04 | 공식 문서 |
| Cloudflare — Super Bot Fight Mode | https://developers.cloudflare.com/bots/get-started/super-bot-fight-mode/ | ⭐⭐⭐ High | 2026-06-04 | 공식 문서 |
| AWS WAF — Bot Control Rule Group | https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-bot.html | ⭐⭐⭐ High | 2026-06-04 | 공식 문서 |
| Bing — Verify Bingbot | https://www.bing.com/toolbox/verify-bingbot | ⭐⭐⭐ High | 2026-06-04 | 공식 도구 |
| Naver Search Advisor 도움말 | https://help.naver.com/robots/ | ⭐⭐ Medium | 2026-06-04 | 공식이나 IP 범위 비공개 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (`AWSManagedRulesBotControlRuleSet` WCU: 50 등)
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임 (host 명령어, AWS WAF JSON, Cloudflare 표현식)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (Verified Bots, 라벨 매칭, 역DNS 검증)
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (Bot Fight Mode vs Super Bot Fight Mode 구분)
- [✅] 흔한 실수 패턴 포함 (8개 항목 표)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-04 skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 3/3 PASS)

---

## 4-5. 핵심 클레임 교차 검증 결과

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|---------|---------|------|
| 1 | Googlebot IP 범위 JSON은 `developers.google.com/static/search/apis/ipranges/googlebot.json` 또는 신규 `static/crawling/ipranges/common-crawlers.json`에서 제공된다 | Google Search Central Verify Googlebot 페이지 (WebFetch) | Search Engine Journal·Search Engine Land 기사 다수 (WebSearch) | VERIFIED |
| 2 | Googlebot Desktop User-Agent는 `Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)` 형식이다 | Google Search Central Common Crawlers 페이지 | Google Search Central 2019 업데이트 블로그·DEV.to 문서 | VERIFIED |
| 3 | Cloudflare는 Verified Bots(Googlebot, Bingbot 등)를 기본 통과시키며 `cf.verified_bot`/`cf.verified_bot_category` 필드로 WAF Custom Rules에서 분기 가능하다 | Cloudflare Verified Bots 공식 문서 (WebFetch) | Cloudflare Super Bot Fight Mode 공식 문서 (WebFetch) | VERIFIED |
| 4 | AWS WAF Bot Control의 `CategorySearchEngine` 룰은 검증된 검색 엔진 봇에는 매치되지 않고 `awswaf:managed:aws:bot-control:bot:category:search_engine` + `bot:verified` 레이블을 부여한다 | AWS WAF Developer Guide Bot Control rule group 페이지 (WebFetch) | AWS re:Post 지식센터 "Allow bot blocked by AWS WAF Bot Control rule group" | VERIFIED |
| 5 | Googlebot 검증은 역DNS → 도메인이 googlebot.com/google.com/googleusercontent.com 중 하나인지 확인 → 정방향 DNS 재조회 → IP 일치의 4단계로 수행한다 | Google Search Central Verify Googlebot 페이지 (WebFetch) | Google Search Central 2006 Verify Googlebot 블로그·SISTRIX 문서 | VERIFIED |

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-04
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Cloudflare WAF에서 Googlebot 안전 허용 — 올바른 표현식과 UA 매칭을 피해야 하는 이유**
- PASS
- 근거: SKILL.md "2.2 안전한 화이트리스트 패턴" 섹션
- 상세: `(cf.verified_bot)` 또는 `(cf.verified_bot_category eq "Search Engine Crawler")` 표현식이 명시되어 있고, User-Agent 문자열 매칭은 "스푸핑 가능 → 최후 수단"으로 경고가 기재됨. anti-pattern(UA 의존) 회피 명확.

**Q2. AWS WAF Bot Control 신규 도입 시 바로 Block 모드를 피해야 하는 이유와 올바른 순서**
- PASS
- 근거: SKILL.md "3.4 안전한 배포 패턴" 섹션 + "9. 흔한 실수" 표
- 상세: Count → 로그 분석(`terminatingRuleId`, `labels` 필드) → 예외 룰 추가 → Block 전환의 4단계가 명시됨. 섹션 9 흔한 실수 표에도 "Count 없이 바로 Block → 정당한 트래픽 즉시 차단"으로 구체 경고가 있음.

**Q3. WAF 적용 후 GSC 크롤링 급감 — robots.txt 먼저 수정 vs WAF 로그 먼저 확인**
- PASS
- 근거: SKILL.md "4. robots.txt vs WAF — 처리 순서" 섹션 + "9. 흔한 실수" 표
- 상세: 요청 평가 순서(CDN/WAF → Origin → Application → robots.txt)가 도식으로 명시됨. "WAF에서 차단되면 robots.txt는 절대 읽히지 않는다"는 핵심 문장이 존재하고, 진단 순서도 "WAF → CDN 봇 룰 → Rate Limiting → 서버 레벨 → robots.txt"로 명시됨. anti-pattern("robots.txt 수정으로 해결 시도 → 무효")도 표에 수록됨.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md 내용에서 정확한 근거를 도출할 수 있었음.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (라이브러리·패턴 정리형 스킬 → content test PASS = APPROVED 가능)
- 최종 상태: APPROVED

---

> (참고용 예정 템플릿 — 위 실제 기록으로 대체됨)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-06-04) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 실전 질문 답변 테스트 수행 (2026-06-04 완료, 3/3 PASS)
- [❌] Naver Yeti의 IP 정보가 공개될 경우 IP 범위 기반 검증 절차 추가 (선택 보강, 차단 요인 아님 — Yeti IP 비공개가 현재 공식 정책)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-04 | v1 | 최초 작성 (Google·Cloudflare·AWS WAF 공식 문서 기반) | skill-creator |
| 2026-06-04 | v1 | 2단계 실사용 테스트 수행 (Q1 Cloudflare WAF 화이트리스트 표현식 / Q2 AWS WAF Bot Control Count→Block 배포 순서 / Q3 크롤링 급감 시 WAF vs robots.txt 진단 순서) → 3/3 PASS, APPROVED 전환 | skill-tester |
