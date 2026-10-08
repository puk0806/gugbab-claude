---
skill: nexacro-xapi-server
category: nexacro
version: v1
date: 2026-10-08
status: APPROVED
---

# nexacro-xapi-server 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `nexacro-xapi-server` |
| 스킬 경로 | `.claude/skills/nexacro-xapi-server/SKILL.md` |
| 검증일 | 2026-10-08 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 버전 기준 | 넥사크로플랫폼 17 X-API (`com.nexacro17.xapi`), 비교 대상 14(`com.nexacro.xapi`)·N V24(`com.nexacro.java.xapi`), nexacro-xeni 17 (20200103 빌드 기준 매뉴얼) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.tobesoft.com — 17 시작 가이드, 17·N·N V24 서버 설치 가이드, 14 관리자 가이드, xeni 매뉴얼)
- [✅] 공식 GitHub 2순위 소스 확인 — 투비소프트 공식 GitHub 없음. 커뮤니티 레포 nexacro-spring/nexacro-core(Stars 10, 2017-06-19 마지막 커밋)를 낮은 신뢰도 참고로만 사용
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-10-08) — 17 계열 + N V24 Jakarta jar 정보
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (요청→응답 흐름, 행 타입, Spring 연동 2방식, xeni 설정)
- [✅] 코드 예시 작성 (공식 예제 기반 일반 예시, 특정 회사 코드·URL 미사용)
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | 17 X-API 예제(getting_started_nexacro_17_ko/d82e8b8cd262cb1a), 14 X-API 예제(getting_started_nexacro_14_en_kr/574e35f04c2e6dec, 예제 코드 원문 확보), N X-API 예제(getting_started_nexacro_n_en/225bff549bb2aad9) | 17·14·N 패키지명, HttpPlatformRequest/Response 흐름, PlatformType XML/BINARY, ErrorCode/ErrorMsg |
| 조사 | WebFetch | 서버 설치 가이드 17(4fe8e637183e9fc4), N(e11221d55800ca9f), N V24(638d458b567ddda9) | jar·라이선스 파일명·위치, JDK 요구, Jakarta jar 존재와 버전 표기 불일치(1.0.11 vs 1.0.12) |
| 조사 | WebFetch | Dataset XML 포맷 14 관리자 가이드(ea2d0a940547e4a5), XPLATFORM 관리자 가이드(ca81052fa935b86a) | Row type insert/update/delete, OrgRow, 컬럼 타입 |
| 조사 | WebFetch | xeni 매뉴얼 목차·개요(42332e9efc1e46a3)·설치(2bd820c74a15c95f)·web.xml(cdc829b8ea39fe8b)·xeni.properties(44058afeefd4a4bd)·export(df018c2cfa503067), 14 xeni 설치(9ca10fcb1b2d1aa8), 17 export 기능(80a75366180e47b2), 기술노트(067d3e071928b598) | POI 3.10-FINAL, 지원 포맷, context-param, properties 키, XExportImport URL, 14 서블릿 클래스명 |
| 조사 | WebFetch | nexacro-spring/nexacro-core 레포 페이지·커밋·pom·annotation·resolve·data/support 소스 | 클래스 구조, xapi 1.0 의존성, 행 타입 메서드 사용 흔적 |
| 교차 검증 | WebSearch | getRowType/ROW_TYPE_*/getRemovedRowCount/getSavedData, CONTENT_TYPE_SSV, VariableList getString, uiadapter, 전자정부 연동, XExportImport, Dataset XML OrgRow | 31개 클레임 → VERIFIED 21 / DISPUTED 1 / UNVERIFIED 9 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 넥사크로 17 화면 만들기(X-API) | https://docs.tobesoft.com/getting_started_nexacro_17_ko/d82e8b8cd262cb1a | ⭐⭐⭐ High | 2026-10-08 확인 | 공식, 17 패키지·jar·라이선스 |
| 넥사크로 14 X-API 서비스 예제 | https://docs.tobesoft.com/getting_started_nexacro_14_en_kr/574e35f04c2e6dec | ⭐⭐⭐ High | 2026-10-08 확인 | 공식, 예제 코드 원문 |
| 넥사크로 N X-API 서비스 예제 | https://docs.tobesoft.com/getting_started_nexacro_n_en/225bff549bb2aad9 | ⭐⭐⭐ High | 2026-10-08 확인 | 공식, `com.nexacro.java.xapi` |
| 17 서버 설치 가이드 — X-API 설치 | https://docs.tobesoft.com/server_setup_guide_nexacro_17_en_kr/4fe8e637183e9fc4 | ⭐⭐⭐ High | 2026-10-08 확인 | 공식 |
| N 서버 설치 가이드 — X-API 설치 | https://docs.tobesoft.com/server_setup_guide_nexacro_n_en/e11221d55800ca9f | ⭐⭐⭐ High | 2026-10-08 확인 | 공식, Jakarta "1.0.12" 표기 |
| N V24 서버 설치 가이드 — X-API 설치 | https://docs.tobesoft.com/server_setup_guide_nexacro_n_v24_en/638d458b567ddda9 | ⭐⭐⭐ High | 2026-10-08 확인 | 공식, Jakarta "1.0.11" 표기 |
| 17 서버 설치 가이드 — Export 기능 | https://docs.tobesoft.com/server_setup_guide_nexacro_17_en_kr/80a75366180e47b2 | ⭐⭐⭐ High | 2026-10-08 확인 | 공식, XExportImport URL |
| 14 관리자 가이드 — Dataset XML | https://docs.tobesoft.com/admin_guide_nexacro_14_en_kr/ea2d0a940547e4a5 | ⭐⭐⭐ High | 2026-10-08 확인 | 공식 |
| XPLATFORM 관리자 가이드 — Dataset XML | https://docs.tobesoft.com/admin_guide_xplatform_en/ca81052fa935b86a | ⭐⭐ Medium | 2026-10-08 확인 | 공식이나 이전 제품(OrgRow 구조 교차 확인용) |
| 14 관리자 가이드 — xeni 설치 | https://docs.tobesoft.com/admin_guide_nexacro_14_en_kr/9ca10fcb1b2d1aa8 | ⭐⭐⭐ High | 2026-10-08 확인 | 공식, 14 서블릿 클래스명 |
| nexacro-xeni 사용자 매뉴얼 | https://docs.tobesoft.com/xeni_user_manual_ko/42332e9efc1e46a3 (및 하위 2bd820c74a15c95f, cdc829b8ea39fe8b, 44058afeefd4a4bd, df018c2cfa503067) | ⭐⭐⭐ High | 2026-10-08 확인 | 공식 |
| 기술노트 — Excel Import/Export | https://docs.tobesoft.com/nexacro_technical_note_en/067d3e071928b598 | ⭐⭐⭐ High | 2026-10-08 확인 | 공식, /XExportImport·/XImport 경로 |
| 기술노트 — 연동 프레임워크 | https://docs.tobesoft.com/nexacro_technical_note_en/030675d2a1cd7706 | ⭐⭐ Medium | 2026-10-08 확인 | eGovFrame UI Adaptor 링크만 존재, 본문 없음 |
| nexacro-spring/nexacro-core | https://github.com/nexacro-spring/nexacro-core | ⭐ Low | 마지막 커밋 2017-06-19 | Stars 10, 14 계열 — 낮은 신뢰도 참고 |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 클레임 교차 검증 결과

