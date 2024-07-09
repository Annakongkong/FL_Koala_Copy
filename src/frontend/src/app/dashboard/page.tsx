import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';

import { config } from '@/config';
import { FavScripts } from '@/components/dashboard/overview/fav-script';
import LatestScriptTable from '@/components/dashboard/overview/latest-script-table';
import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid lg={4} sm={6} xs={12}>
        <TotalCustomers diff={16} trend="down" sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <TasksProgress sx={{ height: '100%' }} value={75.5} />
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <TotalProfit sx={{ height: '100%' }} />
      </Grid>

      <Grid lg={4} md={6} xs={12}>
        <FavScripts sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={8} md={12} xs={12}>
        <LatestScriptTable />
      </Grid>
    </Grid>
  );
}
