import { aggregationFns } from '@tanstack/react-table';

export const MRT_RowAggregationFns = { ...aggregationFns };

/** @deprecated use `MRT_RowAggregationFns` (renamed in TanStack Table v9).
 * Note: entries are v9 AggregationFnDef objects - call `.aggregate(context)`. */
export const MRT_AggregationFns = MRT_RowAggregationFns;
