"use server";

import { WOMClient } from "@wise-old-man/utils";
import { revalidatePath } from "next/cache";

export async function updatePlayer(formData: FormData) {
  const username = formData?.get("username");

  if (!username) {
    throw new Error("Invalid form data");
  }

  const result = await new WOMClient().players.updatePlayer(String(username));

  revalidatePath(`/players/${result.username}`);

  return result;
}
