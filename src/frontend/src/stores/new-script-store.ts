import { AddNewScriptResponse, addScript } from '@/services/common';
import { create } from 'zustand';

import { APIResponse } from '@/types/api';

interface ScriptState {
  name: string;
  category: string;
  description: string;
  instruction: string;
  code: string;
  uploadRequired: boolean;
}

interface ScriptActions {
  updateName: (name: string) => void;
  updateCategory: (category: string) => void;
  updateDescription: (description: string) => void;
  updateInstruction: (instruction: string) => void;
  updateCode: (code: string) => void;
  updateUploadRequired: (uploadRequired: boolean) => void;
  reset: () => void;
  addNewScript: () => Promise<APIResponse<AddNewScriptResponse>>;
  updateScriptData: (key: string, value: string) => void;
  getScriptData: () => ScriptState;
}

const useNewScriptStore = create<ScriptState & ScriptActions>((set, get) => ({
  name: '',
  category: '',
  description: '',
  instruction: '',
  code: '',
  uploadRequired: false,
  updateName: (name) => {
    set({ name });
  },
  updateCategory: (category) => {
    set({ category });
  },
  updateDescription: (description) => {
    set({ description });
  },
  updateInstruction: (instruction) => {
    set({ instruction });
  },
  updateCode: (code) => {
    set({ code });
  },
  updateUploadRequired: (uploadRequired) => {
    set({ uploadRequired });
  },
  reset: () => {
    set({
      name: '',
      category: '',
      description: '',
      instruction: '',
      code: '',
      uploadRequired: false,
    });
  },
  addNewScript: async () => {
    const { name, description, instruction, code, category, uploadRequired } = get();
    const scriptRequest = {
      file_path: 'filePath', // Example placeholder, update accordingly
      status: 'completed', // Example placeholder, update accordingly
      description,
      instruction,
      name,
      code,
      uploadRequired: uploadRequired, // Example placeholder, update accordingly
      label: category, // Assuming `category` is intended to be `label` here
    };

    const response = await addScript(scriptRequest); // Assuming `addScript` is an API call function
    return response;
  },
  updateScriptData: (key, value) => {
    set({ [key]: value });
  },
  getScriptData: () => {
    const { name, category, description, instruction, code, uploadRequired } = get();
    return { name, category, description, instruction, code, uploadRequired };
  },
}));

export default useNewScriptStore;
