---
name: build-perf-benchmarking
description: >
  hyperfine 기반 프론트엔드 빌드 시간 벤치마킹 방법론.
  warmup·runs·prepare 옵션, cold vs warm build 분리, 혼동변수 통제,
  median/p95 보고, 표준 markdown 리포트 포맷, 흔한 함정과 안티패턴을 다룬다.
  <example>사용자: "vite 빌드 최적화 PR 전후 빌드 시간을 어떻게 비교해야 정확한가?"</example>
  <example>사용자: "hyperfine으로 turborepo cold build 측정하려는데 warmup은 몇 번?"</example>
  <example>사용자: "빌드 벤치마크 결과가 매번 들쭉날쭉한데 뭘 통제해야 하지?"</example>
---

# 빌드 시간 벤치마킹 방법론 (hyperfine)

> 소스:
> - hyperfine 공식 GitHub: https://github.com/sharkdp/hyperfine
> - hyperfine man page: https://www.mankier.com/1/hyperfine
> - Vite 캐시 가이드: https://vite.dev/guide/dep-pre-bundling
> - Turborepo 캐싱 가이드: https://turborepo.dev/docs/crafting-your-repository/caching
>
> 검증일: 2026-05-14
> 대상 버전: hyperfine v1.20.0 (2025-11-18 릴리즈)

---

## 1. hyperfine이 무엇이며 왜 쓰는가

hyperfine은 sharkdp가 Rust로 작성한 CLI 벤치마킹 도구로, 임의의 shell 명령을 N회 반복 실행해 통계적 분석(평균·표준편차·min·max)과 outlier 탐지까지 수행한다. `time` 명령 대비 다음이 강점이다:

- 다회 측정 자동화 (기본 최소 10회 / 최소 3초)
- warmup·prepare·setup·cleanup 단계 분리
- 통계적 outlier 탐지 + 경고 메시지
- Markdown / JSON / CSV / AsciiDoc export

빌드 시간 측정은 단일 실행값(1회 `time pnpm build`)이 디스크 캐시·페이지 캐시·CPU 부하 상태에 따라 ±30% 이상 흔들리므로, **반드시 hyperfine 같은 다회 측정 도구로 통계 보고**해야 한다.

---

## 2. 핵심 옵션 (v1.20.0 기준)

| 옵션 | 단축 | 역할 |
|------|------|------|
| `--warmup NUM` | `-w` | 측정 전 NUM회 실행 (디스크 캐시·워밍업 목적) |
| `--runs NUM` | `-r` | 정확히 NUM회 측정 (기본: 최소 10회/3초까지 자동) |
| `--min-runs NUM` | `-m` | 최소 NUM회 보장 (기본 10) |
| `--max-runs NUM` | `-M` | 최대 NUM회 제한 (기본 무제한) |
| `--prepare CMD` | `-p` | **매 측정 직전마다** 실행 (cold build용 캐시 정리) |
| `--setup CMD` | `-s` | 명령 series **시작 시 1회만** 실행 |
| `--cleanup CMD` | `-c` | 명령 series **종료 후 1회만** 실행 |
| `--conclude CMD` | — | 매 측정 직후 실행 |
| `--export-markdown FILE` | — | 결과를 markdown 표로 출력 |
| `--export-json FILE` | — | 개별 run 시간 포함 JSON 출력 (median·times 배열 포함) |
| `--shell SHELL` | `-S` | 셸 지정 (기본: `/bin/sh`) |
| `-N` / `--shell=none` | — | 셸 없이 직접 실행 (매우 빠른 명령용) |
| `--ignore-failure` | `-i` | non-zero exit code 허용 |
| `--time-unit UNIT` | `-u` | `microsecond` / `millisecond` / `second` |
| `--show-output` | — | 명령의 stdout/stderr 그대로 출력 (디버깅용) |

