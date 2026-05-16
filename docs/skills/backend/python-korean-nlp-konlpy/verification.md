---
skill: python-korean-nlp-konlpy
category: backend
version: v1
date: 2026-05-15
status: PENDING_TEST
---

# python-korean-nlp-konlpy 스킬 검증 기록

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `python-korean-nlp-konlpy` |
| 스킬 경로 | `.claude/skills/backend/python-korean-nlp-konlpy/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator (Opus 4.7) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (konlpy.org, pypi.org/project/mecab-ko, huggingface.co)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/konlpy/konlpy, KLUE-benchmark)
- [✅] 최신 버전 기준 내용 확인 (KoNLPy 0.6.0, mecab-ko 1.0.2 — 2025-09-23)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (5개 분석기 비교, 속도 벤치마크, 선택 가이드)
- [✅] 코드 예시 작성 (설치·morphs/pos/nouns·사용자 사전·TF-IDF·TextRank·ko-sbert)
- [✅] 흔한 실수 패턴 정리 (10개 함정 정리)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "KoNLPy Python Korean NLP library official documentation 2026" | konlpy.org 0.6.0 공식 문서 확인 |
| 조사 | WebSearch | "mecab-ko Korean morphological analyzer installation macOS Linux Windows" | mecab-ko PyPI 1.0.2 확인, 크로스플랫폼 wheel 지원 |
| 조사 | WebSearch | "jhgan ko-sbert-multitask Korean sentence embedding HuggingFace" | 768차원 임베딩, KorSTS Pearson 84.13 |
| 조사 | WebFetch | konlpy.org/en/latest/ | 5개 분석기, sentences/nouns/pos 메서드 |
| 조사 | WebFetch | pypi.org/project/mecab-ko/ | v1.0.2 (2025-09-23), Python 3.6+, macOS/Linux/Windows |
| 조사 | WebFetch | huggingface.co/jhgan/ko-sbert-multitask | 임베딩 차원 768, KorSTS Cosine Pearson 84.13/Spearman 84.71 |
| 조사 | WebFetch | konlpy.org/en/latest/api/konlpy.tag/ | 분석기별 Windows 지원 여부 (Mecab만 ✗) |
| 조사 | WebFetch | konlpy.org/en/latest/install/ | macOS/Ubuntu/CentOS/Windows 설치 가이드 |
| 교차 검증 | WebSearch | "KoNLPy 분석기 속도 비교 벤치마크" | 속도 순위 일치: Mecab > Hannanum > Okt > Komoran > Kkma |
| 교차 검증 | WebSearch | "mecab-ko user dictionary custom" | python-mecab-ko 사용자 사전 CSV 포맷 확인 |
| 교차 검증 | WebSearch | "KoBERT KLUE spaCy Korean NLP comparison" | KLUE-BERT/RoBERTa 존재 확인, spaCy 한국어 파이프라인 |
| 교차 검증 | WebSearch | "mecab-ko POS tag set NNG NNP VV VA" | 세종 코퍼스 기반 태그셋 확인 (NNG/NNP/VV/VA/XSV/JKG/JX 등) |
| 교차 검증 | WebSearch | "konlpy.tag.Mecab usage" | morphs/pos/nouns 메서드 시그니처 확인, Windows 미지원 재확인 |

**핵심 클레임 판정:** VERIFIED 9 / DISPUTED 0 / UNVERIFIED 1 (TextRank 한국어 구현은 krwordrank만 공식, 다른 라이브러리 권장은 미검증으로 제거)

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| KoNLPy 공식 문서 | https://konlpy.org/en/latest/ | ⭐⭐⭐ High | 2026-05-15 | 1순위 공식, 버전 0.6.0 |
| KoNLPy GitHub | https://github.com/konlpy/konlpy | ⭐⭐⭐ High | 2026-05-15 | 공식 저장소 |
| mecab-ko PyPI | https://pypi.org/project/mecab-ko/ | ⭐⭐⭐ High | 2026-05-15 | v1.0.2, 2025-09-23 |
| python-mecab-ko 문서 | https://python-mecab-ko.readthedocs.io/en/stable/ | ⭐⭐⭐ High | 2026-05-15 | 사용자 사전 가이드 |
| jhgan/ko-sbert-multitask | https://huggingface.co/jhgan/ko-sbert-multitask | ⭐⭐⭐ High | 2026-05-15 | HuggingFace 공식 모델 카드 |
| KLUE 벤치마크 | https://github.com/KLUE-benchmark/KLUE | ⭐⭐⭐ High | 2026-05-15 | 한국어 NLU 벤치마크 공식 |
| mecab-ko-dic (LuminosoInsight) | https://github.com/LuminosoInsight/mecab-ko-dic | ⭐⭐ Medium | 2026-05-15 | 사전 패키징 참고 |
| blog.cosadama 한국어 형태소 비교 | https://www.blog.cosadama.com/articles/2021-practicenlp-01/ | ⭐⭐ Medium | 2026-05-15 | 속도 벤치마크 데이터 |
| soohee410 형태소 분석기 비교 | https://soohee410.github.io/compare_tagger | ⭐⭐ Medium | 2026-05-15 | 명사 추출 정확도 비교 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (KoNLPy 0.6.0, mecab-ko 1.0.2 기준)
- [✅] 버전 정보가 명시되어 있음 (KoNLPy 0.6.0 / mecab-ko 1.0.2 / Python 3.8~3.13 / sentence-transformers)
- [✅] deprecated된 패턴을 권장하지 않음 (Python 2 미지원 명시)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description, example 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (KoNLPy 소개, 분석기 비교, POS 태그)
- [✅] 코드 예시 포함 (설치·morphs/pos/nouns·정규화·TF-IDF·TextRank·ko-sbert·FastAPI 통합)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (분석기 선택 가이드, 옵션 비교표)
- [✅] 흔한 실수 패턴 포함 (10개 함정 정리)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (dream-symbol-tagging 통합 예시)
- [✅] 범용적으로 사용 가능 (도메인 예시는 분리된 12절에만 배치)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-05-15)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (직접 SKILL.md Read 기반 검증)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 5개 분석기 속도 비교 — 최고속·최저속 처리 시간 차이 및 선택 기준**
- PASS
- 근거: SKILL.md "2. 5개 분석기 비교" 섹션 (속도 벤치마크 표 + 분석기 선택 기준)
- 상세: Mecab 0.0007초 vs Kkma 5.6988초(약 8,141배 차이), 선택 기준(대용량/속도 → Mecab, 문장 분리 → Kkma) 모두 SKILL.md에 명확히 기록됨. anti-pattern(순위 역전) 없음.

**Q2. KoNLPy Mecab 클래스가 Windows 미지원 — 대안 및 Windows + 사용자 사전 최선책**
- PASS
- 근거: SKILL.md "3. Mecab-ko 설치 > Windows" 주의 블록 + "6.2 Komoran의 userdic" 섹션
- 상세: Windows 미지원 명시, `mecab-ko` PyPI 옵션 A(wheel 제공)와 `eunjeon` 비공식 패키지 대안 기재. Windows + 사용자 사전 조합은 Komoran userdic이 "가장 무난"하다고 명시됨.

**Q3. `mecab-ko` PyPI 사용자 사전 CSV 컬럼 형식·컴파일 명령어, ko-sbert-multitask 임베딩 차원·코사인 유사도**
- PASS
- 근거: SKILL.md "6.1 mecab-ko PyPI 패키지에서" 섹션 + "10. 한국어 임베딩 — ko-sbert-multitask" 섹션
- 상세: CSV 12컬럼 포맷(`표층형,,,,품사,...`), `mecab-dict-index` 컴파일 명령어, `MeCab(user_dictionary_path=...)` 로드 방법 전부 기재. 임베딩 차원 768, `np.dot` 기반 코사인 유사도 코드 예시 존재.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md에서 충분한 근거를 찾을 수 있었다.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 카테고리 (Mecab 환경 의존 — 빌드 설정/설치+실행 유형)
- 최종 상태: PENDING_TEST 유지 (content test PASS, 실제 환경 빌드 검증 후 APPROVED 전환)

---

> (참고 — 예정 템플릿, 이하 보존)
> skill-tester가 SKILL.md Read 후 실전 질문을 수행하고 본 섹션을 업데이트한다.

~~**수행일**: (skill-tester 호출 후 기록)~~

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ 공식 문서 교차 검증 완료 |
| 구조 완전성 | ✅ 모든 필수 섹션 포함 (12개 섹션) |
| 실용성 | ✅ 짝 스킬 통합 예시 포함 |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-15, skill-tester 수행) |
| **최종 판정** | **PENDING_TEST** (content test PASS, 실사용 환경 검증 대기) |

**상태 유지 사유**: Mecab 설치 환경 의존성이 큰 스킬이라 실제 환경 검증이 필요. content test 3/3 PASS 완료. 실제 Linux/macOS 환경에서 mecab-ko 설치 및 백엔드 빌드 확인 후 APPROVED 전환.

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)
- [❌] krwordrank 외 추가 한국어 TextRank 라이브러리 비교 — 선택 보강 (차단 요인 아님)
- [❌] Docker 이미지 빌드 시간 최적화 예시 추가 — 선택 보강 (차단 요인 아님)
- [❌] FAISS/pgvector 연동 실제 코드 — `backend/python-fastapi` 스킬 완성 후 연계 보강 (차단 요인 아님, 의존 스킬 완성 선행 필요)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (KoNLPy 0.6.0 / mecab-ko 1.0.2 / ko-sbert-multitask 기준) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 5개 분석기 속도 비교·선택 기준 / Q2 Windows Mecab 미지원 대안·userdic / Q3 사용자 사전 CSV 형식·컴파일·ko-sbert 임베딩) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
