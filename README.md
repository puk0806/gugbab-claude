# 🤖 gugbab-claude

Claude Code를 효과적으로 활용하기 위한 **에이전트(Agent)**, **스킬(Skill)**, **설정(CLAUDE.md)** 모음입니다.

---

## 📁 프로젝트 구조

```
gugbab-claude/
├── README.md                     ← 지금 보고 있는 파일
├── CLAUDE.md                     ← 프로젝트 공통 규칙
└── .claude/
    ├── agents/                   ← 서브에이전트 모음
    │   └── agent-creator.md
    └── skills/                   ← 스킬 모음 (추후 추가 예정)
```

---

## 🧩 에이전트 목록

에이전트는 Claude가 특정 작업을 독립된 컨텍스트에서 처리하도록 위임하는 전문 AI입니다.
`.claude/agents/` 폴더에 MD 파일로 저장하면 Claude Code가 자동으로 인식합니다.

### agent-creator

| 항목 | 내용 |
|------|------|
| 📄 파일 | `.claude/agents/agent-creator.md` |
| 🎯 역할 | 새로운 서브에이전트 MD 파일을 대화형으로 설계하고 생성 |
| 🤖 모델 | Opus |
| 🛠 도구 | Read, Write, Glob |

**언제 사용하나요?**
새로운 에이전트가 필요할 때 직접 MD 파일을 작성하는 대신, agent-creator에게 원하는 기능을 설명하면 알아서 설계하고 파일까지 생성해줍니다.

**호출 예시:**
```
코드 리뷰 에이전트 만들어줘
API 문서 자동 생성하는 에이전트 필요해
@"agent-creator (agent)" PR 리뷰 에이전트 만들어줘
```

---

## 📚 스킬 목록

> 현재 등록된 스킬이 없습니다. 추후 추가 예정입니다.

스킬은 에이전트와 달리 메인 대화 컨텍스트에 특정 지식/패턴을 주입하는 방식입니다.

---

## ⚡ Claude Code 기본 명령어

### 실행

```bash
# 기본 실행
claude

# 특정 에이전트로 세션 시작
claude --agent agent-creator

# 프롬프트를 바로 전달
claude "코드 리뷰해줘"
```

### 대화 중 슬래시 커맨드

| 명령어 | 설명 |
|--------|------|
| `/help` | 사용 가능한 명령어 목록 |
| `/memory` | 저장된 메모리 확인 및 편집, Auto Memory 토글 |
| `/agents` | 등록된 에이전트 목록 확인 |
| `/init` | 현재 프로젝트를 분석해 CLAUDE.md 자동 생성 |
| `/clear` | 현재 대화 컨텍스트 초기화 |
| `/cost` | 현재 세션의 토큰 사용량 확인 |

### 에이전트 호출 방법

```
# 방법 1: 자연어 (Claude가 자동 판단)
"코드 리뷰 에이전트로 이 파일 검토해줘"

# 방법 2: @-멘션 (특정 에이전트 지정)
@"agent-creator (agent)" 새 에이전트 만들어줘

# 방법 3: CLI 플래그 (세션 전체 적용)
claude --agent agent-creator
```

---

## 🗂 CLAUDE.md 구조 설명

CLAUDE.md는 Claude가 작업할 때 자동으로 참고하는 규칙 파일입니다.
폴더 계층에 따라 적용 범위가 달라집니다.

```
project/
├── CLAUDE.md          ← 전체 공통 규칙 (항상 로드)
├── frontend/
│   └── CLAUDE.md      ← frontend 작업 시에만 추가 로드
└── backend/
    └── CLAUDE.md      ← backend 작업 시에만 추가 로드
```

**주요 활용:**
- 코드 스타일 및 컨벤션 정의
- 자주 쓰는 명령어 등록
- 프로젝트 아키텍처 설명
- Claude에게 금지할 행동 지정

---

## 🧠 메모리 시스템

Claude Code는 두 가지 방식으로 정보를 기억합니다.

| 종류 | 작성자 | 저장 위치 | 특징 |
|------|--------|-----------|------|
| **CLAUDE.md** | 나 | 프로젝트 폴더 | 명시적 규칙, git으로 팀 공유 가능 |
| **Auto Memory** | Claude | `~/.claude/projects/` | 대화 중 자동 학습, 내 기기에만 저장 |

---

## 🔄 업데이트 로그

| 날짜 | 변경 내용 |
|------|-----------|
| 2026-03-26 | 프로젝트 초기화, `agent-creator` 에이전트 추가 |
