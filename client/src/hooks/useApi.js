import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cache = useRef(new Map());
  const isMounted = useRef(true);

  const getCacheKey = () => dependencies.join('|') || 'default';

  const fetchData = async () => {
    const cacheKey = getCacheKey();
    
    // Return cached data if available and caching is enabled
    if (options.cache && cache.current.has(cacheKey)) {
      setData(cache.current.get(cacheKey));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      
      if (isMounted.current) {
        setData(result);
        if (options.cache) {
          cache.current.set(cacheKey, result);
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err);
        toast.error(err.message || 'An error occurred');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    
    return () => {
      isMounted.current = false;
    };
  }, dependencies);

  const refetch = () => {
    // Clear cache when manually refetching
    const cacheKey = getCacheKey();
    cache.current.delete(cacheKey);
    return fetchData();
  };

  return { data, loading, error, refetch };
};

export const useApiMutation = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(data);
      return { success: true, data: result };
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.message || 'An error occurred');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};