---
name: dream-app-onboarding
description: >
  꿈 해몽 앱 첫 사용자 온보딩 5단계 패턴 (환영·기능 소개·맥락별 권한 요청·동의·첫 꿈 입력 안내).
  react-joyride·intro.js-react·shepherd.js·@reactour/tour·직접 구현 비교, 마이크/알림 *맥락 시점*
  권한 요청, 학술 한계(의학·심리학 진단 아님 / 민속학적 자료) 사용자 친화 변환, 위기 자원
  사전 안내, 페르소나 분기(일반·청소년·전문가), 스킵·재방문 UX, 접근성, 측정 지표,
  흔한 함정을 다룬다.
  <example>사용자: "꿈 해몽 앱에 첫 사용자 온보딩을 어떤 라이브러리로 만들지?"</example>
  <example>사용자: "온보딩에 학술 한계 고지를 어떻게 부드럽게 넣을 수 있어?"</example>
  <example>사용자: "권한 요청을 온보딩 어디에 배치해야 거부율이 낮아져?"</example>
---

# 꿈 해몽 앱 온보딩 (Dream-App Onboarding)

> 소스:
> - react-joyride v3 (MIT): https://react-joyride.com/ , https://github.com/gilbarbara/react-joyride
> - intro.js / intro.js-react (AGPL-3.0 + 상용 라이선스): https://introjs.com/
> - shepherd.js (AGPL-3.0 + 상용 라이선스): https://www.shepherdjs.dev/ , https://github.com/shipshapecode/shepherd
> - @reactour/tour (MIT): https://docs.reactour.dev/ , https://github.com/elrumordelaluz/reactour
> - NN/G "Mobile-App Onboarding": https://www.nngroup.com/articles/mobile-app-onboarding/
> - web.dev "Permission UX": https://web.dev/articles/push-notifications-permissions-ux
> - web.dev "Google Meet permissions case study": https://web.dev/case-studies/google-meet-permissions-best-practices
> - WCAG 2.1.1 Keyboard: https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
> - WCAG `prefers-reduced-motion` (C39): https://www.w3.org/WAI/WCAG21/Techniques/css/C39
>
> 검증일: 2026-05-15
>
> 짝 스킬:
> - `frontend/voice-input-ui` — 마이크 권한 요청·상태 머신·시각 피드백 구현. 본 스킬은 *권한 요청 시점*만 다루고, 실제 마이크 UI는 voice-input-ui를 따른다.
> - `frontend/dream-privacy-consent-ui` — 동의 화면 컴포넌트 구조·체크박스 UX·동의 철회 흐름. 본 스킬은 *동의 단계가 5단계 중 어디에 위치*하는지만 다루고, 동의 UI 자체는 짝 스킬을 따른다.
> - `humanities/crisis-intervention-resources-korea` — 109·1577-0199 등 위기 자원 핫라인 번호와 안전 가드 문구. 본 스킬은 *온보딩 5단계 중 어디에 어떤 톤으로 위기 자원을 노출*하는지만 다룬다. 실제 번호·문구·법적 의무는 짝 스킬을 그대로 인용한다.

---

## 0. 언제 사용 / 사용하지 않을지

| 상황 | 적합 |
|------|:---:|
| 꿈 해몽·꿈 일기 앱의 첫 실행 온보딩 설계 | ✅ |
| 정신건강·자가 진단·감정 추적 앱의 첫 실행 온보딩 (안전 가드 적용 필요) | ✅ |
| 기존 사용자에 *재방문 온보딩*(새 기능 소개·튜토리얼) 표시 | △ (5단계 구조는 과함, 3단계 이하로 축소) |
| 마케팅 랜딩 페이지 투어 | ❌ (별도 패턴 — intro.js·driver.js가 더 적합) |
| 로그인된 B2B 대시보드 온보딩 | ❌ (`react-joyride`·`@reactour/tour`만 활용, 본 스킬의 위기/학술 한계 섹션은 불필요) |

---

## 1. 온보딩 5단계 구조

