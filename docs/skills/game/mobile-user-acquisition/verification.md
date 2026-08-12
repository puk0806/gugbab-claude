---
skill: mobile-user-acquisition
category: game
version: v2
date: 2026-08-11
status: APPROVED
---

# Mobile User Acquisition — 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `mobile-user-acquisition` |
| 스킬 경로 | `.claude/skills/game/mobile-user-acquisition/SKILL.md` |
| 최초 검증일 | 2026-06-10 |
| 최종 재검증일 | **2026-08-11** (사실 오류 감사 대응) |
| 검증자 | skill-creator (v1) / skill-creator 재검증 (v2) |
| 스킬 버전 | v2 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Apple Developer ATT/SKAdNetwork)
- [✅] 공식 어트리뷰션 파트너 문서 확인 (AppsFlyer, Adjust)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-06-10, iOS 26 / SKAN 4.0 기준)
- [✅] 3대 채널 운영 패턴 정리 (Google UAC, Meta, ASA)
- [✅] LTV/CPI/ROAS 손익분기 계산 예시 작성
- [✅] iOS 프라이버시 (ATT + SKAN 4.0) 구현 가이드
- [✅] 크리에이티브 전략 (15초 영상 + 플레이어블)
- [✅] 어트리뷰션 SDK 연계 흐름도
- [✅] 흔한 실수 패턴 7종 정리
- [✅] Unity 2D 게임 특이사항 추가
- [✅] SKILL.md 파일 작성

### v2 작업 목록 (2026-08-11 — 사실 오류 감사 대응)

- [✅] 감사 지적 클레임("SKAN 4.0 채택률 ~5%") 원 출처·기준 시점 추적
- [✅] SKAN 4 채택률 현황을 독립 소스 3곳 이상으로 교차 검증 (Singular 트래커 / Singular 2025 / Kochava 2026)
- [✅] ATT opt-in rate 최신 벤치마크 재확인 (Adjust Mobile App Trends 2026)
- [✅] Apple ATT 제재 사실관계를 규제기관 1차 소스로 확인 (Autorité de la concurrence)
- [✅] Android Privacy Sandbox 현황을 Google 공식 status 페이지로 확인
- [✅] AAK(AdAttributionKit) 및 SKAN deprecation 일정 확인
- [✅] SKILL.md 수정 (DISPUTED 3건 정정 + 신규 섹션 2개 + 검증일 2026-08-11 갱신)
- [✅] verification.md 갱신 (재검증 로그·소스·판정·테스트 기록·변경 이력)
- [✅] README.md 미변경 (이번 작업 범위 제외)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | Google App Campaigns UAC 2026 best practices | Admiral Media, Adapty, eppcdigital 등 10개 소스 |
| 조사 2 | WebSearch | SKAdNetwork 4.0 conversion value mapping | Adjust, AppsFlyer, RocketShipHQ 등 10개 소스 |
| 조사 3 | WebSearch | Apple Search Ads ASA 2026 keyword strategy | Apptweak, Admiral Media, FoxData 등 10개 소스 |
| 조사 4 | WebSearch | mobile game CPI benchmark 2026 by genre/country | FoxData, GameGrowthAdvisor, Adjust 2026 Report |
| 조사 5 | WebSearch | mobile game LTV ROAS D7 D30 break-even | Liftoff 2026 benchmarks, Amps33, AppAgent |
| 조사 6 | WebSearch | ATT opt-in rate 2026 mobile game IDFA | Branch, Flurry, BusinessOfApps |
| 조사 7 | WebSearch | AppsFlyer Adjust Firebase 통합 | AppsFlyer 공식 헬프센터 |
| 조사 8 | WebSearch | playable ads 15초 hook gameplay CTA | AppLovin 2025 벤치마크, Adjust 가이드 |
| 조사 9 | WebSearch | soft launch KPI D1 35% D7 12% | GameGrowthAdvisor 2026, AddictMobile |
| 조사 10 | WebSearch | UA budget allocation Meta Google ASA 2026 | XMP Mobvista 2026, Segwise |
| 조사 11 | WebFetch | Apple Developer ATT 공식 문서 | ATTrackingManager API 시그니처 확인 |
| 조사 12 | WebFetch | Apple Developer SKAdNetwork 공식 문서 | 부분 응답, 추가 검증 필요 |
| 교차 검증 1 | WebSearch | SKAN 4.0 postback windows 0-2/3-7/8-35 | Adjust + Jampp + Airbridge 3중 확인 |
| 교차 검증 2 | WebSearch | LTV/CPI ratio break-even 1.5x 3x rule | AppAgent + Upptic + FinancialModelsLab 3중 확인 |

