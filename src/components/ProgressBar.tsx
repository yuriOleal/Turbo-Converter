import React from 'react';

interface ProgressBarProps {
  percent: number;
  message?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percent, message }) => {
  const clampedPercent = Math.max(0, Math.min(100, percent));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {message && (
          <span className="text-sm text-slate-600 dark:text-slate-300 truncate mr-2">
            {message}
          </span>
        )}
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 ml-auto">
          {Math.round(clampedPercent)}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={clampedPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full h-3 bg-slate-200 dark:bg-dark-800 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
