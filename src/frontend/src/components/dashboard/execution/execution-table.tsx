'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ExecutedScript } from '@/app/dashboard/execution/page';
import { formatDate } from '@/services/parseDate';
import Download from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Box,
  Button,
  Card,
  Checkbox,
  IconButton,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { green, red, yellow } from '@mui/material/colors';
import Divider from '@mui/material/Divider';
import TablePagination from '@mui/material/TablePagination';
import { toast } from 'react-toastify';

import { paths } from '@/paths';
import { downloadOutputById } from '@/lib/download';
import { useSelection } from '@/hooks/use-selection';

export interface ExecutionTableProps {
  scripts: ExecutedScript[];
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const buttonSize = {
  padding: '5px 20px',
  fontSize: '14px',
};

const GreenButton = styled(Button)({
  color: 'white',
  backgroundColor: green[500],
  borderRadius: '50px',
  padding: buttonSize.padding,
  fontSize: buttonSize.fontSize,
  '&:hover': {
    backgroundColor: green[700],
  },
});

const YellowButton = styled(Button)({
  color: 'black',
  backgroundColor: yellow[500],
  borderRadius: '50px',
  padding: buttonSize.padding,
  fontSize: buttonSize.fontSize,
  '&:hover': {
    backgroundColor: yellow[700],
  },
});

const RedButton = styled(Button)({
  color: 'white',
  backgroundColor: red[500],
  borderRadius: '50px',
  padding: buttonSize.padding,
  fontSize: buttonSize.fontSize,
  '&:hover': {
    backgroundColor: red[700],
  },
});

export function ExecutionTable({
  scripts,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: ExecutionTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => scripts.map((script) => script.executionId), [scripts]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < scripts.length;
  const selectedAll = scripts.length > 0 && selected?.size === scripts.length;

  const router = useRouter();

  const renderStatus = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <YellowButton variant="contained" size="small">
            Running
          </YellowButton>
        );
      case 'success':
        return (
          <GreenButton variant="contained" size="small">
            Success
          </GreenButton>
        );
      case 'failed':
        return (
          <RedButton variant="contained" size="small">
            Failed
          </RedButton>
        );
      default:
        return null;
    }
  };

  const handleExecutionClick = (scriptId: any): void => {
    router.push(paths.dashboard.executeScript(scriptId));
  };

  return (
    <Card>
      <Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                />
              </TableCell>
              <TableCell>Index</TableCell>
              <TableCell>Script name</TableCell>
              <TableCell>Start time</TableCell>
              <TableCell>End time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Operation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scripts.map((script, index) => {
              const isSelected = selected?.has(script.executionId) ?? false;

              function onExecution(scriptId: any): void {
                router.push(paths.dashboard.executeScript(scriptId));
              }

              return (
                <TableRow hover key={script.executionId} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(script.executionId);
                        } else {
                          deselectOne(script.executionId);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{script.executionId}</TableCell>
                  <TableCell>{script.name}</TableCell>
                  <TableCell>{formatDate(script.startTime)}</TableCell>
                  <TableCell>{script.endTime ? formatDate(script.endTime) : 'In Progress'}</TableCell>
                  <TableCell>{renderStatus(script.executionStatus.toLowerCase())}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleExecutionClick(script.scriptId)}>
                      <PlayArrowIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        toast.loading('Downloading output...');
                        void downloadOutputById(script.executionId)
                          .then((r) => {
                            toast.dismiss();
                            toast.success('Downloaded output successfully');
                          })
                          .catch((e) => {
                            toast.dismiss();
                            toast.error('Failed to download output');
                          });
                      }}
                    >
                      <Download />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Divider />
        <TablePagination
          component="div"
          count={count}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>
    </Card>
  );
}