> 주의: `--prepare`와 `--warmup`은 목적이 다르다. **warmup은 캐시를 채우려는 것**(warm build 측정 전 준비), **prepare는 캐시를 비우려는 것**(cold build 측정 전 매번 청소)이다. 혼동하면 측정값 의미가 정반대가 된다.

---

## 3. N회 반복 측정과 보고 방식

### 3.1 권장 측정 횟수

| 빌드 소요 시간 | 권장 `--runs` | 권장 `--warmup` |
|----------------|---------------|------------------|
| < 5초 | 30~50 | 3~5 |
| 5초 ~ 30초 | 10~20 | 2~3 |
| 30초 ~ 2분 | 10 | 1~2 |
| > 2분 | 5~10 | 1 (생략 가능) |

> 주의: hyperfine 공식 문서는 "warmup 횟수의 보편적 권장값을 명시하지 않는다". 위 표는 본 스킬의 실용 권장치이며, 빌드 시간이 길수록 측정 시간 부담 때문에 runs를 줄여야 한다. **최소 5회 미만은 통계적 의미가 약하다.**

### 3.2 보고할 통계값

hyperfine CLI 출력은 `mean ± stddev`, `min`, `max`, `Relative`까지 표시한다. **그러나 median·p95는 CLI 출력에 없으므로, `--export-json`으로 받아서 직접 계산**해야 한다.

JSON 스키마 (v1.20.0):
```json
{
  "results": [
    {
      "command": "pnpm build",
      "mean": 12.345,
      "median": 12.301,
      "stddev": 0.234,
      "min": 12.012,
      "max": 12.901,
      "user": 25.6,
      "system": 1.2,
      "times": [12.34, 12.30, 12.45, ...]   // 개별 측정값
    }
  ]
}
```

표준 보고 포맷에는 **median과 p95를 함께** 싣는다. 이유:
- `mean`은 outlier에 민감해서 단발성 thermal throttling 한 번에 흔들린다.
- `median`은 분포 중앙값으로 outlier에 robust하다.
- `p95`는 "최악에 가까운 빌드도 이 정도 시간 안에 끝난다"는 운영 SLA 관점 지표다.

p95 계산 예시 (Python):
```python
import json, numpy as np
data = json.load(open("result.json"))
times = data["results"][0]["times"]
print(f"p95 = {np.percentile(times, 95):.3f}s")
```

> 주의: hyperfine은 p95/p99를 기본 출력하지 않는다. `scripts/` 폴더에 `plot_whisker.py` 등이 있고 numpy 기반 분석이 가능하지만, p95 전용 스크립트는 공식 제공되지 않는다.

---

## 4. Cold build vs Warm build 분리

성능 PR 비교에서 가장 흔한 실수는 두 빌드를 섞어 측정하는 것이다. 반드시 분리해서 두 표를 만든다.

### 4.1 정의

| 구분 | 의미 | 측정 방법 |
|------|------|-----------|
| **Cold build** | 모든 캐시가 비워진 상태에서 처음부터 빌드 | `--prepare`로 캐시 삭제 명령을 매번 실행 |
| **Warm build** | 이전 빌드 캐시가 살아 있는 상태에서 incremental 빌드 | `--warmup`으로 캐시 채운 뒤 측정 |

### 4.2 도구별 캐시 정리 명령

| 도구 | Cold (캐시 삭제) | 비고 |
|------|------------------|------|
| **Vite** | `rm -rf node_modules/.vite dist` | `node_modules/.vite`는 pre-bundle 캐시 위치 (공식). 대안: `vite build --force` |
| **Turborepo** | `rm -rf .turbo node_modules/.cache/turbo dist` | `.turbo/cache`가 로컬 캐시 (공식). 대안: `turbo run build --force` (캐시 읽기만 비활성화, 쓰기는 유지) |
| **Next.js** | `rm -rf .next` | `.next` 폴더가 빌드 산출물 + 캐시 |
| **TypeScript (tsc)** | `rm -f tsconfig.tsbuildinfo` | incremental build info 파일 |
| **Webpack** | `rm -rf node_modules/.cache/webpack` | filesystem cache 기본 위치 |

