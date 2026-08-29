---
'mantine-react-table-open': patch
---

Migrate the table core from `@tanstack/react-table` v8 to v9, with a v8 compatibility layer.

The table is now built on TanStack Store (`useTable` + store atoms) instead of `useReactTable`, which makes the library compatible with the React Compiler — every `'use no memo'` directive has been removed. MRT extensions are applied to both the table wrapper and the core instance, so headless consumers using `flexRender(def, header.getContext())` get a fully-featured table.

A compatibility layer preserves most v8-era APIs: `left`/`right` pinning inputs, the `columnSizingInfo` state key and `onColumnSizingInfoChange`, `sortingFn`/`sortingFns`, v8-style aggregation functions and positional array aggregations, renamed instance getters (`getPaginationRowModel`, `getPrePaginationRowModel`, `getLeftLeafColumns`, ...), v8 CSS variables and pinning data attributes, and deprecated type aliases.

Remaining breaking changes:

- **ESM-only.** The CommonJS build is dropped and the package now requires Node >= 20, matching `@tanstack/react-table` v9 (which is ESM-only upstream).
- Output values are v9-style: `column.getIsPinned()` returns `'start'`/`'end'`, multiple-aggregation results via v9's native array form are keyed objects, and `RowSelectionState` is `Record<string, true>`.
- Types imported directly from `@tanstack/react-table` surface v9 renames; MRT_* aliases (including deprecated v8 names) are unaffected.
