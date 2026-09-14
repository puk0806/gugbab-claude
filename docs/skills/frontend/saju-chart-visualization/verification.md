---
skill: saju-chart-visualization
category: frontend
version: v1
date: 2026-09-10
status: APPROVED
---

# 검증 문서 — saju-chart-visualization

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `saju-chart-visualization` |
| 스킬 경로 | `.claude/skills/frontend/saju-chart-visualization/SKILL.md` |
| 검증 문서 경로 | `docs/skills/frontend/saju-chart-visualization/verification.md` |
| 검증일 | 2026-09-10 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 버전 기준 | Recharts 3.10.1 / visx 4.0.0 / React 19 / WCAG 2.2 |

---

## 1. 작업 목록 (Task List)

- [✅] 템플릿(`docs/skills/VERIFICATION_TEMPLATE.md`) Read 후 구조 적용
- [✅] 중복 스킬 존재 여부 확인 (`.claude/skills/**/saju*/SKILL.md` → 없음, 신규 생성)
- [✅] 참고 템플릿 스킬 Read (`frontend/dream-statistics-visualization/SKILL.md`) — 구조·라이브러리 선택 기준 승계
- [✅] 레포 내 기존 시각화 라이브러리 권장 실측 (`Grep: recharts|visx` → dream-statistics-visualization / architecture/frontend-domain-structure)
- [✅] 라이브러리 최신 안정 버전 확인 (Recharts, visx) — WebSearch + npm 레지스트리 API
- [✅] Recharts 3.x 파괴적 변경·접근성 기본값 확인 (공식 3.0 migration guide + 공식 API 문서)
- [✅] 접근성 기준 1차 소스 확인 (W3C WCAG 2.2 Understanding SC 1.4.1 / 1.4.11)
- [✅] 웹 표준 API 확인 (MDN `unicode-range` / CSS Scroll Snap / `light-dark()`)
- [✅] 도메인(명리) 1차 소스 확인 (위키백과 오방색 / 사주명리학 / 대운)
- [✅] 짝 스킬 존재 확인 (`frontend/font-optimization`, `frontend/wcag-2.2-checklist`, `frontend/design-token-scss`)
- [✅] 핵심 클레임 교차 검증 (2개 이상 독립 소스)
- [✅] SKILL.md 작성 (`user-invocable: false` 포함)
- [✅] 흔한 실수 패턴 18종 정리
- [✅] skill-tester 2단계 실사용 테스트 (2026-09-10 수행 — Q1~Q3 전부 PASS)

