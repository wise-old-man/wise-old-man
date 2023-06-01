"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface QueryLinkProps extends Omit<React.ComponentPropsWithoutRef<typeof Link>, "href"> {
  query: {
    [key: string]: string;
  };
}

/*
 * Adds a query params to the current URL without removing existing query params.
 */
export function QueryLink(props: QueryLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const nextParams = new URLSearchParams(searchParams);

  for (const [key, value] of Object.entries(props.query)) {
    nextParams.set(key, value);
  }

  return (
    <Link href={`${pathname}?${nextParams.toString()}`} {...props}>
      {props.children}
    </Link>
  );
}
