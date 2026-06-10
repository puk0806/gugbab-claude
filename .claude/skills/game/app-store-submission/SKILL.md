---
name: app-store-submission
description: Unity 2D 모바일 게임을 Google Play와 App Store에 제출하기 위한 절차, 필수 에셋 사양, 심사 기준 체크리스트
---

# Unity 2D 모바일 게임 — Google Play / App Store 제출 가이드

> 소스: Google Play Console Help, Android Developers, Apple Developer (App Store Connect Help, App Review Guidelines)
> 검증일: 2026-06-09
> 대상 버전: Google Play Console (2026), App Store Connect (iOS 26 SDK / Xcode 26 기준)

---

## 1. Google Play 제출 체크리스트

### 1-1. 빌드 형식 — `.aab` 필수
- 2021년 8월부터 신규 앱은 **Android App Bundle (`.aab`)** 형식만 업로드 가능. APK 업로드 불가
- 2021년 11월부터 기존 앱 업데이트도 AAB 의무화
- AAB는 배포 전용 포맷 — 디바이스 직접 설치 불가, Google Play가 디바이스별 APK로 분할 전달
- Unity에서: **Player Settings → Publishing Settings → Build → Build App Bundle (Google Play) 체크**

### 1-2. Target API Level (매년 상향, 2026년 기준)
- **2025-08-31부터 현재 기준**: 신규 앱·업데이트는 **Android 15 (API 35) 이상** target 필수
- **2026-08-31부터**: **Android 16 (API 36) 이상** target 필수 (Wear OS·Android TV는 API 35)
- Unity에서: **Player Settings → Other Settings → Target API Level**
- 정책: 신규/업데이트는 최신 메이저 Android 출시 후 1년 이내 target 갱신, 기존 앱은 2년 이내

### 1-3. 64-bit ARM64 지원 필수
- 2019-08-01부터 모든 앱은 64-bit 아키텍처(`arm64-v8a`) 지원 필수
- 32-bit `armeabi-v7a`만 포함된 빌드는 거부됨. 32-bit를 포함하려면 반드시 64-bit도 함께 포함
- Unity에서: **Player Settings → Other Settings → Target Architectures → ARM64 체크** (IL2CPP scripting backend 사용 시)
- IL2CPP만 ARM64 빌드 가능 — Mono는 32-bit 전용

### 1-4. 앱 서명 — Play App Signing 권장
- **Play App Signing (권장)**: 업로드 키(upload key)로 서명한 AAB를 Google이 받아서 앱 서명 키(app signing key)로 재서명. 앱 서명 키는 Google KMS에 안전 보관
- **장점**: 업로드 키 분실 시 재설정 가능, 앱 서명 키 분실 위험 없음
- 절차:
  1. `keytool -genkey -v -keystore upload-keystore.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000`
  2. Unity Player Settings → Publishing Settings → Project Keystore에 등록
  3. AAB 빌드 후 Play Console에 업로드 (최초 시 Play App Signing 자동 등록)

### 1-5. 콘텐츠 등급 (IARC 설문)
- Play Console → 앱 콘텐츠 → 콘텐츠 등급에서 IARC 설문 작성
- 한 번 작성하면 ESRB(북미), PEGI(유럽), USK(독일) 등 지역별 등급이 자동 발급됨

### 1-6. 데이터 안전 (Data Safety) 섹션
- 2022-07-20부터 모든 앱에 의무. 데이터 미수집 앱도 양식 작성 필수
- 항목: 수집 데이터 유형, 사용 목적, 제3자 공유 여부, 암호화·삭제 옵션
- 개인정보처리방침 URL은 별도 필드에 추가로 제출 필수 (양식 작성과는 별개)

### 1-7. 개인정보처리방침 URL 필수
- 활성·공개·non-geofenced URL (PDF 불가)
- Play Console의 지정 필드 + 앱 내부 둘 다에 링크/텍스트 포함

---

## 2. App Store 제출 체크리스트

### 2-1. 빌드 업로드 절차
1. Unity → **Build Settings → iOS → Build** → Xcode 프로젝트 생성
2. Xcode에서 **Product → Archive** → Organizer에서 **Distribute App → App Store Connect → Upload**
3. 대안: 빌드 산출물(`.ipa`)을 **Transporter 앱**으로 직접 업로드

