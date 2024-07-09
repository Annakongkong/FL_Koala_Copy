'use client';

import * as React from 'react';
import { createUser } from '@/services/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormHelperText } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

const userSchema = z.object({
  username: z.string().min(6, { message: '6 characters username is required' }),
  fullname: z.string().min(1, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  // password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  role: z.string(),
});

type Inputs = z.infer<typeof userSchema>;

export function AddUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      fullname: '',
      email: '',
      password: '',
      role: 'User',
    },
  });

  const onSubmit = async (data: Inputs) => {
    const roleNumeric = data.role === 'administrator' ? 0 : 1;
    try {
      await createUser({
        username: data.username,
        fullname: data.fullname,
        email: data.email,
        password: 'password',
        role: roleNumeric,
      });
    } catch (error) {
      toast.error('Failed to create user');
    }
    onClose(); // Close the dialog on successful submission
    reset();
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New User</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="role"
            control={control}
            defaultValue="user"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.role)}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select {...field} label="Role" labelId="role-select-label">
                  <MenuItem value="administrator">Administrator</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
                {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name="username"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label="Username"
                type="text"
                fullWidth
                variant="standard"
                error={Boolean(errors.username)}
                helperText={errors.username?.message}
              />
            )}
          />

          <Controller
            name="fullname"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label="Fullname"
                type="text"
                fullWidth
                variant="standard"
                error={Boolean(errors.fullname)}
                helperText={errors.fullname?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                variant="standard"
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
              />
            )}
          />

          {/* <Controller
            name="password"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label="Password"
                type="password"
                fullWidth
                variant="standard"
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
              />
            )}
          /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Add</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
