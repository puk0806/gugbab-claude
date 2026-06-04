---
skill: media-accessibility
category: frontend
version: v1
date: 2026-06-04
status: APPROVED
---

# media-accessibility 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `media-accessibility` |
| 스킬 경로 | `.claude/skills/frontend/media-accessibility/SKILL.md` |
| 검증일 | 2026-06-04 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 적용 범위 | 웹 미디어(video/audio) 접근성, WCAG 2.2 SC 1.2.x·1.4.2·2.2.2·2.3.3 |

---

## 1. 작업 목록 (Task List)

- [✅] W3C WCAG 2.2 공식 문서 (Understanding SC 1.2.x / 1.4.2) 확인
- [✅] W3C WebVTT 1 사양 (webvtt1) 확인
- [✅] MDN `<track>` 요소 + `kind` 속성 5종 확인
- [✅] MDN `prefers-reduced-motion` 사양 확인
- [✅] OpenAI Speech to text 가이드 (whisper-1 `response_format` 옵션) 확인
- [✅] WebAIM captions·transcripts 권고 확인
- [✅] 한국 장애인차별금지법 제21조 + KWCAG 2.2 적용 의무자 확인
- [✅] EAA (European Accessibility Act) 2025-06-28 시행 일자 확인
- [✅] Captions vs Subtitles 구분 + Closed/Open Captions 구분
- [✅] WebVTT 작성 예시 (헤더·타임스탬프·화자·위치·STYLE) 정리
- [✅] HTML5 `<video>` + `<track>` 통합 예시 작성
- [✅] Audio Description 제공 방식 3가지 비교
- [✅] Whisper API 자동 자막 생성 워크플로 정리
- [✅] prefers-reduced-motion CSS + JS 자동재생 비디오 제어
- [✅] 흔한 실수 패턴 17건 정리
- [✅] SKILL.md 파일 작성·보강 (Closed/Open Captions + 법적 의무 상세화)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | WCAG 2.2 SC 1.2.2 / WebVTT W3C / `<track>` MDN / Whisper API response_format / EAA effective date / prefers-reduced-motion / WCAG 1.4.2 / 장차법 제21조 | 7개 키워드, 공식 문서 7곳 + 보조 자료 다수 |
| 교차 검증 | WebSearch | 핵심 클레임 8개, 독립 소스 평균 2~3개 | VERIFIED 8 / DISPUTED 0 / UNVERIFIED 0 |
| 작성 | Edit | 기존 SKILL.md에 Closed/Open Captions 섹션 + 법적 의무 상세 추가 | 섹션 2.1 신규, 섹션 14 보강 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| W3C WCAG 2.2 Understanding SC 1.2.2 Captions Prerecorded | https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html | ⭐⭐⭐ High | 2026-06-04 | WCAG Level A 공식 정의 |
| W3C WCAG Understanding SC 1.4.2 Audio Control | https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html | ⭐⭐⭐ High | 2026-06-04 | 3초 초과 자동재생 규정 |
| W3C WebVTT 1 | https://www.w3.org/TR/webvtt1/ | ⭐⭐⭐ High | 2026-06-04 | WebVTT 표준 사양 |
| MDN `<track>` Element | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track | ⭐⭐⭐ High | 2026-06-04 | kind 5종(captions/subtitles/descriptions/chapters/metadata) |
| MDN WebVTT API | https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API | ⭐⭐⭐ High | 2026-06-04 | WebVTT 파싱·렌더링 |
| MDN `prefers-reduced-motion` | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion | ⭐⭐⭐ High | 2026-06-04 | CSS 미디어 쿼리 |
| OpenAI Speech to text Guide | https://developers.openai.com/api/docs/guides/speech-to-text | ⭐⭐⭐ High | 2026-06-04 | whisper-1 response_format: json/text/srt/verbose_json/vtt |
| WebAIM Captions, Transcripts, and Audio Descriptions | https://webaim.org/techniques/captions/ | ⭐⭐⭐ High | 2026-06-04 | 실무 권고 표준 자료 |
| 국가법령정보센터 — 장애인차별금지법 | https://www.law.go.kr/lsInfoP.do?lsiSeq=195377 | ⭐⭐⭐ High | 2026-06-04 | 제21조 정보접근 의무 원문 |
| AccessibleEU — EAA comes into effect June 2025 | https://accessible-eu-centre.ec.europa.eu/content-corner/news/eaa-comes-effect-june-2025-are-you-ready-2025-01-31_en | ⭐⭐⭐ High | 2026-06-04 | EAA 2025-06-28 시행 공식 안내 |
| W3C WCAG F93 Failure (autoplay) | https://www.w3.org/TR/WCAG20-TECHS/F93.html | ⭐⭐⭐ High | 2026-06-04 | 1.4.2 위반 사례 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 핵심 클레임 교차 검증

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|----------|----------|------|
| C1 | WCAG SC 1.2.2 Captions Prerecorded = Level A | W3C Understanding SC 1.2.2 | WCAG 2.2 공식 가이드라인 목록 | VERIFIED |
| C2 | WCAG SC 1.2.4 Captions Live = Level AA, SC 1.2.5 Audio Description Prerecorded = Level AA | W3C WCAG 2.2 | TestParty WCAG 2.2 criteria list | VERIFIED |
| C3 | WCAG SC 1.4.2 Audio Control: 3초 초과 자동재생 시 일시정지/정지/음량 제어 수단 | W3C Understanding SC 1.4.2 | W3C F93 Failure 기준 | VERIFIED |
| C4 | HTML `<track kind>` 값 5종: captions / subtitles / descriptions / chapters / metadata, 기본값은 subtitles, 잘못된 값은 metadata로 처리 | MDN `<track>` | MDN HTMLTrackElement.kind | VERIFIED |
| C5 | WebVTT 첫 줄은 `WEBVTT` 필수, 타임스탬프 구분자는 `.` (SRT는 `,`) | W3C WebVTT 1 §4 | MDN WebVTT_API | VERIFIED |
| C6 | OpenAI whisper-1 모델 `response_format` 옵션: `json`, `text`, `srt`, `verbose_json`, `vtt` | OpenAI Speech to text 가이드 | OpenAI API Reference (createTranscription) | VERIFIED |
| C7 | EAA(European Accessibility Act) 2025-06-28 시행, 기존 서비스는 2030-06-28까지 유예, WCAG 2.1 Level AA 기반 | AccessibleEU 공식 안내 | Bird & Bird / Ensono 법무 안내 | VERIFIED |
| C8 | 한국 장차법 제21조 = 정보통신·의사소통에서의 정당한 편의제공 의무, "수화·문자 등 다양한 수단" 제공 | 국가법령정보센터 본문 | 한국디지털접근성진흥원 관련법률 | VERIFIED |

