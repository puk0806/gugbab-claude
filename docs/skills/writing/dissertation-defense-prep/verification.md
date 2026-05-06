---
skill: dissertation-defense-prep
category: writing
version: v1
date: 2026-05-03
status: APPROVED
---

# dissertation-defense-prep 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dissertation-defense-prep` |
| 스킬 경로 | `.claude/skills/writing/dissertation-defense-prep/SKILL.md` |
| 검증일 | 2026-05-03 |
| 검증자 | skill-creator (Claude) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 한국 주요 대학원 박사학위 디펜스 가이드 조사 (서울대, KAIST, 연세대)
- [✅] 미국 PhD defense 표준 조사 (Penn State, U Penn)
- [✅] 영국 viva voce 형식 조사 (UKCGE 가이드)
- [✅] 발표 자료(PPT) 구성·시간 배분 표준 조사 (CMU Library)
- [✅] 답변 기법 (PREP 구조) 정리
- [✅] 흔한 실패 사례 정리
- [✅] 사전 준비물·실무 행정 체크리스트 정리
- [✅] 본심사 후 수정·dCollection 등록 절차 조사
- [✅] 한국연구재단 외국 박사학위 신고 의무 검증 (국내 박사는 비대상)
- [✅] SKILL.md 파일 작성
- [✅] verification.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | "서울대학교 박사학위논문 심사 발표 가이드 시간" | 서울대 학과별 심사 일정 공지 다수, 일반적으로 본심 12월 진행 확인 |
| 조사 2 | WebSearch | "고려대학교 박사학위논문 본심사 발표시간 질의응답" | 직접 가이드 미발견, 학과 행정실 문의 권장 |
| 조사 3 | WebSearch | "연세대학교 박사학위논문 디펜스 dCollection 등록" | dCollection 본문+인준지 PDF 분리 제출 절차 확인 |
| 조사 4 | WebSearch | "PhD dissertation defense structure US Penn State MIT" | Penn State 2단계(public+closed) 구성, 2/3 찬성 통과 확인 |
| 조사 5 | WebSearch | "UK viva voce PhD defense duration examiners format" | 평균 2시간, 내부+외부 위원 2인, 비공개 진행 확인 |
| 조사 6 | WebSearch | "PhD defense presentation slides structure 30 minutes" | 슬라이드당 1분, 백업 슬라이드 활용, 챕터 4-5 집중 권장 |
| 조사 7 | WebSearch | "박사학위 디펜스 예상 질문 PREP 답변 기법 한국" | 이나고 아카데미 13가지 요령, 1분/3-5분/10분 요약 답변 준비 |
| 조사 8 | WebSearch | "dissertation defense common mistakes pitfalls" | "I don't know"는 추후 답변 약속이 정답, 시간 관리·과신 주의 |
| 조사 9 | WebSearch | "dissertation defense checklist week before day before" | 1주 전 위원 메일 송부, 1일 전 짐 정리, 당일 조기 도착 |
| 조사 10 | WebSearch | "박사학위논문 수정보완 기간 본심사 후 최종본 제출" | 보존용 논문 제출 후 정정 불가, 사전 검토 중요 |
| 조사 11 | WebSearch | "한국연구재단 박사학위논문 등록 NDSL 의무" | 외국 박사학위만 신고 대상, 국내는 비대상 확인 |
| WebFetch 1 | WebFetch | https://gsmse.kaist.ac.kr/pages/sub/sub0404_05 | KAIST 의과학 박사 본심: 위원 4인, 3인 이상 합격 시 통과, 15일 전 신청 |
| WebFetch 2 | WebFetch | https://www.enago.co.kr/academy/phd-dissertation-defense-tips/ | 13가지 요령 (슬라이드, 답변, 호흡, 모의 디펜스 등) |
| WebFetch 3 | WebFetch | https://guides.library.cmu.edu/c.php?g=883178 | 백업 슬라이드 활용, 45분 발표 = 프로젝트당 10분 |
| WebFetch 4 | WebFetch | https://gradschool.psu.edu/.../gcac-608.../ | Penn State: public+closed 2단계, 2/3 찬성, 최소 2주 전 공지 |
| WebFetch 5 | WebFetch | https://snu.ac.kr/dissertation-evaluation | 서울대: 위원 5인, 4/5 찬성, 구술고사 70점, 6년 이내 제출 |
| WebFetch 6 | WebFetch | https://graduate.yonsei.ac.kr/graduate/academic/paper04.do | 연세대 dCollection 절차 확인, 발표 시간은 별도 미명시 |
| 교차 검증 | WebSearch | 11개 핵심 클레임, 독립 소스 2~3개씩 | VERIFIED 9 / DISPUTED 0 / PARTIAL 2 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 서울대학교 학위취득 안내 | https://snu.ac.kr/dissertation-evaluation | ⭐⭐⭐ High | 2026-05-03 | 공식 학사 페이지, 위원 구성·합격 기준 |
| KAIST 의과학대학원 박사 본심사 | https://gsmse.kaist.ac.kr/pages/sub/sub0404_05 | ⭐⭐⭐ High | 2026-05-03 | 공식 가이드, 절차 단계 |
| 연세대학교 학위논문 제출절차 | https://graduate.yonsei.ac.kr/graduate/academic/paper04.do | ⭐⭐⭐ High | 2026-05-03 | 공식, dCollection 절차 |
| Penn State Graduate School GCAC-608 | https://gradschool.psu.edu/graduate-education-policies/gcac/gcac-600/gcac-608-final-oral-examination-research-doctorate/ | ⭐⭐⭐ High | 2026-05-03 | 미국 공립대 공식 정책 |
| UKCGE Preparing for the Viva | https://ukcge.ac.uk/assets/resources/Preparing-for-your-Viva-UK-Council-for-Graduate-Education.pdf | ⭐⭐⭐ High | 2026-05-03 | 영국 대학원교육협의회 공식 가이드 |
| CMU Library PhD Defense Slides | https://guides.library.cmu.edu/c.php?g=883178 | ⭐⭐⭐ High | 2026-05-03 | 카네기멜론 공식 라이브러리 가이드 |
| 이나고 아카데미 디펜스 요령 | https://www.enago.co.kr/academy/phd-dissertation-defense-tips/ | ⭐⭐ Medium | 2026-05-03 | 학술 편집 서비스, 한국어 가이드 |
| 한국연구재단 외국박사학위 시스템 | https://dr.nrf.re.kr/ | ⭐⭐⭐ High | 2026-05-03 | 공식, 외국 박사학위만 대상임을 확인 |
| 김박사넷 커뮤니티 디펜스 사례 | https://phdkim.net/board/free/52478 | ⭐ Low | 2026-05-03 | 국내 대학원생 커뮤니티, 보조 참고 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음 (대학별 편차는 명시적 경고 처리)
- [✅] 버전 정보 명시 (2026-05-03 기준 한국·미국·영국 형식)
- [✅] deprecated된 패턴 권장하지 않음
- [✅] 발표 시간·심사위원 수는 "일반적 범위"로 표기, 단정 회피

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (한국 vs 국제 비교)
- [✅] 발표 자료 구성·시간 관리·답변 기법·체크리스트 모두 포함
- [✅] 언제 사용해야 할지 사용 시점 명시 (섹션 0)
- [✅] 흔한 실수 패턴 포함 (섹션 10)

