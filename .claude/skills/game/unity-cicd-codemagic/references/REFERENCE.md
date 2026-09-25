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
