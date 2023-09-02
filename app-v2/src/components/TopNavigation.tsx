"use client";

import Link from "next/link";
import { PlayerSearch } from "./PlayerSearch";

import LogoAlt from "~/assets/logo_alt.svg";
import MenuIcon from "~/assets/menu.svg";

interface TopNavigationProps {
  onMenuToggled: (val: boolean) => void;
}

export function TopNavigation(props: TopNavigationProps) {
  const { onMenuToggled } = props;

  return (
    <nav className="z-50 flex h-[4rem] items-center justify-between border-b border-gray-700 bg-gray-800 px-7 shadow-lg">
      <Link
        href="/"
        aria-label="Home"
        className="hidden outline-none ring-0 lg:block"
        onClick={() => onMenuToggled(false)}
      >
        <LogoAlt alt="Wise Old Man Logo" className="w-32 shrink-0" />
      </Link>
      <button onClick={() => onMenuToggled(true)} className="block p-1 lg:hidden">
        <MenuIcon className="h-6 w-6 text-white" />
      </button>
      <div className="absolute left-20 right-0 lg:left-64">
        <div className="mx-auto mt-0.5 flex w-full max-w-7xl justify-end px-8 md:px-12">
          <div className="w-80">
            <PlayerSearch mode="navigate" />
          </div>
        </div>
      </div>
    </nav>
  );
}
