// app/prompt-tool/components/AnalysisFrameworkForm.tsx

import React from 'react';

interface AnalysisFrameworkFormProps {
  framework: string;
  setFramework: (framework: string) => void;
}

const AnalysisFrameworkForm: React.FC<AnalysisFrameworkFormProps> = ({
  framework,
  setFramework,
}) => {
  return (
    <div className="flex flex-col h-full space-y-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300"></label>
      <textarea
        value={framework.trimStart()} // Trims leading blank lines or spaces
        onChange={(e) => setFramework(e.target.value)}
        className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
        rows={12} // Increased from 6 to 12
        placeholder="Describe your analysis framework here..."
      />
    </div>
  );
};

export default AnalysisFrameworkForm;
