---
skill: bot-management-seo
category: frontend
version: v2.1
date: 2026-09-28
status: APPROVED
---

# bot-management-seo 검증 기록

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `bot-management-seo` |
| 스킬 경로 | `.claude/skills/frontend/bot-management-seo/SKILL.md` |
| 검증일 | 2026-09-28 (최초 2026-06-04) |
| 검증자 | skill-creator (Claude) |
| 스킬 버전 | v2.1 |

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

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-04 skill-tester 수행 / 2026-09-28 skill-tester → general-purpose로 1.4절 ADD분 재수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS — 2026-06-04, 2/2 PASS — 2026-09-28)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 두 차례 모두 — 2026-09-28 Q2에서 IP 공유·UA 독립제어 서술 순서가 다소 혼동 소지가 있다는 선택적 개선 의견만 있었음)

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

### [2026-09-28] 선택 보강 반영

- 반영 내용: (1) 1.4절 주의 문단에 "Anthropic 3봇처럼 공식 IP 목록이 공유되면 IP 기반 WAF로는 구분 불가 — 봇별 세분 제어는 UA 매칭(robots.txt/WAF UA 규칙)으로만 가능"이라는 연결 문장 추가 (2) `Google-Extended` 행에 각주(※)를 달아 "실제로 접속하는 크롤러가 아니라 opt-out 토큰"임을 표에서 명시
- 근거: 기존 SKILL.md 본문(1.4절 표·독립 제어 서술·1.1절 common-crawlers.json 포함 서술)을 재구성한 **내부 명확화**로, 새 사실 추가 없음 (creation-workflow.md "문서 내부 명확화는 소스 확인 불필요" 적용)
- status 영향: 없음 — 순수 서술 명확화(연결 문장·각주)이며 사실·코드 변경이 아니므로 APPROVED 유지

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 2개 실전 질문(1.4절 AI 크롤러 UA+IP 목록 ADD분 겨냥 2개) 답변, 근거 섹션 및 anti-pattern 회피 확인. 그중 1개 질문은 `geo-ai-discoverability` SKILL.md도 함께 Read하여 두 스킬의 AI 크롤러 목록·분류가 서로 모순되지 않는지 교차 검증하도록 지시

### 실제 수행 테스트 (2026-09-28, 1.4절 AI 크롤러 UA·IP 목록 재테스트)

**Q1. WAF에서 OpenAI GPTBot(학습용)은 차단하고 ChatGPT-User(사용자 요청 시 실시간 fetch)는 막고 싶지 않다 — 가능한가? + bot-management-seo와 geo-ai-discoverability의 크롤러 목록이 서로 모순되지 않는지 확인**
- ✅ PASS
- 근거: SKILL.md "1.4절" 표(56-64줄) + 67줄("각 봇은 robots.txt에서 독립적으로 제어된다") + 89줄·173줄(UA 매칭 스푸핑 경고)
- 상세: GPTBot·ChatGPT-User는 UA·공식 IP JSON이 별개(`gptbot.json` vs `chatgpt-user.json`)이므로 봇 이름 단위 규칙으로 분리 제어 가능하다고 정확히 답변. 교차 검증 결과 두 스킬의 크롤러 명칭·분류(학습용/검색·인용용/사용자요청fetch)가 일치하며, `Google-Extended`에 대한 서술("common-crawlers.json에 포함" vs "크롤러가 아니라 robots.txt 토큰")도 **모순이 아니라 상호 보완**(IP가 별도로 없으므로 Googlebot의 공식 IP 목록을 그대로 참조한다는 동일 논리)이라고 정확히 판정함

**Q2. Anthropic ClaudeBot(학습용)을 WAF에서 차단하려면 어디를 참조해야 하며, Claude-User·Claude-SearchBot과 독립 제어가 가능한가?**
- ✅ PASS (경미한 gap 있음, 아래 참고)
- 근거: SKILL.md "1.4절" 표 61-63줄("3개 봇 공통 IP 목록") + 67줄(robots.txt 독립 제어)
- 상세: ClaudeBot·Claude-User·Claude-SearchBot이 공식 IP 목록(`claude.com/crawling/bots.json`)을 공유한다는 사실과 robots.txt 레벨에서는 봇 이름으로 독립 제어 가능하다는 점을 정확히 인용해 답변

