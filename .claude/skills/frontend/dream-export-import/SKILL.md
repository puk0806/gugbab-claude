---
name: dream-export-import
description: >
  꿈 일기 데이터의 export·import 설계 — 사용자 데이터 이동권(GDPR Art.20·한국 개인정보 전송요구권)을 클라이언트 측에서 보장하는 PWA 구현 패턴.
  JSON/CSV/암호화 ZIP 포맷, Zod 스키마 검증, Dexie 마이그레이션 호환, 대용량 스트리밍, libsodium·age 기반 비밀번호 암호화, File System Access API + 폴백,
  Service Worker Background Sync 백업 옵션, 무결성 체크섬, 디바이스 변경 시 onboarding-import UX, 흔한 함정을 다룬다.
  <example>사용자: "꿈 일기 앱에서 사용자 데이터를 JSON으로 export하고 다른 기기에서 import하는 기능 만들어줘"</example>
  <example>사용자: "export 파일에 사용자 비밀번호 기반 암호화를 걸고 싶은데 어떤 라이브러리가 좋아?"</example>
  <example>사용자: "꿈 1만 건이 넘는 사용자가 import할 때 메모리 부족이 안 나도록 처리하는 방법"</example>
---

# 꿈 일기 Export · Import 설계

> 소스: 본문 하단 참조 (MDN / age-encryption.org / libsodium / Dexie / Zod / EU GDPR / 한국 개인정보보호법)
> 검증일: 2026-05-15

PWA 꿈 일기 앱에서 사용자가 자기 데이터를 *가져가고 되돌릴 수* 있게 만드는 설계 패턴이다.
서버 비의존 (오프라인 우선)·법적 권리 (데이터 이동권) 보장·재이용성 (다른 기기·다른 앱)을 모두 충족하도록 한다.

---

## 1. 왜 필요한가 — 데이터 이동권

| 법 | 조항 | 핵심 |
|----|------|------|
| EU GDPR | Art.20 | 정보주체는 본인이 제공한 개인정보를 *구조화·통용·기계 판독 가능 포맷*으로 받을 권리 |
| 한국 개인정보보호법 | 제35조의2 (개인정보 전송요구권) | 2023-03-14 개정으로 신설. 단계적 시행 (시행일 분야별 별도 지정) |

> **공식 권장 포맷:** CSV, XML, JSON (모두 텍스트·오픈 포맷). PDF 스캔본은 비-기계판독으로 부적합하다.

꿈 일기는 *민감정보*(심리·정신 건강 추정 단서 포함)에 가깝다. 한국 개인정보보호법 시행령은 사상·신념·건강 등을 민감정보로 분류하므로, export는 *암호화 옵션 기본*이 안전하다.

---

## 2. Export 포맷 3종 — 용도별 선택

| 포맷 | 용도 | 권장 라이브러리 | 비고 |
|------|------|----------------|------|
| **JSON** (기본) | 다른 기기에서 재import·앱 간 이동 | 표준 `JSON.stringify` | 풀 스키마 보존, 가장 정합적 |
| **CSV** | 외부 분석(Excel·R·Python) | `papaparse` | 중첩 필드 평탄화 필요 (Symbol·Tag 별도 시트) |
| **암호화 ZIP** | 백업·클라우드 업로드 | `@zip.js/zip.js` v2.8.26+ | AES-256 지원. **JSZip은 암호화 미지원** |

### 2-1. 포맷별 트레이드오프

- JSON 단일 파일은 첨부(이미지·오디오) 없이 텍스트만일 때만 적합.
- 첨부가 있으면 ZIP이 사실상 유일한 선택지 (Blob을 base64로 JSON에 inline 시 33% 용량 증가 + 메모리 폭발).
- CSV는 *손실 변환*이다. import 시 원본 복구가 불가능할 수 있음을 사용자에게 명시한다.

---

## 3. JSON 스키마 — 4엔티티 + 메타

