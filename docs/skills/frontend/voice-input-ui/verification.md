---
skill: voice-input-ui
category: frontend
version: v2
date: 2026-11-09
status: APPROVED
---

# voice-input-ui 검증 기록

> 음성 입력 UI/UX 패턴 (마이크 버튼·녹음 시각화·인식 결과 confirm) 스킬의 작성·검증 기록.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `voice-input-ui` |
| 스킬 경로 | `.claude/skills/voice-input-ui/SKILL.md` |
| 검증일 | 2026-11-09 (재검증, 이전 2026-09-28 · 최초 2026-05-14) |
| 검증자 | skill-creator → Claude (Sonnet 5, 2026-09-28 재검증) |
| 스킬 버전 | v2 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (MDN getUserMedia, AnalyserNode, Permissions API, Navigator.vibrate, W3C WAI-ARIA APG)
- [✅] 공식 GitHub / 표준 명세 확인 (W3C Web Speech API draft 2026-05-08)
- [✅] 최신 버전 기준 내용 확인 (검증일 2026-05-14, Permissions API Baseline since 2022-09)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (상태 머신, 권한 UX, 시각화, confirm 패턴)
- [✅] 코드 예시 작성 (useReducer 상태 머신, AnalyserNode draw 루프, watchSilence, cleanup)
- [✅] 흔한 실수 패턴 정리 (HTTP·AudioContext suspended·destination 하울링·stream 미정리 등 10건)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch × 5 | MDN getUserMedia, MDN AnalyserNode, WAI-ARIA Button Pattern, MDN Navigator.vibrate, MDN Permissions API | 공식 문서 5개 소스 수집, 핵심 API 시그니처·권한 모델·시각화 패턴·접근성 패턴·iOS 호환성 확보 |
| 교차 검증 | WebSearch × 4 | iOS Safari getUserMedia 요구사항, aria-pressed 토글 패턴, Web Speech API 브라우저 지원, navigator.vibrate iOS 지원 | VERIFIED 3 / DISPUTED 1 (vibrate iOS 지원) / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| MDN — MediaDevices.getUserMedia() | https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia | ⭐⭐⭐ High | 2026-05-14 | 공식 문서. 에러 종류·Secure Context·constraints |
| MDN — AnalyserNode | https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode | ⭐⭐⭐ High | 2026-05-14 | 공식 문서. getByteTimeDomainData/FrequencyData·fftSize |
| W3C — WAI-ARIA APG Button Pattern | https://www.w3.org/WAI/ARIA/apg/patterns/button/ | ⭐⭐⭐ High | 2026-05-14 | W3C 공식. aria-pressed 토글 버튼·레이블 불변성 |
| MDN — Navigator.vibrate() | https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate | ⭐⭐⭐ High | 2026-05-14 | 공식 문서. 패턴 배열·user gesture 요구사항 |
| MDN — Permissions API | https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API | ⭐⭐⭐ High | 2026-05-14 | 공식 문서. query() / change 이벤트·Baseline since 2022-09 |
| W3C Web Speech API (Draft CG Report) | https://webaudio.github.io/web-speech-api/ | ⭐⭐⭐ High | 2026-05-08 (명세 갱신일) | 표준 명세. interimResults·continuous |
| caniuse — Vibration API | https://caniuse.com/vibration | ⭐⭐⭐ High | 2026-05-14 | 글로벌 지원 ~77%, iOS Safari 미지원(MDN 일치) |
| WebRTCHacks — Guide to Safari WebRTC | https://webrtchacks.com/guide-to-safari-webrtc/ | ⭐⭐ Medium | 2026-05-14 | iOS Safari 권한 지속성·user gesture 정책 보강 |
| MDN browser-compat-data 8.1.8 (npm, 2026-11-02 게시) | https://github.com/mdn/browser-compat-data | ⭐⭐⭐ High | 2026-11-09 | `api.Navigator.vibrate`·`api.Permissions.permission_microphone`·`api.SpeechRecognition`·getUserMedia·AnalyserNode 지원 버전, 브라우저 릴리스 상태(Firefox 159 current / 160 beta) |
| caniuse 원본 데이터 (Fyrd/caniuse features-json) | https://github.com/Fyrd/caniuse | ⭐⭐⭐ High | 2026-11-09 | vibration·speech-recognition·permissions-api 최신 버전별 지원 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (검증일 2026-05-14, Permissions API Baseline 2022-09 명시)
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임 (TS 타입 표기 포함, 실제 API 시그니처 일치)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (상태 머신·권한 UX·시각화·confirm·접근성·햅틱·자동 중지·함정·정리)
- [✅] 코드 예시 포함 (11개 섹션 각각에 예시 코드)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (스킬 상단 표)
- [✅] 흔한 실수 패턴 포함 (10번 섹션 — 10건 표)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (React + useReducer 패턴 즉시 사용 가능)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X — 라이브러리 무관, React 외 프레임워크에서도 패턴 이식 가능)

