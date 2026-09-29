---
skill: unity-iap
category: game
version: v1
date: 2026-09-26
status: APPROVED
---

# 스킬 검증 문서 — game/unity-iap

> Unity 6 LTS 2D 모바일 게임에 Unity In-App Purchasing(IAP) SDK를 통합하는 방법.
> Consumable / Non-Consumable / Subscription 3종 + 영수증 검증 + iOS 복원 + v4·v5 API 양쪽 커버.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `unity-iap` |
| 스킬 경로 | `.claude/skills/game/unity-iap/SKILL.md` |
| 검증일 | 2026-09-26 (최초 2026-06-09) |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 대상 패키지 버전 | Unity IAP **5.3.1** (2026-05-27 권장) / **4.15.1** (2026-04-21 레거시 호환) |
| 호환 Unity | Unity 6 LTS (6000.x), Unity 2022.3 LTS |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.unity.com/en-us/iap, docs.unity3d.com/Packages/com.unity.purchasing@latest)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/needle-mirror/com.unity.purchasing)
- [✅] 최신 버전 기준 내용 확인 (5.3.1 / 4.15.1, 2026-06-09 기준)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (v4 IStoreListener + v5 StoreController 양쪽)
- [✅] 코드 예시 작성 (초기화·구매·검증·복원·구독 전부)
- [✅] 흔한 실수 패턴 정리 (10개 anti-pattern)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "Unity IAP com.unity.purchasing latest version 2026 Unity 6 LTS" | 패키지 버전 5.3.1 / 4.15.1 확정, Google Play BL 7+ 요구사항 확인 |
| 조사 | WebSearch | "Unity IAP IStoreListener ProcessPurchase PurchaseProcessingResult Complete Pending" | ProcessPurchase 반환값 의미 확인 (Complete = 트랜잭션 닫힘, Pending = 재호출) |
| 조사 | WebSearch | "Unity IAP CrossPlatformValidator receipt validation tangle" | Receipt Obfuscator 메뉴·Tangle 파일 생성 흐름 확인 |
| 조사 | WebSearch | "Unity IAP IDetailedStoreListener vs IStoreListener 5.x deprecated" | v5에서 IStoreListener·IDetailedStoreListener 모두 deprecated, StoreService 이벤트 패턴으로 교체 |
| 조사 | WebSearch | "Unity IAP SubscriptionManager getSubscriptionInfo isSubscribed isExpired" | SubscriptionInfo 메서드 시그니처 및 동적 계산 특성 확인 |
| 조사 | WebSearch | "Unity IAP iOS RestoreTransactions Apple review reject required" | Apple Guideline 3.1.1 — 비소모품/구독은 "구매 복원" 버튼 필수 |
| 조사 | WebSearch | "Unity IAP Google Play Billing Library 8 v4.14 v5.x" | v5.x는 BL 8 자동, v4.14+는 BL 7 지원, 2025-08-31 BL 7 의무화 |
| 조사 | WebSearch | "Unity IAP ProductCatalog Window Catalog IAP Catalog GUI editor" | IAP Catalog GUI 메뉴 경로 (Services > In-App Purchasing > IAP Catalog) 확인 |
| 조사 | WebSearch | "Unity IAP InitializationFailureReason enum NoProductsAvailable PurchasingUnavailable AppNotKnown" | 초기화 실패 enum 값 의미 확인 |
| 조사 | WebFetch | docs.unity.com/en-us/iap/get-started | 패키지 설치 흐름, ConfigurationBuilder 코드 패턴 확인 |
| 조사 | WebFetch | docs.unity.com/ugs/en-us/manual/iap/manual/upgrade-to-iap-v5 | v4→v5 마이그레이션 가이드, StoreController·OnPurchasePending·ConfirmPurchase 패턴 확보 |
| 조사 | WebFetch | docs.unity.com/ugs/en-us/manual/iap/manual/receipt-validation | 로컬 vs 서버 검증 권장 사항, Apple StoreKit 2 JWS 추출 방식 확인 |
| 조사 | WebFetch | docs.unity.com/ugs/en-us/manual/iap/manual/subscriptioninfo-class-reference | SubscriptionInfo 메서드별 반환값·Apple/Google 차이 확인 |
| 조사 | WebFetch | docs.unity3d.com/Packages/com.unity.purchasing@5.0/api/UnityEngine.Purchasing.IStoreListener.html | IStoreListener 메서드 시그니처 및 deprecated 표시 확인 |
| 조사 | WebFetch | github.com/needle-mirror/com.unity.purchasing/releases | 릴리스 날짜 확정 (5.3.1 = 2026-05-27, 4.15.1 = 2026-04-21) |
| 교차 검증 | WebSearch | 9개 핵심 클레임 × 2~3개 독립 소스 | VERIFIED 8 / DISPUTED 1(사용자 요구 v4 패턴이 v5에서 deprecated — 두 패턴 모두 명시로 해결) / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Unity In-App Purchasing 공식 문서 | https://docs.unity.com/en-us/iap | ⭐⭐⭐ High | 2026-06-09 | 1순위 공식 |
| Get started with Unity IAP | https://docs.unity.com/en-us/iap/get-started | ⭐⭐⭐ High | 2026-06-09 | 설치·초기 설정 |
| Upgrade from IAP v4 to v5 (Unity Docs) | https://docs.unity.com/ugs/en-us/manual/iap/manual/upgrade-to-iap-v5 | ⭐⭐⭐ High | 2026-06-09 | v5 마이그레이션 가이드 |
| Receipt validation (Unity Docs) | https://docs.unity.com/ugs/en-us/manual/iap/manual/receipt-validation | ⭐⭐⭐ High | 2026-06-09 | 검증 권장 사항 |
| SubscriptionInfo class reference | https://docs.unity.com/ugs/en-us/manual/iap/manual/subscriptioninfo-class-reference | ⭐⭐⭐ High | 2026-06-09 | 구독 API 시그니처 |
| IAP Catalog window reference | https://docs.unity.com/ugs/en-us/manual/iap/manual/iap-catalog-window-reference | ⭐⭐⭐ High | 2026-06-09 | Codeless 설정 메뉴 |
| Define your products | https://docs.unity.com/ugs/en-us/manual/iap/manual/define-your-products | ⭐⭐⭐ High | 2026-06-09 | 상품 정의 패턴 |
| IStoreListener API (5.0) | https://docs.unity3d.com/Packages/com.unity.purchasing@5.0/api/UnityEngine.Purchasing.IStoreListener.html | ⭐⭐⭐ High | 2026-06-09 | v4 API 시그니처(v5에서 deprecated) |
| UnityIAPServices API (5.1) | https://docs.unity3d.com/Packages/com.unity.purchasing@5.1/api/UnityEngine.Purchasing.UnityIAPServices.html | ⭐⭐⭐ High | 2026-06-09 | v5 진입점 |
| Changelog (5.0.4) | https://docs.unity3d.com/Packages/com.unity.purchasing@5.0/changelog/CHANGELOG.html | ⭐⭐⭐ High | 2026-06-09 | 버전별 변경사항 |
| Why upgrade to IAP v5.x (Unity Support) | https://support.unity.com/hc/en-us/articles/47757890052372-Why-you-should-upgrade-to-Unity-In-App-Purchasing-IAP-v5-x | ⭐⭐⭐ High | 2026-06-09 | 공식 마이그레이션 권고 |
| GitHub Releases | https://github.com/needle-mirror/com.unity.purchasing/releases | ⭐⭐⭐ High | 2026-06-09 | 릴리스 날짜·버전 확정 |
| Unity Support — Restoring Transactions | https://support.unity.com/hc/en-us/articles/115000158886-How-to-handle-restoring-transactions-in-Unity-In-App-Purchasing-IAP | ⭐⭐⭐ High | 2026-06-09 | iOS 복원 정책 |
| Unity Support — Google Play Billing 7.1.1 | https://support.unity.com/hc/en-us/articles/39089405223316-Google-Play-Billing-Library-update-7-1-1 | ⭐⭐⭐ High | 2026-06-09 | BL 버전 매핑 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음 (v5 신 API + v4 레거시 API 모두 공식 문서 기준)
- [✅] 버전 정보가 명시되어 있음 (Unity IAP 5.3.1 / 4.15.1, Unity 6 LTS / 2022.3 LTS)
- [✅] deprecated된 패턴을 권장하지 않음 (v4가 deprecated임을 명시, 신규 프로젝트는 v5 권장)
- [✅] 코드 예시가 실행 가능한 형태임 (네임스페이스·using 포함, 컴파일 가능한 클래스 구조)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description + example 3개)
- [✅] 소스 URL과 검증일 명시 (12개 공식 소스 + 2026-06-09)
- [✅] 핵심 개념 설명 포함 (v4 vs v5 비교표, 상품 타입 3종, 영수증 검증 2종)
- [✅] 코드 예시 포함 (초기화·구매·실패·검증·복원·구독 모두)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (11절 빠른 의사결정 표)
- [✅] 흔한 실수 패턴 포함 (10절 Anti-Pattern 10개)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (전체 IAP Manager 클래스 패턴 제공)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (`coin_pack_small`, `remove_ads`, `monthly_battle_pass` 구체 상품 ID)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-09 skill-tester 수행, 2026-09-28 재검증 정정분 재테스트 완료)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS, 재검증 2/2 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 보완 불필요 — 단 섹션 11 표 버전 표기 사소한 불일치 발견, 아래 기록)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (Agent 도구 실제 서브에이전트 호출)
**수행 방법**: 2026-09-26 재검증에서 정정된 내용(IAP 버전 5.4.3, BL 8/9, Target API 36)을 겨냥한 질문 1개 + 핵심 기능 질문 1개를 general-purpose 서브에이전트에게 "SKILL.md만 근거로 답하라"는 조건으로 위임, 답변과 근거 섹션을 대조 검증