> 최초 작성 시 사용자 지시로 `creation-workflow.md` **1~4단계만** 수행하고 status는 `PENDING_TEST`로 유지했다.
> 2026-09-10 `skill-tester`가 단계 5(2단계 실사용 content test)를 수행해 Q1~Q3 전부 PASS했으며, 본 스킬은
> "실사용 필수 카테고리"(빌드 설정·워크플로우·마이그레이션)에 해당하지 않는 라이브러리 사용법·패턴 가이드이므로
> `verification-policy.md`에 따라 content test PASS만으로 `APPROVED`로 전환했다.
> README.md / docs/skills/README.md 갱신은 본 스킬 생성 작업 범위 밖으로 남아 있다(별도 확인 필요).

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확보 |
| 중복 확인 | Glob | `.claude/skills/**/saju*/SKILL.md` | 매칭 0건 → 신규 생성 확정 |
| 구조 참조 | Read | `frontend/dream-statistics-visualization/SKILL.md` | 소스 블록·범위표·주의 표기·짝 스킬 섹션 구조 승계 |
| 레포 정합 조사 | Grep | `recharts\|visx` in `.claude/skills` | 기존 권장 = Recharts(표준 차트) / visx(비표준 시각화) 확인 → 동일 기준 채택 |
| 레포 정합 조사 | Grep | `CJK\|unicode-range\|subset` in `frontend/font-optimization/SKILL.md` | 8·10·11절이 CJK 서브셋 원본 카탈로그임을 확인 → 중복 서술 대신 상호 참조 |
| 조사 | WebSearch | "recharts latest stable version npm 2026 React 19" | 3.10.1, React 16.8~19 peer |
| 조사 | WebSearch | "visx npm latest version @visx/scale 2026" | @visx/scale 4.0.0 |
| 조사 | WebFetch | `registry.npmjs.org/recharts/latest` | version 3.10.1, peerDeps 확인 (npmjs.com은 403이라 레지스트리 API로 우회) |
| 조사 | WebFetch | `registry.npmjs.org/@visx/scale/latest` | version 4.0.0 |
| 조사 | WebFetch | `github.com/airbnb/visx/releases` | v4.0.0 (2026-06-11), React 18/19 peer |
| 조사 | WebSearch | "Recharts 3.0 breaking changes migration guide" | 공식 Wiki 경로 확보 |
| 조사 | WebFetch | `github.com/recharts/recharts/wiki/3.0-migration-guide` | accessibilityLayer 기본 true, ResponsiveContainer ref 변경, activeIndex 제거, z-index=렌더순서 |
| 조사 | WebSearch | "recharts RadarChart PolarAngleAxis PolarRadiusAxis Radar API docs" | 공식 문서 호스트가 `recharts.github.io`임을 확인 |
| 조사 | WebFetch | `recharts.github.io/en-US/api/RadarChart/` | cx/cy 50%, outerRadius 80%, accessibilityLayer default true, context 대상 컴포넌트 목록 |
| 조사 | WebFetch | `recharts.github.io/en-US/api/Radar/` | dataKey·dot·isAnimationActive('auto'=SSR off + reduced-motion 존중) |
| 조사 | WebFetch | `recharts.github.io/en-US/guide/animations/` | isAnimationActive 기본값 'auto' 원문 인용 확보 |
| 조사 | WebFetch | `w3.org/WAI/WCAG22/Understanding/non-text-contrast.html` | 3:1, Level AA, 차트 graphical object 포함 + 예외 조항 |
| 조사 | WebFetch | `w3.org/WAI/WCAG22/Understanding/use-of-color.html` | Level A, 색 단독 구분 금지, 차트 예시 |
| 조사 | WebFetch | MDN `unicode-range` | 3가지 문법, 미사용 시 미다운로드, 2015-07 이후 광범위 지원 |
| 조사 | WebFetch | MDN CSS Scroll Snap Basic concepts | mandatory 접근성 경고 원문 확보 |
| 조사 | WebFetch | MDN `light-dark()` | color-scheme 전제, Baseline 2024 |
| 조사 | WebSearch | "오행 색상 … 오방색 정색" | 목청·화적·토황·금백·수흑 대응 |
| 조사 | WebFetch | 위키백과 오방색 | 오방정색 5색-오행-방위 표 확보 |
| 조사 | WebSearch | "사주 오행 개수 세기 … 득령 득지 득세 왕상휴수사" | 개수 단독 판정의 한계 서술 다수 |
| 조사 | WebSearch | "지장간 … 월령 왕상휴수사 억부용신 조후용신" | 지장간·월령·왕상휴수사 개념 확인 |
| 조사 | WebFetch | 위키백과 사주명리학 | 4주 8자·천간10/지지12·지장간(여기·중기·정기)·학파별 기준 차이·"과학적 근거 없음" 서술 |
| 조사 | WebFetch | 위키백과 대운(사주팔자) | 10년 주기, 대운수 개인차, 순행/역행 결정 방식 |
| 교차 검증 | WebSearch + WebFetch | 18개 클레임, 독립 소스 2개 이상 | VERIFIED 16 / DISPUTED 1 / UNVERIFIED 1 |
| 작성 | Write | SKILL.md | 11개 절 + 흔한 실수 18종 |
| 작성 | Write | verification.md | 본 문서 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Recharts 공식 API — RadarChart | https://recharts.github.io/en-US/api/RadarChart/ | ⭐⭐⭐ High | 2026-09-10 | 공식 문서 |
| Recharts 공식 API — Radar | https://recharts.github.io/en-US/api/Radar/ | ⭐⭐⭐ High | 2026-09-10 | 공식 문서 |
| Recharts 공식 Animation 가이드 | https://recharts.github.io/en-US/guide/animations/ | ⭐⭐⭐ High | 2026-09-10 | isAnimationActive 기본값 원문 |
| Recharts 3.0 migration guide (공식 Wiki) | https://github.com/recharts/recharts/wiki/3.0-migration-guide | ⭐⭐⭐ High | 2026-09-10 | 공식 저장소 Wiki |
| npm 레지스트리 — recharts | https://registry.npmjs.org/recharts/latest | ⭐⭐⭐ High | 2026-09-10 | 배포 메타데이터 원본 (npmjs.com 웹은 403) |
| npm 레지스트리 — @visx/scale | https://registry.npmjs.org/@visx/scale/latest | ⭐⭐⭐ High | 2026-09-10 | 배포 메타데이터 원본 |
| visx GitHub Releases | https://github.com/airbnb/visx/releases | ⭐⭐⭐ High | 2026-09-10 | 공식 릴리즈 노트 |
| W3C WCAG 2.2 Understanding SC 1.4.1 | https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html | ⭐⭐⭐ High | 2026-09-10 | 표준 1차 소스 |
| W3C WCAG 2.2 Understanding SC 1.4.11 | https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html | ⭐⭐⭐ High | 2026-09-10 | 표준 1차 소스 |
| MDN — `unicode-range` | https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range | ⭐⭐⭐ High | 2026-09-10 | 표준 레퍼런스 |
| MDN — CSS Scroll Snap Basic concepts | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap/Basic_concepts | ⭐⭐⭐ High | 2026-09-10 | mandatory 접근성 경고 원문 |
| MDN — `light-dark()` | https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark | ⭐⭐⭐ High | 2026-09-10 | Baseline 2024 |
| 위키백과 — 오방색 | https://ko.wikipedia.org/wiki/오방색 | ⭐⭐ Medium-High | 2026-09-10 | 《주례》·《서경》·《예기》 전거 명시. 공식 URL이 없는 전통 색채 체계의 공인 참조 |
| 위키백과 — 사주명리학 | https://ko.wikipedia.org/wiki/사주명리학 | ⭐⭐ Medium-High | 2026-09-10 | 구조·지장간·학파 차이·과학적 근거 부재 서술 |
| 위키백과 — 대운(사주팔자) | https://ko.wikipedia.org/wiki/대운_(사주팔자) | ⭐⭐ Medium-High | 2026-09-10 | 10년 주기·대운수·순행/역행 |
| 명리 실무 해설 블로그·강의자료 다수 | (검색 결과 — sajustudy.com, chocosd.com, brunch, lei.or.kr 교안 등) | ⭐ Low-Medium | 2026-09-10 | 개수 단독 판정의 한계·월령·왕상휴수사 통용 여부 확인용 보조. **수치·규칙을 SKILL.md에 직접 인용하지 않음** |
| CJK 폰트 서브셋 관련 블로그 다수 | (검색 결과 — font-converters.com 등) | ⭐ Low | 2026-09-10 | Google Fonts 슬라이싱 세부 수치는 **교차 검증 실패 → SKILL.md에서 배제** |

