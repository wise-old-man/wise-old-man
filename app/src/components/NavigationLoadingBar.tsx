"use client";

import { Suspense } from "react";
import { AppProgressBar as LoadingProgressBar } from "next-nprogress-bar";

export function NavigationLoadingBar() {
  return (
    <Suspense>
      <LoadingProgressBar
        height="3px"
        color="#E6572A"
        options={{ showSpinner: false }}
        shallowRouting
        delay={150}
      />
    </Suspense>
  );
}
