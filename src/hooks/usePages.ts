import { useState, useCallback, useMemo } from 'react';

interface UsePagesResult {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

/**
 * Hook for dashboard page management.
 *
 * Calculates the total number of pages based on the number of widgets
 * and max widgets per page, and provides navigation methods.
 *
 * @param totalWidgets - The total number of widgets to paginate
 * @param maxWidgetsPerPage - The maximum number of widgets per page
 * @returns Object with currentPage, totalPages, goToPage, nextPage, prevPage
 */
const usePages = (
  totalWidgets: number,
  maxWidgetsPerPage: number
): UsePagesResult => {
  const [currentPage, setCurrentPage] = useState<number>(0);

  const totalPages = useMemo(() => {
    if (totalWidgets <= 0) return 0;
    return Math.ceil(totalWidgets / maxWidgetsPerPage);
  }, [totalWidgets, maxWidgetsPerPage]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 0 && page < totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (currentPage + 1 < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  return { currentPage, totalPages, goToPage, nextPage, prevPage };
};

export default usePages;
