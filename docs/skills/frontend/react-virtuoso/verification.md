---
skill: react-virtuoso
category: frontend
version: v2
date: 2026-04-20
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | react-virtuoso |
| 스킬 경로 | .claude/skills/frontend/react-virtuoso/SKILL.md |
| 검증일 | 2026-04-20 |
| 검증자 | skill-creator (WebSearch/WebFetch 직접 조사) |
| 스킬 버전 | v2 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (virtuoso.dev)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/petyosi/react-virtuoso)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-04-20, react-virtuoso v4.18.5)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | https://virtuoso.dev/, https://github.com/petyosi/react-virtuoso, https://www.npmjs.com/package/react-virtuoso | 최신 버전 v4.18.5 확인, 5가지 컴포넌트(+GroupedTableVirtuoso), 신규 props(minOverscanItemCount·heightEstimates) 발견 |
| 조사 | WebFetch | https://github.com/petyosi/react-virtuoso/releases | 최근 5개 릴리즈 상세(4.18.5~4.17.0) 수집, React 19 useSyncExternalStore 호환성 수정 확인 |
| 조사 | WebFetch | https://github.com/petyosi/react-virtuoso/blob/master/packages/react-virtuoso/CHANGELOG.md | v4.15~4.18 신규 props 목록 수집(minOverscanItemCount·heightEstimates·scrollIntoViewOnChange) |
| 교차 검증 | WebSearch | "react-virtuoso 4.18 minOverscanItemCount heightEstimates API" | virtuoso.dev API Reference에서 VERIFIED |
| 교차 검증 | WebSearch | "react-window maintenance status 2025 deprecated abandoned" + Commits 조회 | react-window 유지보수 "중단" 클레임 DISPUTED — 실제 React 19 지원(2024-12) 및 v2 개발 진행 중 |
| 교차 검증 | WebSearch | "react-virtuoso bundle size gzip bundlephobia" | bundlephobia.com 접근 실패, 구체적 수치 미확인 → 기존 ~16KB 수치 제거 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| react-virtuoso 공식 홈페이지 | https://virtuoso.dev/react-virtuoso/ | ⭐⭐⭐ High | 2026-04-20 | 공식 문서 |
| react-virtuoso API Reference | https://virtuoso.dev/react-virtuoso/api-reference/virtuoso/ | ⭐⭐⭐ High | 2026-04-20 | 공식 API 레퍼런스 |
| react-virtuoso GitHub | https://github.com/petyosi/react-virtuoso | ⭐⭐⭐ High | 2026-04-20 | 공식 레포, 6.3k stars |
| GitHub Releases | https://github.com/petyosi/react-virtuoso/releases | ⭐⭐⭐ High | 2026-04-20 | 버전별 릴리즈 노트 |
| GitHub CHANGELOG | https://github.com/petyosi/react-virtuoso/blob/master/packages/react-virtuoso/CHANGELOG.md | ⭐⭐⭐ High | 2026-04-20 | 상세 변경 이력 |
| npm react-virtuoso | https://www.npmjs.com/package/react-virtuoso | ⭐⭐⭐ High | 2026-04-20 | 버전·배포 정보 |
| react-window GitHub Commits | https://github.com/bvaughn/react-window/commits | ⭐⭐⭐ High | 2026-04-20 | 유지보수 상태 교차 검증용 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (react-virtuoso v4.18.5)
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완

---

## 5. 테스트 진행 기록

> APPROVED — 2026-04-20 테스트 완료

### 테스트 1: 채팅 자동 스크롤
- **질문**: "가변 높이 메시지가 있는 채팅 앱에서 새 메시지 도착 시 자동으로 하단 스크롤하려면?"
- **SKILL.md 기반 답변**: 섹션 7에서 `followOutput="smooth"` + `initialTopMostItemIndex={messages.length - 1}` 조합을 안내. 공식 API와 일치.
- **WebSearch 검증**: virtuoso.dev API Reference에서 followOutput prop 확인. VERIFIED.
- **결과**: PASS

### 테스트 2: 가상화 미작동 디버깅
- **질문**: "Virtuoso 리스트가 모든 아이템을 렌더링하고 가상화가 안 된다. 원인은?"
- **SKILL.md 기반 답변**: 섹션 14 '높이 미지정' 흔한 실수에서 컨테이너에 height 필수 지정 안내. 공식 문서와 일치.
- **WebSearch 검증**: virtuoso.dev 공식 문서에서 height 필수 요건 확인. VERIFIED.
- **결과**: PASS

