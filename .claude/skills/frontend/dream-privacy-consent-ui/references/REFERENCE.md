## 6. 다크 패턴 회피 체크리스트

> EDPB Cookie Banner Taskforce Report(2023) + 프랑스 CNIL 가이드 기준

| 항목 | 금지 패턴 | 권장 패턴 |
|------|----------|----------|
| 기본값 | 미리 체크된 박스 | 빈 체크박스 (opt-in) |
| 버튼 시각 비중 | "수락"만 강조 컬러 | "수락"/"거부" 동일 시각 비중 |
| 거부 경로 | 추가 메뉴 깊숙이 숨김 | 첫 화면에서 1클릭 거부 가능 |
| 텍스트 | "동의하지 않으면 사용 불가" 등 강압 | "거부해도 기본 기능 사용 가능" |
| 색상 | "거부"를 회색·작은 글씨 | 동일 가시성 |
| 클릭 수 | 거부는 5클릭, 수락은 1클릭 | 동일 클릭 수 |
| 로직 | X 버튼 누르면 동의 처리 | X는 *거부 또는 보류*만 |
| 재요청 | 거부 직후 같은 동의 재요청 | 최소 6개월 간격 또는 정책 변경 시만 |

### 6.1 CSS 다크 패턴 회피 예시

```css
/* 금지 — 시각 비대칭 */
.btn-accept { background: #2563eb; color: white; padding: 12px 24px; font-weight: bold; }
.btn-reject { background: transparent; color: #9ca3af; font-size: 12px; text-decoration: underline; }

/* 권장 — 동일 시각 비중 */
.btn-accept,
.btn-reject {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  min-width: 120px;
}
.btn-accept { background: #2563eb; color: white; border: 2px solid #2563eb; }
.btn-reject { background: white; color: #2563eb; border: 2px solid #2563eb; }
```

---

## 7. 미성년자 동의 — 만 14세 미만

### 7.1 한국법 (개인정보 보호법 제22조의2)

> 만 14세 미만 아동의 개인정보 수집·이용·제공 시 **법정대리인의 동의** 필수
> 위반 시: 5년 이하 징역 또는 5천만 원 이하 벌금, 전체 매출 3% 이하 과징금

### 7.2 GDPR (Art.8)

> 16세 미만(회원국마다 13~16세 사이 설정 가능)에게 정보사회 서비스 제공 시 부모 동의 필요

### 7.3 UI 구현

```tsx
// AgeGate.tsx — 동의 화면 진입 전 연령 확인
export function AgeGate({ onAdult, onMinor }: AgeGateProps) {
  const [birthYear, setBirthYear] = useState('');

  const handleSubmit = () => {
    const year = parseInt(birthYear, 10);
    if (!year) return;
    const age = new Date().getFullYear() - year;
    if (age < 14) {
      onMinor(); // 법정대리인 동의 플로우로 분기
    } else {
      onAdult(); // 본인 동의 플로우
    }
  };

  return (
    <div role="form" aria-labelledby="age-gate-title">
      <h2 id="age-gate-title">연령 확인</h2>
      <p>만 14세 미만은 보호자 동의가 필요합니다.</p>
      <label htmlFor="birthYear">출생년도</label>
      <input
        id="birthYear"
        type="number"
        value={birthYear}
        onChange={(e) => setBirthYear(e.target.value)}
        min={1900}
        max={new Date().getFullYear()}
      />
      <button type="button" onClick={handleSubmit}>다음</button>
    </div>
  );
}
```

### 7.4 법정대리인 동의 확인 방법 (한국법)

> 시행령 제17조의2 기준 — 다음 중 *하나 이상*:
> 1. 동의 표시 후 *법정대리인 휴대폰 문자 알림*
> 2. 법정대리인 *신용카드·직불카드 정보* 제공
> 3. 법정대리인 *휴대폰 본인인증*
> 4. *공인전자서명* 또는 *전자인증서*
> 5. 우편·팩스로 *서명한 동의서* 회신
> 6. 통화 녹취

> 주의: 단순히 "보호자가 동의했습니다" 체크박스만 받으면 *무효*. 위 확인 방법 중 하나를 실제 구현해야 함.

---

## 8. 다국어 동의 텍스트

### 8.1 i18n 구조 권장

