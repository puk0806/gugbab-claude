---
skill: web-speech-api-tts
category: frontend
version: v1
date: 2026-05-07
status: PENDING_TEST
---

# 스킬 검증 문서: web-speech-api-tts

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `web-speech-api-tts` |
| 스킬 경로 | `.claude/skills/frontend/web-speech-api-tts/SKILL.md` |
| 검증일 | 2026-05-07 |
| 검증자 | Claude (Opus 4.7) |
| 스킬 버전 | v1 |
| 카테고리 | 브라우저 API 사용법 (실 PWA 환경 검증 필요) |

---

## 1. 작업 목록

- [✅] MDN Web Speech API 공식 문서 조사
- [✅] SpeechSynthesisUtterance 속성·이벤트 정리 (text·voice·rate·pitch·volume·lang + 7 events)
- [✅] getVoices() 비동기 로딩·voiceschanged 이벤트 패턴
- [✅] 영어 voice 필터링·기본값 결정 로직 (localService 우선)
- [✅] 일시정지·재개·취소 + 큐 관리
- [✅] iOS Safari 백그라운드 자동중단 이슈 + 대응 패턴 3종
- [✅] 미지원 브라우저 감지 + Graceful Degradation
- [✅] React 통합 패턴 (useSpeech 훅)
- [✅] 브라우저 호환성 요약표
- [✅] 흔한 실수 7종

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|----------|----------|
| 조사 1 | WebSearch | "Web Speech API speechSynthesis getVoices voiceschanged event MDN 2026 latest" | MDN 공식 문서 다수 확인. voiceschanged는 onvoiceschanged 핸들러로도 가능 |
| 조사 2 | WebFetch | https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance | 속성 6종(text·voice·rate·pitch·volume·lang) + 이벤트 7종 + 유효 범위(rate 0.1-10·pitch 0-2·volume 0-1) |
| 조사 3 | WebSearch | "iOS Safari speechSynthesis background tab paused autostop issue" | iOS Safari 백그라운드 진입 시 자동 중단, 새로고침 필요. getVoices() empty 사례. WebKit Bug 198277 |
| 작성 | Write | .claude/skills/frontend/web-speech-api-tts/SKILL.md | 11개 섹션 + React 훅 예시 + 7가지 흔한 실수 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 비고 |
|--------|-----|--------|------|
| MDN Web Speech API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API | ⭐⭐⭐ High | 공식 문서 (1순위). 마지막 업데이트 2025-05-27 |
| MDN SpeechSynthesisUtterance | https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance | ⭐⭐⭐ High | 속성·이벤트 spec |
| MDN voiceschanged 이벤트 | https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event | ⭐⭐⭐ High | 비동기 로딩 패턴 |
| W3C Web Speech API draft | https://webaudio.github.io/web-speech-api/ | ⭐⭐⭐ High | 표준 spec (Community Group draft) |
| WebKit Bug 198277 | https://bugs.webkit.org/show_bug.cgi?id=198277 | ⭐⭐⭐ High | iOS Safari 백그라운드 자동중단 공식 버그 트래킹 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] rate·pitch·volume 유효 범위 정확 (rate 0.1-10·pitch 0-2·volume 0-1)
- [✅] BCP 47 lang 태그 명시 (en-US 등)
- [✅] getVoices() 비동기 동작 명시 (즉시 호출 빈 배열 가능성)
- [✅] iOS Safari 백그라운드 자동중단 이슈 명시 + WebKit Bug 198277 출처

### 4-2. 구조 완전성

- [✅] YAML frontmatter (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 언제 사용 / 언제 사용하지 않을지 기준
- [✅] 기본 사용법 + 이벤트 처리 + 큐 관리 + 미지원 감지 + iOS 대응 + React 통합
- [✅] 흔한 실수 7종
- [✅] 브라우저 호환성 표

### 4-3. 실용성

- [✅] 즉시 복사 가능한 코드 블록 (loadVoices·pickEnglishVoice·useSpeech 훅)
- [✅] PRD 명시 사항 모두 커버 (rate 0.5-2·pitch 0-2·volume 0-1·일시정지/재개/취소·큐·미지원 감지·iOS 백그라운드)
- [✅] React 훅 TypeScript 타입 명시

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] skill-tester 호출 (2026-05-08 수행 — Q1 getVoices() 비동기 로딩 / Q2 rate·pitch·volume 범위 / Q3 iOS Safari 백그라운드 대응 → 3/3 PASS)
- [⏸️] 실 PWA 프로젝트 적용 후 APPROVED 전환

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-08
**수행자**: skill-tester → general-purpose (대체 수행)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. getVoices() 즉시 호출 빈 배열 처리**
- PASS
- 근거: SKILL.md "getVoices() 비동기 로딩" 섹션 (64-88줄) — `loadVoices()` Promise 패턴, `voiceschanged` 이벤트 `{ once: true }` 대기 후 재호출 패턴이 완전히 명시되어 있음
- 상세: anti-pattern("빈 배열 무시") 회피 확인. "흔한 실수" 표에서도 일치

