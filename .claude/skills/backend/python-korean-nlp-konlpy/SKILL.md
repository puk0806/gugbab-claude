---
name: python-korean-nlp-konlpy
description: >
  KoNLPy + Mecab-ko를 활용한 한국어 자연어 처리(형태소 분석·품사 태깅·키워드 추출) 백엔드 스킬.
  Python 환경에서 한국어 텍스트를 처리할 때 사용한다. ko-sbert로 한국어 임베딩까지 다룬다.
  <example>사용자: "Python에서 한국어 텍스트의 명사만 뽑고 싶어. 어떤 라이브러리를 써야 해?"</example>
  <example>사용자: "꿈 일기 텍스트에서 핵심 상징어를 추출하는 백엔드를 만들고 있는데 형태소 분석기 추천."</example>
  <example>사용자: "mecab-ko를 macOS와 Linux에서 설치하는 방법 알려줘."</example>
---

# Python 한국어 NLP — KoNLPy + Mecab-ko

> 소스:
> - KoNLPy 공식 문서: https://konlpy.org/en/latest/
> - KoNLPy GitHub: https://github.com/konlpy/konlpy
> - mecab-ko PyPI (v1.0.2, 2025-09-23): https://pypi.org/project/mecab-ko/
> - python-mecab-ko 문서: https://python-mecab-ko.readthedocs.io/en/stable/
> - jhgan/ko-sbert-multitask: https://huggingface.co/jhgan/ko-sbert-multitask
> - mecab-ko-dic (LuminosoInsight): https://github.com/LuminosoInsight/mecab-ko-dic
> - KLUE 벤치마크: https://github.com/KLUE-benchmark/KLUE
>
> 검증일: 2026-05-15
> 짝 스킬: `frontend/dream-symbol-tagging` (프론트엔드 시도) · `backend/python-fastapi` (예정)

---

## 1. KoNLPy 소개

**KoNLPy(코엔엘파이)**는 Python에서 한국어 자연어 처리를 위한 표준 라이브러리다. 여러 한국어 형태소 분석기(Hannanum·Kkma·Komoran·Okt·Mecab)를 **하나의 통합 인터페이스**로 제공한다.

- 최신 버전: **0.6.0**
- Python 3.x 전용 (Python 2는 v0.5.2 이후 미지원)
- 모든 분석기가 `morphs()`, `pos()`, `nouns()` 등의 공통 메서드를 노출 → 분석기 교체가 쉽다

```python
from konlpy.tag import Mecab  # 또는 Okt, Kkma, Komoran, Hannanum
mecab = Mecab()
mecab.morphs("안녕하세요. 반갑습니다.")
# ['안녕', '하', '세요', '.', '반갑', '습니다', '.']
```

> KoNLPy 자체는 분석기를 직접 구현하지 않고 외부 분석기를 호출하는 **래퍼(wrapper)** 다. 분석기별 의존성(Java JVM, C++ 바이너리 등)을 별도로 설치해야 한다.

---

## 2. 5개 분석기 비교

| 분석기 | 언어 | 속도 | 정확도 | Windows | 특징 |
|--------|------|------|--------|---------|------|
| **Mecab** | C++ | ★★★★★ (최고속) | ★★★★★ | ✗ (직접) | 가장 빠르고 안정적. mecab-ko-dic 사용 |
| **Komoran** | Java | ★★★ | ★★★★ | ✓ | 띄어쓰기 오류에 강함. userdic 지원 |
| **Okt**(구 Twitter) | Java | ★★★ | ★★★ | ✓ | `phrases()` 지원, 정규화 옵션 |
| **Hannanum** | Java | ★★ | ★★★ | ✓ | `analyze()`로 후보 다중 반환 |
| **Kkma** | Java | ★ (가장 느림) | ★★★★ | ✓ | `sentences()` 문장 분리 강점 |

### 속도 벤치마크 (10만 자 처리 시간, pos() 메서드)

| 분석기 | 시간 |
|--------|------|
| Mecab | 0.0007초 |
| Hannanum | 0.6591초 |
| Okt | 1.4870초 |
| Komoran | 5.4866초 |
| Kkma | 5.6988초 |

