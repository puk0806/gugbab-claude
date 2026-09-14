---
skill: korean-lunar-calendar-manseryeok
category: backend
version: v1
date: 2026-09-10
status: PENDING_TEST
---

# 스킬 검증 문서 — korean-lunar-calendar-manseryeok

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `korean-lunar-calendar-manseryeok` |
| 스킬 경로 | `.claude/skills/backend/korean-lunar-calendar-manseryeok/SKILL.md` |
| 검증일 | 2026-09-10 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 소스 유형 | 혼합 — 공식 기관 데이터(KASI·공공데이터포털) + 오픈소스 라이브러리 + 전통 방법론(명리 관법) |

### 실사용 필수 스킬 분류 사유

이 스킬은 `verification-policy.md`의 **"실사용 필수 스킬"** 에 해당하므로 content test만으로 APPROVED 전환하지 않는다.

**사유:**
1. 스킬의 최종 산출물이 **계산 결과값**(음력 날짜·60갑자·절입 시각 비교 결과)이며, 정확성은 **KASI 공식 데이터와의 대조 실행 결과**로만 검증 가능하다. 답변의 논리적 타당성만으로는 하루/한 시진 오차를 잡아낼 수 없다.
2. §4-0의 KASI `lunSecha`/`lunWolgeon` 기준(음력 기준 vs 입춘·절기 기준) 항목이 **UNVERIFIED**로 남아 있어, 실제 API 응답 확인 후에만 확정 가능하다.
3. 특일정보 24절기 API의 절입 시각 포함 여부가 **DISPUTED**이며, 실제 응답 1건 수신으로만 해소된다.
4. SKILL.md §8 T-3(런타임 tzdata의 1970년 이전 전이 데이터 보존 여부)은 **배포 환경에서 실행해야만** 판정 가능하다.

→ 실제 사주 계산 모듈 구현 후 T-1 ~ T-14 회귀 테스트를 통과시키고, 위 UNVERIFIED/DISPUTED 항목을 해소한 뒤 APPROVED로 전환한다.

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (KASI 천문우주지식정보 / 공공데이터포털 음양력·특일 정보 API)
- [✅] 공식 GitHub 2순위 소스 확인 (usingsky/korean_lunar_calendar_py, 6tail/lunar-python, yuangu/sxtwl_cpp)
- [✅] 최신 버전 기준 내용 확인 (2026-09-10 — `korean-lunar-calendar` 0.4.0 / `lunar-python` 1.4.8 / `sxtwl` 2.0.7)
- [✅] 패키지 레지스트리 실측 (npm registry JSON, PyPI JSON API로 버전·배포일·라이선스 확인)
- [✅] 방법론(명리 관법) 소스 조사 — 절기 기준 월주, 입춘 기준 연주, 야자시/조자시, 월두법/시두법
- [✅] 표준·천문 데이터 조사 — 태양 황경 기준 24절기, 균시차 범위, 한국 표준시 변천, 서머타임 이력
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (시각 보정 파이프라인 6단계, 결과 스키마)
- [✅] 코드 예시 작성 (zoneinfo 기반 절대시각 확정, 월두법·시두법 인덱스 식, 결과 JSON 스키마)
- [✅] 흔한 실수 패턴 정리 (12항목 체크리스트 + 불일치 진단 순서 6단계)
- [✅] 적대적/경계 테스트 케이스 설계 (T-1 ~ T-14, 정상·경계·이상입력·악성입력 4계층)
- [✅] SKILL.md 파일 작성
- [✅] verification.md 작성
- [✅] skill-tester 2단계 테스트 — 2026-09-10 완료, 3/3 PASS (§5 참조)
- [❌] README.md / docs/skills/README.md 갱신 — **병렬 작업 충돌 방지를 위해 메인 세션이 일괄 수행**

---

## 2. 실행 에이전트 로그

> 모든 사실 진술은 아래 WebSearch / WebFetch 조사 결과에서 유래한다. 확인에 실패한 항목은 SKILL.md 본문에 `> 주의:` 로 명시했다.