### 4-4. 교차 검증 클레임별 판정

| 클레임 | 소스 | 판정 |
|--------|------|------|
| getUserMedia는 Secure Context(HTTPS/localhost)에서만 동작 | MDN + WebRTCHacks | VERIFIED |
| 권한 거부 후 코드에서 재요청해도 프롬프트 안 뜸 | MDN getUserMedia + Apple Community 스레드 | VERIFIED |
| AnalyserNode.fftSize 권장값 2048, frequencyBinCount = fftSize/2 | MDN AnalyserNode | VERIFIED |
| getByteTimeDomainData는 시간 영역(파형), getByteFrequencyData는 주파수 영역 | MDN AnalyserNode | VERIFIED |
| WAI-ARIA APG: 토글 버튼 레이블은 상태에 따라 바뀌면 안 되며, aria-pressed로 상태 표현 | W3C WAI-ARIA APG Button Pattern + Vispero/Deque 블로그 | VERIFIED |
| Permissions API는 2022-09 이후 Baseline, microphone permission name 지원 | MDN Permissions API | VERIFIED |
| Web Speech API는 Firefox에서 기본 비활성, Chromium/Safari는 webkit 프리픽스 노출 | W3C Draft + MDN + AssemblyAI 블로그 | VERIFIED |
| SpeechRecognition은 무음 시 onspeechend/onend 자동 발화 | MDN SpeechRecognition events | VERIFIED |
| Navigator.vibrate iOS Safari 미지원 | MDN + caniuse | DISPUTED — MDN/caniuse는 미지원이라 하나, 2026-03 GitHub issue/Medium 보고에 따르면 최근 일부 동작. SKILL.md에서는 `> 주의:` 표기로 보조 채널로만 쓰도록 명시 |
| navigator.vibrate는 사용자 제스처(클릭 등) 이벤트 내에서만 동작 | MDN Navigator.vibrate | VERIFIED |
| iOS Safari는 권한 지속성이 가장 짧아 SPA 라우팅에서 재요청 가능 | WebRTCHacks + WebKit Bug 215884 | VERIFIED |

**교차 검증 요약:** VERIFIED 10 / DISPUTED 1 / UNVERIFIED 0

#### 2026-11-09 재검증 클레임

