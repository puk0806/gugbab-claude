---
skill: unity-levelplay-ads
category: game
version: v1
date: 2026-06-09
status: APPROVED
---

# 스킬 검증 보고서 — unity-levelplay-ads

> Unity LevelPlay(구 ironSource) 광고 SDK를 Unity 2D 모바일 게임에 통합하는 스킬의 검증 기록.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `unity-levelplay-ads` |
| 스킬 경로 | `.claude/skills/game/unity-levelplay-ads/SKILL.md` |
| 검증일 | 2026-06-09 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 대상 SDK 버전 | LevelPlay Unity Package 9.4.3 (2026-05-25 릴리스) |
| 대상 Unity Editor | Unity 6 LTS / Unity 2022.3 LTS |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.unity.com/en-us/grow/levelplay)
- [✅] 공식 GitHub 2순위 소스 확인 (ironsource-mobile/Unity-sdk)
- [✅] 최신 버전 기준 내용 확인 (9.4.3, 2026-05-25 릴리스)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (신 API LevelPlay.Init / LevelPlayRewardedAd 등)
- [✅] 코드 예시 작성 (Rewarded / Interstitial / Banner / 초기화 / 생명주기)
- [✅] 흔한 실수 패턴 정리 (10개 안티패턴 표 포함)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 사전 확인 | Read | VERIFICATION_TEMPLATE.md | 8개 섹션 템플릿 구조 파악 |
| 사전 확인 | Glob | `.claude/skills/**/unity-levelplay-ads/SKILL.md` | 중복 없음 — 신규 작성 진행 |
| 사전 확인 | Glob | `.claude/skills/game/**` | 기존 게임 스킬 6종 확인 (unity-6-2d-fundamentals 등) |
| 조사 | WebSearch | "Unity LevelPlay SDK Unity 6 documentation 2026" | 공식 문서 사이트 + GitHub 확인 |
| 조사 | WebSearch | "com.unity.services.levelplay package manager latest version" | 최신 버전 9.4.x 확인 |
| 조사 | WebFetch | docs.unity.com/.../migrate-to-init-api | 신구 API 차이 정확히 파악 (IronSource.Agent → LevelPlay.Init) |
| 조사 | WebFetch | docs.unity.com/.../rewarded-ad-integration-package | LevelPlayRewardedAd 전체 코드 샘플 확보 |
| 조사 | WebFetch | docs.unity.com/.../interstitial-integration | LevelPlayInterstitialAd 코드 샘플 확보 |
| 조사 | WebFetch | docs.unity.com/.../changelog | 최신 버전 9.4.3 + 호환 환경 확인 |
| 조사 | WebFetch | docs.unity.com/.../package-integration | 설치·iOS/Android 빌드 사전요구사항 |
| 조사 | WebSearch | LevelPlayBannerAd / LevelPlayAdSize / 배너 위치 | 배너 사이즈 3종(BANNER/LARGE/MEDIUM_RECTANGLE) + 위치 enum 확인 |
| 조사 | WebSearch | OnApplicationPause / GADApplicationIdentifier | 생명주기 IronSource.Agent.onApplicationPause + iOS 필수 키 확인 |
| 조사 | WebSearch | Unity LevelPlay AdMob mediation setup | AdMob 미디에이션 절차 확인 |
| 교차 검증 | WebSearch | 13개 핵심 클레임, 독립 소스 2개 이상 | VERIFIED 11 / DISPUTED 2 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| LevelPlay SDK for Unity (공식) | https://docs.unity.com/en-us/grow/levelplay/sdk/unity | ⭐⭐⭐ High | 2026-06-09 | Unity 공식 문서 (1순위) |
| Package integration (공식) | https://docs.unity.com/en-us/grow/levelplay/sdk/unity/package-integration | ⭐⭐⭐ High | 2026-06-09 | 설치·플랫폼 사전요구사항 |
| Migrate to LevelPlay Init API (공식) | https://docs.unity.com/en-us/grow/levelplay/sdk/unity/migrate-to-init-api | ⭐⭐⭐ High | 2026-06-09 | 신구 API 차이 정의 출처 |
| Rewarded ad integration (공식) | https://docs.unity.com/en-us/grow/levelplay/sdk/unity/rewarded-ad-integration-package | ⭐⭐⭐ High | 2026-06-09 | LevelPlayRewardedAd 코드 샘플 출처 |
| Interstitial integration (공식) | https://docs.unity.com/en-us/grow/levelplay/sdk/unity/interstitial-integration | ⭐⭐⭐ High | 2026-06-09 | LevelPlayInterstitialAd 코드 샘플 출처 |
| Banner integration (공식) | https://docs.unity.com/en-us/grow/levelplay/sdk/unity/banner-integration | ⭐⭐⭐ High | 2026-06-09 | 배너 통합 가이드 |
| Changelog (공식) | https://docs.unity.com/en-us/grow/levelplay/sdk/unity/changelog | ⭐⭐⭐ High | 2026-06-09 | 9.4.3 최신 버전 정보 |
| Google AdMob integration (공식) | https://docs.unity.com/en-us/grow/levelplay/sdk/android/networks/guides/google-admob | ⭐⭐⭐ High | 2026-06-09 | AdMob 미디에이션 가이드 |
| LevelPlay Unity SDK GitHub | https://github.com/ironsource-mobile/Unity-sdk | ⭐⭐⭐ High | 2026-06-09 | 공식 GitHub 저장소 (2순위) |
| LevelPlayRewardedAd API 9.2 | https://docs.unity3d.com/Packages/com.unity.services.levelplay@9.2/api/Unity.Services.LevelPlay.LevelPlay.html | ⭐⭐⭐ High | 2026-06-09 | API 레퍼런스 |
| LevelPlayBannerAd API 8.2 | https://docs.unity3d.com/Packages/com.unity.services.levelplay@8.2/api/com.unity3d.mediation.LevelPlayBannerAd.html | ⭐⭐⭐ High | 2026-06-09 | 배너 API 레퍼런스 |
| Unity LevelPlay 제품 페이지 | https://unity.com/products/levelplay | ⭐⭐⭐ High | 2026-06-09 | 제품 개요 |
| ironSource Unity 통합 가이드 | https://developers.is.com/ironsource-mobile/unity/getting-started-ironsource-unity-plugin/ | ⭐⭐ Medium | 2026-06-09 | 레거시 API 가이드 (참고용) |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 항목은 본문에 반영함)
- [✅] 버전 정보가 명시되어 있음 (LevelPlay 9.4.3, Unity 6 LTS, Android API 19+, iOS 13+, XCode 16+)
- [✅] deprecated된 패턴을 권장하지 않음 (레거시 IronSource.Agent API는 신 API와 차이 설명 후 OnApplicationPause만 사용)
- [✅] 코드 예시가 실행 가능한 형태임 (using 문 + MonoBehaviour 컨텍스트 포함)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description + 3개 example)
- [✅] 소스 URL과 검증일 명시 (9개 공식 URL + 검증일 2026-06-09)
- [✅] 핵심 개념 설명 포함 (개요, 신구 API 차이, 초기화)
- [✅] 코드 예시 포함 (초기화 + Rewarded + Interstitial + Banner + 생명주기 + 테스트 스위트)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (11번 섹션)
- [✅] 흔한 실수 패턴 포함 (10번 섹션, 10개 항목 표)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (실제 Unity 게임 시나리오 기준)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-09 skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음 — 3/3 PASS)

