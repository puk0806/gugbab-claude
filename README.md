# 🤖 gugbab-claude

Claude Code를 효과적으로 활용하기 위한 **에이전트(Agent)**, **스킬(Skill)**, **설정(CLAUDE.md)** 모음입니다.

---

## 📁 프로젝트 구조

```
gugbab-claude/
├── README.md
├── CLAUDE.md                     ← 프로젝트 공통 규칙
├── docs/
│   ├── agents/                   ← 에이전트 상세 문서
│   └── skills/                   ← 스킬 상세 문서 (예정)
└── .claude/
    ├── agents/
    │   ├── meta/                 ← 에이전트 생성/관리
    │   ├── research/             ← 리서치
    │   └── validation/           ← 검증
    ├── rules/                    ← 상황별 규칙
    └── skills/                   ← 스킬 (예정)
```

---

## 🧩 에이전트 목록

상세 문서: [docs/agents/](./docs/agents/)

### meta

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [agent-creator](./docs/agents/meta/agent-creator.md) | 새 에이전트 MD 파일 대화형 생성 | → |

### research

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [deep-researcher](./docs/agents/research/deep-researcher.md) | 3축(논문/오픈소스/기업사례) 딥리서치 오케스트레이터 | → |
| [web-searcher](./docs/agents/research/web-searcher.md) | 검색 축별 전담 서브에이전트 | → |
| [research-reviewer](./docs/agents/research/research-reviewer.md) | 리서치 품질 5항목 평가 | → |

### validation

| 에이전트 | 역할 | 문서 |
|---------|------|------|
| [fact-checker](./docs/agents/validation/fact-checker.md) | 단일 클레임 교차 검증 (VERIFIED/UNVERIFIED/DISPUTED) | → |
| [source-validator](./docs/agents/validation/source-validator.md) | URL/레포/문서 신뢰도 평가 (TRUST/CAUTION/REJECT) | → |

---

## 📚 스킬 목록

> 추후 추가 예정

---

## ⚡ Claude Code 빠른 참조

```bash
claude                        # 실행
claude --agent {name}         # 특정 에이전트로 세션 시작
claude --continue             # 이전 대화 이어서
```

| 명령어 | 설명 |
|--------|------|
| `/agents` | 등록된 에이전트 목록 |
| `/clear` | 컨텍스트 초기화 |
| `/memory` | 메모리 확인·편집 |
| `/compact` | 컨텍스트 압축 |

---

## 🔄 업데이트 로그

| 날짜 | 변경 내용 |
|------|-----------|
| 2026-03-26 | 프로젝트 초기화 — `agent-creator` 추가, CLAUDE.md 작성, 커밋 컨벤션 분리 |
| 2026-03-27 | 리서치·검증 에이전트 5종 추가, 카테고리별 폴더 구조 도입, 상세 문서 분리 |
