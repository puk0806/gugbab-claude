#!/bin/sh
# wrapper-e2e.sh — gugbab-claude 실사용 시나리오 (계획서 16장)
#   실제 claude 세션을 띄워, 켜고 끈 결과가 세션 시작 정보(에이전트·커맨드·스킬·플러그인 목록)와
#   실제 동작(훅 안내)에 반영되는지, 프로젝트(폴더)끼리 설정이 섞이지 않는지 확인한다.
#
# 사용:
#   sh scripts/wrapper-e2e.sh                      설치본(~/.local/bin/gugbab-claude) 으로
#   sh scripts/wrapper-e2e.sh --dev                이 레포 작업 트리(개발 모드)로
#   sh scripts/wrapper-e2e.sh --expect-version v1.0.1   status 버전 줄까지 확인
#
# - 켜기·끄기 기록은 임시 데이터 폴더(GUGBAB_DATA)에만 쓴다 — 실제 ~/gugbab/projects 설정은 건드리지 않는다
# - 설치본 모드에서도 ~/gugbab 이 자동 업데이트되지 않게, 시작 때 "방금 확인함" 기록을 임시 데이터 폴더에 둔다
# - 시험 프로젝트는 홈 아래 임시 폴더에 만들고 끝나면 지운다 (홈 밖이면 일부 훅이 원래 허용이라 홈 아래에서 시험)
# - 시험 세션의 대화 기록(~/.claude/projects/<임시 경로를 바꾼 이름>)도 끝나면 지운다
# - 실제 claude 를 수십 번 띄우므로 몇 분 걸리고, 로그인된 Claude Code 가 필요하다
#   (GUGBAB_E2E_CLAUDE=<가짜 claude 경로> 를 주면 그 claude 로 실행 — 실패 상황에서 검사가 실패로 잡히는지 확인용)
set -u
MODE=installed; EXPECT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --dev) MODE=dev; shift ;;
    --expect-version) [ $# -ge 2 ] || { echo "--expect-version 뒤에 버전이 필요합니다" >&2; exit 2; }; EXPECT=$2; shift 2 ;;
    *) echo "모르는 옵션: $1" >&2; exit 2 ;;
  esac
done
REPO=$(cd "$(dirname "$0")/.." && pwd -P)
WORK=$(mktemp -d "$HOME/.gugbab-e2e-XXXXXX") || exit 1
WORK=$(cd "$WORK" && pwd -P)
DATA="$WORK/data"; T="$WORK/ws"
# Claude Code 는 작업 폴더 경로의 / 와 . 을 - 로 바꾼 이름으로 ~/.claude/projects 아래에 대화 기록을 둔다
TRANSCRIPT_PREFIX=$(printf '%s' "$WORK" | sed 's#[/.]#-#g')
cleanup() {
  rm -rf "$WORK"
  for d in "$HOME/.claude/projects/$TRANSCRIPT_PREFIX" "$HOME/.claude/projects/$TRANSCRIPT_PREFIX"-*; do
    [ -d "$d" ] && rm -rf -- "$d"
  done
}
trap cleanup EXIT
trap 'cleanup; trap - EXIT; exit 130' INT TERM
mkdir -p "$DATA/state" "$T"
if [ "$MODE" = dev ]; then BIN="$REPO/bin/gugbab-claude"; else BIN="$HOME/.local/bin/gugbab-claude"; fi
[ -f "$BIN" ] || { echo "gugbab-claude 를 찾지 못했습니다: $BIN" >&2; exit 2; }
# 자동 업데이트 막기 — update.js 는 마지막 확인 1시간 안이면 원격을 보지 않는다 (시나리오는 수 분)
node -e 'require("fs").writeFileSync(process.argv[1], JSON.stringify({ at: Date.now() }))' "$DATA/state/update-check.json"
# 설치본이면 채널 기록도 (버전 줄 표시 확인용)
if [ "$MODE" = installed ] && [ -f "$HOME/gugbab/state/channel.json" ]; then cp "$HOME/gugbab/state/channel.json" "$DATA/state/"; fi
FAKEBIN=""
if [ -n "${GUGBAB_E2E_CLAUDE:-}" ]; then FAKEBIN="$WORK/fakebin"; mkdir -p "$FAKEBIN"; ln -s "$GUGBAB_E2E_CLAUDE" "$FAKEBIN/claude"; fi

PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "  ✓ $1"; }
ng() { FAIL=$((FAIL+1)); echo "  ✗ $1 — 기대 $2, 실제 $3"; }
check() { if [ "$2" = "$3" ]; then ok "$1"; else ng "$1" "$2" "$3"; fi; }

# 이 스크립트를 Claude 세션 안에서 돌려도 일반 터미널과 같게 — 세션 환경변수를 뺀다
# 개발 모드면 GUGBAB_HOME 을 이 레포로, 설치본 모드면 넘기지 않는다(같은 GUGBAB_DATA 를 한 번 더 넘겨 자리만 채움)
if [ "$MODE" = dev ]; then MODEVAR="GUGBAB_HOME=$REPO"; else MODEVAR="GUGBAB_DATA=$DATA"; fi
g() { dir=$1; shift
  (cd "$dir" && env -u CLAUDECODE -u CLAUDE_CODE_ENTRYPOINT -u CLAUDE_CODE_SESSION_ID -u CLAUDE_CODE_CHILD_SESSION \
    -u CLAUDE_CODE_SESSION_ATTENDED -u CLAUDE_PID -u CLAUDE_CODE_MESSAGING_SOCKET -u CLAUDE_CODE_MESSAGING_TOKEN -u CLAUDE_CODE_EXECPATH \
    -u CLAUDE_EFFORT -u CLAUDE_PLUGIN_DATA -u CLAUDE_PROJECT_DIR -u CLAUDE_CONFIG_DIR -u GUGBAB_DEV -u GUGBAB_HOME \
    PATH="${FAKEBIN:+$FAKEBIN:}$PATH" GUGBAB_DATA="$DATA" "$MODEVAR" sh "$BIN" "$@" 2>&1); }
# 세션 시작 정보 저장: init <폴더> <이름>  →  $WORK/<이름>.json
# 세션 시작 정보(init)를 못 받으면(로그인 실패·claude 오류) 파일을 만들지 않는다 → has 가 "읽기실패" 를 돌려 검사가 실패한다
init() { rm -f "$WORK/$2.json"; g "$1" -p "ok 라고만 답해" --max-turns 1 --output-format stream-json --verbose | node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const i=s.split("\n").map(x=>{try{return JSON.parse(x)}catch{return null}}).find(x=>x&&x.subtype==="init");
if(!i||!Array.isArray(i.agents)||!Array.isArray(i.slash_commands))return;
require("fs").writeFileSync(process.argv[1],JSON.stringify({agents:i.agents,slash:i.slash_commands,skills:i.skills||[],plugins:(i.plugins||[]).map(p=>p.name)}))})' "$WORK/$2.json"; }
has() { node -e 'try{const j=require(process.argv[1]);process.stdout.write(j[process.argv[2]].includes(process.argv[3])?"있음":"없음")}catch{process.stdout.write("읽기실패")}' "$WORK/$1.json" "$2" "$3"; }
newproj() { mkdir -p "$1" && (cd "$1" && git init -q -b main && git config codex.skipReview true && echo x > README.md && git add . && GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t git commit -qm init); }
cfgof() { node -e 'const i=require(process.argv[1]);process.stdout.write(i[require("fs").realpathSync(process.argv[2])]||"")' "$DATA/projects/index.json" "$1"; }

A="$T/alpha"; B="$T/beta"; newproj "$A"; newproj "$B"

echo "== 0. 버전·상태"
st=$(g "$A" status)
check "status 가 하네스 정보를 보여 줌" 1 "$(echo "$st" | grep -c '^gugbab 하네스')"
if [ -n "$EXPECT" ]; then check "버전 줄 = $EXPECT" 1 "$(echo "$st" | grep -c "버전 *$EXPECT")"; fi

