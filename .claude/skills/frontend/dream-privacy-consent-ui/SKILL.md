---
name: dream-privacy-consent-ui
description: >
  꿈 데이터 처리 사용자 동의 UI 패턴 — 한국 개인정보보호법(민감정보 별도 동의) + GDPR(Art.6/Art.9 명시적 동의·철회권)
  기준 동의 화면 설계 가이드. 분리 동의·다크 패턴 회피·미성년자 보호자 동의·LLM API 국외이전 동의 분리·동의 기록 보관까지.
  <example>사용자: "꿈 일기 앱에 GDPR + 한국 개인정보법 둘 다 맞는 동의 화면을 만들어야 해"</example>
  <example>사용자: "꿈 텍스트를 OpenAI API로 보내서 임베딩 생성하는데 동의를 어떻게 받지?"</example>
  <example>사용자: "온보딩 동의에서 다크 패턴이 되지 않게 하려면?"</example>
---

# 꿈 데이터 처리 사용자 동의 UI 패턴

> 소스: 개인정보 보호법 제23조(민감정보)·국가법령정보센터 · 개인정보보호위원회(pipc.go.kr) · GDPR Art.6/7/9 · EDPB Cookie Banner Taskforce Report · ICO 가이드 · WCAG 2.2
> 검증일: 2026-05-15
> 대상 버전: 한국 개인정보 보호법(2023년 9월 15일 전면개정·2024년 9월 15일 시행령 동의 방법 시행) / GDPR(2016/679) / ePrivacy Directive(2002/58/EC)

> 주의: 본 스킬은 *개발 가이드*입니다. 실제 서비스 출시 전 *반드시 법률 자문*을 받으세요. 본 스킬은 법적 책임을 지지 않습니다.

---

## 1. 핵심 원칙 5가지 (Quick Reference)

1. **꿈 데이터는 *민감정보 가능성이 높다*** — 정신적·심리적 내용은 한국법 "건강(정신적)" 또는 "사상·신념"에 해당할 수 있음 → **별도 동의** 받기
2. **필수 vs 선택 분리** — 앱 기능(필수)과 분석·임베딩·공유(선택)는 *체크박스 분리*. 선택 미동의해도 서비스 제공 거부 금지(한국법 명시)
3. **다크 패턴 금지** — 미리 체크된 박스(GDPR Recital 32), "거부" 숨김, "수락"만 강조 → 무효 동의 + 과징금 대상
4. **국외이전·LLM API 별도 동의** — OpenAI·Anthropic 등 *해외 처리* 명시 + 별도 동의
5. **동의 기록 보관 필수** — 누가·언제·무엇에·어떤 버전 동의했는지 로그(Article 7 입증 의무)

---

## 2. 한국 개인정보 보호법 핵심

### 2.1 민감정보 정의 (제23조)

> 법령 원문: 개인정보 보호법 제23조(민감정보의 처리 제한)

> **민감정보 종류** (제23조 + 시행령):
> - 사상·신념
> - 노동조합·정당의 가입·탈퇴
> - 정치적 견해
> - 건강(과거·현재 병력, **신체적·정신적 장애 유무**, 건강상태)
> - 성생활
> - 유전정보·범죄경력
> - 인종·민족, 생체인식정보(특정 식별 목적)
>
> **꿈 데이터 해당 여부:** 꿈 자체가 명시적 민감정보는 아니지만, 다음 경우 *민감정보로 분류될 가능성*이 높음:
> - 꿈 내용에 *정신 건강 상태*(불안·우울·트라우마)가 드러남 → "건강" 카테고리
> - 종교적·사상적 꿈 → "사상·신념" 카테고리
> - 성적 꿈 → "성생활" 카테고리
>
> 보수적으로 *민감정보로 전제하고 동의 설계*하는 것이 안전합니다.

### 2.2 민감정보 처리 요건

민감정보 처리는 *원칙적으로 금지*. 다음 경우에만 가능:

1. **다른 개인정보 처리 동의와 *별도로* 명시적 동의** (제23조 제1항 제1호) ← 가장 일반적
2. 법령에서 처리를 요구·허용한 경우

