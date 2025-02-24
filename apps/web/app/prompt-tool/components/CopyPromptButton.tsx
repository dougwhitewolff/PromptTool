// apps/web/app/prompt-tool/components/CopyPromptButton.tsx

'use client';

interface CopyPromptButtonProps {
  onCopy: () => void;
}

/**
 * Component for the "Copy Prompt" button.
 * Positioned strategically within the UI for easy access.
 */
export default function CopyPromptButton({ onCopy }: CopyPromptButtonProps) {
  return (
    <button
      onClick={onCopy}
      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow"
      title="Copy the generated prompt to clipboard"
    >
      Copy Prompt
    </button>
  );
}
