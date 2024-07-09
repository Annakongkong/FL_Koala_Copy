'use client';

import React, { useEffect, useState } from 'react';
import { Stack, Typography } from '@mui/material';

import { useUser } from '@/hooks/use-user';
import { ExecutionTable } from '@/components/dashboard/execution/execution-table';

export interface ExecutedScript {
  index: string;
  executionId: string;
  scriptId: string;
  taskId: string;
  name: string;
  startTime: string;
  endTime: string | null;
  executionStatus: string;
}

export interface ExecutionData {
  execution_id: string;
  script_name: string;
  task_id: string;
  startTime: string;
  endTime: string;
  status: string;
  script_id: string;
}

export interface ExecutionFromEvt {
  script_id: string;
  script_name: string;
  task_id: string;
}

export interface ExecutionResponse {
  is_running: boolean;
  status: string;
  message: string;
  data: {
    running: string[];
    success: string[];
    failed: string[];
  };
}

export interface FirstResponse {
  is_running: boolean;
  status: string;
  message: string;
  data: ExecutionFromEvt[];
}

const isExecutionResponse = (data: any): data is ExecutionResponse => {
  return data.data && 'running' in data.data && 'success' in data.data && 'failed' in data.data;
};

export const isFirstResponse = (data: any): data is FirstResponse => {
  return Array.isArray(data.data) && data.data.length > 0 && 'script_id' in data.data[0] && 'task_id' in data.data[0];
};

export const parseExecution = (executionRecord: ExecutionData, count: number): ExecutedScript => {
  const record: ExecutedScript = {
    index: count.toString(),
    executionId: executionRecord.execution_id,
    taskId: executionRecord.task_id,
    name: executionRecord.script_name,
    startTime: executionRecord.startTime,
    endTime: executionRecord.endTime,
    executionStatus: executionRecord.status,
    scriptId: executionRecord.script_id,
  };
  return record;
};

export const updateExecutedScriptsStatus = (
  executedScripts: ExecutedScript[],
  executionFromEvts: ExecutionFromEvt[]
): ExecutedScript[] => {
  // Get all task_id from ExecutionFromEvt[] list
  const taskIdsFromEvts = new Set(executionFromEvts.map((evt) => evt.task_id));

  // Update executedScripts status
  return executedScripts.map((script) => {
    if (script.executionStatus === 'RUNNING' && !taskIdsFromEvts.has(script.taskId)) {
      return { ...script, executionStatus: 'SUCCESS' };
    }
    return script;
  });
};

export default function Page(): React.JSX.Element {
  const { executedScripts, fetchExecutions } = useUser();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };
  useEffect(() => {
    fetchExecutions();
  }, []);
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Execution History</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} />
        </Stack>
      </Stack>
      <ExecutionTable
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        count={executedScripts.length}
        scripts={executedScripts?.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
      />
    </Stack>
  );
}