> 출처: 커뮤니티 벤치마크(blog.cosadama.com, soohee410). 머신 환경에 따라 절댓값은 달라지나 **상대 순위는 일관**된다.

### 분석기 선택 기준

- **대용량/속도 우선** → Mecab (Linux/macOS)
- **Windows 배포 필수** → Komoran or Okt
- **신조어/SNS 텍스트** → Okt (norm/stem 옵션)
- **문장 분리 필요** → Kkma
- **띄어쓰기 엉망인 입력** → Komoran

> 주의: 위 표의 "정확도"는 일반 도메인 평균이다. 도메인(법률·의료·SNS 등)에 따라 순위는 바뀐다.

---

## 3. Mecab-ko 설치

### 옵션 A: `mecab-ko` PyPI 패키지 (권장, 크로스플랫폼 wheel 제공)

가장 간단한 방법. 사전이 포함되어 별도 설치 불필요.

```bash
pip install mecab-ko
```

- macOS·Linux·Windows(64bit) 모두 pre-built wheel 제공
- Python 3.8 ~ 3.13 공식 지원
- 사용 시 `import mecab_ko as MeCab` (KoNLPy 인터페이스와는 별개)

```python
import mecab_ko as MeCab

tagger = MeCab.Tagger()
print(tagger.parse("아버지가방에들어가신다"))
# 아버지  NNG,*,F,아버지,*,*,*,*
# 가      JKS,*,F,가,*,*,*,*
# 방      NNG,*,T,방,*,*,*,*
# ...
```

### 옵션 B: KoNLPy의 `Mecab` 클래스 (macOS/Linux 전용)

KoNLPy 통합 API를 쓰고 싶다면 mecab-ko 바이너리 + 사전을 시스템에 설치한 뒤 KoNLPy의 Mecab 클래스를 사용한다.

**macOS (Homebrew 없이 공식 스크립트 사용):**
```bash
pip install konlpy
bash <(curl -s https://raw.githubusercontent.com/konlpy/konlpy/master/scripts/mecab.sh)
```

**Ubuntu:**
```bash
sudo apt-get install g++ openjdk-8-jdk python3-dev python3-pip curl
pip install konlpy
bash <(curl -s https://raw.githubusercontent.com/konlpy/konlpy/master/scripts/mecab.sh)
```

**Windows:**
> 주의: KoNLPy의 `Mecab` 클래스는 **Windows에서 공식 지원되지 않는다**. Windows에서는 위의 **옵션 A (`mecab-ko` PyPI 패키지)** 를 사용하거나, 비공식 `eunjeon` 패키지를 시도해야 한다.

설치 검증:
```python
from konlpy.tag import Mecab
mecab = Mecab()
print(mecab.nouns("형태소 분석기 설치 확인"))
# ['형태소', '분석기', '설치', '확인']
```

---

## 4. 형태소 분석 — 핵심 메서드

```python
from konlpy.tag import Mecab
mecab = Mecab()

text = "영등포구청역에 있는 맛집 좀 알려주세요."

# 1) morphs() — 형태소 단위 토큰 리스트
mecab.morphs(text)
# ['영등포구', '청역', '에', '있', '는', '맛집', '좀', '알려', '주', '세요', '.']

# 2) pos() — (토큰, 품사) 튜플 리스트
mecab.pos(text)
# [('영등포구', 'NNP'), ('청역', 'NNG'), ('에', 'JKB'), ('있', 'VV'), ...]

# 3) nouns() — 명사만 추출 (키워드 추출의 시작점)
mecab.nouns(text)
# ['영등포구', '청역', '맛집']
```

> 모든 분석기가 위 3가지 메서드를 공통으로 제공한다. Okt는 추가로 `phrases()`, Kkma는 `sentences()`를 제공한다.

---

## 5. Mecab-ko POS 태그 셋

세종 코퍼스 기반 태그 셋. 주요 태그만 정리(전체 60여 개).

