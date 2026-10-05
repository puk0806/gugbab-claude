---
skill: app-store-submission
category: game
version: v1
date: 2026-09-28
status: APPROVED
---

# 스킬 검증 문서 — game/app-store-submission

> Unity 2D 모바일 게임을 Google Play / App Store에 제출하기 위한 절차, 필수 에셋 사양, 심사 기준 체크리스트.
> Google Play Console (2026) + App Store Connect (iOS 26 SDK / Xcode 26 기준).

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `app-store-submission` |
| 스킬 경로 | `.claude/skills/app-store-submission/SKILL.md` |
| 검증일 | 2026-09-28 (재검증, 이전 2026-09-26 / 최초 2026-06-10) |
| 검증자 | skill-creator (token 한도로 verification.md 분리 작성) |
| 스킬 버전 | v1 |
| 대상 | Google Play Console (2026) / App Store Connect (iOS 26 SDK) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (developer.android.com, developer.apple.com)
- [✅] Google Play 요구사항 확인 (Target API Level, AAB 형식, ARM64, Data Safety)
- [✅] App Store 요구사항 확인 (Xcode 26 SDK 의무, Bundle ID, App Privacy, 연령 등급)
- [✅] 에셋 사양 확인 (아이콘 크기, 스크린샷 해상도 — 특히 iPhone 6.9" 신규 기준)
- [✅] 심사 거절 사유 확인 (Apple Guideline 번호별, Google Play 빈출 사유)
- [✅] 버전 관리 패턴 확인 (versionCode / CFBundleVersion)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "Google Play Target API Level 2025 2026 requirements" | API 35 (2025-08-31~), API 36 (2026-08-31~) 확인 |
| 조사 | WebSearch | "Google Play AAB mandatory Android App Bundle requirement" | 2021-08 신규앱, 2021-11 업데이트 의무 확인 |
| 조사 | WebSearch | "App Store Connect screenshot requirements 2026 iPhone 6.9 inch" | iPhone 6.9" 1320×2868 신규 1순위 확인 |
| 조사 | WebSearch | "App Store subtitle character limit official Apple" | 30자 이내 확정 (80자 주장 DISPUTED → 정정) |
| 조사 | WebSearch | "Apple Xcode 26 iOS 26 SDK minimum requirement App Store upload 2026" | 2026-04-28 이후 iOS 26 SDK / Xcode 26 빌드 의무 확인 |
| 조사 | WebSearch | "App Store age rating update 2025 new categories 13+ 16+ 18+" | 연령 등급 개편 (4+/9+/13+/16+/18+), 2026-01-31 데드라인 확인 |
| 조사 | WebSearch | "iPhone 5.5 inch screenshot App Store required 2024 2025" | 5.5" 더 이상 필수 아님 확인 (DISPUTED → 정정) |
| 조사 | WebSearch | "Google Play Data Safety section mandatory deadline" | 2022-07-20부터 의무 확인 |
| 조사 | WebSearch | "Play App Signing upload key app signing key Google KMS" | Play App Signing 구조 및 권장 이유 확인 |
| 조사 | WebSearch | "App Store Review Guideline 3.1.1 restore purchases required" | Guideline 3.1.1 복원 버튼 필수 확인 |
| 교차 검증 | WebSearch | 14개 핵심 클레임 × 공식 문서 | VERIFIED 12 / DISPUTED 2 (정정 반영) / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 |
|--------|-----|--------|------|
| Google Play Target SDK 요구사항 | https://developer.android.com/google/play/requirements/target-sdk | ⭐⭐⭐ High | 2026-06-10 |
| Google Play 64-bit 요구사항 | https://developer.android.com/google/play/requirements/64-bit | ⭐⭐⭐ High | 2026-06-10 |
| Google Play 아이콘 사양 | https://developer.android.com/distribute/google-play/resources/icon-design-specifications | ⭐⭐⭐ High | 2026-06-10 |
| Google Play Data Safety | https://support.google.com/googleplay/android-developer/answer/10787469 | ⭐⭐⭐ High | 2026-06-10 |
| Play App Signing 공식 | https://support.google.com/googleplay/android-developer/answer/9842756 | ⭐⭐⭐ High | 2026-06-10 |
| App Store Connect 스크린샷 사양 | https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/ | ⭐⭐⭐ High | 2026-06-10 |
| App Store Connect 앱 정보(글자수) | https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/ | ⭐⭐⭐ High | 2026-06-10 |
| App Store Review Guidelines | https://developer.apple.com/app-store/review/guidelines/ | ⭐⭐⭐ High | 2026-06-10 |
| App Privacy Details | https://developer.apple.com/app-store/app-privacy-details/ | ⭐⭐⭐ High | 2026-06-10 |
| Apple 연령 등급 업데이트 | https://developer.apple.com/news/upcoming-requirements/?id=07242025a | ⭐⭐⭐ High | 2026-06-10 |
| Apple SDK 최소 요구사항 (2026-04-28) | https://developer.apple.com/news/upcoming-requirements/?id=02212025a | ⭐⭐⭐ High | 2026-06-10 |
| Unity PlayerSettings API | https://docs.unity3d.com/ScriptReference/PlayerSettings.Android-bundleVersionCode.html | ⭐⭐⭐ High | 2026-06-10 |
| Google Play Target API level requirements (유예 신청 자격·방법) | https://support.google.com/googleplay/android-developer/answer/11926878 | ⭐⭐⭐ High | 2026-09-28 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보 명시 (2026년 기준, Target API 35/36, iOS 26 SDK)
- [✅] deprecated 정책이 올바르게 반영됨 (5.5" 스크린샷 선택사항, 부제목 30자 정정)
- [✅] DISPUTED 2건 정정 반영 완료 (App Store 부제목 80→30자, iPhone 5.5" 필수→선택)

### 4-2. 구조 완전성

- [✅] 소스 URL 공식 문서 12종
- [✅] 검증일 명시 (2026-06-10)
- [✅] Google Play / App Store 양쪽 체크리스트 포함
- [✅] 에셋 사양 표 (아이콘, 스크린샷) 포함
- [✅] 심사 거절 사유 + Guideline 번호 포함
- [✅] 흔한 실수 패턴 10종 포함

### 4-3. 실용성

- [✅] 제출 직전 최종 체크리스트(Google Play / App Store 각각) 포함
- [✅] 버전 코드 자동 증가 Editor 스크립트 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 없음)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-10 skill-tester 수행, 2026-09-28 재검증 정정분 재테스트 완료, 2026-09-28 2차 실제 재테스트 완료)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (보완 사항 없음 — 3/3 PASS, 재검증 2/2 PASS, 2차 재테스트 2/2 PASS)

---

## 5. 테스트 진행 기록

### [2026-09-28] skill-tester 2차 실제 재테스트 (real Agent 호출)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (Agent 도구로 독립 서브에이전트 2회 실제 비동기 호출, 완료 로그 확인)
**수행 방법**: 아래 "[2026-09-28] 선택 보강 반영" 절의 정정 내용(Target API 36 유예 신청 자격·방법)을 겨냥한 질문 1개 + 핵심 심사 거절 사유(IAP Restore·계정 삭제) 질문 1개를 각각 독립 general-purpose 서브에이전트에 위임. 짝 스킬 `game/unity-6-2d-fundamentals`에도 동일한 유예 자격 질문을 별도 서브에이전트에 위임해 두 스킬 서술이 일치하는지 교차검증.

**Q1. "완전히 새로운 앱을 2026-09에 처음 제출하는데 Target API Level을 몇으로 맞춰야 하고, 유예 신청이 가능한가? 기존 앱 업데이트와는 어떻게 다른가?"**
- ✅ PASS
- 근거: SKILL.md "1-2. Target API Level" (줄 22-27) + "9. 제출 직전 최종 체크리스트" (줄 233)
- 상세: 서브에이전트가 "신규 앱은 API 36 필수·유예 불가 / 기존 앱 업데이트만 Play Console Policy status 페이지에서 2026-11-01까지 연장 신청 가능"을 정확히 구분해 답변. 신청 경로(Policy status 페이지 → 경고 상세 → Request more time)까지 정확히 인용.
- **교차검증**: 짝 스킬 `unity-6-2d-fundamentals` SKILL.md에 동일 취지 질문을 위임한 결과, "신규 앱 불가·기존 앱 업데이트만 Policy status 페이지 신청"으로 완전히 일치하는 답변을 받음. 두 스킬의 유예 관련 서술 사이에 모순 없음 확인.

**Q2. "IAP(비소비성) 앱에서 Restore Purchases 버튼을 안 넣었다. 문제되는가? 계정 삭제를 플래그만 세팅해도 되는가?"**
- ✅ PASS
- 근거: SKILL.md "5-1. Apple App Store Review Guidelines" 표(3.1.1·5.1.1 행) + "추가" 항목 + "8. 흔한 실수 패턴"
- 상세: Guideline 3.1.1(Restore 버튼 필수) 및 5.1.1(v)(단순 플래그 금지, 실제 데이터 삭제 필요)을 정확히 도출. 세 섹션(5-1 표·추가 항목·8절) 간 서로 모순 없이 일관됨을 서브에이전트가 직접 확인.

### 발견된 gap (2차 재테스트)

- 경미: 유예 신청 양식의 구체적 승인 심사 기준, 계정 삭제 시 법적 보관 의무 데이터 예외 처리가 SKILL.md에 없음 — 차단 요인 아님, 선택 보강

### 판정 (2차 재테스트)

- agent content test: 2/2 PASS (+ 짝 스킬 `unity-6-2d-fundamentals`와 교차검증 결과 일치 확인)
- verification-policy 분류: 해당 없음 (제출 절차·체크리스트 가이드 — content test로 충분)
- **최종 상태: APPROVED**

---

### [2026-09-28] 선택 보강 반영

- **반영 내용**: Target API 36 유예(2026-11-01까지) 신청 자격·방법을 명확화 — 유예는 **신규 앱 제출에는 적용되지 않으며**, 이미 게시된 기존 앱을 업데이트할 계획이 있는 개발자만 Play Console **Policy status** 페이지에서 신청 가능함을 SKILL.md 1-2절 및 9절 체크리스트에 추가.
- **근거**: Google Play Console 고객센터 공식 문서 "Target API level requirements for Google Play apps" — https://support.google.com/googleplay/android-developer/answer/11926878 (원문: "New apps and app updates must target Android 16 (API level 36) or higher to be submitted to Google Play"; "If you plan to update this app to a higher target API level, you can submit an extension request to continue getting distributed to all users on Google Play until November 1, 2026"; "The extension form is available through the details page of the warning or issue on the Policy status page in Play Console")

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (Agent 도구 실제 서브에이전트 호출)
**수행 방법**: 2026-09-26 재검증에서 시제 정정된 내용(Target API 36·iOS 26 SDK가 "예정"에서 "시행 중"으로 전환)을 겨냥한 질문 2개를 general-purpose 서브에이전트에게 "SKILL.md만 근거로 답하라"는 조건으로 위임, 답변과 근거 섹션을 대조 검증

### 실제 수행 테스트 (2026-09-28)

**Q1. 2026-09 Google Play 신규 제출 시 Target API Level + 유예 가능 여부**
- ✅ PASS
- 근거: SKILL.md "1-2. Target API Level" + "9. 제출 직전 최종 체크리스트"
- 상세: "API 36 이상, 현재 시행 중, 유예 신청 시 2026-11-01까지 연장 가능"을 정확히 도출. 다만 에이전트가 "유예 신청 자격 조건·신청 방법이 SKILL.md에 없다"는 점을 gap으로 지적함(아래 참조).

**Q2. 구버전 Xcode로 빌드한 iOS 앱 업로드 통과 여부**
- ✅ PASS
- 근거: SKILL.md "2-2. Xcode SDK 요구사항" + "8. 흔한 실수 패턴"
- 상세: "2026-04-28부터 시행 중, 유예 없음, 구버전 툴체인 빌드는 자동 거부"를 정확히 도출. 빌드 SDK와 deployment target이 별개라는 점까지 정확히 구분해 답변.

### 발견된 gap (2026-09-28)

- 경미: Target API 36 유예 신청(2026-11-01 연장)의 신청 자격·방법(신규 앱도 포함되는지 등)이 SKILL.md에 없음 — 차단 요인 아님, 선택 보강

### 판정 (2026-09-28)

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (제출 절차·체크리스트 가이드 — 실행 결과물이 아닌 정책 정보 정확성으로 검증 가능, content test로 충분)
- 2026-09-26 재검증 정정 내용(데드라인 경과에 따른 "예정"→"시행 중" 시제 정정)이 실제 서브에이전트 답변에 정확히 반영됨을 확인 → APPROVED 전환

---

### (2026-06-10 시점 기록 — 아래 보존)

**수행일**: 2026-06-10
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 미등록으로 general-purpose 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. App Store 2026 스크린샷 필수 사양 — iPhone 5.5" 필수 여부**
- PASS
- 근거: SKILL.md "3-2. 스크린샷 > App Store (2026 기준)" 섹션 표 및 주의 문구
- 상세: 6.5" 또는 6.9" 중 하나 필수, 5.5"는 선택사항임을 명확히 기술. "더 이상 필수 아님" 문구로 anti-pattern(5.5" 필수 오인) 회피 확인

