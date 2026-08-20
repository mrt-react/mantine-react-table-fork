import { Box, Stack } from '@mantine/core';

import {
  MantineReactTable,
  type MRT_ColumnDef,
  MRT_RowAggregationFns,
} from '../../src';

import { faker } from '@faker-js/faker';
import { type Meta } from '@storybook/react';

const meta: Meta = {
  title: 'Features/Aggregation Examples',
};

export default meta;

const data = [...Array(2000)].map(() => ({
  age: faker.number.int({ max: 65, min: 18 }),
  firstName: faker.person.firstName(),
  gender: faker.person.sex(),
  lastName: faker.person.lastName(),
  salary: Number(faker.finance.amount({ dec: 0, max: 100000, min: 10000 })),
  state: faker.location.state(),
}));

const averageSalary =
  data.reduce((acc, curr) => acc + curr.salary, 0) / data.length;

const averageAge = data.reduce((acc, curr) => acc + curr.age, 0) / data.length;

const columns = [
  {
    accessorKey: 'firstName',
    enableGrouping: false,
    header: 'First Name',
  },
  {
    accessorKey: 'lastName',
    enableGrouping: false,
    header: 'Last Name',
  },
  {
    accessorKey: 'age',
    AggregatedCell: ({ cell, table }) => (
      <>
        Max by{' '}
        {table.getColumn(cell.row.groupingColumnId ?? '').columnDef.header}:{' '}
        <Box style={{ color: 'green', fontWeight: 'bold' }}>
          {cell.getValue<number>()}
        </Box>
      </>
    ),
    aggregationFn: 'max',
    Footer: () => (
      <Stack>
        Average Age:
        <Box color="orange">{Math.round(averageAge)}</Box>
      </Stack>
    ),
    header: 'Age',
  },
  {
    accessorKey: 'gender',
    GroupedCell: ({ cell }) => (
      <Box style={{ color: 'primary.main' }}>{cell.getValue<string>()}</Box>
    ),
    header: 'Gender',
  },
  {
    accessorKey: 'state',
    header: 'State',
  },
  {
    accessorKey: 'salary',
    AggregatedCell: ({ cell, table }) => (
      <>
        Average by{' '}
        {table.getColumn(cell.row.groupingColumnId ?? '').columnDef.header}:{' '}
        <Box style={{ color: 'green', fontWeight: 'bold' }}>
          {cell.getValue<number>()?.toLocaleString?.('en-US', {
            currency: 'USD',
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
            style: 'currency',
          })}
        </Box>
      </>
    ),
    aggregationFn: 'mean',
    Cell: ({ cell }) => (
      <>
        {cell.getValue<number>()?.toLocaleString?.('en-US', {
          currency: 'USD',
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          style: 'currency',
        })}
      </>
    ),
    enableGrouping: false,
    Footer: () => (
      <Stack>
        Average Salary:
        <Box color="orange">
          {averageSalary?.toLocaleString?.('en-US', {
            currency: 'USD',
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
            style: 'currency',
          })}
        </Box>
      </Stack>
    ),
    header: 'Salary',
  },
] as MRT_ColumnDef<(typeof data)[0]>[];

export const Aggregation = () => (
  <MantineReactTable columns={columns} data={data} enableGrouping />
);

export const AggregationExpandedDefault = () => (
  <MantineReactTable
    columns={columns}
    data={data}
    enableGrouping
    initialState={{ expanded: true }}
  />
);

export const AggregationGroupedAndExpandedDefault = () => (
  <MantineReactTable
    columns={columns}
    data={data}
    enableGrouping
    initialState={{
      expanded: true,
      grouping: ['state', 'gender'],
      isFullScreen: true,
      pagination: { pageIndex: 0, pageSize: 20 },
    }}
  />
);

export const MultiAggregationPerColumn = () => (
  <MantineReactTable
    columns={[
      {
        accessorKey: 'firstName',
        enableGrouping: false,
        header: 'First Name',
      },
      {
        accessorKey: 'lastName',
        enableGrouping: false,
        header: 'Last Name',
      },
      {
        accessorKey: 'age',
        AggregatedCell: ({ cell, table }) => (
          <>
            Min by{' '}
            {table.getColumn(cell.row.groupingColumnId ?? '').columnDef.header}:{' '}
            <Box style={{ color: 'green', fontWeight: 'bold' }}>
              {cell.getValue<[number, number]>()[0]}
            </Box>
            <br />
            Max by{' '}
            {
              table.getColumn(cell.row.groupingColumnId ?? '').columnDef.header
            }:{' '}
            <Box style={{ color: 'green', fontWeight: 'bold' }}>
              {cell.getValue<[number, number]>()[1]}
            </Box>
          </>
        ),
        //manually set multiple aggregation functions
        aggregationFn: {
          aggregate: (context: any) => [
            MRT_RowAggregationFns.min.aggregate(context),
            MRT_RowAggregationFns.max.aggregate(context),
          ],
        },
        Footer: () => (
          <Stack>
            Average Age:
            <Box color="orange">{Math.round(averageAge)}</Box>
          </Stack>
        ),
        header: 'Age',
      },
      {
        accessorKey: 'gender',
        GroupedCell: ({ cell }) => (
          <Box style={{ color: 'primary.main' }}>{cell.getValue<string>()}</Box>
        ),
        header: 'Gender',
      },
      {
        accessorKey: 'state',
        header: 'State',
      },
      {
        accessorKey: 'salary',
        AggregatedCell: ({ cell, table }) => (
          <>
            Count:{' '}
            <Box style={{ color: 'green', fontWeight: 'bold' }}>
              {cell.getValue<[number, number]>()?.[0]}
            </Box>
            <br />
            Average by{' '}
            {
              table.getColumn(cell.row.groupingColumnId ?? '').columnDef.header
            }:{' '}
            <Box style={{ color: 'green', fontWeight: 'bold' }}>
              {cell
                .getValue<[number, number]>()?.[1]
                ?.toLocaleString?.('en-US', {
                  currency: 'USD',
                  maximumFractionDigits: 0,
                  minimumFractionDigits: 0,
                  style: 'currency',
                })}
            </Box>
          </>
        ),
        aggregationFn: ['count', 'mean'], //multiple aggregation functions
        Cell: ({ cell }) => (
          <>
            {cell.getValue<number>()?.toLocaleString?.('en-US', {
              currency: 'USD',
              maximumFractionDigits: 0,
              minimumFractionDigits: 0,
              style: 'currency',
            })}
          </>
        ),
        enableGrouping: false,
        Footer: () => (
          <Stack>
            Average Salary:
            <Box color="orange">
              {averageSalary?.toLocaleString?.('en-US', {
                currency: 'USD',
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
                style: 'currency',
              })}
            </Box>
          </Stack>
        ),
        header: 'Salary',
      },
    ]}
    data={data}
    enableGrouping
    initialState={{
      expanded: true,
      grouping: ['state', 'gender'],
      isFullScreen: true,
      pagination: { pageIndex: 0, pageSize: 20 },
    }}
  />
);
