---
name: feedback_audit_blind_spots
description: 전수 감사가 놓친 버그 유형 4가지(훅 I/O 규약·설치본 현지 수정 역류·조건부 참조·짝 단위 처리) — 감사 시 반드시 포함할 축
metadata:
  node_type: memory
  type: feedback
  originSessionId: 64863110-4333-4f2b-963a-d8c76a43ec50
  modified: 2026-09-30T06:39:15.825Z
---

2026-09-25 전수 점검·최신화 직후, 설치본(01) 세션이 "원본 재설치로 현지 수정 2건이 덮여 버그 재발"을 보고했다. 추가 조사로 같은 유형이 더 나왔다. 감사가 놓친 이유와 앞으로의 감사 축:

1. **훅 I/O 규약을 공식 문서와 대조하지 않았다.** 테스트가 틀린 규약(stdout)을 그대로 단언해 "통과=정상"으로 보였다. exit 2 차단 사유는 stderr(또는 `decision:"block"`+`reason`), exit 0 stderr는 debug log 전용, SessionStart/UserPromptSubmit만 stdout을 컨텍스트로 주입, InstructionsLoaded는 출력 폐기. 결과: 차단 훅 5종 사유 유실, session-start 배너·staleness 경고가 아무에게도 안 보였음.
2. **설치본에서 현지 수정 후 원본 미반영(역류 없음).** 재설치가 원본으로 덮어 회귀. 01(stderr·agent-status), 02(`hooks/package.json` commonjs — ESM 대상에서 훅 전체 크래시).
3. **참조 검사가 `@` import·상대 링크만 봤다.** 평문 에이전트 호출·`category/name` 스킬 참조가 템플릿 소유권 불일치로 설치본에서 깨지는 건 못 봄(에이전트 43·스킬 58건).
4. **"짝으로 처리돼야 할 파일"을 개별 판정.** prune이 SKILL.md는 보존(해시 불일치)하고 verification.md만 삭제.

5. **(2026-09-26 재검토에서 추가) 보안 가드 우회·Stop 루프.** bash-guard가 명령 선두만 보고 판정해 `true | git push`, `bash -c`, `git -C . push` 등으로 push/commit 확인을 우회했고, PermissionRequest가 `rm -rf ~`·`reset --hard`까지 자동 승인했다. Stop 훅은 `stop_hook_active`를 안 읽어 해소 불가 조건(codex 계정 오류)에서 매 턴 재차단. 훅을 다른 이벤트로 옮기면 그 이벤트의 모든 `source`(compact·resume)에서 도는지까지 확인할 것 — SessionStart 이동 직후 compaction마다 "즉시 질문" 주입 회귀가 났다.

6. **(2026-09-26) staleness-check가 사실상 218/237 스킬을 조용히 누락.** verification.md 줄 시작 `> 검증일:`을 찾았는데 그런 파일이 0개 — 체크리스트 백틱 안 옛 날짜를 읽거나 아예 못 읽음. "경고가 안 뜬다 = 신선하다"로 오판. 고친 뒤 실제 60일 초과는 135종으로 드러남.

7. **(2026-09-26) 학술 인용 스킬의 원문 환각.** 아리스토텔레스·플라톤 스킬 15종을 Perseus canonical-greekLit XML(Bywater NE 등)과 대조하니 12종에서 오류 — 원문에 없는 그리스어 구절(πεισθεὶς μεταβάλλει, ἔχει πως καὶ οὐκ ἔχει 등), Bekker 행·장 경계 오기(VII.8은 1150b29 시작), 서지 편자 오기(Symposium Aristotelicum 2009 = Natali 편). 기존 verification.md는 "VERIFIED"였음 — WebSearch 2차 요약 교차만으로는 원문 인용을 검증할 수 없다. 학술 인용 스킬은 **1차 원문 파일 대조**가 필수.

8. **(2026-09-30) 교훈을 적어 놓고도 다음 감사 계획에 안 넣었다 → 같은 유형 재발.** 09-28~29 전수 재검증·재테스트·실사용 검증을 했는데도 rust·unity SEO 누수, all 베이스 CLAUDE.md 병합 실패, 작성 도구 n 설치본의 무조건 참조, verification.md 날짜 4곳 불일치 39건, 템플릿 문서 수치 불일치를 못 잡음. 원인: 모든 검사가 "파일 하나의 형식·내용"만 봤고 **실제 설치 결과**와 **파일 간 일관성**은 안 봄(위 3번 "실설치 후 스캔" 교훈이 이미 있었는데 계획에서 누락). 사용자 지적: "테스트가 제대로 이루어지지 않았다". → 사람 기억 대신 **테스트로 강제**: `scripts/installed-refs.test.js`(설치본 참조), `verification-consistency.test.js`(날짜 4곳), `template-docs-counts.test.js`(문서 수치↔실설치), `template-ownership.test.js`(자산 그룹×템플릿 매트릭스, 미분류 자산 실패). staleness-check는 "최신 날짜" 판정이 불일치를 가리므로 불일치 경고 추가.

**병렬 작업 금지 사항**: 같은 워킹트리에서 서브에이전트 여러 개가 동시에 편집할 때 `git stash`·`git checkout -- .`·`git reset` 금지 — 다른 작업자의 미커밋 편집을 날린다(2026-09-26 실제 발생, radix-ui SKILL.md 충돌). 회귀 비교는 `git show HEAD:<path>`나 `git worktree`로.

**How to apply:**
- 서브에이전트 프롬프트에 "git stash/checkout/reset 금지" 명시.
- "검출 0건"인 감사 훅은 판독 가능 비율부터 확인(무음 누락 방지 — 판독 불가 항목은 보고).
- 가드 훅은 "정상 명령 판정"이 아니라 **우회 벡터 목록**(파이프·체인·서브셸·`-c`·git 전역 옵션·따옴표 분할·유니코드 공백)으로 적대적 테스트.
- Stop 훅은 `stop_hook_active`로 같은 사유 재차단 금지, 환경 문제(미로그인·계정)는 조용히 통과.
- 훅을 만들거나 감사할 때: 이벤트별 공식 규약(code.claude.com/docs/en/hooks)을 먼저 확인하고, 테스트는 exit code뿐 아니라 **메시지 채널**까지 단언.
- 전수 감사 범위에 **설치본 역류 점검**(각 설치본 git log에서 설치 자산을 건드린 현지 fix 커밋 → 원본 반영 여부)을 포함. 설치본 세션에는 "설치 자산은 원본에서 고치라"고 안내.
- 참조 감사는 정적 grep이 아니라 **템플릿별 실설치** 후 스캔.
- 설치·정리 로직은 파일이 아니라 **단위(스킬 폴더+docs, 에이전트+docs)** 로 판정하는지 확인.
- **전수 감사·재검증 계획을 세울 때 이 메모리의 항목을 체크리스트로 계획에 직접 넣는다**(읽고 넘어가지 말 것). 최소: 전체 테스트 스위트(설치본 참조·날짜 일치·문서 수치·소유 매트릭스 포함) 실행 결과를 감사 완료 조건으로.
- "테스트 통과 = 정상"이 아니다 — 새 결함 유형을 발견하면 개별 조합 테스트를 하나 추가하는 데 그치지 말고, 그 유형 전체를 덮는 **매트릭스/전수 검사**로 만든다.
관련: [[project_full_audit_2026-09-25]], [[project_install_architecture]], [[feedback_adversarial_testing]].