**Q2. iOS 아이콘 알파 채널 거절 이유 + App Store 부제목 자수 제한 (DISPUTED 정정 확인)**
- PASS
- 근거: SKILL.md "3-1. 앱 아이콘" 표, "8. 흔한 실수 패턴", "4. 앱 설명 최적화" 표 및 주의 문구
- 상세: 알파 채널 → 거절 또는 검정 표시 이유가 섹션 3-1에서 도출 가능. 부제목 30자 제한이 섹션 4 표에 명시. "80자 → 30자" DISPUTED 정정 주의 문구가 오답 유도를 차단

**Q3. CI Editor 스크립트로 Android versionCode / iOS CFBundleVersion 자동 증가**
- PASS
- 근거: SKILL.md "6-1. Android", "6-2. iOS", "6-3. CI에서 자동 증가" 섹션
- 상세: PlayerSettings.Android.bundleVersionCode++ 및 PlayerSettings.iOS.buildNumber 파싱 코드가 섹션 6-3에 그대로 존재. versionCode/CFBundleVersion 매핑 설명도 6-1, 6-2에서 정확히 도출 가능

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md의 해당 섹션에서 정확한 근거를 제시함

### 2026-09-26 재검증

**수행일**: 2026-09-26
**수행 방법**: WebSearch로 핵심 클레임 3개 재확인 + SKILL.md 자체 답변 확인 질문 2개

