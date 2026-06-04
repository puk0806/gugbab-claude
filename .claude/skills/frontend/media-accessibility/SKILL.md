---
name: media-accessibility
description: 비디오·오디오·이미지 미디어 접근성 구현 가이드. WebVTT/SRT 자막 작성, HTML5 video+track, audio description, transcript, Whisper 자동 생성, prefers-reduced-motion까지 실제 작성·구현 패턴 카탈로그
---

# 미디어 접근성 구현 가이드

> 소스:
> - WCAG 2.2 SC 1.2.x — https://www.w3.org/TR/WCAG22/
> - WebVTT 1 — https://www.w3.org/TR/webvtt1/
> - MDN `<track>` — https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track
> - WebAIM Captions — https://webaim.org/techniques/captions/
> - OpenAI Speech to text — https://developers.openai.com/api/docs/guides/speech-to-text
> - MDN prefers-reduced-motion — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
>
> 검증일: 2026-06-04
> 적용 범위: 웹 미디어 콘텐츠 (HTML5 video/audio + 자막·설명·이미지 alt)

이 스킬은 *미디어 접근성의 실제 작성·구현 패턴*만 다룬다. WCAG SC 정의·전체 체크리스트는 `wcag-2.2-checklist` 스킬에 위임한다. 이미지 alt text의 상세 작성 가이드는 `image-optimization-seo` 스킬에 위임한다.

---

## 1. WCAG 2.2 미디어 관련 Success Criteria 요약

미디어 접근성과 직접 관련된 SC 목록이다. 각 SC의 정확한 정의·전체 적용 범위는 `wcag-2.2-checklist` 또는 W3C 공식 문서를 참조한다.

| SC | 제목 | Level | 핵심 요구 |
|----|------|-------|-----------|
| 1.1.1 | Non-text Content | A | 비텍스트 콘텐츠(이미지·아이콘)에 텍스트 대체 |
| 1.2.1 | Audio-only and Video-only (Prerecorded) | A | 오디오 only → transcript 제공 / 비디오 only → audio description 또는 transcript |
| 1.2.2 | Captions (Prerecorded) | A | 사전 녹화된 동기화 미디어의 모든 오디오에 captions 제공 |
| 1.2.3 | Audio Description or Media Alternative (Prerecorded) | A | 사전 녹화된 비디오에 audio description *또는* 텍스트 대체 |
| 1.2.4 | Captions (Live) | AA | 라이브 오디오 콘텐츠에 captions 제공 |
| 1.2.5 | Audio Description (Prerecorded) | AA | 사전 녹화된 비디오에 audio description 제공 (1.2.3보다 엄격 — 대체본 불허) |
| 1.2.6 | Sign Language (Prerecorded) | AAA | 수어 통역 제공 |
| 1.2.7 | Extended Audio Description | AAA | 일시정지 포함한 확장 audio description |
| 1.2.8 | Media Alternative (Prerecorded) | AAA | 동기화 미디어의 완전한 텍스트 대체본 |
| 1.2.9 | Audio-only (Live) | AAA | 라이브 오디오 콘텐츠의 텍스트 대체 |
| 1.4.2 | Audio Control | A | 3초 초과 자동 재생 오디오는 일시정지·정지·음량 제어 가능 |

**실무 최소선:** Level A (1.2.1 / 1.2.2 / 1.2.3) + Level AA (1.2.4 / 1.2.5) = 사실상 모든 비디오에 *captions + audio description*.

> 주의: 1.2.3은 audio description "또는" 텍스트 대체로 충족 가능하나, 1.2.5(AA)는 audio description 자체를 요구한다. AA를 노리면 1.2.3 충족을 위해 텍스트 대체본만 제공해서는 안 된다.

---

## 2. Captions vs Subtitles — 한국어 혼동 정리

한국어에서 "자막"은 captions과 subtitles 둘 다를 가리키지만, *접근성 자막은 captions*다.

| 구분 | Captions (청각장애 자막) | Subtitles (외국어 자막) |
|------|--------------------------|-------------------------|
| 대상 사용자 | 청각장애·난청 사용자 | 외국어 사용자 (소리는 들을 수 있음 가정) |
| 포함 내용 | 대사 + **화자 식별** + **소리 효과**(음악·노크·웃음 등) | 대사 번역만 |
| 접근성 기여 | WCAG 1.2.2 충족 | 직접적인 접근성 보조 수단 아님 |
| HTML `<track kind>` | `captions` | `subtitles` |
| 예시 표기 | `[전화벨 울림]` / `엄마: 어디 갔니?` | `엄마: Where did you go?` |

WebAIM 권고: 청각장애 사용자를 위해 captions은 반드시 화자 식별과 의미 있는 소리 효과를 포함해야 한다.

