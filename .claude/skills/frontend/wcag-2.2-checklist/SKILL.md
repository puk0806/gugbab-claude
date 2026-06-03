---
name: wcag-2.2-checklist
description: WCAG 2.2 A/AA 레벨 success criteria 전체 체크리스트, 자동/수동 점검 매핑, WCAG 2.0/2.1과의 차이 및 신규 9개 SC 정리. 컴플라이언스·접근성 감사용 레퍼런스.
---

# WCAG 2.2 Checklist — A/AA Success Criteria 전체 점검 가이드

> 소스: https://www.w3.org/TR/WCAG22/ (W3C Recommendation, 2023-10-05)
> 보조 소스: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ , https://www.w3.org/WAI/WCAG22/Understanding/
> 검증일: 2026-06-02

이 스킬은 **WCAG 표준 자체와 직접 매핑되는 체크리스트**다. ARIA 패턴·키보드 핸들러 구현 코드는 별도 `frontend/accessibility` 스킬을 참조한다.

---

## 1. WCAG 2.2 개요

### 1.1 4 원칙 (POUR)

| 원칙 | 의미 | SC 번호대 |
|------|------|-----------|
| **Perceivable** (인지 가능) | 사용자가 콘텐츠를 인지할 수 있어야 한다 | 1.x.x |
| **Operable** (조작 가능) | 사용자가 인터페이스를 조작할 수 있어야 한다 | 2.x.x |
| **Understandable** (이해 가능) | 사용자가 정보·조작 결과를 이해할 수 있어야 한다 | 3.x.x |
| **Robust** (견고함) | 다양한 user agent(브라우저·보조기술)에서 안정 동작해야 한다 | 4.x.x |

### 1.2 적합성 레벨

| 레벨 | 의미 | 실무 권고 |
|------|------|----------|
| **A** | 최소 한계선. 미충족 시 일부 사용자가 접근 불가 | 절대 위반 금지 |
| **AA** | 일반적인 적합 목표. 법령·국제 표준 기준선 | **국내외 법령 기본 목표** |
| **AAA** | 향상된 적합. 모든 콘텐츠에 적용 어려움(W3C 명시) | 선택 적용 |

> 한국 KWCAG 2.2, 미국 Section 508, EU EN 301 549, 일본 JIS X 8341-3 모두 **AA 레벨**을 의무 기준으로 채택한다.

### 1.3 WCAG 2.2 핵심 변경점 (vs 2.1)

| 항목 | 변경 |
|------|------|
| 발표일 | 2023-10-05 W3C Recommendation |
| 신규 SC | **9개 추가** (아래 §5 참조) |
| 제거 SC | **4.1.1 Parsing** — Obsolete and removed |
| 영향 범위 | 인지 장애·운동 장애 사용자 지원 강화 (드래그·인증·도움말·타겟 크기·포커스 가림 방지) |

> 주의: 4.1.1 Parsing은 WCAG 2.2에서 *제거*되었으므로 신규 점검 항목에서 빠진다. 단, WCAG 2.0/2.1을 준수해야 하는 레거시 시스템에는 여전히 적용된다.

---

## 2. WCAG 2.2 A 레벨 체크리스트 (30개)

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

## 3. WCAG 2.2 AA 레벨 체크리스트 (20개)

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

A + AA 합산: **A 30 + AA 20 = 50개**. 그중 **2.2 신규 9개 중 A/AA 레벨은 6개** (3.2.6, 3.3.7, 2.4.11, 2.5.7, 2.5.8, 3.3.8).

> 자동 점검 매핑은 아래 §7 도구별 커버리지 표를 함께 참조한다. "부분"은 도구가 일부 케이스만 검출하므로 수동 검증을 반드시 병행해야 한다.

---

## 4. WCAG 2.2 신규 9개 SC 요점

### A 레벨 신규 (2개)