```json
{
  "$schema": "https://example.com/dream-journal/v1.json",
  "meta": {
    "schemaVersion": 1,
    "appVersion": "1.4.2",
    "exportedAt": "2026-05-15T03:14:00.000Z",
    "exportedBy": "device:ios-pwa",
    "checksum": "sha256-..."
  },
  "dreams": [
    { "id": "uuid", "createdAt": "...", "content": "...", "lucidity": 3, "tags": ["t1"], "symbols": ["s1"], "interpretationId": "i1" }
  ],
  "interpretations": [{ "id": "i1", "dreamId": "uuid", "method": "jung", "text": "..." }],
  "symbols": [{ "id": "s1", "name": "물", "category": "원형" }],
  "tags": [{ "id": "t1", "name": "악몽" }]
}
```

### 3-1. 필수 메타 필드

- `schemaVersion`: 정수. 마이그레이션 분기 기준. **Dexie의 `db.version()`과 일치시키는 것이 가장 안전**하다.
- `appVersion`: 디버깅용. 사용자 지원 문의 시 어느 빌드인지 식별.
- `exportedAt`: ISO 8601 UTC. 백업 시점 비교용.
- `checksum`: `dreams + interpretations + symbols + tags` 직렬화 결과의 SHA-256. 무결성 검증 (단순 변조·전송 깨짐 감지). 비밀 보호 목적이 아닌 *손상 감지* 용도임을 명확히 한다.

---

## 4. Import 처리 — 스키마 버전 호환·중복 처리·검증

### 4-1. Zod로 import 페이로드 검증

```ts
import { z } from "zod"; // Zod v4 기본 (v3 호환은 "zod/v3")

const DreamSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  content: z.string().min(1).max(50_000),
  lucidity: z.number().int().min(0).max(5),
  tags: z.array(z.string()),
  symbols: z.array(z.string()),
  interpretationId: z.string().uuid().nullable(),
});

const ExportSchema = z.object({
  meta: z.object({
    schemaVersion: z.number().int(),
    appVersion: z.string(),
    exportedAt: z.string().datetime(),
    checksum: z.string().optional(),
  }),
  dreams: z.array(DreamSchema),
  interpretations: z.array(/* ... */),
  symbols: z.array(/* ... */),
  tags: z.array(/* ... */),
});

const result = ExportSchema.safeParse(parsed);
if (!result.success) {
  // result.error.issues로 사용자에게 어느 필드가 잘못됐는지 안내
}
```

### 4-2. 스키마 버전 호환성

| 시나리오 | 처리 |
|---------|------|
| `import.schemaVersion === db.currentVersion` | 그대로 import |
| `import.schemaVersion < db.currentVersion` | **마이그레이션 함수 체인 실행** (v1→v2→v3...) |
| `import.schemaVersion > db.currentVersion` | 거부 + "앱 업데이트 필요" 안내 |

Dexie의 `db.version(N).upgrade(tx => ...)`는 *DB 자체*의 버전 업그레이드용이다. *import 페이로드*의 버전 변환은 별도 함수로 작성한다.

```ts
const migrations: Record<number, (p: ExportV1 | ExportV2) => ExportV3> = {
  1: (p) => ({ ...p, dreams: p.dreams.map(d => ({ ...d, lucidity: 0 })) }), // v1→v2: lucidity 신설
  2: (p) => ({ ...p, dreams: p.dreams.map(d => ({ ...d, symbols: [] })) }), // v2→v3: symbols 분리
};
```

### 4-3. 중복 처리 정책 — 사용자에게 선택지 제공

| 정책 | 동작 | 적합한 경우 |
|------|------|------------|
| `skip` | 기존 ID 존재 시 import 항목 무시 | 부분 백업 복구 |
| `replace` | 기존 ID 항목을 import 데이터로 덮어쓰기 | 다른 기기에서 *최신본*을 가져올 때 |
| `merge` | 필드별 `updatedAt` 비교해 최신 값 채택 | 두 기기 양방향 동기화 (충돌 해결) |

**기본값은 `skip` 권장.** `replace`·`merge`는 사용자에게 명시적 확인을 받는다 (데이터 손실 가능).

---

## 5. 대용량 처리 — 스트리밍·청크·진행률

꿈 1만 건 + 이미지 첨부 시 export 파일이 수백 MB가 될 수 있다. 통째로 `JSON.parse`하면 메인 스레드 블로킹·OOM 위험.

