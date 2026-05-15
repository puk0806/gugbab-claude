---
skill: whisper-api-integration
category: frontend
version: v1
date: 2026-05-14
status: PENDING_TEST
---

# whisper-api-integration 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `whisper-api-integration` |
| 스킬 경로 | `.claude/skills/frontend/whisper-api-integration/SKILL.md` |
| 검증일 | 2026-05-14 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (OpenAI API Reference / Speech-to-text Guide)
- [✅] 공식 모델 페이지 확인 (whisper-1, gpt-4o-transcribe)
- [✅] 최신 버전 기준 내용 확인 (2026-05-14, GPT-4o Transcribe 라인업 포함)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (모델 선택, 파라미터 조합, 한국어 팁)
- [✅] 코드 예시 작성 (브라우저 fetch, Rust Axum, Spring Boot, Node Express)
- [✅] 흔한 실수 패턴 정리 (Content-Type 수동·키 노출·CORS·환각 등)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "OpenAI Whisper API createTranscription endpoint parameters 2026" | API reference, gpt-4o-transcribe·whisper-1·gpt-4o-mini-transcribe·gpt-4o-transcribe-diarize 4종 모델 확인, 파라미터(file/model/language/prompt/response_format/temperature/timestamp_granularities/chunking_strategy/logprobs) 확인 |
| 조사 | WebSearch | "gpt-4o-transcribe gpt-4o-mini-transcribe pricing 2026" | $0.006/min(whisper-1, gpt-4o-transcribe), $0.003/min(gpt-4o-mini), diarize 2.5x 확인. WER 비교 데이터 확인 |
| 조사 | WebSearch | "Whisper API 25MB limit supported formats" | 25MB 제한 확인. flac/ogg 지원 여부에 소스 간 불일치 발견 → 추가 검증 |
| 조사 | WebSearch | "Korean transcription prompt accuracy tips" | language="ko" 명시 권장, whisper-1 prompt 마지막 224토큰만 사용, 한국어 오감지 사례 다수 확인 |
| 조사 | WebFetch | https://developers.openai.com/api/docs/models/whisper-1 | 지원 포맷 9개 명시 확인: mp3, mp4, mpeg, mpga, m4a, wav, webm, flac, ogg. 단가 $0.006/min 확인 |
| 조사 | WebFetch | https://platform.openai.com/docs/guides/speech-to-text, https://help.openai.com/.../audio-api-faq | 둘 다 HTTP 403 (인증 필요). 대체 소스로 검증 |
| 교차 검증 | WebSearch | 가격 클레임 재확인 "$0.006 per minute whisper-1" | costgoat·tokenmix·invertedstone·OpenRouter 등 복수 소스에서 $0.006/min 일치 — VERIFIED |
| 교차 검증 | WebSearch | 포맷 클레임 재확인 (flac/ogg) | API 에러 메시지 인용 결과 flac/m4a/mp3/mp4/mpeg/mpga/oga/ogg/wav/webm 10종 — 공식 모델 페이지(9종)와 oga만 추가. oga는 ogg의 audio-only MIME variant로 사실상 동일군 — VERIFIED with note |

