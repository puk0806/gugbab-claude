---
name: dream-app-complete-2026-05
description: "꿈 해몽 앱 인프라 통합(1+2+3차) — 스킬 28종 + 에이전트 5종 + 기존 보강 3건. 2026-05-14·15 작성, 5단계 풀세트 검증, content test 84/84 PASS. fcfd198·ba9b26e·053eda4 커밋·푸시 완료. 사용자 본인은 별도 프로젝트에서 실제 앱 개발 예정 (gugbab-claude는 자산 보관 repo)"
metadata: 
  node_type: memory
  type: project
  originSessionId: fad2d3a7-7551-4503-a516-6a3524b02835
---

## 통합 산출물 — 스킬 28 + 에이전트 5 + 보강 3

### 1차 (2026-05-14): 핵심 흐름 11 스킬 + 1 에이전트

- **frontend 6**: web-speech-api-stt(PENDING), chat-ui-pattern(PENDING), voice-input-ui(PENDING), media-recorder-api(PENDING), whisper-api-integration(PENDING), claude-api-streaming-frontend(APPROVED), pwa-offline-llm-fallback(PENDING)
- **humanities 2**: korean-dream-interpretation-tradition(APPROVED), dream-psychology-jung-freud(APPROVED)
- **meta 1**: dream-interpretation-prompt-engineering(APPROVED)
- **architecture 1**: dream-journal-data-modeling(APPROVED)
- **validation 에이전트 1**: dream-interpretation-prompt-tester
- 클레임 113 VERIFIED / content test 33/33 PASS

### 2차 (2026-05-15): 도메인 + 안전 + 시리즈 분석 보강

- **humanities 4**: attachment-theory-basics(APPROVED), relational-pattern-analysis(APPROVED), dream-content-research(APPROVED), crisis-intervention-resources-korea(PENDING — 109/1577-0199/1388/1366/1577-1389/1577-1366/129 연 1회 재검증)
- **frontend 3**: dream-symbol-tagging(PENDING — 룰+LLM+임베딩 하이브리드), dream-recurrence-detection(PENDING — Dexie multi-entry + cosine), emotion-tagging-input(PENDING — Plutchik 권장)
- **meta 1**: dream-safety-classifier-prompts(PENDING — Haiku 4.5 분류기 + Sonnet 4.6 해몽 2단계 ~4% 비용)
- **에이전트 3**: dream-safety-classifier(validation), dream-multi-perspective-synthesizer(research), dream-journal-coach(research)
- **기존 보강 3건**: meta/dream-interpretation-prompt-engineering(§13~15 관계 조언 가드·해석 깊이 옵션·톤 변형), humanities/dream-psychology-jung-freud(§8 짝 스킬), humanities/korean-dream-interpretation-tradition(§9 짝 스킬)
- 클레임 87 VERIFIED / content test 24/24 PASS

### 3차 (2026-05-15): UX 강화 + 윤리·법적 + 운영 + 이미지 안전

- **frontend UX 5**: dream-image-generation(PENDING — DALL-E 3·Imagen 4·Stability AI), dream-statistics-visualization(PENDING — Recharts 3.8.x + visx, ColorBrewer), pwa-push-notifications(PENDING — iOS Safari 16.4+ Web Push 홈 화면 한정), dream-app-onboarding(PENDING — react-joyride 3.1.0), dream-export-import(PENDING — libsodium Argon2id + File System Access API)
- **frontend·humanities 윤리·법적 3**: dream-privacy-consent-ui(PENDING), dream-content-privacy-ethics(APPROVED — PIPA + GDPR + APA Ethics + HIPAA), dream-sharing-anonymized(PENDING — KLUE/KoBERT PII + k-anonymity 4 공격 + 정보통신망법 제44조의2)
- **meta 1**: dream-app-ab-testing-prompts(APPROVED — Kohavi 표본 + Frequentist vs Bayesian + 안전 가드 A/B 금지 Bird 2023)
- **validation 에이전트 1**: dream-image-safety-classifier(이미지+프롬프트 이중 안전)
- 클레임 100+ VERIFIED / content test 27/27 PASS

## 카운트 합계

| 영역 | 1차 | 2차 | 3차 | 합계 |
|------|:---:|:---:|:---:|:---:|
| 스킬 | 11 | 8 | 9 | **28종** |
| 에이전트 | 1 | 3 | 1 | **5종** |
| 기존 보강 | — | 3 | — | 3건 |

content test 누적 **84/84 PASS** (FAIL 0).

## 전체 흐름 (3차 반영)

```
[온보딩] dream-app-onboarding → dream-privacy-consent-ui
   ↓
[꿈 입력] web-speech-api-stt / media-recorder-api + whisper-api-integration
          + voice-input-ui + emotion-tagging-input
   ↓
[안전 분류] dream-safety-classifier(텍스트)
   ├─ unsafe → 109/1577-0199 안내
   └─ safe ↓
       [해몽 생성] dream-multi-perspective-synthesizer
                   ↓ claude-api-streaming-frontend → chat-ui-pattern
   ↓
[(선택) 시각화] dream-image-generation
           ↓ dream-image-safety-classifier(이미지) — 차단/경고
   ↓
[저장·태깅] dream-journal-data-modeling(Dexie)
            + dream-symbol-tagging + dream-recurrence-detection
   ↓
[누적 분석] dream-journal-coach + dream-statistics-visualization
   ↓
[알림·소통] pwa-push-notifications + dream-export-import + dream-sharing-anonymized
   ↓
[운영·개선] dream-app-ab-testing-prompts + dream-interpretation-prompt-tester
```

## 커밋·푸시 완료

- `fcfd198` [skill] 1차 스킬 11종 + 1 에이전트
- `ba9b26e` [agent] 2차 에이전트 3종 + 1차·2차 보강
- `053eda4` [docs] verification.md 28종 + README 동기화

모두 origin/main 푸시 완료.

## 사용 시점

- 사용자 본인은 *별도 프로젝트*에서 PWA 꿈 해몽 앱 개발 예정
- 본 repo의 자산은 `project-install.sh`로 이식
- 활용 순서: 1차 → 2차 → 3차 (필수 → 안전 → UX)

## 결정 사항 (메인 판단 후 적용된 것)

- STT 방식: web-speech-api-stt + whisper-api-integration + media-recorder-api **모두 폴백**
- 융·프로이트: **통합 1개** (dream-psychology-jung-freud)
- 백엔드: 프론트 우선 + **백엔드 변형 패턴 본문 명시**
- 진행: Wave별 묶음 병렬
- 안전 분류기와 해몽기 **분리** (이중 안전망, 비용 ~4%)
- 이미지 안전 분류기 텍스트 분류기와 **분리** (모달리티별)

## 주의 사항

- 109(자살예방상담전화)는 2024-01-01 1393·129 통합. **1393 deprecated**
- crisis-intervention-resources-korea는 **연 1회 재검증** (전화번호 변동)
- 만 14세 미만 처리 시 법정대리인 동의(PIPA·정보통신망법)
- 진단·치료 권유 절대 금지 (학술 한계 박스 항상 동반)
- k-anonymity 한계: 동질성 공격·배경지식 공격·확률 공격·확률성 공격
