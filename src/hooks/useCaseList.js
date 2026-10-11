import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';

// Keep case data in memory while users move between routes. This avoids
// persisting sensitive case records in localStorage or sessionStorage.
const caseCache = new Map();
const caseRequests = new Map();
const requestVersions = new Map();

function cacheKey(endpoint, scope) {
  return String(scope) + ':' + endpoint;
}

function getCachedCaseList(endpoint, scope) {
  const key = cacheKey(endpoint, scope);
  return caseCache.has(key) ? caseCache.get(key) : null;
}

function fetchCaseList(endpoint, scope, { force = false } = {}) {
  const key = cacheKey(endpoint, scope);
  if (!force && caseRequests.has(key)) return caseRequests.get(key);

  const version = force
    ? (requestVersions.get(key) || 0) + 1
    : (requestVersions.get(key) || 0);
  requestVersions.set(key, version);

  const request = api.get(endpoint)
    .then(({ data }) => {
      if (!Array.isArray(data)) throw new Error('The cases response was not a list.');
      if (requestVersions.get(key) === version) caseCache.set(key, data);
      return data;
    })
    .finally(() => {
      if (caseRequests.get(key) === request) caseRequests.delete(key);
    });

  caseRequests.set(key, request);
  return request;
}

export default function useCaseList(endpoint, scope) {
  const [cases, setCases] = useState(() => getCachedCaseList(endpoint, scope) ?? []);
  const [loading, setLoading] = useState(() => getCachedCaseList(endpoint, scope) === null);
  const [error, setError] = useState('');

  const load = useCallback(async ({ force = false, isActive = () => true } = {}) => {
    const cached = getCachedCaseList(endpoint, scope);
    if (cached !== null) {
      setCases(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const nextCases = await fetchCaseList(endpoint, scope, { force });
      if (isActive()) {
        setCases(nextCases);
        setError('');
      }
      return nextCases;
    } catch {
      if (isActive()) {
        setError(cached === null
          ? 'Failed to load cases. Please try again.'
          : 'Could not refresh cases. Showing the last loaded data.');
      }
      return null;
    } finally {
      if (isActive()) setLoading(false);
    }
  }, [endpoint, scope]);

  useEffect(() => {
    let active = true;
    void load({ isActive: () => active });
    return () => { active = false; };
  }, [endpoint, load, scope]);

  const refreshCases = useCallback(() => load({ force: true }), [load]);

  return { cases, loading, error, refreshCases };
}
