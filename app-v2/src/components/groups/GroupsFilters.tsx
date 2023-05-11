"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { getSearchParam } from "~/utils/params";
import useDebounceCallback from "~/hooks/useDebouncedCallback";
import { Input } from "~/components/Input";
import SearchIcon from "~/assets/search.svg";

export function GroupsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = getSearchParam(searchParams.get("search"));

  const [searchInput, setSearchInput] = useState(search);

  const debouncedUrlUpdate = useDebounceCallback(handleSearchChanged, 500);

  function handleSearchChanged(value: string) {
    const nextParams = new URLSearchParams(searchParams);

    if (value.trim().length > 0) {
      nextParams.set("search", value);
    } else {
      nextParams.delete("search");
    }

    // Reset pagination if params change
    nextParams.delete("page");

    startTransition(() => {
      router.push(`/groups?${nextParams.toString()}`);
    });
  }

  return (
    <Input
      value={searchInput}
      disabled={isPending}
      placeholder="Search groups..."
      className="border-gray-600"
      containerClassName="md:max-w-xs w-full"
      leftElement={<SearchIcon className="h-5 w-5 text-gray-300" />}
      onChange={(e) => {
        setSearchInput(e.target.value);
        debouncedUrlUpdate(e.target.value);
      }}
    />
  );
}
