import { useMutation, useQuery } from "@tanstack/react-query";

const LOCAL_STORAGE_KEY = "wom-recent-searches-v2";

export default function useRecentSearches({ enabled }: { enabled?: boolean }) {
  const { data: recentSearches, ...fetchOptions } = useQuery<string[]>(
    ["recentSearches"],
    () => {
      const rawSearches = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (rawSearches == null) return [];

      try {
        return JSON.parse(rawSearches);
      } catch (error) {
        return [];
      }
    },
    {
      enabled: enabled === undefined || enabled,
      staleTime: 300,
    }
  );

  const addSearchTermMutation = useMutation(
    async (term: string) => {
      const currentSearches = recentSearches || [];
      if (currentSearches.includes(term)) return;

      return localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...currentSearches, term]));
    },
    {
      onSuccess: async () => {
        return fetchOptions.refetch();
      },
    }
  );

  const removeSearchTermMutation = useMutation(
    async (term: string) => {
      const currentSearches = recentSearches || [];
      const nextSearches = currentSearches.filter((searchTerm) => searchTerm !== term);

      if (nextSearches.length === 0) {
        return localStorage.removeItem(LOCAL_STORAGE_KEY);
      }

      return localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextSearches));
    },
    {
      onSuccess: async () => {
        return fetchOptions.refetch();
      },
    }
  );

  const clearSearchTermsMutation = useMutation(
    async () => {
      return localStorage.removeItem(LOCAL_STORAGE_KEY);
    },
    {
      onSuccess: async () => {
        return fetchOptions.refetch();
      },
    }
  );

  return {
    addSearchTerm: addSearchTermMutation.mutateAsync,
    clearSearchTerms: clearSearchTermsMutation.mutateAsync,
    removeSearchTerm: removeSearchTermMutation.mutateAsync,
    recentSearches,
    ...fetchOptions,
  };
}
