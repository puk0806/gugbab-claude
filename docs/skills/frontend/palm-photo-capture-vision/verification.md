---
skill: palm-photo-capture-vision
category: frontend
version: v1
date: 2026-09-10
status: APPROVED
---

# 스킬 검증 — palm-photo-capture-vision

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `palm-photo-capture-vision` |
| 스킬 경로 | `.claude/skills/frontend/palm-photo-capture-vision/SKILL.md` |
| 검증일 | 2026-09-10 |
| 검증자 | skill-creator (Claude Code) |
| 스킬 버전 | v1 |
| 소스 유형 | 라이브러리·표준 혼합 (Anthropic 공식 API 문서 + MDN 웹 표준 + 국내 법령 + 학술 원저) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 — Anthropic Vision / vision-coordinates / API overview (platform.claude.com)
- [✅] 웹 표준 1순위 소스 확인 — MDN getUserMedia / applyConstraints / toBlob / createImageBitmap / input[type=file] / Permissions.query
- [✅] 법령 1순위 소스 확인 — 법제처 「찾기쉬운 생활법령정보」 개인정보 보호법 제23조·시행령 제18조
- [✅] 학술·백과 소스 확인 — Pech-Pacheco et al. (ICPR 2000), Britannica "Palmistry"
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-09-10) — Vision 해상도 티어(표준 1568 / 고해상도 2576·4784), 요청 크기 32MB, 이미지당 10MB
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 — 카메라 권한 UX, 가이드 오버레이, 품질 검증, 리사이즈·압축, 2단 게이트, 개인정보 원칙, 폴백
- [✅] 코드 예시 작성 — TypeScript/React 실행 가능 형태 (공식 참조 구현 인용 포함)
- [✅] 흔한 실수 패턴 정리 — 18항목
- [✅] SKILL.md 파일 작성
- [✅] 짝 스킬 상호 참조 명시 (dream-app-onboarding / palmistry-limitations — 2026-09-11 기준)
- [❌] skill-tester를 통한 agent content test (본 작업 범위는 creation-workflow 1~4단계로 한정됨 — 사용자 지시)

