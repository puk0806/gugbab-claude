---
name: claude-install-environment
description: 이 맥의 Claude Code 설치 상태(단일 nvm-global, 2026-08-10 일원화)와 npm SSL 차단 이슈 — 업데이트 실패 시 curl 우회 필요
metadata: 
  node_type: memory
  type: project
  originSessionId: 7ab7ffde-a635-446b-9889-56dd55fe246b
  modified: 2026-08-10T04:30:05.181Z
---

이 맥(Darwin)의 Claude Code 설치 환경. 2026-07-27 /doctor 수동 진단으로 최초 정리, 2026-08-10 갱신.

- **설치는 nvm 글로벌 한 곳만** (`~/.nvm/versions/node/v22.23.1/lib/node_modules`, 2026-08-10 기준 2.1.226). 현재 npm의 글로벌 루트가 nvm 쪽이라 `claude update`도 여기로 설치됨.
- **2026-08-10 이중화 재발·해소**: 2026-07-27에 남겼던 `~/.npm-global` 설치(2.1.218)가 PATH 1순위라 `claude update` 후에도 구버전이 실행되는 문제 발생 → `npm uninstall -g @anthropic-ai/claude-code --prefix ~/.npm-global`로 제거하고 nvm 쪽으로 일원화. 재발 확인: `which -a claude`가 nvm 경로 1줄이어야 정상 (업데이트했는데 버전이 안 바뀌면 이 중복부터 의심).
- **npm tarball 다운로드가 `SELF_SIGNED_CERT_IN_CHAIN`으로 실패하는 환경** (VPN/보안SW의 TLS 가로채기 추정, 간헐적). `npm view`(메타데이터)는 되는데 tgz 다운로드가 막힘. **curl은 시스템 인증서를 써서 정상 동작.**
- **업데이트 실패 시 우회 절차**: ① `npm cache ls @anthropic-ai/claude-code`로 캐시 버전 확인 → `--offline` 설치, ② 네이티브 바이너리는 `curl -fsSL -o x.tgz https://registry.npmjs.org/@anthropic-ai/claude-code-darwin-arm64/-/claude-code-darwin-arm64-<버전>.tgz`로 받아 패키지의 `node_modules/@anthropic-ai/claude-code-darwin-arm64/`에 `tar --strip-components=1`로 풀고 `install.cjs` 재실행.
- `claude doctor`(터미널)는 대화형 TUI라 Claude의 Bash에서 실행 불가. 세션 내 `/doctor`(2.1.206+, 진단→확인→수정)를 사용자가 직접 입력해야 함.