> 주의: 한국어 콘텐츠를 한국어 사용자에게 제공할 때도 captions은 필요하다 ("외국어 번역이 아니니까 자막이 필요 없다"는 흔한 오해).

### 2.1 Closed Captions vs Open Captions

captions은 또 *전달 방식*에 따라 두 가지로 나뉜다.

| 구분 | Closed Captions (CC) | Open Captions (OC) |
|------|----------------------|---------------------|
| on/off | 사용자가 켜고 끌 수 있음 | 영상에 하드코딩(burn-in), 끌 수 없음 |
| 구현 | 별도 자막 파일(WebVTT/SRT)을 `<track>`으로 로드 | 영상 편집 단계에서 픽셀로 합성 |
| 다국어 | 다국어 트랙 추가 용이 | 언어별 별도 영상 필요 |
| 검색·SEO | 자막 텍스트가 인덱싱 가능 | 픽셀이므로 인덱싱 불가 |
| 접근성 | 사용자 자막 설정 존중 가능 | 사용자가 끌 수 없음 (지하철·도서관 등 무음 환경에는 장점) |
| 권장 상황 | 일반 웹 비디오 (대부분) | Stories·Reels·SNS 짧은 영상, 폰트 통제 필요한 브랜드 영상 |

웹 표준은 **Closed Captions**(`<track kind="captions">`)을 기본 권장한다. Open Captions은 그 위에 *추가*로 제공할 수 있다.

---

## 3. 자막 파일 형식 비교

| 형식 | 확장자 | 스타일 | 위치 제어 | 브라우저 `<track>` 지원 | 주 사용처 |
|------|--------|--------|-----------|--------------------------|-----------|
| SRT (SubRip) | `.srt` | ❌ (일부 플레이어가 `<i>` 지원) | ❌ | ❌ 표준 아님 (변환 필요) | 광범위 호환, 다운로드 배포 |
| WebVTT | `.vtt` | ✅ CSS 기반 | ✅ `position:` `line:` `align:` | ✅ HTML5 표준 | 웹 비디오 |
| TTML / DFXP | `.ttml` `.dfxp` | ✅ 복잡 | ✅ | 제한적 | 방송용 (SMPTE-TT) |

**선택 기준:**
- 웹에서 `<video>` + `<track>`으로 제공 → **WebVTT**
- 사용자가 다운로드하여 외부 플레이어로 재생 → **SRT** (호환성)
- 둘 다 필요하면 동일 내용으로 SRT + WebVTT 둘 다 제공

### SRT ↔ WebVTT 핵심 차이

| 항목 | SRT | WebVTT |
|------|-----|--------|
| 헤더 | 없음 | `WEBVTT` (필수, 첫 줄) |
| 타임스탬프 구분자 | `,` (쉼표) — `00:01:12,500` | `.` (마침표) — `00:01:12.500` |
| Cue 번호 | 거의 모든 cue 앞 필수 | 선택 (식별자로) |
| 인코딩 | 관행상 UTF-8 (BOM 가능) | UTF-8 필수 |

---

## 4. WebVTT 작성 예시

### 4.1 기본 구조

```vtt
WEBVTT

1
00:00:01.000 --> 00:00:04.000
안녕하세요. 미디어 접근성 가이드입니다.

2
00:00:04.500 --> 00:00:08.000
[배경 음악 시작]

3
00:00:08.000 --> 00:00:12.000
<v 진행자>오늘은 자막 작성법을 다룹니다.

4
00:00:12.000 --> 00:00:16.000
<v 게스트>WebVTT는 HTML5 표준 형식입니다.
```

핵심 규칙:
- **첫 줄은 반드시 `WEBVTT`** (BOM 허용, 그 뒤에 공백·탭·주석 가능)
- cue 사이는 **빈 줄로 구분**
- 타임스탬프는 `HH:MM:SS.mmm` 또는 `MM:SS.mmm` (시간 0이어도 생략 가능)
- 화자 식별은 `<v 화자명>대사`
- 화자 태그가 cue의 유일한 내용이면 `</v>` 종료 태그 생략 가능

### 4.2 스타일링 — 클래스·위치·정렬

```vtt
WEBVTT

STYLE
::cue(.narrator) {
  color: yellow;
  font-style: italic;
}
::cue(v[voice="진행자"]) {
  color: cyan;
}

NOTE 이 cue는 화면 상단에 표시한다.

1
00:00:01.000 --> 00:00:04.000 line:0 position:50% align:center
<c.narrator>저 멀리서 소리가 들린다.</c>

2
00:00:05.000 --> 00:00:08.000
<v 진행자>WebVTT는 위치 지정도 됩니다.
```