### 4-2. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음 (8개 클레임 모두 VERIFIED)
- [✅] 버전 정보 명시: WCAG 2.2, WebVTT 1, KWCAG 2.2(WCAG 2.1 기반), EAA 2025-06-28 시행
- [✅] deprecated 패턴을 권장하지 않음 (`longdesc`는 사용 금지로 명시)
- [✅] 코드 예시가 실행 가능한 형태 (WebVTT, HTML `<video><track>`, Python Whisper, CSS prefers-reduced-motion, JS)

### 4-3. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL 6개 + 검증일 명시
- [✅] 핵심 개념 설명 포함 (Captions vs Subtitles, Closed/Open, audio description, transcript)
- [✅] 코드 예시 포함 (WebVTT 5종·HTML5 비디오·Whisper API·CSS+JS prefers-reduced-motion)
- [✅] 언제 사용할지 기준 포함 (WebVTT vs SRT, descriptions 트랙 vs 별도 더빙 영상 등)
- [✅] 흔한 실수 패턴 17건 포함

### 4-4. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (WebVTT 작성·`<track>` 속성 규칙·Whisper 워크플로 모두 즉시 적용 가능)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (한국어 자막 작성 함정·자동 자막 교정 워크플로 등)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 — **2026-06-04 수행 완료**
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 — **3/3 PASS**
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — **gap 없음, 보완 불필요**

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-04
**수행자**: skill-tester → general-purpose (frontend-developer 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부·anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 한국어 강연 영상(2인 화자, 박수 소리)에 WebVTT 자막 작성 및 `<video><track>` 통합 방법**
- PASS
- 근거: SKILL.md "4.1 기본 구조" (WEBVTT 첫 줄, `<v 화자명>` 태그, 소리 효과 대괄호), "4.3 한국어 작성 시 함정" (UTF-8, 2줄·16자 이하), "5. HTML5 `<video>` + `<track>` 통합 예시" (`kind="captions"`, `srclang="ko"`, `label`, `default`, `crossorigin="anonymous"`), 섹션 13 #4·5·6·7 (SRT 직접 사용·WEBVTT 누락·default 누락·srclang/label 누락 금지)
- 상세: 모든 핵심 속성·WebVTT 작성 규칙이 SKILL.md에 코드 예시와 함께 존재. anti-pattern(SRT 직접 연결, WEBVTT 첫 줄 누락) 회피 확인

**Q2. 영문 강의에 한국어 번역 subtitles만 제공 시 WCAG 1.2.2 충족 여부**
- PASS
- 근거: SKILL.md "2. Captions vs Subtitles" 표 (captions만 WCAG 1.2.2 충족 수단), 섹션 2 주의 (원어 자막 필요 오해 경고), 섹션 13 #3 ("원어 자막 우선"), #8 (kind 혼동 경고), "5. HTML5 `<video>` + `<track>` 통합 예시" (captions + subtitles 동시 제공 패턴)
- 상세: 영어 원어 captions 필수, 한국어는 subtitles로 추가, 화자 식별·소리 효과 포함 요건 모두 근거 존재

**Q3. 랜딩 페이지 autoplay loop muted 배경 비디오의 prefers-reduced-motion 처리**
- PASS
- 근거: SKILL.md "12.1 CSS 기본 처리" (`@media (prefers-reduced-motion: reduce)` CSS), "12.2 자동재생 비디오 처리" (CSS 불충분·JS 병행 필수, `matchMedia`·`removeAttribute('autoplay')`·`video.pause()`·`addEventListener('change')` 완전 코드), "12.3 autoplay 정책" (WCAG 1.4.2·2.2.2), 섹션 13 #13
- 상세: CSS만으로 video 자동재생 차단 불가 명시, WCAG SC 2개 함께 적용 근거 완비. anti-pattern(CSS만 적용) 명확히 구분됨

### 발견된 gap

없음.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (라이브러리·표준 사양 사용법 — content test로 충분)
- 최종 상태: APPROVED

---

> 아래는 skill-creator가 남긴 예상 질문 후보 (참고용, 실제 수행으로 대체됨)

### 테스트 케이스 후보 1: WebVTT 자막 작성

**입력 (질문/요청):**
```
한국어 강연 영상에 청각장애 사용자를 위한 자막을 달려고 합니다.
WebVTT 파일을 어떻게 작성하고, HTML `<video>`에 어떻게 붙여야 하나요?
화자가 2명이고 중간에 박수 소리가 나옵니다.
```

**기대 결과 (SKILL.md 기반):**
- 첫 줄 `WEBVTT` 필수, 타임스탬프 `HH:MM:SS.mmm`
- `<v 화자명>` 태그로 화자 식별
- `[박수]` 처럼 대괄호로 소리 효과 표기
- `<track kind="captions" srclang="ko" label="한국어 자막" default>` 형태
- UTF-8 저장, 한 cue 2줄·16자 이하 권장

### 테스트 케이스 후보 2: Captions vs Subtitles 구분

**입력:**
```
영문 강의 영상이 있고 한국어 번역 자막만 달려고 합니다.
`<track kind="subtitles">`로 충분한가요, 아니면 `kind="captions">`도 필요한가요?
WCAG 1.2.2 충족 관점에서 답해주세요.
```

**기대 결과:**
- subtitles는 외국어 번역, captions는 청각장애 보조
- WCAG 1.2.2 충족하려면 *영상 원어인 영어 captions*이 필요 (한국어 subtitles는 1.2.2 충족 수단 아님)
- captions에는 화자 식별·소리 효과 포함 필수
- 다국어 트랙 제공 시 영어 captions(원어) + 한국어 subtitles(번역) 동시 제공이 정석

### 테스트 케이스 후보 3: prefers-reduced-motion + 배경 비디오

**입력:**
```
랜딩 페이지 배경에 autoplay loop muted 비디오를 깔았는데
접근성 검수에서 prefers-reduced-motion 위반이라고 합니다.
어떻게 처리해야 하나요?
```

**기대 결과:**
- CSS만으로는 video 자동재생을 막을 수 없음 → JS 병행 필요
- `matchMedia('(prefers-reduced-motion: reduce)')` 감지
- `mq.matches`면 `removeAttribute('autoplay')` + `video.pause()`
- WCAG 2.2.2(5초 초과 자동 움직임 정지 수단)와 1.4.2(3초 초과 자동 오디오) 함께 고려
- `addEventListener('change', ...)`로 사용자 설정 변경 대응

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (8개 클레임 VERIFIED) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-06-04) |
| **최종 판정** | **APPROVED** |

