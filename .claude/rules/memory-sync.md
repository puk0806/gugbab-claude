# 메모리 동기화 정책

메모리는 `memory/`(repo 루트)에 git 추적으로 저장한다.
`~/.claude/projects/.../memory` 는 이 폴더를 가리키는 symlink다.

---

## 자동 동기화 훅 (강제)

| 훅 | 이벤트 | 동작 |
|----|--------|------|
| `memory-sync.js` | PostToolUse Write / Edit | memory 파일 변경 감지 → 즉시 commit + push |
| `memory-stop-guard.js` | Stop | 세션 종료 전 미동기 변경 재시도 |
| `memory-pull.js` | SessionStart | 세션 시작 시 원격 최신 memory pull |

---

## 메모리 작성 규칙

- memory 파일은 반드시 **Write 또는 Edit 도구**로만 작성한다
- Bash(echo/sed/awk)로 memory 파일 직접 수정 금지 — 훅 감지 불가
- `MEMORY.md`는 인덱스 파일 — 내용은 개별 파일에, 한 줄 포인터만 기록

---

## 새 데스크탑 최초 설정

```bash
git clone <repo>
cd 00_gugbab-claude
bash scripts/setup-memory-link.sh
```

이후 세션 시작 시 SessionStart 훅이 자동으로 최신 memory를 pull한다.

---

## 충돌 방지 원칙

- 두 머신에서 동시에 같은 memory 파일을 편집하면 충돌 발생 가능
- 세션 시작 전 최신 상태를 pull하므로 일반적으로 충돌 없음
- 충돌 발생 시: `git pull --rebase` 후 수동 해결