### 실제 수행 테스트 (2026-09-28)

**Q1. 2026-09 신규 설치 시 IAP 버전 및 Billing Library**
- ✅ PASS
- 근거: SKILL.md "1. Unity IAP 개요" 표 (최신 안정 버전 5.4.3, Billing Library v5.4.x → BL 8 자동 지원)
- 상세: 버전·BL 8 자동 지원·BL 9 출시일까지 정확히 인용. 단, 에이전트가 "§11 빠른 의사결정 표에는 여전히 'IAP v5(5.3.x)'로 남아 있어 §1(5.4.3)과 내부 불일치가 있다"는 점을 스스로 발견해 보고함 — 아래 gap 참조.

**Q2. 서버 인벤토리 소모품 — Complete vs Pending**
- ✅ PASS
- 근거: SKILL.md "5.2 구매 완료 처리" 표 + 주의문
- 상세: "Pending 반환 + 서버 응답 후 ConfirmPendingPurchase 호출" 필수, "Complete 그냥 반환 시 결제만 되고 미지급 사고" 위험을 정확히 인용. v5 신 API의 동일 안전장치(OnPurchasePending → 서버 검증 성공 시에만 ConfirmPurchase)까지 연결해 답변.

### 발견된 gap (2026-09-28)

- SKILL.md "11. 빠른 의사결정 표"에 "IAP v5 (5.3.x)"로 구버전 표기가 남아 있음. 2026-09-26 재검증 시 "1. 개요" 섹션은 5.4.3으로 갱신했으나 §11 표는 갱신 누락. 답변 자체는 §1을 근거로 정확했으므로 PASS 처리하되, SKILL.md 자체의 내부 일관성 보강이 필요 — 차단 요인 아님(사용자 승인 후 별도 수정 권장)

