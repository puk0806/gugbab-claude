---
name: python-korean-nlp-konlpy
description: >
  한국어 형태소 분석(KoNLPy·Mecab-ko) 패키지 혼동과 설치 함정 — mecab-ko(import mecab_ko, Python 3.9~3.15) vs python-mecab-ko(import mecab) vs KoNLPy Mecab(Windows 미지원) 구분, 사용자 사전 CSV·컴파일, Komoran userdic, JVM·비트 불일치·MECABRC 오류, ko-sbert 임베딩 모델 수치.
  <example>사용자: "Python에서 한국어 텍스트의 명사만 뽑고 싶어. 어떤 라이브러리를 써야 해?"</example>
  <example>사용자: "꿈 일기 텍스트에서 핵심 상징어를 추출하는 백엔드를 만들고 있는데 형태소 분석기 추천."</example>
  <example>사용자: "mecab-ko를 macOS와 Linux에서 설치하는 방법 알려줘."</example>
---

# Python 한국어 NLP — KoNLPy + Mecab-ko

> 소스:
> - KoNLPy 공식 문서: https://konlpy.org/en/latest/
> - KoNLPy GitHub: https://github.com/konlpy/konlpy
> - mecab-ko PyPI (v1.0.3, 2026-10-28): https://pypi.org/project/mecab-ko/
> - python-mecab-ko PyPI (v1.3.7, import `mecab`): https://pypi.org/project/python-mecab-ko/
> - python-mecab-ko 문서: https://python-mecab-ko.readthedocs.io/en/stable/
> - jhgan/ko-sbert-multitask: https://huggingface.co/jhgan/ko-sbert-multitask
> - mecab-ko-dic (LuminosoInsight): https://github.com/LuminosoInsight/mecab-ko-dic
> - KLUE 벤치마크: https://github.com/KLUE-benchmark/KLUE
>
> 검증일: 2026-11-09 (2026-05-15 최초 검증 · 재검증 이력은 verification.md 8절 참조. 2026-11-09 재검증 — mecab-ko 1.0.3(Python 3.9~3.15), KoNLPy 0.6.0 여전히 최신)

---

## 이 스킬의 범위

이름이 비슷한 Mecab 패키지 3종의 구분, 설치·환경 함정, 사용자 사전, 한국어 임베딩 모델 수치만 싣는다.
> 기본 사용법(morphs/pos/nouns, 세종 품사 태그, 정규화·빈도/TF-IDF 키워드 추출 코드)은 공식 문서 수준이라 싣지 않는다.

---

## 1. 버전과 패키지 구분 — 섞지 말 것

| 패키지 | 설치 | import | API | 비고 |
|--------|------|--------|-----|------|
| **KoNLPy** | `pip install konlpy` | `from konlpy.tag import Mecab` (Okt·Kkma·Komoran·Hannanum) | 통합 `morphs/pos/nouns` | 최신 **0.6.0**, Python 3 전용(Py2는 0.5.2 이후 미지원). 분석기를 직접 구현하지 않는 **래퍼** — 분석기별 의존성(JVM, C++ 바이너리) 별도 |
| **`mecab-ko`** | `pip install mecab-ko` | `import mecab_ko as MeCab` → `MeCab.Tagger()` | MeCab 원본 `Tagger.parse` | v1.0.3: macOS·Linux·Windows(64bit) wheel, 사전 포함, **Python 3.9 ~ 3.15**(3.8 빠짐). Windows wheel은 MS Visual C++ 재배포 패키지 필요. KoNLPy 인터페이스와 별개 |
| **`python-mecab-ko`** | `pip install python-mecab-ko` | `from mecab import MeCab` | `MeCab(dictionary_path=None, user_dictionary_path=None)`, `nouns()` 등 | v1.3.7. 사전은 별도 패키지 `mecab-ko-dic`로 함께 설치 |

> 주의: `from mecab import MeCab` + `user_dictionary_path=` 는 **`python-mecab-ko`** 패키지의 API다. `mecab-ko`(import 이름 `mecab_ko`, MeCab 원본 API `Tagger`)와는 다른 패키지이니 섞지 않는다. `MeCab(dictionary_path=None, user_dictionary_path=None)` 시그니처는 python-mecab-ko 소스(`mecab/mecab.py`)로 확인했다.

### KoNLPy `Mecab` 클래스 설치 (macOS/Linux 전용)

```bash
# Ubuntu는 먼저: sudo apt-get install g++ openjdk-8-jdk python3-dev python3-pip curl
pip install konlpy
bash <(curl -s https://raw.githubusercontent.com/konlpy/konlpy/master/scripts/mecab.sh)
```

> 주의: KoNLPy의 `Mecab` 클래스는 **Windows에서 공식 지원되지 않는다**. Windows에서는 **`mecab-ko` PyPI 패키지**를 사용하거나, 비공식 `eunjeon` 패키지를 시도해야 한다.

- 컨테이너는 `pip install mecab-ko`(wheel)로 apt·스크립트 단계를 생략 → 빌드 5분+ 단축.

---

## 2. 분석기 선택

