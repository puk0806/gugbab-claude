---
skill: game-audio-ai-tools
category: game
version: v1
date: 2026-09-28
status: APPROVED
---

# game-audio-ai-tools 스킬 검증 기록

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `game-audio-ai-tools` |
| 스킬 경로 | `.claude/skills/game/game-audio-ai-tools/SKILL.md` |
| 검증일 | 2026-09-28 (재검증, 이전 2026-09-26 / 최초 2026-06-08) |
| 검증자 | skill-creator (자동) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Suno pricing, AudioCraft GitHub, ElevenLabs, Unity Docs, FMOD)
- [✅] 공식 GitHub 2순위 소스 확인 (facebookresearch/audiocraft)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-06-08, Suno v5.5 / ElevenLabs Music v2 / AudioCraft 최신 / Unity 6 매뉴얼)
- [✅] 도구별 가격·라이선스 비교표 작성
- [✅] Unity AudioClip 임포트 옵션 정리 (Load Type / Compression / 모바일 최적화)
- [✅] AudioMixer 채널 구조 + dB 변환 코드
- [✅] FMOD 도입 기준 정리
- [✅] 장르별 사운드 가이드 (하이퍼캐주얼·퍼즐·RPG·캐주얼 액션)
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | Suno pricing 2026 commercial use | 가격·크레딧·상업권 정보 수집 |
| 조사 | WebSearch | Meta AudioCraft AudioGen MusicGen GitHub license | 코드 MIT / 가중치 CC-BY-NC 4.0 확인 |
| 조사 | WebSearch | ElevenLabs Music API commercial license 2026 | Music v2 상업 라이선스, Enterprise 조건 확인 |
| 조사 | WebSearch | Bfxr Jfxr web sound effects generator retro game | 무료 웹 도구 3종(Bfxr/Jfxr/jsfxr) 정리 |
| 조사 | WebSearch | Unity AudioClip import settings mobile optimization | Load Type / Compression / Mobile MP3 디코딩 |
| 조사 | WebSearch | FMOD Studio Unity Verified Solution free license | $200K 수익 / $600K 예산 임계 확인 |
| 조사 | WebSearch | ElevenLabs TTS API characters voice cloning NPC | Flash 모델 게임 NPC 권장, 문자당 과금 확인 |
| 조사 | WebSearch | Unity AudioMixer best practices BGM SFX Voice mobile | Group 분리·Ducking·dB 레벨 권장값 |
| 조사 | WebSearch | Suno AI copyright protection ownership 2026 | Thaler v. Perlmutter cert. denied (2026-03), WMG 합의·UMG/Sony 소송 진행 |
| 조사 | WebFetch | github.com/facebookresearch/audiocraft | Python 3.9+, PyTorch 2.1.0, 모델 목록, 라이선스 분리 |
| 조사 | WebFetch | suno.com/pricing | Free/Pro/Premier 가격·크레딧·상업권 |
| 조사 | WebFetch | docs.unity3d.com/Manual/class-AudioClip.html | Load Type 3종, Compression Format, Force To Mono, Sample Rate, Platform Override |
| 교차 검증 | WebSearch | 11개 핵심 클레임, 독립 소스 2~3개씩 | VERIFIED 11 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Suno Pricing | https://suno.com/pricing | ⭐⭐⭐ High | 2026-06-08 | 공식 |
| Suno Help Center | https://help.suno.com/en/articles/2746945 | ⭐⭐⭐ High | 2026-06-08 | 공식 (저작권/소유권 정책) |
| facebookresearch/audiocraft | https://github.com/facebookresearch/audiocraft | ⭐⭐⭐ High | 2026-06-08 | 공식 GitHub |
| ElevenLabs Pricing | https://elevenlabs.io/pricing | ⭐⭐⭐ High | 2026-06-08 | 공식 |
| ElevenLabs Music API | https://elevenlabs.io/music-api | ⭐⭐⭐ High | 2026-06-08 | 공식 |
| ElevenLabs Blog (Music API) | https://elevenlabs.io/blog/eleven-music-now-available-in-the-api | ⭐⭐⭐ High | 2026-06-08 | 공식 |
| Bfxr | https://www.bfxr.net/ | ⭐⭐⭐ High | 2026-06-08 | 공식 |
| Jfxr GitHub | https://github.com/ttencate/jfxr | ⭐⭐⭐ High | 2026-06-08 | 공식 |
| jsfxr | https://sfxr.me/ | ⭐⭐ Medium-High | 2026-06-08 | 도구 공식 페이지 |
| Unity AudioClip Manual | https://docs.unity3d.com/Manual/class-AudioClip.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| FMOD Licensing | https://www.fmod.com/licensing | ⭐⭐⭐ High | 2026-06-08 | 공식 |
| FMOD for Unity | https://www.fmod.com/unity | ⭐⭐⭐ High | 2026-06-08 | 공식 |
| Meta AI AudioCraft Blog | https://ai.meta.com/blog/audiocraft-musicgen-audiogen-encodec-generative-ai-audio/ | ⭐⭐⭐ High | 2026-06-08 | 공식 발표 |
| Suno 공식 도움말 — 다운로드 제한 FAQ | https://help.suno.com/en/articles/13614785 | ⭐⭐⭐ High | 2026-09-28 | 공식, "Up to 7 total (lifetime) trial downloads" — 계정 단위 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 핵심 클레임 교차 검증

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|----------|----------|------|
| 1 | Suno Free: 50크레딧/일, 비상업만 | suno.com/pricing | dynamoi.com, musicmake.ai | VERIFIED |
| 2 | Suno Pro $8(연간)·$10(월간), 2500크레딧, 상업권 | suno.com/pricing | costbench.com, novareviewhub | VERIFIED |
| 3 | Suno Premier $24(연간)·$30(월간), 10000크레딧, Suno Studio | suno.com/pricing | margabagus.com | VERIFIED |
| 4 | AudioCraft 코드 MIT, 가중치 CC-BY-NC 4.0 | github.com/facebookresearch/audiocraft | Meta AI 공식 블로그 | VERIFIED |
| 5 | AudioCraft Python 3.9+, PyTorch 2.1.0 | GitHub README | (단일 공식 소스, deterministic) | VERIFIED |
| 6 | ElevenLabs Music: 라이선스 클리어 학습 데이터, 유료 플랜 상업권 | elevenlabs.io/music-api | mindstudio.ai, theaiinsider.tech | VERIFIED |
| 7 | ElevenLabs: 대형 스튜디오 게임 → Enterprise 필요 | bigvu.tv/elevenlabs-pricing | ElevenLabs Help Center | VERIFIED |
| 8 | ElevenLabs Flash 모델: NPC 실시간 응답 권장 | ElevenLabs Pricing/Docs | leanvox.com | VERIFIED |
| 9 | FMOD Free Indie: 연 수익 $200K 미만 | fmod.com/licensing | gamedeveloper.com | VERIFIED |
| 10 | Unity Load Type: Streaming은 모바일 동시 재생 시 CPU 부하 | docs.unity3d.com | Medium(Double Shot Audio), gamedeveloper.com | VERIFIED |
| 11 | Thaler v. Perlmutter cert. denied (2026-03), 순수 AI 생성물 저작권 불가 | terms.law, mystats.music | medium.com/@J.S.Matkowski | VERIFIED |

