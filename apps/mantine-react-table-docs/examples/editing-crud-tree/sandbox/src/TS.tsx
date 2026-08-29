import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; //if using mantine date picker features
import 'mantine-react-table-open/styles.css'; //make sure MRT styles were imported in your app root (once)
import { useMemo, useState } from 'react';
import {
  MantineReactTable,
  createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from 'mantine-react-table-open';
import {
  Box,
  Button,
  ActionIcon,
  Tooltip,
  darken,
  lighten,
  useMantineTheme,
} from '@mantine/core';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { type User, fakeData, usStates } from './makeData';
import { IconUserPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useColorScheme } from '@mantine/hooks';

const Example = () => {
  const theme = useMantineTheme();
  const scheme = useColorScheme();
  const [creatingRowIndex, setCreatingRowIndex] = useState<
    number | undefined
  >();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        mantineEditTextInputProps: {
          required: true,
          error: !!validationErrors?.firstName,
          description: validationErrors?.firstName,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              firstName: undefined,
            }),
        },
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        mantineEditTextInputProps: {
          required: true,
          error: !!validationErrors?.lastName,
          description: validationErrors?.lastName,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              lastName: undefined,
            }),
        },
      },
      {
        accessorKey: 'city',
        header: 'City',
        mantineEditTextInputProps: {
          required: true,
          error: !!validationErrors?.city,
          description: validationErrors?.city,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              city: undefined,
            }),
        },
      },
      {
        accessorKey: 'state',
        header: 'State',
        editVariant: 'select',
        mantineEditSelectProps: ({ row }) => ({
          data: usStates,
        }),
      },
    ],
    [validationErrors],
  );

  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();
  const {
    data: fetchedUsers = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetUsers();
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();

  const handleCreateUser: MRT_TableOptions<User>['onCreatingRowSave'] = async ({
    values,
    row,
    table,
  }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createUser({ ...values, managerId: row.original.managerId });
    table.setCreatingRow(null);
  };

  const handleSaveUser: MRT_TableOptions<User>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateUser(values);
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row: MRT_Row<User>) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(row.original.id);
    }
  };

  const table = useMantineReactTable({
    columns,
    data: fetchedUsers,
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableColumnPinning: true,
    enableEditing: true,
    enableExpanding: true,
    positionCreatingRow: creatingRowIndex,
    getRowId: (row) => row.id,
    mantineToolbarAlertBannerProps: isLoadingUsersError
      ? {
          color: 'red',
          children: 'Error loading data',
        }
      : undefined,
    mantineTableContainerProps: {
      style: {
        minHeight: '500px',
      },
    },
    mantineTableBodyRowProps: ({ row }) => ({
      style: {
        td: {
          backgroundColor: darken(
            lighten(theme.colors[theme.primaryColor][0], 0.1),
            row.depth * (scheme === 'dark' ? 0.2 : 0.1),
          ),
        },
      },
    }),
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    renderRowActions: ({ row, renderedRowIndex, table }) => (
      <Box style={{ display: 'flex', gap: '0.5rem' }}>
        <Tooltip label="Edit">
          <ActionIcon onClick={() => table.setEditingRow(row)}>
            <IconEdit size="1rem" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
            <IconTrash size="1rem" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Add Subordinate">
          <ActionIcon
            onClick={() => {
              setCreatingRowIndex((renderedRowIndex || 0) + 1);
              table.setCreatingRow(
                createRow(
                  table,
                  {
                    id: null!,
                    firstName: '',
                    lastName: '',
                    city: '',
                    state: '',
                    managerId: row.id,
                    subRows: [],
                  },
                  -1,
                  row.depth + 1,
                ),
              );
            }}
          >
            <IconUserPlus size="1rem" />
          </ActionIcon>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        leftSection={<IconUserPlus size="1rem" />}
        onClick={() => {
          setCreatingRowIndex(table.getRowModel().rows.length);
          table.setCreatingRow(true);
        }}
      >
        Create New User
      </Button>
    ),
    initialState: {
      columnPinning: { end: [], start: ['mrt-row-actions'] },
      expanded: true,
      pagination: { pageSize: 20, pageIndex: 0 },
    },
    state: {
      isLoading: isLoadingUsers,
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers,
    },
  });

  return <MantineReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: User) => {
      console.info('create user', user);
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newUserInfo: User) => {
      queryClient.setQueryData(['users'], (_prevUsers: User[]) => {
        const prevUsers: User[] = JSON.parse(JSON.stringify(_prevUsers));
        newUserInfo.subRows = [];
        if (newUserInfo.managerId) {
          const manager = findUserInTree(newUserInfo.managerId, prevUsers);
          if (manager) {
            manager.subRows = [
              ...(manager.subRows || []),
              {
                ...newUserInfo,
                id: `${manager.id}.${(manager.subRows?.length || 0) + 1}`,
              },
            ];
          }
        } else {
          prevUsers.push({
            ...newUserInfo,
            id: `${prevUsers.length + 1}`,
          });
        }
        return [...prevUsers];
      });
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}

//READ hook (get users from api)
function useGetUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      //send api request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve(fakeData);
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put user in api)
function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: User) => {
      console.info('update user', user);
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newUserInfo: User) => {
      queryClient.setQueryData(['users'], (prevUsers: any) => {
        let user = findUserInTree(newUserInfo.id, prevUsers);
        user = { ...user, ...newUserInfo };
        return [...prevUsers];
      });
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}

//DELETE hook (delete user in api)
function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      console.info('delete user', userId);
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (userId: string) => {
      queryClient.setQueryData(['users'], (prevUsers: any) => {
        const newUsers: User[] = JSON.parse(JSON.stringify(prevUsers));
        //remove user
        const user = findUserInTree(userId, newUsers);
        if (user) {
          const manager = findUserInTree(user.managerId, newUsers);
          if (manager) {
            manager.subRows = manager.subRows?.filter(
              (subUser) => subUser.id !== user.id,
            );
          } else {
            return newUsers.filter((user) => user.id !== userId);
          }
        }
        return [...newUsers];
      });
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const ExampleWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <Example />
  </QueryClientProvider>
);

export default ExampleWithProviders;

// validateUser and findUserInTree functions remain the same
const validateRequired = (value: string) => !!value.length;

function validateUser(user: User) {
  return {
    firstName: !validateRequired(user.firstName)
      ? 'First Name is Required'
      : '',
    lastName: !validateRequired(user.lastName) ? 'Last Name is Required' : '',
  };
}

function findUserInTree(managerId: string | null, users: User[]): User | null {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === managerId) {
      return users[i];
    }
    if (users[i].subRows) {
      const found = findUserInTree(managerId, users[i].subRows!);
      if (found) return found;
    }
  }
  return null;
}