### 발견된 gap (2026-09-28, 선택적 개선)

- bot-management-seo Q2: 1.4절이 "3개 봇 공통 IP 목록"(61-63줄)과 "각 봇은 독립적으로 제어된다"(67줄)를 인접 배치해, "IP 기반 WAF 화이트리스트로는 세 봇을 구분할 수 없고 독립 제어는 robots.txt(UA) 레벨에서만 가능하다"는 점이 한 문장으로 명시되지 않아 혼동 소지가 있음. **차단 요인 아님** — 답변 자체는 SKILL.md만으로 정확히 도출 가능했음. 선택 보강: "IP 목록은 공유되므로 WAF에서 봇별 세분 제어는 UA 매칭(스푸핑 주의)에 의존해야 한다"는 문장 추가 권장.

### 판정 (2026-09-28)

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (라이브러리·패턴 정리형 스킬 → content test PASS = APPROVED 가능)
- 최종 상태: APPROVED (유지)

---

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

### [2026-09-28] 재검증(2차) — AI 크롤러 UA·공식 IP 목록 ADD + Naver Yeti 현행 확인

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 4개를 1차 소스(Anthropic/OpenAI/Perplexity 공식 문서·IP JSON 실접속, WebSearch)와 대조, 보강 검토

**클레임 대조 결과**:
1. Naver Yeti의 UA 문자열과 "공식 IP 범위 미공개" 상태가 여전히 유효한가 → **VERIFIED(변경 없음)** — 최신 UA(`...Yeti/1.1; +https://naver.me/spd...`) 확인, 2026년 시점에도 공식 IP range 문서 확인 안 됨
2. Anthropic이 ClaudeBot/Claude-User/Claude-SearchBot 3봇 체계와 공식 IP 목록을 제공하는가 → **VERIFIED(ADD)** — https://support.claude.com/en/articles/8896518 (2026-02-20 갱신), IP 목록 https://claude.com/crawling/bots.json 실접속 확인(3봇 공통 목록)
3. OpenAI가 GPTBot(학습)/OAI-SearchBot(검색)/ChatGPT-User(에이전트) 3봇 각각의 공식 IP JSON을 제공하는가 → **VERIFIED(ADD)** — https://openai.com/gptbot.json, /searchbot.json, /chatgpt-user.json 3개 URL 모두 200 응답 실접속 확인
4. Perplexity의 PerplexityBot 공식 IP JSON이 존재하는가 → **VERIFIED(ADD)** — https://www.perplexity.ai/perplexitybot.json 실접속 확인(리다이렉트 후 200, JSON 구조 확인)

**보강(ADD)·축소**: 신규 "1.4 AI 크롤러(검색·에이전트·학습) — UA + 공식 IP 목록" 절 신설. OpenAI·Anthropic·Perplexity·Google-Extended 표(봇 이름·용도·공식 IP JSON URL) + "봇 이름 부분 문자열 매칭 권장"·"봇별 독립 제어" 주의사항 추가. 참조 URL 목록에 4개 링크 추가. 축소 없음.

**실전 질문 재검증**:
- Q1. "WAF에서 ClaudeBot은 막고 싶은데 Claude가 사용자 대신 우리 사이트를 조회하는 건 막고 싶지 않다 — 가능한가?" → SKILL.md "1.4절" 근거로 PASS (ClaudeBot·Claude-User·Claude-SearchBot은 독립 제어 가능, robots.txt/UA로 분리 매칭)
- Q2. "AI 크롤러들의 공식 IP 목록으로 WAF 화이트리스트를 구성하려면 어디를 봐야 하나?" → SKILL.md "1.4절" 표 근거로 PASS (사업자별 JSON URL 4종 제공)

