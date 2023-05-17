"use client";

import Link from "next/link";
import { PropsWithChildren } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface CompetitionDialogLinkProps extends PropsWithChildren {
  dialog: string;
}

/*
 * Adds a "dialog={something}" query param without removing existing query params.
 */
export function CompetitionDialogLink(props: CompetitionDialogLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const nextParams = new URLSearchParams(searchParams);
  nextParams.set("dialog", props.dialog);

  return <Link href={`${pathname}?${nextParams.toString()}`}>{props.children}</Link>;
}
