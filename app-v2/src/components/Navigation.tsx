"use client";

import { PropsWithChildren, useState } from "react";
import { SideNavigation } from "./SideNavigation";
import { TopNavigation } from "./TopNavigation";

function Navigation(props: PropsWithChildren) {
  const { children } = props;

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative mt-0 flex">
      <TopNavigation onMenuToggled={setSidebarOpen} />
      <SideNavigation isSidebarOpen={isSidebarOpen} onSidebarClosed={() => setSidebarOpen(false)} />
      <main className="ml-0 mt-[4.5rem] h-full w-full lg:ml-64">{children}</main>
    </div>
  );
}

export { Navigation };
