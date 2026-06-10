---
name: mobile-user-acquisition
description: >
  Unity 2D 모바일 게임 수익화를 위한 유저 획득(UA) 실무 가이드.
  Google App Campaigns / Meta Ads / Apple Search Ads 3대 채널 운영,
  iOS 프라이버시(ATT·SKAN 4.0) 대응, LTV·CPI·ROAS 손익 계산, 크리에이티브 전략, 어트리뷰션 설정을 다룬다.
---

# Mobile User Acquisition (모바일 유저 획득)

> 소스:
> - Apple Developer — App Tracking Transparency: https://developer.apple.com/documentation/apptrackingtransparency
> - Apple Developer — SKAdNetwork: https://developer.apple.com/documentation/storekit/skadnetwork
> - Adjust SKAN 4.0 공식 가이드: https://www.adjust.com/blog/skadnetwork-4-0-has-officially-launched/
> - AppsFlyer Google Analytics(GA4) Integration: https://support.appsflyer.com/hc/en-us/articles/25707682812561
> - Liftoff 2026 ROAS Benchmarks: https://liftoff.ai/blog/what-is-a-good-roas/
> - Adjust Gaming App Insights Report 2026
>
> 검증일: 2026-06-10
> 기준 시점: 2026년 상반기 (iOS 26 / SKAN 4.0 / ATT 5년 차)

---

## 1. UA가 무엇이며 언제 시작해야 하는가

**UA(User Acquisition)** = 유료 광고로 신규 유저를 게임에 유입시키는 활동. ARPU(유저당 매출)와 광고 단가(CPI)의 차이로 수익이 결정된다.

### 1-1. UA 집행의 절대 전제: 소프트런치 KPI 통과

**소프트런치 KPI를 통과하지 못한 게임에는 UA를 집행하지 않는다.** 광고비를 부어도 retention이 낮으면 LTV가 CPI를 못 넘어 손실만 누적된다.

| 지표 | 캐주얼 게임 최소 통과선 (2026) | 의미 |
|------|------|------|
| **D1 retention** | ≥ 35% | 첫날 다시 돌아오는 유저 비율. 35% 미만이면 onboarding/튜토리얼 결함 |
| **D7 retention** | ≥ 12% | 일주일 뒤 잔존율. core gameplay loop의 매력도 |
| **D30 retention** | ≥ 5% | 한 달 잔존. 장기 수익 기반 |
| **세션 길이** | ≥ 4분 | 세션 짧으면 광고/IAP 노출 기회 부족 |

> 주의: 2026 GameAnalytics 16,000+ 게임 미디언 D1 retention은 약 22%다. D1 35%는 *상위권 캐주얼 게임의 통과선*이며, 미드코어/RPG는 D1 30%·D7 15% 정도가 통과선이 된다.

### 1-2. UA 집행 금지 시점 (Anti-pattern)

다음 상태에서는 UA를 절대 시작하지 않는다:
- D1 retention < 25% — onboarding 부터 다시 설계
- D7 retention < 8% — core loop가 약함. 게임 자체 재설계 필요
- IAP/광고 통합 미완성 — 매출 측정 불가 상태에서 광고 집행
- 어트리뷰션 SDK 미통합 — 어느 채널에서 온 유저인지 모름 → 최적화 불가

---

## 2. LTV vs CPI 손익 계산

### 2-1. 핵심 공식

```
ROAS = 매출 / 광고비 × 100%
LTV / CPI = ROAS (cohort 기준)
손익분기 시점 = LTV가 CPI와 같아지는 날(payback period)
```

### 2-2. 손익분기 계산 예시 (캐주얼 게임)

가정:
- iOS 캐주얼 게임, 타겟 국가 미국
- CPI = $3.00 (iOS 캐주얼 평균)
- ARPDAU(일일 유저당 매출) = $0.08
- D7 retention = 12%, D30 retention = 5%

| 시점 | 누적 매출 (LTV) | 누적 비용 (CPI) | ROAS |
|------|----------------|----------------|------|
| D0 | $0.08 | $3.00 | 2.7% |
| D7 | $0.45 | $3.00 | 15% |
| D30 | $1.50 | $3.00 | 50% |
| D60 | $2.40 | $3.00 | 80% |
| D90 | $3.10 | $3.00 | **103%** ← 손익분기 도달 |

