---
skill: font-optimization
category: frontend
version: v1
date: 2026-06-03
status: APPROVED
---

# font-optimization 검증 기록

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `font-optimization` |
| 스킬 경로 | `.claude/skills/frontend/font-optimization/SKILL.md` |
| 검증일 | 2026-06-03 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

스킬 작성 의도: core-web-vitals-optimization·og-image-generation·seo-vite-spa에 분산되어 있던 폰트 관련 토픽을 단독 카탈로그로 통합. 한국어(CJK) 환경 특수성(서브셋·시스템 폴백·Pretendard/Noto Sans KR 비교) 집중.

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (web.dev, MDN, Next.js docs)
- [✅] 공식 GitHub 2순위 소스 확인 (notofonts/noto-cjk, orioncactus/pretendard)
- [✅] 최신 버전 기준 내용 확인 (2026-06-03 / Next.js 16.x, 모든 evergreen 브라우저)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (font-display, size-adjust, preload, unicode-range, next/font, system stack)
- [✅] 코드 예시 작성 (@font-face size-adjust, next/font local, subset-font 빌드, unicode-range 분할)
- [✅] 흔한 실수 패턴 정리 (10개)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "font-display swap fallback optional block CLS" | web.dev·MDN·DebugBear 등 10개 결과, 4값 비교 확보 |
| 조사 | WebSearch | "size-adjust ascent-override descent-override @font-face" | web.dev 공식 가이드, MDN 디스크립터 정의 확보 |
| 조사 | WebSearch | "Pretendard Variable OFL license" | OFL 1.1 라이선스 확인, 길형진 제작 |
| 조사 | WebSearch | "Noto Sans KR web font subset CJK" | Noto CJK 공식 GitHub, Adobe Fonts, 서브셋 도구 확인 |
| 조사 | WebSearch | "next/font local Google subsets Next.js 15" | Next.js 공식 문서 확인 |
| 조사 | WebSearch | "preload font woff2 crossorigin web.dev" | crossorigin 필수성 확인, preload 가이드 |
| 조사 | WebSearch | "unicode-range Google Fonts multiple @font-face" | Google Fonts 다중 @font-face 패턴 확인 |
| 조사 | WebSearch | "Google Fonts GDPR Munich court 2022" | LG München I 2022-01 판결, EUR 100 벌금 확인 |
| 조사 | WebSearch | "variable font woff2 weight axis browser support 2026" | Chrome 66+, Firefox 62+, Safari 11+ 지원 확인 |
| 조사 | WebSearch | "subset-font npm pyftsubset fonttools" | subset-font·pyftsubset·glyphhanger 도구 확인 |
| 조사 | WebSearch | "Apple SD Gothic Neo Malgun Gothic system font stack" | 시스템 폰트 스택 패턴 확보 |
| 조사 | WebFetch | https://web.dev/articles/font-best-practices | 공식 베스트 프랙티스 본문 확인 |
| 조사 | WebFetch | https://nextjs.org/docs/app/getting-started/fonts | Next.js Font Optimization 공식 문서 확인 (v16.2.7, 2026-06-01 갱신) |
| 조사 | WebFetch | https://developer.mozilla.org/.../font-display | font-display 5값 동작·권장 케이스 확인 |
| 조사 | WebFetch | https://web.dev/articles/css-size-adjust | size-adjust 4 디스크립터 의미·메트릭 매칭 패턴 확인 |
| 교차 검증 | WebSearch | 12개 클레임 × 2개 이상 독립 소스 | VERIFIED 12 / DISPUTED 0 / UNVERIFIED 0 |

