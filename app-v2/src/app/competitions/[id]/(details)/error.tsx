"use client";

import { ErrorState } from "~/components/ErrorState";

export default function CompetitionErrorState(props: { error: Error }) {
  return <ErrorState tag="competition" {...props} />;
}
