/**
 * useHistory — Hook fetch lịch sử nghe
 *
 * Pattern: { data, loading, error }
 *
 * === CÁCH DÙNG ===
 * const { data: history, loading, error } = useHistory(() => songService.getRecentlyPlayed());
 */

import { useState, useEffect, useCallback } from 'react';

export function useHistory(fetchFn) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchFn()
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [fetchFn]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