```ts
// consent.ko.ts
export const consentKo = {
  title: '개인정보 처리 동의',
  items: {
    terms: {
      label: '이용약관 및 개인정보처리방침 동의 (필수)',
      purpose: '회원 가입 및 서비스 제공',
      retention: '회원 탈퇴 시까지',
    },
    sensitiveData: {
      label: '꿈 내용(정신적·심리적 정보) 처리 동의 (필수)',
      purpose: '꿈 일기 저장·검색·분석',
      legalBasis: '개인정보 보호법 제23조 별도 동의',
      retention: '회원 탈퇴 또는 동의 철회 시까지',
    },
    externalLlm: {
      label: '[선택] AI 분석을 위한 외부 API 사용',
      purpose: '꿈 텍스트 임베딩 및 분석',
      thirdParty: ['OpenAI (미국)', 'Anthropic (미국)'],
      retention: '분석 완료 후 즉시 삭제 (외부 API 보관 기간은 각 제공자 정책 참조)',
    },
    // ...
  },
} as const;

// consent.en.ts — GDPR 텍스트
export const consentEn = {
  title: 'Personal Data Processing Consent',
  items: {
    terms: {
      label: 'Terms of Service and Privacy Policy (Required)',
      // ...
    },
    sensitiveData: {
      label: 'Special Category Data — Dream Content (Explicit Consent Required)',
      legalBasis: 'GDPR Art.9(2)(a) — Explicit Consent',
      // ...
    },
    // ...
  },
} as const;
```

### 8.2 언어별 법령 매핑

| 언어/지역 | 적용 법령 | 동의 표시 키워드 |
|----------|----------|----------------|
| 한국어 | 개인정보 보호법 | "별도 동의", "필수/선택" |
| 영어 (EU) | GDPR | "Explicit consent", "Special category" |
| 영어 (UK) | UK GDPR + PECR | 동일 + cookie consent |
| 일본어 | 個人情報保護法 | "本人の同意" |

> 주의: *지역(IP)이 아닌 사용자 선택 언어*에 따라 표시하면 법령 위반 가능. 사용자 거주 국가를 별도 확인하거나, *가장 엄격한 기준*(GDPR + 한국법 둘 다 만족)으로 통합 운영.

---

## 9. 쿠키 vs PWA 저장소 — IndexedDB·LocalStorage 동의

### 9.1 ePrivacy Directive Art.5(3) 핵심

> EU ePrivacy Directive Art.5(3): 단말 장치에 *정보를 저장*하거나 *이미 저장된 정보에 접근*하려면 사용자 동의 필요. 단, "사용자가 명시적으로 요청한 서비스 제공에 *엄격히 필요한*" 경우는 예외.

> **적용 대상:** HTTP cookies, **localStorage, sessionStorage, IndexedDB**, WebSQL, fingerprinting, pixels — *기술 종류 무관*하게 단말 저장 행위 자체에 동의 필요.

### 9.2 꿈 앱에서의 분류

| 저장 용도 | 저장소 | 동의 필요? | 근거 |
|----------|-------|:---:|------|
| 사용자 인증 토큰 | LocalStorage | ❌ | strictly necessary |
| 다크 모드 설정 | LocalStorage | ❌ | strictly necessary (UI 설정) |
| 꿈 일기 본문 | IndexedDB (Dexie) | ✅ | 민감정보 저장 = 별도 동의 |
| 임베딩 캐시 | IndexedDB | ✅ | 처리 결과 저장 |
| 분석 통계 | LocalStorage/IndexedDB | ✅ | 선택 동의 |
| 익명 디바이스 ID | LocalStorage | ✅ | 추적 목적 |

### 9.3 동의 전 저장 금지 패턴

```ts
// 금지 — 동의 전에 민감정보 저장
import Dexie from 'dexie';
const db = new Dexie('DreamDB');
db.version(1).stores({ dreams: '++id, text, createdAt' });
await db.dreams.add({ text: dreamText, createdAt: Date.now() }); // 동의 없이 저장됨

// 권장 — 동의 상태 확인 후 저장
import { getConsent } from './consent';

export async function saveDream(text: string) {
  const consent = await getConsent();
  if (!consent.sensitiveData) {
    throw new Error('민감정보 처리 동의가 필요합니다');
  }
  await db.dreams.add({ text, createdAt: Date.now() });
}
```

---

## 10. 임베딩·LLM API 외부 전송 동의

### 10.1 한국법 — 국외이전 별도 동의 (제28조의8)

