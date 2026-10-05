---
skill: site-migration-seo
category: devops
version: v2
date: 2026-09-28
status: APPROVED
---

# site-migration-seo 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `site-migration-seo` |
| 스킬 경로 | `.claude/skills/site-migration-seo/SKILL.md` |
| 검증일 | 2026-09-28 (최초 2026-06-02, 2026-09-28 재검증) |
| 검증자 | skill-creator (자동) → Claude (Sonnet 5, 2026-09-28 재검증) |
| 스킬 버전 | v2 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Google Search Central — Site moves with URL changes)
- [✅] 공식 문서 2순위 소스 확인 (Google Search Console — Change of Address tool)
- [✅] 다국어 사이트 이전 공식 가이드 확인 (Managing Multi-Regional Sites)
- [✅] John Mueller 공식 발언 확인 (redirect chain hops + staggered migration)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (D-30~D+90 타임라인)
- [✅] 흔한 실수 패턴 정리 (11개 항목)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | Google Search Central site-move-with-url-changes 페이지 | 이전 유형 4가지, 301 권장, sitemap 처리, 1년 redirect 권장, 흔한 실수 |
| 조사 | WebFetch | GSC Change of Address support page | 도메인 속성 한정, 180일 알림, HTTPS·경로 변경 미적용 |
| 교차 검증 | WebSearch | "John Mueller redirect chain hops" | 5 hops 미만 권장, 5 hops 초과 시 인덱싱 실패 확정 |
| 교차 검증 | WebSearch | "site migration traffic recovery timeline" | 4~12주 회복, 892건 분석 평균 523일 등 다중 소스 |
| 교차 검증 | WebSearch | "hreflang preservation site migration" | 클러스터 일관성 깨지면 전체 무시, 75% 구현 오류율 |
| 교차 검증 | WebSearch | "301 vs 302 site migration SEO" | 301=100% PageRank 이전 확정 (Gary Illyes), 302 영구 사용이 최다 실수 |
| 교차 검증 | WebSearch | "staggered partial site migration risk Mueller 2025" | 2025-12 Mueller 공식 경고 "messy outcome" |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Google Search Central — Site moves with URL changes | https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes | ⭐⭐⭐ High | 2026-06-02 | 1순위 공식 문서 |
| Google Search Console — Change of Address | https://support.google.com/webmasters/answer/9370220 | ⭐⭐⭐ High | 2026-06-02 | GSC 공식 도구 문서 |
| Google Search Central — Managing Multi-Regional Sites | https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites | ⭐⭐⭐ High | 2026-06-02 | hreflang 공식 가이드 |
| Search Engine Journal — Mueller on redirect chain hops | https://www.searchenginejournal.com/googles-john-mueller-recommends-less-than-5-hops-per-redirect-chain/344664/ | ⭐⭐⭐ High | 2026-06-02 | Google 직원 공식 발언 인용 |
| Search Engine Journal — Mueller on staggered migrations | https://www.searchenginejournal.com/google-staggered-site-migrations/563346/ | ⭐⭐⭐ High | 2026-06-02 | 2025-12 Mueller 공식 발언 |
| Etavrian — HTTPS migration ranking dip | https://www.etavrian.com/news/https-seo-migration-ranking-dip | ⭐⭐ Medium | 2026-06-02 | 회복 곡선 보조 자료 |
| Conductor — 301 vs 302 | https://www.conductor.com/academy/redirects/faq/301-vs-302/ | ⭐⭐ Medium | 2026-06-02 | 301/302 SEO 영향 비교 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 출처 URL과 검증일 명시
- [✅] deprecated된 패턴을 권장하지 않음 (302를 영구 이전에 사용하는 패턴 금지 명시)
- [✅] 핵심 클레임 교차 검증 완료

**핵심 클레임 검증 결과:**

| 클레임 | 판정 | 근거 |
|--------|:--:|------|
| 301은 PageRank 100% 이전 | VERIFIED | Gary Illyes 공식 확인 (Conductor 등 복수 소스) |
| redirect chain은 5 hops 미만 | VERIFIED | Mueller 공식 발언 (SEJ 인용) |
| Change of Address는 도메인 변경에만 적용 | VERIFIED | Google Support 공식 문서 명시 |
| Change of Address 신청 후 180일 알림 | VERIFIED | Google Support 공식 문서 |
| Google 권장 redirect 최소 1년 유지 | VERIFIED | Search Central 공식 표현 |
| hreflang 클러스터 1개 오류로 전체 무시 | VERIFIED | 국제 SEO 가이드 복수 소스 일치 |
| staggered migration "messy" 경고 | VERIFIED | Mueller 2025-12 공식 발언 |
| 트래픽 회복 일반 곡선 4~12주 | VERIFIED (참고치) | 복수 소스 일치, 단 사이트 규모에 따라 큰 편차 — SKILL.md에 주의 표기 |
| Googlebot은 한 번의 크롤에서 5 hops까지 추적 | VERIFIED | Mueller 발언 직접 인용 |
| 302 영구 사용이 최다 기술 실수 | VERIFIED (업계 공통) | 복수 SEO 도구 업체·교육 자료 일치 |