### 4.3 hyperfine 명령 패턴

**Cold build 측정:**
```bash
hyperfine \
  --runs 10 \
  --warmup 0 \
  --prepare 'rm -rf node_modules/.vite dist .turbo' \
  --export-markdown bench-cold.md \
  --export-json bench-cold.json \
  'pnpm build'
```

**Warm build 측정:**
```bash
hyperfine \
  --runs 20 \
  --warmup 3 \
  --export-markdown bench-warm.md \
  --export-json bench-warm.json \
  'pnpm build'
```

**Before/After 비교 (같은 머신, 같은 세션 권장):**
```bash
hyperfine \
  --runs 10 \
  --warmup 2 \
  --prepare 'rm -rf node_modules/.vite dist' \
  --export-markdown bench-compare.md \
  -n 'before' 'git stash && pnpm build && git stash pop' \
  -n 'after'  'pnpm build'
```
> 주의: 위 비교 패턴은 git stash로 인한 워킹트리 전환 오버헤드가 함께 측정된다. 더 엄밀하게 하려면 별도 워크트리(`git worktree add`)로 before/after를 각각 빌드하고 결과만 markdown으로 합치는 편이 좋다.

### 4.4 Linux 페이지 캐시까지 비우는 경우 (옵션, 매우 엄격한 측정)

```bash
hyperfine \
  --prepare 'sync; echo 3 | sudo tee /proc/sys/vm/drop_caches; rm -rf node_modules/.vite dist' \
  --runs 10 \
  'pnpm build'
```

> 주의: `drop_caches`는 Linux 전용이며 sudo가 필요하다. macOS·Windows에서는 페이지 캐시를 일반 사용자가 강제 비울 수 없다. 페이지 캐시까지 통제하려면 CI 머신을 빌드마다 새로 띄우거나 docker --rm 컨테이너 안에서 측정한다.

---

## 5. 혼동변수(Confounding Variables) 명시

빌드 시간 측정 결과를 신뢰할 수 있게 하려면 다음 요소를 반드시 보고서에 명시한다. **이걸 명시하지 않은 벤치마크는 비교 불가능하다.**

### 5.1 필수 명시 항목

| 카테고리 | 항목 | 측정 방법 |
|----------|------|-----------|
| **하드웨어** | CPU 모델, 코어 수, RAM, 디스크(SSD/NVMe) | `system_profiler SPHardwareDataType` (macOS), `lscpu` (Linux) |
| **OS** | OS 버전, 커널 버전 | `uname -a`, `sw_vers` |
| **런타임** | Node.js / pnpm / Vite / Turborepo 버전 | `node -v`, `pnpm -v`, `pnpm vite --version` |
| **빌드 환경** | `NODE_ENV`, `CI` 등 env 변수 | 측정 스크립트에 echo |
| **CPU 상태** | governor / power mode | macOS: 충전 연결 + 절전모드 OFF. Linux: `cpupower frequency-info` |
| **백그라운드** | 측정 중 실행한 다른 프로세스 | "측정 중 Slack/Chrome/Docker 종료" 명시 |
| **온도** | 측정 시작 시 CPU 온도 (thermal throttling 회피) | macOS: 사전 5분 idle. 측정 도중 fan 풀가동이면 결과 무효 |

### 5.2 통제 가능한 요인 vs 통제 불가능한 요인

| 통제 가능 | 통제 어렵지만 명시 가능 | 통제 불가 (CI에서 측정) |
|-----------|------------------------|--------------------------|
| 캐시 상태 (`--prepare`) | OS 버전 | 다른 사용자의 CI 머신 부하 |
| 빌드 도구 버전 | 백그라운드 앱 | Cloud VM의 noisy neighbor |
| Env 변수 | CPU governor | OS 페이지 캐시 잔존 |
| 측정 횟수 | thermal state | macOS Spotlight 인덱싱 |

