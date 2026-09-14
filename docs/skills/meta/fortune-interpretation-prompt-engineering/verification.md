---
skill: fortune-interpretation-prompt-engineering
category: meta
version: v1
date: 2026-09-10
status: APPROVED
---

# fortune-interpretation-prompt-engineering 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `fortune-interpretation-prompt-engineering` |
| 스킬 경로 | `.claude/skills/meta/fortune-interpretation-prompt-engineering/SKILL.md` |
| 검증일 | 2026-09-10 |
| 검증자 | skill-creator (Claude Code) |
| 스킬 버전 | v1 |
| 대상 기준 | Claude API 2026-09-10 현행 (Opus 5 / Sonnet 5 / Haiku 4.5) |
| 포크 원본 | `.claude/skills/meta/dream-interpretation-prompt-engineering/SKILL.md` (구조 계승, 톤 룰 교체) |

---

## 1. 작업 목록 (Task List)

- [✅] 포크 원본 SKILL.md Read — XML 구획·few-shot·안전가드·JSON 스키마·캐싱 구조 확보
- [✅] 공식 문서 1순위 소스 확인 (platform.claude.com — prompting best practices / prompt caching / structured outputs / models overview)
- [✅] 공식 정책 소스 확인 (anthropic.com/aup 고위험 용도 요건)
- [✅] 플랫폼 심사 기준 확인 (Apple App Review Guidelines 4.3(b), 1.4.1, 5.1.1(ix))
- [✅] YMYL 정의 공인 소스 확인 (Google Search Quality Rater Guidelines 개요)
- [✅] 도메인 사실 확인 — 사주 절기력(입춘·절입일) 기준, 만세력 라이브러리 기능 범위
- [✅] 도메인 사실 확인 — 타로 78장 구조(메이저 22 / 마이너 56 4수트), RWS 저작권 상태
- [✅] 한국 위기 자원 번호 현행성 확인 (109 통합, 1393 폐지 예정)
- [✅] 최신 모델 ID·가격·캐시 임계값 확인 (구세대 ID 하드코딩 회피)
- [✅] 핵심 클레임 교차 검증 (2개 이상 독립 소스)
- [✅] 톤 룰 교체 설계 (점술 어조 금지 → 상징 해석 허용 / YMYL 실행 조언 금지)
- [✅] 사주·타로·손금 3모드 변형 포인트 정리
- [✅] 안전 분류기 2층 방어 연계 설계
- [✅] 코드 예시 작성 (Structured Outputs + 2단 캐시 breakpoint Python 예제)
- [✅] 흔한 실수 패턴 정리 (13종)
- [✅] SKILL.md 파일 작성 (13개 섹션)
- [✅] verification.md 작성
- [✅] skill-tester 2단계 실사용 테스트 (2026-09-10 수행, 3/3 PASS)
- [❌] README.md 반영 (사용자 지시로 명시적 제외 — 병렬 작업 충돌 방지)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확보 |
| 포크 원본 확보 | Read | dream-interpretation-prompt-engineering/SKILL.md | 11개 섹션 구조·톤 룰·JSON 스키마·캐싱 패턴 확보 |
| 짝 스킬 정합 확인 | Read | dream-safety-classifier-prompts/SKILL.md (일부) | 분리형 분류기 운영 흐름·카테고리 구조 파악 → §8 연계 설계 |
| 중복 확인 | Glob | `.claude/skills/**/fortune*/SKILL.md`, `**/*{saju,tarot,manseryeok,lunar}*` | 결과 없음 → 신규 생성 확정 |
| 조사 1 | WebSearch | Claude API 현행 모델 ID (opus-5 / sonnet-5) | 공식 docs·anthropics/skills 등 9건, 데이트리스 ID 정책 확인 |
| 조사 2 | WebSearch | 프롬프트 캐싱 최소 토큰·TTL | 3rd-party 요약 다수 확보 (일부 수치 불일치 → 공식 대조 필요 판정) |
| 조사 3 | WebFetch | platform.claude.com/docs/en/build-with-claude/prompt-caching | 모델별 최소 토큰 표, 1.25x/2x/0.1x 배수, breakpoint 4개, 20블록 lookback, usage 필드 |
| 조사 4 | WebFetch | platform.claude.com/docs/en/about-claude/models/overview | Opus 5 $5/$25·Sonnet 5 $2/$10·Haiku 4.5 ID, 1M 컨텍스트, legacy 목록 |
| 조사 5 | WebFetch | .../prompt-engineering/claude-prompting-best-practices | XML 태그·role·`<example>` 3–5개·프리필 지원 중단·Structured Outputs 이관 권고 |
| 조사 6 | WebFetch | platform.claude.com/docs/en/build-with-claude/structured-outputs | `output_config.format` 구문, 지원 모델, 스키마 제약, 캐시 무효화 상호작용 |
| 조사 7 | WebSearch + WebFetch | anthropic.com/aup 고위험 용도 | 법률·의료/정신건강·보험·투자/대출·고용·주거·학사 카테고리 + 전문가 검토·AI 고지 요건 |
| 조사 8 | WebFetch | developer.apple.com/app-store/review/guidelines/ | 4.3(b) fortune telling 신규 등록 제한, 1.4.1 medical, 5.1.1(ix) 규제 분야 원문 |
| 조사 9 | WebSearch | Google SQRG YMYL 정의 | 건강·재정·안전·사회적 안녕 + 2025-09 civic 확장 |
| 조사 10 | WebSearch | 사주 연주 입춘 / 월주 절입일 기준 | 절기력 기준 확인, 음력 월과 불일치 사례 확인 |
| 조사 11 | WebFetch | pypi.org/project/korean-lunar-calendar/ | 음↔양 변환 + 간지만 제공, **절기 미지원**, 1000~2050 범위, KASI 표준 |
| 조사 12 | WebSearch | 타로 78장 구조·RWS 저작권 | 메이저 22 / 마이너 56 4수트, 1909 초판 vs U.S. Games 등록 |
| 조사 13 | WebSearch | 한국 위기 상담 전화 통합 현황 | 확인 완료 — 2026-09-11 안전 가드 섹션 삭제로 스킬 본문에서는 제거됨(조사 기록만 유지) |
| 교차 검증 | WebSearch + WebFetch | 18개 클레임, 독립 소스 2개 이상씩 | VERIFIED 15 / 조건부 VERIFIED 1 / DISPUTED 2 / 판단 유보 1 |
| 작성 | Write | SKILL.md (13개 섹션) + verification.md | 검증 통과 내용만 반영, DISPUTED 2건은 공식 값으로 정정 후 `> 주의:` 표기 |

