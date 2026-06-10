---
skill: unity-save-system
category: game
version: v1
date: 2026-06-10
status: APPROVED
---

# unity-save-system 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `unity-save-system` |
| 스킬 경로 | `.claude/skills/game/unity-save-system/SKILL.md` |
| 검증일 | 2026-06-10 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 대상 버전 | Unity 6 (6000.x) / Cloud Save SDK 3.2 / com.unity.nuget.newtonsoft-json 3.2 / Unity IAP 4.x |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.unity3d.com, docs.unity.com/ugs)
- [✅] 공식 GitHub 2순위 소스 확인 (Unity 공식 패키지 changelog)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-06-10)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (저장 계층 결정 트리, temp+rename+.bak)
- [✅] 코드 예시 작성 (PlayerPrefs, JSON+File I/O, AES, Cloud Save, 마이그레이션, IAP)
- [✅] 흔한 실수 패턴 정리 (8종)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | PlayerPrefs 보안 한계 / JsonUtility vs Newtonsoft / Cloud Save UGS / AES + IL2CPP / persistentDataPath 베스트 프랙티스 / 마이그레이션 패턴 | 6개 키워드 × 다수 공식·기술 블로그 출처 확보 |
| 조사 | WebFetch | docs.unity3d.com/ScriptReference/PlayerPrefs.html · docs.unity.com/ugs/manual/cloud-save/manual/get-started · docs.unity.com/ugs/manual/cloud-save/manual/cloud-save-usage · com.unity.nuget.newtonsoft-json 매뉴얼 · bugnet.io 베스트 프랙티스 | 공식 시그니처(SaveAsync/LoadAsync/DeleteAsync/ListAllKeysAsync/QueryAsync), 초기화 순서, 플랫폼별 PlayerPrefs 경로, temp+rename 패턴 코드 직접 확보 |
| 교차 검증 | WebSearch | Cloud Save SDK 3.2 LoadAsync 시그니처, IAP 서버 검증 권장 사항 추가 검증 | VERIFIED 9 / DISPUTED 0 / UNVERIFIED 1 (`useAsync: true` FileStream 명시적 권장 — 일반 .NET 베스트 프랙티스로 채택, Unity 공식 문서 직접 언급은 미확인) |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Unity Scripting API — PlayerPrefs | https://docs.unity3d.com/ScriptReference/PlayerPrefs.html | ⭐⭐⭐ High | 2026-06-10 | 공식 |
| Unity Scripting API — Application.persistentDataPath | https://docs.unity3d.com/ScriptReference/Application-persistentDataPath.html | ⭐⭐⭐ High | 2026-06-10 | 공식 |
| Unity Cloud Save — Get Started | https://docs.unity.com/ugs/manual/cloud-save/manual/get-started | ⭐⭐⭐ High | 2026-06-10 | 공식 |
| Unity Cloud Save SDK Usage | https://docs.unity.com/ugs/manual/cloud-save/manual/cloud-save-usage | ⭐⭐⭐ High | 2026-06-10 | 공식 (3.1+ API) |
| Cloud Save API — IDataService (3.2) | https://docs.unity.com/ugs/en-us/packages/com.unity.services.cloudsave/3.2/api/Unity.Services.CloudSave.Internal.IDataService | ⭐⭐⭐ High | 2026-06-10 | 공식 |
| Newtonsoft Json Unity Package | https://docs.unity3d.com/Packages/com.unity.nuget.newtonsoft-json@2.0/manual/index.html | ⭐⭐⭐ High | 2026-06-10 | 공식 매뉴얼 |
| Unity IAP — Receipt Validation | https://docs.unity3d.com/Manual/UnityIAPValidatingReceipts.html | ⭐⭐⭐ High | 2026-06-10 | 공식 |
| Unity IAP — Backend Receipt Validation 4.0 | https://docs.unity3d.com/Packages/com.unity.purchasing@4.0/manual/BackendReceiptValidation.html | ⭐⭐⭐ High | 2026-06-10 | 공식 |
| Bugnet — Game Save Best Practices for Unity | https://bugnet.io/blog/game-save-best-practices-unity | ⭐⭐ Medium | 2026-06-10 | temp+rename+.bak 패턴, saveVersion 마이그레이션 패턴 원전 |
| Unity Discussions — saveVersion 마이그레이션 | https://discussions.unity.com/t/persistent-data-between-game-versions-unity/1642267 | ⭐⭐ Medium | 2026-06-10 | 커뮤니티 검증 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 핵심 클레임 교차 검증

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | PlayerPrefs는 int/float/string 3가지 타입만 지원 | VERIFIED | 공식 ScriptReference: SetInt/SetFloat/SetString만 정의 |
| 2 | PlayerPrefs는 암호화 없이 평문 저장 | VERIFIED | 공식 문서·다수 기술 블로그 일치 |
| 3 | PlayerPrefs 플랫폼별 저장 경로(Android shared_prefs, iOS NSUserDefaults, Windows 레지스트리 등) | VERIFIED | Unity 공식 ScriptReference 페이지 직접 확인 |
| 4 | JsonUtility는 public 필드만 직렬화, Dictionary 미지원, polymorphism 미지원 | VERIFIED | 공식 문서·복수 기술 블로그 일치 |
| 5 | com.unity.nuget.newtonsoft-json은 IL2CPP에서 동작 | VERIFIED | Unity 공식 패키지로 출시, IL2CPP 빌드 호환성 명시 |
| 6 | Cloud Save SDK 3.x: `CloudSaveService.Instance.Data.Player.SaveAsync/LoadAsync` API | VERIFIED | docs.unity.com/ugs/manual/cloud-save/manual/cloud-save-usage 직접 확인 |
| 7 | Cloud Save 3.x LoadAsync 반환 타입 `Task<Dictionary<string, Item>>` (Item은 메타데이터 포함) | VERIFIED | 공식 changelog (3.0+ Breaking Change) |
| 8 | System.Security.Cryptography.Aes + Rfc2898DeriveBytes는 IL2CPP에서 동작 | VERIFIED | Unity Discussions 다수 사례, .NET API로 IL2CPP에서 지원 |
| 9 | Application.persistentDataPath만 모든 플랫폼에서 쓰기 가능 + 앱 업데이트 후 보존 | VERIFIED | 공식 ScriptReference 직접 명시 |
| 10 | saveVersion 필드 + 순차 마이그레이션 패턴 | VERIFIED | Unity Discussions 다수 + bugnet.io 기술 블로그 |
| 11 | temp 파일 + rename + .bak 백업 패턴 | VERIFIED | bugnet.io 코드 예시 + Unity Discussions 일치 |
| 12 | Unity IAP는 서버 측 원격 검증을 자체 제공하지 않음 | VERIFIED | 공식 문서: "Unity IAP doesn't provide a built-in remote validation service" |
| 13 | FileStream(useAsync: true) 비동기 IO | UNVERIFIED (일반 .NET 베스트 프랙티스) | Unity 공식 문서 직접 언급은 미확인. .NET 표준 패턴이며 IL2CPP/Mono에서 모두 동작 |

