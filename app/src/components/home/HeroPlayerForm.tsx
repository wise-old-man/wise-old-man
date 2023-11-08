"use client";

import { useState, useTransition } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "~/hooks/useToast";
import { useWOMClient } from "~/hooks/useWOMClient";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";

import LoadingIcon from "~/assets/loading.svg";
import ArrowRightIcon from "~/assets/arrow_right.svg";

export function HeroPlayerForm() {
  const toast = useToast();
  const router = useRouter();
  const client = useWOMClient();

  const [username, setUsername] = useState("");
  const [isTransitioning, startTransition] = useTransition();

  const submitMutation = useMutation({
    mutationFn: (params: { username: string }) => {
      return client.players.updatePlayer(params.username);
    },
    onSuccess: (player) => {
      startTransition(() => {
        router.refresh();
        router.push(`/players/${player.displayName}`);
        toast.toast({ variant: "success", title: `${player.displayName} has been updated!` });
      });
    },
    onError: () => {
      startTransition(() => {
        router.push(`/players/${username}`);
        toast.toast({ variant: "error", title: "Failed to update player." });
      });
    },
  });

  return (
    <form
      className="mt-5"
      onSubmit={(e) => {
        e.preventDefault();
        submitMutation.mutate({ username });
      }}
    >
      <Input
        name="username"
        value={username}
        maxLength={12}
        placeholder="Enter your username"
        className=" h-12 rounded-lg bg-gray-900 px-4 shadow-gray-950/70 focus-visible:bg-gray-950"
        onChange={(e) => {
          setUsername(e.currentTarget.value);
        }}
        rightElementClickable
        rightElement={
          <Button
            className="-mr-1 h-8"
            disabled={submitMutation.isPending || isTransitioning || username.length === 0}
            variant="primary"
          >
            Track
            {submitMutation.isPending || isTransitioning ? (
              <LoadingIcon className="-mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRightIcon className="-mr-2 h-4 w-4" />
            )}
          </Button>
        }
      />
    </form>
  );
}
