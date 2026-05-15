---
skill: voice-input-ui
category: frontend
version: v1
date: 2026-05-14
status: PENDING_TEST
---

# voice-input-ui 검증 기록

> 음성 입력 UI/UX 패턴 (마이크 버튼·녹음 시각화·인식 결과 confirm) 스킬의 작성·검증 기록.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `voice-input-ui` |
| 스킬 경로 | `.claude/skills/frontend/voice-input-ui/SKILL.md` |
| 검증일 | 2026-05-14 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

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

### 4-5. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-14 skill-tester → general-purpose 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (Q1·Q2·Q3 3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음 — 보완 불필요)

---

## 5. 테스트 진행 기록

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

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 교차 검증 | ✅ (VERIFIED 10 / DISPUTED 1 — DISPUTED는 SKILL.md에서 `> 주의:` 표기) |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-14 수행) |
| **최종 판정** | **PENDING_TEST** (content test PASS, 실기기 검증 후 APPROVED 전환 예정) |

> **PENDING_TEST 유지 근거:** 본 스킬은 음성 입력 UI/UX 패턴으로, *실제 권한 다이얼로그·iOS Safari·Android Chrome 등 실기기에서의 동작 확인*이 필요한 "실사용 필수" 성격을 일부 가진다. 특히 다음 항목은 실기기 검증을 거쳐야 안전하게 APPROVED 가능:
> - iOS Safari의 권한 재요청 동작
> - navigator.vibrate iOS 지원 여부 (DISPUTED)
> - AudioContext suspended 상태 핸들링
>
> 따라서 메인 에이전트의 skill-tester content test 통과 후에도 status를 PENDING_TEST로 유지하고, 실프로젝트 사용 후 APPROVED로 전환할 것을 권장한다.

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-14 완료, 3/3 PASS)
- [❌] navigator.vibrate iOS Safari 지원 동향 6개월 뒤 재확인 (MDN browser-compat-data Issue #29166 추적) — 선택 보강, APPROVED 전환 차단 요인 아님
- [❌] 짝 스킬 `frontend/web-speech-api-stt` 작성 후, 본 스킬에서 cross-link 정밀화 — 선택 보강
- [❌] 짝 스킬 `frontend/media-recorder-api` 작성 후, MediaRecorder 무음 감지 부분에서 cross-link — 선택 보강
- [❌] 실 기기(iOS Safari, Android Chrome)에서 마이크 권한 요청·AudioContext suspended·vibrate 동작 실검증 후 APPROVED 전환 — 차단 요인 (실사용 필수 카테고리)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성. 공식 문서 5건 + 교차 검증 4건 수행. VERIFIED 10, DISPUTED 1(vibrate iOS) | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 중복클릭 상태 머신 / Q2 권한 거부 후 재요청 불가 UX / Q3 AnalyserNode waveform+하울링) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