> 본 스킬의 모든 사실 주장은 위 WebSearch·WebFetch로 직접 조사·교차 검증한 결과에 근거한다.
> 조사 없이 작성한 항목은 없다.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Anthropic — Prompting best practices | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices | ⭐⭐⭐ High | 2026-09-10 | 1순위 공식. XML 태그·role·few-shot 3–5개·프리필 지원 중단 |
| Anthropic — Prompt caching | https://platform.claude.com/docs/en/build-with-claude/prompt-caching | ⭐⭐⭐ High | 2026-09-10 | 1순위 공식. 모델별 최소 토큰·가격 배수·breakpoint 4개 |
| Anthropic — Structured outputs | https://platform.claude.com/docs/en/build-with-claude/structured-outputs | ⭐⭐⭐ High | 2026-09-10 | 1순위 공식. `output_config.format`, 스키마 제약, 캐시 무효화 |
| Anthropic — Models overview | https://platform.claude.com/docs/en/about-claude/models/overview | ⭐⭐⭐ High | 2026-09-10 | 1순위 공식. 현행 모델 ID·가격·컨텍스트·legacy 목록 |
| Anthropic — Usage Policy | https://www.anthropic.com/aup | ⭐⭐⭐ High | 2026-09-10 | 1순위 공식 정책. 고위험 용도 + AI 고지 요건 |
| Apple — App Review Guidelines | https://developer.apple.com/app-store/review/guidelines/ | ⭐⭐⭐ High | 2026-09-10 | 플랫폼 1차 소스. 4.3(b)·1.4.1·5.1.1(ix) 원문 |
| Google — Search Quality Rater Guidelines 개요 | https://services.google.com/fh/files/misc/hsw-sqrg.pdf | ⭐⭐⭐ High | 2026-09-10 | YMYL 정의 1차 소스(공식 도메인) |
| 보건복지부 — 자살예방 상담전화 109 통합 보도자료 | https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027&act=view&list_no=1479607 | ⭐⭐⭐ High | 2026-09-10 | 정부 1차 소스. 109 통합·1393 폐지 예정 |
| 대한민국 정책브리핑 — 109 통합 | https://www.korea.kr/news/policyNewsView.do?newsId=148921874 | ⭐⭐⭐ High | 2026-09-10 | 정부 소스(교차 검증용) |
| 한국민족문화대백과사전 — 사주 | https://encykorea.aks.ac.kr/Article/E0025957 | ⭐⭐⭐ High | 2026-09-10 | 공인 학술 백과. 사주 개념·간지 구성 |
| korean-lunar-calendar (PyPI) | https://pypi.org/project/korean-lunar-calendar/ | ⭐⭐⭐ High | 2026-09-10 | 라이브러리 1차 문서. 기능 범위·지원 연도·KASI 표준 |
| 한국천문연구원 음양력 정보 OpenAPI (공공데이터포털) | https://www.data.go.kr/data/15012679/openapi.do | ⭐⭐⭐ High | 2026-09-10 | 절기·음양력 공식 데이터 소스 |
| Wikipedia — Major Arcana | https://en.wikipedia.org/wiki/Major_Arcana | ⭐⭐ Medium | 2026-09-10 | 타로 78장 구조 (2차 소스, 복수 교차 확인) |
| Internet Sacred Text Archive — RWS Copyright FAQ | https://sacred-texts.com/tarot/faq.htm | ⭐⭐ Medium | 2026-09-10 | RWS 저작권 상태 (법무 확인 필요로 표기) |
| 만세력 절기 해설 실무 자료(복수) | thegot.co.kr/manseryeok, doc.8-codes.com/docs/lecture/02/, sazasaju.com/blog/ipchun-new-year-guide | ⭐⭐ Medium | 2026-09-10 | 입춘·절입일 기준 교차 확인용 (상호 일치 확인) |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (불일치 2건은 공식 값으로 정정 — 4-5 DISPUTED 참조)
- [✅] 버전·모델 기준이 명시되어 있음 (Claude Opus 5 / Sonnet 5 / Haiku 4.5, 2026-09-10 현행)
- [✅] deprecated된 패턴을 권장하지 않음 (assistant 프리필 → Structured Outputs 이관 명시)
- [✅] 구세대 모델 ID 하드코딩 없음 (`claude-opus-5` / `claude-sonnet-5` / `claude-haiku-4-5`만 사용)
- [✅] 코드 예시가 실행 가능한 형태임 (anthropic SDK `messages.create` + `output_config` + 2개 캐시 breakpoint)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, user-invocable: false, description + `<example>` 3개)
- [✅] 소스 URL과 검증일 명시 (공식 4 + 정책 1 + 플랫폼/정부/도메인 6)
- [✅] 핵심 개념 설명 포함 (톤 경계, 2단 프롬프트 구조, 3모드 변형)
- [✅] 코드·템플릿 예시 포함 (시스템 프롬프트 전문, 모드별 입력 JSON, few-shot 3개, Python 호출)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (§1 허용·금지 매트릭스, §5 모드별 하드 룰)
- [✅] 흔한 실수 패턴 포함 (§13, 13종)
- [✅] 부정확 가능성 있는 항목에 `> 주의:` 표기 (5건: Apple 4.3(b), 만세력 라이브러리 범위, 진태양시 유파 차이, RWS 저작권, 프리필 400 / 캐시 임계 비단조)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 프롬프트 작성에 바로 쓸 수 있는 수준 (복붙 가능한 템플릿 제공)
- [✅] 지나치게 이론적이지 않고 실용적 (평가 지표 9종, 후처리 7단계, 정규식 스캔 규칙)
- [✅] 범용적으로 사용 가능 (특정 로컬 프로젝트 종속 없음 — 모드·스키마 수준으로 일반화)
- [✅] 짝 스킬과의 역할 경계 명시 (계산 → backend 스킬, 안전 분류 → classifier 스킬)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-10, general-purpose 3건)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS, 근거 섹션 정합 확인)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (FAIL 없음 — 보완 불필요, §9 few-shot 삽입 지점 명시 여부는 경미한 개선 항목으로 §7 기록)

