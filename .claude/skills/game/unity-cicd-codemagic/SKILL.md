---
name: unity-cicd-codemagic
description: >
  Codemagic CI/CD로 Unity 2D 모바일 게임을 자동 빌드·서명·배포하는 방법.
  codemagic.yaml 워크플로우, Unity 라이선스 활성화/반환, Android(AAB)·iOS(IPA)
  빌드, Google Play / App Store Connect 자동 배포까지 다룬다.
  <example>사용자: "Unity 게임을 Codemagic으로 Google Play 내부 테스트에 자동 배포하고 싶어"</example>
  <example>사용자: "codemagic.yaml에서 Unity 라이선스 활성화는 어떻게 하나요?"</example>
  <example>사용자: "Unity iOS 빌드 후 TestFlight 자동 업로드 워크플로우 만들어줘"</example>
---

# Unity 2D 모바일 게임 — Codemagic CI/CD

> 소스:
> - Codemagic Unity 공식 가이드: https://docs.codemagic.io/yaml-quick-start/building-a-unity-app/
> - codemagic.yaml 기본 구조: https://docs.codemagic.io/yaml-basic-configuration/yaml-getting-started/
> - Google Play 배포: https://docs.codemagic.io/yaml-publishing/google-play/
> - App Store Connect 배포: https://docs.codemagic.io/yaml-publishing/app-store-connect/
> - Android 코드 서명: https://docs.codemagic.io/yaml-code-signing/signing-android/
> - 빌드 트리거: https://docs.codemagic.io/yaml-running-builds/starting-builds-automatically/
> - 가격: https://codemagic.io/pricing/
>
> 검증일: 2026-06-10
> 대상 버전: Codemagic 2026-06 기준 / Unity 6 LTS (6.0 또는 6.3) 호환

---

## 1. Codemagic 개요

**Codemagic은 모바일 앱(Flutter, React Native, Unity, 네이티브 iOS/Android) CI/CD 전용 플랫폼.**

| 특징 | 설명 |
|------|------|
| Unity 전용 빌드 머신 | 최신 Unity LTS 사전 설치, Unity Hub CLI로 다른 버전 설치 가능 |
| codemagic.yaml | repo 루트에 커밋하는 YAML 워크플로우 정의 (Flutter Workflow Editor보다 권장) |
| 무료 플랜 | 개인 계정 월 500 빌드 분 (mac_mini_m2 기준), 매월 1일 리셋 |
| 동시 빌드 | 무료 플랜 1개, Pay-As-You-Go 추가 비용 |
| 초과 요금 | $0.095/분 (mac_mini_m2 기준) |
| 팀 사용 시 | 무료 분 제공 안 됨 (개인 계정 한정) |

### Unity 라이선스 요구사항

