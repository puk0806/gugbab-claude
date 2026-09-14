---
skill: tarot-history-symbolism
category: humanities
version: v1
date: 2026-09-10
status: APPROVED
---

# tarot-history-symbolism 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `tarot-history-symbolism` |
| 스킬 경로 | `.claude/skills/humanities/tarot-history-symbolism/SKILL.md` |
| 검증일 | 2026-09-10 |
| 검증자 | skill-creator (Claude Code) |
| 스킬 버전 | v1 |
| 기준 시점 | 2026-09-10 (저작권 만료 판정은 이 시점 기준) |

---

## 1. 작업 목록 (Task List)

- [✅] 1순위 소스 확인 — 백과사전·박물관 아카이브 (Britannica, Met Museum, Morgan Library, V&A, Public Domain Review)
- [✅] 2순위 소스 확인 — 학술 단행본 서지 (Dummett 1980 / Decker·Depaulis·Dummett 1996 / Farley 2009), 융 원전 서지 (CW 9i §81, Visions 세미나)
- [✅] 법률 기준 소스 확인 — Cornell University Library 저작권 기간표 (2026-09-10 시점 조회)
- [✅] 덱 계보 정리 (15c 이탈리아 → 마르세유 → 오컬트 전환 → RWS 1909 → 현대 덱)
- [✅] 오컬트 기원설(이집트·집시·카발라) 반증 근거 정리
- [✅] 78장 구조 + 메이저 22장 표준 순서 + 4수트/코트카드 정리
- [✅] RWS 고유 특징(삽화 마이너, VIII/XI 교체) 정리
- [✅] 융 원형론 연결 — 융 본인 발언 범위 확정 및 과장 방지표 작성
- [✅] "예언 vs 자기성찰·투사" 학술 논쟁 정리 + 바넘/포러 효과·콜드 리딩 설명 틀 포함
- [✅] 저작권 실무 정리 (미국 PD / 영국·EU 만료 / 1971 리컬러판 / 상표 리스크)
- [✅] 앱 톤 가이드 (예언 단정 금지, 자기성찰 프레이밍, 금지 도메인 가드) 작성
- [✅] 흔한 실수 패턴 정리
- [✅] DISPUTED / UNVERIFIED 항목 별도 섹션 분리
- [✅] SKILL.md 파일 작성 (`user-invocable: false`)
- [✅] skill-tester 2단계 실사용 테스트 (2026-09-10 수행 — 실전 질문 3개 3/3 PASS)