> 모든 클레임은 공식 문서·MDN·web.dev에서 직접 확인.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| web.dev — Best practices for fonts | https://web.dev/articles/font-best-practices | ⭐⭐⭐ High | 2026-06-03 | Google 공식 |
| web.dev — CSS size-adjust | https://web.dev/articles/css-size-adjust | ⭐⭐⭐ High | 2026-06-03 | Google 공식 |
| web.dev — Optimize web fonts | https://web.dev/learn/performance/optimize-web-fonts | ⭐⭐⭐ High | 2026-06-03 | Google 공식 학습 자료 |
| web.dev — Preload web fonts codelab | https://web.dev/articles/codelab-preload-web-fonts | ⭐⭐⭐ High | 2026-06-03 | Google 공식 |
| MDN — `@font-face/font-display` | https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display | ⭐⭐⭐ High | 2026-06-03 | Mozilla 공식 |
| MDN — Variable fonts guide | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/Variable_fonts_guide | ⭐⭐⭐ High | 2026-06-03 | Mozilla 공식 |
| MDN — ascent-override / descent-override | https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/ascent-override | ⭐⭐⭐ High | 2026-06-03 | Mozilla 공식 |
| MDN — rel="preload" | https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload | ⭐⭐⭐ High | 2026-06-03 | Mozilla 공식 |
| Next.js — Font Optimization (App) | https://nextjs.org/docs/app/getting-started/fonts | ⭐⭐⭐ High | 2026-06-03 | Vercel 공식 (v16.2.7) |
| Next.js — Font Component API | https://nextjs.org/docs/pages/api-reference/components/font | ⭐⭐⭐ High | 2026-06-03 | Vercel 공식 |
| Pretendard GitHub | https://github.com/orioncactus/pretendard | ⭐⭐⭐ High | 2026-06-03 | 저자 공식 레포 (OFL 1.1) |
| Noto CJK GitHub | https://github.com/notofonts/noto-cjk | ⭐⭐⭐ High | 2026-06-03 | Google·Adobe 공식 |
| Google Fonts — Noto Sans Korean | https://fonts.google.com/noto/specimen/Noto+Sans+KR | ⭐⭐⭐ High | 2026-06-03 | Google 공식 |
| fontTools — subset 문서 | https://fonttools.readthedocs.io/en/latest/subset/ | ⭐⭐⭐ High | 2026-06-03 | fontTools 공식 |
| caniuse — font-unicode-range | https://caniuse.com/font-unicode-range | ⭐⭐ Medium-High | 2026-06-03 | 브라우저 지원 통계 |
| The Register — Google Fonts GDPR 판결 보도 | https://www.theregister.com/2022/01/31/website_fine_google_fonts_gdpr/ | ⭐⭐ Medium | 2026-06-03 | 판결 보도 |
| Adobe Fonts — Noto Sans CJK KR | https://fonts.adobe.com/fonts/noto-sans-cjk-kr | ⭐⭐ Medium-High | 2026-06-03 | Adobe 공식 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Next.js 13+, 브라우저 지원 버전)
- [✅] deprecated된 패턴을 권장하지 않음 (WOFF1·TTF 폴백 비권장으로 명시)
- [✅] 코드 예시가 실행 가능한 형태임

### 핵심 클레임 교차 검증

| 클레임 | 1차 소스 | 2차 소스 | 판정 |
|--------|----------|----------|------|
| `font-display: swap`이 본문 안전한 기본값 | web.dev/font-best-practices | MDN @font-face/font-display | VERIFIED |
| `font-display: optional`은 ~100ms 내 미도착 시 폰트 미적용 | MDN font-display | web.dev/learn/performance | VERIFIED |
| `size-adjust`/`ascent-override` 등 Chromium 87+, Firefox 89+ 지원 | web.dev/css-size-adjust | MDN ascent-override | VERIFIED |
| `<link rel="preload">`에 `crossorigin` 누락 시 이중 다운로드/무시 | web.dev/codelab-preload | MDN rel="preload" | VERIFIED |
| Variable font: Chrome 66+, Firefox 62+, Safari 11+ | MDN Variable fonts guide | web.dev/articles/variable-fonts | VERIFIED |
| WOFF2는 WOFF1 대비 약 30% 추가 압축 | web.dev/font-best-practices | DebugBear 가이드 | VERIFIED |
| Pretendard는 SIL OFL 1.1 라이선스 | github.com/orioncactus/pretendard | noonnu 폰트 페이지 | VERIFIED |
| Noto Sans CJK KR은 SIL OFL 라이선스 + Google·Adobe 공동 | github.com/notofonts/noto-cjk | fonts.adobe.com | VERIFIED |
| 2022-01 LG München I 판결: Google Fonts CDN 임베드 GDPR 위반 | theregister 보도 | thehackernews 보도 + decoded.legal 분석 | VERIFIED |
| `next/font/google`은 빌드 타임 자동 셀프 호스팅 | nextjs.org/docs/app/getting-started/fonts (v16.2.7) | nextjs.org/docs/pages/api-reference/components/font | VERIFIED |
| `unicode-range`로 다중 @font-face 분할 시 사용된 범위만 다운로드 | MDN unicode-range | Google Fonts CSS 동작 분석 | VERIFIED |
| `pyftsubset`이 fonttools에 포함된 표준 서브셋 도구 | fonttools.readthedocs.io | markoskon.com/creating-font-subsets | VERIFIED |

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (상단 10개 URL, 2026-06-03)
- [✅] 핵심 개념 설명 포함 (FOIT vs FOUT, font-display 4값, size-adjust, variable font)
- [✅] 코드 예시 포함 (@font-face size-adjust, next/font local, subset-font, unicode-range, pyftsubset, glyphhanger)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (font-display 4값 권장 케이스, system stack 적용/비적용)
- [✅] 흔한 실수 패턴 포함 (10개)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (코드 6종, 비교 표 5종)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (Pretendard·Noto Sans KR 실제 사례)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 없음, 로컬 경로·프로젝트명 미포함)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-03)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-06-03)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — gap 없음, 보완 불필요

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-03
**수행자**: skill-tester → frontend-developer (general-purpose 대체 — 세션 registry에 general-purpose 없음)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Pretendard Variable을 next/font/local로 사용하는 방법 + variable font weight 범위 지정**
- PASS
- 근거: SKILL.md "13. `next/font` 패턴 (Next.js 13+)" 섹션 — Local Font 예시 코드, `weight: "45 920"`, `variable: "--font-pretendard"`, `preload: true`, `adjustFontFallback` 옵션 전부 포함. 섹션 16 "권장 기본 세팅"에서 완전한 통합 예시 제공.
- 상세: `import localFont from "next/font/local"` 패턴, weight 범위 `"45 920"`, CSS 변수 노출 → Tailwind 연동, `adjustFontFallback: "Arial"`로 CLS 자동 보정까지 근거 완비.

