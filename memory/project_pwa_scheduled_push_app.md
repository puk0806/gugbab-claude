---
name: project-pwa-scheduled-push-app
description: "PWA 예약 푸시 앱(사용자 6명·하루 5회·사용자별 지정 시각, Android+iOS, Vercel 무료) 설계 결정과 2026-09-17 정비한 스킬 2종(vercel-workflow·drizzle-neon-postgres) — 실제 앱 프로젝트는 아직 미착수"
metadata: 
  node_type: memory
  type: project
  originSessionId: 16075c81-e3a0-4e2e-85c3-bc26e3d9b622
  modified: 2026-09-17T06:06:09.951Z
---

# PWA 예약 푸시 앱 계획 (2026-09-17)

**요구**: 지인 6명 규모, 하루 5회쯤 사용자가 지정한 시각에 폰이 울리는 앱. Android·iOS 모두. 무료 운영.

**핵심 결정 (2026-09-17)**:
- 순수 PWA(Next.js App Router, Vercel) + Web Push(VAPID) + 서비스워커. Capacitor 안 씀.
- **스케줄러 = Vercel Workflow** (`workflow` 패키지). 사용자별 런 1개가 `sleep(Date) → 발송 스텝 → 반복` 루프. Hobby 월 5만 이벤트 중 약 14.5% 사용 예상.
  - Vercel Cron은 Hobby가 하루 1회·±59분이라 부적합. 외부 cron-job.org는 차선.
  - **`sleepUntil()`은 이 SDK에 없다** — `sleep(Date)` 오버로드 사용 (skill-creator 교차 검증에서 DISPUTED로 정정). 세션 초반에 사용자에게 sleepUntil이라고 말한 건 오류.
  - 시각 변경: 새 런 시작 → CAS 교체 → 옛 런 취소 순서 (중복 발송 방지).
- **저장소 = Drizzle + Neon Postgres(neon-http)**. 구독 endpoint·p256dh·auth + 알림 시각. 마이그레이션은 `DATABASE_URL_UNPOOLED`.
- Claude 토큰/relay(05)는 스케줄러가 될 수 없음(요청 시에만 실행). 알림 *내용* 생성에만 선택적으로 사용. 세션의 `PushNotification` 도구·`/schedule` 루틴은 앱 푸시와 무관.
- iOS: 16.4+ 홈 화면 설치 PWA만, 권한은 탭 제스처 안에서, `display: standalone`. iOS 18.4+ Declarative Web Push(`"web_push": 8030`)는 보완용.

**정비한 자산**: `devops/vercel-workflow`·`backend/drizzle-neon-postgres` 신설(둘 다 APPROVED), `frontend/pwa-push-notifications` §8-1 보강. 설치 스크립트 `VERCEL_SERVERLESS_SKILLS`로 nextjs(3)·health(10)만 포함. 에이전트 신설 없음. 기존 관련 스킬: `frontend/pwa-push-notifications`, `frontend/daily-fortune-retention-loop`(발송 시각 개인화), `frontend/mobile-seo-pwa`.

**다음 단계**: 알림 내용이 고정 문구인지 Claude 생성인지 결정 → tech-stack-advisor/project-scaffolder로 새 프로젝트(예: 06_) 부트스트랩 → 템플릿 3(nextjs)로 export. 관련: [[project-claude-relay-plan]] (내용 생성 시 relay 재사용), [[project-install-architecture]].
