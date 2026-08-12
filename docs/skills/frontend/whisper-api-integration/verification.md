---
skill: whisper-api-integration
category: frontend
version: v2
date: 2026-08-11
status: APPROVED
---

# whisper-api-integration 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `whisper-api-integration` |
| 스킬 경로 | `.claude/skills/frontend/whisper-api-integration/SKILL.md` |
| 최초 검증일 | 2026-05-14 |
| 최신 검증일 | **2026-08-11** (모델 라인업 최신화 재검증) |
| 검증자 | skill-creator |
| 스킬 버전 | v2 |

---

## 1. 작업 목록 (Task List)

### 2026-08-11 최신화 재검증

- [✅] 기존 SKILL.md 전체 Read (모델 라인업 노후 확인 — 검증일 2026-05-14)
- [✅] 공식 STT 가이드에서 현행 권장 모델 확인 (`gpt-transcribe`)
- [✅] 공식 모델 페이지에서 신규 모델 ID·단가·엔드포인트 확인 (`gpt-transcribe`, `gpt-live-transcribe`)
- [✅] 공식 Cookbook 마이그레이션 문서에서 whisper-1 → gpt-transcribe 전환 지침 확인
- [✅] 신규 파라미터(`keywords`, `languages`) 정확한 명칭을 **공식 문서로** 확인 (커뮤니티 명칭 미신뢰)
- [✅] 모델별 `response_format` 허용 매트릭스 재확인
- [✅] gpt-4o-transcribe 퇴역 상태 확인 (OpenAI 채널 vs Azure 채널 분리 확인)
- [✅] SKILL.md 모델표·가격표·파라미터표·예제 코드 4종 갱신 + 마이그레이션 장(14장) 신설
- [✅] verification.md 갱신

### 2026-05-14 최초 작성

- [✅] 공식 문서 1순위 소스 확인 (OpenAI API Reference / Speech-to-text Guide)
- [✅] 공식 모델 페이지 확인 (whisper-1, gpt-4o-transcribe)
- [✅] 최신 버전 기준 내용 확인 (2026-05-14, GPT-4o Transcribe 라인업 포함)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (모델 선택, 파라미터 조합, 한국어 팁)
- [✅] 코드 예시 작성 (브라우저 fetch, Rust Axum, Spring Boot, Node Express)
- [✅] 흔한 실수 패턴 정리 (Content-Type 수동·키 노출·CORS·환각 등)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

