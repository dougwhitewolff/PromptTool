// apps/web/app/prompt-tool/components/RoleDescriptionContainer.tsx

import React from 'react';

interface RoleDescriptionContainerProps {
  roleDescription: string;
  setRoleDescription: (desc: string) => void;
}

const RoleDescriptionContainer: React.FC<RoleDescriptionContainerProps> = ({
  roleDescription,
  setRoleDescription,
}) => {
  return (
    <div className="flex flex-col h-full space-y-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Role Description
      </label>
      <textarea
        value={roleDescription}
        onChange={(e) => setRoleDescription(e.target.value)}
        className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
        rows={6}
        placeholder="Enter role description..."
      />
    </div>
  );
};

export default RoleDescriptionContainer;
