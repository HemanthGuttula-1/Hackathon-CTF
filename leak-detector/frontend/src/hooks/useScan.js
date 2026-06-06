import { useState, useCallback } from 'react';
import * as api from '../services/api.js';

export const useScan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  const scanRepo = useCallback(async (repo) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.scanRepo(repo);
      const newResults = response.data.data || [];
      setResults(prev => [...newResults, ...prev]);
      return newResults;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const globalScan = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.globalScan();
      const newResults = response.data.data || [];
      setResults(prev => [...newResults, ...prev]);
      return newResults;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    scanRepo,
    globalScan,
    loading,
    error,
    results,
    clearResults,
    setError
  };
};