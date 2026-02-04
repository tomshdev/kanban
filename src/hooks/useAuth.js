import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEY } from '../lib/constants';
import { createOctokit, clearOctokit } from '../lib/github';

export function useAuth() {
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const validateToken = useCallback(async (t) => {
    try {
      setLoading(true);
      setError(null);
      const octokit = createOctokit(t);
      const { data } = await octokit.rest.users.getAuthenticated();
      setUser(data);
      setTokenState(t);
      return true;
    } catch (err) {
      setError('Invalid token. Please check and try again.');
      clearOctokit();
      setTokenState(null);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored =
      sessionStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(STORAGE_KEY);
    if (stored) {
      validateToken(stored);
    } else {
      setLoading(false);
    }
  }, [validateToken]);

  const setToken = useCallback(
    async (t, remember = false) => {
      const valid = await validateToken(t);
      if (valid) {
        if (remember) {
          localStorage.setItem(STORAGE_KEY, t);
        } else {
          sessionStorage.setItem(STORAGE_KEY, t);
        }
      }
      return valid;
    },
    [validateToken]
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    clearOctokit();
    setTokenState(null);
    setUser(null);
    setError(null);
  }, []);

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    setToken,
    logout,
  };
}