### v2 재검증 로그 (2026-08-11)

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 재조사 1 | WebSearch | SKAdNetwork 4.0 adoption rate 2025 percentage of postbacks | Singular 2025 블로그, Business of Apps 2026, Dataseat, SplitMetrics |
| 재조사 2 | WebSearch | singular SKAN 4 adoption 2025 Meta Reddit percentage | Meta 44% / Reddit 최상위 확인, Singular 트래커 계열 문서 다수 |
| 재조사 3 | WebFetch | singular.net/blog/skan-4-2025/ | "Meta postback의 44%가 SKAN 4", 2025-09-29 발간, Google 최후 홀드아웃 |
| 재조사 4 | WebFetch | singular.net/blog/skan-4-network-adoption/ | 2024-02-14 기준 SKAN4 43%/SKAN3 57%, 네트워크별 16종 수치 (Reddit 98·Google 22) |
| 재조사 5 | WebFetch | singular.net/blog/skan-4-adoption/ | 2023-06-27 발간 — 2023-04-20 약 5%, 2023-06-24 약 9% → **v1 "5%"의 원 출처·시점 확정** |
| 재조사 6 | WebFetch | singular.net/blog/100-skan-4/ | 100% 불가 사유(네트워크 인코딩 + iOS 16.1+ 단말), Reddit 95% |
| 재조사 7 | WebFetch | kochava.com — iOS Attribution Strategy 2026 | mid-2026 SKAN 4 majority adoption, ATT 프롬프트 노출 대비 69.7%, AAK 미미, WWDC 2026 무변경 |
| 재조사 8 | WebFetch | ppc.land — Adjust Mobile App Trends 2026 | 전산업 opt-in 35%→38%, 게임 39% 최고, 2026-02-18 발간, 데이터 2024-01~2026-01 |
| 재조사 9 | WebSearch | ATT opt-in rate 2026 gaming apps benchmark | Adjust 2025 Q2 서브장르(sports 50·hyper casual 43·action 40), 지역(브라질 50·UAE 49) |
| 재조사 10 | WebSearch + WebFetch | Apple ATT €150M fine France 2025 | Autorité de la concurrence 결정 25-D-02, 2025-03-31, 지배적 지위 남용 |
| 재조사 11 | WebFetch | privacysandbox.google.com/overview/status (Google 공식) | Android Topics·Protected Audience·Attribution Reporting·SDK Runtime phaseout, 2025-10-17 갱신 |
| 재조사 12 | WebSearch | AdAttributionKit vs SKAdNetwork 2026 deprecation | SKAN sunset 미발표, AAK와 병행 운영 확인 |
| 재조사 13 | WebFetch | businessofapps.com/data/skadnetwork-statistics/ | HTTP 403 — 직접 열람 실패, 검색 스니펫(2026-01: SKAN이 iOS 어트리뷰션 35%+ 담당)으로 대체 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Apple Developer — App Tracking Transparency | https://developer.apple.com/documentation/apptrackingtransparency | ⭐⭐⭐ High | 2026-06-10 | Apple 공식 |
| Apple Developer — SKAdNetwork | https://developer.apple.com/documentation/storekit/skadnetwork | ⭐⭐⭐ High | 2026-06-10 | Apple 공식 |
| Adjust — SKAdNetwork 4.0 공식 가이드 | https://www.adjust.com/blog/skadnetwork-4-0-has-officially-launched/ | ⭐⭐⭐ High | 2026 | 어트리뷰션 파트너 공식 |
| AppsFlyer — GA4 Integration 헬프센터 | https://support.appsflyer.com/hc/en-us/articles/25707682812561 | ⭐⭐⭐ High | 2026 | AppsFlyer 공식 |
| Liftoff — 2026 ROAS Benchmarks | https://liftoff.ai/blog/what-is-a-good-roas/ | ⭐⭐⭐ High | 2026 | 업계 표준 벤치마크 |
| Adjust — Gaming App Insights Report 2026 | https://gamedevreports.substack.com/p/adjust-mobile-games-insights-report | ⭐⭐⭐ High | 2026 | 업계 공식 보고서 |
| AppLovin 2025 Playable Ads 벤치마크 | (AppLovin 공식 발표 인용) | ⭐⭐ Medium | 2025-2026 | 채널사 자체 데이터 |
| FoxData — 2026 Mobile Game UA Cost Benchmarks | https://foxdata.com/en/blogs/2026-mobile-game-user-acquisition-cost-benchmarks-how-much-should-you-spend/ | ⭐⭐ Medium | 2026 | 업계 분석 |
| Game Growth Advisor — CPI Benchmarks 2026 | https://gamegrowthadvisor.com/blog/2026-03-17-user-acquisition-cpi-benchmarks-2026/ | ⭐⭐ Medium | 2026-03 | 업계 분석 |
| Admiral Media — Google App Campaigns Best Practices | https://admiral.media/google-app-campaigns-best-practices/ | ⭐⭐ Medium | 2026 | 에이전시 |
| Apptweak — Apple Search Ads Guide 2026 | https://www.apptweak.com/en/aso-blog/guide-to-apple-search-ads | ⭐⭐ Medium | 2026 | ASO 전문사 |
| Jampp — SKAN 4.0 Conversion Values | https://www.jampp.com/blog/how-conversion-values-will-work-in-skan-4-0 | ⭐⭐ Medium | 2026 | DSP 전문사 |
| AppAgent — LTV vs CPI Guide | https://appagent.com/blog/ltv-cpi/ | ⭐⭐ Medium | 2026 | UA 에이전시 |
| Flurry — ATT Opt-In Rate Updates | https://www.flurry.com/blog/att-opt-in-rate-monthly-updates/ | ⭐⭐ Medium | 2026 | Yahoo 자회사 분석 |

