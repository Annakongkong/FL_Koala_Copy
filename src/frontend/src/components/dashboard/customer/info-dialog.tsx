'use client';

import * as React from 'react';
import type { TableUser } from '@/app/dashboard/customers/page';
import { updateUser } from '@/services/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';





const passwordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

type PasswordInputs = z.infer<typeof passwordSchema>;

export interface InfoDialogProps {
  open: boolean;
  onClose: () => void;
  user: TableUser | undefined; // 指定类型，可根据需要修改
}

export function InfoDialog({ open, onClose, user }: InfoDialogProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = async (data: PasswordInputs) => {
    if (user) {
      try {
        // 更新 user 密码
        await updateUser({
          username: user.username,
          email: user.email,
          password: data.password,
        });
      } catch (error) {
        console.error('Failed to update password', error);
      }
      onClose();
    } else {
      console.warn('User is undefined, cannot submit.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Reset Password</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {user ? (
            <>
              {/* 显示 username 但不可编辑 */}
              <TextField
                label="Username"
                value={user.username}
                margin="dense"
                fullWidth
                variant="standard"
                InputProps={{ readOnly: true }} // 设置只读
              />
              {/* 显示 email 但不可编辑 */}
              <TextField
                label="Email"
                value={user.email}
                margin="dense"
                fullWidth
                variant="standard"
                InputProps={{ readOnly: true }} // 设置只读
              />
              {/* 可编辑的 password */}
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="New Password"
                    type="password"
                    margin="dense"
                    fullWidth
                    variant="standard"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                )}
              />
            </>
          ) : (
            <Typography>Select a user to reset password.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          {user && <Button type="submit">Update</Button>} {/* 只有在 user 存在时才显示按钮 */}
        </DialogActions>
      </form>
    </Dialog>
  );
}
