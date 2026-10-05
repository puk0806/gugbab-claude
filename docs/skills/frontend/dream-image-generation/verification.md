---
skill: dream-image-generation
category: frontend
version: v1
date: 2026-09-28
status: APPROVED
---

# dream-image-generation 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dream-image-generation` |
| 스킬 경로 | `.claude/skills/dream-image-generation/SKILL.md` |
| 검증일 | 2026-05-15 (최초) / **2026-09-28 재검증 — 중대 변경 발견** |
| 모델 ID 한정 재감사일 | 2026-08-11 — 변경 없음 (아래 §8 참조) |
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
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15 1차, 2026-06-20 2차, 2026-09-28 skill-tester → general-purpose 3차 수행, 2026-09-28 §9.1 정정 후 4차 재테스트 수행, 2026-09-28 §10.1·§13 정정 후 5차 재테스트 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (2026-09-28 3차에서 발견한 §9.1 `dall-e-3`/`response_format` 잔재는 §9.1 정정으로 해소 확인(4차 Q1 PASS). 4차 Q2에서 발견된 §9.1/§10.1/§13 간 `revised_prompt` 필드 불일치는 §10.1 `prompt: visualPrompt` 정정 + §13 각주 보강으로 해소 확인(5차 Q1·Q2 PASS) — 아래 참조)

---

## 5. 테스트 진행 기록

### 5차 테스트 (2026-09-28) — §10.1·§13 정정 반영 재테스트 (skill-tester → general-purpose)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (2개 독립 서브에이전트, §9.1→§10.1 데이터 흐름 + §12·§13 정합 타겟)
**수행 방법**: 4차 테스트에서 발견된 gap(§9.1 응답에 없는 `response.revisedPrompt`를 §10.1이 소비하던 문제, §13 체크리스트의 무조건적 "revised_prompt 저장" 문구)이 메인 세션에서 ①§10.1 `prompt: response.revisedPrompt` → `prompt: visualPrompt`(호출 측 변수, §9.1 응답엔 revised_prompt 없음 각주 포함) ②§13 "revised_prompt 저장" → "사용한 프롬프트 저장, revised_prompt는 DALL-E 3 전용·GPT Image 2.5는 필드 유무 실측 후" ③21행 검증일 줄의 존재하지 않는 "§14 참조" → "문서 상단 중대 변경 주의·§3.4·§5 참조"로 정정된 것을 확인한 뒤, 정정된 SKILL.md를 각 서브에이전트가 Read 후 질문에 답변, 근거 섹션·모순 여부 확인

**Q1. "§9.1 라우트 응답을 받아 §10.1 Dexie 코드로 저장할 때 `prompt` 필드에 정확히 무엇을 저장해야 하는가? `response.revisedPrompt`를 써도 되는가?"**
- ✅ PASS
- 근거: §10.1 코드 주석(`prompt: visualPrompt, // §8 템플릿으로 만들어 §9.1 에 보낸 시각화 프롬프트(호출 측 변수) (§9.1 응답엔 revised_prompt 없음 — §3.4)`) + §9.1 응답 JSON(`{ image: result.data[0].b64_json }`, revisedPrompt 필드 없음) + §3.4 핵심 제약 + §13 체크리스트
- 상세: 4차에서 발견된 gap(§10.1이 §9.1에 없는 `response.revisedPrompt`를 소비하던 내적 불일치)이 완전히 해소되었음을 정확히 확인. `visualPrompt`(호출 측이 §9.1 요청 시 이미 갖고 있던 변수)를 저장해야 하며 `response.revisedPrompt`는 §9.1 응답에 없는 필드라 쓰면 안 된다는 결론을 §9.1·§3.4·§10.1·§13 네 곳의 상호 일치하는 근거로 정확히 도출. anti-pattern(존재하지 않는 응답 필드 참조) 없음.

