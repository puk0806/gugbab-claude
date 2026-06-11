## 9. YouTube / Vimeo 자막 활용

| 플랫폼 | 자동 자막 | 수동 자막 업로드 | WCAG 1.2.2 |
|--------|-----------|-------------------|-------------|
| YouTube | 제공 (영어·한국어 등) | SRT/VTT 업로드 가능 | 자동만으로는 ❌, 수동이면 ✅ |
| Vimeo | 유료 플랜만 | SRT/VTT 업로드 가능 | 수동이면 ✅ |

**YouTube 활용 권장 흐름:**
1. 영상 업로드
2. YouTube Studio → 자막 → 언어 추가 → **수동 작성** 또는 SRT/VTT 파일 업로드
3. 자동 자막은 사용 안 함 또는 *교정 후 게시*

자체 사이트에서 YouTube 임베드 시에도 위 절차로 *수동 자막이 활성화된 상태*로 임베드해야 한다.

---

## 10. 사용자 경험 — 자막 ON/OFF·언어 선택

### 10.1 네이티브 `<video controls>`

대부분의 브라우저는 `controls` 속성으로 자막 메뉴(CC 아이콘)를 자동 제공한다.
- `default` 트랙은 처음부터 활성화
- 사용자가 자막 선택·끄기 가능
- 다만 자막 폰트 크기·색 등의 사용자 설정 UI는 브라우저별로 차이 큼

### 10.2 커스텀 플레이어

더 풍부한 UX(자막 폰트·배경·언어 메뉴)가 필요하면 검증된 라이브러리 사용:
- **video.js** — 가장 광범위 사용. WebVTT 트랙 자동 인식.
- **Plyr** — 가벼움, 기본 접근성 양호.
- **Vidstack** — React/Vue 통합, 모던 API.

> 주의: 직접 만든 커스텀 컨트롤은 키보드 접근성·ARIA 라벨·포커스 관리를 모두 직접 구현해야 한다 (WCAG 2.1.1, 2.4.3, 4.1.2). 가능하면 검증된 라이브러리를 쓰고 스타일만 커스터마이즈.

### 10.3 자막 스타일 사용자 설정

운영체제·브라우저의 자막 설정 (macOS Accessibility → Captions, Chrome `chrome://settings/captions`)을 *존중*하도록 한다. 페이지에서 `::cue`로 강제 스타일을 줄 때도 `!important`를 남용하지 말 것.

---

## 11. 이미지 미디어 접근성 (요약)

이미지의 상세 alt text 작성·SEO 통합은 `image-optimization-seo` 스킬에 위임한다. 본 스킬에서는 미디어 페이지 컨텍스트에서 함께 신경 써야 할 패턴만 다룬다.

### 11.1 figure + figcaption

```html
<figure>
  <img src="chart.png" alt="2020-2025 매출 추이 — 5년간 약 3배 증가">
  <figcaption>그림 1. 연도별 매출 추이 (단위: 억 원)</figcaption>
</figure>
```

- `alt`는 *이미지의 의미*를 텍스트로
- `figcaption`은 *시각적으로 보이는 캡션* — alt와 중복되어도 무방하나, 정보가 다르면 둘 다 의미 있어야 함

### 11.2 복잡한 차트·인포그래픽

짧은 alt만으로 표현 불가능한 경우:

```html
<figure aria-describedby="chart1-desc">
  <img src="chart.png" alt="2020-2025 매출 추이 차트, 상세 설명은 본문 참조">
  <figcaption>그림 1. 연도별 매출 추이</figcaption>
</figure>

<div id="chart1-desc">
  <h3>그림 1 상세 데이터</h3>
  <table>
    <tr><th>연도</th><th>매출</th></tr>
    <tr><td>2020</td><td>10억</td></tr>
    <!-- ... -->
  </table>
</div>
```

- 짧은 alt + 본문 또는 인접 테이블에 데이터 제공
- `aria-describedby`로 연결
- `longdesc` 속성은 HTML5에서 사실상 deprecated — 사용 금지

