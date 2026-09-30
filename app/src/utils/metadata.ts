import { PlayerResponse, PlayerStatus } from "@wise-old-man/utils";
import type { Metadata } from "next";

export function buildPlayerMetadata(player: PlayerResponse, tab?: string): Metadata {
  const canonical = `/players/${encodeURIComponent(player.displayName)}${tab ?? ""}`;

  // Archived and banned accounts are dead pages, there's thousands of them,
  // and there's no value in having them indexed.
  const isDeadAccount = player.status === PlayerStatus.ARCHIVED || player.status === PlayerStatus.BANNED;

  return {
    alternates: {
      canonical,
    },
    openGraph: {
      url: canonical,
    },
    ...(isDeadAccount && { robots: { index: false } }),
  };
}
