import changelog from "../../config/changelog.json";
import { useMutation, useQuery } from "@tanstack/react-query";

type Changelog = { name: string; url: string };

const LOCAL_STORAGE_KEY = "wom-changelog";

export default function useChangelog() {
  const { data: lastReadChangelog, ...fetchOptions } = useQuery<string | null>({
    queryKey: ["lastReadChangelog"],
    queryFn: () => {
      return localStorage.getItem(LOCAL_STORAGE_KEY);
    },
    staleTime: 300,
  });

  const latestChangelog = changelog[0] as Changelog | undefined;

  const hasUnreadChangelog =
    !lastReadChangelog || (latestChangelog && latestChangelog.name !== lastReadChangelog);

  const readLatestChangelogMutation = useMutation({
    mutationFn: async () => {
      if (!latestChangelog) return;
      return localStorage.setItem(LOCAL_STORAGE_KEY, latestChangelog.name);
    },
    onSuccess: async () => {
      return fetchOptions.refetch();
    },
  });

  return {
    latestChangelog,
    hasUnreadChangelog,
    readLatestChangelog: readLatestChangelogMutation.mutateAsync,
    ...fetchOptions,
  };
}
