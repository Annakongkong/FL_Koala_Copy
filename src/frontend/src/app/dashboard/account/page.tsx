import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { AccountDetailsForm } from '@/components/dashboard/account/account-details-form';
import { AccountInfo } from '@/components/dashboard/account/account-info';
import { UpdatePasswordForm } from '@/components/dashboard/settings/update-password-form';





export const metadata = { title: `Account | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Account</Typography>
      </div>
      <div className="flex justify-center">
        <div className="w-2/4">
          <AccountInfo />
        </div>
      </div>
      <AccountDetailsForm />
      <UpdatePasswordForm />
    </Stack>
  );
}