---

## 4.5. 교차 검증한 클레임 목록과 판정

| # | 클레임 | 판정 | 근거 / 처리 |
|---|--------|------|-----------|
| 1 | LevelPlay 최신 안정 버전은 9.4.3 (2026-05-25) | VERIFIED | Changelog 공식 페이지 + WebSearch 결과 일치 |
| 2 | 패키지명은 `com.unity.services.levelplay` | VERIFIED | docs.unity3d.com manual + Package Integration 페이지 일치 |
| 3 | Android 최소 API Level 19, iOS 최소 13, XCode 16+ | VERIFIED | Changelog + Package Integration 일치 |
| 4 | 9.0.0+에서 신 API(`LevelPlay.Init`, `LevelPlayRewardedAd` 등) 권장 | VERIFIED | Migrate to Init API 공식 가이드 명시 |
| 5 | 초기화 콜백은 `OnInitSuccess` / `OnInitFailed` | VERIFIED | Migrate guide + Rewarded ad integration 페이지 일치 |
| 6 | 보상 지급은 `OnAdRewarded`에서 해야 함 (OnAdClosed 금지) | VERIFIED | Rewarded ad integration 페이지에 명시: "OnAdRewarded and OnAdClosed are asynchronous" + 보상은 OnAdRewarded에서 |
| 7 | 배너 사이즈는 BANNER / LARGE / MEDIUM_RECTANGLE | VERIFIED | LevelPlayAdSize API 레퍼런스 + Banner integration 페이지 일치 |
| 8 | 사용자 요청의 "배너 사이즈 SMART"는 신 API에 없음 | DISPUTED | 사용자 입력에 SMART 포함되어 있으나 신 API LevelPlayAdSize에는 미포함. 본문에 "SMART는 신 API에서 제공되지 않는다" 명시. |
| 9 | OnApplicationPause는 신 API에서도 `IronSource.Agent.onApplicationPause()` 호출 필요 | VERIFIED | IronSource Knowledge Center + ironSource Unity 가이드 일치 |
| 10 | iOS Info.plist에 `GADApplicationIdentifier` 미설정 시 크래시 | VERIFIED | Google Mobile Ads SDK 공식 + ironSource 통합 가이드 일치 |
| 11 | Android API 33+ 타겟 시 `com.google.android.gms.permission.AD_ID` 권한 필요 | VERIFIED | Package Integration 페이지 명시 |
| 12 | 사용자 요청의 레거시 API 코드 패턴(`IronSource.Agent.init`, `showRewardedVideo` 등)은 8.4 이하 호환 레거시 | DISPUTED | 사용자 입력 코드 그대로 사용하면 9.x에서 동작은 하나 권장되지 않음. 본문에서 신 API 우선 권장 + 레거시는 비교 표로만 언급 |
| 13 | AdMob 미디에이션 시 AdMob 계정 타임존을 UTC로 설정 권장 | VERIFIED | Google AdMob integration 공식 가이드 명시 |