NN/G는 *첫 실행 온보딩 자체를 가능한 한 피하라*고 권고하지만(스킵 가능성이 높음), 꿈 해몽 앱은 다음 두 가지 이유로 *축약형 온보딩이 필수*다.

1. **학술·법적 한계 사전 고지가 불가피** — 의학적·심리학적 진단이 아니며 민속학적 자료라는 점은 첫 사용 전에 알려야 한다. 사용 중 발견하면 사용자가 잘못된 기대를 형성한다.
2. **위기 자원 사전 노출이 필요** — 자살·자해 신호가 *입력된 후*에야 109를 보여주는 것은 늦다. 사용자가 *신호를 입력하기 전*부터 도움 받을 곳을 알게 둔다.

따라서 5단계는 다음 순서로 고정한다. 단계당 1화면, 전체 30~60초 이내가 목표다.

```
[1] 환영 + 가치 한 줄
   ↓
[2] 기능 3개 소개 (꿈 기록 · 해몽 카드 · 다시 꺼내보기)
   ↓
[3] 학술 한계 + 위기 자원 안내   ← 권한 요청 *전*에 가치·한계·안전 자원을 먼저 보여준다
   ↓
[4] 동의 (개인정보·민감정보·필수/선택)
   ↓
[5] 첫 꿈 입력 가이드 (지금 텍스트로 / 음성으로 / 나중에)
       │
       └─ 음성을 선택한 *그 시점*에만 마이크 권한 요청 (in-context)
          알림 권한은 *최소 1회 사용 후* 별도 priming 화면에서 요청
```

**5단계 콘텐츠 정의표:**

| 단계 | 목적 | 길이 권장 | 스킵 허용 | 필수/선택 |
|------|------|-----------|:---------:|:--------:|
| 1. 환영 | 가치 한 줄 + 사용자 호명 | 헤드라인 1줄 + 부제 1줄 | ✅ (스킵 시 [3]으로) | 필수 표시, 스킵 가능 |
| 2. 기능 3개 | "무엇을 할 수 있나"를 카드 3장 | 카드 3장, 각 1줄 설명 | ✅ | 필수 표시, 스킵 가능 |
| 3. 학술 한계 + 위기 자원 | 진단 아님 + 109 1줄 노출 | 짧은 카드 1장 | ❌ (스킵 금지·동의로 대체) | 필수 |
| 4. 동의 | 개인정보/민감정보 동의 | 동의 화면 (별도 스킬) | ❌ | 필수 |
| 5. 첫 꿈 입력 가이드 | 텍스트/음성/나중에 선택 | 버튼 3개 | ✅ (나중에 = 메인으로) | 선택 |

> 주의: **3·4단계는 절대 스킵 가능으로 두지 않는다.** 학술 한계 고지·동의를 우회한 상태에서 앱이 동작하면 *사용자 기대 형성 실패*와 *법적 리스크* 양쪽 모두 발생한다.

---

## 2. 라이브러리 비교

5단계 *풀스크린* 온보딩은 라이브러리 없이 직접 구현이 가장 효율적이다. 라이브러리는 *기존 화면에 코치 마크를 띄우는 투어*에 적합하다. 다음 표는 두 용도를 분리해 비교한다.

### 2-1. 풀스크린 5단계 온보딩 (직접 구현 우선)

| 라이브러리 | 라이선스 | 적합도 | 판단 |
|-----------|----------|:------:|------|
| **직접 구현 (Headless UI / Radix Dialog)** | (없음) | ⭐⭐⭐ | 5단계 화면은 *각 단계의 UI가 다르고*(카드 3장 / 한 줄 고지 / 동의 체크박스 / 버튼 3개) 라이브러리의 step 추상화가 오히려 방해. 단계 관리는 `useState`로 충분. |
| `framer-motion` + 라우터 | MIT | ⭐⭐⭐ | 단계 간 전환 애니메이션이 필요할 때만 추가. `prefers-reduced-motion` 자동 존중. |
| react-joyride | MIT | ⭐ | 풀스크린에는 과함. 5단계를 모달로만 띄우면 spotlight·floater 기능을 안 쓰게 된다. |