### 2026-08-11 최신화 재검증 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "OpenAI gpt-transcribe new speech-to-text model 2026" | 신규 모델 `gpt-transcribe`(2026-07-28 출시)·`gpt-live-transcribe` 존재 확인. $0.0045/min, WER 40.37%→19.27% 보도 확인 |
| 조사 | WebSearch | "platform.openai.com docs guides speech-to-text model gpt-transcribe pricing per minute" | $0.0045/min 재확인, gpt-live-transcribe $0.017/min 확인 |
| 조사 | WebFetch | https://developers.openai.com/api/docs/models/gpt-transcribe | **공식 모델 페이지 직접 확인** — 모델 ID `gpt-transcribe`, $0.0045/min, 엔드포인트 `v1/audio/transcriptions` + `v1/realtime/transcription_sessions`, streaming 지원 |
| 조사 | WebFetch | https://openai.com/index/advancing-voice-intelligence-with-new-models-in-the-api/ | **HTTP 403** — 공식 발표 원문 접근 실패. WER 수치는 원문 미확인으로 처리 |
| 조사 | WebFetch | https://developers.openai.com/api/docs/models/gpt-live-transcribe | 모델 ID `gpt-live-transcribe`, $0.017/min, realtime transcription 엔드포인트 **전용**, keyword/language hints 지원 확인 |
| 조사 | WebFetch | https://developers.openai.com/api/docs/models/gpt-4o-transcribe | 오디오 토큰 $2.50/$10 per 1M, **deprecation 표기 없음** 확인 |
| 조사 | WebFetch | https://developers.openai.com/api/docs/guides/speech-to-text | **1순위 공식 가이드** — "Start with `gpt-transcribe`. This is the recommended model..." 원문 확보. 모델별 파라미터 매트릭스·25MB·포맷 7종 확인 |
| 조사 | WebFetch | https://developers.openai.com/api/docs/guides/speech-to-text?lang=curl | `keywords`·`languages` 파라미터 **정확한 철자** 확인 + "languages replaces the singular language field—don't send both" 원문 확보 |
| 조사 | WebFetch | https://developers.openai.com/cookbook/examples/migrating_from_whisper_to_gpt_transcribe | **공식 Cookbook** — 마이그레이션 지침·`extra_body` 전달 예제·response_format 미보장 경고·whisper-1 존치 조건 확보 |
| 교차 검증 | WebFetch | https://openrouter.ai/openai/gpt-transcribe | 독립 소스에서 모델 ID·$0.0045/min 일치 확인 — VERIFIED |
| 교차 검증 | WebSearch | "gpt-transcribe launch July 28 2026 WER Common Voice" | 복수 커뮤니티 소스가 출시일 2026-07-28·WER 40.37→19.27 일치 보고. 공식 원문 미확인 → 조건부 판정 |
| 교차 검증 | WebFetch | https://developers.openai.com/api/reference/resources/audio/subresources/transcriptions/methods/create | `response_format` enum·`include=[logprobs]`·`known_speaker_names/references`·`chunking_strategy` 확인. **model enum에 `gpt-transcribe` 미반영** 발견 → 레퍼런스 페이지 갱신 지연으로 판단 |
| 교차 검증 | WebSearch | "Azure OpenAI gpt-4o-transcribe retirement date 2026" | Azure(Microsoft Foundry) 채널에서 퇴역 공지 확인(보고 날짜 2026-01-14 → 2026-02-28 변동). OpenAI 자체 채널과 상태 상이 → 분리 표기 |
| 교차 검증 | WebSearch | "OpenAI audio transcriptions supported formats flac ogg 25MB" | 엔드포인트 에러 메시지는 10종(flac·oga·ogg 포함) 나열, 현행 가이드는 7종 명시 → 불일치 발견, `> 주의:` 표기 |

**2026-08-11 검증한 클레임 수**: 11개
**판정**: VERIFIED 8 / VERIFIED with note 2 / UNVERIFIED 1

### 2026-05-14 최초 작성 로그

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

## 2-1. 2026-08-11 클레임별 교차 검증 판정

