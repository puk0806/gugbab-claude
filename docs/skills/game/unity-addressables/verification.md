---
skill: unity-addressables
category: game
version: v1
date: 2026-06-08
status: APPROVED
---

# unity-addressables 스킬 검증 기록

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `unity-addressables` |
| 스킬 경로 | `.claude/skills/game/unity-addressables/SKILL.md` |
| 검증일 | 2026-06-08 |
| 검증자 | skill-creator (Claude) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.unity3d.com Addressables)
- [✅] 공식 GitHub 2순위 소스 확인 (needle-mirror/com.unity.addressables)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-06-08, 절대 최신 3.1.0, Unity 6 LTS 권장 2.11.1)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (10개 섹션)
- [✅] 코드 예시 작성 (LoadAssetAsync, InstantiateAsync, AssetReference, Labels, Profiles)
- [✅] 흔한 실수 패턴 정리 (섹션 9, 표 8행)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | Unity 6 LTS Addressables package latest version, LoadAssetAsync 메모리 관리, AssetReference, Labels, Profiles, UniTask 연동 | 공식 문서·needle-mirror GitHub·UniTask 레포 소스 6건 수집 |
| 조사 | WebFetch | Addressables 3.1.0 매뉴얼 index, AssetReferences, PackingGroupsAsBundles, UniTask README | API 사용 패턴·Bundle Mode·UniTask awaitable 지원 확인 |
| 교차 검증 | WebSearch | "Addressables 2.x vs 3.x breaking changes Unity 6 LTS compatible recommended version" + "memory leak Release twice Resources.Load mixing" | VERIFIED 7 / DISPUTED 1 (3.x 절대 최신이지만 Unity 6 LTS는 2.x 권장) / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Unity Addressables 공식 매뉴얼 | https://docs.unity3d.com/Packages/com.unity.addressables@latest/ | ⭐⭐⭐ High | 2026-06-08 | 1순위 공식 문서 |
| needle-mirror/com.unity.addressables Releases | https://github.com/needle-mirror/com.unity.addressables/releases | ⭐⭐⭐ High | 2026-06-08 | 공식 GitHub 미러, 버전·릴리즈 노트 |
| Addressables 2.7 PackingGroupsAsBundles | https://docs.unity3d.com/Packages/com.unity.addressables@2.7/manual/PackingGroupsAsBundles.html | ⭐⭐⭐ High | 2026-06-08 | Bundle Mode 3종 정의 |
| Addressables Memory Management (1.20/1.21/2.0) | https://docs.unity3d.com/Packages/com.unity.addressables@1.20/manual/MemoryManagement.html | ⭐⭐⭐ High | 2026-06-08 | Reference counting 원칙 |
| Addressables Profiles (1.20) | https://docs.unity3d.com/Packages/com.unity.addressables@1.20/manual/AddressableAssetsProfiles.html | ⭐⭐⭐ High | 2026-06-08 | BuildTarget 변수, Remote 설정 |
| Cysharp/UniTask | https://github.com/Cysharp/UniTask | ⭐⭐⭐ High | 2026-06-08 | Addressables awaitable 통합 |
| Unity Discussions — Addressables version choice on Unity 6 | https://discussions.unity.com/t/addressables-version-choose-on-unity6-and-question/1552656 | ⭐⭐ Medium | 2026-06-08 | Unity 6용 2.x 권장 근거 |
| TheGamedev.Guru — Unity Memory Management | https://thegamedev.guru/unity-performance/memory-management-unloading/ | ⭐⭐ Medium | 2026-06-08 | 흔한 실수 패턴 교차 검증 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Unity 6 LTS, Addressables 2.11.1 / 절대 최신 3.1.0 양쪽 표기)
- [✅] deprecated된 패턴을 권장하지 않음 (구 SceneManager 언로드 안티패턴은 "금지" 표기)
- [✅] 코드 예시가 실행 가능한 형태임 (using 문, 필드 선언, OnDestroy까지 포함)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description + example 3개)
- [✅] 소스 URL과 검증일 명시 (헤더 직후 출처 블록)
- [✅] 핵심 개념 설명 포함 (기초, 비동기 로드, 메모리 관리, AssetReference, Labels, Groups, Profiles, 빌드)
- [✅] 코드 예시 포함 (10여 개 C# 스니펫)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (AssetReference vs string address 표, Bundle Mode 표)
- [✅] 흔한 실수 패턴 포함 (섹션 9 — 8행 표)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (HeroSpawner, PrefabLoader 등 실제 컴포넌트)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X, 모바일 게임 일반 패턴)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-08 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-08
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. InstantiateAsync 오브젝트를 Destroy로 해제하면 안 되는 이유와 올바른 패턴**
- PASS
- 근거: SKILL.md 섹션 2.2 "프리팹 인스턴스화", 섹션 3.2 "세 가지 Release API 구분", 섹션 3.4 "흔한 메모리 누수 안티패턴", 섹션 9 "흔한 실수 모음"
- 상세: `Destroy(go)`는 ref-count 감소 안 됨 → 누수 확정. `Addressables.ReleaseInstance(go)` 사용이 올바른 패턴. 코드 예시 포함되어 있어 명확하게 답변 가능