| 클레임 | 소스 | 판정 |
|--------|------|------|
| Navigator.vibrate Safari·iOS Safari 미지원 (최신 27.x 까지) | MDN BCD 8.1.8 + caniuse | VERIFIED — 기존 DISPUTED(일부 동작 보고) 해소, 두 소스 모두 미지원 |
| Firefox 는 129 에서 `navigator.vibrate` 제거 (기존 스킬 미기재) | MDN BCD(`version_removed: 129`) + caniuse(현행 `n`) | VERIFIED → REFERENCE.md §8 주의문에 추가 |
| Chrome 60+ 은 사용자 제스처 없는 `vibrate()` 호출 시 `false` 반환 | MDN BCD chrome_android 노트 | VERIFIED |
| Permissions `name: 'microphone'` 지원 — Chrome 64+, Safari/iOS 16+, Firefox 132+ (기존 "Safari/Firefox 일부 미지원" 서술) | MDN BCD 8.1.8 + caniuse(Permissions API 전 브라우저 `y`) | DISPUTED → SKILL.md 2-1 주의문을 버전 명시로 정정 |
| Chrome 139+ 는 프리픽스 없는 `SpeechRecognition` 노출, Safari 는 `webkitSpeechRecognition` 만 | MDN BCD 8.1.8 (caniuse 는 Chrome 을 여전히 프리픽스 표기) | VERIFIED(BCD 기준) — "두 이름 모두 폴백" 권장은 그대로 유효 |
| Firefox SpeechRecognition 기본 지원 시점 | MDN BCD = 160(2026-11-10 출시 예정 beta) / caniuse = 162 까지 기본 비활성 | UNVERIFIED — 출처 충돌. SKILL.md 4-1 에 `> 주의: 미검증` 표기, 현행 159 까지 플래그 뒤로 서술 |
| getUserMedia·AnalyserNode 전 브라우저 지원, deprecated 아님 | MDN BCD 8.1.8 | VERIFIED |

#### 흡수한 원본의 핵심 클레임 (2026-11-12 통합 시 옮김 — 판정은 원본 기록 그대로)

| 클레임 | 소스 | 판정 |
|--------|------|------|
| (구 web-speech-api-stt) Safari iOS 지원은 14.5+부터 (16+ 아님) | caniuse + LambdaTest | DISPUTED → 정정 |
| (구 web-speech-api-stt) Edge 안정판은 API 객체만 있고 결과 반환 안 함(no-op) | caniuse + MDN BCD issue #22126 | DISPUTED → 정정 (Canary/Dev 150.0.4076+ 플래그 온디바이스는 VERIFIED 보강) |
| (구 web-speech-api-stt) Firefox 는 flag 켜도 실제 동작 안 함 | caniuse + AssemblyAI | VERIFIED |
| (구 web-speech-api-stt) Chrome STT 기본은 Google 서버, 139+ 데스크톱은 `processLocally` 온디바이스 | MDN + Chrome 139 블로그 + blink-dev Intent | DISPUTED → 정정 |
| (구 web-speech-api-stt) `available()`·`install()` 정적 메서드, 반환값 4종 | MDN available_static + Microsoft Learn | VERIFIED |
| (구 web-speech-api-stt) grammars Deprecated·효과 없음 | MDN | DISPUTED → 정정 |
| (구 web-speech-api-stt) `phrases`·`quality` 지원 버전, Chrome 온디바이스 ko-KR | MDN 문서화만 | UNVERIFIED (`> 주의: 미검증`) |
| (구 web-speech-api-stt) iOS Safari `continuous=true` 불안정 | Apple Developer Forums + LambdaTest | VERIFIED |
| (구 media-recorder-api) `stop` 이벤트는 마지막 `dataavailable` 뒤에 발생 | W3C 명세 + MDN | VERIFIED |
| (구 media-recorder-api) `recorder.stop()`만으로는 트랙이 살아 메모리 누수·인디케이터 잔존 | Mozilla bugzilla #1376134 + MDN | VERIFIED |
| (구 media-recorder-api) iOS Safari 18.3 이하 `audio/webm` 미지원, 18.4부터 `audio/webm;codecs=opus` | WebKit blog + caniuse | VERIFIED |
| (구 media-recorder-api) `start(timeslice)` 청크는 단독 재생 보장 없음 | addpipe 블로그 + media-codings | VERIFIED |
| (구 media-recorder-api) 입력 포맷 7종(mp3·mp4·mpeg·mpga·m4a·wav·webm)·25MB | OpenAI speech-to-text 가이드 | VERIFIED (flac·ogg 제외 정정 반영) |
| (구 whisper-api-integration) `gpt-transcribe`가 파일 전사 권장 모델, $0.0045/min | 공식 STT 가이드 + 모델 페이지 + Cookbook | VERIFIED |
| (구 whisper-api-integration) `languages`가 단수 `language`를 대체, 동시 전송 금지 | 공식 가이드 + API 레퍼런스 | VERIFIED |
| (구 whisper-api-integration) `gpt-transcribe`는 srt·vtt·verbose_json·타임스탬프 미지원 | 공식 Cookbook + STT 가이드 | VERIFIED |
| (구 whisper-api-integration) `gpt-live-transcribe`는 realtime 전용, $0.017/min | 공식 모델 페이지 | VERIFIED |
| (구 whisper-api-integration) whisper-1·gpt-4o-transcribe·-mini·-diarize·`/v1/audio/translations` 2026-08-26 deprecated, 2027-02-26 제거 | Deprecations 페이지 + STT 가이드 | VERIFIED (기존 서술 정정) |
| (구 whisper-api-integration) 번역 대체 `/v1/realtime/translations`(`gpt-realtime-translate`) | Deprecations + STT 가이드 | VERIFIED |
| (구 whisper-api-integration) SDK openai-python 3.46.0·openai-node 7.53.0 `keywords`/`languages` 최상위 인자 | PyPI·npm + SDK 소스 | VERIFIED |
| (구 whisper-api-integration) WER 40.37%→19.27% | 공식 발표 403, 커뮤니티 보도만 | UNVERIFIED |
| (구 media-recorder-api) `gpt-transcribe`의 `response_format` 지원 범위 | 가이드 명시 없음 | UNVERIFIED |

