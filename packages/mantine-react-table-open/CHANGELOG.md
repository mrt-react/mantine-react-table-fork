# mantine-react-table-open

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
