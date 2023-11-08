"use client";

import { useTransition } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "~/hooks/useToast";
import { useWOMClient } from "~/hooks/useWOMClient";
import { Button } from "~/components/Button";

import LoadingIcon from "~/assets/loading.svg";

export default function PlayerNotFound() {
  const params = useParams();
  const username = decodeURI(String(params.username));

  const toast = useToast();
  const router = useRouter();
  const client = useWOMClient();

  const [isTransitioning, startTransition] = useTransition();

  const updateMutation = useMutation({
    mutationFn: () => {
      return client.players.updatePlayer(username);
    },
    onSuccess: (player) => {
      startTransition(() => {
        router.refresh();
        toast.toast({ variant: "success", title: `${player.displayName} has been updated!` });
      });
    },
    onError: (error) => {
      toast.toast({ variant: "error", title: error.message });
    },
  });

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-2xl font-bold">{`Couldn't find "${username}"`}</h1>
      <p className="mb-7 mt-1 text-body text-gray-200">
        This player has not yet been tracked, would you like to track them?
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate();
        }}
      >
        <Button variant="primary" disabled={isTransitioning || updateMutation.isPending}>
          {isTransitioning || updateMutation.isPending ? (
            <>
              Tracking
              <LoadingIcon className="-mr-1.5 ml-1 h-5 w-5 animate-spin" />
            </>
          ) : (
            <>{`Track "${username}"`}</>
          )}
        </Button>
      </form>
    </div>
  );
}