### 2-2. 기존 화면 위 코치 마크 투어 (재방문·신기능 안내용)

| 라이브러리 | 최신 버전 | 라이선스 | 키보드/ARIA/포커스 트랩 | 비고 |
|-----------|-----------|---------|:--------------------:|------|
| **react-joyride** | 3.1.0 (2026-04) | MIT | ✅ (공식 명시) | 가장 보편적. React 16.8+~19 지원. `useJoyride` 훅 (v3 신규) / Floating UI / SVG spotlight. 상용 무제한 가능. |
| @reactour/tour | 3.8.0 | MIT | ✅ (포커스 트랩 지원) | react-joyride 대비 더 가벼움. 모노레포(`@reactour/popover` 등) 구조. |
| intro.js-react | 7.x | **AGPL-3.0** / 상용 별도 구매 | △ (키보드 일부) | 22.9k stars로 가장 인기지만 *상용 앱은 라이선스 비용 발생*. 꿈 해몽 앱이 상용이면 회피. |
| shepherd.js | 15.x | **AGPL-3.0** / 상용 별도 구매 | ✅ | Floating UI 기반. intro.js와 동일하게 상용 라이선스 이슈. |

> 주의 (라이선스): **intro.js와 shepherd.js는 AGPL-3.0이다.** 무료 앱·오픈소스 학습 프로젝트면 문제없지만, *상용 앱·수익 모델 있는 앱*은 상용 라이선스 구매가 필요하다. 라이선스 비용을 피하려면 MIT인 react-joyride 또는 @reactour/tour를 선택한다.

### 2-3. 선택 가이드

```
풀스크린 5단계 온보딩이 필요한가?
 ├─ YES → 직접 구현 (Dialog 컴포넌트 5개를 state로 전환)
 └─ NO (기존 화면 위 코치 마크 투어인가?)
        ├─ React 프로젝트 + 상용 가능성 → react-joyride
        ├─ React 프로젝트 + 더 가벼운 것 → @reactour/tour
        ├─ Vue/Angular/순수 JS → shepherd.js (상용이면 라이선스 구매)
        └─ 단순 마케팅 페이지 투어 → intro.js (상용이면 라이선스 구매)
```

---

## 3. 권한 요청 — 순서와 맥락

**핵심 원칙:** *권한은 첫 화면이 아니라, 그 기능을 처음 사용하는 순간에 요청한다.* (web.dev "Permission UX" / Google Meet 사례에서 이 패턴으로 허용률 14% 상승.)

### 3-1. 권한 요청 절대 타이밍

| 권한 | 요청 시점 | 사전 priming | 거부 시 |
|------|----------|--------------|---------|
| 마이크 | 5단계에서 사용자가 "음성으로 입력" 버튼을 *눌렀을 때만* | 1줄 — "꿈을 떠올리며 말씀해 주세요. 마이크 접근이 필요해요." | 텍스트 입력 fallback 제시, 차단하지 않음 |
| 알림 | 첫 꿈 입력 *완료 후* 별도 priming 화면 | 가치 설명 — "꿈은 아침에 빠르게 잊혀져요. 일어날 시간에 1줄 알림을 드릴까요?" | 정상 사용 유지. 설정 화면에서 재활성화 안내 |
| 카메라/사진 | 꿈 일기에 사진 첨부 기능 *처음 사용 시* | "꿈 이미지를 그려서 첨부할 수 있어요." | 첨부 없이 저장 가능 |
| 위치 | 꿈 해몽 앱에서는 **요청 금지** | — | — (요청 자체가 부적절) |

### 3-2. priming 패턴 (마이크 예시)

```tsx
// 5단계 화면에서 "음성으로 입력"을 사용자가 누른 직후
function MicPriming({ onConfirm, onCancel }: Props) {
  return (
    <Dialog aria-labelledby="mic-priming-title">
      <h2 id="mic-priming-title">마이크로 꿈을 말씀해 주세요</h2>
      <p>
        말씀하신 내용은 *이 기기에서만* 처리되고, 동의 없이 외부로 전송되지 않아요.
      </p>
      <button onClick={onConfirm}>마이크 켜기</button>
      <button onClick={onCancel}>텍스트로 입력할게요</button>
    </Dialog>
  );
}

// onConfirm 콜백 안에서 비로소 getUserMedia 호출 (= 브라우저 권한 다이얼로그)
```

