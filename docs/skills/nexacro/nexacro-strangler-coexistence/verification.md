---
skill: nexacro-strangler-coexistence
category: nexacro
version: v1
date: 2026-10-08
status: PENDING_TEST
---

# nexacro-strangler-coexistence 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `nexacro-strangler-coexistence` |
| 스킬 경로 | `.claude/skills/nexacro-strangler-coexistence/SKILL.md` |
| 검증일 | 2026-10-08 |
| 검증자 | skill-creator (Claude) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Next.js 16.4.0 rewrites·Multi-Zones, MDN Set-Cookie·Site·Third-party cookies, 투비소프트 넥사크로 17 개발자 가이드·제품 제약사항)
- [✅] 2순위 소스 확인 (martinfowler.com, Azure Architecture Center, Spring Session 공식 가이드)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-10-08 — Next.js 문서 16.4.0, Spring Session 4.1.1)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (파사드 위치 선택, 같은 origin 묶기, 메뉴 플래그, 웨이브 체크리스트)
- [✅] 코드 예시 작성 (next.config fallback, proxy.ts 플래그 분기, 넥사크로 WebBrowser 스크립트, Next.js 브리지)
- [✅] 흔한 실수 패턴 정리 (12항목)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | martinfowler.com/bliki/StranglerFigApplication.html | 2024-08-22 게재본, 4활동·전이 아키텍처·가치 조기 회수 원문 확인 |
| 조사 | WebFetch | nextjs.org rewrites (16.4.0) | beforeFiles/afterFiles/fallback, 라우트 확인 순서, "Incremental adoption of Next.js" 예제 확인 |
| 조사 | WebFetch | nextjs.org multi-zones guide (16.4.0) | hard/soft navigation, 같은 zone 권고, `<a>` 사용, assetPrefix, proxy+기능 플래그 예시, allowedOrigins 확인 |
| 조사 | WebFetch | MDN Set-Cookie / Glossary Site / Third-party cookies | SameSite 3값·Lax 제외 범위(fetch·iframe)·None→Secure·기본 Lax, Domain·host-only·__Host-, site vs origin, 브라우저별 서드파티 쿠키 기본값 |
| 조사 | WebFetch | docs.tobesoft.com 넥사크로 17 개발자 가이드 WebBrowser (c727f951d3abbe36), Nexacro N WebBrowser (de1da5195a28d553) | getProperty/setProperty/callMethod, onloadcompleted, onusernotify + `window.NEXACROWEBBROWSER.on_fire_onusernotify`, destroy() 누수 경고, 교차 도메인 CORS 안내 — 17·N 동일 |
| 조사 | WebFetch | 넥사크로 17 제품 제약사항 | onusernotify NRE 512자 제한, WebBrowser=IFRAME, 다른 도메인 시 휠·mousemove 이상 |
| 조사 | WebFetch | Azure Architecture Center Strangler Fig | 파사드 4단계, 공유 데이터 저장소·SPOF·ACL·부적합 조건 |
| 조사 | WebFetch | Spring Session custom cookie (4.1.1) | setDomainNamePattern 서브도메인 공유, sameSite 기본 Lax, Response Splitting 주의 |
| 교차 검증 | WebSearch | 넥사크로 17 WebBrowser onusernotify / execBrowser / fireUserNotify, Chrome SameSite 기본값, 넥사크로→React 전환 사례, Spring Session base64 | 25개 클레임 — VERIFIED 19 / DISPUTED 0 / UNVERIFIED 6 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Martin Fowler — Strangler Fig | https://martinfowler.com/bliki/StranglerFigApplication.html | ⭐⭐⭐ High | 2024-08-22 | 원저자 |
| Azure Architecture Center — Strangler Fig | https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig | ⭐⭐⭐ High | 2026-09-18 갱신 | 공식 패턴 문서 |
| Next.js rewrites | https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites | ⭐⭐⭐ High | 16.4.0 (2026-09-28) | 공식 문서 |
| Next.js Multi-Zones | https://nextjs.org/docs/app/guides/multi-zones | ⭐⭐⭐ High | 16.4.0 (2026-06-01) | 공식 문서 |
| MDN Set-Cookie | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie | ⭐⭐⭐ High | 2026-10-08 조회 | 표준 문서 |
| MDN Glossary Site | https://developer.mozilla.org/en-US/docs/Glossary/Site | ⭐⭐⭐ High | 2026-10-08 조회 | 표준 문서 |
| MDN Third-party cookies | https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Third-party_cookies | ⭐⭐⭐ High | 2026-10-08 조회 | 표준 문서 |
| 넥사크로플랫폼 17 개발자 가이드 — WebBrowser | https://docs.tobesoft.com/developer_guide_nexacro_17_ko/c727f951d3abbe36 | ⭐⭐⭐ High | 2026-10-08 조회 | 제조사 공식 |
| Nexacro N Developer Guide — WebBrowser | https://docs.tobesoft.com/developer_guide_nexacro_n_en/de1da5195a28d553 | ⭐⭐⭐ High | 2026-10-08 조회 | 제조사 공식 (17과 교차 확인용) |
| 넥사크로 17 제품 제약사항 | https://docs.tobesoft.com/product_information_nexacro_17_ko/product_restrictions | ⭐⭐⭐ High | 2026-10-08 조회 | 제조사 공식 |
| Spring Session — Custom Cookie | https://docs.spring.io/spring-session/reference/guides/java-custom-cookie.html | ⭐⭐⭐ High | 4.1.1 | 공식 문서 |
| Chromium SameSite / web.dev (검색 결과) | https://web.dev/samesite-cookies-explained | ⭐⭐ Medium | 2020~ | Chrome 80 기본 Lax 교차 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 클레임별 교차 검증 결과

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| 1 | Fowler Strangler Fig는 2024-08-22 게재본이며 4활동(결과 이해·분할·조각 배포·조직 변화)을 든다 | Fowler 원문 + 기존 incremental-refactoring 스킬 검증 기록 | VERIFIED |
| 2 | 전이 아키텍처 필요성, 가치 조기 회수, 점진·가시성 | Fowler 원문 + Azure("transitional architecture") | VERIFIED |
| 3 | Azure 판 파사드 4단계, 공유 저장소·SPOF·ACL·부적합 조건 | Azure 문서 + Fowler(조각 이전 개념) | VERIFIED |
| 4 | rewrites 객체형 beforeFiles/afterFiles/fallback, fallback은 동적 라우트 이후·404 직전 | Next.js rewrites 문서 (라우트 순서 목록) + Multi-Zones 문서(rewrites로 zone 라우팅) | VERIFIED |
| 5 | "Incremental adoption" — fallback으로 기존 사이트 프록시, 페이지 추가 시 설정 변경 불필요 | Next.js rewrites 문서 + Next.js incremental adoption 블로그(검색) | VERIFIED |
| 6 | 라우트 확인 순서에 proxy가 redirects 다음·beforeFiles 앞 | Next.js rewrites 문서 + nextjs 스킬(proxy.ts = 구 middleware) | VERIFIED |
| 7 | Multi-Zones: zone 간 hard navigation, 자주 같이 방문하는 페이지는 같은 zone, `<a>` 사용, assetPrefix, 경로 유일, allowedOrigins | Next.js Multi-Zones 문서 + with-zones 예제 링크(rewrites 문서) | VERIFIED |
| 8 | 마이그레이션 중 기능 플래그 동적 라우팅은 proxy 사용, 기본은 rewrites 권장 | Next.js Multi-Zones 문서 + rewrites 문서 순서 | VERIFIED |
| 9 | SameSite=Lax는 cross-site fetch·하위 리소스·iframe 내 탐색에 쿠키를 보내지 않음 | MDN Set-Cookie + MDN Third-party cookies(iframe은 None 필요) | VERIFIED |
| 10 | SameSite=None은 Secure 필수 | MDN Set-Cookie + Chromium/web.dev(검색) | VERIFIED |
| 11 | SameSite 미지정 시 일부 브라우저 기본 Lax (Chrome 80~) | MDN Set-Cookie + Chromium/검색 결과 | VERIFIED |
| 12 | site는 eTLD+1 기준(서브도메인 같은 site), origin은 scheme+도메인+포트, SameSite는 schemeful | MDN Glossary Site + MDN Set-Cookie | VERIFIED |
| 13 | Domain 지정 시 하위 도메인 포함·생략 시 host-only, `__Host-`는 Domain 금지·Path=/·Secure | MDN Set-Cookie + Spring Session 문서(도메인 지정으로 서브도메인 공유) | VERIFIED |
| 14 | Firefox·Safari 기본 서드파티 쿠키 제한, Chrome 기본 미차단 | MDN Third-party cookies + MDN Set-Cookie(SameSite 맥락) | VERIFIED |
| 15 | WebBrowser: url/set_url, getProperty·setProperty·callMethod, onloadcompleted | 넥사크로 17 가이드 + Nexacro N 가이드 | VERIFIED |
| 16 | 웹 페이지 → 넥사크로 통지는 `window.NEXACROWEBBROWSER.on_fire_onusernotify(window.NEXACROWEBBROWSER, userdata)`, 넥사크로는 `onusernotify`의 `e.userdata` | 넥사크로 17 가이드 + Nexacro N 가이드 | VERIFIED |
| 17 | 사용 후 Plugin 객체 destroy() 미해제 시 메모리 누수 | 넥사크로 17 가이드 + Nexacro N 가이드 | VERIFIED |
| 18 | 교차 도메인은 CORS/JSONP 필요, 가장 간단한 해법은 같은 도메인 | 넥사크로 17 가이드 + Nexacro N 가이드 | VERIFIED |
| 19 | NRE에서 onusernotify 값 최대 512자(한글·일본어 256자), HTML5 WebBrowser는 IFRAME, 다른 도메인 시 휠·mousemove 제약 | 넥사크로 17 제품 제약사항 + 검색 결과(17 레퍼런스 요약) | VERIFIED |
| 20 | Spring Session `setDomainNamePattern`으로 서브도메인 세션 공유, sameSite 기본 Lax | Spring Session 4.1.1 가이드 + 2.x 가이드(검색 결과 다수 버전) | VERIFIED |
| 21 | 넥사크로 17에서 새 브라우저 창 열기 공식 API(execBrowser 등) | 검색으로 공식 원문 미발견 | UNVERIFIED (SKILL.md `> 주의: 미검증`) |
| 22 | `nexacro.fireUserNotify()`를 17 WebBrowser에서 사용 가능 | 검색 요약상 신규 WebView 컴포넌트용, 17 적용 원문 없음 | UNVERIFIED (SKILL.md `> 주의`) |
| 23 | 넥사크로 17 폼에서 postMessage 수신 공식 방법 | 원문 미발견 | UNVERIFIED (SKILL.md `> 주의`) |
| 24 | 외부 URL rewrite 시 쿠키·Host·X-Forwarded 헤더 전달 방식 | Next.js 문서에 명시 없음 | UNVERIFIED (SKILL.md `> 주의`) |
| 25 | `NEXACROWEBBROWSER` 주입이 HTML5·NRE 양쪽에서 동일 / 넥사크로→React 메뉴 단위 공개 전환 사례 존재 | 공식 문서가 환경 구분 없음, 사례 검색 결과 없음 | UNVERIFIED (SKILL.md 본문 주의·상단 주의) |

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Next.js 16.4.0, 넥사크로 17, Spring Session 4.1.1)
- [✅] deprecated된 패턴을 권장하지 않음 (middleware.ts 대신 proxy.ts 표기)
- [✅] 코드 예시가 실행 가능한 형태임 (넥사크로 스크립트는 공식 API만 사용한 설계 예시)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (§8)
- [✅] 흔한 실수 패턴 포함 (§7)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 회사 코드·URL 없음, example.com·환경변수 사용)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-10-08, 3문항)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (FAIL/PARTIAL 없음 — 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-10-08
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 대신 대체 사용)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 사내 관리자(약 200명)에서 신규 화면만 Next.js, 나머지는 넥사크로로 보내는 설정·라우트·병목**
- ✅ PASS
- 근거: SKILL.md "2-1 rewrites fallback", "2-4 파사드 위치 선택", "7 흔한 실수"
- 상세: fallback rewrite 코드, 라우트 확인 순서, `/admin/v2` 접두사 사용, 루트 catch-all 금지, 레거시 전 트래픽이 Next.js를 경유하는 병목과 L7 프록시 대안을 정확히 제시. anti-pattern(catch-all 라우트, 업무 흐름 쪼개기) 회피.

