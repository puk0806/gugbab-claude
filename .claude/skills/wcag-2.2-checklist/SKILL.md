---
name: wcag-2.2-checklist
description: WCAG 2.2 A/AA success criteria 체크리스트의 자동/수동 점검 매핑, 자동 도구 커버리지 한계, 수동 점검 시나리오, 미디어 자막·음성 해설(5.9절), 한국·EU 등 법적·제도적 배경(EN 301 549 V4.1.1·EAA). 컴플라이언스·접근성 감사용 레퍼런스.
---

# WCAG 2.2 Checklist — A/AA Success Criteria 전체 점검 가이드

> 소스: https://www.w3.org/TR/WCAG22/ (W3C Recommendation, 최초 2023-10-05 · 현행판 2024-12-12)
> 보조 소스: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ , https://www.w3.org/WAI/WCAG22/Understanding/ , https://www.w3.org/WAI/news/2025-10-21/wcag22-iso
> 검증일: 2026-11-09 (최초 2026-06-02, 2026-09-26 미디어 SC 병합 — 5.9절, 2026-11-09 A/AA 개수 정정·EN 301 549 V4.1.1 반영)

이 스킬은 **WCAG 표준 자체와 직접 매핑되는 체크리스트**다. ARIA 패턴·키보드 핸들러 구현 코드는 이 스킬 범위 밖이다.

---

## 1. WCAG 2.2 개요

### 1.3 WCAG 2.2 핵심 변경점 (vs 2.1)

| 항목 | 변경 |
|------|------|
| 발표일 | 2023-10-05 W3C Recommendation (현행판 2024-12-12 — SC 변동 없는 편집 갱신) |
| ISO 표준 | **ISO/IEC 40500:2025** = WCAG 2.2 (2025-10 W3C 발표) |
| 신규 SC | **9개 추가** (아래 §5 참조) |
| 제거 SC | **4.1.1 Parsing** — Obsolete and removed |
| 영향 범위 | 인지 장애·운동 장애 사용자 지원 강화 (드래그·인증·도움말·타겟 크기·포커스 가림 방지) |

> 주의: 4.1.1 Parsing은 WCAG 2.2에서 *제거*되었으므로 신규 점검 항목에서 빠진다. 단, WCAG 2.0/2.1을 준수해야 하는 레거시 시스템에는 여전히 적용된다.

---

## 2. WCAG 2.2 A 레벨 체크리스트 (31개)

| SC | 한국어 제목 | 자동 점검 | 수동 점검 |
|----|-------------|:--:|:--:|
| 1.1.1 | 텍스트 아닌 콘텐츠 (Non-text Content) | 부분 | 필수 |
| 1.2.1 | 오디오·비디오 전용 (Prerecorded) | ❌ | 필수 |
| 1.2.2 | 자막 (Prerecorded) | ❌ | 필수 |
| 1.2.3 | 오디오 설명 또는 매체 대안 (Prerecorded) | ❌ | 필수 |
| 1.3.1 | 정보와 관계 (Info and Relationships) | 부분 | 필수 |
| 1.3.2 | 의미 있는 순서 (Meaningful Sequence) | 부분 | 필수 |
| 1.3.3 | 감각적 특성 (Sensory Characteristics) | ❌ | 필수 |
| 1.4.1 | 색 사용 (Use of Color) | 부분 | 필수 |
| 1.4.2 | 오디오 제어 (Audio Control) | ❌ | 필수 |
| 2.1.1 | 키보드 (Keyboard) | 부분 | 필수 |
| 2.1.2 | 키보드 트랩 없음 (No Keyboard Trap) | ❌ | 필수 |
| 2.1.4 | 단일 키 단축키 (Character Key Shortcuts) | ❌ | 필수 |
| 2.2.1 | 시간 조절 가능 (Timing Adjustable) | ❌ | 필수 |
| 2.2.2 | 일시정지·정지·숨김 (Pause, Stop, Hide) | ❌ | 필수 |
| 2.3.1 | 3회 깜빡임 또는 임계값 이하 (Three Flashes) | ❌ | 필수 |
| 2.4.1 | 블록 건너뛰기 (Bypass Blocks) | ✅ | — |
| 2.4.2 | 페이지 제목 (Page Titled) | ✅ | — |
| 2.4.3 | 포커스 순서 (Focus Order) | ❌ | 필수 |
| 2.4.4 | 링크 목적 (In Context) | 부분 | 필수 |
| 2.5.1 | 포인터 제스처 (Pointer Gestures) | ❌ | 필수 |
| 2.5.2 | 포인터 취소 (Pointer Cancellation) | ❌ | 필수 |
| 2.5.3 | 이름 안의 레이블 (Label in Name) | 부분 | 필수 |
| 2.5.4 | 동작 활성화 (Motion Actuation) | ❌ | 필수 |
| 3.1.1 | 페이지 언어 (Language of Page) | ✅ | — |
| 3.2.1 | 포커스 시 변화 없음 (On Focus) | ❌ | 필수 |
| 3.2.2 | 입력 시 변화 없음 (On Input) | ❌ | 필수 |
| **3.2.6** | **일관된 도움말 (Consistent Help)** ★2.2 신규 | ❌ | 필수 |
| 3.3.1 | 오류 식별 (Error Identification) | 부분 | 필수 |
| 3.3.2 | 레이블 또는 지시사항 (Labels or Instructions) | 부분 | 필수 |
| **3.3.7** | **중복 입력 (Redundant Entry)** ★2.2 신규 | ❌ | 필수 |
| 4.1.2 | 이름·역할·값 (Name, Role, Value) | 부분 | 필수 |

