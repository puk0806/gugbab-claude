---
skill: unity-cicd-codemagic
category: game
version: v1
date: 2026-06-10
status: PENDING_TEST
---

# unity-cicd-codemagic 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `unity-cicd-codemagic` |
| 스킬 경로 | `.claude/skills/game/unity-cicd-codemagic/SKILL.md` |
| 검증일 | 2026-06-10 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 대상 버전 | Codemagic 2026-06 기준 / Unity 6 LTS (6.0 / 6.3) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.codemagic.io)
- [✅] 공식 GitHub 2순위 소스 확인 (codemagic-ci-cd/codemagic-sample-projects)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-06-10)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (라이선스 활성화/반환, AAB/IPA 빌드, 자동 배포)
- [✅] 코드 예시 작성 (Android·iOS 전체 워크플로우 + Editor 빌드 스크립트)
- [✅] 흔한 실수 패턴 정리 (9개 항목)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | Codemagic Unity build codemagic.yaml workflow 2026 | 공식 문서 URL 10개 확보 |
| 조사 | WebSearch | Codemagic Unity license activation UNITY_SERIAL | 라이선스 활성화 스크립트 패턴 확인 |
| 조사 | WebFetch | docs.codemagic.io/yaml-quick-start/building-a-unity-app/ | Android·iOS 워크플로우 전체 YAML 구조 |
| 조사 | WebFetch | docs.codemagic.io/yaml-basic-configuration/yaml-getting-started/ | instance_type, environment, triggering 필드 |
| 조사 | WebSearch | Codemagic pricing free plan 500 build minutes | 무료 플랜 조건 (월 500분, mac_mini_m2, 팀 제외) 확인 |
| 조사 | WebSearch | Codemagic publishing google_play track | 트랙 값(internal/alpha/beta/production) + 옵션 필드 확인 |
| 조사 | WebSearch | Codemagic app_store_connect API key TestFlight | API 키 환경변수 3종 + integration 옵션 확인 |
| 조사 | WebFetch | docs.codemagic.io/yaml-publishing/app-store-connect/ | TestFlight·App Store 자동 제출 필드 정확 |
| 조사 | WebFetch | docs.codemagic.io/yaml-publishing/google-play/ | release_promotion, rollout_fraction 등 옵션 정확 |
| 조사 | WebSearch | Codemagic android_signing keystore_reference CM_KEYSTORE | 자동 주입 환경변수 4종 확인 |
| 조사 | WebSearch | Codemagic Unity 6 LTS support | Unity 6.0 (2026-10) / 6.3 (2027-12) 지원 일정 확인 |
| 조사 | WebSearch | codemagic.yaml triggering events push tag branch_patterns | 트리거 이벤트 4종 + 패턴 매칭 규칙 확인 |
| 교차 검증 | WebSearch + WebFetch | 12개 클레임, 독립 소스 2~3개씩 | VERIFIED 11 / DISPUTED 1 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Codemagic 공식 Unity 가이드 | https://docs.codemagic.io/yaml-quick-start/building-a-unity-app/ | ⭐⭐⭐ High | 2026-06-10 | 1순위 공식 문서 |
| Codemagic codemagic.yaml 기본 | https://docs.codemagic.io/yaml-basic-configuration/yaml-getting-started/ | ⭐⭐⭐ High | 2026-06-10 | YAML 구조 정의 |
| Codemagic Google Play 배포 | https://docs.codemagic.io/yaml-publishing/google-play/ | ⭐⭐⭐ High | 2026-06-10 | publishing 필드 정의 |
| Codemagic App Store Connect 배포 | https://docs.codemagic.io/yaml-publishing/app-store-connect/ | ⭐⭐⭐ High | 2026-06-10 | publishing 필드 정의 |
| Codemagic Android 서명 | https://docs.codemagic.io/yaml-code-signing/signing-android/ | ⭐⭐⭐ High | 2026-06-10 | keystore_reference 정의 |
| Codemagic 빌드 자동 시작 | https://docs.codemagic.io/yaml-running-builds/starting-builds-automatically/ | ⭐⭐⭐ High | 2026-06-10 | triggering 필드 |
| Codemagic 가격 페이지 | https://codemagic.io/pricing/ | ⭐⭐⭐ High | 2026-06-10 | 무료 플랜 조건 |
| Codemagic Unity 버전 설치 | https://docs.codemagic.io/knowledge-others/install-unity-version/ | ⭐⭐⭐ High | 2026-06-10 | Unity Hub CLI |
| Codemagic 샘플 프로젝트 (GitHub) | https://github.com/codemagic-ci-cd/codemagic-sample-projects/tree/main/unity/unity-demo-project | ⭐⭐⭐ High | 2026-06-10 | 공식 GitHub 샘플 |
| Unity 6 LTS 지원 일정 | https://unity.com/releases/unity-6/support | ⭐⭐⭐ High | 2026-06-10 | Unity 공식 |
| Codemagic M2 마이그레이션 공지 | https://github.com/orgs/codemagic-ci-cd/discussions/2659 | ⭐⭐⭐ High | 2026-06-10 | mac_mini_m2 기본화 공지 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음 (12개 핵심 클레임 교차 검증 완료)
- [✅] 버전 정보가 명시되어 있음 (Codemagic 2026-06 / Unity 6 LTS 6000.0.32f1, 6000.3.0f1)
- [✅] deprecated된 패턴을 권장하지 않음 (mac_mini_m1은 mac_mini_m2로 대체됨 — 2024-09-01 이후)
- [✅] 코드 예시가 실행 가능한 형태임 (공식 샘플 프로젝트 yaml 구조 그대로 사용)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (Codemagic 개요, 라이선스, instance_type 등)
- [✅] 코드 예시 포함 (Android 워크플로우, iOS 워크플로우, C# Editor 스크립트)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (codemagic.yaml vs Workflow Editor, Linux는 iOS 불가)
- [✅] 흔한 실수 패턴 포함 (9개 항목)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (실제 yaml 그대로 사용 가능)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 게임/회사 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-10 최초 수행 + 2026-08-11 재검증)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (누적 6/6 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 보완 불필요)

