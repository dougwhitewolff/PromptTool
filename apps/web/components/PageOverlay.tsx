import React from 'react';

interface PageOverlayProps {
  isOpen: boolean;
  title: string;
  description: string;
  onDismiss: () => void;
}

const PageOverlay: React.FC<PageOverlayProps> = ({
  isOpen,
  title,
  description,
  onDismiss,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 max-w-2xl w-full mx-4 p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
        <button
          onClick={onDismiss}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 transition-colors duration-200"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default PageOverlay;