| # | 단계 | 도구 | 입력 요약 | 출력 요약 |
|---|------|------|-----------|-----------|
| 0a | 사전 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확보 |
| 0b | 사전 확인 | Glob | `.claude/skills/**/korean-lunar*/SKILL.md` | 중복 스킬 없음 확인 |
| 1 | 조사 | WebSearch | "한국천문연구원 KASI 음양력 정보 API 공공데이터포털 지원 연도 범위" | KASI Open API 6종 존재, 음양력 입력범위 1391-02-05~2050-12-31 단서 확보 |
| 2 | 조사 | WebSearch | "korean-lunar-calendar npm python usingsky supported year range" | usingsky 저장소 3종(py/js/java), 범위 1000~2050 단서 |
| 3 | 조사 | WebFetch | `data.go.kr/data/15012679/openapi.do` | API 명칭·제공기관·오퍼레이션 4종·엔드포인트 확인. 연도범위는 불명확 |
| 4 | 조사 | WebFetch | `github.com/usingsky/korean_lunar_calendar_py` | 범위 음력 1000-01-01~2050-11-18 / 양력 1000-02-13~2050-12-31, 메서드 6종, 간지 지원 확인 |
| 5 | 조사 | WebFetch | `astro.kasi.re.kr/information/pageView/31` | **HTTP 500 — 접근 실패.** 대체 소스로 우회 |
| 6 | 조사 | WebSearch | "대한민국 표준시 변경 이력 1908/1912/1954/1961" | 오프셋 4구간 + 서머타임 3그룹 연도 확보 |
| 7 | 조사 | WebFetch | `ko.wikipedia.org/wiki/한국_표준시` | 오프셋 이력 표 + 서머타임 시행 기간(1987 5.10~10.11, 1988 5.08~10.09) |
| 8 | 교차 검증 | WebSearch | "IANA tz database Asia/Seoul DST 1948~1988" | 연도 그룹 재확인 (1948~51, 1955~60, 1988) |
| 9 | 교차 검증 | WebFetch | `ftp.iana.org/tz/tzdb-2019b/asia` | **본문 잘림 — Korea 섹션 미도달.** 실패 |
| 10 | 교차 검증 | WebFetch | `raw.githubusercontent.com/eggert/tz/main/asia` | **본문 잘림 — Korea 섹션 미도달.** 실패 |
| 11 | 교차 검증 | WebFetch | `en.wikipedia.org/wiki/Time_in_South_Korea` | 오프셋 4구간 독립 확인, 1988 DST 5.8~10.9 및 GMT+10 확인 |
| 12 | 교차 검증 | WebFetch | `timeanddate.com/time/zone/south-korea/seoul` | **HTTP 403 — 접근 실패** |
| 13 | 조사 | WebSearch | "사주 월주 절기 기준 입춘 연주 경계 절입시각" | 연주=입춘 절입, 월주=12절 절입, KASI 역서에 절입시각 수록 확인 |
| 14 | 조사 | WebSearch | "사주 야자시 조자시 논쟁 자시 23시" | 정자시 vs 야자시/조자시 관법 차이, 미결 논쟁 확인 |
| 15 | 조사 | WebSearch | "진태양시 보정 균시차 서울 경도 135도 30분 보정" | 경도 보정 개념, 유파별 3입장 갈림 확인 |
| 16 | 교차 검증 | WebFetch | `registry.npmjs.org/korean-lunar-calendar` | 0.4.0 / 2026-06-15T13:23:41Z / MIT / 무의존성 |
| 17 | 교차 검증 | WebFetch | `pypi.org/project/korean-lunar-calendar/` | 0.4.0 / 2026-06-15 / MIT / 범위·메서드 재확인 |
| 18 | 교차 검증 | WebFetch | `pypi.org/pypi/korean-lunar-calendar/json` | 전체 릴리스 이력(0.1.0 2018 ~ 0.4.0 2026-06-15T14:19:56), 저자 usingsky |
| 19 | 조사 | WebFetch | `data.go.kr/data/15012690/openapi.do` | 특일정보 API 오퍼레이션 5종(24절기 포함), 엔드포인트 확인 |
| 20 | 교차 검증 | WebSearch | "KASI 음양력 API 입력범위 1391년 2월 5일 2050년" | **1391-02-05 ~ 2050-12-31 및 1582 율/그레 경계 교차 확인** |
| 21 | 조사 | WebSearch | "lunar-python 6tail sxtwl 寿星天文历 정확도" | sxtwl 천문알고리즘 기반 BC722~9999, lunar-python 기능 범위 확인 |
| 22 | 교차 검증 | WebFetch | `pypi.org/pypi/sxtwl/json` | 2.0.7 / BSD / 갱신 빈도 낮음 |
| 23 | 교차 검증 | WebFetch | `pypi.org/pypi/lunar-python/json` | 1.4.8 / MIT / 2025-11-05 |
| 24 | 교차 검증 | WebFetch | `kasi.readthedocs.io/.../LrsrCldInfoService` | 오퍼레이션 4종 + 응답 필드(lunSecha/lunWolgeon/lunIljin/solJd), 범위 1391-02-05~2050-12-31 **재확인** |
| 25 | 교차 검증 | WebSearch | "특일정보 24절기 get24DivisionsInfo 응답 항목 절기 시각" | 절입 시각 포함 여부 **진술 충돌 발견** |
| 26 | 교차 검증 | WebFetch | `github.com/distbe/holidays` | 파생 데이터셋: 절기 시각(HH:mm)·태양경도 포함 주장, 2004~차년, 일 1회 자동 갱신 |
| 27 | 교차 검증 | WebFetch | `holidays.dist.be/2026.json` | **HTTP 403 — 실제 필드 확인 실패.** DISPUTED 유지 |
| 28 | 교차 검증 | WebFetch | `data.kma.go.kr/climate/solarTerms/solarTerms.do` | 기상청 24절기 페이지 — **날짜만 제공, 시각 없음** |
| 29 | 조사 | WebFetch | `astro.kasi.re.kr/life/pageView/8` | 음양력 변환 웹도구 범위 -59년 02월 13일 ~ 2050-12-31, 1582 경계 명시 |
| 30 | 교차 검증 | WebFetch | `astro.kasi.re.kr/life/pageView/5` | 월별 음양력 — 입력범위 -59년 02월 ~ 2050년 12월, 절기 시각 미표시 |
| 31 | 조사 | WebSearch | "24절기 태양황경 입춘 315도 경칩 345도 절기/중기 구분" | 황경 15° 간격, 절(홀수 황경)=월주 경계 / 중기(짝수 황경)=음력 윤달 판정 |
| 32 | 조사 | WebSearch | "오호둔 년상기월법 오서둔 갑기지년 병인두" | 갑기지년 병인두 확인 → 월두법 식 검산 |
| 33 | 교차 검증 | WebFetch | `doc.8-codes.com/docs/lecture/02/` | 연주=입춘 전환, 월주=12절 전환, 일주 23시 전환 입장 확인 |
| 34 | 교차 검증 | WebSearch | "균시차 범위 +16분33초 -14분06초" | 균시차 극값 및 발생 시기 확인 |
| 35 | 교차 검증 | WebSearch | "KASI 역서 24절기 절입시각 한국표준시 기준" | **역서 절입시각 = 서울 국가기준점·한국 표준시 기준** 확인 |
| 36 | 교차 검증 | WebSearch | "KASI 세차/월건/일진 음력 기준 vs 입춘 기준" | 용어 정의만 확인, **기준 시점 확정 실패 → UNVERIFIED 처리** |
| 37 | 작성 | Write | SKILL.md (11개 섹션), verification.md (8개 섹션) | 산출물 2종 생성 |

