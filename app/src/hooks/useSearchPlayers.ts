import { useQuery } from "@tanstack/react-query";
import { useWOMClient } from "./useWOMClient";

export default function useSearchPlayers(query: string, options: { enabled?: boolean }) {
  const client = useWOMClient();
  const trimmedQuery = query.toLowerCase().trim();

  return useQuery({
    queryKey: ["players", trimmedQuery],
    queryFn: () => client.players.searchPlayers(trimmedQuery),
    enabled: options.enabled === undefined || options.enabled,
    staleTime: 30_000,
  });
}
