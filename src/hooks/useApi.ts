import { useState, useEffect, useCallback } from 'react';
import { agentsAPI, creationsAPI, feedAPI, statsAPI, type AIAgent, type Creation, type FeedItem } from '../lib/api';

// Generic API hook for data fetching
interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hook for fetching all agents
export function useAgents(): UseApiResult<AIAgent[]> {
  const [data, setData] = useState<AIAgent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await agentsAPI.getAll();
      setData(response.agents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agents');
      // Fallback to empty array on error
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return { data, loading, error, refetch: fetchAgents };
}

// Hook for fetching a single agent
export function useAgent(agentId: string | undefined): UseApiResult<AIAgent> {
  const [data, setData] = useState<AIAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgent = useCallback(async () => {
    if (!agentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await agentsAPI.getById(agentId);
      setData(response.agent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent');
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  return { data, loading, error, refetch: fetchAgent };
}

// Hook for fetching creations with filters
interface UseCreationsOptions {
  limit?: number;
  offset?: number;
  agent?: string;
  search?: string;
  style?: string;
}

interface UseCreationsResult extends UseApiResult<Creation[]> {
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  } | null;
  loadMore: () => Promise<void>;
}

export function useCreations(options: UseCreationsOptions = {}): UseCreationsResult {
  const [data, setData] = useState<Creation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseCreationsResult['pagination']>(null);
  const [currentOffset, setCurrentOffset] = useState(options.offset || 0);

  const fetchCreations = useCallback(async (append = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await creationsAPI.getAll({
        ...options,
        offset: append ? currentOffset : 0,
      });

      if (append && data) {
        setData([...data, ...response.creations]);
      } else {
        setData(response.creations);
      }
      setPagination(response.pagination);
      setCurrentOffset(response.pagination.offset + response.pagination.limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch creations');
      if (!append) setData([]);
    } finally {
      setLoading(false);
    }
  }, [options.limit, options.agent, options.search, options.style, currentOffset, data]);

  const loadMore = useCallback(async () => {
    if (pagination?.hasMore) {
      await fetchCreations(true);
    }
  }, [pagination, fetchCreations]);

  useEffect(() => {
    setCurrentOffset(0);
    fetchCreations(false);
  }, [options.agent, options.search, options.style, options.limit]);

  return { data, loading, error, pagination, refetch: () => fetchCreations(false), loadMore };
}

// Hook for fetching agent's creations
export function useAgentCreations(agentId: string | undefined, limit = 20): UseApiResult<Creation[]> {
  const [data, setData] = useState<Creation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreations = useCallback(async () => {
    if (!agentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await agentsAPI.getCreations(agentId, limit);
      setData(response.creations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch creations');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [agentId, limit]);

  useEffect(() => {
    fetchCreations();
  }, [fetchCreations]);

  return { data, loading, error, refetch: fetchCreations };
}

// Hook for fetching feed
export function useFeed(limit = 20): UseApiResult<FeedItem[]> {
  const [data, setData] = useState<FeedItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await feedAPI.getAll(limit);
      setData(response.feed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feed');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return { data, loading, error, refetch: fetchFeed };
}

// Hook for platform stats
interface PlatformStats {
  totalAgents: number;
  totalCreations: number;
  totalEvolutions: number;
  activeAgents: number;
  totalUsers: number;
  totalLikes: number;
}

export function useStats(): UseApiResult<PlatformStats> {
  const [data, setData] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await statsAPI.get();
      setData(response.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      // Fallback stats
      setData({
        totalAgents: 8,
        totalCreations: 2836,
        totalEvolutions: 10253,
        activeAgents: 6,
        totalUsers: 0,
        totalLikes: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}

// Hook for search
export function useSearch(query: string, limit = 20): UseApiResult<Creation[]> {
  const [data, setData] = useState<Creation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!query.trim()) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await creationsAPI.search(query, limit);
      setData(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [query, limit]);

  useEffect(() => {
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  return { data, loading, error, refetch: search };
}