> ~~4.1.1 Parsing~~ — WCAG 2.2에서 제거됨 (Obsolete)

---

## 3. WCAG 2.2 AA 레벨 체크리스트 (24개)

| SC | 한국어 제목 | 자동 점검 | 수동 점검 |
|----|-------------|:--:|:--:|
| 1.2.4 | 자막 (Live) | ❌ | 필수 |
| 1.2.5 | 오디오 설명 (Prerecorded) | ❌ | 필수 |
| 1.3.4 | 방향 (Orientation) | ✅ | — |
| 1.3.5 | 입력 목적 식별 (Identify Input Purpose) | 부분 | 필수 |
| 1.4.3 | 명도 대비 (Minimum) — 일반 4.5:1, 큰 텍스트 3:1 | ✅ | — |
| 1.4.4 | 텍스트 크기 조정 (Resize Text 200%) | ❌ | 필수 |
| 1.4.5 | 이미지로 된 텍스트 (Images of Text) | ❌ | 필수 |
| 1.4.10 | 리플로우 (Reflow) — 320 CSS px 폭, 양방향 스크롤 없이 | 부분 | 필수 |
| 1.4.11 | 비-텍스트 명도 대비 (Non-text Contrast) — 3:1 | 부분 | 필수 |
| 1.4.12 | 텍스트 간격 (Text Spacing) | ❌ | 필수 |
| 1.4.13 | 호버 또는 포커스 시 콘텐츠 (Content on Hover or Focus) | ❌ | 필수 |
| 2.4.5 | 다양한 방법 (Multiple Ways) | ❌ | 필수 |
| 2.4.6 | 제목과 레이블 (Headings and Labels) | ❌ | 필수 |
| 2.4.7 | 포커스 표시 (Focus Visible) | 부분 | 필수 |
| **2.4.11** | **포커스 가림 없음 (Minimum)** ★2.2 신규 | ❌ | 필수 |
| **2.5.7** | **드래그 동작 (Dragging Movements)** ★2.2 신규 | ❌ | 필수 |
| **2.5.8** | **타겟 크기 (Minimum) — 24×24 CSS px** ★2.2 신규 | 부분 | 필수 |
| 3.1.2 | 부분 언어 (Language of Parts) | 부분 | 필수 |
| 3.2.3 | 일관된 내비게이션 (Consistent Navigation) | ❌ | 필수 |
| 3.2.4 | 일관된 식별 (Consistent Identification) | ❌ | 필수 |
| 3.3.3 | 오류 정정 제안 (Error Suggestion) | ❌ | 필수 |
| 3.3.4 | 오류 방지 (Legal, Financial, Data) | ❌ | 필수 |
| **3.3.8** | **접근 가능한 인증 (Minimum)** ★2.2 신규 | ❌ | 필수 |
| 4.1.3 | 상태 메시지 (Status Messages) | 부분 | 필수 |

A + AA 합산: **A 31 + AA 24 = 55개** (W3C Quick Reference 기준, 4.1.1 제외). 그중 **2.2 신규 9개 중 A/AA 레벨은 6개** (3.2.6, 3.3.7, 2.4.11, 2.5.7, 2.5.8, 3.3.8).

> 자동 점검 매핑은 아래 §7 도구별 커버리지 표를 함께 참조한다. "부분"은 도구가 일부 케이스만 검출하므로 수동 검증을 반드시 병행해야 한다.

---

## 5. 핵심 코드 예시 (감사 자주 걸리는 항목)

### 5.9 미디어 — 자막·음성 해설·스크립트 (1.2.x / 1.4.2)

