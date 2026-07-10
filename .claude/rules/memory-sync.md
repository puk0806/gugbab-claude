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
