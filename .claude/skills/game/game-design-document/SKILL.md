---
name: game-design-document
skill: game-design-document
version: 1.0.0
description: Unity 2D 모바일 캐주얼 게임용 GDD 작성 방법론 — Living Document 방식, 8개 필수 섹션, 핵심 게임루프 3단계(30초/3분/일일), 수익화 결정 트리, 소프트런치 전략
sources:
  - https://connect-prd-cdn.unity.com/20201215/83f3733d-3146-42de-8a69-f461d6662eb1/Game-Design-Document-Template.pdf
  - https://learn.unity.com/tutorial/fill-out-a-game-design-document
  - https://www.gamedeveloper.com/design/how-to-write-a-game-design-document
  - https://kevurugames.com/blog/how-to-write-a-game-design-document-gdd/
  - https://ludo.ai/blog/ultimate-guide-crafting-game-design-document-step-by-step-approach
  - https://www.gameanalytics.com/blog/how-to-perfect-your-games-core-loop
  - https://www.deconstructoroffun.com/blog//2013/10/mid-core-success-part-1-core-loops.html
  - https://gdevelop.io/blog/casual-game-loops
  - https://www.homagames.com/blog/what-is-a-core-loop-in-a-mobile-game
  - https://tenjin.com/blog/mobile-game-monetization-how-genre-impacts-growth/
  - https://airflux.ai/blog/8-monetization-trends-hyper-casual-games-2025
  - https://verve.com/blog/hybrid-monetization-in-casual-games-how-beresnev-strikes-the-right-balance/
  - https://mobilegamer.biz/the-soft-launch-games-you-need-to-know-about/
  - https://unity.com/releases/unity-6/support
  - https://unity.com/blog/unity-6-3-lts-is-now-available
verified: 2026-06-07
status: APPROVED
---

# Unity 2D 모바일 게임 기획서(GDD) 작성 방법론

> 소스: 본문 frontmatter `sources` 참조 (Unity 공식 GDD 템플릿, Unity Learn, Game Developer, Kevuru Games, Ludo.ai, GameAnalytics, Deconstructor of Fun, Tenjin, Airflux, Mobile Gamer Biz, Unity 6 LTS 공식 페이지)
> 검증일: 2026-06-07
> 적용 범위: Unity 2D 캐주얼·하이퍼캐주얼·하이브리드 캐주얼 모바일 게임 (iOS/Android)

---

## 0. 이 스킬이 다루는 것 / 다루지 않는 것

