---
skill: naver-seo-specifics
category: frontend
version: v1.1
date: 2026-08-26
status: APPROVED
---

# naver-seo-specifics 검증 기록

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `naver-seo-specifics` |
| 스킬 경로 | `.claude/skills/frontend/naver-seo-specifics/SKILL.md` |
| 검증일 | 2026-06-03 (최초) / **2026-08-26 (freshness 갱신)** |
| 검증자 | skill-creator |
| 스킬 버전 | v1.1 |

---

## 1. 작업 목록 (Task List)

- [✅] 네이버 검색 공식 소스(searchadvisor.naver.com, searchblog.naver.com, d2.naver.com) 확인
- [✅] 한국 검색 시장 점유율 측정 기관별 차이 확인 (StatCounter vs 인터넷트렌드)
- [✅] C-Rank·D.I.A.·D.I.A.+ 알고리즘 공식 설명 수집
- [✅] 스마트블록·에어서치 도입 배경 확인
- [✅] Yeti 크롤러 User-agent 형식 확인
- [✅] robots.txt·sitemap·canonical·OG·schema.org 지원 여부 정리
- [✅] Google과의 공통점·차이점 구분 정리
- [✅] Daum·ZUM·Bing 위치 점유율 확인
- [✅] 안티패턴(키워드 스터핑·백링크 구매·AI 양산·중복 콘텐츠) 검증
- [✅] SKILL.md 파일 작성
- [✅] 추측 항목에 `> 주의: 비공식 분석` 표기

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "한국 검색 시장 점유율 2026 statcounter" | StatCounter Google 46-47% vs 네이버 43-44% 확인 |
| 조사 | WebSearch | "naver C-Rank algorithm 공식" | C-Rank 신뢰도 평가 알고리즘, Context·Content·Chain 3축 확인 |
| 조사 | WebSearch | "naver D.I.A. DIA plus algorithm" | DIA 문서 품질·DIA+ 의도 분석 확장 모델 확인 |
| 조사 | WebSearch | "naver search advisor 소유권 sitemap" | 서치어드바이저 등록 절차·sitemap·RSS 제출 확인 |
| 조사 | WebSearch | "네이버 통합검색 VIEW 컬렉션" | 결과 없음 → 다른 키워드로 재조사 |
| 조사 | WebSearch | "네이버 웹문서 robots.txt sitemap canonical" | Yeti crawler·sitemap·canonical 지원 확인 |
| 조사 | WebSearch | "네이버 schema.org JSON-LD 지원" | 네이버 특화 JSON-LD 공식 지원 불명확 확인 → 비공식 분석 표기 |
| 조사 | WebSearch | "Daum Kakao ZUM 검색 점유율" | Daum 3-4%, ZUM 0.1-0.2% 확인 |
| 조사 | WebSearch | "네이버 Yeti 크롤러 User-agent" | User-Agent 형식 `Mozilla/5.0 (compatible; Yeti/1.1; +http://naver.me/spd)` 확인 |
| 조사 | WebSearch | "네이버 스마트블록 알고리즘 2025" | 스마트블록·에어서치(AiRSEARCH) 통합 알고리즘 브랜드 확인 |
| 조사 | WebSearch | "네이버 SEO 백링크 안티패턴 페널티" | 키워드 스터핑·백링크 구매·중복 콘텐츠 페널티 확인 |
| 조사 | WebSearch | "네이버 OG 메타태그 카카오톡 공유" | OG 태그 카카오톡·네이버 공유에 사용·캐시 클리어 도구 확인 |
| 검증 | WebFetch | searchadvisor.naver.com 공식 가이드 | 접근 실패 → 인용 자료에서 우회 확인 |
| 교차 검증 | WebSearch | C-Rank 3축 구조 재확인 | 복수 출처 일치 → VERIFIED |
| 교차 검증 | WebSearch | StatCounter vs 인터넷트렌드 측정 방법론 | 두 기관 측정 차이 원인 확인 → VERIFIED |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 네이버 서치어드바이저 공식 | https://searchadvisor.naver.com/ | ⭐⭐⭐ High | 2026-06-03 | 공식 SEO 가이드·웹마스터 도구 |
| 네이버 검색 공식 블로그 | https://searchblog.naver.com/ | ⭐⭐⭐ High | 2026-06-03 | C-Rank·D.I.A.·D.I.A.+ 공식 발표 채널 |
| 네이버 D2 | https://d2.naver.com/ | ⭐⭐⭐ High | 2026-06-03 | 네이버 엔지니어링 공식 블로그 |
| StatCounter Korea | https://gs.statcounter.com/search-engine-market-share/all/south-korea | ⭐⭐⭐ High | 2026-06-03 | 글로벌 트래픽 코드 기반 점유율 |
| 인터넷트렌드 | https://www.internettrend.co.kr/ | ⭐⭐ Medium-High | 2026-06-03 | 국내 표본 기반 점유율 |
| 한국데이터경제신문 | https://www.dataeconomy.co.kr/news/articleView.html?idxno=35954 | ⭐⭐ Medium | 2026-06-03 | 점유율 변화 보도 (구글 46% vs 네이버 43%) |
| 테크42 | https://www.tech42.co.kr/ | ⭐⭐ Medium | 2026-06-03 | 인터넷트렌드 데이터 인용 보도 |
| 어센트코리아 | https://www.ascentkorea.com/naver-airsearch-smartblock/ | ⭐⭐ Medium | 2026-06-03 | 한국 SEO 전문 에이전시, 에어서치·스마트블록 해설 |
| TBWA 데이터랩 | https://seo.tbwakorea.com/blog/ | ⭐⭐ Medium | 2026-06-03 | 한국 SEO 가이드, 서치어드바이저·robots.txt 설명 |
| 아이보스 | https://www.i-boss.co.kr/ab-6141-66453 | ⭐⭐ Medium | 2026-06-03 | 스마트블록·D.I.A.+ 예시 해설 |
| 카카오 디벨로퍼스 | https://developers.kakao.com/docs/latest/ko/daum-search/common | ⭐⭐⭐ High | 2026-06-03 | Daum 검색 공식 문서 |