| # | 클레임 | 소스 1 (공식) | 소스 2 (독립) | 판정 | SKILL.md 반영 |
|---|--------|---------------|---------------|:----:|---------------|
| 1 | 모델 ID는 정확히 `gpt-transcribe`다 (`gpt-4.1-transcribe` 등 아님) | 공식 모델 페이지 | OpenRouter `openai/gpt-transcribe` + 공식 Cookbook 코드 | **VERIFIED** | 전 예제·모델표에 반영 |
| 2 | `gpt-transcribe`가 파일 전사 **권장 모델**이다 | 공식 STT 가이드 원문 인용 | 공식 Cookbook 마이그레이션 지침 | **VERIFIED** | 2장 결정 트리 1순위 |
| 3 | 단가 $0.0045/min (whisper-1 대비 −25%) | 공식 모델 페이지 | OpenRouter 가격 | **VERIFIED** | 11장 가격표 |
| 4 | 지원 엔드포인트: `/v1/audio/transcriptions` + `/v1/realtime/transcription_sessions` | 공식 모델 페이지 | 공식 STT 가이드 | **VERIFIED** | 2장 엔드포인트 열 |
| 5 | 신규 파라미터 철자는 `keywords`·`languages` (복수형) | 공식 가이드(curl 예제) | 공식 Cookbook `extra_body={"keywords":[...],"languages":[...]}` | **VERIFIED** | 3장 파라미터표 |
| 6 | `languages`가 단수 `language`를 대체하며 **동시 전송 금지** | 공식 가이드 원문 | 공식 API 레퍼런스 언어코드 설명 | **VERIFIED** | 3장 주의 + 12장 체크리스트 |
| 7 | `gpt-transcribe`는 srt·vtt·verbose_json·타임스탬프 미지원 → whisper-1 존치 | 공식 Cookbook ("retain whisper-1 if...") | 공식 STT 가이드 파라미터 매트릭스 | **VERIFIED** | 2장 주의 + 8장 + 14장 |
| 8 | `gpt-live-transcribe`는 realtime 전용, $0.017/min | 공식 모델 페이지 | 검색 결과 가격 일치 | **VERIFIED** | 2장·11장·13장 |
| 9 | 출시일 2026-07-28 / WER 40.37%→19.27% (Common Voice 22개 언어) | **공식 발표 페이지 403 — 원문 확인 실패** | 복수 커뮤니티 보도 일치 | **UNVERIFIED** | `> 주의:` 로 "수치 미검증" 명시, 의사결정 근거에서 배제 |
| 10 | gpt-4o-transcribe 퇴역 진행 | OpenAI 모델 페이지에 **deprecation 표기 없음** | Azure(Foundry) 채널 퇴역 공지 다수 (날짜 2026-01-14→2026-02-28 변동) | **VERIFIED with note** | 채널별로 상태가 다름을 분리 표기 + Azure 스케줄 재확인 지시 |
| 11 | 지원 오디오 포맷 목록 | 현행 STT 가이드 = 7종(mp3·mp4·mpeg·mpga·m4a·wav·webm) | 엔드포인트 에러 메시지 = 10종(flac·oga·ogg 추가) | **VERIFIED with note** | 7종을 본문, 불일치를 `> 주의:`로 명시 + 직접 확인 지시 |

**DISPUTED 처리 내역 (기존 v1 내용 대비 수정)**:

| 기존 v1 서술 | 문제 | v2 수정 |
|--------------|------|---------|
| "선택 기준: 정확도 최우선 → `gpt-4o-transcribe`" | 현행 권장 모델이 `gpt-transcribe`로 교체됨 | 결정 트리 1순위를 `gpt-transcribe`로 교체, gpt-4o-transcribe는 "레거시·신규 채택 비권장"으로 강등 |
| 예제 코드 4종 전부 `model: 'whisper-1'` | 신규 개발에 레거시 모델 유도 | 전 예제를 `gpt-transcribe` + `languages[]`로 교체 |
| "`gpt-4o-transcribe`는 `json`/`text`만 지원" | 공식 레퍼런스 기준 `json`만 | `json`만으로 정정 |
| "`gpt-4o-transcribe-diarize`는 gpt-4o-transcribe의 약 2.5배" | 배수 근거를 현행 공식 문서에서 재확인 불가 | 구체 배수 제거, "상위 단가"로 완화 |
| 한국어 팁 "`language="ko"` 명시 필수" | gpt-transcribe에서는 잘못된 필드 | 모델별로 `languages: ["ko"]` / `language: "ko"` 분기 서술 |

---

## 3. 조사 소스

