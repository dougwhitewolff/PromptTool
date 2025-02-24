// apps/web/app/prompt-tool/lib/prompt.ts

interface DirectoryEntry {
  name: string;
  type: 'directory' | 'file';
  children?: DirectoryEntry[];
}

interface GeneratePromptParams {
  role: string;
  roleDescription: string;
  context: string;
  objective: string;
  instructions: string[];
  directoryStructure: DirectoryEntry[];
  selectedFiles: { path: string; content: string }[];
  analysisFramework?: string;
}

function printDirectoryStructure(
  directory: DirectoryEntry[],
  prefix = ''
): string {
  return directory
    .map((item) => {
      if (item.type === 'directory') {
        const dirLine = `${prefix}|-- ${item.name}/`;
        const childrenLines = item.children
          ? printDirectoryStructure(item.children, `${prefix}|   `)
          : '';
        return `${dirLine}\n${childrenLines}`;
      } else {
        return `${prefix}|-- ${item.name}`;
      }
    })
    .join('\n');
}

export async function generatePrompt({
  role = '',
  roleDescription = '',
  context = '',
  objective = '',
  instructions = [],
  directoryStructure = [],
  selectedFiles = [],
  analysisFramework = '',
}: Partial<GeneratePromptParams>): Promise<string> {
  let prompt = '';

  // Add Role Description (always include)
  const cleanRoleDescription = roleDescription?.trim();
  if (cleanRoleDescription) {
    prompt += `${cleanRoleDescription}\n\n`;
  } else if (role) {
    prompt += `You are an ${role}\n\n`;
  } else {
    prompt += `You are an Expert Software Developer\n\n`;
  }

  // Add Technical Context (always include)
  prompt += `[Technical Context]\n${context || 'Not specified'}\n\n`;

  // Add Objective (always include)
  const cleanObjective = objective?.trim();
  prompt += `[Objective]\n${cleanObjective || 'No objective specified yet'}\n\n`;

  // Add Directory Structure (always include)
  const structureText = directoryStructure?.length
    ? printDirectoryStructure(directoryStructure)
    : 'No directory structure loaded. Click "Refresh Directory" to load the structure.';
  prompt += `[Directory Structure]\n${structureText}\n\n`;

  // Add Selected Files (always include)
  prompt += `[Selected Files]\n`;
  if (selectedFiles?.length > 0) {
    for (const file of selectedFiles) {
      prompt += `=== Start of ${file.path} ===\n\n${file.content}\n\n=== End of ${file.path} ===\n\n`;
    }
  } else {
    prompt +=
      'No files currently selected. Use the directory tree to select files.\n\n';
  }

  // Add Analysis Framework (always include)
  prompt += `[Analysis Framework]\n`;
  if (analysisFramework?.trim()) {
    prompt += `${analysisFramework}\n\n`;
  } else {
    prompt +=
      'No analysis framework specified. Add a framework to guide the analysis process.\n\n';
  }

  // Add any additional instructions
  if (instructions?.length > 0) {
    prompt += `[Additional Instructions]\n`;
    instructions.forEach((instr) => {
      if (instr?.trim()) {
        prompt += `${instr}\n`;
      }
    });
    prompt += '\n';
  }

  return prompt.trim();
}
