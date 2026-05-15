---
skill: media-recorder-api
category: frontend
version: v1
date: 2026-05-14
status: PENDING_TEST
---

# media-recorder-api 스킬 검증

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)  ← 완료
  ├─ 공식 문서 기반 작성 (MDN, W3C, OpenAI Speech 가이드)
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST  ← 실사용 필수 카테고리(서버 전송·인코딩 결과물 검증 필요)

[2단계] 실제 사용 중 (온라인 검증)
  ├─ 실제 브라우저(특히 iOS Safari)에서 녹음 → Whisper 응답 확인
  ├─ 마이크 인디케이터·메모리 누수 검증
  └─ 통과 후 → APPROVED
```

> 본 스킬은 *실사용 필수* 카테고리에 해당한다. 실제 녹음 결과물(Blob)이 Whisper에서 정상 transcription을 받아야 비로소 검증 완료된다(`verification-policy.md` 참조).

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `media-recorder-api` |
| 스킬 경로 | `.claude/skills/frontend/media-recorder-api/SKILL.md` |
| 검증일 | 2026-05-14 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (MDN MediaRecorder, MDN MediaStream Recording API, MDN isTypeSupported)
- [✅] 공식 표준 소스 확인 (W3C MediaStream Recording)
- [✅] OpenAI Whisper API 입력 포맷·크기 한도 확인
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-05-14, Baseline Widely available since April 2021, Safari 18.4부터 webm/opus 추가 반영)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (isTypeSupported 폴백 사슬, tracks.stop, multipart 자동 boundary)
- [✅] 코드 예시 작성 (TS 기반 recordOnce, React useEffect cleanup, Whisper FormData)
- [✅] 흔한 실수 패턴 정리 (10개 항목 + iOS Safari 함정 5개)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | MDN MediaRecorder 메인 페이지 | 생성자·옵션·이벤트·메서드 시그니처 확인 |
| 조사 | WebFetch | MDN MediaStream Recording API 개요 | 6단계 기본 흐름 + BlobEvent 인터페이스 확인 |
| 조사 | WebFetch | MDN isTypeSupported_static | 지원 MIME 후보 목록 + 반환값 의미 확인 |
| 조사 | WebFetch | W3C MediaStream Recording 명세 | stop 시 dataavailable→stop 순서, requestData 동작, 상태 머신 |
| 조사 | WebSearch | OpenAI Whisper API multipart 포맷·크기 한도 | 9개 입력 포맷·25MB 한도 확인 (OpenAI 공식 가이드·헬프센터) |
| 조사 | WebSearch | iOS Safari MediaRecorder 코덱 지원 | Safari 18.4부터 webm/opus 추가, 이전엔 mp4 |
| 교차 검증 | WebSearch | stream.getTracks().stop() 메모리 누수 | Mozilla bugzilla + Electron issue 등 복수 소스로 VERIFIED |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| MDN MediaRecorder | https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder | ⭐⭐⭐ High | 2026-05-14 | 1순위 공식 문서 |
| MDN MediaStream Recording API | https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API | ⭐⭐⭐ High | 2026-05-14 | 1순위 공식 문서 |
| MDN isTypeSupported_static | https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static | ⭐⭐⭐ High | 2026-05-14 | 정적 메서드 상세 |
| W3C MediaStream Recording | https://www.w3.org/TR/mediastream-recording/ | ⭐⭐⭐ High | 2026-05-14 | 표준 명세 (이벤트 순서·상태 머신) |
| OpenAI Speech to text 가이드 | https://platform.openai.com/docs/guides/speech-to-text | ⭐⭐⭐ High | 2026-05-14 | Whisper 입력 포맷·크기 한도 |
| WebKit blog: MediaRecorder API | https://webkit.org/blog/11353/mediarecorder-api/ | ⭐⭐⭐ High | 2026-05-14 | Safari 측 공식 (코덱 지원 보강 검증) |
| Mozilla bugzilla #1376134 | https://bugzilla.mozilla.org/show_bug.cgi?id=1376134 | ⭐⭐ Medium | 2026-05-14 | track.stop 누락 메모리 누수 원인 (보조 근거) |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Safari 18.4 webm/opus 추가, Baseline since April 2021)
- [✅] deprecated된 패턴을 권장하지 않음 (`Content-Type` 수동 박기 등 안티패턴은 명시적으로 금지 표기)
- [✅] 코드 예시가 실행 가능한 형태임 (TS, React 모두)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (12개 섹션)
- [✅] 코드 예시 포함 (TS 함수형 + React Hook + Whisper 전송)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (상단 표)
- [✅] 흔한 실수 패턴 포함 (§10 iOS Safari 함정 + §11 일반)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (복붙 가능한 폴백 사슬·cleanup 패턴 포함)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X — 짝 스킬 참조도 일반화된 카테고리/이름만)

### 4-4. 교차 검증한 핵심 클레임

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|----------|----------|------|
| 1 | MediaRecorder 생성자는 `(stream, { mimeType, audioBitsPerSecond })` 형태 | MDN MediaRecorder | W3C 명세 | VERIFIED |
| 2 | `stop` 이벤트는 마지막 `dataavailable` *뒤에* 발생한다 | W3C 명세 | MDN MediaStream Recording API | VERIFIED |
| 3 | `MediaRecorder.stop()`만으로는 트랙이 살아있어 메모리 누수·마이크 인디케이터 잔존 | Mozilla bugzilla #1376134 | MDN getTracks (보조) + 다수 커뮤니티 케이스 | VERIFIED |
| 4 | Whisper API 입력 포맷: flac/mp3/mp4/mpeg/mpga/m4a/ogg/wav/webm, 25MB 한도 | OpenAI Speech to text 가이드 | OpenAI 헬프센터 Audio API FAQ | VERIFIED |
| 5 | iOS Safari 18.3 이하는 `audio/webm` 미지원, 18.4부터 `audio/webm;codecs=opus` 지원 | WebKit blog | Build with Matija 글 + caniuse | VERIFIED |
| 6 | `start(timeslice)` 청크는 단독 재생 보장 없음 (WebM은 헤더가 첫 청크에만) | addpipe 블로그 "Dealing With Huge MediaRecorder Chunks" | media-codings 글 | VERIFIED |

DISPUTED 0 / UNVERIFIED 0.

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-14 skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 3/3 PASS)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-14
**수행자**: skill-tester → general-purpose (frontend-developer 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. iOS Safari 17 이하에서 isTypeSupported 폴백 사슬 적용 시 어떤 MIME 타입이 선택되는가?**
- PASS
- 근거: SKILL.md "§2 MIME 타입 선택 — isTypeSupported() 폴백 사슬" 섹션 + 브라우저별 기본 컨테이너 표
- 상세: `audio/webm;codecs=opus` → `audio/webm` → `audio/mp4;codecs=mp4a.40.2` 순서대로 `isTypeSupported()` 결과가 false이며, iOS Safari 17 이하는 표에서 `audio/mp4` (AAC-LC)로 명시됨. §10 iOS Safari 함정 표에서도 "audio/webm 미지원 (Safari 18.3 이하)" 항목으로 교차 확인됨.

**Q2. recorder.stop() 호출 직후 즉시 chunks 배열로 Blob을 만들면 안 되는 이유와 올바른 비동기 패턴은?**
- PASS
- 근거: SKILL.md "§3 이벤트와 상태" 섹션 + "§1 기본 흐름" 코드 + "§11 흔한 실수" 항목
- 상세: §3에서 `stop` 이벤트는 "마지막 dataavailable가 발생한 직후" 발생한다고 W3C 명세 기준으로 명시. §1 코드에서 `Promise<Blob>`으로 `onstop` 대기하는 패턴을 제시. §11에서 "stop() 호출 후 즉시 Blob 사용 → stop 이벤트 대기 필수. 비동기"로 명시함. anti-pattern(즉시 접근) 및 올바른 패턴(stop 이벤트 await) 모두 근거 존재.

**Q3. React useEffect cleanup에서 recorder.stop()만 호출하면 어떤 문제가 생기고, 올바른 정리 패턴은?**
- PASS
- 근거: SKILL.md "§8 리소스 정리 — 가장 흔한 버그" 섹션 + "§11 흔한 실수" 마지막 항목
- 상세: §8에서 `MediaRecorder.stop()`은 녹음만 멈추고 `MediaStreamTrack`은 여전히 활성 상태로 메모리 증가 + 마이크 인디케이터 미해제를 설명. React `useEffect` cleanup 코드 예시(`recorder?.stop()` + `stream?.getTracks().forEach(t => t.stop())`)를 §8에서 제공. §11에서 "컴포넌트 언마운트 시 recorder.stop()만 호출 → tracks 정리 누락. cleanup에 둘 다 넣기"로 명시.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md에서 명확한 근거 섹션 및 코드가 존재했고, anti-pattern도 §8·§10·§11에 명시됨.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 카테고리 (서버 전송 결과물·실 디바이스 동작 검증 필요)
- 최종 상태: PENDING_TEST 유지 (content test PASS이나 실 디바이스 검증 전까지 APPROVED 전환 보류)

---

> 실사용 필수 카테고리이므로 PENDING_TEST 유지. 실제 PWA에서 다음 시나리오로 검증 예정:

### 테스트 시나리오 1: 데스크탑 Chrome — 기본 녹음 → Whisper transcription

**입력:** 사용자 5초 음성 ("안녕하세요 테스트입니다") → `start()`/`stop()` → Blob → `/api/whisper-proxy`

**기대 결과:**
- `audio/webm;codecs=opus` 선택됨
- Blob size > 0
- Whisper 응답 `text === "안녕하세요 테스트입니다"` 또는 유사 문자열
- `stream.getTracks().forEach(t => t.stop())` 후 탭 마이크 인디케이터 꺼짐

**실제 결과:** (미수행)
**판정:** PENDING

### 테스트 시나리오 2: iOS Safari (16.x · 18.4+ 양쪽)

**입력:** 같은 5초 음성 → 폴백 사슬 적용 → 전송

**기대 결과:**
- Safari 17 이하: `audio/mp4` 선택 → Whisper에서 m4a로 인식
- Safari 18.4+: `audio/webm;codecs=opus` 선택
- 양쪽 모두 transcription 정상 수신
- 백그라운드 진입 시 pause→resume 정상

**실제 결과:** (미수행)
**판정:** PENDING

### 테스트 시나리오 3: 메모리 누수 검증

**입력:** 컴포넌트 mount → 녹음 → unmount 30회 반복

**기대 결과:**
- DevTools Memory 탭에서 detached MediaStream 누적 없음
- 탭 마이크 인디케이터 매번 꺼짐

**실제 결과:** (미수행)
**판정:** PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 교차 검증 클레임 6개 | ✅ 6 VERIFIED / 0 DISPUTED / 0 UNVERIFIED |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-14 skill-tester 수행) |
| 실사용 결과물 테스트 | ❌ 미실행 (실 디바이스 녹음·Whisper 응답 검증 예정) |
| **최종 판정** | **PENDING_TEST** (content test PASS, 실 디바이스 검증 대기 중) |

> 본 스킬은 *실사용 필수* 카테고리(서버 전송 결과물·실 디바이스 동작 검증 필요)에 해당하므로 content test PASS 후에도 실 디바이스 검증 전까지 PENDING_TEST 유지.

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-14 완료, 3/3 PASS)
- [❌] iOS Safari 실 디바이스 16.x / 18.4+ 양쪽 녹음·전송 검증 — **차단 요인**: 실사용 필수 카테고리이므로 APPROVED 전환의 전제 조건
- [❌] 25MB 초과 케이스에서 비트레이트 다운 vs 분할 업로드 비교 데이터 추가 — 선택 보강 (차단 요인 아님)
- [❌] `ffmpeg.wasm` 도입 시 번들·메모리 실측 수치 추가 — 선택 보강 (차단 요인 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성. MDN·W3C·OpenAI Speech 가이드 기반 12개 섹션 + 6개 클레임 교차 검증 완료. PENDING_TEST 판정. | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 isTypeSupported iOS Safari 폴백 / Q2 stop 이벤트 비동기 Blob 패턴 / Q3 React useEffect cleanup 리소스 정리) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