**Thermal throttling 방지 체크리스트:**
- 노트북은 충전 연결, 책상 위에 놓고 측정 (이불·무릎 금지)
- macOS는 `pmset noidle` 또는 carafeine 앱으로 sleep 방지
- 첫 측정 전 5분 idle 권장 (CPU 온도 ambient 회귀)
- runs가 길어지면 thermal throttling 진입 → outlier 증가. 이 경우 batch를 작게 쪼개 측정 간 cooldown 삽입

---

## 6. 표준 보고서 포맷

### 6.1 markdown 표 (hyperfine `--export-markdown` 그대로 활용)

hyperfine이 생성하는 기본 markdown 형식:

```markdown
| Command | Mean [s] | Min [s] | Max [s] | Relative |
|:---|---:|---:|---:|---:|
| `before: pnpm build` | 12.345 ± 0.234 | 12.012 | 12.901 | 1.18 ± 0.03 |
| `after: pnpm build`  | 10.456 ± 0.198 | 10.201 | 10.812 | 1.00 |
```

이 표를 PR description 또는 `docs/perf-reports/{YYYY-MM-DD}-{topic}.md`에 그대로 붙인다.

### 6.2 권장 확장 표 (median·p95 추가)

CLI 표는 median이 빠지므로 JSON에서 추출해 다음 표를 함께 첨부한다:

```markdown
| Command | Mean [s] | Median [s] | p95 [s] | Stddev | Runs |
|:---|---:|---:|---:|---:|---:|
| before | 12.345 | 12.301 | 12.78 | 0.234 | 10 |
| after  | 10.456 | 10.410 | 10.79 | 0.198 | 10 |
| 개선 | -15.3% | -15.5% | -15.6% | — | — |
```

### 6.3 보고서 헤더 템플릿

```markdown
# 빌드 성능 벤치마크: {주제}

- **측정일**: YYYY-MM-DD
- **측정자**: @user
- **머신**: MacBook Pro M3 Pro, 36GB RAM, macOS 14.5
- **런타임**: Node v22.11.0, pnpm v9.12.3, Vite v5.4.10
- **측정 도구**: hyperfine v1.20.0
- **runs**: 10, **warmup**: 2
- **빌드 유형**: cold build (--prepare로 .vite·dist 매번 삭제)
- **백그라운드**: Slack·Chrome·Docker 종료, 충전 연결, 5분 idle 후 측정

## 결과 (CLI 표)

{hyperfine --export-markdown 출력}

## 확장 통계 (median·p95)

{JSON에서 추출한 표}

## 혼동변수 노트

{측정 중 outlier 경고 여부, thermal throttling 의심 구간 등}
```

---

## 7. 측정 시 흔한 함정 + 안티패턴

### 7.1 함정 (Pitfalls)

1. **1회 측정으로 결론 내기** — `time pnpm build` 결과만 보고 "X% 빨라졌다" 주장. ±30% 변동 무시.
2. **warmup 없이 첫 run을 포함하기** — hyperfine은 첫 run이 유의미하게 느리면 다음 경고를 띄운다:
   > "The first benchmarking run for this command was significantly slower than the rest (...). This could be caused by filesystem caches that were not filled until after the first run. You should consider using the '--warmup' option to fill those caches before the actual benchmark. Alternatively, use the '--prepare' option to clear the caches before each timing run."
3. **cold와 warm을 한 표에 섞기** — Mean이 cold 1회 + warm 9회처럼 섞이면 의미 없는 평균이 나온다.
4. **before/after 다른 머신에서 측정** — CI 머신 변경, 노트북 ↔ 데스크톱, 다른 시간대 측정은 비교 불가.
5. **백그라운드 프로세스 미통제** — Docker·Spotlight·webpack-dev-server가 켜진 채 측정. outlier 경고:
   > "Statistical outliers were detected. Consider re-running this benchmark on a quiet PC without any interferences from other programs."
