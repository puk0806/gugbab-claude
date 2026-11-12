---
name: storybook
description: Storybook 10 ESM-only 전환·v8→v10 패키지 이동/제거 대응표·요구 버전, Storybook 11 베타 요구사항, addon-vitest의 Vitest peer 범위 함정과 test-runner 지원 종료
---

# Storybook 10 컴포넌트 문서화

> 소스: https://storybook.js.org/docs | https://storybook.js.org/docs/releases/migration-guide | https://github.com/storybookjs/storybook/blob/next/MIGRATION.md
> 검증일: 2026-11-09 (최초 2026-08-11)
> 대상 버전: Storybook 10.6.x (2026-11-09 기준 최신 안정 10.6.6) · React ≥ 16.8 · Vite ≥ 5
>
> 주의: Storybook 11은 2026-11-09 현재 **베타**(`11.0.0-beta.0`, npm `next` 태그)다. 11은 Node 22.12+, Vite 6.3+, TypeScript 5.9+, addon-vitest의 Vitest 4.0+를 요구한다(공식 MIGRATION.md "From version 10.x to 11.0.0"). 이 스킬은 10.x 안정판 기준이다.

시각 회귀(스크린샷) 테스트 셋업은 이 스킬 범위가 아니다 → `github-actions-visual-regression` 스킬 참조(2026-11-11 storybook-visual-testing 통합).

---

## 0. v8 → v10 마이그레이션 노트 (먼저 읽기)

Storybook 9와 10에서 **패키지 구조가 크게 바뀌었다.** 8.x 시절 코드를 그대로 쓰면 대부분 import부터 깨진다.

### 필수 요구사항 변화

| 항목 | Storybook 8.x | Storybook 10 |
|------|---------------|--------------|
| Node.js | 18+ | **20.19+ 또는 22.12+** |
| 패키지 형식 | CJS + ESM 듀얼 | **ESM only** |
| `.storybook/main.*` | CJS·ESM 모두 가능 | **유효한 ESM 필수** |
| Vite | 4+ | **5+** (Vite 4 지원 중단) |
| TypeScript | 4.x | **4.9+** |
| 패키지 매니저 | 제한 없음 | npm 10+ / pnpm 9+ / yarn 4+ |
| Next.js | 13+ | **14.1+** |

> 주의: Node 요구 버전은 소스 간 표기가 갈린다. 공식 마이그레이션 가이드는 **20.19+ / 22.12+**, Storybook 10 릴리즈 블로그는 "20.16+, 22.19+, 24+", 설치 문서는 "Node 20+"로 적혀 있다. `require(esm)`가 플래그 없이 켜지는 실제 Node 버전이 20.19.0 / 22.12.0이므로 **마이그레이션 가이드 기준(20.19+ / 22.12+)을 따르는 것이 안전**하다. CI 이미지도 이 기준으로 고정한다.

### 패키지 이동 대응표 (가장 자주 걸리는 항목)

| Storybook 8.x | Storybook 10 | 비고 |
|---------------|--------------|------|
| `@storybook/test` | `storybook/test` | 스코프 제거, 코어 서브패스 |
| `@storybook/addon-actions` | `storybook/actions` | 코어 통합 |
| `@storybook/addon-viewport` | `storybook/viewport` | 코어 통합 |
| `@storybook/addon-highlight` | `storybook/highlight` | 코어 통합 |
| `@storybook/preview-api` | `storybook/preview-api` | 코어 통합 |
| `@storybook/manager-api` | `storybook/manager-api` | 코어 통합 |
| `@storybook/theming` | `storybook/theming` | 코어 통합 |
| `@storybook/blocks` | `@storybook/addon-docs/blocks` | MDX Doc Block |
| `@storybook/types` | `storybook/internal/types` | 내부용 표시 |
| `@storybook/experimental-addon-test` | `@storybook/addon-vitest` | 이름 변경 |
| `@storybook/react` (타입 import) | `@storybook/react-vite` 등 **프레임워크 패키지** | 렌더러 → 프레임워크 |

### 제거된 애드온·API

- **`@storybook/addon-essentials` 제거** — controls·actions·backgrounds·viewport·toolbars·measure·outline·highlight가 **코어에 내장**됐다. `addons` 배열에서 삭제하면 된다.
- **`@storybook/addon-interactions` 제거** — 인터랙션 패널도 코어 내장.
- **`@storybook/addon-storysource`, `@storybook/addon-mdx-gfm` 제거.**
- **`docs.autodocs` 설정 옵션 제거** — autodocs는 오직 `tags`로만 제어한다.
- **`storyStoreV7` 피처 플래그 제거** (기본 동작).
- **빌트인 태그 `dev-only` / `docs-only` / `test-only` 제거** → `dev` / `autodocs` / `test` 조합으로 대체.
- **프로젝트 어노테이션 `globals` → `initialGlobals` 로 이름 변경.**
- Preact·Vue 3·Web Components의 **Webpack 5 빌더 지원 중단** (Vite로 이전).