> 본 스킬은 *content test로 충분*한 카테고리(라이브러리·표준 사양 사용법). agent content test 3/3 PASS로 APPROVED 전환 완료 (verification-policy.md "실사용 검증이 필요 없는 스킬" 조항).

---

## 7. 개선 필요 사항

- [✅] skill-tester를 통한 agent content test 수행 후 섹션 5·6 업데이트 (2026-06-04 완료, 3/3 PASS)
- [❌] WCAG 3.0(W.I.P) 발간 시 SC 매핑 재검토
- [❌] Whisper 후속 모델(gpt-4o-transcribe·gpt-4o-mini-transcribe)이 `vtt`/`srt`를 지원하기 시작하면 섹션 8 보강
- [❌] EAA 2030-06-28 기존 서비스 유예 만료 시점 직전(2030년) 재검증

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-04 | v1 | 최초 작성 (verification.md). SKILL.md에 Closed/Open Captions 섹션 추가, 법적 의무 표를 장차법 제21조·EAA 2025-06-28·Robles 판례까지 상세화 | skill-creator |
| 2026-06-04 | v1 | 2단계 실사용 테스트 수행 (Q1 WebVTT 작성+track 통합 / Q2 Captions vs Subtitles WCAG 1.2.2 / Q3 prefers-reduced-motion autoplay 처리) → 3/3 PASS, APPROVED 전환 | skill-tester |
