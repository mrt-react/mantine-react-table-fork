import { useMemo } from 'react';
import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable,
} from 'mantine-react-table-open';
import { data, Person } from './makeData';

const Example = () => {
  const columns = useMemo<MRT_ColumnDef<Person>[]>(
    //column definitions...
    () => [
      {
        accessorKey: 'firstName',
        header: 'First Name',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'city',
        header: 'City',
      },
    ],
    [],
    //end
  );

  const table = useMantineReactTable({
    columns,
    data,
    enablePagination: false,
    enableRowPinning: true,
    enableRowSelection: true,
    enableStickyHeader: true,
    rowPinningDisplayMode: 'select-sticky',
    getRowId: (row) => row.email,
    initialState: {
      rowPinning: {
        bottom: [],
        top: ['ereinger@mailinator.com'],
      },
      rowSelection: {
        'ereinger@mailinator.com': true,
      },
    },
    mantineTableContainerProps: {
      style: {
        maxHeight: '400px',
      },
    },
    mantineTableBodyRowProps: ({ row, table }) => {
      const { density } = table.getState();
      return {
        style: {
          //Set a fixed height for pinned rows
          height: row.getIsPinned()
            ? `${
                //Default mrt row height estimates. Adjust as needed.
                density === 'xs' ? 37 : density === 'md' ? 53 : 69
              }px`
            : undefined,
        },
      };
    },
  });

  return <MantineReactTable table={table} />;
};

export default Example;
