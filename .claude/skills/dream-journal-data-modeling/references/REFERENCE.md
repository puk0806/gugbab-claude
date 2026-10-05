## 5. 이미지·오디오 첨부

### 5.1 Blob 직접 저장 vs Cache API vs 외부 스토리지

IndexedDB는 *값으로* Blob/File을 저장할 수 있다 (인덱스 키로는 불가).

| 방식 | 장점 | 단점 | 적합 |
|------|------|------|------|
| **IndexedDB Blob 필드** | DB와 함께 원자적 트랜잭션, 백업 단일화 | 큰 Blob은 쿼리·복사 시 메모리 부담, 동기화 페이로드 폭발 | 작은 이미지(<500KB), 음성 메모 5초 |
| **별도 IndexedDB store** | 메타 테이블과 분리, 필요 시만 fetch | 코드 분기 늘어남 | 중간 크기 첨부, 동기화 시 별도 처리 |
| **Cache API** | Service Worker가 HTTP 응답처럼 캐시, 큰 파일 적합 | URL 키 관리, 트랜잭션 X | 미디어 파일 다수 |
| **OPFS(Origin Private File System)** | 진짜 파일 시스템 API, 대용량 효율 | 비교적 신규(Safari 15.2+), Dexie와 별도 관리 | 큰 미디어, 동영상 |
| **외부 스토리지** (S3 등) | 디바이스 용량 절약, 공유 용이 | 네트워크 의존, 비용, 민감 정보 노출 위험 | 동기화 활성화 시 |

> **권장 규칙**: 단일 첨부 ≤ 1MB까지는 IndexedDB 직접. 그 이상은 별도 store 또는 Cache API. 동기화하려면 외부 스토리지 + presigned URL 패턴.
> 소스: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology

### 5.2 별도 테이블 패턴

```typescript
interface DreamAttachment {
  id?: number
  dreamId: number
  type: 'image' | 'audio'
  blob: Blob
  filename: string
  size: number      // bytes
  createdAt: Date
}

this.version(N).stores({
  // ...
  attachments: '++id, dreamId, type, [dreamId+type]',
})
```

리스트 화면에서는 `Dream` 메타만 읽고, 상세 화면 진입 시에만 `attachments.where('dreamId').equals(id).toArray()`로 로딩 → 메모리 효율.

### 5.3 용량 폭발 방지

```typescript
// 첨부 추가 전 quota 체크
const { usage = 0, quota = 0 } = await navigator.storage.estimate()
if (usage / quota > 0.8) {
  alert('저장 공간이 80% 이상 찼습니다. 보관함을 정리해 주세요.')
}

// 이미지는 사전 압축
async function compressImage(file: File, maxWidth = 1280): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bitmap.width)
  const canvas = new OffscreenCanvas(bitmap.width * scale, bitmap.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return await canvas.convertToBlob({ type: 'image/webp', quality: 0.85 })
}
```

`navigator.storage.persist()`로 *eviction 방지*(섹션 9 export와 함께 사용):

```typescript
if (navigator.storage?.persist) {
  const granted = await navigator.storage.persist()
  console.log('persistent:', granted)
}
```

> **저장공간 정책 (MDN)**: 일반 origin은 디바이스 전체 디스크의 최대 60%까지 IndexedDB·Cache API 사용 가능. 공간 부족 시 LRU로 *non-persistent* 데이터 우선 삭제. `persist()` 승인된 origin은 후순위에 보호.
> 소스: https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist

---

## 6. 통계 모델

### 6.1 태그 빈도 (Tag.count 동기 갱신)

```typescript
async function addDreamWithTags(dream: Omit<Dream, 'id'>) {
  await db.transaction('rw', db.dreams, db.tags, async () => {
    const id = await db.dreams.add(dream as Dream)
    for (const name of dream.tags) {
      const existing = await db.tags.where('name').equals(name).first()
      if (existing) {
        await db.tags.update(existing.id!, { count: existing.count + 1 })
      } else {
        await db.tags.add({ name, count: 1 })
      }
    }
    return id
  })
}
```

> **주의**: 같은 transaction 안에서만 안전. transaction 콜백 안에서 *외부 await*(fetch 등) 호출은 abort 유발.

### 6.2 월별 꿈 수

```typescript
const allDreams = await db.dreams.toArray()
const byMonth = allDreams.reduce<Record<string, number>>((acc, d) => {
  const key = `${d.dreamedAt.getFullYear()}-${d.dreamedAt.getMonth() + 1}`
  acc[key] = (acc[key] ?? 0) + 1
  return acc
}, {})
```

### 6.3 워드클라우드용 빈도 TOP N

```typescript
const top20Tags = await db.tags
  .orderBy('count')
  .reverse()
  .limit(20)
  .toArray()
```

---

## 7. 백엔드 동기화 (선택)

**기본 결정**: 꿈 일기는 *로컬 우선*이 자연스럽다. 동기화는 사용자가 *명시 옵트인*했을 때만 적용한다.

### 7.1 충돌 해결 전략 비교

