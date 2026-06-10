---
skill: unity-mobile-optimization
category: game
version: v1
date: 2026-06-08
status: APPROVED
---

# unity-mobile-optimization 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `unity-mobile-optimization` |
| 스킬 경로 | `.claude/skills/game/unity-mobile-optimization/SKILL.md` |
| 검증일 | 2026-06-08 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | Unity 6 (6000.x LTS), URP 17, Addressables 2.0+ |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Unity Manual URP/Sprite Atlas/Pixel Perfect/Tilemap Collider/Frame Debugger/Audio/Fixed updates)
- [✅] 공식 GitHub / Support 2순위 소스 확인 (Unity Support — IL2CPP build size, JetBrains Rider — Camera.main 캐싱)
- [✅] 최신 버전 기준 내용 확인 (Unity 6 LTS, URP 17, Addressables 2.0+)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (렌더링·메모리·CPU·빌드·2D 특화 5분야)
- [✅] 코드 예시 작성 (Camera.main 캐싱, ObjectPool, StringBuilder, Addressables)
- [✅] 흔한 실수 패턴 정리 (10개 안티패턴)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 (URP) | WebFetch | Unity URP 6 optimize-for-better-performance.html | URP Asset 설정 권장값 확보 (Render Scale, Soft Shadows 등). Sprite 관련 직접 내용은 미수록 → 별도 검색으로 보완 |
| 조사 (모바일 가이드) | WebFetch | unity.com/how-to/optimize-your-mobile-game-performance | 403 차단 → 다른 공식 페이지 검색으로 대체 |
| 조사 (SRP Batcher) | WebSearch | "Unity URP 2D SRP Batcher requirements" | UnityPerMaterial/UnityPerDraw CBUFFER 조건, 2D 한정 `_TexelSize` 비호환 확인 |
| 조사 (ASTC) | WebSearch | "Unity ASTC texture compression mobile 6x6" | A8 이상 iOS / Adreno 4xx+ Android 지원 확인, 비트레이트 표 작성 |
| 조사 (Addressables) | WebSearch | "Unity Addressables memory mobile optimization" | 참조 카운팅 메커니즘, 번들 크기 트레이드오프 확인 |
| 조사 (Object Pool) | WebSearch | "Unity ObjectPool UnityEngine.Pool 2026" | 2021 LTS+ built-in 표준 API, 스택 기반, `IObjectPool<T>` 구현 확인 |
| 조사 (IL2CPP/Stripping) | WebSearch | "Unity IL2CPP ARM64 Managed Stripping Level High" | Strip Engine Code + High 권장, ARMv7+ARM64 동시 활성화 확인 |
| 조사 (Sprite Atlas V2) | WebSearch | "Unity Sprite Atlas V2 tight packing padding" | V2는 2022+, Tight Packing은 메시 외곽선 기반, Padding 2~4px 확인 |
| 조사 (Tilemap Collider) | WebSearch | "Unity Composite Collider 2D Tilemap" | TilemapCollider2D + CompositeCollider2D 조합, LateUpdate 배치 갱신 확인 |
| 조사 (Camera.main) | WebSearch | "Unity Camera.main caching Update mobile" | 2019.4.9+ 내부 캐시 추가됐으나 여전히 수동 캐싱 권장 확인 |
| 조사 (Pixel Perfect) | WebSearch | "Unity Pixel Perfect Camera URP" | Asset PPU = 씬 스프라이트 PPU 일치, Move 그리드 = 1/PPU 확인 |
| 조사 (Frame Debugger) | WebSearch | "Unity Profiler Frame Debugger mobile" | iOS·WebGL은 원격 미지원, 멀티스레드 렌더링 필요 확인 |
| 조사 (Audio) | WebSearch | "Unity Vorbis OGG mono 22050 mobile" | 짧은 SFX는 PCM/ADPCM, 긴 BGM은 Vorbis Streaming 권장 확인 |
| 조사 (FixedUpdate) | WebSearch | "Unity FixedUpdate 50Hz Time.fixedDeltaTime" | 기본 0.02s (50Hz) 공식 확인 |
| 조사 (Mipmaps) | WebSearch | "Unity texture mipmap disable 2D sprite UI" | 2D/UI는 비활성화 권장, 33% 메모리 절감 확인 |
| 교차 검증 | WebSearch | SRP Batcher vs GPU Instancing 동시 사용 | DISPUTED → SRP Batcher 우선, 동시 적용 불가 사실로 확정, SKILL.md에 명시 반영 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Unity Manual — URP optimize-for-better-performance | https://docs.unity3d.com/6000.0/Documentation/Manual/urp/optimize-for-better-performance.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 (Unity 6) |
| Unity Manual — SRP Batcher (URP) | https://docs.unity3d.com/6000.3/Documentation/Manual/urp/shaders-in-universalrp-srp-batcher.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Unity Manual — Sprite Atlas 최적화 | https://docs.unity3d.com/6000.0/Documentation/Manual/sprite/atlas/workflow/optimize-sprite-atlas-usage-size-improved-performance.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Unity Manual — Pixel Perfect Camera URP | https://docs.unity3d.com/6000.1/Documentation/Manual/urp/2d-pixelperfect-ref.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Unity Manual — Tilemap Collider 2D | https://docs.unity3d.com/6000.3/Documentation/Manual/tilemaps/work-with-tilemaps/tilemap-collider-2d-reference.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Unity ScriptRef — ObjectPool<T> | https://docs.unity3d.com/ScriptReference/Pool.ObjectPool_1.html | ⭐⭐⭐ High | 2026-06-08 | 공식 스크립팅 API |
| Unity Manual — Pooling and reusing objects | https://docs.unity3d.com/6000.4/Documentation/Manual/performance-reusable-code.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Unity Manual — Addressables Memory Management | https://docs.unity3d.com/Packages/com.unity.addressables@2.0/manual/memory-assetbundles.html | ⭐⭐⭐ High | 2026-06-08 | 공식 패키지 문서 |
| Unity Manual — Frame Debugger | https://docs.unity3d.com/Manual/FrameDebugger.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Unity Manual — Audio file compression | https://docs.unity3d.com/6000.3/Documentation/Manual/AudioFiles-compression.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Unity Manual — Fixed updates | https://docs.unity3d.com/6000.3/Documentation/Manual/fixed-updates.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Unity Manual — Mipmaps | https://docs.unity3d.com/6000.2/Documentation/Manual/texture-mipmaps-introduction.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Unity Manual — Texture compression formats by platform | https://docs.unity3d.com/2020.1/Documentation/Manual/class-TextureImporterOverride.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Unity Manual — Android requirements & compatibility | https://docs.unity3d.com/6000.2/Documentation/Manual/android-requirements-and-compatibility.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Unity Manual — GPU instancing | https://docs.unity3d.com/Manual/GPUInstancing.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Unity Manual — Remove SRP Batcher compatibility | https://docs.unity3d.com/6000.0/Documentation/Manual/SRPBatcher-Incompatible.html | ⭐⭐⭐ High | 2026-06-08 | 공식 매뉴얼 |
| Unity Support — IL2CPP build size optimizations | https://support.unity.com/hc/en-us/articles/208412186-IL2CPP-build-size-optimizations | ⭐⭐⭐ High | 2026-06-08 | 공식 지원 문서 |
| Unity ScriptRef — Camera.main | https://docs.unity3d.com/ScriptReference/Camera-main.html | ⭐⭐⭐ High | 2026-06-08 | 공식 스크립팅 API |
| Unity ScriptRef — Time.fixedDeltaTime | https://docs.unity3d.com/ScriptReference/Time-fixedDeltaTime.html | ⭐⭐⭐ High | 2026-06-08 | 공식 스크립팅 API |
| Unity Manual — Optimize 2D Tilemap | https://unity.com/how-to/optimize-performance-2d-games-unity-tilemap | ⭐⭐⭐ High | 2026-06-08 | 공식 How-to |
| Arm Developer — ASTC in Unity | https://developer.arm.com/documentation/100140/0100/optimizations-for-applications-in-unity/gpu-optimizations-in-unity/astc-texture-compression-in-unity | ⭐⭐ Medium | 2026-06-08 | Arm 공식 가이드 |
| JetBrains Rider — Camera.main is expensive | https://www.jetbrains.com/help/rider/Unity.PerformanceCriticalCodeCameraMain.html | ⭐⭐ Medium | 2026-06-08 | JetBrains 공식 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Unity 6 / URP 17 / Addressables 2.0+)
- [✅] deprecated된 패턴을 권장하지 않음 (ProGuard 대신 R8 명시, Mono 대신 IL2CPP 명시)
- [✅] 코드 예시가 실행 가능한 형태임 (네임스페이스·시그니처 확인)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, example 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (렌더링/메모리/CPU/빌드/2D 특화)
- [✅] 코드 예시 포함 (Camera.main 캐싱, ObjectPool, EnemyManager, StringBuilder, Addressables)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (GPU Instancing은 특수 케이스, ADPCM vs Vorbis 등)
- [✅] 흔한 실수 패턴 포함 (10개 안티패턴 표)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (즉시 적용 가능한 Player Settings 표, ObjectPool 전체 예시)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-08 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 보완 불필요)