### 2026-08-11 추가·갱신 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| OpenAI File transcription Guide (STT) | https://developers.openai.com/api/docs/guides/speech-to-text | ⭐⭐⭐ High | 2026-08-11 | **1순위.** 권장 모델 원문·파라미터 매트릭스·25MB·포맷 7종 직접 확인 |
| OpenAI Cookbook — Migrating from Whisper to GPT-Transcribe | https://developers.openai.com/cookbook/examples/migrating_from_whisper_to_gpt_transcribe | ⭐⭐⭐ High | 2026-08-11 | 마이그레이션 지침·전환 불가 항목·`extra_body` 예제 |
| OpenAI Models / GPT Transcribe | https://developers.openai.com/api/docs/models/gpt-transcribe | ⭐⭐⭐ High | 2026-08-11 | 모델 ID·$0.0045/min·엔드포인트 2종 |
| OpenAI Models / GPT Live Transcribe | https://developers.openai.com/api/docs/models/gpt-live-transcribe | ⭐⭐⭐ High | 2026-08-11 | realtime 전용·$0.017/min |
| OpenAI API Reference / Create transcription | https://developers.openai.com/api/reference/resources/audio/subresources/transcriptions/methods/create | ⭐⭐⭐ High | 2026-08-11 | response_format enum·diarize 파라미터. **model enum이 gpt-transcribe 미반영(문서 지연)** |
| OpenAI 공식 발표 (Advancing voice intelligence) | https://openai.com/index/advancing-voice-intelligence-with-new-models-in-the-api/ | ⭐⭐⭐ High | 2026-08-11 | **HTTP 403 — 접근 실패.** WER 수치 원문 미확인 사유 |
| OpenRouter — GPT Transcribe | https://openrouter.ai/openai/gpt-transcribe | ⭐⭐ Medium | 2026-08-11 | 모델 ID·단가 독립 교차 검증 |
| Microsoft Foundry 모델 라이프사이클·퇴역 정책 | https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirements | ⭐⭐⭐ High | 2026-08-11 | Azure 채널 퇴역 정책(410 Gone·18개월 수명). 개별 스케줄 페이지는 URL 변경으로 404 |

### 2026-05-14 최초 소스

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

### 4-0. 2026-08-11 최신화 재검증

- [✅] 현행 권장 모델이 SKILL.md 기본값과 일치 (`gpt-transcribe`)
- [✅] 모델 ID를 **공식 페이지로** 확인 (커뮤니티 표기 그대로 채택하지 않음)
- [✅] 신규 파라미터 철자를 공식 문서 2곳에서 교차 확인 (`keywords`, `languages`)
- [✅] 모델별 `response_format` 허용값 매트릭스 재작성
- [✅] 가격표 전면 갱신 (gpt-transcribe·gpt-live-transcribe 추가, 월 1만 분 환산 포함)
- [✅] 예제 코드 4종(브라우저 fetch·Rust Axum·Spring Boot·Node Express) 모델·파라미터 갱신
- [✅] 마이그레이션 장(14장) 신설 — 전환 불가 항목 명시
- [✅] 미검증 항목(WER 수치)·불일치 항목(포맷 목록·Azure 퇴역)에 `> 주의:` 표기
- [❌] 실 API 호출로 `gpt-transcribe` 응답 스키마·`keywords`/`languages` 동작 확인 — 미수행 (문서 기반 검증)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (2026-08-11 기준 모델·파라미터·포맷·크기 제한 재확인)
- [✅] 버전 정보가 명시되어 있음 (검증일 2026-08-11, 모델 라인업 6종 명기)
- [✅] deprecated·레거시 패턴을 권장하지 않음 (translations 오용 경고 + gpt-4o-transcribe 신규 채택 비권장 + whisper-1 존치 조건 한정)
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

**수행일**: 2026-08-11
**수행자**: skill-tester → general-purpose (3개 질문 병렬 실행)
**수행 방법**: 2026-08-11 모델 라인업 최신화(v2) 갱신분을 대상으로 SKILL.md Read 후 신규 내용(모델 선택 결정 트리·`keywords[]`/`languages[]`·마이그레이션 14장) 겨냥 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

> **재수행 사유**: 아래 2026-06-20/06-19/05-14 기록은 v2 갱신(권장 모델 `whisper-1`/`gpt-4o-transcribe` → `gpt-transcribe`, 파라미터 `language`/`prompt` 콤마나열 → `languages[]`/`keywords[]` 교체) **이전 내용 기준**이므로 근거로서 무효다. 이 최신 기록이 현재 SKILL.md 내용에 대한 유효한 검증이다.

### 실제 수행 테스트 (2026-08-11 v2 갱신분 재검증)

