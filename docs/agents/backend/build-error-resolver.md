# build-error-resolver

## 개요

- **역할**: 빌드/컴파일/타입 에러를 전담 진단하고 수정하는 에이전트. Rust(cargo), TypeScript(tsc), React(Vite/webpack) 에러 메시지를 분석해 근본 원인과 최소 수정 방안을 제시한다.
- **모델**: sonnet
- **도구**: Read, Edit, Glob, Grep, Bash
- **카테고리**: backend

## 사용 시점

- `cargo build` / `cargo check` 에러가 발생했을 때
- `tsc` 타입 에러가 여러 개 동시에 발생했을 때
- Vite/webpack 빌드 실패 시 (모듈 해결 실패, 플러그인 에러 등)
- 연쇄 에러가 발생해 최초 원인을 파악해야 할 때
- 새 기능 구현이 아닌 순수 에러 해결이 목적일 때

## 사용 예시

- "cargo build 에러 나는데 고쳐줘" (에러 메시지 붙여넣기)
- "tsc 타입 에러 10개 한 번에 잡아줘"
- "Vite 빌드 실패했어. cannot find module ... 에러"

## 입력/출력

- **입력**: 에러 메시지(터미널 출력), 에러가 발생한 프로젝트 경로
- **출력**: 에러 유형 분류, 근본 원인 분석, Edit을 통한 최소 수정 적용, 빌드 검증 결과

## 관련 에이전트

- **rust-backend-developer** (backend) -- Rust 코드 구현 전담. 빌드 에러가 구현 과정에서 발생한 경우 협업
- **rust-backend-architect** (backend) -- 아키텍처 수준의 구조 문제로 에러가 반복될 때 참고
- **frontend-developer** (frontend) -- TypeScript/React 코드 구현 전담. 프론트엔드 빌드 에러의 원인이 구현에 있을 때 협업