- 클레임1. Google Play Target API 36 요구(2026-08-31부터) — WebSearch 재확인 → **VERIFIED, 시제만 정정**: 데드라인이 이미 지나 "현재 시행 중" 상태. 유예 시 2026-11-01까지 연장 가능함을 추가
- 클레임2. iOS 26 SDK/Xcode 26 의무(2026-04-28부터) — WebSearch 재확인 → **VERIFIED, 시제만 정정**: 이미 시행 중이며 구버전 툴체인 빌드는 업로드 시 자동 거부(유예 없음)
- 클레임3. Apple 연령 등급 신설문 데드라인(2026-01-31) — WebSearch 재확인 → **VERIFIED, 시제만 정정**: 데드라인 경과, 미응답 앱은 현재 즉시 제출 차단 상태

**Q1(재검증). "지금(2026-09) Google Play에 앱을 새로 올리는데 Target API를 몇으로 잡아야 하고, 유예 신청은 가능한가?"**
- SKILL.md 답변 경로: 1-2절 "2026-08-31부터(현재 시행 중): API 36 이상 필수(유예 신청 시 2026-11-01까지 연장 가능)"
- 판정: PASS (시제 정정 후 정확)

**Q2. "iOS 앱을 오래된 Xcode로 빌드해서 업로드하려는데 지금도 통과되나?"**
- SKILL.md 답변 경로: 2-2절 "2026-04-28부터 이미 시행 중... 구버전 툴체인 빌드는 업로드 시 자동 거부, 별도 유예 기간 없음"
- 판정: PASS