**Q2. 다른 site 도메인의 Next.js를 WebBrowser로 띄우면 세션 풀림·callMethod 불가, SameSite=None 제안, `__Host-` 사용 가부**
- ✅ PASS
- 근거: SKILL.md "3-3 공식 제약", "4-1 쿠키 규칙", "4-2 배치별 결론", "4-3 세션 공유 vs 토큰 교환", "7 흔한 실수"
- 상세: 원인(다른 site + iframe 서드파티 + Lax), 해결 순서(같은 origin + 세션 위임 → 서브도메인 쿠키 Domain → 토큰 교환), SameSite=None 무작정 적용 거부, `__Host-`는 공유 쿠키에 불가를 정확히 답변. 답변자가 `__Host-`의 올바른 용도를 추론이라고 명시해 SKILL.md 밖 지식을 구분함.

**Q3. Next.js 저장 후 넥사크로 목록 재조회 — 행 데이터 전송 가부, 코드 골격, 누수, 환경별 미확인점**
- ✅ PASS
- 근거: SKILL.md "3-2 WebBrowser 연동 API", "3-3 공식 제약", "7 흔한 실수"
- 상세: NRE 512자 제한으로 ID·이벤트만 전송, 양방향 코드 골격(`on_fire_onusernotify`/`onusernotify`), `destroy()` 누수 경고, HTML5·NRE 주입 동일성 및 `fireUserNotify`·`postMessage` 미검증 항목을 모두 올바르게 짚음.