### v2 재검증 추가 소스 (2026-08-11)

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Google — Privacy Sandbox feature status | https://privacysandbox.google.com/overview/status | ⭐⭐⭐ High | 2025-10-17 갱신 | **Google 공식 1차 소스** — Android 광고 API phaseout 확인 |
| Autorité de la concurrence — 결정 25-D-02 보도자료 | https://www.autoritedelaconcurrence.fr/en/press-release/targeted-advertising-autorite-de-la-concurrence-imposes-fine-eu150000000-apple | ⭐⭐⭐ High | 2025-03-31 | **규제기관 1차 소스** — €150M 제재 주체·사유 확정 |
| Singular — SKAN 4 network adoption tracker | https://www.singular.net/blog/skan-4-network-adoption/ | ⭐⭐⭐ High | 2024-02-20 | MMP 실측 트래커, 네트워크별 postback 버전 분포 |
| Singular — SKAN 4 adoption is finally going up in 2025 | https://www.singular.net/blog/skan-4-2025/ | ⭐⭐⭐ High | 2025-09-29 | Meta 44%, SKAN 4 과반 전환 시점 |
| Singular — Live SKAN 4 penetration tracker (초기) | https://www.singular.net/blog/skan-4-adoption/ | ⭐⭐⭐ High | 2023-06-27 | **v1 "~5%" 수치의 원 출처 — 2023-04 기준임을 확정** |
| Singular — 왜 어떤 네트워크도 100% SKAN 4가 아닌가 | https://www.singular.net/blog/100-skan-4/ | ⭐⭐⭐ High | 2024-03-04 | 채택률 상한 구조(네트워크 인코딩 + iOS 16.1+) |
| Kochava — Your iOS Attribution Strategy in 2026 | https://www.kochava.com/blog/your-ios-attribution-strategy-2026-reality-check/ | ⭐⭐ Medium | 2026 | MMP 자체 조사 — mid-2026 SKAN 4 다수 채택, AAK 현황 |
| Adjust — Mobile App Trends 2026 (PPC Land 보도) | https://ppc.land/adjusts-2026-mobile-app-report-finance-sessions-up-21-gaming-cpi-jumps-30/ | ⭐⭐ Medium | 2026-02-18 | ATT opt-in 38%/게임 39%, 게임 CPI 통계 |
| Business of Apps — SKAdNetwork Adoption and Usage Rates | https://www.businessofapps.com/data/skadnetwork-statistics/ | ⭐⭐ Medium | 2026-01 | ⚠️ WebFetch 403 — 검색 스니펫으로만 간접 확인, 단독 근거로 사용하지 않음 |

---

## 4. 검증 체크리스트

### 4-1. 핵심 클레임 교차 검증 결과 (v1, 2026-06-10)

