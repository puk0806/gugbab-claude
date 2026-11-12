---
skill: kakao-share-optimization
category: frontend
version: v1.3
date: 2026-11-09
status: APPROVED
---

# kakao-share-optimization 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `kakao-share-optimization` |
| 스킬 경로 | `.claude/skills/kakao-share-optimization/SKILL.md` |
| 검증일 | 2026-11-09 (재검증 3차, 이전 2026-09-28 재검증 2차 / 2026-08-26 재검증 1차 / 2026-06-04 최초) |
| 검증자 | skill-creator |
| 스킬 버전 | v1.3 |
| SDK 기준 버전 | Kakao JavaScript SDK 2.8.4 (2026-10-19 출시) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Kakao Developers)
- [✅] 공식 SDK Reference 페이지 확인
- [✅] 최신 버전 기준 내용 확인 (2.8.1 / 2026-04-09)
- [✅] 핵심 패턴·이미지 사양 정리
- [✅] 코드 예시 작성 (sendDefault, sendScrap, Next.js generateMetadata)
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "Kakao JavaScript SDK latest version 2026 CDN URL", "카카오 OG 캐시 초기화 도구" | Kakao Developers 공식 페이지 + 데브톡 답변 식별 |
| 조사 | WebFetch | `developers.kakao.com/docs/.../javascript/download`, `.../kakaotalk-share/js-link`, `.../message-template/common`, SDK Reference | SDK 버전 2.8.1, CDN URL, 이미지 5MB·200×200 사양 확인 |
| 조사 | WebFetch | `devtalk.kakao.com/t/og-image-og/139618` (카카오 공식 답변) | og:image 800×400 2:1 권장 + 스마트 크롭 확인 |
| 교차 검증 | WebSearch | "카카오 SDK 2.7 2.8 차이", "카카오 메시지 템플릿 이미지 SVG JPEG PNG" | Kakao.Link → Kakao.Share v1.43.0 변경, JPG/JPEG/PNG/PDF 허용 확인 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Kakao Developers — JavaScript SDK Download | https://developers.kakao.com/docs/latest/ko/javascript/download | ⭐⭐⭐ High | 2026-06-04 | 공식 문서. SDK 2.8.1 (2026-04-09) 확인 |
| Kakao Developers — 카카오톡 공유 JavaScript | https://developers.kakao.com/docs/latest/ko/kakaotalk-share/js-link | ⭐⭐⭐ High | 2026-06-04 | 공식 문서. sendDefault/sendCustom/sendScrap 명세 |
| Kakao Developers — 메시지 템플릿 공통 | https://developers.kakao.com/docs/latest/ko/message-template/common | ⭐⭐⭐ High | 2026-06-04 | 공식 문서. 이미지 200×200·5MB 제한 |
| Kakao Developers — OG 캐시 초기화 도구 | https://developers.kakao.com/tool/clear/og | ⭐⭐⭐ High | 2026-06-04 | 공식 도구 페이지 |
| Kakao Developers — SDK Reference (Kakao.Share) | https://developers.kakao.com/sdk/reference/js/release/Kakao.Share.html | ⭐⭐⭐ High | 2026-06-04 | 공식 SDK 레퍼런스 |
| Kakao DevTalk — og:image 권장 크기 공식 답변 | https://devtalk.kakao.com/t/og-image-og/139618 | ⭐⭐⭐ High | 2026-06-04 | 카카오 임직원 공식 답변. 800×400 2:1 |
| Kakao DevTalk — 미리보기 캐시 삭제 FAQ | https://devtalk.kakao.com/t/topic/22238 | ⭐⭐⭐ High | 2026-06-04 | 공식 FAQ |

