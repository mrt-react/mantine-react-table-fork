import {
  type MRT_ColumnDef,
  type MRT_RowData,
  type MRT_StatefulTableOptions,
} from '../../types';
import { defaultDisplayColumnProps } from '../../utils/displayColumn.utils';

export const getMRT_RowNumbersColumnDef = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
): MRT_ColumnDef<TData> | null => {
  const { localization, rowNumberDisplayMode } = tableOptions;

  return {
    Cell: ({ renderedRowIndex = 0, row, table }) => {
      const { pageIndex, pageSize } = table.atoms.pagination.get();
      return (
        ((rowNumberDisplayMode === 'static'
          ? renderedRowIndex + pageSize * pageIndex
          : row.index) ?? 0) + 1
      );
    },
    grow: false,
    Header: () => localization.rowNumber,
    ...defaultDisplayColumnProps({
      header: 'rowNumbers',
      id: 'mrt-row-numbers',
      size: 50,
      tableOptions,
    }),
  };
};