| 클레임 | 출처 1 | 출처 2 | 출처 3 | 판정 |
|--------|--------|--------|--------|------|
| SKAN 4.0 postback windows: 0-2일 / 3-7일 / 8-35일 | Adjust | Jampp | Airbridge | VERIFIED |
| Postback 1만 fine grain, 2·3은 coarse 또는 null | Jampp | Apphud | Dataseat | VERIFIED |
| 캐주얼 iOS CPI $3.00, Android $2.00 (puzzle 기준) | FoxData | Statista | Adjust 2026 | VERIFIED |
| Hyper-casual iOS CPI $1.50~$2.50, Android $0.40~$1.50 | FoxData | Tenjin | Adjust 2026 | VERIFIED |
| D7 ROAS 15~25%, D30 ROAS 40~60% F2P 목표 | Liftoff | Amps33 | GameGrowthAdvisor | VERIFIED |
| LTV : CPI 비율 1.5x 최소, 3x 이상적 | AppAgent | Upptic | FinancialModelsLab | VERIFIED |
| Google UAC tCPI 일일예산 ≥ 50× target | Admiral Media | Adapty | RevenueCat | VERIFIED |
| Google UAC tCPA 일일예산 ≥ 10× (20× 최적) | Admiral Media | Adapty | eppcdigital | VERIFIED |
| 게임 카테고리 ATT opt-in ~19%, 평균 12% | Branch | Flurry | BusinessOfApps | ~~VERIFIED~~ → **2026-08-11 DISPUTED 재판정** (4-3 참조) |
| 게임 UA 예산 기준은 opt-in 15%로 보수적 가정 | RespectLytics | Adjust | Cometly | ~~VERIFIED~~ → **2026-08-11 DISPUTED 재판정** (4-3 참조) |
| Meta 게임 UA 1위, 평균 ROAS ~4.2배 | Hubapps | XMP Mobvista | GameBizConsulting | VERIFIED |
| TikTok 게임 광고 점유율 21%→12.7% 감소 (24→25년) | XMP Mobvista | Segwise | ContentGrip | VERIFIED |
| 플레이어블 광고 D7 retention 30~50% 높음, CPI 25~45% 낮음 | RevX | iLogos | AppLovin 2025 | VERIFIED |
| 영상 광고 첫 3초 안에 hook 필수 | MegaDigital | Admiral Media | Udonis | VERIFIED |
| 월 5개 미만 크리에이티브 → 90일 내 CPI 20~40% 상승 | Segwise | MegaDigital | Admiral Media | VERIFIED |
| 캐주얼 D1 retention 통과선 35%+, top-quartile 40%+ | GameGrowthAdvisor | Playio | AddictMobile | VERIFIED |
| 2026 GameAnalytics 미디언 D1 ~22% | GameGrowthAdvisor | Playio | — | VERIFIED |
| ASA 4-캠페인 구조 (Brand/Competitor/Category/Discovery) | Admiral Media | Apptweak | FoxData | VERIFIED |
| 2026-03 ASA #2~#5 슬롯 개방 | Apptweak | FoxData | Stormy.ai | VERIFIED |
| SKAN 4.0 채택률 2026 초 ~5% (대부분 여전히 SKAN 3.0) | Segwise (Meta AEM vs SKAN) | AdLibrary | — | ~~VERIFIED~~ → **2026-08-11 DISPUTED 재판정 — 사실 오류 확정** (4-3 참조) |
| iOS 캐주얼 CPI 2026 평균 ~$4.22 (게임 전체) | GameGrowthAdvisor | Adjust 2026 | Tenjin | DISPUTED → SKILL.md엔 캐주얼 $3.00로 좁힘 |
| Google iOS Web-to-App 2x 전환율 향상 | Admiral Media | Adapty | — | VERIFIED (Google 공식 발표 인용) |
| Tier 1 = US/CA/UK/Western Europe, CPI 높지만 LTV 압도적 | XMP Mobvista | Hubapps | GameBizConsulting | VERIFIED |
| 캠페인당 국가 1개 원칙 (UAC) | Admiral Media | eppcdigital | Udonis | VERIFIED |

**판정 요약 (v1 시점)**: VERIFIED 22 / DISPUTED 1 / UNVERIFIED 0
**재판정 후 (2026-08-11)**: VERIFIED 19 / DISPUTED 4 (v1 DISPUTED 1건 + 재판정 3건) / UNVERIFIED 0

DISPUTED 처리:
- "iOS 게임 전체 평균 CPI $4.22"는 *게임 전체 평균*이라 캐주얼·하이퍼캐주얼·미드코어 모두 섞인 수치. SKILL.md에는 *장르별 분리된 수치* (캐주얼 iOS $3.00 등)만 기재해 혼동 방지.

---

