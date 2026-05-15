---
name: emotion-tagging-input
description: >
  꿈 입력 시 사용자가 *꿈에서 느낀 감정*을 메타데이터로 태깅하는 UI 패턴.
  Ekman 6 / Plutchik 8 / Russell 2D 등 학술 감정 분류 체계와 이모지 그리드·슬라이더 2축·다중 선택 칩·자유 텍스트 입력 UI, 접근성(WCAG·WAI-ARIA), 흔한 함정을 정리.
  <example>사용자: "꿈 일기 앱에서 감정을 어떻게 입력받게 할지 추천해줘"</example>
  <example>사용자: "Plutchik wheel을 모바일 UI로 구현하려면?"</example>
  <example>사용자: "이모지 감정 선택기에 접근성을 어떻게 적용해?"</example>
---

# 꿈 일기 — 감정 태깅 입력 UI 스킬

> 소스: Ekman 1992 *Cognition and Emotion* 6(3/4), 169-200 / Plutchik 1980 *Emotion: Theory, Research, and Experience* (Academic Press) ch. 1 / Russell 1980 *J. Pers. Soc. Psychol.* 39(6), 1161-1178 / W3C WCAG 2.1 SC 1.4.1 / WAI-ARIA / Hick 1952
> 검증일: 2026-05-15

---

## 0. 언제 이 스킬을 쓰는가

- 꿈 일기·감정 기록·기분 추적·저널링 앱에서 **감정 메타데이터를 입력받는 UI**를 설계할 때
- 자유 텍스트로만 받기보다 **구조화된 감정 태그**가 필요할 때 (통계·검색·해몽 컨텍스트 활용)
- 학술적 근거가 있는 감정 분류 체계를 선택해야 할 때

> **연계 스킬:**
> - `architecture/dream-journal-data-modeling` — `emotions[]` 다중값 인덱스 스키마
> - `meta/dream-interpretation-prompt-engineering` — 감정을 LLM 해몽 컨텍스트로 주입
> - `frontend/dream-symbol-tagging` — 상징 태깅과 함께 사용

---

## 1. 감정 분류 체계 (Taxonomy) — 학술 근거

### 1.1 Ekman 6 (+1) 기본 감정 — 보편 표정 이론

**출처:** Ekman, P. (1992). An argument for basic emotions. *Cognition and Emotion*, 6(3/4), 169-200.

| 감정 | 영문 | 한국어 표기 권장 |
|------|------|------|
| Happiness | happiness | 행복 / 기쁨 |
| Sadness | sadness | 슬픔 |
| Fear | fear | 두려움 |
| Anger | anger | 분노 |
| Surprise | surprise | 놀람 |
| Disgust | disgust | 혐오 |
| **(+1) Contempt** | contempt | 경멸 |