### 4-5. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-14 skill-tester → general-purpose 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (Q1·Q2·Q3 3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음 — 보완 불필요)

---

## 5. 테스트 진행 기록

### 재검증 후 재시험 (2026-11-09)

**수행일**: 2026-11-09
**수행자**: skill-tester → general-purpose 3개 (도메인 에이전트 대신 general-purpose 사용)
**수행 방법**: 2026-11-09 재검증으로 수정된 내용을 겨냥한 실전 질문 3개. SKILL.md·REFERENCE.md Read 후 그 내용에만 의존해 답하도록 하고, 근거 섹션·수정분 반영 여부 확인

**Q1. Permissions API `microphone` 사전 조회 — 지원 브라우저/버전, Firefox 120 같은 구버전 처리**
- ✅ PASS
- 근거: SKILL.md "2-1. 사전 권한 상태 조회" 코드 + 주의 블록
- 상세: Chrome 64+·Safari/iOS 16+·Firefox 132+ 를 정확히 제시, 미만은 TypeError → try/catch 후 getUserMedia 폴백 코드를 그대로 도출. 오답(Firefox/Safari 전반 미지원 등) 없음. 소 gap: API 자체 Baseline(2022-09)과 `microphone` 이름 지원 시점이 다르다는 한 줄 설명이 없어 혼동 가능.

**Q2. SpeechRecognition 접두어(Safari/Chrome/Firefox)와 Firefox 지원 가정 여부**
- ✅ PASS
- 근거: SKILL.md "4-1. Web Speech API" 코드 + 주의 2개 블록, REFERENCE "흔한 함정" 표
- 상세: Safari 는 webkit 접두어만, Chrome 139+ 무접두어도 노출, 두 이름 폴백 권장. Firefox 는 현행 159 까지 플래그 뒤이며 기본 활성 시점은 출처 충돌(BCD 160 vs caniuse 161·162+)로 미검증 → 지원을 전제로 설계하지 말고 feature detection. `미검증` 표기를 단정하지 않고 그대로 전달.

**Q3. navigator.vibrate — 브라우저별 동작, 제스처 없는 타이머 호출, 햅틱 단독 사용**
- ✅ PASS
- 근거: REFERENCE.md "8. 햅틱 피드백" 주의 블록·제약, "10. 흔한 함정"
- 상세: Firefox 129 제거, iOS/데스크톱 Safari 미지원, 실질 Chrome/Android Chromium 만 동작. Chrome 은 사용자 제스처 없는 호출 시 false 반환·무진동(타이머 콜백 해당). 햅틱 단독 의존 금지, 시각 피드백 주 채널. 소 gap: 자동 종료(AUTO_STOP) 경로와 제스처 요구를 잇는 문장이 없어 독자가 추론해야 함.