#### 3.2.6 Consistent Help (A)
- 도움말 메커니즘(연락처, 챗봇, 도움말 폼, 자가 해결 페이지)을 *여러 페이지에 걸쳐* 제공한다면 **동일한 상대 순서(serialized order)** 로 배치해야 한다.
- "도움말을 반드시 제공하라"는 요건이 아님 — 제공한다면 일관되게.
- 예: 모든 페이지 푸터에서 "고객지원 → 챗봇 → FAQ" 순서를 유지.
- 사용자가 직접 변경(줌·뷰포트 변경 등)으로 인한 레이아웃 변동은 예외.

#### 3.3.7 Redundant Entry (A)
- 같은 프로세스 내에서 *이전에 입력한 정보를 다시 입력하라고 요구 금지*.
- 자동 채우기, 선택 가능한 옵션 제공, 또는 이미 사용자가 제공한 정보 활용으로 충족.
- 예외: 보안상 재입력이 필수(예: 비밀번호 확인), 사용자가 이전 입력을 명시적으로 지운 경우.
- 예: 결제 단계에서 배송지와 청구지가 동일한 경우 "동일" 체크박스 제공.

### AA 레벨 신규 (4개)

#### 2.4.11 Focus Not Obscured (Minimum) (AA)
- 키보드 포커스 받은 요소가 sticky header / footer / 모달 오버레이 등에 **완전히 가려지면 안 됨**.
- "부분적으로 가려짐"은 허용 (Enhanced 버전인 2.4.12 AAA가 완전 가시성 요구).
- 흔한 실패 케이스: `position: sticky` 헤더, 쿠키 동의 배너, 채팅 위젯이 Tab으로 이동한 요소를 완전히 덮음.
- 해결: CSS `scroll-margin-top`, `scroll-padding-top` 또는 스크립트로 포커스 요소 가시화.

#### 2.5.7 Dragging Movements (AA)
- 드래그 동작이 필요한 기능에 *드래그 없는 대체 수단* 제공.
- 예: 카드 정렬에 드래그&드롭만 있으면 위반 → "위로/아래로" 버튼 추가, slider에 좌우 키 지원, "이동" 메뉴 선택지 추가 등.
- 단일 포인터로 가능한 동작이라도 *경로 기반(path-based)* 이면 적용 대상.
- 예외: 드래그 자체가 필수인 기능 (예: 그림판 자유 그리기).

#### 2.5.8 Target Size (Minimum) (AA)
- 클릭/탭 타겟의 크기는 **최소 24 × 24 CSS px**.
- 5가지 예외:
  1. **Spacing**: 작은 타겟이라도 24px 지름 원이 다른 타겟과 겹치지 않으면 OK.
  2. **Equivalent**: 같은 기능을 수행하는 다른 24×24 이상의 컨트롤이 페이지에 있으면 예외.
  3. **Inline**: 문장 내 인라인 링크, line-height에 의해 크기가 제약되는 경우.
  4. **Essential**: 크기·간격이 정보 전달에 필수적인 경우 (예: 지도의 핀).
  5. **User agent control**: 작성자가 수정하지 않은 브라우저 기본 컨트롤.
- AAA 버전(2.5.5)은 44×44 px.

#### 3.3.8 Accessible Authentication (Minimum) (AA)
- 인증 과정에서 *인지 기능 테스트* (비밀번호 암기, 퍼즐, 패턴 재현)를 요구한다면 **대안 제공 필수**.
- 인정되는 대안:
  - 패스워드 매니저 사용 허용 (`autocomplete="current-password"` 차단 금지)
  - 이메일 매직 링크, OAuth/SSO
  - 객체/그림 인식 (AA는 예외, AAA는 불가)
  - 생체 인식
- CAPTCHA는 *비인간 식별 목적의 경우* 본 SC 면제(다만 1.1.1 등 다른 SC는 여전히 적용).
- `paste` 차단, 자동 완성 차단은 자주 발생하는 위반.

### AAA 신규 (3개, 참고용)

| SC | 제목 | 핵심 |
|----|------|------|
| 2.4.12 | Focus Not Obscured (Enhanced) | 포커스 요소가 *전혀* 가려지지 않아야 함 |
| 2.4.13 | Focus Appearance | 포커스 표시기의 크기·명도 대비 강화 (외곽선 ≥ 2 CSS px, 3:1 대비) |
| 3.3.9 | Accessible Authentication (Enhanced) | 객체·이미지 인식 인증도 대안 필수 |

