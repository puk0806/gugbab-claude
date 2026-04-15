---
skill: dotenvy
category: backend
version: v1
date: 2026-04-08
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | dotenvy |
| 스킬 경로 | .claude/skills/dotenvy/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 검증 방법 | rust-backend-developer 활용 테스트 (소스코드 수준 검증) |
| 버전 기준 | dotenvy 0.15.x / envy 0.4.x |
| 재검증일 | 2026-04-08 |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| 공식 문서 | https://docs.rs/dotenvy/ | https://docs.rs/envy/ | https://github.com/allan2/dotenvy | https://github.com/softprops/envy | ⭐⭐⭐ High |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | dotenv().ok(), from_filename, envy::from_env, serde default, prefixed, test env 6개 | 6/6 PASS (소스코드 수준 검증) |

---

## fact-checker 검증 결과

> ⚠️ fact-checker 에이전트를 통한 검증이 실행되지 않았습니다 (수동 작성).

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (docs.rs/dotenvy, docs.rs/envy)
- [❌] fact-checker로 핵심 클레임 검증 ← 미실행 (수동 작성)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (dotenvy 0.15.x / envy 0.4.x)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 6/6 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. dotenvy 0.15.7 / envy 0.4.2 소스코드 수준 검증 완료. `env::set_var` unsafe 변경 예정(Rust Edition 2024) 주의 표기 정확.
