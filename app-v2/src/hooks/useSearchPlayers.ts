import { useQuery } from "@tanstack/react-query";
import { WOMClient } from "@wise-old-man/utils";

const client = new WOMClient({
  userAgent: "WiseOldMan - App v2 (Client Side)",
});

export default function useSearchPlayers(query: string, { enabled }: { enabled?: boolean }) {
  return useQuery(["players", query], () => client.players.searchPlayers(query), {
    enabled: enabled === undefined || enabled,
    staleTime: 30,
  });
}
