"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface QueryLinkProps extends Omit<React.ComponentPropsWithoutRef<typeof Link>, "href"> {
  query: {
    [key: string]: string | undefined | null;
  };
  shallow?: boolean;
}

/*
 * Adds a query params to the current URL without removing existing query params.
 */
export function QueryLink(props: QueryLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const nextParams = new URLSearchParams(searchParams);

  for (const [key, value] of Object.entries(props.query)) {
    if (value === null) {
      nextParams.delete(key);
    } else if (value !== undefined) {
      nextParams.set(key, value);
    }
  }

  return (
    <Link
      href={`${pathname}?${nextParams.toString()}`}
      onClick={(e) => {
        if (e.metaKey || props.shallow === false) {
          return;
        }

        // If ctrl or command are pressed, this link will be opened in another tab with hard routing.
        // Otherwise, we intercept the Link navigation, and we do a shallow routing instead (updates UI, doesn't do server fetching)

        e.preventDefault();
        window.history.pushState(null, "", `?${nextParams.toString()}`);
      }}
      {...props}
    >
      {props.children}
    </Link>
  );
}
