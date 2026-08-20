import { useMemo, useRef } from 'react';

import { useCreateAtom, useSelector } from '@tanstack/react-store';
import { useTable } from '@tanstack/react-table';

import {
  type MRT_Cell,
  type MRT_Column,
  type MRT_ColumnDef,
  type MRT_ColumnFilterFnsState,
  type MRT_ColumnOrderState,
  type MRT_ColumnResizingState,
  type MRT_DefinedTableOptions,
  type MRT_DensityState,
  type MRT_FilterOption,
  type MRT_GroupingState,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_RowData,
  type MRT_StatefulTableOptions,
  type MRT_TableInstance,
  type MRT_TableState,
  type MRT_Updater,
} from '../types';
import {
  getAllLeafColumnDefs,
  getColumnId,
  getDefaultColumnFilterFn,
  prepareColumns,
} from '../utils/column.utils';
import {
  getDefaultColumnOrderIds,
  showRowActionsColumn,
  showRowDragColumn,
  showRowExpandColumn,
  showRowNumbersColumn,
  showRowPinningColumn,
  showRowSelectionColumn,
  showRowSpacerColumn,
} from '../utils/displayColumn.utils';
import { createRow } from '../utils/tanstack.helpers';
import { getMRT_RowActionsColumnDef } from './display-columns/getMRT_RowActionsColumnDef';
import { getMRT_RowDragColumnDef } from './display-columns/getMRT_RowDragColumnDef';
import { getMRT_RowExpandColumnDef } from './display-columns/getMRT_RowExpandColumnDef';
import { getMRT_RowNumbersColumnDef } from './display-columns/getMRT_RowNumbersColumnDef';
import { getMRT_RowPinningColumnDef } from './display-columns/getMRT_RowPinningColumnDef';
import { getMRT_RowSelectColumnDef } from './display-columns/getMRT_RowSelectColumnDef';
import { getMRT_RowSpacerColumnDef } from './display-columns/getMRT_RowSpacerColumnDef';
import { useMRT_Effects } from './useMRT_Effects';

/**
 * The MRT hook that wraps the TanStack useTable hook and adds additional functionality
 * @param definedTableOptions - table options with proper defaults set
 * @returns the MRT table instance
 */
