---
"mantine-react-table-open": patch
---

Fix duplicate clear buttons in the MultiSelect filter (#5): Mantine's built-in clear button is disabled in favor of MRT's own clear button, which is now actually clickable (`rightSectionPointerEvents="all"`).

Fix drag-to-reorder in the Show/Hide Columns menu (#4): `Menu.Item` was calling `preventDefault()` on mousedown, blocking native HTML5 drag; items are now rendered with `Box`, with a theme-aware hover color that works in dark mode.
