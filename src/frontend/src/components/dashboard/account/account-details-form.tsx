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
import Grid from '@mui/material/Unstable_Grid2';
import { toast } from 'react-toastify';

import { useUser } from '@/hooks/use-user';





export function AccountDetailsForm(): React.JSX.Element {
  const { user, checkSession } = useUser();
  const [username, setUsername] = React.useState(user?.username);
  const [fullname, setFullname] = React.useState(user?.fullName);
  const [loading, setLoading] = React.useState(false);
  const onUpdateUser = async () => {
    // Update user logic
    if (user) {
      const requestData = {};

      if (username === '') {
        toast.info('Username is required');
        return;
      }

      setLoading(true);
      await updateUser({ email: user.email, ...requestData });
      await checkSession?.();
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Card>
        <CardHeader subheader="The information can be edited" title="Profile" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <OutlinedInput label="role" disabled defaultValue={user?.isAdmin ? 'Administrator' : 'User'} />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Email</InputLabel>
                <OutlinedInput label="email" disabled defaultValue={user?.email} />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Username</InputLabel>
                <OutlinedInput
                  label="username"
                  defaultValue={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Full name</InputLabel>
                <OutlinedInput
                  label="fullname"
                  defaultValue={fullname}
                  onChange={(e) => {
                    setFullname(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <LoadingButton
            loading={loading}
            variant="contained"
            disabled={user?.username === username}
            onClick={onUpdateUser}
          >
            Save details
          </LoadingButton>
        </CardActions>
      </Card>
    </form>
  );
}
