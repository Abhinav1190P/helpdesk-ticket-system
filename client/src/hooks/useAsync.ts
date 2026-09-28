import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../api/client';

/**
 * Small data-fetching hook: runs `fn` whenever `deps` change and exposes
 * { data, loading, error, reload, setData }. Stale responses are ignored.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await run();
      if (id === requestId.current) setData(result);
    } catch (e) {
      if (id === requestId.current) setError(getErrorMessage(e));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load, setData };
}
