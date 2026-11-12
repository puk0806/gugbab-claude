---
name: code-convention
description: ESLint 10 flat config 전환(eslintrc 제거·v9 EOL·tseslint.config()→defineConfig)과 Biome v2(assist·files.includes) 최신 변경점·버전 기준
---

# 코드 컨벤션 & 품질 도구 패턴

> 소스: https://eslint.org/docs/latest | https://biomejs.dev/docs | https://prettier.io/docs
> 소스: https://eslint.org/blog/2026/02/eslint-v10.0.0-released/ | https://eslint.org/version-support/ | https://biomejs.dev/guides/upgrade-to-biome-v2/
> 검증일: 2026-11-09 (11-09 재검증(3차): Biome `files.ignore`→`files.includes` 예시 정정·`tseslint.config()` deprecated → `defineConfig`, 버전 갱신 · 최초 2026-03-27 · 08-26 freshness 재검증: ESLint 10.0.0(2026-02-06)에서 eslintrc 완전 제거·v9는 2026-08-06 EOL, Biome 2.5.x의 `organizeImports`→`assist` 이동 반영 · 09-28 재검증(2차): ESLint 10.11.0·Biome 2.5.14까지 breaking change 없음 확인)

> **버전 기준 (2026-11-09):** ESLint **10.x**(현행 10.14.0, v9.x는 2026-08-06부로 EOL, v8.x는 2024-10-05 EOL) · Biome **2.6.x**(현행 2.6.6, 2.6.0 은 2026-10-21 — 이 스킬 설정에 파괴적 변경 없음) · Prettier 3.x(3.9.10) · Husky 9(9.1.7) · lint-staged 최신(17.6.0) · commitlint 21.x(21.2.4) · typescript-eslint 8.x(8.72.1).
> ESLint 10은 `.eslintrc.*`·`.eslintignore`·`ESLINT_USE_FLAT_CONFIG`·`--no-eslintrc`·`--rulesdir`·`--ignore-path` 를 **전부 제거**했고 Node `^20.19.0 || ^22.13.0 || >=24` 를 요구한다. `eslint.config.*` 탐색 기준도 cwd가 아니라 **린트 대상 파일의 디렉토리**로 바뀌었다(모노레포에서 패키지별 config가 잡히는 방식이 달라짐).
> **아직 ESLint 8 + `.eslintrc`를 쓰는 레거시 프로젝트**는 이 스킬의 flat config 예시를 그대로 적용할 수 없다 — 경계 규칙 등 v8 분기 설정은 `architecture/module-boundaries` 스킬(ESLint 8·9 양쪽 예시)을 참조하고, v10 이행은 eslintrc→flat config 변환(`@eslint/migrate-config`)을 선행한다.

---

## ESLint 10+ Flat Config

### 기본 구조 (eslint.config.js)

```javascript
// eslint.config.js (ESLint 9부터 기본, 10부터 유일한 포맷)
import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import nextPlugin from '@next/eslint-plugin-next'

// tseslint.config(...) 는 deprecated — ESLint 코어의 defineConfig(...) 사용 (typescript-eslint 공식 문서)
export default defineConfig(
  // 전역 무시 패턴
  { ignores: ['dist/**', '.next/**', 'node_modules/**'] },

  // JS 기본 규칙
  js.configs.recommended,

  // TypeScript 규칙
  ...tseslint.configs.recommended,

  // React 규칙
  {
    plugins: { react: reactPlugin, 'react-hooks': reactHooks },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // React 17+ JSX Transform
      'react/prop-types': 'off',          // TypeScript가 커버
    },
    settings: { react: { version: 'detect' } },
  },

  // Next.js 규칙 (apps/web에만 적용)
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    plugins: { '@next/next': nextPlugin },
    rules: { ...nextPlugin.configs.recommended.rules },
  },

  // 공통 TypeScript 규칙
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error', // import type 강제
    },
  }
)
```

---

## Biome (통합 린터+포매터)

### 설정

```json
// biome.json
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "assist": { "actions": { "source": { "organizeImports": "on" } } },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "useExhaustiveDependencies": "warn"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "asNeeded"
    }
  },
  "files": {
    "includes": ["**", "!!**/dist", "!!**/.next", "!!**/node_modules"]
  }
}
```

> 주의: Biome v2 에서 `files.ignore`·`files.include` 는 **삭제**되고 `files.includes` 하나로 바뀌었다(공식 v2 업그레이드 가이드 "The options ignore and include are removed, and replaced by includes"). 제외는 `!` 접두사(일반 제외), `!!` 접두사는 **강제 제외**(스캐너가 인덱싱도 하지 않음 — 빌드 산출물·중첩 프로젝트용)다. 경로는 설정 파일 기준 상대 경로다. v1 설정은 `biome migrate --write` 로 변환한다.

### Biome vs ESLint+Prettier 비교

| 항목 | Biome | ESLint + Prettier |
|------|-------|-----------------|
| 설정 파일 수 | 1개 (biome.json) | 2개 이상 |
| 실행 속도 | 10-20x 빠름 | 기준 |
| next-eslint 지원 | ❌ (직접 없음) | ✅ |
| import 정렬 | ✅ 내장 | 플러그인 필요 |
| 성숙도 | v2 안정 (2025-06-17 v2.0 → 2.6.x, 린트 룰 500개+) | 검증됨 |
| 타입 인지 린트 | v2부터 **tsc 없이** 자체 타입 추론으로 type-aware 룰 제공 (`typescript` 패키지 미설치도 가능) | `typescript-eslint` + `parserOptions.projectService` (tsc 프로그램 필요, 느림) |

---

## 흔한 실수 패턴

```javascript
// ❌ ESLint 8 방식 (레거시 .eslintrc.json)
// → ESLint 9까지는 eslintrc 병행 지원(옵션), ESLint 10부터 완전 제거 — flat config (eslint.config.js)만 동작
//   Biome v1 설정(`"organizeImports": { "enabled": true }`)도 v2에서 `assist.actions.source.organizeImports`로 이동 — `biome migrate --write`로 변환
```