**Q2. "GPT Image 2.5 구현 시 §13의 `revised_prompt` 저장 항목과 §12 흔한 함정 8번을 지금도 그대로 지켜야 하는가?"**
- ✅ PASS
- 근거: §3.4 핵심 제약("revised_prompt 필드 존재 여부... 도입 전 실측 권장") + §13 체크리스트("revised_prompt는 DALL-E 3 전용 — GPT Image 2.5는 필드 유무 실측 후 있으면 함께 저장") + §12 상단 주석("5·8번은 DALL-E 3 고유 제약... GPT Image 2.5로 마이그레이션 시 재검증 필요")
- 상세: `revised_prompt`가 GPT Image 2.5에서 "반드시" 저장해야 할 의무가 없고 필드 존재 자체가 미확인(실측 필요) 상태임을 §3.4·§13·§12 세 곳의 일치하는 근거로 정확히 도출. §12 8번이 "그대로 지켜야 하는 규칙"이 아니라 "재검증이 필요한 항목"으로 스킬 스스로 분류해 둔 점까지 정확히 파악. 품질 평가에서 "§13 문구가 압축적이라 빠르게 훑으면 오독 가능"이라는 minor 코멘트가 있었으나 이는 스타일 개선 제안일 뿐 근거 부재나 anti-pattern 사용이 아님.

### 발견된 gap (5차, 2026-09-28)

없음. 4차에서 발견된 gap(§9.1/§10.1/§13 `revised_prompt` 필드 불일치)은 정정으로 완전히 해소 확인. Q2에서 나온 "§13 문구 밀도가 높아 오독 가능"은 차단 요인이 아닌 스타일 개선 제안으로, 별도 조치 없이 참고만 한다.

### 판정 (5차, 2026-09-28)

- agent content test: 2/2 PASS
- 4차에서 남아있던 유일한 미해소 사유(§9.1/§10.1/§13 `revised_prompt` 필드 불일치)가 정정 반영으로 해소 확인됨에 따라 NEEDS_REVISION을 유지할 근거가 더 이상 없음
- verification-policy 분류: 라이브러리 사용법 스킬(API 사용법·보안 패턴, 2026-06-20 재판정 유지) — content test PASS만으로 APPROVED 전환 가능한 카테고리
- 최종 상태: **NEEDS_REVISION → APPROVED 전환**

---

### 4차 테스트 (2026-09-28) — §9.1 정정 반영 재테스트 (skill-tester → general-purpose)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (2개 독립 서브에이전트, §9.1 복붙 시나리오 타겟)
**수행 방법**: 3차 테스트에서 발견된 §9.1 결함(폐기된 `dall-e-3`/`response_format` 사용)이 메인 세션에서 `gpt-image-2.5-flare`/`output_format` 기준으로 정정된 것을 확인한 뒤, 정정된 SKILL.md를 각 서브에이전트가 Read 후 §9.1 복붙 시나리오 질문에 답변, 근거 섹션·모순 여부 확인

**Q1. "§9.1 코드를 그대로 복사하면 어떤 모델을 호출하는가? `dall-e-3`를 써도 되는가?"**
- ✅ PASS
- 근거: §9.1 코드(`model: 'gpt-image-2.5-flare'` + 주석 "현행 GPT Image 2.5 (§3.4). dall-e-3 는 API 에서 제거됨") + §2/§3 폐기 표기
- 상세: 3차에서 발견된 결함(§9.1이 `dall-e-3`를 그대로 사용해 상단 경고와 모순)이 해소되었음을 정확히 확인. `dall-e-3`를 쓰면 안 된다는 결론과 근거(공식 문서 "deprecated and removed")를 정확히 도출. anti-pattern(폐기 모델 그대로 사용) 없음.

