import clsx from 'clsx';

import classes from './MRT_TableBody.module.css';

import { useMemo } from 'react';

import { createRow } from '@tanstack/react-table';

import {
  type TableProps,
  TableTd,
  type TableTrProps,
  Text,
} from '@mantine/core';

import { MRT_TableBodyRow } from './MRT_TableBodyRow';

import {
  type MRT_Row,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import { MRT_ExpandButton } from '../buttons/MRT_ExpandButton';

interface Props<TData extends MRT_RowData> extends TableTrProps {
  table: MRT_TableInstance<TData>;
  tableProps: Partial<TableProps>;
}

export const MRT_TableBodyEmptyRow = <TData extends MRT_RowData>({
  table,
  tableProps,
  ...commonRowProps
}: Props<TData>) => {
  'use no memo';
  const {
    getState,
    options: {
      layoutMode,
      localization,
      renderDetailPanel,
      renderEmptyRowsFallback,
    },
    refs: { tablePaperRef },
  } = table;
  const { columnFilters, globalFilter } = getState();

  const emptyRow = useMemo(
    () =>
      createRow(
        table as any,
        'mrt-row-empty',
        {} as TData,
        0,
        0,
      ) as MRT_Row<TData>,
    [],
  );

  const emptyRowProps = {
    ...commonRowProps,
    renderedRowIndex: 0,
    row: emptyRow,
    virtualRow: undefined,
  };

  return (
    <MRT_TableBodyRow
      className={clsx(
        'mrt-table-body-row',
        layoutMode?.startsWith('grid') && classes['empty-row-tr-grid'],
      )}
      table={table}
      tableProps={tableProps}
      {...emptyRowProps}
    >
      {renderDetailPanel && (
        <TableTd
          className={clsx(
            'mrt-table-body-cell',
            layoutMode?.startsWith('grid') && classes['empty-row-td-grid'],
          )}
          colSpan={1}
        >
          <MRT_ExpandButton row={emptyRow} table={table} />
        </TableTd>
      )}
      <td
        className={clsx(
          'mrt-table-body-cell',
          layoutMode?.startsWith('grid') && classes['empty-row-td-grid'],
        )}
        colSpan={table.getVisibleLeafColumns().length}
      >
        {renderEmptyRowsFallback?.({ table }) ?? (
          <Text
            __vars={{
              '--mrt-paper-width': `${tablePaperRef.current?.clientWidth}`,
            }}
            className={clsx(classes['empty-row-td-content'])}
          >
            {globalFilter || columnFilters.length
              ? localization.noResultsFound
              : localization.noRecordsToDisplay}
          </Text>
        )}
      </td>
    </MRT_TableBodyRow>
  );
};
