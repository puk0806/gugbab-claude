# nexacro-screen-analyzer

> 넥사크로 17 화면(.xfdl)별 Dataset·transaction·Grid 기능·팝업·공통 함수 의존을 뽑고 마이그레이션 난이도를 매겨 화면 인벤토리와 전환 웨이브 계획을 만드는 분석 에이전트

| 항목 | 내용 |
|------|------|
| 파일 | `.claude/agents/domain/nexacro-screen-analyzer.md` |
| 모델 | Sonnet (maxTurns 30) |
| 도구 | Read, Glob, Grep, Bash, Write |
| 호출 | 사용자 직접 호출 (마이그레이션 착수 전 인벤토리) |
| 템플릿 | nexacro(15) |

## 산출물

`docs/migration/` 아래 screen-inventory · grid-features(AG Grid Enterprise 필요 화면 표시) · common-deps · waves

## 함께 쓰는 자산

`nexacro-17-xfdl-anatomy`(파일 구조·API), `nexacro-to-react-mapping`(대응 규칙·Enterprise 경계) 스킬. 화면 상세 명세는 `legacy-spec-extractor`(spec-extraction 템플릿 함께 설치 시), 변환은 `nexacro-screen-converter`.

## 설계 근거

- 넥사크로→React 자동 변환 공식 도구가 없고(투비소프트 마이그레이션 마법사는 14→17/N용, "완벽 보장 불가") 화면을 규칙 기반으로 재작성해야 하므로, 착수 전 화면 인벤토리·난이도·웨이브 계획이 필요하다
- 점진 전환(Strangler Fig) — martinfowler.com/bliki/StranglerFigApplication.html
- 난이도 기준은 예시이며 프로젝트에서 조정하고 문서에 기록한다