### 2-2. Xcode SDK 요구사항 (2026-04-28 이후)
- App Store Connect 업로드 빌드는 **iOS 26 SDK / Xcode 26 이상**으로 빌드되어야 함 (2026-04-28부터)
- 단, 이는 *빌드 SDK*이지 *deployment target*이 아님 — 앱 실행 가능한 최소 iOS 버전은 별도 설정 (iOS 16/17 등 유지 가능)

### 2-3. Bundle ID 정합성
- Xcode 프로젝트의 Bundle Identifier == App Store Connect 앱의 Bundle ID
- 빌드 업로드 후에는 변경 불가
- Unity에서: **Player Settings → iOS → Other Settings → Bundle Identifier**

### 2-4. 앱 심사 정보
- 데모 계정(로그인 필요 시 ID/PW), 연락처 정보, 메모(리뷰어 안내)
- 누락 시 거절 사유 됨

### 2-5. 개인정보처리방침 + App Privacy
- **개인정보처리방침 URL**: 필수 (App Store Connect 메타데이터 + 앱 내부 둘 다)
- **App Privacy 섹션** (Privacy Nutrition Label): 2020-12-08부터 의무. 데이터 수집 유형, 추적 사용 여부 등 설문 작성

### 2-6. 연령 등급 (2026-01-31 이후 강제 갱신)
- 기존: 4+, 9+, 12+, 17+
- 신규: **4+, 9+, 13+, 16+, 18+** (2025년 개편)
- 2026-01-31까지 모든 앱이 새 설문에 답해야 하며, 미응답 시 업데이트 제출 차단됨
- 새 설문: 인앱 통제, 의료·웰니스 주제, 폭력 테마 관련 질문 추가

### 2-7. iOS 최소 버전 (Deployment Target)
- iOS 16 이상 권장 (2026년 기준 — Xcode 26 빌드라도 deployment target은 별도)
- Unity에서: **Player Settings → iOS → Other Settings → Target minimum iOS Version**

---

## 3. 필수 에셋 사양

### 3-1. 앱 아이콘

| 스토어 | 크기 | 포맷 | 알파 채널 | 비고 |
|--------|------|------|-----------|------|
| Google Play | **512×512** | 32-bit PNG, sRGB, ≤1024KB | 권장하지 않음 (투명 영역은 Play UI 배경색으로 표시) | Play가 동적으로 둥근 모서리(반경 ≈30%)와 그림자 적용. **모서리 둥글게 만들지 말 것** |
| App Store | **1024×1024** | PNG, sRGB | **알파 채널 금지 (완전 불투명)** | Apple이 둥근 모서리를 자동 적용. 투명 PNG 업로드 시 거절 또는 검정으로 표시 |

- Unity에서: **Player Settings → Icon** 섹션에 마스터 아이콘 등록. iOS는 1024×1024 마스터 1장만 넣으면 Xcode Asset Catalog가 나머지 크기를 자동 생성

### 3-2. 스크린샷

#### Google Play
- **개수**: 최소 2장 ~ 최대 8장 (디바이스 유형별 — 폰, 7" 태블릿, 10" 태블릿 각각)
- **포맷**: 24-bit PNG 또는 JPEG, **알파 없음**, ≤8MB
- **종횡비**: 9:16 (세로) 또는 16:9 (가로)
- **크기**: 짧은 변 ≥320px, 긴 변 ≤3840px, 비율은 긴 변 ≤ 짧은 변의 2배

#### App Store (2026 기준)
- **개수**: 디바이스 클래스당 1~10장
- **포맷**: PNG 또는 JPEG, RGB, **알파 채널 없음**, **정확한 픽셀 크기 (1px 오차도 거절)**

| 디바이스 클래스 | 디스플레이 | 세로 (Portrait) | 비고 |
|------------------|-----------|----------------|------|
| iPhone 6.9" | iPhone 17 Pro Max, 16 Pro Max, 15 Pro Max | **1320×2868** | 2026 기준 권장 1순위 |
| iPhone 6.7" | iPhone 14 Plus 등 | 1290×2796 | 6.9" fallback으로 수용 가능 |
| iPhone 6.5" | iPhone XS Max, XR 등 | **1284×2778** | 6.5" 또는 6.9" 중 하나는 필수 |
| iPhone 5.5" | iPhone 8 Plus 등 | 1242×2208 | 더 이상 필수 아님 (작은 디바이스 대응용 옵션) |
| iPad 13" | iPad Pro M4/M5 | **2064×2752** | iPad 지원 앱이면 필수 |
| iPad 11" | iPad Air M2/M3/M4 | 1488×2266 | 옵션 |