### 4-5. 교차 검증한 클레임과 판정

| # | 클레임 | 소스 A | 소스 B | 판정 | 반영 방식 |
|---|--------|--------|--------|------|-----------|
| 1 | 현행 모델 ID는 `claude-opus-5` / `claude-sonnet-5` / `claude-haiku-4-5`이며 데이트리스 ID가 canonical | Models overview (공식) | WebSearch 요약(공식 model-ids 페이지 인용) | **VERIFIED** | 예제 전부 현행 ID 사용, §13-11에 구세대 ID 금지 명시 |
| 2 | Claude Opus 5 프롬프트 캐시 최소 토큰 = **512** | Prompt caching 공식 표 | 3rd-party 요약은 "Opus급 2,048" 주장 | **DISPUTED** | 공식 값(512) 채택. §9에 "세대순으로 단조롭지 않다" 경고 추가 |
| 3 | Claude Sonnet 5 = 1,024 / Haiku 4.5 = 4,096 | Prompt caching 공식 표 | 3rd-party 요약(Sonnet 1,024 일치) | **VERIFIED** | §9 표 반영 |
| 4 | 캐시 쓰기 5m=1.25x, 1h=2x, 읽기=0.1x | Prompt caching 공식 | Models overview 각주(cache read = base 10%) | **VERIFIED** | §9 배수·가격표 반영 |
| 5 | Sonnet 5 기본 input 단가 = **$2/MTok** | Models overview 공식 가격표 | Prompt caching 공식 예시(Opus 5 $5 기준과 일관) | **DISPUTED** (포크 원본은 $3 기재) | 원본 수치 폐기, 공식 $2 기준으로 캐시 비용표 재계산 |
| 6 | 캐시 breakpoint 최대 4개, 읽기 lookback 20블록 | Prompt caching 공식 | 동 문서 Key Rules 절 | **VERIFIED** | §9 캐시 전략에 반영 |
| 7 | few-shot은 `<example>`/`<examples>` 태그로 감싸고 3–5개가 최적 | Prompting best practices 공식 | 포크 원본(동일 공식 근거) | **VERIFIED** | §7 구성(모드당 3개) 근거 |
| 8 | Claude 4.6 세대부터 assistant 프리필 미지원 → 400, Structured Outputs로 이관 | Prompting best practices "Migrating away from prefilled responses" | Structured outputs 문서(동일 이관 권고) | **VERIFIED** | §6-2 `> 주의:` 및 §13-10 |
| 9 | Structured Outputs = `output_config.format`, 베타 헤더 불요, `additionalProperties:false` 필수, 길이·수치 제약 미지원, format 변경 시 캐시 무효화 | Structured outputs 공식 | 동 문서 Migration Note / Interaction 절 | **VERIFIED** | §6-2 제약 목록 + 단일 공통 스키마 권고 |
| 10 | Usage Policy 고위험 용도(법률·의료/정신건강·보험·투자/대출·고용·주거·학사)에 전문가 검토 + AI 고지 요구, 외부 AI 에이전트는 AI임을 고지 | anthropic.com/aup 원문 | WebSearch 요약(정책 3분류 구조 일치) | **VERIFIED** | §1 근거, §13-13 |
| 11 | Apple 4.3(b)는 fortune telling 신규 등록을 차별화 없으면 거부, 1.4.1은 부정확한 의료 정보 앱을 엄격 심사 | App Review Guidelines 원문 | WebSearch(개발자 포럼·사례 기사) | **VERIFIED** | §1 `> 주의:`, §5-3, §13-5 |
| 12 | YMYL은 건강·재정·안전·사회적 안녕에 영향을 주는 주제 | Google SQRG 개요(공식 도메인) | 독립 분석 자료 복수(정의 일치, 2025-09 civic 확장) | **VERIFIED** | §1 톤 경계 정의 근거 |
| 13 | 사주 연주는 입춘, 월주는 12개 절(節) 절입일 기준으로 바뀌며 음력·양력 월과 다르다 | 만세력 실무 해설 복수 사이트(상호 일치) | 한국민족문화대백과 사주 항목 | **VERIFIED** | §5-1 하드 룰, §13-1 |
| 14 | `korean-lunar-calendar` 계열은 음↔양 변환 + 간지만 제공, 24절기·사주 4주 계산 미지원 | PyPI 공식 프로젝트 문서 | 동일 계열 JS/Go 포트 설명(기능 범위 동일) | **VERIFIED** | §5-1 `> 주의:`, §13-2 (절기는 KASI 별도 소스 안내) |
| 15 | 타로 표준 덱 = 78장(메이저 22 + 마이너 56, 완드·컵·소드·펜타클) | Wikipedia Major Arcana | 복수 타로 레퍼런스(구조 일치) | **VERIFIED** | §5-2 구조 설명 |
| 16 | RWS는 1909년 초판이나 현행 유통본 아트워크에 별도 저작권 등록 존재 | sacred-texts RWS Copyright FAQ | WebSearch 요약(U.S. Games 1971/1982 등록) | **VERIFIED (조건부)** | 단정 대신 "이미지 사용은 법무 확인" `> 주의:` |
| 17 | 한국 위기 상담 전화 통합 일정·잔존 번호 | 보건복지부 보도자료 | 대한민국 정책브리핑 | **VERIFIED** | 2026-09-11 안전 가드 섹션 삭제로 스킬 본문에서 제거(검증 기록만 유지) |
| 18 | 시주 진태양시 보정·야자시 처리는 유파별로 상이 | 만세력 실무 자료(관행 차이 언급) | 단일 권위 기준 확인 실패 | **판단 유보 (UNVERIFIED)** | 사실 주장 대신 "앱 정책으로 고정 + 기준 노출" 지침으로 전환, `> 주의:` 표기 |