**Q2. 동일 에셋 LoadAssetAsync 3회 호출 시 Release 횟수 및 handle 분실 문제**
- PASS
- 근거: SKILL.md 섹션 3.1 "핵심 원칙", 섹션 3.4 "흔한 메모리 누수 안티패턴", 섹션 9 "흔한 실수 모음"
- 상세: 섹션 3.1에 3회 호출 → ref-count=3 → Release 3번 필요 코드 예시 존재. handle 분실 패턴을 3.4와 9 양쪽에서 "절대 release 못 함 → 누수 확정"으로 명시

**Q3. Labels Intersection 패턴(enemy AND chapter1)과 해제 방법**
- PASS
- 근거: SKILL.md 섹션 5.3 "다중 라벨 (AND / OR / Intersection)"
- 상세: `MergeMode.Intersection` 코드 예시 및 "반환 handle을 release, 개별 에셋 release 금지" 주의사항이 명시되어 있어 완전한 답변 가능

### 발견된 gap

없음. 3개 질문 모두 SKILL.md 내 근거 섹션이 명확히 존재하며 anti-pattern 경고까지 포함.

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 라이브러리 사용법 스킬 — content test PASS = APPROVED 가능
- 최종 상태: APPROVED

---

> 아래는 skill-creator가 작성한 원본 템플릿 (참고용 보존)

### 테스트 케이스 1: (미수행 — 위 실제 수행 기록으로 대체)

**판정:** ⏳ PENDING (위 실제 수행 기록 참조)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-06-08, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] 교차 검증 중 DISPUTED 1건 (3.x가 절대 최신이지만 Unity 6 LTS는 2.x 권장) → SKILL.md에 양쪽 표기 + 참고 주석 추가 완료
- [✅] skill-tester 호출 후 agent content test 결과 반영 (2026-06-08 완료, 3/3 PASS)

### 교차 검증 판정 상세

| 클레임 | 판정 | 근거 |
|--------|------|------|
| Addressables 최신 버전은 3.1.0 (2026-05-26) | VERIFIED | needle-mirror GitHub releases |
| Unity 6 LTS 권장 Addressables 버전은 2.x | VERIFIED | Unity Discussions + 공식 패키지 매니저 "Recommended" 태그 |
| LoadAssetAsync는 AsyncOperationHandle을 반환하며 Release로 ref-count 감소 | VERIFIED | Memory Management 매뉴얼 1.20/1.21/2.0 동일 |
| InstantiateAsync로 만든 인스턴스는 ReleaseInstance로 해제 (Destroy 금지) | VERIFIED | 공식 매뉴얼 + Asset References 문서 |
| Bundle Mode 3종 (Pack Together / Separately / by Label) | VERIFIED | PackingGroupsAsBundles 2.7 문서 |
| UniTask는 AsyncOperationHandle을 awaitable로 자동 지원 (`.ToUniTask()`, 직접 `await`) | VERIFIED | Cysharp/UniTask README |
| Release는 즉시 메모리 해제하지 않고 AssetBundle 단위로만 언로드 | VERIFIED | Memory Management 매뉴얼 + TheGamedev.Guru 교차 |
| Resources.Load와 Addressables 혼용은 안티패턴 | VERIFIED | 공식 문서 + 커뮤니티 합의 |

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-08 | v1 | 최초 작성 (Unity 6 LTS + Addressables 2.11.1 / 3.1.0 기준) | skill-creator |
| 2026-06-08 | v1 | 2단계 실사용 테스트 수행 (Q1 InstantiateAsync 해제 패턴 / Q2 LoadAssetAsync 3회 ref-count / Q3 Labels Intersection + 해제) → 3/3 PASS, APPROVED 전환 | skill-tester |