> **권한을 한 번 거부당하면 그 도메인에서 자동 재요청 불가**(web.dev). 따라서 priming 화면에서 *명백히 거부 의사*가 있는 사용자는 절대 권한 다이얼로그까지 보내지 않는다. 텍스트 입력으로 우회시켜야 한다.

### 3-3. 권한 일괄 요청 금지

iOS·Android 네이티브 앱처럼 "마이크·알림·카메라를 한 번에 모두 요청"하는 패턴을 *웹에서 흉내내는 것*은 금지다. 사용자는 *왜 지금 이 권한이 필요한가*를 모르고 거부한다.

---

## 4. 학술 한계 사용자 친화 변환

학술 박스("본 자료는 민속학적 자료로 의학적·심리학적 진단이 아닙니다")는 정확하지만 *온보딩에 그대로 노출하면 사용자가 읽지 않는다*. 다음 변환을 적용한다.

### 4-1. 변환 원칙

| 학술 표현 | 사용자 친화 표현 |
|----------|------------------|
| "민속학적 자료에 기반" | "옛 사람들이 꿈을 어떻게 해석했는지 모아둔 이야기예요" |
| "의학적 진단이 아님" | "병원 진료를 대신할 수는 없어요" |
| "심리학적 평가가 아님" | "심리 상담이 필요하면 전문가에게 닿게 해드릴게요" |
| "재미·자기 성찰 목적" | "꿈을 곱씹어 보는 *조용한 시간*이에요" |

### 4-2. 3단계 화면 권장 문구 템플릿

```
┌─────────────────────────────────────────────┐
│  🌙  꿈은 이야기지, 진단이 아니에요          │
│                                             │
│  이 앱의 해몽은 옛 사람들이 모은 이야기에    │
│  뿌리를 두고 있어요. 병원 진료나 상담을     │
│  대신할 수는 없어요.                         │
│                                             │
│  마음이 많이 무겁다면 언제든 도움을 청해도   │
│  괜찮아요.                                   │
│                                             │
│  ☎ 자살예방상담  109 (24시간·무료·익명)       │
│  ☎ 정신건강위기  1577-0199                   │
│                                             │
│  [ 알겠어요, 계속 ]                          │
└─────────────────────────────────────────────┘
```

> 주의: 위기 자원 번호·운영 시간은 `humanities/crisis-intervention-resources-korea` 짝 스킬을 *반드시 그대로 인용*한다. 본 스킬에서 임의로 다른 번호를 쓰지 않는다 (2024-01 109 통합 후 `1393`은 사용 금지).

### 4-3. 학술 한계를 *어디에 한 번 더* 노출하는가

- **3단계 온보딩 화면 1회** (위 템플릿)
- **꿈 해몽 결과 화면 하단 영구 표시** ("이 해몽은 민속학적 이야기예요" 한 줄)
- **설정 → 이 앱에 대하여** (전체 학술 박스 원문 + 출처)

3개 위치에 모두 두는 이유: 사용자는 *해몽 결과를 본 순간*에 한 번 더 한계를 인식해야 의학적 결정으로 오인하지 않는다.

---

## 5. 안전 자원 사전 안내

`humanities/crisis-intervention-resources-korea` 스킬이 *언제, 어디서, 어떤 톤으로* 노출되는지를 본 스킬이 정의한다.

| 노출 위치 | 노출 형태 | 톤 |
|----------|-----------|-----|
| 3단계 온보딩 화면 | 한 줄씩 2개 (109 + 1577-0199) | "도움을 청해도 괜찮아요" 초대형 |
| 메인 화면 햄버거 메뉴 | "도움이 필요할 때" 메뉴 항목 | 상시 접근 가능 |
| 꿈 입력 화면 위기 키워드 감지 시 | 인라인 안전 가드 (짝 스킬 문구) | 사용자 입력 직후 자연스럽게 |
| 설정 → 위기 자원 전체 목록 | 짝 스킬 전체 내용 | 상세 |

