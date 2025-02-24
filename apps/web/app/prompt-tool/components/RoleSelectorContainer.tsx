import React from 'react';

interface RoleSelectorContainerProps {
  role: string;
  setRole: (role: string) => void;
  defaultDescriptions: Record<string, string>;
  setRoleDescription: (desc: string) => void;
}

const RoleSelectorContainer: React.FC<RoleSelectorContainerProps> = ({
  role,
  setRole,
  defaultDescriptions,
  setRoleDescription,
}) => {
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    setRoleDescription(defaultDescriptions[selectedRole] || '');
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Role
      </label>
      <select
        value={role}
        onChange={handleRoleChange}
        className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        {Object.keys(defaultDescriptions).map((roleOption) => (
          <option key={roleOption} value={roleOption}>
            {roleOption}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoleSelectorContainer;
