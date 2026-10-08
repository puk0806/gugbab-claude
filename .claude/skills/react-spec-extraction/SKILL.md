---
name: react-spec-extraction
user-invocable: false
description: React 프론트(CRA·Vite SPA·Next.js Pages/App Router)에서 화면 명세(화면 목록·입력 필드·검증·버튼→API·화면 이동·권한 가드·전역 상태)를 기계적으로 뽑는 방법 - React Router(v6~v8 route 객체·JSX Routes·framework routes.ts)와 Next.js 파일 라우트(page·route·route group·_private·동적·병렬·인터셉트) 목록화, ts-morph AST로 fetch·axios 인스턴스·TanStack Query·커스텀 훅 호출 위치·메서드·URL 수집, React Hook Form register/Controller 규칙과 zod 4 z.toJSONSchema 변환(refine·메시지 누락 함정), 버튼 이벤트→핸들러→API 연결, Recoil·Redux Toolkit·zustand 전역 상태 목록, 정적 분석 한계(동적 URL→추정), 실행 검증한 ts-morph 스크립트와 rg 패턴. 공통 양식·규약은 spec-extraction-method를 따른다
---

# React 스펙 추출 (react-spec-extraction)

> 소스: https://reactrouter.com/start/data/routing (React Router 8.4.0 문서, Data mode)
> 소스: https://reactrouter.com/start/declarative/routing (Declarative mode)
> 소스: https://reactrouter.com/start/framework/routing (Framework mode, `app/routes.ts`)
> 소스: https://nextjs.org/docs/app/getting-started/project-structure (Next.js 16.4.0, 2026-07-21 갱신)
> 소스: https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts (Pages Router)
> 소스: https://ts-morph.com/setup/ · https://ts-morph.com/navigation/ (ts-morph, GitHub dsherret/ts-morph)
> 소스: https://zod.dev/json-schema (원문 MDX: github.com/colinhacks/zod `packages/docs/content/json-schema.mdx`)
> 소스: https://react-hook-form.com/docs/useform/register · https://react-hook-form.com/docs/usecontroller/controller
> 소스: https://tanstack.com/query/latest/docs/framework/react/guides/query-keys · .../guides/migrating-to-v5
> 검증일: 2026-10-08
> 기준 버전(2026-10-08 npm 최신): react-router 8.4.0(react-router-dom 7.18.4) · next 16.4.0 · ts-morph 28.0.0 · zod 4.6.5 · react-hook-form 7.89.0 · @tanstack/react-query 5.104.1 · axios 1.20.0 · zustand 5.0.15 · @reduxjs/toolkit 2.13.0 · recoil 0.7.7

---

## 0. 범위 — 이 스킬이 하는 일과 하지 않는 일

**먼저 `.claude/skills/spec-extraction-method/SKILL.md` 를 Read 한다.** 산출 양식(7-1 화면 명세·7-2 API 명세), 공통 칸(`근거`·`확신도`·`사용 여부`), LLM 추출 규약(R1~R9), 진행 순서·완료 기준은 전부 그 스킬이 정본이다. 이 스킬은 **React 코드에서 그 칸들을 채울 원재료를 어떻게 기계적으로 뽑는가**만 다룬다.

| 질문 | 담당 (이 스킬·`spec-extraction-method` 외에는 설치된 경우) |
|------|------|
| 무엇을 어떤 양식으로 남기나, 확신도·사용 여부 규칙 | `spec-extraction-method` (+ `references/spec-templates.md`) |
| React 라우트·API 호출·폼·이벤트·권한·전역 상태를 **코드에서 뽑는 법** | **이 스킬** |
| Next.js 기능 자체(Server/Client Component, 캐싱, proxy) 사용법 | `nextjs` |
| RHF + zod 폼을 **새로 작성**하는 법 | `form-handling` |
| zod 4 스키마 설계·서버 경계 검증 | `zod-schema-validation` |
| TanStack Query 사용 패턴(queryKey 설계·invalidate) | `tanstack-query` |
| 전역 상태 설계(Zustand v5 등) | `state-management` (Recoil 이관은 `recoil-to-zustand-migration`) |
| 추출 결과로 폴더 구조를 domain-first로 재편 | `frontend-domain-structure` |

**원칙:** 추출 단계에서는 코드를 고치지 않는다. 산출물은 대상 레포 `docs/spec/` (spec-extraction-method 7-7).

---

## 1. 추출 파이프라인 한눈에

```
① 스택 판별(package.json·폴더)  →  ② 화면 목록(라우트)  →  ③ API 호출 인벤토리
        →  ④ 호출 → 화면 역추적(호출 그래프)  →  ⑤ 폼 필드·검증  →  ⑥ 버튼/이벤트 → 핸들러 → API
        →  ⑦ 권한 가드·조건부 렌더  →  ⑧ 전역 상태 목록  →  ⑨ 근거 재확인(R3) 후 7-1/7-2 표로 병합
```

| 단계 | 도구 | 산출 칸 (spec-extraction-method 7-1/7-2) |
|------|------|------|
| ② | Next.js: 파일 트리 스캔 / React Router: ts-morph | 화면ID 후보·경로·레이아웃 |
| ③④ | ts-morph | 버튼·이벤트 → 호출 API, API 명세의 "호출 화면" |
| ⑤ | ts-morph + `z.toJSONSchema` | 입력 필드(이름·타입·필수·검증·메시지) |
| ⑥ | ts-morph | 버튼·이벤트, 화면 이동(navigate/Link/router.push) |
| ⑦ | rg + 사람 확인 | 권한 |
| ⑧ | rg/ts-morph | (화면 간 공유 데이터 — 화면 명세 비고 또는 별도 표) |

### 1-1. 스택 판별 (먼저 해야 2단계 방법이 갈린다)