> 주의: 사용자 명세에 있던 "iPhone 5.5"는 2026년 기준 필수 아님". 1순위는 6.9"(1320×2868). 6.7"(1290×2796)은 fallback으로 허용됨.

### 3-3. Feature Graphic (Google Play 전용)
- **1024×500 PXEL**, PNG 또는 JPG, 알파 없음, ≤1MB
- Play Store 검색·추천 영역에 노출되는 대표 그래픽

---

## 4. 앱 설명 최적화 (ASO 기초)

| 필드 | Google Play | App Store |
|------|-------------|-----------|
| 제목 (Title / Name) | 30자 이내 | 30자 이내 |
| 부제목 (Subtitle) | — | **30자 이내** |
| 짧은 설명 (Short Description) | 80자 이내 | — |
| 전체 설명 (Description) | 4,000자 이내 | 4,000자 이내 |
| 키워드 (Keywords) | — | **100자, 쉼표 구분, 공백 금지** |

> 주의: 사용자 명세에 있던 "App Store 부제목 80자"는 부정확. **공식 30자**. Apple 공식 문서로 확인 완료.

- App Store 키워드는 검색 색인 대상. 공백 대신 쉼표만 사용 → `puzzle,2d,casual,game,relax`

---

## 5. 심사 주요 거절 사유

### 5-1. Apple App Store Review Guidelines (빈출)

| Guideline | 내용 | 게임에서의 흔한 위반 |
|-----------|------|---------------------|
| **2.1** App Completeness | 크래시, 명백한 버그, 미완성 기능 | 첫 실행 크래시, 튜토리얼 미작동 |
| **2.3.3** Accurate Metadata | 스크린샷에 경쟁 디바이스 노출, 플레이스홀더 텍스트 | "Lorem ipsum" 잔존, Android 화면 스크린샷 |
| **3.1.1** In-App Purchase | 디지털 콘텐츠 잠금 해제는 IAP 필수, 결제 우회 금지 | 외부 결제 링크, **복원(Restore) 버튼 누락** |
| **5.1.1** Privacy | 개인정보처리방침 미제공, 계정 삭제 기능 누락 | URL 미입력, 계정 삭제가 "deleted 플래그"만 세팅 |
| **5.1.2** Data Use and Sharing | 필요 이상 권한·데이터 요청 | 게임에 불필요한 연락처/위치 권한 요청 |

추가:
- **IAP 복원 버튼**: 비소비성 IAP(Non-consumable)와 자동 갱신 구독에는 반드시 "Restore Purchases" UI 제공
- **계정 삭제**: 계정 생성 기능이 있는 앱은 앱 내 계정 삭제 기능 필수 (실제 데이터 삭제, 단순 플래그 금지)

### 5-2. Google Play 빈출 거절 사유
- **스팸 정책 위반**: 유사 앱 복붙, 동일 개발자 다중 등록
- **광고 정책**: 기만적/방해적 광고, 닫기 버튼 미제공
- **Target API Level 미준수**: 위 1-2 정책 미충족 시 업로드 차단
- **데이터 안전 양식 미작성**: 업데이트·신규 모두 차단
- **민감 권한 미선언**: SMS·CALL_LOG 등 권한 사용 시 별도 선언·심사 필요

---

## 6. 버전 관리

### 6-1. Android
- `versionCode` — 정수, 업로드마다 **반드시 증가**. Play가 새 버전 판별에 사용
- `versionName` — 사용자 표시용 문자열 (예: `"1.0.0"`)
- Unity에서:
  - `PlayerSettings.bundleVersion = "1.0.0"` (versionName)
  - `PlayerSettings.Android.bundleVersionCode = 42` (versionCode)

### 6-2. iOS
- `CFBundleShortVersionString` — 사용자 표시용 마케팅 버전 (`"1.0.0"`)
- `CFBundleVersion` — 빌드 번호, 동일 마케팅 버전 내에서도 업로드마다 증가 (`"1"`, `"2"`, ...)
- Unity에서:
  - `PlayerSettings.bundleVersion = "1.0.0"` → `CFBundleShortVersionString`에 들어감
  - `PlayerSettings.iOS.buildNumber = "1"` → `CFBundleVersion`에 들어감

### 6-3. CI에서 자동 증가
```csharp
// Editor 스크립트 예시
PlayerSettings.Android.bundleVersionCode++;
PlayerSettings.iOS.buildNumber = (int.Parse(PlayerSettings.iOS.buildNumber) + 1).ToString();
```

---

## 7. 소프트런치 / 단계적 출시

