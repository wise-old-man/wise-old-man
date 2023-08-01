"use client";

import { FormEvent, useState } from "react";
import { Input } from "~/components/Input";
import { Button } from "~/components/Button";

import ArrowRight from "~/assets/arrow_right.svg";

export function HeroPlayerForm() {
  const [username, setUsername] = useState("");

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (username.length === 0) return;

    console.log("update player and then redirect");
  }

  return (
    <form className="mt-5" onSubmit={handleFormSubmit}>
      <Input
        value={username}
        maxLength={12}
        placeholder="Enter your username"
        className=" h-12 rounded-lg bg-gray-900 px-4 shadow-gray-950/70 focus-visible:bg-gray-950"
        onChange={(e) => {
          setUsername(e.currentTarget.value);
        }}
        rightElementClickable
        rightElement={
          <Button className="-mr-1 h-8" disabled={username.length === 0} variant="blue">
            Track
            <ArrowRight className="-mr-2 h-4 w-4" />
          </Button>
        }
      />
    </form>
  );
}
