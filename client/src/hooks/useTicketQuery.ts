import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TicketQuery } from '../lib/types';
import { useDebounce } from './useDebounce';

/**
 * Keeps list filters in the URL (?status=Open&page=2) so they survive refresh,
 * back/forward navigation and can be shared as links. Search input is debounced.
 */
export function useTicketQuery(limit = 10) {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const debouncedSearch = useDebounce(search.trim());

  const query: TicketQuery = useMemo(
    () => ({
      status: (params.get('status') ?? '') as TicketQuery['status'],
      priority: (params.get('priority') ?? '') as TicketQuery['priority'],
      category: (params.get('category') ?? '') as TicketQuery['category'],
      sort: (params.get('sort') ?? 'newest') as TicketQuery['sort'],
      search: params.get('search') ?? '',
      page: Number(params.get('page') ?? 1) || 1,
      limit,
    }),
    [params, limit],
  );

  const update = useCallback(
    (patch: Partial<TicketQuery>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === '' || v === undefined || (k === 'sort' && v === 'newest') || (k === 'page' && v === 1)) next.delete(k);
            else next.set(k, String(v));
          }
          // Any filter change resets to page 1
          if (!('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  // Push the debounced search term into the URL
  useEffect(() => {
    if (debouncedSearch !== (params.get('search') ?? '')) update({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return { query, update, search, setSearch };
}