> 본 작업(skill-creator 세션)은 사용자 지시에 따라 `creation-workflow.md` **1~4단계만** 수행했다.
> 5단계(skill-tester 실사용 테스트)와 6단계(README 동기화)는 그 세션에서 의도적으로 수행하지
> 않았다. README.md 및 docs/skills/README.md는 그 세션에서 **수정하지 않았다**.
>
> **후속 업데이트(2026-09-10, skill-tester)**: 5단계(agent content test)는 별도 세션에서
> 수행 완료했다(§4-4, §5~§8 참조. 3/3 PASS → APPROVED). 6단계(README 동기화)는 여전히
> 미수행 상태이며 별도 배치에서 처리해야 한다(§7 참조).

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 사전 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 템플릿 구조 확보 |
| 사전 확인 | Glob | `.claude/skills/**/palm-photo-capture-vision/SKILL.md` | 결과 없음 → 신규 생성 확정 (중복 없음) |
| 사전 확인 | Glob | `.claude/skills/**/{dream-app-onboarding,palmistry-limitations}/SKILL.md` | 작성 시점엔 `dream-app-onboarding`만 존재 → SKILL.md에 "미존재 시 대응" 주석 명시. 2026-09-11 `palmistry-limitations` 존재 확인, 함께 참조했던 운세 콘텐츠 윤리 스킬은 삭제돼 참조 제거 |
| 사전 확인 | Read | `.claude/skills/frontend/dream-app-onboarding/SKILL.md` (1~60행) | 맥락적 권한 요청 패턴·짝 스킬 표기 관례 확인, 중복 서술 회피 |
| 사전 확인 | Grep | `^user-invocable:` 등 frontmatter 관례 | 레포 내 `user-invocable: false` 선례 4건 확인 (education·architecture·research) |
| 조사 | WebFetch | `docs.claude.com/en/docs/build-with-claude/vision` | 302 리다이렉트 → `platform.claude.com` 정규 경로 확인 |
| 조사 | WebFetch | `platform.claude.com/docs/en/build-with-claude/vision` | 포맷 4종, 10MB/5MB, 8000px, 100·600장, 28×28 패치, 티어 표, 한계 목록, 보관 FAQ 전문 확보 |
| 조사 | WebFetch | `platform.claude.com/docs/en/build-with-claude/vision-coordinates` | 리사이즈 규칙 원문 + TypeScript 참조 구현 전문 + `transformations.oversized_image` 확보 |
| 조사 | WebFetch | `platform.claude.com/docs/en/api/overview` | Messages/Token Counting 32MB, Batches 256MB, Files 500MB, 413 `request_too_large`, Bedrock 20MB·GCP 30MB 확보 |
| 조사 | WebFetch | MDN `MediaDevices/getUserMedia` | 시그니처, 보안 컨텍스트, Permissions-Policy `camera`, 예외 7종 정의, facingMode ideal/exact 확보 |
| 조사 | WebFetch | MDN `MediaStreamTrack/applyConstraints` | 시그니처, `OverconstrainedError` reject, getCapabilities/getSettings, torch/focusMode/zoom은 별도 문서 소관임을 확인 |
| 조사 | WebFetch | MDN `HTMLCanvasElement/toBlob` | 3종 시그니처, 기본 `image/png`, quality 0~1 범위 밖이면 기본값, 미지원 type→PNG 폴백, 비동기 확보 |
| 조사 | WebFetch | MDN `Window/createImageBitmap` | `imageOrientation` 3값(from-image 기본/flipY/none), resizeWidth·Height·Quality(low 기본) 확보 |
| 조사 | WebFetch | MDN `<input type="file">` | `capture` 값 `user`/`environment`, accept 연동 조건, 미지원 시 기본 모드 폴백 확보 |
| 조사 | WebFetch | MDN `Permissions/query` | `camera` 이름 존재, 미지원 이름은 `TypeError` reject, state 3값 확보 |
| 조사 | WebFetch | 법제처 easylaw.go.kr (개인정보처리자의 민감정보 처리) | 시행령 제18조 민감정보 6항목 및 생체인식정보 정의 원문 확보 |
| 교차 검증 | WebSearch | "Claude API vision image size limit 1568 5MB base64" | 구버전 문서·서드파티에서 5MB 서술 발견 → **DISPUTED**로 처리 |
| 교차 검증 | WebSearch | "Claude 4.7 high-resolution 2576 px 4784 visual tokens 28x28" | 독립 소스에서 2576px·4784토큰·28×28 패치 일치 확인 → VERIFIED |
| 교차 검증 | WebSearch | "iOS Safari getUserMedia WKWebView playsinline autoplay" | playsinline·muted·autoplay 필요, iOS 14.3 WKWebView 노출, iOS Chrome/FF의 WebKit 상속 확인 |
| 교차 검증 | WebSearch | "WebKit WKWebView iOS 14.3 getUserMedia release notes" | 두 번째 독립 소스로 iOS 14.3 노출·네이티브 usage description 필요 재확인 → VERIFIED |
| 교차 검증 | WebSearch | "variance of Laplacian Pech-Pacheco 2000 threshold 100" | 원저 출처 확인 + 임계값 100이 *관례값*임을 확인 → 조건부 VERIFIED |
| 교차 검증 | WebSearch | "GDPR biometric palm print / 개인정보보호법 생체정보" | GDPR Art.4(14) palm print 예시 + "고유 식별" 조건 확인 |
| 교차 검증 | WebSearch | "개인정보보호위원회 생체정보 보호 가이드라인 원본정보 특징정보" | 특징정보만 민감정보라는 해석을 두 번째 소스로 확인 → VERIFIED |
| 교차 검증 | WebSearch | "palmistry pseudoscience Britannica" | 과학적 근거 부재 서술 확인 → VERIFIED |
| 교차 검증 | WebSearch | "input capture attribute ignored desktop" | 데스크톱에서 일반 파일 선택기로 폴백됨 확인 → VERIFIED |
| 작성 | Write | SKILL.md (10개 섹션) | `.claude/skills/frontend/palm-photo-capture-vision/SKILL.md` 생성 |
| 작성 | Write | verification.md | `docs/skills/frontend/palm-photo-capture-vision/verification.md` 생성 |

