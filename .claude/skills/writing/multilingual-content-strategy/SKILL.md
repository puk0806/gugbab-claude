---
name: multilingual-content-strategy
description: >
  다국어 콘텐츠 전략 가이드. Translation·Localization·Transcreation·i18n 구분과
  한국어·영어·일본어·중국어 SEO·문화 특수성, hreflang·Baidu·기계 번역 정책까지 정리.
  <example>사용자: "영문 블로그를 한국어·일본어·중국어로 번역하려는데 SEO 관점에서 무엇을 주의해야 해?"</example>
  <example>사용자: "Just Do It 같은 슬로건을 다른 언어로 옮길 때 그냥 번역하면 안 되는 이유는?"</example>
  <example>사용자: "중국 본토와 대만에 같은 페이지를 노출하려면 hreflang을 어떻게 써야 해?"</example>
---

# 다국어 콘텐츠 전략 (Multilingual Content Strategy)

> 소스:
> - Google Search Central — Localized versions of pages: https://developers.google.com/search/docs/specialty/international/localized-versions
> - Google Search Central Blog — March 2024 core update and new spam policies: https://developers.google.com/search/blog/2024/03/core-update-spam-policies
> - W3C i18n Working Group / BCP 47: https://www.w3.org/International/articles/language-tags/
> - Yahoo Japan / Google partnership (Wikipedia 종합): https://en.wikipedia.org/wiki/Yahoo_Japan
> - 일본 공정거래위원회(JFTC) 2010 발표: https://www.jftc.go.jp/en/pressreleases/yearly-2010/dec/individual-000002.html
>
> 검증일: 2026-06-04

---

## 1. 번역 · 현지화 · 트랜스크리에이션 · i18n 구분

| 구분 | 정의 | 사용 시점 | 예시 |
|------|------|-----------|------|
| **Translation** | 원문 의미를 목표 언어로 1:1 옮김 | 법적·계약·기술 문서 | 사용설명서, 약관, 특허 명세서 |
| **Localization (L10n)** | 언어 + 문화·형식·통화·날짜·이미지·UX 적응 | 소프트웨어·웹사이트·앱 | 통화·날짜 형식·문화 이미지 교체 |
| **Transcreation** | 의미보다 *감정·브랜드 임팩트* 재창조 | 광고·슬로건·헤드라인 | "Just Do It" → 시장별 카피로 재작성 |
| **Internationalization (i18n)** | 현지화 가능하도록 *코드·콘텐츠 설계* | 개발·아키텍처 단계 | 하드코딩 문자열 제거, RTL/LTR·복수형 처리 |

> 관계도: **i18n → L10n → Translation/Transcreation**.
> i18n이 안 된 코드는 L10n 비용이 폭증한다. 슬로건/CTA는 Translation으로는 부족하고 Transcreation이 필요하다.

---

## 2. 언어별 SEO 특수성

### 2-1. 한국어 (ko)

- **검색 점유율**: 네이버가 여전히 상당 점유율 → Google SEO와 **네이버 SEO 병행**이 일반적 권장.
  (네이버 세부 가이드는 `frontend/naver-seo-specifics` 스킬 참조)
- **키워드 형태소·조사**: "강남 맛집"·"강남맛집"·"강남에서 맛집" 등 조사 변형으로 검색량이 갈린다 → 키워드 도구로 변형별 검색량 확인 필수. 영어 키워드를 직역해서 그대로 쓰면 실제 검색 행태와 어긋난다.
- **URL 슬러그**: 한국어 한글 URL은 인코딩(`%EA%B0...`) 시 가독성·공유 안정성 저하 → 영문 슬러그 권장.
- **톤**: 구어체("~해요") vs 문어체("~습니다") 혼용은 신뢰감을 낮춘다. 도메인별 일관성 유지.

### 2-2. 영어 (en) — 미국 vs 영국

| 항목 | 미국 (en-US) | 영국 (en-GB) |
|------|--------------|--------------|
| 철자 | color, organize, center | colour, organise, centre |
| 날짜 | MM/DD/YYYY | DD/MM/YYYY |
| 통화 | $ (USD) | £ (GBP) |
| 1층 표기 | 1st floor | Ground floor |

- **hreflang 전략**:
  - 콘텐츠·가격·CTA가 다르면 `en-US` / `en-GB` *분리* + `x-default`
  - 콘텐츠가 동일하면 `en` 단일 + `x-default`로 단순화 가능

### 2-3. 일본어 (ja)