| 분석기 | 속도(10만 자 pos()) | 언어 | Windows | 강점 |
|--------|------|------|--------|------|
| **Mecab** | 0.0007초 | C++ | ✗ (KoNLPy 경유 시) | 최고속·안정 |
| Hannanum | 0.6591초 | Java | ✓ | `analyze()` 후보 다중 반환 |
| Okt(구 Twitter) | 1.4870초 | Java | ✓ | `phrases()`, norm/stem — 신조어·SNS |
| Komoran | 5.4866초 | Java | ✓ | 띄어쓰기 오류에 강함, userdic 단순 |
| Kkma | 5.6988초 | Java | ✓ | `sentences()` 문장 분리 |

> 출처: 커뮤니티 벤치마크(blog.cosadama.com, soohee410). 머신 환경에 따라 절댓값은 달라지나 **상대 순위는 일관**된다.

> 주의: "정확도" 비교는 일반 도메인 평균이다. 도메인(법률·의료·SNS 등)에 따라 순위는 바뀐다.

- 문장 의미 유사도는 형태소 분석이 아니라 ko-sbert(4절), 분류·NER 학습은 KLUE-BERT/RoBERTa 파인튜닝, 사전 없는 신조어 추출은 soynlp·krwordrank.

---

## 3. 사용자 사전 (도메인 어휘를 한 단어로)

### Mecab — CSV → 컴파일

```csv
용꿈,,,,NNG,*,T,용꿈,*,*,*,*
이빨빠짐,,,,NNG,*,T,이빨빠짐,*,*,*,*
```

컬럼: `표층형, 좌문맥ID(빈칸), 우문맥ID(빈칸), 비용(빈칸), 품사, 의미분류, 종성유무(T/F), 읽기, 타입, 첫품사, 마지막품사, 원형`

```bash
mecab-dict-index -d /path/to/mecab-ko-dic -u user.dic -f utf-8 -t utf-8 user.csv
```

```python
from mecab import MeCab                      # python-mecab-ko
mecab = MeCab(user_dictionary_path="user.dic")
mecab.morphs("용꿈을 꿨어요")  # ['용꿈', '을', '꿨', '어요']
```

> 주의: 미검증 — 시스템 사전 경로(`-d`)는 설치 패키지마다 다르다(mecab-ko-dic 은 별도 패키지 `mecab-ko-dic`로 함께 설치됨). `python-mecab-ko`(import `mecab`)를 쓰면 그 패키지가 쓰는 사전 경로(`mecab_ko_dic.dictionary_path`)를 기준으로 컴파일한다.

### Komoran — 탭 구분 txt (Windows에서 가장 무난)

```python
from konlpy.tag import Komoran
komoran = Komoran(userdic='./dic.txt')   # 각 줄: "용꿈\tNNG"
```

---

## 4. 한국어 문장 임베딩 — ko-sbert

| 모델 | 차원 | KorSTS | 비고 |
|------|------|--------|------|
| `jhgan/ko-sbert-multitask` | **768** | Cosine Pearson 84.13 / Spearman 84.71 | KorNLI + KorSTS 멀티태스크, BERT(KorBERT 계열) |
| `jhgan/ko-sroberta-multitask` | — | Spearman 85.77 | RoBERTa 기반, sbert보다 약간 우수 |
| `jhgan/ko-sbert-sts` | — | — | STS만 학습(NLI 미포함) |
| `BM-K/KoSimCSE-roberta` | — | — | SimCSE, 일부 벤치에서 더 우수 |

- `sentence-transformers`로 로드. 첫 로드 30초+ → 서버 기동 시 1회 로드 후 재사용(`~/.cache/huggingface`). 의미 검색은 사전 계산 후 FAISS·Qdrant·pgvector.

---

## 5. 흔한 함정

| 함정 | 증상 | 해결 |
|------|------|------|
| Mecab 설치 환경 의존 | `RuntimeError: MeCab cannot be initialized` | mecab-ko-dic 경로 환경변수 `MECABRC` 확인. PyPI `mecab-ko`로 전환 검토 |
| Windows에서 KoNLPy Mecab | `Mecab() not supported on Windows` | `mecab-ko` PyPI 패키지 또는 Komoran |
| 은전한닢(eunjeon) 사전 별도 | Mecab은 있는데 분석 결과가 빈약 | `mecab-ko-dic` 설치 필수. `bash mecab.sh` 스크립트가 자동 처리 |
| JVM 미설치 | `JVMNotFoundException` (Hannanum/Kkma/Komoran/Okt) | Java 1.8+ 설치, `JAVA_HOME` 설정 |
| 비트 불일치 | Windows에서 KoNLPy 임포트 실패 | Python 비트 = Java 비트 (둘 다 64bit 권장) |
| 사용자 사전 미반영 | 도메인 어휘가 분리되어 분석됨 | `mecab-dict-index` 재컴파일 후 `user.dic` 경로 지정 |
| `Okt.pos(norm=True)` 의존 | 신조어 정규화 결과가 기대와 다름 | Okt의 norm은 사전 기반 → 규칙 누락 가능. 후처리 결합 |
| 한자/외국어 잘림 | "漢字"가 명사로 안 뽑힘 | Mecab은 한자 `SH`·외국어 `SL`·숫자 `SN`으로 태깅 → `nouns()`에 안 포함, `pos()`로 직접 필터. 전처리에서 지우지 말고 분석기에 맡기는 것이 일반적 |
| `mecab-ko`와 `python-mecab-ko` API 혼용 | `AttributeError`·import 실패 | 1절 표대로 하나만 |
