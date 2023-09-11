"use client";

import { AppProgressBar as LoadingProgressBar } from "next-nprogress-bar";

export function NavigationLoadingBar() {
  return (
    <LoadingProgressBar
      height="3px"
      color="#bfdbfe"
      options={{ showSpinner: false }}
      shallowRouting
      delay={150}
    />
  );
}
