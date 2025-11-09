import { useState, useCallback } from 'react';

/**
 * Custom hook for handling API mutations (POST, PUT, DELETE operations)
 * @param {Function} mutationFn - The API function to call
 * @param {Object} options - Optional configuration
 * @param {Function} options.onSuccess - Callback to run on successful mutation
 * @param {Function} options.onError - Callback to run on mutation error
 * @returns {Object} Mutation state and function
 */
export const useApiMutation = (mutationFn, options = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(async (...args) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await mutationFn(...args);
      
      if (result.success) {
        setData(result.data);
        options.onSuccess?.(result.data);
        return result;
      } else {
        const error = new Error(result.message || 'Operation failed');
        setError(error);
        options.onError?.(error);
        return result;
      }
    } catch (error) {
      setError(error);
      options.onError?.(error);
      return {
        success: false,
        message: error.message || 'An unexpected error occurred'
      };
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    mutate,
    isLoading,
    error,
    data,
    reset
  };
};