### 3-1. 2026-09-28 재검증(2차) 시 추가 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Kakao Developers — JavaScript SDK Download (재확인) | https://developers.kakao.com/docs/latest/ko/javascript/download | ⭐⭐⭐ High | 2026-09-28 조회 | SDK 2.8.2→**2.8.3**(2026-09-03) 버전업 확인, CDN URL 형식 동일 |
| Kakao Developers — 카카오톡 공유 JavaScript (재확인) | https://developers.kakao.com/docs/latest/ko/kakaotalk-share/js-link | ⭐⭐⭐ High | 2026-09-28 조회 | sendDefault/sendCustom/sendScrap, objectType 5종, Kakao.Link→Kakao.Share 변경 공지 변경 없음 |
| Kakao Developers — 메시지 템플릿 공통 (재확인) | https://developers.kakao.com/docs/latest/ko/message-template/common | ⭐⭐⭐ High | 2026-09-28 조회 | **신규 확인**: 이미지 최소 크기가 기본 템플릿 200×200 / 사용자 정의 템플릿 400×400으로 구분 명시. 최대 5MB 변경 없음 |
| Kakao Developers — OG 캐시 초기화 도구 URL (변경 확인) | https://developers.kakao.com/tool/clear/og → https://developers.kakao.com/tool/debugger/sharing | ⭐⭐⭐ High | 2026-09-28 (curl 302 리다이렉트 확인) | 구 URL이 "공유 디버거"(`/tool/debugger/sharing`)로 리다이렉트됨을 curl로 직접 확인. 기능 동일은 카카오 데브톡 공유 디버거 캐시 초기화 글 다수로 교차 확인 |
| Kakao Developers — SDK Reference (Kakao.Share) (재확인) | https://developers.kakao.com/sdk/reference/js/release/Kakao.Share.html | ⭐⭐⭐ High | 2026-09-28 조회(200 OK) | 변경 없음 |

### 3-2. 2026-11-09 재검증(3차) 시 추가 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Kakao Developers — JavaScript SDK Download (재확인) | https://developers.kakao.com/docs/ko/javascript/download | ⭐⭐⭐ High | 2026-11-09 조회 | 최신 **2.8.4**(2026-10-19): 배송지 조회 API 단일 배송지 조회로 변경·v1 `/v1/user/shipping_address` 호출 지원 제거·내부 개선. 2.8.3(2026-09-03)은 내부 개선. `docs/latest/ko/...`는 `docs/ko/...`로 302 리다이렉트 |
| Kakao CDN (직접 확인) | https://t1.kakaocdn.net/kakao_js_sdk/2.8.4/kakao.min.js | ⭐⭐⭐ High | 2026-11-09 curl HTTP 200 | CDN 경로 형식 동일 (2.8.5·2.9.0은 404 — 미출시) |
| Kakao Developers — 카카오톡 공유 JavaScript (재확인) | https://developers.kakao.com/docs/ko/kakaotalk-share/js-link | ⭐⭐⭐ High | 2026-11-09 조회 | `sendDefault`/`sendCustom`/`sendScrap`·`create*Button`, 기본 템플릿 5종(피드·리스트·위치·커머스·텍스트), 이미지 5MB 이하 변동 없음 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 핵심 클레임 교차 검증

