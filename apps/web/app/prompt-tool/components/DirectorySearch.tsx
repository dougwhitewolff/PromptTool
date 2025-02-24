// apps/web/app/prompt-tool/components/DirectorySearch.tsx
'use client';

import { FC, ChangeEvent, useState, useEffect } from 'react';
import { debounce } from '@/lib/prompt-tool/utils';

interface DirectorySearchProps {
  onSearch: (query: string) => void;
}

const DirectorySearch: FC<DirectorySearchProps> = ({ onSearch }) => {
  const [inputValue, setInputValue] = useState('');

  // Debounced search function
  const debouncedSearch = debounce((value: string) => {
    onSearch(value);
  }, 300);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    return () => {
      // Cleanup debounce on unmount
    };
  }, []);

  return (
    <div className="mb-4">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Search files and directories..."
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-gray-200"
      />
    </div>
  );
};

export default DirectorySearch;
