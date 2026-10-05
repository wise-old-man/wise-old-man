"use client";

import NextLink from "next/link";
import { CHALLENGER_PREFIX, useInteractionDetected } from "./LinkChallenger";

export function Link(props: React.ComponentPropsWithoutRef<typeof NextLink>) {
  const interactionDetected = useInteractionDetected();

  const href = props.href ?? "";

  const prefixedHref =
    !interactionDetected && typeof href === "string" && !href.startsWith(CHALLENGER_PREFIX + "/")
      ? `${CHALLENGER_PREFIX}${href}`
      : href;

  return <NextLink prefetch={false} {...props} href={prefixedHref} />;
}