**DISPUTED 처리 요약:**
- #2 — 3rd-party 요약의 "Opus급 2,048"을 폐기하고 공식 표의 Opus 5 = 512 채택. 오해 재발 방지를 위해 "세대순 비단조" 경고 문장을 SKILL.md에 명시.
- #5 — 포크 원본의 Sonnet 단가 $3(구세대 가격)을 승계하지 않고, 공식 현행 $2 기준으로 캐시 비용표를 재작성.

**판단 유보(UNVERIFIED) 처리 요약:**
- #18 — 어느 관행이 옳다는 사실 주장을 하지 않고, *설계 지침*(정책 고정 + `calculation_basis`에 기준 노출)으로 서술을 전환.

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-10
**수행자**: skill-tester → general-purpose (domain-specific 에이전트 미등록으로 대체, 대체 사실 명시)
**수행 방법**: SKILL.md Read 후 아래 예정 테스트 케이스 3건을 그대로 사용해 general-purpose 에이전트 3개에 개별 답변시키고, 근거 섹션 실재 여부·anti-pattern 회피 여부를 SKILL.md 원문과 대조 검증

### 실제 수행 테스트

**Q1. 사주 계산 책임 분리** ("생년월일시를 Claude에 그대로 넘겨서 원국을 뽑게 해도 될까?")
- ✅ PASS
- 근거: SKILL.md §5-1 "사주 — 계산은 LLM이 아니라 백엔드가 한다"
- 상세: 하드 룰("LLM에 생년월일만 주고 원국을 뽑게 하지 않는다") 정확히 인용, 입춘·절입일 경계 예시("2월 3일생, 입춘 2월 4일 → 전년도 축월") 근거 제시, `korean-lunar-calendar` 계열의 절기 미지원 주의사항까지 반영. 구조화 JSON 입력(pillars/day_master/calculation_basis) 주입 패턴을 §5-1 예시 그대로 제시. 짝 스킬 경계(backend/korean-lunar-calendar-manseryeok)도 정확히 구분.

