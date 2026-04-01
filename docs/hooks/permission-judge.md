# permission-judge 훅 문서

## 개요

`permission-judge.js`는 Claude Code의 **PreToolUse 훅**으로, 각 도구 실행 전 안전 여부를 자동으로 판단합니다.
`--enable-auto-mode`(Team 플랜 전용)를 대체하는 프로젝트 맞춤 자동 허가 판단기입니다.

| 판단 결과 | 출력 | 동작 |
|----------|------|------|
| 안전 | `{ "decision": "approve" }` | 사용자 확인 없이 자동 실행 |
| 위험 | `{ "decision": "block" }` | 즉시 차단, 실행 불가 |
| 불명확 | (출력 없음) | 기존 동작 유지 (사용자에게 위임) |

---

## 파일 구조

```
.claude/
├── hooks/
│   ├── permission-judge.js          ← 훅 본체
│   └── permission-judge.test.js     ← 테스트 파일
├── settings.json                    ← 훅 등록 설정
```

---

## 판단 기준

### 1. 읽기 전용 도구 → 자동 승인

파일시스템을 변경하지 않는 도구는 항상 승인합니다.

```
Read, Glob, Grep, WebSearch, WebFetch
```

### 2. 내부 상태 도구 → 자동 승인

파일시스템 변경 없이 Claude 내부 상태만 변경하는 도구입니다.

```
TodoWrite, NotebookEdit
```

### 3. Write / Edit → 경로 기반 판단

| 경로 패턴 | 판단 | 이유 |
|-----------|------|------|
| `.claude/(agents\|skills\|rules\|hooks)/` | ✅ approve | 에이전트·스킬·규칙 파일 |
| `docs/(agents\|skills\|hooks)/` | ✅ approve | 문서 파일 |
| `README.md`, `CLAUDE.md` | ✅ approve | 루트 문서 |
| `SKILL.md`, `verification.md` | ✅ approve | 스킬·검증 파일 |
| 그 외 경로 | ❓ ask | 사용자 확인 필요 |

**예시:**
```
✅ .claude/agents/frontend/frontend-architect.md
✅ .claude/skills/frontend/react-core/SKILL.md
✅ docs/skills/frontend/code-convention/verification.md
✅ README.md

❓ src/components/Button.tsx     ← 사용자 확인
❓ next.config.js                ← 사용자 확인
❓ package.json                  ← 사용자 확인
```

### 4. Bash → 명령어 내용 기반 판단

판단 순서: **차단 > 확인 > 승인** (안전 쪽으로 보수적)

#### 자동 승인 명령어

| 카테고리 | 명령어 예시 |
|----------|------------|
| git 읽기 | `git status`, `git diff`, `git log`, `git branch` |
| git 스테이징 | `git add <파일>` |
| 파일 읽기 | `ls`, `cat`, `head`, `tail`, `find`, `pwd` |
| 디렉토리 생성 | `mkdir -p .claude/`, `mkdir -p docs/` |
| 패키지 스크립트 | `pnpm run lint`, `npm run build`, `pnpm test` |
| 환경 확인 | `node --version`, `node *.test.js` |
| 출력 | `echo`, `printf` |

#### 사용자 확인 필요 명령어

| 카테고리 | 명령어 예시 | 이유 |
|----------|------------|------|
| git 원격 | `git push` | 되돌리기 어려움 |
| git 커밋 | `git commit` | 사용자 의도 확인 필요 |
| git 브랜치 변경 | `git checkout`, `git reset`, `git merge` | 작업 상태 변경 |
| 패키지 설치 | `pnpm add`, `npm install <pkg>` | 의존성 변경 |

#### 즉시 차단 명령어

| 명령어 | 이유 |
|--------|------|
| `git push --force`, `git push -f` | 히스토리 덮어쓰기 불가역 |
| `rm -rf /` (시스템 루트) | 시스템 파괴 위험 |
| `rm -rf ../` (상위 디렉토리) | 프로젝트 외부 삭제 |
| `curl ... \| bash`, `wget ... \| sh` | 원격 스크립트 실행 |
| `chmod 777` | 보안 위험 |
| Fork bomb (`:() { :|:& }; :`) | 시스템 마비 |

### 5. Agent (서브에이전트) → 자동 승인

서브에이전트는 자체 권한 관리를 하므로 승인합니다.

### 6. 알 수 없는 도구 → 사용자에게 위임

판단 기준이 없는 신규 도구는 안전하게 사용자에게 위임합니다.

---

## 설정 방법

### settings.json 등록 확인

```json
// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/permission-judge.js"
          }
        ]
      }
    ]
  }
}
```

> **주의:** `matcher: "*"`는 모든 도구에 훅을 적용합니다.
> 특정 도구에만 적용하려면 `matcher: "Bash"` 처럼 도구명을 지정합니다.

---

## 테스트

### 실행 방법

```bash
node .claude/hooks/permission-judge.test.js
```

### 테스트 케이스 구성 (45개)

| 카테고리 | 케이스 수 | 기대 결과 |
|----------|----------|----------|
| 읽기 전용 도구 | 5 | approve |
| 안전한 경로 Write/Edit | 7 | approve |
| 불명확한 경로 Write | 3 | ask |
| Bash 안전한 명령어 | 14 | approve |
| Bash 확인 필요 명령어 | 6 | ask |
| Bash 위험한 명령어 | 8 | block |
| 내부 도구 | 2 | approve |

### 최근 테스트 결과

```
결과: 45/45 통과
✅ 모든 테스트 통과 (2026-03-27)
```

---

## 직접 테스트 (수동)

```bash
# 특정 입력으로 판단 결과 확인
echo '{"tool_name":"Bash","tool_input":{"command":"git push --force"}}' \
  | node .claude/hooks/permission-judge.js
# → {"decision":"block","reason":"force push는 히스토리를 덮어씁니다. 직접 실행하세요."}

echo '{"tool_name":"Read","tool_input":{"file_path":"/project/README.md"}}' \
  | node .claude/hooks/permission-judge.js
# → {"decision":"approve","reason":"Read: 읽기 전용 작업"}

echo '{"tool_name":"Write","tool_input":{"file_path":"/project/src/Button.tsx"}}' \
  | node .claude/hooks/permission-judge.js
# → (아무 출력 없음 → 사용자에게 위임)
```

---

## 설계 원칙

1. **보수적 기본값**: 판단이 불명확하면 항상 사용자에게 위임 (null 반환)
2. **차단 우선**: 차단 패턴 먼저 검사 후 승인 패턴 검사
3. **되돌릴 수 없는 작업 차단**: force push, 시스템 파일 삭제 등
4. **프로젝트 범위 내 쓰기만 승인**: `.claude/`, `docs/`, 루트 문서만 자동 승인

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-03-27 | v1 | 최초 작성, 45개 테스트 케이스 전부 통과 |