| 신호 | 판정 | 화면 목록 방법 |
|------|------|------|
| `next` 의존성 + `app/` (또는 `src/app/`) | Next.js App Router | §2-1 파일 스캔 |
| `next` + `pages/` (또는 `src/pages/`) | Next.js Pages Router | §2-1 파일 스캔 (둘 다 있으면 둘 다) |
| `react-router` + `app/routes.ts` + `@react-router/dev` | React Router Framework mode | §2-3 |
| `react-router`/`react-router-dom` + `createBrowserRouter` | Data mode | §2-2 (route 객체) |
| `react-router-dom` + `<Routes>`/`<Route>` | Declarative mode (v6 흔함) | §2-2 (JSX) |
| `react-scripts` | CRA | 라우터 판별은 위와 동일 |

> 주의: React Router v7부터 패키지 이름이 `react-router` 로 통합됐고, 2026-10-08 기준 npm 최신은 `react-router` 8.4.0, `react-router-dom` 7.18.4다(npm 레지스트리 직접 조회). 레거시 코드는 `react-router-dom` import가 대부분이므로 **두 이름을 모두 검색**한다.

---

## 2. 화면 목록 추출

### 2-1. Next.js 파일 기반 라우트 (App + Pages)

공식 규칙(Next.js 16.4 Project structure 문서) 중 화면 목록에 필요한 것만:

| 규칙 | 의미 | 목록 처리 |
|------|------|------|
| `page.(js\|jsx\|tsx)` | 라우트를 공개(화면) | **화면 1행** |
| `route.(js\|ts)` | API 엔드포인트 | **API 명세 1행**(화면 아님) |
| `layout` / `template` | 공유 UI 래퍼 | 화면 아님. 권한 가드가 자주 있음 → §6 |
| `loading` / `error` / `not-found` / `global-error` / `default` | 상태 UI·병렬 라우트 폴백 | 화면 아님(메시지 칸 참고용) |
| `(group)` 폴더 | URL에서 제외 | 경로 계산 시 제거, 그룹명은 업무 묶음 단서 |
| `_folder` 폴더 | 라우팅에서 제외(하위 전체) | 스캔 제외 |
| `[slug]` / `[...slug]` / `[[...slug]]` | 동적 / catch-all / optional catch-all | 경로에 그대로 표기 |
| `@slot` | 병렬 라우트(이름 있는 슬롯) | URL 아님. 같은 URL에 여러 슬롯 → 화면 1개의 영역으로 기록 |
| `(.)x` `(..)x` `(..)(..)x` `(...)x` | 인터셉트 라우트(모달 등) | 원 라우트와 **같은 URL**. 별도 화면이 아니라 "모달 표시 방식"으로 기록 |
| `pages/index.js` → `/`, `pages/blog/[slug].js` | Pages Router 파일 = 라우트 | 화면 1행 |
| `pages/api/*` | Pages Router API 라우트 | API 명세 1행 |
| `pages/_app`, `pages/_document` | 전역 래퍼 | 화면 아님(전역 레이아웃·가드 확인) |

- 폴더만 있고 `page`/`route` 파일이 없으면 **공개되지 않는다**(colocation 허용). 폴더 수 ≠ 화면 수.
- 같은 URL이 `app/`과 `pages/`에 동시에 있으면 빌드 에러("Conflicting app and page files")다. 둘 다 있는 레포는 이관 중이므로 **두 라우터 행을 모두 남기고 소속 라우터를 칸으로 구분**한다.

**스크립트 (Node 표준 라이브러리만, 실행 검증 완료):**

```js
// next-routes.mjs — 사용: node next-routes.mjs <프로젝트 루트>  → TSV
import { readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
const root = process.argv[2] ?? ".";
const base = existsSync(join(root, "src/app")) || existsSync(join(root, "src/pages")) ? join(root, "src") : root;
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const rows = [];
const appDir = join(base, "app");
if (existsSync(appDir)) for (const f of walk(appDir)) {
  const segs = relative(appDir, f).split(sep); const file = segs.pop();
  const m = file.match(/^(page|route)\.(jsx?|tsx?|mdx?)$/); if (!m) continue;
  if (segs.some((s) => s.startsWith("_"))) continue;                 // _private 제외
  const note = [];
  if (segs.some((s) => s.startsWith("@"))) note.push("병렬 슬롯");
  if (segs.some((s) => /^\(\.{1,3}\)|^\(\.\.\)\(\.\.\)/.test(s))) note.push("인터셉트 — 원 라우트와 같은 URL");
  const url = "/" + segs
    .filter((s) => !/^\([^.].*\)$/.test(s) && !s.startsWith("@"))   // (group)·@slot 제거
    .map((s) => s.replace(/^\((\.{1,3}|\.\.\)\(\.\.)\)/, ""))       // (.)x → x
    .join("/");
  rows.push([relative(root, f), m[1] === "page" ? "화면(App)" : "API(App route)", url.replace(/\/+$/, "") || "/", note.join(", ")]);
}
const pagesDir = join(base, "pages");
if (existsSync(pagesDir)) for (const f of walk(pagesDir)) {
  const r = relative(pagesDir, f); if (!/\.(jsx?|tsx?|mdx?)$/.test(r)) continue;
  const segs = r.replace(/\.(jsx?|tsx?|mdx?)$/, "").split(sep);
  if (["_app", "_document", "_error"].includes(segs.at(-1))) continue;
  if (segs.at(-1) === "index") segs.pop();
  rows.push([relative(root, f), segs[0] === "api" ? "API(Pages api)" : "화면(Pages)", "/" + segs.join("/"), ""]);
}
console.log("근거\t종류\tURL\t비고");
for (const r of rows.sort((a, b) => a[2].localeCompare(b[2]))) console.log(r.join("\t"));
```

출력 예(가상 프로젝트): `app/(shop)/cart/page.tsx → /cart`, `app/@modal/(.)photo/[id]/page.tsx → /photo/[id] (병렬 슬롯, 인터셉트)`, `pages/api/health.ts → API /api/health`.

> 주의: `pageExtensions`(next.config)를 바꾼 프로젝트는 확장자 정규식을 맞춘다. `next.config`의 `rewrites`·`redirects`와 `proxy.ts`(Next.js 16, 15 이하는 `middleware.ts`)의 경로 분기는 파일 트리에 안 보이므로 **따로 읽어 "경로 별칭" 칸에 기록**한다.

