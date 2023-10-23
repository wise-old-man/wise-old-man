"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "~/components/Input";
import { getSearchParam } from "~/utils/params";
import useDebounceCallback from "~/hooks/useDebouncedCallback";

import SearchIcon from "~/assets/search.svg";
import LoadingIcon from "~/assets/loading.svg";

export function GroupsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = getSearchParam(searchParams.get("search"));

  function handleSearchChanged(value: string) {
    const nextParams = new URLSearchParams(searchParams);

    // Reset pagination if params change
    nextParams.delete("page");

    if (value.trim().length > 0) {
      nextParams.set("search", value);
    } else {
      nextParams.delete("search");
    }

    router.replace(`/groups?${nextParams.toString()}`, { scroll: false });
  }

  return <SearchInput search={search} onSearchChanged={handleSearchChanged} />;
}

interface SearchInputProps {
  search?: string;
  onSearchChanged: (search: string) => void;
}

function SearchInput(props: SearchInputProps) {
  const { search, onSearchChanged } = props;

  const [searchInput, setSearchInput] = useState(search);
  const [isTransitioning, startTransition] = useTransition();

  const debouncedUrlUpdate = useDebounceCallback((val) => {
    startTransition(() => {
      onSearchChanged(val);
    });
  }, 500);

  return (
    <Input
      value={searchInput}
      placeholder="Search groups..."
      className="border-gray-600"
      containerClassName="md:max-w-xs w-full"
      leftElement={<SearchIcon className="h-5 w-5 text-gray-300" />}
      rightElement={
        isTransitioning ? <LoadingIcon className="h-5 w-5 animate-spin text-gray-400" /> : undefined
      }
      onChange={(e) => {
        setSearchInput(e.target.value);
        debouncedUrlUpdate(e.target.value);
      }}
    />
  );
}
