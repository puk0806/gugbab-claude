---
skill: og-image-generation
category: frontend
version: v1.2
date: 2026-09-28
status: APPROVED
---

# og-image-generation 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 공식 문서 기반으로 내용 작성
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실제 사용 중 (skill-tester 호출)
  ├─ skill-tester가 SKILL.md 기반 실전 질문 생성·답변
  └─ 테스트 PASS → APPROVED
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | og-image-generation |
| 스킬 경로 | `.claude/skills/og-image-generation/SKILL.md` |
| 최초 작성일 | 2026-06-02 |
| 검증일 | 2026-09-28 (최초 2026-06-02) |
| 검증 방법 | 공식 문서 교차 검증 → skill-tester 실사용 테스트 완료 (2026-06-02) |
| 버전 기준 | Next.js 16.x(16.3.6+ 보안 패치 필수) · satori 0.33.x(0.33.5+ 보안 패치 필수) · @vercel/og 1.0.x |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인
- [✅] 최신 버전 기준 내용 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성 (Next.js ImageResponse + satori 단독 + 빌드 시 사전 생성)
- [✅] 흔한 실수 패턴 정리
- [✅] CJK 폰트 처리 섹션 작성 (한국 사용자 핵심)
- [✅] SKILL.md 파일 작성 (580줄, 11섹션)
- [✅] skill-tester 실사용 테스트 (2026-06-02 완료, 3/3 PASS)

---

## 2. 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 작성 | skill-creator | OG 이미지 동적 생성 패턴 카탈로그 (Next.js ImageResponse, satori, CJK 폰트, 사전/런타임 생성, 캐시) | SKILL.md 580줄 + 본 verification.md |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Next.js OpenGraph Image 파일 컨벤션 | https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image | ⭐⭐⭐ High |
| Next.js `ImageResponse` API | https://nextjs.org/docs/app/api-reference/functions/image-response | ⭐⭐⭐ High |
| vercel/satori GitHub | https://github.com/vercel/satori | ⭐⭐⭐ High |
| Open Graph Protocol | https://ogp.me/ | ⭐⭐⭐ High |
| Facebook Sharing Best Practices | https://developers.facebook.com/docs/sharing/webmasters/ | ⭐⭐⭐ High |
| X (Twitter) Cards Markup | https://developer.x.com/en/docs/x-for-websites/cards/overview/markup | ⭐⭐⭐ High |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] OG 이미지 표준 크기 1200×630 (1.91:1) — ogp.me + Facebook docs 일치
- [✅] og:image, og:image:width, og:image:height, og:image:alt 필드 정확
- [✅] 절대 URL 필수 (상대 URL 안 됨) — Facebook docs 명시
- [✅] Next.js `opengraph-image.tsx` / `twitter-image.tsx` 파일 컨벤션 정확
- [✅] 동적 라우트 `params` Promise (Next.js 15+) 반영
- [✅] satori = JSX → SVG (PNG는 resvg/sharp로 별도 변환) 정확
- [✅] satori 지원 CSS 한계(flexbox 위주, grid 미지원) 정확
- [✅] CJK 폰트 임베드 필수 — Pretendard / Noto Sans KR
- [✅] `loadAdditionalAsset` callback 동적 폰트 로딩 패턴
- [✅] @vercel/og → next/og 경로 통합 반영 (현재 정식 import 경로)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 11개 섹션 (사양·Next.js·satori·CJK 폰트·사전/동적·캐시·패키지·외부 서비스·실수·검증·선택 가이드)
- [✅] 코드 예시 6개 이상 (정적/동적 라우트·twitter-image·satori 단독·폰트 옵션 A·B·C·SSG 사전 생성)
- [✅] 흔한 실수 패턴 포함 (절대 URL·CJK 폰트·grid 미지원·캐시 누락 등)
- [✅] 검증 도구 섹션 (Facebook Sharing Debugger, X Card Validator, Kakao OG 디버거)
- [✅] 언제 어느 방식 선택할지 결정 가이드 포함

### 4-3. 실용성

- [✅] 한국 사용자 핵심 케이스(한국어 폰트 □ 표시) 별도 섹션
- [✅] Next.js / Vite / Astro / 순수 HTML 사용처별 가이드
- [✅] 캐시 전략 구체 헤더 값(Cache-Control max-age=31536000 immutable) 포함