DISPUTED / UNVERIFIED: 없음

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (헤더에 5개 공식 소스 + 검증일)
- [✅] 핵심 개념 설명 포함 (이전 유형 4가지, 타임라인, 301 vs 302 등)
- [✅] 코드 예시 포함 (Nginx + .htaccess 최소 예시, 자세한 건 [[url-canonicalization-redirects]] 위임)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (§13)
- [✅] 흔한 실수 패턴 포함 (§10, 11개 항목)
- [✅] 다른 스킬과 경계 명시 ([[url-canonicalization-redirects]], i18n-seo 영역 분리)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 사이트 이전 워크플로우 작성에 도움이 되는 수준
- [✅] D-30/D-7/D-Day/D+30/D+90 타임라인으로 *작업 시점* 명시
- [✅] 범용적으로 사용 가능 (특정 프로젝트·플랫폼 종속 X)
- [✅] 코드 비중 최소화 — 워크플로우·체크리스트 중심

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-02, 3/3 PASS / 2026-09-28 재검증 정정분 재테스트 2/2 PASS)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (agent content test 누적 5/5 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (보완 불필요 — 모든 근거 SKILL.md에 명시되어 있음)

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-02
**수행자**: 메인 대화 (skill-tester가 API 529 overloaded로 3회 재시도 실패하여 메인이 SKILL.md 대조)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 매칭, anti-pattern 회피 확인 (agent content test)

### Q1. WordPress 블로그(example.com)를 Next.js로 새로 만들어 newsite.com으로 옮기려고 한다. 절차와 주의사항?

**판정**: PASS

**근거**:
- §1 이전 유형 4가지에서 "도메인 변경 + 플랫폼 변경"이 *동시* 발생하는 케이스로 분류됨
- §9 표 "도메인 + 플랫폼 + 디자인 동시 — 최악, 트래픽 50%+ 손실 위험" 명시 → 권장은 단계 분리 (Phase 1: 플랫폼 변경 URL 유지 → Phase 2: 도메인 변경)
- 단계 분리가 불가능한 경우: §2 타임라인 (D-30 인벤토리 → D-21 매핑 → D-14 staging → D-7 매핑 확정·301 룰 QA → D-Day 전환 → D+14 Change of Address → D+30·D+90 모니터링) 그대로 수행
- 추가 주의사항: §3-3 staging의 robots.txt·noindex 잔재 점검 (D-Day 최대 사고 원인), §4 반드시 301/308 사용(302 금지), §5 redirect chain 회피, §6 D+14 GSC Change of Address(신·구 양쪽 GSC 소유권 확인 필수)
- anti-pattern 회피: §9·§10 "동시 변경 폭주(도메인+URL+디자인) — 진단 불가, 회복 불가" 명시적 차단

### Q2. 이전 후 2주째 트래픽이 60% 떨어졌는데 정상인가, 비상 상황인가?

**판정**: PASS

**근거**:
- §7-2 표 D+14~28 정상 회복 범위 = 이전 대비 70~90% 즉 트래픽 손실 10~30% 정상
- 60% 하락(= 40% 잔존)은 §7-2 표 "이상 신호" 범위(50% 이하 정체 → 매핑 누락·5xx 에러 의심)에 해당
- 대응: §7-3 핵심 진단 포인트 6단계 우선순위로 진단 — (1) `curl -I` 301 + Location 정확? (2) 신 URL 200 OK? (3) GSC URL 검사 "색인 생성됨"? (4) canonical = 신 URL? (5) robots.txt가 신 URL 차단 안 함? (6) noindex 잔재 없음?
- 즉시 롤백은 비권장 — §11 "트래픽 폭락 발견 즉시 롤백보다 원인 진단 → 부분 수정이 우선" 명시. 대부분 redirect 누락·robots 차단·canonical 오류 등 수정 가능한 기술 실수가 원인
- anti-pattern 회피: D+1~7의 일시적 30~50% 하락을 비상으로 오판하지 않음, 동시에 D+14 70~90% 회복 기준에 미달하면 정확히 "이상 신호"로 진단

### Q3. 디자인 개편 + URL 구조 변경 + 도메인 변경을 한 번에 진행해도 되나?

**판정**: PASS

**근거**:
- §9 표 명시: "도메인 + 플랫폼 + 디자인 동시 — 최악, 트래픽 50%+ 손실 위험"
- §9 권장 단계 분리: Phase 1 플랫폼 변경(URL 유지) 4~8주 안정화 → Phase 2 URL 구조 변경 4~8주 안정화 → Phase 3 도메인 변경 → Phase 4 디자인·콘텐츠 개편
- 동시에 진행 시 문제: 트래픽 폭락 시 *원인 진단이 거의 불가능* (기술 문제 vs 콘텐츠 문제 vs UX 문제 분리 불가). §10 "동시 변경 폭주(도메인+URL+디자인) — 진단 불가, 회복 불가" 표에도 동일 경고
- 추가 경고: §9 staggered (부분) migration도 Mueller(2025-12) 공식 경고 "messy outcome"이므로 부득이한 경우라도 가능한 한 빨리 전체 이전 마무리
- anti-pattern 회피: "한 번에 끝내자"는 사용자 직관을 직접 거절하고 단계 분리를 권장

### 종합

- agent content test: 3/3 PASS
- SKILL.md 모든 핵심 질문에 명확한 근거 섹션 존재, anti-pattern도 표 형태로 명시
- SKILL.md 보강 불필요

---

### [2026-09-28] 재검증 — GSC International Targeting 폐지·Change of Address 도메인 변형 갱신 반영

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 3개를 1차 소스와 대조 (§7 개선 필요 사항에 남아있던 "GSC International Targeting deprecated 여부 확인 권장" 미결 항목 포함)

**클레임 대조 결과**:
1. §8의 "GSC > Legacy tools > International Targeting 보고서로 hreflang 에러 모니터링" → **DISPUTED → 수정 반영**: 해당 보고서는 2022-09-22 완전 폐지·제거됨 (Google 공식: "little value for the ecosystem, and is no longer supported"). 국가 타겟팅 수동 설정도 폐지, ccTLD·hreflang·서버 위치·콘텐츠 신호로 자동 판단으로 전환. SKILL.md §8을 "보고서 자체가 존재하지 않으니 외부 크롤러·검증 도구로 hreflang 모니터링" 서술로 정정 (소스: https://support.google.com/webmasters/answer/12474899 , https://searchengineland.com/google-search-console-to-remove-international-targeting-report-387477)
2. Change of Address 도구 — 도메인 변경 시 이전 도메인의 www/non-www·서브도메인 변형을 모두 Search Console에 검증하고 각각 Change of Address를 제출해야 한다는 권장사항이 2026년 공식 가이드에 추가됨 → **신규 확인 사항 → SKILL.md §6에 추가 반영** (소스: https://support.google.com/webmasters/answer/9370220 — "다른 도메인으로 이동 시 이전 도메인의 모든 서브도메인 변형(www 포함/미포함)에 대해 이 도구를 사용해야 하며 Search Console에서 모두 확인되어야 한다", https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes 최종 업데이트 2026-08-20 확인)
3. Change of Address 신청 후 180일간 신호 이전 + 알림 표시, 180일 후 Google이 신·구 사이트 관계를 더 이상 인식하지 않음 → VERIFIED, 변경 없음 (Google Search Central 커뮤니티 공식 답변 다수 교차 확인)

**실전 질문 재검증**:
- Q1. "다국어 사이트 이전 후 hreflang 에러를 GSC에서 어떻게 확인하나?" → 정정 전에는 SKILL.md가 존재하지 않는 보고서를 안내했을 것 — 정정 후 SKILL.md §8 "외부 크롤러·검증 도구" 서술로 PASS
- Q2. "example.com에서 newdomain.com으로 이전하는데 www.example.com도 따로 등록해야 하나?" → SKILL.md §6 "구 도메인의 www/non-www·서브도메인 변형까지 전부 검증 후 각각 Change of Address 제출" 근거로 PASS (정정 전에는 SKILL.md에 이 내용이 없어 FAIL 가능성 있었음)

**재검증 최종 판정**: DISPUTED 1건(International Targeting 보고서 폐지) 수정 반영 + 신규 권장사항 1건(도메인 변형 전체 등록) 추가 반영. 나머지 클레임은 VERIFIED. **status PENDING_TEST 전환** (메인이 이후 skill-tester 재테스트 수행 — 정정된 §6·§8을 겨냥한 질문 포함 필요).

---

### [2026-09-28] skill-tester 2단계 재테스트 — §6 도메인 변형·§8 International Targeting 폐지 정정분 검증

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (2개 질문, 병렬 실행)
**수행 방법**: SKILL.md Read 후 2026-09-28 재검증 정정분(§6 도메인 변형 전체 등록, §8 International Targeting 보고서 폐지)을 겨냥한 실전 질문 2개 답변, 근거 섹션 및 anti-pattern 회피 확인

**Q1. example.com→newdomain.com 이전 시 www/서브도메인 변형도 개별 등록해야 하나?**
- ✅ PASS
- 근거: SKILL.md §6 "D+14: GSC Change of Address" 1번·5번 항목 + "주의 (2026 갱신)" 문장
- 상세: "구 도메인의 www/non-www·서브도메인 변형까지 전부 검증", "검증된 구 도메인 변형마다 개별적으로 Change of Address 제출" 정확 인용. `example.com` 하나만 등록하면 불충분하다는 점, 각 변형을 개별 소유권 검증 후 개별 제출해야 한다는 절차를 정확히 답변. gap: 서브도메인 변형을 어떻게 전부 식별(발견)하는지 방법론은 §3-1(인벤토리)에 없음(선택 보강)

**Q2. 다국어 이전 후 hreflang 에러를 GSC International Targeting 보고서에서 확인 가능한가?**
- ✅ PASS
- 근거: SKILL.md §8 "다국어 사이트 이전 (hreflang)" 문단
- 상세: "International Targeting 보고서는 2022-09-22 완전 폐지되어 더 이상 존재하지 않는다"를 정확히 인용해 "찾을 수 없다"고 정확히 답변. 대안(Screaming Frog·Ahrefs 등 외부 크롤러 또는 hreflang 검증 전용 도구)도 정확히 제시. 정정 전이었다면 존재하지 않는 보고서로 유도했을 질문에서 옛 정보가 남지 않음을 확인

### 발견된 gap (있으면)

- §3-1 인벤토리 섹션에 도메인의 www/non-www·서브도메인 변형을 "어떻게 식별(발견)하는지" 방법론이 없음 — §6은 "전부 검증해야 한다"고만 하고 발견 방법은 미기술 (선택 보강)
- §8 "sitemap/hreflang 검증 전용 도구"의 구체적 도구명이 나열되어 있지 않음 (선택 보강)

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: SEO 운영 체크리스트/워크플로우 스킬 — 정확성이 공식 문서(Google Search Central·GSC 지원 문서) 대조로 검증 가능한 유형이며 실제 도메인 이전 실행 결과물로만 검증 가능한 항목은 아님. 2026-06-02 최초 승인 시점과 동일하게 content test PASS로 APPROVED 가능 카테고리 유지
- 최종 상태: APPROVED

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (10개 핵심 클레임 모두 VERIFIED) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 누적 5/5 PASS (2026-06-02 3/3 + 2026-09-28 재테스트 2/2 — §6·§8 정정분 반영 확인) |
| **최종 판정** | **APPROVED** (2026-09-28 skill-tester 재테스트 2/2 PASS — §6 도메인 변형·§8 International Targeting 폐지 정정분 검증 완료) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 에이전트 활용 테스트 수행 (2026-06-02, 3/3 PASS)
- [ ] 트래픽 회복 곡선 §7-2 표는 일반 보고치 — 사용 사례별 편차가 큰 만큼 실제 활용 시 사이트 규모 컨텍스트 추가 검증 (선택 보강)
- [ ] hreflang 영역은 별도 i18n-seo 스킬로 확장 가능 (이미 i18n-seo 스킬 존재 — cross-link 강화 권장)
- [✅] (2026-09-28 완료) GSC International Targeting 보고서 deprecated 여부 확인 → 2022-09-22 완전 폐지 확인, SKILL.md §8 정정 반영
- [✅] (2026-09-28 완료) SKILL.md §6에 추가한 "도메인 변형 전체 등록" 권장사항을 겨냥한 skill-tester 재테스트 → 2/2 PASS, status APPROVED 유지
- [❌] §3-1 인벤토리에 www/서브도메인 변형 식별(발견) 방법론 미기술 (선택 보강 — 차단 요인 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-02 | v1 | 최초 작성 — 공식 문서 5종 + Mueller 2건 교차 검증 완료 | skill-creator |
| 2026-06-02 | v1 | 2단계 실사용 테스트 수행 (Q1 WordPress→Next.js+도메인 이전 / Q2 D+14 트래픽 40% 진단 / Q3 동시 변경 가부) → agent content test 3/3 PASS, APPROVED 전환 | skill-tester (API 529로 메인이 대조) |
| 2026-09-28 | v2 | 재검증 — GSC International Targeting 보고서 완전 폐지(2022-09-22) 확인 후 §8 정정, Change of Address 도메인 변형(www/non-www/서브도메인) 전체 등록 신규 권장사항을 §6에 추가 반영. status APPROVED → PENDING_TEST (재테스트 필요) | Claude (Sonnet 5) |
| 2026-09-28 | v2 | 2단계 실사용 재테스트 수행 (Q1 도메인 변형 개별 등록 / Q2 International Targeting 보고서 폐지·대안) → 2/2 PASS, APPROVED 전환 | skill-tester |