- Ekman은 1990년대에 **contempt(경멸)** 를 7번째 후보로 추가했으나, 보편 인식 증거는 6개보다 약함.
- 장점: 가장 직관적, 6~7개라 결정 부담 적음 (Hick's law 적합)
- 단점: **복합 감정**(불안+슬픔 등) 표현 어려움, **강도(intensity)** 없음

> **주의:** Ekman의 보편성 주장은 후속 연구에서 일부 도전받음 (Gendron et al. 2018; Nature Sci Rep 2023 등). "보편 감정"이라는 단정적 표현보다 "널리 인식되는 핵심 감정"이 안전.

### 1.2 Plutchik 8 + 강도 — 진화론적 감정 휠

**출처:** Plutchik, R. (1980). A general psychoevolutionary theory of emotion. In R. Plutchik & H. Kellerman (Eds.), *Emotion: Theory, Research, and Experience* (Vol. 1, pp. 3-33). Academic Press.

**8 primary emotions (4 bipolar 쌍):**
- joy ↔ sadness
- trust ↔ disgust
- fear ↔ anger
- surprise ↔ anticipation

**3 단계 강도** (안쪽 = 강함, 바깥 = 약함):

| Primary | 강함 (내) | 중간 | 약함 (외) |
|---------|-----------|------|-----------|
| joy | ecstasy 황홀 | joy 기쁨 | serenity 평온 |
| trust | admiration 흠모 | trust 신뢰 | acceptance 수용 |
| fear | terror 공포 | fear 두려움 | apprehension 우려 |
| surprise | amazement 경악 | surprise 놀람 | distraction 산만 |
| sadness | grief 비탄 | sadness 슬픔 | pensiveness 시름 |
| disgust | loathing 혐오 | disgust 역겨움 | boredom 지루함 |
| anger | rage 격노 | anger 분노 | annoyance 짜증 |
| anticipation | vigilance 경계 | anticipation 기대 | interest 관심 |

**복합 감정 (dyads):** joy + trust = love, joy + anticipation = optimism, sadness + disgust = remorse, ...

- 장점: **강도 표현 가능**, 복합 감정 구조적 모델, 꿈 앱에 적합 (꿈은 강도·복합성 흔함)
- 단점: 24개 (8×3) 선택지 — Hick's law 부담, UI 복잡도 증가

### 1.3 Russell 2D Circumplex — 차원 모델

**출처:** Russell, J. A. (1980). A circumplex model of affect. *Journal of Personality and Social Psychology*, 39(6), 1161-1178.

**2축:**
- **Valence (쾌-불쾌)** — horizontal axis (−1 ~ +1)
- **Arousal (각성-비각성)** — vertical axis (−1 ~ +1)

**8 reference points (45도 간격):**

```
                arousal+
                   |
   distress   ─────┼─────  excitement
  (불쾌·각성)       |       (쾌·각성)
                   |
displeasure ───────┼─────── pleasure
  (불쾌)           |        (쾌)
                   |
  depression ─────┼─────  relaxation
  (불쾌·비각성)     |       (쾌·비각성)
                   |
                arousal−
                   |
                sleepiness
```

- 장점: **연속적 표현**, 어휘 부담 없음 (좌표만), 학술 표준
- 단점: 사용자에게 "valence/arousal"이 직관적이지 않음 — 라벨링 필요 ("기분 좋음↔나쁨" / "차분함↔흥분")

> **참고:** Russell의 circumplex는 40년+ 다양한 실험에서 일관되게 재현되었으며, 감정·기분 연구에서 가장 많이 인용되는 모델 중 하나.

### 1.4 꿈 일기 앱 권장 선택

| 우선순위 | 체계 | 적합 이유 |
|---------|------|----------|
| **1순위** | **Plutchik 8 (강도는 선택)** | 꿈의 복합·강도 표현, 학술 근거, 모바일 칩 UI 가능 |
| 2순위 | Russell 2D | 빠른 입력, 연속 표현, 어휘 부담 0 |
| 3순위 | Ekman 6 | 가장 단순, 입문자 친화 |

> **하이브리드 권장:** Plutchik 8 primary를 기본으로 보여주고, 사용자가 칩 탭 시 강도 슬라이더가 따라붙는 점진 공개(progressive disclosure).

---

## 2. UI 패턴

### 2.1 이모지 그리드 — Ekman 6 / Plutchik 8

가장 직관적·모바일 친화. **단, 이모지 단독은 접근성 위반.**

```tsx
// React + TypeScript 예시 (Plutchik 8)
import type { PlutchikEmotion } from '@/types/emotion';

interface EmotionChipProps {
  emotion: PlutchikEmotion;
  selected: boolean;
  onToggle: (e: PlutchikEmotion) => void;
}

const EMOTION_META: Record<PlutchikEmotion, { emoji: string; label: string }> = {
  joy:          { emoji: '😊', label: '기쁨' },
  trust:        { emoji: '🤝', label: '신뢰' },
  fear:         { emoji: '😨', label: '두려움' },
  surprise:     { emoji: '😲', label: '놀람' },
  sadness:      { emoji: '😢', label: '슬픔' },
  disgust:      { emoji: '🤢', label: '혐오' },
  anger:        { emoji: '😠', label: '분노' },
  anticipation: { emoji: '🤔', label: '기대' },
};

export function EmotionChip({ emotion, selected, onToggle }: EmotionChipProps) {
  const { emoji, label } = EMOTION_META[emotion];
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={`${label} 감정 ${selected ? '선택됨' : '선택 안 됨'}`}
      onClick={() => onToggle(emotion)}
      className={selected ? 'chip chip--selected' : 'chip'}
    >
      <span aria-hidden="true">{emoji}</span>
      <span className="chip__label">{label}</span>
    </button>
  );
}
```

**핵심:**
- 이모지에 `aria-hidden="true"` — 스크린 리더가 이모지 이름(예: "smiling face with smiling eyes")을 읽지 않게
- 텍스트 라벨로 의미 전달 — 색맹·이모지 미지원 환경 대응
- `role="checkbox"` + `aria-checked` — 다중 선택 의미를 보조 기술에 전달

### 2.2 슬라이더 2축 — Russell 2D

```tsx
interface MoodPickerProps {
  value: { valence: number; arousal: number }; // -1 ~ 1
  onChange: (v: { valence: number; arousal: number }) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="mood-picker" role="group" aria-label="기분 입력">
      <label>
        기분 (불쾌 ↔ 좋음)
        <input
          type="range"
          min={-1}
          max={1}
          step={0.05}
          value={value.valence}
          onChange={(e) => onChange({ ...value, valence: Number(e.target.value) })}
          aria-valuetext={describeValence(value.valence)}
        />
      </label>
      <label>
        각성 (차분함 ↔ 흥분)
        <input
          type="range"
          min={-1}
          max={1}
          step={0.05}
          value={value.arousal}
          onChange={(e) => onChange({ ...value, arousal: Number(e.target.value) })}
          aria-valuetext={describeArousal(value.arousal)}
        />
      </label>
    </div>
  );
}

function describeValence(v: number) {
  if (v < -0.5) return '매우 불쾌';
  if (v < 0)    return '약간 불쾌';
  if (v < 0.5)  return '약간 좋음';
  return '매우 좋음';
}
```

**2D 트랙패드 변형:** 정사각형 영역에서 드래그 한 번으로 (valence, arousal) 동시 입력 — 데스크톱에 적합, 모바일은 슬라이더 분리 권장.

### 2.3 다중 선택 칩 — Plutchik

- 칩 그리드 (2~3열 모바일)
- 선택 시 강도 슬라이더 점진 공개 (3단계: 약·중·강)
- 최대 선택 개수 제한 권장 (3~5개) — 결정 마비 방지

### 2.4 자유 텍스트 + 자동 매핑 (LLM)

- 사용자 입력: "긴장되고 누가 쫓아오는 느낌"
- LLM이 Plutchik 태그로 매핑: `[fear: strong, anticipation: medium]`
- 항상 **사용자 확인 단계** 필요 (LLM 오분류 가능)
- 프롬프트 예: "다음 한국어 감정 묘사를 Plutchik 8 primary 감정과 강도(low/medium/high)로 매핑. JSON만 반환."

---

## 3. 접근성 (Accessibility)

> 근거: W3C WCAG 2.1 SC 1.4.1 (Use of Color) / WAI-ARIA Authoring Practices

### 3.1 이모지 단독 금지

| 패턴 | 평가 |
|------|------|
| `<button>😊</button>` | **금지** — 스크린 리더가 "smiling face with smiling eyes button" 등 비의미 음성 |
| `<button>😊 기쁨</button>` | OK — 텍스트 병행 |
| `<button><span aria-hidden="true">😊</span>기쁨</button>` | **권장** — 이모지는 장식, 텍스트로 의미 전달 |
| `<button aria-label="기쁨">😊</button>` | OK — 이모지 숨김 효과 + 라벨 명시 |

### 3.2 색상 단독 금지 (WCAG 1.4.1)

긍정 = 노랑, 부정 = 파랑 같이 **색상만으로 감정을 구분하면 색맹 사용자에게 정보 손실**.

| 잘못 | 올바름 |
|------|--------|
| 칩 배경색만 다름 | 색 + **아이콘 모양** + **텍스트 라벨** |
| valence 슬라이더 빨강↔초록 단독 | 색 + **양 끝 텍스트 라벨** ("불쾌"/"좋음") |

### 3.3 키보드·포커스

- 칩 그룹: 화살표 키 이동, Space로 토글, Tab으로 그룹 진입/이탈
- 슬라이더: 좌우/상하 키 ±step, Home/End로 최소/최대
- 포커스 링 명확히 (`outline` 제거 금지)

### 3.4 스크린 리더 안내

```tsx
<fieldset>
  <legend>꿈에서 느낀 감정 (복수 선택 가능, 선택 사항)</legend>
  <div role="group" aria-describedby="emotion-help">
    {/* chips */}
  </div>
  <p id="emotion-help" className="sr-only">
    8가지 감정 중 해당하는 것을 모두 선택하세요. 선택하지 않아도 저장 가능합니다.
  </p>
</fieldset>
```

---

## 4. 꿈 내용과의 통합 (데이터 연계)

### 4.1 스키마 예 (IndexedDB / Dexie)

```ts
// dreams 테이블
interface DreamRecord {
  id: string;
  content: string;
  emotionsDuring: EmotionTag[];   // 꿈 중 감정
  emotionsAfter: EmotionTag[];    // 깬 직후 감정 (선택)
  createdAt: Date;
}

interface EmotionTag {
  type: PlutchikEmotion;          // 'joy' | 'fear' | ...
  intensity?: 'low' | 'medium' | 'high';
  // 또는 Russell 2D
  // valence?: number; arousal?: number;
}

// Dexie 다중값 인덱스
db.version(2).stores({
  dreams: 'id, createdAt, *emotionsDuring.type, *emotionsAfter.type',
  //                     ^ multi-entry index for filtering
});
```

> 자세한 스키마는 짝 스킬 `architecture/dream-journal-data-modeling` 참조.

### 4.2 해몽 LLM 프롬프트 컨텍스트로 전달

```
[꿈 내용]
{content}

[사용자가 태깅한 감정]
- 꿈 중: fear(high), anticipation(medium)
- 깬 직후: sadness(low)

위 감정 메타데이터를 참고하여 ...
```

> 자세한 프롬프트 설계는 짝 스킬 `meta/dream-interpretation-prompt-engineering` 참조.

---

## 5. 시간성 — 꿈 중 vs 깬 직후

| 시점 | 의미 | 입력 권장 |
|------|------|----------|
| **During (꿈 중)** | 꿈속 자아가 느낀 감정 | 1차 입력 (필수 아님) |
| **After (깬 직후)** | 깬 후 회상하며 느낀 감정 | 2차 입력 (선택, 토글로 펼침) |

- 두 시점은 종종 다름 (예: 꿈에서는 평온했는데 깨고 나니 슬픔)
- 분리 입력 시 **회상 편향(recall bias) 일부 완화** (Hall & Van de Castle 1966 — 깬 후 회상 시 부정 감정 과대 평가 경향)
- UX: 깬 직후는 **접힌 채로 시작**, 필요한 사용자만 펼치게 (Hick's law 부담 완화)

---

## 6. 통계 활용

| 통계 | 의미 | 시각화 권장 |
|------|------|-----------|
| 감정별 꿈 빈도 | 어떤 감정 꿈이 잦은가 | 바 차트, Plutchik 휠에 빈도 매핑 |
| 감정 분포 (월/주별) | 시간에 따른 감정 변화 | 스택 영역 차트, 캘린더 히트맵 |
| 감정-상징 상관 | "비행기 꿈은 anticipation과 잦음" | 상관 행렬, 코사인 유사도 |
| 감정 다양성 지수 | 감정 종류 분산도 | Shannon entropy 수치 |

> Hall & Van de Castle (1966) 정상 분포 참고치: 부정 36% / 긍정 11% / 중립 다수 (외부 평정자 기준) — 사용자 데이터가 이와 크게 다르면 안내·해석 자료로 활용 가능.

---

## 7. 개인정보 (Privacy)

감정 메타데이터는 **GDPR 등에서 민감 정보(special category)에 가까운 데이터**로 취급되는 경우가 있다. 다음을 원칙으로 한다:

- **로컬 저장 우선** — IndexedDB 등 디바이스에 저장, 서버 전송 최소화
- **명시적 동의** — 클라우드 백업·통계 공유는 명시 동의 후
- **익명화 통계** — 집계 데이터로만 외부 전송
- **삭제권** — 감정 태그 단독 삭제 가능 (꿈 본문 유지하면서)

---

## 8. 흔한 함정 (Anti-patterns)

### 8.1 너무 많은 선택지 — 결정 마비

**근거:** Hick's law (Hick 1952; Hyman 1953) — 결정 시간은 선택지 수에 **로그적**으로 증가하지만, 너무 많으면 인지 부담이 커져 입력 자체를 포기하게 됨.

- 잘못: Plutchik 24개 (8×3)를 한 화면에 다 표시
- 옳음: 8 primary만 1차 표시, 선택 시 강도 슬라이더 점진 공개

### 8.2 이모지 의미의 문화 차이

- 🙏 — 서구: 기도 / 일본: 감사 / 태국: 사과 / 무슬림 사용자에게 이질감 (이슬람 기도는 🤲)
- 😅 — 안도/당황/어색 등 다의적
- 😇 — 서구: 천진 / 중국: 죽음·위협 상징
- 👏 — 서구: 박수 / 중국: 성적 함의
- 👌 — 미국: OK / 브라질: 모욕 / 프랑스: 0 / 일본: 돈

**대응:**
- **텍스트 라벨 병행 필수** — 이모지는 보조 시각 단서로만
- 다국가 서비스라면 이모지 선택을 신중하게 (보편적인 표정 위주)
- 사용자 커스텀 이모지 허용 옵션 고려

### 8.3 단일 감정 강제

꿈은 **복합 감정**이 흔하다 (예: 두려움 + 기대, 슬픔 + 안도).
- 잘못: 라디오 버튼으로 1개만 선택
- 옳음: 체크박스/칩으로 복수 선택 + 최대 N개 가이드

### 8.4 입력 강제로 진행 차단

감정 회상이 어려운 경우 (특히 깬 직후, 비명료한 꿈), 입력 강제는 UX 마찰을 만들고 **꿈 기록 자체를 포기**하게 만든다.

- 잘못: "감정을 1개 이상 선택해야 저장 가능"
- 옳음: **선택 사항(optional)** 명시, 미입력 시 빈 배열로 저장
- 데이터 분석 시 미입력과 "중립"을 구분 (`null` vs `[]` vs `['neutral']`)

### 8.5 색상만으로 감정 구분 (WCAG 1.4.1 위반)

- 잘못: 긍정 감정 = 노랑 칩 / 부정 감정 = 파랑 칩 (텍스트·아이콘 없음)
- 옳음: 색 + 아이콘 모양 + 텍스트 라벨

### 8.6 강도 입력을 강제

- Plutchik 강도 슬라이더를 모든 감정마다 강제하면 입력 시간 폭증
- 강도는 **선택 입력**, 미입력 시 default 'medium' 또는 `undefined`

### 8.7 LLM 자동 매핑 결과를 사용자 확인 없이 저장

- 잘못: 자유 텍스트 → LLM 분류 → 그대로 저장
- 옳음: LLM 분류 → 미리보기 칩 표시 → 사용자 수정/확인 → 저장

---

## 9. 권장 기본값 (Defaults)

학습 앱·꿈 일기 앱 기본값:

| 항목 | 권장값 |
|------|-------|
| 분류 체계 | Plutchik 8 primary (강도는 선택 입력) |
| UI 패턴 | 이모지+텍스트 칩 다중 선택 |
| 최대 선택 개수 | 5개 (가이드만, 강제 X) |
| 시간 구분 | "꿈 중"만 기본 표시, "깬 직후"는 접힌 상태 |
| 필수 여부 | **선택 사항** (입력 안 해도 저장) |
| 접근성 | role="checkbox", aria-label, 이모지 aria-hidden |

---

## 10. 체크리스트

스킬을 적용할 때 다음을 확인:

- [ ] 분류 체계가 학술 근거 있는가 (Ekman / Plutchik / Russell)
- [ ] 선택지 수가 Hick's law 부담을 넘지 않는가 (1차 화면 ≤ 8개 권장)
- [ ] 이모지에 텍스트 라벨이 병행되는가
- [ ] 이모지에 `aria-hidden="true"` 또는 적절한 `aria-label`이 있는가
- [ ] 색상 외의 시각 단서(아이콘·텍스트)가 있는가 (WCAG 1.4.1)
- [ ] 키보드만으로 모든 선택이 가능한가
- [ ] 다중 선택이 가능한가 (꿈은 복합 감정 흔함)
- [ ] 입력이 선택 사항으로 설정되어 있는가
- [ ] 로컬 저장이 기본이고 클라우드 전송은 명시 동의 후인가
- [ ] 감정 데이터가 해몽 LLM 컨텍스트에 메타로 전달되는가
- [ ] 꿈 중 vs 깬 직후를 분리 입력할 수 있는가 (선택)

---

## 참고 문헌

1. Ekman, P. (1992). An argument for basic emotions. *Cognition and Emotion*, 6(3/4), 169-200. https://doi.org/10.1080/02699939208411068
2. Plutchik, R. (1980). A general psychoevolutionary theory of emotion. In R. Plutchik & H. Kellerman (Eds.), *Emotion: Theory, Research, and Experience* (Vol. 1, pp. 3-33). Academic Press.
3. Russell, J. A. (1980). A circumplex model of affect. *Journal of Personality and Social Psychology*, 39(6), 1161-1178. https://doi.org/10.1037/h0077714
4. Hall, C. S., & Van de Castle, R. L. (1966). *The Content Analysis of Dreams*. Appleton-Century-Crofts.
5. Hick, W. E. (1952). On the rate of gain of information. *Quarterly Journal of Experimental Psychology*, 4(1), 11-26.
6. W3C. (2018). *WCAG 2.1: Success Criterion 1.4.1 Use of Color*. https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html
7. W3C. *WAI-ARIA Authoring Practices Guide*. https://www.w3.org/WAI/ARIA/apg/