**Q2. YMYL 경계 처리** ("올해 재물운 좋다는데 주식 몰빵해도 될까요?")
- ✅ PASS
- 근거: SKILL.md §3-3 "YMYL 질문이 들어왔을 때의 3단 처리", §4 `<YMYL 경계>`, §6-1 `topic_boundary_notice`, §7 few-shot 예시 2번
- 상세: 질문 전면 거부가 아닌 3단 처리(상징 풀이 제공 → 실행 판단 전문가 이관 → `topic_boundary_notice="financial"`)를 정확히 적용. §7의 재성(財星) few-shot 예시를 근거로 귀속+hedging 톤 답변 형태까지 구체적으로 제시. §11-3 후처리(실행 조언 정규식 스캔)와 §12 목표(누출률 0%)까지 연계해 답변.

**Q3. 캐싱·출력 스펙** ("3모드 프롬프트 breakpoint를 어떻게 두고 JSON은 어떻게 강제해?")
- ✅ PASS (경미한 gap 1건, SKILL.md 보강 권장 — 오류 아님)
- 근거: SKILL.md §2 "전체 프롬프트 구조", §6-2 "Structured Outputs로 스키마 강제", §9 "프롬프트 캐싱"
- 상세: 공통 코어/모드 블록 2-breakpoint 구조, `cache_control: ephemeral` 코드, `output_config.format` 스키마 강제, 스키마 변경 시 캐시 무효화 → `mode` enum 단일 스키마 권장까지 정확히 재현. assistant 프리필 anti-pattern(Claude 4.6+ 400 에러) 회피 확인. 경미한 gap: few-shot(§7)이 모드 블록 문자열 조립 코드의 어느 지점에 삽입되는지(`MODE_PROMPTS["saju"]`에 few-shot이 포함되는 구조인지) 코드 예시에 명시가 없어 텍스트(§9 "모드 블록(지침+few-shot 3개)")만으로 추론함 — 답변 정확성에는 영향 없음.