이 게임의 **payback period는 약 90일**. 90일까지 자본을 회수하지 못하므로 운영자금이 필요하다.

### 2-3. 권장 손익 기준

| 기준 | 목표값 | 의미 |
|------|--------|------|
| **D7 ROAS** | 15~25% | 단기 광고 효율 지표. 초기 캠페인 최적화 신호 |
| **D30 ROAS** | 40~60% | 중기 안정성 |
| **D180 ROAS** | ≥ 100% | 손익분기 — 이 시점에 LTV ≥ CPI |
| **LTV : CPI 비율** | ≥ 1.5:1 (보수적) / 3:1 (이상적) | 1.5 미만이면 운영비·플랫폼 수수료(30%) 제외 시 적자 |

> 주의: Apple/Google 결제 수수료(30%, 소규모 개발자 15%), 어트리뷰션 비용, 운영비를 반영한 *순 LTV*로 계산해야 한다. 매출 그대로 LTV로 쓰면 안 된다.

---

## 3. 3대 UA 채널

### 3-1. Google App Campaigns (UAC / Google Ads App Campaigns)

머신러닝 기반 자동화 캠페인. Google Search, Play Store, YouTube, Display Network, Gmail, Discover 전체에 자동 배포.

**핵심 운영 원칙 (2026):**
- **국가별 캠페인 분리 필수** — 캠페인 1개에 여러 국가 묶으면 알고리즘이 CPI·전환율이 다른 시장을 평균화해 비효율 발생
- **입찰 전략 단계적 전환**:
  - 초기 install volume 확보: **tCPI** (target CPI), 일일 예산 ≥ 타겟 CPI × 50
  - 안정 후 활성화 최적화: **tCPA** (target CPA, 인앱 이벤트 기준), 일일 예산 ≥ 타겟 CPA × 10 (이상 20×)
  - 매출 최적화: **tROAS** (target ROAS) — D7 ROAS 데이터가 충분히 쌓인 뒤 전환
- **에셋 다양성**: 비디오 ≤ 30초 + 이미지 + 텍스트 헤드라인을 각 segment별로 다수 등록. 알고리즘이 자동 조합

**캠페인 유형:**
- **App Install (설치 최적화)** — 신규 게임 초기
- **App Engagement (재참여)** — 휴면 유저 복귀 (Google Play ID 기반 리타게팅)

### 3-2. Meta Ads (Facebook / Instagram 앱 설치 캠페인)

소셜 그래프 기반 정밀 타겟팅. 게임 UA에서 *광고 지출 1위 채널*이며, 평균 ROAS가 가장 높다(~4.2배).

**핵심 운영 원칙 (2026):**
- **AAA (Advantage+ App Campaigns)** — Meta의 자동화 캠페인 기본 사용
- **Lookalike 타겟** — 기존 고가치 유저(IAP 결제자) 시드로 1~3% LAL 생성
- **iOS 캠페인**: SKAN 4.0 + Meta AEM(Aggregated Event Measurement) 통합 운영. SKAN 4.0 채택률은 2026년 초 기준 약 5% 수준이라 실제로는 대부분 광고주가 여전히 SKAN 3.0 기반으로 운영 중
- **크리에이티브 다양성**: Reels(세로 9:16) + Feed(1:1) + Stories 형식 동시 운영

**평균 CPI (2026):**
- iOS 캐주얼: $3~5
- Android 캐주얼: $1.5~3
- 미드코어/RPG: 위의 2~3배

### 3-3. Apple Search Ads (ASA)

iOS App Store 검색 결과 상단 노출. *intent가 가장 높은* 유저를 데려오므로 install→과금 전환율이 다른 채널 대비 압도적으로 높다.

**4-캠페인 구조 (2026 표준):**

| 캠페인 | 목적 | 키워드 예시 |
|--------|------|------------|
| **Brand Defense** | 자기 브랜드 검색 방어 | "{게임명}", "{게임명} 무료" |
| **Competitor Conquest** | 경쟁작 검색 유저 탈취 | 경쟁 게임명 |
| **Category/Generic** | 장르 검색 | "puzzle game", "퍼즐 게임" |
| **Discovery** | Search Match로 신규 키워드 발굴 | (키워드 없이 자동) |