| 분류 | 태그 | 의미 | 예 |
|------|------|------|-----|
| 명사 | NNG | 일반명사 | 사과 |
| | NNP | 고유명사 | 서울 |
| | NNB | 의존명사 | 것, 수 |
| | NR | 수사 | 하나 |
| | NP | 대명사 | 나, 너 |
| 동사 | VV | 동사 | 먹다 |
| | VA | 형용사 | 예쁘다 |
| | VX | 보조용언 | 있다(보조) |
| | VCP | 긍정지정사(이다) | 이다 |
| | VCN | 부정지정사(아니다) | 아니다 |
| 수식언 | MM | 관형사 | 그 |
| | MAG | 일반부사 | 매우 |
| | MAJ | 접속부사 | 그리고 |
| 독립언 | IC | 감탄사 | 아! |
| 조사 | JKS | 주격조사 | 이/가 |
| | JKO | 목적격조사 | 을/를 |
| | JKB | 부사격조사 | 에/에서 |
| | JKG | 관형격조사 | 의 |
| | JX | 보조사 | 은/는 |
| 어미 | EP | 선어말어미 | -시-, -았- |
| | EF | 종결어미 | -다 |
| | EC | 연결어미 | -고, -며 |
| | ETM | 관형형 전성어미 | -ㄴ, -은 |
| 접사 | XSV | 동사파생접미사 | -하다 |
| | XSA | 형용사파생접미사 | -롭다 |
| 기호 | SF | 마침표/물음표/느낌표 | . ? ! |
| | SE | 줄임표 | … |
| | SS | 따옴표/괄호 | " ( |
| | SY | 기타 기호 | @ # |
| 외국어 | SL | 외국어 | English |
| | SH | 한자 | 漢字 |
| | SN | 숫자 | 123 |

```python
# 명사 계열만 필터링
nouns_only = [w for w, t in mecab.pos(text) if t.startswith('N')]
```

> 전체 태그는 `mecab.tagset` 속성으로 조회 가능: `Mecab().tagset` → dict 반환.

---

## 6. 사용자 사전 추가

도메인 어휘(예: 꿈 상징어 "용꿈", "이빨빠짐", 신조어 등)를 분석기가 한 단어로 인식하도록 추가한다.

### 6.1 `mecab-ko` PyPI 패키지에서

CSV 형식의 사용자 사전을 만들고 컴파일한다.

**user.csv 예시:**
```csv
용꿈,,,,NNG,*,T,용꿈,*,*,*,*
이빨빠짐,,,,NNG,*,T,이빨빠짐,*,*,*,*
가위눌림,,,,NNG,*,T,가위눌림,*,*,*,*
```

컬럼: `표층형, 좌문맥ID(빈칸), 우문맥ID(빈칸), 비용(빈칸), 품사, 의미분류, 종성유무(T/F), 읽기, 타입, 첫품사, 마지막품사, 원형`

컴파일:
```bash
mecab-dict-index -d /path/to/mecab-ko-dic -u user.dic -f utf-8 -t utf-8 user.csv
```

Python에서 로드:
```python
from mecab import MeCab
mecab = MeCab(user_dictionary_path="user.dic")
print(mecab.morphs("용꿈을 꿨어요"))
# ['용꿈', '을', '꿨', '어요']  ← '용꿈'이 하나의 명사로 인식
```

### 6.2 Komoran의 userdic (대안, Java 기반)

Mecab보다 사용자 사전 등록이 단순하다.

**dic.txt:**
```
용꿈	NNG
이빨빠짐	NNG
```

```python
from konlpy.tag import Komoran
komoran = Komoran(userdic='./dic.txt')
komoran.nouns("용꿈을 꿨어요")  # ['용꿈']
```

> Windows 환경에서 사용자 사전이 필요하다면 Komoran이 가장 무난하다.

---

## 7. 다른 옵션 — 한국어 NLP 라이브러리 비교

