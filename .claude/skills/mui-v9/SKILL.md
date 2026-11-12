---
name: mui-v9
description: MUI v9 (Material UI) v5→v9 Breaking Changes — Dialog disableEscapeKeyDown 제거, CSS 복합 클래스 변경, System props·Grid·slotProps·아이콘·@mui/styles 등 주요 변경 요약표
---

# MUI v9 (Material UI)

> 소스: https://mui.com/material-ui/getting-started/
>       https://mui.com/blog/introducing-material-ui-v9/
>       https://mui.com/material-ui/migration/upgrade-to-v9/
> 검증일: 2026-11-09 (최초 2026-06-19)

> 참고: v5 → v6 → v7 → v9 순서로 출시됨 (v8은 존재하지 않음 — MUI X와 버전 번호를 맞추기 위한 의도적 스킵).
> 참고: 프로젝트가 **`@mui/material` 5.x에 고정**된 레거시라면 이 스킬의 Grid `size` prop·`colorSchemes`·`theme.applyStyles()`는 동작하지 않는다 — `frontend/mui-v5` 스킬을 먼저 참조할 것.

---

## 8. Dialog / Modal — disableEscapeKeyDown 제거 (v9)

```tsx
// ❌ v5 (v9에서 오류)
<Dialog disableEscapeKeyDown onClose={handleClose} />

// ✅ v9 — reason으로 처리
<Dialog
  onClose={(event, reason) => {
    if (reason === 'escapeKeyDown') return;  // ESC 무시
    handleClose();
  }}
/>
```

---

## 9. CSS 클래스 변경 (v9)

복합 클래스가 다중 선택자 조합으로 변경됨.

```css
/* v5 구 방식 */
.MuiAlert-standardSuccess { }
.MuiButton-textPrimary { }

/* v9 방식 */
.MuiAlert-standard.MuiAlert-colorSuccess { }
.MuiButton-text.MuiButton-colorPrimary { }
```

---

## 10. v5 → v9 주요 Breaking Changes 요약

| 항목 | v5 | v9 |
|------|----|----|
| System props | `<Box mt={2}>` 가능 | **제거** — `sx={{ mt: 2 }}` 필수 |
| Grid API | `xs`/`sm` prop on `item` | `size` prop (반응형도 `size={{ xs:12 }}`) |
| Grid direction column | `<Grid direction="column">` | **미지원** — `<Stack>` |
| slots/slotProps | `InputProps`, `PaperProps` 등 분산 | `slotProps` 통일 |
| 다크모드 | `palette.mode === 'dark'` 조건부 | `theme.applyStyles('dark', {})` |
| CSS Variables | 실험적 (`CssVarsProvider`) | `cssVariables: true` 정식 옵션 |
| `disableEscapeKeyDown` | Dialog prop 지원 | **제거** — `onClose` reason 처리 |
| `GridLegacy` | 없음 (v6에서 deprecated) | **완전 제거** |
| 아이콘 이름 | `InfoOutline` 등 23개 | **삭제** — `InfoOutlined`로 통일 |
| CSS 복합 클래스 | `.MuiButton-textPrimary` | `.MuiButton-text.MuiButton-colorPrimary` |
| `@mui/styles` (JSS) | deprecated | **완전 제거** |
