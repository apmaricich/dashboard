import { useState, useEffect, useCallback } from 'react';

interface UseRefreshResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const useRefresh = <T>(
  intervalSeconds: number,
  dataFn: () => Promise<T>
): UseRefreshResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await dataFn();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [dataFn]);

  useEffect(() => {
    fetchData();

    const intervalMs = intervalSeconds * 1000;
    const timer = setInterval(fetchData, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [intervalSeconds, fetchData]);

  return { data, isLoading, error, lastUpdated };
};

export default useRefresh;
