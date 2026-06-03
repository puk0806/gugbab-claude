---
name: site-migration-seo
description: 도메인 이전·URL 구조 변경·플랫폼 마이그레이션 시 SEO 자산을 안전하게 옮기는 운영 워크플로우. D-30 사전 준비부터 D+90 모니터링·롤백까지 전체 라이프사이클 가이드.
---

# 사이트 이전 SEO 워크플로우 (site-migration-seo)

> 소스:
> - Google Search Central — Site moves with URL changes: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
> - Google Search Console — Change of Address tool: https://support.google.com/webmasters/answer/9370220
> - Google Search Central — Managing Multi-Regional Sites: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
> - John Mueller — redirect chain hops 권장: https://www.searchenginejournal.com/googles-john-mueller-recommends-less-than-5-hops-per-redirect-chain/344664/
> - John Mueller — staggered migration 경고 (2025-12): https://www.searchenginejournal.com/google-staggered-site-migrations/563346/
>
> 검증일: 2026-06-02

이 스킬은 사이트 이전 *전체 라이프사이클*(준비 → D-Day → 회복)을 다룬다. 301 redirect 문법·canonical 헤더 등 *구체 구현*은 [[url-canonicalization-redirects]] 스킬에 위임한다.

---

## 1. 이전 유형 4가지

Google이 공식적으로 인정하는 URL 변경 사례는 다음과 같다 (Search Central 분류).

| 유형 | 예시 | GSC Change of Address 필요? | 위험도 |
|------|------|:--:|:--:|
| 프로토콜 변경 | `http://` → `https://` | ❌ (불필요) | 낮음 |
| URL 경로 변경 | `/blog/123` → `/posts/123` | ❌ (도메인 동일) | 중간 |
| 도메인 변경 | `old.com` → `new.com` | ✅ 필수 | 높음 |
| 호스팅·플랫폼 변경 | WordPress → Next.js (URL 유지) | ❌ | 중간 |

> **핵심 원칙**: GSC Change of Address 도구는 *도메인 변경*에만 적용된다. HTTPS 전환·www↔non-www·경로 변경에는 사용 불가 (Search Console 공식 문서 명시).

여러 변경이 *동시에* 일어나면 위험도가 곱셈으로 커진다. 예: "도메인 변경 + URL 구조 변경 + 디자인 개편"을 한 번에 하면 트래픽 폭락 진단이 거의 불가능하다. *단계 분리* 원칙 (§9 참조).

---

## 2. 타임라인 한눈에 (D-30 → D+90)

| 시점 | 작업 |
|------|------|
| **D-30** | 현재 인덱싱 URL 전체 추출, 트래픽 상위 URL 식별, 백링크 인벤토리 작성 |
| **D-21** | URL 매핑 표 초안 (old → new 1:1) |
| **D-14** | staging 환경에서 신 사이트 검증 (robots.txt·canonical·hreflang) |
| **D-7** | 매핑 표 최종 확정, 301 redirect 룰 작성·QA, sitemap 양쪽 준비 |
| **D-Day** | DNS 또는 redirect 활성화, 신 sitemap GSC 제출, 구 sitemap도 일정 기간 유지 |
| **D+1 ~ D+7** | 신 사이트 크롤 오류 모니터링, 누락 redirect 즉시 보완 |
| **D+14** | GSC Change of Address 신청 (도메인 변경 시) |
| **D+30** | 인덱싱 전환률 점검, 트래픽 회복 곡선 확인 |
| **D+90** | 전체 회복 평가, 백링크 갱신 요청, 롤백 여부 판정 |
| **D+365** | redirect 유지 종료 검토 (영구 유지 권장) |

---

## 3. D-30 ~ D-7: 이전 전 준비

### 3-1. 현재 사이트 인벤토리

**A. 인덱싱 URL 전체 추출**

| 소스 | 한계 |
|------|------|
| `sitemap.xml` | 제출한 URL만, 실제 인덱싱 여부 모름 |
| GSC > 페이지 (Coverage) 보고서 | 실제 Google이 인지한 URL, 1,000건 export 제한 |
| GSC > 성능 보고서 (Search Analytics API) | 트래픽이 있던 URL만 |
| 크롤러(Screaming Frog 등) | 내부 링크 기반, 고아 URL 누락 가능 |

