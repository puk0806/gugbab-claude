---
skill: unity-6-2d-fundamentals
category: game
version: v1
date: 2026-09-28
status: APPROVED
---

# unity-6-2d-fundamentals 검증 문서

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `unity-6-2d-fundamentals` |
| 스킬 경로 | `.claude/skills/unity-6-2d-fundamentals/SKILL.md` |
| 검증일 | 2026-09-28 (재검증, 이전 2026-09-26 / 최초 2026-06-08) |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Unity 6 공식 매뉴얼·스크립팅 API)
- [✅] 공식 GitHub 2순위 소스 확인 (Unity-Technologies/InputSystem)
- [✅] 최신 버전 기준 내용 확인 (Unity 6.3 LTS 기준, 2025-12-04 출시)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (URP 2D, Slide, Input System, IL2CPP)
- [✅] 코드 예시 작성 (PlayerController, InputHandler, EnemyData, Coroutine)
- [✅] 흔한 실수 패턴 정리 (velocity vs linearVelocity 등 8개)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | Unity 6 What's New 공식 문서 | Slide·CompositeCollider2D·Tile Palette 개선 등 신규 기능 확인 |
| 조사 | WebFetch | Unity 6 Android 요구사항 매뉴얼 | 최소 API Level 23 (Android 6.0) 확인 |
| 조사 | WebFetch | Unity 6 2D Physics Reference | 2D Physics 컴포넌트 구조 확인 |
| 조사 | WebSearch | Unity 6 LTS 출시일·지원 기간 | 6.0=2024-10-17, 6.3=2025-12-04, 2년 LTS |
| 조사 | WebSearch | Rigidbody2D.linearVelocity 변경 | velocity obsolete, linearVelocityX/Y 추가 확인 |
| 조사 | WebSearch | Rigidbody2D.Slide 사용법 | SlideMovement 구조체, useSimulationMove 옵션 확인 |
| 조사 | WebSearch | Input System PlayerInput | 신규 표준, 1.7.x+ 패키지 확인 |
| 조사 | WebSearch | URP 2D 모바일 성능 | Store Actions, Depth Priming, MSAA 권장값 확인 |
| 조사 | WebSearch | IL2CPP vs Mono | iOS는 IL2CPP 강제, 모바일 권장 확인 |
| 조사 | WebSearch | Sprite Atlas V2 | V1 deprecated, V2 기본 확인 |
| 조사 | WebSearch | Cinemachine 3 CinemachineCamera | 클래스명 변경 확인 (VirtualCamera → Camera) |
| 조사 | WebSearch | Build Profiles Window | Unity 6 신규 기능 확인 |
| 조사 | WebSearch | iOS 최소 버전 | iOS 13 공식 최소 확인 |
| 조사 | WebSearch | MonoBehaviour 생명주기 | Awake→OnEnable→Start→FixedUpdate→Update→LateUpdate 확인 |
| 교차 검증 | WebSearch | 11개 핵심 클레임, 독립 소스 2개 이상 | VERIFIED 10 / DISPUTED 1 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Unity 6 What's New | https://docs.unity3d.com/6000.2/Documentation/Manual/WhatsNewUnity6.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Rigidbody2D.linearVelocity API | https://docs.unity3d.com/6000.3/Documentation/ScriptReference/Rigidbody2D-linearVelocity.html | ⭐⭐⭐ High | 2026-06-08 | 공식 스크립팅 API |
| Rigidbody2D.Slide API | https://docs.unity3d.com/6000.2/Documentation/ScriptReference/Rigidbody2D.Slide.html | ⭐⭐⭐ High | 2026-06-08 | 공식 스크립팅 API |
| Unity 6 Android 요구사항 | https://docs.unity3d.com/6000.2/Documentation/Manual/android-requirements-and-compatibility.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Unity 6 iOS 요구사항 | https://docs.unity3d.com/6000.2/Documentation/Manual/ios-requirements-and-compatibility.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Unity 6 Releases & Support | https://unity.com/releases/unity-6/support | ⭐⭐⭐ High | 2026-06-08 | 공식 LTS 정책 |
| Unity 6.3 LTS 블로그 | https://unity.com/blog/unity-6-3-lts-is-now-available | ⭐⭐⭐ High | 2026-06-08 | 공식 출시 발표 |
| Input System 공식 문서 | https://docs.unity3d.com/Packages/com.unity.inputsystem@latest | ⭐⭐⭐ High | 2026-06-08 | 공식 패키지 문서 |
| InputSystem GitHub | https://github.com/Unity-Technologies/InputSystem | ⭐⭐⭐ High | 2026-06-08 | 공식 GitHub |
| Cinemachine 3 문서 | https://docs.unity3d.com/Packages/com.unity.cinemachine@3.1/manual/setup-follow-camera.html | ⭐⭐⭐ High | 2026-06-08 | 공식 패키지 문서 |
| Sprite Atlas V2 Enable | https://docs.unity3d.com/6000.2/Documentation/Manual/sprite/atlas/v2/enable-sprite-atlas-v2.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| MonoBehaviour 실행 순서 | https://docs.unity3d.com/6000.0/Documentation/Manual/execution-order.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Build Profiles 문서 | https://docs.unity3d.com/6000.1/Documentation/Manual/create-build-profile.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| URP Asset 모바일 최적화 | https://developer.android.com/develop/xr/unity/performance/urp-asset-settings | ⭐⭐ Medium | 2026-06-08 | Android 개발자 공식 가이드 |
| Google Play Target API level requirements (유예 신청 자격·방법) | https://support.google.com/googleplay/android-developer/answer/11926878 | ⭐⭐⭐ High | 2026-09-28 | Google Play Console 고객센터 공식 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 교차 검증 클레임 결과