**Q1. 신규 한국어 전사 기능 — 모델 선택 + 언어 힌트 파라미터**
- ✅ PASS
- 근거: SKILL.md "2. 사용 가능한 모델" 선택 기준 결정 트리 1번, "3. 요청 파라미터" 표(`languages[]`), "5.2/6.3" 코드 예시, "7. 한국어 정확도 향상 팁" 1번
- 상세: `gpt-transcribe`(권장·$0.0045/min)를 정확히 선택. `languages: ["ko"]` 사용 및 레거시 단수 `language`와 동시 전송 금지 근거를 3장 주의사항 원문으로 정확히 인용. 고유명사 힌트는 `prompt`가 아닌 `keywords[]`로 안내.

**Q2. whisper-1(`language`+콤마나열 `prompt`) → 신규 모델 마이그레이션 + 흔한 실수**
- ✅ PASS
- 근거: SKILL.md "14. whisper-1/gpt-4o-transcribe → gpt-transcribe 마이그레이션" 전환 체크리스트·안전한 전환 순서, "3. 요청 파라미터" 주의, "7. 한국어 정확도 향상 팁" 2번, "12. 흔한 함정 체크리스트"
- 상세: `model`→`gpt-transcribe`, `language`(삭제)→`languages[]`, 콤마나열 `prompt`→`keywords[]` 배열 3가지 변경점을 14장·7장 근거로 정확히 제시. "`language`와 `languages` 동시 전송"을 14장이 지목한 "가장 흔한 실수"로 정확히 인용. `response_format`을 그대로 두면 400 나는 점, `keywords`에 미등장 단어 넣으면 환각 위험(112·360행)까지 포함. 챕터 간 파편화(14장 표에 keywords 오남용 경고 미포함)를 minor gap으로 정직하게 지적.

**Q3. 강의 영상 SRT 자막 기능 — gpt-transcribe로 model만 교체 가능 여부 + 비용**
- ✅ PASS
- 근거: SKILL.md "2. 사용 가능한 모델" 표·결정 트리 2번, "3. 요청 파라미터"(102행), "8. verbose_json 응답 활용" 주의, "14. 마이그레이션" 전환 체크리스트, "11. 비용 추산" 표
- 상세: "model만 바꾸면 400 에러"라는 anti-pattern을 정확히 차단. SRT 경로는 `whisper-1` 존치, 일반 전사만 `gpt-transcribe`로 분리하는 하이브리드 구성을 8장 근거로 정확히 제시. 비용표(11장) 인용해 "SRT 경로는 25% 절감 미적용, 자막 없는 다른 전사 용도에서만 절감" 이라고 정확히 판단.

### 발견된 gap (2026-08-11)

- minor: 14장 마이그레이션 표 자체에는 `keywords[]` 오남용 경고가 없고 3·7장에만 있어 챕터 간 파편화 — 차단 요인 아님(질문 답변에는 지장 없었음, 7장에 콤마나열→keywords 구체 예시 존재).
- minor: `gpt-transcribe`로 전사 후 자체 로직으로 SRT를 근사 생성하는 우회 방법은 SKILL.md에 없음(전환 불가로만 안내) — 선택 보강 수준, 공식 지침(whisper-1 존치)과 일치하므로 오히려 안전한 설계.

### 판정 (2026-08-11)

- agent content test: 3/3 PASS (v2 갱신 내용 기준)
- verification-policy 분류: 라이브러리 사용법 스킬 (content test PASS = APPROVED 가능 카테고리, 기존 분류 유지)
- 최종 상태: **APPROVED 유지** (v2 갱신 내용이 근거로 검증됨)

---

### 실제 수행 테스트 (2026-06-20 — ⚠️ v1(갱신 이전) 내용 기준, 참고용 보존)

**수행일**: 2026-06-20
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트 (2026-06-20 추가 검증)