### 7-1. Google Play
- **국가별 출시**: Production track → 국가 선택 (예: 베트남, 필리핀만 먼저)
- **단계적 출시 (Staged Rollout)**: 처음에는 사용자의 1~5%에게만 배포 → 점진 확대
- **Internal/Closed/Open Testing**: 내부 100명 / 비공개 테스트 그룹 / 공개 베타 → 단계적 검증

### 7-2. App Store
- **국가별 출시**: App Store Connect → 가격 및 사용 가능 여부(Pricing and Availability)에서 특정 국가만 선택
- **단계별 출시 (Phased Release)**: iOS 사용자에게 7일간 점진 배포 옵션 (자동 업데이트 한정)
- **TestFlight**: 외부 베타 테스트 (최대 10,000명), 빌드 만료 90일

---

## 8. 흔한 실수 패턴

- iOS 아이콘에 알파 채널 남겨두기 → 거절
- Google Play 아이콘에 둥근 모서리 직접 적용 → 이중 마스킹으로 어색해짐
- App Store 스크린샷 픽셀 1개 차이 → 거절
- Android `versionCode` 증가 잊고 같은 값으로 재업로드 → Play Console 업로드 거부
- iOS Bundle ID와 Xcode 프로젝트 ID 불일치 → 업로드 단계에서 실패
- 개인정보처리방침 URL을 PDF 링크로 제출 → Google Play 거절 (HTML 페이지 필수)
- App Store 키워드 필드에 공백 포함 (예: `"puzzle, casual"`) → 색인 손실. 공백 없이 `"puzzle,casual"`
- IAP 있는 iOS 앱에서 "Restore Purchases" 버튼 누락 → 3.1.1 거절
- 계정 생성 기능 있는 앱에 계정 삭제 기능 누락 → 5.1.1(v) 거절
- iOS 26 SDK 미사용으로 2026-04-28 이후 업로드 시도 → 업로드 거부

---

## 9. 제출 직전 최종 체크리스트

### Google Play
- [ ] AAB 빌드 (APK 아님)
- [ ] Target API Level 35+ (2026-08-31 이후 36+)
- [ ] ARM64 포함, IL2CPP backend
- [ ] versionCode 이전 빌드보다 증가
- [ ] 512×512 아이콘, 1024×500 Feature Graphic
- [ ] 스크린샷 2~8장 (PNG/JPEG, 알파 없음)
- [ ] 콘텐츠 등급 IARC 설문 완료
- [ ] 데이터 안전 양식 작성
- [ ] 개인정보처리방침 URL (HTML, 공개)

### App Store
- [ ] Xcode 26 / iOS 26 SDK 빌드 (2026-04-28 이후)
- [ ] 1024×1024 아이콘, 알파 채널 없음
- [ ] 스크린샷 6.9"(1320×2868) 또는 6.5"(1284×2778) 1순위, iPad 지원 시 13" 추가
- [ ] CFBundleVersion 이전 빌드보다 증가
- [ ] Bundle ID Xcode == App Store Connect 일치
- [ ] 연령 등급 2025년 신규 설문 완료 (2026-01-31 데드라인)
- [ ] 개인정보처리방침 URL + App Privacy 설문
- [ ] IAP 있으면 Restore Purchases 버튼 구현
- [ ] 계정 생성 기능 있으면 앱 내 계정 삭제 구현
- [ ] 데모 계정·연락처·심사 메모 입력

---

## 참고 — 소스 URL

- Google Play target SDK: https://developer.android.com/google/play/requirements/target-sdk
- Google Play 64-bit 요구사항: https://developer.android.com/google/play/requirements/64-bit
- Google Play 아이콘 사양: https://developer.android.com/distribute/google-play/resources/icon-design-specifications
- Google Play Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Play App Signing: https://support.google.com/googleplay/android-developer/answer/9842756
- App Store Connect 스크린샷 사양: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
- App Store Connect 앱 정보(글자수): https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- Apple 연령 등급 업데이트: https://developer.apple.com/news/upcoming-requirements/?id=07242025a
- Apple SDK 최소 요구사항 (2026-04-28): https://developer.apple.com/news/upcoming-requirements/?id=02212025a
- Unity `PlayerSettings.Android.bundleVersionCode`: https://docs.unity3d.com/ScriptReference/PlayerSettings.Android-bundleVersionCode.html
- Unity `PlayerSettings.iOS.buildNumber`: https://docs.unity3d.com/ScriptReference/PlayerSettings.iOS-buildNumber.html
