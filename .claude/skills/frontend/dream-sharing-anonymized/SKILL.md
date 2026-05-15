---
name: dream-sharing-anonymized
description: >
  꿈 일기·시나리오를 익명으로 공유할 때의 옵트인·PII 마스킹·재식별 위험·콘텐츠 모더레이션·미성년자 보호 패턴.
  <example>사용자: "꿈 일기 앱에 익명 공유 게시판을 붙이고 싶은데 어떻게 설계해야 해?"</example>
  <example>사용자: "사용자 꿈 텍스트에서 PII를 자동으로 가려서 공유하는 흐름을 짜줘"</example>
  <example>사용자: "k-anonymity가 꿈 같이 매우 고유한 콘텐츠에도 통하나?"</example>
---

# Dream Sharing Anonymized

> 소스:
> - k-anonymity: https://en.wikipedia.org/wiki/K-anonymity
> - KLUE-NER: https://github.com/KLUE-benchmark/KLUE, https://arxiv.org/abs/2105.09680
> - KoBERT: https://github.com/SKTBrain/KoBERT
> - 정보통신망법 제44조의2: https://casenote.kr/법령/정보통신망_이용촉진_및_정보보호_등에_관한_법률/제44조의2
> - 개인정보보호법 제22조의2(아동 보호): https://www.privacy.go.kr/front/contents/cntntsView.do?contsNo=94
> - 콘텐츠 모더레이션 베스트 프랙티스: https://sightengine.com/self-harm-mental-health-suicide-moderation-guide
> 검증일: 2026-05-15

> 주의 (법적 자문): 이 스킬은 *기술 패턴* 가이드다. 상업 출시 전에는 반드시 변호사 자문을 받아 정보통신망법·개인정보보호법·청소년보호법 적합성을 확인하라. 법령은 개정될 수 있으며 본 스킬의 인용 시점(2026-05-15) 이후 변경되었을 수 있다.

---

## 1. 옵트인 원칙

꿈은 일기·심리 데이터의 가장 사적인 영역이다. **모든 공유는 사용자 명시 동의가 있을 때만 발생**한다.

```ts
// 권장 — 기본 비공유, 명시적 토글
type DreamEntry = {
  id: string;
  body: string;
  shareScope: 'private' | 'anon-board' | 'friends' | 'sns';
  shareConsentAt: Date | null;  // 동의 시각 — 감사 로그용
};

const defaultEntry: DreamEntry = {
  shareScope: 'private',
  shareConsentAt: null,
  // ...
};
```

**금지 패턴:**
- "동의함" 체크박스 *기본 체크* (다크 패턴)
- 회원가입 약관에 *전체 공유 동의*를 한꺼번에 묶기
- 한 번 동의하면 *영구* 적용 (재공유 시 재확인 필요)

---

## 2. PII 자동 마스킹 — 다층 방어

자동 마스킹은 *완벽하지 않다*. 정규식 + NER + 사용자 검토 3단계가 모두 필요하다.

### 2-1. 정규식 1차 필터

빠르고 결정적. 휴대전화·이메일·주민번호 등 *형식이 고정된* PII에 강하다.

```ts
const PII_REGEX = {
  phone: /01[016789][-\s]?\d{3,4}[-\s]?\d{4}/g,
  email: /[\w.+-]+@[\w-]+\.[\w.-]+/g,
  rrn: /\d{6}[-\s]?[1-4]\d{6}/g,           // 주민등록번호 — 절대 평문 저장 금지
  cardNumber: /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g,
};

function regexMask(text: string): string {
  let masked = text;
  for (const [, pattern] of Object.entries(PII_REGEX)) {
    masked = masked.replace(pattern, '[MASKED]');
  }
  return masked;
}
```

> 주의: 주민번호는 *마스킹 후에도 원본 저장 금지*. 처음부터 입력받지 않거나, 받으면 즉시 폐기한다.

### 2-2. NER 2차 필터 — 한국어 고유명사

이름·주소·기관명은 형식이 자유로워 정규식이 불가능. 한국어 NER 모델 필요.