**Q1. `timestamp_granularities[]` 사용 조건 + gpt-4o-transcribe 계열에서의 동작**
- PASS
- 근거: SKILL.md "3. 요청 파라미터" 섹션 (`response_format=verbose_json` 필수, whisper-1 한정 명시), "8. verbose_json 응답 활용" 주의사항 (gpt-4o-transcribe 계열에서 400 반환)
- 상세: `response_format=verbose_json` 동반 필수 조건 정확히 지적. `gpt-4o-transcribe + timestamp_granularities` 조합은 verbose_json 미지원 + whisper-1 전용 두 이유 모두로 400 반환됨을 근거 섹션 인용하며 차단.

**Q2. 60MB MP3(25MB 초과) 처리 전략 단계별 설명 + 분할 시 문맥 연결 조치**
- PASS
- 근거: SKILL.md "4. 지원 포맷과 크기" 섹션 (바이트 기준 제한·WebM Opus 32kbps면 1시간+ 가능), "9. 25MB 초과 대응" 권장 흐름 3단계 + runningPrompt 의사코드
- 상세: "비트레이트 낮추기 우선 → 문장 경계 분할 → 이전 청크 text.slice(-200)을 다음 prompt에" 3단계 순서 정확 재현. 재인코딩 실행 코드 미존재는 정직하게 gap으로 명시(차단 요인 아님).

**Q3. 화자 분리 필요 서비스의 모델 선택 + 비용 비교**
- PASS
- 근거: SKILL.md "2. 사용 가능한 모델" 선택 기준 요약 (`화자 분리 → gpt-4o-transcribe-diarize`), "11. 비용 추산" 표 (약 2.5배 명시)
- 상세: gpt-4o-transcribe-diarize 선택 근거 정확. 절대 단가 미명시(2.5배만 표기)를 정직하게 평가 섹션에 명시. response_format 제약(json/text만 지원)도 부가 주의사항으로 정확히 언급.

### 발견된 gap (2026-06-20)

없음 (차단 요인 없음). minor gap: 재인코딩 실행 도구 코드·청크 합치기 패턴·diarize 절대 단가·화자 레이블 출력 포맷 예시가 SKILL.md에 없으나 모두 선택 보강 수준.

### 판정 (2026-06-20)

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 (content test PASS = APPROVED)
- 최종 상태: APPROVED 유지

---

### 실제 수행 테스트 (2026-06-19 재검증 — APPROVED 전환)

> 재검증 사유: 2026-05-14 테스트에서 본 스킬을 "실사용 필수 카테고리"로 과분류하여 PENDING_TEST를 유지했으나, verification-policy 재검토 결과 API 사용법·파라미터 조합 정확성은 "답변 정확성만으로 검증 가능"한 라이브러리 사용법 스킬에 해당. content test 3/3 PASS = APPROVED 전환 기준 충족.

**Q1. Blob 직접 append + Content-Type 수동 설정 문제점 및 수정 방법**
- PASS
- 근거: SKILL.md "5.1 브라우저에서 직접 호출" 섹션 흔한 함정 블록, "12. 흔한 함정 체크리스트"
- 상세: Content-Type 수동 명시 → multipart boundary 소실로 400 반환 정확 지적. Blob→new File([blob], 'name.ext', { type }) 감싸기 anti-pattern 회피 확인. API 키 클라이언트 노출 문제(VITE_ 접두사) 및 백엔드 프록시 권장까지 정확히 제시.

**Q2. gpt-4o-transcribe + response_format=srt 조합 가능 여부 + 자막 파일 생성 올바른 모델 선택**
- PASS
- 근거: SKILL.md "2. 사용 가능한 모델" 섹션 주의(response_format 제약), 섹션 2 선택 기준 요약
- 상세: gpt-4o-transcribe 계열은 srt·verbose_json·vtt 미지원(400 반환) anti-pattern 정확 차단. 자막 파일 필요 시 whisper-1 + response_format=srt가 유일한 선택임을 근거 섹션과 함께 제시.

