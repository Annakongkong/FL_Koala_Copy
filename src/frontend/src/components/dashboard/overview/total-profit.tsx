'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { listScripts } from '@/services/common';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Receipt as ReceiptIcon } from '@phosphor-icons/react/dist/ssr/Receipt';

export function TotalProfit({ value, sx }): React.JSX.Element {
  const [totalScripts, setTotalScripts] = useState(0);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const response = await listScripts();
        if (response.success) {
          setTotalScripts(response.data.length);
        } else {
          console.error(response.message);
        }
      } catch (error) {
        console.error('Error fetching scripts:', error);
      }
    };

    fetchScripts();
  }, []);
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Total Scripts
            </Typography>
            <Typography variant="h4">{totalScripts}</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
            <ReceiptIcon fontSize="var(--icon-fontSize-lg)" />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