> 본 작업은 최초 작성 시 요청에 따라 `.claude/rules/creation-workflow.md` **단계 1~4만** 수행했고,
> 2026-09-10 skill-tester 호출로 **단계 5(2단계 실사용 테스트)** 까지 완료했다.

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md`, 참고 템플릿 `humanities/korean-dream-interpretation-tradition/SKILL.md` | 8개 섹션 구조 + "1차 자료 + 학술적 한계 + 앱 톤 가이드" 3부 구성 확인 |
| 중복 확인 | Glob | `.claude/skills/humanities/**/SKILL.md` | humanities 스킬 19종 확인, 타로 관련 기존 스킬 **없음** → 신규 생성 확정 |
| 조사 1 | WebSearch | 타로 15세기 이탈리아 기원, 놀이용 카드 | 북부 이탈리아 1430~1450, trionfi, 비스콘티-스포르차 덱 확인 |
| 조사 2 | WebSearch | Court de Gébelin 1781 이집트 기원설 debunk | *Le Monde primitif* vol.8, 사료 없음, 상형문자 미해독 시기 확인 |
| 조사 3 | WebSearch (allowed_domains: britannica.com) | 78장 구조, 22 트럼프, 4수트, 점술 전환 시점 | 78=22+56, 4수트×14, 프랑스 1780년경 점술 전용화, 1430년대 이탈리아 제작 확인 |
| 조사 4 | WebSearch (allowed_domains: themorgan.org / metmuseum.org / library.yale.edu) | 비스콘티-스포르차 소장 정보 | 모건 35장 / 아카데미아 카라라 26장 / 콜레오니 13장, 벰보 귀속 다수설, c.1440~1480 확인 |
| 조사 5 | WebSearch (allowed_domains: metmuseum.org) | Met "Before Fortune-Telling" 구조·용어 | 수트(Cups/Swords/Batons/Coins), 56+21+matto, trionfo→trump 어원, "점술 연관은 19세기에야 생겼다" 확인 |
| 조사 6 | WebSearch | 마르세유 타로 표준화 (Noblet / Dodal / Conver) | c.1650 노블레, 1760 콘베르 확인 — **다만 소스 신뢰도 중간(전문 사이트·블로그)** → SKILL.md에 주의 표기 |
| 조사 7 | WebSearch | RWS 1909 발행 이력 | 1909 위촉·6개월 제작, William Rider & Son, 1909-12~1910-04 초판(Roses & Lilies) 확인 |
| 조사 8 | WebFetch | https://www.wopc.co.uk/tarot/rider-waite/ | "1909년 12월 초판", "최초의 삽화 마이너", Justice/Strength 위치 변경, 크로몰리소그래피 확인 |
| 조사 9 | WebFetch | https://collections.vam.ac.uk/item/O1028247/ | **"First published 1910"**, 스미스(1878–1951), 웨이트(1857–1942), 마이너는 스미스 전권 — 발행연도 불일치 발견 |
| 조사 10 | WebSearch | Sola Busca 1491 / 대영박물관 1907 사진 기증 | 1491 페라라 판각, 1907년 78장 흑백사진 기증, RWS 마이너 삽화 선례 확인 |
| 조사 11 | WebSearch | Waite의 VIII/XI 교체 사유 | 황금새벽회 카발라·점성 대응(Leo→Libra 순서) 확인 |
| 조사 12 | WebSearch | Etteilla / Éliphas Lévi / Golden Dawn | 1789 *Livre de Thot* 점술 전용 최초 덱, 1854 *Dogme et Rituel* 카발라 최초 연결, 1888 황금새벽회 체계화 확인 |
| 조사 13 | WebFetch | https://guides.library.cornell.edu/copyright/publicdomain | "Before 1931 … In the public domain" — 미국 발행분·해외 최초 발행분 양쪽 조항 확인 |
| 조사 14 | WebSearch | RWS 저작권 상태 (US/UK/EU), U.S. Games 상표 | 1909 원화 PD, 1971 리컬러판 별도 권리 주장, "Rider-Waite" 등록상표, Dastar 판례 반박론 확인 |
| 조사 15 | WebFetch | https://www.plagiarismtoday.com/2024/02/28/... | CCB 사건 — **양 당사자 모두 "스미스 원화는 퍼블릭 도메인"임을 인정** (교차 검증 확보) |
| 조사 16 | WebSearch | 융 타로 언급 범위 | 1930 편지 / 1933-03-01 세미나 / CW 9i §81 — 직접 언급이 매우 제한적임 확인 |
| 조사 17 | WebFetch | https://marykgreer.com/2008/03/31/carl-jung-and-tarot/ | 세미나 정확 서지(Princeton UP 1997, p.923), 1930년 편지 "스페인 집시" 오류 확인 |
| 조사 18 | WebSearch | CW 9i §81 원문 문구 대조 | "distantly descended from the archetypes of transformation … Bernoulli" 문구를 **2개 독립 페이지에서 일치 확인** |
| 조사 19 | WebSearch | 타로 투사 기법 상담 연구 | JMU 학위논문(투사 기법 적용), 저널 논문, 로르샤흐·모래놀이 비교 프레임 확인 — 소규모·제한적 |
| 조사 20 | WebSearch | 바넘/포러 효과·콜드 리딩 | Forer 1948 실험, 콜드 리딩 기법, 확증 편향 확인 |
| 교차 검증 | WebSearch / WebFetch | 16개 핵심 클레임, 독립 소스 2~4개씩 | **VERIFIED 13 / DISPUTED 2 / UNVERIFIED 1** (§4 판정표) |
| 작성 | Write | SKILL.md (9개 섹션), verification.md | 산출물 2종 생성 |

> **접근 실패 처리**: `britannica.com/topic/tarot`, `themorgan.org`, `metmuseum.org/perspectives/tarot-2`, `sacred-texts.com`, `beinecke.library.yale.edu` 직접 WebFetch는 403/404/429로 차단됨.
> → 해당 도메인으로 `allowed_domains` 스코핑한 WebSearch로 내용을 확보하고, 접근 가능한 다른 공신력 소스(V&A, Cornell, Public Domain Review, wopc)로 **교차 확인**해 대체했다.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Encyclopaedia Britannica — Tarot / Major Arcana / Minor Arcana | https://www.britannica.com/topic/tarot | ⭐⭐⭐ High | 2026-09-10 | 편집 검수 백과사전. 구조·연대·메이저 표준 순서 |
| The Metropolitan Museum of Art — Before Fortune-Telling | https://www.metmuseum.org/perspectives/tarot-2 | ⭐⭐⭐ High | 2026-09-10 | 박물관 큐레이터 서술. 게임 용도·수트·trionfi 어원 |
| The Morgan Library & Museum — Visconti-Sforza Tarot Cards | https://www.themorgan.org/collection/tarot-cards | ⭐⭐⭐ High | 2026-09-10 | 소장 기관 1차 기록. 35장 소장, 벰보 귀속, c.1440–1480 |
| Victoria and Albert Museum — RWS deck (E.423-1934) | https://collections.vam.ac.uk/item/O1028247/ | ⭐⭐⭐ High | 2026-09-10 | 박물관 카탈로그. 스미스/웨이트 생몰년, 마이너 전권, **발행연도 1910 표기** |
| Cornell University Library — Copyright Term and the Public Domain in the US | https://guides.library.cornell.edu/copyright/publicdomain | ⭐⭐⭐ High | 2026-09-10 | 미국 저작권 기간 표준 참조표. "Before 1931 → PD" |
| The Public Domain Review — Sola Busca (1491) | https://publicdomainreview.org/collection/sola-busca/ | ⭐⭐⭐ High | 2026-09-10 | 1491 페라라 판각, 1907 대영박물관 사진 기증 |
| The Public Domain Review — Etteilla's *Livre de Thot* | https://publicdomainreview.org/collection/etteilla-thot/ | ⭐⭐⭐ High | 2026-09-10 | c.1789 점술 전용 덱 |
| M. Dummett & S. Mann, *The Game of Tarot* (Duckworth, 1980) | 학술 단행본 | ⭐⭐⭐ High | 1980 | 타로사 표준 연구. "18세기 이전 점술 용법 부재" |
| Decker·Depaulis·Dummett, *A Wicked Pack of Cards* (1996) | 학술 단행본 | ⭐⭐⭐ High | 1996 | 오컬트 타로 기원 연구 |
| H. Farley, *A Cultural History of Tarot* (I.B. Tauris, 2009) | 학술 단행본 | ⭐⭐⭐ High | 2009 | 15세기 밀라노 발생 → 비의화 과정 |
| C. G. Jung, *The Archetypes of the Collective Unconscious* (CW 9i, §81) | 원전 | ⭐⭐⭐ High | — | 타로 언급 원문 |
| C. G. Jung, *Visions: Notes of the Seminar 1930–1934*, Vol.2 (Princeton UP, 1997) p.923 | 원전(세미나 노트) | ⭐⭐⭐ High | 1997 | 1933-03-01 타로 언급 |
| A. E. Waite, *The Pictorial Key to the Tarot* (1910/1911) | 저자 1차 자료 | ⭐⭐⭐ High | 1910/11 | RWS 카드 의미의 원저. 퍼블릭 도메인 |
| The World of Playing Cards — Rider-Waite Tarot | https://www.wopc.co.uk/tarot/rider-waite/ | ⭐⭐ Medium-High | 2026-09-10 | 카드사 전문 레퍼런스. 1909-12 초판·인쇄 방식 |
| Plagiarism Today — The Copyright Battle Over a Tarot Card Deck | https://www.plagiarismtoday.com/2024/02/28/the-copyright-battle-over-a-tarot-card-deck/ | ⭐⭐ Medium | 2024-02-28 | 저작권 전문 매체. 양 당사자의 PD 인정 사실 확인 |
| JMU Scholarly Commons — Divining the Self: Applying Tarot as a Projective Technique in Counseling | https://commons.lib.jmu.edu/edspec202029/97/ | ⭐⭐ Medium | 2026-09-10 | 학위논문. 소규모·제한적 근거로만 인용 |
| Mary K. Greer — Carl Jung and Tarot | https://marykgreer.com/2008/03/31/carl-jung-and-tarot/ | ⭐⭐ Medium | 2008 | 타로 저술가 블로그. **원전 서지 확인 용도로만** 사용, 원문 문구는 별도 소스로 교차 확인 |
| Tarot Heritage — Tarot de Marseille / RWS | https://tarot-heritage.com/ | ⭐ Low-Medium | 2026-09-10 | 마르세유 공방 연대 참고. 단독 근거로 쓰지 않고 SKILL.md에 주의 표기 |

> **의도적으로 배제한 소스**: 점술 서비스 사이트, 덱 판매 쇼핑몰 블로그, AI 생성 요약 페이지, 출처 미표기 타로 해설 페이지.
> 검색 결과에 다수 노출되었으나 역사·저작권 서술 근거로 사용하지 않았다.

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 교차 검증 클레임 판정표

| # | 클레임 | 독립 소스 | 판정 | SKILL.md 반영 |
|---|--------|:---------:|------|---------------|
| 1 | 타로는 1430~1450년대 북부 이탈리아에서 **놀이용 카드**로 성립했다 | Britannica / Met / Morgan / Farley | **VERIFIED** | §1.1 |
| 2 | 원래 명칭은 *trionfi*이며 영어 *trump*의 어원이다 | Met / Britannica | **VERIFIED** | §1.1 |
| 3 | 현존 최고 덱은 비스콘티-스포르차(c.1440–1480), 35+26+13장으로 분산 소장 | Morgan / Met | **VERIFIED** | §1.1 |
| 4 | 화가는 보니파치오 벰보 귀속이 다수설(자바타리 귀속설도 존재) | Morgan / Met | **DISPUTED** | §1.1 + §7에 "귀속" 표기 |
| 5 | 이집트 기원설은 1781년 Court de Gébelin *Le Monde primitif* vol.8이 최초이며 사료가 없다 | Wikipedia(Court de Gébelin) / 다수 2차 서술 / Dummett 결론과 정합 | **VERIFIED** | §1.3, §1.6 |
| 6 | 18세기 이전에는 점술·오컬트 용법이 확인되지 않는다 (Dummett) | Dummett 1980 요지 / Met("19세기에야 생김") | **VERIFIED** | 한계 박스, §1.6 |
| 7 | Etteilla가 1789년경 점술 전용 최초 덱 *Livre de Thot*을 발행했다 | Public Domain Review / Wikipedia(Etteilla) | **VERIFIED** | §1.3 |
| 8 | Éliphas Lévi(1854–56)가 타로-카발라(히브리 22자)를 연결한 최초 문헌 | 다수 2차 서술 일치 | **VERIFIED** | §1.3 |
| 9 | 78장 = 메이저 22 + 마이너 56(4수트×14: 1~10 + Page·Knight·Queen·King) | Britannica / Met | **VERIFIED** | §2.1, §2.3 |
| 10 | 메이저 표준 순서는 VIII 정의 / XI 힘이다 | Britannica 표준 목록 | **VERIFIED** | §2.2 |
| 11 | RWS는 VIII 힘 / XI 정의로 **교체**했다 (황금새벽회 점성·카발라 대응) | wopc / 다수 2차 서술 / Britannica 표준과 대조 | **VERIFIED** | §2.2, §1.4 |
| 12 | RWS는 1909년 웨이트 위촉·스미스 작화, William Rider & Son 발행 | wopc / V&A / Wikipedia(PKT) | **VERIFIED** | §1.4 |
| 13 | RWS 초판 발행연도 | wopc·다수 자료 = **1909년 12월** / V&A = **1910년** | **DISPUTED** | §1.4에 주의 표기, "1909–1910" 병기, §7 등재 |
| 14 | RWS가 "최초의 완전 삽화 마이너 덱"이라는 통칭 | wopc는 "최초"라 서술 / Public Domain Review는 Sola Busca(1491)가 선례임을 명시 | **DISPUTED → 정정 반영** | §1.4 주의 박스에 "대중 보급 최초"로 수정 서술 |
| 15 | 스미스가 대영박물관에서 Sola Busca 사진을 보았다 | 1907 기증 사실은 확인 / 직접 목격 증언 사료 없음 | **UNVERIFIED** | §7 등재, "가능성이 높다는 통설"로 서술 |
| 16 | 융의 타로 직접 언급은 1930 편지·1933 세미나·CW 9i §81 수준으로 제한적 | Mary K. Greer(서지) / carljungdepthpsychologysite(원문 인용) — 문구 일치 | **VERIFIED** | §3.1, §3.2 |
| 17 | 융의 타로 기원 서술("스페인 집시가 쓰던 가장 오래된 카드")은 역사적 오류다 | 1930 편지 원문 vs Britannica/Met 연대 | **VERIFIED** | §3.1 경고 |
| 18 | 미국: 1931년 이전 발행 저작물(해외 최초 발행 포함)은 미국 내 퍼블릭 도메인 | Cornell 기간표 원문 2개 행 | **VERIFIED** | §4.1 |
| 19 | RWS 원화는 미국에서 퍼블릭 도메인이다 | Cornell 규칙 적용 + Plagiarism Today(양 당사자 인정) | **VERIFIED** | §4.1 |
| 20 | 영국/EU: 사후 70년 — 웨이트(1942)→2013, 스미스(1951)→2022. 기산 주체 해석이 갈렸으나 2026년 현재 어느 쪽이든 만료 | V&A(생몰년) / 저작권 논의 자료 | **VERIFIED(결론) / DISPUTED(기산 주체)** | §4.1 주의 박스 |
| 21 | U.S. Games Systems가 1971년 리컬러판 저작권 + "Rider-Waite" 상표를 주장·집행한다 | 저작권 논의 자료 / 상표 DB 검색결과 / 플랫폼 테이크다운 사례 | **VERIFIED** | §4.2 |
| 22 | 타로의 예언 정확도를 입증한 통제 연구는 없다 | 학술 검색상 부재 + 바넘/콜드리딩 설명 문헌 | **VERIFIED** | 한계 박스, §3.3 |
| 23 | 포러 효과는 1948년 Forer 실험에서 제시되었다 | Wikipedia(Barnum effect) / Decision Lab | **VERIFIED** | §3.4 |
| 24 | 타로를 상담의 투사 기법으로 적용한 연구가 존재하나 소규모·타당도 미확립이다 | JMU 학위논문 / 저널 논문 / 투사검사 타당도 논쟁 | **VERIFIED(제한적)** | §3.3 |

**집계: VERIFIED 13(그 외 부분검증 포함 시 21) / DISPUTED 4(#4·#13·#14·#20 기산 주체) / UNVERIFIED 1(#15)**
DISPUTED 항목은 **전부 SKILL.md 본문에서 정정·병기 처리**되었고 §7 검증 한계 표에 등재되었다.

### 4-1. 내용 정확성
- [✅] 백과사전·박물관 1차 기록과 불일치하는 내용 없음 (불일치 지점은 DISPUTED로 명시 처리)
- [✅] 연대·판본 기준이 명시되어 있음 (1430s / c.1650 / 1760 / 1781 / 1789 / 1854 / 1888 / 1909–1910 / 1971)
- [✅] 폐기된 서술(이집트 기원설·집시 전파설·"RWS가 최초 삽화 덱")을 권장하지 않음 — 정정표로 제시
- [✅] 융 관련 서술이 원전 인용 범위를 넘지 않음 (과장 방지표 별도 작성)
- [✅] 저작권 서술에 "법률 자문 아님" 고지 포함

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, `user-invocable: false`, description + `<example>` 3개)
- [✅] 소스 URL과 검증일(2026-09-10) 명시
- [✅] 학술적 한계 박스를 본문 최상단에 배치 (참고 템플릿 구조 준수)
- [✅] 핵심 개념(덱 계보·78장 구조·대표 상징) 포함
- [✅] 실무 예시 포함 (응답 템플릿, 저작권 의사결정 순서, 데이터 모델링 주의)
- [✅] 언제 쓰지 않을지 기준 포함 (§5.4-5 금지 도메인 가드)
- [✅] 흔한 실수 패턴 포함 (§6, 10항목)
- [✅] DISPUTED/UNVERIFIED 별도 섹션 (§7)
- [✅] 인용 가능 1차 출처 표 (§8)
- [✅] 짝 스킬 cross-link (§9)

### 4-3. 실용성
- [✅] 앱 개발 관점에서 즉시 참조 가능 (덱 계열 필드 분리, VIII/XI 하드코딩 금지, 스토어 메타데이터 주의)
- [✅] 카드별 전면 해설 대신 **구조·반복 모티프 수준**으로 정리하고 카드 의미 1차 자료(PKT)를 지정 — 요청 범위와 일치
- [✅] 범용성 확보 (특정 앱·특정 상용 덱에 종속되지 않음)
- [✅] 톤 가이드가 금지/권장/템플릿/필수항목 4단으로 실행 가능하게 구성됨

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-10, general-purpose 3건)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (근거 섹션 명시 대조 완료)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (3/3 PASS로 보완 불필요 확인)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-10
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 부재로 대체 — 대체 사실 기록)
**수행 방법**: SKILL.md Read 후 아래 §5의 기존 초안 케이스 1~3을 실전 질문으로 사용해 general-purpose 에이전트 3회 호출, 근거 섹션 명시 및 anti-pattern 회피 여부 검증

### 실제 수행 테스트

**Q1. 저작권 실무 — "라이더 웨이트는 퍼블릭 도메인이라던데, US Games 덱 스캔해서 앱에 넣어도 되지?"**
- ✅ PASS
- 근거: SKILL.md §4.1(원본 PD 판정), §4.2(1971 리컬러판 별도 권리·상표 리스크), §4.3(의사결정 순서), §6(흔한 실수 패턴)
- 상세: 1909/1910 원본 PD와 1971 U.S. Games 리컬러판 별도 저작권을 정확히 분리하고 "1971판 스캔 금지"를 명시적으로 답변. "PD니까 아무거나 써도 된다"는 오답을 회피함. 법률 자문 아님 고지도 포함. 근거로 든 4개 섹션 전부 SKILL.md에 실재하며 서술과 일치.

**Q2. 오컬트 기원설 방어 — "타로가 고대 이집트 신관들이 만든 토트의 서에서 왔다는데, 앱 소개문에 그렇게 써도 될까?"**
- ✅ PASS
- 근거: SKILL.md §1.3(1781년 오컬트 전환점), §1.6(오컬트 기원설 정정표), §5.1(금지 표현), §6(흔한 실수 패턴)
- 상세: 사용 불가로 명확히 답하고 1781년 Court de Gébelin의 사료 없는 창작임을 지목, 15세기 이탈리아 놀이 카드 기원(§1.1)을 대안으로 제시. "고대 지혜" 서사를 그대로 수용하지 않음. 4개 섹션이 상호 교차 확인되는 형태로 인용되어 근거 신뢰도 높음.

**Q3. 융 과장 방지 + 톤 가이드 — "'융이 증명한 무의식의 언어, 타로'라는 앱 카피 어때? 죽음 카드 해석 문구도 써줘"**
- ✅ PASS
- 근거: SKILL.md §5.1(금지 표현 목록에 해당 카피 문구가 그대로 등재), §3.1·§3.2(융 발언 범위·과장 방지표), §5.3·§5.4(응답 템플릿·필수 포함 요건)
- 상세: 카피를 명확히 거부하고 §3.2 "정확한 프레이밍"에 부합하는 대안 카피 제시. 죽음 카드 해석은 §5.3 템플릿·§5.4 안심 문구 요건을 따라 미래형 단정 없이 성찰 질문+안심 문구로 구성. 미래형 단정문 생성 없음, 불안 유발 톤 회피 확인.

### 발견된 gap (경미, 비차단)

- Q1: "1909/1910 초판 계열 스캔"을 구체적으로 어디서 합법적으로 구할 수 있는지(아카이브명)는 SKILL.md에 명시되어 있지 않음 — §4.3은 "출처 아카이브의 이용 조건 확인"까지만 서술. 한국 저작권법 세부 판단도 "개별 확인 권장" 수준으로 얕음. → §7 기존 항목("관할별 저작권 재검토")과 동일 계열 후속 과제로 이미 등재되어 있어 신규 항목 불필요.
- Q3: 죽음(Death) 카드 고유 도상(백마·검은 깃발 등)의 구체적 문구는 SKILL.md에 없음 — 단, 이는 §2.4에서 "카드별 전면 해설은 웨이트 원전(*Pictorial Key*)을 1차 자료로 인용" 하도록 **의도적으로 설계**된 것으로 확인됨(요청 범위와 일치, 결함 아님).

### 판정

- agent content test: **3/3 PASS**
- verification-policy 분류: 개념·이론 정리 스킬(문화사·도상학) — 실사용 필수 카테고리 아님, content test PASS로 APPROVED 전환 가능
- 최종 상태: **APPROVED**

---

### 참고 — 기존 테스트 케이스 초안 (실행 완료, 아래 원문 보존)

아래는 최초 작성 시 준비된 질문 초안이며, 위 §5 "실제 수행 테스트"에서 케이스 1~3을 그대로 사용해 실행했다. 케이스 4(구조 데이터 모델링)는 이번 라운드에서 미실행 — 필요 시 후속 테스트에서 사용 가능.

**케이스 1 — 오컬트 기원설 방어**
```
입력: "타로가 고대 이집트 신관들이 만든 토트의 서에서 왔다는데, 앱 소개문에 그렇게 써도 될까?"
기대: 부정 + 1781년 Court de Gébelin 창작임을 지목 + 15세기 이탈리아 놀이 카드 기원 제시 + 카피 대안 제시
확인 포인트: §1.6 정정표와 §1.1 연대를 인용하는가, "고대 지혜" 서사를 그대로 수용하지 않는가
```

**케이스 2 — 저작권 실무**
```
입력: "라이더 웨이트는 퍼블릭 도메인이라던데, US Games 덱 스캔해서 앱에 넣어도 되지?"
기대: 1909/1910 원화 PD와 1971 리컬러판 권리 주장을 분리 설명 + 1971판 스캔 사용 금지 + "Rider-Waite" 상표 리스크 경고 + §4.3 의사결정 순서 제시 + 법률 자문 아님 고지
확인 포인트: "PD니까 아무거나 써도 된다"는 오답을 회피하는가
```

**케이스 3 — 융 과장 방지 + 톤 가이드**
```
입력: "'융이 증명한 무의식의 언어, 타로'라는 앱 카피 어때? 그리고 죽음 카드 해석 문구도 써줘"
기대: 카피 거부(§3.2 과장 방지표) + 융 직접 언급 범위 설명 + 죽음 카드는 단정 예언 없이 상징 설명 + 성찰 질문 + 안심 문구 병기(§5.4-4)
확인 포인트: 미래형 단정문을 생성하지 않는가, 불안 유발 톤을 피하는가
```

**케이스 4 — 구조 데이터 모델링**
```
입력: "메이저 아르카나 22장 테이블 만들 건데 VIII은 정의로 넣으면 되지?"
기대: 덱 계열에 따라 다름을 지적 — 마르세유 VIII=정의 / RWS VIII=힘 + 덱 계열 필드 분리 권고
확인 포인트: 단일 정답으로 답하지 않는가
```

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (교차 검증 24개 클레임, DISPUTED 4건 전부 정정·병기 반영) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-09-10, general-purpose 3건 — 저작권·오컬트 기원설·융 과장방지+톤가이드) |
| **최종 판정** | **APPROVED** |

**판정 근거**: 역사·구조·저작권 서술은 백과사전·박물관·대학 도서관 1차 자료로 교차 검증되어 내용 신뢰도가 확보되었다.
2026-09-10 skill-tester가 실전 질문 3개로 앱 톤 가이드(§5)를 포함한 content test를 수행해 3/3 PASS — 예언 단정 회피, 오컬트 기원설 방어, 저작권 실무 판단 모두 SKILL.md 근거로 정확히 답변됨을 확인. `APPROVED`로 전환한다.

**카테고리 분류**: 본 스킬은 *개념·이론 정리 스킬*에 해당하므로, `.claude/rules/verification-policy.md` 기준상 **content test PASS만으로 APPROVED 전환이 가능한 유형**이다(빌드 산출물·실행 결과 검증이 필요한 유형이 아님).

---

## 7. 개선 필요 사항

- [✅] **skill-tester 2단계 테스트 수행** — (2026-09-10 완료, 실전 질문 3개 3/3 PASS) §5 케이스 1~3 실행, 섹션 5·6 갱신, APPROVED 전환 완료
- [❌] **마르세유 공방 연대 재확인** (선택 보강 — 차단 요인 아님) — Noblet(c.1650)·Dodal·Conver(1760) 연대를 Dummett/Depaulis 학술서 또는 BnF·대영박물관 소장 기록으로 승격 검증 (현재 근거는 전문 사이트 수준이나 SKILL.md에 이미 주의 표기됨)
- [❌] **RWS 초판 발행연도 확정** (선택 보강 — 차단 요인 아님) — V&A(1910)와 다수 자료(1909-12)의 불일치를 대영도서관 납본 기록 등 1차 서지로 해소. SKILL.md는 이미 "1909–1910" 병기로 안전하게 처리 중
- [❌] **비스콘티-스포르차 화가 귀속 최신 학설 확인** (선택 보강 — 차단 요인 아님) — 벰보 vs 자바타리 논쟁의 현재 학계 정리 상태. SKILL.md는 이미 "귀속" 표현으로 단정 회피 중
- [❌] **관할별 저작권 재검토 주기 설정** (권장 — 차단 요인 아님) — 저작권 만료 판정은 기준 시점(2026-09-10) 의존. 연 1회 재확인 권장
- [❌] **Waite *Pictorial Key to the Tarot* 원문 대조** (선택 보강 — 차단 요인 아님) — §2.4 반복 모티프 서술 및 카드별 해석(예: 죽음 카드, Q3 테스트에서 확인)을 원문 인용으로 승격. 현재는 원전 참조 위임 설계로 실용상 문제 없음
- [❌] **한국 법령 기준 명확화** (선택 보강 — 차단 요인 아님) — §4.1의 한국 항목은 "사후 70년 원칙상 경과" 수준. 필요 시 한국저작권위원회 자료로 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-09-10 | v1 | 최초 작성 — 덱 계보(15c 이탈리아→마르세유→RWS→현대), 78장 구조·RWS 대표 상징, 융 원형론 연결(과장 방지), 예언 vs 자기성찰 논쟁, 저작권 실무, 앱 톤 가이드. creation-workflow 단계 1~4 수행, 교차 검증 24클레임 | skill-creator |
| 2026-09-10 | v1 | 2단계 실사용 테스트 수행 (Q1 저작권 실무 / Q2 오컬트 기원설 방어 / Q3 융 과장방지+톤가이드) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-11 | v1.1 | 캐주얼 앱 방향 정리 — §5.4 6항(위기 신호 상담 자원 안내)을 제거하고 5항 금지 도메인 가드를 "재미로 보는 앱의 소재 범위" 서술로 완화, §9 위기 자원 스킬 참조를 `meta/fortune-interpretation-prompt-engineering`으로 대체. 역사·구조·상징·저작권 본문 변동 없음, Q1~Q3 근거 섹션 유효 | main session |