**핵심 운영:**
- **Discovery 캠페인의 Search Match 기능**은 200+ 신규 intent 키워드를 자동 발굴
- **Custom Product Pages (CPP)** — Top 5 키워드 클러스터별 전용 상품 페이지 생성, 스크린샷·소셜 프루프 A/B 테스트
- **2026년 3월부터** App Store 검색 결과 #2~#5 광고 슬롯 추가 개방 — 인벤토리 증가했지만 경쟁 심화로 비효율 위험도 동시 증가

### 3-4. 채널별 예산 배분 (2026 권장)

| 게임 단계 | Meta | Google UAC | ASA | 신규/실험 |
|----------|------|-----------|-----|----------|
| **신규 런칭 (~3개월)** | 50% | 30% | 15% | 5% |
| **성숙 (3~12개월)** | 40% | 30% | 20% | 10% |
| **확장 (1년+)** | 35% | 30% | 20% | 15% (TikTok, AppLovin, Unity Ads 등) |

**국가 Tier 전략:**
- **Tier 1 (US, CA, UK, DE, FR, JP, KR, AU)** — CPI 높지만 LTV 압도적, 안정 spend 유지
- **Tier 2 (동유럽, LATAM, SEA)** — Tier 1 CPI 급등 시 incremental 예산 이동
- **신흥 시장 (인도, 브라질, 인도네시아)** — 초저 CPI, 광고 기반 수익화 게임에만 적합

> 주의: TikTok은 2024→2025 사이 광고 점유율이 21.0% → 12.7%로 급감했다. 게임 UA에서 비중 하향 중이지만 *크리에이티브 채널*로는 여전히 유효하다.

---

## 4. iOS 프라이버시 — ATT와 SKAdNetwork 4.0

### 4-1. App Tracking Transparency (ATT)

iOS 14.5+ 모든 앱은 IDFA(Identifier for Advertisers) 접근 전 **사용자 동의 프롬프트** 표시 필수.

```swift
import AppTrackingTransparency
import AdSupport

ATTrackingManager.requestTrackingAuthorization { status in
    switch status {
    case .authorized:
        let idfa = ASIdentifierManager.shared().advertisingIdentifier
    case .denied, .restricted, .notDetermined:
        // IDFA = 00000000-0000-0000-0000-000000000000
        // → 디바이스 단위 트래킹 불가, SKAdNetwork로만 측정
    @unknown default: break
    }
}
```

**Unity 게임에서의 구현:**
- Unity iOS 빌드는 `Info.plist`에 `NSUserTrackingUsageDescription` 명시 필수 (없으면 App Store 리젝)
- ATT 프롬프트는 *게임 첫 진입 또는 가치 제안 직후* 호출 (튜토리얼 직후가 일반적)
- 앱 첫 실행 즉시 호출하면 opt-in rate가 낮아진다

**2026년 ATT opt-in rate 현황:**
- 게임 카테고리: 약 19% (다른 카테고리 평균 12%보다 높음)
- 글로벌 평균: ~25~35% (Adjust Q2 2025 기준 ~35%)
- **UA 예산 산정 시**: 게임은 opt-in 15%로 보수적 가정 권장

> 주의: 2026년 Apple은 ATT 위반으로 EU에서 €150M 벌금 부과받음. iOS 26부터 fingerprinting 차단 강화 — IDFA 우회 트래킹 시도는 *기술적으로 더 어려워졌다*.

### 4-2. SKAdNetwork 4.0 (SKAN 4.0)

ATT 거부 유저에 대한 *Apple 공식 어트리뷰션 시스템*. 디바이스 식별자 없이 *집계된* 캠페인 성과 측정.

**SKAN 4.0 3개 Postback Window:**

| Postback | 기간 | conversion value 형태 | 활용 |
|----------|------|----------------------|------|
| **Postback 1** | 0~2일 | fine (0~63, 6-bit) 또는 coarse (low/medium/high) | 설치 직후 행동 (튜토리얼 완료, 첫 세션) |
| **Postback 2** | 3~7일 | coarse 또는 null | 초기 retention, D7 매출 |
| **Postback 3** | 8~35일 | coarse 또는 null | 장기 retention, IAP 행동 |