### 2-2. React Router — Data mode route 객체 + Declarative JSX

공식 문서상 route 객체의 핵심 필드: `path`, `Component`(또는 `element`), `children`, `index`, `loader`, `action`, `lazy`. path 없는 route = **레이아웃 라우트**(URL 세그먼트 없음). 동적 `:id`, 선택 `:lang?`, splat `files/*`. JSX 모드는 `<Routes>` 안의 `<Route path element>` 중첩이 같은 의미다.

```js
// rr-routes.mjs — 사용: node rr-routes.mjs <tsconfig 경로>  (ts-morph 28에서 실행 검증)
import { Project, SyntaxKind, Node } from "ts-morph";
const project = new Project({ tsConfigFilePath: process.argv[2] ?? "tsconfig.json" });
const rel = (n) => `${n.getSourceFile().getFilePath().replace(process.cwd() + "/", "")}:${n.getStartLineNumber()}`;
const join = (base, p) => (p?.startsWith("/") ? p : `${base.replace(/\/$/, "")}/${p ?? ""}`).replace(/\/+/g, "/");
const FACTORY = /^(createBrowserRouter|createHashRouter|createMemoryRouter|useRoutes)$/;
const out = [];

const prop = (obj, name) => {
  const p = obj.getProperty(name);
  if (p && Node.isPropertyAssignment(p)) return p.getInitializer();
  if (p && Node.isShorthandPropertyAssignment(p)) return p.getNameNode();
};
function walkObjects(arr, base) {
  for (const el of arr.getElements()) {
    if (!Node.isObjectLiteralExpression(el)) { out.push([rel(el), "미확인(스프레드·변수 — 선언 추적)", el.getText().slice(0, 40), "추정"]); continue; }
    const pathNode = prop(el, "path");
    const isIndex = prop(el, "index")?.getText() === "true";
    const path = pathNode && Node.isStringLiteral(pathNode) ? pathNode.getLiteralText() : undefined;
    const full = isIndex ? base : path !== undefined ? join(base, path) : base;
    const comp = (prop(el, "Component") ?? prop(el, "element") ?? prop(el, "lazy"))?.getText().slice(0, 60) ?? "(레이아웃)";
    if (path !== undefined || isIndex) out.push([rel(el), full, comp, "확인됨"]);
    else if (pathNode) out.push([rel(el), `${base}/{${pathNode.getText()}}`, comp, "추정"]); // path가 변수
    const children = prop(el, "children");
    if (children && Node.isArrayLiteralExpression(children)) walkObjects(children, full);
  }
}
const attr = (jsx, name) => {
  const a = jsx.getAttribute(name);
  if (!a || !Node.isJsxAttribute(a)) return undefined;
  const init = a.getInitializer();
  return init === undefined ? "true" : Node.isStringLiteral(init) ? init.getLiteralText() : init.getText();
};
function walkJsx(node, base) {
  const open = Node.isJsxElement(node) ? node.getOpeningElement() : node;
  let next = base;
  if (open.getTagNameNode().getText() === "Route") {
    const path = attr(open, "path"); const isIndex = attr(open, "index") === "true";
    next = isIndex ? base : path !== undefined ? join(base, path) : base;
    out.push([rel(open), path !== undefined || isIndex ? next : `(레이아웃) ${base}`, attr(open, "element") ?? attr(open, "Component") ?? "-", "확인됨"]);
  }
  if (Node.isJsxElement(node))
    for (const c of node.getJsxChildren()) if (Node.isJsxElement(c) || Node.isJsxSelfClosingElement(c)) walkJsx(c, next);
}
for (const sf of project.getSourceFiles()) {
  for (const call of sf.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    if (!FACTORY.test(call.getExpression().getText())) continue;
    const a0 = call.getArguments()[0];
    if (a0 && Node.isArrayLiteralExpression(a0)) walkObjects(a0, "/");
    else out.push([rel(call), "미확인(route 배열이 변수 — 선언 따라가기)", "-", "추정"]);
  }
  for (const el of sf.getDescendantsOfKind(SyntaxKind.JsxElement))
    if (el.getOpeningElement().getTagNameNode().getText() === "Routes") walkJsx(el, "/");
}
console.log("근거\t경로\t컴포넌트\t확신도"); for (const r of out) console.log(r.join("\t"));
```

검증 출력(가상 fixture): `/orders/:orderId  () => import("./pages/OrderList")`, `(레이아웃) /  {<RequireAuth />}`, `/admin/users/:id?  {<Home />}` — 레이아웃 라우트의 `element`가 **권한 가드 단서**(§6)로 함께 나온다.

**스크립트가 놓치는 것 (수동 보완 대상):**
- route 배열을 다른 파일에서 만들어 spread/concat → "미확인" 행이 찍히면 그 변수 선언을 열어 같은 방식으로 이어 붙인다.
- 컴포넌트 안의 **하위 `<Routes>`**(v6 descendant routes: 부모 경로가 `/*`로 끝남) → 부모 경로 + 자식 경로로 수동 결합한다. 스크립트는 각 `<Routes>`를 `/`에서 시작하므로 **상대 경로로 출력된다**.
- `lazy`/`React.lazy(() => import(...))` 대상 파일 = 실제 화면 컴포넌트 파일. 화면 명세의 근거는 라우트 정의 줄 + 컴포넌트 파일 둘 다 단다.

### 2-3. React Router — Framework mode

`app/routes.ts`에서 `@react-router/dev/routes`의 `route(pattern, file)`, `index(file)`, `layout(file, children)`, `prefix(path, routes)`로 정의하고, 파일 규칙을 쓰면 `@react-router/fs-routes`의 `flatRoutes()`가 붙는다. `routes.ts`는 함수 호출 트리이므로 2-2 스크립트의 `walkObjects` 대신 **CallExpression 이름(route/index/layout/prefix)과 첫 인자 문자열**을 읽는 방식으로 같은 재귀를 적용한다. `flatRoutes()`가 있으면 `app/routes/` 파일명 규칙도 함께 본다.