| # | 클레임 | 출처 1 | 출처 2 | 판정 |
|---|--------|--------|--------|------|
| 1 | Kakao JavaScript SDK 최신 안정 버전은 **2.8.1**이며 2026-04-09 출시 | Kakao Developers 다운로드 페이지 (KO) | Kakao Developers 다운로드 페이지 (EN) | **VERIFIED** |
| 2 | CDN URL은 `https://t1.kakaocdn.net/kakao_js_sdk/${VERSION}/kakao.min.js` 형식 | Kakao Developers 다운로드 페이지 | npm/jsdelivr 패키지 페이지 | **VERIFIED** |
| 3 | 메시지 템플릿 이미지 **최소 200×200px, 최대 파일 크기 5MB** | Kakao 메시지 템플릿 공식 문서 | Kakao 카카오톡 공유 공식 문서 (5MB 명시) | **VERIFIED** |
| 4 | og:image 권장 크기 **800×400 (2:1)** + 스마트 크롭 자동 변환 | Kakao DevTalk 임직원 공식 답변 | 카카오 비즈니스 가이드(2:1 비율) | **VERIFIED** |
| 5 | OG 캐시 초기화 도구 URL `developers.kakao.com/tool/clear/og` | Kakao Developers 도구 페이지 | 카카오 DevTalk 캐시 삭제 FAQ | **VERIFIED** |
| 6 | SDK v1.43.0부터 모듈명이 `Kakao.Link` → `Kakao.Share`로 변경 | Kakao Developers 카카오톡 공유 페이지 Notice | Kakao DevTalk 마이그레이션 안내 | **VERIFIED** |
| 7 | `sendDefault` objectType: `feed`, `list`, `location`, `commerce`, `text` | Kakao Developers JS Share 문서 | Kakao SDK Reference | **VERIFIED** |
| 8 | 카카오 크롤러는 JavaScript 실행 안 함 → SSR/SSG 필요 | Kakao DevTalk SPA 관련 답변 다수 | 실무 보고 다수 | **VERIFIED** |
| 9 | 지원 이미지 형식: **JPEG/PNG** (SVG/WebP 명시적 권장 없음) | Kakao 메시지 API 업로드 허용 형식 (JPG/JPEG/PNG/PDF) | DevTalk·블로그 다수 사례 | **DISPUTED → 수정 반영** (SVG/WebP 미지원에 대한 공식 명문화는 없음 → SKILL에 `> 주의:` 표기) |
| 10 | SDK `integrity` 해시값 | 공식 다운로드 페이지 (버전별 표기 안내만 있고 직접 게재되지 않음) | — | **UNVERIFIED → SKILL에 `${INTEGRITY_VALUE}` placeholder + 공식 페이지에서 복사 안내** |
| 11 | (2026-11-09) 최신 SDK **2.8.4**(2026-10-19), 공유 API 변경 없음 | Kakao 다운로드 페이지 변경 이력 | CDN 2.8.4 경로 HTTP 200 | **VERIFIED** (2.8.3→2.8.4 갱신) |
| 12 | (2026-11-09) `Kakao.Share` send*/create*Button·기본 템플릿 5종·이미지 5MB | Kakao 카카오톡 공유 JS 문서 | SDK Reference | **VERIFIED** |
| 13 | (2026-11-09) 이미지 최소 해상도(200×200 / 400×400) | 메시지 템플릿 공통 문서(2026-09-28 확인분) | 공유 JS 문서에는 최소 해상도 언급 없음 | 기존 판정 유지(이번엔 재조회 안 함) |

### 4-2. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보 명시 (SDK 2.8.1, 2026-04-09)
- [✅] deprecated 패턴(`Kakao.Link.*`)을 권장하지 않음 — `> 주의:` 표기로 명시
- [✅] 코드 예시가 실행 가능한 형태 (sendDefault, sendScrap, Next.js generateMetadata)

### 4-3. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (sendDefault vs sendCustom vs sendScrap 표)
- [✅] 흔한 실수 패턴 포함 (섹션 8)

### 4-4. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 없음)

### 4-5. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-04, 재테스트 2026-09-28·2026-11-09)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-06-04 3/3 PASS, 2026-09-28 2/2 PASS, 2026-11-09 2/2 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 세 차례 모두 보완 필요 없음

---

## 5. 테스트 진행 기록

### [2026-11-09] skill-tester 재테스트 — 3차 재검증(SDK 2.8.3→2.8.4, CDN 경로 갱신) 대응

**수행일**: 2026-11-09
**수행자**: skill-tester → general-purpose (frontend 도메인 에이전트 대체)
**수행 방법**: SKILL.md Read 후 2.8.4 버전·CDN 갱신분을 겨냥한 실전 질문 2개 답변, 근거 섹션 및 anti-pattern 회피 확인

#### 실제 수행 테스트

**Q1. Next.js 앱에 카카오톡 공유 추가 — 현재 기준 SDK 버전, CDN 로드 코드, integrity 처리, init·sendDefault 호출**
- ✅ PASS
- 근거: SKILL.md "SDK 기준 버전" 헤더, §4 "SDK 로드 (2.8.4 기준)" 및 주의 2건, "피드(feed) 공유"
- 상세: 2.8.4, `https://t1.kakaocdn.net/kakao_js_sdk/2.8.4/kakao.min.js` 경로, `${INTEGRITY_VALUE}`를 공식 다운로드 페이지에서 복사·버전 업 시 함께 갱신, JavaScript 키(REST 키 아님)로 `Kakao.init`, `Kakao.Share.sendDefault` feed 예시를 모두 정확히 인용. 구버전(2.8.3) 값 사용 없음

