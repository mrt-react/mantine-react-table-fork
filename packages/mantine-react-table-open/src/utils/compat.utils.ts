import {
  type MRT_ColumnDef,
  type MRT_ColumnPinningState,
  type MRT_Row,
  type MRT_RowData,
  type MRT_RowSelectionState,
  type MRT_TableInstance,
} from '../types';

type MRT_RowPinningState = { bottom: string[]; top: string[] };

/**
 * v8 compatibility helpers. TanStack Table v9 renamed several public
 * surfaces (pinning positions, state keys, aggregation shapes, instance
 * getters). These helpers accept the v8 spellings and coerce them to the
 * v9 equivalents so existing consumers keep working.
 */

/**
 * v8-style aggregation function signature: (columnId, leafRows, childRows).
 */
export type MRT_LegacyAggregationFn<TData extends MRT_RowData> = (
  columnId: string,
  leafRows: MRT_Row<TData>[],
  childRows: MRT_Row<TData>[],
) => unknown;

/**
 * Accepts v8 {left, right} pinning keys and partial states; returns a v9
 * {start, end} state with both keys present (v9 throws 'end is not
 * iterable' on partial states).
 */
export const coerceColumnPinning = (
  pinning: ({
    left?: string[];
    right?: string[];
  } & Partial<MRT_ColumnPinningState>) | null | undefined,
): MRT_ColumnPinningState => ({
  end: pinning?.end ?? pinning?.right ?? [],
  start: pinning?.start ?? pinning?.left ?? [],
});

/**
 * Ensures both top and bottom keys exist (v9 throws on partial rowPinning
 * states).
 */
export const coerceRowPinning = (
  pinning: null | Partial<MRT_RowPinningState> | undefined,
): MRT_RowPinningState => ({
  bottom: pinning?.bottom ?? [],
  top: pinning?.top ?? [],
});

/**
 * v9 types RowSelectionState as Record<string, true> and deselects by
 * deleting keys. Consumers migrating from v8 may still pass {id: false};
 * strip falsy entries so v9 does not treat them as selected.
 */
export const coerceRowSelection = (
  selection: Record<string, boolean>,
): MRT_RowSelectionState => {
  if (Object.values(selection).every(Boolean)) {
    return selection as MRT_RowSelectionState;
  }
  return Object.fromEntries(
    Object.entries(selection).filter(([, selected]) => selected),
  ) as MRT_RowSelectionState;
};

const isAggregationFnDef = (
  value: unknown,
): value is { aggregate: (context: any) => unknown } =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as any).aggregate === 'function';

const wrapLegacyAggregationFn = (fn: (...args: any[]) => unknown) => ({
  //a bare function is never a valid v9 AggregationFnDef, so it must be a
  //v8-style (columnId, leafRows, childRows) fn - adapt the v9 context to it
  aggregate: (context: any) =>
    fn(
      context.columnId ?? context.column?.id,
      (context.rows ?? []) as any,
      (context.subRows ?? context.rows ?? []) as any,
    ),
});

const resolveSingleAggregation = (
  entry: unknown,
  registry: Record<string, any> | undefined,
): unknown => {
  if (typeof entry === 'string') {
    return registry?.[entry] ?? entry;
  }
  if (isAggregationFnDef(entry)) {
    return entry;
  }
  if (typeof entry === 'function') {
    return wrapLegacyAggregationFn(entry as (...args: any[]) => unknown);
  }
  if (entry && typeof entry === 'object' && 'aggregationFn' in (entry as any)) {
    return resolveSingleAggregation((entry as any).aggregationFn, registry);
  }
  return entry;
};

/**
 * Coerces a column's aggregationFn to a v9-compatible value:
 * - v8-style bare functions are wrapped into an AggregationFnDef
 * - arrays keep the v8 semantics of one aggregation returning a positional
 *   array of results (v9's native array form returns an object keyed by id
 *   and rejects bare functions without a stable id)
 * - strings and AggregationFnDef objects pass through untouched
 */
