"use client";

import { NameChangeStatus } from "@wise-old-man/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "~/components/Input";
import useDebounceCallback from "~/hooks/useDebounceCallback";
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

export function NameChangesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = getSearchParam(searchParams.get("search"));
  const status = getNameChangeStatusParam(searchParams.get("status"));

  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(search);

  const debouncedUrlUpdate = useDebounceCallback(handleSearchChanged, 500);

  function handleSearchChanged(value: string) {
    const nextParams = new URLSearchParams(searchParams);

    if (value.trim().length > 0) {
      nextParams.set("search", value);
    } else {
      nextParams.delete("search");
    }

    startTransition(() => {
      router.push(`/names?${nextParams.toString()}`);
    });
  }

  function handleStatusChanged(value: string | undefined) {
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set("status", value);
    } else {
      nextParams.delete("status");
    }

    startTransition(() => {
      router.push(`/names?${nextParams.toString()}`);
    });
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 sm:flex-row",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      <Input
        value={searchInput}
        placeholder="Search..."
        className="border-gray-600"
        containerClassName="md:w-auto w-full"
        leftElement={<SearchIcon className="h-5 w-5 text-gray-300" />}
        onChange={(e) => {
          setSearchInput(e.target.value);
          debouncedUrlUpdate(e.target.value);
        }}
      />
      <NameChangeStatusSelect
        key={status}
        status={status}
        onStatusSelected={(newStatus) => handleStatusChanged(newStatus)}
      />
    </div>
  );
}

interface NameChangeStatusSelectProps {
  status: NameChangeStatus | undefined;
  onStatusSelected: (status: NameChangeStatus | undefined) => void;
}

function NameChangeStatusSelect(props: NameChangeStatusSelectProps) {
  const { status, onStatusSelected } = props;

  return (
    <Combobox
      value={status}
      onValueChanged={(val) => {
        if (val === undefined || Object.values(NameChangeStatus).includes(val as any)) {
          onStatusSelected(val as NameChangeStatus | undefined);
        }
      }}
    >
      <ComboboxButton className="w-full sm:w-48">
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
