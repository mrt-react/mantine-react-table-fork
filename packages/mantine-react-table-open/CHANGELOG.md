# mantine-react-table-open

## 10.0.2

### Patch Changes

- Automated release triggered by push to v10.

## 10.0.1

### Patch Changes

- aeb34ba: Migrate the table core from `@tanstack/react-table` v8 to v9, with a v8 compatibility layer.

  The table is now built on TanStack Store (`useTable` + store atoms) instead of `useReactTable`, which makes the library compatible with the React Compiler — every `'use no memo'` directive has been removed. MRT extensions are applied to both the table wrapper and the core instance, so headless consumers using `flexRender(def, header.getContext())` get a fully-featured table.

  A compatibility layer preserves most v8-era APIs: `left`/`right` pinning inputs, the `columnSizingInfo` state key and `onColumnSizingInfoChange`, `sortingFn`/`sortingFns`, v8-style aggregation functions and positional array aggregations, renamed instance getters (`getPaginationRowModel`, `getPrePaginationRowModel`, `getLeftLeafColumns`, ...), v8 CSS variables and pinning data attributes, and deprecated type aliases.

  Also fixed: locale subpath imports (`mantine-react-table-open/locales/fr`) now resolve in Node ESM and strict bundlers — the exports map previously pointed at a directory, which the ESM resolver rejects.

  Remaining breaking changes:

  - **ESM-only.** The CommonJS build is dropped and the package now requires Node >= 20, matching `@tanstack/react-table` v9 (which is ESM-only upstream).
  - Output values are v9-style: `column.getIsPinned()` returns `'start'`/`'end'`, multiple-aggregation results via v9's native array form are keyed objects, and `RowSelectionState` is `Record<string, true>`.
  - Types imported directly from `@tanstack/react-table` surface v9 renames; MRT\_\* aliases (including deprecated v8 names) are unaffected.

## 9.0.5

### Patch Changes

- b13c5e2: Fix duplicate clear buttons in the MultiSelect filter (#5): Mantine's built-in clear button is disabled in favor of MRT's own clear button, which is now actually clickable (`rightSectionPointerEvents="all"`).

  Fix drag-to-reorder in the Show/Hide Columns menu (#4): `Menu.Item` was calling `preventDefault()` on mousedown, blocking native HTML5 drag; items are now rendered with `Box`, with a theme-aware hover color that works in dark mode.

## 9.0.4

### Patch Changes

- b13c5e2: Fix duplicate clear buttons in the MultiSelect filter (#5): Mantine's built-in clear button is disabled in favor of MRT's own clear button, which is now actually clickable (`rightSectionPointerEvents="all"`).

  Fix drag-to-reorder in the Show/Hide Columns menu (#4): `Menu.Item` was calling `preventDefault()` on mousedown, blocking native HTML5 drag; items are now rendered with `Box`, with a theme-aware hover color that works in dark mode.

## 9.0.3

### Patch Changes

- Automated release triggered by push to main.

## 9.0.1

### Patch Changes

- Automated release triggered by push to main.

## 9.0.0

### Major Changes

- f908e33: Upgrade to Mantine 9, React 19, and Next.js 15. Breaking changes include updated peer dependency requirements.

## 8.0.4

### Patch Changes

- f908e33: Verify automated release pipeline.

## 8.0.3

### Patch Changes

- f908e33: Verify automated release pipeline.

## 8.0.2

### Patch Changes

- f908e33: Verify automated release pipeline.

## 8.0.1

### Patch Changes

- Verify automated release pipeline.