| 전략 | 설명 | 적합 케이스 | 단점 |
|------|------|-----------|------|
| **Last-Write-Wins (LWW)** | 더 최신 `updatedAt`(또는 논리적 시계)이 이김 | 1인 사용자 다중 디바이스, 동시 편집 거의 없음 | 시계 드리프트 시 데이터 손실 가능 |
| **CRDT** (Yjs, Automerge) | 수학적으로 충돌 없이 병합 보장 | 공동 작성, 텍스트 동시 편집 | 페이로드·복잡도 큼 |
| **사용자 수동 해결** | 충돌 시 두 버전 모두 보존, 사용자가 선택 | 드물게 충돌 + 데이터 가치 높음 | UX 부담 |

**권장 (꿈 일기 1인 사용 기본)**: LWW + *논리적 시계*(`syncVersion: number`) 사용. Wall clock 대신 단조 증가 카운터로 시계 드리프트 회피.

```typescript
interface Dream {
  // ...
  updatedAt: Date
  syncVersion: number    // 매 수정마다 ++
  lastSyncedAt?: Date
  deleted?: boolean      // tombstone (실제 삭제 X, 동기화 후 cleanup)
}
```

> **주의 (CRDT)**: 텍스트 *동시 편집*이 핵심이면 LWW로는 부족. Yjs/Automerge 도입 검토.
> 소스: https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type

### 7.2 sync 흐름

```
1. 로컬 변경 → syncVersion++ + updatedAt = now
2. 백그라운드 동기화 큐 → 서버에 PUT
3. 서버는 자기 syncVersion과 비교
   - 로컬 ver > 서버 ver: 수락
   - 로컬 ver = 서버 ver: 멱등(no-op)
   - 로컬 ver < 서버 ver: 충돌 → LWW 정책 따라 처리
4. pull: 서버 변경분 fetch → 로컬 적용
```

### 7.3 동기화 시 *암호화* (필수 권장)

꿈 내용을 서버로 보낼 때는 **클라이언트 사이드 E2E 암호화**가 권장된다. 서버는 ciphertext만 보고, 키는 사용자만 보유.

```typescript
// libsodium-wrappers 예시 (개념)
import sodium from 'libsodium-wrappers'

await sodium.ready
const key = sodium.crypto_secretbox_keygen() // 사용자 비밀번호에서 derive 권장 (Argon2)
const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
const ciphertext = sodium.crypto_secretbox_easy(dream.content, nonce, key)
// 서버에는 { ciphertext, nonce } 전송. key는 절대 전송 금지.
```

> **소스**: libsodium.js — https://github.com/jedisct1/libsodium.js
> Signal·WhatsApp·Tor에서 사용되는 검증된 라이브러리.

---

## 8. 개인정보 처리 — 꿈 내용은 *민감 정보*

꿈 일기는 사용자의 *심리 상태·트라우마·욕망*이 노출되는 매우 민감한 텍스트다. GDPR 기준 "특별 카테고리 개인정보"에 준해 다룬다.

### 8.1 기본 원칙

| 원칙 | 구현 |
|------|------|
| **로컬 저장 우선** | 동기화 옵션은 *기본 OFF*. 사용자가 명시 활성화해야 함 |
| **암호화 옵션** | 앱 잠금(PIN/지문) + IndexedDB 저장 시 application-level AES/ChaCha20 암호화 옵션 제공 |
| **export 시 경고** | JSON dump 다운로드 전 "이 파일에는 꿈 내용이 포함됩니다" 경고 |
| **공유 PC 대비** | 자동 로그아웃, 일정 시간 후 자동 잠금 |
| **LLM 호출 시 경고** | "이 꿈을 외부 LLM에 보내시겠습니까?" 명시 확인. 익명화 옵션 (이름·장소 mask) |
| **삭제 = 진짜 삭제** | tombstone만 두지 말고 일정 기간 후 ciphertext도 wipe |

### 8.2 IndexedDB 평문 저장 위험

> IndexedDB는 기본적으로 *디스크에 평문* 저장된다. 같은 디바이스의 다른 사용자·악성 확장·디스크 포렌식에서 읽힐 수 있다. 민감도 높은 앱은 *애플리케이션 레벨 암호화*를 추가해야 한다.
> 소스: https://rxdb.info/encryption.html

```typescript
// 저장 전 암호화
async function saveDream(plain: Dream, userKey: Uint8Array) {
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
  const encrypted = sodium.crypto_secretbox_easy(plain.content, nonce, userKey)
  await db.dreams.add({
    ...plain,
    content: '',         // 평문 비움
    encryptedContent: encrypted,
    nonce,
  })
}
```

> **트레이드오프**: 암호화하면 *전문 검색 불가*(Fuse.js·MiniSearch에 평문이 메모리에 떠야 함). 사용자 잠금 해제 세션 동안만 메모리에 복호화, 잠금 시 검색 인덱스도 wipe.

### 8.3 사용자 키 관리