**총 검증한 클레임 수**: 8개
**판정**: VERIFIED 7 / DISPUTED 0 / UNVERIFIED 0 / VERIFIED with note 1

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| OpenAI API Reference / createTranscription | https://platform.openai.com/docs/api-reference/audio/createTranscription | ⭐⭐⭐ High | 2026-05-14 | 공식 API reference, 검색 결과 인용으로 확보 |
| OpenAI Speech-to-text Guide | https://platform.openai.com/docs/guides/speech-to-text | ⭐⭐⭐ High | 2026-05-14 | 공식 가이드(403로 fetch 실패, 검색 결과로 확인) |
| OpenAI Models / Whisper | https://developers.openai.com/api/docs/models/whisper-1 | ⭐⭐⭐ High | 2026-05-14 | 공식 모델 페이지 (포맷 9종·단가 직접 fetch 확인) |
| OpenAI Models / GPT-4o Transcribe | https://developers.openai.com/api/docs/models/gpt-4o-transcribe | ⭐⭐⭐ High | 2026-05-14 | 공식 모델 페이지 |
| OpenAI Pricing | https://openai.com/api/pricing/ | ⭐⭐⭐ High | 2026-05-14 | 공식 가격 페이지 |
| TokenMix Blog — Whisper API Pricing 2026 | https://tokenmix.ai/blog/whisper-api-pricing | ⭐⭐ Medium | 2026-05 | 가격 교차 검증 |
| costgoat — OpenAI Transcribe Pricing | https://costgoat.com/pricing/openai-transcription | ⭐⭐ Medium | 2026-05 | 가격 교차 검증 |
| Artificial Analysis (WER 벤치) | https://x.com/ArtificialAnlys/status/1902907556118532399 | ⭐⭐ Medium | 2025-03 | gpt-4o-transcribe vs whisper-v3 WER 비교 |
| OpenAI Whisper GitHub Discussions | https://github.com/openai/whisper/discussions | ⭐⭐ Medium | 다수 | 포맷 지원 확인 (에러 메시지 인용) |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (createTranscription 파라미터·포맷·크기 제한 모두 공식 일치)
- [✅] 버전 정보가 명시되어 있음 (검증일 2026-05-14, 모델 라인업 명기)
- [✅] deprecated된 패턴을 권장하지 않음 (translations 엔드포인트 오용 경고 포함)
- [✅] 코드 예시가 실행 가능한 형태임 (브라우저 fetch, Rust Axum, Spring Boot, Node Express)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (엔드포인트·모델 4종·파라미터·포맷·크기)
- [✅] 코드 예시 포함 (4개 언어/환경)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (섹션 13)
- [✅] 흔한 실수 패턴 포함 (섹션 12)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (4환경 즉시 적용 가능 코드)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-14 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-14
**수행자**: skill-tester → general-purpose (frontend-developer 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. language 미명시 시 오감지 문제 + prompt 활용법 + 지시문 사용 anti-pattern**
- PASS
- 근거: SKILL.md "3. 요청 파라미터" 섹션 (`language` 미지정 시 자동 감지 부정확 명시), "7. 한국어 정확도 향상 팁" 섹션 (language="ko" 필수, prompt 어휘 힌트 콤마 나열, 지시문 사용 금지 주의)
- 상세: language 미명시 → 무음·짧은 클립 영어/일본어 오감지 사례 근거 존재. prompt 어휘 예시(`"꿈, 해몽, 자각몽, 반복몽, 악몽, 예지몽"`)와 "지시문은 무의미하거나 출력에 섞임" 경고 모두 섹션 7에 명확히 기재.

**Q2. gpt-4o-transcribe + response_format=srt 조합 불가 + 25MB 초과 분할 전략**
- PASS
- 근거: SKILL.md "2. 사용 가능한 모델" 섹션 주의 (gpt-4o-transcribe 계열은 srt·verbose_json·vtt 미지원, 자막 필요 시 whisper-1 선택), "9. 25MB 초과 대응 — 청크 분할" 섹션 (비트레이트 낮추기 우선, 초과 시 문장 경계 분할, runningPrompt 문맥 연결 패턴)
- 상세: anti-pattern(gpt-4o-transcribe + srt) 명확히 차단됨. 25MB 초과 시 권장 흐름 3단계와 TypeScript 의사 코드까지 근거 존재.

**Q3. 브라우저 직접 호출 시 CORS 문제 + Vite env API 키 노출 위험**
- PASS
- 근거: SKILL.md "5.1 브라우저에서 직접 호출" 섹션 (프로덕션 금지 주석, API 키 노출 + CORS 경고), "6. 백엔드 프록시 변형" 섹션 (API 키 서버 보관, CORS·키 노출 동시 해결), "12. 흔한 함정 체크리스트" (CORS — 브라우저 직접 호출 시 OpenAI CORS preflight 미허용)
- 상세: VITE_OPENAI_API_KEY 패턴이 섹션 5.1 코드에서 "프로덕션 사용 금지" 주석과 함께 anti-pattern으로 제시됨.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md에서 직접적·완전한 근거 확보.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 카테고리 (실 API 호출·과금·CORS 동작 검증 필요)
- 최종 상태: PENDING_TEST 유지 (content test 통과, 실 API 호출 검증 후 APPROVED 전환 예정)

---

> 이하는 기존 템플릿 (참고용 보존)

### 테스트 케이스 1: (예정 — 위에서 실제 수행됨)

**입력 (질문/요청):**
```
(skill-tester가 생성)
```

**기대 결과:** SKILL.md 내용 기반 답변

**실제 결과:** (미수행)

**판정:** (미수행)

---

### 테스트 케이스 2: (예정 — 위에서 실제 수행됨)

**입력:** (미수행)

**기대 결과:** (미수행)

**실제 결과:** (미수행)

**판정:** (미수행)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-14, 3/3 PASS) |
| **최종 판정** | **PENDING_TEST** (content test PASS, 실사용 필수 카테고리) |

**상태 사유**: 본 스킬은 실 API 호출·과금·CORS 동작·25MB 초과 분할 검증이 필요한 *실사용 필수 카테고리*. content test 3/3 PASS 완료. 실제 프로젝트에서 호출 검증 후 APPROVED 전환.

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 (2026-05-14 완료, 3/3 PASS) — 이중 상태 해소
- [❌] 실 API 호출 비용 추적 패턴(사용자별 quota 강제) 별도 예시 보강 검토 — 선택 보강 (차단 요인 아님. 섹션 11에 rate limit 언급 있음, 코드 예시 보강은 실전 도입 후 판단)
- [❌] Realtime API(WebSocket) 스트리밍 전사 패턴은 본 스킬 범위 밖 — 별도 스킬 분리 검토 (선택 보강, 차단 요인 아님)
- [❌] Whisper.cpp WebAssembly 로컬 추론은 별도 스킬로 분리 검토 (선택 보강, 차단 요인 아님)
- [❌] gpt-4o-transcribe 계열의 `chunking_strategy="auto"` 동작 실측 데이터 부족 — 추후 보강 (선택 보강, 차단 요인 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성 — OpenAI Whisper / GPT-4o Transcribe 통합 패턴 정리. 모델 4종·파라미터·포맷·25MB 제한·백엔드 프록시 변형(Rust/Java/Node)·청크 분할·Web Speech 폴백·흔한 함정 포함 | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 language/prompt 활용 / Q2 gpt-4o-transcribe+srt anti-pattern·25MB 분할 / Q3 CORS·API키 노출·백엔드 프록시 필요성) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