복수 소스를 *합집합*으로 수집한다. 어느 한 소스도 완전하지 않다.

**B. 트래픽 우선순위 식별**

- GSC 성능 > 페이지 탭: 클릭·노출 상위 100~500개 URL
- Google Analytics 또는 동등 분석 도구: 랜딩 페이지 기준 상위 트래픽
- **상위 트래픽 URL은 1:1 매핑이 *반드시* 필요**한 항목으로 표시

**C. 외부 백링크 인벤토리**

- GSC > 링크 보고서 — 무료, Google 인지 기준
- 외부 SEO 도구(Ahrefs / Semrush / Majestic 등) — 더 완전, 유료

도메인 변경 시 *고권위 외부 링크*는 가능하면 사이트 운영자에게 새 URL로 업데이트 요청을 보낸다 (redirect만으로는 PageRank가 100% 넘어가지만 시간이 걸린다).

### 3-2. URL 매핑 표

| old URL | new URL | 트래픽 등급 | 매핑 유형 |
|---------|---------|:--:|:--:|
| `old.com/blog/post-1` | `new.com/posts/post-1` | A (상위 10%) | 1:1 직접 |
| `old.com/blog/post-2` | `new.com/posts/post-2` | B | 1:1 직접 |
| `old.com/old-category/` | `new.com/topics/` | C (저트래픽) | 1:1 카테고리 |
| `old.com/discontinued-x` | `new.com/topics/` | D (제거 예정) | N:1 (마지막 수단) |

**원칙:**
- *1:1 직접 매핑*이 정공법. 같은 의도·같은 내용의 페이지로 보낸다.
- *N:1 group page* (예: 100개 상품 페이지를 카테고리 1개로 통합)은 Google이 "soft 404"로 취급할 수 있다. 진짜 동일한 의도일 때만.
- 매핑이 *없는* old URL은 410 Gone을 반환하는 것이 404보다 명시적 (Google이 더 빨리 제거).

> **금지**: "여러 오래된 URL을 한 관련 없는 목적지로 redirect하지 말 것" (Search Central 공식 표현).

### 3-3. staging 환경 검증

- staging은 *반드시* `robots.txt`로 차단 + `noindex` 메타 또는 HTTP Basic Auth로 봉인
- 운영 전환 시 staging용 차단 설정이 *그대로 신 사이트에 잔재되는지* 점검 — **D-Day 최대 사고 원인**
- canonical 태그가 신 URL을 가리키는지 확인
- 다국어 사이트는 hreflang cross-reference가 신 URL 기준으로 일관성 있는지 확인

---

## 4. 301 vs 302 — 선택 기준

| 코드 | 의미 | SEO 신호 이전 |
|------|------|:--:|
| 301 Moved Permanently | 영구 이전 | ✅ 100% (Gary Illyes 공식 확인) |
| 308 Permanent Redirect | 영구 이전, 메서드 보존 | ✅ 동일 |
| 302 Found | 임시 이동 | ❌ 원본을 유지한다고 판단, 신호 이전 안 됨 |
| 307 Temporary Redirect | 임시 이동, 메서드 보존 | ❌ 동일 |

**사이트 이전에는 반드시 301 또는 308**을 사용한다. 302를 영구 이전에 잘못 사용하는 것이 *site migration에서 가장 흔한 기술적 실수*다 (업계 공통 보고).

> **주의**: 일부 자료는 "Google이 시간이 지나면 302를 301로 인식한다"고 하지만, 인식 시점이 *예측 불가능*하므로 의존하면 안 된다. 처음부터 올바른 코드를 반환하라.

구체적인 Nginx·.htaccess·Next.js 등 *서버별 redirect 문법*은 [[url-canonicalization-redirects]] 스킬을 참조한다. 이 스킬에서는 이전 *프로세스*에 집중한다.

---

## 5. redirect chain 회피

John Mueller 공식 권장: **redirect chain은 5 hops 미만, 가능하면 1 hop**.

- Googlebot은 한 번의 크롤 시도에서 최대 5 hops까지만 따라간다.
- 5 hops를 넘으면 최종 URL에 도달 못 하고 인덱싱 실패.
- chain은 site migration이 반복되며 누적된다 — 매번 *원본 URL을 최종 목적지에 직접* 매핑해야 한다.