> 주의: "이용약관 + 개인정보처리방침 + 민감정보 동의"를 *한 번의 체크박스로 묶으면 무효*. 민감정보는 *반드시 별도 체크박스*.

### 2.3 필수동의 폐지 (2024년 9월 15일 시행)

> **변경 사항** (개정 시행령 적용):
> - 서비스 계약 이행에 *필요한* 개인정보는 **동의 없이도 수집·이용 가능**
> - 즉 "필수 동의" 항목은 *동의 자체가 불필요* (계약 이행 근거로 처리)
> - 선택 동의에 동의하지 않았다는 이유로 *서비스 제공 거부 불가*
>
> **UI 영향:**
> - "필수" 체크박스는 *원칙적으로 제거* (또는 "약관 동의"로만 표시)
> - "선택" 항목만 분리해서 *각각 별도 체크박스* 제공
> - "동의하지 않아도 기본 기능 사용 가능" 안내 명시

### 2.4 명시 의무 항목

각 동의 항목마다 다음을 *명확히* 알린다:

| 항목 | 예시 |
|------|------|
| 처리 목적 | "꿈 일기 저장 및 검색", "AI 기반 꿈 분석" |
| 처리 항목 | "꿈 텍스트, 작성 일시, 감정 태그" |
| 보관 기간 | "회원 탈퇴 시까지" 또는 "수집일로부터 3년" |
| 제3자 제공 | "OpenAI(미국) — 임베딩 생성 목적" |
| 동의 철회 방법 | "설정 → 개인정보 → 동의 철회 메뉴" |
| 거부 시 불이익 | "임베딩 생성을 사용할 수 없으나, 기본 일기 작성은 가능" |

---

## 3. GDPR 핵심

### 3.1 Art.6 — 적법 처리 근거 6가지

| 근거 | 설명 | 꿈 앱 적용 |
|------|------|-----------|
| (a) Consent | 명시적 동의 | 꿈 텍스트 처리, 외부 API 전송 |
| (b) Contract | 계약 이행 필요 | 회원 가입·로그인 |
| (c) Legal obligation | 법적 의무 | 세금 신고용 결제 기록 |
| (d) Vital interests | 생명 보호 | (해당 없음) |
| (e) Public task | 공익 업무 | (해당 없음) |
| (f) Legitimate interests | 정당한 이익 | 보안 로그(주의: 민감정보엔 미적용) |

> 주의: 꿈 데이터처럼 *민감정보(Art.9 특수 카테고리)*에 해당할 가능성이 있으면 (f) 정당한 이익 단독 근거로는 처리 불가. **Art.9 별도 조건 필요**.

### 3.2 Art.9 — 민감정보(Special Category Data)

> GDPR Art.9 특수 카테고리:
> - 인종·민족, 정치적 견해, 종교·철학적 신념, 노동조합 가입
> - 유전 데이터, 생체 데이터(식별 목적)
> - 건강 데이터(*mental health 포함*)
> - 성생활·성적 지향

> Art.9 처리 조건 (Art.6과 *별도로* 충족 필요):
> 1. **Explicit consent** (명시적 동의) ← 가장 일반적
> 2. 고용·사회보장 의무
> 3. 정보주체 보호 불가능 상황
> 4. 공익 의료·보건
> 5. 기타 9개 항목

**Explicit consent vs Consent 차이:**
- 일반 consent(Art.6(a)): freely given, specific, informed, unambiguous
- Explicit consent(Art.9): 위 + **명백히 표현된 진술** (체크박스 + 명시 문구, 음성 녹음, 서명 등)

### 3.3 Art.7 — 동의 조건

- 처리 시작 *이전*에 동의 획득 (사후 동의 불가)
- 다른 계약 조건과 *명확히 구별*되는 형태
- **철회는 동의만큼 쉬워야 한다**(Art.7(3)) — "한 번 클릭으로 동의했으면 한 번 클릭으로 철회 가능"
- 처리자는 동의 사실을 *입증할 수 있어야 함*(Art.7(1)) → **동의 로그 보관 필수**

### 3.4 다크 패턴 금지 (EDPB)

> Recital 32: "Silence, pre-ticked boxes or inactivity should not therefore constitute consent."