> 주의: fs-routes 파일명 규칙(`.` 구분·`$` 동적·`_` 접두 등)은 이번에 공식 문서 본문을 직접 확인하지 않았다(미검증). flatRoutes 사용 프로젝트는 https://reactrouter.com/how-to/file-route-conventions 를 열어 규칙을 확인한 뒤 매핑한다. 이 단계 결과 행은 확인 전까지 `확신도 = 추정`으로 둔다.

---

## 3. API 호출 인벤토리 (fetch · axios · TanStack Query · 커스텀 훅)

### 3-1. 왜 grep이 아니라 AST인가

`get(`·`post(`는 Map·URLSearchParams·lodash에도 있다. ts-morph(TypeScript 컴파일러 API 래퍼)는 **수신 객체의 타입**을 물을 수 있어 axios 인스턴스(`axios.create()` 반환값을 import해서 쓰는 경우 포함)만 걸러낸다. `new Project({ tsConfigFilePath })`는 tsconfig의 파일을 자동 추가한다(`skipAddingFilesFromTsConfig: true`로 끌 수 있음 — ts-morph 공식 Setup 문서).

설치: `npm i -D ts-morph` (2026-10-08 최신 28.0.0). **타입 해석이 되려면 대상 레포의 `node_modules`가 설치돼 있어야 한다** — 없으면 axios 타입이 `any`가 되어 3-2의 axios 판별이 전부 빠진다.

### 3-2. 호출 위치·메서드·URL 수집 스크립트 (실행 검증 완료)

```js
// extract-api.mjs — 사용: node extract-api.mjs <tsconfig 경로>  → TSV(근거·메서드·URL·확신도)
import { Project, SyntaxKind, Node } from "ts-morph";
const project = new Project({ tsConfigFilePath: process.argv[2] ?? "tsconfig.json" });
const HTTP = new Set(["get", "post", "put", "patch", "delete", "head", "request"]);

/** URL 인자 → 문자열. 정적으로 경로 모양이 확정되면 confirmed=true */
function resolveUrl(node) {
  if (!node) return { url: "미확인", confirmed: false };
  if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node))
    return { url: node.getLiteralText(), confirmed: true };
  if (Node.isTemplateExpression(node)) {                     // `/orders/${id}` → /orders/{id}
    let s = node.getHead().getLiteralText();
    for (const span of node.getTemplateSpans())
      s += `{${span.getExpression().getText()}}` + span.getLiteral().getLiteralText();
    return { url: s, confirmed: true };
  }
  if (Node.isBinaryExpression(node) || Node.isIdentifier(node)) { // BASE + "/x" — 문자열 상수만 접는다
    const parts = [];
    const visit = (n) => {
      if (Node.isBinaryExpression(n)) { visit(n.getLeft()); visit(n.getRight()); return; }
      if (Node.isStringLiteral(n) || Node.isNoSubstitutionTemplateLiteral(n)) { parts.push(n.getLiteralText()); return; }
      if (Node.isIdentifier(n)) {
        const d = n.getSymbol()?.getDeclarations()?.[0];
        const init = d && Node.isVariableDeclaration(d) ? d.getInitializer() : undefined;
        if (init && (Node.isStringLiteral(init) || Node.isNoSubstitutionTemplateLiteral(init))) { parts.push(init.getLiteralText()); return; }
      }
      parts.push(`{${n.getText()}}`); throw new Error("dynamic");
    };
    try { visit(node); return { url: parts.join(""), confirmed: true }; }
    catch { return { url: parts.join(""), confirmed: false }; }
  }
  return { url: node.getText(), confirmed: false };
}
function fetchMethod(opts) {                                 // fetch(url, { method }) — 기본 GET
  if (!opts || !Node.isObjectLiteralExpression(opts)) return "GET";
  const p = opts.getProperty("method");
  const init = p && Node.isPropertyAssignment(p) ? p.getInitializer() : undefined;
  return init && Node.isStringLiteral(init) ? init.getLiteralText().toUpperCase() : "미확인";
}

console.log("근거\t메서드\tURL\t확신도");
for (const sf of project.getSourceFiles()) {
  if (sf.isDeclarationFile()) continue;
  for (const call of sf.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const callee = call.getExpression(); const args = call.getArguments();
    const where = `${sf.getFilePath().replace(process.cwd() + "/", "")}:${call.getStartLineNumber()}`;
    if (Node.isIdentifier(callee) && callee.getText() === "fetch") {
      const { url, confirmed } = resolveUrl(args[0]);
      console.log([where, fetchMethod(args[1]), url, confirmed ? "확인됨" : "추정"].join("\t"));
    } else if (Node.isPropertyAccessExpression(callee) && HTTP.has(callee.getName())) {
      if (!/Axios/.test(callee.getExpression().getType().getText(callee))) continue; // axios 계열만
      const { url, confirmed } = resolveUrl(args[0]);
      console.log([where, callee.getName().toUpperCase(), url, confirmed ? "확인됨" : "추정"].join("\t"));
    }
  }
}
```

검증 출력(가상 fixture):

```
src/api/client.ts:3       GET   /orders?status={status}   확인됨
src/api/client.ts:4       POST  /orders/{id}/cancel       확인됨
src/pages/OrderList.tsx:9 POST  /api/v2/orders/export     확인됨   ← const BASE + "/orders/export" 접힘
src/pages/OrderList.tsx:11 GET  {url}                     추정     ← 런타임 값
```

**확장 포인트:**
- `axios({ method, url })` 설정 객체 호출, `instance.request(config)` → 객체 리터럴의 `url`/`method` 프로퍼티를 같은 `resolveUrl`로 읽는다.
- `axios.create({ baseURL })` 의 `baseURL`은 인스턴스 선언에서 읽어 **URL 앞에 붙이되 칸을 분리**(`baseURL` / 상대 경로)해 둔다. 환경변수(`import.meta.env.VITE_API`·`process.env.NEXT_PUBLIC_…`)면 값은 "미확인", 변수명만 기록.
- 인터셉터(`instance.interceptors.request.use`)는 인증 헤더·공통 에러 처리 근거 → API 명세 "인증" 칸.
- ky·ofetch·SWR(`useSWR(key, fetcher)`)·GraphQL 클라이언트도 같은 골격으로 이름만 추가한다.