**총 도구 사용**: WebFetch 11회 / WebSearch 9회 / Read 2회 / Glob 3회 / Grep 1회 / Write 2회

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Claude Vision (Anthropic 공식) | https://platform.claude.com/docs/en/build-with-claude/vision | ⭐⭐⭐ High | 2026-09-10 | 1순위. 포맷·크기·티어·한계·FAQ 전문 |
| Coordinates and bounding boxes (Anthropic 공식) | https://platform.claude.com/docs/en/build-with-claude/vision-coordinates | ⭐⭐⭐ High | 2026-09-10 | 1순위. 리사이즈 규칙 + TS 참조 구현 원문 |
| API overview — Request size limits (Anthropic 공식) | https://platform.claude.com/docs/en/api/overview | ⭐⭐⭐ High | 2026-09-10 | 1순위. 32MB / 413 request_too_large |
| MDN `MediaDevices.getUserMedia()` | https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia | ⭐⭐⭐ High | 2026-09-10 | 웹 표준. 예외 7종·보안 컨텍스트·facingMode |
| MDN `MediaStreamTrack.applyConstraints()` | https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/applyConstraints | ⭐⭐⭐ High | 2026-09-10 | OverconstrainedError·getCapabilities |
| MDN `HTMLCanvasElement.toBlob()` | https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob | ⭐⭐⭐ High | 2026-09-10 | quality 범위·PNG 폴백 |
| MDN `createImageBitmap()` | https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap | ⭐⭐⭐ High | 2026-09-10 | imageOrientation 3값·resize 옵션 |
| MDN `<input type="file">` / `capture` | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file | ⭐⭐⭐ High | 2026-09-10 | capture 값·accept 연동 |
| MDN `Permissions.query()` | https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query | ⭐⭐⭐ High | 2026-09-10 | camera 이름 지원 편차·TypeError reject |
| 법제처 찾기쉬운 생활법령정보 — 민감정보 처리 | https://www.easylaw.go.kr/CSP/CnpClsMain.laf?csmSeq=1257&ccfNo=2&cciNo=3&cnpClsNo=1 | ⭐⭐⭐ High | 2026-09-10 | 공공 법령 해설. 시행령 제18조 원문 |
| Britannica "Palmistry" | https://www.britannica.com/topic/palmistry | ⭐⭐⭐ High | 2026-09-10 | 손금의 과학적 근거 부재 |
| Pech-Pacheco et al., ICPR 2000 (Semantic Scholar) | https://www.semanticscholar.org/paper/e8abff35432e6e963d9b2ae78a5c177dcd256e04 | ⭐⭐⭐ High | 2026-09-10 | variance-of-Laplacian 원저 |
| PyImageSearch "Blur detection with OpenCV" | https://pyimagesearch.com/2015/09/07/blur-detection-with-opencv/ | ⭐⭐ Medium | 2026-09-10 | 임계값 100의 출처. 관례값임을 확인하는 근거 |
| WebKit Blog — MediaRecorder API | https://webkit.org/blog/11353/mediarecorder-api/ | ⭐⭐⭐ High | 2026-09-10 | WebKit 공식. playsinline 사용 예 |
| webrtcHacks — Guide to Safari WebRTC | https://webrtchacks.com/guide-to-safari-webrtc/ | ⭐⭐ Medium | 2026-09-10 | iOS 자동재생·playsinline 규칙 보강 |
| Apple Developer Forums (iOS 18 후면 렌즈 전환) | https://developer.apple.com/forums/thread/776460 | ⭐⭐ Medium | 2026-09-10 | 멀티렌즈 전환 이슈 — "사례 보고" 수준으로만 인용 |
| VeraSafe — GDPR and Photographs | https://verasafe.com/blog/gdpr-and-photographs-understanding-special-categories-of-personal-data/ | ⭐⭐ Medium | 2026-09-10 | 사진의 특별 범주 해당 조건 |
| 개인정보보호위원회 「생체정보 보호 가이드라인」(2021.09) 요약 보도 | https://www.lawtimes.co.kr/news/173106 | ⭐⭐ Medium | 2026-09-10 | 원본정보/특징정보 구분 보강 |

**낮은 신뢰도 소스 배제 내역**: 검색 결과 상위의 미러 사이트(`cld-docs.onlinetool.cc`,
`doc.jarvisuni.com`, `claude.yourdocs.dev` 등)와 서드파티 요약 블로그는 **인용하지 않았다**.
구버전 스펙(이미지당 5MB)이 그대로 남아 있어 오히려 오정보 원인으로 확인됐다.

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 교차 검증한 클레임과 판정

