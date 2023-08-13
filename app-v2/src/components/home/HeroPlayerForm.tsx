"use client";

import { useState } from "react";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useToast } from "~/hooks/useToast";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";
import { updatePlayer } from "~/actions/updatePlayer";

import LoadingIcon from "~/assets/loading.svg";
import ArrowRightIcon from "~/assets/arrow_right.svg";

export function HeroPlayerForm() {
  const toast = useToast();
  const router = useRouter();

  const [username, setUsername] = useState("");

  async function update(formData: FormData) {
    try {
      const player = await updatePlayer(formData?.get("username") as string);

      router.push(`/players/${player.displayName}`);

      toast.toast({ variant: "success", title: `${player.displayName} has been updated!` });
    } catch (_) {
      toast.toast({ variant: "error", title: "Failed to update player." });
    }
  }

  return (
    <form className="mt-5" action={update}>
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
        rightElement={<SubmitButton disabled={username.length === 0} />}
      />
    </form>
  );
}

function SubmitButton(props: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button className="-mr-1 h-8" disabled={pending || props.disabled} variant="blue">
      Track
      {pending ? (
        <LoadingIcon className="-mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ArrowRightIcon className="-mr-2 h-4 w-4" />
      )}
    </Button>
  );
}
