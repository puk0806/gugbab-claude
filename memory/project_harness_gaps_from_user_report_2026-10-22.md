---
name: project-harness-gaps-from-user-report-2026-10-22
description: "다른 프로젝트 세션의 자체 점검 8항으로 찾은 하네스 빈틈 4개 수정(2026-10-22, 브랜치 fix/harness-gaps-2026-10-22) — exports 비밀값 가리기·Bash 로 소스 쓰기 차단·확인 생략 표현·중간 영어 안내 검사, 하네스 탓 아닌 항목 판정"
metadata:
  node_type: memory
  type: project
  originSessionId: e56d6dae-5bbb-4b87-9782-cf342f4a6e7a
  modified: 2026-10-22T06:55:44.476Z
---

2026-10-22 사용자가 다른 PC·프로젝트(넥사크로→React 마이그레이션 토이 작업, Java+TS)에서 하네스를 쓴 세션이 스스로 남긴 "규칙 위반·실수 8항"을 붙여 주며 "하네스가 잘 적용됐는지" 확인 요청 → 설치본 v1.1.0 훅에 같은 입력을 넣어 판정, 사용자 "버그가 있다면 일괄 수정".

**하네스 빈틈 → 고침** (브랜치 `fix/harness-gaps-2026-10-22`, 버전은 PR 때 1.1.1):
1. `session-export` 가 대화 속 비밀번호를 exports 에 그대로 → `redactSecrets` 로 `***`(키=값·Bearer·ghp_/sk-/AKIA 등 접두 토큰·URL `user:pass@`·PEM). 자리표시자·변수·한글 문장은 그대로
2. `cat > package.json <<EOF`·`sed … > build.gradle`·`sed -i` 로 소스를 만들면 Write·Edit 훅을 모두 비켜 감 → `bash-guard` `classifySourceWrite`: 내용 손으로 쓰는 명령(cat·echo·printf·tee·sed·awk·perl)이 프로젝트·허용 폴더 안 소스·설정 확장자에 쓰면 deny("Write·Edit 도구로"). 명령 출력(node·npm …)·임시 폴더·`.git`·`.txt`/`.log` 는 그대로. 기존 heredoc 자동 허용(`isHeredocSafe`)은 프로젝트 소스면 더 이상 허용 안 됨(시험 2개 기대값 변경)
3. `task-confirm-guard` 가 "물어보지말고 그냥 만들어" 를 생략으로 못 알아들음 → 물어보지 말고·컨펌 없이·확인 안 받고·그냥 진행/만들어/해줘 추가, 바로 뒤 부정("하지 마")이면 생략 아님. **같이 찾은 기존 버그**: 확인 질문 뒤 "그냥 만들지 마"·"바로 진행하면 안 돼" 가 승인으로 판정 → "-지 마"·"-면 안 돼" 거절에 추가("응 … -면 안 돼" 는 승인+부가 조건으로 유지)
4. `korean-response-guard` 가 마지막 답만 검사 → 이번 턴 중간 안내(트랜스크립트의 마지막 사람 질문 이후 어시스턴트 text 블록) 중 영어 블록 2개 이상이면 Stop block 으로 "한국어로 짧게 다시 알려 달라"

**하네스 탓 아님(판정)**: typescript.md 미로드 — 경로 설정 정상, **새 .ts 를 Write 로 만들 때도 경로 룰이 로드됨을 실세션으로 확인**(꺼진 프로젝트였거나 Bash 로 만든 경우로 추정 — 그 PC 에서 `gugbab-claude status` 로 확인 필요) · 스킬·에이전트 미사용·수정된 파일 재확인·메모리 저장 = 모델 판단 영역(강제 훅 없음).

**Why:** 사용자 목표는 "하네스가 실제로 적용돼 사람 실수를 막는가" — 실사용 보고는 단위 테스트가 못 본 우회 경로(Bash 로 파일 쓰기)를 드러냄.
**How to apply:** 비슷한 보고를 받으면 그 세션 기록이 없어도 설치본 훅에 같은 입력을 넣어 재현하고, 하네스 빈틈·모델 판단·설정(꺼짐) 셋으로 나눠 답한다. 훅 수정은 맥·윈도우 공통(같은 JS) — 윈도우 입력은 CI `unit-tests` 가 확인. 관련: [[project-windows-support-analysis]] [[feedback-report-after-full-tests]] [[feedback-auto-allow-reads-only]]