| # | 클레임 | 판정 | 비고 |
|---|--------|------|------|
| 1 | Unity 6.0 LTS는 2024-10-17 출시 | VERIFIED | 공식 IR 발표 + Unity 블로그 |
| 2 | Unity 6.3 LTS는 2025-12-04 출시, 2027-12-04까지 지원 | VERIFIED | 공식 Releases 페이지 + 80lv 보도 |
| 3 | LTS 표준 지원은 2년 | VERIFIED | unity.com/releases/unity-6/support |
| 4 | `Rigidbody2D.velocity`는 Unity 6에서 obsolete, `linearVelocity` 사용 | VERIFIED | 공식 ScriptReference + 커뮤니티 다수 확인 |
| 5 | `linearVelocityX`, `linearVelocityY` 축별 속성 존재 | VERIFIED | 공식 ScriptReference |
| 6 | `Rigidbody2D.Slide()` Unity 6 신규 API, SlideMovement 구조체 사용 | VERIFIED | 공식 ScriptReference + What's New |
| 7 | iOS는 IL2CPP 강제 (Mono 불가) | VERIFIED | Unity 공식 매뉴얼 + 커뮤니티 |
| 8 | Cinemachine 3에서 `CinemachineVirtualCamera` → `CinemachineCamera` 이름 변경 | VERIFIED | 공식 Cinemachine 3.1 API 문서 |
| 9 | Sprite Atlas V1은 deprecated, V2가 Unity 6 기본 | VERIFIED | 공식 매뉴얼 + Unity 6 Sprite Atlas V2 페이지 |
| 10 | Unity 6 Android 최소 지원 API Level은 23 (Android 6.0) | VERIFIED | 공식 Android 요구사항 매뉴얼 |
| 11 | 사용자 입력의 'Minimum Android API Level 26' 클레임 | **DISPUTED** | Unity 6 공식 최소는 API 23. SKILL.md에 주의 표기 추가하여 수정 반영 |
| 12 | Unity 6 iOS 최소는 iOS 13 | VERIFIED | 공식 iOS 요구사항 매뉴얼 |
| 13 | MonoBehaviour 실행 순서 Awake → OnEnable → Start → FixedUpdate → Update → LateUpdate | VERIFIED | 공식 execution-order 매뉴얼 |
| 14 | Awake는 비활성 오브젝트에서 활성될 때까지 호출되지 않음 | VERIFIED | 공식 매뉴얼 |
| 15 | URP 2D Renderer가 모바일 2D 권장 파이프라인 | VERIFIED | URP 공식 + Android 개발자 가이드 |

### 4-2. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 항목은 수정 반영)
- [✅] 버전 정보가 명시되어 있음 (Unity 6.0/6.3 LTS, Cinemachine 3, Addressables 2.x)
- [✅] deprecated된 패턴을 권장하지 않음 (velocity·VirtualCamera·Sprite Atlas V1 모두 비권장 표기)
- [✅] 코드 예시가 실행 가능한 형태임 (PlayerController, InputHandler 등)

