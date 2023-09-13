"use client";

import { useMutation } from "@tanstack/react-query";
import { WOMClient } from "@wise-old-man/utils";
import { useParams } from "next/navigation";
import { useToast } from "~/hooks/useToast";
import { Button } from "~/components/Button";
import { ErrorBoundary } from "~/components/ErrorBoundary";

import LoadingIcon from "~/assets/loading.svg";

export default function PlayerErrorBoundary(props: { error: Error }) {
  return props.error.message === "Player not found." ? <NotFound /> : <ErrorBoundary />;
}

function NotFound() {
  const params = useParams();
  const username = decodeURI(String(params.username));

  const toast = useToast();

  const updateMutation = useMutation({
    mutationFn: () => {
      const client = new WOMClient({ userAgent: "WiseOldMan - App v2 (Client Side)" });
      return client.players.updatePlayer(username);
    },
    onSuccess: () => {
      toast.toast({ variant: "success", title: "Player successfully tracked. Please wait..." });
      location.reload();
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
        <Button variant="blue" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
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
