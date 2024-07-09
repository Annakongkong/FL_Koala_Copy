'use client';

import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch'; // Import the Switch component
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { ScriptTableProps } from '@/types/script';
import { useSelection } from '@/hooks/use-selection';
import { useUser } from '@/hooks/use-user';

import CategoryChips from './CategoryChips';

export function ScriptTable({
  scripts,
  favScriptList,
  onExecution,
  onFavScript,
  onDeleteScript,
  onEditScript,
  onStatusChange,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: ScriptTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => scripts.map((script) => script.scriptId), [scripts]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < scripts.length;
  const selectedAll = scripts.length > 0 && selected?.size === scripts.length;
  const { user } = useUser();

  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  const handleToggle = (scriptId: string) => {
    setOpen((prevOpen) => ({ ...prevOpen, [scriptId]: !prevOpen[scriptId] }));
  };

  const handleStatusChange = (scriptId: string) => async (event: any) => {
    const newStatus = !event.target.checked;

    const updatedScript = scripts.find((script) => script.scriptId === scriptId);
    if (updatedScript) {
      await onStatusChange({ ...updatedScript, status: newStatus });
    }
  };

  return (
    <Card>
      <Box>
        {scripts.length === 0 ? (
          <Typography variant="h6" align="center" sx={{ margin: 3 }}>
            Script List is Empty
          </Typography>
        ) : (
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
                {user?.isAdmin && <TableCell>Show to User</TableCell>}

                <TableCell>Operation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scripts.map((script) => {
                const isSelected = selected?.has(script.scriptId) ?? false; // Determine if selected

                return (
                  <TableRow hover key={script.scriptId} selected={isSelected}>
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
                    <TableCell>{script.category && <CategoryChips category={script.category} />}</TableCell>
                    <TableCell>
                      {/* <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={() => handleToggle(script.scriptId)}
                        >
                          {open[script.scriptId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton> */}
                      {script.creator}
                    </TableCell>
                    <TableCell>{script.lastUpdatedAt}</TableCell>
                    {user?.isAdmin && (
                      <TableCell>
                        <Switch
                          checked={script.status}
                          onChange={handleStatusChange(script.scriptId)}
                          inputProps={{ 'aria-label': 'controlled' }}
                        />
                      </TableCell>
                    )}

                    <TableCell>
                      <IconButton onClick={() => onExecution(script.scriptId)}>
                        <PlayArrowIcon />
                      </IconButton>

                      {!script.isFavScript ? (
                        <IconButton onClick={() => onFavScript(script)}>
                          <StarBorderIcon />
                        </IconButton>
                      ) : (
                        <IconButton onClick={() => onFavScript(script)}>
                          <StarIcon />
                        </IconButton>
                      )}
                      {user?.isAdmin && (
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
        )}
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
