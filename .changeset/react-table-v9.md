---
'mantine-react-table-open': major
---

Migrate the table core from `@tanstack/react-table` v8 to v9.

The table is now built on TanStack Store (`useTable` + store atoms) instead of `useReactTable`, which makes the library compatible with the React Compiler — every `'use no memo'` directive has been removed.

Breaking changes:

- **ESM-only.** The CommonJS build is dropped and the package now requires Node >= 20, matching `@tanstack/react-table` v9.
- **Column pinning positions** use `'start'`/`'end'` instead of `'left'`/`'right'`.
- **State key** `columnSizingInfo` is renamed to `columnResizing`.
- **Type renames** surfaced from react-table v9 (e.g. `SortingFn` → `SortFn`, `AggregationFn` → `AggregationFnDef`); entity types are now parameterized over the table's feature set.
- New peer/dependency requirements: `@tanstack/react-table@^9.1.2`, `@tanstack/match-sorter-utils@^9.1.2`, and `@tanstack/react-store`.
