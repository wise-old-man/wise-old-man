"use client";

import { useRouter } from "next/navigation";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { Player } from "@wise-old-man/utils";
import { useToast } from "~/hooks/useToast";
import { Button } from "../Button";

import LoadingIcon from "~/assets/loading.svg";
import { updatePlayer } from "~/actions/updatePlayer";

export function UpdatePlayerForm(props: { player: Player }) {
  const toast = useToast();
  const router = useRouter();

  async function update() {
    try {
      const player = await updatePlayer(props.player.username);
      router.refresh();

      toast.toast({ variant: "success", title: `${player.displayName} has been updated!` });
    } catch (_) {
      toast.toast({ variant: "error", title: "Failed to update player." });
    }
  }

  return (
    <form action={update}>
      <UpdateButton />
    </form>
  );
}

function UpdateButton() {
  const { pending } = useFormStatus();

  return (
    <Button variant="blue" disabled={pending}>
      {pending ? (
        <>
          Updating...
          <LoadingIcon className="-mr-1 ml-1 h-4 w-4 animate-spin text-white" />
        </>
      ) : (
        <>Update</>
      )}
    </Button>
  );
}
