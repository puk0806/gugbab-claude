---
name: project-unity-gamedev-assets-plan
description: "Unity 2D 모바일 게임 개발 인프라 생성 계획 — 에이전트·스킬 목록, 진행 상태, 재개 포인트"
metadata: 
  node_type: memory
  type: project
  originSessionId: 9152b891-1df7-4c78-8301-10defaed293c
---

Unity 2D 모바일 캐주얼 게임 개발 전체 파이프라인용 스킬·에이전트 자산 신규 구축 계획.
**전체 완료 (2026-06-10). 커밋·푸시 완료. project-install.sh 템플릿 7번 unity-game 추가.**
**수익 목적 강화 Phase 6·7 추가 완료 (2026-06-10). 스킬 17종 + 에이전트 6종.**

**Why:** 사용자가 Unity Personal(무료) 기반 모바일 캐주얼 게임 개발 시작 예정. 기획→에셋→개발→수익화→출시 전 파이프라인 지원 자산 0개인 상태에서 인프라 구축. 광고 수익 창출 목적. REST API 백엔드 서버 있음.

**How to apply:** "Unity 게임 다시 진행", "게임 인프라 이어서" 등 호출 시 이 파일의 진행 상태 확인 후 남은 항목부터 재개.

---

## 전체 자산 목록 + 진행 상태

### Phase 1: 기획

| 구분 | 이름 | 상태 |
|------|------|------|
| 에이전트 | `game-design-document-writer` | ✅ 완료 |
| 스킬 | `game/game-design-document` | ✅ 완료 (APPROVED) |

### Phase 2: 에셋 (아트+사운드)

| 구분 | 이름 | 상태 |
|------|------|------|
| 에이전트 | `game-asset-ai-director` | ✅ 완료 |
| 스킬 | `game/ai-game-asset-pipeline` | ✅ 완료 (APPROVED) |
| 스킬 | `game/game-audio-ai-tools` | ✅ 완료 (APPROVED) |

### Phase 3: Unity 개발 (핵심)

| 구분 | 이름 | 상태 |
|------|------|------|
| 에이전트 | `unity-developer` | ✅ 완료 |
| 에이전트 | `unity-architect` | ✅ 완료 |
| 스킬 | `game/unity-6-2d-fundamentals` | ✅ 완료 (APPROVED) |
| 스킬 | `game/unity-mobile-optimization` | ✅ 완료 (APPROVED) |
| 스킬 | `game/unity-addressables` | ✅ 완료 (APPROVED) |

### Phase 4: 수익화

| 구분 | 이름 | 상태 |
|------|------|------|
| 스킬 | `game/unity-levelplay-ads` | ✅ 완료 (APPROVED) |
| 스킬 | `game/unity-iap` | ✅ 완료 (APPROVED) |

### Phase 5: 출시

| 구분 | 이름 | 상태 |
|------|------|------|
| 에이전트 | `mobile-app-publisher` | ✅ 완료 |
| 스킬 | `game/app-store-submission` | ✅ 완료 (APPROVED) |
| 스킬 | `game/unity-cicd-codemagic` | ⏳ PENDING_TEST (빌드 설정 실사용 검증 필요) |

### Phase 6: 수익 최적화 + Firebase + UA (2026-06-10 추가)

| 구분 | 이름 | 상태 |
|------|------|------|
| 에이전트 | `game-monetization-strategist` | ✅ 완료 |
| 스킬 | `game/unity-firebase` | ✅ 완료 (APPROVED) |
| 스킬 | `game/mobile-user-acquisition` | ✅ 완료 (APPROVED) |
| 스킬 | `game/unity-ui-system` | ✅ 완료 (APPROVED) |
| 스킬 | `game/unity-save-system` | ✅ 완료 (APPROVED) |

### Phase 7: 게임플레이 고도화 + 운영 (2026-06-10 추가)

| 구분 | 이름 | 상태 |
|------|------|------|
| 스킬 | `game/unity-procedural-generation` | ✅ 완료 (APPROVED) |
| 스킬 | `game/unity-game-feel` | ✅ 완료 (APPROVED) |
| 스킬 | `game/unity-live-ops` | ✅ 완료 (APPROVED) |

**project-install.sh 템플릿 7번 `unity-game` 추가 완료 (2026-06-10)**

---

## 기술 스택 확정

- **엔진**: Unity 6 LTS (6000.x), URP 2D, C# IL2CPP ARM64
- **AI 에셋**: Midjourney(컨셉) → Leonardo.ai/Scenario.gg(양산) → Krita/Aseprite(후처리)
- **AI 사운드**: Suno Pro(BGM), Meta AudioCraft(SFX 무료), ElevenLabs(TTS)
- **광고**: Unity LevelPlay 9.4.3(구 ironSource) + AdMob 미디에이션
- **IAP**: Unity IAP 5.3.1 v5 API
- **Firebase**: SDK 13.12.0 — Analytics·Crashlytics·Remote Config·FCM
- **백엔드**: REST API 서버 있음 (Railway/Fly.io/K8s 중 하나)
- **CI/CD**: Codemagic (Unity 전용, 월 500분 무료)
- **UA**: Google UAC + Meta Ads + Apple Search Ads (SKAN 4.0)
- **라이브 운영**: Addressables CCD + Firebase Remote Config

---

## 상태 범례

- ⬜ 미생성
- 🔄 생성 중
- ✅ 완료 (APPROVED)
- ⏳ PENDING_TEST (실사용 필수 카테고리)