| # | 클레임 | 독립 소스 | 판정 | SKILL.md 반영 |
|---|--------|----------|:----:|--------------|
| 1 | Claude Vision 지원 포맷은 JPEG·PNG·GIF·WebP이며 애니메이션은 첫 프레임만 사용 | Anthropic Vision 본문 + 동일 문서 FAQ | **VERIFIED** | §5-1 표 |
| 2 | 이미지당 최대 크기는 Claude API 직접 호출 시 base64 기준 **10MB**, Bedrock·Google Cloud는 5MB | Anthropic Vision "Request limits" ↔ 구버전 문서·서드파티(5MB만 서술) | **DISPUTED → 해소** | §5-1 표 + `> 주의` 박스로 불일치 명시 |
| 3 | 최대 픽셀 치수는 8000×8000 px | Anthropic Vision + vision-coordinates("8000 px on the longest side") | **VERIFIED** | §5-1 표 |
| 4 | 비주얼 토큰 = `⌈w/28⌉ × ⌈h/28⌉` (28×28 패치) | Anthropic Vision + vision-coordinates 참조 구현 + 독립 WebSearch 결과 | **VERIFIED** | §5-1, §5-2 |
| 5 | 표준 티어 = 긴 변 1568px / 1568 토큰, 고해상도 티어(Claude 4.7 이후) = 2576px / 4784 토큰 | Anthropic Vision 표 + vision-coordinates 본문 + 독립 WebSearch | **VERIFIED** | §5-1, §5-2 |
| 6 | 한도 초과 이미지는 거부가 아니라 **서버에서 자동 축소**되며, 축소는 지연만 늘린다 | Anthropic Vision "Resolution and token cost" + vision-coordinates | **VERIFIED** | §5-2 |
| 7 | `transformations: { oversized_image: "error" }`로 축소 대신 400 에러를 받을 수 있다 | vision-coordinates 전용 섹션 + Vision 문서 상호 링크 | **VERIFIED** | §6-4 |
| 8 | Messages 엔드포인트 요청 전체 크기 한도는 32MB, 초과 시 413 `request_too_large` | API overview 표 + Vision 문서 Note("32 MB for standard endpoints") | **VERIFIED** | §5-1, §6-4 |
| 9 | Claude는 이미지 메타데이터(EXIF)를 파싱·수신하지 않는다 | Anthropic Vision FAQ("Does Claude read image metadata? No") | **VERIFIED** | §5-1, §5-4 |
| 10 | 업로드 이미지는 요청 처리 기간을 넘겨 저장되지 않고 처리 후 자동 삭제되며 학습에 사용되지 않는다 | Anthropic Vision FAQ 2개 항목 | **VERIFIED** | §7-2 |
| 11 | 이미지를 텍스트보다 **먼저** 배치하는 것이 공식 권장 | Anthropic Vision Tip 박스 | **VERIFIED** | §5-1, §6-1 |
| 12 | 다중 이미지 시 `"Image 1:"` 라벨 텍스트 블록을 넣으라는 공식 권장 | Anthropic Vision "Multiple images" | **VERIFIED** | §6-1 |
| 13 | 멀티턴에서 이전 턴 이미지를 재첨부할 필요 없다 | Anthropic Vision "Multiple images" 말미 | **VERIFIED** | §6-1 |
| 14 | Vision 한계: 저품질·회전·200px 미만 이미지에서 환각 가능 / 좌표는 근사 / 개수 세기 부정확 / 인물 식별 거부 / 의료 진단 대체 불가 | Anthropic Vision "Limitations" 전문 | **VERIFIED** | §6-2 표, §7-3 |
| 15 | 손실 압축(JPEG/WebP)은 지연을 줄이지만 아티팩트가 모델 성능에 해로우며 **다중 압축 패스**가 특히 나쁘다 | Anthropic Vision "Image quality guidance" | **VERIFIED** | §5-3 |
| 16 | `getUserMedia`는 보안 컨텍스트 전용이며, 아니면 `navigator.mediaDevices`가 `undefined` | MDN getUserMedia | **VERIFIED** | §2-1 |
| 17 | Permissions Policy 디렉티브는 `camera`(iframe은 `allow="camera"`) | MDN getUserMedia | **VERIFIED** | §2-1 |
| 18 | 예외 7종: NotAllowedError / NotFoundError / NotReadableError / OverconstrainedError / SecurityError / TypeError / AbortError | MDN getUserMedia 예외 표 | **VERIFIED** | §2-3 표 |
| 19 | `facingMode: {exact:'environment'}`는 해당 카메라가 없으면 reject, `ideal`은 대안을 수용 | MDN getUserMedia 제약 예시 | **VERIFIED** | §2-2 |
| 20 | `Permissions.query({name:'camera'})`는 미지원 브라우저에서 `TypeError`로 reject된다 | MDN Permissions/query + 브라우저 지원 편차 서술 | **VERIFIED** | §2-4 (`> 주의` 포함) |
| 21 | `canvas.toBlob()`의 quality가 0~1 밖이면 브라우저 기본값이 쓰이고, 미지원 type이면 PNG로 폴백 | MDN toBlob | **VERIFIED** | §5-3 |
| 22 | `createImageBitmap`의 `imageOrientation` 허용값은 `from-image`(기본)/`flipY`/`none` | MDN createImageBitmap | **VERIFIED** | §5-4 |
| 23 | `<input type="file">`의 `capture` 값은 `user`/`environment`이며 `accept`가 image/video일 때만 의미가 있고, 미지원 시 기본 모드로 폴백 | MDN input/file + MDN capture 속성 문서 | **VERIFIED** | §8 |
| 24 | `capture`는 데스크톱 브라우저에서 사실상 무시되고 일반 파일 선택기로 폴백된다 | MDN + 독립 WebSearch(caniuse 해설) | **VERIFIED** | §8 |
| 25 | iOS에서 `<video>`에 `playsinline`이 없으면 전체화면으로 전환되며, `autoplay muted playsinline` 조합이 필요 | webrtcHacks + WebKit 블로그 예제 코드 | **VERIFIED** | §2-6 |
| 26 | WKWebView는 iOS 14.3부터 `getUserMedia`가 노출되며 호스트 앱의 카메라 usage description·인라인 재생 설정이 필요 | Apple Developer Forums + Twilio 릴리즈 노트(독립 2소스) | **VERIFIED** | §2-6 |
| 27 | iOS의 Chrome·Firefox는 WebKit 제약을 상속한다 | webrtcHacks | **VERIFIED** | §2-6 |
| 28 | iOS 18 계열에서 후면 멀티렌즈가 임의 전환되는 사례가 보고됨 | Apple Developer Forums 1건 | **⚠️ 조건부** | §2-6에 "사례가 보고됨"으로 약하게 표기. 단정하지 않음 |
| 29 | `torch`·`focusMode`·`zoom`은 표준 필수 제약이 아니며 브라우저 지원이 갈린다 | MDN applyConstraints(별도 Image Capture 문서 소관으로 명시) | **VERIFIED** | §2-8 (`> 주의` + try/catch) |
| 30 | variance-of-Laplacian은 Pech-Pacheco et al.(ICPR 2000)의 초점 평가 지표 | Semantic Scholar 원저 + PyImageSearch | **VERIFIED** | §4-2 |
| 31 | 임계값 100은 **관례적 출발값**이지 논문이 규정한 절대 기준이 아니다 | PyImageSearch(임계값은 튜닝 필요 명시) + arXiv 응용 논문(도메인별 재설정) | **VERIFIED** | §4-3 `> 주의`로 명시 + 정규화·캘리브레이션 절차 제시 |
| 32 | 개인정보 보호법 시행령 제18조는 민감정보를 "…특정 개인을 알아볼 목적으로 일정한 기술적 수단을 통해 생성한 정보"로 규정 | 법제처 easylaw.go.kr + 개인정보보호위 가이드라인 해설(독립 2소스) | **VERIFIED** | §7-1 표 |
| 33 | 생체인식정보 중 '생체인식 특징정보'가 민감정보에 해당한다 | 개인정보보호위 「생체정보 보호 가이드라인」 해설 2건 | **VERIFIED** | §7-1 표 |
| 34 | GDPR Art.4(14)의 생체 데이터 예시에 palm print가 거론되며, "고유 식별을 허용·확인하는 특정 기술적 처리"라는 조건이 붙는다 | GDPR 정의 인용 소스 2건 | **VERIFIED** | §7-1 표 + 결론 문단 |
| 35 | 손금은 예지적 예측 의미에 대한 과학적 근거가 없다 | Britannica + Wikipedia(의사과학 분류) | **VERIFIED** | §7-3 |
| 36 | base64는 원본 대비 약 4/3(≈1.37배)로 커진다 | 표준 Base64 인코딩 정의(RFC 4648) — 산술적 사실 | **VERIFIED** | §5-5 |
| 37 | 3:4 세로 기준 목표 크기 952×1269(표준) / 1648×2197(고해상도) | 공식 참조 구현으로 계산 + 공식 예시(2000×1500 → 1269×952, 1564토큰)와 전치 일치 | **⚠️ 조건부** | §5-2에 "참조 구현으로 계산", "제품 반영 전 실제 종횡비로 재계산" 명시 |