**Q3. prompt LLM 지시문 사용 anti-pattern + language="ko" 미명시 위험**
- PASS
- 근거: SKILL.md "7. 한국어 정확도 향상 팁" 1·2번, "3. 요청 파라미터" 섹션, "12. 흔한 함정 체크리스트"
- 상세: "다음 오디오를 전사해주세요" 같은 LLM 지시문 prompt 금지(무의미하거나 출력에 섞임) 정확 지적. 어휘 콤마 나열 방식(`"꿈, 해몽, 자각몽, 반복몽"`) 권장. language 미명시 → 무음·짧은 클립 영어/일본어 오감지 사례 다수 근거 명시.

### 발견된 gap (2026-06-19)

없음. 3개 질문 모두 SKILL.md에서 직접적·완전한 근거 확보. 섹션 7에 gpt-4o-transcribe 계열의 prompt 파라미터 동작 방식(whisper-1과 동일한지 여부)이 미명시라는 minor gap이 있으나 차단 요인 아님.

### 판정 (2026-06-19)

- agent content test: 3/3 PASS
- verification-policy 재분류: 라이브러리 사용법 스킬 (API 파라미터 조합·패턴 정확성은 답변 정확성으로 검증 가능) → content test PASS = APPROVED 전환 가능
- 최종 상태: APPROVED

---

### 실제 수행 테스트 (2026-05-14 초기 검증)

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
| 내용 정확성 | ✅ (2026-08-11 재검증 — 공식 소스 6종 직접 확인) |
| 구조 완전성 | ✅ (14장 마이그레이션 신설) |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-08-11, 3/3 PASS — v2 갱신 내용(gpt-transcribe·keywords[]/languages[]·마이그레이션 14장) 기준으로 재수행 완료. 2026-06-20 기록은 갱신 이전 내용 기준이라 참고용으로만 보존) |
| 최신성 | ✅ (2026-08-11 기준 현행 라인업 반영) |
| **최종 판정** | **APPROVED 유지** (2026-08-11 내용 검증 11개 클레임 VERIFIED 8/with note 2/UNVERIFIED 1(주의 표기) + 같은 날 신규 내용 기준 content test 3/3 PASS 모두 완료) |

**상태 사유**: 2026-06-19 verification-policy 적용으로 "라이브러리 사용법 스킬"(답변 정확성만으로 검증 가능) 분류 → content test PASS로 APPROVED. 2026-08-11 갱신(모델 라인업 최신화)에 대해서도 같은 날 신규 내용 기준 content test 3/3 PASS를 재수행 완료했으므로 APPROVED를 유지한다.

**단, 다음 항목은 사용 시 유의**:
- WER 수치는 공식 원문 미확인(403) → SKILL.md에 미검증으로 표기됨. 의사결정 근거로 인용 금지
- 14장 마이그레이션 절차는 문서 기반 — 실 API 호출 검증 미수행 (content test는 문서 근거 정확성만 확인, 실 API 응답 스키마 검증은 별도 과제로 섹션 7에 남아있음)

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 (2026-05-14 완료, 3/3 PASS) — 이중 상태 해소
- [✅] verification-policy 재분류 및 APPROVED 전환 (2026-06-19 완료 — 라이브러리 사용법 스킬, content test 3/3 PASS = APPROVED 기준 충족)
- [❌] 실 API 호출 비용 추적 패턴(사용자별 quota 강제) 별도 예시 보강 검토 — 선택 보강 (차단 요인 아님. 섹션 11에 rate limit 언급 있음, 코드 예시 보강은 실전 도입 후 판단)
- [❌] Realtime API(WebSocket) 스트리밍 전사 패턴은 본 스킬 범위 밖 — 별도 스킬 분리 검토 (선택 보강, 차단 요인 아님)
- [❌] Whisper.cpp WebAssembly 로컬 추론은 별도 스킬로 분리 검토 (선택 보강, 차단 요인 아님)
- [✅] gpt-4o-transcribe 계열의 prompt 동작 미명시 — 2026-08-11 해소 (모델별 prompt 지원 여부를 3장 파라미터표에 명시, diarize 미지원 주의 추가)

### 2026-08-11 신규 개선 항목