> 참고: 본 스킬의 도메인(명리)은 **공식 표준 문서·저자 공식 사이트가 존재하지 않는 전통 지식 영역**이다.
> 그래서 (1) 전거가 명시된 백과사전 항목을 1차로 삼고, (2) 실무 해설 자료는 *"그런 논점이 통용된다"*는 사실 확인에만 쓰고,
> (3) 특정 유파의 판정 규칙은 SKILL.md에 채택하지 않는 방식으로 처리했다.

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 핵심 클레임 교차 검증 결과

| # | 클레임 | 소스 A | 소스 B | 판정 |
|---|--------|--------|--------|------|
| C1 | Recharts 최신 안정 버전은 **3.10.1** | npm 레지스트리 API | WebSearch(npmjs 패키지 페이지 요약) | **VERIFIED** |
| C2 | Recharts peer는 React 16.8/17/18/**19** 지원 | npm 레지스트리 peerDependencies | WebSearch 요약 | **VERIFIED** |
| C3 | Recharts 3.x `accessibilityLayer` **기본값 true** (2.x는 false) | 공식 3.0 migration guide | 공식 RadarChart API 문서(Default: true) | **VERIFIED** |
| C4 | Recharts 3.x `isAnimationActive` **기본값 `'auto'`**, `'auto'`는 SSR 비활성 + `prefers-reduced-motion` 존중 | 공식 Animation 가이드(원문 인용) | 공식 Radar API 문서 | **VERIFIED** |
| C5 | `RadarChart`는 `PolarGrid`/`PolarAngleAxis`/`PolarRadiusAxis`/`Radar`/`Tooltip`에 context 제공. `cx`/`cy` 기본 "50%", `outerRadius` 기본 "80%" | 공식 RadarChart API 문서 | WebSearch(공식 문서 인덱싱 결과) | **VERIFIED** |
| C6 | Recharts 3.0 파괴적 변경: `ResponsiveContainer`의 `ref.current.current` 제거 / `activeIndex` prop 제거 / z-index=렌더 순서 / `CartesianGrid` 축 id 정렬 / 다중 Y축 `yAxisId` 알파벳 순 | 공식 3.0 migration guide | WebSearch 요약(newreleases v3.0.0, shadcn 업그레이드 글) | **VERIFIED** |
| C7 | visx 최신은 **4.0.0**, React 18/19 peer | GitHub Releases (v4.0.0, 2026-06-11) | npm 레지스트리 `@visx/scale` 4.0.0 | **VERIFIED** |
| C8 | 오방정색: 목=청/동, 화=적/남, 토=황/중앙, 금=백/서, 수=흑/북 | 위키백과 오방색 | WebSearch 요약(다수 매체·자료 일치) | **VERIFIED** |
| C9 | 靑은 파랑~초록을 포괄 — 木을 초록으로 렌더하는 관행도 존재 | 위키백과 오방색(청=파랑으로 기술) | 실무 자료(木=초록 렌더 관행) | **DISPUTED** → SKILL.md 5-1에 `> 주의:`로 명시하고, *둘 중 하나를 일관 적용 + 글자 라벨 병기*로 처리 |
| C10 | WCAG 2.2 SC 1.4.11 비텍스트 대비 **3:1, Level AA**, 차트의 선·색 면은 graphical object에 해당 | W3C Understanding 1.4.11 | (동일 문서 내 예외 조항 교차 확인) | **VERIFIED** |
| C11 | WCAG 2.2 SC 1.4.1 Use of Color는 **Level A**, 색 단독 구분 금지, 차트에 텍스트·패턴 병기 권장 | W3C Understanding 1.4.1 | WCAG 2.2 목록(레벨 표기) | **VERIFIED** |
| C12 | `unicode-range` — 선언 범위 문자가 페이지에 없으면 폰트를 다운로드하지 않음. 2015-07부터 광범위 지원 | MDN | 레포 기존 스킬 `frontend/font-optimization` 10절(동일 서술) | **VERIFIED** |
| C13 | `scroll-snap-type: * mandatory`는 자식 콘텐츠가 부모를 넘칠 때 **사용 금지**(접근성) | MDN Basic concepts(원문 경고) | MDN scroll-snap-type 속성 페이지 서술 | **VERIFIED** |
| C14 | `light-dark()`는 `color-scheme` 설정이 전제이며 **Baseline 2024** | MDN | (MDN 브라우저 호환성 표) | **VERIFIED** |
| C15 | 사주 = 네 기둥·여덟 글자, 천간 10 / 지지 12, 지지마다 지장간 2~3개(여기·중기·정기) | 위키백과 사주명리학 | 명리 실무 해설 자료 | **VERIFIED** |
| C16 | 대운은 **10년 주기**, 시작 나이(대운수)는 개인차, 순행/역행은 연간 음양 + 성별로 결정 | 위키백과 대운(사주팔자) | WebSearch 요약(복수 해설 자료 일치) | **VERIFIED** |
| C17 | 표면 8자 오행 개수만으로 강약을 단정하는 것은 지장간·월령(왕상휴수사)·득령/득지/득세를 누락한다 — 그리고 **강약 판정법 자체가 학파별로 갈린다** | 위키백과 사주명리학(지장간·학파별 기준 차이·과학적 근거 부재) | 명리 실무 해설·강의 자료 다수 | **VERIFIED**(논점 존재 사실) — 단 *어느 판정법이 옳은지*는 SKILL.md에서 채택하지 않음 |
| C18 | Google Fonts의 CJK 슬라이싱 세부 수치(조각 100+개, 조각당 100~200자 등) | 저신뢰 블로그 다수 | 공식 문서 확인 실패 | **UNVERIFIED** → SKILL.md 8-3에 `> 주의: 교차 검증 실패`로 명시하고 **수치에 의존하지 않는 서술로 대체**(고정 문자셋 서브셋) |

**DISPUTED / UNVERIFIED 반영 내역:**
- C9 → SKILL.md 5-1 하단 `> 주의:` 블록 + 5-4 "색만으로 구분하지 않기"로 우회 처리
- C18 → SKILL.md 8-3 하단 `> 주의:` 블록. 본문은 Google 슬라이싱 수치 대신 `--text` 고정 문자셋 서브셋만 권장

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Recharts 3.10.1 / visx 4.0.0 / React 19 / WCAG 2.2)
- [✅] deprecated·제거된 패턴을 권장하지 않음 (Recharts 2.x의 `activeIndex`·`ref.current.current` 사용 안 함, 오히려 실수 항목으로 경고)
- [✅] 코드 예시가 실행 가능한 형태임 (TSX·CSS·셸 모두 문법 완결)
- [✅] 검증 실패 항목을 본문에 남기지 않음 (C18은 주의 표기 + 대체 서술)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (`name`, `user-invocable: false`, `description` + `<example>` 4개)
- [✅] 소스 URL과 검증일(2026-09-10) 명시
- [✅] 핵심 개념 설명 포함 (1절 도메인 최소 사전, 1-1 오행 배속)
- [✅] 코드 예시 포함 (TS 타입 / TSX 컴포넌트 4종 / CSS 토큰·레이아웃 / 서브셋 스크립트 2종)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (0절 범위표, 3-2 화면별 결정, 6-1 레이더 vs 바 선택 기준)
- [✅] 흔한 실수 패턴 포함 (10절 18종)
- [✅] 짝 스킬 상호 참조 명시 (font-optimization / dream-statistics-visualization / wcag-2.2-checklist / design-token-scss)
- [✅] 부정확 가능성 항목에 `> 주의:` 표기 (1-1 본기 단순화 / 2절 학파 차이 / 4-2 표기 순서 / 5-3 hex 미확정 / 8-3 슬라이싱 수치 / 3-3 3.x 파괴적 변경)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (복붙 가능한 컴포넌트·CSS·빌드 스크립트)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 — 특정 로컬 프로젝트에 종속되지 않음 (레포 내 *스킬* 참조만 존재)
- [✅] 레포 기존 스킬과 라이브러리 권장이 정합 (dream-statistics-visualization의 Recharts/visx 분담 기준 승계)
- [✅] 도메인 리스크(운세 단정) 가드가 별도 절(2절)로 분리되어 재사용 가능

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-10, frontend-developer 3건)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (Q1~Q3 전부 근거 섹션 명시하며 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (해당 없음 — 3/3 PASS, 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-10
**수행자**: skill-tester → frontend-developer (프론트엔드 도메인 특화 에이전트, general-purpose 대체 아님)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 사주 원국 8글자를 모바일에서 div 그리드로 배치해도 되는가 + 출생 시각 미상 처리**
- ✅ PASS
- 근거: SKILL.md "4. 원국 표" 4-1(데이터 모델)·4-2(시맨틱 `<table>`)·4-4(모바일 레이아웃), 10절 실수 #1·#5·#6
- 상세: div 그리드 대신 `<table>` + `scope`/`<caption>` 필요성을 정확히 인용. `hourUnknown` 필드·빈 칸 렌더링·분모(`total`) 계산까지 근거와 함께 정확히 답변. 사소한 gap(시주 미상 시 4열 유지 여부 미명시)은 SKILL.md 보강 권장 사항으로만 기록, PASS 판정에는 영향 없음.

**Q2. 오행 개수 0인데 레이더 차트 그대로 배포해도 되는가 + 축 스케일 설정**
- ✅ PASS
- 근거: SKILL.md "6. 오행 분포 차트" 6-1(선택 기준 표)·6-3(레이더 가드 4종, `hasZero` 폴백 코드), 10절 실수 #3·#4
- 상세: "0값이 있으면 배포 금지, 바 차트로 폴백해야 한다"고 정확히 답하고 `hasZero` 폴백 코드를 근거로 제시. `domain={[0, total]}` 고정 및 `total` 하드코딩 금지(6-2, 10절 #5)까지 정확히 연결. anti-pattern(자동 스케일 방치) 회피 확인.

**Q3. 오방정색 그대로(금=#FFFFFF, 수=#000000) 사용 가능 여부**
- ✅ PASS
- 근거: SKILL.md "5. 오행 색상 시스템" 5-2(전통색이 깨지는 지점)·5-3(fg/surface 토큰 분리, `light-dark()` 코드), 10절 실수 #7·#8
- 상세: "라이트에서 금이, 다크에서 수가 안 보인다"는 정확한 원인 지적 + 색상 계열 재매핑·fg/surface 대비 기준(4.5:1 / 3:1) 분리까지 근거와 함께 답변. SKILL.md 자체의 "확정값 아님" 주의 표기도 놓치지 않고 인용. anti-pattern(hex 그대로 채택) 회피 확인.

### 발견된 gap (SKILL.md 보강 권장, 차단 요인 아님)

- Q1: 4-1절 "시주 미상이면 3" 주석과 4-2절 렌더링 코드(`order` 배열 4개 kind 고정 순회) 사이의 정합성 — 시주 미상 시 4열 레이아웃을 유지한 채 빈 칸만 표시하는지 명시적 문장으로 재확인하면 더 명확해짐. 선택 보강 사항.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 카테고리 아님 (라이브러리 사용법 + 접근성 패턴 가이드 — content test PASS로 APPROVED 가능)
- 최종 상태: APPROVED

---

## 5-부록. 최초 작성 시 준비된 테스트 후보 (참고용 원안)

아래는 skill-creator가 최초 작성 시 후속 세션을 위해 준비해 둔 질문 후보 원문이다. 실제 수행된 Q1~Q3는 위 "실제 수행 테스트"를 기준으로 삼는다.

**권장 테스트 질문 (skill-tester가 사용할 후보):**

1. "사주 원국 8글자를 모바일에서 표시하려는데, div 그리드로 짜면 되나요?"
   → 기대: `<table>` + `scope`/`<caption>` 권장 + `hourUnknown` 처리 언급 (근거: SKILL.md 4-2, 4-1)
2. "오행 개수를 레이더 차트로 그렸는데 수(水)가 0이라 삼각형처럼 나옵니다. 괜찮나요?"
   → 기대: 0값 존재 시 바 차트 폴백 + `domain=[0,total]` 고정 + "결핍" 오독 가드 (근거: 6-1, 6-3)
3. "오행 색을 전통 오방색(#FFFFFF 금, #000000 수) 그대로 쓰면 되나요?"
   → 기대: 백/흑은 배경과 충돌 → 색상 계열 재매핑, `fg`/`surface` 토큰 분리, 1.4.11 3:1 / 1.4.3 4.5:1 (근거: 5-2, 5-3)
4. "대운 타임라인 가로 스크롤에 `scroll-snap-type: x mandatory`를 쓰려는데요?"
   → 기대: MDN 경고 근거로 `proximity` 권장 (근거: 7-3, 10절 #9)
5. "천간·지지 한자 때문에 Noto CJK를 통째로 로드했더니 LCP가 무너집니다."
   → 기대: 30여 자 고정 문자셋 `--text` 서브셋 + `unicode-range: U+4E00-9FFF` 분리 (근거: 8-1~8-3)

**검증할 anti-pattern 회피:**
- 오행 개수를 "강하다/약하다/좋다"로 단정하지 않는가 (2절)
- 미래 대운을 길흉 색으로 칠하라고 답하지 않는가 (10절 #16)
- Recharts 2.x API(`activeIndex` 등)를 제시하지 않는가 (10절 #17)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (교차 검증 18건: VERIFIED 16 / DISPUTED 1 반영 / UNVERIFIED 1 배제) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 레포 내 정합성 (라이브러리 권장·짝 스킬) | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-09-10, skill-tester → frontend-developer) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] `skill-tester` 2단계 실사용 테스트 수행 후 섹션 5·6 갱신 (2026-09-10 완료, 3/3 PASS → APPROVED 전환)
- [❌] 5-3 색 토큰 hex 값의 실제 대비비 측정 — 선택 보강. 제품 배경 토큰이 정해진 뒤 자동 대비 검사(CI)로 확정해야 하며, 그 전까지는 SKILL.md 자체가 "출발점 예시"로 명시하고 있어 차단 요인 아님
- [❌] Google Fonts CJK 슬라이싱 전략의 공식 근거 확보 (C18 UNVERIFIED) — 선택 보강. 현재 서술(수치 미의존)로도 스킬 사용에 지장 없음, 확보 시에만 8절에 추가
- [❌] 십성(十星)·신살(神煞) 표기가 제품에 추가되면 8-1 고정 문자셋 목록 확장 필요 — 선택 보강(현재 기능 범위 밖, 확장 시점에만 필요)
- [❌] 12운성 원반 등 `visx` 기반 비표준 도형은 개요만 언급 — 선택 보강. 실제 구현 착수 시 별도 절 또는 별도 스킬로 분리 검토
- [❌] README.md / docs/skills/README.md 반영 — 차단 요인. 본 스킬 생성 작업에서 사용자 지시로 의도적 미수행이었으므로 별도로 반드시 처리 필요

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-09-10 | v1 | 최초 작성 — 원국 표·오행 분포 차트·대운 타임라인·오방정색 접근성 토큰·CJK 고정 문자셋 서브셋·다크모드. 교차 검증 18건 | skill-creator |
| 2026-09-10 | v1 | 2단계 실사용 테스트 수행 (Q1 원국 표 div vs table + hourUnknown / Q2 레이더 0값 폴백 + 축 도메인 / Q3 오방정색 접근성 재매핑) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
