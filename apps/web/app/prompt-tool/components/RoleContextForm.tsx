// apps/web/app/prompt-tool/components/RoleContextForm.tsx

'use client';

import { useEffect } from 'react';
import { RoleContextFormProps } from '@/lib/prompt-tool/types';

export default function RoleContextForm({
  role,
  setRole,
  roleDescription,
  setRoleDescription,
  defaultDescriptions,
  context,
  setContext,
  defaultContext,
  className = '',
}: RoleContextFormProps) {
  useEffect(() => {
    if (defaultDescriptions[role]) {
      setRoleDescription(defaultDescriptions[role]);
    }
  }, [role, defaultDescriptions, setRoleDescription]);

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <div className="flex flex-col gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
        >
          {Object.keys(defaultDescriptions).map((defaultRole) => (
            <option key={defaultRole} value={defaultRole}>
              {defaultRole}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-base flex-1"
          value={roleDescription}
          onChange={(e) => setRoleDescription(e.target.value)}
          placeholder="Describe the role..."
        />
        <textarea
          className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-base flex-1"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={defaultContext}
        />
      </div>
    </div>
  );
}