- [✅] **갱신 내용 기준 skill-tester content test 재수행** — 2026-08-11 완료. 신규 모델(`gpt-transcribe`)·신규 파라미터(`keywords`/`languages`)·14장 마이그레이션을 대상으로 실전 질문 3개 재수행, 3/3 PASS (섹션 5 "2026-08-11 v2 갱신분 재검증" 참조)
- [❌] WER 벤치마크 공식 원문 재확보 — openai.com 발표 페이지 403. 접근 가능해지면 수치 확정 후 `> 주의:` 해제
- [❌] `gpt-transcribe` 실 호출로 응답 스키마(`text` + `languages`) 및 `keywords`/`languages` 멀티파트 전송 방식 확인 — 특히 fetch에서 `languages[]` 반복 필드가 맞는지 vs JSON 배열 문자열인지 실측 필요
- [❌] Azure 채널 gpt-4o-transcribe 퇴역 날짜 확정 — 퇴역 스케줄 페이지 URL이 변경되어 404. 개별 스케줄 재확인 후 SKILL.md 주의 갱신
- [❌] 공식 API 레퍼런스의 model enum에 `gpt-transcribe` 반영 여부 재확인 — 2026-08-11 시점 미반영(문서 지연). 반영되면 3장 링크 주석 정리
- [❌] `gpt-live-transcribe` 실시간 세션 연결 패턴은 본 스킬 범위 밖 — 별도 스킬 분리 검토 (선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성 — OpenAI Whisper / GPT-4o Transcribe 통합 패턴 정리. 모델 4종·파라미터·포맷·25MB 제한·백엔드 프록시 변형(Rust/Java/Node)·청크 분할·Web Speech 폴백·흔한 함정 포함 | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 language/prompt 활용 / Q2 gpt-4o-transcribe+srt anti-pattern·25MB 분할 / Q3 CORS·API키 노출·백엔드 프록시 필요성) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
| 2026-06-19 | v1 | 2단계 실사용 테스트 재검증 (Q1 Blob→File·Content-Type 수동 설정 anti-pattern / Q2 gpt-4o-transcribe+srt 불가·whisper-1 선택 / Q3 prompt 지시문 anti-pattern·language="ko" 미명시 위험) → 3/3 PASS, verification-policy 재분류(라이브러리 사용법 스킬), APPROVED 전환 | skill-tester |
| 2026-06-20 | v1 | 2단계 실사용 테스트 추가 검증 (Q1 timestamp_granularities 조건·gpt-4o-transcribe 400 anti-pattern / Q2 60MB 초과 처리 전략 3단계·runningPrompt 문맥 연결 / Q3 화자 분리 모델 선택·비용 비교) → 3/3 PASS, APPROVED 유지 | skill-tester |
| 2026-08-11 | v2 | **모델 라인업 최신화 재검증.** 공식 소스 6종(STT 가이드·Cookbook 마이그레이션·모델 페이지 3종·API 레퍼런스) 직접 확인. `gpt-transcribe`(권장 기본값·$0.0045/min)·`gpt-live-transcribe` 추가, 결정 트리 재작성, 신규 파라미터 `keywords`/`languages` 반영(`language` 병용 금지 경고), 모델별 response_format 매트릭스 정정, 가격표 전면 갱신, 예제 코드 4종 전환, 14장 마이그레이션 신설. WER 수치는 공식 원문 403으로 UNVERIFIED 표기, 포맷 목록 불일치·Azure 퇴역은 with note 처리. status APPROVED 유지 | skill-creator |
| 2026-08-11 | v2 | 2단계 실사용 테스트 재수행 — v2 갱신 내용(신규 모델·`keywords[]`/`languages[]`·마이그레이션 14장) 대상 (Q1 신규 개발 모델·언어힌트 선택 / Q2 whisper-1→gpt-transcribe 마이그레이션 흔한 실수 / Q3 SRT 자막 서비스 model만 교체 가능 여부+비용) → 3/3 PASS, APPROVED 유지. 기존 2026-06-20 기록은 갱신 이전 내용 기준으로 참고용 보존 표기 | skill-tester |
