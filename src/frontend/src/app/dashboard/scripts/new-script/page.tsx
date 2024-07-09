'use client';

import * as React from 'react';
import { useState } from 'react';
import useNewScriptStore from '@/stores/new-script-store';
import Editor from '@monaco-editor/react';
import { Divider } from '@mui/material';
import Stack from '@mui/material/Stack';

import 'quill/dist/quill.snow.css';

import { useRouter } from 'next/navigation';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { toast } from 'react-toastify';

import AddScriptActions from '@/components/dashboard/script/addScriptActions';
import ScriptFormFields from '@/components/dashboard/script/ScriptFormFields';





export default function Page(): React.JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { name, code, updateCode, addNewScript, reset, getScriptData, updateScriptData } = useNewScriptStore();
  // file upload
  const handleAddScript = async () => {
    if (name === '') {
      toast.error('Please enter script name');
      return;
    }
    if (code === '') {
      toast.error('Please enter script code');
      return;
    }
    setLoading(true);
    const res = await toast.promise(addNewScript, {
      pending: 'Loading...',
      success: 'Script added successfully',
      error: 'error',
    });
    setLoading(false);
    if (res.success) {
      const id = res.data.id;
      reset();
      router.push(`/dashboard/scripts/${id}/execution`);
    }
  };
  // init value in edit mode

  return (
    <Stack className="w-full" direction="row" spacing={3} sx={{}}>
      <PanelGroup direction="horizontal" className="h-full" style={{ minHeight: '90vh' }}>
        <Panel defaultSize={50} maxSize={80} minSize={20}>
          <Stack direction="column" spacing={3} className="p-6">
            <ScriptFormFields scriptData={getScriptData()}   updateScriptData={updateScriptData} />
            <div className="mt-3" >
            </div>
            <AddScriptActions loading={loading} reset={reset} handleAddScript={handleAddScript} />
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
                value={code}
                onChange={(value) => {
                  if (value) {
                    updateCode(value as string);
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