| 옵션 | 용도 | 장점 | 단점 |
|------|------|------|------|
| **KoNLPy + Mecab** | 형태소 분석·POS 태깅 | 빠름, 안정적 | 의미·문맥 이해 ✗ |
| **KLUE-BERT/RoBERTa** | 분류·NER·QA | KLUE 벤치 SOTA, 한국어 특화 | GPU 권장, 학습 필요 |
| **KoBERT** (ETRI/SKT) | 임베딩·분류 | 최초 공개 한국어 BERT | 갱신 빈도 낮음 |
| **ko-sbert / ko-sroberta** (jhgan) | 문장 임베딩·의미 검색 | 추가 학습 불필요, KorSTS 84.13 | 단어 단위 분석 ✗ |
| **spaCy 한국어** | 토크나이저·NER | 통합 파이프라인 | 토크나이저가 mecab-ko 의존(설정 시) |
| **soynlp** | 비지도 학습 토크나이저 | 사전 불필요, 신조어 강함 | 정확도가 학습 데이터 의존 |

**선택 가이드:**
- 빠른 키워드 추출만 필요 → **Mecab + nouns()**
- 의미적 유사도 검색 → **ko-sbert-multitask** (8절 참조)
- 한국어 분류/NER 학습 → **KLUE-BERT** 파인튜닝
- 도메인 특화 신조어 처리 → **soynlp** 또는 Mecab + 사용자 사전

---

## 8. 텍스트 정규화

형태소 분석 전 전처리 단계. 입력 노이즈를 줄여 분석 정확도를 높인다.

```python
import re
import unicodedata

def normalize_korean(text: str) -> str:
    # 1) 유니코드 정규화 (NFC: 한글 자모 결합형)
    text = unicodedata.normalize("NFC", text)

    # 2) 이모지 제거 (CJK 한자/한글은 보존)
    emoji_pattern = re.compile(
        "[" +
        "\U0001F600-\U0001F64F" +  # 이모티콘
        "\U0001F300-\U0001F5FF" +  # 픽토그램
        "\U0001F680-\U0001F6FF" +  # 운송수단
        "\U0001F1E0-\U0001F1FF" +  # 국기
        "\U00002500-\U00002BEF" +  # 기호
        "\U0001F900-\U0001F9FF" +  # 추가 이모지
        "]+", flags=re.UNICODE)
    text = emoji_pattern.sub('', text)

    # 3) 한자 → 그대로 두거나(SH 태그로 인식됨) 제거
    # text = re.sub(r'[一-鿿]+', '', text)

    # 4) 연속 공백 → 단일 공백
    text = re.sub(r'\s+', ' ', text).strip()

    # 5) 특수문자 정리 (마침표·물음표는 보존)
    text = re.sub(r'[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ.?!,\'"-]', ' ', text)

    return text
```

> 주의: 한자(SH), 영어(SL), 숫자(SN)는 Mecab이 각각 별도 품사로 태깅하므로 **삭제하지 않고 분석기에 맡기는 것이 일반적**이다. 도메인에 따라 선택한다.

---

## 9. 키워드 추출

### 9.1 빈도 기반 (가장 단순)

```python
from collections import Counter
from konlpy.tag import Mecab

mecab = Mecab()
text = "..."  # 긴 문서

nouns = mecab.nouns(text)
# 1자 이하 불용어 제거
nouns = [n for n in nouns if len(n) >= 2]

top10 = Counter(nouns).most_common(10)
```

### 9.2 TF-IDF (문서 집합에서)

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from konlpy.tag import Mecab

mecab = Mecab()
docs = ["문서1 텍스트", "문서2 텍스트", ...]

def tokenize(text):
    return [n for n in mecab.nouns(text) if len(n) >= 2]

vec = TfidfVectorizer(tokenizer=tokenize, lowercase=False)
matrix = vec.fit_transform(docs)
features = vec.get_feature_names_out()

# 첫 문서의 상위 키워드
doc0_scores = matrix[0].toarray().flatten()
top_idx = doc0_scores.argsort()[-10:][::-1]
top_keywords = [(features[i], doc0_scores[i]) for i in top_idx]
```

### 9.3 TextRank (단일 문서, 그래프 기반)

```python
# pip install krwordrank  ← 한국어용 TextRank 구현
from krwordrank.word import KRWordRank

texts = ["꿈에서 용을 봤다. 용꿈은 좋은 징조라고 한다.", ...]
wordrank = KRWordRank(min_count=2, max_length=10)
keywords, _, _ = wordrank.extract(texts, beta=0.85, max_iter=10)

