'use client';

import * as React from 'react';
import { resetAllPasswords } from '@/services/common';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';





const userSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

type Inputs = z.infer<typeof userSchema>;

export function ResetPasswordsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      password: '',
    },
  });
  const [loading, setLoading] = React.useState(false);
  const onSubmit = async (data: Inputs) => {
    try {
      toast.loading('Resetting passwords...');
      setLoading(true);
      await resetAllPasswords({
        password: data.password,
      });
    } catch (error) {
      toast.error('Failed to reset passwords. Please try again.');
    } finally {
      setLoading(false);
      toast.dismiss();
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
      <DialogTitle>Reset passwords of all users</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="password"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label="New Password"
                type="password"
                fullWidth
                variant="standard"
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button disabled={loading} type="submit">
            Confirm
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