- 비밀번호 → Argon2id로 derive (PBKDF2도 가능하나 약함)
- 키 자체는 디바이스 keychain(Web Crypto API `crypto.subtle` non-extractable key)에 저장
- 비밀번호 분실 시 *복구 불가*함을 사용자에게 명시(데이터 가치 vs 사용성)

---

## 9. 데이터 마이그레이션 — Export/Import

디바이스 변경·백업·이주를 위한 JSON dump 패턴.

### 9.1 Export

```typescript
async function exportAll(): Promise<Blob> {
  const dump = {
    schemaVersion: 3,
    exportedAt: new Date().toISOString(),
    dreams: await db.dreams.toArray(),
    interpretations: await db.interpretations.toArray(),
    tags: await db.tags.toArray(),
    symbols: await db.symbols.toArray(),
  }
  const json = JSON.stringify(dump, (key, value) => {
    if (value instanceof Blob) {
      // Blob은 별도 export — base64로 인라인 또는 별도 zip
      return { __blob: true, /* base64 */ }
    }
    return value
  }, 2)
  return new Blob([json], { type: 'application/json' })
}

// 사용자에게 다운로드 제공
const blob = await exportAll()
const url = URL.createObjectURL(blob)
// <a href={url} download="dream-journal-2026-05-14.json">다운로드</a>
```

### 9.2 Import

```typescript
async function importAll(file: File, mode: 'merge' | 'replace') {
  const text = await file.text()
  const dump = JSON.parse(text)

  // 스키마 버전 호환성 검사
  if (dump.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error('이 백업은 더 새로운 버전입니다. 앱을 업데이트해 주세요.')
  }

  await db.transaction('rw', db.dreams, db.interpretations, db.tags, db.symbols, async () => {
    if (mode === 'replace') {
      await Promise.all([
        db.dreams.clear(),
        db.interpretations.clear(),
        db.tags.clear(),
        db.symbols.clear(),
      ])
    }
    // bulkPut: id 충돌 시 덮어쓰기 (merge 시 주의)
    await db.dreams.bulkPut(dump.dreams)
    await db.interpretations.bulkPut(dump.interpretations)
    await db.tags.bulkPut(dump.tags)
    await db.symbols.bulkPut(dump.symbols)
  })
}
```

### 9.3 큰 첨부 처리

JSON 안에 base64 Blob을 인라인하면 *파일 크기 4/3 팽창*. 이미지 많은 경우 **zip(JSON 메타 + Blob 파일들)** 컨테이너 권장 (jszip 사용).

---

## 10. 흔한 함정

| 함정 | 증상 | 해결 |
|------|------|------|
| **multi-entry index를 잘못 활용** | `where('tags').equals('물').toArray()` 결과에 같은 dream 여러 번 등장 | `.distinct()` 추가 |
| **`dreamedAt` 인덱스 없이 최신순 정렬** | 전체 scan, 느려짐 | `dreamedAt`을 인덱스에 명시 |
| **Blob을 직접 인덱싱 시도** | "Failed to execute 'add' on 'IDBObjectStore'" 에러 | Blob은 *값*으로만 저장, 인덱스 키 불가 (Indexable-Type 문서 참고) |
| **Tag.count를 비-트랜잭션으로 갱신** | race condition으로 count 어긋남 | `db.transaction('rw', ...)` 안에서 갱신 |
| **검색 인덱스(Fuse/MiniSearch) 영속화 없이 매 검색마다 재빌드** | 수천 꿈에서 검색 지연 | 앱 부팅 시 1회 빌드 후 incremental 갱신 |
| **꿈 내용을 평문 그대로 LLM API 호출** | 사용자 동의 없는 민감 정보 외부 송출 | 명시 동의 + 익명화 옵션 |
| **시계 드리프트 무시한 LWW** | 디바이스 시간이 과거면 변경이 묵살됨 | 논리적 시계(`syncVersion`) 사용 |
| **암호화 활성화하면서 검색은 평문 의존** | 잠금 상태에서 검색 결과에 평문 노출 | 잠금 시 검색 인덱스도 wipe |
| **`.stores()`에서 일부 테이블 누락** | 누락 테이블 데이터 *삭제됨* | 매 버전에 모든 테이블 명시 |
| **export 파일에 키도 함께 백업** | 백업 유출 시 즉시 복호화 가능 | 키는 별도 채널(사용자가 직접 보관) |

---

## 참고

- Dexie 공식: https://dexie.org/
- Dexie Indexable Type: https://dexie.org/docs/Indexable-Type
- Dexie MultiEntry Index: https://dexie.org/docs/MultiEntry-Index
- Dexie Version.upgrade(): https://dexie.org/docs/Version/Version.upgrade()
- Dexie StorageManager: https://dexie.org/docs/StorageManager
- MDN IndexedDB Basic Terminology: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology
- MDN StorageManager.persist(): https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
- Fuse.js: https://fusejs.io/
- MiniSearch: https://lucaong.github.io/minisearch/
- libsodium.js: https://github.com/jedisct1/libsodium.js
- CRDT (Wikipedia): https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type
- 짝 스킬: `frontend/indexeddb-dexie` (Dexie 사용법 자체)
