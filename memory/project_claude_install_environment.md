---
name: claude-install-environment
description: 이 맥의 Claude Code 설치 상태(단일 nvm-global, 2026-08-10 일원화)와 npm SSL 차단 이슈 — 업데이트 실패 시 curl 우회 필요
metadata: 
  node_type: memory
  type: project
  originSessionId: 7ab7ffde-a635-446b-9889-56dd55fe246b
  modified: 2026-09-25T04:00:24.411Z
---

이 맥(Darwin)의 Claude Code 설치 환경. 2026-07-27 /doctor 수동 진단으로 최초 정리, 2026-08-10·2026-09-25 갱신.

- **설치는 nvm 글로벌 한 곳만** (`~/.nvm/versions/node/v22.23.1/lib/node_modules`, 2026-09-25 기준 2.1.282). 현재 npm의 글로벌 루트가 nvm 쪽이라 `claude update`도 여기로 설치됨. (v20.17.0 쪽에도 2.1.204 잔재가 있으나 PATH에 없어 무해.)
- **2026-09-25 업데이트 시 겪은 2가지 함정**: ① 전날(09-24) 설치가 중간에 실패해 `@anthropic-ai/.claude-code-XXXX` 임시 백업 디렉토리가 남아 있으면 다음 `npm install -g`가 `ENOTEMPTY: rename` 으로 실패 → 해당 임시 디렉토리 `rm -rf` 후 재시도하면 통과. ② postinstall(`install.cjs`)이 완료되지 않으면 `bin/claude.exe`가 500바이트 스텁(mode 644)으로 남아 새 셸에서 `claude` = "permission denied"/`which` not found 상태가 됨. 실행 중인 세션은 메모리에 올라간 바이너리로 계속 돌기 때문에 눈치채기 어렵다. 정상 상태 = `bin/claude.exe`가 200MB급 네이티브 바이너리(하드링크, `node_modules/@anthropic-ai/claude-code-darwin-arm64/claude`와 동일 inode).
- **2026-08-10 이중화 재발·해소**: 2026-07-27에 남겼던 `~/.npm-global` 설치(2.1.218)가 PATH 1순위라 `claude update` 후에도 구버전이 실행되는 문제 발생 → `npm uninstall -g @anthropic-ai/claude-code --prefix ~/.npm-global`로 제거하고 nvm 쪽으로 일원화. 재발 확인: `which -a claude`가 nvm 경로 1줄이어야 정상 (업데이트했는데 버전이 안 바뀌면 이 중복부터 의심).
- **npm tarball 다운로드가 `SELF_SIGNED_CERT_IN_CHAIN`으로 실패하는 환경** (VPN/보안SW의 TLS 가로채기 추정, 간헐적). `npm view`(메타데이터)는 되는데 tgz 다운로드가 막힘. **curl은 시스템 인증서를 써서 정상 동작.**
- **업데이트 실패 시 우회 절차**: ① `npm cache ls @anthropic-ai/claude-code`로 캐시 버전 확인 → `--offline` 설치, ② 네이티브 바이너리는 `curl -fsSL -o x.tgz https://registry.npmjs.org/@anthropic-ai/claude-code-darwin-arm64/-/claude-code-darwin-arm64-<버전>.tgz`로 받아 패키지의 `node_modules/@anthropic-ai/claude-code-darwin-arm64/`에 `tar --strip-components=1`로 풀고 `install.cjs` 재실행.
- `claude doctor`(터미널)는 대화형 TUI라 Claude의 Bash에서 실행 불가. 세션 내 `/doctor`(2.1.206+, 진단→확인→수정)를 사용자가 직접 입력해야 함.
