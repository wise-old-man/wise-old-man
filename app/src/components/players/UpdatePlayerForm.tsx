"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Player } from "@wise-old-man/utils";
import { useToast } from "~/hooks/useToast";
import { useWOMClient } from "~/hooks/useWOMClient";
import { Button } from "../Button";

import LoadingIcon from "~/assets/loading.svg";

export function UpdatePlayerForm(props: { player: Player }) {
  const toast = useToast();
  const client = useWOMClient();
  const router = useRouter();

  const [isTransitioning, startTransition] = useTransition();

  const submitMutation = useMutation({
    mutationFn: () => {
      return client.players.updatePlayer(props.player.username);
    },
    onSuccess: (player) => {
      startTransition(() => {
        router.refresh();
        toast.toast({ variant: "success", title: `${player.displayName} has been updated!` });
      });
    },
    onError: (e) => {
      toast.toast({ variant: "error", title: "Failed to update player.", description: e.message });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitMutation.mutate();
      }}
    >
      <Button variant="blue" disabled={submitMutation.isPending || isTransitioning}>
        {submitMutation.isPending || isTransitioning ? (
          <>
            Updating...
            <LoadingIcon className="-mr-1 ml-1 h-4 w-4 animate-spin text-white" />
          </>
        ) : (
          <>Update</>
        )}
      </Button>
    </form>
  );
}