### 5-1. 스트리밍 JSON 파싱 옵션

| 라이브러리 | 특징 | 비고 |
|-----------|------|------|
| `oboe.js` | DOM·SAX 절충, 경로 기반 콜백 | 활발한 유지보수는 아님. 사이트에 deprecation notice 예정이라 명시되어 있어 신규 채택 시 대안 검토 |
| `stream-json` | Node-first지만 브라우저 폴리필 가능 | 깔끔한 pipeline API |
| `@streamparser/json` | 브라우저 ESM 친화, 가벼움 | 비교적 신규, 유지보수 활발 |

> **주의:** oboe.js는 안정적이지만 공식 사이트에서 deprecation notice를 예고했다. 신규 코드라면 `@streamparser/json` 등 활발히 유지보수되는 대안을 우선 검토한다.

### 5-2. 청크 import 패턴 (Dexie `bulkPut`)

```ts
const CHUNK = 500;
for (let i = 0; i < dreams.length; i += CHUNK) {
  const slice = dreams.slice(i, i + CHUNK);
  await db.transaction("rw", db.dreams, async () => {
    await db.dreams.bulkPut(slice); // bulkPut은 단일 트랜잭션·단일 indexedDB 호출로 빠름
  });
  postProgress({ done: i + slice.length, total: dreams.length });
}
```

진행률은 `BroadcastChannel` 또는 React 상태로 UI에 흘려보낸다. 100ms 이하 간격은 사용자가 못 알아채니 throttle 200~500ms.

---

## 6. 암호화 Export — 비밀번호 기반

### 6-1. 옵션 비교

| 라이브러리 | KDF | 패스프레이즈 지원 | 비고 |
|-----------|-----|-----------------|------|
| **libsodium-wrappers** | Argon2id (기본, 1.0.15+) | `crypto_pwhash` → `crypto_secretbox_easy` | OWASP 2026 권장: m=19 MiB·t=2·p=1 |
| **age (typage v0.3.0+)** | scrypt | `setScryptWorkFactor()` | passkey/WebAuthn까지 지원, 2025-12-29 릴리즈 |
| **Web Crypto API (SubtleCrypto)** | PBKDF2 → AES-GCM | 직접 구현 | 외부 의존 0, 단 잘못 쓰면 안전성 무너짐 |
| **@zip.js/zip.js** | ZIP AES-256 | ZIP 표준 암호화 | 첨부와 함께 묶을 때 유일한 자연스러운 선택 |

### 6-2. 권장 조합

- 첨부 없음 / 텍스트만 → **age (typage)** 또는 **libsodium**. age가 키 관리·armor 인코딩까지 정해줘서 미스 가능성이 낮다.
- 첨부 포함 → **@zip.js/zip.js** AES-256. JSZip은 *암호화 미지원*이므로 사용 금지.
- 외부 의존을 최소화하고 직접 컨트롤 → **Web Crypto API PBKDF2 + AES-GCM**. 단 IV·salt·iteration·인증 태그까지 직접 챙겨야 한다.

### 6-3. libsodium 패스프레이즈 암호화 예시

```ts
import sodium from "libsodium-wrappers";
await sodium.ready;

async function encryptExport(jsonText: string, password: string) {
  const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
  const key = sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    password,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_MODERATE, // = 3
    sodium.crypto_pwhash_MEMLIMIT_MODERATE, // = 256 MiB
    sodium.crypto_pwhash_ALG_ARGON2ID13
  );
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const cipher = sodium.crypto_secretbox_easy(jsonText, nonce, key);
  // 파일 포맷: salt(16) || nonce(24) || cipher
  return new Blob([salt, nonce, cipher], { type: "application/octet-stream" });
}
```

> **주의:** `MEMLIMIT_MODERATE`는 256 MiB로 모바일에서 부담스러울 수 있다. 저사양 환경 대상이면 `OPSLIMIT_INTERACTIVE` + `MEMLIMIT_INTERACTIVE`로 낮추되, OWASP 2026 baseline(m=19 MiB·t=2)보다 약하지 않게 유지한다.

