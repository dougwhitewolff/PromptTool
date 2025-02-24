// apps/web/lib/prompt-tool/utils.ts

import { DirectoryEntry, GeneratePromptParams } from './types';

/**
 * Normalizes a file path by removing leading/trailing slashes and replacing multiple slashes with a single one.
 *
 * @param filePath - The original file path.
 * @returns The normalized file path.
 */
export function normalizeFilePath(filePath: string): string {
  let normalized = filePath
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/\/+/g, '/');

  const segments = normalized.split('/');
  if (segments[0] === 'apps' && segments.length >= 2) {
    const appName = segments[1];
    const duplicatePattern = new RegExp(`^(apps\\/${appName}\\/)+`);
    normalized = normalized.replace(duplicatePattern, `apps/${appName}/`);
  }

  return normalized;
}

/**
 * Recursively prints the directory structure in a tree-like format.
 *
 * @param directory - An array of DirectoryEntry representing the directory structure.
 * @param prefix - The prefix string for formatting.
 * @returns A formatted string representing the directory tree.
 */
export function printDirectoryStructure(
  directory: DirectoryEntry[],
  prefix = ''
): string {
  return directory
    .map((item, index) => {
      const isLast = index === directory.length - 1;
      const pointer = isLast ? '└─' : '├─';
      const newPrefix = prefix + (isLast ? '   ' : '│  ');

      if (item.type === 'directory') {
        const dirLine = `${prefix}${pointer} ${item.name}/`;
        const childrenLines = item.children
          ? printDirectoryStructure(item.children, newPrefix)
          : '';
        return `${dirLine}\n${childrenLines}`;
      } else {
        return `${prefix}${pointer} ${item.name}`;
      }
    })
    .join('\n');
}

/**
 * Generates a formatted prompt based on the provided parameters.
 *
 * @param params - Parameters for generating the prompt.
 * @returns A string representing the formatted prompt.
 */
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

  const cleanRoleDescription = roleDescription?.trim();
  if (cleanRoleDescription) {
    prompt += `${cleanRoleDescription}\n\n`;
  } else if (role) {
    prompt += `You are an ${role}\n\n`;
  }

  prompt += `**Context:**\n${context || 'Not specified'}\n\n`;

  const cleanObjective = objective?.trim();
  if (cleanObjective) {
    prompt += `**Objective:**\n${cleanObjective}\n\n`;
  }

  const structureText = directoryStructure?.length
    ? printDirectoryStructure(directoryStructure)
    : 'No directory structure available.';
  prompt += `**Directory Structure:**\n\`\`\`plaintext\n${structureText}\n\`\`\`\n\n`;

  if (selectedFiles?.length > 0) {
    prompt += `**Selected Files Content:**\n`;
    for (const file of selectedFiles) {
      prompt += `\`\`\`typescript\n// === Start of ${file.path} ===\n${file.content}\n// === End of ${file.path} ===\n\`\`\`\n\n`;
    }
  }

  if (analysisFramework?.trim()) {
    prompt += `**Analysis Framework:**\n\`\`\`markdown\n${analysisFramework}\n\`\`\`\n\n`;
  }

  if (instructions?.length > 0) {
    prompt += `**Additional Instructions:**\n`;
    instructions.forEach((instr) => {
      if (instr?.trim()) {
        prompt += `- ${instr}\n`;
      }
    });
    prompt += `\n`;
  }

  return prompt.trim();
}

/**
 * Debounce function to delay the execution of a function until after a specified wait time has elapsed.
 *
 * @param func - The function to debounce.
 * @param wait - The number of milliseconds to wait before invoking the function.
 * @returns A debounced version of the input function.
 */
export function debounce<F extends (...args: any[]) => void>(
  func: F,
  wait: number
): (...args: Parameters<F>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