### 업그레이드 실행

```bash
npx storybook@latest upgrade   # 자동 마이그레이션(automigration) 포함
npx storybook doctor           # 중복 의존성·비호환 애드온·버전 불일치 점검
```

> 자동 마이그레이션이 대부분을 처리하지만 **전부는 아니다.** 업그레이드 후 `main.ts`가 ESM인지, import 경로가 위 표대로인지 직접 확인한다.

---

## 1. 설치 및 초기 설정

### Vite 프로젝트 수동 설정

```bash
npm install -D @storybook/react-vite @storybook/addon-docs
```

> 주의: `@storybook/react-vite`에 렌더러가 포함되어 있으므로 `@storybook/react`를 따로 설치하지 않는다.
> 주의: **`@storybook/addon-essentials` / `@storybook/addon-interactions`는 설치하지 않는다** — v9에서 제거되어 코어에 내장됐다. 남아 있으면 시작 시 에러가 난다.

`.storybook/main.ts` — **ESM이어야 한다**:

ESM 전환 시 주의점:

```typescript
// 금지 — CommonJS
// module.exports = config;
// const path = require('path');
// path.join(__dirname, '...')

// 권장 — ESM
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url)); // 직접 정의해야 함
```

- 상대 경로 import는 **확장자를 명시**해야 한다 (`./helpers.js`).
- 로컬 애드온 참조는 상대 경로 대신 `import.meta.resolve()`로 완전 해석한다.
- `tsconfig.json`의 `moduleResolution`은 `types` 조건을 지원하는 값(`"bundler"` 또는 `"node16"`)이어야 한다.

### Next.js 프로젝트

Storybook 10은 **`@storybook/nextjs-vite`를 권장**한다(더 빠르고 테스트 기능 지원이 낫다). 커스텀 Webpack·Babel 설정이 있어 Vite와 호환되지 않는 경우에만 Webpack 기반 `@storybook/nextjs`를 쓴다. 최소 Next.js 14.1.

---

## 4. Play Function (인터랙션 테스트)

### CLI·CI에서 인터랙션 테스트 실행

Vite 기반 프로젝트는 **Vitest 애드온**이 공식 경로다.

```bash
npx storybook add @storybook/addon-vitest
```

```typescript
// vitest.config.ts
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

export default defineConfig({
  plugins: [storybookTest({ configDir: '.storybook' })],
});
```

- 요구사항: **Vitest 4 또는 5**(아래 주의 참조), Vite 기반 프레임워크(`react-vite`, `nextjs-vite`, `vue3-vite` 등), Playwright Chromium(브라우저 모드)
- Vitest 애드온을 쓸 수 없는 환경(Webpack 빌더 등)은 먼저 Vite 프레임워크로 옮기는 것이 공식 권장이다(예: `npx storybook automigrate nextjs-to-nextjs-vite`). `@storybook/test-runner`는 **공식 지원이 끝났다**(아래 주의)

> 주의(2026-11-09 확인): 공식 문서는 여전히 "Vitest ≥ 3.0"이라고 적혀 있지만, npm registry의 실제 `@storybook/addon-vitest` `peerDependencies.vitest`는 버전마다 다르다 — 10.6.0: `^3.0.0 || ^4.0.0` → **10.6.1·10.6.2: `^3 || ^4 || ^5`(Vitest 5 지원 추가)** → **10.6.3 이후(현재 10.6.6): `^4.0.0 || ^5.0.0`(Vitest 3 제외)**. 따라서 **Vitest 5 프로젝트는 addon-vitest 10.6.1 이상**, **Vitest 3 프로젝트는 Vitest 4 이상으로 올리거나 addon-vitest를 10.6.2 이하로 고정**한다. 10.6.3 릴리스 노트에는 Vitest 3 제외가 따로 적혀 있지 않으니 설치 전 `npm view @storybook/addon-vitest peerDependencies`로 직접 확인한다.

> 주의(2026-11-09 확인): **`@storybook/test-runner` 공식 지원 종료** — 저장소가 2026-09-30 보관(archived, 읽기 전용) 처리됐고, 마지막 버전 0.26.0은 실행할 때마다 지원 종료 경고를 출력하며 더 이상 수정·호환성 업데이트를 받지 않는다(공식 MIGRATION.md "Test runner support ended", test-runner README). 기존 설정은 계속 쓸 수 있지만 "사용자 책임"이다. Vite 기반이면 Vitest 애드온으로 이전(공식 migration guide: https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/migration-guide), 이전이 불가능하면 스토리 index에서 테스트를 만드는 순수 Playwright 구성이 대안이다.