### 4-3. 재검증 결과 (2026-08-11) — 사실 오류 감사 대응

감사에서 "SKAN 4.0 채택률 ~5%(2026 초)" 클레임이 실측과 상충한다는 지적이 제기되어, 해당 클레임과 주변 프라이버시 서술을 전면 재검증했다.

| # | 클레임 (v1 기재 내용) | 출처 1 | 출처 2 | 출처 3 | 판정 |
|---|----------------------|--------|--------|--------|------|
| R1 | SKAN 4 채택률 2026 초 기준 ~5%, 대부분 SKAN 3 | Singular 트래커 (2024-02: SKAN4 43%/SKAN3 57%) | Singular 2025-09-29 (Meta 44%, "SKAN 4가 과반으로 안정 전환") | Kochava 2026 ("SKAN 4 majority adoption", SKAN 1·2 소멸) | **DISPUTED — 사실 오류** |
| R2 | 네트워크별 SKAN 4 비중 | Singular 트래커 2024-02 (Reddit 98·Unity 81·AppLovin 50·Meta 42·Google 22) | Singular 2025-09-29 (Meta 44, Google 최후 홀드아웃) | — | VERIFIED |
| R3 | 어떤 네트워크도 SKAN 4 100% 불가 (네트워크 인코딩 + iOS 16.1+ 단말 조건) | Singular "100% SKAN 4" (2024-03-04) | Apple SKAdNetwork 문서 (버전별 OS 요건) | — | VERIFIED |
| R4 | 게임 ATT opt-in ~19% / 글로벌 25~35% / 예산은 15% 가정 | Adjust Mobile App Trends 2026 (전산업 38%, 게임 39%) | Adjust 카테고리·지역 벤치마크 (2025 Q2: sports 50·hyper casual 43·action 40) | Kochava 2026 (프롬프트 노출 대비 69.7%) | **DISPUTED — 과소 추정** |
| R5 | Apple ATT €150M 벌금은 "2026년 EU" 제재 | Autorité de la concurrence 결정 25-D-02 (2025-03-31) | CNBC / Cleary Antitrust Watch (2025-03-31, 프랑스 경쟁당국·지배적 지위 남용) | — | **DISPUTED — 주체·시점·사유 오류** |
| R6 | Android Privacy Sandbox 상태 | Google 공식 Privacy Sandbox status (2025-10-17: Android Topics·Protected Audience·Attribution Reporting·SDK Runtime 모두 phaseout) | 업계 분석 (GAID 유지, 2026-07 시점 status quo) | — | VERIFIED (신규 추가) |
| R7 | SKAN deprecation 일정 존재 여부 | Adjust AAK vs SKAN 가이드 | Aarki AAK FAQ (2026) — SKAN sunset 미발표, 병행 운영 | — | VERIFIED (신규 추가) |

**DISPUTED 3건 수정 반영 내역 (SKILL.md 반영 완료):**

| 항목 | v1 (오류) | v2 (수정) | 반영 위치 |
|------|----------|----------|----------|
| R1 | "SKAN 4 채택률 2026 초 ~5%, 대부분 SKAN 3.0 운영" | 연도별 추이 표 + 네트워크별 비중 표로 교체. 2023-04 시점 ~5%였음을 *기준 시점과 함께* 명시하고, 2026년엔 SKAN 4가 다수임을 기재. Google이 최후 홀드아웃이라는 실무 함의 추가 | SKILL.md 4-2, 3-2 |
| R4 | 게임 19% / 글로벌 25~35% / 예산 가정 15% | 게임 39%·전산업 38% (Adjust 2026 Q1)로 교체, 서브장르·지역 표 추가, 예산 가정 30% 내외로 상향. 분모 정의 차이(전체 유저 vs 프롬프트 노출) 주의 표기 | SKILL.md 4-1 |
| R5 | "2026년 EU에서 €150M 벌금" | "2025-03-31 프랑스 경쟁당국 결정 25-D-02, 시장지배적 지위 남용"으로 정정 + WWDC 2026 무변경 사실 추가 | SKILL.md 4-1 |

**오류 원인 분석**: v1의 "~5%"는 Singular가 2023년 4월 관측한 *초기 도입기* 수치다. 출처 자체는 실재했으나 **기준 시점 없이 인용**되면서 2026년 현황으로 오독됐다. → 재발 방지를 위해 v2에서는 모든 채택률 수치에 **관측 시점을 필수 병기**하도록 표 형식으로 재구성했다.

---

### 4-4. 항목별 검증