**금지 패턴:**
- "자살하지 마세요" 같은 부정 명령 → 짝 스킬의 *"그 마음 그대로 109에 전해도 괜찮아요"* 톤으로 대체.
- 109 번호만 노출하고 *왜 전화해도 괜찮은지*(무료·익명·24시간) 생략 → 사용자는 비용·신원 노출을 우려한다. 한 줄 자격 정보 함께 노출.

---

## 6. 페르소나 분기

5단계 동일하나, 톤·기본값·기본 안내 위기 자원이 달라진다.

| 페르소나 | 식별 시점 | 톤 | 기본 위기 자원 | 기능 기본값 |
|---------|----------|-----|---------------|------------|
| 일반 사용자 | 기본값 | 친근·평어체 가능 | 109·1577-0199 | 음성/텍스트 동등 |
| 청소년 (만 14~18) | 만 19세 미만 자가 선택 또는 동의 화면 분기 | 더 평이한 문구·이모지 가능 | **1388 우선** + 109 병행 (짝 스킬 권고) | 텍스트 우선 (학교·가정에서 음성은 부담) |
| 전문가 (연구·심리학 종사자) | 설정에서 자가 활성화 | 학술 톤 허용 | 109·1577-0199 + 학술 원문 노출 | 학술 박스 *접지 않고 펼친 상태* |

**식별 방법:**
1. 1단계 환영 화면에서 "사용자에게 묻지 않는다" — 차별/낙인 위험.
2. 4단계 동의 화면에서 *법적으로 필요한 경우만* 연령 확인(만 14세 미만 보호자 동의 필수). 청소년 페르소나는 *연령 확인의 부산물*로 자동 적용.
3. 전문가 페르소나는 *온보딩에서 묻지 않는다*. 일반 온보딩을 끝낸 후 설정에서 *opt-in*.

> 주의: 청소년 페르소나에 1388을 *대체*가 아닌 *우선*으로 둔다. 자살 위기 직전에는 109가 더 빠른 응급 연계가 가능하므로 109 병행 노출이 필수다 (짝 스킬 정책).

---

## 7. 스킵·재방문 UX

### 7-1. 스킵 버튼

```
┌─────────────────────────────────────────────┐
│  [ 건너뛰기 ]                                │  ← 우측 상단에 항상 표시
│                                             │
│            (단계 콘텐츠)                     │
│                                             │
│       ●●○○○                                 │  ← 진행 점도 인터랙티브 (점 클릭 시 해당 단계로)
│                                             │
│  [ 이전 ]                       [ 다음 ]    │
└─────────────────────────────────────────────┘
```

- **건너뛰기 위치:** 우측 상단 (왼쪽은 뒤로가기와 혼동).
- **3·4단계에서만 비활성화:** 학술 한계·동의는 스킵 금지.
- **건너뛰기 확인 다이얼로그 금지:** 한 번 더 묻는 것은 사용자 학대다. 누르면 즉시 5단계로 이동.

### 7-2. 다시 보기

- 설정 → "온보딩 다시 보기" 항목 영구 제공.
- 신기능 출시 시 *기존 사용자에게 5단계 전체를 다시 보여주지 않는다*. 신기능만 코치 마크 1~2개로 (react-joyride 활용).

### 7-3. 중단 후 재진입

- 사용자가 온보딩 중 앱을 종료했을 때, 다음 실행에서 *처음부터 다시 시작*. 중간 재개는 컨텍스트 혼동.
- 단, 동의(4단계)를 완료했다면 그 결과는 보존하고 5단계로 점프.

---

## 8. 접근성

### 8-1. 키보드 (WCAG 2.1.1 Level A)