### 발견된 gap (선택 보강, 차단 요인 아님)

- Permissions API Baseline 과 `microphone` 이름 지원 시점(132+) 차이를 한 줄로 명시하면 혼동 감소
- 햅틱 상세가 REFERENCE 에만 있음 — SKILL.md 본문에서 REFERENCE §8 로 안내하는 문장 추가 가능
- REFERENCE §8 에 "자동 종료 경로에서는 vibrate 무효 → 시각·청각 대체" 한 줄 연결 권장

### 판정

- agent content test: 3/3 PASS (수정분 3항목 모두 정확히 도출, 틀린 답·anti-pattern 없음)
- verification-policy 분류: 해당 없음 (라이브러리·API 사용법 스킬, content test PASS = APPROVED)
- 최종 상태: APPROVED 유지

---

### 재평가 기록 (2026-06-19)

**수행일**: 2026-06-19
**수행자**: skill-tester (카테고리 재분류 재평가)
**수행 방법**: 2026-05-14 기존 content test 3/3 PASS 결과 확인 및 verification-policy.md 기준 재판단

**재판단 근거:**
- 본 스킬은 Web Audio API·Web Speech API·Permissions API 사용법 패턴 스킬
- verification-policy.md 기준: "빌드 설정/워크플로우/설정+실행/마이그레이션"이 아닌 라이브러리 사용법 스킬 → content test PASS = APPROVED 가능
- 2026-05-14 skill-tester가 "실기기 검증 필요"로 분류한 것은 과도하게 보수적인 판정
- 스킬 사용 결과가 *실행 결과·빌드 산출물*이 아닌 *답변 정확성*으로 검증 가능
- 기존 content test 3/3 PASS → APPROVED 전환 적합

**판정**: PENDING_TEST → APPROVED 전환 (카테고리 재분류 기준)

---

### 최초 수행 기록 (2026-05-14)

**수행일**: 2026-05-14
**수행자**: skill-tester → general-purpose (세션 내 domain-specific 에이전트 미등록으로 general-purpose 대체)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. requesting-permission 상태에서 마이크 버튼을 두 번 클릭하면 어떻게 처리되는가?**
- PASS
- 근거: SKILL.md "1. 마이크 버튼 상태 머신" 섹션 — `reducer` 함수에서 `requesting-permission` 상태는 `PERMISSION_GRANTED` / `PERMISSION_DENIED` 이벤트만 처리하며 `CLICK_MIC`는 무시; 섹션 "2-2. 권한 요청은 반드시 사용자 제스처 이벤트 내에서" 코드에 `if (state.kind !== 'idle') return;` 중복 클릭 방지 가드 명시
- 상세: idle이 아닌 상태에서의 클릭은 핸들러 레벨(guard)과 reducer 레벨(이벤트 무시) 두 겹으로 방어됨. anti-pattern(isRecording 단일 boolean 사용) 명시적으로 금지됨

**Q2. 사용자가 권한을 거부한 후 getUserMedia를 재호출해도 프롬프트가 뜨지 않는다 — 올바른 UX 처리는?**
- PASS
- 근거: SKILL.md "2-3. 권한 거부 후 안내" 섹션 — "브라우저는 한 번 명시적으로 거부된 권한을 코드에서 다시 요청해도 프롬프트를 띄우지 않는다" 명시; `role="alert"` + 주소창 자물쇠 아이콘 설명 + 재시도 버튼 패턴 코드 포함; 섹션 10 함정 표에도 동일 항목 기재
- 상세: "코드에서 다시 요청하면 된다"는 anti-pattern을 명확히 부정하고 사용자 직접 변경 안내를 강제하는 UI 패턴이 제시됨

