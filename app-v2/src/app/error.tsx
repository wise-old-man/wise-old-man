"use client";

import { Container } from "~/components/Container";
import { ErrorState } from "~/components/ErrorState";

export default function RootError(props: { error: Error }) {
  return (
    <Container>
      <ErrorState tag="global" {...props} />
    </Container>
  );
}