**결과: 11/11 VERIFIED, DISPUTED 0, UNVERIFIED 0**

### 4-2. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보 명시 (Suno v5.5, ElevenLabs Music v2, AudioCraft Python 3.9+/PyTorch 2.1.0)
- [✅] deprecated된 패턴 권장 없음
- [✅] 코드 예시(AudioCraft Python, Unity C# AudioMixer) 실행 가능 형태

### 4-3. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description, example 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 도구 분류 → 도구별 상세 → Unity 임포트 → FMOD → 라이선스 → 장르별 가이드 → 실수 패턴 → 의사결정 플로우 순서
- [✅] 코드 예시 포함 (AudioGen, AudioMixer C#)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (FMOD 도입 기준, 장르별 도구 선택)
- [✅] 흔한 실수 패턴 8개 포함

### 4-4. 실용성
- [✅] 에이전트가 참조했을 때 실제 게임 사운드 워크플로우에 적용 가능
- [✅] 가격·크레딧·라이선스 표가 실제 의사결정 기준
- [✅] Unity 2D 모바일에 특화 (PC 게임에는 일부만 적용)

### 4-5. Claude Code 에이전트 활용 테스트
- [✅] skill-tester 호출 — 2026-06-08 수행 완료 (3/3 PASS), 2026-09-28 재검증 정정분 재테스트 완료 (2/2 PASS), 2026-09-28 2차 실제 재테스트 완료 (2/2 PASS)

---

## 5. 테스트 진행 기록

### [2026-09-28] skill-tester 2차 실제 재테스트 (real Agent 호출)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (Agent 도구로 독립 서브에이전트 2회 실제 비동기 호출, 완료 로그 확인)
**수행 방법**: 아래 "[2026-09-28] 선택 보강 반영" 절의 정정 내용(Suno Free "평생 7회 다운로드"가 계정 단위임)을 겨냥한 질문 1개 + 핵심 기능(Unity Load Type 선택) 질문 1개를 각각 독립 general-purpose 서브에이전트에 위임.

**Q1. "Suno Free 플랜 '평생 7회 다운로드'가 곡 하나당 7회인가, 계정 전체로 7회인가?"**
- ✅ PASS
- 근거: SKILL.md "2-1. Suno" 표 하단 주의문(줄 45)
- 상세: 서브에이전트가 "계정 단위(계정 전체를 통틀어 평생 7회), 곡 단위 아님"을 정확히 도출. "개인 용도 한정"·Free 플랜 자체가 상업 사용 금지라는 부가 정보까지 정확히 연결.

**Q2. "모바일 퍼즐 게임의 BGM(2~3분 루프)과 UI 클릭 SFX 각각 Load Type을 뭘로 설정해야 하나? 반대로 설정하면 어떤 문제가 생기나?"**
- ✅ PASS
- 근거: SKILL.md "3-2. Load Type 선택" 표 + "6-2. 퍼즐" 장르 가이드 + "7. 흔한 실수 패턴"
- 상세: BGM→Streaming, SFX→Decompress On Load를 정확히 도출. 반대로 설정 시 "BGM Decompress On Load→RAM 10배 증가", "SFX Streaming→CPU 부하 폭증·재생 지연" 두 anti-pattern을 섹션 7에서 정확히 인용.

### 발견된 gap (2차 재테스트)

- 경미: Suno 7회 소진 후 리셋 여부(시점), Decompress/Compressed In Memory 경계의 정량적 파일 크기 기준이 SKILL.md에 없음 — 차단 요인 아님, 선택 보강

### 판정 (2차 재테스트)

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (라이브러리·도구 사용법 스킬 — content test로 충분)
- **최종 상태: APPROVED**

---

### [2026-09-28] 선택 보강 반영

- **반영 내용**: Suno Free 플랜 "평생 7회 다운로드" 제한이 곡 단위가 아닌 **계정 단위**임을 SKILL.md "2-1. Suno" 표 하단 주의문에 명확화.
- **근거**: Suno 공식 도움말 "Upcoming Changes FAQ: Downloads, Models, and Terms of Service" — https://help.suno.com/en/articles/13614785 (원문: "Free: Up to 7 total (lifetime) trial downloads for personal, non-commercial use only")

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (Agent 도구 실제 서브에이전트 호출)
**수행 방법**: 2026-09-26 재검증에서 정정된 내용(Suno Free 플랜 평생 7회 다운로드 제한)을 겨냥한 질문 1개 + 핵심 기능 질문 1개를 general-purpose 서브에이전트에게 "SKILL.md만 근거로 답하라"는 조건으로 위임, 답변과 근거 섹션을 대조 검증

### 실제 수행 테스트

**Q1. Suno Free 플랜 개인 포트폴리오 다운로드 제약**
- ✅ PASS
- 근거: SKILL.md "2-1. Suno" 표 하단 주의문 ("2026-09-03부터 신설... 평생 7회 다운로드")
- 상세: 에이전트가 "평생 7회, 개인 용도 한정" 제약을 정확히 도출. Free 플랜 자체가 상업 사용 금지라는 부가 정보까지 스스로 연결해 답변.

**Q2. AudioCraft AudioGen SFX 상업 게임 사용 가능 여부**
- ✅ PASS
- 근거: SKILL.md "1. 도구 분류" 주의문, "2-2. Meta AudioCraft" 라이선스 소단락, "5. 상업 라이선스 종합 비교" 표, "7. 흔한 실수 패턴"
- 상세: 코드(MIT)/가중치(CC-BY-NC 4.0) 라이선스 분리, "그대로 사용 시 위반 소지" 경고, 3가지 대안(재학습/관대한 fork/후처리 가공) 모두 정확히 인용.

### 발견된 gap

- 경미: "평생 7회"가 계정 단위인지 곡 단위인지, AudioCraft "충분한 가공"의 정량 기준이 SKILL.md에 없음 — 차단 요인 아님, 선택 보강

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (라이브러리·도구 사용법 스킬 — 실사용 필수 카테고리 아님)
- 2026-09-26 재검증 정정 내용(Suno Free 다운로드 제한 신설)이 실제 서브에이전트 답변에 정확히 반영됨을 확인 → APPROVED 전환

---

> (2026-09-26 시점 기록 — 아래 보존)

## 5-구. (2026-09-26 시점) 테스트 진행 기록

**수행일**: 2026-06-08
**수행자**: skill-tester → general-purpose (세션 내 직접 수행)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. AudioCraft AudioGen으로 만든 wav 파일을 상업 출시 인디 게임에 바로 넣어도 되나?**
- PASS
- 근거: SKILL.md "2-2. Meta AudioCraft" 라이선스 섹션 + "7. 흔한 실수 패턴" + "5. 상업 라이선스 종합 비교"
- 상세: 코드(MIT)와 모델 가중치(CC-BY-NC 4.0) 라이선스가 다름을 명시. wav 그대로 상업 사용은 위반 소지, (a)자체 재학습 (b)관대한 fork (c)후처리·믹스 3가지 대안 모두 근거 있음. 섹션 7에 anti-pattern으로도 명시.

**Q2. BGM을 Decompress On Load로 설정했더니 RAM이 많이 쓰인다. 모든 SFX를 Streaming으로 바꾸면 어떻게 되나?**
- PASS
- 근거: SKILL.md "3-2. Load Type 선택" 표 + "7. 흔한 실수 패턴"
- 상세: BGM → Streaming, 짧은 SFX → Decompress On Load, 중간 SFX → Compressed In Memory 매핑 명확. "BGM을 Decompress On Load → RAM 10배 증가"와 "모든 SFX를 Streaming → CPU 부하 폭증, 첫 재생 지연" 두 anti-pattern 모두 섹션 7에 명시. Streaming 모바일 동시 재생 주의도 섹션 3-2에 존재.

**Q3. RPG NPC 대사 100개를 플레이어가 말 걸 때마다 ElevenLabs TTS API 런타임 호출하려 한다. 문제점과 올바른 접근법은?**
- PASS
- 근거: SKILL.md "7. 흔한 실수 패턴" + "2-3. ElevenLabs TTS 과금 단위" + "8. 빠른 의사결정 플로우"
- 상세: "NPC 보이스를 매번 런타임 TTS 호출 → 비용·지연 폭증. 사전 생성 + 캐싱이 기본"이 섹션 7에 명시. 과금 구조(문자당 크레딧, 공백·구두점 카운트)로 비용 리스크 근거화. 섹션 8에서 "미리 생성: Multilingual v2 / 실시간: Flash" 분기 제공.

### 발견된 gap

- 없음. 3개 질문 모두 SKILL.md 내 명확한 근거 섹션 존재. anti-pattern도 모두 섹션 7에 포함.

### 2026-09-26 재검증

**수행일**: 2026-09-26
**수행 방법**: WebSearch로 핵심 클레임 3개 재확인 + SKILL.md 자체 답변 확인 질문 2개

- 클레임1. Suno 요금제(Free/Pro $10·Premier $30, 크레딧·상업권) — WebSearch 재확인 → **부분 변경**: 가격·크레딧 구조는 VERIFIED(변동 없음)이나, 2026-09-03부터 Free 플랜에 "평생 7회 다운로드(개인용)" 제한이 신설됨 → SKILL.md 2-1절에 반영
- 클레임2. FMOD Indie 무료 라이선스(연 수익 $200K 미만, 개발 예산 $600K 미만) — WebSearch 재확인 → **VERIFIED** (FMOD 공식 라이선스 티어 구조와 일치, 변동 없음)
- 클레임3. ElevenLabs Music 상업 라이선스(학습 데이터 클리어, 유료 플랜 상업 사용 가능) — WebSearch 재확인 → **VERIFIED** (변동 없음, 과금 단위가 크레딧/분당 방식으로 세분화됐으나 상업 라이선스 정책 자체는 동일)

**Q1(재검증). "Suno Free 플랜으로 만든 BGM을 개인 포트폴리오용으로 다운로드해서 보관하려는데 제약이 있나?"**
- SKILL.md 답변 경로: 2-1절 "주의(2026-09-03부터 신설): Free 플랜은 평생 7회 다운로드(개인 용도 한정)로 추가 제한됨"
- 판정: PASS (갱신 후 정확한 답 도출. 갱신 전에는 이 제한이 SKILL.md에 없어 답변 불가능했을 것)

**Q2. "FMOD를 무료로 쓸 수 있는 인디 게임의 기준은?"**
- SKILL.md 답변 경로: 4-1절 "FMOD Free Indie License: 연 수익 $200K(USD) 미만, 개발 예산 $600K 미만"
- 판정: PASS

### 판정

- agent content test: 3/3 PASS (최초) + 재검증 2/2 PASS
- verification-policy 분류: 라이브러리/도구 사용법 + 의사결정 가이드 — "실사용 검증이 필요 없는 스킬"
- Suno Free 다운로드 제한 신설이라는 실질 내용 변경이 있었으므로 PENDING_TEST로 전환. 차기 skill-tester 재테스트 시 APPROVED 재검토

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-06-08) + 2/2 PASS (2026-09-26 자체 재검증) + 2/2 PASS (2026-09-28 skill-tester 2차 실제 서브에이전트 재테스트) |
| **최종 판정** | **APPROVED** (2026-09-28 skill-tester 2차 실제 재테스트 2/2 PASS — Suno 다운로드 제한 단위 정정분 반영 확인 완료) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 및 섹션 5·6 업데이트 (2026-06-08 완료, 3/3 PASS / 2026-09-28 재검증 정정분 재테스트 완료, 2/2 PASS)
- [ ] AudioCraft 모델 가중치 라이선스 회피 대안(자체 학습/관대 라이선스 fork) 실제 사례 추가 검토 — 선택 보강 (차단 요인 아님, content test에서 대안 3가지는 SKILL.md에 이미 명시됨)
- [ ] Suno 외 Udio 가격·라이선스도 비교 섹션에 추가 검토 (현재는 Suno 중심) — 선택 보강 (차단 요인 아님)
- [ ] iOS/Android 별 audio session 설정 차이는 별도 스킬로 분리 가능 (현 스킬은 임포트까지) — 선택 보강, 별도 스킬 분리 시 참조
- [✅] Suno "평생 7회 다운로드"가 계정 단위인지 곡 단위인지 명확화 (2026-09-28 반영 — Suno 공식 도움말로 확인: 계정 단위, 곡 단위 아님)
- [✅] skill-tester 2차 실제 재테스트 수행 (2026-09-28 완료, 2/2 PASS)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-08 | v1 | 최초 작성 (공식 소스 11개 클레임 VERIFIED) | skill-creator |
| 2026-06-08 | v1 | 2단계 실사용 테스트 수행 (Q1 AudioCraft 상업 라이선스 / Q2 Unity Load Type 선택 / Q3 NPC TTS 런타임 호출 anti-pattern) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-09-26 | v1 | 재검증(98개 일괄 재검증 대상). Suno Free 플랜 2026-09-03 신설 다운로드 제한(평생 7회) 반영, FMOD·ElevenLabs Music 라이선스는 변동 없음 확인 → 실질 내용 변경으로 PENDING_TEST 전환 | Claude Code |
| 2026-09-28 | v1 | 2단계 실사용 테스트 재수행 (Q1 Suno Free 다운로드 제한 / Q2 AudioCraft 상업 사용 가능 여부) → 2/2 PASS, APPROVED 전환 | skill-tester |
| 2026-09-28 | v1 | 재검증(선택 보강). Suno Free "평생 7회 다운로드" 제한이 계정 단위임을 Suno 공식 도움말로 확인 후 SKILL.md 2-1절 갱신 → 실질 내용 추가로 PENDING_TEST 전환 | Claude Code |
| 2026-09-28 | v1 | 2단계 실사용 테스트 2차 재수행 (Q1 Suno 7회 다운로드 계정 단위 확인 / Q2 Unity Load Type 선택+anti-pattern) → 2/2 PASS, APPROVED 전환 | skill-tester |