- 모든 단계 이동·스킵·동의 체크박스가 키보드만으로 조작 가능.
- 단계 전환 시 포커스를 **새 단계의 헤딩**으로 이동 (`heading.focus()` 또는 `aria-live="polite"` 영역에 단계 변경 안내).
- 모달/Dialog 컴포넌트는 **포커스 트랩** 필수 — react-joyride·@reactour/tour는 기본 지원, 직접 구현 시 `focus-trap-react` 활용.
- `Esc` 키로 스킵 가능 (단, 3·4단계는 스킵 금지이므로 `Esc` 무시).

### 8-2. 스크린 리더

- 단계 인디케이터(진행 점)는 `aria-label="2단계 / 전체 5단계"` 동적 갱신.
- 위기 자원 번호는 `<a href="tel:109">` 으로 감싸 *원터치 발신* 지원 (sr이 "전화 걸기 109" 안내).
- 학술 한계 카드는 `role="region" aria-labelledby="limit-title"`로 *반드시 읽히게* 한다 (지나치지 않게).

### 8-3. 모션 감소 (WCAG C39)

```css
/* 단계 전환 슬라이드 애니메이션 */
.step-enter { transform: translateX(20px); opacity: 0; transition: all 0.3s; }

@media (prefers-reduced-motion: reduce) {
  .step-enter { transform: none; transition: opacity 0.01s; }
}
```

- `framer-motion`은 `useReducedMotion()` 훅을 제공하므로 그 결과로 분기.
- 스플래시 별·달 애니메이션도 동일하게 정지 처리.

---

## 9. 측정 — 온보딩 완료율과 단계별 이탈

`data-analyst` 에이전트와 협업해 다음 지표를 추적한다.

### 9-1. 핵심 지표

| 지표 | 정의 | 산업 평균 / 목표 |
|------|------|-----------------|
| 온보딩 완료율 | 5단계 완료 사용자 / 1단계 진입 사용자 | 3~4단계 투어 산업 평균 72~74% — *5단계는 60% 이상* 목표 |
| 단계별 이탈률 | (해당 단계 이탈) / (해당 단계 진입) | 첫 단계 이탈 산업 평균 약 38% — *2단계 이내* 25% 미만 목표 |
| 평균 완료 시간 | 1단계 시작 ~ 5단계 완료 | 30~60초 이내 |
| 마이크 권한 허용률 | priming 후 권한 허용 / priming 노출 | Google Meet 사례 +14% — *55% 이상* 목표 |
| 알림 권한 허용률 | priming 후 권한 허용 / priming 노출 | 첫 사용 후 priming 적용 시 30~40% |
| 동의 거부율 | 4단계 동의 거부 사용자 / 4단계 진입 | 5% 미만 (높으면 동의 문구 재검토) |

### 9-2. 이벤트 정의 예시

```ts
// 분석 도구(Amplitude/Mixpanel/PostHog)에 전송할 이벤트
trackEvent('onboarding_step_view', { step: 1, persona: 'general' });
trackEvent('onboarding_step_complete', { step: 1, duration_ms: 4200 });
trackEvent('onboarding_skip', { from_step: 2 });
trackEvent('onboarding_complete', { total_duration_ms: 38000, persona: 'general' });

trackEvent('permission_priming_view', { permission: 'microphone' });
trackEvent('permission_priming_accept', { permission: 'microphone' });
trackEvent('permission_priming_decline', { permission: 'microphone' });
trackEvent('permission_native_result', { permission: 'microphone', result: 'granted' });
```

> 주의: 위 이벤트는 *민감정보가 아닌 사용 흐름* 데이터다. 꿈 텍스트·음성은 절대 분석 이벤트로 전송하지 않는다 (`dream-privacy-consent-ui` 짝 스킬 정책).

### 9-3. 이탈 단계 우선순위 진단

- *절대 수* 가 큰 단계부터 개선 (50%×100명 > 50%×10명).
- 2단계 기능 소개에서 이탈이 크면 → 카드 수 줄이거나 카드별 문구 단축.
- 4단계 동의에서 이탈이 크면 → 동의 문구 *친근 톤 재변환*, 선택 동의를 *기본 OFF*로.

---

## 10. 흔한 함정