echo "== 1. 종류별 껐다 켜기 (프로젝트 alpha)"
init "$A" a0
check "기본: /commit 커맨드 있음" 있음 "$(has a0 slash commit)"
# 에이전트
g "$A" off agent:qa-engineer >/dev/null; init "$A" a1
check "에이전트 끄기 → qa-engineer 사라짐" 없음 "$(has a1 agents qa-engineer)"
g "$A" on agent:qa-engineer >/dev/null; init "$A" a2
check "에이전트 켜기 → qa-engineer 돌아옴" 있음 "$(has a2 agents qa-engineer)"
# 스킬
g "$A" on skill:axum >/dev/null; init "$A" a3
check "스킬 켜기 → axum 생김" 있음 "$(has a3 skills axum)"
g "$A" off skill:axum >/dev/null; init "$A" a4
check "스킬 끄기 → axum 사라짐" 없음 "$(has a4 skills axum)"
# 커맨드
g "$A" off command:commit >/dev/null; init "$A" a5
check "커맨드 끄기 → /commit 사라짐" 없음 "$(has a5 slash commit)"
g "$A" on command:commit >/dev/null
# 룰 (+ 필요로 하는 커맨드 같이 꺼짐, 재시작 표시)
out=$(g "$A" off rule:git.md)
check "룰 끄기 → 필요로 하는 /commit 도 꺼진다고 알림" yes "$(echo "$out" | grep -q '그것이 필요한 command:commit 도 끕니다' && echo yes || echo no)"
check "룰 끄기 → 재시작 안내(/exit)" 1 "$(echo "$out" | grep -c '/exit')"
CA=$(cfgof "$A")
check "alpha 의 설정 폴더 이름을 찾음 (아래 경로 검사의 전제)" yes "$([ -n "$CA" ] && [ -d "$DATA/projects/$CA/.claude/rules" ] && echo yes || echo no)"
check "룰 끄기 → 조립 폴더에서 git.md 링크 사라짐" no "$([ -z "$CA" ] && echo 전제실패 || { [ -e "$DATA/projects/$CA/.claude/rules/git.md" ] && echo yes || echo no; })"
g "$A" on rule:git.md >/dev/null; g "$A" on command:commit >/dev/null
# 설정 (플러그인 — 이름에 공백·한글)
g "$A" off "setting:superpowers 플러그인" >/dev/null; init "$A" a6
check "설정 끄기 → superpowers 플러그인 빠짐" 없음 "$(node -e 'process.stdout.write(require(process.argv[1]).plugins.includes("superpowers")?"있음":"없음")' "$WORK/a6.json")"
g "$A" on "setting:superpowers 플러그인" >/dev/null
# 묶음·블록
out=$(g "$A" off bundle:codex-review)
check "묶음 끄기 → 훅·룰·커맨드 3개 같이 꺼짐" 1 "$(echo "$out" | grep -c 'command:codex-review, hook:codex-review-guard, rule:codex-review.md')"
g "$A" on bundle:codex-review >/dev/null
g "$A" on block:rust >/dev/null; init "$A" a7
check "블록 켜기 → rust 에이전트 생김" 있음 "$(has a7 agents rust-backend-developer)"
g "$A" off block:rust >/dev/null
# 훅 — 실제 동작: tdd-guard 는 테스트 없는 소스를 쓰면 경고
P='바로 진행해. 확인 없이 Write 도구로 src/calc.js 파일을 만들어 add(a,b) 함수를 넣어. 그 뒤 아무것도 하지 말고 끝내.'
g "$A" off hook:tdd-guard >/dev/null; rm -rf "$A/src"
c=$(g "$A" -p "$P" --max-turns 3 --output-format stream-json --verbose | grep -c 'tdd-guard')
check "훅 끄기 → 소스 파일은 실제로 만들어짐 (아래 검사의 전제)" yes "$([ -f "$A/src/calc.js" ] && echo yes || echo no)"
check "훅 끄기 → tdd-guard 안내 없음" 0 "$c"
g "$A" on hook:tdd-guard >/dev/null; rm -rf "$A/src"
c=$(g "$A" -p "$P" --max-turns 3 --output-format stream-json --verbose | grep -c 'tdd-guard'); check "훅 켜기 → tdd-guard 안내 나옴" yes "$([ "$c" -gt 0 ] && echo yes || echo no)"
rm -rf "$A/src"
# 고정
for id in hook:bash-guard hook:claude-version-check hook:parallel-hint; do
  check "🔒 $id 끄기 거부" 1 "$(g "$A" off $id | grep -c '고정')"
done

