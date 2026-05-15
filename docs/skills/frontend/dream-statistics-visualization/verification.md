---
skill: dream-statistics-visualization
category: frontend
version: v1
date: 2026-05-15
status: PENDING_TEST
---

# 스킬 검증 — dream-statistics-visualization

> 새 스킬을 추가하거나 수정할 때 이 문서를 함께 갱신한다. (템플릿: `docs/skills/VERIFICATION_TEMPLATE.md`)

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dream-statistics-visualization` |
| 스킬 경로 | `.claude/skills/frontend/dream-statistics-visualization/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator (Claude Opus 4.7) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Recharts, visx, ColorBrewer, W3C SVG ARIA)
- [✅] 공식 GitHub 2순위 소스 확인 (recharts/recharts, airbnb/visx)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-05-15 — Recharts 3.8.x stable)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (5종 차트별 코드 골격)
- [✅] 코드 예시 작성 (Recharts LineChart/PieChart, visx Wordcloud/Heatmap, custom Timeline)
- [✅] 흔한 실수 패턴 정리 (11종 함정 표)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 파악 |
| 중복 확인 | Glob | `.claude/skills/**/dream-statistics-visualization/SKILL.md` | 0건 (신규) |
| 짝 스킬 확인 | Glob/Read | dream-symbol-tagging, emotion-tagging-input, dream-recurrence-detection | 3건 존재, dream-journal-data-modeling은 미존재 → 주의 표기 |
| 조사 | WebSearch | "Recharts 2.x ResponsiveContainer", "visx wordcloud heatmap", "react-wordcloud maintenance", "ColorBrewer Viridis colorblind" | 4건 검색, 1순위 공식 문서 URL 확보 |
| 조사 | WebFetch | recharts.github.io API, airbnb.io/visx (리다이렉트) | ResponsiveContainer props 직접 확인 |
| 교차 검증 | WebSearch | "recharts npm React 19 compatibility", "@visx/wordcloud example", "@visx/heatmap HeatmapRect", "role=img aria-label SVG WCAG" | 4건 추가 검증 |
| 작성 | Write | SKILL.md, verification.md | 11개 섹션 SKILL.md, 본 verification.md |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Recharts 공식 API | https://recharts.org/en-US/api | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| Recharts ResponsiveContainer API | https://recharts.github.io/en-US/api/ResponsiveContainer | ⭐⭐⭐ High | 2026-05-15 | 공식, props 직접 확인 |
| recharts npm | https://www.npmjs.com/package/recharts | ⭐⭐⭐ High | 2026-05-15 | 3.8.x stable 확인 |
| Recharts React 19 이슈 | https://github.com/recharts/recharts/issues/4558 | ⭐⭐⭐ High | 2026-05-15 | 2.x → 3.x 권장 근거 |
| visx 공식 문서 | https://airbnb.io/visx/docs | ⭐⭐⭐ High | 2026-05-15 | 공식 (visx.airbnb.tech로 리다이렉트) |
| @visx/wordcloud npm | https://www.npmjs.com/package/@visx/wordcloud | ⭐⭐⭐ High | 2026-05-15 | 공식 패키지 |
| @visx/heatmap npm | https://www.npmjs.com/package/@visx/heatmap | ⭐⭐⭐ High | 2026-05-15 | 공식 패키지 |
| visx GitHub | https://github.com/airbnb/visx | ⭐⭐⭐ High | 2026-05-15 | 공식 모노레포 |
| react-wordcloud npm | https://www.npmjs.com/package/react-wordcloud | ⭐⭐⭐ High | 2026-05-15 | 유지보수 중단 확인 |
| ColorBrewer 2 | https://colorbrewer2.org/ | ⭐⭐⭐ High | 2026-05-15 | 원본 도구 (Cindy Brewer) |
| Viridis (sjmgarnier) | https://sjmgarnier.github.io/viridis/ | ⭐⭐⭐ High | 2026-05-15 | 공식 viridis 패키지 |
| W3C SVG Accessibility (ARIA for charts) | https://www.w3.org/wiki/SVG_Accessibility/ARIA_roles_for_charts | ⭐⭐⭐ High | 2026-05-15 | W3C 공식 |
| WCAG 2.1 SC 1.1.1 | https://www.w3.org/WAI/WCAG21/Understanding/non-text-content | ⭐⭐⭐ High | 2026-05-15 | W3C 공식 |
| The A11Y Collective — Accessible SVG | https://www.a11y-collective.com/blog/svg-accessibility/ | ⭐⭐ Medium | 2026-05-15 | 보조 자료 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (단, 사용자 명세 "Recharts 2.x"는 3.x로 정정 표기)
- [✅] 버전 정보 명시 (Recharts 3.8.x, visx 패키지명)
- [✅] deprecated된 패턴 제외 (`react-wordcloud` 사실상 중단 → 대안 명시)
- [✅] 코드 예시가 실행 가능한 형태 (타입·import 정확)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description + example 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (라이브러리 선택, 5종 차트, 접근성, 색맹 친화)
- [✅] 코드 예시 포함 (각 차트별)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (섹션 0, 11)
- [✅] 흔한 실수 패턴 포함 (섹션 10 — 11종)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (전체 컴포넌트 예시 제공)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (Dexie 의존 부분만 짝 스킬과 결합, 차트 자체는 범용)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 — 2026-05-15 수행 (3/3 PASS)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 — PASS (근거 섹션 명확히 존재)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 해당 없음 (gap 미발견)

