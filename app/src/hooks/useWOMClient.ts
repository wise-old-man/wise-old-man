import { useState } from "react";
import { WOMClient } from "@wise-old-man/utils";

const _client = new WOMClient({
  userAgent: "WiseOldMan - App v2 (Client Side)",
  baseAPIUrl: process.env.NEXT_PUBLIC_BASE_API_URL ?? "https://api.wiseoldman.net/v2",
});

/**
 * Provides a `WOMClient` for interacting with the API from client components.
 *
 * @returns The requested client.
 */
export function useWOMClient() {
  const [client, _] = useState(_client);
  return client;
}