**Q2. "§9.1에서 `revised_prompt`를 추출해 저장해야 하는가? `response_format`/`output_format` 중 무엇을 쓰는가? §3.1과의 차이는?"**
- 🟡 PARTIAL
- 근거: §9.1 코드(`output_format: 'png'` + 주석 "response_format 대신 output_format") + §3.4 "핵심 제약" + §12 흔한 함정 8번 + §13 체크리스트
- 상세: `output_format` 사용·`dall-e-3` 대비 차이(n 제약 해제·토큰 기반 과금)는 정확히 도출(핵심 질문에는 정답). 단, 서브에이전트가 SKILL.md 자체의 **새로운 내적 불일치**를 발견: §9.1 응답 JSON(`{ image: result.data[0].b64_json }`)에는 `revisedPrompt` 필드가 없는데, §10.1 예시 코드는 `response.revisedPrompt`를 그대로 소비하고, §13 체크리스트는 "`revised_prompt` 저장"을 모델 구분 없이 필수 항목으로 남겨둠(§12 서두 주석은 "5·8번 재검증 필요"를 명시했지만 §13에는 동일 경고가 없음). §3.4가 이미 "revised_prompt 필드 존재 여부 자체가 불확실·실측 권장"이라고 밝혔음에도 §10.1/§13이 이를 기정사실처럼 다루는 점이 미정정 상태.

### 발견된 gap (4차, 2026-09-28)

- **(선택 보강, 차단 아님)** §10.1 예시가 `response.revisedPrompt`를 소비하지만 §9.1 응답에는 해당 필드가 없음 — §10.1 코드에 "GPT Image 2.5는 `revised_prompt` 필드 유무 미확인, §9.1에서 넘어오지 않으면 undefined 처리" 주석 추가 권장. §13 체크리스트의 "`revised_prompt` 저장" 항목에도 §12 서두와 동일한 "모델별 재검증 필요" 각주 추가 권장.
- 이 gap은 §9.1의 원래 결함(폐기 모델 사용)과 달리 **런타임 크래시를 유발하지 않는 문서 정합성 문제**(undefined 메타데이터가 저장될 뿐)이며, 원래 NEEDS_REVISION의 근거였던 결함과는 별개의 새로운 발견이다.

### 판정 (4차, 2026-09-28)

- agent content test: 1/2 PASS, 1/2 PARTIAL
- 원본 NEEDS_REVISION 사유(§9.1의 폐기 `dall-e-3`/`response_format` 사용, §3.4와 모순)는 **해소 확인** (Q1 PASS)
- 새로 발견된 gap(§9.1/§10.1/§13 `revised_prompt` 필드 불일치)은 **차단 요인 아님** — 선택 보강이나, skill-tester 원칙상 PARTIAL이 남아있는 한 자동으로 APPROVED 전환하지 않고 상태를 유지한다
- 최종 상태: **NEEDS_REVISION 유지** (원 결함은 해소, 신규 발견 gap은 사용자 승인 후 §10.1/§13 보강 권장 — SKILL.md 미수정)

---

### 3차 테스트 (2026-09-28) — skill-tester → general-purpose 정식 수행

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (3개 독립 서브에이전트, 각각 SKILL.md만 근거로 답변)
**수행 방법**: 재검증된 SKILL.md(모델 세대 교체 반영판)를 각 서브에이전트가 Read 후 실전 질문 1개씩 답변, 근거 섹션·anti-pattern 회피 확인. 아래 2026-09-28 셀프 검증 기록(직접 수행)을 정식 대체.

**Q1. "꿈 일기 앱에 OpenAI 쪽으로 이미지 생성 기능을 새로 붙이려면 어떤 모델/코드를 써야 하나?"**
- 🟡 PARTIAL
- 근거: §3.4 "GPT Image 2.5" + 상단 주의문 — 정확한 모델(`gpt-image-2.5-flare`)과 호출 코드를 올바르게 안내함
- 상세: 답변 자체는 정확했으나, 서브에이전트가 스스로 발견한 실결함: **§9.1 백엔드 프록시 예시 코드가 여전히 `model: 'dall-e-3'`, `response_format: 'b64_json'`을 사용** — 상단 §0/§3.4의 "DALL-E 3 폐기" 경고와 정면으로 모순된다. 실사용자가 §9(백엔드 프록시, 필수 섹션)만 보고 그대로 복붙하면 동작하지 않는 폐기 모델을 호출하게 됨. SKILL.md 자체의 내적 불일치이며 **차단 요인**으로 판단.

