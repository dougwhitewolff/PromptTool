// apps/web/app/prompt-tool/lib/prompt-tool/types.ts

export interface DirectoryEntry {
  name: string;
  type: 'directory' | 'file';
  children?: DirectoryEntry[];
}

export interface GeneratePromptParams {
  role: string;
  roleDescription: string;
  context: string;
  objective: string;
  instructions: string[];
  directoryStructure: DirectoryEntry[];
  selectedFiles: { path: string; content: string }[];
  analysisFramework?: string;
}

export interface RoleContextFormProps {
  role: string;
  setRole: (role: string) => void;
  roleDescription: string;
  setRoleDescription: (description: string) => void;
  defaultDescriptions: Record<string, string>;
  context: string;
  setContext: (context: string) => void;
  defaultContext: string;
  className?: string;
}

export interface DirectoryTreeProps {
  directory: DirectoryEntry[];
  selectedFiles: string[];
  setSelectedFiles: (files: string[]) => void;
  currentPath: string;
}

export interface GeneratePromptResponse {
  prompt: string;
}
