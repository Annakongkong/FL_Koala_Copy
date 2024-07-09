'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { deleteUser, listUsers, ListUsersResponse, updateUser, UpdateUserRequest } from '@/services/common';
import InfoIcon from '@mui/icons-material/Info';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { toast } from 'react-toastify';

import { useUser } from '@/hooks/use-user';
import { AdminGuard } from '@/components/auth/admin-guard';
import { AddUserDialog } from '@/components/dashboard/customer/add-user-dialog';
import { CustomersFilters } from '@/components/dashboard/customer/customers-filters';
import { EditUserRow } from '@/components/dashboard/customer/edit-user-row';
import { InfoDialog } from '@/components/dashboard/customer/info-dialog';
import { ResetPasswordsDialog } from '@/components/dashboard/customer/reset-all-passwords-dialog';

export interface TableUser {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
}

function parseUser(response: ListUsersResponse): TableUser {
  let user: TableUser;
  user = {
    id: response.id,
    username: response.username,
    email: response.email,
    password: response.email,
    role: response.role_id === 0 ? 'Administrator' : 'User',
  };
  return user;
}

export default function Page(): React.JSX.Element {
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [users, setUsers] = useState<TableUser[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TableUser | undefined>();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const [resetAllPasswordOpen, setResetAllPasswordOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers();
    };
    toast.loading('Loading users...');
    loadData()
      .then(() => {
        toast.success('Users loaded successfully');
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        toast.dismiss();
      });
    return () => {
      toast.dismiss();
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await listUsers();
      setUsers(response.data.map(parseUser));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleOpen = () => setResetPasswordOpen(true);
  const handleClose = async () => {
    await fetchUsers(); // Refresh the user list after adding a new user
    setResetPasswordOpen(false);
  };

  const handleRemoveUser = async (id: number) => {
    try {
      if (!confirm('Are you sure you want to delete this user?')) {
        return;
      }
      await deleteUser(id);
      await fetchUsers(); // Refresh the user list after removing a user
    } catch (error) {
      console.error('Failed to remove user:', error);
    }
  };

  const handleEditUser = async (editedUser: TableUser) => {
    try {
      let updateInfo: UpdateUserRequest = {
        email: editedUser.email,
        username: editedUser.username,
        role: editedUser.role === 'Administrator' ? 0 : 1,
      };
      toast.loading('Updating user...');
      const response = await updateUser(updateInfo);
      toast.dismiss();
      toast.success('User updated successfully');
      setUsers(users.map((user) => (user.id === editedUser.id ? editedUser : user)));
    } catch (error) {
      console.error('update user error', error);
    }
  };

  const handleSelect = (userId: number) => {
    if (selectedRowId == userId) {
      setSelectedRowId(null);
      setSelectedUser(undefined);
    } else {
      setSelectedRowId(userId);
      const user = users.find((user) => user.id == userId);
      setSelectedUser(user);
    }
  };

  const handleOpenInfoDialog = () => setInfoDialogOpen(true);
  const handleCloseInfoDialog = () => setInfoDialogOpen(false);

  return (
    <AdminGuard>
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">User Management</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}></Stack>
          </Stack>
          <div>
            <Button startIcon={<InfoIcon />} variant="contained" onClick={handleOpenInfoDialog}>
              Reset Password
            </Button>
          </div>
          <div>
            <Button
              startIcon={<InfoIcon />}
              variant="contained"
              onClick={() => {
                setResetAllPasswordOpen(true);
              }}
            >
              Reset All Passwords
            </Button>
          </div>
          <div>
            <Button
              startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
              variant="contained"
              onClick={handleOpen}
            >
              Add
            </Button>
          </div>
        </Stack>
        <CustomersFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <InfoDialog
          open={infoDialogOpen}
          onClose={handleCloseInfoDialog}
          user={selectedUser} // Pass selectedUser prop
        />
        <AddUserDialog open={resetPasswordOpen} onClose={handleClose} />
        <ResetPasswordsDialog
          open={resetAllPasswordOpen}
          onClose={() => {
            setResetAllPasswordOpen(false);
          }}
        />

        <TableContainer component={Paper}>
          <Table aria-label="user management table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">Select</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .filter(
                  (userAtList) =>
                    userAtList.id.toString() !== user?.id &&
                    userAtList.username.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((userAtList) => (
                  <EditUserRow
                    key={userAtList.id}
                    user={userAtList}
                    selected={selectedRowId === userAtList.id}
                    onSelect={handleSelect}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleRemoveUser}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </AdminGuard>
  );
}