---

## 5. 핵심 코드 예시 (감사 자주 걸리는 항목)

### 5.1 명도 대비 (1.4.3 / 1.4.11)

```css
/* 위반: 회색 텍스트 #999 on #FFF = 2.85:1 (AA 미달) */
.muted { color: #999; }

/* 통과: #595959 on #FFF = 7.0:1 */
.muted-aa { color: #595959; }

/* 비-텍스트 (아이콘 버튼, 폼 보더) 1.4.11: 3:1 이상 */
.input { border: 1px solid #767676; } /* #767676 on #FFF = 4.54:1 */
```

### 5.2 타겟 크기 24×24 (2.5.8)

```css
/* 위반: 16x16 아이콘 버튼, 주위 간격도 없음 */
button.icon { width: 16px; height: 16px; padding: 0; }

/* 통과 1: 패딩으로 24x24 이상 확보 */
button.icon {
  width: 16px;
  height: 16px;
  padding: 8px; /* 클릭 박스 32x32 */
}

/* 통과 2: 작아도 spacing 예외 — 인접 타겟과 24px 이상 간격 */
.toolbar button { width: 16px; height: 16px; margin: 4px; }
```

### 5.3 포커스 가림 방지 (2.4.11)

```css
/* sticky header가 80px일 때 scroll-padding으로 포커스 요소가 가려지지 않게 */
html {
  scroll-padding-top: 80px;
}

/* sticky header */
.site-header {
  position: sticky;
  top: 0;
  height: 80px;
  z-index: 10;
}
```

### 5.4 포커스 표시 (2.4.7)

```css
/* 위반: outline 제거 후 대체 표시 없음 */
button:focus { outline: none; }

/* 통과: 가시적인 focus-visible 스타일 */
button:focus-visible {
  outline: 2px solid #005FCC;
  outline-offset: 2px;
}
```

### 5.5 색만으로 정보 전달 금지 (1.4.1)

```html
<!-- 위반: 빨간 색만으로 필수 표시 -->
<label style="color: red;">이메일</label>

<!-- 통과: 색 + 텍스트/아이콘 -->
<label>
  이메일 <span aria-label="필수">*</span>
</label>
```

### 5.6 인증 — 자동 완성 허용 (3.3.8)

```html
<!-- 위반: 패스워드 매니저 차단 -->
<input type="password" autocomplete="off" />

<!-- 통과 -->
<input type="password" autocomplete="current-password" />
<!-- 신규 가입 시 -->
<input type="password" autocomplete="new-password" />
```

### 5.7 드래그 대안 (2.5.7)

```tsx
// 위반: 드래그만으로 정렬
<DraggableList items={items} />

// 통과: 드래그 + 키보드 버튼 대안
<DraggableList
  items={items}
  renderItem={(item, index) => (
    <>
      <span>{item.title}</span>
      <button onClick={() => moveUp(index)} aria-label="위로 이동">↑</button>
      <button onClick={() => moveDown(index)} aria-label="아래로 이동">↓</button>
    </>
  )}
/>
```

### 5.8 페이지 언어 (3.1.1) + 부분 언어 (3.1.2)

```html
<html lang="ko">
  <body>
    <p>다음 문장은 영어입니다: <span lang="en">Hello world</span></p>
  </body>
</html>
```

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

### 6.2 CI 통합 예시

```yaml
# .github/workflows/a11y.yml
name: Accessibility
on: [pull_request]
jobs:
  axe:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: npx serve dist &
      - run: npx @axe-core/cli http://localhost:3000 --exit
```

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

## 8. 흔한 실수 패턴 Top 10