EDPB Cookie Banner Taskforce 위반 사례:
- 미리 체크된 박스
- "Accept"와 "Reject" 시각적 비대칭 (큰 컬러 버튼 vs 작은 회색 텍스트)
- "Reject" 버튼 1단계 더 깊은 메뉴에 숨김
- "Settings" 안에 거부 옵션 숨김
- 거부 시 추가 클릭 강요

> 실제 과징금 사례: 프랑스 CNIL이 Google에 €150M, Facebook에 €60M 부과(2022) — *거부가 수락보다 어렵게 설계되었다는 이유*.

---

## 4. 동의 화면 구성 (UI Layer)

### 4.1 권장 구조 (3계층 progressive disclosure)

```
[Layer 1] 온보딩 첫 진입
  └─ 짧은 요약 (1-2문장) + "자세히 보기" / "계속" 버튼
       ↓
[Layer 2] 동의 항목 화면
  ├─ 약관 동의 (필수, 단일 체크박스)
  ├─ ─── (구분선) ───
  ├─ 민감정보 처리 (필수, 별도 체크박스, 강조 표시)
  ├─ ─── (구분선) ───
  ├─ [선택] 외부 LLM API 사용 (체크박스 + "자세히")
  ├─ [선택] 익명 통계 수집 (체크박스 + "자세히")
  ├─ [선택] 꿈 공유 기능 (체크박스 + "자세히")
  └─ [동의하고 시작] / [나중에 결정] / [모두 거부하고 시작]
       ↓
[Layer 3] 각 항목 "자세히" 모달
  ├─ 처리 목적
  ├─ 처리 항목
  ├─ 보관 기간
  ├─ 제3자/국외이전
  └─ 동의 철회 방법
```

### 4.2 React 컴포넌트 예시

```tsx
// ConsentScreen.tsx
import { useState } from 'react';
import type { ConsentRecord } from './types';

interface ConsentScreenProps {
  onSubmit: (record: ConsentRecord) => void;
  locale: 'ko' | 'en';
}

interface ConsentState {
  terms: boolean;            // 약관 (필수, 계약 이행 근거 — UI상 표시는 함)
  sensitiveData: boolean;    // 민감정보(꿈 내용) 처리 — 명시적 동의
  externalLlm: boolean;      // [선택] OpenAI/Anthropic API 국외이전
  analytics: boolean;        // [선택] 익명 통계
  sharing: boolean;          // [선택] 꿈 공유 기능
}

const CONSENT_VERSION = '1.0.0'; // 동의서 버전 — 변경 시 재동의 필요

export default function ConsentScreen({ onSubmit, locale }: ConsentScreenProps) {
  const [state, setState] = useState<ConsentState>({
    terms: false,
    sensitiveData: false,
    externalLlm: false,        // 미리 체크하지 않음 (GDPR Recital 32)
    analytics: false,
    sharing: false,
  });
  const [detailModal, setDetailModal] = useState<keyof ConsentState | null>(null);

  // 필수 항목 미동의 시 진행 불가
  const canProceed = state.terms && state.sensitiveData;

  const handleSubmit = () => {
    if (!canProceed) return;
    const record: ConsentRecord = {
      ...state,
      consentVersion: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      locale,
      // userAgent, ipAddress 등은 서버에서 보강
    };
    onSubmit(record);
  };

  return (
    <main aria-labelledby="consent-title" role="main">
      <h1 id="consent-title">개인정보 처리 동의</h1>

      {/* 약관 동의 (필수) */}
      <ConsentItem
        id="terms"
        label="이용약관 및 개인정보처리방침 동의 (필수)"
        checked={state.terms}
        required
        onChange={(v) => setState((s) => ({ ...s, terms: v }))}
        onDetail={() => setDetailModal('terms')}
      />

      {/* 민감정보 동의 (필수, 별도 강조) */}
      <section aria-label="민감정보 처리" className="sensitive">
        <ConsentItem
          id="sensitiveData"
          label="꿈 내용(정신적·심리적 정보) 처리 동의 (필수)"
          description="꿈 텍스트는 개인정보 보호법상 민감정보(정신 건강)에 해당할 수 있어 별도 동의를 받습니다."
          checked={state.sensitiveData}
          required
          onChange={(v) => setState((s) => ({ ...s, sensitiveData: v }))}
          onDetail={() => setDetailModal('sensitiveData')}
        />
      </section>

      <hr />

      {/* 선택 항목 */}
      <ConsentItem
        id="externalLlm"
        label="[선택] AI 분석을 위한 외부 API 사용 (OpenAI·Anthropic, 미국)"
        description="동의 시 꿈 텍스트가 미국 서버로 전송되어 임베딩 및 분석에 사용됩니다. 거부해도 기본 일기 작성은 가능합니다."
        checked={state.externalLlm}
        onChange={(v) => setState((s) => ({ ...s, externalLlm: v }))}
        onDetail={() => setDetailModal('externalLlm')}
      />

      <ConsentItem
        id="analytics"
        label="[선택] 익명 사용 통계 수집"
        checked={state.analytics}
        onChange={(v) => setState((s) => ({ ...s, analytics: v }))}
        onDetail={() => setDetailModal('analytics')}
      />

      <ConsentItem
        id="sharing"
        label="[선택] 꿈 커뮤니티 공유 기능"
        checked={state.sharing}
        onChange={(v) => setState((s) => ({ ...s, sharing: v }))}
        onDetail={() => setDetailModal('sharing')}
      />

      {/* 버튼: Accept/Reject 동일 시각 비중 */}
      <div className="actions">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canProceed}
          className="primary"
        >
          동의하고 시작
        </button>
        <button
          type="button"
          onClick={() => onSubmit({
            terms: state.terms,
            sensitiveData: state.sensitiveData,
            externalLlm: false,
            analytics: false,
            sharing: false,
            consentVersion: CONSENT_VERSION,
            timestamp: new Date().toISOString(),
            locale,
          })}
          disabled={!canProceed}
          className="secondary"
        >
          선택 항목 모두 거부하고 시작
        </button>
      </div>

      {detailModal && (
        <ConsentDetailModal
          itemKey={detailModal}
          onClose={() => setDetailModal(null)}
        />
      )}
    </main>
  );
}
```