### 발견된 gap (선택 보강, 차단 요인 아님)

- 512자 제한이 NRE에만 명시되어 HTML5 환경 제한 여부를 알 수 없음
- fallback 병목의 정량 기준(어느 트래픽부터 L7 프록시) 부재
- 외부 rewrite 시 대용량 업로드·타임아웃·바디 크기 동작 언급 없음
- React `useEffect` 등록/해제 코드는 문장 설명만 있음

### 판정

- agent content test: PASS (3/3 PASS)
- verification-policy 분류: 실사용 필수(워크플로우·설계 가이드 — 인증 배치와 WebBrowser 통신은 PoC로만 최종 확인 가능, 공개 전환 사례 없음)
- 최종 상태: PENDING_TEST 유지

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-10-08, 3/3 PASS) |
| **최종 판정** | **PENDING_TEST** (content test PASS, 실사용 PoC 대기) |

> 분류: 설계 가이드 + 운영 워크플로우 성격(웨이브 체크리스트·인증 배치 결정)이 섞여 있다. 인증·WebBrowser 통신은 실제 PoC로만 최종 확인 가능하고 공개 전환 사례도 없으므로 verification-policy의 "실사용 필수(워크플로우)"로 판단해 PENDING_TEST를 유지한다. 실제 메뉴 1개 PoC 후 APPROVED 전환 검토.