**Q2. FOUT/FOIT 트레이드오프 — `font-display: swap` vs `optional` 선택 기준 + CLS 보정 기법**
- PASS
- 근거: SKILL.md "1. FOIT vs FOUT" 섹션, "2. `font-display` 값 4종 비교" 섹션, "3. `size-adjust` + 메트릭 오버라이드" 섹션, "15. 흔한 실수 패턴" 섹션
- 상세: swap(본문·헤딩 기본값, swap period 무한) vs optional(CLS 0 추구, ~100ms 내 미도착 시 미적용) 트레이드오프 명확. anti-pattern — "`optional` 사용했는데 fallback 메트릭 매칭 안 함 → 폰트 영원히 미적용" — SKILL.md가 명시적으로 경고하고 `size-adjust`/`ascent-override` 패턴으로 대응 방법 제시.

**Q3. Google Fonts CDN 직접 임베드 문제 + Next.js 권장 대안**
- PASS
- 근거: SKILL.md "12. Google Fonts CDN vs Self-host" 섹션, "15. 흔한 실수 패턴" 섹션
- 상세: 2022-01 LG München I 판결(GDPR 위반, IP 전달 이유) 근거 명시. CDN 직접 임베드 시 DNS·TLS 추가 RTT 성능 문제 비교표 포함. Next.js 대안으로 `next/font/google`(빌드 시 자동 셀프 호스팅 — runtime에 Google 요청 0건) 명확히 제시.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md에서 근거 섹션이 명확히 존재하고, anti-pattern 회피 여부도 확인됨.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (라이브러리·CSS 패턴 카탈로그형 — content test PASS = APPROVED 가능)
- 최종 상태: APPROVED

---

### 참고: 최초 작성 시 테스트 케이스 템플릿 (이력 보존)

> 본 스킬은 *content test로 검증 가능한* 카테고리(라이브러리·CSS 패턴 사용법 + 카탈로그형)에 해당하나, skill-tester 호출은 별도 세션에서 수행한다. 본 세션에서는 *작성 후 즉시 호출 금지* 지시에 따라 미수행.

*위 템플릿은 skill-creator 작성 시 예약 텍스트였으며, 2026-06-03 skill-tester 수행으로 위 실제 기록으로 대체됨.*

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (12개 클레임 VERIFIED, DISPUTED 0) |
| 구조 완전성 | ✅ (frontmatter·소스·코드·실수 패턴 모두 포함) |
| 실용성 | ✅ (코드 6종, 비교 표 5종, 한국어 케이스 집중) |
| 에이전트 활용 테스트 | ✅ (2026-06-03, frontend-developer로 3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester 실전 질문 답변으로 content test 수행 후 APPROVED 전환 (2026-06-03 완료, 3/3 PASS)
- [❌] 한국어 fallback metric 측정 실수치(현재 size-adjust 99.5% 등은 예시값) 보강 가능성 검토 — Fontaine/Capsize 자동 계산값 첨부 여부 (선택 보강 — 차단 요인 아님, 예시값임을 SKILL.md에 이미 명시)
- [❌] Variable font의 italic 축(`slnt`/`ital`) 사용 예시 보강 가능성 검토 (선택 보강 — 차단 요인 아님, 기본 weight 축은 이미 완비)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-03 | v1 | 최초 작성. core-web-vitals/og-image/seo-vite-spa에 분산된 폰트 토픽 통합. CJK 특수성·next/font·size-adjust·unicode-range 카탈로그화 | skill-creator |
| 2026-06-03 | v1 | 2단계 실사용 테스트 수행 (Q1 next/font local + variable font / Q2 font-display swap vs optional 선택 기준 / Q3 Google Fonts CDN GDPR + Next.js 대안) → 3/3 PASS, APPROVED 전환 | skill-tester |