| # | 클레임 | 판정 | 근거 소스 |
|---|--------|------|-----------|
| 1 | 17 패키지는 `com.nexacro17.xapi.data.*`·`tx.*` | VERIFIED | 17 시작 가이드 import, 17 설치 가이드 `com.nexacro17.xapi.util.JarInfo` |
| 2 | 14 패키지는 `com.nexacro.xapi.*` | VERIFIED | 14 예제 import, nexacro-core import |
| 3 | N 패키지는 `com.nexacro.java.xapi.*` | VERIFIED | N 예제 import, N V24 설치 가이드 |
| 4 | 17 jar = nexacro17-xapi + commons-logging, 라이선스 `nexacro17_server_license.xml` | VERIFIED | 17 시작 가이드, 17 설치 가이드 |
| 5 | jar는 WEB-INF/lib·classpath, 라이선스는 jar와 같은 디렉터리 우선 | VERIFIED | 17 설치 가이드, N 설치 가이드 |
| 6 | 구버전 jar 미삭제 시 잘못된 버전 적용 가능 | VERIFIED | 17 설치 가이드(검색 요약+페이지), N V24 가이드 버전 확인 절차 |
| 7 | N 계열 필수 jar에 json-simple 포함 | VERIFIED | N 설치 가이드, N V24 설치 가이드 |
| 8 | Jakarta jar 파일명 `nexacro-xapi-java-jakarta_x.x.x.jar` | VERIFIED | N 설치 가이드, N V24 설치 가이드 |
| 9 | Jakarta 지원 시작 버전 1.0.11 | DISPUTED | V24 가이드 "1.0.11", N 가이드 "1.0.12" → 두 표기 병기 + `> 주의:` |
| 10 | 요청 흐름 `new HttpPlatformRequest(request)`→`receiveData()`→`getData()`→`getDataSet(name)` | VERIFIED | 14 예제 원문, N 예제, 17 시작 가이드 |
| 11 | 응답 `new HttpPlatformResponse(response, PlatformType.CONTENT_TYPE_XML, "UTF-8")`→`setData`→`sendData` | VERIFIED | 14 예제 원문, N 예제 |
| 12 | `PlatformType.CONTENT_TYPE_BINARY`로 PlatformRequest/Response 스트림 직렬화 | VERIFIED | 14 예제 원문, 검색 결과(공식 예제 다수) |
| 13 | ErrorCode(int)/ErrorMsg(string)를 VariableList.add로 반환 | VERIFIED | 14 예제 원문, 17 시작 가이드 |
| 14 | Dataset XML 행 타입 insert/update/delete, update에 OrgRow 원래값 | VERIFIED | 14 관리자 가이드, XPLATFORM 관리자 가이드 |
| 15 | 컬럼 타입 목록·날짜 포맷, ErrorCode 음수=실패 | UNVERIFIED(단일 1순위) | 14 관리자 가이드만 — SKILL에 `> 주의:` 표기 |
| 16 | `getRowType`·`ROW_TYPE_NORMAL`·`ROW_TYPE_DELETED`·`hasSavedRow`·`getSavedData`·`getRemovedRowCount`·`getRemovedData` | UNVERIFIED | nexacro-core 소스(Low)만 — `> 주의:` 표기 |
| 17 | `ROW_TYPE_INSERTED`/`ROW_TYPE_UPDATED` 상수명 | UNVERIFIED | 소스 없음 — 상수명 미기재, `> 주의:` |
| 18 | SSV 등 기타 `PlatformType` 상수 | UNVERIFIED | 소스 없음 — `> 주의:` |
| 19 | Variable/Dataset 값 읽기 메서드(getString 등) | UNVERIFIED | 소스 없음 — `> 주의:` |
| 20 | nexacro-core: Stars 10, 마지막 커밋 2017-06-19, xapi `com.nexacro:nexacro-xapi:1.0` | VERIFIED | 레포 페이지, 커밋 페이지, pom.xml |
| 21 | nexacro-core 구성(ArgumentResolver·ReturnValueHandler·@ParamDataSet(name, required=true)·@ParamVariable·NexacroResult 메서드) | VERIFIED | 디렉터리 목록, 각 소스 원문 |
| 22 | 투비소프트 uiadapter 아키타입 좌표 | UNVERIFIED | 검색 요약만 — SKILL에서 좌표 제거, 존재만 언급 |
| 23 | 전자정부 연동 가이드 본문 | UNVERIFIED | 기술노트에 링크만 — `> 주의:` |
| 24 | Jakarta jar를 17 라이선스로 사용 가능 여부 | UNVERIFIED | 소스 없음 — `> 주의:` |
| 25 | xeni = ExportObject/ImportObject 처리 서버 모듈(WAR), POI 기반 | VERIFIED | xeni 매뉴얼, 14 xeni 설치 가이드 |
| 26 | xeni 17 매뉴얼 기준 POI 3.10-FINAL 및 동봉 라이브러리 | VERIFIED(1순위 원문 직접 확인, 버전별 상이 명시) | xeni 매뉴얼 개요 |
| 27 | 지원 포맷 xls/xlsx Export·Import, csv Import 전용, cell | VERIFIED | xeni 매뉴얼, 14 xeni 설치 가이드(xls/xlsx/csv) |
| 28 | web.xml context-param(export-path 등 7종)과 기본값 | VERIFIED | xeni 매뉴얼 web.xml, 14 xeni 설치 가이드 |
| 29 | xeni.properties 키 2종(storage, multipart.proc) | VERIFIED(1순위 원문 직접 확인) | xeni 매뉴얼 — 17 적용 여부는 `> 주의:` |
| 30 | exporturl `/nexacro-xeni/XExportImport` | VERIFIED | xeni 매뉴얼 export, 17 설치 가이드 export, 기술노트 |
| 31 | xeni 서블릿 클래스 `com.nexacro.xeni.services.GridExportImportServlet` (17 기준) | UNVERIFIED | 14 가이드에서만 확인, 17 매뉴얼은 servlet 요소 미노출 — `> 주의:` |

