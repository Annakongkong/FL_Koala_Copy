import React, { useState } from 'react';
import type { TableUser } from '@/app/dashboard/customers/page';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Button, Checkbox, IconButton, MenuItem, Select, TableCell, TableRow, TextField } from '@mui/material';
import { toast } from 'react-toastify';





export interface EditUserRowProps {
  user: TableUser;
  selected: boolean;
  onEditUser: (user: TableUser) => void;
  onDeleteUser: (id: number) => void;
  onSelect: (id: number) => void;
}

export function EditUserRow({ user, selected, onSelect, onEditUser, onDeleteUser}: EditUserRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<TableUser>(user);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (field: keyof TableUser, value: string) => {

    setEditedUser({ ...editedUser, [field]: value });
  };

  const handleSave = () => {
    if(editedUser.email === '' || editedUser.role === '' || editedUser.username === ''){
      toast.error('Please fill all the fields');
      return;
    }
    onEditUser(editedUser);
    setIsEditing(false);
  };

  return (
    <TableRow selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onChange={() => onSelect(user.id)}
        />
      </TableCell>
      <TableCell>
        {isEditing ? (
          <TextField
            value={editedUser.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
          />
        ) : (
          user.username
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
         <Select value={editedUser.role==="Administrator"?"Administrator":"User"} onChange={
            (e) => handleInputChange('role', e.target.value as string)
         } >
           <MenuItem value="Administrator">Administrator</MenuItem>
           <MenuItem value="User">User</MenuItem>
          </Select>
        ) : (
          user.role==="Administrator"?"Administrator":"User"
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <TextField value={editedUser.email} onChange={(e) => handleInputChange('email', e.target.value)} />
        ) : (
          user.email
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Button onClick={handleSave}>Save</Button>
        ) : (
          <IconButton onClick={handleEditClick}>
            <EditIcon />
          </IconButton>
        )}
        <IconButton onClick={() => onDeleteUser(user.id)} color="error">
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
