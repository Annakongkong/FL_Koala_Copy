import * as React from 'react';
import Link from 'next/link';
import { Button } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { BookOpenText as BookOpenTextIcon } from '@phosphor-icons/react/dist/ssr/BookOpenText';

export interface TotalCustomersProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: SxProps;
  value: string;
}

export function TotalCustomers({ diff, trend, sx, value }: TotalCustomersProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Script Guide
              </Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-success-main)', height: '56px', width: '56px' }}>
              <BookOpenTextIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          <Stack spacing={1}>
            <Button className="mt-5 w-36" variant="outlined">
              <Link href={'/dashboard/guide'}>View Guide</Link>
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
