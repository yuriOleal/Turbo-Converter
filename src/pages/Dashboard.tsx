import React from 'react';
import { useHistory } from '../hooks/useHistory';
import { Clock, Download, Trash2 } from 'lucide-react';

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
}

const Dashboard: React.FC = () => {
  const { history, clearHistory } = useHistory();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Conversion History
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Your recent file conversions
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
            aria-label="Clear all conversion history"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        )}
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            No conversions yet
          </h2>
          <p className="text-slate-400 dark:text-slate-500 max-w-sm">
            Your conversion history will appear here after you process your first file.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm dark:shadow-none"
            >
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {entry.fileName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-turbo-600 dark:text-turbo-400 bg-turbo-50 dark:bg-turbo-950/30 px-2 py-0.5 rounded">
                    {entry.toolName}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(entry.timestamp)}
                  </span>
                </div>
              </div>
              {entry.resultBlobUrl && (
                <a
                  href={entry.resultBlobUrl}
                  download={entry.fileName}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-turbo-600 hover:bg-turbo-700 rounded-lg transition-colors shrink-0"
                  aria-label={`Download ${entry.fileName}`}
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
