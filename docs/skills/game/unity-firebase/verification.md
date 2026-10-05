---
skill: unity-firebase
category: game
version: v1
date: 2026-09-26
status: APPROVED
---

# Unity Firebase SDK 통합 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `unity-firebase` |
| 스킬 경로 | `.claude/skills/unity-firebase/SKILL.md` |
| 검증일 | 2026-09-26 (최초 2026-06-10) |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 대상 SDK 버전 | Firebase Unity SDK 13.12.0 (2026-06-04 릴리즈) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (firebase.google.com/docs/unity/*)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/firebase/firebase-unity-sdk)
- [✅] 최신 버전 기준 내용 확인 (2026-06-10, SDK 13.12.0)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (4개 모듈)
- [✅] 코드 예시 작성 (C# Unity MonoBehaviour 기반)
- [✅] 흔한 실수 패턴 정리 (8개)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 (라이브러리 식별) | WebSearch | "Firebase Unity SDK 13 latest version 2026 release notes" | 13.12.0 (2026-06-04) 최신 확인, 13.8.0 StoreKit 2 추가 확인 |
| 조사 (설치) | WebSearch + WebFetch | EDM4U, Unity 6 LTS 호환성, setup 페이지 | UPM/.unitypackage 혼용 금지 원칙, Unity 2021 LTS 이상 요구 |
| 조사 (Analytics) | WebFetch | analytics/unity/events 공식 문서 | LogEvent 시그니처, Parameter 클래스, 권장 이벤트 상수 |
| 조사 (Crashlytics) | WebFetch + WebSearch | crashlytics/unity/customize-crash-reports | LogException/SetCustomKey/SetUserId/Log API 시그니처 + Issue #1381 SetUserId 타이밍 버그 |
| 조사 (Remote Config) | WebFetch + WebSearch | remote-config/unity/get-started | SetDefaultsAsync → FetchAndActivateAsync → GetValue 워크플로우, ConfigSettings 필드명 (MinimumFetchInternalInMilliseconds) |
| 조사 (FCM) | WebFetch + WebSearch | cloud-messaging/unity/get-started + topic-messaging | MessageReceived/TokenReceived 이벤트, SubscribeAsync, 포그라운드/백그라운드 동작 매트릭스, 2000 토픽 제한 |
| 조사 (트러블슈팅) | WebFetch | troubleshooting-faq | dex 한계, minSdk 23 버그, iOS Pod locale 문제, EDM4U 충돌 |
| 교차 검증 | WebSearch | 핵심 클레임 9개, 독립 소스 2개 이상 | VERIFIED 9 / DISPUTED 0 / UNVERIFIED 0 (Unity 6 LTS는 "공식 명시 없음"으로 솔직 표기) |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Firebase Unity Setup 공식 가이드 | https://firebase.google.com/docs/unity/setup | ⭐⭐⭐ High | 2026-06-10 | 1순위, 설치/EDM4U/설정 파일 |
| Firebase Unity Release Notes | https://firebase.google.com/support/release-notes/unity | ⭐⭐⭐ High | 2026-06-10 | 1순위, 13.12.0 / 13.8.0 / 13.0.0 변경사항 |
| Firebase Unity SDK GitHub Releases | https://github.com/firebase/firebase-unity-sdk/releases | ⭐⭐⭐ High | 2026-06-10 | 2순위, 버전 교차 확인 |
| Firebase Analytics Events 가이드 | https://firebase.google.com/docs/analytics/unity/events | ⭐⭐⭐ High | 2026-06-10 | 1순위, LogEvent + Parameter API |
| FirebaseAnalytics Class Reference | https://firebase.google.com/docs/reference/unity/class/firebase/analytics/firebase-analytics | ⭐⭐⭐ High | 2026-06-10 | 1순위, 상수명 (EventAdImpression, EventLevelEnd 등) |
| Crashlytics Unity Customize Crash Reports | https://firebase.google.com/docs/crashlytics/unity/customize-crash-reports | ⭐⭐⭐ High | 2026-06-10 | 1순위, LogException/SetCustomKey API |
| firebase-unity-sdk Issue #1381 | https://github.com/firebase/firebase-unity-sdk/issues/1381 | ⭐⭐ Medium | 2026-06-10 | SetUserId 타이밍 버그 (12.10.1) — 공식 레포 이슈 |
| Remote Config Unity Get Started | https://firebase.google.com/docs/remote-config/unity/get-started | ⭐⭐⭐ High | 2026-06-10 | 1순위, SetDefaultsAsync / FetchAndActivateAsync |
| FCM Unity Get Started | https://firebase.google.com/docs/cloud-messaging/unity/get-started | ⭐⭐⭐ High | 2026-06-10 | 1순위, MessageReceived/TokenReceived |
| FCM Topic Messaging | https://firebase.google.com/docs/cloud-messaging/topic-messaging | ⭐⭐⭐ High | 2026-06-10 | 1순위, 2000 토픽 제한 |
| Firebase Unity Troubleshooting FAQ | https://firebase.google.com/docs/unity/troubleshooting-faq | ⭐⭐⭐ High | 2026-06-10 | 1순위, 빌드 에러 / dex / locale |
| AdMob+Firebase 102 Codelab | https://codelabs.developers.google.com/codelabs/admob-firebase-codelabs-102-unity | ⭐⭐⭐ High | 2026-06-10 | 1순위 보조, A/B 테스트 + Remote Config 광고 빈도 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Firebase Unity SDK 13.12.0, C++ 13.8.0, Android BoM 34.14.0, iOS CocoaPods 12.14.0)
- [✅] deprecated된 패턴을 권장하지 않음 (FetchAsync + ActivateAsync 분리 대신 FetchAndActivateAsync 권장)
- [✅] 코드 예시가 실행 가능한 형태임 (using 문, namespace, MonoBehaviour 구조 완비)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (8개 공식 URL + 검증일 2026-06-10)
- [✅] 핵심 개념 설명 포함 (초기화 → 4개 모듈 → 트러블슈팅 순)
- [✅] 코드 예시 포함 (Analytics/Crashlytics/Remote Config/FCM 각각)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (섹션 8)
- [✅] 흔한 실수 패턴 포함 (섹션 7, 8개 케이스)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (복붙 가능한 C# 클래스 단위)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (광고 노출, IAP 구매, 레벨 완료 등 실 게임 시나리오)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. 핵심 클레임 교차 검증 결과

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|---------|---------|------|
| 1 | Firebase Unity SDK 최신 버전 13.12.0 (2026-06-04 릴리즈) | 공식 Release Notes | GitHub Releases 페이지 | VERIFIED |
| 2 | 최소 Unity 에디터 2021 LTS | 공식 Setup 가이드 | Release Notes 13.0.0 항목 | VERIFIED |
| 3 | UPM과 .unitypackage 혼용 시 EDM4U 충돌 | 공식 Setup Alternative | DeepWiki Dependency Management | VERIFIED |
| 4 | FirebaseAnalytics 권장 이벤트 상수 (EventAdImpression, EventPurchase 등) | 공식 Class Reference | quickstart-unity 샘플 코드 | VERIFIED |
| 5 | Crashlytics.LogException(Exception) 시그니처 | 공식 Customize 가이드 | quickstart-unity 샘플 | VERIFIED |
| 6 | SetUserId 타이밍 버그 (즉시 호출 시 [not set]) | firebase-unity-sdk Issue #1381 | 동일 이슈 워크어라운드 코멘트 | VERIFIED (공식 이슈에서 확인) |
| 7 | Remote Config ConfigSettings.MinimumFetchInternalInMilliseconds 필드명 | quickstart-unity 샘플 + 공식 가이드 | quickstart-unity Issue #1067 (필드명 인용) | VERIFIED (실 필드명 그대로) |
| 8 | FCM 토픽 구독 최대 2000개 | 공식 Topic Messaging 가이드 | 동일 페이지 cross-reference | VERIFIED |
| 9 | FCM 백그라운드에서 notification 메시지는 MessageReceived 호출 안 됨 | 공식 Receive Messages 가이드 | groups.google.com 커뮤니티 토론 | VERIFIED |
| 10 | Unity 6 LTS 공식 호환성 명시 | 없음 (공식 문서 "2021 LTS 이상"만 명시) | — | UNVERIFIED (스킬 본문에 "공식 명시 없음" 솔직 표기) |
| 11 | iOS Pod install locale 에러 해결 (LANG=en_US.UTF-8) | 공식 Troubleshooting FAQ | 동일 페이지 | VERIFIED |
| 12 | Android minSdk 23 dexing 버그 (24 권장) | 공식 Troubleshooting FAQ | 동일 페이지 | VERIFIED |

집계: VERIFIED 11 / DISPUTED 0 / UNVERIFIED 1 (Unity 6 LTS — 본문에 한계 명시)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (Agent 도구 실제 서브에이전트 호출)
**수행 방법**: 2026-09-26 재검증에서 정정된 내용(SDK 버전 13.17.0)을 겨냥한 질문 1개 + 핵심 기능 질문 1개를 general-purpose 서브에이전트에게 "SKILL.md만 근거로 답하라"는 조건으로 위임, 답변과 근거 섹션을 대조 검증

### 실제 수행 테스트 (2026-09-28)

**Q1. 2026-09 신규 설치 시 Firebase Unity SDK 버전**
- ✅ PASS
- 근거: SKILL.md "0. 버전·환경 요구사항" 표 + 검증일 각주
- 상세: "13.17.0"을 정확히 도출. 부수 버전(C++ SDK 등)이 "근사치"라는 스스로의 불확실성 표기까지 인지하고 언급.

**Q2. Firebase 초기화 콜백 ContinueWith vs ContinueWithOnMainThread**
- ✅ PASS
- 근거: SKILL.md "2. 초기화 패턴" 코드 예시 + 주의문
- 상세: "ContinueWithOnMainThread 필수, 일반 ContinueWith는 백그라운드 스레드 실행되어 NullReferenceException 발생" 정확히 인용.

### 발견된 gap (2026-09-28)

- 없음

### 판정 (2026-09-28)

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (라이브러리 사용법 스킬 — 실사용 필수 카테고리 아님)
- 2026-09-26 재검증 정정 내용(SDK 버전 13.12.0→13.17.0)이 실제 서브에이전트 답변에 정확히 반영됨을 확인 → APPROVED 전환

---

### (2026-06-10 시점 기록 — 아래 보존)

**수행일**: 2026-06-10
**수행자**: skill-tester → general-purpose (도메인 에이전트 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Firebase 초기화 — `ContinueWithOnMainThread` vs `ContinueWith` 차이와 올바른 사용법**
- PASS
- 근거: SKILL.md "2. 초기화 패턴" 섹션
- 상세: `ContinueWithOnMainThread`(`Firebase.Extensions`)를 써야 Unity API 콜백 접근 안전. 일반 `ContinueWith`는 백그라운드 스레드 실행 → NullReferenceException 발생 경고 완비. `DontDestroyOnLoad` + `IsReady` 플래그 가드 패턴까지 코드로 제공.

**Q2. Remote Config `ConfigSettings` 필드명 오타(`MinimumFetchInternalInMilliseconds`) + `SetDefaultsAsync` 호출 순서 + GetValue 기본값 반환 원인 4가지**
- PASS
- 근거: SKILL.md "5-1. 기본 패턴" 코드, "5-4. 흔한 실수" 주의 박스, "7-5. Remote Config GetValue가 항상 기본값/빈 값 반환" 섹션
- 상세: 필드명 `Internal`(Interval 아님) 주의 명시, SetDefaultsAsync → SetConfigSettingsAsync → FetchAndActivateAsync 순서 코드 완비, 개발 시 0 / 릴리즈 시 3,600,000 분기 명시, GetValue 원인 4가지(SetDefaults 미호출, Fetch 미호출, 캐시 만료 미도달, Console 파라미터 미게시) 모두 수록.

**Q3. Crashlytics `SetUserId` 초기화 직후 호출 시 "[not set]" 버그 원인과 워크어라운드**
- PASS
- 근거: SKILL.md "4-4. 흔한 실수: SetUserId 타이밍" 섹션
- 상세: `DependencyStatus.Available` 직후 즉시 호출 시 네이티브 레이어 미준비 → [not set] 표시 (Issue #1381, SDK 12.10.1). 워크어라운드: `WaitForSeconds(3f)` IEnumerator 패턴 코드 예시 수록.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md에서 근거 섹션 및 코드 예시를 완전히 도출 가능.

### 2026-09-26 재검증 (본문 사실성만 — references/REFERENCE.md은 재검증 대상 아님)

**수행일**: 2026-09-26
**수행 방법**: WebSearch로 핵심 클레임 3개 재확인 + SKILL.md 자체 답변 확인 질문 2개

- 클레임1. Firebase Unity SDK 최신 버전 13.12.0 — WebSearch 재확인 → **갱신 필요**: 최신은 **13.17.0**(직전 13.16.0에 Firebase AI/FCM/Remote Config 갱신 포함). SKILL.md 버전 표기 전체 갱신
- 클레임2. 초기화 패턴(`FirebaseApp.CheckAndFixDependenciesAsync` + `ContinueWithOnMainThread`) — 재확인 → **VERIFIED** (API 변동 없음)
- 클레임3. Remote Config `SetDefaultsAsync → SetConfigSettingsAsync → FetchAndActivateAsync` 순서 및 필드명 — 재확인 → **VERIFIED** (변동 없음)

**Q1(재검증). "지금(2026-09) Firebase Unity SDK를 새로 설치하면 몇 버전이 뜨나?"**
- SKILL.md 답변 경로: "0. 버전·환경 요구사항" 표 "Firebase Unity SDK: 13.17.0(최신 안정/2026-09 기준)"
- 판정: PASS

**Q2. "Firebase 초기화 콜백에서 Unity UI를 갱신하려는데 ContinueWith와 ContinueWithOnMainThread 중 뭘 써야 하나?"**
- SKILL.md 답변 경로: "2. 초기화 패턴" 주의문 — "ContinueWithOnMainThread는 Firebase.Extensions... 일반 ContinueWith는 백그라운드 스레드 실행되어 NullReferenceException 발생"
- 판정: PASS

### 판정

- agent content test: 3/3 PASS (최초) + 재검증 2/2 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 (content test PASS = APPROVED 가능)
- 버전 번호(13.12.0→13.17.0) 갱신이라는 실질 내용 변경이 있었으므로 PENDING_TEST 전환. 차기 skill-tester 재테스트 시 APPROVED 재검토

---

> (참고용 — 원래 섹션 5 템플릿)
> 이 섹션은 skill-creator 단계에서는 비워둔다. skill-tester가 호출된 후 실제 에이전트 답변 결과로 채워진다.
>
> **상태**: skill-tester 호출 대기 중

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (공식 문서 11개 클레임 VERIFIED, 1개 UNVERIFIED는 본문 명시) |
| 구조 완전성 | ✅ (8개 섹션 + 체크리스트 완비) |
| 실용성 | ✅ (실 게임 시나리오 기반 복붙 가능 코드) |
| 에이전트 활용 테스트 | ✅ (2026-06-10, 3/3 PASS) + ✅ (2026-09-26 자체 재검증, 2/2 PASS) + ✅ (2026-09-28 skill-tester 실제 서브에이전트 재테스트, 2/2 PASS) |
| **최종 판정** | **APPROVED** (2026-09-28 재테스트로 전환) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 실전 질문 2~3개 답변 검증 수행 (2026-06-10 완료, 3/3 PASS / 2026-09-28 재검증 정정분 재테스트 완료, 2/2 PASS)
- [❌] Unity 6 LTS 공식 호환성 명시되면 본문 업데이트 (현재는 "2021 LTS 이상" 정책상 호환으로만 기재) — 차단 요인 아님, 공식 문서 업데이트 시 선택 보강
- [❌] Firebase AI(Gemini) 통합이 게임 시나리오에 필요해지면 별도 섹션 추가 (현재 스킬 범위 밖) — 차단 요인 아님, 사용 요구 발생 시 선택 보강
- [❌] iOS StoreKit 2 트랜잭션(LogAppleTransactionAsync)의 실제 사용 사례 코드 보강 — 차단 요인 아님, 실 사용 사례 발생 시 선택 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-10 | v1 | 최초 작성 — Firebase Unity SDK 13.12.0 기준, Analytics/Crashlytics/Remote Config/FCM 4개 모듈 + EDM4U 설치 + 8개 트러블슈팅 패턴 | skill-creator |
| 2026-06-10 | v1 | 2단계 실사용 테스트 수행 (Q1 Firebase 초기화 ContinueWithOnMainThread / Q2 Remote Config 필드명 오타·SetDefaultsAsync 순서 / Q3 Crashlytics SetUserId 타이밍 버그) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-09-25 | v1 | 구조 개편: 상세 내용 references/REFERENCE.md 분리 (내용 변경 없음) | Claude |
| 2026-09-26 | v1 | 재검증(98개 일괄 재검증 대상, 본문만). Firebase Unity SDK 13.12.0→13.17.0 버전 갱신, 초기화·Remote Config API는 변동 없음 확인 → 실질 내용 변경으로 PENDING_TEST 전환 | Claude Code |
| 2026-09-28 | v1 | 2단계 실사용 테스트 재수행 (Q1 Firebase Unity SDK 버전 / Q2 ContinueWith vs ContinueWithOnMainThread) → 2/2 PASS, APPROVED 전환 | skill-tester |