export const coerceAggregationFn = (
  aggregationFn: unknown,
  registry: Record<string, any> | undefined,
): unknown => {
  if (typeof aggregationFn === 'string' || aggregationFn == null) {
    return aggregationFn;
  }
  if (Array.isArray(aggregationFn)) {
    const defs = aggregationFn.map((entry) =>
      resolveSingleAggregation(entry, registry),
    );
    if (defs.every(isAggregationFnDef)) {
      return {
        aggregate: (context: any) => defs.map((def) => def.aggregate(context)),
      };
    }
    return aggregationFn;
  }
  if (typeof aggregationFn === 'function') {
    return wrapLegacyAggregationFn(aggregationFn as (...args: any[]) => unknown);
  }
  return aggregationFn;
};

/**
 * Reads a column's sort fn accepting the v8 `sortingFn` spelling.
 */
export const getColumnSortFn = <TData extends MRT_RowData>(
  columnDef: MRT_ColumnDef<TData>,
) => columnDef.sortFn ?? (columnDef as any).sortingFn;

const LEGACY_PIN_POSITIONS: Record<string, string> = {
  left: 'start',
  right: 'end',
};

/**
 * Wraps column.pin() on every column (once per column object - columns are
 * stable across renders) so v8-style pin('left')/pin('right') calls keep
 * working. Output values (getIsPinned etc.) intentionally stay v9-style.
 */
export const applyColumnPinCompat = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
) => {
  for (const column of table.getAllFlatColumns?.() ?? []) {
    const col = column as any;
    if (col._mrtPinCompat || typeof col.pin !== 'function') continue;
    const nativePin = col.pin.bind(col);
    col.pin = (position: unknown) =>
      nativePin(
        typeof position === 'string'
          ? (LEGACY_PIN_POSITIONS[position] ?? position)
          : position,
      );
    col._mrtPinCompat = true;
  }
};

const LEGACY_INSTANCE_ALIASES: [legacy: string, v9: string][] = [
  ['getPaginationRowModel', 'getPaginatedRowModel'],
  ['getPrePaginationRowModel', 'getPrePaginatedRowModel'],
  ['getLeftLeafColumns', 'getStartLeafColumns'],
  ['getRightLeafColumns', 'getEndLeafColumns'],
  ['getLeftHeaderGroups', 'getStartHeaderGroups'],
  ['getRightHeaderGroups', 'getEndHeaderGroups'],
  ['getLeftFlatHeaders', 'getStartFlatHeaders'],
  ['getRightFlatHeaders', 'getEndFlatHeaders'],
  ['getLeftLeafHeaders', 'getStartLeafHeaders'],
  ['getRightLeafHeaders', 'getEndLeafHeaders'],
];

/**
 * Adds deprecated v8-named table-instance methods that forward to their v9
 * renames, when the v9 method exists on the instance.
 */
export const applyLegacyInstanceAliases = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
) => {
  const t = table as any;
  for (const [legacy, v9] of LEGACY_INSTANCE_ALIASES) {
    if (typeof t[v9] === 'function' && typeof t[legacy] !== 'function') {
      t[legacy] = (...args: unknown[]) => t[v9](...args);
    }
  }
};

const LEGACY_ROW_MODEL_FACTORY_OPTIONS = [
  'getCoreRowModel',
  'getExpandedRowModel',
  'getFacetedMinMaxValues',
  'getFacetedRowModel',
  'getFacetedUniqueValues',
  'getFilteredRowModel',
  'getGroupedRowModel',
  'getPaginationRowModel',
  'getSortedRowModel',
] as const;

let warnedAboutRowModelFactories = false;

/**
 * v9 replaced the v8 row-model factory options with the `features` option;
 * MRT wires row models itself. Strip any v8 factory options a consumer
 * still passes so they do not reach v9 as unknown options.
 */
export const stripLegacyRowModelOptions = (
  options: Record<string, unknown>,
) => {
  const stripped: string[] = [];
  for (const key of LEGACY_ROW_MODEL_FACTORY_OPTIONS) {
    if (key in options) {
      stripped.push(key);
      delete options[key];
    }
  }
  if (
    stripped.length &&
    !warnedAboutRowModelFactories &&
    process.env.NODE_ENV !== 'production'
  ) {
    warnedAboutRowModelFactories = true;
    console.warn(
      `mantine-react-table: the ${stripped.join(', ')} option(s) are from TanStack Table v8 and are ignored - row models are configured automatically in v9 via the enable* options.`,
    );
  }
};