### 4-4. Claude Code 에이전트 활용 테스트 (skill-tester)

- [✅] skill-tester 실사용 테스트 수행 (2026-06-02)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)

---

## 5. 테스트 진행 기록

### [2026-09-28] skill-tester content test 재테스트 — CVE-2026-94545 satori 단독 심각도 정정 반영 확인

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션 존재 여부 확인. Q1은 2026-09-28 재검증(2차)에서 메인 세션이 보정한 "satori 단독 영향 문구"(satori 어드바이저리 자체 심각도는 medium, Critical은 Next.js Node ImageResponse 경로 기준)가 정확히 반영되어 혼동 없이 답이 나오는지 직접 겨냥.

### 실제 수행 테스트

**Q1. Next.js 없이 satori 단독(빌드 타임)으로 OG 이미지를 만드는데 satori 0.33.2 사용 중. CVE-2026-94545가 Critical(CVSS 9.5)로 그대로 적용되는가?**
- ✅ PASS
- 근거: SKILL.md "0. 보안 필수 확인" 34행(Critical 9.5는 Next.js Node.js `ImageResponse` 경로 기준) + 38행(satori 단독 사용은 `<0.33.5` 영향받아 0.33.2가 취약 범위에 해당하나, satori 어드바이저리 자체 심각도는 **medium**이고 Critical 판정은 Next.js 경로 기준이라는 구분)
- 상세: 에이전트가 "취약점 존재 여부(예, 0.33.5 미만이라 영향받음)"와 "심각도 등급(Next.js Critical ≠ satori 단독 Medium)"을 정확히 분리해 답변. 0.33.5 이상 업그레이드 필요성도 명시. 정정 문구가 SKILL.md에 정확히 반영되어 있어 혼동 없이 PASS.

**Q2. 블로그 동적 라우트에서 params 처리 + 한국어 폰트 tofu(□) 방지**
- ✅ PASS
- 근거: SKILL.md "2. Next.js App Router — 동적 라우트 — params Promise" 섹션(161~201행) + "4. 한국어 폰트 임베드" 섹션(옵션 A/B/C, 329~421행)
- 상세: `await params`(Next.js 16 Promise 타입) + ArrayBuffer 폰트 등록(옵션 A) + 500KB 번들 제한 시 서브셋(옵션 B) + `loadAdditionalAsset`은 satori 직접 사용 시에만 적용되고 next/og에는 불가(옵션 C, 421행)까지 정확히 근거 제시. gap 없음.

### 발견된 gap

- 선택 보강(차단 요인 아님): 옵션 C가 next/og에는 적용 불가하다는 안내가 섹션 4 후반부에만 있어 처음 읽을 때 혼동 가능 — 섹션 4 도입부에 "옵션 C는 satori 단독 사용 전용" 문구를 앞당겨 배치하면 가독성 개선. 동적 라우트+한국어 폰트 결합 단일 완성 예제 부재(섹션 2·4를 개발자가 직접 합쳐야 함)도 선택 보강.

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (라이브러리 사용법 스킬 — content test PASS = APPROVED 가능)
- 최종 상태: **PENDING_TEST → APPROVED 복귀** (CVE-2026-94545 보안 ADD 반영 후 재테스트 2/2 PASS)

---

