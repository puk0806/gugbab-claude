# rust-backend-developer

## 개요

- **역할**: Rust + Axum 백엔드 코드 구현 전담 에이전트. 핸들러, 서비스, 라우터, Claude API 연동, 파일 업로드 등 실제 코드를 작성하고 컴파일 에러를 분석/수정한다.
- **모델**: sonnet
- **도구**: Read, Write, Edit, Glob, Grep, Bash
- **카테고리**: backend

## 사용 시점

- Axum 핸들러, 서비스, 라우터 등 실제 백엔드 코드를 작성할 때
- Claude API 연동 코드(SSE 스트리밍 등)를 구현할 때
- 파일 업로드(multipart) 엔드포인트를 구현할 때
- Rust 컴파일 에러(borrow checker, lifetime 등)를 수정할 때
- 새 의존성 추가와 함께 코드를 작성할 때
- 프로젝트에 존재하는 백엔드 스킬 패턴을 적용해 코드를 작성할 때

## 사용 예시

- "채팅 메시지를 받아서 Claude API로 스트리밍 응답하는 핸들러 만들어줘"
- "파일 업로드 엔드포인트 구현해줘. multipart로 받아서 파싱하고 저장"
- "borrow checker 에러 나는데 고쳐줘" (Rust 컴파일 에러 붙여넣기)

## 입력/출력

- **입력**: 구현 요청(엔드포인트 스펙, 기능 요구사항), 컴파일 에러 메시지, 프로젝트 경로
- **출력**: 작성/수정된 파일 목록, 주요 구현 내용 요약, `cargo check` 통과 확인 결과

## 관련 에이전트

- **rust-backend-architect** (backend) -- 아키텍처 수준 질문은 이 에이전트에 위임
- **build-error-resolver** (backend) -- 복잡한 빌드 에러 해결 전담
- **frontend-developer** (frontend) -- 프론트엔드와 API 연동 시 협업