### 테스트 3: 버전/API 최신성 검증
- **질문**: "react-virtuoso 최신 버전과 주요 API(fixedItemHeight, endReached, VirtuosoGrid 동적 높이 제한)가 정확한가?"
- **WebSearch 검증**: npm 최신 버전 v4.18.5 확인, fixedItemHeight/endReached API 공식 레퍼런스 확인, VirtuosoGrid 동일 크기 아이템 전용 확인.
- **결과**: PASS

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (WebSearch/WebFetch 공식 문서 직접 확인) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3개 테스트 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] 에이전트 활용 테스트 — 채팅 자동 스크롤 + 가상화 디버깅 + API 최신성 3건 PASS (섹션 5 기록, 2026-04-20)
- [⏸️] 번들 크기 gzip 수치 확인 — bundlephobia 접근 실패로 미기재, 재시도 선택 사항
- [⏸️] @virtuoso.dev/masonry 별도 패키지 상세 API 문서화 — 선택 보강, 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성 (내장 지식 기반, WebSearch 미사용) | skill-creator |
| 2026-04-20 | v2 | WebSearch/WebFetch로 공식 문서 재검증, v4.18.5 기준으로 업데이트 — GroupedTableVirtuoso 추가, minOverscanItemCount(v4.17.0+)/heightEstimates(v4.16.0+)/defaultItemHeight 신규 props 추가, react-window 유지보수 상태 DISPUTED 수정(v2 개발 중 확인), LogLevel 리버스 맵핑 Breaking Change(v4.18.2) 추가, 번들 크기 미검증 수치 제거 | skill-creator (WebSearch/WebFetch) |
| 2026-04-20 | v2 | PENDING_TEST → APPROVED 전환. WebSearch로 3개 핵심 클레임 재검증(v4.18.5 버전, fixedItemHeight/endReached API, VirtuosoGrid 동적 높이 제한), 테스트 질문 3개 수행 전체 PASS | 수동 검증 |

---

## fact-checker 교차 검증 결과

| 클레임 | 판정 | 소스 | 비고 |
|--------|------|------|------|
| 최신 버전 v4.18.5 (2026-04-14 릴리즈) | VERIFIED | github.com/petyosi/react-virtuoso/releases | npm 검색 결과와 일치 |
| Virtuoso, VirtuosoGrid, TableVirtuoso, GroupedVirtuoso 4가지 컴포넌트 | DISPUTED → VERIFIED | virtuoso.dev | GroupedTableVirtuoso 5번째 컴포넌트 존재 확인 — 5가지로 수정 |
| endReached 콜백으로 무한 스크롤 구현 | VERIFIED | virtuoso.dev/react-virtuoso/ | 공식 API |
| scrollToIndex로 프로그래매틱 스크롤 | VERIFIED | virtuoso.dev API Reference | 공식 API |
| followOutput으로 채팅 자동 스크롤 | VERIFIED | virtuoso.dev API Reference | 공식 API |
| fixedItemHeight로 고정 높이 최적화 | VERIFIED | virtuoso.dev API Reference | 공식 API |
| VirtuosoGrid는 동적 높이 미지원 | VERIFIED | virtuoso.dev API Reference | 공식 문서 제약 사항 |
| components.List는 forwardRef 필수 | VERIFIED | virtuoso.dev/customize-structure/ | 공식 문서 커스터마이징 가이드 |
| useWindowScroll로 window 스크롤 모드 | VERIFIED | virtuoso.dev API Reference | 공식 API |
| scrollSeekConfiguration으로 빠른 스크롤 시 플레이스홀더 | VERIFIED | virtuoso.dev API Reference | 공식 API |
| minOverscanItemCount prop (v4.17.0 추가) | VERIFIED | CHANGELOG.md + virtuoso.dev API Reference | 두 소스 일치 |
| heightEstimates prop (v4.16.0 추가) | VERIFIED | CHANGELOG.md + virtuoso.dev API Reference | 두 소스 일치 |
| react-window 유지보수 중단 | DISPUTED | github.com/bvaughn/react-window/commits | 2024-12 React 19 지원 추가, v2 PR 개발 중 — "유지보수 중단" 아님, 스킬에 수정 반영 |
| 번들 크기 ~16KB gzipped | UNVERIFIED | bundlephobia.com 접근 실패 | 스킬에서 수치 제거 |
| LogLevel enum → const object (v4.18.2) | VERIFIED | CHANGELOG.md (4.18.2 항목) | Breaking Change 확인 |