**판정 집계**: VERIFIED 34 / DISPUTED(해소) 1 / 조건부 표기 2 / UNVERIFIED 0

**DISPUTED 처리 상세 (클레임 #2)**
- 불일치: 구 `docs.claude.com` 미러와 다수 서드파티 글이 "이미지당 5MB"만 서술.
- 확인: 현행 공식 문서는 "10 MB (base64-encoded) when using the Claude API directly" / "5 MB
  (base64-encoded) on Amazon Bedrock and Google Cloud" / "10 MB on claude.ai"로 **플랫폼별 분기**.
- 반영: SKILL.md §5-1 표에 두 값을 모두 기재하고, 바로 아래 `> 주의` 박스에 "구버전 문서와의
  불일치"를 명시. 더불어 실무 목표(압축 후 1MB 미만)를 제시해 어느 한도든 안전하도록 설계.

**조건부 표기 상세 (클레임 #28, #37)**
- #28: Apple Developer Forums 단일 스레드 근거 → 공식 문서 확인 불가. SKILL.md에서 "사례가
  보고됨"으로만 서술하고 대응책(getSettings 확인·거리 안내)만 제시. 단정 서술 회피.
- #37: 공식 참조 구현을 그대로 옮겨 계산한 값이나 **실행 검증은 하지 않았다**. SKILL.md에서
  "위 표의 값은 참조 구현으로 계산한 것이므로 제품에 박아 넣기 전에 실제 캡처 종횡비로
  `resizedSize()`를 한 번 돌려 확인한다"고 명시.

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (37개 클레임 개별 대조)
- [✅] 버전·기준 정보 명시 (Vision 스펙 표에 "2026-09-10 확인", 티어별 모델 세대 명시)
- [✅] deprecated된 패턴을 권장하지 않음 (구 ImageCapture 전용 API 대신 표준 canvas 경로 사용, 구 5MB 한도 단독 서술 회피)
- [✅] 코드 예시가 실행 가능한 형태임 (TypeScript/React, import 대상·타입 명시, 공식 참조 구현 원문 인용)
- [✅] 현행 모델 ID 사용 (`claude-sonnet-5`, `claude-haiku-4-5`) — 구세대 ID 하드코딩 없음

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (`name`, `user-invocable: false`, `description` + `<example>` 3개)
- [✅] 소스 URL과 검증일 명시 (11개 소스 + 검증일 2026-09-10)
- [✅] 핵심 개념 설명 포함 (§1 파이프라인 다이어그램 + §2~§8)
- [✅] 코드 예시 포함 (getUserMedia·에러 분류·품질 검증·resizedSize·캡처·base64·게이트·폴백)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (§0, ❌ 항목에 설계 중단 사유 포함)
- [✅] 흔한 실수 패턴 포함 (§9, 18항목 — 각 항목에 해결 섹션 링크)
- [✅] 릴리즈 체크리스트 포함 (§10, 4개 그룹 20항목)
- [✅] 짝 스킬 상호 참조 및 경계 명시 (중복 서술 회피, 미존재 시 대응 명시)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (복붙 가능한 함수 단위 제공)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (에러→사용자 문구 매핑표, 거부 문구 매핑표)
- [✅] 범용적으로 사용 가능 (특정 프로젝트·로컬 경로 종속 없음. 손 외 피사체에도 §1~§5 재사용 가능함을 §0에 명시)
- [✅] 안티패턴이 "왜 나쁜지 + 어떻게 고치는지" 쌍으로 제시됨
- [✅] 과장 방지가 프롬프트·카피·UI 세 층에서 강제됨 (§6-2 시스템 프롬프트, §7-3 금지 표현 표, §10 체크리스트)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-10, general-purpose 3건)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS, 근거 섹션 명시)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (해당 없음 — 전건 PASS로 보완 불필요)