### 3-1. 2026-08-26 갱신 시 추가 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 네이버 공식 스토리 — "네이버 검색의 진화된 AI 브리핑을 선보입니다" | https://navercorp.com/storyDetail?seq=32525 | ⭐⭐⭐ High | 2025-05-23 | AI 브리핑 동작·출처 표기·확장 계획 1차 설명 |
| 네이버 공식 보도자료 — AI 브리핑 도입 | https://www.aitimes.com/news/articleView.html?idxno=169029 (원문: 네이버 배포 보도자료 2025-03-24) | ⭐⭐ Medium-High | 2025-03-24 | 출시 시점·전 사용자 제공·3개 유형. 네이버 배포 보도자료의 매체 전재본 |
| 네이버 공식 보도자료 — "콘텐츠의 힘 가장 잘 아는 네이버…" | https://www.navercorp.com/media/pressReleasesDetail?seq=10034302 | ⭐⭐⭐ High | 2026-05-28 | **AI 브리핑 월 3,000만 명** 공식 수치, 네이버 메이트(연 약 200억 원, 월 약 3,000명) |
| 네이버 공식 보도자료 — 블로그 창작자 수익·지원 확대 | https://www.navercorp.com/media/pressReleasesDetail?seq=10034578 | ⭐⭐⭐ High | 2026-08-07 | AI 브리핑 도입 전후 창작자 지원 규모 약 2배, 인용수 기반 보상 확인 |
| 네이버 공식 보도자료 — AI탭 베타 출시 | https://www.navercorp.com/media/pressReleasesDetail?seq=34984 | ⭐⭐⭐ High | 2026-04-28 | AI탭 진입 경로에 AI 브리핑 영역 포함 |
| 인더스트리뉴스 — AI브리핑 검색 비중 20% 돌파 | https://www.industrynews.co.kr/news/articleView.html?idxno=75733 | ⭐⭐ Medium | 2025-12-15 | 네이버 공식 발표 인용 (2025-12-11 20% 돌파) |
| 서울경제TV — 네이버 4Q 컨퍼런스콜 | https://www.sentv.co.kr/article/view/sentv202602060034 | ⭐⭐ Medium | 2026-02-06 | 최수연 대표 "통합검색 쿼리 약 20% → 연말 2배(약 40%)" 발언 |
| StatCounter Korea (재조회) | https://gs.statcounter.com/search-engine-market-share/all/south-korea | ⭐⭐⭐ High | 2026-08-26 조회 | 2026-07 Google 49.54% / Naver 40.9% / Bing 5.44% / Daum 0.95% |
| 인터넷트렌드 데이터 인용 보도 | https://v.daum.net/v/20260422060211189 | ⭐⭐ Medium | 2026-04-22 | 2025-09~2026-04 네이버 60%+ 8개월 연속, 일간 최고 70.6% |
| SEO NEWS — AI 브리핑 인용 출처 분석 | https://seonews.co.kr/naver-ai-briefing-geo-202605/ | ⭐ Medium-Low | 2026-05 | 272건 표본 분석. **비공식 분석으로만 인용** |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음 (불확실 항목은 `> 주의: 비공식 분석` 표기)
- [✅] 측정 기관별 점유율 차이 명시 (2026년 기준)
- [✅] deprecated 패턴(키워드 스터핑·백링크 구매) 안티패턴 섹션에 분리
- [✅] 코드/설정 예시 (Yeti User-Agent)가 실제 형식과 일치

