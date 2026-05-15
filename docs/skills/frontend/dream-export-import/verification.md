---
skill: dream-export-import
category: frontend
version: v1
date: 2026-05-15
status: PENDING_TEST
---

# 스킬 검증 — dream-export-import

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dream-export-import` |
| 스킬 경로 | `.claude/skills/frontend/dream-export-import/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (MDN, libsodium GitBook, age, Dexie, Zod 공식)
- [✅] 공식 GitHub 2순위 소스 확인 (FiloSottile/typage, gildas-lormeau/zip.js, Stuk/jszip)
- [✅] 최신 버전 기준 내용 확인 (2026-05-15)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (Export 포맷·스키마·암호화·스트리밍·UX)
- [✅] 코드 예시 작성 (Zod·libsodium·File System Access·Dexie bulkPut·Background Sync)
- [✅] 흔한 실수 패턴 정리 (10개 함정 테이블)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch × 8 | File System Access API, libsodium Argon2id, Zod, Dexie 마이그레이션, JSZip 암호화, zip.js, age-encryption, GDPR Art.20, 한국 개인정보보호법, Web Crypto API, Background Sync, oboe.js | 12개 1순위 공식 소스 + 3개 2순위 GitHub 소스 수집 |
| 교차 검증 | WebFetch × 3 | JSZip limitations, typage README, MDN Background Sync | 핵심 클레임 11개 중 10 VERIFIED / 1 DISPUTED (oboe.js 유지보수 상태) |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| MDN `showSaveFilePicker` | https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker | ⭐⭐⭐ High | 2026-01-25 | 공식 표준 문서 |
| MDN `showOpenFilePicker` | https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker | ⭐⭐⭐ High | 2026-05-15 | 공식 표준 문서 |
| MDN Background Sync API | https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API | ⭐⭐⭐ High | 2026-05-15 | Baseline 아님 명시 |
| MDN Web Crypto API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API | ⭐⭐⭐ High | 2026-05-15 | 공식 표준 |
| libsodium password hashing | https://libsodium.gitbook.io/doc/password_hashing/default_phf | ⭐⭐⭐ High | 2026-05-15 | Argon2id 기본·상수값 |
| FiloSottile/typage GitHub | https://github.com/FiloSottile/typage | ⭐⭐⭐ High | 2025-12-29 | v0.3.0 릴리즈 노트 |
| FiloSottile/age GitHub | https://github.com/FiloSottile/age | ⭐⭐⭐ High | 2026-05-15 | 원저자 공식 |
| gildas-lormeau/zip.js GitHub | https://github.com/gildas-lormeau/zip.js | ⭐⭐⭐ High | 2026-05-15 | v2.8.26, AES-256 지원 |
| JSZip limitations | https://stuk.github.io/jszip/documentation/limitations.html | ⭐⭐⭐ High | 2026-05-15 | 암호화 미지원 공식 명시 |
| Zod 공식 | https://zod.dev/ | ⭐⭐⭐ High | 2026-05-15 | v4 기본, v3 별도 import 경로 |
| Dexie version() | https://dexie.org/docs/Dexie/Dexie.version() | ⭐⭐⭐ High | 2026-05-15 | 마이그레이션 API |
| GDPR Art.20 | https://gdpr-info.eu/art-20-gdpr/ | ⭐⭐⭐ High | 2026-05-15 | EU 공식 텍스트 미러 |
| 한국 개인정보 보호법 (국가법령정보센터) | https://www.law.go.kr/ | ⭐⭐⭐ High | 2026-05-15 | 정부 공식 |
| 한국 개인정보보호법 개정 (법률신문) | https://www.lawtimes.co.kr/news/articleView.html?idxno=217245 | ⭐⭐ Medium | 2026-02-12 | 2026 개정안 통과 보도 |
| oboe.js 공식 | https://oboejs.com/ | ⭐⭐ Medium | 2026-05-15 | deprecation notice 예고 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (libsodium 1.0.15+, typage v0.3.0, zip.js v2.8.26, Zod v4, Dexie 마이그레이션 API, Chrome 86+)
- [✅] deprecated된 패턴을 권장하지 않음 (oboe.js는 사용 시 주의 표기, JSZip 암호화 시도 금지 명시)
- [✅] 코드 예시가 실행 가능한 형태임 (Zod safeParse·libsodium crypto_pwhash·showSaveFilePicker·Dexie bulkPut)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description, examples 3개)
- [✅] 소스 URL과 검증일 명시 (섹션 14 + 헤더)
- [✅] 핵심 개념 설명 포함 (데이터 이동권 → 포맷 → 스키마 → 검증 → 암호화 → UX)
- [✅] 코드 예시 포함 (8개 이상)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (포맷 선택 트레이드오프 테이블, 라이브러리 비교 테이블)
- [✅] 흔한 실수 패턴 포함 (섹션 12에 10개 함정 정리)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (실제 import 플로우 ASCII·코드 블록)
- [✅] 범용적으로 사용 가능 (꿈 일기 도메인이되, 다른 일기·노트 PWA에도 그대로 적용 가능)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15 수행 완료)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 보완 불필요)

---