Postback 송신 지연: 24~144시간 (Postback 1은 24~48시간).

**Conversion Value 매핑 — 캐주얼 게임 예시:**

```
Postback 1 (0~2일, fine 0~63):
  0       — 이벤트 없음 (앱만 열고 종료)
  1~10    — 튜토리얼 완료
  11~20   — 레벨 5 도달
  21~30   — 레벨 10 도달 + 광고 시청 3회
  31~40   — IAP 첫 결제 ($0.99 ~ $4.99)
  41~50   — IAP $4.99 ~ $19.99
  51~63   — IAP $19.99 이상 또는 high-value 행동

Postback 2 (3~7일, coarse):
  low    — D7 retention 없음
  medium — D7 retention 있음, 매출 < $5
  high   — D7 retention 있음, 매출 ≥ $5

Postback 3 (8~35일, coarse):
  low    — D30 휴면
  medium — D30 retention 있음
  high   — D30 IAP 또는 ad LTV ≥ $10
```

**구현 도구**: AppsFlyer SKAN Conversion Studio 또는 Adjust SKAN dashboard에서 conversion value schema 설정 → 어트리뷰션 SDK가 자동으로 `SKAdNetwork.updateConversionValue()` 호출.

> 주의: SKAN 4.0 채택률(2026 초)은 광고주 중 약 5%다. 대부분 캠페인은 여전히 SKAN 3.0 단일 postback(0~2일)으로 운영된다. *4.0 적용 여부는 채널별로 확인 필요*.

---

## 5. 어트리뷰션 (Attribution)

### 5-1. AppsFlyer / Adjust 비교

| 항목 | AppsFlyer | Adjust |
|------|-----------|--------|
| 시장 점유율 | 1위 (게임 UA 표준) | 2위 |
| 가격 | 트래픽 기반 (저예산엔 부담) | 트래픽 기반 (AppsFlyer보다 약간 높음) |
| 강점 | SRN(Self-Reporting Network) 통합 가장 광범위 | 사기 방지·시그널 검증 강함 |
| Unity SDK | unitypackage 제공 | unitypackage 제공 |

소규모 인디 게임은 Singular(저비용) 또는 Branch(무료 tier)도 고려 가능.

### 5-2. Unity 게임 어트리뷰션 통합 흐름

```
[Unity 게임 클라이언트]
      ↓ AppsFlyer/Adjust SDK 통합
[어트리뷰션 SDK]
      ↓ 설치 + 인앱 이벤트 수집
      ├─ Google UAC (Firebase 또는 직접 통합)
      ├─ Meta Ads (AEM postback)
      ├─ Apple Search Ads (AdServices API)
      └─ SKAdNetwork (iOS 자동)
            ↓
      [어트리뷰션 대시보드]
      ↓ 이벤트 forwarding
[Firebase Analytics / GA4]  ← 인앱 행동 분석
```

### 5-3. AppsFlyer + Firebase Analytics 연계

AppsFlyer는 어트리뷰션(설치 출처)을 담당하고, Firebase Analytics는 인앱 행동(세션, 진행도, funnel)을 담당. **두 도구를 함께 쓰는 것이 표준**이다.

**연계 방법:**
1. Unity 프로젝트에 Firebase Unity SDK + AppsFlyer Unity SDK 모두 통합
2. AppsFlyer 대시보드에서 GA4 integration 활성화 → AppsFlyer 어트리뷰션 데이터가 GA4로 forward
3. Firebase의 in-app event를 AppsFlyer로 역방향 send → SKAN conversion value 매핑에 활용

### 5-4. 추적해야 할 핵심 인앱 이벤트

```
af_install          — 설치 (자동)
af_tutorial_complete — 튜토리얼 완료
af_level_achieved   — 레벨 도달 (param: level)
af_ad_view          — 광고 시청 (param: placement, eCPM)
af_purchase         — IAP 결제 (param: revenue, currency, sku)
af_ad_revenue       — 광고 매출 (MAX/AdMob에서 자동 수집)
```

이 이벤트들을 SKAN conversion value, Meta AEM event, Google Ads conversion 모두에 매핑해야 채널별 최적화 가능.