### 판정 (2026-09-28)

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (라이브러리 사용법 스킬 — 실사용 필수 카테고리 아님)
- 2026-09-26 재검증 정정 내용(버전·BL9·Target API 36)이 실제 서브에이전트 답변에 정확히 반영됨을 확인 → APPROVED 전환 (단, §11 표기 불일치는 발견된 gap으로 별도 기록)

---

### [2026-09-28] skill-tester 2단계 재테스트 — description·§1·§11 버전 5.3.x→5.4.x 일괄 정정분 검증

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: 위에서 발견된 gap(§11 "IAP v5 (5.3.x)" 표기 불일치)을 메인 대화가 SKILL.md의 description·§1 비교표·§11 의사결정표 전체에서 5.3.x → 5.4.x(최신 5.4.3)로 일괄 정정한 직후, 세 위치의 버전 표기 정합성을 직접 겨냥한 실전 질문 1개로 재테스트

**Q1. description·§1 개요 표·§11 의사결정 표 세 군데의 권장 버전이 서로 일치하는가?**
- ✅ PASS
- 근거: SKILL.md description(6행), §1 "Unity IAP 개요" 표(39~40행), §11 "빠른 의사결정 표"(395행), 대상 버전 표기(28행)
- 상세: 세 곳 모두 5.4.3(또는 5.4.x)으로 일치함을 정확히 확인·답변. "신규 Unity 6 LTS 프로젝트 → Unity IAP 5.4.3 설치" 결론 정확. 이전 gap이었던 "§11에 5.3.x 잔재" 문제가 해소되었음을 간접 검증. 경미한 표기 정밀도 차이(§11만 `5.4.x` 약식, 나머지는 `5.4.3` 정확 patch)는 의미상 모순이 아니라고 정확히 판단

