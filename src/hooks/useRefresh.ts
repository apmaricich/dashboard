import { useCallback, useState } from "react";

export function useRefresh<T>(fetcher: () => T, intervalMs: number): T {
  const [data, setData] = useState<T>(() => fetcher());

  const refresh = useCallback(() => {
    setData(fetcher());
  }, [fetcher]);

  return data;
}