- **Yahoo! Japan은 2010년부터 Google 검색 기술 기반**으로 운영된다.
  > 주의: "2023년 전환 완료"는 사실이 아니다. 일본 공정거래위원회(JFTC) 2010년 발표 및 Yahoo Japan 자체 공식 발표 시점이 2010년이다.
  > 단, **Yahoo Japan ↔ Google 파트너십은 2025년 만료 예정**이며 Yahoo Japan은 NAVER 등 대안을 검토 중이라는 보도가 있다. 2025년 이후 검색 백엔드 전환 여부는 재확인 필요.
- **실무 함의 (현 시점 기준)**: 일본 SEO는 *Google SEO를 기본으로* 수행하면 Yahoo! Japan SERP도 거의 함께 커버된다. 단, Yahoo! Japan의 *UI·디스플레이 광고·Yahoo Shopping*은 별도 채널로 남아 있다.
- **URL 슬러그**: 히라가나/가타카나/한자 URL은 인코딩 시 길고 깨지기 쉬움 → 영문 슬러그 권장.
- **표기 체계 키워드 조사**: 같은 단어가 한자(寿司)·히라가나(すし)·가타카나(スシ)·로마자(sushi)로 검색된다. 검색자는 종종 *히라가나·가타카나*로 검색하므로 키워드 도구로 표기별 검색량 확인 필수.
- **존경어 결정**: ます/です(존댓말) vs だ/である(상체) 중 어느 톤인지 사이트 전반에서 통일.

### 2-4. 중국어 — 간체(zh-CN) vs 번체(zh-TW)

| 시장 | 주력 검색엔진 | 주의 사항 |
|------|---------------|-----------|
| 중국 본토 | **Baidu** 1위 (Google 차단) | ICP 등록·중국 내 호스팅이 SEO에 유리 |
| 대만 | Google 주력 | zh-TW (번체) 콘텐츠 |
| 홍콩 | Google 주력 | 번체 중심, 광둥어 어휘·표현 고려 |
| 싱가포르/말레이시아 화교 | Google 주력 | 보통 zh-Hans(간체) 사용 |

- **hreflang 표기** (Google Search Central 공식 지원):
  - 지역 기반: `zh-CN` (간체·중국), `zh-TW` (번체·대만), `zh-HK` (홍콩)
  - **스크립트 기반 (권장도 동일)**: `zh-Hans` (간체), `zh-Hant` (번체) — ISO 15924 스크립트 코드
  - 둘 다 유효. 시장이 *지역 단위로 다르면* 지역 기반, *문자 체계 단위로 다르면* 스크립트 기반이 의도를 명확히 한다.
- **Baidu SEO 핵심 요소**:
  - **ICP 라이선스(ICP 备案/ICP 许可证)** — 중국 본토 호스팅에 *법적으로 필수*. Baidu 랭킹의 직접 요건은 아니지만, ICP 없는 사이트는 유기 검색 노출이 *현저히 낮아진다*고 보고된다.
  - **호스팅 위치** — 중국 본토 서버 호스팅 시 GFW(만리방화벽) 통과로 페이지 속도가 빠름 → Baidu 친화적.
  - **Baidu Search Console (百度站长平台 / 百度搜索资源平台)** 등록.
  - **HTTPS** 권장.

---

## 3. 문화 적응 체크리스트

### 3-1. 색상 의미 차이 (예시 — 시장별로 정밀 검증 필요)

| 색상 | 한국·중국 | 서구권 | 일본 |
|------|-----------|--------|------|
| 빨강 | 행운·축제·결혼 | 위험·경고·열정 | 축제·정열 |
| 흰색 | 전통적으로 장례·상복 | 순수·결혼 | 순수·신성 |
| 노랑 | 황실·고귀(중국) | 주의·겁쟁이 | 주의 |
| 검정 | 격식·고급 | 격식·장례·고급 | 격식·정장 |

> 주의: 위 매핑은 *일반적 경향*이며 세대·맥락·산업별 차이가 크다. 브랜드 컬러 결정 시 현지 리서치 필수.

### 3-2. 숫자 · 날짜 · 시간 형식

| 항목 | 한국 | 미국 | 영국·유럽 대륙 | 일본 | 중국 |
|------|------|------|----------------|------|------|
| 날짜 | YYYY.MM.DD / YYYY-MM-DD | MM/DD/YYYY | DD/MM/YYYY 또는 DD.MM.YYYY | YYYY年MM月DD日 | YYYY年MM月DD日 |
| 시간 | 24h 일반 | 12h (AM/PM) | 24h 일반 | 24h 일반 | 24h 일반 |
| 천 단위 | 쉼표 `1,000`, 큰 수는 만(萬) 단위 | 쉼표 `1,000`, 큰 수는 K/M | 쉼표 또는 점/공백 | 쉼표 `1,000`, 만 단위 | 쉼표 `1,000`, 万 단위 |
| 전화 | 010-XXXX-XXXX / +82-10-... | (XXX) XXX-XXXX / +1-... | +44-... 등 | 090-XXXX-XXXX / +81-... | +86-... |