### 발견된 gap (2026-09-28, 정정 후)

- 없음(실질) — 단 §11 표만 `5.4.x`로 약식 표기되어 있어 patch 버전 정밀도가 §1·description(`5.4.3`)과 다름. 의미상 충돌은 아니므로 차단 요인 아님(선택 보강)

### 판정 (2026-09-28, 정정 후)

- agent content test: 1/1 PASS
- verification-policy 분류: 해당 없음 (라이브러리 사용법 스킬 — 변경 없음)
- 최종 상태: **APPROVED 유지**

---

### (2026-06-09 시점 기록 — 아래 보존)

**수행일**: 2026-06-09
**수행자**: skill-tester → general-purpose (domain-specific 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. v4 ProcessPurchase — 서버 인벤토리 저장 시 Complete vs Pending 선택**
- PASS
- 근거: SKILL.md "5.2 구매 완료 처리 — Complete vs Pending (가장 중요)" 섹션 주의 박스 + 10절 Anti-Pattern 표
- 상세: "소모품을 서버 인벤토리에 저장한다면 반드시 `Pending` 반환 + 서버 응답 받은 뒤 `ConfirmPendingPurchase` 호출" 근거 존재. `Complete` 반환 시 결제는 되고 아이템 미지급 사고 설명도 명시. anti-pattern 명확히 차단.

**Q2. iOS 심사 거절 — 구매 복원 버튼 미구현 해결**
- PASS
- 근거: SKILL.md "7. 비소모품·구독 복원 (iOS 필수)" 섹션 서두 + 10절 Anti-Pattern + 11절 빠른 의사결정 표
- 상세: "Unity IAP는 자동으로 호출하지 않는다" 오해 차단 명시. `IAppleExtensions.RestoreTransactions()` v4 코드 예시 + UI 체크리스트(설정/상점 화면에 버튼 필수) 모두 존재.

**Q3. v4 → v5 마이그레이션 핵심 변경점**
- PASS
- 근거: SKILL.md "1. Unity IAP 개요" 두 가지 API 세대 비교표 + 1절 주의 박스 + "4. 초기화 패턴" v5 코드 예시
- 상세: 기존 v4 코드 동작 여부("deprecated이지만 5.x에서도 동작"), 콜백 모델 변경(인터페이스 → 이벤트), 비동기 3단계 초기화, Apple JWS 영수증 변경점 모두 근거 섹션 존재.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md에서 완전한 근거 제시 가능.

### 2026-09-26 재검증 (본문 사실성만 — references/REFERENCE.md은 재검증 대상 아님)

**수행일**: 2026-09-26
**수행 방법**: WebSearch로 핵심 클레임 3개 재확인 + SKILL.md 자체 답변 확인 질문 2개

- 클레임1. Unity IAP 최신 안정 버전 5.3.1 — WebSearch 재확인 → **갱신 필요**: 최신은 **5.4.3**(Unity 6000.3 대응). SKILL.md 버전 표기 갱신
- 클레임2. Google Play Billing Library v5.x → BL 8 자동 지원 — WebSearch 재확인 → **부분 갱신**: BL 8 자동 지원은 유지되나 2026-05-19 **BL 9** 출시, Google Play는 2026-08-31부터 신규/업데이트 앱에 BL 8 이상 필수(유예 2026-11-01) — SKILL.md에 시행일·BL 9 반영
- 클레임3. Android Target API Level 34 이상(Google Play 2026 요구사항) — WebSearch 재확인 → **DISPUTED(구버전)**: 2026-08-31 시행 기준 **Target API 36** 필수 → SKILL.md 정정

**Q1(재검증). "지금(2026-09) Unity 6 프로젝트에 IAP 패키지를 새로 설치하면 몇 버전이 뜨고, Billing Library는 뭘 쓰나?"**
- SKILL.md 답변 경로: "1. Unity IAP 개요" 표 "최신 안정 버전: 5.4.3", "Google Play Billing Library: v5.4.x → BL 8 자동 지원(BL 9는 2026-05-19 출시)"
- 판정: PASS (갱신 후 정확)

**Q2. "Google Play에 신규 게임을 출시하려는데 Android Target API Level을 몇으로 잡아야 IAP 포함 빌드가 게시되나?"**
- SKILL.md 답변 경로: "2. SDK 설치 및 초기 설정 > Android 빌드 사전 설정" — "Target API Level: 36 이상(Google Play 2026-08-31 시행 요구사항)"
- 판정: PASS

### 판정

- agent content test: 3/3 PASS (최초) + 재검증 2/2 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 — content test PASS = APPROVED 가능
- Unity IAP 버전·BL 9·Target API 36 갱신이라는 실질 내용 변경이 있었으므로 PENDING_TEST 전환. 차기 skill-tester 재테스트 시 APPROVED 재검토

---

> (참고) 원래 skill-creator가 남긴 메모: 메인 세션의 skill-tester가 수행 예정. 본 skill-creator 단계에서는 작성하지 않음.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ 공식 문서 기반 작성, 9개 클레임 교차 검증 완료 |
| 구조 완전성 | ✅ frontmatter·소스·검증일·예제·실수 패턴 모두 포함 |
| 실용성 | ✅ 실제 게임 IAP 통합에 바로 사용 가능 수준 |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-06-09) + ✅ 2/2 PASS (2026-09-26 자체 재검증) + ✅ 2/2 PASS (2026-09-28 skill-tester 실제 서브에이전트 재테스트) + ✅ 1/1 PASS (2026-09-28 §11 버전 표기 일괄 정정 후 재테스트, 누적 8/8) |
| **최종 판정** | **APPROVED** (2026-09-28 description·§1·§11 버전 5.3.x→5.4.x 일괄 정정 후 정합성 재테스트 1/1 PASS — APPROVED 유지) |