**수행일**: 2026-06-02
**수행자**: skill-tester → general-purpose (frontend-developer 부재 시 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Next.js 15/16 블로그에서 슬러그별 동적 OG 이미지 생성 + 한국어 □ 해결법**
- PASS
- 근거: SKILL.md "2. Next.js App Router — 동적 라우트 — params Promise" 섹션 + "4. 한국어 폰트 임베드" 섹션
- 상세: `app/blog/[slug]/opengraph-image.tsx` 생성 → `await params` 필수(Next.js 16+ Promise), `readFile`로 TTF 로드 → fonts 배열 ArrayBuffer 전달. Pretendard Variable 폰트 단독 등록 anti-pattern 명시(섹션 4 주의), WOFF2 미지원 명시(섹션 9), 번들 500KB 제한 → 서브셋 권장(섹션 4 옵션 B) 모두 SKILL.md에 근거 존재.

**Q2. Vite 정적 사이트에서 빌드 시 모든 페이지 OG 이미지 사전 생성**
- PASS
- 근거: SKILL.md "3. vercel/satori 단독 사용" 섹션 + "5-1. SSG 사전 생성" 섹션
- 상세: `npm i satori @resvg/resvg-js` → satori(JSX→SVG) + Resvg(SVG→PNG) 파이프라인, `scripts/build-og.ts` + `package.json prebuild` 패턴 완전한 코드 예시 포함. `display: grid` 미지원 anti-pattern(섹션 3, 섹션 9) 명시됨. 모든 컨테이너 `display: 'flex'` 원칙 명시.

**Q3. OG 이미지 디버깅: 카카오톡/X에서 미리보기 안 뜨는 흔한 원인 + 강제 갱신**
- PASS
- 근거: SKILL.md "9. 흔한 실수 패턴" 섹션 + "6. 캐시 전략" 섹션 + "10. 검증 도구" 섹션
- 상세: 상대 URL 사용, 비율 오류, 폰트 미임베드, 파일 크기 초과, 같은 URL로 이미지만 교체(크롤러 캐시 문제) — 모두 섹션 9에 증상·해결 쌍으로 명시. 강제 갱신: Facebook Sharing Debugger "Scrape Again", X Card Validator deprecated → 새 트윗, 카카오: 카카오 디벨로퍼스 캐시 초기화(섹션 6, 10) 명시됨.

### 발견된 gap

- Edge runtime에서 폰트를 fetch로 가져오는 패턴(`fetch(new URL('./font.ttf', import.meta.url))`)은 섹션 2 런타임 선택 표에 언급되어 있으나 코드 예시가 없음 → 선택 보강 항목 (차단 요인 아님)

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (라이브러리 사용법 스킬 — content test PASS = APPROVED 가능)
- 최종 상태: APPROVED

---

### [2026-09-28] 재검증(2차) — CVE-2026-94545 (next/og ImageResponse RCE) ADD

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 4개를 1차 소스(Vercel/Next.js 공식 보안 공지, GitHub Security Advisory, npm registry)와 대조, 보강 검토

**클레임 대조 결과**:
1. Next.js `next/og` `ImageResponse`(Node.js 런타임)에 Critical RCE가 존재했는가 → **VERIFIED(ADD)** — CVE-2026-94545 / GHSA-vcvr-r3jv-pc5j, CVSS 4.0 9.5 Critical, 2026-09-22 Vercel 공식 out-of-band 패치 (https://nextjs.org/blog/nextjs-security-update-september-22-2026)
2. 영향 범위가 Next.js `>=16.2.0 <16.3.6`이고 Edge `ImageResponse`는 영향 없는가 → **VERIFIED**, Vercel 공식 블로그 원문 확인
3. 근본 원인이 satori의 SVG escaping 결함이며 satori 자체(Next.js 무관 단독 사용)도 취약한가 → **VERIFIED(ADD)** — 업스트림 GHSA-wx4j-mvgx-mqwp, satori `>=0.0.27 <0.33.5` 영향, 0.33.5에서 패치. 이 스킬 섹션 3(satori 단독 사용)도 동일하게 영향받는 실사용 위험 사실
4. 현재 satori·@vercel/og·next 최신 버전이 각각 패치 버전 이상인가 → **VERIFIED** — npm registry 직접 조회: satori 0.33.5(latest), @vercel/og 1.0.3(latest), next 16.3.6(latest)

**보강(ADD)·축소**: 신규 "0. 보안 필수 확인 — CVE-2026-94545" 섹션 신설(영향 범위·원인·조치 3단계, Edge 미영향 명시). 헤더 소스 목록에 Next.js 공식 보안 공지 + satori GHSA 링크 추가, 대상 버전을 "16.3.6 이상 필수"/"0.33.5 이상 필수"로 갱신. references/REFERENCE.md 흔한 실수 패턴 표에 해당 행 추가. 축소 없음.

**실전 질문 재검증**:
- Q1. "블로그 포스트 제목을 OG 이미지에 넣는 Next.js 프로젝트인데 지금 배포된 next 버전이 16.2.4다. 위험한가?" → SKILL.md "0절" 근거로 PASS (16.2.0~16.3.5 범위에 해당, Node.js ImageResponse + 사용자 유래 텍스트 사용 시 CVE-2026-94545 대상이므로 16.3.6 이상 즉시 업그레이드 필요)
- Q2. "Next.js 없이 satori만 써서 빌드 타임에 OG 이미지를 만드는데도 이 취약점이 해당되나?" → SKILL.md "0절" 두 번째 불릿 근거로 PASS (satori 단독도 `<0.33.5`면 동일 취약, Next.js 경유 여부와 무관)

**재검증 최종 판정**: status **PENDING_TEST 전환** (신규 보안 ADD 발생 — 메인의 skill-tester 재테스트 대상)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (10/10 클레임 VERIFIED, 2026-09-28 재검증 4건 추가 VERIFIED) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-06-02) + **2026-09-28 재테스트 2/2 PASS** — CVE-2026-94545 0절(satori 단독 medium/Next.js Critical 구분) 정정 반영 확인 |
| **최종 판정** | **APPROVED** (2026-09-28 재테스트에서 CVE-2026-94545 ADD 반영분 content test 2/2 PASS로 복귀) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 (2026-06-02 완료, 3/3 PASS / **2026-09-28 CVE-2026-94545 ADD분 재테스트 완료, 2/2 PASS**)

선택 보강 사항 (차단 요인 아님):
- Next.js 17+에서 `ImageResponse` API 변경 시 재검증
- satori 1.0+ 출시 시 CSS 지원 확대 여부 재확인
- 카카오톡 OG 디버거 URL 변경 추적 (Naver/Daum 등 한국 SNS 검증 도구)
- Edge Runtime 비용/지연 트레이드오프 정량 데이터
- Edge runtime 폰트 fetch 코드 예시 보강 (`fetch(new URL('./font.ttf', import.meta.url))`) — 선택 보강, 차단 요인 아님
- (2026-09-28 재테스트 발견) 섹션 4 "옵션 C(`loadAdditionalAsset`)는 satori 단독 사용 전용, next/og에는 적용 불가" 안내를 섹션 초반에 앞당겨 배치 — 선택 보강, 차단 요인 아님
- (2026-09-28 재테스트 발견) 동적 라우트+한국어 폰트 결합 단일 완성 예제 부재 — 선택 보강, 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-02 | v1 | 최초 작성. 11섹션 580줄. Next.js ImageResponse + satori + CJK 폰트 임베드 + 빌드/런타임 생성 + 캐시 전략 + 외부 서비스 + 실수 패턴 + 검증 도구 | skill-creator |
| 2026-06-02 | v1 | 2단계 실사용 테스트 수행 (Q1 Next.js 동적 OG+한국어 폰트 / Q2 Vite SSG 사전 생성 / Q3 미리보기 디버깅+강제 갱신) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-08-26 | v1.1 | freshness 재검증(85일 경과) — 1200×630·X 1200×628·Next.js 16 Promise params VERIFIED. satori 0.27.0→**0.33.4**·@vercel/og **1.0.2**(npm dist-tags 직접 조회, 감사 에이전트가 보고한 0.29.0은 오기라 registry 값으로 정정). 카카오 규격은 공식 문서 부재로 1.91:1 유지 | freshness-auditor + orchestrator |
| 2026-09-28 | v1.2 | 재검증(2차, 33일 경과) — **보안 ADD**: 2026-09-22 발표된 CVE-2026-94545(GHSA-vcvr-r3jv-pc5j, next/og ImageResponse RCE, CVSS 9.5 Critical)와 업스트림 satori 결함(GHSA-wx4j-mvgx-mqwp, `<0.33.5`) 확인. 신규 "0. 보안 필수 확인" 섹션 신설, REFERENCE.md 흔한 실수 표에 행 추가. next 16.3.6·satori 0.33.5·@vercel/og 1.0.3 최신 버전 갱신. status APPROVED → PENDING_TEST 전환 | orchestrator (2차 재검증 배치) |
| 2026-09-28 | v1.2 | satori 단독 영향 문구 보정("satori 어드바이저리 자체 심각도는 medium, Critical은 Next.js Node `ImageResponse` 경로 기준") 반영 후 2단계 실사용 테스트 재테스트 수행 (Q1 satori 단독 0.33.2 사용 시 CVE 심각도 판단 / Q2 동적 라우트 params+한국어 폰트) → 2/2 PASS, **PENDING_TEST → APPROVED 복귀** | skill-tester |