### 4-3. 실용성

- [✅] 박사과정생이 실제 디펜스 준비에 사용 가능 수준
- [✅] 1주 전·1일 전·당일·본심사 후 단계별 체크리스트 포함
- [✅] PREP 답변 예시·"잘 모르겠습니다" 표현법 등 즉시 활용 가능 문구 포함
- [✅] 특정 대학·학과에 종속되지 않음, "소속 대학 규정 우선" 명시

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-03, skill-tester → general-purpose)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-03
**수행자**: skill-tester → general-purpose (domain-specific 에이전트 대체 사용)
**수행 방법**: SKILL.md 전체 Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 박사 디펜스 PPT 30-40매 표준 구성과 시간 분배는?**
- PASS
- 근거: SKILL.md "2. 발표 자료(PPT) 표준 구성" 섹션 + "3. 발표 시간 관리" 섹션
- 상세: 섹션 2의 9-row 구성 표(표지 1매 ~ 백업 슬라이드 5~10매)와 시간 비중(도입 25%/본론 50%/결론 25%), 섹션 3의 30분 기준 수치(도입 7~8분/본론 15분/결론 7~8분), "1슬라이드 = 약 1분", "백업 슬라이드는 발표 시간에 포함하지 않음" 등 모두 근거로 존재. 대학별 편차 경고도 섹션 1 하단에 명시.

**Q2. "잘 모르겠습니다" 표현법 — 정직성과 학술적 신뢰 유지하는 방식?**
- PASS
- 근거: SKILL.md "4. 질의응답 준비 > 잘 모르겠습니다 표현법" 섹션 + "5. 답변 기법 > 반박 인정 + 재질문 활용" 섹션
- 상세: 추측 금지 원칙, 권장 표현 3가지(추후 연구 약속/현재 자료 한계 인정+대안 해석/수정 과정 반영 약속), 금지 표현 3가지(방어적 회피/"아마" 단독/침묵+무관답변) 모두 명시. 섹션 5에서 타당한 지적 즉시 인정 → 근거 제시 → 추가 검토 약속 패턴도 보완.

