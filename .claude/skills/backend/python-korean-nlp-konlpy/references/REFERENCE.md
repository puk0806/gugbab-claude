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
