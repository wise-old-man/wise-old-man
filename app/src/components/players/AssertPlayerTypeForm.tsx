"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Player, PlayerTypeProps } from "@wise-old-man/utils";
import { useToast } from "~/hooks/useToast";
import { useWOMClient } from "~/hooks/useWOMClient";
import { DropdownMenuItem } from "../Dropdown";

import LoadingIcon from "~/assets/loading.svg";

export function AssertPlayerTypeForm(props: { player: Player }) {
  const { player } = props;

  const toast = useToast();
  const client = useWOMClient();
  const router = useRouter();

  const [isTransitioning, startTransition] = useTransition();

  const assertMutation = useMutation({
    mutationFn: () => {
      return client.players.assertPlayerType(player.username);
    },
    onSuccess: (result) => {
      if (result.changed) {
        const successMessage = `${player.displayName} player type has been changed to ${
          PlayerTypeProps[result.player.type].name
        }`;

        startTransition(() => {
          router.refresh();
          toast.toast({ variant: "success", title: successMessage });
        });
      } else {
        toast.toast({
          variant: "success",
          title: `No change: ${player.displayName} is still ${PlayerTypeProps[player.type].name}`,
        });
      }
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.toast({ variant: "error", title: error.message });
      }
    },
  });

  return (
    <DropdownMenuItem
      disabled={assertMutation.isPending || isTransitioning}
      onClick={(e) => {
        e.preventDefault();
        assertMutation.mutate();
      }}
    >
      {assertMutation.isPending || isTransitioning ? (
        <div className="flex animate-pulse items-center">
          <LoadingIcon className="mr-2 h-4 w-4 animate-spin" />
          Checking...
        </div>
      ) : (
        <>Check player type...</>
      )}
    </DropdownMenuItem>
  );
}