집계: VERIFIED 21 / DISPUTED 1 / UNVERIFIED 9 (UNVERIFIED 항목은 모두 SKILL.md에 `> 주의:` 표기 또는 제거)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (17 / 14 / N V24, Jakarta 1.0.11·1.0.12 병기)
- [✅] deprecated된 패턴을 권장하지 않음 (분석용 스킬, 신규 도입 권장 없음)
- [✅] 코드 예시가 실행 가능한 형태임 (공식 예제 기반, 가상 유틸 클래스는 명시)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 분석에 도움이 되는 수준 (레거시 분석 체크리스트 10항목)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 회사 코드·URL 미포함)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-10-08, 3문항)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (오답 없음, 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-10-08
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 미설치로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 삭제 행 처리 위치 찾기 (getRowCount 루프에 삭제가 안 보일 때)**
- ✅ PASS
- 근거: SKILL.md "5-2. Java에서 행 타입 읽기", "9. 흔한 실수", "8. 체크리스트 5번", "6-1"
- 상세: removed 버퍼 별도 존재, 공통 변환기·서비스까지 추적, "삭제 없음" 단정 금지를 정확히 제시. 메서드명이 14 계열 커뮤니티 소스 기준(17 미검증)이라는 `> 주의:`를 그대로 전달. anti-pattern(getRowCount 루프만 보고 결론) 회피.

**Q2. 17 화면 유지 + 백엔드 Spring Boot 3 이관 가능 여부**
- ✅ PASS
- 근거: SKILL.md "2. Jakarta(Spring Boot 3) 관련", "8. 체크리스트 10번", "9. 흔한 실수 마지막 행"
- 상세: Jakarta jar는 N 계열에만 존재, 17 라이선스 호환 미확인이라 벤더 확인 필요, 1.0.11/1.0.12 표기 불일치(DISPUTED)를 병기. "가능"으로 단정하지 않음(anti-pattern 회피).

**Q3. 엑셀 export 미동작 시 xeni 서버 확인 순서**
- ✅ PASS
- 근거: SKILL.md "7. nexacro-xeni" (설치 확인 -2006, 엔드포인트, context-param, xeni.properties, 지원 포맷), "2. 공통 설치 규칙", "9. 흔한 실수"
- 상세: WAR 배포·-2006 응답·XExportImport URL·라이선스 위치·구버전 jar·web.xml context-param 순으로 근거 있게 답변. 17 서블릿 클래스명·xeni.properties 17 적용 여부의 미확인 주의도 반영.

### 발견된 gap (있으면)

- Q3: 증상별 장애 진단 절차(서버 로그 위치, -2006 외 ErrorCode, 프록시·권한 이슈)는 SKILL.md에 없음 — 선택 보강 사항, 오답 유발 아님.
- Q1: 17 jar에서 삭제 행 확정 API명은 SKILL.md가 스스로 미검증으로 명시 (섹션 7 기존 항목).
- Q2: Spring Boot 3 요구 JDK 17과 X-API JDK 요구사항 연결 설명 없음 — 선택 보강.

### 판정

- agent content test: PASS (3/3 PASS)
- verification-policy 분류: 해당 없음 (개념·API 패턴 정리 스킬 — 답변 정확성으로 검증 가능, 빌드·워크플로우·설정+실행·마이그레이션 실행 스킬 아님)
- 최종 상태: APPROVED

### (참고) 사전 예정 테스트 질문 템플릿
1. "레거시 Spring 컨트롤러에서 넥사크로 17 저장 요청의 삭제 행이 어디서 처리되는지 찾는 방법은?" — 기대: removed 버퍼(getRemovedRowCount류) / 공통 변환기 확인, 단 메서드명 미검증 주의 언급
2. "17 화면을 유지한 채 백엔드를 Spring Boot 3로 옮길 수 있나?" — 기대: N 계열 Jakarta jar(1.0.11/1.0.12 표기 불일치) 존재, 17 라이선스 호환 미확인 → 벤더 확인 필요
3. "nexacro-xeni export가 동작하지 않을 때 서버에서 확인할 설정은?" — 기대: WAR 배포·라이선스 위치·XExportImport URL·web.xml context-param·설치 확인 응답(-2006)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (UNVERIFIED 9건은 주의 표기 또는 제거) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-10-08, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-10-08 완료, 3/3 PASS)
- 아래 항목은 모두 차단 요인이 아닌 선택 보강이다(SKILL.md가 `> 주의:`로 이미 미검증을 명시하고 있어 테스트 답변에서 오답을 유발하지 않았다).
- [❌] 17 X-API jar의 DataSet 행 타입 상수·removed/saved 메서드명을 javadoc 또는 실제 jar로 확인 (클레임 16·17)
- [❌] 17 xeni 배포본 web.xml에서 서블릿 클래스명 확인 (클레임 31)
- [❌] Jakarta jar(N 계열)를 17 라이선스로 사용 가능한지 투비소프트 확인 (클레임 24)
- [❌] 전자정부 표준프레임워크 UI Adaptor 가이드 본문 확인 (클레임 23)
- [❌] 투비소프트 공식 uiadapter(Spring) 문서 확보 후 6-2 절 보강 (클레임 22)
- [❌] Jakarta 지원 시작 버전 1.0.11 / 1.0.12 표기 불일치 해소 (클레임 9)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-10-08 | v1 | 최초 작성 (신규 카테고리 nexacro) | skill-creator |
| 2026-10-08 | v1 | 2단계 실사용 테스트 수행 (Q1 삭제 행 처리 위치 / Q2 Spring Boot 3 Jakarta jar 이관 / Q3 xeni export 미동작 점검) → 3/3 PASS, APPROVED 전환 | skill-tester |