**나쁜 예 (chain):**
```
old.com/a → middle.com/a → new.com/posts/a
```

**좋은 예 (직접):**
```
old.com/a → new.com/posts/a
```

이전 작업 후 *이전에 있던 redirect 룰을 갱신*해서 모두 최종 URL을 직접 가리키게 정리한다.

---

## 6. D-Day 체크리스트

이전 당일 순서 (도메인 변경 기준).

### 사전 (D-Day 0시간 전)

- [ ] 신 사이트 robots.txt 정상 (staging 차단 패턴 잔재 없음)
- [ ] 신 사이트 모든 페이지에 canonical = 신 URL 적용
- [ ] 신 sitemap.xml 발행 (신 도메인의 모든 URL)
- [ ] 301 redirect 룰 staging에서 1차 검증 (curl -I로 스팟 체크)
- [ ] 모니터링 대시보드 준비 (GSC, GA, 서버 로그)

### 전환 시점

- [ ] 구 도메인에서 신 도메인으로 301 활성화
- [ ] DNS 변경이 필요한 경우 TTL 사전 단축 (1시간 이하)
- [ ] 신 사이트 sitemap을 신 도메인 GSC 속성에 제출
- [ ] *구 사이트 sitemap을 즉시 삭제하지 말 것* — 구 GSC 속성에 유지하여 Googlebot이 redirect를 발견하게 한다

### 직후 (D-Day +1~24시간)

- [ ] curl -I로 핵심 URL 100개 redirect 응답 검증 (`301` 응답 + `Location:` 헤더 신 URL)
- [ ] GSC URL 검사 도구로 구 URL 5~10개 진단 — "redirect로 이동됨" 표시 확인
- [ ] 서버 로그에서 Googlebot 크롤 발생 확인
- [ ] 5xx 에러 비율 모니터링 (트래픽 급증에 서버가 견디는지)

### D+14: GSC Change of Address (도메인 변경 시)

도메인 변경에 한해 다음 절차를 수행한다.

1. 신·구 도메인 *모두* GSC에 등록 + 소유권 확인
2. 동일한 Google 계정으로 두 속성 관리
3. 구 도메인 속성 > 설정 > "주소 변경" 도구 진입
4. 신 도메인 선택, 301 redirect·HTTPS 정상 작동 자동 점검
5. 신청 후 **180일간** 신호 이전 + 알림 표시

> **주의**: Change of Address는 *도메인 수준 속성*에만 적용. URL 접두사 속성(`http://example.com/petstore/`)에는 불가.

---

## 7. D+1 ~ D+90: 모니터링

### 7-1. 인덱스 전환 추적 (GSC)

| 속성 | 보고서 | 보는 지표 |
|------|--------|----------|
| 구 도메인 | 페이지 (Coverage) | "리다이렉션됨" 또는 "Excluded — Redirect" *증가* 추세 |
| 구 도메인 | 색인 생성된 페이지 | *감소* 추세 |
| 신 도메인 | 색인 생성된 페이지 | *증가* 추세 |
| 신 도메인 | Sitemaps | 제출 URL 대비 인덱싱 비율 |

신·구 양쪽 GSC가 *서로 거울처럼* 움직여야 한다. 양쪽이 동시에 감소하면 redirect 실패 또는 noindex 잔재 가능성.

### 7-2. 트래픽 회복 곡선 (정상 범위)

| 시점 | 정상 트래픽 (이전 대비) | 이상 신호 |
|------|---|---|
| D+1~7 | 50~70% (30~50% 일시 하락 정상) | 90% 이상 하락 → 즉시 redirect·robots 진단 |
| D+14~28 | 70~90% 회복 | 50% 이하 정체 → 매핑 누락·5xx 에러 의심 |
| D+30~60 | 85~100% | 80% 이하 정체 → 콘텐츠 변경·중복 issue 의심 |
| D+90 | 100% 또는 초과 | 70% 이하 → 롤백 또는 대대적 진단 필요 |

> **주의**: 회복 곡선은 사이트 규모·이전 유형에 따라 크게 다르다. 한 분석(892건 마이그레이션)은 신 도메인이 구 도메인 트래픽을 회복하는 데 평균 *523일*이 걸렸다고 보고했다. 작은 사이트는 몇 주, 대형 엔터프라이즈는 수개월. 위 표는 *중간 규모 기준*이며 일반 보고치다.

