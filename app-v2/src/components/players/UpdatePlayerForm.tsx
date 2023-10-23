"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Player, WOMClient } from "@wise-old-man/utils";
import { useToast } from "~/hooks/useToast";
import { Button } from "../Button";

import LoadingIcon from "~/assets/loading.svg";

export function UpdatePlayerForm(props: { player: Player }) {
  const toast = useToast();
  const router = useRouter();

  const [isTransitioning, startTransition] = useTransition();

  const submitMutation = useMutation({
    mutationFn: () => {
      const client = new WOMClient({
        userAgent: "WiseOldMan - App v2 (Client Side)",
      });

      return client.players.updatePlayer(props.player.username);
    },
    onSuccess: (player) => {
      startTransition(() => {
        router.refresh();
        router.push(`/players/${player.displayName}`);
        toast.toast({ variant: "success", title: `${player.displayName} has been updated!` });
      });
    },
    onError: () => {
      toast.toast({ variant: "error", title: "Failed to update player." });
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