### 4-5. 교차 검증 클레임 판정

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | Unity FixedUpdate 기본 50Hz (Time.fixedDeltaTime=0.02) | VERIFIED | Unity ScriptRef Time.fixedDeltaTime + Unity Manual Fixed updates |
| 2 | ASTC 6×6 가 모바일 권장 (iOS A8+/Adreno 4xx+ 지원) | VERIFIED | Arm Developer + Unity Manual Texture compression |
| 3 | Mipmaps는 텍스처 메모리 33% 추가 | VERIFIED | Unity Manual Mipmaps introduction |
| 4 | UnityEngine.Pool.ObjectPool<T>는 Unity 2021 LTS부터 내장 | VERIFIED | Unity ScriptRef Pool.ObjectPool_1 |
| 5 | SRP Batcher 셰이더 조건 = UnityPerMaterial/UnityPerDraw CBUFFER | VERIFIED | Unity Manual SRPBatcher + URP shader compatibility |
| 6 | SRP Batcher와 GPU Instancing은 동시 사용 불가, SRP Batcher가 우선 | VERIFIED | Unity Manual GPU instancing + SRPBatcher-Incompatible |
| 7 | Camera.main은 Unity 2019.4.9부터 내부 캐시되지만 수동 캐싱이 여전히 권장 | VERIFIED | JetBrains Rider docs + Unity Discussion (CodeMonkey) |
| 8 | Sprite Atlas V2 = Unity 2022 도입, Tight Packing은 메시 외곽선 기반 | VERIFIED | Unity Manual Sprite Atlas Workflow + UnityCsReference 소스 |
| 9 | TilemapCollider2D + CompositeCollider2D 조합 시 LateUpdate에서 배치 갱신 | VERIFIED | Unity Manual Tilemap Collider 2D |
| 10 | Pixel Perfect Camera: Asset PPU는 씬 스프라이트 PPU와 일치, 그리드 = 1/PPU | VERIFIED | Unity Manual Pixel Perfect Camera URP |
| 11 | Managed Stripping Level High + Strip Engine Code 권장 | VERIFIED | Unity Support IL2CPP build size optimizations |
| 12 | iOS/WebGL은 원격 Frame Debugger 미지원 (멀티스레드 렌더링 필요) | VERIFIED | Unity Manual Frame Debugger |
| 13 | 모바일 Vorbis OGG는 import 시 MP3 재인코딩될 수 있음 | DISPUTED → 일반화 | 일부 소스는 Vorbis 그대로 유지된다고 함. 안전하게 "짧은 SFX는 PCM/ADPCM" 권장으로 표기. SKILL.md에서는 "MP3 재인코딩" 단정은 제거하고 22050 Mono 권장만 유지 |
| 14 | 발열 60°C 이하 절대 임계 | UNVERIFIED → 일반화 | 공식 임계치 미발견. SKILL.md에 "절대 온도보다 30분 연속 플레이 안정성 KPI 권장"으로 표기 |

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-08
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Draw Call 300개 초과 시 SRP Batcher + Sprite Atlas 적용 방법 및 GPU Instancing 동시 사용 가능 여부**
- PASS
- 근거: SKILL.md "1-1. Draw Call 최소화" 섹션
- 상세: Sprite Atlas V2 패킹 원리, SRP Batcher 조건(`UnityPerMaterial`·`UnityPerDraw` CBUFFER), GPU Instancing과의 동시 불가 및 SRP Batcher 우선 적용 원칙, `MaterialPropertyBlock`으로 호환성 제거 코드 모두 정확히 근거 존재. 일반 2D에서 SRP Batcher가 더 유리하다는 판단 기준도 명시됨.

