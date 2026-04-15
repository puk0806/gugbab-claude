---
skill: jwt-auth
category: backend
version: v1
date: 2026-04-07
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | jwt-auth |
| 스킬 경로 | .claude/skills/jwt-auth/SKILL.md |
| 최초 작성일 | 2026-04-07 |
| 검증 방법 | skill-creator 에이전트 (creation-workflow 준수) |
| 버전 기준 | jsonwebtoken 9.x / axum 0.8.x |
| 현재 상태 | **VERIFIED_WITH_CAVEATS** |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| jsonwebtoken 공식 docs.rs | https://docs.rs/jsonwebtoken/latest/jsonwebtoken/ | High |
| jsonwebtoken GitHub | https://github.com/Keats/jsonwebtoken | High |
| axum 공식 docs.rs (middleware) | https://docs.rs/axum/latest/axum/middleware/ | High |
| axum 공식 docs.rs (extract) | https://docs.rs/axum/latest/axum/extract/ | High |

---

## fact-checker 검증 결과

### CONFIRMED 항목

| 클레임 | 검증 결과 | 근거 |
|--------|-----------|------|
| `encode<T: Serialize>(header, claims, key) -> Result<String>` | CONFIRMED | docs.rs/jsonwebtoken 공식 API |
| `decode<T: DeserializeOwned>(token, key, validation) -> Result<TokenData<T>>` | CONFIRMED | docs.rs/jsonwebtoken 공식 API |
| `Header::default()` 는 HS256 사용 | CONFIRMED | docs.rs Header 문서 |
| `Validation::new(Algorithm)` 생성자 | CONFIRMED | docs.rs Validation 문서 |
| `validate_exp` 기본값 true | CONFIRMED | docs.rs Validation 필드 문서 |
| `leeway` 기본값 60초 | CONFIRMED | docs.rs Validation 필드 문서 |
| `EncodingKey::from_secret(&[u8])` | CONFIRMED | docs.rs EncodingKey 문서 |
| `EncodingKey::from_rsa_pem(&[u8])` | CONFIRMED | docs.rs EncodingKey 문서 |
| `DecodingKey::from_secret(&[u8])` | CONFIRMED | docs.rs DecodingKey 문서 |
| `DecodingKey::from_rsa_pem(&[u8])` | CONFIRMED | docs.rs DecodingKey 문서 |
| `ErrorKind::ExpiredSignature` 존재 | CONFIRMED | docs.rs errors 모듈 |
| `ErrorKind::InvalidSignature` 존재 | CONFIRMED | docs.rs errors 모듈 |
| `ErrorKind::InvalidToken` 존재 | CONFIRMED | docs.rs errors 모듈 |
| `axum::middleware::from_fn` 시그니처 | CONFIRMED | docs.rs axum 0.8.x |
| `axum::middleware::from_fn_with_state` | CONFIRMED | docs.rs axum 0.8.x |
| `Extension<T>` 으로 데이터 주입/추출 | CONFIRMED | docs.rs axum extract |

### NEEDS_VERIFICATION 항목

| 클레임 | 상태 | 사유 |
|--------|------|------|
| `required_spec_claims` 기본값 | NEEDS_VERIFICATION | jsonwebtoken 9.x 마이너 버전별로 기본값 변경 이력 있음. SKILL.md에 `> 주의:` 표기 완료 |
| `axum-extra` TypedHeader + Authorization<Bearer> 경로 | NEEDS_VERIFICATION | axum-extra 0.10.x에서 모듈 구조 변경 가능. SKILL.md에서는 직접 헤더 파싱 방식을 기본으로 사용하여 회피 |

### DISPUTED 항목

없음.

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] fact-checker로 핵심 클레임 검증 실행
- [✅] DISPUTED 항목 수정 반영 (해당 없음)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (jsonwebtoken 9.x / axum 0.8.x)
- [✅] 불확실한 항목에 `> 주의:` 표기
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 6/6 PASS)
- [✅] time 의존성 제약 주의사항 SKILL.md에 추가

---

## SKILL.md 내 주의사항 목록

1. 문서 상단: jsonwebtoken 9.x / axum 0.8.x 버전 한정 안내
2. Validation 섹션: `required_spec_claims` 기본값 버전별 차이 가능성
3. TypedHeader 대신 직접 AUTHORIZATION 헤더 파싱 방식 채택 (호환성 우선)

---

## 최종 판정

**APPROVED** — fact-checker 검증 완료 + rust-backend-developer 활용 테스트 6/6 PASS (jsonwebtoken 9.3.1 / axum 0.8.x). time 의존성 제약 주의사항 추가 완료.