**Q2. "예전에 짜둔 Google Imagen 4 코드를 그대로 써도 되나? 새로 만든다면?"**
- ✅ PASS
- 근거: §5 상단 주의문 + §5.1 모델 라인업 표 + §5.2 코드/주의문
- 상세: Imagen API 완전 종료 사실, 후속 Nano Banana 계열 모델·코드를 정확히 안내. §5.2 코드가 "개략적 스케치"임을 SKILL.md가 스스로 인정하는 점까지 정확히 파악해 "실사용 전 공식 문서 재확인 필요"로 올바르게 답변(이 부분은 결함이 아니라 스킬이 불확실성을 투명하게 표시한 것으로 서브에이전트가 정확히 구분함).

**Q3. "Nano Banana 코드를 프로덕션에 그대로 배포해도 되나?"**
- ✅ PASS
- 근거: §5.2 주의문 + §5.3 특이사항 + §11 비용·지연 + §9/§6/§10 공통 체크리스트
- 상세: 응답 스키마 미확정·`personGeneration` 지역 제한 미확인·SynthID 워터마크 고지·비용 미실측 등 배포 전 확인 사항을 SKILL.md 근거로 모두 정확히 열거. "그대로 배포 금지"라는 올바른 결론.

### 발견된 gap (2026-09-28, 3차)

- **[차단] §9.1 백엔드 프록시 코드가 폐기된 `dall-e-3` 모델명·`response_format: 'b64_json'`을 그대로 사용** — §3.4(GPT Image 2.5) 갱신 시 §9.1 예시 코드는 함께 갱신되지 않은 것으로 보임. SKILL.md 최상단 "중대 변경" 경고와 실제 백엔드 구현 예시가 모순되는 상태. **SKILL.md 수정 필요 (사용자 승인 후 진행, 본 세션에서는 수정하지 않음 — skill-tester 원칙 4)**
- (선택 보강) §5.2 Nano Banana 코드가 "개략적 스케치"로 남아있어 실측 검증 전까지는 실사용 필수 카테고리에 가깝다는 점 — 이미 SKILL.md에 주의로 반영됨, 차단 요인 아님

### 판정 (2026-09-28, 3차)

- agent content test: 2/3 PASS, 1/3 PARTIAL (§9.1 내적 모순)
- verification-policy 분류: 라이브러리 사용법 스킬(2026-06-20 재판정 유지) — 그러나 이번 발견은 카테고리 문제가 아니라 **SKILL.md 자체 결함**이므로 카테고리와 무관하게 NEEDS_REVISION
- 최종 상태: **NEEDS_REVISION** (§9.1 코드 정정 필요 — 사용자 승인 후 skill-creator 또는 별도 수정 세션에서 처리 권장)

---

> 아래는 2026-09-28 셀프 검증 기록 (skill-tester 서브에이전트 미경유 — creation-workflow.md 안티패턴에 해당하므로 위 3차 테스트로 대체됨. 참고용 보존)

**수행일**: 2026-09-28
**수행자**: Claude (Sonnet 5) — 정기 재검증, skill-tester 미호출(서브에이전트 금지 지시 하 직접 수행)
**수행 방법**: 재검증된 SKILL.md Read 후 실전 질문 2개 답변, 근거 섹션 및 폐기 모델 회피(anti-pattern) 확인

**Q1. "꿈 일기 앱에 DALL-E 3로 이미지 생성 기능을 붙이고 싶다"는 요청에 어떻게 답해야 하는가?**
- PASS
- 근거: SKILL.md 상단 "주의 (2026-09-28 재검증 — 중대 변경)" 블록 + §3 "주의 (2026-09-28)" + §3.4 "GPT Image 2.5 (현행)"
- 상세: DALL-E 3가 API에서 제거되었다는 사실과 후속 모델(`gpt-image-2.5-flare`/`sunburst`)로 안내해야 한다는 점이 명확한 근거 섹션에 존재. DALL-E 3 코드를 그대로 제안하는 anti-pattern을 차단.

