@.claude/rules/rust.md
@.claude/rules/java.md

## 백엔드 에이전트 규칙

이 디렉토리의 에이전트가 코드를 작성할 때 위 코딩 규칙을 해당 언어에 맞춰 따른다. Rust·Java 두 언어 에이전트가 이 디렉토리에 함께 존재하지만, 실제로는 선택한 템플릿(rust-axum 또는 java-spring-*)에 맞는 한쪽만 설치되는 것이 보통이다 — 설치되지 않은 언어의 에이전트·위 임포트 규칙은 무시한다.

- Rust 에이전트(`rust-backend-architect`, `rust-backend-developer`, `build-error-resolver` — 설치된 경우) → Rust 규칙 적용
- Java 에이전트(`java-backend-architect`, `java-backend-developer` — 설치된 경우) → Java 규칙 적용 (레거시 SB 2.5 + 모던 SB 3.x 모두 커버)
