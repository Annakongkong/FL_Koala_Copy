'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { listScripts } from '@/services/common';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { toast } from 'react-toastify';

import { paths } from '@/paths';

interface ScriptTableData {
  scriptId: string;
  name: string;
  category: string;
  creator: string;
  updatedAt: string;
  status: string;
}

function LatestScriptTable(): React.JSX.Element {
  const [scriptTableData, setScriptTableData] = useState<ScriptTableData[]>([]);
  const router = useRouter();

  const toTableScript = (row: any): ScriptTableData => {
    let script: ScriptTableData;
    script = {
      scriptId: row.script_id.toString(),
      name: row.script_name,
      // Need to change to label
      category: row.label?.toString() || 'no Label',
      creator: row.user_name?.toString() || 'Unknown',
      updatedAt: row.updated_time,
    };
    return script;
  };

  useEffect(() => {
    toast.loading('Fetching data...');
    listScripts()
      .then((resp) => {
        if (!resp.success) {
          console.error(resp.message);
          alert(resp.message);
          return;
        }

        // order by updated time
        resp.data.sort((a, b) => new Date(b.updated_time).getTime() - new Date(a.updated_time).getTime());
        setScriptTableData(resp.data.map(toTableScript));
      })
      .catch((error) => {
        // alert('Error while fetching scripts');
        console.error(error);
      })
      .finally(() => {
        toast.dismiss();
      });
    return () => toast.dismiss();
  }, []);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Latest Scripts" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Script Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Creator</TableCell>
              <TableCell>Updated Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scriptTableData.map((script) => {
              return (
                <TableRow key={script.scriptId}>
                  <TableCell>
                    <Link className=" text-blue-600" href={paths.dashboard.executeScript(script.scriptId)}>
                      {script.name}
                    </Link>
                  </TableCell>
                  <TableCell>{script.category}</TableCell>
                  <TableCell>{script.creator}</TableCell>
                  <TableCell>{script.updatedAt.split(' GMT')[0]}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
          onClick={() => {
            router.push(paths.dashboard.scripts);
          }}
        >
          View all
        </Button>
      </CardActions>
    </Card>
  );
}

export default LatestScriptTable;
