# Codex 적대적 코드 리뷰 워크플로우

## 실행 조건 — 3가지 모두 충족해야 실행

코딩 작업 완료 후 다음 순서로 확인한다:

```bash
# 1. Codex CLI 설치 확인
which codex >/dev/null 2>&1 || { echo "[codex-review] codex CLI 없음 — 건너뜀"; exit 0; }

# 2. 로그인 상태 확인
codex login status 2>&1 | grep -qi "logged in" || { echo "[codex-review] codex 미로그인 — 건너뜀"; exit 0; }

# 3. 프로젝트 플러그인 활성화 확인
node -e "const s=require('./.claude/settings.json');process.exit(s.enabledPlugins?.['codex@openai-codex']?0:1)" 2>/dev/null \
  || { echo "[codex-review] codex 플러그인 비활성화 — 건너뜀"; exit 0; }
```

3가지 중 하나라도 실패 → 조용히 건너뜀 (오류 없이 계속 진행).

---

## 실행 시점

다음 코딩 작업 완료 후 조건 확인 → 리뷰 실행:

| 실행 | 건너뜀 |
|------|--------|
| 새 기능 구현 완료 | 문서만 수정 |
| 버그 수정 완료 | 설정 파일만 변경 |
| 리팩터링 완료 | 타입 이름 변경만 |
| PR 제출 전 최종 검토 | 주석만 수정 |

---

## 핵심 원칙

- Codex는 **매우 적대적인 리뷰어**로 설정: 모든 가능한 결함을 찾아내려 한다
- Claude는 **리뷰를 맹목적으로 수용하지 않는다**: 자신의 설계 의도와 근거를 기반으로 판단한다
- **ACCEPT**: 타당한 지적 → 수정 + 수용 이유 설명
- **REJECT**: 근거 없거나 설계 의도와 충돌 → 반박 이유 제시, 수정하지 않음
- **PARTIAL**: 일부만 타당 → 수용·거부 부분 각각 이유 설명
- **codex-review-guard 훅에 의해 자동 트리거된 경우**: 사용자에게 묻지 않고 Round 1부터 즉시 실행

---

## 워크플로우 (최대 3라운드)

> **리뷰 경로 (2026-07-21 정렬)**: 기본 `codex review`는 codex 내장 *일반* 리뷰 기준을 쓴다.
> 진짜 적대적 기준(아래 attack-surface)을 쓰려면 플러그인의 **`adversarial-review` 컴패니언**을 태운다.
> `codex review --uncommitted "[PROMPT]"` 병용은 v0.122.0+에서 미지원이므로, 커스텀 프롬프트 대신
> 플러그인에 내장된 적대적 프롬프트(`prompts/adversarial-review.md`)를 사용한다.
>
> **각 라운드 공통 실행** (컴패니언 경로는 설치 버전에 무관하게 동적 해석):
> ```bash
> CODEX_COMPANION=$(ls ~/.claude/plugins/cache/openai-codex/codex/*/scripts/codex-companion.mjs 2>/dev/null | sort -V | tail -1); \
>   node "$CODEX_COMPANION" adversarial-review --wait --scope working-tree 2>&1 | tee /tmp/codex-rN.txt
> ```
> 컴패니언을 못 찾으면(플러그인 구조 변경 등) 폴백으로 `codex review --uncommitted`(기본 기준)를 쓴다.

> **적대적 판정 기준 (codex `adversarial-review` 프롬프트 내장)** — codex가 이 축으로 결함을 찾는다:
> - **스탠스**: 배포를 막을 가장 강한 이유를 찾는다. happy path에서만 동작하면 그 자체가 결함. 선의·부분 수정 크레딧 없음
> - **공격 표면**: 인증·권한·테넌트 격리·신뢰 경계 / 데이터 손실·손상·비가역 상태 / 롤백·재시도·부분 실패·멱등성 / 레이스·순서 가정·재진입 / empty·null·timeout·의존성 degrade / 버전 skew·스키마 drift·마이그레이션 / 관측성 공백
> - **finding 문턱**: 스타일·네이밍·저가치 클린업 제외, 근거 있는 material finding만
> - **출력**: `needs-attention`(막을 위험) / `approve`(적대적 결함 0). 이 attack-surface는 @.claude/rules/adversarial-testing.md 의 테스트 기준과 동일 축으로 정렬됨

### Round 1 — 초기 적대적 리뷰

```bash
CODEX_COMPANION=$(ls ~/.claude/plugins/cache/openai-codex/codex/*/scripts/codex-companion.mjs 2>/dev/null | sort -V | tail -1); node "$CODEX_COMPANION" adversarial-review --wait --scope working-tree 2>&1 | tee /tmp/codex-r1.txt
```

Codex는 위 attack-surface 기준으로 결함·보안취약점·설계 약점을 찾는다. Claude는 전체 출력(`/tmp/codex-r1.txt`)을 읽어 아래를 수행한다:

**Claude의 응답:**
1. 각 지적을 분석하고 ACCEPT / REJECT / PARTIAL 판정
2. ACCEPT 항목 수정
3. 수용·거부 근거 정리 후 Round 2 실행

### Round 2 — 수정 검증 + 추가 공격

```bash
CODEX_COMPANION=$(ls ~/.claude/plugins/cache/openai-codex/codex/*/scripts/codex-companion.mjs 2>/dev/null | sort -V | tail -1); node "$CODEX_COMPANION" adversarial-review --wait --scope working-tree 2>&1 | tee /tmp/codex-r2.txt
```

Round 1 수정 후 재실행. 전체 출력(`/tmp/codex-r2.txt`) 읽어 판정한다.

**Claude의 응답:**
- Round 1에서 반박한 항목에 대한 Codex의 재반박 → 근거 재검토 후 재판정
- 새로 제기된 이슈에 대해 ACCEPT / REJECT / PARTIAL
- Round 3 실행 또는 조기 종료 판단

### Round 3 — 최종 검토 (마지막 기회)

```bash
CODEX_COMPANION=$(ls ~/.claude/plugins/cache/openai-codex/codex/*/scripts/codex-companion.mjs 2>/dev/null | sort -V | tail -1); node "$CODEX_COMPANION" adversarial-review --wait --scope working-tree 2>&1 | tee /tmp/codex-r3.txt
```

전체 출력(`/tmp/codex-r3.txt`) 읽어 최종 판정한다.

**Claude의 응답:**
- 최종 ACCEPT / REJECT 결정 (번복 없음)
- 잔존 이슈 정리

---

## 조기 종료 조건

다음 중 하나 충족 시 남은 라운드를 건너뛴다:
- Codex가 새로운 critical 이슈(bug·security·performance)를 제기하지 않음
- 모든 지적이 이전 라운드에서 이미 다뤄진 내용의 반복

---

## 최종 요약 형식

라운드 종료 후 Claude가 사용자에게 반드시 보고:

```
## Codex 리뷰 요약 ({N}라운드 완료)

### ✅ ACCEPTED (수정함)
- [이슈 요약]: [수정 내용] — 수용 이유: [근거]

### ❌ REJECTED (반박)
- [이슈 요약]: [반박 근거] — 원래 구현 유지

### ⚠️ 잔존 이슈
- [있으면 나열] / 없음
```

---

## 완료 후 마커 기록 (codex-review-guard 연동 필수)

모든 라운드가 완료되면 반드시 아래 명령을 실행한다:

```bash
touch .claude/.codex-review-done
```

이 마커가 있어야 `codex-review-guard` Stop 훅이 통과된다.
훅에 의해 자동 트리거된 경우: 마커 기록 후 세션 종료를 재시도한다.