### 3-3. 호출 → 화면 역추적 (TanStack Query·커스텀 훅 통과)

API 래퍼 함수를 `findReferencesAsNodes()`로 따라가 **어느 컴포넌트·훅이 부르는지**, `useQuery`/`useMutation` 안이면 `queryKey`까지 한 번에 뽑는다.

```js
// trace-callers.mjs — 사용: node trace-callers.mjs <tsconfig> <API 모듈 경로(예: src/api/order.ts)>
import { Project, SyntaxKind, Node } from "ts-morph";
const [tsconfig = "tsconfig.json", apiPath] = process.argv.slice(2);
const project = new Project({ tsConfigFilePath: tsconfig });
const rel = (n) => `${n.getSourceFile().getFilePath().replace(process.cwd() + "/", "")}:${n.getStartLineNumber()}`;
const isOwner = (a) =>                                         // 컴포넌트(대문자) 또는 훅(use*)
  (Node.isFunctionDeclaration(a) && /^(use|[A-Z])/.test(a.getName() ?? "")) ||
  (Node.isVariableDeclaration(a) && /^(use|[A-Z])/.test(a.getName()));
const QUERY_HOOK = /^(use(Suspense)?(Infinite)?Query|useQueries|useMutation)$/;

const apiFile = project.getSourceFileOrThrow(apiPath);
const wrappers = [
  ...apiFile.getFunctions().filter((f) => f.isExported()),
  ...apiFile.getVariableDeclarations().filter((d) => d.isExported() && Node.isArrowFunction(d.getInitializer())),
];
console.log("API함수\t호출 컴포넌트/훅\t감싼 훅\tqueryKey\t근거");
for (const w of wrappers) for (const ref of w.findReferencesAsNodes()) {
  if (ref.getSourceFile() === apiFile || ref.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)) continue;
  const owner = ref.getFirstAncestor(isOwner);
  const hook = ref.getFirstAncestor((a) => Node.isCallExpression(a) && QUERY_HOOK.test(a.getExpression().getText()));
  const opts = hook?.getArguments()[0];
  const k = opts && Node.isObjectLiteralExpression(opts) ? opts.getProperty("queryKey") : undefined;
  const key = k && Node.isPropertyAssignment(k) ? k.getInitializer().getText() : "-";
  console.log([w.getName(), owner?.getName() ?? "미확인", hook?.getExpression().getText() ?? "-", key, rel(ref)].join("\t"));
}
```

검증 출력: `getOrders  OrderList  useQuery  ["orders", "OPEN"]  src/pages/OrderList.tsx:6`.

- **owner가 `use…` 훅이면 한 번 더 돌린다**: 그 훅을 래퍼로 보고 같은 스크립트로 "훅 → 컴포넌트"를 추적 → 최종적으로 라우트 컴포넌트(§2)에 닿을 때까지. 이 체인이 spec-extraction-method 7-6 "화면ID ─ 버튼/이벤트 ─ API" 연결 키다.
- TanStack Query v5는 `useQuery({ queryKey, queryFn })` **객체 시그니처만** 지원한다(v5 마이그레이션 가이드). v4 레거시의 `useQuery(key, fn, options)` 위치 인자 형태는 `getArguments()[0]`이 배열/문자열이므로 분기 처리한다.
- `queryOptions()`·query key factory로 분리된 경우 `queryKey`가 식별자로 찍힌다 → 선언을 따라가 실제 배열을 기록.
- queryKey는 **캐시 식별자**이지 URL이 아니다. 화면 명세에는 "호출 API(메서드+URL)"를 적고 queryKey는 비고로만.

### 3-4. 정적 분석 한계 — "추정"으로 남길 것

| 패턴 | 정적으로 알 수 있는 것 | 기록 |
|------|------|------|
| `` `/orders/${id}` `` | 경로 모양 | `/orders/{id}` — 확인됨 |
| `BASE + "/x"` (BASE가 문자열 상수) | 전체 URL | 확인됨 |
| `fetch(url)` (url이 함수 반환·props·state) | 없음 | `{url}` — **추정**, 런타임 확인 필요 |
| `api[method](...)`, 맵 테이블 기반 디스패치 | 후보 집합 | 후보 나열 — 추정 |
| baseURL이 env/런타임 설정 | 변수명 | env 키만 기록, 값 미확인 |
| 서버 컴포넌트·Server Action·`route.ts` 내부 호출 | 호출 코드는 보임 | 브라우저 네트워크엔 안 보임 — "서버측 호출" 칸 구분 |

추정 행을 확인됨으로 올리는 방법: 개발 서버에서 해당 화면 조작 + 브라우저 네트워크 탭/HAR 기록, 또는 E2E(Playwright) 실행 중 요청 로그. 이 증거를 `근거` 칸에 추가한다(`HAR:2026-10-08 orders.har#12`처럼).

---

## 4. 폼 스펙 추출 (React Hook Form · zod)

### 4-1. RHF `register` / `Controller`

