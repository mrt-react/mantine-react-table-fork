---
'mantine-react-table-open': patch
---

Fix `renderDetailPanel` never opening.

TanStack Table v9 gates `row.toggleExpanded()` and `table.toggleAllRowsExpanded()` behind `getCanExpand()`. v8 gated only `getToggleExpandedHandler`, and MRT calls `toggleExpanded()` directly — so on v9 every detail panel became unopenable, because the default `getCanExpand()` only counts sub-rows and detail-panel rows have none. Clicking the expand button did nothing, and Expand All did nothing.

`getRowCanExpand` now defaults to reporting a row as expandable when it either has a detail panel or has sub-rows, which is [the documented way](https://tanstack.com/table/latest/docs/guide/expanding) to declare expandability for the detail-panel use case. Because that default is per-row rather than blanket-true, a conditional `renderDetailPanel` that returns nothing for some rows still leaves those rows' expand buttons disabled.

`MRT_ExpandButton` now derives its disabled state from `getCanExpand()` alone, instead of `getCanExpand() || renderDetailPanel(...)`. The two are equivalent for the default, but the old form ignored a consumer-supplied `getRowCanExpand` whenever a detail panel was configured — which on v9 rendered an enabled button whose click was a no-op. A consumer-supplied `getRowCanExpand` is now honoured by both the button and the toggle.

Side effect: the expand button no longer invokes `renderDetailPanel` (or builds `internalEditComponents`) once per row purely to decide its own disabled state.
