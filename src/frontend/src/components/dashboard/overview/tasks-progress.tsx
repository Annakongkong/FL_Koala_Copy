'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { getSpaceUsed } from '@/services/common';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ListBullets as ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';

export interface TasksProgressProps {
  sx?: SxProps;
  value: number;
}

export function TasksProgress({ value, sx }: TasksProgressProps): React.JSX.Element {
  const [spaceUsed, setSpaceUsed] = useState<string>('0 MB');
  useEffect(() => {
    const fetchData = async () => {
      const response = await getSpaceUsed();
      setSpaceUsed(response.data.data);
    };
    void fetchData();
  }, []);
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" gutterBottom variant="overline">
                All users data space used
              </Typography>
              <Typography variant="h4">{spaceUsed}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-warning-main)', height: '56px', width: '56px' }}>
              <ListBulletsIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
