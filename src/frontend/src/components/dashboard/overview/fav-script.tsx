'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FavScriptsDetailResponse, listFavScriptDetials } from '@/services/common';
import { IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';

import { paths } from '@/paths';

export interface LatestProductsProps {
  sx?: SxProps;
}

export function FavScripts({ sx }: LatestProductsProps): React.JSX.Element {
  const [favScripts, setFavScripts] = useState<FavScriptsDetailResponse[]>([]);

  useEffect(() => {
    const fetchAllScripts = async () => {
      try {
        const resp = await listFavScriptDetials();
        if (!resp.success) {
          console.error(resp.message);
          console.log('error', resp.message);
          return;
        }
        setFavScripts(resp.data);
      } catch (error) {
        console.error('Error while fetching scripts:', error);
      }
    };
    fetchAllScripts();
  }, []);

  return (
    <Card sx={{ ...sx, height: '560px', display: 'flex', flexDirection: 'column' }}>
      <CardHeader title="Favorite Scripts" />
      <Divider />
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List>
          {favScripts.map((script, index) => (
            <ListItem
              divider={index < favScripts.length - 1}
              key={script.id}
              sx={{ fontSize: '1rem', color: 'text.primary', marginBottom: 1.5 }}
            >
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.primary', marginTop: 1.5 }}>
                    {script.name}
                  </Typography>
                }
                secondary={
                  <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', marginTop: 0.3, marginBottom: 1.5 }}>
                    {'Last edited at ' + script.updated_at.split(' GMT')[0]}
                  </Typography>
                }
              />
              <Link href={paths.dashboard.executeScript(script.id)}>
                <IconButton>
                  <ArrowRightIcon />
                </IconButton>
              </Link>
            </ListItem>
          ))}
        </List>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        {/* <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
        >
          View all
        </Button> */}
      </CardActions>
    </Card>
  );
}