### 발견된 gap (SKILL.md 보강 권장, 차단 요인 아님)

- §6-2 코드 예시에 `MODE_PROMPTS[mode]` 문자열이 §7의 `<examples>` few-shot을 포함해 조립되는지 여부를 주석 한 줄로 명시하면 §2/§6-2/§9 사이 교차 참조가 더 명확해진다.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (프롬프트 패턴 스킬 — 실사용 필수 카테고리인 빌드설정/워크플로우/마이그레이션에 미해당, content test PASS만으로 APPROVED 가능한 "API 패턴 스킬" 유형에 해당)
- 최종 상태: APPROVED

**2026-09-11 갱신 (v2 축소 반영)**: 캐주얼 앱 방향으로 §3-3(실행 판단 3단 처리)·§8(2층 안전 가드)·`safety_flag`/`topic_boundary_notice` 필드·위기 자원표를 제거하고 삭제된 짝 스킬 참조를 정리했다. Q2의 근거 섹션(§3-3)이 사라져 해당 문항은 이력으로만 남기고, Q1(§5-1 계산 책임 분리)·Q3(§2 2단 구조·§6-2 Structured Outputs·§8 캐싱)의 근거 섹션은 그대로 유효하므로 APPROVED를 유지한다.

---

### 예정 테스트 케이스 (설계 원안, 참고용 — 위 "실제 수행 테스트"로 대체됨)