| 함정 | 왜 문제인가 | 해결 |
|------|------------|-----|
| 권한 일괄 요청 | "왜 지금?"이 없으면 거부율 폭증, 한 번 거부 시 재요청 불가 | 기능 사용 *직전 priming* 후 단일 권한만 요청 |
| 7단계 이상 온보딩 | 산업 데이터상 7+단계는 완료율 16%로 급락 | 5단계 고정. 콘텐츠 추가 시 *기능 카드*에 흡수, 단계 늘리지 않음 |
| 강제 동의 (필수 + 선택을 한 체크박스) | 법적 무효 가능 + 신뢰 손상 | 필수와 선택을 *별도 체크박스*로 분리 ( `dream-privacy-consent-ui` 짝 스킬) |
| 학술 박스 원문 그대로 노출 | 사용자는 읽지 않고 스킵 | 4-1 변환표대로 사용자 친화 문구로 변환 |
| 위기 자원을 *위기 신호 입력 후*에만 노출 | 신호가 *오기 전* 사용자는 도움받을 곳을 모름 | 3단계 온보딩 + 메뉴 + 결과 화면 하단에 *상시 노출* |
| 청소년에게 1388 없이 109만 | 청소년은 109 콜에 심리 장벽 (짝 스킬 정책) | 1388 우선·109 병행 |
| 1393 번호 사용 | 2024-01부 109로 통합됨 | 109로 갱신 (짝 스킬 변경 이력 확인) |
| 스킵 시 학술 한계까지 건너뛰기 | 사용자가 기대 형성 실패 → 잘못된 의학적 해석 | 3·4단계는 *스킵 불가*로 분리 |
| 단계 변경 시 포커스 미이동 | 스크린 리더 사용자가 *상태 변경 인지 불가* | 새 단계 헤딩에 `focus()` |
| 스킵 후 확인 다이얼로그 | 사용자 학대 ("정말 건너뛰시겠어요?") | 즉시 5단계로 이동, 묻지 않음 |
| `prefers-reduced-motion` 무시 | 멀미·전정 장애 사용자에게 고통 | 모든 단계 전환·스플래시 애니메이션에 미디어 쿼리 적용 |
| 마이크 권한 거부 시 *기능 차단* | 텍스트로도 입력 가능한데 막힘 | 텍스트 입력 fallback 항상 유지 |
| 알림 권한을 1단계에서 요청 | 가치 인지 전 거부 → 도메인 단위 영구 거부 | 첫 꿈 입력 *완료 후* priming |
| 페르소나를 *질문으로* 파악 | 차별·낙인 위험 | 연령 확인의 부산물로만 자동 분기 |
| 한 줄 동의 "동의함" 단일 체크박스 | 무엇에 동의하는지 모호 → 법적 무효 | 필수/선택 분리 + 항목별 링크 (`dream-privacy-consent-ui`) |

---

## 11. 직접 구현 스켈레톤 (Next.js / React)

```tsx
// app/(onboarding)/page.tsx
'use client';

import { useState } from 'react';
import { WelcomeStep } from './_steps/WelcomeStep';
import { FeaturesStep } from './_steps/FeaturesStep';
import { LimitsStep } from './_steps/LimitsStep';
import { ConsentStep } from './_steps/ConsentStep';
import { FirstDreamStep } from './_steps/FirstDreamStep';

type StepIndex = 1 | 2 | 3 | 4 | 5;
const NON_SKIPPABLE: ReadonlySet<StepIndex> = new Set([3, 4]);

export default function OnboardingPage() {
  const [step, setStep] = useState<StepIndex>(1);

  const goNext = () => setStep((s) => Math.min(5, s + 1) as StepIndex);
  const goPrev = () => setStep((s) => Math.max(1, s - 1) as StepIndex);
  const skip = () => {
    if (NON_SKIPPABLE.has(step)) return; // 3·4단계 스킵 차단
    setStep(5);
  };

  return (
    <main role="region" aria-labelledby="onboarding-title">
      <ProgressDots current={step} total={5} />
      <SkipButton onClick={skip} disabled={NON_SKIPPABLE.has(step)} />

      {step === 1 && <WelcomeStep onNext={goNext} />}
      {step === 2 && <FeaturesStep onNext={goNext} onPrev={goPrev} />}
      {step === 3 && <LimitsStep onNext={goNext} />}     {/* 스킵 불가 */}
      {step === 4 && <ConsentStep onNext={goNext} />}    {/* 스킵 불가 */}
      {step === 5 && <FirstDreamStep />}
    </main>
  );
}
```