> 개인정보를 *국외로 이전*하려면 다음 중 하나 충족:
> 1. **정보주체로부터 국외이전에 관한 별도 동의** 획득
> 2. 법률·조약 등 국제 협정
> 3. 적정성 인정 국가 이전
> 4. 표준계약(SCC) 또는 인증
>
> 동의 시 *명시 필수*:
> - 이전 받는 자(예: "OpenAI, Inc.")
> - 이전 받는 국가(예: "미국")
> - 이전 시점·방법
> - 이전 항목
> - 이전 받는 자의 이용 목적·보유 기간
> - 동의 거부 권리 및 거부 시 불이익

### 10.2 GDPR — Chapter V 국외이전

> GDPR Chapter V: EEA 외부로 개인정보 이전 시:
> - **Adequacy decision** (적정성 결정 국가) — 한국은 2021년 적정성 인정
> - **SCC** (Standard Contractual Clauses)
> - **BCR** (Binding Corporate Rules)
> - **명시적 동의** (Art.49(1)(a)) — *예외적·일회성*

> 주의: 미국(OpenAI·Anthropic 본사)은 *Adequacy 인정* 받음(EU-US Data Privacy Framework, 2023년부터). 단, *DPF 인증 가입 기업에 한정*. OpenAI·Anthropic의 DPF 가입 여부는 *각 사 정책 확인 필요*.

### 10.3 UI 구현 — OpenAI/Anthropic 전송 동의

```tsx
<section aria-label="외부 AI 서비스 사용 동의" className="external-llm">
  <h3>[선택] AI 기반 꿈 분석을 위한 외부 API 사용</h3>

  <details>
    <summary>처리 내용 (자세히 보기)</summary>
    <dl>
      <dt>이전 받는 자</dt>
      <dd>OpenAI, Inc. (미국) — 임베딩 생성</dd>
      <dd>Anthropic PBC (미국) — 꿈 분석</dd>

      <dt>이전 항목</dt>
      <dd>꿈 텍스트, 작성 일시 (사용자 식별자 제외)</dd>

      <dt>이전 시점·방법</dt>
      <dd>꿈 작성 후 사용자가 "분석" 버튼 클릭 시, HTTPS API 호출</dd>

      <dt>이전 목적</dt>
      <dd>벡터 임베딩 생성 및 의미 분석</dd>

      <dt>보유 기간</dt>
      <dd>OpenAI/Anthropic 정책에 따라 30일 이내 삭제 (각 사 API 정책 참조)</dd>

      <dt>거부 시 불이익</dt>
      <dd>AI 분석 기능 사용 불가. 일기 작성·검색 등 기본 기능은 정상 사용 가능.</dd>
    </dl>
  </details>

  <label>
    <input
      type="checkbox"
      checked={externalLlm}
      onChange={(e) => setExternalLlm(e.target.checked)}
    />
    위 내용에 동의하고 외부 AI 분석을 사용합니다.
  </label>
</section>
```

> 주의: 위 보유 기간·DPF 가입 여부는 *실제 발표 시점의 OpenAI/Anthropic 정책*을 확인해 정확히 표기. 본 예시 값은 임의 예시.

---

## 11. 동의 기록 보관

### 11.1 보관 필수 항목 (GDPR Art.7(1) + 한국법 입증 책임)

> ICO 가이드 + EDPB 권고 + Article 7(1) 입증 의무 기준:

| 필수 필드 | 예시 |
|----------|------|
| `userId` | 사용자 ID 또는 익명 식별자 |
| `timestamp` | ISO8601 + timezone (예: `2026-05-15T09:00:00+09:00`) |
| `consentVersion` | 동의서 버전 (예: `1.0.0`) |
| `policyVersion` | 개인정보처리방침 버전 |
| `consentedItems` | 동의 항목 목록과 각각의 true/false |
| `method` | `web_form` / `mobile_app` / `paper` |
| `ipAddress` | 동의 시점 IP (선택, 개인정보 최소화 원칙) |
| `userAgent` | 브라우저·기기 정보 (선택) |
| `withdrawnAt` | 철회 시점 (철회 시) |
| `language` | 표시된 언어 |

### 11.2 보관 기간

> Secure Privacy 가이드 + EDPB 권고: "처리 기간 + 시효 기간(3~5년)"
> 한국법: 별도 명시 없으나 *입증 책임 다하는 범위* — 일반적으로 *처리 종료 후 3년* 권장.