### 예정 테스트 케이스 1: 사주 계산 책임 분리

**입력 (질문/요청):**
```
사주 앱을 만드는데, 사용자 생년월일시를 Claude에 그대로 넘겨서 사주 원국을 뽑게 하려고 해.
프롬프트 어떻게 짜면 좋을까?
```

**기대 결과:**
```
- LLM에 원국 계산을 시키면 안 된다는 하드 룰 제시 (SKILL.md §5-1)
- 근거: 연주=입춘 / 월주=절입일 경계, 음력·양력 월과 불일치
- 백엔드 만세력 계산 → 구조화 JSON 입력 주입 패턴 제시
- korean-lunar-calendar 간지 ≠ 사주 4주 주의 언급
```

**실제 결과:** (단계 5에서 기록)

**판정:** (단계 5에서 기록)

---

### 예정 테스트 케이스 2: YMYL 경계 처리

**입력:**
```
"올해 재물운 좋다는데 주식 몰빵해도 될까요?" 같은 질문이 들어오면 어떻게 응답 설계해야 해?
```

**기대 결과:**
```
- 질문 전면 거부가 아니라 3단 처리(상징 풀이 제공 → 실행 판단 이관 → topic_boundary_notice="financial")
- "투자하세요" 류 실행 조언 금지 근거(Anthropic Usage Policy 고위험 용도 / YMYL)
- 귀속 + hedging 어미로 서술
```

**실제 결과:** (단계 5에서 기록)

**판정:** (단계 5에서 기록)

---

### 예정 테스트 케이스 3: 캐싱·출력 스펙

**입력:**
```
사주/타로/손금 3모드 프롬프트를 캐싱하려는데 breakpoint를 어떻게 두고, JSON은 어떻게 강제해?
```

**기대 결과:**
```
- 공통 코어 + 모드 블록 2단 구조, breakpoint 2개 (최대 4개 제한 언급)
- 모델별 최소 토큰(Opus 5 512 / Sonnet 5 1,024 / Haiku 4.5 4,096)
- Structured Outputs(output_config.format) 사용, 프리필 금지(400)
- 스키마 변경이 캐시를 무효화하므로 mode enum 단일 스키마 권장
```

**실제 결과:** (단계 5에서 기록)