**Q2. 옛 블로그의 `Kakao.Link.sendDefault`·구 SDK로 공유 실패 + 2.8.4 업데이트(배송지 조회 API 변경)가 공유 코드에 영향 주는지**
- ✅ PASS
- 근거: SKILL.md 헤더(3차 갱신 사유·기준 버전), §4 `> 주의:` (Kakao.Link→Kakao.Share v1.43.0), §8 Anti-patterns
- 상세: `Kakao.Share.*` 전환, 2.8.4 CDN 사용, 배송지 조회 v1 API 제거는 `Kakao.Share` API에 영향 없음("공유 API는 이전 버전과 동일")을 정확히 답변. 배송지 API 신규 사용법은 범위 밖이라고 올바르게 선 그음

#### 발견된 gap

- minor: Next.js 전용 SDK 로드(`next/script`, `'use client'`, 중복 `Kakao.init` 가드, `NEXT_PUBLIC_` 키) 코드 예시 없음 — 선택 보강, 차단 요인 아님
- minor: 본문에 `create*Button` 예시가 없는데 검증일 문단은 재확인했다고 언급 — 선택 보강
- minor: Web 플랫폼 도메인 등록 언급 없음, "deprecated 또는 동작 안 함" 표현 모호 — 선택 보강

#### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 라이브러리·패턴 정리형 — content test PASS = APPROVED 가능
- 최종 상태: **APPROVED 유지**

---

### [2026-09-28] skill-tester 재테스트 — 2차 재검증(URL 정정·이미지 규격 보강) 대응

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (frontend 도메인 에이전트 미설치로 대체)
**수행 방법**: SKILL.md Read 후 2026-09-28 재검증(2차)에서 정정·보강된 내용(OG 캐시 초기화 도구 URL 변경, `sendCustom` 이미지 최소 크기 400×400 구분)을 겨냥한 실전 질문 2개를 general-purpose 서브에이전트에 위임, 근거 섹션 인용 여부 확인

#### 실제 수행 테스트

**Q1. 예전 즐겨찾기 `tool/clear/og` URL로 접속했더니 이상한 페이지로 리다이렉트된다 — 원인과 현재 캐시 초기화 방법**
- ✅ PASS
- 근거: SKILL.md §3 "카카오 캐시 문제와 초기화" — "주의 (2026-09-28 확인)" 문구 및 공식 도구 URL `tool/debugger/sharing`
- 상세: 구 URL → 신 URL("공유 디버거") 리다이렉트 사실, 로그인 필요, http/https 구분, 초기화 절차 3단계를 모두 정확히 인용. 재검증(2차)에서 정정된 URL이 그대로 정답 근거로 활용됨

**Q2. `Kakao.Share.sendCustom` 커스텀 템플릿에 200×200px 이미지를 써도 되는가**
- ✅ PASS
- 근거: SKILL.md §2 "이미지 요구사항" 표 + 주의 문구(`sendCustom` 400×400 구분)
- 상세: 기본 템플릿(200×200) vs 사용자 정의 템플릿(400×400) 구분을 정확히 인지하고 200×200이 `sendCustom` 기준 미달이라고 정확히 판단. 재검증(2차)에서 보강(ADD)된 구분 내용이 답변에 정확히 반영됨

#### 발견된 gap

- minor: `sendCustom` 이미지 크기를 실제로 어느 파라미터에 지정하는지 코드 예시가 없음(§4 코드 예시는 sendDefault만) — 선택 보강, 차단 요인 아님
- minor: OG 캐시 초기화 도구 리다이렉트 후 실제로 보이는 화면(로그인 페이지인지 등)까지는 SKILL.md에 없음 — 선택 보강, 차단 요인 아님

#### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 라이브러리·패턴 정리형 — content test PASS = APPROVED 가능
- 최종 상태: **APPROVED** (PENDING_TEST → APPROVED 복귀)

---