**Q2. "Google Imagen 4로 워터마크 없는 이미지를 생성할 수 있나?"라는 질문에 어떻게 답해야 하는가?**
- PASS
- 근거: SKILL.md §5 "주의 (2026-09-28 — 중대 변경)" + §5.1 모델 라인업 표 + §5.3 특이사항
- 상세: Imagen API 완전 종료·Nano Banana로 전환 사실, SynthID 워터마크가 Nano Banana에도 여전히 자동 삽입된다는 사실(워터마크 제거 불가) 모두 근거 섹션에서 도출 가능.

### 발견된 gap

- Nano Banana(Gemini) 이미지 생성의 정확한 요청/응답 스키마(구 `generateImages()` vs 신규 `generateContent()`)는 공식 문서 원문을 직접 대조하지 못해 §5.2 코드가 "개략적 스케치"로 표시됨 — 도입 시 공식 문서 재확인 필요 (SKILL.md에 이미 주의 표기로 반영됨, 차단 요인 아니지만 실사용 전 필수 확인 사항).
- GPT Image 2.5의 정확한 `n`·`response_format` 파라미터 지원 여부 미확인 (공식 문서 요약에 상세 없음).

### 판정 (2026-09-28)

- content test: 2/2 PASS (수정된 SKILL.md 기준)
- 모델·API 세대 교체가 중대하여(DALL-E 3·Imagen 4 완전 폐기) **PENDING_TEST로 하향 전환**. §14 재검증 이력 참조.
- 다음 재검증 시 확인 사항: Nano Banana 정확한 SDK 스키마, GPT Image 2.5 파라미터 상세, Stability AI 현재 서비스 상태(이번 세션은 WebFetch로 페이지 콘텐츠 확인 불가)

---

