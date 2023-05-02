"use client";

import { PropsWithChildren, useState } from "react";
import { SideNavigation } from "./SideNavigation";

import MenuIcon from "~/assets/menu.svg";

function Navigation(props: PropsWithChildren) {
  const { children } = props;

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative mt-0 flex h-full">
      <SideNavigation isSidebarOpen={isSidebarOpen} onSidebarClosed={() => setSidebarOpen(false)} />
      <div className="ml-0 h-full w-full lg:ml-[16rem]">
        <nav className="fixed left-0 right-0 top-0 z-20 flex h-[4rem] w-full items-center border-b border-gray-700 bg-gray-800 px-7 shadow-lg lg:left-64">
          <button onClick={() => setSidebarOpen(true)} className="block p-1 lg:hidden">
            <MenuIcon className="h-6 w-6 text-white" />
          </button>
        </nav>
        <main className="mt-16">{children}</main>
      </div>
    </div>
  );
}

export { Navigation };