```tsx
// app/(onboarding)/_steps/LimitsStep.tsx
'use client';
import { useEffect, useRef } from 'react';

export function LimitsStep({ onNext }: { onNext: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // 단계 진입 시 헤딩에 포커스 (스크린 리더 안내)
  useEffect(() => { headingRef.current?.focus(); }, []);

  return (
    <section>
      <h2 ref={headingRef} tabIndex={-1} id="limits-title">
        꿈은 이야기지, 진단이 아니에요
      </h2>
      <p>
        이 앱의 해몽은 옛 사람들이 모은 이야기에 뿌리를 두고 있어요.
        병원 진료나 상담을 대신할 수는 없어요.
      </p>
      <p>마음이 많이 무겁다면 언제든 도움을 청해도 괜찮아요.</p>

      <ul role="list" aria-label="위기 자원">
        <li><a href="tel:109">자살예방상담 109</a> (24시간·무료·익명)</li>
        <li><a href="tel:1577-0199">정신건강위기상담 1577-0199</a> (24시간)</li>
      </ul>

      <button onClick={onNext}>알겠어요, 계속</button>
    </section>
  );
}
```

```tsx
// app/(onboarding)/_steps/FirstDreamStep.tsx
'use client';
import { useState } from 'react';
import { MicPriming } from '@/components/MicPriming';

export function FirstDreamStep() {
  const [primingOpen, setPrimingOpen] = useState(false);

  return (
    <section>
      <h2>지금, 꿈을 적어볼까요?</h2>

      <button onClick={() => goToTextInput()}>텍스트로 입력</button>
      <button onClick={() => setPrimingOpen(true)}>음성으로 입력</button>
      <button onClick={() => goToHome()}>나중에</button>

      {primingOpen && (
        <MicPriming
          onConfirm={async () => {
            // 사용자 명시 동의 후에만 getUserMedia 호출 (= 브라우저 권한 다이얼로그)
            await navigator.mediaDevices.getUserMedia({ audio: true });
            goToVoiceInput();
          }}
          onCancel={() => setPrimingOpen(false)}
        />
      )}
    </section>
  );
}
```

> 주의: 위 스켈레톤의 `getUserMedia`·마이크 상태 관리는 *최소 예시*다. 실제 구현은 `frontend/voice-input-ui` 스킬의 상태 머신·에러 처리·정리(`stream.getTracks().stop()`)를 그대로 따른다.

---

## 12. 체크리스트

스킬을 실제 코드에 적용할 때 빠진 항목이 없는지 확인:

- [ ] 5단계가 *정확히 5개*인가 (확장 시 카드 흡수, 단계 추가 금지)
- [ ] 3·4단계에서 스킵 버튼이 *비활성화*되어 있는가
- [ ] 학술 한계 문구가 4-1 변환표대로 친근화되었는가
- [ ] 109·1577-0199 번호가 짝 스킬 기준과 일치하는가 (`1393` 없음)
- [ ] 마이크 권한이 5단계 *버튼 클릭 후*에만 요청되는가
- [ ] 알림 권한이 *온보딩 외부* (첫 사용 후)로 분리되었는가
- [ ] 청소년 페르소나에 1388 우선·109 병행이 적용되었는가
- [ ] 단계 전환 시 새 헤딩에 포커스가 이동하는가
- [ ] `prefers-reduced-motion`이 모든 애니메이션에 적용되었는가
- [ ] 분석 이벤트에 *꿈 텍스트·음성 본문이 포함되지 않는가*
- [ ] 라이선스 호환성 확인 (intro.js / shepherd.js는 상용 라이선스 필요)
