---
skill: unity-ui-system
category: game
version: v1
date: 2026-06-10
status: APPROVED
---

# 스킬 검증 문서 — game/unity-ui-system

> Unity 6 LTS 2D 모바일 게임용 uGUI 시스템 — Canvas/RectTransform/TextMeshPro, 모바일 UI 패턴(팝업·무한 스크롤·광고·IAP), 성능 최적화.
> Unity 6.0 LTS / 6.3 LTS (uGUI 2.0+ / TextMeshPro 통합) 기준.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `unity-ui-system` |
| 스킬 경로 | `.claude/skills/game/unity-ui-system/SKILL.md` |
| 검증일 | 2026-06-10 |
| 검증자 | skill-creator (token 한도로 verification.md 분리 작성) |
| 스킬 버전 | v1 |
| 대상 | Unity 6.0 LTS / 6.3 LTS |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.unity3d.com, unity.com)
- [✅] uGUI vs UI Toolkit 선택 기준 공식 문서 검증 (UI Systems Comparison)
- [✅] Screen.safeArea API 확인
- [✅] CanvasScaler Scale With Screen Size 설정값 확인
- [✅] TextMeshPro Unity 6 통합 여부 확인
- [✅] TMP Fallback Font Assets 다국어 처리 확인
- [✅] 광고 배너 Safe Area 배치 (AdMob 정책) 확인
- [✅] UI 성능 최적화 패턴 (batching, rebuild, overdraw) 확인
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "Unity 6 uGUI UI Toolkit comparison runtime 2024" | UI systems comparison 공식 문서 확인, uGUI 런타임 권장 확인 |
| 조사 | WebSearch | "Unity Screen.safeArea notch iPhone Dynamic Island 2024" | Screen.safeArea 픽셀 Rect 반환, anchorMin/Max 정규화 변환 필요 확인 |
| 조사 | WebSearch | "Unity CanvasScaler Scale With Screen Size Reference Resolution" | 1080×1920, Match 0.5 권장 설정 확인 |
| 조사 | WebSearch | "Unity 6 TextMeshPro integrated ugui package" | com.unity.ugui에 TMP 통합, 별도 패키지 불필요 확인 |
| 조사 | WebSearch | "Unity UI optimization batching draw call Canvas split 2024" | Static/Dynamic Canvas 분리, sharedMaterial 사용 패턴 확인 |
| 조사 | WebSearch | "AdMob Unity banner ad safe area padding policy 50px" | 광고와 콘텐츠 사이 패딩 권장 정책 확인 |
| 조사 | WebSearch | "Unity World Space Canvas Event Camera Camera.main performance" | Event Camera 미할당 시 FindObjectWithTag 호출 패턴 확인 |
| 교차 검증 | WebSearch | 핵심 클레임 8개 × 공식 문서 대조 | VERIFIED 7 / UNVERIFIED 1 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 |
|--------|-----|--------|------|
| Unity Manual — UI Systems Comparison | https://docs.unity3d.com/6000.3/Documentation/Manual/UI-system-compare.html | ⭐⭐⭐ High | 2026-06-10 |
| Unity Scripting API — Screen.safeArea | https://docs.unity3d.com/ScriptReference/Screen-safeArea.html | ⭐⭐⭐ High | 2026-06-10 |
| Unity Manual — Canvas Scaler (uGUI 2.0) | https://docs.unity3d.com/Packages/com.unity.ugui@2.0/manual/script-CanvasScaler.html | ⭐⭐⭐ High | 2026-06-10 |
| Unity Support — Split canvas for dynamic objects | https://support.unity.com/hc/en-us/articles/115000355466 | ⭐⭐⭐ High | 2026-06-10 |
| Unity How-to — UI optimization tips | https://unity.com/how-to/unity-ui-optimization-tips | ⭐⭐⭐ High | 2026-06-10 |
| TextMeshPro — Fallback font assets | https://docs.unity3d.com/Packages/com.unity.ugui@2.5/manual/TextMeshPro/FontAssetsFallback.html | ⭐⭐⭐ High | 2026-06-10 |
| Google AdMob — Anchored adaptive banners (Unity) | https://developers.google.com/admob/unity/banner/anchored-adaptive | ⭐⭐⭐ High | 2026-06-10 |
| Unity Releases — Unity 6 LTS Support | https://unity.com/releases/unity-6/support | ⭐⭐⭐ High | 2026-06-10 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] Unity 6 LTS 버전 정보 명시 (6.0 LTS / 6.3 LTS)
- [✅] TMP Unity 6 통합 사실 반영
- [✅] uGUI vs UI Toolkit 선택 기준 공식 비교표 기반 작성
- [✅] DISPUTED 없음, UNVERIFIED 1건 주의 표기 (Camera.main 7~10회 호출 수치 — Unity 공식 정확한 수치 미명시, 동작 자체는 VERIFIED)

### 4-2. 구조 완전성

- [✅] 소스 URL 공식 문서 8종
- [✅] 검증일 명시 (2026-06-10)
- [✅] Canvas/RectTransform/TMP/UI패턴/성능/흔한실수 전 영역 커버
- [✅] 코드 예시 포함 (SafeAreaFitter, RecyclableListView, PopupAnimator, IAP Dialog, RaycastTargetAuditor)
- [✅] 광고 배너·IAP 수익화 직결 패턴 포함