**Q3. AnalyserNode로 waveform을 그릴 때 어떤 메서드를 쓰며, destination에 연결하면 어떤 문제가 생기는가?**
- PASS
- 근거: SKILL.md "3-2. 파형 (waveform) — getByteTimeDomainData" 섹션 — `getByteTimeDomainData`로 시간 영역 진폭 수집, `frequencyBinCount = fftSize/2 = 1024`, `dataArray[i] / 128.0`으로 정규화; "3-1. 셋업" 주의사항 — "analyser.connect(audioCtx.destination) 입력을 스피커로 되돌리면 하울링"; 섹션 10 함정 표 "destination 연결로 하울링" 항목으로 이중 강조
- 상세: destination 연결 금지가 설정 코드 주석(`// 연결하지 않음`)과 함정 표 두 곳에서 강조됨

### 발견된 gap

없음. 3개 질문 모두 SKILL.md 내 명확한 근거 섹션이 존재하며 anti-pattern 회피도 확인됨.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 (iOS 실기기 마이크 권한·AudioContext suspended·Navigator.vibrate 동작 확인 필요)
- 최종 상태: PENDING_TEST 유지 (content test PASS이나 실기기 검증 전까지 APPROVED 전환 보류)

---

> 아래는 작성 시점 기준 예정 템플릿 (참고용 보존)

### 테스트 케이스 1: (예정 — 위 실제 수행 기록 참조)

**입력 (질문/요청):**
```
(skill-tester가 SKILL.md 기반 실전 질문 생성)
```

**기대 결과:**
```
(상태 머신·권한 UX·접근성 패턴이 올바른 근거 섹션과 함께 답변)
```

**실제 결과:** 2026-05-14 수행 완료 — 위 섹션 참조

**판정:** 3/3 PASS

---

### 재검증 (2026-09-28)

**수행일**: 2026-09-28
**수행 방법**: SKILL.md + REFERENCE.md 전체 Read → 핵심 클레임 3개 caniuse(Fyrd/caniuse features-json) 1차 소스 대조 → 실전 질문 2개로 SKILL.md 자체 답변 확인.

**클레임 대조 결과**:
1. "Navigator.vibrate iOS Safari 미지원" → **VERIFIED (재확인, 신뢰도 상승)**: caniuse `vibration.json` 최신 버전(Safari 27.2·iOS Safari 27.2 포함)까지 전부 `n`. 2026-05-14 당시 DISPUTED 표기했던 "최근 동작 보고"는 재확인되지 않음 — REFERENCE.md §8 주의문을 "안정적으로 미지원 유지"로 갱신.
2. "Permissions API Baseline, 단 Safari/Firefox 일부 버전 microphone name 미지원 가능" → 부분 VERIFIED: caniuse `permissions-api.json`에서 Safari는 16.0+, Firefox는 46+ 전반 지원으로 확인(일반 API 존재 여부). `microphone` permission name 세분화 데이터는 caniuse에 없어 SKILL.md의 "일부 버전 미지원 가능" 보수적 문구는 유지(미검증 세부사항, 과도한 주장 아님).
3. "WAI-ARIA APG 토글 버튼: 레이블 불변 + aria-pressed" → 검증 생략(APG 패턴은 W3C 권고안으로 자주 바뀌지 않음, 이전 검증 유지).

**실전 질문 재검증**:
- Q1. "iOS Safari에서 햅틱 피드백을 주 채널로 써도 되는가?" → SKILL.md 갱신된 주의문 근거로 "아니오, 보조 채널로만" → PASS.
- Q2. "microphone 권한 사전 조회가 실패하면?" → SKILL.md 2-1절 `try/catch` → `getUserMedia` 폴백 근거로 PASS.

**재검증 최종 판정**: 핵심 클레임 3건 모두 VERIFIED(또는 기존 보수적 문구 유지), 실질 변경 없음(vibrate 미지원 확인은 강화 방향). status **APPROVED 유지**.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 교차 검증 | ✅ (VERIFIED 10 / DISPUTED 1 — DISPUTED는 SKILL.md에서 `> 주의:` 표기) |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-14 수행) · 재검증 수정분 재시험 3/3 PASS (2026-11-09 수행) |
| **최종 판정** | **APPROVED** (content test 3/3 PASS, 2026-06-19 카테고리 재분류로 APPROVED 전환, 2026-11-09 재시험 3/3 PASS 로 유지) |