공식 API: `register(name, options)`의 검증 옵션은 `required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `validate` (+ `valueAsNumber`, `valueAsDate`, `setValueAs` 변환). 메시지는 `required: "메시지"` 또는 `{ value, message }` 형태. `Controller`의 `rules` prop은 **register 옵션과 같은 형식**(required·min·max·minLength·maxLength·pattern·validate).

```js
// rhf-fields.mjs 핵심부 — register("name", { ... }) 와 <Controller name rules> 수집
for (const sf of project.getSourceFiles()) {
  for (const call of sf.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    if (call.getExpression().getText() !== "register") continue;   // methods.register 등은 정규식으로 확장
    const [nameArg, rulesArg] = call.getArguments();
    const field = nameArg && Node.isStringLiteral(nameArg) ? nameArg.getLiteralText() : `추정:${nameArg?.getText()}`;
    const rules = rulesArg && Node.isObjectLiteralExpression(rulesArg)
      ? rulesArg.getProperties().filter(Node.isPropertyAssignment).map((p) => `${p.getName()}=${p.getInitializer().getText()}`)
      : [];
    console.log(["register", field, rules.join("; "), rel(call)].join("\t"));
  }
  for (const el of sf.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)) {
    if (el.getTagNameNode().getText() !== "Controller") continue;
    const get = (n) => el.getAttribute(n)?.getInitializer()?.getText() ?? "-";
    console.log(["Controller", get("name"), get("rules"), rel(el)].join("\t"));
  }
}
```

검증 출력: `register  keyword  required="검색어를 입력하세요"; maxLength={ value: 50, message: "50자 이하" }`.

- `validate` 함수 본문은 **비즈니스 규칙 후보**다 → spec-extraction-method 7-4 규칙 명세로 넘기고 `확신도 = 추정`.
- `useFieldArray({ name })` = 반복 행(그리드형 입력). 필드 이름에 `items.${index}.qty` 형태가 나오면 반복 행의 컬럼으로 기록.
- 필드 라벨은 `<label htmlFor>`·디자인 시스템 `label` prop에서 따로 뽑아 이름↔라벨을 매칭한다(자동 매칭 실패분은 미확인).

### 4-2. zod 스키마 → JSON Schema

`useForm({ resolver: zodResolver(schema) })`이면 검증 규칙의 정본은 zod 스키마다. **`z.toJSONSchema()`는 `zod@4.0`에서 도입**됐다(zod.dev JSON Schema 문서 원문 MDX: "Introduced in `zod@4.0`"). zod 3에는 없다(`zod/v3` 모듈에서 `toJSONSchema` 미정의 — 실측).

> 주의: 도입 버전은 요약 도구·2차 자료마다 다르게 나온다(조사 중 "3.20"·"3.23"으로 요약된 사례 있음 — DISPUTED). 공식 문서 원문 MDX의 "Introduced in `zod@4.0`"과 `zod/v3`에 함수가 없는 실측을 기준으로 **4.0**으로 정정했다. 대상 레포에서는 `node -e 'console.log(require("zod/package.json").version)'`로 버전을 먼저 확인한다.

```ts
// 대상 레포에서 스키마 모듈을 import 해 실행 (tsx 등)
import * as z from "zod";
import { orderSearchSchema } from "../src/features/order/schema";
console.log(JSON.stringify(z.toJSONSchema(orderSearchSchema, { io: "input" }), null, 2));
```

옵션(공식 문서): `target`(기본 `draft-2020-12`, `draft-07`·`draft-04`·`openapi-3.0`), `io`(기본 output, 폼 입력 스펙엔 `"input"`), `unrepresentable`(기본 `"throw"`, `"any"`면 `{}`로 대체, 함수로 케이스별 처리). `z.date()`·`z.bigint()`·`z.transform()`·`z.custom()` 등은 표현 불가 → 기본값이면 **예외가 난다**.

**실측으로 확인한 함정 (zod 4.6.5):**

| 원본 | JSON Schema 결과 | 스펙 처리 |
|------|------|------|
| `z.string().min(8, "8자 이상")` | `minLength: 8` — **메시지 없음** | 메시지는 AST로 별도 수집(문자열 인자·`{ error }`/`{ message }`) |
| `z.string().email({ message })` | `format: "email"` + `pattern` | 패턴 원문은 참고만, 의미는 "이메일 형식" |
| `.refine((d) => d.pw === d.pw2, { path: ["pw2"] })` | **흔적 없이 사라짐** | `.refine`/`.superRefine`/`.check`는 AST로 따로 뽑아 7-4 비즈니스 규칙으로 |
| `z.coerce.number().int().min(0)` | `type: "integer", minimum: 0` | 입력 원본은 문자열일 수 있음 — 타입 칸에 "숫자(문자 입력 변환)" |
| `.optional()` | `required` 배열에서 빠짐 | 필수 칸 = required 배열 기준 |

즉 **JSON Schema는 "구조·타입·필수·범위"만** 기계화하고, **메시지와 교차 필드 규칙은 AST 수집**으로 보완한다. zod 3 레거시는 `zod-to-json-schema` 패키지가 대안이나, 해당 README가 2025-11부로 유지보수 중단을 공지했다(zod 4 네이티브 권장) — 추출용 일회성 실행에는 쓸 수 있다.

> 주의: zod 3과 4를 같이 쓰는 과도기 레포(`zod@3.25+`의 `zod/v4` 서브패스)에서는 스키마가 어느 쪽 인스턴스로 만들어졌는지 import 경로로 먼저 확인한다. v3 스키마를 v4 `toJSONSchema`에 넘기면 동작하지 않는다(미검증 — 실행해 보고 예외 여부로 판정).

---

## 5. 버튼·이벤트 → 핸들러 → API, 화면 이동

### 5-1. 이벤트 핸들러 1단계 추출 (실행 검증 완료)

```js
// events.mjs — 사용: node events.mjs <tsconfig>
import { Project, SyntaxKind, Node } from "ts-morph";
const project = new Project({ tsConfigFilePath: process.argv[2] ?? "tsconfig.json" });
const rel = (n) => `${n.getSourceFile().getFilePath().replace(process.cwd() + "/", "")}:${n.getStartLineNumber()}`;
console.log("요소\t라벨\t이벤트\t핸들러\t핸들러 내 호출\t근거");
for (const sf of project.getSourceFiles()) for (const a of sf.getDescendantsOfKind(SyntaxKind.JsxAttribute)) {
  const ev = a.getNameNode().getText();
  if (!/^on[A-Z]/.test(ev)) continue;
  const opening = a.getParentOrThrow().getParentOrThrow();              // JsxAttributes → 요소
  const el = Node.isJsxOpeningElement(opening) ? opening.getParent() : opening;
  const label = Node.isJsxElement(el) ? el.getJsxChildren().map((c) => c.getText()).join("").trim().slice(0, 30) : "";
  const init = a.getInitializer();
  const expr = init && Node.isJsxExpression(init) ? init.getExpression() : undefined;
  if (!expr) continue;
  let body = expr;                                                       // 식별자면 선언으로 이동
  if (Node.isIdentifier(expr)) {
    const d = expr.getSymbol()?.getDeclarations()?.[0];
    body = (d && Node.isVariableDeclaration(d) ? d.getInitializer() : d) ?? expr;
  }
  const calls = body.getDescendantsOfKind(SyntaxKind.CallExpression).map((c) => c.getExpression().getText());
  console.log([opening.getTagNameNode().getText(), label || "-", ev, expr.getText().slice(0, 40), [...new Set(calls)].join(", ") || "-", rel(a)].join("\t"));
}
```

검증 출력: `button 취소 onClick () => m.mutate(1) m.mutate` / `button 내보내기 onClick onExport fetch`.

- `m.mutate`처럼 **변수 경유**면 `m`의 선언 → `useMutation({ mutationFn })` → `mutationFn` 안의 API 함수 순으로 한 단계 더 따라간다(3-3 결과와 조인하면 자동화 가능).
- 핸들러가 props로 내려온 경우(`onClick={onSave}`이고 `onSave`가 props) → 부모 컴포넌트의 JSX 속성을 `findReferences`로 찾아 이어 붙인다. 못 찾으면 "미확인".
- 폼 제출은 `<form onSubmit={handleSubmit(onValid)}>` → `onValid` 본문이 실제 저장 호출. `handleSubmit` 첫 인자를 핸들러로 취급한다.
- 라벨이 i18n 함수(`t("order.cancel")`)면 키를 기록하고 번역 파일에서 값을 조회한다.

### 5-2. 화면 이동·팝업

| 패턴 | 라이브러리 | 추출 |
|------|------|------|
| `<Link to>` / `<NavLink to>` / `navigate("/x")` (`useNavigate`) | React Router | `to`·첫 인자 문자열 |
| `redirect("/login")` (loader/action 안) | React Router | 데이터 단계 이동 |
| `<Link href>` / `router.push()` / `router.replace()` | Next.js (`next/link`, `next/navigation` 또는 Pages의 `next/router`) | `href`·첫 인자 |
| `redirect()` / `notFound()` (서버) | Next.js | 서버측 이동 — 권한 실패 이동의 단서 |
| 모달·다이얼로그 `open` state, 인터셉트 라우트 | 공통 | "팝업" 칸, 열기 버튼과 연결 |

```bash
# 화면 이동 후보 (rg) — 결과는 AST로 재확인 후 확정
rg -n --type-add 'web:*.{ts,tsx,js,jsx}' -t web \
  -e 'navigate\(\s*[`"'"'"']' -e '<(Nav)?Link[^>]*\s(to|href)=' -e 'router\.(push|replace)\(' -e '\bredirect\(' src app pages