### 11.3 동영상 포스터 이미지

`<video poster="...">`의 포스터 이미지는 alt 속성을 직접 가질 수 없다. 비디오의 `<title>` 또는 인접한 텍스트로 내용 전달.

---

## 12. prefers-reduced-motion — 움직이는 미디어 제어

전정 장애·편두통·집중력 장애 사용자를 위해 시스템 설정 "동작 줄이기"를 존중한다.

### 12.1 CSS 기본 처리

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 12.2 자동재생 비디오 처리

CSS만으로 비디오 자동재생을 막을 수 없다. JS로 제어:

```html
<video id="bg" autoplay muted loop playsinline>
  <source src="/media/bg.mp4" type="video/mp4">
</video>

<script>
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const video = document.getElementById('bg');

  function applyMotionPreference() {
    if (mq.matches) {
      video.removeAttribute('autoplay');
      video.pause();
      video.currentTime = 0;
    }
  }

  applyMotionPreference();
  mq.addEventListener('change', applyMotionPreference);
</script>
```

### 12.3 autoplay 정책

브라우저 정책 (2026년 현재):
- Chrome·Safari·Firefox는 *소리 있는* 자동재생을 차단. `muted` 속성이 있어야 자동재생 허용.
- 사용자가 한 번 재생을 트리거하면 같은 도메인에서 이후 허용되는 경우가 있음 (브라우저별 다름)

WCAG 관점:
- **1.4.2 Audio Control (A)**: 3초 초과 자동 재생 오디오는 일시정지·정지·음량 조절 수단 제공. → 자동재생은 `muted` 또는 매우 짧을 때만.
- **2.2.2 Pause, Stop, Hide (A)**: 5초 초과 자동 시작되어 움직이는 콘텐츠(비디오 포함)는 일시정지·정지·숨기기 가능.

---

## 13. 흔한 실수 패턴

| # | 패턴 | 문제 | 올바른 처리 |
|---|------|------|-------------|
| 1 | 자막 없는 동영상 | 1.2.2 위반 | captions 필수 (한국어 영상도) |
| 2 | YouTube 자동 자막만 신뢰 | 1.2.2 미충족 (정확도 부족) | 수동 자막 업로드 또는 자동 자막 *교정 후* 사용 |
| 3 | 영문 자막만, 한국어 영상에 한국어 자막 없음 | 1.2.2 위반 (원어 자막 우선) | 영상 원어 captions 먼저, 외국어는 subtitles로 추가 |
| 4 | SRT를 `<track>`에 직접 연결 | 브라우저가 인식 못함 | WebVTT로 변환 후 `<track>` |
| 5 | WebVTT 첫 줄에 `WEBVTT` 누락 | 파일 전체 무시 | 반드시 첫 줄 `WEBVTT` |
| 6 | `<track default>` 누락 | 사용자가 매번 자막 켜야 함 | 주 언어 captions에 `default` |
| 7 | `srclang` `label` 누락 | 브라우저 메뉴에 무명 트랙 | 둘 다 명시 (BCP 47 + 사용자 가독 이름) |
| 8 | `kind="captions"` vs `"subtitles"` 혼동 | 청각장애 사용자 안내 부정확 | captions(소리 효과 포함) vs subtitles(번역) 구분 |
| 9 | 자막 색·배경 대비 부족 | 1.4.11 위반 (3:1 미달) | 검정 배경 + 흰 자막 또는 시스템 자막 설정 존중 |
| 10 | audio description 없는 시각 중심 영상 | 1.2.5 위반 | 별도 audio described 버전 또는 텍스트 대체 |
| 11 | transcript 미제공 | deafblind·검색·기록 손실 | 비디오 옆에 transcript 페이지 링크 |
| 12 | autoplay + 소리 강제 | 브라우저 차단 + 1.4.2 위반 | `muted` 자동재생 또는 사용자 트리거 |
| 13 | prefers-reduced-motion 무시한 배경 비디오 | 전정 장애 사용자에 트리거 | JS로 `autoplay` 제거 |
| 14 | `<video>` 안에 fallback 콘텐츠 없음 | 미지원 브라우저 사용자 차단 | `</video>` 직전에 다운로드·transcript 링크 |
| 15 | WebVTT 파일을 EUC-KR로 저장 | 한글 깨짐 | UTF-8 (또는 UTF-8 BOM) |
| 16 | 한 cue에 6줄·100자 자막 | 가독 불가 | 2줄·각 16자 이하 (방송 자막 관행) |
| 17 | 시각장애 사용자에 "여기 클릭하세요" 안내 | 시각 정보 의존 | "오른쪽 상단 '시작' 버튼" 처럼 위치·라벨 명시 |

