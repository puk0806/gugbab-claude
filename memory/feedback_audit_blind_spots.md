---
name: feedback_audit_blind_spots
description: 전수 감사가 놓친 버그 유형 4가지(훅 I/O 규약·설치본 현지 수정 역류·조건부 참조·짝 단위 처리) — 감사 시 반드시 포함할 축
metadata:
  node_type: memory
  type: feedback
  originSessionId: 64863110-4333-4f2b-963a-d8c76a43ec50
  modified: 2026-09-26T03:01:51.736Z
---

2026-09-25 전수 점검·최신화 직후, 설치본(01) 세션이 "원본 재설치로 현지 수정 2건이 덮여 버그 재발"을 보고했다. 추가 조사로 같은 유형이 더 나왔다. 감사가 놓친 이유와 앞으로의 감사 축:

1. **훅 I/O 규약을 공식 문서와 대조하지 않았다.** 테스트가 틀린 규약(stdout)을 그대로 단언해 "통과=정상"으로 보였다. exit 2 차단 사유는 stderr(또는 `decision:"block"`+`reason`), exit 0 stderr는 debug log 전용, SessionStart/UserPromptSubmit만 stdout을 컨텍스트로 주입, InstructionsLoaded는 출력 폐기. 결과: 차단 훅 5종 사유 유실, session-start 배너·staleness 경고가 아무에게도 안 보였음.
2. **설치본에서 현지 수정 후 원본 미반영(역류 없음).** 재설치가 원본으로 덮어 회귀. 01(stderr·agent-status), 02(`hooks/package.json` commonjs — ESM 대상에서 훅 전체 크래시).
3. **참조 검사가 `@` import·상대 링크만 봤다.** 평문 에이전트 호출·`category/name` 스킬 참조가 템플릿 소유권 불일치로 설치본에서 깨지는 건 못 봄(에이전트 43·스킬 58건).
4. **"짝으로 처리돼야 할 파일"을 개별 판정.** prune이 SKILL.md는 보존(해시 불일치)하고 verification.md만 삭제.

**How to apply:**
- 훅을 만들거나 감사할 때: 이벤트별 공식 규약(code.claude.com/docs/en/hooks)을 먼저 확인하고, 테스트는 exit code뿐 아니라 **메시지 채널**까지 단언.
- 전수 감사 범위에 **설치본 역류 점검**(각 설치본 git log에서 설치 자산을 건드린 현지 fix 커밋 → 원본 반영 여부)을 포함. 설치본 세션에는 "설치 자산은 원본에서 고치라"고 안내.
- 참조 감사는 정적 grep이 아니라 **템플릿별 실설치** 후 스캔.
- 설치·정리 로직은 파일이 아니라 **단위(스킬 폴더+docs, 에이전트+docs)** 로 판정하는지 확인.
관련: [[project_full_audit_2026-09-25]], [[project_install_architecture]], [[feedback_adversarial_testing]].
