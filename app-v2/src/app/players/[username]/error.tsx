"use client";

import { ErrorState } from "~/components/ErrorState";

export default function PlayerErrorState(props: { error: Error }) {
  return <ErrorState tag="player" {...props} />;
}