**집계:** WebSearch 16회 / WebFetch 20회 / Read 1회 / Glob 1회.
접근 실패 5건(KASI Open API 안내 HTTP 500, timeanddate HTTP 403, npmjs.com 웹 HTTP 403, holidays.dist.be HTTP 403, tzdb `asia` 원문 본문 잘림 2회)은 대체 소스로 우회하거나 미검증으로 표기했다.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 공공데이터포털 — 한국천문연구원 음양력 정보 | https://www.data.go.kr/data/15012679/openapi.do | ⭐⭐⭐ High | 2026-09-10 | 1순위 공식. 오퍼레이션·엔드포인트 확인 |
| 공공데이터포털 — 한국천문연구원 특일 정보 | https://www.data.go.kr/data/15012690/openapi.do | ⭐⭐⭐ High | 2026-09-10 | 1순위 공식. 24절기 오퍼레이션 확인 |
| KASI 생활천문관 — 음양력 변환 | https://astro.kasi.re.kr/life/pageView/8 | ⭐⭐⭐ High | 2026-09-10 | 범위 -59년~2050년, 1582 율/그레 경계 |
| KASI 생활천문관 — 월별 음양력 | https://astro.kasi.re.kr/life/pageView/5 | ⭐⭐⭐ High | 2026-09-10 | 입력범위 재확인 |
| KASI Open API 안내 | https://astro.kasi.re.kr/information/pageView/31 | ⭐⭐⭐ High | 2026-09-10 | **HTTP 500 — 직접 접근 실패.** 검색 스니펫·미러 문서로 우회 |
| kasi (LrsrCldInfoService 래퍼 문서) | https://kasi.readthedocs.io/en/latest/autoapi/kasi/LrsrCldInfoService/index.html | ⭐⭐ Medium | 2026-09-10 | 응답 필드·범위 교차 확인용 |
| usingsky/korean_lunar_calendar_py | https://github.com/usingsky/korean_lunar_calendar_py | ⭐⭐⭐ High | 2026-09-10 | 라이브러리 공식 저장소 |
| PyPI korean-lunar-calendar (JSON API) | https://pypi.org/pypi/korean-lunar-calendar/json | ⭐⭐⭐ High | 2026-09-10 | 버전·배포일·라이선스 실측 |
| npm registry korean-lunar-calendar | https://registry.npmjs.org/korean-lunar-calendar | ⭐⭐⭐ High | 2026-09-10 | 버전·배포일 실측 (npmjs.com 웹은 403) |
| 6tail/lunar-python | https://github.com/6tail/lunar-python | ⭐⭐⭐ High | 2026-09-10 | 기능 범위 확인. 시간대 명시 없음 |
| PyPI lunar-python (JSON API) | https://pypi.org/pypi/lunar-python/json | ⭐⭐⭐ High | 2026-09-10 | 1.4.8 / 2025-11-05 / MIT |
| yuangu/sxtwl_cpp | https://github.com/yuangu/sxtwl_cpp | ⭐⭐ Medium | 2026-09-10 | 천문알고리즘 기반, BC722~9999 표방 |
| PyPI sxtwl (JSON API) | https://pypi.org/pypi/sxtwl/json | ⭐⭐⭐ High | 2026-09-10 | 2.0.7 / BSD / 갱신 빈도 낮음 |
| IANA Time Zone Database | https://www.iana.org/time-zones | ⭐⭐⭐ High | 2026-09-10 | 표준 소스. **원문 `asia` 파일 Korea 섹션 fetch 실패(본문 잘림)** |
| 위키백과 — 한국 표준시 | https://ko.wikipedia.org/wiki/%ED%95%9C%EA%B5%AD_%ED%91%9C%EC%A4%80%EC%8B%9C | ⭐⭐ Medium | 2026-09-10 | 오프셋 이력·서머타임 기간 |
| Wikipedia — Time in South Korea | https://en.wikipedia.org/wiki/Time_in_South_Korea | ⭐⭐ Medium | 2026-09-10 | 오프셋 이력 독립 교차 확인, 1988 DST GMT+10 |
| 위키백과 — 균시차 | https://ko.wikipedia.org/wiki/%EA%B7%A0%EC%8B%9C%EC%B0%A8 | ⭐⭐ Medium | 2026-09-10 | 극값 +16분33초 / −14분06초 |
| 위키백과 — 절기 | https://ko.wikipedia.org/wiki/%EC%A0%88%EA%B8%B0 | ⭐⭐ Medium | 2026-09-10 | 황경 15° 간격, 절/중기 구분 |
| 기상자료개방포털 — 24절기 | https://data.kma.go.kr/climate/solarTerms/solarTerms.do | ⭐⭐⭐ High | 2026-09-10 | 공공기관. **날짜만 제공, 시각 없음** 확인 |
| distbe/holidays | https://github.com/distbe/holidays | ⭐⭐ Medium | 2026-09-10 | 특일정보 API 파생 데이터셋. 절기 시각 포함 주장(원본 JSON 403으로 미확증) |
| 정해 만세력 문서 — 육십갑자와 연월일시 | https://doc.8-codes.com/docs/lecture/02/ | ⭐⭐ Medium | 2026-09-10 | 명리 관법(연주=입춘, 월주=12절) 확인 |
| timeanddate — Seoul time zone | https://www.timeanddate.com/time/zone/south-korea/seoul | — | 2026-09-10 | **HTTP 403 — 접근 실패.** 미사용 |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 핵심 클레임 교차 검증 판정

