import React from 'react';
import { ExecutedScript } from '@/app/dashboard/execution/page';
import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
  Typography,
} from '@mui/material';

import { useUser } from '@/hooks/use-user';

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  open: boolean;
  executedScripts: ExecutedScript[];
}

export function NotificationPopover({ anchorEl, onClose, open,executedScripts }: NotificationPopoverProps): React.JSX.Element {
  const runningScripts = executedScripts.filter((script) => script.executionStatus === 'RUNNING');

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box sx={{ p: 2, width: '300px', maxHeight: '400px', overflow: 'auto', minWidth: '200px', minHeight: '100px' }}>
        <Typography variant="h6">Notifications</Typography>
        {runningScripts.length > 0 ? (
          <List>
            {runningScripts.map((script, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <CircularProgress color="inherit" />
                </ListItemAvatar>
                <ListItemText primary={`Script Name: ${script.name}`} secondary={`${script.executionStatus}`} />
              </ListItem>
            ))}
          </List>
        ) : (
          <div className="mt-5">
            <Typography>No script is running</Typography>
          </div>
        )}
      </Box>
    </Popover>
  );
}