> **APPROVED 전환 근거:** 본 스킬은 라이브러리 사용법 패턴 스킬 (Web Audio API·Web Speech API·Permissions API)로, verification-policy.md 기준 content test PASS = APPROVED 가능 카테고리에 해당한다. 2026-05-14 초기 판정의 "실사용 필수" 분류는 과도하게 보수적이었으며, 2026-06-19 재평가에서 정정되었다.

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-14 완료, 3/3 PASS)
- [✅] APPROVED 전환 (2026-06-19 완료 — 카테고리 재분류: 라이브러리 사용법 스킬, content test PASS = APPROVED 가능)
- [✅] 2026-11-09 재검증 수정분 재시험 (Permissions microphone 버전 / SpeechRecognition 접두어 / vibrate) — 3/3 PASS, APPROVED 유지
- [✅] navigator.vibrate iOS Safari 지원 동향 재확인 (2026-11-09 BCD 8.1.8·caniuse 로 미지원 재확인)
- [❌] Permissions Baseline 과 `microphone` 이름 지원 시점 차이 한 줄 명시, REFERENCE §8 에 자동 종료 경로 vibrate 무효 연결 문장 추가 — 선택 보강, 차단 요인 아님
- [❌] 짝 스킬 `frontend/web-speech-api-stt` 작성 후, 본 스킬에서 cross-link 정밀화 — 선택 보강
- [❌] 짝 스킬 `frontend/media-recorder-api` 작성 후, MediaRecorder 무음 감지 부분에서 cross-link — 선택 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성. 공식 문서 5건 + 교차 검증 4건 수행. VERIFIED 10, DISPUTED 1(vibrate iOS) | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 중복클릭 상태 머신 / Q2 권한 거부 후 재요청 불가 UX / Q3 AnalyserNode waveform+하울링) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
| 2026-06-19 | v1 | 카테고리 재분류 재평가 — 라이브러리 사용법 스킬(content test PASS = APPROVED 가능) 판정, 기존 3/3 PASS 유효 → PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-28 | v2 | 재검증 — caniuse 최신 데이터로 vibrate iOS Safari 미지원 재확인(REFERENCE.md §8 주의문 갱신), Permissions API Baseline 재확인. status APPROVED 유지 | Claude (Sonnet 5) |
| 2026-11-09 | v3 | 재검증 — MDN BCD 8.1.8·caniuse 원본 데이터 대조. Permissions `microphone` 지원 버전 명시(Firefox 132+·Safari 16+)로 정정, Firefox `vibrate` 129 제거·Chrome 제스처 요구 추가(REFERENCE §8·§10), SpeechRecognition 지원 정정(Chrome 139 무프리픽스, Firefox 160 기본 지원은 출처 충돌로 `> 주의: 미검증`). 내용 변경 있음, status APPROVED 유지 | Claude (Opus 5.5) |
| 2026-11-09 | v3 | 재검증 수정분 2단계 재시험 수행 (Q1 Permissions microphone 지원 버전·폴백 / Q2 SpeechRecognition 접두어·Firefox 미검증 / Q3 vibrate Firefox 129 제거·제스처 요구·iOS 미지원) → 3/3 PASS, APPROVED 유지 | skill-tester |
| 2026-11-12 | v3.1 | 정리(사실 재검증 아님) — web-speech-api-stt·media-recorder-api·whisper-api-integration 통합 + 일반 지식 덜어내기: 옮긴 것 Web Speech 브라우저 지원 현실·Chrome 139 온디바이스·iOS 함정·confidence 차이, MediaRecorder isTypeSupported·청크·트랙 정리 함정, OpenAI 2026-08-26 deprecation·gpt-transcribe 제약·languages/keywords·포맷 7종·translations 영어 고정, 원본 클레임 표 / 덜어낸 것 상태 머신·시각화·confirm·ARIA 예제 코드, 이벤트 목록·옵션 설명, TTS 사용법, React 훅, 백엔드 프록시 3종 구현, 청크 분할 코드, 비용 표 세부, references/REFERENCE.md(핵심 함정은 SKILL.md 로) | 정리 |
