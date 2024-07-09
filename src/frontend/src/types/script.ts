export interface Script {
  file_path: string;
  name: string;
  label: string;
  description: string;
  instruction: string;
  code: string;
  status: string;
}

export interface ScriptRequest {
  file_path: string;
  status: string;
  description: string;
  instruction: string;
  name: string;
  code: string;
  label: string;
  uploadRequired: boolean;
}

export interface ScriptTableData {
  scriptId: string;
  name: string;
  category: string;
  creator: string;
  lastUpdatedAt: string;
  status: boolean;
  isFavScript: boolean | null;
}

export interface ScriptTableProps {
  count: number;
  page: number;
  // rows: ScriptTableData[];
  rowsPerPage: number;
  scripts: ScriptTableData[];
  favScriptList: string[];
  setScripts: React.Dispatch<React.SetStateAction<ScriptTableData[]>>;
  onExecution: (scripId: string) => void;
  onFavScript: (script: ScriptTableData) => void;
  onDeleteScript: (scripId: string) => void;
  onEditScript: (scripId: string) => void;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (script: ScriptTableData) => void;
}

export interface ScriptDetails {
  newScriptName: string;
  category: string;
  scriptDescription: string;
  scriptInstruction: string;
  scriptContent: string;
}

export interface AddScriptDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  scriptDetails: ScriptDetails;
  setScriptDetails: React.Dispatch<React.SetStateAction<ScriptDetails>>;
}