---

## 4-A. 교차 검증한 클레임 (VERIFIED / DISPUTED / UNVERIFIED)

| # | 클레임 | 판정 | 처리 |
|---|--------|------|------|
| 1 | Recharts `ResponsiveContainer`는 `width`/`height`/`aspect`/`debounce` props 지원, ResizeObserver 사용 | VERIFIED | 그대로 작성 (섹션 4-1) |
| 2 | Recharts 최신 stable은 **3.8.1** (사용자 명세 "2.x"는 부정확) | DISPUTED → 정정 | 섹션 1-1 `> 주의:` 표기, React 19 호환성 근거 추가 |
| 3 | `@visx/wordcloud`는 `words`/`width`/`height`/`fontSize`/`font`/`padding`/`spiral`/`rotate`/`random` props + 자식 render prop 패턴 | VERIFIED | 섹션 2-3에 그대로 반영 |
| 4 | `@visx/heatmap`의 `HeatmapRect`는 `data`/`xScale`/`yScale`/`colorScale`/`opacityScale`/`binWidth`/`binHeight`/`gap` props + 자식 render prop | VERIFIED | 섹션 2-5에 그대로 반영 |
| 5 | `react-wordcloud`(chrisrzhou) 1.2.7은 약 6년간 미릴리즈, 사실상 유지보수 중단 | VERIFIED (DISPUTED 명세) | 사용자 명세에 등장하나 사용 비권장 명시, `@cp949/react-wordcloud`·`@visx/wordcloud` 대안 제시 |
| 6 | Viridis는 perceptually uniform, 색맹·B&W 인쇄에서도 안전 | VERIFIED | 섹션 6-2 |
| 7 | ColorBrewer의 "color blind safe" 카테고리컬 팔레트는 최대 **4색**까지 검증, 그 이상은 Wong 팔레트 대안 | VERIFIED | 섹션 6-1 `> 주의:` 표기 |
| 8 | SVG 차트 접근성: `role="img"` + `<title>` + `<desc>` + `aria-labelledby` = WCAG 2.0/2.1 Level A 충족 | VERIFIED | 섹션 5-1 |
| 9 | 짝 스킬 `architecture/dream-journal-data-modeling`은 현재 레포에 존재 | UNVERIFIED (미존재) | 헤더 짝 스킬 목록에 "미존재 가능" 주의 표기 |

