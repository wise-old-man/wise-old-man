import { useQuery } from "@tanstack/react-query";
import { useWOMClient } from "./useWOMClient";

export default function useSearchGroups(query: string, options: { enabled?: boolean }) {
  const client = useWOMClient();

  return useQuery({
    queryKey: ["groups", query],
    queryFn: () => client.groups.searchGroups(query),
    enabled: options.enabled === undefined || options.enabled,
    staleTime: 30,
  });
}