### 판정

- agent content test: 3/3 PASS (최초) + 재검증 2/2 PASS
- verification-policy 분류: 해당 없음 (라이브러리/API 사용법 스킬 — content test로 APPROVED 가능)
- 핵심 수치·정책 자체는 변동 없으나 데드라인 경과에 따른 시제 정정(예정→시행 중)이 실질적 정보 정확성에 영향을 주므로 PENDING_TEST 전환. 차기 skill-tester 재테스트 시 APPROVED 재검토

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ 공식 문서 기반, 14 클레임 교차 검증 완료 |
| 구조 완전성 | ✅ 체크리스트·사양 표·거절 사유·실수 패턴 모두 포함 |
| 실용성 | ✅ 제출 직전 체크리스트까지 완비 |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-06-10) + ✅ 2/2 PASS (2026-09-26 자체 재검증) + ✅ 2/2 PASS (2026-09-28 skill-tester 2차 실제 서브에이전트 재테스트, 짝 스킬 교차검증 일치) |
| **최종 판정** | **APPROVED** (2026-09-28 skill-tester 2차 실제 재테스트 2/2 PASS — 유예 신청 자격·방법 정정분 및 짝 스킬 `unity-6-2d-fundamentals` 서술 일치 확인 완료) |

### 핵심 클레임 검증 표

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | 신규 앱 AAB 필수 (2021-08) | VERIFIED | Google Play 공식 |
| 2 | Target API 35+ (2025-08-31~), 36+ (2026-08-31~) | VERIFIED | developer.android.com/google/play/requirements/target-sdk |
| 3 | 64-bit ARM64 의무 (2019-08-01~) | VERIFIED | Google Play 64-bit 공식 |
| 4 | Play App Signing — 업로드 키 분실 시 재설정 가능 | VERIFIED | support.google.com Play App Signing |
| 5 | IARC 설문 → ESRB/PEGI/USK 자동 발급 | VERIFIED | Google Play Console 공식 |
| 6 | Data Safety 섹션 2022-07-20 의무 | VERIFIED | support.google.com Data Safety |
| 7 | iOS 26 SDK / Xcode 26 빌드 의무 (2026-04-28~) | VERIFIED | developer.apple.com upcoming-requirements |
| 8 | App Store 아이콘 1024×1024 PNG, 알파 금지 | VERIFIED | App Store Connect 공식 |
| 9 | iPhone 6.9" 1320×2868 (2026 기준 1순위) | VERIFIED | App Store Connect 스크린샷 사양 |
| 10 | App Store 연령 등급 2025 개편: 4+/9+/13+/16+/18+ | VERIFIED | developer.apple.com upcoming-requirements |
| 11 | App Privacy 섹션 2020-12-08 의무 | VERIFIED | App Store App Privacy Details 공식 |
| 12 | 3.1.1 — IAP 복원 버튼 누락 시 거절 | VERIFIED | App Store Review Guidelines 3.1.1 |
| 13 | App Store 부제목 80자 | DISPUTED → 정정 | 공식: **30자 이내** (SKILL.md 수정 완료) |
| 14 | iPhone 5.5" 스크린샷 필수 | DISPUTED → 정정 | 2026년 기준 **선택사항** (6.9" 1순위, SKILL.md 수정 완료) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 에이전트 활용 테스트 수행 (2026-06-10 완료, 3/3 PASS / 2026-09-28 재검증 정정분 재테스트 완료, 2/2 PASS / 2026-09-28 2차 실제 재테스트 완료, 2/2 PASS + 짝 스킬 교차검증 일치)
- [❌] (선택) Target API Level 정책 매년 갱신 — 2027년 기준 변경 시 섹션 1-2 업데이트 필요 (차단 요인 아님, 선택 보강)
- [❌] (선택) App Store 스크린샷 사양 — 신규 iPhone 모델 출시 시 크기 추가 필요 (차단 요인 아님, 선택 보강)
- [✅] Target API 36 유예 신청 자격·방법(신규 앱 포함 여부 등) 명확화 (2026-09-28 반영 — Google Play Console 고객센터 공식 문서로 확인: 신규 앱은 유예 불가, 기존 앱 업데이트만 Policy status 페이지에서 신청 가능)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-10 | v1 | 최초 작성. Google Play / App Store 양쪽 체크리스트, 에셋 사양, 심사 거절 사유 14 클레임 교차 검증. DISPUTED 2건 정정 반영 | skill-creator (token 한도로 분리 작성) |
| 2026-06-10 | v1 | 2단계 실사용 테스트 수행 (Q1 App Store 스크린샷 필수 사양 / Q2 iOS 아이콘 알파+부제목 자수 함정 / Q3 CI versionCode 자동 증가) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-09-26 | v1 | 재검증(98개 일괄 재검증 대상). Target API 36·iOS 26 SDK·연령 등급 데드라인이 모두 경과해 시제를 "예정"→"시행 중"으로 정정 → 실질 내용 변경으로 PENDING_TEST 전환 | Claude Code |
| 2026-09-28 | v1 | 2단계 실사용 테스트 재수행 (Q1 Target API 36+유예 가능 여부 / Q2 구버전 Xcode 빌드 업로드 통과 여부) → 2/2 PASS, APPROVED 전환 | skill-tester |
| 2026-09-28 | v1 | 재검증(선택 보강). Target API 36 유예 신청 자격·방법 명확화(신규 앱 불가·기존 앱 업데이트만 가능) — Google Play Console 고객센터 공식 문서 확인 후 SKILL.md 1-2절·9절 갱신 → 실질 내용 추가로 PENDING_TEST 전환 | Claude Code |
| 2026-09-28 | v1 | 2단계 실사용 테스트 2차 재수행 (Q1 신규앱 유예 자격 + 짝 스킬 unity-6-2d-fundamentals 교차검증 / Q2 IAP Restore·계정삭제) → 2/2 PASS, 짝 스킬 서술 일치 확인, APPROVED 전환 | skill-tester |