### 4-3. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description, examples)
- [✅] 소스 URL과 검증일 명시 (상단 7개 공식 URL + 2026-06-08)
- [✅] 핵심 개념 설명 포함 (LTS·URP·IL2CPP·Slide·Input System 등)
- [✅] 코드 예시 포함 (C# 코드 5개)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (섹션 11 의사결정 표)
- [✅] 흔한 실수 패턴 포함 (섹션 10, 8개)

### 4-4. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-5. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-08 skill-tester 수행, 2026-09-28 재검증 정정분 재테스트 완료, 2026-09-28 2차 실제 재테스트 완료)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 보완 불필요)

---

## 5. 테스트 진행 기록

### [2026-09-28] skill-tester 2차 실제 재테스트 (real Agent 호출)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (Agent 도구로 독립 서브에이전트 2회 실제 비동기 호출, 완료 로그 확인)
**수행 방법**: 아래 "[2026-09-28] 선택 보강 반영" 절의 정정 내용(Target API 36 유예 적용 대상)을 겨냥한 질문 1개 + 핵심 Breaking Change(velocity·Cinemachine) 질문 1개를 각각 독립 general-purpose 서브에이전트에 위임. 짝 스킬 `game/app-store-submission`에도 동일한 유예 자격 질문을 별도 서브에이전트에 위임해 두 스킬 서술이 일치하는지 교차검증.

**Q1. "완전히 새로운 Unity 2D 모바일 앱을 2026-09에 처음 제출하는데 Target API Level을 몇으로 맞춰야 하고, 유예 신청이 가능한가? 기존 앱 업데이트와는 어떻게 다른가?"**
- ✅ PASS
- 근거: SKILL.md "8-2. Android" 표 "Target API Level" 행 + "주의(2026-09 갱신)" 문단
- 상세: 서브에이전트가 "신규 앱은 API 36 필수·유예 불가 / 기존 앱 업데이트만 Play Console Policy status 페이지에서 2026-11-01까지 연장 신청 가능"을 정확히 구분해 답변.
- **교차검증**: 짝 스킬 `app-store-submission` SKILL.md에 동일 취지 질문을 위임한 결과와 완전히 일치 — 두 스킬 모두 "신규 앱 불가·기존 앱 업데이트만 Policy status 페이지 신청, 2026-11-01까지 연장"으로 서술 모순 없음.

**Q2. "오래된 튜토리얼을 보고 `rb.velocity`를 쓰려 하는데 Unity 6에서 문제되는가? 카메라 추적은 어떤 Cinemachine 클래스를 쓰는가?"**
- ✅ PASS
- 근거: SKILL.md "3-1. Rigidbody2D.velocity → linearVelocity 변경" + "7. Cinemachine 3" 표 + "10. 흔한 실수 패턴"
- 상세: `rb.linearVelocity` 교체 및 `CinemachineVirtualCamera` → `CinemachineCamera`(Tracking Target) 변경을 정확히 도출. 세 섹션(3-1·7·10) 간 모순 없이 일관됨을 서브에이전트가 직접 확인.

### 발견된 gap (2차 재테스트)

- 경미: Policy status 페이지 내 구체적 신청 UI 절차, 유예 신청 횟수 제한이 SKILL.md에 없음 — 차단 요인 아님, 선택 보강

### 판정 (2차 재테스트)

- agent content test: 2/2 PASS (+ 짝 스킬 `app-store-submission`과 교차검증 결과 일치 확인)
- verification-policy 분류: 해당 없음 (라이브러리·API 패턴 스킬 — content test로 충분)
- **최종 상태: APPROVED**

---

### [2026-09-28] 선택 보강 반영

- **반영 내용**: Target API 36 유예(2026-11-01까지) 적용 대상 명확화 — 신규 앱 제출에는 유예가 없고, 이미 게시된 기존 앱을 업데이트할 계획이 있는 경우에만 Play Console Policy status 페이지에서 신청 가능함을 SKILL.md "8-2. Android" 표와 주의문에 추가.
- **근거**: Google Play Console 고객센터 공식 문서 "Target API level requirements for Google Play apps" — https://support.google.com/googleplay/android-developer/answer/11926878 (원문: "New apps and app updates must target Android 16 (API level 36) or higher to be submitted to Google Play"; "If you plan to update this app to a higher target API level, you can submit an extension request... until November 1, 2026")

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (Agent 도구 실제 서브에이전트 호출)
**수행 방법**: 2026-09-26 재검증에서 정정된 내용(Google Play Target API 36, Unity 6.0 LTS 종료 임박)을 겨냥한 실전 질문 2개를 general-purpose 서브에이전트에게 "SKILL.md만 근거로 답하라"는 조건으로 위임, 답변과 근거 섹션을 대조 검증

### 실제 수행 테스트

**Q1. 2026-09 지금 Google Play 신규 제출 시 Target API Level**
- ✅ PASS
- 근거: SKILL.md "8-2. Android" 표 + 주의 문구 (Target API Level 36 필수, 2026-08-31 시행)
- 상세: 에이전트가 "Target API Level 36(Android 16)"을 정확히 도출. Minimum API Level(23)과 Target API Level(36)을 혼동하지 않고 구분해 답변. 다만 유예(2026-11-01)가 신규/기존 앱 중 어디에 적용되는지 문구가 약간 모호하다는 평가를 남김(경미, 차단 요인 아님).

**Q2. Rigidbody2D.velocity obsolete 대응**
- ✅ PASS
- 근거: SKILL.md "3-1. Rigidbody2D.velocity → linearVelocity 변경" 섹션 + 코드 예시 + 섹션 10 흔한 실수 표
- 상세: `rb.linearVelocity`로 교체, `linearVelocityX`/`linearVelocityY` 축별 접근까지 정확히 도출. anti-pattern(레거시 velocity 잔존 자료)에 대한 주의문도 인용함.

### 발견된 gap

- 없음(경미한 문구 모호성 1건: Target API 유예 대상 범위 — 차단 요인 아님, 문장 위치 재배치 정도의 선택 보강)

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (라이브러리 사용법·API 패턴 스킬 — 실사용 필수 카테고리 아님)
- 2026-09-26 재검증에서 반영한 정정 내용(Target API 36, Unity 6.0 LTS 종료 임박)이 실제 서브에이전트 답변에 정확히 반영됨을 확인 → APPROVED 전환

---

> (2026-09-26 시점 기록 — 아래 보존)

## 5-구. (2026-09-26 시점) 테스트 진행 기록

**수행일**: 2026-06-08
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Unity 6에서 `rb.velocity` 경고 수정 방법 및 축별 접근법**
- PASS
- 근거: SKILL.md "3. Unity 6 Physics 2D — Breaking Change > 3-1" 섹션 (줄 57-72)
- 상세: `rb.linearVelocity = new Vector2(5f, 0f)` 수정법 + `rb.linearVelocityX = 5f` 축별 접근이 코드 예시로 명시됨. 섹션 10 흔한 실수 표에도 `rb.velocity` anti-pattern 명시.

**Q2. Input System PlayerInput Jump 이벤트 구독 패턴 — OnEnable/OnDisable 쌍 필수 여부**
- PASS
- 근거: SKILL.md "6. Input System > 6-2 코드 예시 — Invoke C Sharp Events" 섹션 (줄 165-205) + "9-1 MonoBehaviour 생명주기" 섹션 (줄 280-297)
- 상세: Awake에서 액션 레퍼런스 캐싱, OnEnable에서 구독(`performed +=`), OnDisable에서 해제(`performed -=`) 쌍 패턴이 완전한 코드로 제시됨. 생명주기 표에서 OnEnable/OnDisable 용도 명시.

**Q3. iOS vs Android 빌드 설정 차이 + IL2CPP 강제 플랫폼 판단**
- PASS
- 근거: SKILL.md "8. 모바일 빌드 설정 체크리스트 > 8-2 Android, 8-3 iOS, 8-4 IL2CPP vs Mono" 섹션 (줄 235-274)
- 상세: iOS는 IL2CPP 강제(Mono 불가), Android는 IL2CPP 권장 + ARM64 단독 + Minimum API Level 23. IL2CPP vs Mono 비교표로 판단 근거 완비. 섹션 10에 "모바일 Mono 사용 → IL2CPP + ARM64" anti-pattern 명시.

### 발견된 gap

없음.

### 2026-09-26 재검증

**수행일**: 2026-09-26
**수행 방법**: WebSearch로 핵심 클레임 3개 재확인 + SKILL.md 자체 답변 확인 질문 2개

- 클레임1. Google Play Target API 요구사항 — WebSearch 재확인 → **DISPUTED(구버전)**: 2026-08-31부터 신규 앱·업데이트는 **API 36(Android 16)** 필수(기존 앱은 API 35 이상 유지, 유예 시 2026-11-01까지). SKILL.md는 기존에 "최신 (35/36 지원)"으로 모호하게 서술 → 구체적 수치·시행일로 수정
- 클레임2. Unity 6 LTS 최신 상태 — WebSearch 재확인 → **갱신 필요**: Unity 6.0 LTS 지원이 2026-10 종료 임박, 2026-09-01 Unity 6.6(비LTS) 출시, 6.7 LTS 2026년 내 예정 → SKILL.md 섹션 1에 주의문 추가, 6.3 LTS 사용 권장 강화
- 클레임3. Rigidbody2D.linearVelocity / Slide() API — WebSearch 재확인 → **VERIFIED** (2026-08-12 빌드 공식 문서 기준 시그니처·동작 변동 없음)

**Q1(재검증). "2026년 9월 지금 Android 앱을 Google Play에 신규 제출하려면 Target API Level을 몇으로 잡아야 하나?"**
- SKILL.md 답변 경로: 8-2절 표 "Target API Level: API 36(Android 16) 필수 — 2026-08-31부터 신규 앱·업데이트에 요구"
- 판정: PASS (갱신 후 정확한 답 도출. 갱신 전 "최신 (35/36)" 표현으로는 정확한 숫자 답변 불가)

**Q2. "지금 신규 Unity 2D 모바일 프로젝트를 시작하는데 Unity 6.0 LTS를 써도 되나?"**
- SKILL.md 답변 경로: 섹션 1 주의문 "Unity 6.0 LTS는 2026-10 지원 종료 임박 — 신규·진행 중 프로젝트는 6.3 LTS 사용 권장"
- 판정: PASS

### 판정

- agent content test: 3/3 PASS (최초) + 재검증 2/2 PASS
- verification-policy 분류: 라이브러리 사용법·API 패턴 (해당 없음 — 실사용 필수 카테고리 아님)
- Google Play Target API 구체 수치 갱신 + Unity LTS 상태 갱신이라는 실질 내용 변경이 있었으므로 PENDING_TEST 전환. 차기 skill-tester 재테스트 시 APPROVED 재검토

---

> 아래는 참고용 원본 템플릿 (skill-tester 실행 전)

(skill-tester 실행 완료)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-06-08) + ✅ (2/2 PASS, 2026-09-26 자체 재검증) + ✅ (2/2 PASS, 2026-09-28 skill-tester 2차 실제 서브에이전트 재테스트, 짝 스킬 교차검증 일치) |
| **최종 판정** | **APPROVED** (2026-09-28 skill-tester 2차 실제 재테스트 2/2 PASS — Target API 36 유예 대상 정정분 및 짝 스킬 `app-store-submission` 서술 일치 확인 완료) |