### 7-3. 핵심 진단 포인트

문제 발견 시 우선순위:

1. **`curl -I {구 URL}` → 301 + 정확한 Location?**
2. **신 URL이 직접 200 OK?** (redirect 결과가 또 다른 redirect로 가지 않음)
3. **GSC URL 검사**에서 신 URL이 "색인 생성됨"?
4. **canonical** 태그가 *신* URL?
5. **robots.txt**가 신 URL을 차단하지 않음?
6. **noindex** 메타 잔재 없음? (staging에서 가져온 흔적)

---

## 8. 다국어 사이트 이전 (hreflang)

다국어 사이트는 hreflang cross-reference가 *전체 클러스터*로 작동한다. **하나라도 깨지면 클러스터 전체가 무시된다** (Google 공식).

이전 시 주의:

- 신 사이트의 hreflang이 *신 URL* 기준으로 모두 일관성 있게 cross-reference (return tag 양방향)
- ISO 639-1 언어 코드 + ISO 3166-1 Alpha-2 지역 코드 정확히 사용
- `x-default` hreflang 설정 유지 또는 의도적으로 변경
- GSC > Legacy tools > International Targeting 보고서로 에러 모니터링 (현재 GSC 신버전에서는 일부 기능 deprecated 가능, WebSearch로 최신 상태 확인 권장)

다국어 sitemap은 *언어별 분리* 또는 *통합* 둘 다 가능. 이전 시 기존 구조를 유지하는 것이 변수를 줄인다.

> 다국어 SEO 자세한 내용은 별도 i18n-seo 스킬 영역. 이전 시점에는 "기존 hreflang 구조를 *변경하지 말고 그대로 옮기는*" 원칙.

---

## 9. 동시에 하지 말아야 할 것

**원칙: 한 번에 하나만 바꾼다.**

이전 시 *동시*에 진행하면 트래픽 폭락 시 원인 진단이 거의 불가능해지는 조합:

| 조합 | 위험 |
|------|------|
| 도메인 변경 + URL 구조 변경 | 신·구 URL 매핑 복잡도 폭증 |
| URL 구조 변경 + 디자인 전면 개편 | UX 변경·콘텐츠 변경 영향 분리 불가 |
| 플랫폼 변경 + 콘텐츠 재작성 | "기술" 문제인지 "콘텐츠" 문제인지 판단 불가 |
| 도메인 + 플랫폼 + 디자인 동시 | 최악, 트래픽 50%+ 손실 위험 |

**권장 단계 분리:**
```
Phase 1: 플랫폼 변경 (URL 유지)  →  4~8주 안정화
Phase 2: URL 구조 변경            →  4~8주 안정화
Phase 3: 도메인 변경              →  Change of Address
Phase 4: 디자인·콘텐츠 개편      →  분리 모니터링
```

### staggered (부분) migration 경고

John Mueller(2025-12)는 *부분 이전*도 위험하다고 공식 발언했다.

- 사이트의 일부만 신 도메인으로 옮기면 Google이 "어디가 어디 소속인지" 판단 어려움
- 신·구 도메인이 *각각 독립*된 사이트로 평가됨 → 도메인 권위 분산
- "messy outcome" — 신호가 깔끔히 이전되지 않음

**원칙**: 도메인 이전은 *전체*를 한 번에. 어쩔 수 없이 부분 이전한다면 가능한 한 빨리 나머지도 이전한다.

---

## 10. 흔한 실수 모음