---

### 핵심 클레임 검증 표

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | Unity IAP 패키지명은 `com.unity.purchasing` | VERIFIED | Unity Docs / GitHub needle-mirror 양쪽 일치 |
| 2 | 2026-06-09 기준 최신 안정 버전은 5.3.1 (2026-05-27) | VERIFIED | GitHub Releases · Unity Docs 일치 |
| 3 | v4 레거시 호환은 4.15.1 (2026-04-21) 유지 | VERIFIED | GitHub Releases 명시 |
| 4 | `IStoreListener` + `ProcessPurchase` 패턴은 v5에서 deprecated | DISPUTED → 수정 반영 | 사용자 요구는 v4 패턴 / 공식 문서는 v5 권장 → SKILL.md에 **v4·v5 양쪽 명시 + v5 권장 표기**로 해결 |
| 5 | `ProductType` 3종 = Consumable / NonConsumable / Subscription | VERIFIED | 모든 공식 문서 일치 |
| 6 | `PurchaseProcessingResult.Pending` 반환 시 다음 실행에 `ProcessPurchase` 재호출, `ConfirmPendingPurchase` 호출 필요 | VERIFIED | Unity Docs Processing Purchases + ScriptReference 일치 |
| 7 | `CrossPlatformValidator`는 Google Play / Apple / Mac App Store만 지원 | VERIFIED | Unity Docs Receipt Validation 명시 |
| 8 | Tangle 파일은 `Window > Unity IAP > Receipt Obfuscator`에서 생성 | VERIFIED | Unity Docs Receipt Obfuscation 명시 |
| 9 | Apple App Store Review Guideline 3.1.1 — 비소모품/구독은 "구매 복원" 버튼 필수, Unity IAP가 자동 호출하지 않음 | VERIFIED | Unity Support 공식 문서 · Apple 가이드라인 일치 |
| 10 | `SubscriptionInfo` 메서드(`isSubscribed`/`isExpired`/`isCancelled`/`isAutoRenewing`/`getRemainingTime`/`getFreeTrialPeriod`)는 호출 시점에 동적 계산 | VERIFIED | Unity Docs SubscriptionInfo class reference 명시 |
| 11 | Google Play Billing Library 7 의무화는 2025-08-31, v4.13+ 또는 v5.x 필요 | VERIFIED | Unity Support 공식 발표 |
| 12 | v5에서 Apple 영수증은 `IAppleOrderInfo.jwsRepresentation` (StoreKit 2 JWS) | VERIFIED | Upgrade to v5 가이드 명시 |