### 3-3. 경칭·호칭

- 한국: 직함+님("팀장님"), 직함+씨("김 과장씨"), 친밀 시 이름+님. 비즈니스에서 First Name 단독은 부적절.
- 일본: `~さん`(범용), `~様`(고객·격식), `~先生`(전문직), `~くん`/`~ちゃん`(친밀·하급). 비즈니스 기본은 `~さん` / 고객은 `~様`.
- 중국: `先生`(남)/`女士`(여), 직함+이름 흔함. 본토와 대만에서 격식 어휘가 다를 수 있음.
- 영어: First Name 기본, 격식은 `Mr./Ms. + Last Name`.

---

## 4. 콘텐츠 현지화 우선순위 프레임워크

```
1단계: Translation (의미 보존 ≈ 90% 유사)
   대상: 법적 고지·개인정보처리방침·사용자 가이드·기술 문서·SLA
   품질 기준: 정확성 > 자연스러움. 용어집(termbase) + 번역 메모리(TM) 활용.

2단계: Localization (문화·형식 적응, 의미는 70% 유지)
   대상: 마케팅 페이지·블로그·제품 설명·이메일 본문·UI 문구
   품질 기준: 자연스러움 + 현지 검색·관습 반영. 키워드 리서치 *현지 언어 기준*으로 재수행.

3단계: Transcreation (감정·임팩트 재창조, 원문 40~60% 재구성)
   대상: 광고 카피·슬로건·이메일 제목·소셜 후크·CM
   품질 기준: 현지 시장 반응. 카피라이터·문화 컨설턴트 협업.
```

**선택 기준 의사결정 트리**

```
콘텐츠가 법적/계약 효력을 갖는가? → Translation (직역 + 법무 검토)
        ↓ 아니오
사용자 행동을 유도하는 마케팅 콘텐츠인가? → Localization (현지 키워드·문화 적응)
        ↓ 아니오 (헤드라인·슬로건·광고)
브랜드 인지·감정 임팩트가 핵심인가? → Transcreation (카피라이팅 재창조)
```

---

## 5. 다국어 SEO 기술 구현

### 5-1. hreflang (Google Search Central 공식)

```html
<!-- 한국어 -->
<link rel="alternate" hreflang="ko"     href="https://example.com/ko/page" />
<!-- 영어 (지역 통합) -->
<link rel="alternate" hreflang="en"     href="https://example.com/en/page" />
<!-- 일본어 -->
<link rel="alternate" hreflang="ja"     href="https://example.com/ja/page" />
<!-- 중국어 (간체·번체 분리) -->
<link rel="alternate" hreflang="zh-Hans" href="https://example.com/zh-cn/page" />
<link rel="alternate" hreflang="zh-Hant" href="https://example.com/zh-tw/page" />
<!-- 기본 fallback -->
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

**핵심 규칙** (공식):
- 언어 코드는 **ISO 639-1**, 지역 코드는 **ISO 3166-1 Alpha-2**, 스크립트 코드는 **ISO 15924**.
- 지원 형태: `de`, `de-CH`, `zh-Hans`, `zh-Hans-US`.
- **지역 코드만 단독 사용 불가** (`hreflang="us"` 같은 표기 금지).
- 상호 참조(reciprocal) 필수: A→B를 선언했으면 B→A도 선언.
- `x-default`로 기본 fallback URL 명시.

(상세 i18n SEO 패턴은 `frontend/i18n-seo` 스킬 참조)

### 5-2. 기계 번역(MT)과 Google 정책

- Google은 **March 2024 core update**와 함께 **"Scaled content abuse"** 스팸 정책을 발표했다.
- 정책 핵심 (공식 인용):
  > *"…including through automated transformations like synonymizing, translating, or other obfuscation techniques, where little value is provided to users"*
  > → **자동 번역으로 *대량 페이지를 생산*하고 *사용자에게 가치를 거의 제공하지 않는* 경우** 스팸 정책 위반.
- **MT 자체가 자동 페널티 대상은 아니다.** 핵심은:
  1. **사람 검토(post-editing)** 가 들어갔는가
  2. 사용자에게 **고유한 가치**를 제공하는가
- 법적·의료·금융 문서는 MT 단독 사용 금지 (오역 시 법적 책임).

---

## 6. 표준 번역 워크플로우

```
[1] 원본 콘텐츠 작성 (ko 또는 en — source language 명확화)
        ↓
[2] 키워드 리서치 — 언어별 *독립* 조사 (직역 키워드 사용 금지)
        ↓
[3] 용어집(Termbase) · 번역 메모리(TM) 준비
        ↓