#### 4-4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (iOS 26 / SKAN 4.0 / 2026 기준)
- [✅] deprecated된 패턴을 권장하지 않음 (SKAN 2.0/3.0 단독 사용 권장 X)
- [✅] 코드 예시가 실행 가능한 형태임 (Swift ATT 예시, Conversion Value 매핑)
- [✅] **통계 수치에 관측 기준 시점이 병기되어 있음** (2026-08-11 신설 기준)
- [✅] **제재·규제 서술의 주체·시점·사유가 1차 출처와 일치함** (2026-08-11 신설 기준)

#### 4-4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (2026-08-11 갱신, 소스 5건 추가)
- [✅] 핵심 개념 설명 포함 (UA / CPI / LTV / ROAS / SKAN / ATT / AAK)
- [✅] 코드 예시 포함 (Swift ATT, Conversion Value schema)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (소프트런치 KPI 통과선)
- [✅] 흔한 실수 패턴 포함 (7개 anti-pattern)

#### 4-4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 UA 운영에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (LTV 계산 표, CV 매핑 표, 예산 배분 표)
- [✅] 범용적으로 사용 가능 (특정 게임/엔진 종속 X, Unity 2D는 보조 섹션)

#### 4-4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-10 완료)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 전항목 PASS)

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-10
**수행자**: skill-tester (general-purpose 역할로 직접 수행 — domain-specific game 에이전트 없어 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 소프트런치 KPI 미달 시 UA 시작 가능 여부 (D1 28%, D7 9%)**
- PASS
- 근거: SKILL.md "1-1. UA 집행의 절대 전제: 소프트런치 KPI 통과" 섹션 + "1-2. UA 집행 금지 시점" + "9. 빠른 의사결정 가이드"
- 상세: D1 28%는 통과선(35%) 미달, D7 9%는 통과선(12%) 미달. 답은 명확히 NO — UA 집행 금지, 게임 개선 우선. D7 9%는 절대 금지선(8%)은 간신히 넘지만 통과선 미달로 UA 불가 판정. SKILL.md가 두 케이스를 구분해 정확히 커버함.

**Q2. SKAN 4.0 Postback 1 Conversion Value 매핑 + 실무 주의사항**
- PASS
- 근거: SKILL.md "4-2. SKAdNetwork 4.0 (SKAN 4.0)" 섹션 — Postback Window 표 + Conversion Value 매핑 예시 코드블록 + 주의 항목
- 상세: fine(0~63) 매핑 7-구간 예시(이벤트 없음 / 튜토리얼 / 레벨 5 / 레벨 10+광고 / IAP 3단계)가 SKILL.md에 그대로 있음. AppsFlyer/Adjust 구현 도구 안내까지 근거 있음.
- ⚠️ **2026-08-11 사후 정정**: 당시 이 테스트는 "SKAN 4.0 채택률 약 5%, 대부분 여전히 SKAN 3.0 운영 중" 서술을 *근거 존재*만 확인하고 PASS 처리했다. 이 서술 자체가 사실 오류(2023-04 수치의 시점 누락 인용)였으므로, **CV 매핑 구조에 대한 PASS는 유지하되 채택률 부분의 PASS는 무효**로 한다. → 섹션 4-3 R1 및 아래 5-2 재테스트 참조. content test가 *출처 존재 여부*만 보고 *기준 시점 정합성*을 보지 않으면 이런 오류를 놓친다는 교훈.

**Q3. Google UAC tCPI $3.00 기준 일일 최소 예산 및 단계적 입찰 전략**
- PASS
- 근거: SKILL.md "3-1. Google App Campaigns" 섹션 — 입찰 전략 단계적 전환 항목 + "7-7. tCPA 캠페인에 예산 부족" + "9. 빠른 의사결정 가이드"
- 상세: tCPI × 50 공식 → $3.00 × 50 = $150/일 최소값 도출 가능. tCPI → tCPA(일일예산 ≥ CPA × 10, 최적 20×) → tROAS 3단계 전환 로직이 명시적. 예산 부족 anti-pattern($20 tCPA에 $50 예산 = 실패)도 섹션 7-7에서 확인됨.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md 섹션에서 근거를 직접 찾을 수 있었으며, 답변 정확도 이슈 없음.

### 판정

- agent content test: 3/3 PASS (단, Q2의 채택률 부분은 2026-08-11자로 무효 처리 — 위 정정 참조)
- verification-policy 분류: 개념·전략 정리 스킬 (content test PASS = APPROVED 가능)
- 최종 상태: APPROVED

---

## 5-2. 재검증 테스트 기록 (v2)

**수행일**: 2026-08-11
**수행자**: skill-creator (사실 오류 감사 대응 재검증)
**수행 방법**: 지적된 클레임을 WebSearch 5회 + WebFetch 6회로 교차 검증한 뒤, 수정된 SKILL.md 섹션이 실전 질문에 올바른 답을 내는지 재확인

Q1. "iOS 캠페인 CV schema를 SKAN 4 기준으로만 짜면 되나?" — **PASS**
  근거: SKILL.md 4-2 "SKAN 4 채택률 현황" 표 + 주의 항목. 2026년에도 Google 비중이 큰 캠페인은 SKAN 3 postback 비율이 높으므로 **SKAN 3 단일 postback과 SKAN 4 3-postback 양쪽에서 의미가 통하는 schema**를 짜야 한다는 답이 도출된다. v1이었다면 "채택률 5%라 SKAN 3만 쓰면 된다"는 정반대 오답이 나왔을 지점 — 수정으로 해소 확인.

Q2. "게임 UA 예산 산정 시 ATT opt-in을 몇 %로 가정해야 하나?" — **PASS**
  근거: SKILL.md 4-1 opt-in 표. 게임 39%(Adjust 2026 Q1) 확인 후 보수적으로 30% 내외 가정이라는 답 도출. 분모 정의(전체 유저 vs 프롬프트 노출 69.7%) 차이 주의까지 근거 있음. v1의 "15% 가정"은 실제의 절반 이하로 예산·물량 추정을 왜곡시켰을 값 — 수정으로 해소 확인.

Q3. "Android도 iOS처럼 곧 광고 ID가 막히니 대비해야 하나?" — **PASS**
  근거: SKILL.md 4-4. Google 공식 status(2025-10-17) 기준 Privacy Sandbox 광고 API가 phaseout되어 **GAID는 계속 동작**, 단기 status quo. 다만 결정론적 ID 단독 의존은 피하라는 균형 잡힌 답 도출.

Q4. "Apple이 ATT로 EU에서 제재받았다던데 근거는?" — **PASS**
  근거: SKILL.md 4-1 주의 항목. **EU 집행위가 아니라 프랑스 경쟁당국(2025-03-31, 결정 25-D-02)**, 사유는 프라이버시 위반이 아닌 지배적 지위 남용이라는 정정된 사실을 답변 가능.

- agent content test (v2 재검증): **4/4 PASS**
- 발견된 gap: 없음. DISPUTED 3건 모두 SKILL.md에 수정 반영 완료
- 후속 권장: 다음 정기 점검 시 `skill-tester`로 v2 전문 대상 content test 1회 더 수행 (섹션 7 참조)

---

> 아래는 skill-creator가 작성한 원본 테스트 케이스 템플릿 (참고용 보존)

### 테스트 케이스 1 (원본 템플릿)

**입력 (질문/요청):**
```
캐주얼 퍼즐 게임을 소프트런치 중인데 D1 retention 28%, D7 retention 9%가 나옵니다.
유저획득(UA) 캠페인을 시작해도 될까요?
```

**기대 결과:**
```
NO. 시작하면 안 됨.
- D1 35% 미만 → onboarding/튜토리얼 결함
- D7 12% 미만 → core gameplay loop 문제
- 우선순위: 게임 자체 개선 (튜토리얼, 첫 10분 경험) 후 KPI 통과 시 UA 시작
- LTV가 CPI를 못 넘는 상태에서 광고비 부으면 손실만 누적
```

**판정:** PASS (2026-06-10 수행)

---

### 테스트 케이스 2 (원본 템플릿)

**입력:**
```
iOS 캐주얼 게임에 SKAdNetwork 4.0을 적용하려고 합니다.
Postback 1 (0~2일)의 fine-grained conversion value 64개를 어떻게 매핑해야 할까요?
```

**기대 결과:**
```
0: 이벤트 없음
1~10: 튜토리얼 완료
11~20: 레벨 5 도달
21~30: 레벨 10 + 광고 3회 시청
31~40: IAP 첫 결제 ($0.99~$4.99)
41~50: IAP $4.99~$19.99
51~63: IAP $19.99 이상 또는 high-value 행동
```

**판정:** PASS (2026-06-10 수행)

---

### 테스트 케이스 3 (원본 템플릿)

**입력:**
```
신규 캐주얼 게임 글로벌 런칭, 월 UA 예산 $30,000입니다.
Google App Campaigns / Meta Ads / Apple Search Ads에 어떻게 배분해야 할까요?
```

**기대 결과:**
```
신규 런칭 단계 권장 비율:
- Meta: 50% = $15,000
- Google UAC: 30% = $9,000
- ASA (iOS): 15% = $4,500
- 신규/실험 (TikTok, AppLovin 등): 5% = $1,500
```

**판정:** PASS (2026-06-10 수행)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (2026-08-11 사실 오류 3건 수정 반영) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-06-10 3/3 PASS + 2026-08-11 재검증 4/4 PASS) |
| 교차 검증 | ✅ (v1 23건 + v2 재검증 7건, 1차 출처 2건 포함) |
| **최종 판정** | **APPROVED** (v2, 2026-08-11 기준) |

