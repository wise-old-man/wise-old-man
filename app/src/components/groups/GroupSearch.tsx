"use client";

import { GroupListItem } from "@wise-old-man/utils";
import { Fragment, forwardRef, useRef, useState } from "react";
import { Combobox as HeadlessCombobox, Transition } from "@headlessui/react";
import { cn } from "~/utils/styling";
import useSearchGroups from "~/hooks/useSearchGroups";
import useDebouncedValue from "~/hooks/useDebouncedValue";

import SearchIcon from "~/assets/search.svg";
import LoadingIcon from "~/assets/loading.svg";
import VerifiedIcon from "~/assets/verified.svg";

interface GroupSearchProps {
  onGroupSelected: (group: GroupListItem) => void;
}

export function GroupSearch(props: GroupSearchProps) {
  const { onGroupSelected } = props;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const focusParentRef = useRef<HTMLDivElement>(null);

  const debouncedSearchQuery = useDebouncedValue(query, 250);

  const { data: groups } = useSearchGroups(debouncedSearchQuery, {
    enabled: open && debouncedSearchQuery.length > 0,
  });

  function handleGroupSelected(id: string) {
    setQuery("");

    setTimeout(() => {
      focusParentRef.current?.focus();

      setOpen(false);
    }, 1);

    const group = groups?.find((g) => g.id === Number(id));

    if (group) onGroupSelected(group);
  }

  return (
    <HeadlessCombobox value={query} onChange={handleGroupSelected}>
      <div
        ref={focusParentRef}
        className="relative w-full"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <SearchInput
          ref={inputRef}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
        />
        <Transition
          show={open && query.length > 0}
          as={Fragment}
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          leave="transition ease-in duration-100"
        >
          <HeadlessCombobox.Options
            static={open}
            className="custom-scroll absolute right-0 z-10 mt-1 max-h-60 w-full translate-y-1 overflow-auto overscroll-contain rounded-md border border-gray-500 bg-gray-700 p-1 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          >
            {query.length > 0 && !groups ? (
              <LoadingState />
            ) : (
              <>
                <div className="select-none px-3 py-2 text-xs text-gray-100">
                  Search results for &quot;{debouncedSearchQuery}&quot;
                </div>
                {groups
                  ?.sort((a) => (isExactMatch(query, a.name) ? -1 : 0))
                  .map((group) => (
                    <SearchResultItem key={group.id} group={group} />
                  ))}
              </>
            )}
          </HeadlessCombobox.Options>
        </Transition>
      </div>
    </HeadlessCombobox>
  );
}

function LoadingState() {
  return (
    <div className="relative flex cursor-default select-none items-center gap-x-3 px-4 py-2 text-gray-200">
      <LoadingIcon className="h-6 w-6 animate-spin" />
      Loading...
    </div>
  );
}

function SearchResultItem(props: { group: GroupListItem }) {
  const { group } = props;

  return (
    <HeadlessCombobox.Option
      value={group.id}
      className={({ active }) =>
        cn(
          "relative block cursor-default select-none truncate rounded p-3",
          active ? "bg-gray-600 text-white" : "text-gray-100"
        )
      }
    >
      <div className="flex items-center gap-x-1.5 text-base font-medium">
        {group.name}
        {group.verified && <VerifiedIcon className="h-4 w-4" />}
      </div>
      <span className="text-sx text-gray-200">{group.description}</span>
    </HeadlessCombobox.Option>
  );
}

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>((props, ref) => {
  const { onChange, ...inputProps } = props;
  return (
    <div className="relative">
      <HeadlessCombobox.Input
        ref={ref}
        autoComplete="off"
        placeholder="Search groups..."
        onChange={onChange}
        className={cn(
          "flex h-12 w-full items-center rounded-md border border-gray-700 bg-gray-950 px-10 text-sm leading-7 shadow-inner shadow-black/50 placeholder:text-gray-300",
          "focus-visible:bg-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-500 focus-visible:ring-offset-0"
        )}
        {...inputProps}
      />
      <div className="pointer-events-none absolute bottom-0 left-3 top-0 flex items-center">
        <SearchIcon className="h-5 w-5 text-gray-300" />
      </div>
    </div>
  );
});
SearchInput.displayName = "SearchInput";

function isExactMatch(query: string, groupName: string) {
  return groupName.trim().toLowerCase() === query.trim().toLowerCase();
}
