import { downloadOutput } from '@/services/common';

const createDownloadLink = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url); // Cleanup URL after download
};

export const downloadOutputById = async (execId) => {
  try {
    const response = await downloadOutput(execId);
    if (!response) throw new Error('No data received from downloadOutput.');

    const blob = new Blob([response], { type: 'application/zip' });
    createDownloadLink(blob, `exec-${execId}-output.zip`);
  } catch (error) {
    console.error('Failed to download file:', error);
  }
};