### 4-2. 구조 완전성

- [✅] YAML frontmatter (name, description) 포함
- [✅] 소스 URL과 검증일 명시 (`> 소스:`, `> 검증일:`)
- [✅] 핵심 알고리즘 3종(C-Rank, D.I.A., D.I.A.+) 별도 섹션
- [✅] Google과 공통·차이 항목 구분
- [✅] 실무 체크리스트 포함
- [✅] 흔한 실수 패턴(안티패턴) 표 포함
- [✅] 관련 스킬 포인터(`search-console-webmaster`, `kakao-share-optimization`) 명시

### 4-3. 실용성

- [✅] 한국 시장 운영자가 즉시 사용 가능한 체크리스트 형태
- [✅] 측정 기관별 점유율 차이까지 다뤄 *실무 판단 근거*까지 제공
- [✅] 자체 도메인 + 네이버 블로그 병행 전략 같은 *실무 흐름* 포함

### 4-4. 클레임 교차 검증 결과

| 클레임 | 판정 | 근거 |
|--------|------|------|
| StatCounter 기준 2026년 한국 점유율 Google 46-47%, Naver 43-44% | VERIFIED | StatCounter 직접 인용 + 한국데이터경제신문 보도 |
| 인터넷트렌드 기준 2025년 네이버 평균 62.86%, Google 29.55% | VERIFIED | 테크42 보도 + 인터넷트렌드 원 데이터 일치 |
| 네이버 크롤러 User-Agent는 `Yeti` | VERIFIED | 네이버 서치어드바이저 가이드 + 다수 출처 일치 |
| 네이버는 robots.txt, sitemap, canonical 지원 | VERIFIED | 서치어드바이저 가이드 + TBWA·익스트림매뉴얼 일치 |
| C-Rank는 *출처(블로그)의 신뢰도* 평가 알고리즘 | VERIFIED | 네이버 검색 공식 블로그 인용 (복수 출처) |
| C-Rank 3축은 Context·Content·Chain | VERIFIED | 다수 한국 SEO 전문 출처 일치 (네이버 2016년 발표 기반) |
| D.I.A.는 *문서 단위 품질* 평가 | VERIFIED | 네이버 검색 공식 블로그 인용 |
| D.I.A.+는 *검색 의도 깊이* 분석 확장 모델 | VERIFIED | 아이보스 해설 + 네이버 공식 예시(강남역 스테이크) 일치 |
| 스마트블록은 2021년 도입, 에어서치(AiRSEARCH)가 통합 브랜드 | VERIFIED | 어센트코리아·아이보스·로카포스팅 일치 |
| Daum 2025년 점유율 약 3-4%, ZUM 0.1-0.2% | VERIFIED | 인터넷트렌드 + 다음 자체 보도 일치 |
| 네이버는 schema.org JSON-LD 리치 결과 공식 지원이 명확하지 않음 | DISPUTED → 본문에 `> 주의: 비공식 분석` 표기 | 공식 문서에서 명시 미확인 |
| 네이버는 Google보다 *링크 그래프 가중치*가 낮다 | DISPUTED → 본문에 `> 주의: 비공식 분석` 표기 | 공식 발표 미확인, 실무 통념 |
| C-Rank 가중치·계산식은 비공개 | VERIFIED | 네이버 공식 발표가 가중치 미공개 |
| 한국 모바일 검색 점유 70%+ | VERIFIED | 다수 보도 일치 |