---

## 7. 이미지·오디오 첨부 처리

| 방식 | 장점 | 단점 |
|------|------|------|
| **ZIP에 Blob 포함** | 용량 효율적, 원본 포맷 보존 | ZIP 라이브러리 필요 |
| **JSON에 base64 inline** | 단일 파일, 단순 | 용량 +33%, 큰 첨부 시 메모리 폭발, JSON.parse 시 전체 로드 |

**규칙**: 첨부 총합 1 MB 미만이면 base64 inline 허용, 그 이상은 무조건 ZIP. JSON 본체는 `attachments` 필드에 *파일 경로 참조*만 두고 실제 바이너리는 ZIP 내부 `attachments/{id}.{ext}`에 저장한다.

```json
{ "id": "uuid", "attachments": [{ "type": "image", "path": "attachments/uuid-1.jpg", "sha256": "..." }] }
```

---

## 8. 파일 시스템 접근 — Chromium + 폴백

### 8-1. File System Access API (Chromium 86+)

- 지원: Chrome 86+, Edge 86+, Opera 72+ (데스크탑)
- **Firefox/Safari 미지원** (현재까지도 OPFS만 지원, 로컬 디스크 피커는 보안상 채택 거부)
- HTTPS 또는 `http://localhost`에서만 동작 (secure context)
- 사용자 제스처 (transient activation) 필요

```ts
async function saveExport(blob: Blob, suggestedName: string) {
  if ("showSaveFilePicker" in window) {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [{ description: "Dream Journal Export", accept: { "application/json": [".json"] } }],
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  } else {
    // 폴백: <a href={URL.createObjectURL(blob)} download={suggestedName} />
    triggerAnchorDownload(blob, suggestedName);
  }
}
```

### 8-2. Import도 동일한 분기

```ts
async function pickImport(): Promise<File> {
  if ("showOpenFilePicker" in window) {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: "Dream Journal Export", accept: { "application/json": [".json"], "application/zip": [".zip"] } }],
    });
    return handle.getFile();
  }
  return openHiddenInputFile(); // <input type="file"> 폴백
}
```

---

## 9. Service Worker Background Sync — 클라우드 백업 옵션

Background Synchronization API는 *Baseline이 아니며* (제한적 지원), Safari는 미지원이다. *옵션 기능*으로만 사용하고 핵심 흐름은 다른 경로로 보장한다.

```ts
// 메인 스레드
async function scheduleCloudBackup() {
  const reg = await navigator.serviceWorker.ready;
  if ("sync" in reg) {
    try { await (reg as any).sync.register("dream-cloud-backup"); }
    catch { /* 폴백: 다음 앱 열기 시점에 동기 시도 */ }
  }
}

// service-worker.ts
self.addEventListener("sync", (event: any) => {
  if (event.tag === "dream-cloud-backup") {
    event.waitUntil(uploadEncryptedExportToCloud());
  }
});
```

> **주의:** Google Drive·iCloud Drive는 *사용자가 다운로드 폴더를 가리키는 방식*이 가장 안정적이다. OAuth로 직접 업로드하면 토큰 관리·권한 범위·revocation 이슈가 크게 늘어난다. *클라이언트 측 PWA*라면 사용자가 직접 클라우드 폴더에 저장하도록 안내하는 쪽이 단순하다.

---

## 10. 무결성 — checksum vs 서명

| 목적 | 방법 |
|------|------|
| 단순 손상·전송 깨짐 감지 | SHA-256 checksum을 `meta.checksum`에 저장. import 시 재계산해 비교 |
| 변조 방지 (위·변조 시도 차단) | Ed25519 서명 (libsodium `crypto_sign_detached`). 키 관리 책임 발생 |
| 비밀 보호 | 암호화 (앞의 6장). checksum은 비밀 보호에 *기여하지 않는다* |

**개인 사용 PWA**에서는 checksum만으로 충분하다. 서명·검증은 다중 사용자 협업·계정 연동 시점에 도입한다.

---

## 11. 디바이스 변경 시 UX — Onboarding Import

