"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlayerSearch } from "./PlayerSearch";

import Logo from "~/assets/logo.svg";
import MenuIcon from "~/assets/menu.svg";

interface TopNavigationProps {
  onMenuToggled: (val: boolean) => void;
}

export function TopNavigation(props: TopNavigationProps) {
  const { onMenuToggled } = props;

  const router = useRouter();

  return (
    <nav className="z-50 flex h-[4rem] items-center justify-between border-b border-gray-700 bg-gray-800 px-7 shadow-lg">
      <Link
        href="/"
        aria-label="Home"
        className="hidden outline-none ring-0 lg:block"
        onClick={() => onMenuToggled(false)}
      >
        <Logo alt="Wise Old Man Logo" className="w-32 shrink-0" />
      </Link>
      <button onClick={() => onMenuToggled(true)} className="block p-1 lg:hidden">
        <MenuIcon className="h-6 w-6 text-white" />
      </button>
      <div className="absolute left-20 right-0 lg:left-64">
        <div className="mx-auto mt-0.5 flex w-full max-w-7xl justify-end px-8 md:px-12">
          <div className="w-48 sm:w-60">
            <PlayerSearch
              mode="navigate"
              className="bg-gray-900 shadow-gray-950 focus-visible:bg-gray-950"
              onPlayerSelected={(username) => {
                router.push(`/players/${username}`);
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