**Q2. rate·pitch·volume 유효 범위 및 범위 초과 입력 처리**
- PASS
- 근거: SKILL.md "기본 사용법 - 2. 속성 조절" 섹션 (37-46줄) — rate 0.1~10, pitch 0~2, volume 0~1 명시. 주의 블록에서 rate 0.1 미만 또는 10 초과는 브라우저가 거부함을 명시
- 상세: rate=0 입력 시 브라우저 거부 근거 제시. clamp 처리 권장 패턴 확인

**Q3. iOS Safari 백그라운드 자동중단 — 완전 해결 가능 여부 및 대응 패턴**
- PASS
- 근거: SKILL.md "iOS Safari 백그라운드 자동중단 이슈" 섹션 (161-186줄) — 대응 패턴 3종(visibilitychange + cancel / splitForIOS / foreground 전용 안내) + "완전 해결 불가" 명시
- 상세: "Web Speech API로 완전 해결 가능" anti-pattern 회피 확인. "언제 사용하지 않나" 섹션과 일치

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md에서 근거 섹션 직접 확인 가능

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 브라우저 API 사용법 — 실 PWA 환경 검증 권장 (실사용 필수 카테고리 부분 해당)
- 최종 상태: PENDING_TEST 유지 (content test PASS이나 iOS Safari·환경 의존 변수로 실 PWA 적용 후 APPROVED 전환)

---

### 자체 검증 (2026-05-07, 참고용)

본 스킬은 *브라우저 API 사용법*에 해당하며, 알고리즘·이론과 달리 *실제 브라우저 환경*에서의 동작이 결정적이다. 특히 iOS Safari 백그라운드 이슈, getVoices() empty 사례 등은 *실 PWA 적용*에서만 정확히 검증 가능하다.

따라서 verification-policy.md의 *실사용 검증 불필요 카테고리*(라이브러리 사용법)에 부분적으로 해당하지만, 브라우저 호환성 변수가 큰 만큼 **PENDING_TEST 시작**이 안전하다.

### 후속 검증 시나리오

- 시나리오 1: PWA 영어 학습 앱에서 본 스킬 적용 — getVoices() 비동기 로딩, 영어 voice 필터링이 의도대로 작동하는지 확인
- 시나리오 2: iOS Safari에서 백그라운드 진입 시 자동중단 + 본 스킬의 visibilitychange 대응 패턴이 사용자 경험을 망치지 않는지 확인
- 시나리오 3: 미지원 브라우저(가상)에서 graceful degradation 검증 — UI가 깨지지 않고 사용자에게 안내가 가는지

위 3개 시나리오 중 *2개 이상* 정상 작동 확인 시 APPROVED 전환 검토.

---

## 6. 검증 결과 요약

| 항목 | 내용 |
|------|------|
| 검증 방법 | MDN 공식 문서 + W3C draft + WebKit Bug 트래킹 교차 검증 |
| 클레임 판정 | 핵심 클레임 5건 모두 VERIFIED (rate 범위·voiceschanged·iOS 백그라운드·localService·BCP 47) |
| 에이전트 활용 테스트 | 2026-05-08 수행 완료 — Q1 getVoices() / Q2 rate·pitch·volume 범위 / Q3 iOS 백그라운드 → 3/3 PASS |
| 최종 판정 | **PENDING_TEST 유지** (content test 3/3 PASS. iOS Safari·환경 의존 변수로 실 PWA 적용 후 APPROVED 전환) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 및 섹션 5·6 업데이트 (2026-05-08 완료, 3/3 PASS)
- [⏸️] PWA 실환경 적용 후 APPROVED 전환 (시나리오 2개 이상 정상 작동 확인) — 차단 요인: 실 PWA 없이는 검증 불가, 현재 PENDING_TEST 유지 적절
- [⏸️] SSML(Speech Synthesis Markup Language) 활용 패턴 추가 — `<break>`, `<emphasis>`, `<sub>` 등 (선택 보강, 비차단)
- [⏸️] Android Chrome / Edge / Firefox별 voice 목록 차이 사례 정리 (선택 보강, 비차단)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2026-05-07 | v1 | 최초 작성 — 11개 섹션 + React useSpeech 훅 + 7가지 흔한 실수. PRD 요구사항(rate·pitch·volume·일시정지/재개/취소·큐·미지원 감지·iOS 백그라운드) 모두 커버 | Claude (Opus 4.7) |
| 2026-05-08 | v1 | 2단계 실사용 테스트 수행 (Q1 getVoices() 비동기 로딩 / Q2 rate·pitch·volume 범위 / Q3 iOS Safari 백그라운드 대응) → 3/3 PASS, PENDING_TEST 유지 (실 PWA 검증 대기) | skill-tester |
