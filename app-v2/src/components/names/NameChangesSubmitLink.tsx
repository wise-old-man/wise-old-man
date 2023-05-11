"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

/*
 * Adds a "dialog=submit" query param without removing existing (filter) query params.
 */
export function NameChangesSubmitLink() {
  const searchParams = useSearchParams();

  const nextParams = new URLSearchParams(searchParams);
  nextParams.set("dialog", "submit");

  return (
    <Link
      href={`/names?${nextParams.toString()}`}
      className="mt-8 text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline lg:mt-0"
    >
      + Submit new
    </Link>
  );
}
