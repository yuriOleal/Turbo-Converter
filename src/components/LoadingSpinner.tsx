import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <div className="w-10 h-10 border-4 border-slate-200 dark:border-dark-800 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-sm text-slate-500 dark:text-slate-400">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