**Codemagic 빌드 서버에서 Unity를 활성화하려면 Unity Plus 또는 Pro 라이선스 필수.** 공식 문서에 명시되어 있다 ([building-a-unity-app](https://docs.codemagic.io/yaml-quick-start/building-a-unity-app/)).

> 주의: 공식 문서는 "Personal 라이선스"가 아닌 "Plus/Pro" 표기를 사용한다. Personal 라이선스로도 CLI 활성화가 기술적으로 가능하지만, Codemagic 공식 가이드는 Plus/Pro를 기준으로 한다.

### codemagic.yaml vs Flutter Workflow Editor

- **codemagic.yaml 권장**: Git 버전 관리, repo 단위 워크플로우, 복잡한 멀티 플랫폼 빌드 가능
- **Flutter Workflow Editor**: GUI 기반, Flutter 전용. Unity 빌드에는 사용 불가

---

## 2. codemagic.yaml 기본 구조

```yaml
workflows:
  <workflow-id>:
    name: <표시 이름>
    instance_type: mac_mini_m2      # 또는 mac_mini_m4 / linux_x2 / linux_x4 / windows_x2
    max_build_duration: 120         # 1~120분
    environment:
      unity: 6000.0.32f1            # Unity 6 LTS 버전 명시
      groups:
        - unity_credentials
      vars:
        BUILD_SCRIPT: BuildAndroid
    scripts:
      - name: <스텝 이름>
        script: |
          <bash 명령>
    artifacts:
      - <glob 패턴>
    publishing:
      <플랫폼별 설정>
    triggering:
      events: [push, tag]
      branch_patterns:
        - pattern: main
          include: true
```

### 유효한 instance_type

| 값 | 설명 |
|----|------|
| `mac_mini_m2` | Apple Silicon M2 (무료 플랜 기본) |
| `mac_mini_m4` | Apple Silicon M4 |
| `linux_x2` / `linux_x4` | Linux (iOS 빌드 불가) |
| `windows_x2` | Windows |

> **iOS 빌드는 반드시 `mac_mini_*` 사용.** Xcode는 macOS에서만 동작.

---

## 3. Unity 라이선스 활성화 / 반환

### 환경변수 설정 (Codemagic UI)

Codemagic 팀 설정 > Global variables and secrets 또는 앱 단위 Environment variables 탭에서 그룹 생성:

**그룹명: `unity_credentials`**

| 환경변수 | 값 | Secret |
|---------|-----|--------|
| `UNITY_EMAIL` | Unity 계정 이메일 | No |
| `UNITY_PASSWORD` | Unity 계정 비밀번호 | Yes |
| `UNITY_SERIAL` | 라이선스 시리얼 번호 | Yes |

### 활성화 스크립트 (빌드 시작 시)

```yaml
scripts:
  - name: Activate Unity License
    script: |
      $UNITY_HOME/Contents/MacOS/Unity -batchmode -quit -logFile - \
        -serial ${UNITY_SERIAL} \
        -username ${UNITY_EMAIL} \
        -password ${UNITY_PASSWORD}
```

`$UNITY_HOME` 환경변수는 Codemagic이 자동 주입한다 (선택한 `unity:` 버전의 설치 경로).

### 반환 스크립트 (publishing 섹션 — 필수)

```yaml
publishing:
  scripts:
    - name: Deactivate Unity License
      script: |
        $UNITY_HOME/Contents/MacOS/Unity -batchmode -quit -logFile - \
          -returnlicense -username ${UNITY_EMAIL} -password ${UNITY_PASSWORD}
```

`publishing.scripts`는 **빌드 결과(성공/실패)와 무관하게 실행**된다 (단, 빌드가 취소된 경우 제외). 라이선스 시트 소진을 막으려면 반드시 추가.

> **흔한 실수:** `scripts:` 끝에 deactivate를 두면 빌드 실패 시 실행되지 않아 시트가 소진된다. 반드시 `publishing.scripts`에 둔다.

---

## 4. Android (AAB) 빌드

### 4-1. Editor 빌드 스크립트 (Unity C#)

`Assets/Editor/BuildScript.cs`:

```csharp
using UnityEditor;
using UnityEngine;

public class BuildScript
{
    public static void BuildAndroid()
    {
        PlayerSettings.Android.useAPKExpansionFiles = false;
        EditorUserBuildSettings.buildAppBundle = true; // AAB 출력

        // keystore (환경변수 주입)
        PlayerSettings.Android.keystoreName = System.Environment.GetEnvironmentVariable("CM_KEYSTORE_PATH");
        PlayerSettings.Android.keystorePass = System.Environment.GetEnvironmentVariable("CM_KEYSTORE_PASSWORD");
        PlayerSettings.Android.keyaliasName = System.Environment.GetEnvironmentVariable("CM_KEY_ALIAS");
        PlayerSettings.Android.keyaliasPass = System.Environment.GetEnvironmentVariable("CM_KEY_PASSWORD");

        var scenes = EditorBuildSettings.scenes
            .Where(s => s.enabled)
            .Select(s => s.path)
            .ToArray();

        BuildPipeline.BuildPlayer(
            scenes,
            "android/game.aab",
            BuildTarget.Android,
            BuildOptions.None
        );
    }
}
```

### 4-2. keystore 업로드 (Codemagic UI)

Codemagic > 앱 설정 > **Code signing identities > Android keystores** 탭에서 업로드:
- 파일: `.keystore` 또는 `.jks`
- Keystore password
- Key alias
- Key alias password
- **Reference name**: codemagic.yaml에서 참조할 이름 (예: `keystore_reference`)

업로드된 keystore는 **다운로드 불가능**하므로 별도 백업 필수.

### 4-3. 기본 환경변수 (자동 주입)

`android_signing`에 keystore reference를 지정하면 Codemagic이 빌드 머신에 자동 주입:

| 환경변수 | 내용 |
|---------|------|
| `CM_KEYSTORE_PATH` | keystore 파일 경로 |
| `CM_KEYSTORE_PASSWORD` | keystore 비밀번호 |
| `CM_KEY_ALIAS` | 키 별칭 |
| `CM_KEY_PASSWORD` | 키 별칭 비밀번호 |

### 4-4. Android 워크플로우 전체 예시

```yaml
workflows:
  unity-android:
    name: Unity Android Build
    instance_type: mac_mini_m2
    max_build_duration: 120
    environment:
      unity: 6000.0.32f1
      android_signing:
        - keystore_reference
      groups:
        - unity_credentials
        - google_play
      vars:
        BUILD_SCRIPT: BuildAndroid
        GOOGLE_PLAY_TRACK: internal
        PACKAGE_NAME: "io.example.unitygame"
    scripts:
      - name: Activate Unity License
        script: |
          $UNITY_HOME/Contents/MacOS/Unity -batchmode -quit -logFile - \
            -serial ${UNITY_SERIAL} \
            -username ${UNITY_EMAIL} \
            -password ${UNITY_PASSWORD}
      - name: Set build number
        script: |
          export NEW_BUILD_NUMBER=$(($(google-play get-latest-build-number \
            --package-name "$PACKAGE_NAME" \
            --tracks="$GOOGLE_PLAY_TRACK") + 1))
      - name: Build Android AAB
        script: |
          $UNITY_HOME/Contents/MacOS/Unity -batchmode \
            -quit \
            -logFile \
            -projectPath . \
            -executeMethod BuildScript.BuildAndroid \
            -nographics
    artifacts:
      - android/*.aab
    publishing:
      scripts:
        - name: Deactivate Unity License
          script: |
            $UNITY_HOME/Contents/MacOS/Unity -batchmode -quit -logFile - \
              -returnlicense -username ${UNITY_EMAIL} -password ${UNITY_PASSWORD}
      google_play:
        credentials: $GOOGLE_PLAY_SERVICE_ACCOUNT_CREDENTIALS
        track: $GOOGLE_PLAY_TRACK
        submit_as_draft: true
```

---

## 5. iOS (IPA) 빌드

### 5-1. iOS 빌드 흐름

1. Unity가 Xcode 프로젝트 생성 (`-executeMethod BuildScript.BuildIos`)
2. Codemagic CLI(`xcode-project use-profiles`)가 코드 서명 설정 주입
3. `xcode-project build-ipa`가 IPA 빌드

### 5-2. App Store Connect 통합 설정

**옵션 A — Codemagic UI Integration (권장)**

Codemagic > Teams > Integrations > **App Store Connect** 추가 후 API 키 이름 부여. codemagic.yaml에서 참조:

```yaml
integrations:
  app_store_connect: <API key name>

publishing:
  app_store_connect:
    auth: integration
```

**옵션 B — 환경변수 방식**

App Store Connect > Users and Access > Keys에서 발급한 API 키:

| 환경변수 | 내용 | Secret |
|---------|------|--------|
| `APP_STORE_CONNECT_PRIVATE_KEY` | .p8 키 파일 내용 | Yes |
| `APP_STORE_CONNECT_KEY_IDENTIFIER` | Key ID | No |
| `APP_STORE_CONNECT_ISSUER_ID` | Issuer ID | No |

```yaml
publishing:
  app_store_connect:
    api_key: $APP_STORE_CONNECT_PRIVATE_KEY
    key_id: $APP_STORE_CONNECT_KEY_IDENTIFIER
    issuer_id: $APP_STORE_CONNECT_ISSUER_ID
```

### 5-3. iOS 코드 서명

```yaml
environment:
  ios_signing:
    distribution_type: app_store    # 또는 ad_hoc / development / enterprise
    bundle_identifier: io.example.unitygame
```

`xcode-project use-profiles`가 자동으로 인증서·프로비저닝 프로필을 fetch한다.

### 5-4. iOS 워크플로우 전체 예시

```yaml
workflows:
  unity-ios:
    name: Unity iOS Build
    instance_type: mac_mini_m2
    max_build_duration: 120
    integrations:
      app_store_connect: codemagic
    environment:
      unity: 6000.0.32f1
      ios_signing:
        distribution_type: app_store
        bundle_identifier: io.example.unitygame
      groups:
        - unity_credentials
      vars:
        UNITY_IOS_DIR: ios
        XCODE_PROJECT: "Unity-iPhone.xcodeproj"
        XCODE_SCHEME: "Unity-iPhone"
        BUNDLE_ID: "io.example.unitygame"
        APP_STORE_APPLE_ID: 1234567890
    scripts:
      - name: Activate Unity License
        script: |
          $UNITY_HOME/Contents/MacOS/Unity -batchmode -quit -logFile - \
            -serial ${UNITY_SERIAL} \
            -username ${UNITY_EMAIL} \
            -password ${UNITY_PASSWORD}
      - name: Generate Xcode project
        script: |
          $UNITY_HOME/Contents/MacOS/Unity -batchmode \
            -quit \
            -logFile \
            -projectPath . \
            -executeMethod BuildScript.BuildIos \
            -nographics
      - name: Fetch signing files
        script: |
          xcode-project use-profiles
      - name: Set build number
        script: |
          BUILD_NUMBER=$(($(app-store-connect get-latest-app-store-build-number \
            "$APP_STORE_APPLE_ID") + 1))
          cd $UNITY_IOS_DIR
          agvtool new-version -all $BUILD_NUMBER
      - name: Build IPA
        script: |
          xcode-project build-ipa \
            --project "$UNITY_IOS_DIR/$XCODE_PROJECT" \
            --scheme "$XCODE_SCHEME"
    artifacts:
      - build/ios/ipa/*.ipa
      - $HOME/Library/Developer/Xcode/DerivedData/**/Build/**/*.dSYM
    publishing:
      scripts:
        - name: Deactivate Unity License
          script: |
            $UNITY_HOME/Contents/MacOS/Unity -batchmode -quit -logFile - \
              -returnlicense -username ${UNITY_EMAIL} -password ${UNITY_PASSWORD}
      app_store_connect:
        auth: integration
        submit_to_testflight: true
        beta_groups:
          - Internal Testers
        submit_to_app_store: false
```

---

## 6. Google Play 자동 배포

### 6-1. Service Account 준비

1. Google Play Console > Setup > API access
2. Google Cloud Project에서 Service Account 생성
3. **JSON 키 파일 다운로드**
4. Service Account에 "Release manager" 권한 부여

### 6-2. Codemagic 환경변수 등록

JSON 파일 전체 내용을 환경변수로:

| 환경변수 | 값 | Secret |
|---------|-----|--------|
| `GOOGLE_PLAY_SERVICE_ACCOUNT_CREDENTIALS` | JSON 전체 텍스트 | Yes |

### 6-3. publishing.google_play 필드

```yaml
publishing:
  google_play:
    credentials: $GOOGLE_PLAY_SERVICE_ACCOUNT_CREDENTIALS
    track: internal                   # internal / alpha / beta / production / 커스텀 트랙명
    submit_as_draft: false            # draft 릴리즈로 게시 (rollout_fraction과 양립 불가)
    rollout_fraction: 0.1             # 점진적 출시 (0~1, production 권장)
    in_app_update_priority: 3         # 0~5
    release_name: "v1.2.3"            # 생략 시 versionName으로 자동 생성
    changes_not_sent_for_review: false
    release_promotion:                # 추가 트랙으로 동시 승격
      track: alpha
      rollout_fraction: 1.0
```

> **유효한 track 값:** `internal`, `alpha`, `beta`, `production`, `internalsharing`, 커스텀 closed testing 트랙명, `wear:internal` 등 Wear OS 변종.

> **주의:** Google Play에 **첫 릴리즈는 수동 업로드 필수**. 이후 버전부터 Codemagic이 자동 게시 가능.

---

## 7. App Store Connect 자동 배포

### 7-1. publishing.app_store_connect 필드

```yaml
publishing:
  app_store_connect:
    auth: integration                       # integration / 또는 api_key+key_id+issuer_id
    submit_to_testflight: true              # TestFlight 베타 리뷰에 자동 제출
    expire_build_submitted_for_review: true # 리뷰 대기 중인 이전 빌드 자동 만료
    beta_groups:
      - Internal Testers
      - External Beta
    submit_to_app_store: false              # App Store 심사에 자동 제출
    cancel_previous_submissions: false      # 이전 심사 자동 취소
    release_type: AFTER_APPROVAL            # MANUAL / AFTER_APPROVAL / SCHEDULED
    earliest_release_date: 2026-07-01T10:00:00+00:00  # SCHEDULED일 때 ISO 8601
    phased_release: true                    # 7일간 단계적 출시
    copyright: "© 2026 Example Inc."
```

### 7-2. 일반적인 흐름

| 시나리오 | 설정 |
|---------|------|
| TestFlight 내부 테스트만 | `submit_to_testflight: true`, `submit_to_app_store: false` |
| TestFlight + App Store 심사 | 둘 다 `true`, `release_type: MANUAL` |
| 자동 출시 (심사 통과 즉시) | `submit_to_app_store: true`, `release_type: AFTER_APPROVAL` |

---

## 8. 환경변수 보안 관리

### 변수 그룹 우선순위

1. **팀(Team) 레벨 그룹**: Global variables and secrets — 여러 앱에서 공유
2. **앱(App) 레벨 그룹**: 앱 단위 Environment variables 탭
3. **codemagic.yaml `vars:`**: 평문, secret 금지

### 권장 그룹 구성 (Unity 게임)

| 그룹명 | 포함 변수 |
|--------|----------|
| `unity_credentials` | `UNITY_EMAIL`, `UNITY_PASSWORD`, `UNITY_SERIAL` |
| `google_play` | `GOOGLE_PLAY_SERVICE_ACCOUNT_CREDENTIALS` |
| `app_store_connect` | API 키 환경변수 (Integration 사용 시 불필요) |

```yaml
environment:
  groups:
    - unity_credentials
    - google_play
```

### Secret 처리 원칙

- 비밀번호·키·시리얼은 반드시 **Secret 체크박스 ON** — 빌드 로그에서 마스킹됨
- repo에 환경변수를 직접 커밋 금지
- `.env` 파일 커밋 금지

---

## 9. 빌드 트리거 (triggering)

### 9-1. 트리거 가능한 이벤트

| 이벤트 | 설명 |
|--------|------|
| `push` | 브랜치 push |
| `pull_request` | PR 생성/업데이트 |
| `pull_request_labeled` | PR에 라벨 추가 (GitHub 전용) |
| `tag` | Git 태그 push |

### 9-2. 브랜치/태그별 워크플로우 분리 예시

```yaml
workflows:
  unity-android-internal:
    name: Internal Test Build
    # ... environment, scripts ...
    triggering:
      events:
        - push
      branch_patterns:
        - pattern: develop
          include: true
      cancel_previous_builds: true     # 이전 빌드 자동 취소

  unity-android-production:
    name: Production Release
    # ... environment, scripts ...
    triggering:
      events:
        - tag
      tag_patterns:
        - pattern: 'v*.*.*'            # v1.2.3 형식
          include: true
```

### 9-3. 패턴 매칭 규칙

- 첫 패턴부터 순차 적용
- 충돌 시 **뒤의 패턴이 우선**
- `*` 와일드카드 지원
- PR 빌드는 `source: true/false`로 source/target 브랜치 지정 필요

### 9-4. 수동 트리거

- Codemagic UI 대시보드에서 "Start new build" 클릭
- `triggering:` 섹션 자체를 생략하면 수동 트리거만 가능

---

## 10. Unity 6 LTS 버전 지정

Codemagic은 최신 Unity LTS를 사전 설치한다. `environment.unity:` 필드에 정확한 버전 지정:

```yaml
environment:
  unity: 6000.0.32f1     # Unity 6.0 LTS (2026-10까지 지원)
  # 또는
  unity: 6000.3.0f1      # Unity 6.3 LTS (2027-12까지 지원)
```

원하는 버전이 사전 설치되어 있지 않으면:
- Unity Hub CLI로 빌드 스크립트에서 설치
- 또는 Codemagic 지원(채팅/Discord)에 요청

> 참고: [Unity 6 지원 일정](https://unity.com/releases/unity-6/support) — 2026-06 기준 Unity 6.0 LTS는 2026-10까지, Unity 6.3 LTS는 2027-12까지 지원.

---

## 11. 흔한 실수

| 실수 | 결과 | 해결 |
|------|------|------|
| `Deactivate Unity License`를 `scripts:`에 둠 | 빌드 실패 시 라이선스 반환 안 됨 → 시트 소진 | `publishing.scripts`에 배치 |
| keystore 파일을 repo에 커밋 | 보안 사고, 키 유출 시 앱 서명 무효화 불가 | Codemagic UI 업로드 후 `keystore_reference` |
| iOS 빌드를 `linux_x2`에서 시도 | Xcode 없음, 빌드 실패 | 반드시 `mac_mini_m2` 또는 `mac_mini_m4` |
| 무료 플랜에서 매월 500분 초과 | 빌드 실패 또는 초과 요금 ($0.095/분) | Pay-As-You-Go 또는 빌드 시간 최적화 |
| 팀(Team) 계정으로 무료 플랜 기대 | 무료 분 0 — 팀은 무료 분 제공 안 됨 | 개인 계정 또는 유료 플랜 사용 |
| Google Play 첫 릴리즈를 Codemagic으로 시도 | 거부됨 — 첫 업로드는 수동 필수 | 수동 1회 업로드 후 자동화 시작 |
| `unity:` 필드 누락 | 빌드 머신 기본 LTS 사용 — 프로젝트 버전과 불일치 | 항상 명시적 버전 지정 |
| Personal 라이선스로 Codemagic 빌드 시도 | 공식 가이드 미보장 — 시트 2개 제한으로 빌드 충돌 가능 | Plus 이상 라이선스 권장 |
| `submit_as_draft: true` + `rollout_fraction` 동시 사용 | Google Play API 거부 | 둘 중 하나만 사용 |

---

## 12. 멀티 워크플로우 패턴 (Android + iOS)

하나의 `codemagic.yaml`에 Android·iOS 워크플로우를 모두 두고 트리거로 분기:

```yaml
workflows:
  unity-android:
    name: Unity Android
    # ... Android 설정 ...
    triggering:
      events: [push]
      branch_patterns:
        - pattern: main
          include: true

  unity-ios:
    name: Unity iOS
    # ... iOS 설정 ...
    triggering:
      events: [push]
      branch_patterns:
        - pattern: main
          include: true
```

Codemagic UI에서 워크플로우별 개별 실행도 가능.

---

## 13. 빌드 시간 최적화 (무료 500분 절약)

| 기법 | 효과 |
|------|------|
| `cache_paths`로 Library/, Temp/ 캐시 | Unity 컴파일 시간 단축 |
| `cancel_previous_builds: true` | 같은 브랜치 push 시 이전 빌드 자동 취소 |
| 개발 브랜치는 internal track만 | 빌드 횟수 자체 감소 |
| `max_build_duration: 60` | 무한 빌드로 분 소진 방지 |
| 정적 분석/테스트는 GitHub Actions로 위임 | Codemagic은 빌드·배포에만 사용 |

```yaml
cache:
  cache_paths:
    - $CM_BUILD_DIR/Library
    - $HOME/Library/Caches
```
