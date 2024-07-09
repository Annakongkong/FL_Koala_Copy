import React from 'react';
import { Checkbox, FormControlLabel, TextField } from '@mui/material';

import RichTextEditor from '@/components/dashboard/script/rich-text-editor';





function ScriptFormFields({ scriptData, updateScriptData }) {
  const { name, category, description, instruction, uploadRequired } = scriptData;

  return (
    <>
      <TextField
        fullWidth
        required
        label="Script Name"
        value={name}
        onChange={(e) => updateScriptData('name', e.target.value)}
        variant="outlined"
      />
      <TextField
        fullWidth
        label="Categories (comma separated)"
        value={category}
        onChange={(e) => updateScriptData('category', e.target.value)}
        variant="outlined"
      />
      <FormControlLabel
        control={
          <Checkbox checked={uploadRequired} onChange={(e) => updateScriptData('uploadRequired', e.target.checked)} />
        }
        label="Upload File"
      />
      <div className="">
        <RichTextEditor
          label="Description"
          content={description}
          onContentChange={(value) => updateScriptData('description', value)}
        />
      </div>
      <div className="mt-6">
        <RichTextEditor
          label="Instruction"
          content={instruction}
          onContentChange={(value) => updateScriptData('instruction', value)}
        />
      </div>
    </>
  );
}

export default ScriptFormFields;
