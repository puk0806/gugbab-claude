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

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
