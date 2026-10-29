---
name: project-lfmall-sync-2026-10-29
description: lfmall v1.1.1 이후 변경을 항목별로 골라 gugbab 에 반영 (브랜치 feat/lfmall-sync-2026-10-29) — 무엇을 가져오고 뺐는지
metadata:
  node_type: memory
  type: project
  originSessionId: e56d6dae-5bbb-4b87-9782-cf342f4a6e7a
  modified: 2026-10-29T01:13:41.664Z
---

2026-10-29 lfmall 세션 인수인계 목록(A1~A8·B1~B3·C1~C6)을 사용자가 한 항목씩 대화로 결정. 브랜치 `feat/lfmall-sync-2026-10-29`, 커밋 전.

- 가져옴: `/harness` 설명칸(A1·A2·A7·A8), `.gugbab.json` 건너뜀 한 번 안내(A3), bin.test 격리(A6), 윈도우 훅 시험 시간 한도 2곳(A5 중 2·3번), 스택 전용 17개 기본 끔(B1 — lfmall 16개 + `rust.md`), 필수 의존 typescript-backend-developer → typescript.md(B3)
- 프리셋(B2): **넥사크로만** 개발 공통 + 넥사크로로. nextjs 는 TS 백엔드 포함 그대로(ts-backend 애드온 안 만듦)
- 안 가져옴: install.ps1 줄바꿈(A4 — gugbab main 에 .gitattributes 있어 해당 없음), C 묶음 전부(사내 npm·Bitbucket·배포 항목 9개 삭제 — gugbab 은 Vercel 등 씀)
- 기존 프로젝트 기록은 손대지 않음. 프리셋 없이 쓰던 프로젝트(00_gugbab-claude·lf·workspace 등)는 업데이트 뒤 17개가 꺼짐, 프리셋 쓴 프로젝트는 다른 스택 항목만 꺼짐

**Why:** 사용자 지시 "최소한으로 가져와", "프리셋에 불필요한 다른 스택이 안 들어가게".
**How to apply:** lfmall 에서 또 변경이 오면 같은 방식(항목별 대화형 결정, 권장안 제시)으로. 관련 [[project-harness-status-2026-10-15]]