cue settings (타임스탬프 뒤 공백으로 구분):
- `line:N` — 표시 행 위치 (음수는 하단부터, `0`은 상단)
- `position:N%` — 가로 위치
- `align:start|center|end` — 정렬
- `size:N%` — 너비

`STYLE` 블록은 `WEBVTT` 헤더 다음과 첫 cue 이전에만 위치할 수 있다.

### 4.3 한국어 작성 시 함정

- **인코딩**: UTF-8로 저장. UTF-8 BOM은 WebVTT 사양상 허용되지만, 일부 도구는 BOM 없는 UTF-8을 요구한다. 호환성 최우선 시 BOM 없이 저장.
- **타임라인 정밀도**: 청각장애 사용자의 자막 가독 속도는 분당 약 160-180단어 권장. 한국어는 어절 단위로 끊고, 한 cue는 2줄·각 줄 16자 이하 권장 (방송 자막 관행).
- **소리 효과 표기**: `[전화벨]` `[음악 점차 작아짐]` 처럼 대괄호로 감싸 대사와 구분.

---

## 5. HTML5 `<video>` + `<track>` 통합 예시

```html
<video controls width="800" poster="/media/poster.jpg" crossorigin="anonymous">
  <source src="/media/lesson.mp4" type="video/mp4">
  <source src="/media/lesson.webm" type="video/webm">

  <!-- 한국어 captions (기본 활성화) -->
  <track
    default
    kind="captions"
    src="/media/lesson.ko.vtt"
    srclang="ko"
    label="한국어 자막">

  <!-- 영어 captions -->
  <track
    kind="captions"
    src="/media/lesson.en.vtt"
    srclang="en"
    label="English Captions">

  <!-- 일본어 subtitles (번역) -->
  <track
    kind="subtitles"
    src="/media/lesson.ja.vtt"
    srclang="ja"
    label="日本語字幕">

  <!-- audio descriptions (텍스트 트랙) -->
  <track
    kind="descriptions"
    src="/media/lesson.descriptions.ko.vtt"
    srclang="ko"
    label="음성 해설">

  <!-- 챕터 -->
  <track
    kind="chapters"
    src="/media/lesson.chapters.vtt"
    srclang="ko">

  <p>
    브라우저가 비디오를 지원하지 않습니다.
    <a href="/media/lesson.mp4">비디오 다운로드</a> |
    <a href="/media/lesson-transcript.html">스크립트 보기</a>
  </p>
</video>
```