**재검증 최종 판정**: status **PENDING_TEST 전환** (신규 ADD 섹션 발생 — 메인의 skill-tester 재테스트 대상)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (2026-09-28 재검증 4건 추가 VERIFIED) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-06-04) — 2/2 PASS (2026-09-28, 1.4절 ADD분 + geo-ai-discoverability 교차검증) |
| **최종 판정** | **APPROVED** (2026-09-28 skill-tester 재테스트 완료, 2/2 PASS — 크롤러 목록 교차검증 모순 없음 확인) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 실전 질문 답변 테스트 수행 (2026-06-04 완료, 3/3 PASS)
- [✅] 1.4절(AI 크롤러 UA·공식 IP 목록 ADD) content 재테스트 + geo-ai-discoverability 크롤러 목록 교차검증 (2026-09-28 완료, 2/2 PASS — skill-tester → general-purpose, 모순 없음 확인)
- [❌] Naver Yeti의 IP 정보가 공개될 경우 IP 범위 기반 검증 절차 추가 (선택 보강, 차단 요인 아님 — Yeti IP 비공개가 현재 공식 정책)
- [✅] 1.4절 "3개 봇 공통 IP 목록"과 "독립 제어 가능" 서술 순서로 인한 혼동 소지 — WAF에서는 UA 매칭만이 봇별 세분 제어 수단임을 명시하는 문장 추가 (2026-09-28 반영 — 연결 문장 추가 + `Google-Extended`가 크롤러가 아닌 opt-out 토큰임을 표에서 각주로 명시)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-04 | v1 | 최초 작성 (Google·Cloudflare·AWS WAF 공식 문서 기반) | skill-creator |
| 2026-06-04 | v1 | 2단계 실사용 테스트 수행 (Q1 Cloudflare WAF 화이트리스트 표현식 / Q2 AWS WAF Bot Control Count→Block 배포 순서 / Q3 크롤링 급감 시 WAF vs robots.txt 진단 순서) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-08-26 | v2 | freshness 재검증(83일 경과) — 역DNS 4단계·verified_bot·AWS Bot Control VERIFIED. **OUTDATED 2건 정정**: ① Googlebot IP JSON이 구경로(`search/apis/ipranges/googlebot.json`)를 1순위로 안내 → 공식 문서(verifying-googlebot·google-common-crawlers)가 `crawling/ipranges/common-crawlers.json`만 안내함을 확인해 단일화, 구경로는 2026-03 블로그 "New Location for the Google Crawlers' IP Range Files" 이후 미안내로 표기(감사 에이전트가 보고한 "04-07부터 더미 데이터"는 공식 문서에서 확인 못 해 **미기재**) ② Cloudflare AI 크롤러 Search/Agent/Training 3분류(2026-07-01)·Bot Preference Sync robots.txt prepend(2026-08-21 공식 블로그 확인) 2.5절 신설. "2026-09-15 기본 차단" 주장은 공식 소스에서 확인 안 돼 **미기재**, 대신 "기본값은 대시보드에서 직접 확인"으로 서술 | freshness-auditor + orchestrator |
| 2026-09-28 | v2.1 | 재검증(2차, 33일 경과) — Naver Yeti UA·IP 비공개 정책 변경 없음 재확인. **ADD**: 신규 "1.4 AI 크롤러 UA + 공식 IP 목록" 절 — OpenAI(GPTBot/OAI-SearchBot/ChatGPT-User)·Anthropic(ClaudeBot/Claude-User/Claude-SearchBot)·Perplexity(PerplexityBot)·Google-Extended 공식 IP JSON 4개 URL 실접속 확인 후 반영. status APPROVED → PENDING_TEST 전환 | orchestrator (2차 재검증 배치) |
| 2026-09-28 | v2.1 | 2단계 재테스트 수행 (Q1 GPTBot/ChatGPT-User 분리 제어 + geo-ai-discoverability 크롤러 목록 교차검증 / Q2 ClaudeBot 공식 IP 목록·3봇 독립 제어) → 2/2 PASS(경미한 선택보강 gap 1건), PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-28 | v2.1 | 선택 보강 반영 — 1.4절에 "IP 공유 시 WAF로 봇 구분 불가, 세분 제어는 UA 매칭으로만" 연결 문장 추가, `Google-Extended`가 크롤러가 아닌 opt-out 토큰임을 각주로 명시 (내부 명확화, 사실 변경 없음, status 유지) | orchestrator (선택 보강 반영 배치) |
