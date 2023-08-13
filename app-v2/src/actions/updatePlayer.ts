"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "~/services/wiseoldman";

export async function updatePlayer(formData: FormData) {
  const username = formData?.get("username");

  if (!username) {
    throw new Error("Invalid form data");
  }

  const result = await apiClient.players.updatePlayer(String(username));

  revalidatePath(`/players/${result.username}`);

  return result;
}