| 다룬다 | 다루지 않는다 |
|--------|---------------|
| 2024~2025 인디·스타트업 기준 Living GDD 작성법 | AAA 콘솔 게임용 100p+ 전통 GDD |
| Unity 공식 GDD 템플릿 + 모바일 특화 보강 섹션 | 게임 코드 구현 세부 (Unity 컴포넌트, C# 스크립트 등) |
| 30초 / 3분 / 일일 3계층 게임루프 설계 | 서버 인프라·매치메이킹 등 백엔드 아키텍처 |
| 광고·IAP 하이브리드 수익화 결정 트리 | 마케팅 캠페인·UA 입찰 전략 |
| 소프트런치 시장 선택과 KPI 게이트 | 스토어 ASO·크리에이티브 제작 |

---

## 1. GDD란 무엇인가 — Living Document 방식

GDD(Game Design Document)는 게임의 비전·메커닉·범위를 팀이 공유하기 위한 **살아있는 작업 문서**다. 2024~2025년 인디·모바일 업계 표준은 다음과 같다:

- **"Living docs and wikis are paramount; the classic literal document is very outdated"** ([Game Developer 기사](https://www.gamedeveloper.com/design/how-to-write-a-game-design-document))
- 100페이지짜리 한 번 작성하고 끝나는 "성경(bible)"이 아니라, **개발 내내 변경되는 cross-linked 위키**로 관리한다.
- 1인 인디·소규모 팀은 **콘셉트 1페이지 + 섹션별 짧은 문서** 조합이 권장된다 ([Kevuru Games](https://kevurugames.com/blog/how-to-write-a-game-design-document-gdd/)).
- GDD의 본질은 **팀 정렬(alignment)과 결정 근거 보존**이다. 완성도 높은 문서를 만드는 것이 목적이 아니다.

> 주의: 본 스킬은 모바일 캐주얼 게임에 최적화된 8개 섹션을 정의한다. AAA·내러티브 중심 게임은 스토리·캐릭터·세계관 섹션을 더 두텁게 작성해야 한다.

---

## 2. GDD 8개 필수 섹션 구조

Unity 공식 템플릿은 **Introduction / Gameplay / Art and Visuals / Development Timeline** 4개 섹션을 제공한다 ([Unity Learn](https://learn.unity.com/tutorial/fill-out-a-game-design-document)). 모바일 캐주얼 게임에서는 여기에 **게임루프·수익화·UI/UX·기술사양·출시 로드맵**을 보강한 8개 섹션 구조를 권장한다.

### 2.1 게임 개요 (Game Overview)

Unity 템플릿 Introduction 섹션을 모바일에 맞게 확장:

| 항목 | 내용 |
|------|------|
| 워킹 타이틀 | 임시 게임명 |
| 한 줄 설명(Logline) | "X 장르의 Y를 하는 게임" 형식 25자 이내 |
| 장르 | Casual / Hyper-Casual / Hybrid-Casual / Mid-Core 등 (Unity 템플릿 정의 사용) |
| 플랫폼 | iOS / Android, 최소 OS 버전, 세로/가로 |
| 타겟 오디언스 | 연령대·플레이어 유형(예: 25~45 라이트 게이머, 출퇴근 시간대) |
| 참고 게임(Benchmark) | 3~5개. 무엇을 참고했고 **무엇을 다르게 할지** 명시 |
| 디자인 필러(Design Pillars) | 모든 결정의 기준이 되는 3~5개 원칙 |

> 주의: "참고 게임"은 단순 모방 선언이 아니라 **차별점**까지 적어야 한다. 안티패턴: *"낚시는 Stardew Valley처럼"* — 어떻게 다른지 없는 카피 선언은 GDD의 의미를 잃는다 ([Game Developer](https://www.gamedeveloper.com/design/how-to-write-a-game-design-document)).

### 2.2 핵심 게임루프 (Core Gameplay Loop)

본 스킬 섹션 3 참조. **30초 Core Loop / 3분 Session Loop / 일일 Retention Loop** 3단계로 작성.

### 2.3 수익화 모델 (Monetization)

본 스킬 섹션 4 참조. 광고 3종 + IAP 4종 + 에너지 시스템 결정.

### 2.4 아트 방향성 (Art Direction)

Unity 템플릿 "Art and Visuals" 섹션 기반:

- **스타일**: 픽셀 / 로우폴리 / 플랫 일러스트 / 3D 렌더링 2D 등
- **색상 팔레트**: hex/RGB 명시 (Unity 템플릿이 요구하는 "Unifying colors")
- **무드보드**: 외부 레퍼런스 이미지 + 출처 크레딧
- **캐릭터·환경 아트**: 컨셉 스케치 (MS Paint 수준도 충분 — [Game Developer](https://www.gamedeveloper.com/design/how-to-write-a-game-design-document))
- **UI 톤**: 친근함/세련됨/유머 등 한 단어로

> 주의: 초기 단계에 과도하게 정교한 컨셉아트를 만드는 것은 안티패턴이다. 방향성 전달이 목표지 작품 제작이 아니다.

### 2.5 레벨 디자인 (Level Design)

- **난이도 곡선**: 레벨별 fail rate 목표 (예: 1~10 레벨 < 5%, 50레벨 ~30%, 100레벨 ~50%)
- **레벨 수**: 출시 시점 N개, 업데이트당 +M개
- **프로그레션 시스템**: 별점/스코어/언락 구조
- **튜토리얼**: 어디서 무엇을 가르치는지 레벨 단위로

### 2.6 UI/UX 플로우

- **화면 흐름도**: 스플래시 → 메인 → 게임 → 리절트 → 상점 등 노드 다이어그램
- **HUD 구성**: 인게임 화면 요소 배치 (스코어·재화·일시정지)
- **컨트롤 스킴**: 탭 / 스와이프 / 드래그 (Unity 템플릿 "Controls" 항목)
- **온보딩**: 1분 이내 완료, 텍스트 최소화 ([GameAnalytics](https://www.gameanalytics.com/blog/how-to-perfect-your-games-core-loop))

### 2.7 기술 사양 (Technical Spec)

| 항목 | 권장 |
|------|------|
| 엔진 | Unity 6.0 LTS 또는 Unity 6.3 LTS (LTS 2027-12까지 지원, [Unity 공식](https://unity.com/blog/unity-6-3-lts-is-now-available)) |
| 렌더 파이프라인 | URP(2D) 권장 — 모바일 성능·셰이더 그래프 활용 |
| 타겟 fps | 60fps (저사양 30fps fallback) |
| 빌드 사이즈 | iOS 200MB / Android APK 150MB 이하 권장 |
| 최소 OS | iOS 15+, Android 8.0(API 26)+ |
| SDK | Unity Ads / AdMob / IronSource 등 광고 미디에이션, Firebase Analytics, AppsFlyer/Adjust(어트리뷰션) |

> Unity 6.0 LTS는 2024-10-17 글로벌 출시, 2년 지원 ([Unity Investor Relations](https://investors.unity.com/news/news-details/2024/Unity-6-Will-Release-Globally-October-17-2024-Unity-Announces-at-Annual-Unite-Developer-Conference/default.aspx)). Unity 6.3 LTS는 6.0 LTS 이후 첫 LTS로 2027-12까지 지원.

### 2.8 출시 로드맵 (Release Roadmap)

5단계 마일스톤:

1. **프로토타입(Prototype)**: 핵심 30초 루프 1주~2주 검증. fun factor 확인.
2. **알파(Alpha)**: 모든 기능 골격. 외부 테스터 없이 내부 플레이.
3. **베타(Beta)**: 클로즈드 테스트(TestFlight·내부 트랙). D1·D7 리텐션 측정 시작.
4. **소프트런치(Soft Launch)**: 본 스킬 섹션 5 참조. 3~6개월간 KPI 게이트 통과까지 반복.
5. **글로벌 출시(Global Launch)**: 소프트런치 KPI 통과 후. UA 캠페인 동시 시작.

---

## 3. 핵심 게임루프 설계 패턴 — 30초 / 3분 / 일일

모바일 캐주얼 게임은 단일 루프가 아니라 **시간 스케일이 다른 루프를 중첩**해 설계한다 ([GameAnalytics](https://www.gameanalytics.com/blog/how-to-perfect-your-games-core-loop), [Deconstructor of Fun](https://www.deconstructoroffun.com/blog//2013/10/mid-core-success-part-1-core-loops.html)).

> 주의: "30초/3분/일일" 명명은 업계에서 흔히 쓰이는 **휴리스틱**이다. 단일 공식 표준이 아니라 Supercell·King 등 성공 사례를 일반화한 관행이다.

### 3.1 30초 Core Loop — 1세션 1회 반복 단위

플레이어가 게임을 켠 직후 **30~60초 안에 한 번 완결**되어야 하는 가장 작은 루프.

| 요소 | 정의 | 예 (Match-3) |
|------|------|-------------|
| Challenge | 극복할 과제 | 보드의 목표 블록 제거 |
| Action | 플레이어 행동 | 블록 스와이프 매치 |
| Reward | 즉시 보상 | 점수·콤보·사운드 피드백 |

**설계 규칙:**
- 첫 보상은 시작 후 30~60초 안에 ([MoldStud](https://moldstud.com/articles/p-best-practices-for-designing-engaging-core-gameplay-loops-in-mobile-games))
- 행동 1회는 10초 이하 권장
- 보상 빈도 30~90초당 1회 (소형 보상 포함)
- 텍스트 튜토리얼 없이 **암묵적으로** 학습 가능해야 함

### 3.2 3분 Session Loop — 1세션 단위

평균 모바일 캐주얼 세션은 3~5분 ([Deconstructor of Fun](https://www.deconstructoroffun.com/blog//2013/10/mid-core-success-part-1-core-loops.html)). 30초 코어 루프 여러 번 + 메타 진행이 합쳐진 단위.

**구조:**
```
앱 실행 → 메인 화면 → 일일보상 수령 → 레벨 N 진입
       → [30초 코어 루프 × 3~5회]
       → 레벨 완료 보상 → 다음 레벨 or 종료
```

**설계 규칙:**
- 한 세션 안에 **명확한 성취감 1개** (레벨 클리어, 캐릭터 언락 등)
- 10~15분 연속 플레이 시 큰 보상 1회 ([MoldStud](https://moldstud.com/articles/p-best-practices-for-designing-engaging-core-gameplay-loops-in-mobile-games))
- 세션 종료 시점에 "다음에 할 일" 명시 (다음 레벨 미리보기, 다음 보상 시간 등)

### 3.3 일일 Retention Loop — 24시간 단위

**D1·D7·D30 리텐션을 결정하는 가장 중요한 루프.** 플레이어가 다음 날 다시 돌아올 이유를 만든다.

**핵심 메커닉:**

| 메커닉 | 역할 | 예 |
|--------|------|-----|
| 일일 보상 캘린더 | "오늘 안 들어오면 손해" | 7일 연속 출석 시 캐릭터 1개 |
| 에너지/하트 시스템 | 시간이 지나야 자원 회복 | 30분당 하트 1개, 최대 5개 |
| 일일 미션 | 24시간 안에 끝낼 수 있는 과제 | "오늘 레벨 3개 클리어 시 코인 200" |
| 시즌·이벤트 | N일 한정 콘텐츠 | 주말 2배 보상 이벤트 |
| 푸시 알림 | 에너지 풀충전·미션 만료 알림 | "에너지가 가득 찼어요!" |

**설계 규칙:**
- 일일 보상은 **무료 플레이어도 매일 받을 가치**가 있어야 함
- 에너지 시스템은 **광고 시청 또는 IAP**로 즉시 회복할 수 있는 출구를 둬야 함 (수익화 연결)

---

## 4. 수익화 모델 결정 트리

### 4.1 광고 vs IAP vs 하이브리드

2025년 기준 모바일 캐주얼 시장은 **하이브리드 수익화**가 표준이다. 하이브리드는 ad-only 대비 **ARPU 약 28% 향상** ([Airflux](https://airflux.ai/blog/8-monetization-trends-hyper-casual-games-2025)).

```
[게임 장르 판단]
├─ 하이퍼캐주얼 (1탭, 1분 세션)
│   → 광고 90% / IAP 10% (No-Ads 제거권 위주)
│
├─ 캐주얼 (퍼즐, 시뮬레이션)
│   → 광고 60% / IAP 40% (재화·번들·시즌패스)
│
├─ 하이브리드 캐주얼 (캐주얼 + 메타진행)
│   → 광고 40% / IAP 60% (강한 메타 시스템)
│
└─ 미드코어 (전략, RPG)
    → IAP 80% / 광고 20% (보상형 위주, 강제 광고 최소)
```

출처: [Tenjin Genre × Monetization Report](https://tenjin.com/blog/mobile-game-monetization-how-genre-impacts-growth/)

### 4.2 광고 3종 + IAP 4종

**광고 포맷 3종:**

| 포맷 | 역할 | 권장 빈도 |
|------|------|-----------|
| 보상형(Rewarded Video) | 플레이어가 자발적 시청, 재화·부활·2배 보상 제공 | 완료율 80~90% ([Airflux](https://airflux.ai/blog/8-monetization-trends-hyper-casual-games-2025)) |
| 인터스티셜(Interstitial) | 레벨 사이 전면 광고 | 세션당 2~4회, Day 3 이후 |
| 배너(Banner) | 로비·결과 화면 하단 상시 노출 | 비침해 영역 한정 |

**IAP 4종:**

| 유형 | 예 |
|------|-----|
| 소모성 재화 | 코인 팩, 보석 팩 |
| 영구 해제 | No-Ads 제거권, 신규 캐릭터 |
| 구독 | VIP 패스(일일 보너스·광고 제거 묶음) |
| 시즌 패스(Battle Pass) | 30~60일 진행 보상 트랙 |

### 4.3 에너지 시스템 결정

| 도입해야 할 때 | 도입하지 말아야 할 때 |
|----------------|---------------------|
| 레벨 클리어 시 핵심 진행이 발생 | 무한 모드·엔드리스 러너 |
| 1회 플레이가 3~5분으로 완결 | 1회가 1분 이하 하이퍼캐주얼 |
| IAP 결제 동기로 활용 | 광고 단일 수익화 |

> 주의: 에너지 시스템은 강력한 수익화 도구지만 **부정적 UX**를 동반한다. 반드시 광고 시청 우회로를 두고, "오프라인 자동 회복 + IAP 즉시 충전" 듀얼 구조로 설계한다.

---

## 5. 소프트런치 전략

소프트런치는 **글로벌 출시 전 일부 국가에 한정 출시해 KPI를 검증**하는 단계다. 테스트 비용이 Tier 1 대비 낮으면서도 영어권 사용자 비율이 높아 글로벌 KPI 예측에 유용하다 ([Mobile Gamer Biz](https://mobilegamer.biz/the-soft-launch-games-you-need-to-know-about/)).

### 5.1 시장 선택 3단계

```
[1단계: 초기 소프트런치] — 비용 낮음, KPI 검증 위주
├─ 캐나다 — 영어권, 미국 대비 CPI 50%
├─ 필리핀 — 모바일 게임 활성 사용자 6,770만(인구 60%)
└─ 인도네시아 — Android 점유율 높음, 대규모 사용자 검증

[2단계: 영어권 확장] — 글로벌 KPI 근사
├─ 호주
└─ 뉴질랜드

[3단계: 글로벌 출시]
└─ 미국·일본·EU·한국 동시
```

출처: [Mobile Gamer Biz](https://mobilegamer.biz/the-soft-launch-games-you-need-to-know-about/), [Antom Philippines Report](https://knowledge.antom.com/philippines-gaming-payment-trends-report-active-value-driven-players-power-growth-as-digital-wallets-take-centre-stage)

### 5.2 단계별 KPI 게이트

다음 KPI를 통과해야 다음 단계로 진행한다 (캐주얼 장르 기준 일반적 임계값):

| KPI | 1단계 통과 기준 | 2단계 통과 기준 |
|-----|---------------|---------------|
| D1 리텐션 | 35% 이상 | 40% 이상 |
| D7 리텐션 | 12% 이상 | 18% 이상 |
| D30 리텐션 | 4% 이상 | 6% 이상 |
| ARPDAU | $0.05 이상 | $0.10 이상 |
| 세션 길이 | 3분 이상 | 4분 이상 |
| 크래시 프리율 | 99% 이상 | 99.5% 이상 |

> 주의: 위 수치는 캐주얼 평균 벤치마크다. 장르·국가별로 편차가 크므로 자사 데이터와 [GameAnalytics](https://www.gameanalytics.com/blog/how-to-perfect-your-games-core-loop), AppsFlyer 등의 최신 벤치마크와 교차 검증할 것.

### 5.3 소프트런치 기간

3~6개월. 매 2주 단위로 **빌드 업데이트 → KPI 측정 → 가설 수립**의 cycle을 돈다. 통과 못하면 핵심 루프·튜토리얼·온보딩부터 재설계한다.

---

## 6. GDD 작성 안티패턴

| 안티패턴 | 왜 나쁜가 | 대안 |
|----------|----------|------|
| **100페이지 전통 GDD를 한 번에 작성** | 작성에만 수개월, 개발 시작 후 95%는 무용지물이 됨 | 콘셉트 1p + Wiki 형식 cross-linked 문서 |
| **"X처럼 만든다"만 적기** | 차별점·결정 근거 부재, 팀원이 잘못된 해석 가능 | "X와 같지만 Y가 다르다"로 작성 |
| **추상 표현으로 도배** ("재밌게", "직관적으로") | 검증 불가, 의견 충돌 시 판단 기준 없음 | "30초 안에 첫 보상", "탭 1회로 시작" 등 수치/행동 명시 |
| **메커닉을 한 문장으로 끝내기** ("캐릭터는 날 수 있다") | 어떻게·얼마나·언제가 빠짐 | "더블탭 시 0.8초간 점프 높이 1.5배" 수준 명시 |
| **GDD를 완성품 취급** | 변경 시점에 문서가 진실이 아님 → 신뢰 상실 → 아무도 안 봄 | "Living Document" 명시, 변경 이력·결정 근거 기록 |
| **초기 단계에 정교한 컨셉아트 다수 제작** | 시간 낭비, 방향이 굳어버려 피벗 어려움 | MS Paint 스케치 수준으로 충분 |
| **수익화를 출시 직전에 결정** | 게임 디자인이 수익화와 충돌 → 대규모 재작업 | 콘셉트 단계에 수익화 모델 결정, 게임 설계에 통합 |
| **소프트런치 없이 글로벌 출시** | 검증 안 된 KPI로 대규모 UA 집행 → 손실 | 캐나다·필리핀·인도네시아 3~6개월 검증 후 글로벌 |

---

## 7. 체크리스트 — 이 GDD가 완성됐는가

GDD를 인디 모바일 캐주얼 기준으로 "사용 가능" 수준에 도달했는지 자가점검:

- [ ] 한 줄 설명(logline)이 25자 이내로 작성됐다
- [ ] 디자인 필러 3~5개가 명시됐다
- [ ] 참고 게임 3~5개에 **무엇이 다른지** 명시됐다
- [ ] 30초 Core Loop가 Challenge/Action/Reward로 분해됐다
- [ ] 3분 Session Loop의 시작·중간·끝이 명시됐다
- [ ] 일일 Retention Loop에 일일보상·에너지·미션 중 2개 이상 포함
- [ ] 광고 3종 빈도와 IAP 4종 항목이 모두 정해졌다
- [ ] 에너지 시스템 도입 여부와 우회 광고가 결정됐다
- [ ] 색상 팔레트가 hex로 명시됐다
- [ ] 화면 흐름도가 노드 다이어그램으로 존재한다
- [ ] Unity LTS 버전·URP 사용 여부·타겟 OS·빌드 사이즈가 명시됐다
- [ ] 소프트런치 시장과 KPI 게이트가 명시됐다
- [ ] 변경 이력·결정 근거가 기록되는 위치(위키 페이지 등)가 정해졌다