```

---

## 6. 권한 가드 추출

권한은 **여러 층에 흩어져 있다**. 한 층만 보면 누락된다.

| 층 | 흔한 형태 | 찾는 법 |
|------|------|------|
| 라우트 래퍼 | 레이아웃 라우트 `element={<RequireAuth/>}`, `<PrivateRoute>`, `<Navigate to="/login">` | §2-2 출력의 `(레이아웃)` 행 element + 그 컴포넌트 본문 |
| 데이터 단계 | loader/action 안 `redirect`, (v8) 라우트 middleware | route 객체의 `loader`·`middleware` 프로퍼티 |
| Next.js 요청 단계 | `proxy.ts`(16.0부터 middleware가 proxy로 개명·deprecated) / `middleware.ts`(≤15)의 `matcher`와 분기 | 파일 직접 읽기 — matcher는 빌드 시 정적 분석되는 **상수**라 그대로 보호 대상 URL 목록이 된다. 단 Server Function(`"use server"`)은 별도 라우트가 아니라 사용 위치 라우트로의 POST라서 matcher 제외 경로면 proxy를 안 탄다(공식 문서) → 각 Server Function 내부 권한 검사를 따로 확인 |
| Next.js 레이아웃·페이지 | 서버 컴포넌트에서 세션 확인 후 `redirect()` | `app/**/layout.tsx`의 `redirect(` |
| 조건부 렌더 | `{hasRole("ADMIN") && <Button/>}`, `can("order:cancel")`, `disabled={!perm}` | rg 후 AST로 감싼 JSX 요소 확인 |
| 메뉴 구성 | 메뉴 배열의 `roles: [...]` | 메뉴 정의 파일 |

```bash
# 권한 관련 식별자 후보 (프로젝트 용어로 교체)
rg -n -t ts -t js -e '\b(hasRole|hasPermission|can|isAdmin|useAuth|usePermission|RequireAuth|PrivateRoute|ProtectedRoute)\b' -e 'roles?\s*:\s*\[' src app pages
```

- 화면 명세 "권한" 칸에는 **층별로** 적는다(예: `라우트: RequireAuth(로그인) / 버튼 '취소': hasRole("ORDER_CANCEL")`).
- **프론트 가드는 보안 경계가 아니다.** 서버가 같은 권한을 검사하는지는 API 명세(백엔드 추출 결과)와 교차 확인하고, 프론트에만 있으면 "서버 검증 미확인"으로 표시한다 — 재구축 시 누락되기 쉬운 지점.

> 주의: React Router v8에서 middleware가 기본 활성화됐다는 내용은 v8 릴리스 관련 보도·업그레이드 문서 검색 결과로 확인했으나 middleware API 시그니처는 이번에 직접 검증하지 않았다. 대상 프로젝트 버전 문서에서 `middleware` 프로퍼티 형식을 확인한 뒤 추출 규칙을 정한다.

---

## 7. 전역 상태 목록

화면 간에 데이터를 넘기는 통로라서 "화면 이동 시 무엇이 유지되나"의 근거가 된다. 목록 칸: `상태 이름(key) / 라이브러리 / 초기값 / 정의 위치 / 읽는 화면 / 쓰는 화면`.

| 라이브러리 | 정의 패턴 (설치 타입 정의로 확인) | 읽기/쓰기 추적 |
|------|------|------|
| Recoil | `atom({ key, default })`, `selector({ key, get, set? })`, `atomFamily`/`selectorFamily` — `key` 필수 | `useRecoilState`·`useRecoilValue`·`useSetRecoilState`의 인자 참조 |
| Redux Toolkit | `createSlice({ name, initialState, reducers, extraReducers })`, `configureStore({ reducer })` | `useSelector((s) => s.<slice>…)`, `dispatch(<action>())` |
| zustand | `create(...)` / `create<T>()(...)` (v5 `zustand` 패키지 `create` export) | `use<Store>(selector)` 훅 참조 |
| Context | `createContext(...)` + Provider `value` | `useContext(X)` |

```bash
rg -n -t ts -t js -e '\b(atom|selector|atomFamily|selectorFamily)\(\s*\{' -e 'createSlice\(\s*\{' -e '\bcreate(<[^>]*>)?\(\)?\(' -e 'createContext\(' src
```

- 읽기/쓰기 위치는 3-3의 `findReferencesAsNodes()`를 상태 선언(atom 변수·slice actions·store 훅)에 그대로 적용한다.
- **서버 상태(TanStack Query 캐시)는 전역 상태 목록에 넣지 않는다** — API 명세 쪽 정보다(`tanstack-query` 스킬(설치된 경우)의 서버/클라이언트 상태 구분과 같은 기준).
- Recoil은 GitHub 저장소(facebookexperimental/Recoil)가 **archived** 상태이고 npm 최신이 0.7.7이다. 재구축 대상 스택에서 대체가 필요하면 `recoil-to-zustand-migration`(설치된 경우) 참조. 추출 단계에서는 key 목록만 정확히 남긴다.

---

## 8. 7-1/7-2 표로 병합하는 법

1. §2 출력의 각 화면 행 → 화면ID 부여(`SCR-<도메인>-<번호>`, 규칙은 spec-extraction-method 양식) + 근거 = 라우트 정의 줄;컴포넌트 파일.
2. §3-3 체인으로 화면 컴포넌트에 닿은 API 행 → 해당 화면의 "버튼·이벤트 → 호출 API". §5-1 결과로 어느 버튼인지 붙인다. 버튼 없이 마운트 시 호출(useQuery·useEffect)이면 이벤트 = "화면 진입".
3. §4 필드 → 입력 필드 표. §6 → 권한 칸. §5-2 → 화면 이동·팝업 칸.
4. 모든 행에 `확신도`: 스크립트가 "확인됨"을 찍어도 **R3(근거 줄 재확인)** 전까지는 초안. 동적 URL·props 경유·미확인 체인은 "추정"/"미확인" 유지.
5. `사용 여부`는 코드로 알 수 없다 → 접근 로그·애널리틱스 페이지뷰(라우트 경로 기준)로 채운다(spec-extraction-method 3-2).
6. 화면이 많으면 **라우트 묶음(=도메인) 단위로 서브에이전트 분할**(R1). 스크립트 TSV를 먼저 만들어 두고, 서브에이전트는 TSV + 해당 파일만 읽게 하면 컨텍스트가 작다.

---

## 9. 언제 쓰나 / 쓰지 않나

**적합:** React 프론트를 다른 스택(또는 새 구조)으로 재구축하기 전 화면 명세가 없거나 낡았을 때 / 백엔드 API 명세와 "어느 화면이 이 API를 부르나"를 연결해야 할 때 / 화면 수십~수백 개를 LLM과 함께 훑되 근거를 남겨야 할 때.

**부적합:** 화면 몇 개짜리 앱(직접 읽는 게 빠르다) / 런타임 조립이 지배적인 앱(서버가 화면 JSON을 내려주는 SDUI, 메뉴·권한·폼을 DB 메타데이터로 생성) — 이 경우 코드가 아니라 **메타데이터 테이블**이 스펙 원천이므로 데이터 추출로 전환한다.

---

## 10. 흔한 실수

| 실수 | 왜 문제인가 | 올바른 접근 |
|------|------|------|
| Next.js 폴더 수를 화면 수로 셈 | `page` 없는 폴더·`_private`·`(group)`은 화면이 아님 | `page`/`route` 파일 기준(§2-1) |
| 인터셉트·병렬 라우트를 별도 화면으로 등록 | 같은 URL의 표시 방식일 뿐 → 중복 화면 | 비고 칸에 "모달 표시"로 |
| `route.ts`·`pages/api`를 화면 목록에 섞음 | API다 | API 명세로 분리 |
| `rg "\.get\("` 로 API 수집 | Map·URLSearchParams까지 잡힘, 인스턴스 import는 놓침 | ts-morph 타입 판별(§3-2) |
| 대상 레포 `node_modules` 없이 ts-morph 실행 | axios 타입이 any → axios 호출 전부 누락 | 의존성 설치 후 실행, 0건이면 의심 |
| 동적 URL을 그럴듯하게 채움 | R4·R5 위반 — 추정이 사실로 둔갑 | `{url}` 그대로 + 추정, HAR로 확인 |
| queryKey를 API 경로로 기록 | 캐시 식별자일 뿐 실제 요청과 다를 수 있음 | queryFn 안의 실제 호출을 기록 |
| `z.toJSONSchema` 결과만으로 검증 명세 확정 | 메시지·`.refine` 교차 규칙이 조용히 빠짐(실측) | 메시지·refine은 AST로 보완 |
| zod 3 프로젝트에서 `z.toJSONSchema` 호출 | 4.0부터 제공 — zod 3엔 없음 | 버전 확인, 필요 시 zod-to-json-schema |
| 하위 `<Routes>` 경로를 루트 기준으로 기록 | v6 descendant routes는 부모 경로 기준 상대 경로 | 부모 `/*` 경로와 결합 |
| 버튼 숨김(조건부 렌더)을 권한 명세 전체로 간주 | 서버 검증 여부 불명 | 서버 API 명세와 교차, 없으면 "서버 검증 미확인" |
| TanStack Query 캐시를 전역 상태 목록에 포함 | 서버 상태와 클라이언트 상태 혼동 | 전역 상태 = Recoil/Redux/zustand/Context만 |
| 스크립트 출력 "확인됨"을 그대로 확정 | 스크립트 버그·누락 가능 | R3 근거 재확인 + 표본 수동 대조 |