**APPROVED 유지 근거**: 지적된 사실 오류 3건(SKAN 4 채택률·ATT opt-in rate·Apple 제재 사실관계)이 모두 1차 또는 고신뢰 출처 교차 검증을 거쳐 SKILL.md에 수정 반영됐고, 수정 섹션에 대한 content test 4/4 PASS를 확인했다. 나머지 섹션(채널 운영·LTV/CPI·크리에이티브·어트리뷰션)은 v1 검증 결과가 유효하다. verification-policy 분류상 *개념·전략 정리 스킬*이므로 실사용 필수 카테고리에 해당하지 않아 content test PASS로 APPROVED 유지가 가능하다.

---

## 7. 개선 필요 사항

- [✅] skill-tester로 실제 에이전트 응답 테스트 후 섹션 5 채우기 (2026-06-10 완료, 3/3 PASS)
- [✅] SKAN 4 채택률 통계를 실측 기준으로 정정 (2026-08-11 완료 — 연도별 추이 + 네트워크별 표로 교체)
- [✅] ATT opt-in rate를 최신 벤치마크로 갱신 (2026-08-11 완료 — 게임 39%, 전산업 38%)
- [✅] Apple ATT 제재 사실관계 정정 (2026-08-11 완료 — 프랑스 경쟁당국 2025-03-31)
- [✅] Android Privacy Sandbox 철회 반영 (2026-08-11 완료 — Google 공식 status 기준)
- [❌] `skill-tester`로 v2 전문 대상 content test 1회 추가 수행 — 다음 정기 점검 시. 수정 섹션 재검증(4/4 PASS)은 완료돼 차단 요인 아님
- [❌] 실 광고 운영 결과(스튜디오 사례)를 추후 보강 가능 (Unity 2D 게임 + 실제 캠페인 데이터) — 선택 보강. 차단 요인 아님
- [❌] **채택률·opt-in 수치는 분기 단위로 변동** — 최소 6개월마다 Singular 트래커·Adjust 연간 리포트로 재확인 필요. 인용 시 반드시 관측 시점 병기
- [❌] AAK(AdAttributionKit) 도입률이 유의미해지거나 Apple이 SKAN deprecation 일정을 발표하면 섹션 4-3 전면 개편 필요
- [❌] iOS 27 이후 추가 프라이버시 변경 시 ATT/SKAN 섹션 업데이트 — 선택 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-10 | v1 | 최초 작성 (3대 채널 + ATT/SKAN 4.0 + LTV/CPI + 크리에이티브 + 어트리뷰션 + Unity 2D 특이사항) | skill-creator |
| 2026-06-10 | v1 | 2단계 실사용 테스트 수행 (Q1 소프트런치 KPI 미달 UA 금지 / Q2 SKAN 4.0 CV 매핑+채택률 주의 / Q3 Google UAC 예산·입찰 단계) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-08-11 | v2 | **사실 오류 감사 대응 재검증.** DISPUTED 3건 수정: ① SKAN 4 채택률 "2026 초 ~5%" → 연도별 추이표(2023-04 5% / 2024-02 43% / 2025-09 과반 전환 / 2026 다수) + 네트워크별 비중표로 교체 ② ATT opt-in "게임 19%·예산 15% 가정" → "게임 39%·전산업 38%(Adjust 2026 Q1)·예산 30% 가정" ③ Apple €150M 제재 "2026 EU" → "2025-03-31 프랑스 경쟁당국 결정 25-D-02, 지배적 지위 남용". 신규 추가: AAK 현황(4-3), Android Privacy Sandbox 철회(4-4). 섹션 4 구조를 템플릿 기준(4-1~4-4)으로 정리. 재검증 content test 4/4 PASS → status APPROVED 유지 | skill-creator |
