'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Divider } from '@mui/material';
import Stack from '@mui/material/Stack';

import 'quill/dist/quill.snow.css';

import { useRouter } from 'next/navigation';
import { fetchScript, updateScript } from '@/services/common';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { toast } from 'react-toastify';

import AddScriptActions from '@/components/dashboard/script/addScriptActions';
import ScriptFormFields from '@/components/dashboard/script/ScriptFormFields';

interface ScriptData {
  name: string;
  category: string;
  description: string;
  instruction: string;
  code: string;
  uploadRequired: boolean;
}

export default function Page({ params }: { params: { scriptId: number } }): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const scriptId = params.scriptId;
  const [scriptData, setScriptData] = useState<ScriptData>({
    name: '',
    category: '',
    description: '',
    instruction: '',
    code: '',
    uploadRequired: false,
  });
  const [desc, setDesc] = useState('');
  const router = useRouter();
  const updateScriptData = (key, value) => {
    setScriptData((prev) => ({ ...prev, [key]: value }));
  };
  useEffect(() => {
    loadScript();
  }, []);
  const loadScript = async () => {
    try {
      const tid = toast.loading('Loading...');
      const res = await fetchScript(scriptId);
      toast.dismiss(tid);
      setScriptData({
        name: res.data.script_name,
        category: res.data.label,
        description: res.data.description,
        instruction: res.data.instruction,
        code: res.data.code,
        uploadRequired: res.data.upload_required,
      });
      setDesc(res.data.description);
    } catch (error) {
      console.error('Failed to fetch script:', error);
    }
  };
  const editScript = async () => {
    try {
      return await updateScript({
        id: scriptId,
        label: scriptData.category,
        upload_required: scriptData.uploadRequired,
        description: scriptData.description,
        instruction: scriptData.instruction,
        name: scriptData.name,
        code: scriptData.code,
      });
    } catch (error) {
      console.error('Failed to fetch script:', error);
    }
  };

  const handleEditScript = async () => {
    if (scriptData.name === '') {
      toast.error('Please enter script name');
      return;
    }
    if (scriptData.code === '') {
      toast.error('Please enter script code');
      return;
    }

    setLoading(true);
    const res = await toast.promise(editScript, {
      pending: 'Loading...',
      success: 'Script updated successfully',
      error: 'error',
    });
    setLoading(false);
    if (res?.success) {
      router.push(`/dashboard/scripts`);
    }
  };
  const reset = async () => {
    await loadScript();
  };

  return (
    <Stack className="w-full" direction="row" spacing={3} sx={{}}>
      <PanelGroup direction="horizontal" className="h-full" style={{ minHeight: '90vh' }}>
        <Panel defaultSize={50} maxSize={80} minSize={20}>
          <Stack direction="column" spacing={3} className="p-6">
            <ScriptFormFields scriptData={scriptData} updateScriptData={updateScriptData} />
            <div className="mt-10">
              <AddScriptActions loading={loading} reset={reset} handleAddScript={handleEditScript} />
            </div>
          </Stack>
        </Panel>
        <PanelResizeHandle>
          <Divider orientation="vertical" />
        </PanelResizeHandle>
        <Panel maxSize={80} minSize={20}>
          <PanelGroup direction="vertical">
            <Panel>
              {' '}
              <Editor
                className=""
                defaultLanguage="python"
                value={scriptData.code}
                onChange={(value) => {
                  if (value) {
                    setScriptData({ ...scriptData, code: value as string });
                  }
                }}
                options={{ wordWrap: 'on' }}
              />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </Stack>
  );
}