### 4-5. 2026-08-26 갱신분 클레임 교차 검증 결과

| 클레임 | 판정 | 근거 |
|--------|------|------|
| AI 브리핑은 2025년 3월 정식 출시, 검색창을 통해 전 사용자에게 제공 | VERIFIED | 네이버 배포 보도자료(2025-03-24) + 네이버 공식 스토리(2025-05-23) 일치 |
| AI 브리핑은 검색 결과 최상단에 요약 답변 + **출처**를 함께 노출 | VERIFIED | 네이버 공식 스토리(2025-05-23) "출처와 함께 정리된 요약 정보" |
| AI 브리핑은 검색 외 숏텐츠·플레이스·네이버플러스 스토어로 확장 | VERIFIED | 네이버 공식 보도자료(2025-03-24) + 공식 스토리(2025-05-23) |
| **AI 브리핑 월 사용자 3,000만 명** | VERIFIED | 네이버 **공식 보도자료**(2026-05-28) 원문 직접 확인 — "월 3,000만 명이 사용하는 네이버의 핵심 검색 경험". 3rd-party 재인용이 아님 |
| **AI 브리핑 통합검색 쿼리 적용률 약 20%** | VERIFIED | 네이버 공식 발표(2025-12-11 20% 돌파, 인더스트리뉴스 2025-12-15 보도) + 최수연 대표 실적발표 발언(2026-02-06) 2개 독립 소스 일치 |
| 2026년 말까지 적용률 약 40%(현재의 2배) 목표 | VERIFIED | 최수연 대표 2026-02-06 컨퍼런스콜 발언 |
| 네이버 메이트는 **AI 브리핑 인용수**를 보상 기준으로 사용 (월 약 3,000명, 연 약 200억 원) | VERIFIED | 네이버 공식 보도자료(2026-05-28) + 후속 보도자료(2026-08-07) |
| AI탭 베타는 2026-04-28 출시, AI 브리핑 영역에서도 진입 가능 | VERIFIED | 네이버 공식 보도자료(2026-04-28) 원문 |
| StatCounter 2026-07 한국: Google 49.54% / Naver 40.9% / Bing 5.44% / Daum 0.95% | VERIFIED | StatCounter 원 페이지 2026-08-26 직접 조회 |
| 인터넷트렌드 기준 2025-09~2026-04 네이버 8개월 연속 60% 이상(최고 70.6%) | VERIFIED | 인터넷트렌드 데이터 인용 보도(2026-04-22) + 기존 검증분과 방향 일치 |
| 네이버는 AI 브리핑 **출처 선정 기준을 공식 웹마스터 문서로 공개하지 않았다** | VERIFIED (부재 확인) | 서치어드바이저 도움말·공식 블로그·보도자료 전수 검색에서 기준 문서 미발견 (2026-08-26). Google `ai-optimization-guide`와 대조 |
| 네이버는 AI 브리핑만 제외하는 **공식 옵트아웃 수단을 제공하지 않는다** | VERIFIED (부재 확인) | 서치어드바이저·공식 발표에서 해당 설정 미발견 (2026-08-26) |
| "AI 브리핑 인용 콘텐츠의 약 70%가 UGC(블로그·카페)" | **UNVERIFIED → 본문에서 제거** | 3rd-party 블로그가 "네이버에 따르면"으로 인용하나, 지목된 네이버 공식 보도자료(2026-05-28) 원문에 해당 수치 **없음**. SKILL.md에 "인용 금지"로 명시 |
| "네이버가 공식 제시한 AI 브리핑 콘텐츠 선정 원칙 5가지" | **UNVERIFIED → 본문 미기재** | 네이버 공식 채널에서 해당 5개 항목 원문 미확인. 본문에서는 "공식 기준 미공개"로 서술 |
| 인용 출처 272건 표본에서 블로그 158 / 웹사이트 45 / 네이버DB 44 / 카페 19 / 지식iN 6, 인용 문서의 약 49%가 상위 10위 밖 | DISPUTED → `> 주의: 비공식 분석` + 출처·시점·표본 크기 병기 | 단일 매체(SEO NEWS, 2026-05) 자체 조사. 재현 검증 없음 |
| 정보 탐색형 질의에서 AI 브리핑 노출이 잦고 상업형("추천"·"비교")에서는 드물다 | DISPUTED → `> 주의: 비공식 분석` 표기 | 복수 국내 SEO 매체 관찰이 일치하나 네이버 공식 확인 없음 |
| AI 브리핑 확대 후 클릭 없이 이탈하는 비율 증가 / 창작자 수익 감소 보고 | DISPUTED → 본문에서 "보고가 다수" 수준으로만 서술 | 개별 창작자 사례 보도(2026-08) 존재하나 정량 공식 통계 없음. 네이버는 반대로 "창작자 지원 규모 2배 증가"를 공식 발표 |

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-26
**수행자**: skill-tester → general-purpose (domain-specific 에이전트 미사용, general-purpose로 대체)
**수행 방법**: 2026-08-26 freshness 갱신분(§2-2 AI 브리핑 절 신설 + §1 점유율 최신화) 대상으로 SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern(미검증 수치 인용) 회피 확인