export const useMRT_TableInstance = <TData extends MRT_RowData>(
  definedTableOptions: MRT_DefinedTableOptions<TData>,
): MRT_TableInstance<TData> => {
  const lastSelectedRowId = useRef<null | string>(null);
  const bottomToolbarRef = useRef<HTMLDivElement>(null);
  const editInputRefs = useRef<Record<string, HTMLInputElement>>({});
  const filterInputRefs = useRef<Record<string, HTMLInputElement>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableHeadCellRefs = useRef<Record<string, HTMLTableCellElement>>({});
  const tablePaperRef = useRef<HTMLDivElement>(null);
  const topToolbarRef = useRef<HTMLDivElement>(null);
  const tableHeadRef = useRef<HTMLTableSectionElement>(null);
  const tableFooterRef = useRef<HTMLTableSectionElement>(null);

  //transform initial state with proper column order
  const initialState: Partial<MRT_TableState<TData>> = useMemo(() => {
    const initState = definedTableOptions.initialState ?? {};
    initState.columnOrder =
      initState.columnOrder ??
      getDefaultColumnOrderIds({
        ...definedTableOptions,
        state: {
          ...definedTableOptions.initialState,
          ...definedTableOptions.state,
        },
      } as MRT_StatefulTableOptions<TData>);
    initState.globalFilterFn = definedTableOptions.globalFilterFn ?? 'fuzzy';
    return initState;
  }, []);

  definedTableOptions.initialState = initialState;

  const columnOrderAtom = useCreateAtom<MRT_ColumnOrderState>(
    initialState.columnOrder ?? [],
  );
  const columnResizingAtom = useCreateAtom<MRT_ColumnResizingState>(
    initialState.columnResizing ?? ({} as MRT_ColumnResizingState),
  );
  const groupingAtom = useCreateAtom<MRT_GroupingState>(
    initialState.grouping ?? [],
  );
  const paginationAtom = useCreateAtom<MRT_PaginationState>(
    initialState?.pagination ?? { pageIndex: 0, pageSize: 10 },
  );

  const columnOrder = useSelector(columnOrderAtom);
  const columnResizing = useSelector(columnResizingAtom);
  const grouping = useSelector(groupingAtom);
  const pagination = useSelector(paginationAtom);

  const initialColumnFilterFns: MRT_ColumnFilterFnsState = {};
  for (const col of getAllLeafColumnDefs(
    definedTableOptions.columns as MRT_ColumnDef<TData>[],
  )) {
    initialColumnFilterFns[getColumnId(col)] =
      col.filterFn instanceof Function
        ? (col.filterFn.name ?? 'custom')
        : (col.filterFn ??
          initialState?.columnFilterFns?.[getColumnId(col)] ??
          getDefaultColumnFilterFn(col));
  }
  const columnFilterFnsAtom = useCreateAtom<MRT_ColumnFilterFnsState>(
    initialColumnFilterFns,
  );
  const creatingRowAtom = useCreateAtom<MRT_Row<TData> | null>(
    initialState.creatingRow ?? null,
  );
  const densityAtom = useCreateAtom<MRT_DensityState>(
    initialState?.density ?? 'md',
  );
  const draggingColumnAtom = useCreateAtom<MRT_Column<TData> | null>(
    initialState.draggingColumn ?? null,
  );
  const draggingRowAtom = useCreateAtom<MRT_Row<TData> | null>(
    initialState.draggingRow ?? null,
  );
  const editingCellAtom = useCreateAtom<MRT_Cell<TData> | null>(
    initialState.editingCell ?? null,
  );
  const editingRowAtom = useCreateAtom<MRT_Row<TData> | null>(
    initialState.editingRow ?? null,
  );
  const globalFilterFnAtom = useCreateAtom<MRT_FilterOption>(
    initialState.globalFilterFn ?? 'fuzzy',
  );
  const hoveredColumnAtom = useCreateAtom<null | Partial<MRT_Column<TData>>>(
    initialState.hoveredColumn ?? null,
  );
  const hoveredRowAtom = useCreateAtom<null | Partial<MRT_Row<TData>>>(
    initialState.hoveredRow ?? null,
  );
  const isFullScreenAtom = useCreateAtom<boolean>(
    initialState?.isFullScreen ?? false,
  );
  const showAlertBannerAtom = useCreateAtom<boolean>(
    initialState?.showAlertBanner ?? false,
  );
  const showColumnFiltersAtom = useCreateAtom<boolean>(
    initialState?.showColumnFilters ?? false,
  );
  const showGlobalFilterAtom = useCreateAtom<boolean>(
    initialState?.showGlobalFilter ?? false,
  );
  const showToolbarDropZoneAtom = useCreateAtom<boolean>(
    initialState?.showToolbarDropZone ?? false,
  );

  const columnFilterFns = useSelector(columnFilterFnsAtom);
  const creatingRow = useSelector(creatingRowAtom);
  const density = useSelector(densityAtom);
  const draggingColumn = useSelector(draggingColumnAtom);
  const draggingRow = useSelector(draggingRowAtom);
  const editingCell = useSelector(editingCellAtom);
  const editingRow = useSelector(editingRowAtom);
  const globalFilterFn = useSelector(globalFilterFnAtom);
  const hoveredColumn = useSelector(hoveredColumnAtom);
  const hoveredRow = useSelector(hoveredRowAtom);
  const isFullScreen = useSelector(isFullScreenAtom);
  const showAlertBanner = useSelector(showAlertBannerAtom);
  const showColumnFilters = useSelector(showColumnFiltersAtom);
  const showGlobalFilter = useSelector(showGlobalFilterAtom);
  const showToolbarDropZone = useSelector(showToolbarDropZoneAtom);

  definedTableOptions.state = {
    columnFilterFns,
    columnOrder,
    columnResizing,
    creatingRow,
    density,
    draggingColumn,
    draggingRow,
    editingCell,
    editingRow,
    globalFilterFn,
    grouping,
    hoveredColumn,
    hoveredRow,
    isFullScreen,
    pagination,
    showAlertBanner,
    showColumnFilters,
    showGlobalFilter,
    showToolbarDropZone,
    ...definedTableOptions.state,
  };

  //The table options now include all state needed to help determine column visibility and order logic
  const statefulTableOptions =
    definedTableOptions as MRT_StatefulTableOptions<TData>;

  //don't recompute columnDefs while resizing column or dragging column/row
  const columnDefsRef = useRef<MRT_ColumnDef<TData>[]>([]);
  const columnPreparationDepsRef = useRef<undefined | unknown[]>(
    undefined,
  );
  const sourceColumns = statefulTableOptions.columns;
  const columnPreparationDeps: unknown[] = [
    sourceColumns,
    statefulTableOptions.defaultColumn,
    statefulTableOptions.defaultDisplayColumn,
    statefulTableOptions.displayColumnDefOptions,
    statefulTableOptions.filterFns,
    statefulTableOptions.sortFns,
    statefulTableOptions.localization,
    statefulTableOptions.state.columnFilterFns,
    statefulTableOptions.state.creatingRow,
    statefulTableOptions.state.grouping,
    statefulTableOptions.createDisplayMode,
    statefulTableOptions.editDisplayMode,
    statefulTableOptions.enableEditing,
    statefulTableOptions.enableExpandAll,
    statefulTableOptions.enableExpanding,
    statefulTableOptions.enableGrouping,
    statefulTableOptions.enableMultiRowSelection,
    statefulTableOptions.enableRowActions,
    statefulTableOptions.enableRowDragging,
    statefulTableOptions.enableRowNumbers,
    statefulTableOptions.enableRowOrdering,
    statefulTableOptions.enableRowPinning,
    statefulTableOptions.enableRowSelection,
    statefulTableOptions.enableSelectAll,
    statefulTableOptions.groupedColumnMode,
    statefulTableOptions.layoutMode,
    statefulTableOptions.positionExpandColumn,
    statefulTableOptions.renderDetailPanel,
    statefulTableOptions.rowNumberDisplayMode,
    statefulTableOptions.rowPinningDisplayMode,
  ];
  const previousColumnPreparationDeps = columnPreparationDepsRef.current;
  const columnPreparationChanged =
    !previousColumnPreparationDeps ||
    columnPreparationDeps.length !== previousColumnPreparationDeps.length ||
    columnPreparationDeps.some(
      (dependency, index) =>
        !Object.is(dependency, previousColumnPreparationDeps[index]),
    );
  const freezePreparedColumns =
    !!columnDefsRef.current.length &&
    (statefulTableOptions.state.columnResizing.isResizingColumn ||
      !!statefulTableOptions.state.draggingColumn ||
      !!statefulTableOptions.state.draggingRow);

  if (columnPreparationChanged && !freezePreparedColumns) {
    columnDefsRef.current = prepareColumns({
      columnDefs: [
        ...([
          showRowPinningColumn(statefulTableOptions) &&
            getMRT_RowPinningColumnDef(statefulTableOptions),
          showRowDragColumn(statefulTableOptions) &&
            getMRT_RowDragColumnDef(statefulTableOptions),
          showRowActionsColumn(statefulTableOptions) &&
            getMRT_RowActionsColumnDef(statefulTableOptions),
          showRowExpandColumn(statefulTableOptions) &&
            getMRT_RowExpandColumnDef(statefulTableOptions),
          showRowSelectionColumn(statefulTableOptions) &&
            getMRT_RowSelectColumnDef(statefulTableOptions),
          showRowNumbersColumn(statefulTableOptions) &&
            getMRT_RowNumbersColumnDef(statefulTableOptions),
        ].filter(Boolean) as MRT_ColumnDef<TData>[]),
        ...sourceColumns,
        ...([
          showRowSpacerColumn(statefulTableOptions) &&
            getMRT_RowSpacerColumnDef(statefulTableOptions),
        ].filter(Boolean) as MRT_ColumnDef<TData>[]),
      ],
      tableOptions: statefulTableOptions,
    });
    columnPreparationDepsRef.current = columnPreparationDeps;
  }
  statefulTableOptions.columns = columnDefsRef.current;

  //if loading, generate blank rows to show skeleton loaders
  statefulTableOptions.data = useMemo(
    () =>
      (statefulTableOptions.state.isLoading ||
        statefulTableOptions.state.showSkeletons) &&
      !statefulTableOptions.data.length
        ? [
            ...Array(
              Math.min(statefulTableOptions.state.pagination.pageSize, 20),
            ).fill(null),
          ].map(() =>
            Object.assign(
              {},
              ...getAllLeafColumnDefs(statefulTableOptions.columns).map(
                (col) => ({
                  [getColumnId(col)]: null,
                }),
              ),
            ),
          )
        : statefulTableOptions.data,
    [
      statefulTableOptions.data,
      statefulTableOptions.state.isLoading,
      statefulTableOptions.state.showSkeletons,
    ],
  );

  const table = useTable(
    {
      ...(statefulTableOptions as any),
      atoms: {
        columnOrder: columnOrderAtom,
        columnResizing: columnResizingAtom,
        grouping: groupingAtom,
        pagination: paginationAtom,
      },
      globalFilterFn: (globalFilterFn ?? 'fuzzy') as any,
    },
    (state) => state,
  ) as unknown as MRT_TableInstance<TData>;

  table.state = {
    ...table.state,
    columnFilterFns,
    creatingRow,
    density,
    draggingColumn,
    draggingRow,
    editingCell,
    editingRow,
    globalFilterFn,
    hoveredColumn,
    hoveredRow,
    isFullScreen,
    showAlertBanner,
    showColumnFilters,
    showGlobalFilter,
    showToolbarDropZone,
  };

  table.getState = () => table.state;

  table.refs = {
    bottomToolbarRef,
    editInputRefs,
    filterInputRefs,
    lastSelectedRowId,
    searchInputRef,
    tableContainerRef,
    tableFooterRef,
    tableHeadCellRefs,
    tableHeadRef,
    tablePaperRef,
    topToolbarRef,
  };

  table.setCreatingRow = (row: MRT_Updater<MRT_Row<TData> | null | true>) => {
    let _row = row;
    if (row === true) {
      _row = createRow(table);
    }
    if (statefulTableOptions?.onCreatingRowChange) {
      statefulTableOptions.onCreatingRowChange(_row as MRT_Row<TData> | null);
    } else {
      creatingRowAtom.set(_row as MRT_Row<TData> | null);
    }
  };
  table.setColumnFilterFns = (statefulTableOptions.onColumnFilterFnsChange ??
    columnFilterFnsAtom.set) as any;
  table.setDensity = (statefulTableOptions.onDensityChange ??
    densityAtom.set) as any;
  table.setDraggingColumn = (statefulTableOptions.onDraggingColumnChange ??
    draggingColumnAtom.set) as any;
  table.setDraggingRow = (statefulTableOptions.onDraggingRowChange ??
    draggingRowAtom.set) as any;
  table.setEditingCell = (statefulTableOptions.onEditingCellChange ??
    editingCellAtom.set) as any;
  table.setEditingRow = (statefulTableOptions.onEditingRowChange ??
    editingRowAtom.set) as any;
  table.setGlobalFilterFn = (statefulTableOptions.onGlobalFilterFnChange ??
    globalFilterFnAtom.set) as any;
  table.setHoveredColumn = (statefulTableOptions.onHoveredColumnChange ??
    hoveredColumnAtom.set) as any;
  table.setHoveredRow = (statefulTableOptions.onHoveredRowChange ??
    hoveredRowAtom.set) as any;
  table.setIsFullScreen = (statefulTableOptions.onIsFullScreenChange ??
    isFullScreenAtom.set) as any;
  table.setShowAlertBanner = (statefulTableOptions.onShowAlertBannerChange ??
    showAlertBannerAtom.set) as any;
  table.setShowColumnFilters =
    (statefulTableOptions.onShowColumnFiltersChange ??
      showColumnFiltersAtom.set) as any;
  table.setShowGlobalFilter = (statefulTableOptions.onShowGlobalFilterChange ??
    showGlobalFilterAtom.set) as any;
  table.setShowToolbarDropZone =
    (statefulTableOptions.onShowToolbarDropZoneChange ??
      showToolbarDropZoneAtom.set) as any;

  useMRT_Effects(table);

  return table;
};