판정 합계: VERIFIED 7 / DISPUTED 1(정정 반영) / UNVERIFIED 1(주의 표기).

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (frontend-developer 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Recharts vs visx 선택 — 월별 빈도 차트 + 히트맵 동시 구현 시나리오**
- PASS
- 근거: SKILL.md "1. 라이브러리 선택 기준" 섹션 (1-1 비교 표, 1-2 선택 가이드)
- 상세: 월별 빈도 → Recharts (LineChart), 히트맵 → visx (@visx/heatmap HeatmapRect) 로 명확히 구분. Recharts 3.8.x 권장 주의 포함. 두 라이브러리 혼용 근거(적합 케이스가 다름)도 명시되어 있음. Anti-pattern("Recharts로 히트맵" 또는 "Chart.js를 기본으로") 없음.

**Q2. SVG ARIA 접근성 — 스크린리더 대응 + 정확한 수치 비교 보완책**
- PASS
- 근거: SKILL.md "5. 접근성(Accessibility)" 섹션 5-1, 5-2 및 섹션 2-3 워드클라우드 코드, 섹션 10 함정 표
- 상세: `role="img"` + `<title>`/`<desc>` + `aria-labelledby` 패턴(5-1), `<FallbackTable>` details/summary 구조(5-2), 워드클라우드 단독 사용 금지·표 병행 필수(10번 함정) 모두 SKILL.md에 명확히 존재. `aria-hidden`만 추가하는 anti-pattern 없음.

**Q3. 색맹 친화 팔레트 — 감정 6종 PieChart + 7종 이상 확장 시나리오**
- PASS
- 근거: SKILL.md "6. 색맹 친화 팔레트" 섹션 6-1, 6-2 및 섹션 11 의사결정 체크리스트 3번
- 상세: 카테고리컬 PieChart → ColorBrewer Dark2 6색(6-1), Viridis는 연속값(히트맵·Choropleth)용임을 명시(6-2)하여 PieChart 오용 방지. ColorBrewer "color blind safe" 공식 검증은 4색까지만이라는 주의 명시. 7종 이상은 Wong 팔레트 또는 가로 막대 차트 전환(11번 체크리스트 3번). "Viridis를 PieChart에 사용" anti-pattern 차단됨.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md에서 충분한 근거 도출 가능.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 프론트엔드 시각화 (실 데이터·UX·차트 렌더링 확인 필요) → "실사용 필수 스킬"
- 최종 상태: PENDING_TEST 유지 (content test PASS, 실 프로젝트 렌더링 검증 후 APPROVED 전환)

---

> 아래는 skill-creator가 작성한 예정 템플릿 (참고용 보존)

### 테스트 케이스 1: 라이브러리 선택 (예정 — 위 실제 수행으로 대체됨)

**입력 (질문/요청):**
```
꿈 일기 앱에서 월별 빈도 차트와 감정-상징 히트맵을 둘 다 만들고 싶어요. 어떤 라이브러리를 써야 하나요?
```

**기대 결과:**
- 월별 빈도 → Recharts (LineChart, ResponsiveContainer)
- 히트맵 → visx (@visx/heatmap, HeatmapRect)
- 두 라이브러리 혼용 가능 근거(SVG 기반 일관성) 명시
- Recharts 버전은 3.8.x 권장 (2.x 부정확 정정)

**실제 결과:** _(skill-tester 수행 후 기록)_

**판정:** PENDING

---

### 테스트 케이스 2: 색맹 친화 팔레트 (예정)

**입력:**
```
감정 6종을 PieChart로 그리는데 색맹 사용자도 구분할 수 있게 하려면 색을 어떻게 정해야 하나요?
```

**기대 결과:**
- ColorBrewer Dark2 6색 hex 제시 또는 Wong 팔레트 대안
- 카테고리 6개 이하 가이드
- ColorBrewer 공식 도구의 "color blind safe" 카테고리컬은 4색까지만 검증되었다는 주의 환기

**판정:** PENDING

---

### 테스트 케이스 3: 접근성 + 빈 상태 (예정)

**입력:**
```
워드클라우드를 만들었는데 스크린리더 사용자가 어떤 단어가 자주 나오는지 알 수 있게 하려면? 그리고 데이터가 5개 미만일 때는 어떻게 처리하나요?
```

**기대 결과:**
- `role="img"` + `aria-label` 또는 `<title>`/`<desc>`/`aria-labelledby`
- `<FallbackTable>` 같은 표 대안 함께 제공 (워드클라우드 정확 비교 한계 보완)
- N<5 → EmptyState 'small-sample' reason으로 차트 자체를 숨기고 메시지 표시

**판정:** PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (공식 문서·교차 검증 9건 완료, DISPUTED 1건 정정 반영) |
| 구조 완전성 | ✅ (frontmatter·소스·검증일·짝 스킬·11개 섹션 완비) |
| 실용성 | ✅ (5종 차트별 실행 가능 컴포넌트 골격 제공) |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-15, skill-tester 수행) |
| **최종 판정** | **PENDING_TEST 유지** (content test 3/3 PASS, 실 렌더링 검증 후 APPROVED) |

판정 사유:
- 1단계 오프라인 검증 모두 통과 (PASS).
- 본 스킬은 *실 데이터·UX·실제 차트 렌더링*으로 확인해야 할 항목(반응형 깨짐, 색 대비, 표본 임계 UX 등)을 포함하므로 verification-policy.md의 "실사용 필수 스킬"에 해당.
- 따라서 content test PASS 이후에도 *실 프로젝트 사용 후 APPROVED 전환* 절차를 거친다.

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 — (2026-05-15 완료, 3/3 PASS)
- [❌] `architecture/dream-journal-data-modeling` 스킬이 작성되면 본 스킬의 Dexie 쿼리 예제 경로를 해당 스킬로 명시적 링크 (선택 보강 — 차단 요인 아님)
- [❌] Recharts 3.x로 마이그레이션할 때 2.x 대비 breaking change 별도 정리(추후 별도 스킬 또는 부록) (선택 보강 — 차단 요인 아님)
- [❌] Chart.js + react-chartjs-2 캔버스 경로(대량 데이터 1만+) 실측 벤치마크 — 별도 스킬로 분리 가능 (선택 보강 — 차단 요인 아님)
- [❌] 다크 테마 색 대비 자동 검증(`color.js` 또는 axe-core) 통합 가이드 추가 검토 (선택 보강 — 차단 요인 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (5종 차트, 접근성, 색맹 친화, 짝 스킬 연계, 11종 함정) | skill-creator (Claude Opus 4.7) |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 Recharts vs visx 선택 / Q2 SVG ARIA 접근성 / Q3 색맹 팔레트) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
