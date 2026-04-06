import { WOMClient } from "@wise-old-man/utils";

const client = new WOMClient({
  userAgent: "WiseOldMan - App League (Client Side)",
  baseAPIUrl: process.env.NEXT_PUBLIC_BASE_LEAGUE_API_URL ?? "https://api.wiseoldman.net/league",
});

/**
 * Provides a `WOMClient` for interacting with the API from client components.
 *
 * @returns The requested client.
 */
export function useWOMClient() {
  return client;
}
