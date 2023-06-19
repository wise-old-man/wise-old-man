"use client";

import { PropsWithChildren, useState } from "react";
import { SideNavigation } from "./SideNavigation";
import { TopNavigation } from "./TopNavigation";

function Navigation(props: PropsWithChildren) {
  const { children } = props;

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex flex-col">
      <TopNavigation onMenuToggled={setSidebarOpen} />
      <div className="flex">
        <div className="shrink-0">
          <SideNavigation isSidebarOpen={isSidebarOpen} onSidebarClosed={() => setSidebarOpen(false)} />
        </div>
        <main className="grow overflow-x-clip">{children}</main>
      </div>
    </div>
  );
}

export { Navigation };