6. **thermal throttling 무시** — runs 30회 돌리는 동안 후반 5회는 throttling 상태로 측정되어 stddev가 커진다.
7. **mean만 보고 median 안 보기** — outlier 1회로 mean이 흔들렸는데 그걸로 결론.
8. **`--shell=none`을 빌드 명령에 잘못 적용** — 빌드는 셸 통한 PATH 해석·env 확장이 필요하므로 `-N` 옵션을 쓰면 안 된다. `-N`은 sub-millisecond 명령용.
9. **`--ignore-failure` 남용** — 빌드 실패가 묻혀 "10회 평균 5초"가 사실은 "10회 다 즉시 실패한 평균"인 경우.

### 7.2 안티패턴

```bash
# 안티패턴 1: 1회 측정 + time 명령
time pnpm build   # X 단발성, 분산 모름

# 안티패턴 2: warmup 0 + cold 캐시 정리도 없음
hyperfine 'pnpm build'   # X 첫 run이 cold, 나머지는 warm — 의미 불명

# 안티패턴 3: prepare 없이 --runs만 늘리기
hyperfine --runs 30 'pnpm build'   # X 두 번째부터는 turbo 캐시 hit, mean이 의미 없음

# 안티패턴 4: --shell=none을 복합 명령에 적용
hyperfine -N 'pnpm build && pnpm test'   # X &&·환경변수 해석 안 됨

# 안티패턴 5: ignore-failure로 실패 은폐
hyperfine --ignore-failure 'pnpm build'  # X 실패 빌드도 평균에 합산됨
```

### 7.3 권장 패턴 (Do)

```bash
# Do 1: warmup + prepare 명시 + export
hyperfine \
  --warmup 2 --runs 10 \
  --prepare 'rm -rf node_modules/.vite dist' \
  --export-markdown bench.md --export-json bench.json \
  -n 'cold-build' 'pnpm build'

# Do 2: cold와 warm을 별도 명령으로 분리
hyperfine --warmup 2 --runs 10 --prepare 'rm -rf dist .vite' 'pnpm build'  # cold
hyperfine --warmup 3 --runs 20 'pnpm build'                                  # warm

# Do 3: 측정 환경 echo 후 측정
echo "node=$(node -v) vite=$(pnpm vite --version)" | tee env.txt
hyperfine --warmup 2 --runs 10 'pnpm build'
```

---

## 8. 체크리스트 (PR에 빌드 성능 결과 첨부 전)

- [ ] hyperfine 버전 명시 (`hyperfine --version`)
- [ ] 측정 머신·OS·런타임 버전 명시
- [ ] cold / warm 명시 (둘 다 측정하면 더 좋음)
- [ ] warmup·runs 횟수 명시
- [ ] outlier 경고 발생 여부 보고서에 기록
- [ ] mean·median·p95 모두 표시 (median은 JSON에서 추출)
- [ ] before/after는 같은 머신·같은 세션 내 측정
- [ ] `--export-markdown` + `--export-json` 둘 다 산출하여 raw 데이터 보존
- [ ] 백그라운드 프로세스 통제 사실 명시
- [ ] thermal throttling 의심 구간 (stddev 급증) 노트

---

## 9. 참고 (hyperfine outlier 경고 메시지 원문)

> "Warning: The first benchmarking run for this command was significantly slower than the rest (...). This could be caused by (filesystem) caches that were not filled until after the first run. You should consider using the '--warmup' option to fill those caches before the actual benchmark. Alternatively, use the '--prepare' option to clear the caches before each timing run."

> "Warning: Statistical outliers were detected. Consider re-running this benchmark on a quiet PC without any interferences from other programs. It might help to use the '--warmup' or '--prepare' options."

이 경고가 뜨면 결과를 신뢰하지 말고 환경을 정리한 뒤 재측정한다.