| 실수 | 결과 | 예방 |
|------|------|------|
| 302를 영구 이전에 사용 | SEO 신호 이전 안 됨 | 301 또는 308 사용 |
| redirect chain 3단 이상 | 인덱싱 실패, 속도 저하 | 항상 *최종 URL로 직접* |
| 신 사이트 출시 후 구 사이트 즉시 종료 (404) | 신호 이전 기회 상실 | 최소 1년, 가능하면 영구 redirect 유지 |
| 신 sitemap만 제출, 구 sitemap 즉시 삭제 | Googlebot이 redirect 발견 지연 | 구 sitemap도 일정 기간 유지 |
| canonical을 구 URL로 남겨둠 | 인덱싱 혼란, duplicate 신호 | 신 사이트 canonical = 신 URL |
| staging의 noindex·robots.txt 차단 잔재 | 신 사이트 인덱싱 실패 | D-Day 직후 신 URL을 GSC URL 검사로 진단 |
| GSC 소유권 미확인 후 Change of Address 시도 | 신청 불가 | 신·구 양쪽 사전 등록 + 동일 계정 |
| N:1 매핑 남용 (관련 없는 페이지 통합) | soft 404 또는 신호 손실 | 1:1 직접 매핑 우선, N:1은 마지막 수단 |
| 백링크 정리 누락 | 외부 신호가 redirect를 거쳐 우회 | 고권위 외부 사이트에 갱신 요청 |
| redirect 1년 미만 제거 | 미회복 신호 영구 손실 | 최소 1년, 영구 권장 |
| 동시 변경 폭주 (도메인+URL+디자인) | 진단 불가, 회복 불가 | 단계 분리 |

---

## 11. 롤백 시나리오

**롤백 고려 기준:**

- D+30 기준 트래픽 회복률이 50% 미만
- D+60 기준 70% 미만 + 정체 추세
- 핵심 비즈니스 페이지의 검색 노출이 회복되지 않음

**롤백 결정 시 주의:**

- 롤백 자체가 *또 한 번의 이전*이다 — 신호 혼란 가중
- 부분 롤백(일부 URL만 구 위치로)은 staggered migration 문제와 동일
- 가능하면 *완전 롤백*: 신 → 구 방향 301로 전환 + GSC Change of Address 재신청
- 롤백 전에 진단을 먼저: 회복 실패 원인이 *이전 자체*인가, *동시에 한 다른 변경*인가

**권장**: 트래픽 폭락 발견 즉시 롤백보다 *원인 진단 → 부분 수정*이 우선. 대부분의 회복 실패는 redirect 누락·robots 차단·canonical 오류 등 *수정 가능한 기술 실수*에서 온다.

---

## 12. redirect 유지 기간

Google 공식 권장: **최소 1년**.

| 기간 | 의미 |
|------|------|
| ~ 30일 | Googlebot이 redirect를 인지하기 시작하는 초기 |
| ~ 6개월 | 대부분의 인덱스 신호 이전 완료 |
| ~ 1년 (Google 최소 권장) | 외부 백링크가 자연스럽게 갱신될 시간 |
| 영구 | 사용자 북마크·외부 인용 영구 보호 (저비용, 권장) |

**영구 유지를 권장하는 이유:**
- 1년 이후에도 사용자 북마크·이메일 링크·인쇄물 등에서 구 URL 접근 발생
- redirect 룰 자체의 운영 비용은 거의 0
- 1년 뒤 제거 시 또 한 번 손실 위험

---

## 13. 이 스킬을 *사용하지 않을* 경우

- *내용·디자인만 바꾸고 URL은 그대로* 두는 경우 — 이 스킬은 URL 변화가 있는 이전에 한정. 단순 콘텐츠 리뉴얼은 redirect가 필요 없으므로 다른 영역(콘텐츠 SEO).
- *staging·dev 환경 간 이동* — 검색 노출이 없는 환경은 SEO 관점 무관.
- *지역 단위 마이크로 변경* (예: 1~5개 URL만 변경) — 정식 마이그레이션 절차보다 단건 301로 처리.

---

## 부록 — 코드 예시 (포인터)

자세한 redirect 구현 문법은 [[url-canonicalization-redirects]] 스킬 참조. 여기서는 *이전 워크플로우 관점*의 최소 예시만.

**Nginx (도메인 변경, 경로 보존):**
```nginx
server {
    listen 80;
    server_name old.com www.old.com;
    return 301 https://new.com$request_uri;
}
```

**.htaccess (Apache, URL 구조 변경):**
```apache
RewriteEngine On
RewriteRule ^blog/(.*)$ https://new.com/posts/$1 [R=301,L]
```

> 위 두 예시는 *전체 사이트 단위* 패턴 redirect다. URL 매핑이 1:1로 다른 경우는 *URL별 룰 테이블*이 필요하다 — [[url-canonicalization-redirects]] 참조.
