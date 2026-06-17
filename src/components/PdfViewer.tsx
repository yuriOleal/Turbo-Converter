import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PdfViewerProps {
  renderedPages: string[];
  pageCount: number;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ renderedPages, pageCount }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const goToPrevious = useCallback(() => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentPage((prev) => Math.min(pageCount - 1, prev + 1));
  }, [pageCount]);

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === pageCount - 1;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Page display */}
      <div className="w-full bg-slate-100 dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center p-4">
        <img
          src={renderedPages[currentPage]}
          alt={`Page ${currentPage + 1} of ${pageCount}`}
          className="max-w-full h-auto rounded shadow-md transition-opacity duration-200"
        />
      </div>

      {/* Navigation controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={goToPrevious}
          disabled={isFirstPage}
          aria-label="Previous page"
          className="p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-900 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>

        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
          Page {currentPage + 1} of {pageCount}
        </span>

        <button
          onClick={goToNext}
          disabled={isLastPage}
          aria-label="Next page"
          className="p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-900 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
      </div>
    </div>
  );
};

export default PdfViewer;
