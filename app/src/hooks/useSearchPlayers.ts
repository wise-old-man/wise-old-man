import { useQuery } from "@tanstack/react-query";
import { useWOMClient } from "./useWOMClient";

export default function useSearchPlayers(query: string, options: { enabled?: boolean }) {
  const client = useWOMClient();

  return useQuery({
    queryKey: ["players", query],
    queryFn: () => client.players.searchPlayers(query),
    enabled: options.enabled === undefined || options.enabled,
    staleTime: 30,
  });
}