---

## 7. 개선 필요 사항

- [✅] skill-tester가 agent content test 수행하고 섹션 5·6 업데이트 (2026-10-08 완료, 3/3 PASS, PENDING_TEST 유지)
- [❌] (선택 보강) 512자 제한의 HTML5 적용 여부, fallback 프록시 병목 기준·업로드 타임아웃 언급 추가 — 차단 요인 아님
- [❌] 넥사크로 17 새 창 열기 공식 API 원문 확인 후 §3-1 주의 해소 (APPROVED 전환 전 PoC 항목)
- [❌] HTML5·NRE 환경 각각에서 `NEXACROWEBBROWSER` 주입·onusernotify 동작 PoC 결과 반영
- [❌] Next.js 외부 rewrite 시 전달 헤더(Host·X-Forwarded-*·Cookie) 실측 결과 반영
- [❌] 넥사크로→React/Next.js 메뉴 단위 전환 공개 사례가 나오면 근거로 추가

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-10-08 | v1 | 최초 작성 (클레임 25개: VERIFIED 19 / DISPUTED 0 / UNVERIFIED 6) | skill-creator |
| 2026-10-08 | v1 | 2단계 실사용 테스트 수행 (Q1 fallback rewrite 설정·병목 / Q2 다른 site 쿠키·세션·`__Host-` / Q3 WebBrowser 통신·512자·destroy) → 3/3 PASS, 실사용 필수 카테고리(PoC 대기)로 PENDING_TEST 유지 | skill-tester |
