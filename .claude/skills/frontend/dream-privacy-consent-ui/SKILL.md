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

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