---

## 6. 크리에이티브 전략

### 6-1. 15초 영상 광고 표준 구성

```
[0~3초]  HOOK (훅)
  - 가장 자극적인 순간 / 실패하는 장면 / "WTF" 모먼트
  - 첫 3초 안에 스크롤 멈춤 유도 필수
  - 핵심 게임 메커닉이 한 눈에 보여야

[3~11초] GAMEPLAY (실제 플레이)
  - 실제 게임 화면 (cinematic 컷씬 X)
  - 단일 게임 루프 강조 — 여러 기능 보여주면 혼란
  - "time to fun" 10초 이내 — 유저가 보자마자 재미 이해

[11~15초] CTA (Call To Action)
  - "Download Now", "Play Free" 등 명확한 액션
  - 설치 버튼 UI 노출
  - end card는 peak engagement 시점에 배치 (지나간 뒤가 아니라)
```

### 6-2. 플레이어블 광고 (Playable Ads)

15~60초 동안 유저가 직접 mini-game을 플레이하는 인터랙티브 광고.

**효과 (AppLovin 2025 벤치마크):**
- D7 retention 30~50% 높음 (video 광고 대비)
- CPI 25~45% 낮음 (video 광고 대비)

**제작 원칙:**
- Time-to-fun < 5초 (탭 1번 안에 게임 시작)
- 실제 게임의 첫 30초 경험과 *동일한 메커닉* 사용
- 광고 종료 시점 = "다음 단계가 궁금해지는" 순간

### 6-3. 크리에이티브 A/B 테스트

| 항목 | 권장 |
|------|------|
| **월간 신규 컨셉 테스트** | 10~20개 이상 |
| **크리에이티브 교체 주기** | 매주 winner refresh |
| **테스트 변수** | 훅 첫 3초, 게임플레이 클립, CTA 문구, 종횡비, 자막 유무 |

> 주의: 월 5개 미만 크리에이티브 테스트하는 게임은 90일 내 CPI가 20~40% 상승한다(creative fatigue). 크리에이티브 다양성이 부족하면 알고리즘이 동일 유저에게 반복 노출하며 비효율 누적.

### 6-4. UGC (User-Generated Content) 스타일 광고

2025~2026 가장 효과 좋은 포맷. 실제 플레이어가 게임하는 듯한 *세로 폰 화면 녹화* + 음성 reaction. 광고처럼 보이지 않아 광고 회피 본능 우회.

---

## 7. 흔한 실수 패턴 (Anti-patterns)

### 7-1. 소프트런치 KPI 미달 상태에서 UA 집행

- D1 < 25%인데 UA 시작 → CPI는 그대로지만 LTV가 너무 낮아 광고비 회수 불가
- "UA로 데이터 모으면서 게임 개선" 전략은 *대부분의 인디에게 자살행위*다. 소프트런치 단계에서 organic + 소액 UA로 KPI 먼저 통과시킨다

### 7-2. 크리에이티브 1~2개로 캠페인 운영

- 알고리즘이 *최적화할 변수가 없어* CPI 상승 + 동일 유저 반복 노출 + creative fatigue 발생
- 최소 10개 컨셉, 컨셉별 3~5 변형 = 30~50개 active asset 유지

### 7-3. 어트리뷰션 SDK 미설정 상태에서 UA 시작

- "Meta가 효과적이다 / Google이 효과적이다"를 알 수 없음
- 채널별 최적화 불가능 → 잘못된 채널에 예산 집중 → 손실
- 첫 UA $1 쓰기 전에 AppsFlyer/Adjust + Firebase 통합 완료해야

### 7-4. iOS만 운영하면서 ATT/SKAN 무시

- ATT prompt 없이 IDFA 접근 시도 → 앱 크래시 또는 App Store 리젝
- SKAN conversion value schema 미설정 → iOS 캠페인 최적화 신호 0 → 알고리즘이 무작위 유저 가져옴

### 7-5. CPI만 보고 캠페인 평가

- 2026 패러다임: "가장 싼 install"이 아니라 "가장 수익 나는 유저"가 목표
- 평가 지표는 **D30 ROAS**여야 한다. CPI는 최적화 *과정 지표*일 뿐
- hyper-casual CPI $0.4 vs mid-core CPI $5 비교 자체가 무의미 — LTV가 다름