[4] 번역 / 현지화 — 전문 번역가 단독 또는 MT + 사람 후편집(MTPE)
        ↓
[5] 문화 검토 — 현지 리뷰어가 톤·이미지·색상·예시 점검
        ↓
[6] 현지 SEO 최적화 — 현지 키워드 삽입, 메타 태그(`title`/`description`) 재작성, hreflang
        ↓
[7] QA — 링크·날짜/통화/숫자 형식·이미지 `alt`·폼 검증 메시지 확인
        ↓
[8] 배포 후 모니터링 — 언어별 Search Console·Analytics 분리 추적
```

---

## 7. 기계 번역(MT) 활용 가이드

| 도구 | 강점 | 약점 | 추천 용도 |
|------|------|------|-----------|
| **DeepL** | 한국어·일본어·유럽어 자연스러움 | 도메인 특화 어휘 약함, 일부 언어 미지원 | 마케팅·블로그 초안 |
| **Google Cloud Translation API** | 100+ 언어, 대량·저렴 | 자연스러움은 DeepL보다 평균적으로 낮다는 평가 | 대량 카탈로그·UGC |
| **Amazon Translate** | AWS 통합 | 품질 평이 | AWS 파이프라인 통합 |
| **자체 LLM (GPT/Claude 등)** | 맥락 이해·톤 조정 우수 | 비용·일관성 관리 필요 | 카피·트랜스크리에이션 초안 |

**후편집(Post-Editing) 레벨**:
- **Light PE**: 의미만 통하면 OK — 내부 문서·UGC
- **Full PE**: 사람이 작성한 수준 — 마케팅 페이지·외부 공개 콘텐츠
- **No MT**: 법적·의료·고난도 카피 — 전문 번역가 처음부터

> 주의: 법적 문서·의료 콘텐츠·금융 약관은 MT 단독 사용 금지. 책임 소재가 발생한다.

---

## 8. 흔한 실수 패턴

1. **원본 언어 기준으로만 키워드 리서치** → 직역 키워드가 현지 검색 행태와 어긋남.
   - 예: 영어 "best running shoes"를 그대로 한국어 "최고의 러닝화"로 번역. 한국 사용자는 "러닝화 추천"으로 더 많이 검색.
2. **중국어 간체·번체를 같은 페이지에 혼재** → Baidu·Google 양쪽에서 신호 약화 + 사용자 신뢰 손상.
3. **2023년 이후에도 Yahoo! Japan SEO를 Google과 별개로 관리**.
   > 주의: Yahoo! Japan은 2010년부터 Google 검색 기술 기반. 단, 2025년 파트너십 만료 후 대안(NAVER 등) 전환 가능성이 보도되고 있어 *2025년 이후* 상황은 재점검 필요.
4. **문화 검토 없이 이미지·색상·유머·이모지 그대로 번역** → 현지 정서 충돌(예: 빨강·흰색 색상 의미 차이).
5. **hreflang 상호 참조 누락** → Google이 신호를 무시.
6. **hreflang에 잘못된 지역 코드** (예: `hreflang="uk"`는 무효 — 영국은 `gb`).
7. **MT 결과를 사람 검토 없이 대량 배포** → Google "Scaled content abuse" 정책 위반 가능.
8. **법적 약관·개인정보 처리방침을 Transcreation** → 법적 의미 변형으로 분쟁 위험. 이 영역은 Translation 고정.
9. **날짜·통화·전화번호 형식 직접 노출 후 미변환** → 현지 사용자 혼동(예: `01/05/2026` → 미국은 1월 5일, 영국은 5월 1일).
10. **URL을 비-ASCII 문자(한글·한자)로 노출** → 인코딩 후 길이 폭증, 공유·로그 가독성 저하.

---

## 9. 관련 스킬

- `frontend/i18n-seo` — hreflang·sitemap·canonical 상세 패턴
- `frontend/naver-seo-specifics` — 네이버 SEO 세부
- `writing/seo-content-structure` (있는 경우) — 콘텐츠 구조 SEO

---

## 10. 출처 요약

| 항목 | 소스 | 신뢰도 |
|------|------|--------|
| hreflang 표준 / 중국어 코드 | Google Search Central 공식 | ⭐⭐⭐ |
| Scaled content abuse 정책 | Google Search Central Blog (2024-03) | ⭐⭐⭐ |
| Yahoo Japan-Google 파트너십 시점 (2010) | 일본 공정거래위원회 발표, Wikipedia | ⭐⭐⭐ / ⭐⭐ |
| Baidu ICP 관련 | 다수 산업 보고서 (Hilborn·Sinorbis 등) | ⭐⭐ |
| BCP 47 / ISO 639·3166·15924 | W3C i18n / IETF | ⭐⭐⭐ |