**Q2. ObjectPool 구현 시 권장 내장 API와 코드 구조**
- PASS
- 근거: SKILL.md "3-2. Object Pooling (UnityEngine.Pool.ObjectPool<T>)" 섹션 + "8. 흔한 실수 패턴" 표
- 상세: `UnityEngine.Pool.ObjectPool<T>` (Unity 2021 LTS+), `IObjectPool<T>` 구현, `createFunc`·`actionOnGet`·`actionOnRelease`·`actionOnDestroy`·`collectionCheck`·`defaultCapacity`·`maxSize` 전 파라미터 포함 전체 예시 코드 근거 존재. `Instantiate`/`Destroy` 남발 → GC spike·발열 anti-pattern도 명시됨.

**Q3. Managed Stripping Level High 설정 시 위험과 대처법**
- PASS
- 근거: SKILL.md "5-1. Player Settings 권장값" 섹션
- 상세: High 권장 근거, 리플렉션 기반 코드(JSON 역직렬화 라이브러리·DI 컨테이너) 잘려나갈 위험, `link.xml` 보존 클래스 명시 및 `[Preserve]` 어트리뷰트 대안 모두 정확히 기술됨.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md 내에서 충분한 근거와 판단 기준이 제공됨.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법·최적화 패턴 — content test PASS = APPROVED 가능
- 최종 상태: APPROVED

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-06-08) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-06-08 완료, 3/3 PASS)
- [❌] 발열·배터리 절대 임계치는 기기 다양성 때문에 일반화하기 어렵다. 사용자 프로젝트의 타겟 디바이스 풀이 확정되면 디바이스별 30분 플레이 KPI 표를 별도 부록으로 추가 검토. (차단 요인 아님 — 선택 보강)
- [❌] URP 17 2D Renderer의 라이팅 (2D Light, Shadow Caster 2D) 최적화 항목은 본 스킬 범위 밖이라 미포함. 별도 스킬(`unity-urp-2d-lighting-optimization`) 분리 검토. (차단 요인 아님 — 별도 스킬 분리 과제)
- [❌] Burst Compiler + Job System 활용 패턴은 본 스킬에서 다루지 않음. ECS·DOTS 2D 스킬로 별도 분리. (차단 요인 아님 — 별도 스킬 분리 과제)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-08 | v1 | 최초 작성 — Unity 6 + URP 17 + Addressables 2.0+ 기준 모바일 2D 최적화 가이드. 14개 핵심 클레임 교차 검증 (VERIFIED 12 / DISPUTED 1 → 일반화 / UNVERIFIED 1 → 일반화) | skill-creator |
| 2026-06-08 | v1 | 2단계 실사용 테스트 수행 (Q1 Draw Call+SRP Batcher+GPU Instancing 동시 불가 / Q2 ObjectPool 내장 API 구조 / Q3 Managed Stripping High 위험·대처) → 3/3 PASS, APPROVED 전환 | skill-tester |