---

## 7. 개선 필요 사항

- [✅] (해결됨) 사용자 입력의 'Android API Level 26' 클레임 — Unity 6 공식 최소는 API 23. SKILL.md 섹션 8-2에 주의 박스로 명시 반영
- [✅] skill-tester 호출 및 섹션 5·6 업데이트 완료 (2026-06-08, 3/3 PASS, APPROVED 전환 / 2026-09-28 재검증 정정분 재테스트 완료, 2/2 PASS / 2026-09-28 2차 실제 재테스트 완료, 2/2 PASS + 짝 스킬 교차검증 일치)
- [✅] Target API 36 유예(2026-11-01) 적용 대상이 신규 앱도 포함되는지 문구 명확화 (2026-09-28 반영 — Google Play Console 고객센터 공식 문서로 확인: 신규 앱은 유예 불가, 기존 앱 업데이트만 대상)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-08 | v1 | 최초 작성. Unity 6.3 LTS 기준, 11개 핵심 클레임 교차 검증 완료. Android API Level 26 → 23 수정 반영 | skill-creator |
| 2026-06-08 | v1 | 2단계 실사용 테스트 수행 (Q1 velocity→linearVelocity Breaking Change / Q2 Input System PlayerInput 이벤트 구독 패턴 / Q3 iOS vs Android 빌드 설정 + IL2CPP 강제 판단) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-09-26 | v1 | 재검증(98개 일괄 재검증 대상). Google Play Target API 36 요구(2026-08-31 시행) 반영, Unity 6.0 LTS 종료 임박·6.6/6.7 LTS 갱신, Rigidbody2D API는 변동 없음 확인 → 실질 내용 변경으로 PENDING_TEST 전환 | Claude Code |
| 2026-09-28 | v1 | 2단계 실사용 테스트 재수행 (Q1 Google Play Target API 36 / Q2 Rigidbody2D.velocity obsolete 대응) → 2/2 PASS, APPROVED 전환 | skill-tester |
| 2026-09-28 | v1 | 재검증(선택 보강). Target API 36 유예 적용 대상 명확화(신규 앱 불가·기존 앱 업데이트만 가능) — Google Play Console 고객센터 공식 문서 확인 후 SKILL.md 8-2절 갱신 → 실질 내용 추가로 PENDING_TEST 전환 | Claude Code |
| 2026-09-28 | v1 | 2단계 실사용 테스트 2차 재수행 (Q1 신규앱 유예 대상 + 짝 스킬 app-store-submission 교차검증 / Q2 rb.velocity obsolete·Cinemachine 3 클래스명) → 2/2 PASS, 짝 스킬 서술 일치 확인, APPROVED 전환 | skill-tester |