**수행일**: 2026-06-04
**수행자**: skill-tester → general-purpose (frontend 도메인 에이전트 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 카카오톡 공유 후 OG 이미지 수정해도 옛날 이미지가 계속 뜬다 — 원인과 해결책**
- PASS
- 근거: SKILL.md "3. 카카오 캐시 문제와 초기화" 섹션
- 상세: `developers.kakao.com/tool/clear/og` 캐시 초기화 절차 완전 일치, 급한 경우 `?v=2` 쿼리스트링 우회법도 섹션 3에 정확히 기재. 섹션 8 anti-pattern "캐시 초기화 없이 OG 수정" 항목과 일치

**Q2. 블로그 참고해 `Kakao.Link.sendDefault` 구현했더니 동작 안 한다 — 원인과 해결책**
- PASS
- 근거: SKILL.md "4. Kakao JavaScript SDK 공유 구현" 섹션 내 `> 주의:` 블록 및 섹션 8 Anti-patterns 표
- 상세: SDK v1.43.0부터 `Kakao.Link` → `Kakao.Share` 변경, `Kakao.Share.*`만 사용 원칙, REST API 키 vs JavaScript 키 혼동 경고까지 SKILL.md에 명확히 기재

**Q3. CSR React SPA에서 `useEffect`로 meta 태그 동적 삽입하면 카카오 OG 미리보기 뜨나**
- PASS
- 근거: SKILL.md "1. 카카오톡 OG 미리보기 기본 구조", "5. SPA (Next.js / React) 환경에서 OG 처리" 섹션
- 상세: "카카오 크롤러는 JavaScript를 실행하지 않는다" 명시, `document.querySelector` 동적 변경 무의미 설명, anti-pattern "CSR로 OG meta 동적 변경 → 카카오 미인식" 섹션 8에 기재. 해결책(prerender.io/Edge Function/SSR 마이그레이션)도 섹션 5에 완전히 기재

### 발견된 gap

없음. 3개 질문 모두 SKILL.md 근거가 충분하고 anti-pattern 회피 정확.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리·패턴 정리형 — content test PASS = APPROVED 가능
- 최종 상태: APPROVED

---

> (참고) 테스트 수행 전 원본 기록:
> skill-tester 에이전트가 SKILL.md Read 후 실전 질문으로 검증 예정.
> (미수행 — 후속 skill-tester 호출 시 갱신)

### [2026-09-28] 재검증(2차) — SDK 버전·OG 캐시 도구 URL·이미지 규격 재확인

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 4개를 1차 소스(WebFetch·curl)와 대조, 보강·축소 검토

**클레임 대조 결과**:
1. Kakao JavaScript SDK 최신 버전(2.8.2, 2026-08-06) → **DISPUTED(버전 갱신) → 정정** — 2.8.3(2026-09-03 출시)로 갱신, CDN URL·API 변경 없음 확인 (https://developers.kakao.com/docs/latest/ko/javascript/download)
2. OG 캐시 초기화 도구 URL `developers.kakao.com/tool/clear/og` → **DISPUTED(URL 변경) → 정정** — curl로 `tool/debugger/sharing`("공유 디버거")로 302 리다이렉트 확인, 기능 동일. SKILL.md §3·§7·소스 링크 전체 정정
3. 메시지 템플릿 이미지 최소 크기 200×200(단일 값) → **보강 필요 확인 → ADD** — 공식 문서 원문에 "기본 템플릿: 최소 200×200 / 사용자 정의 템플릿: 최소 400×400"으로 구분 명시되어 있음을 확인, 기존 SKILL.md는 이 구분 없이 200×200만 기재 — §2 표·주의 문구로 보강
4. `Kakao.Share.sendDefault`/`sendCustom`/`sendScrap`, objectType 5종(feed/list/location/commerce/text), `Kakao.Link`→`Kakao.Share`(v1.43.0) 변경 공지 → VERIFIED (변경 없음)

**보강(ADD)·축소**: ① SDK 버전 2.8.2→2.8.3 갱신(헤더 주석·§4 CDN 예시) ② OG 캐시 초기화 도구 URL을 `tool/debugger/sharing`으로 전면 정정(§3·§7·소스 목록) + 구 URL 리다이렉트 사실을 주의 문구로 명시 ③ §2 이미지 최소 크기를 기본/사용자 정의 템플릿으로 구분해 보강, `sendCustom` 사용 시 400×400 기준 주의 문구 신설. 축소는 없음(레거시 `Kakao.Link` 경고·anti-pattern 표 등 전부 유지).

**실전 질문 재검증**:
- Q1. "카카오 OG 캐시 초기화하려는데 `developers.kakao.com/tool/clear/og`가 이상한 데로 넘어간다" → SKILL.md §3(공유 디버거 URL·주의 문구) 근거로 PASS
- Q2. "`Kakao.Share.sendCustom`으로 커스텀 템플릿 이미지 넣었는데 200×200이면 되나?" → SKILL.md §2(400×400 사용자 정의 템플릿 구분) 근거로 PASS

**재검증 최종 판정**: status **PENDING_TEST 전환** (ADD 1건 + URL 정정 1건 + 버전 갱신 발생 — verification-policy에 따라 메인이 skill-tester 재테스트 필요. 실사용 필수 카테고리 아님 → content test PASS 시 APPROVED 복귀 가능)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-06-04 3/3 PASS, 2026-09-28 2/2 PASS, 2026-11-09 skill-tester 재테스트 2/2 PASS) |
| freshness 재검증 3차 | ✅ 2026-11-09 — SDK 2.8.3→2.8.4 갱신, 공유 API 변경 없음 VERIFIED. 재시험 2/2 PASS |
| freshness 재검증 2차 | ✅ 2026-09-28 — SDK 2.8.2→2.8.3, OG 캐시 도구 URL `tool/clear/og`→`tool/debugger/sharing` 정정, 메시지 템플릿 이미지 최소 크기 기본/사용자 정의 구분 보강(ADD). VERIFIED 2건 / DISPUTED 2건(정정) / ADD 1건 |
| **최종 판정** | **APPROVED** (2026-11-09 skill-tester 재테스트 2/2 PASS — 3차 재검증 후 APPROVED 유지) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 및 섹션 5·6 업데이트 (2026-06-04 완료, 3/3 PASS)
- [✅] 정기 재검증 2회차 수행 (2026-09-28) — SDK 버전·OG 캐시 도구 URL·이미지 규격 재확인
- [✅] 2026-09-28 재검증(2차)에 대한 skill-tester content test 재수행 완료 (2/2 PASS, APPROVED 복귀)
- [✅] 2026-11-09 재검증(3차, SDK 2.8.4)에 대한 skill-tester content test 재수행 완료 (2/2 PASS, APPROVED 유지)
- [❌] Next.js 전용 SDK 로드 예시(`next/script`·중복 init 가드)·`create*Button` 예시·Web 도메인 등록 언급 추가 — 선택 보강 (차단 요인 아님, 2026-11-09 테스트에서 발견)
- [❌] `${INTEGRITY_VALUE}`는 공식 다운로드 페이지에서 버전별로 갱신되므로, SDK 메이저 버전 업데이트 시 SKILL.md의 CDN 예시도 갱신해야 함 — 선택 보강 (차단 요인 아님, 정기 점검 시 갱신)
- [❌] WebP 지원 여부가 추후 공식화되면 섹션 2의 `> 주의:` 표기 갱신 — 선택 보강 (공식 발표 시 갱신)
- [❌] Next.js App Router 메타데이터 API는 변경 잦으므로 Next.js 메이저 버전 변경 시 예시 재검증 — 선택 보강 (Next.js 메이저 업그레이드 시 갱신)
- [❌] 카카오 SDK 3.x 출시 시 모듈 구조·`Kakao.init` 시그니처 재검증 — 선택 보강 (SDK 메이저 업그레이드 시 갱신)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-04 | v1 | 최초 작성. SDK 2.8.1 기준. 9개 핵심 클레임 교차 검증 완료 (VERIFIED 8 / DISPUTED 1 → 수정 반영 / UNVERIFIED 1 → placeholder) | skill-creator |
| 2026-06-04 | v1 | 2단계 실사용 테스트 수행 (Q1 카카오 OG 캐시 초기화 / Q2 Kakao.Link→Kakao.Share 변경 / Q3 CSR SPA OG 미인식 원인) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-08-26 | v1.1 | freshness 재검증(83일 경과) — 이미지 규격·`Kakao.Share.sendDefault` VERIFIED. SDK 2.8.1→**2.8.2**(2026-08-06, 카카오 공식 다운로드 페이지 확인) CDN 경로 3곳 갱신. §5 CSR 대응책의 `prerender.io / rendertron / react-snap` 나열을 **OUTDATED**로 정정 — Rendertron은 2022년 archive, 동적 렌더링은 Google 기준 비권장 우회책. Vike/프리렌더 정공법 + Edge에서 스크래퍼 UA에만 og 주입하는 대안으로 교체(`seo-vite-spa`와 서술 일치) | freshness-auditor + orchestrator |
| 2026-09-25 | v1.1 | 교차 참조 조건부 표기 (내용 변경 없음) | Claude (Sonnet 5) |
| 2026-09-28 | v1.2 | **재검증(2차)** — ① SDK 2.8.2→**2.8.3**(2026-09-03 출시) 갱신 ② **OG 캐시 초기화 도구 URL 정정**: 구 `tool/clear/og` → 신 `tool/debugger/sharing`("공유 디버거"), §3·§7·소스 링크 전면 갱신 + 리다이렉트 사실 주의 문구 신설 ③ **§2 이미지 최소 크기 보강(ADD)** — 기본 템플릿 200×200 / 사용자 정의 템플릿(`sendCustom`) 400×400 구분 명시, `sendCustom` 사용 시 주의 문구 신설 ④ `Kakao.Share` API·objectType·`Kakao.Link` deprecation은 재확인 결과 변경 없음(VERIFIED). status **PENDING_TEST**로 전환(URL 정정·ADD 발생 — skill-tester 재테스트 대기) | skill-creator (재검증) |
| 2026-09-28 | v1.2 | 2단계 실사용 재테스트 수행 (Q1 OG 캐시 초기화 도구 URL 변경 대응 / Q2 `sendCustom` 이미지 최소 크기 400×400 구분) → 2/2 PASS, **APPROVED** 전환 | skill-tester |
| 2026-11-09 | v1.3 | **재검증(3차)** — SDK 2.8.3→**2.8.4**(2026-10-19, 배송지 조회 v1 API 지원 제거·내부 개선, 공유 API 변경 없음) 갱신: 헤더 기준 버전·§SDK 로드 CDN 경로. `Kakao.Share` 메서드·기본 템플릿 5종·5MB 제한 VERIFIED, 문서 URL `docs/latest/ko`→`docs/ko` 리다이렉트 확인 → skill-tester 재시험 | Claude (Opus 5.5) |
| 2026-11-09 | v1.3 | 2단계 실사용 재테스트(재검증 3차 대응) 수행 (Q1 2.8.4 버전·CDN·integrity·init·sendDefault / Q2 Kakao.Link 구버전 실패 + 2.8.4 배송지 API 변경 영향) → 2/2 PASS, APPROVED 유지 | skill-tester |
| 2026-11-12 | v1.3.1 | 정리(사실 재검증 아님) — 일반 지식 덜어내기: 남긴 것 이미지 사양 표·SVG/1200×630/sendCustom 400×400 주의·스마트 크롭 안전 영역, 공유 디버거 초기화 절차·URL 변경·지연 주의, SDK 2.8.4 로드·integrity·JavaScript 키·Kakao.Link→Share, send* 3종 표·sendScrap OG 의존, 메시지/채널 API 구분(요약), CSR SPA 대응(kakaotalk-scrap UA·Rendertron archive), 디버깅 체크리스트, 실수 표 / 덜어낸 것 필수 OG 태그 HTML 예제, feed 전체 코드 예제·sendScrap 예제, Next.js App/Pages Router OG 예제, 페이스북 디버거 절, 메시지 vs 공유 vs 채널 표 형식, 권장 워크플로우 절. 원 검증일 2026-11-09 기준 내용 그대로, status·검증일 변경 없음 | 정리 |
