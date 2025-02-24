// apps/web/app/prompt-tool/layout.tsx

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prompt Tool',
  description: 'A tool to generate structured prompts for LLM coding tasks.',
};

export default function PromptToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {children}
    </div>
  );
}
