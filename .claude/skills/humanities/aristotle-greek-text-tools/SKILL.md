---
name: aristotle-greek-text-tools
description: >
  도덕윤리교육 전공 대학원생이 아리스토텔레스 1차 텍스트(특히 *니코마코스 윤리학*)를
  그리스어 원전으로 직접 다룰 때 활용하는 디지털 도구·사전·비평본·인용 표기 가이드.
  akrasia 논문 작성처럼 핵심 개념의 어원·문법 분석이 필요한 상황에 최적화되어 있다.
---

# 아리스토텔레스 그리스어 원전 활용 도구

> 소스:
> - Perseus Digital Library (https://www.perseus.tufts.edu/)
> - Logeion (https://logeion.uchicago.edu/)
> - Thesaurus Linguae Graecae (http://stephanus.tlg.uci.edu/)
> - Library of Congress ALA-LC Romanization Tables (https://www.loc.gov/catdir/cpso/romanization/greeka.pdf)
> - SIL Gentium Plus (https://software.sil.org/gentium/)
> 검증일: 2026-05-03

---

## 1. Perseus Digital Library — 1차 텍스트 + 형태소 분석

**운영:** Tufts University 고전학과 (비영리). Perseus 4.0 hopper와 차세대 Scaife Viewer 두 가지 인터페이스가 공존한다.

**아리스토텔레스 *니코마코스 윤리학*(NE) 접근 URL:**

| 종류 | URL |
|------|-----|
| 그리스어(Bywater 텍스트, Perseus ID) | `https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0054` |
| 영역(Rackham, Loeb 기반) | `https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0053` |
| Scaife Viewer | `https://scaife.perseus.org/library/urn:cts:greekLit:tlg0086.tlg010/` |
| Perseus Catalog (CTS URN) | `urn:cts:greekLit:tlg0086.tlg010` |

**Bekker 페이지 직접 이동 URL 패턴:**

```
https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0054:bekker+page%3D{PAGE}
```

예시 (akrasia 핵심 구간 NE VII):
- 1145a (Book VII 시작): `?doc=Perseus:text:1999.01.0054:bekker+page%3D1145a`
- 1147a (akratic syllogism): `?doc=Perseus:text:1999.01.0054:bekker+page%3D1147a`
- 1150b (propeteia/astheneia 구분): `?doc=Perseus:text:1999.01.0054:bekker+page%3D1150b`

> 참고: `aristot.+nic.+eth.+1145a` 같은 짧은 alias URL도 동일 위치로 리다이렉트된다.

> **주의 (Bekker URL 행 번호 한계):** `bekker+page%3D1147a` 형식은 **페이지 단위(1147a)만** 지원하며, **행 번호(예: 1147a24)를 URL로 직접 지정할 수 없다**. 1147a 페이지에 진입한 후 본문에서 행 번호를 시각적으로 찾아야 한다 (Perseus는 5행마다 행 번호를 본문에 표시함). 학위논문에서 정밀한 위치 인용이 필요하면 **사용한 비평본의 페이지·행 번호를 직접 확인하고 Bekker 표준 표기(`1147a24-b5`)로 본문에 명시**한다.

**형태소 분석 사용법:**
- 본문 그리스어 단어를 클릭하면 우측에 어형 분석(parsing)·LSJ 항목이 함께 표시된다.
- 동음이의어가 있으면 후보가 모두 나열되고, 각 후보별 빈도(Word Frequency Information)도 제공된다.

**인용용 영구 URL:**
- Perseus의 `Perseus:text:1999.01.00xx` 형식은 영구 URL로 설계되어 논문 각주에 그대로 인용 가능하다.
- CTS URN(`urn:cts:greekLit:tlg0086.tlg010`)은 Scaife Viewer뿐 아니라 다른 호환 플랫폼에서도 동일 텍스트를 가리킨다.

> 주의: Perseus의 NE 그리스어 본문은 **Bywater(OCT, 1894)** 기반이다. 다른 비평본과 차이가 있을 수 있어, 학위논문에서는 본문 인용 시 비평본을 명시하는 것이 안전하다.

---

## 2. Liddell-Scott-Jones (LSJ) — 표준 그리스어 사전

**서지 정보 (검증 완료):**
- *A Greek-English Lexicon*, H. G. Liddell & R. Scott, revised by H. S. Jones & R. McKenzie
- 출판: Clarendon Press, Oxford
- 9판: 1940년 초간
- *Revised Supplement* (P. G. W. Glare 편): 1996 — 1968년 supplement를 완전히 대체, 약 20,000 항목, papyri/inscription 신출 어형 포함
- 현행 표준 인쇄본: 9판 + Revised Supplement 합본 (ISBN 978-0-19-864226-8)

**온라인 접근 경로:**

| 경로 | 특징 | 비용 |
|------|------|------|
| Perseus 내장 LSJ | 본문 단어 클릭 시 즉시 항목 표시, 인용/번역 예문 링크 | 무료 |
| Logeion (logeion.uchicago.edu) | LSJ + DGE + Bailly 등 다중 사전 동시 검색 | 무료 |
| TLG 통합 LSJ | TLG 본문에서 단어 직접 lookup | 유료(TLG 구독) |

**인용 형식 (학술지 일반):**
```
LSJ s.v. ἀκρασία
LSJ s.v. ἕξις, II.1
```

> 주의: Perseus가 사용하는 LSJ는 9판이지만 *Revised Supplement* 항목은 일부만 반영되어 있다. 최신 papyri 어형이나 supplement 한정 의미는 인쇄본 합본을 별도로 확인할 것.

---

## 3. Logeion — 다중 사전 통합 검색

**운영:** University of Chicago. 2011년 Josh Goldenberg, Matt Shanahan이 Helma Dik 교수 지도로 개발.

**통합된 주요 그리스어 사전:**
- **LSJ** (full, default 표시)
- **DGE** (Diccionario Griego-Español) — 현대 그리스어 학계 최고 사전 중 하나
- **Bailly 2020** (Greek-French)
- Cunliffe (Homer 전용), Slater (Pindar 전용) 등 작가별 특수 사전
- 라틴어: Lewis & Short, DuCange (중세 라틴) 등

**주요 기능:**
- 여러 사전을 한 화면에서 동시 비교 (LSJ vs DGE 항목 차이 즉시 확인)
- Perseus Project 통계 기반 빈도(frequency)·연어(collocation) 데이터
- iOS/Android 앱 제공 (오프라인 사용 가능)

**akrasia 논문 활용 팁:**
- LSJ만 보고 의미를 확정하지 말고, DGE의 보다 세분화된 의미 구분과 Bailly의 프랑스 학계 해석을 교차 확인하면 의미 스펙트럼을 더 정확히 파악할 수 있다.

---

## 4. Smyth Greek Grammar — 표준 문법서

**서지 정보 (검증 완료):**
- Herbert Weir Smyth, *A Greek Grammar for Colleges* (1920) — Perseus 무료 제공판의 저본 (퍼블릭 도메인)
- *Greek Grammar* (revised by Gordon M. Messing, Harvard University Press, 1956) — 학술 인용 표준판. ISBN 978-0-674-36250-5.

**온라인 접근:**
- Perseus 1920 판: `https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.04.0007`
- 섹션 직접 이동: `?doc=Perseus:text:1999.04.0007:smythp%3D1920` (1920번 섹션)

**인용 형식:**
- `Smyth §1920` — Messing 개정판 기준 섹션 번호
- 섹션 번호는 1920·1956·1984판이 대부분 일치하나, 일부 섹션에서 차이가 있을 수 있다 (Perseus는 1920판 기준).

> 주의: Messing의 1956년 개정은 1920년판 plate를 그대로 활용해 진행되었으므로 섹션 번호 체계는 거의 보존되었다. 학위논문에서 정밀한 섹션 인용이 필요하면 Messing 인쇄판으로 최종 확인하는 것이 안전하다.

---

## 5. Thesaurus Linguae Graecae (TLG)

**운영:** University of California, Irvine. 호메로스(BCE 8세기)부터 19세기까지 그리스어 문학 전체 디지털화를 목표로 하는 종합 코퍼스.

**접근 정책:**
- **Full Corpus**: 기관/개인 구독 필요 (유료)
- **TLG Canon**: 무료 (작품·저자 메타데이터 검색용)
- **Abridged TLG®**: 무료 공개. 대학 학부 그리스어 교육에 사용되는 주요 작품 일부 포함.

**주요 활용:**
- 특정 단어가 그리스어 문학 전체에서 어떻게 쓰였는지 용례 검색 (akrasia 같은 술어의 통시적 분포 추적)
- 작품·저자별 빈도 통계
- TLG 통합 LSJ로 단어 클릭 lookup

**한국 대학 라이브러리 구독 여부:**
- 단정할 수 없음. **소속 대학 도서관 전자자원 안내(또는 사서)에 직접 문의**할 것.
- 일부 주요 종합대학 인문대 도서관에서 기관 구독을 운영하는 사례가 있으나, 시기·기관에 따라 변동된다.
- 구독이 없는 경우 Abridged TLG와 Perseus·Logeion 조합으로 상당 부분을 보완할 수 있다.

---

## 6. akrasia 핵심 어휘 분석 예시

> 어원·의미는 LSJ + Aristotle 표준 해설(Stanford Encyclopedia of Philosophy, *Aristotle's Ethics* 항목 등)을 교차 확인한 결과.

| 그리스어 (다음 행: 음역) | 의미 | NE 주요 출처 |
|--------------|------|--------------|
| **ἀκρασία** / akrasía | 자제력 없음 (alpha privative ἀ- + κράτος "힘·통제"). "힘없음" 직역. | NE VII 전반 |
| **ἐγκράτεια** / enkráteia | 자제력. akrasia의 반대. ἐν- "안에" + κράτος → "자기 안에 통제력을 가짐". | NE VII.1-10 |
| **προπέτεια** / propéteia | 성급함. 어원: **πρό-**(앞으로) + **πίπτω**(쓰러지다, 떨어지다) 계열 → "앞으로 쓰러져 떨어짐"의 의미. 숙고(deliberation) 없이 정념에 끌려 행동하는 akrasia 유형. | NE VII.7, 1150b19-22 / LSJ s.v. προπέτεια |
| **ἀσθένεια** / asthéneia | 약함. 숙고하여 결정해 놓고도 정념에 굴복하는 akrasia 유형 (= para proairesin). | NE VII.7, 1150b19-22 |
| **φρόνησις** / phrónēsis | 실천적 지혜(practical wisdom). 실천적 사안에 관한 올바른 추론 능력. | NE VI 전반 |
| **ἕξις** / héxis | 성품·습성(disposition). 덕(arete)의 범주. "behave in the right way" 하는 안정된 성향. | NE II.5 |

**음역 표기 주의:**
- 본 표는 ALA-LC를 단순화한 형태(rough breathing의 h, 장음 표시 ē/ō 사용)이다.
- 정식 ALA-LC 표기에서는 거친 숨표(῾)는 모음/이중모음 앞에 `h`로 옮기되, **부드러운 숨표·악센트·iota subscript는 음역에서 생략**한다.

> 주의: Perseus의 형태소 분석은 lemma 후보를 모두 제시하지만, 문맥상 어느 것이 옳은지는 인간 판단이 필요하다. 특히 동음이의어(예: αἱρέω의 능동형 vs 중수동형 의미 차이)는 본문 맥락과 비평본 주석을 함께 봐야 한다.

---

## 7. 본문에 그리스어 표기하기

**유니코드 입력:**
- 폴리토닉(다악센트) 그리스어는 모두 유니코드로 입력 가능. 합성 문자(precomposed) 사용을 권장 (예: ἀκρασία의 첫 글자는 `U+1F00 GREEK SMALL LETTER ALPHA WITH PSILI`).
- macOS: 시스템 환경설정 → 키보드 → 입력 소스 → "그리스어 - Polytonic" 추가
- Windows: 언어 추가 → 그리스어, "Greek Polytonic" 키보드 레이아웃

**권장 폰트 (모두 무료, 폴리토닉 완전 지원):**
- **SBL Greek** — Society of Biblical Literature 배포. 학술 출판 표준 중 하나.
- **Gentium Plus** — SIL International. OpenType + Graphite. 다이어크리틱 처리 우수.
- **Cardo**, **Brill**, **New Athena Unicode** — 그 외 학계에서 널리 쓰이는 대안.

**본문 표기 권고:**
- 그리스어 원어는 **이탤릭 처리하지 않고** 그리스 문자로 직접 표기하는 것이 학술지 표준이다 (Latin 알파벳 음역만 이탤릭 처리).
- 음역(transliteration)은 처음 등장 시 괄호로 병기:
  ```
  아리스토텔레스는 ἀκρασία(akrasia)를 두 유형으로 구분한다.
  ```
- 음역 표준은 **소속 학회·학위논문 가이드 우선**. 일반 인문학에서는 ALA-LC, 성서학·고전학에서는 SBL Handbook 또는 BMCR 스타일이 널리 쓰인다.

> 주의: 일부 한국어 학술지는 그리스어 본문은 그대로 두되 음역을 이탤릭(또는 *별표*)으로 강조하라고 명시한다. 투고 전 해당 학술지 스타일 가이드를 반드시 확인할 것.

---

## 8. 비평본(Critical Edition) 정리

| 작품 | 표준 비평본 | 출판 정보 |
|------|------------|-----------|
| *Nicomachean Ethics* (NE) | Bywater (OCT) | I. Bywater, *Aristotelis Ethica Nicomachea*, Clarendon Press, 1894 (이후 reprint) |
| *Eudemian Ethics* (EE) | Walzer-Mingay (OCT) | R. R. Walzer & J. M. Mingay (eds.), Clarendon Press, 1991 |
| *Eudemian Ethics* (EE) — 신판 | Rowe (OCT) | Christopher Rowe, *Aristotle's Eudemian Ethics*, Oxford University Press, 2024 |
| *Magna Moralia* (MM) | Susemihl (Teubner) | F. Susemihl, *Aristotelis quae feruntur Magna Moralia*, B.G. Teubner, 1883 |

**NE/EE 공통 권(common books) 주의:**
- NE Books V·VI·VII = EE Books IV·V·VI 텍스트가 동일.
- akrasia 논의(NE VII)는 공통 권에 속하므로 EE 비평본 차이도 함께 검토해야 한다.

**Bekker 페이지의 기원:**
- Immanuel Bekker, *Aristotelis Opera*, Berlin Academy, 1831.
- 모든 표준 인용은 Bekker 페이지·열·행(예: 1147a24)을 사용한다. 비평본·번역본을 막론하고 통용된다.

> 주의: 비평본 간 텍스트(원문)에 차이가 있으면 인용 시 어느 비평본을 따랐는지 본문 또는 각주에 명시한다. 예: "Bywater의 텍스트를 따라 …" / "Walzer-Mingay 1991, 1235b15에서 …".

---

## 9. 번역과 원문 대조 워크플로우

akrasia 논문에서 1차 텍스트 인용을 검증할 때 권장 절차:

```
1단계 ─ Bekker 위치 확정
  · 영역본·국역본에서 인용하려는 구절의 Bekker 번호(예: 1147a24-31) 확인.

2단계 ─ Perseus에서 원문 + 영역 병렬 확인
  · URL: ?doc=Perseus:text:1999.01.0054:bekker+page%3D1147a
  · 그리스어 본문에서 핵심 단어(akrasia, akratos, prohairesis 등) 위치 식별.

3단계 ─ 핵심 단어를 Logeion으로 lookup
  · LSJ + DGE + Bailly를 동시 비교, 의미 스펙트럼 파악.
  · 해당 작가(Aristotle) 용례가 LSJ 항목에서 별도 언급되는지 확인.

4단계 ─ 한국어 번역본 비교
  · 강상진·김재홍·이창우 역 (이제이북스, 정암학당) — 그리스어 원전 직역 기조.
  · 천병희 역 (도서출판 숲) — 비교적 평이한 한국어.
  · 두 역본의 핵심 술어 번역어 차이를 정리.

5단계 ─ 번역 차이를 논문 각주에 명기
  · 예: "본 논문에서는 ἀκρασία를 '자제력 없음'으로 옮긴다.
        강상진 외(2011)는 '자제력 없음'으로, 천병희(2013)는
        '무절제'로 옮기나, 후자는 ἀκολασία(akolasia)와의 구분이
        흐려진다는 점에서 채택하지 않는다."
```

> 주의: 한국어 번역본 서지(역자·출판사·연도)는 시기별로 개정판이 나오므로, 본인이 참조한 판본의 정확한 서지를 직접 확인할 것. 위 두 사례는 학계 일반 통용 사례이며 단정적 추천은 아니다.

---

## 10. 권장 학습 자료

**그리스어 입문·중급 교재 (영문, 학계 표준):**

| 교재 | 저자 | 출판 |
|------|------|------|
| *Greek: An Intensive Course* (2nd rev. ed., 1992) | Hardy Hansen & Gerald M. Quinn | Fordham University Press, 848pp. ISBN 978-0-8232-1663-5 |
| *Introduction to Attic Greek* (2nd ed., 2013) | Donald J. Mastronarde | University of California Press. ISBN 978-0-520-27571-3 |

- Hansen & Quinn은 집중 코스용(여름학교 6주 전과정 소화 가능)이며, 진도가 빠르고 연습 문제가 어렵다.
- Mastronarde는 자가 학습용으로 추천되며, 42개 챕터로 구성되어 학기 단위 진행에 적합하다. 후반부는 Xenophon, Lysias, Plato, Aristophanes, Thucydides 원전 강독으로 이어진다.

**한국어 자료:**
- **정암학당** (사단법인, 2008년 등록) — 플라톤·아리스토텔레스 원전 강독·번역의 국내 거점. 그리스어·라틴어 정규/하계 강좌 운영.
  - 정확한 강좌 일정·등록 방법은 정암학당 공지(공식 카페·홈페이지)에서 확인할 것.
- 정암학당의 플라톤 전집 한국어 번역(이제이북스, 2007 시작)은 그리스어 원전 직역 기조로 진행되고 있으며, 아리스토텔레스 강독도 진행 중인 것으로 알려져 있다.

**참고서 (akrasia 연구용):**
- *Aristotle's Ethics* 항목, Stanford Encyclopedia of Philosophy (https://plato.stanford.edu/entries/aristotle-ethics/) — 무료, 정기 업데이트.
- Christopher Bobonich & Pierre Destrée (eds.), *Akrasia in Greek Philosophy: From Socrates to Plotinus*, Brill, 2007.

> 주의: 정암학당 강좌의 구체적 커리큘럼·운영 방식은 시기별로 달라지므로 본 스킬에서는 조직 정체성과 교육 활동 사실관계만 명시한다. 강좌 등록 전 공식 채널로 직접 확인할 것.

---

## 빠른 참조 카드

| 필요 작업 | 도구 |
|-----------|------|
| Bekker 페이지 그리스어 원문 즉시 보기 | Perseus URL `1999.01.0054:bekker+page%3D{PAGE}` |
| 단어 어형 분석·기본형 확인 | Perseus 본문 단어 클릭 → 우측 morphology |
| 단어 의미 정밀 확인 | Logeion (LSJ + DGE + Bailly 동시) |
| 문법 사항 인용 | Smyth §{section} (Messing 1956 기준) |
| 통시적 용례 검색 | TLG (구독 시) / Abridged TLG (무료) |
| 비평본 원문 정밀 확인 | NE: Bywater OCT / EE: Walzer-Mingay 또는 Rowe OCT |
| 인용 표기 표준 | Bekker 번호 + 비평본 명시 + 음역(필요 시 ALA-LC) |
