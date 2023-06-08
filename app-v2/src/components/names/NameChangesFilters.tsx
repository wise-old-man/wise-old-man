"use client";

import { NameChangeStatus } from "@wise-old-man/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "~/components/Input";
import useDebounceCallback from "~/hooks/useDebouncedCallback";
import { getNameChangeStatusParam, getSearchParam } from "~/utils/params";
import { capitalize } from "~/utils/strings";
import { cn } from "~/utils/styling";
import {
  Combobox,
  ComboboxButton,
  ComboboxContent,
  ComboboxItem,
  ComboboxItemGroup,
  ComboboxItemsContainer,
} from "~/components/Combobox";

import SearchIcon from "~/assets/search.svg";
import LoadingIcon from "~/assets/loading.svg";

export function NameChangesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = getSearchParam(searchParams.get("search"));
  const status = getNameChangeStatusParam(searchParams.get("status"));

  function handleSearchChanged(value: string) {
    const nextParams = new URLSearchParams(searchParams);

    // Reset pagination if params change
    nextParams.delete("page");

    if (value.trim().length > 0) {
      nextParams.set("search", value);
    } else {
      nextParams.delete("search");
    }

    router.replace(`/names?${nextParams.toString()}`);
  }

  function handleStatusChanged(value: string | undefined) {
    const nextParams = new URLSearchParams(searchParams);

    // Reset pagination if params change
    nextParams.delete("page");

    if (value) {
      nextParams.set("status", value);
    } else {
      nextParams.delete("status");
    }

    router.replace(`/names?${nextParams.toString()}`);
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <SearchInput search={search} onSearchChanged={handleSearchChanged} />
      <StatusSelect status={status} onStatusSelected={handleStatusChanged} />
    </div>
  );
}

interface SearchInputProps {
  search?: string;
  onSearchChanged: (search: string) => void;
}

function SearchInput(props: SearchInputProps) {
  const { search, onSearchChanged } = props;

  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(search);

  const debouncedUrlUpdate = useDebounceCallback((val) => {
    startTransition(() => {
      onSearchChanged(val);
    });
  }, 500);

  return (
    <Input
      value={searchInput}
      placeholder="Search competitions..."
      className="border-gray-600"
      containerClassName="md:max-w-xs w-full"
      leftElement={<SearchIcon className="h-5 w-5 text-gray-300" />}
      rightElement={
        isPending ? <LoadingIcon className="h-5 w-5 animate-spin text-gray-400" /> : undefined
      }
      onChange={(e) => {
        setSearchInput(e.target.value);
        debouncedUrlUpdate(e.target.value);
      }}
    />
  );
}

interface StatusSelectProps {
  status: NameChangeStatus | undefined;
  onStatusSelected: (status: NameChangeStatus | undefined) => void;
}

function StatusSelect(props: StatusSelectProps) {
  const { status, onStatusSelected } = props;

  const [isPending, startTransition] = useTransition();

  return (
    <Combobox
      value={status}
      onValueChanged={(val) => {
        if (val === undefined || Object.values(NameChangeStatus).includes(val as any)) {
          startTransition(() => {
            onStatusSelected(val as NameChangeStatus | undefined);
          });
        }
      }}
    >
      <ComboboxButton className="w-full sm:w-48" isPending={isPending}>
        <div className={cn("flex items-center gap-x-2", !status && "text-gray-300")}>
          {status && (
            <div
              className={cn("h-2 w-2 rounded-full", {
                "bg-red-500": status === NameChangeStatus.DENIED,
                "bg-gray-300": status === NameChangeStatus.PENDING,
                "bg-green-500": status === NameChangeStatus.APPROVED,
              })}
            />
          )}
          {status ? capitalize(status) : "Status"}
        </div>
      </ComboboxButton>
      <ComboboxContent>
        <ComboboxItemsContainer>
          <ComboboxItemGroup label="Status">
            <ComboboxItem value="pending">
              <div className="h-2 w-2 rounded-full bg-gray-200" />
              Pending
            </ComboboxItem>
            <ComboboxItem value="approved">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Approved
            </ComboboxItem>
            <ComboboxItem value="denied">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              Denied
            </ComboboxItem>
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}
