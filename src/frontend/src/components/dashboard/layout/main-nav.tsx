'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { ExecutedScript, isFirstResponse, updateExecutedScriptsStatus } from '@/app/dashboard/execution/page';
import { Badge, Tooltip } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { toast } from 'react-toastify';

import { usePopover } from '@/hooks/use-popover';
import { useUser } from '@/hooks/use-user';

import { MobileNav } from './mobile-nav';
import { NotificationPopover } from './notification-popover';
import { UserPopover } from './user-popover';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const { user, executedScripts, setExecutedScripts } = useUser();
  const userPopover = usePopover<HTMLDivElement>();
  const notificationPopover = usePopover<HTMLButtonElement>();
  const [myExecutionScripts, setMyExecutionScripts] = React.useState<ExecutedScript[]>([]);
  const runningScripts = executedScripts.filter((script) => script.executionStatus === 'RUNNING');
  const successScripts = executedScripts.filter((script) => script.executionStatus === 'SUCCESS');
  const errorScripts = executedScripts.filter((script) => script.executionStatus === 'ERROR');

  let badgeColor: 'success' | 'error' | 'warning';

  if (runningScripts.length > 0) {
    badgeColor = 'warning';
  } else if (errorScripts.length > 0) {
    badgeColor = 'error';
  } else if (successScripts.length === executedScripts.length) {
    badgeColor = 'success';
  } else {
    badgeColor = 'success';
  }

  useEffect(() => {
    const eventSource = new EventSource(`http://localhost:8080/api/execute/status/all/${user?.id}`);

    eventSource.onopen = (event) => {
      setMyExecutionScripts(executedScripts?.filter((script) => script.executionStatus === 'RUNNING'));
    };
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (isFirstResponse(data)) {
        // const updatedExecutedScripts = updateExecutedScriptsStatus(executedScripts, data.data);
        // setExecutedScripts(updatedExecutedScripts);
      } else {
        // Process the second message to update the statuses
        setMyExecutionScripts((prevScripts) => {
          const updatedScripts = prevScripts.map((script) => {
            if (data.data.success.includes(script.taskId)) {
              return { ...script, executionStatus: 'SUCCESS', endTime: new Date().toLocaleString() };
            }
            if (data.data.failed.includes(script.taskId)) {
              return { ...script, executionStatus: 'FAILED', endTime: new Date().toLocaleString() };
            }
            if (data.data.running.includes(script.taskId)) {
              return { ...script, executionStatus: 'RUNNING' };
            }
            return script;
          });
          console.log(updatedScripts);

          return updatedScripts;
        });
      }
      if (data.data.running.length === 0) {
        setExecutedScripts([]);
        setMyExecutionScripts([]);
      }
    };

    eventSource.onerror = (error) => {
      eventSource.close();
    };

    return () => {
      toast.dismiss();
      eventSource.close();
    };
  }, [useUser().syncing]);

  const handleExecutionClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    notificationPopover.handleOpen();
  };

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <Tooltip title="Notifications">
              <Badge
                color={badgeColor}
                badgeContent={myExecutionScripts.filter((script) => script.executionStatus === 'RUNNING').length}
              >
                <IconButton onClick={handleExecutionClick} ref={notificationPopover.anchorRef}>
                  <BellIcon />
                </IconButton>
              </Badge>
            </Tooltip>
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              src={user?.avatar}
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <NotificationPopover
        anchorEl={notificationPopover.anchorRef.current}
        onClose={notificationPopover.handleClose}
        open={notificationPopover.open}
        executedScripts={myExecutionScripts}
      />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