| # | 클레임 | 독립 소스 수 | 판정 | 처리 |
|---|--------|:---:|:---:|---|
| C-01 | KASI 음양력 Open API 입력범위 = 1391-02-05 ~ 2050-12-31 | 3 | **VERIFIED** | SKILL §1-2 그대로 기재 |
| C-02 | KASI 웹 음양력 변환 도구 범위 = -59년 02월 ~ 2050년 12월 (API보다 넓음) | 2 | **VERIFIED** | §1-2에 API 범위와 구분해 기재 |
| C-03 | KASI 기준 1582-10-04까지 율리우스력, 10-05부터 그레고리력 | 2 | **VERIFIED** | §1-3 기재 + 프롤렙틱 그레고리력 주의 추가 |
| C-04 | `korean-lunar-calendar` 최신 0.4.0, 2026-06-15 배포, MIT, 무의존성 | 3 | **VERIFIED** | §7-2 기재 |
| C-05 | 동 라이브러리 범위 = 음력 1000-01-01~2050-11-18 / 양력 1000-02-13~2050-12-31 | 2 | **VERIFIED** | §1-2·§7-2 기재 |
| C-06 | `lunar-python` 1.4.8 / 2025-11-05 / MIT, 절기·八字 지원 | 2 | **VERIFIED** | §7-2 기재 |
| C-07 | `sxtwl` 2.0.7 / BSD / 천문알고리즘 기반 장기범위 | 2 | **VERIFIED** | §7-2 기재. 갱신 빈도 낮음 경고 부기 |
| C-08 | 사주 연주는 입춘 절입 시각에 전환 (음력 설·1월 1일 아님) | 3 | **VERIFIED** | §2-1 기재 |
| C-09 | 월주는 12개 "절(節)" 절입 시각 기준 (중기 무관, 음력 초하루 아님) | 3 | **VERIFIED** | §2-2 표로 기재 |
| C-10 | 24절기 = 황경 15° 간격, 입춘 315°·경칩 345°·청명 15° | 2 | **VERIFIED** | §2-2 표에 황경 병기 |
| C-11 | 한국 표준시 오프셋 이력 4구간 (1908 +8:30 / 1912 +9 / 1954 +8:30 / 1961 +9) | 3 | **VERIFIED** | §4-1 표로 기재 |
| C-12 | 서머타임 실시 연도군 = 1948~1951, 1955~1960, 1987, 1988 / 1988은 5.8~10.9, GMT+10 | 3 | **VERIFIED** | §4-2 기재 |
| C-13 | 1948~1951·1955~1960·1987의 **연도별 정확한 시작·종료 일자** | 소스 간 표기 상이, tzdb 원문 fetch 2회 실패 | **UNVERIFIED** | §4-2에 `> 주의:` 로 미확정 명시 + "하드코딩 금지, tzdb를 단일 진실 공급원으로" 지침 |
| C-14 | 균시차 극값 = +16분 33초(11월 초) / −14분 06초(2월 12일경) | 2 | **VERIFIED** | §5-2 기재 |
| C-15 | KASI 역서의 24절기 절입 시각은 서울 국가기준점·한국 표준시(UTC+9) 기준 | 2 | **VERIFIED** | §7-1 기재. 중국권 라이브러리 UTC+8 표기와의 1시간 차 경고 근거 |
| C-16 | 특일정보 API 24절기 응답에 절입 "시각"이 포함되는가 | (A) 날짜만 / (B) 시각·황경 포함 — 진술 충돌, 파생 JSON 원문 403 | **DISPUTED** | §7-1에 `> 주의(DISPUTED):` 로 양측 진술 병기 + "실제 응답 1건 확인 후 결정" 지침 |
| C-17 | KASI `lunSecha`/`lunWolgeon`이 음력 기준이라 사주 연주·월주와 다르다 | 1 (용어 정의만 확인, 기준 시점 미확인) | **UNVERIFIED** | §7-1에 `> 주의(미검증)` 표기 + 확인 절차 2개 제시. 단정 표현 회피 |
| C-18 | 야자시/조자시 vs 정자시 — 23시대 일주 판정 논쟁, 미결 | 2 | **VERIFIED** | §6 표로 양측 병기, 설정 노출 요구사항 기재 |
| C-19 | 월두법(오호둔) — 갑기지년 병인두 / 무계지년 갑인두 | 2 (검색 + 식 검산 6케이스) | **VERIFIED** | §2-2 공식 + 검산 결과 기재 |
| C-20 | 시두법(오서둔) — 갑기일 갑자시 | 2 (검색 + 식 검산) | **VERIFIED** | §2-4 공식 기재 |
| C-21 | 일진 JDN 앵커 상수 값 | 공신력 있는 원문 확인 실패 | **UNVERIFIED → 본문에서 제거** | 상수를 기재하지 않고, KASI `lunIljin` 캘리브레이션 테스트로 확정하라는 지침으로 대체 |

