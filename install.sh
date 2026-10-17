#!/usr/bin/env bash
# gugbab-claude 설치 — curl -fsSL https://raw.githubusercontent.com/puk0806/gugbab-claude/main/install.sh | bash
#   옵션: --ref <브랜치|태그>  받을 버전 (브랜치면 그 브랜치를 계속 따라 업데이트 — PR 머지 전 시험용)
#         --version vX.Y.Z    그 태그로 고정 (자동 업데이트 끔)
#         --channel stable|main  업데이트 채널 (기본 stable = v* 태그 최신, 태그가 아직 없으면 main)
#         --dir PATH          설치 위치 (기본 ~/gugbab)
#         --bin-dir PATH      실행 파일 링크 위치 (기본 ~/.local/bin)
#         --yes               묻지 않고 진행 (제거 확인 포함)
#         --uninstall         링크·설치 폴더 제거 (대화 기록 ~/.claude 는 건드리지 않음)
# 계획서 3장. 받다가 끊겨 반쪽만 받아져도 실행되지 않게 전체를 main() 으로 감싸 맨 끝에서 부른다. sudo 를 쓰지 않는다
set -euo pipefail

main() {
  local repo_url="${GUGBAB_REPO_URL:-https://github.com/puk0806/gugbab-claude.git}"
  local dir="$HOME/gugbab" bin_dir="$HOME/.local/bin"
  local ref="" version="" channel="" yes="" uninstall=""

  say() { printf '[gugbab] %s\n' "$*"; }
  die() { printf '[gugbab] ✗ %s\n' "$*" >&2; exit 1; }
  # 브랜치·태그 이름 — 옵션처럼 보이는 이름(-…)·경로 조작(..)·공백·셸 문자 거부
  valid_ref() { [[ "$1" =~ ^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$ ]] && [[ "$1" != *..* ]]; }
  ask() { # ask "질문" 기본값(y|n) — curl | bash 에서는 표준입력이 스크립트라 /dev/tty 에서 읽는다
    local q=$1 def=$2 ans=""
    if [ -n "$yes" ]; then return 0; fi # --yes = 묻지 않고 진행
    if ! ( : </dev/tty ) 2>/dev/null; then [ "$def" = y ]; return; fi # CI 등 터미널 없음 → 기본값
    printf '[gugbab] %s [%s] ' "$q" "$([ "$def" = y ] && echo Y/n || echo y/N)" >/dev/tty
    IFS= read -r ans </dev/tty || ans=""
    case "$ans" in [Yy]*) return 0 ;; [Nn]*) return 1 ;; *) [ "$def" = y ] ;; esac
  }

  while [ $# -gt 0 ]; do
    case "$1" in
      --ref) [ $# -ge 2 ] || die "--ref 뒤에 브랜치·태그 이름이 필요합니다"; ref=$2; shift 2 ;;
      --version) [ $# -ge 2 ] || die "--version 뒤에 vX.Y.Z 가 필요합니다"; version=$2; shift 2 ;;
      --channel) [ $# -ge 2 ] || die "--channel 뒤에 stable 또는 main 이 필요합니다"; channel=$2; shift 2 ;;
      --dir) [ $# -ge 2 ] || die "--dir 뒤에 경로가 필요합니다"; dir=$2; shift 2 ;;
      --bin-dir) [ $# -ge 2 ] || die "--bin-dir 뒤에 경로가 필요합니다"; bin_dir=$2; shift 2 ;;
      --yes|-y) yes=1; shift ;;
      --uninstall) uninstall=1; shift ;;
      -h|--help) sed -n '2,10p' "${BASH_SOURCE[0]:-/dev/null}" 2>/dev/null || true; return 0 ;;
      *) die "모르는 옵션: $1" ;;
    esac
  done

  # 경로 검사 — 절대경로만, 홈·루트 자체 금지 (제거할 때 엉뚱한 폴더를 지우지 않게)
  case "$dir" in "~"*) dir="$HOME${dir#\~}" ;; esac
  case "$bin_dir" in "~"*) bin_dir="$HOME${bin_dir#\~}" ;; esac
  for p in "$dir" "$bin_dir"; do
    case "$p" in /*) ;; *) die "절대경로여야 합니다: $p" ;; esac
    [[ "$p" == *$'\n'* ]] && die "경로에 줄바꿈이 있습니다"
  done
  dir=${dir%/}; bin_dir=${bin_dir%/}
  [ "$dir" != "" ] && [ "$dir" != "$HOME" ] && [ "$dir" != "/" ] || die "설치 위치로 쓸 수 없는 경로입니다: ${dir:-/}"
  local link="$bin_dir/gugbab-claude"

  # 우리 설치본인지 — git 저장소 + bin/gugbab-claude + cli/main.js
  is_ours() { [ -d "$1/.git" ] && [ -f "$1/bin/gugbab-claude" ] && [ -f "$1/cli/main.js" ]; }

  if [ -n "$uninstall" ]; then
    if [ -L "$link" ]; then
      case "$(readlink "$link")" in
        "$dir/bin/gugbab-claude") rm -f "$link"; say "링크 제거: $link" ;;
        *) say "⚠ $link 는 다른 곳을 가리켜 두었습니다: $(readlink "$link")" ;;
      esac
    fi
    if [ -e "$dir" ]; then
      is_ours "$dir" || die "$dir 는 gugbab 설치 폴더가 아니라 지우지 않습니다"
      if ask "$dir 를 지울까요? (프로젝트별 켜기·끄기 설정 projects/·profile.json 도 함께 지워집니다. 대화 기록 ~/.claude 는 그대로)" n; then
        rm -rf -- "$dir"; say "삭제: $dir"
      else
        say "설치 폴더는 남겨 두었습니다: $dir"
      fi
    fi
    say "제거를 마쳤습니다"
    return 0
  fi

  # 필수 도구
  command -v git >/dev/null 2>&1 || die "git 이 필요합니다 — macOS: xcode-select --install"
  command -v node >/dev/null 2>&1 || die "node 18 이상이 필요합니다 — https://nodejs.org 또는 nvm"
  local major; major=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
  [ "$major" -ge 18 ] 2>/dev/null || die "node 18 이상이 필요합니다 (지금 $(node -v 2>/dev/null || echo 없음))"
  command -v claude >/dev/null 2>&1 || say "⚠ claude 를 찾지 못했습니다 — Claude Code 를 먼저 설치하세요 (설치는 계속합니다)"

  [ -z "$ref" ] || valid_ref "$ref" || die "브랜치·태그 이름이 올바르지 않습니다: $ref"
  if [ -n "$version" ]; then [[ "$version" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "--version 은 vX.Y.Z 형식이어야 합니다: $version"; fi
  case "$channel" in ""|stable|main) ;; *) die "--channel 은 stable 또는 main 입니다: $channel" ;; esac

  # 받기 / 이미 있으면 갱신
  if [ -e "$dir" ] && ! is_ours "$dir"; then
    die "$dir 가 이미 있고 gugbab 설치본이 아닙니다 — 다른 위치는 --dir 로"
  fi
  if [ ! -e "$dir" ]; then
    say "받는 중: $repo_url → $dir"
    mkdir -p "$(dirname "$dir")"
    git clone --quiet -- "$repo_url" "$dir" || die "받기 실패 (네트워크·주소 확인): $repo_url"
  else
    say "이미 설치되어 있어 갱신합니다: $dir"
    [ -z "$(git -C "$dir" status --porcelain --untracked-files=no)" ] || die "$dir 에 로컬 변경이 있어 갱신하지 않습니다 (직접 수정 금지 폴더)"
    git -C "$dir" fetch --quiet --tags --force origin || die "갱신 실패 (네트워크 확인)"
  fi

  # 무엇을 꺼낼지 + 업데이트 채널 기록 (state/channel.json — cli/main.js 가 읽음)
  local target label chan_json
  latest_tag() { git -C "$dir" tag --list 'v*' | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sed 's/^v//' | sort -t. -k1,1n -k2,2n -k3,3n | tail -1 | sed 's/^./v&/'; }
  if [ -n "$version" ]; then
    git -C "$dir" rev-parse --verify --quiet "refs/tags/$version^{commit}" >/dev/null || die "태그가 없습니다: $version"
    target="refs/tags/$version"; label=$version; chan_json="{\"channel\":\"stable\",\"pin\":\"$version\"}"
  elif [ -n "$ref" ]; then
    if git -C "$dir" rev-parse --verify --quiet "refs/remotes/origin/$ref^{commit}" >/dev/null; then
      target="refs/remotes/origin/$ref"; label="브랜치 $ref"; chan_json="{\"channel\":\"branch\",\"branch\":\"$ref\"}"
    elif git -C "$dir" rev-parse --verify --quiet "refs/tags/$ref^{commit}" >/dev/null; then
      target="refs/tags/$ref"; label="태그 $ref"; chan_json="{\"channel\":\"stable\",\"pin\":\"$ref\"}"
    else
      die "원격에 그런 브랜치·태그가 없습니다: $ref"
    fi
  else
    local tag; tag=$(latest_tag || true)
    if [ "$channel" != main ] && [ -n "$tag" ]; then
      target="refs/tags/$tag"; label="stable $tag"; chan_json='{"channel":"stable"}'
    else
      [ "$channel" = main ] || say "아직 안정 버전 태그(v*)가 없어 main 을 받습니다"
      target="refs/remotes/origin/main"; label="main"; chan_json='{"channel":"main"}'
    fi
  fi
  local sha; sha=$(git -C "$dir" rev-parse "$target^{commit}")
  case "$chan_json" in
    *'"branch"'*|*'"main"'*)
      local br; br=${ref:-main}
      git -C "$dir" checkout --quiet -B "$br" "$sha" ;;
    *) git -C "$dir" checkout --quiet --detach "$sha" ;;
  esac
  mkdir -p "$dir/state"
  printf '%s\n' "$chan_json" > "$dir/state/channel.json"
  is_ours "$dir" || die "받은 버전에 래퍼(bin/gugbab-claude)가 없습니다 — 래퍼가 들어간 브랜치·태그를 --ref 로 고르세요"
  chmod +x "$dir/bin/gugbab-claude"

  # 실행 파일 링크
  mkdir -p "$bin_dir"
  if [ -e "$link" ] && [ ! -L "$link" ]; then
    die "$link 가 일반 파일로 이미 있습니다 — 확인 후 지우고 다시 실행하세요"
  fi
  ln -sfn "$dir/bin/gugbab-claude" "$link"
  say "링크: $link → $dir/bin/gugbab-claude"

  say "설치 완료: $label ($(git -C "$dir" rev-parse --short HEAD))"
  case ":$PATH:" in
    *":$bin_dir:"*) ;;
    *) say "⚠ $bin_dir 가 PATH 에 없습니다 — 셸 설정(~/.zshrc 등)에 아래 한 줄을 넣고 새 터미널을 여세요"
       printf '    export PATH="%s:$PATH"\n' "$bin_dir" ;;
  esac
  say "점검:"
  "$dir/bin/gugbab-claude" doctor || say "⚠ 점검에서 문제가 보였습니다 — 위 내용을 확인하세요"
  say "이제 프로젝트 폴더에서 gugbab-claude 로 실행하세요 (켜기·끄기: 세션 안 /harness · 터미널 gugbab-claude harness)"
}

main "$@"