for word, score in sorted(keywords.items(), key=lambda x: -x[1])[:10]:
    print(word, score)
```

> `krwordrank`는 단어를 사전 없이 추출하는 변형이다. 분석기 출력과 결합하려면 `mecab.nouns()` 결과를 토큰화 → 자체 TextRank 구현이 필요하다.

---

## 10. 한국어 임베딩 — ko-sbert-multitask

문장 단위 의미 유사도, 의미 검색, 클러스터링에 사용.

### 모델 정보

| 항목 | 값 |
|------|-----|
| 모델 | `jhgan/ko-sbert-multitask` |
| 베이스 | BERT (KorBERT 계열) |
| 임베딩 차원 | **768** |
| 학습 데이터 | KorNLI + KorSTS (멀티태스크) |
| KorSTS Cosine Pearson | 84.13 |
| KorSTS Cosine Spearman | 84.71 |

### 사용 예

```bash
pip install -U sentence-transformers
```

```python
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('jhgan/ko-sbert-multitask')

sentences = [
    "용꿈을 꿨다",
    "꿈에서 용을 봤어요",
    "오늘 점심은 김치찌개였다",
]
embeddings = model.encode(sentences)  # shape: (3, 768)

# 코사인 유사도
def cos_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

print(cos_sim(embeddings[0], embeddings[1]))  # ~0.85 (의미 비슷)
print(cos_sim(embeddings[0], embeddings[2]))  # ~0.15 (무관)
```

### 대안 모델

- `jhgan/ko-sroberta-multitask` — RoBERTa 기반, KorSTS Spearman 85.77 (sbert보다 약간 우수)
- `jhgan/ko-sbert-sts` — STS만 학습 (NLI 미포함, 학습 데이터에 따라 도메인 적합도 다름)
- `BM-K/KoSimCSE-roberta` — SimCSE 방식, 일부 벤치에서 더 우수

> 의미 검색 백엔드라면 임베딩을 사전 계산 후 **FAISS·Qdrant·pgvector**에 저장한다.

---

## 11. 흔한 함정

| 함정 | 증상 | 해결 |
|------|------|------|
| Mecab 설치 환경 의존 | `RuntimeError: MeCab cannot be initialized` | mecab-ko-dic 경로 환경변수 `MECABRC` 확인. PyPI `mecab-ko`로 전환 검토 |
| Windows에서 KoNLPy Mecab | `Mecab() not supported on Windows` | `mecab-ko` PyPI 패키지(옵션 A) 사용. 또는 Komoran으로 전환 |
| 은전한닢(eunjeon) 사전 별도 | Mecab은 있는데 분석 결과가 빈약 | `mecab-ko-dic` 설치 필수. `bash mecab.sh` 스크립트가 자동 처리 |
| JVM 미설치 | `JVMNotFoundException` (Hannanum/Kkma/Komoran/Okt) | Java 1.8+ 설치, `JAVA_HOME` 설정 |
| 비트 불일치 | Windows에서 KoNLPy 임포트 실패 | Python 비트 = Java 비트 (둘 다 64bit 권장) |
| 사용자 사전 미반영 | 도메인 어휘가 분리되어 분석됨 | `mecab-dict-index` 재컴파일 후 `user.dic` 경로 지정 |
| `Okt.pos(norm=True)` 의존 | 신조어 정규화 결과가 기대와 다름 | Okt의 norm은 사전 기반 → 규칙 누락 가능. 사용자 정의 후처리 결합 |
| 컨테이너 빌드 시간 | Docker 이미지 빌드 5분+ | `mecab-ko` PyPI 패키지 사용 시 wheel 설치로 단축. apt 단계 생략 |
| 한자/외국어 잘림 | "漢字"가 명사로 안 뽑힘 | Mecab은 한자를 `SH`로 태깅. `nouns()`에 안 포함되니 `pos()`로 직접 필터 |
| ko-sbert 첫 로드 느림 | 초기화 30초+ | 모델 캐싱(`~/.cache/huggingface`), 서버 기동 시 1회 로드 후 재사용 |

---

## 12. 예시 — `dream-symbol-tagging` 백엔드 (꿈 텍스트 핵심 명사 추출)

프론트엔드 `frontend/dream-symbol-tagging` 스킬이 사용자에게 꿈 일기 입력 UI를 제공하면, 백엔드는 텍스트에서 **꿈 상징어**를 추출한다.

### 12.1 도메인 사용자 사전

`dream_dict.csv`:
```csv
용꿈,,,,NNG,*,T,용꿈,*,*,*,*
돼지꿈,,,,NNG,*,T,돼지꿈,*,*,*,*
이빨빠짐,,,,NNG,*,T,이빨빠짐,*,*,*,*
가위눌림,,,,NNG,*,T,가위눌림,*,*,*,*
태몽,,,,NNG,*,T,태몽,*,*,*,*
악몽,,,,NNG,*,T,악몽,*,*,*,*
```

컴파일:
```bash
mecab-dict-index -d $(python -c "import mecab_ko; import os; print(os.path.dirname(mecab_ko.__file__))")/mecab-ko-dic \
  -u dream.dic -f utf-8 -t utf-8 dream_dict.csv