신규 설치 시 첫 화면에서 *기존 사용자입니까?* 분기를 제공한다.

```
[새로 시작] / [기존 데이터 가져오기]
                 ↓
       파일 선택 (File System Access 또는 <input>)
                 ↓
       암호화 여부 자동 감지 (magic byte / 헤더)
                 ↓
       암호화면 비밀번호 입력
                 ↓
       schemaVersion 검사 → 필요 시 마이그레이션
                 ↓
       Zod 검증 → 중복 정책 선택 → 청크 import + 진행률
                 ↓
       완료 화면 (가져온 건수·실패 건수·소요 시간)
```

실패 항목은 *별도 저장*하고 사용자에게 "X건은 다음과 같은 이유로 가져오지 못했습니다" 화면을 보여준다. 부분 성공도 성공이다.

---

## 12. 흔한 함정

| 함정 | 증상 | 대응 |
|------|------|------|
| 스키마 변경 시 import 마이그레이션 누락 | 신규 필드가 `undefined`로 박힘 | export·import 양쪽에 `schemaVersion` 강제 검증, 마이그레이션 함수 누락 시 빌드 실패하도록 타입 강제 |
| Blob을 base64로 JSON inline → 메모리 폭발 | 큰 파일 import 시 탭 크래시 | 1 MB 임계로 분리, 그 이상은 ZIP 강제 |
| 중복 ID 처리 미정의 | 같은 꿈이 2개 나타남 | 기본 `skip`·UI에서 명시 정책 선택 |
| 미커밋 트랜잭션 | 일부만 import되고 멈춤 | Dexie `transaction("rw", ...)` 블록으로 묶고, 청크 단위로 트랜잭션 분리 |
| JSZip로 암호화 시도 | 라이브러리 차원에서 미지원 | `@zip.js/zip.js` 또는 libsodium 사용 |
| `JSON.parse` 전체 로드 | OOM·메인 스레드 블로킹 | 스트리밍 파서 + 청크 처리 |
| KDF 약하게 설정 | 비밀번호 빠른 brute force 가능 | OWASP 2026 Argon2id baseline (m=19 MiB·t=2·p=1) 이상 유지 |
| 첨부 sha256 누락 | ZIP 풀었을 때 깨진 파일 못 알아챔 | 첨부마다 `sha256` 필드 필수 |
| Firefox·Safari에서 `showSaveFilePicker` 미지원 가정 누락 | 다운로드 실패 | 항상 `<a download>` 폴백 동시 구현 |
| Background Sync를 핵심 흐름에 의존 | iOS·Safari 사용자에게서 백업 안 됨 | *옵션* 기능으로만 사용, 메인 흐름은 사용자 능동 export로 보장 |

---

## 13. 짝 스킬 — 함께 보면 좋은 것

- `architecture/dream-journal-data-modeling` — Dexie 스키마 설계와 직접 매칭
- `humanities/dream-content-privacy-ethics` — 데이터 이동권의 법·윤리 근거

---

## 14. 소스

| 분류 | URL |
|------|-----|
| File System Access API (`showSaveFilePicker`) | https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker |
| File System Access API (`showOpenFilePicker`) | https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker |
| Background Synchronization API | https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API |
| Web Crypto API (SubtleCrypto) | https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API |
| libsodium password hashing | https://libsodium.gitbook.io/doc/password_hashing/default_phf |
| age 공식 (FiloSottile/age) | https://github.com/FiloSottile/age |
| typage (TypeScript age 구현) | https://github.com/FiloSottile/typage |
| zip.js (gildas-lormeau) | https://github.com/gildas-lormeau/zip.js |
| JSZip limitations (암호화 미지원) | https://stuk.github.io/jszip/documentation/limitations.html |
| Zod | https://zod.dev/ |
| Dexie version & upgrade | https://dexie.org/docs/Dexie/Dexie.version() |
| oboe.js | https://oboejs.com/ |
| GDPR Art.20 (데이터 이동권) | https://gdpr-info.eu/art-20-gdpr/ |
| 한국 개인정보 보호법 (국가법령정보센터) | https://www.law.go.kr/LSW/lsInfoP.do?lsId=011357 |