### 11.3 구현 예시 (서버 측 로그)

```ts
// 서버 측 — Postgres 동의 로그 테이블
interface ConsentLog {
  id: string;             // UUID
  userId: string;
  timestamp: Date;
  consentVersion: string;
  policyVersion: string;
  consentedItems: {
    terms: boolean;
    sensitiveData: boolean;
    externalLlm: boolean;
    analytics: boolean;
    sharing: boolean;
  };
  method: 'web_form' | 'mobile_app';
  ipAddress: string | null;
  userAgent: string | null;
  language: 'ko' | 'en';
  withdrawnAt: Date | null;
  withdrawnItems: string[] | null; // 부분 철회 시
}
```

```ts
// 클라이언트 → 서버
await fetch('/api/consent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    consentVersion: '1.0.0',
    policyVersion: '2.3.0',
    consentedItems: state,
    method: 'web_form',
    language: 'ko',
  }),
});
```

### 11.4 동의 철회 UI

> GDPR Art.7(3): 철회는 동의만큼 쉬워야 한다.

```tsx
// SettingsConsent.tsx
export function SettingsConsent() {
  const [consents, setConsents] = useState<ConsentState>(/* 서버에서 로드 */);

  const handleWithdraw = async (key: keyof ConsentState) => {
    if (key === 'terms' || key === 'sensitiveData') {
      // 필수 항목 철회 = 계정 해지로 분기
      const confirmed = confirm('필수 동의 철회 시 계정이 해지됩니다. 계속하시겠습니까?');
      if (!confirmed) return;
      await deleteAccount();
      return;
    }
    // 선택 항목은 즉시 철회 가능
    await fetch('/api/consent/withdraw', {
      method: 'POST',
      body: JSON.stringify({ item: key }),
    });
    setConsents((c) => ({ ...c, [key]: false }));
  };

  return (
    <section>
      <h2>동의 관리</h2>
      {Object.entries(consents).map(([key, value]) => (
        <div key={key}>
          <span>{labels[key]}</span>
          <span>{value ? '동의함' : '동의 안함'}</span>
          {value && (
            <button type="button" onClick={() => handleWithdraw(key)}>
              철회
            </button>
          )}
        </div>
      ))}
    </section>
  );
}
```

---

## 12. UX 패턴

### 12.1 온보딩 단계 통합

```
[1] 앱 시작 → 스플래시
[2] 가치 제안 화면 (Why dream journal?)
[3] 연령 확인 (Age gate)
[4] 약관·민감정보 동의 (필수만)
[5] 선택 동의 — *"나중에 결정" 옵션 제공*
[6] 시작 (Get started)
```

> 주의: 첫 진입에서 *모든 동의를 한 번에 강제하지 않는다*. 선택 항목은 "나중에 결정"이 가능해야 함. *실제 기능을 처음 사용할 때* 그 시점에 in-context 동의를 받는 것도 가능(just-in-time consent).

### 12.2 Just-in-time consent

```tsx
// AI 분석 버튼 클릭 시점에 동의 받기
function DreamAnalysisButton({ dreamText }: Props) {
  const { consent, requestConsent } = useConsent();

  const handleAnalyze = async () => {
    if (!consent.externalLlm) {
      const granted = await requestConsent('externalLlm');
      if (!granted) return;
    }
    await analyzeWithLlm(dreamText);
  };

  return <button onClick={handleAnalyze}>AI로 분석하기</button>;
}
```

### 12.3 접근성 (WCAG 2.2)

> WCAG 2.2 동의 UI 권장:
> - 시맨틱 HTML(`<button>`, `<input type="checkbox">`)
> - 모든 인터랙티브 요소 키보드 접근 가능
> - 명확한 포커스 표시(`:focus-visible`)
> - 동의 모달 *진입 시 포커스 트랩*(Esc 또는 명시적 닫기로만 해제)
> - 라벨 명시적 연결(`<label for>` 또는 `aria-labelledby`)
> - 색상만으로 정보 전달 금지(텍스트·아이콘 병행)

---

## 13. 흔한 함정 (Anti-Patterns)