```

### 12.2 FastAPI 핸들러 (짝 스킬 `backend/python-fastapi` 패턴 기반)

```python
# app/services/dream_keyword_service.py
from collections import Counter
from typing import List
import re
import unicodedata
from mecab import MeCab

STOPWORDS = {"것", "수", "나", "너", "그", "이", "저", "때", "곳"}

class DreamKeywordService:
    def __init__(self, user_dict_path: str | None = None):
        self.mecab = MeCab(user_dictionary_path=user_dict_path) \
            if user_dict_path else MeCab()

    def _normalize(self, text: str) -> str:
        text = unicodedata.normalize("NFC", text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def extract(self, text: str, top_k: int = 5) -> List[str]:
        text = self._normalize(text)
        nouns = self.mecab.nouns(text)
        # 1자 명사 제거 + 불용어 제거
        nouns = [n for n in nouns if len(n) >= 2 and n not in STOPWORDS]
        # 빈도 기반 상위 K
        return [w for w, _ in Counter(nouns).most_common(top_k)]
```

```python
# app/routers/dream.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.dream_keyword_service import DreamKeywordService

router = APIRouter(prefix="/dreams")

class DreamRequest(BaseModel):
    text: str

class DreamResponse(BaseModel):
    keywords: list[str]

@router.post("/extract-keywords", response_model=DreamResponse)
def extract_keywords(
    req: DreamRequest,
    svc: DreamKeywordService = Depends(lambda: DreamKeywordService("dream.dic")),
):
    return DreamResponse(keywords=svc.extract(req.text, top_k=5))
```

### 12.3 의미 검색 확장 (ko-sbert)

비슷한 꿈 일기를 찾는 의미 검색이 필요하면 ko-sbert로 임베딩 후 pgvector에 저장:

```python
from sentence_transformers import SentenceTransformer

_model = SentenceTransformer('jhgan/ko-sbert-multitask')

def embed_dream(text: str) -> list[float]:
    return _model.encode(text, normalize_embeddings=True).tolist()
```

### 12.4 테스트

```python
def test_extract_dream_keywords():
    svc = DreamKeywordService("dream.dic")
    result = svc.extract("어제 용꿈을 꿨고 이빨이 빠지는 꿈도 같이 꿨다.")
    assert "용꿈" in result
    assert "이빨" in result or "이빨빠짐" in result
```

---

## 정합성 메모

- **프론트엔드 짝 스킬**: `frontend/dream-symbol-tagging`은 사용자 입력 UI와 결과 시각화를 담당한다. 본 백엔드 스킬의 `/dreams/extract-keywords` API를 호출한다.
- **백엔드 짝 스킬(예정)**: `backend/python-fastapi`가 FastAPI 라우터·의존성 주입·테스트 패턴을 제공한다. 본 스킬은 그 위에서 NLP 처리만 담당한다.
- **환경 의존성**: 컨테이너 배포 시 Dockerfile에 `pip install mecab-ko`만 추가하면 Linux 환경에서 즉시 동작한다(wheel 제공).
