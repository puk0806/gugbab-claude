---
skill: unity-live-ops
category: game
version: v1
date: 2026-06-10
status: APPROVED
---

# unity-live-ops — 검증 기록

> Unity 6 LTS + C# 모바일 게임 라이브 운영(Live Ops) 스킬의 작성·검증 기록.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `unity-live-ops` |
| 스킬 경로 | `.claude/skills/game/unity-live-ops/SKILL.md` |
| 검증일 | 2026-06-10 |
| 검증자 | skill-creator (Claude) |
| 스킬 버전 | v1 |
| 대상 기술 | Unity 6 LTS, Addressables 2.x, Firebase Unity SDK (Remote Config / Crashlytics / FCM), Cloud Content Delivery, Kubernetes / Railway / Render / Fly.io |

---

## 1. 작업 목록 (Task List)

- [✅] Unity Cloud Content Delivery 공식 문서 (UGS Manual) 확인
- [✅] Addressables 2.7 / 2.8 — CCD Configure / Publish 페이지 확인
- [✅] Firebase Remote Config Unity Get Started 페이지 확인
- [✅] Firebase Crashlytics Unity 페이지 확인
- [✅] Kubernetes Rolling Update 공식 튜토리얼 확인
- [✅] Railway Healthchecks 공식 문서 확인
- [✅] Fly.io Seamless Deployments 공식 문서 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (CCD bucket·badge, RC defaults·conditions, maintenance polling, 지수 백오프)
- [✅] 흔한 실수 8종 정리
- [✅] 코드 예시 작성 (C# Addressables / Firebase RC / WebRequest retry / Crashlytics)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "Unity Cloud Content Delivery CCD Addressables setup documentation 2026" | 공식 문서 6개 URL 수집 |
| 조사 | WebSearch | "Firebase Remote Config Unity SDK FetchAndActivateAsync best practices" | get-started + API reference + migration blog 확인 |
| 조사 | WebSearch | "Unity 6 LTS Addressables Remote Profile CCD bucket configuration" | LoadPath URL 포맷 / Profile 설정 절차 수집 |
| 조사 | WebFetch | docs.unity3d.com/.../addressables@2.7/manual/ccd-configure.html | CcdManager, BuildPath/LoadPath, URL 포맷 본문 추출 |
| 조사 | WebFetch | firebase.google.com/docs/remote-config/unity/get-started | SetDefaultsAsync / FetchAndActivateAsync / OnConfigUpdateListener 코드 추출 |
| 조사 | WebFetch | docs.unity.com/.../ccd/manual/UnityCCDWalkthrough | Bucket / Badge / Release / Promotion 워크플로 추출 |
| 조사 | WebSearch | "Blue-Green deployment Railway Render zero downtime REST API" | Railway healthcheck 자동 zero-downtime 확인, Render는 비공식 |
| 조사 | WebSearch | "Kubernetes Rolling Update strategy zero downtime deployment" | maxSurge/maxUnavailable + readiness + preStop 패턴 확인 |
| 조사 | WebSearch | "UnityWebRequest exponential backoff retry pattern 503 502" | 502/503 transient 분류 + jitter 필요성 확인 |
| 조사 | WebSearch | "Firebase Remote Config force update minimum version pattern" | min_client_version + soft/hard update 패턴 확인 |
| 조사 | WebSearch | "Fly.io rolling deployment health check zero downtime" | rolling 기본 + max_unavailable 확인 |
| 조사 | WebSearch | "Firebase Crashlytics Unity SDK setup non-fatal exception logging" | Crashlytics.LogException + ReportUncaughtExceptionsAsFatal 확인 |
| 조사 | WebSearch | "Addressables CCD cache bundle expiration CRC verification" | UseAssetBundleCrcForCachedBundles + 캐시 만료 동작 확인 |
| 조사 | WebSearch | "Firebase Remote Config minimumFetchIntervalInSeconds 12 hours" | 기본 12h = 43,200,000ms 확인 |
| 조사 | WebSearch | "CcdManager Addressables Environment BucketId Badge static properties" | static 클래스 + EnvironmentName/BucketId/Badge 3속성 확인, 초기화 순서 주의사항 확인 |
| 조사 | WebSearch | "Firebase Remote Config conditions targeting platform country" | App version / Platform / Country / Languages / random percentile / audience 컨디션 확인 |
| 교차 검증 | WebSearch | 8개 핵심 클레임 × 독립 소스 2~3개 | VERIFIED 8 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Unity Docs — CCD Walkthrough | https://docs.unity.com/ugs/en-us/manual/ccd/manual/UnityCCDWalkthrough | ⭐⭐⭐ High | 2026-06-10 | 공식 |
| Unity Docs — Addressables 2.7 Configure CCD | https://docs.unity3d.com/Packages/com.unity.addressables@2.7/manual/ccd-configure.html | ⭐⭐⭐ High | 2026-06-10 | 공식 패키지 매뉴얼 |
| Unity Docs — Addressables 2.8 Publish CCD | https://docs.unity3d.com/Packages/com.unity.addressables@2.8/manual/ccd-publish.html | ⭐⭐⭐ High | 2026-06-10 | 공식 |
| Unity Docs — Addressables 2.5 AddressablesCCD | https://docs.unity3d.com/Packages/com.unity.addressables@2.5/manual/AddressablesCCD.html | ⭐⭐⭐ High | 2026-06-10 | CcdManager API 명세 |
| Unity Docs — UseAssetBundleCrcForCachedBundles | https://docs.unity3d.com/Packages/com.unity.addressables@1.20/api/UnityEditor.AddressableAssets.Settings.GroupSchemas.BundledAssetGroupSchema.UseAssetBundleCrcForCachedBundles.html | ⭐⭐⭐ High | 2026-06-10 | API 레퍼런스 |
| Firebase Docs — Remote Config Unity Get Started | https://firebase.google.com/docs/remote-config/unity/get-started | ⭐⭐⭐ High | 2026-06-10 | 공식 |
| Firebase Docs — Remote Config Loading | https://firebase.google.com/docs/remote-config/loading | ⭐⭐⭐ High | 2026-06-10 | fetch 전략 |
| Firebase Docs — Remote Config Parameters & Conditions | https://firebase.google.com/docs/remote-config/parameters | ⭐⭐⭐ High | 2026-06-10 | 컨디션 종류 |
| Firebase Docs — FirebaseRemoteConfig Unity API | https://firebase.google.com/docs/reference/unity/class/firebase/remote-config/firebase-remote-config | ⭐⭐⭐ High | 2026-06-10 | 12h 기본 fetch 간격 |
| Firebase Blog — Realtime Remote Config | https://firebase.blog/posts/2023/06/feature-flags-with-real-time-remote-config | ⭐⭐⭐ High | 2026-06-10 | 공식 블로그 |
| Firebase Docs — Crashlytics Unity Get Started | https://firebase.google.com/docs/crashlytics/unity/get-started | ⭐⭐⭐ High | 2026-06-10 | 공식 |
| Firebase Docs — Crashlytics Customize Unity | https://firebase.google.com/docs/crashlytics/unity/customize-crash-reports | ⭐⭐⭐ High | 2026-06-10 | LogException, ReportUncaughtExceptionsAsFatal |
| Firebase Docs — FCM Unity Receive | https://firebase.google.com/docs/cloud-messaging/unity/receive | ⭐⭐⭐ High | 2026-06-10 | 공식 |
| Kubernetes Docs — Rolling Update | https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/ | ⭐⭐⭐ High | 2026-06-10 | 공식 튜토리얼 |
| Railway Docs — Healthchecks | https://docs.railway.com/deployments/healthchecks | ⭐⭐⭐ High | 2026-06-10 | 공식 |
| Fly.io Docs — Seamless Deployments | https://fly.io/docs/blueprints/seamless-deployments/ | ⭐⭐⭐ High | 2026-06-10 | 공식 |
| Fly.io Docs — Health Checks | https://fly.io/docs/reference/health-checks/ | ⭐⭐⭐ High | 2026-06-10 | 공식 |
| AWS SDK — Retry Behavior | https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html | ⭐⭐⭐ High | 2026-06-10 | 지수 백오프 + jitter 패턴 표준 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음 (Addressables 2.5~2.8 / Firebase Unity SDK / K8s / Fly.io / Railway 공식 문서 직접 대조)
- [✅] 버전 정보 명시 (Unity 6 LTS / Addressables 2.x / Firebase Unity SDK / 12h 기본 fetch interval = 43,200,000ms)
- [✅] deprecated 패턴 권장 없음 (FetchAsync + ActivateFetched 같은 구 SDK 형태는 미사용, FetchAndActivateAsync + OnConfigUpdateListener 권장)
- [✅] 코드 예시가 실행 가능한 형태 (실제 API 시그니처 일치)

### 4-2. 핵심 클레임 교차 검증

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|----------|----------|------|
| 1 | CcdManager는 static 클래스이며 EnvironmentName/BucketId/Badge 3속성을 가진다 | Addressables 2.5 manual | Addressables 2.7 ccd-configure | VERIFIED |
| 2 | CcdManager 설정은 첫 Addressables 호출 이전에 끝내야 한다 | Addressables 2.5 manual | Unity Discussions / 2.8 publish | VERIFIED |
| 3 | Firebase Remote Config 기본 minimumFetchInterval은 12시간 | Firebase RC Unity Get Started | FirebaseRemoteConfig Unity API Reference | VERIFIED |
| 4 | SetDefaultsAsync는 fetch 이전에 호출해야 안전 | Firebase RC Unity Get Started | Firebase RC Loading Strategies | VERIFIED |
| 5 | Kubernetes RollingUpdate `maxUnavailable: 0 + maxSurge: 1`으로 진짜 zero-downtime | Kubernetes 공식 튜토리얼 | OneUptime 가이드(보강) | VERIFIED |
| 6 | Railway는 헬스체크 200 통과 후에만 새 배포 활성화 | Railway Healthchecks 공식 | Railway Node Express 가이드 | VERIFIED |
| 7 | Fly.io 기본 배포는 rolling, max_unavailable로 동시 교체 수 제어 | Fly.io Seamless Deployments | Fly.io Health Checks | VERIFIED |
| 8 | Crashlytics.LogException은 non-fatal로 보고되며 다음 fatal 또는 재시작 시 전송 | Firebase Crashlytics Unity Customize | Firebase Crashlytics Unity Get Started | VERIFIED |

**합계: VERIFIED 8 / DISPUTED 0 / UNVERIFIED 0**

### 4-3. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (`> 소스:` + `> 검증일: 2026-06-10`)
- [✅] 핵심 개념 설명 포함 (CCD/RC/Maintenance/배포/Force Update/이벤트/모니터링 7대 영역)
- [✅] 코드 예시 포함 (C# Addressables / FirebaseRemoteConfig / UnityWebRequest retry / Crashlytics)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (Soft vs Hard update, Badge vs Release URL, /health vs /health/deep 등)
- [✅] 흔한 실수 8종 패턴 포함

### 4-4. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (`SetDefaultsAsync` 키 목록, retry 함수 전체, K8s strategy yaml 등)
- [✅] 지나치게 이론적이지 않고 실용적 예시 포함
- [✅] 범용적으로 사용 가능 (특정 게임 프로젝트에 종속되지 않음, 다만 Firebase + UGS + 자체 REST API 조합을 가정)

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-10 skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (3/3 PASS, 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-10
**수행자**: skill-tester → general-purpose (세션 registry 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 점검 모드 진입 후 앱 재시작 없이 자동 복귀 구현 방법**
- PASS
- 근거: SKILL.md "3. 점검 모드 (Maintenance Mode)" 섹션 전체 (3-1 키 설계, 3-2 BootAsync 흐름, 3-3 자동 복귀 3가지, 3-4 503 graceful 처리)
- 상세: is_maintenance/maintenance_message/maintenance_end_utc 키 설계, BootAsync → StartMaintenancePolling, 폴링(30초)/FCM/OnConfigUpdateListener 3가지 복귀 전략, 서버 503 → RC 재fetch → 점검 화면 변환 패턴까지 모두 SKILL.md에 완전히 존재. 흔한 실수 #8("폴링 없음" anti-pattern)도 명시.

**Q2. REST API 서버 롤링 배포 중 클라이언트 502/503 처리**
- PASS
- 근거: SKILL.md "4-4. 게임 클라이언트 재시도 로직 — 지수 백오프" 섹션
- 상세: GetWithRetryAsync 전체 코드 포함 — transient(502/503/504/ConnectionError)만 재시도, maxRetry=5, 지수 백오프(2^attempt, 최대 30초) + jitter ±20%, 4xx는 즉시 ApiException throw. 흔한 실수 #4("재시도 부재") anti-pattern도 명시.

**Q3. Firebase Remote Config SetDefaultsAsync vs FetchAndActivateAsync 호출 순서와 이유**
- PASS
- 근거: SKILL.md "2-1. 기본 골격" 섹션 + "8. 흔한 실수 8종" #2
- 상세: SetDefaultsAsync → SetConfigSettingsAsync → FetchAndActivateAsync 순서 코드 명시, "서버 다운/네트워크 실패 시 안전망" 이유 설명, 흔한 실수 #2("기본값 누락 → 크래시, SetDefaultsAsync는 fetch보다 먼저") anti-pattern 명확히 경고. MinimumFetchIntervalInMilliseconds 개발/운영 분기 패턴도 존재.

### 발견된 gap

없음. 3/3 모두 SKILL.md 내용으로 완전한 답변 가능.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (game/라이브 운영 패턴 — content test로 충분)
- 최종 상태: APPROVED

---

> (아래는 기존 예정 템플릿 참고용으로 보존)

### 테스트 케이스 1: (완료)

**입력 (질문/요청):**
```
"Unity 6 LTS 게임에서 점검 모드 진입·종료를 어떻게 구현해야 하나요? 사용자가 앱을 재시작하지 않아도 자동 복귀해야 합니다."
```

**기대 결과:**
```
Remote Config의 is_maintenance + maintenance_message + maintenance_end_utc 키 설계,
부팅 시 BootAsync 흐름, 30~60초 폴링 또는 FCM 푸시 또는 OnConfigUpdateListener로 자동 복귀,
서버 503 응답을 graceful 처리하는 패턴까지 안내.
```

**실제 결과:** PASS — 모든 기대 항목이 SKILL.md 섹션 3에 존재.

**판정:** PASS

---

### 테스트 케이스 2: (완료)

**입력:**
```
"REST API 서버 롤링 배포 중에 게임 클라이언트가 502/503을 받았을 때 어떻게 처리해야 하나요?"
```

**기대 결과:** 지수 백오프 + jitter, transient(502/503/504/네트워크)만 재시도, 4xx는 즉시 실패, maxRetry 5회 예시 등.

**실제 결과:** PASS — GetWithRetryAsync 코드 포함 섹션 4-4에 완전히 존재.

**판정:** PASS

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 핵심 클레임 교차 검증 | ✅ (VERIFIED 8/8) |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-06-10) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 실전 질문 2~3개를 통한 agent content test 수행 (2026-06-10 완료, 3/3 PASS)
- [✅] verification.md 섹션 5(테스트 진행 기록) 실제 결과로 갱신 (2026-06-10 완료)
- [❌] 사용자 실 프로젝트(자체 REST + UGS + Firebase 혼합)에서 적용해보고 누락 패턴 보강 (필요 시) — 차단 요인 아님, 선택 보강 항목. APPROVED 이후 실도입 시점에 수행.
- [❌] Unity 6 LTS에서 Addressables 패키지 최신 안정 버전이 2.8 또는 그 이후로 올라갈 경우 LoadPath URL 포맷·CcdManager 동작 변동 여부 재검증 — 차단 요인 아님, 버전 업 시점에 재검증 권장.

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-10 | v1 | 최초 작성 (Unity 6 LTS / Addressables 2.x / Firebase Unity SDK / K8s / Railway / Fly.io 기반) | skill-creator |
| 2026-06-10 | v1 | 2단계 실사용 테스트 수행 (Q1 점검 모드 자동 복귀 / Q2 롤링 배포 중 502/503 처리 / Q3 RC SetDefaultsAsync 호출 순서) → 3/3 PASS, APPROVED 전환 | skill-tester |