**집계: VERIFIED 16 / DISPUTED 1 / UNVERIFIED 3 (그중 1건은 본문에서 제거)**

> DISPUTED·UNVERIFIED 항목은 전부 SKILL.md 본문에 `> 주의:` 블록으로 표기했고, 각각 **해소 방법(무엇을 어떻게 확인하면 되는지)** 을 함께 기재했다.

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (불확실 항목은 DISPUTED/미검증으로 명시)
- [✅] 버전 정보가 명시되어 있음 (`korean-lunar-calendar` 0.4.0, `lunar-python` 1.4.8, `sxtwl` 2.0.7)
- [✅] deprecated된 패턴을 권장하지 않음 (오프셋 하드코딩 대신 tzdb 사용, 앵커 상수 복사 금지)
- [✅] 코드 예시가 실행 가능한 형태임 (`zoneinfo` 예제, 인덱스 산식, 결과 JSON 스키마)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description, `user-invocable: false`)
- [✅] 소스 URL과 검증일 명시 (헤더 + SKILL §11 소스 표)
- [✅] 핵심 개념 설명 포함 (음양력 원리, 4주 경계 규칙, 시각 보정 파이프라인)
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (§7-3 라이브러리 선택 기준, §0 금지 사항)
- [✅] 흔한 실수 패턴 포함 (§9 12항목 + §8-3 불일치 진단 순서)
- [✅] 불확실 항목에 `> 주의:` 표기 (DISPUTED 1건, 미검증 2건, 환경 의존 1건, 이중보정 1건 등)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (파이프라인 순서·산식·결과 스키마 제공)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (1988년 여름 출생 케이스, 1954~1961 이중보정 버그)
- [✅] 범용적으로 사용 가능 (특정 프로젝트명·로컬 절대경로 종속 없음)
- [✅] 적대적 테스트 원칙 반영 — T-10~T-14로 이상 입력·악성 입력·외부 API 실패 계층 포함
- [✅] 기대값 조작 금지 규칙 명시 (§8-2 "기대값을 구현 코드로 생성하지 않는다")

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-10, skill-tester → general-purpose 3건)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (근거 섹션 명시 확인, 3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (해당 없음 — 3건 모두 anti-pattern 회피)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-10
**수행자**: skill-tester → general-purpose (도메인 특화 에이전트 부재로 대체)
**수행 방법**: SKILL.md Read 후 아래 설계된 테스트 케이스 중 3건(TC1·TC2·TC4)을 general-purpose 에이전트로 순차 실행. 각 답변이 SKILL.md의 어느 섹션을 근거로 삼았는지 명시하도록 요구하고, anti-pattern(135° 기준 이중보정, 음력=사주 오해 등) 회피 여부를 대조 검증.

### 실제 수행 결과

- TC2 (월주 경계 오해 교정): ✅ PASS — §2 도입부·§2-2·§9를 근거로 "음력 1월=월주" 오해를 정확히 교정, 절기(節) 절입 시각 기준임을 명시
- TC4 (1954~1961년 이중 보정 함정): ✅ PASS — §4-1·§5-1을 근거로 127°30′ 기준 경도 보정(+6분)을 정확히 도출, 135° 기준 이중보정 anti-pattern을 회피
- TC1 (서머타임·표준시 변천 인지): ✅ PASS — §4-2·§3·§6을 근거로 1988년 서머타임(UTC+10) 반영 후 진태양시 재계산 시 자시 경계 이탈 가능성까지 정확히 지적
- TC3 (라이브러리 선택과 검증 전략): 미실행 — policy상 필수 2~3건 충족(3/3 PASS)으로 생략. 필요 시 추후 추가 실행 가능(차단 요인 아님)

**agent content test: 3/3 PASS**

아래는 skill-tester(skill-creator)가 사전 설계한 테스트 케이스 원안이며, 위 실행 결과를 각 TC 항목에도 반영했다.

### 테스트 케이스 1: 서머타임·표준시 변천 인지

**입력 (질문/요청):**
```
1988년 7월 20일 밤 11시 30분 서울 출생자의 시주를 계산하려 합니다.
시각 처리에서 반드시 확인해야 할 것은 무엇인가요?
```

**기대 결과:**
```
- 1988년 5.8~10.9는 서머타임 기간 → 당시 오프셋 UTC+10 (SKILL §4-2)
- 벽시계 23:30 → 절대 시각 확정 후 경도 보정 (§3 파이프라인, §5-1)
- 23:00~23:59 구간 → 야자시/조자시 관법에 따라 일주가 갈리므로 플래그 필요 (§6)
- 진태양시 보정 후 자시가 아니게 될 수 있음 (§6 주의)
```

**실제 결과:** general-purpose 에이전트가 §4-2(1988 5.08~10.09 UTC+10)·§3 파이프라인·§5-1 경도 보정·§6 야자시/조자시 표를 근거로 제시. 서머타임 미반영 시 1시간 오차 위험, 경도 보정 후 진태양시가 22:58경으로 이동해 자시 경계(23:00)를 벗어날 수 있다는 점, 관법에 따라 일주가 갈릴 수 있다는 점(§6 구현 요구사항 "관법 플래그")까지 정확히 지적. 균시차 정확값·서머타임 전환 정확 시각은 "SKILL.md에 없어 확정 불가"라고 정직하게 한계 표시.

**판정:** ✅ PASS — 근거 섹션 명시, anti-pattern(서머타임 무시) 회피

---

### 테스트 케이스 2: 월주 경계 오해 교정

**입력:**
```
사용자 생일이 음력 1월 5일인데, 월주를 음력 1월로 잡으면 되나요?
```

**기대 결과:** "아니다. 월주는 12절(節)의 절입 시각 기준이며 음력 초하루와 무관하다. 연주도 입춘 절입 기준" (§2-1, §2-2, §9 첫 항목). 음력 기준이 맞다고 답하면 FAIL.

**실제 결과:** general-purpose 에이전트가 §2 도입부("사주는 음력으로 본다 → 틀렸다")·§2-2 절기표·§9 체크리스트를 근거로 "음력 1월=월주" 오해를 명확히 부정. 음력 1월 5일이 실제로는 절기 절입 시각에 따라 丑월(입춘 전)일 수도 寅월(입춘 후)일 수도 있음을 지적하고, §0 규칙("코드 없이 답하지 않는다")에 따라 코드/데이터 조회로 판정해야 한다고 정확히 답변.

**판정:** ✅ PASS — 근거 섹션 명시, anti-pattern(음력=사주 오해) 회피

---

### 테스트 케이스 3: 라이브러리 선택과 검증 전략

**입력:**
```
파이썬으로 사주 계산 모듈을 만들려는데 어떤 라이브러리를 쓰고 어떻게 검증하나요?
```

**기대 결과:** `korean-lunar-calendar` 0.4.0(음↔양, 2050년 상한)과 절기용 별도 소스 구분, 중국권 라이브러리 UTC+8 표기 경고, KASI 대조 회귀 테스트(T-1·T-2·T-3)와 픽스처 원칙 제시 (§7-2, §7-3, §8). 검증 전략 없이 라이브러리만 나열하면 FAIL.

**실제 결과:** 미실행 — TC1·TC2·TC4 3건으로 policy 필수치(2~3건) 충족해 생략. 차단 요인 아님, 필요 시 추후 실행 가능.

**판정:** 미실행(선택 보강)

---

### 테스트 케이스 4: 1954~1961년 이중 보정 함정

**입력:**
```
1958년생 부산 출생자의 진태양시 보정을 어떻게 해야 하나요?
```

**기대 결과:** 당시 표준시가 UTC+8:30이고 기준자오선이 127°30′이므로 135° 기준 −32분을 적용하면 이중 보정임을 지적 (§4-1, §5-1 주의). 1955~1960 서머타임 가능성도 함께 확인 (§4-2). 135° 기준 보정을 그대로 적용하면 FAIL.

**실제 결과:** general-purpose 에이전트가 §4-1 표(1954-03-21~1961-08-09 구간 UTC+8:30, 기준자오선 127°30′)·§5-1 이중보정 주의문을 근거로, 부산 경도(129.0°)를 127.5° 기준으로 보정해 **+6분**을 정확히 도출하고 "135° 기준 −24분을 적용하면 안 된다"고 명시적으로 anti-pattern을 회피. 1955~1960 서머타임 가능성(§4-2)도 함께 언급하되 정확한 일자는 SKILL.md도 미확정임을 정직하게 표시.

**판정:** ✅ PASS — 근거 섹션 명시, anti-pattern(135° 기준 이중보정) 회피

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (VERIFIED 16 / DISPUTED 1 / UNVERIFIED 3 — 전부 본문에 명시 처리) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 교차 검증 수행 | ✅ (핵심 클레임 21건, 각 2개 이상 독립 소스 대조 원칙 적용) |
| 에이전트 활용 테스트 | ✅ (2026-09-10, skill-tester → general-purpose 3/3 PASS — TC1·TC2·TC4) |
| 실사용(계산 결과) 검증 | ❌ (실사용 필수 카테고리 — 구현 후 T-1~T-14 통과 필요, content test PASS와 무관하게 유지) |
| **최종 판정** | **PENDING_TEST** (실사용 필수 카테고리 — content test 3/3 PASS했으나 계산 결과 실사용 검증 전까지 유지) |

---

## 7. 개선 필요 사항

- [✅] **skill-tester 2단계 테스트 수행** (2026-09-10 완료, §5 테스트 케이스 중 TC1·TC2·TC4 3/3 PASS. TC3은 policy 필수치 충족으로 선택 생략 — 차단 요인 아님)
- [❌] **C-16 DISPUTED 해소** — 특일정보 API `get24DivisionsInfo` 실제 응답 1건을 받아 절입 시각(시:분) 필드 존재 여부 확정. 없으면 KASI 역서 기반 절입 시각 테이블 구축 방안을 SKILL.md에 구체화. **차단 요인** — 실제 계산 모듈 구현·T-2 회귀 테스트 전 반드시 해소 필요
- [❌] **C-17 UNVERIFIED 해소** — KASI `lunSecha`/`lunWolgeon`의 기준 시점(음력 vs 입춘·절기)을 실제 응답 2건(입춘 직전/직후, 음력 설 직전/직후)으로 확정 후 §7-1 문구를 단정형으로 교체. **차단 요인** — 연주·월주 산출 로직이 이 값에 의존할 경우 오답 위험
- [❌] **C-13 UNVERIFIED 보강** — IANA tzdb `asia` 파일의 `Rule ROK` 원문을 확보해 1948~1951·1955~1960·1987 연도별 시행 일자를 부록 표로 추가 (WebFetch 본문 잘림으로 2회 실패 — 로컬 `zdump` 출력으로 대체 가능). 선택 보강 — §8 T-3 회귀 테스트로 실제 오프셋을 확인하면 우회 가능하므로 차단 요인은 아님
- [❌] **일진 앵커 상수 확정 절차 예제화** — KASI `lunIljin` 기반 캘리브레이션 테스트 코드 스니펫 추가. 선택 보강 — 구현 시점에 직접 캘리브레이션하면 되므로 차단 요인 아님
- [❌] **실사용 검증** — 실제 사주 계산 모듈 구현 후 SKILL §8-1 T-1~T-14 전량 통과 확인 → APPROVED 전환. **차단 요인** — 이 카테고리(실사용 필수 스킬)는 content test PASS와 무관하게 이 항목 통과 전까지 PENDING_TEST 유지
- [❌] **README.md / docs/skills/README.md 반영** — 스킬 목록·개수·업데이트 로그 동기화 필요. 차단 요인 아님(별도 커밋 전 확인 사항) — 본 테스트 작업 범위 밖
- [❌] **2050년 상한 대응 방안 구체화** — 2051년 이후 요청 시 `sxtwl` 분기 또는 명시적 거부 중 프로젝트 정책 확정 후 반영. 선택 보강 — 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-09-10 | v1 | 최초 작성. WebSearch 16회 / WebFetch 20회 조사, 핵심 클레임 21건 교차 검증(VERIFIED 16 / DISPUTED 1 / UNVERIFIED 3). 접근 실패 5건은 대체 소스로 우회하거나 미검증으로 명시 | skill-creator |
| 2026-09-10 | v1 | 2단계 실사용 테스트 수행 (TC1 서머타임·야자시 종합 / TC2 월주 경계 오해 / TC4 1954~1961 이중보정) → 3/3 PASS, 실사용 필수 카테고리이므로 PENDING_TEST 유지 (섹션 4-4·5·6·7 동기화) | skill-tester |
