# CLAUDE.md — {프로젝트명}

건강·식단 PWA 앱 — {프로젝트 한 줄 설명}

---

## 필수 원칙

- 복잡한 작업 전 계획 확인 → @.claude/rules/task-workflow.md

---

## 금지 사항

<!-- common-rules -->
- `any` 타입 사용 금지 — `unknown` + 타입 가드로 대체
- `console.log` 프로덕션 코드에 남기지 않기
- 건강 수치를 의료 진단·처방 목적으로 사용하거나 그런 인상을 주는 표현 금지
- 사용자 식단·건강 데이터를 서버로 전송하거나 외부에 노출 금지 (로컬 전용)

---

## 건강·식단 도메인 규칙

### 영양 계산 기준
- 한국인 영양소 섭취기준(KDRIs 2020, 보건복지부) 기반으로 계산
- 칼로리 상수: 탄수화물 4kcal/g · 단백질 4kcal/g · 지방 9kcal/g
- 에너지 적정비율 (19-64세): 탄 55-65% · 단 7-20% · 지 15-30%
- 나트륨: 2,300mg/일 미만 권장 (한국인 과다섭취 주의)
- 관련 스킬: `health/nutrition-basics`

### 식품 데이터
- 한국 식품 영양 데이터: 식품안전나라(식약처) 또는 농촌진흥청 국가표준식품성분표 기준
- 공공데이터포털 식품영양성분 API: https://www.data.go.kr/data/15127578/openapi.do
- 음식명·양 기반 AI 추정 시 오차 범위(±15~25%) 사용자에게 반드시 안내
- 가공식품: 포장지 영양성분표 우선, DB는 참고용
- 관련 스킬: `health/korean-food-nutrition`

### 식재료 관리
- 식재료 상태: expired / urgent(≤3일) / warning(≤7일) / fresh / no_expiry
- 로컬 저장: IndexedDB(Dexie.js) 기반 — `health/ingredient-management` 스킬 참조
- 인덱스 필드: `category`, `storageLocation`, `expiryDate`
- 유통기한 알림: Notification API + Service Worker

### Claude AI 연동
- 식단 추천 프롬프트: `health/meal-recommendation-prompt` 스킬 참조
- 영양 분석 프롬프트: `health/nutrition-analysis-prompt` 스킬 참조
- 프론트엔드 직접 호출: `frontend/claude-api-streaming-frontend` 스킬 참조
- 모델: `claude-sonnet-4-6`
- 건강 관련 AI 응답에 반드시 "참고용 수치이며 전문의 상담 권장" 면책 문구 포함

### PWA 로컬 저장
- 백엔드 DB 없음 — 모든 데이터는 IndexedDB에만 저장
- 오프라인 지원 필수 — Service Worker 캐시 전략 명시
- 관련 스킬: `frontend/indexeddb-dexie`, `frontend/pwa-service-worker`

---

## 규칙 참조

| 상황 | 참조 파일 |
|------|----------|
| 작업 착수 전 확인 | @.claude/rules/task-workflow.md |
| Git 커밋 컨벤션 | @.claude/rules/git.md |
| 외부 정보 조사·검증 | @.claude/rules/info-verification.md |
| TypeScript 코딩 규칙 | @.claude/rules/typescript.md |
| 에이전트 설계·작성 | @.claude/rules/agent-design.md |
| 슬래시 커맨드 작성 | @.claude/rules/commands.md |
| README 업데이트 | @.claude/rules/readme-update.md |