echo "== 2. 폴더(워크스페이스) 분리"
g "$A" preset rust >/dev/null; init "$A" w1; init "$B" w2
check "alpha 에 켠 프리셋이 alpha 에만 (alpha)" 있음 "$(has w1 agents rust-backend-developer)"
check "alpha 에 켠 프리셋이 alpha 에만 (beta)" 없음 "$(has w2 agents rust-backend-developer)"
check "프로젝트마다 설정 폴더가 다름" yes "$([ "$(cfgof "$A")" != "$(cfgof "$B")" ] && [ -n "$(cfgof "$B")" ] && echo yes || echo no)"
# 같은 이름 폴더가 다른 위치에
X="$T/x/app"; Y="$T/y/app"; newproj "$X"; newproj "$Y"
g "$X" on skill:axum >/dev/null; g "$Y" status >/dev/null
check "같은 이름(app) 폴더 둘은 다른 프로젝트로" yes "$([ "$(cfgof "$X")" != "$(cfgof "$Y")" ] && echo yes || echo no)"
init "$X" x1; init "$Y" y1
check "x/app 에 켠 스킬이 y/app 엔 없음" "있음/없음" "$(has x1 skills axum)/$(has y1 skills axum)"
# 하위 폴더에서 실행해도 같은 프로젝트(git 최상위)
mkdir -p "$A/sub/deep"; g "$A/sub/deep" status >/dev/null
check "하위 폴더 → 새 프로젝트로 등록되지 않음(git 최상위 = alpha)" "없음/$CA" "$([ -n "$(cfgof "$A/sub/deep")" ] && echo 있음 || echo 없음)/$(cfgof "$A")"
init "$A/sub/deep" d1
check "하위 폴더에서 연 세션에도 alpha 설정(rust) 적용" 있음 "$(has d1 agents rust-backend-developer)"
# git 이 아닌 폴더
N="$T/plain"; mkdir -p "$N"; init "$N" n1
check "git 이 아닌 폴더도 세션 시작" 있음 "$(has n1 slash commit)"
# 동시에 두 세션 (서로 다른 설정)
init "$A" c1 & init "$B" c2 & wait
check "동시 세션: alpha 는 rust 있음 · beta 는 없음" "있음/없음" "$(has c1 agents rust-backend-developer)/$(has c2 agents rust-backend-developer)"
# 모든 프로젝트(--all) 와 프로젝트별 덮기
g "$B" on skill:sqlx --all >/dev/null; g "$A" off skill:sqlx >/dev/null; init "$A" p1; init "$B" p2
check "--all 은 beta 에 적용, alpha 는 자기 설정(끔)이 이김" "없음/있음" "$(has p1 skills sqlx)/$(has p2 skills sqlx)"
# git 공유 설정 .gugbab.json
printf '{"lock":["command:commit"],"enable":["block:python"]}\n' > "$B/.gugbab.json"; init "$B" s1; init "$A" s2
check ".gugbab.json enable → beta 만 python 에이전트" "있음/없음" "$(has s1 agents python-backend-developer)/$(has s2 agents python-backend-developer)"
check ".gugbab.json lock → beta 에서 /commit 끄기 거부" 1 "$(g "$B" off command:commit | grep -c '고정')"
rm -f "$B/.gugbab.json"

echo "== 3. 세션 안 /harness"
check "/harness preset 이 프리셋 목록을 보여 줌" 1 "$(g "$A" -p '/harness preset' --max-turns 3 | grep -c -m1 'nextjs')"
# 세션 안에서 다시 부른 gugbab-claude 의 모드 (2026-10-17 — 배포 모드 세션 안 status 가 "개발 모드 — 자동 최신화 끔" 으로 나오고
# 켜기·끄기 기록이 ~/.gugbab-dev 로 가던 버그). 설치본이면 배포 모드(stable 등), 개발 모드면 개발 모드여야 한다
NESTED=$(g "$A" -p 'Bash 로 `gugbab-claude status` 를 실행하고, 출력에서 "버전" 이 들어간 줄만 그대로 답해' --max-turns 3 --allowedTools 'Bash(gugbab-claude status)')
if [ "$MODE" = dev ]; then
  check "세션 안 gugbab-claude 가 개발 모드 그대로" 1 "$(printf '%s\n' "$NESTED" | grep -c -m1 '개발 모드')"
else
  check "세션 안 gugbab-claude 가 배포 모드 (개발 모드 아님)" "0 1" "$(printf '%s\n' "$NESTED" | grep -c '개발 모드') $(printf '%s\n' "$NESTED" | grep -c -m1 'stable\|main 채널\|고정\|브랜치')"
fi

echo ""
echo "wrapper-e2e: 성공 $PASS · 실패 $FAIL ($MODE)"
[ "$FAIL" -eq 0 ]
