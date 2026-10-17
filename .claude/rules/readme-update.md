# README 업데이트 규칙

에이전트·스킬·훅을 추가/수정/삭제/이름변경 시 문서도 반드시 함께 업데이트한다.

> 2026-10-17 README 를 래퍼(`gugbab-claude`) 설치·사용 안내로 개편했다. README 에는 **설치·제거 명령, 기본 실행, 수(스킬·에이전트·훅·룰·커맨드)** 만 두고, 이 레포 개발 안내·하위 명령·설치 옵션은 **`docs/DEVELOPMENT.md`**, 기본값·고정 목록은 생성 문서 **`docs/DEFAULTS.md`**(`node scripts/build-defaults-doc.js`), 그 밖의 사용법(처음 실행 프리셋 고르기·`/harness`·**프리셋 표**·업데이트·버전·문제 해결)은 **`docs/USAGE.md`**,
> 항목 목록은 `docs/<종류>/README.md`, 날짜별 변경 기록은 **`docs/CHANGELOG.md`** 에 쓴다. 수·프리셋 표는 `scripts/docs-counts.test.js` 가 실제와 대조한다.

## 변경 유형별 체크리스트

| 변경 유형 | 반영 항목 |
|----------|----------------|
| **추가** | `docs/<종류>/README.md` 목록에 항목 추가, README "무엇이 들어 있나" 수 증가, `docs/CHANGELOG.md` 기록 |
| **삭제** | 목록에서 항목 제거, README 수 감소, `docs/CHANGELOG.md` 기록 |
| **이름변경** | 목록·링크를 새 이름으로 수정 |
| **이동** | 목록 링크 경로 수정 |
| **프리셋 변경** (`relations.json` `presets`) | `docs/USAGE.md` 프리셋 표 |

## 업데이트 로그 규칙 (`docs/CHANGELOG.md`)

- 날짜별 단일 행 유지
- 같은 날 여러 변경은 기존 행에 합산 (새 행 추가 금지)
- 형식: `| YYYY-MM-DD | 변경 내용 요약 |`
