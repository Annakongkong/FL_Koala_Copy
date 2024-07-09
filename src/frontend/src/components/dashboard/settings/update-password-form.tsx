'use client';

import * as React from 'react';
import { updateUser } from '@/services/common';
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import { toast } from 'react-toastify';

import { useUser } from '@/hooks/use-user';





export function UpdatePasswordForm(): React.JSX.Element {
  const [loading, setLoading] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const { user } = useUser();
  const onUpdate = async () => {
    if (!user) {
      return;
    }
    if (password === '') {
      toast.info('Password is required');
      return;
    }
    if (confirmPassword === '') {
      toast.info('Confirm password is required');
      return;
    }
    if (password !== confirmPassword) {
      toast.info('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.info('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);

    await updateUser({ email: user.email, password });
    setLoading(false);
  };
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Card>
        <CardHeader subheader="Update password" title="Password" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            <FormControl fullWidth>
              <InputLabel>Password</InputLabel>
              <OutlinedInput
                label="Password"
                name="password"
                type="password"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Confirm password</InputLabel>
              <OutlinedInput
                label="Confirm password"
                name="confirmPassword"
                type="password"
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
              />
            </FormControl>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <LoadingButton
            loading={loading}
            onClick={onUpdate}
            disabled={!password || !confirmPassword}
            variant="contained"
          >
            Update
          </LoadingButton>
        </CardActions>
      </Card>
    </form>
  );
}