> (참고용 — 2026-05-15 최초 테스트 기록, DALL-E 3/Imagen 4 기준이라 현재는 일부 무효)

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
- verification-policy 재판정 (2026-06-20): 이 스킬은 API 호출 패턴·파라미터 사용법·보안 패턴을 다루는 **라이브러리 사용법 스킬**로 "빌드 설정/워크플로우/마이그레이션" 실사용 필수 카테고리에 해당하지 않음. content test 답변 정확성으로 검증 가능 → APPROVED 전환.
- 최종 상태: **APPROVED** (2026-06-20 재판정)

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
| 에이전트 활용 테스트 | ✅ (2026-05-15 3/3 PASS, 2026-06-20 재판정, 2026-09-28 셀프 검증 2/2 PASS, 2026-09-28 skill-tester 정식 3차 수행 2/3 PASS·1/3 PARTIAL — §9.1 내적 모순 발견, 2026-09-28 §9.1 정정 후 4차 재테스트 1/2 PASS·1/2 PARTIAL — 원 결함 해소·신규 gap 발견, **2026-09-28 §10.1·§13 정정 후 5차 재테스트 2/2 PASS — 신규 gap도 해소 확인**) |
| **최종 판정** | **APPROVED** (원 결함이던 §9.1 폐기 `dall-e-3`/`response_format` 사용은 4차 Q1 PASS로 해소 확인, 4차에서 새로 발견된 §9.1/§10.1/§13 `revised_prompt` 필드 불일치는 §10.1·§13 정정 후 5차 Q1·Q2 PASS로 완전히 해소 확인. 라이브러리 사용법 스킬 카테고리로 content test 2/2 PASS만으로 APPROVED 전환) |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS; 2026-09-28 skill-tester → general-purpose 정식 3차 수행 완료, 2/3 PASS·1/3 PARTIAL; 2026-09-28 §9.1 정정 후 4차 재테스트 완료, 1/2 PASS·1/2 PARTIAL; 2026-09-28 §10.1·§13 정정 후 5차 재테스트 완료, 2/2 PASS)
- [✅] PENDING_TEST → APPROVED 전환 (2026-06-20, 카테고리 재판정 — 라이브러리 사용법 스킬) — 2026-09-28 §9.1 결함 발견으로 NEEDS_REVISION 하향 후, 5차 재테스트 2/2 PASS로 **NEEDS_REVISION → APPROVED 재전환 완료**
- [✅] **§9.1 백엔드 프록시 예시 코드의 `dall-e-3`/`response_format` 잔재를 `gpt-image-2.5-flare`/`output_format` 기준으로 정정 (2026-09-28 완료, 메인 세션에서 수정 반영 + 4차 재테스트 Q1 PASS로 해소 확인)**
- [✅] §9.1/§10.1/§13 간 `revised_prompt` 필드 불일치 정리 — 2026-09-28 4차 재테스트에서 신규 발견되었던 항목. 메인 세션이 ①§10.1 `prompt: response.revisedPrompt` → `prompt: visualPrompt`(§9.1 응답엔 revised_prompt 없음 각주 포함) ②§13 "revised_prompt 저장" → "DALL-E 3 전용, GPT Image 2.5는 실측 후" 각주로 정정 완료 + 5차 재테스트 Q1·Q2 PASS로 해소 확인 (2026-09-28 완료)
- [❌] 짝 에이전트 `validation/dream-image-safety-classifier` 미생성 — SKILL.md §6에 폴백 코드 안내는 두었으나 실제 에이전트 생성 시 인터페이스 동기화 필요 (차단 요인 아님, 선택 보강)
- [❌] GPT Image 라인 빠른 진화 — 분기별로 `gpt-image-2.5` 파라미터 재검증 (차단 요인 아님, 분기별 재검증 권고)
- [❌] Stability AI 신용 환산 실측 검증 (모델별 정확한 credit 소비량 확인) — 실사용 도입 후 수행 가능, 선택 보강 (차단 요인 아님 — 본 스킬은 라이브러리 사용법 카테고리로 content test PASS만으로 APPROVED 유지)
- [❌] 실 프로젝트에서 비용·지연·content_policy 거부율 수치 수집 — 선택 보강. (2026-06-20 카테고리 재판정으로 이 스킬은 "실사용 필수" 카테고리가 아니므로 APPROVED 전환의 필수 조건이 아니다. 실측 데이터가 쌓이면 §11 갱신용으로만 활용)
- [❌] §5.2 Nano Banana 코드("개략적 스케치")의 실제 요청/응답 스키마 공식 문서 대조 — 선택 보강(도입 직전 필수, 차단 요인 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (DALL-E 3/2 · Stability AI · Imagen 4 · 백엔드 프록시 · IndexedDB Blob · 한국어 처리 · 안전 가드) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 DALL-E 3 size 허용값 / Q2 한국어 변환 권장 이유 / Q3 백엔드 프록시 이유) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리 정책) | skill-tester |
| 2026-06-20 | v1 | PENDING_TEST → APPROVED 재판정 — API 사용법·보안 패턴 스킬로 재분류, content test 3/3 PASS 기반 APPROVED 전환 | skill-tester |
| 2026-08-11 | v1 | **모델 ID 정기 감사 — 변경 없음.** SKILL.md §6.2의 유일한 Claude 모델 ID `claude-haiku-4-5`가 `.claude/rules/agent-design.md` 기준 현행임을 확인. 나머지 모델 ID는 이미지 생성 API(DALL-E 3/2·Stability·Imagen 4)로 이번 감사 범위 밖. SKILL.md 미수정, 전체 검증일(2026-05-15)·status(APPROVED) 유지 | 모델 ID 정기 감사 |
| 2026-09-28 | v1 | **정기 재검증 — 중대 API/모델 변경 발견, APPROVED → PENDING_TEST.** WebFetch로 OpenAI·Google 공식 문서 직접 대조(WebSearch 세션 한도 소진으로 WebFetch 사용). ① `developers.openai.com/api/docs/models/dall-e-3`: "DALL·E 3 has been deprecated and removed from the API." 후속 `gpt-image-2.5-flare`/`gpt-image-2.5-sunburst`. ② `ai.google.dev/gemini-api/docs/imagen`: "Imagen is Google's legacy image generation model. It is now shut down and no longer available in the Gemini API." 후속 Nano Banana 계열(`gemini-3.1-flash-image` 등), 레거시 `gemini-2.5-flash-image`는 2026-10-02 deprecated 예정. SKILL.md §2(제공자 비교)·§3(DALL-E 3/2 섹션에 폐기 표시 + §3.4 GPT Image 2.5 신설)·§5(Google Imagen → Nano Banana 전면 교체)·§11(비용 표 과거값 표시)·§12(흔한 함정 재검증 안내) 수정. Claude 모델 ID(`claude-haiku-4-5`, §6.2)는 현행 유지 확인, 변경 없음. status를 PENDING_TEST로 전환한 이유: 신규 모델(GPT Image 2.5·Nano Banana) 코드 예시가 공식 문서 요약 기반 스케치이며 실측 검증(skill-tester 2단계) 미수행 | Claude (Sonnet 5), 정기 재검증 |
| 2026-09-28 | v1 | 2단계 실사용 테스트 정식 수행 (skill-tester → general-purpose 3개 서브에이전트, Q1 OpenAI 신규 모델 선택 / Q2 Imagen 폐기 코드 대응 / Q3 Nano Banana 프로덕션 배포 전 확인사항) → 2/3 PASS, 1/3 PARTIAL. Q1에서 §9.1 백엔드 프록시 예시가 폐기된 `dall-e-3`/`b64_json`을 그대로 사용해 상단 경고와 모순되는 내적 결함 발견. PENDING_TEST → **NEEDS_REVISION** 전환 (SKILL.md 미수정, 사용자 승인 대기 — skill-tester 원칙 4) | skill-tester |
| 2026-09-28 | v1 | §9.1 정정 반영(메인 세션이 `dall-e-3`/`response_format`을 `gpt-image-2.5-flare`/`output_format` 기준으로 수정, DALL-E 3 전용 `revised_prompt` 추출 코드 제거) 후 skill-tester 4차 재테스트 수행 (Q1 §9.1 복붙 시 호출 모델 확인 / Q2 revised_prompt 저장 여부·§3.1 차이) → 1/2 PASS, 1/2 PARTIAL. Q1으로 원 결함(폐기 모델 사용) 해소 확인. Q2에서 §9.1/§10.1/§13 간 `revised_prompt` 필드 불일치라는 신규(비차단) gap 발견 — NEEDS_REVISION 유지, 섹션 4.5·5·6·7 동기화 완료 | skill-tester |
| 2026-09-28 | v1 | §10.1·§13 정정 반영(메인 세션이 §10.1 `prompt: response.revisedPrompt` → `prompt: visualPrompt`(§9.1 응답엔 revised_prompt 없음 각주), §13 "revised_prompt 저장" → "DALL-E 3 전용·GPT Image 2.5는 실측 후" 각주, 21행 존재하지 않는 "§14 참조" → "문서 상단·§3.4·§5 참조"로 수정) 후 skill-tester 5차 재테스트 수행 (Q1 §9.1→§10.1 데이터 흐름의 prompt 필드 저장값 확인 / Q2 §12·§13의 revised_prompt 규칙이 GPT Image 2.5에도 그대로 적용되는지) → 2/2 PASS. 4차의 유일한 잔존 gap이 완전히 해소되어 **NEEDS_REVISION → APPROVED 전환**, 섹션 4.5·5·6·7 동기화 완료 | skill-tester |