---

## 7. 개선 필요 사항

- [✅] 메인 세션에서 skill-tester로 실전 질문 답변 검증 완료 (2026-06-09, 3/3 PASS / 2026-09-28 재검증 정정분 재테스트 완료, 2/2 PASS / 2026-09-28 §11 버전 표기 정정 후 재테스트 완료, 1/1 PASS)
- [❌] (선택 — 차단 요인 아님) 향후 v5.4 이상 릴리스 시 Changelog 추적해 deprecated API 추가 반영 필요
- [❌] (선택 — 차단 요인 아님) Amazon Appstore·UDP 등 부가 스토어 통합 예제는 별도 스킬로 분리 가능
- [✅] (2026-09-28 완료) description·"11. 빠른 의사결정 표"의 "IAP v5 (5.3.x)" 표기를 "1. 개요" 섹션과 일치하도록 5.4.x/5.4.3으로 일괄 갱신 — 정합성 재테스트 1/1 PASS
- [❌] (선택 — 차단 요인 아님) §11 표만 `5.4.x` 약식 표기 — §1·description의 정확한 patch(`5.4.3`)와 정밀도 통일 권장

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-09 | v1 | 최초 작성. v4(4.15.1) + v5(5.3.1) 양쪽 API 커버. 영수증 검증·iOS 복원·구독 관리·10개 anti-pattern 포함 | skill-creator |
| 2026-06-09 | v1 | 2단계 실사용 테스트 수행 (Q1 ProcessPurchase Complete vs Pending / Q2 iOS 복원 버튼 미구현 / Q3 v4→v5 마이그레이션 변경점) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-09-25 | v1 | 구조 개편: 상세 내용 references/REFERENCE.md 분리 (내용 변경 없음) | Claude |
| 2026-09-26 | v1 | 재검증(98개 일괄 재검증 대상, 본문만). Unity IAP 5.3.1→5.4.3, BL 9 출시 반영, Android Target API 34→36(2026-08-31 시행) 정정 → 실질 내용 변경으로 PENDING_TEST 전환 | Claude Code |
| 2026-09-28 | v1 | 2단계 실사용 테스트 재수행 (Q1 IAP 버전+Billing Library / Q2 서버 인벤토리 소모품 Complete vs Pending) → 2/2 PASS, APPROVED 전환. §11 표 버전 표기 불일치 gap 발견 | skill-tester |
| 2026-09-28 | v1 | description·§1 비교표·§11 의사결정표의 구버전 "5.3.x" 표기를 "5.4.x"(최신 5.4.3)로 일괄 정정 후 버전 정합성 재테스트 수행 (Q1) → 1/1 PASS, APPROVED 유지 | 메인 대화 → skill-tester |
