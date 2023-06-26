"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Player, WOMClient } from "@wise-old-man/utils";
import { useToast } from "~/hooks/useToast";
import { Button } from "../Button";

import LoadingIcon from "~/assets/loading.svg";

export function UpdatePlayerButton(props: { player: Player }) {
  const { player } = props;

  const toast = useToast();
  const router = useRouter();

  const client = new WOMClient({
    userAgent: "WiseOldMan - App v2 (Client Side)",
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      return client.players.updatePlayer(player.username);
    },
    onSuccess: () => {
      toast.toast({ variant: "success", title: `${player.displayName} has been updated!` });
      router.refresh();
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.toast({ variant: "error", title: error.message });
      }
    },
  });

  return (
    <Button variant="blue" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
      {updateMutation.isPending ? (
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