---

## 4-A. 교차 검증 클레임 판정

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | Codemagic 무료 플랜은 월 500 빌드 분, mac_mini_m2 기준 | VERIFIED | docs.codemagic.io/billing/pricing/ + codemagic.io/pricing/ + 공식 X(트위터) |
| 2 | mac_mini_m1은 2024-09-01부터 mac_mini_m2로 대체 | VERIFIED | codemagic-ci-cd Discussions #2659 |
| 3 | Unity 라이선스 활성화는 `-batchmode -quit -serial -username -password` 패턴 | VERIFIED | docs.codemagic.io/yaml-quick-start/building-a-unity-app/ |
| 4 | 라이선스 deactivate는 `publishing.scripts`에 두는 것이 권장 | VERIFIED | 공식 가이드 "always run except if the build is cancelled" 명시 |
| 5 | 공식 가이드는 Plus/Pro 라이선스 요구 (Personal 아님) | VERIFIED | 공식 Unity 가이드 페이지 "Unity Plus or a Pro license" 인용 |
| 6 | `android_signing`에 keystore_reference 지정 시 CM_KEYSTORE_PATH 등 자동 주입 | VERIFIED | docs.codemagic.io/yaml-code-signing/signing-android/ |
| 7 | publishing.google_play.track 값: internal/alpha/beta/production/internalsharing/커스텀 | VERIFIED | docs.codemagic.io/yaml-publishing/google-play/ |
| 8 | publishing.app_store_connect에 `auth: integration` 또는 API 키 환경변수 방식 | VERIFIED | docs.codemagic.io/yaml-publishing/app-store-connect/ |
| 9 | App Store Connect API 키 환경변수 3종 이름 (APP_STORE_CONNECT_PRIVATE_KEY 등) | VERIFIED | docs.codemagic.io/partials/yaml-publishing-app-store-connect-environment-variables/ |
| 10 | iOS 빌드는 mac_mini_* 인스턴스 필수 | VERIFIED | docs.codemagic.io/yaml-basic-configuration/ + Xcode macOS 필수 사실 |
| 11 | triggering.events 값: push, pull_request, pull_request_labeled, tag | VERIFIED | docs.codemagic.io/yaml-running-builds/starting-builds-automatically/ |
| 12 | Google Play 첫 릴리즈는 수동 업로드 필수 | DISPUTED → 수정 반영 | 공식 문서 "After the first manual upload, Codemagic can automatically publish" 인용 — SKILL.md에 "주의" 표기로 반영 |

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-11
**수행자**: skill-tester → general-purpose(content test) + fact-checker(핵심 클레임 3개 WebSearch 재검증)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 재답변 + 핵심 클레임 3개 WebSearch 재검증(최초 검증일로부터 약 2개월 경과, Codemagic 문서·요금·스키마 변경 여부 재확인)

### 실제 수행 테스트 (content test, 2026-08-11)

**Q1. keystore 파일을 repo에 커밋하면 안 되는 이유와 올바른 관리 방법**
- ✅ PASS
- 근거: SKILL.md 섹션 11 "흔한 실수" 표 + 섹션 4-2 "keystore 업로드 (Codemagic UI)" + 섹션 4-3 자동 주입 환경변수 표
- 상세: 이유(보안 사고·서명 무효화 불가)와 방법(Codemagic UI 업로드 → `keystore_reference` 참조, 다운로드 불가하므로 별도 백업 필수, CM_KEYSTORE_* 4종 자동 주입)까지 근거 섹션에서 정확히 인용