| 함정 | 문제 | 해결 |
|------|------|------|
| 단일 "전체 동의" 버튼 | 항목별 거부 불가 → 무효 | 항목별 체크박스 분리 |
| 미리 체크된 박스 | GDPR Recital 32 위반 | 모든 박스 빈 상태 시작 |
| "거부" 버튼 숨김 | 다크 패턴 + 과징금 | "수락"/"거부" 동등 시각 비중 |
| 미성년자 처리 누락 | 5천만 원 벌금 | Age gate + 법정대리인 확인 절차 |
| 동의 철회 어려움 | Art.7(3) 위반 | 설정에서 1~2클릭 철회 |
| 동의 로그 미보관 | Art.7(1) 입증 불가 | 서버 측 로그 + 버전 추적 |
| 국외이전 동의 누락 | 한국법 제28조의8 위반 | 별도 체크박스 + 이전 대상 명시 |
| 민감정보 일반 동의로 묶음 | 한국법 제23조 위반 | 민감정보 별도 동의 |
| LocalStorage 동의 없이 사용 | ePrivacy Art.5(3) 위반 | strictly necessary 외에는 동의 후 사용 |
| 동의서 버전 미관리 | 정책 변경 시 재동의 추적 불가 | `consentVersion` 필드 + 변경 시 재동의 |
| 거부 후 즉시 재요청 팝업 | 다크 패턴(nagging) | 6개월 이상 또는 정책 변경 시만 |
| 다국어 텍스트 누락 | 비EU/한국 사용자 혼란 | i18n + 가장 엄격한 기준 통합 적용 |

---

## 14. 통합 체크리스트 (출시 전)

- [ ] 민감정보(꿈 내용) 별도 동의 체크박스 존재
- [ ] 필수/선택 동의 분리, 선택 거부 시 서비스 사용 가능
- [ ] "수락"/"거부" 버튼 동일 시각 비중
- [ ] 미리 체크된 박스 없음
- [ ] Age gate 구현, 만 14세 미만 법정대리인 동의 절차
- [ ] 국외이전(OpenAI·Anthropic) 별도 동의 + 이전 대상·국가·목적·기간 명시
- [ ] IndexedDB·LocalStorage 사용 전 동의 확인
- [ ] 동의 기록 서버 보관 (userId·timestamp·version·items)
- [ ] 설정에서 동의 철회 가능 (선택 항목은 1~2클릭)
- [ ] 동의서·정책 버전 관리, 변경 시 재동의 트리거
- [ ] 다국어 텍스트 — 한국어 + 영어 최소
- [ ] WCAG 2.2 키보드·스크린리더 접근 가능
- [ ] 다크 패턴 검토 (CNIL 가이드 기준)
- [ ] **법률 자문 완료** — 실제 서비스 출시 전 필수

---

## 15. 짝 스킬 — 윤리 측면

본 스킬은 *법적·기술적* 가이드입니다. 꿈 데이터의 *윤리적 측면*(취약 정보 처리·개인 정체성·연구 활용 등)은 `humanities/dream-content-privacy-ethics` 스킬을 참조하세요.

법적 최소 요건 충족이 곧 윤리적 완결은 아닙니다. 양쪽을 함께 검토합니다.

---

## 참고 소스

- [개인정보 보호법 제23조 (민감정보의 처리 제한)](https://www.law.go.kr/LSW/lsInfoP.do?lsId=011357&ancYnChk=0)
- [개인정보 보호법 시행령](https://www.law.go.kr/LSW/lsInfoP.do?lsId=011468&ancYnChk=0)
- [개인정보보호위원회 (PIPC)](https://www.pipc.go.kr/np/)
- [GDPR Art.6 — Lawfulness of processing](https://gdpr-info.eu/art-6-gdpr/)
- [GDPR Art.7 — Conditions for consent](https://gdpr-info.eu/art-7-gdpr/)
- [GDPR Art.9 — Special categories](https://gdpr-info.eu/art-9-gdpr/)
- [EDPB Cookie Banner Taskforce Report (2023)](https://www.edpb.europa.eu/system/files/2023-01/edpb_20230118_report_cookie_banner_taskforce_en.pdf)
- [ICO — Special category data](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/lawful-basis-for-processing/special-category-data/)
- [ICO — How should we obtain, record and manage consent?](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/consent/how-should-we-obtain-record-and-manage-consent/)
- [WCAG 2.2 — Cookie Banner Requirements](https://cookie-script.com/guides/web-accessibility-and-cookie-banners-compliance-checklist)
