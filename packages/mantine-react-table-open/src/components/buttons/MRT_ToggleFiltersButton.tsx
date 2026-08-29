import { ActionIcon, type ActionIconProps, Tooltip } from '@mantine/core';

import {
  type HTMLPropsRef,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';

interface Props<TData extends MRT_RowData>
  extends ActionIconProps,
    HTMLPropsRef<HTMLButtonElement> {
  table: MRT_TableInstance<TData>;
}

export const MRT_ToggleFiltersButton = <TData extends MRT_RowData>({
  table: {
    options: {
      icons: { IconFilter, IconFilterOff },
      localization: { showHideFilters },
    },
    setShowColumnFilters,
    state,
  },
  title,
  ...rest
}: Props<TData>) => {
  const { showColumnFilters } = state;

  return (
    <Tooltip label={title ?? showHideFilters} withinPortal>
      <ActionIcon
        aria-label={title ?? showHideFilters}
        color="gray"
        onClick={() => setShowColumnFilters((current) => !current)}
        size="lg"
        variant="subtle"
        {...rest}
      >
        {showColumnFilters ? <IconFilterOff /> : <IconFilter />}
      </ActionIcon>
    </Tooltip>
  );
};