| 모델 | 출처 | 라이선스 | 비고 |
|------|------|----------|------|
| KLUE-RoBERTa-large | [KLUE](https://github.com/KLUE-benchmark/KLUE) | 비상업 연구용 (KLUE-NER 데이터셋 라이선스 확인) | 6 entity: person/location/organization/date/time/quantity |
| KoBERT + CRF NER | [eagle705/pytorch-bert-crf-ner](https://github.com/eagle705/pytorch-bert-crf-ner) | 레포 라이선스 확인 | KoBERT(Apache-2.0) 기반 |
| LLM API (Claude/GPT 등) | 상용 API | 상용 라이선스 | 자유로운 프롬프트, 한국어 한정 NER도 가능. 비용·외부 전송 위험 |

> 주의 (라이선스): KLUE 데이터셋·모델의 *상업 사용* 가능 여부는 반드시 원 라이선스 문서를 확인하라. 상업 서비스라면 자체 데이터로 fine-tune하거나 상용 모델을 검토한다.

```ts
// 패턴 — NER 결과를 받아 마스킹 적용
type NerEntity = { text: string; label: 'PS' | 'LC' | 'OG' | 'DT' | 'TI' | 'QT'; start: number; end: number };

function nerMask(text: string, entities: NerEntity[]): string {
  // 보수적으로 PS(인물), LC(지명), OG(기관)만 마스킹 (날짜·수량은 꿈 맥락에 필요)
  const sensitive = entities.filter(e => ['PS', 'LC', 'OG'].includes(e.label));
  return sensitive
    .sort((a, b) => b.start - a.start)  // 뒤에서부터 치환 (인덱스 보존)
    .reduce((acc, e) => acc.slice(0, e.start) + `[${e.label}]` + acc.slice(e.end), text);
}
```

### 2-3. 자동 마스킹의 한계

- **고유명사 오탐/누락** — 신조어·줄임말·은어는 NER이 놓친다. 사용자 검토 단계가 필수.
- **간접 식별자** — "○○고등학교 3학년 김씨"는 직접 PII가 아니지만 *조합으로 식별 가능*. 다음 섹션 4번 참조.
- **외부 LLM 전송** — 클라우드 LLM API로 마스킹하려면 *원문이 외부 서버를 거친다*. 사용자에게 고지하고 동의받는다.

---

## 3. 사용자 검토 UX — 공유 직전 미리보기

자동 마스킹 결과를 *반드시* 사용자에게 보여주고 수동 편집을 허용한다.

```tsx
// 권장 흐름
function ShareReviewModal({ original, autoMasked, onConfirm }: Props) {
  const [edited, setEdited] = useState(autoMasked);

  return (
    <Modal>
      <Section title="원문 (당신에게만 보임)">{original}</Section>
      <Section title="공유될 내용 (편집 가능)">
        <textarea value={edited} onChange={e => setEdited(e.target.value)} />
      </Section>
      <Warning>
        자동 마스킹은 완벽하지 않습니다. 본인·주변인을 특정할 수 있는
        내용이 남아 있는지 직접 확인해주세요.
      </Warning>
      <button onClick={() => onConfirm(edited)}>이 내용으로 공유</button>
    </Modal>
  );
}
```

**원칙:**
- *공유 직전* 마지막 confirm — 한 번 더 의식하게
- *수정 후* 다시 공유 — 자동 마스킹 재실행 옵션 제공
- 공유 후 *언제든 삭제* 가능함을 명시 (다음 섹션 10)

---

## 4. 재식별 위험 — k-anonymity 한계

> 주의 (학술적 한계): **k-anonymity는 꿈처럼 *고유한* 시나리오에는 보장이 약하다.** 익명이어도 본인은 자기 꿈을 알아본다. 주변인도 알아볼 수 있다.

[k-anonymity 정의](https://en.wikipedia.org/wiki/K-anonymity): 데이터셋에서 각 레코드가 *quasi-identifier* 조합으로 *최소 k-1명*과 구별 불가능해야 한다.

**꿈 데이터에서의 한계:**

| 공격 | 설명 | 꿈 데이터 사례 |
|------|------|----------------|
| Linkage attack | 외부 데이터(SNS 등)와 결합해 식별 | "어제 본 영화 + 꿈에 등장" → SNS 시청 기록과 매칭 |
| Background knowledge | 공격자가 일부 사전 지식 보유 | 가까운 사람이 사용자의 직장·취미를 알고 있음 |
| High-dimensionality | 다차원 데이터는 조합이 곧 식별자 | 꿈 텍스트는 자유 형식 → 차원이 폭발 |
| Homogeneity | k 그룹 내 sensitive 값이 동일 | 같은 학교 사용자 그룹 → 학교만 알면 식별 |

**완화 방안:**
- 자유 텍스트 외에 *구조화된 quasi-identifier*(나이·지역·성별)는 *일반화* (예: 나이 → 10단위)
- 공유 게시판은 *지역·연령대 표시 비활성* 기본
- 사용자에게 *재식별 위험* 명시적 고지 후 동의

```tsx
<ConsentNotice>
  익명 게시판에 올린 내용도 다음 경우 본인이 특정될 수 있습니다:
  - 매우 독특한 사건·장소가 포함된 경우
  - 친한 사람이 당신의 생활을 이미 아는 경우
  - 다른 SNS의 글과 결합되는 경우
  공유 후에도 언제든 삭제할 수 있습니다.
</ConsentNotice>
```

---

## 5. 공유 옵션 — 동의 분리

각 채널별로 *별도* 동의 + *별도* 마스킹 정책.

| 채널 | 도달 범위 | 권장 마스킹 강도 | 동의 |
|------|-----------|-----------------|------|
| 익명 게시판 | 앱 내 다수 익명 사용자 | 강 (이름·지명·기관 모두) | 별도 토글 |
| 친구 그룹 | 사용자가 추가한 친구 N명 | 중 (이름은 사용자 선택) | 친구별 또는 그룹별 |
| 외부 SNS (Twitter/X·Threads 등) | 공개 인터넷 | 최강 + URL preview 차단 검토 | 공유 시점마다 재확인 |

**금지 패턴:**
- 한 번의 "공유 동의"로 *세 채널 모두* 활성화
- 친구 그룹 동의가 *자동으로* 익명 게시판 동의로 확장

---

## 6. 백엔드 요구 — 클라이언트-전용 PWA의 한계

| 공유 방식 | 백엔드 필요? | 비고 |
|-----------|:-----------:|------|
| 익명 게시판 | ✅ 필수 | 다중 사용자 콘텐츠 저장·신고·모더레이션 큐 |
| 친구 그룹 | ✅ 필수 | 친구 관계 그래프·접근 제어 |
| 외부 SNS 공유 | ❌ 불필요 | 클립보드 복사 또는 Web Share API |
| 로컬 내보내기 (txt/pdf) | ❌ 불필요 | 클라이언트 생성 후 다운로드 |

**클라이언트-전용 PWA로 시작한다면**: 외부 SNS 공유 + 로컬 내보내기만 지원. 게시판은 백엔드 도입 후 추가.

```ts
// Web Share API — 외부 SNS 공유, 백엔드 불필요
async function shareToSns(maskedText: string) {
  if (navigator.share) {
    await navigator.share({ text: maskedText });
  } else {
    await navigator.clipboard.writeText(maskedText);
    // fallback: 복사됨 알림
  }
}
```

---

## 7. 콘텐츠 모더레이션 — 짝 스킬 활용

폭력·자해·성적 묘사·아동 안전·차별 발언 등은 *자동 분류 + 휴먼 리뷰* 2층 구조 권장.

**짝 에이전트:** `validation/dream-safety-classifier` (이 스킬과 함께 사용)

**Tier 기반 처리** (참고: [Sightengine self-harm guide](https://sightengine.com/self-harm-mental-health-suicide-moderation-guide)):

| Tier | 콘텐츠 | 처리 |
|------|--------|------|
| Critical | 자해·자살 의도 명시, 아동 성착취 | 즉시 차단 + 위기 핫라인 안내 + 신고 |
| High | 명시적 폭력·성적 묘사, 신상 노출 | 자동 차단 + 휴먼 리뷰 큐 |
| Medium | 차별·괴롭힘 표현 | 게시 유지 + 신고 시 리뷰 |
| Low | 욕설·스팸 | 자동 경고 + 사용자 신고 기반 |

**자해 콘텐츠 특별 처리:**
```tsx
// 자해·자살 의도 감지 시 — 차단 전에 도움말 우선
function handleSelfHarmContent(userId: string) {
  showCrisisResource({
    region: 'KR',
    resources: [
      { name: '자살예방상담전화', tel: '1393' },
      { name: '청소년 사이버상담센터', url: 'https://www.cyber1388.kr/' },
    ],
  });
  blockSharing();
  notifyModerator({ priority: 'urgent' });
}
```

---

## 8. 신고·차단 시스템

[정보통신망법 제44조의2](https://casenote.kr/법령/정보통신망_이용촉진_및_정보보호_등에_관한_법률/제44조의2)는 사생활 침해·명예훼손 정보 게시 시 정보통신서비스 제공자가 삭제요청을 받으면 **지체 없이** 삭제 또는 *임시조치*를 하도록 규정한다. 임시조치는 최대 **30일**.

> 주의: "24시간 내 검토"는 *법적 의무가 아닌 플랫폼 자율 SLA*다. 법은 "지체 없이"로 표현. 사용자 신뢰 측면에서 24시간 SLA를 운영 정책으로 명시하는 것은 권장된다.

**구현 요구:**

```ts
type Report = {
  reportId: string;
  contentId: string;
  reporterId: string;
  reason: 'pii-leak' | 'self-harm' | 'violence' | 'defamation' | 'spam' | 'other';
  reportedAt: Date;
  sla: { ackBy: Date; resolveBy: Date };  // 운영 SLA
  status: 'queued' | 'temp-blocked' | 'reviewing' | 'resolved-removed' | 'resolved-kept';
};

// 신고 즉시 — Critical/High tier는 자동 임시 차단
async function handleReport(report: Report) {
  if (['self-harm', 'pii-leak'].includes(report.reason)) {
    await tempBlock(report.contentId, { maxDays: 30 });  // 법적 임시조치 한계
  }
  await enqueueModeration(report);
  await notifyReporter(report.reporterId, { ackBy: report.sla.ackBy });
}
```

**기록 의무:** 신고·처리 이력은 *최소 사건 처리 종결 후 일정 기간 보관*. 정확한 보관 기간은 정보통신망법 시행령·운영 정책·법적 자문에 따라 결정.

---

## 9. 미성년자 보호

> 주의 (한국 법규): [개인정보보호법 제22조의2](https://casenote.kr/법령/개인정보보호법/제22조의2)에 따라 **만 14세 미만 아동의 개인정보를 처리하려면 법정대리인 동의 필수**. 위반 시 5년 이하 징역 또는 5천만원 이하 벌금, 매출의 3% 이내 과징금.

**기본 정책:**
- 만 14세 미만: *공유 기능 자체 비활성* 또는 *법정대리인 동의 후* 제한적 허용
- 만 14~18세: 청소년 게시판 별도 + 성인 게시판 격리
- 연령 자기 신고만으로 부족 — 결제 인증 등 *추가 검증*은 정책에 따라

```ts
type User = {
  id: string;
  birthYear: number;
  parentalConsentVerified: boolean;
  ageGroup: 'under14' | 'teen14-18' | 'adult';
};

function canShareToBoard(user: User, board: 'general' | 'teen'): boolean {
  if (user.ageGroup === 'under14' && !user.parentalConsentVerified) return false;
  if (user.ageGroup === 'under14') return board === 'teen';
  if (user.ageGroup === 'teen14-18') return board === 'teen';
  return true;
}
```

> 주의: 법정대리인 동의 *확인 방법*(휴대전화 문자·카드 정보·본인인증 등)은 [개인정보보호위원회 가이드라인](https://www.privacy.go.kr/front/contents/cntntsView.do?contsNo=94) 참조 후 변호사 자문으로 확정.

---

## 10. 사용자 권리 — 삭제·수정 요청

**자기 게시물 권리:**
- 언제든 *즉시* 삭제 (서버 측 hard delete 또는 tombstone)
- 수정 가능 — 단, 익명 게시판은 *수정 이력* 표기 검토

**타인 게시물 권리:**
- 자신에 관한 콘텐츠 *수정·삭제 요청* (정보통신망법 제44조의2)
- 요청 처리 SLA 명시 (예: 영업일 기준 N일)

```tsx
// 게시물 카드 — 메뉴 옵션
<Menu>
  {isAuthor && <MenuItem onClick={onDelete}>삭제</MenuItem>}
  {isAuthor && <MenuItem onClick={onEdit}>수정</MenuItem>}
  {!isAuthor && <MenuItem onClick={onReport}>이 글이 본인을 특정한다면 신고</MenuItem>}
</Menu>
```

**GDPR·개인정보보호법 데이터 주체 권리:**
- 열람권·정정권·삭제권·처리정지권
- 계정 삭제 시 *익명 게시물도 삭제* (또는 익명화 완료 명시)

---

## 11. 흔한 함정 (Anti-patterns)

| 함정 | 설명 | 대응 |
|------|------|------|
| 자동 마스킹 신뢰 | "AI가 다 가렸겠지" | 사용자 검토 UX 필수 (섹션 3) |
| 재식별 위험 무시 | k-anonymity만 믿고 끝 | 명시적 고지 + quasi-identifier 일반화 (섹션 4) |
| 채널 동의 통합 | 한 번 동의 = 모든 채널 | 채널별 분리 (섹션 5) |
| 모더레이션 부재 | 신고 들어와도 처리 없음 | 신고 큐 + SLA 운영 (섹션 8) |
| 미성년자 처리 누락 | 연령 검증 없이 가입 허용 | 만 14세 미만 차단·동의 (섹션 9) |
| 외부 LLM PII 전송 | 마스킹용으로 원문을 클라우드 LLM에 보냄 | 사용자 고지 + 동의, 또는 온디바이스 NER |
| Hard delete만 운영 | 신고 처리 흔적이 사라짐 | tombstone + 감사 로그 |
| 청소년 콘텐츠 혼재 | 일반 게시판에 청소년도 노출 | 게시판 분리 + 콘텐츠 등급 |
| RRN(주민번호) 평문 저장 | 마스킹 전 원본 DB 저장 | 입력 자체 회피, 받으면 즉시 폐기 |
| "24시간 SLA" 법적 의무 오인 | 법은 "지체 없이"임 | 자율 SLA로 표기, 법적 의무와 구분 |

---

## 12. 짝 스킬·에이전트

- `humanities/dream-content-privacy-ethics` — 꿈 콘텐츠의 윤리·프라이버시 철학적 토대
- `validation/dream-safety-classifier` (에이전트) — 자해·폭력·성적 묘사 자동 분류

이 스킬은 *기술 패턴*에 집중한다. 윤리·법적 판단은 짝 스킬과 변호사 자문에 위임한다.

---

## 13. 출시 전 체크리스트

- [ ] 옵트인 토글이 *기본 OFF*인가
- [ ] 채널별 동의가 *분리*되어 있는가
- [ ] 정규식 + NER + 사용자 검토 *3단계 마스킹*이 모두 있는가
- [ ] 재식별 위험 *고지문*이 동의 화면에 있는가
- [ ] 자해·폭력 *Critical tier* 자동 차단 + 위기 핫라인이 있는가
- [ ] 만 14세 미만 *공유 차단* 또는 *법정대리인 동의* 흐름이 있는가
- [ ] 청소년 게시판이 *성인 게시판과 격리*되어 있는가
- [ ] 신고 큐 + SLA(예: 24시간 자율 SLA)가 운영되는가
- [ ] 임시조치 *30일 한계*가 시스템에 반영되어 있는가
- [ ] 자기 게시물 *언제든 삭제* 가능한가
- [ ] **상업 출시 전 변호사 자문 완료**
