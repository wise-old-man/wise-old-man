"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "~/services/wiseoldman";

export async function updatePlayer(username: string) {
  const result = await apiClient.players.updatePlayer(String(username));

  revalidatePath(`/players/${result.displayName}`);

  return result;
}