---

## 14. 법적 의무 (간단)

> 주의: 법률은 빠르게 변하므로 실제 적용 시 법률 자문을 받을 것. 본 섹션은 *방향성 안내*에 한정한다.

| 지역 | 법령 | 적용 대상 | 미디어 요구 |
|------|------|-----------|--------------|
| 한국 | 장애인차별금지법(장차법) 제21조 + KWCAG 2.2(한국형 웹 콘텐츠 접근성 지침, WCAG 2.1 기반) | 공공기관·교육기관·법인·문화예술·의료·복지·교통·사업장 등 | 전자정보에 수화·문자 등 다양한 수단 제공 (자막·수어 권장) |
| 미국 | ADA Title III + Section 508 | 공공·교육·의료·일부 민간 | captions·audio description 의무 |
| 미국 판례 | Robles v. Domino's Pizza (9th Cir. 2019, 대법원 상고 기각 2019, 2021 합의 종결) | 민간 웹·앱 사업자 | 웹 접근성에 ADA Title III 적용 확립 |
| EU | European Accessibility Act (EAA), 2025-06-28 시행 | 전자상거래·통신·금융·교통·미디어 등 EU 소비자 대상 서비스 (EU 외 기업 포함) | WCAG 2.1 Level AA, 위반 시 최대 €100,000 또는 연매출 4% 과징금 |
| 글로벌 플랫폼 | YouTube·Netflix 등 자체 가이드 | 플랫폼 사용자 | 자체 자막 가이드 |

> 주의: 한국 장차법 제21조는 "수화, 문자 등 다양한 수단"을 요구하지만, *captions·audio description의 구체적 기술 요건*은 KWCAG 2.2(WCAG 2.1 기반)에 위임된다. 적용 의무자·시행 시기 세부는 법령·시행령을 직접 참조하라.
> 주의: EAA 본법은 2025-06-28부터 *신규* 제품·서비스에 적용되고, 이미 시장에 있는 서비스는 2030-06-28까지 유예된다.

---

## 15. 미디어 접근성 체크리스트 (실무 요약)

다음 항목을 모든 비디오 공개 전에 확인:

```
[ ] 영상 원어 captions (WebVTT) 제공  ─ 1.2.2 A
[ ] captions에 화자 식별·소리 효과 포함
[ ] WebVTT 파일 UTF-8 저장, 첫 줄 'WEBVTT'
[ ] <track default kind="captions" srclang="..." label="..."> 설정
[ ] transcript 텍스트 페이지 제공 (또는 본문 임베드) ─ 1.2.1·1.2.3
[ ] audio description 또는 대체 비디오 제공 ─ 1.2.3·1.2.5
[ ] 자동재생 비디오는 muted 또는 prefers-reduced-motion 존중
[ ] 5초 초과 자동 움직임은 일시정지 가능 ─ 2.2.2 A
[ ] 자막 색·배경 대비 3:1 이상 또는 사용자 설정 존중 ─ 1.4.11
[ ] poster 이미지의 의미를 인접 텍스트로 보완
[ ] 다국어 제공 시 captions(원어) + subtitles(타 언어) 구분
[ ] 자동 자막은 사람이 교정한 뒤에만 게시
```

이 체크리스트를 지나면 1.2.x Level A·AA의 대부분이 충족된다. AAA(수어·확장 audio description)는 별도 검토.
