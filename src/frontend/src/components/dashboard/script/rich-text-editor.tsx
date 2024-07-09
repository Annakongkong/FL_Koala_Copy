import React from 'react';
import { Typography } from '@mui/material';
import ReactQuill from 'react-quill';






import 'quill/dist/quill.snow.css'; // Ensure Quill styles are imported for the 'snow' theme





function RichTextEditor({ label, content, onContentChange }) {
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
    history: {
      delay: 500,
      maxStack: 100,
    },
  };

  const formats = [
    // Define the formats you want to allow in the editor
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'link',
  ];

  return (
    <div>
      <Typography className="" variant="h6">
        {label}
      </Typography>
      <ReactQuill
      className="mt-2"
        theme="snow"
        value={content}
        onChange={onContentChange}
        modules={modules}
        formats={formats}
        style={{ height: 150 }}
      />
    </div>
  );
}

export default RichTextEditor;
