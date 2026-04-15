---
skill: animation
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | animation |
| 스킬 경로 | `.claude/skills/frontend/animation/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | Motion (framer-motion) 최신, CSS Animation |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | 기본 애니메이션, 트랜지션, 제스처, CSS transition, AnimatePresence, 성능 최적화 6개 | 6/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Motion 공식 문서 | https://motion.dev/docs | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| import 경로 변경 | `from 'framer-motion'` → `from 'motion/react'` (패키지명 변경, 5곳 모두 수정) |
| 번들 크기 수치 오류 | `~50KB` → `~34KB (LazyMotion: ~4.6KB)` 수정 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외 (framer-motion → motion/react 반영)
- [✅] 버전 명시
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. import 경로 `motion/react`로 전환, 번들 크기 수치 수정 완료.