**DISPUTED 처리 요약:**
- #8 (SMART 배너): SKILL.md 6번 섹션에 "주의: 레거시 API의 SMART 사이즈는 신 API에서 제공되지 않는다" 명시.
- #12 (레거시 API): 1번 섹션 "두 가지 API 세대" 표로 정리하고 모든 예제는 신 API 기준으로 작성, 마이그레이션 가이드 링크 안내.

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-09
**수행자**: skill-tester → general-purpose (세션 내 직접 수행)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 보상형 광고 보상 지급 콜백 — OnAdRewarded vs OnAdClosed**
- PASS
- 근거: SKILL.md "4. Rewarded Ad (보상형 광고) — 가장 중요" 섹션 및 "보상 지급 안티패턴 — 절대 금지" 서브섹션, 섹션 10 표 첫 번째 행
- 상세: `OnAdRewarded`에서만 보상 지급 근거 명확(코드 주석 "⭐ 보상 지급 — 반드시 OnAdRewarded에서 처리한다"). `OnAdClosed` 사용 시 "사용자가 끝까지 시청 안 해도 지급됨" 명시. 콜백 순서 비동기 특성 설명까지 포함됨.

**Q2. 신 API 마이그레이션 후 OnApplicationPause 처리 방법**
- PASS
- 근거: SKILL.md "8. 생명주기 관리 (모바일 필수)" 섹션, "3. SDK 초기화" 코드 예시, 섹션 10 표 두 번째 행
- 상세: "신 API를 사용하더라도 OnApplicationPause만은 여전히 `IronSource.Agent.onApplicationPause()`를 호출해야 한다"고 명시. 섹션 3 코드에서도 동일 패턴 확인됨.

**Q3. AdMob 미디에이션 추가 후 iOS 시작 즉시 크래시 원인 및 해결**
- PASS
- 근거: SKILL.md "7-D. iOS Info.plist 필수 추가" 섹션, "2. SDK 설치 — iOS 빌드 사전 설정", 섹션 10 표 네 번째 행
- 상세: `GADApplicationIdentifier` 누락 시 크래시 원인 명시("이는 Google Mobile Ads SDK의 의무 요구사항이다"). XML 코드 예시 및 섹션 10 안티패턴 표에서 중복 경고.

### 발견된 gap

없음.

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 라이브러리 사용법 스킬 — 실사용 필수 카테고리 해당 없음
- 최종 상태: APPROVED

---

> (기존 예정 템플릿, 참고용 보존)
> 본 스킬은 실사용 필수 카테고리(마이그레이션·빌드 설정·워크플로우)에 해당하지 않는 라이브러리 사용법 스킬이다.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (DISPUTED 2건 반영 완료) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-06-09 skill-tester 수행, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 실제 광고 통합 시나리오 질문 2~3개 수행 후 섹션 5 업데이트 (2026-06-09 완료, 3/3 PASS)
- [❌] Unity 6 LTS와의 호환성은 공식 changelog에 명시적 기재가 없음 — LTS 호환은 패키지 일반 정책으로 추정. 실 사용 보고 시 명시 가능 (차단 요인 아님 — 선택 보강)
- [❌] 사용자가 만약 레거시 IronSource.Agent API를 고집한다면 별도 부록 섹션이 필요할 수 있으나 현재는 신 API 우선 정책으로 작성 (차단 요인 아님 — 선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-09 | v1 | 최초 작성 (LevelPlay 9.4.3 기준, 신 API 우선) | skill-creator |
| 2026-06-09 | v1 | 2단계 실사용 테스트 수행 (Q1 보상형 광고 콜백 / Q2 OnApplicationPause 신 API 처리 / Q3 AdMob iOS 크래시 원인) → 3/3 PASS, APPROVED 전환 | skill-tester |
