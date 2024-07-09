'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { downloadLog, executeScriptV2, fetchScript } from '@/services/common';
import Editor from '@monaco-editor/react';
import { Divider } from '@mui/material';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PlayCircle as RunIcon } from '@phosphor-icons/react/dist/ssr/PlayCircle';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { toast } from 'react-toastify';

import { downloadOutputById } from '@/lib/download';
import { AddNewScript } from '@/contexts/user-context';
import { useUser } from '@/hooks/use-user';
import CategoryChips from '@/components/dashboard/script/CategoryChips';

export default function Page({ params }: { params: { scriptId: number } }): React.JSX.Element {
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [instruction, setInstruction] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [log, setLog] = useState('');
  const [uploadRequired, setUploadRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  // file upload
  const [file, setFile] = useState<File | null>(null);

  const scriptId = params.scriptId;
  const { user, addExecutedScript, setSyncing } = useUser();

  // task id
  const [taskId, setTaskId] = useState<string | null>(null);
  // load script
  useEffect(() => {
    const loadScript = async () => {
      try {
        return await fetchScript(scriptId);
      } catch (error) {
        console.error('Failed to fetch script:', error);
      }
    };
    toast.loading('Loading script...');
    setLoading(true);
    loadScript()
      .then((res) => {
        if (res?.data === undefined) {
          return;
        }
        setName(res.data.script_name);
        setAuthor(res.data.user_name);
        setCategory(res.data.label);
        setDescription(res.data.description);
        setInstruction(res.data.instruction);
        setUploadRequired(res.data.upload_required);
        setCode(res.data.code);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setLoading(false);
        toast.dismiss();
      });

    return () => {
      toast.dismiss();
    };
  }, []);
  useEffect(() => {}, [taskId]);
  // listen task

  useEffect(() => {
    if (taskId === null) {
      return;
    }

    let timer = 0;
    let toastId = null;
    const interval = setInterval(() => {
      timer += 1;
      if (toastId !== null) {
        toast.update(toastId, {
          render: `Execution is running... ${timer}s`,
        });
      }
    }, 1000);
    const eventSource = new EventSource(`http://localhost:8080/api/execute/status?taskId=${taskId}`);
    eventSource.onopen = (event) => {
      setLoading(true);
      toastId = toast.loading(`Execution is running... ${timer}s`);
    };
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.is_running === false) {
        clearInterval(interval);
        toast.dismiss(toastId);
        toast.success('Execution is done');
      }
      if (data.is_running === false && data.status === 'SUCCESS') {
        downloadOutputById(data.data.exec_id);
        renderLog(data.data.exec_id);
      }
    };

    eventSource.onerror = (error) => {
      setLoading(false);
      eventSource.close();
      clearInterval(interval);
      toast.dismiss(toastId);
    };

    return () => {
      clearInterval(interval);
      toast.dismiss(toastId);
      eventSource.close();
    };
  }, [taskId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileIn = event.target.files?.[0];
    if (fileIn) {
      setFile(fileIn);
    }
  };

  const renderLog = async (execId: number) => {
    try {
      const logResponse = await downloadLog(execId);
      // without + '' it will be an object
      setLog(logResponse + '');
    } catch (e) {
      toast.error('Failed to fetch log');
      console.log(e);
    }
  };

  // v2 for SSE
  const handleRunCommandV2 = async () => {
    const form = new FormData();
    if (uploadRequired) {
      if (file === null) {
        toast.error('Please upload a file');
        return;
      }
    }
    if (file === null) {
      form.append('has_file', 'False');
    } else {
      form.append('file', file);
      form.append('has_file', 'True');
    }

    form.append('script_id', scriptId.toString());
    form.append('user_id', user?.id);
    setLoading(true);
    const tid = toast.loading('Sending command...');
    try {
      const execResponse = await executeScriptV2(form);
      setTaskId(execResponse.data.task_id);
      addExecutedScript({
        taskId: execResponse.data.task_id,
        executionId: execResponse.data.exec_id.toString(),
        scriptId: scriptId.toString(),
        name: name,
        startTime: new Date().toDateString(),
        executionStatus: 'RUNNING',
      } as AddNewScript);
      setSyncing((prev) => !prev);
      setLoading(false);
    } catch (error) {
      console.error('Error during script execution or file download:', error);
    } finally {
      toast.dismiss(tid);
    }
  };

  return (
    <Stack className="w-full" direction="row" spacing={3} sx={{}}>
      <PanelGroup direction="horizontal" className="h-full" style={{ minHeight: '90vh' }}>
        <Panel defaultSize={50} maxSize={80} minSize={20}>
          <Stack direction="column" className="px-6" spacing={2} alignItems="center">
            {' '}
            <Typography variant="h4">{name}</Typography>
            <Stack direction="row" flexWrap="wrap" spacing={2} alignItems="center">
              <Button
                disabled={loading || !uploadRequired}
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
              >
                {file ? file.name : 'Upload Input File'}
                <input type="file" accept=".zip" hidden onChange={handleFileUpload} />
              </Button>
              <Button
                disabled={loading}
                variant="contained"
                color="primary"
                startIcon={<RunIcon />}
                onClick={handleRunCommandV2}
              >
                Run Script
              </Button>
            </Stack>
            <Paper variant="outlined" style={{ padding: '20px', margin: '10px', width: '100%' }}>
              <Typography variant="subtitle1">Author: {author}</Typography>
              <Typography variant="subtitle1">
                Category: {category !== '' && <CategoryChips category={category} />}
              </Typography>
            </Paper>
            <Paper variant="outlined" style={{ padding: '20px', margin: '10px', width: '100%' }}>
              <Typography variant="subtitle2">Description:</Typography>
              {/* render as html */}
              <div dangerouslySetInnerHTML={{ __html: description }} />
            </Paper>
            <Paper variant="outlined" style={{ padding: '20px', margin: '10px', width: '100%' }}>
              <Typography variant="subtitle2">Instructions:</Typography>
              <div dangerouslySetInnerHTML={{ __html: instruction }} />
            </Paper>
          </Stack>
        </Panel>
        <PanelResizeHandle>
          <Divider orientation="vertical" />
        </PanelResizeHandle>
        <Panel maxSize={80} minSize={20}>
          <PanelGroup direction="vertical">
            <Panel>
              {' '}
              <Editor className="" defaultLanguage="python" value={code} options={{ readOnly: true, wordWrap: 'on' }} />
            </Panel>
            <PanelResizeHandle>
              <Divider orientation="horizontal" />
            </PanelResizeHandle>
            <Panel>
              <PanelGroup direction="horizontal">
                <Panel>
                  <Typography className="p-2" variant="subtitle2">
                    Output:
                  </Typography>
                  <Editor value={log} options={{ readOnly: true, wordWrap: 'on' }} />
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </Stack>
  );
}
