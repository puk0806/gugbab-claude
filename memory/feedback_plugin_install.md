---
name: 플러그인 설치는 claude CLI로 실제 설치까지 끝낸다
description: settings.json 선언만으로는 설치 안 됨. `claude plugin marketplace add` + `claude plugin install`을 Bash로 실행해서 installed_plugins.json까지 기록시켜야 완료
type: feedback
originSessionId: 0d50be35-5012-479d-82c9-84f0edba18f5
---
플러그인 설치 요청이 오면 다음을 순차 실행한다.

**1단계: 선언을 프로젝트 scope에 추가 (의도 공유 목적)**
- `<project>/.claude/settings.json`의 `enabledPlugins`에 `"plugin@marketplace": true` 추가
- `extraKnownMarketplaces`는 프로젝트 scope에 **두지 않는다** (설치 프롬프트가 팀원에게 뜸)
- `project-install.sh` 같은 이식 스크립트 heredoc에도 `enabledPlugins`만 동기화

**2단계: 본인 머신에 실제 설치 (요청자 한정)**
- `~/.claude/settings.json`에 `extraKnownMarketplaces` + `enabledPlugins` 선언
- `claude plugin marketplace add <github-repo>` 실행 (Bash에서 가능)
- `claude plugin install <plugin>@<marketplace>` 실행
- `claude plugin list`로 `Status: enabled` 확인
- `~/.claude/plugins/installed_plugins.json`에 기록 확인

**Why:**
- `/reload-plugins` 내장 슬래시 커맨드는 **이미 등록된 마켓플레이스·플러그인을 재로드**만 한다. settings.json의 `extraKnownMarketplaces` 선언이 있어도 자동 등록하지 않음. 이전에 이걸 모르고 사용자에게 "선언만 하면 자동 등록된다"고 잘못 안내함
- `claude plugin ...` CLI는 Bash로 호출 가능 → 내가 end-to-end로 처리 가능
- 이식받는 팀원 관점에서 프로젝트 scope `enabledPlugins`만 있으면: 설치된 사람은 자동 활성화, 설치 안 된 사람은 soft warning (강제 없음)
- 본인 머신은 user-scope로 분리하면 "나만 설치, 팀원에겐 강요 안 함" 만족

**How to apply:**
- 플러그인 설치 요청 → (1) 프로젝트 scope `enabledPlugins`만 Edit, (2) user-scope에도 선언 추가, (3) `claude plugin marketplace add`와 `claude plugin install`을 Bash로 실행, (4) `claude plugin list`로 검증, (5) JSON 유효성 검증
- `/plugin install` 슬래시 커맨드는 최후 수단. Bash로 `claude plugin ...` 쓸 수 있다는 사실을 먼저 기억하기
- `extraKnownMarketplaces`를 프로젝트 scope에 넣지 않기 — 팀원에게 설치 프롬프트가 튀어나옴 (사용자가 명시적으로 원치 않음)