**Q3. 본심사 후 수정 보완 응답서(point-by-point) 형식 + 제출 기한?**
- PASS
- 근거: SKILL.md "7. 수정·보완 단계 (본심사 후)" 섹션
- 상세: 일정(1~4주, 대학·학과별 편차 명시), point-by-point 코드블록 구조([심사위원 코멘트] → 지적사항(그대로 인용) → 답변 → 수정위치), 답변 작성 원칙 4가지 모두 존재. "특정 대학 기한 단정" anti-pattern 없음. "소속 대학 규정 우선" 주의 문구 포함.

### 발견된 gap (있으면)

없음. 3문항 모두 SKILL.md에 충분한 근거가 존재하며 anti-pattern 회피 확인.

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 해당 없음 (writing 카테고리, 빌드/워크플로우/마이그레이션 아님)
- 최종 상태: APPROVED

---

> 참고 — 최초 작성 시 "사용자 지시로 skill-tester 호출 생략" 기록 (2026-05-03 skill-creator):

### 테스트 케이스 1: (당시 미수행)

**판정:** PENDING (2026-05-03 skill-tester가 소급 수행하여 APPROVED 전환)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-03 skill-tester 수행, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

### 교차 검증 클레임별 판정

| 클레임 | 판정 | 근거 |
|--------|------|------|
| 한국 박사 본심사 발표 30~40분, Q&A 60~90분 | PARTIAL | 학과별 편차 큼. 일부 학과 20~30분 (전주대 사례), 일부 30분 발표 + 질의응답 (KAIST 사례). "일반적 패턴"으로 표기 |
| 한국 석사 발표 15~20분 | VERIFIED | 서울대 의과학과 발표 15분+질의 10분 (총 25분) 사례 일치 |
| 서울대 박사 종심 위원 5인, 4/5 찬성 | VERIFIED | snu.ac.kr/dissertation-evaluation 공식 명시 |
| KAIST 박사 본심 위원 4인, 3인 이상 합격 | VERIFIED | gsmse.kaist.ac.kr 공식 명시 |
| Penn State PhD: public+closed 2단계, 2/3 찬성 | VERIFIED | gradschool.psu.edu GCAC-608 공식 명시 |
| 영국 viva 평균 2시간, 2~4시간 범위 | VERIFIED | UKCGE 가이드 + 다수 영국 대학 가이드 일치 |
| 영국 viva 내부+외부 위원 2인, 비공개 | VERIFIED | UKCGE + DiscoverPhDs 일치 |
| 슬라이드당 약 1분, 백업 슬라이드 활용 | VERIFIED | CMU Library + Chanakya Research 일치 |
| "I don't know"는 "추후 답변 약속"이 정답 | VERIFIED | DoctorateGuru + 다수 가이드 일치 |
| 외국 박사학위만 한국연구재단 신고 의무 | VERIFIED | dr.nrf.re.kr 공식 신고 대상 명시 |
| dCollection: 본문 PDF + 인준지 PDF 분리 | VERIFIED | 연세대 graduate.yonsei.ac.kr 공식 명시 |
| 발표 30분 = 도입 25%/본론 50%/결론 25% | PARTIAL | 일반적 권장 비율이나 학과·발표 시간에 따라 변동. 가이드라인으로 표기 |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-03 완료, 3/3 PASS, APPROVED 전환)
- [❌] 실제 박사과정생이 사용한 후 피드백 수집 → 한국 학과별 편차 보강 (차단 요인 아님, 선택적 보강)
- [❌] 분야별(이공계/인문사회/예체능) 디펜스 차이 추가 검토 (차단 요인 아님, 선택적 보강)
- [❌] 영문 viva 응시자용 영어 답변 PREP 예시 추가 검토 (차단 요인 아님, 선택적 보강)
- [❌] 원격(Zoom) 디펜스 환경 별도 체크리스트 보강 검토 (차단 요인 아님, 선택적 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-03 | v1 | 최초 작성. 한국 주요 대학(서울대·KAIST·연세대) + 미국(Penn State) + 영국(UKCGE) 가이드 종합 | skill-creator (Claude) |
| 2026-05-03 | v1 | 2단계 실사용 테스트 수행 (Q1 PPT 30-40매 구성·시간분배 / Q2 "잘 모르겠습니다" 표현법 / Q3 point-by-point 응답서 형식·기한) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