### 7-6. 캠페인 1개에 여러 국가 묶기

- 미국 CPI $4 + 인도 CPI $0.2를 평균화 → 알고리즘이 어디에 spend할지 혼란
- 항상 *국가 1개 = 캠페인 1개* 원칙 (Google UAC, Meta 모두)

### 7-7. tCPA 캠페인에 예산 부족

- Google UAC tCPA 캠페인은 일일 예산 ≥ tCPA × 10 (최적 20×) 필요
- $20 tCPA에 $50 일일예산 설정 → 알고리즘이 학습 데이터 부족으로 최적화 실패

---

## 8. UA 운영 체크리스트

### 런칭 전
- [ ] D1 ≥ 35% / D7 ≥ 12% / D30 ≥ 5% 통과 (캐주얼 기준)
- [ ] 어트리뷰션 SDK 통합 완료 (AppsFlyer or Adjust)
- [ ] Firebase Analytics in-app event 정의 완료
- [ ] iOS: ATT prompt 구현 + SKAN conversion value schema 설정
- [ ] 인앱 이벤트: 튜토리얼 완료, 레벨 도달, IAP, 광고 시청 추적

### 캠페인 셋업
- [ ] 국가별 캠페인 분리
- [ ] Meta / Google / ASA 모두 시작 (예산 50/30/15)
- [ ] 최소 10개 크리에이티브 컨셉 ready
- [ ] 입찰 전략: tCPI → tCPA → tROAS 단계적 전환 계획

### 운영 중 (주간)
- [ ] D7 ROAS 트래킹 (15% 미만이면 캠페인 일시 중지 후 분석)
- [ ] Winner 크리에이티브 refresh
- [ ] 신규 컨셉 2~5개 추가 테스트
- [ ] CPI 급등 시 채널/국가 재배분

### 월간
- [ ] D30 ROAS 평가 — 40% 미만이면 게임 자체 retention 재검토
- [ ] LTV : CPI 비율 ≥ 1.5 유지 확인
- [ ] SKAN postback 데이터로 iOS conversion value schema 재조정

---

## 9. 빠른 의사결정 가이드

```
Q: UA를 시작해도 될까?
→ D1 ≥ 35%, D7 ≥ 12%, 어트리뷰션 SDK 통합, ATT/SKAN 구현 완료 → YES
→ 하나라도 미달 → NO. 게임 개선 우선

Q: 어느 채널부터?
→ iOS: Meta + ASA 먼저
→ Android: Meta + Google UAC 먼저
→ TikTok은 크리에이티브 검증 후 확장 단계에서

Q: 캠페인이 안 되는데?
→ 7일 데이터 부족 → 학습 기간 대기
→ 14일 후에도 D7 ROAS < 10% → 크리에이티브 / 타겟 / 게임 문제
→ CPI는 낮은데 retention 낮음 → 잘못된 유저 가져오는 중. SKAN value schema 또는 LAL 시드 재검토

Q: 예산 얼마부터?
→ 캠페인당 일일 ≥ tCPI × 50 (Google UAC tCPI 기준)
→ Meta AAA: 일일 $50~$100부터 시작, 학습 후 확장
→ ASA Discovery: 일일 $20~$50부터 (키워드 발굴 목적)
```

---

## 10. 참고: Unity 2D 게임 특이사항

- **Unity Ads / LevelPlay** — Unity 게임은 Unity Ads 통합이 쉬워 ad LTV 수집이 용이. UA 채널로도 활용 가능 (특히 hyper-casual)
- **빌드 크기** — iOS 앱 다운로드 크기가 200MB 넘으면 셀룰러 다운로드 차단되며 install 전환율 하락. Unity Asset Bundle / Addressables로 onboarding 분리 권장
- **App Thinning** — iOS는 디바이스별 최적화된 슬라이스만 다운로드되도록 설정해 install 크기 최소화
- **Time to First Action** — Unity 게임은 첫 로딩이 길면 install→tutorial 전환율이 크게 떨어진다. UA로 들어온 유저는 이탈 속도가 organic보다 빠름