> skill-tester가 별도 세션에서 verification-policy.md 3·4단계(content test + verification.md
> 업데이트)를 수행했다. 아래 섹션 5·6·7·8 참조.

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-10
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 대체 사용, 프론트엔드 웹 API +
Claude Vision 통합 패턴 스킬이라 general-purpose로 충분하다고 판단)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 후면 카메라 constraints 설정 + 권한 거부 처리 + 요청 시점**
- ✅ PASS
- 근거: SKILL.md "§2-2 후면 카메라 지정", "§2-3 에러 매핑", "§2-5 맥락적 권한 요청 UX" 섹션
- 상세: `facingMode: { ideal: 'environment' }` 사용(anti-pattern인 `exact` 미사용)을 정확히
  제시했고, `err.name` 7종 분기표와 "거부 후 재요청해도 프롬프트가 다시 뜨지 않는다"는 §2-3
  핵심 주의사항을 근거로 설정 안내+파일 폴백 병행을 정확히 답변. 권한 요청은 "사용자 제스처
  직후"로 §2-5 다이어그램을 그대로 인용.

**Q2. Vision 전송 전 리사이즈·압축, toBlob quality 값, 티어별 목표 크기**
- ✅ PASS
- 근거: SKILL.md "§5-2 목표 크기", "§5-3 캡처→리사이즈→압축" 섹션
- 상세: `resizedSize()` 참조 구현 사용을 정확히 인용했고, quality는 **0.9**(0~1 스케일)라고
  명확히 답변하며 anti-pattern인 `90`(0~100 스케일 착각, §9 실수 #7)을 스스로 경고했다. 표준
  티어(952×1269)/고해상도 티어(1648×2197) 구분과 "게이트·해석 호출별로 다른 티어 크기를 각각
  캐시" 실무 규칙까지 정확히 재현. §5-2가 명시한 "예시값이지 고정 스펙 아님" 단서도 놓치지 않음.

**Q3. 손 아닌 이미지 거부 흐름 설계 + 결과 화면 금지 표현**
- ✅ PASS
- 근거: SKILL.md "§6-3 손이 아닌 이미지 거부 — 2단 게이트", "§7-3 금지되는 마케팅·UI 표현" 섹션
- 상세: 게이트(저비용 모델)와 해석 호출을 분리해야 하는 이유, `isPalm` JSON 스키마, zod 등
  스키마 검증 필요성, 원인별 거부 문구 매핑표를 정확히 인용. §7-3 금지 표현 5종("정밀 분석",
  "정확도 95%", 수명·질병 언급, 건강 진단, 가짜 진행 표시)을 표 그대로 재현하고 대체 문구까지
  제시.

### 발견된 gap

- 없음 (3/3 PASS, 명확한 anti-pattern 회피 확인). 에이전트가 스스로 짚은 두 가지는 SKILL.md가
  이미 자기 한정(self-scoping)으로 명시한 내용이며 보강이 필요한 gap이 아님:
  1. §6-3 게이트 프롬프트의 "애매하면 isPalm=false" 임계 기준은 실제 구현 시 프롬프트 튜닝이
     추가로 필요할 수 있음 — 이는 스킬의 정보 부족이 아니라 모델 호출 특성상 불가피한 실무 튜닝.
  2. §5-2 목표 크기 표는 스스로 "참조 구현으로 계산한 예시값, 제품 반영 전 재계산 필요"라고
     명시하고 있어 오독 소지가 낮음.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 카테고리(마이그레이션 가이드 / 빌드 설정 스킬 / 워크플로우
  스킬) **해당 없음**. 본 스킬은 웹 API(getUserMedia/canvas) + Claude Vision 통합의 *API 패턴
  스킬*로, "사용 시점의 답변 정확성만으로 검증 가능"한 유형에 해당 → content test PASS로
  APPROVED 전환 가능
- 최종 상태: **APPROVED**

> 최초 verification.md(skill-creator 작성)는 "resizedSize() 계산값의 실제 API 토큰 대조"와
> "iOS Safari 실기기 확인"을 이유로 PENDING_TEST 유지를 제안했으나, 이 둘은 스킬의 *핵심 콘텐츠
> 정확성*이 아니라 *제품별 실사용 확인 단계*에 해당하는 후속 검증 항목이다. verification-policy.md의
> 실사용 필수 카테고리(마이그레이션/빌드설정/워크플로우)에 해당하지 않으므로 차단 사유로 보지 않고,
> §7에 비차단 선택 보강 항목으로 유지한다.

### (최초 계획 — 참고용, skill-creator 작성)

기존 "제안 질문" 표는 아래에 참고용으로 보존한다. 실제 수행한 질문(Q1~Q3)은 이 중 Q1·Q2·Q3와
동일한 취지이며, Q4~Q6은 이번 라운드에서 다루지 않았다(향후 재검증 시 활용 가능).

| # | 질문 | 기대되는 답변 경로 (SKILL.md 근거) |
|---|------|--------------------------------|
| Q1 | "손금 앱에서 후면 카메라를 강제로 지정하려면 `facingMode: {exact:'environment'}`를 쓰면 되나?" | §2-2 — `exact`는 후면 카메라 없는 기기에서 `OverconstrainedError`로 기능 전멸. `ideal` 사용 + 폴백 3단 흐름 |
| Q2 | "촬영한 손 사진을 Claude Sonnet 5에 보내기 전에 몇 픽셀로 줄여야 하나?" | §5-2 — 고해상도 티어(2576px/4784토큰), 3:4 기준 약 1648×2197, `resizedSize()` 참조 구현으로 계산. 파이프라인에 표준 티어 모델이 섞이면 그 호출은 952×1269 |
| Q3 | "사용자가 풍경 사진을 올렸을 때 거부하려면?" | §6-3 — 저비용 모델 2단 게이트로 JSON 판정, `isPalm === false`면 해석 호출 자체를 하지 않음, 원인별 문구 매핑 |
| Q4 | "손 사진은 생체정보라 민감정보 동의를 따로 받아야 하나?" | §7-1 — 시행령 제18조의 "특정 개인을 알아볼 목적" 요건. 식별 목적이 아니면 통상 민감정보 아님. 단 식별 목적으로 바뀌면 민감정보. 법무 검토 권고 |
| Q5 | "결과 화면에 'AI가 손금선을 정밀 분석합니다'라고 써도 되나?" | §7-3 — 금지 표현. Vision 한계(§6-2)와 손금의 과학적 근거 부재(Britannica) 이중 고지 필요 |
| Q6 | "갤러리에서 고른 사진이 90도 돌아가서 전송된다" | §5-4 — EXIF Orientation. Claude는 메타데이터를 받지 않으므로 `createImageBitmap(file, {imageOrientation:'from-image'})`로 세워서 인코딩 |

각 질문에 대해 **근거 섹션을 명시하는지**와 **§9의 안티패턴을 회피하는지**를 판정 기준으로 삼는다.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (37개 클레임 교차 검증, DISPUTED 1건 해소·명시) |
| 구조 완전성 | ✅ (frontmatter·소스·검증일·코드·사용 기준·안티패턴·체크리스트 전부 포함) |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-09-10, general-purpose 3건 — 3/3 PASS) |
| **최종 판정** | **APPROVED** |

