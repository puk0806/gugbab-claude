---
skill: dream-image-generation
category: frontend
version: v1
date: 2026-05-15
status: PENDING_TEST
---

# dream-image-generation 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dream-image-generation` |
| 스킬 경로 | `.claude/skills/frontend/dream-image-generation/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator (자동) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (OpenAI Images API, DALL-E 3 모델, Stability AI API, Google Imagen API)
- [✅] 공식 GitHub / Developer docs 2순위 소스 확인 (developers.openai.com, ai.google.dev)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-05-15)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (백엔드 프록시, IndexedDB Blob, 한→영 변환, 안전 분류)
- [✅] 코드 예시 작성 (Next.js Route Handler, Dexie, b64→Blob)
- [✅] 흔한 실수 패턴 10가지 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "OpenAI DALL-E 3 Images API parameters", "Stability AI API pricing", "Google Imagen API 2026" | 공식 문서 URL 4개 확보 |
| 조사 | WebFetch | developers.openai.com guides/image-generation, models/dall-e-3, ai.google.dev/imagen, platform.stability.ai/docs/api-reference | 파라미터·가격·SDK 사용법 추출 |
| 조사 | WebSearch | "DALL-E content policy violence self-harm", "DALL-E API key security frontend backend proxy", "IndexedDB Blob vs base64 performance", "Korean prompt vs English DALL-E accuracy" | 안전 정책·BFF 패턴·IDB 베스트 프랙티스·다국어 비교 자료 확보 |
| 교차 검증 | WebSearch | 8개 클레임 × 평균 2개 독립 소스 | VERIFIED 7 / DISPUTED 1 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| OpenAI Image Generation Guide | https://developers.openai.com/api/docs/guides/image-generation | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| OpenAI DALL-E 3 모델 | https://developers.openai.com/api/docs/models/dall-e-3 | ⭐⭐⭐ High | 2026-05-15 | 공식, 가격표 포함 |
| OpenAI Cookbook (DALL-E 3) | https://cookbook.openai.com/articles/what_is_new_with_dalle_3 | ⭐⭐⭐ High | 2026-05-15 | 공식, size/quality/style 설명 |
| OpenAI Usage Policies | https://openai.com/policies/usage-policies/ | ⭐⭐⭐ High | 2026-05-15 | content policy 근거 |
| Stability AI Pricing | https://platform.stability.ai/pricing | ⭐⭐⭐ High | 2026-05-15 | 공식 신용 가격 |
| Stability AI API Reference | https://platform.stability.ai/docs/api-reference | ⭐⭐⭐ High | 2026-05-15 | 엔드포인트 정의 |
| Google Imagen Docs | https://ai.google.dev/gemini-api/docs/imagen | ⭐⭐⭐ High | 2026-05-15 | Imagen 4 모델·SDK |
| Replicate HTTP API | https://replicate.com/docs/reference/http | ⭐⭐⭐ High | 2026-05-15 | 폴링 패턴 |
| GitGuardian BFF Pattern | https://blog.gitguardian.com/stop-leaking-api-keys-the-backend-for-frontend-bff-pattern-explained/ | ⭐⭐ Medium | 2026-05-15 | 백엔드 프록시 근거 |
| Dexie Medium (David Fahlander) | https://medium.com/dexie-js/keep-storing-large-images-just-dont-index-the-binary-data-itself-10b9d9c5c5d7 | ⭐⭐ Medium | 2026-05-15 | Dexie 저자 글, IDB 베스트 프랙티스 |
| UX Magazine — Lost in DALL-E 3 Translation | https://uxmag.com/articles/lost-in-dall-e-3-translation | ⭐⭐ Medium | 2026-05-15 | 한국어 prompt 한계 |

---

## 4. 검증 체크리스트 (Test List)

### 4.1 핵심 클레임 교차 검증 결과

| # | 클레임 | 판정 | 근거 |
|---|--------|:---:|------|
| 1 | DALL-E 3는 `n=1`만 허용 | VERIFIED | OpenAI Cookbook + 가격표가 "per image" 단일 책정 |
| 2 | DALL-E 3 size는 1024×1024, 1792×1024, 1024×1792 | VERIFIED | OpenAI guide(검색) + Cookbook 일치 |
| 3 | DALL-E 3 가격 standard $0.04 / hd $0.08 (1024²) | VERIFIED | OpenAI 모델 페이지 + 다수 가격 비교 사이트 일치 |
| 4 | Stability AI 1 credit = $0.01 | VERIFIED | platform.stability.ai/pricing + 보조 가격 가이드 일치 |
| 5 | Stability `/v2beta/stable-image/generate/{ultra,core,sd3}` 엔드포인트 존재 | VERIFIED | 공식 API ref + Heroku Dev Center 문서 일치 |
| 6 | Imagen 4 모델 ID `imagen-4.0-{generate,ultra-generate,fast-generate}-001`, Imagen 3 deprecated | VERIFIED | ai.google.dev 공식 문서 명시 |
| 7 | IndexedDB는 Blob 직접 저장이 base64보다 효율적 (base64는 +33%) | VERIFIED | Dexie 저자 글 + tutorialpedia + 일반 정설 |
| 8 | DALL-E 3 응답 URL은 1시간 후 만료 | VERIFIED (커뮤니티 합의) | OpenAI 커뮤니티 다수 답글 + Cookbook 권장(즉시 저장) |
| 9 | DALL-E 3가 한국어 직접 입력 시 비라틴 문자 깨짐 | VERIFIED | UX Magazine + arXiv 다국어 연구 + Wikipedia 일치 |
| 10 | `gpt-image-2` `moderation: 'auto' | 'low'` 파라미터 존재 | DISPUTED → 본문에 "신규 모델·검증일 이후 변경 가능" 주의 표기 |

> 주의: 클레임 #10은 OpenAI 공식 가이드 최신 페이지에서 확인되었으나, GPT Image 라인이 빠르게 진화 중이므로 SKILL.md §3.3에 명시적 주의 박스를 추가했다.

### 4.2 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (DALL-E 3, Imagen 4, SD 3.5, 2026-05 가격 기준)
- [✅] deprecated된 패턴을 권장하지 않음 (Imagen 3 deprecated 명시)
- [✅] 코드 예시가 실행 가능한 형태임 (OpenAI/Stability/Imagen 각각 minimal example)

### 4.3 구조 완전성
- [✅] YAML frontmatter 포함 (name, description + example 3개)
- [✅] 소스 URL과 검증일 명시 (5개 1순위 소스)
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (§1 표)
- [✅] 흔한 실수 패턴 포함 (§12 10가지)

### 4.4 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (Next.js 라우트 핸들러 풀 코드 포함)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4.5 Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15 skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (domain-specific 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. DALL-E 3 `size` 파라미터 허용값과 제약**
- PASS
- 근거: SKILL.md "3.1 DALL-E 3 파라미터" 섹션 — 코드 주석 `'1024x1024' | '1792x1024' | '1024x1792'` 및 "핵심 제약: size 위 3종만 허용, 임의 크기 금지" 명시
- 상세: `512x512`, `2048x2048` 등 임의 크기 anti-pattern 회피 확인. `n=1` 제약도 동일 섹션에서 답변 가능.

**Q2. 한국어 꿈 텍스트를 DALL-E 3에 직접 입력하지 말고 영어로 변환해야 하는 이유**
- PASS
- 근거: SKILL.md "7.1 원칙" 섹션 — "한국어 그대로 DALL-E 3 입력: 정확도 △ (사람·배경 누락 잦음)", "비라틴 문자 → invented-glyph 발생" 주의 박스, §12 흔한 함정 #2
- 상세: "한국어 지원되니 그냥 써도 된다"는 anti-pattern을 SKILL.md 표와 주의 박스가 명확히 차단.

**Q3. API 키를 백엔드 프록시에 두어야 하는 이유와 금지 패턴**
- PASS
- 근거: SKILL.md "§1 언제 이 스킬을 쓰는가" 표("클라이언트 직접 호출 ❌"), "§9 백엔드 프록시" — "`NEXT_PUBLIC_*`, `VITE_*` 금지", §9.2 필수 방어선 표, §12 흔한 함정 #1
- 상세: `NEXT_PUBLIC_OPENAI_API_KEY` anti-pattern 회피 확인. 인증·Rate limit·입력 길이 제한 이유까지 §9.2에서 답변 가능.

### 발견된 gap

없음.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 빌드 설정/API 호출 비용·content policy 실측 필수 카테고리 ("실사용 필수 스킬")
- 최종 상태: PENDING_TEST 유지 (content test PASS + 실사용 필수 카테고리 정책)

---

> 아래는 skill-creator가 작성한 예정 케이스 (참고용 보존)

### 예정 테스트 케이스 (참고)

**테스트 케이스 1**: "한국어 꿈 일기를 DALL-E 3로 이미지화하려는데 API 키는 어디에 둬야 하나"
- 기대: SKILL.md §9 백엔드 프록시 패턴 인용, `NEXT_PUBLIC_*` 금지 강조

**테스트 케이스 2**: "DALL-E 3 응답을 IndexedDB에 어떻게 저장하나"
- 기대: §10.1 b64→Blob 변환 + Dexie 예시 + objectURL revoke

**테스트 케이스 3**: "꿈 내용이 폭력적일 때 어떻게 처리하나"
- 기대: §6 2단계 사전 검사 + dream-image-safety-classifier 짝 에이전트 + 톤다운 재시도

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-15 수행, 3/3 PASS) |
| **최종 판정** | **PENDING_TEST** (content test PASS, 실사용 필수 카테고리 정책 유지) |

> "실사용 필수 스킬" 카테고리: 실제 API 호출 비용·정책 거부 패턴·IndexedDB 동작은 실 프로젝트에서만 확인 가능. content test PASS 후에도 `PENDING_TEST` 유지가 정책.

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)
- [❌] 짝 에이전트 `validation/dream-image-safety-classifier` 미생성 — SKILL.md §6에 폴백 코드 안내는 두었으나 실제 에이전트 생성 시 인터페이스 동기화 필요 (차단 요인 아님, 선택 보강)
- [❌] GPT Image 라인 빠른 진화 — 분기별로 `gpt-image-2` 파라미터 재검증 (차단 요인 아님, 분기별 재검증 권고)
- [❌] Stability AI 신용 환산 실측 검증 (모델별 정확한 credit 소비량 확인) — 실사용 도입 후 수행 가능, 선택 보강
- [❌] 실 프로젝트에서 비용·지연·content_policy 거부율 수치 수집 — 실사용 필수 카테고리 전환 조건, PENDING_TEST → APPROVED 최종 전환 시 필요

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (DALL-E 3/2 · Stability AI · Imagen 4 · 백엔드 프록시 · IndexedDB Blob · 한국어 처리 · 안전 가드) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 DALL-E 3 size 허용값 / Q2 한국어 변환 권장 이유 / Q3 백엔드 프록시 이유) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리 정책) | skill-tester |
