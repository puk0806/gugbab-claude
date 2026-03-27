# deep-researcher

> 주제를 논문/오픈소스/기업사례 3축으로 깊이 조사해 구조화된 보고서를 생성하는 딥리서치 오케스트레이터

| 항목 | 내용 |
|------|------|
| 파일 | `.claude/agents/research/deep-researcher.md` |
| 모델 | Opus (오케스트레이터) |
| 도구 | Agent, Read, Glob, Write, WebSearch(폴백) |
| 호출 | 자동 또는 `@deep-researcher` |

## 역할

새 에이전트 설계 전 기술 조사, 라이브러리 비교, 트렌드 파악 등 넓고 깊은 리서치가 필요할 때 사용합니다. 직접 검색하지 않고 서브에이전트(`web-searcher` × 3 병렬)에 위임하고 `research-reviewer`로 품질을 검증합니다.

## 동작 흐름

```
deep-researcher (오케스트레이터)
    │
    ├── web-searcher (논문/학술 축) ─┐
    ├── web-searcher (오픈소스 축)  ─┼── 병렬 실행
    └── web-searcher (기업사례 축) ─┘
            │
            ▼
    초안 작성 → docs/research/.draft-{slug}.md
            │
            ▼
    research-reviewer (품질 검증)
            │
      PASS ─┤─ GAPS (최대 2회 보완)
            │
            ▼
    최종 보고서 → docs/research/YYYY-MM-DD-{slug}.md
```

## 호출 예시

```
LLM 기반 코드 리뷰 자동화에 대해 리서치해줘
RAG vs Fine-tuning 기술 비교 분석해줘
이 아이디어를 고도화해줘: 실시간 협업 코드 에디터
```

## 출력물

- `docs/research/YYYY-MM-DD-{topic-slug}.md` — 최종 보고서
- `docs/research/.draft-{slug}.md` — 임시 파일 (gitignore 처리)

## 주의사항

- 주제가 너무 광범위하면 (예: "AI", "보안") 구체화 요청
- 보완 사이클은 최대 2회로 제한
- web-searcher 전체 실패 시 WebSearch 직접 폴백
