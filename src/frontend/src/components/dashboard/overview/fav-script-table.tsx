'use client';

import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

import { ScriptTableData } from '@/types/script';
import { useSelection } from '@/hooks/use-selection';
import { useUser } from '@/hooks/use-user';





export interface FavScriptTableProps {
  count?: number;
  page?: number;
  rows?: ScriptTableData[];
  rowsPerPage?: number;
  scripts: ScriptTableData[];
  setScripts: React.Dispatch<React.SetStateAction<ScriptTableData[]>>;
  onExecution: (scripId: string) => void;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FavScriptTable({
  scripts,
  onExecution: onExecution,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange
}: FavScriptTableProps): React.JSX.Element {

  const rowIds = React.useMemo(() => scripts.map((script) => script.scriptId), [scripts]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < scripts.length;
  const selectedAll = scripts.length > 0 && selected?.size === scripts.length;
  const { user } = useUser();

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
              <TableCell>Script Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Creator</TableCell>
              <TableCell>Created Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Operation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scripts.map((script) => {
              const isSelected = selected?.has(script.scriptId) ?? false;  // 确定是否选中

              return (
                <TableRow hover key={script.lastUpdatedAt} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(script.scriptId);
                        } else {
                          deselectOne(script.scriptId);
                        }
                      }}
                    />
                  </TableCell>

                  <TableCell>{script.name}</TableCell>
                  <TableCell>{script.category}</TableCell>
                  <TableCell>{script.creator}</TableCell>
                  <TableCell>{script.lastUpdatedAt}</TableCell>
                  <TableCell>{script.status}</TableCell>

                  <TableCell>
                  <IconButton onClick={() => onExecution(script.scriptId)}>
                      <PlayArrowIcon />
                    </IconButton>
                    {user!.isAdmin && (
                      <>
                        <IconButton onClick={() => onEditScript(script.scriptId)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => onDeleteScript(script.scriptId)}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
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
    </Card>
  );
}
