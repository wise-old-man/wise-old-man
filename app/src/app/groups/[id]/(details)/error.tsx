"use client";

import { ErrorState } from "~/components/ErrorState";

export default function GroupErrorState(props: { error: Error }) {
  return <ErrorState tag="group" {...props} />;
}