> 주의: `ConsentItem`, `ConsentDetailModal`은 별도 컴포넌트로 분리한다. 위 코드는 *구조 가이드*. 실제 운영 코드는 i18n·테스트·접근성 보강 필요.

---

## 5. 분리 동의 패턴

### 5.1 분리해야 할 동의 항목 매트릭스

| 카테고리 | 항목 | 분리 필요? | 근거 |
|---------|------|:---:|------|
| 약관 | 이용약관 동의 | (별도) | 일반 동의 |
| 약관 | 개인정보처리방침 동의 | (별도) | 일반 동의 |
| 민감정보 | 꿈 내용 처리 | ✅ 별도 | 한국법 제23조 / GDPR Art.9 |
| 국외이전 | OpenAI(미국) | ✅ 별도 | 한국법 제28조의8 |
| 국외이전 | Anthropic(미국) | ✅ 별도 | 한국법 제28조의8 |
| 마케팅 | 마케팅 수신 동의 | ✅ 별도 | PIPC 가이드 |
| 제3자 제공 | 꿈 공유 기능 | ✅ 별도 | 한국법 제17조 |
| 통계 | 익명 사용 통계 | ⚠️ 권장 | GDPR consent |

> 주의: "한 체크박스로 모두 동의"는 *무효 동의*. 항목별로 *독립적 거부 가능*해야 함.

### 5.2 안티 패턴

```tsx
// 금지: 단일 체크박스로 묶음
<input type="checkbox" />
<label>이용약관, 개인정보처리방침, 민감정보 처리, 마케팅 수신에 모두 동의합니다</label>

// 권장: 각각 별도
<input type="checkbox" id="terms" />
<label htmlFor="terms">이용약관 동의 (필수)</label>

<input type="checkbox" id="privacy" />
<label htmlFor="privacy">개인정보처리방침 동의 (필수)</label>

<input type="checkbox" id="sensitive" />
<label htmlFor="sensitive">민감정보(꿈 내용) 처리 동의 (필수)</label>

<input type="checkbox" id="marketing" />
<label htmlFor="marketing">마케팅 수신 동의 (선택)</label>
```

---

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