### 4-2. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Unity 6, Cloud Save 3.2, Newtonsoft 3.2, IAP 4.x)
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임 (네임스페이스·메서드 시그니처 검증 완료)

### 4-3. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description with `<example>` 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (저장 계층 결정 트리)
- [✅] 코드 예시 포함 (PlayerPrefs/JSON/AES/Cloud Save/마이그레이션/IAP)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (결정 트리)
- [✅] 흔한 실수 패턴 8종 포함

### 4-4. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 없음)

### 4-5. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-10)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-06-10)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-10
**수행자**: skill-tester → general-purpose (domain-specific 에이전트 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Unity 2D 모바일에서 (a) BGM 볼륨, (b) 스테이지 진행도+코인, (c) 광고 제거 IAP 구매 내역을 각각 어디에 저장해야 하는가**
- PASS
- 근거: SKILL.md "1. 저장 계층 선택 결정 트리" 섹션, "2. PlayerPrefs" 섹션, "4. AES 암호화" 섹션, "7. 인앱 구매(IAP) 연계" 섹션
- 상세: (a) 결정 트리 "민감/치팅 위험? No → PlayerPrefs" + 섹션 2 치팅 무해 데이터 정의로 PlayerPrefs 정답 도출. (b) 안티패턴 #1 "PlayerPrefs에 게임 진행도 평문 저장 금지" + 결정 트리 "JSON+AES(로컬)" 경로로 정답 도출. (c) 섹션 7 "클라이언트 단독 신뢰 금지 + 서버 검증 + 비소비성 아이템은 Cloud Save 저장" 정답 도출.

**Q2. 세이브 도중 앱 강제 종료 시 파일 손상 방지 패턴 — `File.WriteAllText` 직접 호출과의 차이**
- PASS
- 근거: SKILL.md "3. JSON + File I/O" 섹션의 `SaveIO.WriteJsonAsync` 코드 및 "8. 흔한 실수 8종" #4
- 상세: 섹션 8 #4가 `File.WriteAllText` 직접 호출을 원자성 없음 안티패턴으로 명시. `WriteJsonAsync`의 (1)temp 파일 비동기 쓰기 (`useAsync: true`) → (2).bak 복사 → (3)atomic rename 3단계 패턴이 코드로 완전히 제공됨. `ReadJsonAsync`의 .bak 폴백 처리까지 포함.

**Q3. SaveData에 새 필드 추가 시 구버전 세이브 마이그레이션 처리 방법 (saveVersion 활용)**
- PASS
- 근거: SKILL.md "6. 저장 데이터 마이그레이션" 섹션 `SaveMigrator` 코드 및 핵심 규칙, "8. 흔한 실수 8종" #7
- 상세: SaveData 클래스에 새 필드 선언 시 `= new()` 디폴트 지정 패턴, `SaveMigrator.Migrate()`의 순차 if 체인(`saveVersion < N`), `MigrateFrom1To2`의 `??= new List<string> { "default" }` 패턴이 모두 코드로 존재. "v0→v3 점프 금지" 규칙과 안티패턴 #7 명시.

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md 내 직접 근거 섹션·코드 확인됨.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 (content test PASS = APPROVED 가능)
- 최종 상태: APPROVED

---

> 아래는 skill-creator가 작성한 테스트 케이스 템플릿 (참고용 보존)

### 테스트 케이스 1: 저장 방식 선택 질문 (예정)

**입력 (질문/요청):**
```
Unity 2D 모바일 게임에서 (a) 볼륨 설정 (b) 캐릭터 레벨·코인 (c) 광고 제거 IAP 구매 내역
세 가지를 각각 어디에 어떻게 저장해야 할까?
```

**기대 결과:**
- (a) PlayerPrefs (치팅돼도 무해)
- (b) JSON + AES + temp/rename/.bak 패턴, Cloud Save로 디바이스 교체 대비
- (c) 서버 검증 + Cloud Save에 entitlement 저장 + 로컬 grace period 캐시

### 테스트 케이스 2: 마이그레이션 질문 (예정)

**입력:**
```
SaveData 클래스에 새 필드 inventoryItems(List<string>)를 추가했어. 
구버전 세이브를 로드할 때 깨지지 않게 하려면?
```

**기대 결과:**
- 필드 선언 시 `= new()` 디폴트 지정
- `saveVersion` 증가 + MigrateFromXToY 함수 추가
- 한 단계씩 순차 마이그레이션

### 테스트 케이스 3: 비동기 저장 + 손상 방지 (예정)

**입력:**
```
세이브 도중 앱이 강제 종료되면 세이브 파일이 깨질 수 있어. 어떻게 막아?
```

**기대 결과:**
- temp 파일에 비동기 쓰기(`useAsync: true`)
- 기존 세이브를 .bak으로 복사
- atomic rename으로 교체
- 로드 시 원본 없으면 .bak 사용

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-06-10) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-06-10 완료, 3/3 PASS)
- [ ] `FileStream(useAsync: true)`의 IL2CPP/모바일 실기기 검증 — 공식 문서에 명시적 언급이 없어, 실기기 빌드 후 동작 확인 권장. **차단 요인 아님 — 선택적 보강**
- [ ] Cloud Save SDK 메이저 업그레이드(예: 4.x) 시 LoadAsync 시그니처 재검증 필요. **차단 요인 아님 — 버전 업그레이드 시 후속 작업**
- [ ] AES 키 빌드 시 주입 방법(예: ScriptableObject + EditorBuildSettings)에 대한 구체적 예시 보강 검토. **차단 요인 아님 — 선택적 보강**

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-10 | v1 | 최초 작성 (Unity 6 / Cloud Save 3.2 / Newtonsoft 3.2 / IAP 4.x 기준) | skill-creator |
| 2026-06-10 | v1 | 2단계 실사용 테스트 수행 (Q1 저장 방식 선택 / Q2 temp+rename+.bak 손상 방지 / Q3 saveVersion 마이그레이션) → 3/3 PASS, APPROVED 전환 | skill-tester |