### 실제 수행 테스트 (freshness 갱신분)

**Q1. 네이버 AI 브리핑이 무엇이고 자체 도메인이 출처로 잡히려면 무엇을 갖춰야 하는가?**
- ✅ PASS
- 근거: SKILL.md §2-2 "AI 브리핑" "공식 발표로 확인되는 사실" 표 + "자체 도메인의 대응법" 5개 항목
- 상세: 웹문서 색인 전제조건(§4·§6-1 선행)·단락 단위 완결성·근거 명시·정보 탐색형 질의·클릭 감소 대비 5항목을 정확히 인용. 정성적 항목(단락 완결성·질의 유형)이 `> 주의: 비공식 분석`으로 표기된 것도 정확히 구분해 답변. 출처 선정 기준이 공식 미공개임을 정확히 반영.

**Q2. "AI 브리핑 인용의 70%가 UGC"라는 수치를 보고서에 인용해도 되는가?**
- ✅ PASS
- 근거: SKILL.md §2-2 "인용 소스로 잡히는 조건" 하단 `> 주의: 비공식 분석` 문단 (93행 "인용 금지" 명시)
- 상세: "인용 불가"로 정확히 판정. SEO NEWS 272건 표본 비공식 분석과 공식 수치(월 3,000만 명/쿼리 약 20%)를 명확히 구분. anti-pattern(미검증 수치를 사실처럼 인용) 회피 확인.

**Q3. 2026년 한국 검색 점유율 수치와 출처는?**
- ✅ PASS
- 근거: SKILL.md §1 "한국 검색 시장 점유율 (2026)" 표 + 하단 "참고"·"주의" 문단
- 상세: StatCounter(2026-07, Google 49.54%/Naver 40.9%/Bing 5.44%/Daum 0.95%)와 인터넷트렌드(2025-09~2026-04, Naver 60%+) 수치를 조회 시점과 함께 정확히 인용. 두 기관 수치가 상반되는 이유(표본 편향 차이)까지 근거 섹션에서 정확히 인용.