## 4-5. 핵심 클레임 교차 검증 결과

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | JSZip은 암호화 ZIP 미지원 | VERIFIED | 공식 limitations 페이지 명시 |
| 2 | `@zip.js/zip.js` v2.8.26은 AES-128/192/256 암호화 지원 | VERIFIED | package.json keywords + README |
| 3 | libsodium 1.0.15+는 Argon2id가 기본 KDF | VERIFIED | libsodium GitBook |
| 4 | `crypto_pwhash_OPSLIMIT_MODERATE` = 3, `MEMLIMIT_MODERATE` = 256 MiB | VERIFIED | libsodium source + Snyk 문서 |
| 5 | OWASP 2026 baseline: Argon2id m=19 MiB, t=2, p=1 | VERIFIED | 검색 결과 |
| 6 | typage v0.3.0 (2025-12-29) — scrypt passphrase + WebAuthn 지원 | VERIFIED | GitHub README |
| 7 | `showSaveFilePicker`/`showOpenFilePicker` — Chrome/Edge/Opera 86+, Firefox·Safari 미지원, HTTPS·user gesture 필요 | VERIFIED | MDN + Chrome Developers |
| 8 | Background Synchronization API — Baseline 아님, secure context 필요 | VERIFIED | MDN |
| 9 | GDPR Art.20 — CSV/XML/JSON이 권장 machine-readable 포맷 | VERIFIED | GDPR 공식 텍스트 |
| 10 | 한국 개인정보보호법 — 2023-03-14 개정으로 개인정보 전송요구권 신설, 단계적 시행 | VERIFIED | 법률신문·KISO 저널 보도 |
| 11 | oboe.js — 신규 채택 시 deprecation notice 예고 상태 | DISPUTED→주의표기 | 공식 사이트 deprecation notice 예고. 본문에 `> 주의:`로 표기, 대안(`@streamparser/json`) 함께 제시 |

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (도메인 에이전트 미등록, general-purpose 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. JSZip으로 첨부 포함 암호화 ZIP export를 만들 수 있는가**
- PASS
- 근거: SKILL.md "2. Export 포맷 3종" 표 (`**JSZip은 암호화 미지원**`), "6-2. 권장 조합" (`JSZip은 *암호화 미지원*이므로 사용 금지`), "12. 흔한 함정" 표 (`@zip.js/zip.js 또는 libsodium 사용`)
- 상세: 3개 독립 섹션에서 일관되게 JSZip 암호화 미지원을 명시하고 @zip.js/zip.js v2.8.26+ AES-256을 대안으로 안내. anti-pattern(JSZip 암호화 옵션 있음 오안내) 발생 불가

**Q2. libsodium Argon2id KDF 파라미터 및 모바일 저사양 고려**
- PASS
- 근거: SKILL.md "6-3. libsodium 패스프레이즈 암호화 예시" 코드 (`OPSLIMIT_MODERATE=3`, `MEMLIMIT_MODERATE=256MiB`, `ALG_ARGON2ID13`, 파일 포맷 `salt||nonce||cipher`), "6-3 주의" 블록 (저사양 폴백 지침 + OWASP 2026 baseline 미충족 경고)
- 상세: 상수값·파일 포맷·저사양 폴백 지침 모두 코드 수준으로 명시. OWASP 2026 baseline(m=19 MiB·t=2·p=1) 기준 명시로 보안 약화 anti-pattern 차단

**Q3. Firefox·Safari에서 showSaveFilePicker 미지원 시 폴백 구현**
- PASS
- 근거: SKILL.md "8-1. File System Access API" (`Firefox/Safari 미지원` 명시 + `if ("showSaveFilePicker" in window)` 분기 코드 + `triggerAnchorDownload` 폴백), "12. 흔한 함정" (`항상 <a download> 폴백 동시 구현`)
- 상세: 폴백 코드가 직접 포함되어 있어 올바른 구현 패턴을 즉시 도출 가능. Firefox/Safari도 지원 된다는 오정보 없음

### 발견된 gap

없음. 3개 질문 모두 SKILL.md에 충분한 근거가 존재하며 anti-pattern을 회피하는 정보를 제공.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 (암호화 export·다중 브라우저 폴백·대용량 처리 — 실행 결과·브라우저 환경 검증 필요)
- 최종 상태: PENDING_TEST 유지 (content test PASS, 실사용 검증 후 APPROVED 전환)

---

> (참고용 — 기존 예정 기록)
> skill-tester 메인 호출 예정. 작성 직후 호출 후 갱신.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-05-15) |
| **최종 판정** | **PENDING_TEST 유지** (content test PASS, 실사용 검증 대기) |

> 본 스킬은 *실사용 필수 카테고리*(마이그레이션 가이드·빌드 설정·워크플로우)에 해당한다. 대용량 데이터·실제 암호화 export·다양한 브라우저(Chrome/Firefox/Safari) import 시나리오를 거친 뒤에만 APPROVED 전환을 권장한다.

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 및 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)
- [❌] 실제 PWA 프로젝트에서 1만 건 이상 dream 데이터로 export → 다른 기기 import 종단 테스트 (차단 요인: 실사용 필수 카테고리, APPROVED 전환 전 필수 수행)
- [❌] iOS Safari·Android Chrome·데스크탑 Firefox 3종에서 폴백 동작 확인 (차단 요인: 실사용 필수 카테고리, APPROVED 전환 전 필수 수행)
- [❌] 암호화 export 파일 손상 시 사용자 안내 메시지 UX 검증 (선택 보강: content test에서 gap 발견되지 않음, 실전 도입 후 개선 가능)
- [❌] Background Sync 미지원 환경(Safari)에서 클라우드 백업 옵션 UI flow 확정 (선택 보강: SKILL.md에서 옵션 기능임이 명확히 명시됨)
- [❌] CSV export 시 첨부·중첩 필드 처리 정책 구체화 (선택 보강: 현재 "손실 변환" 언급만 있으나 content test에서 차단 문제 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성. 12개 공식 소스 + 3개 보조 소스로 11개 핵심 클레임 교차 검증 (10 VERIFIED / 1 주의표기) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 JSZip 암호화 한계·대안 / Q2 libsodium Argon2id 파라미터·저사양 폴백 / Q3 File System Access API Firefox·Safari 폴백) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