**핵심 규칙 (MDN `<track>` 사양):**
- `src` — 필수
- `srclang` — `kind="subtitles"`일 때 필수. captions에도 강력 권장. 값은 [BCP 47](https://www.rfc-editor.org/info/bcp47) 태그 (`ko`, `en`, `ja`)
- `label` — 사용자에게 표시되는 트랙 이름. 누락 시 브라우저가 무명 트랙으로 표시 → UX 나쁨
- `default` — *한 트랙에만* 부여 가능. captions은 일반적으로 사용자의 주 언어 트랙에 부여
- 같은 `kind` + `srclang` + `label` 조합의 `<track>`은 중복 불가

> 주의: `kind="descriptions"`는 *텍스트로 작성된 음성 설명 트랙*으로, 브라우저가 TTS로 읽거나 보조 기술이 접근한다. 다만 2026년 시점에서도 브라우저별 지원이 일관적이지 않으므로, 시각장애 사용자 접근성이 중요한 콘텐츠는 *오디오로 더빙된 별도 비디오 버전*을 함께 제공하는 것이 안전하다.

---

## 6. Audio Description — 시각 정보의 음성화

audio description은 비디오의 *시각 정보를 음성으로 추가 설명*하는 트랙이다. 시각장애·저시력 사용자를 위함.

### 6.1 제공 방식 3가지

| 방식 | 설명 | 권장도 |
|------|------|--------|
| **별도 비디오 버전** | "audio described" 라벨이 붙은 비디오 파일을 별도 제공. 기존 오디오 트랙 위에 설명이 더빙됨 | ⭐⭐⭐ 가장 안정적 |
| **별도 오디오 트랙** | 같은 비디오 안에 다중 오디오 트랙 (HLS/DASH에서 흔함). 사용자가 트랙 전환 | ⭐⭐ 플랫폼 의존 |
| **WebVTT descriptions 트랙** | `kind="descriptions"`로 텍스트 제공, 보조 기술이 음성 합성 | ⭐ 지원 제한적 |

### 6.2 WebVTT descriptions 예시

```vtt
WEBVTT

NOTE 시각 정보를 짧고 명확하게 기술. 대사 사이의 정적 구간에만 배치.

1
00:00:05.000 --> 00:00:07.000
화자가 칠판에 'akrasia'를 적는다.

2
00:00:20.500 --> 00:00:22.000
화면 왼쪽 하단에 그래프가 나타난다.
```

작성 원칙 (WebAIM):
- **대사 사이의 정적 구간에만** 배치 (사용자가 두 소리를 동시에 듣지 않도록)
- 현재형·간결한 문장
- "보입니다", "나타납니다" 같은 시각 동사를 줄이고 사실 기술
- 가능하면 *원본 콘텐츠 자체*가 시각 정보를 음성으로 통합하도록 설계 (예: "여기를 클릭" → "오른쪽 상단 '시작' 버튼을 클릭")

### 6.3 1.2.3 vs 1.2.5

- **1.2.3 (Level A)**: audio description **또는** 완전한 텍스트 대체본
- **1.2.5 (Level AA)**: audio description **자체를 요구** (대체본 불허)

AA 준수가 목표면 1.2.3을 텍스트 대체본으로만 충족해서는 안 된다.

---

## 7. Transcript — 전체 텍스트 기록

transcript는 비디오·오디오의 *완전한 텍스트 문서*로, 자막보다 더 상세하다.

| 항목 | Captions | Transcript |
|------|----------|------------|
| 위치 | 비디오 위에 동기화 표시 | 별도 페이지·아래쪽 텍스트 영역 |
| 동기화 | 필요 | 불필요 |
| 포함 | 대사 + 소리 효과 | 대사 + 소리 효과 + **시각 정보 설명** |
| 접근 방식 | 비디오 플레이어 의존 | 독립 텍스트 (스크린리더·점자 단말기 직접 접근) |
| WCAG 충족 | 1.2.2 | 1.2.1 (오디오 only) / 1.2.3·1.2.8 |

**핵심 가치:**
- **Deafblind 사용자**: 점자 단말기로 transcript 직접 읽음. captions으로는 불가
- **인지 장애 사용자**: 자기 속도로 읽음
- **SEO·검색**: 페이지 내 텍스트로 인덱싱
- **기록·인용**: 시간 지나도 텍스트로 보존

WebAIM 공식 권고: *대부분의 웹 비디오는 captions과 transcript 둘 다 제공해야 한다.*

### Transcript 작성 형식 예시

```markdown
# 영상 제목 — 스크립트

> 영상 길이 5:30, 게시일 2026-06-01

[00:00] [경쾌한 인트로 음악]
[00:05] 진행자: 안녕하세요, 오늘은 미디어 접근성을 다룹니다.
[00:12] (화면에 'media-accessibility' 텍스트가 나타난다)
[00:15] 진행자: 먼저 captions과 subtitles의 차이부터 보겠습니다.
...
```

- 시간 인덱스 + 화자 명시 + 시각 정보 괄호 표기
- HTML 페이지로 게시하여 URL로 접근 가능하게

---

## 8. 자동 자막 생성 — OpenAI Whisper API

### 8.1 SRT/VTT 직접 출력

OpenAI Speech to text API (`whisper-1` 모델)는 `response_format`으로 `srt`·`vtt`를 직접 출력한다.

```python
from openai import OpenAI

client = OpenAI()

with open("lesson.mp3", "rb") as audio:
    # WebVTT 출력
    vtt = client.audio.transcriptions.create(
        file=audio,
        model="whisper-1",
        response_format="vtt",
        language="ko",  # ISO-639-1, 정확도 향상
    )

with open("lesson.ko.vtt", "w", encoding="utf-8") as f:
    f.write(vtt)
```

지원되는 `response_format`:
- `json` (기본) — 텍스트만
- `text` — 평문
- `srt` — SRT 자막
- `verbose_json` — 단어별 타임스탬프 포함 메타데이터
- `vtt` — WebVTT 자막

### 8.2 자동 자막은 *반드시 사람 교정* 필요

WCAG 공식 입장: **"자동 자막은 충분히 정확하다고 확인되지 않는 한 사용자 요구·접근성 요건을 충족하지 못한다."**

- YouTube 자동 자막 정확도: 일반적으로 60-95% (오디오 품질·억양·고유명사·전문용어에 따라 큰 편차). 1.2.2 충족 불가.
- Whisper 한국어 정확도는 영어보다 낮은 편이며, 외래어·고유명사·기술 용어에서 특히 실수가 잦다.
- **자동 생성 → 사람이 단어 단위 교정 → 화자 식별 추가 → 소리 효과 추가** 워크플로가 표준.

### 8.3 권장 워크플로

```
1. Whisper API → 초안 VTT 생성
2. 텍스트 교정 (오인식·외래어·고유명사)
3. 화자 식별 추가 (<v 화자명>)
4. 소리 효과 추가 ([음악], [전화벨])
5. 줄바꿈·길이 조정 (한 cue 2줄·16자 이하)
6. 비디오와 함께 재생하며 타임라인 검수
```

---

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