**APPROVED 전환 근거 (verification-policy.md 기준)**

본 스킬은 *실사용 필수 카테고리*(마이그레이션 가이드 / 빌드 설정 스킬 / 워크플로우 스킬)에
해당하지 않는다 — getUserMedia·canvas·Claude Vision 통합의 *API 패턴 스킬*이며, "사용 시점의
답변 정확성만으로 검증 가능한" 유형(라이브러리 사용법·API 패턴 스킬 예시와 동일 범주)이다.
2026-09-10 content test 3/3 PASS로 이 기준을 충족해 APPROVED로 전환한다.

최초 verification.md가 제시했던 아래 2건은 *실사용 필수 카테고리 해당 근거*가 아니라 제품
적용 단계의 선택적 실측 확인이므로 차단 사유로 보지 않는다(§7에 비차단 항목으로 유지):

1. `resizedSize()` 계산값이 실제 API가 보는 크기와 일치하는지 — 실제 요청·응답 토큰 수로 재확인 권장
2. iOS Safari 실기기에서의 프리뷰·권한·EXIF 동작 — 실기기 확인 권장

---

## 7. 개선 필요 사항

- [✅] **skill-tester로 agent content test 수행** (2026-09-10 완료, Q1~Q3 실제 수행 · 3/3 PASS. Q4~Q6은 §5 참고용 표에 후속 재검증용으로 보존)
- [❌] `resizedSize()` 계산값(952×1269 / 1648×2197)을 실제 API 응답의 `usage.input_tokens`와 대조해 검증 — **선택 보강** (차단 요인 아님. 실제 프로젝트에 적용 시 1회 확인 권장)
- [❌] iOS Safari 실기기(최신 + iOS 16 이하 1종)에서 §10 "기능" 체크리스트 실행 — **선택 보강** (차단 요인 아님. 실기기 배포 전 확인 권장)
- [❌] 라플라시안 임계값 100의 기기별 캘리브레이션 결과를 확보해 §4-3에 실측 범위 추가 — **선택 보강** (SKILL.md가 이미 "출발점" 한계를 명시했으므로 즉시 수정 필요는 없음)
- [✅] 2026-09-11 짝 스킬 참조 정리 — 고지 문구·손금 한계 서술 참조를 `humanities/palmistry-limitations`로 단일화(운세 콘텐츠 윤리 스킬은 삭제됨). §7-3 자체 고지 원칙은 그대로 유지
- [❌] `structured outputs` 공식 스펙(스키마 필드 문법)을 별도 확인해 §6-3의 게이트 예시를 스키마 강제 버전으로 승격 — **선택 보강**
- [❌] README.md / docs/skills/README.md 스킬 목록·업데이트 로그 동기화 — **차단 요인** (readme-update.md 규칙상 스킬 추가 시 필수. 별도 배치에서 반드시 수행)
- [❌] iOS 후면 멀티렌즈 전환 이슈(클레임 #28)의 공식 근거 확보 후 §2-6 서술 강도 조정 — **선택 보강**

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-09-10 | v1 | 최초 작성. creation-workflow 1~4단계 수행(조사 WebFetch 11 / 교차 검증 WebSearch 9). 클레임 37건 검증(VERIFIED 34 / DISPUTED-해소 1 / 조건부 2). SKILL.md 10개 섹션 생성. 5단계(skill-tester)·6단계(README)는 지시에 따라 미수행 | skill-creator |
| 2026-09-10 | v1 | 2단계 실사용 테스트 수행 (Q1 후면 카메라 constraints+권한 거부 처리 / Q2 리사이즈·압축·quality 값 / Q3 손 아님 거부 게이트+금지 카피) → 3/3 PASS, PENDING_TEST → APPROVED 전환. README 동기화는 여전히 미수행(별도 배치 필요) | skill-tester |
| 2026-09-11 | v1.1 | 캐주얼 앱 방향 정리 — 삭제된 운세 콘텐츠 윤리 스킬 참조 2곳(짝 스킬 안내·§7 카피 규칙)을 `humanities/palmistry-limitations` 단일 참조로 정리. 촬영·비전 파이프라인 본문 변동 없음 | main session |