### 4-3. 실용성

- [✅] 모바일 2D 게임 맞춤 설정값 (1080×1920, Match 0.5)
- [✅] 광고 배너 Safe Area 배치 코드 포함
- [✅] 에디터 일괄 점검 스크립트 포함 (RaycastTargetAuditor)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 없음)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] skill-tester로 에이전트 활용 테스트 수행 완료 (2026-06-10)

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-10
**수행자**: skill-tester → general-purpose (game-developer 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Screen.safeArea 픽셀 → RectTransform 앵커 정규화 변환 방법**
- PASS
- 근거: SKILL.md "2.2 Safe Area — 노치·다이나믹 아일랜드·홀펀치 대응" 섹션
- 상세: Screen.safeArea가 픽셀 단위 Rect임을 명시, anchorMin.x /= Screen.width 정규화 공식 포함, Update()에서 변화 감지 후 Apply() 패턴 + "매 프레임 RectTransform 갱신하면 Canvas rebuild 발생" 경고까지 완전히 커버

**Q2. World Space Canvas에서 Event Camera 미할당 시 발생하는 성능 문제와 원인**
- PASS
- 근거: SKILL.md "1.1 Render Mode 3종" 섹션 주의 표기 + "6. 흔한 실수 8종" 항목 6
- 상세: Camera.main 매 프레임 7~10회 호출 + FindObjectWithTag 내부 트리거 메커니즘까지 설명. 두 섹션에서 일관된 내용 (수치 7~10회는 UNVERIFIED 표기 확인)

**Q3. TMP 텍스트 외곽선 효과 — Material Preset Outline vs UnityEngine.UI.Outline 컴포넌트 선택**
- PASS
- 근거: SKILL.md "3.3 외곽선·그림자 성능" 섹션 + "6. 흔한 실수 8종" 항목 7
- 상세: 성능 비교 표(SDF 기반 거의 무료 vs Vertex 4배 복제 모바일 회피) + batching 파괴 추가 함정(Material Preset 개별 사용 시)까지 포함. anti-pattern(legacy Outline 컴포넌트 사용)을 명확히 피하는 답변 근거 존재

### 발견된 gap

없음. 3개 질문 모두 SKILL.md에서 충분한 근거 섹션 확인.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 — content test PASS = APPROVED 가능
- 최종 상태: APPROVED

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ 공식 문서 기반, 8 클레임 교차 검증 완료 |
| 구조 완전성 | ✅ Canvas·TMP·UI패턴·성능·흔한실수 전 영역 포함 |
| 실용성 | ✅ 광고·IAP 수익화 직결 패턴 포함 |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-06-10, skill-tester → general-purpose) |
| **최종 판정** | **APPROVED** |

### 핵심 클레임 검증 표

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | Unity 6에서 TMP는 com.unity.ugui에 통합, 별도 패키지 불필요 | VERIFIED | Unity 6 ugui 패키지 릴리즈 노트 |
| 2 | uGUI가 런타임 UI에 권장, UI Toolkit은 Animation Clip 미지원 | VERIFIED | Unity UI Systems Comparison 공식 |
| 3 | Screen.safeArea는 픽셀 단위 Rect, 앵커 정규화 변환 필요 | VERIFIED | Unity Scripting API Screen.safeArea |
| 4 | CanvasScaler Scale With Screen Size 1080×1920 Match 0.5 권장 | VERIFIED | Unity Manual Canvas Scaler |
| 5 | World Space Canvas Event Camera 미할당 시 Camera.main 반복 호출 | VERIFIED (수치 UNVERIFIED) | Unity 공식 문서 Camera.main 경고, 정확한 횟수(7~10회)는 미명시 |
| 6 | material(인스턴스) 접근 시 batching 파괴 → sharedMaterial 사용 | VERIFIED | Unity UI optimization tips |
| 7 | TMP Material Preset Outline/Underlay가 legacy Shadow/Outline 컴포넌트보다 성능 우수 | VERIFIED | Unity How-to UI optimization |
| 8 | AdMob 광고-콘텐츠 사이 최소 패딩 필요 (정확한 수치는 구현 가이드 기반) | VERIFIED | Google AdMob Unity 배너 가이드 |

---

## 7. 개선 필요 사항

- [✅] skill-tester 에이전트 활용 테스트 수행 (2026-06-10 완료, 3/3 PASS) → APPROVED 전환
- [❌] (선택) UI Toolkit 런타임 지원 범위 — Unity 6.3 이후 개선될 수 있음, 출시 시 재검증 권장 (차단 요인 아님, 선택 보강)
- [❌] (선택) RecyclableListView 코드 — 최소 구현 예시이므로 실제 프로젝트에서 성능 검증 권장 (차단 요인 아님, 선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-10 | v1 | 최초 작성. Unity 6 LTS uGUI 전체 (Canvas/RectTransform/TMP/Safe Area/UI패턴/성능) 8 클레임 교차 검증. SKILL.md token 한도로 verification.md 분리 작성 | skill-creator (분리) |
| 2026-06-10 | v1 | 2단계 실사용 테스트 수행 (Q1 Screen.safeArea 픽셀→앵커 정규화 / Q2 World Space Canvas Event Camera 미할당 성능 문제 / Q3 TMP Outline vs UI.Outline 성능 비교) → 3/3 PASS, APPROVED 전환 | skill-tester |