> 2026-09-26 구 `frontend/media-accessibility` 스킬에서 흡수. 소스: https://www.w3.org/TR/WCAG22/ · https://webaim.org/techniques/captions/ · https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track

**1.2.3 vs 1.2.5 — 자주 틀리는 구분**

| SC | Level | 요구 |
|----|-------|------|
| 1.2.3 Audio Description or Media Alternative | A | 사전 녹화 비디오에 음성 해설 **또는** 완전한 텍스트 대체본 |
| 1.2.5 Audio Description (Prerecorded) | AA | 음성 해설 **자체**를 요구 (텍스트 대체본으로 대신할 수 없음) |

→ AA가 목표면 텍스트 대체본만으로 1.2.3을 채우고 끝내면 안 된다. 실무 최소선(A+AA)은 사실상 모든 사전 녹화 비디오에 **captions + audio description**이다. 1.2.1(오디오 전용 → transcript), 1.2.2(captions), 1.2.4(라이브 captions, AA), 1.4.2(3초 넘는 자동 재생 오디오는 정지·음량 제어)도 함께 본다.

**Captions ≠ Subtitles — 한국어 "자막"의 함정**

| 구분 | Captions (`<track kind="captions">`) | Subtitles (`kind="subtitles"`) |
|------|------------------------------|-------------------------------|
| 대상 | 청각장애·난청 사용자 | 소리는 들리지만 언어를 모르는 사용자 |
| 내용 | 대사 + **화자 식별** + **소리 효과**(`[전화벨 울림]`) | 대사 번역만 |
| 1.2.2 충족 | ✅ | ❌ |

> 주의 — 흔한 오해 교정: **한국어 콘텐츠를 한국어 사용자에게 제공할 때도 captions은 필요하다.** "외국어 번역이 아니니 자막이 필요 없다"는 틀렸다. 1.2.2의 대상은 번역이 아니라 청각장애 사용자다.

**감사 시 체크 포인트**
- `<track>`의 `kind="captions"`·`srclang`·`label`이 있는지, `default`는 한 트랙에만 붙었는지. `<track>`은 WebVTT(`.vtt`)만 받는다(SRT는 변환 필요).
- 자동 생성 자막(YouTube·Whisper 등)은 정확도가 검증되지 않으면 1.2.2를 충족하지 못한다 → 사람 교정·화자 식별·소리 효과 추가 여부를 확인한다.
- `kind="descriptions"` 텍스트 트랙은 브라우저 지원이 일관되지 않으므로, 1.2.5는 해설이 더빙된 별도 비디오 버전으로 충족하는 편이 안전하다.
- WebAIM 권고: 대부분의 웹 비디오는 captions과 transcript를 **둘 다** 제공한다(transcript는 점자 단말기 사용자·SEO에도 필요).

---

## 6. 자동 점검 도구 매핑

### 6.1 도구별 커버리지

| 도구 | 형태 | WCAG SC 자동 커버리지 | 비고 |
|------|------|----------------------|------|
| **axe-core** (Deque) | OSS 라이브러리 | 실제 이슈의 약 57%, SC 기준 약 30% 완전 자동 | 업계 표준 |
| **Lighthouse Accessibility** | Chrome DevTools | axe-core 기반 (subset) | CI 통합 쉬움 |
| **WAVE** (WebAIM) | 브라우저 확장 | 시각적 오버레이 점검 | 학습용 적합 |
| **Pa11y** | CLI / Node | HTML CodeSniffer 또는 axe 엔진 선택 | 페이지 단위 배치 |
| **IBM Equal Access Checker** | OSS | WCAG 2.1/2.2 룰 셋 | 보고서 풍부 |
| **axe DevTools** (Deque 상용) | 브라우저 확장 | Intelligent Guided Tests로 부분 자동화 확장 | 유료 기능 포함 |

> **자동 점검의 한계**: Deque 공식 발표 기준 axe-core는 실제 발생 이슈의 약 57%를 탐지하나, WCAG success criteria 단위로 보면 **약 29.5%가 완전 자동, 10.3%가 부분 자동, 60.2%는 수동 점검 필수**. 자동 도구만으로 "WCAG AA 준수"를 주장할 수 없다.

---

## 7. 수동 점검 핵심 시나리오

자동 도구가 탐지하지 못하는 60%를 잡기 위한 **반드시 수행해야 할 수동 점검**:

| 시나리오 | 검증 대상 SC | 방법 |
|----------|---------------|------|
| 키보드만으로 모든 작업 수행 | 2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.4.11 | 마우스 분리 후 Tab/Shift+Tab/Enter/Space/Arrow로 전체 흐름 진행 |
| 스크린리더 탐색 | 1.1.1, 1.3.1, 2.4.6, 4.1.2, 4.1.3 | macOS VoiceOver (`Cmd+F5`) / Windows NVDA / JAWS로 페이지 처음부터 끝까지 청취 |
| 200% / 400% 줌 | 1.4.4, 1.4.10 | 브라우저 줌 또는 viewport 320 CSS px에서 양방향 스크롤 없이 사용 가능한지 |
| 텍스트 간격 조정 | 1.4.12 | line-height 1.5, paragraph-spacing 2x, letter-spacing 0.12em, word-spacing 0.16em 적용 후 깨짐 확인 |
| 색맹 시뮬레이션 | 1.4.1 | Chrome DevTools → Rendering → Emulate vision deficiencies (Protanopia, Deuteranopia, Tritanopia, Achromatopsia) |
| `prefers-reduced-motion` | 2.3.3 (AAA), 일반 권고 | OS 설정 또는 DevTools Rendering으로 시뮬레이트 후 애니메이션 거동 확인 |
| 모바일 가로/세로 전환 | 1.3.4 | 디바이스 회전 시 자동 회전 잠금 없이 양쪽 모두 사용 가능 |
| sticky 요소와 Tab 이동 | 2.4.11 | 하단 요소로 Tab 이동 시 sticky header에 완전히 가려지지 않는지 |
| 패스워드 매니저 동작 | 3.3.8 | 1Password/Bitwarden 등으로 자동 입력 시도, paste 차단 여부 |

---

## 9. 법적·제도적 배경

### 9.1 국가별 의무 표준

| 국가/지역 | 법령 | 적용 표준 | 시행 |
|-----------|------|----------|------|
| 한국 | 장애인차별금지법 제21조 + 국가정보화기본법 제32조 | KWCAG 2.2 (한국형 WCAG) | 2008년 4월 (개정 시행) |
| 미국 (정부) | Section 508 Refresh | WCAG 2.0 AA | 2018-01 |
| 미국 (민간) | ADA Title III | 사실상 WCAG 2.1 AA | 판례 기반 |
| EU | European Accessibility Act (EAA) | EN 301 549 — V3.2.1은 WCAG 2.1 AA, **V4.1.1(2026-09 발행)은 WCAG 2.2 A/AA** | 2025-06-28 시행 |
| EU (공공) | Web Accessibility Directive | EN 301 549 | 2018~ |
| 일본 | 障害者差別解消法 | JIS X 8341-3:2016 (WCAG 2.0 AA 기반) | 2024-04 개정 (의무화) |

### 9.2 컴플라이언스 보고

**VPAT (Voluntary Product Accessibility Template)**: 미국 정부 조달에서 요구하는 접근성 적합성 보고 양식. WCAG SC별로 다음과 같이 표기:
- **Supports** — 충족
- **Partially Supports** — 부분 충족
- **Does Not Support** — 미충족
- **Not Applicable** — 해당 없음
- **Not Evaluated** (AAA만 허용)

EU EAA 시행 이후로는 **VPAT 2.5 (INT/EU/Rev edition)** 가 EN 301 549 매핑까지 포함한다.

> 주의: EN 301 549 V4.1.1은 2026-09-02 발행됐지만, EAA 적합성 추정(presumption of conformity) 효력은 EU 관보(OJEU) 인용 후 생긴다. 인용 시점은 2026-11 말 예정으로 보도됐다(미검증 — 관보 확인 필요). 또 EN 301 549는 WCAG 외 요구사항도 있어 WCAG 2.2 AA 점검만으로 충족되지 않는다.

> 주의: EAA는 2025-06-28부터 EU 27개국에서 시행. e-커머스·은행·교통·통신·디지털 서비스 사업자가 적용 대상. 미준수 시 회원국별로 최대 €100,000 또는 연매출 4% 수준의 제재 사례 보고됨 (각국 시행령 차이 있음).

---

## 11. 추가 참고

- 컴포넌트 ARIA 구현 패턴·키보드 핸들러 구현 코드는 이 스킬 범위 밖이다
- 색상 대비 계산 → [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/), Chrome DevTools 색상 피커
- 한국형 표준 KWCAG는 WCAG와 SC 번호가 다를 수 있으므로 *국내 공공기관 납품 시* 한국지능정보사회진흥원 발표 최신 KWCAG 가이드라인을 별도 확인.

> 기준 표준: WCAG 2.2 W3C Recommendation (2023-10-05, 현행판 2024-12-12) — 검증 2026-11-09