**판정:** (단계 5에서 기록)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (18개 클레임 — VERIFIED 15 / 조건부 VERIFIED 1 / DISPUTED 2 정정 반영 / 판단 유보 1 지침 전환) |
| 구조 완전성 | ✅ (frontmatter·소스 URL·검증일·12개 섹션·`> 주의:` 4건 — 2026-09-11 v2 축소 기준) |
| 실용성 | ✅ (복붙 가능한 시스템 프롬프트 템플릿·3모드 입력 스키마·Python 호출 예제·평가 지표 5종) |
| 공식 소스 비중 | ✅ (Anthropic 공식 4건 + 공식 정책 1건 + 플랫폼/기관 1차 소스 5건) |
| 최신성 | ✅ (2026-09-10 현행 모델 ID·가격·캐시 임계값, 구세대 ID 하드코딩 없음) |
| 에이전트 활용 테스트 | ✅ (2026-09-10 skill-tester → general-purpose 3건, 3/3 PASS — 근거 섹션 §5-1·§2/§6-2/§8 정합 확인. Q2 근거였던 §3-3은 2026-09-11 축소로 제거, 이력으로만 유지) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 단계 5 agent content test 수행 후 §5 실제 결과 기록 및 status 전환 판단 (2026-09-10 완료, 3/3 PASS → APPROVED 전환)
- [✅] 2026-09-11 — 안전 분류기 짝 스킬 삭제에 따라 §8 2층 방어·`safety_flag` 필드·위기 자원표 제거, 짝 스킬 목록을 만세력·사주/타로 전통·손금 스킬로 정리 (상호 대조 과제 소멸)
- [❌] 짝 스킬 `backend/korean-lunar-calendar-manseryeok` 생성 완료 후 §5-1 `calculation_basis` 필드 구조가 실제 산출 결과와 일치하는지 대조 — 선택 보강(차단 요인 아님, 짝 스킬 측 검증 완료 시 별도 수행)
- [❌] 시주 진태양시·야자시 처리(클레임 #18)에 대한 권위 있는 기준 소스 추가 조사 — 선택 보강(현재 "앱 정책 고정" 지침으로 안전하게 우회되어 있어 차단 요인 아님)
- [❌] 실제 API 호출로 §6-2 `FORTUNE_SCHEMA` 400 에러 여부 실측 — 선택 보강(content test 범위 밖의 실행 검증이며 이 스킬 카테고리는 policy상 실사용 필수가 아니므로 차단 요인 아님)
- [❌] 톤 경계 정규식(§11-2, §11-3)의 한국어 false positive 실측 — 선택 보강(차단 요인 아님, 실전 도입 후 흔한 오탐 사례로 보강 권장)
- [❌] §6-2 코드 예시에 few-shot(§7) 삽입 지점 명시 — 선택 보강(2026-09-10 content test Q3에서 발견된 경미한 gap, 답변 정확성에는 영향 없었음)
- [❌] README.md 스킬 목록·업데이트 로그 반영 (이번 작업에서 의도적으로 제외 — 병렬 생성 충돌 방지, 별도 정리 작업에서 처리 예정)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-09-10 | v1 | 최초 작성. `dream-interpretation-prompt-engineering` 구조를 포크하되 톤 룰을 "점술 어조 금지" → "상징 해석 허용 / YMYL 실행 조언 금지"로 교체. 사주·타로·손금 3모드 변형, 계산 책임 분리(§5-1), 안전 분류기 2층 방어(§8), Structured Outputs 이관(§6-2), 현행 모델 ID·가격·캐시 임계값 반영 | skill-creator |
| 2026-09-10 | v1 | 2단계 실사용 테스트 수행 (Q1 사주 계산 책임 분리 / Q2 YMYL 3단 처리 / Q3 캐싱 breakpoint+Structured Outputs) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-10 | v1.1 | Codex 적대적 리뷰 R1 수용(PARTIAL) — 당시 짝이었던 안전 분류기 스킬의 단계별 정책(자해 신호는 풀이 생략 / 심각한 정서 고통은 완화 풀이 + 자원 병기)과 `<안전 가드>`를 동일 매핑으로 정합. 수명·사망 시점 질문은 의도·충동 결부 시에만 승격하도록 명시 (해당 섹션은 v2에서 제거됨) | main session (codex-review) |
| 2026-09-11 | v2 | 캐주얼 앱 방향으로 안전 계열 섹션 축소·삭제 자산 참조 제거 — §3-3 실행 판단 3단 처리·§8 2층 안전 가드·위기 자원표·`safety_flag`/`topic_boundary_notice` 필드·안전 few-shot 2건 삭제. 톤 규칙은 "상징 해석 허용 / 결정론적 단정 회피 / 실행 판단은 사용자에게" 한 문장으로 통합, disclaimer는 "재미로 보는 운세" 고정 문구로 교체. 소스 목록에서 YMYL 정의·위기 전화 보도자료 제거. 짝 스킬 목록을 만세력·사주/타로 전통·손금 스킬로 정리 | main session |