| # | 실수 | 위반 SC | 빈도 |
|---|------|---------|------|
| 1 | 색만으로 정보 전달 (빨간 텍스트로 "오류" 표시) | 1.4.1 | 매우 높음 |
| 2 | placeholder를 label로 사용 | 3.3.2, 1.3.1, 4.1.2 | 매우 높음 |
| 3 | `outline: none` 후 대체 포커스 표시 없음 | 2.4.7 | 매우 높음 |
| 4 | `<div onClick>` (키보드 핸들러·역할·tabindex 모두 없음) | 2.1.1, 4.1.2 | 높음 |
| 5 | 명도 대비 부족 (`#aaa on #fff` 등) | 1.4.3 | 매우 높음 |
| 6 | `autoplay` + 음성 + 컨트롤 없음 | 1.4.2 | 중간 |
| 7 | `tabindex="2"`, `tabindex="3"` (양수) | 2.4.3 | 중간 |
| 8 | sticky header가 Tab 포커스 요소를 완전히 가림 | 2.4.11 (2.2 신규) | 높음 |
| 9 | 아이콘 버튼이 16×16, 간격도 없음 | 2.5.8 (2.2 신규) | 매우 높음 |
| 10 | 결제 단계에서 배송지/청구지 같음에도 다시 입력 요구 | 3.3.7 (2.2 신규) | 높음 |

추가 안티패턴:
- `aria-label`은 시각적 텍스트와 *완전히 다르게* 작성 → 2.5.3 위반 ("Label in Name" — 보이는 텍스트가 접근명에 포함되어야 함)
- `role="button"` + `onClick`만, `onKeyDown` 누락 → 2.1.1 위반
- 폼 에러를 색깔로만 표시하고 메시지 없음 → 3.3.1 위반
- 모달 열렸을 때 배경 콘텐츠로 Tab 이동 가능 → 2.4.3, 2.1.2 위반 위험
- 동일 텍스트 링크가 서로 다른 곳으로 → 2.4.4 위반

---

## 9. 법적·제도적 배경

### 9.1 국가별 의무 표준

| 국가/지역 | 법령 | 적용 표준 | 시행 |
|-----------|------|----------|------|
| 한국 | 장애인차별금지법 제21조 + 국가정보화기본법 제32조 | KWCAG 2.2 (한국형 WCAG) | 2008년 4월 (개정 시행) |
| 미국 (정부) | Section 508 Refresh | WCAG 2.0 AA | 2018-01 |
| 미국 (민간) | ADA Title III | 사실상 WCAG 2.1 AA | 판례 기반 |
| EU | European Accessibility Act (EAA) | EN 301 549 (WCAG 2.1 AA, 2.2로 업데이트 예정) | 2025-06-28 시행 |
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

> 주의: EAA는 2025-06-28부터 EU 27개국에서 시행. e-커머스·은행·교통·통신·디지털 서비스 사업자가 적용 대상. 미준수 시 회원국별로 최대 €100,000 또는 연매출 4% 수준의 제재 사례 보고됨 (각국 시행령 차이 있음).

---

## 10. 점검 체크리스트 사용 절차

권장 워크플로우:

1. **자동 점검 1차** — axe-core / Lighthouse 실행 → 명백한 위반 항목 우선 수정
2. **수동 점검 — 키보드** — 모든 인터랙션 키보드만으로 수행 가능 확인
3. **수동 점검 — 스크린리더** — VoiceOver/NVDA로 주요 플로우 청취
4. **수동 점검 — 시각 검증** — 200% 줌, 텍스트 간격, 색맹 시뮬레이션
5. **수동 점검 — 2.2 신규 항목** — sticky header 가림, 타겟 크기, 드래그 대안, 도움말 위치, 중복 입력, 인증
6. **VPAT 또는 자체 적합성 리포트 작성** — A/AA 50개 SC별 Supports/Partial/No 판정

---

## 11. 추가 참고

- 컴포넌트 ARIA 구현 패턴 → `frontend/accessibility` 스킬 참조
- 색상 대비 계산 → [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/), Chrome DevTools 색상 피커
- 한국형 표준 KWCAG는 WCAG와 SC 번호가 다를 수 있으므로 *국내 공공기관 납품 시* 한국지능정보사회진흥원 발표 최신 KWCAG 가이드라인을 별도 확인.

> 검증일: 2026-06-02 | 기준 표준: WCAG 2.2 W3C Recommendation (2023-10-05)
