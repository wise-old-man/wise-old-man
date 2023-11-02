import { useQuery } from "@tanstack/react-query";
import { WOMClient } from "@wise-old-man/utils";

const client = new WOMClient({
  userAgent: "WiseOldMan - App v2 (Client Side)",
});

export default function useSearchGroups(query: string, options: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["groups", query],
    queryFn: () => client.groups.searchGroups(query),
    enabled: options.enabled === undefined || options.enabled,
    staleTime: 30,
  });
}
