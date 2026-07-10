# 메모리 동기화 정책

> 2026-07-10 개편: symlink + 자동 커밋 구조 폐지 → **전역 1차 저장 + 레포 미러 (커밋은 사용자 수동)**

## 저장 구조

| 모드 | 1차 저장 (항상) | 2차 미러 | 커밋·푸시 |
|------|----------------|----------|-----------|
| **Y** (memory 공유 프로젝트) | 전역 `~/.claude/projects/<해시>/memory/` (실제 디렉토리) | 레포 `memory/` 워킹트리에 자동 복사 | **사용자가 직접** |
| **N** (비공유 프로젝트) | 전역 `~/.claude/projects/<해시>/memory/` | 없음 | 해당 없음 |

- **Y/N 판별 기준**: 레포에 `memory/` 디렉토리가 존재하고 memory 훅이 설치되어 있으면 Y. 이 레포(gugbab-claude)는 **Y**.
- 전역 저장소가 항상 원본이므로, 레포 미러를 커밋하지 않아도(또는 버려도) 메모리는 유실되지 않는다.
- 훅은 **git commit을 절대 수행하지 않는다** — 자동 커밋으로 인한 깃 트리 오염 방지(2026-07-10 결정).

## 자동 동기화 훅

| 훅 | 이벤트 | 동작 |
|----|--------|------|
| `memory-sync.js` | PostToolUse Write / Edit | memory 파일 변경 감지 → 전역↔레포 **양방향 미러 복사** (git 조작 없음) |
| `memory-pull.js` | SessionStart | ① 전역 memory를 실제 디렉토리로 보장 (과거 symlink 발견 시 자동 마이그레이션) ② 레포 `memory/` 파일이 전역에 없거나 내용이 다르면서 더 최신이면 전역으로 복사 (git pull 직후 반영용) |

> 구 구조의 `memory-stop-guard.js`(Stop 자동 커밋)와 `scripts/setup-memory-link.sh`(symlink 수동 설정)는 제거됨.

## 동작 흐름

```
[메모리 저장 시]
Claude가 memory 파일 Write/Edit
  └→ 전역 ~/.claude/projects/<해시>/memory/ 에 저장     ← 1차 (항상)
      └→ memory-sync.js: 레포 memory/ 로 복사            ← Y 프로젝트만
          └→ git 워킹트리에 미커밋 변경으로 표시
              └→ 사용자가 원할 때 직접 커밋(Y) 또는 방치/폐기(사실상 N)

[다른 데스크탑과 공유 시]
사용자: git add memory/ && git commit && git push          ← 수동
다른 PC: git pull → 세션 시작
  └→ memory-pull.js: 레포 memory/ → 전역으로 반영
```

## 커밋 시 메모리 정리 (2026-07-10 신설)

사용자가 **커밋·푸시를 요청하면 실행 전에 항상** 아래를 수행하고, memory 변경을 같은 배치에 포함한다:

1. 이번 작업으로 낡아진 memory 서술 스캔 → 갱신 (예: 훅 수·정책 변경이 기존 memory와 어긋나는 경우)
2. 기록할 가치 있는 신규 결정·피드백 저장 (+ MEMORY.md 인덱스 갱신)
3. **세션 요약 최신화**: `node $CLAUDE_PROJECT_DIR/.claude/hooks/session-export.js --refresh`
   — Stop 이벤트를 기다리지 않고 이 시점까지의 전체 대화를 exports에 재생성 (PR에 대화 기록 누락 방지)
4. 레포 ↔ 전역 미러 일치 확인 (`diff -rq memory ~/.claude/projects/<해시>/memory`)
5. memory 변경 → `[memory]` 커밋 / exports 변경 → `[export]` 커밋으로 **해당 커밋 배치에 함께 포함**

세션 중 발생한 피드백·결정은 그 자리에서 memory에 기록하되(미러까지 자동), 커밋은 이 시점에만 묶는다.

**훅 강제 (deliverable-guard)**: `git push`·`gh pr create` 직전에 memory/·exports/ 미커밋 변경이 있으면
차단된다 (PreToolUse Bash, `--no-readme`와 무관하게 항상). 위 1~5를 완료해야 push·PR이 가능하다.

**세션 요약(exports) 저장 규칙**: Stop(매 턴)은 **로컬** `~/.claude/projects/<해시>/exports/`에만 기록한다
— 레포 git status를 오염시키지 않기 위함. 레포 `exports/`는 커밋 배치의 `--refresh` 시점에만 생성되므로
**push 후 워킹트리는 항상 클린**하다. push 턴의 꼬리 대화는 로컬에 기록되고, refresh가 트랜스크립트
전체를 다시 읽기 때문에 다음 커밋 배치의 레포 요약에 자동 포함된다.

## 메모리 작성 규칙

- memory 파일은 반드시 **Write 또는 Edit 도구**로만 작성한다
- Bash(echo/sed/awk)로 memory 파일 직접 수정 금지 — 훅 감지 불가 (bash-guard가 쓰기 연산 차단)
- `MEMORY.md`는 인덱스 파일 — 내용은 개별 파일에, 한 줄 포인터만 기록

## 새 데스크탑 설정

```bash
git clone <repo>
cd 00_gugbab-claude
# 끝 — 별도 설정 불필요
```

SessionStart 훅(`memory-pull.js`)이 최초 실행 시 전역 memory 디렉토리를 만들고 레포 `memory/` 내용을 복사한다.

## 충돌 방지 원칙

- 전역과 레포 미러가 다를 때: **내용이 다르고 레포 쪽 mtime이 더 최신**인 경우에만 세션 시작 시 전역을 덮어쓴다 (git pull 직후 케이스)
- 두 머신에서 같은 memory 파일을 편집한 경우: 나중에 push하는 쪽에서 git 충돌 발생 → `git pull --rebase` 후 수동 해결