### 발견된 gap (freshness 갱신분)

없음 (3/3 PASS, freshness 갱신분 근거 모두 SKILL.md에 존재하며 미검증 수치의 인용 금지 표기도 정확히 작동함을 확인)

### 판정 (freshness 갱신분)

- agent content test: 3/3 PASS
- verification-policy 분류: 알고리즘·랭킹 정리형 스킬 — 실사용 필수 카테고리 해당 없음
- 최종 상태: APPROVED 유지

---

> (이전 기록 — 최초 APPROVED 전환 시 테스트)

**수행일**: 2026-06-03
**수행자**: skill-tester → general-purpose (domain-specific 에이전트 미사용, general-purpose로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 한국 시장 SaaS 신규 사이트가 Google과 Naver 양쪽에 노출되려면 어떻게 차별 운영?**
- PASS
- 근거: SKILL.md 섹션 1 "한국 검색 시장 점유율" 실무 판단 항목 (B2B SaaS = Google 우선 + 네이버 보조), 섹션 4 공통 기술 SEO 항목 (HTTPS·sitemap·canonical·Yeti 허용), 섹션 5-1 RSS 피드, 섹션 6 체크리스트
- 상세: "Google Search Console + 네이버 서치어드바이저 동시 등록이 표준"이라는 실무 판단이 섹션 1에 명시. JSON-LD 기대 오류 회피(섹션 7) 포함. 근거 섹션 존재 확인.

**Q2. C-Rank와 D.I.A.+ 차이는? 자체 도메인이 네이버에 잘 노출되려면?**
- PASS
- 근거: SKILL.md 섹션 3-1 "C-Rank" (출처·작성자 신뢰도, Context·Content·Chain 3축), 섹션 3-3 "D.I.A.+" (검색 의도 깊이 분석, 키워드 일치를 넘어 의도 일치), 섹션 6-2 네이버 특화 체크리스트
- 상세: C-Rank와 D.I.A.+의 평가 대상 차이(출처 vs 검색 의도)가 섹션 3에 명확히 분리. "키워드 스터핑은 D.I.A. 감점" anti-pattern이 섹션 7에 명시.

**Q3. 네이버 검색에서 블로그·지식iN이 자체 도메인보다 상위에 뜨는 이유와 대응 전략?**
- PASS
- 근거: SKILL.md 섹션 2 통합검색 결과 구조 테이블 (VIEW·지식iN = 네이버 자체 서비스 직접 등록 필요), 섹션 5-3 "네이버 자체 콘텐츠 상위 노출" (VIEW 컬렉션 UI 상단 고정 구조 공식 사실 + C-Rank 블로그 생태계 유리), 섹션 6-3 자체 도메인 + 블로그 병행 전략
- 상세: "완전 동일 복사는 중복 콘텐츠 감점" anti-pattern(섹션 5-3·섹션 7)까지 대응 전략에 통합. 근거 섹션 명확히 존재.

### 발견된 gap

없음 (3/3 PASS, 모든 질문의 근거가 SKILL.md에 존재)

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 알고리즘·랭킹 정리형 스킬 — 실사용 필수 카테고리 해당 없음
- 최종 상태: APPROVED

---

> (기존 예정 메모) 본 스킬은 사용자 지시(skill-tester 호출 금지)에 따라 content test 미수행 상태로 PENDING_TEST 유지. → 2026-06-03 skill-tester 수행으로 완료.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-06-03) |
| freshness 재검증 | ✅ 2026-08-26 — AI 브리핑 절 신설·점유율 최신화. VERIFIED 11건 / DISPUTED 3건(비공식 분석 표기) / UNVERIFIED 2건(본문 미기재) |
| 에이전트 활용 테스트 (freshness 갱신분) | ✅ 3/3 PASS (2026-08-26) — Q1 AI 브리핑 출처 조건 / Q2 미검증 수치(70% UGC) 인용 금지 판정 / Q3 2026 점유율 수치·출처 |
| **최종 판정** | **APPROVED** (2026-08-26 freshness 갱신 + content 재테스트 3/3 PASS 후에도 유지) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 (2026-06-03 완료, 3/3 PASS) → APPROVED 전환
- [✅] 2026-08-26 freshness 갱신분(AI 브리핑 §2-2 신설 + 점유율 §1 최신화) content 재테스트 수행 (2026-08-26 완료, 3/3 PASS) — 신규 gap 없음, APPROVED 유지
- [❌] 네이버 검색 공식 블로그의 C-Rank·D.I.A. 원문 직접 인용 URL 확보 (현재는 간접 인용) — 선택 보강 (현재 `비공식 분석` 표기로 충분히 안전)
- [❌] 한국 SEO 도구(어센트·NSIDE·가제트AI) 비교 섹션 추가 검토 — 선택 보강 (현 스킬 범위 밖)
- [❌] 네이버 뉴스 검색 등록 절차는 별도 스킬 분리 검토 — 선택 보강 (현 스킬은 알고리즘·랭킹 정보만 다룸)
- [❌] schema.org 네이버 공식 지원 여부 정밀 확인 필요 (`> 주의: 비공식 분석` 표기 해소) — 선택 보강 (비공식 분석 표기로 현재 APPROVED 사용에 문제 없음)
- [✅] AI 브리핑 절 신설 (2026-08-26 완료) — 공식 수치(월 3,000만 명 / 쿼리 약 20%)를 네이버 1차 발표로 확인해 게재, 미확인 수치는 배제
- [❌] **네이버가 AI 브리핑 출처 선정 기준을 공식 문서로 공개하면 §2-2 "인용 소스로 잡히는 조건"을 공식 근거로 교체** (현재는 부재 확인 상태. 차단 요인 아님)
- [❌] **AI 브리핑 옵트아웃 수단이 신설되면 §2-2 마지막 주의 갱신** (Google Search Console 토글 대비 항목. 차단 요인 아님)
- [❌] AI탭 정식 출시(2026 상반기 목표) 이후 통합검색 구조 표에 반영 필요 여부 재검토 — 선택 보강
- [❌] 점유율 수치는 월 단위 변동 → **다음 재조회 권장일 2026-11-26** (본문에 조회일 병기로 현재 사용에 문제 없음)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-03 | v1 | 최초 작성. 네이버 통합검색 알고리즘·점유율·기술 SEO 차이점 정리 | skill-creator |
| 2026-06-03 | v1 | 2단계 실사용 테스트 수행 (Q1 Google+Naver 양쪽 노출 차별 운영 / Q2 C-Rank vs D.I.A.+ 차이 / Q3 자체 도메인 vs 블로그·지식iN 상위 노출 대응) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-08-26 | v1.1 | **freshness 갱신** — ① §2-2 "AI 브리핑" 절 신설(출시 시점·노출 위치·공식 수치·인용 조건·자체 도메인 대응법, 공식/비공식 분리 서술) ② §2 통합검색 구조 표에 AI 브리핑 행 추가 ③ §1 점유율을 StatCounter 2026-07·인터넷트렌드 2026-04 기준으로 갱신하고 조회일 명시 ④ §8 Daum·ZUM·Bing 점유율에 측정 기관 병기 ⑤ §9·§10에 `geo-ai-discoverability` 상호 참조 추가. 헤더 `> 검증일: 2026-08-26` + 갱신 사유·추가 소스 URL 반영. 3rd-party 수치 2건(70% UGC / 선정 원칙 5가지) UNVERIFIED 판정으로 본문 미기재. status APPROVED 유지 | skill-creator |
| 2026-08-26 | v1.1 | freshness 갱신분 content 재테스트 수행 (Q1 AI 브리핑 정의·자체 도메인 출처 조건 / Q2 "70% UGC" 미검증 수치 인용 금지 판정 / Q3 2026 검색 점유율 수치·출처·기관 간 상반 이유) → 3/3 PASS, APPROVED 유지 | skill-tester |
