"use client";

import { AppProgressBar as LoadingProgressBar } from "next-nprogress-bar";
import { ClientOnly } from "./ClientOnly";

export function NavigationLoadingBar() {
  return (
    <ClientOnly>
      <LoadingProgressBar
        height="3px"
        color="#3b82f6"
        options={{ showSpinner: false }}
        shallowRouting
        delay={150}
      />
    </ClientOnly>
  );
}
