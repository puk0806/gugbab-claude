---
name: claude-install-environment
description: 이 맥의 Claude Code 설치 상태(단일 npm-global)와 npm SSL 차단 이슈 — 업데이트 실패 시 curl 우회 필요
metadata: 
  node_type: memory
  type: project
  originSessionId: 7ab7ffde-a635-446b-9889-56dd55fe246b
---

2026-07-27 /doctor 수동 진단으로 정리한 이 맥(Darwin)의 Claude Code 설치 환경.

- **설치는 `~/.npm-global` 한 곳만** (2.1.218). nvm 쪽(`~/.nvm/versions/node/*/lib/node_modules`) 중복 설치와 `~/.claude/downloads/claude-2.1.85` 잔여물은 2026-07-27 제거함. 재발 확인: `which -a claude`가 1줄이어야 정상.
- **npm tarball 다운로드가 `SELF_SIGNED_CERT_IN_CHAIN`으로 실패하는 환경** (VPN/보안SW의 TLS 가로채기 추정, 간헐적). `npm view`(메타데이터)는 되는데 tgz 다운로드가 막힘. **curl은 시스템 인증서를 써서 정상 동작.**
- **업데이트 실패 시 우회 절차**: ① `npm cache ls @anthropic-ai/claude-code`로 캐시 버전 확인 → `--offline` 설치, ② 네이티브 바이너리는 `curl -fsSL -o x.tgz https://registry.npmjs.org/@anthropic-ai/claude-code-darwin-arm64/-/claude-code-darwin-arm64-<버전>.tgz`로 받아 패키지의 `node_modules/@anthropic-ai/claude-code-darwin-arm64/`에 `tar --strip-components=1`로 풀고 `install.cjs` 재실행.
- `claude doctor`(터미널)는 대화형 TUI라 Claude의 Bash에서 실행 불가. 세션 내 `/doctor`(2.1.206+, 진단→확인→수정)를 사용자가 직접 입력해야 함.