**Q2. TestFlight만 자동 업로드하고 App Store 심사에는 자동 제출 안 되게 하려면**
- ✅ PASS
- 근거: SKILL.md 섹션 7-1 "publishing.app_store_connect 필드" + 섹션 7-2 "일반적인 흐름" 표 + 섹션 5-4 iOS 전체 예시
- 상세: `submit_to_testflight: true` + `submit_to_app_store: false` 조합을 섹션 7-2 표에서 정확히 인용, 섹션 5-4 실전 예시와도 일치 확인

**Q3. Unity 라이선스 시트 소진 흔한 원인과 예방법**
- ✅ PASS
- 근거: SKILL.md 섹션 3 "반환 스크립트(publishing 섹션 — 필수)" + 섹션 11 "흔한 실수" 표 1번·8번 행
- 상세: 원인(`scripts:`에 deactivate를 두면 빌드 실패 시 미실행) + 해결(`publishing.scripts`로 이동) + 추가 원인(Personal 라이선스 사용) 모두 정확히 인용

agent content test: 2026-08-11 재검증 3/3 PASS (gap: keystore 백업 위치 구체 권장 없음 — 선택 보강)

### 핵심 클레임 WebSearch 재검증 (fact-checker, 2026-08-11)

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | Codemagic Unity CI 빌드는 Unity Plus/Pro 라이선스 필요 (Personal 미보장) | ✅ VERIFIED | docs.codemagic.io/yaml-quick-start/building-a-unity-app/ 원문 그대로 유지, GitHub Discussion #2480(Codemagic 메인테이너 답변)도 동일 확인. 커뮤니티 이견(2025-12, "Unity 자체 요구사항 아니다")은 공식 정책 변경으로 이어지지 않음 |
| 2 | 무료 플랜 월 500분(mac_mini_m2 기준), 팀 계정은 무료분 미제공 | ✅ VERIFIED | codemagic.io/pricing/ + docs.codemagic.io/billing/pricing/ 두 공식 소스 모두 변경 없이 일치 |
| 3 | `publishing.google_play`/`publishing.app_store_connect` 스키마에 deprecated·변경 필드 없음 | ⚠️ DISPUTED(경미, SKILL.md에는 영향 없음) | SKILL.md가 실제 참조하는 필드(`track`, `submit_as_draft`, `rollout_fraction`, `submit_to_testflight`, `auth: integration`)는 모두 현재도 유효. 다만 같은 `app_store_connect` 섹션 내 SKILL.md가 다루지 않는 별도 인증 방식(`app_specific_password`)이 공식적으로 deprecated 처리되어 있음이 확인됨 — SKILL.md 서술 자체에는 오류 없음, 향후 인증 필드 추가 시 유의 |

**핵심 판정**: 3개 중 2 VERIFIED, 1 DISPUTED이나 이는 SKILL.md가 다루는 필드 범위 밖의 사안(참고용)으로 실질적 수정 불필요. Codemagic 문서·요금·스키마가 최초 검증일(2026-06-10) 대비 변경되지 않았음을 확인.

### 최초 수행 기록 (2026-06-10, 참고용 — 아래 내용은 그대로 보존)

