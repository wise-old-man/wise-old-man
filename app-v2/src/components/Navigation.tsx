"use client";

import Link from "next/link";
import { PropsWithChildren, useState } from "react";
import { SideNavigation } from "./SideNavigation";

import Logo from "~/assets/logo.svg";
import MenuIcon from "~/assets/menu.svg";

function Navigation(props: PropsWithChildren) {
  const { children } = props;

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative mt-0 flex h-full">
      <nav className="fixed left-0 right-0 top-0 z-50 flex h-[4.5rem] w-full items-center border-b border-gray-700 bg-gray-800 px-7 shadow-lg">
        <Link href="/" className="hidden outline-none ring-0 lg:block" onClick={() => setSidebarOpen(false)}>
          <Logo className="h-[3rem] shrink-0" />
        </Link>
        <button onClick={() => setSidebarOpen(true)} className="block p-1 lg:hidden">
          <MenuIcon className="h-6 w-6 text-white" />
        </button>
      </nav>
      <SideNavigation isSidebarOpen={isSidebarOpen} onSidebarClosed={() => setSidebarOpen(false)} />
      <main className="ml-0 mt-[4.5rem] h-full w-full lg:ml-64">{children}</main>
    </div>
  );
}

export { Navigation };
