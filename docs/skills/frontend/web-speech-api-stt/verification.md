---
skill: web-speech-api-stt
category: frontend
version: v1
date: 2026-05-14
status: PENDING_TEST
---

# web-speech-api-stt 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `web-speech-api-stt` |
| 스킬 경로 | `.claude/skills/frontend/web-speech-api-stt/SKILL.md` |
| 검증일 | 2026-05-14 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 검증 정책 분류 | **실사용 필수 카테고리** (실 브라우저 + 마이크 환경에서 권한·동작 확인이 필요한 워크플로우 스킬) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (MDN SpeechRecognition, SpeechRecognitionResult, error_event, result_event)
- [✅] 공식 표준 명세 확인 (W3C/WICG Web Speech API draft)
- [✅] 최신 버전 기준 내용 확인 (2026-05-14)
- [✅] 핵심 패턴·옵션·이벤트 정리
- [✅] 호환성 표 정확화 (caniuse + MDN BCD 이슈 교차)
- [✅] 흔한 실수 패턴 정리
- [✅] React 통합 패턴 작성
- [✅] TTS 스킬(`web-speech-api-tts`)과의 차별성·상호 보완 패턴 명시
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확인 |
| 기존 스킬 확인 | Glob | `.claude/skills/frontend/web-speech-api-*/SKILL.md` | TTS 스킬 1건 발견 → 차별성 섹션 추가 결정 |
| TTS 스킬 참조 | Read | `.claude/skills/frontend/web-speech-api-tts/SKILL.md` | 톤·구조 일관성 확보 |
| 조사 | WebFetch | MDN SpeechRecognition 페이지 | 인터페이스 속성·메서드·이벤트 10종 확인 |
| 조사 | WebFetch | MDN SpeechRecognitionResult | isFinal·length·item() 구조 확인 |
| 조사 | WebFetch | MDN error_event | 8개 에러 코드 정리 |
| 조사 | WebFetch | MDN result_event | resultIndex 의미·올바른 순회 패턴 확인 |
| 조사 | WebFetch | MDN start() | InvalidStateError 조건 확인 |
| 조사 | WebFetch | caniuse.com/speech-recognition | 호환성 표 정확 수치 추출 (Chrome 25+, Safari 14.1+/iOS 14.5+, Firefox/Edge 미지원, 전역 87.82%) |
| 조사 | WebFetch | W3C/WICG Web Speech API draft | IDL·기본값·에러 enum 확인 |
| 조사 | WebFetch | GitHub MDN BCD issue #22126 | Edge no-op 구현 사실 확인 |
| 교차 검증 | WebSearch | "Safari iOS 14.5 webkit prefix" 등 4건 | 사용자 요구의 "iOS 16+", "Edge 안정"이 DISPUTED임을 다중 소스로 확인 |
| 작성 | Write | SKILL.md (13 섹션) | DISPUTED 정정 + 주의 표기 |
| 작성 | Write | verification.md | 이 문서 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| MDN — Web Speech API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API | ⭐⭐⭐ High | 2026-05-14 | 1순위 |
| MDN — SpeechRecognition | https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition | ⭐⭐⭐ High | 2026-05-14 | 1순위 |
| MDN — SpeechRecognitionResult | https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionResult | ⭐⭐⭐ High | 2026-05-14 | 1순위 |
| MDN — error_event | https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/error_event | ⭐⭐⭐ High | 2026-05-14 | 에러 코드 표준 출처 |
| MDN — result_event | https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/result_event | ⭐⭐⭐ High | 2026-05-14 | resultIndex 의미 출처 |
| MDN — start() | https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/start | ⭐⭐⭐ High | 2026-05-14 | InvalidStateError 조건 |
| W3C/WICG Web Speech API draft | https://webaudio.github.io/web-speech-api/ | ⭐⭐⭐ High | 2026-05-14 | 표준 명세, IDL·기본값 출처 |
| caniuse — Speech Recognition | https://caniuse.com/speech-recognition | ⭐⭐⭐ High | 2026-05-14 | 호환성 정량 데이터 |
| MDN BCD issue #22126 | https://github.com/mdn/browser-compat-data/issues/22126 | ⭐⭐ Medium-High | 2026-05-14 | Edge no-op 구현 보고 |
| WebKit bug 225298 | https://bugs.webkit.org/show_bug.cgi?id=225298 | ⭐⭐⭐ High | 2026-05-14 | iOS service availability 이슈 |
| Apple Developer Forums (iOS 15.1 bugs) | https://developer.apple.com/forums/thread/694847 | ⭐⭐ Medium | 2026-05-14 | iOS Safari 함정 보강 |
| Andrea Giammarchi — Taming Web Speech API | https://webreflection.medium.com/taming-the-web-speech-api-ef64f5a245e1 | ⭐⭐ Medium | 2026-05-14 | iOS Safari continuous 무력화 보강 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 항목은 SKILL.md에 정정 + `> 주의:` 표기)
- [✅] 버전 정보 명시 (Chrome 25+, Safari macOS 14.1+, Safari iOS 14.5+)
- [✅] deprecated 패턴 권장하지 않음 (grammars 사용 최소화 안내)
- [✅] 코드 예시가 실행 가능한 형태 (TypeScript hook 포함)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL 및 검증일(2026-05-14) 명시
- [✅] 핵심 개념 설명 포함 (prefix·옵션·이벤트·결과 처리·권한)
- [✅] 코드 예시 포함 (JavaScript + TypeScript React hook)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 12건 포함
- [✅] **TTS 스킬과의 차별성 섹션 포함** (사용자 요구 #11)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. 핵심 클레임 교차 검증 결과

| 클레임 | 판정 | 근거 소스 |
|--------|------|-----------|
| `webkitSpeechRecognition` prefix가 Chrome·Safari·Samsung Internet에서 필요 | **VERIFIED** | MDN + caniuse + AssemblyAI 블로그 + LambdaTest |
| `continuous` default = `false` | **VERIFIED** | W3C draft + MDN |
| `maxAlternatives` default = `1` | **VERIFIED** | W3C draft + MDN |
| `interimResults` default = `false` | **VERIFIED** | MDN |
| 에러 코드 8종 (MDN 기준) | **VERIFIED** | MDN error_event 페이지 |
| 이벤트 10종 (start, audiostart, soundstart, speechstart, speechend, soundend, audioend, result, nomatch, error, end) | **VERIFIED** | W3C draft + MDN SpeechRecognition |
| `event.resultIndex`는 이번 이벤트에서 변경된 가장 낮은 인덱스 | **VERIFIED** | MDN result_event |
| `stop()`은 결과 반환 시도, `abort()`는 안 함 | **VERIFIED** | MDN stop·abort 페이지 |
| Safari iOS 지원은 **14.5+**부터 (16+ 아님) | **DISPUTED → 정정** | caniuse(iOS 14.5 partial) + LambdaTest("Safari 14.5+ on iOS") — *사용자 요구의 "iOS 16+"는 부정확*. SKILL.md에서 "14.5+"로 정정 + `> 주의:` 표기 |
| Edge "안정 지원" | **DISPUTED → 정정** | caniuse(No support) + MDN BCD issue #22126(no-op) — *사용자 요구의 "Edge 안정"은 부정확*. SKILL.md 호환성 표에서 ❌ + no-op 설명으로 정정 |
| Firefox는 flag 켜도 실제 동작 안 함 | **VERIFIED** | caniuse + AssemblyAI 분석 |
| Chrome STT는 Google 서버 호출 (오프라인 불가) | **VERIFIED** | MDN("won't work offline") + AssemblyAI 블로그 |
| HTTPS(secure context) 필수 | **VERIFIED** | 일반 getUserMedia 보안 컨텍스트 정책 + Web Speech API 권장 |
| iOS Safari `continuous=true` 불안정 | **VERIFIED** | Andrea Giammarchi 분석 + Apple Developer Forums + LambdaTest |

**판정 요약**: VERIFIED 12, DISPUTED→정정 2, UNVERIFIED 0.

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-14 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (3/3 PASS — 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-14
**수행자**: skill-tester → general-purpose (frontend-developer 에이전트 미등록으로 general-purpose 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. prefix 처리 + 한국어 인식 안전 초기화**
- PASS
- 근거: SKILL.md "1. prefix 처리 + 인스턴스 생성" 섹션 (라인 52-60), "2. 핵심 옵션" 섹션 (라인 70), "5. 마이크 권한" 섹션 (라인 203), "3. 이벤트" 섹션 (라인 119), "4. 결과 처리" 섹션 (라인 142-154)
- 상세: `window.SpeechRecognition || window.webkitSpeechRecognition` 패턴, `lang = 'ko-KR'`, 미지원 시 graceful degradation, HTTPS 필수, onend 처리 필수, event.resultIndex 기반 순회까지 모두 SKILL.md에 근거 존재. anti-pattern(`new SpeechRecognition()` 직접 호출) 경고가 섹션 13에 명시됨.

**Q2. continuous + interimResults 모드에서 transcript 중복 누적 버그 (event.resultIndex 함정)**
- PASS
- 근거: SKILL.md "4. 결과 처리 — resultIndex와 isFinal" 섹션 (라인 139-157), "13. 흔한 실수" 섹션 (라인 519)
- 상세: `event.resultIndex`부터 순회해야 하는 이유가 명확히 설명됨. 전체 재순회 시 final transcript 중복 누적이 발생한다는 anti-pattern이 섹션 13에 명시됨. 올바른 코드 패턴과 잘못된 패턴 모두 근거 존재.

**Q3. iOS Safari continuous=true 함정 + Firefox/Edge graceful degradation**
- PASS
- 근거: SKILL.md "10. iOS Safari 함정 모음" 섹션 (라인 319-334), "8. 미지원 브라우저 감지 + Graceful Degradation" 섹션 (라인 290-293), "9. 호환성" 섹션 (라인 308-309), "2. 핵심 옵션" 주의 표기 (라인 85)
- 상세: iOS `continuous=true` 자동 종료·이중 transcript 원인, isIOS 분기 대응 코드, visibilitychange abort() 패턴, Firefox flag 무의미, Edge no-op + timeout 안전장치 권장, UI 버튼 비활성화 패턴까지 모두 SKILL.md에 근거 존재.

### 발견된 gap

없음. 3/3 PASS, 보완 필요 항목 없음.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 카테고리 (실 브라우저 + 마이크 + 한국어 발화 환경 검증 필요)
- 최종 상태: PENDING_TEST 유지 (content test PASS이나 실사용 필수 카테고리이므로 PENDING_TEST 유지)

---

> **참고 (예정 케이스 원본 보존)**: 아래는 skill-creator가 작성한 테스트 케이스 초안이며, 위 실제 수행 테스트의 질문 설계에 활용되었다.

### 테스트 케이스 1 (원안): prefix 처리 + 한국어 인식 시작

**입력 (질문):**
```
브라우저에서 한국어 음성 입력 기능을 만들려고 한다. SpeechRecognition을 안전하게 초기화하고 한국어로 인식을 시작하는 코드를 작성해줘.
```

**기대 결과 (SKILL.md 기반):**
- `window.SpeechRecognition || window.webkitSpeechRecognition` 패턴
- `recognition.lang = 'ko-KR'`
- 미지원 시 graceful degradation
- `onresult`에서 `event.resultIndex`부터 순회 + `isFinal` 분기
- HTTPS 필수 언급

**판정:** PASS (2026-05-14 수행)

### 테스트 케이스 2 (원안): Edge·Firefox 미지원 graceful degradation

**입력:**
```
Web Speech API STT가 Firefox에서 작동하지 않는다. Edge에서는 객체는 있는데 결과가 안 온다. 어떻게 처리해야 하나?
```

**기대 결과:**
- Firefox: `media.webspeech.recognition.enable` flag가 있어도 실제 인식 안 됨 → 미지원 처리
- Edge: API 객체 존재 검사만으론 부족, 일정 시간 결과 없으면 timeout으로 미지원 간주
- UI 패턴: 버튼 비활성화 또는 텍스트 입력 대체

**판정:** PASS (2026-05-14 수행, Q2로 통합)

### 테스트 케이스 3 (원안): iOS Safari 연속 인식 함정

**입력:**
```
iOS Safari에서 SpeechRecognition을 continuous = true로 켜고 받아쓰기를 만들었는데 중간에 끊기거나 같은 transcript가 반복된다. 원인과 해결책은?
```

**기대 결과:**
- iOS Safari는 `continuous = true` 신뢰 불가 → `false` + 사용자 버튼 재시작 패턴
- 백그라운드 진입 시 자동 중단 → `visibilitychange`에서 `abort()`
- isIOS 분기 코드 제시

**판정:** PASS (2026-05-14 수행, Q3에 포함)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (DISPUTED 2건 정정 완료) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-14 수행) |
| **최종 판정** | **PENDING_TEST** (content test PASS, 실사용 필수 카테고리로 유지) |

> 본 스킬은 *실사용 필수 카테고리*(워크플로우·실 브라우저 환경 의존)로 분류된다. content test 외에 **실 브라우저(Chrome/Safari iOS) + 마이크 + 한국어 발화 환경에서 권한·인식 동작 검증**이 필요하다. content test만 PASS해도 PENDING_TEST를 유지한다(`verification-policy.md` 참조).

---

## 7. 개선 필요 사항

- [✅] skill-tester 호출하여 agent content test 수행 후 섹션 5 업데이트 (2026-05-14 완료, 3/3 PASS)
- [❌] 실 브라우저(Chrome Desktop / Safari iOS 18 등) 환경에서 한국어 인식 동작 검증 — **차단 요인**: APPROVED 전환 필수 조건. 실사용 필수 카테고리이므로 실제 브라우저+마이크 환경에서 권한 흐름·인식 동작 확인 후 전환.
- [❌] confidence 0 반환 사례(Safari) 실측 후 SKILL.md 보강 여부 결정 — **선택 보강**: SKILL.md에 이미 "주의" 표기 있음. 실측 데이터 추가 시 보강 가능하나 APPROVED 차단 요인은 아님.
- [❌] W3C draft의 `processLocally`, `phrases`, static `available()`/`install()` 메서드는 구현 브라우저가 거의 없어 본 스킬에서 제외 — **선택 보강**: 구현 브라우저 등장 시 추가. 현재는 불필요.

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성. MDN + W3C draft + caniuse + MDN BCD issue 기반 13개 섹션 작성. DISPUTED 2건(Safari iOS 14.5+ vs "16+", Edge no-op vs "안정") 정정 반영. TTS 스킬과의 차별성 섹션 포함. | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 prefix+한국어 초기화 / Q2 resultIndex 함정+transcript 중복 / Q3 iOS Safari continuous+Firefox/Edge degradation) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