**수행일**: 2026-06-10
**수행자**: skill-tester → general-purpose (도메인 에이전트 미등록으로 general-purpose 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Unity Google Play 내부 테스트 자동 배포 codemagic.yaml 핵심 구성 요소**
- PASS
- 근거: SKILL.md "4. Android (AAB) 빌드" 섹션(4-2 keystore, 4-3 환경변수 자동주입, 4-4 전체 예시), "3. Unity 라이선스 활성화/반환" 섹션, "6. Google Play 자동 배포" 섹션
- 상세: `android_signing: [keystore_reference]` → CM_KEYSTORE_* 4종 자동주입 / `publishing.scripts`에 Deactivate(빌드 실패 시에도 실행) / `publishing.google_play.track: internal` + `credentials` 설정 모두 섹션 내 코드 근거 실재

**Q2. 라이선스 시트 소진 원인 및 해결**
- PASS
- 근거: SKILL.md "3. Unity 라이선스 활성화/반환 — 반환 스크립트 (publishing 섹션 — 필수)" 섹션, "11. 흔한 실수" 표 1번행
- 상세: 원인(`scripts:` 말미에 deactivate를 두면 빌드 실패 시 미실행) + 해결(`publishing.scripts`로 이동) + 이유(`publishing.scripts`는 성공/실패 무관 실행) 모두 섹션 3에 명시

**Q3. linux_x2 iOS 빌드 불가 이유 + TestFlight 자동 업로드 설정**
- PASS
- 근거: SKILL.md "2. codemagic.yaml 기본 구조 — 유효한 instance_type" 표, "5. iOS (IPA) 빌드" 섹션(5-1 흐름, 5-2 App Store Connect 통합, 5-3 코드 서명, 5-4 전체 예시), "11. 흔한 실수" 표 3번행
- 상세: linux_x2 불가 이유(Xcode macOS 전용) 명시 / TestFlight 설정(mac_mini_m2 + integrations.app_store_connect + ios_signing + use-profiles + build-ipa + submit_to_testflight: true) 전 과정이 섹션 5-4 예시 YAML에 실재

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md 내 근거 섹션 실재, anti-pattern 회피 기술 명확

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 빌드 설정 스킬 (실사용 필수 카테고리)
- 최종 상태: PENDING_TEST 유지 (content test PASS이나 실사용 필수 카테고리 해당)

---

> 참고 (수행 예정 템플릿):
> - Q1 예상: `publishing.google_play` + `track: internal` + service account credentials + Activate/Deactivate Unity License 스크립트 포함
> - Q2 예상: `mac_mini_m2` + `integrations.app_store_connect` + `xcode-project build-ipa` + `submit_to_testflight: true`
> - Q3 예상: deactivate를 `publishing.scripts`에 두지 않아 빌드 실패 시 라이선스 반환 안 됨 → publishing.scripts로 이동 권장

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (12 클레임 중 11 VERIFIED, 1 DISPUTED 수정 반영) |
| 구조 완전성 | ✅ (frontmatter, 소스, 검증일, 코드 예시, 흔한 실수 모두 포함) |
| 실용성 | ✅ (공식 샘플 기반 실제 사용 가능한 yaml) |
| 에이전트 활용 테스트 | ✅ (2026-06-10 최초 3/3 PASS + 2026-08-11 재검증 3/3 PASS, 누적 6/6) |
| 클레임 재검증(2026-08-11) | 2 VERIFIED, 1 DISPUTED(SKILL.md 미참조 필드 관련, 실질 영향 없음) — 최초 검증일 대비 문서·요금·스키마 변경 없음 |
| **최종 판정** | **PENDING_TEST 유지** (빌드 설정 실사용 필수 카테고리 — content test·재검증 모두 PASS이나 실제 Codemagic 빌드 실행 검증 전까지 APPROVED 전환 보류) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2단계 에이전트 활용 테스트 수행 (2026-06-10 완료, 3/3 PASS)
- [✅] 핵심 클레임 재검증 — 문서·요금·스키마 최신성 확인 (2026-08-11 완료, 2 VERIFIED + 1 경미 DISPUTED — SKILL.md 실질 영향 없음)
- [❌] 실제 Unity 6.0 LTS 또는 6.3 LTS 프로젝트로 빌드 성공 여부 확인 (실사용 검증) — **차단 요인**: 실사용 필수 카테고리 APPROVED 전환 필수 조건. 실제 Codemagic 빌드 성공 확인 후 APPROVED 전환 가능
- [❌] Unity Cloud Build와의 비교 섹션 추가 검토 (필요 시) — **선택 보강**: 차단 요인 아님, 도입 검토 시 유용할 수 있음

> **참고**: 이 스킬은 "실사용 필수 스킬" 카테고리에 해당 — 실제 Codemagic 빌드를 돌려보기 전까지 PENDING_TEST 유지가 권장된다 (verification-policy.md "실사용 필수 스킬" 항목).

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-10 | v1 | 최초 작성 — Codemagic Unity Android/iOS 워크플로우, 라이선스, 자동 배포, 트리거, 흔한 실수 전반 | skill-creator |
| 2026-06-10 | v1 | 2단계 실사용 테스트 수행 (Q1 Google Play 내부 테스트 배포 구성 / Q2 라이선스 시트 소진 원인·해결 / Q3 linux_x2 iOS 불가·TestFlight 설정) → 3/3 PASS, PENDING_TEST 유지 (빌드 설정 실사용 필수 카테고리) | skill-tester |
| 2026-08-11 | v1 | 2단계 실사용 테스트 재수행 (Q1 keystore 관리 / Q2 TestFlight-only 자동배포 / Q3 라이선스 시트 소진 예방) → 3/3 PASS. 핵심 클레임 3개 WebSearch 재검증 → 2 VERIFIED, 1 경미 DISPUTED(SKILL.md 미참조 필드) — 문서·요금·스키마 변경 없음 확인, PENDING_TEST 유지(빌드 설정 실사용 필수 카테고리, 실제 빌드 미실행) | skill-tester |
